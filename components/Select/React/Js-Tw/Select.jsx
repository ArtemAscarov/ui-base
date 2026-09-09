import { useEffect, useId, useRef, useState } from "react";

const tokens = {
  "--select-color": "#ffffff",
  "--select-bg": "#666969",
  "--select-border-color": "#4b494b",
  "--select-arrow-color": "#ffffff",
  "--select-width": "300px",
  "--select-padding-y": "5px",
  "--select-padding-x": "10px",
  "--select-gap": "10px",
  "--select-border-width": "1px",
  "--select-radius": "0",
  "--select-arrow-size": "15px",
  "--select-arrow-inset": "10px",
  "--select-check-size": "14px",
  "--select-list-max-height": "240px",
  "--select-shadow": "0 0 5px 0.5px rgb(130, 128, 130)",
  "--select-focus-ring": "0 0 5px 2px rgb(31, 25, 31)",
  "--select-placeholder-opacity": "0.75",
  "--select-disabled-opacity": "0.5",
  "--select-duration": "200ms",
  "--select-easing": "linear",
  "--select-arrow-rotate": "0deg",
  "--select-arrow-icon":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 8l8 8 8-8'/%3E%3C/svg%3E\")",
  "--select-check-icon":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 12.5 9.5 18 20 6.5'/%3E%3C/svg%3E\")",
};

const rootClass =
  "group relative w-full min-w-0 max-w-[var(--select-width)] data-[open]:[--select-arrow-rotate:180deg] motion-reduce:[--select-duration:1ms]";

const surfaceClass =
  "w-full py-[var(--select-padding-y)] px-[var(--select-padding-x)] border-[length:var(--select-border-width)] border-solid border-[color:var(--select-border-color)] rounded-[var(--select-radius)] bg-[var(--select-bg)] [box-shadow:var(--select-shadow)] text-[color:var(--select-color)] text-start cursor-pointer transition-shadow duration-[var(--select-duration)] ease-[var(--select-easing)] disabled:cursor-not-allowed disabled:opacity-[var(--select-disabled-opacity)] focus-visible:outline-none";

const triggerClass = `${surfaceClass} pr-[calc(var(--select-arrow-size)+var(--select-arrow-inset)*2)] overflow-hidden whitespace-nowrap text-ellipsis hover:[box-shadow:var(--select-focus-ring)] focus-visible:[box-shadow:var(--select-focus-ring)] group-data-[placeholder]:opacity-[var(--select-placeholder-opacity)]`;

const arrowClass =
  "absolute top-1/2 right-[var(--select-arrow-inset)] w-[var(--select-arrow-size)] h-[var(--select-arrow-size)] bg-[var(--select-arrow-color)] [-webkit-mask:var(--select-arrow-icon)_center/contain_no-repeat] [mask:var(--select-arrow-icon)_center/contain_no-repeat] [transform:translateY(-50%)_rotate(var(--select-arrow-rotate))] transition-transform duration-[var(--select-duration)] ease-[var(--select-easing)] pointer-events-none";

const listClass =
  "absolute top-full z-[1] grid grid-rows-[0fr] items-start w-full overflow-hidden pointer-events-none transition-[grid-template-rows,padding] duration-[var(--select-duration)] ease-[var(--select-easing)] group-data-[open]:grid-rows-[1fr] group-data-[open]:p-[var(--select-padding-y)] group-data-[open]:pointer-events-auto";

const optionsClass =
  "flex flex-col gap-[var(--select-gap)] max-h-[var(--select-list-max-height)] overflow-y-auto overscroll-contain";

const optionClass = `${surfaceClass} relative flex-none pr-[calc(var(--select-check-size)+var(--select-arrow-inset)*2)] enabled:hover:[box-shadow:var(--select-focus-ring)] focus-visible:[box-shadow:var(--select-focus-ring)] after:content-[''] after:absolute after:top-1/2 after:right-[var(--select-arrow-inset)] after:w-[var(--select-check-size)] after:h-[var(--select-check-size)] after:bg-current after:[-webkit-mask:var(--select-check-icon)_center/contain_no-repeat] after:[mask:var(--select-check-icon)_center/contain_no-repeat] after:[transform:translateY(-50%)_scale(0)] after:transition-transform after:duration-[var(--select-duration)] after:ease-[var(--select-easing)] aria-selected:after:[transform:translateY(-50%)_scale(1)]`;

export function Select({
  options,
  label,
  name,
  placeholder = "Select",
  value,
  defaultValue = "",
  onChange,
  disabled = false,
  className = "",
  style,
}) {
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const typed = useRef("");
  const typedTimer = useRef(undefined);
  const listId = useId();

  const current = value ?? internal;
  const selected = options.find((option) => option.value === current);

  useEffect(() => {
    if (!open) return;

    function onDocumentClick(event) {
      if (rootRef.current?.contains(event.target)) return;
      setOpen(false);
    }

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [open]);

  function enabledIndexes() {
    return options
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index !== -1);
  }

  function focusAt(position, scroll) {
    const indexes = enabledIndexes();

    if (indexes.length === 0) return;

    const index = indexes[(position + indexes.length) % indexes.length];
    const node = optionRefs.current[index];

    node?.focus({ preventScroll: true });
    if (scroll) node?.scrollIntoView({ block: "nearest" });
  }

  function positionOf(index) {
    return enabledIndexes().indexOf(index);
  }

  function selectedPosition() {
    const index = options.findIndex((option) => option.value === current);
    return Math.max(positionOf(index), 0);
  }

  function close(refocus) {
    setOpen(false);
    typed.current = "";
    if (refocus) triggerRef.current?.focus();
  }

  function choose(option) {
    if (value === undefined) setInternal(option.value);
    onChange?.(option.value);
    close(true);
  }

  function search(char) {
    clearTimeout(typedTimer.current);

    typed.current += char.toLowerCase();
    typedTimer.current = setTimeout(() => (typed.current = ""), 500);

    const buffer = typed.current;
    const query = [...buffer].every((letter) => letter === buffer[0])
      ? buffer[0]
      : buffer;
    const indexes = enabledIndexes();
    const active = optionRefs.current.findIndex(
      (node) => node === document.activeElement
    );
    const from = Math.max(indexes.indexOf(active), 0);
    const skip = query.length === 1 ? 1 : 0;

    for (let step = 0; step < indexes.length; step += 1) {
      const position = (from + skip + step) % indexes.length;
      const option = options[indexes[position]];

      if (option.label.toLowerCase().startsWith(query)) {
        focusAt(position, true);
        return;
      }
    }
  }

  function onTriggerKeyDown(event) {
    if (event.key === "Escape") {
      close(false);
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    setOpen(true);
    focusAt(event.key === "ArrowUp" ? -1 : selectedPosition(), false);
  }

  function onOptionKeyDown(event, index) {
    const position = positionOf(index);
    const option = options[index];

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(position + 1, true);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(position - 1, true);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0, true);
        break;
      case "End":
        event.preventDefault();
        focusAt(-1, true);
        break;
      case "Enter":
        event.preventDefault();
        choose(option);
        break;
      case " ":
        event.preventDefault();
        if (typed.current) search(" ");
        else choose(option);
        break;
      case "Escape":
      case "Tab":
        close(true);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          search(event.key);
        }
    }
  }

  return (
    <div
      ref={rootRef}
      className={`${rootClass} ${className}`.trim()}
      style={{ ...tokens, ...style }}
      data-open={open || undefined}
      data-placeholder={!selected || undefined}
    >
      {name ? (
        <input
          type="hidden"
          name={name}
          value={current}
          readOnly
        />
      ) : null}

      <div className="relative">
        <button
          ref={triggerRef}
          className={triggerClass}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen(!open)}
          onKeyDown={onTriggerKeyDown}
        >
          {selected ? selected.label : placeholder}
        </button>
        <span className={arrowClass} />
      </div>

      <div className={listClass} id={listId} aria-hidden={!open || undefined}>
        <div className={optionsClass} role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              className={optionClass}
              type="button"
              role="option"
              tabIndex={-1}
              disabled={option.disabled}
              aria-selected={option.value === current}
              aria-disabled={option.disabled || undefined}
              onClick={() => choose(option)}
              onKeyDown={(event) => onOptionKeyDown(event, index)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
