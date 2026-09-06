function initSelect(select) {
  const trigger = select.querySelector(".ui-select__trigger");
  const list = select.querySelector(".ui-select__list");
  const input = select.querySelector(".ui-select__input");
  const options = [...select.querySelectorAll(".ui-select__option")];

  // Компонент не должен падать на неполной разметке: без триггера
  // или без списка делать нечего, всё остальное — необязательно.
  if (!trigger || !list || options.length === 0) return;

  const placeholder = trigger.textContent.trim();

  function isOpen() {
    return select.classList.contains("ui-select--open");
  }

  function open() {
    select.classList.add("ui-select--open");
    trigger.setAttribute("aria-expanded", "true");
    list.removeAttribute("inert");
  }

  function close() {
    // Фокус надо увести ДО inert: иначе браузер выкинет его в <body>
    // и следующий Tab начнёт обход страницы с самого начала.
    if (list.contains(document.activeElement)) trigger.focus();

    select.classList.remove("ui-select--open");
    trigger.setAttribute("aria-expanded", "false");
    list.setAttribute("inert", "");
  }

  function selectedIndex() {
    return options.findIndex(
      (option) => option.getAttribute("aria-selected") === "true"
    );
  }

  function focusOption(index) {
    options[(index + options.length) % options.length].focus();
  }

  function sync(option) {
    options.forEach((item) =>
      item.setAttribute("aria-selected", String(item === option))
    );

    const value = option ? option.dataset.value ?? option.textContent.trim() : "";

    trigger.textContent = option ? option.textContent.trim() : placeholder;

    if (!input) return;
    input.value = value;
  }

  function choose(option) {
    sync(option);

    // Скрытый input меняем из кода, а код не порождает событий сам:
    // диспатчим change вручную, чтобы форма и подписчики о нём узнали.
    if (input) input.dispatchEvent(new Event("change", { bubbles: true }));

    close();
  }

  trigger.addEventListener("click", () => {
    if (isOpen()) {
      close();
      return;
    }

    open();
    focusOption(Math.max(selectedIndex(), 0));
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    open();
    focusOption(
      event.key === "ArrowDown"
        ? Math.max(selectedIndex(), 0)
        : options.length - 1
    );
  });

  options.forEach((option, index) => {
    // Roving tabindex: в Tab-обход попадает только триггер,
    // между пунктами ходят стрелками.
    option.setAttribute("tabindex", "-1");

    option.addEventListener("click", () => choose(option));

    option.addEventListener("keydown", (event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          focusOption(index + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          focusOption(index - 1);
          break;
        case "Home":
          event.preventDefault();
          focusOption(0);
          break;
        case "End":
          event.preventDefault();
          focusOption(options.length - 1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          choose(option);
          break;
        case "Escape":
        case "Tab":
          close();
          break;
      }
    });
  });

  // Клик мимо компонента закрывает список. Именно contains(),
  // а не stopPropagation() внутри: глушить всплытие означало бы
  // ломать чужие обработчики на всей странице.
  document.addEventListener("click", (event) => {
    if (select.contains(event.target)) return;
    close();
  });

  // Разметка может прийти с уже выбранным пунктом — подхватываем его.
  const preselected = options[selectedIndex()];
  if (preselected) sync(preselected);

  close();
}

function main() {
  document.querySelectorAll("[data-ui-select]").forEach(initSelect);
}

main();
