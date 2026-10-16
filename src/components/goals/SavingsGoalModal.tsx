import React, { useState, useEffect } from 'react';
import { 
  Target, 
  X, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Check, 
  PiggyBank, 
  Home, 
  Car, 
  Plane, 
  GraduationCap, 
  Heart, 
  Smartphone, 
  Briefcase, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { CustomGoal } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: Omit<CustomGoal, 'id'>) => void;
  onUpdate?: (id: string, updates: Partial<CustomGoal>) => void;
  goalToEdit?: CustomGoal | null;
}

const CATEGORY_OPTIONS = [
  { label: 'Emergency Fund', icon: ShieldCheck, defaultColor: '#10b981' },
  { label: 'Real Estate / Home', icon: Home, defaultColor: '#3b82f6' },
  { label: 'Vehicle / Car', icon: Car, defaultColor: '#f59e0b' },
  { label: 'Travel & Vacation', icon: Plane, defaultColor: '#ec4899' },
  { label: 'Higher Education', icon: GraduationCap, defaultColor: '#8b5cf6' },
  { label: 'Retirement & FIRE', icon: Target, defaultColor: '#06b6d4' },
  { label: 'Wedding & Family', icon: Heart, defaultColor: '#f43f5e' },
  { label: 'Gadgets & Tech', icon: Smartphone, defaultColor: '#6366f1' },
  { label: 'Business & Career', icon: Briefcase, defaultColor: '#14b8a6' },
  { label: 'General Savings', icon: PiggyBank, defaultColor: '#10b981' },
];

const COLOR_PALETTE = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#f43f5e', // rose
  '#6366f1', // indigo
];

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  goalToEdit
}) => {
  const { theme, currency, formatMoney } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const [name, setName] = useState('');
  const [category, setCategory] = useState('General Savings');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#10b981');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set default target date: 1 year from now
  const defaultFutureDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (goalToEdit) {
        setName(goalToEdit.name || '');
        setCategory(goalToEdit.category || 'General Savings');
        setTargetAmount(goalToEdit.targetAmount ? String(goalToEdit.targetAmount) : '');
        setCurrentAmount(goalToEdit.currentAmount !== undefined ? String(goalToEdit.currentAmount) : '0');
        setTargetDate(goalToEdit.targetDate || defaultFutureDate());
        setColor(goalToEdit.color || '#10b981');
        setNotes(goalToEdit.notes || '');
      } else {
        setName('');
        setCategory('General Savings');
        setTargetAmount('');
        setCurrentAmount('0');
        setTargetDate(defaultFutureDate());
        setColor('#10b981');
        setNotes('');
      }
    }
  }, [isOpen, goalToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetVal = parseFloat(targetAmount);
    const currentVal = parseFloat(currentAmount) || 0;

    if (!name.trim()) {
      setErrorMessage('Please enter a name for your savings goal.');
      return;
    }

    if (isNaN(targetVal) || targetVal <= 0) {
      setErrorMessage('Please enter a target amount greater than zero.');
      return;
    }

    if (currentVal < 0) {
      setErrorMessage('Current savings amount cannot be negative.');
      return;
    }

    // Calculate tenure in months
    const dateObj = new Date(targetDate || defaultFutureDate());
    const now = new Date();
    const monthsDiff = (dateObj.getFullYear() - now.getFullYear()) * 12 + (dateObj.getMonth() - now.getMonth());
    const tenureMonths = Math.max(1, monthsDiff);
    const tenureYears = parseFloat((tenureMonths / 12).toFixed(1));

    const remainingToSave = Math.max(0, targetVal - currentVal);
    const monthlyContribution = Math.max(1, Math.round(remainingToSave / tenureMonths));

    if (goalToEdit && onUpdate) {
      onUpdate(goalToEdit.id, {
        name: name.trim(),
        category,
        targetAmount: targetVal,
        currentAmount: currentVal,
        targetDate: targetDate || defaultFutureDate(),
        tenureMonths,
        tenureYears,
        monthlyContribution,
        color,
        notes: notes.trim(),
        isCompleted: currentVal >= targetVal
      });
    } else {
      onSave({
        name: name.trim(),
        category,
        targetAmount: targetVal,
        currentAmount: currentVal,
        targetDate: targetDate || defaultFutureDate(),
        tenureMonths,
        tenureYears,
        monthlyContribution,
        color,
        icon: 'Target',
        notes: notes.trim(),
        isCompleted: currentVal >= targetVal
      });
    }

    onClose();
  };

  const handleSelectPresetCategory = (catName: string, defaultCol: string) => {
    setCategory(catName);
    setColor(defaultCol);
  };

  return (
    <div
      id="savings-goal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="savings-goal-modal-title"
    >
      <div
        id="savings-goal-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 transition-all max-h-[92vh] overflow-y-auto no-scrollbar ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40'
            : 'bg-zinc-950 border-zinc-800 text-zinc-100 shadow-black/80 ring-1 ring-zinc-700/50'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
              style={{ backgroundColor: color }}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="savings-goal-modal-title"
                className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {goalToEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set a target amount and category with visual progress tracking.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Goal Name / Description *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dream House Down Payment, Vacation Fund"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                isLight
                  ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-blue-500 text-slate-900'
                  : 'bg-zinc-900 border-zinc-800 focus:bg-zinc-900 focus:border-blue-500 text-white'
              }`}
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => handleSelectPresetCategory(cat.label, cat.defaultColor)}
                    className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-xs'
                          : 'border-blue-500 bg-blue-950/60 text-blue-300 font-bold'
                        : isLight
                        ? 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                        : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: isSelected ? undefined : cat.defaultColor }} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Amount & Current Saved Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Amount ({currency}) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 500000"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono font-bold outline-none transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-blue-500 text-slate-900'
                      : 'bg-zinc-900 border-zinc-800 focus:bg-zinc-900 focus:border-blue-500 text-white'
                  }`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Current Saved Amount ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono font-bold outline-none transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-blue-500 text-slate-900'
                    : 'bg-zinc-900 border-zinc-800 focus:bg-zinc-900 focus:border-blue-500 text-white'
                }`}
              />
            </div>
          </div>

          {/* Live Progress Preview if amounts entered */}
          {parseFloat(targetAmount) > 0 && (
            <div
              className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-zinc-900/80 border-zinc-800 text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span>Progress Preview:</span>
                <span className="font-bold" style={{ color }}>
                  {Math.min(100, Math.round(((parseFloat(currentAmount) || 0) / parseFloat(targetAmount)) * 100))}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: color,
                    width: `${Math.min(100, Math.max(0, ((parseFloat(currentAmount) || 0) / parseFloat(targetAmount)) * 100))}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Target Date & Color Palette */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Completion Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono outline-none ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-zinc-900 border-zinc-800 text-white'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Goal Color Theme
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_PALETTE.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ring-offset-2 hover:scale-110"
                    style={{
                      backgroundColor: col,
                      boxShadow: color === col ? `0 0 0 2px ${col}` : undefined
                    }}
                  >
                    {color === col && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Notes / Strategy (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. SIP in index mutual funds or RD with high interest"
              className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${
                isLight
                  ? 'bg-slate-50 border-slate-300 text-slate-900'
                  : 'bg-zinc-900 border-zinc-800 text-white'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isLight
                  ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{goalToEdit ? 'Save Changes' : 'Create Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
