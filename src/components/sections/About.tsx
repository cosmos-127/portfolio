"use client";

import { useRef } from "react";
import {
  MapPin,
  Globe,
  ArrowDown,
  GraduationCap,
} from "lucide-react";
import { AccentureIcon, StrategyIcon } from "@/components/ui/icons";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TextScramble } from "@/components/ui/TextScramble";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Milestone {
  id: string;
  step: string;
  period: string;
  title: string;
  organization: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  tags?: string[];
}

const MILESTONES: Milestone[] = [
  {
    id: "vit",
    step: "01",
    period: "2020 – 2024",
    title: "B.Tech in Computer Science",
    organization: "VIT (Vellore Institute of Technology)",
    summary: "Deep academic foundation in AI, ML algorithms, operating systems, and scalable distributed architectures.",
    icon: GraduationCap,
    tags: ["Systems Engineering", "Algorithms", "AI/ML"],
  },
  {
    id: "accenture",
    step: "02",
    period: "Jun 2024 – Oct 2025 · 1 yr 5 mos",
    title: "Advanced Application Engineering Analyst",
    organization: "Accenture in India",
    summary: "Architected enterprise application pipelines, scaled cloud microservices, and implemented production CI/CD automation.",
    icon: AccentureIcon,
    tags: ["Enterprise Systems", "Cloud Microservices", "CI/CD"],
  },
  {
    id: "strategy",
    step: "03",
    period: "Oct 2025 – Present · Full-time",
    title: "AI Engineer",
    organization: "Strategy",
    summary: "Building compound AI architectures, autonomous agent workflows (LangGraph, ReWOO), GraphRAG with Neo4j, and high-throughput vLLM model serving.",
    icon: StrategyIcon,
    active: true,
    tags: ["LLMOps", "Autonomous Agents", "GraphRAG", "vLLM"],
  },
];

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const timelineRailRef = useRef<HTMLDivElement>(null);
  const stationsRef = useRef<HTMLDivElement>(null);
  const footerBadgesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Header entrance
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

      // 2. Bio engineering statement entrance
      if (bioRef.current) {
        gsap.fromTo(
          bioRef.current,
          { opacity: 0, y: 24, filter: "blur(6px)" },
          {
            scrollTrigger: {
              trigger: bioRef.current,
              start: "top 84%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.7,
            delay: 0.1,
            ease: "power3.out",
            clearProps: "transform,filter",
          }
        );
      }

      // 3. Dynamic timeline track spine: draws downward on scroll
      if (timelineRailRef.current) {
        gsap.fromTo(
          timelineRailRef.current,
          { scaleY: 0 },
          {
            scrollTrigger: {
              trigger: stationsRef.current,
              start: "top 80%",
              end: "bottom 80%",
              scrub: 0.4,
            },
            scaleY: 1,
            ease: "none",
          }
        );
      }

      // 4. Milestone stations entrance: slide and blur reveal
      if (stationsRef.current) {
        const stationElements = Array.from(stationsRef.current.children);
        stationElements.forEach((el, idx) => {
          gsap.fromTo(
            el,
            { opacity: 0, x: -28, filter: "blur(6px)" },
            {
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
              opacity: 1,
              x: 0,
              filter: "blur(0px)",
              duration: 0.65,
              delay: idx * 0.08,
              ease: "power3.out",
              clearProps: "transform,filter",
            }
          );
        });
      }

      // 5. Bottom location & availability badges entrance
      if (footerBadgesRef.current) {
        gsap.fromTo(
          footerBadgesRef.current,
          { opacity: 0, y: 20 },
          {
            scrollTrigger: {
              trigger: footerBadgesRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            clearProps: "transform,opacity",
          }
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-28 md:py-36 bg-transparent section-divider-shimmer relative overflow-hidden min-h-[90vh] flex items-center"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
        
        {/* Section Header: Open Canvas Architectural Layout */}
        <div ref={headerRef} className="mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-widest uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <TextScramble text="ABOUT & CAREER PATH" />
            </div>
            <h2 className="font-gued font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-text-main tracking-tight leading-[1.12]">
              Background &amp; <span className="font-serif italic font-normal text-primary tracking-normal">career trajectory</span><span className="text-primary font-bold">.</span>
            </h2>
          </div>
        </div>

        {/* 2-Column Open Layout: Left = Trajectory on Canvas; Right = Open 3D Spatial Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Direct Canvas-Native Trajectory (No Enclosing Boxed Card) */}
          <div className="lg:col-span-7 flex flex-col gap-8 max-w-2xl">

            {/* Open Timeline Track on Canvas */}
            <div className="relative pl-8 sm:pl-10 my-2">
              
              {/* Vertical Dynamic Rail Spine */}
              <div
                ref={timelineRailRef}
                className="absolute left-[12px] sm:left-[16px] top-3 bottom-5 w-[2px] bg-gradient-to-b from-primary via-primary/50 to-transparent origin-top"
                aria-hidden="true"
              />
              {/* Ambient Track Base */}
              <div
                className="absolute left-[12px] sm:left-[16px] top-3 bottom-5 w-px bg-border-light/70 -z-10"
                aria-hidden="true"
              />

              {/* Trajectory Stations */}
              <div ref={stationsRef} className="flex flex-col gap-5 sm:gap-6">
                
                {/* 1. Education (VIT) */}
                <div
                  className="relative group/station transition-all duration-200 cursor-default p-4 sm:p-5 rounded-xl bg-surface/40 border border-border-light/70 hover:bg-surface/70 hover:border-border-strong/70"
                >
                  {/* Station Node on Rail */}
                  <span className="absolute -left-[29px] sm:-left-[33px] top-4 sm:top-5 flex h-5 w-5 items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-border-strong group-hover/station:border-primary group-hover/station:scale-110 transition-all duration-200 shadow-2xs" />
                  </span>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-text-muted mb-1.5">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-muted group-hover/station:text-primary transition-colors duration-200">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      Education
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border-light/80 text-text-muted font-mono text-[10px]">
                      2020 – 2024
                    </span>
                  </div>

                  <div className="text-text-main font-bold text-lg tracking-tight group-hover/station:text-primary transition-colors duration-200">
                    B.Tech in Computer Science
                  </div>
                  
                  <div className="flex items-center gap-2 text-text-muted text-xs sm:text-sm font-medium mt-1">
                    <span className="p-1 rounded-md bg-white border border-border-light/80 shadow-2xs flex items-center justify-center shrink-0">
                      <GraduationCap className="w-3.5 h-3.5 text-text-muted" />
                    </span>
                    <span>VIT (Vellore Institute of Technology)</span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed mt-2 max-w-xl">
                    Deep academic foundation in AI, ML algorithms, operating systems, and scalable distributed architectures.
                  </p>

                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {MILESTONES[0].tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-white/80 border border-border-light/80 text-[10px] font-mono text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Transition 1: Education -> Industry */}
                <div className="relative flex items-center select-none py-0.5">
                  <div className="inline-flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-1 px-3 py-1.5 rounded-full bg-surface/90 border border-border-light/80 text-[10.5px] font-mono text-text-muted shadow-2xs max-w-full">
                    <span className="flex items-center gap-1.5 font-semibold text-text-muted uppercase tracking-wider">
                      <span className="p-0.5 rounded bg-primary/10 text-primary shrink-0 flex items-center justify-center">
                        <ArrowDown className="w-3 h-3 animate-pulse" />
                      </span>
                      <span>Transition to Industry</span>
                    </span>
                    <span className="text-[10px] text-text-muted/70 font-mono shrink-0">
                      · Jun 2024
                    </span>
                  </div>
                </div>

                {/* 2. First Role (Accenture) */}
                <div
                  className="relative group/station transition-all duration-200 cursor-default p-4 sm:p-5 rounded-xl bg-surface/40 border border-border-light/70 hover:bg-surface/70 hover:border-border-strong/70"
                >
                  {/* Station Node on Rail */}
                  <span className="absolute -left-[29px] sm:-left-[33px] top-4 sm:top-5 flex h-5 w-5 items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-white border-2 border-border-strong group-hover/station:border-primary group-hover/station:scale-110 transition-all duration-200 shadow-2xs" />
                  </span>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-text-muted mb-1.5">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-muted group-hover/station:text-primary transition-colors duration-200">
                      <AccentureIcon className="w-3.5 h-3.5 text-text-muted group-hover/station:text-[#A100FF] transition-colors duration-200 shrink-0" />
                      First Role · Accenture
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border-light/80 text-text-muted font-mono text-[10px]">
                      Jun 2024 – Oct 2025 · 1 yr 5 mos
                    </span>
                  </div>

                  <div className="text-text-main font-bold text-lg tracking-tight group-hover/station:text-primary transition-colors duration-200">
                    Advanced Application Engineering Analyst
                  </div>
                  
                  <div className="flex items-center gap-2 text-text-muted text-xs sm:text-sm font-medium mt-1">
                    <span className="p-1 rounded-md bg-white border border-border-light/80 shadow-2xs flex items-center justify-center shrink-0">
                      <AccentureIcon className="w-3.5 h-3.5 text-[#A100FF]" />
                    </span>
                    <span>Accenture in India</span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed mt-2 max-w-xl">
                    Architected enterprise application pipelines, scaled cloud microservices, and implemented production CI/CD automation.
                  </p>

                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {MILESTONES[1].tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-white/80 border border-border-light/80 text-[10px] font-mono text-text-muted"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Transition 2: Accenture -> Strategy */}
                <div className="relative flex items-center select-none py-0.5">
                  <div className="inline-flex flex-wrap sm:flex-nowrap items-center gap-x-2 gap-y-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-[10.5px] font-mono text-primary shadow-2xs max-w-full">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary">
                      <span className="p-0.5 rounded bg-primary/20 text-primary shrink-0 flex items-center justify-center">
                        <ArrowDown className="w-3 h-3 animate-pulse" />
                      </span>
                      <span>Transition to AI Systems &amp; LLMOps</span>
                    </span>
                    <span className="text-[10px] text-primary/80 font-mono font-medium shrink-0">
                      · Oct 2025
                    </span>
                  </div>
                </div>

                {/* 3. Current Role (Strategy) */}
                <div
                  className="relative group/station transition-all duration-300 cursor-default p-4 sm:p-5 rounded-xl bg-white/70 border border-primary/30 shadow-xs backdrop-blur-xs hover:border-primary/50 hover:bg-white/95"
                >
                  {/* Station Glowing Beacon Node */}
                  <span className="absolute -left-[29px] sm:-left-[33px] top-4 sm:top-5 flex h-5 w-5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary ring-4 ring-white shadow-sm" />
                  </span>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono mb-1.5">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary">
                      <StrategyIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                      Current Role · Strategy
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-semibold text-[10px] uppercase tracking-wide shrink-0 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Oct 2025 – Present
                    </span>
                  </div>

                  <div className="text-text-main font-bold text-xl tracking-tight">
                    AI Engineer
                  </div>
                  
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs sm:text-sm mt-1">
                    <span className="p-1 rounded-md bg-primary/10 border border-primary/25 shadow-2xs flex items-center justify-center shrink-0">
                      <StrategyIcon className="w-3.5 h-3.5 text-primary" />
                    </span>
                    <span>Strategy · Full-time</span>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed mt-2 max-w-xl">
                    Building compound AI architectures, autonomous agent workflows (LangGraph, ReWOO), GraphRAG with Neo4j, and high-throughput vLLM model serving.
                  </p>

                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    {MILESTONES[2].tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Location & Remote Availability Badges directly on canvas */}
            <div
              ref={footerBadgesRef}
              className="pt-6 border-t border-border-light/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-text-muted"
            >
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/80 border border-border-light/80 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Pune, MH, India</span>
              </div>
              
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 font-medium shadow-2xs">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Open to Remote Worldwide</span>
              </div>
            </div>

          </div>

          {/* Right Column: Uninhibited 3D Stage for Unified Neural Tensor Lattice */}
          <div className="hidden lg:flex lg:col-span-5 h-[540px] pointer-events-none select-none" />

        </div>

      </div>
    </section>
  );
}
