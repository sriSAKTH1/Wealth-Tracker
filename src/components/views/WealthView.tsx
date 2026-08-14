import React, { useState } from 'react';
import { 
  Coins, 
  ShieldAlert, 
  TrendingUp, 
  PieChart as PieIcon, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  Sliders,
  ExternalLink,
  Edit2,
  Check
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { WealthSubTab, AssetCategory, LiabilityCategory } from '../../types';

export const WealthView: React.FC = () => {
  const { 
    wealthSubTab, 
    setWealthSubTab, 
    assets, 
    liabilities, 
    totalAssets, 
    totalLiabilities, 
    netWorth, 
    formatMoney, 
    assetAllocationBreakdown,
    netWorthHistory,
    deleteAsset,
    deleteLiability,
    openQuickAdd,
    updateAsset,
    updateLiability,
    isPrivateMode
  } = useFinance();

  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('all');
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editAssetVal, setEditAssetVal] = useState<string>('');

  // Target allocations for rebalancing
  const [targetAllocations, setTargetAllocations] = useState<Record<string, number>>({
    'Stocks & ETFs': 45,
    'Real Estate': 30,
    'Retirement (401k/IRA)': 15,
    'Cash & Bank': 5,
    'Crypto': 5,
  });

  const [timeframe, setTimeframe] = useState<'3M' | '6M' | '1Y' | 'ALL'>('1Y');

  // Filter net worth history according to timeframe
  const filteredHistory = React.useMemo(() => {
    if (timeframe === '3M') return netWorthHistory.slice(-3);
    if (timeframe === '6M') return netWorthHistory.slice(-6);
    if (timeframe === '1Y') return netWorthHistory.slice(-12);
    return netWorthHistory;
  }, [netWorthHistory, timeframe]);

  const filteredAssets = assets.filter(a => 
    assetCategoryFilter === 'all' || a.category === assetCategoryFilter
  );

  const startEditAsset = (id: string, currentVal: number) => {
    setEditingAssetId(id);
    setEditAssetVal(currentVal.toString());
  };

  const saveEditAsset = (id: string) => {
    const val = parseFloat(editAssetVal);
    if (!isNaN(val) && val >= 0) {
      updateAsset(id, { value: val });
    }
    setEditingAssetId(null);
  };

  // Liquid vs illiquid
  const liquidAssets = assets.filter(a => a.isLiquid || a.category === 'Cash & Bank').reduce((s, a) => s + a.value, 0);
  const illiquidAssets = totalAssets - liquidAssets;

  // Monthly total minimum debt payment
  const totalMinDebtPayment = liabilities.reduce((s, l) => s + (l.minimumPayment || 0), 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* Wealth Sub-Tabs Bar (4 Items: Assets, Liabilities, Net Worth, Allocation) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
        <button
          id="tab-wealth-assets"
          onClick={() => setWealthSubTab('assets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            wealthSubTab === 'assets'
              ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Assets ({assets.length})</span>
        </button>

        <button
          id="tab-wealth-liabilities"
          onClick={() => setWealthSubTab('liabilities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            wealthSubTab === 'liabilities'
              ? 'bg-zinc-800 text-rose-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Liabilities ({liabilities.length})</span>
        </button>

        <button
          id="tab-wealth-networth"
          onClick={() => setWealthSubTab('networth')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            wealthSubTab === 'networth'
              ? 'bg-zinc-800 text-cyan-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Net Worth Trend</span>
        </button>

        <button
          id="tab-wealth-allocation"
          onClick={() => setWealthSubTab('allocation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            wealthSubTab === 'allocation'
              ? 'bg-zinc-800 text-purple-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PieIcon className="w-4 h-4" />
          <span>Allocation & Rebalance</span>
        </button>
      </div>

      {/* 1. ASSETS TAB */}
      {wealthSubTab === 'assets' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Top Asset KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Gross Asset Valuation</span>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {formatMoney(totalAssets)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">{assets.length} diversified holdings</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Liquid Assets</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {formatMoney(liquidAssets)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {totalAssets > 0 ? ((liquidAssets / totalAssets) * 100).toFixed(1) : 0}% of total portfolio
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Illiquid Capital (Real Estate/Auto)</span>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                {formatMoney(illiquidAssets)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Fixed physical & long-term equity</p>
            </div>
          </div>

          {/* Asset Category Filters & Add Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              {['all', 'Cash & Bank', 'Stocks & ETFs', 'Crypto', 'Real Estate', 'Retirement (401k/IRA)'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setAssetCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
                    assetCategoryFilter === cat
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat === 'all' ? 'All Asset Classes' : cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => openQuickAdd('asset')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Asset</span>
            </button>
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAssets.map(asset => {
              const gain = asset.costBasis ? asset.value - asset.costBasis : 0;
              const gainPercent = asset.costBasis && asset.costBasis > 0 ? (gain / asset.costBasis) * 100 : 0;
              const isEditing = editingAssetId === asset.id;

              return (
                <div 
                  key={asset.id}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-zinc-950 shadow-md shrink-0"
                        style={{ backgroundColor: asset.color || '#10b981' }}
                      >
                        {asset.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-100 leading-snug">
                          {asset.name}
                        </h3>
                        <p className="text-[11px] text-zinc-400">
                          {asset.category} {asset.institution ? `• ${asset.institution}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditAsset(asset.id, asset.value)}
                        className="p-1 text-zinc-400 hover:text-white rounded"
                        title="Edit value"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteAsset(asset.id)}
                        className="p-1 text-zinc-400 hover:text-rose-400 rounded"
                        title="Delete asset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">
                        Current Valuation
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <input
                            type="number"
                            value={editAssetVal}
                            onChange={e => setEditAssetVal(e.target.value)}
                            className="w-28 bg-zinc-950 border border-emerald-500 rounded px-2 py-0.5 text-xs font-mono text-white"
                          />
                          <button
                            onClick={() => saveEditAsset(asset.id)}
                            className="p-1 bg-emerald-500 text-zinc-950 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-lg font-bold font-mono text-zinc-100">
                          {formatMoney(asset.value)}
                        </span>
                      )}
                    </div>

                    {asset.costBasis && (
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 block font-medium">Unrealized P&L</span>
                        <span className={`text-xs font-mono font-semibold flex items-center justify-end gap-0.5 ${
                          gain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {gain >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                          {formatMoney(gain)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. LIABILITIES TAB */}
      {wealthSubTab === 'liabilities' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Top Liability KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Total Debt Load</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {formatMoney(totalLiabilities)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">{liabilities.length} active liabilities</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Monthly Debt Service</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {formatMoney(totalMinDebtPayment)}/mo
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Required minimum monthly payments</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Debt-to-Asset Ratio</span>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Solvency metric (Under 40% recommended)</p>
            </div>
          </div>

          {/* Add Liability Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-100">Active Debts & Amortizations</h2>
            <button
              onClick={() => openQuickAdd('liability')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Debt / Liability</span>
            </button>
          </div>

          {/* Liabilities List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liabilities.map(liab => (
              <div 
                key={liab.id}
                className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {liab.category}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-100 mt-1.5">
                      {liab.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {liab.institution} {liab.dueDate ? `• Auto-debit Day ${liab.dueDate}` : ''}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteLiability(liab.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete liability"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400 font-medium">Principal Balance</span>
                    <span className="text-base font-bold font-mono text-rose-400">
                      {formatMoney(liab.balance)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Interest Rate (APR)</span>
                    <span className="font-mono text-zinc-200 font-semibold">
                      {liab.interestRate ? `${liab.interestRate}%` : '0%'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Min Monthly Payment</span>
                    <span className="font-mono text-zinc-200 font-semibold">
                      {liab.minimumPayment ? formatMoney(liab.minimumPayment) : 'Pay in Full'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. NET WORTH TREND TAB */}
      {wealthSubTab === 'networth' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Controls & Timeframe */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-zinc-400 font-medium">Historical Trajectory</span>
                <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                  {formatMoney(netWorth)}
                </div>
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                {(['3M', '6M', '1Y', 'ALL'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      timeframe === tf ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Net Worth Chart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="nwArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="assetArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={10} 
                    tickLine={false}
                    tickFormatter={val => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1">
                            <p className="text-zinc-400 font-semibold">{d.date}</p>
                            <p className="text-emerald-400 font-bold">
                              Net Worth: {isPrivateMode ? '••••••' : `$${d.netWorth.toLocaleString()}`}
                            </p>
                            <p className="text-blue-400">
                              Assets: {isPrivateMode ? '••••••' : `$${d.totalAssets.toLocaleString()}`}
                            </p>
                            <p className="text-rose-400">
                              Liabilities: {isPrivateMode ? '••••••' : `$${d.totalLiabilities.toLocaleString()}`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalAssets" 
                    stroke="#3b82f6" 
                    strokeWidth={1.5} 
                    fill="url(#assetArea)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netWorth" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fill="url(#nwArea)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Log Table */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-300 mb-3 uppercase tracking-wider">
              Audit Snapshot Log
            </h3>
            <div className="divide-y divide-zinc-800/80 text-xs">
              {netWorthHistory.slice().reverse().map((snap, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <span className="font-mono text-zinc-400">{snap.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 font-mono hidden sm:inline">
                      Assets: {formatMoney(snap.totalAssets)}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatMoney(snap.netWorth)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ALLOCATION & REBALANCING TAB */}
      {wealthSubTab === 'allocation' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pie / Donut Chart */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 self-start">
                Current Asset Distribution
              </h3>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocationBreakdown}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {assetAllocationBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: number) => isPrivateMode ? '••••••' : `$${val.toLocaleString()}`} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs pt-2">
                {assetAllocationBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-950/50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-300 truncate max-w-[90px]">{item.category}</span>
                    </div>
                    <span className="font-mono text-zinc-400 font-semibold">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Rebalance Guidance */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Target Rebalance Engine</h3>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                  Smart Guidance
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Compare your actual capital weighting against ideal financial targets to identify over/under-allocated assets.
              </p>

              <div className="space-y-3 pt-1">
                {Object.entries(targetAllocations).map(([cat, targetPctValue]) => {
                  const targetPct = Number(targetPctValue);
                  const currentItem = assetAllocationBreakdown.find(a => a.category === cat);
                  const currentPct = currentItem ? currentItem.percentage : 0;
                  const delta = currentPct - targetPct;

                  return (
                    <div key={cat} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-200">{cat}</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-zinc-400">Actual: {currentPct}%</span>
                          <span className="text-zinc-500">|</span>
                          <span className="text-emerald-400">Target: {targetPct}%</span>
                        </div>
                      </div>

                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-emerald-400 h-full transition-all"
                          style={{ width: `${Math.min(100, currentPct)}%` }}
                        />
                      </div>

                      <div className="text-[11px] flex items-center justify-between pt-0.5">
                        <span className={`${
                          Math.abs(delta) < 3 ? 'text-emerald-400' : delta > 0 ? 'text-cyan-400' : 'text-amber-400'
                        }`}>
                          {Math.abs(delta) < 3 
                            ? '✓ Balanced' 
                            : delta > 0 
                            ? `Overweight by +${delta.toFixed(1)}%` 
                            : `Underweight by ${delta.toFixed(1)}%`}
                        </span>
                        <span className="text-zinc-500 font-mono text-[10px]">
                          {delta < 0 ? `Suggested inflow: ${formatMoney((Math.abs(delta) / 100) * totalAssets)}` : 'Hold / Harvest'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
