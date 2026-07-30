import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../app/ThemeContext';
import { cn } from '../../lib/utils';

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  const { glass } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <div className="flex min-h-full items-center justify-center p-4 pointer-events-none relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className={cn(
                "text-[var(--text-main)] rounded-3xl shadow-lg shadow-black/10 dark:shadow-2xl dark:shadow-black w-full pointer-events-auto overflow-hidden border border-[var(--border-color)] my-8",
                maxWidth,
                "bg-white dark:bg-black"
              )}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]/50 bg-white dark:bg-black sticky top-0 z-10">
                <h3 className="font-semibold text-lg">{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md hover:bg-[var(--bg-panel-hover)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
