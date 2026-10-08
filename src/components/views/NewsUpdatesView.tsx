import React, { useState, useEffect, useMemo } from 'react';
import { 
  Newspaper, 
  Sparkles, 
  Calendar, 
  Clock, 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Share2, 
  BookOpen,
  Crown, 
  Lock, 
  Check, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  TrendingUp, 
  Coins, 
  Bell, 
  ShieldCheck, 
  Pin, 
  Flame, 
  Save, 
  X,
  Sliders,
  Eye,
  Send,
  Zap,
  Info
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { AppNewsPost } from '../../types';
import { fetchNewsPosts } from '../../services/firebase';

interface FinancialNote {
  id: string;
  title: string;
  content: string;
  category: 'Stock Idea' | 'Mutual Fund' | 'Tax Plan' | 'Market Memo';
  updatedAt: string;
  isPinned?: boolean;
}

const DEFAULT_SEED_NOTES: FinancialNote[] = [
  {
    id: 'note-1',
    title: 'HDFC Bank & Reliance Q3 Rebalancing Thesis',
    content: 'Review quarterly earnings disclosures. In case of volatility below 200 EMA, increase monthly equity SIP allocation by ₹5,000. Keep debt mutual fund buffer untouched for emergency runway.',
    category: 'Stock Idea',
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isPinned: true
  },
  {
    id: 'note-2',
    title: 'Monthly SIP Discipline & 80C Tax Check',
    content: 'Verify Parag Parikh Flexi Cap Fund and Nifty 50 Index Fund debits on 5th of every month. Check Section 80C ELSS contribution cap before February.',
    category: 'Mutual Fund',
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    isPinned: false
  }
];

type NewsMainTab = 'news_updates' | 'pro_schedule' | 'notepad' | 'holding_news';

export const NewsUpdatesView: React.FC = () => {
  const { theme, assets } = useFinance();
  const { currentUser } = useAuth();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Active Primary Tab inside Newsroom
  const [activeTab, setActiveTab] = useState<NewsMainTab>('news_updates');

  // Sub-category filter inside News & Updates
  const [subNewsFilter, setSubNewsFilter] = useState<string>('all');
  const [newsSearch, setNewsSearch] = useState('');
  const [posts, setPosts] = useState<AppNewsPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeArticle, setActiveArticle] = useState<AppNewsPost | null>(null);

  // Pro Feature: News Digest Frequency & Delivery Schedule
  const [deliveryTier, setDeliveryTier] = useState<'normal' | 'pro'>(() => {
    return (localStorage.getItem('app_news_delivery_tier') as 'normal' | 'pro') || 'normal';
  });
  const [deliveryDay, setDeliveryDay] = useState<string>(() => {
    return localStorage.getItem('app_news_delivery_day') || 'Sunday';
  });
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState<string>(() => {
    return localStorage.getItem('app_news_delivery_time') || '08:00 AM IST';
  });

  // Financial Notepad State
  const [notes, setNotes] = useState<FinancialNote[]>(() => {
    const cached = localStorage.getItem('app_user_financial_notes');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return DEFAULT_SEED_NOTES;
  });
  const [noteSearchQuery, setNoteSearchQuery] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [activeEditingNoteId, setActiveEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<FinancialNote['category']>('Stock Idea');

  // Holding News Coming Soon state
  const [isHoldingNewsNotified, setIsHoldingNewsNotified] = useState(() => {
    return localStorage.getItem('app_holding_news_waitlist') === 'true';
  });

  // Global Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch articles
  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      try {
        const data = await fetchNewsPosts();
        setPosts(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  // Sync notes to local storage
  useEffect(() => {
    localStorage.setItem('app_user_financial_notes', JSON.stringify(notes));
  }, [notes]);

  // Detected Stock & Mutual Fund Holdings from portfolio
  const userStockAndMfHoldings = useMemo(() => {
    return assets.filter(a => {
      const cat = (a.category || '').toLowerCase();
      return cat.includes('stock') || cat.includes('equity') || cat.includes('mutual') || cat.includes('fund') || cat.includes('etf');
    });
  }, [assets]);

  const deliveryDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Schedule change handler
  const handleUpdateSchedule = (newTier: 'normal' | 'pro', newDay?: string) => {
    setDeliveryTier(newTier);
    localStorage.setItem('app_news_delivery_tier', newTier);

    if (newDay) {
      setDeliveryDay(newDay);
      localStorage.setItem('app_news_delivery_day', newDay);
      showToast(`PRO Digest delivery schedule updated to every ${newDay}!`);
    } else if (newTier === 'normal') {
      showToast('Switched to Normal plan: Monthly digest delivered on 1st of every month.');
    } else {
      showToast('PRO plan activated! Weekly digests unlocked. Pick your preferred day below.');
    }
  };

  const handleUpdateDeliveryTime = (time: string) => {
    setPreferredDeliveryTime(time);
    localStorage.setItem('app_news_delivery_time', time);
    showToast(`Digest timing set to ${time}`);
  };

  // Note actions
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showToast('Please enter a note title.');
      return;
    }

    if (activeEditingNoteId) {
      setNotes(prev => prev.map(n => n.id === activeEditingNoteId ? {
        ...n,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
        updatedAt: new Date().toISOString()
      } : n));
      showToast('Note updated successfully!');
    } else {
      const newNote: FinancialNote = {
        id: `note-${Date.now()}`,
        title: noteTitle.trim(),
        content: noteContent.trim(),
        category: noteCategory,
        updatedAt: new Date().toISOString(),
        isPinned: false
      };
      setNotes(prev => [newNote, ...prev]);
      showToast('New investment memo saved!');
    }

    setIsEditingNote(false);
    setActiveEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleStartEditNote = (note: FinancialNote) => {
    setActiveEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setIsEditingNote(true);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeEditingNoteId === id) {
      setIsEditingNote(false);
      setActiveEditingNoteId(null);
    }
    showToast('Note deleted.');
  };

  const handleCopyNote = (content: string) => {
    navigator.clipboard.writeText(content);
    showToast('Note content copied to clipboard!');
  };

  const handleTogglePinNote = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  // Filtered news posts
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchesCategory = subNewsFilter === 'all' || p.category === subNewsFilter;
      const matchesSearch = 
        newsSearch.trim() === '' ||
        p.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
        p.summary.toLowerCase().includes(newsSearch.toLowerCase()) ||
        p.content.toLowerCase().includes(newsSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [posts, subNewsFilter, newsSearch]);

  // Featured article spotlight
  const featuredArticle = useMemo(() => {
    return posts.find(p => p.isFeatured) || posts[0] || null;
  }, [posts]);

  // Filtered notes sorted by pinned first
  const filteredNotes = useMemo(() => {
    const q = noteSearchQuery.toLowerCase();
    const list = notes.filter(n => 
      n.title.toLowerCase().includes(q) || 
      n.content.toLowerCase().includes(q) || 
      n.category.toLowerCase().includes(q)
    );
    return list.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [notes, noteSearchQuery]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 animate-in fade-in duration-200">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-blue-500/40 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP HEADER SECTION */}
      {/* ========================================================================= */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xs'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Newsroom &amp; Intelligence Hub
              </h1>
              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                · Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Curated market dispatches, changelog updates, customizable digest frequencies, offline financial notes, and portfolio holding intelligence.
            </p>
          </div>

          {/* Quick Status / Mode Pill */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {activeArticle ? (
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Dispatches</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 dark:text-slate-400">Digest Tier:</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('pro_schedule')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    deliveryTier === 'pro'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : isLight ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>{deliveryTier === 'pro' ? `Weekly (${deliveryDay})` : 'Monthly (1st)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRIMARY 4-PILLAR NAVIGATION TABS */}
        {/* ========================================================================= */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Tab 1: News & Updates */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('news_updates');
              setActiveArticle(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'news_updates'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>News &amp; Updates</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              activeTab === 'news_updates' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {posts.length}
            </span>
          </button>

          {/* Tab 2: Pro Digest Schedule */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('pro_schedule');
              setActiveArticle(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'pro_schedule'
                ? 'bg-amber-500 text-white shadow-xs'
                : isLight 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Pro Digest Schedule</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              activeTab === 'pro_schedule' ? 'bg-white/20 text-white' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            }`}>
              {deliveryTier === 'pro' ? 'Weekly' : 'Monthly'}
            </span>
          </button>

          {/* Tab 3: Notes / Notepad */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('notepad');
              setActiveArticle(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'notepad'
                ? 'bg-emerald-600 text-white shadow-xs'
                : isLight 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Financial Notepad</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              activeTab === 'notepad' ? 'bg-white/20 text-white' : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            }`}>
              {notes.length}
            </span>
          </button>

          {/* Tab 4: Holding News (Coming Soon) */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('holding_news');
              setActiveArticle(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'holding_news'
                ? 'bg-indigo-600 text-white shadow-xs'
                : isLight 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Holding News</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
              activeTab === 'holding_news' ? 'bg-white/20 text-white' : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
            }`}>
              Coming Soon
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. NEWS & UPDATES SECTION                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'news_updates' && (
        <div className="space-y-6">
          {activeArticle ? (
            /* ======================================================================= */
            /* SINGLE ARTICLE FULL DISPATCH VIEW                                      */
            /* ======================================================================= */
            <article className={`p-6 sm:p-10 rounded-2xl border space-y-6 animate-in fade-in duration-200 ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xs'
            }`}>
              <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                {/* Zero-Pill Metadata Line */}
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">{activeArticle.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{activeArticle.readTimeMinutes || 3} min read</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(activeArticle.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {activeArticle.title}
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Published by {activeArticle.author}
                </p>
              </div>

              {/* Lead Summary */}
              <div className={`p-4 rounded-xl border text-sm font-medium leading-relaxed ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                {activeArticle.summary}
              </div>

              {/* Full Body Text */}
              <div className="text-sm leading-relaxed space-y-4 whitespace-pre-line text-slate-700 dark:text-slate-200 font-normal">
                {activeArticle.content}
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to news feed</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast('Dispatch link copied to clipboard!');
                  }}
                  className="px-4 py-2 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 text-slate-600 dark:text-slate-300"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Dispatch</span>
                </button>
              </div>
            </article>
          ) : (
            <>
              {/* SUB-NEWS FILTER STRIP & SEARCH BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Segmented Category Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {[
                    { id: 'all', label: 'All Sub-News' },
                    { id: 'Feature Release', label: 'Feature Releases' },
                    { id: 'Market News', label: 'Market News' },
                    { id: 'Platform Update', label: 'Platform Updates' },
                    { id: 'Personal Finance', label: 'Personal Finance' },
                  ].map(tab => {
                    const isSelected = subNewsFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSubNewsFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                            : isLight 
                            ? 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={newsSearch}
                    onChange={e => setNewsSearch(e.target.value)}
                    placeholder="Search dispatches & releases..."
                    className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* FEATURED SPOTLIGHT CARD (when viewing 'all' and no search) */}
              {subNewsFilter === 'all' && newsSearch.trim() === '' && featuredArticle && (
                <div 
                  onClick={() => setActiveArticle(featuredArticle)}
                  className={`p-6 sm:p-8 rounded-2xl border transition-all cursor-pointer group space-y-3 ${
                    isLight 
                      ? 'bg-gradient-to-br from-blue-50/50 via-white to-white border-blue-200 hover:border-blue-400' 
                      : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 hover:border-blue-500/50'
                  }`}
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Featured Spotlight</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredArticle.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{featuredArticle.readTimeMinutes || 3} min read</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {featuredArticle.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {featuredArticle.summary}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>By {featuredArticle.author}</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read full report <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              )}

              {/* ARTICLES GRID */}
              {filteredPosts.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-40" />
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">No articles match your search criteria</h4>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the sub-news filter or clearing keywords.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => setActiveArticle(post)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 group ${
                        isLight 
                          ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xs'
                      }`}
                    >
                      {/* Zero-Pill Metadata */}
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{post.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{post.readTimeMinutes || 3} min</span>
                        </div>
                        <span className="font-mono tabular-nums text-[11px] text-slate-400">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {post.summary}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span>By {post.author}</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Read dispatch <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRO DIGEST SCHEDULE & FREQUENCY SECTION                                 */}
      {/* ========================================================================= */}
      {activeTab === 'pro_schedule' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Policy Banner */}
          <div className={`p-6 sm:p-8 rounded-2xl border ${
            isLight 
              ? 'bg-gradient-to-r from-amber-50/80 via-white to-white border-amber-200' 
              : 'bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/30'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Crown className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    News Digest Frequency &amp; Delivery Schedule
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                    Pro Engine
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                  <strong>Zero Daily Spam Guarantee:</strong> Daily blasts are intentionally prohibited to protect your focus. Normal users receive a curated <strong>Monthly digest</strong> on the 1st. Upgrading to <strong>Pro</strong> unlocks <strong>Weekly digests</strong> where you choose the exact day of the week to receive the session summary.
                </p>
              </div>
            </div>
          </div>

          {/* TIER COMPARISON & TOGGLE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard Tier Card */}
            <div className={`p-6 rounded-2xl border transition-all space-y-4 ${
              deliveryTier === 'normal'
                ? isLight ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-300' : 'bg-slate-900 border-blue-500/50 ring-1 ring-blue-500/40'
                : isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Tier 1</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Normal User</h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Included</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span><strong>Monthly Once</strong> digest cycle</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>Dispatched on 1st of every month</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Custom delivery day selection locked</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUpdateSchedule('normal')}
                className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  deliveryTier === 'normal'
                    ? 'bg-blue-600 text-white'
                    : isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {deliveryTier === 'normal' ? 'Current Active Tier' : 'Switch to Normal Plan'}
              </button>
            </div>

            {/* Pro Tier Card */}
            <div className={`p-6 rounded-2xl border transition-all space-y-4 ${
              deliveryTier === 'pro'
                ? isLight ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300' : 'bg-slate-900 border-amber-500/50 ring-1 ring-amber-500/40'
                : isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-amber-500">Tier 2 · Unlocked</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pro Subscriber</h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-500">Weekly Flex</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span><strong>Weekly Once</strong> digest frequency</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span><strong>Choose your delivery day</strong> (Mon - Sun)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Early access to holding stock &amp; MF alerts</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUpdateSchedule('pro')}
                className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  deliveryTier === 'pro'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:opacity-95'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{deliveryTier === 'pro' ? 'Current Active Tier' : 'Upgrade to Pro'}</span>
              </button>
            </div>
          </div>

          {/* DAY OF THE WEEK SELECTOR */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Preferred Delivery Day (Pro Weekly Schedule)
                </h4>
                <p className="text-xs text-slate-500">
                  {deliveryTier === 'pro' 
                    ? `Your weekly market & holding digest will be compiled every ${deliveryDay}.` 
                    : 'Locked for Normal tier. Upgrading to Pro enables custom day selection.'}
                </p>
              </div>

              {deliveryTier === 'normal' && (
                <span className="text-[11px] font-mono text-amber-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Locked to 1st of month</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {deliveryDays.map(day => {
                const isSelected = deliveryDay === day && deliveryTier === 'pro';
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={deliveryTier === 'normal'}
                    onClick={() => handleUpdateSchedule('pro', day)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                      deliveryTier === 'normal'
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                        : isSelected
                        ? 'bg-amber-500 text-white shadow-xs font-bold ring-2 ring-amber-400/50'
                        : isLight 
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200' 
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-inherit opacity-80">{day.slice(0, 3)}</span>
                    <span className="font-bold">{day}</span>
                  </button>
                );
              })}
            </div>

            {/* Timing Options */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Dispatch Broadcast Window:
              </span>
              <div className="flex items-center gap-2">
                {['08:00 AM IST (Morning)', '07:00 PM IST (Evening)'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleUpdateDeliveryTime(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      preferredDeliveryTime === t
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FINANCIAL NOTEPAD SECTION                                              */}
      {/* ========================================================================= */}
      {activeTab === 'notepad' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Header Action Bar */}
          <div className={`p-6 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Financial Notepad &amp; Investment Scratchpad</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Private offline memo board for investment thesis, SIP rebalancing plans, stock watchlists, and tax deductions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsEditingNote(true);
                  setActiveEditingNoteId(null);
                  setNoteTitle('');
                  setNoteContent('');
                  setNoteCategory('Stock Idea');
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write New Memo</span>
              </button>
            </div>
          </div>

          {/* Form Editor when active */}
          {isEditingNote && (
            <form 
              onSubmit={handleSaveNote}
              className={`p-6 rounded-2xl border space-y-4 animate-in fade-in ${
                isLight ? 'bg-slate-50 border-emerald-200' : 'bg-slate-950 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-emerald-500" />
                  <span>{activeEditingNoteId ? 'Edit Memo' : 'Create New Investment Memo'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Memo Subject / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                    placeholder="e.g. Parag Parikh SIP allocation or Tax 80C check"
                    className={`w-full px-3.5 py-2 rounded-lg border text-xs ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category Tag
                  </label>
                  <select
                    value={noteCategory}
                    onChange={e => setNoteCategory(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold ${
                      isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                    }`}
                  >
                    <option value="Stock Idea">Stock Idea</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Tax Plan">Tax Plan</option>
                    <option value="Market Memo">Market Memo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Memo Details
                </label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={e => setNoteContent(e.target.value)}
                  placeholder="Record your entry price triggers, asset allocation adjustments, or questions for quarterly review..."
                  className={`w-full p-3.5 rounded-lg border text-xs leading-relaxed font-sans ${
                    isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Memo</span>
                </button>
              </div>
            </form>
          )}

          {/* Search bar & count */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={noteSearchQuery}
                onChange={e => setNoteSearchQuery(e.target.value)}
                placeholder="Search memos..."
                className={`w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>

            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {filteredNotes.length} saved memo{filteredNotes.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-40" />
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No memos found</h4>
              <p className="text-xs text-slate-400 mt-1">Click "Write New Memo" to keep track of your stock ideas and SIP goals.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map(note => (
                <div 
                  key={note.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                    note.isPinned
                      ? isLight ? 'bg-amber-50/40 border-amber-300' : 'bg-slate-900 border-amber-500/40'
                      : isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{note.category}</span>
                        {note.isPinned && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                              <Pin className="w-3 h-3 fill-amber-500" /> Pinned
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePinNote(note.id)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            note.isPinned ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={note.isPinned ? 'Unpin memo' : 'Pin memo to top'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyNote(`${note.title}\n\n${note.content}`)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="Copy memo"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditNote(note)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-500 cursor-pointer"
                          title="Edit memo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete memo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {note.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                    Updated {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. HOLDING NEWS (STOCKS & MUTUAL FUNDS • PRO • COMING SOON)                 */}
      {/* ========================================================================= */}
      {activeTab === 'holding_news' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Main Hero Header */}
          <div className={`p-6 sm:p-8 rounded-2xl border relative overflow-hidden ${
            isLight 
              ? 'bg-gradient-to-br from-indigo-50/70 via-white to-white border-indigo-200' 
              : 'bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-900 border-indigo-500/30'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-inherit/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Portfolio Holding News (Stocks &amp; Mutual Funds)
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/30">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Personalized stock &amp; mutual fund intelligence streamed into your active session based on assets registered in your vault.
                  </p>
                </div>
              </div>

              {/* Notify / Waitlist Button */}
              <button
                type="button"
                onClick={() => {
                  setIsHoldingNewsNotified(true);
                  localStorage.setItem('app_holding_news_waitlist', 'true');
                  showToast('Registered for early access to Holding News alerts!');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs self-start sm:self-auto cursor-pointer ${
                  isHoldingNewsNotified
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isHoldingNewsNotified ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Early Access Reserved</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify Me On Release</span>
                  </>
                )}
              </button>
            </div>

            {/* Current Vault Asset Tagging */}
            <div className="pt-4 space-y-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-blue-500" />
                <span>Your Assets Scheduled for Holding News Monitoring ({userStockAndMfHoldings.length}):</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {userStockAndMfHoldings.length > 0 ? (
                  userStockAndMfHoldings.map((h, i) => (
                    <span 
                      key={h.id || i}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{h.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({h.category})</span>
                    </span>
                  ))
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      Reliance Industries (Stock)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      HDFC Bank Ltd (Stock)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      Parag Parikh Flexi Cap Fund (Mutual Fund)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      Nifty 50 Index Fund (ETF)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PREVIEW STREAM OF UPCOMING HOLDING NEWS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Holdings News Prototype Preview</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">· Live Session Simulator</span>
              </h3>
              <span className="text-xs text-slate-400">Streamed from active session</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  ticker: 'RELIANCE',
                  type: 'Holding Stock',
                  title: 'Reliance Industries: Retail Outlets Expansion & Clean Energy Capex',
                  snippet: 'Reliance retail operations recorded 18% YoY growth in footfall, while new energy gigafactory timelines remain on track for Q4.',
                  time: '2 hours ago',
                  tagColor: 'text-blue-600 dark:text-blue-400'
                },
                {
                  ticker: 'HDFCBANK',
                  type: 'Holding Stock',
                  title: 'HDFC Bank: Net Interest Margin Expansion & Credit Quality Stability',
                  snippet: 'HDFC Bank quarterly updates highlight retail deposit growth outstripping credit expansion, improving liquidity coverage ratios.',
                  time: '5 hours ago',
                  tagColor: 'text-emerald-600 dark:text-emerald-400'
                },
                {
                  ticker: 'PPFAS',
                  type: 'Holding Mutual Fund',
                  title: 'Parag Parikh Flexi Cap Fund: Cash Allocation & Portfolio Update',
                  snippet: 'Fund manager disclosure details cash deployment into large-cap Indian technology and banking leaders during market consolidations.',
                  time: '1 day ago',
                  tagColor: 'text-purple-600 dark:text-purple-400'
                },
                {
                  ticker: 'NIFTYBEES',
                  type: 'Holding ETF',
                  title: 'Nifty 50 Index ETF: FII & DII Inflows Reach Record Monthly Tally',
                  snippet: 'Systematic investment plan (SIP) book in India hit record high of ₹24,000+ crore/month, providing continuous market floor.',
                  time: '2 days ago',
                  tagColor: 'text-amber-600 dark:text-amber-400'
                }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all space-y-2.5 ${
                    isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className={`font-semibold ${item.tagColor}`}>
                      {item.ticker} · {item.type}
                    </span>
                    <span className="font-mono tabular-nums text-[11px] text-slate-400">{item.time}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.snippet}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-medium text-indigo-500">Portfolio-Linked Dispatch</span>
                    <span>Preview Only</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
