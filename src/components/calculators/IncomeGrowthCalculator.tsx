import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Briefcase,
  Calendar,
  Percent,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Layers,
  RotateCcw,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
  Line
} from 'recharts';
import { formatINR, formatPercent, amountInIndianWords } from '../../utils/currencyFormatter';
import { calculateIncomeGrowth } from '../../utils/financialCalculations';

interface IncomeGrowthCalculatorProps {
  isLight: boolean;
  onNavigateToFeedback?: () => void;
  onNavigateToStepUpSip?: () => void;
}

export const IncomeGrowthCalculator: React.FC<IncomeGrowthCalculatorProps> = ({
  isLight,
  onNavigateToFeedback,
  onNavigateToStepUpSip
}) => {
  // ---------------------------------------------------------------------------
  // Inputs State
  // ---------------------------------------------------------------------------
  const [currentMonthly, setCurrentMonthly] = useState<number>(75000);
  const [annualHike, setAnnualHike] = useState<number>(10);
  const [promotionJump, setPromotionJump] = useState<number>(20);
  const [promotionInterval, setPromotionInterval] = useState<number>(3); // every 3 years
  const [sideIncomeMonthly, setSideIncomeMonthly] = useState<number>(10000);
  const [sideIncomeGrowth, setSideIncomeGrowth] = useState<number>(8);
  const [years, setYears] = useState<number>(15);
  const [currentAge, setCurrentAge] = useState<number>(26);
  const [inflationRate, setInflationRate] = useState<number>(6);

  // UI display modes
  const [chartMode, setChartMode] = useState<'monthly' | 'annual' | 'cumulative' | 'real_comparison'>('monthly');
  const [showScheduleTable, setShowScheduleTable] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // Calculations
  // ---------------------------------------------------------------------------
  const result = useMemo(() => {
    return calculateIncomeGrowth({
      currentMonthlyIncome: Math.max(0, currentMonthly || 0),
      annualHikePercent: Math.max(0, annualHike || 0),
      promotionJumpPercent: Math.max(0, promotionJump || 0),
      promotionIntervalYears: Math.max(0, promotionInterval || 0),
      sideIncomeMonthly: Math.max(0, sideIncomeMonthly || 0),
      sideIncomeGrowthPercent: Math.max(0, sideIncomeGrowth || 0),
      years: Math.max(1, years || 1),
      currentAge: Math.max(16, currentAge || 25),
      inflationRatePercent: Math.max(0, inflationRate || 0),
    });
  }, [
    currentMonthly,
    annualHike,
    promotionJump,
    promotionInterval,
    sideIncomeMonthly,
    sideIncomeGrowth,
    years,
    currentAge,
    inflationRate,
  ]);

  const initialTotalMonthly = (currentMonthly || 0) + (sideIncomeMonthly || 0);
  const initialAnnualIncome = initialTotalMonthly * 12;

  // Reset handler
  const handleReset = () => {
    setCurrentMonthly(75000);
    setAnnualHike(10);
    setPromotionJump(20);
    setPromotionInterval(3);
    setSideIncomeMonthly(10000);
    setSideIncomeGrowth(8);
    setYears(15);
    setCurrentAge(26);
    setInflationRate(6);
  };

  // CSV Export for career schedule
  const handleExportCSV = () => {
    const headers = [
      'Year',
      'Age',
      'Base Monthly Income',
      'Side Monthly Income',
      'Total Monthly Income',
      'Total Annual Gross',
      'Real Monthly Purchasing Power (Today INR)',
      'Cumulative Career Earnings',
      'Hike Applied %',
      'Is Promotion Year'
    ];

    const rows = result.trajectory.map(row => [
      row.year,
      row.age,
      row.baseMonthlyIncome,
      row.sideMonthlyIncome,
      row.totalMonthlyIncome,
      row.totalAnnualIncome,
      row.realMonthlyPurchasingPower,
      row.cumulativeEarnings,
      `${row.hikeRateApplied}%`,
      row.isPromotionYear ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Income_Growth_Trajectory_${years}Y.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =================================================================== */}
      {/* HEADER & QUICK CONTEXT */}
      {/* =================================================================== */}
      <div className={`p-6 rounded-3xl border ${
        isLight
          ? 'bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 border-blue-200'
          : 'bg-gradient-to-br from-blue-950/30 via-slate-900 to-indigo-950/20 border-blue-500/30'
      } shadow-sm space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Income Growth & Career Progression Calculator
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Interactive Graph
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Simulate how annual hikes, promotion jumps, and side hustles compound your salary and total lifetime wealth over your career.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow cursor-pointer transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>
          </div>
        </div>

        {/* Top Highlight Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Starting Total Monthly</span>
            <span className={`text-base sm:text-lg font-black font-mono mt-0.5 block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {formatINR(initialTotalMonthly)}/mo
            </span>
            <span className="text-[10px] text-slate-500 block">{formatINR(initialAnnualIncome)} / year CTC</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Projected Final Monthly</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-500 dark:text-emerald-400 mt-0.5 block">
              {formatINR(result.finalMonthlyIncome)}/mo
            </span>
            <span className="text-[10px] text-emerald-500/80 font-bold block">
              +{result.growthMultiplier}x Growth in {years} Yrs
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Final Annual CTC</span>
            <span className="text-base sm:text-lg font-black font-mono text-blue-500 dark:text-blue-400 mt-0.5 block">
              {formatINR(result.finalAnnualIncome)}
            </span>
            <span className="text-[10px] text-slate-500 block truncate" title={amountInIndianWords(result.finalAnnualIncome)}>
              {amountInIndianWords(result.finalAnnualIncome)}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Total Career Earnings</span>
            <span className="text-base sm:text-lg font-black font-mono text-purple-500 dark:text-purple-400 mt-0.5 block">
              {formatINR(result.totalLifetimeEarnings)}
            </span>
            <span className="text-[10px] text-purple-500/80 font-bold block">
              Over {years} Years Working
            </span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2-COLUMN SPLIT: INPUTS VS RESULTS & GRAPHS */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Sliders & Options (5 cols) */}
        <div className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border space-y-5 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>Career & Income Parameters</span>
            </span>
            <span className="text-[11px] font-mono text-blue-400 font-bold">Step-by-Step Inputs</span>
          </div>

          {/* 1. Current Monthly Base Salary */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Current Monthly Base Salary</span>
              <span className="font-mono text-emerald-400 font-bold">{formatINR(currentMonthly)}</span>
            </div>
            <input
              type="number"
              min="5000"
              max="5000000"
              step="5000"
              value={currentMonthly}
              onChange={e => setCurrentMonthly(Math.max(0, Number(e.target.value)))}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono focus:ring-2 focus:ring-blue-500/30 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
              }`}
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[30000, 50000, 75000, 100000, 150000, 250000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCurrentMonthly(val)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    currentMonthly === val
                      ? 'bg-blue-600 text-white border-blue-500'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {formatINR(val, { compactWords: true })}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Annual Salary Hike % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Expected Annual Hike / Appraisal</span>
              <span className="font-mono text-blue-400 font-bold">{annualHike}% per year</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={annualHike}
                onChange={e => setAnnualHike(Number(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="w-12 text-right font-mono text-xs font-bold">{annualHike}%</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Static)</span>
              <span>8%-12% (Typical)</span>
              <span>25%+ (High Growth)</span>
            </div>
          </div>

          {/* 3. Promotion / Career Jump Bump % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Promotion / Job Switch Hike</span>
              <span className="font-mono text-purple-400 font-bold">+{promotionJump}% bonus hike</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={promotionJump}
                onChange={e => setPromotionJump(Number(e.target.value))}
                className="flex-1 accent-purple-500"
              />
              <span className="w-12 text-right font-mono text-xs font-bold">+{promotionJump}%</span>
            </div>
          </div>

          {/* 4. Promotion / Switch Frequency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Promotion / Job Switch Frequency</span>
              <span className="font-mono text-indigo-400 font-bold">
                {promotionInterval === 0 ? 'None' : `Every ${promotionInterval} Years`}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { val: 0, label: 'None' },
                { val: 2, label: '2 Yrs' },
                { val: 3, label: '3 Yrs' },
                { val: 4, label: '4 Yrs' },
                { val: 5, label: '5 Yrs' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setPromotionInterval(opt.val)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer ${
                    promotionInterval === opt.val
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Side Hustle / Secondary Income */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Monthly Side Income (Freelance/Consulting)</span>
              <span className="font-mono text-teal-400 font-bold">{formatINR(sideIncomeMonthly)}/mo</span>
            </div>
            <input
              type="number"
              min="0"
              max="1000000"
              step="2000"
              value={sideIncomeMonthly}
              onChange={e => setSideIncomeMonthly(Math.max(0, Number(e.target.value)))}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono focus:ring-2 focus:ring-teal-500/30 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
              }`}
            />
            {sideIncomeMonthly > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Side Income Growth: <strong>{sideIncomeGrowth}%/yr</strong></span>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={sideIncomeGrowth}
                  onChange={e => setSideIncomeGrowth(Number(e.target.value))}
                  className="w-32 accent-teal-500"
                />
              </div>
            )}
          </div>

          {/* 6. Career Horizon & Age */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Horizon</span>
                <span className="font-mono text-blue-400 font-bold">{years} Yrs</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={years}
                onChange={e => setYears(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Current Age</span>
                <span className="font-mono text-slate-300 font-bold">{currentAge} Yrs</span>
              </div>
              <input
                type="range"
                min="18"
                max="55"
                step="1"
                value={currentAge}
                onChange={e => setCurrentAge(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* 7. Inflation Rate Adjustment */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Inflation Rate (For Purchasing Power)</span>
              <span className="font-mono text-amber-400 font-bold">{inflationRate}% p.a.</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={inflationRate}
              onChange={e => setInflationRate(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="text-[10px] text-slate-500">
              Accounts for how inflation affects real purchasing power in today's money.
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Graphs & Results Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Chart Container */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
          }`}>
            
            {/* Chart Title & Mode Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Visual Income Trajectory</span>
                </span>
                <h3 className="text-base font-bold mt-0.5">
                  {chartMode === 'monthly' && 'Monthly Income Progression Over Career'}
                  {chartMode === 'annual' && 'Annual CTC / Gross Earnings Progression'}
                  {chartMode === 'cumulative' && 'Lifetime Cumulative Career Wealth Created'}
                  {chartMode === 'real_comparison' && 'Nominal Income vs Inflation-Adjusted Purchasing Power'}
                </h3>
              </div>

              {/* Chart Modes Switcher */}
              <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-950 border-zinc-700'
              }`}>
                {[
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'annual', label: 'Annual CTC' },
                  { id: 'cumulative', label: 'Cumulative' },
                  { id: 'real_comparison', label: 'Real vs Nominal' },
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setChartMode(mode.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      chartMode === mode.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Interactive Display */}
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'cumulative' ? (
                  <AreaChart data={result.trajectory}>
                    <defs>
                      <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                    <XAxis
                      dataKey="year"
                      tickFormatter={v => `Yr ${v}`}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis
                      tickFormatter={v => formatINR(v, { compactWords: true })}
                      stroke="#64748b"
                      fontSize={11}
                      width={70}
                    />
                    <Tooltip
                      formatter={(val: any) => formatINR(Number(val))}
                      labelFormatter={l => `Career Year ${l} (Age ${currentAge + Number(l)})`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area
                      type="monotone"
                      dataKey="cumulativeEarnings"
                      name="Cumulative Career Earnings"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fill="url(#colorCumulative)"
                    />
                  </AreaChart>
                ) : chartMode === 'real_comparison' ? (
                  <AreaChart data={result.trajectory}>
                    <defs>
                      <linearGradient id="colorNominal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                    <XAxis
                      dataKey="year"
                      tickFormatter={v => `Yr ${v}`}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis
                      tickFormatter={v => formatINR(v, { compactWords: true })}
                      stroke="#64748b"
                      fontSize={11}
                      width={70}
                    />
                    <Tooltip
                      formatter={(val: any) => formatINR(Number(val))}
                      labelFormatter={l => `Year ${l} (Age ${currentAge + Number(l)})`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area
                      type="monotone"
                      dataKey="totalMonthlyIncome"
                      name="Nominal Monthly Income"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#colorNominal)"
                    />
                    <Area
                      type="monotone"
                      dataKey="realMonthlyPurchasingPower"
                      name={`Real Value (at ${inflationRate}% Inflation)`}
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      fill="url(#colorReal)"
                    />
                  </AreaChart>
                ) : chartMode === 'annual' ? (
                  <BarChart data={result.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                    <XAxis
                      dataKey="year"
                      tickFormatter={v => `Yr ${v}`}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis
                      tickFormatter={v => formatINR(v, { compactWords: true })}
                      stroke="#64748b"
                      fontSize={11}
                      width={70}
                    />
                    <Tooltip
                      formatter={(val: any) => formatINR(Number(val))}
                      labelFormatter={l => `Year ${l} (Age ${currentAge + Number(l)})`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar
                      dataKey="baseAnnualIncome"
                      name="Base Annual Salary"
                      stackId="a"
                      fill="#3b82f6"
                      radius={[0, 0, 0, 0]}
                    />
                    {sideIncomeMonthly > 0 && (
                      <Bar
                        dataKey="sideAnnualIncome"
                        name="Side Hustle Annual"
                        stackId="a"
                        fill="#14b8a6"
                        radius={[4, 4, 0, 0]}
                      />
                    )}
                  </BarChart>
                ) : (
                  <AreaChart data={result.trajectory}>
                    <defs>
                      <linearGradient id="colorBaseMonthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorSideMonthly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                    <XAxis
                      dataKey="year"
                      tickFormatter={v => `Yr ${v}`}
                      stroke="#64748b"
                      fontSize={11}
                    />
                    <YAxis
                      tickFormatter={v => formatINR(v, { compactWords: true })}
                      stroke="#64748b"
                      fontSize={11}
                      width={70}
                    />
                    <Tooltip
                      formatter={(val: any) => formatINR(Number(val))}
                      labelFormatter={l => `Year ${l} (Age ${currentAge + Number(l)})`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Area
                      type="monotone"
                      dataKey="baseMonthlyIncome"
                      name="Base Monthly Salary"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#colorBaseMonthly)"
                    />
                    {sideIncomeMonthly > 0 && (
                      <Area
                        type="monotone"
                        dataKey="sideMonthlyIncome"
                        name="Side Hustle Monthly"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        fill="url(#colorSideMonthly)"
                      />
                    )}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Quick Chart Insight Footer */}
            <div className={`p-3 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-950/70 border-zinc-800 text-slate-300'
            }`}>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Zap className="w-3.5 h-3.5" />
                </span>
                <span>
                  Compound Annual Growth Rate (CAGR): <strong>{result.annualizedGrowthRate}% p.a.</strong>
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                Promotion jumps applied every {promotionInterval > 0 ? `${promotionInterval} years` : 'none'}
              </span>
            </div>
          </div>

          {/* Career Milestones Progress Card */}
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Monthly Income Milestone Roadmap</span>
              </h4>
              <span className="text-[10px] text-slate-400">When you cross key income thresholds</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {result.milestones.slice(1, 5).map(m => {
                const reached = m.yearReached !== null;
                return (
                  <div
                    key={m.monthlyTarget}
                    className={`p-3 rounded-2xl border ${
                      reached
                        ? isLight
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : 'bg-emerald-950/20 border-emerald-500/30'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-zinc-950 border-zinc-800 opacity-50'
                    }`}
                  >
                    <div className="text-[11px] font-bold font-mono">
                      {formatINR(m.monthlyTarget)}/mo
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ({formatINR(m.monthlyTarget * 12, { compactWords: true })} CTC)
                    </div>
                    <div className="mt-2 text-xs font-bold">
                      {reached ? (
                        <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                          <span>✓ Yr {m.yearReached}</span>
                          <span className="text-[10px] font-normal text-slate-400">({m.ageReached}y old)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">&gt; {years} Yrs away</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Action: Connect with Step-Up SIP or Feedback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {onNavigateToStepUpSip && (
              <button
                type="button"
                onClick={onNavigateToStepUpSip}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between group transition-all cursor-pointer ${
                  isLight ? 'bg-blue-50/70 hover:bg-blue-50 border-blue-200 text-blue-900' : 'bg-blue-950/30 hover:bg-blue-950/50 border-blue-800 text-blue-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-blue-500">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Test Step-Up SIP</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Step up your SIP investments by {annualHike}% each year to match your income growth!
                  </div>
                </div>
              </button>
            )}

            {onNavigateToFeedback && (
              <button
                type="button"
                onClick={onNavigateToFeedback}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between group transition-all cursor-pointer ${
                  isLight ? 'bg-amber-50/70 hover:bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-800 text-amber-200'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5 text-amber-500">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Have Calculator Suggestions?</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Share your thoughts or request custom tax and career tools in our Feedback tab.
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* YEAR-BY-YEAR DETAILED SCHEDULE ACCORDION TABLE */}
      {/* =================================================================== */}
      <div className={`rounded-3xl border overflow-hidden ${
        isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
      }`}>
        <div
          onClick={() => setShowScheduleTable(!showScheduleTable)}
          className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors ${
            isLight ? 'hover:bg-slate-50' : 'hover:bg-zinc-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Year-by-Year Career Schedule Table</h3>
              <p className="text-xs text-slate-400">
                Detailed breakdown of Base Salary, Side Income, Annual CTC, and Cumulative Wealth ({result.trajectory.length} Years)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleExportCSV();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            {showScheduleTable ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>

        {showScheduleTable && (
          <div className="border-t border-slate-200 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className={`text-[11px] uppercase tracking-wider font-semibold border-b ${
                isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-zinc-950 text-slate-400 border-zinc-800'
              }`}>
                <tr>
                  <th className="py-3 px-4">Year & Age</th>
                  <th className="py-3 px-4 text-right">Base Monthly</th>
                  <th className="py-3 px-4 text-right">Side Monthly</th>
                  <th className="py-3 px-4 text-right">Total Monthly</th>
                  <th className="py-3 px-4 text-right">Annual Gross (CTC)</th>
                  <th className="py-3 px-4 text-right">Real Monthly Value</th>
                  <th className="py-3 px-4 text-right">Cumulative Earned</th>
                  <th className="py-3 px-4 text-center">Hike Applied</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                {result.trajectory.map(row => (
                  <tr
                    key={row.year}
                    className={`transition-colors ${
                      row.isPromotionYear
                        ? isLight
                          ? 'bg-purple-50/50'
                          : 'bg-purple-950/20'
                        : isLight
                        ? 'hover:bg-slate-50/80'
                        : 'hover:bg-zinc-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono font-bold">
                      Year {row.year} <span className="text-slate-400 font-normal">({row.age}y)</span>
                      {row.isPromotionYear && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[9px] uppercase font-black rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Promotion
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono">
                      {formatINR(row.baseMonthlyIncome)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-teal-400">
                      {row.sideMonthlyIncome > 0 ? formatINR(row.sideMonthlyIncome) : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-500 dark:text-emerald-400">
                      {formatINR(row.totalMonthlyIncome)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      {formatINR(row.totalAnnualIncome)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-400">
                      {formatINR(row.realMonthlyPurchasingPower)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-purple-400 font-bold">
                      {formatINR(row.cumulativeEarnings)}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.isPromotionYear
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        +{row.hikeRateApplied}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
