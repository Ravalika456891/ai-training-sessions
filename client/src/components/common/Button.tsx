import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../ui/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#0A2558] via-[#133B8A] to-[#1D4ED8] hover:from-[#081E4A] hover:to-[#1E40AF] text-white focus:ring-blue-500 shadow-sm shadow-blue-900/15',
    gradient:
      'bg-gradient-to-r from-[#0A2558] via-[#1D4ED8] to-[#2563EB] hover:brightness-110 text-white focus:ring-blue-500 shadow-md shadow-blue-900/20',
    secondary:
      'bg-slate-100 hover:bg-slate-200/90 text-[#0F172A] border border-slate-200 focus:ring-slate-400',
    outline:
      'bg-white hover:bg-blue-50/70 text-[#0A2558] border border-slate-200 hover:border-blue-400 focus:ring-blue-500 shadow-2xs',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-[#0A2558] focus:ring-blue-500',
  };

  return (
    <button
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {rightIcon && !isLoading && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
