"use client";

import { Children, useEffect, useLayoutEffect, useRef, useState } from "react";

import "./Carousel.css";

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
      className={`ui-carousel ${className}`.trim()}
      style={style}
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
        className="ui-carousel__button ui-carousel__button--prev"
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
      />

      <div
        ref={viewportRef}
        className="ui-carousel__viewport"
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
          className="ui-carousel__track"
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
                className="ui-carousel__slide"
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
        className="ui-carousel__button ui-carousel__button--next"
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
      />

      {showDots && (
        <div className="ui-carousel__dots">
          {slides.map((_, at) => (
            <button
              key={at}
              className="ui-carousel__dot"
              type="button"
              aria-label={`Slide ${at + 1} of ${count}`}
              aria-current={at === active}
              onClick={() => goToSlide(at)}
            />
          ))}
        </div>
      )}

      <div className="ui-carousel__status" role="status" aria-live="polite">
        {autoplay > 0 ? "" : `Slide ${active + 1} of ${count}`}
      </div>
    </div>
  );
}
