export function initCarousel(carousel: HTMLElement): void {
  const viewport = carousel.querySelector<HTMLElement>(
    "[data-carousel-viewport]"
  );
  const track = carousel.querySelector<HTMLElement>("[data-carousel-track]");
  const prevButton = carousel.querySelector<HTMLElement>(
    "[data-carousel-prev]"
  );
  const nextButton = carousel.querySelector<HTMLElement>(
    "[data-carousel-next]"
  );
  const dotsBox = carousel.querySelector<HTMLElement>("[data-carousel-dots]");
  const status = carousel.querySelector<HTMLElement>("[data-carousel-status]");

  if (!viewport || !track || track.children.length === 0) return;

  const slides = [...track.children] as HTMLElement[];
  const count = slides.length;
  const autoplayDelay = Number(carousel.dataset.autoplay ?? 0);
  const labels = {
    slide: carousel.dataset.slideLabel ?? "{i} of {n}",
    dot: carousel.dataset.dotLabel ?? "Slide {i} of {n}",
    status: carousel.dataset.statusLabel ?? "Slide {i} of {n}",
  };

  function fill(template: string, at: number): string {
    return template
      .replaceAll("{i}", String(at + 1))
      .replaceAll("{n}", String(count));
  }

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  let index = count;
  let animating = false;
  let queued = 0;
  let settleTimer: ReturnType<typeof setTimeout>;
  let autoplayTimer: ReturnType<typeof setInterval> | null = null;
  let startX: number | null = null;
  let startY = 0;
  let dragging = false;
  let offset = 0;
  let afterDrag = false;

  slides.forEach((slide, at) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");

    if (!slide.hasAttribute("aria-label")) {
      slide.setAttribute("aria-label", fill(labels.slide, at));
    }
  });

  function clone(slide: HTMLElement): HTMLElement {
    const copy = slide.cloneNode(true) as HTMLElement;

    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    copy.setAttribute("aria-hidden", "true");

    return copy;
  }

  slides.map(clone).forEach((copy) => track!.appendChild(copy));
  slides
    .map(clone)
    .reverse()
    .forEach((copy) => track!.insertBefore(copy, track!.firstChild));

  function slideNumber(): number {
    return ((index % count) + count) % count;
  }

  function slideWidth(): number {
    const gap = parseFloat(getComputedStyle(track!).columnGap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }

  function render(animate = true): void {
    carousel.toggleAttribute("data-instant", !animate);
    track!.style.transform = `translateX(${-index * slideWidth() + offset}px)`;
  }

  const dots = dotsBox
    ? slides.map((_, at) => {
        const dot = document.createElement("button");

        dot.className = dotsBox.dataset.dotClass ?? "ui-carousel__dot";
        dot.type = "button";
        dot.setAttribute("aria-label", fill(labels.dot, at));
        dot.addEventListener("click", () => goToSlide(at));
        dotsBox.appendChild(dot);

        return dot;
      })
    : [];

  function sync(): void {
    const active = slideNumber();

    dots.forEach((dot, at) =>
      dot.setAttribute("aria-current", String(at === active))
    );

    if (status && autoplayTimer === null) {
      status.textContent = fill(labels.status, active);
    }
  }

  function settle(): void {
    if (!animating) return;

    clearTimeout(settleTimer);

    const before = index;
    while (index >= count * 2) index -= count;
    while (index < count) index += count;

    if (index !== before) {
      render(false);
      void track!.offsetWidth;
    }

    animating = false;

    if (queued !== 0) {
      const steps = queued;
      queued = 0;
      go(steps);
    }
  }

  function go(steps: number): void {
    if (steps === 0) return;

    if (animating) {
      queued = Math.max(-count, Math.min(count, queued + steps));
      return;
    }

    animating = true;
    index += steps;
    render();
    sync();

    const duration =
      parseFloat(getComputedStyle(track!).transitionDuration) * 1000 || 0;

    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, duration + 50);
  }

  function goToSlide(to: number): void {
    let steps = to - slideNumber();

    if (steps > count / 2) steps -= count;
    if (steps < -count / 2) steps += count;

    go(steps);
  }

  function startAutoplay(): void {
    if (autoplayTimer !== null || autoplayDelay <= 0) return;
    if (reduceMotion.matches || document.hidden) return;
    if (carousel.matches(":hover")) return;
    if (carousel.contains(document.activeElement)) return;

    autoplayTimer = setInterval(() => go(1), autoplayDelay);
  }

  function stopAutoplay(): void {
    if (autoplayTimer !== null) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function endDrag(): void {
    if (startX === null) return;

    const moved = offset;
    const threshold = slideWidth() * 0.2;

    startX = null;
    dragging = false;
    offset = 0;
    afterDrag = Math.abs(moved) > 8;
    carousel.removeAttribute("data-dragging");

    if (moved <= -threshold) go(1);
    else if (moved >= threshold) go(-1);
    else render();

    startAutoplay();
  }

  track.addEventListener("transitionend", (event) => {
    if (event.target === track && event.propertyName === "transform") settle();
  });

  nextButton?.addEventListener("click", () => go(1));
  prevButton?.addEventListener("click", () => go(-1));

  carousel.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (
      (event.target as HTMLElement).closest(
        "input, textarea, select, [contenteditable]"
      )
    ) {
      return;
    }

    event.preventDefault();
    go(event.key === "ArrowRight" ? 1 : -1);
  });

  carousel.addEventListener("pointerenter", stopAutoplay);
  carousel.addEventListener("pointerleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget as Node)) startAutoplay();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) stopAutoplay();
    else startAutoplay();
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (animating) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    startX = event.clientX;
    startY = event.clientY;
    dragging = false;
    offset = 0;
    afterDrag = false;

    viewport!.setPointerCapture(event.pointerId);
    stopAutoplay();
  });

  viewport.addEventListener("pointermove", (event) => {
    if (startX === null) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;

    if (!dragging) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        startX = null;
        offset = 0;
        carousel.removeAttribute("data-dragging");
        render();
        startAutoplay();
        return;
      }

      dragging = true;
      carousel.setAttribute("data-dragging", "");
    }

    offset = deltaX;
    render(false);
  });

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  viewport.addEventListener(
    "click",
    (event) => {
      if (!afterDrag) return;

      event.preventDefault();
      event.stopPropagation();
      afterDrag = false;
    },
    true
  );

  new ResizeObserver(() => {
    if (startX === null) render(false);
  }).observe(viewport);

  render(false);
  sync();
  startAutoplay();
}

document
  .querySelectorAll<HTMLElement>("[data-carousel]")
  .forEach((carousel) => initCarousel(carousel));
