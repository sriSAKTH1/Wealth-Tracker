import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  Plus, 
  DollarSign, 
  Building2, 
  CreditCard,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';

export const QuickAddOnboarding: React.FC = () => {
  const { 
    isOnboardingOpen, 
    setIsOnboardingOpen, 
    openQuickAdd, 
    theme,
    isLight 
  } = useFinance();
  const { isDemoMode } = useAuth();

  // Subtle entrance delay after mount for a smooth arrival effect
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOnboardingOpen) {
      const timer = setTimeout(() => setMounted(true), 400);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [isOnboardingOpen]);

  // Escape key dismisses onboarding tour
  useEffect(() => {
    if (!isOnboardingOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOnboardingOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingOpen, setIsOnboardingOpen]);

  if (isDemoMode || !isOnboardingOpen || !mounted) return null;

  const handleSkip = () => {
    setIsOnboardingOpen(false);
  };

  const handleTryNow = () => {
    openQuickAdd('income');
  };

  return (
    <div 
      id="quick-add-onboarding-overlay"
      className="fixed inset-0 z-50 select-none animate-in fade-in duration-300 pointer-events-auto"
      role="dialog"
      aria-labelledby="onboarding-tooltip-title"
      aria-describedby="onboarding-tooltip-desc"
    >
      {/* Semi-transparent Backdrop with gentle blur that dims background */}
      <div 
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] transition-opacity cursor-pointer"
        onClick={handleSkip}
        title="Click anywhere to skip guide"
      />

      {/* FAB Spotlight Target Highlight (Aligned directly over the fixed bottom-right FAB) */}
      <div 
        className="fixed bottom-20 sm:bottom-6 right-5 sm:right-6 z-50 pointer-events-auto flex items-center justify-center"
      >
        {/* Expanding radar ping rings */}
        <span className="absolute -inset-3 sm:-inset-4 rounded-full border-2 border-blue-400 opacity-60 animate-ping pointer-events-none" />
        <span className="absolute -inset-1.5 sm:-inset-2 rounded-full border-2 border-dashed border-blue-400 animate-pulse pointer-events-none shadow-[0_0_35px_rgba(59,130,246,0.85)]" />
        
        {/* Interactive Spotlight Button Proxy */}
        <button
          onClick={handleTryNow}
          aria-label="Try Quick Add Now"
          title="Click to open Quick Add modal"
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-2xl shadow-blue-500/80 hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/90 group focus:outline-none focus:ring-4 focus:ring-blue-400"
        >
          <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
          
          {/* Animated beacon tag */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950" />
          </span>
        </button>

        {/* Small floating hint badge next to the button */}
        <div className="absolute right-16 sm:right-18 whitespace-nowrap hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-600/40 border border-blue-400/40 animate-bounce pointer-events-none">
          <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>Quick Add FAB</span>
        </div>
      </div>

      {/* Onboarding Tooltip Card (Anchored gracefully near the FAB) */}
      <div 
        id="onboarding-tooltip-card"
        className={`fixed bottom-[145px] sm:bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] max-w-sm rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-250 ${
          isLight 
            ? 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-900/20 backdrop-blur-md' 
            : 'bg-slate-900/95 border-slate-700/90 text-white shadow-black/80 backdrop-blur-md'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Decorative Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400" />

        <div className="p-4 sm:p-5 space-y-3.5">
          {/* Badge & Close Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span>First-Time Guide</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 font-semibold">1 of 1</span>
              <button
                id="btn-onboarding-close"
                onClick={handleSkip}
                aria-label="Close onboarding tooltip"
                title="Dismiss guide"
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Headline & Body Explanation */}
          <div>
            <h3 
              id="onboarding-tooltip-title" 
              className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2"
            >
              <span>Meet Quick Add (+)</span>
              <span className="text-sm font-normal text-blue-500">✨</span>
            </h3>
            <p 
              id="onboarding-tooltip-desc" 
              className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed"
            >
              The floating <strong className="text-slate-900 dark:text-white font-semibold">(+) button</strong> is your fast lane to log records instantly without navigating away from what you are viewing.
            </p>
          </div>

          {/* 3 Pillars: What you can do */}
          <div className="space-y-1.5 pt-0.5">
            <div className={`p-2 sm:p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200/80 text-slate-800' : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[11px] leading-tight">Log Transactions</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate">Expenses, salary inflows & recurring bills</div>
              </div>
            </div>

            <div className={`p-2 sm:p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200/80 text-slate-800' : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[11px] leading-tight">Track New Assets</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate">Bank balances, mutual funds & equities</div>
              </div>
            </div>

            <div className={`p-2 sm:p-2.5 rounded-xl border flex items-center gap-2.5 text-xs transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200/80 text-slate-800' : 'bg-slate-800/60 border-slate-700/60 text-slate-200'
            }`}>
              <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 font-bold">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[11px] leading-tight">Register Liabilities</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-300 truncate">Credit card dues, personal loans & EMIs</div>
              </div>
            </div>
          </div>

          {/* Single-Key Keyboard Shortcut Hint */}
          <div className={`px-2.5 py-1.5 rounded-xl border text-[11px] flex items-center justify-between ${
            isLight ? 'bg-indigo-50/60 border-indigo-100 text-indigo-900' : 'bg-indigo-950/30 border-indigo-900/40 text-indigo-200'
          }`}>
            <span className="flex items-center gap-1.5">
              <span>Keyboard shortcut:</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-bold text-[10px] shadow-2xs">
                N
              </kbd>
            </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 text-[10px]">Instant open</span>
          </div>

          {/* Action Footer: Skip Tour & Try Now */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
            {/* Skip Tour Option */}
            <button
              id="btn-onboarding-skip"
              onClick={handleSkip}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Skip this guide and don't show again"
            >
              <span>Skip Tour</span>
            </button>

            <div className="flex items-center gap-1.5">
              {/* Primary Try Now Action */}
              <button
                id="btn-onboarding-try-now"
                onClick={handleTryNow}
                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                title="Open Quick Add modal and get started"
              >
                <span>Got It, Try Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pointer Arrow pointing towards the bottom-right FAB */}
        <div 
          className={`absolute -bottom-2 right-9 sm:right-11 w-4 h-4 rotate-45 border-r border-b ${
            isLight 
              ? 'bg-white border-slate-200' 
              : 'bg-slate-900 border-slate-700'
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
