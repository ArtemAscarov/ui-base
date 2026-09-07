export function initCarousel(carousel) {
  const viewport = carousel.querySelector("[data-carousel-viewport]");
  const track = carousel.querySelector("[data-carousel-track]");
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsBox = carousel.querySelector("[data-carousel-dots]");
  const status = carousel.querySelector("[data-carousel-status]");

  if (!viewport || !track || track.children.length === 0) return;

  const slides = [...track.children];
  const count = slides.length;
  const autoplayDelay = Number(carousel.dataset.autoplay ?? 0);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  let index = count;
  let animating = false;
  let queued = 0;
  let settleTimer;
  let autoplayTimer = null;
  let startX = null;
  let startY = 0;
  let dragging = false;
  let offset = 0;
  let afterDrag = false;

  slides.forEach((slide, at) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");

    if (!slide.hasAttribute("aria-label")) {
      slide.setAttribute("aria-label", `${at + 1} of ${count}`);
    }
  });

  function clone(slide) {
    const copy = slide.cloneNode(true);

    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    copy.setAttribute("aria-hidden", "true");

    return copy;
  }

  slides.map(clone).forEach((copy) => track.appendChild(copy));
  slides
    .map(clone)
    .reverse()
    .forEach((copy) => track.insertBefore(copy, track.firstChild));

  function slideNumber() {
    return ((index % count) + count) % count;
  }

  function slideWidth() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }

  function render(animate = true) {
    carousel.toggleAttribute("data-instant", !animate);
    track.style.transform = `translateX(${-index * slideWidth() + offset}px)`;
  }

  const dots = dotsBox
    ? slides.map((_, at) => {
        const dot = document.createElement("button");

        dot.className = dotsBox.dataset.dotClass ?? "ui-carousel__dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Slide ${at + 1} of ${count}`);
        dot.addEventListener("click", () => goToSlide(at));
        dotsBox.appendChild(dot);

        return dot;
      })
    : [];

  function sync() {
    const active = slideNumber();

    dots.forEach((dot, at) =>
      dot.setAttribute("aria-current", String(at === active))
    );

    if (status && autoplayTimer === null) {
      status.textContent = `Slide ${active + 1} of ${count}`;
    }
  }

  function settle() {
    if (!animating) return;

    clearTimeout(settleTimer);

    const before = index;
    while (index >= count * 2) index -= count;
    while (index < count) index += count;

    if (index !== before) {
      render(false);
      void track.offsetWidth;
    }

    animating = false;

    if (queued !== 0) {
      const steps = queued;
      queued = 0;
      go(steps);
    }
  }

  function go(steps) {
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
      parseFloat(getComputedStyle(track).transitionDuration) * 1000 || 0;

    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, duration + 50);
  }

  function goToSlide(to) {
    let steps = to - slideNumber();

    if (steps > count / 2) steps -= count;
    if (steps < -count / 2) steps += count;

    go(steps);
  }

  function startAutoplay() {
    if (autoplayTimer !== null || autoplayDelay <= 0) return;
    if (reduceMotion.matches || document.hidden) return;
    if (carousel.matches(":hover")) return;
    if (carousel.contains(document.activeElement)) return;

    autoplayTimer = setInterval(() => go(1), autoplayDelay);
  }

  function stopAutoplay() {
    if (autoplayTimer !== null) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function endDrag() {
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
    if (event.target.closest("input, textarea, select, [contenteditable]")) {
      return;
    }

    event.preventDefault();
    go(event.key === "ArrowRight" ? 1 : -1);
  });

  carousel.addEventListener("pointerenter", stopAutoplay);
  carousel.addEventListener("pointerleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoplay();
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

    viewport.setPointerCapture(event.pointerId);
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
  .querySelectorAll("[data-carousel]")
  .forEach((carousel) => initCarousel(carousel));
