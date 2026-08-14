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
  ShieldAlert
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../../context/FinanceContext';
import { MoreSubTab, AppTheme, CurrencyCode } from '../../types';

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
    liquidCash,
    monthlyExpenses,
    totalAssets,
    netWorth
  } = useFinance();

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
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
    }, 2500);
  };

  const themes: { id: AppTheme; name: string; desc: string; previewBg: string; border: string }[] = [
    { id: 'light', name: 'Day Mode (Pure Light - Default)', desc: 'Clean, high-contrast daylight theme with bright cards and crisp typography', previewBg: 'bg-white', border: 'border-blue-500' },
    { id: 'coolors', name: 'Coolors Electric Blue', desc: 'Vibrant electric blue & modern coolors palette with slate depth', previewBg: 'bg-slate-900', border: 'border-blue-500' },
    { id: 'dark', name: 'Dark Titanium', desc: 'Refined deep zinc with neutral high-contrast edges', previewBg: 'bg-zinc-900', border: 'border-zinc-700' },
    { id: 'midnight', name: 'Midnight Obsidian', desc: 'Deepest OLED black canvas with emerald accents', previewBg: 'bg-zinc-950', border: 'border-emerald-500/40' },
    { id: 'emerald', name: 'Emerald Wealth', desc: 'Luxury private banking emerald glow', previewBg: 'bg-emerald-950/40', border: 'border-emerald-500' },
    { id: 'slate', name: 'Cool Slate', desc: 'Modern blue-tinted cool monochrome workspace', previewBg: 'bg-slate-900', border: 'border-slate-700' },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* 6 Sub-Tabs Bar: Import, Calculate, Theme, Backup, Setting, Feedback */}
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
          id="tab-more-theme"
          onClick={() => setMoreSubTab('theme')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            moreSubTab === 'theme' ? 'bg-zinc-800 text-purple-400 border border-zinc-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Theme & Style</span>
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
          id="tab-more-setting"
          onClick={() => setMoreSubTab('setting')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            moreSubTab === 'setting' ? 'bg-zinc-800 text-blue-400 border border-zinc-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
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
                Supports all Aura Wealth and FinBoom JSON backup formats
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
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Calculator Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setCalcTab('compound')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                calcTab === 'compound' ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Compound Growth
            </button>
            <button
              onClick={() => setCalcTab('loan')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                calcTab === 'loan' ? 'bg-zinc-800 text-cyan-400 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Loan & Mortgage Payoff
            </button>
            <button
              onClick={() => setCalcTab('fire')}
              className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                calcTab === 'fire' ? 'bg-zinc-800 text-purple-400 shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              FIRE Independence
            </button>
          </div>

          {/* Compound Interest Calculator */}
          {calcTab === 'compound' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div className="space-y-3 text-xs">
                <h3 className="text-sm font-bold text-zinc-100 mb-2">Compound Interest Simulator</h3>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Initial Principal</span>
                    <span className="font-mono text-zinc-200">${principal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="500000"
                    step="1000"
                    value={principal}
                    onChange={e => setPrincipal(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Monthly Addition</span>
                    <span className="font-mono text-zinc-200">${monthlyAddition.toLocaleString()}/mo</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="50"
                    value={monthlyAddition}
                    onChange={e => setMonthlyAddition(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Estimated Annual Return (CAGR %)</span>
                    <span className="font-mono text-zinc-200">{annualRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="18"
                    step="0.5"
                    value={annualRate}
                    onChange={e => setAnnualRate(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Time Horizon (Years)</span>
                    <span className="font-mono text-zinc-200">{years} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    step="1"
                    value={years}
                    onChange={e => setYears(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>

              {/* Output */}
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Projected Portfolio Value
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                    ${compoundResults.futureValue.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Total Out-of-Pocket Invested:</span>
                    <span className="font-mono text-zinc-200">${compoundResults.totalContributions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Compound Interest Generated:</span>
                    <span className="font-mono text-emerald-400 font-semibold">+${compoundResults.interestEarned.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loan Calculator */}
          {calcTab === 'loan' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div className="space-y-3 text-xs">
                <h3 className="text-sm font-bold text-zinc-100 mb-2">Loan Payoff Acceleration</h3>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Loan Principal Balance</span>
                    <span className="font-mono text-zinc-200">${loanAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="1000000"
                    step="5000"
                    value={loanAmount}
                    onChange={e => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Interest Rate (APR %)</span>
                    <span className="font-mono text-zinc-200">{loanRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.25"
                    value={loanRate}
                    onChange={e => setLoanRate(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Extra Monthly Principal Payment</span>
                    <span className="font-mono text-emerald-400">+${loanExtra}/mo</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="25"
                    value={loanExtra}
                    onChange={e => setLoanExtra(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              {/* Loan Output */}
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Accelerated Payoff Term
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-cyan-400 mt-1">
                    {loanResults.yearsToPayoff} Years
                  </div>
                  <p className="text-xs text-emerald-400 mt-0.5">
                    🚀 Saves {loanResults.yearsSaved} full years off standard term!
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-800 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Monthly Payment (with Extra):</span>
                    <span className="font-mono text-zinc-200">${loanResults.totalWithExtra.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Total Interest Paid:</span>
                    <span className="font-mono text-rose-400">${loanResults.totalInterest.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FIRE Calculator */}
          {calcTab === 'fire' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <div className="space-y-3 text-xs">
                <h3 className="text-sm font-bold text-zinc-100 mb-2">FIRE Safe Withdrawal Target (4% Rule)</h3>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Target Annual Living Expense in Retirement</span>
                    <span className="font-mono text-zinc-200">${fireAnnualExpense.toLocaleString()}/yr</span>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="250000"
                    step="5000"
                    value={fireAnnualExpense}
                    onChange={e => setFireAnnualExpense(Number(e.target.value))}
                    className="w-full accent-purple-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Annual New Savings / Investments Added</span>
                    <span className="font-mono text-zinc-200">${fireAnnualSavings.toLocaleString()}/yr</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="2000"
                    value={fireAnnualSavings}
                    onChange={e => setFireAnnualSavings(Number(e.target.value))}
                    className="w-full accent-purple-400"
                  />
                </div>
              </div>

              {/* Output */}
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                    Target FIRE Portfolio Number
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-purple-400 mt-1">
                    ${fireResults.fireNumber.toLocaleString()}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Based on sustainable 4.0% perpetual safe withdrawal rate.
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Estimated Years to FIRE:</span>
                    <span className="font-mono text-emerald-400 font-bold">{fireResults.yearsToFire} Years</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
        </div>
      )}

      {/* 6. FEEDBACK SUBTAB */}
      {moreSubTab === 'feedback' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Share Feedback & Feature Requests</h2>
              <p className="text-xs text-zinc-400">Help shape the future of Aura Wealth.</p>
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
    </div>
  );
};
