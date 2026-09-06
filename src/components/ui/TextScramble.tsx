"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { playTick } from "@/lib/sound";

interface TextScrambleProps {
  text: string;
  className?: string;
  as?: "span" | "div" | "p" | "h2" | "h3";
  hoverTrigger?: boolean;
  onScrambleEnd?: () => void;
  characters?: string;
}

const DEFAULT_CHARS = "0123456789ABCDEF!@#$%&*<>[]/_";

export function TextScramble({
  text,
  className = "",
  as: Component = "span",
  hoverTrigger = true,
  onScrambleEnd,
  characters = DEFAULT_CHARS,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  const [prevText, setPrevText] = useState(text);

  if (text !== prevText) {
    setPrevText(text);
    setDisplayText(text);
  }

  const isAnimatingRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  // Check reduced motion preference
  const isReducedMotion = useRef(false);
  useEffect(() => {
    isReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const scramble = useCallback(() => {
    if (isAnimatingRef.current || isReducedMotion.current) return;
    isAnimatingRef.current = true;
    playTick();

    const originalText = text;
    const length = originalText.length;
    let frame = 0;
    const totalFrames = Math.max(16, length * 2);

    const update = () => {
      const progress = frame / totalFrames;
      const resolvedChars = Math.floor(progress * length);

      let result = "";
      for (let i = 0; i < length; i++) {
        if (originalText[i] === " " || originalText[i] === "\n") {
          result += originalText[i];
        } else if (i < resolvedChars) {
          result += originalText[i];
        } else {
          result += characters[Math.floor(Math.random() * characters.length)];
        }
      }

      setDisplayText(result);

      if (frame < totalFrames) {
        frame++;
        frameRef.current = requestAnimationFrame(update);
      } else {
        setDisplayText(originalText);
        isAnimatingRef.current = false;
        onScrambleEnd?.();
      }
    };

    frameRef.current = requestAnimationFrame(update);
  }, [text, characters, onScrambleEnd]);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <Component
      onMouseEnter={hoverTrigger ? scramble : undefined}
      className={`inline-block select-none will-change-contents ${className}`}
      data-scramble="true"
    >
      {displayText}
    </Component>
  );
}
