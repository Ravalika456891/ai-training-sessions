import React from 'react';
import { cn } from '../ui/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  glow?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  glow = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-200 relative overflow-hidden bg-white border',
        glow
          ? 'border-[#081e4a]/50 shadow-lg shadow-[#081e4a]/10'
          : 'border-slate-200/90 shadow-[0_4px_18px_-6px_rgba(15,23,42,0.06)]',
        hoverable &&
          'hover:border-[#081e4a]/50 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgba(8,30,74,0.14)]',
        className
      )}
    >
      {children}
    </div>
  );
};
