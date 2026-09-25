import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  CreditCard, 
  Building2, 
  Percent, 
  Calendar, 
  FileText, 
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Liability, LiabilityCategory } from '../../types';
import { useFinance, CURRENCY_CONFIGS } from '../../context/FinanceContext';

interface LiabilityEditModalProps {
  isOpen: boolean;
  liability: Liability | null;
  onClose: () => void;
  onSave: (liabilityId: string, updates: Partial<Liability>) => void;
  onDelete?: (liabilityId: string) => void;
}

const LIABILITY_CATEGORIES: { id: LiabilityCategory; name: string }[] = [
  { id: 'Mortgage', name: 'Mortgage' },
  { id: 'Home Loan', name: 'Home Loan' },
  { id: 'Auto Loan', name: 'Auto Loan' },
  { id: 'Student Loan', name: 'Student Loan' },
  { id: 'Personal Loan', name: 'Personal Loan' },
  { id: 'Credit Card', name: 'Credit Card' },
  { id: 'Line of Credit', name: 'Line of Credit' },
  { id: 'Business Loan', name: 'Business Loan' },
  { id: 'Gold Loan', name: 'Gold Loan' },
  { id: 'Loan Against Property', name: 'Loan Against Property' },
  { id: 'Buy Now Pay Later', name: 'Buy Now Pay Later' },
  { id: 'Other Debt', name: 'Other Debt' },
];

export const LiabilityEditModal: React.FC<LiabilityEditModalProps> = ({
  isOpen,
  liability,
  onClose,
  onSave,
  onDelete,
}) => {
  const { currency } = useFinance();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<LiabilityCategory>('Mortgage');
  const [subType, setSubType] = useState('');
  const [institution, setInstitution] = useState('');
  const [balance, setBalance] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [remainingMonths, setRemainingMonths] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSecured, setIsSecured] = useState(false);
  const [collateral, setCollateral] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (liability) {
      setName(liability.name || '');
      setCategory(liability.category || 'Mortgage');
      setSubType(liability.subType || '');
      setInstitution(liability.institution || '');
      setBalance(liability.balance !== undefined ? String(liability.balance) : '0');
      setOriginalAmount(liability.originalAmount !== undefined ? String(liability.originalAmount) : '');
      setInterestRate(liability.interestRate !== undefined ? String(liability.interestRate) : '');
      setMonthlyPayment(liability.monthlyPayment !== undefined ? String(liability.monthlyPayment) : (liability.minimumPayment !== undefined ? String(liability.minimumPayment) : ''));
      setRemainingMonths(liability.remainingMonths !== undefined ? String(liability.remainingMonths) : '');
      setDueDate(liability.dueDate !== undefined ? String(liability.dueDate) : '');
      setIsSecured(liability.isSecured ?? false);
      setCollateral(liability.collateral || '');
      setNotes(liability.notes || '');
    }
  }, [liability, isOpen]);

  if (!isOpen || !liability) return null;

  const currSym = CURRENCY_CONFIGS[liability.currency || currency]?.symbol || '$';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balNum = parseFloat(balance) || 0;
    const origNum = originalAmount ? parseFloat(originalAmount) : undefined;
    const rateNum = interestRate ? parseFloat(interestRate) : undefined;
    const emiNum = monthlyPayment ? parseFloat(monthlyPayment) : undefined;
    const remMonthsNum = remainingMonths ? parseInt(remainingMonths) : undefined;
    const dueDayNum = dueDate ? parseInt(dueDate) : undefined;

    const updates: Partial<Liability> = {
      name: name.trim() || liability.name,
      category,
      subType: subType.trim() || undefined,
      institution: institution.trim() || undefined,
      balance: balNum,
      originalAmount: origNum,
      interestRate: rateNum,
      monthlyPayment: emiNum,
      minimumPayment: emiNum,
      remainingMonths: remMonthsNum,
      dueDate: dueDayNum,
      isSecured,
      collateral: isSecured ? (collateral.trim() || undefined) : undefined,
      notes: notes.trim() || undefined,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onSave(liability.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Edit Liability Details</h2>
              <p className="text-xs text-zinc-400">Update loan terms, balance, interest rate, and schedule</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Liability / Loan Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as LiabilityCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-rose-500"
              >
                {LIABILITY_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Balance & Original Loan Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Outstanding Balance ({currSym}) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={balance}
                onChange={e => setBalance(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Original Principal / Credit Limit ({currSym})
              </label>
              <input
                type="number"
                step="any"
                value={originalAmount}
                onChange={e => setOriginalAmount(e.target.value)}
                placeholder="Optional"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 font-mono text-sm text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Institution & Sub-Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Lending Institution / Bank
              </label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="e.g. Rocket Mortgage, Chase, HDFC, SBI"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Loan Sub-Type / Description
              </label>
              <input
                type="text"
                value={subType}
                onChange={e => setSubType(e.target.value)}
                placeholder="e.g. Primary Residence Home Loan, Fixed Rate"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Interest Rate & Monthly EMI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Interest Rate (% p.a.)
              </label>
              <input
                type="number"
                step="0.01"
                value={interestRate}
                onChange={e => setInterestRate(e.target.value)}
                placeholder="e.g. 4.85"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Monthly EMI / Minimum ({currSym})
              </label>
              <input
                type="number"
                step="any"
                value={monthlyPayment}
                onChange={e => setMonthlyPayment(e.target.value)}
                placeholder="e.g. 1850"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Remaining Tenure (Months)
              </label>
              <input
                type="number"
                value={remainingMonths}
                onChange={e => setRemainingMonths(e.target.value)}
                placeholder="e.g. 312"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Due Day & Security Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Payment Due Date (Day of Month)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                placeholder="e.g. 1st or 15th"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Collateral / Asset Pledged
              </label>
              <input
                type="text"
                value={collateral}
                onChange={e => {
                  setCollateral(e.target.value);
                  if (e.target.value) setIsSecured(true);
                }}
                placeholder="e.g. Primary Residence Property"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              Loan Notes & Terms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Auto-pay on 1st of month from checking account; prepay $500 monthly..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-zinc-800">
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(liability.id)}
                className="px-4 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 font-semibold transition-colors cursor-pointer text-xs"
              >
                Delete Liability
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
