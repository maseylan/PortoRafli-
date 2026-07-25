"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function FloatingPolyhedra() {
  const meshRef1 = useRef<THREE.Mesh>(null);
  const meshRef2 = useRef<THREE.Mesh>(null);
  const meshRef3 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef1.current) {
      meshRef1.current.rotation.x += delta * 0.05;
      meshRef1.current.rotation.y += delta * 0.08;
    }
    if (meshRef2.current) {
      meshRef2.current.rotation.x -= delta * 0.06;
      meshRef2.current.rotation.z += delta * 0.05;
    }
    if (meshRef3.current) {
      meshRef3.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group>
      {/* Central Calm Floating Glass Icosahedron */}
      <Float speed={1} rotationIntensity={0.4} floatIntensity={0.5}>
        <mesh ref={meshRef1} position={[2.5, 1, -2]}>
          <icosahedronGeometry args={[1.4, 0]} />
          <meshPhysicalMaterial
            roughness={0.2}
            metalness={0.1}
            transmission={0.9}
            thickness={1}
            color="#3b82f6"
            transparent
            opacity={0.5}
            wireframe
          />
        </mesh>
      </Float>

      {/* Secondary Torus Knot (Calm Glass Material, No Wobble/Flashing) */}
      <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.6}>
        <mesh ref={meshRef2} position={[-2.8, -1.2, -3]}>
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
          <meshStandardMaterial
            color="#1d4ed8"
            roughness={0.3}
            metalness={0.5}
            wireframe
            transparent
            opacity={0.35}
          />
        </mesh>
      </Float>

      {/* Octahedron Accent */}
      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.4}>
        <mesh ref={meshRef3} position={[0, -2.5, -4]}>
          <octahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial
            color="#475569"
            roughness={0.4}
            metalness={0.6}
            wireframe
            transparent
            opacity={0.3}
          />
        </mesh>
      </Float>
    </group>
  );
}

function ParticleConstellation({ count = 220 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorBlue = new THREE.Color("#3b82f6");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;

      col[i * 3] = colorBlue.r;
      col[i * 3 + 1] = colorBlue.g;
      col[i * 3 + 2] = colorBlue.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  );
}

export default function HeroCanvas3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none aria-hidden:true">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#1d4ed8" />
        
        <FloatingPolyhedra />
        <ParticleConstellation />
      </Canvas>
    </div>
  );
}
