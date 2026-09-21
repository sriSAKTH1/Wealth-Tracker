import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  ChevronUp, 
  Check, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon, 
  X,
  MessageSquarePlus,
  Star
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const SidebarProfile: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    isPrivateMode, 
    togglePrivateMode, 
    netWorth, 
    formatMoney
  } = useFinance();

  const isLight = theme === 'light';

  // Persistent user profile state
  const [userName] = useState<string>(() => {
    return localStorage.getItem('fix_user_name') || 'Sudharsan M.';
  });
  const [userEmail] = useState<string>(() => {
    return localStorage.getItem('fix_user_email') || 'sudharsanm014@gmail.com';
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Request');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsFeedbackModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute initials
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    // Persist feedback to local storage
    const existing = JSON.parse(localStorage.getItem('fix_user_feedback_logs') || '[]');
    const newEntry = {
      id: Date.now().toString(),
      rating: feedbackRating,
      category: feedbackCategory,
      message: feedbackText.trim(),
      date: new Date().toISOString()
    };
    localStorage.setItem('fix_user_feedback_logs', JSON.stringify([newEntry, ...existing]));

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
      setIsFeedbackModalOpen(false);
    }, 1200);
  };

  return (
    <div ref={containerRef} className="relative shrink-0 pt-3 border-t border-slate-200 dark:border-slate-800/80">
      {/* Profile Popover Menu (opens upward) */}
      {isMenuOpen && (
        <div 
          id="sidebar-profile-menu"
          className={`absolute bottom-full left-0 right-0 mb-2 p-2 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isLight 
              ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/60' 
              : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/80'
          }`}
        >
          {/* User Header Summary Card */}
          <div className={`p-3 rounded-xl border mb-2 ${
            isLight 
              ? 'bg-slate-50 border-slate-200/80 text-slate-900' 
              : 'bg-slate-950/70 border-slate-800/80 text-white'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20 shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs truncate">{userName}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500 text-[9px] font-mono font-bold tracking-wider shrink-0">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Quick Net Worth Snapshot */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Total Net Worth:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {formatMoney(netWorth)}
              </span>
            </div>
          </div>

          {/* Quick Action Navigation Links */}
          <div className="space-y-0.5 text-xs">
            <button
              id="sidebar-profile-btn-feedback"
              onClick={() => {
                setIsMenuOpen(false);
                setIsFeedbackModalOpen(true);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-blue-500" />
              <span>Share Feedback</span>
            </button>

            <div className={`my-1 h-px ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

            {/* Privacy Mode Quick Toggle */}
            <button
              id="sidebar-profile-btn-privacy"
              onClick={() => togglePrivateMode()}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isPrivateMode ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                <span>Privacy Mode</span>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isPrivateMode ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {isPrivateMode ? 'Active' : 'Off'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              id="sidebar-profile-btn-theme"
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span>Theme Mode</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 capitalize">
                {theme}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Bottom Profile Trigger Button */}
      <button
        id="sidebar-user-profile-button"
        onClick={() => setIsMenuOpen(prev => !prev)}
        className={`w-full flex items-center justify-between p-2 rounded-2xl transition-all border ${
          isMenuOpen
            ? isLight
              ? 'bg-blue-50/80 border-blue-200 shadow-sm text-slate-900'
              : 'bg-slate-900 border-blue-500/30 text-white shadow-sm'
            : isLight
              ? 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 text-slate-800 hover:border-slate-300'
              : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 text-slate-200 hover:border-slate-700'
        }`}
        aria-label="User Profile and Settings"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar with Status Indicator */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm ring-1 ring-white/20">
              {initials}
            </div>
            <span 
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950" 
              title="Online / Pro Active"
            />
          </div>

          {/* User Details */}
          <div className="text-left min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold truncate block">{userName}</span>
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            </div>
            <span className={`text-[10px] block truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {userEmail}
            </span>
          </div>
        </div>

        {/* Upward chevron indicator */}
        <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ml-1 ${
          isMenuOpen ? 'rotate-180 text-blue-500' : ''
        }`} />
      </button>

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            id="modal-user-feedback"
            className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Share Feedback</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Help us make your wealth dashboard even better</p>
                </div>
              </div>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  How would you rate your experience?
                </label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1.5 rounded-lg transition-transform hover:scale-110 ${
                        star <= feedbackRating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-[11px] font-mono text-slate-500 ml-2">
                    {feedbackRating === 5 ? 'Excellent' : feedbackRating === 4 ? 'Good' : feedbackRating === 3 ? 'Average' : 'Needs improvement'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  Feedback Topic
                </label>
                <select
                  value={feedbackCategory}
                  onChange={(e) => setFeedbackCategory(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-900' 
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="Feature Request">Feature Request</option>
                  <option value="UI & Design Improvement">UI & Design Improvement</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="General Praise">General Praise</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  Your Thoughts or Suggestions
                </label>
                <textarea
                  required
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you like or what tools you'd like to see next..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-900' 
                      : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              {feedbackSubmitted && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span className="font-semibold">Thank you! Your feedback has been received.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className={`px-4 py-2 rounded-xl font-medium border transition-colors ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-profile-feedback"
                  type="submit"
                  className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-colors"
                >
                  Send Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
