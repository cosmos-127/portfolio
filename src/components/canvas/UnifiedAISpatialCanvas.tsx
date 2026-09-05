"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, PerformanceMonitor } from "@react-three/drei";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import { startGyroDynamo, updateGyroDynamo, stopGyroDynamo, playTick } from "@/lib/sound";

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
    scale: 1.02,
    opacity: 1.0,
    blur: 0,
    rotX: 0.0,
    rotY: 0.0,
    rotZ: 0.0,
  },
  // 1. Projects Section [01]: Sweeping behind 3D revolving project drum showcase with strong frosted blur
  {
    id: "projects",
    x: -0.72,
    y: 0.10,
    z: -0.85,
    scale: 1.02,
    opacity: 0.88,
    blur: 14.0,
    rotX: Math.PI * 0.45,
    rotY: Math.PI * 1.3,
    rotZ: Math.PI * 0.1,
  },
  // 2. Skills Section [02]: Floating behind capability matrix with strong frosted blur
  {
    id: "skills",
    x: 0.72,
    y: -0.06,
    z: -0.85,
    scale: 1.02,
    opacity: 0.88,
    blur: 14.0,
    rotX: Math.PI * 0.85,
    rotY: Math.PI * 2.5,
    rotZ: -Math.PI * 0.12,
  },
  // 3. Writing Section [03]: Floating behind technical article cards with strong frosted blur
  {
    id: "writing",
    x: -0.70,
    y: 0.04,
    z: -0.85,
    scale: 1.02,
    opacity: 0.88,
    blur: 14.0,
    rotX: Math.PI * 1.35,
    rotY: Math.PI * 3.7,
    rotZ: Math.PI * 0.14,
  },
  // 4. About Section [04]: Right column stage, crisp beside career timeline
  {
    id: "about",
    x: 0.82,
    y: 0.0,
    z: 0.0,
    scale: 1.02,
    opacity: 1.0,
    blur: 0,
    rotX: Math.PI * 1.8,
    rotY: Math.PI * 4.9,
    rotZ: -Math.PI * 0.08,
  },
  // 5. Contact Section [05]: Floating behind communication channels with strong frosted blur
  {
    id: "contact",
    x: -0.72,
    y: 0.1,
    z: -0.85,
    scale: 1.02,
    opacity: 0.88,
    blur: 14.0,
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

  return {
    x: THREE.MathUtils.lerp(s1.x, s2.x, t),
    y: THREE.MathUtils.lerp(s1.y, s2.y, t),
    z: THREE.MathUtils.lerp(s1.z, s2.z, t),
    scale: THREE.MathUtils.lerp(s1.scale, s2.scale, t),
    opacity: THREE.MathUtils.lerp(s1.opacity, s2.opacity, t),
    blur: THREE.MathUtils.lerp(s1.blur, s2.blur, t),
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
  const coreMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const midCageRef = useRef<THREE.Mesh>(null);
  const midCageMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const outerCageRef = useRef<THREE.Mesh>(null);

  // Stage 2 Center Yellow Transition Colors: Radiant Solar Gold & Amber Topaz Core
  const baseCoreColor = useMemo(() => new THREE.Color("#e63946"), []);
  const yellowCoreColor = useMemo(() => new THREE.Color("#facc15"), []);
  const baseEmissiveColor = useMemo(() => new THREE.Color("#991b1b"), []);
  const yellowEmissiveColor = useMemo(() => new THREE.Color("#f59e0b"), []);
  const baseCageColor = useMemo(() => new THREE.Color("#e63946"), []);
  const yellowCageColor = useMemo(() => new THREE.Color("#eab308"), []);

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

  // Ring 1 (Outer Halo): Base Crimson -> Stage 3 Neon Electric Cyan Azure
  const baseRing1Color = useMemo(() => new THREE.Color("#e63946"), []);
  const stage3Ring1Color = useMemo(() => new THREE.Color("#00d2ff"), []);
  const baseRing1Emissive = useMemo(() => new THREE.Color("#e63946"), []);
  const stage3Ring1Emissive = useMemo(() => new THREE.Color("#0284c7"), []);

  // Ring 2 (Middle Torus): Base Slate Titanium -> Stage 3 Plasma Violet
  const baseRing2Color = useMemo(() => new THREE.Color("#334155"), []);
  const stage3Ring2Color = useMemo(() => new THREE.Color("#a855f7"), []);
  const baseRing2Emissive = useMemo(() => new THREE.Color("#1e293b"), []);
  const stage3Ring2Emissive = useMemo(() => new THREE.Color("#7c3aed"), []);
  const baseRing2NodeColor = useMemo(() => new THREE.Color("#38bdf8"), []);
  const baseRing2NodeEmissive = useMemo(() => new THREE.Color("#38bdf8"), []);
  const baseRing2NotchColor = useMemo(() => new THREE.Color("#94a3b8"), []);
  const baseRing2NotchEmissive = useMemo(() => new THREE.Color("#38bdf8"), []);

  // Ring 3 (Inner Polar): Base Crimson -> Stage 3 Electric Emerald
  const baseRing3Color = useMemo(() => new THREE.Color("#e63946"), []);
  const stage3Ring3Color = useMemo(() => new THREE.Color("#10b981"), []);
  const baseRing3Emissive = useMemo(() => new THREE.Color("#e63946"), []);
  const stage3Ring3Emissive = useMemo(() => new THREE.Color("#059669"), []);

  const ring1GroupRef = useRef<THREE.Group>(null);
  const ring2GroupRef = useRef<THREE.Group>(null);
  const ring3GroupRef = useRef<THREE.Group>(null);
  const shardsRef = useRef<(THREE.Mesh | null)[]>([]);
  const tetraRefs = useRef<(THREE.Group | null)[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const projectPulse = useRef(0);
  const isHolding = useRef(false);
  const holdDuration = useRef(0);
  const ringsHoldIntensity = useRef(0);
  const cubesHoldIntensity = useRef(0);
  const stage3Intensity = useRef(0);
  const currentStageRef = useRef(0);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const tempGyroVec = useRef(new THREE.Vector3());
  const lastGyroTime = useRef(0);
  const glowCardsRef = useRef<HTMLElement[]>([]);

  // Floating Quantized FP16 / INT4 Tensor Shards with serene orbital parameters
  const tensorShards = useMemo(
    () => [
      { radius: 1.65, height: 0.9, speed: 0.14, phase: 0, size: 0.18, color: "#e63946" },
      { radius: 1.55, height: 1.05, speed: -0.11, phase: 1.2, size: 0.15, color: "#1e293b" },
      { radius: 1.72, height: -0.85, speed: 0.13, phase: 2.4, size: 0.19, color: "#e63946" },
      { radius: 1.6, height: -1.0, speed: -0.12, phase: 3.6, size: 0.14, color: "#334155" },
      { radius: 1.35, height: 1.55, speed: 0.15, phase: 4.8, size: 0.18, color: "#e63946" },
      { radius: 1.4, height: -1.5, speed: -0.13, phase: 0.7, size: 0.16, color: "#1e293b" },
      { radius: 1.8, height: 0.2, speed: 0.1, phase: 2.1, size: 0.15, color: "#e63946" },
      { radius: 1.75, height: -0.25, speed: -0.11, phase: 4.2, size: 0.16, color: "#475569" },
    ],
    []
  );

  // Stage 3 Polychromatic Palette for each individual Cube shard (High-contrast, harmonious jewel-spectrum tones)
  const stage3ShardColors = useMemo(
    () => [
      { color: new THREE.Color("#2563eb"), emissive: new THREE.Color("#1d4ed8") }, // Shard 0: Royal Sapphire (deep azure)
      { color: new THREE.Color("#f97316"), emissive: new THREE.Color("#c2410c") }, // Shard 1: Molten Tangerine (vibrant fire)
      { color: new THREE.Color("#d946ef"), emissive: new THREE.Color("#a21caf") }, // Shard 2: Electric Orchid (hot fuchsia)
      { color: new THREE.Color("#06b6d4"), emissive: new THREE.Color("#0891b2") }, // Shard 3: Aqua Turquoise (deep ocean teal)
      { color: new THREE.Color("#f43f5e"), emissive: new THREE.Color("#be123c") }, // Shard 4: Laser Crimson (brand ruby callback)
      { color: new THREE.Color("#4f46e5"), emissive: new THREE.Color("#3730a3") }, // Shard 5: Deep Ultramarine (cosmic indigo)
      { color: new THREE.Color("#84cc16"), emissive: new THREE.Color("#4d7c0f") }, // Shard 6: Electric Chartreuse (acid lime)
      { color: new THREE.Color("#8b5cf6"), emissive: new THREE.Color("#6d28d9") }, // Shard 7: Royal Amethyst (luminous purple)
    ],
    []
  );

  const baseShardColors = useMemo(
    () =>
      tensorShards.map((s) => ({
        color: new THREE.Color(s.color),
        emissive: new THREE.Color(s.color === "#e63946" ? "#e63946" : "#1e293b"),
      })),
    [tensorShards]
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
      currentStageRef.current = 1;
      startGyroDynamo();
      playTick(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("portfolio:gyro-stage-change", {
            detail: { stage: 1, holding: true },
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
        currentStageRef.current = 0;
        stopGyroDynamo();
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("portfolio:gyro-stage-change", {
              detail: { stage: 0, holding: false },
            })
          );
        }
        if (typeof document !== "undefined") {
          document.body.style.cursor = "";
        }
      }
    };

    // Global click-and-hold raycast detector on the 3D gyro
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("a, button, input, textarea, select, nav, [role='button']")) {
        return;
      }
      if (!groupRef.current || !camera) return;

      const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

      const hits = raycaster.intersectObject(groupRef.current, true);
      if (hits.length > 0) {
        handlePressStart();
      } else {
        const groupPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(groupPos);
        groupPos.project(camera);
        const dist = Math.hypot(ndcX - groupPos.x, ndcY - groupPos.y);
        if (dist < 0.28) {
          handlePressStart();
        }
      }
    };

    const handlePointerUp = () => {
      handlePressEnd();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    window.addEventListener("portfolio:project-step", handleProjectStep);
    window.addEventListener("portfolio:gyro-press-start", handlePressStart);
    window.addEventListener("portfolio:gyro-press-end", handlePressEnd);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    window.addEventListener("blur", handlePointerUp);

    return () => {
      mql.removeEventListener("change", handleMotionChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("portfolio:project-step", handleProjectStep);
      window.removeEventListener("portfolio:gyro-press-start", handlePressStart);
      window.removeEventListener("portfolio:gyro-press-end", handlePressEnd);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      window.removeEventListener("blur", handlePointerUp);
      stopGyroDynamo();
      if (typeof document !== "undefined") {
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
  const baseScale = isDesktop ? 1.02 : 0.82;

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

    // THREE-STAGE HOLD CHOREOGRAPHY (Strict 3.0s per stage transition):
    // Stage 1 (0s to 3.0s): Mechanical ratchet acceleration ("ki kit kit") - rings spool up smoothly, cubes calm
    // Stage 2 (3.0s to 6.0s): Magnetic resonance ignition ("bhum bhum bhum") - yellow core, cubes expand & tumble fast
    // Stage 3 (6.0s+): Supersonic turbine overdrive ("turbine") - extreme 27x ring spin, crazy chaotic cube dispersion & tumbling
    const STAGE2_DELAY = 3.0; // 3.0s delay for Stage 2
    const STAGE3_DELAY = 6.0; // 6.0s total delay for Stage 3 (3.0s after Stage 2)

    if (isHolding.current) {
      holdDuration.current += delta;

      // Broadcast exact real-time stage transitions synchronized with 3D canvas
      let targetStage = 1;
      if (holdDuration.current >= STAGE3_DELAY) {
        targetStage = 3;
      } else if (holdDuration.current >= STAGE2_DELAY) {
        targetStage = 2;
      }

      if (currentStageRef.current !== targetStage) {
        currentStageRef.current = targetStage;
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("portfolio:gyro-stage-change", {
              detail: { stage: targetStage, holding: true },
            })
          );
        }
      }

      // Stage 1: Smooth ratchet acceleration over 3 seconds
      ringsHoldIntensity.current = THREE.MathUtils.lerp(
        ringsHoldIntensity.current,
        1.0,
        0.045
      );

      // Stage 2: 3.0s delay before cubes activate & center turns yellow
      if (holdDuration.current > STAGE2_DELAY) {
        cubesHoldIntensity.current = THREE.MathUtils.lerp(
          cubesHoldIntensity.current,
          1.0,
          0.05
        );
      } else {
        cubesHoldIntensity.current = THREE.MathUtils.lerp(
          cubesHoldIntensity.current,
          0.0,
          0.1
        );
      }

      // Stage 3: 6.0s delay (3s after Stage 2) - full crazy turbine overdrive & chromatic surge
      if (holdDuration.current > STAGE3_DELAY) {
        stage3Intensity.current = THREE.MathUtils.lerp(
          stage3Intensity.current,
          1.0,
          0.05
        );
      } else {
        stage3Intensity.current = THREE.MathUtils.lerp(
          stage3Intensity.current,
          0.0,
          0.1
        );
      }
    } else {
      holdDuration.current = 0;
      if (currentStageRef.current !== 0) {
        currentStageRef.current = 0;
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("portfolio:gyro-stage-change", {
              detail: { stage: 0, holding: false },
            })
          );
        }
      }
      ringsHoldIntensity.current = THREE.MathUtils.lerp(
        ringsHoldIntensity.current,
        0.0,
        0.035
      );
      cubesHoldIntensity.current = THREE.MathUtils.lerp(
        cubesHoldIntensity.current,
        0.0,
        0.04
      );
      stage3Intensity.current = THREE.MathUtils.lerp(
        stage3Intensity.current,
        0.0,
        0.045
      );
    }

    // Update real-time 3-stage Web Audio synthesizer with precise durations & stage intensities
    updateGyroDynamo(
      ringsHoldIntensity.current,
      cubesHoldIntensity.current,
      stage3Intensity.current,
      holdDuration.current
    );

    // Multi-tiered ring overdrive speed per stage:
    // Base: 1.0x
    // Stage 1 (0-2s): up to 4.8x
    // Stage 2 (2-4s): up to 11.5x
    // Stage 3 (4s+): CRAZY supersonic 27x turbine velocity!
    const ringOverdrive =
      1 +
      ringsHoldIntensity.current * 3.8 +
      cubesHoldIntensity.current * 6.4 +
      stage3Intensity.current * 16.5;
    const ringSpeedMult = speedMult * ringOverdrive;

    // Delta scroll for kinetic rotational impulse
    const deltaScroll = sY - lastScrollY.current;
    lastScrollY.current = sY;

    // Sample continuous choreographed section spatial target
    const target = sampleSectionSpatial(sY, focals);

    // Controlled, gentle scroll nudge (strictly capped so it never spins like a machine)
    const scrollNudge = Math.max(-0.005, Math.min(0.005, deltaScroll * 0.00015)) * speedMult;

    // 1. SEAMLESS OUTER GIMBAL RING (RING 1 - Crimson Halo -> Stage 3 Electric Cyan)
    ring1Spin.current += (delta * 0.65 + scrollNudge * 2) * ringSpeedMult;

    if (ring1GroupRef.current) {
      const ratchetJitter = Math.sin(time * 26) * 0.025 * ringsHoldIntensity.current;
      const s2Wobble = cubesHoldIntensity.current * 0.16;
      const s3SupersonicPrecession = Math.sin(time * 15) * 0.36 * stage3Intensity.current;
      ring1GroupRef.current.rotation.x = Math.PI / 4 + ratchetJitter + s2Wobble + s3SupersonicPrecession;
      ring1GroupRef.current.rotation.y = ring1Spin.current;
      ring1GroupRef.current.rotation.z =
        Math.sin(time * 0.6) * (0.06 + ringsHoldIntensity.current * 0.08) +
        Math.cos(time * 12) * 0.22 * stage3Intensity.current;
    }

    // 2. COUNTER-ROTATING SECONDARY GIMBAL (RING 2 - Titanium Slate -> Stage 3 Plasma Violet)
    ring2Spin.current -= (delta * 0.55 + scrollNudge * 2) * ringSpeedMult;

    if (ring2GroupRef.current) {
      ring2GroupRef.current.rotation.x = ring2Spin.current;
      ring2GroupRef.current.rotation.y =
        -Math.PI / 4 +
        Math.cos(time * 0.7) * (0.08 + ringsHoldIntensity.current * 0.08) +
        Math.sin(time * 14) * 0.28 * stage3Intensity.current;
      ring2GroupRef.current.rotation.z =
        Math.PI / 6 +
        ringsHoldIntensity.current * 0.08 +
        cubesHoldIntensity.current * 0.14 +
        Math.cos(time * 16) * 0.32 * stage3Intensity.current;
    }

    // 3. INNER ACCENT ORBIT GIMBAL (RING 3 - Crimson Polar -> Stage 3 Electric Emerald)
    ring3Spin.current += (delta * 0.75 + scrollNudge * 2) * ringSpeedMult;
    if (ring3GroupRef.current) {
      ring3GroupRef.current.rotation.z = ring3Spin.current;
      ring3GroupRef.current.rotation.x =
        -Math.PI / 3 +
        Math.sin(time * 1.1) * (0.1 + ringsHoldIntensity.current * 0.08) +
        Math.sin(time * 18) * 0.36 * stage3Intensity.current;
      ring3GroupRef.current.rotation.y = Math.PI / 4 + (ring3Spin.current * 0.5);
    }

    // Decay card-step resonance pulse
    projectPulse.current = THREE.MathUtils.lerp(projectPulse.current, 0, 0.05);

    // 4. CENTRAL COMPUTE DIAMOND (Refractive Optical Crystal Core)
    // Multi-stage tumble: Spools up in Stage 1, thumps in Stage 2, crazy supersonic tumble in Stage 3
    if (coreRef.current) {
      const coreSpeedX = 1 + ringsHoldIntensity.current * 1.8 + cubesHoldIntensity.current * 4.2 + stage3Intensity.current * 9.5;
      const coreSpeedY = 1 + ringsHoldIntensity.current * 2.2 + cubesHoldIntensity.current * 5.0 + stage3Intensity.current * 11.0;
      coreRef.current.rotation.x += delta * 0.32 * speedMult * coreSpeedX;
      coreRef.current.rotation.y += delta * 0.42 * speedMult * coreSpeedY;

      const s2BhumPulse = Math.sin(time * 16) * 0.12 * cubesHoldIntensity.current;
      const s3TurbineFlash = Math.sin(time * 28) * 0.18 * stage3Intensity.current;
      const corePulse =
        (1 + Math.sin(time * 1.0) * 0.02 * speedMult) *
        (1 + projectPulse.current * 0.14) *
        (1 + ringsHoldIntensity.current * 0.05 + s2BhumPulse + s3TurbineFlash);
      coreRef.current.scale.setScalar(corePulse);
    }

    // 5. MID WIREFRAME CAGE (Glowing Crimson Octahedron -> Yellow in Stage 2/3)
    if (midCageRef.current) {
      midCageRef.current.rotation.y -= delta * 0.18 * ringSpeedMult;
      midCageRef.current.rotation.x += delta * 0.14 * ringSpeedMult;
      const midScale =
        (1 + Math.cos(time * 0.9) * 0.018 * speedMult) *
        (1 + ringsHoldIntensity.current * 0.06 + cubesHoldIntensity.current * 0.08);
      midCageRef.current.scale.setScalar(midScale);
    }

    // 6. OUTER WIREFRAME CAGE (Titanium Obsidian Dodecahedron)
    if (outerCageRef.current) {
      outerCageRef.current.rotation.x -= delta * 0.11 * ringSpeedMult;
      outerCageRef.current.rotation.z += delta * 0.13 * ringSpeedMult;
      const outerScale =
        (1 + Math.sin(time * 0.8) * 0.015 * speedMult) *
        (1 + ringsHoldIntensity.current * 0.05 + stage3Intensity.current * 0.08);
      outerCageRef.current.scale.setScalar(outerScale);
    }

    // 7. FLOATING TENSOR SHARD CUBES: DISTINCT 3-STAGE SPEED & CRAZY CENTRIFUGAL DISPERSION
    shardsRef.current.forEach((shardMesh, idx) => {
      if (shardMesh) {
        const shard = tensorShards[idx];

        // Orbit speed:
        // Stage 1 (0-2s): calm baseline 1.0x drift
        // Stage 2 (2-4s): accelerated 3.2x orbit
        // Stage 3 (4s+):  CRAZY supersonic 9.5x hyper-velocity orbit!
        const orbitMultiplier =
          1 +
          cubesHoldIntensity.current * 2.2 +
          stage3Intensity.current * 6.5;

        const shardAngle =
          shard.phase +
          time * shard.speed * speedMult * orbitMultiplier +
          (sY / 2400) * Math.sign(shard.speed);

        // Outward radial dispersion:
        // Stage 1: tight baseline
        // Stage 2: centrifugal expansion +0.38
        // Stage 3: CRAZY wide dispersion +0.95 with non-linear harmonic breathing
        const rad =
          shard.radius +
          Math.sin(time * 0.8 + idx * 0.9) * 0.04 * speedMult +
          cubesHoldIntensity.current * 0.38 +
          stage3Intensity.current * (0.62 + Math.sin(time * 7 + idx * 1.4) * 0.24);

        shardMesh.position.x = Math.cos(shardAngle) * rad;
        shardMesh.position.z = Math.sin(shardAngle) * rad;
        shardMesh.position.y =
          shard.height +
          Math.sin(time * 0.9 + idx * 0.7) * 0.05 * speedMult +
          (stage3Intensity.current * Math.sin(time * 9 + idx * 2.0) * 0.28);

        // Cube Individual Axial Rotation (Distinct speed tiers per stage):
        // Idle: calm 0.35 rad/s
        // Stage 1 (0-2s): 1.1 rad/s ratchet spool
        // Stage 2 (2-4s): 7.2 rad/s fast tumbling
        // Stage 3 (4s+):  CRAZY 22.0 rad/s supersonic spin on all 3 axes!
        const baseTumble = prefersReducedMotion.current ? 0.08 : 0.35;
        const s1Tumble = ringsHoldIntensity.current * 0.75;
        const s2Tumble = cubesHoldIntensity.current * 6.5;
        const s3Tumble = stage3Intensity.current * 15.5;
        const fastTumble = s1Tumble + s2Tumble + s3Tumble;

        const tumbleX = (baseTumble + fastTumble) * (1 + (idx % 3) * 0.38);
        const tumbleY = (baseTumble * 1.2 + fastTumble * 1.42) * (1 - (idx % 2) * 0.32);
        const tumbleZ = (baseTumble * 0.8 + fastTumble * 1.55) * (1 + (idx % 4) * 0.3);

        shardMesh.rotation.x += delta * tumbleX;
        shardMesh.rotation.y += delta * tumbleY;
        shardMesh.rotation.z += delta * tumbleZ;

        // Scale pop & dynamic breathing in Stage 3:
        const cubeScale =
          1 +
          cubesHoldIntensity.current * 0.25 +
          stage3Intensity.current * (0.34 + Math.sin(time * 14 + idx * 1.6) * 0.16);
        shardMesh.scale.setScalar(cubeScale);
      }
    });

    // 7.5 HIGH-ENTROPY WANDERING MICRO-TETRAHEDRONS (Free-roaming black wireframe structures)
    tetraRefs.current.forEach((tetraGroup, idx) => {
      if (tetraGroup) {
        const config = entropyTetrahedrons[idx];
        // Dynamic entropy boost: surges during hold overdrive
        const entropyOverdrive =
          1 + ringsHoldIntensity.current * 2.4 + cubesHoldIntensity.current * 1.8;
        const effectiveTime = time * speedMult * (0.85 + idx * 0.18);

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
          (1 + Math.sin(effectiveTime * 2.2 + idx * 1.5) * 0.06) *
          (1 + cubesHoldIntensity.current * 0.22);
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
            const intensity = norm * norm;
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
            if (u.intensity > 0.1) {
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
        : -(mousePos.current.y * Math.PI) / 16;
      const mouseTiltY = prefersReducedMotion.current
        ? 0
        : (mousePos.current.x * Math.PI) / 16;

      const targetRotX = target.rotX + mouseTiltX;
      const targetRotY = target.rotY + mouseTiltY + time * 0.03 * speedMult;
      const targetRotZ = target.rotZ + Math.sin(time * 0.25) * 0.03 * speedMult;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.04
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.04
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotZ,
        0.04
      );
    }

    // 9. DYNAMIC BLUR & OPACITY SYNCHRONIZATION WITH ZERO STEP JITTER
    smoothBlur.current = THREE.MathUtils.lerp(
      smoothBlur.current,
      target.blur,
      0.08
    );
    smoothOpacity.current = THREE.MathUtils.lerp(
      smoothOpacity.current,
      target.opacity,
      0.08
    );

    if (wrapperRef.current) {
      const b = Math.max(0, smoothBlur.current);
      wrapperRef.current.style.filter = b > 0.08 ? `blur(${b.toFixed(2)}px)` : "none";
      wrapperRef.current.style.opacity = Math.max(0, Math.min(1, smoothOpacity.current)).toFixed(3);
    }

    // 10. HERO CURSOR PROXIMITY BLOOM, CARD RESONANCE & TWO-STAGE GYRO OVERDRIVE
    if (coreMaterialRef.current) {
      const isOverStage = isDesktop && sY < (focals[1] ?? 800) * 0.4 && mousePos.current.x > 0.05;
      const targetEmissive =
        (isOverStage ? 1.25 : 0.85) +
        projectPulse.current * 0.75 +
        ringsHoldIntensity.current * 0.7 +
        cubesHoldIntensity.current * 1.3;
      coreMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        coreMaterialRef.current.emissiveIntensity,
        targetEmissive,
        0.08
      );

      // Smooth color shift of central core to vibrant yellow in Stage 2
      coreMaterialRef.current.color.lerpColors(
        baseCoreColor,
        yellowCoreColor,
        cubesHoldIntensity.current
      );
      coreMaterialRef.current.emissive.lerpColors(
        baseEmissiveColor,
        yellowEmissiveColor,
        cubesHoldIntensity.current
      );
    }

    // Mid wireframe cage shifts to brilliant yellow in Stage 2
    if (midCageMaterialRef.current) {
      midCageMaterialRef.current.color.lerpColors(
        baseCageColor,
        yellowCageColor,
        cubesHoldIntensity.current
      );
      midCageMaterialRef.current.emissive.lerpColors(
        baseCageColor,
        yellowCageColor,
        cubesHoldIntensity.current
      );
    }

    // Dynamic inner core light radiates yellow in Stage 2
    if (coreLightRef.current) {
      coreLightRef.current.color.lerpColors(
        baseCoreColor,
        yellowCoreColor,
        cubesHoldIntensity.current
      );
      coreLightRef.current.intensity = THREE.MathUtils.lerp(
        1.2,
        3.2,
        cubesHoldIntensity.current
      );
    }

    // 11. STAGE 3 CHROMATIC OVERDRIVE: ALL RINGS AND CUBES TAKE ON DISTINCT VIBRANT COLORS
    // Ring 1: Outer Torus & Assembly -> Neon Electric Cyan (#00f0ff)
    if (ring1MaterialRef.current) {
      ring1MaterialRef.current.color.lerpColors(
        baseRing1Color,
        stage3Ring1Color,
        stage3Intensity.current
      );
      ring1MaterialRef.current.emissive.lerpColors(
        baseRing1Emissive,
        stage3Ring1Emissive,
        stage3Intensity.current
      );
      ring1MaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        1.0,
        2.4,
        stage3Intensity.current
      );
    }
    if (ring1NodeMatRef.current) {
      ring1NodeMatRef.current.emissive.lerpColors(
        baseRing1Emissive,
        stage3Ring1Color,
        stage3Intensity.current
      );
    }
    if (ring1NotchMatRef.current) {
      ring1NotchMatRef.current.color.lerpColors(
        baseRing1Color,
        stage3Ring1Color,
        stage3Intensity.current
      );
      ring1NotchMatRef.current.emissive.lerpColors(
        baseRing1Emissive,
        stage3Ring1Emissive,
        stage3Intensity.current
      );
    }

    // Ring 2: Middle Torus & Assembly -> Plasma Violet (#a855f7)
    if (ring2MaterialRef.current) {
      ring2MaterialRef.current.color.lerpColors(
        baseRing2Color,
        stage3Ring2Color,
        stage3Intensity.current
      );
      ring2MaterialRef.current.emissive.lerpColors(
        baseRing2Emissive,
        stage3Ring2Emissive,
        stage3Intensity.current
      );
      ring2MaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        0.8,
        2.5,
        stage3Intensity.current
      );
    }
    if (ring2NodeMatRef.current) {
      ring2NodeMatRef.current.color.lerpColors(
        baseRing2NodeColor,
        stage3Ring2Color,
        stage3Intensity.current
      );
      ring2NodeMatRef.current.emissive.lerpColors(
        baseRing2NodeEmissive,
        stage3Ring2Emissive,
        stage3Intensity.current
      );
    }
    if (ring2NotchMatRef.current) {
      ring2NotchMatRef.current.color.lerpColors(
        baseRing2NotchColor,
        stage3Ring2Color,
        stage3Intensity.current
      );
      ring2NotchMatRef.current.emissive.lerpColors(
        baseRing2NotchEmissive,
        stage3Ring2Emissive,
        stage3Intensity.current
      );
    }

    // Ring 3: Inner Torus & Assembly -> Electric Emerald (#10b981)
    if (ring3MaterialRef.current) {
      ring3MaterialRef.current.color.lerpColors(
        baseRing3Color,
        stage3Ring3Color,
        stage3Intensity.current
      );
      ring3MaterialRef.current.emissive.lerpColors(
        baseRing3Emissive,
        stage3Ring3Emissive,
        stage3Intensity.current
      );
      ring3MaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        0.85,
        2.5,
        stage3Intensity.current
      );
    }
    if (ring3NodeMatRef.current) {
      ring3NodeMatRef.current.emissive.lerpColors(
        baseRing3Emissive,
        stage3Ring3Color,
        stage3Intensity.current
      );
    }
    if (ring3NotchMatRef.current) {
      ring3NotchMatRef.current.color.lerpColors(
        baseRing3Color,
        stage3Ring3Color,
        stage3Intensity.current
      );
      ring3NotchMatRef.current.emissive.lerpColors(
        baseRing3Emissive,
        stage3Ring3Emissive,
        stage3Intensity.current
      );
    }

    // Cubes (Tensor Shards): Each individual cube morphs into a distinct polychromatic color in Stage 3!
    shardsRef.current.forEach((shardMesh, i) => {
      if (shardMesh && shardMesh.material) {
        const mat = shardMesh.material as THREE.MeshStandardMaterial;
        const base = baseShardColors[i];
        const s3 = stage3ShardColors[i];
        if (base && s3) {
          mat.color.lerpColors(base.color, s3.color, stage3Intensity.current);
          mat.emissive.lerpColors(base.emissive, s3.emissive, stage3Intensity.current);
          mat.emissiveIntensity = THREE.MathUtils.lerp(
            0.95,
            2.4,
            stage3Intensity.current
          );
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Central Core Dynamic Point Light (Crimson -> Radiant Yellow in Stage 2) */}
      <pointLight
        ref={coreLightRef}
        position={[0, 0, 0]}
        intensity={1.2}
        color="#e63946"
        distance={6.5}
        decay={2}
      />

      {/* Central Reasoning Core: Refractive Optical Crystal Diamond */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshPhysicalMaterial
          ref={coreMaterialRef}
          color="#e63946"
          emissive="#991b1b"
          emissiveIntensity={0.85}
          roughness={0.12}
          metalness={0.1}
          transmission={0.35}
          thickness={0.8}
          ior={1.6}
          specularIntensity={1.2}
        />
      </mesh>

      {/* Mid Octahedron Wireframe Cage: Crimson Glow -> Yellow in Stage 2 */}
      <mesh ref={midCageRef}>
        <octahedronGeometry args={[1.65, 0]} />
        <meshStandardMaterial
          ref={midCageMaterialRef}
          color="#e63946"
          wireframe
          emissive="#e63946"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Outer Dodecahedron Cage: Titanium Obsidian */}
      <mesh ref={outerCageRef}>
        <dodecahedronGeometry args={[2.2, 0]} />
        <meshStandardMaterial
          color="#0f172a"
          wireframe
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>

      {/* 1. OUTER GYROSCOPIC GIMBAL RING (Crimson Halo -> Stage 3 Neon Electric Cyan) */}
      <group ref={ring1GroupRef} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[2.55, 0.048, 24, 160]} />
          <meshStandardMaterial
            ref={ring1MaterialRef}
            color="#e63946"
            emissive="#e63946"
            emissiveIntensity={1.0}
            roughness={0.12}
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
              color="#ffffff"
              emissive="#e63946"
              emissiveIntensity={3.2}
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
              color="#e63946"
              emissive="#e63946"
              emissiveIntensity={1.6}
            />
          </mesh>
        ))}
      </group>

      {/* 2. SECONDARY GYROSCOPIC GIMBAL RING (Slate Titanium -> Stage 3 Plasma Violet) */}
      <group ref={ring2GroupRef}>
        <mesh>
          <torusGeometry args={[2.18, 0.04, 20, 140]} />
          <meshStandardMaterial
            ref={ring2MaterialRef}
            color="#334155"
            emissive="#1e293b"
            emissiveIntensity={0.8}
            roughness={0.18}
            metalness={0.9}
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
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={2.8}
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
              color="#94a3b8"
              emissive="#38bdf8"
              emissiveIntensity={1.5}
            />
          </mesh>
        ))}
      </group>

      {/* 3. INNER ACCENT ORBIT GIMBAL (Crimson Polar Orbit -> Stage 3 Electric Emerald) */}
      <group ref={ring3GroupRef}>
        <mesh>
          <torusGeometry args={[1.8, 0.034, 18, 120]} />
          <meshStandardMaterial
            ref={ring3MaterialRef}
            color="#e63946"
            emissive="#e63946"
            emissiveIntensity={0.85}
            roughness={0.15}
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
                color="#ffffff"
                emissive="#e63946"
                emissiveIntensity={3.0}
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
                color="#e63946"
                emissive="#e63946"
                emissiveIntensity={1.8}
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
            emissive={shard.color === "#e63946" ? "#e63946" : "#1e293b"}
            emissiveIntensity={0.95}
            roughness={0.15}
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
        color="#e63946"
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

  const [dpr, setDpr] = useState(1.5);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden will-change-[filter,opacity] [transform:translate3d(0,0,0)] [backface-visibility:hidden]"
      style={{
        filter: "none",
        opacity: 1,
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 45 }}
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
