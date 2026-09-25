import React, { useEffect, useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Zap } from 'lucide-react';

export interface ShortcutItem {
  key: string;
  displayKey: string;
  label: string;
  category: 'Actions' | 'Navigation' | 'General';
  description: string;
}

export const SHORTCUT_DEFINITIONS: ShortcutItem[] = [
  // Actions
  { key: 'n', displayKey: 'N', label: 'New Transaction', category: 'Actions', description: 'Open quick entry modal for expense or income' },
  { key: '/', displayKey: '/', label: 'Global Search', category: 'Actions', description: 'Quick search transactions, assets, and liabilities' },
  { key: 'Shift+A', displayKey: '⇧ + A', label: 'Quick Add Asset', category: 'Actions', description: 'Open modal directly on Asset addition' },
  { key: 'Shift+L', displayKey: '⇧ + L', label: 'Quick Add Liability', category: 'Actions', description: 'Open modal directly on Liability entry' },
  
  // Navigation
  { key: 'c', displayKey: 'C', label: 'Calculators', category: 'Navigation', description: 'Direct jump to SIP, EMI, FIRE & financial calculators' },
  { key: 'a', displayKey: 'A', label: 'Assets & Portfolio', category: 'Navigation', description: 'Navigate directly to Wealth Assets view' },
  { key: 'l', displayKey: 'L', label: 'Liabilities & Debts', category: 'Navigation', description: 'Navigate directly to Liabilities & loan obligations' },
  { key: 'o', displayKey: 'O', label: 'Dashboard Overview', category: 'Navigation', description: 'Return to net worth overview & metrics' },
  { key: 'g', displayKey: 'G', label: 'Goals & Essentials', category: 'Navigation', description: 'Navigate to runway, targets, and goals' },
  { key: 'b', displayKey: 'B', label: 'Balance Sheet', category: 'Navigation', description: 'Audit statement of assets vs liabilities' },
  { key: 'r', displayKey: 'R', label: 'Reports & Analytics', category: 'Navigation', description: 'Cash flow analytics and annual trends' },
  { key: 's', displayKey: 'S', label: 'Settings', category: 'Navigation', description: 'Preferences, currency, backups & shortcuts toggle' },

  // General
  { key: 'Cmd+B', displayKey: '⌘ + B', label: 'Toggle Sidebar', category: 'General', description: 'Open or close the left navigation sidebar' },
  { key: '[', displayKey: '[', label: 'Toggle Sidebar', category: 'Navigation', description: 'Quick key to collapse or expand the navigation sidebar' },
  { key: '?', displayKey: '?', label: 'Shortcuts Reference', category: 'General', description: 'Show keyboard shortcuts cheat sheet modal' },
  { key: 'Escape', displayKey: 'Esc', label: 'Close Dialogs', category: 'General', description: 'Close any active modal, search, or dialog' },
];

export const GlobalKeyboardShortcuts: React.FC = () => {
  const {
    keyboardShortcutsEnabled,
    setActiveTab,
    setWealthSubTab,
    openQuickAdd,
    isQuickAddOpen,
    closeQuickAdd,
    isSearchOpen,
    setSearchOpen,
    isShortcutsHelpOpen,
    setIsShortcutsHelpOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    toggleSidebar,
    theme
  } = useFinance();

  const isLight = theme === 'light';
  const [toastMessage, setToastMessage] = useState<{ title: string; badge: string } | null>(null);

  const showToast = (title: string, badge: string) => {
    setToastMessage({ title, badge });
    setTimeout(() => {
      setToastMessage(current => (current?.title === title ? null : current));
    }, 1400);
  };

  useEffect(() => {
    const isInputElement = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tagName = target.tagName.toUpperCase();
      return (
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT' ||
        target.isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetIsInput = isInputElement(e.target);

      // 1. ESCAPE Key: always handle closing modals and blurring inputs
      if (e.key === 'Escape') {
        if (isShortcutsHelpOpen) {
          e.preventDefault();
          setIsShortcutsHelpOpen(false);
          return;
        }
        if (isSearchOpen) {
          e.preventDefault();
          setSearchOpen(false);
          return;
        }
        if (isQuickAddOpen) {
          e.preventDefault();
          closeQuickAdd();
          return;
        }
        if (typeof window !== 'undefined' && window.innerWidth < 1024 && isSidebarOpen) {
          e.preventDefault();
          setIsSidebarOpen(false);
          return;
        }
        if (targetIsInput) {
          (e.target as HTMLElement).blur();
          return;
        }
      }

      // If user is actively typing in a form input, textarea, or select, do not trigger single-key shortcuts
      if (targetIsInput) {
        return;
      }

      // 2. Cmd+B / Ctrl+B: Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        if (keyboardShortcutsEnabled) {
          toggleSidebar();
          showToast(isSidebarOpen ? 'Sidebar Closed' : 'Sidebar Opened', '⌘B');
        }
        return;
      }

      // 3. Cmd+K / Ctrl+K search shortcut (standard system shortcut)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (keyboardShortcutsEnabled) {
          setSearchOpen(true);
          showToast('Global Search', '⌘K');
        }
        return;
      }

      // If other modifier keys (Ctrl, Alt, Meta) are held down, ignore to not interfere with browser combinations
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      // 3. Question mark '?' for shortcuts modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        // Allow ? to show shortcuts modal even if disabled, so user can see shortcuts and enable them
        setIsShortcutsHelpOpen(prev => !prev);
        return;
      }

      // If keyboard shortcuts are disabled in Settings, do not execute any navigation or action shortcuts
      if (!keyboardShortcutsEnabled) {
        return;
      }

      // If any modal is currently active, do not execute single-letter background navigation shortcuts
      if (isQuickAddOpen || isSearchOpen || isShortcutsHelpOpen) {
        return;
      }

      // 4. Action Shortcuts
      // 'n' or 'N' (without shift): New Transaction
      if ((e.key === 'n' || e.key === 'N') && !e.shiftKey) {
        e.preventDefault();
        openQuickAdd('expense');
        showToast('New Transaction Entry', 'N');
        return;
      }

      // '/' : Global Search
      if (e.key === '/') {
        e.preventDefault();
        setSearchOpen(true);
        showToast('Global Search', '/');
        return;
      }

      // Shift + A : Add Asset
      if (e.key === 'A' && e.shiftKey) {
        e.preventDefault();
        openQuickAdd('asset');
        showToast('Quick Add Asset', '⇧+A');
        return;
      }

      // Shift + L : Add Liability
      if (e.key === 'L' && e.shiftKey) {
        e.preventDefault();
        openQuickAdd('liability');
        showToast('Quick Add Liability', '⇧+L');
        return;
      }

      // 5. Navigation Shortcuts
      // 'c' or 'C': Calculators
      if ((e.key === 'c' || e.key === 'C') && !e.shiftKey) {
        e.preventDefault();
        setActiveTab('calculators');
        showToast('Financial Calculators', 'C');
        return;
      }

      // 'a' or 'A': Wealth Assets
      if ((e.key === 'a' || e.key === 'A') && !e.shiftKey) {
        e.preventDefault();
        setActiveTab('wealth');
        setWealthSubTab('assets');
        showToast('Assets & Portfolio', 'A');
        return;
      }

      // 'l' or 'L': Wealth Liabilities
      if ((e.key === 'l' || e.key === 'L') && !e.shiftKey) {
        e.preventDefault();
        setActiveTab('wealth');
        setWealthSubTab('liabilities');
        showToast('Liabilities & Debts', 'L');
        return;
      }

      // 'o' or 'O' or 'h' or 'H': Overview / Home
      if ((e.key === 'o' || e.key === 'O' || e.key === 'h' || e.key === 'H') && !e.shiftKey) {
        e.preventDefault();
        setActiveTab('overview');
        showToast('Dashboard Overview', 'O');
        return;
      }

      // 'g' or 'G': Goals & Essentials
      if ((e.key === 'g' || e.key === 'G') && !e.shiftKey) {
        e.preventDefault();
        setActiveTab('goals');
        showToast('Goals & Essentials', 'G');
        return;
      }

      // 'b' or 'B': Balance Sheet
      if ((e.key === 'b' || e.key === 'B') && !e.shiftKey) {
        e.preventDefault();
        setActiveTab('balancesheet');
        showToast('Balance Sheet Statement', 'B');
        return;
      }

      // 'r' or 'R': Reports & Analytics
      if ((e.key === 'r' || e.key === 'R') && !e.shiftKey) {
        e.preventDefault();
        setActiveTab('reports');
        showToast('Reports & Analytics', 'R');
        return;
      }

      // 's' or 'S': Settings
      if ((e.key === 's' || e.key === 'S') && !e.shiftKey) {
        e.preventDefault();
        setActiveTab('settings');
        showToast('Settings & Preferences', 'S');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    keyboardShortcutsEnabled,
    isQuickAddOpen,
    isSearchOpen,
    isShortcutsHelpOpen,
    setActiveTab,
    setWealthSubTab,
    openQuickAdd,
    closeQuickAdd,
    setSearchOpen,
    setIsShortcutsHelpOpen
  ]);

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-xl backdrop-blur-md text-xs font-semibold ${
        isLight 
          ? 'bg-slate-900/90 text-white border-slate-700 shadow-slate-900/25' 
          : 'bg-zinc-900/95 text-zinc-100 border-zinc-700 shadow-black/60'
      }`}>
        <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
        <span>{toastMessage.title}</span>
        <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/20 text-white border border-white/20">
          {toastMessage.badge}
        </kbd>
      </div>
    </div>
  );
};
