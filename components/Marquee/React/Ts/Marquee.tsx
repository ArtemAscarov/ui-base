import { Fragment, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import "./Marquee.css";

export interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: "normal" | "reverse";
  pauseOnHover?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Marquee({
  children,
  speed = 60,
  direction = "normal",
  pauseOnHover = true,
  className = "",
  style,
}: MarqueeProps) {
  const ribbonRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(1);
  const [duration, setDuration] = useState<number | null>(null);

  useLayoutEffect(() => {
    const ribbon = ribbonRef.current;
    const group = groupRef.current;

    if (!ribbon || !group) return;

    function measure() {
      const passWidth = group!.getBoundingClientRect().width / copies;

      if (passWidth <= 0) return;

      const needed = Math.max(1, Math.ceil(ribbon!.clientWidth / passWidth));

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

  return (
    <div
      className={`ui-marquee ${className}`.trim()}
      style={
        {
          ...style,
          ...(duration ? { "--marquee-duration": `${duration}s` } : null),
        } as CSSProperties
      }
      data-direction={direction}
      data-pause-on-hover={pauseOnHover ? undefined : "false"}
    >
      <div className="ui-marquee__ribbon" ref={ribbonRef}>
        <div className="ui-marquee__viewport">
          <div className="ui-marquee__group" ref={groupRef}>
            {passes}
          </div>
          <div className="ui-marquee__group" aria-hidden="true">
            {passes}
          </div>
        </div>
      </div>
    </div>
  );
}
