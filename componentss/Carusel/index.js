function initCarousel(carousel) {
  const viewport = carousel.querySelector(".ui-carousel__viewport");
  const track = carousel.querySelector(".ui-carousel__track");
  const prevButton = carousel.querySelector(".ui-carousel__button--prev");
  const nextButton = carousel.querySelector(".ui-carousel__button--next");
  const dotsBox = carousel.querySelector(".ui-carousel__dots");
  const status = carousel.querySelector(".ui-carousel__status");

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
  let startY = null;
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
    copy.setAttribute("inert", "");

    return copy;
  }

  slides.map(clone).forEach((copy) => track.appendChild(copy));
  slides
    .map(clone)
    .reverse()
    .forEach((copy) => track.insertBefore(copy, track.firstChild));

  const dots = dotsBox
    ? slides.map((slide, at) => {
        const dot = document.createElement("button");

        dot.className = "ui-carousel__dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Slide ${at + 1} of ${count}`);
        dot.addEventListener("click", () => goToSlide(at));
        dotsBox.appendChild(dot);

        return dot;
      })
    : [];

  function slideNumber() {
    return ((index % count) + count) % count;
  }

  function slideWidth() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }

  function render(animate = true) {
    track.style.transition = animate ? "" : "none";
    track.style.transform = `translateX(${-index * slideWidth()}px)`;
  }

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
    if (index !== before) render(false);

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
    if (carousel.matches(":hover") || carousel.contains(document.activeElement)) {
      return;
    }

    autoplayTimer = setInterval(() => go(1), autoplayDelay);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  function endDrag() {
    if (startX === null) return;

    const moved = offset;

    startX = null;
    dragging = false;
    offset = 0;
    afterDrag = Math.abs(moved) > 8;

    if (moved <= -slideWidth() * 0.2) go(1);
    else if (moved >= slideWidth() * 0.2) go(-1);
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
        render();
        startAutoplay();
        return;
      }

      dragging = true;
    }

    offset = deltaX;
    track.style.transition = "none";
    track.style.transform = `translateX(${-index * slideWidth() + offset}px)`;
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

document.querySelectorAll("[data-ui-carousel]").forEach(initCarousel);
