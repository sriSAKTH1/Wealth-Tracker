import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  Star,
  ThumbsUp,
  Send,
  CheckCircle2,
  Sparkles,
  Layers,
  Heart,
  HelpCircle,
  Clock,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { ThankYouFeedbackModal } from '../ThankYouFeedbackModal';

interface FeedbackItem {
  id: string;
  rating: number;
  category: string;
  toolTarget: string;
  title: string;
  message: string;
  authorName?: string;
  authorEmail?: string;
  submittedAt: string;
  status: 'Received' | 'In Review' | 'Planned' | 'Implemented';
  upvotes?: number;
}

interface ToolsFeedbackSectionProps {
  isLight: boolean;
  onSelectCalculator?: (calcId: string) => void;
}

const STORAGE_KEY = 'financial_tools_user_feedbacks_v1';
const UPVOTES_KEY = 'financial_tools_upvoted_ideas_v1';

const PRESET_IDEAS = [
  {
    id: 'idea-tax-regime',
    title: 'Income Tax Regime Comparator (Old vs New FY 24-25)',
    description: 'Calculate net take-home salary and compare deductions under the 80C, 80D Old regime vs concessional New regime slabs.',
    category: 'Tax Planning',
    baseVotes: 142,
  },
  {
    id: 'idea-loan-prepay',
    title: 'Home Loan Prepayment vs Equity SIP Arbitrage',
    description: 'Analyze whether you should prepay an 8.5% home loan or invest surplus funds into a 12% equity index mutual fund.',
    category: 'Debt & Wealth',
    baseVotes: 98,
  },
  {
    id: 'idea-rule-72',
    title: 'Rule of 72 & Asset Doubling Time Calculator',
    description: 'Quick mental math tool to calculate the exact years required to double your money across FDs, Gold, Equity, and Real Estate.',
    category: 'Wealth Insights',
    baseVotes: 76,
  },
  {
    id: 'idea-epf-vpf',
    title: 'EPF + VPF + PPF Retirement Corpus Forecaster',
    description: 'Model guaranteed tax-free fixed-income retirement accumulation with 8.25% annual compounding and statutory employer match.',
    category: 'Retirement',
    baseVotes: 64,
  },
];

export const ToolsFeedbackSection: React.FC<ToolsFeedbackSectionProps> = ({
  isLight,
  onSelectCalculator,
}) => {
  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('Feature / Tool Request');
  const [toolTarget, setToolTarget] = useState<string>('Income Growth Calculator');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  
  // Feedback list & state
  const [submittedList, setSubmittedList] = useState<FeedbackItem[]>([]);
  const [upvotedIdeas, setUpvotedIdeas] = useState<Record<string, boolean>>({});
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState<boolean>(false);
  const [isThankYouModalOpen, setIsThankYouModalOpen] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSubmittedList(JSON.parse(saved));
      }
      const savedUpvotes = localStorage.getItem(UPVOTES_KEY);
      if (savedUpvotes) {
        setUpvotedIdeas(JSON.parse(savedUpvotes));
      }
    } catch (e) {
      console.error('Error loading feedback from storage:', e);
    }
  }, []);

  const handleRatingSelect = (starVal: number) => {
    setRating(starVal);
  };

  const getRatingSentiment = (stars: number) => {
    switch (stars) {
      case 5:
        return '⭐ Outstanding & Highly Accurate';
      case 4:
        return '👍 Very Good & Helpful';
      case 3:
        return '🙂 Good, Has Room for Improvement';
      case 2:
        return '😐 Needs Work & Better Features';
      case 1:
        return '⚠️ Inaccurate or Missing Critical Features';
      default:
        return '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newItem: FeedbackItem = {
      id: 'fb_' + Date.now(),
      rating,
      category,
      toolTarget,
      title: title.trim(),
      message: message.trim(),
      authorName: authorName.trim() || 'Anonymous User',
      authorEmail: authorEmail.trim() || undefined,
      submittedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'Received',
    };

    const updated = [newItem, ...submittedList];
    setSubmittedList(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save feedback to localStorage:', err);
    }

    // Reset form & show confirmation
    setTitle('');
    setMessage('');
    setIsSubmittedSuccess(true);
    setIsThankYouModalOpen(true);
    setTimeout(() => {
      setIsSubmittedSuccess(false);
    }, 6000);
  };

  const handleDeleteFeedback = (id: string) => {
    const filtered = submittedList.filter(item => item.id !== id);
    setSubmittedList(filtered);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Error deleting feedback:', e);
    }
  };

  const handleToggleUpvote = (ideaId: string) => {
    const current = !!upvotedIdeas[ideaId];
    const updated = { ...upvotedIdeas, [ideaId]: !current };
    setUpvotedIdeas(updated);
    try {
      localStorage.setItem(UPVOTES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving upvotes:', e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${
        isLight
          ? 'bg-gradient-to-br from-amber-50/70 via-blue-50/40 to-slate-50 border-amber-200'
          : 'bg-gradient-to-br from-amber-950/30 via-slate-900 to-blue-950/20 border-amber-500/30'
      } shadow-sm space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <MessageSquarePlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Tools & Calculators Feedback Hub</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Direct Community Voice
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Share feedback on our calculators, request new financial tools (e.g., tax, income growth, debt payoff), or suggest math refinements.
              </p>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 text-xs shrink-0 ${
            isLight ? 'bg-white/80 border-slate-200 text-slate-700' : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Built for Indian & Global Wealth Builders</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Layout: Feedback Form vs Community Upvotes & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Feedback Submission Form (7 cols) */}
        <div className={`lg:col-span-7 p-6 sm:p-7 rounded-3xl border space-y-5 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
        }`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Submit Your Feedback or Idea</span>
            </span>
            <h3 className="text-base font-bold mt-1">What would make our calculators even better for you?</h3>
          </div>

          {/* Success Banner */}
          {isSubmittedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <strong>Thank you! Your feedback has been recorded successfully.</strong>
                <p className="text-[11px] opacity-90 mt-0.5">
                  Our engineering & financial research team reviews all community submissions regularly.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block">
                Overall Calculator Satisfaction Rating
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => {
                    const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingSelect(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            isFilled
                              ? 'text-amber-400 fill-amber-400'
                              : isLight
                              ? 'text-slate-300'
                              : 'text-zinc-700'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-medium text-amber-400 font-mono ml-2">
                  {getRatingSentiment(hoverRating !== null ? hoverRating : rating)}
                </span>
              </div>
            </div>

            {/* 2. Category & Target Tool */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Feedback Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-amber-500/30 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                  }`}
                >
                  <option value="Feature / Tool Request">💡 New Calculator / Tool Request</option>
                  <option value="Income Growth & Graph">📈 Income Growth & Graph Feedback</option>
                  <option value="Calculator Accuracy & Math">🧮 Calculator Accuracy / Math Formula</option>
                  <option value="UI & Chart Usability">🎨 UI, Visual Charts & Usability</option>
                  <option value="Bug / Error Report">🐞 Bug or Computation Glitch</option>
                  <option value="General Feedback">💬 General Thoughts & Suggestions</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Specific Tool or Calculator</label>
                <select
                  value={toolTarget}
                  onChange={e => setToolTarget(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-amber-500/30 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                  }`}
                >
                  <option value="Income Growth Calculator">Income Growth Graph & Career Simulator</option>
                  <option value="SIP Calculator">SIP Calculator</option>
                  <option value="Step-Up SIP Calculator">Step-Up SIP Calculator</option>
                  <option value="SWP Calculator">SWP Calculator</option>
                  <option value="EMI / Loan Calculator">Loan / EMI Calculator</option>
                  <option value="Compound Interest">Compound Interest</option>
                  <option value="Inflation Calculator">Inflation Calculator</option>
                  <option value="FD / RD Calculator">Fixed & Recurring Deposits</option>
                  <option value="XIRR / CAGR Calculator">XIRR & CAGR Calculators</option>
                  <option value="Entire Tools Suite">Entire Tools Suite / General</option>
                </select>
              </div>
            </div>

            {/* 3. Title / Summary */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block">
                Subject / One-Line Idea <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Add Old vs New Tax Regime Comparator or Step-Up SIP presets"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-amber-500/30 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                }`}
              />
            </div>

            {/* 4. Details / Message */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>Detailed Suggestions & Thoughts <span className="text-rose-400">*</span></span>
                <span className="font-mono text-[10px]">{message.length}/800</span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={800}
                placeholder="Describe your suggestion in detail: which inputs or charts would help you most, what assumptions should be considered, or any specific formula you use..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-amber-500/30 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                }`}
              />
            </div>

            {/* 5. Author Information (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Your Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Sudharsan M"
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-amber-500/30 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 block">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={authorEmail}
                  onChange={e => setAuthorEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-amber-500/30 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Your feedback stays persistent in your browser workspace.
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Community Popular Wishlist & User Submitted Feedbacks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Community Top Requested Tools (Vote / Upvote) */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                <span>Community Wishlist & Upvotes</span>
              </span>
              <span className="text-[10px] text-slate-400">Click to vote</span>
            </div>

            <div className="space-y-2.5">
              {PRESET_IDEAS.map(idea => {
                const isUpvoted = !!upvotedIdeas[idea.id];
                const voteCount = idea.baseVotes + (isUpvoted ? 1 : 0);

                return (
                  <div
                    key={idea.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isUpvoted
                        ? isLight
                          ? 'bg-blue-50/70 border-blue-300'
                          : 'bg-blue-950/30 border-blue-500/40'
                        : isLight
                        ? 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {idea.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold leading-snug">{idea.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {idea.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleUpvote(idea.id)}
                        className={`px-2.5 py-1.5 rounded-xl border flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isUpvoted
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : isLight
                            ? 'bg-white hover:bg-blue-50 text-slate-700 border-slate-300'
                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold font-mono mt-0.5">{voteCount}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Submitted Feedback History */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Your Submitted Feedback ({submittedList.length})</span>
              </span>
              {submittedList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Clear all your submitted feedback history?')) {
                      setSubmittedList([]);
                      localStorage.removeItem(STORAGE_KEY);
                    }
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {submittedList.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <MessageSquarePlus className="w-8 h-8 mx-auto text-slate-500/50" />
                <p className="text-xs text-slate-400">
                  You haven't submitted any feedback yet. Share your thoughts using the form on the left!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {submittedList.map(item => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border space-y-2 relative group ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/70 border-zinc-800'
                    }`}
                  >
                    <button
                      onClick={() => handleDeleteFeedback(item.id)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete this feedback entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center justify-between pr-6 text-[10px]">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {item.category}
                      </span>
                      <span className="text-slate-400 font-mono">{item.submittedAt}</span>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold">{item.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">
                        {item.message}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] border-t border-slate-200/60 dark:border-zinc-800/60 text-slate-500">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                      <span className="font-mono text-emerald-400 font-semibold">
                        Status: {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Celebratory Thank You Animation */}
      <ThankYouFeedbackModal
        isOpen={isThankYouModalOpen}
        onClose={() => setIsThankYouModalOpen(false)}
        rating={rating}
        category={category}
      />
    </div>
  );
};
