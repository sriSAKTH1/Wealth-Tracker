import React, { useState, useMemo } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  ShieldCheck, 
  PieChart, 
  Sparkles, 
  Coins, 
  Landmark, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Calendar, 
  DollarSign, 
  Percent, 
  Sliders,
  Target,
  FileText
} from 'lucide-react';
import { FinScoreProfile, FinScoreLoan, FinScoreResult, CurrencyCode } from '../../types';

export interface PersonalFinanceAdvisorSectionProps {
  profile: FinScoreProfile;
  onUpdateProfile: (updated: Partial<FinScoreProfile>) => void;
  result: FinScoreResult;
  loans: FinScoreLoan[];
  investments: Array<{ id: string; name: string; category: string; value: number }>;
  currSym: string;
  isLight: boolean;
  onNavigateToStep?: (stepId: string) => void;
}

export interface AllocationSlice {
  label: string;
  category: 'direct_stocks' | 'mutual_funds' | 'gold_commodities' | 'bonds_gsecs' | 'liquid_other';
  percentage: number;
  monthlyAmount: number;
  color: string;
  badgeBg: string;
  recommendedInstruments: string[];
}

export const PersonalFinanceAdvisorSection: React.FC<PersonalFinanceAdvisorSectionProps> = ({
  profile,
  onUpdateProfile,
  result,
  loans,
  investments,
  currSym,
  isLight,
  onNavigateToStep
}) => {
  // Local state for age and custom monthly savings override
  const [activeAge, setActiveAge] = useState<number>(profile.age > 0 ? profile.age : 28);
  
  // Monthly income & savings calculation
  const salary = profile.monthlyIncome > 0 ? profile.monthlyIncome : result.metrics.monthlyIncome || 50000;
  const computedMonthlySavings = Math.max(0, result.metrics.monthlySavings || salary * 0.3);
  
  const [savingsOverride, setSavingsOverride] = useState<number>(computedMonthlySavings);

  // Sync back to profile when age is modified
  const handleAgeChange = (newAge: number) => {
    const validAge = Math.max(18, Math.min(100, newAge));
    setActiveAge(validAge);
    onUpdateProfile({ age: validAge });
  };

  // Total Loan details
  const totalLoanEmi = useMemo(() => {
    return loans.reduce((sum, l) => sum + (Number(l.monthlyEmi) || 0), 0);
  }, [loans]);

  const totalOutstandingLoan = useMemo(() => {
    return loans.reduce((sum, l) => sum + (Number(l.outstandingAmount) || 0), 0);
  }, [loans]);

  const debtToIncomePct = salary > 0 ? Math.round((totalLoanEmi / salary) * 100) : 0;
  const hasHighDebtLoad = debtToIncomePct > 35 || totalOutstandingLoan > salary * 24;

  // Actual Current Holdings Breakdown from investments
  const actualHoldings = useMemo(() => {
    let stocks = 0;
    let mf = 0;
    let gold = 0;
    let bonds = 0;
    let liquid = 0;

    investments.forEach(inv => {
      const cat = (inv.category || '').toLowerCase();
      const val = Number(inv.value) || 0;
      if (cat.includes('stock') || cat.includes('equity') || cat.includes('shares')) {
        stocks += val;
      } else if (cat.includes('mutual') || cat.includes('etf') || cat.includes('sip') || cat.includes('index')) {
        mf += val;
      } else if (cat.includes('gold') || cat.includes('silver') || cat.includes('commodity') || cat.includes('sgb')) {
        gold += val;
      } else if (cat.includes('bond') || cat.includes('g-sec') || cat.includes('gsec') || cat.includes('post') || cat.includes('provident') || cat.includes('ppf') || cat.includes('fd') || cat.includes('fixed')) {
        bonds += val;
      } else {
        liquid += val;
      }
    });

    const totalVal = stocks + mf + gold + bonds + liquid;
    return {
      totalVal,
      stocks: totalVal > 0 ? Math.round((stocks / totalVal) * 100) : 0,
      mf: totalVal > 0 ? Math.round((mf / totalVal) * 100) : 0,
      gold: totalVal > 0 ? Math.round((gold / totalVal) * 100) : 0,
      bonds: totalVal > 0 ? Math.round((bonds / totalVal) * 100) : 0,
      liquid: totalVal > 0 ? Math.round((liquid / totalVal) * 100) : 0
    };
  }, [investments]);

  // Asset Allocation Advisory Model based on Age benchmarks
  const advisorModel = useMemo(() => {
    const monthlySaving = savingsOverride > 0 ? savingsOverride : computedMonthlySavings || 15000;

    if (activeAge < 25) {
      // Age 18 - 24 (e.g. 22 years old)
      // 50% direct stock, 30% mutual fund, 20% gold and other
      const slices: AllocationSlice[] = [
        {
          label: 'Direct Stocks (Growth Equities)',
          category: 'direct_stocks',
          percentage: 50,
          monthlyAmount: Math.round(monthlySaving * 0.50),
          color: '#3b82f6',
          badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          recommendedInstruments: ['High-Growth Mid/Large Cap Stocks', 'Tech & Disruption Leaders', 'Direct Equity Portfolio']
        },
        {
          label: 'Mutual Funds & Index ETFs',
          category: 'mutual_funds',
          percentage: 30,
          monthlyAmount: Math.round(monthlySaving * 0.30),
          color: '#10b981',
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          recommendedInstruments: ['Nifty 50 / S&P 500 Index Funds', 'Flexi-Cap Opportunities Fund', 'Systematic Investment Plan (SIP)']
        },
        {
          label: 'Gold, Sovereign Bonds & Liquid Reserves',
          category: 'gold_commodities',
          percentage: 20,
          monthlyAmount: Math.round(monthlySaving * 0.20),
          color: '#f59e0b',
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          recommendedInstruments: ['Sovereign Gold Bonds (SGB)', 'Gold ETFs', 'High-Yield Liquid Emergency Buffer']
        }
      ];

      return {
        stage: 'Early Career Wealth Multiplier',
        tagline: 'High Equity Velocity • 35+ Year Compounding Horizon',
        rationale: 'At age 22, your greatest financial superpower is time. With over 35 years before retirement, short-term volatility is an advantage. An 80% equity core (50% direct stocks + 30% mutual funds) harnesses maximum compounding, with 20% in gold and reserves protecting against emergencies.',
        slices,
        bondsNotice: 'Minimal bond exposure needed at age 22—inflation will outpace long-term debt yields at this stage.'
      };
    } else if (activeAge >= 25 && activeAge < 33) {
      // Age 25 - 32 (Growth Phase)
      // 40% direct stock, 40% mutual fund, 20% gold and other
      const slices: AllocationSlice[] = [
        {
          label: 'Direct Equities',
          category: 'direct_stocks',
          percentage: 40,
          monthlyAmount: Math.round(monthlySaving * 0.40),
          color: '#3b82f6',
          badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          recommendedInstruments: ['Quality Growth Leaders', 'Bluechip Direct Stocks', 'Dividend Compounders']
        },
        {
          label: 'Mutual Funds (SIPs)',
          category: 'mutual_funds',
          percentage: 40,
          monthlyAmount: Math.round(monthlySaving * 0.40),
          color: '#10b981',
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          recommendedInstruments: ['Broad Index ETFs', 'Multi-Asset Allocation Funds', 'International Diversification ETF']
        },
        {
          label: 'Gold, Commodities & Liquid Reserves',
          category: 'gold_commodities',
          percentage: 20,
          monthlyAmount: Math.round(monthlySaving * 0.20),
          color: '#f59e0b',
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          recommendedInstruments: ['Sovereign Gold Bonds (SGB)', 'Digital 24K Gold', 'Short-Term Debt Reserve']
        }
      ];

      return {
        stage: 'Core Wealth Accumulation',
        tagline: '40:40 Dual-Engine Equity with 20% Real Asset Anchor',
        rationale: 'In your late 20s and early 30s, career earnings accelerate. A symmetrical 40% direct stock and 40% mutual fund strategy balances concentrated high-conviction ideas with systematic market compounding, anchored by 20% in gold and reserves.',
        slices,
        bondsNotice: 'Keep fixed income limited to 3-6 months emergency reserve while equities do the heavy lifting.'
      };
    } else if (activeAge >= 33 && activeAge < 43) {
      // Age 35 (e.g. 33-42)
      // 20% direct stock, 40% mutual fund, 10% gold, 20% in bonds, 10% liquid/other
      const slices: AllocationSlice[] = [
        {
          label: 'Direct Stocks',
          category: 'direct_stocks',
          percentage: 20,
          monthlyAmount: Math.round(monthlySaving * 0.20),
          color: '#3b82f6',
          badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          recommendedInstruments: ['Large-Cap Dividend Aristocrats', 'Defensive Bluechips', 'Selected Growth Leaders']
        },
        {
          label: 'Mutual Funds & Index Funds',
          category: 'mutual_funds',
          percentage: 40,
          monthlyAmount: Math.round(monthlySaving * 0.40),
          color: '#10b981',
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          recommendedInstruments: ['Large & Mid Cap Index Funds', 'Aggressive Hybrid Funds', 'Retirement Target Funds']
        },
        {
          label: 'Corporate Bonds & Debt Securities',
          category: 'bonds_gsecs',
          percentage: 20,
          monthlyAmount: Math.round(monthlySaving * 0.20),
          color: '#8b5cf6',
          badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          recommendedInstruments: ['AAA Corporate Debt Papers', 'Target Maturity Bond Funds', 'Government Securities (G-Secs)']
        },
        {
          label: 'Sovereign Gold',
          category: 'gold_commodities',
          percentage: 10,
          monthlyAmount: Math.round(monthlySaving * 0.10),
          color: '#f59e0b',
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          recommendedInstruments: ['SGB (Sovereign Gold Bonds)', 'Gold BeES / ETFs']
        },
        {
          label: 'Liquid & Emergency Capital',
          category: 'liquid_other',
          percentage: 10,
          monthlyAmount: Math.round(monthlySaving * 0.10),
          color: '#06b6d4',
          badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          recommendedInstruments: ['Overnight / Arbitrage Funds', 'Liquid Bank Sweeps']
        }
      ];

      return {
        stage: 'Balanced Wealth & Family Milestone Phase',
        tagline: '60% Equity Total • 20% Bonds • 10% Gold • 10% Liquid',
        rationale: 'At age 35, life milestones (homeownership, children’s milestones, career expansion) demand downside mitigation. Maintaining 60% total equity keeps wealth growing above inflation, while allocating 20% to bonds and 10% to gold prevents sudden family capital drawdowns.',
        slices,
        bondsNotice: 'Locking 20% into high-grade corporate bonds provides predictable semi-annual coupons.'
      };
    } else if (activeAge >= 43 && activeAge < 53) {
      // Age 45 (e.g. 43-52)
      // User specification: Allocate 60% to a bond or debt mutual fund, 20% equity mutual fund, 10% gold, 10% liquid
      const slices: AllocationSlice[] = [
        {
          label: 'Bonds, G-Secs & Debt Mutual Funds',
          category: 'bonds_gsecs',
          percentage: 60,
          monthlyAmount: Math.round(monthlySaving * 0.60),
          color: '#8b5cf6',
          badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          recommendedInstruments: [
            'Target Maturity Debt Mutual Funds & G-Sec Funds',
            'AAA Rated Corporate Bond Funds',
            'State Development Loans (SDLs)',
            'Public Provident Fund (PPF)'
          ]
        },
        {
          label: 'Equity Mutual Funds & Index Funds',
          category: 'mutual_funds',
          percentage: 20,
          monthlyAmount: Math.round(monthlySaving * 0.20),
          color: '#10b981',
          badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          recommendedInstruments: ['Large-Cap Index Funds', 'Conservative Hybrid Funds', 'Dynamic Asset Allocation (BAF)']
        },
        {
          label: 'Sovereign Gold (SGB) & Precious Metals',
          category: 'gold_commodities',
          percentage: 10,
          monthlyAmount: Math.round(monthlySaving * 0.10),
          color: '#f59e0b',
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          recommendedInstruments: ['Sovereign Gold Bonds (2.5% p.a. + capital appreciation)', 'Gold ETFs']
        },
        {
          label: 'Liquid Reserves & High-Safety Cash',
          category: 'liquid_other',
          percentage: 10,
          monthlyAmount: Math.round(monthlySaving * 0.10),
          color: '#06b6d4',
          badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          recommendedInstruments: ['High-Yield Liquid Mutual Funds', 'Emergency Bank Sweep Accounts']
        }
      ];

      return {
        stage: 'Pre-Retirement Capital Defense',
        tagline: '60% Bonds & Debt Mutual Funds • 20% Equity Mutual Funds • 10% Gold • 10% Liquid',
        rationale: 'At age 45, your timeline to retirement enters the critical 10–15 year window. Recovering from an equity market crash takes 5+ years, so allocating 60% to high-grade bonds and debt mutual funds locks in capital safety and predictable yields. 20% in equity mutual funds beats inflation, while 10% in gold hedges against currency debasement.',
        slices,
        bondsNotice: '60% locked into corporate bonds, G-Secs, and debt mutual funds ensures steady coupon yields.'
      };
    } else {
      // Age 53+ (e.g. 55+)
      // User specification: Allocate more than 50% to 80% to 90% (85%) in bonds and post office monthly income schemes
      const slices: AllocationSlice[] = [
        {
          label: 'Bonds, G-Securities & Post Office Schemes (Monthly Income)',
          category: 'bonds_gsecs',
          percentage: 85,
          monthlyAmount: Math.round(monthlySaving * 0.85),
          color: '#8b5cf6',
          badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          recommendedInstruments: [
            'Post Office Monthly Income Scheme (POMIS) — Guaranteed Monthly Incomes',
            'Senior Citizen Savings Scheme (SCSS) — Sovereign 8.2% Guaranteed Returns',
            'Government Securities (G-Secs & Sovereign T-Bills)',
            'RBI Floating Rate Savings Bonds (FRSB)',
            'Post Office 5-Year Time Deposit (POTD)'
          ]
        },
        {
          label: 'Sovereign Gold (Capital Preservation)',
          category: 'gold_commodities',
          percentage: 10,
          monthlyAmount: Math.round(monthlySaving * 0.10),
          color: '#f59e0b',
          badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          recommendedInstruments: ['SGB (Sovereign Gold Bonds)', 'Gold ETFs with immediate liquidity']
        },
        {
          label: 'Instant Cash Reserves & Bank Liquid',
          category: 'liquid_other',
          percentage: 5,
          monthlyAmount: Math.round(monthlySaving * 0.05),
          color: '#06b6d4',
          badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
          recommendedInstruments: ['High-Safety Scheduled Bank Sweep', 'Instant Liquidity Emergency Reserve']
        }
      ];

      return {
        stage: 'Retirement Freedom & Guaranteed Monthly Income',
        tagline: '85% Post Office & Sovereign Bonds (80%–90% Band) • Guaranteed Monthly Payouts',
        rationale: 'At 55 and beyond, you enter the guaranteed cash flow stage. Per your directive, 85% (within the 80% to 90% allocation band) is deployed into Post Office Monthly Income Schemes (POMIS), Senior Citizen Savings Schemes (SCSS), and Sovereign G-Secs. This generates steady monthly payouts credited directly into your account with 100% sovereign safety.',
        slices,
        bondsNotice: '85% allocation in post office monthly schemes and bonds guarantees regular income with zero market risk.'
      };
    }
  }, [activeAge, savingsOverride, computedMonthlySavings]);

  return (
    <div 
      id="personal-finance-advisor-section"
      className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 animate-in fade-in duration-300 ${
        isLight ? 'bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 border-slate-200' : 'bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/30 border-slate-800'
      }`}
    >
      {/* 1. Header with Advisor Persona Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Personal Finance & Asset Allocation Advisor
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  Automated Advisory
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Dynamic life-stage portfolio allocation based on your <strong>Age</strong>, <strong>Monthly Salary</strong>, and <strong>Saving Amount</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Advisor Stage Badge */}
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Recommended Strategy</span>
            <span className="text-xs font-bold text-indigo-500">{advisorModel.stage}</span>
          </div>
          <span className="px-3 py-1.5 rounded-2xl bg-indigo-600 text-white font-mono font-bold text-xs shadow-md shadow-indigo-600/20">
            Age {activeAge} Roadmap
          </span>
        </div>
      </div>

      {/* 2. Interactive Age, Salary & Monthly Savings Collection Control Strip */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-950/80 border-slate-800/90'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* A. Age Input with Quick Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Your Current Age:</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-500 font-bold">Mandatory *</span>
              </label>
              <span className="text-xs font-mono font-black text-blue-600 dark:text-blue-400">{activeAge} yrs</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="advisor-age-input"
                type="number"
                min={18}
                max={95}
                value={activeAge}
                onChange={e => handleAgeChange(parseInt(e.target.value) || 18)}
                className={`w-20 px-3 py-1.5 rounded-xl border text-xs font-bold text-center ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
              {/* Quick Age Presets */}
              <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
                {[22, 28, 35, 45, 55].map(presetAge => (
                  <button
                    key={presetAge}
                    type="button"
                    onClick={() => handleAgeChange(presetAge)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      activeAge === presetAge
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {presetAge === 55 ? '55+' : `${presetAge}y`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* B. Monthly Salary & Income Outlay */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>Monthly Salary / Income:</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black font-mono text-emerald-500">
                {currSym}{salary.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">
                (Outlay: {currSym}{(result.metrics.totalExpenses || 0).toLocaleString()})
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Derived automatically from your FinScore salary &amp; expense outlays.
            </p>
          </div>

          {/* C. Monthly Investable Saving Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>Monthly Saving Capacity:</span>
              </label>
              <span className="text-xs font-mono font-bold text-indigo-500">
                {currSym}{savingsOverride.toLocaleString()} / mo
              </span>
            </div>

            <input
              id="advisor-savings-input"
              type="number"
              step={1000}
              min={0}
              value={savingsOverride}
              onChange={e => setSavingsOverride(Math.max(0, parseInt(e.target.value) || 0))}
              className={`w-full px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
              }`}
              placeholder="e.g. 25000"
            />
            <p className="text-[10px] text-slate-400">
              Investable surplus deployed into recommended buckets each month.
            </p>
          </div>
        </div>

        {/* Loan Drag Alert if applicable */}
        {totalLoanEmi > 0 && (
          <div className={`mt-4 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
            hasHighDebtLoad 
              ? 'border-rose-500/30 text-rose-400' 
              : 'border-slate-200 dark:border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 shrink-0 ${hasHighDebtLoad ? 'text-rose-500' : 'text-amber-400'}`} />
              <span>
                Active Loan Outlay: <strong>{currSym}{totalLoanEmi.toLocaleString()}/mo</strong> across loans (Debt-to-Income: {debtToIncomePct}%).
              </span>
            </div>
            {hasHighDebtLoad && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300">
                Advisor Advice: Direct 20% savings to prepay debt &gt;9% APR
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Advisor Allocation Proportional Bar & Rationale */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Target Asset Allocation for Age {activeAge}</span>
              <span className="text-[10px] text-indigo-400 font-mono">({advisorModel.tagline})</span>
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            Total Target: <strong>100%</strong>
          </span>
        </div>

        {/* Visual Multi-Color Allocation Bar */}
        <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 shadow-inner">
          {advisorModel.slices.map(slice => (
            <div
              key={slice.category}
              style={{ width: `${slice.percentage}%`, backgroundColor: slice.color }}
              title={`${slice.label}: ${slice.percentage}% (${currSym}${slice.monthlyAmount.toLocaleString()}/mo)`}
              className="h-full transition-all duration-300 hover:opacity-90 cursor-pointer"
            />
          ))}
        </div>

        {/* Advisor Rationale Note */}
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
          isLight ? 'bg-indigo-50/70 border-indigo-200 text-slate-800' : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
        }`}>
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5 text-indigo-600 dark:text-indigo-400">
                Advisor Diagnosis:
              </strong>
              <span>{advisorModel.rationale}</span>
              <span className="block mt-1 text-[11px] opacity-80 italic">
                {advisorModel.bondsNotice}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Actionable Instrument Breakdown Cards */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Coins className="w-3.5 h-3.5 text-amber-500" />
          <span>Monthly Deployment Blueprint ({currSym}{savingsOverride.toLocaleString()} Monthly Savings)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {advisorModel.slices.map(slice => (
            <div
              key={slice.category}
              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                isLight ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${slice.badgeBg}`}>
                  {slice.percentage}% Target
                </span>
                <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                  {currSym}{slice.monthlyAmount.toLocaleString()}<span className="text-[10px] text-slate-400 font-normal">/mo</span>
                </span>
              </div>

              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white">{slice.label}</div>
              </div>

              {/* Recommended Specific Instruments */}
              <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                  Recommended Vehicles:
                </span>
                <ul className="text-[10px] space-y-0.5 text-slate-600 dark:text-slate-300">
                  {slice.recommendedInstruments.map((inst, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Actual Holdings vs Recommended Comparison */}
      {actualHoldings.totalVal > 0 && (
        <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <PieChart className="w-3.5 h-3.5 text-indigo-400" />
              <span>Current Portfolio Reality vs Advisor Benchmark</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Total Assets Tracked: {currSym}{actualHoldings.totalVal.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Direct Equities</span>
              <div className="flex items-baseline gap-1 font-mono font-bold mt-0.5">
                <span>{actualHoldings.stocks}%</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  (Goal: {advisorModel.slices.find(s => s.category === 'direct_stocks')?.percentage || 0}%)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Mutual Funds</span>
              <div className="flex items-baseline gap-1 font-mono font-bold mt-0.5">
                <span>{actualHoldings.mf}%</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  (Goal: {advisorModel.slices.find(s => s.category === 'mutual_funds')?.percentage || 0}%)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Gold &amp; Real</span>
              <div className="flex items-baseline gap-1 font-mono font-bold mt-0.5">
                <span>{actualHoldings.gold}%</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  (Goal: {advisorModel.slices.find(s => s.category === 'gold_commodities')?.percentage || 0}%)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block">Bonds &amp; Fixed</span>
              <div className="flex items-baseline gap-1 font-mono font-bold mt-0.5">
                <span>{actualHoldings.bonds}%</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  (Goal: {advisorModel.slices.find(s => s.category === 'bonds_gsecs')?.percentage || 0}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Quick Action Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className="text-[11px] text-slate-400">
          💡 Need to update salary or loan EMIs? Edit your profile or loans directly in FinScore steps.
        </span>

        <div className="flex items-center gap-2">
          {onNavigateToStep && (
            <>
              <button
                type="button"
                onClick={() => onNavigateToStep('profile')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Edit Profile &amp; Age</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateToStep('investments_assets')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <span>Manage Investment Instruments</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
