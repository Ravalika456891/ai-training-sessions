import React from 'react';

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
      className={`rounded-2xl transition-all duration-200 relative overflow-hidden bg-[#111827] border ${
        glow
          ? 'border-blue-600/50 shadow-md shadow-blue-950/30'
          : 'border-slate-800'
      } ${
        hoverable
          ? 'hover:border-blue-500 hover:-translate-y-0.5'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
