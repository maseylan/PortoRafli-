import React, { useMemo } from 'react';
import { motion } from 'motion/react';

// SVG components for Tech Logos with brand colors
const ReactLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="-11.5 -10.23174 23 20.46348" {...props}>
    <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
    <g stroke="#61dafb" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2"/>
      <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
      <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
    </g>
  </svg>
);

const PythonLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 110 110" {...props}>
    <path fill="#3776ab" d="M54.5,7.9c-23,0-21.9,10-21.9,10l0,10.4h22.6v3.2H31.5c-31.2,0-32.5,21.6-32.5,21.6s-1,21.2,30.6,21.2h7.8v-10.9 c0-12,9.9-21.9,21.9-21.9h21.9V21C81.2,8.8,66,7.9,54.5,7.9z M43.8,17.4c2.5,0,4.5,2,4.5,4.5s-2,4.5-4.5,4.5s-4.5-2-4.5-4.5 S41.3,17.4,43.8,17.4z"/>
    <path fill="#ffd343" d="M55.5,102.1c23,0,21.9-10,21.9-10l0-10.4H54.8v-3.2h23.7c31.2,0,32.5-21.6,32.5-21.6s1-21.2-30.6-21.2h-7.8v10.9 c0,12-9.9,21.9-21.9,21.9H29.1v21.1C28.8,101.2,44,102.1,55.5,102.1z M66.2,92.6c-2.5,0-4.5-2-4.5-4.5s2-4.5,4.5-4.5s4.5,2,4.5,4.5 S68.7,92.6,66.2,92.6z"/>
  </svg>
);

const MongoLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#47A248" d="M12.01 0C12.01 0 3 5.093 3 13.916 3 18.528 7.373 24 12.01 24 16.647 24 21 18.528 21 13.916 21 5.093 12.01 0 12.01 0z"/>
  </svg>
);

const NodeLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#339933" d="M11.83 23.905l-9.16-5.265v-10.53l9.16-5.265 9.16 5.265v10.53l-9.16 5.265zM4 17.51l7.83 4.5 7.83-4.5v-9.02l-7.83-4.5-7.83 4.5v9.02z"/>
    <path fill="#339933" d="M11.83 14.5l-4-2.25v-4.5l4-2.25 4 2.25v4.5l-4 2.25z"/>
  </svg>
);

const DockerLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#2496ED" d="M22.5 13.6c-1.3 0-2.5-.5-3.4-1.3-.9.9-2.1 1.4-3.5 1.4-1.4 0-2.6-.5-3.5-1.4-.9.9-2.1 1.4-3.5 1.4-1.4 0-2.6-.5-3.5-1.4V14c0 3.1 2.5 5.6 5.6 5.6h8.8c1.6 0 2.9-1.3 2.9-2.9v-2.3c-.3-.4-.5-.8-.5-1.3v.5zM3.4 13.6c-1.4 0-2.6-.5-3.5-1.4v1.8C-.1 17.1 2.4 19.6 5.5 19.6h10V18h-10c-2.2 0-4-1.8-4-4v-.4z"/>
    <path fill="#2496ED" d="M11.5 8h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2h-2zm9 0h2v2h-2zm-9-3h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm-3-3h2v2h-2z"/>
  </svg>
);

const GitLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#F05032" d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l3.214 3.214c.836-.172 1.748.13 2.308.687.567.568.868 1.503.684 2.348l3.208 3.208c.842-.185 1.777.117 2.345.684.872.872.872 2.285 0 3.158-.873.872-2.286.872-3.159 0-.585-.584-.88-1.536-.684-2.385l-3.11-3.11v4.46c.162.184.283.415.344.675.2 1.054-.486 2.06-1.54 2.26-1.055.2-2.062-.486-2.262-1.54-.2-1.055.485-2.06 1.54-2.26.27-.05.54-.035.79.034v-4.57c-.244-.067-.506-.08-.767-.03-.844.18-1.554-.344-1.954-1.03l-3.23-3.23L.45 10.93c-.604.604-.604 1.584 0 2.188l10.48 10.48c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.604.605-1.584 0-2.188z"/>
  </svg>
);

const ICONS = [ReactLogo, PythonLogo, MongoLogo, NodeLogo, DockerLogo, GitLogo];

export default function TechBackground() {
  const elements = useMemo(() => {
    // Generate 15 floating icons
    return Array.from({ length: 15 }).map((_, i) => {
      const Icon = ICONS[i % ICONS.length];
      return {
        id: i,
        Icon,
        top: `${Math.floor(Math.random() * 80) + 10}%`,
        left: `${Math.floor(Math.random() * 80) + 10}%`,
        // Faster duration (10 to 25 seconds)
        duration: 10 + Math.random() * 15,
        delay: Math.random() * -20,
        yOffset: Math.random() > 0.5 ? 100 + Math.random() * 150 : -(100 + Math.random() * 150),
        xOffset: Math.random() > 0.5 ? 100 + Math.random() * 150 : -(100 + Math.random() * 150),
        size: 50 + Math.random() * 70, // icon size in pixels
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute mix-blend-screen"
          style={{ 
            top: el.top, 
            left: el.left,
            width: el.size,
            height: el.size,
          }}
          animate={{
            y: [0, el.yOffset, 0],
            x: [0, el.xOffset, 0],
            // Lower opacity as requested
            opacity: [0.03, 0.15, 0.03],
            rotate: [0, el.yOffset > 0 ? 90 : -90, 0]
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            ease: "linear",
            delay: el.delay
          }}
        >
          <el.Icon className="w-full h-full" />
        </motion.div>
      ))}
    </div>
  );
}
