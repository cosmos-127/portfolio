"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, PerformanceMonitor } from "@react-three/drei";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { startGyroDynamo, updateGyroDynamo, stopGyroDynamo } from "@/lib/sound";

// Fast linear interpolation between 4 color states based on weights
function blendColors(
  out: THREE.Color,
  c0: THREE.Color,
  c1: THREE.Color,
  c2: THREE.Color,
  c3: THREE.Color,
  w0: number,
  w1: number,
  w2: number,
  w3: number
) {
  const sum = w0 + w1 + w2 + w3;
  const inv = sum > 0.0001 ? 1 / sum : 1;
  out.r = (c0.r * w0 + c1.r * w1 + c2.r * w2 + c3.r * w3) * inv;
  out.g = (c0.g * w0 + c1.g * w1 + c2.g * w2 + c3.g * w3) * inv;
  out.b = (c0.b * w0 + c1.b * w1 + c2.b * w2 + c3.b * w3) * inv;
}

// ============================================================================
// CHOREOGRAPHED 3D SECTION SPATIAL TARGETS
// ============================================================================
export interface SectionSpatialConfig {
  id: string;
  x: number; // Horizontal multiplier (positive = right, negative = left, 0 = center)
  y: number; // Vertical world offset
  z: number; // World depth offset
  scale: number; // Scale multiplier (1.0 = full scale)
  opacity: number; // Opacity 0 to 1
  blur: number; // Blur in px (0 = crisp, no blur)
  rotX: number; // Pitch offset
  rotY: number; // Yaw offset
  rotZ: number; // Roll offset
}

export const SECTION_SPATIALS: SectionSpatialConfig[] = [
  // 0. Hero Section: Perfectly balanced in right column stage (0.65), crisp and fully opaque
  {
    id: "top",
    x: 0.65,
    y: 0.0,
    z: 0.0,
    scale: 0.8,
    opacity: 1.0,
    blur: 0,
    rotX: 0.0,
    rotY: 0.0,
    rotZ: 0.0,
  },
  // 1. About Section: Right column stage, crisp beside career timeline (no text on right side of screen)
  {
    id: "about",
    x: 0.82,
    y: 0.0,
    z: 0.0,
    scale: 0.8,
    opacity: 0.95,
    blur: 0,
    rotX: Math.PI * 0.45,
    rotY: Math.PI * 1.3,
    rotZ: Math.PI * 0.1,
  },
  // 2. Projects Section: Sweeping behind 3D revolving project drum showcase with deep frosted atmospheric blur
  {
    id: "projects",
    x: -0.72,
    y: 0.10,
    z: -0.85,
    scale: 0.8,
    opacity: 0.38,
    blur: 40.0,
    rotX: Math.PI * 0.85,
    rotY: Math.PI * 2.5,
    rotZ: -Math.PI * 0.12,
  },
  // 3. Skills Section: Floating behind capability matrix with deep frosted atmospheric blur
  {
    id: "skills",
    x: 0.72,
    y: -0.06,
    z: -0.85,
    scale: 0.8,
    opacity: 0.38,
    blur: 40.0,
    rotX: Math.PI * 1.35,
    rotY: Math.PI * 3.7,
    rotZ: Math.PI * 0.14,
  },
  // 4. Writing Section: Floating behind technical article cards with deep frosted atmospheric blur
  {
    id: "writing",
    x: -0.70,
    y: 0.04,
    z: -0.85,
    scale: 0.8,
    opacity: 0.38,
    blur: 40.0,
    rotX: Math.PI * 1.8,
    rotY: Math.PI * 4.9,
    rotZ: -Math.PI * 0.08,
  },
  // 5. Contact Section: Floating behind communication channels with deep frosted atmospheric blur
  {
    id: "contact",
    x: -0.72,
    y: 0.1,
    z: -0.85,
    scale: 0.8,
    opacity: 0.38,
    blur: 40.0,
    rotX: Math.PI * 2.15,
    rotY: Math.PI * 6.0,
    rotZ: 0.0,
  },
];

// Measure real-time scroll focal points of each section in the document
function measureFocalPoints(): number[] {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return [0, 800, 1800, 2700, 3600, 4500];
  }

  const winH = window.innerHeight;
  const maxScroll = Math.max(
    1,
    document.documentElement.scrollHeight - winH
  );
  const currentScroll = window.scrollY;

  const results: number[] = [];

  for (let i = 0; i < SECTION_SPATIALS.length; i++) {
    if (i === 0) {
      results.push(0); // Top of Hero is scroll 0
      continue;
    }
    if (i === SECTION_SPATIALS.length - 1) {
      results.push(maxScroll); // Bottom of Contact
      continue;
    }

    const el = document.getElementById(SECTION_SPATIALS[i].id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const elTopInDoc = rect.top + currentScroll;
      const elCenterInDoc = elTopInDoc + rect.height / 2;
      const focalScroll = Math.max(
        0,
        Math.min(maxScroll, elCenterInDoc - winH / 2)
      );
      results.push(focalScroll);
    } else {
      results.push((i / (SECTION_SPATIALS.length - 1)) * maxScroll);
    }
  }

  // Ensure strict monotonic increase with a minimum separation buffer
  for (let i = 1; i < results.length; i++) {
    if (results[i] <= results[i - 1]) {
      results[i] = results[i - 1] + 40;
    }
  }

  return results;
}

// Continuous, smoothstep section interpolation
function sampleSectionSpatial(
  scrollY: number,
  focals: number[]
): {
  id: string;
  x: number;
  y: number;
  z: number;
  scale: number;
  opacity: number;
  blur: number;
  rotX: number;
  rotY: number;
  rotZ: number;
} {
  if (!focals || focals.length < SECTION_SPATIALS.length) {
    return SECTION_SPATIALS[0];
  }

  // Before or at Hero section focal point (scroll position 0):
  if (scrollY <= focals[0]) {
    return SECTION_SPATIALS[0];
  }

  // At or past the final section focal point:
  if (scrollY >= focals[focals.length - 1]) {
    return SECTION_SPATIALS[SECTION_SPATIALS.length - 1];
  }

  // Find the active segment between two consecutive section focal points
  let idx = 0;
  for (let i = 0; i < focals.length - 1; i++) {
    if (scrollY >= focals[i] && scrollY <= focals[i + 1]) {
      idx = i;
      break;
    }
  }

  const s1 = SECTION_SPATIALS[idx];
  const s2 = SECTION_SPATIALS[idx + 1];
  const f1 = focals[idx];
  const f2 = focals[idx + 1];
  const range = Math.max(1, f2 - f1);
  const rawT = (scrollY - f1) / range;
  // Silky cubic hermite (smoothstep) easing
  const t = rawT * rawT * (3 - 2 * rawT);

  // Specialized easing for blur & opacity transitions
  let tBlur = t;
  let tOpacity = t;
  if (s1.id === "about" && s2.id === "projects") {
    // Keep crisp through the top of About, then smoothly transition into atmospheric blur for Projects
    const clampedRaw = rawT < 0.3 ? 0 : (rawT - 0.3) / 0.7;
    tBlur = clampedRaw * clampedRaw * (3 - 2 * clampedRaw);
    tOpacity = tBlur;
  }

  return {
    id: t < 0.5 ? s1.id : s2.id,
    x: THREE.MathUtils.lerp(s1.x, s2.x, t),
    y: THREE.MathUtils.lerp(s1.y, s2.y, t),
    z: THREE.MathUtils.lerp(s1.z, s2.z, t),
    scale: THREE.MathUtils.lerp(s1.scale, s2.scale, t),
    opacity: THREE.MathUtils.lerp(s1.opacity, s2.opacity, tOpacity),
    blur: THREE.MathUtils.lerp(s1.blur, s2.blur, tBlur),
    rotX: THREE.MathUtils.lerp(s1.rotX, s2.rotX, t),
    rotY: THREE.MathUtils.lerp(s1.rotY, s2.rotY, t),
    rotZ: THREE.MathUtils.lerp(s1.rotZ, s2.rotZ, t),
  };
}

interface ScrollState {
  scrollY: number;
  progress: number;
  velocity: number;
  focals: number[];
}

type ScrollStateRef = React.RefObject<ScrollState>;

// ============================================================================
// SIGNATURE 3D FIGURE: REVOLVING NEURAL TENSOR HYPER-LATTICE & GYROSCOPIC GIMBAL
// ============================================================================
function TensorHyperLattice({
  scrollState,
  wrapperRef,
}: {
  scrollState: ScrollStateRef;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { viewport, camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const midCageRef = useRef<THREE.Mesh>(null);
  const midCageMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const outerCageRef = useRef<THREE.Mesh>(null);
  const outerCageMaterialRef = useRef<THREE.MeshStandardMaterial>(null);

  const tempColor = useMemo(() => new THREE.Color(), []);
  const tempEmissive = useMemo(() => new THREE.Color(), []);

  // ==========================================================================
  // FOUR DYNAMIC STATES (100% Opaque, Rich, Saturated Pigments):
  // State 0: NOMINAL SYSTEM (Deep Crimson Ruby & Titanium Obsidian Slate)
  // State 1: RATCHET IGNITION (Bold Opaque Scarlet & Deep Cobalt/Sky)
  // State 2: RESONANT SOLAR CORE (Rich Molten Cadmium Amber & Burning Gold)
  // State 3: TURBINE OVERDRIVE (Deep Royal Sapphire, Vivid Violet, Magenta & Emerald)
  // ==========================================================================

  // State 0 (Nominal System - Deep Saturated Brand Crimson & Titanium Obsidian Slate)
  const cCore0 = useMemo(() => new THREE.Color("#b91c1c"), []);
  const emCore0 = useMemo(() => new THREE.Color("#7f1d1d"), []);
  const cCageMid0 = useMemo(() => new THREE.Color("#b91c1c"), []);
  const cCageOut0 = useMemo(() => new THREE.Color("#0f172a"), []);
  const emCageOut0 = useMemo(() => new THREE.Color("#000000"), []);
  const cR1_0 = useMemo(() => new THREE.Color("#dc2626"), []);
  const emR1_0 = useMemo(() => new THREE.Color("#991b1b"), []);
  const cR2_0 = useMemo(() => new THREE.Color("#1e293b"), []);
  const emR2_0 = useMemo(() => new THREE.Color("#0f172a"), []);
  const cR2Node_0 = useMemo(() => new THREE.Color("#0284c7"), []);
  const cR3_0 = useMemo(() => new THREE.Color("#b91c1c"), []);
  const emR3_0 = useMemo(() => new THREE.Color("#7f1d1d"), []);
  const cLight0 = useMemo(() => new THREE.Color("#dc2626"), []);

  // State 1 (Ratchet Ignition - Bold Opaque Scarlet & Deep Cobalt/Sky)
  const cCore1 = useMemo(() => new THREE.Color("#dc2626"), []);
  const emCore1 = useMemo(() => new THREE.Color("#991b1b"), []);
  const cCageMid1 = useMemo(() => new THREE.Color("#e11d48"), []);
  const cCageOut1 = useMemo(() => new THREE.Color("#334155"), []);
  const emCageOut1 = useMemo(() => new THREE.Color("#991b1b"), []);
  const cR1_1 = useMemo(() => new THREE.Color("#dc2626"), []);
  const emR1_1 = useMemo(() => new THREE.Color("#b91c1c"), []);
  const cR2_1 = useMemo(() => new THREE.Color("#0284c7"), []);
  const emR2_1 = useMemo(() => new THREE.Color("#0369a1"), []);
  const cR2Node_1 = useMemo(() => new THREE.Color("#38bdf8"), []);
  const cR3_1 = useMemo(() => new THREE.Color("#e11d48"), []);
  const emR3_1 = useMemo(() => new THREE.Color("#be123c"), []);
  const cLight1 = useMemo(() => new THREE.Color("#dc2626"), []);

  // State 2 (Resonant Solar Core - Rich Molten Cadmium Amber & Burning Gold)
  const cCore2 = useMemo(() => new THREE.Color("#d97706"), []);
  const emCore2 = useMemo(() => new THREE.Color("#b45309"), []);
  const cCageMid2 = useMemo(() => new THREE.Color("#f59e0b"), []);
  const cCageOut2 = useMemo(() => new THREE.Color("#b45309"), []);
  const emCageOut2 = useMemo(() => new THREE.Color("#92400e"), []);
  const cR1_2 = useMemo(() => new THREE.Color("#f59e0b"), []);
  const emR1_2 = useMemo(() => new THREE.Color("#d97706"), []);
  const cR2_2 = useMemo(() => new THREE.Color("#ea580c"), []);
  const emR2_2 = useMemo(() => new THREE.Color("#c2410c"), []);
  const cR2Node_2 = useMemo(() => new THREE.Color("#f59e0b"), []);
  const cR3_2 = useMemo(() => new THREE.Color("#eab308"), []);
  const emR3_2 = useMemo(() => new THREE.Color("#ca8a04"), []);
  const cLight2 = useMemo(() => new THREE.Color("#f59e0b"), []);

  // State 3 (Turbine Overdrive - Deep Royal Sapphire, Vivid Violet, Magenta & Emerald)
  const cCore3 = useMemo(() => new THREE.Color("#1e40af"), []);
  const emCore3 = useMemo(() => new THREE.Color("#1d4ed8"), []);
  const cCageMid3 = useMemo(() => new THREE.Color("#be123c"), []);
  const cCageOut3 = useMemo(() => new THREE.Color("#0284c7"), []);
  const emCageOut3 = useMemo(() => new THREE.Color("#0369a1"), []);
  const cR1_3 = useMemo(() => new THREE.Color("#0284c7"), []);
  const emR1_3 = useMemo(() => new THREE.Color("#0369a1"), []);
  const cR2_3 = useMemo(() => new THREE.Color("#7c3aed"), []);
  const emR2_3 = useMemo(() => new THREE.Color("#6d28d9"), []);
  const cR2Node_3 = useMemo(() => new THREE.Color("#8b5cf6"), []);
  const cR3_3 = useMemo(() => new THREE.Color("#059669"), []);
  const emR3_3 = useMemo(() => new THREE.Color("#047857"), []);
  const cLight3 = useMemo(() => new THREE.Color("#0284c7"), []);

  // Stage 3 Chromatic Ring Materials & Synchronized Node/Notch Refs
  const ring1MaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const ring1NodeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const ring1NotchMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const ring2MaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const ring2NodeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const ring2NotchMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const ring3MaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const ring3NodeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const ring3NotchMatRef = useRef<THREE.MeshStandardMaterial>(null);

  const ring1GroupRef = useRef<THREE.Group>(null);
  const ring2GroupRef = useRef<THREE.Group>(null);
  const ring3GroupRef = useRef<THREE.Group>(null);
  const shardsRef = useRef<(THREE.Mesh | null)[]>([]);
  const tetraRefs = useRef<(THREE.Group | null)[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const projectPulse = useRef(0);

  // Interaction and animation physics state (Strict hold-only interaction)
  const isHolding = useRef(false);
  const holdDuration = useRef(0);
  const displayedStageRef = useRef(0);
  const s1Amount = useRef(0);
  const s2Amount = useRef(0);
  const s3Amount = useRef(0);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const tempGyroVec = useRef(new THREE.Vector3());
  const lastGyroTime = useRef(0);
  const glowCardsRef = useRef<HTMLElement[]>([]);

  // Floating Quantized FP16 / INT4 Tensor Shards with serene orbital parameters
  const tensorShards = useMemo(
    () => [
      { radius: 1.65, height: 0.9, speed: 0.14, phase: 0, size: 0.18, color: "#b91c1c" },
      { radius: 1.55, height: 1.05, speed: -0.11, phase: 1.2, size: 0.15, color: "#1e293b" },
      { radius: 1.72, height: -0.85, speed: 0.13, phase: 2.4, size: 0.19, color: "#b91c1c" },
      { radius: 1.6, height: -1.0, speed: -0.12, phase: 3.6, size: 0.14, color: "#334155" },
      { radius: 1.35, height: 1.55, speed: 0.15, phase: 4.8, size: 0.18, color: "#b91c1c" },
      { radius: 1.4, height: -1.5, speed: -0.13, phase: 0.7, size: 0.16, color: "#1e293b" },
      { radius: 1.8, height: 0.2, speed: 0.1, phase: 2.1, size: 0.15, color: "#b91c1c" },
      { radius: 1.75, height: -0.25, speed: -0.11, phase: 4.2, size: 0.16, color: "#334155" },
    ],
    []
  );

  // Four-state vivid opaque color palettes for each individual shard cube
  const shardColors = useMemo(
    () => [
      // Shard 0: Deep Crimson -> Scarlet -> Molten Gold -> Deep Cobalt
      {
        c0: new THREE.Color("#b91c1c"), em0: new THREE.Color("#7f1d1d"),
        c1: new THREE.Color("#dc2626"), em1: new THREE.Color("#991b1b"),
        c2: new THREE.Color("#d97706"), em2: new THREE.Color("#b45309"),
        c3: new THREE.Color("#0284c7"), em3: new THREE.Color("#0369a1"),
      },
      // Shard 1: Dark Slate -> Deep Azure -> Cadmium Orange -> Royal Magenta
      {
        c0: new THREE.Color("#1e293b"), em0: new THREE.Color("#0f172a"),
        c1: new THREE.Color("#0284c7"), em1: new THREE.Color("#0369a1"),
        c2: new THREE.Color("#ea580c"), em2: new THREE.Color("#c2410c"),
        c3: new THREE.Color("#be123c"), em3: new THREE.Color("#9f1239"),
      },
      // Shard 2: Deep Crimson -> Hot Rose -> Warm Amber -> Vivid Violet
      {
        c0: new THREE.Color("#b91c1c"), em0: new THREE.Color("#7f1d1d"),
        c1: new THREE.Color("#e11d48"), em1: new THREE.Color("#be123c"),
        c2: new THREE.Color("#eab308"), em2: new THREE.Color("#ca8a04"),
        c3: new THREE.Color("#7c3aed"), em3: new THREE.Color("#6d28d9"),
      },
      // Shard 3: Slate -> Deep Cyan -> Burnt Orange -> Deep Emerald
      {
        c0: new THREE.Color("#334155"), em0: new THREE.Color("#1e293b"),
        c1: new THREE.Color("#0284c7"), em1: new THREE.Color("#0369a1"),
        c2: new THREE.Color("#c2410c"), em2: new THREE.Color("#9a3412"),
        c3: new THREE.Color("#059669"), em3: new THREE.Color("#047857"),
      },
      // Shard 4: Deep Crimson -> Scarlet -> Molten Amber -> Deep Orange
      {
        c0: new THREE.Color("#b91c1c"), em0: new THREE.Color("#7f1d1d"),
        c1: new THREE.Color("#dc2626"), em1: new THREE.Color("#991b1b"),
        c2: new THREE.Color("#b45309"), em2: new THREE.Color("#92400e"),
        c3: new THREE.Color("#ea580c"), em3: new THREE.Color("#c2410c"),
      },
      // Shard 5: Dark Slate -> Royal Cobalt -> Amber Gold -> Royal Sapphire
      {
        c0: new THREE.Color("#1e293b"), em0: new THREE.Color("#0f172a"),
        c1: new THREE.Color("#1d4ed8"), em1: new THREE.Color("#1e40af"),
        c2: new THREE.Color("#f59e0b"), em2: new THREE.Color("#d97706"),
        c3: new THREE.Color("#1e40af"), em3: new THREE.Color("#1e3a8a"),
      },
      // Shard 6: Deep Crimson -> Hot Carmine -> Vivid Red -> Deep Carmine
      {
        c0: new THREE.Color("#b91c1c"), em0: new THREE.Color("#7f1d1d"),
        c1: new THREE.Color("#e11d48"), em1: new THREE.Color("#be123c"),
        c2: new THREE.Color("#dc2626"), em2: new THREE.Color("#b91c1c"),
        c3: new THREE.Color("#be123c"), em3: new THREE.Color("#9f1239"),
      },
      // Shard 7: Slate -> Bright Cobalt -> Rich Amber -> Molten Bronze
      {
        c0: new THREE.Color("#334155"), em0: new THREE.Color("#1e293b"),
        c1: new THREE.Color("#0284c7"), em1: new THREE.Color("#0369a1"),
        c2: new THREE.Color("#ca8a04"), em2: new THREE.Color("#a16207"),
        c3: new THREE.Color("#d97706"), em3: new THREE.Color("#b45309"),
      },
    ],
    []
  );

  // High-Entropy Wandering Micro-Tetrahedrons: Small black wireframe structures roaming freely in canvas space
  const entropyTetrahedrons = useMemo(
    () => [
      {
        radius: 0.16,
        fx1: 0.72,
        fx2: 0.38,
        rx1: 1.6,
        rx2: 0.9,
        fy1: 0.58,
        fy2: 0.32,
        ry1: 1.3,
        ry2: 0.7,
        fz1: 0.82,
        fz2: 0.46,
        rz1: 1.25,
        rz2: 0.75,
        spinSpeed: { x: 1.5, y: 1.9, z: 1.2 },
        phase: 0.0,
      },
      {
        radius: 0.13,
        fx1: 0.63,
        fx2: 0.41,
        rx1: 1.8,
        rx2: 0.95,
        fy1: 0.76,
        fy2: 0.44,
        ry1: 1.45,
        ry2: 0.6,
        fz1: 0.54,
        fz2: 0.28,
        rz1: 1.5,
        rz2: 0.65,
        spinSpeed: { x: -1.8, y: 1.3, z: -1.6 },
        phase: 2.15,
      },
      {
        radius: 0.15,
        fx1: 0.51,
        fx2: 0.69,
        rx1: 1.5,
        rx2: 0.8,
        fy1: 0.64,
        fy2: 0.52,
        ry1: 1.2,
        ry2: 0.9,
        fz1: 0.73,
        fz2: 0.38,
        rz1: 1.35,
        rz2: 0.55,
        spinSpeed: { x: 1.3, y: -1.7, z: 2.0 },
        phase: 4.35,
      },
    ],
    []
  );

  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    // Accessibility: honor system prefers-reduced-motion
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mql.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mql.addEventListener("change", handleMotionChange);

    // Desktop pointer parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion.current) return;
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    // Mobile tactile gyro tilt
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (prefersReducedMotion.current) return;
      if (e.gamma !== null && e.beta !== null) {
        // gamma: left-to-right tilt [-90, 90], beta: front-to-back tilt [-180, 180]
        const normX = Math.max(-1, Math.min(1, e.gamma / 25));
        const normY = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
        mousePos.current.x = normX;
        mousePos.current.y = -normY;
      }
    };

    const handleProjectStep = () => {
      projectPulse.current = 1.0;
    };

    const handlePressStart = () => {
      if (isHolding.current) return;
      isHolding.current = true;
      holdDuration.current = 0;
      startGyroDynamo();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("portfolio:gyro-stage-change", {
            detail: { stage: 1, holding: true, active: true },
          })
        );
      }
      if (typeof document !== "undefined") {
        document.body.style.cursor = "grabbing";
      }
    };

    const handlePressEnd = () => {
      if (isHolding.current) {
        isHolding.current = false;
        holdDuration.current = 0;
        stopGyroDynamo();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("portfolio:gyro-stage-change", {
              detail: { stage: 0, holding: false, active: false },
            })
          );
        }
        if (typeof document !== "undefined") {
          document.body.style.cursor = "";
        }
      }
    };

    // Controlled pointerdown detector on the 3D gyro (Hero section only) - starts hold
    const handlePointerDown = (e: PointerEvent) => {
      // Primary left button only
      if (e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      if (
        target?.closest(
          "a, button, input, textarea, select, nav, [role='button'], [role='tab'], [role='menuitem'], [data-interactive], .glass-card, .glow-card, .drum-card, header, footer, [data-prevent-gyro]"
        )
      ) {
        return;
      }

      // Restrict 3D raycast press activation to Hero foreground view only
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      if (currentScroll > window.innerHeight * 0.7) {
        return;
      }

      if (!groupRef.current || !camera) return;

      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

      // Strict hit collision on actual gyro mesh geometry
      const hits = raycaster.intersectObject(groupRef.current, true);
      if (hits.length > 0) {
        handlePressStart();
      }
    };

    const handlePointerUp = () => {
      handlePressEnd();
    };

    const handlePointerMove = () => {
      if (prefersReducedMotion.current) return;
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      if (currentScroll < window.innerHeight * 0.7 && groupRef.current && camera) {
        const ndcX = (mousePos.current.x);
        const ndcY = (mousePos.current.y);
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
        const hits = raycaster.intersectObject(groupRef.current, true);
        if (hits.length > 0 && typeof document !== "undefined") {
          document.body.style.cursor = isHolding.current ? "grabbing" : "pointer";
        } else if (typeof document !== "undefined" && !isHolding.current) {
          if (document.body.style.cursor === "pointer") {
            document.body.style.cursor = "";
          }
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    window.addEventListener("portfolio:project-step", handleProjectStep);
    window.addEventListener("portfolio:gyro-press-start", handlePressStart);
    window.addEventListener("portfolio:gyro-press-end", handlePressEnd);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("blur", handlePressEnd);

    return () => {
      mql.removeEventListener("change", handleMotionChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("portfolio:project-step", handleProjectStep);
      window.removeEventListener("portfolio:gyro-press-start", handlePressStart);
      window.removeEventListener("portfolio:gyro-press-end", handlePressEnd);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", handlePressEnd);
      stopGyroDynamo();
      if (typeof document !== "undefined") {
        document.body.style.cursor = "";
        const cards = document.querySelectorAll<HTMLElement>(".glow-card");
        cards.forEach((card) => {
          card.style.setProperty("--gyro-opacity", "0");
          card.removeAttribute("data-gyro-near");
        });
      }
    };
  }, [camera, raycaster]);

  // Cache glow-card DOM elements to prevent querySelectorAll on every frame
  useEffect(() => {
    const updateGlowCards = () => {
      glowCardsRef.current = Array.from(document.querySelectorAll<HTMLElement>(".glow-card"));
    };
    updateGlowCards();
    window.addEventListener("resize", updateGlowCards, { passive: true });
    const timer = setTimeout(updateGlowCards, 500);
    return () => {
      window.removeEventListener("resize", updateGlowCards);
      clearTimeout(timer);
    };
  }, []);

  // Spatial metrics: calibrated horizontal bounds for crisp column alignment and wide scroll excursions
  const isDesktop = viewport.width > 7.5;
  const rightOffset = isDesktop
    ? Math.min(viewport.width * 0.33, 3.75)
    : Math.min(viewport.width * 0.28, 1.6);
  const baseScale = isDesktop ? 1.0 : 0.82;

  // Physics accumulators for zero-jitter, fluid organic motion
  const smoothScrollY = useRef(0);
  const smoothVelocity = useRef(0);
  const lastScrollY = useRef(0);
  const smoothBlur = useRef(0);
  const smoothOpacity = useRef(1);
  const ring1Spin = useRef(0);
  const ring2Spin = useRef(0);
  const ring3Spin = useRef(0);

  useFrame((state, delta) => {
    const rawScrollY = scrollState.current?.scrollY ?? 0;
    const rawVelocity = scrollState.current?.velocity ?? 0;
    const focals = scrollState.current?.focals ?? [];
    const time = state.clock.getElapsedTime();

    // Kinetic smoothing
    smoothScrollY.current = THREE.MathUtils.lerp(
      smoothScrollY.current,
      rawScrollY,
      0.08
    );
    smoothVelocity.current = THREE.MathUtils.lerp(
      smoothVelocity.current,
      rawVelocity,
      0.1
    );

    const sY = smoothScrollY.current;
    const speedMult = prefersReducedMotion.current ? 0.2 : 1.0;

    // RESOLVE ACTIVE STAGE & SMOOTH LERPING (Strict hold-only interaction: active strictly while holding)
    let targetStage = 0;
    if (isHolding.current) {
      holdDuration.current += delta;
      if (holdDuration.current >= 3.5) {
        targetStage = 3;
      } else if (holdDuration.current >= 1.6) {
        targetStage = 2;
      } else {
        targetStage = 1;
      }
    }

    if (displayedStageRef.current !== targetStage) {
      displayedStageRef.current = targetStage;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("portfolio:gyro-stage-change", {
            detail: { stage: targetStage, holding: isHolding.current, active: targetStage > 0 },
          })
        );
      }
    }

    // Target weights for each state:
    const targetW1 = targetStage === 1 ? 1.0 : 0.0;
    const targetW2 = targetStage === 2 ? 1.0 : 0.0;
    const targetW3 = targetStage === 3 ? 1.0 : 0.0;

    // Smooth physics lerping for fluid transitions
    const lerpSpeed = targetStage > 0 ? 0.075 : 0.045;
    s1Amount.current = THREE.MathUtils.lerp(s1Amount.current, targetW1, lerpSpeed);
    s2Amount.current = THREE.MathUtils.lerp(s2Amount.current, targetW2, lerpSpeed);
    s3Amount.current = THREE.MathUtils.lerp(s3Amount.current, targetW3, lerpSpeed);

    const s1 = s1Amount.current;
    const s2 = s2Amount.current;
    const s3 = s3Amount.current;

    // Update real-time 3-stage Web Audio synthesizer
    if (targetStage > 0 || s1 > 0.05 || s2 > 0.05 || s3 > 0.05) {
      updateGyroDynamo(s1, s2, s3);
    }

    // HIGH-ENERGY, LIVELY ROTATION MULTIPLIER:
    // Base: 1.0x (~0.5 rad/s - calm ambient float)
    // Stage 1: ~3.8x (energetic mechanical ratchet spool-up)
    // Stage 2: ~8.0x (deep resonant fusion whirl)
    // Stage 3: ~16.0x (supersonic turbine overdrive!)
    const ringOverdrive = 1 + s1 * 2.8 + s2 * 7.0 + s3 * 15.0;
    const ringSpeedMult = speedMult * ringOverdrive;

    // Delta scroll for kinetic rotational impulse
    const deltaScroll = sY - lastScrollY.current;
    lastScrollY.current = sY;

    // Sample continuous choreographed section spatial target
    const target = sampleSectionSpatial(sY, focals);

    // Controlled, gentle scroll nudge
    const scrollNudge = Math.max(-0.003, Math.min(0.003, deltaScroll * 0.0001)) * speedMult;

    // 1. SEAMLESS OUTER GIMBAL RING (RING 1 - Crimson Halo -> Stage 1 Hot Scarlet -> Stage 2 Solar Gold -> Stage 3 Neon Electric Cyan)
    ring1Spin.current += (delta * 0.48 + scrollNudge * 1.5) * ringSpeedMult;

    if (ring1GroupRef.current) {
      const ratchetJitter = Math.sin(time * 24) * 0.02 * s1;
      const s2Wobble = Math.sin(time * 8) * 0.05 * s2;
      const s3SupersonicPrecession = Math.sin(time * 14) * 0.09 * s3;
      ring1GroupRef.current.rotation.x = Math.PI / 4 + ratchetJitter + s2Wobble + s3SupersonicPrecession;
      ring1GroupRef.current.rotation.y = ring1Spin.current;
      ring1GroupRef.current.rotation.z =
        Math.sin(time * 0.6) * (0.06 + s1 * 0.04) +
        Math.cos(time * 6) * 0.07 * s3;
    }

    // 2. COUNTER-ROTATING SECONDARY GIMBAL (RING 2 - Titanium Slate -> Stage 1 Electric Cyan -> Stage 2 Molten Amber -> Stage 3 Plasma Violet)
    ring2Spin.current -= (delta * 0.42 + scrollNudge * 1.5) * ringSpeedMult;

    if (ring2GroupRef.current) {
      ring2GroupRef.current.rotation.x = ring2Spin.current;
      ring2GroupRef.current.rotation.y =
        -Math.PI / 4 +
        Math.cos(time * 0.7) * (0.08 + s1 * 0.04) +
        Math.sin(time * 8) * 0.08 * s3;
      ring2GroupRef.current.rotation.z =
        Math.PI / 6 +
        s1 * 0.04 +
        s2 * 0.06 +
        Math.cos(time * 8) * 0.08 * s3;
    }

    // 3. INNER ACCENT ORBIT GIMBAL (RING 3 - Crimson Polar -> Stage 1 Hot Carmine -> Stage 2 Lemon Gold -> Stage 3 Electric Emerald)
    ring3Spin.current += (delta * 0.56 + scrollNudge * 1.5) * ringSpeedMult;
    if (ring3GroupRef.current) {
      ring3GroupRef.current.rotation.z = ring3Spin.current;
      ring3GroupRef.current.rotation.x =
        -Math.PI / 3 +
        Math.sin(time * 1.1) * (0.1 + s1 * 0.04) +
        Math.sin(time * 10) * 0.09 * s3;
      ring3GroupRef.current.rotation.y = Math.PI / 4 + (ring3Spin.current * 0.35);
    }

    // Decay card-step resonance pulse
    projectPulse.current = THREE.MathUtils.lerp(projectPulse.current, 0, 0.05);

    // 4. CENTRAL COMPUTE DIAMOND (Refractive Optical Crystal Core)
    // Multi-axis tumble and rapid facet flash across each stage
    if (coreRef.current) {
      const coreSpeedX = 1 + s1 * 2.8 + s2 * 6.5 + s3 * 13.5;
      const coreSpeedY = 1 + s1 * 3.2 + s2 * 7.5 + s3 * 15.0;
      coreRef.current.rotation.x += delta * 0.28 * speedMult * coreSpeedX;
      coreRef.current.rotation.y += delta * 0.38 * speedMult * coreSpeedY;

      const s1Pulse = Math.sin(time * 14) * 0.03 * s1;
      const s2BhumPulse = Math.sin(time * 8) * 0.06 * s2;
      const s3TurbineFlash = Math.sin(time * 16) * 0.08 * s3;
      const corePulse =
        (1 + Math.sin(time * 1.0) * 0.016 * speedMult) *
        (1 + projectPulse.current * 0.08) *
        (1 + s1Pulse + s2BhumPulse + s3TurbineFlash);
      coreRef.current.scale.setScalar(corePulse);
    }

    // 5. MID WIREFRAME CAGE (Glowing Octahedron)
    if (midCageRef.current) {
      midCageRef.current.rotation.y -= delta * 0.16 * ringSpeedMult;
      midCageRef.current.rotation.x += delta * 0.12 * ringSpeedMult;
      const midScale =
        (1 + Math.cos(time * 0.9) * 0.014 * speedMult) *
        (1 + s1 * 0.03 + s2 * 0.06 + s3 * 0.09);
      midCageRef.current.scale.setScalar(midScale);
    }

    // 6. OUTER WIREFRAME CAGE (Titanium Obsidian Dodecahedron)
    if (outerCageRef.current) {
      outerCageRef.current.rotation.x -= delta * 0.10 * ringSpeedMult;
      outerCageRef.current.rotation.z += delta * 0.12 * ringSpeedMult;
      const outerScale =
        (1 + Math.sin(time * 0.8) * 0.012 * speedMult) *
        (1 + s1 * 0.02 + s2 * 0.04 + s3 * 0.07);
      outerCageRef.current.scale.setScalar(outerScale);
    }

    // 7. FLOATING TENSOR SHARD CUBES: LIVELY ORBITS & EXPANSION
    shardsRef.current.forEach((shardMesh, idx) => {
      if (shardMesh) {
        const shard = tensorShards[idx];

        // Orbit speed: rapid, lively acceleration
        const orbitMultiplier = 1 + s1 * 2.0 + s2 * 5.0 + s3 * 11.0;
        const shardAngle =
          shard.phase +
          time * shard.speed * speedMult * orbitMultiplier +
          (sY / 2400) * Math.sign(shard.speed);

        // Outward radial dispersion: expanding energetic orbital disk
        const rad =
          shard.radius +
          Math.sin(time * 0.8 + idx * 0.9) * 0.03 * speedMult +
          s1 * 0.1 +
          s2 * 0.32 +
          s3 * (0.55 + Math.sin(time * 5 + idx * 1.4) * 0.1);

        shardMesh.position.x = Math.cos(shardAngle) * rad;
        shardMesh.position.z = Math.sin(shardAngle) * rad;
        shardMesh.position.y =
          shard.height +
          Math.sin(time * 0.9 + idx * 0.7) * 0.04 * speedMult +
          (s2 * Math.sin(time * 4 + idx) * 0.06) +
          (s3 * Math.sin(time * 8 + idx * 1.5) * 0.12);

        // Cube Individual Axial Rotation: energetic tumbling
        const baseTumble = prefersReducedMotion.current ? 0.08 : 0.28;
        const fastTumble = s1 * 0.8 + s2 * 2.4 + s3 * 6.0;

        const tumbleX = (baseTumble + fastTumble) * (1 + (idx % 3) * 0.25);
        const tumbleY = (baseTumble * 1.1 + fastTumble * 1.3) * (1 - (idx % 2) * 0.2);
        const tumbleZ = (baseTumble * 0.9 + fastTumble * 1.2) * (1 + (idx % 4) * 0.2);

        shardMesh.rotation.x += delta * tumbleX;
        shardMesh.rotation.y += delta * tumbleY;
        shardMesh.rotation.z += delta * tumbleZ;

        // Scale pop & dynamic breathing:
        const cubeScale =
          1 +
          s1 * 0.06 +
          s2 * 0.14 +
          s3 * (0.22 + Math.sin(time * 8 + idx * 1.6) * 0.08);
        shardMesh.scale.setScalar(cubeScale);
      }
    });

    // 7.5 HIGH-ENTROPY WANDERING MICRO-TETRAHEDRONS (Free-roaming black wireframe structures)
    tetraRefs.current.forEach((tetraGroup, idx) => {
      if (tetraGroup) {
        const config = entropyTetrahedrons[idx];
        const entropyOverdrive = 1 + s1 * 1.8 + s2 * 4.2 + s3 * 8.5;
        const effectiveTime = time * speedMult * (0.85 + idx * 0.18) * (1 + s2 * 0.4 + s3 * 0.9);

        // Multi-harmonic non-periodic 3D roaming path across the canvas
        const posX =
          Math.sin(effectiveTime * config.fx1 + config.phase) * config.rx1 +
          Math.cos(effectiveTime * config.fx2 + config.phase * 1.3) * config.rx2;
        const posY =
          Math.cos(effectiveTime * config.fy1 + config.phase * 0.9) * config.ry1 +
          Math.sin(effectiveTime * config.fy2 + config.phase * 1.1) * config.ry2;
        const posZ =
          Math.sin(effectiveTime * config.fz1 + config.phase * 1.2) * config.rz1 +
          Math.cos(effectiveTime * config.fz2 + config.phase * 0.8) * config.rz2;

        // Reactive cursor parallax deviation
        const mouseNudgeX = mousePos.current.x * (0.32 + idx * 0.08);
        const mouseNudgeY = mousePos.current.y * (0.32 + idx * 0.08);

        tetraGroup.position.x = posX + mouseNudgeX;
        tetraGroup.position.y = posY + mouseNudgeY;
        tetraGroup.position.z = posZ;

        // Independent chaotic tumbling on all 3 axes
        tetraGroup.rotation.x += delta * config.spinSpeed.x * entropyOverdrive;
        tetraGroup.rotation.y += delta * config.spinSpeed.y * entropyOverdrive;
        tetraGroup.rotation.z += delta * config.spinSpeed.z * entropyOverdrive;

        // Subtle organic breathing scale
        const entropyScale =
          (1 + Math.sin(effectiveTime * 2.2 + idx * 1.5) * 0.05) *
          (1 + s1 * 0.05 + s2 * 0.12 + s3 * 0.2);
        tetraGroup.scale.setScalar(entropyScale);
      }
    });

    // 8. MASTER GROUP PARALLAX, ROTATION & SECTION-TO-SECTION POSITION
    if (groupRef.current) {
      // Spatial positions driven by dynamic target + mouse parallax + ambient hover
      const mouseParallaxX = prefersReducedMotion.current
        ? 0
        : mousePos.current.x * 0.16;
      const targetPosX =
        target.x * rightOffset + mouseParallaxX + Math.cos(time * 0.35) * 0.035;
      const targetPosY =
        (isDesktop ? target.y : target.y - 0.45) + Math.sin(time * 0.45) * 0.03;
      const targetPosZ = target.z;

      const targetScale = baseScale * target.scale;

      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetPosX,
        0.06
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetPosY,
        0.06
      );
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        targetPosZ,
        0.06
      );
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.07
      );

      // 9. DYNAMIC GYROSCOPIC PROXIMITY ENGINE
      // Projects real-time 3D gyroscope position to 2D viewport coordinates and casts reactive specular gradient onto nearby cards
      const nowTime = state.clock.getElapsedTime();
      if (
        nowTime - lastGyroTime.current > 0.032 &&
        typeof window !== "undefined" &&
        typeof document !== "undefined"
      ) {
        lastGyroTime.current = nowTime;

        tempGyroVec.current.set(
          groupRef.current.position.x,
          groupRef.current.position.y,
          groupRef.current.position.z
        );
        tempGyroVec.current.project(state.camera);

        const gyroScreenX =
          (tempGyroVec.current.x * 0.5 + 0.5) * window.innerWidth;
        const gyroScreenY =
          (-tempGyroVec.current.y * 0.5 + 0.5) * window.innerHeight;

        const cards = glowCardsRef.current.length > 0
          ? glowCardsRef.current
          : Array.from(document.querySelectorAll<HTMLElement>(".glow-card"));
        if (glowCardsRef.current.length === 0) {
          glowCardsRef.current = cards;
        }

        const AURA_RADIUS = 750;
        const winH = window.innerHeight;

        // BATCH READ PASS: compute target styles without interleaved DOM writes
        const pendingUpdates: {
          card: HTMLElement;
          shouldReset: boolean;
          relX?: number;
          relY?: number;
          intensity?: number;
        }[] = [];

        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const rect = card.getBoundingClientRect();

          if (rect.bottom < -80 || rect.top > winH + 80) {
            pendingUpdates.push({ card, shouldReset: true });
            continue;
          }

          const closestX = Math.max(rect.left, Math.min(gyroScreenX, rect.right));
          const closestY = Math.max(rect.top, Math.min(gyroScreenY, rect.bottom));
          const dx = gyroScreenX - closestX;
          const dy = gyroScreenY - closestY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < AURA_RADIUS) {
            const norm = 1 - dist / AURA_RADIUS;
            // Soften card proximity aura when gyro is blurred behind content blocks so text stays crisp and undistracted
            const blurDampening = target.blur > 10 ? 0.22 : 1.0;
            const intensity = norm * norm * blurDampening;
            const relX = gyroScreenX - rect.left;
            const relY = gyroScreenY - rect.top;
            pendingUpdates.push({ card, shouldReset: false, relX, relY, intensity });
          } else {
            pendingUpdates.push({ card, shouldReset: true });
          }
        }

        // BATCH WRITE PASS: write computed styles with zero layout reflows
        for (let i = 0; i < pendingUpdates.length; i++) {
          const u = pendingUpdates[i];
          if (u.shouldReset) {
            if (
              u.card.style.getPropertyValue("--gyro-opacity") &&
              u.card.style.getPropertyValue("--gyro-opacity") !== "0"
            ) {
              u.card.style.setProperty("--gyro-opacity", "0");
              u.card.removeAttribute("data-gyro-near");
            }
          } else if (u.relX !== undefined && u.relY !== undefined && u.intensity !== undefined) {
            u.card.style.setProperty("--gyro-x", `${u.relX.toFixed(1)}px`);
            u.card.style.setProperty("--gyro-y", `${u.relY.toFixed(1)}px`);
            u.card.style.setProperty("--gyro-opacity", u.intensity.toFixed(3));
            if (u.intensity > 0.22) {
              u.card.setAttribute("data-gyro-near", "true");
            } else {
              u.card.removeAttribute("data-gyro-near");
            }
          }
        }
      }

      // Multi-axis rotation: stately, seamless, organic
      const mouseTiltX = prefersReducedMotion.current
        ? 0
        : -(mousePos.current.y * Math.PI) / 24;
      const mouseTiltY = prefersReducedMotion.current
        ? 0
        : (mousePos.current.x * Math.PI) / 24;

      const targetRotX = target.rotX + mouseTiltX;
      const targetRotY = target.rotY + mouseTiltY + time * 0.02 * speedMult;
      const targetRotZ = target.rotZ + Math.sin(time * 0.2) * 0.02 * speedMult;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.035
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.035
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotZ,
        0.035
      );
    }

    // 9. DYNAMIC BLUR & OPACITY SYNCHRONIZATION WITH ZERO STEP JITTER
    // On desktop: 01, 02, 03 have strong 40px blur; 04 About has blur: 0 (crisp in open right stage)
    // On mobile / stacked layouts: About text spans full-width, so keep it softly blurred (40px)
    const effectiveTargetBlur = !isDesktop && target.id === "about" ? 40.0 : target.blur;
    const effectiveTargetOpacity = !isDesktop && target.id === "about" ? 0.38 : target.opacity;

    smoothBlur.current = THREE.MathUtils.lerp(
      smoothBlur.current,
      effectiveTargetBlur,
      0.08
    );
    smoothOpacity.current = THREE.MathUtils.lerp(
      smoothOpacity.current,
      effectiveTargetOpacity,
      0.08
    );

    if (wrapperRef.current) {
      const b = Math.max(0, smoothBlur.current);
      wrapperRef.current.style.filter = b > 0.08 ? `blur(${b.toFixed(2)}px)` : "none";
      wrapperRef.current.style.opacity = Math.max(0, Math.min(1, smoothOpacity.current)).toFixed(3);
    }

    // 10. DYNAMIC 4-STATE MATERIAL & CHROMATIC ILLUMINATION TRANSITIONS
    const s0 = Math.max(0, 1 - s1 - s2 - s3);

    // Central Core Material (Solid Opaque Diamond):
    if (coreMaterialRef.current) {
      const isOverStage = isDesktop && sY < (focals[1] ?? 800) * 0.4 && mousePos.current.x > 0.05;
      const hoverBoost = isOverStage ? 0.25 : 0;
      blendColors(tempColor, cCore0, cCore1, cCore2, cCore3, s0, s1, s2, s3);
      coreMaterialRef.current.color.copy(tempColor);

      blendColors(tempEmissive, emCore0, emCore1, emCore2, emCore3, s0, s1, s2, s3);
      coreMaterialRef.current.emissive.copy(tempEmissive);

      const targetEmissive =
        s0 * 0.7 +
        s1 * 1.3 +
        s2 * 1.8 +
        s3 * 2.2 +
        projectPulse.current * 0.5 +
        hoverBoost;

      coreMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        coreMaterialRef.current.emissiveIntensity,
        targetEmissive,
        0.1
      );
      coreMaterialRef.current.roughness = THREE.MathUtils.lerp(0.24, 0.16, s3);
      coreMaterialRef.current.metalness = THREE.MathUtils.lerp(0.65, 0.8, s3);
    }

    // Mid Octahedron Cage Material:
    if (midCageMaterialRef.current) {
      blendColors(tempColor, cCageMid0, cCageMid1, cCageMid2, cCageMid3, s0, s1, s2, s3);
      midCageMaterialRef.current.color.copy(tempColor);
      midCageMaterialRef.current.emissive.copy(tempColor);
      midCageMaterialRef.current.emissiveIntensity = s0 * 0.8 + s1 * 1.3 + s2 * 1.7 + s3 * 2.2;
    }

    // Outer Dodecahedron Cage Material:
    if (outerCageMaterialRef.current) {
      blendColors(tempColor, cCageOut0, cCageOut1, cCageOut2, cCageOut3, s0, s1, s2, s3);
      outerCageMaterialRef.current.color.copy(tempColor);
      blendColors(tempEmissive, emCageOut0, emCageOut1, emCageOut2, emCageOut3, s0, s1, s2, s3);
      outerCageMaterialRef.current.emissive.copy(tempEmissive);
      outerCageMaterialRef.current.emissiveIntensity = s0 * 0.0 + s1 * 0.7 + s2 * 1.2 + s3 * 1.7;
    }

    // Ring 1 (Outer Gyroscope):
    if (ring1MaterialRef.current) {
      blendColors(tempColor, cR1_0, cR1_1, cR1_2, cR1_3, s0, s1, s2, s3);
      ring1MaterialRef.current.color.copy(tempColor);
      blendColors(tempEmissive, emR1_0, emR1_1, emR1_2, emR1_3, s0, s1, s2, s3);
      ring1MaterialRef.current.emissive.copy(tempEmissive);
      ring1MaterialRef.current.emissiveIntensity = s0 * 0.7 + s1 * 1.3 + s2 * 1.7 + s3 * 2.2;
    }
    if (ring1NodeMatRef.current) {
      blendColors(tempEmissive, emR1_0, emR1_1, emR1_2, emR1_3, s0, s1, s2, s3);
      ring1NodeMatRef.current.emissive.copy(tempEmissive);
      ring1NodeMatRef.current.emissiveIntensity = s0 * 1.2 + s1 * 1.8 + s2 * 2.2 + s3 * 2.6;
    }
    if (ring1NotchMatRef.current) {
      blendColors(tempColor, cR1_0, cR1_1, cR1_2, cR1_3, s0, s1, s2, s3);
      ring1NotchMatRef.current.color.copy(tempColor);
      ring1NotchMatRef.current.emissive.copy(tempColor);
      ring1NotchMatRef.current.emissiveIntensity = s0 * 0.8 + s1 * 1.3 + s2 * 1.6 + s3 * 2.0;
    }

    // Ring 2 (Middle Gyroscope):
    if (ring2MaterialRef.current) {
      blendColors(tempColor, cR2_0, cR2_1, cR2_2, cR2_3, s0, s1, s2, s3);
      ring2MaterialRef.current.color.copy(tempColor);
      blendColors(tempEmissive, emR2_0, emR2_1, emR2_2, emR2_3, s0, s1, s2, s3);
      ring2MaterialRef.current.emissive.copy(tempEmissive);
      ring2MaterialRef.current.emissiveIntensity = s0 * 0.6 + s1 * 1.2 + s2 * 1.7 + s3 * 2.1;
    }
    if (ring2NodeMatRef.current) {
      blendColors(tempColor, cR2Node_0, cR2Node_1, cR2Node_2, cR2Node_3, s0, s1, s2, s3);
      ring2NodeMatRef.current.color.copy(tempColor);
      ring2NodeMatRef.current.emissive.copy(tempColor);
      ring2NodeMatRef.current.emissiveIntensity = s0 * 1.2 + s1 * 1.8 + s2 * 2.2 + s3 * 2.6;
    }
    if (ring2NotchMatRef.current) {
      blendColors(tempColor, cR2_0, cR2_1, cR2_2, cR2_3, s0, s1, s2, s3);
      ring2NotchMatRef.current.color.copy(tempColor);
      blendColors(tempEmissive, emR2_0, emR2_1, emR2_2, emR2_3, s0, s1, s2, s3);
      ring2NotchMatRef.current.emissive.copy(tempEmissive);
      ring2NotchMatRef.current.emissiveIntensity = s0 * 0.8 + s1 * 1.3 + s2 * 1.6 + s3 * 2.0;
    }

    // Ring 3 (Inner Polar Gyroscope):
    if (ring3MaterialRef.current) {
      blendColors(tempColor, cR3_0, cR3_1, cR3_2, cR3_3, s0, s1, s2, s3);
      ring3MaterialRef.current.color.copy(tempColor);
      blendColors(tempEmissive, emR3_0, emR3_1, emR3_2, emR3_3, s0, s1, s2, s3);
      ring3MaterialRef.current.emissive.copy(tempEmissive);
      ring3MaterialRef.current.emissiveIntensity = s0 * 0.6 + s1 * 1.2 + s2 * 1.7 + s3 * 2.1;
    }
    if (ring3NodeMatRef.current) {
      blendColors(tempEmissive, emR3_0, emR3_1, emR3_2, emR3_3, s0, s1, s2, s3);
      ring3NodeMatRef.current.emissive.copy(tempEmissive);
      ring3NodeMatRef.current.emissiveIntensity = s0 * 1.2 + s1 * 1.8 + s2 * 2.2 + s3 * 2.6;
    }
    if (ring3NotchMatRef.current) {
      blendColors(tempColor, cR3_0, cR3_1, cR3_2, cR3_3, s0, s1, s2, s3);
      ring3NotchMatRef.current.color.copy(tempColor);
      ring3NotchMatRef.current.emissive.copy(tempColor);
      ring3NotchMatRef.current.emissiveIntensity = s0 * 0.8 + s1 * 1.3 + s2 * 1.6 + s3 * 2.0;
    }

    // Shards (Floating Tensor Cubes):
    shardsRef.current.forEach((shardMesh, i) => {
      if (shardMesh && shardMesh.material) {
        const mat = shardMesh.material as THREE.MeshStandardMaterial;
        const pal = shardColors[i];
        if (pal) {
          blendColors(tempColor, pal.c0, pal.c1, pal.c2, pal.c3, s0, s1, s2, s3);
          mat.color.copy(tempColor);
          blendColors(tempEmissive, pal.em0, pal.em1, pal.em2, pal.em3, s0, s1, s2, s3);
          mat.emissive.copy(tempEmissive);
          mat.emissiveIntensity = s0 * 0.6 + s1 * 1.2 + s2 * 1.6 + s3 * 2.0;
        }
      }
    });

    // Core Dynamic Point Light:
    if (coreLightRef.current) {
      blendColors(tempColor, cLight0, cLight1, cLight2, cLight3, s0, s1, s2, s3);
      coreLightRef.current.color.copy(tempColor);
      coreLightRef.current.intensity = s0 * 1.0 + s1 * 2.0 + s2 * 3.2 + s3 * 4.2;
      coreLightRef.current.distance = s0 * 5.0 + s1 * 7.5 + s2 * 10.0 + s3 * 12.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Invisible Raycast Hit Target for 100% Reliable Click/Tap Detection */}
      <mesh visible={false}>
        <sphereGeometry args={[2.8, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Central Core Dynamic Point Light */}
      <pointLight
        ref={coreLightRef}
        position={[0, 0, 0]}
        intensity={1.2}
        color="#e63946"
        distance={6.5}
        decay={2}
      />

      {/* Central Reasoning Core: Solid Opaque Diamond */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial
          ref={coreMaterialRef}
          color="#b91c1c"
          emissive="#7f1d1d"
          emissiveIntensity={0.85}
          roughness={0.24}
          metalness={0.65}
        />
      </mesh>

      {/* Mid Octahedron Wireframe Cage */}
      <mesh ref={midCageRef}>
        <octahedronGeometry args={[1.65, 0]} />
        <meshStandardMaterial
          ref={midCageMaterialRef}
          color="#b91c1c"
          wireframe
          emissive="#b91c1c"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Outer Dodecahedron Cage: Titanium Obsidian */}
      <mesh ref={outerCageRef}>
        <dodecahedronGeometry args={[2.2, 0]} />
        <meshStandardMaterial
          ref={outerCageMaterialRef}
          color="#0f172a"
          wireframe
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* 1. OUTER GYROSCOPIC GIMBAL RING (Crimson Halo -> Stage 3 Deep Cobalt) */}
      <group ref={ring1GroupRef} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[2.55, 0.048, 24, 160]} />
          <meshStandardMaterial
            ref={ring1MaterialRef}
            color="#dc2626"
            emissive="#991b1b"
            emissiveIntensity={0.7}
            roughness={0.16}
            metalness={0.82}
          />
        </mesh>
        {/* Orbital energy nodes */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 2.55, Math.sin(angle) * 2.55, 0]}
          >
            <sphereGeometry args={[0.078, 16, 16]} />
            <meshStandardMaterial
              ref={ring1NodeMatRef}
              color="#dc2626"
              emissive="#991b1b"
              emissiveIntensity={1.2}
              roughness={0.1}
            />
          </mesh>
        ))}
        {/* Tick notches */}
        {[
          Math.PI / 6,
          Math.PI / 2,
          (5 * Math.PI) / 6,
          (7 * Math.PI) / 6,
          (3 * Math.PI) / 2,
          (11 * Math.PI) / 6,
        ].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 2.55, Math.sin(angle) * 2.55, 0]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.1, 0.024, 0.024]} />
            <meshStandardMaterial
              ref={ring1NotchMatRef}
              color="#dc2626"
              emissive="#991b1b"
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* 2. SECONDARY GYROSCOPIC GIMBAL RING (Slate Titanium -> Stage 3 Ultraviolet Violet) */}
      <group ref={ring2GroupRef}>
        <mesh>
          <torusGeometry args={[2.18, 0.04, 20, 140]} />
          <meshStandardMaterial
            ref={ring2MaterialRef}
            color="#1e293b"
            emissive="#0f172a"
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.88}
          />
        </mesh>
        {/* Titanium counter nodes at 90 deg intervals */}
        {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 2.18, Math.sin(angle) * 2.18, 0]}
          >
            <sphereGeometry args={[0.072, 16, 16]} />
            <meshStandardMaterial
              ref={ring2NodeMatRef}
              color="#0284c7"
              emissive="#0284c7"
              emissiveIntensity={1.2}
              roughness={0.12}
            />
          </mesh>
        ))}
        {/* Ring 2 tick notches */}
        {[
          Math.PI / 4,
          (3 * Math.PI) / 4,
          (5 * Math.PI) / 4,
          (7 * Math.PI) / 4,
        ].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 2.18, Math.sin(angle) * 2.18, 0]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.09, 0.02, 0.02]} />
            <meshStandardMaterial
              ref={ring2NotchMatRef}
              color="#334155"
              emissive="#0284c7"
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* 3. INNER ACCENT ORBIT GIMBAL (Crimson Polar Orbit -> Stage 3 Deep Emerald) */}
      <group ref={ring3GroupRef}>
        <mesh>
          <torusGeometry args={[1.8, 0.034, 18, 120]} />
          <meshStandardMaterial
            ref={ring3MaterialRef}
            color="#b91c1c"
            emissive="#7f1d1d"
            emissiveIntensity={0.6}
            roughness={0.18}
            metalness={0.82}
          />
        </mesh>
        {/* Ring 3 Polar energy nodes */}
        {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map(
          (angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0]}
            >
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshStandardMaterial
                ref={ring3NodeMatRef}
                color="#dc2626"
                emissive="#991b1b"
                emissiveIntensity={1.2}
                roughness={0.1}
              />
            </mesh>
          )
        )}
        {/* Ring 3 tick notches */}
        {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map(
          (angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.08, 0.018, 0.018]} />
              <meshStandardMaterial
                ref={ring3NotchMatRef}
                color="#b91c1c"
                emissive="#7f1d1d"
                emissiveIntensity={0.8}
              />
            </mesh>
          )
        )}
      </group>

      {/* Floating Quantized Tensor Shards */}
      {tensorShards.map((shard, i) => (
        <mesh
          key={i}
          ref={(el) => {
            shardsRef.current[i] = el;
          }}
        >
          <boxGeometry args={[shard.size, shard.size, shard.size]} />
          <meshStandardMaterial
            color={shard.color}
            emissive={shard.color === "#b91c1c" ? "#7f1d1d" : "#0f172a"}
            emissiveIntensity={0.6}
            roughness={0.2}
            metalness={0.82}
          />
        </mesh>
      ))}

      {/* High-Entropy Wandering Micro-Tetrahedrons: Small black wireframe structures roaming freely */}
      {entropyTetrahedrons.map((tetra, i) => (
        <group
          key={`entropy-tetra-${i}`}
          ref={(el) => {
            tetraRefs.current[i] = el;
          }}
        >
          {/* Outer crisp black wireframe lines */}
          <mesh>
            <tetrahedronGeometry args={[tetra.radius, 0]} />
            <meshStandardMaterial
              color="#090d16"
              wireframe
              roughness={0.2}
              metalness={0.88}
            />
          </mesh>
          {/* Inner subtle titanium facet body to catch scene specular highlights */}
          <mesh>
            <tetrahedronGeometry args={[tetra.radius * 0.94, 0]} />
            <meshStandardMaterial
              color="#0b1120"
              transparent
              opacity={0.32}
              roughness={0.25}
              metalness={0.9}
            />
          </mesh>
        </group>
      ))}

      {/* High-Dimensional Token Sparkles for Cosmic Vitality */}
      <Sparkles
        count={45}
        scale={[9, 9, 7]}
        size={2.2}
        speed={0.22}
        opacity={0.55}
        color="#dc2626"
      />
      <Sparkles
        count={55}
        scale={[11, 11, 9]}
        size={1.5}
        speed={0.16}
        opacity={0.35}
        color="#1e293b"
      />
    </group>
  );
}

// ============================================================================
// MASTER SPATIAL WORLD CHOREOGRAPHER
// ============================================================================
function SynergisticWorld({
  scrollState,
  wrapperRef,
}: {
  scrollState: ScrollStateRef;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      {/* High-contrast crisp lights designed for light editorial themes */}
      <ambientLight intensity={1.2} />
      <directionalLight position={[6, 7, 5]} intensity={2.4} color="#ffffff" />
      <directionalLight position={[-6, -4, -4]} intensity={1.3} color="#ffffff" />
      <pointLight position={[-4, -3, 4]} intensity={2.2} color="#e63946" />
      <pointLight position={[4, 3, 3]} intensity={1.8} color="#ffffff" />

      {/* REVOLVING SIGNATURE 3D FIGURE */}
      <TensorHyperLattice
        scrollState={scrollState}
        wrapperRef={wrapperRef}
      />
    </>
  );
}

// ============================================================================
// EXPORTED UNIFIED CANVAS COMPONENT
// ============================================================================
export function UnifiedAISpatialCanvas() {
  const scrollState = useRef<ScrollState>({
    scrollY: 0,
    progress: 0,
    velocity: 0,
    focals: [0, 800, 1800, 2700, 3600, 4500],
  });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isLenisManaged = useRef(false);

  // High-precision Lenis scroll synchronization
  useLenis((lenis) => {
    isLenisManaged.current = true;
    scrollState.current.scrollY = lenis.scroll;
    scrollState.current.progress = lenis.progress;
    scrollState.current.velocity = lenis.velocity;
  });

  // Native window scroll fallback (active if Lenis is not driving)
  useEffect(() => {
    const handleScroll = () => {
      if (isLenisManaged.current) return;
      scrollState.current.scrollY = window.scrollY;
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      scrollState.current.progress = window.scrollY / max;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Recalculate dynamic section focal positions on mount and resize
  useEffect(() => {
    const updateFocals = () => {
      scrollState.current.focals = measureFocalPoints();
    };

    updateFocals();
    const t1 = setTimeout(updateFocals, 350);
    const t2 = setTimeout(updateFocals, 1200);

    window.addEventListener("resize", updateFocals, { passive: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", updateFocals);
    };
  }, []);

  // Smooth cinematic entrance for 3D world on initial load
  useEffect(() => {
    if (wrapperRef.current) {
      gsap.fromTo(
        wrapperRef.current,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out", delay: 0.2 }
      );
    }
  }, []);

  const [dpr, setDpr] = useState(() => {
    if (typeof window === "undefined") return 1.25;
    return window.innerWidth < 768 ? 1.0 : Math.min(1.5, window.devicePixelRatio || 1);
  });
  const [isPaused, setIsPaused] = useState(false);

  // Intelligent Energy & Battery Throttling:
  // 1. Pause WebGL frame loop completely when tab is hidden or document is not visible (0% GPU/CPU idle)
  // 2. Adjust DPR based on device capabilities and battery level
  useEffect(() => {
    const handleVisibility = () => {
      const hidden = document.visibilityState === "hidden";
      setIsPaused(hidden);
    };

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setDpr(isMobile ? 1.0 : Math.min(1.5, window.devicePixelRatio || 1));
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("resize", handleResize, { passive: true });

    // Optional battery saving: throttle DPR if battery < 20% and not charging
    let isMounted = true;
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean }> })
        .getBattery()
        .then((battery) => {
          if (!isMounted) return;
          if (battery.level <= 0.2 && !battery.charging) {
            setDpr(1.0);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed -inset-12 w-[calc(100%+6rem)] h-[calc(100%+6rem)] pointer-events-none select-none z-0 overflow-hidden will-change-[filter,opacity] [transform:translate3d(0,0,0)] [backface-visibility:hidden]"
      style={{
        filter: "none",
        opacity: 1,
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        frameloop={isPaused ? "never" : "always"}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <PerformanceMonitor
          onDecline={() => setDpr(1)}
          onIncline={() => setDpr(1.5)}
        />
        <SynergisticWorld
          scrollState={scrollState}
          wrapperRef={wrapperRef}
        />
      </Canvas>
    </div>
  );
}
