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
    primary: 'bg-blue-50 text-blue-700 border border-blue-200',
    purple: 'bg-blue-50 text-blue-700 border border-blue-200',
    cyan: 'bg-blue-50 text-blue-700 border border-blue-200',
    success: 'bg-blue-50 text-blue-700 border border-blue-200',
    warning: 'bg-blue-50 text-blue-700 border border-blue-200',
    outline: 'bg-transparent text-[#475569] border border-slate-300',
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
