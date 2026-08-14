import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Target, 
  Plus, 
  Trash2, 
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
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext';
import { GoalsSubTab, CustomGoal, EssentialGoal } from '../../types';

export const GoalsView: React.FC = () => {
  const { 
    goalsSubTab, 
    setGoalsSubTab, 
    essentialGoals, 
    customGoals, 
    formatMoney, 
    monthlyExpenses, 
    liquidCash, 
    liquidRunwayMonths,
    updateEssentialGoal,
    addCustomGoal,
    updateCustomGoal,
    deleteCustomGoal,
    contributeToGoal
  } = useFinance();

  // Deposit modal state
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>('');

  // New goal modal state
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Savings & Investment');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalInitial, setNewGoalInitial] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('2027-01-01');
  const [newGoalMonthly, setNewGoalMonthly] = useState('');

  // Emergency target months slider state
  const [emergencyTargetMonths, setEmergencyTargetMonths] = useState(6);

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

    addCustomGoal({
      name: newGoalName.trim(),
      category: newGoalCategory,
      targetAmount: target,
      currentAmount: initial,
      targetDate: newGoalDate,
      monthlyContribution: parseFloat(newGoalMonthly) || Math.round((target - initial) / 12),
      color: '#10b981',
      icon: 'Target',
    });

    setIsAddGoalModalOpen(false);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalInitial('');
  };

  const calculatedEmergencyNeeded = monthlyExpenses * emergencyTargetMonths;
  const emergencyFundPercent = calculatedEmergencyNeeded > 0 
    ? Math.min(100, Math.round((liquidCash / calculatedEmergencyNeeded) * 100)) 
    : 100;

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* 2 Sub-Tabs Bar: Essential & Goals */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs w-full sm:w-auto">
        <button
          id="tab-goals-essential"
          onClick={() => setGoalsSubTab('essential')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all flex-1 sm:flex-initial justify-center ${
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
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all flex-1 sm:flex-initial justify-center ${
            goalsSubTab === 'goals'
              ? 'bg-zinc-800 text-cyan-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Milestones & Goals ({customGoals.length})</span>
        </button>
      </div>

      {/* 1. ESSENTIAL TAB */}
      {goalsSubTab === 'essential' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Emergency Runway Simulator Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Primary Safety Runway
                </span>
                <h2 className="text-xl font-bold text-zinc-100 mt-0.5">
                  Emergency Defense Vault
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 font-medium block">Current Liquid Buffer</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {formatMoney(liquidCash)}
                </span>
              </div>
            </div>

            {/* Target months selector */}
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-medium">Target Runway Duration</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {emergencyTargetMonths} Months ({formatMoney(calculatedEmergencyNeeded)} needed)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[3, 6, 9, 12].map(m => (
                  <button
                    key={m}
                    onClick={() => setEmergencyTargetMonths(m)}
                    className={`flex-1 py-1.5 rounded-lg text-center font-semibold transition-all ${
                      emergencyTargetMonths === m
                        ? 'bg-emerald-500 text-zinc-950 shadow'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {m} Mo
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Bar & Status */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-zinc-400">{emergencyFundPercent}% Protected</span>
                <span className="text-emerald-400">{liquidRunwayMonths} months actual burn secured</span>
              </div>
              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${emergencyFundPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Essential Goals List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {essentialGoals.map(ess => {
              const pct = ess.targetAmount > 0 ? Math.min(100, Math.round((ess.currentAmount / ess.targetAmount) * 100)) : 100;
              return (
                <div key={ess.id} className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Essential Shield
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100">{ess.name}</h3>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{ess.notes}</p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">{pct}% Complete</span>
                      <span className="text-zinc-200 font-semibold">{formatMoney(ess.currentAmount)}</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. CUSTOM GOALS TAB */}
      {goalsSubTab === 'goals' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header & Add Goal Trigger */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Active Financial Milestones</h2>
              <p className="text-[11px] text-zinc-400">Track savings targets, life plans & FIRE numbers</p>
            </div>

            <button
              id="btn-add-custom-goal"
              onClick={() => setIsAddGoalModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New Goal</span>
            </button>
          </div>

          {/* Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customGoals.map(goal => {
              const progressPct = goal.targetAmount > 0 
                ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
                : 100;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

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

                      <button
                        onClick={() => deleteCustomGoal(goal.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {goal.notes && (
                      <p className="text-xs text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {goal.notes}
                      </p>
                    )}
                  </div>

                  {/* Progress Stats & Bar */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
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
                      <span>Target Date: {goal.targetDate}</span>
                      <span className="font-mono text-zinc-300">
                        {remaining === 0 ? '🎉 Milestone Met!' : `Remaining: ${formatMoney(remaining)}`}
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

      {/* Deposit to Goal Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100">
            <h3 className="text-sm font-bold text-zinc-100">Contribute to Milestone</h3>
            <form onSubmit={handleDeposit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Deposit Amount ($)</label>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100">
            <h3 className="text-sm font-bold text-zinc-100">Define New Financial Milestone</h3>
            <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  value={newGoalName}
                  onChange={e => setNewGoalName(e.target.value)}
                  placeholder="e.g. Wedding, Tokyo Trip, FIRE Portfolio"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Target Amount ($)</label>
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
                  <label className="block text-zinc-400 mb-1">Initial Saved ($)</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newGoalDate}
                    onChange={e => setNewGoalDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Planned Monthly Save ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newGoalMonthly}
                    onChange={e => setNewGoalMonthly(e.target.value)}
                    placeholder="Optional"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-semibold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
