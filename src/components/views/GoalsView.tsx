import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Target, 
  Plus, 
  Trash2, 
  Edit2,
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  PiggyBank, 
  Plane, 
  Home, 
  Zap, 
  HeartHandshake,
  HeartPulse,
  CreditCard,
  AlertTriangle,
  PartyPopper,
  Flame,
  Clock,
  Compass,
  HelpCircle,
  RefreshCw,
  Check,
  Layers,
  Percent,
  ArrowUpRight,
  Sliders,
  Briefcase,
  ChevronRight,
  Coffee,
  Feather,
  Crown,
  ShieldAlert,
  Shield,
  SlidersHorizontal,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext';
import { GoalsSubTab, CustomGoal, EssentialGoal } from '../../types';
import { EmergencyGoalModal } from '../EmergencyGoalModal';

// Helper to calculate tenure in months and formatted label
export const calculateTenureMonthsFromDate = (dateStr: string): number => {
  if (!dateStr) return 12;
  const target = new Date(dateStr);
  const now = new Date();
  let months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  return Math.max(1, months);
};

export const calculateDateFromTenureMonths = (months: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() + Math.max(1, months));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(Math.min(d.getDate(), 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTenureLabel = (months: number): string => {
  if (months < 1) return '1 mo';
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y > 0 && m > 0) {
    return `${y} yr${y > 1 ? 's' : ''} ${m} mo${m > 1 ? 's' : ''}`;
  }
  if (y > 0) {
    return `${y} yr${y > 1 ? 's' : ''}`;
  }
  return `${m} mo${m > 1 ? 's' : ''}`;
};

export const getRemainingTimeLabel = (targetDateStr: string): string => {
  if (!targetDateStr) return 'Active';
  const target = new Date(targetDateStr);
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Due / Completed';
  const months = Math.ceil(diffDays / 30);
  if (months <= 1) return `${diffDays} days left`;
  if (months < 12) return `${months} mos left`;
  const yrs = (months / 12).toFixed(1);
  return `${yrs} yrs left`;
};

export const formatDateFriendly = (targetDateStr: string): string => {
  if (!targetDateStr) return '';
  const parts = targetDateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
  return targetDateStr;
};

export const GoalsView: React.FC = () => {
  const { 
    goalsSubTab, 
    setGoalsSubTab, 
    essentialGoals = [], 
    customGoals = [], 
    formatMoney, 
    monthlyExpenses, 
    monthlyIncome,
    netSavings,
    netWorth,
    totalAssets,
    liquidCash, 
    liquidRunwayMonths,
    addEssentialGoal,
    updateEssentialGoal,
    deleteEssentialGoal,
    depositToEssentialGoal,
    addCustomGoal,
    updateCustomGoal,
    deleteCustomGoal,
    contributeToGoal
  } = useFinance();

  // Essential / Emergency Defense Vault modal state
  const [isAddEssentialModalOpen, setIsAddEssentialModalOpen] = useState(false);
  const [essentialGoalToEdit, setEssentialGoalToEdit] = useState<EssentialGoal | null>(null);
  const [essentialGoalToDelete, setEssentialGoalToDelete] = useState<EssentialGoal | null>(null);
  const [depositEssentialId, setDepositEssentialId] = useState<string | null>(null);
  const [depositEssentialAmount, setDepositEssentialAmount] = useState<string>('');

  // Deposit modal state (for Custom Goals)
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');

  // New goal modal state
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Savings & Investment');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalInitial, setNewGoalInitial] = useState('');
  const [newGoalTenureMonths, setNewGoalTenureMonths] = useState(24); // 2 years default
  const [newGoalDate, setNewGoalDate] = useState(() => calculateDateFromTenureMonths(24));
  const [newGoalMonthly, setNewGoalMonthly] = useState('');

  // Edit goal modal state
  const [goalToEdit, setGoalToEdit] = useState<CustomGoal | null>(null);
  const [editGoalName, setEditGoalName] = useState('');
  const [editGoalCategory, setEditGoalCategory] = useState('Savings & Investment');
  const [editGoalTarget, setEditGoalTarget] = useState('');
  const [editGoalCurrent, setEditGoalCurrent] = useState('');
  const [editGoalTenureMonths, setEditGoalTenureMonths] = useState(24);
  const [editGoalDate, setEditGoalDate] = useState('');
  const [editGoalMonthly, setEditGoalMonthly] = useState('');
  const [editGoalNotes, setEditGoalNotes] = useState('');

  // Goals Portfolio & Tenure Summary
  const goalsSummary = useMemo(() => {
    const totalTarget = customGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
    const totalSaved = customGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
    const totalMonthlyRequired = customGoals.reduce((sum, g) => {
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      const tenureM = g.tenureMonths || calculateTenureMonthsFromDate(g.targetDate);
      return sum + (tenureM > 0 ? Math.ceil(remaining / tenureM) : 0);
    }, 0);
    const allTenures = customGoals.map(g => g.tenureMonths || calculateTenureMonthsFromDate(g.targetDate));
    const minTenure = allTenures.length > 0 ? Math.min(...allTenures) : 0;
    const maxTenure = allTenures.length > 0 ? Math.max(...allTenures) : 0;
    return { totalTarget, totalSaved, totalMonthlyRequired, minTenure, maxTenure };
  }, [customGoals]);

  // Emergency target months slider state
  const [emergencyTargetMonths, setEmergencyTargetMonths] = useState(6);
  const [customRunwayMonthsInput, setCustomRunwayMonthsInput] = useState<string>('');
  const [isCustomMonthsOpen, setIsCustomMonthsOpen] = useState<boolean>(false);

  // Essential / Emergency Helpers
  const totalEssentialFunded = useMemo(() => {
    return essentialGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  }, [essentialGoals]);

  const totalEssentialTarget = useMemo(() => {
    return essentialGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  }, [essentialGoals]);

  const getEssentialTypeInfo = (type?: EssentialGoal['type']) => {
    switch (type) {
      case 'emergency_fund':
        return { label: 'Core Emergency', icon: ShieldCheck, color: '#10b981', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'medical_shield':
        return { label: 'Medical Shield', icon: HeartPulse, color: '#06b6d4', badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      case 'debt_snowball':
        return { label: 'Debt Freedom', icon: CreditCard, color: '#14b8a6', badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
      case 'insurance_buffer':
        return { label: 'Insurance Buffer', icon: ShieldAlert, color: '#8b5cf6', badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
      case 'essential_runway':
        return { label: 'Runway / Repair', icon: Home, color: '#f59e0b', badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'custom_vault':
      default:
        return { label: 'Defense Vault', icon: Shield, color: '#10b981', badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
  };

  const handleDepositEssential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositEssentialId) return;
    const amount = parseFloat(depositEssentialAmount);
    if (!isNaN(amount) && amount > 0) {
      depositToEssentialGoal(depositEssentialId, amount);
      const targetGoal = essentialGoals.find(g => g.id === depositEssentialId);
      if (targetGoal && (targetGoal.currentAmount + amount) >= targetGoal.targetAmount) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });
      }
    }
    setDepositEssentialId(null);
    setDepositEssentialAmount('');
  };

  const handleConfirmDeleteEssential = () => {
    if (essentialGoalToDelete) {
      deleteEssentialGoal(essentialGoalToDelete.id);
      setEssentialGoalToDelete(null);
    }
  };

  // ----------------------------------------------------
  // FIRE NUMBER SIMULATION & TUNER STATE
  // ----------------------------------------------------
  const [fireType, setFireType] = useState<'regular' | 'lean' | 'fat' | 'coast' | 'barista'>('regular');
  const [isExpenseSynced, setIsExpenseSynced] = useState(true);
  const [customAnnualExpense, setCustomAnnualExpense] = useState<number>(monthlyExpenses > 0 ? monthlyExpenses * 12 : 0);
  
  const [fireSafeRate, setFireSafeRate] = useState<number>(4.0); // 4% Rule
  const [isSavingsSynced, setIsSavingsSynced] = useState(true);
  const [customCurrentPortfolio, setCustomCurrentPortfolio] = useState<number>(netWorth > 0 ? netWorth : (totalAssets > 0 ? totalAssets : 0));
  
  const [isContributionSynced, setIsContributionSynced] = useState(true);
  const [customMonthlyInvestment, setCustomMonthlyInvestment] = useState<number>(netSavings > 0 ? netSavings : 0);
  
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(8.0); // 8% CAGR
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [targetRetirementAge, setTargetRetirementAge] = useState<number>(50);

  const [fireSyncSuccessMsg, setFireSyncSuccessMsg] = useState<string | null>(null);

  // Active baseline expense
  const baselineAnnualExpense = isExpenseSynced ? (monthlyExpenses * 12) : customAnnualExpense;

  // Multiplier by archetype
  const archetypeMultiplier = useMemo(() => {
    switch (fireType) {
      case 'lean': return 0.75; // 75% frugal expenses
      case 'fat': return 1.40; // 140% luxury buffer
      case 'barista': return 0.50; // 50% passive, 50% side income
      case 'coast': return 1.00;
      case 'regular':
      default: return 1.00;
    }
  }, [fireType]);

  const effectiveAnnualExpense = Math.round(baselineAnnualExpense * archetypeMultiplier);

  // Active current invested wealth
  const activeCurrentWealth = isSavingsSynced ? (netWorth > 0 ? netWorth : Math.max(0, totalAssets)) : customCurrentPortfolio;

  // Active monthly contribution
  const activeMonthlyContribution = isContributionSynced ? Math.max(0, netSavings) : customMonthlyInvestment;

  // FIRE Number Calculation
  const fireCalculations = useMemo(() => {
    const swrDecimal = fireSafeRate / 100;
    const ruleMultiplier = Math.round(100 / fireSafeRate);
    const fireNumber = (swrDecimal > 0 && effectiveAnnualExpense > 0) ? Math.round(effectiveAnnualExpense / swrDecimal) : 0;
    const progressPct = fireNumber > 0 ? Math.min(100, Math.round((activeCurrentWealth / fireNumber) * 1000) / 10) : (activeCurrentWealth > 0 && effectiveAnnualExpense === 0 ? 100 : 0);
    const deficit = Math.max(0, fireNumber - activeCurrentWealth);
    
    // Monthly passive income generated forever at SWR
    const monthlyPassiveCashflow = Math.round((fireNumber * swrDecimal) / 12);
    const currentPassiveCashflowToday = Math.round((activeCurrentWealth * swrDecimal) / 12);
    const yearsFundedToday = (effectiveAnnualExpense > 0 && activeCurrentWealth > 0) ? (activeCurrentWealth / effectiveAnnualExpense).toFixed(1) : '0';

    // Time to FIRE (Month-by-month compound simulation)
    let monthsToReach = 0;
    let simulatedBalance = activeCurrentWealth;
    const monthlyRate = annualReturnRate / 100 / 12;
    const maxMonths = 720; // 60 years cap

    if (fireNumber === 0 || simulatedBalance >= fireNumber) {
      monthsToReach = 0;
    } else {
      while (simulatedBalance < fireNumber && monthsToReach < maxMonths) {
        simulatedBalance = (simulatedBalance * (1 + monthlyRate)) + activeMonthlyContribution;
        monthsToReach++;
      }
    }

    const yearsToFire = (monthsToReach / 12).toFixed(1);
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + monthsToReach);
    const projectedTargetDateStr = targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    // Coast FIRE calculations
    const yearsUntilRetirement = Math.max(1, targetRetirementAge - currentAge);
    const coastFireTarget = fireNumber > 0 ? Math.round(fireNumber / Math.pow(1 + (annualReturnRate / 100), yearsUntilRetirement)) : 0;
    const isCoastAchieved = coastFireTarget > 0 && activeCurrentWealth >= coastFireTarget;
    const coastProgressPct = coastFireTarget > 0 ? Math.min(100, Math.round((activeCurrentWealth / coastFireTarget) * 100)) : 0;

    return {
      ruleMultiplier,
      fireNumber,
      progressPct,
      deficit,
      monthlyPassiveCashflow,
      currentPassiveCashflowToday,
      yearsFundedToday,
      monthsToReach,
      yearsToFire,
      projectedTargetDateStr,
      isCoastAchieved,
      coastFireTarget,
      coastProgressPct,
      yearsUntilRetirement,
    };
  }, [
    effectiveAnnualExpense,
    fireSafeRate,
    activeCurrentWealth,
    activeMonthlyContribution,
    annualReturnRate,
    currentAge,
    targetRetirementAge
  ]);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    contributeToGoal(depositGoalId, amount);

    const targetGoal = customGoals.find(g => g.id === depositGoalId);
    if (targetGoal && targetGoal.currentAmount + amount >= targetGoal.targetAmount) {
      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }

    setDepositGoalId(null);
    setDepositAmount('');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget);
    const initial = parseFloat(newGoalInitial) || 0;
    if (isNaN(target) || target <= 0 || !newGoalName.trim()) return;

    const tenureMonths = newGoalTenureMonths > 0 ? newGoalTenureMonths : calculateTenureMonthsFromDate(newGoalDate);
    const tenureYears = parseFloat((tenureMonths / 12).toFixed(1));

    addCustomGoal({
      name: newGoalName.trim(),
      category: newGoalCategory,
      targetAmount: target,
      currentAmount: initial,
      targetDate: newGoalDate,
      tenureMonths,
      tenureYears,
      monthlyContribution: parseFloat(newGoalMonthly) || Math.max(1, Math.round((target - initial) / tenureMonths)),
      color: '#10b981',
      icon: 'Target',
    });

    setIsAddGoalModalOpen(false);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalInitial('');
    setNewGoalTenureMonths(24);
    setNewGoalDate(calculateDateFromTenureMonths(24));
    setNewGoalMonthly('');
  };

  const handleOpenEditGoal = (goal: CustomGoal) => {
    setGoalToEdit(goal);
    setEditGoalName(goal.name);
    setEditGoalCategory(goal.category);
    setEditGoalTarget(goal.targetAmount.toString());
    setEditGoalCurrent(goal.currentAmount.toString());
    setEditGoalDate(goal.targetDate || calculateDateFromTenureMonths(24));
    const m = goal.tenureMonths || calculateTenureMonthsFromDate(goal.targetDate || '');
    setEditGoalTenureMonths(m);
    setEditGoalMonthly(goal.monthlyContribution ? goal.monthlyContribution.toString() : '');
    setEditGoalNotes(goal.notes || '');
  };

  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalToEdit) return;
    const target = parseFloat(editGoalTarget);
    const current = parseFloat(editGoalCurrent) || 0;
    if (isNaN(target) || target <= 0 || !editGoalName.trim()) return;

    const tenureMonths = editGoalTenureMonths > 0 ? editGoalTenureMonths : calculateTenureMonthsFromDate(editGoalDate);
    const tenureYears = parseFloat((tenureMonths / 12).toFixed(1));

    updateCustomGoal(goalToEdit.id, {
      name: editGoalName.trim(),
      category: editGoalCategory,
      targetAmount: target,
      currentAmount: current,
      targetDate: editGoalDate,
      tenureMonths,
      tenureYears,
      monthlyContribution: parseFloat(editGoalMonthly) || Math.max(1, Math.round((target - current) / tenureMonths)),
      notes: editGoalNotes.trim() || undefined,
    });

    setGoalToEdit(null);
  };

  // 1-Click Save FIRE Goal to Custom Milestones
  const handleSaveFireAsGoal = () => {
    const goalTitle = `🔥 FIRE Freedom (${fireType.toUpperCase()} • ${fireCalculations.ruleMultiplier}x Rule)`;
    const existingFireGoal = customGoals.find(g => g.name.includes('FIRE') || g.category === 'Financial Independence');

    if (existingFireGoal) {
      updateCustomGoal(existingFireGoal.id, {
        name: goalTitle,
        targetAmount: fireCalculations.fireNumber,
        currentAmount: activeCurrentWealth,
        targetDate: `${new Date().getFullYear() + Math.ceil(parseFloat(fireCalculations.yearsToFire) || 10)}-12-31`,
        monthlyContribution: activeMonthlyContribution,
        category: 'Financial Independence',
        icon: 'TrendingUp',
        color: '#f59e0b',
        notes: `FIRE Target based on ${formatMoney(effectiveAnnualExpense)}/yr expense at ${fireSafeRate}% SWR (${fireCalculations.ruleMultiplier}x).`,
      });
    } else {
      addCustomGoal({
        name: goalTitle,
        category: 'Financial Independence',
        targetAmount: fireCalculations.fireNumber,
        currentAmount: activeCurrentWealth,
        targetDate: `${new Date().getFullYear() + Math.ceil(parseFloat(fireCalculations.yearsToFire) || 10)}-12-31`,
        monthlyContribution: activeMonthlyContribution,
        color: '#f59e0b',
        icon: 'TrendingUp',
        notes: `FIRE Target based on ${formatMoney(effectiveAnnualExpense)}/yr expense at ${fireSafeRate}% SWR (${fireCalculations.ruleMultiplier}x).`,
      });
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setFireSyncSuccessMsg('FIRE Goal saved to your active Milestones!');
    setTimeout(() => setFireSyncSuccessMsg(null), 3000);
  };

  const calculatedEmergencyNeeded = monthlyExpenses * emergencyTargetMonths;
  const emergencyFundPercent = calculatedEmergencyNeeded > 0 
    ? Math.min(100, Math.round((liquidCash / calculatedEmergencyNeeded) * 100)) 
    : (liquidCash > 0 ? 100 : 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* 3 Sub-Tabs Bar: Essential, Goals & FIRE Target */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs w-full overflow-x-auto no-scrollbar">
        <button
          id="tab-goals-essential"
          onClick={() => setGoalsSubTab('essential')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all shrink-0 justify-center ${
            goalsSubTab === 'essential'
              ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Essential Foundations ({essentialGoals.length})</span>
        </button>

        <button
          id="tab-goals-custom"
          onClick={() => setGoalsSubTab('goals')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all shrink-0 justify-center ${
            goalsSubTab === 'goals'
              ? 'bg-zinc-800 text-cyan-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Milestones & Goals ({customGoals.length})</span>
        </button>

        <button
          id="tab-goals-fire"
          onClick={() => setGoalsSubTab('fire')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-semibold transition-all shrink-0 justify-center ${
            goalsSubTab === 'fire'
              ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-amber-300'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>FIRE Number & Freedom</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
            {fireCalculations.progressPct}%
          </span>
        </button>
      </div>

      {/* 1. ESSENTIAL TAB */}
      {goalsSubTab === 'essential' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Top Header & Add Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  Emergency Defense Vaults & Runway
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-semibold border border-emerald-500/20">
                    {essentialGoals.length} Active Vaults
                  </span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Protect against unforeseen life events, medical emergencies, job disruptions, and maintain liquid peace of mind.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-add-defense-vault"
                onClick={() => {
                  setEssentialGoalToEdit(null);
                  setIsAddEssentialModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Defense Vault</span>
              </button>
            </div>
          </div>

          {/* Emergency Runway Simulator Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Primary Safety Runway
                </span>
                <h3 className="text-xl font-bold text-zinc-100 mt-0.5">
                  Emergency Defense Vault
                </h3>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-[11px] text-zinc-400 font-medium block">Monthly Burn</span>
                  <span className="text-base font-bold font-mono text-zinc-200">
                    {formatMoney(monthlyExpenses)}/mo
                  </span>
                </div>
                <div className="pl-4 border-l border-zinc-800">
                  <span className="text-[11px] text-zinc-400 font-medium block">Current Liquid Buffer</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {formatMoney(liquidCash)}
                  </span>
                </div>
              </div>
            </div>

            {/* Target months selector */}
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-medium flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                  Target Runway Duration
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  {emergencyTargetMonths} Months ({formatMoney(calculatedEmergencyNeeded)} needed)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[3, 6, 9, 12, 18, 24].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setEmergencyTargetMonths(m);
                      setIsCustomMonthsOpen(false);
                    }}
                    className={`flex-1 min-w-[50px] py-1.5 rounded-lg text-center font-semibold transition-all ${
                      emergencyTargetMonths === m && !isCustomMonthsOpen
                        ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {m} Mo
                  </button>
                ))}
                
                <button
                  onClick={() => setIsCustomMonthsOpen(!isCustomMonthsOpen)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    isCustomMonthsOpen
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomMonthsOpen && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    placeholder="Enter custom months (e.g. 8)"
                    value={customRunwayMonthsInput}
                    onChange={e => setCustomRunwayMonthsInput(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = parseInt(customRunwayMonthsInput, 10);
                      if (!isNaN(val) && val > 0) {
                        setEmergencyTargetMonths(val);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400 transition-all text-xs"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Progress Bar & Status */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${emergencyFundPercent >= 100 ? 'bg-emerald-400' : emergencyFundPercent >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} />
                  {emergencyFundPercent}% Protected
                </span>
                <span className="text-emerald-400 font-semibold">{liquidRunwayMonths} months actual burn secured</span>
              </div>
              <div className="w-full bg-zinc-800/80 h-2.5 rounded-full overflow-hidden p-0.5">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, emergencyFundPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Essential Goals & Defense Vaults Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-200">
                  Active Defense Vaults & Shields ({essentialGoals.length})
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Total Shielded: <span className="font-mono text-emerald-400 font-semibold">{formatMoney(totalEssentialFunded)}</span> of <span className="font-mono text-zinc-300 font-semibold">{formatMoney(totalEssentialTarget)}</span> target
                </p>
              </div>

              <button
                onClick={() => {
                  setEssentialGoalToEdit(null);
                  setIsAddEssentialModalOpen(true);
                }}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vault</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {essentialGoals.map(ess => {
                const pct = ess.targetAmount > 0 ? Math.min(100, Math.round((ess.currentAmount / ess.targetAmount) * 100)) : (ess.currentAmount > 0 ? 100 : 0);
                const remaining = Math.max(0, ess.targetAmount - ess.currentAmount);
                const typeInfo = getEssentialTypeInfo(ess.type);
                const TypeIcon = typeInfo.icon;
                const cardColor = ess.color || typeInfo.color;

                return (
                  <div 
                    key={ess.id} 
                    id={`essential-goal-card-${ess.id}`}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group shadow-sm"
                  >
                    <div>
                      {/* Header Badge & Action Buttons */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-lg border flex items-center gap-1 ${typeInfo.badgeClass}`}>
                          <TypeIcon className="w-3 h-3" />
                          {typeInfo.label}
                        </span>

                        {/* Card CRUD Actions: Edit & Delete */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            id={`btn-edit-essential-${ess.id}`}
                            title="Edit Defense Vault"
                            onClick={() => setEssentialGoalToEdit(ess)}
                            className="p-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-400 hover:text-cyan-300 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-essential-${ess.id}`}
                            title="Delete Defense Vault"
                            onClick={() => setEssentialGoalToDelete(ess)}
                            className="p-1.5 rounded-lg bg-zinc-800/70 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Goal Title & Description */}
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-sm font-bold text-zinc-100 truncate">{ess.name}</h4>
                        {ess.targetMonths && (
                          <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                            {ess.targetMonths} mo burn
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed line-clamp-2">{ess.notes}</p>
                    </div>

                    {/* Progress Bar & Amount Stats */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400">{pct}% Complete</span>
                        <div className="text-right">
                          <span className="text-zinc-100 font-semibold">{formatMoney(ess.currentAmount)}</span>
                          <span className="text-zinc-500 text-[10px]"> / {formatMoney(ess.targetAmount)}</span>
                        </div>
                      </div>

                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${pct}%`,
                            backgroundColor: cardColor 
                          }}
                        />
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {remaining === 0 ? '✨ Fully funded' : `${formatMoney(remaining)} remaining`}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            id={`btn-deposit-essential-${ess.id}`}
                            onClick={() => {
                              setDepositEssentialId(ess.id);
                              setDepositEssentialAmount('500');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-semibold text-[11px] border border-emerald-500/20 transition-all flex items-center gap-1"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Deposit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Vault Dashed Card */}
              <button
                id="btn-add-vault-card"
                onClick={() => {
                  setEssentialGoalToEdit(null);
                  setIsAddEssentialModalOpen(true);
                }}
                className="p-4 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 bg-zinc-900/30 hover:bg-emerald-500/5 transition-all flex flex-col items-center justify-center text-center gap-2 group min-h-[160px] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 group-hover:bg-emerald-500/20 text-zinc-400 group-hover:text-emerald-400 flex items-center justify-center transition-all">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-emerald-300 block">
                    Add Defense Vault / Shield
                  </span>
                  <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400">
                    Custom emergency reserves & buffers
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTOM GOALS TAB */}
      {goalsSubTab === 'goals' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Quick FIRE Milestone Teaser Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-950/20 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Ultimate Milestone
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">
                    {fireCalculations.progressPct}% Achieved
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-100">
                  Your Financial Independence (FIRE) Target: {formatMoney(fireCalculations.fireNumber)}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setGoalsSubTab('fire')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-sm transition-all"
            >
              <span>Explore FIRE Model & Simulator</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Header & Add Goal Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">Goals & Milestones Planner</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  {customGoals.length} Active Goals
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Plan milestone tenures, target dates, and required monthly savings</p>
            </div>

            <button
              id="btn-add-custom-goal"
              onClick={() => {
                setNewGoalTenureMonths(24);
                setNewGoalDate(calculateDateFromTenureMonths(24));
                setIsAddGoalModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Goal</span>
            </button>
          </div>

          {/* Goals Portfolio Metrics Strip with Tenure Insights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Total Milestones Target</span>
              <span className="text-sm font-bold font-mono text-zinc-100">{formatMoney(goalsSummary.totalTarget)}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Total Saved So Far</span>
              <span className="text-sm font-bold font-mono text-emerald-400">{formatMoney(goalsSummary.totalSaved)}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold block">Required Monthly Pace</span>
              <span className="text-sm font-bold font-mono text-teal-400">{formatMoney(goalsSummary.totalMonthlyRequired)}/mo</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>Tenure Range</span>
              </span>
              <span className="text-xs font-bold text-cyan-300">
                {goalsSummary.minTenure > 0 
                  ? `${formatTenureLabel(goalsSummary.minTenure)} – ${formatTenureLabel(goalsSummary.maxTenure)}`
                  : 'No active goals'}
              </span>
            </div>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customGoals.map(goal => {
              const progressPct = goal.targetAmount > 0 
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
                : (goal.currentAmount > 0 ? 100 : 0);
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const tenureMonths = goal.tenureMonths || calculateTenureMonthsFromDate(goal.targetDate);
              const tenureLabel = formatTenureLabel(tenureMonths);
              const remainingTime = getRemainingTimeLabel(goal.targetDate);
              const recommendedMonthly = tenureMonths > 0 ? Math.max(1, Math.round(remaining / tenureMonths)) : 0;

              return (
                <div 
                  key={goal.id}
                  className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          {goal.icon === 'Plane' ? <Plane className="w-5 h-5" /> : 
                           goal.icon === 'Home' ? <Home className="w-5 h-5" /> : 
                           goal.icon === 'Zap' ? <Zap className="w-5 h-5" /> : 
                           goal.category === 'Financial Independence' ? <Flame className="w-5 h-5 text-amber-400" /> :
                           <TrendingUp className="w-5 h-5" />}
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                            {goal.category}
                          </span>
                          <h3 className="text-sm font-bold text-zinc-100 leading-snug">
                            {goal.name}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEditGoal(goal)}
                          className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Edit goal and tenure"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteCustomGoal(goal.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {goal.notes && (
                      <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {goal.notes}
                      </p>
                    )}
                  </div>

                  {/* Tenure & Target Date Block */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block leading-tight">Tenure</span>
                        <span className="font-semibold text-zinc-200">{tenureLabel}</span>
                        <span className="text-[10px] text-zinc-500 font-mono"> ({tenureMonths}m)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditGoal(goal)}
                      className="flex items-center gap-2 text-left hover:bg-zinc-850 p-1 rounded-lg transition-colors cursor-pointer group/date"
                      title="Click to view or edit target date and tenure"
                    >
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 group-hover/date:border-cyan-400">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-zinc-500 block leading-tight flex items-center gap-1">
                          <span>Target Date</span>
                          <span className="text-[9px] text-cyan-400 underline font-normal">select/view</span>
                        </span>
                        <span className="font-semibold text-cyan-300 truncate block">
                          {formatDateFriendly(goal.targetDate)}
                        </span>
                        <span className="text-[10px] text-zinc-500 block leading-tight font-mono">
                          {remainingTime}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Progress Stats & Bar */}
                  <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {formatMoney(goal.currentAmount)}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        Target: {formatMoney(goal.targetAmount)} ({progressPct}%)
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                      <span className="text-zinc-400">Target: <span className="font-mono text-zinc-300">{goal.targetDate}</span></span>
                      <span className="font-mono text-zinc-300">
                        {remaining === 0 ? '🎉 Milestone Met!' : `Pace: ${formatMoney(recommendedMonthly)}/mo`}
                      </span>
                    </div>
                  </div>

                  {/* Deposit Contribution Button */}
                  <button
                    onClick={() => {
                      setDepositGoalId(goal.id);
                      setDepositAmount(goal.monthlyContribution ? goal.monthlyContribution.toString() : '500');
                    }}
                    className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Contribute Funds</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. 🔥 FIRE NUMBER & FREEDOM HUB */}
      {goalsSubTab === 'fire' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Master FIRE Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Header Title & Actions */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Financial Independence & Early Retirement (FIRE)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                      {fireCalculations.ruleMultiplier}x Annual Expenses Rule
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Your FIRE Number Target
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                    The exact portfolio amount required to sustainably fund your lifestyle forever without ever needing to earn active income.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveFireAsGoal}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Set as Active Milestone Goal</span>
                  </button>
                </div>
              </div>

              {/* Toast Feedback message */}
              {fireSyncSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{fireSyncSuccessMsg}</span>
                </div>
              )}

              {/* Big Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Target FIRE Number */}
                <div className="p-4.5 rounded-2xl bg-zinc-950/80 border border-amber-500/30 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Calculated FIRE Number
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                    {formatMoney(fireCalculations.fireNumber)}
                  </div>
                  <span className="text-[11px] text-zinc-400 block">
                    @ {fireSafeRate}% SWR ({formatMoney(effectiveAnnualExpense)}/yr burn)
                  </span>
                </div>

                {/* 2. Current Progress */}
                <div className="p-4.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Invested Wealth / Progress
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-emerald-400 tracking-tight">
                    {fireCalculations.progressPct}%
                  </div>
                  <span className="text-[11px] text-zinc-400 block font-mono">
                    {formatMoney(activeCurrentWealth)} of {formatMoney(fireCalculations.fireNumber)}
                  </span>
                </div>

                {/* 3. Projected Horizon / Timeline */}
                <div className="p-4.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Est. Time to Freedom
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-cyan-400 tracking-tight">
                    {fireCalculations.deficit === 0 ? 'Achieved!' : `${fireCalculations.yearsToFire} yrs`}
                  </div>
                  <span className="text-[11px] text-zinc-400 block">
                    {fireCalculations.deficit === 0 ? '🎉 Ready to retire' : `Target: ${fireCalculations.projectedTargetDateStr}`}
                  </span>
                </div>

                {/* 4. Safe Passive Cashflow */}
                <div className="p-4.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Passive Monthly Yield
                  </span>
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-purple-400 tracking-tight">
                    {formatMoney(fireCalculations.monthlyPassiveCashflow)}
                    <span className="text-xs font-normal text-zinc-400">/mo</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 block font-mono">
                    Currently: {formatMoney(fireCalculations.currentPassiveCashflowToday)}/mo today
                  </span>
                </div>
              </div>

              {/* Progress Bar with Milestone Markers */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-300 font-semibold">
                    Current Portfolio: {formatMoney(activeCurrentWealth)} ({fireCalculations.progressPct}%)
                  </span>
                  <span className="text-amber-400 font-semibold">
                    Remaining Gap: {formatMoney(fireCalculations.deficit)}
                  </span>
                </div>

                <div className="w-full bg-zinc-950 h-3.5 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-orange-500 transition-all duration-700 shadow-lg shadow-amber-500/20"
                    style={{ width: `${fireCalculations.progressPct}%` }}
                  />
                </div>

                {/* Milestone breakdown ticks */}
                <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono text-zinc-400 pt-1">
                  <div className="border-r border-zinc-800/80 pr-1">
                    <span className="text-zinc-300 font-semibold block">25% (Basecamp)</span>
                    <span>{formatMoney(fireCalculations.fireNumber * 0.25)}</span>
                  </div>
                  <div className="border-r border-zinc-800/80 px-1">
                    <span className="text-zinc-300 font-semibold block">50% (Halftime)</span>
                    <span>{formatMoney(fireCalculations.fireNumber * 0.5)}</span>
                  </div>
                  <div className="border-r border-zinc-800/80 px-1">
                    <span className="text-zinc-300 font-semibold block">75% (Final Lap)</span>
                    <span>{formatMoney(fireCalculations.fireNumber * 0.75)}</span>
                  </div>
                  <div className="pl-1">
                    <span className="text-amber-400 font-bold block">100% (Freedom)</span>
                    <span>{formatMoney(fireCalculations.fireNumber)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FIRE Archetypes & Variations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-zinc-100">FIRE Archetypes & Styles</h2>
                <p className="text-[11px] text-zinc-400">Choose the lifestyle independence target that fits your vision</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* 1. Regular FIRE */}
              <button
                type="button"
                onClick={() => setFireType('regular')}
                className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-3 ${
                  fireType === 'regular'
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Flame className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      100% Exp
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-100">Regular FIRE</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Maintain 100% of your current standard of living without working.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-mono text-xs font-bold text-amber-400">
                  {formatMoney(Math.round(baselineAnnualExpense / (fireSafeRate / 100)))}
                </div>
              </button>

              {/* 2. Lean FIRE */}
              <button
                type="button"
                onClick={() => setFireType('lean')}
                className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-3 ${
                  fireType === 'lean'
                    ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <Feather className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      75% Exp
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-100">Lean FIRE</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Minimalist, low-cost freedom with optimized essential expenses.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-mono text-xs font-bold text-emerald-400">
                  {formatMoney(Math.round((baselineAnnualExpense * 0.75) / (fireSafeRate / 100)))}
                </div>
              </button>

              {/* 3. Fat FIRE */}
              <button
                type="button"
                onClick={() => setFireType('fat')}
                className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-3 ${
                  fireType === 'fat'
                    ? 'bg-purple-500/10 border-purple-500/50 shadow-md ring-1 ring-purple-500/30'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                      <Crown className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      140% Exp
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-100">Fat FIRE</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Abundant lifestyle with travel, luxury hobbies, and padding.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-mono text-xs font-bold text-purple-400">
                  {formatMoney(Math.round((baselineAnnualExpense * 1.40) / (fireSafeRate / 100)))}
                </div>
              </button>

              {/* 4. Coast FIRE */}
              <button
                type="button"
                onClick={() => setFireType('coast')}
                className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-3 ${
                  fireType === 'coast'
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <Compass className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      Age {targetRetirementAge}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-100">Coast FIRE</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    Invest enough early so compounding hits full FIRE without adding more.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-mono text-xs font-bold text-cyan-400">
                  {formatMoney(fireCalculations.coastFireTarget)} (at {currentAge}yo)
                </div>
              </button>

              {/* 5. Barista FIRE */}
              <button
                type="button"
                onClick={() => setFireType('barista')}
                className={`p-4 rounded-2xl text-left transition-all border flex flex-col justify-between space-y-3 ${
                  fireType === 'barista'
                    ? 'bg-rose-500/10 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                      <Coffee className="w-4 h-4" />
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      50% Passive
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-zinc-100">Barista FIRE</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    50% passive portfolio income + low-stress flexible freelancing/job.
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-800 font-mono text-xs font-bold text-rose-400">
                  {formatMoney(Math.round((baselineAnnualExpense * 0.50) / (fireSafeRate / 100)))}
                </div>
              </button>
            </div>
          </div>

          {/* Interactive Parameters & Live Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left Col (2 cols): Interactive Controls */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Interactive FIRE Assumptions</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpenseSynced(true);
                    setIsSavingsSynced(true);
                    setIsContributionSynced(true);
                    setFireSafeRate(4.0);
                    setAnnualReturnRate(8.0);
                  }}
                  className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset to Live Portfolio</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Annual Living Expenses */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">Annual Living Expenses</label>
                    <button
                      type="button"
                      onClick={() => setIsExpenseSynced(!isExpenseSynced)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                        isExpenseSynced 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isExpenseSynced ? '✓ Auto-synced' : 'Custom'}
                    </button>
                  </div>
                  {isExpenseSynced ? (
                    <div className="text-lg font-mono font-bold text-white">
                      {formatMoney(baselineAnnualExpense)}
                      <span className="text-[11px] text-zinc-400 font-normal ml-2">
                        ({formatMoney(monthlyExpenses)}/mo)
                      </span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={customAnnualExpense}
                      onChange={e => setCustomAnnualExpense(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-sm font-mono font-semibold text-white focus:border-amber-500"
                    />
                  )}
                  <p className="text-[10px] text-zinc-400">
                    Adjusted for {fireType.toUpperCase()} mode: {formatMoney(effectiveAnnualExpense)}/yr
                  </p>
                </div>

                {/* 2. Safe Withdrawal Rate (SWR) */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">Safe Withdrawal Rate (SWR)</label>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {fireSafeRate}% ({fireCalculations.ruleMultiplier}x Rule)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="5.0"
                    step="0.25"
                    value={fireSafeRate}
                    onChange={e => setFireSafeRate(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>3.0% (33.3x)</span>
                    <span className="text-amber-400 font-bold">4.0% (25x Trinity)</span>
                    <span>5.0% (20x)</span>
                  </div>
                </div>

                {/* 3. Current Invested Base */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">Current Portfolio Base</label>
                    <button
                      type="button"
                      onClick={() => setIsSavingsSynced(!isSavingsSynced)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                        isSavingsSynced 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isSavingsSynced ? '✓ Live Net Worth' : 'Custom'}
                    </button>
                  </div>
                  {isSavingsSynced ? (
                    <div className="text-lg font-mono font-bold text-emerald-400">
                      {formatMoney(activeCurrentWealth)}
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={customCurrentPortfolio}
                      onChange={e => setCustomCurrentPortfolio(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-sm font-mono font-semibold text-white focus:border-amber-500"
                    />
                  )}
                  <p className="text-[10px] text-zinc-400">
                    Covers {fireCalculations.yearsFundedToday} years of expenses today
                  </p>
                </div>

                {/* 4. Monthly Investment / Savings */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">Monthly Contribution</label>
                    <button
                      type="button"
                      onClick={() => setIsContributionSynced(!isContributionSynced)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                        isContributionSynced 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isContributionSynced ? '✓ Live Savings' : 'Custom'}
                    </button>
                  </div>
                  {isContributionSynced ? (
                    <div className="text-lg font-mono font-bold text-cyan-400">
                      {formatMoney(activeMonthlyContribution)}
                      <span className="text-[11px] text-zinc-400 font-normal ml-2">/month</span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={customMonthlyInvestment}
                      onChange={e => setCustomMonthlyInvestment(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-sm font-mono font-semibold text-white focus:border-amber-500"
                    />
                  )}
                  <p className="text-[10px] text-zinc-400">
                    Annual addition: {formatMoney(activeMonthlyContribution * 12)}/yr
                  </p>
                </div>

                {/* 5. Expected Return Rate (CAGR) */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">Expected Annual Return</label>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {annualReturnRate}% CAGR
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4.0"
                    max="14.0"
                    step="0.5"
                    value={annualReturnRate}
                    onChange={e => setAnnualReturnRate(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                    <span>4% (Bond/Cons)</span>
                    <span className="text-emerald-400 font-bold">8% (Balanced Index)</span>
                    <span>14% (Aggressive)</span>
                  </div>
                </div>

                {/* 6. Age & Target Horizon */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">Current & Target Age</label>
                    <span className="text-xs font-mono font-bold text-purple-400">
                      Age {currentAge} → {targetRetirementAge} ({fireCalculations.yearsUntilRetirement} yrs)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Current Age</span>
                      <input
                        type="number"
                        min="18"
                        max="70"
                        value={currentAge}
                        onChange={e => setCurrentAge(parseInt(e.target.value) || 30)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Target FIRE Age</span>
                      <input
                        type="number"
                        min={currentAge + 1}
                        max="85"
                        value={targetRetirementAge}
                        onChange={e => setTargetRetirementAge(parseInt(e.target.value) || 50)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Coast FIRE & Freedom Ladder */}
            <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Coast FIRE Checkpoint</h3>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-cyan-500/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Coast Target (at age {currentAge})</span>
                    <span className="text-sm font-mono font-bold text-cyan-400">
                      {formatMoney(fireCalculations.coastFireTarget)}
                    </span>
                  </div>

                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fireCalculations.coastProgressPct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {fireCalculations.isCoastAchieved ? (
                      <span className="text-emerald-400 font-semibold">
                        🎉 Coast FIRE Unlocked! Your current investments will compound to {formatMoney(fireCalculations.fireNumber)} by age {targetRetirementAge} without saving another dollar.
                      </span>
                    ) : (
                      <span>
                        Save {formatMoney(Math.max(0, fireCalculations.coastFireTarget - activeCurrentWealth))} more to let compound interest carry you completely to retirement.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Freedom Stages Ladder */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Freedom Ladder Stages
                </span>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className={`p-2 rounded-xl flex items-center justify-between ${
                    fireCalculations.progressPct >= 10 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-zinc-950/60 text-zinc-500'
                  }`}>
                    <span>1. Debt Freedom & Vault</span>
                    <span>{fireCalculations.progressPct >= 10 ? '✓ Reached' : 'Pending'}</span>
                  </div>

                  <div className={`p-2 rounded-xl flex items-center justify-between ${
                    fireCalculations.progressPct >= 25 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-zinc-950/60 text-zinc-500'
                  }`}>
                    <span>2. 5-Yr Runway Buffer (25%)</span>
                    <span>{fireCalculations.progressPct >= 25 ? '✓ Reached' : 'Pending'}</span>
                  </div>

                  <div className={`p-2 rounded-xl flex items-center justify-between ${
                    fireCalculations.isCoastAchieved ? 'bg-cyan-500/10 text-cyan-300' : 'bg-zinc-950/60 text-zinc-500'
                  }`}>
                    <span>3. Coast FIRE Secured</span>
                    <span>{fireCalculations.isCoastAchieved ? '✓ Reached' : 'Pending'}</span>
                  </div>

                  <div className={`p-2 rounded-xl flex items-center justify-between ${
                    fireCalculations.progressPct >= 100 ? 'bg-amber-500/20 text-amber-300 font-bold' : 'bg-zinc-950/60 text-zinc-500'
                  }`}>
                    <span>4. Full Financial Independence</span>
                    <span>{fireCalculations.progressPct >= 100 ? '🔥 ACHIEVED!' : `${fireCalculations.yearsToFire} yrs away`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trinity 25x / 30x / 33x Comparison Table */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Withdrawal Rate & Multiplier Comparison</h3>
                <p className="text-[11px] text-zinc-400">Comparing different safety margins for your {formatMoney(effectiveAnnualExpense)} annual burn</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {[
                { label: 'Aggressive (5.0% SWR)', mult: '20x', amount: Math.round(effectiveAnnualExpense * 20), risk: 'High (suitable for shorter horizons or flex spending)' },
                { label: 'Standard Trinity (4.0% SWR)', mult: '25x', amount: Math.round(effectiveAnnualExpense * 25), risk: 'Standard (historical 95%+ 30yr survival)' },
                { label: 'Conservative (3.33% SWR)', mult: '30x', amount: Math.round(effectiveAnnualExpense * 30), risk: 'Very Safe (ideal for early 40+ year retirements)' },
                { label: 'Ultra Perpetual (3.0% SWR)', mult: '33.3x', amount: Math.round(effectiveAnnualExpense * 33.33), risk: 'Zero Capital Erosion (intergenerational legacy)' },
              ].map((tier, idx) => (
                <div 
                  key={idx}
                  className={`p-3.5 rounded-2xl border ${
                    fireCalculations.ruleMultiplier === parseInt(tier.mult)
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold">{tier.label}</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">{tier.mult}</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-white mt-1">
                    {formatMoney(tier.amount)}
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1 leading-normal">{tier.risk}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deposit to Goal Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100">
            <h3 className="text-sm font-bold text-zinc-100">Contribute to Milestone</h3>
            <form onSubmit={handleDeposit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Deposit Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={depositAmount}
                  onChange={e => setDepositAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-base font-mono font-semibold text-white focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-semibold"
                >
                  Confirm Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Goal Modal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100 my-8">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">Define New Financial Milestone</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddGoalModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Goal Name</label>
                <input
                  type="text"
                  required
                  value={newGoalName}
                  onChange={e => setNewGoalName(e.target.value)}
                  placeholder="e.g. Wedding, Tokyo Trip, FIRE Portfolio, New Car"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Category</label>
                <select
                  value={newGoalCategory}
                  onChange={e => setNewGoalCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:border-emerald-500"
                >
                  <option value="Savings & Investment">Savings & Investment</option>
                  <option value="Vehicle">Vehicle / Transport</option>
                  <option value="Housing">Real Estate / Housing</option>
                  <option value="Travel">Travel & Vacation</option>
                  <option value="Education">Higher Education</option>
                  <option value="Family & Life">Family & Life Events</option>
                  <option value="Financial Independence">Financial Independence (FIRE)</option>
                  <option value="Business">Business Venture</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Target Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newGoalTarget}
                    onChange={e => setNewGoalTarget(e.target.value)}
                    placeholder="10000"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Initial Saved</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newGoalInitial}
                    onChange={e => setNewGoalInitial(e.target.value)}
                    placeholder="0"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Integrated Goal Tenure & Select/View Date Controls */}
              <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Milestone Tenure & Timeline</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {formatTenureLabel(newGoalTenureMonths)} ({newGoalTenureMonths} Mos)
                  </span>
                </div>

                {/* Quick Tenure Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 font-medium">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '3M', months: 3 },
                      { label: '6M', months: 6 },
                      { label: '1Y', months: 12 },
                      { label: '2Y', months: 24 },
                      { label: '3Y', months: 36 },
                      { label: '5Y', months: 60 },
                      { label: '7Y', months: 84 },
                      { label: '10Y', months: 120 },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setNewGoalTenureMonths(preset.months);
                          setNewGoalDate(calculateDateFromTenureMonths(preset.months));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          newGoalTenureMonths === preset.months
                            ? 'bg-emerald-500 text-zinc-950 font-bold shadow-sm'
                            : 'bg-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select & View Target Date Panel */}
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Select / View Target Date</span>
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {getRemainingTimeLabel(newGoalDate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    <div>
                      <input
                        type="date"
                        required
                        value={newGoalDate}
                        onChange={e => {
                          setNewGoalDate(e.target.value);
                          const m = calculateTenureMonthsFromDate(e.target.value);
                          setNewGoalTenureMonths(m);
                        }}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:border-cyan-500"
                      />
                    </div>
                    <div className="text-left px-1">
                      <span className="text-[10px] text-zinc-500 block">Target Completion:</span>
                      <span className="text-xs font-bold text-cyan-300 font-mono block">
                        {formatDateFriendly(newGoalDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dual Tenure Fine-Tuning */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 block mb-1">Tenure in Years</span>
                    <input
                      type="number"
                      min="0.1"
                      max="30"
                      step="0.5"
                      value={(newGoalTenureMonths / 12).toFixed(1).replace(/\.0$/, '')}
                      onChange={e => {
                        const yrs = parseFloat(e.target.value) || 0;
                        const m = Math.max(1, Math.round(yrs * 12));
                        setNewGoalTenureMonths(m);
                        setNewGoalDate(calculateDateFromTenureMonths(m));
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-100 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block mb-1">Tenure in Months</span>
                    <input
                      type="number"
                      min="1"
                      max="360"
                      value={newGoalTenureMonths}
                      onChange={e => {
                        const m = Math.max(1, parseInt(e.target.value) || 1);
                        setNewGoalTenureMonths(m);
                        setNewGoalDate(calculateDateFromTenureMonths(m));
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-100 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Planned Monthly Save */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Planned Monthly Save</label>
                <input
                  type="number"
                  step="0.01"
                  value={newGoalMonthly}
                  onChange={e => setNewGoalMonthly(e.target.value)}
                  placeholder={
                    newGoalTarget 
                      ? `${Math.max(1, Math.round(((parseFloat(newGoalTarget) || 0) - (parseFloat(newGoalInitial) || 0)) / (newGoalTenureMonths || 1)))}/mo`
                      : 'Optional'
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-emerald-500"
                />
              </div>

              {/* Real-time tenure contribution helper */}
              {newGoalTarget && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pace for {formatTenureLabel(newGoalTenureMonths)} ({formatDateFriendly(newGoalDate)}):</span>
                  </span>
                  <span className="font-mono font-bold">
                    {formatMoney(
                      Math.max(1, Math.round(((parseFloat(newGoalTarget) || 0) - (parseFloat(newGoalInitial) || 0)) / (newGoalTenureMonths || 1)))
                    )}/mo
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-md transition-colors"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Goal & Tenure Modal */}
      {goalToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100 my-8">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-zinc-100">Edit Goal & Tenure Settings</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setGoalToEdit(null)}
                className="p-1 text-zinc-400 hover:text-zinc-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Goal Name</label>
                <input
                  type="text"
                  required
                  value={editGoalName}
                  onChange={e => setEditGoalName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Category</label>
                <select
                  value={editGoalCategory}
                  onChange={e => setEditGoalCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:border-cyan-500"
                >
                  <option value="Savings & Investment">Savings & Investment</option>
                  <option value="Vehicle">Vehicle / Transport</option>
                  <option value="Housing">Real Estate / Housing</option>
                  <option value="Travel">Travel & Vacation</option>
                  <option value="Education">Higher Education</option>
                  <option value="Family & Life">Family & Life Events</option>
                  <option value="Financial Independence">Financial Independence (FIRE)</option>
                  <option value="Business">Business Venture</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Target Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editGoalTarget}
                    onChange={e => setEditGoalTarget(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Current Saved</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editGoalCurrent}
                    onChange={e => setEditGoalCurrent(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Integrated Goal Tenure & Select/View Date Controls */}
              <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Milestone Tenure & Timeline</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {formatTenureLabel(editGoalTenureMonths)} ({editGoalTenureMonths} Mos)
                  </span>
                </div>

                {/* Quick Tenure Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 font-medium">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '3M', months: 3 },
                      { label: '6M', months: 6 },
                      { label: '1Y', months: 12 },
                      { label: '2Y', months: 24 },
                      { label: '3Y', months: 36 },
                      { label: '5Y', months: 60 },
                      { label: '7Y', months: 84 },
                      { label: '10Y', months: 120 },
                    ].map(preset => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setEditGoalTenureMonths(preset.months);
                          setEditGoalDate(calculateDateFromTenureMonths(preset.months));
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          editGoalTenureMonths === preset.months
                            ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                            : 'bg-zinc-850 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select & View Target Date Panel */}
                <div className="p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Select / View Target Date</span>
                    </label>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      {getRemainingTimeLabel(editGoalDate)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                    <div>
                      <input
                        type="date"
                        required
                        value={editGoalDate}
                        onChange={e => {
                          setEditGoalDate(e.target.value);
                          const m = calculateTenureMonthsFromDate(e.target.value);
                          setEditGoalTenureMonths(m);
                        }}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:border-cyan-500"
                      />
                    </div>
                    <div className="text-left px-1">
                      <span className="text-[10px] text-zinc-500 block">Target Completion:</span>
                      <span className="text-xs font-bold text-cyan-300 font-mono block">
                        {formatDateFriendly(editGoalDate)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dual Tenure Fine-Tuning */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 block mb-1">Tenure in Years</span>
                    <input
                      type="number"
                      min="0.1"
                      max="30"
                      step="0.5"
                      value={(editGoalTenureMonths / 12).toFixed(1).replace(/\.0$/, '')}
                      onChange={e => {
                        const yrs = parseFloat(e.target.value) || 0;
                        const m = Math.max(1, Math.round(yrs * 12));
                        setEditGoalTenureMonths(m);
                        setEditGoalDate(calculateDateFromTenureMonths(m));
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-100 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block mb-1">Tenure in Months</span>
                    <input
                      type="number"
                      min="1"
                      max="360"
                      value={editGoalTenureMonths}
                      onChange={e => {
                        const m = Math.max(1, parseInt(e.target.value) || 1);
                        setEditGoalTenureMonths(m);
                        setEditGoalDate(calculateDateFromTenureMonths(m));
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-zinc-100 focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Planned Monthly Save */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Planned Monthly Save</label>
                <input
                  type="number"
                  step="0.01"
                  value={editGoalMonthly}
                  onChange={e => setNewGoalMonthly ? setEditGoalMonthly(e.target.value) : undefined}
                  placeholder="Optional"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Notes / Strategy</label>
                <input
                  type="text"
                  value={editGoalNotes}
                  onChange={e => setEditGoalNotes(e.target.value)}
                  placeholder="e.g. SIP in Index Funds, aggressive saving plan"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-cyan-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex items-center justify-between text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Required Pace for {formatTenureLabel(editGoalTenureMonths)} ({formatDateFriendly(editGoalDate)}):</span>
                </span>
                <span className="font-mono font-bold">
                  {formatMoney(
                    Math.max(1, Math.round(((parseFloat(editGoalTarget) || 0) - (parseFloat(editGoalCurrent) || 0)) / (editGoalTenureMonths || 1)))
                  )}/mo
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setGoalToEdit(null)}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold shadow-md transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Defense Vault Add / Edit Modal */}
      {(isAddEssentialModalOpen || essentialGoalToEdit) && (
        <EmergencyGoalModal
          isOpen={isAddEssentialModalOpen || !!essentialGoalToEdit}
          onClose={() => {
            setIsAddEssentialModalOpen(false);
            setEssentialGoalToEdit(null);
          }}
          onSave={addEssentialGoal}
          onUpdate={updateEssentialGoal}
          onDelete={deleteEssentialGoal}
          goalToEdit={essentialGoalToEdit}
          monthlyExpenses={monthlyExpenses}
          formatMoney={formatMoney}
        />
      )}

      {/* Deposit to Essential Defense Vault Modal */}
      {depositEssentialId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Deposit to Defense Vault</h3>
                  <p className="text-[11px] text-zinc-400">
                    {essentialGoals.find(g => g.id === depositEssentialId)?.name || 'Defense Vault'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDepositEssentialId(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositEssential} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Deposit Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  autoFocus
                  value={depositEssentialAmount}
                  onChange={e => setDepositEssentialAmount(e.target.value)}
                  placeholder="500"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-base font-mono font-semibold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Quick presets */}
              <div className="flex items-center gap-1.5 pt-1">
                {[100, 250, 500, 1000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositEssentialAmount(amt.toString())}
                    className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-300 transition-colors"
                  >
                    +${amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setDepositEssentialId(null)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all shadow-md"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Essential Goal Confirmation Modal */}
      {essentialGoalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Delete Defense Vault?</h3>
                <p className="text-xs text-zinc-400">Are you sure you want to remove &quot;{essentialGoalToDelete.name}&quot;?</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/50 p-3 rounded-xl border border-zinc-800">
              This vault currently holds <span className="font-mono text-zinc-200 font-bold">{formatMoney(essentialGoalToDelete.currentAmount)}</span>. Removing it will update your emergency statistics.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEssentialGoalToDelete(null)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEssential}
                className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-xs transition-all shadow-md shadow-red-950/40"
              >
                Delete Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
