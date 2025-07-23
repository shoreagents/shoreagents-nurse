'use client';

import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { cn } from '@/lib/utils';

interface MonitorCheckIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const checkVariants: Variants = {
  normal: {
    pathLength: 1,
    opacity: 1,
  },
  animate: {
    pathLength: [0, 1],
    opacity: [0, 1],
    transition: {
      pathLength: { duration: 0.4, ease: 'easeInOut' },
      opacity: { duration: 0.4, ease: 'easeInOut' },
    },
  },
};

const MonitorCheckIcon: React.FC<MonitorCheckIconProps> = ({ className, size = 16, animate = false }) => {
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
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
      <motion.path
        initial="normal"
        animate={animate ? "animate" : "normal"}
        variants={checkVariants}
        d="m9 10 2 2 4-4"
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  );
};

MonitorCheckIcon.displayName = 'MonitorCheckIcon';

export { MonitorCheckIcon }; 