import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  Percent,
  Clock,
  Coins,
  ShieldCheck,
  PiggyBank,
  Landmark,
  ArrowDownRight,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Info,
  Printer,
  MessageSquarePlus,
  ArrowUpRight,
  Star,
  Sliders,
  ThumbsUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatINR, formatPercent, amountInIndianWords } from '../../utils/currencyFormatter';
import {
  calculateSIP,
  calculateSWP,
  calculateLumpsum,
  calculateEMI,
  calculateCompoundInterest,
  calculateInflation,
  calculateFD,
  calculateRD,
  calculateCAGR,
  CompoundingFrequency
} from '../../utils/financialCalculations';
import { calculateXIRR, CashFlowTransaction } from '../../utils/xirr';
import { IncomeGrowthCalculator } from './IncomeGrowthCalculator';
import { StepUpSIPCalculator } from './StepUpSIPCalculator';
import { ToolsFeedbackSection } from './ToolsFeedbackSection';

export type CalculatorType =
  | 'sip'
  | 'income_growth'
  | 'stepup_sip'
  | 'swp'
  | 'lumpsum'
  | 'emi'
  | 'compound'
  | 'inflation'
  | 'fd'
  | 'rd'
  | 'xirr'
  | 'cagr'
  | 'feedback';

interface CalculatorTabItem {
  id: CalculatorType;
  label: string;
  shortLabel: string;
  badge?: string;
  category: 'career' | 'investments' | 'loans' | 'banking' | 'feedback';
  icon: any;
  color: string;
}

const CALCULATORS: CalculatorTabItem[] = [
  { id: 'sip', label: 'SIP Calculator', shortLabel: 'SIP', category: 'investments', icon: TrendingUp, color: 'text-emerald-400' },
  { id: 'income_growth', label: 'Income Growth Graph', shortLabel: 'Income Growth', badge: '✨ New', category: 'career', icon: TrendingUp, color: 'text-blue-400' },
  { id: 'stepup_sip', label: 'Step-Up SIP Calculator', shortLabel: 'Step-Up SIP', badge: '📈 2x', category: 'investments', icon: ArrowUpRight, color: 'text-emerald-400' },
  { id: 'swp', label: 'SWP Calculator', shortLabel: 'SWP', category: 'investments', icon: ArrowDownRight, color: 'text-blue-400' },
  { id: 'lumpsum', label: 'Lumpsum Calculator', shortLabel: 'Lumpsum', category: 'investments', icon: Coins, color: 'text-cyan-400' },
  { id: 'emi', label: 'Loan / EMI Calculator', shortLabel: 'EMI', category: 'loans', icon: Landmark, color: 'text-amber-400' },
  { id: 'compound', label: 'Compound Interest', shortLabel: 'Compound Interest', category: 'banking', icon: Sparkles, color: 'text-indigo-400' },
  { id: 'inflation', label: 'Inflation Calculator', shortLabel: 'Inflation', category: 'banking', icon: AlertTriangle, color: 'text-rose-400' },
  { id: 'fd', label: 'FD Calculator', shortLabel: 'FD', category: 'banking', icon: ShieldCheck, color: 'text-teal-400' },
  { id: 'rd', label: 'RD Calculator', shortLabel: 'RD', category: 'banking', icon: PiggyBank, color: 'text-purple-400' },
  { id: 'xirr', label: 'XIRR Calculator', shortLabel: 'XIRR', category: 'investments', icon: FileSpreadsheet, color: 'text-amber-400' },
  { id: 'cagr', label: 'CAGR Calculator', shortLabel: 'CAGR', category: 'investments', icon: Percent, color: 'text-blue-400' },
  { id: 'feedback', label: 'Feedback & Suggestions', shortLabel: 'Feedback & Ideas', badge: '💬 Community', category: 'feedback', icon: MessageSquarePlus, color: 'text-amber-400' },
];

export const FinancialCalculatorsView: React.FC = () => {
  const { theme } = useFinance();
  const isLight = theme === 'light';

  const [activeCalc, setActiveCalc] = useState<CalculatorType>('sip');
  const [calcCategory, setCalcCategory] = useState<string>('all');

  const filteredCalculators = useMemo(() => {
    if (calcCategory === 'all') return CALCULATORS;
    return CALCULATORS.filter(c => c.category === calcCategory);
  }, [calcCategory]);

  // -------------------------------------------------------------------------
  // 1. SIP State
  // -------------------------------------------------------------------------
  const [sipMonthly, setSipMonthly] = useState<number>(10000);
  const [sipYears, setSipYears] = useState<number>(10);
  const [sipReturn, setSipReturn] = useState<number>(12);
  const [sipTrigger, setSipTrigger] = useState<number>(0);

  const sipResult = useMemo(() => {
    return calculateSIP({
      monthlyInvestment: Math.max(0, sipMonthly || 0),
      years: Math.max(0.1, sipYears || 1),
      annualReturn: Math.max(0, sipReturn || 0),
    });
  }, [sipMonthly, sipYears, sipReturn, sipTrigger]);

  // -------------------------------------------------------------------------
  // 2. SWP State
  // -------------------------------------------------------------------------
  const [swpInitial, setSwpInitial] = useState<number>(5000000);
  const [swpMonthlyWithdrawal, setSwpMonthlyWithdrawal] = useState<number>(35000);
  const [swpYears, setSwpYears] = useState<number>(15);
  const [swpReturn, setSwpReturn] = useState<number>(8.5);
  const [swpTrigger, setSwpTrigger] = useState<number>(0);

  const swpResult = useMemo(() => {
    return calculateSWP({
      initialInvestment: Math.max(0, swpInitial || 0),
      monthlyWithdrawal: Math.max(0, swpMonthlyWithdrawal || 0),
      years: Math.max(0.1, swpYears || 1),
      annualReturn: Math.max(0, swpReturn || 0),
    });
  }, [swpInitial, swpMonthlyWithdrawal, swpYears, swpReturn, swpTrigger]);

  // -------------------------------------------------------------------------
  // 3. Lumpsum State
  // -------------------------------------------------------------------------
  const [lumpInitial, setLumpInitial] = useState<number>(100000);
  const [lumpYears, setLumpYears] = useState<number>(10);
  const [lumpReturn, setLumpReturn] = useState<number>(12);
  const [lumpTrigger, setLumpTrigger] = useState<number>(0);

  const lumpResult = useMemo(() => {
    return calculateLumpsum({
      initialInvestment: Math.max(0, lumpInitial || 0),
      years: Math.max(0.1, lumpYears || 1),
      annualReturn: Math.max(0, lumpReturn || 0),
    });
  }, [lumpInitial, lumpYears, lumpReturn, lumpTrigger]);

  // -------------------------------------------------------------------------
  // 4. Loan / EMI State
  // -------------------------------------------------------------------------
  const [emiAmount, setEmiAmount] = useState<number>(3000000);
  const [emiRate, setEmiRate] = useState<number>(8.5);
  const [emiYears, setEmiYears] = useState<number>(20);
  const [emiTrigger, setEmiTrigger] = useState<number>(0);

  const emiResult = useMemo(() => {
    return calculateEMI({
      loanAmount: Math.max(0, emiAmount || 0),
      annualInterestRate: Math.max(0, emiRate || 0),
      loanTenureYears: Math.max(0.1, emiYears || 1),
    });
  }, [emiAmount, emiRate, emiYears, emiTrigger]);

  // -------------------------------------------------------------------------
  // 5. Compound Interest State
  // -------------------------------------------------------------------------
  const [ciPrincipal, setCiPrincipal] = useState<number>(100000);
  const [ciMonthlyAddition, setCiMonthlyAddition] = useState<number>(5000);
  const [ciRate, setCiRate] = useState<number>(10);
  const [ciYears, setCiYears] = useState<number>(10);
  const [ciTrigger, setCiTrigger] = useState<number>(0);

  const ciResult = useMemo(() => {
    return calculateCompoundInterest({
      principal: Math.max(0, ciPrincipal || 0),
      monthlyInvestment: Math.max(0, ciMonthlyAddition || 0),
      annualInterestRate: Math.max(0, ciRate || 0),
      years: Math.max(0.1, ciYears || 1),
    });
  }, [ciPrincipal, ciMonthlyAddition, ciRate, ciYears, ciTrigger]);

  // -------------------------------------------------------------------------
  // 6. Inflation State
  // -------------------------------------------------------------------------
  const [infAmount, setInfAmount] = useState<number>(100000);
  const [infRate, setInfRate] = useState<number>(6);
  const [infYears, setInfYears] = useState<number>(15);
  const [infTrigger, setInfTrigger] = useState<number>(0);

  const infResult = useMemo(() => {
    return calculateInflation({
      currentAmount: Math.max(0, infAmount || 0),
      annualInflationRate: Math.max(0, infRate || 0),
      years: Math.max(0.1, infYears || 1),
    });
  }, [infAmount, infRate, infYears, infTrigger]);

  // -------------------------------------------------------------------------
  // 7. FD State
  // -------------------------------------------------------------------------
  const [fdPrincipal, setFdPrincipal] = useState<number>(200000);
  const [fdRate, setFdRate] = useState<number>(7.1);
  const [fdYears, setFdYears] = useState<number>(5);
  const [fdFrequency, setFdFrequency] = useState<CompoundingFrequency>('quarterly');
  const [fdTrigger, setFdTrigger] = useState<number>(0);

  const fdResult = useMemo(() => {
    return calculateFD({
      principal: Math.max(0, fdPrincipal || 0),
      annualInterestRate: Math.max(0, fdRate || 0),
      tenureYears: Math.max(0.1, fdYears || 1),
      compoundingFrequency: fdFrequency,
    });
  }, [fdPrincipal, fdRate, fdYears, fdFrequency, fdTrigger]);

  // -------------------------------------------------------------------------
  // 8. RD State
  // -------------------------------------------------------------------------
  const [rdMonthly, setRdMonthly] = useState<number>(10000);
  const [rdRate, setRdRate] = useState<number>(6.8);
  const [rdYears, setRdYears] = useState<number>(5);
  const [rdFrequency, setRdFrequency] = useState<CompoundingFrequency>('quarterly');
  const [rdTrigger, setRdTrigger] = useState<number>(0);

  const rdResult = useMemo(() => {
    return calculateRD({
      monthlyDeposit: Math.max(0, rdMonthly || 0),
      interestRate: Math.max(0, rdRate || 0),
      tenureYears: Math.max(0.1, rdYears || 1),
      compoundingFrequency: rdFrequency,
    });
  }, [rdMonthly, rdRate, rdYears, rdFrequency, rdTrigger]);

  // -------------------------------------------------------------------------
  // 9. XIRR State
  // -------------------------------------------------------------------------
  const [xirrTransactions, setXirrTransactions] = useState<CashFlowTransaction[]>([
    { id: '1', date: '2023-01-10', amount: -100000 },
    { id: '2', date: '2023-07-15', amount: -50000 },
    { id: '3', date: '2024-01-12', amount: -50000 },
    { id: '4', date: '2024-09-01', amount: 245000 },
  ]);
  const [xirrTrigger, setXirrTrigger] = useState<number>(0);

  const xirrResult = useMemo(() => {
    return calculateXIRR(xirrTransactions);
  }, [xirrTransactions, xirrTrigger]);

  const handleAddXirrRow = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setXirrTransactions(prev => [
      ...prev,
      { id: Date.now().toString(), date: todayStr, amount: 0 },
    ]);
  };

  const handleDeleteXirrRow = (id: string) => {
    setXirrTransactions(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateXirrRow = (id: string, field: 'date' | 'amount', value: string | number) => {
    setXirrTransactions(prev =>
      prev.map(r => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  // -------------------------------------------------------------------------
  // 10. CAGR State
  // -------------------------------------------------------------------------
  const [cagrInitial, setCagrInitial] = useState<number>(100000);
  const [cagrFinal, setCagrFinal] = useState<number>(250000);
  const [cagrYears, setCagrYears] = useState<number>(5);
  const [cagrTrigger, setCagrTrigger] = useState<number>(0);

  const cagrResult = useMemo(() => {
    return calculateCAGR({
      initialInvestment: Math.max(0, cagrInitial || 0),
      finalValue: Math.max(0, cagrFinal || 0),
      years: Math.max(0.1, cagrYears || 1),
    });
  }, [cagrInitial, cagrFinal, cagrYears, cagrTrigger]);

  // -------------------------------------------------------------------------
  // Reset Handlers
  // -------------------------------------------------------------------------
  const handleReset = (type: CalculatorType) => {
    switch (type) {
      case 'sip':
        setSipMonthly(10000);
        setSipYears(10);
        setSipReturn(12);
        setSipTrigger(prev => prev + 1);
        break;
      case 'swp':
        setSwpInitial(5000000);
        setSwpMonthlyWithdrawal(35000);
        setSwpYears(15);
        setSwpReturn(8.5);
        setSwpTrigger(prev => prev + 1);
        break;
      case 'lumpsum':
        setLumpInitial(100000);
        setLumpYears(10);
        setLumpReturn(12);
        setLumpTrigger(prev => prev + 1);
        break;
      case 'emi':
        setEmiAmount(3000000);
        setEmiRate(8.5);
        setEmiYears(20);
        setEmiTrigger(prev => prev + 1);
        break;
      case 'compound':
        setCiPrincipal(100000);
        setCiMonthlyAddition(5000);
        setCiRate(10);
        setCiYears(10);
        setCiTrigger(prev => prev + 1);
        break;
      case 'inflation':
        setInfAmount(100000);
        setInfRate(6);
        setInfYears(15);
        setInfTrigger(prev => prev + 1);
        break;
      case 'fd':
        setFdPrincipal(200000);
        setFdRate(7.1);
        setFdYears(5);
        setFdFrequency('quarterly');
        setFdTrigger(prev => prev + 1);
        break;
      case 'rd':
        setRdMonthly(10000);
        setRdRate(6.8);
        setRdYears(5);
        setRdFrequency('quarterly');
        setRdTrigger(prev => prev + 1);
        break;
      case 'xirr':
        setXirrTransactions([
          { id: '1', date: '2023-01-10', amount: -100000 },
          { id: '2', date: '2023-07-15', amount: -50000 },
          { id: '3', date: '2024-01-12', amount: -50000 },
          { id: '4', date: '2024-09-01', amount: 245000 },
        ]);
        setXirrTrigger(prev => prev + 1);
        break;
      case 'cagr':
        setCagrInitial(100000);
        setCagrFinal(250000);
        setCagrYears(5);
        setCagrTrigger(prev => prev + 1);
        break;
    }
  };

  const handleCalculate = (type: CalculatorType) => {
    switch (type) {
      case 'sip':
        setSipTrigger(prev => prev + 1);
        break;
      case 'swp':
        setSwpTrigger(prev => prev + 1);
        break;
      case 'lumpsum':
        setLumpTrigger(prev => prev + 1);
        break;
      case 'emi':
        setEmiTrigger(prev => prev + 1);
        break;
      case 'compound':
        setCiTrigger(prev => prev + 1);
        break;
      case 'inflation':
        setInfTrigger(prev => prev + 1);
        break;
      case 'fd':
        setFdTrigger(prev => prev + 1);
        break;
      case 'rd':
        setRdTrigger(prev => prev + 1);
        break;
      case 'xirr':
        setXirrTrigger(prev => prev + 1);
        break;
      case 'cagr':
        setCagrTrigger(prev => prev + 1);
        break;
    }
  };

  // -------------------------------------------------------------------------
  // Helper Renderers for Inputs & Badges
  // -------------------------------------------------------------------------
  const renderAmountBadge = (amount: number) => {
    return (
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
        <span className="font-semibold text-emerald-400">{formatINR(amount)}</span>
        <span>{amountInIndianWords(amount)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </span>
            <span>Tools & Financial Calculators</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete suite of 13 deterministic engines, interactive income growth simulator, community wishlist, and print-ready reports.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 no-print">
          <button
            onClick={() => setActiveCalc('income_growth')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
              activeCalc === 'income_growth'
                ? 'bg-blue-600 text-white border-blue-500'
                : isLight
                ? 'bg-blue-50 hover:bg-blue-100/80 text-blue-700 border-blue-200'
                : 'bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 border-blue-800/60'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Income Growth Graph</span>
          </button>

          <button
            onClick={() => setActiveCalc('feedback')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
              activeCalc === 'feedback'
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : isLight
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-800/60'
            }`}
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Feedback & Ideas</span>
          </button>

          <button
            onClick={() => window.print()}
            title="Print or Save Results as PDF"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-sm ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-slate-200/50'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700 shadow-black/40'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips & Quick Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Tools (13)' },
            { id: 'career', label: 'Career & Income' },
            { id: 'investments', label: 'Investments & SIP' },
            { id: 'loans', label: 'Loans & Debt' },
            { id: 'banking', label: 'Banking & Savings' },
            { id: 'feedback', label: 'Community Feedback' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCalcCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                calcCategory === cat.id
                  ? isLight
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-900 shadow-sm'
                  : isLight
                  ? 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                  : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
          Active: <strong className="text-blue-400">{CALCULATORS.find(c => c.id === activeCalc)?.label}</strong>
        </span>
      </div>

      {/* Printable Report Header (Only visible on paper / PDF) */}
      <div className="print-only mb-6 pb-4 border-b border-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Personal Financial Calculator Report
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-0.5">
              {CALCULATORS.find(c => c.id === activeCalc)?.label || 'Financial Calculation'}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Deterministic calculation model • Generated on {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded border border-slate-300 text-xs font-mono font-bold text-slate-800 bg-slate-100">
              Currency: INR (₹)
            </span>
          </div>
        </div>
      </div>

      {/* Calculator Selector Tabs Navigation (Scrollable single line - hidden on print) */}
      <div className={`no-print p-1.5 rounded-2xl border ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-zinc-900/90 border-zinc-800'
      } overflow-x-auto no-scrollbar`}>
        <div className="flex items-center gap-1 min-w-max">
          {filteredCalculators.map(tab => {
            const Icon = tab.icon;
            const isActive = activeCalc === tab.id;
            return (
              <button
                key={tab.id}
                id={`btn-calc-tab-${tab.id}`}
                onClick={() => setActiveCalc(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.shortLabel}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-extrabold tracking-tight ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 1. SIP CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'sip' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top 2-Column Split: Inputs vs Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Inputs */}
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>SIP Parameters</span>
                </h2>
                <span className="text-xs text-slate-500 font-mono">Monthly SIP</span>
              </div>

              {/* Monthly Investment */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Monthly Investment (₹)
                </label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={sipMonthly}
                  onChange={e => setSipMonthly(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold text-base ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-zinc-950 border-zinc-800 text-white'
                  }`}
                />
                {renderAmountBadge(sipMonthly)}
              </div>

              {/* Investment Period */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Investment Period (Years)</span>
                  <span className="font-mono text-blue-400 font-bold">{sipYears} Years ({sipYears * 12} Months)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={sipYears}
                  onChange={e => setSipYears(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Expected Annual Return */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Expected Annual Return (p.a.)</span>
                  <span className="font-mono text-emerald-400 font-bold">{sipReturn}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={sipReturn}
                  onChange={e => setSipReturn(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Buttons Row */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  id="btn-calc-sip"
                  onClick={() => handleCalculate('sip')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Calculate SIP
                </button>
                <button
                  id="btn-reset-sip"
                  onClick={() => handleReset('sip')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Right Column: Results */}
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Maturity Value
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 mt-1">
                  {formatINR(sipResult.maturityValue)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {amountInIndianWords(sipResult.maturityValue)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Total Investment</div>
                  <div className="text-lg font-bold font-mono mt-1 text-slate-200">
                    {formatINR(sipResult.totalInvestment)}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-xs text-emerald-400 font-semibold">Estimated Returns</div>
                  <div className="text-lg font-bold font-mono mt-1 text-emerald-400">
                    +{formatINR(sipResult.estimatedReturns)}
                  </div>
                </div>
              </div>

              {/* Wealth Multiplier Ratio */}
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-center justify-between">
                <span>Wealth Gain Multiplier:</span>
                <strong className="font-mono text-sm">
                  {sipResult && sipResult.totalInvestment > 0 ? ((sipResult.maturityValue || 0) / sipResult.totalInvestment).toFixed(2) : '1.00'}x
                </strong>
              </div>
            </div>
          </div>

          {/* Below: Chart + How it is Calculated + Explanation */}
          <div className="space-y-6">
            {/* Growth Chart */}
            <div className={`p-5 sm:p-6 rounded-3xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                SIP Wealth Accumulation Trajectory (Year-by-Year)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sipResult.trajectory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sipGradVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="sipGradInv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" textAnchor="end" />
                    <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" width={75} />
                    <Tooltip
                      formatter={(val: any) => formatINR(Number(val))}
                      labelFormatter={l => `Year ${l}`}
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="value" name="Total Wealth Value" stroke="#10b981" fillOpacity={1} fill="url(#sipGradVal)" strokeWidth={2} />
                    <Area type="monotone" dataKey="invested" name="Invested Capital" stroke="#3b82f6" fillOpacity={1} fill="url(#sipGradInv)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* How it is calculated & Simple Explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>How It Is Calculated</span>
                </h4>
                <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                  <p>Monthly Rate (i) = Annual Return / 12 / 100</p>
                  <p>Months (n) = Years × 12</p>
                  <p className="text-emerald-400">
                    Maturity Value = P × [((1 + i)^n - 1) / i] × (1 + i)
                  </p>
                  <p>Total Investment = Monthly Investment × Months</p>
                  <p>Estimated Returns = Maturity Value - Total Investment</p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Simple Explanation</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A Systematic Investment Plan (SIP) allows you to invest fixed amounts at regular intervals into mutual funds. Through rupee cost averaging and compounding returns, your money buys more units when prices are low, accelerating compounding over decades.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 1B. INCOME GROWTH & CAREER PROGRESSION SIMULATOR WITH GRAPH */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'income_growth' && (
        <IncomeGrowthCalculator
          isLight={isLight}
          onNavigateToFeedback={() => setActiveCalc('feedback')}
          onNavigateToStepUpSip={() => setActiveCalc('stepup_sip')}
        />
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 1C. STEP-UP SIP CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'stepup_sip' && (
        <StepUpSIPCalculator
          isLight={isLight}
          onNavigateToIncomeGrowth={() => setActiveCalc('income_growth')}
        />
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 2. SWP CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'swp' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Inputs */}
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-blue-400" />
                <span>SWP Inputs</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Corpus / Investment (₹)</label>
                <input
                  type="number"
                  value={swpInitial}
                  onChange={e => setSwpInitial(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(swpInitial)}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Monthly Withdrawal Amount (₹)</label>
                <input
                  type="number"
                  value={swpMonthlyWithdrawal}
                  onChange={e => setSwpMonthlyWithdrawal(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(swpMonthlyWithdrawal)}
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Withdrawal Horizon (Years)</span>
                  <span className="font-mono text-blue-400 font-bold">{swpYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  step="1"
                  value={swpYears}
                  onChange={e => setSwpYears(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Expected Annual Return (p.a.)</span>
                  <span className="font-mono text-emerald-400 font-bold">{swpReturn}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={swpReturn}
                  onChange={e => setSwpReturn(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  id="btn-calc-swp"
                  onClick={() => handleCalculate('swp')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Calculate SWP
                </button>
                <button
                  id="btn-reset-swp"
                  onClick={() => handleReset('swp')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Results */}
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Final Remaining Portfolio Balance</span>
                <div className={`text-3xl sm:text-4xl font-black font-mono mt-1 ${swpResult.finalBalance > 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                  {formatINR(swpResult.finalBalance)}
                </div>
                {swpResult.isExhausted ? (
                  <div className="mt-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Your investment may be exhausted before the selected period (around month {swpResult.exhaustionMonth}).</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 mt-0.5">
                    Corpus safely sustains withdrawal for full {swpYears} years.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Total Money Withdrawn</div>
                  <div className="text-base font-bold font-mono mt-1 text-emerald-400">
                    {formatINR(swpResult.totalWithdrawal)}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Total Portfolio Growth</div>
                  <div className="text-base font-bold font-mono mt-1 text-blue-400">
                    +{formatINR(swpResult.totalGrowth)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart & Explanations */}
          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-3xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'
            }`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                SWP Remaining Balance & Cumulative Withdrawals
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={swpResult.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" />
                    <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" width={75} />
                    <Tooltip formatter={(val: any) => formatINR(Number(val))} labelFormatter={l => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="balance" name="Portfolio Balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="totalWithdrawn" name="Total Withdrawn" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 font-mono text-slate-300">
                <h4 className="font-bold uppercase text-blue-400 mb-2">How It Is Calculated</h4>
                <p>Monthly Rate = Annual Return / 12 / 100</p>
                <p>Every month:</p>
                <p className="text-emerald-400">Balance = Previous Balance × (1 + Monthly Rate) - Monthly Withdrawal</p>
                <p>Balance is never allowed to be negative.</p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 text-slate-300">
                <h4 className="font-bold uppercase text-emerald-400 mb-2">Simple Explanation</h4>
                <p>
                  A Systematic Withdrawal Plan (SWP) acts as a custom monthly pension from your mutual fund corpus. While you withdraw monthly payouts, the remaining capital continues compounding at the expected market rate.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 3. LUMPSUM CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'lumpsum' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Coins className="w-4 h-4 text-cyan-400" />
                <span>Lumpsum Investment Inputs</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Total One-time Investment (₹)</label>
                <input
                  type="number"
                  value={lumpInitial}
                  onChange={e => setLumpInitial(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(lumpInitial)}
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Investment Period (Years)</span>
                  <span className="font-mono text-cyan-400 font-bold">{lumpYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={lumpYears}
                  onChange={e => setLumpYears(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Expected Annual Return (p.a.)</span>
                  <span className="font-mono text-emerald-400 font-bold">{lumpReturn}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={lumpReturn}
                  onChange={e => setLumpReturn(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  id="btn-calc-lumpsum"
                  onClick={() => handleCalculate('lumpsum')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Calculate Lumpsum
                </button>
                <button
                  id="btn-reset-lumpsum"
                  onClick={() => handleReset('lumpsum')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estimated Maturity Value</span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 mt-1">
                  {formatINR(lumpResult.maturityValue)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{amountInIndianWords(lumpResult.maturityValue)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Principal Invested</div>
                  <div className="text-lg font-bold font-mono mt-1 text-slate-200">{formatINR(lumpResult.initialInvestment)}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <div className="text-xs text-cyan-400 font-semibold">Estimated Returns</div>
                  <div className="text-lg font-bold font-mono mt-1 text-cyan-400">+{formatINR(lumpResult.estimatedReturns)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Lumpsum Growth Over Time</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lumpResult.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" />
                    <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" width={75} />
                    <Tooltip formatter={(val: any) => formatINR(Number(val))} labelFormatter={l => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="value" name="Future Value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} strokeWidth={2} />
                    <Area type="monotone" dataKey="invested" name="Principal" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 font-mono text-slate-300">
                <h4 className="font-bold uppercase text-cyan-400 mb-2">How It Is Calculated</h4>
                <p className="text-cyan-400">Future Value = Principal × (1 + Annual Rate)^Years</p>
                <p>Estimated Returns = Future Value - Principal</p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 text-slate-300">
                <h4 className="font-bold uppercase text-emerald-400 mb-2">Simple Explanation</h4>
                <p>
                  A lumpsum investment is a single, upfront deposit into an asset. It harnesses the full power of continuous compounding on the entire capital from day one.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 4. LOAN / EMI CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'emi' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>Loan / EMI Parameters</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Loan Amount (₹)</label>
                <input
                  type="number"
                  value={emiAmount}
                  onChange={e => setEmiAmount(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(emiAmount)}
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Annual Interest Rate (%)</span>
                  <span className="font-mono text-amber-400 font-bold">{emiRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.1"
                  value={emiRate}
                  onChange={e => setEmiRate(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Loan Tenure (Years)</span>
                  <span className="font-mono text-blue-400 font-bold">{emiYears} Years ({emiYears * 12} Months)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  step="1"
                  value={emiYears}
                  onChange={e => setEmiYears(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  id="btn-calc-emi"
                  onClick={() => handleCalculate('emi')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Calculate EMI
                </button>
                <button
                  id="btn-reset-emi"
                  onClick={() => handleReset('emi')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly EMI Due</span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 mt-1">
                  {formatINR(emiResult.monthlyEMI)} / mo
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{amountInIndianWords(emiResult.monthlyEMI)} per month</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Total Interest Payable</div>
                  <div className="text-base font-bold font-mono mt-1 text-rose-400">
                    {formatINR(emiResult.totalInterest)}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Total Amount Payable</div>
                  <div className="text-base font-bold font-mono mt-1 text-slate-200">
                    {formatINR(emiResult.totalPayment)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Principal vs Interest Breakup</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emiResult.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" />
                    <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" width={75} />
                    <Tooltip formatter={(val: any) => formatINR(Number(val))} labelFormatter={l => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="principalPaid" name="Principal Repaid" fill="#3b82f6" stackId="a" />
                    <Bar dataKey="interestPaid" name="Interest Paid" fill="#f43f5e" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 font-mono text-slate-300">
                <h4 className="font-bold uppercase text-amber-400 mb-2">How It Is Calculated</h4>
                <p>Monthly Rate (r) = Annual Rate / 12 / 100</p>
                <p>Months (n) = Years × 12</p>
                <p className="text-amber-400">EMI = P × r × (1+r)^n / ((1+r)^n - 1)</p>
                <p>If interest rate = 0: EMI = Loan Amount / Months</p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 text-slate-300">
                <h4 className="font-bold uppercase text-blue-400 mb-2">Simple Explanation</h4>
                <p>
                  Equated Monthly Installment (EMI) is the fixed monthly sum payable to a lender. In early years, interest dominates the payment; over time, principal repayment accelerates as the remaining balance drops.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 5. COMPOUND INTEREST CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'compound' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Compound Growth Parameters</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Principal (₹)</label>
                <input
                  type="number"
                  value={ciPrincipal}
                  onChange={e => setCiPrincipal(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(ciPrincipal)}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Optional Monthly Investment (₹)</label>
                <input
                  type="number"
                  value={ciMonthlyAddition}
                  onChange={e => setCiMonthlyAddition(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(ciMonthlyAddition)}
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Annual Interest Rate (%)</span>
                  <span className="font-mono text-indigo-400 font-bold">{ciRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={ciRate}
                  onChange={e => setCiRate(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Investment Horizon (Years)</span>
                  <span className="font-mono text-blue-400 font-bold">{ciYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={ciYears}
                  onChange={e => setCiYears(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  id="btn-calc-compound"
                  onClick={() => handleCalculate('compound')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Calculate Growth
                </button>
                <button
                  id="btn-reset-compound"
                  onClick={() => handleReset('compound')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Final Amount</span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-indigo-400 mt-1">
                  {formatINR(ciResult.finalAmount)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{amountInIndianWords(ciResult.finalAmount)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Total Out-of-Pocket</div>
                  <div className="text-base font-bold font-mono mt-1 text-slate-200">{formatINR(ciResult.totalContributions)}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="text-xs text-indigo-400 font-semibold">Interest Generated</div>
                  <div className="text-base font-bold font-mono mt-1 text-indigo-400">+{formatINR(ciResult.estimatedReturns)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Compound Accumulation Trajectory</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ciResult.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" />
                    <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" width={75} />
                    <Tooltip formatter={(val: any) => formatINR(Number(val))} labelFormatter={l => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="finalAmount" name="Total Wealth" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                    <Area type="monotone" dataKey="contributions" name="Contributions" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 font-mono text-slate-300">
                <h4 className="font-bold uppercase text-indigo-400 mb-2">How It Is Calculated</h4>
                <p>For lump sum: Future Value = Principal × (1 + Rate)^Years</p>
                <p>If monthly investment exists, its future value is calculated and added.</p>
                <p className="text-indigo-400">Final Amount = FV(Lump sum) + FV(Monthly SIP)</p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 text-slate-300">
                <h4 className="font-bold uppercase text-emerald-400 mb-2">Simple Explanation</h4>
                <p>
                  Compound interest earns interest on top of past interest. Albert Einstein famously called compound interest the eighth wonder of the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 6. INFLATION CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'inflation' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Inflation Inputs</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Current Amount / Expense (₹)</label>
                <input
                  type="number"
                  value={infAmount}
                  onChange={e => setInfAmount(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(infAmount)}
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Annual Inflation Rate (%)</span>
                  <span className="font-mono text-rose-400 font-bold">{infRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.25"
                  value={infRate}
                  onChange={e => setInfRate(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Time Horizon (Years)</span>
                  <span className="font-mono text-blue-400 font-bold">{infYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="40"
                  step="1"
                  value={infYears}
                  onChange={e => setInfYears(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  id="btn-calc-inflation"
                  onClick={() => handleCalculate('inflation')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Calculate Inflation
                </button>
                <button
                  id="btn-reset-inflation"
                  onClick={() => handleReset('inflation')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Future Required Amount (Estimate)</span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-rose-400 mt-1">
                  {formatINR(infResult.futureRequiredAmount)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Cost of living multiplies by {(((infResult?.futureRequiredAmount || 0) / (infResult?.currentAmount || 1)) || 1).toFixed(2)}x in {infYears} years.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Future Purchasing Power</div>
                  <div className="text-base font-bold font-mono mt-1 text-amber-400">
                    {formatINR(infResult.purchasingPower)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">(-{infResult.purchasingPowerLossPercent}% loss)</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                  <div className="text-xs text-rose-400 font-semibold">Inflation Cost Impact</div>
                  <div className="text-base font-bold font-mono mt-1 text-rose-400">
                    +{formatINR(infResult.inflationImpact)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Future Cost Escalation vs Purchasing Power</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={infResult.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" />
                    <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" width={75} />
                    <Tooltip formatter={(val: any) => formatINR(Number(val))} labelFormatter={l => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="futureCost" name="Future Required Cost" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} strokeWidth={2} />
                    <Area type="monotone" dataKey="purchasingPower" name="Real Purchasing Power" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 font-mono text-slate-300">
                <h4 className="font-bold uppercase text-rose-400 mb-2">How It Is Calculated</h4>
                <p className="text-rose-400">Future Cost = Current Amount × (1 + Inflation Rate)^Years</p>
                <p>Purchasing Power = Current Amount / (1 + Inflation Rate)^Years</p>
                <p>Inflation Impact = Future Cost - Current Amount</p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 text-slate-300">
                <h4 className="font-bold uppercase text-emerald-400 mb-2">Simple Explanation</h4>
                <p>
                  Inflation is the silent erosion of purchasing power. What costs ₹1,00,000 today will require significantly more money in the future. To build true wealth, your investments must beat inflation net of taxes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 7. FD (FIXED DEPOSIT) CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'fd' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Fixed Deposit Inputs</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Principal Deposit (₹)</label>
                <input
                  type="number"
                  value={fdPrincipal}
                  onChange={e => setFdPrincipal(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(fdPrincipal)}
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Annual Interest Rate (%)</span>
                  <span className="font-mono text-teal-400 font-bold">{fdRate}%</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.1"
                  value={fdRate}
                  onChange={e => setFdRate(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Tenure (Years)</span>
                  <span className="font-mono text-blue-400 font-bold">{fdYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={fdYears}
                  onChange={e => setFdYears(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Compounding Frequency</label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
                  {(['monthly', 'quarterly', 'half-yearly', 'yearly'] as CompoundingFrequency[]).map(freq => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFdFrequency(freq)}
                      className={`py-2 px-1 rounded-xl border capitalize transition-all cursor-pointer ${
                        fdFrequency === freq
                          ? 'bg-teal-600 text-white font-bold border-teal-500 shadow'
                          : 'bg-zinc-950/60 border-zinc-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {freq === 'half-yearly' ? 'Half-Year' : freq}
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Indian commercial banks typically compound FD quarterly.</div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  id="btn-calc-fd"
                  onClick={() => handleCalculate('fd')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Calculate FD
                </button>
                <button
                  id="btn-reset-fd"
                  onClick={() => handleReset('fd')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total FD Maturity Amount</span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-teal-400 mt-1">
                  {formatINR(fdResult.maturityAmount)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{amountInIndianWords(fdResult.maturityAmount)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Principal Deposited</div>
                  <div className="text-base font-bold font-mono mt-1 text-slate-200">{formatINR(fdResult.principal)}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20">
                  <div className="text-xs text-teal-400 font-semibold">Estimated Interest</div>
                  <div className="text-base font-bold font-mono mt-1 text-teal-400">+{formatINR(fdResult.estimatedInterest)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">FD Maturity Accumulation Curve</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fdResult.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" />
                    <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" width={75} />
                    <Tooltip formatter={(val: any) => formatINR(Number(val))} labelFormatter={l => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="maturityAmount" name="Maturity Amount" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.25} strokeWidth={2} />
                    <Area type="monotone" dataKey="principal" name="Principal" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 font-mono text-slate-300">
                <h4 className="font-bold uppercase text-teal-400 mb-2">How It Is Calculated</h4>
                <p className="text-teal-400">A = P × (1 + r/n)^(n×t)</p>
                <p>P = Principal, r = Annual rate, n = Compounding frequency per year, t = Years</p>
                <p>Estimated Interest = Maturity Amount - Principal</p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 text-slate-300">
                <h4 className="font-bold uppercase text-emerald-400 mb-2">Simple Explanation</h4>
                <p>
                  A Fixed Deposit provides guaranteed capital safety with fixed returns. Interest earned is periodically credited to the principal and compounds based on the chosen frequency.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 8. RD (RECURRING DEPOSIT) CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'rd' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-purple-400" />
                <span>Recurring Deposit Inputs</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Monthly Deposit Amount (₹)</label>
                <input
                  type="number"
                  value={rdMonthly}
                  onChange={e => setRdMonthly(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(rdMonthly)}
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Interest Rate (%)</span>
                  <span className="font-mono text-purple-400 font-bold">{rdRate}%</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.1"
                  value={rdRate}
                  onChange={e => setRdRate(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Tenure (Years)</span>
                  <span className="font-mono text-blue-400 font-bold">{rdYears} Years ({rdYears * 12} Months)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={rdYears}
                  onChange={e => setRdYears(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Compounding Frequency</label>
                <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
                  {(['monthly', 'quarterly', 'half-yearly', 'yearly'] as CompoundingFrequency[]).map(freq => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setRdFrequency(freq)}
                      className={`py-2 px-1 rounded-xl border capitalize transition-all cursor-pointer ${
                        rdFrequency === freq
                          ? 'bg-purple-600 text-white font-bold border-purple-500 shadow'
                          : 'bg-zinc-950/60 border-zinc-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {freq === 'half-yearly' ? 'Half-Year' : freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  id="btn-calc-rd"
                  onClick={() => handleCalculate('rd')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Calculate RD
                </button>
                <button
                  id="btn-reset-rd"
                  onClick={() => handleReset('rd')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total RD Maturity Amount</span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-purple-400 mt-1">
                  {formatINR(rdResult.maturityAmount)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{amountInIndianWords(rdResult.maturityAmount)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Total Deposits</div>
                  <div className="text-base font-bold font-mono mt-1 text-slate-200">{formatINR(rdResult.totalDeposits)}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-xs text-purple-400 font-semibold">Estimated Interest</div>
                  <div className="text-base font-bold font-mono mt-1 text-purple-400">+{formatINR(rdResult.estimatedInterest)}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Actual bank RD maturity values can differ depending on the bank&apos;s compounding and interest calculation method.</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Contribution vs Interest Growth</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rdResult.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" />
                    <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" width={75} />
                    <Tooltip formatter={(val: any) => formatINR(Number(val))} labelFormatter={l => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="value" name="Maturity Value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} strokeWidth={2} />
                    <Area type="monotone" dataKey="deposits" name="Total Deposits" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 font-mono text-slate-300">
                <h4 className="font-bold uppercase text-purple-400 mb-2">How It Is Calculated</h4>
                <p>Each monthly installment earns interest for its remaining fractional tenure.</p>
                <p className="text-purple-400">M = Σ P × (1 + r/n)^(n × (N - m + 1)/12)</p>
                <p>Estimated Interest = Maturity Amount - Total Deposits</p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 text-slate-300">
                <h4 className="font-bold uppercase text-emerald-400 mb-2">Simple Explanation</h4>
                <p>
                  A Recurring Deposit (RD) helps build savings discipline by depositing a fixed amount every month with guaranteed bank returns and quarterly compounding.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 9. XIRR CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'xirr' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Dynamic Cash Flow Table */}
            <div className={`lg:col-span-7 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    <span>Cash Flows Ledger</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Negative amount (-₹) = Investment/Outflow • Positive amount (+₹) = Redemption/Return
                  </p>
                </div>
                <button
                  id="btn-add-xirr-row"
                  onClick={handleAddXirrRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
              </div>

              {/* Transactions Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-12 gap-2 p-2.5 bg-black/40 font-semibold text-slate-400 border-b border-slate-800">
                  <div className="col-span-5">Date</div>
                  <div className="col-span-5">Cash Flow Amount (₹)</div>
                  <div className="col-span-2 text-center">Action</div>
                </div>

                <div className="divide-y divide-slate-800 max-h-72 overflow-y-auto">
                  {xirrTransactions.map((tx, idx) => (
                    <div key={tx.id} className="grid grid-cols-12 gap-2 p-2.5 items-center">
                      <div className="col-span-5">
                        <input
                          type="date"
                          value={tx.date}
                          onChange={e => handleUpdateXirrRow(tx.id, 'date', e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono text-xs ${
                            isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                          }`}
                        />
                      </div>
                      <div className="col-span-5">
                        <input
                          type="number"
                          placeholder="-10000 or 15000"
                          value={tx.amount}
                          onChange={e => handleUpdateXirrRow(tx.id, 'amount', parseFloat(e.target.value) || 0)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border font-mono font-bold text-xs ${
                            tx.amount < 0 ? 'text-rose-400' : tx.amount > 0 ? 'text-emerald-400' : 'text-slate-400'
                          } ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'}`}
                        />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <button
                          onClick={() => handleDeleteXirrRow(tx.id)}
                          disabled={xirrTransactions.length <= 2}
                          className="p-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-30 cursor-pointer"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  id="btn-calc-xirr"
                  onClick={() => handleCalculate('xirr')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Calculate XIRR
                </button>
                <button
                  id="btn-reset-xirr"
                  onClick={() => handleReset('xirr')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Reset Ledger
                </button>
              </div>
            </div>

            {/* Results */}
            <div className={`lg:col-span-5 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Annualized XIRR Return</span>
                {xirrResult.isValid && xirrResult.xirr !== null ? (
                  <div className="text-4xl font-black font-mono text-amber-400 mt-1">
                    {formatPercent(xirrResult.xirr, 2)}
                  </div>
                ) : (
                  <div className="text-xl font-bold font-mono text-rose-400 mt-2">
                    {xirrResult.errorMessage || 'Invalid Cash Flows'}
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-1">
                  Accurately factors time-weighted irregularly timed investments and returns.
                </div>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                  <span className="text-slate-400">Total Invested (Outflow):</span>
                  <span className="font-mono font-bold text-rose-400">{formatINR(xirrResult.totalInvested)}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                  <span className="text-slate-400">Total Received (Inflow):</span>
                  <span className="font-mono font-bold text-emerald-400">{formatINR(xirrResult.totalReceived)}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-black/20 border border-white/5">
                  <span className="text-slate-400">Net Gain / Loss:</span>
                  <span className={`font-mono font-bold ${xirrResult.netGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {xirrResult.netGain >= 0 ? '+' : ''}{formatINR(xirrResult.netGain)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 font-mono text-slate-300">
              <h4 className="font-bold uppercase text-amber-400 mb-2">How It Is Calculated</h4>
              <p>Solves for rate &apos;r&apos; in the Net Present Value equation:</p>
              <p className="text-amber-400">Σ [ C_i / (1 + r)^((d_i - d_0)/365) ] = 0</p>
              <p>Uses Newton-Raphson numerical root-finding algorithm.</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 text-slate-300">
              <h4 className="font-bold uppercase text-emerald-400 mb-2">Simple Explanation</h4>
              <p>
                XIRR (Extended Internal Rate of Return) is the gold standard for calculating annualized return on mutual funds or stock portfolios where investments and withdrawals happen at irregular intervals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 10. CAGR CALCULATOR */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'cagr' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-400" />
                <span>CAGR Inputs</span>
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Initial Investment Value (₹)</label>
                <input
                  type="number"
                  value={cagrInitial}
                  onChange={e => setCagrInitial(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(cagrInitial)}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Final Investment Value (₹)</label>
                <input
                  type="number"
                  value={cagrFinal}
                  onChange={e => setCagrFinal(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300' : 'bg-zinc-950 border-zinc-800'
                  }`}
                />
                {renderAmountBadge(cagrFinal)}
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                  <span>Investment Period (Years)</span>
                  <span className="font-mono text-blue-400 font-bold">{cagrYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  step="0.5"
                  value={cagrYears}
                  onChange={e => setCagrYears(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                <button
                  id="btn-calc-cagr"
                  onClick={() => handleCalculate('cagr')}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Calculate CAGR
                </button>
                <button
                  id="btn-reset-cagr"
                  onClick={() => handleReset('cagr')}
                  className="py-2.5 px-4 rounded-xl border border-zinc-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border flex flex-col justify-between space-y-4 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-900/80 border-zinc-800 text-white'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Compound Annual Growth Rate</span>
                <div className="text-4xl font-black font-mono text-blue-400 mt-1">
                  {formatPercent(cagrResult.cagrPercent, 2)} p.a.
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Smooth annualized annual return across {cagrYears} years.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Total Capital Gain</div>
                  <div className={`text-base font-bold font-mono mt-1 ${cagrResult.totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {cagrResult.totalGain >= 0 ? '+' : ''}{formatINR(cagrResult.totalGain)}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5">
                  <div className="text-xs text-slate-400">Absolute Return %</div>
                  <div className="text-base font-bold font-mono mt-1 text-slate-200">
                    {(cagrResult?.percentageGain ?? 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-5 sm:p-6 rounded-3xl border ${isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/80 border-zinc-800'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">CAGR Constant Annual Compounding Curve</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cagrResult.trajectory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="year" tickFormatter={v => `Yr ${v}`} stroke="#64748b" />
                    <YAxis tickFormatter={v => formatINR(v, { compactWords: true })} stroke="#64748b" width={75} />
                    <Tooltip formatter={(val: any) => formatINR(Number(val))} labelFormatter={l => `Year ${l}`} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="projectedValue" name="Asset Value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 font-mono text-slate-300">
                <h4 className="font-bold uppercase text-blue-400 mb-2">How It Is Calculated</h4>
                <p className="text-blue-400">CAGR = (Final Value / Initial Value)^(1 / Years) - 1</p>
                <p>Total Gain = Final Value - Initial Value</p>
              </div>
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5 text-slate-300">
                <h4 className="font-bold uppercase text-emerald-400 mb-2">Simple Explanation</h4>
                <p>
                  CAGR represents the smoothed annual growth rate of an investment over a multi-year period as if it had grown at a steady rate each year.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 11. TOOLS FEEDBACK & SUGGESTIONS SECTION */}
      {/* ------------------------------------------------------------------- */}
      {activeCalc === 'feedback' && (
        <ToolsFeedbackSection
          isLight={isLight}
          onSelectCalculator={(calcId) => setActiveCalc(calcId as CalculatorType)}
        />
      )}

      {/* Mandatory Regulatory & Educational Disclaimer */}
      <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
        isLight ? 'bg-slate-100/90 border-slate-200 text-slate-600' : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400'
      }`}>
        <p>
          These calculators provide estimates based on the assumptions and inputs provided. Actual investment returns, interest rates, taxes, fees, inflation and financial product terms may differ. This tool is for educational purposes and is not financial advice.
        </p>
      </div>
    </div>
  );
};
