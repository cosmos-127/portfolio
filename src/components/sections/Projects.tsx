"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image, { type StaticImageData } from "next/image";
import llmarkImage from "@/assets/llmark-landing-page.png";
import {
  ExternalLink,
  Globe,
  Server,
  Network,
  Database,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Compass,
  MoveVertical,
} from "lucide-react";
import { GithubIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ProjectItem {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  gitUrl: string;
  websiteUrl?: string;
  websiteLabel?: string;
  image?: string | StaticImageData;
}

const PROJECTS: ProjectItem[] = [
  {
    id: "llmark",
    code: "[01]",
    title: "LLMark",
    category: "Inference Benchmarking",
    description:
      "Load profiler for LLM endpoints — measures TTFT, throughput, and tail latencies on vLLM.",
    tags: ["vLLM", "Telemetry", "Netlify"],
    gitUrl: "https://github.com/cosmos-127/llmark",
    websiteUrl: "https://llmark.netlify.app/",
    websiteLabel: "Live App ↗",
    image: llmarkImage,
  },
  {
    id: "mcp-server",
    code: "[02]",
    title: "MCP Tool Server",
    category: "Agent Tooling",
    description:
      "Production MCP server giving agents standardized, typed tool access across APIs and databases.",
    tags: ["MCP", "FastMCP", "LangGraph"],
    gitUrl: "https://github.com/cosmos-127/mcp-server",
    websiteUrl: "https://github.com/cosmos-127/mcp-server#architecture",
    websiteLabel: "Docs ↗",
  },
  {
    id: "graphrag-explorer",
    code: "[03]",
    title: "GraphRAG Explorer",
    category: "Knowledge Retrieval",
    description:
      "Hybrid retrieval engine combining Neo4j knowledge graphs with vector search for multi-hop queries.",
    tags: ["GraphRAG", "Neo4j", "LangGraph"],
    gitUrl: "https://github.com/cosmos-127/graphrag-explorer",
    websiteUrl: "https://github.com/cosmos-127/graphrag-explorer#methodology",
    websiteLabel: "Methodology ↗",
  },
  {
    id: "federated-analyst",
    code: "[04]",
    title: "Federated AI Analyst",
    category: "Multi-Agent Analytics",
    description:
      "Multi-agent system running ReWOO workflows and federated SQL via Trino — no data centralization.",
    tags: ["ReWOO", "Trino SQL", "Multi-Agent"],
    gitUrl: "https://github.com/cosmos-127/federated-analyst",
    websiteUrl: "https://github.com/cosmos-127/federated-analyst#workflow",
    websiteLabel: "Workflow ↗",
  },
];

// True 3D Cylindrical Drum Constants
// With card height H = 540px and STEP_ANGLE = 26°, tangent intersection distance D = R * tan(θ / 2).
// To prevent 3D clipping/intersection: R >= (H / 2) / tan(13°) ≈ 1170px.
// Setting DRUM_RADIUS = 1300 provides a clean ~60px facet gap with zero planar intersection.
const DRUM_RADIUS = 1300; // Radius in pixels for cylindrical circular orbit
const STEP_ANGLE_DEG = 26; // Degrees of angular spacing per facet
const STEP_ANGLE_RAD = (STEP_ANGLE_DEG * Math.PI) / 180;

/**
 * Shared Project Card with 3D Curvature Shading and Specular Sheen
 */
function ProjectCard({
  project,
  isActive = false,
  allowLinks = true,
}: {
  project: ProjectItem;
  isActive?: boolean;
  allowLinks?: boolean;
}) {
  const handleLinkClick = (e: React.MouseEvent) => {
    if (!isActive || !allowLinks) {
      e.preventDefault();
    }
  };

  return (
    <div
      className={cn(
        "glass-card glass-card-hover glow-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative group w-full mx-auto select-none overflow-hidden",
        isActive && "active-glass-card ring-1 ring-primary/30"
      )}
      style={{
        height: "540px",
        maxWidth: "700px",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      {/* Subtle top specular sheen highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />
      {/* 3D Cylindrical Curvature Ambient Occlusion & Shadow Overlay */}
      <div
        className={cn(
          "drum-curvature-overlay pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200 z-30",
          isActive ? "opacity-0" : "opacity-35"
        )}
        style={{
          background:
            "linear-gradient(to bottom, rgba(15, 23, 42, 0.4) 0%, transparent 28%, transparent 72%, rgba(15, 23, 42, 0.4) 100%)",
        }}
      />

      {/* Active Specular Rim Light Sheen */}
      {isActive && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-40 animate-pulse" />
      )}

      <div className="relative z-10">
        {/* Card Top: Code, Active Reel Badge & Category */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-mono text-xs font-bold transition-colors",
                isActive ? "text-primary" : "text-text-muted"
              )}
            >
              {project.code}
            </span>
            {isActive && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary font-semibold border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                ACTIVE AXIS 0°
              </span>
            )}
          </div>
          <span className="glass-pill px-2.5 py-0.5 rounded-full font-mono text-[10px] text-text-muted font-medium truncate max-w-[260px]">
            {project.category}
          </span>
        </div>

        {/* Card Title */}
        <h3 className="font-gued font-bold text-2xl sm:text-3xl text-text-main mb-1.5 tracking-tight group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        {/* Description */}
        <p className="font-sans text-xs sm:text-sm text-text-muted leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Card Visual Area - 16:9 Aspect Ratio & Contained Inside Card */}
        {project.image ? (
          /* User-provided preview image */
          <div className="w-full max-w-[540px] aspect-video max-h-[260px] sm:max-h-[275px] rounded-xl overflow-hidden border border-border-light bg-zinc-950 mb-2 relative mx-auto group/img">
            <Image
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 540px"
              className="object-cover object-top"
              loading="lazy"
            />
            {project.websiteUrl && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <Link
                  href={project.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-mono text-xs font-semibold shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <span>Open Live Deployment</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ) : project.id === "llmark" ? (
          /* LLMark: High-performance Inference Telemetry Visualizer & Direct Deployment CTA */
          <div className="w-full max-w-[540px] aspect-video max-h-[260px] sm:max-h-[275px] rounded-xl overflow-hidden border border-border-light bg-zinc-950 mb-2 p-3.5 sm:p-4 flex flex-col justify-between font-mono text-xs mx-auto shadow-inner relative">
            {/* Ambient subtle scan-line when active */}
            {isActive && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent z-20 animate-data-flow" />
            )}

            {/* Mini Browser Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 font-mono text-[10px] text-zinc-400 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-1.5 text-zinc-300 truncate max-w-[180px] sm:max-w-none text-[10px]">
                  https://llmark.netlify.app/
                </span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[10px] shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE DEPLOYMENT
              </span>
            </div>

            {/* Telemetry Metrics Panel */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 py-2 my-auto text-xs">
              <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col justify-center relative overflow-hidden group/tile">
                <span className="text-zinc-400 text-[10px] sm:text-[11px] font-sans flex items-center justify-between">
                  <span>TTFT Latency</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-ping" />
                </span>
                <span className="text-emerald-400 font-bold text-sm sm:text-base animate-telemetry-pulse">
                  142 ms{" "}
                  <span className="text-[10px] text-zinc-500 font-normal">
                    p95
                  </span>
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col justify-center">
                <span className="text-zinc-400 text-[10px] sm:text-[11px] font-sans">
                  Token Throughput
                </span>
                <span className="text-primary font-bold text-sm sm:text-base animate-telemetry-pulse">
                  124.8 tok/s
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col justify-center">
                <span className="text-zinc-400 text-[10px] sm:text-[11px] font-sans">
                  vLLM Engine
                </span>
                <span className="text-zinc-200 font-bold text-xs sm:text-sm">
                  PagedAttention v2
                </span>
              </div>
              <div className="p-2.5 sm:p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 flex flex-col justify-center">
                <span className="text-zinc-400 text-[10px] sm:text-[11px] font-sans">
                  Concurrency
                </span>
                <span className="text-amber-400 font-bold text-xs sm:text-sm">
                  64 Stress Streams
                </span>
              </div>
            </div>

            {/* Direct Deployment Bar inside Visualizer with Throughput Activity Line */}
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-400 text-[11px] hidden sm:flex">
                <span className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden relative inline-block">
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary animate-data-flow" />
                </span>
                <span>Inference Stream Active</span>
              </div>
              <Link
                href={project.websiteUrl!}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                data-cursor="view"
                data-cursor-label="LAUNCH ↗"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-white font-mono text-xs font-semibold hover:bg-primary/90 transition-colors ml-auto sm:ml-0 shadow-sm"
              >
                <span>Launch Live App</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : project.id === "mcp-server" ? (
          /* MCP Tool Server: 16:9 Contained FastMCP Protocol Visualizer */
          <div className="w-full max-w-[540px] aspect-video max-h-[260px] sm:max-h-[275px] rounded-xl overflow-hidden border border-white/80 bg-white/35 backdrop-blur-md mb-2 p-3.5 sm:p-4 flex flex-col justify-between font-mono text-xs mx-auto relative shadow-2xs">
            {isActive && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent z-20 animate-data-flow" />
            )}

            <div className="flex items-center justify-between pb-2 border-b border-border-light/80 text-[11px] text-text-muted">
              <div className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">mcp://gateway:8080/tools</span>
              </div>
              <span className="text-emerald-600 font-bold shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE GATEWAY
              </span>
            </div>

            <div className="py-2 space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-white/60 border border-white/85 flex items-center justify-between shadow-2xs">
                <span className="text-text-muted font-sans text-xs">
                  Tool Protocol:
                </span>
                <span className="text-primary font-bold text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-ping" />
                  FastMCP JSON-RPC 2.0
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/60 border border-white/85 flex items-center justify-between shadow-2xs">
                <span className="text-text-muted font-sans text-xs">
                  Schema Contract:
                </span>
                <code className="text-text-main font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface/80 border border-border-light/60">
                  JSONSchema(strict=True)
                </code>
              </div>
              <div className="p-2 rounded-lg bg-white/60 border border-white/85 flex items-center justify-between shadow-2xs">
                <span className="text-text-muted font-sans text-xs">
                  Serialization:
                </span>
                <span className="text-emerald-700 font-bold text-xs">
                  0ms (Zero-Copy)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-light/80 flex items-center justify-between text-[11px] text-text-muted">
              <span>Target Flow</span>
              <span className="text-text-main font-semibold flex items-center gap-1">
                <span>LangGraph</span>
                <span className="text-primary font-bold">&bull;</span>
                <span>ReAct Fleet</span>
              </span>
            </div>
          </div>
        ) : project.id === "graphrag-explorer" ? (
          /* GraphRAG Explorer: 16:9 Contained Knowledge Graph Visualizer */
          <div className="w-full max-w-[540px] aspect-video max-h-[260px] sm:max-h-[275px] rounded-xl overflow-hidden border border-white/80 bg-white/35 backdrop-blur-md mb-2 p-3.5 sm:p-4 flex flex-col justify-between font-mono text-xs mx-auto relative shadow-2xs">
            {isActive && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500 to-transparent z-20 animate-data-flow" />
            )}

            <div className="flex items-center justify-between pb-2 border-b border-border-light/80 text-[11px] text-text-muted">
              <div className="flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">graphrag://neo4j/hybrid-retrieval</span>
              </div>
              <span className="text-amber-600 font-bold shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                TRAVERSAL
              </span>
            </div>

            <div className="py-2 space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-white/60 border border-white/85 flex items-center justify-between shadow-2xs relative overflow-hidden">
                <span className="text-text-muted font-sans text-xs">
                  Multi-Hop Traversal:
                </span>
                <span className="text-text-main font-semibold text-[11px] flex items-center gap-1 font-mono">
                  <span className="text-primary">Entity</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-amber-700 bg-amber-50/80 px-1 rounded border border-amber-200/60">[rel:owns]</span>
                  <span className="text-text-muted">&rarr;</span>
                  <span className="text-emerald-700">Concept</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/60 border border-white/85 flex items-center justify-between shadow-2xs">
                <span className="text-text-muted font-sans text-xs">
                  Chunk Fragmentation:
                </span>
                <span className="text-emerald-700 font-bold text-xs">
                  Eliminated (Triples)
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white/60 border border-white/85 flex items-center justify-between shadow-2xs">
                <span className="text-text-muted font-sans text-xs">
                  Index Engine:
                </span>
                <span className="text-primary font-bold text-xs">
                  Neo4j + Vector Hybrid
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-light/80 flex items-center justify-between text-[11px] text-text-muted">
              <span>Engine</span>
              <span className="text-text-main font-semibold">
                Neo4j + Vector Hybrid
              </span>
            </div>
          </div>
        ) : (
          /* Federated AI Analyst: 16:9 Contained ReWOO + Trino Visualizer */
          <div className="w-full max-w-[540px] aspect-video max-h-[260px] sm:max-h-[275px] rounded-xl overflow-hidden border border-white/80 bg-white/35 backdrop-blur-md mb-2 p-3.5 sm:p-4 flex flex-col justify-between font-mono text-xs mx-auto relative shadow-2xs">
            {isActive && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500 to-transparent z-20 animate-data-flow" />
            )}

            <div className="flex items-center justify-between pb-2 border-b border-border-light/80 text-[11px] text-text-muted">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">rewoo://trino/distributed-sql</span>
              </div>
              <span className="text-purple-600 font-bold shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                FEDERATED
              </span>
            </div>

            <div className="py-2 space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-white/60 border border-white/85 flex items-center justify-between shadow-2xs">
                <span className="text-text-muted font-sans text-xs">
                  Orchestration:
                </span>
                <span className="text-primary font-bold text-xs flex items-center gap-1">
                  <span>ReWOO Parallel Flow</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-border-light flex items-center justify-between shadow-2xs">
                <span className="text-text-muted font-sans text-xs">
                  Data Movement:
                </span>
                <span className="text-emerald-700 font-bold text-xs">
                  0 bytes (In-situ)
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-border-light flex items-center justify-between shadow-2xs">
                <span className="text-text-muted font-sans text-xs">
                  Runtime:
                </span>
                <span className="text-text-main font-semibold text-xs">
                  Trino SQL Cluster
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-light/80 flex items-center justify-between text-[11px] text-text-muted">
              <span>Query Engine</span>
              <span className="text-text-main font-semibold">
                Trino Distributed SQL
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Card Bottom: Links & Tags */}
      <div className="relative z-10 pt-4 border-t border-white/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {project.websiteUrl && (
            <Link
              href={project.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              data-cursor="view"
              data-cursor-label="LAUNCH ↗"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-mono font-semibold hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{project.websiteLabel || "Deployment ↗"}</span>
            </Link>
          )}
          <Link
            href={project.gitUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
            data-cursor="view"
            data-cursor-label="CODE ↗"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg glass-pill text-text-main text-xs font-mono font-medium hover:border-text-main hover:bg-white transition-colors cursor-pointer shadow-2xs"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub ↗</span>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="glass-pill px-2.5 py-1 rounded-md text-[10px] font-mono text-text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal Precision Mechanical Drum Spoke Assembly (Option A)
 * Precision hairline outriggers, 3D radial depth struts, datum bushings, and telemetry tags
 */
function DrumSpokeAssembly({
  idx,
  isActive,
}: {
  idx: number;
  isActive: boolean;
}) {
  return (
    <>
      {/* Structural Lateral Guide Rails on Card Edges */}
      <div className="hidden md:block absolute -left-0.5 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-border-strong/40 to-transparent pointer-events-none" />
      <div className="hidden md:block absolute -right-0.5 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-border-strong/40 to-transparent pointer-events-none" />

      {/* LEFT FLANK SPOKE OUTRIGGER */}
      <div
        className="hidden md:flex absolute -left-8 lg:-left-12 xl:-left-14 top-1/2 -translate-y-1/2 items-center pointer-events-none z-20 select-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* 3D Radial Strut angling into depth (Z-axis) */}
        <div
          className="absolute right-2.5 w-12 lg:w-16 xl:w-20 h-px origin-right transition-opacity duration-300"
          style={{
            transform: "rotateY(-42deg) translateZ(-45px)",
            transformStyle: "preserve-3d",
            background: isActive
              ? "linear-gradient(to left, var(--primary) 0%, rgba(230, 57, 70, 0.35) 60%, transparent 100%)"
              : "linear-gradient(to left, rgba(161, 161, 170, 0.5) 0%, rgba(161, 161, 170, 0.05) 100%)",
            opacity: isActive ? 0.95 : 0.4,
          }}
        >
          {/* Distal Hub Socket Pin */}
          <span
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border transition-all duration-300",
              isActive
                ? "border-primary bg-primary shadow-[0_0_8px_var(--primary)]"
                : "border-zinc-400/50 bg-white/60"
            )}
          />
        </div>

        {/* Horizontal Outrigger Arm from Card Edge */}
        <div
          className={cn(
            "h-px w-5 lg:w-8 xl:w-10 transition-colors duration-300",
            isActive
              ? "bg-gradient-to-l from-primary via-primary/70 to-transparent"
              : "bg-gradient-to-l from-zinc-400/40 via-zinc-400/20 to-transparent"
          )}
        />

        {/* Precision Hinge Datum Bushing */}
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              "w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-xs",
              isActive
                ? "border-primary bg-white shadow-[0_0_10px_rgba(230,57,70,0.45)] ring-1 ring-primary/30"
                : "border-zinc-300 bg-white/70 shadow-2xs"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                isActive ? "bg-primary animate-pulse" : "bg-zinc-400"
              )}
            />
          </div>

          {/* Micro Telemetry Datum Tag */}
          <span
            className={cn(
              "absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[7px] lg:text-[8px] whitespace-nowrap tracking-tighter transition-colors duration-300",
              isActive ? "text-primary font-bold" : "text-zinc-400/70"
            )}
          >
            SPK-L{idx + 1}
          </span>
        </div>
      </div>

      {/* RIGHT FLANK SPOKE OUTRIGGER */}
      <div
        className="hidden md:flex absolute -right-8 lg:-right-12 xl:-right-14 top-1/2 -translate-y-1/2 items-center pointer-events-none z-20 select-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Precision Hinge Datum Bushing */}
        <div className="relative flex items-center justify-center">
          <div
            className={cn(
              "w-3.5 h-3.5 lg:w-4 lg:h-4 rounded-full border flex items-center justify-center transition-all duration-300 backdrop-blur-xs",
              isActive
                ? "border-primary bg-white shadow-[0_0_10px_rgba(230,57,70,0.45)] ring-1 ring-primary/30"
                : "border-zinc-300 bg-white/70 shadow-2xs"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                isActive ? "bg-primary animate-pulse" : "bg-zinc-400"
              )}
            />
          </div>

          {/* Micro Telemetry Datum Tag */}
          <span
            className={cn(
              "absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[7px] lg:text-[8px] whitespace-nowrap tracking-tighter transition-colors duration-300",
              isActive ? "text-primary font-bold" : "text-zinc-400/70"
            )}
          >
            SPK-R{idx + 1}
          </span>
        </div>

        {/* Horizontal Outrigger Arm to Card Edge */}
        <div
          className={cn(
            "h-px w-5 lg:w-8 xl:w-10 transition-colors duration-300",
            isActive
              ? "bg-gradient-to-r from-primary via-primary/70 to-transparent"
              : "bg-gradient-to-r from-zinc-400/40 via-zinc-400/20 to-transparent"
          )}
        />

        {/* 3D Radial Strut angling into depth (Z-axis) */}
        <div
          className="absolute left-2.5 w-12 lg:w-16 xl:w-20 h-px origin-left transition-opacity duration-300"
          style={{
            transform: "rotateY(42deg) translateZ(-45px)",
            transformStyle: "preserve-3d",
            background: isActive
              ? "linear-gradient(to right, var(--primary) 0%, rgba(230, 57, 70, 0.35) 60%, transparent 100%)"
              : "linear-gradient(to right, rgba(161, 161, 170, 0.5) 0%, rgba(161, 161, 170, 0.05) 100%)",
            opacity: isActive ? 0.95 : 0.4,
          }}
        >
          {/* Distal Hub Socket Pin */}
          <span
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border transition-all duration-300",
              isActive
                ? "border-primary bg-primary shadow-[0_0_8px_var(--primary)]"
                : "border-zinc-400/50 bg-white/60"
            )}
          />
        </div>
      </div>
    </>
  );
}

/**
 * Projects Section: High-Precision 3D Drum Wheel with Three.js Armature, GSAP scrub, and Drag Interaction
 */
export function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollTriggerInstance = useRef<ScrollTrigger | null>(null);

  // Continuous drum progress and gesture tracking
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const drumAngleTextRef = useRef<HTMLSpanElement>(null);
  const vernierStripRef = useRef<HTMLDivElement>(null);
  const axisLockRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mechanical drum progress animation state driven by GSAP
  const drumAnimProgress = useRef({ value: 0 });
  const drumTweenRef = useRef<gsap.core.Tween | null>(null);
  const hasDraggedRef = useRef(false);

  const lenis = useLenis();

  const overlayRefs = useRef<(HTMLElement | null)[]>([]);

  // Desktop 3D Cylindrical Drum update function
  const updateDrum = useCallback((continuous: number) => {
    // Current drum rotation angle in degrees
    const currentAngle = continuous * STEP_ANGLE_DEG;

    if (drumAngleTextRef.current) {
      drumAngleTextRef.current.textContent = `${currentAngle.toFixed(1)}° REEL`;
    }
    if (vernierStripRef.current) {
      const offset = -((currentAngle % STEP_ANGLE_DEG) / STEP_ANGLE_DEG) * 36;
      vernierStripRef.current.style.transform = `translateY(${offset.toFixed(1)}px)`;
    }
    if (axisLockRef.current) {
      const mod = Math.abs(currentAngle % STEP_ANGLE_DEG);
      const isLocked = mod < 2 || Math.abs(mod - STEP_ANGLE_DEG) < 2;
      axisLockRef.current.className = isLocked
        ? "flex items-center gap-1 px-1.5 py-0.5 rounded font-bold border whitespace-nowrap transition-all duration-300 bg-primary/15 text-primary border-primary/40 shadow-[0_0_8px_rgba(230,57,70,0.25)] scale-105"
        : "flex items-center gap-1 px-1.5 py-0.5 rounded font-bold border whitespace-nowrap transition-all duration-300 bg-white/60 text-text-muted border-border-light";
    }

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    cards.forEach((card, i) => {
      const delta = i - continuous;
      const absDelta = Math.abs(delta);

      // Recede cards behind the drum if more than 1.48 steps away
      if (absDelta > 1.48) {
        gsap.set(card, {
          autoAlpha: 0,
          pointerEvents: "none",
        });
        return;
      }

      // True 3D Cylindrical Drum Trigonometry:
      // Angles along the horizontal X-axis cylinder
      const angleRad = delta * STEP_ANGLE_RAD;
      const y = Math.sin(angleRad) * DRUM_RADIUS;
      const z = (Math.cos(angleRad) - 1) * DRUM_RADIUS;
      const rotX = -delta * STEP_ANGLE_DEG;

      // Mathematical z-index to strictly eliminate pop-through
      const zIndex = Math.round((10 - absDelta) * 1000);
      const scale = Math.max(0.82, 1 - absDelta * 0.07);

      // Solid opacity at focal center, smooth fade as card wraps around drum curvature
      let opacity = 1;
      if (absDelta > 0.72) {
        opacity = Math.max(0, 1 - (absDelta - 0.72) * 1.35);
      }

      gsap.set(card, {
        autoAlpha: opacity > 0.01 ? opacity : 0,
        y: y,
        z: z,
        rotationX: rotX,
        scale: scale,
        zIndex: zIndex,
        pointerEvents: absDelta < 0.75 ? "auto" : "none",
      });

      let overlay = overlayRefs.current[i];
      if (!overlay) {
        overlay = card.querySelector(".drum-curvature-overlay") as HTMLElement | null;
        overlayRefs.current[i] = overlay;
      }
      if (overlay) {
        overlay.style.opacity = `${Math.min(0.5, absDelta * 0.42)}`;
      }
    });
  }, []);

  // Mechanical Eased Transition to a specific card index (no intermediate resting states)
  const transitionToCard = useCallback(
    (targetIdx: number, syncScroll = true) => {
      const clamped = Math.max(0, Math.min(PROJECTS.length - 1, targetIdx));
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);

      // Dispatch 3D canvas resonance ripple
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("portfolio:project-step", { detail: { index: clamped } })
        );
      }

      // Synchronize Left Column Progress Bar
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${
          clamped / (PROJECTS.length - 1)
        })`;
      }

      // Synchronize page scroll with Lenis so ScrollTrigger progress stays aligned
      const st = scrollTriggerInstance.current;
      if (syncScroll && st) {
        const targetProgress = clamped / (PROJECTS.length - 1);
        const targetScroll = st.start + targetProgress * (st.end - st.start);
        if (lenis) {
          lenis.scrollTo(targetScroll, {
            duration: 0.35,
            lock: true,
            force: true,
          });
        } else {
          window.scrollTo({ top: targetScroll, behavior: "smooth" });
        }
      }

      // Cancel any ongoing drum tween
      if (drumTweenRef.current) {
        drumTweenRef.current.kill();
      }

      // Quick, snappy mechanical rotation directly into the integer detent
      drumTweenRef.current = gsap.to(drumAnimProgress.current, {
        value: clamped,
        duration: 0.32,
        ease: "power2.out",
        onUpdate: () => {
          updateDrum(drumAnimProgress.current.value);
        },
        onComplete: () => {
          updateDrum(clamped);
        },
      });
    },
    [lenis, updateDrum]
  );

  const isLockedRef = useRef(false);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Discrete Wheel Ratchet: exactly ONE card per scroll gesture (no multi-card skipping)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Only desktop & tablet pinned view
      if (window.innerWidth < 768) return;

      const st = scrollTriggerInstance.current;
      if (!st || !st.isActive) return;

      // Ignore horizontal trackpad swipes or micro-scroll noise
      if (Math.abs(e.deltaY) < 16 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;

      const current = activeIndexRef.current;

      if (e.deltaY > 0) {
        // Scrolling DOWN
        // If at last card, let native scroll flow seamlessly to Section 4 (Writing)
        if (current >= PROJECTS.length - 1) {
          return;
        }

        // Inside drum section: prevent continuous browser jump & step exactly ONE card
        e.preventDefault();

        // Absorb subsequent inertia wheel events from the same gesture
        if (isLockedRef.current) return;

        isLockedRef.current = true;
        transitionToCard(current + 1);

        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          isLockedRef.current = false;
        }, 360);
      } else if (e.deltaY < 0) {
        // Scrolling UP
        // If at first card, let native scroll flow seamlessly to Section 2 (Skills)
        if (current <= 0) {
          return;
        }

        // Inside drum section: prevent continuous browser jump & step exactly ONE card
        e.preventDefault();

        // Absorb subsequent inertia wheel events from the same gesture
        if (isLockedRef.current) return;

        isLockedRef.current = true;
        transitionToCard(current - 1);

        if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
        lockTimerRef.current = setTimeout(() => {
          isLockedRef.current = false;
        }, 360);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [transitionToCard]);

  // GSAP MatchMedia for Desktop 3D Drum & Mobile Stack
  useGSAP(
    () => {
      const trigger = triggerRef.current;
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      if (!trigger || cards.length === 0) return;

      const mm = gsap.matchMedia();

      // Desktop & Tablet (>= 768px): 3D Drum pinned rotation with mechanical snapping
      mm.add("(min-width: 768px)", () => {
        // Initialize drum position
        updateDrum(0);

        const st = ScrollTrigger.create({
          trigger: trigger,
          pin: true,
          anticipatePin: 1,
          start: "top top",
          end: () => `+=${(cards.length - 1) * 850}`,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressBarRef.current) {
              progressBarRef.current.style.transform = `scaleX(${self.progress})`;
            }

            // Sync if user dragged the native scrollbar directly
            if (!isLockedRef.current) {
              const continuous = self.progress * (cards.length - 1);
              updateDrum(continuous);
              const targetIdx = Math.min(
                cards.length - 1,
                Math.max(0, Math.round(continuous))
              );
              if (targetIdx !== activeIndexRef.current) {
                activeIndexRef.current = targetIdx;
                setActiveIndex(targetIdx);
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("portfolio:project-step", {
                      detail: { index: targetIdx },
                    })
                  );
                }
              }
            }
          },
        });

        scrollTriggerInstance.current = st;

        return () => {
          st.kill();
        };
      });

      // Mobile (< 768px): Staggered ScrollTrigger entrance for stacked cards
      mm.add("(max-width: 767px)", () => {
        const mobileCards =
          sectionRef.current?.querySelectorAll(".mobile-project-card");
        if (mobileCards && mobileCards.length > 0) {
          mobileCards.forEach((card) => {
            gsap.fromTo(
              card,
              { opacity: 0, y: 35 },
              {
                scrollTrigger: {
                  trigger: card,
                  start: "top 88%",
                  toggleActions: "play none none reverse",
                },
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
              }
            );
          });
        }
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  // Recalibrate downstream ScrollTriggers once layout settles
  useEffect(() => {
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Tactile Direct Drag-to-Spin Gesture Handlers on Desktop
  const dragStartY = useRef(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only desktop / tablet drag
    if (window.innerWidth < 768) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    dragStartY.current = e.clientY;
    hasDraggedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaY = e.clientY - dragStartY.current;
    if (Math.abs(deltaY) > 6) {
      hasDraggedRef.current = true;
    }

    // Subtle elastic mechanical tension during drag (not uncontrolled scrub)
    const elasticOffset = -(deltaY / 1400);
    updateDrum(activeIndexRef.current + elasticOffset);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already released
    }

    if (hasDraggedRef.current) {
      const deltaY = e.clientY - dragStartY.current;
      if (deltaY < -32) {
        // Dragged UP -> ratchet to next card
        transitionToCard(activeIndexRef.current + 1);
      } else if (deltaY > 32) {
        // Dragged DOWN -> ratchet to previous card
        transitionToCard(activeIndexRef.current - 1);
      } else {
        // Insufficient travel -> snap back to current card
        transitionToCard(activeIndexRef.current);
      }

      // Reset drag flag after small delay to avoid accidental link click
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 80);
    } else {
      transitionToCard(activeIndexRef.current);
    }
  };

  // Keyboard navigation when projects section is in view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight * 0.75 &&
        rect.bottom > window.innerHeight * 0.25;
      if (!inView) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        transitionToCard(activeIndexRef.current - 1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        transitionToCard(activeIndexRef.current + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [transitionToCard]);

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative bg-transparent border-t border-border-light/60"
    >
      {/* DESKTOP & TABLET: TWO-COLUMN PINNED VIEW WITH 3D ROTATING DRUM WHEEL */}
      <div className="hidden md:block">
        <div
          ref={triggerRef}
          className="h-screen w-full flex items-center justify-between px-6 sm:px-10 lg:px-12 max-w-[1440px] mx-auto relative bg-transparent overflow-hidden"
        >
          {/* STATIC LEFT COLUMN - TELEMETRY & CONTROLS */}
          <div className="w-[32%] lg:w-[28%] max-w-[340px] shrink-0 pr-6 lg:pr-8 flex flex-col justify-between h-[640px] lg:h-[720px] py-2 z-30">
            <div>
              {/* Telemetry Badge */}
              <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-widest uppercase mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SYSTEM ARCHITECTURE</span>
                <span className="w-6 h-px bg-primary/40" />
                <span className="text-[10px] text-text-muted">01</span>
              </div>

              {/* Static Main Headline with Editorial Serif Polish */}
              <h2 className="font-gued font-bold text-3xl lg:text-4xl xl:text-[2.65rem] text-text-main tracking-tight leading-[1.15] mb-4">
                Systems designed to solve <span className="font-serif italic font-normal text-primary tracking-normal">real AI bottlenecks</span>
                <span className="text-primary font-bold">.</span>
              </h2>

              {/* Editorial Description */}
              <p className="text-text-muted font-sans text-xs sm:text-sm leading-relaxed mb-6">
                Minimal, purpose-built architectures spanning inference serving
                telemetry, agent tool protocol gateways, relational GraphRAG,
                and federated analytical flows.
              </p>

              {/* Real-time 3D Drum Telemetry & Angle Dial with Mouse-Tracking Border Sheen */}
              <div className="mb-6 p-4 rounded-2xl glass-card glass-card-hover glow-card font-mono text-[11px] space-y-2.5 relative overflow-hidden">
                {/* Subtle top specular sheen highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />
                <div className="flex items-center justify-between text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Compass
                      className="w-3.5 h-3.5 text-primary animate-spin"
                      style={{ animationDuration: "12s" }}
                    />
                    <span>ROTOR TELEMETRY</span>
                  </div>
                  <span ref={drumAngleTextRef} className="text-text-main font-bold">
                    0.0° REEL
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-white/60 text-[10px]">
                  <span className="text-text-muted">FOCAL ALIGNMENT</span>
                  <span className="text-primary font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    AXIS 0° LOCKED
                  </span>
                </div>
              </div>

              {/* Stepper Buttons & Station Selectors */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
                  {PROJECTS.map((project, idx) => {
                    const isActive = activeIndex === idx;
                    return (
                      <button
                        key={project.id}
                        onClick={() => transitionToCard(idx)}
                        className={cn(
                          "transition-colors duration-200 cursor-pointer flex items-center gap-1 px-1.5 py-0.5 rounded",
                          isActive
                            ? "text-primary font-bold bg-primary/10"
                            : "text-text-muted/60 hover:text-text-main"
                        )}
                        title={`Rotate drum to ${project.title}`}
                      >
                        <span>0{idx + 1}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Step Controls */}
                <div className="flex items-center gap-1 font-mono text-[10px]">
                  <button
                    onClick={() => transitionToCard(Math.max(0, activeIndex - 1))}
                    disabled={activeIndex === 0}
                    className="p-1.5 rounded-lg glass-pill text-text-muted hover:text-primary hover:border-primary/40 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
                    title="Previous card (Arrow Up)"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      transitionToCard(
                        Math.min(PROJECTS.length - 1, activeIndex + 1)
                      )
                    }
                    disabled={activeIndex === PROJECTS.length - 1}
                    className="p-1.5 rounded-lg glass-pill text-text-muted hover:text-primary hover:border-primary/40 disabled:opacity-25 disabled:pointer-events-none transition-colors cursor-pointer shadow-2xs"
                    title="Next card (Arrow Down)"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Left Column Footer */}
            <div className="pt-4 border-t border-border-light/60 space-y-3">
              {/* Continuous Progress Bar */}
              <div className="w-full h-1 bg-border-light/60 rounded-full overflow-hidden">
                <div
                  ref={progressBarRef}
                  className="h-full bg-primary origin-left will-change-transform"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                  <span className="text-primary font-semibold">
                    [{PROJECTS[activeIndex]?.code}]
                  </span>
                  <span className="text-text-main font-semibold truncate">
                    {PROJECTS[activeIndex]?.title}
                  </span>
                </div>
                <Link
                  href="https://github.com/cosmos-127"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors flex items-center gap-1 shrink-0"
                >
                  <GithubIcon className="w-3 h-3" />
                  <span>github ↗</span>
                </Link>
              </div>

              <div className="text-[10px] font-mono text-text-muted/60 flex items-center gap-1.5">
                <MoveVertical className="w-3 h-3 text-primary/70" />
                <span>Scroll, drag drum stage, or use ▲▼ arrows</span>
              </div>
            </div>
          </div>

          {/* WIDE RIGHT STAGE: 3D CYLINDRICAL DRUM WITH THREE.JS ARMATURE & DOM CARDS */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={cn(
              "flex-1 h-[780px] lg:h-[860px] max-w-[860px] relative flex items-center justify-center select-none",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            {/* Caliper HUD Datum Guides on Stage Perimeter */}
            <div className="absolute left-1 top-8 bottom-8 flex flex-col justify-between items-center z-10 pointer-events-none opacity-45 font-mono text-[9px] text-text-muted select-none">
              <span className="tracking-widest rotate-[-90deg] origin-center whitespace-nowrap">
                +{STEP_ANGLE_DEG}° REEL
              </span>
              <div className="w-px flex-1 bg-border-light my-2 relative overflow-hidden">
                {/* Dynamic Vernier Tick Strip sliding with continuous drum rotation */}
                <div
                  ref={vernierStripRef}
                  className="absolute inset-x-0 w-full h-40 flex flex-col justify-between items-center opacity-60"
                  style={{
                    transform: "translateY(0px)",
                  }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-px bg-text-muted/60 transition-all",
                        i % 2 === 0 ? "w-2 bg-primary/60" : "w-1"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div
                ref={axisLockRef}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded font-bold border whitespace-nowrap transition-all duration-300 bg-primary/15 text-primary border-primary/40 shadow-[0_0_8px_rgba(230,57,70,0.25)] scale-105"
              >
                <span>AXIS 0°</span>
              </div>
              <div className="w-px flex-1 bg-border-light my-2" />
              <span className="tracking-widest rotate-[-90deg] origin-center whitespace-nowrap">
                -{STEP_ANGLE_DEG}° REEL
              </span>
            </div>

            <div className="absolute right-1 top-8 bottom-8 flex flex-col justify-between items-center z-10 pointer-events-none opacity-45 font-mono text-[9px] text-text-muted select-none">
              <span>▲ REEL</span>
              <div className="flex flex-col gap-1.5 py-2">
                {PROJECTS.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-1 rounded-full transition-all duration-200",
                      activeIndex === i
                        ? "bg-primary shadow-[0_0_6px_var(--primary)] h-4.5"
                        : "bg-border-light h-3"
                    )}
                  />
                ))}
              </div>
              <span>▼ REEL</span>
            </div>

            {/* 3D Cylindrical Drum Rotating Container */}
            <div
              className="w-full h-full flex items-center justify-center relative"
              style={{
                perspective: "1200px",
                perspectiveOrigin: "center center",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                className="w-full relative flex items-center justify-center"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 3D Deep Drum Axle & Volumetric Core Backdrop */}
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10"
                  style={{
                    transform: "translateZ(-140px)",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Horizontal Drum Axle Shaft */}
                  <div className="w-[94%] max-w-[820px] h-[1px] bg-gradient-to-r from-transparent via-border-light to-transparent relative opacity-60">
                    {/* Left Flange Hub Bearing */}
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-border-light/70 border-dashed opacity-40 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full border border-primary/30" />
                    </div>

                    {/* Central Radial Rotor Core Glow */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                    {/* Right Flange Hub Bearing */}
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-border-light/70 border-dashed opacity-40 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full border border-primary/30" />
                    </div>
                  </div>
                </div>

                {PROJECTS.map((project, idx) => (
                  <div
                    key={project.id}
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                    onClick={() => {
                      if (hasDraggedRef.current) return;
                      if (activeIndex !== idx) {
                        transitionToCard(idx);
                      }
                    }}
                    className={cn(
                      "absolute inset-x-0 mx-auto w-full max-w-[660px] will-change-transform",
                      activeIndex !== idx ? "cursor-pointer" : ""
                    )}
                    style={{
                      backfaceVisibility: "hidden",
                      transformStyle: "preserve-3d",
                    }}
                    title={
                      activeIndex !== idx
                        ? `Rotate drum to ${project.title}`
                        : undefined
                    }
                  >
                    {/* Minimalist 3D Drum Flank Spoke Assembly */}
                    <DrumSpokeAssembly
                      idx={idx}
                      isActive={activeIndex === idx}
                    />

                    <ProjectCard
                      project={project}
                      isActive={activeIndex === idx}
                      allowLinks={!isDragging}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VIEW (< 768px): RESPONSIVE VERTICAL STACK */}
      <div className="md:hidden max-w-xl mx-auto px-6 py-20">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SYSTEM ARCHITECTURE</span>
            <span className="w-6 h-px bg-primary/40" />
            <span>[01]</span>
          </div>
          <h2 className="font-gued font-bold text-2xl sm:text-3xl text-text-main tracking-tight leading-snug">
            Systems designed to solve <span className="font-serif italic font-normal text-primary tracking-normal">real AI bottlenecks</span>
            <span className="text-primary font-bold">.</span>
          </h2>
          <p className="text-text-muted mt-2 text-sm font-sans">
            Minimal, purpose-built systems spanning production serving
            telemetry, agent protocols, relational retrieval, and federated
            intelligence.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {PROJECTS.map((project) => (
            <div key={project.id} className="mobile-project-card min-h-[560px]">
              <ProjectCard project={project} isActive={true} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
