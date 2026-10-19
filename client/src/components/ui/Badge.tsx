import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sage' | 'lavender' | 'amber' | 'charcoal' | 'emerald' | 'rose';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sage',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
  }[size];

  const variantClasses = {
    sage: 'bg-sage-100 text-sage-800 border border-sage-200/60',
    lavender: 'bg-lavender-100 text-lavender-800 border border-lavender-200/60',
    amber: 'bg-amber-100 text-amber-800 border border-amber-200/60',
    charcoal: 'bg-charcoal-100 text-charcoal-700 border border-charcoal-200',
    emerald: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    rose: 'bg-rose-100 text-rose-800 border border-rose-200',
  }[variant];

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
