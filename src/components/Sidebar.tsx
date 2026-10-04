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
  X
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { MainTab } from '../types';
import { SidebarProfile } from './SidebarProfile';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    theme,
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar
  } = useFinance();

  const { isClientUser } = useAuth();

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Group 1: Core Navigation (Dashboard, Wealth, Goals, Accounts)
  const coreNavItems: { id: MainTab; label: string; icon: any; badge?: string }[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wealth', label: 'Wealth & Allocation', icon: TrendingUp },
    { id: 'goals', label: 'Goals & Essentials', icon: Target },
    { id: 'account', label: 'Accounts & Budgets', icon: Wallet },
  ];

  // Group 2: Financial Tools (Calendar, Balance Sheet, Reports, Calculators, Admin, Settings)
  // Hide Admin & Advisors portal for Client Users per RBAC specification
  const allToolNavItems: { id: MainTab; label: string; icon: any; badge?: string; adminOnly?: boolean }[] = [
    { id: 'calendar', label: 'Cash Flow Calendar', icon: CalendarDays },
    { id: 'balancesheet', label: 'Balance Sheet & Audit', icon: Scale, badge: 'Audit' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'calculators', label: 'Tools & Calculators', icon: MoreHorizontal },
    { id: 'admin', label: 'Admin & Advisors', icon: ShieldCheck, badge: 'Portal', adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toolNavItems = allToolNavItems.filter(item => !item.adminOnly || !isClientUser);

  const handleNavClick = (id: MainTab) => {
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
                <div className="w-9.5 h-9.5 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform ring-1 ring-blue-400/30 shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-xl sm:text-[22px] tracking-tight group-hover:text-blue-500 transition-colors ${
                      isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      FIX
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30 tracking-wider">
                      WEALTH
                    </span>
                  </div>
                  {/* Palette Dots */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <div className="w-2 h-2 rounded-full bg-[#FA5F55]" />
                    <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                  </div>
                </div>
              </div>

              {/* Sidebar Close Button */}
              <button
                id="btn-sidebar-collapse"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close sidebar"
                title="Close sidebar (⌘B / [ )"
                className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                  isLight 
                    ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800 border-slate-200' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
                }`}
              >
                <PanelLeftClose className="w-4 h-4" />
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
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25 hover:scale-110 active:scale-95 transition-all ring-1 ring-blue-400/30 cursor-pointer group"
              >
                <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
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
                  /* Collapsed Icon-only view with tooltip */
                  return (
                    <div key={item.id} className="relative group flex justify-center">
                      <button
                        id={`sidebar-nav-${item.id}`}
                        onClick={() => handleNavClick(item.id)}
                        aria-label={item.label}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? isLight
                              ? 'bg-slate-100 text-blue-600 border border-slate-300 shadow-xs'
                              : 'bg-slate-800 text-blue-400 border border-slate-700 shadow-xs'
                            : isLight
                              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? (isLight ? 'text-blue-600' : 'text-blue-400') : ''}`} />
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
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
                      <Icon className={`w-4 h-4 shrink-0 ${
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
                  /* Collapsed Icon-only view with tooltip */
                  return (
                    <div key={item.id} className="relative group flex justify-center">
                      <button
                        key={item.id}
                        id={`sidebar-nav-${item.id}`}
                        onClick={() => handleNavClick(item.id)}
                        aria-label={item.label}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          isActive
                            ? isLight
                              ? 'bg-slate-100 text-blue-600 border border-slate-300 shadow-xs'
                              : 'bg-slate-800 text-blue-400 border border-slate-700 shadow-xs'
                            : isLight
                              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? (isLight ? 'text-blue-600' : 'text-blue-400') : ''}`} />
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
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
                      <Icon className={`w-4 h-4 shrink-0 ${
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
