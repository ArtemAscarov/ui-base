function initMarquee(marquee) {
  const viewport = marquee.querySelector(".ui-marquee__viewport");
  const ribbon = marquee.querySelector(".ui-marquee__ribbon");
  const group = viewport && viewport.querySelector(".ui-marquee__group");

  if (!viewport || !group || group.children.length === 0) return;

  // Эталон содержимого. Всё, что мы дальше нарисуем, — копии отсюда,
  // поэтому пересборка на resize никогда не накапливает мусор.
  const template = [...group.children].map((item) => item.cloneNode(true));

  function build() {
    // 1. Возвращаем группу в исходное состояние и убираем прошлую копию.
    group.replaceChildren(...template.map((item) => item.cloneNode(true)));
    [...viewport.children].forEach((node) => {
      if (node !== group) node.remove();
    });

    // 2. Добиваем группу копиями, пока она не перекроет видимую ширину.
    //    Иначе на широком экране между «хвостом» и «головой» будет дыра.
    const needed = (ribbon ?? marquee).clientWidth;
    let guard = 0;

    while (group.getBoundingClientRect().width < needed && guard < 50) {
      template.forEach((item) => group.appendChild(item.cloneNode(true)));
      guard += 1;
    }

    // 3. Дублируем группу целиком: именно на этом держится -50% в CSS.
    //    Копия — чистая декорация: скринридер её не читает,
    //    inert убирает из неё ссылки и кнопки из обхода по Tab.
    const copy = group.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.setAttribute("inert", "");
    viewport.appendChild(copy);
  }

  build();

  // Ширина ленты зависит от окна, значит и число копий тоже.
  new ResizeObserver(build).observe(ribbon ?? marquee);
}

function main() {
  document.querySelectorAll("[data-ui-marquee]").forEach(initMarquee);
}

main();
