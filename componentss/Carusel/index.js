function initCarousel(carousel) {
  const viewport = carousel.querySelector(".ui-carousel__viewport");
  const track = carousel.querySelector(".ui-carousel__track");
  const prevButton = carousel.querySelector(".ui-carousel__button--prev");
  const nextButton = carousel.querySelector(".ui-carousel__button--next");

  const slides = [...track.children];
  const count = slides.length;

  function getGap() {
    return parseFloat(getComputedStyle(track).columnGap) || 0;
  }

  function getStep() {
    return slides[0].getBoundingClientRect().width + getGap();
  }

  const visibleCount = Math.ceil(
    viewport.getBoundingClientRect().width / getStep()
  );

  slides
    .slice(0, visibleCount)
    .map((slide) => slide.cloneNode(true))
    .forEach((clone) => track.appendChild(clone));

  slides
    .slice(-visibleCount)
    .map((slide) => slide.cloneNode(true))
    .reverse()
    .forEach((clone) => track.insertBefore(clone, track.firstChild));

  let currentIndex = visibleCount;
  let isAnimating = false;

  function render(animate = true) {
    track.style.transition = animate ? "" : "none";
    track.style.transform = `translateX(${-currentIndex * getStep()}px)`;
  }

  function goTo(index) {
    if (isAnimating) return;

    isAnimating = true;
    currentIndex = index;
    render();
  }

  setInterval(() => goTo(currentIndex + 1), 8000);

  nextButton.addEventListener("click", () => goTo(currentIndex + 1));
  prevButton.addEventListener("click", () => goTo(currentIndex - 1));

  track.addEventListener("transitionend", () => {
    if (currentIndex >= count + visibleCount) {
      currentIndex = currentIndex - count;
      render(false);
    }

    if (currentIndex < visibleCount) {
      currentIndex = count + currentIndex;
      render(false);
    }

    isAnimating = false;
  });

  render(false);
}

function main() {
  document.querySelectorAll("[data-ui-carousel]").forEach(initCarousel);
}

main();
