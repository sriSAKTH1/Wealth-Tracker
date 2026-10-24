import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Clock, Sparkles, ArrowRight } from 'lucide-react';

export const AppFooter: React.FC = () => {
  const { isLight } = useFinance();
  const { isDemoMode, isAdmin, demoSecondsRemaining, openAuthModal } = useAuth();

  const minutes = Math.floor(demoSecondsRemaining / 60);
  const seconds = demoSecondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = demoSecondsRemaining < 60;

  return (
    <footer
      id="app-global-footer"
      className={`w-full mt-12 pt-6 pb-20 sm:pb-8 border-t transition-colors ${
        isLight
          ? 'border-slate-200/80 bg-slate-50/40 text-slate-600'
          : 'border-zinc-800/80 bg-zinc-950/30 text-zinc-400'
      }`}
    >
      {/* Demo Sandbox Timer Bar in Footer: shown only during demo for non-admin visitors */}
      {isDemoMode && !isAdmin && (
        <div className="mb-5 p-3 sm:p-3.5 rounded-2xl border bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
              isUrgent ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-emerald-500/20 text-emerald-500'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Demo Session
                </span>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${
                  isUrgent 
                    ? 'bg-rose-500/20 text-rose-500 border-rose-500/30' 
                    : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                }`}>
                  {formattedTime} remaining
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Temporary preview sandbox. Create your free account to keep your portfolio permanently.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-footer-demo-signup"
            onClick={() => openAuthModal('register')}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Create Free Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left px-1">
        {/* Main Requested Brand Text - styled like second component */}
        <div className="flex items-center gap-2 text-xs opacity-75">
          <span className="select-all hover:opacity-100 transition-opacity">
            𝗙𝗜𝗫ᵂᵉᵃˡᵗʰ ᵀʳᵃᶜᵏᵉʳ by niceTRY
          </span>
        </div>

        {/* Secondary Info */}
        <div className="flex items-center gap-3 text-xs opacity-75">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure & Private Wealth Management</span>
          </span>
          <span>•</span>
          <span className="font-mono text-[11px]">v2.4</span>
        </div>
      </div>
    </footer>
  );
};
