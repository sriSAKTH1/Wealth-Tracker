import React from 'react';
import { Clock, Lock, Sparkles, ArrowRight, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DemoCountdownBanner: React.FC = () => {
  const { 
    isDemoMode, 
    demoSecondsRemaining, 
    isCalculatorOnlyMode, 
    openAuthModal, 
    signOut 
  } = useAuth();

  if (!isDemoMode) return null;

  const minutes = Math.floor(demoSecondsRemaining / 60);
  const seconds = demoSecondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isUrgent = demoSecondsRemaining <= 60;

  return (
    <div 
      className={`w-full py-1.5 px-3 sm:px-4 text-xs font-mono transition-colors border-b z-30 shrink-0 ${
        isUrgent 
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-200' 
          : 'bg-emerald-950/60 dark:bg-emerald-950/60 border-emerald-500/20 text-emerald-200'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Timer & Mode */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 font-bold">
            {isUrgent ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            )}
            <span className="text-[11px] sm:text-xs tracking-tight text-white">
              Demo Session:
            </span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
              isUrgent 
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40 animate-pulse' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {formattedTime}
            </span>
            <span className="text-[10px] text-slate-400 hidden md:inline">remaining</span>
          </div>

          <span className="text-slate-600 dark:text-slate-500 hidden sm:inline">|</span>

          {/* Mode Pill */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>
              {isCalculatorOnlyMode 
                ? 'Calculator-Only Sandbox' 
                : 'View-Only Sandbox (No modifications)'}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => openAuthModal('register')}
            className="px-2.5 sm:px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Sign up to save personal assets and keep permanent records"
          >
            <Sparkles className="w-3 h-3 text-emerald-200" />
            <span>Sign Up and Act</span>
            <ArrowRight className="w-3 h-3 hidden sm:inline" />
          </button>

          <button
            type="button"
            onClick={() => signOut()}
            className="p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white font-sans text-[11px] transition-colors cursor-pointer flex items-center gap-1"
            title="Leave demo and return to login"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">Exit Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
