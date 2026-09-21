import React, { useState, useMemo } from 'react';
import {
  Flame,
  Coins,
  BarChart3,
  Target,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  Send,
  Loader2,
  Calendar,
  Percent,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  FireInputs,
  FireCalculationResult,
  DEFAULT_FIRE_INPUTS,
  calculateFireAndFreedom,
  validateFireInputs,
  formatIndianCurrency,
  formatIndianWords,
  formatIndianCompact,
  generateLocalAiExplanation
} from '../services/fireCalculatorEngine';
import { useFinance } from '../context/FinanceContext';

interface FireFreedomCalculatorProps {
  onSaveAsGoal?: (fireNumber: number) => void;
}

export const FireFreedomCalculator: React.FC<FireFreedomCalculatorProps> = ({ onSaveAsGoal }) => {
  const financeContext = useFinance();
  const addGoalFn = financeContext.addCustomGoal || financeContext.addGoal;
  const currentGoals = financeContext.customGoals || financeContext.goals || [];

  // Form Inputs (using standard defaults matching the user's requirements)
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(DEFAULT_FIRE_INPUTS.monthlyExpenses);
  const [currentInvestments, setCurrentInvestments] = useState<number>(DEFAULT_FIRE_INPUTS.currentInvestments);
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(DEFAULT_FIRE_INPUTS.monthlyInvestment);
  const [withdrawalRate, setWithdrawalRate] = useState<number>(DEFAULT_FIRE_INPUTS.withdrawalRate);
  const [multiplier, setMultiplier] = useState<number>(DEFAULT_FIRE_INPUTS.multiplier || 25);
  const [expectedAnnualReturn, setExpectedAnnualReturn] = useState<number>(DEFAULT_FIRE_INPUTS.expectedAnnualReturn);
  const [years, setYears] = useState<number>(DEFAULT_FIRE_INPUTS.years);

  // Active Calculated Results State (updated on Calculate click or initial load)
  const [activeInputs, setActiveInputs] = useState<FireInputs>(DEFAULT_FIRE_INPUTS);
  const [validationError, setValidationError] = useState<string | null>(null);

  // AI Adviser State
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [aiSource, setAiSource] = useState<'GEMINI_AI' | 'LOCAL' | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Perform pure mathematical calculations via separate engine
  const calculationResult: FireCalculationResult = useMemo(() => {
    return calculateFireAndFreedom(activeInputs);
  }, [activeInputs]);

  // Handle Calculate Button Click
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const candidateInputs: FireInputs = {
      monthlyExpenses: Number(monthlyExpenses),
      currentInvestments: Number(currentInvestments),
      monthlyInvestment: Number(monthlyInvestment),
      withdrawalRate: Number(withdrawalRate),
      multiplier: Number(multiplier),
      expectedAnnualReturn: Number(expectedAnnualReturn),
      years: Number(years),
    };

    const validation = validateFireInputs(candidateInputs);
    if (!validation.isValid) {
      const firstError =
        validation.monthlyExpenses ||
        validation.currentInvestments ||
        validation.monthlyInvestment ||
        validation.withdrawalRate ||
        validation.expectedAnnualReturn ||
        validation.years ||
        'Please review your input values.';
      setValidationError(firstError);
      return;
    }

    setValidationError(null);
    setActiveInputs(candidateInputs);

    // If AI explanation was previously loaded, refresh it with the new calculated numbers
    if (aiExplanation) {
      fetchAiExplanation(candidateInputs, calculateFireAndFreedom(candidateInputs));
    }
  };

  // Instant Multiplier Select Handler (25x, 30x, 33x, 35x)
  const handleSelectMultiplier = (xVal: number) => {
    setMultiplier(xVal);
    const correspondingRate = Number((100 / xVal).toFixed(2));
    setWithdrawalRate(correspondingRate);
    setValidationError(null);

    // Provide instant live recalculation
    const candidateInputs: FireInputs = {
      monthlyExpenses: Number(monthlyExpenses),
      currentInvestments: Number(currentInvestments),
      monthlyInvestment: Number(monthlyInvestment),
      withdrawalRate: correspondingRate,
      multiplier: xVal,
      expectedAnnualReturn: Number(expectedAnnualReturn),
      years: Number(years),
    };
    const validation = validateFireInputs(candidateInputs);
    if (validation.isValid) {
      setActiveInputs(candidateInputs);
    }
  };

  // Handle Reset Button Click
  const handleReset = () => {
    setMonthlyExpenses(DEFAULT_FIRE_INPUTS.monthlyExpenses);
    setCurrentInvestments(DEFAULT_FIRE_INPUTS.currentInvestments);
    setMonthlyInvestment(DEFAULT_FIRE_INPUTS.monthlyInvestment);
    setWithdrawalRate(DEFAULT_FIRE_INPUTS.withdrawalRate);
    setMultiplier(DEFAULT_FIRE_INPUTS.multiplier || 25);
    setExpectedAnnualReturn(DEFAULT_FIRE_INPUTS.expectedAnnualReturn);
    setYears(DEFAULT_FIRE_INPUTS.years);
    setValidationError(null);
    setActiveInputs(DEFAULT_FIRE_INPUTS);
    setAiExplanation('');
    setUserQuestion('');
    setAiSource(null);
  };

  // Fetch AI Adviser Explanation (server Gemini API with reliable local fallback)
  const fetchAiExplanation = async (
    inputsToUse = activeInputs,
    resultToUse = calculationResult,
    question?: string
  ) => {
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/fire/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculationResults: {
            ...resultToUse,
            withdrawalRate: inputsToUse.withdrawalRate,
            expectedAnnualReturn: inputsToUse.expectedAnnualReturn,
            years: inputsToUse.years,
          },
          userQuestion: question || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.advice) {
          setAiExplanation(data.advice);
          setAiSource(data.source === 'GEMINI_AI' ? 'GEMINI_AI' : 'LOCAL');
          return;
        }
      }

      // If backend call fails or no API key, use decoupled local deterministic explanation
      const fallback = generateLocalAiExplanation(inputsToUse, resultToUse, question);
      setAiExplanation(fallback);
      setAiSource('LOCAL');
    } catch {
      const fallback = generateLocalAiExplanation(inputsToUse, resultToUse, question);
      setAiExplanation(fallback);
      setAiSource('LOCAL');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Save FIRE Target as an Active Milestone Goal
  const handleSaveFireGoal = () => {
    const existing = currentGoals.find(g => g.category === 'Financial Independence' || g.name.includes('FIRE'));
    if (existing) {
      setSavedSuccessMsg(`Target already linked to your goal: "${existing.name}".`);
    } else if (typeof addGoalFn === 'function') {
      addGoalFn({
        name: 'FIRE Financial Freedom Target',
        targetAmount: calculationResult.fireNumber,
        currentAmount: calculationResult.currentInvestments,
        targetDate: new Date(Date.now() + activeInputs.years * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category: 'Financial Independence',
        color: '#f59e0b',
        monthlyContribution: activeInputs.monthlyInvestment,
        notes: 'Priority: High',
      });
      setSavedSuccessMsg(`Successfully saved ${calculationResult.displayPhrases.fireNumberWords} as your Financial Independence milestone goal!`);
    }

    if (onSaveAsGoal) {
      onSaveAsGoal(calculationResult.fireNumber);
    }

    setTimeout(() => setSavedSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                FIRE & Financial Freedom Calculator
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Indian Rupee (₹) Edition
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              Calculate Your Freedom Number
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Find the exact portfolio size required to fund your lifestyle perpetually without active work, and project your compounding wealth.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveFireGoal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/80 text-xs font-medium transition-colors cursor-pointer"
              title="Save this target as an active milestone in your financial plan"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
              <span>Save as Goal</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs transition-colors cursor-pointer"
              title="Reset all inputs to default values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {savedSuccessMsg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* 5 KEY DASHBOARD CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: FIRE Number */}
        <div 
          id="card-fire-number"
          className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 transition-all hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              🔥 FIRE Number
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium">
              {calculationResult.multiplier}x ({activeInputs.withdrawalRate}%)
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-100 tracking-tight">
            {formatIndianCompact(calculationResult.fireNumber)}
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Your target is <strong className="text-zinc-200 font-semibold">{calculationResult.displayPhrases.fireNumberWords}</strong> ({calculationResult.multiplier}x annual expenses)
          </p>
        </div>

        {/* Card 2: Financial Freedom Number */}
        <div 
          id="card-freedom-number"
          className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 transition-all hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              💰 Freedom Number
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
              Target
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-100 tracking-tight">
            {formatIndianCompact(calculationResult.financialFreedomNumber)}
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Your estimated Financial Freedom Number is <strong className="text-zinc-200 font-semibold">{calculationResult.displayPhrases.freedomNumberWords}</strong>
          </p>
        </div>

        {/* Card 3: FIRE Progress */}
        <div 
          id="card-fire-progress"
          className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 transition-all hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              📊 FIRE Progress
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
              {calculationResult.fireProgressPercent}%
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 tracking-tight">
            {calculationResult.fireProgressPercent}%
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Current: <span className="font-mono text-zinc-200">{calculationResult.displayPhrases.currentInvestmentsWords}</span> of {calculationResult.displayPhrases.fireNumberWords}
          </p>
        </div>

        {/* Card 4: Financial Freedom Gap */}
        <div 
          id="card-freedom-gap"
          className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 transition-all hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              🎯 Freedom Gap
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-medium">
              Remaining
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-200 tracking-tight">
            {formatIndianCompact(calculationResult.freedomGap)}
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Remaining Amount: <span className="font-mono text-zinc-200">{calculationResult.displayPhrases.fireGapWords}</span> to full freedom
          </p>
        </div>

        {/* Card 5: Projected Portfolio */}
        <div 
          id="card-projected-portfolio"
          className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 transition-all hover:border-zinc-700"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              📈 Projected Portfolio
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-medium">
              in {activeInputs.years} yrs
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-400 tracking-tight">
            {formatIndianCompact(calculationResult.projectedPortfolio)}
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight">
            Estimated projection at <span className="text-zinc-200 font-semibold">{activeInputs.expectedAnnualReturn}%</span> annual return
          </p>
        </div>
      </div>

      {/* PROGRESS BAR WITH MILESTONES */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200">Financial Freedom Progress</span>
            <span className="text-zinc-500">•</span>
            <span className="font-mono text-emerald-400 font-bold">{calculationResult.fireProgressPercent}% Completed</span>
          </div>
          <div className="font-mono text-zinc-400 text-[11px]">
            Invested: <strong className="text-zinc-200">{formatIndianCurrency(calculationResult.currentInvestments)}</strong> / Target: <strong className="text-zinc-200">{formatIndianCurrency(calculationResult.fireNumber)}</strong>
          </div>
        </div>

        <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800 p-0.5">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, calculationResult.fireProgressPercent)}%` }}
          />
        </div>

        <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono text-zinc-500 pt-1">
          <div className="border-r border-zinc-800 pr-1 text-left">
            <span className="text-zinc-400 block font-semibold">Start</span>
            <span>₹0</span>
          </div>
          <div className="border-r border-zinc-800 px-1">
            <span className="text-zinc-400 block font-semibold">50% Halfway</span>
            <span>{formatIndianCompact(calculationResult.fireNumber * 0.5)}</span>
          </div>
          <div className="border-r border-zinc-800 px-1">
            <span className="text-zinc-400 block font-semibold">75% Close</span>
            <span>{formatIndianCompact(calculationResult.fireNumber * 0.75)}</span>
          </div>
          <div className="pl-1 text-right">
            <span className="text-amber-400 block font-semibold">100% Freedom</span>
            <span>{formatIndianCompact(calculationResult.fireNumber)}</span>
          </div>
        </div>
      </div>

      {/* MAIN 2-COLUMN SECTION: INPUTS & PORTFOLIO GROWTH CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): Clean Input Controls */}
        <div className="lg:col-span-5 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-zinc-100">Calculator Assumptions</h2>
            </div>
            <span className="text-[11px] text-zinc-400">Values in ₹ (INR)</span>
          </div>

          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleCalculate} className="space-y-4 text-xs">
            {/* 1. Monthly Expenses */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-monthly-expenses" className="font-semibold text-zinc-300">
                  1. Monthly Expenses
                </label>
                <span className="font-mono text-zinc-400 text-[11px]">
                  Annual: {formatIndianCurrency((monthlyExpenses || 0) * 12)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-zinc-400">₹</span>
                <input
                  id="input-monthly-expenses"
                  type="number"
                  min="1"
                  step="1000"
                  value={monthlyExpenses}
                  onChange={e => {
                    setMonthlyExpenses(parseFloat(e.target.value) || 0);
                    setValidationError(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-sm font-mono font-semibold text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="e.g. 50000"
                  required
                />
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {[30000, 50000, 75000, 100000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMonthlyExpenses(val)}
                    className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono transition-colors"
                  >
                    ₹{(val / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Current Investments */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-current-investments" className="font-semibold text-zinc-300">
                  2. Current Investments / Portfolio
                </label>
                <span className="font-mono text-zinc-400 text-[11px]">
                  {formatIndianWords(currentInvestments || 0)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-zinc-400">₹</span>
                <input
                  id="input-current-investments"
                  type="number"
                  min="0"
                  step="50000"
                  value={currentInvestments}
                  onChange={e => {
                    setCurrentInvestments(parseFloat(e.target.value) || 0);
                    setValidationError(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-sm font-mono font-semibold text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="e.g. 2000000"
                  required
                />
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {[500000, 1000000, 2000000, 5000000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCurrentInvestments(val)}
                    className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono transition-colors"
                  >
                    ₹{(val / 100000)}L
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Monthly Investment / SIP */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-monthly-investment" className="font-semibold text-zinc-300">
                  3. Monthly Investment (SIP)
                </label>
                <span className="font-mono text-zinc-400 text-[11px]">
                  Annual: {formatIndianCurrency((monthlyInvestment || 0) * 12)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-zinc-400">₹</span>
                <input
                  id="input-monthly-investment"
                  type="number"
                  min="0"
                  step="2000"
                  value={monthlyInvestment}
                  onChange={e => {
                    setMonthlyInvestment(parseFloat(e.target.value) || 0);
                    setValidationError(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-2 text-sm font-mono font-semibold text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="e.g. 25000"
                  required
                />
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {[10000, 25000, 50000, 75000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMonthlyInvestment(val)}
                    className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[10px] font-mono transition-colors"
                  >
                    ₹{(val / 1000)}k/mo
                  </button>
                ))}
              </div>
            </div>

            {/* 4 & 5: Withdrawal Rate & Expected Return */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Withdrawal Rate & Multiplier (25x, 30x, 33x, 35x) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-withdrawal-rate" className="font-semibold text-zinc-300">
                    4. FIRE Multiplier (X)
                  </label>
                  <span className="font-mono font-bold text-amber-400 text-[11px]">
                    {multiplier ? `${multiplier}x` : `${(100 / (withdrawalRate || 4)).toFixed(0)}x`} ({withdrawalRate}%)
                  </span>
                </div>

                {/* Multiplier Choices: 25x, 30x, 33x, 35x */}
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[25, 30, 33, 35].map(xVal => {
                    const isSelected = multiplier === xVal;
                    return (
                      <button
                        key={xVal}
                        id={`btn-multiplier-${xVal}x`}
                        type="button"
                        onClick={() => handleSelectMultiplier(xVal)}
                        className={`py-1.5 px-1 rounded-lg text-center font-mono text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 font-bold border border-amber-400 shadow-sm'
                            : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 font-medium'
                        }`}
                        title={`${xVal}x annual expenses (~${(100 / xVal).toFixed(2)}% Safe Withdrawal Rate)`}
                      >
                        {xVal}x
                      </button>
                    );
                  })}
                </div>

                <div className="relative">
                  <input
                    id="input-withdrawal-rate"
                    type="number"
                    min="1"
                    max="10"
                    step="0.01"
                    value={withdrawalRate}
                    onChange={e => {
                      const val = parseFloat(e.target.value) || 0;
                      setWithdrawalRate(val);
                      if (val > 0) {
                        const calculatedX = Math.round(100 / val);
                        setMultiplier(calculatedX);
                      }
                      setValidationError(null);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono font-semibold text-zinc-100 focus:border-amber-500 focus:outline-none transition-colors"
                    placeholder="4.0"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-500">% SWR</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  {multiplier === 25 && '25x: Standard Trinity (4.0% SWR)'}
                  {multiplier === 30 && '30x: Conservative (3.33% SWR)'}
                  {multiplier === 33 && '33x: Capital preservation (3.03% SWR)'}
                  {multiplier === 35 && '35x: Ultra-safe freedom (2.86% SWR)'}
                  {![25, 30, 33, 35].includes(multiplier) && `${multiplier}x annual expenses (~${withdrawalRate}% SWR)`}
                </p>
              </div>

              {/* Expected Return */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-expected-return" className="font-semibold text-zinc-300">
                    5. Annual Return
                  </label>
                  <span className="font-mono font-bold text-emerald-400 text-[11px]">{expectedAnnualReturn}%</span>
                </div>
                <div className="relative">
                  <input
                    id="input-expected-return"
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={expectedAnnualReturn}
                    onChange={e => {
                      setExpectedAnnualReturn(parseFloat(e.target.value) || 0);
                      setValidationError(null);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono font-semibold text-zinc-100 focus:border-amber-500 focus:outline-none"
                    placeholder="12.0"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-500">%</span>
                </div>
                <p className="text-[10px] text-zinc-500">Indian Equity/MF: ~12%</p>
              </div>
            </div>

            {/* 6. Number of Years */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="input-years" className="font-semibold text-zinc-300">
                  6. Time Horizon
                </label>
                <span className="font-mono text-zinc-400 text-[11px]">{years} Years</span>
              </div>
              <div className="relative">
                <input
                  id="input-years"
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={years}
                  onChange={e => {
                    setYears(parseInt(e.target.value, 10) || 1);
                    setValidationError(null);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono font-semibold text-zinc-100 focus:border-amber-500 focus:outline-none"
                  placeholder="15"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-zinc-500">Years</span>
              </div>
            </div>

            {/* Action Buttons: Calculate & Reset */}
            <div className="flex items-center gap-3 pt-2">
              <button
                id="btn-fire-calculate"
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                <span>Calculate FIRE Plan</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (7 cols): Portfolio Growth Chart & Compounding Breakdown */}
        <div className="lg:col-span-7 rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-sm font-bold text-zinc-100">Monthly Investment Compounding Projection</h2>
                <p className="text-[11px] text-zinc-400">
                  Estimated growth over {activeInputs.years} years with monthly compounding
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Est. Future Value</span>
                <span className="text-base sm:text-lg font-mono font-bold text-cyan-400">
                  {formatIndianCurrency(calculationResult.projectedPortfolio)}
                </span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 sm:h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={calculationResult.yearlyProjections}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fireBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="fireInvestedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#71717a"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={val => formatIndianCompact(val)}
                    width={65}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3 shadow-xl text-xs space-y-1.5 font-mono">
                            <span className="text-zinc-400 block font-semibold">{label}</span>
                            <div className="text-cyan-400 font-bold text-sm">
                              Portfolio: {formatIndianCurrency(data.balance)}
                            </div>
                            <div className="text-zinc-300 text-[11px]">
                              Total Invested: {formatIndianCurrency(data.totalInvested)}
                            </div>
                            <div className="text-emerald-400 text-[11px]">
                              Estimated Gains: {formatIndianCurrency(data.estimatedGains)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Estimated Portfolio"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fill="url(#fireBalanceGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalInvested"
                    name="Total Invested"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    fill="url(#fireInvestedGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800 text-center">
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Principal Invested</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-zinc-200">
                {formatIndianCompact(calculationResult.totalInvestedPrincipal)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Compound Interest</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400">
                +{formatIndianCompact(calculationResult.totalEstimatedGains)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Freedom Horizon</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-amber-400">
                {calculationResult.estimatedYearsToFire !== null
                  ? `~${calculationResult.estimatedYearsToFire} Years`
                  : 'Goal Achieved'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI PERSONAL FINANCE ADVISER EXPLANATION SECTION */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">AI Personal Finance Adviser</h3>
                {aiSource === 'GEMINI_AI' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    Gemini 3.8
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400">
                Clear, simple explanation of your exact calculated numbers (AI never invents or alters figures)
              </p>
            </div>
          </div>

          {!aiExplanation && (
            <button
              type="button"
              onClick={() => fetchAiExplanation()}
              disabled={isAiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Explaining Results...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain My Results</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* AI Output Content */}
        {aiExplanation ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed space-y-2 whitespace-pre-line font-normal">
              {aiExplanation}
            </div>

            {/* Ask AI a Follow-up Question */}
            <form
              onSubmit={e => {
                e.preventDefault();
                if (userQuestion.trim()) {
                  fetchAiExplanation(activeInputs, calculationResult, userQuestion);
                  setUserQuestion('');
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={userQuestion}
                onChange={e => setUserQuestion(e.target.value)}
                placeholder="Ask the AI Adviser about your numbers (e.g. How much more should I invest each month?)"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAiLoading || !userQuestion.trim()}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isAiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Ask</span>
                    <Send className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between gap-3">
            <span>
              Click <strong>"Explain My Results"</strong> to receive an objective breakdown of your freedom target ({calculationResult.displayPhrases.fireNumberWords}), current progress ({calculationResult.fireProgressPercent}%), and compounding timeline.
            </span>
          </div>
        )}
      </div>

      {/* REQUIRED FINANCIAL DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-zinc-800/70 text-[11px] text-zinc-500 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
        <p>
          These calculations are estimates based on the assumptions you provide. Investment returns, inflation, taxes, fees, and future expenses can change the actual result. This tool is for educational purposes and is not financial advice.
        </p>
      </div>
    </div>
  );
};
