"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Writing } from "@/components/sections/Writing";
import { Contact } from "@/components/sections/Contact";
import { TickerStrip } from "@/components/global/TickerStrip";
import { Preloader } from "@/components/global/Preloader";

// Code-split heavy interactive & 3D client components so initial HTML / typography renders instantaneously
const UnifiedAISpatialCanvas = dynamic(
  () =>
    import("@/components/canvas/UnifiedAISpatialCanvas").then(
      (mod) => mod.UnifiedAISpatialCanvas
    ),
  { ssr: false }
);

const CommandPalette = dynamic(
  () =>
    import("@/components/global/CommandPalette").then(
      (mod) => mod.CommandPalette
    ),
  { ssr: false }
);

const CustomCursor = dynamic(
  () =>
    import("@/components/global/CustomCursor").then(
      (mod) => mod.CustomCursor
    ),
  { ssr: false }
);

const MouseSpotlight = dynamic(
  () =>
    import("@/components/global/MouseSpotlight").then(
      (mod) => mod.MouseSpotlight
    ),
  { ssr: false }
);

const SectionHUD = dynamic(
  () =>
    import("@/components/global/SectionHUD").then(
      (mod) => mod.SectionHUD
    ),
  { ssr: false }
);

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);

      // DevTools Console Easter Egg for engineers & hiring teams
      const titleStyle =
        "background: #e63946; color: #ffffff; font-weight: 800; font-size: 12px; padding: 4px 8px; border-radius: 4px 0 0 4px; font-family: monospace;";
      const subStyle =
        "background: #0f172a; color: #38bdf8; font-weight: 700; font-size: 12px; padding: 4px 8px; border-radius: 0 4px 4px 0; font-family: monospace;";
      const textStyle =
        "color: #64748b; font-size: 11px; font-family: monospace; line-height: 1.6;";
      const linkStyle =
        "color: #e63946; font-weight: bold; font-family: monospace; font-size: 11px;";

      console.log(
        "%c GAGAN %c AI SYSTEMS & LLMOPS ",
        titleStyle,
        subStyle
      );
      console.log(
        `%cThanks for inspecting the console! Specializing in compound AI architectures, autonomous agent workflows (LangGraph, ReWOO, ReAct), GraphRAG, and production model serving with vLLM.\n\n%c→ Email: cosmos.dev.127@gmail.com\n→ GitHub: https://github.com/cosmos-127\n→ LinkedIn: https://linkedin.com/in/gagan-parashar`,
        textStyle,
        linkStyle
      );
    }
  }, []);

  return (
    <>
      <Preloader />
      <CustomCursor />
      <CommandPalette />
      <SectionHUD />

      <UnifiedAISpatialCanvas />
      <MouseSpotlight />
      <Navbar />
      <main className="flex-1 relative z-10 overflow-x-clip bg-grid-blueprint">
        <Hero />
        <TickerStrip />
        <Projects />
        <Skills />
        <Writing />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
