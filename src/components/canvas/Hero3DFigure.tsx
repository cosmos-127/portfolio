"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

function NeuralTensorScene() {
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

  // Floating Quantized FP16 / INT4 Tensor Shards with dedicated orbital trajectory parameters
  const tensorShards = useMemo(
    () => [
      { radius: 1.55, height: 0.85, speed: 0.35, phase: 0, size: 0.16, color: "#e63946" },
      { radius: 1.45, height: 0.95, speed: -0.28, phase: 1.2, size: 0.14, color: "#1e293b" },
      { radius: 1.62, height: -0.8, speed: 0.32, phase: 2.4, size: 0.17, color: "#e63946" },
      { radius: 1.5, height: -0.9, speed: -0.3, phase: 3.6, size: 0.13, color: "#334155" },
      { radius: 1.25, height: 1.45, speed: 0.4, phase: 4.8, size: 0.16, color: "#e63946" },
      { radius: 1.3, height: -1.4, speed: -0.35, phase: 0.7, size: 0.15, color: "#1e293b" },
      { radius: 1.7, height: 0.2, speed: 0.25, phase: 2.1, size: 0.14, color: "#e63946" },
      { radius: 1.65, height: -0.2, speed: -0.26, phase: 4.2, size: 0.15, color: "#475569" },
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

  const baseScale = viewport.width > 7 ? 1.08 : 0.82;

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // 1. Gimbal rotations
    if (ring1GroupRef.current) {
      ring1GroupRef.current.rotation.z += delta * 0.24;
      ring1GroupRef.current.rotation.x = Math.PI / 3 + Math.sin(time * 0.5) * 0.15;
    }
    if (ring2GroupRef.current) {
      ring2GroupRef.current.rotation.x -= delta * 0.28;
      ring2GroupRef.current.rotation.y = -Math.PI / 4 + Math.cos(time * 0.45) * 0.18;
    }
    if (ring3GroupRef.current) {
      ring3GroupRef.current.rotation.y += delta * 0.35;
      ring3GroupRef.current.rotation.z = Math.PI / 4 + Math.sin(time * 0.6) * 0.12;
    }

    // 2. Central Compute Diamond Breathing & Multi-axis tumble
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.35;
      coreRef.current.rotation.y += delta * 0.5;
      const corePulse = 1 + Math.sin(time * 2.4) * 0.05;
      coreRef.current.scale.setScalar(corePulse);
    }

    // 3. Mid Wireframe Cage
    if (midCageRef.current) {
      midCageRef.current.rotation.y -= delta * 0.22;
      midCageRef.current.rotation.x += delta * 0.18;
    }

    // 4. Outer Dodecahedron Cage
    if (outerCageRef.current) {
      outerCageRef.current.rotation.x -= delta * 0.14;
      outerCageRef.current.rotation.z += delta * 0.16;
    }

    // 5. Floating Tensor Shards Orbit
    shardsRef.current.forEach((shardMesh, idx) => {
      if (shardMesh) {
        const shard = tensorShards[idx];
        const angle = shard.phase + time * shard.speed;
        const rad = shard.radius + Math.sin(time * 1.5 + idx) * 0.06;
        shardMesh.position.x = Math.cos(angle) * rad;
        shardMesh.position.z = Math.sin(angle) * rad;
        shardMesh.position.y = shard.height + Math.sin(time * 1.8 + idx * 0.7) * 0.08;
        shardMesh.rotation.x += delta * 0.6;
        shardMesh.rotation.y += delta * 0.8;
      }
    });

    // 6. Smooth Mouse Parallax Tilt
    if (groupRef.current) {
      const targetRotX = -(mousePos.current.y * Math.PI) / 10;
      const targetRotY = (mousePos.current.x * Math.PI) / 10;
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
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.35}>
      <group ref={groupRef} scale={[baseScale, baseScale, baseScale]}>
        {/* Lights designed for high-contrast visibility on light editorial backgrounds */}
        <ambientLight intensity={1.8} />
        <directionalLight position={[6, 8, 6]} intensity={3.2} />
        <directionalLight position={[-6, -4, -4]} intensity={1.6} color="#ffffff" />
        <pointLight position={[-5, -4, 4]} intensity={3.0} color="#e63946" />
        <pointLight position={[5, 4, 3]} intensity={2.2} color="#ffffff" />

        {/* Central Reasoning Core: Faceted Icosahedron Compute Diamond */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.92, 0]} />
          <meshStandardMaterial
            color="#e63946"
            emissive="#e63946"
            emissiveIntensity={1.2}
            roughness={0.12}
            metalness={0.7}
          />
        </mesh>

        {/* Mid Octahedron Wireframe Cage: Crimson Glow */}
        <mesh ref={midCageRef}>
          <octahedronGeometry args={[1.52, 0]} />
          <meshStandardMaterial
            color="#e63946"
            wireframe
            emissive="#e63946"
            emissiveIntensity={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Outer Dodecahedron Cage: Titanium Obsidian */}
        <mesh ref={outerCageRef}>
          <dodecahedronGeometry args={[2.02, 0]} />
          <meshStandardMaterial
            color="#1e293b"
            wireframe
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.7}
          />
        </mesh>

        {/* 1. OUTER GYROSCOPIC GIMBAL RING (Crimson Halo + Orbit Nodes) */}
        <group ref={ring1GroupRef} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
          <mesh>
            <torusGeometry args={[2.42, 0.038, 24, 160]} />
            <meshStandardMaterial
              color="#e63946"
              emissive="#e63946"
              emissiveIntensity={0.85}
              roughness={0.15}
              metalness={0.8}
            />
          </mesh>
          {/* Orbital energy nodes */}
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 2.42, Math.sin(angle) * 2.42, 0]}
            >
              <sphereGeometry args={[0.065, 16, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#e63946"
                emissiveIntensity={2.8}
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
              position={[Math.cos(angle) * 2.42, Math.sin(angle) * 2.42, 0]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.09, 0.02, 0.02]} />
              <meshStandardMaterial
                color="#e63946"
                emissive="#e63946"
                emissiveIntensity={1.4}
              />
            </mesh>
          ))}
        </group>

        {/* 2. SECONDARY GYROSCOPIC GIMBAL RING (Slate Titanium) */}
        <group ref={ring2GroupRef} rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
          <mesh>
            <torusGeometry args={[2.06, 0.032, 20, 140]} />
            <meshStandardMaterial
              color="#94a3b8"
              emissive="#475569"
              emissiveIntensity={0.5}
              roughness={0.2}
              metalness={0.85}
            />
          </mesh>
          {/* Counter nodes */}
          {[Math.PI / 4, (5 * Math.PI) / 4].map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 2.06, Math.sin(angle) * 2.06, 0]}
            >
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#94a3b8"
                emissiveIntensity={2.0}
              />
            </mesh>
          ))}
        </group>

        {/* 3. INNER ACCENT ORBIT GIMBAL (Crimson Polar Orbit) */}
        <group ref={ring3GroupRef} rotation={[-Math.PI / 4, 0, Math.PI / 3]}>
          <mesh>
            <torusGeometry args={[1.72, 0.026, 18, 120]} />
            <meshStandardMaterial
              color="#e63946"
              emissive="#e63946"
              emissiveIntensity={0.7}
              roughness={0.18}
              metalness={0.8}
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
              emissiveIntensity={0.8}
              roughness={0.18}
              metalness={0.8}
            />
          </mesh>
        ))}

        {/* High-Dimensional Token Sparkles */}
        <Sparkles count={50} scale={[10, 10, 8]} size={2.2} speed={0.25} opacity={0.65} color="#e63946" />
        <Sparkles count={60} scale={[12, 12, 10]} size={1.5} speed={0.18} opacity={0.45} color="#1e293b" />
      </group>
    </Float>
  );
}

export function Hero3DFigure() {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <NeuralTensorScene />
      </Canvas>
    </div>
  );
}
