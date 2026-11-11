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

/** Interactive institutional IIEM card with navy/crimson bottom border emphasis. */
export const MotionBentoCard: React.FC<MotionBentoCardProps> = ({
  children,
  className,
}) => {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-lg bg-white border border-slate-200/90 border-b-[3px] border-b-[#1F386B]',
        'shadow-[0_4px_20px_-8px_rgba(31,56,107,0.08)] hover:shadow-[0_18px_36px_-12px_rgba(31,56,107,0.16)]',
        'hover:border-b-[#E41937] transition-all duration-200',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
