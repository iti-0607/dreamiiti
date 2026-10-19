import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'amber' | 'lavender' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-sage-600 hover:bg-sage-700 text-white shadow-sm hover:shadow-md border border-sage-700/20',
    secondary:
      'bg-white hover:bg-ivory-100 text-charcoal-700 border border-charcoal-200 shadow-soft',
    ghost:
      'bg-transparent hover:bg-ivory-200 text-charcoal-600 hover:text-charcoal-900',
    amber:
      'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md border border-amber-600/20',
    lavender:
      'bg-lavender-500 hover:bg-lavender-600 text-white shadow-sm hover:shadow-md border border-lavender-600/20',
    danger:
      'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
