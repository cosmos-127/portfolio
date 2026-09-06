"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GLYPHS = "01XZ#%&*<>/[]{}+=";

const TOTAL_DURATION = 3500; // Exactly 3.5 seconds total loading duration
const STEP_DURATION = TOTAL_DURATION / 3; // Exactly 1166.6ms per step (equally divided)

const STEPS = [
  "Initializing neural engine...",
  "Loading 3D interactive space...",
  "Experience ready · Welcome",
];

/**
 * Terminal Scramble Effect:
 * Scrambles through random terminal/hexadecimal glyphs for ~150ms
 * then resolves character-by-character into clean English.
 */
function ScrambleText({ text }: { text: string }) {
  const [resolvedIndex, setResolvedIndex] = useState(0);
  const [scrambleChars, setScrambleChars] = useState<string[]>([]);

  useEffect(() => {
    let animId: number;
    const scrambleDuration = 150; // 150ms of pure chaotic glyph scrambling
    const resolveDuration = 200; // 200ms character-by-character resolution
    const startTime = performance.now();

    const update = (now: number) => {
      const elapsed = now - startTime;

      // Generate random glyphs for the characters
      const randoms = text.split("").map((c) => {
        if (c === " ") return " ";
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      });
      setScrambleChars(randoms);

      if (elapsed < scrambleDuration) {
        setResolvedIndex(0);
        animId = requestAnimationFrame(update);
      } else {
        const resolveProgress = Math.min(
          1,
          (elapsed - scrambleDuration) / resolveDuration
        );
        const count = Math.floor(resolveProgress * text.length);
        setResolvedIndex(count);

        if (resolveProgress < 1) {
          animId = requestAnimationFrame(update);
        } else {
          setResolvedIndex(text.length);
        }
      }
    };

    animId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [text]);

  return (
    <span className="font-mono text-xs sm:text-sm tracking-tight text-center select-none tabular-nums inline-block">
      {text.split("").map((char, i) => {
        if (char === " ") return " ";
        const isResolved = i < resolvedIndex;
        return (
          <span
            key={i}
            className={
              isResolved
                ? "text-text-main font-semibold transition-colors duration-150"
                : "text-primary/75 font-mono"
            }
          >
            {isResolved ? char : (scrambleChars[i] || GLYPHS[0])}
          </span>
        );
      })}
    </span>
  );
}

export function Preloader() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [maxRadius, setMaxRadius] = useState(1500);
  const hasTriggeredRef = useRef(false);

  // Calculate maximum screen diagonal to ensure the expanding circle uncovers everything
  useEffect(() => {
    const updateRadius = () => {
      const diagonal = Math.hypot(window.innerWidth, window.innerHeight);
      setMaxRadius(Math.ceil(diagonal / 2) + 120);
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  // Lock scroll while preloader is active
  useEffect(() => {
    if (!isDone) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("portfolio:preloader-done"));
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isDone]);

  // Smooth progress increment across the 3 equal intervals
  useEffect(() => {
    if (isDone || isExpanding) return;

    let startTime: number | null = null;
    let animFrame: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const linearProgress = Math.min(1, elapsed / TOTAL_DURATION);

      // Linear progress strictly synchronized with time
      const currentProgress = Math.min(100, Math.round(linearProgress * 100));
      setProgress(currentProgress);

      // Strictly equal division into 3 intervals (~1167ms each)
      const currentStep = Math.min(STEPS.length - 1, Math.floor(elapsed / STEP_DURATION));
      setStepIndex(currentStep);

      if (linearProgress < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        setProgress(100);
        setStepIndex(STEPS.length - 1);
        triggerCompletion();
      }
    };

    animFrame = requestAnimationFrame(step);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        triggerCompletion(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDone, isExpanding]);

  const triggerCompletion = (immediate = false) => {
    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    setProgress(100);
    setStepIndex(STEPS.length - 1);

    if (immediate) {
      setIsExpanding(true);
      setTimeout(() => {
        setIsDone(true);
      }, 350);
      return;
    }

    // Comfortable 450ms pause at 100% so the user reads the final welcome state
    setTimeout(() => {
      setIsExpanding(true);
    }, 450);
  };

  if (isDone) return null;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none select-none">
      {/* 1. SVG Cutout Mask: Pure white background with expanding center aperture */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto"
        preserveAspectRatio="none"
      >
        <defs>
          <mask id="iris-preloader-mask">
            {/* White area remains visible */}
            <rect width="100%" height="100%" fill="white" />
            {/* Expanding black circle cuts out a transparent hole through to the website */}
            <motion.circle
              cx="50%"
              cy="50%"
              initial={{ r: 0 }}
              animate={isExpanding ? { r: maxRadius } : { r: 0 }}
              transition={{
                duration: 0.85,
                ease: [0.76, 0, 0.24, 1], // Luxury cinematic acceleration
              }}
              onAnimationComplete={() => {
                if (isExpanding) {
                  setIsDone(true);
                }
              }}
              fill="black"
            />
          </mask>
        </defs>

        {/* Solid white canvas with the iris cutout mask applied */}
        <rect
          width="100%"
          height="100%"
          fill="#ffffff"
          mask="url(#iris-preloader-mask)"
        />
      </svg>

      {/* 2. Soft Crimson Ambient Glow & Blueprint Grid */}
      <motion.div
        animate={{ opacity: isExpanding ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute inset-0 pointer-events-none bg-grid-blueprint"
      >
        {/* Soft centered crimson radial gradient matching the site's accent */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(230, 57, 70, 0.08) 0%, rgba(230, 57, 70, 0.02) 45%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* 3. Minimal Header & Skip Controls */}
      <motion.div
        animate={{ opacity: isExpanding ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between text-xs font-mono z-10 pointer-events-auto"
      >
        <div className="inline-flex items-center gap-2 text-text-muted">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-text-main font-semibold tracking-wider">
            GAGAN
          </span>
          <span className="text-border-strong">/</span>
          <span className="text-text-muted text-[11px] tracking-wide">
            SYSTEM BOOT
          </span>
        </div>

        <button
          onClick={() => triggerCompletion(true)}
          className="glass-pill px-3 py-1 rounded-full text-[11px] font-mono text-text-muted hover:text-primary transition-colors cursor-pointer flex items-center gap-1.5"
          title="Press Escape to skip preloader"
        >
          <span>ESC</span>
          <span className="text-text-muted/60">·</span>
          <span>SKIP</span>
        </button>
      </motion.div>

      {/* 4. Center Content (Pulsing Dot, Text Sequence, Hairline Progress) */}
      <motion.div
        animate={{ opacity: isExpanding ? 0 : 1, scale: isExpanding ? 0.95 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 pointer-events-none"
      >
        <div className="flex flex-col items-center gap-6 max-w-sm w-full">
          {/* Subtle breathing aura with central crimson pulse dot */}
          <div className="relative flex items-center justify-center w-12 h-12">
            <span className="absolute w-10 h-10 rounded-full bg-primary/10 animate-ping opacity-60" />
            <span className="relative w-3 h-3 rounded-full bg-primary shadow-[0_0_14px_rgba(230,57,70,0.8)]" />
          </div>

          {/* Animated step text with in-place terminal glyph scramble */}
          <div className="h-7 relative flex items-center justify-center w-full">
            <ScrambleText key={STEPS[stepIndex]} text={STEPS[stepIndex]} />
          </div>

          {/* Minimal hairline progress track */}
          <div className="w-56 sm:w-64 flex flex-col gap-2">
            <div className="w-full h-[2px] bg-neutral-200/90 rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(230,57,70,0.5)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.1 }}
              />
            </div>

            {/* Telemetry counter */}
            <div className="flex items-center justify-between text-[11px] font-mono text-text-muted select-none">
              <span className="text-text-muted/70 tracking-widest text-[10px]">
                {progress < 100 ? "CALIBRATING" : "READY"}
              </span>
              <span className="font-semibold text-text-main tabular-nums">
                {String(progress).padStart(2, "0")}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. Expanding Glowing Perimeter Ring */}
      <AnimatePresence>
        {isExpanding && (
          <motion.div
            initial={{ width: 0, height: 0, opacity: 0 }}
            animate={{
              width: maxRadius * 2,
              height: maxRadius * 2,
              opacity: [0, 0.9, 0.7, 0],
            }}
            transition={{
              duration: 0.85,
              ease: [0.76, 0, 0.24, 1],
              opacity: { times: [0, 0.12, 0.85, 1], duration: 0.85 },
            }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "9999px",
              border: "1.5px solid rgba(230, 57, 70, 0.55)",
              boxShadow: "0 0 35px rgba(230, 57, 70, 0.35)",
              pointerEvents: "none",
              zIndex: 100000,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
