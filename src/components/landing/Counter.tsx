import * as React from "react";
import { useInView } from "@/hooks/use-in-view";

interface CounterProps {
  /** Target value to count up to. */
  value: number;
  /** Animation duration in ms. */
  duration?: number;
  /** Rendered before the number (e.g. currency). */
  prefix?: string;
  /** Rendered after the number (e.g. "+", "K"). */
  suffix?: string;
}

/**
 * Animated number that counts up from 0 to `value` the first time it is visible.
 */
export function Counter({ value, duration = 1800, prefix = "", suffix = "" }: CounterProps) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [display, setDisplay] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {display.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}
