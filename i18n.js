(function () {
  "use strict";

  var STORAGE_KEY = "ui-base-lang";

  var ru = {
    "langs.aria": "Язык",

    "masthead.eyebrow": "Исходники компонентов для копирования",
    "masthead.lede":
      "Шесть компонентов, написанных вручную и собранных под тот стек, которым вы правда пользуетесь. Ничего не нужно устанавливать и внедрять — забираете три файла, и дальше они ваши.",
    "tally.components": "Компонентов",
    "tally.variants": "Вариантов",
    "tally.files": "Файлов",

    "banner.keyboard": "Сначала клавиатура",
    "banner.deps": "Без зависимостей",
    "banner.themed": "Темизация через CSS-переменные",
    "banner.motion": "Уважает reduced-motion",

    "matrix.eyebrow": "Каждый компонент — три стека",
    "matrix.vanilla":
      "Разметка, которую вы вставляете, файл стилей и скрипт, который сам цепляется к <code>data-</code>-атрибутам.",
    "matrix.react":
      "Один компонент, props вместо атрибутов, управляемый или неуправляемый.",
    "matrix.next":
      "Тот же React-файл с <code>\"use client\"</code> сверху — единственное, что на самом деле нужно App Router.",
    "matrix.note":
      "В каждом стеке по четыре варианта — Js, Ts и Tailwind-двойник каждого: без файла стилей, но с теми же переменными.",

    "spec.markup": "Разметка",
    "spec.props": "Props в React",
    "spec.tokens": "Токены",
    "spec.files": "Файлы",

    "checkbox.eyebrow": "01 — форма",
    "checkbox.lede":
      "Настоящий <code>input</code> остаётся в форме и сохраняет клавиатуру; стилизуется соседний квадрат. Смешанное состояние задаётся разметкой, а браузер снимает его при первом клике.",
    "checkbox.mixed": "Начать в смешанном состоянии",
    "checkbox.native": "Нативные атрибуты, ничего своего",
    "checkbox.terms": "Принять условия",
    "checkbox.subscribe": "Подписаться",
    "checkbox.all": "Выбрать все",
    "checkbox.locked": "Недоступно",

    "radio.eyebrow": "02 — форма",
    "radio.lede":
      "Та же анатомия, что у чекбокса, только с точкой вместо галочки. Скрипта нет вовсе — группировку, стрелки и перенос фокуса браузер делает сам по общему <code>name</code>.",
    "radio.noscript": "Единственный компонент без скрипта во всех стеках.",
    "radio.required": "Обязательны, связывают инпуты в группу",
    "radio.free": "Бесплатный",
    "radio.pro": "Про",
    "radio.team": "Командный",

    "select.eyebrow": "03 — оверлей",
    "select.lede":
      "Листбокс ведёт себя как нативный: стрелки двигают по списку, буквы прыгают к совпадению, повтор буквы циклит по ним, а отключённые пункты пропускаются, а не получают фокус.",
    "select.value": "Значение, которое уходит в скрытый инпут",
    "select.selected": "Пункт, показанный при первой отрисовке",
    "select.event": "Всплывающее событие, значение в detail",
    "select.controlled": "Управляемый или неуправляемый",
    "select.placeholder": "Выберите тариф",
    "select.free": "Бесплатный",
    "select.pro": "Про",
    "select.team": "Командный",
    "select.enterprise": "Корпоративный",

    "slider.eyebrow": "04 — ввод",
    "slider.lede":
      "Один ползунок или два. Если протащить один за другой, пара меняется местами, а не залипает, и каждое движение уходит наружу через скрытые инпуты и события.",
    "slider.range": "Диапазон и шаг",
    "slider.two": "Два таких — уже диапазон",
    "slider.events": "Во время перетаскивания, затем при отпускании",
    "slider.live": "Текущее значение, затем зафиксированное",
    "slider.amount": "Сумма",
    "slider.price": "Цена",

    "marquee.eyebrow": "05 — движение",
    "marquee.lede":
      "Скорость задаётся в пикселях в секунду, а не в секундах на круг, поэтому два слова и двадцать едут одинаково. Скрипт набивает ленту таким числом копий, какое нужно по ширине.",
    "marquee.reverse": "«reverse» разворачивает движение",
    "marquee.pause": "«false» оставляет её ехать",
    "marquee.speed": "Пикселей в секунду, по умолчанию 60",
    "marquee.children": "Повторяются, пока не заполнят ленту",
    "marquee.demo1": "60 пикселей в секунду",
    "marquee.demo2": "Замирает при наведении",

    "carousel.eyebrow": "06 — движение",
    "carousel.lede":
      "По копии ленты с каждой стороны, поэтому цикл никогда не упирается в край. Тащите мышью, жмите стрелки или кликайте быстрее анимации — клики встают в очередь, а не теряются.",
    "carousel.autoplay": "Миллисекунды, уберите — выключится",
    "carousel.dots": "Пустой элемент, который заполнит скрипт",
    "carousel.status": "Live-регион для скринридеров",
    "carousel.autoplayProp": "Миллисекунды, по умолчанию 0",
    "carousel.showDots": "boolean, по умолчанию true",
    "carousel.slide1": "Потяните меня",
    "carousel.slide2": "Работают стрелки",
    "carousel.slide3": "Автоплей встаёт при наведении",
    "carousel.prev": "Предыдущий слайд",
    "carousel.next": "Следующий слайд",

    "colophon.build": "Без сборки и без зависимостей",
  };

  var dictionaries = { ru: ru };

  function stored(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function resolve() {
    var requested = new URLSearchParams(location.search).get("lang");
    var candidate =
      requested ||
      stored(STORAGE_KEY) ||
      (navigator.language || "en").toLowerCase().slice(0, 2);

    if (dictionaries[candidate] || candidate === "en") return candidate;

    return "en";
  }

  var lang = resolve();
  var dictionary = dictionaries[lang];

  document.documentElement.lang = lang;

  if (dictionary) {
    apply("data-i18n", function (element, value) {
      element.textContent = value;
    });

    apply("data-i18n-html", function (element, value) {
      element.innerHTML = value;
    });

    apply("data-i18n-aria", function (element, value) {
      element.setAttribute("aria-label", value);
    });
  }

  function apply(attribute, write) {
    var nodes = document.querySelectorAll("[" + attribute + "]");

    for (var i = 0; i < nodes.length; i += 1) {
      var value = dictionary[nodes[i].getAttribute(attribute)];
      if (value) write(nodes[i], value);
    }
  }

  var buttons = document.querySelectorAll("[data-lang]");

  for (var i = 0; i < buttons.length; i += 1) {
    buttons[i].setAttribute(
      "aria-pressed",
      String(buttons[i].dataset.lang === lang)
    );
    buttons[i].addEventListener("click", switchTo);
  }

  function switchTo(event) {
    var next = event.currentTarget.dataset.lang;

    if (next === lang) return;

    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
    }

    var params = new URLSearchParams(location.search);
    params.set("lang", next);

    location.search = params.toString();
  }
})();
