"use client";

import { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  Search,
  Compass,
  Code2,
  Cpu,
  BookOpen,
  Mail,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Terminal,
  X,
  Sparkles,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, MediumIcon } from "@/components/ui/icons";
import { isSoundEnabled, toggleSound, playTick, playChime, subscribeSound } from "@/lib/sound";

interface CommandItem {
  id: string;
  category: "Navigation" | "Actions" | "External";
  title: string;
  description: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const soundOn = useSyncExternalStore(subscribeSound, isSoundEnabled, () => true);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  }, []);

  const handleCopy = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        playChime();
        showToast(`Copied ${label} to clipboard!`);
      } catch {
        showToast(`Failed to copy`);
      }
    },
    [showToast]
  );

  const scrollToSection = useCallback(
    (id: string) => {
      closePalette();
      playChime();
      if (lenis) {
        lenis.scrollTo(id, { offset: -70, duration: 1.2 });
      } else {
        const el = document.querySelector(id);
        el?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [closePalette, lenis]
  );

  const items: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-top",
        category: "Navigation",
        title: "Overview / Hero",
        description: "Back to top and 3D reasoning core",
        badge: "#top",
        icon: Compass,
        action: () => scrollToSection("#top"),
      },
      {
        id: "nav-projects",
        category: "Navigation",
        title: "Selected Projects",
        description: "Explore 3D drum of production deployments",
        badge: "[01]",
        icon: Code2,
        action: () => scrollToSection("#projects"),
      },
      {
        id: "nav-skills",
        category: "Navigation",
        title: "Skills & Systems Matrix",
        description: "LLMOps, Multi-Agent pipelines & inference serving",
        badge: "[02]",
        icon: Cpu,
        action: () => scrollToSection("#skills"),
      },
      {
        id: "nav-writing",
        category: "Navigation",
        title: "Engineering Writing",
        description: "Architecture breakdowns & technical notebooks",
        badge: "[03]",
        icon: BookOpen,
        action: () => scrollToSection("#writing"),
      },
      {
        id: "nav-about",
        category: "Navigation",
        title: "About & Engineering Focus",
        description: "Engineering principles, trajectory and philosophy",
        badge: "[04]",
        icon: Sparkles,
        action: () => scrollToSection("#about"),
      },
      {
        id: "nav-contact",
        category: "Navigation",
        title: "Direct Contact & Availability",
        description: "Telemetry status, direct email & channels",
        badge: "[05]",
        icon: Mail,
        action: () => scrollToSection("#contact"),
      },
      // Actions
      {
        id: "action-sound",
        category: "Actions",
        title: soundOn ? "Mute Micro-Haptic Audio" : "Enable Micro-Haptic Audio",
        description: soundOn ? "Turn off zero-asset synthesized audio clicks" : "Turn on mechanical ratchet clicks & chimes",
        badge: soundOn ? "ACTIVE" : "MUTED",
        icon: soundOn ? Volume2 : VolumeX,
        action: () => {
          const next = toggleSound();
          showToast(next ? "Micro-haptic audio enabled" : "Micro-haptic audio muted");
        },
      },
      {
        id: "action-test-audio",
        category: "Actions",
        title: "Test Audio Synthesis",
        description: "Play dual-tone crystal chime and ratchet click sample",
        badge: "TEST",
        icon: Volume2,
        action: () => {
          playTick(true);
          setTimeout(() => playChime(true), 90);
          showToast("Playing synthesized audio sample");
        },
      },
      {
        id: "action-gyro-sound",
        category: "Actions",
        title: "Test Gyro Dynamo Spin",
        description: "Engage 3D quantum gyro overdrive & rotation sound",
        badge: "DYNAMO",
        icon: Sparkles,
        action: () => {
          window.dispatchEvent(new CustomEvent("portfolio:gyro-press-start"));
          showToast("Engaging 3D gyro overdrive (2.5s)");
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("portfolio:gyro-press-end"));
          }, 2500);
        },
      },
      {
        id: "action-copy-email",
        category: "Actions",
        title: "Copy Direct Email",
        description: "cosmos.dev.127@gmail.com",
        badge: "CLIPBOARD",
        icon: Copy,
        action: () => handleCopy("cosmos.dev.127@gmail.com", "email"),
      },
      {
        id: "action-copy-curl",
        category: "Actions",
        title: "Copy cURL API Query",
        description: "curl -s https://cosmos127.dev/api/contact",
        badge: "CLI",
        icon: Terminal,
        action: () => handleCopy("curl -s https://cosmos127.dev/api/contact", "cURL command"),
      },
      // External
      {
        id: "ext-github",
        category: "External",
        title: "GitHub Profile",
        description: "github.com/cosmos-127 — Open source repos & experiments",
        badge: "EXTERNAL",
        icon: GithubIcon,
        action: () => {
          playChime();
          window.open("https://github.com/cosmos-127", "_blank", "noopener,noreferrer");
          closePalette();
        },
      },
      {
        id: "ext-linkedin",
        category: "External",
        title: "LinkedIn Profile",
        description: "linkedin.com/in/gagan-parashar — Professional background",
        badge: "EXTERNAL",
        icon: LinkedinIcon,
        action: () => {
          playChime();
          window.open("https://www.linkedin.com/in/gagan-parashar/", "_blank", "noopener,noreferrer");
          closePalette();
        },
      },
      {
        id: "ext-medium",
        category: "External",
        title: "Medium Notebook",
        description: "medium.com/@gaganparashar127 — Deep dives & system design",
        badge: "EXTERNAL",
        icon: MediumIcon,
        action: () => {
          playChime();
          window.open("https://medium.com/@gaganparashar127", "_blank", "noopener,noreferrer");
          closePalette();
        },
      },
    ],
    [soundOn, handleCopy, scrollToSection, closePalette, showToast]
  );

  // Filter commands by search query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    );
  }, [items, query]);

  // Global keyboard shortcut listeners (Cmd+K / Ctrl+K & Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          const next = !prev;
          if (next) playTick();
          return next;
        });
        return;
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        playTick();
        setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        playTick();
        setSelectedIndex((prev) =>
          filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0
        );
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
        }
      }
    };

    const handleOpenEvent = () => {
      playTick();
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("portfolio:open-palette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("portfolio:open-palette", handleOpenEvent);
    };
  }, [isOpen, filteredItems, selectedIndex, closePalette]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] sm:pt-[15vh] px-4 sm:px-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closePalette}
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -12, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.96, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl glass-card rounded-2xl shadow-2xl overflow-hidden font-mono z-10 flex flex-col max-h-[75vh] will-change-transform"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-1 bg-gradient-to-r from-primary via-rose-500 to-primary w-full shrink-0" />
              {/* Subtle top specular sheen highlight */}
              <div className="absolute inset-x-0 top-1 h-px bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />

              {/* Search Header */}
              <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-border-light bg-surface/40 shrink-0">
                <Search className="w-4 h-4 text-text-muted shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Type a command or jump to section..."
                  className="flex-1 bg-transparent text-sm text-text-main placeholder-text-muted/60 focus:outline-hidden font-mono"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSelectedIndex(0);
                    }}
                    className="text-text-muted hover:text-text-main p-1 rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-text-muted px-2 py-0.5 rounded-md bg-surface border border-border-light shadow-2xs">
                  ESC
                </kbd>
              </div>

              {/* Toast Feedback */}
              <AnimatePresence>
                {toastMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-50 text-emerald-800 text-xs px-5 py-2 flex items-center gap-2 border-b border-emerald-200 shrink-0"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{toastMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Result List */}
              <div
                ref={listRef}
                className="overflow-y-auto p-2 sm:p-3 space-y-1 flex-1 focus:outline-hidden"
              >
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-text-muted">
                    No commands matching &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  filteredItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => item.action()}
                        onMouseEnter={() => {
                          setSelectedIndex(idx);
                        }}
                        className={`relative w-full flex items-center justify-between px-3 sm:px-4 py-2.5 rounded-xl text-left transition-colors duration-150 cursor-pointer ${
                          isSelected
                            ? "text-primary"
                            : "text-text-main hover:bg-surface/40"
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="paletteItemActiveHighlight"
                            className="absolute inset-0 bg-primary/10 border border-primary/25 rounded-xl shadow-2xs -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}

                        <div className="flex items-center gap-3 min-w-0 z-10">
                          <div
                            className={`p-2 rounded-lg shrink-0 transition-colors ${
                              isSelected
                                ? "bg-primary text-white shadow-xs"
                                : "bg-surface border border-border-light text-text-muted"
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate flex items-center gap-2">
                              <span>{item.title}</span>
                              {item.badge && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                                    isSelected
                                      ? "bg-primary/20 text-primary"
                                      : "bg-surface text-text-muted border border-border-light"
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-text-muted truncate mt-0.5">
                              {item.description}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 ml-3 z-10">
                          {isSelected ? (
                            <span className="text-[10px] text-primary font-mono flex items-center gap-1 font-semibold">
                              <span>↵</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-muted font-mono capitalize">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer Controls & Hints */}
              <div className="px-4 sm:px-5 py-2.5 border-t border-border-light bg-surface/30 flex items-center justify-between text-[11px] text-text-muted shrink-0">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded-sm bg-surface border border-border-light text-[10px]">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded-sm bg-surface border border-border-light text-[10px]">
                      ↵
                    </kbd>
                    <span>Select</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono">
                    HAPTICS:{" "}
                    <span className={soundOn ? "text-emerald-600 font-bold" : "text-text-muted"}>
                      {soundOn ? "ON" : "OFF"}
                    </span>
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
