"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useSpring } from "framer-motion";

export function MouseSpotlight() {
  const [isActive, setIsActive] = useState(false);
  const cursorX = useSpring(-500, { stiffness: 350, damping: 30 });
  const cursorY = useSpring(-500, { stiffness: 350, damping: 30 });
  const hasMoved = useRef(false);

  useEffect(() => {
    // Disable on touch-only devices or reduced-motion preference
    if (typeof window === "undefined") return;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isFinePointer || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!hasMoved.current) {
        hasMoved.current = true;
        cursorX.jump(e.clientX);
        cursorY.jump(e.clientY);
        setIsActive(true);
      } else {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      }
    };

    const handleMouseLeave = () => setIsActive(false);
    const handleMouseEnter = () => {
      if (hasMoved.current) setIsActive(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  if (!isActive) return null;

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="pointer-events-none fixed top-0 left-0 z-30 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/[0.045] to-transparent blur-3xl will-change-transform"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    />
  );
}

