import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const Textarea = forwardRef(({ className, label, error, wrapperClassName, ...props }, ref) => {
  return (
    <div className={cn("flex flex-col gap-1.5 relative group", wrapperClassName)}>
      {label && (
        <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] ml-1 group-focus-within:text-[var(--color-primary)] transition-colors">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={cn(
          "w-full text-sm p-3.5 rounded-xl border bg-white dark:bg-slate-900 text-[var(--text-main)] outline-none transition-all shadow-sm focus:shadow-md focus:-translate-y-0.5 resize-y",
          error ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]" : "border-[var(--border-color)] focus:border-[var(--color-primary)]",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-[var(--color-danger)] ml-1">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
