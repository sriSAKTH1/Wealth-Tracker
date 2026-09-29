import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export interface DetailItem {
  label: string;
  value: React.ReactNode;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  itemType?: 'transaction' | 'account' | 'goal' | 'budget' | 'asset' | 'liability' | 'entry';
  itemName?: string;
  details?: DetailItem[];
  confirmButtonText?: string;
  isDestructive?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = 'Are you sure you want to delete this entry? This action cannot be undone and will update your portfolio totals.',
  itemType = 'entry',
  itemName,
  details = [],
  confirmButtonText = 'Delete',
  isDestructive = true,
}) => {
  const { theme } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="confirmation-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div 
        id="confirmation-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl border shadow-2xl p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 transition-colors ${
          isLight 
            ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-400/20' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/60'
        }`}
      >
        {/* Header with Danger Badge and Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isDestructive 
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400' 
                : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
            }`}>
              {isDestructive ? <AlertTriangle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="confirm-modal-title" className="text-base font-bold tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Confirmation required to prevent accidental data loss
              </p>
            </div>
          </div>

          <button
            id="btn-confirm-modal-close"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Message */}
        <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          {description}
        </p>

        {/* Item Details Preview Box */}
        {(itemName || details.length > 0) && (
          <div className={`p-3.5 rounded-xl border text-xs space-y-2 ${
            isLight 
              ? 'bg-zinc-50/80 border-zinc-200' 
              : 'bg-zinc-950/60 border-zinc-800/80'
          }`}>
            {itemName && (
              <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200 dark:border-zinc-800/80">
                <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Target {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
                  {itemName}
                </span>
              </div>
            )}

            {details.map((detail, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 dark:text-zinc-400">{detail.label}</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 font-mono">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
          <button
            id="btn-confirm-modal-cancel"
            type="button"
            onClick={onClose}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isLight 
                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            Cancel
          </button>
          
          <button
            id="btn-confirm-modal-action"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
              isDestructive 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30' 
                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
