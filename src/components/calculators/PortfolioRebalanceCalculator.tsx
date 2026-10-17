import React, { useState, useMemo } from 'react';
import {
  Scale,
  TrendingUp,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Percent,
  Coins,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Printer,
  Download,
  Sliders,
  DollarSign,
  Layers,
  HelpCircle,
  ShieldCheck,
  Check,
  RefreshCw,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';

export interface AssetClassItem {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetPercent: number;
  color: string;
}

export interface RebalancedItem extends AssetClassItem {
  currentPct: number;
  targetValue: number;
  rawDelta: number;
  pctDelta: number;
  actionAmount: number;
  isOverweight: boolean;
  isUnderweight: boolean;
  isBalanced: boolean;
  action: 'BUY' | 'SELL' | 'HOLD';
  suggestedTrade: number;
}

export interface RebalancePreset {
  id: string;
  name: string;
  description: string;
  allocations: Record<string, number>; // name or category to target percent
}

const DEFAULT_PRESETS: RebalancePreset[] = [
  {
    id: 'classic_60_40',
    name: 'Classic 60/40 Balanced',
    description: 'Time-tested balanced strategy: 60% equities for capital growth and 40% fixed income & cash for risk reduction.',
    allocations: {
      'Domestic Equity': 40,
      'International Equity': 20,
      'Fixed Income & Bonds': 30,
      'Cash & Liquid': 10,
    }
  },
  {
    id: 'aggressive_growth',
    name: 'Aggressive Wealth Growth',
    description: 'High-growth portfolio designed for long horizons: 80% equities, 10% alternatives/crypto, and 10% safety cushion.',
    allocations: {
      'Domestic Equity': 50,
      'International Equity': 30,
      'Crypto & Alternatives': 10,
      'Cash & Liquid': 10,
    }
  },
  {
    id: 'all_weather',
    name: 'Ray Dalio All-Weather',
    description: 'Engineered to withstand any economic season: inflation, deflation, rising growth, and falling growth.',
    allocations: {
      'Domestic Equity': 30,
      'Fixed Income & Bonds': 40,
      'Gold & Commodities': 15,
      'Cash & Liquid': 15,
    }
  },
  {
    id: 'conservative_preservation',
    name: 'Conservative Preservation',
    description: 'Focuses on capital preservation and steady income generation with minimal drawdown risk.',
    allocations: {
      'Domestic Equity': 25,
      'Fixed Income & Bonds': 50,
      'Gold & Commodities': 10,
      'Cash & Liquid': 15,
    }
  },
  {
    id: 'boglehead_3fund',
    name: 'Boglehead 3-Fund Core',
    description: 'Simple, low-cost index investing championing total domestic market, international diversification, and total bonds.',
    allocations: {
      'Domestic Equity': 50,
      'International Equity': 30,
      'Fixed Income & Bonds': 20,
    }
  }
];

const INITIAL_ASSET_CLASSES: AssetClassItem[] = [
  { id: '1', name: 'Domestic Equity', category: 'Equity', currentValue: 55000, targetPercent: 40, color: '#10b981' },
  { id: '2', name: 'International Equity', category: 'Equity', currentValue: 22000, targetPercent: 20, color: '#3b82f6' },
  { id: '3', name: 'Fixed Income & Bonds', category: 'Debt', currentValue: 18000, targetPercent: 25, color: '#f59e0b' },
  { id: '4', name: 'Gold & Commodities', category: 'Commodities', currentValue: 6000, targetPercent: 5, color: '#eab308' },
  { id: '5', name: 'Cash & Liquid', category: 'Cash', currentValue: 9000, targetPercent: 10, color: '#06b6d4' }
];

const PALETTE = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', 
  '#06b6d4', '#14b8a6', '#f97316', '#6366f1', '#e11d48'
];

interface PortfolioRebalanceCalculatorProps {
  isLight?: boolean;
}

export const PortfolioRebalanceCalculator: React.FC<PortfolioRebalanceCalculatorProps> = ({ isLight = false }) => {
  const { assets = [], formatMoney, currency } = useFinance();

  const [assetClasses, setAssetClasses] = useState<AssetClassItem[]>(INITIAL_ASSET_CLASSES);
  const [rebalanceMode, setRebalanceMode] = useState<'standard' | 'inflow'>('standard');
  const [cashInflow, setCashInflow] = useState<number>(10000);
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(2.0); // 2% tolerance band
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string>('classic_60_40');
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  // 1. Portfolio Totals & Live Allocation Percentages
  const totalCurrentValue = useMemo(() => {
    return assetClasses.reduce((sum, item) => sum + Math.max(0, Number(item.currentValue) || 0), 0);
  }, [assetClasses]);

  const totalTargetPercent = useMemo(() => {
    return assetClasses.reduce((sum, item) => sum + (Number(item.targetPercent) || 0), 0);
  }, [assetClasses]);

  const isTargetPercentValid = Math.abs(totalTargetPercent - 100) < 0.05;

  // 2. Rebalancing Math Calculations
  const rebalancingResults = useMemo(() => {
    if (totalCurrentValue <= 0) {
      return {
        items: [],
        totalBuy: 0,
        totalSell: 0,
        portfolioDriftScore: 0,
        turnoverRate: 0,
        postRebalanceValue: totalCurrentValue
      };
    }

    const postRebalanceValue = rebalanceMode === 'inflow' 
      ? totalCurrentValue + Math.max(0, cashInflow) 
      : totalCurrentValue;

    const initialItems = assetClasses.map(item => {
      const curVal = Math.max(0, Number(item.currentValue) || 0);
      const curPct = totalCurrentValue > 0 ? (curVal / totalCurrentValue) * 100 : 0;
      const tgtPct = Number(item.targetPercent) || 0;
      const idealTgtVal = (postRebalanceValue * tgtPct) / 100;
      const rawDelta = idealTgtVal - curVal;
      const pctDelta = curPct - tgtPct; // positive = overweight, negative = underweight

      return {
        ...item,
        currentPct: curPct,
        targetValue: idealTgtVal,
        rawDelta,
        pctDelta,
        actionAmount: Math.abs(rawDelta),
        isOverweight: pctDelta > toleranceThreshold,
        isUnderweight: pctDelta < -toleranceThreshold,
        isBalanced: Math.abs(pctDelta) <= toleranceThreshold
      };
    });

    let totalBuy = 0;
    let totalSell = 0;
    let items: RebalancedItem[] = [];

    if (rebalanceMode === 'standard') {
      // Standard Buy & Sell Rebalance
      items = initialItems.map(item => {
        let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
        let suggestedTrade = 0;

        if (item.rawDelta > 0 && Math.abs(item.pctDelta) > toleranceThreshold) {
          action = 'BUY';
          suggestedTrade = item.rawDelta;
          totalBuy += suggestedTrade;
        } else if (item.rawDelta < 0 && Math.abs(item.pctDelta) > toleranceThreshold) {
          action = 'SELL';
          suggestedTrade = Math.abs(item.rawDelta);
          totalSell += suggestedTrade;
        }

        return {
          ...item,
          action,
          suggestedTrade: Math.round(suggestedTrade)
        };
      });
    } else {
      // Inflow / Buy-Only Rebalancing (Tax-Efficient, No Selling)
      // We distribute cashInflow primarily to underweight assets
      const availableCash = Math.max(0, cashInflow);
      const underweightItems = initialItems.filter(i => i.rawDelta > 0);
      const totalDeficit = underweightItems.reduce((acc, i) => acc + i.rawDelta, 0);

      items = initialItems.map(item => {
        let suggestedTrade = 0;
        let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';

        if (item.rawDelta > 0) {
          if (totalDeficit > 0 && availableCash > 0) {
            if (availableCash >= totalDeficit) {
              // Cash fully covers all deficits
              const baseFill = item.rawDelta;
              const surplusCash = availableCash - totalDeficit;
              const surplusShare = surplusCash * (item.targetPercent / 100);
              suggestedTrade = baseFill + surplusShare;
            } else {
              // Proportional water-filling into deficits
              suggestedTrade = availableCash * (item.rawDelta / totalDeficit);
            }
            action = 'BUY';
            totalBuy += suggestedTrade;
          }
        }

        return {
          ...item,
          action,
          suggestedTrade: Math.round(suggestedTrade)
        };
      });
    }

    // Portfolio Imbalance / Drift Score (Sum of absolute drift / 2)
    const driftSum = items.reduce((acc, i) => acc + Math.abs(i.pctDelta), 0);
    const portfolioDriftScore = Number((driftSum / 2).toFixed(1));
    const turnoverRate = postRebalanceValue > 0 
      ? Number(((totalBuy / postRebalanceValue) * 100).toFixed(1))
      : 0;

    return {
      items,
      totalBuy: Math.round(totalBuy),
      totalSell: Math.round(totalSell),
      portfolioDriftScore,
      turnoverRate,
      postRebalanceValue
    };
  }, [assetClasses, totalCurrentValue, rebalanceMode, cashInflow, toleranceThreshold]);

  // 3. Comparison Chart Data (Current vs Target)
  const chartData = useMemo(() => {
    return rebalancingResults.items.map(item => ({
      name: item.name,
      'Current Value': item.currentValue,
      'Target Value': Math.round(item.targetValue),
      'Current %': Number(item.currentPct.toFixed(1)),
      'Target %': item.targetPercent,
      color: item.color
    }));
  }, [rebalancingResults]);

  // 4. Handlers
  const handleApplyPreset = (presetId: string) => {
    setActivePreset(presetId);
    const preset = DEFAULT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setAssetClasses(prev => {
      return prev.map(item => {
        const tgt = preset.allocations[item.name];
        if (tgt !== undefined) {
          return { ...item, targetPercent: tgt };
        }
        return item;
      });
    });
  };

  const handleUpdateCurrentValue = (id: string, value: number) => {
    setAssetClasses(prev => prev.map(item => item.id === id ? { ...item, currentValue: Math.max(0, value) } : item));
  };

  const handleUpdateTargetPercent = (id: string, pct: number) => {
    setAssetClasses(prev => prev.map(item => item.id === id ? { ...item, targetPercent: Math.max(0, pct) } : item));
  };

  const handleAddAssetClass = () => {
    const nextId = String(Date.now());
    const nextColor = PALETTE[assetClasses.length % PALETTE.length];
    setAssetClasses(prev => [
      ...prev,
      {
        id: nextId,
        name: `Asset Class ${prev.length + 1}`,
        category: 'Alternatives',
        currentValue: 10000,
        targetPercent: 10,
        color: nextColor
      }
    ]);
  };

  const handleRemoveAssetClass = (id: string) => {
    if (assetClasses.length <= 2) return;
    setAssetClasses(prev => prev.filter(item => item.id !== id));
  };

  const handleSyncFromLivePortfolio = () => {
    if (!assets || assets.length === 0) return;

    const categoryTotals: Record<string, number> = {
      'Domestic Equity': 0,
      'International Equity': 0,
      'Fixed Income & Bonds': 0,
      'Real Estate & REITs': 0,
      'Gold & Commodities': 0,
      'Cash & Liquid': 0,
      'Crypto & Alternatives': 0
    };

    assets.forEach(a => {
      const val = Number(a.value) || 0;
      const cat = (a.category || '').toLowerCase();
      const name = (a.name || '').toLowerCase();

      if (cat.includes('crypto') || name.includes('btc') || name.includes('eth')) {
        categoryTotals['Crypto & Alternatives'] += val;
      } else if (cat.includes('real estate') || cat.includes('property')) {
        categoryTotals['Real Estate & REITs'] += val;
      } else if (cat.includes('commodit') || cat.includes('gold') || name.includes('gold') || name.includes('silver')) {
        categoryTotals['Gold & Commodities'] += val;
      } else if (cat.includes('cash') || cat.includes('bank') || cat.includes('saving')) {
        categoryTotals['Cash & Liquid'] += val;
      } else if (cat.includes('debt') || cat.includes('bond') || cat.includes('fixed income') || name.includes('fd') || name.includes('ppf') || name.includes('epf')) {
        categoryTotals['Fixed Income & Bonds'] += val;
      } else if (name.includes('nasdaq') || name.includes('s&p') || name.includes('us ') || name.includes('international') || name.includes('global')) {
        categoryTotals['International Equity'] += val;
      } else {
        categoryTotals['Domestic Equity'] += val;
      }
    });

    const populated = Object.entries(categoryTotals)
      .filter(([_, val]) => val > 0)
      .map(([name, val], idx) => {
        // preserve or set reasonable default target
        const existing = assetClasses.find(a => a.name === name);
        return {
          id: `synced-${idx}`,
          name,
          category: name,
          currentValue: val,
          targetPercent: existing ? existing.targetPercent : 20,
          color: PALETTE[idx % PALETTE.length]
        };
      });

    if (populated.length > 0) {
      // normalize target percents to sum to 100
      const totalTgt = populated.reduce((acc, i) => acc + i.targetPercent, 0);
      const normalized = populated.map(i => ({
        ...i,
        targetPercent: totalTgt > 0 ? Math.round((i.targetPercent / totalTgt) * 100) : Math.round(100 / populated.length)
      }));
      setAssetClasses(normalized);
    }
  };

  const handleCopySummary = () => {
    const lines = [
      `📊 FIX Wealth Tracker - Portfolio Rebalance Plan`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `Rebalance Mode: ${rebalanceMode === 'standard' ? 'Standard Buy & Sell' : 'Cash Inflow (Buy-Only)'}`,
      `Total Portfolio Value: ${formatMoney(totalCurrentValue)}`,
      rebalanceMode === 'inflow' ? `Cash Inflow Allocated: ${formatMoney(cashInflow)}` : null,
      `Portfolio Imbalance Drift: ${rebalancingResults.portfolioDriftScore}%`,
      `----------------------------------------`,
      ...rebalancingResults.items.map(item => {
        if (item.action === 'HOLD') {
          return `• ${item.name}: HOLD (${item.currentPct.toFixed(1)}% vs Target ${item.targetPercent}%)`;
        }
        return `• ${item.name}: ${item.action} ${formatMoney(item.suggestedTrade)} (${item.currentPct.toFixed(1)}% → ${item.targetPercent}%)`;
      }),
      `----------------------------------------`,
      `Total Required Buys: ${formatMoney(rebalancingResults.totalBuy)}`,
      rebalanceMode === 'standard' ? `Total Required Sells: ${formatMoney(rebalancingResults.totalSell)}` : null,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Portfolio Rebalancing Plan - FIX Wealth Tracker`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const toggleActionCompleted = (id: string) => {
    setCompletedActions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div id="portfolio-rebalance-calculator" className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isLight
          ? 'bg-gradient-to-r from-blue-50/70 via-white to-emerald-50/50 border-slate-200/90 shadow-xs'
          : 'bg-gradient-to-r from-slate-900/90 via-zinc-900/95 to-slate-900/90 border-zinc-800 shadow-xl'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-2.5 rounded-2xl ${
              isLight ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
            }`}>
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-zinc-100'}`}>
                  Portfolio Rebalancing Calculator
                </h2>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                  Asset Allocation Strategy
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Compare actual portfolio weights against your ideal target allocation and generate tax-optimized buy/sell execution orders.
              </p>
            </div>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2">
            {assets && assets.length > 0 && (
              <button
                type="button"
                id="btn-sync-live-assets"
                onClick={handleSyncFromLivePortfolio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                title="Populate calculator with your real vault assets"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-Sync Vault ({assets.length})</span>
              </button>
            )}
            <button
              type="button"
              id="btn-copy-rebalance-plan"
              onClick={handleCopySummary}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs' 
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
              }`}
            >
              {copiedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Trades</span>
                </>
              )}
            </button>
            <button
              type="button"
              id="btn-print-rebalance"
              onClick={handlePrint}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs' 
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
              }`}
              title="Print rebalancing plan to PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Strategies Selector */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sliders className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
              Benchmark Target Allocation Strategies
            </h3>
          </div>
          <span className={`text-[11px] font-mono ${
            isTargetPercentValid ? 'text-emerald-500 font-bold' : 'text-rose-400 font-bold'
          }`}>
            Target Allocation: {totalTargetPercent.toFixed(0)}% {isTargetPercentValid ? '✓ 100%' : '⚠️ Must sum to 100%'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {DEFAULT_PRESETS.map(preset => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isLight
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs ring-1 ring-indigo-400'
                      : 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200 shadow-xs ring-1 ring-indigo-400'
                    : isLight
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      : 'bg-zinc-950/60 hover:bg-zinc-800/60 border-zinc-800/80 text-zinc-300'
                }`}
              >
                <div className="font-bold text-xs line-clamp-1">{preset.name}</div>
                <div className="text-[10px] text-slate-400 dark:text-zinc-500 line-clamp-2 mt-1 leading-snug">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rebalance Method & Inflow Settings */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Strategy Mode Toggle */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
              Rebalancing Mode
            </label>
            <div className="flex rounded-xl p-1 bg-zinc-950/20 border border-zinc-500/10 gap-1">
              <button
                type="button"
                onClick={() => setRebalanceMode('standard')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  rebalanceMode === 'standard'
                    ? isLight ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'bg-indigo-600 text-white font-bold'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Buy & Sell (Full)</span>
              </button>
              <button
                type="button"
                onClick={() => setRebalanceMode('inflow')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  rebalanceMode === 'inflow'
                    ? isLight ? 'bg-white text-emerald-600 shadow-xs font-bold' : 'bg-emerald-600 text-white font-bold'
                    : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Cash Inflow (Buy-Only)</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
              {rebalanceMode === 'standard' 
                ? 'Sells overweight assets and buys underweight assets to hit exact target percentages.'
                : 'Allocates fresh cash strictly to underweight assets. No taxable sales.'}
            </p>
          </div>

          {/* Cash Inflow Input (Active in Buy-Only mode) */}
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
              Fresh Cash Inflow ({currency})
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="number"
                disabled={rebalanceMode === 'standard'}
                value={cashInflow}
                onChange={e => setCashInflow(Math.max(0, Number(e.target.value) || 0))}
                placeholder="10000"
                className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                  rebalanceMode === 'standard'
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-zinc-800 border-transparent text-slate-400'
                    : isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-zinc-950 border-zinc-800 text-white'
                }`}
              />
            </div>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1 block">
              {rebalanceMode === 'inflow' ? 'Bonus, SIP contribution, or idle cash to inject' : 'Enabled in Buy-Only Inflow mode'}
            </span>
          </div>

          {/* Drift Tolerance Band */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-zinc-300'}`}>
                Rebalance Tolerance Band (±{toleranceThreshold}%)
              </label>
              <span className="text-[11px] font-mono text-indigo-500 font-bold">±{toleranceThreshold}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={toleranceThreshold}
              onChange={e => setToleranceThreshold(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-zinc-500 mt-1">
              <span>Strict (±0.5%)</span>
              <span>Balanced (±2%)</span>
              <span>Loose (±5%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Level Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-400">
            <span>Current Portfolio Value</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-500 mt-1">
            {formatMoney(totalCurrentValue)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            Across {assetClasses.length} asset classes
          </div>
        </div>

        {/* Portfolio Imbalance Drift Score */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-400">
            <span>Portfolio Drift Score</span>
            <AlertTriangle className={`w-4 h-4 ${
              rebalancingResults.portfolioDriftScore <= toleranceThreshold ? 'text-emerald-400' : 'text-amber-400'
            }`} />
          </div>
          <div className={`text-2xl font-bold font-mono mt-1 ${
            rebalancingResults.portfolioDriftScore <= toleranceThreshold 
              ? 'text-emerald-500' 
              : rebalancingResults.portfolioDriftScore > 8 
                ? 'text-rose-500' 
                : 'text-amber-500'
          }`}>
            {rebalancingResults.portfolioDriftScore}%
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            {rebalancingResults.portfolioDriftScore <= toleranceThreshold 
              ? 'Portfolio is well balanced ✓' 
              : 'Significant drift from target'}
          </div>
        </div>

        {/* Required Purchases (Buys) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-400">
            <span>Total Buys Required</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {formatMoney(rebalancingResults.totalBuy)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            {rebalanceMode === 'inflow' ? 'Deployed from new cash inflow' : 'Funded by sales / capital'}
          </div>
        </div>

        {/* Required Sells (Trims) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-zinc-400">
            <span>Total Sells Required</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {rebalanceMode === 'inflow' ? formatMoney(0) : formatMoney(rebalancingResults.totalSell)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
            {rebalanceMode === 'inflow' ? '0 Sells (100% Tax-Efficient)' : `${rebalancingResults.turnoverRate}% portfolio turnover`}
          </div>
        </div>
      </div>

      {/* Main Asset Allocation & Rebalancing Execution Table */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-zinc-200'}`}>
              Asset Allocation Drift & Actionable Orders
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Adjust current balances or target percentages. Real-time actions update automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAssetClass}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Asset Class</span>
          </button>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] uppercase tracking-wider ${
                isLight ? 'border-slate-200 text-slate-500 bg-slate-50/50' : 'border-zinc-800 text-zinc-400 bg-zinc-950/40'
              }`}>
                <th className="py-3 px-3 font-semibold">Asset Class</th>
                <th className="py-3 px-3 font-semibold text-right">Current Value ({currency})</th>
                <th className="py-3 px-3 font-semibold text-center">Current %</th>
                <th className="py-3 px-3 font-semibold text-center">Target %</th>
                <th className="py-3 px-3 font-semibold text-center">Drift</th>
                <th className="py-3 px-3 font-semibold text-right">Ideal Target Value</th>
                <th className="py-3 px-3 font-semibold text-center">Recommended Order</th>
                <th className="no-print py-3 px-3 text-center font-semibold">Done</th>
                <th className="no-print py-3 px-2 text-center font-semibold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40 font-mono">
              {rebalancingResults.items.map(item => {
                const isDone = completedActions[item.id] || false;
                return (
                  <tr 
                    key={item.id} 
                    className={`transition-colors ${
                      isDone 
                        ? 'opacity-40 line-through bg-emerald-500/5' 
                        : isLight ? 'hover:bg-slate-50/80' : 'hover:bg-zinc-800/40'
                    }`}
                  >
                    {/* Name & Dot */}
                    <td className="py-3 px-3 font-sans font-medium text-slate-800 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => {
                            const val = e.target.value;
                            setAssetClasses(prev => prev.map(a => a.id === item.id ? { ...a, name: val } : a));
                          }}
                          className={`px-2 py-1 rounded-lg border text-xs font-sans font-semibold ${
                            isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-white'
                          }`}
                        />
                      </div>
                    </td>

                    {/* Current Value Editable Input */}
                    <td className="py-3 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.currentValue}
                        onChange={e => handleUpdateCurrentValue(item.id, Number(e.target.value))}
                        className={`w-28 text-right px-2 py-1 rounded-lg border text-xs font-mono font-bold ${
                          isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-zinc-950 border-zinc-700 text-emerald-400'
                        }`}
                      />
                    </td>

                    {/* Current % */}
                    <td className="py-3 px-3 text-center font-bold">
                      {item.currentPct.toFixed(1)}%
                    </td>

                    {/* Target % Editable Input */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.targetPercent}
                          onChange={e => handleUpdateTargetPercent(item.id, Number(e.target.value))}
                          className={`w-16 text-center px-2 py-1 rounded-lg border text-xs font-mono font-bold ${
                            isLight ? 'bg-white border-slate-300 text-indigo-700' : 'bg-zinc-950 border-zinc-700 text-indigo-400'
                          }`}
                        />
                        <span className="text-[11px] text-slate-400 font-sans">%</span>
                      </div>
                    </td>

                    {/* Drift Badge */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.isBalanced
                          ? 'bg-slate-500/10 text-slate-500 dark:text-zinc-400 border border-slate-500/20'
                          : item.isOverweight
                            ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                            : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                      }`}>
                        {item.pctDelta > 0 ? `+${item.pctDelta.toFixed(1)}%` : `${item.pctDelta.toFixed(1)}%`}
                        {item.isBalanced ? ' (OK)' : item.isOverweight ? ' (Over)' : ' (Under)'}
                      </span>
                    </td>

                    {/* Ideal Target Value */}
                    <td className="py-3 px-3 text-right font-bold text-slate-700 dark:text-zinc-300">
                      {formatMoney(Math.round(item.targetValue))}
                    </td>

                    {/* Recommended Order */}
                    <td className="py-3 px-3 text-center font-sans">
                      {item.action === 'HOLD' || item.suggestedTrade <= 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                          Hold / Balanced
                        </span>
                      ) : item.action === 'BUY' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>BUY {formatMoney(item.suggestedTrade)}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-xs">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>SELL {formatMoney(item.suggestedTrade)}</span>
                        </span>
                      )}
                    </td>

                    {/* Checkbox for Execution Tracking */}
                    <td className="no-print py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => toggleActionCompleted(item.id)}
                        className="rounded text-emerald-600 focus:ring-0 cursor-pointer w-4 h-4"
                        title="Mark as executed in broker"
                      />
                    </td>

                    {/* Delete Class Button */}
                    <td className="no-print py-3 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveAssetClass(item.id)}
                        disabled={assetClasses.length <= 2}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Remove asset class"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Grid: Current vs Target Bar Chart & Target Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Comparative Bar Chart */}
        <div className={`p-5 rounded-2xl border flex flex-col ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-700' : 'text-zinc-300'
            }`}>
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span>Current vs Target Allocation (%)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Side-by-Side</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis 
                  dataKey="name" 
                  stroke={isLight ? '#94a3b8' : '#71717a'} 
                  fontSize={10} 
                  angle={-25}
                  textAnchor="end"
                  tickLine={false} 
                />
                <YAxis 
                  stroke={isLight ? '#94a3b8' : '#71717a'} 
                  fontSize={10} 
                  tickLine={false}
                  tickFormatter={v => `${v}%`} 
                />
                <Tooltip 
                  formatter={(val: number, name: string) => [`${val}%`, name]}
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#09090b',
                    borderColor: isLight ? '#e2e8f0' : '#27272a',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Current %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Target %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target Asset Allocation Pie Chart */}
        <div className={`p-5 rounded-2xl border flex flex-col ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-zinc-900/80 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-700' : 'text-zinc-300'
            }`}>
              <PieIcon className="w-4 h-4 text-emerald-500" />
              <span>Target Portfolio Distribution</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Ideal Weights</span>
          </div>

          <div className="w-full h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rebalancingResults.items}
                  dataKey="targetPercent"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={3}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {rebalancingResults.items.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => [`${val}%`, 'Target Allocation']}
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#09090b',
                    borderColor: isLight ? '#e2e8f0' : '#27272a',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tax & Execution Strategy Advice Box */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs leading-relaxed ${
        isLight ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950' : 'bg-indigo-950/20 border-indigo-500/30 text-indigo-200'
      }`}>
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sm block mb-1">
            Smart Rebalancing & Tax Efficiency Rules
          </span>
          <p className="text-[11px] opacity-90">
            <strong>1. Tax-Loss Harvesting & Inflow Preference:</strong> Whenever possible, rebalance by directing new savings, dividends, or monthly cash flow toward underweight assets rather than selling overweight assets, avoiding short-term capital gains tax.
          </p>
          <p className="text-[11px] opacity-90 mt-1">
            <strong>2. Tolerance Bands:</strong> Avoid over-trading. Only execute rebalancing trades when an asset class breaches your tolerance threshold (e.g. ±2% to ±5%), preserving compound momentum and avoiding brokerage commissions.
          </p>
        </div>
      </div>
    </div>
  );
};
