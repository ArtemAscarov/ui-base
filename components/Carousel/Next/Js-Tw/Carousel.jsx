"use client";

import { Children, useEffect, useLayoutEffect, useRef, useState } from "react";

const tokens = {
  "--carousel-color": "#ffffff",
  "--carousel-bg": "#666969",
  "--carousel-button-bg": "#808080",
  "--carousel-button-color": "#ffffff",
  "--carousel-width": "800px",
  "--carousel-gap": "10px",
  "--carousel-slide-width": "100%",
  "--carousel-slide-height": "300px",
  "--carousel-slide-padding": "10px",
  "--carousel-button-size": "32px",
  "--carousel-button-inset": "8px",
  "--carousel-arrow-size": "55%",
  "--carousel-dot-size": "8px",
  "--carousel-dot-hit": "22px",
  "--carousel-dot-opacity": "0.45",
  "--carousel-dot-scale": "1",
  "--carousel-dot-active-scale": "1.4",
  "--carousel-dots-gap": "2px",
  "--carousel-dots-offset": "10px",
  "--carousel-radius": "8px",
  "--carousel-button-radius": "50%",
  "--carousel-shadow": "0 0 5px 0.5px rgb(130, 128, 130)",
  "--carousel-focus-ring": "0 0 5px 2px rgb(31, 25, 31)",
  "--carousel-duration": "400ms",
  "--carousel-easing": "linear",
  "--carousel-arrow-icon":
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 5l7 7-7 7'/%3E%3C/svg%3E\")",
};

const rootClass =
  "group relative w-full min-w-0 max-w-[var(--carousel-width)] mx-auto";

const viewportClass = "overflow-hidden touch-pan-y select-none";

const trackClass =
  "flex gap-[var(--carousel-gap)] transition-transform duration-[var(--carousel-duration)] ease-[var(--carousel-easing)] group-data-[dragging]:transition-none group-data-[instant]:transition-none motion-reduce:transition-none";

const slideClass =
  "flex-[0_0_var(--carousel-slide-width)] h-[var(--carousel-slide-height)] p-[var(--carousel-slide-padding)] rounded-[var(--carousel-radius)] bg-[var(--carousel-bg)] [box-shadow:var(--carousel-shadow)] text-[color:var(--carousel-color)] overflow-hidden";

const buttonClass =
  "absolute top-1/2 z-[1] w-[var(--carousel-button-size)] h-[var(--carousel-button-size)] border-none rounded-[var(--carousel-button-radius)] bg-[var(--carousel-button-bg)] [transform:translateY(-50%)] cursor-pointer before:content-[''] before:absolute before:inset-0 before:bg-[var(--carousel-button-color)] before:[-webkit-mask:var(--carousel-arrow-icon)_center/var(--carousel-arrow-size)_no-repeat] before:[mask:var(--carousel-arrow-icon)_center/var(--carousel-arrow-size)_no-repeat] focus-visible:outline-none focus-visible:[box-shadow:var(--carousel-focus-ring)]";

const prevClass = `${buttonClass} left-[var(--carousel-button-inset)] before:[transform:rotate(180deg)]`;

const nextClass = `${buttonClass} right-[var(--carousel-button-inset)]`;

const dotsClass =
  "flex justify-center gap-[var(--carousel-dots-gap)] mt-[var(--carousel-dots-offset)]";

const dotClass =
  "relative w-[var(--carousel-dot-hit)] h-[var(--carousel-dot-hit)] p-0 border-none bg-transparent cursor-pointer before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:w-[var(--carousel-dot-size)] before:h-[var(--carousel-dot-size)] before:rounded-[var(--carousel-button-radius)] before:bg-[var(--carousel-button-bg)] before:opacity-[var(--carousel-dot-opacity)] before:[transform:translate(-50%,-50%)_scale(var(--carousel-dot-scale))] before:transition-[opacity,transform] before:duration-[var(--carousel-duration)] before:ease-[var(--carousel-easing)] aria-[current=true]:[--carousel-dot-scale:var(--carousel-dot-active-scale)] aria-[current=true]:before:opacity-100 focus-visible:outline-none focus-visible:before:opacity-100 focus-visible:before:[box-shadow:var(--carousel-focus-ring)] motion-reduce:before:transition-none";

const statusClass =
  "absolute w-px h-px -m-px overflow-hidden [clip-path:inset(50%)] whitespace-nowrap";

export function Carousel({
  children,
  label,
  autoplay = 0,
  showDots = true,
  className = "",
  style,
}) {
  const slides = Children.toArray(children);
  const count = slides.length;

  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const slideRef = useRef(null);
  const animating = useRef(false);
  const queued = useRef(0);
  const settleTimer = useRef(undefined);
  const startX = useRef(null);
  const startY = useRef(0);
  const afterDrag = useRef(false);

  const indexRef = useRef(count);
  const [index, setIndex] = useState(count);
  const [instant, setInstant] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const slide = slideRef.current;

    if (!viewport || !slide) return;

    function measure() {
      const track = slide.parentElement;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      setStep(slide.getBoundingClientRect().width + gap);
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  useEffect(drain, [index]);

  useEffect(() => {
    function onVisibility() {
      setPaused(document.hidden);
    }

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (autoplay <= 0 || paused || count === 0) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => go(1), autoplay);
    return () => clearInterval(id);
  }, [autoplay, paused, count, index]);

  if (count === 0) return null;

  function slideNumber(value) {
    return ((value % count) + count) % count;
  }

  function moveTo(next, animate) {
    indexRef.current = next;
    setInstant(!animate);
    setIndex(next);
  }

  function drain() {
    if (animating.current || queued.current === 0) return;

    const steps = queued.current;
    queued.current = 0;
    go(steps);
  }

  function settle() {
    if (!animating.current) return;

    clearTimeout(settleTimer.current);
    animating.current = false;

    let next = indexRef.current;
    while (next >= count * 2) next -= count;
    while (next < count) next += count;

    if (next !== indexRef.current) moveTo(next, false);
    else drain();
  }

  function go(steps) {
    if (steps === 0) return;

    if (animating.current) {
      queued.current = Math.max(
        -count,
        Math.min(count, queued.current + steps)
      );
      return;
    }

    animating.current = true;
    moveTo(indexRef.current + steps, true);

    const duration = trackRef.current
      ? parseFloat(getComputedStyle(trackRef.current).transitionDuration) * 1000
      : 0;

    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(settle, (duration || 0) + 50);
  }

  function goToSlide(to) {
    let steps = to - slideNumber(indexRef.current);

    if (steps > count / 2) steps -= count;
    if (steps < -count / 2) steps += count;

    go(steps);
  }

  function onPointerDown(event) {
    if (animating.current) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    startX.current = event.clientX;
    startY.current = event.clientY;
    afterDrag.current = false;

    viewportRef.current?.setPointerCapture(event.pointerId);
    setPaused(true);
  }

  function onPointerMove(event) {
    if (startX.current === null) return;

    const deltaX = event.clientX - startX.current;
    const deltaY = event.clientY - startY.current;

    if (!dragging) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 8) return;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        startX.current = null;
        setOffset(0);
        setPaused(false);
        return;
      }

      setDragging(true);
    }

    setOffset(deltaX);
  }

  function onPointerUp() {
    if (startX.current === null) return;

    const moved = offset;
    const threshold = step * 0.2;

    startX.current = null;
    afterDrag.current = Math.abs(moved) > 8;

    setDragging(false);
    setOffset(0);
    setPaused(false);
    setInstant(false);

    if (moved <= -threshold) go(1);
    else if (moved >= threshold) go(-1);
  }

  function onKeyDown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (event.target.closest("input, textarea, select, [contenteditable]")) {
      return;
    }

    event.preventDefault();
    go(event.key === "ArrowRight" ? 1 : -1);
  }

  const rendered = [...slides, ...slides, ...slides];
  const active = slideNumber(index);

  return (
    <div
      className={`${rootClass} ${className}`.trim()}
      style={{ ...tokens, ...style }}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      data-dragging={dragging || undefined}
      data-instant={instant || undefined}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <button
        className={prevClass}
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
      />

      <div
        ref={viewportRef}
        className={viewportClass}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClickCapture={(event) => {
          if (!afterDrag.current) return;
          event.preventDefault();
          event.stopPropagation();
          afterDrag.current = false;
        }}
      >
        <div
          ref={trackRef}
          className={trackClass}
          style={{ transform: `translateX(${-index * step + offset}px)` }}
          onTransitionEnd={(event) => {
            if (event.target === trackRef.current) settle();
          }}
        >
          {rendered.map((slide, position) => {
            const real = position >= count && position < count * 2;

            return (
              <div
                key={position}
                ref={position === count ? slideRef : undefined}
                className={slideClass}
                role="group"
                aria-roledescription="slide"
                aria-label={`${(position % count) + 1} of ${count}`}
                aria-hidden={!real || undefined}
              >
                {slide}
              </div>
            );
          })}
        </div>
      </div>

      <button
        className={nextClass}
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
      />

      {showDots && (
        <div className={dotsClass}>
          {slides.map((_, at) => (
            <button
              key={at}
              className={dotClass}
              type="button"
              aria-label={`Slide ${at + 1} of ${count}`}
              aria-current={at === active}
              onClick={() => goToSlide(at)}
            />
          ))}
        </div>
      )}

      <div className={statusClass} role="status" aria-live="polite">
        {autoplay > 0 ? "" : `Slide ${active + 1} of ${count}`}
      </div>
    </div>
  );
}
