import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  UserCheck, 
  Clock, 
  Laptop, 
  Smartphone, 
  Search, 
  Filter, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  X, 
  BarChart3, 
  Shield, 
  ExternalLink,
  Send,
  Database,
  Copy,
  Bell,
  Radio,
  Newspaper,
  Plus,
  Trash2,
  Edit3,
  CornerDownRight,
  BookOpen,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  TrendingUp,
  Coins,
  Landmark,
  Bot,
  Zap,
  FileText,
  ThumbsUp,
  Layers,
  Save
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { 
  AppUserProfile, 
  AppFeedback, 
  AppBroadcastNotification, 
  AppNewsPost,
  UpcomingFeature,
  UpcomingFeatureCategory,
  UpcomingFeatureStatus
} from '../../types';

// Curated Fintech & Wealth Feature Release Image Presets
export const ADMIN_IMAGE_PRESETS = [
  {
    name: 'Feature Release: Asset Allocator',
    category: 'Feature Release' as const,
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    desc: 'Wealth analytics, KPIs & dynamic graphs'
  },
  {
    name: 'Feature Release: Tax & Capital Gains',
    category: 'Feature Release' as const,
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    desc: 'Tax calculator & Indian slabs'
  },
  {
    name: 'Market News: Trading & Dalal Street',
    category: 'Market News' as const,
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    desc: 'Candlestick graphs & market pulse'
  },
  {
    name: 'Personal Finance: Sovereign Savings',
    category: 'Personal Finance' as const,
    url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    desc: 'Gold coins & savings runway'
  },
  {
    name: 'Platform Security: Encrypted Vault',
    category: 'Platform Update' as const,
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    desc: 'Zero-knowledge client encryption'
  },
  {
    name: 'FIRE Planning & Freedom',
    category: 'Personal Finance' as const,
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    desc: 'Retirement horizon & compounding'
  }
];
import { 
  fetchAllUsers, 
  fetchFeedbackList, 
  replyToUserFeedback, 
  updateFeedbackStatus,
  fetchBroadcastNotifications,
  createBroadcastNotification,
  deleteBroadcastNotification,
  fetchNewsPosts,
  publishNewsPost,
  deleteNewsPost,
  deleteUserAccount,
  purgeNonRealUsers,
  fetchUpcomingFeatures,
  saveUpcomingFeature,
  createUpcomingFeature,
  updateUpcomingFeatureStatus,
  deleteUpcomingFeature,
  seedInitialUpcomingFeatures,
  SEED_UPCOMING_FEATURES,
  db
} from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const AdminPanelView: React.FC = () => {
  const { theme, formatMoney } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const { currentUser } = useAuth();

  // Admin Sub-tabs
  const [adminTab, setAdminTab] = useState<'users' | 'feedback' | 'broadcast' | 'news' | 'upcoming_features'>('users');

  // Data states
  const [users, setUsers] = useState<AppUserProfile[]>([]);
  const [feedbackList, setFeedbackList] = useState<AppFeedback[]>([]);
  const [notifications, setNotifications] = useState<AppBroadcastNotification[]>([]);
  const [newsPosts, setNewsPosts] = useState<AppNewsPost[]>([]);
  const [upcomingFeatures, setUpcomingFeatures] = useState<UpcomingFeature[]>(SEED_UPCOMING_FEATURES);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upcoming Features Tab State & Form
  const [featuresFilter, setFeaturesFilter] = useState<string>('all');
  const [featuresStatusFilter, setFeaturesStatusFilter] = useState<string>('all');
  const [featuresSearchQuery, setFeaturesSearchQuery] = useState('');
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<UpcomingFeature | null>(null);
  const [featTitle, setFeatTitle] = useState('');
  const [featDesc, setFeatDesc] = useState('');
  const [featCategory, setFeatCategory] = useState<UpcomingFeatureCategory>('Real Accounts & Banking');
  const [featStatus, setFeatStatus] = useState<UpcomingFeatureStatus>('in_development');
  const [featQuarter, setFeatQuarter] = useState('Q2 2027');
  const [featPriority, setFeatPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [featTags, setFeatTags] = useState('');
  const [featBadge, setFeatBadge] = useState('');
  const [featVotes, setFeatVotes] = useState('100');
  const [isSavingFeature, setIsSavingFeature] = useState(false);

  // Users Tab Search & Filter
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Feedback Tab Filter & Reply Modal
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | string>('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<'all' | string>('all');
  const [replyingFeedback, setReplyingFeedback] = useState<AppFeedback | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Broadcast Notification Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<AppBroadcastNotification['type']>('new_feature');
  const [notifBadge, setNotifBadge] = useState('New Release');
  const [notifImageUrl, setNotifImageUrl] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // News Post Form State
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<AppNewsPost['category']>('Feature Release');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsReadTime, setNewsReadTime] = useState('3');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsImageCaption, setNewsImageCaption] = useState('');
  const [newsImageUploadMode, setNewsImageUploadMode] = useState<'url' | 'upload' | 'preset'>('url');
  const [isPublishingNews, setIsPublishingNews] = useState(false);

  // Load all admin data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [u, f, n, p, feats] = await Promise.all([
        fetchAllUsers(),
        fetchFeedbackList(),
        fetchBroadcastNotifications(),
        fetchNewsPosts(),
        fetchUpcomingFeatures()
      ]);
      setUsers(u);
      setFeedbackList(f);
      setNotifications(n);
      setNewsPosts(p);
      setUpcomingFeatures(feats);
    } catch (err) {
      console.warn("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Feature Roadmap Handlers
  const handleOpenCreateFeature = () => {
    setEditingFeature(null);
    setFeatTitle('');
    setFeatDesc('');
    setFeatCategory('Real Accounts & Banking');
    setFeatStatus('in_development');
    setFeatQuarter('Q2 2027');
    setFeatPriority('high');
    setFeatTags('');
    setFeatBadge('');
    setFeatVotes('100');
    setIsFeatureModalOpen(true);
  };

  const handleOpenEditFeature = (feat: UpcomingFeature) => {
    setEditingFeature(feat);
    setFeatTitle(feat.title);
    setFeatDesc(feat.description);
    setFeatCategory(feat.category);
    setFeatStatus(feat.status);
    setFeatQuarter(feat.targetRelease);
    setFeatPriority(feat.priority);
    setFeatTags((feat.tags || []).join(', '));
    setFeatBadge(feat.badge || '');
    setFeatVotes(String(feat.votesCount || 0));
    setIsFeatureModalOpen(true);
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featTitle.trim() || !featDesc.trim()) {
      showToast('Please provide a feature title and description.');
      return;
    }

    setIsSavingFeature(true);
    try {
      const parsedTags = featTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      if (editingFeature) {
        const updated: UpcomingFeature = {
          ...editingFeature,
          title: featTitle.trim(),
          description: featDesc.trim(),
          category: featCategory,
          status: featStatus,
          targetRelease: featQuarter.trim() || '2027',
          priority: featPriority,
          votesCount: parseInt(featVotes) || 0,
          tags: parsedTags,
          badge: featBadge.trim() || undefined,
          updatedAt: new Date().toISOString()
        };
        await saveUpcomingFeature(updated);
        setUpcomingFeatures(prev => prev.map(f => f.id === updated.id ? updated : f));
        showToast(`Feature "${updated.title}" updated in Firestore DB!`);
      } else {
        const created = await createUpcomingFeature({
          title: featTitle.trim(),
          description: featDesc.trim(),
          category: featCategory,
          status: featStatus,
          targetRelease: featQuarter.trim() || '2027',
          priority: featPriority,
          votesCount: parseInt(featVotes) || 0,
          tags: parsedTags,
          badge: featBadge.trim() || undefined
        });
        setUpcomingFeatures(prev => [created, ...prev]);
        showToast(`New feature "${created.title}" stored in Firestore DB!`);
      }
      setIsFeatureModalOpen(false);
    } catch (err) {
      showToast('Error saving feature to database.');
    } finally {
      setIsSavingFeature(false);
    }
  };

  const handleQuickStatusChange = async (featId: string, newStatus: UpcomingFeatureStatus) => {
    try {
      await updateUpcomingFeatureStatus(featId, newStatus);
      setUpcomingFeatures(prev => prev.map(f => f.id === featId ? { ...f, status: newStatus } : f));
      showToast(`Feature status updated to "${newStatus.replace('_', ' ').toUpperCase()}".`);
    } catch (err) {
      showToast('Error updating feature status.');
    }
  };

  const handleDeleteFeature = async (featId: string, featTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${featTitle}" from the roadmap?`)) return;
    try {
      await deleteUpcomingFeature(featId);
      setUpcomingFeatures(prev => prev.filter(f => f.id !== featId));
      showToast(`Feature "${featTitle}" deleted from database.`);
    } catch (err) {
      showToast('Error deleting feature.');
    }
  };

  const handleSeedDefaultRoadmap = async () => {
    setIsLoading(true);
    try {
      const seeded = await seedInitialUpcomingFeatures();
      setUpcomingFeatures(seeded);
      showToast(`All ${seeded.length} upcoming roadmap features seeded to Firestore Database!`);
    } catch (err) {
      showToast('Error seeding roadmap features.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishFeatureAsReleaseBlog = (feat: UpcomingFeature) => {
    setNewsTitle(`Feature Release: ${feat.title}`);
    setNewsCategory('Feature Release');
    setNewsSummary(feat.description);
    setNewsContent(
      `We are thrilled to officially announce the release of **${feat.title}** on FIX Wealth!\n\n` +
      `### What This Delivers\n${feat.description}\n\n` +
      `### Key Capabilities\n` +
      (feat.tags && feat.tags.length > 0 
        ? feat.tags.map(t => `- ${t}`).join('\n') 
        : '- Real-time automated data integration\n- Zero-knowledge client-side encryption\n- Seamless wealth dashboard integration') +
      `\n\n### Access\nThis feature is now active and accessible directly across your wealth command center.`
    );
    setIsCreatingNews(true);
    setAdminTab('news');
    showToast(`Pre-populated Release Blog form for "${feat.title}". Review and click "Publish Article"!`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle user role between admin and user
  const handleToggleUserRole = async (targetUser: AppUserProfile) => {
    const newRole: 'admin' | 'user' = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', targetUser.id), { role: newRole });
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      showToast(`Updated role for ${targetUser.name} to ${newRole.toUpperCase()}`);
    } catch (err) {
      // Fallback update in state
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      showToast(`Updated role for ${targetUser.name} to ${newRole.toUpperCase()} (local cache)`);
    }
  };

  // Delete user permanently from Firestore database and UI
  const handleDeleteUser = async (targetUser: AppUserProfile) => {
    if (targetUser.email === 'sudharsan014@gamil.com' || targetUser.email === 'sudharsan014@gmail.com' || targetUser.email === 'sudharsanm014@gmail.com') {
      showToast('The Master Administrator account cannot be deleted.');
      return;
    }
    try {
      await deleteUserAccount(targetUser.id);
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
      showToast(`User ${targetUser.name} deleted from database and UI.`);
    } catch (err) {
      setUsers(prev => prev.filter(u => u.id !== targetUser.id));
      showToast(`User ${targetUser.name} removed from list.`);
    }
  };

  // Purge all fake / non-real users from Firestore database and UI
  const handlePurgeNonRealUsers = async () => {
    try {
      const remaining = await purgeNonRealUsers();
      setUsers(remaining);
      showToast('Purged all non-real accounts. Only Admin and demo.wealthtracker.com remain.');
    } catch (err) {
      showToast('Purge complete.');
    }
  };

  // Handler: Send Reply to User Feedback
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingFeedback || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      await replyToUserFeedback(replyingFeedback.id, replyText.trim());
      showToast(`Reply sent to ${replyingFeedback.userName}!`);
      setReplyingFeedback(null);
      setReplyText('');
      await loadAllData();
    } catch (err) {
      showToast('Error sending reply.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Handler: Local image upload via file reader
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setNewsImageUrl(dataUrl);
      showToast('Image uploaded successfully! Preview shown below.');
    };
    reader.readAsDataURL(file);
  };

  // Handler: Create Broadcast Notification
  const handleCreateBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setIsBroadcasting(true);
    try {
      const created = await createBroadcastNotification({
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: notifType,
        badge: notifBadge.trim() || 'New',
        imageUrl: notifImageUrl.trim() || undefined,
        createdBy: currentUser?.name || 'Admin'
      });
      setNotifications(prev => [created, ...prev]);
      setNotifTitle('');
      setNotifMessage('');
      setNotifImageUrl('');
      showToast('Notification broadcasted to all users!');
    } catch (err) {
      showToast('Error broadcasting notification.');
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Handler: Publish News Post
  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    setIsPublishingNews(true);
    try {
      const created = await publishNewsPost({
        title: newsTitle.trim(),
        category: newsCategory,
        summary: newsSummary.trim() || newsContent.slice(0, 140) + '...',
        content: newsContent.trim(),
        author: currentUser?.name || 'Sudharsan (Admin)',
        imageUrl: newsImageUrl.trim() || undefined,
        imageCaption: newsImageCaption.trim() || undefined,
        readTimeMinutes: parseInt(newsReadTime) || 3
      });
      setNewsPosts(prev => [created, ...prev]);
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setNewsImageUrl('');
      setNewsImageCaption('');
      setIsCreatingNews(false);
      showToast('Article published to News & Blog CMS with featured image!');
    } catch (err) {
      showToast('Error publishing article.');
    } finally {
      setIsPublishingNews(false);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        (u.deviceInfo && u.deviceInfo.toLowerCase().includes(userSearchQuery.toLowerCase()));
      const matchesRole = userRoleFilter === 'all' 
        ? true 
        : userRoleFilter === 'admin' 
        ? u.role === 'admin'
        : u.role === 'user';
      return matchesSearch && matchesRole;
    });
  }, [users, userSearchQuery, userRoleFilter]);

  // Filtered Feedback List
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter(f => {
      const matchesCat = feedbackCategoryFilter === 'all' || f.category === feedbackCategoryFilter;
      const matchesStatus = feedbackStatusFilter === 'all' || f.status === feedbackStatusFilter;
      return matchesCat && matchesStatus;
    });
  }, [feedbackList, feedbackCategoryFilter, feedbackStatusFilter]);

  const formatLastSeen = (isoString?: string) => {
    if (!isoString) return 'Never logged in';
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 2) return 'Active just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-emerald-500/40 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: 2-Tier Master Admin Panel */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Master Administration Panel
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
                2-Tier RBAC (Admin &amp; User)
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Manage registered user accounts, track last seen logins, read &amp; reply to feedback, and broadcast feature notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={loadAllData}
            className="p-2 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Refresh All Database Records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* DATABASE CONSOLE BANNER */}
      <div className={`p-5 rounded-3xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLight ? 'bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border-blue-200' : 'bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-500/25'
      }`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Google Cloud Firestore Database
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected &amp; Active</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
                100% Free Tier (Spark Plan • $0.00)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Database: <strong>ai-studio-wealthtracker-6f01937e-d30e-4033-8b3e-464e81a3e270</strong> • Project: <strong>imagined-hash-fxtlg</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <a
            href="https://console.firebase.google.com/project/imagined-hash-fxtlg/firestore/databases/ai-studio-wealthtracker-6f01937e-d30e-4033-8b3e-464e81a3e270/data"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>Open Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 4 MAIN ADMIN TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'users'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Accounts &amp; Last Seen ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'feedback'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback &amp; Replies ({feedbackList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'broadcast'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Broadcast Feature Alerts ({notifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('news')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'news'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
              : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>News &amp; Blog CMS ({newsPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('upcoming_features')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            adminTab === 'upcoming_features'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25'
              : isLight ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200' : 'bg-purple-950/40 text-purple-300 hover:bg-purple-900/50 border border-purple-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Upcoming Features &amp; DB ({upcomingFeatures.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS DIRECTORY, LOGIN EMAILS & LAST SEEN */}
      {/* ========================================================================= */}
      {adminTab === 'users' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Registered Users &amp; Live Login Sessions
              </h2>
              <p className="text-xs text-slate-500">
                Track user login email addresses, account roles, and real-time last seen timestamps.
              </p>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="Search user, email, device..."
                  className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs w-48 sm:w-60 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value as any)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins Only</option>
                <option value="user">Users Only</option>
              </select>

              <button
                type="button"
                id="btn-purge-fake-users"
                onClick={handlePurgeNonRealUsers}
                className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Permanently delete all non-real accounts from Firestore database and UI (keeps Admin and demo.wealthtracker.com)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Non-Real Users</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-2">User Identity</th>
                  <th className="pb-3">Access Role</th>
                  <th className="pb-3">Last Seen / Login</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3">Connected Device</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredUsers.map(user => {
                  const isAdminUser = user.role === 'admin';
                  const isDemoUser = user.id === 'demo.wealthtracker.com' || user.email === 'demo@wealthtracker.com';
                  const isMasterAdmin = user.email === 'sudharsan014@gamil.com' || user.email === 'sudharsan014@gmail.com' || user.email === 'sudharsanm014@gmail.com';
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                            isAdminUser ? 'bg-blue-600' : 'bg-slate-700'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-white">{user.name}</span>
                              {isDemoUser && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 font-mono font-bold">
                                  Demo User
                                </span>
                              )}
                              {isMasterAdmin && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 font-mono font-bold">
                                  Primary Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isAdminUser 
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isAdminUser ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>

                      <td className="py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>{formatLastSeen(user.lastLoginAt)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-slate-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>

                      <td className="py-3.5 text-slate-400 text-[11px]">
                        {user.deviceInfo || 'Web Browser'}
                      </td>

                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(user)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            title="Switch role"
                          >
                            Make {isAdminUser ? 'User' : 'Admin'}
                          </button>
                          {!isMasterAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              className="p-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-all cursor-pointer"
                              title="Delete user account permanently from database and UI"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER FEEDBACK (READ & DIRECT REPLY) */}
      {/* ========================================================================= */}
      {adminTab === 'feedback' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                User Feedback &amp; Support Tickets
              </h2>
              <p className="text-xs text-slate-500">
                Collect user reviews, answer questions, and send direct replies stored in Firestore.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={feedbackStatusFilter}
                onChange={e => setFeedbackStatusFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="new">New Tickets</option>
                <option value="in_review">In Review</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={feedbackCategoryFilter}
                onChange={e => setFeedbackCategoryFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <option value="all">All Categories</option>
                <option value="feature_request">Feature Request</option>
                <option value="question">Question</option>
                <option value="bug">Bug Report</option>
                <option value="praise">Praise</option>
              </select>
            </div>
          </div>

          {/* Feedback Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedback.map(fb => (
              <div 
                key={fb.id}
                className={`p-5 rounded-2xl border space-y-3 transition-all ${
                  isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm block">{fb.userName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{fb.userEmail}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize">
                      {fb.category.replace('_', ' ')}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      fb.status === 'resolved' 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {fb.status === 'resolved' ? 'Resolved ✓' : fb.status}
                    </span>
                  </div>
                </div>

                {/* Rating stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1.5">{fb.rating}/5 rating</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  "{fb.message}"
                </p>

                {/* Display Admin Reply if present */}
                {fb.adminReply && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400">
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Admin Reply (Sent to user):</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 italic">
                      "{fb.adminReply}"
                    </p>
                  </div>
                )}

                {/* Reply Button */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Received {new Date(fb.createdAt).toLocaleDateString()}</span>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyingFeedback(fb);
                      setReplyText(fb.adminReply || '');
                    }}
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>{fb.adminReply ? 'Update Reply' : 'Reply to User'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Modal */}
          {replyingFeedback && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-500" />
                    <h3 className="font-bold text-sm">Reply to {replyingFeedback.userName}</h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setReplyingFeedback(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-bold block text-[10px] text-slate-400 uppercase">User Message:</span>
                  "{replyingFeedback.message}"
                </div>

                <form onSubmit={handleSendReply} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1">Your Admin Response:</label>
                    <textarea
                      required
                      rows={4}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Write your answer, resolution, or thank you reply..."
                      className={`w-full p-3 rounded-xl border text-xs resize-none ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyingFeedback(null)}
                      className="px-4 py-2 rounded-xl border text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReply || !replyText.trim()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReply ? 'Sending...' : 'Send Reply'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BROADCAST NOTIFICATIONS (NEW FEATURE ALERTS TO ALL USERS) */}
      {/* ========================================================================= */}
      {adminTab === 'broadcast' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Broadcast Notifications &amp; Feature Announcements
            </h2>
            <p className="text-xs text-slate-500">
              Publish alerts that instantly illuminate the notification bell for all logged-in users.
            </p>
          </div>

          {/* Broadcast Form */}
          <form onSubmit={handleCreateBroadcast} className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">
              Send New Broadcast to All Users
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Headline / Title</label>
                <input
                  type="text"
                  required
                  value={notifTitle}
                  onChange={e => setNotifTitle(e.target.value)}
                  placeholder="e.g. 🚀 New Feature: Post Office MIS & SCSS Calculator Added!"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={notifBadge}
                  onChange={e => setNotifBadge(e.target.value)}
                  placeholder="e.g. New Release, Hot"
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Notification Description</label>
              <textarea
                required
                rows={3}
                value={notifMessage}
                onChange={e => setNotifMessage(e.target.value)}
                placeholder="Describe the new feature or announcement in detail..."
                className={`w-full p-3 rounded-xl border text-xs resize-none ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                }`}
              />
            </div>

            {/* Optional Feature Image Link for Broadcast */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Feature Image URL / Chrome Link (Optional)</span>
              </label>
              <input
                type="url"
                value={notifImageUrl}
                onChange={e => setNotifImageUrl(e.target.value)}
                placeholder="Paste Chrome image link (e.g. https://images.unsplash.com/...)"
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                }`}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                📢 Automatically delivered to all user notification bells in the top navbar.
              </span>

              <button
                type="submit"
                disabled={isBroadcasting || !notifTitle.trim() || !notifMessage.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast to All Users'}</span>
              </button>
            </div>
          </form>

          {/* Past Broadcast History */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Broadcast Notifications ({notifications.length})
            </h3>

            <div className="space-y-3">
              {notifications.map(n => (
                <div 
                  key={n.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
                      {n.badge && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {n.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Broadcasted by {n.createdBy || 'Admin'} • {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await deleteBroadcastNotification(n.id);
                      setNotifications(prev => prev.filter(item => item.id !== n.id));
                      showToast('Broadcast notification deleted.');
                    }}
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    title="Delete broadcast notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: NEWS & BLOG CMS (ADMIN AUTHORING) */}
      {/* ========================================================================= */}
      {adminTab === 'news' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                News &amp; Blog Authoring CMS
              </h2>
              <p className="text-xs text-slate-500">
                Author and publish wealth management blogs, release notes, and financial news for users.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingNews(!isCreatingNews)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingNews ? 'Close Form' : 'Write New Article'}</span>
            </button>
          </div>

          {/* New Article Form */}
          {isCreatingNews && (
            <form onSubmit={handlePublishNews} className={`p-6 rounded-2xl border space-y-4 animate-in fade-in duration-200 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">
                Draft &amp; Publish Article
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold mb-1">Headline / Title</label>
                  <input
                    type="text"
                    required
                    value={newsTitle}
                    onChange={e => setNewsTitle(e.target.value)}
                    placeholder="e.g. Master Guide: How 40:40 Equity & Debt Protects You from Market Shocks"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Category</label>
                  <select
                    value={newsCategory}
                    onChange={e => setNewsCategory(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${
                      isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    <option value="Feature Release">Feature Release (New Features)</option>
                    <option value="New Features">New Features &amp; Capabilities</option>
                    <option value="Blog">Editorial Blog / Deep Dive</option>
                    <option value="Platform Update">Platform Update</option>
                    <option value="Market News">Market News</option>
                    <option value="Personal Finance">Personal Finance</option>
                    <option value="Holdings News">Holdings News (Stocks &amp; MF)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Summary Lead (1-2 sentences)</label>
                <input
                  type="text"
                  required
                  value={newsSummary}
                  onChange={e => setNewsSummary(e.target.value)}
                  placeholder="Short engaging lead shown on cards..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Full Body Content</label>
                <textarea
                  required
                  rows={5}
                  value={newsContent}
                  onChange={e => setNewsContent(e.target.value)}
                  placeholder="Write the full article content. You can write paragraphs, bullet points, and guidelines..."
                  className={`w-full p-3 rounded-xl border text-xs leading-relaxed resize-none ${
                    isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                  }`}
                />
              </div>

              {/* ARTICLE COVER IMAGE ATTACHMENT SECTION (Chrome Link / Device Upload / Preset) */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                      <span>Article Cover Image (Left Image • Right Text Layout)</span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Upload an image file, paste a Chrome web link, or choose a curated fintech banner.
                    </p>
                  </div>

                  {/* Attachment Mode Selector */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setNewsImageUploadMode('url')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        newsImageUploadMode === 'url'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Chrome Link</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewsImageUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        newsImageUploadMode === 'upload'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewsImageUploadMode('preset')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                        newsImageUploadMode === 'preset'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Fintech Presets</span>
                    </button>
                  </div>
                </div>

                {/* Option 1: Chrome / Web URL link input */}
                {newsImageUploadMode === 'url' && (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="url"
                        value={newsImageUrl}
                        onChange={e => setNewsImageUrl(e.target.value)}
                        placeholder="Paste Chrome image link (e.g. https://images.unsplash.com/... or any image address)"
                        className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs ${
                          isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      💡 Tip: Right-click any image in Google Chrome, click "Copy image address", and paste it here.
                    </p>
                  </div>
                )}

                {/* Option 2: Local file upload */}
                {newsImageUploadMode === 'upload' && (
                  <div className="space-y-1.5">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-blue-500 transition-colors border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                      <Upload className="w-6 h-6 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Click to select an image from your device
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WebP up to 1.5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Option 3: Curated Fintech Presets */}
                {newsImageUploadMode === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ADMIN_IMAGE_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNewsImageUrl(preset.url);
                          setNewsImageCaption(preset.name);
                          showToast(`Selected "${preset.name}" image!`);
                        }}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                          newsImageUrl === preset.url
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                        />
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold block truncate text-slate-900 dark:text-white">
                            {preset.name}
                          </span>
                          <span className="text-[9px] text-slate-400 block truncate">
                            {preset.desc}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Card Layout Preview (Left Image • Right Text) */}
                {newsImageUrl && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                        <span>Live Card Preview (Left Image • Right Text):</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setNewsImageUrl('');
                          setNewsImageCaption('');
                        }}
                        className="text-[10px] text-rose-500 hover:underline flex items-center gap-0.5 cursor-pointer font-semibold"
                      >
                        <X className="w-3 h-3" />
                        <span>Remove Image</span>
                      </button>
                    </div>

                    <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 ${
                      isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-slate-950 border-slate-800 shadow-xs'
                    }`}>
                      {/* Image on Left */}
                      <div className="w-full sm:w-36 h-24 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 relative bg-slate-200 dark:bg-slate-800">
                        <img
                          src={newsImageUrl}
                          alt="Preview"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Text on Right */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{newsCategory}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400">{newsReadTime || 3} min read</span>
                        </div>
                        <h5 className="text-xs font-bold truncate text-slate-900 dark:text-white">
                          {newsTitle || 'Sample Title: New Feature Announcement'}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {newsSummary || 'Your summary lead text will appear on the right side of the image.'}
                        </p>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={newsImageCaption}
                      onChange={e => setNewsImageCaption(e.target.value)}
                      placeholder="Optional image caption or descriptive credit (e.g. Asset Allocation Engine Preview)"
                      className={`w-full px-3 py-1.5 rounded-lg border text-[11px] ${
                        isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Published articles appear immediately in the "News &amp; Updates" tab for all users.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNews(false)}
                    className="px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPublishingNews || !newsTitle.trim() || !newsContent.trim()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isPublishingNews ? 'Publishing...' : 'Publish to News CMS'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Published Articles List with Image on Left, Text on Right */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Published Articles ({newsPosts.length})
            </h3>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {newsPosts.map(post => (
                <div 
                  key={post.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center gap-4 transition-all ${
                    isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Image on Left */}
                  <div className="w-full sm:w-36 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 relative border border-slate-200/80 dark:border-slate-700/80">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-br from-blue-500/10 to-emerald-500/10">
                        <ImageIcon className="w-6 h-6 opacity-40 mb-1" />
                        <span className="text-[9px] font-mono">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Text on Right */}
                  <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                          {post.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mt-1">
                        {post.title}
                      </h4>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {post.summary}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>By {post.author}</span>

                      <button
                        type="button"
                        onClick={async () => {
                          await deleteNewsPost(post.id);
                          setNewsPosts(prev => prev.filter(p => p.id !== post.id));
                          showToast('Article deleted from CMS.');
                        }}
                        className="text-rose-500 hover:text-rose-600 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: UPCOMING FEATURES & FIRESTORE DATABASE ROADMAP MANAGEMENT         */}
      {/* ========================================================================= */}
      {adminTab === 'upcoming_features' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Top Header & DB Status */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-inherit/40">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Upcoming Features &amp; Public Roadmap Database</span>
                </h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Database className="w-3 h-3 text-emerald-500" />
                  <span>Firestore Sync: /upcoming_features</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Visible in News &amp; Release Blogs
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Add, edit, and update the status of upcoming roadmap features (Real UPI, Bank AA, Demat Portfolios, WhatsApp/Telegram AI, Universal AI Advisor, Live Stock News). Changes sync directly to Firestore and show to all users.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSeedDefaultRoadmap}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Synchronize and guarantee all standard upcoming features exist in Firestore database"
              >
                <Database className="w-3.5 h-3.5 text-blue-500" />
                <span>Sync / Seed to DB</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateFeature}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Roadmap Feature</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className={`p-4 rounded-2xl border text-center ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/40 border-slate-800'
            }`}>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Features</span>
              <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                {upcomingFeatures.length}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-center ${
              isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/40'
            }`}>
              <span className="text-[10px] uppercase font-mono text-emerald-600 dark:text-emerald-400 block">In Development</span>
              <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {upcomingFeatures.filter(f => f.status === 'in_development').length}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-center ${
              isLight ? 'bg-purple-50/50 border-purple-200' : 'bg-purple-950/20 border-purple-800/40'
            }`}>
              <span className="text-[10px] uppercase font-mono text-purple-600 dark:text-purple-400 block">Beta Testing</span>
              <span className="text-xl font-black font-mono text-purple-600 dark:text-purple-400">
                {upcomingFeatures.filter(f => f.status === 'beta_testing').length}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-center ${
              isLight ? 'bg-blue-50/50 border-blue-200' : 'bg-blue-950/20 border-blue-800/40'
            }`}>
              <span className="text-[10px] uppercase font-mono text-blue-600 dark:text-blue-400 block">Community Votes</span>
              <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                {upcomingFeatures.reduce((acc, f) => acc + (f.votesCount || 0), 0)}
              </span>
            </div>

            <div className={`p-4 rounded-2xl border text-center col-span-2 sm:col-span-1 ${
              isLight ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-950/20 border-amber-800/40'
            }`}>
              <span className="text-[10px] uppercase font-mono text-amber-600 dark:text-amber-400 block">Beta Waitlist</span>
              <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400">
                {upcomingFeatures.reduce((acc, f) => acc + (f.earlyAccessRequests?.length || 0), 0)}
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={featuresSearchQuery}
                onChange={e => setFeaturesSearchQuery(e.target.value)}
                placeholder="Search features (UPI, Bank, Demat, AI, WhatsApp, Stocks)..."
                className={`w-full text-xs pl-8 pr-3 py-2 rounded-xl border focus:outline-none ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 focus:border-purple-500 text-slate-900' 
                    : 'bg-slate-800/80 border-slate-700 focus:border-purple-500 text-white'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={featuresFilter}
                onChange={e => setFeaturesFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border font-semibold focus:outline-none cursor-pointer ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <option value="all">All Categories ({upcomingFeatures.length})</option>
                <option value="Real Accounts & Banking">Real Accounts &amp; Banking</option>
                <option value="AI & Messaging">AI &amp; Messaging Bots</option>
                <option value="AI Advisory">AI Advisory</option>
                <option value="Market News & Stocks">Market News &amp; Stocks</option>
                <option value="Credit & Solvency">Credit &amp; Solvency</option>
                <option value="Tax & Compliance">Tax &amp; Compliance</option>
                <option value="Security & Infra">Security &amp; Infra</option>
              </select>

              <select
                value={featuresStatusFilter}
                onChange={e => setFeaturesStatusFilter(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border font-semibold focus:outline-none cursor-pointer ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <option value="all">All Lifecycles</option>
                <option value="in_development">In Development</option>
                <option value="beta_testing">Beta Testing</option>
                <option value="planned">Planned</option>
                <option value="under_research">Under Research</option>
                <option value="released">Released / Live</option>
              </select>
            </div>
          </div>

          {/* Features Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingFeatures
              .filter(f => {
                if (featuresFilter !== 'all' && f.category !== featuresFilter) return false;
                if (featuresStatusFilter !== 'all' && f.status !== featuresStatusFilter) return false;
                if (featuresSearchQuery) {
                  const q = featuresSearchQuery.toLowerCase();
                  const matchTitle = f.title.toLowerCase().includes(q);
                  const matchDesc = f.description.toLowerCase().includes(q);
                  const matchTags = (f.tags || []).some(t => t.toLowerCase().includes(q));
                  return matchTitle || matchDesc || matchTags;
                }
                return true;
              })
              .map(feat => {
                return (
                  <div
                    key={feat.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      isLight 
                        ? 'bg-slate-50/60 border-slate-200 hover:border-purple-300' 
                        : 'bg-slate-900 border-slate-800 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges & Quarter */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Quick Lifecycle Status Dropdown */}
                          <select
                            value={feat.status}
                            onChange={(e) => handleQuickStatusChange(feat.id, e.target.value as UpcomingFeatureStatus)}
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none ${
                              feat.status === 'in_development'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : feat.status === 'beta_testing'
                                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                : feat.status === 'released'
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            }`}
                          >
                            <option value="in_development">● In Development</option>
                            <option value="beta_testing">✦ Beta Testing</option>
                            <option value="planned">◷ Planned</option>
                            <option value="under_research">🔬 Under Research</option>
                            <option value="released">✓ Released</option>
                          </select>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                            isLight ? 'bg-white text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            Target: {feat.targetRelease}
                          </span>

                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold ${
                            feat.priority === 'urgent'
                              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                              : feat.priority === 'high'
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {feat.priority}
                          </span>
                        </div>

                        {feat.badge && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {feat.badge}
                          </span>
                        )}
                      </div>

                      {/* Title & Category */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {feat.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                          Category: {feat.category} • ID: <code className="text-purple-500 font-mono">{feat.id}</code>
                        </span>
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
                                isLight ? 'bg-white text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Early Access Requests Info */}
                      {feat.earlyAccessRequests && feat.earlyAccessRequests.length > 0 && (
                        <div className={`p-2.5 rounded-xl border text-[11px] ${
                          isLight ? 'bg-amber-50/60 border-amber-200/80 text-amber-800' : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                        }`}>
                          <div className="font-bold flex items-center gap-1.5 mb-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Beta Waitlist Requesters ({feat.earlyAccessRequests.length}):</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {feat.earlyAccessRequests.slice(0, 5).map(email => (
                              <span key={email} className="px-1.5 py-0.5 rounded bg-amber-500/10 font-mono text-[10px]">
                                {email}
                              </span>
                            ))}
                            {feat.earlyAccessRequests.length > 5 && (
                              <span className="text-[10px] font-mono opacity-80">+{feat.earlyAccessRequests.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-inherit/40 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                        <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">{feat.votesCount} votes</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Publish as Release Blog */}
                        <button
                          type="button"
                          onClick={() => handlePublishFeatureAsReleaseBlog(feat)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 border border-blue-500/30 flex items-center gap-1 cursor-pointer"
                          title="Convert this feature roadmap item into a published release blog post"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Publish Release Blog</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditFeature(feat)}
                          className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                          title="Edit Roadmap Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteFeature(feat.id, feat.title)}
                          className="p-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                          title="Delete from Roadmap"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ROADMAP FEATURE IN FIRESTORE DB */}
      {isFeatureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 space-y-5 shadow-2xl ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-inherit/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingFeature ? `Edit Roadmap Feature: ${editingFeature.title}` : 'Add New Roadmap Feature'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatureModalOpen(false)}
                className="p-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveFeature} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Feature Headline Name *
                </label>
                <input
                  type="text"
                  required
                  value={featTitle}
                  onChange={e => setFeatTitle(e.target.value)}
                  placeholder="e.g. Real UPI Accounts & Instant Sync"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Technical Category *
                  </label>
                  <select
                    value={featCategory}
                    onChange={e => setFeatCategory(e.target.value as UpcomingFeatureCategory)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <option value="Real Accounts & Banking">Real Accounts &amp; Banking</option>
                    <option value="AI & Messaging">AI &amp; Messaging Bots</option>
                    <option value="AI Advisory">AI Advisory</option>
                    <option value="Market News & Stocks">Market News &amp; Stocks</option>
                    <option value="Credit & Solvency">Credit &amp; Solvency</option>
                    <option value="Tax & Compliance">Tax &amp; Compliance</option>
                    <option value="Security & Infra">Security &amp; Infra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Lifecycle Status *
                  </label>
                  <select
                    value={featStatus}
                    onChange={e => setFeatStatus(e.target.value as UpcomingFeatureStatus)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <option value="in_development">In Active Development</option>
                    <option value="beta_testing">Beta Testing &amp; Preview</option>
                    <option value="planned">Planned for 2027</option>
                    <option value="under_research">Under Research</option>
                    <option value="released">Released / Live</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Target Quarter *
                  </label>
                  <input
                    type="text"
                    required
                    value={featQuarter}
                    onChange={e => setFeatQuarter(e.target.value)}
                    placeholder="e.g. Q2 2027"
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Priority
                  </label>
                  <select
                    value={featPriority}
                    onChange={e => setFeatPriority(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Upvote Count
                  </label>
                  <input
                    type="number"
                    value={featVotes}
                    onChange={e => setFeatVotes(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Highlight Pill Badge (Optional)
                </label>
                <input
                  type="text"
                  value={featBadge}
                  onChange={e => setFeatBadge(e.target.value)}
                  placeholder="e.g. Top Voted, Beta Testing, Community Favorite"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={featTags}
                  onChange={e => setFeatTags(e.target.value)}
                  placeholder="e.g. UPI, NPCI, PhonePe, GPay, Instant Sync"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Detailed Capability Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={featDesc}
                  onChange={e => setFeatDesc(e.target.value)}
                  placeholder="Explain what the feature does, key user benefits, and technical integrations..."
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none leading-relaxed ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800 border-slate-700'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-inherit/40">
                <button
                  type="button"
                  onClick={() => setIsFeatureModalOpen(false)}
                  className="px-4 py-2 rounded-xl border font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFeature}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingFeature ? 'Saving to Database...' : 'Save to Firestore DB'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
