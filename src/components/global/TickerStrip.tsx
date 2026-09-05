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
    <div className={`w-full overflow-hidden border-y border-white/70 bg-white/40 backdrop-blur-md py-3.5 select-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] ${className}`}>
      <div className="flex animate-marquee items-center gap-12 whitespace-nowrap text-xs font-mono tracking-widest text-text-muted">
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span>{item.text}</span>
              <span className="text-border-strong font-light">/</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
