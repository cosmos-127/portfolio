"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Float } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

function AttentionRings() {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Responsive position & scale: on larger screens, offset slightly right so it sweeps behind text
  const isDesktop = viewport.width > 9;
  const targetX = isDesktop ? viewport.width * 0.16 : 0;
  const targetY = isDesktop ? 0 : 0.2;
  const baseScale = isDesktop ? 1.35 : 0.95;

  // Orbiting satellite subagents
  const satellites = useMemo(() => [
    { radius: 2.7, speed: 0.6, phase: 0, size: 0.07, color: "#e63946" },
    { radius: 3.4, speed: -0.4, phase: Math.PI / 3, size: 0.06, color: "#2b2d42" },
    { radius: 2.1, speed: 0.8, phase: Math.PI, size: 0.05, color: "#e63946" },
    { radius: 3.8, speed: -0.3, phase: (4 * Math.PI) / 3, size: 0.08, color: "#ffffff" },
  ], []);

  const satelliteRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state, delta) => {
    // Continuous rotation of the attention layers
    if (ring1Ref.current) ring1Ref.current.rotation.z -= delta * 0.14;
    if (ring2Ref.current) ring2Ref.current.rotation.x += delta * 0.2;
    if (ring3Ref.current) ring3Ref.current.rotation.y += delta * 0.28;

    // Core gentle breathing
    if (coreRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      coreRef.current.scale.set(s, s, s);
    }

    // Orbiting subagent satellites
    satellites.forEach((sat, i) => {
      const mesh = satelliteRefs.current[i];
      if (mesh) {
        const t = state.clock.elapsedTime * sat.speed + sat.phase;
        mesh.position.x = Math.cos(t) * sat.radius;
        mesh.position.y = Math.sin(t) * (sat.radius * 0.6);
        mesh.position.z = Math.sin(t * 1.2) * (sat.radius * 0.5);
      }
    });

    // Global window-aware mouse tilt
    if (groupRef.current) {
      const mouseX = (mousePos.current.x * Math.PI) / 8;
      const mouseY = (mousePos.current.y * Math.PI) / 8;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -mouseY,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mouseX,
        0.05
      );
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.18} floatIntensity={0.35}>
      <group
        ref={groupRef}
        position={[targetX, targetY, 0]}
        scale={[baseScale, baseScale, baseScale]}
      >
        {/* Cinematic Lighting */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 8, 5]} intensity={2.2} />
        <pointLight position={[-4, -3, 3]} intensity={1.8} color="#e63946" />
        <pointLight position={[5, -2, -2]} intensity={1.2} color="#ffffff" />

        {/* Central Glowing Token Nucleus */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.32, 32, 32]} />
          <meshStandardMaterial
            color="#e63946"
            emissive="#e63946"
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>

        {/* Ring 1 (Outer Embedding / Layer 0): Expansive silver-white with glowing red aura */}
        <mesh ref={ring1Ref} rotation={[0, 0, 0]}>
          <torusGeometry args={[3.2, 0.026, 24, 160]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        {/* Glow rim for Ring 1 */}
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[3.22, 0.01, 16, 160]} />
          <meshStandardMaterial
            color="#e63946"
            emissive="#e63946"
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Ring 2 (Middle - Attention Core): Tilted 45°, industrial steel */}
        <mesh ref={ring2Ref} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[2.3, 0.03, 24, 140]} />
          <meshStandardMaterial
            color="#343a40"
            roughness={0.15}
            metalness={0.95}
          />
        </mesh>

        {/* Ring 3 (Inner - Reasoning & Output): Tilted 90°, Crimson #E63946 */}
        <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.45, 0.038, 24, 120]} />
          <meshStandardMaterial
            color="#e63946"
            roughness={0.1}
            metalness={0.4}
            emissive="#e63946"
            emissiveIntensity={0.65}
          />
        </mesh>

        {/* Agentic Orbiting Subagents */}
        <group ref={orbitGroupRef}>
          {satellites.map((sat, i) => (
            <mesh
              key={i}
              ref={(el) => {
                if (el) satelliteRefs.current[i] = el;
              }}
            >
              <sphereGeometry args={[sat.size, 16, 16]} />
              <meshStandardMaterial
                color={sat.color}
                emissive={sat.color === "#e63946" ? "#e63946" : "#ffffff"}
                emissiveIntensity={0.6}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
          ))}
        </group>

        {/* Atmospheric Floating Token Sparkles (Expansive depth) */}
        <Sparkles
          count={80}
          scale={9}
          size={2.2}
          speed={0.25}
          opacity={0.6}
          color="#e63946"
        />
        <Sparkles
          count={100}
          scale={12}
          size={1.4}
          speed={0.15}
          opacity={0.4}
          color="#1a1a1a"
        />
      </group>
    </Float>
  );
}

export function HeroRings() {
  return (
    <div className="w-full h-full absolute inset-0 select-none">
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <AttentionRings />
      </Canvas>
    </div>
  );
}
