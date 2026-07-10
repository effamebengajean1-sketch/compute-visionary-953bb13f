import * as React from "react";
import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/use-in-view";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Delay in ms before the reveal transition starts. */
  delay?: number;
  as?: "div" | "section" | "li" | "span";
}

/**
 * Wraps children and fades/slides them in the first time they scroll into view.
 * Respects prefers-reduced-motion via the `.reveal` utility.
 */
export function Reveal({ delay = 0, as = "div", className, style, children, ...rest }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Tag = as as "div";

  return (
    <Tag
      ref={ref}
      className={cn("reveal", inView && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
