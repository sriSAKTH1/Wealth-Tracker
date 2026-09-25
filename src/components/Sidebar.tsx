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
  X
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
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

  const isLight = theme === 'light';

  // Primary Core Navigation Items (Top)
  const topNavItems: { id: MainTab; label: string; icon: any; badge?: string; shortcut?: string }[] = [
    { id: 'overview', label: 'Dashboard & Overview', icon: LayoutDashboard, shortcut: 'O' },
    { id: 'wealth', label: 'Wealth & Allocation', icon: TrendingUp, shortcut: 'A' },
    { id: 'goals', label: 'Goals & Essentials', icon: Target, shortcut: 'G' },
    { id: 'account', label: 'Accounts & Budgets', icon: Wallet },
  ];

  // Bottom Navigation Items (Cash Flow Calendar, Balance Sheet, Reports, Tools, and New Settings)
  const bottomNavItems: { id: MainTab; label: string; icon: any; badge?: string; shortcut?: string }[] = [
    { id: 'calendar', label: 'Cash Flow Calendar', icon: CalendarDays },
    { id: 'balancesheet', label: 'Balance Sheet & Audit', icon: Scale, badge: 'Audit', shortcut: 'B' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, shortcut: 'R' },
    { id: 'calculators', label: 'Tools & Calculators', icon: MoreHorizontal, shortcut: 'C' },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: 'S' },
  ];

  const handleNavClick = (id: MainTab) => {
    setActiveTab(id);
    // On mobile / tablet screens (< 1024px), close the slide-out drawer upon navigation
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (shown on mobile when sidebar drawer is open) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Drawer on mobile, Sticky Collapsible Bar on desktop) */}
      <aside 
        id="desktop-sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 lg:static lg:h-[calc(100vh-61px)] lg:sticky lg:top-[61px]
          flex flex-col justify-between shrink-0 select-none
          backdrop-blur-md px-3 py-4 transition-all duration-300 ease-in-out
          ${isLight 
            ? 'border-slate-200/90 bg-white/95 text-slate-900 shadow-2xl lg:shadow-none' 
            : 'border-slate-800/60 bg-slate-950/95 text-white shadow-2xl lg:shadow-none'
          }
          ${isSidebarOpen 
            ? 'w-72 max-w-[85vw] lg:w-64 border-r translate-x-0 opacity-100' 
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:border-r-0 lg:opacity-0 lg:overflow-hidden pointer-events-none'
          }
        `}
      >
        {/* Sidebar Header with Open/Close Toggle Option */}
        <div className="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Menu Navigation
            </span>
          </div>
          
          <button
            id="btn-sidebar-close"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
            title="Close sidebar (⌘B)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <PanelLeftClose className="w-4 h-4 hidden lg:block" />
            <X className="w-4 h-4 lg:hidden" />
          </button>
        </div>

        {/* Top Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 -mr-1">
          <nav className="space-y-1">
            {topNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? isLight 
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200 font-bold' 
                        : 'bg-blue-600/15 text-blue-400 shadow-sm border border-blue-500/30 font-semibold'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive 
                        ? isLight ? 'text-blue-600' : 'text-blue-400' 
                        : isLight ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 font-mono font-medium">
                        {item.badge}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Navigation Section: Calendar, Balance Sheet, Reports, Tools & Settings */}
        <div className="shrink-0 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1 my-2">
          <nav className="space-y-1">
            {bottomNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? isLight 
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200 font-bold' 
                        : 'bg-blue-600/15 text-blue-400 shadow-sm border border-blue-500/30 font-semibold'
                      : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive 
                        ? isLight ? 'text-blue-600' : 'text-blue-400' 
                        : isLight ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                        item.badge === 'New' 
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 font-bold' 
                          : 'bg-blue-500/15 text-blue-500'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Fixed Bottom Profile Component */}
        <SidebarProfile />
      </aside>
    </>
  );
};
