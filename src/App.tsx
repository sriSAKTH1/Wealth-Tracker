import React from 'react';
import { Plus } from 'lucide-react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Views
import { OverviewView } from './components/views/OverviewView';
import { WealthView } from './components/views/WealthView';
import { GoalsView } from './components/views/GoalsView';
import { AccountsView } from './components/views/AccountsView';
import { MoreView } from './components/views/MoreView';
import { CalendarView } from './components/views/CalendarView';
import { ReportsView } from './components/views/ReportsView';

const MainLayout: React.FC = () => {
  const { activeTab, theme, isMobileFrameSimulated, openQuickAdd, transactions } = useFinance();
  const hasNoTransactions = transactions.length === 0;

  // Render current active view
  const renderView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'wealth':
        return <WealthView />;
      case 'goals':
        return <GoalsView />;
      case 'account':
        return <AccountsView />;
      case 'more':
        return <MoreView />;
      case 'calendar':
        return <CalendarView />;
      case 'reports':
        return <ReportsView />;
      default:
        return <OverviewView />;
    }
  };

  // Theme styling mapper
  const themeClasses: Record<string, string> = {
    coolors: 'bg-[#0a0e1a] text-slate-100 dark-theme',
    dark: 'bg-zinc-950 text-zinc-100 dark-theme',
    midnight: 'bg-black text-zinc-100 dark-theme',
    emerald: 'bg-[#06140f] text-emerald-50 dark-theme',
    slate: 'bg-slate-950 text-slate-100 dark-theme',
    light: 'bg-[#f4f7fb] text-slate-900 light-theme',
  };

  return (
    <div className={`min-h-screen w-full flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${themeClasses[theme] || 'bg-zinc-950 text-zinc-100'}`}>
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      {isMobileFrameSimulated ? (
        /* Mobile Simulator Mode for Desktop */
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-zinc-950/80">
          <div className="w-full max-w-sm h-[780px] bg-zinc-950 border-[6px] border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col relative ring-1 ring-zinc-700/50">
            {/* Phone Speaker Notch */}
            <div className="w-28 h-4 bg-zinc-900 rounded-b-xl mx-auto flex items-center justify-center shrink-0 z-40">
              <div className="w-10 h-1 bg-zinc-700 rounded-full" />
            </div>

            {/* Scrollable View inside phone */}
            <main className="flex-1 overflow-y-auto p-4 relative no-scrollbar">
              {renderView()}
            </main>

            {/* Bottom Nav inside phone */}
            <BottomNav />
          </div>
        </div>
      ) : (
        /* Standard Responsive System & Mobile Layout */
        <div className="flex-1 flex w-full">
          {/* Desktop Left Fixed Sidebar */}
          <Sidebar />

          {/* Main Scrollable View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              {renderView()}
            </div>
          </main>
        </div>
      )}

      {/* Mobile Bottom Footer Navigation (shown on native mobile & screens < 1024px) */}
      {!isMobileFrameSimulated && <BottomNav />}

      {/* Floating Action (+) Button in the Bottom Right Corner */}
      <div className="fixed bottom-20 sm:bottom-6 right-5 sm:right-6 z-40 flex items-center gap-2.5">
        {/* Helper invite badge on empty transactions state */}
        {hasNoTransactions && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/90 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 border border-blue-400/30 animate-pulse backdrop-blur-md">
            <span>Add first entry</span>
            <span className="text-[10px] opacity-80">✨</span>
          </div>
        )}

        <div className="relative">
          {/* Subtle radar expanding ping for empty state */}
          {hasNoTransactions && (
            <>
              <span className="absolute -inset-1 rounded-full bg-blue-500/40 blur-sm animate-pulse pointer-events-none" />
              <span className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping pointer-events-none duration-1000" />
            </>
          )}

          <button
            id="btn-floating-quick-add"
            onClick={() => openQuickAdd('income')}
            aria-label="Add transaction, asset, or liability"
            title={hasNoTransactions ? "Add your first transaction" : "Quick Add (Transaction, Asset, Liability)"}
            className={`relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 group focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
              hasNoTransactions ? 'animate-fab-pulse' : ''
            }`}
          >
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
            
            {/* Subtle green indicator beacon when empty */}
            {hasNoTransactions && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Global Quick Action (+) Modal */}
      <QuickAddModal />

      {/* Global ⌘K Search Modal */}
      <GlobalSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
}
