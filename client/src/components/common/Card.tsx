import React from 'react';
import { cn } from '../ui/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
  accentTop?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/** Reusable elevated UI surface card aligned with the #081e4a brand theme. */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  glow = false,
  accentTop = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-200 relative overflow-hidden bg-white border',
        glow
          ? 'border-[#081e4a]/45 shadow-[0_12px_32px_-12px_rgba(8,30,74,0.18)]'
          : 'border-slate-200/90 shadow-[0_4px_20px_-8px_rgba(8,30,74,0.08)]',
        hoverable &&
          'hover:border-[#081e4a]/45 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(8,30,74,0.16)]',
        className
      )}
    >
      {accentTop && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#081e4a]" aria-hidden="true" />
      )}
      {children}
    </div>
  );
};
