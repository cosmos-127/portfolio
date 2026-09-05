"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

function KnowledgeLattice() {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const outerCageRef = useRef<THREE.Mesh>(null);
  const midCageRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const isDesktop = viewport.width > 9;
  const offsetX = isDesktop ? viewport.width * 0.18 : 0;
  const baseScale = isDesktop ? 1.55 : 1.05;

  // Connected knowledge graph nodes
  const nodes = useMemo(() => [
    { pos: [2.1, 1.3, 0.9] as const, size: 0.13, color: "#e63946" },
    { pos: [-1.9, 1.5, -1.0] as const, size: 0.11, color: "#2b2d42" },
    { pos: [2.2, -1.4, -0.7] as const, size: 0.12, color: "#e63946" },
    { pos: [-2.0, -1.3, 1.2] as const, size: 0.1, color: "#495057" },
    { pos: [0, 2.5, 0.6] as const, size: 0.14, color: "#e63946" },
    { pos: [0, -2.4, -0.8] as const, size: 0.11, color: "#2b2d42" },
    { pos: [2.6, 0.3, -1.3] as const, size: 0.11, color: "#e63946" },
    { pos: [-2.7, 0.4, 1.0] as const, size: 0.12, color: "#495057" },
  ], []);

  useFrame((state, delta) => {
    // Rotations
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.35;
      coreRef.current.rotation.y += delta * 0.45;
    }
    if (outerCageRef.current) {
      outerCageRef.current.rotation.x -= delta * 0.18;
      outerCageRef.current.rotation.z += delta * 0.22;
    }
    if (midCageRef.current) {
      midCageRef.current.rotation.y -= delta * 0.3;
      midCageRef.current.rotation.x += delta * 0.25;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x -= delta * 0.2;
    }

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
    <Float speed={1.7} rotationIntensity={0.25} floatIntensity={0.4}>
      <group
        ref={groupRef}
        position={[offsetX, 0, 0]}
        scale={[baseScale, baseScale, baseScale]}
      >
        {/* Cinematic Lights */}
        <ambientLight intensity={1.2} />
        <directionalLight position={[6, 7, 5]} intensity={2.2} />
        <pointLight position={[-4, -3, 3]} intensity={2.0} color="#e63946" />
        <pointLight position={[4, 5, -2]} intensity={1.5} color="#ffffff" />

        {/* Central Reasoning Core: Icosahedron with glowing material */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.0, 0]} />
          <meshStandardMaterial
            color="#e63946"
            emissive="#e63946"
            emissiveIntensity={0.6}
            roughness={0.15}
            metalness={0.6}
          />
        </mesh>

        {/* Mid Octahedron Wireframe Cage */}
        <mesh ref={midCageRef}>
          <octahedronGeometry args={[1.65, 0]} />
          <meshStandardMaterial
            color="#e63946"
            wireframe
            emissive="#e63946"
            emissiveIntensity={0.4}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* Outer Knowledge Cage (Wireframe Dodecahedron) */}
        <mesh ref={outerCageRef}>
          <dodecahedronGeometry args={[2.2, 0]} />
          <meshStandardMaterial
            color="#343a40"
            wireframe
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Equatorial Orbit Ring 1 */}
        <mesh ref={ring1Ref} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
          <torusGeometry args={[3.1, 0.018, 16, 140]} />
          <meshStandardMaterial
            color="#e63946"
            emissive="#e63946"
            emissiveIntensity={0.65}
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Orbit Ring 2 (Tilted) */}
        <mesh ref={ring2Ref} rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
          <torusGeometry args={[2.5, 0.015, 16, 120]} />
          <meshStandardMaterial
            color="#d1d5db"
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Knowledge Graph Nodes */}
        {nodes.map((node, i) => (
          <mesh key={i} position={node.pos}>
            <sphereGeometry args={[node.size, 16, 16]} />
            <meshStandardMaterial
              color={node.color}
              emissive={node.color === "#e63946" ? "#e63946" : "#2b2d42"}
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        ))}

        {/* Ambient Floating Sparkles */}
        <Sparkles
          count={85}
          scale={9}
          size={2.0}
          speed={0.22}
          opacity={0.55}
          color="#e63946"
        />
        <Sparkles
          count={95}
          scale={12}
          size={1.3}
          speed={0.14}
          opacity={0.35}
          color="#1a1a1a"
        />
      </group>
    </Float>
  );
}

export function TensorCore() {
  return (
    <div className="w-full h-full absolute inset-0 select-none">
      <Canvas
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <KnowledgeLattice />
      </Canvas>
    </div>
  );
}
