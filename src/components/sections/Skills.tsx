"use client";

import { useRef } from "react";
import { Bot, Network, Zap, Cpu, Sparkles } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TextScramble } from "@/components/ui/TextScramble";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface SkillGroup {
  id: string;
  code: string;
  category: string;
  title: string;
  description: string;
  icon: typeof Bot;
  skills: string[];
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "agents",
    code: "AGNT",
    category: "AGENTIC REASONING",
    title: "Autonomous Agents",
    description: "Compound multi-agent orchestration, self-reflection loops, and deterministic goal convergence.",
    icon: Bot,
    skills: [
      "LangGraph",
      "ReWOO & ReAct Workflows",
      "Multi-Agent Consensus",
      "Self-Reflection Loops",
    ],
  },
  {
    id: "rag",
    code: "RAGX",
    category: "KNOWLEDGE SYSTEMS",
    title: "GraphRAG & Retrieval",
    description: "Hybrid knowledge graphs and vector search eliminating chunk fragmentation and hallucinations.",
    icon: Network,
    skills: [
      "GraphRAG",
      "Neo4j Knowledge Graphs",
      "Hybrid Vector Search",
      "Qdrant / Pinecone",
    ],
  },
  {
    id: "serving",
    code: "LLMO",
    category: "SYSTEMS & LLMOPS",
    title: "Inference & Serving",
    description: "High-throughput model serving, KV-cache tuning, latency profiling, and production telemetry.",
    icon: Zap,
    skills: [
      "vLLM Production Serving",
      "FastAPI & Docker",
      "Quantization & TTFT Tuning",
      "LLMOps Telemetry",
    ],
  },
  {
    id: "tools",
    code: "FEDR",
    category: "PROTOCOLS & DATA",
    title: "Tooling & Federation",
    description: "Standardized tool protocols, strict schemas, zero-copy serialization, and federated queries.",
    icon: Cpu,
    skills: [
      "Model Context Protocol (MCP)",
      "Structured Outputs",
      "Trino SQL Federation",
      "Python AsyncIO Concurrency",
    ],
  },
];

export function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const horizontalDividerRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Stately entrance for the section header
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 30, filter: "blur(8px)" },
          {
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            ease: "power3.out",
            clearProps: "transform,filter",
          }
        );
      }

      // 2. Animate the top architectural datum line drawing across
      if (horizontalDividerRef.current) {
        gsap.fromTo(
          horizontalDividerRef.current,
          { scaleX: 0, opacity: 0 },
          {
            scrollTrigger: {
              trigger: horizontalDividerRef.current,
              start: "top 84%",
              toggleActions: "play none none reverse",
            },
            scaleX: 1,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }

      // 3. Staggered reveal for columns directly on the canvas
      if (columnsRef.current) {
        const columns = Array.from(columnsRef.current.children);
        
        columns.forEach((col, i) => {
          const content = col.querySelector(".column-content");
          const verticalDivider = col.querySelector(".column-divider");
          const skillRows = col.querySelectorAll(".skill-row");

          // Animate the vertical hairline divider drawing down
          if (verticalDivider) {
            gsap.fromTo(
              verticalDivider,
              { scaleY: 0, opacity: 0 },
              {
                scrollTrigger: {
                  trigger: columnsRef.current,
                  start: "top 80%",
                  toggleActions: "play none none reverse",
                },
                scaleY: 1,
                opacity: 1,
                duration: 0.8,
                delay: i * 0.1,
                ease: "power3.out",
                clearProps: "transform,opacity",
              }
            );
          }

          // Animate the column content sliding up
          if (content) {
            gsap.fromTo(
              content,
              { opacity: 0, y: 36, filter: "blur(6px)" },
              {
                scrollTrigger: {
                  trigger: columnsRef.current,
                  start: "top 80%",
                  toggleActions: "play none none reverse",
                },
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.75,
                delay: i * 0.12,
                ease: "power3.out",
                clearProps: "transform,filter",
              }
            );
          }

          // Micro-cascade for skill items inside each column
          if (skillRows.length > 0) {
            gsap.fromTo(
              skillRows,
              { opacity: 0, x: -10 },
              {
                scrollTrigger: {
                  trigger: columnsRef.current,
                  start: "top 78%",
                  toggleActions: "play none none reverse",
                },
                opacity: 1,
                x: 0,
                stagger: 0.05,
                duration: 0.5,
                delay: 0.2 + i * 0.12,
                ease: "power2.out",
                clearProps: "transform,opacity",
              }
            );
          }
        });
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-28 md:py-36 bg-transparent section-divider-shimmer relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header: Open Editorial Canvas Layout */}
        <div
          ref={headerRef}
          className="mb-12 md:mb-16"
        >
          <div>
            <div className="flex items-center gap-2.5 text-xs font-mono text-primary font-bold tracking-widest uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <TextScramble text="CORE SKILLS & TECHNICAL STACK" />
            </div>
            <h2 className="font-gued font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-text-main tracking-tight leading-[1.12]">
              Technical skills & <span className="font-serif italic font-normal text-primary tracking-normal">architecture</span><span className="text-primary font-bold">.</span>
            </h2>
          </div>
        </div>

        {/* Top Architectural Datum Rail drawing horizontally across */}
        <div
          ref={horizontalDividerRef}
          className="w-full h-px bg-gradient-to-r from-transparent via-border-strong to-transparent mb-10 origin-left"
        />

        {/* Canvas-Native Architectural Matrix: Open Columns Directly on the Background Plane */}
        <div
          ref={columnsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 relative"
        >
          {SKILL_GROUPS.map((group, idx) => {
            const Icon = group.icon;
            return (
              <div
                key={group.id}
                className="relative lg:px-6 xl:px-8 flex flex-col justify-between"
              >
                {/* Vertical Hairline Divider Guide between columns on Desktop */}
                {idx > 0 && (
                  <div
                    className="column-divider hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-border-strong via-border-light to-transparent origin-top pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                {/* Column Content directly on canvas */}
                <div className="column-content flex flex-col justify-between h-full">
                  <div>
                    {/* Top Category Pill */}
                    <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-border-light/60 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-text-muted text-[11px] tracking-widest uppercase font-semibold">
                          {group.category}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-surface border border-border-light text-text-muted hover:text-primary hover:border-primary/40 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Category Title */}
                    <h3 className="font-gued font-bold text-xl text-text-main tracking-tight mb-2">
                      {group.title}
                    </h3>

                    {/* Architectural Synopsis directly on canvas */}
                    <p className="font-sans text-xs text-text-muted leading-relaxed mb-6 min-h-[36px]">
                      {group.description}
                    </p>

                    {/* Direct Capability Rows on Canvas Plane */}
                    <ul className="flex flex-col gap-2 mb-8">
                      {group.skills.map((skill) => (
                        <li
                          key={skill}
                          className="skill-row group/skill relative flex items-center py-2 px-2.5 -mx-2.5 rounded-lg transition-all duration-200 hover:bg-white/80 hover:shadow-2xs cursor-default"
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Micro Indicator Dot */}
                            <span className="w-1.5 h-1.5 rounded-full bg-border-strong group-hover/skill:bg-primary group-hover/skill:scale-125 transition-all duration-200 shrink-0" />
                            <span className="text-sm font-semibold text-text-main group-hover/skill:text-primary transition-colors duration-200">
                              {skill}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Architectural Summary Strip */}
        <div className="mt-14 pt-6 border-t border-border-light/60 flex items-center justify-between gap-4 font-mono text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-text-main font-semibold">Full-Stack AI Engineering:</span>
            <span>From low-level vLLM kernel serving to high-level multi-agent reflection loops.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
