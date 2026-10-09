import React from 'react';
import { ShieldAlert, X, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GlobalToast: React.FC = () => {
  const { globalNotification, clearNotification, openAuthModal, isDemoMode } = useAuth();

  if (!globalNotification) return null;

  const isSignUpNotice = 
    globalNotification.toLowerCase().includes('sign up') || 
    globalNotification.toLowerCase().includes('demo') ||
    globalNotification.toLowerCase().includes('act');

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92vw] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto">
      <div className="px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-zinc-900/95 text-white backdrop-blur-md border border-slate-700/80 dark:border-zinc-700/80 shadow-2xl shadow-slate-950/40 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
          {isSignUpNotice ? <Lock className="w-4 h-4 text-amber-400" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
        </div>
        
        <div className="flex-1 min-w-0 pr-1">
          <p className="text-xs font-bold text-slate-100 tracking-tight leading-snug">
            {globalNotification}
          </p>
          {isDemoMode && isSignUpNotice && (
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              Zero-knowledge vault is view-only during trial.
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isSignUpNotice && (
            <button
              type="button"
              onClick={() => {
                clearNotification();
                openAuthModal('register');
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={clearNotification}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
