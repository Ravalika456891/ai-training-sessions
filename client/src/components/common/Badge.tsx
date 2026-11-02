import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'purple' | 'cyan' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-xs md:text-sm px-3.5 py-1 gap-1.5',
  };

  const variantStyles = {
    primary: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    outline: 'bg-transparent text-slate-300 border border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full backdrop-blur-sm ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

