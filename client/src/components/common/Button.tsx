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
    'inline-flex items-center justify-center font-bold transition-all duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-2 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#1F386B] hover:bg-[#081e4a] text-white focus:ring-[#1F386B] shadow-sm shadow-[#1F386B]/20',
    gradient:
      'bg-[#1F386B] hover:bg-[#E41937] text-white focus:ring-[#1F386B] shadow-md shadow-[#1F386B]/20',
    secondary:
      'bg-[#E41937] hover:bg-[#c5142f] text-white focus:ring-[#E41937] shadow-sm shadow-[#E41937]/20',
    outline:
      'bg-white hover:bg-[#1F386B] text-[#1F386B] hover:text-white border border-[#1F386B] focus:ring-[#1F386B] shadow-2xs',
    ghost:
      'bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-[#1F386B] focus:ring-[#1F386B]',
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
