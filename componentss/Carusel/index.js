function initCarousel(carousel) {
  const viewport = carousel.querySelector(".ui-carousel__viewport");
  const track = carousel.querySelector(".ui-carousel__track");
  const prevButton = carousel.querySelector(".ui-carousel__button--prev");
  const nextButton = carousel.querySelector(".ui-carousel__button--next");

  if (!viewport || !track) return;

  const slides = [...track.children];
  const count = slides.length;

  if (count === 0) return;

  const autoplayDelay = Number(carousel.dataset.autoplay ?? 0);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let currentIndex = count;
  let isAnimating = false;
  let settleTimer = null;
  let autoplayTimer = null;
  let dragStartX = null;
  let dragOffset = 0;
  let suppressClick = false;

  function cloneSlide(slide) {
    const clone = slide.cloneNode(true);

    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("inert", "");

    return clone;
  }

  slides.map(cloneSlide).forEach((clone) => track.appendChild(clone));
  slides
    .map(cloneSlide)
    .reverse()
    .forEach((clone) => track.insertBefore(clone, track.firstChild));

  function getStep() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return slides[0].getBoundingClientRect().width + gap;
  }

  function getDuration() {
    return parseFloat(getComputedStyle(track).transitionDuration) * 1000 || 0;
  }

  function render(animate = true) {
    track.style.transition = animate ? "" : "none";
    track.style.transform = `translateX(${-currentIndex * getStep()}px)`;
  }

  function settle() {
    clearTimeout(settleTimer);
    settleTimer = null;

    if (currentIndex >= count * 2) {
      currentIndex -= count;
      render(false);
    }

    if (currentIndex < count) {
      currentIndex += count;
      render(false);
    }

    isAnimating = false;
  }

  function goTo(index) {
    if (isAnimating) return;

    isAnimating = true;
    currentIndex = index;
    render();

    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, getDuration() + 50);
  }

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;
    settle();
  });

  function startAutoplay() {
    if (autoplayTimer !== null) return;
    if (autoplayDelay <= 0 || reduceMotion.matches || document.hidden) return;
    if (carousel.matches(":hover")) return;
    if (carousel.contains(document.activeElement)) return;

    autoplayTimer = setInterval(() => goTo(currentIndex + 1), autoplayDelay);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  nextButton?.addEventListener("click", () => goTo(currentIndex + 1));
  prevButton?.addEventListener("click", () => goTo(currentIndex - 1));

  carousel.addEventListener("pointerenter", stopAutoplay);
  carousel.addEventListener("pointerleave", startAutoplay);
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (carousel.contains(event.relatedTarget)) return;
    startAutoplay();
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
    if (isAnimating) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragStartX = event.clientX;
    dragOffset = 0;
    suppressClick = false;

    viewport.setPointerCapture(event.pointerId);
    stopAutoplay();
  });

  viewport.addEventListener("pointermove", (event) => {
    if (dragStartX === null) return;

    dragOffset = event.clientX - dragStartX;
    track.style.transition = "none";
    track.style.transform = `translateX(${
      -currentIndex * getStep() + dragOffset
    }px)`;
  });

  function endDrag() {
    if (dragStartX === null) return;

    const offset = dragOffset;
    const threshold = getStep() * 0.2;

    dragStartX = null;
    dragOffset = 0;
    suppressClick = Math.abs(offset) > 5;

    if (offset <= -threshold) goTo(currentIndex + 1);
    else if (offset >= threshold) goTo(currentIndex - 1);
    else render();

    startAutoplay();
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  viewport.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;

      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    },
    true
  );

  new ResizeObserver(() => {
    if (dragStartX === null) render(false);
  }).observe(viewport);

  render(false);
  startAutoplay();
}

function main() {
  document.querySelectorAll("[data-ui-carousel]").forEach(initCarousel);
}

main();
