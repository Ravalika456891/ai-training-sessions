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

/** Institutional IIEM-styled surface card with crisp navy/crimson bottom border emphasis. */
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
        'rounded-lg transition-all duration-200 relative overflow-hidden bg-white border border-b-[3px]',
        glow
          ? 'border-slate-200 border-b-[#E41937] shadow-lg shadow-[#1F386B]/10'
          : 'border-slate-200/90 border-b-[#1F386B] shadow-[0_4px_18px_-6px_rgba(31,56,107,0.08)]',
        hoverable &&
          'hover:border-b-[#E41937] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgba(31,56,107,0.16)]',
        className
      )}
    >
      {accentTop && (
        <div className="h-[3px] w-full bg-gradient-to-r from-[#1F386B] via-[#081e4a] to-[#E41937]" />
      )}
      {children}
    </div>
  );
};
