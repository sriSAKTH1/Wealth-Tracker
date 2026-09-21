import React, { useState } from 'react';
import { 
  ArrowDown, 
  ArrowUp, 
  Sliders, 
  RotateCcw, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Check
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

interface FinancialStatementChartProps {
  className?: string;
}

export const FinancialStatementChart: React.FC<FinancialStatementChartProps> = ({ className = '' }) => {
  const { 
    monthlyIncome, 
    monthlyExpenses, 
    totalAssets, 
    totalLiabilities, 
    formatMoney, 
    theme,
    assets,
    liabilities,
    netWorth
  } = useFinance();

  const isLight = theme === 'light';

  // Modes: 'live' (real data), 'custom' (interactive sliders)
  const [viewMode, setViewMode] = useState<'live' | 'custom'>('live');

  // Interactive slider overrides for custom test mode
  const [customIncome, setCustomIncome] = useState(monthlyIncome || 7500);
  const [customExpenses, setCustomExpenses] = useState(monthlyExpenses || 5200);
  const [customAssets, setCustomAssets] = useState(totalAssets || 35000);
  const [customLiabilities, setCustomLiabilities] = useState(totalLiabilities || 98000);

  // Determine current active values based on viewMode
  let inc = monthlyIncome;
  let exp = monthlyExpenses;
  let ast = totalAssets;
  let lia = totalLiabilities;

  if (viewMode === 'custom') {
    inc = customIncome;
    exp = customExpenses;
    ast = customAssets;
    lia = customLiabilities;
  }

  // Guarantee non-negative numbers
  inc = Math.max(0, inc);
  exp = Math.max(0, exp);
  ast = Math.max(0, ast);
  lia = Math.max(0, lia);

  // --- HEIGHT CALCULATIONS ---
  // 1. Income vs Expenses Heights (Total combined box height ~280px)
  const totalCashflow = inc + exp;
  let incomeRatio = 0.5;
  let expenseRatio = 0.5;
  if (totalCashflow > 0) {
    incomeRatio = inc / totalCashflow;
    expenseRatio = exp / totalCashflow;
  }

  // Constrain each box between min 75px and max 220px
  const minBoxH = 75;
  const maxBoxH = 220;
  const incomeHeight = Math.round(minBoxH + incomeRatio * (maxBoxH - minBoxH));
  const expenseHeight = Math.round(minBoxH + expenseRatio * (maxBoxH - minBoxH));

  // 2. Assets vs Liabilities Heights (Baseline min 130px, max 340px)
  // Higher value gets taller height (up to 340px), lower value scales proportionally down to min 130px
  const minBalH = 130;
  const maxBalH = 340;
  let assetsHeight = minBalH;
  let liabilitiesHeight = minBalH;

  if (ast === 0 && lia === 0) {
    assetsHeight = 180;
    liabilitiesHeight = 180;
  } else if (ast >= lia) {
    assetsHeight = maxBalH;
    const ratio = ast > 0 ? lia / ast : 0;
    liabilitiesHeight = Math.round(minBalH + ratio * (maxBalH - minBalH));
  } else {
    // Liabilities > Assets (Like in user's image where liabilities extends low down)
    liabilitiesHeight = maxBalH;
    const ratio = lia > 0 ? ast / lia : 0;
    assetsHeight = Math.round(minBalH + ratio * (maxBalH - minBalH));
  }

  const netCashflow = inc - exp;
  const isCashflowPositive = netCashflow >= 0;
  const isNetWorthPositive = ast >= lia;

  return (
    <div 
      id="financial-statement-quadrant-chart"
      className={`rounded-3xl border-2 transition-all p-4 sm:p-7 shadow-lg ${
        isLight 
          ? 'bg-[#fbf8ee] border-zinc-300 text-zinc-900 shadow-zinc-200/60' 
          : 'bg-[#18181b] border-zinc-700 text-zinc-100 shadow-black/60'
      } ${className}`}
    >
      {/* Chart Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-zinc-300/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-base font-extrabold tracking-tight">
              Cashflow & Balance Quadrant Chart
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Dynamic box height scaling based on relative low and high capital balances
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-800/80 text-xs font-semibold">
          <button
            id="btn-quadrant-live"
            onClick={() => setViewMode('live')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'live'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Live Portfolio
          </button>
          <button
            id="btn-quadrant-custom"
            onClick={() => setViewMode('custom')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'custom'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Scale Tester</span>
          </button>
        </div>
      </div>

      {/* Interactive Sliders when in 'custom' tester mode */}
      {viewMode === 'custom' && (
        <div className="mb-6 p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-in fade-in duration-150">
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-emerald-600 dark:text-emerald-400">Income</span>
              <span className="font-mono">{formatMoney(customIncome)}/mo</span>
            </div>
            <input
              type="range"
              min={1000}
              max={25000}
              step={500}
              value={customIncome}
              onChange={(e) => setCustomIncome(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-rose-600 dark:text-rose-400">Expenses</span>
              <span className="font-mono">{formatMoney(customExpenses)}/mo</span>
            </div>
            <input
              type="range"
              min={1000}
              max={25000}
              step={500}
              value={customExpenses}
              onChange={(e) => setCustomExpenses(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-amber-600 dark:text-amber-400">Assets</span>
              <span className="font-mono">{formatMoney(customAssets)}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={200000}
              step={5000}
              value={customAssets}
              onChange={(e) => setCustomAssets(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-purple-600 dark:text-purple-400">Liabilities</span>
              <span className="font-mono">{formatMoney(customLiabilities)}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={200000}
              step={5000}
              value={customLiabilities}
              onChange={(e) => setCustomLiabilities(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Main Diagram Area (Centered Container matching the user's uploaded image) */}
      <div className="max-w-md mx-auto space-y-6">
        
        {/* SECTION 1: INCOME STATEMENT */}
        <div className="space-y-3">
          {/* Blue Rounded Pill Header */}
          <div className="flex justify-center">
            <div className="px-6 py-1.5 rounded-xl bg-[#c0e3f8] dark:bg-sky-950/80 border-2 border-[#54a3db] dark:border-sky-600 text-sky-950 dark:text-sky-200 font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-sm">
              INCOME STATEMENT
            </div>
          </div>

          {/* Income Statement Container (Stacked Income on top of Expenses) */}
          <div className="rounded-2xl border-[2.5px] border-zinc-950 dark:border-zinc-200 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] bg-white dark:bg-zinc-900 transition-all">
            
            {/* Box 1: Income (Green) */}
            <div 
              id="box-quadrant-income"
              style={{ height: `${incomeHeight}px` }}
              className="p-4 sm:p-5 bg-[#d8f3e5] dark:bg-emerald-950/70 border-b-[2.5px] border-zinc-950 dark:border-zinc-200 flex flex-col justify-between transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-950 dark:text-emerald-100">
                  Income
                </h3>
                <span className="font-mono font-extrabold text-sm sm:text-base text-emerald-800 dark:text-emerald-300">
                  {formatMoney(inc)}<span className="text-xs font-normal">/mo</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium text-emerald-900 dark:text-emerald-200/80 pt-1">
                <span>{inc >= exp ? '▲ High (Surplus Flow)' : '▼ Lower than Expenses'}</span>
                <span className="font-mono font-bold">
                  {totalCashflow > 0 ? Math.round((inc / totalCashflow) * 100) : 50}% of cash flow
                </span>
              </div>
            </div>

            {/* Box 2: Expenses (Pink) */}
            <div 
              id="box-quadrant-expenses"
              style={{ height: `${expenseHeight}px` }}
              className="p-4 sm:p-5 bg-[#fedde2] dark:bg-rose-950/70 flex flex-col justify-between transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-950 dark:text-rose-100">
                  Expenses
                </h3>
                <span className="font-mono font-extrabold text-sm sm:text-base text-rose-800 dark:text-rose-300">
                  {formatMoney(exp)}<span className="text-xs font-normal">/mo</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-medium text-rose-900 dark:text-rose-200/80 pt-1">
                <span>{exp > inc ? '▲ High (Deficit Warning)' : '▼ Controlled Outflow'}</span>
                <span className="font-mono font-bold">
                  {totalCashflow > 0 ? Math.round((exp / totalCashflow) * 100) : 50}% of cash flow
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BALANCE SHEET */}
        <div className="space-y-3 pt-2">
          {/* Blue Rounded Pill Header */}
          <div className="flex justify-center">
            <div className="px-6 py-1.5 rounded-xl bg-[#c0e3f8] dark:bg-sky-950/80 border-2 border-[#54a3db] dark:border-sky-600 text-sky-950 dark:text-sky-200 font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-sm">
              BALANCE SHEET
            </div>
          </div>

          {/* Side-by-Side Balance Sheet Containers: Assets on Left, Liabilities on Right */}
          <div className="grid grid-cols-2 gap-3 items-start">
            
            {/* Box 3: Assets (Yellow / Cream) */}
            <div 
              id="box-quadrant-assets"
              style={{ height: `${assetsHeight}px` }}
              className="p-4 sm:p-5 rounded-2xl border-[2.5px] border-zinc-950 dark:border-zinc-200 bg-[#fef2cd] dark:bg-amber-950/70 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all duration-300 overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-950 dark:text-amber-100">
                    Assets
                  </h3>
                </div>
                <div className="font-mono font-extrabold text-base sm:text-lg text-amber-900 dark:text-amber-200">
                  {formatMoney(ast)}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-amber-950/15 dark:border-amber-200/20 text-[11px] text-amber-950 dark:text-amber-200/80">
                <div className="font-semibold flex items-center justify-between">
                  <span>Relative Height:</span>
                  <span className="font-mono font-bold">
                    {ast >= lia ? 'HIGH ▲' : 'LOW ▼'}
                  </span>
                </div>
                {ast < lia && (
                  <p className="text-[10px] text-amber-800 dark:text-amber-300/70 leading-tight">
                    Shallow asset base relative to liability load
                  </p>
                )}
                {ast >= lia && (
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-tight font-medium">
                    Strong dominant asset base
                  </p>
                )}
              </div>
            </div>

            {/* Box 4: Liabilities (Lavender / Violet) */}
            <div 
              id="box-quadrant-liabilities"
              style={{ height: `${liabilitiesHeight}px` }}
              className="p-4 sm:p-5 rounded-2xl border-[2.5px] border-zinc-950 dark:border-zinc-200 bg-[#ebe5fb] dark:bg-violet-950/70 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all duration-300 overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-zinc-950 dark:text-violet-100">
                    Liabilities
                  </h3>
                </div>
                <div className="font-mono font-extrabold text-base sm:text-lg text-purple-900 dark:text-violet-200">
                  {formatMoney(lia)}
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-purple-950/15 dark:border-violet-200/20 text-[11px] text-purple-950 dark:text-violet-200/80">
                <div className="font-semibold flex items-center justify-between">
                  <span>Relative Height:</span>
                  <span className="font-mono font-bold">
                    {lia >= ast ? 'HIGH ▲' : 'LOW ▼'}
                  </span>
                </div>
                {lia > ast && (
                  <p className="text-[10px] text-purple-800 dark:text-violet-300/80 leading-tight">
                    Heavy liabilities extending downward past assets
                  </p>
                )}
                {lia <= ast && (
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300 leading-tight font-medium">
                    Healthy, low debt exposure
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Legend / Status Note */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] text-zinc-600 dark:text-zinc-400">
            <Info className="w-3.5 h-3.5" />
            <span>
              {lia > ast 
                ? 'Warning: Liabilities box is taller than Assets. Pay down debt to reverse the quadrant height.'
                : 'Great health: Assets box is taller than Liabilities, generating strong positive equity.'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
