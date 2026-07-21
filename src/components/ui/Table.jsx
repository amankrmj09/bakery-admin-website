import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ className = '', ...props }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className = '', ...props }) {
  return <thead className={cn("[&_tr]:border-b [&_tr]:border-[var(--border-color)]", className)} {...props} />;
}

export function TableBody({ className = '', ...props }) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className = '', ...props }) {
  return (
    <tr
      className={cn("border-b border-[var(--border-color)] transition-colors hover:bg-[var(--bg-panel-hover)] data-[state=selected]:bg-[var(--bg-panel-hover)]", className)}
      {...props}
    />
  );
}

export function TableHead({ className = '', ...props }) {
  return (
    <th
      className={cn("h-12 px-4 text-left align-middle font-medium text-[var(--text-muted)] [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  );
}

export function TableCell({ className = '', ...props }) {
  return (
    <td
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0 text-[var(--text-main)]", className)}
      {...props}
    />
  );
}
