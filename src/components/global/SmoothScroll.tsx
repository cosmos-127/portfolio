"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Orchestrates Lenis smooth scrolling with GSAP ScrollTrigger and anchor links
 */
function LenisScrollManager() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // 1. Synchronize ScrollTrigger on every Lenis scroll step
    const onScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", onScroll);

    // 2. Drive Lenis through GSAP's RAF ticker for zero-jitter, unified 120fps synchronization
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // 3. Keep Lenis dimensions synced with ScrollTrigger refreshes
    const onScrollTriggerRefresh = () => {
      lenis.resize();
    };
    ScrollTrigger.addEventListener("refresh", onScrollTriggerRefresh);

    // Initial refresh after fonts & layout have settled
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 120);

    // 4. Handle initial deep-link hash on page mount (e.g. #about, #projects)
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash;
      const initialEl = document.querySelector(hash);
      if (initialEl) {
        setTimeout(() => {
          lenis.scrollTo(initialEl as HTMLElement, {
            offset: -72,
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }, 200);
      }
    }

    // 5. Global buttery smooth scrolling for in-page anchor links (#about, #projects, #contact, etc.)
    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        e.preventDefault();
        if (href === "#top") {
          lenis.scrollTo(0, {
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
          window.history.replaceState(null, "", href);
        } else {
          const target = document.querySelector(href);
          if (target) {
            lenis.scrollTo(target as HTMLElement, {
              offset: -72,
              duration: 1.2,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
            window.history.replaceState(null, "", href);
          }
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      clearTimeout(refreshTimer);
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(onTick);
      ScrollTrigger.removeEventListener("refresh", onScrollTriggerRefresh);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, [lenis]);

  return null;
}

/**
 * Hardware-accelerated top reading progress bar driven directly by Lenis scroll progress
 */
function LenisReadingBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useLenis((lenis) => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${lenis.progress})`;
    }
  });

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-primary z-[100] origin-left pointer-events-none will-change-transform"
      style={{ transform: "scaleX(0)" }}
      aria-hidden="true"
    />
  );
}

/**
 * Root Smooth Scroll Provider using Lenis
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        lerp: 0.082, // Elegant, responsive inertia without floatiness
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.6,
        syncTouch: false,
        autoRaf: false, // Orchestrated by GSAP ticker for 100% sync with ScrollTrigger
      }}
    >
      <LenisScrollManager />
      <LenisReadingBar />

      {/* Ambient noise texture overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {children}
    </ReactLenis>
  );
}
