"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { AuroraText } from "@/components/ui/AuroraText";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Text editorial column multiplane parallax scrub
      if (textRef.current) {
        gsap.to(textRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "65% top",
            scrub: 0.35,
            invalidateOnRefresh: true,
          },
          y: -65,
          scale: 0.96,
          opacity: 0,
          filter: "blur(6px)",
          ease: "power2.inOut",
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      id="top"
      className="relative min-h-[94vh] flex items-center pt-28 pb-20 overflow-hidden"
    >
      {/* Hero Foreground Content */}
      <div className="max-w-7xl mx-auto px-6 w-full z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Typography */}
          <div
            ref={textRef}
            className="lg:col-span-7 flex flex-col items-start gap-6"
          >
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-2xs sm:text-xs font-sans text-text-muted shadow-2xs select-none hover:border-primary/30 transition-colors"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-text-main font-semibold">
                AI Systems Engineer
              </span>
              <span>·</span>
              <span>
                LLMOps &amp; Autonomous Agents
              </span>
            </motion.div>

            {/* Heading */}
            <div className="space-y-1">
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="text-text-muted font-sans text-base"
              >
                Hi, I&apos;m
              </motion.p>

              <h1 className="font-display font-bold text-display tracking-tight leading-[0.95]">
                <motion.span
                  initial={{ y: 50, opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{
                    duration: 0.65,
                    delay: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="inline-block"
                >
                  <AuroraText
                    colors={["#e63946", "#ff4d6d", "#9d0208", "#d90429", "#c9184a"]}
                    speed={1.2}
                  >
                    Gagan
                  </AuroraText>
                </motion.span>
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
                className="font-serif italic text-2xl sm:text-3xl text-text-muted font-normal tracking-normal pt-0.5"
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
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-ink text-white font-sans text-sm font-semibold shadow-sm shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 transition-all duration-200 cursor-pointer"
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
                  className="glass-pill inline-flex items-center gap-2 px-6 py-3 rounded-full text-text-main font-sans text-sm font-semibold hover:border-text-main hover:bg-white transition-all duration-200 shadow-2xs cursor-pointer"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column: Unobstructed 3D Gyroscope Stage Zone */}
          <div className="lg:col-span-5 w-full h-[380px] sm:h-[460px] lg:h-[540px] relative hidden lg:flex pointer-events-none select-none" />
        </div>
      </div>

    </section>
  );
}

