import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Check, 
  ShieldCheck, 
  Smartphone, 
  Laptop, 
  Tablet, 
  TrendingUp,
  PieChart,
  Building,
  CreditCard,
  Target
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialReportData, downloadFinancialReportFile } from '../../utils/generateFinancialReportHtml';
import { generateFinancialReportPdf } from '../../utils/generateFinancialReportPdf';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userEmail?: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  userName = 'Account Holder',
  userEmail = 'Private Portfolio'
}) => {
  const {
    theme,
    formatMoney,
    currency,
    currencyConfig,
    assets = [],
    liabilities = [],
    budgets = [],
    goals = [],
    essentialGoals = [],
    netWorth,
    totalAssets,
    totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    netSavings,
    savingsRate,
    liquidCash,
    liquidRunwayMonths,
    debtToAssetRatio,
    healthScore
  } = useFinance();

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [includeAssets, setIncludeAssets] = useState(true);
  const [includeDebts, setIncludeDebts] = useState(true);
  const [includeBudgets, setIncludeBudgets] = useState(true);
  const [includeGoals, setIncludeGoals] = useState(true);

  if (!isOpen) return null;

  const reportData: FinancialReportData = {
    userName,
    userEmail,
    currency,
    currencySymbol: currencyConfig.symbol,
    generatedDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    netWorth,
    totalAssets,
    totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    netSavings,
    savingsRate,
    liquidCash,
    liquidRunwayMonths,
    debtToAssetRatio,
    healthScore: healthScore?.score ?? 85,
    healthGrade: healthScore?.grade ?? 'A',
    assets: includeAssets ? assets.map(a => ({
      name: a.name,
      category: a.category,
      value: a.value,
      currency: a.currency,
      institution: a.institution
    })) : [],
    liabilities: includeDebts ? liabilities.map(l => ({
      name: l.name,
      category: l.category,
      balance: l.balance,
      interestRate: l.interestRate,
      monthlyPayment: l.monthlyPayment || l.minimumPayment,
      institution: l.institution
    })) : [],
    budgets: includeBudgets ? budgets.map(b => ({
      category: b.category,
      allocatedAmount: b.allocatedAmount,
      period: b.period
    })) : [],
    goals: includeGoals ? [...goals, ...essentialGoals.map(eg => ({
      name: eg.name,
      category: 'Emergency Vault',
      targetAmount: eg.targetAmount,
      currentAmount: eg.currentAmount,
      targetDate: eg.lastUpdated
    }))] : []
  };

  const handleNativePrint = () => {
    onClose();
    // Allow state update to settle before calling window.print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleDownloadPdf = () => {
    try {
      generateFinancialReportPdf(reportData);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('PDF generation failed, falling back to report file:', err);
      downloadFinancialReportFile(reportData);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3500);
    }
  };

  const handleDownloadFile = () => {
    downloadFinancialReportFile(reportData);
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Export Financial Summary Report
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-mono">
                  PDF Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate high-contrast print-ready statements for phone, tablet, or PC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Universal Device Compatibility Badge */}
          <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0 text-blue-500">
              <Smartphone className="w-4 h-4" />
              <Tablet className="w-4 h-4" />
              <Laptop className="w-4 h-4" />
            </div>
            <div className="text-[11px] leading-relaxed">
              <strong>Universal PDF &amp; Print Engine:</strong> Designed to download cleanly on any phone, tablet, or desktop system.
            </div>
          </div>

          {/* Report Preview Summary Card */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-inherit/40">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500">Report Metrics Preview</span>
              <span className="font-mono text-[11px] font-semibold text-blue-500">{currency} Statement</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono">
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="text-[10px] text-slate-400 font-sans">Net Worth</div>
                <div className="font-bold text-emerald-500 text-xs mt-0.5">{formatMoney(netWorth)}</div>
              </div>
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="text-[10px] text-slate-400 font-sans">Assets</div>
                <div className="font-bold text-blue-500 text-xs mt-0.5">{formatMoney(totalAssets)}</div>
              </div>
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="text-[10px] text-slate-400 font-sans">Debts</div>
                <div className="font-bold text-rose-500 text-xs mt-0.5">{formatMoney(totalLiabilities)}</div>
              </div>
              <div className={`p-2 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <div className="text-[10px] text-slate-400 font-sans">FinScore™</div>
                <div className="font-bold text-purple-500 text-xs mt-0.5">{healthScore?.score ?? 85}/100</div>
              </div>
            </div>
          </div>

          {/* Section Selection Toggles */}
          <div>
            <label className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-2">
              Include In Export:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                includeAssets ? 'border-blue-500/40 bg-blue-500/10 text-blue-500 font-semibold' : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>Assets ({assets.length})</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={includeAssets} 
                  onChange={e => setIncludeAssets(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0" 
                />
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                includeDebts ? 'border-blue-500/40 bg-blue-500/10 text-blue-500 font-semibold' : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Debts ({liabilities.length})</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={includeDebts} 
                  onChange={e => setIncludeDebts(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0" 
                />
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                includeBudgets ? 'border-blue-500/40 bg-blue-500/10 text-blue-500 font-semibold' : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Budgets ({budgets.length})</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={includeBudgets} 
                  onChange={e => setIncludeBudgets(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0" 
                />
              </label>

              <label className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                includeGoals ? 'border-blue-500/40 bg-blue-500/10 text-blue-500 font-semibold' : 'border-slate-200 dark:border-slate-800 text-slate-400'
              }`}>
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" />
                  <span>Goals ({goals.length + essentialGoals.length})</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={includeGoals} 
                  onChange={e => setIncludeGoals(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0" 
                />
              </label>
            </div>
          </div>

          {/* Feedback Success Notice */}
          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>Report downloaded! Ready to open and print to PDF on your device.</span>
            </div>
          )}
        </div>

        {/* Modal Footer with Both Export Options */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>Client: {userName}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Direct PDF Download Button (Works on all mobile phones, tablets & desktop systems) */}
            <button
              id="btn-download-report-pdf"
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Download standalone PDF document to your device"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download PDF (.pdf)</span>
            </button>

            {/* Print / Save as PDF Button (Leverages @media print) */}
            <button
              id="btn-print-report-dialog"
              onClick={handleNativePrint}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="Open browser print dialog to save as PDF"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
