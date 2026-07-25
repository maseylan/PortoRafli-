"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const SKILLS = [
  "TypeScript", "React", "Next.js", "Express.js",
  "PostgreSQL", "MERN Stack", "Python", "Playwright",
  "Pytest", "Selenium", "Docker", "Redis",
  "Socket.io", "Chakra UI", "React Native", "FastAPI",
  "REST API", "CI/CD", "Git", "Node.js"
];

function WordCloud({ count = SKILLS.length }) {
  const groupRef = useRef<THREE.Group>(null);

  const words = useMemo(() => {
    const temp: [THREE.Vector3, string][] = [];
    const phiSpan = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const theta = phiSpan * i;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      const pos = new THREE.Vector3(x * 3.2, y * 3.2, z * 3.2);
      temp.push([pos, SKILLS[i % SKILLS.length]]);
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x += delta * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {words.map(([pos, word], idx) => (
        <Text
          key={idx}
          position={pos}
          fontSize={0.35}
          color={idx % 2 === 0 ? "#b2c6f6" : "#c5c6cf"}
          anchorX="center"
          anchorY="middle"
        >
          {word}
        </Text>
      ))}
    </group>
  );
}

export default function TechSphere3D() {
  return (
    <div className="w-full h-[320px] md:h-[420px] relative">
      <Canvas
        camera={{ position: [0, 0, 7], fov: 50 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1} />
        <WordCloud />
      </Canvas>
    </div>
  );
}
