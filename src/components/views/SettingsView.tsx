import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Download, 
  FileUp, 
  RefreshCw, 
  Trash2, 
  Check, 
  AlertTriangle,
  X,
  FileSpreadsheet,
  Keyboard,
  Zap,
  Globe,
  HelpCircle,
  Shield,
  Palette,
  Bell,
  Search,
  Sliders,
  Save,
  Printer,
  FileText
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { LanguageRegionSection } from '../settings/LanguageRegionSection';
import { HelpSupportSection } from '../settings/HelpSupportSection';
import { SecuritySection } from '../settings/SecuritySection';
import { AppearanceSection } from '../settings/AppearanceSection';
import { NotificationsSection } from '../settings/NotificationsSection';
import { ExportReportModal } from '../settings/ExportReportModal';

type SettingsTab = 'profile' | 'language' | 'help' | 'security' | 'appearance' | 'notifications' | 'shortcuts' | 'data' | 'danger';

export const SettingsView: React.FC = () => {
  const { 
    theme, 
    formatMoney, 
    netWorth,
    totalAssets = 0,
    totalLiabilities = 0,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    netSavings = 0,
    savingsRate = 0,
    liquidCash = 0,
    liquidRunwayMonths = 0,
    debtToAssetRatio = 0,
    currency,
    currencyConfig,
    assets = [],
    liabilities = [],
    healthScore,
    exportDataJSON, 
    exportTransactionsCSV, 
    importData, 
    resetToDefaultData, 
    resetAllDataToZero,
    keyboardShortcutsEnabled,
    setKeyboardShortcutsEnabled,
    toggleKeyboardShortcuts,
    setIsShortcutsHelpOpen
  } = useFinance();

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Navigation Filter Tab
  const [activeTab, setActiveSettingsTab] = useState<SettingsTab>('profile');
  const [settingsSearch, setSettingsSearch] = useState('');
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);

  const [areAllSettingsActive, setAreAllSettingsActive] = useState<boolean>(() => {
    return localStorage.getItem('fix_all_settings_active') === 'true';
  });

  const handleActivateAllSettings = () => {
    // 1. Enable Keyboard shortcuts
    setKeyboardShortcutsEnabled(true);

    // 2. Enable all 14 Notifications
    const allNotifs: Record<string, boolean> = {
      notif_goal_milestone: true,
      notif_goal_offtrack: true,
      notif_goal_monthly_digest: true,
      notif_inv_rebalance: true,
      notif_inv_market_moves: true,
      notif_inv_dividends: true,
      notif_rev_weekly_summary: true,
      notif_rev_month_end: true,
      notif_rev_budget_overrun: true,
      notif_rem_emi_due: true,
      notif_rem_credit_card: true,
      notif_rem_subscriptions: true,
      notif_sys_security_logins: true,
      notif_sys_backup_reminder: true,
      notif_sys_features: true,
    };
    localStorage.setItem('fix_notifications_config', JSON.stringify(allNotifs));
    localStorage.setItem('fix_notif_in_app', 'true');
    localStorage.setItem('fix_notif_sound', 'true');
    localStorage.setItem('fix_notif_push', 'true');

    // 3. Enable 2FA, Biometrics, and High-Value confirmation
    localStorage.setItem('fix_2fa_enabled', 'true');
    localStorage.setItem('fix_biometrics_enabled', 'true');
    localStorage.setItem('fix_high_val_confirm', 'true');

    // 4. Set all settings active flag
    setAreAllSettingsActive(true);
    localStorage.setItem('fix_all_settings_active', 'true');

    // 5. Notify all components
    window.dispatchEvent(new CustomEvent('fix_activate_all_settings'));

    setActionSuccessNotice('All Setting Options are now ACTIVE! (All 14 Notifications, Shortcuts, 2FA, Biometrics & Security Guards Enabled)');
    setTimeout(() => setActionSuccessNotice(null), 5000);
  };

  // Persistent User profile fields
  const [name, setName] = useState(() => localStorage.getItem('fix_user_name') || 'Sudharsan M.');
  const [email, setEmail] = useState(() => localStorage.getItem('fix_user_email') || 'sudharsanm014@gmail.com');
  const [role, setRole] = useState(() => localStorage.getItem('fix_user_role') || 'Pro Investor / Software Engineer');
  const [profileSaved, setProfileSaved] = useState(false);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Auto-save user profile fields without requiring a save button
  const updateName = (val: string) => {
    setName(val);
    localStorage.setItem('fix_user_name', val);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const updateEmail = (val: string) => {
    setEmail(val);
    localStorage.setItem('fix_user_email', val);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const updateRole = (val: string) => {
    setRole(val);
    localStorage.setItem('fix_user_role', val);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleSaveAllSettings = () => {
    setIsSettingsSaved(true);
    setActionSuccessNotice('Settings changes saved successfully!');
    setTimeout(() => {
      setIsSettingsSaved(false);
      setActionSuccessNotice(null);
    }, 2500);
  };

  // Reset confirmation modal
  const [isResetZeroModalOpen, setIsResetZeroModalOpen] = useState(false);
  const [isResetDefaultModalOpen, setIsResetDefaultModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Import file handler
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const ok = importData(json);
        if (ok) {
          setImportStatus('Data imported successfully! Balances updated.');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('Failed: Invalid backup structure.');
        }
      } catch {
        setImportStatus('Error parsing JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const matchesSearch = (terms: string[]) => {
    if (!settingsSearch.trim()) return true;
    const q = settingsSearch.toLowerCase();
    return terms.some(t => t.toLowerCase().includes(q));
  };

  const shouldShow = (tab: SettingsTab, terms: string[]) => {
    if (settingsSearch.trim()) {
      return matchesSearch(terms);
    }
    return activeTab === tab;
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                  Settings & Preferences
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/20 font-mono uppercase">
                  Version 3.4
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage personal profile, language, currency, help, security, appearance, notifications, and data
              </p>
            </div>
          </div>
        </div>

        {/* Global Net Worth Badge, Search & Save / Activate Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global Export Report Button (Printable PDF Summary) */}
          <button
            id="btn-settings-export-report"
            onClick={() => setIsExportReportOpen(true)}
            className="px-3.5 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/25 text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            title="Export printable PDF summary of financial data"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          {/* Save Button for All settings EXCEPT Profile */}
          {activeTab !== 'profile' && (
            <button
              id="btn-settings-save"
              onClick={handleSaveAllSettings}
              className="px-4 py-1.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/25 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Save current settings changes"
            >
              {isSettingsSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          )}

          {activeTab !== 'profile' && (
            <button
              id="btn-settings-activate-all"
              onClick={handleActivateAllSettings}
              className="px-3.5 py-1.5 rounded-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Activate all notification triggers, shortcuts, 2FA, and biometrics"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Activate All</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                ALL ON
              </span>
            </button>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={settingsSearch}
              onChange={(e) => setSettingsSearch(e.target.value)}
              placeholder="Search settings..."
              className={`pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            />
            {settingsSearch && (
              <button
                onClick={() => setSettingsSearch('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>

          <div className={`flex items-center gap-3 px-3.5 py-1.5 rounded-2xl border text-xs font-mono ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-300'
          }`}>
            <span className="text-slate-500">Valuation:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {formatMoney(netWorth)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: 'profile', label: '👤 Profile', icon: <User className="w-3.5 h-3.5" /> },
          { id: 'language', label: '🌐 Language & Region', icon: <Globe className="w-3.5 h-3.5" /> },
          { id: 'help', label: '❓ Help & Support', icon: <HelpCircle className="w-3.5 h-3.5" /> },
          { id: 'security', label: '🔐 Security', icon: <Shield className="w-3.5 h-3.5" /> },
          { id: 'appearance', label: '🎨 Appearance', icon: <Palette className="w-3.5 h-3.5" /> },
          { id: 'notifications', label: '🔔 Notifications', icon: <Bell className="w-3.5 h-3.5" /> },
          { id: 'shortcuts', label: '⌨️ Shortcuts', icon: <Keyboard className="w-3.5 h-3.5" /> },
          { id: 'data', label: '💾 Data & Backup', icon: <Download className="w-3.5 h-3.5" /> },
          { id: 'danger', label: '⚠️ Danger Zone', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`btn-tab-${tab.id}`}
              onClick={() => setActiveSettingsTab(tab.id as SettingsTab)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : isLight 
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Notification */}
      {actionSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span className="font-semibold">{actionSuccessNotice}</span>
          </div>
          <button onClick={() => setActionSuccessNotice(null)} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. USER PROFILE IDENTITY */}
      {shouldShow('profile', ['profile', 'identity', 'user', 'email', 'name', 'sudharsan']) && (
        <section id="section-profile" className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-blue-500/20">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Personal Profile & Identity</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Used for accounts, reports, and sidebar presentation</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Pro Member</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                Display Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(e.target.value)}
                placeholder="Sudharsan M."
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => updateEmail(e.target.value)}
                placeholder="sudharsanm014@gmail.com"
                required
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
                Occupation / Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => updateRole(e.target.value)}
                placeholder="e.g. Software Engineer / Pro Investor"
                className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div className="sm:col-span-3 flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Profile identity automatically saves as you type.</span>
              </div>
              {profileSaved && (
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Auto-saved
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. 🌐 LANGUAGE & REGION */}
      {shouldShow('language', ['language', 'region', 'currency', 'country', 'date', 'time', 'timezone', 'locale', 'usd', 'inr', 'eur', 'gbp']) && (
        <LanguageRegionSection />
      )}

      {/* 3. ❓ HELP & SUPPORT */}
      {shouldShow('help', ['help', 'support', 'faq', 'guide', 'tutorial', 'contact', 'problem', 'bug', 'report', 'issue']) && (
        <HelpSupportSection />
      )}

      {/* 4. 🔐 SECURITY */}
      {shouldShow('security', ['security', 'password', '2fa', 'two-factor', 'sessions', 'biometrics', 'fingerprint', 'face', 'lock']) && (
        <SecuritySection />
      )}

      {/* 5. 🎨 APPEARANCE */}
      {shouldShow('appearance', ['appearance', 'theme', 'dark', 'light', 'font', 'layout', 'density', 'dashboard', 'color', 'accent']) && (
        <AppearanceSection />
      )}

      {/* 6. 🔔 NOTIFICATIONS */}
      {shouldShow('notifications', ['notification', 'alert', 'goal', 'investment', 'review', 'reminder', 'sound', 'push', 'chime']) && (
        <NotificationsSection />
      )}

      {/* 7. KEYBOARD SHORTCUTS */}
      {shouldShow('shortcuts', ['shortcut', 'keyboard', 'hotkey', 'navigation', 'key']) && (
        <section id="section-shortcuts" className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Global Keyboard Shortcuts</h2>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    keyboardShortcutsEnabled
                      ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  }`}>
                    {keyboardShortcutsEnabled ? 'ACTIVE / ON' : 'DISABLED / OFF'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instantly navigate and trigger workflows with single-key shortcuts across the app
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsShortcutsHelpOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                View Cheat Sheet (?)
              </button>
              <button
                onClick={toggleKeyboardShortcuts}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                  keyboardShortcutsEnabled
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                    : isLight 
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Zap className={`w-3.5 h-3.5 ${keyboardShortcutsEnabled ? 'text-amber-300 fill-amber-300' : 'text-slate-400'}`} />
                <span>{keyboardShortcutsEnabled ? 'Shortcuts Enabled' : 'Enable Shortcuts'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>
                {keyboardShortcutsEnabled 
                  ? '⚡ Shortcuts are active: single keypresses navigate directly when not typing in an input field.' 
                  : '⚠️ Shortcuts are currently turned off. Switch this setting ON to use single-key navigation.'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {[
                { key: 'N', label: 'New Transaction', desc: 'Expense / Income modal' },
                { key: '/', label: 'Global Search', desc: 'Search records & tools' },
                { key: 'C', label: 'Calculators', desc: 'SIP, EMI, FIRE tools' },
                { key: 'A', label: 'Assets', desc: 'Wealth Assets portfolio' },
                { key: 'L', label: 'Liabilities', desc: 'Debts & obligations' },
                { key: 'O', label: 'Overview', desc: 'Net worth & dashboards' },
                { key: 'G', label: 'Goals', desc: 'Runway & targets' },
                { key: 'B', label: 'Balance Sheet', desc: 'Statement audit' },
                { key: 'R', label: 'Reports', desc: 'Analytics & cashflow' },
                { key: 'S', label: 'Settings', desc: 'Preferences & backup' },
                { key: '⇧ + A', label: 'Add Asset', desc: 'Direct asset creation' },
                { key: '?', label: 'Cheat Sheet', desc: 'Show all shortcuts' },
              ].map(item => (
                <div 
                  key={item.key}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between transition-colors ${
                    !keyboardShortcutsEnabled
                      ? 'opacity-60 bg-slate-50/40 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
                      : isLight 
                        ? 'bg-slate-50/80 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0 pr-1.5">
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{item.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.desc}</div>
                  </div>
                  <kbd className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold shrink-0 border shadow-xs ${
                    isLight 
                      ? 'bg-white text-slate-800 border-slate-300' 
                      : 'bg-slate-900 text-slate-200 border-slate-700'
                  }`}>
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 8. DATA MANAGEMENT & BACKUPS */}
      {shouldShow('data', ['data', 'backup', 'export', 'import', 'csv', 'json', 'restore']) && (
        <section id="section-data-management" className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Data Management & Full Backups</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Export your ledger, download spreadsheets, or restore previous states</p>
            </div>
          </div>

          {importStatus && (
            <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-500 text-xs font-semibold">
              {importStatus}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Printable PDF Report Export */}
            <button
              id="btn-settings-export-pdf-card"
              onClick={() => setIsExportReportOpen(true)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-slate-100">
                  <Printer className="w-4 h-4 text-purple-500" />
                  <span>Printable PDF Report</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Universal print-ready statement with net worth, assets, debts, budgets, and vital score.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-purple-500 mt-4">Export PDF Report →</span>
            </button>

            {/* JSON Export */}
            <button
              onClick={exportDataJSON}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-slate-100">
                  <Download className="w-4 h-4 text-blue-500" />
                  <span>Export JSON Snapshot</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Download full offline archive of assets, debts, budgets, and transactions.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-blue-500 mt-4">Download .JSON →</span>
            </button>

            {/* CSV Export */}
            <button
              onClick={exportTransactionsCSV}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-slate-100">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Export Transactions CSV</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Universal spreadsheet export compatible with Excel, Google Sheets, or Numbers.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-500 mt-4">Download .CSV →</span>
            </button>

            {/* Import Backup */}
            <div className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/60 border-slate-800 text-slate-200'
            }`}>
              <div>
                <div className="flex items-center gap-2 font-bold mb-1 text-slate-900 dark:text-slate-100">
                  <FileUp className="w-4 h-4 text-indigo-500" />
                  <span>Restore from JSON</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Upload a previously saved .json snapshot to restore your financial records.
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-inherit/40 space-y-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] cursor-pointer shadow-sm transition-colors">
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </label>
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Preserve report:</span>
                  <button
                    type="button"
                    onClick={() => setIsExportReportOpen(true)}
                    className="font-bold text-blue-500 hover:underline cursor-pointer"
                  >
                    Save PDF First →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 9. DANGER ZONE */}
      {shouldShow('danger', ['danger', 'reset', 'clear', 'zero', 'demo', 'wipe']) && (
        <section id="section-danger-zone" className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
          isLight ? 'bg-rose-50/50 border-rose-200' : 'bg-rose-950/20 border-rose-900/40'
        }`}>
          <div className="flex items-center gap-2.5 text-rose-500 pb-2 border-b border-rose-200/60 dark:border-rose-900/50">
            <AlertTriangle className="w-4 h-4" />
            <h2 className="text-sm font-bold">Danger Zone & Factory Reset</h2>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            These actions permanently erase or replace current ledger records. Please download an offline backup first.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <button
              onClick={() => setIsResetDefaultModalOpen(true)}
              className="px-4 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Demo Portfolio Sample</span>
            </button>

            <button
              onClick={() => {
                setResetConfirmInput('');
                setIsResetZeroModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Ledgers to 0</span>
            </button>
          </div>
        </section>
      )}

      {/* Bottom Save Settings Action Bar for all settings tabs except Profile */}
      {activeTab !== 'profile' && (
        <div className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Settings preferences are safely stored and synced on this browser.</span>
          </div>
          <button
            id="btn-settings-save-bottom"
            onClick={handleSaveAllSettings}
            className="w-full sm:w-auto px-6 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSettingsSaved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings Changes</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* CONFIRMATION MODAL: RESET TO 0 */}
      {isResetZeroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-2 rounded-xl bg-rose-500/15">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Reset All Ledgers to Zero?</h3>
                <p className="text-xs text-slate-500">This action clears all balances to zero</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Type <strong className="text-rose-500 font-mono">RESET</strong> below to confirm wiping all assets, debt liabilities, transactions, and goals.
            </p>

            <input
              type="text"
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              placeholder="Type RESET"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
              }`}
            />

            <div className="flex items-center justify-end gap-2.5 pt-2 text-xs">
              <button
                onClick={() => setIsResetZeroModalOpen(false)}
                className="px-4 py-2 rounded-xl font-semibold border border-slate-300 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={resetConfirmInput !== 'RESET'}
                onClick={() => {
                  resetAllDataToZero();
                  setIsResetZeroModalOpen(false);
                  setActionSuccessNotice('All financial records have been reset to zero.');
                }}
                className={`px-5 py-2 rounded-xl font-bold transition-all ${
                  resetConfirmInput === 'RESET'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirm Reset to 0
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL: RESTORE DEMO */}
      {isResetDefaultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center gap-3 text-blue-500">
              <div className="p-2 rounded-xl bg-blue-500/15">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black">Restore Demo Portfolio?</h3>
                <p className="text-xs text-slate-500">Reload realistic demonstration portfolio</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              This will populate sample liquid cash, investments, real estate, debts, and budgets to explore the application features.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 text-xs">
              <button
                onClick={() => setIsResetDefaultModalOpen(false)}
                className="px-4 py-2 rounded-xl font-semibold border border-slate-300 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToDefaultData();
                  setIsResetDefaultModalOpen(false);
                  setActionSuccessNotice('Demo portfolio restored successfully.');
                }}
                className="px-5 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30"
              >
                Restore Demo Data
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =========================================================================
          PRINT-ONLY FINANCIAL STATEMENT & SOLVENCY REPORT
          Leverages existing @media print styles in index.css:
          - High-contrast dark ink on pure white background
          - Clean page margins, crisp borders, repeating table headers
          - Displays only during window.print()
          ========================================================================= */}
      <div className="print-only">
        <div className="mb-6 pb-4 border-b-2 border-slate-300 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">AURA WEALTH &amp; FINANCIAL REPORT</h1>
            <p className="text-xs text-slate-600 mt-0.5">Executive Financial Health, Asset Allocation &amp; Solvency Audit</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <div>Client: <strong className="text-slate-900">{name || 'Account Holder'}</strong></div>
            <div>Email: <strong className="text-slate-900">{email || 'Private Portfolio'}</strong></div>
            <div>Date: <strong className="text-slate-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div>
            <div>Currency: <strong className="text-slate-900">{currency} ({currencyConfig?.symbol || '$'})</strong></div>
          </div>
        </div>

        {/* 4 Core KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Net Worth (Equity)</div>
            <div className="text-lg font-mono font-bold text-emerald-600 mt-0.5">{formatMoney(netWorth)}</div>
            <div className="text-[9px] text-slate-500 mt-1">Total Assets minus Debts</div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Gross Assets</div>
            <div className="text-lg font-mono font-bold text-blue-600 mt-0.5">{formatMoney(totalAssets)}</div>
            <div className="text-[9px] text-slate-500 mt-1">{assets.length} holdings</div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Total Liabilities</div>
            <div className="text-lg font-mono font-bold text-rose-600 mt-0.5">{formatMoney(totalLiabilities)}</div>
            <div className="text-[9px] text-slate-500 mt-1">Debt-to-Asset: {debtToAssetRatio.toFixed(1)}%</div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Financial Health</div>
            <div className="text-lg font-mono font-bold text-purple-600 mt-0.5">{healthScore?.score ?? 85}/100</div>
            <div className="text-[9px] text-slate-500 mt-1">Grade {healthScore?.grade ?? 'A'}</div>
          </div>
        </div>

        {/* Cash Flow KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Monthly Income</div>
            <div className="text-base font-mono font-bold text-emerald-600 mt-0.5">{formatMoney(monthlyIncome)}</div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Monthly Burn</div>
            <div className="text-base font-mono font-bold text-rose-600 mt-0.5">{formatMoney(monthlyExpenses)}</div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Net Monthly Savings</div>
            <div className="text-base font-mono font-bold text-emerald-600 mt-0.5">{formatMoney(netSavings)}</div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="text-[10px] font-bold text-slate-500 uppercase">Runway Buffer</div>
            <div className="text-base font-mono font-bold text-slate-800 mt-0.5">{liquidRunwayMonths.toFixed(1)} Months</div>
          </div>
        </div>

        {/* Assets Table */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
            1. Asset Holdings &amp; Allocation ({assets.length} Holdings)
          </h3>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                <th className="text-left p-2">Asset Name</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Institution</th>
                <th className="text-right p-2">Valuation</th>
                <th className="text-right p-2">Share %</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(a => {
                const pct = totalAssets > 0 ? ((a.value / totalAssets) * 100).toFixed(1) : '0';
                return (
                  <tr key={a.id} className="border-b border-slate-200">
                    <td className="p-2 font-bold text-slate-900">{a.name}</td>
                    <td className="p-2 text-slate-600">{a.category}</td>
                    <td className="p-2 text-slate-500">{a.institution || '—'}</td>
                    <td className="p-2 text-right font-mono font-bold">{formatMoney(a.value)}</td>
                    <td className="p-2 text-right font-mono text-slate-600">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-slate-50 border-t-2 border-slate-300">
                <td colSpan={3} className="p-2">Total Assets</td>
                <td className="p-2 text-right font-mono text-emerald-600">{formatMoney(totalAssets)}</td>
                <td className="p-2 text-right font-mono">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Liabilities Table */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 mb-2">
            2. Liabilities &amp; Outstanding Debt ({liabilities.length} Accounts)
          </h3>
          {liabilities.length > 0 ? (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                  <th className="text-left p-2">Liability Name</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">Institution</th>
                  <th className="text-center p-2">APR %</th>
                  <th className="text-right p-2">Monthly EMI</th>
                  <th className="text-right p-2">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody>
                {liabilities.map(l => (
                  <tr key={l.id} className="border-b border-slate-200">
                    <td className="p-2 font-bold text-slate-900">{l.name}</td>
                    <td className="p-2 text-slate-600">{l.category}</td>
                    <td className="p-2 text-slate-500">{l.institution || '—'}</td>
                    <td className="p-2 text-center font-mono">{l.interestRate ? `${l.interestRate}%` : '0%'}</td>
                    <td className="p-2 text-right font-mono">{l.monthlyPayment ? formatMoney(l.monthlyPayment) : '—'}</td>
                    <td className="p-2 text-right font-mono font-bold text-rose-600">{formatMoney(l.balance)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold bg-slate-50 border-t-2 border-slate-300">
                  <td colSpan={5} className="p-2">Total Liabilities</td>
                  <td className="p-2 text-right font-mono text-rose-600">{formatMoney(totalLiabilities)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="p-3 text-xs text-emerald-600 font-semibold border border-emerald-200 rounded-xl bg-emerald-50">
              Debt-Free: No outstanding liabilities recorded.
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between">
          <span>Aura Private Wealth • End-to-End Client Statement</span>
          <span>Confidential &amp; Proprietary</span>
        </div>
      </div>

      {/* Global Export Report Modal */}
      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
        userName={name}
        userEmail={email}
      />
    </div>
  );
};

