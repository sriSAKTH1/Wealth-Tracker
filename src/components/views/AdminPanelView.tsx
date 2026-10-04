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
  ChevronDown, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Star, 
  UserPlus, 
  ArrowRight, 
  RefreshCw, 
  Check, 
  X, 
  BarChart3, 
  Briefcase, 
  Award, 
  Shield, 
  Eye, 
  Edit3, 
  ExternalLink,
  Send,
  Database,
  Copy
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { AppUserProfile, AppUserRole, AppAdvisorAssignment, AppFeedback } from '../../types';
import { 
  fetchAllUsers, 
  fetchAdvisorAssignments, 
  assignUserToAdvisor, 
  fetchFeedbackList, 
  submitUserFeedback, 
  updateFeedbackStatus,
  getClientDeviceName,
  auth
} from '../../services/firebase';

export const AdminPanelView: React.FC = () => {
  const { theme, formatMoney } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const { currentUser, role: authRole, isMainAdmin, isAdminAdvisor, isClientUser } = useAuth();

  // Active Role in View (Main Admin or Admin Advisor)
  const [activeRole, setActiveRole] = useState<AppUserRole>(() => {
    return authRole === 'admin_advisor' ? 'admin_advisor' : 'main_admin';
  });

  useEffect(() => {
    if (authRole === 'admin_advisor') {
      setActiveRole('admin_advisor');
    } else if (authRole === 'main_admin') {
      setActiveRole('main_admin');
    }
  }, [authRole]);

  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>('adv-arun');

  // Advisor note/message to Main Advisor
  const [advisorMessageText, setAdvisorMessageText] = useState('');
  const [isSendingAdvisorMessage, setIsSendingAdvisorMessage] = useState(false);

  // Admin Sub-tabs
  const [adminSubTab, setAdminSubTab] = useState<'users' | 'advisors' | 'feedback' | 'security'>('users');

  // Data states
  const [users, setUsers] = useState<AppUserProfile[]>([]);
  const [advisors, setAdvisors] = useState<AppAdvisorAssignment[]>([]);
  const [feedbackList, setFeedbackList] = useState<AppFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AppUserRole>('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<'all' | string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | string>('all');

  // New Advisor Modal State
  const [isAddingAdvisor, setIsAddingAdvisor] = useState(false);
  const [newAdvName, setNewAdvName] = useState('');
  const [newAdvEmail, setNewAdvEmail] = useState('');

  // User Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userFeedbackCategory, setUserFeedbackCategory] = useState<AppFeedback['category']>('feature_request');
  const [userFeedbackMessage, setUserFeedbackMessage] = useState('');

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [u, a, f] = await Promise.all([
        fetchAllUsers(),
        fetchAdvisorAssignments(),
        fetchFeedbackList()
      ]);
      setUsers(u);
      setAdvisors(a);
      setFeedbackList(f);
    } catch (err) {
      console.warn("Error loading admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1:10 Advisor load calculations
  const totalAssignedClients = useMemo(() => {
    return advisors.reduce((sum, a) => sum + (a.assignedUserIds?.length || 0), 0);
  }, [advisors]);

  const totalAdvisorCapacity = useMemo(() => {
    return advisors.length * 10;
  }, [advisors]);

  const unassignedUsers = useMemo(() => {
    return users.filter(u => u.role === 'user' && !u.assignedAdvisorId);
  }, [users]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.deviceInfo && u.deviceInfo.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.assignedAdvisorName && u.assignedAdvisorName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Filtered Feedback List
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter(f => {
      const matchesCategory = feedbackCategoryFilter === 'all' || f.category === feedbackCategoryFilter;
      const matchesStatus = feedbackStatusFilter === 'all' || f.status === feedbackStatusFilter;
      return matchesCategory && matchesStatus;
    });
  }, [feedbackList, feedbackCategoryFilter, feedbackStatusFilter]);

  // Handler: Assign User to Advisor (Strict 1:10 rule)
  const handleAssignUser = async (userId: string, userName: string, targetAdvisorId: string) => {
    const res = await assignUserToAdvisor(userId, userName, targetAdvisorId, advisors, users);
    if (res.success) {
      setAdvisors(res.updatedAdvisors);
      setUsers(res.updatedUsers);
      showToast(res.message);
    } else {
      showToast(`⚠️ ${res.message}`);
    }
  };

  // Handler: Auto-assign all unallocated users to available advisors
  const handleAutoAssignUsers = async () => {
    let currentAdv = [...advisors];
    let currentUsr = [...users];
    let assignedCount = 0;

    for (const user of unassignedUsers) {
      // Find an advisor with slots available (< 10)
      const availableAdvisor = currentAdv.find(a => (a.assignedUserIds?.length || 0) < 10);
      if (!availableAdvisor) break;

      const res = await assignUserToAdvisor(user.id, user.name, availableAdvisor.advisorId, currentAdv, currentUsr);
      if (res.success) {
        currentAdv = res.updatedAdvisors;
        currentUsr = res.updatedUsers;
        assignedCount++;
      }
    }

    setAdvisors(currentAdv);
    setUsers(currentUsr);
    showToast(
      assignedCount > 0 
        ? `Successfully auto-allocated ${assignedCount} user(s) to advisors under the 1:10 capacity limit!`
        : 'All users are already assigned or advisors have reached their 10-client capacity limit.'
    );
  };

  // Handler: Add New Advisor
  const handleCreateAdvisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdvName.trim() || !newAdvEmail.trim()) return;

    const newAdv: AppAdvisorAssignment = {
      advisorId: `adv-${Date.now()}`,
      advisorName: newAdvName.trim(),
      advisorEmail: newAdvEmail.trim(),
      assignedUserIds: [],
      currentClientCount: 0,
      maxCapacity: 10,
      updatedAt: new Date().toISOString()
    };

    const updatedAdvisors = [...advisors, newAdv];
    setAdvisors(updatedAdvisors);
    localStorage.setItem('app_advisor_assignments', JSON.stringify(updatedAdvisors));

    // Also add to users list as admin_advisor
    const newAdvUser: AppUserProfile = {
      id: newAdv.advisorId,
      name: newAdv.advisorName,
      email: newAdv.advisorEmail,
      role: 'admin_advisor',
      deviceInfo: getClientDeviceName(),
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [...users, newAdvUser];
    setUsers(updatedUsers);
    localStorage.setItem('app_admin_all_users', JSON.stringify(updatedUsers));

    setNewAdvName('');
    setNewAdvEmail('');
    setIsAddingAdvisor(false);
    showToast(`Added advisor "${newAdv.advisorName}" with 10 available client slots!`);
  };

  // Handler: User submits feedback
  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFeedbackMessage.trim()) return;

    await submitUserFeedback({
      userId: 'user-sudharsan',
      userName: 'Sudharsan M',
      userEmail: 'sudharsanm014@gmail.com',
      assignedAdvisorId: 'adv-arun',
      category: userFeedbackCategory,
      rating: userRating,
      message: userFeedbackMessage.trim(),
    });

    setUserFeedbackMessage('');
    setIsFeedbackModalOpen(false);
    await loadAllData();
    showToast('Feedback submitted to the Admin Panel database! Thank you.');
  };

  // Handler: Advisor sends note/message to Main Advisor
  const handleSendAdvisorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorMessageText.trim() || !currentAdvisor) return;

    setIsSendingAdvisorMessage(true);
    try {
      const newFeedback = await submitUserFeedback({
        userId: currentAdvisor.advisorId,
        userName: `${currentAdvisor.advisorName} (Advisor)`,
        userEmail: currentAdvisor.advisorEmail,
        assignedAdvisorId: currentAdvisor.advisorId,
        category: 'question',
        rating: 5,
        message: `[ADVISOR NOTE TO LEAD ADMIN]: ${advisorMessageText.trim()}`,
      });
      setFeedbackList(prev => [newFeedback, ...prev]);
      setAdvisorMessageText('');
      showToast('Advisory note sent directly to the Main Admin inbox!');
    } catch (err) {
      showToast('Could not send advisory note.');
    } finally {
      setIsSendingAdvisorMessage(false);
    }
  };

  // Active Advisor for Advisor view
  const currentAdvisor = advisors.find(a => a.advisorId === selectedAdvisorId) || advisors[0];
  const advisorClients = users.filter(u => currentAdvisor?.assignedUserIds?.includes(u.id));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-emerald-500/40 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR: Title & Role Switcher */}
      <div className={`p-6 rounded-3xl border shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <span>
                  {isAdminAdvisor ? 'Financial Advisor Workspace' : 'Unified Master Admin & Governance Panel'}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-mono font-bold border border-emerald-500/30">
                  {isAdminAdvisor ? '10-Client Cap' : 'Master Control'}
                </span>
              </h1>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                {isAdminAdvisor 
                  ? 'Controlling your 10 assigned clients and messaging the Main Advisor.' 
                  : 'Full control over user allocations, 1:10 advisor quotas, and global communications.'}
              </p>
            </div>
          </div>
        </div>

        {/* ROLE SIMULATOR & PREVIEW SWITCHER */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {isAdminAdvisor ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/30 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Advisor Control Session (Max 10 Users)</span>
              </span>
            </div>
          ) : (
            <>
              <span className="text-[11px] text-slate-400 font-medium">View Mode:</span>
              
              <button
                id="role-btn-main-admin"
                type="button"
                onClick={() => setActiveRole('main_admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeRole === 'main_admin'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Main Admin Dashboard</span>
              </button>

              <button
                id="role-btn-advisor"
                type="button"
                onClick={() => setActiveRole('admin_advisor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeRole === 'admin_advisor'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                <span>Advisor View (1:10)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* LIVE FIREBASE FIRESTORE DATABASE INFO & CONSOLE LINK */}
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
                100% Free Tier (Spark Plan • $0.00 / No Billing)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              Database ID: <strong>ai-studio-wealthtracker-6f01937e-d30e-4033-8b3e-464e81a3e270</strong> • Project: <strong>imagined-hash-fxtlg</strong>
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
              <span className="text-emerald-500 font-semibold">✓ Free Tier Quota:</span>
              <span>50,000 reads/day • 20,000 writes/day • 1 GB storage (Zero charges)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            type="button"
            onClick={() => {
              const url = 'https://console.firebase.google.com/project/imagined-hash-fxtlg/firestore/databases/ai-studio-wealthtracker-6f01937e-d30e-4033-8b3e-464e81a3e270/data';
              navigator.clipboard?.writeText(url);
              showToast('Firebase Console URL copied to clipboard!');
            }}
            className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all"
            title="Copy direct database URL"
          >
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Copy Link</span>
          </button>

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

      {/* ========================================================================= */}
      {/* VIEW 1: MAIN ADMIN DASHBOARD & GOVERNANCE */}
      {/* ========================================================================= */}
      {activeRole === 'main_admin' && (
        <div className="space-y-6">
          {/* Top KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Total Registered Users</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-blue-500">
                {users.length}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {users.filter(u => u.role === 'user').length} clients • {users.filter(u => u.role === 'admin_advisor').length} advisors
              </span>
            </div>

            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Advisor 1:10 Capacity</span>
                <Briefcase className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-indigo-500">
                {totalAssignedClients} / {totalAdvisorCapacity}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                <div 
                  style={{ width: `${totalAdvisorCapacity > 0 ? (totalAssignedClients / totalAdvisorCapacity) * 100 : 0}%` }}
                  className="bg-indigo-500 h-full transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {totalAdvisorCapacity - totalAssignedClients} client slot(s) available across {advisors.length} advisors
              </span>
            </div>

            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Unassigned Clients</span>
                <AlertCircle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-amber-500">
                {unassignedUsers.length}
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Awaiting financial coach</span>
                {unassignedUsers.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAutoAssignUsers}
                    className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer"
                  >
                    Auto-Assign Now →
                  </button>
                )}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                <span>Feedback & Inquiries</span>
                <MessageSquare className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono mt-1 text-emerald-500">
                {feedbackList.length}
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {feedbackList.filter(f => f.status === 'new').length} new ticket(s) to review
              </span>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
            <button
              type="button"
              onClick={() => setAdminSubTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                adminSubTab === 'users'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Directory & Sessions ({users.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminSubTab('advisors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                adminSubTab === 'advisors'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>1:10 Advisor Allocation Meter ({advisors.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setAdminSubTab('feedback')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                adminSubTab === 'feedback'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Feedback Inbox ({feedbackList.length})</span>
              {feedbackList.filter(f => f.status === 'new').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB 1: USER DIRECTORY & LOGIN SESSIONS */}
          {adminSubTab === 'users' && (
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold">Registered Users & Active Authorized Logins</h3>
                  <p className="text-xs text-slate-500">
                    Live connection directory showing real device names, access roles, and 1:10 advisor pairings.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search name, email, device..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>

                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value as any)}
                    className={`px-3 py-1.5 rounded-xl border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Clients Only</option>
                    <option value="admin_advisor">Advisors Only</option>
                    <option value="main_admin">Main Admins Only</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <tr>
                      <th className="p-3.5 font-bold">User / Identity</th>
                      <th className="p-3.5 font-bold">Role</th>
                      <th className="p-3.5 font-bold">Connected Device</th>
                      <th className="p-3.5 font-bold">FinScore Health</th>
                      <th className="p-3.5 font-bold">Assigned Advisor (1:10)</th>
                      <th className="p-3.5 font-bold">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                    {filteredUsers.map(user => {
                      const isMain = user.role === 'main_admin';
                      const isAdv = user.role === 'admin_advisor';

                      return (
                        <tr key={user.id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isMain && <Shield className="w-3 h-3 text-amber-500 shrink-0" />}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                          </td>

                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isMain
                                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                : isAdv
                                  ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {isMain ? 'Main Admin' : isAdv ? 'Admin Advisor' : 'Client User'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                              <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-mono text-[11px]">{user.deviceInfo || 'Standard Web Device'}</span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            {user.finScore ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-500 text-sm">{user.finScore}/100</span>
                                <span className="text-[10px] text-slate-400">({user.savingsRatio || 0}% savings)</span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">Not calculated</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            {user.role === 'user' ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={user.assignedAdvisorId || ''}
                                  onChange={e => handleAssignUser(user.id, user.name, e.target.value)}
                                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium ${
                                    user.assignedAdvisorId
                                      ? isLight ? 'bg-white border-blue-300 text-blue-700' : 'bg-slate-900 border-blue-500 text-blue-400'
                                      : 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                                  }`}
                                >
                                  <option value="">-- Unassigned --</option>
                                  {advisors.map(adv => {
                                    const count = adv.assignedUserIds?.length || 0;
                                    const isFull = count >= 10 && adv.advisorId !== user.assignedAdvisorId;
                                    return (
                                      <option 
                                        key={adv.advisorId} 
                                        value={adv.advisorId}
                                        disabled={isFull}
                                      >
                                        {adv.advisorName} ({count}/10) {isFull ? '[FULL]' : ''}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Advisor / Admin Role</span>
                            )}
                          </td>

                          <td className="p-3.5 text-[11px] text-slate-400">
                            {new Date(user.lastLoginAt || user.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ADVISOR ALLOCATION 1:10 CAPACITY METER */}
          {adminSubTab === 'advisors' && (
            <div className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold">1:10 Advisor Client Allocation Engine</h3>
                  <p className="text-xs text-slate-500">
                    Each Admin Advisor is strictly limited to 10 clients for premium, focused financial coaching.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoAssignUsers}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Assign Unallocated ({unassignedUsers.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingAdvisor(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add New Advisor</span>
                  </button>
                </div>
              </div>

              {/* Add Advisor Modal */}
              {isAddingAdvisor && (
                <form onSubmit={handleCreateAdvisor} className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-emerald-50/50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-800'
                } space-y-3 animate-in fade-in`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Register New Admin Advisor
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingAdvisor(false)}
                      className="text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <input
                      type="text"
                      placeholder="Advisor Name (e.g. Ramesh Iyer, CFP)"
                      required
                      value={newAdvName}
                      onChange={e => setNewAdvName(e.target.value)}
                      className={`px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                    />
                    <input
                      type="email"
                      placeholder="advisor.email@wealthtracker.io"
                      required
                      value={newAdvEmail}
                      onChange={e => setNewAdvEmail(e.target.value)}
                      className={`px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAdvisor(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                    >
                      Save Advisor
                    </button>
                  </div>
                </form>
              )}

              {/* Advisors List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {advisors.map(adv => {
                  const count = adv.assignedUserIds?.length || 0;
                  const isFull = count >= 10;
                  const pct = (count / 10) * 100;
                  const assignedClients = users.filter(u => adv.assignedUserIds?.includes(u.id));

                  return (
                    <div 
                      key={adv.advisorId}
                      className={`p-5 rounded-2xl border transition-all ${
                        isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{adv.advisorName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{adv.advisorEmail}</div>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isFull
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : count >= 8
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {isFull ? '10/10 [FULL]' : `${count}/10 Clients`}
                        </span>
                      </div>

                      {/* 1:10 Capacity Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1">
                          <span>Capacity Utilization</span>
                          <span className="font-mono font-bold">{count} of 10 max</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${pct}%` }}
                            className={`h-full transition-all ${
                              isFull ? 'bg-rose-500' : count >= 8 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Client Pills */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Assigned Clients ({assignedClients.length})
                        </span>
                        {assignedClients.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic block">No clients assigned yet.</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {assignedClients.map(c => (
                              <span
                                key={c.id}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                {c.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CENTRALIZED FEEDBACK & TICKETS INBOX */}
          {adminSubTab === 'feedback' && (
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold">User Feedback & Support Center</h3>
                  <p className="text-xs text-slate-500">
                    Incoming reviews, ratings, and feature requests submitted by registered users.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={feedbackStatusFilter}
                    onChange={e => setFeedbackStatusFilter(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New Only</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <select
                    value={feedbackCategoryFilter}
                    onChange={e => setFeedbackCategoryFilter(e.target.value)}
                    className={`px-3 py-1.5 rounded-xl border text-xs ${
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

              {/* Feedback List */}
              <div className="space-y-3">
                {filteredFeedback.map(fb => (
                  <div 
                    key={fb.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{fb.userName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({fb.userEmail})</span>
                        
                        {/* Rating Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400 ml-1">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 font-bold capitalize">
                          {fb.category.replace('_', ' ')}
                        </span>

                        <select
                          value={fb.status}
                          onChange={e => updateFeedbackStatus(fb.id, e.target.value as any)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            fb.status === 'resolved'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : fb.status === 'in_review'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="in_review">In Review</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
                      "{fb.message}"
                    </p>

                    {fb.adminNotes && (
                      <div className="mt-2 text-[11px] p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <strong>Admin Notes:</strong> {fb.adminNotes}
                      </div>
                    )}

                    <div className="mt-2 text-[10px] text-slate-400">
                      Received {new Date(fb.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ADMIN ADVISOR VIEW (1:10 COACHING WORKSPACE) */}
      {/* ========================================================================= */}
      {activeRole === 'admin_advisor' && (
        <div className="space-y-6">
          {/* Advisor Selector */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div>
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block">Logged in Advisor</span>
              <div className="text-lg font-bold mt-0.5">{currentAdvisor.advisorName}</div>
              <span className="text-xs text-slate-500 font-mono">{currentAdvisor.advisorEmail}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Preview as:</span>
              <select
                value={selectedAdvisorId}
                onChange={e => setSelectedAdvisorId(e.target.value)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                }`}
              >
                {advisors.map(adv => (
                  <option key={adv.advisorId} value={adv.advisorId}>
                    {adv.advisorName} ({adv.assignedUserIds?.length || 0}/10 slots)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advisor Client Roster */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">My Assigned Clients ({advisorClients.length} of 10 Max)</h3>
                <p className="text-xs text-slate-500">
                  Direct financial health metrics and action review for your assigned portfolio.
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                advisorClients.length >= 10
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}>
                {advisorClients.length}/10 Slots Taken
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {advisorClients.map(client => (
                <div 
                  key={client.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{client.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{client.email}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">FinScore</span>
                      <span className="text-base font-extrabold font-mono text-emerald-500">{client.finScore || 80}/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Monthly Income</span>
                      <strong className="font-mono text-blue-500">{formatMoney(client.monthlyIncome || 50000)}</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Savings Ratio</span>
                      <strong className="font-mono text-emerald-500">{client.savingsRatio || 30}%</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                    <span>Connected Device: {client.deviceInfo || 'Desktop'}</span>
                    <span className="text-blue-500 font-semibold cursor-pointer hover:underline">
                      Review Goals & Debt →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DIRECT COMMUNICATION: ADVISOR MESSAGES TO MAIN ADVISOR */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isLight ? 'bg-gradient-to-r from-indigo-50/80 to-blue-50/50 border-indigo-200' : 'bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border-indigo-500/25'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Direct Communication Channel to Main Advisor / Lead Admin
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Send client escalation updates, approval requests, or advisory questions to the Main Administrator.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendAdvisorMessage} className="space-y-3 pt-2">
              <textarea
                required
                rows={3}
                value={advisorMessageText}
                onChange={e => setAdvisorMessageText(e.target.value)}
                placeholder="Write your note to the Main Advisor (e.g. 'Client Deepak Nair needs review on debt restructuring before allocating 60% into bonds...')"
                className={`w-full p-3 rounded-2xl border text-xs resize-none ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  🔒 Messages are routed directly to the Main Admin feedback &amp; triage inbox in Firebase.
                </span>

                <button
                  type="submit"
                  disabled={isSendingAdvisorMessage || !advisorMessageText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingAdvisorMessage ? 'Sending...' : 'Send to Main Advisor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: USER EXPERIENCE (MY ADVISOR & FEEDBACK FORM) */}
      {/* ========================================================================= */}
      {activeRole === 'user' && (
        <div className="space-y-6">
          {/* User's Assigned Advisor Card */}
          <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isLight ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-slate-900' : 'bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border-blue-500/30 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold">Your Dedicated Financial Coach</h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Under our 1:10 client model, you have a designated professional advisor assigned to review your FinScore, loan repayments, and portfolio allocation:
            </p>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/30">
                  AK
                </div>
                <div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">Arun Kumar, CFA</div>
                  <div className="text-xs text-blue-500 font-medium">Senior Wealth Strategist</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">arun.advisor@wealthtracker.io</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer self-start sm:self-auto"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Message / Feedback</span>
              </button>
            </div>
          </div>

          {/* Feedback Modal for User */}
          {isFeedbackModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 animate-in zoom-in-95 ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>Send Feedback or Question</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsFeedbackModalOpen(false)}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Feedback Category</label>
                    <select
                      value={userFeedbackCategory}
                      onChange={e => setUserFeedbackCategory(e.target.value as any)}
                      className={`w-full px-3 py-2 rounded-xl border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                      }`}
                    >
                      <option value="feature_request">Feature Request / Suggestion</option>
                      <option value="question">Question for Advisor</option>
                      <option value="bug">Report an Issue / Bug</option>
                      <option value="praise">Positive Review / Praise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Your Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          className="cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= userRating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Your Message</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Type your question or feedback..."
                      value={userFeedbackMessage}
                      onChange={e => setUserFeedbackMessage(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-700'
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsFeedbackModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>Submit to Database</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
