'use client';

import type { Variants } from 'motion/react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const variants: Variants = {
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
      duration: 0.6,
      ease: 'linear',
      opacity: { duration: 0.1 },
    },
  },
};

interface ActivityIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const ActivityIcon: React.FC<ActivityIconProps> = ({ className, size = 16, animate = false }) => {
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
      <motion.path
        variants={variants}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"
      />
    </svg>
  );
};

ActivityIcon.displayName = 'ActivityIcon';

export { ActivityIcon }; 