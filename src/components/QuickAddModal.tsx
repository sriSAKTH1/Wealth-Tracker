import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Coins, 
  ShieldAlert, 
  Calendar, 
  DollarSign, 
  Tag, 
  Building2, 
  Percent,
  Check
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../context/FinanceContext';
import { 
  AssetCategory, 
  LiabilityCategory, 
  ExpenseCategory, 
  IncomeCategory,
  CurrencyCode 
} from '../types';

export const QuickAddModal: React.FC = () => {
  const { 
    isQuickAddOpen, 
    closeQuickAdd, 
    quickAddType, 
    accounts,
    currency,
    addTransaction,
    addAsset,
    addLiability
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'asset' | 'liability'>('income');

  // Transaction state
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState<string>('Salary & Wages');
  const [txAccountId, setTxAccountId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txIsRecurring, setTxIsRecurring] = useState(false);
  const [txNotes, setTxNotes] = useState('');

  // Asset state
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState<AssetCategory>('Stocks & ETFs');
  const [assetValue, setAssetValue] = useState('');
  const [assetCostBasis, setAssetCostBasis] = useState('');
  const [assetInstitution, setAssetInstitution] = useState('');
  const [assetIsLiquid, setAssetIsLiquid] = useState(true);

  // Liability state
  const [liabName, setLiabName] = useState('');
  const [liabCategory, setLiabCategory] = useState<LiabilityCategory>('Credit Card');
  const [liabBalance, setLiabBalance] = useState('');
  const [liabInterestRate, setLiabInterestRate] = useState('');
  const [liabMinPayment, setLiabMinPayment] = useState('');
  const [liabDueDate, setLiabDueDate] = useState('1');
  const [liabInstitution, setLiabInstitution] = useState('');

  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (quickAddType) {
      setActiveTab(quickAddType);
    }
  }, [quickAddType, isQuickAddOpen]);

  useEffect(() => {
    if (accounts.length > 0 && !txAccountId) {
      setTxAccountId(accounts[0].id);
    }
  }, [accounts, txAccountId]);

  useEffect(() => {
    if (activeTab === 'income') {
      setTxCategory('Salary & Wages');
    } else if (activeTab === 'expense') {
      setTxCategory('Food & Groceries');
    }
  }, [activeTab]);

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'income' || activeTab === 'expense') {
      const parsedAmount = parseFloat(txAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) return;

      const selectedAccount = accounts.find(a => a.id === txAccountId);

      addTransaction({
        description: txDescription.trim() || (activeTab === 'income' ? 'Income Entry' : 'Expense Entry'),
        amount: parsedAmount,
        type: activeTab,
        category: txCategory,
        accountId: txAccountId,
        accountName: selectedAccount?.name || 'General Account',
        date: txDate,
        isRecurring: txIsRecurring,
        notes: txNotes,
      });

      setSubmittedMessage(`Recorded ${activeTab === 'income' ? 'Income' : 'Expense'} successfully!`);
    } else if (activeTab === 'asset') {
      const parsedVal = parseFloat(assetValue);
      if (isNaN(parsedVal) || parsedVal <= 0 || !assetName.trim()) return;

      addAsset({
        name: assetName.trim(),
        category: assetCategory,
        value: parsedVal,
        costBasis: assetCostBasis ? parseFloat(assetCostBasis) : parsedVal,
        institution: assetInstitution.trim() || 'Self-Custody',
        currency: currency as CurrencyCode,
        isLiquid: assetIsLiquid,
      });

      setSubmittedMessage('Asset created successfully!');
    } else if (activeTab === 'liability') {
      const parsedBal = parseFloat(liabBalance);
      if (isNaN(parsedBal) || parsedBal <= 0 || !liabName.trim()) return;

      addLiability({
        name: liabName.trim(),
        category: liabCategory,
        balance: parsedBal,
        interestRate: liabInterestRate ? parseFloat(liabInterestRate) : 0,
        minimumPayment: liabMinPayment ? parseFloat(liabMinPayment) : 0,
        dueDate: parseInt(liabDueDate) || 1,
        institution: liabInstitution.trim() || 'Creditor',
        currency: currency as CurrencyCode,
      });

      setSubmittedMessage('Liability recorded successfully!');
    }

    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
      // Reset fields
      setTxAmount('');
      setTxDescription('');
      setAssetName('');
      setAssetValue('');
      setLiabName('');
      setLiabBalance('');
    }, 650);
  };

  const incomeCategories: IncomeCategory[] = [
    'Salary & Wages',
    'Freelance & Business',
    'Investments & Dividends',
    'Rental Income',
    'Side Hustle',
    'Gifts & Grants',
    'Other Income'
  ];

  const expenseCategories: ExpenseCategory[] = [
    'Food & Groceries',
    'Dining & Drinks',
    'Housing & Rent',
    'Transportation',
    'Utilities & Bills',
    'Entertainment',
    'Health & Wellness',
    'Shopping & Tech',
    'Travel & Leisure',
    'Subscriptions',
    'Investments',
    'Other Expense'
  ];

  const assetCategories: AssetCategory[] = [
    'Cash & Bank',
    'Stocks & ETFs',
    'Crypto',
    'Real Estate',
    'Retirement (401k/IRA)',
    'Vehicles & Valuables',
    'Fixed Income & Bonds',
    'Other Assets'
  ];

  const liabilityCategories: LiabilityCategory[] = [
    'Credit Card',
    'Mortgage',
    'Auto Loan',
    'Student Loan',
    'Personal Loan',
    'Other Debt'
  ];

  const currentSymbol = CURRENCY_CONFIGS[currency]?.symbol || '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">Add to Financial Ledger</span>
          </div>
          <button
            onClick={closeQuickAdd}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 gap-1.5 p-2 bg-slate-950/70 border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-medium transition-all ${
              activeTab === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Income</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-medium transition-all ${
              activeTab === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('asset')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-medium transition-all ${
              activeTab === 'asset'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Asset</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('liability')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-medium transition-all ${
              activeTab === 'liability'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Liability</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {submittedMessage ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col items-center justify-center text-center space-y-2">
              <Check className="w-8 h-8 text-emerald-400 animate-bounce" />
              <span className="text-sm font-semibold">{submittedMessage}</span>
            </div>
          ) : (
            <>
              {/* INCOME & EXPENSE FORM */}
              {(activeTab === 'income' || activeTab === 'expense') && (
                <>
                  {/* Amount Input */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Amount ({currentSymbol})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono text-base font-semibold">
                        {currentSymbol}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-base font-mono font-semibold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Description / Merchant
                    </label>
                    <input
                      type="text"
                      required
                      value={txDescription}
                      onChange={e => setTxDescription(e.target.value)}
                      placeholder={activeTab === 'income' ? 'e.g. Salary, Consulting Retainer' : 'e.g. Trader Joe\'s, Amazon, Dinner'}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Category & Account Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Category
                      </label>
                      <select
                        value={txCategory}
                        onChange={e => setTxCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                      >
                        {(activeTab === 'income' ? incomeCategories : expenseCategories).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Linked Account
                      </label>
                      <select
                        value={txAccountId}
                        onChange={e => setTxAccountId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.institution})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date & Recurring */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={txDate}
                        onChange={e => setTxDate(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input
                          type="checkbox"
                          checked={txIsRecurring}
                          onChange={e => setTxIsRecurring(e.target.checked)}
                          className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-xs">Recurring Monthly</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* ASSET FORM */}
              {activeTab === 'asset' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Asset Name
                    </label>
                    <input
                      type="text"
                      required
                      value={assetName}
                      onChange={e => setAssetName(e.target.value)}
                      placeholder="e.g. S&P 500 Vanguard ETF, Primary Home, Bitcoin"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Asset Category
                      </label>
                      <select
                        value={assetCategory}
                        onChange={e => setAssetCategory(e.target.value as AssetCategory)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                      >
                        {assetCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Institution / Custodian
                      </label>
                      <input
                        type="text"
                        value={assetInstitution}
                        onChange={e => setAssetInstitution(e.target.value)}
                        placeholder="e.g. Vanguard, Fidelity, Ledger"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Current Valuation ({currentSymbol})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={assetValue}
                        onChange={e => setAssetValue(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Cost Basis / Purchase Price ({currentSymbol})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={assetCostBasis}
                        onChange={e => setAssetCostBasis(e.target.value)}
                        placeholder="Optional"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                      <input
                        type="checkbox"
                        checked={assetIsLiquid}
                        onChange={e => setAssetIsLiquid(e.target.checked)}
                        className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-xs">Liquid Asset (Can be converted to cash in &lt; 7 days)</span>
                    </label>
                  </div>
                </>
              )}

              {/* LIABILITY FORM */}
              {activeTab === 'liability' && (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Liability Name / Loan Title
                    </label>
                    <input
                      type="text"
                      required
                      value={liabName}
                      onChange={e => setLiabName(e.target.value)}
                      placeholder="e.g. 30-Yr Fixed Mortgage, Auto Loan, Amex Card"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Liability Category
                      </label>
                      <select
                        value={liabCategory}
                        onChange={e => setLiabCategory(e.target.value as LiabilityCategory)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-emerald-500"
                      >
                        {liabilityCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Creditor / Institution
                      </label>
                      <input
                        type="text"
                        value={liabInstitution}
                        onChange={e => setLiabInstitution(e.target.value)}
                        placeholder="e.g. Chase, Rocket, Discover"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Outstanding Balance
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={liabBalance}
                        onChange={e => setLiabBalance(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-rose-400 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Interest Rate (APR %)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={liabInterestRate}
                        onChange={e => setLiabInterestRate(e.target.value)}
                        placeholder="e.g. 5.25"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                        Min Monthly Due
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={liabMinPayment}
                        onChange={e => setLiabMinPayment(e.target.value)}
                        placeholder="e.g. 450"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeQuickAdd}
                  className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-2xl font-bold text-white shadow-lg transition-all ${
                    activeTab === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : activeTab === 'expense'
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                      : activeTab === 'asset'
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                      : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  }`}
                >
                  Save {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
