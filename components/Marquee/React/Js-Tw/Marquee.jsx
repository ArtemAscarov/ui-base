import { Fragment, useLayoutEffect, useRef, useState } from "react";

const tokens = {
  "--marquee-color": "#ffffff",
  "--marquee-bg": "#666969",
  "--marquee-height": "160px",
  "--marquee-padding-y": "20px",
  "--marquee-overhang": "50px",
  "--marquee-gap": "64px",
  "--marquee-tilt": "-3deg",
  "--marquee-font-size": "32px",
  "--marquee-font-weight": "700",
  "--marquee-shadow": "0 0 5px 0.5px rgb(130, 128, 130)",
  "--marquee-speed": "60",
  "--marquee-duration": "20s",
};

const rootClass = "group relative w-full min-w-0 h-[var(--marquee-height)]";

const ribbonClass =
  "absolute top-1/2 left-[calc(var(--marquee-overhang)*-1)] w-[calc(100%+var(--marquee-overhang)*2)] py-[var(--marquee-padding-y)] bg-[var(--marquee-bg)] [box-shadow:var(--marquee-shadow)] [transform:translateY(-50%)_rotate(var(--marquee-tilt))] overflow-hidden";

const viewportClass =
  "flex w-max animate-[ui-marquee-scroll_var(--marquee-duration)_linear_infinite] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none";

const groupClass =
  "flex items-center gap-[var(--marquee-gap)] pr-[var(--marquee-gap)]";

const keyframes =
  "@keyframes ui-marquee-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}";

export function Marquee({
  children,
  speed = 60,
  direction = "normal",
  pauseOnHover = true,
  className = "",
  style,
}) {
  const ribbonRef = useRef(null);
  const groupRef = useRef(null);
  const [copies, setCopies] = useState(1);
  const [duration, setDuration] = useState(null);

  useLayoutEffect(() => {
    const ribbon = ribbonRef.current;
    const group = groupRef.current;

    if (!ribbon || !group) return;

    function measure() {
      const passWidth = group.getBoundingClientRect().width / copies;

      if (passWidth <= 0) return;

      const needed = Math.max(1, Math.ceil(ribbon.clientWidth / passWidth));

      setCopies(needed);
      setDuration((needed * passWidth) / speed);
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(ribbon);

    return () => observer.disconnect();
  }, [copies, speed, children]);

  const passes = Array.from({ length: copies }, (_, index) => (
    <Fragment key={index}>{children}</Fragment>
  ));

  const motion = [
    viewportClass,
    direction === "reverse" ? "[animation-direction:reverse]" : "",
    pauseOnHover ? "group-hover:[animation-play-state:paused]" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`${rootClass} ${className}`.trim()}
      style={{
        ...tokens,
        ...style,
        ...(duration ? { "--marquee-duration": `${duration}s` } : null),
      }}
    >
      <style>{keyframes}</style>

      <div className={ribbonClass} ref={ribbonRef}>
        <div className={motion}>
          <div className={groupClass} ref={groupRef}>
            {passes}
          </div>
          <div className={groupClass} aria-hidden="true">
            {passes}
          </div>
        </div>
      </div>
    </div>
  );
}
