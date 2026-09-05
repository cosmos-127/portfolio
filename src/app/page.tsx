"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Projects } from "@/components/sections/Projects";
import { Writing } from "@/components/sections/Writing";
import { Contact } from "@/components/sections/Contact";
import { MouseSpotlight } from "@/components/global/MouseSpotlight";
import { CustomCursor } from "@/components/global/CustomCursor";


const UnifiedAISpatialCanvas = dynamic(
  () =>
    import("@/components/canvas/UnifiedAISpatialCanvas").then(
      (mod) => mod.UnifiedAISpatialCanvas
    ),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      <CustomCursor />

      <UnifiedAISpatialCanvas />
      <MouseSpotlight />
      <Navbar />
      <main className="flex-1 relative z-10 overflow-x-clip">
        <Hero />
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
