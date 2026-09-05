"use client";

import Link from "next/link";
import { ArrowUp } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t border-white/70 bg-white/50 backdrop-blur-md py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-text-muted">
        
        {/* Left info */}
        <div className="flex items-center gap-3">
          <Link href="#top" className="font-gued font-bold text-xl text-text-main hover:text-primary transition-colors">
            Gagan
          </Link>
          <span className="text-border-strong">/</span>
          <span className="text-[11px]">Generalist AI Engineer</span>
        </div>

        {/* Center tech stack */}
        <div className="flex items-center gap-2 text-center text-[11px]">
          <span>Next.js</span>
          <span>·</span>
          <span>Three.js</span>
          <span>·</span>
          <span>Tailwind CSS</span>
          <span>·</span>
          <span>GSAP</span>
        </div>

        {/* Right back to top & copyright */}
        <div className="flex items-center gap-6">
          <span className="text-[11px]">
            Designed &amp; built by Gagan · {new Date().getFullYear()}
          </span>

          <button
            onClick={scrollToTop}
            className="p-2 rounded-full glass-pill hover:border-primary hover:text-primary transition-colors cursor-pointer shadow-2xs"
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
