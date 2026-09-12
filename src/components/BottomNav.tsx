import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Target, 
  Wallet, 
  MoreHorizontal, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Coins, 
  ShieldAlert,
  ShieldCheck,
  X
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { MainTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openQuickAdd, theme, transactions = [] } = useFinance();
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const isLight = theme === 'light';
  const hasNoTransactions = !transactions || transactions.length === 0;

  const navItems: { id: MainTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'wealth', label: 'Wealth', icon: TrendingUp },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'account', label: 'Account', icon: Wallet },
    { id: 'more', label: 'More', icon: MoreHorizontal },
  ];

  return (
    <>
      {/* Backdrop for FAB Quick Menu */}
      {isFabMenuOpen && (
        <div 
          onClick={() => setIsFabMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Floating Action Menu Popover */}
      {isFabMenuOpen && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-72 border rounded-3xl shadow-2xl p-3.5 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 ${
          isLight ? 'bg-white border-slate-200 shadow-slate-400/40 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div className={`flex items-center justify-between pb-2 border-b px-1 ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isLight ? 'text-slate-600' : 'text-slate-300'
            }`}>
              Quick Action
            </span>
            <button 
              onClick={() => setIsFabMenuOpen(false)}
              className={`p-1 rounded-full ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Income */}
            <button
              id="fab-add-income"
              onClick={() => {
                setIsFabMenuOpen(false);
                openQuickAdd('income');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 font-bold transition-all active:scale-95"
            >
              <ArrowDownLeft className="w-5 h-5 mb-1 text-emerald-600" />
              <span className="text-xs font-bold">Income</span>
            </button>

            {/* Expense */}
            <button
              id="fab-add-expense"
              onClick={() => {
                setIsFabMenuOpen(false);
                openQuickAdd('expense');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 font-bold transition-all active:scale-95"
            >
              <ArrowUpRight className="w-5 h-5 mb-1 text-rose-600" />
              <span className="text-xs font-bold">Expense</span>
            </button>

            {/* Asset */}
            <button
              id="fab-add-asset"
              onClick={() => {
                setIsFabMenuOpen(false);
                openQuickAdd('asset');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 font-bold transition-all active:scale-95"
            >
              <Coins className="w-5 h-5 mb-1 text-blue-600" />
              <span className="text-xs font-bold">Asset</span>
            </button>

            {/* Liability */}
            <button
              id="fab-add-liability"
              onClick={() => {
                setIsFabMenuOpen(false);
                openQuickAdd('liability');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 font-bold transition-all active:scale-95"
            >
              <ShieldAlert className="w-5 h-5 mb-1 text-amber-600" />
              <span className="text-xs font-bold">Liability</span>
            </button>
          </div>

          {/* Direct FinScore Launcher in FAB Menu */}
          <button
            id="fab-open-finscore"
            onClick={() => {
              setIsFabMenuOpen(false);
              setActiveTab('finscore');
            }}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md active:scale-95 text-xs"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Open FinScore™ & AI Advisor</span>
          </button>
        </div>
      )}

      {/* Main 5-Element Bottom Footer Navigation + Center Action Button */}
      <nav className={`fixed bottom-0 left-0 right-0 z-30 border-t ${
        isLight 
          ? 'border-slate-200/90 bg-white/95 text-slate-800 shadow-xl' 
          : 'border-slate-800/80 bg-slate-950/95 text-white'
      } backdrop-blur-xl px-2 py-2 safe-area-pb lg:hidden transition-colors`}>
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          {/* Tab 1: Overview */}
          <button
            id="mobile-nav-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'overview'
                ? isLight ? 'text-blue-600 font-bold' : 'text-blue-400 font-bold'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${
              activeTab === 'overview' 
                ? isLight ? 'text-blue-600' : 'text-blue-400' 
                : isLight ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <span className="text-[10px] mt-1">Overview</span>
          </button>

          {/* Tab 2: Wealth */}
          <button
            id="mobile-nav-wealth"
            onClick={() => setActiveTab('wealth')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'wealth'
                ? isLight ? 'text-blue-600 font-bold' : 'text-blue-400 font-bold'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${
              activeTab === 'wealth' 
                ? isLight ? 'text-blue-600' : 'text-blue-400' 
                : isLight ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <span className="text-[10px] mt-1">Wealth</span>
          </button>

          {/* Center Plus (+) Button */}
          <div className="relative -top-4">
            {/* Subtle radar pulse glow when empty */}
            {hasNoTransactions && !isFabMenuOpen && (
              <>
                <span className="absolute -inset-1 rounded-full bg-blue-500/40 blur-sm animate-pulse pointer-events-none" />
                <span className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping pointer-events-none duration-1000" />
              </>
            )}

            <button
              id="mobile-nav-center-plus"
              onClick={() => setIsFabMenuOpen(prev => !prev)}
              aria-label="Add transaction, asset, or liability"
              className={`relative w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 border-2 ${
                isLight ? 'border-white' : 'border-slate-950'
              } transition-transform active:scale-95 hover:scale-105 ${
                isFabMenuOpen ? 'rotate-45 bg-slate-800 text-white' : ''
              } ${hasNoTransactions && !isFabMenuOpen ? 'animate-fab-pulse' : ''}`}
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />

              {/* Subtle green indicator beacon when empty */}
              {hasNoTransactions && !isFabMenuOpen && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
                </span>
              )}
            </button>
          </div>

          {/* Tab 3: Goals */}
          <button
            id="mobile-nav-goals"
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'goals'
                ? isLight ? 'text-blue-600 font-bold' : 'text-blue-400 font-bold'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className={`w-5 h-5 ${
              activeTab === 'goals' 
                ? isLight ? 'text-blue-600' : 'text-blue-400' 
                : isLight ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <span className="text-[10px] mt-1">Goals</span>
          </button>

          {/* Tab 4: Account */}
          <button
            id="mobile-nav-account"
            onClick={() => setActiveTab('account')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'account'
                ? isLight ? 'text-blue-600 font-bold' : 'text-blue-400 font-bold'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className={`w-5 h-5 ${
              activeTab === 'account' 
                ? isLight ? 'text-blue-600' : 'text-blue-400' 
                : isLight ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <span className="text-[10px] mt-1">Account</span>
          </button>

          {/* Tab 5: More */}
          <button
            id="mobile-nav-more"
            onClick={() => setActiveTab('more')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'more'
                ? isLight ? 'text-blue-600 font-bold' : 'text-blue-400 font-bold'
                : isLight ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${
              activeTab === 'more' 
                ? isLight ? 'text-blue-600' : 'text-blue-400' 
                : isLight ? 'text-slate-400' : 'text-slate-400'
            }`} />
            <span className="text-[10px] mt-1">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
