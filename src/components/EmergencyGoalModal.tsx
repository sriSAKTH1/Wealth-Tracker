import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Trash2, 
  Check, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Calculator,
  HeartPulse,
  Briefcase,
  Home,
  Car,
  CreditCard,
  Lock,
  PiggyBank,
  AlertTriangle
} from 'lucide-react';
import { EssentialGoal } from '../types';

interface EmergencyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<EssentialGoal, 'id' | 'lastUpdated'>) => void;
  onUpdate?: (id: string, updates: Partial<EssentialGoal>) => void;
  onDelete?: (id: string) => void;
  goalToEdit?: EssentialGoal | null;
  monthlyExpenses?: number;
  formatMoney?: (amount: number) => string;
}

const PRESET_TEMPLATES = [
  {
    name: '6-Month Emergency Safety Vault',
    type: 'emergency_fund' as const,
    monthsMultiplier: 6,
    defaultAmount: 30000,
    notes: 'Liquid safety reserve kept in a High-Yield Savings Account (HYSA) or money market fund.',
    color: '#10b981',
    icon: 'ShieldCheck',
  },
  {
    name: 'Medical & Health Crisis Shield',
    type: 'medical_shield' as const,
    monthsMultiplier: 2,
    defaultAmount: 8000,
    notes: 'Dedicated buffer for out-of-pocket health deductibles and unexpected medical events.',
    color: '#06b6d4',
    icon: 'HeartPulse',
  },
  {
    name: 'Job Loss & Career Transition Buffer',
    type: 'essential_runway' as const,
    monthsMultiplier: 9,
    defaultAmount: 45000,
    notes: 'Extended runway to negotiate the next career step without financial stress.',
    color: '#8b5cf6',
    icon: 'Briefcase',
  },
  {
    name: 'Home Repair & Appliance Buffer',
    type: 'essential_runway' as const,
    monthsMultiplier: 0,
    defaultAmount: 10000,
    notes: 'Buffer for plumbing, roof, HVAC, or essential home maintenance.',
    color: '#f59e0b',
    icon: 'Home',
  },
  {
    name: 'Vehicle & Auto Breakdown Shield',
    type: 'essential_runway' as const,
    monthsMultiplier: 0,
    defaultAmount: 4000,
    notes: 'Dedicated fund for unexpected automotive repairs, tires, or insurance deductible.',
    color: '#3b82f6',
    icon: 'Car',
  },
  {
    name: 'Zero Consumer Debt Freedom',
    type: 'debt_snowball' as const,
    monthsMultiplier: 0,
    defaultAmount: 5000,
    notes: 'Eliminate high-interest credit cards and personal loans to secure baseline cashflow.',
    color: '#14b8a6',
    icon: 'CreditCard',
  },
];

const VAULT_COLORS = [
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#f43f5e', // Rose
];

export const EmergencyGoalModal: React.FC<EmergencyGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  goalToEdit,
  monthlyExpenses = 0,
  formatMoney = (amt: number) => `$${Math.round(amt).toLocaleString()}`,
}) => {
  const isEditing = !!goalToEdit;

  const [name, setName] = useState('');
  const [type, setType] = useState<EssentialGoal['type']>('emergency_fund');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetMonths, setTargetMonths] = useState<number | undefined>(6);
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#10b981');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (goalToEdit) {
      setName(goalToEdit.name);
      setType(goalToEdit.type || 'emergency_fund');
      setTargetAmount(goalToEdit.targetAmount.toString());
      setCurrentAmount(goalToEdit.currentAmount.toString());
      setTargetMonths(goalToEdit.targetMonths);
      setNotes(goalToEdit.notes || '');
      setColor(goalToEdit.color || '#10b981');
      setShowDeleteConfirm(false);
    } else {
      // Default to 6-month emergency fund
      setName('6-Month Emergency Safety Vault');
      setType('emergency_fund');
      const calculated = monthlyExpenses > 0 ? monthlyExpenses * 6 : 30000;
      setTargetAmount(calculated.toString());
      setCurrentAmount('0');
      setTargetMonths(6);
      setNotes('Kept in liquid 5.1% APY High-Yield Savings Account. Safety runway.');
      setColor('#10b981');
      setShowDeleteConfirm(false);
    }
  }, [goalToEdit, isOpen, monthlyExpenses]);

  if (!isOpen) return null;

  const applyTemplate = (template: typeof PRESET_TEMPLATES[0]) => {
    setName(template.name);
    setType(template.type);
    setColor(template.color);
    setNotes(template.notes);
    if (template.monthsMultiplier > 0 && monthlyExpenses > 0) {
      setTargetMonths(template.monthsMultiplier);
      setTargetAmount((monthlyExpenses * template.monthsMultiplier).toString());
    } else {
      setTargetMonths(undefined);
      setTargetAmount(template.defaultAmount.toString());
    }
  };

  const calculateMonths = (months: number) => {
    setTargetMonths(months);
    const amount = monthlyExpenses > 0 ? Math.round(monthlyExpenses * months) : months * 5000;
    setTargetAmount(amount.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tAmount = parseFloat(targetAmount) || 0;
    const cAmount = parseFloat(currentAmount) || 0;

    if (!name.trim()) return;

    if (isEditing && goalToEdit && onUpdate) {
      onUpdate(goalToEdit.id, {
        name: name.trim(),
        type,
        targetAmount: tAmount,
        currentAmount: cAmount,
        targetMonths,
        notes: notes.trim(),
        color,
      });
    } else {
      onSave({
        name: name.trim(),
        type,
        targetAmount: tAmount,
        currentAmount: cAmount,
        targetMonths,
        notes: notes.trim(),
        color,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (goalToEdit && onDelete) {
      onDelete(goalToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-950 font-bold shadow-md shrink-0"
              style={{ backgroundColor: color }}
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Safety & Runway Management
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-zinc-100">
                {isEditing ? 'Edit Emergency Defense Vault' : 'Add Emergency Defense Vault'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets (Only when adding new vault) */}
        {!isEditing && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Quick Vault Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: tmpl.color }}
                    />
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-emerald-300 truncate">
                      {tmpl.name.split(' ')[0]} {tmpl.name.split(' ')[1]}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block font-mono">
                    {tmpl.monthsMultiplier > 0 && monthlyExpenses > 0
                      ? `${tmpl.monthsMultiplier} Mo (${formatMoney(monthlyExpenses * tmpl.monthsMultiplier)})`
                      : formatMoney(tmpl.defaultAmount)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Vault Name & Category Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-zinc-400 mb-1 font-semibold">
                Vault / Shield Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. 6-Month Emergency Safety Vault"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">
                Shield Category
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                <option value="emergency_fund">Core Emergency Fund</option>
                <option value="medical_shield">Medical & Health Shield</option>
                <option value="essential_runway">Runway / Job Loss Buffer</option>
                <option value="debt_snowball">Debt Freedom Shield</option>
                <option value="insurance_buffer">Insurance Deductible Buffer</option>
                <option value="custom_vault">Custom Defense Vault</option>
              </select>
            </div>
          </div>

          {/* Quick Target Multipliers & Target Amount */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span>Calculate Target by Monthly Expense Burn</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                Current Burn: {formatMoney(monthlyExpenses)}/mo
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {[3, 6, 9, 12, 18].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => calculateMonths(m)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer ${
                    targetMonths === m
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {m} Months ({formatMoney(monthlyExpenses > 0 ? monthlyExpenses * m : m * 5000)})
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount & Current Funded Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">
                Target Amount ({formatMoney(parseFloat(targetAmount) || 0)}) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={targetAmount}
                onChange={e => {
                  setTargetAmount(e.target.value);
                  setTargetMonths(undefined);
                }}
                placeholder="30000"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 font-mono text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-semibold">
                Current Amount Funded ({formatMoney(parseFloat(currentAmount) || 0)})
              </label>
              <input
                type="number"
                step="0.01"
                value={currentAmount}
                onChange={e => setCurrentAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 font-mono text-sm text-zinc-100 font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Storage Location & Strategy Notes */}
          <div>
            <label className="block text-zinc-400 mb-1 font-semibold">
              Storage Location & Strategy Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Kept in 5.1% APY High Yield Savings Account or Fidelity SPAXX"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Color Tag Selector */}
          <div>
            <label className="block text-zinc-400 mb-1.5 font-semibold">
              Vault Color Theme
            </label>
            <div className="flex items-center gap-2">
              {VAULT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                    color === c ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Delete Confirmation Banner (when deleting inside edit) */}
          {showDeleteConfirm && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-bold text-xs">Confirm Deletion of this Vault?</span>
              </div>
              <p className="text-[11px] text-zinc-300">
                Are you sure you want to delete <strong className="text-white font-semibold">"{name}"</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-400"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {isEditing && onDelete ? (
              <div>
                {!showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Vault</span>
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{isEditing ? 'Save Changes' : 'Create Defense Vault'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
