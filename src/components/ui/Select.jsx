import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({ className, label, error, icon: Icon, wrapperClassName, children, ...props }, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5 relative group", wrapperClassName)}>
      {label && (
        <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] ml-1 group-focus-within:text-[var(--color-primary)] transition-colors">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors z-10" />
        )}
        <select
          ref={ref}
          className={cn(
            "w-full text-sm p-3.5 rounded-xl border bg-white dark:bg-slate-900 text-[var(--text-main)] outline-none transition-all shadow-sm focus:shadow-md focus:-translate-y-0.5 appearance-none cursor-pointer",
            Icon ? "pl-10" : "px-4",
            error ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]" : "border-[var(--border-color)] focus:border-[var(--color-primary)]",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none">
          <ChevronDown size={18} className="text-[var(--text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors" />
        </div>
      </div>
      {error && <span className="text-xs text-[var(--color-danger)] ml-1">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
