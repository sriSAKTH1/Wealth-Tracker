import React, { useState } from 'react';
import { 
  FileUp, 
  Calculator, 
  Palette, 
  Download, 
  Settings, 
  MessageSquare, 
  Sparkles, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Clock, 
  Star,
  FileSpreadsheet,
  Trash2,
  Lock,
  Moon,
  Sun,
  ShieldAlert,
  X,
  AlertTriangle
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../../context/FinanceContext';
import { MoreSubTab, AppTheme, CurrencyCode } from '../../types';
import { FinancialCalculatorsView } from '../calculators/FinancialCalculatorsView';
import { ThankYouFeedbackModal } from '../ThankYouFeedbackModal';

export const MoreView: React.FC = () => {
  const { 
    moreSubTab, 
    setMoreSubTab, 
    theme, 
    setTheme, 
    currency, 
    setCurrency, 
    formatMoney, 
    isPrivateMode, 
    togglePrivateMode, 
    exportDataJSON, 
    exportTransactionsCSV, 
    importData, 
    resetToDefaultData,
    resetAllDataToZero,
    liquidCash,
    monthlyExpenses,
    totalAssets,
    netWorth
  } = useFinance();

  // Reset confirmation states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetDoneStatus, setResetDoneStatus] = useState<string | null>(null);

  // Import state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Calculator states
  const [calcTab, setCalcTab] = useState<'compound' | 'loan' | 'fire' | 'projector'>('compound');
  
  // Compound Calc
  const [principal, setPrincipal] = useState(25000);
  const [monthlyAddition, setMonthlyAddition] = useState(1000);
  const [annualRate, setAnnualRate] = useState(8);
  const [years, setYears] = useState(15);

  // Loan Calc
  const [loanAmount, setLoanAmount] = useState(300000);
  const [loanRate, setLoanRate] = useState(5.5);
  const [loanYears, setLoanYears] = useState(30);
  const [loanExtra, setLoanExtra] = useState(200);

  // FIRE Calc
  const [fireAnnualExpense, setFireAnnualExpense] = useState(monthlyExpenses * 12 || 60000);
  const [fireSafeRate, setFireSafeRate] = useState(4); // 4% Rule
  const [fireCurrentSavings, setFireCurrentSavings] = useState(netWorth > 0 ? netWorth : 200000);
  const [fireAnnualSavings, setFireAnnualSavings] = useState(24000);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackType, setFeedbackType] = useState('Feature Request');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);

  // Compound Interest computation
  const compoundResults = React.useMemo(() => {
    let total = principal;
    const r = annualRate / 100 / 12;
    const months = years * 12;
    let totalInvested = principal;

    for (let i = 0; i < months; i++) {
      total = (total + monthlyAddition) * (1 + r);
      totalInvested += monthlyAddition;
    }

    const interestEarned = total - totalInvested;
    return {
      futureValue: Math.round(total),
      totalContributions: Math.round(totalInvested),
      interestEarned: Math.round(interestEarned),
    };
  }, [principal, monthlyAddition, annualRate, years]);

  // Loan Payoff computation
  const loanResults = React.useMemo(() => {
    const r = loanRate / 100 / 12;
    const n = loanYears * 12;
    const standardPayment = (loanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
    const totalPaymentWithExtra = standardPayment + loanExtra;

    let balance = loanAmount;
    let monthsPaid = 0;
    let totalInterestPaid = 0;

    while (balance > 0 && monthsPaid < 600) {
      const interestMonth = balance * r;
      const principalMonth = Math.min(balance, totalPaymentWithExtra - interestMonth);
      totalInterestPaid += interestMonth;
      balance -= principalMonth;
      monthsPaid++;
    }

    const yearsSaved = Math.max(0, parseFloat(((n - monthsPaid) / 12).toFixed(1)));
    return {
      monthlyPayment: Math.round(standardPayment),
      totalWithExtra: Math.round(totalPaymentWithExtra),
      monthsToPayoff: monthsPaid,
      yearsToPayoff: (monthsPaid / 12).toFixed(1),
      yearsSaved,
      totalInterest: Math.round(totalInterestPaid),
    };
  }, [loanAmount, loanRate, loanYears, loanExtra]);

  // FIRE computation
  const fireResults = React.useMemo(() => {
    const fireNumber = (fireAnnualExpense * 100) / fireSafeRate;
    const deficit = Math.max(0, fireNumber - fireCurrentSavings);
    const yearsToFire = fireAnnualSavings > 0 
      ? (deficit / (fireAnnualSavings + (fireCurrentSavings * 0.06))).toFixed(1)
      : 'N/A';

    return {
      fireNumber: Math.round(fireNumber),
      deficit: Math.round(deficit),
      yearsToFire,
    };
  }, [fireAnnualExpense, fireSafeRate, fireCurrentSavings, fireAnnualSavings]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const ok = importData(json);
        if (ok) {
          setImportStatus('Backup loaded and synchronized successfully!');
        } else {
          setImportStatus('Invalid schema structure in backup file.');
        }
      } catch (err) {
        setImportStatus('Error reading file: Ensure it is a valid JSON export.');
      }
    };
    reader.readAsText(file);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setIsThankYouOpen(true);
    setFeedbackText('');
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 4000);
  };

  const themes: { id: AppTheme; name: string; desc: string; previewBg: string; border: string }[] = [
    { id: 'light', name: 'Day Mode (Pure Light - Default)', desc: 'Clean, high-contrast daylight theme with bright cards and crisp typography', previewBg: 'bg-white', border: 'border-blue-500' },
    { id: 'flavorfit', name: 'FlavorFit Neo-Dark (Cyan & Pastel)', desc: 'Modern dark obsidian canvas with pastel ice cyan, lilac lavender, and apricot cream bento cards', previewBg: 'bg-[#0B0C14]', border: 'border-[#9FE0E8]' },
    { id: 'nature', name: 'Nature Theme (Olive & Sage)', desc: 'Organic earthy palette with sage green, calming linen cream, and deep olive moss', previewBg: 'bg-[#787D60]', border: 'border-[#606C38]' },
    { id: 'retro', name: 'Retro 90s (Vintage Warm)', desc: 'Nostalgic 90s aesthetic with warm kraft sand, antique paper ivory, and terracotta', previewBg: 'bg-[#E8DEC8]', border: 'border-[#C65952]' },
    { id: 'coolors', name: 'Coolors Electric Blue', desc: 'Vibrant electric blue & modern coolors palette with slate depth', previewBg: 'bg-slate-900', border: 'border-blue-500' },
    { id: 'dark', name: 'Dark Titanium', desc: 'Refined deep zinc with neutral high-contrast edges', previewBg: 'bg-zinc-900', border: 'border-zinc-700' },
    { id: 'midnight', name: 'Midnight Obsidian', desc: 'Deepest OLED black canvas with emerald accents', previewBg: 'bg-zinc-950', border: 'border-emerald-500/40' },
    { id: 'emerald', name: 'Emerald Wealth', desc: 'Luxury private banking emerald glow', previewBg: 'bg-emerald-950/40', border: 'border-emerald-500' },
    { id: 'slate', name: 'Cool Slate', desc: 'Modern blue-tinted cool monochrome workspace', previewBg: 'bg-slate-900', border: 'border-slate-700' },
  ];

  React.useEffect(() => {
    if ((moreSubTab as string) === 'theme' || (moreSubTab as string) === 'setting') {
      setMoreSubTab('calculate');
    }
  }, [moreSubTab, setMoreSubTab]);

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* Sub-Tabs Bar: Import, Calculate, Backup, Feedback */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
        <button
          id="tab-more-import"
          onClick={() => setMoreSubTab('import')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            moreSubTab === 'import' ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileUp className="w-4 h-4" />
          <span>Import Data</span>
        </button>

        <button
          id="tab-more-calculate"
          onClick={() => setMoreSubTab('calculate')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            moreSubTab === 'calculate' ? 'bg-zinc-800 text-cyan-400 border border-zinc-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Financial Calculators</span>
        </button>

        <button
          id="tab-more-backup"
          onClick={() => setMoreSubTab('backup')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            moreSubTab === 'backup' ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Backup & Export</span>
        </button>

        <button
          id="tab-more-feedback"
          onClick={() => setMoreSubTab('feedback')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            moreSubTab === 'feedback' ? 'bg-zinc-800 text-rose-400 border border-zinc-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Feedback</span>
        </button>
      </div>

      {/* 1. IMPORT SUBTAB */}
      {moreSubTab === 'import' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Import Financial History</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Load past transactions, assets, and net worth snapshots from JSON backups or CSV ledgers.
              </p>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-zinc-700 hover:border-emerald-500 rounded-2xl p-8 text-center transition-colors bg-zinc-950/40">
              <FileUp className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-zinc-200">
                Drag and drop your JSON backup file here
              </p>
              <p className="text-xs text-zinc-500 mt-1 mb-4">
                Supports all FIX Wealth and FinBoom JSON backup formats
              </p>

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer text-xs font-semibold transition-colors">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {/* Reload Demo Data */}
            <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-zinc-200">Sample Financial Portfolio</div>
                <div className="text-[11px] text-zinc-500">Populate the app with realistic starter assets & cash flow</div>
              </div>
              <button
                onClick={() => {
                  resetToDefaultData();
                  setImportStatus('Loaded complete realistic financial portfolio!');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CALCULATE SUBTAB */}
      {moreSubTab === 'calculate' && (
        <div className="animate-in fade-in duration-150">
          <FinancialCalculatorsView />
        </div>
      )}

      {/* 3. THEME SUBTAB */}
      {moreSubTab === 'theme' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Theme Palette</h2>
              <p className="text-xs text-zinc-400">Select your preferred color workspace.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {themes.map(t => (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    theme === t.id
                      ? `${t.border} bg-zinc-900 ring-2 ring-emerald-500/50 shadow-lg`
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-200">{t.name}</span>
                    {theme === t.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-zinc-400">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. BACKUP SUBTAB */}
      {moreSubTab === 'backup' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Data Backup & Export</h2>
              <p className="text-xs text-zinc-400">Download offline snapshots of your entire financial universe.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-zinc-200">Full JSON Database Snapshot</div>
                <p className="text-[11px] text-zinc-400">Includes all assets, debts, budgets, goals, and history.</p>
                <button
                  onClick={exportDataJSON}
                  className="w-full mt-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .JSON Backup</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-zinc-200">Transaction Ledger CSV</div>
                <p className="text-[11px] text-zinc-400">Universal spreadsheet export for Excel, Google Sheets, or tax filing.</p>
                <button
                  onClick={exportTransactionsCSV}
                  className="w-full mt-2 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Transactions .CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SETTING SUBTAB */}
      {moreSubTab === 'setting' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Reset Done Confirmation Banner */}
          {resetDoneStatus && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-start justify-between gap-3 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <div className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    Done! All data has been reset to 0.
                  </div>
                  <div className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-0.5">
                    All asset figures, liabilities, transactions, and account balances are now zero.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setResetDoneStatus(null)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* General Preferences */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-bold text-zinc-100">Preferences & Controls</h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div>
                  <div className="font-semibold text-zinc-200">Privacy Mode (Mask Balances)</div>
                  <div className="text-[11px] text-zinc-400">Hide exact figures when in public view</div>
                </div>
                <button
                  onClick={togglePrivateMode}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    isPrivateMode ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {isPrivateMode ? 'Masked (Active)' : 'Unmasked'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div>
                  <div className="font-semibold text-zinc-200">Base Currency Standard</div>
                  <div className="text-[11px] text-zinc-400">Global valuation denomination</div>
                </div>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as CurrencyCode)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-200 font-semibold"
                >
                  {Object.values(CURRENCY_CONFIGS).map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Danger Zone: Reset All Data to 0 */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-rose-500/30 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-500">
              <ShieldAlert className="w-5 h-5" />
              <div>
                <h2 className="text-sm font-bold text-rose-500">Data Management & Reset</h2>
                <p className="text-xs text-zinc-400">Factory wipe or load template financial numbers</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* Reset to 0 Option */}
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-rose-500 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4" />
                    <span>Reset All Data to 0 (Clear All Records)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-md">
                    Permanently clears all assets, liabilities, transactions, and custom goals, setting all balances and totals to 0. Requires typing <strong>reset</strong> to confirm.
                  </p>
                </div>
                <button
                  id="btn-open-reset-modal"
                  onClick={() => {
                    setResetConfirmText('');
                    setIsResetModalOpen(true);
                  }}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset All Data to 0</span>
                </button>
              </div>

              {/* Restore Sample Data Option */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Restore Sample Portfolio Data</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-md">
                    Repopulate the app with realistic sample assets, debt accounts, budgets, and transactions for demonstration.
                  </p>
                </div>
                <button
                  id="btn-restore-sample-data"
                  onClick={() => {
                    if (window.confirm('Restore default sample portfolio data?')) {
                      resetToDefaultData();
                      setResetDoneStatus('Restored default demo portfolio data.');
                    }
                  }}
                  className="shrink-0 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Load Sample Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. FEEDBACK SUBTAB */}
      {moreSubTab === 'feedback' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Share Feedback & Feature Requests</h2>
              <p className="text-xs text-zinc-400">Help shape the future of FIX Wealth.</p>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Feedback Category</label>
                <select
                  value={feedbackType}
                  onChange={e => setFeedbackType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
                >
                  <option value="Feature Request">Feature Request</option>
                  <option value="UI & Design Improvement">UI & Design Improvement</option>
                  <option value="Bug Report">Bug Report</option>
                  <option value="General Praise">General Praise</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Experience Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        star <= feedbackRating ? 'text-amber-400' : 'text-zinc-600'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Your Message</label>
                <textarea
                  required
                  rows={3}
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Tell us what you love or what financial tools you'd like added next..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-emerald-500"
                />
              </div>

              {feedbackSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Thank you! Your feedback has been received.</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div 
          id="modal-reset-data-overlay"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div 
            id="modal-reset-data-content"
            className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Reset All Data to 0
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Factory data wipe & clear
                  </p>
                </div>
              </div>
              <button
                id="btn-close-reset-modal"
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetConfirmText('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Permanent Data Reset</span>
              </div>
              <p className="text-rose-600 dark:text-rose-400">
                This will reset all asset balances, liabilities, income & expense logs, accounts, and goal contributions to <strong>0</strong>.
              </p>
            </div>

            <div className="space-y-2">
              <label 
                htmlFor="input-reset-confirm"
                className="block text-xs font-semibold text-slate-700 dark:text-zinc-300"
              >
                To confirm, type <span className="font-mono font-bold text-rose-600 dark:text-rose-400">reset</span> in the box below:
              </label>
              <input
                id="input-reset-confirm"
                type="text"
                autoFocus
                value={resetConfirmText}
                onChange={e => setResetConfirmText(e.target.value)}
                placeholder='Type "reset" to confirm'
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600"
              />
              
              <div className="text-[11px] pt-0.5">
                {resetConfirmText.trim().toLowerCase() === 'reset' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Text verified. You may now reset.
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-zinc-500">
                    Type <strong>reset</strong> (case-insensitive) to enable the button.
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                id="btn-cancel-reset-modal"
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetConfirmText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-reset-zero"
                disabled={resetConfirmText.trim().toLowerCase() !== 'reset'}
                onClick={() => {
                  resetAllDataToZero();
                  setIsResetModalOpen(false);
                  setResetConfirmText('');
                  setResetDoneStatus('Done! All data has been reset to 0.');
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 disabled:cursor-not-allowed shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Reset to 0</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Thank You Animation */}
      <ThankYouFeedbackModal
        isOpen={isThankYouOpen}
        onClose={() => setIsThankYouOpen(false)}
        rating={feedbackRating}
        category={feedbackType}
      />
    </div>
  );
};
