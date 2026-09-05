"use client";

import { useEffect, useState, useRef, useSyncExternalStore, useCallback } from "react";
import { motion, useSpring, AnimatePresence } from "framer-motion";

type CursorMode = "default" | "pointer" | "view" | "read" | "copy" | "text" | "hidden";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

function subscribePointerSupport(callback: () => void) {
  const query = window.matchMedia("(pointer: fine)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getPointerSupportSnapshot() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getPointerSupportServerSnapshot() {
  return false;
}

export function CustomCursor() {
  const isFinePointer = useSyncExternalStore(
    subscribePointerSupport,
    getPointerSupportSnapshot,
    getPointerSupportServerSnapshot
  );

  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // High-precision springs
  // Inner dot: ultra-responsive zero-lag tracking
  const dotX = useSpring(-100, { stiffness: 1400, damping: 55 });
  const dotY = useSpring(-100, { stiffness: 1400, damping: 55 });

  // Outer ring / pill: organic smooth follow with natural inertia
  const ringX = useSpring(-100, { stiffness: 440, damping: 32 });
  const ringY = useSpring(-100, { stiffness: 440, damping: 32 });

  const activeGlowCardRef = useRef<HTMLElement | null>(null);
  const pointerPosRef = useRef({ x: -100, y: -100 });

  const addRipple = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev.slice(-3), { id, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 550);
  }, []);

  useEffect(() => {
    if (!isFinePointer) return;

    let hasAddedBodyClass = false;
    let isInitialized = false;

    const handlePointerMove = (e: PointerEvent) => {
      // If a touch event was received, hide cursor gracefully
      if (e.pointerType === "touch") {
        setIsVisible(false);
        if (hasAddedBodyClass) {
          document.body.classList.remove("custom-cursor-active");
          hasAddedBodyClass = false;
        }
        return;
      }

      if (!hasAddedBodyClass) {
        document.body.classList.add("custom-cursor-active");
        hasAddedBodyClass = true;
      }

      const x = e.clientX;
      const y = e.clientY;
      pointerPosRef.current = { x, y };

      if (!isInitialized) {
        isInitialized = true;
        dotX.jump(x);
        dotY.jump(y);
        ringX.jump(x);
        ringY.jump(y);
      } else {
        dotX.set(x);
        dotY.set(y);
      }

      setIsVisible(true);

      // 1. Delegated mouse-tracking border sheen for .glow-card elements
      const target = e.target as HTMLElement | null;
      const glowCard = target?.closest?.(".glow-card") as HTMLElement | null;

      if (glowCard) {
        const rect = glowCard.getBoundingClientRect();
        glowCard.style.setProperty("--glow-x", `${x - rect.left}px`);
        glowCard.style.setProperty("--glow-y", `${y - rect.top}px`);
        glowCard.style.setProperty("--glow-opacity", "1");
        activeGlowCardRef.current = glowCard;
      } else if (activeGlowCardRef.current) {
        activeGlowCardRef.current.style.setProperty("--glow-opacity", "0");
        activeGlowCardRef.current = null;
      }

      // 2. Magnetic Attraction & Contextual Cursor Mode Detection
      if (!target) return;

      // Check explicit data-cursor overrides
      const cursorTarget = target.closest("[data-cursor]") as HTMLElement | null;
      if (cursorTarget) {
        const customMode = cursorTarget.getAttribute("data-cursor") as CursorMode;
        setMode(customMode);
        setCustomLabel(cursorTarget.getAttribute("data-cursor-label") || "");

        // Magnetic attraction for explicit data-cursor pills/buttons
        const rect = cursorTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const pull = 0.25;
        ringX.set(x + (centerX - x) * pull);
        ringY.set(y + (centerY - y) * pull);
        return;
      }

      // Check interactive links, buttons, inputs
      const interactive = target.closest("a, button, [role='button'], input, textarea, select, .cursor-pointer");
      if (interactive) {
        setMode("pointer");
        setCustomLabel("");

        // Magnetic snap towards center of interactive button/link
        const rect = interactive.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const pull = 0.22;
        ringX.set(x + (centerX - x) * pull);
        ringY.set(y + (centerY - y) * pull);
        return;
      }

      // Check headings / text focus
      const isHeading = target.closest("h1, h2");
      if (isHeading) {
        setMode("text");
        setCustomLabel("");
        ringX.set(x);
        ringY.set(y);
        return;
      }

      // Default state
      setMode("default");
      setCustomLabel("");
      ringX.set(x);
      ringY.set(y);
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setIsPressed(true);
      addRipple(e.clientX, e.clientY);
    };

    const handlePointerUp = () => setIsPressed(false);

    const handleMouseLeaveWindow = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        setIsVisible(false);
        if (activeGlowCardRef.current) {
          activeGlowCardRef.current.style.setProperty("--glow-opacity", "0");
          activeGlowCardRef.current = null;
        }
      }
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);

    return () => {
      document.body.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
    };
  }, [isFinePointer, dotX, dotY, ringX, ringY, addRipple]);

  if (!isFinePointer) return null;

  const isExpandedPill = mode === "view" || mode === "read" || mode === "copy";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Dynamic Click Ripples */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border border-primary/40"
          initial={{
            x: ripple.x,
            y: ripple.y,
            width: 12,
            height: 12,
            scale: 0.8,
            opacity: 0.6,
          }}
          animate={{
            scale: 3.5,
            opacity: 0,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      ))}

      {/* 1. Fast Precision Center Dot */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary z-20 pointer-events-none shadow-[0_0_8px_rgba(230,57,70,0.6)]"
        style={{
          x: dotX,
          y: dotY,
        }}
        animate={{
          scale: isExpandedPill ? 0 : mode === "text" ? 0.7 : isPressed ? 0.75 : 1,
          opacity: isExpandedPill ? 0 : 1,
          width: mode === "text" ? 2 : 6,
          height: mode === "text" ? 18 : 6,
          borderRadius: mode === "text" ? 1 : 9999,
        }}
        transition={{ duration: 0.12, ease: "easeOut" }}
      />

      {/* 2. Fluid Follower Ring / Morphing Pill */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center font-mono text-[10px] tracking-wider z-10 select-none backdrop-blur-xs"
        style={{
          x: ringX,
          y: ringY,
        }}
        animate={{
          width:
            mode === "view" || mode === "read"
              ? 90
              : mode === "copy"
              ? 82
              : mode === "pointer"
              ? 46
              : mode === "text"
              ? 0
              : 32,
          height:
            mode === "view" || mode === "read" || mode === "copy"
              ? 34
              : mode === "pointer"
              ? 46
              : mode === "text"
              ? 0
              : 32,
          borderRadius: 9999,
          scale: isPressed ? 0.92 : 1,
          backgroundColor: isExpandedPill
            ? "rgba(255, 255, 255, 0.94)"
            : mode === "pointer"
            ? "rgba(230, 57, 70, 0.08)"
            : "rgba(230, 57, 70, 0.02)",
          borderColor: isExpandedPill
            ? "rgba(230, 57, 70, 0.65)"
            : mode === "pointer"
            ? "rgba(230, 57, 70, 0.5)"
            : "rgba(230, 57, 70, 0.32)",
          borderWidth: 1,
          boxShadow: isExpandedPill
            ? "0 10px 28px -4px rgba(230, 57, 70, 0.22), 0 2px 8px rgba(0,0,0,0.06)"
            : mode === "pointer"
            ? "0 0 18px rgba(230, 57, 70, 0.22)"
            : "0 0 10px rgba(230, 57, 70, 0.08)",
          opacity: mode === "text" ? 0 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 420,
          damping: 28,
        }}
      >
        <AnimatePresence mode="wait">

          {(mode === "view" || mode === "read") && (
            <motion.span
              key="view-read"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="text-text-main font-bold flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-primary font-semibold">{customLabel || (mode === "view" ? "VIEW ↗" : "READ ↗")}</span>
            </motion.span>
          )}

          {mode === "copy" && (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="text-primary font-bold flex items-center gap-1"
            >
              <span>{customLabel || "COPY 📋"}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
