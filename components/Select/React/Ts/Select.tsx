import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

import "./Select.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  label?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

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
}: SelectProps) {
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typed = useRef("");
  const typedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const listId = useId();

  const current = value ?? internal;
  const selected = options.find((option) => option.value === current);

  useEffect(() => {
    if (!open) return;

    function onDocumentClick(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [open]);

  function enabledIndexes(): number[] {
    return options
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index !== -1);
  }

  function focusAt(position: number, scroll: boolean): void {
    const indexes = enabledIndexes();

    if (indexes.length === 0) return;

    const index = indexes[(position + indexes.length) % indexes.length];
    const node = optionRefs.current[index];

    node?.focus({ preventScroll: true });
    if (scroll) node?.scrollIntoView({ block: "nearest" });
  }

  function positionOf(index: number): number {
    return enabledIndexes().indexOf(index);
  }

  function selectedPosition(): number {
    const index = options.findIndex((option) => option.value === current);
    return Math.max(positionOf(index), 0);
  }

  function close(refocus: boolean): void {
    setOpen(false);
    typed.current = "";
    if (refocus) triggerRef.current?.focus();
  }

  function choose(option: SelectOption): void {
    if (value === undefined) setInternal(option.value);
    onChange?.(option.value);
    close(true);
  }

  function search(char: string): void {
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

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    if (event.key === "Escape") {
      close(false);
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    event.preventDefault();
    setOpen(true);
    focusAt(event.key === "ArrowUp" ? -1 : selectedPosition(), false);
  }

  function onOptionKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ): void {
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
      {name ? (
        <input
          className="ui-select__input"
          type="hidden"
          name={name}
          value={current}
          readOnly
        />
      ) : null}

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
