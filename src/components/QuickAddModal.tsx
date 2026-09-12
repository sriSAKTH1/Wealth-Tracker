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
  Check, 
  ChevronLeft, 
  TrendingUp, 
  ExternalLink,
  Plus, 
  ArrowLeft, 
  Sparkles, 
  Search,
  Layers,
  Clock,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../context/FinanceContext';
import { 
  AssetCategory, 
  LiabilityCategory, 
  ExpenseCategory, 
  IncomeCategory, 
  CurrencyCode,
  DEFAULT_ASSET_TAGS
} from '../types';
import { ASSET_TAXONOMY, LIABILITY_TAXONOMY, AssetCategoryInfo } from '../data/assetTaxonomy';
import { 
  MasterAsset, 
  marketDataService, 
  getGoogleFinanceUrl, 
  MOCK_MASTER_ASSETS 
} from '../services/marketDataService';
import { estimateHistoricalBuyPrice } from '../data/marketStocks';

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

  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'asset' | 'liability'>('asset');

  // Asset Flow Mode: 'search' (default for market assets) vs 'category' (for manual/physical assets) vs 'configure' (after clicking + Add)
  const [assetFlowMode, setAssetFlowMode] = useState<'search' | 'category' | 'configure'>('search');
  
  // Market Search State
  const [marketSearchQuery, setMarketSearchQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<'all' | 'stock' | 'mutual_fund'>('all');
  const [searchResults, setSearchResults] = useState<MasterAsset[]>(MOCK_MASTER_ASSETS.slice(0, 12));
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMasterAsset, setSelectedMasterAsset] = useState<MasterAsset | null>(null);

  // Holding Configuration State (Units, Buy Price, Broker)
  const [holdingShares, setHoldingShares] = useState('1');
  const [holdingBuyPrice, setHoldingBuyPrice] = useState('');
  const [holdingBuyDate, setHoldingBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [holdingInstitution, setHoldingInstitution] = useState('Zerodha');
  const [holdingTags, setHoldingTags] = useState<string[]>(['Long-term Savings']);
  const [holdingCustomTag, setHoldingCustomTag] = useState('');

  // Manual/Physical Asset Category state
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<AssetCategoryInfo | null>(null);
  const [selectedAssetSubType, setSelectedAssetSubType] = useState<{ id: string; name: string; isDefaultLiquid?: boolean; suggestedInstitutions?: string[] } | null>(null);
  const [manualAssetName, setManualAssetName] = useState('');
  const [manualAssetValue, setManualAssetValue] = useState('');
  const [manualAssetCostBasis, setManualAssetCostBasis] = useState('');
  const [manualAssetInstitution, setManualAssetInstitution] = useState('');
  const [manualAssetIsLiquid, setManualAssetIsLiquid] = useState(true);
  const [manualTags, setManualTags] = useState<string[]>(['Long-term Savings']);
  const [manualCustomTag, setManualCustomTag] = useState('');

  const toggleHoldingTag = (tagName: string) => {
    setHoldingTags(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const addHoldingCustomTag = () => {
    const trimmed = holdingCustomTag.trim();
    if (trimmed && !holdingTags.includes(trimmed)) {
      setHoldingTags(prev => [...prev, trimmed]);
      setHoldingCustomTag('');
    }
  };

  const toggleManualTag = (tagName: string) => {
    setManualTags(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const addManualCustomTag = () => {
    const trimmed = manualCustomTag.trim();
    if (trimmed && !manualTags.includes(trimmed)) {
      setManualTags(prev => [...prev, trimmed]);
      setManualCustomTag('');
    }
  };

  // Liability state
  const [liabStep, setLiabStep] = useState<1 | 2>(1);
  const [selectedLiabType, setSelectedLiabType] = useState<string>('Home Loan');
  const [liabName, setLiabName] = useState('');
  const [liabBalance, setLiabBalance] = useState('');
  const [liabInterestRate, setLiabInterestRate] = useState('');
  const [liabMinPayment, setLiabMinPayment] = useState('');
  const [liabInstitution, setLiabInstitution] = useState('');

  // Transaction state (Income / Expense)
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState<string>('Salary & Wages');
  const [txAccountId, setTxAccountId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txIsRecurring, setTxIsRecurring] = useState(false);

  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (quickAddType) {
      setActiveTab(quickAddType);
      if (quickAddType === 'asset') {
        setAssetFlowMode('search');
        setSelectedMasterAsset(null);
        setSelectedAssetCategory(null);
        setSelectedAssetSubType(null);
      } else if (quickAddType === 'liability') {
        setLiabStep(1);
      }
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

  // Live Market & Mutual Fund Search
  useEffect(() => {
    let isCurrent = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await marketDataService.search(marketSearchQuery, marketFilter === 'all' ? undefined : marketFilter);
        if (isCurrent) {
          setSearchResults(results);
        }
      } catch (err) {
        // Fallback to local
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, marketSearchQuery.trim() ? 200 : 0);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [marketSearchQuery, marketFilter]);

  if (!isQuickAddOpen) return null;

  const currentSymbol = CURRENCY_CONFIGS[currency]?.symbol || '₹';

  // Quick suggestion chips
  const QUICK_SEARCH_CHIPS = [
    { label: 'Reliance', query: 'Reliance' },
    { label: 'RELIANCE', query: 'RELIANCE' },
    { label: 'TCS', query: 'TCS' },
    { label: 'HDFC Bank', query: 'HDFC Bank' },
    { label: 'HDFC Flexi Cap Fund', query: 'HDFC Flexi Cap Fund' },
    { label: 'SBI Bluechip Fund', query: 'SBI Bluechip' },
    { label: 'NIFTY 50', query: 'NIFTYBEES' }
  ];

  // Initiate [+ Add] for a security
  const handleInitiateAdd = (asset: MasterAsset) => {
    setSelectedMasterAsset(asset);
    setHoldingShares('1');
    setHoldingBuyPrice(asset.latest_price ? asset.latest_price.toFixed(2) : '100.00');
    setHoldingBuyDate(new Date().toISOString().split('T')[0]);

    if (asset.asset_type === 'mutual_fund' || asset.exchange === 'MF') {
      setHoldingInstitution(asset.amc || 'Groww / Coin / Kuvera / CAMS');
    } else if (asset.exchange === 'NSE' || asset.exchange === 'BSE') {
      setHoldingInstitution('Zerodha');
    } else if (asset.asset_type === 'crypto') {
      setHoldingInstitution('Hardware Ledger / CoinDCX');
    } else {
      setHoldingInstitution('Brokerage');
    }

    setAssetFlowMode('configure');
  };

  // Submit configured market security holding
  const handleConfirmAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasterAsset) return;

    const shares = parseFloat(holdingShares) || 1;
    const buyPrice = parseFloat(holdingBuyPrice) || selectedMasterAsset.latest_price || 100;
    const currentPrice = selectedMasterAsset.latest_price || buyPrice;
    const totalValue = Math.round(shares * currentPrice * 100) / 100;
    const costBasis = Math.round(shares * buyPrice * 100) / 100;

    let category: AssetCategory = 'Equity';
    if (selectedMasterAsset.asset_type === 'crypto') category = 'Crypto';
    else if (selectedMasterAsset.asset_type === 'commodity') category = 'Commodities';
    else if (selectedMasterAsset.asset_type === 'mutual_fund') category = 'Equity';

    addAsset({
      name: selectedMasterAsset.name,
      category: category,
      subType: selectedMasterAsset.asset_type === 'mutual_fund' ? 'Equity Mutual Fund' : selectedMasterAsset.asset_type === 'etf' ? 'Index ETF' : 'Direct Equity (Stocks)',
      institution: holdingInstitution,
      value: totalValue,
      costBasis: costBasis,
      currency: selectedMasterAsset.currency === 'USD' ? 'USD' : 'INR',
      isLiquid: true,
      tags: holdingTags.length > 0 ? holdingTags : ['Long-term Savings'],
      purpose: holdingTags[0] || 'Long-term Savings',
      masterAssetId: selectedMasterAsset.id,
      isin: selectedMasterAsset.isin,
      bseCode: selectedMasterAsset.exchange === 'BSE' ? selectedMasterAsset.symbol : undefined,
      ticker: selectedMasterAsset.symbol,
      exchange: selectedMasterAsset.exchange,
      assetType: selectedMasterAsset.asset_type,
      schemeCode: selectedMasterAsset.scheme_code,
      fundHouse: selectedMasterAsset.amc,
      shares: shares,
      buyPrice: buyPrice,
      buyDate: holdingBuyDate,
      currentPrice: currentPrice,
      priceChange24h: selectedMasterAsset.price_change_percent,
      priceChange24hAmount: selectedMasterAsset.price_change,
      dataStatus: selectedMasterAsset.data_status,
      dataSource: selectedMasterAsset.data_source,
      plan: selectedMasterAsset.plan,
      option: selectedMasterAsset.option,
      navDate: selectedMasterAsset.nav_date,
      lastPriceSyncedAt: new Date().toISOString(),
      autoSyncMarketPrice: true
    });

    setSubmittedMessage(`Added ${selectedMasterAsset.name} to your portfolio!`);
    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
    }, 1200);
  };

  // Submit manual / physical asset
  const handleSaveManualAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualAssetValue) || 0;
    const cost = manualAssetCostBasis ? parseFloat(manualAssetCostBasis) : val;

    addAsset({
      name: manualAssetName || selectedAssetSubType?.name || 'Custom Asset',
      category: selectedAssetCategory?.id || 'Other',
      subType: selectedAssetSubType?.name || 'Manual Asset',
      institution: manualAssetInstitution || 'Personal Asset',
      value: val,
      costBasis: cost,
      currency: currency,
      isLiquid: manualAssetIsLiquid,
      tags: manualTags.length > 0 ? manualTags : ['Long-term Savings'],
      purpose: manualTags[0] || 'Long-term Savings',
      assetType: 'manual',
      lastPriceSyncedAt: new Date().toISOString(),
    });

    setSubmittedMessage(`Saved ${manualAssetName} to assets!`);
    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
    }, 1200);
  };

  // Submit liability
  const handleSaveLiability = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(liabBalance) || 0;
    const rate = parseFloat(liabInterestRate) || 0;
    const minPay = parseFloat(liabMinPayment) || 0;

    addLiability({
      name: liabName,
      category: selectedLiabType as LiabilityCategory,
      balance: bal,
      interestRate: rate,
      minimumPayment: minPay,
      institution: liabInstitution || 'Primary Bank',
      currency: currency
    });

    setSubmittedMessage(`Saved ${liabName} to liabilities!`);
    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
    }, 1200);
  };

  // Submit income/expense transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount) || 0;
    if (amt <= 0) return;

    addTransaction({
      amount: amt,
      currency: currency,
      type: activeTab === 'income' ? 'income' : 'expense',
      category: txCategory as any,
      description: txDescription || `${activeTab === 'income' ? 'Income' : 'Expense'} payment`,
      date: txDate,
      accountId: txAccountId,
      isRecurring: txIsRecurring
    });

    setSubmittedMessage(`Logged ${activeTab === 'income' ? 'income' : 'expense'} transaction of ${currentSymbol}${amt}!`);
    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
    }, 1200);
  };

  const expenseCategories: ExpenseCategory[] = [
    'Housing & Rent', 'Food & Groceries', 'Dining & Drinks', 'Transportation',
    'Utilities & Bills', 'Entertainment', 'Health & Wellness', 'Shopping & Tech',
    'Travel & Leisure', 'Education', 'Subscriptions', 'Investments', 'Other Expense'
  ];

  const incomeCategories: IncomeCategory[] = [
    'Salary & Wages', 'Freelance & Business', 'Investments & Dividends',
    'Rental Income', 'Side Hustle', 'Gifts & Grants', 'Other Income'
  ];

  return (
    <div 
      id="quick-add-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) closeQuickAdd();
      }}
    >
      <div 
        id="quick-add-modal-container"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* MODAL HEADER & TABS */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                {activeTab === 'asset' ? <Coins className="w-4 h-4" /> : activeTab === 'liability' ? <ShieldAlert className="w-4 h-4" /> : activeTab === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  {activeTab === 'asset' ? 'Add Asset to Portfolio' : activeTab === 'liability' ? 'Add Liability / Loan' : activeTab === 'income' ? 'Log Income' : 'Log Expense'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {activeTab === 'asset' ? 'Search Indian stocks, mutual funds, ETFs or log custom holdings' : 'Track finances with real-time valuation updates'}
                </p>
              </div>
            </div>

            <button
              id="btn-close-quick-add"
              type="button"
              onClick={closeQuickAdd}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary 4 Category Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 dark:bg-zinc-950 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              id="tab-modal-asset"
              onClick={() => {
                setActiveTab('asset');
                setAssetFlowMode('search');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeTab === 'asset'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700 font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Asset</span>
            </button>

            <button
              type="button"
              id="tab-modal-liability"
              onClick={() => {
                setActiveTab('liability');
                setLiabStep(1);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeTab === 'liability'
                  ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-zinc-700 font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Liability</span>
            </button>

            <button
              type="button"
              id="tab-modal-income"
              onClick={() => setActiveTab('income')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeTab === 'income'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700 font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>

            <button
              type="button"
              id="tab-modal-expense"
              onClick={() => setActiveTab('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeTab === 'expense'
                  ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-zinc-700 font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {submittedMessage ? (
            <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {submittedMessage}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Synchronizing with master catalog and recalculating net worth...
              </p>
            </div>
          ) : (
            <>
              {/* =========================================================================
                  1. ASSET FLOW (SEARCH STOCKS, MUTUAL FUNDS, ETFS)
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'search' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Top Switcher: Market Search vs Physical/Custom Asset */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                        Live Market Search
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setAssetFlowMode('category');
                        setSelectedAssetCategory(null);
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Add Real Estate / Physical Asset</span>
                      <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>

                  {/* Primary Search Box */}
                  <div className="relative">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        id="input-asset-search"
                        type="text"
                        autoFocus
                        value={marketSearchQuery}
                        onChange={e => setMarketSearchQuery(e.target.value)}
                        placeholder="Search stocks, mutual funds, ETFs, etc. (e.g. Reliance, TCS, HDFC Flexi Cap)"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl pl-10 pr-9 py-3 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium shadow-sm"
                      />
                      {marketSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setMarketSearchQuery('')}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Example Search Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium shrink-0">
                      Examples:
                    </span>
                    {QUICK_SEARCH_CHIPS.map(chip => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setMarketSearchQuery(chip.query)}
                        className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer font-medium ${
                          marketSearchQuery === chip.query
                            ? 'bg-emerald-500 text-zinc-950 font-bold'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Filter Sub-Tabs: All vs Stocks vs Mutual Funds */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setMarketFilter('all')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                          marketFilter === 'all'
                            ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm'
                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        All Market Assets
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarketFilter('stock')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                          marketFilter === 'stock'
                            ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm'
                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        Stocks & ETFs
                      </button>
                      <button
                        type="button"
                        onClick={() => setMarketFilter('mutual_fund')}
                        className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                          marketFilter === 'mutual_fund'
                            ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm'
                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        Mutual Funds (NAV)
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                      {isSearching ? 'Searching live...' : `${searchResults.length} results`}
                    </span>
                  </div>

                  {/* Search Results Display List */}
                  <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pr-0.5">
                    {searchResults.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
                        <Coins className="w-8 h-8 mx-auto text-slate-400" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          No matching securities found for "{marketSearchQuery}"
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                          Try searching for Reliance, TCS, HDFC Flexi Cap, or use custom physical asset entry.
                        </p>
                      </div>
                    ) : (
                      searchResults.map(item => {
                        const isMF = item.asset_type === 'mutual_fund' || item.exchange === 'MF';
                        const changeAmount = item.price_change ?? item.nav_change ?? 0;
                        const changePercent = item.price_change_percent ?? item.nav_change_percent ?? 0;
                        const isPositive = changeAmount >= 0;
                        const formattedPrice = item.currency === 'USD' ? `$${item.latest_price.toFixed(2)}` : `₹${item.latest_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              {/* Left details */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {item.name}
                                  </h4>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                                    isMF 
                                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  }`}>
                                    {isMF ? 'Mutual Fund' : item.asset_type === 'etf' ? 'ETF' : 'Stock'}
                                  </span>
                                </div>

                                {/* Detailed Prompt-compliant Metadata */}
                                {isMF ? (
                                  /* Mutual Fund Metadata Structure */
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 font-mono">
                                    {item.amc && (
                                      <div>
                                        <span className="text-slate-400 dark:text-zinc-500">AMC:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.amc}</strong>
                                      </div>
                                    )}
                                    {item.scheme_code && (
                                      <div>
                                        <span className="text-slate-400 dark:text-zinc-500">Scheme code:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.scheme_code}</strong>
                                      </div>
                                    )}
                                    {item.isin && (
                                      <div>
                                        <span className="text-slate-400 dark:text-zinc-500">ISIN:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.isin}</strong>
                                      </div>
                                    )}
                                    {item.plan && (
                                      <div>
                                        <span className="text-slate-400 dark:text-zinc-500">Plan:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.plan}</strong>
                                      </div>
                                    )}
                                    {item.option && (
                                      <div>
                                        <span className="text-slate-400 dark:text-zinc-500">Option:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.option}</strong>
                                      </div>
                                    )}
                                    {item.category && (
                                      <div>
                                        <span className="text-slate-400 dark:text-zinc-500">Category:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.category}</strong>
                                      </div>
                                    )}
                                    {item.nav_date && (
                                      <div>
                                        <span className="text-slate-400 dark:text-zinc-500">NAV Date:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.nav_date}</strong>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-slate-400 dark:text-zinc-500">Data status:</span> <strong className="text-emerald-600 dark:text-emerald-400">{item.data_status || 'Daily NAV'}</strong>
                                    </div>
                                  </div>
                                ) : (
                                  /* Stock Metadata Structure */
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 font-mono">
                                    <div>
                                      <span className="text-slate-400 dark:text-zinc-500">Symbol:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.symbol}</strong>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 dark:text-zinc-500">Exchange:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.exchange}</strong>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 dark:text-zinc-500">Type:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.asset_type === 'etf' ? 'ETF' : 'Stock'}</strong>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 dark:text-zinc-500">ISIN:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.isin || 'INE002A01018'}</strong>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 dark:text-zinc-500">Data status:</span> <strong className="text-emerald-600 dark:text-emerald-400">{item.data_status || 'Real-time'}</strong>
                                    </div>
                                    <div>
                                      <span className="text-slate-400 dark:text-zinc-500">Last updated:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.last_updated}</strong>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right Pricing & [+ Add] Action Button */}
                              <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                                <div>
                                  <span className="text-xs text-slate-400 dark:text-zinc-500 block font-mono">
                                    {isMF ? 'Latest NAV' : 'Latest Price'}
                                  </span>
                                  <span className="text-base font-bold font-mono text-slate-900 dark:text-zinc-100">
                                    {formattedPrice}
                                  </span>
                                  <div className={`text-[11px] font-mono font-semibold flex items-center justify-end gap-0.5 ${
                                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                  }`}>
                                    <span>{isPositive ? '+' : ''}{item.currency === 'USD' ? '$' : '₹'}{Math.abs(changeAmount).toFixed(2)}</span>
                                    <span>({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mt-3">
                                  {/* View on Google Finance Link */}
                                  {!isMF && (
                                    <a
                                      href={getGoogleFinanceUrl(item.symbol, item.exchange)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] text-slate-500 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                      title="View on Google Finance"
                                    >
                                      <span>Google Finance</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}

                                  {/* [+ Add] Button */}
                                  <button
                                    id={`btn-add-security-${item.id}`}
                                    type="button"
                                    onClick={() => handleInitiateAdd(item)}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>+ Add</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  2. CONFIGURE HOLDING DETAILS (After user clicks [+ Add])
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'configure' && selectedMasterAsset && (
                <form onSubmit={handleConfirmAddHolding} className="space-y-4 animate-in fade-in duration-150">
                  {/* Selected Security Banner */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {selectedMasterAsset.name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {selectedMasterAsset.exchange}: {selectedMasterAsset.symbol}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                        {selectedMasterAsset.isin ? `ISIN: ${selectedMasterAsset.isin} • ` : ''}
                        Latest {selectedMasterAsset.asset_type === 'mutual_fund' ? 'NAV' : 'Price'}: 
                        <strong className="text-slate-900 dark:text-white font-bold ml-1">
                          {selectedMasterAsset.currency === 'USD' ? '$' : '₹'}{selectedMasterAsset.latest_price.toFixed(2)}
                        </strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('search')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1 rounded"
                    >
                      Change
                    </button>
                  </div>

                  {/* Quantity & Buy Price Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Quantity / {selectedMasterAsset.asset_type === 'mutual_fund' ? 'Units' : 'Shares'} *
                      </label>
                      <input
                        id="input-holding-shares"
                        type="number"
                        step="0.001"
                        required
                        autoFocus
                        value={holdingShares}
                        onChange={e => setHoldingShares(e.target.value)}
                        placeholder="1.00"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Average Buy Price ({selectedMasterAsset.currency === 'USD' ? '$' : '₹'}) *
                      </label>
                      <input
                        id="input-holding-buyprice"
                        type="number"
                        step="0.01"
                        required
                        value={holdingBuyPrice}
                        onChange={e => setHoldingBuyPrice(e.target.value)}
                        placeholder={selectedMasterAsset.latest_price.toFixed(2)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Institution & Purchase Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Broker / Depository Custodian
                      </label>
                      <input
                        type="text"
                        value={holdingInstitution}
                        onChange={e => setHoldingInstitution(e.target.value)}
                        placeholder="e.g. Zerodha, Groww, AngelOne, Upstox"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={holdingBuyDate}
                        onChange={e => setHoldingBuyDate(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Manual Tags & Purpose Categorization */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        <Tag className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Investment Tags & Purpose</span>
                      </label>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400">Categorize your goal</span>
                    </div>

                    {/* Popular Tag Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {DEFAULT_ASSET_TAGS.map(t => {
                        const isSelected = holdingTags.includes(t.name);
                        return (
                          <button
                            key={t.name}
                            type="button"
                            onClick={() => toggleHoldingTag(t.name)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                              isSelected
                                ? `${t.badgeClass} ring-1 ring-emerald-400/30 shadow-xs`
                                : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            <span>{t.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Tag Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={holdingCustomTag}
                        onChange={e => setHoldingCustomTag(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addHoldingCustomTag();
                          }
                        }}
                        placeholder="Add custom tag (e.g. House 2027, College)..."
                        className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={addHoldingCustomTag}
                        disabled={!holdingCustomTag.trim()}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-medium cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Active Selected Tags Preview */}
                    {holdingTags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                        <span className="text-zinc-500 font-medium">Selected:</span>
                        {holdingTags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => toggleHoldingTag(tag)}
                              className="hover:text-rose-400 ml-0.5 cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Calculated Investment Card */}
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Total Invested Cost Basis</span>
                      <strong className="text-slate-900 dark:text-zinc-100 font-bold text-sm">
                        {selectedMasterAsset.currency === 'USD' ? '$' : '₹'}
                        {((parseFloat(holdingShares) || 1) * (parseFloat(holdingBuyPrice) || selectedMasterAsset.latest_price)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Current Market Valuation</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        {selectedMasterAsset.currency === 'USD' ? '$' : '₹'}
                        {((parseFloat(holdingShares) || 1) * selectedMasterAsset.latest_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('search')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Search</span>
                    </button>

                    <button
                      id="btn-confirm-add-holding"
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Add to My Portfolio</span>
                    </button>
                  </div>
                </form>
              )}

              {/* =========================================================================
                  3. PHYSICAL / MANUAL ASSETS (Real Estate, Cash, Debt, FD, Vehicles)
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'category' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('search')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Live Market Search</span>
                    </button>
                    <span className="text-xs text-slate-400 dark:text-zinc-500">
                      Physical / Custom Assets
                    </span>
                  </div>

                  {!selectedAssetCategory ? (
                    <div className="grid grid-cols-2 gap-3">
                      {ASSET_TAXONOMY.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedAssetCategory(cat)}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                        >
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 font-bold text-sm"
                            style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                          >
                            <Coins className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                            {cat.subTypes.length} sub-classes
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={handleSaveManualAsset} className="space-y-4">
                      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {selectedAssetCategory.name}
                          </span>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                            {selectedAssetCategory.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedAssetCategory(null)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Change Category
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Asset Name / Description *
                        </label>
                        <input
                          type="text"
                          required
                          autoFocus
                          value={manualAssetName}
                          onChange={e => setManualAssetName(e.target.value)}
                          placeholder="e.g. 3BHK Apartment in Mumbai, HDFC 5-Year FD, Gold Bar 24K"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                            Estimated Value ({currentSymbol}) *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={manualAssetValue}
                            onChange={e => setManualAssetValue(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                            Original Cost Basis ({currentSymbol})
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={manualAssetCostBasis}
                            onChange={e => setManualAssetCostBasis(e.target.value)}
                            placeholder="Optional"
                            className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Bank / Location / Custodian
                        </label>
                        <input
                          type="text"
                          value={manualAssetInstitution}
                          onChange={e => setManualAssetInstitution(e.target.value)}
                          placeholder="e.g. HDFC Bank, SBI, Home Safe, Registrar Office"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>

                      {/* Manual Tags & Purpose Categorization */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                            <Tag className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Investment Tags & Purpose</span>
                          </label>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400">Categorize your goal</span>
                        </div>

                        {/* Popular Tag Chips */}
                        <div className="flex flex-wrap gap-1.5">
                          {DEFAULT_ASSET_TAGS.map(t => {
                            const isSelected = manualTags.includes(t.name);
                            return (
                              <button
                                key={t.name}
                                type="button"
                                onClick={() => toggleManualTag(t.name)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                                  isSelected
                                    ? `${t.badgeClass} ring-1 ring-emerald-400/30 shadow-xs`
                                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                                <span>{t.name}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Tag Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={manualCustomTag}
                            onChange={e => setManualCustomTag(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addManualCustomTag();
                              }
                            }}
                            placeholder="Add custom tag (e.g. House 2027, College)..."
                            className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={addManualCustomTag}
                            disabled={!manualCustomTag.trim()}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 text-xs font-medium cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>

                        {/* Active Selected Tags Preview */}
                        {manualTags.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                            <span className="text-zinc-500 font-medium">Selected:</span>
                            {manualTags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => toggleManualTag(tag)}
                                  className="hover:text-rose-400 ml-0.5 cursor-pointer"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Liquidity toggle */}
                      <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                        <input
                          type="checkbox"
                          checked={manualAssetIsLiquid}
                          onChange={e => setManualAssetIsLiquid(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded bg-white dark:bg-zinc-900 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                            Liquid Asset
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                            Can be easily converted to cash in under 7 days.
                          </span>
                        </div>
                      </label>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => setSelectedAssetCategory(null)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Save Asset</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* =========================================================================
                  4. LIABILITY FLOW
                 ========================================================================= */}
              {activeTab === 'liability' && liabStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Select Liability Type
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      {LIABILITY_TAXONOMY.length} types
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {LIABILITY_TAXONOMY.map(liab => (
                      <button
                        key={liab.id}
                        type="button"
                        onClick={() => {
                          setSelectedLiabType(liab.name);
                          setLiabInstitution(liab.suggestedCreditors?.[0] || 'HDFC Bank');
                          setLiabStep(2);
                        }}
                        className="p-3.5 rounded-xl bg-white dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 hover:border-rose-500 dark:hover:border-rose-500 hover:bg-rose-50/30 dark:hover:bg-rose-500/10 text-left transition-all group flex flex-col justify-between cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 block">
                            {liab.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate block mt-0.5">
                            {liab.description}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'liability' && liabStep === 2 && (
                <form onSubmit={handleSaveLiability} className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-500 flex items-center justify-center">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {selectedLiabType}
                        </span>
                        <span className="block text-[11px] text-slate-500 dark:text-zinc-400">
                          Liability Category
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLiabStep(1)}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 rounded"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Liability / Loan Title *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={liabName}
                      onChange={e => setLiabName(e.target.value)}
                      placeholder="e.g. Primary Residence Home Loan, Car Loan"
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Outstanding Principal ({currentSymbol}) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={liabBalance}
                        onChange={e => setLiabBalance(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Creditor / Bank
                      </label>
                      <input
                        type="text"
                        value={liabInstitution}
                        onChange={e => setLiabInstitution(e.target.value)}
                        placeholder="e.g. HDFC, SBI, ICICI, Axis"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Interest Rate (APR %)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={liabInterestRate}
                        onChange={e => setLiabInterestRate(e.target.value)}
                        placeholder="e.g. 8.5"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Monthly EMI / Minimum Due ({currentSymbol})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={liabMinPayment}
                        onChange={e => setLiabMinPayment(e.target.value)}
                        placeholder="e.g. 25000"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setLiabStep(1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save Liability</span>
                    </button>
                  </div>
                </form>
              )}

              {/* =========================================================================
                  5. INCOME & EXPENSE FLOW
                 ========================================================================= */}
              {(activeTab === 'income' || activeTab === 'expense') && (
                <form onSubmit={handleSaveTransaction} className="space-y-4 animate-in fade-in duration-150">
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                    activeTab === 'income'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${activeTab === 'income' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span>
                      {activeTab === 'income'
                        ? 'Logging income records incoming cash flow to your Monthly Income (Inflow) and updates your net savings.'
                        : 'Logging expense records cash outflow to Monthly Expenses and updates your budget tracking.'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Amount ({currentSymbol}) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-400 font-mono font-bold text-lg">
                        {currentSymbol}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        autoFocus
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl pl-10 pr-4 py-3 font-mono text-xl font-bold focus:outline-none focus:ring-2 ${
                          activeTab === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500/30 focus:border-emerald-500'
                            : 'text-rose-600 dark:text-rose-400 focus:ring-rose-500/30 focus:border-rose-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Description / Payee
                    </label>
                    <input
                      type="text"
                      value={txDescription}
                      onChange={e => setTxDescription(e.target.value)}
                      placeholder={activeTab === 'income' ? 'e.g. Monthly Salary, Freelance Client' : 'e.g. Whole Foods Groceries, Electricity bill'}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={txCategory}
                        onChange={e => setTxCategory(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      >
                        {activeTab === 'income'
                          ? incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                          : expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Linked Account
                      </label>
                      <select
                        value={txAccountId}
                        onChange={e => setTxAccountId(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.institution})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        value={txDate}
                        onChange={e => setTxDate(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300 text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={txIsRecurring}
                          onChange={e => setTxIsRecurring(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-zinc-900 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Recurring Monthly</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={closeQuickAdd}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg transition-all cursor-pointer ${
                        activeTab === 'income'
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                          : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                      }`}
                    >
                      Save {activeTab === 'income' ? 'Income' : 'Expense'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
