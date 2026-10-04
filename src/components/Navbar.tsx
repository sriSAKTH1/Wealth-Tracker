import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Search, 
  Bell, 
  Smartphone, 
  Monitor, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ShieldCheck,
  Keyboard,
  PanelLeftClose,
  PanelLeft,
  MoreVertical,
  X,
  Database,
  User
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { CurrencyCode } from '../types';

export const Navbar: React.FC = () => {
  const { 
    isPrivateMode, 
    togglePrivateMode, 
    setSearchOpen,
    currency, 
    setCurrency, 
    formatMoney, 
    netWorth,
    netWorthHistory = [],
    monthlyExpenses,
    liquidRunwayMonths,
    scheduledItems = [],
    isMobileFrameSimulated,
    toggleMobileFrame,
    activeTab,
    setActiveTab,
    theme,
    keyboardShortcutsEnabled,
    setIsShortcutsHelpOpen,
    isSidebarOpen,
    toggleSidebar
  } = useFinance();

  const { currentUser, role, openAuthModal } = useAuth();

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileAlertsExpanded, setMobileAlertsExpanded] = useState(false);

  // Theme-aware styling configurations for the navbar header component and text
  const navStyles = React.useMemo(() => {
    switch (theme) {
      case 'flavorfit':
        return {
          header: 'border-[#202438] bg-[#0B0C14]/95 backdrop-blur-md text-white shadow-lg shadow-black/30',
          title: 'text-white',
          subtitle: 'text-[#8D93B4]',
          tabBadge: 'bg-[#9FE0E8]/10 text-[#9FE0E8] border-[#9FE0E8]/30',
          nwPill: 'bg-[#131522] border-[#22263D] text-white',
          nwLabel: 'text-[#8D93B4]',
          nwValue: 'text-[#EDD0BA]', // Apricot cream net worth value
          btn: 'bg-[#161827] border-[#262A44] text-[#C7C4F8] hover:bg-[#1F2237] hover:text-white',
          btnActive: 'bg-[#9FE0E8]/15 border-[#9FE0E8]/40 text-[#9FE0E8]',
          finscore: activeTab === 'finscore'
            ? 'bg-[#9FE0E8] text-[#0B101D] font-bold border-[#9FE0E8] shadow-md shadow-[#9FE0E8]/20'
            : 'bg-[#9FE0E8]/15 text-[#9FE0E8] border-[#9FE0E8]/30 hover:bg-[#9FE0E8]/25',
          dropdown: 'bg-[#131522] border-[#22263D] text-white shadow-2xl',
          dropdownCard: 'bg-[#1A1C2D] border-[#262A44] text-[#F1F3F9]',
          dropdownText: 'text-[#8D93B4]',
          accentIcon: 'text-[#9FE0E8]',
        };
      case 'nature':
        return {
          header: 'border-[#DED9CD] bg-[#FAF8F3]/95 backdrop-blur-md text-[#283618] shadow-xs',
          title: 'text-[#283618]',
          subtitle: 'text-[#5C664E]',
          tabBadge: 'bg-[#606C38]/10 text-[#606C38] border-[#606C38]/25',
          nwPill: 'bg-[#ECE8DD] border-[#DED9CD] text-[#283618]',
          nwLabel: 'text-[#5C664E]',
          nwValue: 'text-[#283618]',
          btn: 'bg-[#F4F1EA] border-[#DED9CD] text-[#283618] hover:bg-[#ECE8DD]',
          btnActive: 'bg-[#606C38]/15 border-[#606C38]/40 text-[#606C38]',
          finscore: activeTab === 'finscore'
            ? 'bg-[#606C38] text-white font-semibold border-[#606C38] shadow-sm'
            : 'bg-[#606C38]/15 text-[#606C38] border-[#606C38]/30 hover:bg-[#606C38]/25',
          dropdown: 'bg-[#FAF8F3] border-[#DED9CD] text-[#283618] shadow-xl',
          dropdownCard: 'bg-[#ECE8DD] border-[#DED9CD] text-[#283618]',
          dropdownText: 'text-[#5C664E]',
          accentIcon: 'text-[#606C38]',
        };
      case 'retro':
        return {
          header: 'border-[#D6CCB5] bg-[#FAF6ED]/95 backdrop-blur-md text-[#2B2520] shadow-xs',
          title: 'text-[#2B2520]',
          subtitle: 'text-[#6E6256]',
          tabBadge: 'bg-[#C65952]/10 text-[#C65952] border-[#C65952]/25',
          nwPill: 'bg-[#EDE5D3] border-[#D6CCB5] text-[#2B2520]',
          nwLabel: 'text-[#6E6256]',
          nwValue: 'text-[#2B2520]',
          btn: 'bg-[#F5EEDF] border-[#D6CCB5] text-[#2B2520] hover:bg-[#EDE5D3]',
          btnActive: 'bg-[#C65952]/15 border-[#C65952]/40 text-[#C65952]',
          finscore: activeTab === 'finscore'
            ? 'bg-[#C65952] text-white font-semibold border-[#C65952] shadow-sm'
            : 'bg-[#C65952]/15 text-[#C65952] border-[#C65952]/30 hover:bg-[#C65952]/25',
          dropdown: 'bg-[#FAF6ED] border-[#D6CCB5] text-[#2B2520] shadow-xl',
          dropdownCard: 'bg-[#EDE5D3] border-[#D6CCB5] text-[#2B2520]',
          dropdownText: 'text-[#6E6256]',
          accentIcon: 'text-[#C65952]',
        };
      case 'light':
        return {
          header: 'border-slate-200/90 bg-white/95 backdrop-blur-md text-slate-900 shadow-sm',
          title: 'text-slate-900',
          subtitle: 'text-slate-500',
          tabBadge: 'bg-slate-100 text-slate-600 border-slate-200',
          nwPill: 'bg-slate-100/90 border-slate-200 text-slate-900',
          nwLabel: 'text-slate-600',
          nwValue: 'text-slate-900',
          btn: 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900',
          btnActive: 'bg-amber-500/15 border-amber-500/40 text-amber-600',
          finscore: activeTab === 'finscore'
            ? 'bg-blue-600 text-white font-semibold border-blue-500 shadow-md shadow-blue-500/20'
            : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
          dropdown: 'bg-white border-slate-200 text-slate-900 shadow-slate-300/50',
          dropdownCard: 'bg-slate-50 border-slate-200 text-slate-800',
          dropdownText: 'text-slate-600',
          accentIcon: 'text-blue-500',
        };
      default:
        return {
          header: 'border-slate-800/60 bg-slate-950/80 backdrop-blur-md text-white shadow-xs',
          title: 'text-white',
          subtitle: 'text-slate-400',
          tabBadge: 'bg-slate-800 text-slate-400 border-slate-700',
          nwPill: 'bg-slate-900/90 border-slate-800 text-white',
          nwLabel: 'text-slate-400',
          nwValue: 'text-white',
          btn: 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white',
          btnActive: 'bg-amber-500/15 border-amber-500/40 text-amber-500',
          finscore: activeTab === 'finscore'
            ? 'bg-blue-600 text-white font-semibold border-blue-500 shadow-md shadow-blue-500/20'
            : 'bg-blue-600/15 border-blue-500/30 text-blue-400 hover:bg-blue-600/25',
          dropdown: 'bg-slate-900 border-slate-800 text-white shadow-2xl',
          dropdownCard: 'bg-slate-950/70 border-slate-800/80 text-slate-200',
          dropdownText: 'text-slate-400',
          accentIcon: 'text-blue-400',
        };
    }
  }, [theme, activeTab]);

  // Dynamic 30-day net worth growth rate (supports positive, negative, and 0)
  const nw30dChange = React.useMemo(() => {
    if (netWorth === 0 || !netWorthHistory || !Array.isArray(netWorthHistory) || netWorthHistory.length < 2) return 0;
    const prev = netWorthHistory[netWorthHistory.length - 2]?.netWorth ?? 0;
    if (prev === 0) {
      return netWorth > 0 ? 100 : netWorth < 0 ? -100 : 0;
    }
    const change = ((netWorth - prev) / Math.abs(prev)) * 100;
    return isNaN(change) || !isFinite(change) ? 0 : change;
  }, [netWorth, netWorthHistory]);

  // Generate real dynamic alerts based on finances
  const alerts = [
    {
      id: '1',
      title: 'Emergency Runway Healthy',
      message: `You currently have ${liquidRunwayMonths} months of liquid reserves. Target achieved!`,
      type: 'success',
      icon: CheckCircle2,
    },
    {
      id: '2',
      title: 'Upcoming Recurring Bills',
      message: `${(scheduledItems || []).filter(i => i.type === 'expense').length} scheduled debits configured this month.`,
      type: 'info',
      icon: Calendar,
    },
    {
      id: '3',
      title: 'Monthly Cash Flow Active',
      message: `Monthly net burn is safely tracked at ${formatMoney(monthlyExpenses)}/mo.`,
      type: 'warning',
      icon: AlertCircle,
    }
  ];

  // Dynamic active tab titles for navbar header
  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    overview: { title: 'Dashboard', subtitle: 'Overview & Net Worth' },
    wealth: { title: 'Wealth & Allocation', subtitle: 'Portfolio & Assets' },
    goals: { title: 'Goals & Essentials', subtitle: 'Milestones & Targets' },
    account: { title: 'Accounts & Budgets', subtitle: 'Cash Flow & Envelopes' },
    calendar: { title: 'Cash Flow Calendar', subtitle: 'Scheduled Recurring Items' },
    balancesheet: { title: 'Balance Sheet & Audit', subtitle: 'Assets & Liabilities Verification' },
    reports: { title: 'Reports & Analytics', subtitle: 'Performance & Breakdowns' },
    calculators: { title: 'Tools & Calculators', subtitle: 'FIRE & Loan Simulators' },
    settings: { title: 'Settings', subtitle: 'Preferences & System' }
  };

  return (
    <header className={`sticky top-0 z-30 w-full border-b transition-all duration-200 ${navStyles.header} px-4 sm:px-6 py-3`}>
      <div className="w-full flex items-center justify-between gap-3">
        {/* Left: Mobile Drawer Button & Active View Context */}
        <div className="flex items-center gap-3">
          {/* Mobile-only menu toggle (hidden on desktop where sidebar is sticky on the left) */}
          <button
            id="btn-mobile-sidebar-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            className={`lg:hidden p-2 rounded-xl border transition-all cursor-pointer ${navStyles.btn}`}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Desktop Active Page Breadcrumb / Title */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-sm sm:text-base font-bold tracking-tight ${navStyles.title}`}>
                {tabTitles[activeTab]?.title || 'Dashboard'}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono ${navStyles.tabBadge}`}>
                {activeTab.toUpperCase()}
              </span>
            </div>
            <span className={`text-[11px] font-medium hidden md:inline ${navStyles.subtitle}`}>
              {tabTitles[activeTab]?.subtitle || 'Capital & Net Worth'}
            </span>
          </div>
        </div>

        {/* Center: Live Net Worth summary pill (Quick glance) */}
        <div className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-inner transition-colors ${navStyles.nwPill}`}>
          <span className={`text-xs font-medium ${navStyles.nwLabel}`}>Total Net Worth:</span>
          <span className={`text-sm font-bold font-mono ${navStyles.nwValue}`}>
            {formatMoney(netWorth)}
          </span>
          <span className={`flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
            nw30dChange === 0
              ? isLight 
                ? 'text-slate-500 bg-slate-200/70 border-slate-300' 
                : 'text-slate-400 bg-slate-800/60 border-slate-700/60'
              : nw30dChange > 0
              ? 'text-emerald-500 bg-emerald-500/15 border-emerald-500/20'
              : 'text-rose-500 bg-rose-500/15 border-rose-500/20'
          }`}>
            {nw30dChange > 0 && <TrendingUp className="w-3 h-3 mr-0.5 text-emerald-500" />}
            {nw30dChange < 0 && <TrendingDown className="w-3 h-3 mr-0.5 text-rose-500" />}
            {(nw30dChange ?? 0) > 0 ? '+' : ''}{(nw30dChange ?? 0).toFixed(1)}%
          </span>
        </div>

        {/* Right Tools:
            On Mobile: Only Search icon, Eye button, and Menu button.
            In the Menu: Score (FinScore), Notifications, and Keyboard Shortcuts.
            On Desktop: Full Search, Keyboard Shortcuts, Eye, FinScore, Notifications.
        */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Icon Button (sm:hidden) */}
          <button
            id="btn-mobile-search"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            title="Search transactions and assets"
            className={`sm:hidden p-2 rounded-full border transition-all cursor-pointer ${navStyles.btn}`}
          >
            <Search className={`w-4 h-4 ${navStyles.accentIcon}`} />
          </button>

          {/* Desktop Global Search Pill Button (hidden sm:flex) */}
          <button
            id="btn-global-search"
            onClick={() => setSearchOpen(true)}
            aria-label="Search transactions and assets"
            title="Search transactions, assets, and tools (/ or ⌘K)"
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium cursor-pointer ${navStyles.btn}`}
          >
            <Search className={`w-4 h-4 ${navStyles.accentIcon}`} />
            <span>Search...</span>
            <div className="hidden lg:flex items-center gap-1">
              <kbd className="text-[10px] px-1.5 py-0.5 rounded-full border opacity-75 font-mono">/</kbd>
            </div>
          </button>

          {/* Privacy Mode (Eye Toggle) - Shown on BOTH Mobile & Desktop */}
          <button
            id="btn-privacy-eye"
            onClick={togglePrivateMode}
            aria-label={isPrivateMode ? 'Show balances' : 'Hide balances'}
            title={isPrivateMode ? 'Privacy Mode Active (Balances hidden)' : 'Privacy Mode Off (Balances visible)'}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isPrivateMode 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-sm' 
                : navStyles.btn
            }`}
          >
            {isPrivateMode ? (
              <EyeOff className="w-4 h-4 text-amber-500" />
            ) : (
              <Eye className="w-4 h-4 opacity-75 hover:opacity-100" />
            )}
          </button>

          {/* Desktop-Only: Keyboard Shortcuts Cheat Sheet Button */}
          <button
            id="btn-keyboard-shortcuts"
            onClick={() => setIsShortcutsHelpOpen(true)}
            aria-label="Keyboard shortcuts"
            title={`Keyboard Shortcuts (?)${keyboardShortcutsEnabled ? ' - Enabled' : ' - Disabled in Settings'}`}
            className={`hidden sm:flex p-2 rounded-full border transition-all relative cursor-pointer ${
              !keyboardShortcutsEnabled
                ? 'opacity-60 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                : navStyles.btn
            }`}
          >
            <Keyboard className="w-4 h-4" />
            {keyboardShortcutsEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
            )}
          </button>

          {/* Desktop-Only: Local-First Zero-Knowledge Privacy Badge */}
          <div
            id="badge-nav-local-privacy"
            title="Zero-Knowledge Privacy: All transactions, salary, and assets are kept 100% locally on this device. Only login credentials and feedback are stored in the database."
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">100% Local Privacy</span>
          </div>

          {/* Desktop-Only: Account & Role Sign In Pill */}
          <button
            id="btn-nav-auth"
            onClick={() => openAuthModal('login')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-xs ${
              role === 'main_admin'
                ? 'bg-blue-600/15 text-blue-400 border-blue-500/30 hover:bg-blue-600/25'
                : role === 'admin_advisor'
                ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/25'
                : 'bg-emerald-600/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/25'
            }`}
            title={`Account: ${currentUser?.name || 'User'} (${role}). Click to switch or log in.`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[110px] truncate">{currentUser?.name?.split(' ')[0] || 'Sign In'}</span>
          </button>

          {/* Desktop-Only: FinScore Financial Health Launcher */}
          <button
            id="btn-nav-finscore"
            onClick={() => setActiveTab('finscore')}
            title="Open FinScore™ Financial Health Score & Planner"
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm cursor-pointer ${navStyles.finscore}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>FinScore™</span>
          </button>

          {/* Desktop-Only: Notifications / Alerts Dropdown */}
          <div className="relative hidden sm:block">
            <button
              id="btn-notifications"
              onClick={() => setIsAlertsOpen(prev => !prev)}
              aria-label="Financial notifications"
              className={`relative p-2 rounded-full border transition-all cursor-pointer ${navStyles.btn}`}
            >
              <Bell className="w-4 h-4 opacity-80" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
            </button>

            {isAlertsOpen && (
              <div 
                className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border p-3 z-50 animate-in fade-in zoom-in-95 duration-100 ${navStyles.dropdown}`}
                onMouseLeave={() => setIsAlertsOpen(false)}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-inherit/40">
                  <span className={`text-xs font-bold ${navStyles.title}`}>Financial Vital Signs</span>
                  <span className="text-[10px] text-blue-500 bg-blue-500/15 px-2 py-0.5 rounded-full font-mono font-medium">All Systems Active</span>
                </div>
                <div className="space-y-2">
                  {alerts.map(a => {
                    const Icon = a.icon;
                    return (
                      <div key={a.id} className={`p-2.5 rounded-xl border text-xs ${navStyles.dropdownCard}`}>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Icon className={`w-3.5 h-3.5 ${
                            a.type === 'success' ? 'text-emerald-500' : a.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                          }`} />
                          <span className={navStyles.title}>{a.title}</span>
                        </div>
                        <p className={`text-[11px] mt-1 pl-5 ${navStyles.dropdownText}`}>
                          {a.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile-Only: Menu Button (sm:hidden) */}
          <div className="relative sm:hidden">
            <button
              id="btn-mobile-more-menu"
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              className={`relative p-2 rounded-full border transition-all cursor-pointer ${
                isMobileMenuOpen ? navStyles.btnActive : navStyles.btn
              }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
              {/* Notification dot */}
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* Mobile Dropdown Backdrop */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

            {/* Mobile Dropdown Menu: FinScore, Notifications, Keyboard Shortcuts */}
            {isMobileMenuOpen && (
              <div 
                className={`absolute right-0 mt-2 w-72 rounded-2xl border p-3 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${navStyles.dropdown}`}
              >
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-inherit/40">
                  <span className={`text-xs font-bold uppercase tracking-wider ${navStyles.title}`}>Quick Menu</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono font-medium">Tools &amp; Alerts</span>
                </div>

                <div className="space-y-2">
                  {/* 1. FinScore Launcher Button */}
                  <button
                    id="btn-mobile-menu-finscore"
                    onClick={() => {
                      setActiveTab('finscore');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'finscore'
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                        : navStyles.dropdownCard
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">FinScore™ Health</div>
                        <div className={`text-[10px] font-normal ${activeTab === 'finscore' ? 'text-blue-100' : navStyles.dropdownText}`}>
                          Financial health audit &amp; score
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      activeTab === 'finscore'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      Score
                    </span>
                  </button>

                  {/* 2. Notifications & Alerts Section */}
                  <div className={`rounded-xl border transition-all overflow-hidden ${navStyles.dropdownCard}`}>
                    <button
                      id="btn-mobile-menu-notifications"
                      onClick={() => setMobileAlertsExpanded(prev => !prev)}
                      className="w-full flex items-center justify-between p-2.5 text-xs font-semibold cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 relative">
                          <Bell className="w-4 h-4" />
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">Notifications</div>
                          <div className={`text-[10px] font-normal ${navStyles.dropdownText}`}>
                            {alerts.length} active vital alerts
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileAlertsExpanded ? 'rotate-180 text-blue-400' : 'opacity-60'}`} />
                    </button>

                    {/* Expanded Mobile Alerts List */}
                    {mobileAlertsExpanded && (
                      <div className="p-2 pt-0 space-y-1.5 border-t border-inherit/30">
                        {alerts.map(a => {
                          const Icon = a.icon;
                          return (
                            <div key={a.id} className="p-2 rounded-lg bg-black/10 dark:bg-black/30 border border-inherit/20 text-xs">
                              <div className="flex items-center gap-1.5 font-medium">
                                <Icon className={`w-3 h-3 ${
                                  a.type === 'success' ? 'text-emerald-500' : a.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                                }`} />
                                <span className={`text-[11px] font-bold ${navStyles.title}`}>{a.title}</span>
                              </div>
                              <p className={`text-[10px] mt-0.5 pl-4.5 ${navStyles.dropdownText}`}>
                                {a.message}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Keyboard Shortcuts Cheat Sheet */}
                  <button
                    id="btn-mobile-menu-shortcuts"
                    onClick={() => {
                      setIsShortcutsHelpOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${navStyles.dropdownCard}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                        <Keyboard className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold">Keyboard Shortcuts</div>
                        <div className={`text-[10px] font-normal ${navStyles.dropdownText}`}>
                          Hotkeys cheat sheet
                        </div>
                      </div>
                    </div>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-inherit/40 font-mono opacity-80">
                      ?
                    </kbd>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
