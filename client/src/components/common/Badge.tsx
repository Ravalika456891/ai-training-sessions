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
    primary: 'bg-blue-600/15 text-blue-400 border border-blue-600/30',
    purple: 'bg-blue-600/15 text-blue-400 border border-blue-600/30',
    cyan: 'bg-blue-600/15 text-blue-400 border border-blue-600/30',
    success: 'bg-blue-600/15 text-blue-300 border border-blue-600/30',
    warning: 'bg-blue-600/15 text-blue-300 border border-blue-600/30',
    outline: 'bg-transparent text-slate-300 border border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
