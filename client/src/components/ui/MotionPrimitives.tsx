import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './cn';

interface MotionRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Reliable reveal wrapper that never locks below-the-fold sections at opacity 0
 * during fast scrolling, tall viewports, or hash-link jumps.
 */
export const MotionReveal: React.FC<MotionRevealProps> = ({
  children,
  className,
}) => {
  return <div className={className}>{children}</div>;
};

interface MotionBentoCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/** Interactive elevated SaaS bento card with crisp #081e4a elevation on hover. */
export const MotionBentoCard: React.FC<MotionBentoCardProps> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-2xl bg-white border border-slate-200/90',
        'shadow-[0_4px_20px_-8px_rgba(8,30,74,0.08)] hover:shadow-[0_18px_36px_-12px_rgba(8,30,74,0.16)]',
        'hover:border-[#081e4a]/40 transition-all duration-200',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
