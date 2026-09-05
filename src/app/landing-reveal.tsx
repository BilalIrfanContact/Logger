"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PropsWithChildren } from "react";

type LandingRevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
}>;

export function LandingReveal({ children, className, delay = 0 }: LandingRevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        duration: 0.58,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
