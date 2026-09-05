"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Writing", href: "#writing" },
  { name: "Contact", href: "#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);

  useLenis((lenis) => {
    const isPastThreshold = lenis.scroll > 40;
    setScrolled((prev) => (prev !== isPastThreshold ? isPastThreshold : prev));

    // Update razor scroll progress line directly
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = `scaleX(${lenis.progress})`;
    }

    if (lenis.scroll < 180) {
      setActiveSection((prev) => (prev !== "" ? "" : prev));
      return;
    }

    const sections = NAV_LINKS.map((link) => link.href.substring(1));
    let current = "";

    for (const section of sections) {
      const element = document.getElementById(section);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 220 && rect.bottom > 140) {
          current = section;
          break;
        }
      }
    }

    if (current) {
      setActiveSection((prev) => (prev !== current ? current : prev));
    }
  });

  return (
    <>
      {/* Razor-Thin Top Scroll Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[100] bg-transparent pointer-events-none">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-primary via-rose-500 to-primary origin-left will-change-transform shadow-[0_0_10px_rgba(230,57,70,0.85)]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 sm:pt-4 pointer-events-none"
      >
        <div
          className={cn(
            "max-w-5xl mx-auto transition-all duration-300 pointer-events-auto rounded-full px-4 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between border bg-white/95 backdrop-blur-md",
            scrolled
              ? "border-border-strong/60 shadow-md shadow-black/[0.05]"
              : "border-border-light shadow-xs"
          )}
        >
          {/* Logo */}
          <Link
            href="#top"
            className="flex items-center gap-2 group shrink-0"
          >
            <span className="font-secondary font-bold text-xl sm:text-2xl tracking-tight text-text-main group-hover:text-primary transition-colors">
              Gagan
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface border border-border-light text-text-muted">
              AI ENGINEER
            </span>
          </Link>

          {/* Desktop Navigation (lg+) */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 text-xs font-mono relative">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-1.5 rounded-full transition-colors duration-200",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-text-muted hover:text-text-main hover:bg-surface"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-primary/10 border border-primary/25 rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Get in touch CTA */}
            <Link
              href="#contact"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-text-main text-white px-3.5 py-1.5 rounded-full hover:bg-primary transition-colors"
            >
              <span>Get in touch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger (below md) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-surface text-text-main transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 sm:inset-x-4 top-16 sm:top-20 z-40 md:hidden bg-white/95 backdrop-blur-xl border border-border-light rounded-2xl shadow-xl p-5 sm:p-6"
          >
            <div className="flex flex-col gap-3 font-mono text-sm">
              <div className="pb-3 border-b border-border-light text-xs text-text-muted">
                NAVIGATION
              </div>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 rounded-lg transition-colors flex items-center justify-between",
                    activeSection === link.href.substring(1)
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-text-main hover:bg-surface"
                  )}
                >
                  <span>{link.name}</span>
                  <span className="text-xs text-text-muted font-light">→</span>
                </Link>
              ))}
              <div className="pt-3 border-t border-border-light mt-1">
                <Link
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 text-center py-2.5 bg-primary text-white text-xs rounded-xl font-mono"
                >
                  <span>Let&apos;s talk</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
