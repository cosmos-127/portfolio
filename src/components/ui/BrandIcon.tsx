import React from "react";
import { cn } from "@/lib/utils";

interface BrandIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
  withGlow?: boolean;
}

/**
 * BrandIcon - Official Identity Emblem for Gagan (cosmos-127)
 * Fuses the geometric monogram 'G', cosmic orbital path,
 * and a glowing 3D faceted crimson AI reasoning tensor core.
 */
export function BrandIcon({
  className = "w-6 h-6",
  size,
  withGlow = true,
  ...props
}: BrandIconProps) {
  const inlineSize = size ? { width: size, height: size } : {};

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      style={inlineSize}
      aria-label="Gagan — AI Systems Engineer Brand Icon"
      {...props}
    >
      <defs>
        <radialGradient id="bi-bgObsidian" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#141a27" />
          <stop offset="60%" stopColor="#080b11" />
          <stop offset="100%" stopColor="#030406" />
        </radialGradient>

        <radialGradient id="bi-coreBloom" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d5a" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#e63946" stopOpacity="0.5" />
          <stop offset="80%" stopColor="#e63946" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#e63946" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="bi-diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b76" />
          <stop offset="45%" stopColor="#e63946" />
          <stop offset="100%" stopColor="#a31422" />
        </linearGradient>

        <linearGradient id="bi-specularRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.32)" />
          <stop offset="45%" stopColor="rgba(230, 57, 70, 0.45)" />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.06)" />
        </linearGradient>

        <linearGradient id="bi-gStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="85%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>

        <mask id="bi-diamondCutout">
          <rect width="512" height="512" fill="white" />
          <polygon points="256,184 326,256 256,328 186,256" fill="black" />
        </mask>
      </defs>

      {/* Squircle Obsidian Frame */}
      <rect width="512" height="512" rx="116" fill="url(#bi-bgObsidian)" />
      <rect
        x="2"
        y="2"
        width="508"
        height="508"
        rx="114"
        fill="none"
        stroke="url(#bi-specularRim)"
        strokeWidth="2.5"
      />

      {/* Ambient Crimson Radiation Aura */}
      {withGlow && <circle cx="256" cy="256" r="150" fill="url(#bi-coreBloom)" />}

      {/* Geometric Monogram 'G' */}
      <path
        d="M 358 154
           A 144 144 0 1 0 400 256
           L 256 256"
        fill="none"
        stroke="url(#bi-gStroke)"
        strokeWidth="50"
        strokeLinecap="round"
        strokeLinejoin="round"
        mask="url(#bi-diamondCutout)"
      />

      {/* Central 3D Faceted Reasoning Tensor Diamond */}
      <polygon points="256,196 314,256 256,316 198,256" fill="url(#bi-diamondGrad)" />
      <polygon points="256,196 314,256 256,256" fill="#ffffff" fillOpacity="0.34" />
      <polygon points="256,196 198,256 256,256" fill="#ffffff" fillOpacity="0.14" />
      <polygon points="198,256 256,316 256,256" fill="#000000" fillOpacity="0.22" />
      <polygon
        points="256,196 314,256 256,316 198,256"
        fill="none"
        stroke="#ff949d"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="256" cy="256" r="7.5" fill="#ffffff" />
    </svg>
  );
}
