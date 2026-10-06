# Portfólio UGC — Loren Martins

> Site-portfólio para a criadora de conteúdo **Loren Martins**, de São José dos Campos (SP), 26 anos.
> Nichos principais: lifestyle, tech, autocuidado e experiências.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Astro | 7.3.x |
| CSS | Tailwind CSS v4 | via `@tailwindcss/vite` |
| Fontes | Fraunces (display, serif) + Instrument Sans (body) | Google Fonts |
| Deploy | Netlify | `netlify.toml` na raiz |
| Node mínimo | 22 | definido em `engines` e `netlify.toml` |

## Estrutura de arquivos

```
src/
  pages/
    index.astro          ← página principal (TODOS os dados ficam no frontmatter)
  layouts/
    Layout.astro         ← shell HTML, meta tags, Google Fonts, IntersectionObserver
  components/
    Photo.astro          ← imagem com placeholder (ícone + legenda quando sem src)
    VideoFrame.astro     ← moldura 9:16 com embed do Instagram (ou placeholder)
    OvalPortrait.astro   ← retrato oval da seção "Quem eu sou" (anel rosa, texto curvo, sparkles animados)
    Sparkle.astro        ← estrela decorativa de 4 pontas (fill ou outline)
  styles/
    global.css           ← tokens de cor/fonte, utilitários (.stripes, .hard-shadow, .marquee-track, animações)
public/
  images/                ← fotos do portfólio (referenciadas como "/images/nome.ext")
    loren.webp           ← foto principal (hero)
    loren-sobre.png      ← foto da seção "Quem eu sou" (oval portrait)
  favicon.svg
```

## Como editar conteúdo

**Tudo que muda no site** (textos, fotos, marcas, nichos, cases, links de contato) fica no topo do frontmatter de `src/pages/index.astro`, nas constantes:

| Constante | O que controla |
|---|---|
| `photos` | Caminhos das fotos do hero e "sobre" |
| `contact` | Email, Instagram, TikTok, mídia kit |
| `brands` | Nomes do carrossel de marcas |
| `niches` | Lista de nichos; `top: true` = entra no "Top 3" |
| `videos` | Vídeos por nicho; com `permalink` do Instagram = embed real |
| `carousels` | Carrosséis do feed; `slides` = array de caminhos de imagem |
| `gallery` | Fotos UGC da galeria; `tall` = 2 linhas, `shape` = arco |
| `cases` | Cases de sucesso com KPIs, gráficos de barras e comparativos |

Para adicionar fotos: colocar em `public/images/` e usar o caminho `/images/nome.ext`.

## Seções da página

1. **Header** — fixo, com navegação e botão "Vamos conversar"
2. **Hero** — foto da Loren, tags, headline, CTAs
3. **Marquee de marcas** — carrossel animado duplo (fundo vinho + faixa azul reversa)
4. **Quem eu sou** — seção com fundo listrado, card com bio + retrato oval animado
5. **Top 3 nichos** — 3 cards com moldura arredondada no topo e vídeo placeholder
6. **Demais nichos** — botões de aba, painel com vídeos filtrados por nicho
7. **Carrosséis & fotos** — visualizador com cards empilhados + galeria masonry
8. **Cases de sucesso** — abas por case, cards de KPI, gráfico de barras (views), barras horizontais comparativas (Loren vs. média do nicho), blockquote de depoimento
9. **Contato/footer** — fundo vinho, faixa colorida, botões de contato

## Tokens de design (em `global.css`)

```
offwhite: #FAF6EF   (fundo)
wine:     #6B1F2E   (principal)
wine-deep:#3A0F18   (texto escuro)
wine-soft:#5A2A33   (texto secundário)
rose:     #F4C9D2   (rosa bebê)
sky:      #BFD9EE   (azul bebê)
```

## Animações

- **Scroll reveal** (`[data-reveal]`): elementos entram com fade + slide-up ao rolar. O `IntersectionObserver` no `Layout.astro` adiciona `.is-visible`.
- **Marquee**: carrossel de marcas com CSS `translateX(-50%)`, pausa no hover.
- **Sparkle pulse** (`.sparkle-animate`): brilhinhos pulsam com scale + rotação suave, cada um com duração e delay diferentes. Usa `transform-box: fill-box` nos SVGs pra não deslocar do lugar.
- **Chart bars** (`[data-bar]`): barras dos gráficos crescem quando o card de case entra na viewport.
- Todas respeitam `prefers-reduced-motion`.

## Abas interativas

O sistema de abas é genérico via `data-tab` e `data-panel`:
- Botão: `data-tab="grupo:id"` + `aria-pressed`
- Painel: `data-panel="grupo:id"` + `hidden`
- Grupos usados: `niche:*` (demais nichos), `car:*` (carrosséis), `case:*` (cases)

## Dev server

```bash
npm run dev          # porta 4321 por padrão
npm run build        # build de produção em dist/
```

## Contato da Loren

- Email: contatolorenmartins@gmail.com
- Instagram: [@bylorenmartins](https://www.instagram.com/bylorenmartins)
- TikTok: [@bylorenmartins](https://www.tiktok.com/@bylorenmartins)

## Pendências

- [ ] Preencher nomes reais das marcas no array `brands`
- [ ] Adicionar vídeos reais com `permalink` do Instagram/TikTok
- [ ] Fotos reais na galeria UGC
- [ ] Slides reais nos carrosséis
- [ ] Dados reais nos cases de sucesso (KPIs, views, comparativos, depoimentos)
- [ ] Mídia kit (PDF) da Loren
- [ ] Nichos: confirmar quais além dos 4 principais (experiências, casa, gastronomia, fitness, pets são exemplos)
