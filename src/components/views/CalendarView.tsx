import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ScheduledCalendarItem } from '../../types';

export const CalendarView: React.FC = () => {
  const { 
    scheduledItems = [], 
    formatMoney, 
    addScheduledItem, 
    deleteScheduledItem,
    monthlyIncome,
    monthlyExpenses
  } = useFinance();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(10);

  // New scheduled item modal state
  const [isAddScheduledOpen, setIsAddScheduledOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newCategory, setNewCategory] = useState('Housing & Rent');
  const [newDayOfMonth, setNewDayOfMonth] = useState('1');
  const [newFrequency, setNewFrequency] = useState<ScheduledCalendarItem['frequency']>('monthly');
  const [newAccountName, setNewAccountName] = useState('Checking Account');

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleCreateScheduled = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    const day = parseInt(newDayOfMonth);
    if (isNaN(amt) || amt <= 0 || !newTitle.trim()) return;

    addScheduledItem({
      title: newTitle.trim(),
      amount: amt,
      type: newType,
      category: newCategory,
      dayOfMonth: isNaN(day) ? 1 : day,
      frequency: newFrequency,
      accountName: newAccountName,
      isAutoPaid: true,
    });

    setIsAddScheduledOpen(false);
    setNewTitle('');
    setNewAmount('');
  };

  const selectedDayItems = (scheduledItems || []).filter(i => i.dayOfMonth === selectedDay);

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* Calendar Header & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            <span>Cash Flow & Bill Payment Calendar</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Visualize scheduled paydays, recurring bills, subscriptions, and projected daily balances.
          </p>
        </div>

        <button
          onClick={() => setIsAddScheduledOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Schedule Bill / Payday</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Container */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-zinc-100 font-mono">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-zinc-500 uppercase tracking-wider py-1 border-b border-zinc-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 gap-1 text-xs">
            {/* Blank leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-zinc-950/20" />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const itemsForDay = scheduledItems.filter(item => item.dayOfMonth === dayNum);
              const hasIncome = itemsForDay.some(it => it.type === 'income');
              const hasExpense = itemsForDay.some(it => it.type === 'expense');
              const isSelected = selectedDay === dayNum;

              return (
                <div
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-16 sm:h-20 p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-zinc-800/90 shadow-md ring-1 ring-emerald-500/40'
                      : 'border-zinc-800/80 bg-zinc-950/50 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-semibold font-mono ${
                      isSelected ? 'text-emerald-400' : 'text-zinc-300'
                    }`}>
                      {dayNum}
                    </span>
                    {itemsForDay.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </div>

                  {/* Badges preview */}
                  <div className="space-y-0.5 truncate">
                    {hasIncome && (
                      <div className="text-[9px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded truncate">
                        +Inflow
                      </div>
                    )}
                    {hasExpense && (
                      <div className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded truncate">
                        -Bill
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda & Details */}
        <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs text-zinc-400 font-medium">Selected Date</span>
                <h3 className="text-base font-bold text-zinc-100 font-mono">
                  {monthNames[currentMonth]} {selectedDay || 1}, {currentYear}
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                {selectedDayItems.length} Events
              </span>
            </div>

            {/* List of items on this day */}
            <div className="pt-3 space-y-2.5">
              {selectedDayItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-500">
                  No automated debits or paychecks scheduled on day {selectedDay}.
                </div>
              ) : (
                selectedDayItems.map(item => (
                  <div 
                    key={item.id}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${
                        item.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {item.type === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-200">{item.title}</div>
                        <div className="text-[10px] text-zinc-400">{item.category} • {item.frequency}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`font-mono font-bold ${
                        item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)}
                      </span>
                      <button
                        onClick={() => deleteScheduledItem(item.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Automated Cash Flow Sync</span>
            </div>
            <p className="text-[11px]">
              Scheduled calendar debits automatically help you predict liquidity troughs and prevent overdraft fees.
            </p>
          </div>
        </div>
      </div>

      {/* Add Scheduled Item Modal */}
      {isAddScheduledOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-100">
            <h3 className="text-sm font-bold text-zinc-100">Schedule Recurring Bill or Paycheck</h3>
            <form onSubmit={handleCreateScheduled} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Event Name / Payee</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Salary Direct Deposit, Electric Bill, Rent"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
                  >
                    <option value="expense">Expense (Bill/Debit)</option>
                    <option value="income">Income (Payday)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Day of Month (1-31)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={newDayOfMonth}
                    onChange={e => setNewDayOfMonth(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Frequency</label>
                  <select
                    value={newFrequency}
                    onChange={e => setNewFrequency(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="weekly">Weekly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddScheduledOpen(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-800 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-semibold"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
