"use client";

import React from "react";
import {
  SiPython,
  SiSelenium,
  SiTypescript,
  SiNodedotjs,
  SiReact,
  SiNextdotjs,
  SiPostgresql,
  SiDocker,
  SiGit,
} from "react-icons/si";
import { Code2 } from "lucide-react";

interface TechIconProps {
  name: string;
  className?: string;
}

export default function TechIcon({ name, className = "w-5 h-5" }: TechIconProps) {
  const iconName = name.toLowerCase();

  if (iconName.includes("python")) {
    return <SiPython className={`${className} text-[#3776AB]`} />;
  }

  if (iconName.includes("selenium")) {
    return <SiSelenium className={`${className} text-[#43B02A]`} />;
  }

  if (iconName.includes("playwright")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M4 6l7 6-7 6V6z" fill="#45BA4B"/>
        <path d="M13 6l7 6-7 6V6z" fill="#2E7D32"/>
      </svg>
    );
  }

  if (iconName.includes("typescript")) {
    return <SiTypescript className={`${className} text-[#3178C6]`} />;
  }

  if (iconName.includes("node")) {
    return <SiNodedotjs className={`${className} text-[#5FA04E]`} />;
  }

  if (iconName.includes("react")) {
    return <SiReact className={`${className} text-[#61DAFB]`} />;
  }

  if (iconName.includes("next")) {
    return <SiNextdotjs className={`${className} text-white`} />;
  }

  if (iconName.includes("postgres")) {
    return <SiPostgresql className={`${className} text-[#4169E1]`} />;
  }

  if (iconName.includes("docker")) {
    return <SiDocker className={`${className} text-[#2496ED]`} />;
  }

  if (iconName.includes("git")) {
    return <SiGit className={`${className} text-[#F05032]`} />;
  }

  return <Code2 className={`${className} text-primary`} />;
}
