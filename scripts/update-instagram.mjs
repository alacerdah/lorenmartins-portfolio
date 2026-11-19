// Atualiza src/data/instagram.json com os números do Instagram pela API oficial da Meta (Instagram Graph API).
// Roda no GitHub Actions (.github/workflows/instagram.yml) toda semana, ou à mão: node scripts/update-instagram.mjs
//
// Precisa de duas variáveis de ambiente (no GitHub ficam em Settings > Secrets and variables > Actions):
//   IG_USER_ID       id da conta do Instagram (instagram_business_account da Página do Facebook)
//   IG_ACCESS_TOKEN  token de acesso da Página (não expira quando gerado a partir de um token de usuário de longa duração)
//
// Regras: nunca inventa número. Se uma métrica não vier da API, mantém o valor que já estava no arquivo.
// Se o token não funcionar, o script falha (o GitHub manda e-mail) e o site continua com os números antigos.

import { readFile, writeFile } from "node:fs/promises";

const FILE = process.env.IG_DATA_FILE ?? new URL("../src/data/instagram.json", import.meta.url);
const API = "https://graph.facebook.com/v23.0";
const { IG_USER_ID, IG_ACCESS_TOKEN } = process.env;

if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
  console.error("Faltam IG_USER_ID e/ou IG_ACCESS_TOKEN.");
  process.exit(1);
}

async function get(path, params = {}) {
  const url = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries({ ...params, access_token: IG_ACCESS_TOKEN })) url.searchParams.set(k, String(v));
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const err = new Error(`${path}: ${body.error?.message ?? res.status}`);
    err.code = body.error?.code;
    throw err;
  }
  return body;
}

// tenta uma métrica; se a API não tiver, avisa no log e devolve undefined (o valor antigo fica)
async function attempt(label, fn) {
  try {
    return await fn();
  } catch (e) {
    // token inválido ou expirado: não adianta continuar
    if (e.code === 190) throw e;
    console.warn(`! ${label}: ${e.message}`);
    return undefined;
  }
}

const round1 = (n) => Math.round(n * 10) / 10;
const round2 = (n) => Math.round(n * 100) / 100;

const now = Math.floor(Date.now() / 1000);
const since = now - 30 * 86400;

// total dos últimos 30 dias de uma métrica da conta, opcionalmente quebrada (breakdown)
async function total(metric, breakdown) {
  const body = await get(`${IG_USER_ID}/insights`, {
    metric, period: "day", metric_type: "total_value", since, until: now, ...(breakdown ? { breakdown } : {}),
  });
  const tv = body.data?.[0]?.total_value;
  if (!tv) throw new Error(`${metric}: sem dados`);
  return tv;
}

// público (seguidores) por idade, gênero, cidade ou país: devolve { chave: contagem }
async function demographics(breakdown) {
  const body = await get(`${IG_USER_ID}/insights`, {
    metric: "follower_demographics", period: "lifetime", metric_type: "total_value", breakdown,
  });
  const results = body.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];
  if (!results.length) throw new Error(`follower_demographics/${breakdown}: sem dados`);
  return Object.fromEntries(results.map((r) => [r.dimension_values[0], r.value]));
}

// taxa de engajamento dos Reels dos últimos 30 dias: (curtidas + comentários + compartilhamentos + salvamentos) ÷ views
async function reelsEngagement() {
  let interactions = 0, views = 0, count = 0;
  let page = await get(`${IG_USER_ID}/media`, { fields: "id,media_product_type,timestamp", limit: 50 });
  for (;;) {
    for (const m of page.data ?? []) {
      if (Date.parse(m.timestamp) / 1000 < since) { page = null; break; }
      if (m.media_product_type !== "REELS") continue;
      const ins = await get(`${m.id}/insights`, { metric: "views,likes,comments,shares,saved" });
      const v = Object.fromEntries((ins.data ?? []).map((d) => [d.name, d.values?.[0]?.value ?? 0]));
      views += v.views ?? 0;
      interactions += (v.likes ?? 0) + (v.comments ?? 0) + (v.shares ?? 0) + (v.saved ?? 0);
      count++;
    }
    const next = page?.paging?.next;
    if (!next) break;
    const res = await fetch(next);
    page = await res.json();
  }
  if (!count || !views) throw new Error("nenhum Reel com views nos últimos 30 dias");
  return round2((interactions / views) * 100);
}

const data = JSON.parse(await readFile(FILE, "utf8"));
const before = JSON.stringify(data);

// a primeira chamada valida o token: se falhar aqui, o script para e o arquivo não muda
const profile = await get(IG_USER_ID, { fields: "followers_count" });
const followers = profile.followers_count;
if (typeof followers === "number") data.followers = followers;

const m = data.last30Days;
const views = await attempt("views", () => total("views"));
if (views?.value != null) m.views = views.value;
const viewsByType = await attempt("views por tipo de seguidor", () => total("views", "follow_type"));
const vt = viewsByType?.breakdowns?.[0]?.results;
if (vt?.length) {
  const by = Object.fromEntries(vt.map((r) => [r.dimension_values[0], r.value]));
  const all = Object.values(by).reduce((a, b) => a + b, 0);
  const non = by.NON_FOLLOWER ?? by.non_follower;
  if (all && non != null) m.viewsNonFollowersPct = round1((non / all) * 100);
}
const reach = await attempt("contas alcançadas", () => total("reach"));
if (reach?.value != null) m.reach = reach.value;
const inter = await attempt("interações", () => total("total_interactions"));
if (inter?.value != null) m.interactions = inter.value;
const eng = await attempt("engajamento dos Reels", reelsEngagement);
if (eng != null) m.reelsEngagementPct = eng;

const a = data.audience;
const gender = await attempt("gênero", () => demographics("gender"));
if (gender && (gender.F ?? 0) + (gender.M ?? 0) > 0) {
  const known = (gender.F ?? 0) + (gender.M ?? 0); // sem "não informado", como no app
  a.womenPct = round1(((gender.F ?? 0) / known) * 100);
  a.menPct = round1(100 - a.womenPct);
}
const age = await attempt("faixa etária", () => demographics("age"));
if (age) {
  const all = Object.values(age).reduce((x, y) => x + y, 0);
  a.ages = Object.fromEntries(["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"].map((k) => [k, round1(((age[k] ?? 0) / all) * 100)]));
}
// cidades e países em % do total de seguidores, como no app
const base = data.followers;
const city = await attempt("cidades", () => demographics("city"));
if (city && base) {
  a.cities = Object.entries(city).sort((x, y) => y[1] - x[1]).slice(0, 5)
    .map(([name, n]) => ({ name: name.split(",")[0].trim(), pct: round1((n / base) * 100) }));
}
const country = await attempt("países", () => demographics("country"));
if (country && base) {
  a.countries = Object.entries(country).sort((x, y) => y[1] - x[1]).slice(0, 3)
    .map(([code, n]) => ({ code, pct: round1((n / base) * 100) }));
}

data.source = "api";
// só troca a data se algum número mudou: assim o site não mostra "dados de hoje" com número velho
const changed = JSON.stringify({ ...data, collectedAt: undefined, source: undefined }) !== JSON.stringify({ ...JSON.parse(before), collectedAt: undefined, source: undefined });
if (changed) data.collectedAt = new Date().toISOString().slice(0, 10);

await writeFile(FILE, JSON.stringify(data, null, 2) + "\n");
console.log(changed ? `Atualizado: ${data.collectedAt}` : "Nada mudou.");
