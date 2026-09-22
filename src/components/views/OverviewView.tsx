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
import { IncomeVelocityChart } from '../charts/IncomeVelocityChart';
import { FinAIChatModal } from '../chat/FinAIChatModal';

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
    convertCurrency
  } = useFinance();

  const [txFilter, setTxFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | undefined>(undefined);
  const [incomeCardMode, setIncomeCardMode] = useState<'chart' | 'chat' | 'compact'>('chart');
  const [quickChatInput, setQuickChatInput] = useState('');

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

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* 1. Net Worth Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 p-5 sm:p-7 shadow-2xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                 Total Net Worth
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                nw30dChange === 0
                  ? 'bg-slate-800/60 text-slate-400 border-slate-700/60'
                  : nw30dChange > 0
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
              }`}>
                {nw30dChange > 0 && <TrendingUp className="w-3 h-3 text-emerald-400" />}
                {nw30dChange < 0 && <TrendingDown className="w-3 h-3 text-rose-400" />}
                {(nw30dChange ?? 0) > 0 ? '+' : ''}{(nw30dChange ?? 0).toFixed(1)}% (30d)
              </span>
            </div>
            
            <button
              onClick={() => {
                setActiveTab('wealth');
                setWealthSubTab('networth');
              }}
              className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Detailed Growth</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono">
              {formatMoney(netWorth)}
            </h1>
            <div className="text-xs text-slate-400 font-mono">
              Assets: <span className="text-slate-200">{formatMoney(totalAssets)}</span> &nbsp;|&nbsp; 
              Liabilities: <span className="text-rose-400">{formatMoney(totalLiabilities)}</span>
            </div>
          </div>

          {/* Interactive Net Worth Mini Chart */}
          <div className="h-32 sm:h-40 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-2xl text-xs font-mono">
                          <p className="text-slate-400 mb-1">{data.rawDate}</p>
                          <p className="text-blue-400 font-bold">
                            Net Worth: {isPrivateMode ? '••••••' : `$${data.netWorth.toLocaleString()}`}
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
                  stroke="#3b82f6" 
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
        {/* Income with Unique Chart & FinAI Chat Integration */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold">Monthly Income</span>
              <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                Inflow
              </span>
            </div>

            <button
              onClick={() => {
                setAiInitialQuery(undefined);
                setIsAIChatOpen(true);
              }}
              className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer shadow-xs"
              title="Open FinAI Cashflow Copilot Chat"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>FinAI Chat</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {formatMoney(monthlyIncome)}
              </div>
              
              {/* Unique View Toggle: Chart vs Chat vs Compact */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  onClick={() => setIncomeCardMode('chart')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                    incomeCardMode === 'chart'
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Show unique inflow velocity chart"
                >
                  📊 Chart
                </button>
                <button
                  onClick={() => setIncomeCardMode('chat')}
                  className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                    incomeCardMode === 'chat'
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Show interactive AI chat questions"
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setIncomeCardMode('compact')}
                  className={`px-1.5 py-0.5 rounded-md font-medium transition-all ${
                    incomeCardMode === 'compact'
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Compact view"
                >
                  ⚡
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5">Total earned & passive incoming cash flow</p>

            {/* Mode 1: Unique Inflow Stream & Cadence Chart */}
            {incomeCardMode === 'chart' && (
              <IncomeVelocityChart />
            )}

            {/* Mode 2: Interactive In-Card AI Cashflow Chat Box */}
            {incomeCardMode === 'chat' && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Ask FinAI Copilot</span>
                  </div>
                  <button
                    onClick={() => {
                      setAiInitialQuery(undefined);
                      setIsAIChatOpen(true);
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <span>Full Screen</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Quick Interactive Prompt Chips */}
                <div className="flex flex-col gap-1.5">
                  {[
                    `How to scale my ${formatMoney(monthlyIncome)}/mo by 25%?`,
                    `Is my ${formatMoney(monthlyExpenses)}/mo burn rate safe?`,
                    `Where should I deploy my ${formatMoney(netSavings)} surplus?`
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiInitialQuery(q);
                        setIsAIChatOpen(true);
                      }}
                      className="text-left text-[10px] p-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 text-slate-300 border border-slate-800 hover:border-emerald-500/30 transition-all truncate flex items-center justify-between group"
                    >
                      <span className="truncate">{q}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-400 shrink-0 transition-opacity" />
                    </button>
                  ))}
                </div>

                {/* Micro input bar */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={quickChatInput}
                    onChange={(e) => setQuickChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && quickChatInput.trim()) {
                        setAiInitialQuery(quickChatInput.trim());
                        setQuickChatInput('');
                        setIsAIChatOpen(true);
                      }
                    }}
                    placeholder="Type financial question..."
                    className="flex-1 px-2.5 py-1 text-[11px] rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    onClick={() => {
                      if (quickChatInput.trim()) {
                        setAiInitialQuery(quickChatInput.trim());
                        setQuickChatInput('');
                        setIsAIChatOpen(true);
                      }
                    }}
                    className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all text-[11px]"
                    title="Send to FinAI Chat"
                  >
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Compact view with quick launch */}
            {incomeCardMode === 'compact' && (
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    setAiInitialQuery(`How can I optimize my monthly income of ${formatMoney(monthlyIncome)}?`);
                    setIsAIChatOpen(true);
                  }}
                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 hover:border-emerald-500/40 flex items-center gap-1 transition-all"
                >
                  <Bot className="w-3 h-3" />
                  <span>Chat with FinAI</span>
                </button>
                <button
                  onClick={() => setIncomeCardMode('chart')}
                  className="text-[10px] px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-all"
                >
                  <span>Show Chart</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Expenses */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold">Monthly Expenses</span>
              <span className="text-[10px] font-mono font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                Outflow
              </span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-rose-400">
              {formatMoney(monthlyExpenses)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Living, discretionary & debt spending</p>
          </div>
        </div>

        {/* Net Savings & Rate */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Net Savings Rate</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-100">
                {formatMoney(netSavings)}
              </span>
              <span className="text-xs font-semibold text-blue-400 font-mono">
                {savingsRate}% saved
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Investments & Asset Classes Breakdown */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100">Asset Classes & Capital Allocation</h2>
          </div>
          <button
            onClick={() => {
              setActiveTab('wealth');
              setWealthSubTab('allocation');
            }}
            className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 font-medium transition-colors"
          >
            <span>Target Allocation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 gap-0.5">
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
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/40 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[11px] font-medium text-slate-300 truncate max-w-[100px]">
                    {item.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-semibold">
                  {item.percentage}%
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-100">
                {formatMoney(item.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Transactions & Activity Stream */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-100">Recent Financial Ledger</h2>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-mono">
              {(transactions || []).length} records
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setTxFilter('all')}
              className={`px-3 py-1 rounded-xl transition-all ${
                txFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTxFilter('income')}
              className={`px-3 py-1 rounded-xl transition-all ${
                txFilter === 'income' ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inflow
            </button>
            <button
              onClick={() => setTxFilter('expense')}
              className={`px-3 py-1 rounded-xl transition-all ${
                txFilter === 'expense' ? 'bg-rose-500/20 text-rose-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Outflow
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="divide-y divide-slate-800/80">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions recorded in this category.
            </div>
          ) : (
            filteredTransactions.map(tx => (
              <div key={tx.id} className="py-3 flex items-center justify-between gap-3 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-2xl shrink-0 ${
                    tx.type === 'income' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
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
                    tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatMoney(convertCurrency(tx.amount, tx.currency || currency, currency))}
                  </span>
                  <button
                    id={`btn-delete-transaction-${tx.id}`}
                    onClick={() => setTransactionToDelete(tx)}
                    title="Delete record"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Quick Action */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
          <button
            onClick={() => openQuickAdd('expense')}
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Transaction
          </button>
          <button
            onClick={() => {
              setActiveTab('account');
              setAccountSubTab('money');
            }}
            className="text-slate-400 hover:text-slate-200"
          >
            View Cash Flow Activity →
          </button>
        </div>
      </div>

      {/* 5. Health & Solvency Scorecard */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold text-slate-100">Financial Vital Signs</h2>
          </div>
          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            Score: {healthScore.score}/100 ({healthScore.grade})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {healthScore.metrics.map((m, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-300">{m.label}</span>
                <span className={`w-2 h-2 rounded-full ${
                  m.status === 'good' ? 'bg-emerald-400' : m.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">{m.desc}</p>
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

      {/* FinAI Cashflow Copilot Chat Dialog */}
      <FinAIChatModal 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
        initialQuery={aiInitialQuery} 
      />
    </div>
  );
};
