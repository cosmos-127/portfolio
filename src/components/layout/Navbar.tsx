"use client";

import { useState, useRef, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { Menu, X, ArrowUpRight, Command, Volume2, VolumeX } from "lucide-react";
import { isSoundEnabled, toggleSound, subscribeSound, playTick } from "@/lib/sound";

import { TextScramble } from "@/components/ui/TextScramble";

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
  const soundActive = useSyncExternalStore(subscribeSound, isSoundEnabled, () => true);

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
        transition={{ duration: 0.65, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-3 sm:pt-4 pointer-events-none"
      >
        <div
          className={cn(
            "max-w-5xl mx-auto transition-all duration-300 pointer-events-auto rounded-full px-4 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between glass-panel",
            scrolled
              ? "border-white shadow-lg shadow-black/[0.06]"
              : "shadow-xs"
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
                  onClick={() => playTick()}
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
                  <TextScramble text={link.name} />
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Audio Micro-Haptic Toggle */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                toggleSound();
              }}
              className={cn(
                "p-1.5 sm:p-2 rounded-full border transition-colors cursor-pointer",
                soundActive
                  ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                  : "bg-surface border-border-light text-text-muted hover:text-text-main"
              )}
              title={soundActive ? "Mute Micro-Haptic Audio" : "Enable Micro-Haptic Audio"}
              aria-label="Toggle Audio Effects"
            >
              {soundActive ? (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </motion.button>

            {/* Command Palette Trigger Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playTick();
                window.dispatchEvent(new CustomEvent("portfolio:open-palette"));
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-full bg-surface border border-border-light text-text-muted hover:text-text-main hover:border-border-strong transition-colors cursor-pointer shadow-2xs"
              title="Open Command Palette (Cmd + K / Ctrl + K)"
            >
              <Command className="w-3 h-3 text-primary" />
              <span className="hidden xs:inline text-[11px]">K</span>
            </motion.button>

            {/* Get in touch CTA */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="hidden sm:inline-block"
            >
              <Link
                href="#contact"
                className="group flex items-center gap-1.5 text-xs font-mono bg-text-main text-white px-3.5 py-1.5 rounded-full hover:bg-primary transition-all duration-200 shadow-2xs"
              >
                <span>Get in touch</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </Link>
            </motion.div>

            {/* Mobile Hamburger (below md) */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-surface text-text-main transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer Backdrop & Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3 sm:inset-x-4 top-16 sm:top-20 z-50 md:hidden glass-card rounded-2xl shadow-2xl p-5 sm:p-6 relative overflow-hidden will-change-transform"
            >
              {/* Subtle top specular sheen highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />
              <div className="flex flex-col gap-3 font-mono text-sm">
                <div className="flex items-center justify-between pb-3 border-b border-border-light text-xs text-text-muted">
                  <span>NAVIGATION</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      playTick();
                      window.dispatchEvent(new CustomEvent("portfolio:open-palette"));
                    }}
                    className="inline-flex items-center gap-1.5 text-primary text-[11px] font-semibold cursor-pointer"
                  >
                    <Command className="w-3 h-3" />
                    <span>Search (⌘K)</span>
                  </button>
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
                <div className="pt-3 border-t border-border-light mt-1 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      toggleSound();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface border border-border-light text-xs text-text-main font-mono cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {soundActive ? <Volume2 className="w-3.5 h-3.5 text-primary" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>Micro-Haptics</span>
                    </span>
                    <span className={soundActive ? "text-emerald-600 font-bold" : "text-text-muted"}>
                      {soundActive ? "ENABLED" : "MUTED"}
                    </span>
                  </button>

                  <Link
                    href="#contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 text-center py-2.5 bg-primary text-white text-xs rounded-xl font-mono hover:bg-primary/90 transition-colors shadow-2xs"
                  >
                    <span>Let&apos;s talk</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
