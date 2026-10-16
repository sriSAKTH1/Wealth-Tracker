import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, Sparkles, KeyRound } from 'lucide-react';
import { useAuth, ADMIN_PASSWORD } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { MoneyTreeBackground } from '../common/MoneyTreeBackground';
import { MoneyTreeAnimation } from '../common/MoneyTreeAnimation';

interface AdminPinGateProps {
  onVerified: () => void;
}

export const AdminPinGate: React.FC<AdminPinGateProps> = ({ onVerified }) => {
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
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const trimmed = pin.trim();

    if (!trimmed) {
      setErrorMessage('Please enter the administrator PIN.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setIsSubmitting(true);

    if (trimmed === 'niceTRY' || trimmed === ADMIN_PASSWORD) {
      try {
        sessionStorage.setItem('admin_pin_verified', 'true');
      } catch {}

      enterTestMode('admin');
      showNotification('👑 Admin PIN verified! Access granted to Master Admin Control Panel.');
      setIsSubmitting(false);
      onVerified();
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
    <div className="relative flex-1 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-12 min-h-[calc(100vh-80px)] overflow-hidden gap-8">
      {/* Background Money Tree Animation in Empty Space */}
      <MoneyTreeBackground opacity={0.65} />

      {/* Left side on desktop: Character planting money tree showcase */}
      <div className="hidden lg:block relative z-10 max-w-lg w-full">
        <MoneyTreeAnimation variant="split" />
      </div>

      {/* Right side / Center: Admin PIN entry card */}
      <div
        className={`relative z-10 w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 transition-all ${
          isShaking ? 'animate-bounce' : 'animate-in zoom-in-95 duration-200'
        } ${
          isLight
            ? 'bg-white/95 border-blue-200 text-slate-900 shadow-blue-500/10 backdrop-blur-md'
            : 'bg-zinc-950/95 border-blue-500/30 text-zinc-100 shadow-blue-900/30 ring-1 ring-blue-500/20 backdrop-blur-md'
        }`}
      >
        {/* Header with Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25 ring-4 ring-blue-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Master Admin Access</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Enter the PIN
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Enter the administrator PIN to unlock and manage the Admin Control Panel.
            </p>
          </div>
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
            <span className="font-semibold">Security Check:</span> Access is secured with a PIN. Enter PIN to proceed.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-gate-pin-input"
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
                id="admin-gate-pin-input"
                name="adminGatePin"
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

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isLight
                  ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>

            <button
              type="submit"
              id="btn-gate-submit-admin-pin"
              disabled={isSubmitting}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
