'use client';

import { AnimatePresence, motion, useAnimation } from 'motion/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface GripIconProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const CIRCLES = [
  { cx: 19, cy: 5 }, // Top right
  { cx: 12, cy: 5 }, // Top middle
  { cx: 19, cy: 12 }, // Middle right
  { cx: 5, cy: 5 }, // Top left
  { cx: 12, cy: 12 }, // Center
  { cx: 19, cy: 19 }, // Bottom right
  { cx: 5, cy: 12 }, // Middle left
  { cx: 12, cy: 19 }, // Bottom middle
  { cx: 5, cy: 19 }, // Bottom left
];

const GripIcon: React.FC<GripIconProps> = ({ className, size = 16, animate = false }) => {
  const controls = useAnimation();

  useEffect(() => {
    const animateCircles = async () => {
      if (animate) {
        await controls.start((i) => ({
          opacity: 0.3,
          transition: {
            delay: i * 0.05,
            duration: 0.15,
          },
        }));
        await controls.start((i) => ({
          opacity: 1,
          transition: {
            delay: i * 0.05,
            duration: 0.15,
          },
        }));
      } else {
        controls.start({
          opacity: 1,
          transition: { duration: 0.1 },
        });
      }
    };

    animateCircles();
  }, [animate, controls]);

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
      <AnimatePresence>
        {CIRCLES.map((circle, index) => (
          <motion.circle
            key={`${circle.cx}-${circle.cy}`}
            cx={circle.cx}
            cy={circle.cy}
            r="1"
            initial={{ opacity: 1 }}
            animate={controls}
            custom={index}
          />
        ))}
      </AnimatePresence>
    </svg>
  );
};

GripIcon.displayName = 'GripIcon';

export { GripIcon }; 