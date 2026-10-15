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
  Info,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Landmark,
  Smartphone,
  MessageSquare,
  Bot,
  ThumbsUp,
  Layers,
  Radio,
  ArrowUpRight
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { AppNewsPost, UpcomingFeature, UpcomingFeatureCategory, UpcomingFeatureStatus } from '../../types';
import { 
  fetchNewsPosts, 
  publishNewsPost, 
  fetchUpcomingFeatures, 
  voteUpcomingFeature, 
  requestEarlyAccessFeature,
  SEED_UPCOMING_FEATURES
} from '../../services/firebase';
import { ADMIN_IMAGE_PRESETS } from './AdminPanelView';

// Reliable category-based fintech fallback banners
const getCategoryFallbackImage = (category: string) => {
  switch (category) {
    case 'Feature Release':
    case 'New Features':
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
    case 'Blog':
      return 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80';
    case 'Market News':
      return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80';
    case 'Personal Finance':
      return 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80';
    case 'Platform Update':
      return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80';
    case 'Holdings News':
      return 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80';
    default:
      return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
  }
};

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

type NewsMainTab = 'news_updates' | 'upcoming_features' | 'holding_news' | 'pro_schedule' | 'notepad';

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

  // Upcoming Features & Roadmap State
  const [upcomingFeatures, setUpcomingFeatures] = useState<UpcomingFeature[]>(SEED_UPCOMING_FEATURES);
  const [isFeaturesLoading, setIsFeaturesLoading] = useState(true);
  const [featuresFilter, setFeaturesFilter] = useState<string>('all');
  const [featuresStatusFilter, setFeaturesStatusFilter] = useState<string>('all');
  const [featuresSearch, setFeaturesSearch] = useState('');
  const [votedIds, setVotedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('app_user_voted_features');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [earlyAccessRequestedIds, setEarlyAccessRequestedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('app_user_early_access_features');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Target 5 Upcoming Features explicitly structured to map to Firestore Database:
  // 1. Real-time UPI Integration
  // 2. Bank/Demat account syncing
  // 3. WhatsApp/Telegram AI integration
  // 4. Live AI Financial Advisor
  // 5. Real-time stock news
  const primaryUpcomingFeatures = useMemo(() => {
    const targetTitles = [
      'Real-time UPI Integration',
      'Bank/Demat account syncing',
      'WhatsApp/Telegram AI integration',
      'Live AI Financial Advisor',
      'Real-time stock news'
    ];
    const results: UpcomingFeature[] = [];
    for (const title of targetTitles) {
      const found = upcomingFeatures.find(f => 
        f.title.toLowerCase() === title.toLowerCase() || 
        f.title.toLowerCase().includes(title.toLowerCase())
      ) || SEED_UPCOMING_FEATURES.find(s => 
        s.title.toLowerCase() === title.toLowerCase() || 
        s.title.toLowerCase().includes(title.toLowerCase())
      );
      if (found) {
        results.push(found);
      }
    }
    return results;
  }, [upcomingFeatures]);

  const handleOpenFeatureArticle = (featTitle: string) => {
    const match = posts.find(p => 
      p.title.toLowerCase().includes(featTitle.toLowerCase()) || 
      featTitle.toLowerCase().includes(p.title.toLowerCase())
    );
    if (match) {
      setActiveArticle(match);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const roadmapPost = posts.find(p => p.id === 'post-roadmap-upcoming-features-2027') || posts[0];
      if (roadmapPost) {
        setActiveArticle(roadmapPost);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Admin direct feature release & blog authoring state
  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'sudharsan014@gamil.com' || currentUser?.email === 'sudharsan014@gmail.com' || currentUser?.email === 'sudharsanm014@gmail.com';
  const [isAdminCreateOpen, setIsAdminCreateOpen] = useState(false);
  const [adminPostTitle, setAdminPostTitle] = useState('');
  const [adminPostCategory, setAdminPostCategory] = useState<AppNewsPost['category']>('Feature Release');
  const [adminPostSummary, setAdminPostSummary] = useState('');
  const [adminPostContent, setAdminPostContent] = useState('');
  const [adminPostImageUrl, setAdminPostImageUrl] = useState('');
  const [adminPostImageCaption, setAdminPostImageCaption] = useState('');
  const [adminPostReadTime, setAdminPostReadTime] = useState('3');
  const [adminImageMode, setAdminImageMode] = useState<'url' | 'upload' | 'preset'>('url');
  const [isPublishingDirect, setIsPublishingDirect] = useState(false);

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

  // Fetch upcoming roadmap features
  useEffect(() => {
    async function loadUpcoming() {
      setIsFeaturesLoading(true);
      try {
        const data = await fetchUpcomingFeatures();
        setUpcomingFeatures(data);
      } catch (err) {
        console.warn('Error loading upcoming features:', err);
      } finally {
        setIsFeaturesLoading(false);
      }
    }
    loadUpcoming();
  }, []);

  const handleVoteFeature = async (featureId: string) => {
    const userId = currentUser?.id || 'guest_user';
    const isCurrentlyVoted = votedIds.includes(featureId);
    const newVoted = isCurrentlyVoted 
      ? votedIds.filter(id => id !== featureId)
      : [...votedIds, featureId];
    
    setVotedIds(newVoted);
    localStorage.setItem('app_user_voted_features', JSON.stringify(newVoted));

    // Optimistic UI update
    setUpcomingFeatures(prev => prev.map(f => {
      if (f.id === featureId) {
        return {
          ...f,
          votesCount: Math.max(0, f.votesCount + (isCurrentlyVoted ? -1 : 1))
        };
      }
      return f;
    }));

    try {
      await voteUpcomingFeature(featureId, userId);
      showToast(isCurrentlyVoted ? 'Upvote removed' : 'Thanks for upvoting! Your feedback shapes our development queue.');
    } catch {
      // ignore
    }
  };

  const handleRequestEarlyAccess = async (feature: UpcomingFeature) => {
    const email = currentUser?.email || 'user@fixwealth.local';
    const isAlreadyRequested = earlyAccessRequestedIds.includes(feature.id);
    
    if (isAlreadyRequested) {
      showToast(`You are already on the priority beta waitlist for "${feature.title}".`);
      return;
    }

    const updated = [...earlyAccessRequestedIds, feature.id];
    setEarlyAccessRequestedIds(updated);
    localStorage.setItem('app_user_early_access_features', JSON.stringify(updated));

    try {
      await requestEarlyAccessFeature(feature.id, email);
      showToast(`🎉 Early beta access registered for "${feature.title}"! You will be notified on launch.`);
    } catch {
      showToast(`🎉 Early beta access registered for "${feature.title}"!`);
    }
  };

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

  // Admin Direct Release Image Upload Handler
  const handleAdminDirectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      showToast('Image file should be under 1.5MB. You can also paste an image URL from Chrome.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAdminPostImageUrl(dataUrl);
      showToast('Image uploaded successfully! Preview updated.');
    };
    reader.readAsDataURL(file);
  };

  // Admin Direct Publish Release / Blog Handler
  const handleAdminPublishDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPostTitle.trim() || !adminPostContent.trim()) {
      showToast('Please provide an article headline and content.');
      return;
    }
    setIsPublishingDirect(true);
    try {
      const created = await publishNewsPost({
        title: adminPostTitle.trim(),
        category: adminPostCategory,
        summary: adminPostSummary.trim() || adminPostContent.slice(0, 140) + '...',
        content: adminPostContent.trim(),
        author: currentUser?.name || 'Sudharsan (Admin)',
        imageUrl: adminPostImageUrl.trim() || undefined,
        imageCaption: adminPostImageCaption.trim() || undefined,
        readTimeMinutes: parseInt(adminPostReadTime) || 3
      });
      setPosts(prev => [created, ...prev]);
      setAdminPostTitle('');
      setAdminPostSummary('');
      setAdminPostContent('');
      setAdminPostImageUrl('');
      setAdminPostImageCaption('');
      setIsAdminCreateOpen(false);
      showToast('New release published successfully with cover image!');
    } catch (err) {
      showToast('Failed to publish article.');
    } finally {
      setIsPublishingDirect(false);
    }
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

          {/* Quick Status / Mode Pill & Admin Action */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
            {isAdmin && !activeArticle && (
              <button
                type="button"
                onClick={() => setIsAdminCreateOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-600/20 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                title="Author new feature release or blog post with cover image"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Release Feature / Blog</span>
              </button>
            )}

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

          {/* Tab 2: Upcoming Features & Roadmap */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('upcoming_features');
              setActiveArticle(null);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === 'upcoming_features'
                ? 'bg-purple-600 text-white shadow-xs'
                : isLight 
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent' 
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Upcoming Features &amp; Roadmap</span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
              activeTab === 'upcoming_features' ? 'bg-white/20 text-white' : 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
            }`}>
              {upcomingFeatures.length}
            </span>
          </button>

          {/* Tab 3: Pro Digest Schedule */}
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
              {/* Cover Banner (if present) */}
              {(activeArticle.imageUrl || getCategoryFallbackImage(activeArticle.category)) && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-sm">
                  <img
                    src={activeArticle.imageUrl || getCategoryFallbackImage(activeArticle.category)}
                    alt={activeArticle.title}
                    className="w-full h-56 sm:h-72 md:h-80 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getCategoryFallbackImage(activeArticle.category);
                    }}
                  />
                  {activeArticle.imageCaption && (
                    <div className="p-3 bg-slate-900/85 backdrop-blur-md text-[11px] text-slate-300 font-mono flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{activeArticle.imageCaption}</span>
                    </div>
                  )}
                </div>
              )}

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
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveArticle(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to news feed</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveArticle(null);
                      setActiveTab('upcoming_features');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-purple-600/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Roadmap &amp; Upvote ({upcomingFeatures.length})</span>
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
              </div>
            </article>
          ) : (
            <>
              {/* UPCOMING ROADMAP & FEATURES SHOWCASE IN NEWS & RELEASE SECTION */}
              <div className={`p-5 sm:p-6 rounded-3xl border transition-all space-y-5 ${
                isLight 
                  ? 'bg-gradient-to-r from-purple-50 via-indigo-50/40 to-blue-50/50 border-purple-200 shadow-sm' 
                  : 'bg-gradient-to-r from-purple-950/30 via-indigo-950/20 to-slate-900 border-purple-500/30 shadow-sm'
              }`}>
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Upcoming Features &amp; Releases</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Firestore DB Mapped: /upcoming_features
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {upcomingFeatures.length} Features in Active Queue
                      </span>
                    </div>

                    <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Upcoming Releases: Real-time UPI, Bank/Demat Sync, WhatsApp/Telegram AI, Live AI Advisor &amp; Real-time Stock News
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Explore our upcoming releases structured for direct database mapping. Upvote features to accelerate priority, join beta waitlists, or review the technical specifications.
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('upcoming_features');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/25 cursor-pointer whitespace-nowrap"
                    >
                      <span>Explore Full Roadmap ({upcomingFeatures.length})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 5 Structured Database-Mapped Upcoming Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-1">
                  {primaryUpcomingFeatures.map(feat => {
                    const isVoted = votedIds.includes(feat.id);
                    const isWaitlisted = earlyAccessRequestedIds.includes(feat.id);

                    // Dynamic icon per feature
                    const renderIcon = () => {
                      if (feat.title.includes('UPI')) return <Smartphone className="w-4 h-4 text-blue-500" />;
                      if (feat.title.includes('Bank') || feat.title.includes('Demat')) return <Landmark className="w-4 h-4 text-emerald-500" />;
                      if (feat.title.includes('WhatsApp') || feat.title.includes('Telegram')) return <MessageSquare className="w-4 h-4 text-emerald-400" />;
                      if (feat.title.includes('Advisor')) return <Sparkles className="w-4 h-4 text-purple-400" />;
                      return <TrendingUp className="w-4 h-4 text-cyan-400" />;
                    };

                    return (
                      <div
                        key={feat.id}
                        className={`p-4 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01] ${
                          isLight 
                            ? 'bg-white/90 border-slate-200/90 shadow-2xs hover:border-purple-300' 
                            : 'bg-slate-900/90 border-slate-800 shadow-2xs hover:border-purple-500/40'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Header: Icon + Category + Target */}
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                              }`}>
                                {renderIcon()}
                              </div>
                              <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                feat.status === 'in_development'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              }`}>
                                {feat.status === 'in_development' ? '● In Dev' : '✦ Beta'}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
                              {feat.targetRelease}
                            </span>
                          </div>

                          {/* Title */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                              {feat.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 mt-1 leading-relaxed">
                              {feat.description}
                            </p>
                          </div>

                          {/* Database Mapped Tags */}
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            {feat.tags.slice(0, 3).map((tag, idx) => (
                              <span 
                                key={idx}
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                  isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3 space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            {/* Upvote Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVoteFeature(feat.id);
                              }}
                              className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                isVoted
                                  ? 'bg-purple-600 text-white shadow-xs'
                                  : isLight
                                  ? 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700'
                                  : 'bg-slate-800 hover:bg-purple-950/50 text-slate-300 hover:text-purple-300'
                              }`}
                              title={isVoted ? "Click to remove upvote" : "Upvote this feature for faster release"}
                            >
                              <ThumbsUp className={`w-3 h-3 ${isVoted ? 'fill-current' : ''}`} />
                              <span>{feat.votesCount}</span>
                            </button>

                            {/* Early Access / Notify Me Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRequestEarlyAccess(feat);
                              }}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                isWaitlisted
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                              }`}
                              title={isWaitlisted ? "You are on the priority beta waitlist" : "Notify me when this feature releases"}
                            >
                              <Bell className="w-3 h-3" />
                              <span>{isWaitlisted ? 'Waitlist' : 'Notify'}</span>
                            </button>
                          </div>

                          {/* Read Spec / Release Blog */}
                          <button
                            type="button"
                            onClick={() => handleOpenFeatureArticle(feat.title)}
                            className="w-full text-center py-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>Read Release Spec</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SUB-NEWS FILTER STRIP & SEARCH BAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Segmented Category Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {[
                    { id: 'all', label: 'All Dispatches' },
                    { id: 'Feature Release', label: '✨ Feature Releases' },
                    { id: 'Blog', label: '📝 Blogs & Deep Dives' },
                    { id: 'Platform Update', label: '🛡️ Platform Updates' },
                    { id: 'Market News', label: '📈 Market News' },
                    { id: 'Personal Finance', label: '💰 Personal Finance' },
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

              {/* FEATURED SPOTLIGHT CARD (IMAGE ON LEFT • TEXT ON RIGHT) */}
              {subNewsFilter === 'all' && newsSearch.trim() === '' && featuredArticle && (
                <div 
                  onClick={() => setActiveArticle(featuredArticle)}
                  className={`p-5 sm:p-7 rounded-2xl border transition-all cursor-pointer group flex flex-col md:flex-row items-stretch gap-6 ${
                    isLight 
                      ? 'bg-gradient-to-br from-blue-50/50 via-white to-white border-blue-200 hover:border-blue-400 shadow-sm' 
                      : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-slate-800 hover:border-blue-500/50 shadow-sm'
                  }`}
                >
                  {/* Image on Left */}
                  <div className="w-full md:w-5/12 min-h-[220px] md:min-h-full rounded-xl overflow-hidden shrink-0 relative bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <img
                      src={featuredArticle.imageUrl || getCategoryFallbackImage(featuredArticle.category)}
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getCategoryFallbackImage(featuredArticle.category);
                      }}
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1.5 shadow-md border border-white/10">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Featured Spotlight</span>
                    </div>
                  </div>

                  {/* Text on Right */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3 py-1">
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{featuredArticle.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{featuredArticle.readTimeMinutes || 3} min read</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(featuredArticle.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight leading-snug">
                        {featuredArticle.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                        {featuredArticle.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>By {featuredArticle.author}</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Read full report <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ALL ARTICLES GRID (STRICT LEFT IMAGE • RIGHT TEXT LAYOUT FOR ALL POSTS) */}
              {filteredPosts.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-40" />
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">No articles match your search criteria</h4>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the sub-news filter or clearing keywords.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {filteredPosts.map(post => {
                    const displayImg = post.imageUrl || getCategoryFallbackImage(post.category);
                    return (
                      <div
                        key={post.id}
                        onClick={() => setActiveArticle(post)}
                        className={`p-4 sm:p-4.5 rounded-2xl border transition-all cursor-pointer group flex flex-col sm:flex-row items-stretch sm:items-center gap-4 ${
                          isLight 
                            ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md' 
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-md'
                        }`}
                      >
                        {/* IMAGE ON LEFT */}
                        <div className="w-full sm:w-44 md:w-48 h-44 sm:h-36 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                          <img
                            src={displayImg}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getCategoryFallbackImage(post.category);
                            }}
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-[9px] font-bold text-white shadow-xs">
                            {post.category}
                          </span>
                        </div>

                        {/* TEXT ON RIGHT */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5 h-full py-0.5">
                          <div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                              <span className="font-mono tabular-nums">{post.readTimeMinutes || 3} min read</span>
                              <span className="font-mono tabular-nums text-slate-400">
                                {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mt-1">
                              {post.title}
                            </h4>

                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-1">
                              {post.summary}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="truncate max-w-[130px]">By {post.author}</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform shrink-0">
                              Read dispatch <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. UPCOMING FEATURES & PRODUCT ROADMAP (COMMUNITY WISHLIST & QUEUE)       */}
      {/* ========================================================================= */}
      {activeTab === 'upcoming_features' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Main Hero Header */}
          <div className={`p-6 sm:p-8 rounded-2xl border relative overflow-hidden ${
            isLight 
              ? 'bg-gradient-to-br from-purple-50/70 via-white to-white border-purple-200 shadow-xs' 
              : 'bg-gradient-to-br from-purple-950/25 via-slate-900 to-slate-900 border-purple-500/30 shadow-xs'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-inherit/40">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-600/25">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Upcoming Features &amp; Product Roadmap
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                      Live Community Queue
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Firestore Sync Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                    Explore planned features: <strong>Real UPI auto-sync</strong>, <strong>Bank Account Aggregator (AA)</strong>, <strong>Demat portfolios (Zerodha, Groww)</strong>, <strong>WhatsApp &amp; Telegram AI companion</strong>, <strong>Universal AI Advisor</strong>, and <strong>Live Company Stock Intelligence</strong>. Upvote features to accelerate their engineering release!
                  </p>
                </div>
              </div>

              {/* Roadmap Key Metrics */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className={`px-3 py-2 rounded-xl border text-center min-w-[90px] ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">In Dev</span>
                  <span className="text-base font-black font-mono text-emerald-500">
                    {upcomingFeatures.filter(f => f.status === 'in_development').length}
                  </span>
                </div>
                <div className={`px-3 py-2 rounded-xl border text-center min-w-[90px] ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Beta Test</span>
                  <span className="text-base font-black font-mono text-purple-400">
                    {upcomingFeatures.filter(f => f.status === 'beta_testing').length}
                  </span>
                </div>
                <div className={`px-3 py-2 rounded-xl border text-center min-w-[90px] ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}>
                  <span className="text-[10px] text-slate-500 block uppercase font-mono">Total Votes</span>
                  <span className="text-base font-black font-mono text-blue-500">
                    {upcomingFeatures.reduce((acc, f) => acc + (f.votesCount || 0), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Filter Bar */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={featuresSearch}
                  onChange={e => setFeaturesSearch(e.target.value)}
                  placeholder="Search roadmap (UPI, Bank, Demat, AI, WhatsApp, CIBIL)..."
                  className={`w-full text-xs pl-8 pr-3 py-2 rounded-xl border transition-colors focus:outline-none ${
                    isLight 
                      ? 'bg-white border-slate-200 focus:border-purple-500 text-slate-900 placeholder:text-slate-400' 
                      : 'bg-slate-900/90 border-slate-800 focus:border-purple-500 text-white placeholder:text-slate-500'
                  }`}
                />
              </div>

              {/* Status Filter Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium text-[11px]">Lifecycle:</span>
                <select
                  value={featuresStatusFilter}
                  onChange={e => setFeaturesStatusFilter(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-800' 
                      : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <option value="all">All Stages ({upcomingFeatures.length})</option>
                  <option value="in_development">In Active Development</option>
                  <option value="beta_testing">Beta Testing &amp; Preview</option>
                  <option value="planned">Planned for 2027</option>
                  <option value="under_research">Under Research</option>
                  <option value="released">Released / Live</option>
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3 text-xs">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'Real Accounts & Banking', label: 'Real Accounts & Banking' },
                { id: 'AI & Messaging', label: 'AI & Messaging Bots' },
                { id: 'AI Advisory', label: 'AI Advisory' },
                { id: 'Market News & Stocks', label: 'Market News & Stocks' },
                { id: 'Credit & Solvency', label: 'Credit & Solvency' },
                { id: 'Tax & Compliance', label: 'Tax & Compliance' },
                { id: 'Security & Infra', label: 'Security & Infra' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFeaturesFilter(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    featuresFilter === cat.id
                      ? 'bg-purple-600 text-white font-bold shadow-xs'
                      : isLight
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Features Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingFeatures
              .filter(f => {
                if (featuresFilter !== 'all' && f.category !== featuresFilter) return false;
                if (featuresStatusFilter !== 'all' && f.status !== featuresStatusFilter) return false;
                if (featuresSearch) {
                  const q = featuresSearch.toLowerCase();
                  const inTitle = f.title.toLowerCase().includes(q);
                  const inDesc = f.description.toLowerCase().includes(q);
                  const inTags = (f.tags || []).some(t => t.toLowerCase().includes(q));
                  return inTitle || inDesc || inTags;
                }
                return true;
              })
              .map(feat => {
                const isVoted = votedIds.includes(feat.id);
                const isWaitlisted = earlyAccessRequestedIds.includes(feat.id);

                // Icon selection
                const getFeatureIcon = () => {
                  switch (feat.category) {
                    case 'Real Accounts & Banking':
                      if (feat.title.includes('UPI')) return <Smartphone className="w-5 h-5 text-blue-500" />;
                      if (feat.title.includes('Demat')) return <Coins className="w-5 h-5 text-amber-500" />;
                      return <Landmark className="w-5 h-5 text-blue-500" />;
                    case 'AI & Messaging':
                      return <MessageSquare className="w-5 h-5 text-emerald-500" />;
                    case 'AI Advisory':
                      return <Bot className="w-5 h-5 text-purple-500" />;
                    case 'Market News & Stocks':
                      return <TrendingUp className="w-5 h-5 text-cyan-500" />;
                    case 'Credit & Solvency':
                      return <ShieldCheck className="w-5 h-5 text-rose-500" />;
                    case 'Tax & Compliance':
                      return <FileText className="w-5 h-5 text-indigo-500" />;
                    case 'Security & Infra':
                      return <ShieldCheck className="w-5 h-5 text-indigo-500" />;
                    default:
                      return <Sparkles className="w-5 h-5 text-purple-500" />;
                  }
                };

                return (
                  <div
                    key={feat.id}
                    className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      isLight 
                        ? 'bg-white border-slate-200 hover:border-purple-300 shadow-2xs hover:shadow-xs' 
                        : 'bg-slate-900 border-slate-800 hover:border-purple-500/50 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges & Target Quarter Row */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Status Badge */}
                          {feat.status === 'in_development' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              In Development
                            </span>
                          )}
                          {feat.status === 'beta_testing' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                              <Sparkles className="w-3 h-3 text-purple-500" />
                              Beta Testing
                            </span>
                          )}
                          {feat.status === 'planned' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3 text-amber-500" />
                              Planned
                            </span>
                          )}
                          {feat.status === 'released' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                              <CheckCircle2 className="w-3 h-3 text-blue-500" />
                              Released
                            </span>
                          )}

                          {/* Target Quarter */}
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                            isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
                          }`}>
                            Target: {feat.targetRelease}
                          </span>
                        </div>

                        {/* Priority / Badge */}
                        {feat.badge && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {feat.badge}
                          </span>
                        )}
                      </div>

                      {/* Title & Icon Header */}
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700'
                        }`}>
                          {getFeatureIcon()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                            {feat.title}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            Category: {feat.category}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {feat.description}
                      </p>

                      {/* Tags */}
                      {feat.tags && feat.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {feat.tags.map(t => (
                            <span 
                              key={t}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                                isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-800/60 text-slate-300 border-slate-700/60'
                              }`}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 border-t border-inherit/30 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {/* Interactive Upvote Button */}
                        <button
                          type="button"
                          onClick={() => handleVoteFeature(feat.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                            isVoted
                              ? 'bg-purple-600 text-white border-purple-500 shadow-xs'
                              : isLight
                              ? 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border-slate-200'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          }`}
                          title={isVoted ? 'Click to remove upvote' : 'Upvote this feature to prioritize it'}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-white' : ''}`} />
                          <span>{isVoted ? 'Upvoted' : 'Upvote'}</span>
                          <span className="opacity-80">({feat.votesCount})</span>
                        </button>

                        {/* Request Early Access Button */}
                        <button
                          type="button"
                          onClick={() => handleRequestEarlyAccess(feat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer border ${
                            isWaitlisted
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : isLight
                              ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                          title="Register for beta testing notification upon release"
                        >
                          {isWaitlisted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>✓ Beta Waitlist</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              <span>Request Beta Access</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Share Link */}
                      <button
                        type="button"
                        onClick={() => {
                          const shareText = `Check out "${feat.title}" coming to FIX Wealth: ${feat.description}`;
                          navigator.clipboard.writeText(shareText);
                          showToast(`Copied details for "${feat.title}" to clipboard!`);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title="Share / Copy feature details"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRO DIGEST SCHEDULE & FREQUENCY SECTION                                 */}
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

      {/* ========================================================================= */}
      {/* ADMIN DIRECT RELEASE / BLOG AUTHORING MODAL (WITH IMAGE ON LEFT & RIGHT TEXT) */}
      {/* ========================================================================= */}
      {isAdminCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Publish Release / Blog (Admin)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Articles display with cover image on the left and text on the right for all users.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAdminCreateOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminPublishDirect} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Headline / Title</label>
                  <input
                    type="text"
                    required
                    value={adminPostTitle}
                    onChange={e => setAdminPostTitle(e.target.value)}
                    placeholder="e.g. Feature Release: Indian Capital Gains & 80C Estimator"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <select
                    value={adminPostCategory}
                    onChange={e => setAdminPostCategory(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                    }`}
                  >
                    <option value="Feature Release">✨ Feature Release</option>
                    <option value="New Features">🚀 New Features &amp; Capabilities</option>
                    <option value="Blog">📝 Editorial Blog / Deep Dive</option>
                    <option value="Platform Update">🛡️ Platform Update</option>
                    <option value="Market News">📈 Market News</option>
                    <option value="Personal Finance">💰 Personal Finance</option>
                    <option value="Holdings News">🔥 Holdings News</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Attachment (Chrome Link / Upload / Preset) */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span>Feature Cover Image (Image on Left • Text on Right)</span>
                  </label>

                  <div className="flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-800 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setAdminImageMode('url')}
                      className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        adminImageMode === 'url' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Chrome Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminImageMode('upload')}
                      className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        adminImageMode === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminImageMode('preset')}
                      className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                        adminImageMode === 'preset' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Presets</span>
                    </button>
                  </div>
                </div>

                {adminImageMode === 'url' && (
                  <div className="space-y-1">
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="url"
                        value={adminPostImageUrl}
                        onChange={e => setAdminPostImageUrl(e.target.value)}
                        placeholder="Paste image link from Chrome (e.g. https://images.unsplash.com/...)"
                        className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs ${
                          isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      💡 Tip: Copy image address from Chrome or any web source.
                    </span>
                  </div>
                )}

                {adminImageMode === 'upload' && (
                  <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed rounded-xl cursor-pointer hover:border-blue-500 transition-colors border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Choose image from your computer / phone
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminDirectImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {adminImageMode === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ADMIN_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAdminPostImageUrl(preset.url);
                          setAdminPostImageCaption(preset.name);
                        }}
                        className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          adminPostImageUrl === preset.url
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-10 h-9 object-cover rounded-md shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold block truncate text-slate-900 dark:text-white">
                            {preset.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Card Preview */}
                {adminPostImageUrl && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      <span>Card Layout Preview:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminPostImageUrl('');
                          setAdminPostImageCaption('');
                        }}
                        className="text-[10px] text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                      >
                        <X className="w-3 h-3" />
                        <span>Clear Image</span>
                      </button>
                    </div>

                    <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center gap-3 ${
                      isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <img
                        src={adminPostImageUrl}
                        alt="Preview"
                        className="w-full sm:w-28 h-20 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                          {adminPostCategory}
                        </span>
                        <h5 className="text-xs font-bold truncate text-slate-900 dark:text-white">
                          {adminPostTitle || 'Sample Feature Headline'}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {adminPostSummary || 'Summary on the right side of the image.'}
                        </p>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={adminPostImageCaption}
                      onChange={e => setAdminPostImageCaption(e.target.value)}
                      placeholder="Optional image caption / credit (e.g. Automated Asset Rebalancing Preview)"
                      className={`w-full px-3 py-1.5 rounded-lg border text-[11px] ${
                        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Summary Lead (1-2 sentences)</label>
                <input
                  type="text"
                  required
                  value={adminPostSummary}
                  onChange={e => setAdminPostSummary(e.target.value)}
                  placeholder="Short engaging lead shown on cards..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Full Body Content</label>
                <textarea
                  required
                  rows={5}
                  value={adminPostContent}
                  onChange={e => setAdminPostContent(e.target.value)}
                  placeholder="Full feature release announcement or blog article text..."
                  className={`w-full p-3 rounded-xl border text-xs leading-relaxed resize-none ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdminCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPublishingDirect || !adminPostTitle.trim() || !adminPostContent.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isPublishingDirect ? 'Publishing...' : 'Publish Feature / Blog'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
