import React, { useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins, 
  ShieldAlert, 
  Target, 
  Wallet,
  ExternalLink
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    transactions,
    assets,
    liabilities,
    customGoals,
    accounts,
    formatMoney,
    currency,
    convertCurrency,
    setActiveTab,
    setWealthSubTab,
    setGoalsSubTab,
    setAccountSubTab
  } = useFinance();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  const filteredTransactions = transactions.filter(t => 
    !q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.accountName.toLowerCase().includes(q)
  ).slice(0, 5);

  const filteredAssets = assets.filter(a =>
    !q || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || (a.institution && a.institution.toLowerCase().includes(q))
  ).slice(0, 4);

  const filteredLiabilities = liabilities.filter(l =>
    !q || l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)
  ).slice(0, 4);

  const filteredGoals = customGoals.filter(g =>
    !q || g.name.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
  ).slice(0, 3);

  const filteredAccounts = accounts.filter(acc =>
    !q || acc.name.toLowerCase().includes(q) || acc.institution.toLowerCase().includes(q)
  ).slice(0, 3);

  const totalResults = 
    filteredTransactions.length + 
    filteredAssets.length + 
    filteredLiabilities.length + 
    filteredGoals.length + 
    filteredAccounts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-100">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[80vh] flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-blue-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search transactions, assets, debts, goals, accounts..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setSearchOpen(false)}
            className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700 hover:bg-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="p-3 overflow-y-auto space-y-4 text-xs">
          {totalResults === 0 ? (
            <div className="py-12 text-center text-zinc-500">
              No financial records found matching "{searchQuery}"
            </div>
          ) : (
            <>
              {/* Transactions */}
              {filteredTransactions.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Transactions ({filteredTransactions.length})
                  </div>
                  <div className="space-y-1">
                    {filteredTransactions.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setActiveTab('overview');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {t.type === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-200">{t.description}</div>
                            <div className="text-[10px] text-zinc-400">{t.category} • {t.date}</div>
                          </div>
                        </div>
                        <span className={`font-mono font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'}`}>
                          {t.type === 'income' ? '+' : '-'}{formatMoney(convertCurrency(t.amount, t.currency || currency, currency))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assets */}
              {filteredAssets.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Assets ({filteredAssets.length})
                  </div>
                  <div className="space-y-1">
                    {filteredAssets.map(a => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setActiveTab('wealth');
                          setWealthSubTab('assets');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                            <Coins className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-medium text-zinc-200">{a.name}</div>
                            <div className="text-[10px] text-zinc-400">{a.category} • {a.institution}</div>
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-emerald-400">
                          {formatMoney(a.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liabilities */}
              {filteredLiabilities.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Liabilities & Debts ({filteredLiabilities.length})
                  </div>
                  <div className="space-y-1">
                    {filteredLiabilities.map(l => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setActiveTab('wealth');
                          setWealthSubTab('liabilities');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-medium text-zinc-200">{l.name}</div>
                            <div className="text-[10px] text-zinc-400">{l.category} {l.interestRate ? `• ${l.interestRate}% APR` : ''}</div>
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-rose-400">
                          {formatMoney(l.balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goals */}
              {filteredGoals.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Financial Goals ({filteredGoals.length})
                  </div>
                  <div className="space-y-1">
                    {filteredGoals.map(g => (
                      <div
                        key={g.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setActiveTab('goals');
                          setGoalsSubTab('goals');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                            <Target className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-medium text-zinc-200">{g.name}</div>
                            <div className="text-[10px] text-zinc-400">Target Date: {g.targetDate}</div>
                          </div>
                        </div>
                        <span className="font-mono text-zinc-300">
                          {formatMoney(g.currentAmount)} / {formatMoney(g.targetAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accounts */}
              {filteredAccounts.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Accounts ({filteredAccounts.length})
                  </div>
                  <div className="space-y-1">
                    {filteredAccounts.map(acc => (
                      <div
                        key={acc.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setActiveTab('account');
                          setAccountSubTab('accounts');
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800/80 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                            <Wallet className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-medium text-zinc-200">{acc.name}</div>
                            <div className="text-[10px] text-zinc-400">{acc.institution} • {acc.type}</div>
                          </div>
                        </div>
                        <span className="font-mono font-semibold text-zinc-100">
                          {formatMoney(acc.balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
