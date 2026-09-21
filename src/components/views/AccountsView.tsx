import React, { useState } from 'react';
import { 
  DollarSign, 
  PieChart, 
  Wallet, 
  Activity, 
  Plus, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  Layers,
  Edit2,
  Check,
  ShieldCheck,
  X,
  RotateCcw,
  Sparkles,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { AccountSubTab, ExpenseCategory, AccountItem, BudgetEnvelope, Transaction } from '../../types';
import { INITIAL_BUDGETS } from '../../data/initialData';
import { ConfirmationModal } from '../ConfirmationModal';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Housing & Rent',
  'Food & Groceries',
  'Dining & Drinks',
  'Transportation',
  'Utilities & Bills',
  'Entertainment',
  'Health & Wellness',
  'Shopping & Tech',
  'Travel & Leisure',
  'Education',
  'Subscriptions',
  'Investments',
  'Other Expense',
];

const ENVELOPE_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#14b8a6', // Teal
  '#eab308', // Yellow
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#f97316', // Orange
];

export const AccountsView: React.FC = () => {
  const { 
    accountSubTab, 
    setAccountSubTab, 
    accounts = [], 
    budgets = [], 
    transactions = [], 
    currencyConfig,
    formatMoney, 
    totalAssets, 
    totalLiabilities, 
    netWorth, 
    liquidCash, 
    monthlyExpenses, 
    monthlyIncome, 
    liquidRunwayMonths,
    healthScore,
    debtToAssetRatio,
    updateBudget,
    addBudget,
    deleteBudget,
    addAccount,
    deleteAccount,
    deleteTransaction,
    openQuickAdd,
    currency,
    convertCurrency
  } = useFinance();

  // Deletion confirmation states
  const [accountToDelete, setAccountToDelete] = useState<AccountItem | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // New account modal state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccInstitution, setNewAccInstitution] = useState('');
  const [newAccType, setNewAccType] = useState<AccountItem['type']>('checking');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccMasked, setNewAccMasked] = useState('•••• 1234');

  // Budget editing & management state
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editBudgetAmount, setEditBudgetAmount] = useState<string>('');
  const [confirmDeleteBudgetEnvelopeId, setConfirmDeleteBudgetEnvelopeId] = useState<string | null>(null);

  // New budget envelope modal state
  const [isAddEnvelopeOpen, setIsAddEnvelopeOpen] = useState(false);
  const [newEnvCategory, setNewEnvCategory] = useState<string>('Food & Groceries');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [newEnvAmount, setNewEnvAmount] = useState('500');
  const [newEnvPeriod, setNewEnvPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [newEnvColor, setNewEnvColor] = useState('#10b981');

  // Calculate actual category spending from current transactions
  const categorySpendingMap = React.useMemo(() => {
    const map: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return map;
  }, [transactions]);

  const totalBudgetAllocated: number = budgets.reduce((s: number, b) => s + b.allocatedAmount, 0);
  const totalBudgetSpent: number = (Object.values(categorySpendingMap) as number[]).reduce((s: number, v: number) => s + v, 0);
  const budgetRemaining: number = Math.max(0, totalBudgetAllocated - totalBudgetSpent);

  const handleCreateEnvelope = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newEnvAmount);
    const categoryToUse = (isCustomCategory ? customCategoryName.trim() : newEnvCategory.trim()) as ExpenseCategory;
    if (isNaN(amount) || amount <= 0 || !categoryToUse) return;

    addBudget({
      category: categoryToUse,
      allocatedAmount: amount,
      period: newEnvPeriod,
      color: newEnvColor,
    });

    setIsAddEnvelopeOpen(false);
    setNewEnvAmount('500');
    setCustomCategoryName('');
    setIsCustomCategory(false);
  };

  const handleDeleteEnvelope = (id: string) => {
    deleteBudget(id);
    setConfirmDeleteBudgetEnvelopeId(null);
    if (editingBudgetId === id) {
      setEditingBudgetId(null);
    }
  };

  const handleRestoreDefaultBudgets = () => {
    INITIAL_BUDGETS.forEach(b => {
      addBudget({
        category: b.category,
        allocatedAmount: b.allocatedAmount,
        period: b.period,
        color: b.color || '#3b82f6',
      });
    });
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(newAccBalance);
    if (isNaN(bal) || !newAccName.trim()) return;

    addAccount({
      name: newAccName.trim(),
      institution: newAccInstitution.trim() || 'Bank',
      type: newAccType,
      balance: bal,
      accountNumberMasked: newAccMasked.trim(),
      currency: currency,
      color: '#10b981',
    });

    setIsAddAccountOpen(false);
    setNewAccName('');
    setNewAccBalance('');
  };

  const startEditBudget = (id: string, currentAllocated: number) => {
    setEditingBudgetId(id);
    setEditBudgetAmount(currentAllocated.toString());
  };

  const saveEditBudget = (id: string) => {
    const val = parseFloat(editBudgetAmount);
    if (!isNaN(val) && val >= 0) {
      updateBudget(id, val);
    }
    setEditingBudgetId(null);
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* 4 Sub-Tabs Bar: Money, Budget, Accounts, State */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
        <button
          id="tab-account-money"
          onClick={() => setAccountSubTab('money')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            accountSubTab === 'money'
              ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Money & Cashflow</span>
        </button>

        <button
          id="tab-account-budget"
          onClick={() => setAccountSubTab('budget')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            accountSubTab === 'budget'
              ? 'bg-zinc-800 text-cyan-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Budget Envelopes ({budgets.length})</span>
        </button>

        <button
          id="tab-account-accounts"
          onClick={() => setAccountSubTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            accountSubTab === 'accounts'
              ? 'bg-zinc-800 text-purple-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Accounts & Vaults ({accounts.length})</span>
        </button>

        <button
          id="tab-account-state"
          onClick={() => setAccountSubTab('state')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            accountSubTab === 'state'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Financial State Audit</span>
        </button>
      </div>

      {/* 1. MONEY TAB */}
      {accountSubTab === 'money' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Liquid Cash Reserves</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {formatMoney(liquidCash)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Instant availability in savings & checking</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Monthly Burn Rate</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {formatMoney(monthlyExpenses)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Average monthly outflow</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Liquid Cash Runway</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                {liquidRunwayMonths} Months
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Without any active income</p>
            </div>
          </div>

          {/* Cash flow stream */}
          <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-zinc-100">Monthly Cash Inflow vs Outflow Ledger</h3>
            <div className="divide-y divide-zinc-800/80 text-xs">
              {transactions.slice(0, 8).map(tx => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {tx.type === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-200 truncate">{tx.description}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{tx.category} • {tx.accountName}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatMoney(convertCurrency(tx.amount, tx.currency || currency, currency))}
                      </span>
                      <div className="text-[10px] text-zinc-500">{tx.date}</div>
                    </div>
                    <button
                      id={`btn-delete-ledger-tx-${tx.id}`}
                      onClick={() => setTransactionToDelete(tx)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. BUDGET TAB */}
      {accountSubTab === 'budget' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-zinc-100">Monthly Budget Envelopes</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Allocate spending limits across categories to safeguard cash flow and monthly savings.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {budgets.length === 0 && (
                <button
                  onClick={handleRestoreDefaultBudgets}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>
              )}
              <button
                id="btn-add-budget-envelope"
                onClick={() => {
                  const existing = new Set(budgets.map(b => b.category));
                  const available = EXPENSE_CATEGORIES.find(c => !existing.has(c));
                  if (available) {
                    setNewEnvCategory(available);
                    setIsCustomCategory(false);
                  }
                  setIsAddEnvelopeOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Envelope</span>
              </button>
            </div>
          </div>

          {/* Budget Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Total Monthly Budget</span>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {formatMoney(totalBudgetAllocated)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Planned limits across {budgets.length} envelopes</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Month-to-Date Spend</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {formatMoney(totalBudgetSpent)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {totalBudgetAllocated > 0 ? ((totalBudgetSpent / totalBudgetAllocated) * 100).toFixed(1) : 0}% of budget utilized
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Remaining Safe Allowance</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {formatMoney(budgetRemaining)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Available for rest of billing cycle</p>
            </div>
          </div>

          {/* Empty State */}
          {budgets.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/50 border border-dashed border-zinc-800 flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Layers className="w-7 h-7" />
              </div>
              <div className="max-w-md">
                <h4 className="text-base font-bold text-zinc-200">No Budget Envelopes Configured</h4>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Budget envelopes let you cap expenses per category (e.g. Dining, Groceries, Rent) to monitor spending pace in real time.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsAddEnvelopeOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Envelope</span>
                </button>
                <button
                  onClick={handleRestoreDefaultBudgets}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs border border-zinc-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Defaults</span>
                </button>
              </div>
            </div>
          ) : (
            /* Budget Envelopes Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {budgets.map(envelope => {
                const spent = categorySpendingMap[envelope.category] || 0;
                const pct = envelope.allocatedAmount > 0 
                  ? Math.min(150, Math.round((spent / envelope.allocatedAmount) * 100)) 
                  : 0;
                const isOver = spent > envelope.allocatedAmount;
                const isEditing = editingBudgetId === envelope.id;
                const isDeleting = confirmDeleteBudgetEnvelopeId === envelope.id;
                const envelopeColor = envelope.color || '#06b6d4';

                return (
                  <div 
                    key={envelope.id}
                    className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group relative overflow-hidden"
                  >
                    {/* Top Accent Color Bar */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: envelopeColor }}
                    />

                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: envelopeColor }} 
                        />
                        <div>
                          <h4 className="text-xs font-bold text-zinc-200">
                            {envelope.category}
                          </h4>
                          <p className="text-[10px] text-zinc-400 capitalize">
                            {envelope.period || 'monthly'} envelope
                          </p>
                        </div>
                      </div>

                      {/* Action buttons: Edit & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingBudgetId(null);
                            } else {
                              startEditBudget(envelope.id, envelope.allocatedAmount);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg opacity-80 group-hover:opacity-100 transition-all"
                          title="Edit envelope allowance"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteBudgetEnvelopeId(envelope.id)}
                          className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg opacity-80 group-hover:opacity-100 transition-all"
                          title="Delete envelope"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Delete Confirmation Overlay */}
                    {isDeleting && (
                      <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center gap-1.5 text-[11px] text-rose-300 font-medium">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                          <span>Delete envelope for <strong>{envelope.category}</strong>?</span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmDeleteBudgetEnvelopeId(null)}
                            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteEnvelope(envelope.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Progress and numbers */}
                    <div className="space-y-1.5">
                      <div className="flex items-baseline justify-between text-xs font-mono">
                        <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-zinc-200'}`}>
                          {formatMoney(spent)} spent
                        </span>
                        <span className="text-zinc-400 font-medium">
                          / {formatMoney(envelope.allocatedAmount)}
                        </span>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={editBudgetAmount}
                            onChange={e => setEditBudgetAmount(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEditBudget(envelope.id);
                              if (e.key === 'Escape') setEditingBudgetId(null);
                            }}
                            className="w-28 bg-zinc-950 border border-cyan-500 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditBudget(envelope.id)}
                            className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-lg font-bold transition-colors"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingBudgetId(null)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full bg-zinc-800/80 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              pct > 100 ? 'bg-rose-500' : pct > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px]">
                        <span className={isOver ? 'text-rose-400 font-semibold' : 'text-zinc-400'}>
                          {isOver 
                            ? `Over by ${formatMoney(spent - envelope.allocatedAmount)}` 
                            : `${formatMoney(envelope.allocatedAmount - spent)} remaining`}
                        </span>
                        <span className="font-mono text-zinc-400 font-medium">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. ACCOUNTS TAB */}
      {accountSubTab === 'accounts' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Financial Institutions & Wallets</h2>
              <p className="text-[11px] text-zinc-400">Connected depository, investment, crypto, and credit accounts</p>
            </div>

            <button
              id="btn-add-account-card"
              onClick={() => setIsAddAccountOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Link / Add Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map(acc => (
              <div 
                key={acc.id}
                className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400">
                      {acc.type === 'credit' ? <CreditCard className="w-4 h-4 text-amber-400" /> : <Wallet className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-100">{acc.name}</h4>
                      <p className="text-[10px] text-zinc-400">{acc.institution} • {acc.accountNumberMasked || '•••• 0000'}</p>
                    </div>
                  </div>

                  <button
                    id={`btn-delete-account-${acc.id}`}
                    onClick={() => setAccountToDelete(acc)}
                    className="p-1 text-zinc-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Balance</span>
                    <span className={`text-base font-bold font-mono ${
                      acc.balance < 0 ? 'text-rose-400' : 'text-zinc-100'
                    }`}>
                      {formatMoney(acc.balance)}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    Synced {acc.lastSynced}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. STATE TAB */}
      {accountSubTab === 'state' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Balance Sheet Statement */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">Solvency & Balance Sheet State</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Solvent & Liquid
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Assets column */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-zinc-300 uppercase tracking-wider text-[11px]">Total Assets</span>
                  <span className="font-mono font-bold text-zinc-100">{formatMoney(totalAssets)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Liquid Cash & Equivalents</span>
                  <span className="font-mono text-zinc-200">{formatMoney(liquidCash)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Investments & Equities</span>
                  <span className="font-mono text-zinc-200">{formatMoney(totalAssets - liquidCash)}</span>
                </div>
              </div>

              {/* Liabilities column */}
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-bold text-zinc-300 uppercase tracking-wider text-[11px]">Total Liabilities</span>
                  <span className="font-mono font-bold text-rose-400">{formatMoney(totalLiabilities)}</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Debt-to-Asset Ratio</span>
                  <span className="font-mono text-zinc-200">{debtToAssetRatio}%</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Monthly Debt Service</span>
                  <span className="font-mono text-zinc-200">{formatMoney(monthlyExpenses * 0.45)}</span>
                </div>
              </div>
            </div>

            {/* Financial Health Index Metrics */}
            <div className="pt-3 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                Financial Health Score Card
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {healthScore.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                    <div className="font-semibold text-zinc-200">{m.label}</div>
                    <div className="text-[11px] text-zinc-400 mt-1 font-mono">{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100">
            <h3 className="text-sm font-bold text-zinc-100">Link Financial Account</h3>
            <form onSubmit={handleCreateAccount} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Account Name</label>
                <input
                  type="text"
                  required
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  placeholder="e.g. Daily Checking, High-Yield Savings"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Institution</label>
                  <input
                    type="text"
                    required
                    value={newAccInstitution}
                    onChange={e => setNewAccInstitution(e.target.value)}
                    placeholder="e.g. Chase, Vanguard"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Account Type</label>
                  <select
                    value={newAccType}
                    onChange={e => setNewAccType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:border-emerald-500"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings / Vault</option>
                    <option value="investment">Investment Brokerage</option>
                    <option value="credit">Credit Card</option>
                    <option value="crypto">Crypto Wallet</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Initial Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newAccBalance}
                    onChange={e => setNewAccBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Masked Number</label>
                  <input
                    type="text"
                    value={newAccMasked}
                    onChange={e => setNewAccMasked(e.target.value)}
                    placeholder="•••• 4829"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-semibold"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Budget Envelope Modal */}
      {isAddEnvelopeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-950"
                  style={{ backgroundColor: newEnvColor }}
                >
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Create Budget Envelope</h3>
                  <p className="text-xs text-zinc-400">Set spending limit & category allowance</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEnvelopeOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEnvelope} className="space-y-4 text-xs">
              {/* Category Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-300 font-semibold">Expense Category</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomCategory(!isCustomCategory)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    {isCustomCategory ? '← Choose standard category' : '+ Custom category name'}
                  </button>
                </div>

                {isCustomCategory ? (
                  <div>
                    <input
                      type="text"
                      required
                      value={customCategoryName}
                      onChange={e => setCustomCategoryName(e.target.value)}
                      placeholder="e.g. Pet Care & Vet, Gaming & Hardware..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-44 overflow-y-auto pr-1 no-scrollbar">
                    {EXPENSE_CATEGORIES.map(cat => {
                      const isSelected = newEnvCategory === cat;
                      const alreadyExists = budgets.some(b => b.category === cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewEnvCategory(cat)}
                          className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all ${
                            isSelected
                              ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300 font-bold'
                              : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                          }`}
                        >
                          <span className="truncate text-[11px]">{cat}</span>
                          {alreadyExists && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 ml-1" title="Already has an active envelope" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!isCustomCategory && budgets.some(b => b.category === newEnvCategory) && (
                  <p className="text-[11px] text-amber-400/90 flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>An envelope for &quot;{newEnvCategory}&quot; already exists.</span>
                  </p>
                )}
              </div>

              {/* Allowance Limit */}
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold block">Planned Spending Allowance</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-zinc-400 text-sm font-bold">
                    {currencyConfig.symbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    required
                    value={newEnvAmount}
                    onChange={e => setNewEnvAmount(e.target.value)}
                    placeholder="500"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-2.5 font-mono text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-zinc-500 font-medium">Presets:</span>
                  {[100, 250, 500, 1000, 2000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewEnvAmount(val.toString())}
                      className="px-2 py-0.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition-colors"
                    >
                      {currencyConfig.symbol}{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period & Color Picker Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Period */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold block">Budget Cycle</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setNewEnvPeriod('monthly')}
                      className={`py-1.5 rounded-lg font-medium text-center transition-all ${
                        newEnvPeriod === 'monthly'
                          ? 'bg-zinc-800 text-cyan-400 font-bold shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEnvPeriod('yearly')}
                      className={`py-1.5 rounded-lg font-medium text-center transition-all ${
                        newEnvPeriod === 'yearly'
                          ? 'bg-zinc-800 text-cyan-400 font-bold shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>

                {/* Color Swatches */}
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold block">Accent Color</label>
                  <div className="flex items-center gap-1.5 flex-wrap p-1.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                    {ENVELOPE_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewEnvColor(color)}
                        className="w-5 h-5 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                        style={{ backgroundColor: color }}
                      >
                        {newEnvColor === color && <Check className="w-3 h-3 text-zinc-950 stroke-[3]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddEnvelopeOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Envelope</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal for Deleting Account */}
      <ConfirmationModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={() => {
          if (accountToDelete) {
            deleteAccount(accountToDelete.id);
            setAccountToDelete(null);
          }
        }}
        title="Delete Account"
        description="Are you sure you want to remove this financial account? This will unlink the institution and remove its balance from your liquid assets and cash runway calculations."
        itemType="account"
        itemName={accountToDelete?.name}
        details={accountToDelete ? [
          { label: 'Institution', value: accountToDelete.institution },
          { label: 'Account Type', value: accountToDelete.type.toUpperCase() },
          { label: 'Current Balance', value: formatMoney(accountToDelete.balance) },
          ...(accountToDelete.accountNumberMasked ? [{ label: 'Account Mask', value: accountToDelete.accountNumberMasked }] : []),
          { label: 'Last Synced', value: accountToDelete.lastSynced }
        ] : []}
        confirmButtonText="Delete Account"
      />

      {/* Confirmation Modal for Deleting Transaction from Ledger */}
      <ConfirmationModal
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={() => {
          if (transactionToDelete) {
            deleteTransaction(transactionToDelete.id);
            setTransactionToDelete(null);
          }
        }}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction record? This will permanently remove it from your ledger and recalculate category spending."
        itemType="transaction"
        itemName={transactionToDelete?.description}
        details={transactionToDelete ? [
          { 
            label: 'Amount', 
            value: `${transactionToDelete.type === 'income' ? '+' : '-'}${formatMoney(convertCurrency(transactionToDelete.amount, transactionToDelete.currency || currency, currency))}` 
          },
          { label: 'Category', value: transactionToDelete.category },
          { label: 'Account', value: transactionToDelete.accountName },
          { label: 'Date', value: transactionToDelete.date }
        ] : []}
        confirmButtonText="Delete Transaction"
      />
    </div>
  );
};
