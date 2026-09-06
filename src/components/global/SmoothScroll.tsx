"use client";

import { useEffect } from "react";
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

    // 1. Synchronize ScrollTrigger and apply fluid velocity-based micro-skew
    const isReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let isSettled = true;

    const onScroll = (e: { velocity: number }) => {
      ScrollTrigger.update();

      if (isReduced) return;

      const v = e.velocity || 0;
      const targetSkew = Math.max(-1.1, Math.min(1.1, v * 0.032));
      const elements = document.querySelectorAll(".velocity-skew");
      if (elements.length === 0) return;

      if (Math.abs(v) > 0.15) {
        isSettled = false;
        gsap.to(elements, {
          skewY: targetSkew,
          duration: 0.22,
          ease: "power1.out",
          overwrite: "auto",
        });
      } else if (!isSettled) {
        isSettled = true;
        gsap.to(elements, {
          skewY: 0,
          duration: 0.45,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    };
    lenis.on("scroll", onScroll);

    // 2. Drive Lenis through GSAP's RAF ticker for zero-jitter, unified 120fps synchronization
    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(500, 33);

    // 3. Keep Lenis dimensions synced with ScrollTrigger refreshes
    const onScrollTriggerRefresh = () => {
      lenis.resize();
    };
    ScrollTrigger.addEventListener("refresh", onScrollTriggerRefresh);

    // 0. Force scroll to top on reload and disable native browser scroll restoration
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });

      // Clean URL hash on reload so browser doesn't anchor-scroll down
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Refresh and sync when preloader iris reveal finishes
    const handlePreloaderDone = () => {
      ScrollTrigger.refresh();
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    };
    window.addEventListener("portfolio:preloader-done", handlePreloaderDone);

    // Initial refresh after fonts & layout have settled
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    }, 100);

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
      window.removeEventListener("portfolio:preloader-done", handlePreloaderDone);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [lenis]);

  return null;
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

      {/* Ambient noise texture overlay */}
      <div className="noise-overlay" aria-hidden="true" />

      {children}
    </ReactLenis>
  );
}
