"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 20 },
          {
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 94%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          }
        );
      }
    },
    { scope: footerRef }
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={footerRef} className="w-full border-t border-white/70 bg-white/50 backdrop-blur-md py-12">
      <div ref={contentRef} className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-text-muted">
        
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
            className="group p-2 rounded-full glass-pill hover:border-primary hover:text-primary transition-all cursor-pointer shadow-2xs"
            aria-label="Back to top"
            title="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>

      </div>
    </footer>
  );
}
