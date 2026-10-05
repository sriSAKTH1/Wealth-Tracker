import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Star, 
  MoreHorizontal,
  ShieldCheck,
  CornerDownRight,
  MessageSquare,
  Shield,
  LogOut
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { ThankYouFeedbackModal } from './ThankYouFeedbackModal';
import { submitUserFeedback, fetchFeedbackList } from '../services/firebase';
import { AppFeedback } from '../types';

interface SidebarProfileProps {
  isCollapsed?: boolean;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({ isCollapsed = false }) => {
  const { 
    theme, 
    setTheme, 
    isPrivateMode, 
    togglePrivateMode, 
    netWorth, 
    formatMoney
  } = useFinance();

  const { 
    currentUser, 
    role, 
    isAdmin,
    isUser, 
    signOut, 
    isAuthenticated,
    switchDemoRole 
  } = useAuth();

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Dynamic user profile from AuthContext
  const userName = currentUser?.name || 'Sudharsan M.';
  const userEmail = currentUser?.email || 'sudharsanm014@gmail.com';

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState('Feature Request');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);
  const [submittedRating, setSubmittedRating] = useState<number | undefined>(undefined);
  const [submittedCategory, setSubmittedCategory] = useState<string | undefined>(undefined);

  // Feedback tab in modal & user feedback history (with admin replies)
  const [feedbackActiveTab, setFeedbackActiveTab] = useState<'new' | 'history'>('new');
  const [userFeedbackHistory, setUserFeedbackHistory] = useState<AppFeedback[]>([]);

  const loadUserFeedback = async () => {
    try {
      const all = await fetchFeedbackList();
      const myFeedbacks = all.filter(f => 
        f.userId === currentUser?.id || 
        (currentUser?.email && f.userEmail.toLowerCase() === currentUser.email.toLowerCase())
      );
      setUserFeedbackHistory(myFeedbacks);
    } catch (err) {
      console.warn("Could not load feedback history:", err);
    }
  };

  useEffect(() => {
    if (isFeedbackModalOpen) {
      loadUserFeedback();
    }
  }, [isFeedbackModalOpen, currentUser]);

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

    const currentRating = feedbackRating;
    const currentCategory = feedbackCategory;

    // Persist feedback to local storage
    const existing = JSON.parse(localStorage.getItem('fix_user_feedback_logs') || '[]');
    const newEntry = {
      id: Date.now().toString(),
      rating: currentRating,
      category: currentCategory,
      message: feedbackText.trim(),
      date: new Date().toISOString()
    };
    localStorage.setItem('fix_user_feedback_logs', JSON.stringify([newEntry, ...existing]));

    // Sync to Firestore database
    submitUserFeedback({
      userId: 'user-sudharsan',
      userName: userName,
      userEmail: userEmail,
      category: (currentCategory.toLowerCase().replace(' ', '_') as any) || 'feature_request',
      rating: currentRating,
      message: feedbackText.trim(),
    }).catch(err => console.warn('Could not sync feedback to Firestore:', err));

    setSubmittedRating(currentRating);
    setSubmittedCategory(currentCategory);
    setFeedbackSubmitted(true);
    setFeedbackText('');
    setIsFeedbackModalOpen(false);

    // Launch celebratory animation dialog saying "Thank you for the feedback!"
    setIsThankYouOpen(true);
  };

  return (
    <div ref={containerRef} className="relative shrink-0 pt-3 border-t border-slate-200 dark:border-slate-800/80">
      {/* Profile Popover Menu */}
      {isMenuOpen && (
        <div 
          id="sidebar-profile-menu"
          className={`absolute z-50 p-2 rounded-2xl border shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
            isCollapsed 
              ? 'left-full ml-3 bottom-0 w-64' 
              : 'bottom-full left-0 right-0 mb-2'
          } ${
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
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider shrink-0 ${
                    isAdmin 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isAdmin ? '👑 ADMIN' : '👤 USER'}
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-blue-500" />
              <span>Share Feedback</span>
            </button>

            {/* Quick 1-Click Test Mode Switcher */}
            <button
              id="sidebar-profile-btn-test-switch"
              onClick={() => {
                switchDemoRole(isAdmin ? 'user' : 'admin');
                setIsMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-left transition-colors cursor-pointer text-xs ${
                isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Toggle role in Test Mode"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-[11px]">Test Mode: Switch to {isAdmin ? 'User' : 'Admin'}</span>
              </div>
              <span className="text-[9px] font-mono px-1 rounded bg-amber-500/15 text-amber-400 font-bold">
                1-Click
              </span>
            </button>

            <div className={`my-1 h-px ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

            {/* Privacy Mode Quick Toggle */}
            <button
              id="sidebar-profile-btn-privacy"
              onClick={() => togglePrivateMode()}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
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

            {/* Sign Out / Exit to Login State */}
            <button
              id="sidebar-profile-btn-signout"
              onClick={() => {
                setIsMenuOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer text-rose-500 hover:bg-rose-500/10"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Bottom Profile Trigger Button */}
      {isCollapsed ? (
        /* Collapsed Compact Avatar Button */
        <div className="w-full flex justify-center">
          <button
            id="sidebar-user-profile-button"
            onClick={() => setIsMenuOpen(prev => !prev)}
            title={`${userName} (Wealth Architect)`}
            aria-label="User Profile and Settings"
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer border ${
              isMenuOpen
                ? isLight
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                  : 'bg-slate-900 border-blue-500/40 ring-2 ring-blue-500/20'
                : isLight
                  ? 'bg-slate-50 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold flex items-center justify-center text-xs shadow-sm ring-1 ring-white/20">
              {initials}
            </div>
            <span 
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950" 
              title="Online"
            />
          </button>
        </div>
      ) : (
        /* Expanded Full User Card (matches reference UI card) */
        <button
          id="sidebar-user-profile-button"
          onClick={() => setIsMenuOpen(prev => !prev)}
          className={`w-full flex items-center justify-between p-2 rounded-2xl transition-all border cursor-pointer ${
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
              <span className={`text-[10px] block truncate font-medium ${
                isAdmin ? 'text-blue-500 dark:text-blue-400 font-bold' : isLight ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {isAdmin ? '👑 Administrator' : '👤 Personal Wealth User'}
              </span>
            </div>
          </div>

          {/* More options button (...) */}
          <MoreHorizontal className={`w-4 h-4 text-slate-400 shrink-0 ml-1 transition-colors ${
            isMenuOpen ? 'text-blue-500' : 'hover:text-slate-200'
          }`} />
        </button>
      )}

      {/* Feedback Modal Portal (pops in the center of the entire page) */}
      {isFeedbackModalOpen && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setIsFeedbackModalOpen(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          aria-modal="true"
          role="dialog"
        >
          <div 
            id="modal-user-feedback"
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg p-6 sm:p-7 rounded-3xl border shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 my-auto ${
              isLight ? 'bg-white border-slate-200 text-slate-900 shadow-slate-400/40' : 'bg-slate-900 border-slate-800 text-white shadow-black/80'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-500 ring-1 ring-blue-500/20">
                  <MessageSquarePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Feedback &amp; Support</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Share suggestions with the Admin and view replies</p>
                </div>
              </div>
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs: Submit New Feedback vs View My Messages & Admin Replies */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setFeedbackActiveTab('new')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  feedbackActiveTab === 'new'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Send Feedback
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedbackActiveTab('history');
                  loadUserFeedback();
                }}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  feedbackActiveTab === 'history'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Admin Replies</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono">
                  {userFeedbackHistory.length}
                </span>
              </button>
            </div>

            {feedbackActiveTab === 'new' ? (
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
                        className={`p-1.5 rounded-lg transition-transform hover:scale-110 cursor-pointer ${
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
                    className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer ${
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
                    className={`px-4 py-2 rounded-xl font-medium border transition-colors cursor-pointer ${
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
                    className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-colors cursor-pointer"
                  >
                    Send Feedback
                  </button>
                </div>
              </form>
            ) : (
              /* View Previous Feedback & Admin Replies */
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {userFeedbackHistory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
                    <p>No feedback history yet. Share a suggestion or question above!</p>
                  </div>
                ) : (
                  userFeedbackHistory.map((item) => (
                    <div 
                      key={item.id}
                      className={`p-3.5 rounded-2xl border space-y-2 text-xs ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 capitalize">
                          {item.category.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          item.status === 'resolved'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}>
                          {item.status === 'resolved' ? 'Resolved ✓' : item.status}
                        </span>
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "{item.message}"
                      </p>

                      {/* Display Admin Reply if any */}
                      {item.adminReply ? (
                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400">
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Admin Reply:</span>
                            {item.repliedAt && (
                              <span className="text-[9px] font-normal text-slate-400 ml-auto">
                                {new Date(item.repliedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-100 font-medium">
                            "{item.adminReply}"
                          </p>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic">
                          Awaiting admin review...
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-inherit/40">
                        Submitted on {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Celebratory animation saying "Thank you for the feedback!" */}
      <ThankYouFeedbackModal
        isOpen={isThankYouOpen}
        onClose={() => setIsThankYouOpen(false)}
        rating={submittedRating}
        category={submittedCategory}
      />
    </div>
  );
};
