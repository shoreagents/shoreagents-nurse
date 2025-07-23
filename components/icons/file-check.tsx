'use client';

import { motion } from 'motion/react';
import type { Variants } from 'motion/react';
import { cn } from '@/lib/utils';

interface FileCheck2IconProps {
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

const FileCheck2Icon: React.FC<FileCheck2IconProps> = ({ className, size = 16, animate = false }) => {
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
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
      <motion.path
        initial="normal"
        animate={animate ? "animate" : "normal"}
        variants={checkVariants}
        d="m3 15 2 2 4-4"
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  );
};

FileCheck2Icon.displayName = 'FileCheck2Icon';

export { FileCheck2Icon }; 