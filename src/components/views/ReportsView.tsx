import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Printer, 
  FileSpreadsheet,
  PlusCircle,
  Clock,
  Layers,
  Sparkles,
  Info,
  DollarSign,
  Receipt,
  Scale
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';

type TimeframeOption = '30D' | '90D' | '6M' | '1Y' | 'ALL';

export const ReportsView: React.FC = () => {
  const { 
    transactions = [], 
    formatMoney, 
    currency,
    convertCurrency,
    monthlyIncome, 
    monthlyExpenses, 
    netSavings, 
    savingsRate, 
    exportTransactionsCSV,
    isPrivateMode,
    theme,
    openQuickAdd
  } = useFinance();

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';
  const [reportTimeframe, setReportTimeframe] = useState<TimeframeOption>('6M');

  // Convert an amount into the active display currency
  const toActiveCurrency = (amt: number, txCurrency?: string) => {
    if (!txCurrency || txCurrency === currency) return amt;
    return convertCurrency(amt, txCurrency as any, currency);
  };

  // Determine reference date for timeline calculations (latest transaction date or today)
  const referenceDate = useMemo(() => {
    let latest = new Date();
    if (transactions && transactions.length > 0) {
      for (const t of transactions) {
        if (t.date) {
          const d = new Date(t.date);
          if (!isNaN(d.getTime()) && d > latest) {
            latest = d;
          }
        }
      }
    }
    return latest;
  }, [transactions]);

  // Determine number of months to display in comparative chart
  const monthsCount = useMemo(() => {
    switch (reportTimeframe) {
      case '30D': return 2; // Compare current month & preceding month
      case '90D': return 3;
      case '6M': return 6;
      case '1Y': return 12;
      case 'ALL': {
        if (!transactions || transactions.length === 0) return 6;
        let earliest = new Date(referenceDate);
        for (const t of transactions) {
          if (t.date) {
            const d = new Date(t.date);
            if (!isNaN(d.getTime()) && d < earliest) earliest = d;
          }
        }
        const diffYears = referenceDate.getFullYear() - earliest.getFullYear();
        const diffMonths = (diffYears * 12) + (referenceDate.getMonth() - earliest.getMonth()) + 1;
        return Math.max(6, Math.min(diffMonths, 24));
      }
      default: return 6;
    }
  }, [reportTimeframe, referenceDate, transactions]);

  // Generate sequence of months (chronological order)
  const monthSequence = useMemo(() => {
    const list: { key: string; label: string; shortMonth: string; year: number }[] = [];
    const endYear = referenceDate.getFullYear();
    const endMonth = referenceDate.getMonth();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(endYear, endMonth - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const shortMonth = monthNames[d.getMonth()];
      const label = `${shortMonth} ${String(yyyy).slice(-2)}`;
      list.push({ key, label, shortMonth, year: yyyy });
    }
    return list;
  }, [referenceDate, monthsCount]);

  // Multi-month cash flow comparative data: STRICTLY calculated from actual user transactions; otherwise ZERO ($0)
  const monthlyComparisonData = useMemo(() => {
    // If no transactions have been added yet, return clean ZERO data for each month
    if (!transactions || transactions.length === 0) {
      return monthSequence.map(m => ({
        month: m.label,
        key: m.key,
        income: 0,
        expense: 0,
        savings: 0,
        txCount: 0
      }));
    }

    return monthSequence.map(m => {
      // Find all transactions logged for this specific year-month
      const monthTxs = transactions.filter(t => t.date && t.date.startsWith(m.key));
      
      const income = monthTxs
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + toActiveCurrency(Number(t.amount) || 0, t.currency), 0);

      const expense = monthTxs
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + toActiveCurrency(Number(t.amount) || 0, t.currency), 0);

      const savings = income - expense;

      return {
        month: m.label,
        key: m.key,
        income: Math.round(income * 100) / 100,
        expense: Math.round(expense * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        txCount: monthTxs.length
      };
    });
  }, [monthSequence, transactions, currency]);

  // Filter transactions within the selected timeframe
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    if (reportTimeframe === 'ALL') return transactions;

    const days = reportTimeframe === '30D' ? 30 : reportTimeframe === '90D' ? 90 : reportTimeframe === '6M' ? 180 : 365;
    const cutoff = new Date(referenceDate);
    cutoff.setDate(cutoff.getDate() - days);

    return transactions.filter(t => {
      if (!t.date) return false;
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d >= cutoff;
    });
  }, [transactions, reportTimeframe, referenceDate]);

  // Top summary KPIs in the selected timeframe (strictly calculated from added transactions; otherwise 0)
  const timeframeSummary = useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netSurplus: 0,
        retentionRate: 0,
        transactionCount: 0,
        incomeCount: 0,
        expenseCount: 0,
        avgDailySpend: 0,
        avgExpenseTx: 0
      };
    }

    let income = 0;
    let expense = 0;
    let incCount = 0;
    let expCount = 0;

    filteredTransactions.forEach(t => {
      const amt = toActiveCurrency(Number(t.amount) || 0, t.currency);
      if (t.type === 'income') {
        income += amt;
        incCount++;
      } else if (t.type === 'expense') {
        expense += amt;
        expCount++;
      }
    });

    const net = income - expense;
    const rate = income > 0 && net > 0 ? Math.round((net / income) * 100) : 0;
    const days = reportTimeframe === '30D' ? 30 : reportTimeframe === '90D' ? 90 : reportTimeframe === '6M' ? 180 : 365;
    const avgDaily = days > 0 ? expense / days : 0;
    const avgExpTx = expCount > 0 ? expense / expCount : 0;

    return {
      totalIncome: Math.round(income * 100) / 100,
      totalExpenses: Math.round(expense * 100) / 100,
      netSurplus: Math.round(net * 100) / 100,
      retentionRate: rate,
      transactionCount: filteredTransactions.length,
      incomeCount: incCount,
      expenseCount: expCount,
      avgDailySpend: Math.round(avgDaily * 100) / 100,
      avgExpenseTx: Math.round(avgExpTx * 100) / 100
    };
  }, [filteredTransactions, reportTimeframe, currency]);

  // Outflow by category breakdown (strictly calculated from expense transactions; otherwise empty/zero)
  const { categoryChartData, topExpenseCategory } = useMemo(() => {
    const map: Record<string, number> = {};
    let totalExp = 0;

    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      const amt = toActiveCurrency(Number(t.amount) || 0, t.currency);
      const cat = t.category || 'Uncategorized';
      map[cat] = (map[cat] || 0) + amt;
      totalExp += amt;
    });

    const categoryColors = [
      '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', 
      '#06b6d4', '#f43f5e', '#64748b', '#14b8a6', '#eab308'
    ];

    const sorted = Object.entries(map).map(([category, amount], idx) => ({
      name: category,
      value: Math.round(amount * 100) / 100,
      color: categoryColors[idx % categoryColors.length],
      percentage: totalExp > 0 ? ((amount / totalExp) * 100).toFixed(1) : '0.0'
    })).sort((a, b) => b.value - a.value);

    return {
      categoryChartData: sorted,
      topExpenseCategory: sorted.length > 0 ? sorted[0] : null
    };
  }, [filteredTransactions, currency]);

  // Top income stream in selected timeframe
  const topIncomeCategory = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.filter(t => t.type === 'income').forEach(t => {
      const amt = toActiveCurrency(Number(t.amount) || 0, t.currency);
      const cat = t.category || 'General Income';
      map[cat] = (map[cat] || 0) + amt;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { name: sorted[0][0], value: sorted[0][1] } : null;
  }, [filteredTransactions, currency]);

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `FIX Wealth Tracker - Financial Report (${timeframeLabels[reportTimeframe]})`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const reportGeneratedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  }, []);

  const timeframeLabels: Record<TimeframeOption, string> = {
    '30D': '30 Days',
    '90D': '90 Days (Quarter)',
    '6M': '6 Months',
    '1Y': '1 Year',
    'ALL': 'All Time'
  };

  const hasAnyTransactions = transactions && transactions.length > 0;
  const hasTimeframeExpenses = timeframeSummary.totalExpenses > 0;

  return (
    <div id="financial-reports-view" className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* Top Statement Banner with Brand Logo and Website Name on Top-Left */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
        isLight 
          ? 'bg-gradient-to-r from-blue-50/70 via-white to-emerald-50/50 border-slate-200/90 shadow-xs' 
          : 'bg-gradient-to-r from-slate-900/90 via-zinc-900/95 to-slate-900/90 border-zinc-800 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Top Left: Logo with Website Name + Statement on Header */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="relative shrink-0 p-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-zinc-700/60 shadow-md shadow-blue-500/10">
              <img 
                src="/favicon.svg" 
                alt="FIX Wealth Logo" 
                className="w-10 h-10 sm:w-11 sm:h-11 object-contain"
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>FIX Wealth Tracker</span>
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                  Institutional Audit
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Verified
                </span>
              </div>

              {/* Statement on the Header */}
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                Official Financial Intelligence, Cash Flow Audit & Capital Velocity Statement
              </p>
              
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                <span>Cycle: {timeframeLabels[reportTimeframe]}</span>
                <span>•</span>
                <span>Base Currency: {currency}</span>
                <span>•</span>
                <span>Generated: {reportGeneratedDate}</span>
              </div>
            </div>
          </div>

          {/* Action Controls & Print/Export Button */}
          <div className="no-print flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="btn-report-quick-add"
              onClick={() => openQuickAdd('income')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Log Transaction</span>
            </button>
            <button
              id="btn-report-export-csv"
              onClick={exportTransactionsCSV}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs' 
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            {/* The requested Print/Export Report button */}
            <button
              id="btn-report-print-export"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Open clean browser print dialog formatted for PDF generation"
            >
              <Printer className="w-4 h-4" />
              <span>Print/Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeframe Selector Bar */}
      <div className={`p-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
      }`}>
        <div className="flex items-center gap-2">
          <Calendar className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
          <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
            Audit Timeframe:
          </span>
          <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md ${
            isLight ? 'bg-slate-100 text-slate-600' : 'bg-zinc-800 text-zinc-400'
          }`}>
            {timeframeSummary.transactionCount} transactions recorded in {timeframeLabels[reportTimeframe]}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950/20 p-1 rounded-xl border border-zinc-500/10">
          {(['30D', '90D', '6M', '1Y', 'ALL'] as TimeframeOption[]).map(tf => {
            const isSelected = reportTimeframe === tf;
            return (
              <button
                key={tf}
                id={`btn-timeframe-${tf}`}
                onClick={() => setReportTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : isLight
                      ? 'text-slate-600 hover:bg-slate-100'
                      : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top 3 Summary KPIs (Strictly Real Data; otherwise ZERO) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Inflow */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Total Inflow (Income)
            </span>
            <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {timeframeSummary.incomeCount} credits
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">
            {isPrivateMode ? '••••••' : formatMoney(timeframeSummary.totalIncome)}
          </div>
          <p className={`text-[11px] mt-1 flex items-center justify-between ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            <span>{timeframeLabels[reportTimeframe]} receipts</span>
            {timeframeSummary.totalIncome === 0 && <span className="font-mono text-amber-500/80 font-medium">($0 recorded)</span>}
          </p>
        </div>

        {/* Total Outflow */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Total Outflow (Expenses)
            </span>
            <span className="text-[10px] font-mono font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded flex items-center gap-1">
              <ArrowDownLeft className="w-3 h-3" />
              {timeframeSummary.expenseCount} debits
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1.5">
            {isPrivateMode ? '••••••' : formatMoney(timeframeSummary.totalExpenses)}
          </div>
          <p className={`text-[11px] mt-1 flex items-center justify-between ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            <span>Living, bills & discretionary</span>
            {timeframeSummary.totalExpenses === 0 && <span className="font-mono text-amber-500/80 font-medium">($0 recorded)</span>}
          </p>
        </div>

        {/* Net Capital Retention */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-zinc-300'}`}>
              Net Capital Retention
            </span>
            <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${
              timeframeSummary.netSurplus > 0
                ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
                : timeframeSummary.netSurplus < 0
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                  : 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
            }`}>
              {timeframeSummary.retentionRate}% rate
            </span>
          </div>
          <div className={`text-2xl font-bold font-mono mt-1.5 ${
            timeframeSummary.netSurplus > 0 
              ? 'text-cyan-400' 
              : timeframeSummary.netSurplus < 0 
                ? 'text-rose-400' 
                : isLight ? 'text-slate-700' : 'text-zinc-300'
          }`}>
            {isPrivateMode ? '••••••' : formatMoney(timeframeSummary.netSurplus)}
          </div>
          <p className={`text-[11px] mt-1 flex items-center justify-between ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
            <span>Retained surplus / deficit</span>
            {timeframeSummary.netSurplus === 0 && <span className="font-mono text-zinc-400">($0 balance)</span>}
          </p>
        </div>
      </div>

      {/* Cash Flow Comparative History Bar Chart */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
              <span>Cash Flow Comparative History</span>
              <span className="text-[10px] font-mono font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Strict Dynamic Audit
              </span>
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Months with recorded transactions show real totals; unrecorded months reflect clean $0 baseline.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Inflow
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Outflow
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-cyan-500" /> Net Savings
            </span>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="month" 
                stroke={isLight ? '#94a3b8' : '#71717a'} 
                fontSize={11} 
                tickLine={false} 
              />
              <YAxis 
                stroke={isLight ? '#94a3b8' : '#71717a'} 
                fontSize={10} 
                tickLine={false} 
                tickFormatter={v => {
                  const val = Number(v) || 0;
                  if (Math.abs(val) >= 1000) return `$${(val / 1000).toFixed(0)}k`;
                  return `$${val}`;
                }} 
              />
              <Tooltip 
                formatter={(v: number, name: string) => [
                  isPrivateMode ? '••••••' : formatMoney(v),
                  name
                ]}
                labelStyle={{ color: isLight ? '#0f172a' : '#f43f5e', fontWeight: 600 }}
                contentStyle={{ 
                  backgroundColor: isLight ? '#ffffff' : '#09090b', 
                  borderColor: isLight ? '#e2e8f0' : '#27272a', 
                  borderRadius: '0.75rem', 
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="income" name="Inflow (Income)" fill="#10b981" radius={[5, 5, 0, 0]} />
              <Bar dataKey="expense" name="Outflow (Expense)" fill="#f43f5e" radius={[5, 5, 0, 0]} />
              <Bar dataKey="savings" name="Net Savings Surplus" fill="#06b6d4" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {!hasAnyTransactions && (
          <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>No transactions logged yet. All historical months display $0 baseline. Log income or expense transactions with any date to populate your comparative reports.</span>
            </div>
            <button
              onClick={() => openQuickAdd('income')}
              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold shrink-0 cursor-pointer text-[11px]"
            >
              Add First Transaction
            </button>
          </div>
        )}
      </div>

      {/* Spending Distribution by Category & Category Spend Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pie Chart Card */}
        <div className={`p-5 rounded-2xl border flex flex-col ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
              Outflow Breakdown by Category
            </h3>
            <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              {hasTimeframeExpenses ? `${categoryChartData.length} categories` : 'Zero expenses ($0)'}
            </span>
          </div>

          <div className="w-full h-64 flex items-center justify-center">
            {hasTimeframeExpenses ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => isPrivateMode ? '••••••' : formatMoney(val)}
                    contentStyle={{ 
                      backgroundColor: isLight ? '#ffffff' : '#09090b', 
                      borderColor: isLight ? '#e2e8f0' : '#27272a', 
                      borderRadius: '0.75rem', 
                      fontSize: '12px' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 space-y-2.5">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                  isLight ? 'bg-slate-100 text-slate-400' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  <PieIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                    No Outflow Expenses ($0.00)
                  </p>
                  <p className={`text-xs mt-0.5 max-w-xs mx-auto ${isLight ? 'text-slate-500' : 'text-zinc-500'}`}>
                    No expense debits recorded in {timeframeLabels[reportTimeframe]}. When you add expense transactions, their category distribution appears here.
                  </p>
                </div>
                <button
                  onClick={() => openQuickAdd('expense')}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log Expense</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category List Audit Card */}
        <div className={`p-5 rounded-2xl border space-y-3 flex flex-col justify-between ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Category Spend Audit
              </h3>
              <span className={`text-[11px] font-mono font-semibold ${isLight ? 'text-slate-700' : 'text-zinc-200'}`}>
                {isPrivateMode ? '••••••' : formatMoney(timeframeSummary.totalExpenses)} Total
              </span>
            </div>

            {hasTimeframeExpenses ? (
              <div className="divide-y divide-zinc-800/40 space-y-1 max-h-56 overflow-y-auto pr-1">
                {categoryChartData.map((cat, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className={`font-medium ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {cat.percentage}%
                      </span>
                      <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                        {isPrivateMode ? '••••••' : formatMoney(cat.value)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-4 rounded-xl border text-center my-4 space-y-1 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400'
              }`}>
                <p className="text-xs font-semibold">0 Categories Recorded</p>
                <p className="text-[11px] text-zinc-500">Every logged expense automatically calculates into its category audit in real time.</p>
              </div>
            )}
          </div>

          {/* Quick Metrics Footer */}
          <div className={`pt-3 border-t grid grid-cols-2 gap-3 text-xs ${
            isLight ? 'border-slate-100' : 'border-zinc-800'
          }`}>
            <div>
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Top Outflow Category</span>
              <span className={`font-semibold font-mono truncate block mt-0.5 ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                {topExpenseCategory ? `${topExpenseCategory.name} (${topExpenseCategory.percentage}%)` : 'None ($0.00)'}
              </span>
            </div>
            <div>
              <span className={`text-[11px] block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>Top Inflow Category</span>
              <span className={`font-semibold font-mono truncate block mt-0.5 ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
                {topIncomeCategory ? `${topIncomeCategory.name}` : 'None ($0.00)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* In-Depth Analytics Monthly Audit Table */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>In-Depth Cash Flow Timeline Ledger</span>
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Audited monthly breakdown showing exact income, expense, net capital retention, and transaction velocity.
            </p>
          </div>
          <span className={`text-xs font-mono px-2.5 py-1 rounded-lg border ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
          }`}>
            {monthlyComparisonData.length} timeline cycles analyzed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] uppercase tracking-wider ${
                isLight ? 'border-slate-200 text-slate-500 bg-slate-50/50' : 'border-zinc-800 text-zinc-400 bg-zinc-950/40'
              }`}>
                <th className="py-2.5 px-3 font-semibold">Month Cycle</th>
                <th className="py-2.5 px-3 font-semibold text-right">Inflow (Income)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Outflow (Expense)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Net Retention</th>
                <th className="py-2.5 px-3 font-semibold text-center">Tx Velocity</th>
                <th className="py-2.5 px-3 font-semibold text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 font-mono">
              {monthlyComparisonData.map((row, idx) => {
                const isZero = row.income === 0 && row.expense === 0;
                const isSurplus = row.savings > 0;
                const isDeficit = row.savings < 0;

                return (
                  <tr key={idx} className={`transition-colors ${
                    isLight ? 'hover:bg-slate-50/80' : 'hover:bg-zinc-800/40'
                  }`}>
                    <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-zinc-200">
                      {row.month}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-500 font-semibold">
                      {isPrivateMode ? '••••••' : formatMoney(row.income)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-400 font-semibold">
                      {isPrivateMode ? '••••••' : formatMoney(row.expense)}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-bold ${
                      isSurplus ? 'text-cyan-400' : isDeficit ? 'text-rose-400' : isLight ? 'text-slate-400' : 'text-zinc-500'
                    }`}>
                      {isPrivateMode ? '••••••' : formatMoney(row.savings)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-zinc-400">
                      {row.txCount} tx
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isZero ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/50 text-zinc-500 border border-zinc-700/40">
                          $0 Baseline
                        </span>
                      ) : isSurplus ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Net Surplus
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                          Deficit Outflow
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* niceTRY Section */}
      <div className={`mt-8 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
        isLight ? 'border-slate-200' : 'border-zinc-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-emerald-500/10 border border-blue-500/25 flex items-center gap-2 shadow-xs">
            <span className="font-black tracking-widest text-base sm:text-lg bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 bg-clip-text text-transparent">
              niceTRY
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              VERIFIED
            </span>
          </div>
          <div>
            <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
              niceTRY Financial Intelligence Engine
            </div>
            <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Personal wealth velocity, cash flow governance & independence ledger
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-[11px] font-mono text-slate-400 dark:text-zinc-500 text-center sm:text-right">
          <span>FIX Wealth Tracker</span>
          <span className="hidden sm:inline">•</span>
          <span>Confidential Audit Record</span>
          <span className="hidden sm:inline">•</span>
          <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>niceTRY</span>
        </div>
      </div>
    </div>
  );
};
