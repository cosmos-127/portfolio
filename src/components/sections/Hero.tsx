"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

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
        ease: "power2.out",
      });
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
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono text-text-muted shadow-2xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-primary font-semibold">{"//"}</span>
              <span>AI ENGINEER · LLMOps & AGENTS</span>
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
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
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
                    duration: 0.4,
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

            {/* Call to actions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.35 }}
              className="flex flex-wrap items-center gap-4 pt-3"
            >
              <Link
                href="#projects"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-mono text-xs tracking-wide hover:bg-primary/90 shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all duration-200"
              >
                <span>View Projects</span>
                <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
              </Link>

              <Link
                href="https://github.com/cosmos-127"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-pill inline-flex items-center gap-2 px-6 py-3 rounded-full text-text-main font-mono text-xs hover:border-text-main hover:bg-white transition-all duration-200 shadow-2xs"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Open spatial area for 3D Neural Tensor Lattice */}
          <div
            className="lg:col-span-5 w-full h-[380px] sm:h-[460px] lg:h-[540px] relative pointer-events-none hidden lg:block"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}

