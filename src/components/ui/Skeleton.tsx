import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[#E4DAC4]/50",
        className
      )}
      {...props}
    />
  );
};
