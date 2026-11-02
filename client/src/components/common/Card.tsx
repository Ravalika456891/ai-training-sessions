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
      className={`rounded-2xl transition-all duration-300 relative overflow-hidden ${
        glow
          ? 'bg-gradient-to-b from-navy-850 to-navy-900 border border-indigo-500/30 shadow-xl shadow-indigo-950/40'
          : 'bg-navy-900/70 backdrop-blur-md border border-slate-800/80 shadow-lg'
      } ${
        hoverable
          ? 'hover:border-indigo-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10'
          : ''
      } ${className}`}
    >
      {glow && (
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />
      )}
      {children}
    </div>
  );
};
