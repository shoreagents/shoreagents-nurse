'use client';

import { Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PillAnimatedProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

const PillAnimated: React.FC<PillAnimatedProps> = ({ className, size = 16, animate = false }) => {
  return (
    <Pill 
      size={size}
      className={cn(
        "transition-transform duration-300 ease-out",
        animate && "rotate-12",
        className
      )}
    />
  );
};

PillAnimated.displayName = 'PillAnimated';

export { PillAnimated }; 