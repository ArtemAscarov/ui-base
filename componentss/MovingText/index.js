function initMarquee(marquee) {
  const viewport = marquee.querySelector(".ui-marquee__viewport");
  const ribbon = marquee.querySelector(".ui-marquee__ribbon");
  const group = viewport && viewport.querySelector(".ui-marquee__group");

  if (!viewport || !group || group.children.length === 0) return;

  const template = [...group.children].map((item) => item.cloneNode(true));

  function build() {
    group.replaceChildren(...template.map((item) => item.cloneNode(true)));
    [...viewport.children].forEach((node) => {
      if (node !== group) node.remove();
    });

    const needed = (ribbon ?? marquee).clientWidth;
    let guard = 0;

    while (group.getBoundingClientRect().width < needed && guard < 50) {
      template.forEach((item) => group.appendChild(item.cloneNode(true)));
      guard += 1;
    }

    const copy = group.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.setAttribute("inert", "");
    viewport.appendChild(copy);
  }

  build();

  new ResizeObserver(build).observe(ribbon ?? marquee);
}

function main() {
  document.querySelectorAll("[data-ui-marquee]").forEach(initMarquee);
}

main();
