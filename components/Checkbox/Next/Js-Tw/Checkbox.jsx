"use client";

import { useEffect, useRef } from "react";

const tokens = {
  "--checkbox-color": "inherit",
  "--checkbox-bg": "#666969",
  "--checkbox-mark-color": "#ffffff",
  "--checkbox-border-color": "#4b494b",
  "--checkbox-border-hover-color": "#ffffff",
  "--checkbox-size": "15px",
  "--checkbox-gap": "10px",
  "--checkbox-border-width": "1px",
  "--checkbox-radius": "20%",
  "--checkbox-shadow": "0 0 5px 0.5px rgb(130, 128, 130)",
  "--checkbox-focus-ring": "0 0 5px 2px rgb(31, 25, 31)",
  "--checkbox-active-scale": "0.9",
  "--checkbox-disabled-opacity": "0.5",
  "--checkbox-duration": "80ms",
  "--checkbox-easing": "linear",
  "--checkbox-mark-icon":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M4 12.5 9.5 18 20 6.5'/%3E%3C/svg%3E\")",
};

const rootClass =
  "group relative inline-flex items-center gap-[var(--checkbox-gap)] text-[color:var(--checkbox-color)] cursor-pointer [-webkit-tap-highlight-color:transparent] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-[var(--checkbox-disabled-opacity)] motion-reduce:[--checkbox-duration:1ms]";

const inputClass =
  "peer absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none";

const boxClass =
  "relative flex-none w-[var(--checkbox-size)] h-[var(--checkbox-size)] border-[length:var(--checkbox-border-width)] border-solid border-[color:var(--checkbox-border-color)] rounded-[var(--checkbox-radius)] bg-[var(--checkbox-bg)] [box-shadow:var(--checkbox-shadow)] cursor-[inherit] transition-[border-color,transform] duration-[var(--checkbox-duration)] ease-[var(--checkbox-easing)] after:content-[''] after:absolute after:inset-0 after:bg-[var(--checkbox-mark-color)] after:[-webkit-mask:var(--checkbox-mark-icon)_center/contain_no-repeat] after:[mask:var(--checkbox-mark-icon)_center/contain_no-repeat] after:scale-0 after:transition-transform after:duration-[var(--checkbox-duration)] after:ease-[var(--checkbox-easing)] peer-checked:after:scale-100 peer-indeterminate:after:inset-y-[40%] peer-indeterminate:after:inset-x-[20%] peer-indeterminate:after:[-webkit-mask:none] peer-indeterminate:after:[mask:none] peer-indeterminate:after:rounded-[1px] peer-indeterminate:after:scale-100 peer-enabled:group-hover:border-[color:var(--checkbox-border-hover-color)] peer-enabled:group-active:scale-[var(--checkbox-active-scale)] peer-focus-visible:[box-shadow:var(--checkbox-focus-ring)]";

export function Checkbox({
  label,
  name,
  value,
  checked,
  defaultChecked,
  indeterminate = false,
  disabled = false,
  onChange,
  className = "",
  style,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={`${rootClass} ${className}`.trim()}
      style={{ ...tokens, ...style }}
    >
      <input
        ref={inputRef}
        className={inputClass}
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className={boxClass} />
      {label}
    </label>
  );
}
