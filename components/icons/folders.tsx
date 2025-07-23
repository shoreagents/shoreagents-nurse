'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FoldersIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const FoldersIcon: React.FC<FoldersIconProps> = ({ className, size = 16, animate = false }) => {
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
        variants={{
          normal: {
            translateX: 0,
            translateY: 0,
          },
          animate: {
            translateX: -1.5,
            translateY: 1.5,
          },
        }}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
        d="M20 17a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.9a2 2 0 0 1-1.69-.9l-.81-1.2a2 2 0 0 0-1.67-.9H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2Z"
      />
      <motion.path
        d="M2 8v11a2 2 0 0 0 2 2h14"
        variants={{
          normal: {
            translateX: 0,
            translateY: 0,
            opacity: 1,
            scale: 1,
          },
          animate: {
            translateX: 1.5,
            translateY: -1.5,
            opacity: 0.7,
            scale: 0.95,
          },
        }}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      />
    </svg>
  );
};

FoldersIcon.displayName = 'FoldersIcon';

export { FoldersIcon }; 