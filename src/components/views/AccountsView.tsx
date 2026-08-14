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
  ShieldCheck
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { AccountSubTab, ExpenseCategory, AccountItem } from '../../types';

export const AccountsView: React.FC = () => {
  const { 
    accountSubTab, 
    setAccountSubTab, 
    accounts, 
    budgets, 
    transactions, 
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
    addAccount,
    deleteAccount,
    openQuickAdd
  } = useFinance();

  // New account modal state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccInstitution, setNewAccInstitution] = useState('');
  const [newAccType, setNewAccType] = useState<AccountItem['type']>('checking');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccMasked, setNewAccMasked] = useState('•••• 1234');

  // Budget editing state
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editBudgetAmount, setEditBudgetAmount] = useState<string>('');

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
      currency: 'USD',
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
                <div key={tx.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {tx.type === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-200">{tx.description}</div>
                      <div className="text-[10px] text-zinc-400">{tx.category} • {tx.accountName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-100'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                    </span>
                    <div className="text-[10px] text-zinc-500">{tx.date}</div>
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

          {/* Budget Envelopes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {budgets.map(envelope => {
              const spent = categorySpendingMap[envelope.category] || 0;
              const pct = envelope.allocatedAmount > 0 
                ? Math.min(150, Math.round((spent / envelope.allocatedAmount) * 100)) 
                : 0;
              const isOver = spent > envelope.allocatedAmount;
              const isEditing = editingBudgetId === envelope.id;

              return (
                <div 
                  key={envelope.id}
                  className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">
                        {envelope.category}
                      </h4>
                      <p className="text-[10px] text-zinc-400">Monthly Envelope</p>
                    </div>

                    <button
                      onClick={() => startEditBudget(envelope.id, envelope.allocatedAmount)}
                      className="p-1 text-zinc-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Edit envelope allowance"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <span className={`font-bold ${isOver ? 'text-rose-400' : 'text-zinc-200'}`}>
                        {formatMoney(spent)} spent
                      </span>
                      <span className="text-zinc-400">
                        / {formatMoney(envelope.allocatedAmount)}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="number"
                          value={editBudgetAmount}
                          onChange={e => setEditBudgetAmount(e.target.value)}
                          className="w-24 bg-zinc-950 border border-emerald-500 rounded px-2 py-0.5 text-xs font-mono text-white"
                        />
                        <button
                          onClick={() => saveEditBudget(envelope.id)}
                          className="p-1 bg-emerald-500 text-zinc-950 rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
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
                        {isOver ? `Over by ${formatMoney(spent - envelope.allocatedAmount)}` : `${formatMoney(envelope.allocatedAmount - spent)} left`}
                      </span>
                      <span className="font-mono text-zinc-400">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
                    onClick={() => deleteAccount(acc.id)}
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
    </div>
  );
};
