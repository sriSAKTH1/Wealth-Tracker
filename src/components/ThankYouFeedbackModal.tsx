import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  PartyPopper, 
  Heart, 
  X, 
  Star,
  ThumbsUp
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface ThankYouFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  rating?: number;
  category?: string;
  autoCloseMs?: number;
}

// Confetti particle definition for floating celebration effect
const CONFETTI_ITEMS = [
  { id: 1, color: '#10B981', size: 'w-2.5 h-2.5', left: '15%', delay: '0ms', anim: 'animate-bounce' },
  { id: 2, color: '#3B82F6', size: 'w-2 h-2', left: '25%', delay: '150ms', anim: 'animate-pulse' },
  { id: 3, color: '#F59E0B', size: 'w-3 h-3', left: '40%', delay: '300ms', anim: 'animate-bounce' },
  { id: 4, color: '#EC4899', size: 'w-2 h-2', left: '55%', delay: '100ms', anim: 'animate-pulse' },
  { id: 5, color: '#8B5CF6', size: 'w-2.5 h-2.5', left: '70%', delay: '250ms', anim: 'animate-bounce' },
  { id: 6, color: '#06B6D4', size: 'w-2 h-2', left: '85%', delay: '400ms', anim: 'animate-pulse' },
  { id: 7, color: '#E11D48', size: 'w-2 h-2.5', left: '32%', delay: '200ms', anim: 'animate-bounce' },
  { id: 8, color: '#14B8A6', size: 'w-2.5 h-2', left: '62%', delay: '350ms', anim: 'animate-pulse' },
];

export const ThankYouFeedbackModal: React.FC<ThankYouFeedbackModalProps> = ({
  isOpen,
  onClose,
  rating,
  category,
  autoCloseMs = 3800
}) => {
  const { theme } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen) return;

    setProgress(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / autoCloseMs) * 100);
      setProgress(remainingPct);
      if (elapsed >= autoCloseMs) {
        clearInterval(interval);
        onClose();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  // Theme-aware modal card styling
  const cardThemeClass = (() => {
    switch (theme) {
      case 'flavorfit':
        return 'bg-[#0B0C14] border-[#202438] text-white shadow-2xl shadow-cyan-950/40';
      case 'nature':
        return 'bg-[#FAF8F3] border-[#DED9CD] text-[#283618] shadow-2xl';
      case 'retro':
        return 'bg-[#FAF6ED] border-[#D6CCB5] text-[#2B2520] shadow-2xl';
      case 'light':
        return 'bg-white border-slate-200 text-slate-900 shadow-2xl shadow-blue-500/10';
      default:
        return 'bg-slate-900 border-slate-800 text-white shadow-2xl shadow-black/60';
    }
  })();

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Falling / floating celebratory particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {CONFETTI_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`absolute top-1/4 rounded-full opacity-80 ${item.size} ${item.anim}`}
            style={{
              left: item.left,
              backgroundColor: item.color,
              animationDelay: item.delay,
              transform: 'translateY(-20px)',
              boxShadow: `0 0 12px ${item.color}`,
            }}
          />
        ))}
      </div>

      <div
        className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 text-center relative overflow-hidden animate-in zoom-in-95 duration-250 ${cardThemeClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-br from-emerald-400/20 via-blue-500/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close thank you dialog"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebratory Icon with Double Pulsing Rings */}
        <div className="relative mx-auto w-20 h-20 mb-4 flex items-center justify-center">
          {/* Animated outward pulse ring */}
          <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
          <span className="absolute -inset-2 rounded-full bg-gradient-to-tr from-emerald-500/20 via-blue-500/20 to-amber-500/20 animate-pulse duration-1500" />

          {/* Central celebratory badge */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30 transform transition-transform hover:scale-105">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5] animate-in zoom-in-75 duration-300" />
          </div>

          {/* Mini accent icons */}
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-md animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-zinc-950 stroke-[2]" />
          </div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md animate-pulse">
            <Heart className="w-3.5 h-3.5 fill-white stroke-[2]" />
          </div>
        </div>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
          <PartyPopper className="w-3.5 h-3.5" />
          <span>Feedback Recorded</span>
        </div>

        {/* Primary Headline with Animation */}
        <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
          Thank you for the feedback!
        </h3>

        {/* Friendly Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-4">
          We truly appreciate you taking the time to share your thoughts. Your feedback directly shapes our new features and financial calculators!
        </p>

        {/* Optional Rating / Topic Recap Pill */}
        {(rating || category) && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {rating && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                    />
                  ))}
                </div>
                <span className="font-mono text-[11px] ml-1">{rating}/5</span>
              </div>
            )}
            {category && (
              <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-medium">
                {category}
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white shadow-lg shadow-emerald-500/25 active:scale-95 transition-all text-xs cursor-pointer flex items-center justify-center gap-2 mx-auto"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>You&apos;re Welcome!</span>
        </button>

        {/* Auto-Dismiss Progress Bar */}
        <div className="mt-5 w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
