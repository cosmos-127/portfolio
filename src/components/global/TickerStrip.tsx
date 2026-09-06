"use client";

import { Bot, Zap, Layers, Network, Database, Server } from "lucide-react";

interface TickerStripProps {
  className?: string;
}

const TICKER_ITEMS = [
  { text: "AI ENGINEER @ STRATEGY", icon: Layers },
  { text: "LLMOps & CONTINUOUS EVALUATION", icon: Zap },
  { text: "AGENTIC FLOWS (ReAct & ReWOO)", icon: Bot },
  { text: "GraphRAG & KNOWLEDGE GRAPHS", icon: Network },
  { text: "LANGGRAPH MULTI-AGENT", icon: Layers },
  { text: "MCP TOOL SERVERS", icon: Server },
  { text: "MODEL SERVING (vLLM)", icon: Zap },
  { text: "TRINO & DATA FEDERATION", icon: Database },
];

export function TickerStrip({ className = "" }: TickerStripProps) {
  return (
    <div className={`w-full overflow-hidden border-y border-white/85 bg-white/40 backdrop-blur-xl py-3.5 select-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] relative ${className}`}>
      {/* Subtle top specular sheen highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />
      <div className="flex w-max animate-marquee will-change-transform">
        <div className="flex items-center gap-10 whitespace-nowrap text-xs font-mono tracking-widest text-text-muted shrink-0 pr-10">
          {TICKER_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={`track1-${idx}`} className="group/ticker flex items-center gap-3 py-1 px-2 rounded-lg hover:bg-white/80 hover:text-text-main transition-colors duration-200 cursor-default">
                <Icon className="h-3.5 w-3.5 text-primary group-hover/ticker:scale-110 group-hover/ticker:rotate-6 transition-transform duration-200" />
                <span className="group-hover/ticker:text-primary transition-colors duration-200">{item.text}</span>
                <span className="text-border-strong font-light ml-2">/</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-10 whitespace-nowrap text-xs font-mono tracking-widest text-text-muted shrink-0 pr-10" aria-hidden="true">
          {TICKER_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={`track2-${idx}`} className="group/ticker flex items-center gap-3 py-1 px-2 rounded-lg hover:bg-white/80 hover:text-text-main transition-colors duration-200 cursor-default">
                <Icon className="h-3.5 w-3.5 text-primary group-hover/ticker:scale-110 group-hover/ticker:rotate-6 transition-transform duration-200" />
                <span className="group-hover/ticker:text-primary transition-colors duration-200">{item.text}</span>
                <span className="text-border-strong font-light ml-2">/</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
