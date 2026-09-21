import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Moon, 
  Sun, 
  Download, 
  FileUp, 
  RefreshCw, 
  Trash2, 
  Check, 
  Sparkles, 
  Scale, 
  Palette, 
  Coins, 
  AlertTriangle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../../context/FinanceContext';
import { CurrencyCode, AppTheme } from '../../types';

export const SettingsView: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    currency, 
    setCurrency, 
    isPrivateMode, 
    togglePrivateMode, 
    formatMoney, 
    netWorth,
    totalAssets,
    exportDataJSON, 
    exportTransactionsCSV, 
    importData, 
    resetToDefaultData, 
    resetAllDataToZero,
    setActiveTab 
  } = useFinance();

  const isLight = theme === 'light';

  // Persistent User profile fields
  const [name, setName] = useState(() => localStorage.getItem('fix_user_name') || 'Sudharsan M.');
  const [email, setEmail] = useState(() => localStorage.getItem('fix_user_email') || 'sudharsanm014@gmail.com');
  const [role, setRole] = useState(() => localStorage.getItem('fix_user_role') || 'Pro Investor / Software Engineer');
  const [profileSaved, setProfileSaved] = useState(false);

  // Reset confirmation modal
  const [isResetZeroModalOpen, setIsResetZeroModalOpen] = useState(false);
  const [isResetDefaultModalOpen, setIsResetDefaultModalOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Import file handler
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('fix_user_name', name.trim());
    localStorage.setItem('fix_user_email', email.trim());
    localStorage.setItem('fix_user_role', role.trim());
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

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

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/15 text-blue-500">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Settings & Preferences
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/20 font-mono uppercase">
                  New System
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your user identity, display privacy, base currency, backups, and security.
              </p>
            </div>
          </div>
        </div>

        {/* Global Net Worth Badge */}
        <div className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl border text-xs ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <span className="text-slate-500 dark:text-slate-400">Total Valuation:</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
            {formatMoney(netWorth)}
          </span>
        </div>
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
      <section className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-blue-500/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Personal Profile & Identity</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Used for accounts, reports, and sidebar presentation</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified Pro Member</span>
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
              Display Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer / Pro Investor"
              className={`w-full px-3.5 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
              }`}
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {profileSaved ? (
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Changes saved to local storage!
                </span>
              ) : (
                'Identity details are stored locally on your device.'
              )}
            </div>
            <button
              id="btn-settings-save-profile"
              type="submit"
              className="px-5 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all text-xs"
            >
              Update Profile
            </button>
          </div>
        </form>
      </section>

      {/* 2. DISPLAY & PRIVACY PREFERENCES */}
      <section className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-purple-500/15 text-purple-500">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Display & Privacy Preferences</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Control visual theme, privacy masking, and balance shielding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Theme Selector */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">Theme Mode</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-500 capitalize font-semibold">
                {theme}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Switch between crisp light mode and high-contrast dark theme.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
                  isLight 
                    ? 'bg-white text-blue-600 border border-blue-200 shadow-sm' 
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
                  !isLight 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-500' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Privacy Mode Toggle */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">Privacy Shield (Mask Balances)</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                isPrivateMode ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-500/20 text-slate-400'
              }`}>
                {isPrivateMode ? 'Masked' : 'Unmasked'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Replaces precise monetary figures with •••••• when presenting in public or streaming.
            </p>
            <button
              onClick={togglePrivateMode}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
                isPrivateMode
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                  : isLight
                  ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isPrivateMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{isPrivateMode ? 'Disable Privacy Mask' : 'Enable Privacy Mask'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. BASE CURRENCY STANDARD */}
      <section className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Base Valuation Currency</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">All assets, liabilities, and budgets compute in this base denomination</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 text-xs">
          {Object.values(CURRENCY_CONFIGS).map(c => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code as CurrencyCode)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 font-bold'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm">{c.symbol}</span>
                  <span className="text-[10px] font-mono opacity-80">{c.code}</span>
                </div>
                <div className="text-[11px] truncate mt-1">{c.name}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. DATA MANAGEMENT & BACKUPS */}
      <section className={`p-6 rounded-3xl border shadow-sm space-y-5 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Data Management & Full Backups</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Export your ledger, download spreadsheets, or restore previous states</p>
          </div>
        </div>

        {importStatus && (
          <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-500 text-xs font-semibold">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* JSON Export */}
          <button
            onClick={exportDataJSON}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 font-bold mb-1">
                <Download className="w-4 h-4 text-blue-500" />
                <span>Export JSON Backup</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Complete snapshot of all assets, liabilities, goals, and history.</p>
            </div>
            <span className="mt-3 text-[10px] font-mono text-blue-500 font-semibold">Download .json →</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={exportTransactionsCSV}
            className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
              isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 font-bold mb-1">
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <span>Export Transactions CSV</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Formatted spreadsheet of income, expense, and transfer records.</p>
            </div>
            <span className="mt-3 text-[10px] font-mono text-emerald-500 font-semibold">Download .csv →</span>
          </button>

          {/* Import JSON */}
          <label className={`p-4 rounded-2xl border text-left flex flex-col justify-between cursor-pointer transition-all ${
            isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900 text-slate-200'
          }`}>
            <div>
              <div className="flex items-center gap-2 font-bold mb-1">
                <FileUp className="w-4 h-4 text-indigo-500" />
                <span>Restore Backup File</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Import a previously saved JSON snapshot directly.</p>
            </div>
            <span className="mt-3 text-[10px] font-mono text-indigo-500 font-semibold">Select File…</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </section>

      {/* 5. SYSTEM SHORTCUTS */}
      <section className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <h2 className="text-sm font-bold">Direct Financial Views</h2>
          <span className="text-[11px] text-slate-500">Quick Navigation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => setActiveTab('balancesheet')}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-indigo-500" />
              <div className="text-left">
                <div className="font-bold">Balance Sheet & Audit Statement</div>
                <div className="text-[10px] text-slate-500">Review assets vs liabilities solvency equation</div>
              </div>
            </div>
            <span className="text-blue-500 font-bold">Open →</span>
          </button>

          <button
            onClick={() => setActiveTab('finscore')}
            className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
              isLight ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <div className="text-left">
                <div className="font-bold">FinScore™ Financial Diagnostics</div>
                <div className="text-[10px] text-slate-500">Comprehensive personal wealth health assessment</div>
              </div>
            </div>
            <span className="text-blue-500 font-bold">Open →</span>
          </button>
        </div>
      </section>

      {/* 6. DANGER ZONE */}
      <section className="p-6 rounded-3xl border border-rose-500/30 bg-rose-500/5 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-500">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-sm font-bold">Danger Zone & Data Reset</h2>
        </div>
        <p className="text-xs text-rose-600/90 dark:text-rose-400/90">
          Actions here modify or clear stored ledger states. Proceed with appropriate caution.
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs">
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
    </div>
  );
};
