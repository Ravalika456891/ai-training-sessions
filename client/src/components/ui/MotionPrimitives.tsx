import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './cn';

interface MotionRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**Viewport-triggered Framer Motion reveal wrapper configured for fast mobile & desktop rendering.*/
export const MotionReveal: React.FC<MotionRevealProps> = ({
  children,
  delay = 0,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface MotionBentoCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/** Interactive elevated SaaS bento card with subtle GPU lift and ambient border shine. */
export const MotionBentoCard: React.FC<MotionBentoCardProps> = ({
  children,
  delay = 0,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.06 }}
      transition={{ duration: 0.36, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        'rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/90',
        'shadow-[0_4px_20px_-6px_rgba(15,23,42,0.06)] hover:shadow-[0_14px_30px_-10px_rgba(37,99,235,0.16)]',
        'hover:border-blue-300/80 transition-colors duration-200',
        className
      )}
    >
      {children}
    </motion.div>
  );
};
