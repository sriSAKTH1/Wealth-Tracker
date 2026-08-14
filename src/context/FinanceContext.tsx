import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Asset, 
  Liability, 
  AccountItem, 
  Transaction, 
  BudgetEnvelope, 
  EssentialGoal, 
  CustomGoal, 
  ScheduledCalendarItem, 
  NetWorthSnapshot,
  CurrencyCode,
  CurrencyConfig,
  AppTheme,
  MainTab,
  WealthSubTab,
  GoalsSubTab,
  AccountSubTab,
  MoreSubTab,
  AssetCategory,
  TransactionType
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_LIABILITIES,
  INITIAL_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_ESSENTIAL_GOALS,
  INITIAL_CUSTOM_GOALS,
  INITIAL_SCHEDULED_ITEMS,
  INITIAL_NET_WORTH_HISTORY
} from '../data/initialData';

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 1.08 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 1.28 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 0.73 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 0.65 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 0.012 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 0.0068 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 0.76 },
  CHF: { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc', rateToUSD: 1.13 },
};

interface FinanceContextType {
  // Navigation
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  wealthSubTab: WealthSubTab;
  setWealthSubTab: (tab: WealthSubTab) => void;
  goalsSubTab: GoalsSubTab;
  setGoalsSubTab: (tab: GoalsSubTab) => void;
  accountSubTab: AccountSubTab;
  setAccountSubTab: (tab: AccountSubTab) => void;
  moreSubTab: MoreSubTab;
  setMoreSubTab: (tab: MoreSubTab) => void;

  // Modals & UI Controls
  isPrivateMode: boolean;
  togglePrivateMode: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  formatMoney: (amount: number, options?: { hideSign?: boolean; showCents?: boolean }) => string;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isMobileFrameSimulated: boolean;
  toggleMobileFrame: () => void;

  isQuickAddOpen: boolean;
  quickAddType: 'income' | 'expense' | 'asset' | 'liability';
  openQuickAdd: (type?: 'income' | 'expense' | 'asset' | 'liability') => void;
  closeQuickAdd: () => void;

  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Data
  assets: Asset[];
  liabilities: Liability[];
  accounts: AccountItem[];
  transactions: Transaction[];
  budgets: BudgetEnvelope[];
  essentialGoals: EssentialGoal[];
  customGoals: CustomGoal[];
  scheduledItems: ScheduledCalendarItem[];
  netWorthHistory: NetWorthSnapshot[];

  // CRUD Actions
  addAsset: (asset: Omit<Asset, 'id' | 'lastUpdated'>) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  addLiability: (liability: Omit<Liability, 'id' | 'lastUpdated'>) => void;
  updateLiability: (id: string, updates: Partial<Liability>) => void;
  deleteLiability: (id: string) => void;

  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addAccount: (account: Omit<AccountItem, 'id' | 'lastSynced'>) => void;
  updateAccount: (id: string, updates: Partial<AccountItem>) => void;
  deleteAccount: (id: string) => void;

  updateBudget: (id: string, newAllocated: number) => void;
  addBudgetCategory: (category: BudgetEnvelope['category'], amount: number) => void;

  updateEssentialGoal: (id: string, updates: Partial<EssentialGoal>) => void;
  addCustomGoal: (goal: Omit<CustomGoal, 'id'>) => void;
  updateCustomGoal: (id: string, updates: Partial<CustomGoal>) => void;
  deleteCustomGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  addScheduledItem: (item: Omit<ScheduledCalendarItem, 'id'>) => void;
  deleteScheduledItem: (id: string) => void;

  // Utilities
  importData: (importedJson: any) => boolean;
  exportDataJSON: () => void;
  exportTransactionsCSV: () => void;
  resetToDefaultData: () => void;

  // Computed Analytics
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netSavings: number;
  savingsRate: number;
  liquidCash: number;
  liquidRunwayMonths: number;
  debtToAssetRatio: number;
  assetAllocationBreakdown: { category: AssetCategory; value: number; percentage: number; color: string }[];
  healthScore: { score: number; grade: string; metrics: { label: string; score: number; status: 'good' | 'warning' | 'needs_work'; desc: string }[] };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aura_wealth_data_v2';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('overview');
  const [wealthSubTab, setWealthSubTab] = useState<WealthSubTab>('assets');
  const [goalsSubTab, setGoalsSubTab] = useState<GoalsSubTab>('essential');
  const [accountSubTab, setAccountSubTab] = useState<AccountSubTab>('money');
  const [moreSubTab, setMoreSubTab] = useState<MoreSubTab>('import');

  // UI state
  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(() => {
    return localStorage.getItem('aura_private_mode') === 'true';
  });
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return (localStorage.getItem('aura_currency') as CurrencyCode) || 'USD';
  });
  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('aura_theme') as AppTheme) || 'light';
  });
  const [isMobileFrameSimulated, setIsMobileFrameSimulated] = useState<boolean>(false);

  // Quick Add & Search Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'income' | 'expense' | 'asset' | 'liability'>('income');
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Data State
  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_assets`);
    return saved ? JSON.parse(saved) : INITIAL_ASSETS;
  });

  const [liabilities, setLiabilities] = useState<Liability[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_liabilities`);
    return saved ? JSON.parse(saved) : INITIAL_LIABILITIES;
  });

  const [accounts, setAccounts] = useState<AccountItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_accounts`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<BudgetEnvelope[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_budgets`);
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [essentialGoals, setEssentialGoals] = useState<EssentialGoal[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_essential_goals`);
    return saved ? JSON.parse(saved) : INITIAL_ESSENTIAL_GOALS;
  });

  const [customGoals, setCustomGoals] = useState<CustomGoal[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_custom_goals`);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_GOALS;
  });

  const [scheduledItems, setScheduledItems] = useState<ScheduledCalendarItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_scheduled`);
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULED_ITEMS;
  });

  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthSnapshot[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_history`);
    return saved ? JSON.parse(saved) : INITIAL_NET_WORTH_HISTORY;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_assets`, JSON.stringify(assets));
  }, [assets]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_liabilities`, JSON.stringify(liabilities));
  }, [liabilities]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_accounts`, JSON.stringify(accounts));
  }, [accounts]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transactions`, JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_budgets`, JSON.stringify(budgets));
  }, [budgets]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_essential_goals`, JSON.stringify(essentialGoals));
  }, [essentialGoals]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_custom_goals`, JSON.stringify(customGoals));
  }, [customGoals]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_scheduled`, JSON.stringify(scheduledItems));
  }, [scheduledItems]);
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_history`, JSON.stringify(netWorthHistory));
  }, [netWorthHistory]);

  const togglePrivateMode = () => {
    setIsPrivateMode(prev => {
      const next = !prev;
      localStorage.setItem('aura_private_mode', String(next));
      return next;
    });
  };

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem('aura_currency', c);
  };

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem('aura_theme', t);
  };

  const toggleMobileFrame = () => {
    setIsMobileFrameSimulated(prev => !prev);
  };

  const currencyConfig = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;

  const formatMoney = (amount: number, options?: { hideSign?: boolean; showCents?: boolean }) => {
    if (isPrivateMode) {
      return '••••••';
    }
    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const formattedNum = absVal.toLocaleString('en-US', {
      minimumFractionDigits: options?.showCents ? 2 : (absVal < 100 && absVal % 1 !== 0 ? 2 : 0),
      maximumFractionDigits: 2,
    });
    const prefix = !options?.hideSign && isNegative ? '-' : '';
    return `${prefix}${currencyConfig.symbol}${formattedNum}`;
  };

  const openQuickAdd = (type: 'income' | 'expense' | 'asset' | 'liability' = 'income') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
  };

  // Computations
  const totalAssets = useMemo(() => {
    return assets.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [assets]);

  const totalLiabilities = useMemo(() => {
    return liabilities.reduce((sum, item) => sum + (Number(item.balance) || 0), 0);
  }, [liabilities]);

  const netWorth = totalAssets - totalLiabilities;

  const monthlyIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [transactions]);

  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round((netSavings / monthlyIncome) * 100)) : 0;

  const liquidCash = useMemo(() => {
    return assets
      .filter(a => a.isLiquid || a.category === 'Cash & Bank')
      .reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  }, [assets]);

  const liquidRunwayMonths = monthlyExpenses > 0 
    ? Number((liquidCash / monthlyExpenses).toFixed(1)) 
    : 12;

  const debtToAssetRatio = totalAssets > 0 
    ? Number(((totalLiabilities / totalAssets) * 100).toFixed(1)) 
    : 0;

  // Asset class breakdown
  const assetAllocationBreakdown = useMemo(() => {
    const map: Record<string, { value: number; color: string }> = {};
    const defaultColors: Record<AssetCategory, string> = {
      'Cash & Bank': '#3b82f6',
      'Stocks & ETFs': '#0ea5e9',
      'Crypto': '#6366f1',
      'Real Estate': '#10b981',
      'Retirement (401k/IRA)': '#f59e0b',
      'Vehicles & Valuables': '#f43f5e',
      'Fixed Income & Bonds': '#8b5cf6',
      'Other Assets': '#64748b',
    };

    assets.forEach(a => {
      if (!map[a.category]) {
        map[a.category] = {
          value: 0,
          color: a.color || defaultColors[a.category] || '#3b82f6',
        };
      }
      map[a.category].value += a.value;
    });

    return Object.entries(map).map(([category, data]) => ({
      category: category as AssetCategory,
      value: data.value,
      percentage: totalAssets > 0 ? Number(((data.value / totalAssets) * 100).toFixed(1)) : 0,
      color: data.color,
    })).sort((a, b) => b.value - a.value);
  }, [assets, totalAssets]);

  // Health Score Calculation
  const healthScore = useMemo(() => {
    // 1. Runway Score (0-25): 6 months = 25 pts
    const runwayScore = Math.min(25, Math.round((liquidRunwayMonths / 6) * 25));
    
    // 2. Savings Rate Score (0-25): 20%+ = 25 pts
    const savingsScore = Math.min(25, Math.round((savingsRate / 20) * 25));

    // 3. Debt to Asset Score (0-25): < 40% is optimal
    const debtRatio = debtToAssetRatio;
    let debtScore = 25;
    if (debtRatio > 60) debtScore = 5;
    else if (debtRatio > 50) debtScore = 12;
    else if (debtRatio > 40) debtScore = 18;
    else debtScore = 25;

    // 4. Asset Diversification (0-25): 3+ distinct asset classes = 25 pts
    const distinctClasses = new Set(assets.map(a => a.category)).size;
    const diversityScore = Math.min(25, distinctClasses * 7);

    const total = runwayScore + savingsScore + debtScore + diversityScore;
    let grade = 'A+';
    if (total < 60) grade = 'C';
    else if (total < 75) grade = 'B';
    else if (total < 90) grade = 'A';

    return {
      score: total,
      grade,
      metrics: [
        {
          label: 'Emergency Runway',
          score: runwayScore,
          status: liquidRunwayMonths >= 6 ? 'good' : (liquidRunwayMonths >= 3 ? 'warning' : 'needs_work') as any,
          desc: `${liquidRunwayMonths} months liquid cash runway ($${liquidCash.toLocaleString()})`,
        },
        {
          label: 'Savings Velocity',
          score: savingsScore,
          status: savingsRate >= 20 ? 'good' : (savingsRate >= 10 ? 'warning' : 'needs_work') as any,
          desc: `${savingsRate}% of gross income saved monthly`,
        },
        {
          label: 'Debt Leverage Ratio',
          score: debtScore,
          status: debtRatio <= 45 ? 'good' : (debtRatio <= 60 ? 'warning' : 'needs_work') as any,
          desc: `${debtRatio}% debt-to-asset balance sheet load`,
        },
        {
          label: 'Asset Diversification',
          score: diversityScore,
          status: distinctClasses >= 4 ? 'good' : (distinctClasses >= 2 ? 'warning' : 'needs_work') as any,
          desc: `${distinctClasses} distinct capital asset classes active`,
        },
      ]
    };
  }, [liquidRunwayMonths, liquidCash, savingsRate, debtToAssetRatio, assets]);

  // Asset CRUD
  const addAsset = (data: Omit<Asset, 'id' | 'lastUpdated'>) => {
    const newAsset: Asset = {
      ...data,
      id: `ast-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setAssets(prev => [newAsset, ...prev]);
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : a));
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  // Liability CRUD
  const addLiability = (data: Omit<Liability, 'id' | 'lastUpdated'>) => {
    const newLiab: Liability = {
      ...data,
      id: `liab-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setLiabilities(prev => [newLiab, ...prev]);
  };

  const updateLiability = (id: string, updates: Partial<Liability>) => {
    setLiabilities(prev => prev.map(l => l.id === id ? { ...l, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : l));
  };

  const deleteLiability = (id: string) => {
    setLiabilities(prev => prev.filter(l => l.id !== id));
  };

  // Transaction CRUD
  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}`,
    };
    setTransactions(prev => [newTx, ...prev]);

    // Optional balance update for linked account
    if (data.accountId) {
      setAccounts(prev => prev.map(acc => {
        if (acc.id === data.accountId) {
          const delta = data.type === 'income' ? data.amount : -data.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      }));
    }
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Account CRUD
  const addAccount = (data: Omit<AccountItem, 'id' | 'lastSynced'>) => {
    const newAcc: AccountItem = {
      ...data,
      id: `acc-${Date.now()}`,
      lastSynced: 'Just now',
    };
    setAccounts(prev => [...prev, newAcc]);
  };

  const updateAccount = (id: string, updates: Partial<AccountItem>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  // Budget
  const updateBudget = (id: string, newAllocated: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, allocatedAmount: newAllocated } : b));
  };

  const addBudgetCategory = (category: BudgetEnvelope['category'], amount: number) => {
    const exists = budgets.find(b => b.category === category);
    if (exists) {
      updateBudget(exists.id, amount);
      return;
    }
    const newB: BudgetEnvelope = {
      id: `b-${Date.now()}`,
      category,
      allocatedAmount: amount,
      period: 'monthly',
      color: '#3b82f6',
    };
    setBudgets(prev => [...prev, newB]);
  };

  // Goals
  const updateEssentialGoal = (id: string, updates: Partial<EssentialGoal>) => {
    setEssentialGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : g));
  };

  const addCustomGoal = (data: Omit<CustomGoal, 'id'>) => {
    const newGoal: CustomGoal = {
      ...data,
      id: `goal-${Date.now()}`,
    };
    setCustomGoals(prev => [...prev, newGoal]);
  };

  const updateCustomGoal = (id: string, updates: Partial<CustomGoal>) => {
    setCustomGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const deleteCustomGoal = (id: string) => {
    setCustomGoals(prev => prev.filter(g => g.id !== id));
  };

  const contributeToGoal = (id: string, amount: number) => {
    setCustomGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextAmount = g.currentAmount + amount;
        return {
          ...g,
          currentAmount: nextAmount,
          isCompleted: nextAmount >= g.targetAmount,
        };
      }
      return g;
    }));
  };

  // Calendar
  const addScheduledItem = (data: Omit<ScheduledCalendarItem, 'id'>) => {
    const newItem: ScheduledCalendarItem = {
      ...data,
      id: `cal-${Date.now()}`,
    };
    setScheduledItems(prev => [...prev, newItem]);
  };

  const deleteScheduledItem = (id: string) => {
    setScheduledItems(prev => prev.filter(i => i.id !== id));
  };

  // Utilities
  const importData = (data: any): boolean => {
    try {
      if (data.assets) setAssets(data.assets);
      if (data.liabilities) setLiabilities(data.liabilities);
      if (data.accounts) setAccounts(data.accounts);
      if (data.transactions) setTransactions(data.transactions);
      if (data.budgets) setBudgets(data.budgets);
      if (data.essentialGoals) setEssentialGoals(data.essentialGoals);
      if (data.customGoals) setCustomGoals(data.customGoals);
      if (data.scheduledItems) setScheduledItems(data.scheduledItems);
      if (data.netWorthHistory) setNetWorthHistory(data.netWorthHistory);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  };

  const exportDataJSON = () => {
    const payload = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      currency,
      assets,
      liabilities,
      accounts,
      transactions,
      budgets,
      essentialGoals,
      customGoals,
      scheduledItems,
      netWorthHistory,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura-wealth-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTransactionsCSV = () => {
    const headers = ['ID', 'Date', 'Description', 'Type', 'Category', 'Amount', 'Account', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.amount,
      `"${t.accountName || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetToDefaultData = () => {
    setAssets(INITIAL_ASSETS);
    setLiabilities(INITIAL_LIABILITIES);
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setEssentialGoals(INITIAL_ESSENTIAL_GOALS);
    setCustomGoals(INITIAL_CUSTOM_GOALS);
    setScheduledItems(INITIAL_SCHEDULED_ITEMS);
    setNetWorthHistory(INITIAL_NET_WORTH_HISTORY);
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        wealthSubTab,
        setWealthSubTab,
        goalsSubTab,
        setGoalsSubTab,
        accountSubTab,
        setAccountSubTab,
        moreSubTab,
        setMoreSubTab,
        isPrivateMode,
        togglePrivateMode,
        currency,
        setCurrency,
        currencyConfig,
        formatMoney,
        theme,
        setTheme,
        isMobileFrameSimulated,
        toggleMobileFrame,
        isQuickAddOpen,
        quickAddType,
        openQuickAdd,
        closeQuickAdd,
        isSearchOpen,
        setSearchOpen,
        searchQuery,
        setSearchQuery,
        assets,
        liabilities,
        accounts,
        transactions,
        budgets,
        essentialGoals,
        customGoals,
        scheduledItems,
        netWorthHistory,
        addAsset,
        updateAsset,
        deleteAsset,
        addLiability,
        updateLiability,
        deleteLiability,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        updateBudget,
        addBudgetCategory,
        updateEssentialGoal,
        addCustomGoal,
        updateCustomGoal,
        deleteCustomGoal,
        contributeToGoal,
        addScheduledItem,
        deleteScheduledItem,
        importData,
        exportDataJSON,
        exportTransactionsCSV,
        resetToDefaultData,
        totalAssets,
        totalLiabilities,
        netWorth,
        monthlyIncome,
        monthlyExpenses,
        netSavings,
        savingsRate,
        liquidCash,
        liquidRunwayMonths,
        debtToAssetRatio,
        assetAllocationBreakdown,
        healthScore,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
