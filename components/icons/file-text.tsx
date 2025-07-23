'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface FileStackIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const FileStackIcon: React.FC<FileStackIconProps> = ({ className, size = 16, animate = false }) => {
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
        d="M21 7h-3a2 2 0 0 1-2-2V2"
        variants={{
          normal: { translateX: 0, translateY: 0 },
          animate: { translateX: -2, translateY: 2 },
        }}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      <motion.path
        d="M21 6v6.5c0 .8-.7 1.5-1.5 1.5h-7c-.8 0-1.5-.7-1.5-1.5v-9c0-.8.7-1.5 1.5-1.5H17Z"
        variants={{
          normal: { translateX: 0, translateY: 0 },
          animate: { translateX: -2, translateY: 2 },
        }}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      <path d="M7 8v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H15" />
      <motion.path
        d="M3 12v8.8c0 .3.2.6.4.8.2.2.5.4.8.4H11"
        variants={{
          normal: { translateX: 0, translateY: 0 },
          animate: { translateX: 2, translateY: -2 },
        }}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </svg>
  );
};

FileStackIcon.displayName = 'FileStackIcon';

export { FileStackIcon }; 