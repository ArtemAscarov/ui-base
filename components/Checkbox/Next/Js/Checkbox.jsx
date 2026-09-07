"use client";

import { useEffect, useRef } from "react";

import "./Checkbox.css";

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
    <label className={`ui-checkbox ${className}`.trim()} style={style}>
      <input
        ref={inputRef}
        className="ui-checkbox__input"
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className="ui-checkbox__box" />
      {label}
    </label>
  );
}
