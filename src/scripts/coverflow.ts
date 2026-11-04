// carrossel "coverflow": o card central fica em destaque e os vizinhos aparecem menores, inclinados e apagados.
// Setas, bolinhas, arrastar, toque no vizinho e troca automática.
// Os cards precisam estar empilhados na mesma célula de uma grade. `mobileQuery` diz quando o carrossel está ativo
// (fora dele nada é aplicado) e `wideQuery`, quando mostrar 2 vizinhos de cada lado em vez de 1.
interface CoverflowOptions {
  list: HTMLElement;
  dotsBox: HTMLElement;
  prevBtn: HTMLElement;
  nextBtn: HTMLElement;
  mobileQuery: string;
  wideQuery?: string;
  dotLabel: string;
  interval?: number;
}

export function initCoverflow({ list, dotsBox, prevBtn, nextBtn, mobileQuery, wideQuery, dotLabel, interval = 5000 }: CoverflowOptions) {
  const items = Array.from(list.children) as HTMLElement[];
  const n = items.length;
  const half = Math.floor(n / 2);
  const mobile = window.matchMedia(mobileQuery);
  const wide = wideQuery ? window.matchMedia(wideQuery) : undefined;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let active = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  let visible = false;

  const dots = items.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `${dotLabel} ${i + 1}`);
    b.className = "group flex h-6 items-center px-1";
    b.innerHTML = '<span class="block h-2 w-2 rounded-full bg-wine/30 transition-all group-aria-[current=true]:w-6 group-aria-[current=true]:bg-wine"></span>';
    b.addEventListener("click", () => go(i));
    dotsBox.append(b);
    return b;
  });

  const render = () => {
    items.forEach((it, i) => {
      if (!mobile.matches) {
        ["transition", "transform", "opacity", "filter", "zIndex", "pointerEvents"].forEach((p) => it.style.removeProperty(p.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase())));
        it.removeAttribute("inert");
        it.removeAttribute("aria-hidden");
        return;
      }
      const off = ((i - active + n + half) % n) - half;
      const dist = Math.abs(off);
      const reach = wide?.matches ? 2 : 1;
      const shown = dist <= reach;
      const shift = [0, 62, 108, 140][Math.min(dist, 3)];
      const scale = [1, 0.84, 0.7, 0.6][Math.min(dist, 3)];
      const opacity = [1, 0.6, 0.3][dist] ?? 0;
      it.style.transition = "transform .55s cubic-bezier(.22,.8,.24,1), opacity .55s ease, filter .55s ease";
      it.style.transform = off === 0 ? "none" : `translateX(${Math.sign(off) * shift}%) scale(${scale}) rotate(${Math.sign(off) * (dist === 1 ? 5 : 8)}deg)`;
      it.style.opacity = shown ? String(opacity) : "0";
      it.style.filter = off === 0 ? "none" : "brightness(.82)";
      it.style.zIndex = String(3 - dist < 0 ? 0 : 3 - dist);
      it.style.pointerEvents = shown ? "auto" : "none";
      if (off === 0) {
        it.removeAttribute("inert");
        it.removeAttribute("aria-hidden");
      } else {
        it.setAttribute("inert", "");
        it.setAttribute("aria-hidden", "true");
      }
    });
    dots.forEach((d, i) => d.setAttribute("aria-current", String(i === active)));
  };

  const stop = () => {
    clearInterval(timer);
    timer = undefined;
  };
  const start = () => {
    stop();
    if (mobile.matches && visible && !reduce.matches) timer = setInterval(() => go(active + 1, false), interval);
  };
  function go(i: number, restart = true) {
    active = (i + n) % n;
    render();
    if (restart) start();
  }

  prevBtn.addEventListener("click", () => go(active - 1));
  nextBtn.addEventListener("click", () => go(active + 1));
  items.forEach((it, i) =>
    it.addEventListener("click", () => {
      if (mobile.matches && i !== active) go(i);
    }),
  );

  let startX = 0;
  list.addEventListener(
    "touchstart",
    (e) => {
      startX = e.touches[0].clientX;
      stop();
    },
    { passive: true },
  );
  list.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
      else start();
    },
    { passive: true },
  );

  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      start();
    },
    { threshold: 0.3 },
  ).observe(list);
  mobile.addEventListener("change", () => {
    render();
    start();
  });
  wide?.addEventListener("change", render);
  render();
}
