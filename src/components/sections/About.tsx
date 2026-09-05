"use client";

import { useRef } from "react";
import {
  MapPin,
  Globe,
  Sparkles,
  ArrowDown,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Stately entrance for the section header
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
          }
        );
      }

      // 2. Career Trajectory entrance
      if (timelineRef.current) {
        gsap.fromTo(
          timelineRef.current,
          { opacity: 0, y: 28 },
          {
            scrollTrigger: {
              trigger: timelineRef.current,
              start: "top 84%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
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
      className="py-28 md:py-36 bg-transparent border-t border-border-light/60 relative overflow-hidden min-h-[90vh] flex items-center"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full">
        
        {/* Section Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-widest uppercase mb-3">
              <span>[04]</span>
              <span className="w-8 h-px bg-primary/40" />
              <span>{"//"} ABOUT & TRAJECTORY</span>
            </div>
            <h2 className="font-gued font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-text-main tracking-tight max-w-3xl leading-[1.12]">
              Background &amp; <span className="font-serif italic font-normal text-primary tracking-normal">career path</span><span className="text-primary font-bold">.</span>
            </h2>
          </div>
        </div>

        {/* 2-Column Layout: Left = Career Timeline; Right = Open 3D Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-6 flex flex-col gap-8 max-w-xl">

            {/* Glassmorphic Career Trajectory Card with Mouse-Tracking Sheen */}
            <div ref={timelineRef} className="glass-card glow-card rounded-2xl p-6 sm:p-7 space-y-6 relative overflow-hidden">
              {/* Subtle top specular sheen highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
              
              {/* Floating Timeline Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-white/60 font-mono text-xs">
                <span className="flex items-center gap-2 font-bold text-text-main tracking-wider uppercase">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  Career Trajectory
                </span>
                <span className="glass-pill px-2.5 py-1 rounded-full text-emerald-700 font-semibold text-[11px] shrink-0 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  FULL-TIME · OCT 2025 – PRESENT
                </span>
              </div>

              {/* Minimal Linear Track */}
              <div className="relative ml-3 sm:ml-4 pl-6 sm:pl-7 border-l border-border-light/80 space-y-6 my-2">
                
                {/* 1. Education (VIT) */}
                <div className="relative group p-2 -mx-2 rounded-xl transition-all duration-200 hover:bg-white/60">
                  {/* Node on rail */}
                  <span className="absolute -left-[30px] sm:-left-[34px] top-3.5 w-3 h-3 rounded-full bg-white border-2 border-border-strong group-hover:border-primary group-hover:scale-110 transition-all duration-200 shadow-2xs" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-text-muted mb-1">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-muted group-hover:text-primary transition-colors duration-200">
                      <GraduationCap className="w-3.5 h-3.5 text-primary" />
                      01 · Education
                    </span>
                    <span className="text-text-muted/80 shrink-0">2020 – 2024</span>
                  </div>
                  <div className="text-text-main font-semibold text-base tracking-tight group-hover:text-primary transition-colors duration-200">
                    B.Tech in Computer Science
                  </div>
                  <div className="text-text-muted text-xs sm:text-sm font-medium mt-0.5">
                    VIT (Vellore Institute of Technology)
                  </div>
                  <div className="text-[11px] text-text-muted/80 mt-1 font-mono">
                    Foundation in AI, ML &amp; Systems Engineering
                  </div>
                </div>

                {/* Transition 1: Education -> Industry */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-text-muted/80 py-0.5 px-2">
                  <ArrowDown className="w-3 h-3 text-primary/70 animate-pulse shrink-0" />
                  <span className="tracking-wide uppercase">Transition to Industry · Jun 2024</span>
                </div>

                {/* 2. First Role (Accenture) */}
                <div className="relative group p-2 -mx-2 rounded-xl transition-all duration-200 hover:bg-white/60">
                  {/* Node on rail */}
                  <span className="absolute -left-[30px] sm:-left-[34px] top-3.5 w-3 h-3 rounded-full bg-white border-2 border-border-strong group-hover:border-primary group-hover:scale-110 transition-all duration-200 shadow-2xs" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-text-muted mb-1">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-text-muted group-hover:text-primary transition-colors duration-200">
                      <Briefcase className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors duration-200" />
                      02 · First Role
                    </span>
                    <span className="text-text-muted/80 shrink-0">Jun 2024 – Oct 2025</span>
                  </div>
                  <div className="text-text-main font-semibold text-base tracking-tight group-hover:text-primary transition-colors duration-200">
                    Advanced Application Engineering Analyst
                  </div>
                  <div className="text-text-muted text-xs sm:text-sm font-medium mt-0.5">
                    Accenture in India · 1 yr 5 mos
                  </div>
                  <div className="text-[11px] text-text-muted/80 mt-1 font-mono">
                    Enterprise Application Engineering &amp; Scaled Distributed Systems
                  </div>
                </div>

                {/* Transition 2: Accenture -> Strategy */}
                <div className="flex items-center gap-2 text-[10px] font-mono text-primary font-semibold py-0.5 px-2">
                  <ArrowDown className="w-3 h-3 text-primary animate-pulse shrink-0" />
                  <span className="tracking-wide uppercase">Transition to AI Systems &amp; LLMOps · Oct 2025</span>
                </div>

                {/* 3. Current Role (Strategy) */}
                <div className="relative group p-2.5 -mx-2 rounded-xl bg-white/50 border border-white/80 shadow-2xs transition-all duration-200 hover:bg-white/70">
                  {/* Active glowing beacon node */}
                  <span className="absolute -left-[31px] sm:-left-[35px] top-4 flex h-3.5 w-3.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                  </span>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono mb-1">
                    <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-primary">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      03 · Current Role
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px] uppercase tracking-wide shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Oct 2025 – Present
                    </span>
                  </div>
                  <div className="text-text-main font-bold text-base sm:text-lg tracking-tight">
                    AI Engineer
                  </div>
                  <div className="text-primary font-semibold text-xs sm:text-sm mt-0.5">
                    Strategy · Full-time
                  </div>
                  <div className="text-xs text-text-muted mt-1 leading-relaxed">
                    Large Language Model Operations (LLMOps) &amp; Compound Agentic Systems
                  </div>
                </div>
              </div>

              {/* Location & Remote Pill */}
              <div className="pt-4 border-t border-white/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-text-muted">
                <span className="glass-pill px-3 py-1 rounded-full flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Pune, MH, India
                </span>
                <span className="glass-pill px-3 py-1 rounded-full flex items-center gap-1.5 text-emerald-700 font-medium">
                  <Globe className="w-3.5 h-3.5 text-emerald-500" />
                  Open to Remote Worldwide
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Open canvas space for Unified Neural Tensor Lattice */}
          <div className="hidden lg:block lg:col-span-6 pointer-events-none" aria-hidden="true" />

        </div>

      </div>
    </section>
  );
}
