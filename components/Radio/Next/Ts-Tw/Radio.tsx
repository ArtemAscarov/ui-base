"use client";

import type { CSSProperties, ReactNode } from "react";

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

const tokens: Record<string, string> = {
  "--radio-color": "inherit",
  "--radio-bg": "#666969",
  "--radio-dot-color": "#ffffff",
  "--radio-border-color": "#4b494b",
  "--radio-border-hover-color": "#ffffff",
  "--radio-size": "16px",
  "--radio-dot-size": "8px",
  "--radio-gap": "10px",
  "--radio-border-width": "1px",
  "--radio-radius": "50%",
  "--radio-shadow": "0 0 5px 0.5px rgb(130, 128, 130)",
  "--radio-focus-ring": "0 0 5px 2px rgb(31, 25, 31)",
  "--radio-active-scale": "0.9",
  "--radio-disabled-opacity": "0.5",
  "--radio-duration": "80ms",
  "--radio-easing": "linear",
};

const rootClass =
  "group relative inline-flex items-center gap-[var(--radio-gap)] text-[color:var(--radio-color)] cursor-pointer [-webkit-tap-highlight-color:transparent] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-[var(--radio-disabled-opacity)] motion-reduce:[--radio-duration:1ms]";

const inputClass =
  "peer absolute top-0 left-0 w-px h-px opacity-0 pointer-events-none";

const circleClass =
  "relative flex-none w-[var(--radio-size)] h-[var(--radio-size)] border-[length:var(--radio-border-width)] border-solid border-[color:var(--radio-border-color)] rounded-[var(--radio-radius)] bg-[var(--radio-bg)] [box-shadow:var(--radio-shadow)] cursor-[inherit] transition-[border-color,transform] duration-[var(--radio-duration)] ease-[var(--radio-easing)] after:content-[''] after:absolute after:top-1/2 after:left-1/2 after:w-[var(--radio-dot-size)] after:h-[var(--radio-dot-size)] after:rounded-[var(--radio-radius)] after:bg-[var(--radio-dot-color)] after:[transform:translate(-50%,-50%)_scale(0)] after:transition-transform after:duration-[var(--radio-duration)] after:ease-[var(--radio-easing)] peer-checked:after:[transform:translate(-50%,-50%)_scale(1)] peer-enabled:group-hover:border-[color:var(--radio-border-hover-color)] peer-enabled:group-active:scale-[var(--radio-active-scale)] peer-focus-visible:[box-shadow:var(--radio-focus-ring)]";

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
    <label
      className={`${rootClass} ${className}`.trim()}
      style={{ ...tokens, ...style } as CSSProperties}
    >
      <input
        className={inputClass}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
      />
      <span className={circleClass} />
      {label}
    </label>
  );
}
