"use client";

import "./Radio.css";

export function Radio({
  label,
  name,
  value,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  className = "",
  style,
}) {
  return (
    <label className={`ui-radio ${className}`.trim()} style={style}>
      <input
        className="ui-radio__input"
        type="radio"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <span className="ui-radio__circle" />
      {label}
    </label>
  );
}
