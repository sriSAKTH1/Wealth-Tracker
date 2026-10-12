import React from 'react';
import { Clock, Lock, Sparkles, ArrowRight, LogOut, AlertTriangle, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';

export const DemoCountdownBanner: React.FC = () => {
  const { 
    isDemoMode, 
    demoSecondsRemaining, 
    isCalculatorOnlyMode, 
    openAuthModal, 
    signOut,
    isAdmin,
    role
  } = useAuth();
  const { refillDemoAccount } = useFinance();

  // Strictly hide demo timer for Admins - admins always have unlimited access without timing
  if (!isDemoMode || isAdmin || role === 'admin') return null;

  const minutes = Math.floor(demoSecondsRemaining / 60);
  const seconds = demoSecondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = demoSecondsRemaining <= 60;

  const pctRemaining = Math.max(0, Math.min(100, (demoSecondsRemaining / 300) * 100));

  return (
    <footer 
      id="demo-countdown-footer-banner"
      className={`sticky bottom-0 z-40 w-full py-2 px-3 sm:px-6 text-xs font-mono transition-all border-t shadow-2xl backdrop-blur-md shrink-0 mb-16 lg:mb-0 relative overflow-hidden ${
        isUrgent 
          ? 'bg-amber-950/95 border-amber-500/50 text-amber-200' 
          : 'bg-slate-900/95 dark:bg-black/95 border-emerald-500/40 text-emerald-200'
      }`}
    >
      {/* 5-minute session elapsed visual progress track */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${
            isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
          }`}
          style={{ width: `${pctRemaining}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap pt-0.5">
        {/* Left: Timer & Mode */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 font-bold">
            {isUrgent ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
            ) : (
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            )}
            <span className="text-xs text-white">
              Demo Countdown Timer:
            </span>
            <span className={`px-2.5 py-0.5 rounded-lg font-mono font-bold text-xs ${
              isUrgent 
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 animate-pulse' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}>
              {formattedTime}
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">remaining (5 min session)</span>
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          {/* Mode Pill */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isCalculatorOnlyMode 
                ? 'Calculator-Only Sandbox' 
                : 'View-Only Sandbox · Non-modifiable'}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <button
            type="button"
            onClick={() => refillDemoAccount()}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 font-sans text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Refill demo account with default ₹1,042,931 portfolio & ₹70,000 salary data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Refill Demo (₹1,042,931)</span>
            <span className="sm:hidden">Refill</span>
          </button>

          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
            title="Sign up to save personal assets and keep permanent records"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Sign Up and Act</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white font-sans text-xs transition-colors cursor-pointer flex items-center gap-1"
            title="Leave demo and return to login"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exit Demo</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
