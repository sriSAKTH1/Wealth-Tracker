import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  FileText, 
  Check, 
  ArrowDownRight, 
  Zap, 
  PlusCircle,
  Percent,
  Receipt
} from 'lucide-react';
import { Liability, LiabilityRecord, LiabilityRecordType } from '../../types';
import { useFinance, CURRENCY_CONFIGS } from '../../context/FinanceContext';

interface RecordLiabilityPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  liability: Liability;
  onSaveRecord: (updatedLiability: Liability, newRecord: LiabilityRecord) => void;
}

export const RecordLiabilityPaymentModal: React.FC<RecordLiabilityPaymentModalProps> = ({
  isOpen,
  onClose,
  liability,
  onSaveRecord,
}) => {
  const { addTransaction, currency } = useFinance();
  const [activeTab, setActiveTab] = useState<LiabilityRecordType>('EMI');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Suggested defaults
  const defaultPayment = activeTab === 'EMI' 
    ? (liability.monthlyPayment || liability.minimumPayment || 0).toString() 
    : '';

  const [amount, setAmount] = useState<string>(defaultPayment);
  const [principalPaid, setPrincipalPaid] = useState<string>('');
  const [interestPaid, setInterestPaid] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const currSym = CURRENCY_CONFIGS[liability.currency || currency]?.symbol || '$';
  const numAmount = parseFloat(amount) || 0;

  // Auto-estimate interest/principal split for EMI if interest rate exists
  const monthlyRate = (liability.interestRate || 0) / 100 / 12;
  const estimatedMonthlyInterest = Math.round((liability.balance || 0) * monthlyRate);
  const estimatedPrincipal = Math.max(0, Math.round(numAmount - estimatedMonthlyInterest));

  const effectivePrincipal = principalPaid !== '' 
    ? (parseFloat(principalPaid) || 0) 
    : (activeTab === 'PREPAYMENT' ? numAmount : estimatedPrincipal);

  const effectiveInterest = interestPaid !== '' 
    ? (parseFloat(interestPaid) || 0) 
    : (activeTab === 'PREPAYMENT' ? 0 : Math.min(numAmount, estimatedMonthlyInterest));

  const newBalance = Math.max(0, Math.round((liability.balance || 0) - (activeTab === 'CHARGE' ? -numAmount : effectivePrincipal)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (numAmount <= 0) {
      setError('Please enter a payment amount greater than zero.');
      return;
    }

    const newRecord: LiabilityRecord = {
      id: `liab-rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      liabilityId: liability.id,
      type: activeTab,
      date,
      amount: numAmount,
      principalPaid: activeTab === 'CHARGE' ? 0 : effectivePrincipal,
      interestPaid: activeTab === 'CHARGE' ? numAmount : effectiveInterest,
      balanceAfter: newBalance,
      notes: notes.trim() || (activeTab === 'EMI' ? 'Regular Monthly Repayment' : activeTab === 'PREPAYMENT' ? 'Lump-sum Principal Prepayment' : 'Fee / Charge Adjustment'),
    };

    const updatedRemainingMonths = (liability.remainingMonths && liability.remainingMonths > 0) 
      ? liability.remainingMonths - (activeTab === 'EMI' ? 1 : 0)
      : undefined;

    const updatedLiability: Liability = {
      ...liability,
      balance: newBalance,
      remainingMonths: updatedRemainingMonths,
      records: [newRecord, ...(liability.records || [])],
      lastUpdated: date,
    };

    // Log to global cashflow transaction log
    try {
      addTransaction({
        description: `${activeTab === 'EMI' ? 'EMI Payment' : activeTab === 'PREPAYMENT' ? 'Prepayment' : 'Charge'}: ${liability.name}`,
        amount: numAmount,
        currency: liability.currency,
        type: activeTab === 'CHARGE' ? 'expense' : 'expense',
        category: 'Debt Repayment',
        accountId: liability.institution || 'acc-bank',
        accountName: liability.institution || 'Bank Account',
        date,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      console.warn('Could not record cashflow expense:', err);
    }

    onSaveRecord(updatedLiability, newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Record Debt Repayment</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-sm">
              {liability.name} • Balance: {currSym}{liability.balance.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 pb-2 bg-zinc-950/40 border-b border-zinc-800/80">
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab('EMI'); setError(''); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'EMI'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Monthly EMI</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('PREPAYMENT'); setError(''); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'PREPAYMENT'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Prepayment</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('CHARGE'); setError(''); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'CHARGE'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Fee / Charge</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Payment Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Amount */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Payment Amount ({currSym}) *
            </label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 1850"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-base font-bold font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
            {liability.monthlyPayment && activeTab === 'EMI' && (
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Standard monthly installment: <strong className="text-zinc-200">{currSym}{liability.monthlyPayment.toLocaleString()}</strong>
              </span>
            )}
          </div>

          {/* Principal & Interest breakdown for EMI */}
          {activeTab === 'EMI' && numAmount > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Principal Amount ({currSym})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={String(estimatedPrincipal)}
                  value={principalPaid}
                  onChange={e => setPrincipalPaid(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">
                  Interest Component ({currSym})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={String(estimatedMonthlyInterest)}
                  value={interestPaid}
                  onChange={e => setInterestPaid(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono text-rose-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* New Balance Preview */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>Current Outstanding:</span>
              <span>{currSym}{liability.balance.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between font-bold text-white pt-1 border-t border-zinc-800">
              <span>Balance After Repayment:</span>
              <span className={newBalance < liability.balance ? 'text-emerald-400' : 'text-amber-400'}>
                {currSym}{newBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Notes / Reference (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Bank Ref #91823, Annual bonus paydown"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'EMI'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : activeTab === 'PREPAYMENT'
                  ? 'bg-blue-600 hover:bg-blue-500'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Record Repayment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
