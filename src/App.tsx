import React from 'react';
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
  const { activeTab, theme, isMobileFrameSimulated } = useFinance();

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
        <div className="flex-1 flex w-full max-w-7xl mx-auto">
          {/* Desktop Left Sidebar */}
          <Sidebar />

          {/* Main Scrollable View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
            {renderView()}
          </main>
        </div>
      )}

      {/* Mobile Bottom Footer Navigation (shown on native mobile & screens < 1024px) */}
      {!isMobileFrameSimulated && <BottomNav />}

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
