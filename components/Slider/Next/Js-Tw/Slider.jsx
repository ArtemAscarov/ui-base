"use client";

import { useRef, useState } from "react";

const tokens = {
  "--slider-color": "inherit",
  "--slider-value-color": "#ffffff",
  "--slider-bg": "#666969",
  "--slider-border-color": "rgba(0, 0, 0, 0.26)",
  "--slider-track-color": "rgba(0, 0, 0, 0.17)",
  "--slider-range-color": "rgba(0, 0, 0, 0.51)",
  "--slider-thumb-color": "wheat",
  "--slider-thumb-border-color": "rgba(0, 0, 0, 0.6)",
  "--slider-width": "400px",
  "--slider-padding": "5px",
  "--slider-body-padding": "10px 15px",
  "--slider-header-gap": "10px",
  "--slider-gap": "10px",
  "--slider-track-height": "8px",
  "--slider-thumb-size": "16px",
  "--slider-border-width": "1px",
  "--slider-radius": "8px",
  "--slider-track-radius": "10px",
  "--slider-thumb-radius": "50%",
  "--slider-font-weight": "500",
  "--slider-shadow": "0 0 5px 0.5px rgb(130, 128, 130)",
  "--slider-focus-ring": "0 0 5px 2px rgb(31, 25, 31)",
  "--slider-thumb-scale": "1",
  "--slider-active-scale": "1.15",
  "--slider-disabled-opacity": "0.5",
  "--slider-duration": "80ms",
  "--slider-easing": "linear",
};

const rootClass =
  "group w-full min-w-0 max-w-[var(--slider-width)] p-[var(--slider-padding)] border-[length:var(--slider-border-width)] border-solid border-[color:var(--slider-border-color)] text-[color:var(--slider-color)] data-[disabled]:opacity-[var(--slider-disabled-opacity)] motion-reduce:[--slider-duration:1ms]";

const headerClass =
  "flex justify-between gap-[var(--slider-gap)] mb-[var(--slider-header-gap)]";

const bodyClass =
  "flex items-center gap-[var(--slider-gap)] w-full p-[var(--slider-body-padding)] rounded-[var(--slider-radius)] bg-[var(--slider-bg)] [box-shadow:var(--slider-shadow)] text-[color:var(--slider-value-color)] [font-weight:var(--slider-font-weight)] select-none";

const trackClass =
  "relative w-full h-[var(--slider-track-height)] mx-[calc(var(--slider-thumb-size)/2)] rounded-[var(--slider-track-radius)] bg-[var(--slider-track-color)] cursor-pointer touch-none group-data-[disabled]:cursor-not-allowed group-data-[disabled]:pointer-events-none";

const rangeClass =
  "absolute h-[var(--slider-track-height)] rounded-[var(--slider-track-radius)] bg-[var(--slider-range-color)]";

const thumbClass =
  "absolute top-1/2 w-[var(--slider-thumb-size)] h-[var(--slider-thumb-size)] border-[length:var(--slider-border-width)] border-solid border-[color:var(--slider-thumb-border-color)] rounded-[var(--slider-thumb-radius)] bg-[var(--slider-thumb-color)] cursor-grab touch-none [transform:translate(-50%,-50%)_scale(var(--slider-thumb-scale))] transition-transform duration-[var(--slider-duration)] ease-[var(--slider-easing)] hover:[--slider-thumb-scale:var(--slider-active-scale)] focus-visible:[--slider-thumb-scale:var(--slider-active-scale)] focus-visible:outline-none focus-visible:[box-shadow:var(--slider-focus-ring)] active:cursor-grabbing group-data-[dragging]:cursor-grabbing group-data-[disabled]:cursor-not-allowed";

export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  defaultValue = min,
  value,
  onInput,
  onChange,
  disabled = false,
  className = "",
  style,
}) {
  const [internal, setInternal] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);
  const thumbRefs = useRef([]);
  const dragIndex = useRef(null);

  const current = value ?? internal;
  const isRange = Array.isArray(current);
  const values = isRange ? [...current] : [current];

  if (!(max > min)) return null;

  const span = max - min;
  const decimals = (String(step).split(".")[1] ?? "").length;

  function snap(raw) {
    const stepped = min + Math.round((raw - min) / step) * step;
    return Number(Math.min(max, Math.max(min, stepped)).toFixed(decimals));
  }

  function percent(raw) {
    return ((raw - min) / span) * 100;
  }

  function valueAt(clientX) {
    const box = trackRef.current.getBoundingClientRect();
    return snap(min + ((clientX - box.left) / box.width) * span);
  }

  function apply(index, raw) {
    const next = [...values];
    next[index] = snap(raw);

    if (isRange && next[0] > next[1]) {
      next.reverse();
      return { next, activeIndex: index === 0 ? 1 : 0 };
    }

    return { next, activeIndex: index };
  }

  function commit(next, type) {
    const result = isRange ? [next[0], next[1]] : next[0];

    if (value === undefined) setInternal(result);
    if (type === "input") onInput?.(result);
    else onChange?.(result);
  }

  function nearest(raw) {
    if (!isRange) return 0;

    return Math.abs(raw - values[1]) <= Math.abs(raw - values[0]) ? 1 : 0;
  }

  function handlePointerDown(event) {
    if (disabled || !trackRef.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    event.preventDefault();
    trackRef.current.setPointerCapture(event.pointerId);
    setDragging(true);

    const thumb = event.target.closest("[data-slider-thumb]");

    if (thumb) {
      dragIndex.current = thumbRefs.current.indexOf(thumb);
      return;
    }

    const raw = valueAt(event.clientX);
    const { next, activeIndex } = apply(nearest(raw), raw);

    dragIndex.current = activeIndex;
    commit(next, "input");
  }

  function handlePointerMove(event) {
    if (dragIndex.current === null) return;

    const { next, activeIndex } = apply(
      dragIndex.current,
      valueAt(event.clientX)
    );

    dragIndex.current = activeIndex;
    commit(next, "input");
  }

  function handlePointerUp() {
    if (dragIndex.current === null) return;

    thumbRefs.current[dragIndex.current]?.focus();
    dragIndex.current = null;
    setDragging(false);
    commit(values, "change");
  }

  function handleKeyDown(index) {
    return (event) => {
      const jump = Math.max(step, span / 10);
      const moves = {
        ArrowRight: values[index] + step,
        ArrowUp: values[index] + step,
        ArrowLeft: values[index] - step,
        ArrowDown: values[index] - step,
        PageUp: values[index] + jump,
        PageDown: values[index] - jump,
        Home: min,
        End: max,
      };

      if (!(event.key in moves)) return;

      event.preventDefault();
      const { next, activeIndex } = apply(index, moves[event.key]);

      commit(next, "input");
      commit(next, "change");
      thumbRefs.current[activeIndex]?.focus();
    };
  }

  const from = isRange ? percent(values[0]) : 0;
  const to = percent(isRange ? values[1] : values[0]);

  return (
    <div
      className={`${rootClass} ${className}`.trim()}
      style={{ ...tokens, ...style }}
      data-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
    >
      <div className={headerClass}>
        <span>{label}</span>
        <span>{isRange ? `${values[0]} - ${values[1]}` : values[0]}</span>
      </div>

      <div className={bodyClass}>
        <span className="flex-none">{min}</span>

        <div
          ref={trackRef}
          className={trackClass}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className={rangeClass}
            style={{ left: `${from}%`, width: `${to - from}%` }}
          />

          {values.map((thumbValue, index) => (
            <div
              key={index}
              ref={(node) => {
                thumbRefs.current[index] = node;
              }}
              className={thumbClass}
              style={{ left: `${percent(thumbValue)}%` }}
              data-slider-thumb=""
              role="slider"
              tabIndex={disabled ? -1 : 0}
              aria-label={
                isRange
                  ? `${label ?? "Value"} ${index === 0 ? "from" : "to"}`
                  : label
              }
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={thumbValue}
              aria-valuetext={
                isRange
                  ? `${thumbValue} (${index === 0 ? "from" : "to"})`
                  : undefined
              }
              aria-disabled={disabled || undefined}
              onKeyDown={disabled ? undefined : handleKeyDown(index)}
            />
          ))}
        </div>

        <span className="flex-none">{max}</span>
      </div>
    </div>
  );
}
