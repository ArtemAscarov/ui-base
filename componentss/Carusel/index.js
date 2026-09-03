function infinitCarusel(container) {
  const track = container.querySelector(".track");
  const buttonNext = container.querySelector(".nextSlide");
  const buttonPrew = container.querySelector(".prewSlide");
  const viewport = container.querySelector(".slides");
  const gap = 10;

  const realSlides = [...track.children];
  const count = realSlides.length;
  const step = realSlides[0].getBoundingClientRect().width + gap;
  const visibleCount = Math.ceil(viewport.getBoundingClientRect().width / step);

  realSlides
    .slice(0, visibleCount)
    .map((i) => i.cloneNode(true))
    .forEach((i) => track.appendChild(i));

  realSlides
    .slice(-visibleCount)
    .map((i) => i.cloneNode(true))
    .reverse()
    .forEach((i) => track.insertBefore(i, track.firstChild));

  let currentIndex = visibleCount;
  let isAnimating = false;

  function getSlideStep() {
    const rect = realSlides[0].getBoundingClientRect().width + gap;
    return rect;
  }

  function render(animate = true) {
    const step = getSlideStep();
    track.style.transition = animate ? "transform 0.4s linear" : "none";
    track.style.transform = `translateX(${-currentIndex * step}px)`;
  }

  function goTo(index) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = index;

    render();
  }

  setInterval(() => {
    goTo(currentIndex + 1);
  }, 8000);

  buttonNext.addEventListener("click", () => goTo(currentIndex + 1));
  buttonPrew.addEventListener("click", () => goTo(currentIndex - 1));

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
  const containers = document.querySelectorAll(".relative");

  containers.forEach((elem) => infinitCarusel(elem));
}

main();
