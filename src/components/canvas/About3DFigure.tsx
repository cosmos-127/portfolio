"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

interface NodeData {
  name: string;
  pos: [number, number, number];
  role: string;
  color: string;
  emissive: string;
  size: number;
}

const GRAPH_NODES: NodeData[] = [
  { name: "Orchestrator", pos: [0, 0, 0], role: "LangGraph", color: "#e63946", emissive: "#e63946", size: 0.38 },
  { name: "GraphRAG", pos: [1.7, 1.1, 0.5], role: "Retrieval", color: "#e63946", emissive: "#e63946", size: 0.16 },
  { name: "MCP Server", pos: [-1.6, 1.3, -0.6], role: "Tool Protocol", color: "#0ea5e9", emissive: "#0ea5e9", size: 0.15 },
  { name: "vLLM", pos: [1.8, -1.1, -0.7], role: "Inference Engine", color: "#e63946", emissive: "#e63946", size: 0.16 },
  { name: "Trino", pos: [-1.7, -1.2, 0.8], role: "Federated Query", color: "#64748b", emissive: "#475569", size: 0.14 },
  { name: "ReWOO", pos: [0.5, 2.1, 0.3], role: "Planner Agent", color: "#e63946", emissive: "#e63946", size: 0.15 },
  { name: "ReAct", pos: [-0.4, -2.1, -0.5], role: "Execution Agent", color: "#0ea5e9", emissive: "#0ea5e9", size: 0.15 },
  { name: "Vector Store", pos: [2.2, 0.3, -1.0], role: "Embeddings", color: "#64748b", emissive: "#475569", size: 0.14 },
  { name: "Neo4j", pos: [-2.3, 0.2, 0.7], role: "Knowledge Graph", color: "#e63946", emissive: "#e63946", size: 0.17 },
  { name: "Schema", pos: [1.1, 1.7, -1.1], role: "Graph Ontology", color: "#64748b", emissive: "#475569", size: 0.13 },
  { name: "Data Silo", pos: [-1.2, -1.7, -1.0], role: "Federated Lake", color: "#475569", emissive: "#334155", size: 0.13 },
  { name: "LLM Eval", pos: [2.0, -0.4, 1.2], role: "Guardrails", color: "#e63946", emissive: "#e63946", size: 0.14 },
];

// Explicit Graph Edges (Connecting related nodes in the knowledge graph)
const GRAPH_EDGES: [number, number][] = [
  [0, 1], // Orchestrator -> GraphRAG
  [0, 2], // Orchestrator -> MCP Server
  [0, 3], // Orchestrator -> vLLM
  [0, 4], // Orchestrator -> Trino
  [0, 5], // Orchestrator -> ReWOO
  [0, 6], // Orchestrator -> ReAct
  [1, 7], // GraphRAG -> Vector Store
  [1, 8], // GraphRAG -> Neo4j
  [1, 9], // GraphRAG -> Schema
  [2, 5], // MCP -> ReWOO
  [2, 6], // MCP -> ReAct
  [2, 8], // MCP -> Neo4j
  [3, 7], // vLLM -> Vector Store
  [3, 11], // vLLM -> LLM Eval
  [4, 10], // Trino -> Data Silo
  [4, 6], // Trino -> ReAct
  [5, 9], // ReWOO -> Schema
  [7, 11], // Vector Store -> LLM Eval
  [8, 10], // Neo4j -> Data Silo
];

function KnowledgeGraphScene() {
  const { viewport } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const datumRingRef = useRef<THREE.Group>(null);
  const packetsRef = useRef<(THREE.Mesh | null)[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mousePos.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const baseScale = viewport.width > 7 ? 1.05 : 0.82;

  // Compute line positions buffer
  const linePositions = useMemo(() => {
    const points: number[] = [];
    GRAPH_EDGES.forEach(([startIdx, endIdx]) => {
      const start = GRAPH_NODES[startIdx]?.pos;
      const end = GRAPH_NODES[endIdx]?.pos;
      if (start && end) {
        points.push(...start, ...end);
      }
    });
    return new Float32Array(points);
  }, []);

  // Traveling Data Packets along selected edges
  const packetPaths = useMemo(
    () => [
      { edge: [0, 1], speed: 0.65, offset: 0 },
      { edge: [1, 8], speed: 0.5, offset: 0.3 },
      { edge: [0, 2], speed: 0.7, offset: 0.6 },
      { edge: [2, 6], speed: 0.55, offset: 0.2 },
      { edge: [0, 3], speed: 0.8, offset: 0.4 },
      { edge: [3, 11], speed: 0.6, offset: 0.8 },
      { edge: [4, 10], speed: 0.45, offset: 0.5 },
      { edge: [0, 5], speed: 0.6, offset: 0.1 },
    ],
    []
  );

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Slow organic graph tumble
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.14;
      groupRef.current.rotation.x += delta * 0.05;

      // Mouse parallax tilt
      const targetRotX = -(mousePos.current.y * Math.PI) / 10;
      const targetRotY = (mousePos.current.x * Math.PI) / 10;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY + time * 0.04,
        0.05
      );
    }

    // Core pulsing diamond
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 0.4;
      coreRef.current.rotation.y += delta * 0.55;
      const corePulse = 1 + Math.sin(time * 2.6) * 0.06;
      coreRef.current.scale.setScalar(corePulse);
    }

    // Datum ring counter-rotation
    if (datumRingRef.current) {
      datumRingRef.current.rotation.z -= delta * 0.2;
    }

    // Move data packets along their assigned graph edges
    packetPaths.forEach((packet, idx) => {
      const mesh = packetsRef.current[idx];
      if (mesh) {
        const start = GRAPH_NODES[packet.edge[0]].pos;
        const end = GRAPH_NODES[packet.edge[1]].pos;
        const t = (time * packet.speed + packet.offset) % 1;
        mesh.position.x = THREE.MathUtils.lerp(start[0], end[0], t);
        mesh.position.y = THREE.MathUtils.lerp(start[1], end[1], t);
        mesh.position.z = THREE.MathUtils.lerp(start[2], end[2], t);
      }
    });
  });

  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.35}>
      <group ref={groupRef} scale={[baseScale, baseScale, baseScale]}>
        {/* Lights designed for high-contrast crisp visibility */}
        <ambientLight intensity={1.8} />
        <directionalLight position={[6, 8, 6]} intensity={3.0} />
        <directionalLight position={[-6, -4, -4]} intensity={1.4} color="#ffffff" />
        <pointLight position={[-5, -4, 4]} intensity={2.8} color="#e63946" />
        <pointLight position={[5, 4, 3]} intensity={2.0} color="#0ea5e9" />

        {/* 1. KNOWLEDGE GRAPH EDGES (High-contrast glowing crimson lines) */}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#e63946" transparent opacity={0.45} />
        </lineSegments>

        {/* 2. CENTRAL ORCHESTRATOR NODE (LangGraph Core - Faceted Diamond) */}
        <mesh ref={coreRef} position={[0, 0, 0]}>
          <octahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            color="#e63946"
            emissive="#e63946"
            emissiveIntensity={1.4}
            roughness={0.12}
            metalness={0.8}
          />
        </mesh>

        {/* Inner wireframe aura for orchestrator */}
        <mesh position={[0, 0, 0]}>
          <icosahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial
            color="#e63946"
            wireframe
            emissive="#e63946"
            emissiveIntensity={0.8}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* 3. GRAPH NODES (Knowledge Graph entities, agents, tools, databases) */}
        {GRAPH_NODES.map((node, idx) => {
          if (idx === 0) return null; // Orchestrator rendered separately
          return (
            <group key={idx} position={node.pos}>
              {/* Solid core sphere */}
              <mesh>
                <sphereGeometry args={[node.size, 20, 20]} />
                <meshStandardMaterial
                  color={node.color}
                  emissive={node.emissive}
                  emissiveIntensity={0.9}
                  roughness={0.15}
                  metalness={0.7}
                />
              </mesh>
              {/* Outer halo ring */}
              <mesh>
                <torusGeometry args={[node.size * 1.45, 0.015, 12, 36]} />
                <meshStandardMaterial
                  color={node.color}
                  emissive={node.emissive}
                  emissiveIntensity={0.6}
                  transparent
                  opacity={0.75}
                />
              </mesh>
            </group>
          );
        })}

        {/* 4. TRAVELING DATA PULSE PACKETS */}
        {packetPaths.map((_, idx) => (
          <mesh
            key={idx}
            ref={(el) => {
              packetsRef.current[idx] = el;
            }}
          >
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#e63946"
              emissiveIntensity={2.5}
            />
          </mesh>
        ))}

        {/* 5. DATUM TELEMETRY RING (Aviation / Blueprint style coordinate equator) */}
        <group ref={datumRingRef} rotation={[Math.PI / 4, 0, 0]}>
          <mesh>
            <torusGeometry args={[2.55, 0.024, 16, 120]} />
            <meshStandardMaterial
              color="#94a3b8"
              emissive="#475569"
              emissiveIntensity={0.4}
              roughness={0.2}
              metalness={0.8}
              transparent
              opacity={0.6}
            />
          </mesh>
          {/* Tick markers */}
          {[0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3].map((angle, i) => (
            <mesh key={i} position={[Math.cos(angle) * 2.55, Math.sin(angle) * 2.55, 0]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial
                color="#e63946"
                emissive="#e63946"
                emissiveIntensity={1.5}
              />
            </mesh>
          ))}
        </group>

        {/* 6. HIGH-DIMENSIONAL TOKEN SPARKLES */}
        <Sparkles count={55} scale={[9, 9, 7]} size={2.0} speed={0.22} opacity={0.6} color="#e63946" />
        <Sparkles count={50} scale={[11, 11, 9]} size={1.4} speed={0.16} opacity={0.4} color="#0ea5e9" />
      </group>
    </Float>
  );
}

export function About3DFigure() {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <KnowledgeGraphScene />
      </Canvas>
    </div>
  );
}
