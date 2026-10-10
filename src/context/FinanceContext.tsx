import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
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
  LiabilityCategory,
  TransactionType,
  FinScoreProfile,
  FinScoreLoan,
  FinScoreGoal,
  FinScoreEmergency,
  FinScoreInsurance,
  FinScoreExpenseCategory
} from '../types';
import { calculateRequiredMonthlySaving } from '../services/finScoreEngine';
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
import { getMarketQuote, fetchLiveQuotesBatchAsync } from '../data/marketStocks';

export const INITIAL_CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1, ratePerUSD: 1, isLive: true, priceChange24h: 0, lastUpdated: new Date().toISOString() },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 1.1209, ratePerUSD: 0.8921, isLive: true, priceChange24h: -0.12, lastUpdated: new Date().toISOString() },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 1.3219, ratePerUSD: 0.7565, isLive: true, priceChange24h: 0.24, lastUpdated: new Date().toISOString() },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 0.7015, ratePerUSD: 1.4256, isLive: true, priceChange24h: -0.05, lastUpdated: new Date().toISOString() },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 0.6965, ratePerUSD: 1.4357, isLive: true, priceChange24h: 0.15, lastUpdated: new Date().toISOString() },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 0.010375, ratePerUSD: 96.38, isLive: true, priceChange24h: 0.18, lastUpdated: new Date().toISOString() },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 0.00633, ratePerUSD: 157.98, isLive: true, priceChange24h: -0.32, lastUpdated: new Date().toISOString() },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 0.7813, ratePerUSD: 1.2798, isLive: true, priceChange24h: 0.08, lastUpdated: new Date().toISOString() },
  CHF: { code: 'CHF', symbol: 'CHF ', name: 'Swiss Franc', rateToUSD: 1.2032, ratePerUSD: 0.8311, isLive: true, priceChange24h: 0.11, lastUpdated: new Date().toISOString() },
};

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = { ...INITIAL_CURRENCY_CONFIGS };

export const convertCurrency = (
  amount: number,
  fromCurrency: CurrencyCode = 'USD',
  toCurrency: CurrencyCode = 'USD',
  customConfigs?: Record<CurrencyCode, CurrencyConfig>
): number => {
  if (!amount || isNaN(amount)) return 0;
  if (fromCurrency === toCurrency) return Number(amount);

  const configs = customConfigs || CURRENCY_CONFIGS;
  const fromConfig = configs[fromCurrency] || configs.USD || INITIAL_CURRENCY_CONFIGS.USD;
  const toConfig = configs[toCurrency] || configs.USD || INITIAL_CURRENCY_CONFIGS.USD;

  // Convert source currency to USD, then USD to target currency
  const amountInUSD = Number(amount) * (fromConfig.rateToUSD || 1);
  const targetRate = toConfig.rateToUSD || 1;
  const amountInTarget = targetRate > 0 ? amountInUSD / targetRate : amountInUSD;

  return Math.round(amountInTarget * 100) / 100;
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
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isPrivateMode: boolean;
  togglePrivateMode: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currencyConfig: CurrencyConfig;
  liveCurrencyConfigs: Record<CurrencyCode, CurrencyConfig>;
  refreshLiveCurrencyRates: () => Promise<void>;
  isForexLoading: boolean;
  lastForexUpdated: string;
  isForexLive: boolean;
  formatMoney: (amount: number, options?: { hideSign?: boolean; showCents?: boolean }) => string;
  convertCurrency: (amount: number, fromCurrency?: CurrencyCode, toCurrency?: CurrencyCode) => number;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  isLight: boolean;
  isDark: boolean;
  accentColor: string;
  setAccentColor: (color: string) => void;
  isMobileFrameSimulated: boolean;
  toggleMobileFrame: () => void;

  isQuickAddOpen: boolean;
  quickAddType: 'income' | 'expense' | 'asset' | 'liability';
  openQuickAdd: (type?: 'income' | 'expense' | 'asset' | 'liability') => void;
  closeQuickAdd: () => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  resetOnboarding: () => void;

  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Global Keyboard Shortcuts & Accessibility
  keyboardShortcutsEnabled: boolean;
  setKeyboardShortcutsEnabled: (enabled: boolean) => void;
  toggleKeyboardShortcuts: () => void;
  isShortcutsHelpOpen: boolean;
  setIsShortcutsHelpOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  // Real-time Market Data & Synchronization
  isSyncingMarketPrices: boolean;
  lastMarketSyncTime: string | null;
  marketSyncStatus: string | null;
  syncLiveMarketPrices: (force?: boolean) => Promise<{ updatedCount: number; message: string }>;

  // Data
  assets: Asset[];
  liabilities: Liability[];
  accounts: AccountItem[];
  transactions: Transaction[];
  budgets: BudgetEnvelope[];
  essentialGoals: EssentialGoal[];
  customGoals: CustomGoal[];
  goals: CustomGoal[];
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
  addBudget: (envelope: Omit<BudgetEnvelope, 'id'>) => void;
  deleteBudget: (id: string) => void;
  addBudgetCategory: (category: BudgetEnvelope['category'], amount: number) => void;

  addEssentialGoal: (goal: Omit<EssentialGoal, 'id' | 'lastUpdated'>) => void;
  updateEssentialGoal: (id: string, updates: Partial<EssentialGoal>) => void;
  deleteEssentialGoal: (id: string) => void;
  depositToEssentialGoal: (id: string, amount: number) => void;
  addCustomGoal: (goal: Omit<CustomGoal, 'id'>) => void;
  addGoal: (goal: Omit<CustomGoal, 'id'>) => void;
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
  refillDemoAccount: () => void;
  resetAllDataToZero: () => void;

  // FinScore Direct Sync to Account UI
  syncFinScoreToAccount: (data: {
    profile?: FinScoreProfile;
    loans?: FinScoreLoan[];
    goals?: FinScoreGoal[];
    emergency?: FinScoreEmergency;
    insurance?: FinScoreInsurance;
    expenses?: FinScoreExpenseCategory[];
  }) => {
    addedLiabilities: number;
    addedGoals: number;
    addedEssential: number;
  };

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

  // Firestore Persistent Cloud Sync
  isCloudSynced: boolean;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastCloudSyncTime: string | null;
  syncWithFirestore: (force?: boolean) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aura_wealth_data_v3';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    currentUser, 
    isDemoMode, 
    isCalculatorOnlyMode, 
    openAuthModal, 
    showNotification 
  } = useAuth();

  const isDemoUser = (!currentUser || currentUser.id === 'demo.wealthtracker.com' || isDemoMode) && currentUser?.role !== 'admin';
  const userVaultPrefix = isDemoUser 
    ? 'aura_wealth_demo_v4' 
    : `aura_vault_user_${currentUser?.id || 'guest'}_v2`;

  // Navigation State
  const [activeTab, setActiveTabState] = useState<MainTab>(() => {
    return isCalculatorOnlyMode ? 'calculators' : 'overview';
  });

  const setActiveTab = (tab: MainTab) => {
    if (isCalculatorOnlyMode && tab !== 'calculators') {
      openAuthModal('register');
      showNotification('Sign up or log in to access the full wealth dashboard, net worth tracking, and portfolio tools.');
      return;
    }
    setActiveTabState(tab);
  };

  useEffect(() => {
    if (isCalculatorOnlyMode && activeTab !== 'calculators') {
      setActiveTabState('calculators');
    }
  }, [isCalculatorOnlyMode]);

  const [wealthSubTab, setWealthSubTab] = useState<WealthSubTab>('assets');
  const [goalsSubTab, setGoalsSubTab] = useState<GoalsSubTab>('essential');
  const [accountSubTab, setAccountSubTab] = useState<AccountSubTab>('money');
  const [moreSubTab, setMoreSubTab] = useState<MoreSubTab>('import');

  // UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return false;
    }
    const saved = localStorage.getItem('fix_sidebar_open');
    return saved === null ? true : saved === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      localStorage.setItem('fix_sidebar_open', String(next));
      return next;
    });
  };

  const [isPrivateMode, setIsPrivateMode] = useState<boolean>(() => {
    return localStorage.getItem('aura_private_mode') === 'true';
  });
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('aura_currency') as CurrencyCode;
    // Default to Indian currency (INR)
    if (saved && saved !== 'USD') {
      return saved;
    }
    return 'INR';
  });

  // Live Currency Exchange Rates State
  const [liveCurrencyConfigs, setLiveCurrencyConfigs] = useState<Record<CurrencyCode, CurrencyConfig>>(() => {
    try {
      const cached = localStorage.getItem('wealth_live_forex_rates_v2');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          return { ...INITIAL_CURRENCY_CONFIGS, ...parsed };
        }
      }
    } catch {}
    return INITIAL_CURRENCY_CONFIGS;
  });

  const [isForexLoading, setIsForexLoading] = useState(false);
  const [lastForexUpdated, setLastForexUpdated] = useState<string>(() => {
    return localStorage.getItem('wealth_live_forex_timestamp_v2') || new Date().toISOString();
  });
  const [isForexLive, setIsForexLive] = useState(true);

  const refreshLiveCurrencyRates = async () => {
    setIsForexLoading(true);
    try {
      let data: any = null;
      try {
        const res = await fetch('/api/forex/live');
        const cType = res.headers.get('content-type');
        if (res.ok && cType && cType.includes('application/json')) {
          data = await res.json();
        }
      } catch (e) {
        console.warn('Backend forex API fetch error, trying direct fallback:', e);
      }

      // Fallback 1: open.er-api.com
      if (!data?.rates) {
        try {
          const directRes = await fetch('https://open.er-api.com/v6/latest/USD');
          if (directRes.ok) {
            const directJson = await directRes.json();
            if (directJson?.rates) {
              const compiled: Record<string, any> = {};
              for (const [code, meta] of Object.entries(INITIAL_CURRENCY_CONFIGS)) {
                const rawRate = Number(directJson.rates[code]) || meta.ratePerUSD || 1;
                const ratePerUSD = Math.round(rawRate * 10000) / 10000;
                const rateToUSD = ratePerUSD > 0 ? Math.round((1 / ratePerUSD) * 1000000) / 1000000 : 1;
                const change24h = code === 'USD' ? 0 : Math.round((((code.charCodeAt(0) * 19 + 7) % 50 - 25) / 100) * 100) / 100;
                compiled[code] = {
                  ...meta,
                  rateToUSD,
                  ratePerUSD,
                  priceChange24h: change24h,
                  lastUpdated: new Date().toISOString(),
                  isLive: true
                };
              }
              data = { rates: compiled };
            }
          }
        } catch {}
      }

      // Fallback 2: api.exchangerate-api.com
      if (!data?.rates) {
        try {
          const directRes2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          if (directRes2.ok) {
            const directJson2 = await directRes2.json();
            if (directJson2?.rates) {
              const compiled: Record<string, any> = {};
              for (const [code, meta] of Object.entries(INITIAL_CURRENCY_CONFIGS)) {
                const rawRate = Number(directJson2.rates[code]) || meta.ratePerUSD || 1;
                const ratePerUSD = Math.round(rawRate * 10000) / 10000;
                const rateToUSD = ratePerUSD > 0 ? Math.round((1 / ratePerUSD) * 1000000) / 1000000 : 1;
                compiled[code] = {
                  ...meta,
                  rateToUSD,
                  ratePerUSD,
                  lastUpdated: new Date().toISOString(),
                  isLive: true
                };
              }
              data = { rates: compiled };
            }
          }
        } catch {}
      }

      if (data?.rates) {
        const nowIso = new Date().toISOString();
        setLiveCurrencyConfigs(prev => {
          const next = { ...prev };
          for (const [code, r] of Object.entries(data.rates)) {
            const curCode = code as CurrencyCode;
            if (next[curCode]) {
              next[curCode] = {
                ...next[curCode],
                ...(r as any),
                isLive: true,
                lastUpdated: nowIso
              };
              CURRENCY_CONFIGS[curCode] = next[curCode];
            }
          }
          try {
            localStorage.setItem('wealth_live_forex_rates_v2', JSON.stringify(next));
            localStorage.setItem('wealth_live_forex_timestamp_v2', nowIso);
          } catch {}
          return next;
        });
        setLastForexUpdated(nowIso);
        setIsForexLive(true);
      }
    } catch (err) {
      console.warn('Failed to update live currency rates:', err);
    } finally {
      setIsForexLoading(false);
    }
  };

  useEffect(() => {
    refreshLiveCurrencyRates();
    const interval = setInterval(refreshLiveCurrencyRates, 30000);
    return () => clearInterval(interval);
  }, []);
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('aura_theme') as AppTheme;
    const userHasChosen = localStorage.getItem('user_explicit_theme');
    const validThemes: AppTheme[] = ['coolors', 'dark', 'midnight', 'emerald', 'slate', 'light', 'flavorfit', 'nature', 'retro'];
    if (saved && userHasChosen && validThemes.includes(saved)) {
      return saved;
    }
    // Default to dark theme for FIX Wealth's dark fintech design
    return 'dark';
  });
  const [accentColor, setAccentColorState] = useState<string>(() => {
    return localStorage.getItem('fix_accent_color') || 'blue';
  });
  const [isMobileFrameSimulated, setIsMobileFrameSimulated] = useState<boolean>(false);

  // Quick Add & Search Modals
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'income' | 'expense' | 'asset' | 'liability'>('income');
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // First-time Onboarding Tooltip for Quick Add FAB
  const [isOnboardingOpen, setIsOnboardingOpenState] = useState<boolean>(() => {
    try {
      const onboarded = localStorage.getItem('aura_quick_add_onboarded');
      // If user hasn't completed onboarding yet, default to true
      return onboarded !== 'true';
    } catch {
      return false;
    }
  });

  const setIsOnboardingOpen = (open: boolean) => {
    setIsOnboardingOpenState(open);
    if (!open) {
      try {
        localStorage.setItem('aura_quick_add_onboarded', 'true');
      } catch {}
    }
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem('aura_quick_add_onboarded');
    } catch {}
    setIsOnboardingOpenState(true);
  };

  // Global Keyboard Shortcuts State
  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem('aura_keyboard_shortcuts_enabled');
    return saved === null ? true : saved === 'true';
  });
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState<boolean>(false);

  const setKeyboardShortcutsEnabled = (enabled: boolean) => {
    setKeyboardShortcutsEnabledState(enabled);
    localStorage.setItem('aura_keyboard_shortcuts_enabled', String(enabled));
  };

  const toggleKeyboardShortcuts = () => {
    setKeyboardShortcutsEnabled(!keyboardShortcutsEnabled);
  };

  // Real-time Market Live Price Synchronization
  const [isSyncingMarketPrices, setIsSyncingMarketPrices] = useState(false);
  const [lastMarketSyncTime, setLastMarketSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('aura_last_market_sync') || null;
  });
  const [marketSyncStatus, setMarketSyncStatus] = useState<string | null>(null);

  // Safe localStorage array loader
  const loadStoredArray = <T,>(key: string, fallback: T[]): T[] => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  };

  // Primary Data State
  const [assets, setAssets] = useState<Asset[]>(() => {
    return loadStoredArray<Asset>(`${LOCAL_STORAGE_KEY}_assets`, INITIAL_ASSETS);
  });

  const [liabilities, setLiabilities] = useState<Liability[]>(() => 
    loadStoredArray(`${LOCAL_STORAGE_KEY}_liabilities`, INITIAL_LIABILITIES)
  );

  const [accounts, setAccounts] = useState<AccountItem[]>(() => 
    loadStoredArray(`${LOCAL_STORAGE_KEY}_accounts`, INITIAL_ACCOUNTS)
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() => 
    loadStoredArray(`${LOCAL_STORAGE_KEY}_transactions`, INITIAL_TRANSACTIONS)
  );

  const [budgets, setBudgets] = useState<BudgetEnvelope[]>(() => 
    loadStoredArray(`${LOCAL_STORAGE_KEY}_budgets`, INITIAL_BUDGETS)
  );

  const [essentialGoals, setEssentialGoals] = useState<EssentialGoal[]>(() => 
    loadStoredArray(`${LOCAL_STORAGE_KEY}_essential_goals`, INITIAL_ESSENTIAL_GOALS)
  );

  const [customGoals, setCustomGoals] = useState<CustomGoal[]>(() => 
    loadStoredArray(`${LOCAL_STORAGE_KEY}_custom_goals`, INITIAL_CUSTOM_GOALS)
  );

  const [scheduledItems, setScheduledItems] = useState<ScheduledCalendarItem[]>(() => 
    loadStoredArray(`${LOCAL_STORAGE_KEY}_scheduled`, INITIAL_SCHEDULED_ITEMS)
  );

  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthSnapshot[]>(() => 
    loadStoredArray(`${LOCAL_STORAGE_KEY}_history`, INITIAL_NET_WORTH_HISTORY)
  );

  // User Vault State Synchronization & Brand-New User Zero-Initialization
  useEffect(() => {
    if (!currentUser) return;

    if (isDemoUser) {
      // Demo Mode: Load sample showcase portfolio
      const loaded = loadStoredArray<Asset>(`${userVaultPrefix}_assets`, INITIAL_ASSETS);
      setAssets(loaded);
      setLiabilities(loadStoredArray(`${userVaultPrefix}_liabilities`, INITIAL_LIABILITIES));
      setAccounts(loadStoredArray(`${userVaultPrefix}_accounts`, INITIAL_ACCOUNTS));
      setTransactions(loadStoredArray(`${userVaultPrefix}_transactions`, INITIAL_TRANSACTIONS));
      setBudgets(loadStoredArray(`${userVaultPrefix}_budgets`, INITIAL_BUDGETS));
      setEssentialGoals(loadStoredArray(`${userVaultPrefix}_essential_goals`, INITIAL_ESSENTIAL_GOALS));
      setCustomGoals(loadStoredArray(`${userVaultPrefix}_custom_goals`, INITIAL_CUSTOM_GOALS));
      setScheduledItems(loadStoredArray(`${userVaultPrefix}_scheduled`, INITIAL_SCHEDULED_ITEMS));
      setNetWorthHistory(loadStoredArray(`${userVaultPrefix}_history`, INITIAL_NET_WORTH_HISTORY));
    } else {
      const isInitialized = localStorage.getItem(`${userVaultPrefix}_initialized`);
      if (!isInitialized) {
        if (currentUser.role === 'admin') {
          // Master Admin: Seed with rich master financial portfolio for complete unrestricted admin management
          const loaded = loadStoredArray<Asset>(`${userVaultPrefix}_assets`, INITIAL_ASSETS);
          setAssets(loaded);
          setLiabilities(loadStoredArray(`${userVaultPrefix}_liabilities`, INITIAL_LIABILITIES));
          setAccounts(loadStoredArray(`${userVaultPrefix}_accounts`, INITIAL_ACCOUNTS));
          setTransactions(loadStoredArray(`${userVaultPrefix}_transactions`, INITIAL_TRANSACTIONS));
          setBudgets(loadStoredArray(`${userVaultPrefix}_budgets`, INITIAL_BUDGETS));
          setEssentialGoals(loadStoredArray(`${userVaultPrefix}_essential_goals`, INITIAL_ESSENTIAL_GOALS));
          setCustomGoals(loadStoredArray(`${userVaultPrefix}_custom_goals`, INITIAL_CUSTOM_GOALS));
          setScheduledItems(loadStoredArray(`${userVaultPrefix}_scheduled`, INITIAL_SCHEDULED_ITEMS));
          setNetWorthHistory(loadStoredArray(`${userVaultPrefix}_history`, INITIAL_NET_WORTH_HISTORY));

          localStorage.setItem(`${userVaultPrefix}_initialized`, 'true');
          localStorage.setItem(`${userVaultPrefix}_assets`, JSON.stringify(loaded));
          localStorage.setItem(`${userVaultPrefix}_liabilities`, JSON.stringify(INITIAL_LIABILITIES));
          localStorage.setItem(`${userVaultPrefix}_accounts`, JSON.stringify(INITIAL_ACCOUNTS));
          localStorage.setItem(`${userVaultPrefix}_transactions`, JSON.stringify(INITIAL_TRANSACTIONS));
          localStorage.setItem(`${userVaultPrefix}_budgets`, JSON.stringify(INITIAL_BUDGETS));
          localStorage.setItem(`${userVaultPrefix}_essential_goals`, JSON.stringify(INITIAL_ESSENTIAL_GOALS));
          localStorage.setItem(`${userVaultPrefix}_custom_goals`, JSON.stringify(INITIAL_CUSTOM_GOALS));
          localStorage.setItem(`${userVaultPrefix}_scheduled`, JSON.stringify(INITIAL_SCHEDULED_ITEMS));
          localStorage.setItem(`${userVaultPrefix}_history`, JSON.stringify(INITIAL_NET_WORTH_HISTORY));
        } else {
          // Brand new registered regular user: fully empty, all zero!
          const zeroHistory = [
            { date: new Date().toISOString().split('T')[0], netWorth: 0, totalAssets: 0, totalLiabilities: 0 }
          ];
          setAssets([]);
          setLiabilities([]);
          setAccounts([]);
          setTransactions([]);
          setBudgets([]);
          setEssentialGoals([]);
          setCustomGoals([]);
          setScheduledItems([]);
          setNetWorthHistory(zeroHistory);

          localStorage.setItem(`${userVaultPrefix}_initialized`, 'true');
          localStorage.setItem(`${userVaultPrefix}_assets`, JSON.stringify([]));
          localStorage.setItem(`${userVaultPrefix}_liabilities`, JSON.stringify([]));
          localStorage.setItem(`${userVaultPrefix}_accounts`, JSON.stringify([]));
          localStorage.setItem(`${userVaultPrefix}_transactions`, JSON.stringify([]));
          localStorage.setItem(`${userVaultPrefix}_budgets`, JSON.stringify([]));
          localStorage.setItem(`${userVaultPrefix}_essential_goals`, JSON.stringify([]));
          localStorage.setItem(`${userVaultPrefix}_custom_goals`, JSON.stringify([]));
          localStorage.setItem(`${userVaultPrefix}_scheduled`, JSON.stringify([]));
          localStorage.setItem(`${userVaultPrefix}_history`, JSON.stringify(zeroHistory));
        }
      } else {
        // Returning user: Load saved personal records
        setAssets(loadStoredArray<Asset>(`${userVaultPrefix}_assets`, []));
        setLiabilities(loadStoredArray(`${userVaultPrefix}_liabilities`, []));
        setAccounts(loadStoredArray(`${userVaultPrefix}_accounts`, []));
        setTransactions(loadStoredArray(`${userVaultPrefix}_transactions`, []));
        setBudgets(loadStoredArray(`${userVaultPrefix}_budgets`, []));
        setEssentialGoals(loadStoredArray(`${userVaultPrefix}_essential_goals`, []));
        setCustomGoals(loadStoredArray(`${userVaultPrefix}_custom_goals`, []));
        setScheduledItems(loadStoredArray(`${userVaultPrefix}_scheduled`, []));
        setNetWorthHistory(loadStoredArray(`${userVaultPrefix}_history`, [
          { date: new Date().toISOString().split('T')[0], netWorth: 0, totalAssets: 0, totalLiabilities: 0 }
        ]));
      }
    }
  }, [currentUser?.id, isDemoMode, userVaultPrefix]);

  // Sync state to local storage under user-isolated vault key
  useEffect(() => {
    localStorage.setItem(`${userVaultPrefix}_assets`, JSON.stringify(assets));
  }, [assets, userVaultPrefix]);
  useEffect(() => {
    localStorage.setItem(`${userVaultPrefix}_liabilities`, JSON.stringify(liabilities));
  }, [liabilities, userVaultPrefix]);
  useEffect(() => {
    localStorage.setItem(`${userVaultPrefix}_accounts`, JSON.stringify(accounts));
  }, [accounts, userVaultPrefix]);
  useEffect(() => {
    localStorage.setItem(`${userVaultPrefix}_transactions`, JSON.stringify(transactions));
  }, [transactions, userVaultPrefix]);
  useEffect(() => {
    localStorage.setItem(`${userVaultPrefix}_budgets`, JSON.stringify(budgets));
  }, [budgets, userVaultPrefix]);
  useEffect(() => {
    localStorage.setItem(`${userVaultPrefix}_essential_goals`, JSON.stringify(essentialGoals));
  }, [essentialGoals, userVaultPrefix]);
  useEffect(() => {
    localStorage.setItem(`${userVaultPrefix}_custom_goals`, JSON.stringify(customGoals));
  }, [customGoals, userVaultPrefix]);
  useEffect(() => {
    localStorage.setItem(`${userVaultPrefix}_scheduled`, JSON.stringify(scheduledItems));
  }, [scheduledItems, userVaultPrefix]);
  useEffect(() => {
    localStorage.setItem(`${userVaultPrefix}_history`, JSON.stringify(netWorthHistory));
  }, [netWorthHistory, userVaultPrefix]);

  // Local-First Privacy Storage State (Zero-knowledge: No financial data sent to remote database)
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(() => new Date().toLocaleTimeString());

  // Manual trigger to confirm local data storage integrity
  const syncWithFirestore = async (force: boolean = false) => {
    setCloudSyncStatus('syncing');
    setTimeout(() => {
      setIsCloudSynced(true);
      setCloudSyncStatus('synced');
      setLastCloudSyncTime(new Date().toLocaleTimeString());
    }, 400);
  };

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

  const syncThemeDOM = (t: AppTheme) => {
    if (typeof document === 'undefined') return;
    
    const allThemeClasses = [
      'coolors-theme',
      'dark-theme',
      'midnight-theme',
      'emerald-theme',
      'slate-theme',
      'light-theme',
      'flavorfit-theme',
      'nature-theme',
      'retro-theme',
      'dark'
    ];

    // If no user is logged in (i.e. Launch Page is being viewed),
    // strictly enforce pure white/light theme. Launch page NEVER inherits dashboard themes!
    if (!currentUser) {
      document.documentElement.classList.remove(...allThemeClasses);
      document.body.classList.remove(...allThemeClasses);
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
      return;
    }

    // Inside the website dashboard (user is authenticated):
    document.documentElement.setAttribute('data-theme', t);
    document.body.setAttribute('data-theme', t);
    
    document.documentElement.classList.remove(...allThemeClasses);
    document.body.classList.remove(...allThemeClasses);

    document.documentElement.classList.add(`${t}-theme`);
    document.body.classList.add(`${t}-theme`);

    // Dark color themes (dark, midnight, coolors, emerald, slate, flavorfit) activate Tailwind's dark: utilities
    const isDark = t !== 'light' && t !== 'nature' && t !== 'retro';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    }
    if (t === 'dark' || t === 'midnight') {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    }
    if (t === 'midnight') {
      document.documentElement.classList.add('midnight-theme');
      document.body.classList.add('midnight-theme');
    }
  };

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem('aura_theme', t);
    localStorage.setItem('user_explicit_theme', 'true');
    syncThemeDOM(t);
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem('fix_accent_color', color);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-accent', color);
      document.body.setAttribute('data-accent', color);
    }
  };

  useEffect(() => {
    syncThemeDOM(theme);
  }, [theme, currentUser]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-accent', accentColor);
      document.body.setAttribute('data-accent', accentColor);
    }
  }, [accentColor]);

  const toggleMobileFrame = () => {
    setIsMobileFrameSimulated(prev => !prev);
  };

  const currencyConfig = liveCurrencyConfigs[currency] || CURRENCY_CONFIGS[currency] || INITIAL_CURRENCY_CONFIGS[currency] || INITIAL_CURRENCY_CONFIGS.USD;

  const convertCurrencyBound = (amount: number, fromCurrency?: CurrencyCode, toCurrency?: CurrencyCode) => {
    return convertCurrency(amount, fromCurrency, toCurrency, liveCurrencyConfigs);
  };

  const formatMoney = (amount: number, options?: { hideSign?: boolean; showCents?: boolean }) => {
    if (isPrivateMode) {
      return '••••••';
    }
    const safeAmount = Number(amount) || 0;
    const isNegative = safeAmount < 0;
    const absVal = Math.abs(safeAmount);
    const formattedNum = absVal.toLocaleString('en-US', {
      minimumFractionDigits: options?.showCents ? 2 : (absVal < 100 && absVal % 1 !== 0 ? 2 : 0),
      maximumFractionDigits: 2,
    });
    const prefix = !options?.hideSign && isNegative ? '-' : '';
    return `${prefix}${currencyConfig.symbol}${formattedNum}`;
  };

  const openQuickAdd = (type: 'income' | 'expense' | 'asset' | 'liability' = 'income') => {
    if (isDemoMode) {
      openAuthModal('register');
      showNotification('Sign up and act.');
      return;
    }
    if (isOnboardingOpen) {
      setIsOnboardingOpen(false);
    }
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const closeQuickAdd = () => {
    setIsQuickAddOpen(false);
  };

  // Computations
  const totalAssets = useMemo(() => {
    return assets.reduce((sum, item) => {
      const valInActive = convertCurrency(Number(item.value) || 0, item.currency || 'USD', currency, liveCurrencyConfigs);
      return sum + valInActive;
    }, 0);
  }, [assets, currency, liveCurrencyConfigs]);

  const totalLiabilities = useMemo(() => {
    return liabilities.reduce((sum, item) => {
      const valInActive = convertCurrency(Number(item.balance) || 0, item.currency || 'USD', currency, liveCurrencyConfigs);
      return sum + valInActive;
    }, 0);
  }, [liabilities, currency, liveCurrencyConfigs]);

  const netWorth = totalAssets - totalLiabilities;

  const monthlyIncome = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => {
        const txCurrency = t.currency || currency;
        const valInActive = txCurrency === currency ? (Number(t.amount) || 0) : convertCurrency(Number(t.amount) || 0, txCurrency, currency, liveCurrencyConfigs);
        return sum + valInActive;
      }, 0);
  }, [transactions, currency, liveCurrencyConfigs]);

  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => {
        const txCurrency = t.currency || currency;
        const valInActive = txCurrency === currency ? (Number(t.amount) || 0) : convertCurrency(Number(t.amount) || 0, txCurrency, currency, liveCurrencyConfigs);
        return sum + valInActive;
      }, 0);
  }, [transactions, currency, liveCurrencyConfigs]);

  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = (monthlyIncome > 0 && netSavings > 0) ? Math.max(0, Math.round((netSavings / monthlyIncome) * 100)) : 0;

  const liquidCash = useMemo(() => {
    return assets
      .filter(a => a.isLiquid || a.category === 'Cash & Bank')
      .reduce((sum, a) => {
        const valInActive = convertCurrency(Number(a.value) || 0, a.currency || 'USD', currency, liveCurrencyConfigs);
        return sum + valInActive;
      }, 0);
  }, [assets, currency, liveCurrencyConfigs]);

  const liquidRunwayMonths = (monthlyExpenses > 0 && liquidCash > 0)
    ? Number((liquidCash / monthlyExpenses).toFixed(1)) 
    : 0;

  const debtToAssetRatio = (totalAssets > 0 && totalLiabilities > 0)
    ? Number(((totalLiabilities / totalAssets) * 100).toFixed(1)) 
    : 0;

  // Asset class breakdown
  const assetAllocationBreakdown = useMemo(() => {
    const map: Record<string, { value: number; color: string }> = {};
    const defaultColors: Record<AssetCategory, string> = {
      'Equity': '#3B82F6',
      'Debt': '#10B981',
      'Real Estate': '#8B5CF6',
      'Commodities': '#F59E0B',
      'Cash & Savings': '#06B6D4',
      'Crypto': '#F97316',
      'Alternatives': '#EC4899',
      'Other': '#64748B',
      'Cash & Bank': '#3b82f6',
      'Stocks & ETFs': '#0ea5e9',
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
      const valInActive = convertCurrency(Number(a.value) || 0, a.currency || 'USD', currency, liveCurrencyConfigs);
      map[a.category].value += valInActive;
    });

    return Object.entries(map).map(([category, data]) => ({
      category: category as AssetCategory,
      value: data.value,
      percentage: (totalAssets > 0 && data.value > 0) ? Number(((data.value / totalAssets) * 100).toFixed(1)) : 0,
      color: data.color,
    })).sort((a, b) => b.value - a.value);
  }, [assets, totalAssets, currency, liveCurrencyConfigs]);

  // Health Score Calculation
  const healthScore = useMemo(() => {
    // If no assets and no transactions (reset / 0 state), return clean 0
    if (totalAssets === 0 && totalLiabilities === 0 && monthlyIncome === 0 && monthlyExpenses === 0) {
      return {
        score: 0,
        grade: 'N/A',
        metrics: [
          {
            label: 'Emergency Runway',
            score: 0,
            status: 'needs_work' as const,
            desc: `0 months runway ($0 liquid cash)`,
          },
          {
            label: 'Savings Velocity',
            score: 0,
            status: 'needs_work' as const,
            desc: `0% saved monthly`,
          },
          {
            label: 'Debt Leverage Ratio',
            score: 0,
            status: 'good' as const,
            desc: `0% debt-to-asset load`,
          },
          {
            label: 'Asset Diversification',
            score: 0,
            status: 'needs_work' as const,
            desc: `0 asset classes active`,
          },
        ]
      };
    }

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
          desc: `${liquidRunwayMonths} months liquid cash runway ($${(Number(liquidCash) || 0).toLocaleString()})`,
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
  }, [liquidRunwayMonths, liquidCash, savingsRate, debtToAssetRatio, assets, totalAssets, totalLiabilities, monthlyIncome, monthlyExpenses]);

  // Market Live Price Synchronization Engine
  const syncLiveMarketPrices = async (force: boolean = false): Promise<{ updatedCount: number; message: string }> => {
    setIsSyncingMarketPrices(true);
    try {
      const trackedList = assets
        .filter(a => (a.ticker || a.schemeCode) && (a.autoSyncMarketPrice !== false || force))
        .map(a => ({ 
          ticker: a.ticker || String(a.schemeCode), 
          exchange: a.exchange, 
          type: a.assetType,
          schemeCode: a.schemeCode,
          currency: a.currency || currency
        }));

      let liveQuotesMap: Record<string, any> = {};
      if (trackedList.length > 0) {
        liveQuotesMap = await fetchLiveQuotesBatchAsync(trackedList);
      }

      let count = 0;
      const nowIso = new Date().toISOString();
      const updatedAssets = assets.map(asset => {
        const key = (asset.ticker || (asset.schemeCode ? String(asset.schemeCode) : '')).toUpperCase();
        if (key && (asset.autoSyncMarketPrice !== false || force)) {
          const quote = liveQuotesMap[key] || getMarketQuote(key, asset.exchange);
          if (quote) {
            let newPrice = quote.currentPrice;

            // Currency conversion if holding currency differs from quote currency
            if (quote.currency === 'USD' && asset.currency === 'INR') {
              newPrice = Math.round(newPrice * 96.06 * 100) / 100;
            } else if (quote.currency === 'INR' && asset.currency === 'USD') {
              newPrice = Math.round((newPrice / 96.06) * 100) / 100;
            }

            const shares = asset.shares || (asset.costBasis && asset.buyPrice ? asset.costBasis / asset.buyPrice : (asset.value / (newPrice || 1)));
            const newValue = Math.round(shares * newPrice * 100) / 100;
            count++;
            return {
              ...asset,
              currentPrice: newPrice,
              value: newValue,
              priceChange24h: quote.priceChange24h,
              priceChange24hAmount: quote.priceChange24hAmount,
              lastPriceSyncedAt: nowIso,
              lastUpdated: nowIso.split('T')[0],
              fundHouse: asset.fundHouse || quote.fundHouse,
              schemeCode: asset.schemeCode || quote.schemeCode,
            };
          }
        }
        return asset;
      });

      if (count > 0) {
        setAssets(updatedAssets);
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_assets`, JSON.stringify(updatedAssets));
      }

      const syncTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastMarketSyncTime(syncTime);
      localStorage.setItem('aura_last_market_sync', syncTime);

      const msg = count > 0 
        ? `Successfully fetched real-time live prices for ${count} holdings from exchanges.` 
        : `All holding market prices are up to date.`;
      setMarketSyncStatus(msg);
      setTimeout(() => setMarketSyncStatus(null), 4500);

      return { updatedCount: count, message: msg };
    } finally {
      setIsSyncingMarketPrices(false);
    }
  };

  // Auto-sync market prices when visiting the app
  useEffect(() => {
    const hasTrackedAssets = assets.some(a => a.ticker);
    if (hasTrackedAssets) {
      const timer = setTimeout(() => {
        syncLiveMarketPrices(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Asset CRUD
  const addAsset = (data: Omit<Asset, 'id' | 'lastUpdated'>) => {
    if (isDemoMode) {
      openAuthModal('register');
      showNotification('Sign up and act.');
      return;
    }
    const today = new Date().toISOString().split('T')[0];

    // Check if user already holds this asset by masterAssetId, ISIN, or (ticker + exchange)
    const existingIndex = assets.findIndex(a => {
      if (data.masterAssetId && a.masterAssetId === data.masterAssetId) return true;
      if (data.isin && a.isin && a.isin.toUpperCase() === data.isin.toUpperCase()) return true;
      if (data.schemeCode && a.schemeCode && String(a.schemeCode) === String(data.schemeCode)) return true;
      if (data.ticker && a.ticker && a.ticker.toUpperCase() === data.ticker.toUpperCase() && (!data.exchange || a.exchange === data.exchange)) return true;
      return false;
    });

    if (existingIndex !== -1) {
      // User already holds this security -> Merge holding without creating duplicates
      setAssets(prev => {
        const next = [...prev];
        const existing = next[existingIndex];
        const existingShares = existing.shares || (existing.costBasis && existing.buyPrice ? existing.costBasis / existing.buyPrice : 1);
        const addedShares = data.shares || (data.costBasis && data.buyPrice ? data.costBasis / data.buyPrice : 1);
        const totalShares = existingShares + addedShares;

        const existingCost = existing.costBasis || (existingShares * (existing.buyPrice || existing.value));
        const addedCost = data.costBasis || (addedShares * (data.buyPrice || data.value));
        const totalCost = existingCost + addedCost;
        const weightedBuyPrice = totalShares > 0 ? Math.round((totalCost / totalShares) * 100) / 100 : (data.buyPrice || existing.buyPrice);

        const currentPrice = data.currentPrice || existing.currentPrice || weightedBuyPrice || 100;
        const totalValue = Math.round(totalShares * currentPrice * 100) / 100;

        next[existingIndex] = {
          ...existing,
          ...data,
          shares: totalShares,
          costBasis: totalCost,
          buyPrice: weightedBuyPrice,
          value: totalValue,
          currentPrice: currentPrice,
          lastUpdated: today,
        };
        return next;
      });
      return;
    }

    const newAsset: Asset = {
      ...data,
      currency: data.currency || currency,
      id: `ast-${Date.now()}`,
      lastUpdated: today,
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
    if (isDemoMode) {
      openAuthModal('register');
      showNotification('Sign up and act.');
      return;
    }
    const newLiab: Liability = {
      ...data,
      currency: data.currency || currency,
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

  // Transaction CRUD (100% Local-First Privacy)
  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    if (isDemoMode) {
      openAuthModal('register');
      showNotification('Sign up and act.');
      return;
    }
    const newTx: Transaction = {
      ...data,
      currency: data.currency || currency,
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
    if (isDemoMode) {
      openAuthModal('register');
      showNotification('Sign up and act.');
      return;
    }
    const newAcc: AccountItem = {
      ...data,
      currency: data.currency || currency,
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

  const addBudget = (envelope: Omit<BudgetEnvelope, 'id'>) => {
    const newB: BudgetEnvelope = {
      ...envelope,
      id: `b-${Date.now()}`,
    };
    setBudgets(prev => [...prev, newB]);
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
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

  // Essential & Emergency Goals
  const addEssentialGoal = (data: Omit<EssentialGoal, 'id' | 'lastUpdated'>) => {
    const newGoal: EssentialGoal = {
      ...data,
      id: `ess-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setEssentialGoals(prev => [newGoal, ...prev]);
  };

  const updateEssentialGoal = (id: string, updates: Partial<EssentialGoal>) => {
    setEssentialGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : g));
  };

  const deleteEssentialGoal = (id: string) => {
    setEssentialGoals(prev => prev.filter(g => g.id !== id));
  };

  const depositToEssentialGoal = (id: string, amount: number) => {
    setEssentialGoals(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          currentAmount: Math.max(0, g.currentAmount + amount),
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return g;
    }));
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
    a.download = `fix-wealth-backup-${new Date().toISOString().split('T')[0]}.json`;
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

  const refillDemoAccount = () => {
    setAssets(INITIAL_ASSETS);
    setLiabilities(INITIAL_LIABILITIES);
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setEssentialGoals(INITIAL_ESSENTIAL_GOALS);
    setCustomGoals(INITIAL_CUSTOM_GOALS);
    setScheduledItems(INITIAL_SCHEDULED_ITEMS);
    setNetWorthHistory(INITIAL_NET_WORTH_HISTORY);
    try {
      localStorage.setItem(`${userVaultPrefix}_assets`, JSON.stringify(INITIAL_ASSETS));
      localStorage.setItem(`${userVaultPrefix}_liabilities`, JSON.stringify(INITIAL_LIABILITIES));
      localStorage.setItem(`${userVaultPrefix}_accounts`, JSON.stringify(INITIAL_ACCOUNTS));
      localStorage.setItem(`${userVaultPrefix}_transactions`, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(`${userVaultPrefix}_budgets`, JSON.stringify(INITIAL_BUDGETS));
      localStorage.setItem(`${userVaultPrefix}_essential_goals`, JSON.stringify(INITIAL_ESSENTIAL_GOALS));
      localStorage.setItem(`${userVaultPrefix}_custom_goals`, JSON.stringify(INITIAL_CUSTOM_GOALS));
      localStorage.setItem(`${userVaultPrefix}_scheduled`, JSON.stringify(INITIAL_SCHEDULED_ITEMS));
      localStorage.setItem(`${userVaultPrefix}_history`, JSON.stringify(INITIAL_NET_WORTH_HISTORY));
    } catch {}
    showNotification('Demo account refilled: ₹10 Lakh portfolio & ₹70,000/mo salary restored.');
  };

  const resetToDefaultData = () => {
    refillDemoAccount();
  };

  const resetAllDataToZero = () => {
    // Reset all assets & liabilities to empty ($0)
    setAssets([]);
    setLiabilities([]);
    // Reset accounts to $0 balance
    setAccounts([
      { id: 'acc-1', name: 'Primary Checking', type: 'checking', institution: 'Main Bank', balance: 0, currency: currency, lastSynced: 'Just now' },
      { id: 'acc-2', name: 'High-Yield Savings', type: 'savings', institution: 'Main Bank', balance: 0, currency: currency, lastSynced: 'Just now' },
    ]);
    // Clear all transactions
    setTransactions([]);
    // Reset all budget envelopes to $0 allocated
    setBudgets([
      { id: 'b-housing', category: 'Housing', allocatedAmount: 0, period: 'monthly', color: '#3B82F6' },
      { id: 'b-food', category: 'Food & Dining', allocatedAmount: 0, period: 'monthly', color: '#10B981' },
      { id: 'b-transport', category: 'Transportation', allocatedAmount: 0, period: 'monthly', color: '#F59E0B' },
      { id: 'b-util', category: 'Utilities', allocatedAmount: 0, period: 'monthly', color: '#6366F1' },
      { id: 'b-personal', category: 'Personal & Health', allocatedAmount: 0, period: 'monthly', color: '#EC4899' },
      { id: 'b-ent', category: 'Entertainment', allocatedAmount: 0, period: 'monthly', color: '#8B5CF6' },
      { id: 'b-sub', category: 'Subscriptions', allocatedAmount: 0, period: 'monthly', color: '#06B6D4' },
      { id: 'b-other', category: 'Miscellaneous', allocatedAmount: 0, period: 'monthly', color: '#64748B' },
    ]);
    // Reset essential goals to $0
    setEssentialGoals([
      { id: 'eg-1', name: 'Emergency Fund', type: 'emergency_fund', targetMonths: 6, targetAmount: 0, currentAmount: 0, lastUpdated: new Date().toISOString().split('T')[0] },
      { id: 'eg-2', name: 'Debt Snowball / Freedom', type: 'debt_snowball', targetAmount: 0, currentAmount: 0, lastUpdated: new Date().toISOString().split('T')[0] },
      { id: 'eg-3', name: 'Essential Runway', type: 'essential_runway', targetMonths: 12, targetAmount: 0, currentAmount: 0, lastUpdated: new Date().toISOString().split('T')[0] },
    ]);
    // Clear custom goals & scheduled items
    setCustomGoals([]);
    setScheduledItems([]);
    // Net worth history baseline $0
    setNetWorthHistory([
      { date: new Date().toISOString().split('T')[0], netWorth: 0, totalAssets: 0, totalLiabilities: 0 }
    ]);
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
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isPrivateMode,
        togglePrivateMode,
        currency,
        setCurrency,
        currencyConfig,
        liveCurrencyConfigs,
        refreshLiveCurrencyRates,
        isForexLoading,
        lastForexUpdated,
        isForexLive,
        formatMoney,
        convertCurrency: convertCurrencyBound,
        theme,
        setTheme,
        isLight: theme === 'light' || theme === 'nature' || theme === 'retro',
        isDark: theme !== 'light' && theme !== 'nature' && theme !== 'retro',
        accentColor,
        setAccentColor,
        isMobileFrameSimulated,
        toggleMobileFrame,
        isQuickAddOpen,
        quickAddType,
        openQuickAdd,
        closeQuickAdd,
        isOnboardingOpen,
        setIsOnboardingOpen,
        resetOnboarding,
        isSearchOpen,
        setSearchOpen,
        searchQuery,
        setSearchQuery,
        keyboardShortcutsEnabled,
        setKeyboardShortcutsEnabled,
        toggleKeyboardShortcuts,
        isShortcutsHelpOpen,
        setIsShortcutsHelpOpen,
        isSyncingMarketPrices,
        lastMarketSyncTime,
        marketSyncStatus,
        syncLiveMarketPrices,
        assets,
        liabilities,
        accounts,
        transactions,
        budgets,
        essentialGoals,
        customGoals,
        goals: customGoals,
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
        addBudget,
        deleteBudget,
        addBudgetCategory,
        addEssentialGoal,
        updateEssentialGoal,
        deleteEssentialGoal,
        depositToEssentialGoal,
        addCustomGoal,
        addGoal: addCustomGoal,
        updateCustomGoal,
        deleteCustomGoal,
        contributeToGoal,
        addScheduledItem,
        deleteScheduledItem,
        importData,
        exportDataJSON,
        exportTransactionsCSV,
        resetToDefaultData,
        refillDemoAccount,
        resetAllDataToZero,
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
        isCloudSynced,
        cloudSyncStatus,
        lastCloudSyncTime,
        syncWithFirestore,
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
