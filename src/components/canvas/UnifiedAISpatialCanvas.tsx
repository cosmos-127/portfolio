"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, PerformanceMonitor } from "@react-three/drei";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useLenis } from "lenis/react";

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
  // 0. Hero Section: Empty right column -> Fully opaque (1.0), scale 1.0, NO blur (0px), centered in open stage
  {
    id: "top",
    x: 1.0,
    y: 0.0,
    z: 0.0,
    scale: 1.0,
    opacity: 1.0,
    blur: 0,
    rotX: 0.0,
    rotY: 0.0,
    rotZ: 0.0,
  },
  // 1. Projects Section: Left side backdrop behind controls & tabs, clear of the 3D drum cards on the right
  {
    id: "projects",
    x: -0.85,
    y: 0.12,
    z: -0.65,
    scale: 0.85,
    opacity: 0.45,
    blur: 3.5,
    rotX: Math.PI * 0.45,
    rotY: Math.PI * 1.3,
    rotZ: Math.PI * 0.1,
  },
  // 2. Skills Section: Right side background behind the 4-column capability grid
  {
    id: "skills",
    x: 0.85,
    y: -0.08,
    z: -0.4,
    scale: 0.9,
    opacity: 0.5,
    blur: 3.0,
    rotX: Math.PI * 0.85,
    rotY: Math.PI * 2.5,
    rotZ: -Math.PI * 0.12,
  },
  // 3. Writing Section: Left side background behind article cards
  {
    id: "writing",
    x: -0.8,
    y: 0.06,
    z: -0.4,
    scale: 0.9,
    opacity: 0.5,
    blur: 3.0,
    rotX: Math.PI * 1.35,
    rotY: Math.PI * 3.7,
    rotZ: Math.PI * 0.14,
  },
  // 4. About Section: Open empty right column stage -> Fully opaque (1.0), scale 1.0, NO blur (0px)!
  {
    id: "about",
    x: 1.0,
    y: 0.0,
    z: 0.0,
    scale: 1.0,
    opacity: 1.0,
    blur: 0,
    rotX: Math.PI * 1.8,
    rotY: Math.PI * 4.9,
    rotZ: -Math.PI * 0.08,
  },
  // 5. Contact Section: Atmospheric upper-left background behind contact channels & telemetry
  {
    id: "contact",
    x: -0.85,
    y: 0.14,
    z: -0.5,
    scale: 0.85,
    opacity: 0.45,
    blur: 3.5,
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
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const midCageRef = useRef<THREE.Mesh>(null);
  const outerCageRef = useRef<THREE.Mesh>(null);
  const ring1GroupRef = useRef<THREE.Group>(null);
  const ring2GroupRef = useRef<THREE.Group>(null);
  const ring3GroupRef = useRef<THREE.Group>(null);
  const shardsRef = useRef<(THREE.Mesh | null)[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });

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

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    return () => {
      mql.removeEventListener("change", handleMotionChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Spatial metrics: on desktop, offset right to align perfectly with the empty hero column
  const isDesktop = viewport.width > 7.5;
  const rightOffset = isDesktop ? Math.min(viewport.width * 0.25, 2.75) : 0;
  const baseScale = isDesktop ? 1.0 : 0.8;

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
    const v = smoothVelocity.current;
    const speedMult = prefersReducedMotion.current ? 0.2 : 1.0;

    // Delta scroll for kinetic rotational impulse
    const deltaScroll = sY - lastScrollY.current;
    lastScrollY.current = sY;

    // Sample continuous choreographed section spatial target
    const target = sampleSectionSpatial(sY, focals);

    // Controlled, gentle scroll nudge (strictly capped so it never spins like a machine)
    const scrollNudge = Math.max(-0.005, Math.min(0.005, deltaScroll * 0.00015)) * speedMult;

    // 1. SEAMLESS OUTER GIMBAL RING (RING 1 - Crimson Halo)
    // Serene, steady 0.08 rad/s base orbit
    ring1Spin.current += (delta * 0.08 + scrollNudge) * speedMult;

    if (ring1GroupRef.current) {
      ring1GroupRef.current.rotation.z = ring1Spin.current;
      // Gentle, slow harmonic precession (0.16 rad/s wave, subtle 0.06 rad amplitude)
      ring1GroupRef.current.rotation.x =
        Math.PI / 3 + Math.sin(time * 0.16) * 0.06;
      ring1GroupRef.current.rotation.y =
        Math.PI / 6 + Math.cos(time * 0.14) * 0.05;
    }

    // 2. COUNTER-ROTATING SECONDARY GIMBAL (RING 2 - Titanium Slate)
    // Elegant, slow 0.065 rad/s counter-orbit
    ring2Spin.current -= (delta * 0.065 + scrollNudge * 0.8) * speedMult;

    if (ring2GroupRef.current) {
      ring2GroupRef.current.rotation.x = ring2Spin.current;
      ring2GroupRef.current.rotation.y =
        -Math.PI / 4 + Math.sin(time * 0.15) * 0.05;
      ring2GroupRef.current.rotation.z =
        Math.PI / 6 + Math.cos(time * 0.13) * 0.04;
    }

    // 3. INNER ACCENT ORBIT GIMBAL (RING 3 - Crimson Polar Orbit)
    // Delicate 0.09 rad/s polar orbit
    ring3Spin.current += (delta * 0.09 + scrollNudge * 0.9) * speedMult;
    if (ring3GroupRef.current) {
      ring3GroupRef.current.rotation.y = ring3Spin.current;
      ring3GroupRef.current.rotation.z =
        Math.PI / 4 + Math.sin(time * 0.18) * 0.05;
      ring3GroupRef.current.rotation.x =
        -Math.PI / 5 + Math.cos(time * 0.16) * 0.04;
    }

    // 4. CENTRAL COMPUTE DIAMOND (Refractive Optical Crystal Core)
    // Calm, stately tumbling
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.08 * speedMult;
      coreRef.current.rotation.y += delta * 0.11 * speedMult;
      // Deep, serene ambient pulse (1.0 rad/s wave, subtle 0.02 amplitude)
      const corePulse = 1 + Math.sin(time * 1.0) * 0.02 * speedMult;
      coreRef.current.scale.setScalar(corePulse);
    }

    // 5. MID WIREFRAME CAGE (Glowing Crimson Octahedron)
    if (midCageRef.current) {
      midCageRef.current.rotation.y -= delta * 0.045 * speedMult;
      midCageRef.current.rotation.x += delta * 0.03 * speedMult;
      const midScale = 1 + Math.cos(time * 0.9) * 0.018 * speedMult;
      midCageRef.current.scale.setScalar(midScale);
    }

    // 6. OUTER WIREFRAME CAGE (Titanium Obsidian Dodecahedron)
    if (outerCageRef.current) {
      outerCageRef.current.rotation.x -= delta * 0.025 * speedMult;
      outerCageRef.current.rotation.z += delta * 0.03 * speedMult;
      const outerScale = 1 + Math.sin(time * 0.8) * 0.015 * speedMult;
      outerCageRef.current.scale.setScalar(outerScale);
    }

    // 7. FLOATING TENSOR SHARDS (Gentle Celestial Drift)
    shardsRef.current.forEach((shardMesh, idx) => {
      if (shardMesh) {
        const shard = tensorShards[idx];
        const shardAngle =
          shard.phase +
          time * shard.speed * speedMult +
          (sY / 2400) * Math.sign(shard.speed);
        const rad = shard.radius + Math.sin(time * 0.8 + idx * 0.9) * 0.04 * speedMult;
        shardMesh.position.x = Math.cos(shardAngle) * rad;
        shardMesh.position.z = Math.sin(shardAngle) * rad;
        shardMesh.position.y =
          shard.height +
          Math.sin(time * 0.9 + idx * 0.7) * 0.05 * speedMult;

        shardMesh.rotation.x += delta * 0.15 * speedMult;
        shardMesh.rotation.y += delta * 0.18 * speedMult;
      }
    });

    // 8. MASTER GROUP PARALLAX, ROTATION & SECTION-TO-SECTION POSITION
    if (groupRef.current) {
      // Spatial positions driven by dynamic target + gentle ambient hover
      const targetPosX = target.x * rightOffset + Math.cos(time * 0.35) * 0.025;
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
  });

  return (
    <group ref={groupRef}>
      {/* Central Reasoning Core: Refractive Optical Crystal Diamond */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshPhysicalMaterial
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

      {/* Mid Octahedron Wireframe Cage: Crimson Glow */}
      <mesh ref={midCageRef}>
        <octahedronGeometry args={[1.65, 0]} />
        <meshStandardMaterial
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

      {/* 1. OUTER GYROSCOPIC GIMBAL RING (Crimson Halo + Orbit Nodes) */}
      <group ref={ring1GroupRef} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <mesh>
          <torusGeometry args={[2.55, 0.048, 24, 160]} />
          <meshStandardMaterial
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
              color="#e63946"
              emissive="#e63946"
              emissiveIntensity={1.6}
            />
          </mesh>
        ))}
      </group>

      {/* 2. SECONDARY GYROSCOPIC GIMBAL RING (Slate Titanium) */}
      <group ref={ring2GroupRef} rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
        <mesh>
          <torusGeometry args={[2.18, 0.04, 20, 140]} />
          <meshStandardMaterial
            color="#334155"
            emissive="#1e293b"
            emissiveIntensity={0.8}
            roughness={0.18}
            metalness={0.9}
          />
        </mesh>
        {/* Counter nodes */}
        {[Math.PI / 4, (5 * Math.PI) / 4].map((angle, idx) => (
          <mesh
            key={idx}
            position={[Math.cos(angle) * 2.18, Math.sin(angle) * 2.18, 0]}
          >
            <sphereGeometry args={[0.068, 16, 16]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#94a3b8"
              emissiveIntensity={2.5}
              roughness={0.15}
            />
          </mesh>
        ))}
      </group>

      {/* 3. INNER ACCENT ORBIT GIMBAL (Crimson Polar Orbit) */}
      <group ref={ring3GroupRef} rotation={[-Math.PI / 4, 0, Math.PI / 3]}>
        <mesh>
          <torusGeometry args={[1.8, 0.032, 18, 120]} />
          <meshStandardMaterial
            color="#e63946"
            emissive="#e63946"
            emissiveIntensity={0.85}
            roughness={0.15}
            metalness={0.82}
          />
        </mesh>
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
