"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TELEMETRY_METRICS = [
  { label: "AI SYSTEMS ENGINEER", detail: "LLMOps & AGENTS" },
  { label: "INFERENCE SERVING", detail: "TTFT 24ms · 136 tok/s" },
  { label: "COMPOUND REASONING", detail: "GraphRAG · LangGraph" },
  { label: "KV-CACHE EFFICIENCY", detail: "PagedAttention 99.4%" },
];

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [metricIdx, setMetricIdx] = useState(0);
  const [gyroStage, setGyroStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetricIdx((prev) => (prev + 1) % TELEMETRY_METRICS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleStageChange = (e: Event) => {
      const ce = e as CustomEvent<{ stage: number; holding: boolean }>;
      if (ce.detail) {
        setGyroStage(ce.detail.holding ? ce.detail.stage : 0);
      }
    };
    window.addEventListener("portfolio:gyro-stage-change", handleStageChange);
    return () => {
      window.removeEventListener("portfolio:gyro-stage-change", handleStageChange);
    };
  }, []);

  useGSAP(
    () => {
      gsap.to(textRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "70% top",
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
        y: -45,
        scale: 0.97,
        opacity: 0,
        ease: "none",
      });

      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "140px top",
            scrub: 0.2,
          },
          opacity: 0,
          y: 20,
          ease: "none",
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative min-h-[94vh] flex items-center pt-28 pb-20 overflow-hidden bg-grid-blueprint"
    >
      {/* Hero Foreground Content */}
      <div className="max-w-7xl mx-auto px-6 w-full z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Typography */}
          <div
            ref={textRef}
            className="lg:col-span-7 flex flex-col items-start gap-6"
          >
            {/* Eyebrow badge with dynamic telemetry cycler */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-pill inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-mono text-text-muted shadow-2xs select-none hover:border-primary/30 transition-colors"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-primary font-semibold shrink-0">{"//"}</span>
              <div className="h-4.5 overflow-hidden relative min-w-[210px] sm:min-w-[260px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={metricIdx}
                    initial={{ y: 14, opacity: 0, filter: "blur(2px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    exit={{ y: -14, opacity: 0, filter: "blur(2px)" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-center gap-2 truncate will-change-transform"
                  >
                    <span className="text-text-main font-semibold tracking-tight text-[11px] sm:text-xs">
                      {TELEMETRY_METRICS[metricIdx].label}
                    </span>
                    <span className="text-text-muted text-[10px]">·</span>
                    <span className="text-text-muted text-[11px] truncate">
                      {TELEMETRY_METRICS[metricIdx].detail}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Heading */}
            <div className="space-y-1">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="text-text-muted font-mono text-sm tracking-wide"
              >
                Hi, I&apos;m
              </motion.p>

              <h1 className="font-gued font-bold text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] tracking-tight text-text-main leading-[0.95]">
                {"Gagan".split("").map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ y: 50, opacity: 0, filter: "blur(4px)" }}
                    animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.55,
                      delay: 0.7 + i * 0.065,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 0.45,
                    delay: 1.08,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                  className="text-primary font-bold inline-block origin-bottom"
                >
                  .
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.15 }}
                className="font-serif italic text-2xl sm:text-3xl text-text-muted/90 font-normal tracking-normal pt-0.5"
              >
                Building AI systems that reason, retrieve &amp; act
              </motion.p>
            </div>

            {/* Call to actions with spring micro-interactions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.35 }}
              className="flex flex-wrap items-center gap-4 pt-3"
            >
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Link
                  href="#projects"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-mono text-xs tracking-wide shadow-sm shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-200 cursor-pointer"
                >
                  <span>View Projects</span>
                  <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform duration-200" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Link
                  href="https://github.com/cosmos-127"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-pill inline-flex items-center gap-2 px-6 py-3 rounded-full text-text-main font-mono text-xs hover:border-text-main hover:bg-white transition-all duration-200 shadow-2xs cursor-pointer"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Interactive 3D Gyroscope Stage Zone */}
          <div
            onPointerDown={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent("portfolio:gyro-press-start"));
            }}
            onPointerUp={() => {
              window.dispatchEvent(new CustomEvent("portfolio:gyro-press-end"));
            }}
            onPointerLeave={() => {
              window.dispatchEvent(new CustomEvent("portfolio:gyro-press-end"));
            }}
            className="lg:col-span-5 w-full h-[380px] sm:h-[460px] lg:h-[540px] relative hidden lg:flex flex-col items-center justify-end pb-4 pointer-events-auto cursor-grab active:cursor-grabbing select-none group"
            title="Hold mouse down: Stage 1 (0-3s Ratchet) -> Stage 2 (3-6s Resonant Core) -> Stage 3 (6s+ Turbine Overdrive)"
          >
            {/* Interactive HUD badge indicator - 100% strictly synchronized with 3D canvas stage */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className={`glass-pill px-3.5 py-1.5 rounded-full font-mono text-[11px] flex items-center gap-2 transition-all duration-300 pointer-events-none ${
                gyroStage === 3
                  ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border-purple-400/80 text-purple-700 shadow-[0_0_22px_rgba(168,85,247,0.35),0_0_12px_rgba(6,182,212,0.25)] scale-105 font-bold"
                  : gyroStage === 2
                  ? "bg-amber-400/20 border-amber-400/70 text-amber-700 shadow-[0_0_18px_rgba(251,191,36,0.45)] scale-105 font-bold"
                  : gyroStage === 1
                  ? "bg-primary/20 border-primary/60 text-primary shadow-[0_0_16px_rgba(230,57,70,0.35)] scale-105 font-bold"
                  : "text-text-muted/80 group-hover:text-text-main group-hover:border-primary/40 shadow-2xs"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  gyroStage === 3
                    ? "bg-purple-500 animate-ping"
                    : gyroStage === 2
                    ? "bg-amber-400 animate-ping"
                    : gyroStage === 1
                    ? "bg-primary animate-ping"
                    : "bg-primary/60 animate-pulse"
                }`}
              />
              <span className="tracking-wide flex items-center gap-1.5">
                {gyroStage === 0 ? (
                  <span>HOLD TO SPIN GYRO</span>
                ) : gyroStage === 3 ? (
                  <>
                    <span className="text-purple-600 font-bold">[3/3]</span>
                    <span>STAGE 3 · TURBINE OVERDRIVE</span>
                  </>
                ) : gyroStage === 2 ? (
                  <>
                    <span className="text-amber-600 font-bold">[2/3]</span>
                    <span>STAGE 2 · RESONANT SOLAR CORE</span>
                  </>
                ) : (
                  <>
                    <span className="text-primary font-bold">[1/3]</span>
                    <span>STAGE 1 · RATCHET ACCELERATION</span>
                  </>
                )}
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Editorial Scroll Down Indicator */}
      <motion.div
        ref={scrollIndicatorRef}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.55 }}
        className="absolute bottom-6 left-6 sm:left-12 lg:left-1/2 lg:-translate-x-1/2 z-20 pointer-events-auto"
      >
        <Link
          href="#projects"
          className="group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-pill hover:border-primary/40 text-text-muted hover:text-primary transition-all duration-300 shadow-2xs font-mono text-[11px] animate-float-subtle"
          aria-label="Scroll to projects"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="tracking-wider uppercase font-semibold">Scroll to explore</span>
          <ArrowDown className="w-3 h-3 text-primary group-hover:translate-y-1 transition-transform duration-200" />
        </Link>
      </motion.div>
    </section>
  );
}

