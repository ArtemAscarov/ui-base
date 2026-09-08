export function initMarquee(marquee) {
  const viewport = marquee.querySelector("[data-marquee-viewport]");
  const ribbon = marquee.querySelector("[data-marquee-ribbon]");
  const group = viewport?.querySelector("[data-marquee-group]");

  if (!viewport || !group || group.children.length === 0) return;

  const items = [...group.children].map((item) => item.cloneNode(true));
  const host = ribbon ?? marquee;

  let passWidth = 0;
  let copies = 0;

  function fill(count) {
    const filled = [];

    for (let pass = 0; pass < count; pass += 1) {
      items.forEach((item) => filled.push(item.cloneNode(true)));
    }

    group.replaceChildren(...filled);
    [...viewport.children].forEach((node) => {
      if (node !== group) node.remove();
    });
  }

  function measure() {
    fill(1);
    passWidth = group.getBoundingClientRect().width;
    copies = 0;
  }

  function build() {
    if (passWidth <= 0) measure();
    if (passWidth <= 0) return;

    const needed = Math.max(1, Math.ceil(host.clientWidth / passWidth));

    if (needed === copies) return;

    copies = needed;
    fill(copies);

    const clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    viewport.appendChild(clone);

    const speed = parseFloat(
      getComputedStyle(marquee).getPropertyValue("--marquee-speed")
    );

    if (speed > 0) {
      marquee.style.setProperty(
        "--marquee-duration",
        `${(copies * passWidth) / speed}s`
      );
    }
  }

  measure();
  build();

  document.fonts?.ready.then(() => {
    measure();
    build();
  });

  new ResizeObserver(build).observe(host);
}

document
  .querySelectorAll("[data-marquee]")
  .forEach((marquee) => initMarquee(marquee));
