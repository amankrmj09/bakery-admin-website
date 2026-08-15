import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

/**
 * Reusable confirmation dialog built on top of Modal.
 *
 * Props:
 *  isOpen        – boolean
 *  onClose       – () => void   (Cancel / backdrop click)
 *  onConfirm     – () => void   (Confirm button)
 *  title         – string
 *  message       – string
 *  confirmLabel  – string  (default: "Delete")
 *  cancelLabel   – string  (default: "Cancel")
 *  variant       – "danger" | "warning"  (default: "danger")
 *  icon          – lucide component  (optional override)
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon: Icon,
}) {
  const isDanger = variant === 'danger';
  const DefaultIcon = isDanger ? Trash2 : AlertTriangle;
  const ResolvedIcon = Icon || DefaultIcon;

  const iconBg  = isDanger ? 'bg-red-100'    : 'bg-amber-100';
  const iconClr = isDanger ? 'text-red-600'  : 'text-amber-600';
  const btnClr  = isDanger
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-amber-500 hover:bg-amber-600';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            <ResolvedIcon className={`w-5 h-5 ${iconClr}`} />
          </div>
          <p className="text-[var(--text-main)] text-sm leading-relaxed pt-1.5">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-color)]/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel-hover)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors flex items-center gap-2 shadow-sm ${btnClr}`}
          >
            <ResolvedIcon className="w-4 h-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
