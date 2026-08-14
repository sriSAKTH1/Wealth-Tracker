export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR' | 'JPY' | 'SGD' | 'CHF';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToUSD: number; // For multi-currency reference
}

export type AssetCategory = 
  | 'Cash & Bank'
  | 'Stocks & ETFs'
  | 'Crypto'
  | 'Real Estate'
  | 'Retirement (401k/IRA)'
  | 'Vehicles & Valuables'
  | 'Fixed Income & Bonds'
  | 'Other Assets';

export type LiabilityCategory = 
  | 'Mortgage'
  | 'Credit Card'
  | 'Student Loan'
  | 'Auto Loan'
  | 'Personal Loan'
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
  institution?: string;
  value: number;
  costBasis?: number;
  currency: CurrencyCode;
  notes?: string;
  lastUpdated: string;
  icon?: string;
  color?: string;
  isLiquid?: boolean;
}

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
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
  type: 'emergency_fund' | 'debt_snowball' | 'essential_runway' | 'insurance_buffer';
  targetMonths?: number;
  targetAmount: number;
  currentAmount: number;
  notes?: string;
  lastUpdated: string;
}

export interface CustomGoal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
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

export type MainTab = 'overview' | 'wealth' | 'goals' | 'account' | 'more' | 'calendar' | 'reports';

export type WealthSubTab = 'assets' | 'liabilities' | 'networth' | 'allocation';
export type GoalsSubTab = 'essential' | 'goals';
export type AccountSubTab = 'money' | 'budget' | 'accounts' | 'state';
export type MoreSubTab = 'import' | 'calculate' | 'theme' | 'backup' | 'setting' | 'feedback';
