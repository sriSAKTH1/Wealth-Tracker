import React, { useState } from 'react';
import { 
  Scale, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  Download, 
  Plus, 
  TrendingUp, 
  AlertCircle,
  Building,
  CreditCard,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  LayoutGrid,
  Printer,
  SlidersHorizontal,
  RotateCcw,
  Edit2,
  Check,
  X,
  Trash2,
  Sparkles,
  Calculator,
  ShieldOff,
  Zap,
  Ban,
  RefreshCw,
  Coins
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialStatementChart } from '../FinancialStatementChart';
import { Asset, Liability } from '../../types';

export const BalanceSheetView: React.FC = () => {
  const { 
    assets = [], 
    liabilities = [], 
    totalAssets, 
    totalLiabilities, 
    netWorth, 
    liquidCash, 
    debtToAssetRatio, 
    formatMoney, 
    theme,
    currency,
    openQuickAdd,
    exportDataJSON,
    updateAsset,
    updateLiability,
    deleteAsset,
    deleteLiability,
    setLiabilitiesToZero,
    scaleBalanceSheet,
    restoreLiveBalanceSheet,
    clearBalanceSheet
  } = useFinance();

  const [activeSubSection, setActiveSubSection] = useState<'statement' | 'chart' | 'assets' | 'liabilities' | 'ratios'>('statement');
  const [showTesterPanel, setShowTesterPanel] = useState<boolean>(true);
  
  // Custom numeric input for industrial tester
  const [customValuationInput, setCustomValuationInput] = useState<string>(String(totalAssets || 10000000));
  const [customLiabilityInput, setCustomLiabilityInput] = useState<string>('0');
  
  // Inline editing state
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editingAssetVal, setEditingAssetVal] = useState<string>('');
  const [editingLiabilityId, setEditingLiabilityId] = useState<string | null>(null);
  const [editingLiabilityVal, setEditingLiabilityVal] = useState<string>('');

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Helper to format in Indian Crore / Lakh notation for testers
  const formatIndianWords = (num: number) => {
    if (num <= 0) return '₹0';
    if (num >= 10000000) {
      const cr = num / 10000000;
      return `${cr.toFixed(2)} Cr`;
    }
    if (num >= 100000) {
      const l = num / 100000;
      return `${l.toFixed(2)} Lakhs`;
    }
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  };

  // Theme-aware styles: Only dark/midnight modes have black color themes
  const bsStyles = React.useMemo(() => {
    switch (theme) {
      case 'flavorfit':
        return {
          card: 'bg-[#131522] border-[#202438] text-white shadow-lg shadow-black/20',
          innerCard: 'bg-[#161827] border-[#22263D] text-slate-200',
          heading: 'text-white',
          muted: 'text-[#8D93B4]',
          track: 'bg-[#1E2235]',
          pillActive: 'bg-[#9FE0E8] text-[#0B101D] font-bold shadow-sm',
          pillInactive: 'text-slate-400 hover:text-white',
          border: 'border-[#202438]',
          btnSecondary: 'bg-[#1A1C2D] hover:bg-[#22253B] text-slate-300 border border-[#262A44]',
          equityCard: 'bg-[#161827] border-[#202438] text-white',
          divider: 'border-[#202438]',
          rowHover: 'hover:bg-[#1A1C2D]/50',
          testerBox: 'bg-[#161827]/90 border-[#2b304c]',
        };
      case 'nature':
        return {
          card: 'bg-[#FAF8F3] border-[#DED9CD] text-[#283618] shadow-xs',
          innerCard: 'bg-[#F4F1EA] border-[#DED9CD] text-[#283618]',
          heading: 'text-[#283618]',
          muted: 'text-[#5C664E]',
          track: 'bg-[#DED9CD]',
          pillActive: 'bg-[#606C38] text-white font-bold shadow-sm',
          pillInactive: 'text-[#5C664E] hover:text-[#283618]',
          border: 'border-[#DED9CD]',
          btnSecondary: 'bg-[#ECE8DD] hover:bg-[#E2DDD0] text-[#283618] border border-[#DED9CD]',
          equityCard: 'bg-[#F4F1EA] border-[#DED9CD] text-[#283618]',
          divider: 'border-[#DED9CD]',
          rowHover: 'hover:bg-[#ECE8DD]/60',
          testerBox: 'bg-[#F4F1EA] border-[#DED9CD]',
        };
      case 'retro':
        return {
          card: 'bg-[#FAF6ED] border-[#D6CCB5] text-[#2B2520] shadow-xs',
          innerCard: 'bg-[#F5EEDF] border-[#D6CCB5] text-[#2B2520]',
          heading: 'text-[#2B2520]',
          muted: 'text-[#6E6256]',
          track: 'bg-[#D6CCB5]',
          pillActive: 'bg-[#C65952] text-white font-bold shadow-sm',
          pillInactive: 'text-[#6E6256] hover:text-[#2B2520]',
          border: 'border-[#D6CCB5]',
          btnSecondary: 'bg-[#EDE5D3] hover:bg-[#E2D8C3] text-[#2B2520] border border-[#D6CCB5]',
          equityCard: 'bg-[#F5EEDF] border-[#D6CCB5] text-[#2B2520]',
          divider: 'border-[#D6CCB5]',
          rowHover: 'hover:bg-[#EDE5D3]/60',
          testerBox: 'bg-[#F5EEDF] border-[#D6CCB5]',
        };
      case 'coolors':
        return {
          card: 'bg-[#111c38] border-[#1e2d54] text-white shadow-lg shadow-black/20',
          innerCard: 'bg-[#152347] border-[#22335e] text-blue-100',
          heading: 'text-white',
          muted: 'text-[#8ba3d4]',
          track: 'bg-[#1a284e]',
          pillActive: 'bg-blue-600 text-white font-bold shadow-sm',
          pillInactive: 'text-[#8ba3d4] hover:text-white',
          border: 'border-[#1e2d54]',
          btnSecondary: 'bg-[#17254a] hover:bg-[#1d2f5e] text-blue-200 border border-[#22335e]',
          equityCard: 'bg-[#152347] border-[#1e2d54] text-white',
          divider: 'border-[#1e2d54]',
          rowHover: 'hover:bg-[#17254a]/50',
          testerBox: 'bg-[#152347] border-[#1e2d54]',
        };
      case 'emerald':
        return {
          card: 'bg-[#062a20] border-[#0e4a39] text-white shadow-lg shadow-black/20',
          innerCard: 'bg-[#09382b] border-[#115743] text-emerald-100',
          heading: 'text-white',
          muted: 'text-[#6ee7b7]',
          track: 'bg-[#0b4031]',
          pillActive: 'bg-emerald-600 text-white font-bold shadow-sm',
          pillInactive: 'text-[#6ee7b7] hover:text-white',
          border: 'border-[#0e4a39]',
          btnSecondary: 'bg-[#09382b] hover:bg-[#0c4737] text-emerald-200 border border-[#115743]',
          equityCard: 'bg-[#09382b] border-[#0e4a39] text-white',
          divider: 'border-[#0e4a39]',
          rowHover: 'hover:bg-[#09382b]/50',
          testerBox: 'bg-[#09382b] border-[#0e4a39]',
        };
      case 'slate':
        return {
          card: 'bg-[#1e293b] border-[#334155] text-white shadow-lg',
          innerCard: 'bg-[#243247] border-[#3b4b63] text-slate-100',
          heading: 'text-white',
          muted: 'text-[#94a3b8]',
          track: 'bg-[#334155]',
          pillActive: 'bg-slate-700 text-white font-bold shadow-sm',
          pillInactive: 'text-slate-400 hover:text-white',
          border: 'border-[#334155]',
          btnSecondary: 'bg-[#27354c] hover:bg-[#30415d] text-slate-200 border border-[#3b4b63]',
          equityCard: 'bg-[#243247] border-[#334155] text-white',
          divider: 'border-[#334155]',
          rowHover: 'hover:bg-[#27354c]/50',
          testerBox: 'bg-[#243247] border-[#334155]',
        };
      case 'light':
        return {
          card: 'bg-white border-slate-200 text-slate-900 shadow-xs',
          innerCard: 'bg-slate-50 border-slate-200 text-slate-800',
          heading: 'text-slate-900',
          muted: 'text-slate-500',
          track: 'bg-slate-200',
          pillActive: 'bg-blue-600 text-white font-bold shadow-sm',
          pillInactive: 'text-slate-600 hover:text-slate-900',
          border: 'border-slate-200',
          btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
          equityCard: 'bg-blue-50/70 border-blue-200 text-slate-900',
          divider: 'border-slate-100',
          rowHover: 'hover:bg-slate-50/60',
          testerBox: 'bg-slate-50 border-slate-200',
        };
      default: // Only dark / midnight mode has black color themes
        return {
          card: 'bg-zinc-900/90 border-zinc-800 text-white shadow-lg',
          innerCard: 'bg-zinc-950/80 border-zinc-800 text-zinc-200',
          heading: 'text-white',
          muted: 'text-zinc-400',
          track: 'bg-zinc-800',
          pillActive: 'bg-blue-600 text-white font-bold shadow-sm',
          pillInactive: 'text-zinc-400 hover:text-zinc-200',
          border: 'border-zinc-800',
          btnSecondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700',
          equityCard: 'bg-blue-950/30 border-blue-800/40 text-blue-100',
          divider: 'border-zinc-800/60',
          rowHover: 'hover:bg-zinc-800/40',
          testerBox: 'bg-zinc-900/70 border-zinc-800',
        };
    }
  }, [theme]);

  // Computed metrics
  const hasZeroLiabilities = totalLiabilities === 0 || liabilities.every(l => (l.balance ?? l.amount ?? 0) === 0);
  const debtToEquityRatio = netWorth > 0 ? Math.round((totalLiabilities / netWorth) * 100) : (totalLiabilities === 0 ? 0 : 100);
  const workingCapital = liquidCash - (totalLiabilities * 0.2); // Liquid assets minus short-term liabilities approximation
  const isSolvent = netWorth >= 0;
  const currentDateStr = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handlePrint = () => {
    window.print();
  };

  // Custom valuation handlers for industrial tester
  const handleApplyCustomValuation = (targetAmount: number, zeroDebt: boolean = false) => {
    scaleBalanceSheet(targetAmount, zeroDebt);
    setCustomValuationInput(String(targetAmount));
  };

  const handleStepValuation = (delta: number) => {
    const current = totalAssets || 10000000;
    const nextVal = Math.max(0, current + delta);
    scaleBalanceSheet(nextVal, false);
    setCustomValuationInput(String(nextVal));
  };

  // Inline editing actions
  const startEditAsset = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setEditingAssetVal(String(asset.value));
  };

  const saveEditAsset = (id: string) => {
    const val = parseFloat(editingAssetVal);
    if (!isNaN(val) && val >= 0) {
      updateAsset(id, { value: val });
    }
    setEditingAssetId(null);
  };

  const startEditLiability = (liab: Liability) => {
    setEditingLiabilityId(liab.id);
    setEditingLiabilityVal(String(liab.balance ?? liab.amount ?? 0));
  };

  const saveEditLiability = (id: string) => {
    const val = parseFloat(editingLiabilityVal);
    if (!isNaN(val) && val >= 0) {
      updateLiability(id, { balance: val, amount: val });
    }
    setEditingLiabilityId(null);
  };

  const handleSetSingleLiabilityZero = (id: string) => {
    updateLiability(id, { balance: 0, amount: 0, minimumPayment: 0, monthlyPayment: 0 });
  };

  return (
    <div id="balance-sheet-view" className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isLight ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'}`}>
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold tracking-tight ${bsStyles.heading}`}>
                  Balance Sheet & Solvency Statement
                </h1>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  hasZeroLiabilities 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}>
                  {hasZeroLiabilities ? 'Debt-Free (₹0 Liabilities)' : 'Live Data'}
                </span>
              </div>
              <p className={`text-xs ${bsStyles.muted}`}>
                Audited financial position statement & valuation simulator as of {currentDateStr}
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTesterPanel(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              showTesterPanel
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-xs'
                : isLight ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200' : 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border-zinc-700'
            }`}
            title="Toggle Industrial Tester & ~1 Cr Valuation Controls"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Industrial Tester</span>
          </button>

          <button
            onClick={() => openQuickAdd('asset')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isLight 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20' 
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>

          <button
            onClick={() => openQuickAdd('liability')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isLight
                ? 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Liability</span>
          </button>

          <button
            onClick={exportDataJSON}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${bsStyles.btnSecondary}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>

          <button
            onClick={handlePrint}
            title="Print Balance Sheet or Save as PDF"
            className={`no-print flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${bsStyles.btnSecondary}`}
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* INDUSTRIAL TESTER & DYNAMIC VALUATION PANEL */}
      {showTesterPanel && (
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 ${bsStyles.testerBox}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-inherit/25">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`text-sm font-bold flex items-center gap-2 ${bsStyles.heading}`}>
                  Industrial Tester & Live Valuation Controls
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-mono">
                    Unrestricted Inputs
                  </span>
                </h3>
                <p className={`text-xs ${bsStyles.muted}`}>
                  Adjust data around 1 Crore (a little more or less), input custom values, or test zero liability scenarios.
                </p>
              </div>
            </div>

            {/* Quick Master Actions */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={setLiabilitiesToZero}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  hasZeroLiabilities
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30'
                }`}
                title="If no liabilities, sets total debt to ₹0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Debt (₹0)</span>
              </button>

              <button
                onClick={restoreLiveBalanceSheet}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 transition-all"
                title="Restore actual live portfolio balance sheet data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Live Data</span>
              </button>

              <button
                onClick={clearBalanceSheet}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30 transition-all"
                title="Clear all balance sheet data to start with ₹0 blank slate"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Clear Data (₹0)</span>
              </button>
            </div>
          </div>

          {/* Around 1 Cr Presets Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold flex items-center gap-1 ${bsStyles.muted}`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Around 1 Cr Presets (A little more / less than 1 Cr):</span>
              </span>
              <span className="font-mono text-[11px] text-amber-400 font-bold">
                Current Total: {formatMoney(totalAssets)} ({formatIndianWords(totalAssets)})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              <button
                onClick={() => handleApplyCustomValuation(8500000)}
                className={`px-2.5 py-2 rounded-xl text-xs font-mono font-medium border transition-all text-center ${
                  Math.abs(totalAssets - 8500000) < 50000 
                    ? 'bg-amber-500 text-black font-bold border-amber-600 shadow-sm' 
                    : `${bsStyles.innerCard} hover:border-amber-400/50`
                }`}
              >
                <div className="font-bold">₹85 L</div>
                <div className="text-[10px] opacity-75">-0.15 Cr</div>
              </button>

              <button
                onClick={() => handleApplyCustomValuation(9000000)}
                className={`px-2.5 py-2 rounded-xl text-xs font-mono font-medium border transition-all text-center ${
                  Math.abs(totalAssets - 9000000) < 50000 
                    ? 'bg-amber-500 text-black font-bold border-amber-600 shadow-sm' 
                    : `${bsStyles.innerCard} hover:border-amber-400/50`
                }`}
              >
                <div className="font-bold">₹90 L</div>
                <div className="text-[10px] opacity-75">-0.10 Cr</div>
              </button>

              <button
                onClick={() => handleApplyCustomValuation(9500000)}
                className={`px-2.5 py-2 rounded-xl text-xs font-mono font-medium border transition-all text-center ${
                  Math.abs(totalAssets - 9500000) < 50000 
                    ? 'bg-amber-500 text-black font-bold border-amber-600 shadow-sm' 
                    : `${bsStyles.innerCard} hover:border-amber-400/50`
                }`}
              >
                <div className="font-bold">₹95 L</div>
                <div className="text-[10px] opacity-75">-0.05 Cr</div>
              </button>

              <button
                onClick={() => handleApplyCustomValuation(10000000)}
                className={`px-2.5 py-2 rounded-xl text-xs font-mono font-medium border transition-all text-center ${
                  Math.abs(totalAssets - 10000000) < 50000 
                    ? 'bg-amber-500 text-black font-bold border-amber-600 shadow-sm ring-2 ring-amber-400/50' 
                    : `${bsStyles.innerCard} border-amber-500/40 text-amber-400 font-bold hover:bg-amber-500/10`
                }`}
              >
                <div className="font-bold">🎯 ₹1.00 Cr</div>
                <div className="text-[10px] opacity-90">Exact 1 Cr</div>
              </button>

              <button
                onClick={() => handleApplyCustomValuation(10500000)}
                className={`px-2.5 py-2 rounded-xl text-xs font-mono font-medium border transition-all text-center ${
                  Math.abs(totalAssets - 10500000) < 50000 
                    ? 'bg-amber-500 text-black font-bold border-amber-600 shadow-sm' 
                    : `${bsStyles.innerCard} hover:border-amber-400/50`
                }`}
              >
                <div className="font-bold">₹1.05 Cr</div>
                <div className="text-[10px] opacity-75">+0.05 Cr</div>
              </button>

              <button
                onClick={() => handleApplyCustomValuation(11000000)}
                className={`px-2.5 py-2 rounded-xl text-xs font-mono font-medium border transition-all text-center ${
                  Math.abs(totalAssets - 11000000) < 50000 
                    ? 'bg-amber-500 text-black font-bold border-amber-600 shadow-sm' 
                    : `${bsStyles.innerCard} hover:border-amber-400/50`
                }`}
              >
                <div className="font-bold">₹1.10 Cr</div>
                <div className="text-[10px] opacity-75">+0.10 Cr</div>
              </button>

              <button
                onClick={() => handleApplyCustomValuation(12500000)}
                className={`px-2.5 py-2 rounded-xl text-xs font-mono font-medium border transition-all text-center ${
                  Math.abs(totalAssets - 12500000) < 50000 
                    ? 'bg-amber-500 text-black font-bold border-amber-600 shadow-sm' 
                    : `${bsStyles.innerCard} hover:border-amber-400/50`
                }`}
              >
                <div className="font-bold">₹1.25 Cr</div>
                <div className="text-[10px] opacity-75">+0.25 Cr</div>
              </button>
            </div>
          </div>

          {/* Steppers & Freeform Custom Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-inherit/25">
            {/* Left: Quick +/- Steppers */}
            <div className="space-y-2">
              <span className={`text-xs font-semibold ${bsStyles.muted}`}>
                Valuation Steppers (Nudge Total by Amount):
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleStepValuation(-1000000)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono border bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700 transition-colors"
                >
                  -10 Lakhs
                </button>
                <button
                  onClick={() => handleStepValuation(-500000)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono border bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700 transition-colors"
                >
                  -5 Lakhs
                </button>
                <button
                  onClick={() => handleStepValuation(500000)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono border bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700 transition-colors"
                >
                  +5 Lakhs
                </button>
                <button
                  onClick={() => handleStepValuation(1000000)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono border bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700 transition-colors"
                >
                  +10 Lakhs
                </button>
                <button
                  onClick={() => handleStepValuation(10000000)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-mono border bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 transition-colors font-bold"
                >
                  +1 Crore
                </button>
              </div>
            </div>

            {/* Right: Direct Freeform Number Input (No Fixed Amount) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${bsStyles.muted}`}>
                  Direct Custom Input (You Put The Value):
                </span>
                {parseFloat(customValuationInput) > 0 && (
                  <span className="font-mono text-amber-400 font-semibold">
                    ≈ {formatIndianWords(parseFloat(customValuationInput))}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={customValuationInput}
                    onChange={(e) => setCustomValuationInput(e.target.value)}
                    placeholder="Enter any amount (e.g. 10000000 for 1 Cr)"
                    className="w-full pl-7 pr-3 py-1.5 rounded-xl text-xs font-mono bg-zinc-950/70 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={() => {
                    const parsed = parseFloat(customValuationInput);
                    if (!isNaN(parsed) && parsed >= 0) {
                      handleApplyCustomValuation(parsed, false);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-sm transition-colors whitespace-nowrap"
                >
                  Apply Value
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Grid: Assets = Liabilities + Net Worth */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Assets */}
        <div className={`p-4 rounded-2xl border transition-all ${bsStyles.card}`}>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${bsStyles.muted}`}>
                1. Total Assets
              </span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-extrabold font-mono tracking-tight ${bsStyles.heading}`}>
            {formatMoney(totalAssets)}
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t border-inherit/25 ${bsStyles.muted}`}>
            <span>Indian Notation:</span>
            <span className="font-mono font-medium text-emerald-400">{formatIndianWords(totalAssets)}</span>
          </div>
        </div>

        {/* Total Liabilities */}
        <div className={`p-4 rounded-2xl border transition-all ${bsStyles.card}`}>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${hasZeroLiabilities ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${bsStyles.muted}`}>
                2. Total Liabilities
              </span>
            </div>
            {hasZeroLiabilities ? (
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            ) : (
              <ArrowDownLeft className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className={`text-2xl font-extrabold font-mono tracking-tight ${hasZeroLiabilities ? 'text-emerald-500' : 'text-rose-500'}`}>
            {hasZeroLiabilities ? '₹0' : formatMoney(totalLiabilities)}
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t border-inherit/25 ${bsStyles.muted}`}>
            <span>Debt-to-Asset Load:</span>
            <span className={`font-mono font-medium ${hasZeroLiabilities ? 'text-emerald-500 font-semibold' : 'text-rose-500'}`}>
              {hasZeroLiabilities ? '0% (Debt-Free)' : `${debtToAssetRatio}%`}
            </span>
          </div>
        </div>

        {/* Equity / Net Worth */}
        <div className={`p-4 rounded-2xl border transition-all ${bsStyles.card}`}>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${bsStyles.muted}`}>
                3. Net Equity (Net Worth)
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-blue-600 dark:text-blue-400">
            {formatMoney(netWorth)}
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t border-inherit/25 ${bsStyles.muted}`}>
            <span>Solvency Status:</span>
            <span className={`font-semibold flex items-center gap-1 ${isSolvent ? 'text-emerald-500' : 'text-rose-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSolvent ? (hasZeroLiabilities ? '100% Solvent (Zero Debt)' : 'Solvent') : 'Deficit'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Balance Sheet Equation Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${bsStyles.card}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className={`text-sm font-bold ${bsStyles.heading}`}>
              Accounting Equation: Assets = Liabilities + Equity
            </h3>
            <p className={`text-xs ${bsStyles.muted}`}>
              Visual proportional composition of your balance sheet capital
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Equity: {totalAssets > 0 ? (hasZeroLiabilities ? '100%' : `${Math.round((Math.max(0, netWorth) / totalAssets) * 100)}%`) : '0%'}
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Debt: {hasZeroLiabilities ? '0%' : `${debtToAssetRatio}%`}
            </span>
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className={`w-full h-3.5 rounded-full overflow-hidden flex ${bsStyles.track}`}>
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${totalAssets > 0 ? (hasZeroLiabilities ? 100 : Math.max(0, Math.min(100, Math.round((netWorth / totalAssets) * 100)))) : 0}%` }}
            title="Equity"
          />
          <div 
            className="bg-rose-500 h-full transition-all duration-500" 
            style={{ width: `${hasZeroLiabilities ? 0 : Math.min(100, debtToAssetRatio)}%` }}
            title="Liabilities"
          />
        </div>
      </div>

      {/* Visual Rich Dad / Cashflow Quadrant Chart with Low/High Box Heights */}
      <FinancialStatementChart className="my-2" />

      {/* Sub-section Navigation Tabs */}
      <div className={`flex items-center gap-2 border-b pb-2 ${bsStyles.border} overflow-x-auto no-scrollbar`}>
        <button
          onClick={() => setActiveSubSection('statement')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubSection === 'statement'
              ? bsStyles.pillActive
              : bsStyles.pillInactive
          }`}
        >
          Summary Statement
        </button>
        <button
          id="tab-balancesheet-chart"
          onClick={() => setActiveSubSection('chart')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubSection === 'chart'
              ? bsStyles.pillActive
              : bsStyles.pillInactive
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Quadrant Flow Chart</span>
        </button>
        <button
          onClick={() => setActiveSubSection('assets')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubSection === 'assets'
              ? bsStyles.pillActive
              : bsStyles.pillInactive
          }`}
        >
          Assets Ledger ({assets.length})
        </button>
        <button
          onClick={() => setActiveSubSection('liabilities')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubSection === 'liabilities'
              ? bsStyles.pillActive
              : bsStyles.pillInactive
          }`}
        >
          Liabilities Ledger ({liabilities.length})
        </button>
        <button
          onClick={() => setActiveSubSection('ratios')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
            activeSubSection === 'ratios'
              ? bsStyles.pillActive
              : bsStyles.pillInactive
          }`}
        >
          Solvency & Ratios
        </button>
      </div>

      {/* Tab: Dedicated Chart View if selected */}
      {activeSubSection === 'chart' && (
        <div className={`p-4 rounded-2xl border text-xs space-y-2 ${bsStyles.innerCard}`}>
          <p className={`font-semibold ${bsStyles.heading}`}>
            About the Financial Statement Quadrant Chart:
          </p>
          <p className={bsStyles.muted}>
            This diagram illustrates how cash flows through your personal income statement and balance sheet. In sound financial health, your <strong>Assets</strong> box expands higher than your <strong>Liabilities</strong>, producing positive passive cashflow back into the <strong>Income</strong> box.
          </p>
        </div>
      )}

      {/* Tab 1: Formal Statement (Two-column layout) */}
      {activeSubSection === 'statement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Assets Statement */}
          <div className={`p-5 rounded-2xl border space-y-4 ${bsStyles.card}`}>
            <div className={`flex items-center justify-between pb-3 border-b ${bsStyles.divider}`}>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${bsStyles.heading}`}>
                  Assets (What You Own)
                </h3>
              </div>
              <span className="font-mono font-bold text-sm text-emerald-500">
                {formatMoney(totalAssets)}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {assets.map((asset) => {
                const pct = totalAssets > 0 ? ((asset.value / totalAssets) * 100).toFixed(1) : '0';
                const isEditing = editingAssetId === asset.id;

                return (
                  <div key={asset.id} className={`flex items-center justify-between py-2 border-b ${bsStyles.divider} last:border-0 group`}>
                    <div className="space-y-0.5 max-w-[60%]">
                      <div className={`font-semibold ${bsStyles.heading}`}>
                        {asset.name}
                      </div>
                      <div className={`text-[10px] ${bsStyles.muted}`}>
                        {asset.category} • {pct}% of assets
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editingAssetVal}
                            onChange={(e) => setEditingAssetVal(e.target.value)}
                            className="w-24 px-2 py-1 text-xs font-mono rounded-lg bg-zinc-950 border border-emerald-500 text-white focus:outline-hidden"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditAsset(asset.id)}
                            className="p-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
                            title="Save Amount"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingAssetId(null)}
                            className="p-1 rounded-md bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div>
                            <div className={`font-mono font-bold ${bsStyles.heading}`}>
                              {formatMoney(asset.value)}
                            </div>
                            {asset.institution && (
                              <div className={`text-[10px] ${bsStyles.muted} font-sans`}>
                                {asset.institution}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => startEditAsset(asset)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-opacity"
                            title="Inline Edit Amount"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {assets.length === 0 && (
                <div className={`py-8 text-center ${bsStyles.muted} text-xs`}>
                  No assets recorded on the balance sheet yet.
                </div>
              )}
            </div>

            <div className={`pt-3 border-t ${bsStyles.divider} flex items-center justify-between font-bold text-xs`}>
              <span className={bsStyles.muted}>TOTAL ASSETS</span>
              <span className="font-mono text-emerald-500 text-sm">{formatMoney(totalAssets)}</span>
            </div>
          </div>

          {/* Right Column: Liabilities & Equity Statement */}
          <div className="space-y-6">
            {/* Liabilities Card */}
            <div className={`p-5 rounded-2xl border space-y-4 ${bsStyles.card}`}>
              <div className={`flex items-center justify-between pb-3 border-b ${bsStyles.divider}`}>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-500" />
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${bsStyles.heading}`}>
                    Liabilities (What You Owe)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold text-sm ${hasZeroLiabilities ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {hasZeroLiabilities ? '₹0' : formatMoney(totalLiabilities)}
                  </span>
                  <button
                    onClick={setLiabilitiesToZero}
                    className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
                    title="Set all liabilities to ₹0"
                  >
                    Make ₹0
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {liabilities.map((liab) => {
                  const liabVal = liab.balance ?? liab.amount ?? 0;
                  const pct = totalLiabilities > 0 ? ((liabVal / totalLiabilities) * 100).toFixed(1) : '0';
                  const isEditing = editingLiabilityId === liab.id;

                  return (
                    <div key={liab.id} className={`flex items-center justify-between py-2 border-b ${bsStyles.divider} last:border-0 group`}>
                      <div className="space-y-0.5 max-w-[60%]">
                        <div className={`font-semibold flex items-center gap-2 ${bsStyles.heading}`}>
                          <span>{liab.name}</span>
                          {liabVal === 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/15 text-emerald-400 font-mono">
                              ₹0 Paid
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] ${bsStyles.muted}`}>
                          {liab.category} {liab.interestRate ? `• ${liab.interestRate}% APR` : ''} • {liabVal === 0 ? '0% debt' : `${pct}% of debt`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-right">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editingLiabilityVal}
                              onChange={(e) => setEditingLiabilityVal(e.target.value)}
                              className="w-24 px-2 py-1 text-xs font-mono rounded-lg bg-zinc-950 border border-rose-500 text-white focus:outline-hidden"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEditLiability(liab.id)}
                              className="p-1 rounded-md bg-rose-500 text-white hover:bg-rose-600"
                              title="Save Amount"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingLiabilityId(null)}
                              className="p-1 rounded-md bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div>
                              <div className={`font-mono font-bold ${liabVal === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {liabVal === 0 ? '₹0' : formatMoney(liabVal)}
                              </div>
                              {liab.minimumPayment && liabVal > 0 && (
                                <div className={`text-[10px] ${bsStyles.muted}`}>
                                  Min: {formatMoney(liab.minimumPayment)}/mo
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleSetSingleLiabilityZero(liab.id)}
                              className="opacity-0 group-hover:opacity-100 text-[10px] px-1.5 py-0.5 rounded-md hover:bg-emerald-500/20 text-emerald-400 transition-opacity"
                              title="Set this liability to 0"
                            >
                              ₹0
                            </button>
                            <button
                              onClick={() => startEditLiability(liab)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-opacity"
                              title="Inline Edit Amount"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {liabilities.length === 0 && (
                  <div className={`py-6 text-center ${bsStyles.muted} text-xs`}>
                    No liabilities recorded. Debt-free balance sheet (Total Debt: ₹0)!
                  </div>
                )}
              </div>

              <div className={`pt-3 border-t ${bsStyles.divider} flex items-center justify-between font-bold text-xs`}>
                <span className={bsStyles.muted}>TOTAL LIABILITIES</span>
                <span className={`font-mono text-sm ${hasZeroLiabilities ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {hasZeroLiabilities ? '₹0' : formatMoney(totalLiabilities)}
                </span>
              </div>
            </div>

            {/* Net Worth (Equity) Card */}
            <div className={`p-4 rounded-2xl border ${bsStyles.equityCard}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                    Net Equity Statement
                  </div>
                  <div className={`text-xs ${bsStyles.muted} mt-0.5`}>
                    Net Worth = Assets ({formatMoney(totalAssets)}) - Liabilities ({hasZeroLiabilities ? '₹0' : formatMoney(totalLiabilities)})
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-lg text-blue-500">
                  {formatMoney(netWorth)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assets Ledger */}
      {activeSubSection === 'assets' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${bsStyles.card}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${bsStyles.heading}`}>
              Itemized Assets Ledger
            </h3>
            <button
              onClick={() => openQuickAdd('asset')}
              className="flex items-center gap-1 text-xs text-blue-500 hover:underline font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Asset
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className={`border-b ${bsStyles.divider} ${bsStyles.muted}`}>
                  <th className="py-2.5 font-semibold">Asset Name</th>
                  <th className="py-2.5 font-semibold">Category</th>
                  <th className="py-2.5 font-semibold">Institution</th>
                  <th className="py-2.5 font-semibold text-right">% of Assets</th>
                  <th className="py-2.5 font-semibold text-right">Value</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${bsStyles.divider}`}>
                {assets.map((asset) => {
                  const isEditing = editingAssetId === asset.id;
                  return (
                    <tr key={asset.id} className={`transition-colors ${bsStyles.rowHover}`}>
                      <td className={`py-3 font-semibold ${bsStyles.heading}`}>{asset.name}</td>
                      <td className={`py-3 ${bsStyles.muted}`}>{asset.category}</td>
                      <td className={`py-3 ${bsStyles.muted}`}>{asset.institution || '—'}</td>
                      <td className={`py-3 text-right font-mono ${bsStyles.muted}`}>
                        {totalAssets > 0 ? ((asset.value / totalAssets) * 100).toFixed(1) : 0}%
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-emerald-500">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={editingAssetVal}
                              onChange={(e) => setEditingAssetVal(e.target.value)}
                              className="w-24 px-2 py-1 text-xs font-mono rounded bg-zinc-950 border border-emerald-500 text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEditAsset(asset.id)}
                              className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingAssetId(null)}
                              className="p-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          formatMoney(asset.value)
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => startEditAsset(asset)}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteAsset(asset.id)}
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Liabilities Ledger */}
      {activeSubSection === 'liabilities' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${bsStyles.card}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${bsStyles.heading}`}>
              Itemized Liabilities Ledger
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={setLiabilitiesToZero}
                className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
              >
                Set All to ₹0
              </button>
              <button
                onClick={() => openQuickAdd('liability')}
                className="flex items-center gap-1 text-xs text-rose-500 hover:underline font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Liability
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className={`border-b ${bsStyles.divider} ${bsStyles.muted}`}>
                  <th className="py-2.5 font-semibold">Liability Name</th>
                  <th className="py-2.5 font-semibold">Category</th>
                  <th className="py-2.5 font-semibold">Interest (APR)</th>
                  <th className="py-2.5 font-semibold text-right">Min Payment</th>
                  <th className="py-2.5 font-semibold text-right">Balance</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${bsStyles.divider}`}>
                {liabilities.map((liab) => {
                  const val = liab.balance ?? liab.amount ?? 0;
                  const isEditing = editingLiabilityId === liab.id;

                  return (
                    <tr key={liab.id} className={`transition-colors ${bsStyles.rowHover}`}>
                      <td className={`py-3 font-semibold ${bsStyles.heading}`}>
                        <div className="flex items-center gap-2">
                          <span>{liab.name}</span>
                          {val === 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono">
                              ₹0 Paid
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`py-3 ${bsStyles.muted}`}>{liab.category}</td>
                      <td className={`py-3 ${bsStyles.muted}`}>{liab.interestRate ? `${liab.interestRate}%` : '—'}</td>
                      <td className={`py-3 text-right font-mono ${bsStyles.muted}`}>
                        {liab.minimumPayment && val > 0 ? formatMoney(liab.minimumPayment) : '—'}
                      </td>
                      <td className={`py-3 text-right font-mono font-bold ${val === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={editingLiabilityVal}
                              onChange={(e) => setEditingLiabilityVal(e.target.value)}
                              className="w-24 px-2 py-1 text-xs font-mono rounded bg-zinc-950 border border-rose-500 text-white"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEditLiability(liab.id)}
                              className="p-1 rounded bg-rose-500 text-white hover:bg-rose-600"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingLiabilityId(null)}
                              className="p-1 rounded bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          val === 0 ? '₹0' : formatMoney(val)
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSetSingleLiabilityZero(liab.id)}
                            className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400"
                            title="Set to 0"
                          >
                            Set ₹0
                          </button>
                          <button
                            onClick={() => startEditLiability(liab)}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteLiability(liab.id)}
                            className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Solvency & Ratios */}
      {activeSubSection === 'ratios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-2xl border space-y-2 ${bsStyles.card}`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${bsStyles.muted}`}>Debt-to-Asset Ratio</span>
            <div className={`text-xl font-bold font-mono ${hasZeroLiabilities ? 'text-emerald-500' : 'text-rose-500'}`}>
              {hasZeroLiabilities ? '0%' : `${debtToAssetRatio}%`}
            </div>
            <p className={`text-[11px] ${bsStyles.muted}`}>
              {hasZeroLiabilities 
                ? 'Zero debt burden. 100% of your assets are owned outright.'
                : 'Measures the proportion of assets financed by debt. <30% is ideal.'}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-2 ${bsStyles.card}`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${bsStyles.muted}`}>Debt-to-Equity Ratio</span>
            <div className={`text-xl font-bold font-mono ${hasZeroLiabilities ? 'text-emerald-500' : 'text-amber-500'}`}>
              {debtToEquityRatio}%
            </div>
            <p className={`text-[11px] ${bsStyles.muted}`}>
              Comparison of liabilities to equity. Lower means higher financial resilience.
            </p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-2 ${bsStyles.card}`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${bsStyles.muted}`}>Liquid Solvency</span>
            <div className="text-xl font-bold font-mono text-emerald-500">{formatMoney(liquidCash)}</div>
            <p className={`text-[11px] ${bsStyles.muted}`}>Immediately accessible cash reserves for emergency financial protection.</p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-2 ${bsStyles.card}`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${bsStyles.muted}`}>Working Capital</span>
            <div className="text-xl font-bold font-mono text-blue-500">{formatMoney(workingCapital)}</div>
            <p className={`text-[11px] ${bsStyles.muted}`}>Surplus liquid capital available after covering immediate short-term obligations.</p>
          </div>
        </div>
      )}
    </div>
  );
};
