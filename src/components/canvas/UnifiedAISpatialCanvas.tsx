"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ScrollState {
  progress: number;
  velocity: number;
}

type ScrollStateRef = React.RefObject<ScrollState>;
type SizeScaleRef = React.RefObject<{ value: number }>;

interface Waypoint {
  p: number;
  x: number; // multiplier of rightOffset
  y: number; // world Y offset
  z: number; // world Z depth
  scale: number;
  rotX: number; // pitch offset
  rotY: number; // yaw offset
  rotZ: number; // roll offset
}

// Choreographed 3D Waypoints across the page journey
const WAYPOINTS: Waypoint[] = [
  // 0. Hero & Landing: Right (x: 1.0), scale: 0.9, clear
  { p: 0.0, x: 1.0, y: 0.0, z: 0.0, scale: 0.9, rotX: 0.0, rotY: 0.0, rotZ: 0.0 },
  // 1. Hero -> About transition: gentle orbital swoop
  { p: 0.14, x: 1.02, y: -0.16, z: 0.08, scale: 0.75, rotX: Math.PI * 0.25, rotY: Math.PI * 0.85, rotZ: Math.PI * 0.12 },
  // 2. About section [01]: Right (x: 1.0), scale: 0.6, clear
  { p: 0.28, x: 1.0, y: 0.02, z: 0.12, scale: 0.6, rotX: Math.PI * 0.5, rotY: Math.PI * 1.75, rotZ: -Math.PI * 0.1 },
  // 3. About -> Skills transition
  { p: 0.42, x: 1.04, y: -0.12, z: -0.2, scale: 0.65, rotX: Math.PI * 0.75, rotY: Math.PI * 2.5, rotZ: Math.PI * 0.16 },
  // 4. Skills section [02]: Right (x: 1.05), scale: 0.7, blur 7px
  { p: 0.54, x: 1.05, y: -0.14, z: -0.55, scale: 0.7, rotX: Math.PI * 1.05, rotY: Math.PI * 3.4, rotZ: -Math.PI * 0.14 },
  // 5. Section 03 arrives [03 - Projects]: Left (x: -0.9), scale: 0.1, blur 7px
  { p: 0.65, x: -0.9, y: 0.22, z: -1.2, scale: 0.1, rotX: Math.PI * 1.35, rotY: Math.PI * 4.4, rotZ: Math.PI * 0.15 },
  { p: 0.78, x: -0.9, y: -0.15, z: -1.2, scale: 0.1, rotX: Math.PI * 1.55, rotY: Math.PI * 4.9, rotZ: -Math.PI * 0.12 },
  // 6. Section 03 ends -> Writing section [04]: Right (x: 0.88), scale: 0.9, blur 7px
  { p: 0.88, x: 0.88, y: -0.06, z: -0.25, scale: 0.9, rotX: Math.PI * 1.75, rotY: Math.PI * 5.4, rotZ: -Math.PI * 0.1 },
  // 7. Writing -> Contact transition: lively orbital swoop to the left
  { p: 0.94, x: -0.35, y: 0.0, z: -0.15, scale: 0.8, rotX: Math.PI * 1.88, rotY: Math.PI * 5.7, rotZ: -Math.PI * 0.05 },
  // 8. Contact section [05]: Left (x: -0.92), scale: 0.7, blur 7px
  { p: 1.0, x: -0.92, y: 0.02, z: -0.1, scale: 0.7, rotX: Math.PI * 2.0, rotY: Math.PI * 6.0, rotZ: 0.0 },
];

function interpolateWaypoints(p: number): Waypoint {
  const clampedP = Math.max(0, Math.min(1, p));
  let idx = 0;
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    if (clampedP >= WAYPOINTS[i].p && clampedP <= WAYPOINTS[i + 1].p) {
      idx = i;
      break;
    }
  }

  const w1 = WAYPOINTS[idx];
  const w2 = WAYPOINTS[Math.min(idx + 1, WAYPOINTS.length - 1)];
  const range = w2.p - w1.p;
  const rawT = range > 0 ? (clampedP - w1.p) / range : 0;
  // Smoothstep easing for silky spline-like transitions between waypoints
  const t = rawT * rawT * (3 - 2 * rawT);

  return {
    p: clampedP,
    x: THREE.MathUtils.lerp(w1.x, w2.x, t),
    y: THREE.MathUtils.lerp(w1.y, w2.y, t),
    z: THREE.MathUtils.lerp(w1.z, w2.z, t),
    scale: THREE.MathUtils.lerp(w1.scale, w2.scale, t),
    rotX: THREE.MathUtils.lerp(w1.rotX, w2.rotX, t),
    rotY: THREE.MathUtils.lerp(w1.rotY, w2.rotY, t),
    rotZ: THREE.MathUtils.lerp(w1.rotZ, w2.rotZ, t),
  };
}

// ============================================================================
// SIGNATURE 3D FIGURE: NEURAL TENSOR HYPER-LATTICE & GYROSCOPIC GIMBAL ENGINE
// ============================================================================
function TensorHyperLattice({
  scrollState,
  sizeScaleRef,
}: {
  scrollState: ScrollStateRef;
  sizeScaleRef: SizeScaleRef;
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

  // Floating Quantized FP16 / INT4 Tensor Shards with dedicated 3D orbital trajectory parameters
  const tensorShards = useMemo(
    () => [
      { radius: 1.6, height: 0.9, speed: 0.35, phase: 0, size: 0.18, color: "#e63946" },
      { radius: 1.5, height: 1.0, speed: -0.28, phase: 1.2, size: 0.15, color: "#1e293b" },
      { radius: 1.68, height: -0.85, speed: 0.32, phase: 2.4, size: 0.19, color: "#e63946" },
      { radius: 1.55, height: -0.95, speed: -0.3, phase: 3.6, size: 0.14, color: "#334155" },
      { radius: 1.3, height: 1.5, speed: 0.4, phase: 4.8, size: 0.18, color: "#e63946" },
      { radius: 1.35, height: -1.45, speed: -0.35, phase: 0.7, size: 0.16, color: "#1e293b" },
      { radius: 1.75, height: 0.2, speed: 0.25, phase: 2.1, size: 0.15, color: "#e63946" },
      { radius: 1.7, height: -0.2, speed: -0.26, phase: 4.2, size: 0.16, color: "#475569" },
    ],
    []
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Responsive spatial metrics with enhanced visibility
  const isDesktop = viewport.width > 7.5;
  const rightOffset = isDesktop ? Math.min(viewport.width * 0.23, 2.7) : 0;
  const baseScale = isDesktop ? 1.22 : 0.92;

  // Physics accumulators for zero-jitter, organic motion
  const smoothProgress = useRef(0);
  const smoothVelocity = useRef(0);
  const lastProgress = useRef(0);
  const ring1Spin = useRef(0);
  const ring2Spin = useRef(0);
  const ring3Spin = useRef(0);

  useFrame((state, delta) => {
    const rawProgress = scrollState.current?.progress ?? 0;
    const rawVelocity = scrollState.current?.velocity ?? 0;

    // Delta progress for immediate rotational reaction on scroll
    const deltaScroll = rawProgress - lastProgress.current;
    lastProgress.current = rawProgress;

    // Organic physics smoothing
    smoothProgress.current = THREE.MathUtils.lerp(
      smoothProgress.current,
      rawProgress,
      0.08
    );
    smoothVelocity.current = THREE.MathUtils.lerp(
      smoothVelocity.current,
      rawVelocity,
      0.1
    );

    const p = smoothProgress.current;
    const v = smoothVelocity.current;
    const time = state.clock.getElapsedTime();

    // Sample continuous choreographed waypoint trajectory
    const wp = interpolateWaypoints(p);

    // 1. DYNAMIC OUTER RING (RING 1) - PRIMARY SCROLL-DRIVEN ROTATION & PRECESSION
    ring1Spin.current +=
      delta * 0.25 +
      deltaScroll * 22.0 +
      Math.sign(deltaScroll || v) * Math.min(Math.abs(v) * delta * 0.005, 0.08);

    if (ring1GroupRef.current) {
      ring1GroupRef.current.rotation.z = ring1Spin.current;
      ring1GroupRef.current.rotation.x =
        Math.PI / 3 + Math.sin(p * Math.PI * 3.0) * 0.45 + v * 0.0008;
      ring1GroupRef.current.rotation.y =
        Math.PI / 6 + Math.cos(p * Math.PI * 2.5) * 0.35;
    }

    // 2. COUNTER-ROTATING SECONDARY GIMBAL (RING 2 - Titanium Slate)
    ring2Spin.current -=
      delta * 0.28 +
      deltaScroll * 18.0 +
      Math.sign(deltaScroll || v) * Math.min(Math.abs(v) * delta * 0.004, 0.06);

    if (ring2GroupRef.current) {
      ring2GroupRef.current.rotation.x = ring2Spin.current;
      ring2GroupRef.current.rotation.y = -Math.PI / 4 + p * Math.PI * 3.2;
      ring2GroupRef.current.rotation.z =
        Math.PI / 6 + Math.sin(p * Math.PI * 2.0) * 0.25;
    }

    // 3. INNER ACCENT ORBIT GIMBAL (RING 3 - Crimson Polar Orbit)
    ring3Spin.current += delta * 0.35 + deltaScroll * 24.0;
    if (ring3GroupRef.current) {
      ring3GroupRef.current.rotation.y = ring3Spin.current;
      ring3GroupRef.current.rotation.z = Math.PI / 4 - p * Math.PI * 2.5;
      ring3GroupRef.current.rotation.x =
        -Math.PI / 5 + Math.cos(p * Math.PI * 2.5) * 0.28;
    }

    // 4. CENTRAL COMPUTE DIAMOND (Faceted Icosahedron Core)
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.35 + Math.abs(deltaScroll) * 5.5;
      coreRef.current.rotation.y += delta * 0.5 + Math.abs(deltaScroll) * 7.0;
      const corePulse =
        1 + Math.sin(time * 2.6) * 0.05 + Math.min(Math.abs(v) * 0.003, 0.15);
      coreRef.current.scale.setScalar(corePulse);
    }

    // 5. MID WIREFRAME CAGE (Glowing Crimson Octahedron)
    if (midCageRef.current) {
      midCageRef.current.rotation.y -= delta * 0.22 + deltaScroll * 7.5;
      midCageRef.current.rotation.x += delta * 0.18 + deltaScroll * 5.5;
      const midScale =
        1 + Math.cos(time * 2.0) * 0.03 + Math.min(Math.abs(v) * 0.002, 0.08);
      midCageRef.current.scale.setScalar(midScale);
    }

    // 6. OUTER WIREFRAME CAGE (Titanium Obsidian Dodecahedron)
    if (outerCageRef.current) {
      outerCageRef.current.rotation.x -= delta * 0.14 + deltaScroll * 6.5;
      outerCageRef.current.rotation.z += delta * 0.16 + deltaScroll * 5.0;
      const outerScale =
        1 + Math.sin(time * 1.6) * 0.025 + Math.min(Math.abs(v) * 0.002, 0.06);
      outerCageRef.current.scale.setScalar(outerScale);
    }

    // 7. FLOATING TENSOR SHARDS (Dynamic 3D Multi-Orbital Swirl)
    shardsRef.current.forEach((shardMesh, idx) => {
      if (shardMesh) {
        const shard = tensorShards[idx];
        const shardAngle =
          shard.phase +
          time * shard.speed +
          p * Math.PI * 4.0 * Math.sign(shard.speed);
        const rad = shard.radius + Math.sin(time * 1.5 + idx * 0.9) * 0.07;
        shardMesh.position.x = Math.cos(shardAngle) * rad;
        shardMesh.position.z = Math.sin(shardAngle) * rad;
        shardMesh.position.y =
          shard.height +
          Math.sin(time * 1.8 + idx * 0.7) * 0.08 +
          Math.cos(p * Math.PI * 2.0 + idx) * 0.08;

        shardMesh.rotation.x += delta * 0.6 + Math.abs(deltaScroll) * 5.0;
        shardMesh.rotation.y += delta * 0.8 + Math.abs(deltaScroll) * 6.0;
      }
    });

    // 8. MASTER GROUP PARALLAX, ROTATION ON SCROLL & SECTION-TO-SECTION POSITION
    if (groupRef.current) {
      // Spatial positions driven by choreographed waypoints + ambient hover
      const targetPosX = wp.x * rightOffset + Math.cos(time * 0.6) * 0.05;
      const targetPosY =
        (isDesktop ? wp.y : wp.y - 0.75) + Math.sin(time * 0.8) * 0.06;
      const targetPosZ = wp.z;

      // Scale modulated by Section 03 size modifier
      const activeSizeMod = sizeScaleRef.current?.value ?? 1.0;
      const targetScale = baseScale * wp.scale * activeSizeMod;

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
        0.08
      );

      // Multi-axis rotation directly tied to scroll progress, scroll velocity, and mouse parallax
      const mouseTiltX = -(mousePos.current.y * Math.PI) / 12;
      const mouseTiltY = (mousePos.current.x * Math.PI) / 12;

      const targetRotX = wp.rotX + mouseTiltX + v * 0.0008;
      const targetRotY = wp.rotY + mouseTiltY + time * 0.08;
      const targetRotZ = wp.rotZ + Math.sin(p * Math.PI * 2.0) * 0.2;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.05
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotZ,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Reasoning Core: Faceted Icosahedron Compute Diamond */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.02, 0]} />
        <meshStandardMaterial
          color="#e63946"
          emissive="#e63946"
          emissiveIntensity={1.4}
          roughness={0.1}
          metalness={0.75}
        />
      </mesh>

      {/* Mid Octahedron Wireframe Cage: Crimson Glow */}
      <mesh ref={midCageRef}>
        <octahedronGeometry args={[1.62, 0]} />
        <meshStandardMaterial
          color="#e63946"
          wireframe
          emissive="#e63946"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Outer Dodecahedron Cage: Titanium Obsidian */}
      <mesh ref={outerCageRef}>
        <dodecahedronGeometry args={[2.14, 0]} />
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
          <torusGeometry args={[2.52, 0.046, 24, 160]} />
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
            position={[Math.cos(angle) * 2.52, Math.sin(angle) * 2.52, 0]}
          >
            <sphereGeometry args={[0.075, 16, 16]} />
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
            position={[Math.cos(angle) * 2.52, Math.sin(angle) * 2.52, 0]}
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
          <torusGeometry args={[2.15, 0.038, 20, 140]} />
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
            position={[Math.cos(angle) * 2.15, Math.sin(angle) * 2.15, 0]}
          >
            <sphereGeometry args={[0.065, 16, 16]} />
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
          <torusGeometry args={[1.78, 0.03, 18, 120]} />
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
    </group>
  );
}

// ============================================================================
// MASTER SPATIAL WORLD CHOREOGRAPHER
// ============================================================================
function SynergisticWorld({
  scrollState,
  sizeScaleRef,
}: {
  scrollState: ScrollStateRef;
  sizeScaleRef: SizeScaleRef;
}) {
  return (
    <>
      {/* Balanced, crisp cinematic lights for high contrast, deep saturation, and zero washout */}
      <ambientLight intensity={1.1} />
      <directionalLight position={[6, 7, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-6, -4, -4]} intensity={1.2} color="#ffffff" />
      <pointLight position={[-4, -3, 4]} intensity={2.0} color="#e63946" />
      <pointLight position={[4, 3, 3]} intensity={1.6} color="#ffffff" />

      {/* UNIFIED SIGNATURE 3D FIGURE: NEURAL TENSOR HYPER-LATTICE */}
      <TensorHyperLattice
        scrollState={scrollState}
        sizeScaleRef={sizeScaleRef}
      />
    </>
  );
}

// ============================================================================
// EXPORTED UNIFIED CANVAS COMPONENT
// ============================================================================
export function UnifiedAISpatialCanvas() {
  const scrollState = useRef<ScrollState>({ progress: 0, velocity: 0 });
  const sizeScaleRef = useRef<{ value: number }>({ value: 1.0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isLenisManaged = useRef(false);

  // High-precision Lenis scroll synchronization (primary driver)
  useLenis((lenis) => {
    isLenisManaged.current = true;
    scrollState.current.progress = lenis.progress;
    scrollState.current.velocity = lenis.velocity;
  });

  // Zero-dependency native window fallback (only active if Lenis is not driving)
  useEffect(() => {
    const handleScroll = () => {
      if (isLenisManaged.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0) {
        scrollState.current.progress = window.scrollY / max;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section-aware choreographed transitions:
  // - Hero & Landing: Right (x: 1.0), scale: 0.9, clear
  // - Section [01] (About): Right (x: 1.0), scale: 0.6, clear
  // - Section [02] (Skills): Right (x: 1.05), scale: 0.7, blur 7px, opacity 0.5
  // - Section [03] (Projects): Left (x: -0.9), scale: 0.1, blur 7px, opacity 0.5
  // - Section [04] (Writing): Right (x: 0.88), scale: 0.9, blur 7px, opacity 0.8
  // - Section [05] (Contact): Left (x: -0.92), scale: 0.7, blur 7px, opacity 0.8
  useGSAP(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Sections 02 (Skills) & 03 (Projects): scale 0.7 / 0.1, blur 7px, opacity 0.5
    const applyBlurred0203State = () => {
      gsap.to(wrapper, {
        filter: "blur(7px)",
        opacity: 0.5,
        duration: 0.55,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    // Section 04 (Writing): scale 0.9, blur 7px, opacity 0.8
    const applyWritingState = () => {
      gsap.to(wrapper, {
        filter: "blur(7px)",
        opacity: 0.8,
        duration: 0.55,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    // Section 05 (Contact): scale 0.7, blur 7px, opacity 0.8
    const applyContactState = () => {
      gsap.to(wrapper, {
        filter: "blur(7px)",
        opacity: 0.8,
        duration: 0.55,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    // Clear view without blur: Hero (scale 0.9), Section 01 (scale 0.6)
    const applyClearState = () => {
      gsap.to(wrapper, {
        filter: "none",
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    // Global ScrollTriggers attached directly to page sections
    const stSkills = ScrollTrigger.create({
      trigger: "#skills",
      start: "top 65%",
      end: "bottom 65%",
      onEnter: applyBlurred0203State,
      onLeave: applyBlurred0203State,
      onEnterBack: applyBlurred0203State,
      onLeaveBack: applyClearState,
    });

    const stProjects = ScrollTrigger.create({
      trigger: "#projects",
      start: "top 65%",
      end: "bottom 35%",
      onEnter: applyBlurred0203State,
      onLeave: applyWritingState,
      onEnterBack: applyBlurred0203State,
      onLeaveBack: applyBlurred0203State,
    });

    const stWriting = ScrollTrigger.create({
      trigger: "#writing",
      start: "top 65%",
      end: "bottom 65%",
      onEnter: applyWritingState,
      onLeave: applyContactState,
      onEnterBack: applyWritingState,
      onLeaveBack: applyBlurred0203State,
    });

    const stContact = ScrollTrigger.create({
      trigger: "#contact",
      start: "top 65%",
      end: "bottom bottom",
      onEnter: applyContactState,
      onEnterBack: applyContactState,
      onLeaveBack: applyWritingState,
    });

    // Immediate state synchronization on mount / deep-link navigation
    const syncInitialState = () => {
      const winH = window.innerHeight;
      const contactEl = document.getElementById("contact");
      const writingEl = document.getElementById("writing");
      const projectsEl = document.getElementById("projects");
      const skillsEl = document.getElementById("skills");

      if (contactEl) {
        const cRect = contactEl.getBoundingClientRect();
        if (cRect.top < winH * 0.65 && cRect.bottom > 0) {
          gsap.set(wrapper, { filter: "blur(7px)", opacity: 0.8 });
          return;
        }
      }

      if (writingEl) {
        const wRect = writingEl.getBoundingClientRect();
        if (wRect.top < winH * 0.65 && wRect.bottom > 0) {
          gsap.set(wrapper, { filter: "blur(7px)", opacity: 0.8 });
          return;
        }
      }

      if (projectsEl) {
        const pRect = projectsEl.getBoundingClientRect();
        if (pRect.top < winH * 0.65 && pRect.bottom > winH * 0.35) {
          gsap.set(wrapper, { filter: "blur(7px)", opacity: 0.5 });
          return;
        }
      }

      if (skillsEl) {
        const sRect = skillsEl.getBoundingClientRect();
        if (sRect.top < winH * 0.65 && sRect.bottom > winH * 0.35) {
          gsap.set(wrapper, { filter: "blur(7px)", opacity: 0.5 });
          return;
        }
      }

      // Default: Hero, About [01]
      gsap.set(wrapper, { filter: "none", opacity: 1 });
    };

    syncInitialState();
    ScrollTrigger.refresh();

    return () => {
      stSkills.kill();
      stProjects.kill();
      stWriting.kill();
      stContact.kill();
    };
  });

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden"
      style={{
        filter: "none",
        opacity: 1,
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <SynergisticWorld
          scrollState={scrollState}
          sizeScaleRef={sizeScaleRef}
        />
      </Canvas>
    </div>
  );
}
