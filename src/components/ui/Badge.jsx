import React from 'react';

export function Badge({ className = '', variant = 'default', ...props }) {
  const baseStyles = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';
  
  const variants = {
    default: 'border-transparent bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'border-transparent bg-muted text-foreground hover:bg-muted/80',
    destructive: 'border-transparent bg-red-500 text-white hover:bg-red-600',
    outline: 'text-foreground',
    success: 'border-transparent bg-emerald-500 text-white hover:bg-emerald-600',
    warning: 'border-transparent bg-amber-500 text-white hover:bg-amber-600',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props} />
  );
}
