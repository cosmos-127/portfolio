"use client"

import React, { memo } from "react"

export interface AuroraTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

// Reddish theme palette complimenting the portfolio's #e63946 crimson identity
export const DEFAULT_RED_AURORA_COLORS = [
  "#e63946",
  "#ff4d6d",
  "#9d0208",
  "#d90429",
  "#c9184a",
]

export const AuroraText = memo(
  ({
    children,
    className = "",
    colors = DEFAULT_RED_AURORA_COLORS,
    speed = 1,
  }: AuroraTextProps) => {
    const gradientStyle: React.CSSProperties = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${
        colors[0]
      })`,
      backgroundSize: "200% auto",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animationDuration: `${10 / speed}s`,
    }

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
          className="animate-aurora relative bg-size-[200%_auto] bg-clip-text text-transparent"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    )
  }
)

AuroraText.displayName = "AuroraText"
