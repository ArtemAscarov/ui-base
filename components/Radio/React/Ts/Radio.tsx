import type { CSSProperties, ReactNode } from "react";

import "./Radio.css";

export interface RadioProps {
  label?: ReactNode;
  name: string;
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
  style?: CSSProperties;
}

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
}: RadioProps) {
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
