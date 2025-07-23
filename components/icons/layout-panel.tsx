'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LayoutPanelTopIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const LayoutPanelTopIcon: React.FC<LayoutPanelTopIconProps> = ({ className, size = 16, animate = false }) => {
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
      <motion.rect
        width="18"
        height="7"
        x="3"
        y="3"
        rx="1"
        initial="normal"
        animate={animate ? "animate" : "normal"}
        variants={{
          normal: { opacity: 1, translateY: 0 },
          animate: {
            opacity: [0, 1],
            translateY: [-3, 0],
            transition: {
              opacity: { duration: 0.4, times: [0.2, 1] },
              duration: 0.4,
            },
          },
        }}
      />
      <motion.rect
        width="7"
        height="7"
        x="3"
        y="14"
        rx="1"
        initial="normal"
        animate={animate ? "animate" : "normal"}
        variants={{
          normal: { opacity: 1, translateX: 0 },
          animate: {
            opacity: [0, 1],
            translateX: [-5, 0],
            transition: {
              opacity: { duration: 0.5, times: [0.4, 1] },
              translateX: { delay: 0.2 },
              duration: 0.4,
            },
          },
        }}
      />
      <motion.rect
        width="7"
        height="7"
        x="14"
        y="14"
        rx="1"
        initial="normal"
        animate={animate ? "animate" : "normal"}
        variants={{
          normal: { opacity: 1, translateX: 0 },
          animate: {
            opacity: [0, 1],
            translateX: [5, 0],
            transition: {
              opacity: { duration: 0.6, times: [0.4, 1] },
              translateX: { delay: 0.3 },
              duration: 0.4,
            },
          },
        }}
      />
    </svg>
  );
};

LayoutPanelTopIcon.displayName = 'LayoutPanelTopIcon';

export { LayoutPanelTopIcon }; 