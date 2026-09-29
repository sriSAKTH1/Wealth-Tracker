import React from 'react';
import { 
  Keyboard, 
  X, 
  Check, 
  ToggleLeft, 
  ToggleRight, 
  Zap, 
  Search, 
  ExternalLink,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SHORTCUT_DEFINITIONS } from './GlobalKeyboardShortcuts';

export const KeyboardShortcutsModal: React.FC = () => {
  const {
    isShortcutsHelpOpen,
    setIsShortcutsHelpOpen,
    keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled,
    setActiveTab,
    setWealthSubTab,
    openQuickAdd,
    setSearchOpen,
    theme
  } = useFinance();

  if (!isShortcutsHelpOpen) return null;

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const actionShortcuts = SHORTCUT_DEFINITIONS.filter(s => s.category === 'Actions');
  const navigationShortcuts = SHORTCUT_DEFINITIONS.filter(s => s.category === 'Navigation');
  const generalShortcuts = SHORTCUT_DEFINITIONS.filter(s => s.category === 'General');

  const executeShortcut = (shortcutKey: string) => {
    setIsShortcutsHelpOpen(false);
    setTimeout(() => {
      switch (shortcutKey) {
        case 'n':
          openQuickAdd('expense');
          break;
        case '/':
          setSearchOpen(true);
          break;
        case 'Shift+A':
          openQuickAdd('asset');
          break;
        case 'Shift+L':
          openQuickAdd('liability');
          break;
        case 'c':
          setActiveTab('calculators');
          break;
        case 'a':
          setActiveTab('wealth');
          setWealthSubTab('assets');
          break;
        case 'l':
          setActiveTab('wealth');
          setWealthSubTab('liabilities');
          break;
        case 'o':
          setActiveTab('overview');
          break;
        case 'g':
          setActiveTab('goals');
          break;
        case 'b':
          setActiveTab('balancesheet');
          break;
        case 'r':
          setActiveTab('reports');
          break;
        case 's':
          setActiveTab('settings');
          break;
        default:
          break;
      }
    }, 80);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsShortcutsHelpOpen(false)}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/20' 
            : 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-black/80'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-5 border-b flex items-center justify-between gap-4 ${
          isLight ? 'border-slate-100 bg-slate-50/70' : 'border-zinc-800/80 bg-zinc-900/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">Keyboard Shortcuts</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  keyboardShortcutsEnabled 
                    ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' 
                    : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                }`}>
                  {keyboardShortcutsEnabled ? 'Enabled & Active' : 'Disabled in Settings'}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Navigate and execute actions with single key presses
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsShortcutsHelpOpen(false)}
            aria-label="Close shortcuts modal"
            className={`p-2 rounded-xl transition-colors ${
              isLight 
                ? 'hover:bg-slate-200 text-slate-500 hover:text-slate-800' 
                : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Master Toggle Bar */}
        <div className={`px-6 py-3 border-b flex items-center justify-between text-xs ${
          keyboardShortcutsEnabled
            ? isLight ? 'bg-blue-50/50 border-blue-100 text-blue-900' : 'bg-blue-950/20 border-blue-900/40 text-blue-300'
            : isLight ? 'bg-slate-100/60 border-slate-200 text-slate-700' : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
        }`}>
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${keyboardShortcutsEnabled ? 'text-blue-500' : 'text-slate-400'}`} />
            <span>
              {keyboardShortcutsEnabled 
                ? 'Keyboard shortcuts are active. Press keys anywhere outside form inputs.' 
                : 'Shortcuts are currently paused. Toggle on below or in Settings.'}
            </span>
          </div>
          <button
            onClick={() => setKeyboardShortcutsEnabled(!keyboardShortcutsEnabled)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
              keyboardShortcutsEnabled
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {keyboardShortcutsEnabled ? (
              <>
                <ToggleRight className="w-4 h-4" />
                <span>Active</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4" />
                <span>Turn On</span>
              </>
            )}
          </button>
        </div>

        {/* Scrollable List of Shortcuts */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Shortcuts */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Quick Actions & Entry
              </h3>
              <span className="text-[10px] text-slate-400">Click any row to test</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {actionShortcuts.map(item => (
                <div
                  key={item.key}
                  onClick={() => executeShortcut(item.key)}
                  className={`group p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isLight 
                      ? 'bg-slate-50/80 border-slate-200/80 hover:bg-blue-50/60 hover:border-blue-300' 
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold flex items-center gap-1.5 group-hover:text-blue-500 transition-colors">
                      <span>{item.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      {item.description}
                    </div>
                  </div>
                  <kbd className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-mono font-bold shadow-sm border ${
                    isLight 
                      ? 'bg-white border-slate-300 text-slate-800 shadow-slate-200' 
                      : 'bg-zinc-950 border-zinc-700 text-zinc-200 shadow-black'
                  }`}>
                    {item.displayKey}
                  </kbd>
                </div>
              ))}
            </div>
          </section>

          {/* Navigation Shortcuts */}
          <section className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Navigation & Views
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {navigationShortcuts.map(item => (
                <div
                  key={item.key}
                  onClick={() => executeShortcut(item.key)}
                  className={`group p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isLight 
                      ? 'bg-slate-50/80 border-slate-200/80 hover:bg-blue-50/60 hover:border-blue-300' 
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-900 hover:border-zinc-700'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold flex items-center gap-1.5 group-hover:text-blue-500 transition-colors">
                      <span>{item.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      {item.description}
                    </div>
                  </div>
                  <kbd className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-mono font-bold shadow-sm border ${
                    isLight 
                      ? 'bg-white border-slate-300 text-slate-800 shadow-slate-200' 
                      : 'bg-zinc-950 border-zinc-700 text-zinc-200 shadow-black'
                  }`}>
                    {item.displayKey}
                  </kbd>
                </div>
              ))}
            </div>
          </section>

          {/* General & Accessibility */}
          <section className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              System & Accessibility
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {generalShortcuts.map(item => (
                <div
                  key={item.key}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50/80 border-slate-200/80' : 'bg-zinc-900/60 border-zinc-800/80'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                      {item.description}
                    </div>
                  </div>
                  <kbd className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-mono font-bold shadow-sm border ${
                    isLight 
                      ? 'bg-white border-slate-300 text-slate-800 shadow-slate-200' 
                      : 'bg-zinc-950 border-zinc-700 text-zinc-200 shadow-black'
                  }`}>
                    {item.displayKey}
                  </kbd>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
          isLight ? 'border-slate-100 bg-slate-50 text-slate-500' : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400'
        }`}>
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>Shortcuts automatically pause while typing inside search inputs or form fields.</span>
          </div>
          <button
            onClick={() => setIsShortcutsHelpOpen(false)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
