import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  TrendingDown, 
  Award, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  ShieldCheck, 
  Sliders, 
  ChevronRight, 
  Sparkles, 
  Flame, 
  Snowflake, 
  Mountain, 
  Calendar,
  AlertTriangle,
  RotateCcw,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { Liability } from '../../types';

interface DebtSimulationItem {
  id: string;
  name: string;
  category: string;
  institution?: string;
  balance: number;
  interestRate: number;
  monthlyPayment: number;
  payoffMonth: number;
  payoffDate: string;
  totalInterestPaid: number;
  rank: number;
}

interface StrategyResult {
  strategy: 'snowball' | 'avalanche';
  totalMonths: number;
  debtFreeDate: string;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  firstWinDebtName: string;
  firstWinMonth: number;
  items: DebtSimulationItem[];
  timeline: { month: number; label: string; snowballRemaining: number; avalancheRemaining: number; baselineRemaining: number }[];
}

interface DebtStrategyModuleProps {
  className?: string;
  defaultExtraPayment?: number;
  embeddedLocation?: 'overview' | 'wealth';
}

export const DebtStrategyModule: React.FC<DebtStrategyModuleProps> = ({ 
  className = '', 
  defaultExtraPayment = 2000,
  embeddedLocation = 'overview'
}) => {
  const { 
    liabilities, 
    formatMoney, 
    currency, 
    convertCurrency, 
    theme,
    setActiveTab,
    setWealthSubTab 
  } = useFinance();

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Extra monthly payment allocated toward debt acceleration
  const [extraPayment, setExtraPayment] = useState<number>(defaultExtraPayment);
  const [selectedStrategy, setSelectedStrategy] = useState<'avalanche' | 'snowball' | 'comparison'>('avalanche');
  const [showSandbox, setShowSandbox] = useState<boolean>(false);

  // Active debts with normalized interest rates and monthly minimums
  const activeDebts = useMemo(() => {
    // If real liabilities exist and have balance > 0
    const realDebts = (liabilities || [])
      .filter(l => (Number(l.balance) || 0) > 0)
      .map(l => {
        const bal = convertCurrency(Number(l.balance) || 0, l.currency || currency, currency);
        // Default realistic interest rate based on loan type if unassigned
        let rate = Number(l.interestRate) || 0;
        if (rate <= 0) {
          if (l.category === 'Credit Card') rate = 36;
          else if (l.category === 'Personal Loan') rate = 13.5;
          else if (l.category === 'Auto Loan') rate = 9.25;
          else if (l.category === 'Mortgage / Home Loan') rate = 8.5;
          else if (l.category === 'Education Loan') rate = 10.5;
          else rate = 12.0;
        }

        // Monthly payment / EMI
        let emi = convertCurrency(Number(l.monthlyPayment || l.minimumPayment) || 0, l.currency || currency, currency);
        if (emi <= 0) {
          // If no EMI set, estimate standard 3-year amortization or 3.5% of balance
          emi = Math.max(500, Math.round(bal * 0.035));
        }

        return {
          id: l.id,
          name: l.name,
          category: l.category,
          institution: l.institution || 'Financial Institution',
          balance: bal,
          interestRate: rate,
          monthlyPayment: emi,
        };
      });

    if (realDebts.length > 0 && !showSandbox) {
      return realDebts;
    }

    // Interactive Sample Portfolio if no real debts exist or in sandbox mode
    return [
      {
        id: 'sample-cc-1',
        name: 'Platinum Reward Credit Card',
        category: 'Credit Card',
        institution: 'HDFC Bank Cards',
        balance: 38000,
        interestRate: 38.0,
        monthlyPayment: 2200,
      },
      {
        id: 'sample-loan-1',
        name: 'Pre-Owned Car Loan',
        category: 'Auto Loan',
        institution: 'ICICI Bank Auto Finance',
        balance: 145000,
        interestRate: 9.5,
        monthlyPayment: 6200,
      },
      {
        id: 'sample-loan-2',
        name: 'Personal Renovation Loan',
        category: 'Personal Loan',
        institution: 'Axis Bank Loans',
        balance: 85000,
        interestRate: 14.5,
        monthlyPayment: 4100,
      },
    ];
  }, [liabilities, currency, convertCurrency, showSandbox]);

  const totalDebtBalance = useMemo(() => {
    return activeDebts.reduce((sum, d) => sum + d.balance, 0);
  }, [activeDebts]);

  const totalMonthlyMinimums = useMemo(() => {
    return activeDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);
  }, [activeDebts]);

  // Actuarial Payoff Simulation Runner for a given strategy
  const runSimulation = (strategy: 'snowball' | 'avalanche'): StrategyResult => {
    if (activeDebts.length === 0) {
      return {
        strategy,
        totalMonths: 0,
        debtFreeDate: 'Debt Free Today',
        totalInterestPaid: 0,
        totalPrincipalPaid: 0,
        firstWinDebtName: 'None',
        firstWinMonth: 0,
        items: [],
        timeline: [],
      };
    }

    // Sort order:
    // Snowball: Lowest balance first
    // Avalanche: Highest interest rate first
    const sorted = [...activeDebts].sort((a, b) => {
      if (strategy === 'snowball') {
        return a.balance - b.balance;
      } else {
        return b.interestRate - a.interestRate;
      }
    });

    // Deep copy tracking balances
    const debtsState = sorted.map((d, index) => ({
      ...d,
      currentBalance: d.balance,
      originalBalance: d.balance,
      accumulatedInterest: 0,
      payoffMonth: 0,
      rank: index + 1,
    }));

    let month = 0;
    const maxMonths = 360; // 30-year safety ceiling
    const today = new Date();
    const timelineData: { month: number; label: string; remaining: number }[] = [];

    let firstWinDebtName = '';
    let firstWinMonth = 0;

    timelineData.push({
      month: 0,
      label: 'Now',
      remaining: totalDebtBalance,
    });

    while (debtsState.some(d => d.currentBalance > 0.01) && month < maxMonths) {
      month++;

      // 1. Calculate monthly interest on remaining balances
      for (const d of debtsState) {
        if (d.currentBalance > 0.01) {
          const monthlyRate = d.interestRate / 100 / 12;
          const interestCharge = d.currentBalance * monthlyRate;
          d.accumulatedInterest += interestCharge;
          d.currentBalance += interestCharge;
        }
      }

      // 2. Pay minimum payments
      let extraPool = extraPayment;

      for (const d of debtsState) {
        if (d.currentBalance > 0.01) {
          const payment = Math.min(d.currentBalance, d.monthlyPayment);
          d.currentBalance -= payment;

          // If debt was smaller than standard monthly payment, extra rolls into the pool
          if (d.monthlyPayment > payment) {
            extraPool += (d.monthlyPayment - payment);
          }
        } else {
          // Debt is already cleared! Its entire monthly payment rolls over into the acceleration pool
          extraPool += d.monthlyPayment;
        }
      }

      // 3. Throw extra pool at top priority unpaid debt in the sorted sequence
      for (const d of debtsState) {
        if (d.currentBalance > 0.01 && extraPool > 0) {
          const extraApplied = Math.min(d.currentBalance, extraPool);
          d.currentBalance -= extraApplied;
          extraPool -= extraApplied;

          // Check if paid off in this step
          if (d.currentBalance <= 0.01 && d.payoffMonth === 0) {
            d.currentBalance = 0;
            d.payoffMonth = month;
            if (!firstWinDebtName) {
              firstWinDebtName = d.name;
              firstWinMonth = month;
            }
          }
        }
      }

      // Record any debts cleared during standard minimum payments
      for (const d of debtsState) {
        if (d.currentBalance <= 0.01 && d.payoffMonth === 0) {
          d.currentBalance = 0;
          d.payoffMonth = month;
          if (!firstWinDebtName) {
            firstWinDebtName = d.name;
            firstWinMonth = month;
          }
        }
      }

      // Record monthly timeline snapshot
      const totalRemaining = debtsState.reduce((sum, d) => sum + Math.max(0, d.currentBalance), 0);
      if (month <= 12 || month % 3 === 0 || totalRemaining <= 0) {
        const dateObj = new Date(today.getFullYear(), today.getMonth() + month, 1);
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        timelineData.push({
          month,
          label,
          remaining: Math.round(totalRemaining),
        });
      }
    }

    // Compute debt-free date string
    const finalDate = new Date(today.getFullYear(), today.getMonth() + month, 1);
    const debtFreeDate = finalDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const totalInterestPaid = Math.round(debtsState.reduce((sum, d) => sum + d.accumulatedInterest, 0));
    const totalPrincipalPaid = Math.round(debtsState.reduce((sum, d) => sum + d.originalBalance, 0));

    const items: DebtSimulationItem[] = debtsState.map(d => {
      const pDate = new Date(today.getFullYear(), today.getMonth() + (d.payoffMonth || month), 1);
      return {
        id: d.id,
        name: d.name,
        category: d.category,
        institution: d.institution,
        balance: d.originalBalance,
        interestRate: d.interestRate,
        monthlyPayment: d.monthlyPayment,
        payoffMonth: d.payoffMonth || month,
        payoffDate: pDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        totalInterestPaid: Math.round(d.accumulatedInterest),
        rank: d.rank,
      };
    });

    return {
      strategy,
      totalMonths: month,
      debtFreeDate,
      totalInterestPaid,
      totalPrincipalPaid,
      firstWinDebtName: firstWinDebtName || sorted[0]?.name || 'First Debt',
      firstWinMonth: firstWinMonth || 1,
      items,
      timeline: timelineData as any,
    };
  };

  // Run both simulations for live side-by-side comparison
  const snowballResult = useMemo(() => runSimulation('snowball'), [activeDebts, extraPayment]);
  const avalancheResult = useMemo(() => runSimulation('avalanche'), [activeDebts, extraPayment]);

  // Combined chart timeline data
  const combinedChartData = useMemo(() => {
    const snowTimeline = snowballResult.timeline;
    const avaTimeline = avalancheResult.timeline;
    const maxLen = Math.max(snowTimeline.length, avaTimeline.length);

    const merged: { month: number; label: string; snowball: number; avalanche: number }[] = [];
    for (let i = 0; i < maxLen; i++) {
      const sItem = snowTimeline[i] || snowTimeline[snowTimeline.length - 1];
      const aItem = avaTimeline[i] || avaTimeline[avaTimeline.length - 1];
      const label = aItem?.label || sItem?.label || `M${i}`;
      merged.push({
        month: aItem?.month || sItem?.month || i,
        label,
        avalanche: Math.max(0, aItem?.remaining ?? 0),
        snowball: Math.max(0, sItem?.remaining ?? 0),
      });
    }
    return merged;
  }, [snowballResult, avalancheResult]);

  // Algorithmic Recommendation Determination
  const recommendation = useMemo(() => {
    const interestDiff = snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid;
    const monthsDiff = snowballResult.totalMonths - avalancheResult.totalMonths;
    const firstWinLead = avalancheResult.firstWinMonth - snowballResult.firstWinMonth;

    if (activeDebts.length <= 1) {
      return {
        best: 'avalanche' as const,
        title: 'Single Debt Consolidation',
        reason: 'Focusing all extra monthly funds will accelerate your debt-free date by months and cut unnecessary financing charges.',
        highlight: `Extra ${formatMoney(extraPayment)}/mo saves interest and shortens payoff time!`,
      };
    }

    // If Avalanche saves noticeable interest (more than ₹1,500 or 5%)
    if (interestDiff > 1500) {
      return {
        best: 'avalanche' as const,
        title: 'Debt Avalanche (Mathematically Optimal)',
        reason: `Targeting your highest interest rate loan (${activeDebts.reduce((max, d) => d.interestRate > max.interestRate ? d : max, activeDebts[0]).name} at ${Math.max(...activeDebts.map(d => d.interestRate))}% APR) prevents high compounding losses.`,
        highlight: `Saves ${formatMoney(interestDiff)} in pure interest and finishes ${Math.max(0, monthsDiff)} months sooner!`,
      };
    }

    // If Snowball eliminates first debt significantly faster (2+ months earlier) with minimal interest difference
    if (firstWinLead >= 2) {
      return {
        best: 'snowball' as const,
        title: 'Debt Snowball (Behavioral & Psychological Winner)',
        reason: `Eliminates "${snowballResult.firstWinDebtName}" in only ${snowballResult.firstWinMonth} months (${firstWinLead} months faster than Avalanche). Rolling this payment over builds rapid payoff momentum!`,
        highlight: `First debt wiped out in ${snowballResult.firstWinMonth} months for an immediate psychological win!`,
      };
    }

    // Default to Avalanche for math discipline
    return {
      best: 'avalanche' as const,
      title: 'Debt Avalanche Recommended',
      reason: 'Minimizes overall lifetime interest payments and ensures every rupee paid reduces principal as efficiently as possible.',
      highlight: `Saves ${formatMoney(Math.max(0, interestDiff))} in interest costs.`,
    };
  }, [snowballResult, avalancheResult, activeDebts, formatMoney, extraPayment]);

  const currentResult = selectedStrategy === 'snowball' ? snowballResult : avalancheResult;
  const isRealZeroDebt = (liabilities || []).filter(l => (Number(l.balance) || 0) > 0).length === 0;

  return (
    <div className={`p-5 sm:p-7 rounded-3xl border transition-all ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-800 shadow-sm' 
        : 'bg-slate-900 border-slate-800 text-white shadow-xl shadow-black/20'
    } ${className}`}>
      
      {/* 1. Header with Badge & Strategy Switch */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-inherit/25 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Debt Acceleration Strategy Engine
                </h3>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  Snowball vs. Avalanche
                </span>
                {isRealZeroDebt && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Sample Simulation Active
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Actuarial debt payoff simulator comparing psychological quick wins vs mathematical interest minimization.
              </p>
            </div>
          </div>
        </div>

        {/* View / Strategy Segmented Controller */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border text-xs shrink-0 self-start lg:self-center bg-inherit">
          <button
            type="button"
            onClick={() => setSelectedStrategy('avalanche')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStrategy === 'avalanche'
                ? 'bg-blue-600 text-white shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mountain className="w-3.5 h-3.5 text-amber-300" />
            <span>Avalanche</span>
            {recommendation.best === 'avalanche' && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 font-extrabold uppercase ml-0.5">
                Top Pick
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedStrategy('snowball')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStrategy === 'snowball'
                ? 'bg-cyan-600 text-white shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-cyan-200" />
            <span>Snowball</span>
            {recommendation.best === 'snowball' && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-300 text-slate-900 font-extrabold uppercase ml-0.5">
                Top Pick
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedStrategy('comparison')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStrategy === 'comparison'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Compare Both</span>
          </button>
        </div>
      </div>

      {/* 2. Intelligent AI Recommendation Banner */}
      <div className={`mt-4 p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
        recommendation.best === 'avalanche'
          ? (isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/25 text-amber-200')
          : (isLight ? 'bg-cyan-50/70 border-cyan-200 text-cyan-900' : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-200')
      }`}>
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500 shrink-0 mt-0.5">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm">{recommendation.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/20 font-bold">
                {recommendation.highlight}
              </span>
            </div>
            <p className="mt-1 text-[11px] opacity-90 leading-relaxed">
              {recommendation.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {embeddedLocation === 'overview' && (
            <button
              onClick={() => {
                setActiveTab('wealth');
                setWealthSubTab('liabilities');
              }}
              className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center gap-1"
            >
              <span>Manage Debts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Interactive Extra Monthly Contribution Slider */}
      <div className={`mt-5 p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              Extra Monthly Debt Accelerator Payment
            </span>
            <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Surplus cash flow channeled specifically to accelerate debt payoff above minimum EMIs.
            </p>
          </div>
          <div className="text-right">
            <span className="text-base font-black font-mono text-emerald-500">
              +{formatMoney(extraPayment)}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">/ month</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="30000"
            step="500"
            value={extraPayment}
            onChange={(e) => setExtraPayment(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-300 dark:bg-slate-800"
          />

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className={`text-[10px] font-semibold mr-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              Quick Presets:
            </span>
            {[0, 1000, 2500, 5000, 10000, 20000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setExtraPayment(val)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                  extraPayment === val
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLight 
                      ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100' 
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {val === 0 ? 'Minimums Only' : `+${formatMoney(val)}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Strategic Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {/* Total Debt Balance */}
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-rose-500" />
            Total Outstanding Debt
          </span>
          <div className="text-xl font-black font-mono mt-1 text-rose-500">
            {formatMoney(totalDebtBalance)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Across {activeDebts.length} active account{activeDebts.length === 1 ? '' : 's'} (Baseline EMI: {formatMoney(totalMonthlyMinimums)}/mo)
          </p>
        </div>

        {/* Debt-Free Date */}
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            Projected Debt-Free
          </span>
          <div className="text-xl font-black font-mono mt-1 text-blue-500">
            {currentResult.debtFreeDate}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {currentResult.totalMonths} months ({Math.floor(currentResult.totalMonths / 12)} yrs {currentResult.totalMonths % 12} mos) with current acceleration
          </p>
        </div>

        {/* Total Interest Cost */}
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Total Financing Interest
          </span>
          <div className="text-xl font-black font-mono mt-1 text-amber-500">
            {formatMoney(currentResult.totalInterestPaid)}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {selectedStrategy === 'snowball'
              ? `Avalanche would save ${formatMoney(Math.max(0, snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid))}`
              : `Saves ${formatMoney(Math.max(0, snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid))} vs Snowball`}
          </p>
        </div>

        {/* Fastest Psychological Win */}
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            First Debt Knockout
          </span>
          <div className="text-xl font-black font-mono mt-1 text-emerald-500">
            {currentResult.firstWinMonth} Months
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate" title={currentResult.firstWinDebtName}>
            Clears "{currentResult.firstWinDebtName}"
          </p>
        </div>
      </div>

      {/* 5. Strategy Side-by-Side Comparison Matrix */}
      {selectedStrategy === 'comparison' && (
        <div className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Avalanche Card */}
            <div className={`p-5 rounded-2xl border relative overflow-hidden ${
              recommendation.best === 'avalanche' 
                ? 'border-amber-500/40 bg-amber-500/5' 
                : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800')
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-amber-500" />
                  <h4 className="font-black text-sm">Debt Avalanche Strategy</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                  Interest Minimizer
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Prioritizes highest interest rate debts first. Mathematically optimal approach to minimize finance charges.
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-inherit/25">
                  <span className="text-slate-400">Total Interest Paid:</span>
                  <span className="font-bold text-emerald-400">{formatMoney(avalancheResult.totalInterestPaid)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-inherit/25">
                  <span className="text-slate-400">Debt-Free Date:</span>
                  <span className="font-bold text-blue-400">{avalancheResult.debtFreeDate} ({avalancheResult.totalMonths} mos)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-inherit/25">
                  <span className="text-slate-400">First Debt Cleared:</span>
                  <span className="font-bold">{avalancheResult.firstWinDebtName} ({avalancheResult.firstWinMonth} mos)</span>
                </div>
                <div className="flex justify-between py-1 text-emerald-400 font-bold">
                  <span>Interest Savings:</span>
                  <span>+{formatMoney(Math.max(0, snowballResult.totalInterestPaid - avalancheResult.totalInterestPaid))} vs Snowball</span>
                </div>
              </div>
            </div>

            {/* Snowball Card */}
            <div className={`p-5 rounded-2xl border relative overflow-hidden ${
              recommendation.best === 'snowball' 
                ? 'border-cyan-500/40 bg-cyan-500/5' 
                : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800')
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Snowflake className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-black text-sm">Debt Snowball Strategy</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">
                  Momentum Builder
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Prioritizes smallest debt balance first. Rapid psychological wins create motivation to eliminate remaining debt.
              </p>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-inherit/25">
                  <span className="text-slate-400">Total Interest Paid:</span>
                  <span className="font-bold text-amber-400">{formatMoney(snowballResult.totalInterestPaid)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-inherit/25">
                  <span className="text-slate-400">Debt-Free Date:</span>
                  <span className="font-bold text-blue-400">{snowballResult.debtFreeDate} ({snowballResult.totalMonths} mos)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-inherit/25">
                  <span className="text-slate-400">First Debt Cleared:</span>
                  <span className="font-bold text-cyan-400">{snowballResult.firstWinDebtName} ({snowballResult.firstWinMonth} mos)</span>
                </div>
                <div className="flex justify-between py-1 text-cyan-400 font-bold">
                  <span>First Win Velocity:</span>
                  <span>{Math.max(0, avalancheResult.firstWinMonth - snowballResult.firstWinMonth)} mos faster win!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Payoff Trajectory Comparison Graph */}
      <div className="mt-5 pt-4 border-t border-inherit/25">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              Payoff Balance Trajectory Over Time
            </h4>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Avalanche
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              Snowball
            </span>
          </div>
        </div>

        <div className="h-44 sm:h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAvalanche" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSnowball" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 10, fill: isLight ? '#64748b' : '#94a3b8' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: isLight ? '#64748b' : '#94a3b8' }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val >= 100000 ? `${(val/100000).toFixed(1)}L` : val >= 1000 ? `${Math.round(val/1000)}k` : val}
              />
              <Tooltip 
                formatter={(val: any) => [formatMoney(Number(val) || 0), 'Remaining Balance']}
                labelFormatter={(label) => `Month: ${label}`}
                contentStyle={{
                  backgroundColor: isLight ? '#ffffff' : '#0f172a',
                  borderColor: isLight ? '#e2e8f0' : '#1e293b',
                  borderRadius: '16px',
                  fontSize: '11px',
                  color: isLight ? '#0f172a' : '#f8fafc',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="avalanche" 
                name="Avalanche Strategy" 
                stroke="#f59e0b" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorAvalanche)" 
              />
              <Area 
                type="monotone" 
                dataKey="snowball" 
                name="Snowball Strategy" 
                stroke="#06b6d4" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorSnowball)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7. Step-by-Step Priority Payoff Queue */}
      <div className="mt-5 pt-4 border-t border-inherit/25 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Execution Order ({selectedStrategy === 'snowball' ? 'Snowball Queue' : 'Avalanche Queue'})
          </h4>
          <span className="text-[10px] text-slate-400">
            {selectedStrategy === 'snowball' ? 'Ranked by Smallest Balance First' : 'Ranked by Highest APR First'}
          </span>
        </div>

        <div className="space-y-2.5">
          {currentResult.items.map((item, idx) => {
            const isFirst = idx === 0;
            return (
              <div 
                key={item.id} 
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isFirst
                    ? (isLight ? 'bg-amber-50/80 border-amber-300 shadow-xs' : 'bg-amber-500/10 border-amber-500/30')
                    : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800')
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-xl font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                    isFirst
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : (isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300')
                  }`}>
                    #{item.rank}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs truncate">{item.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                        item.interestRate >= 18 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                      }`}>
                        {item.interestRate}% APR
                      </span>
                      {isFirst && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500 text-slate-900 font-extrabold uppercase animate-pulse">
                          Active Target
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.institution} • Current EMI: {formatMoney(item.monthlyPayment)}/mo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 sm:text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Balance</span>
                    <span className="font-mono font-bold text-xs">{formatMoney(item.balance)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Payoff Target</span>
                    <span className="font-mono font-bold text-xs text-blue-400">{item.payoffDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Time to Zero</span>
                    <span className="font-mono font-bold text-xs text-emerald-400">{item.payoffMonth} Mos</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. Bottom Action Footer */}
      <div className="mt-5 pt-3 border-t border-inherit/25 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            Upon debt-free completion, you unlock <strong>+{formatMoney(totalMonthlyMinimums + extraPayment)}/month</strong> in cash flow for SIP wealth building.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRealZeroDebt && (
            <button
              type="button"
              onClick={() => setShowSandbox(!showSandbox)}
              className="text-[11px] font-semibold text-blue-400 hover:underline cursor-pointer"
            >
              {showSandbox ? 'Reset to Actual Debt' : 'Try Demo Simulation Portfolio'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
