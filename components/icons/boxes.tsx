'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface BoxesIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const BoxesIcon: React.FC<BoxesIconProps> = ({ className, size = 16, animate = false }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      style={{ overflow: 'visible' }}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("icon", className)}
    >
      <motion.path
        d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z m4.03 3.58 -4.74 -2.85 m4.74 2.85 5-3 m-5 3v5.17"
        variants={{
          normal: { translateX: 0, translateY: 0 },
          animate: { translateX: -1, translateY: 1 },
        }}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      <motion.path
        d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z m5 3-5-3 m5 3 4.74-2.85 M17 16.5v5.17"
        variants={{
          normal: { translateX: 0, translateY: 0 },
          animate: { translateX: 1, translateY: 1 },
        }}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
      <motion.path
        d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z M12 8 7.26 5.15 m4.74 2.85 4.74-2.85 M12 13.5V8"
        variants={{
          normal: { translateX: 0, translateY: 0 },
          animate: { translateX: 0, translateY: -1 },
        }}
        initial="normal"
        animate={animate ? "animate" : "normal"}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </svg>
  );
};

BoxesIcon.displayName = 'BoxesIcon';

export { BoxesIcon }; 