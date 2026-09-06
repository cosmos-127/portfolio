"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { playTick } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface SectionMarker {
  id: string;
  code: string;
  label: string;
}

const SECTION_MARKERS: SectionMarker[] = [
  { id: "top", code: "00", label: "OVERVIEW" },
  { id: "projects", code: "01", label: "PROJECTS" },
  { id: "skills", code: "02", label: "SKILLS" },
  { id: "writing", code: "03", label: "WRITING" },
  { id: "about", code: "04", label: "ABOUT" },
  { id: "contact", code: "05", label: "CONTACT" },
];

export function SectionHUD() {
  const [activeId, setActiveId] = useState("top");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const lenis = useLenis();
  const hudRef = useRef<HTMLDivElement>(null);

  // Track active section via scroll position
  const updateActiveSection = useCallback(() => {
    const scrollY = window.scrollY;
    if (scrollY < 180) {
      setActiveId("top");
      return;
    }

    const sections = SECTION_MARKERS.map((s) => s.id);
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.45) {
          setActiveId(sections[i]);
          break;
        }
      }
    }
  }, []);

  useLenis(() => {
    updateActiveSection();
  });

  useEffect(() => {
    // Show HUD after brief initial entrance
    const timer = setTimeout(() => setIsVisible(true), 1200);
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", updateActiveSection);
    };
  }, [updateActiveSection]);

  const scrollToSection = (id: string) => {
    playTick();
    const target = id === "top" ? 0 : `#${id}`;
    if (lenis) {
      lenis.scrollTo(target, { offset: -60, duration: 1.1 });
    } else {
      const el = id === "top" ? document.body : document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      ref={hudRef}
      aria-label="Section telemetry navigation"
      className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end pointer-events-auto select-none"
    >
      <div className="relative py-3 flex flex-col items-center gap-4">
        {/* Subtle vertical spine hairline */}
        <div className="absolute top-2 bottom-2 right-[9.5px] w-px bg-border-light/70 -z-10 pointer-events-none" />

        {SECTION_MARKERS.map((marker) => {
          const isActive = activeId === marker.id;
          const isHovered = hoveredId === marker.id;

          return (
            <div
              key={marker.id}
              className="relative flex items-center justify-end group cursor-pointer"
              onMouseEnter={() => {
                setHoveredId(marker.id);
                playTick();
              }}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => scrollToSection(marker.id)}
            >
              {/* Tooltip Label Pill */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 8, scale: 0.95 }}
                    animate={{ opacity: 1, x: -8, scale: 1 }}
                    exit={{ opacity: 0, x: 6, scale: 0.95 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-6 pointer-events-none whitespace-nowrap glass-pill px-2.5 py-1 rounded-full text-[10px] font-mono shadow-md flex items-center gap-1.5"
                  >
                    <span className="text-primary font-bold">[{marker.code}]</span>
                    <span className="text-text-main font-semibold tracking-wider">{marker.label}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Node Button Indicator */}
              <button
                type="button"
                className="relative w-5 h-5 flex items-center justify-center p-0 cursor-pointer focus:outline-hidden"
                aria-label={`Jump to ${marker.label}`}
                title={`Jump to ${marker.label}`}
              >
                {/* Active Glowing Beacon with LayoutId Glide */}
                {isActive && (
                  <motion.div
                    layoutId="sectionHudActiveBeacon"
                    className="absolute w-4 h-4 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center shadow-[0_0_10px_rgba(230,57,70,0.35)]"
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  </motion.div>
                )}

                {/* Inactive Static Dot */}
                {!isActive && (
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-200",
                      isHovered
                        ? "bg-primary scale-125 shadow-2xs"
                        : "bg-border-strong/70 group-hover:bg-text-muted"
                    )}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
