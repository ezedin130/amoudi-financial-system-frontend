import React from 'react';
import { ISpinner } from './Icons';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  style,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'text-white hover:opacity-95 active:scale-[0.99] border border-transparent shadow-sm',
    secondary:
      'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 active:scale-[0.99] shadow-sm',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 border border-transparent active:scale-[0.99]',
    danger:
      'bg-red-600 text-white hover:bg-red-700 border border-red-600 active:scale-[0.99] shadow-sm',
  };

  const primaryStyle: React.CSSProperties =
    variant === 'primary'
      ? {
          backgroundColor: '#0F2E22',
          borderColor: '#0F2E22',
          ...style,
        }
      : style || {};

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      style={primaryStyle}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <ISpinner size={size === 'sm' ? 14 : 16} className="text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
