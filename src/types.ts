export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR' | 'JPY' | 'SGD' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // For multi-currency reference
}

export type AssetCategory = 
  | 'Equity'
  | 'Debt'
  | 'Real Estate'
  | 'Commodities'
  | 'Cash & Savings'
  | 'Crypto'
  | 'Alternatives'
  | 'Other'
  | 'Cash & Bank'
  | 'Stocks & ETFs'
  | 'Retirement (401k/IRA)'
  | 'Vehicles & Valuables'
  | 'Fixed Income & Bonds'
  | 'Other Assets';

export type LiabilityCategory = 
  | 'Home Loan'
  | 'Personal Loan'
  | 'Credit Card'
  | 'Auto Loan'
  | 'Student Loan'
  | 'Gold Loan'
  | 'Mortgage'
  | 'Loan Against Property'
  | 'Buy Now Pay Later'
  | 'Other Debt';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type ExpenseCategory = 
  | 'Housing & Rent'
  | 'Food & Groceries'
  | 'Dining & Drinks'
  | 'Transportation'
  | 'Utilities & Bills'
  | 'Entertainment'
  | 'Health & Wellness'
  | 'Shopping & Tech'
  | 'Travel & Leisure'
  | 'Education'
  | 'Subscriptions'
  | 'Investments'
  | 'Other Expense';

export type IncomeCategory = 
  | 'Salary & Wages'
  | 'Freelance & Business'
  | 'Investments & Dividends'
  | 'Rental Income'
  | 'Side Hustle'
  | 'Gifts & Grants'
  | 'Other Income';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  subType?: string;
  institution?: string;
  value: number;
  costBasis?: number;
  currency: CurrencyCode;
  notes?: string;
  lastUpdated: string;
  icon?: string;
  color?: string;
  isLiquid?: boolean;

  // Custom Tagging & Portfolio Purpose Organization
  tags?: string[];
  purpose?: string; // e.g. 'Retirement', 'Trading', 'Long-term Savings', 'Emergency Fund'

  // Real Market Stock / Crypto / ETF / Mutual Fund Tracking fields
  masterAssetId?: string;      // Unique master reference e.g. "NSE_RELIANCE", "MF_118968"
  isin?: string;               // International Securities Identification Number e.g. "INE002A01018"
  bseCode?: string;            // BSE Scrip code e.g. "500325"
  dataStatus?: 'Real-time' | 'Delayed' | 'Daily NAV' | 'Market Closed';
  dataSource?: string;
  plan?: 'Direct' | 'Regular';
  option?: 'Growth' | 'IDCW';
  navDate?: string;
  ticker?: string;             // e.g. "AAPL", "NVDA", "RELIANCE", "BTC", "VOO", "122639"
  exchange?: string;           // e.g. "NASDAQ", "NYSE", "NSE", "CRYPTO", "INDEX", "MF", "BSE"
  assetType?: 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'commodity' | 'manual';
  schemeCode?: number | string;// Scheme code for Indian Mutual Funds (mfapi.in)
  fundHouse?: string;          // AMC name e.g. "PPFAS Mutual Fund"
  shares?: number;             // Number of units / quantity
  buyPrice?: number;           // Purchase price per share on buy date
  buyDate?: string;            // YYYY-MM-DD when bought
  currentPrice?: number;       // Latest market price per share
  priceChange24h?: number;     // 24h percentage change (e.g. 2.45)
  priceChange24hAmount?: number;// 24h absolute change (e.g. 4.30)
  lastPriceSyncedAt?: string;  // Timestamp of latest price sync
  autoSyncMarketPrice?: boolean; // Automatically refresh price on load
}

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
  subType?: string;
  institution?: string;
  balance: number;
  interestRate?: number; // annual %
  minimumPayment?: number;
  dueDate?: number; // day of month
  currency: CurrencyCode;
  notes?: string;
  lastUpdated: string;
}

export interface AccountItem {
  id: string;
  name: string;
  institution: string;
  type: 'checking' | 'savings' | 'investment' | 'credit' | 'crypto' | 'loan' | 'cash';
  balance: number;
  accountNumberMasked?: string;
  currency: CurrencyCode;
  lastSynced: string;
  color?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  currency?: CurrencyCode;
  type: TransactionType;
  category: string;
  accountId: string;
  accountName: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  isRecurring?: boolean;
}

export interface BudgetEnvelope {
  id: string;
  category: ExpenseCategory;
  allocatedAmount: number;
  period: 'monthly' | 'yearly';
  color?: string;
}

export interface EssentialGoal {
  id: string;
  name: string;
  type: 'emergency_fund' | 'debt_snowball' | 'essential_runway' | 'insurance_buffer' | 'medical_shield' | 'custom_vault';
  targetMonths?: number;
  targetAmount: number;
  currentAmount: number;
  notes?: string;
  lastUpdated: string;
  color?: string;
  icon?: string;
}

export interface CustomGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  tenureYears?: number;
  tenureMonths?: number;
  monthlyContribution?: number;
  color?: string;
  icon?: string;
  notes?: string;
  isCompleted?: boolean;
}

export interface ScheduledCalendarItem {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  dayOfMonth: number; // 1-31
  frequency: 'monthly' | 'bi-weekly' | 'weekly' | 'annual';
  accountName?: string;
  isAutoPaid?: boolean;
}

export interface NetWorthSnapshot {
  date: string;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
}

export type AppTheme = 'coolors' | 'dark' | 'midnight' | 'emerald' | 'slate' | 'light';

export type MainTab = 'overview' | 'wealth' | 'goals' | 'account' | 'more' | 'calendar' | 'balancesheet' | 'reports' | 'finscore' | 'settings';

export type WealthSubTab = 'assets' | 'liabilities' | 'networth' | 'allocation';
export type GoalsSubTab = 'essential' | 'goals' | 'fire';
export type AccountSubTab = 'money' | 'budget' | 'accounts' | 'state';
export type MoreSubTab = 'import' | 'calculate' | 'theme' | 'backup' | 'setting' | 'feedback';

// ---------------------------------------------------------------------------
// FINSCORE™ - Financial Health Score Engine & Profile Types
// ---------------------------------------------------------------------------

export interface FinScoreProfile {
  name: string;
  age: number;
  monthlyIncome: number;
  occupation: string;
  dependents: number;
  currency: CurrencyCode;
}

export interface FinScoreExpenseCategory {
  id: string;
  category: string;
  amount: number;
  isEssential: boolean; // Rent, food, utilities, loan EMIs are essential
}

export interface FinScoreLoan {
  id: string;
  type: string; // 'Home Loan' | 'Personal Loan' | 'Auto Loan' | 'Credit Card' | 'Education' | 'Other'
  outstandingAmount: number;
  monthlyEmi: number;
  interestRate: number; // e.g., 8.5%
  remainingTenureMonths: number;
}

export interface FinScoreInsurance {
  hasLifeInsurance: boolean;
  lifeCoverage: number;
  hasTermInsurance: boolean;
  termCoverage: number;
  hasHealthInsurance: boolean;
  healthCoverage: number;
  isFamilyCovered: boolean;
  hasEmployerInsurance: boolean;
  hasPersonalHealthPolicy: boolean;
}

export interface FinScoreEmergency {
  targetMonths: number; // default 6, configurable 3-12
  currentEmergencySavings: number;
}

export interface FinScoreGoal {
  id: string;
  name: string;
  category: 'Bike' | 'Car' | 'Higher Education' | 'Marriage' | 'House' | 'Retirement' | 'Children Education' | 'Business' | 'Travel' | 'Other';
  targetAmount: number;
  currentSavings: number;
  targetYear: number;
  tenureYears?: number;
  expectedReturnRate?: number; // default 8-10%
}

export interface FinScoreHistoryPoint {
  month: string; // e.g. "Jan", "Feb", "March", "April", "May"
  year: number;
  overallScore: number;
  savingsScore: number;
  debtScore: number;
  emergencyScore: number;
  insuranceScore: number;
  goalScore: number;
}

export interface FinScoreAlert {
  id: string;
  type: 'emergency' | 'debt' | 'insurance' | 'savings' | 'goal';
  severity: 'critical' | 'warning' | 'info' | 'positive';
  title: string;
  message: string;
  actionRecommendation?: string;
}

export interface FinScoreResult {
  overallScore: number; // 0-100
  grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  gradeColor: string; // Tailwind color classes
  summaryDiagnosis: string;
  biggestPriority: string;
  scores: {
    savings: number; // 0-100
    expenseManagement: number; // 0-100
    debt: number; // 0-100
    emergencyFund: number; // 0-100
    insurance: number; // 0-100
    futureGoals: number; // 0-100
  };
  metrics: {
    monthlyIncome: number;
    totalExpenses: number;
    essentialExpenses: number;
    discretionaryExpenses: number;
    monthlySavings: number;
    savingsRatio: number; // %
    totalDebt: number;
    totalMonthlyEmi: number;
    emiToIncomeRatio: number; // %
    requiredEmergencyFund: number;
    emergencyShortfall: number;
    emergencyFundRatio: number; // %
    recommendedLifeCoverage: number;
    lifeCoverageShortfall: number;
    totalGoalRequiredMonthlySavings: number;
  };
  monthlyActionPlan: {
    monthNumber: number;
    monthName: string;
    focus: string;
    tasks: string[];
  }[];
  alerts: FinScoreAlert[];
}

export interface FinScoreAdminRuleConfig {
  weights: {
    savings: number; // default 15
    expenseManagement: number; // default 15
    debt: number; // default 20
    emergencyFund: number; // default 20
    insurance: number; // default 15
    futureGoals: number; // default 15
  };
  emergencyTargetMonthsDefault: number; // default 6
  maxHealthyEmiRatio: number; // default 40%
  lifeInsuranceAnnualIncomeMultiplier: number; // default 12x
}

export interface AssetTagMeta {
  name: string;
  color: string;
  badgeClass: string;
}

export const DEFAULT_ASSET_TAGS: AssetTagMeta[] = [
  { name: 'Retirement', color: '#6366f1', badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  { name: 'Trading', color: '#f59e0b', badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { name: 'Long-term Savings', color: '#10b981', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { name: 'Emergency Fund', color: '#14b8a6', badgeClass: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  { name: 'Passive Income / Dividends', color: '#3b82f6', badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { name: 'High Growth', color: '#ec4899', badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  { name: 'Speculative', color: '#a855f7', badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { name: 'Tax Saving (80C / ELSS)', color: '#06b6d4', badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  { name: 'House Downpayment', color: '#f97316', badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30' },
  { name: 'Children Education', color: '#8b5cf6', badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
];
