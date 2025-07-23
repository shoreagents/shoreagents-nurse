'use client';

import type { Variants } from 'motion/react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface CircleDollarSignIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const dollarMainVariants: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      duration: 0.5,
      opacity: { duration: 0.1 },
    },
  },
};

const dollarSecondaryVariants: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: {
      delay: 0.3,
      duration: 0.3,
      opacity: { duration: 0.1, delay: 0.3 },
    },
  },
};

const CircleDollarSignIcon: React.FC<CircleDollarSignIconProps> = ({ className, size = 16, animate = false }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("icon", className)}
    >
      <circle cx="12" cy="12" r="10" />
      <motion.path
        d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"
        initial="normal"
        animate={animate ? "animate" : "normal"}
        variants={dollarMainVariants}
      />
      <motion.path
        d="M12 18V6"
        initial="normal"
        animate={animate ? "animate" : "normal"}
        variants={dollarSecondaryVariants}
      />
    </svg>
  );
};

CircleDollarSignIcon.displayName = 'CircleDollarSignIcon';

export { CircleDollarSignIcon }; 