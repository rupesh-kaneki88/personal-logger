"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

export default function DynamicBackground() {
  const bodyRef = useRef(null); // This ref won't directly attach to body, but useGSAP can target it

  useGSAP(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100; // Mouse X position as percentage
      const y = (e.clientY / window.innerHeight) * 100; // Mouse Y position as percentage

      gsap.to(document.body, {
        "--gradient-center-x": `${x}%`,
        "--gradient-center-y": `${y}%`,
        duration: 1,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, {}); // No scope needed if targeting document.body

  return null; // This component doesn't render anything visible itself
}
