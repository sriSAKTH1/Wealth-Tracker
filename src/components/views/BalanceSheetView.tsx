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
  LayoutGrid
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
  const isLight = theme === 'light';

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
              <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Balance Sheet & Solvency Statement
              </h1>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
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
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: Assets = Liabilities + Net Worth */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Assets */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                1. Total Assets
              </span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-extrabold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {formatMoney(totalAssets)}
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
            <span>Liquid Cash:</span>
            <span className={`font-mono font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{formatMoney(liquidCash)}</span>
          </div>
        </div>

        {/* Total Liabilities */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                2. Total Liabilities
              </span>
            </div>
            <ArrowDownLeft className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono tracking-tight text-rose-500">
            {formatMoney(totalLiabilities)}
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
            <span>Debt-to-Asset Load:</span>
            <span className="font-mono font-medium text-rose-500">{debtToAssetRatio}%</span>
          </div>
        </div>

        {/* Equity / Net Worth */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                3. Net Equity (Net Worth)
              </span>
            </div>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-2xl font-extrabold font-mono tracking-tight ${isLight ? 'text-blue-700' : 'text-blue-400'}`}>
            {formatMoney(netWorth)}
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t ${isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
            <span>Solvency Status:</span>
            <span className={`font-semibold flex items-center gap-1 ${isSolvent ? 'text-emerald-500' : 'text-rose-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isSolvent ? 'Solvent' : 'Deficit'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Balance Sheet Equation Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Accounting Equation: Assets = Liabilities + Equity
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
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
        <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-200/60 dark:bg-slate-800">
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
      <div className="flex items-center gap-2 border-b pb-2 border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubSection('statement')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubSection === 'statement'
              ? isLight ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-600 text-white'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Summary Statement
        </button>
        <button
          id="tab-balancesheet-chart"
          onClick={() => setActiveSubSection('chart')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubSection === 'chart'
              ? isLight ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-600 text-white'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Quadrant Flow Chart</span>
        </button>
        <button
          onClick={() => setActiveSubSection('assets')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubSection === 'assets'
              ? isLight ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-600 text-white'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Assets Ledger ({assets.length})
        </button>
        <button
          onClick={() => setActiveSubSection('liabilities')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubSection === 'liabilities'
              ? isLight ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-600 text-white'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Liabilities Ledger ({liabilities.length})
        </button>
        <button
          onClick={() => setActiveSubSection('ratios')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            activeSubSection === 'ratios'
              ? isLight ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-600 text-white'
              : isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Solvency & Ratios
        </button>
      </div>

      {/* Tab: Dedicated Chart View if selected */}
      {activeSubSection === 'chart' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            About the Financial Statement Quadrant Chart:
          </p>
          <p>
            This diagram illustrates how cash flows through your personal income statement and balance sheet. In sound financial health, your <strong>Assets</strong> box expands higher than your <strong>Liabilities</strong>, producing positive passive cashflow back into the <strong>Income</strong> box.
          </p>
        </div>
      )}

      {/* Tab 1: Formal Statement (Two-column layout) */}
      {activeSubSection === 'statement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Assets Statement */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
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
                  <div key={asset.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                    <div className="space-y-0.5">
                      <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {asset.name}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        {asset.category} • {pct}% of assets
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {formatMoney(asset.value)}
                      </div>
                      {asset.institution && (
                        <div className="text-[10px] text-slate-400 font-sans">
                          {asset.institution}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {assets.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No assets recorded on the balance sheet yet.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold text-xs">
              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>TOTAL ASSETS</span>
              <span className="font-mono text-emerald-500 text-sm">{formatMoney(totalAssets)}</span>
            </div>
          </div>

          {/* Right Column: Liabilities & Equity Statement */}
          <div className="space-y-6">
            {/* Liabilities Card */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-rose-500" />
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
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
                    <div key={liab.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                      <div className="space-y-0.5">
                        <div className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          {liab.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {liab.category} {liab.interestRate ? `• ${liab.interestRate}% APR` : ''} • {pct}% of debt
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-rose-500">
                          {formatMoney(liab.amount)}
                        </div>
                        {liab.minimumPayment && (
                          <div className="text-[10px] text-slate-400">
                            Min: {formatMoney(liab.minimumPayment)}/mo
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {liabilities.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No liabilities recorded. Debt-free balance sheet!
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold text-xs">
                <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>TOTAL LIABILITIES</span>
                <span className="font-mono text-rose-500 text-sm">{formatMoney(totalLiabilities)}</span>
              </div>
            </div>

            {/* Net Worth (Equity) Card */}
            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-blue-50/70 border-blue-200 text-slate-900' : 'bg-blue-950/20 border-blue-800/40 text-blue-100'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Net Equity Statement
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Net Worth = Assets ({formatMoney(totalAssets)}) - Liabilities ({formatMoney(totalLiabilities)})
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-lg text-blue-600 dark:text-blue-400">
                  {formatMoney(netWorth)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Assets Ledger */}
      {activeSubSection === 'assets' && (
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Itemized Assets Ledger
            </h3>
            <button
              onClick={() => openQuickAdd('asset')}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Asset
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                  <th className="py-2.5 font-semibold">Asset Name</th>
                  <th className="py-2.5 font-semibold">Category</th>
                  <th className="py-2.5 font-semibold">Institution</th>
                  <th className="py-2.5 font-semibold text-right">% of Assets</th>
                  <th className="py-2.5 font-semibold text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className={`py-3 font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{asset.name}</td>
                    <td className="py-3 text-slate-500">{asset.category}</td>
                    <td className="py-3 text-slate-400">{asset.institution || '—'}</td>
                    <td className="py-3 text-right font-mono text-slate-500">
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
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Itemized Liabilities Ledger
            </h3>
            <button
              onClick={() => openQuickAdd('liability')}
              className="flex items-center gap-1 text-xs text-rose-600 hover:underline font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Liability
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className={`border-b ${isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'}`}>
                  <th className="py-2.5 font-semibold">Liability Name</th>
                  <th className="py-2.5 font-semibold">Category</th>
                  <th className="py-2.5 font-semibold">Interest (APR)</th>
                  <th className="py-2.5 font-semibold text-right">Min Payment</th>
                  <th className="py-2.5 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {liabilities.map((liab) => (
                  <tr key={liab.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className={`py-3 font-semibold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>{liab.name}</td>
                    <td className="py-3 text-slate-500">{liab.category}</td>
                    <td className="py-3 text-slate-400">{liab.interestRate ? `${liab.interestRate}%` : '—'}</td>
                    <td className="py-3 text-right font-mono text-slate-500">
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
          <div className={`p-4 rounded-2xl border space-y-2 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Debt-to-Asset Ratio</span>
            <div className="text-xl font-bold font-mono text-rose-500">{debtToAssetRatio}%</div>
            <p className="text-[11px] text-slate-500">Measures the proportion of assets financed by debt. &lt;30% is ideal.</p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-2 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Debt-to-Equity Ratio</span>
            <div className="text-xl font-bold font-mono text-amber-500">{debtToEquityRatio}%</div>
            <p className="text-[11px] text-slate-500">Comparison of liabilities to equity. Lower means higher financial resilience.</p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-2 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Liquid Solvency</span>
            <div className="text-xl font-bold font-mono text-emerald-500">{formatMoney(liquidCash)}</div>
            <p className="text-[11px] text-slate-500">Immediately accessible cash reserves for emergency financial protection.</p>
          </div>

          <div className={`p-4 rounded-2xl border space-y-2 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
          }`}>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Working Capital</span>
            <div className="text-xl font-bold font-mono text-blue-500">{formatMoney(workingCapital)}</div>
            <p className="text-[11px] text-slate-500">Surplus liquid capital available after covering immediate short-term obligations.</p>
          </div>
        </div>
      )}
    </div>
  );
};
