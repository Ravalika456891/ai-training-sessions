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
      className={`rounded-2xl transition-all duration-200 relative overflow-hidden bg-white border ${
        glow
          ? 'border-blue-500 shadow-md shadow-blue-500/10'
          : 'border-slate-200 shadow-sm'
      } ${
        hoverable
          ? 'hover:border-blue-600 hover:-translate-y-0.5 hover:shadow-md'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
