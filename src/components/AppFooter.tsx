import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Clock, Sparkles, ArrowRight } from 'lucide-react';

export const AppFooter: React.FC = () => {
  const { isLight } = useFinance();
  const { isDemoMode, demoSecondsRemaining, openAuthModal, isAdmin, role } = useAuth();

  const minutes = Math.floor(demoSecondsRemaining / 60);
  const seconds = demoSecondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <footer
      id="app-global-footer"
      className={`w-full mt-12 pt-6 pb-20 sm:pb-8 border-t transition-colors ${
        isLight
          ? 'border-slate-200/80 bg-slate-50/40 text-slate-600'
          : 'border-zinc-800/80 bg-zinc-950/30 text-zinc-400'
      }`}
    >
      {/* Demo Mode Notice in Footer (Never shown for Admin) */}
      {isDemoMode && !isAdmin && role !== 'admin' && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-medium">
            <Clock className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span>
              <strong>5-Minute Demo Session:</strong> {formattedTime} remaining · View-Only Sandbox
            </span>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sign Up and Act</span>
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
