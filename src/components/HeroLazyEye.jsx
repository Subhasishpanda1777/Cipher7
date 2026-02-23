"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function HeroLazyEye() {
  const prefersReducedMotion = useReducedMotion();
  const [target, setTarget] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;

    setTarget({
      x: clamp((nx - 0.5) * 24, -13, 13),
      y: clamp((ny - 0.5) * 20, -10, 10),
    });
  };

  const resetTarget = () => setTarget({ x: 0, y: 0 });

  const amblyopicTarget = useMemo(
    () => ({
      x: clamp(target.x * 0.78 - 8.6, -18, 12),
      y: clamp(target.y * 0.22 + 1.8, -5, 7),
    }),
    [target]
  );

  return (
    <motion.div
      className="lazy-eye-wrap"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTarget}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      aria-hidden="true"
    >
      <div className="lazy-eye-shell">
        <div className="lazy-eye-lid lazy-eye-lid--top" />
        <div className="lazy-eye-lid lazy-eye-lid--bottom" />
        <div className="lazy-eye-inner">
          <div className="lazy-eye-ball" />
          <div className="lazy-eye-veins" />
          <div className="lazy-eye-motif lazy-eye-motif--left" />
          <div className="lazy-eye-motif lazy-eye-motif--right" />

          <motion.div
            className="lazy-eye-iris"
            animate={
              prefersReducedMotion
                ? { x: -8, y: 2 }
                : {
                    x: [amblyopicTarget.x - 3.6, amblyopicTarget.x + 4.2, amblyopicTarget.x - 2.8, amblyopicTarget.x + 1.2, amblyopicTarget.x],
                    y: [amblyopicTarget.y + 0.9, amblyopicTarget.y - 0.2, amblyopicTarget.y + 0.7, amblyopicTarget.y + 0.2, amblyopicTarget.y],
                    scale: [1, 1.01, 0.995, 1],
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0.28, ease: "easeOut" }
                : {
                    duration: 1.2,
                    ease: "easeInOut",
                    times: [0, 0.25, 0.52, 0.78, 1],
                  }
            }
          >
            <div className="lazy-eye-ring" />
            <div className="lazy-eye-pupil" />
            <span className="lazy-eye-spec" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
