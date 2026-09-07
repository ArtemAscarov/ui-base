function initSelect(select) {
  const trigger = select.querySelector(".ui-select__trigger");
  const list = select.querySelector(".ui-select__list");
  const input = select.querySelector(".ui-select__input");
  const options = [...select.querySelectorAll(".ui-select__option")];

  if (!trigger || !list || options.length === 0) return;

  const placeholder = trigger.textContent.trim();

  let typed = "";
  let typedTimer;

  function enabled() {
    return options.filter((option) => !option.disabled);
  }

  function isOpen() {
    return select.classList.contains("ui-select--open");
  }

  function open() {
    select.classList.add("ui-select--open");
    trigger.setAttribute("aria-expanded", "true");
    list.removeAttribute("inert");
  }

  function close() {
    if (list.contains(document.activeElement)) trigger.focus();

    select.classList.remove("ui-select--open");
    trigger.setAttribute("aria-expanded", "false");
    list.setAttribute("inert", "");
    typed = "";
  }

  function focusAt(index) {
    const items = enabled();

    if (items.length === 0) return null;

    const option = items[(index + items.length) % items.length];
    option.focus({ preventScroll: true });

    return option;
  }

  function moveTo(index) {
    const option = focusAt(index);

    if (option) option.scrollIntoView({ block: "nearest" });
  }

  function selectedIndex() {
    return enabled().findIndex(
      (option) => option.getAttribute("aria-selected") === "true"
    );
  }

  function search(char) {
    clearTimeout(typedTimer);

    typed += char.toLowerCase();
    typedTimer = setTimeout(() => (typed = ""), 500);

    const items = enabled();
    const query = [...typed].every((letter) => letter === typed[0])
      ? typed[0]
      : typed;
    const from = Math.max(items.indexOf(document.activeElement), 0);
    const skip = query.length === 1 ? 1 : 0;

    for (let step = 0; step < items.length; step += 1) {
      const at = (from + skip + step) % items.length;

      if (items[at].textContent.trim().toLowerCase().startsWith(query)) {
        moveTo(at);
        return;
      }
    }
  }

  function show(option) {
    options.forEach((item) =>
      item.setAttribute("aria-selected", String(item === option))
    );

    const value = option
      ? option.dataset.value ?? option.textContent.trim()
      : "";

    trigger.textContent = option ? option.textContent.trim() : placeholder;
    select.classList.toggle("ui-select--placeholder", !option);

    if (input) input.value = value;

    return value;
  }

  function choose(option) {
    const value = show(option);

    select.dispatchEvent(
      new CustomEvent("ui-select:change", {
        bubbles: true,
        detail: { value, option },
      })
    );

    close();
  }

  trigger.addEventListener("click", () => {
    if (isOpen()) close();
    else open();
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    open();
    focusAt(event.key === "ArrowUp" ? -1 : Math.max(selectedIndex(), 0));
  });

  options.forEach((option) => {
    option.tabIndex = -1;

    if (option.disabled) option.setAttribute("aria-disabled", "true");

    option.addEventListener("click", () => choose(option));

    option.addEventListener("keydown", (event) => {
      const at = enabled().indexOf(option);

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveTo(at + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveTo(at - 1);
          break;
        case "Home":
          event.preventDefault();
          moveTo(0);
          break;
        case "End":
          event.preventDefault();
          moveTo(-1);
          break;
        case "Enter":
          event.preventDefault();
          choose(option);
          break;
        case " ":
          event.preventDefault();
          if (typed) search(" ");
          else choose(option);
          break;
        case "Escape":
        case "Tab":
          close();
          break;
        default:
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            search(event.key);
          }
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!select.contains(event.target)) close();
  });

  show(options.find((option) => option.getAttribute("aria-selected") === "true"));
  close();
}

document.querySelectorAll("[data-ui-select]").forEach(initSelect);
