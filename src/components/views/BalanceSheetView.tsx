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
  Printer
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialStatementChart } from '../FinancialStatementChart';

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
    openQuickAdd,
    exportDataJSON
  } = useFinance();

  const [activeSubSection, setActiveSubSection] = useState<'statement' | 'chart' | 'assets' | 'liabilities' | 'ratios'>('statement');
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

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
        };
    }
  }, [theme]);

  // Computed metrics
  const debtToEquityRatio = netWorth > 0 ? Math.round((totalLiabilities / netWorth) * 100) : 100;
  const workingCapital = liquidCash - (totalLiabilities * 0.2); // Liquid assets minus short-term liabilities approximation
  const isSolvent = netWorth > 0;
  const currentDateStr = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handlePrint = () => {
    window.print();
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
              <h1 className={`text-xl font-bold tracking-tight ${bsStyles.heading}`}>
                Balance Sheet & Solvency Statement
              </h1>
              <p className={`text-xs ${bsStyles.muted}`}>
                Audited financial position statement & balance snapshot as of {currentDateStr}
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
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
            <span>Liquid Cash:</span>
            <span className={`font-mono font-medium ${bsStyles.heading}`}>{formatMoney(liquidCash)}</span>
          </div>
        </div>

        {/* Total Liabilities */}
        <div className={`p-4 rounded-2xl border transition-all ${bsStyles.card}`}>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${bsStyles.muted}`}>
                2. Total Liabilities
              </span>
            </div>
            <ArrowDownLeft className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-rose-500">
            {formatMoney(totalLiabilities)}
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t border-inherit/25 ${bsStyles.muted}`}>
            <span>Debt-to-Asset Load:</span>
            <span className="font-mono font-medium text-rose-500">{debtToAssetRatio}%</span>
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
              {isSolvent ? 'Solvent' : 'Deficit'}
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
              Equity: {totalAssets > 0 ? Math.round((Math.max(0, netWorth) / totalAssets) * 100) : 0}%
            </span>
            <span className="flex items-center gap-1.5 text-rose-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Debt: {debtToAssetRatio}%
            </span>
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className={`w-full h-3.5 rounded-full overflow-hidden flex ${bsStyles.track}`}>
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${totalAssets > 0 ? Math.max(0, Math.min(100, Math.round((netWorth / totalAssets) * 100))) : 0}%` }}
            title="Equity"
          />
          <div 
            className="bg-rose-500 h-full transition-all duration-500" 
            style={{ width: `${Math.min(100, debtToAssetRatio)}%` }}
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
                return (
                  <div key={asset.id} className={`flex items-center justify-between py-1.5 border-b ${bsStyles.divider} last:border-0`}>
                    <div className="space-y-0.5">
                      <div className={`font-semibold ${bsStyles.heading}`}>
                        {asset.name}
                      </div>
                      <div className={`text-[10px] ${bsStyles.muted}`}>
                        {asset.category} • {pct}% of assets
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${bsStyles.heading}`}>
                        {formatMoney(asset.value)}
                      </div>
                      {asset.institution && (
                        <div className={`text-[10px] ${bsStyles.muted} font-sans`}>
                          {asset.institution}
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
                <span className="font-mono font-bold text-sm text-rose-500">
                  {formatMoney(totalLiabilities)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                {liabilities.map((liab) => {
                  const pct = totalLiabilities > 0 ? ((liab.amount / totalLiabilities) * 100).toFixed(1) : '0';
                  return (
                    <div key={liab.id} className={`flex items-center justify-between py-1.5 border-b ${bsStyles.divider} last:border-0`}>
                      <div className="space-y-0.5">
                        <div className={`font-semibold ${bsStyles.heading}`}>
                          {liab.name}
                        </div>
                        <div className={`text-[10px] ${bsStyles.muted}`}>
                          {liab.category} {liab.interestRate ? `• ${liab.interestRate}% APR` : ''} • {pct}% of debt
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-rose-500">
                          {formatMoney(liab.amount)}
                        </div>
                        {liab.minimumPayment && (
                          <div className={`text-[10px] ${bsStyles.muted}`}>
                            Min: {formatMoney(liab.minimumPayment)}/mo
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {liabilities.length === 0 && (
                  <div className={`py-8 text-center ${bsStyles.muted} text-xs`}>
                    No liabilities recorded. Debt-free balance sheet!
                  </div>
                )}
              </div>

              <div className={`pt-3 border-t ${bsStyles.divider} flex items-center justify-between font-bold text-xs`}>
                <span className={bsStyles.muted}>TOTAL LIABILITIES</span>
                <span className="font-mono text-rose-500 text-sm">{formatMoney(totalLiabilities)}</span>
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
                    Net Worth = Assets ({formatMoney(totalAssets)}) - Liabilities ({formatMoney(totalLiabilities)})
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
                </tr>
              </thead>
              <tbody className={`divide-y ${bsStyles.divider}`}>
                {assets.map((asset) => (
                  <tr key={asset.id} className={`transition-colors ${bsStyles.rowHover}`}>
                    <td className={`py-3 font-semibold ${bsStyles.heading}`}>{asset.name}</td>
                    <td className={`py-3 ${bsStyles.muted}`}>{asset.category}</td>
                    <td className={`py-3 ${bsStyles.muted}`}>{asset.institution || '—'}</td>
                    <td className={`py-3 text-right font-mono ${bsStyles.muted}`}>
                      {totalAssets > 0 ? ((asset.value / totalAssets) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-500">
                      {formatMoney(asset.value)}
                    </td>
                  </tr>
                ))}
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
            <button
              onClick={() => openQuickAdd('liability')}
              className="flex items-center gap-1 text-xs text-rose-500 hover:underline font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Liability
            </button>
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
                </tr>
              </thead>
              <tbody className={`divide-y ${bsStyles.divider}`}>
                {liabilities.map((liab) => (
                  <tr key={liab.id} className={`transition-colors ${bsStyles.rowHover}`}>
                    <td className={`py-3 font-semibold ${bsStyles.heading}`}>{liab.name}</td>
                    <td className={`py-3 ${bsStyles.muted}`}>{liab.category}</td>
                    <td className={`py-3 ${bsStyles.muted}`}>{liab.interestRate ? `${liab.interestRate}%` : '—'}</td>
                    <td className={`py-3 text-right font-mono ${bsStyles.muted}`}>
                      {liab.minimumPayment ? formatMoney(liab.minimumPayment) : '—'}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-rose-500">
                      {formatMoney(liab.amount)}
                    </td>
                  </tr>
                ))}
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
            <div className="text-xl font-bold font-mono text-rose-500">{debtToAssetRatio}%</div>
            <p className={`text-[11px] ${bsStyles.muted}`}>Measures the proportion of assets financed by debt. &lt;30% is ideal.</p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-2 ${bsStyles.card}`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${bsStyles.muted}`}>Debt-to-Equity Ratio</span>
            <div className="text-xl font-bold font-mono text-amber-500">{debtToEquityRatio}%</div>
            <p className={`text-[11px] ${bsStyles.muted}`}>Comparison of liabilities to equity. Lower means higher financial resilience.</p>
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
