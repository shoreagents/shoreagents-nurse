'use client';

import { motion, type Variants } from 'motion/react';
import { cn } from '@/lib/utils';

const pathVariants: Variants = {
  normal: {
    rotate: 0,
  },
  animate: {
    rotate: [0, -3, 3, -3, 3, 0],
    transition: {
      duration: 0.4,
      times: [0, 0.2, 0.4, 0.6, 0.8, 1],
    },
  },
};

interface ThermometerIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const ThermometerIcon: React.FC<ThermometerIconProps> = ({ className, size = 16, animate = false }) => {
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
        d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"
        variants={pathVariants}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  );
};

ThermometerIcon.displayName = 'ThermometerIcon';

export { ThermometerIcon }; 