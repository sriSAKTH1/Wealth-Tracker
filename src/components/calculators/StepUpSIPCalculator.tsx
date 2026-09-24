import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  Coins,
  ShieldCheck,
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
  Legend
} from 'recharts';
import { formatINR, formatPercent, amountInIndianWords } from '../../utils/currencyFormatter';
import { calculateStepUpSIP } from '../../utils/financialCalculations';

interface StepUpSIPCalculatorProps {
  isLight: boolean;
  onNavigateToIncomeGrowth?: () => void;
}

export const StepUpSIPCalculator: React.FC<StepUpSIPCalculatorProps> = ({
  isLight,
  onNavigateToIncomeGrowth,
}) => {
  const [initialMonthly, setInitialMonthly] = useState<number>(10000);
  const [stepUpPercent, setStepUpPercent] = useState<number>(10);
  const [years, setYears] = useState<number>(15);
  const [annualReturn, setAnnualReturn] = useState<number>(12);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const result = useMemo(() => {
    return calculateStepUpSIP({
      initialMonthlySIP: Math.max(0, initialMonthly || 0),
      annualStepUpPercent: Math.max(0, stepUpPercent || 0),
      years: Math.max(1, years || 1),
      annualReturn: Math.max(0, annualReturn || 0),
    });
  }, [initialMonthly, stepUpPercent, years, annualReturn]);

  const handleReset = () => {
    setInitialMonthly(10000);
    setStepUpPercent(10);
    setYears(15);
    setAnnualReturn(12);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className={`p-6 rounded-3xl border ${
        isLight
          ? 'bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 border-emerald-200'
          : 'bg-gradient-to-br from-emerald-950/30 via-slate-900 to-teal-950/20 border-emerald-500/30'
      } shadow-sm space-y-4`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  Step-Up SIP (Top-Up SIP) Calculator
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Compounding Powerhouse
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Increase your SIP amount each year in tandem with salary appraisals. See how stepping up by 10% can double your final wealth!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReset}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Total Invested</span>
            <span className={`text-base sm:text-lg font-black font-mono mt-0.5 block ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {formatINR(result.totalInvestment)}
            </span>
            <span className="text-[10px] text-slate-500 block">Across {years} years</span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Estimated Returns</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-500 dark:text-emerald-400 mt-0.5 block">
              +{formatINR(result.estimatedReturns)}
            </span>
            <span className="text-[10px] text-emerald-500/80 font-bold block">
              Wealth Gained
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Step-Up Maturity Value</span>
            <span className="text-base sm:text-lg font-black font-mono text-blue-500 dark:text-blue-400 mt-0.5 block">
              {formatINR(result.maturityValue)}
            </span>
            <span className="text-[10px] text-slate-500 block truncate" title={amountInIndianWords(result.maturityValue)}>
              {amountInIndianWords(result.maturityValue)}
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Step-Up Advantage</span>
            <span className="text-base sm:text-lg font-black font-mono text-teal-500 dark:text-teal-400 mt-0.5 block">
              +{formatINR(result.stepUpAdvantage)}
            </span>
            <span className="text-[10px] text-teal-500/80 font-bold block">
              Extra vs Flat SIP
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Inputs & Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Inputs (5 cols) */}
        <div className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border space-y-5 ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
        }`}>
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-Up SIP Parameters</span>
          </div>

          {/* Initial Monthly SIP */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Starting Monthly SIP</span>
              <span className="font-mono text-emerald-400 font-bold">{formatINR(initialMonthly)}/mo</span>
            </div>
            <input
              type="number"
              min="1000"
              max="1000000"
              step="1000"
              value={initialMonthly}
              onChange={e => setInitialMonthly(Math.max(0, Number(e.target.value)))}
              className={`w-full px-3 py-2 rounded-xl border text-sm font-mono focus:ring-2 focus:ring-emerald-500/30 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
              }`}
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[5000, 10000, 15000, 25000, 50000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setInitialMonthly(val)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                    initialMonthly === val
                      ? 'bg-emerald-600 text-white border-emerald-500'
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

          {/* Annual Step-Up % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Annual Step-Up Rate (%)</span>
              <span className="font-mono text-blue-400 font-bold">+{stepUpPercent}% per year</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={stepUpPercent}
                onChange={e => setStepUpPercent(Number(e.target.value))}
                className="flex-1 accent-blue-500"
              />
              <span className="w-12 text-right font-mono text-xs font-bold">+{stepUpPercent}%</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0% (Flat SIP)</span>
              <span>10% (Standard)</span>
              <span>20%+ (Aggressive)</span>
            </div>
          </div>

          {/* Investment Horizon */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Investment Horizon (Years)</span>
              <span className="font-mono text-purple-400 font-bold">{years} Years</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={years}
                onChange={e => setYears(Number(e.target.value))}
                className="flex-1 accent-purple-500"
              />
              <span className="w-12 text-right font-mono text-xs font-bold">{years}y</span>
            </div>
          </div>

          {/* Expected Annual Return */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">Expected Annual Return Rate (%)</span>
              <span className="font-mono text-teal-400 font-bold">{annualReturn}% p.a.</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={annualReturn}
                onChange={e => setAnnualReturn(Number(e.target.value))}
                className="flex-1 accent-teal-500"
              />
              <span className="w-12 text-right font-mono text-xs font-bold">{annualReturn}%</span>
            </div>
          </div>

          {/* Ending monthly SIP info */}
          <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-950/70 border-zinc-800 text-slate-300'
          }`}>
            <div className="flex justify-between">
              <span className="text-slate-400">Final Year Monthly Contribution:</span>
              <span className="font-mono font-bold text-emerald-400">{formatINR(result.finalMonthlySIP)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Flat SIP Maturity (Without Step-Up):</span>
              <span className="font-mono font-bold text-slate-400">{formatINR(result.flatSipMaturityValue)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Graph (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Corpus Growth Comparison</span>
                <h4 className="text-sm font-bold mt-0.5">Step-Up SIP vs Flat Constant SIP</h4>
              </div>
              <span className="text-[11px] font-mono text-teal-400 font-bold">
                +{formatINR(result.stepUpAdvantage)} Extra Wealth
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.trajectory}>
                  <defs>
                    <linearGradient id="colorStepUp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorFlat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                  <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" fontSize={11} />
                  <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" fontSize={11} width={70} />
                  <Tooltip formatter={(val: any) => formatINR(Number(val))} labelFormatter={l => `Year ${l}`} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="stepUpValue"
                    name={`Step-Up SIP (+${stepUpPercent}%/yr)`}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorStepUp)"
                  />
                  <Area
                    type="monotone"
                    dataKey="flatSipValue"
                    name="Flat SIP (Constant Amount)"
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="url(#colorFlat)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeInvested"
                    name="Total Principal Invested"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Schedule Toggle */}
          <div className={`rounded-3xl border overflow-hidden ${
            isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
          }`}>
            <div
              onClick={() => setShowSchedule(!showSchedule)}
              className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                isLight ? 'hover:bg-slate-50' : 'hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Year-by-Year Step-Up Schedule</h4>
              </div>
              {showSchedule ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {showSchedule && (
              <div className="border-t border-slate-200 dark:border-slate-800 max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className={`text-[10px] uppercase tracking-wider font-semibold border-b ${
                    isLight ? 'bg-slate-50 text-slate-600' : 'bg-zinc-950 text-slate-400'
                  }`}>
                    <tr>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3 text-right">Monthly SIP</th>
                      <th className="py-2.5 px-3 text-right">Yearly Invested</th>
                      <th className="py-2.5 px-3 text-right">Total Invested</th>
                      <th className="py-2.5 px-3 text-right">Step-Up Portfolio</th>
                      <th className="py-2.5 px-3 text-right">Flat Portfolio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                    {result.trajectory.map(row => (
                      <tr key={row.year} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-zinc-800/40'}>
                        <td className="py-2 px-3 font-mono font-bold">Year {row.year}</td>
                        <td className="py-2 px-3 text-right font-mono text-emerald-400">{formatINR(row.monthlySip)}</td>
                        <td className="py-2 px-3 text-right font-mono">{formatINR(row.yearlyInvested)}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-400">{formatINR(row.cumulativeInvested)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">{formatINR(row.stepUpValue)}</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-400">{formatINR(row.flatSipValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
