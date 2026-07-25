"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AmbientBackgroundCanvasProps {
  color?: string;
}

function FloatingSunnyBokeh({ color = "#fbbf24", count = 220 }: { color?: string; count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const goldColor = new THREE.Color(color);
    const orangeColor = new THREE.Color("#fb923c");
    const cyanColor = new THREE.Color("#38bdf8");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const active = i % 4 === 0 ? cyanColor : i % 2 === 0 ? orangeColor : goldColor;
      col[i * 3] = active.r;
      col[i * 3 + 1] = active.g;
      col[i * 3 + 2] = active.b;
    }
    return [pos, col];
  }, [count, color]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Gentle solar dust drift upward
      pointsRef.current.rotation.y += delta * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.04;

      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += delta * 0.15; // Slow upward float
        if (positions[i] > 7) {
          positions[i] = -7;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

export default function AmbientBackgroundCanvas({ color = "#fbbf24" }: AmbientBackgroundCanvasProps) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none aria-hidden:true overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} color={color} />
        <FloatingSunnyBokeh color={color} />
      </Canvas>
    </div>
  );
}
