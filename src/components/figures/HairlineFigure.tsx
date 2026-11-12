"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { HL } from "@/lib/hairline/kernel";
import { cn } from "@/lib/utils";

export interface HairlineFigureDef {
  name: string;
  means: string;
  range: number[];
  tour: (number[] | null)[];
  mount: (
    host: { stage: HTMLElement; svg: SVGSVGElement; read: HTMLElement },
    value: number
  ) => { set: (value: number) => void; destroy: () => void };
}

// The engine's only highlight is its bright stroke: point it at the site's red.
const ACCENT = { "--hairline-hi": "var(--primary)" } as CSSProperties;

/**
 * Hosts one Hairline figure: an isometric line drawing that answers the pointer.
 * `play` walks the figure's own tour with an unseen pointer, which gives way to a real one.
 */
export function HairlineFigure({
  figure,
  label,
  play = false,
  className,
  children,
}: {
  figure: HairlineFigureDef;
  label: string;
  play?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const readRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const read = readRef.current;
    if (!stage || !read) return;
    HL.inject(document);
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    const handle = figure.mount({ stage, svg, read }, figure.range[1]);
    return () => {
      handle.destroy();
      svg.remove();
    };
  }, [figure]);

  useEffect(() => {
    if (!play || !stageRef.current) return;
    const lap = HL.tour(stageRef.current, figure.tour);
    return () => lap.stop();
  }, [figure, play]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Taller than its slot: the 400 × 320 frame has margins the card has no room for. */}
      <div
        ref={stageRef}
        data-hairline={figure.name}
        data-hairline-theme="light"
        role="img"
        aria-label={figure.means}
        className="absolute left-1/2 top-1/2 h-[140%] -translate-x-1/2 -translate-y-1/2"
        style={ACCENT}
      />
      {children}
      <span
        aria-hidden="true"
        className="absolute bottom-0 right-0 font-mono text-2xs text-text-muted pointer-events-none"
      >
        {label} · <span ref={readRef} className="text-primary font-semibold">rest</span>
      </span>
    </div>
  );
}
