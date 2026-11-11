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
      'bg-[#081e4a] hover:bg-[#0c2d6e] text-white focus:ring-[#081e4a] shadow-sm shadow-[#081e4a]/15',
    gradient:
      'bg-[#081e4a] hover:bg-[#0c2d6e] text-white focus:ring-[#081e4a] shadow-md shadow-[#081e4a]/20',
    secondary:
      'bg-slate-100 hover:bg-slate-200/90 text-[#0F172A] border border-slate-200 focus:ring-slate-400',
    outline:
      'bg-white hover:bg-blue-50/70 text-[#081e4a] border border-[#081e4a]/25 hover:border-[#081e4a] focus:ring-[#081e4a] shadow-2xs',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-[#081e4a] focus:ring-[#081e4a]',
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
