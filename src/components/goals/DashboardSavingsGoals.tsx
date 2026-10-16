import React, { useState, useMemo } from 'react';
import { 
  Target, 
  Plus, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  PiggyBank, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Coins,
  AlertCircle,
  Home,
  Car,
  Plane,
  GraduationCap,
  Heart,
  Smartphone,
  Briefcase
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CustomGoal } from '../../types';
import { SavingsGoalModal } from './SavingsGoalModal';
import { ConfirmationModal } from '../ConfirmationModal';

// Category icon mapper
const getCategoryIcon = (category: string) => {
  const lower = (category || '').toLowerCase();
  if (lower.includes('home') || lower.includes('real estate') || lower.includes('house')) return Home;
  if (lower.includes('car') || lower.includes('vehicle')) return Car;
  if (lower.includes('travel') || lower.includes('vacation') || lower.includes('trip')) return Plane;
  if (lower.includes('education') || lower.includes('college') || lower.includes('school')) return GraduationCap;
  if (lower.includes('emergency') || lower.includes('safety') || lower.includes('shield')) return ShieldCheck;
  if (lower.includes('wedding') || lower.includes('family') || lower.includes('marriage')) return Heart;
  if (lower.includes('gadget') || lower.includes('tech') || lower.includes('phone')) return Smartphone;
  if (lower.includes('business') || lower.includes('career')) return Briefcase;
  return PiggyBank;
};

// Calculate days and daily savings needed
export const calculateDailySavings = (targetAmount: number, currentAmount: number, targetDateStr: string) => {
  const remaining = Math.max(0, targetAmount - currentAmount);
  if (remaining <= 0) {
    return {
      remaining: 0,
      daysRemaining: 0,
      dailyNeeded: 0,
      monthlyNeeded: 0,
      isCompleted: true,
      formattedDate: 'Completed'
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  targetDate.setHours(0, 0, 0, 0);

  const diffTimeMs = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTimeMs / (1000 * 60 * 60 * 24)));
  const dailyNeeded = Math.ceil(remaining / daysRemaining);
  const monthlyNeeded = Math.ceil(remaining / Math.max(1, daysRemaining / 30.4));

  const formattedDate = targetDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    remaining,
    daysRemaining,
    dailyNeeded,
    monthlyNeeded,
    isCompleted: false,
    formattedDate
  };
};

export const DashboardSavingsGoals: React.FC = () => {
  const { 
    customGoals = [], 
    addCustomGoal, 
    updateCustomGoal, 
    deleteCustomGoal, 
    contributeToGoal,
    formatMoney, 
    currency, 
    setActiveTab, 
    theme 
  } = useFinance();

  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Modals state
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<CustomGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<CustomGoal | null>(null);
  
  // Quick deposit modal state
  const [contributeGoal, setContributeGoal] = useState<CustomGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeSuccess, setContributeSuccess] = useState<string | null>(null);

  // Overall statistics
  const stats = useMemo(() => {
    let totalTarget = 0;
    let totalSaved = 0;
    let totalDailyNeeded = 0;

    customGoals.forEach(g => {
      totalTarget += g.targetAmount || 0;
      totalSaved += g.currentAmount || 0;
      const { dailyNeeded, isCompleted } = calculateDailySavings(g.targetAmount, g.currentAmount, g.targetDate);
      if (!isCompleted) {
        totalDailyNeeded += dailyNeeded;
      }
    });

    const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

    return {
      totalTarget,
      totalSaved,
      totalDailyNeeded,
      overallPct
    };
  }, [customGoals]);

  const handleQuickContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;
    const amountVal = parseFloat(contributeAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    contributeToGoal(contributeGoal.id, amountVal);
    setContributeSuccess(`Added ${formatMoney(amountVal)} to ${contributeGoal.name}!`);
    setTimeout(() => {
      setContributeSuccess(null);
      setContributeGoal(null);
      setContributeAmount('');
    }, 1200);
  };

  return (
    <div 
      id="dashboard-savings-goals-section"
      className={`p-5 sm:p-6 rounded-3xl border space-y-5 transition-all ${
        isLight
          ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
          : 'bg-zinc-950/90 border-zinc-800/90 text-zinc-100 shadow-xl'
      }`}
    >
      {/* 1. Header with Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Savings Goals
              </h2>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {customGoals.length} {customGoals.length === 1 ? 'Goal' : 'Goals'} Active
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set target amounts and categories with automatic daily savings pace calculation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-add-dashboard-savings-goal"
            onClick={() => {
              setGoalToEdit(null);
              setIsAddGoalModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Set Savings Goal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
              isLight
                ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
            }`}
            title="Open Full Goals Command Hub"
          >
            <span>Goals Hub</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Metrics Banner */}
      {customGoals.length > 0 && (
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isLight
            ? 'bg-gradient-to-r from-blue-50/60 via-slate-50 to-emerald-50/40 border-slate-200'
            : 'bg-gradient-to-r from-blue-950/30 via-zinc-900 to-emerald-950/20 border-zinc-800/80'
        }`}>
          {/* Left: Saved vs Target */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shrink-0">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">
                  {formatMoney(stats.totalSaved)}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  of {formatMoney(stats.totalTarget)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Total Saved Across All Goals ({stats.overallPct}% Overall Progress)
              </p>
            </div>
          </div>

          {/* Right: Daily Pace Needed */}
          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 dark:border-zinc-800 pt-3 md:pt-0 md:pl-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {formatMoney(stats.totalDailyNeeded)}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  / day total pace
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Combined daily savings required to hit target dates
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Goals Cards Grid */}
      {customGoals.length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border border-dashed ${
          isLight ? 'border-slate-300 bg-slate-50/50' : 'border-zinc-800 bg-zinc-900/30'
        } space-y-3`}>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Savings Goals Set Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Define your financial milestones with a target amount, category, and target date. We will track your progress and calculate exactly how much you need to save each day.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setGoalToEdit(null);
              setIsAddGoalModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Your First Savings Goal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {customGoals.map((goal) => {
            const Icon = getCategoryIcon(goal.category);
            const currentAmount = goal.currentAmount || 0;
            const targetAmount = goal.targetAmount || 1;
            const percentage = Math.min(100, Math.round((currentAmount / targetAmount) * 100));
            const goalColor = goal.color || '#10b981';

            const { 
              remaining, 
              daysRemaining, 
              dailyNeeded, 
              monthlyNeeded, 
              isCompleted, 
              formattedDate 
            } = calculateDailySavings(targetAmount, currentAmount, goal.targetDate);

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all hover:border-blue-500/40 ${
                  isLight 
                    ? 'bg-slate-50/70 border-slate-200/90 hover:bg-white shadow-2xs' 
                    : 'bg-zinc-900/70 border-zinc-800/80 hover:bg-zinc-900 shadow-2xs'
                }`}
              >
                <div className="space-y-3">
                  {/* Top: Category Badge & Target Date */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: goalColor }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-semibold truncate text-slate-700 dark:text-slate-300">
                        {goal.category || 'General Savings'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setGoalToEdit(goal);
                          setIsAddGoalModalOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit goal"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setGoalToDelete(goal)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Goal Title */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
                      {goal.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Target: {formattedDate}</span>
                      <span>•</span>
                      <span>{isCompleted ? 'Goal Reached' : `${daysRemaining} days left`}</span>
                    </div>
                  </div>

                  {/* Amounts & Percentage Badge */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Current Savings
                      </div>
                      <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                        {formatMoney(currentAmount)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Target Goal
                      </div>
                      <div className="text-sm font-bold font-mono text-slate-600 dark:text-slate-300">
                        {formatMoney(targetAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500 font-medium">Progress Completed</span>
                      <span className="font-bold" style={{ color: goalColor }}>
                        {percentage}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: goalColor
                        }}
                      />
                    </div>
                  </div>

                  {/* Daily Savings Needed Highlight Box */}
                  <div className={`p-2.5 rounded-xl border text-xs ${
                    isCompleted 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                      : isLight
                      ? 'bg-blue-50/60 border-blue-100 text-slate-700'
                      : 'bg-blue-950/30 border-blue-900/40 text-blue-200'
                  }`}>
                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>100% Target Met! Milestone Achieved</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span>Daily Savings Needed:</span>
                          </span>
                          <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                            {formatMoney(dailyNeeded)}/day
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          <span>Remaining: {formatMoney(remaining)}</span>
                          <span>≈ {formatMoney(monthlyNeeded)}/mo</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setContributeGoal(goal);
                      setContributeAmount('1000');
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isLight
                        ? 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs hover:border-emerald-300'
                        : 'bg-zinc-800 hover:bg-emerald-950/40 text-emerald-400 border border-zinc-700 hover:border-emerald-500/40'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-500" />
                    <span>+ Add Savings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('goals')}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-blue-500 transition-colors cursor-pointer"
                    title="View in Goals Hub"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Quick Contribution Modal */}
      {contributeGoal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setContributeGoal(null)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl border p-5 sm:p-6 space-y-4 shadow-2xl transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-zinc-950 border-zinc-800 text-white'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Savings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                  {contributeGoal.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContributeGoal(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {contributeSuccess ? (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{contributeSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleQuickContributeSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Deposit Amount ({currency})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    autoFocus
                    value={contributeAmount}
                    onChange={e => setContributeAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-emerald-500 text-slate-900'
                        : 'bg-zinc-900 border-zinc-800 focus:bg-zinc-900 focus:border-emerald-500 text-white'
                    }`}
                  />
                </div>

                {/* Quick Preset Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[500, 1000, 5000, 10000, 25000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setContributeAmount(String(val))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer ${
                        contributeAmount === String(val)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : isLight
                          ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      +{formatMoney(val)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setContributeGoal(null)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    Confirm Deposit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. Savings Goal Create / Edit Modal */}
      <SavingsGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => {
          setIsAddGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        onSave={(data) => {
          addCustomGoal(data);
        }}
        onUpdate={(id, updates) => {
          updateCustomGoal(id, updates);
        }}
        goalToEdit={goalToEdit}
      />

      {/* 6. Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!goalToDelete}
        onClose={() => setGoalToDelete(null)}
        onConfirm={() => {
          if (goalToDelete) {
            deleteCustomGoal(goalToDelete.id);
            setGoalToDelete(null);
          }
        }}
        title="Delete Savings Goal"
        description="Are you sure you want to delete this savings goal? This will remove the target and calculations from your dashboard."
        itemType="goal"
        itemName={goalToDelete?.name}
        confirmButtonText="Delete Goal"
      />
    </div>
  );
};
