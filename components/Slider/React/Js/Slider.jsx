import { useRef, useState } from "react";

import "./Slider.css";

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
      className={`ui-slider ${className}`.trim()}
      style={style}
      data-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
    >
      <div className="ui-slider__header">
        <span className="ui-slider__title">{label}</span>
        <span className="ui-slider__value">
          {isRange ? `${values[0]} - ${values[1]}` : values[0]}
        </span>
      </div>

      <div className="ui-slider__body">
        <span className="ui-slider__bound">{min}</span>

        <div
          ref={trackRef}
          className="ui-slider__track"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="ui-slider__range"
            style={{ left: `${from}%`, width: `${to - from}%` }}
          />

          {values.map((thumbValue, index) => (
            <div
              key={index}
              ref={(node) => {
                thumbRefs.current[index] = node;
              }}
              className="ui-slider__thumb"
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

        <span className="ui-slider__bound">{max}</span>
      </div>
    </div>
  );
}
