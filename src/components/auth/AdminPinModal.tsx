import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, X, KeyRound, Sparkles } from 'lucide-react';
import { useAuth, ADMIN_PASSWORD } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { MoneyTreeBackground } from '../common/MoneyTreeBackground';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Enter the PIN',
  subtitle = 'Enter the administrator PIN to access the Master Admin Control Panel.'
}) => {
  const { enterTestMode, showNotification } = useAuth();
  const { setActiveTab, theme } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMessage(null);
      setIsShaking(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmedPin = pin.trim();

    if (!trimmedPin) {
      setErrorMessage('Please enter the administrator PIN.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsSubmitting(true);

    // Validate against configured password: 'niceTRY'
    if (trimmedPin === 'niceTRY' || trimmedPin === ADMIN_PASSWORD) {
      // Mark admin PIN as verified for this session
      try {
        sessionStorage.setItem('admin_pin_verified', 'true');
        localStorage.setItem('aura_initial_tab', 'admin');
      } catch {}

      // Enter test mode as admin
      enterTestMode('admin');

      // Navigate to admin tab
      try {
        setActiveTab('admin');
      } catch {}

      showNotification('👑 Admin PIN verified! Access granted to Master Admin Control Panel.');

      if (onSuccess) {
        onSuccess();
      }
      setIsSubmitting(false);
      onClose();
    } else {
      setIsSubmitting(false);
      setErrorMessage('Incorrect PIN! Access denied.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  };

  return (
    <div
      id="admin-pin-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-pin-modal-title"
    >
      {/* Background Money Tree Animation in Empty Space */}
      <MoneyTreeBackground opacity={0.6} />

      <div
        id="admin-pin-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 transition-all ${
          isShaking ? 'animate-bounce' : 'animate-in zoom-in-95 duration-200'
        } ${
          isLight
            ? 'bg-white border-blue-200 text-slate-900 shadow-blue-500/10'
            : 'bg-zinc-950 border-blue-500/30 text-zinc-100 shadow-blue-900/30 ring-1 ring-blue-500/20'
        }`}
      >
        {/* Header with Icon & Close Button */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="admin-pin-modal-title"
                  className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
                >
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Alert / Badge */}
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-3 ${
            isLight
              ? 'bg-blue-50/70 border-blue-200 text-blue-900'
              : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
          }`}
        >
          <Lock className="w-4 h-4 shrink-0 text-blue-500" />
          <div className="leading-relaxed">
            <span className="font-semibold">PIN Protection:</span> Please enter the administrator PIN to unlock administrator controls.
          </div>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-pin-input"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Enter the PIN
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>

              <input
                ref={inputRef}
                id="admin-pin-input"
                name="adminPin"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter PIN"
                autoComplete="current-password"
                className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm font-mono tracking-wider transition-all outline-none ${
                  errorMessage
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 focus:ring-2 focus:ring-rose-500/30'
                    : isLight
                    ? 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-slate-900'
                    : 'border-zinc-800 bg-zinc-900 focus:bg-zinc-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLight
                  ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              id="btn-submit-admin-pin"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isSubmitting ? 'Verifying...' : 'Enter Admin Page'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
