"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";

type FloatingShapeProps = {
  position: [number, number, number];
  color: string;
  speed: number;
  phase: number;
  metalness?: number;
  roughness?: number;
  children: React.ReactNode;
};

function FloatingShape({ position, color, speed, phase, metalness = 0.6, roughness = 0.25, children }: FloatingShapeProps) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.getElapsedTime();
    mesh.position.y = position[1] + Math.sin(t * speed + phase) * 0.35;
    mesh.rotation.x = t * speed * 0.3 + phase;
    mesh.rotation.y = t * speed * 0.4 + phase;
  });

  return (
    <mesh ref={ref} position={position}>
      {children}
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 3]} intensity={1.4} color="#fbbf24" />
      <pointLight position={[-4, -2, -3]} intensity={25} color="#6366f1" />

      <FloatingShape position={[-1.4, 0.6, 0]} color="#818cf8" speed={0.6} phase={0}>
        <icosahedronGeometry args={[0.85, 0]} />
      </FloatingShape>
      <FloatingShape position={[1.5, -0.4, -1]} color="#fbbf24" speed={0.8} phase={2} metalness={0.8} roughness={0.15}>
        <torusKnotGeometry args={[0.55, 0.18, 128, 16]} />
      </FloatingShape>
      <FloatingShape position={[0.2, 1.4, -2]} color="#e2e8f0" speed={0.5} phase={4} metalness={0.3} roughness={0.4}>
        <sphereGeometry args={[0.5, 32, 32]} />
      </FloatingShape>
      <FloatingShape position={[-1.2, -1.3, -1.5]} color="#4f46e5" speed={0.7} phase={1} metalness={0.7} roughness={0.2}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
      </FloatingShape>
    </>
  );
}

export function LoginScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} className="h-full w-full">
      <Scene />
    </Canvas>
  );
}
