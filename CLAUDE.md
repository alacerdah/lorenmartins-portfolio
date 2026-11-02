# Portfólio UGC — Loren Martins

> Site-portfólio para a criadora de conteúdo **Loren Martins**, de São José dos Campos (SP), 26 anos.
> Nichos, em ordem de preferência: moda, experiências, tech, acessórios, beleza, bem-estar & fit, bebidas & drinks e pet.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Astro | 7.3.x |
| CSS | Tailwind CSS v4 | via `@tailwindcss/vite` |
| Fontes | Fraunces (display, serif) + Instrument Sans (body) + Inter (balões da capa) | Google Fonts |
| Deploy | Netlify | `netlify.toml` na raiz |
| Node mínimo | 22 | definido em `engines` e `netlify.toml` |

## Estrutura de arquivos

```
src/
  pages/
    index.astro          ← versão em português (`<Home lang="pt" />`)
    en/index.astro       ← versão em inglês (`<Home lang="en" />`)
  layouts/
    Layout.astro         ← shell HTML, meta tags, Google Fonts, IntersectionObserver
  components/
    Home.astro           ← a página inteira (TODOS os dados ficam no frontmatter)
    Photo.astro          ← imagem com placeholder (ícone + legenda quando sem src)
    VideoFrame.astro     ← moldura 9:16 com embed do Instagram (ou placeholder)
    OvalPortrait.astro   ← retrato oval da seção "Quem eu sou" (anel rosa, texto curvo, sparkles animados)
    Sparkle.astro        ← estrela decorativa de 4 pontas (fill ou outline)
  styles/
    global.css           ← tokens de cor/fonte, utilitários (.stripes, .hard-shadow, .marquee-track, animações)
public/
  images/                ← fotos do portfólio (referenciadas como "/images/nome.ext")
    loren.webp           ← foto principal (hero)
    loren2.png           ← foto da seção "Quem eu sou" (oval portrait)
  favicon.svg
```

## Como editar conteúdo

**Tudo que muda no site** (textos, fotos, marcas, nichos, cases, links de contato) fica no topo do frontmatter de `src/components/Home.astro`, nas constantes. Textos com tradução usam `t("português", "english")`; `/` e `/en/` renderizam esse mesmo componente:

| Constante | O que controla |
|---|---|
| `photos` | Caminhos das fotos do hero e "sobre" |
| `heroFeedbacks` | Balões de depoimento sobre a foto da capa: `brand`, `logo`, `text` e posição (`place`) |
| `contact` | Email, Instagram, TikTok, WhatsApp, mídia kit |
| `brandRows` | Logos do carrossel de marcas (2 faixas). Cada logo é `logo("Nome", "arquivo.png")` e o arquivo fica em `public/images/logos/` |
| `niches` | Lista de nichos em ordem de preferência: viram as abas e os botões do "Sobre". `black-friday` é temporário: faixa, aba e botão só aparecem de 1º/out a 30/nov |
| `videos` / `realVideos` | Vídeos por nicho (quantos quiser; nicho sem nenhum ganha 3 espaços reservados). Em `realVideos` preencha por nicho: `brand`, `src` = arquivo .mp4 (em `public/videos/`) ou `permalink` do Instagram, `badge` opcional (adesivo tipo "+80 mil views") |
| `englishVideos` | Vídeos em inglês, só na página `/en/`, logo depois do topo |
| `viralVideos` | Seção "Cases virais": o primeiro em destaque e dois embaixo, com `logo`, `insights` (print em `public/images/insights/`), `tags` e os textos `impact`, `execution` e `goal` |
| `carousels` | Carrosséis do feed; `slides` = array de caminhos de imagem, `badge` = adesivo na foto, `url` = post original |
| `gallery` | Fotos UGC: faixas em movimento. Imagem otimizada em `public/images/galeria-web/` (640 px de largura), `brandName` e `logo` |
| `salesCases` | Cases de venda: marca, vídeo, explicação e números (`kpis`) |
| `feedbacks` | Parede de feedbacks: cada marca vira um card com as mensagens dela. `logo` = `/images/logos/...` |

Para adicionar fotos: colocar em `public/images/` e usar o caminho `/images/nome.ext`.

## Seções da página

1. **Header** — fixo, com navegação e botão "Vamos conversar"
2. **Hero** — foto da Loren, tags, headline, CTAs
3. **Marquee de marcas** — carrossel animado duplo (fundo vinho + faixa azul reversa)
4. **Quem eu sou** — seção com fundo listrado, card com bio + retrato oval animado
5. **Trabalhos por nicho** — botões de aba e faixa de vídeos que rola para o lado. Os vídeos com mais views (`views`) sempre vêm primeiro
6. **Carrosséis & fotos** — visualizador com cards empilhados + galeria masonry
7. **Cases de venda** — "Vídeos que venderam", logo depois de "Cases virais": vídeo, explicação e números
8. **Contato/footer** — fundo vinho, faixa colorida, botões de contato

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
- Todas respeitam `prefers-reduced-motion`.

## Abas interativas

O sistema de abas é genérico via `data-tab` e `data-panel`:
- Botão: `data-tab="grupo:id"` + `aria-pressed`
- Painel: `data-panel="grupo:id"` + `hidden`
- Grupos usados: `niche:*` (demais nichos), `car:*` (carrosséis)

## Formulários

Contato e pop-up da tabela usam Netlify Forms (`contato` e `tabela`). Só funcionam no site publicado: as respostas ficam no painel do Netlify, em Forms, com aviso por e-mail configurado lá.

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

- [ ] Adicionar vídeos reais com `permalink` do Instagram/TikTok
- [ ] Fotos reais na galeria UGC (a seção de carrosséis e fotos só aparece com imagens reais)
- [ ] Slides reais nos carrosséis
- [ ] Mídia kit (PDF) da Loren
