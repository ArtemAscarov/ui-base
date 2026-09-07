import { useEffect, useId, useRef, useState } from "react";

import "./Select.css";

export function Select({
  options,
  label,
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
      className={`ui-select ${className}`.trim()}
      style={style}
      data-open={open || undefined}
      data-placeholder={!selected || undefined}
    >
      <div className="ui-select__header">
        <button
          ref={triggerRef}
          className="ui-select__trigger"
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
        <span className="ui-select__arrow" />
      </div>

      <div
        className="ui-select__list"
        id={listId}
        aria-hidden={!open || undefined}
      >
        <div className="ui-select__options" role="listbox" aria-label={label}>
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              className="ui-select__option"
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
