import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Download, 
  Printer, 
  CheckCircle2,
  FileSpreadsheet
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

export const ReportsView: React.FC = () => {
  const { 
    transactions = [], 
    formatMoney, 
    monthlyIncome, 
    monthlyExpenses, 
    netSavings, 
    savingsRate, 
    netWorth,
    totalAssets,
    totalLiabilities,
    exportTransactionsCSV,
    isPrivateMode
  } = useFinance();

  const [reportTimeframe, setReportTimeframe] = useState<'30D' | '90D' | '1Y'>('30D');

  // Multi-month cashflow comparison data
  const monthlyComparisonData = (!transactions || transactions.length === 0) ? [
    { month: 'Current', income: monthlyIncome, expense: monthlyExpenses, savings: netSavings }
  ] : [
    { month: 'Mar', income: 7200, expense: 4100, savings: 3100 },
    { month: 'Apr', income: 7400, expense: 3950, savings: 3450 },
    { month: 'May', income: 7600, expense: 4300, savings: 3300 },
    { month: 'Jun', income: 7900, expense: 4400, savings: 3500 },
    { month: 'Jul', income: 7800, expense: 4250, savings: 3550 },
    { month: 'Aug', income: monthlyIncome, expense: monthlyExpenses, savings: netSavings },
  ];

  // Expense by category breakdown
  const categoryMap: Record<string, number> = {};
  (transactions || []).filter(t => t.type === 'expense').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#64748b'];

  const categoryChartData = Object.entries(categoryMap).map(([category, amount], idx) => ({
    name: category,
    value: amount,
    color: categoryColors[idx % categoryColors.length]
  })).sort((a, b) => b.value - a.value);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span>Financial Reports & In-Depth Analytics</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Audit cash inflows, outflow trends, savings velocity, and net surplus metrics.
          </p>
        </div>

        <div className="no-print flex items-center gap-2">
          <button
            onClick={exportTransactionsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300 font-semibold">Monthly Income</span>
            <span className="text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              Inflow
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {formatMoney(monthlyIncome)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Total earned & passive receipts</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-300 font-semibold">Monthly Expenses</span>
            <span className="text-[10px] font-mono font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
              Outflow
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {formatMoney(monthlyExpenses)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Living, debt service & discretionary</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
          <span className="text-xs text-zinc-400 font-medium">Net Capital Retention</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {savingsRate}% ({formatMoney(netSavings)})
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">Retained for investments & growth</p>
        </div>
      </div>

      {/* Income vs Expenses Multi-Month Bar Chart */}
      <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-100">6-Month Cash Flow Comparative History</h3>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            Income vs Outflow
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} tickFormatter={v => `$${((Number(v) || 0) / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(v: number) => isPrivateMode ? '••••••' : `$${v.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '0.75rem', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" name="Inflow (Income)" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="Outflow (Expense)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="savings" name="Net Savings Surplus" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Distribution by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pie Chart */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 self-start">
            Outflow Breakdown by Category
          </h3>

          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => isPrivateMode ? '••••••' : `$${val.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category List */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Category Spend Audit
          </h3>

          <div className="divide-y divide-zinc-800/80 space-y-1">
            {categoryChartData.map((cat, idx) => {
              const pct = monthlyExpenses > 0 ? ((cat.value / monthlyExpenses) * 100).toFixed(1) : 0;
              return (
                <div key={idx} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-zinc-200">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-zinc-400">{pct}%</span>
                    <span className="font-bold text-zinc-100">{formatMoney(cat.value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
