import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins, 
  ShieldAlert, 
  PiggyBank, 
  Wallet, 
  Sparkles, 
  ChevronRight, 
  Layers, 
  Plus, 
  Calendar,
  Filter,
  Trash2,
  PieChart as PieIcon,
  ShieldCheck,
  Zap,
  ArrowRight,
  Bot,
  MessageSquare,
  Activity
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { Transaction } from '../../types';
import { ConfirmationModal } from '../ConfirmationModal';

export const OverviewView: React.FC = () => {
  const { 
    netWorth, 
    totalAssets, 
    totalLiabilities, 
    monthlyIncome, 
    monthlyExpenses, 
    netSavings, 
    savingsRate, 
    formatMoney, 
    assetAllocationBreakdown,
    transactions,
    deleteTransaction,
    openQuickAdd,
    setActiveTab,
    setWealthSubTab,
    setAccountSubTab,
    netWorthHistory,
    liquidRunwayMonths,
    healthScore,
    isPrivateMode,
    currency,
    convertCurrency,
    theme
  } = useFinance();

  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  const filteredTransactions = (transactions || [])
    .filter(t => txFilter === 'all' || t.type === txFilter)
    .slice(0, 6);

  // Sparkline data from history
  const chartData = (netWorthHistory || []).map(item => ({
    date: item.date.replace('2025-', 'Sep ').replace('2026-', 'Jan '),
    rawDate: item.date,
    netWorth: item.netWorth,
    assets: item.totalAssets,
    liabilities: item.totalLiabilities,
  }));

  // Dynamic 30-day growth rate calculation (supports positive, negative, and 0)
  const nw30dChange = React.useMemo(() => {
    if (netWorth === 0 || !netWorthHistory || !Array.isArray(netWorthHistory) || netWorthHistory.length < 2) return 0;
    const prev = netWorthHistory[netWorthHistory.length - 2]?.netWorth ?? 0;
    if (prev === 0) {
      return netWorth > 0 ? 100 : netWorth < 0 ? -100 : 0;
    }
    const change = ((netWorth - prev) / Math.abs(prev)) * 100;
    return isNaN(change) || !isFinite(change) ? 0 : change;
  }, [netWorth, netWorthHistory]);

  // Theme-aware styles: Only dark/midnight modes have black backgrounds!
  // Light, Nature, Retro, and FlavorFit alternate with their designated palettes.
  const heroStyles = React.useMemo(() => {
    switch (theme) {
      case 'flavorfit':
        return {
          card: 'bg-gradient-to-br from-[#131522] via-[#161827] to-[#1F2338] border-[#22263D] text-white shadow-2xl shadow-cyan-950/40',
          glow: 'bg-[#9FE0E8]/20',
          title: 'text-[#8D93B4]',
          value: 'text-white',
          subtitle: 'text-[#8D93B4]',
          assetVal: 'text-[#9FE0E8] font-bold',
          liabilityVal: 'text-rose-400',
          link: 'text-[#8D93B4] hover:text-[#9FE0E8]',
          chartStroke: '#9fe0e8',
          chartFill: '#9fe0e8',
          axisStroke: '#596080',
          tooltipBg: 'bg-[#0B0C14] border-[#202438] text-white shadow-2xl',
          badgeNeutral: 'bg-[#161827] text-slate-300 border-[#22263D]',
          sectionCard: 'bg-[#131522] border-[#202438] text-white shadow-lg shadow-black/20',
          innerCard: 'bg-[#161827] border-[#22263D] text-slate-200',
          heading: 'text-white',
          muted: 'text-[#8D93B4]',
          progressTrack: 'bg-[#1E2235]',
        };
      case 'nature':
        return {
          card: 'bg-gradient-to-br from-[#FAF8F3] via-[#F4F1EA] to-[#EBE6DA] border-[#DED9CD] text-[#283618] shadow-xl shadow-[#606C38]/10',
          glow: 'bg-[#606C38]/15',
          title: 'text-[#5C664E]',
          value: 'text-[#283618]',
          subtitle: 'text-[#5C664E]',
          assetVal: 'text-[#283618] font-bold',
          liabilityVal: 'text-[#B64A38]',
          link: 'text-[#5C664E] hover:text-[#606C38]',
          chartStroke: '#606c38',
          chartFill: '#606c38',
          axisStroke: '#787d60',
          tooltipBg: 'bg-[#FAF8F3] border-[#DED9CD] text-[#283618] shadow-xl',
          badgeNeutral: 'bg-[#FAF8F3] text-[#5C664E] border-[#DED9CD]',
          sectionCard: 'bg-[#FAF8F3] border-[#DED9CD] text-[#283618] shadow-xs',
          innerCard: 'bg-[#F4F1EA] border-[#DED9CD] text-[#283618]',
          heading: 'text-[#283618]',
          muted: 'text-[#5C664E]',
          progressTrack: 'bg-[#DED9CD]',
        };
      case 'retro':
        return {
          card: 'bg-gradient-to-br from-[#FAF6ED] via-[#F5EEDF] to-[#E8DEC8] border-[#D6CCB5] text-[#2B2520] shadow-xl shadow-[#C65952]/10',
          glow: 'bg-[#C65952]/15',
          title: 'text-[#6E6256]',
          value: 'text-[#2B2520]',
          subtitle: 'text-[#6E6256]',
          assetVal: 'text-[#2B2520] font-bold',
          liabilityVal: 'text-[#C65952]',
          link: 'text-[#6E6256] hover:text-[#C65952]',
          chartStroke: '#c65952',
          chartFill: '#c65952',
          axisStroke: '#8a7c6e',
          tooltipBg: 'bg-[#FAF6ED] border-[#D6CCB5] text-[#2B2520] shadow-xl',
          badgeNeutral: 'bg-[#FAF6ED] text-[#6E6256] border-[#D6CCB5]',
          sectionCard: 'bg-[#FAF6ED] border-[#D6CCB5] text-[#2B2520] shadow-xs',
          innerCard: 'bg-[#F5EEDF] border-[#D6CCB5] text-[#2B2520]',
          heading: 'text-[#2B2520]',
          muted: 'text-[#6E6256]',
          progressTrack: 'bg-[#D6CCB5]',
        };
      case 'light':
        return {
          card: 'bg-gradient-to-br from-white via-blue-50/40 to-slate-100/70 border-slate-200/90 text-slate-900 shadow-xl shadow-slate-200/50',
          glow: 'bg-blue-500/10',
          title: 'text-slate-500',
          value: 'text-slate-900',
          subtitle: 'text-slate-500',
          assetVal: 'text-slate-800 font-bold',
          liabilityVal: 'text-rose-600',
          link: 'text-slate-500 hover:text-blue-600',
          chartStroke: '#2563eb',
          chartFill: '#3b82f6',
          axisStroke: '#94a3b8',
          tooltipBg: 'bg-white border-slate-200 text-slate-900 shadow-xl',
          badgeNeutral: 'bg-slate-100 text-slate-600 border-slate-200',
          sectionCard: 'bg-white border-slate-200 text-slate-900 shadow-xs',
          innerCard: 'bg-slate-50 border-slate-200 text-slate-800',
          heading: 'text-slate-900',
          muted: 'text-slate-500',
          progressTrack: 'bg-slate-200',
        };
      case 'coolors':
        return {
          card: 'bg-gradient-to-br from-[#111c38] via-[#152347] to-[#1c2e5c] border-[#1e2d54] text-white shadow-2xl shadow-blue-950/40',
          glow: 'bg-blue-500/20',
          title: 'text-[#8ba3d4]',
          value: 'text-white',
          subtitle: 'text-[#8ba3d4]',
          assetVal: 'text-sky-300 font-bold',
          liabilityVal: 'text-rose-400',
          link: 'text-[#8ba3d4] hover:text-sky-300',
          chartStroke: '#38bdf8',
          chartFill: '#0284c7',
          axisStroke: '#1e2d54',
          tooltipBg: 'bg-[#111c38] border-[#1e2d54] text-white shadow-2xl',
          badgeNeutral: 'bg-[#17254a] text-blue-200 border-[#22335e]',
          sectionCard: 'bg-[#111c38] border-[#1e2d54] text-white shadow-lg',
          innerCard: 'bg-[#152347] border-[#22335e] text-blue-100',
          heading: 'text-white',
          muted: 'text-[#8ba3d4]',
          progressTrack: 'bg-[#1e2d54]',
        };
      case 'emerald':
        return {
          card: 'bg-gradient-to-br from-[#062a20] via-[#09382b] to-[#0d4a39] border-[#0e4a39] text-white shadow-2xl shadow-emerald-950/40',
          glow: 'bg-emerald-500/25',
          title: 'text-[#6ee7b7]',
          value: 'text-white',
          subtitle: 'text-[#6ee7b7]',
          assetVal: 'text-emerald-300 font-bold',
          liabilityVal: 'text-rose-300',
          link: 'text-[#6ee7b7] hover:text-white',
          chartStroke: '#34d399',
          chartFill: '#10b981',
          axisStroke: '#0e4a39',
          tooltipBg: 'bg-[#062a20] border-[#0e4a39] text-emerald-100 shadow-2xl',
          badgeNeutral: 'bg-[#09382b] text-emerald-200 border-[#115743]',
          sectionCard: 'bg-[#062a20] border-[#0e4a39] text-white shadow-lg',
          innerCard: 'bg-[#09382b] border-[#115743] text-emerald-100',
          heading: 'text-white',
          muted: 'text-[#6ee7b7]',
          progressTrack: 'bg-[#0e4a39]',
        };
      case 'slate':
        return {
          card: 'bg-gradient-to-br from-[#1e293b] via-[#243247] to-[#2c3d56] border-[#334155] text-white shadow-xl shadow-slate-950/30',
          glow: 'bg-slate-400/15',
          title: 'text-[#94a3b8]',
          value: 'text-white',
          subtitle: 'text-[#94a3b8]',
          assetVal: 'text-slate-100 font-bold',
          liabilityVal: 'text-rose-400',
          link: 'text-[#94a3b8] hover:text-white',
          chartStroke: '#94a3b8',
          chartFill: '#475569',
          axisStroke: '#334155',
          tooltipBg: 'bg-[#1e293b] border-[#334155] text-slate-100 shadow-xl',
          badgeNeutral: 'bg-[#27354c] text-slate-200 border-[#3b4b63]',
          sectionCard: 'bg-[#1e293b] border-[#334155] text-white shadow-lg',
          innerCard: 'bg-[#243247] border-[#3b4b63] text-slate-100',
          heading: 'text-white',
          muted: 'text-[#94a3b8]',
          progressTrack: 'bg-[#334155]',
        };
      default: // Only dark / midnight mode has the black color themes
        return {
          card: 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-zinc-800 text-white shadow-2xl shadow-black/80',
          glow: 'bg-zinc-700/20',
          title: 'text-zinc-400',
          value: 'text-white',
          subtitle: 'text-zinc-400',
          assetVal: 'text-zinc-200 font-bold',
          liabilityVal: 'text-rose-400',
          link: 'text-zinc-400 hover:text-white',
          chartStroke: '#3b82f6',
          chartFill: '#1d4ed8',
          axisStroke: '#27272a',
          tooltipBg: 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl',
          badgeNeutral: 'bg-zinc-900 text-zinc-400 border-zinc-800',
          sectionCard: 'bg-zinc-900/90 border-zinc-800 text-white shadow-lg',
          innerCard: 'bg-zinc-950/80 border-zinc-800 text-zinc-200',
          heading: 'text-white',
          muted: 'text-zinc-400',
          progressTrack: 'bg-zinc-800',
        };
    }
  }, [theme]);

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* 1. Net Worth Hero Card (Selected Element) - No black theme unless dark mode */}
      <div className={`relative overflow-hidden rounded-3xl border p-5 sm:p-7 transition-all ${heroStyles.card}`}>
        {/* Glow accent */}
        <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all ${heroStyles.glow}`} />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${heroStyles.title}`}>
                 Total Net Worth
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                nw30dChange === 0
                  ? heroStyles.badgeNeutral
                  : nw30dChange > 0
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20'
              }`}>
                {nw30dChange > 0 && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                {nw30dChange < 0 && <TrendingDown className="w-3 h-3 text-rose-500" />}
                {(nw30dChange ?? 0) > 0 ? '+' : ''}{(nw30dChange ?? 0).toFixed(1)}% (30d)
              </span>
            </div>
            
            <button
              onClick={() => {
                setActiveTab('wealth');
                setWealthSubTab('networth');
              }}
              className={`text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer ${heroStyles.link}`}
            >
              <span>Detailed Growth</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4">
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-mono ${heroStyles.value}`}>
              {formatMoney(netWorth)}
            </h1>
            <div className={`text-xs font-mono ${heroStyles.subtitle}`}>
              Assets: <span className={heroStyles.assetVal}>{formatMoney(totalAssets)}</span> &nbsp;|&nbsp; 
              Liabilities: <span className={heroStyles.liabilityVal}>{formatMoney(totalLiabilities)}</span>
            </div>
          </div>

          {/* Interactive Net Worth Mini Chart */}
          <div className="h-32 sm:h-40 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={heroStyles.chartFill} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={heroStyles.chartFill} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke={heroStyles.axisStroke} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className={`p-2.5 rounded-2xl border text-xs font-mono ${heroStyles.tooltipBg}`}>
                          <p className={`mb-1 ${heroStyles.muted}`}>{data.rawDate}</p>
                          <p className="font-bold" style={{ color: heroStyles.chartStroke }}>
                            Net Worth: {isPrivateMode ? '••••••' : `$${(Number(data.netWorth) || 0).toLocaleString()}`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="netWorth" 
                  stroke={heroStyles.chartStroke} 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#nwGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. Cash Flow & Monthly Velocity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Income */}
        <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col justify-between transition-all ${heroStyles.sectionCard}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${heroStyles.muted}`}>Monthly Income</span>
              <span className="text-[10px] font-mono font-medium text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                Inflow
              </span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatMoney(monthlyIncome)}
            </div>
            <p className={`text-[11px] mt-0.5 ${heroStyles.muted}`}>Total earned & passive incoming cash flow</p>
          </div>
        </div>

        {/* Expenses */}
        <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col justify-between transition-all ${heroStyles.sectionCard}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${heroStyles.muted}`}>Monthly Expenses</span>
              <span className="text-[10px] font-mono font-medium text-rose-500 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                Outflow
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatMoney(monthlyExpenses)}
            </div>
            <p className={`text-[11px] mt-0.5 ${heroStyles.muted}`}>Living, discretionary & debt spending</p>
          </div>
        </div>

        {/* Net Savings & Rate */}
        <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col justify-between transition-all ${heroStyles.sectionCard}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${heroStyles.muted}`}>Net Savings Rate</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400 border border-blue-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${heroStyles.heading}`}>
                {formatMoney(netSavings)}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono">
                {savingsRate}% saved
              </span>
            </div>
            <div className={`w-full ${heroStyles.progressTrack} h-1.5 rounded-full mt-2 overflow-hidden`}>
              <div 
                className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Investments & Asset Classes Breakdown */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 transition-all ${heroStyles.sectionCard}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <h2 className={`text-sm font-bold ${heroStyles.heading}`}>Asset Classes & Capital Allocation</h2>
          </div>
          <button
            onClick={() => {
              setActiveTab('wealth');
              setWealthSubTab('allocation');
            }}
            className={`text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer ${heroStyles.link}`}
          >
            <span>Target Allocation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stacked Percentage Bar */}
        <div className={`w-full h-3 rounded-full overflow-hidden flex ${heroStyles.progressTrack} gap-0.5`}>
          {assetAllocationBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="h-full transition-all hover:opacity-80"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              title={`${item.category}: ${item.percentage}%`}
            />
          ))}
        </div>

        {/* Asset Classes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
          {assetAllocationBreakdown.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => {
                setActiveTab('wealth');
                setWealthSubTab('assets');
              }}
              className={`p-3 rounded-2xl border hover:border-blue-500/50 cursor-pointer transition-all ${heroStyles.innerCard}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className={`text-[11px] font-medium truncate max-w-[100px] ${heroStyles.muted}`}>
                    {item.category}
                  </span>
                </div>
                <span className={`text-[10px] font-mono font-semibold ${heroStyles.muted}`}>
                  {item.percentage}%
                </span>
              </div>
              <div className={`text-xs font-mono font-bold ${heroStyles.heading}`}>
                {formatMoney(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 4. Recent Transactions & Activity Stream */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-4 transition-all ${heroStyles.sectionCard}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className={`text-sm font-bold ${heroStyles.heading}`}>Recent Financial Ledger</h2>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono border ${heroStyles.badgeNeutral}`}>
              {(transactions || []).length} records
            </span>
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-2xl border text-xs ${heroStyles.innerCard}`}>
            <button
              onClick={() => setTxFilter('all')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                txFilter === 'all' 
                  ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                  : `${heroStyles.muted} hover:opacity-80`
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTxFilter('income')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                txFilter === 'income' 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold' 
                  : `${heroStyles.muted} hover:opacity-80`
              }`}
            >
              Inflow
            </button>
            <button
              onClick={() => setTxFilter('expense')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                txFilter === 'expense' 
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold' 
                  : `${heroStyles.muted} hover:opacity-80`
              }`}
            >
              Outflow
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="divide-y divide-inherit/25">
          {filteredTransactions.length === 0 ? (
            <div className={`py-8 text-center text-xs ${heroStyles.muted}`}>
              No transactions recorded in this category.
            </div>
          ) : (
            filteredTransactions.map(tx => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-2xl shrink-0 ${
                    tx.type === 'income' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${heroStyles.heading}`}>
                      {tx.description}
                    </p>
                    <div className={`flex items-center gap-2 text-[10px] mt-0.5 ${heroStyles.muted}`}>
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.accountName}</span>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-mono text-xs font-bold ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : heroStyles.heading
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatMoney(convertCurrency(tx.amount, tx.currency || currency, currency))}
                  </span>
                  <button
                    id={`btn-delete-transaction-${tx.id}`}
                    onClick={() => setTransactionToDelete(tx)}
                    title="Delete record"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Quick Action */}
        <div className="pt-2 flex items-center justify-between border-t border-inherit/25 text-xs">
          <button
            onClick={() => openQuickAdd('expense')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Transaction
          </button>
          <button
            onClick={() => {
              setActiveTab('account');
              setAccountSubTab('money');
            }}
            className={`cursor-pointer ${heroStyles.muted} hover:${heroStyles.heading}`}
          >
            View Cash Flow Activity →
          </button>
        </div>
      </div>

      {/* 5. Health & Solvency Scorecard */}
      <div className={`p-5 sm:p-6 rounded-3xl border space-y-3 transition-all ${heroStyles.sectionCard}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <h2 className={`text-sm font-bold ${heroStyles.heading}`}>Financial Vital Signs</h2>
          </div>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            Score: {healthScore.score}/100 ({healthScore.grade})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {healthScore.metrics.map((m, idx) => (
            <div key={idx} className={`p-3.5 rounded-2xl border ${heroStyles.innerCard}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold ${heroStyles.heading}`}>{m.label}</span>
                <span className={`w-2 h-2 rounded-full ${
                  m.status === 'good' ? 'bg-emerald-400' : m.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
              </div>
              <p className={`text-[11px] mt-1 font-mono ${heroStyles.muted}`}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Deleting Transaction */}
      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => {
          if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
          }
        }}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction record? This action will permanently remove it and recalculate your monthly cashflow and budget analytics."
        itemType="transaction"
        itemName={transactionToDelete?.description}
        details={transactionToDelete ? [
          { 
            label: 'Amount', 
            value: `${transactionToDelete.type === 'income' ? '+' : '-'}${formatMoney(convertCurrency(transactionToDelete.amount, transactionToDelete.currency || currency, currency))}` 
          },
          { label: 'Category', value: transactionToDelete.category },
          { label: 'Account', value: transactionToDelete.accountName },
          { label: 'Date', value: transactionToDelete.date },
          { label: 'Type', value: transactionToDelete.type.toUpperCase() }
        ] : []}
        confirmButtonText="Delete Transaction"
      />
    </div>
  );
};
