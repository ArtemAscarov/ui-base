export function initSelect(select: HTMLElement): void {
  const trigger = select.querySelector<HTMLButtonElement>(
    "[data-select-trigger]"
  );
  const list = select.querySelector<HTMLElement>("[data-select-list]");
  const input = select.querySelector<HTMLInputElement>("[data-select-input]");
  const options = [
    ...select.querySelectorAll<HTMLButtonElement>("[data-select-option]"),
  ];

  if (!trigger || !list || options.length === 0) return;

  const placeholder = trigger.textContent?.trim() ?? "";

  let typed = "";
  let typedTimer: ReturnType<typeof setTimeout>;

  function enabled(): HTMLButtonElement[] {
    return options.filter((option) => !option.disabled);
  }

  function isOpen(): boolean {
    return select.hasAttribute("data-open");
  }

  function open(): void {
    select.setAttribute("data-open", "");
    trigger!.setAttribute("aria-expanded", "true");
    list!.removeAttribute("aria-hidden");
  }

  function close(): void {
    if (list!.contains(document.activeElement)) trigger!.focus();

    select.removeAttribute("data-open");
    trigger!.setAttribute("aria-expanded", "false");
    list!.setAttribute("aria-hidden", "true");
    typed = "";
  }

  function focusAt(index: number): HTMLButtonElement | null {
    const items = enabled();

    if (items.length === 0) return null;

    const option = items[(index + items.length) % items.length];
    option.focus({ preventScroll: true });

    return option;
  }

  function moveTo(index: number): void {
    focusAt(index)?.scrollIntoView({ block: "nearest" });
  }

  function selectedIndex(): number {
    return enabled().findIndex(
      (option) => option.getAttribute("aria-selected") === "true"
    );
  }

  function search(char: string): void {
    clearTimeout(typedTimer);

    typed += char.toLowerCase();
    typedTimer = setTimeout(() => (typed = ""), 500);

    const items = enabled();
    const query = [...typed].every((letter) => letter === typed[0])
      ? typed[0]
      : typed;
    const from = Math.max(
      items.indexOf(document.activeElement as HTMLButtonElement),
      0
    );
    const skip = query.length === 1 ? 1 : 0;

    for (let step = 0; step < items.length; step += 1) {
      const at = (from + skip + step) % items.length;
      const text = items[at].textContent?.trim().toLowerCase() ?? "";

      if (text.startsWith(query)) {
        moveTo(at);
        return;
      }
    }
  }

  function show(option: HTMLButtonElement | undefined): string {
    options.forEach((item) =>
      item.setAttribute("aria-selected", String(item === option))
    );

    const value = option
      ? (option.dataset.value ?? option.textContent?.trim() ?? "")
      : "";

    trigger!.textContent = option
      ? (option.textContent?.trim() ?? "")
      : placeholder;
    select.toggleAttribute("data-placeholder", !option);

    if (input) input.value = value;

    return value;
  }

  function choose(option: HTMLButtonElement): void {
    const value = show(option);

    select.dispatchEvent(
      new CustomEvent("select:change", {
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
    if (!select.contains(event.target as Node)) close();
  });

  show(options.find((option) => option.dataset.selected !== undefined));
  close();
}

document
  .querySelectorAll<HTMLElement>("[data-select]")
  .forEach((select) => initSelect(select));
