import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Target, 
  Wallet, 
  MoreHorizontal, 
  CalendarDays, 
  BarChart3, 
  Calculator, 
  Plus, 
  ShieldCheck, 
  PieChart, 
  Layers,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { MainTab } from '../types';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    openQuickAdd, 
    healthScore, 
    formatMoney, 
    netWorth,
    totalAssets,
    totalLiabilities,
    theme
  } = useFinance();

  const isLight = theme === 'light';

  const navItems: { id: MainTab; label: string; icon: any; badge?: string }[] = [
    { id: 'overview', label: 'Dashboard & Overview', icon: LayoutDashboard },
    { id: 'wealth', label: 'Wealth & Allocation', icon: TrendingUp },
    { id: 'goals', label: 'Goals & Essentials', icon: Target },
    { id: 'account', label: 'Accounts & Budgets', icon: Wallet },
    { id: 'calendar', label: 'Cash Flow Calendar', icon: CalendarDays },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'more', label: 'Tools, More & Settings', icon: MoreHorizontal },
  ];

  return (
    <aside className={`w-64 shrink-0 hidden lg:flex flex-col justify-between h-[calc(100vh-61px)] border-r ${
      isLight ? 'border-slate-200/90 bg-white/90 text-slate-900 shadow-sm' : 'border-slate-800/60 bg-slate-950/80 text-white'
    } backdrop-blur-md px-3 py-4 sticky top-[61px] select-none transition-colors`}>
      <div className="space-y-5">
        {/* Quick Add Action Button */}
        <div>
          <button
            id="btn-sidebar-quick-add"
            onClick={() => openQuickAdd('income')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 border border-blue-400/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Record Transaction / Asset</span>
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="space-y-1">
          <div className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-wider ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Navigation Menu
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
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
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? isLight ? 'text-blue-600' : 'text-blue-400' 
                      : isLight ? 'text-slate-500' : 'text-slate-400'
                  }`} />
                  <span>{item.label}</span>
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

      {/* Bottom Capital Summary & Health Widget */}
      <div className={`space-y-3 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
        {/* Balance Sheet Mini Card */}
        <div className={`p-3.5 rounded-2xl border space-y-2 ${
          isLight ? 'bg-slate-50 border-slate-200 shadow-sm text-slate-800' : 'bg-slate-900/70 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>Balance Sheet</span>
            <span className="text-[10px] text-blue-500 font-mono bg-blue-500/15 border border-blue-500/20 px-1.5 py-0.5 rounded-full font-medium">
              Audited
            </span>
          </div>
          
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Assets</span>
              <span className={`font-mono ${isLight ? 'text-slate-800 font-bold' : 'text-slate-200'}`}>{formatMoney(totalAssets)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Liabilities</span>
              <span className="font-mono text-rose-500 font-bold">{formatMoney(totalLiabilities)}</span>
            </div>
            <div className={`h-px pt-0.5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
            <div className="flex items-center justify-between pt-0.5 font-semibold">
              <span className={`text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Net Worth</span>
              <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{formatMoney(netWorth)}</span>
            </div>
          </div>
        </div>

        {/* Health Score Pill */}
        <div 
          onClick={() => {
            setActiveTab('account');
          }}
          className={`p-2.5 rounded-2xl border cursor-pointer transition-all group ${
            isLight 
              ? 'bg-slate-50 border-slate-200 hover:border-blue-300 hover:bg-slate-100/80 shadow-sm' 
              : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                {healthScore.grade}
              </div>
              <div>
                <div className={`text-xs font-bold transition-colors ${
                  isLight ? 'text-slate-800 group-hover:text-blue-600' : 'text-slate-200 group-hover:text-blue-300'
                }`}>
                  Health Score {healthScore.score}/100
                </div>
                <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Solid Financial State
                </div>
              </div>
            </div>
            <ArrowUpRight className={`w-4 h-4 transition-colors ${
              isLight ? 'text-slate-400 group-hover:text-blue-600' : 'text-slate-400 group-hover:text-blue-400'
            }`} />
          </div>
        </div>
      </div>
    </aside>
  );
};
