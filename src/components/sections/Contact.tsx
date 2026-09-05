"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  Mail,
  BookOpen,
  Copy,
  Check,
  ArrowUpRight,
  Terminal,
  Clock,
  Send,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useAvailability } from "@/lib/useAvailability";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ContactChannel {
  name: string;
  label: string;
  value: string;
  type: "copy" | "link";
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CONTACT_CHANNELS: ContactChannel[] = [
  {
    name: "EMAIL",
    label: "Direct Email",
    value: "cosmos.dev.127@gmail.com",
    type: "copy",
    icon: Mail,
  },
  {
    name: "GITHUB",
    label: "Code & Experiments",
    value: "github.com/cosmos-127",
    type: "link",
    url: "https://github.com/cosmos-127",
    icon: GithubIcon,
  },
  {
    name: "LINKEDIN",
    label: "Professional Profile",
    value: "linkedin.com/in/gagan-parashar",
    type: "link",
    url: "https://www.linkedin.com/in/gagan-parashar/",
    icon: LinkedinIcon,
  },
  {
    name: "MEDIUM",
    label: "Engineering Notebook",
    value: "medium.com/@gaganparashar127",
    type: "link",
    url: "https://medium.com/@gaganparashar127",
    icon: BookOpen,
  },
];

export function Contact() {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const availability = useAvailability();

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerTextRef = useRef<HTMLDivElement>(null);
  const telemetryRef = useRef<HTMLDivElement>(null);
  const channelsRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // 1. Header & Telemetry entrance
      const headerElements = [headerTextRef.current, telemetryRef.current].filter(Boolean);
      if (headerElements.length > 0) {
        gsap.fromTo(
          headerElements,
          { opacity: 0, y: 24 },
          {
            scrollTrigger: {
              trigger: headerTextRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.14,
            ease: "power3.out",
          }
        );
      }

      // 2. Channel rows stagger
      if (channelsRef.current) {
        const channels = Array.from(channelsRef.current.children);
        channels.forEach((channel, i) => {
          gsap.fromTo(
            channel,
            { opacity: 0, x: i % 2 === 0 ? -28 : 28, y: 8 },
            {
              scrollTrigger: {
                trigger: channelsRef.current,
                start: "top 84%",
                toggleActions: "play none none reverse",
              },
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.55,
              delay: i * 0.09,
              ease: "power3.out",
            }
          );
        });
      }

      // 3. Quick terminal query bar entrance
      if (terminalRef.current) {
        gsap.fromTo(
          terminalRef.current,
          { opacity: 0, y: 16 },
          {
            scrollTrigger: {
              trigger: terminalRef.current,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
          }
        );
      }
    },
    { scope: sectionRef }
  );

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(identifier);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <section ref={sectionRef} id="contact" className="py-32 bg-transparent section-divider-shimmer relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div ref={headerTextRef} className="lg:col-span-7">
            <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-widest uppercase mb-3">
              <span>[05]</span>
              <span className="w-8 h-px bg-primary/40" />
              <span>{"//"} DIRECT CONTACT</span>
            </div>
            <h2 className="font-gued font-bold text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-text-main tracking-tight mb-6 leading-[1.1]">
              Let&apos;s build <span className="font-serif italic font-normal text-primary tracking-normal">intelligent systems</span><span className="text-primary font-bold">.</span>
            </h2>
            <p className="font-sans text-text-muted text-base sm:text-lg max-w-xl leading-relaxed">
              AI Engineer at Strategy specializing in LLMOps, compound AI systems, autonomous agent workflows (LangGraph, ReWOO, ReAct), GraphRAG, and production model serving with vLLM. Open to technical collaborations, engineering discussions, and high-impact roles.
            </p>
          </div>

          {/* Telemetry & Availability Badge Card with Mouse-Tracking Sheen */}
          <div ref={telemetryRef} className="lg:col-span-5 flex flex-col justify-end">
            <div className="p-6 rounded-2xl glass-card glow-card relative overflow-hidden font-mono text-xs space-y-3">
              {/* Top specular reflection */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

              <div className="flex items-center justify-between text-text-muted pb-2 border-b border-white/60">
                <span>SYSTEM TELEMETRY</span>
                <span className={cn(
                  "glass-pill px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-bold text-[11px]",
                  availability.isWorkingHours ? "text-emerald-700" : "text-indigo-700"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    availability.isWorkingHours ? "bg-emerald-500 animate-pulse" : "bg-indigo-500"
                  )} />
                  {availability.statusText}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  LOCAL TIME:
                </span>
                <span className="text-text-main font-semibold">
                  {availability.timeString || "02:30:00 IST"} ({availability.utcOffset})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">LOCATION:</span>
                <span className="text-text-main">{availability.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">RESPONSE TIME:</span>
                <span className="text-primary font-semibold">{availability.responseTime}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/40 text-[10px]">
                <span className="text-text-muted">SCHEDULE NOTE:</span>
                <span className={cn(
                  "font-mono font-medium truncate max-w-[220px]",
                  availability.isWorkingHours ? "text-emerald-700" : "text-indigo-700"
                )}>
                  {availability.scheduleNote}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Channel List inside Frosted Glass Container with Mouse-Tracking Sheen */}
        <div ref={channelsRef} className="glass-card glow-card rounded-2xl p-2 sm:p-3 relative overflow-hidden flex flex-col gap-1">
          {/* Top specular reflection */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          {CONTACT_CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const isCopied = copiedField === channel.name;

            return (
              <div key={channel.name}>
                {channel.type === "link" ? (
                  <Link
                    href={channel.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col sm:flex-row sm:items-center justify-between py-5 px-5 rounded-xl hover:bg-white/80 hover:shadow-2xs transition-all duration-200 group border border-transparent hover:border-white/90"
                  >
                    <div className="flex items-center gap-3 w-44">
                      <div className="p-1.5 rounded-lg bg-white/60 border border-white/80 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                        <Icon className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                      </div>
                      <span className="font-mono text-xs font-bold text-text-muted group-hover:text-primary transition-colors">
                        {channel.name}
                      </span>
                    </div>

                    <div className="flex-1 mt-2 sm:mt-0 font-mono text-sm text-text-main">
                      {channel.value}
                    </div>

                    <div className="mt-2 sm:mt-0 flex items-center gap-1 text-xs font-mono text-primary font-semibold group-hover:translate-x-1 transition-transform">
                      <span>Visit</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 px-5 rounded-xl hover:bg-white/80 hover:shadow-2xs transition-all duration-200 group border border-transparent hover:border-white/90">
                    <div className="flex items-center gap-3 w-44">
                      <div className="p-1.5 rounded-lg bg-white/60 border border-white/80 group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                        <Icon className="w-3.5 h-3.5 text-text-muted group-hover:text-primary transition-colors" />
                      </div>
                      <span className="font-mono text-xs font-bold text-text-muted group-hover:text-primary transition-colors">
                        {channel.name}
                      </span>
                    </div>

                    <div className="flex-1 mt-2 sm:mt-0 font-mono text-sm text-text-main">
                      {channel.value}
                    </div>

                    <div className="mt-2 sm:mt-0 flex items-center gap-3">
                      <button
                        onClick={() => handleCopy(channel.value, channel.name)}
                        data-cursor="copy"
                        data-cursor-label="COPY"
                        className="glass-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:border-primary text-xs font-mono text-primary transition-all cursor-pointer shadow-2xs"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`mailto:${channel.value}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-mono hover:bg-primary/90 transition-colors shadow-2xs"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Email</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Terminal Curl Footer Widget with Mouse-Tracking Sheen */}
        <div ref={terminalRef} className="mt-10 p-4 rounded-2xl glass-card glow-card relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span>QUICK QUERY:</span>
            <code className="text-text-main glass-pill px-2.5 py-1 rounded-lg">
              curl -s https://cosmos127.dev/api/contact
            </code>
          </div>
          <button
            onClick={() =>
              handleCopy(
                "curl -s https://cosmos127.dev/api/contact",
                "curl"
              )
            }
            data-cursor="copy"
            data-cursor-label="COPY"
            className="text-primary hover:underline cursor-pointer flex items-center gap-1 text-left font-semibold"
          >
            {copiedField === "curl" ? "Copied command ✓" : "Copy curl command"}
          </button>
        </div>

      </div>
    </section>
  );
}
