"use client";

import { useRef } from "react";
import { Bot, Zap, Layers, Network, Database, Server } from "lucide-react";
import { StrategyIcon } from "@/components/ui/icons";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TickerStripProps {
  className?: string;
}

const TICKER_ITEMS = [
  { text: "AI ENGINEER @ STRATEGY", icon: StrategyIcon },
  { text: "LLMOps & CONTINUOUS EVALUATION", icon: Zap },
  { text: "AGENTIC FLOWS (ReAct & ReWOO)", icon: Bot },
  { text: "GraphRAG & KNOWLEDGE GRAPHS", icon: Network },
  { text: "LANGGRAPH MULTI-AGENT", icon: Layers },
  { text: "MCP TOOL SERVERS", icon: Server },
  { text: "MODEL SERVING (vLLM)", icon: Zap },
  { text: "TRINO & DATA FEDERATION", icon: Database },
];

export function TickerStrip({ className = "" }: TickerStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Entrance animation on ScrollTrigger
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, y: 18, scale: 0.99 },
          {
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }

      // 2. Velocity skew / scroll reaction
      if (marqueeRef.current) {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const vel = self.getVelocity();
            // Subtle dynamic skew based on scroll velocity (-3deg to +3deg)
            const skew = Math.max(-3, Math.min(3, vel / 400));
            gsap.to(marqueeRef.current, {
              skewX: skew,
              duration: 0.2,
              ease: "power3.out",
              overwrite: "auto",
            });
          },
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden border-y border-white/85 bg-white/40 backdrop-blur-xl py-3.5 select-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] relative will-change-transform ${className}`}
    >
      {/* Subtle top specular sheen highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />
      
      <div
        ref={marqueeRef}
        className="flex w-max animate-marquee will-change-transform"
      >
        <div className="flex items-center gap-10 whitespace-nowrap text-xs font-mono tracking-wider text-text-muted shrink-0 pr-10">
          {TICKER_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`track1-${idx}`}
                className="group/ticker flex items-center gap-3 py-1 px-2 rounded-lg hover:bg-white/80 hover:text-text-main transition-colors duration-200 cursor-default"
              >
                <Icon className="h-3.5 w-3.5 text-primary group-hover/ticker:scale-110 group-hover/ticker:rotate-6 transition-transform duration-200" />
                <span className="group-hover/ticker:text-primary transition-colors duration-200">
                  {item.text}
                </span>
                <span className="text-border-strong font-light ml-2">/</span>
              </div>
            );
          })}
        </div>
        <div
          className="flex items-center gap-10 whitespace-nowrap text-xs font-mono tracking-wider text-text-muted shrink-0 pr-10"
          aria-hidden="true"
        >
          {TICKER_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={`track2-${idx}`}
                className="group/ticker flex items-center gap-3 py-1 px-2 rounded-lg hover:bg-white/80 hover:text-text-main transition-colors duration-200 cursor-default"
              >
                <Icon className="h-3.5 w-3.5 text-primary group-hover/ticker:scale-110 group-hover/ticker:rotate-6 transition-transform duration-200" />
                <span className="group-hover/ticker:text-primary transition-colors duration-200">
                  {item.text}
                </span>
                <span className="text-border-strong font-light ml-2">/</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
