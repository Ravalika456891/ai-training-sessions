import React from 'react';
import { cn } from '../ui/cn';

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
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3.5 py-1 gap-1.5',
  };

  const variantStyles = {
    primary: 'bg-blue-50/90 text-[#0A2558] border border-blue-200/90 shadow-2xs',
    purple: 'bg-indigo-50/90 text-indigo-700 border border-indigo-200/90 shadow-2xs',
    cyan: 'bg-sky-50/90 text-sky-700 border border-sky-200/90 shadow-2xs',
    success: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/90 shadow-2xs',
    warning: 'bg-amber-50/90 text-amber-800 border border-amber-200/90 shadow-2xs',
    outline: 'bg-white text-slate-600 border border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full tracking-tight',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
