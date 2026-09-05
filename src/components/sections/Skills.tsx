"use client";

import { useRef } from "react";
import { Bot, Network, Zap, Cpu } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface SkillItem {
  name: string;
}

interface SkillGroup {
  number: string;
  category: string;
  title: string;
  icon: typeof Bot;
  skills: SkillItem[];
}

const SKILL_GROUPS: SkillGroup[] = [
  {
    number: "01",
    category: "AGENTIC REASONING",
    title: "Autonomous Agents",
    icon: Bot,
    skills: [
      { name: "LangGraph" },
      { name: "ReWOO & ReAct" },
      { name: "Multi-Agent Consensus" },
      { name: "Self-Reflection Loops" },
    ],
  },
  {
    number: "02",
    category: "KNOWLEDGE SYSTEMS",
    title: "GraphRAG & Retrieval",
    icon: Network,
    skills: [
      { name: "GraphRAG" },
      { name: "Neo4j Knowledge Graphs" },
      { name: "Hybrid Vector Search" },
      { name: "Qdrant / Pinecone" },
    ],
  },
  {
    number: "03",
    category: "SYSTEMS & LLMOPS",
    title: "Inference & Serving",
    icon: Zap,
    skills: [
      { name: "vLLM Production Serving" },
      { name: "FastAPI & Docker" },
      { name: "Quantization & TTFT Tuning" },
      { name: "LLMOps Telemetry" },
    ],
  },
  {
    number: "04",
    category: "PROTOCOLS & DATA",
    title: "Tooling & Federation",
    icon: Cpu,
    skills: [
      { name: "Model Context Protocol (MCP)" },
      { name: "Structured Outputs (Pydantic)" },
      { name: "Trino SQL Federation" },
      { name: "Python AsyncIO" },
    ],
  },
];

export function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 22 },
          {
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            clearProps: "transform",
          }
        );
      }

      if (cardsRef.current) {
        const columns = Array.from(cardsRef.current.children);
        gsap.fromTo(
          columns,
          { opacity: 0, y: 28 },
          {
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 82%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.12,
            ease: "power3.out",
            clearProps: "transform",
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-28 md:py-36 bg-transparent section-divider-shimmer relative"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-widest uppercase mb-3">
              <span>[02]</span>
              <span className="w-8 h-px bg-primary/40" />
              <span>{"//"} SKILLS</span>
            </div>
            <h2 className="font-gued font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-text-main tracking-tight leading-[1.12]">
              What I <span className="font-serif italic font-normal text-primary tracking-normal">work with</span><span className="text-primary font-bold">.</span>
            </h2>
          </div>
        </div>

        {/* Refined Glassmorphic Capabilities Grid with Mouse-Tracking Sheen */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 xl:gap-8">
          {SKILL_GROUPS.map((group) => {
            const Icon = group.icon;
            return (
              <div
                key={group.number}
                className="group relative flex flex-col glass-card glass-card-hover glow-card rounded-2xl p-6 sm:p-7 justify-between overflow-hidden"
              >
                {/* Subtle top specular sheen highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />

                <div>
                  {/* Glassmorphic Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/60 group-hover:border-primary/30 transition-colors duration-300">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-primary font-bold">[{group.number}]</span>
                      <span className="text-text-muted/90 text-[11px] tracking-wider uppercase font-medium">
                        {group.category}
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/60 border border-white/80 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-300">
                      <Icon className="w-3.5 h-3.5 text-text-muted group-hover:text-primary group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                    </div>
                  </div>

                  <h3 className="font-sans text-lg font-bold text-text-main tracking-tight mb-5 group-hover:text-primary transition-colors duration-200">
                    {group.title}
                  </h3>

                  {/* Capability Rows with subtle interactive glass pills */}
                  <ul className="flex flex-col gap-3">
                    {group.skills.map((skill) => (
                      <li
                        key={skill.name}
                        className="group/item flex items-center gap-2 p-2 -mx-2 rounded-xl transition-all duration-200 hover:bg-white/60 hover:shadow-2xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/item:bg-primary group-hover/item:scale-125 transition-all duration-200 shrink-0" />
                        <span className="text-sm font-semibold text-text-main group-hover/item:text-primary transition-colors duration-200">
                          {skill.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
