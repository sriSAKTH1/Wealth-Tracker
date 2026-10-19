import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Target, 
  Wallet, 
  MoreHorizontal, 
  CalendarDays, 
  BarChart3,
  Scale,
  Settings,
  PanelLeftClose,
  Sparkles,
  ShieldCheck,
  X,
  Newspaper
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { MainTab } from '../types';
import { SidebarProfile } from './SidebarProfile';
import { FixWealthLogo } from './common/FixWealthLogo';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    theme,
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar
  } = useFinance();

  const { isAdmin, isCalculatorOnlyMode, openAuthModal, showNotification } = useAuth();

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Group 1: Core Navigation (Dashboard, FinScore, Wealth, Goals, Accounts)
  const coreNavItems: { id: MainTab; label: string; icon: any; badge?: string }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'finscore', label: 'FinScore™ & Advice', icon: Sparkles, badge: 'Pillars' },
    { id: 'wealth', label: 'Wealth & Allocation', icon: TrendingUp },
    { id: 'goals', label: 'Goals & Essentials', icon: Target },
    { id: 'account', label: 'Accounts & Budgets', icon: Wallet },
  ];

  // Group 2: Financial Tools (Calendar, Balance Sheet, Reports, Calculators, News, Admin, Settings)
  const allToolNavItems: { id: MainTab; label: string; icon: any; badge?: string; adminOnly?: boolean }[] = [
    { id: 'calendar', label: 'Cash Flow Calendar', icon: CalendarDays },
    { id: 'balancesheet', label: 'Balance Sheet & Audit', icon: Scale, badge: 'Audit' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'calculators', label: 'Tools & Calculators', icon: MoreHorizontal },
    { id: 'news', label: 'News & Release Blogs', icon: Newspaper, badge: 'New' },
    { id: 'admin', label: 'Admin Control Panel', icon: ShieldCheck, badge: 'Master', adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toolNavItems = allToolNavItems.filter(item => !item.adminOnly || isAdmin);

  const handleNavClick = (id: MainTab) => {
    if (isCalculatorOnlyMode && id !== 'calculators') {
      openAuthModal('register');
      showNotification('Sign up or log in to access the full wealth dashboard, net worth tracking, and portfolio tools.');
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
      return;
    }
    setActiveTab(id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Full-Height Top-to-End Sidebar */}
      <aside 
        id="desktop-sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:h-screen lg:sticky lg:top-0
          flex flex-col justify-between shrink-0 select-none
          backdrop-blur-md transition-all duration-300 ease-in-out border-r
          ${isLight 
            ? 'border-slate-200/90 bg-white/95 text-slate-900 shadow-2xl lg:shadow-none' 
            : 'border-slate-800/80 bg-slate-950/95 text-white shadow-2xl lg:shadow-none'
          }
          ${isSidebarOpen 
            ? 'w-64 sm:w-68 px-3.5 py-4 translate-x-0' 
            : '-translate-x-full lg:translate-x-0 lg:w-[74px] px-2.5 py-4'
          }
        `}
      >
        {/* Top Header: Brand / Logo & Toggle */}
        <div className="shrink-0 space-y-2">
          {/* Mobile close 'X' button */}
          <div className="flex items-center justify-end lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Brand Logo Row */}
          {isSidebarOpen ? (
            /* Expanded Brand with Logo, Title, Palette Dots, and Collapse Toggle Button */
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <div 
                onClick={() => handleNavClick('overview')}
                className="flex items-center gap-3 cursor-pointer group min-w-0"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/15 to-teal-700/20 flex items-center justify-center p-1 group-hover:scale-105 transition-transform ring-1 ring-emerald-500/30 shrink-0">
                  <FixWealthLogo className="w-8 h-8" showRoots={true} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-xl sm:text-[22px] tracking-tight group-hover:text-emerald-500 transition-colors ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      FIX
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 tracking-wider">
                      WEALTH
                    </span>
                  </div>
                  {/* Palette Dots */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    <div className="w-2 h-2 rounded-full bg-[#FA5F55]" />
                  </div>
                </div>
              </div>

              {/* Sidebar Close Button */}
              <button
                id="btn-sidebar-collapse"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close sidebar"
                title="Close sidebar (⌘B / [ )"
                className={`group p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  isLight 
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                <PanelLeftClose className="w-4 h-4 group-hover:-translate-x-0.5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          ) : (
            /* Collapsed Brand: Centered Logo only (Click logo to open sidebar) */
            <div className="flex flex-col items-center pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <button
                id="btn-sidebar-logo-expand"
                onClick={() => setIsSidebarOpen(true)}
                title="Open sidebar"
                aria-label="Open sidebar"
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-600/15 to-teal-700/20 flex items-center justify-center p-1 hover:scale-110 active:scale-95 transition-all ring-1 ring-emerald-500/30 cursor-pointer group"
              >
                <FixWealthLogo className="w-9 h-9" showRoots={true} />
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Center Navigation Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-4">
          {/* SECTION 1: MAIN NAVIGATION */}
          <div>
            {isSidebarOpen && (
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Main
              </div>
            )}
            <nav className="space-y-1">
              {coreNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (!isSidebarOpen) {
                  /* Collapsed Icon-only view with tooltip and animated signature icon */
                  return (
                    <div key={item.id} className="relative group flex justify-center">
                      <button
                        id={`sidebar-nav-${item.id}`}
                        data-nav-id={item.id}
                        onClick={() => handleNavClick(item.id)}
                        aria-label={item.label}
                        className={`sidebar-closed-nav-item group w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? isLight
                              ? 'bg-slate-100 text-blue-600 border border-slate-300 shadow-xs ring-1 ring-blue-500/20'
                              : 'bg-slate-800 text-blue-400 border border-slate-700 shadow-xs ring-1 ring-blue-400/20'
                            : isLight
                              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border hover:border-slate-300/80'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:border hover:border-slate-700/80'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 icon-hover-${item.id} transition-transform duration-200 ${
                          isActive ? (isLight ? 'text-blue-600' : 'text-blue-400') : ''
                        }`} />
                      </button>

                      {/* Tooltip on right */}
                      <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5 top-1/2 -translate-y-1/2">
                        <span>{item.label}</span>
                      </div>
                    </div>
                  );
                }

                /* Expanded Full view */
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`sidebar-open-nav-item group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? isLight 
                          ? 'bg-slate-100 text-slate-900 shadow-xs border border-slate-200 font-semibold' 
                          : 'bg-slate-800/90 text-white shadow-xs border border-slate-700/80 font-semibold'
                        : isLight
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 icon-hover-${item.id} ${
                        isActive 
                          ? isLight ? 'text-blue-600' : 'text-blue-400' 
                          : isLight ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Subtle Divider */}
          <div className={isSidebarOpen ? 'border-t border-slate-200/80 dark:border-slate-800/80 my-2' : 'w-8 h-px bg-slate-200 dark:bg-slate-800 mx-auto my-2'} />

          {/* SECTION 2: FINANCIAL TOOLS */}
          <div>
            {isSidebarOpen && (
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Campaigns
              </div>
            )}
            <nav className="space-y-1">
              {toolNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                if (!isSidebarOpen) {
                  /* Collapsed Icon-only view with tooltip and animated signature icon */
                  return (
                    <div key={item.id} className="relative group flex justify-center">
                      <button
                        id={`sidebar-nav-${item.id}`}
                        data-nav-id={item.id}
                        onClick={() => handleNavClick(item.id)}
                        aria-label={item.label}
                        className={`sidebar-closed-nav-item group w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? isLight
                              ? 'bg-slate-100 text-blue-600 border border-slate-300 shadow-xs ring-1 ring-blue-500/20'
                              : 'bg-slate-800 text-blue-400 border border-slate-700 shadow-xs ring-1 ring-blue-400/20'
                            : isLight
                              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border hover:border-slate-300/80'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:border hover:border-slate-700/80'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 icon-hover-${item.id} transition-transform duration-200 ${
                          isActive ? (isLight ? 'text-blue-600' : 'text-blue-400') : ''
                        }`} />
                      </button>

                      {/* Tooltip on right */}
                      <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs whitespace-nowrap shadow-xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5 top-1/2 -translate-y-1/2">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-400 font-mono">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }

                /* Expanded view */
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`sidebar-open-nav-item group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? isLight 
                          ? 'bg-slate-100 text-slate-900 shadow-xs border border-slate-200 font-semibold' 
                          : 'bg-slate-800/90 text-white shadow-xs border border-slate-700/80 font-semibold'
                        : isLight
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 icon-hover-${item.id} ${
                        isActive 
                          ? isLight ? 'text-blue-600' : 'text-blue-400' 
                          : isLight ? 'text-slate-500' : 'text-slate-400'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 font-mono font-medium">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Profile Component */}
        <SidebarProfile isCollapsed={!isSidebarOpen} />
      </aside>
    </>
  );
};
