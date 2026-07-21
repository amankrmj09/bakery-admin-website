import React from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../app/ThemeContext';

export function Card({ className = '', ...props }) {
  const { glass } = useTheme();
  return (
    <div 
      className={cn(
        "rounded-2xl border border-[var(--border-color)] text-[var(--text-main)] shadow-sm",
        glass ? "glass-panel" : "bg-[var(--bg-panel)]",
        className
      )} 
      {...props} 
    />
  );
}

export function CardHeader({ className = '', ...props }) {
  return <div className={cn("flex flex-col space-y-1.5 p-6 border-b border-[var(--border-color)]/50", className)} {...props} />;
}

export function CardTitle({ className = '', ...props }) {
  return (
    <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  );
}

export function CardDescription({ className = '', ...props }) {
  return (
    <p className={cn("text-sm text-[var(--text-muted)]", className)} {...props} />
  );
}

export function CardContent({ className = '', ...props }) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({ className = '', ...props }) {
  return (
    <div className={cn("flex items-center p-6 border-t border-[var(--border-color)]/50", className)} {...props} />
  );
}
