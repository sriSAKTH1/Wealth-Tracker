import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Target,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Bot,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Users,
  User,
  Activity,
  Award,
  ChevronRight,
  Send,
  RefreshCw,
  RotateCcw,
  UserPlus,
  Check,
  X,
  Plus,
  Trash2,
  Sliders,
  PieChart as PieChartIcon,
  Clock,
  HeartHandshake,
  Settings2,
  HelpCircle,
  FileText,
  Copy,
  MessageSquare,
  Compass,
  Shield,
  ShieldAlert,
  Zap,
  BarChart3,
  Volume2,
  VolumeX,
  Flame,
  Scale,
  Building,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  CartesianGrid,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import {
  FinScoreProfile,
  FinScoreExpenseCategory,
  FinScoreLoan,
  FinScoreInsurance,
  FinScoreEmergency,
  FinScoreGoal,
  FinScoreResult,
  FinScoreAdminRuleConfig,
  FinScoreHistoryPoint
} from '../../types';
import {
  INITIAL_FINSCORE_PROFILE,
  INITIAL_FINSCORE_EXPENSES,
  INITIAL_FINSCORE_LOANS,
  INITIAL_FINSCORE_INSURANCE,
  INITIAL_FINSCORE_EMERGENCY,
  INITIAL_FINSCORE_GOALS,
  INITIAL_FINSCORE_HISTORY,
  EMPTY_FINSCORE_PROFILE,
  EMPTY_FINSCORE_EXPENSES,
  EMPTY_FINSCORE_LOANS,
  EMPTY_FINSCORE_INSURANCE,
  EMPTY_FINSCORE_EMERGENCY,
  EMPTY_FINSCORE_GOALS,
  DEFAULT_ADMIN_CONFIG,
  calculateFinScore,
  calculateRequiredMonthlySaving,
  getAdminCohortStatistics
} from '../../services/finScoreEngine';
import {
  calculateDateFromTenureMonths,
  calculateTenureMonthsFromDate,
  formatDateFriendly,
  formatTenureLabel
} from './GoalsView';
import { FinScoreAmountInput } from '../finscore/FinScoreAmountInput';
import { FinScoreHealthPlanModal, FinScoreBenchmarkModal } from '../finscore/FinScoreModals';
import { FinancialStatementChart } from '../FinancialStatementChart';

type FinScoreTab = 
  | 'dashboard' 
  | 'profile' 
  | 'income_expenses' 
  | 'debt' 
  | 'insurance' 
  | 'emergency' 
  | 'investments_assets'
  | 'goals' 
  | 'ai_assistant' 
  | 'admin';

export const FinScoreView: React.FC = () => {
  const { 
    currency, 
    formatMoney, 
    theme, 
    transactions = [], 
    assets = [], 
    liabilities = [], 
    customGoals = [],
    essentialGoals = []
  } = useFinance();
  const appGoals = customGoals || [];
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Theme-aware styles: Only dark/midnight mode has black color themes!
  const finScoreTheme = React.useMemo(() => {
    switch (theme) {
      case 'flavorfit':
        return {
          hero: 'bg-gradient-to-br from-[#131522] via-[#161827] to-[#1F2338] border-[#22263D] text-white shadow-2xl shadow-cyan-950/40',
          banner: 'bg-gradient-to-r from-[#131522] via-[#1A1D30] to-[#131522] border-[#22263D] shadow-sm',
          card: 'bg-[#131522] border-[#202438] text-white shadow-lg shadow-black/20',
          innerCard: 'bg-[#161827] border-[#22263D] text-slate-200',
          heading: 'text-white',
          muted: 'text-[#8D93B4]',
          input: 'bg-[#10121e] border-[#22263D] text-white focus:border-[#9FE0E8] focus:ring-[#9FE0E8]',
          btnSecondary: 'bg-[#1A1C2D] hover:bg-[#22253B] text-slate-300 border border-[#262A44]',
          subtabContainer: 'bg-[#0B0C14] border-[#202438]',
          subtabActive: 'bg-[#9FE0E8]/25 text-[#9FE0E8] border border-[#9FE0E8]/40 font-bold shadow-sm',
          subtabInactive: 'text-slate-400 hover:bg-[#1A1C2D] hover:text-white',
          badge: 'bg-[#9FE0E8]/15 text-[#9FE0E8] border-[#9FE0E8]/30',
          border: 'border-[#202438]',
          divider: 'border-[#22263D]',
          rowHover: 'hover:bg-[#1A1C2D]/50',
          gaugeTrack: 'stroke-[#22263D]',
        };
      case 'nature':
        return {
          hero: 'bg-gradient-to-br from-[#FAF8F3] via-[#F4F1EA] to-[#EBE6DA] border-[#DED9CD] text-[#283618] shadow-xl shadow-[#606C38]/10',
          banner: 'bg-gradient-to-r from-[#FAF8F3] via-[#F4F1EA] to-[#EBE6DA] border-[#DED9CD] shadow-xs',
          card: 'bg-[#FAF8F3] border-[#DED9CD] text-[#283618] shadow-xs',
          innerCard: 'bg-[#F4F1EA] border-[#DED9CD] text-[#283618]',
          heading: 'text-[#283618]',
          muted: 'text-[#5C664E]',
          input: 'bg-[#ffffff] border-[#DED9CD] text-[#283618] focus:border-[#606C38] focus:ring-[#606C38]',
          btnSecondary: 'bg-[#ECE8DD] hover:bg-[#E2DDD0] text-[#283618] border border-[#DED9CD]',
          subtabContainer: 'bg-[#F4F1EA] border-[#DED9CD]',
          subtabActive: 'bg-[#606C38] text-white font-bold shadow-sm',
          subtabInactive: 'text-[#5C664E] hover:bg-[#ECE8DD] hover:text-[#283618]',
          badge: 'bg-[#606C38]/15 text-[#283618] border-[#606C38]/30',
          border: 'border-[#DED9CD]',
          divider: 'border-[#DED9CD]',
          rowHover: 'hover:bg-[#ECE8DD]/60',
          gaugeTrack: 'stroke-[#DED9CD]',
        };
      case 'retro':
        return {
          hero: 'bg-gradient-to-br from-[#FAF6ED] via-[#F5EEDF] to-[#E8DEC8] border-[#D6CCB5] text-[#2B2520] shadow-xl shadow-[#C65952]/10',
          banner: 'bg-gradient-to-r from-[#FAF6ED] via-[#F5EEDF] to-[#E8DEC8] border-[#D6CCB5] shadow-xs',
          card: 'bg-[#FAF6ED] border-[#D6CCB5] text-[#2B2520] shadow-xs',
          innerCard: 'bg-[#F5EEDF] border-[#D6CCB5] text-[#2B2520]',
          heading: 'text-[#2B2520]',
          muted: 'text-[#6E6256]',
          input: 'bg-[#FAF6ED] border-[#D6CCB5] text-[#2B2520] focus:border-[#C65952] focus:ring-[#C65952]',
          btnSecondary: 'bg-[#EDE5D3] hover:bg-[#E2D8C3] text-[#2B2520] border border-[#D6CCB5]',
          subtabContainer: 'bg-[#F5EEDF] border-[#D6CCB5]',
          subtabActive: 'bg-[#C65952] text-white font-bold shadow-sm',
          subtabInactive: 'text-[#6E6256] hover:bg-[#EDE5D3] hover:text-[#2B2520]',
          badge: 'bg-[#C65952]/15 text-[#2B2520] border-[#C65952]/30',
          border: 'border-[#D6CCB5]',
          divider: 'border-[#D6CCB5]',
          rowHover: 'hover:bg-[#EDE5D3]/60',
          gaugeTrack: 'stroke-[#D6CCB5]',
        };
      case 'coolors':
        return {
          hero: 'bg-gradient-to-br from-[#111c38] via-[#152347] to-[#1c2e5c] border-[#1e2d54] text-white shadow-xl shadow-blue-950/40',
          banner: 'bg-gradient-to-r from-[#111c38] via-[#17254a] to-[#111c38] border-[#1e2d54] shadow-xs',
          card: 'bg-[#111c38] border-[#1e2d54] text-white shadow-lg shadow-black/20',
          innerCard: 'bg-[#152347] border-[#22335e] text-blue-100',
          heading: 'text-white',
          muted: 'text-[#8ba3d4]',
          input: 'bg-[#0e172e] border-[#1e2d54] text-white focus:border-blue-400 focus:ring-blue-400',
          btnSecondary: 'bg-[#17254a] hover:bg-[#1d2f5e] text-blue-200 border border-[#22335e]',
          subtabContainer: 'bg-[#0b1329] border-[#1e2d54]',
          subtabActive: 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30',
          subtabInactive: 'text-blue-300 hover:bg-[#17254a] hover:text-white',
          badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
          border: 'border-[#1e2d54]',
          divider: 'border-[#1e2d54]',
          rowHover: 'hover:bg-[#17254a]/50',
          gaugeTrack: 'stroke-[#1e2d54]',
        };
      case 'emerald':
        return {
          hero: 'bg-gradient-to-br from-[#062a20] via-[#09382b] to-[#0d4a39] border-[#0e4a39] text-white shadow-xl shadow-emerald-950/40',
          banner: 'bg-gradient-to-r from-[#062a20] via-[#0b3d2f] to-[#062a20] border-[#0e4a39] shadow-xs',
          card: 'bg-[#062a20] border-[#0e4a39] text-white shadow-lg shadow-black/20',
          innerCard: 'bg-[#09382b] border-[#115743] text-emerald-100',
          heading: 'text-white',
          muted: 'text-[#6ee7b7]',
          input: 'bg-[#042018] border-[#0e4a39] text-white focus:border-emerald-400 focus:ring-emerald-400',
          btnSecondary: 'bg-[#09382b] hover:bg-[#0c4737] text-emerald-200 border border-[#115743]',
          subtabContainer: 'bg-[#021a13] border-[#0e4a39]',
          subtabActive: 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/30',
          subtabInactive: 'text-emerald-300 hover:bg-[#09382b] hover:text-white',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          border: 'border-[#0e4a39]',
          divider: 'border-[#0e4a39]',
          rowHover: 'hover:bg-[#09382b]/50',
          gaugeTrack: 'stroke-[#0e4a39]',
        };
      case 'slate':
        return {
          hero: 'bg-gradient-to-br from-[#1e293b] via-[#243247] to-[#2c3d56] border-[#334155] text-white shadow-xl',
          banner: 'bg-gradient-to-r from-[#1e293b] via-[#27354c] to-[#1e293b] border-[#334155] shadow-xs',
          card: 'bg-[#1e293b] border-[#334155] text-white shadow-lg',
          innerCard: 'bg-[#243247] border-[#3b4b63] text-slate-100',
          heading: 'text-white',
          muted: 'text-[#94a3b8]',
          input: 'bg-[#172030] border-[#334155] text-white focus:border-slate-400 focus:ring-slate-400',
          btnSecondary: 'bg-[#27354c] hover:bg-[#30415d] text-slate-200 border border-[#3b4b63]',
          subtabContainer: 'bg-[#0f172a] border-[#334155]',
          subtabActive: 'bg-slate-700 text-white font-bold shadow-md',
          subtabInactive: 'text-slate-300 hover:bg-[#27354c] hover:text-white',
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
          border: 'border-[#334155]',
          divider: 'border-[#334155]',
          rowHover: 'hover:bg-[#27354c]/50',
          gaugeTrack: 'stroke-[#334155]',
        };
      case 'light':
        return {
          hero: 'bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border-slate-200/90 text-slate-900 shadow-slate-200/60',
          banner: 'bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/40 border-slate-200/80 shadow-xs',
          card: 'bg-white border-slate-200 text-slate-900 shadow-xs',
          innerCard: 'bg-slate-50 border-slate-200 text-slate-800',
          heading: 'text-slate-900',
          muted: 'text-slate-500',
          input: 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500',
          btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
          subtabContainer: 'bg-slate-100 border-slate-200',
          subtabActive: 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20',
          subtabInactive: 'text-slate-600 hover:bg-slate-200 hover:text-slate-900',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          border: 'border-slate-200',
          divider: 'border-slate-200',
          rowHover: 'hover:bg-slate-50/60',
          gaugeTrack: 'stroke-slate-200',
        };
      default: // Only dark / midnight modes keep black color themes
        return {
          hero: 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-zinc-800 text-white shadow-black/40',
          banner: 'bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border-zinc-800 shadow-sm',
          card: 'bg-zinc-900/90 border-zinc-800 text-white shadow-lg',
          innerCard: 'bg-zinc-950/80 border-zinc-800 text-zinc-200',
          heading: 'text-white',
          muted: 'text-zinc-400',
          input: 'bg-zinc-950 border-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500',
          btnSecondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700',
          subtabContainer: 'bg-zinc-950 border-zinc-800',
          subtabActive: 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30',
          subtabInactive: 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200',
          badge: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          border: 'border-zinc-800',
          divider: 'border-zinc-800',
          rowHover: 'hover:bg-zinc-800/40',
          gaugeTrack: 'stroke-zinc-800',
        };
    }
  }, [theme]);

  // Active FinScore section
  const [activeTab, setActiveTab] = useState<FinScoreTab>('dashboard');

  // Core Financial State
  const [profile, setProfile] = useState<FinScoreProfile>(INITIAL_FINSCORE_PROFILE);
  const [expenses, setExpenses] = useState<FinScoreExpenseCategory[]>(INITIAL_FINSCORE_EXPENSES);
  const [loans, setLoans] = useState<FinScoreLoan[]>(INITIAL_FINSCORE_LOANS);
  const [insurance, setInsurance] = useState<FinScoreInsurance>(INITIAL_FINSCORE_INSURANCE);
  const [emergency, setEmergency] = useState<FinScoreEmergency>(INITIAL_FINSCORE_EMERGENCY);
  const [goals, setGoals] = useState<FinScoreGoal[]>(INITIAL_FINSCORE_GOALS);
  const [adminConfig, setAdminConfig] = useState<FinScoreAdminRuleConfig>(DEFAULT_ADMIN_CONFIG);
  const [scoreHistory, setScoreHistory] = useState<FinScoreHistoryPoint[]>(INITIAL_FINSCORE_HISTORY);

  // New Goal / Loan Form States
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<FinScoreGoal['category']>('Car');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalSaved, setNewGoalSaved] = useState('');
  const [newGoalTenureYears, setNewGoalTenureYears] = useState<number>(4);
  const [newGoalYear, setNewGoalYear] = useState(() => String(new Date().getFullYear() + 4));
  const [newGoalDate, setNewGoalDate] = useState(() => calculateDateFromTenureMonths(4 * 12));

  const [newLoanType, setNewLoanType] = useState('Personal Loan');
  const [newLoanOutstanding, setNewLoanOutstanding] = useState('');
  const [newLoanEmi, setNewLoanEmi] = useState('');
  const [newLoanRate, setNewLoanRate] = useState('11');
  const [newLoanTenure, setNewLoanTenure] = useState('36');

  // Loan Tenure & Closure Calculator Helper
  const getLoanClosureInfo = (remainingMonths: number) => {
    const safeMonths = Math.max(1, remainingMonths || 1);
    const now = new Date();
    const closure = new Date(now.getFullYear(), now.getMonth() + safeMonths, 1);
    const closureDate = closure.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const years = (safeMonths / 12).toFixed(1);
    return {
      closureDate,
      closureYear: closure.getFullYear(),
      yearsLeft: years,
      monthsLeft: safeMonths
    };
  };

  // Benchmark default investments & assets (Step 6 before Future Goals)
  const INITIAL_FINSCORE_INVESTMENTS: Array<{
    id: string;
    name: string;
    category: 'Equity / Stocks' | 'Mutual Funds & SIP' | 'Fixed Deposit / Bonds' | 'Real Estate' | 'Gold & Precious Metals' | 'Retirement (PF/NPS)' | 'Cash & Liquid';
    currentValue: number;
    monthlyContribution: number;
    expectedReturnRate: number;
    nav?: number;
    units?: number;
    purchaseNav?: number;
  }> = [
    { 
      id: 'inv-1', 
      name: 'Nifty 50 Index Fund Direct-Growth', 
      category: 'Mutual Funds & SIP', 
      currentValue: 450000, 
      monthlyContribution: 15000, 
      expectedReturnRate: 12.5,
      nav: 142.50,
      units: 3157.89,
      purchaseNav: 118.20
    },
    { 
      id: 'inv-2', 
      name: 'Parag Parikh Flexi Cap Fund Direct-Growth', 
      category: 'Mutual Funds & SIP', 
      currentValue: 240000, 
      monthlyContribution: 8000, 
      expectedReturnRate: 14.5,
      nav: 82.45,
      units: 2910.85,
      purchaseNav: 64.10
    },
    { id: 'inv-3', name: 'Direct Bluechip Stocks', category: 'Equity / Stocks', currentValue: 280000, monthlyContribution: 5000, expectedReturnRate: 13 },
    { id: 'inv-4', name: 'Corporate & Bank Fixed Deposits', category: 'Fixed Deposit / Bonds', currentValue: 200000, monthlyContribution: 0, expectedReturnRate: 7.2 },
    { id: 'inv-5', name: 'Employee Provident Fund (EPF/PPF)', category: 'Retirement (PF/NPS)', currentValue: 520000, monthlyContribution: 7500, expectedReturnRate: 8.1 },
    { id: 'inv-6', name: 'Digital Gold / Sovereign Gold Bonds', category: 'Gold & Precious Metals', currentValue: 120000, monthlyContribution: 2500, expectedReturnRate: 9 },
  ];

  // Investments & Assets state (Step 6 before Future Goals)
  const [finScoreInvestments, setFinScoreInvestments] = useState(INITIAL_FINSCORE_INVESTMENTS);

  const [newInvName, setNewInvName] = useState('');
  const [newInvCategory, setNewInvCategory] = useState<'Equity / Stocks' | 'Mutual Funds & SIP' | 'Fixed Deposit / Bonds' | 'Real Estate' | 'Gold & Precious Metals' | 'Retirement (PF/NPS)' | 'Cash & Liquid'>('Mutual Funds & SIP');
  const [newInvValue, setNewInvValue] = useState('');
  const [newInvMonthly, setNewInvMonthly] = useState('');
  const [newInvReturn, setNewInvReturn] = useState('12');
  const [newInvNav, setNewInvNav] = useState('');
  const [newInvUnits, setNewInvUnits] = useState('');
  const [newInvPurchaseNav, setNewInvPurchaseNav] = useState('');

  // AI Assistant Chat & Custom Query State
  const [aiQuestion, setAiQuestion] = useState('');
  const [selectedAiModel, setSelectedAiModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [selectedRolePreset, setSelectedRolePreset] = useState<'advisor' | 'debt_crusher' | 'risk_auditor' | 'wealth_accelerator'>('advisor');
  const [isSpeakingIndex, setIsSpeakingIndex] = useState<number | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: string; modelUsed?: string }>>([
    {
      sender: 'ai',
      text: `Hello ${profile.name || 'there'}! I'm your FinScore AI Financial Advisor. I have synthesized your income, loan commitments, emergency savings, and future goals. What financial questions can I help you tackle today?`,
      timestamp: 'Just now',
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // What-If Simulation Sandbox State
  const [simEmergencyAdd, setSimEmergencyAdd] = useState(0);
  const [simPrepayDebt, setSimPrepayDebt] = useState(0);

  // Dashboard Unique Chart Mode: 'radar' | 'trajectory' | 'cashflow' | 'stresstest'
  const [dashboardChartMode, setDashboardChartMode] = useState<'radar' | 'trajectory' | 'cashflow' | 'stresstest'>('radar');

  // SWOT Analysis Quadrant Filter: 'all' | 'strengths' | 'weaknesses' | 'opportunities' | 'threats'
  const [swotQuadrant, setSwotQuadrant] = useState<'all' | 'strengths' | 'weaknesses' | 'opportunities' | 'threats'>('all');
  const [copiedSwot, setCopiedSwot] = useState(false);

  // AI Assistant Task Completion Tracker
  const [completedPlanTasks, setCompletedPlanTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('finscore_completed_plan_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const togglePlanTask = (taskId: string) => {
    setCompletedPlanTasks(prev => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem('finscore_completed_plan_tasks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  };

  // Profile Modal, Plan Modal & Benchmark Modal States
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [showHealthPlanModal, setShowHealthPlanModal] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [tempProfile, setTempProfile] = useState<FinScoreProfile>(INITIAL_FINSCORE_PROFILE);

  // Dynamic Financial Score Calculation
  const result: FinScoreResult = useMemo(() => {
    // Merge simulation overrides if active
    const simEmergency = {
      ...emergency,
      currentEmergencySavings: emergency.currentEmergencySavings + simEmergencyAdd,
    };
    const simLoans = loans.map(l => ({
      ...l,
      outstandingAmount: Math.max(0, l.outstandingAmount - simPrepayDebt),
      monthlyEmi: Math.max(0, l.monthlyEmi * (1 - simPrepayDebt / (l.outstandingAmount || 1))),
    }));

    return calculateFinScore(
      profile,
      expenses,
      simLoans,
      insurance,
      simEmergency,
      goals,
      adminConfig
    );
  }, [profile, expenses, loans, insurance, emergency, goals, adminConfig, simEmergencyAdd, simPrepayDebt]);

  // Admin Cohort Statistics
  const adminStats = useMemo(() => getAdminCohortStatistics(result), [result]);

  // Currency symbol helper based on user profile or active currency
  const currSym = profile.currency === 'INR' || currency === 'INR' ? '₹' : '$';

  // Future Goals Totals & Required Monthly Addition
  const totalGoalsTargetAmount = useMemo(() => {
    return goals.reduce((acc, g) => acc + (Number(g.targetAmount) || 0), 0);
  }, [goals]);

  const totalGoalsSavedSoFar = useMemo(() => {
    return goals.reduce((acc, g) => acc + (Number(g.currentSavings) || 0), 0);
  }, [goals]);

  const totalGoalsFundingGap = Math.max(0, totalGoalsTargetAmount - totalGoalsSavedSoFar);

  const overallGoalsProgressPct = totalGoalsTargetAmount > 0
    ? Math.min(100, Math.round((totalGoalsSavedSoFar / totalGoalsTargetAmount) * 100))
    : 0;

  const goalsWithCalculatedSip = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return goals.map(g => {
      const tenureYears = g.tenureYears || Math.max(1, (g.targetYear || currentYear + 4) - currentYear);
      const reqSip = calculateRequiredMonthlySaving(
        g.targetAmount,
        g.currentSavings,
        g.targetYear,
        g.expectedReturnRate || 9,
        tenureYears
      );
      const progressPct = Math.min(100, Math.round(((Number(g.currentSavings) || 0) / (Number(g.targetAmount) || 1)) * 100));
      return {
        ...g,
        tenureYears,
        reqSip,
        progressPct
      };
    });
  }, [goals]);

  const totalRequiredMonthlySip = useMemo(() => {
    return goalsWithCalculatedSip.reduce((acc, g) => acc + g.reqSip, 0);
  }, [goalsWithCalculatedSip]);

  // NEW UNIQUE CHART 1: Multi-Pillar Radar Symmetry Data (Spider Chart)
  const radarPillarData = useMemo(() => {
    return [
      {
        pillar: 'Emergency Fund',
        score: result.scores.emergencyFund,
        benchmark: 85,
        fullMark: 100,
      },
      {
        pillar: 'Debt Health',
        score: result.scores.debt,
        benchmark: 80,
        fullMark: 100,
      },
      {
        pillar: 'Savings Rate',
        score: result.scores.savings,
        benchmark: 75,
        fullMark: 100,
      },
      {
        pillar: 'Insurance Shield',
        score: result.scores.insurance,
        benchmark: 90,
        fullMark: 100,
      },
      {
        pillar: 'Future Goals',
        score: result.scores.futureGoals,
        benchmark: 80,
        fullMark: 100,
      },
    ];
  }, [result.scores]);

  // NEW UNIQUE CHART 2: Cash Flow & Capital Allocation Breakdown Data
  const cashFlowAllocationData = useMemo(() => {
    const income = Math.max(profile.monthlyIncome, 1);
    const living = result.metrics.totalExpenses;
    const emi = result.metrics.totalMonthlyEmi;
    const ins = Math.round(((insurance.lifePremiumAnnual || 0) + (insurance.healthPremiumAnnual || 0)) / 12);
    const surplus = Math.max(0, income - (living + emi + ins));
    return [
      {
        name: 'Living Expenses',
        amount: living,
        percentage: Math.min(100, Math.round((living / income) * 100)),
        color: '#3b82f6',
        category: 'Essential Needs',
      },
      {
        name: 'Debt & EMIs',
        amount: emi,
        percentage: Math.min(100, Math.round((emi / income) * 100)),
        color: '#a855f7',
        category: 'Obligations',
      },
      {
        name: 'Insurance Premiums',
        amount: ins,
        percentage: Math.min(100, Math.round((ins / income) * 100)),
        color: '#06b6d4',
        category: 'Risk Shield',
      },
      {
        name: 'Net Monthly Surplus',
        amount: surplus,
        percentage: Math.min(100, Math.round((surplus / income) * 100)),
        color: '#10b981',
        category: 'Wealth Accumulation',
      },
    ];
  }, [profile.monthlyIncome, result.metrics, insurance]);

  // NEW UNIQUE CHART 3: Financial Stress Test & Shock Resistance Matrix Data
  const stressTestData = useMemo(() => {
    const baseScore = result.overallScore;
    const living = result.metrics.totalExpenses;
    const emi = result.metrics.totalMonthlyEmi;
    const monthlyDrain = living + emi;
    const currentRunwayMonths = monthlyDrain > 0 ? (emergency.currentEmergencySavings / monthlyDrain).toFixed(1) : '12+';

    return [
      {
        scenario: 'Current Baseline',
        score: baseScore,
        runwayMonths: Number(currentRunwayMonths) || 6,
        impact: 'Normal operating financial baseline',
        severity: 'normal',
        color: '#3b82f6'
      },
      {
        scenario: '3-Mo Income Pause',
        score: Math.max(25, Math.round(baseScore * (Number(currentRunwayMonths) >= 6 ? 0.88 : 0.65))),
        runwayMonths: Math.max(0, (Number(currentRunwayMonths) || 6) - 3),
        impact: Number(currentRunwayMonths) >= 3 ? 'Covered by emergency buffer' : 'Emergency shortfall risk',
        severity: Number(currentRunwayMonths) >= 3 ? 'moderate' : 'high',
        color: '#f59e0b'
      },
      {
        scenario: 'Medical Emergency',
        score: insurance.hasPersonalHealthPolicy ? Math.max(40, Math.round(baseScore * 0.92)) : Math.max(30, Math.round(baseScore * 0.72)),
        runwayMonths: Number(currentRunwayMonths) || 6,
        impact: insurance.hasPersonalHealthPolicy ? 'Protected by health policy' : 'Out-of-pocket savings depletion',
        severity: insurance.hasPersonalHealthPolicy ? 'normal' : 'high',
        color: '#ec4899'
      },
      {
        scenario: '+2% Loan Rate Spike',
        score: result.metrics.emiToIncomeRatio <= 30 ? Math.round(baseScore * 0.95) : Math.round(baseScore * 0.82),
        runwayMonths: Number(currentRunwayMonths) || 6,
        impact: `Increases monthly EMI load by ~${currSym}${Math.round(result.metrics.totalMonthlyEmi * 0.06).toLocaleString()}`,
        severity: result.metrics.emiToIncomeRatio <= 30 ? 'normal' : 'moderate',
        color: '#8b5cf6'
      }
    ];
  }, [result.overallScore, result.metrics, emergency, insurance, currSym]);

  // Dynamic Personal Financial SWOT Strategic Matrix Data
  const swotData = useMemo(() => {
    // When financial profile is cleared or reset (no income set, or zero income in reset state)
    // SWOT analysis must be completely empty with 0 strategic factors
    if (!profile.monthlyIncome || profile.monthlyIncome <= 0) {
      return {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
        totalFactors: 0,
      };
    }

    const { metrics } = result;
    const monthlyDrain = (metrics.totalExpenses || 0) + (metrics.totalMonthlyEmi || 0);
    const emergencyRunwayMonths = monthlyDrain > 0 
      ? Number((emergency.currentEmergencySavings / monthlyDrain).toFixed(1)) 
      : emergency.currentEmergencySavings > 0 ? 12 : 0;
    const lifeInsuranceCoverageRatio = metrics.recommendedLifeCoverage > 0
      ? Math.min(100, Math.round((insurance.lifeCoverage / metrics.recommendedLifeCoverage) * 100))
      : 100;
    const totalGoalsCount = goals.length;
    const fundedGoalsCount = goals.filter(g => (g.currentSavings || 0) >= (g.targetAmount || 1)).length;

    // 1. STRENGTHS (Internal Positives & Advantages)
    const strengths = [];
    if (metrics.savingsRatio >= 20) {
      strengths.push({
        id: 's-savings',
        title: 'High Savings Discipline',
        description: `You save ${metrics.savingsRatio}% of your monthly income, exceeding the standard 20% benchmark and building strong wealth momentum.`,
        metric: `${metrics.savingsRatio}% Savings Rate`,
        tag: 'Cash Flow',
        impact: 'High',
      });
    } else if (metrics.monthlySavings > 0) {
      strengths.push({
        id: 's-savings-pos',
        title: 'Positive Net Monthly Cash Flow',
        description: `Generating ${currSym}${(metrics.monthlySavings ?? 0).toLocaleString()}/month in unallocated surplus to fund future priorities and buffer against surprises.`,
        metric: `+${currSym}${(metrics.monthlySavings ?? 0).toLocaleString()}/mo`,
        tag: 'Liquidity',
        impact: 'Medium',
      });
    }

    if (metrics.emiToIncomeRatio <= 30 && profile.monthlyIncome > 0) {
      if (metrics.totalDebt > 0) {
        strengths.push({
          id: 's-debt',
          title: 'Prudent Debt Servicing (Low DTI)',
          description: `Monthly loan payments consume only ${metrics.emiToIncomeRatio}% of your income, safely below the 35% debt danger limit.`,
          metric: `${metrics.emiToIncomeRatio}% EMI/Income`,
          tag: 'Solvency',
          impact: 'High',
        });
      } else {
        strengths.push({
          id: 's-debt-free',
          title: 'Zero Debt Obligations',
          description: 'You carry zero active loans or debt EMIs, preserving 100% of your discretionary cash flow for investing and compounding.',
          metric: '0% Debt Burden',
          tag: 'Solvency',
          impact: 'High',
        });
      }
    }

    if (emergencyRunwayMonths >= 3 && emergency.currentEmergencySavings > 0) {
      strengths.push({
        id: 's-emergency',
        title: 'Solid Emergency Liquidity Cushion',
        description: `You have ${emergencyRunwayMonths.toFixed(1)} months of living expenses safely stashed in liquid savings.`,
        metric: `${emergencyRunwayMonths.toFixed(1)} Mo Runway`,
        tag: 'Resilience',
        impact: 'High',
      });
    }

    if (insurance.hasPersonalHealthPolicy) {
      strengths.push({
        id: 's-health-ins',
        title: 'Dedicated Personal Health Protection',
        description: 'Active personal medical insurance shields your portfolio and savings from sudden hospitalization shocks.',
        metric: 'Shielded',
        tag: 'Risk Shield',
        impact: 'High',
      });
    }

    if (insurance.lifeCoverage > 0) {
      strengths.push({
        id: 's-life-ins',
        title: 'Active Life Protection',
        description: `Secured ${currSym}${(insurance.lifeCoverage ?? 0).toLocaleString()} in coverage to protect dependent family members.`,
        metric: `${currSym}${(insurance.lifeCoverage ?? 0).toLocaleString()}`,
        tag: 'Family Security',
        impact: 'Medium',
      });
    }

    if (fundedGoalsCount > 0) {
      strengths.push({
        id: 's-goals',
        title: 'Committed Milestone Funding',
        description: `${fundedGoalsCount} of ${totalGoalsCount} life goals are funded or actively accumulating on schedule.`,
        metric: `${fundedGoalsCount}/${totalGoalsCount} Goals`,
        tag: 'Milestones',
        impact: 'Medium',
      });
    }

    if (strengths.length < 2 && profile.monthlyIncome > 0) {
      strengths.push({
        id: 's-base',
        title: 'Steady Recurring Income Foundation',
        description: `Consistent monthly inflow of ${currSym}${(profile.monthlyIncome ?? 0).toLocaleString()} gives you the structural leverage to optimize allocations.`,
        metric: `${currSym}${(profile.monthlyIncome ?? 0).toLocaleString()}/mo`,
        tag: 'Earning Power',
        impact: 'Medium',
      });
    }

    // 2. WEAKNESSES (Internal Vulnerabilities & Deficits)
    const weaknesses = [];
    if (emergencyRunwayMonths < 6) {
      weaknesses.push({
        id: 'w-emergency',
        title: 'Emergency Runway Shortfall',
        description: `Current liquid reserve covers only ${emergencyRunwayMonths.toFixed(1)} months of living expenses vs. recommended 6-month resilience buffer (${currSym}${metrics.requiredEmergencyFund?.toLocaleString() || 'target'}).`,
        metric: `${emergencyRunwayMonths.toFixed(1)} / 6.0 Mo`,
        tag: 'Liquidity Gap',
        impact: 'Critical',
      });
    }

    if (metrics.emiToIncomeRatio > 30) {
      weaknesses.push({
        id: 'w-debt',
        title: 'Elevated Monthly Debt Drain',
        description: `Loan EMIs consume ${metrics.emiToIncomeRatio}% of monthly income, restricting discretionary spending and slowing retirement investments.`,
        metric: `${metrics.emiToIncomeRatio}% Burden`,
        tag: 'Cash Drag',
        impact: 'Critical',
      });
    }

    if (!insurance.hasPersonalHealthPolicy) {
      weaknesses.push({
        id: 'w-health-ins',
        title: 'Absence of Standalone Health Cover',
        description: 'Lacking personal medical insurance leaves savings exposed to high out-of-pocket costs if employer cover lapses.',
        metric: 'Zero Personal Cover',
        tag: 'High Risk',
        impact: 'Critical',
      });
    }

    if (lifeInsuranceCoverageRatio < 80 && (profile.dependents || 0) > 0) {
      weaknesses.push({
        id: 'w-life-ins',
        title: 'Term Life Underinsurance Gap',
        description: `Coverage stands at ${Math.round(lifeInsuranceCoverageRatio)}% of ideal income protection standard (${currSym}${(metrics.recommendedLifeCoverage ?? 0).toLocaleString()}) for dependents.`,
        metric: `${Math.round(lifeInsuranceCoverageRatio)}% Coverage`,
        tag: 'Protection Gap',
        impact: 'High',
      });
    }

    if (metrics.savingsRatio < 15 && profile.monthlyIncome > 0) {
      weaknesses.push({
        id: 'w-savings',
        title: 'Subdued Savings Rate',
        description: `Saving only ${metrics.savingsRatio}% of income makes wealth accumulation slow and delays financial independence milestones.`,
        metric: `${metrics.savingsRatio}% Rate`,
        tag: 'Wealth Deficit',
        impact: 'High',
      });
    }

    if (totalGoalsCount > fundedGoalsCount) {
      weaknesses.push({
        id: 'w-goals',
        title: 'Unfunded Milestone Commitments',
        description: `${totalGoalsCount - fundedGoalsCount} goals lack adequate savings accumulation, creating target date slippage risk.`,
        metric: `${totalGoalsCount - fundedGoalsCount} Unfunded`,
        tag: 'Planning Lag',
        impact: 'Medium',
      });
    }

    // 3. OPPORTUNITIES (External Upsides & High-ROI Moves)
    const opportunities = [];
    if (metrics.totalDebt > 0) {
      opportunities.push({
        id: 'o-debt-avalanche',
        title: 'High-Interest Debt Prepayment',
        description: `Directing prepayments to top-rate debt can save significant interest charges and instantly boost your FinScore by 8-12 points.`,
        metric: `Save on ${currSym}${(metrics.totalDebt ?? 0).toLocaleString()}`,
        tag: 'Cost Reduction',
        impact: 'High',
      });
    }

    if (metrics.monthlySavings > 0) {
      opportunities.push({
        id: 'o-compounding',
        title: 'Automated Systematic Wealth SIPs',
        description: `Investing monthly surplus (${currSym}${(metrics.monthlySavings ?? 0).toLocaleString()}/mo) systematically into diversified low-cost index funds unlocks long-term compounding.`,
        metric: `${currSym}${(metrics.monthlySavings ?? 0).toLocaleString()}/mo Surplus`,
        tag: 'Wealth Growth',
        impact: 'High',
      });
    }

    if (insurance.hasHealthInsurance) {
      opportunities.push({
        id: 'o-super-topup',
        title: 'Cost-Effective Super Top-Up Health Shield',
        description: 'Acquiring a super top-up policy with high deductible multiplies medical cover by 3x-5x at a fraction of baseline premium costs.',
        metric: '3x-5x Cover',
        tag: 'Risk Arbitrage',
        impact: 'Medium',
      });
    }

    if (goals.length > 0) {
      opportunities.push({
        id: 'o-goal-auto',
        title: 'Automated Milestone Sinking Funds',
        description: 'Configuring automated recurring transfers specifically tagged for upcoming life goals eliminates impulse diversion.',
        metric: 'Auto-Pilot Goals',
        tag: 'Discipline',
        impact: 'Medium',
      });
    }

    if (result.overallScore < 85 && profile.monthlyIncome > 0) {
      opportunities.push({
        id: 'o-finscore-target',
        title: 'Elevate to Elite FinScore Tier (85+)',
        description: `Executing the 3-month action plan will elevate your score from ${result.overallScore} to 85+, unlocking best-in-market loan rates and absolute peace of mind.`,
        metric: `Target: 85+ (now ${result.overallScore})`,
        tag: 'Score Mastery',
        impact: 'High',
      });
    }

    // 4. THREATS (External Macro & Shock Exposures)
    const threats = [];
    if (profile.monthlyIncome > 0) {
      threats.push({
        id: 't-medical-inflation',
        title: 'Hospitalization & Medical Cost Inflation',
        description: 'Healthcare inflation averages 12-14% annually; a single serious medical event can drain liquid reserves without sufficient protection.',
        metric: '14% Annual Inflation',
        tag: 'Inflation Shock',
        impact: 'Critical',
      });

      threats.push({
        id: 't-income-interruption',
        title: 'Sudden Income or Employment Disruption',
        description: `If regular income pauses tomorrow, current reserves sustain household living costs for approximately ${emergencyRunwayMonths.toFixed(1)} months before liquidation of assets is required.`,
        metric: `${emergencyRunwayMonths.toFixed(1)} Mo Runway`,
        tag: 'Cash Flow Risk',
        impact: emergencyRunwayMonths < 4 ? 'Critical' : 'High',
      });

      if (metrics.totalDebt > 0) {
        threats.push({
          id: 't-interest-rate',
          title: 'Benchmark Interest Rate Volatility',
          description: 'Rising benchmark interest rates increase floating-rate loan tenures and monthly interest outlays.',
          metric: 'Floating Rate Exposure',
          tag: 'Macro Headwind',
          impact: 'Medium',
        });
      }

      threats.push({
        id: 't-inflation-drag',
        title: 'Inflation Purchasing Power Erosion',
        description: 'Cash left idle in low-yielding bank accounts loses real purchasing power against persistent 5-7% inflation rates.',
        metric: '~6% Purchasing Drag',
        tag: 'Silent Depletion',
        impact: 'Medium',
      });

      if (lifeInsuranceCoverageRatio < 100 && (profile.dependents || 0) > 0) {
        threats.push({
          id: 't-family-security',
          title: 'Dependent Income Replacement Risk',
          description: 'Unexpected loss of the breadwinner without comprehensive term insurance leaves dependent family members financially vulnerable.',
          metric: 'Family Exposure',
          tag: 'Mortality Risk',
          impact: 'Critical',
        });
      }
    }

    return {
      strengths,
      weaknesses,
      opportunities,
      threats,
      totalFactors: strengths.length + weaknesses.length + opportunities.length + threats.length,
    };
  }, [result, profile, emergency, loans, insurance, goals, currSym]);

  // Dynamic Personal Balance Sheet derived directly from FinScore data
  const finScoreBalanceSheet = useMemo(() => {
    // Current Assets (Liquid & Emergency)
    const liquidEmergency = emergency.currentEmergencySavings || 0;
    
    // Invested / Earmarked Goal Assets
    const goalAssets = goals.map(g => ({
      id: g.id,
      name: `${g.name} Reserve Fund`,
      category: 'Earmarked Goal Asset',
      value: g.currentSavings || 0,
      target: g.targetAmount,
    }));
    const totalGoalAssets = goalAssets.reduce((sum, g) => sum + g.value, 0);

    // Insurance Cash Protection Capital Valuation (Actuarial Value of coverage in place)
    const termCover = insurance.hasTermInsurance ? insurance.termCoverage : 0;
    const healthCover = insurance.hasHealthInsurance ? insurance.healthCoverage : 0;
    const totalProtectionCoverage = termCover + healthCover;

    // Total Tangible / Liquid FinScore Assets
    const totalTangibleAssets = liquidEmergency + totalGoalAssets;

    // Liabilities (Active Loans & Mortgages tracked in FinScore)
    const loanLiabilities = loans.map(l => ({
      id: l.id,
      type: l.type,
      outstanding: l.outstandingAmount || 0,
      monthlyEmi: l.monthlyEmi || 0,
      interestRate: l.interestRate || 0,
    }));
    const totalDebt = loans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
    const totalMonthlyEmi = loans.reduce((sum, l) => sum + (l.monthlyEmi || 0), 0);

    // Net Worth (Assets - Liabilities)
    const netWorth = totalTangibleAssets - totalDebt;
    const isSolvent = netWorth >= 0;

    // Solvency Ratios
    const debtToAssetRatio = totalTangibleAssets > 0 
      ? Math.round((totalDebt / totalTangibleAssets) * 100) 
      : (totalDebt > 0 ? 100 : 0);

    const liquidityRatio = (result.metrics.totalExpenses + totalMonthlyEmi) > 0
      ? (liquidEmergency / (result.metrics.totalExpenses + totalMonthlyEmi)).toFixed(1)
      : '0.0';

    return {
      liquidEmergency,
      goalAssets,
      totalGoalAssets,
      totalTangibleAssets,
      totalProtectionCoverage,
      termCover,
      healthCover,
      loanLiabilities,
      totalDebt,
      totalMonthlyEmi,
      netWorth,
      isSolvent,
      debtToAssetRatio,
      liquidityRatio,
      isEmpty: totalTangibleAssets === 0 && totalDebt === 0,
    };
  }, [emergency, goals, insurance, loans, result.metrics]);

  const handleCopySwot = () => {
    if (swotData.totalFactors === 0) {
      showToast('SWOT analysis is empty. Add your income & financial data to generate SWOT factors.');
      return;
    }
    const text = `📊 FINSCORE PERSONAL FINANCIAL SWOT ANALYSIS
Overall Score: ${result.overallScore}/100 (${result.grade})
Monthly Income: ${currSym}${(profile.monthlyIncome ?? 0).toLocaleString()} | Monthly Savings: ${currSym}${(result.metrics.monthlySavings ?? 0).toLocaleString()}

💪 1. STRENGTHS (${swotData.strengths.length}):
${swotData.strengths.map(s => `• [${s.tag}] ${s.title}: ${s.description} (${s.metric})`).join('\n')}

⚠️ 2. WEAKNESSES (${swotData.weaknesses.length}):
${swotData.weaknesses.map(w => `• [${w.tag}] ${w.title}: ${w.description} (${w.metric})`).join('\n')}

🚀 3. OPPORTUNITIES (${swotData.opportunities.length}):
${swotData.opportunities.map(o => `• [${o.tag}] ${o.title}: ${o.description} (${o.metric})`).join('\n')}

🛡️ 4. THREATS (${swotData.threats.length}):
${swotData.threats.map(t => `• [${t.tag}] ${t.title}: ${t.description} (${t.metric})`).join('\n')}

Strategic Focus: ${result.biggestPriority}`;

    navigator.clipboard.writeText(text);
    setCopiedSwot(true);
    showToast('SWOT strategic analysis copied to clipboard!');
    setTimeout(() => setCopiedSwot(false), 2500);
  };

  const handleDiscussSwotWithAi = (topic?: string) => {
    if (swotData.totalFactors === 0) {
      handleSendAiMessage("My financial details in FinScore are currently cleared/reset. What are the essential first steps I should take to assess and optimize my financial health?");
      setActiveTab('ai_assistant');
      return;
    }
    const query = topic 
      ? `Based on my SWOT Financial Analysis, please provide a tailored action strategy for: "${topic}". My FinScore is ${result.overallScore}/100 and my monthly savings is ${currSym}${(result.metrics.monthlySavings ?? 0).toLocaleString()}.`
      : `Based on my FinScore SWOT Strategic Analysis (Strengths: ${swotData.strengths.length}, Weaknesses: ${swotData.weaknesses.length}, Opportunities: ${swotData.opportunities.length}, Threats: ${swotData.threats.length}), what are my top 3 immediate action items for the next 30 days?`;
    handleSendAiMessage(query);
    setActiveTab('ai_assistant');
  };

  // Pre-fill profile and expenses from existing app portfolio
  const handleSyncFromAppPortfolio = () => {
    // 1. Approximate monthly income from transactions
    const incomeTxns = (transactions || []).filter(t => t.type === 'income');
    const totalIncome = incomeTxns.reduce((a, b) => a + b.amount, 0);
    const monthlyInc = totalIncome > 0 ? totalIncome : profile.monthlyIncome;

    // 2. Liquid cash from assets
    const cashAssets = (assets || []).filter(a => a.category === 'Cash & Savings' || a.category === 'Cash & Bank');
    const cashTotal = cashAssets.reduce((a, b) => a + b.value, 0);

    // 3. Loans from liabilities
    if (liabilities && liabilities.length > 0) {
      const mappedLoans: FinScoreLoan[] = liabilities.map((l, idx) => ({
        id: `loan-sync-${idx}`,
        type: l.category || 'Loan',
        outstandingAmount: l.value,
        monthlyEmi: l.monthlyPayment || Math.round(l.value * 0.03),
        interestRate: l.interestRate || 10.5,
        remainingTenureMonths: 36,
      }));
      setLoans(mappedLoans);
    }

    // 4. Goals from app goals
    if (appGoals && appGoals.length > 0) {
      const mappedGoals: FinScoreGoal[] = appGoals.map((g, idx) => ({
        id: `goal-sync-${idx}`,
        name: g.name,
        category: 'Other',
        targetAmount: g.targetAmount,
        currentSavings: g.currentAmount,
        targetYear: parseInt(g.targetDate ? g.targetDate.split('-')[0] : '2030') || 2030,
        expectedReturnRate: 9,
      }));
      setGoals(mappedGoals);
    }

    if (cashTotal > 0) {
      setEmergency(prev => ({
        ...prev,
        currentEmergencySavings: cashTotal,
      }));
    }

    setProfile(prev => ({
      ...prev,
      monthlyIncome: monthlyInc,
    }));
  };

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => {
      setToastNotice(null);
    }, 4000);
  };

  // Reset FinScore: Completely clear ALL information across profile, expenses, loans, insurance, emergency, investments, and goals
  const handleResetData = () => {
    setProfile(EMPTY_FINSCORE_PROFILE);
    setExpenses(EMPTY_FINSCORE_EXPENSES);
    setLoans([]);
    setInsurance(EMPTY_FINSCORE_INSURANCE);
    setEmergency(EMPTY_FINSCORE_EMERGENCY);
    setFinScoreInvestments([]);
    setGoals([]);
    setSimEmergencyAdd(0);
    setSimPrepayDebt(0);
    setSwotQuadrant('all');
    setCopiedSwot(false);
    setAiChatMessages([
      {
        sender: 'ai',
        text: 'All financial information has been cleared. Add your profile, monthly income, and expenses to calculate your personalized FinScore and receive guidance.',
        timestamp: 'Just now',
      },
    ]);
    showToast('All information cleared in Financial Health Score & Planner (SWOT matrix reset to empty).');
  };

  // Load benchmark sample profile & data for demo / testing
  const handleLoadSampleData = () => {
    setProfile(INITIAL_FINSCORE_PROFILE);
    setExpenses(INITIAL_FINSCORE_EXPENSES);
    setLoans(INITIAL_FINSCORE_LOANS);
    setInsurance(INITIAL_FINSCORE_INSURANCE);
    setEmergency(INITIAL_FINSCORE_EMERGENCY);
    setFinScoreInvestments(INITIAL_FINSCORE_INVESTMENTS);
    setGoals(INITIAL_FINSCORE_GOALS);
    setSimEmergencyAdd(0);
    setSimPrepayDebt(0);
    setAiChatMessages([
      {
        sender: 'ai',
        text: `Hello ${INITIAL_FINSCORE_PROFILE.name}! I'm your AI Financial Health Advisor. I have analyzed your income, loan commitments, emergency savings, and future goals. What would you like guidance on today?`,
        timestamp: 'Just now',
      },
    ]);
    showToast('Sample benchmark profile and data loaded.');
  };

  // Open modal to add data to profile
  const handleOpenAddProfileModal = () => {
    setTempProfile({ ...profile });
    setShowAddProfileModal(true);
  };

  // Save profile from modal
  const handleSaveProfileData = (targetTab?: FinScoreTab) => {
    setProfile(tempProfile);
    setShowAddProfileModal(false);
    showToast(`Profile updated for ${tempProfile.name || 'User'}!`);
    if (targetTab) {
      setActiveTab(targetTab);
    }
  };

  // Add a new Goal
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newGoalTarget) return;

    const currentYear = new Date().getFullYear();
    const tenure = newGoalTenureYears > 0 ? newGoalTenureYears : Math.max(1, (parseInt(newGoalYear) || 2030) - currentYear);
    const targetYr = currentYear + tenure;

    const goal: FinScoreGoal = {
      id: `goal-${Date.now()}`,
      name: newGoalName.trim(),
      category: newGoalCategory,
      targetAmount: parseFloat(newGoalTarget) || 0,
      currentSavings: parseFloat(newGoalSaved) || 0,
      targetYear: targetYr,
      tenureYears: tenure,
      expectedReturnRate: 9,
    };

    setGoals(prev => [...prev, goal]);
    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalSaved('');
    setNewGoalTenureYears(4);
    setNewGoalYear(String(currentYear + 4));
    setNewGoalDate(calculateDateFromTenureMonths(4 * 12));
    showToast(`Added ${goal.name} with ${tenure} yr tenure!`);
  };

  // Delete a Goal
  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Add a new Loan
  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoanOutstanding || !newLoanEmi) return;

    const loan: FinScoreLoan = {
      id: `loan-${Date.now()}`,
      type: newLoanType,
      outstandingAmount: parseFloat(newLoanOutstanding) || 0,
      monthlyEmi: parseFloat(newLoanEmi) || 0,
      interestRate: parseFloat(newLoanRate) || 10,
      remainingTenureMonths: parseInt(newLoanTenure) || 36,
    };

    setLoans(prev => [...prev, loan]);
    setNewLoanOutstanding('');
    setNewLoanEmi('');
  };

  // Delete a Loan
  const handleDeleteLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
  };

  // Adjust Loan Tenure
  const handleUpdateLoanTenure = (loanId: string, deltaMonths: number) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        const nextTenure = Math.max(1, (l.remainingTenureMonths || 12) + deltaMonths);
        return { ...l, remainingTenureMonths: nextTenure };
      }
      return l;
    }));
  };

  // Add Investment Item (Step 6)
  const handleAddInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName.trim()) return;

    const navNum = parseFloat(newInvNav) || undefined;
    const unitsNum = parseFloat(newInvUnits) || undefined;
    const purchaseNavNum = parseFloat(newInvPurchaseNav) || undefined;

    let computedVal = parseFloat(newInvValue) || 0;
    if ((!computedVal || computedVal <= 0) && navNum && unitsNum) {
      computedVal = Math.round(navNum * unitsNum * 100) / 100;
    }

    if (computedVal <= 0 && (!unitsNum || !navNum)) {
      showToast('Please provide a current valuation or both NAV and Units.');
      return;
    }

    const newInv = {
      id: `inv-${Date.now()}`,
      name: newInvName.trim(),
      category: newInvCategory,
      currentValue: computedVal,
      monthlyContribution: parseFloat(newInvMonthly) || 0,
      expectedReturnRate: parseFloat(newInvReturn) || 12,
      nav: navNum,
      units: unitsNum,
      purchaseNav: purchaseNavNum,
    };

    setFinScoreInvestments(prev => [...prev, newInv]);
    setNewInvName('');
    setNewInvValue('');
    setNewInvMonthly('');
    setNewInvNav('');
    setNewInvUnits('');
    setNewInvPurchaseNav('');
    showToast(`Added ${newInv.name} to portfolio!`);
  };

  const handleDeleteInvestment = (id: string) => {
    setFinScoreInvestments(prev => prev.filter(item => item.id !== id));
  };

  // Clear Investments & Assets on this page only
  const handleClearInvestmentsPage = () => {
    setFinScoreInvestments([]);
    showToast('Investments & Assets cleared for this page only.');
  };

  // Restore benchmark investments on this page
  const handleLoadSampleInvestments = () => {
    setFinScoreInvestments(INITIAL_FINSCORE_INVESTMENTS);
    showToast('Benchmark investments restored for this page.');
  };

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (activeTab === 'ai_assistant') {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiChatMessages, isAiLoading, activeTab]);

  // Text to speech toggling for AI messages
  const handleToggleSpeak = (text: string, index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported by your browser.');
      return;
    }
    if (isSpeakingIndex === index) {
      window.speechSynthesis.cancel();
      setIsSpeakingIndex(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeakingIndex(null);
      utterance.onerror = () => setIsSpeakingIndex(null);
      window.speechSynthesis.speak(utterance);
      setIsSpeakingIndex(index);
    }
  };

  // Send message to AI Assistant with full multi-turn history
  const handleSendAiMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || aiQuestion;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedHistory = [...aiChatMessages, userMsg];
    setAiChatMessages(updatedHistory);
    if (!customPrompt) setAiQuestion('');
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/finscore/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          result,
          question: textToSend,
          history: updatedHistory,
          model: selectedAiModel,
          rolePreset: selectedRolePreset,
        }),
      });

      const data = await res.json();
      const aiReply = data?.advice || 'Based on your numbers, your biggest priority is building a liquid 6-month emergency reserve before increasing discretionary spending.';

      setAiChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data?.modelUsed || selectedAiModel,
        },
      ]);
    } catch (err) {
      setAiChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is your priority assessment: Build your emergency fund of ₹${(result.metrics.emergencyShortfall ?? 0).toLocaleString()} before taking on further obligations. Your current savings rate is ${result.metrics.savingsRatio}%.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedAiModel,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Progress Bar color generator based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500';
    if (score >= 65) return 'text-blue-400 bg-blue-500';
    if (score >= 50) return 'text-amber-400 bg-amber-500';
    return 'text-rose-400 bg-rose-500';
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* ------------------------------------------------------------- */}
      {/* Top Header & Context Bar */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden ${finScoreTheme.hero}`}>
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                FinScore™ Core Engine
              </span>
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${finScoreTheme.badge}`}>
                Academic & Educational Standard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Financial Health Score & Planner
            </h1>
            <p className={`text-sm mt-1 max-w-2xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Answering the central financial question: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>“How financially healthy am I, and what should I improve?”</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* The Two New User Buttons */}
            <button
              id="btn-finscore-quick-plan"
              onClick={() => setShowHealthPlanModal(true)}
              title="Open personalized step-by-step 1-Click Financial Health Plan"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>1-Click Health Plan</span>
            </button>

            <button
              id="btn-finscore-peer-benchmark"
              onClick={() => setShowBenchmarkModal(true)}
              title="Compare your score and 50/30/20 budget with peer benchmarks"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-sm cursor-pointer ${finScoreTheme.btnSecondary}`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span>Peer Benchmark & Report</span>
            </button>

            {/* 1. Reset / Clear All Button */}
            <button
              id="btn-finscore-reset"
              onClick={handleResetData}
              title="Clear all information in Financial Health Score & Planner"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-sm ${
                isLight
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 hover:border-rose-300'
                  : 'bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 hover:text-rose-200 border-rose-900/60 hover:border-rose-700/80'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset (Clear All)</span>
            </button>

            {/* 2. Load Sample Data Button */}
            <button
              id="btn-finscore-load-sample"
              onClick={handleLoadSampleData}
              title="Load sample financial profile with benchmark data"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-sm ${finScoreTheme.btnSecondary}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sample</span>
            </button>

            {/* 3. Add Data to Profile Button */}
            <button
              id="btn-finscore-add-data-profile"
              onClick={handleOpenAddProfileModal}
              title="Add or update financial profile parameters"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-sm ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Data to Profile</span>
            </button>

            <button
              id="btn-finscore-sync-portfolio"
              onClick={handleSyncFromAppPortfolio}
              title="Import income, assets, and loans from your active portfolio"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-sm ${finScoreTheme.btnSecondary}`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Sync from Portfolio</span>
            </button>

            <button
              id="btn-finscore-ask-ai"
              onClick={() => setActiveTab('ai_assistant')}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>AI Advisor Plan</span>
            </button>
          </div>
        </div>

        {/* FINANCIAL HEALTH SCORE & PLAN AT THE TOP OF THAT PLACE */}
        <div className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all ${finScoreTheme.banner}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Health Score Glance */}
            <div className={`lg:col-span-5 flex items-center gap-4 border-b lg:border-b-0 lg:border-r ${finScoreTheme.divider} pb-4 lg:pb-0 lg:pr-4`}>
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex flex-col items-center justify-center font-mono text-center">
                  <span className="text-2xl font-extrabold text-blue-400 leading-tight">
                    {result.overallScore}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${finScoreTheme.muted}`}>
                    /100
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider border ${result.gradeColor}`}>
                    Grade {result.grade}
                  </span>
                  <span className="text-xs font-semibold truncate">
                    {result.overallScore >= 80
                      ? 'Optimal Financial Health'
                      : result.overallScore >= 65
                      ? 'Good Resilient Foundation'
                      : result.overallScore >= 50
                      ? 'Fair • Vulnerable to Shocks'
                      : 'Critical Action Needed'}
                  </span>
                </div>

                {/* 4 Pillars Quick Mini Progress */}
                <div className="grid grid-cols-4 gap-1.5 mt-2.5 text-[10px] font-mono">
                  <div title={`Emergency Fund: ${result.scores.emergencyFund}/100`} className={`text-center p-1 rounded ${finScoreTheme.innerCard}`}>
                    <div className={`${finScoreTheme.muted} text-[9px] truncate`}>Emergency</div>
                    <div className="font-bold text-amber-400">{result.scores.emergencyFund}</div>
                  </div>
                  <div title={`Insurance: ${result.scores.insurance}/100`} className={`text-center p-1 rounded ${finScoreTheme.innerCard}`}>
                    <div className={`${finScoreTheme.muted} text-[9px] truncate`}>Insurance</div>
                    <div className="font-bold text-blue-400">{result.scores.insurance}</div>
                  </div>
                  <div title={`Savings: ${result.scores.savings}/100`} className={`text-center p-1 rounded ${finScoreTheme.innerCard}`}>
                    <div className={`${finScoreTheme.muted} text-[9px] truncate`}>Savings</div>
                    <div className="font-bold text-emerald-400">{result.scores.savings}</div>
                  </div>
                  <div title={`Debt: ${result.scores.debt}/100`} className={`text-center p-1 rounded ${finScoreTheme.innerCard}`}>
                    <div className={`${finScoreTheme.muted} text-[9px] truncate`}>Debt</div>
                    <div className="font-bold text-purple-400">{result.scores.debt}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Health Plan Glance */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                    Financial Health Plan
                  </span>
                  <span className="text-xs font-bold text-amber-400 truncate">
                    Top Priority: {result.biggestPriority}
                  </span>
                </div>
                <p className={`text-xs line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  {result.summaryDiagnosis}
                </p>
                <div className={`flex flex-wrap items-center gap-3 text-[11px] ${finScoreTheme.muted} pt-0.5`}>
                  <span>Monthly Surplus: <strong className="font-mono text-emerald-400">{currSym}{(result.metrics.monthlySavings ?? 0).toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Goal Target SIP: <strong className="font-mono text-blue-400">{currSym}{(result.metrics.totalGoalRequiredMonthlySavings ?? 0).toLocaleString()}/mo</strong></span>
                </div>
              </div>

              {/* Quick Action Plan Trigger Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-finscore-plan-preview"
                  onClick={() => setShowHealthPlanModal(true)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View Plan</span>
                </button>
                <button
                  id="btn-finscore-benchmark-preview"
                  onClick={() => setShowBenchmarkModal(true)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${finScoreTheme.btnSecondary}`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>Benchmark</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Action Notification Toast Banner */}
        {toastNotice && (
          <div className="mt-4 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastNotice}</span>
            </div>
            <button
              onClick={() => setToastNotice(null)}
              className="text-emerald-400/70 hover:text-emerald-300 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className={`flex items-center gap-1.5 mt-6 pt-4 border-t ${finScoreTheme.divider} overflow-x-auto no-scrollbar text-xs font-semibold`}>
          {[
            { id: 'profile', label: '1. Profile', icon: User },
            { id: 'income_expenses', label: '2. Income & Expenses', icon: DollarSign },
            { id: 'debt', label: '3. Debt Score', icon: Briefcase },
            { id: 'insurance', label: '4. Insurance Score', icon: ShieldCheck },
            { id: 'emergency', label: '5. Emergency Fund', icon: AlertTriangle },
            { id: 'investments_assets', label: '6. Investments & Assets', icon: TrendingUp },
            { id: 'goals', label: '7. Future Goals', icon: Target },
            { id: 'ai_assistant', label: '8. AI Assistant', icon: Bot, isAi: true },
            { id: 'dashboard', label: '9. Score Dashboard', icon: Activity },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-finscore-${tab.id}`}
                onClick={() => setActiveTab(tab.id as FinScoreTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? finScoreTheme.subtabActive
                    : finScoreTheme.subtabInactive
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {'isAi' in tab && tab.isAi && (
                  <span className="flex h-2 w-2 relative ml-0.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: SCORE DASHBOARD (Score Viewer, Pillars, History) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Main Hero Financial Health Banner */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${finScoreTheme.card}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Overall Score Dial */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-4">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  {/* Circular SVG Gauge Track */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      strokeWidth="10"
                      className={finScoreTheme.gaugeTrack}
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      strokeWidth="10"
                      strokeDasharray={314.15}
                      strokeDashoffset={314.15 - (314.15 * result.overallScore) / 100}
                      strokeLinecap="round"
                      className="stroke-blue-500 transition-all duration-1000 ease-out"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tighter">
                      {result.overallScore}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Out of 100
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${result.gradeColor}`}>
                    <Award className="w-3.5 h-3.5" />
                    FINANCIAL HEALTH: {result.grade}
                  </span>
                </div>
              </div>

              {/* Qualitative Diagnostic Explanation */}
              <div className="lg:col-span-7 space-y-4">
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-blue-50/70 border-blue-200 text-blue-950' : 'bg-blue-500/10 border-blue-500/20 text-blue-100'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">
                        Score Explanation & Diagnostic
                      </h4>
                      <p className="text-sm font-medium mt-1 leading-relaxed">
                        {result.summaryDiagnosis}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Top Priority Callout */}
                <div className={`p-4 rounded-2xl border ${
                  isLight ? 'bg-amber-50/80 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/20 text-amber-100'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                        Top Financial Priority
                      </h4>
                      <p className="text-sm font-semibold mt-1">
                        {result.biggestPriority}
                      </p>
                      <button
                        onClick={() => setActiveTab('ai_assistant')}
                        className="mt-2 text-xs font-bold text-amber-600 hover:underline inline-flex items-center gap-1"
                      >
                        View AI Monthly Action Plan <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clear Score Bands Guide for Beginners */}
                <div className={`p-3.5 rounded-2xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                    <span>How To Interpret Your Score</span>
                    <span className="font-mono text-[10px] text-blue-400">Current: Grade {result.grade} ({result.overallScore}/100)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className={`p-2 rounded-xl border transition-all ${
                      result.overallScore >= 80
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold shadow-sm'
                        : 'bg-black/10 border-white/5 text-slate-400'
                    }`}>
                      <div className="font-bold text-xs">80 - 100 • Grade A</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Excellent &amp; Resilient</div>
                    </div>
                    <div className={`p-2 rounded-xl border transition-all ${
                      result.overallScore >= 65 && result.overallScore < 80
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-400 font-bold shadow-sm'
                        : 'bg-black/10 border-white/5 text-slate-400'
                    }`}>
                      <div className="font-bold text-xs">65 - 79 • Grade B</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Solid Foundation</div>
                    </div>
                    <div className={`p-2 rounded-xl border transition-all ${
                      result.overallScore >= 50 && result.overallScore < 65
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold shadow-sm'
                        : 'bg-black/10 border-white/5 text-slate-400'
                    }`}>
                      <div className="font-bold text-xs">50 - 64 • Grade C</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Vulnerable to Shocks</div>
                    </div>
                    <div className={`p-2 rounded-xl border transition-all ${
                      result.overallScore < 50
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 font-bold shadow-sm'
                        : 'bg-black/10 border-white/5 text-slate-400'
                    }`}>
                      <div className="font-bold text-xs">&lt; 50 • Grade D</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Critical Attention</div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Action Row with User's Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowHealthPlanModal(true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Open 1-Click Health Plan</span>
                  </button>
                  <button
                    onClick={() => setShowBenchmarkModal(true)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <span>Peer Benchmark &amp; Report</span>
                  </button>
                  <button
                    onClick={() => {
                      const el = document.getElementById('finscore-balance-sheet-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isLight
                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                        : 'bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    <Scale className="w-4 h-4 text-indigo-400" />
                    <span>Balance Sheet &amp; Solvency</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Core Pillar Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Emergency Fund Card */}
            <div 
              onClick={() => setActiveTab('emergency')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer hover:scale-[1.01] transition-all ${
                isLight ? 'bg-white border-slate-200 hover:border-blue-400' : 'bg-slate-900 border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Emergency Fund
                </span>
                <span className="text-xs font-bold font-mono text-amber-400">
                  {result.scores.emergencyFund}/100
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono">
                {currSym}{(Number(emergency.currentEmergencySavings) || 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Target: {currSym}{(result.metrics.requiredEmergencyFund ?? 0).toLocaleString()} ({emergency.targetMonths} mo)
              </div>
              {/* Visual progress bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, result.metrics.emergencyFundRatio)}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-medium">
                {result.metrics.emergencyShortfall > 0 
                  ? `Shortfall: ${currSym}${(result.metrics.emergencyShortfall ?? 0).toLocaleString()} needed`
                  : 'Fully funded!'}
              </div>
            </div>

            {/* Insurance Score Card */}
            <div 
              onClick={() => setActiveTab('insurance')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer hover:scale-[1.01] transition-all ${
                isLight ? 'bg-white border-slate-200 hover:border-blue-400' : 'bg-slate-900 border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Insurance Score
                </span>
                <span className="text-xs font-bold font-mono text-blue-400">
                  {result.scores.insurance}/100
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono">
                {insurance.hasTermInsurance ? 'Protected' : 'Underinsured'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Life: {currSym}{(insurance.lifeCoverage || 0).toLocaleString()} • Health: {currSym}{(insurance.healthCoverage || 0).toLocaleString()}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${result.scores.insurance}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-medium">
                {insurance.hasPersonalHealthPolicy ? 'Personal health policy active' : 'Needs independent health policy'}
              </div>
            </div>

            {/* Savings Score Card */}
            <div 
              onClick={() => setActiveTab('income_expenses')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer hover:scale-[1.01] transition-all ${
                isLight ? 'bg-white border-slate-200 hover:border-blue-400' : 'bg-slate-900 border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Savings Score
                </span>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  {result.scores.savings}/100
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono">
                {result.metrics.savingsRatio}%
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Monthly surplus: {currSym}{(result.metrics.monthlySavings ?? 0).toLocaleString()}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${result.scores.savings}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-medium">
                {result.metrics.savingsRatio >= 25 ? 'Healthy surplus accumulation' : 'Needs expense pruning'}
              </div>
            </div>

            {/* Debt Score Card */}
            <div 
              onClick={() => setActiveTab('debt')}
              className={`p-5 rounded-3xl border shadow-sm cursor-pointer hover:scale-[1.01] transition-all ${
                isLight ? 'bg-white border-slate-200 hover:border-blue-400' : 'bg-slate-900 border-slate-800 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-purple-500" />
                  Debt Score
                </span>
                <span className="text-xs font-bold font-mono text-purple-400">
                  {result.scores.debt}/100
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono">
                {result.metrics.emiToIncomeRatio}% EMI
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                EMI: {currSym}{(result.metrics.totalMonthlyEmi ?? 0).toLocaleString()} / mo
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${result.scores.debt}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-400 mt-2 font-medium">
                {result.metrics.emiToIncomeRatio <= 35 ? 'Safe debt-to-income buffer' : 'High EMI burden warning'}
              </div>
            </div>
          </div>

          {/* Future Goals Quick Progress Overview */}
          <div className={`p-6 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  Future Goals Readiness ({result.scores.futureGoals}/100)
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Required monthly saving across {goals.length} milestones: <strong>{currSym}{(result.metrics.totalGoalRequiredMonthlySavings ?? 0).toLocaleString()}/mo</strong>
                </p>
              </div>
              <button
                onClick={() => setActiveTab('goals')}
                className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
              >
                Manage Goals <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {goals.map(g => {
                const req = calculateRequiredMonthlySaving(g.targetAmount, g.currentSavings, g.targetYear, g.expectedReturnRate);
                const pct = Math.min(100, Math.round((g.currentSavings / (g.targetAmount || 1)) * 100));
                return (
                  <div key={g.id} className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{g.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono">
                        Target: {g.targetYear}
                      </span>
                    </div>
                    <div className="text-base font-extrabold font-mono mt-2">
                      {currSym}{(g.currentSavings ?? 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {currSym}{(g.targetAmount ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>{pct}% funded</span>
                      <span className="text-emerald-400 font-semibold">{currSym}{(req ?? 0).toLocaleString()}/mo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NEW UNIQUE CHARTS & VISUAL ANALYTICS HUB */}
          <div className={`p-6 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                    <BarChart3 className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Score Analytics & Financial Diagnostics
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    4 Unique Visualizations
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Explore multi-pillar symmetry, month-over-month trajectory, cash flow allocation, and simulated shock resistance.
                </p>
              </div>

              {/* Unique Chart View Switcher Controls */}
              <div className={`flex items-center p-1 rounded-2xl border text-xs font-semibold ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                <button
                  id="btn-chart-mode-radar"
                  onClick={() => setDashboardChartMode('radar')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    dashboardChartMode === 'radar'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Pillar Radar</span>
                </button>
                <button
                  id="btn-chart-mode-trajectory"
                  onClick={() => setDashboardChartMode('trajectory')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    dashboardChartMode === 'trajectory'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Trajectory</span>
                </button>
                <button
                  id="btn-chart-mode-cashflow"
                  onClick={() => setDashboardChartMode('cashflow')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    dashboardChartMode === 'cashflow'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <PieChartIcon className="w-3.5 h-3.5" />
                  <span>Cash Flow</span>
                </button>
                <button
                  id="btn-chart-mode-stresstest"
                  onClick={() => setDashboardChartMode('stresstest')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    dashboardChartMode === 'stresstest'
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Stress Test</span>
                </button>
              </div>
            </div>

            {/* CHART 1: MULTI-PILLAR RADAR (SPIDER CHART) */}
            {dashboardChartMode === 'radar' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarPillarData}>
                      <PolarGrid stroke={isLight ? '#cbd5e1' : '#334155'} strokeDasharray="3 3" />
                      <PolarAngleAxis 
                        dataKey="pillar" 
                        tick={{ fill: isLight ? '#475569' : '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        stroke={isLight ? '#94a3b8' : '#64748b'} 
                        tick={{ fontSize: 9 }} 
                      />
                      <Radar
                        name="Your Current FinScore"
                        dataKey="score"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.45}
                        strokeWidth={2}
                      />
                      <Radar
                        name="Benchmark Target (85+)"
                        dataKey="benchmark"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.12}
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                          borderColor: isLight ? '#cbd5e1' : '#334155',
                          borderRadius: '16px',
                          fontSize: '12px'
                        }} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Radar Diagnostic Takeaways */}
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Financial Balance Index
                      </span>
                      <span className="text-xs font-bold text-blue-400">
                        {Math.round(
                          100 - (Math.max(...radarPillarData.map(d => d.score)) - Math.min(...radarPillarData.map(d => d.score))) * 0.4
                        )}% Symmetric
                      </span>
                    </div>
                    <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                      Radar shape shows where your financial fortress is strong and where it is vulnerable.
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${
                    isLight ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                      Strongest Pillar
                    </span>
                    <p className="text-xs font-bold mt-0.5">
                      {radarPillarData.reduce((prev, curr) => curr.score > prev.score ? curr : prev).pillar} ({
                        Math.max(...radarPillarData.map(d => d.score))
                      }/100)
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${
                    isLight ? 'bg-amber-50/60 border-amber-200 text-amber-950' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                      Key Growth Area
                    </span>
                    <p className="text-xs font-bold mt-0.5">
                      {radarPillarData.reduce((prev, curr) => curr.score < prev.score ? curr : prev).pillar} ({
                        Math.min(...radarPillarData.map(d => d.score))
                      }/100)
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CHART 2: SCORE IMPROVEMENT TRAJECTORY */}
            {dashboardChartMode === 'trajectory' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Tracking month-over-month score improvement: <strong>52 → 58 → 63 → 70 → {result.overallScore}</strong>
                  </p>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    +{result.overallScore - 52} Points Growth
                  </span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                          borderColor: isLight ? '#cbd5e1' : '#334155',
                          borderRadius: '16px',
                          fontSize: '12px'
                        }} 
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Line type="monotone" dataKey="overallScore" name="FinScore" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                      <Line type="monotone" dataKey="savingsScore" name="Savings" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="debtScore" name="Debt" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" />
                      <Line type="monotone" dataKey="emergencyScore" name="Emergency" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* CHART 3: CASH FLOW ALLOCATION BREAKDOWN */}
            {dashboardChartMode === 'cashflow' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                  {cashFlowAllocationData.map(item => (
                    <div key={item.name} className={`p-3.5 rounded-2xl border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] font-bold text-slate-400">{item.name}</span>
                      </div>
                      <div className="text-base font-extrabold font-mono">
                        {currSym}{(item.amount ?? 0).toLocaleString()}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>{item.category}</span>
                        <span className="font-bold text-blue-400">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashFlowAllocationData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} />
                      <XAxis type="number" unit="%" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={110} />
                      <Tooltip 
                        formatter={(val: any) => [`${val}% of Monthly Income`, 'Allocation']}
                        contentStyle={{ 
                          backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                          borderColor: isLight ? '#cbd5e1' : '#334155',
                          borderRadius: '16px',
                          fontSize: '12px'
                        }} 
                      />
                      <Bar dataKey="percentage" radius={[0, 8, 8, 0]}>
                        {cashFlowAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* CHART 4: FINANCIAL STRESS TEST & SHOCK RESISTANCE */}
            {dashboardChartMode === 'stresstest' && (
              <div className="space-y-4">
                <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Simulated impact of personal financial shocks on your FinScore resilience and emergency runway.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stressTestData.map(item => (
                    <div key={item.scenario} className={`p-4 rounded-2xl border flex flex-col justify-between ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-300">{item.scenario}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            item.severity === 'normal' 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : item.severity === 'moderate'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {item.severity}
                          </span>
                        </div>
                        <div className="text-2xl font-black font-mono my-1" style={{ color: item.color }}>
                          {item.score} <span className="text-xs font-normal text-slate-500">/ 100</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mb-2">
                          Runway: <strong className="text-white">{item.runwayMonths} Months</strong>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight pt-2 border-t border-slate-800/50">
                        {item.impact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE AI ASSISTANT QUICK-LAUNCH & LIVE CHAT CARD IN SCORE DASHBOARD */}
          <div className={`p-6 rounded-3xl border shadow-sm ${
            isLight ? 'bg-gradient-to-br from-blue-50/60 via-indigo-50/40 to-white border-blue-200' : 'bg-gradient-to-br from-blue-950/20 via-slate-900 to-slate-900 border-blue-900/40'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                      7. AI Assistant Chat — Active
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Online
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Ask real-time questions about your FinScore, emergency fund roadmap, or debt payoff.
                  </p>
                </div>
              </div>

              <button
                id="btn-open-full-ai-studio"
                onClick={() => setActiveTab('ai_assistant')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto cursor-pointer"
              >
                <span>Open Full AI Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {[
                'How do I reach FinScore 85+ fastest?',
                'Should I prepay loan or build emergency buffer?',
                'How much term insurance do I need for my family?'
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => {
                    handleSendAiMessage(prompt);
                    setActiveTab('ai_assistant');
                  }}
                  className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-all ${
                    isLight ? 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50' : 'bg-slate-900 border-blue-900/60 text-blue-300 hover:bg-blue-950/50'
                  }`}
                >
                  ✨ {prompt}
                </button>
              ))}
            </div>

            {/* Live Chat Input Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask FinScore AI anything about your financial health, loans, or goals..."
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleSendAiMessage();
                    setActiveTab('ai_assistant');
                  }
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs ${
                  isLight ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500' : 'bg-slate-950 border-slate-700 text-white focus:border-blue-500'
                }`}
              />
              <button
                onClick={() => {
                  handleSendAiMessage();
                  setActiveTab('ai_assistant');
                }}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 shadow-md cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Interactive What-If Simulator */}
          <div className={`p-6 rounded-3xl border ${
            isLight ? 'bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-blue-500" />
              <h4 className="text-sm font-bold uppercase tracking-wider">
                Interactive What-If Score Simulator
              </h4>
            </div>
            <p className={`text-xs mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Test how taking concrete actions will immediately boost your FinScore.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Add to Emergency Savings:</span>
                  <span className="font-mono font-bold text-blue-500">+{currSym}{(simEmergencyAdd ?? 0).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={5000}
                  value={simEmergencyAdd}
                  onChange={e => setSimEmergencyAdd(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Prepay Outstanding Debt:</span>
                  <span className="font-mono font-bold text-purple-500">+{currSym}{(simPrepayDebt ?? 0).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={150000}
                  step={10000}
                  value={simPrepayDebt}
                  onChange={e => setSimPrepayDebt(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>

            {(simEmergencyAdd > 0 || simPrepayDebt > 0) && (
              <div className="mt-4 pt-3 border-t border-blue-500/20 flex items-center justify-between text-xs">
                <span className="font-medium">
                  Simulated Impact: Projected score moves to <strong className="font-mono text-emerald-400 font-bold">{result.overallScore}/100</strong>
                </span>
                <button
                  onClick={() => { setSimEmergencyAdd(0); setSimPrepayDebt(0); }}
                  className="text-slate-400 hover:text-white underline text-[11px]"
                >
                  Reset Simulator
                </button>
              </div>
            )}
          </div>

          {/* Automatic Alerts Feed (Step 11) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Active Health Diagnostic Alerts ({result.alerts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                      : alert.severity === 'positive'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{alert.title}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/30">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{alert.message}</p>
                  {alert.actionRecommendation && (
                    <div className="pt-1.5 border-t border-white/10 font-semibold text-white/90">
                      Recommendation: {alert.actionRecommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* PERSONAL FINANCIAL SWOT STRATEGIC ANALYSIS (In Last of Score Dashboard) */}
          {/* ----------------------------------------------------------- */}
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            {/* Header: Title, Subtitle, Copy SWOT & Ask AI Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/40">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">
                      Personal Financial SWOT Strategic Analysis
                    </h2>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      4-Quadrant Diagnostic Matrix
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      ({swotData.totalFactors} Strategic Factors)
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    An executive audit evaluating your internal financial advantages & vulnerabilities alongside external wealth compounding opportunities and macro shock exposures.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Quadrant Filter & Consultation CTAs */}
              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                <button
                  onClick={handleCopySwot}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedSwot
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                  }`}
                  title="Copy formatted SWOT report to clipboard"
                >
                  {copiedSwot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSwot ? 'Copied Report!' : 'Copy SWOT Report'}</span>
                </button>

                <button
                  onClick={() => handleDiscussSwotWithAi()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all active:scale-95"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Consult AI Advisor</span>
                </button>
              </div>
            </div>

            {/* Quadrant Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                Filter View:
              </span>
              {[
                { id: 'all', label: 'All 4 Quadrants (Matrix)', count: swotData.totalFactors },
                { id: 'strengths', label: 'Strengths (S)', count: swotData.strengths.length, color: 'text-emerald-400' },
                { id: 'weaknesses', label: 'Weaknesses (W)', count: swotData.weaknesses.length, color: 'text-rose-400' },
                { id: 'opportunities', label: 'Opportunities (O)', count: swotData.opportunities.length, color: 'text-blue-400' },
                { id: 'threats', label: 'Threats (T)', count: swotData.threats.length, color: 'text-amber-400' },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSwotQuadrant(filter.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    swotQuadrant === filter.id
                      ? isLight
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    swotQuadrant === filter.id ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>

            {/* When all SWOT factors are empty (after Clear All, Reset, or initial empty state) */}
            {swotData.totalFactors === 0 && (
              <div className={`p-6 rounded-2xl border text-center space-y-3 ${
                isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center ${
                  isLight ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    SWOT Strategic Matrix is Empty (0 Factors)
                  </h3>
                  <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    All financial information has been cleared or reset. Add your profile, monthly income, and expenses to generate a tailored 4-quadrant SWOT matrix, or load sample benchmark data.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Enter Financial Profile (Step 1)</span>
                  </button>
                  <button
                    onClick={handleLoadSampleData}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Load Benchmark Sample Data</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4-Quadrant SWOT Grid */}
            <div className={`grid grid-cols-1 ${swotQuadrant === 'all' ? 'lg:grid-cols-2' : 'grid-cols-1'} gap-5`}>
              {/* QUADRANT 1: STRENGTHS */}
              {(swotQuadrant === 'all' || swotQuadrant === 'strengths') && (
                <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isLight ? 'bg-emerald-50/40 border-emerald-200/80' : 'bg-emerald-950/20 border-emerald-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-500/20">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-emerald-500/20">
                          S
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                            <ShieldCheck className="w-4 h-4" />
                            Internal Strengths
                          </h3>
                          <p className="text-[11px] text-slate-400">Capital advantages & disciplined habits</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {swotData.strengths.length} Factors
                      </span>
                    </div>

                    <div className="space-y-3">
                      {swotData.strengths.length === 0 ? (
                        <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                          isLight ? 'bg-white/60 border-emerald-200 text-slate-500' : 'bg-slate-900/60 border-emerald-500/20 text-slate-400'
                        }`}>
                          No internal strengths recorded yet. Enter your income & savings in Step 1 to identify financial advantages.
                        </div>
                      ) : (
                        swotData.strengths.map(item => (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                              isLight ? 'bg-white/90 border-emerald-100 shadow-xs' : 'bg-slate-900/90 border-emerald-500/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold flex items-center gap-1.5 text-slate-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{item.title}</span>
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 shrink-0">
                                {item.metric}
                              </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] uppercase font-semibold text-emerald-500/90">
                                {item.tag} • Impact: {item.impact}
                              </span>
                              <button
                                onClick={() => handleDiscussSwotWithAi(item.title)}
                                className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Explore Leverage</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* QUADRANT 2: WEAKNESSES */}
              {(swotQuadrant === 'all' || swotQuadrant === 'weaknesses') && (
                <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isLight ? 'bg-rose-50/40 border-rose-200/80' : 'bg-rose-950/20 border-rose-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-500/20">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-rose-500/20">
                          W
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                            <AlertTriangle className="w-4 h-4" />
                            Internal Weaknesses
                          </h3>
                          <p className="text-[11px] text-slate-400">Financial vulnerabilities & resource gaps</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {swotData.weaknesses.length} Factors
                      </span>
                    </div>

                    <div className="space-y-3">
                      {swotData.weaknesses.length === 0 ? (
                        <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                          isLight ? 'bg-white/60 border-rose-200 text-slate-500' : 'bg-slate-900/60 border-rose-500/20 text-slate-400'
                        }`}>
                          No internal weaknesses recorded yet.
                        </div>
                      ) : (
                        swotData.weaknesses.map(item => (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                              isLight ? 'bg-white/90 border-rose-100 shadow-xs' : 'bg-slate-900/90 border-rose-500/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold flex items-center gap-1.5 text-slate-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                <span>{item.title}</span>
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 shrink-0">
                                {item.metric}
                              </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] uppercase font-semibold text-rose-400/90">
                                {item.tag} • Severity: {item.impact}
                              </span>
                              <button
                                onClick={() => handleDiscussSwotWithAi(item.title)}
                                className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Plan Fix with AI</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* QUADRANT 3: OPPORTUNITIES */}
              {(swotQuadrant === 'all' || swotQuadrant === 'opportunities') && (
                <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isLight ? 'bg-blue-50/40 border-blue-200/80' : 'bg-blue-950/20 border-blue-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-blue-500/20">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                          O
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                            <TrendingUp className="w-4 h-4" />
                            Strategic Opportunities
                          </h3>
                          <p className="text-[11px] text-slate-400">External upside & high-ROI compounding</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {swotData.opportunities.length} Factors
                      </span>
                    </div>

                    <div className="space-y-3">
                      {swotData.opportunities.length === 0 ? (
                        <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                          isLight ? 'bg-white/60 border-blue-200 text-slate-500' : 'bg-slate-900/60 border-blue-500/20 text-slate-400'
                        }`}>
                          No strategic opportunities calculated without income data.
                        </div>
                      ) : (
                        swotData.opportunities.map(item => (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                              isLight ? 'bg-white/90 border-blue-100 shadow-xs' : 'bg-slate-900/90 border-blue-500/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold flex items-center gap-1.5 text-slate-200">
                                <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                <span>{item.title}</span>
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 shrink-0">
                                {item.metric}
                              </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] uppercase font-semibold text-blue-400/90">
                                {item.tag} • Potential: {item.impact}
                              </span>
                              <button
                                onClick={() => handleDiscussSwotWithAi(item.title)}
                                className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Unlock with AI</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* QUADRANT 4: THREATS */}
              {(swotQuadrant === 'all' || swotQuadrant === 'threats') && (
                <div className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isLight ? 'bg-amber-50/40 border-amber-200/80' : 'bg-amber-950/20 border-amber-500/30'
                }`}>
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-500/20">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
                          T
                        </div>
                        <div>
                          <h3 className="text-sm font-extrabold text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                            <ShieldAlert className="w-4 h-4" />
                            Macro Threats & Shocks
                          </h3>
                          <p className="text-[11px] text-slate-400">External disruptions & systemic risks</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {swotData.threats.length} Factors
                      </span>
                    </div>

                    <div className="space-y-3">
                      {swotData.threats.length === 0 ? (
                        <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                          isLight ? 'bg-white/60 border-amber-200 text-slate-500' : 'bg-slate-900/60 border-amber-500/20 text-slate-400'
                        }`}>
                          No macro threat exposures calculated without financial data.
                        </div>
                      ) : (
                        swotData.threats.map(item => (
                          <div
                            key={item.id}
                            className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition-all ${
                              isLight ? 'bg-white/90 border-amber-100 shadow-xs' : 'bg-slate-900/90 border-amber-500/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold flex items-center gap-1.5 text-slate-200">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span>{item.title}</span>
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 shrink-0">
                                {item.metric}
                              </span>
                            </div>
                            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] uppercase font-semibold text-amber-400/90">
                                {item.tag} • Exposure: {item.impact}
                              </span>
                              <button
                                onClick={() => handleDiscussSwotWithAi(item.title)}
                                className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Hedge Risk</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Executive Takeaway & Strategic Synthesis Banner */}
            <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isLight ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950' : 'bg-gradient-to-r from-indigo-950/40 via-blue-950/40 to-slate-900 border-indigo-500/30 text-indigo-100'
            }`}>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Executive Strategic Synthesis
                </span>
                <p className="text-xs leading-relaxed font-medium">
                  {swotData.weaknesses[0] ? (
                    <>
                      Mitigate your primary vulnerability (<span className="font-bold underline decoration-rose-400">{swotData.weaknesses[0].title}</span>) by channeling your top strength (<span className="font-bold underline decoration-emerald-400">{swotData.strengths[0]?.title || 'positive cash flow'}</span>) into actionable compounding.
                    </>
                  ) : swotData.totalFactors > 0 ? (
                    <>
                      Capitalize on your financial strengths to capture high-ROI wealth opportunities and maintain full protection against macroeconomic threats.
                    </>
                  ) : (
                    <>
                      SWOT Analysis is currently empty. Financial profile has been reset or cleared. Enter your income, expenses, and protection policies to generate your personalized strategic synthesis.
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={() => swotData.totalFactors > 0 ? handleDiscussSwotWithAi() : setActiveTab('profile')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <span>{swotData.totalFactors > 0 ? 'Run 30-Day Execution Plan' : 'Enter Financial Data'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECTION 1.6: FINSCORE PERSONAL BALANCE SHEET & SOLVENCY STATEMENT */}
          {/* Derived directly from FinScore Data (Emergency, Goals, Loans, Protection) */}
          {/* ------------------------------------------------------------- */}
          <div id="finscore-balance-sheet-section" className={`p-6 sm:p-8 rounded-3xl border shadow-lg space-y-6 ${
            isLight ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
          }`}>
            {/* Header with Title & Quick Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl flex items-center justify-center shadow-md ${
                  isLight ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                }`}>
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold tracking-tight">
                      FinScore™ Personal Balance Sheet & Solvency
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Live FinScore™ Data
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      finScoreBalanceSheet.isSolvent
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {finScoreBalanceSheet.isSolvent ? 'Solvent Position' : 'Deficit Position'}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Real-time audited statement synthesized directly from your FinScore™ liquid emergency reserves, goal funds, and loan liabilities
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveTab('goals')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Earmark Goals</span>
                </button>
              </div>
            </div>

            {/* Empty State Warning if no data added */}
            {finScoreBalanceSheet.isEmpty && (
              <div className={`p-4 rounded-2xl border text-center space-y-2 ${
                isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              }`}>
                <p className="text-xs font-medium">
                  <strong>Notice:</strong> Your FinScore™ balance sheet is currently at zero baseline. Add emergency fund savings, goals, or loans across the steps above to populate your audited statement.
                </p>
              </div>
            )}

            {/* 3 Core KPI Cards: Assets = Liabilities + Net Worth */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Total Assets */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isLight ? 'bg-emerald-50/40 border-emerald-200 shadow-xs' : 'bg-emerald-950/20 border-emerald-500/30'
              }`}>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      1. Total Tangible Assets
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                </div>
                <div className={`text-2xl font-extrabold font-mono tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {currSym}{(finScoreBalanceSheet.totalTangibleAssets ?? 0).toLocaleString()}
                </div>
                <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t ${
                  isLight ? 'border-emerald-100 text-slate-500' : 'border-emerald-500/20 text-slate-400'
                }`}>
                  <span>Liquid Emergency Cash:</span>
                  <span className={`font-mono font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    {currSym}{(finScoreBalanceSheet.liquidEmergency ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 2. Total Liabilities */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isLight ? 'bg-rose-50/40 border-rose-200 shadow-xs' : 'bg-rose-950/20 border-rose-500/30'
              }`}>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      2. Total Liabilities
                    </span>
                  </div>
                  <ArrowDownLeft className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-extrabold font-mono tracking-tight text-rose-500">
                  {currSym}{(finScoreBalanceSheet.totalDebt ?? 0).toLocaleString()}
                </div>
                <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t ${
                  isLight ? 'border-rose-100 text-slate-500' : 'border-rose-500/20 text-slate-400'
                }`}>
                  <span>Monthly Debt Outlay:</span>
                  <span className="font-mono font-semibold text-rose-500">
                    {currSym}{(finScoreBalanceSheet.totalMonthlyEmi ?? 0).toLocaleString()}/mo
                  </span>
                </div>
              </div>

              {/* 3. Equity / Net Worth */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isLight ? 'bg-blue-50/40 border-blue-200 shadow-xs' : 'bg-blue-950/20 border-blue-500/30'
              }`}>
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      3. Net Equity (Net Worth)
                    </span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                </div>
                <div className={`text-2xl font-extrabold font-mono tracking-tight ${
                  finScoreBalanceSheet.netWorth >= 0 
                    ? isLight ? 'text-blue-700' : 'text-blue-400'
                    : 'text-rose-500'
                }`}>
                  {currSym}{(finScoreBalanceSheet.netWorth ?? 0).toLocaleString()}
                </div>
                <div className={`mt-2 flex items-center justify-between text-xs pt-2 border-t ${
                  isLight ? 'border-blue-100 text-slate-500' : 'border-blue-500/20 text-slate-400'
                }`}>
                  <span>Debt-to-Asset Load:</span>
                  <span className={`font-mono font-semibold ${
                    finScoreBalanceSheet.debtToAssetRatio > 50 ? 'text-rose-500' : 'text-emerald-500'
                  }`}>
                    {finScoreBalanceSheet.debtToAssetRatio}%
                  </span>
                </div>
              </div>
            </div>

            {/* Accounting Equation Proportional Progress Bar */}
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                    Accounting Equation: Assets ({currSym}{(finScoreBalanceSheet.totalTangibleAssets ?? 0).toLocaleString()}) = Liabilities ({currSym}{(finScoreBalanceSheet.totalDebt ?? 0).toLocaleString()}) + Net Equity ({currSym}{(finScoreBalanceSheet.netWorth ?? 0).toLocaleString()})
                  </h3>
                  <p className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Visual capital structure of assets versus loan leverage recorded in FinScore™
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Equity: {finScoreBalanceSheet.totalTangibleAssets > 0 ? Math.max(0, Math.min(100, Math.round((finScoreBalanceSheet.netWorth / finScoreBalanceSheet.totalTangibleAssets) * 100))) : 0}%
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Debt: {finScoreBalanceSheet.debtToAssetRatio}%
                  </span>
                </div>
              </div>

              {/* Dual-tone Progress Track */}
              <div className="w-full h-3.5 rounded-full overflow-hidden flex bg-slate-200/80 dark:bg-slate-800">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ 
                    width: `${finScoreBalanceSheet.totalTangibleAssets > 0 ? Math.max(0, Math.min(100, Math.round((finScoreBalanceSheet.netWorth / finScoreBalanceSheet.totalTangibleAssets) * 100))) : 0}%` 
                  }}
                  title="Equity Share"
                />
                <div 
                  className="bg-rose-500 h-full transition-all duration-500" 
                  style={{ 
                    width: `${finScoreBalanceSheet.totalTangibleAssets > 0 ? Math.min(100, Math.round((finScoreBalanceSheet.totalDebt / finScoreBalanceSheet.totalTangibleAssets) * 100)) : (finScoreBalanceSheet.totalDebt > 0 ? 100 : 0)}%` 
                  }}
                  title="Liabilities Share"
                />
              </div>
            </div>

            {/* Two-Column Formal Statement Ledger: Assets vs Liabilities & Protection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN: ASSETS LEDGER */}
              <div className={`p-5 rounded-2xl border space-y-4 ${
                isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-500" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      Assets Portfolio (What You Own)
                    </h3>
                  </div>
                  <span className="font-mono font-bold text-xs text-emerald-500">
                    {currSym}{(finScoreBalanceSheet.totalTangibleAssets ?? 0).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Liquid Emergency Savings Line Item */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                    isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Liquid Emergency Reserve Fund</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Immediate bank liquidity • {result.metrics.emergencyMonthsAvailable.toFixed(1)} months living coverage
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-emerald-500">
                        {currSym}{(finScoreBalanceSheet.liquidEmergency ?? 0).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Target: {currSym}{(result.metrics.requiredEmergencyFund ?? 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Goal Funds Saved Line Items */}
                  {finScoreBalanceSheet.goalAssets.map(item => {
                    const pctOfAssets = finScoreBalanceSheet.totalTangibleAssets > 0 
                      ? Math.round((item.value / finScoreBalanceSheet.totalTangibleAssets) * 100) 
                      : 0;
                    const goalCompletion = item.target > 0 ? Math.round((item.value / item.target) * 100) : 0;
                    return (
                      <div 
                        key={item.id} 
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                            <Target className="w-3.5 h-3.5 text-blue-400" />
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {item.category} • {pctOfAssets}% of assets • {goalCompletion}% of target
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm text-blue-500">
                            {currSym}{(item.value ?? 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Goal Target: {currSym}{(item.target ?? 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {finScoreBalanceSheet.totalTangibleAssets === 0 && (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No tangible assets or goal savings recorded in FinScore™.
                    </div>
                  )}
                </div>

                {/* Subtotal of Tangible Assets */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold text-xs">
                  <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>TOTAL TANGIBLE ASSETS</span>
                  <span className="font-mono text-emerald-500 text-sm">
                    {currSym}{(finScoreBalanceSheet.totalTangibleAssets ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: LIABILITIES & EQUITY LEDGER */}
              <div className="space-y-6">
                {/* Liabilities Block */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/40 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-rose-500" />
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                        Liabilities (What You Owe)
                      </h3>
                    </div>
                    <span className="font-mono font-bold text-xs text-rose-500">
                      {currSym}{(finScoreBalanceSheet.totalDebt ?? 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {finScoreBalanceSheet.loanLiabilities.map(loan => (
                      <div 
                        key={loan.id} 
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>{loan.type}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Interest Rate: {loan.interestRate}% p.a. • EMI: {currSym}{(loan.monthlyEmi ?? 0).toLocaleString()}/mo
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-sm text-rose-500">
                            {currSym}{(loan.outstanding ?? 0).toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Outstanding Balance
                          </div>
                        </div>
                      </div>
                    ))}

                    {finScoreBalanceSheet.loanLiabilities.length === 0 && (
                      <div className={`p-4 rounded-xl border border-dashed text-center text-xs ${
                        isLight ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                      }`}>
                        🎉 Zero debt recorded! 100% of your assets represent unencumbered net equity.
                      </div>
                    )}
                  </div>

                  {/* Subtotal of Liabilities */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold text-xs">
                    <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>TOTAL LIABILITIES</span>
                    <span className="font-mono text-rose-500 text-sm">
                      {currSym}{(finScoreBalanceSheet.totalDebt ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Net Worth & Solvency Diagnostic Summary Box */}
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/30 border-blue-500/30'
                }`}>
                  <div>
                    <div className="text-xs font-bold text-blue-500 uppercase tracking-wide">
                      Net Equity (Net Worth) Position
                    </div>
                    <div className={`text-xl font-mono font-extrabold ${
                      finScoreBalanceSheet.netWorth >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-500'
                    }`}>
                      {currSym}{(finScoreBalanceSheet.netWorth ?? 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Liquidity Runway: <span className="font-bold text-slate-700 dark:text-slate-200">{finScoreBalanceSheet.liquidityRatio} months</span> of fixed living outlays
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                      finScoreBalanceSheet.isSolvent
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {finScoreBalanceSheet.isSolvent ? 'Solvent Balance Sheet' : 'Leverage Alert'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contingent Off-Balance-Sheet Asset: Insurance Protection Shield */}
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-2 ${
              isLight ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-950/20 border-indigo-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Contingent Protection Capital (Insurance Coverage in Place)
                  </span>
                </div>
                <span className="font-mono font-bold text-xs text-indigo-400">
                  {currSym}{(finScoreBalanceSheet.totalProtectionCoverage ?? 0).toLocaleString()} Total Cover
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Actuarial risk shield safeguarding your balance sheet against catastrophic medical shocks or loss of earning capacity. Term life coverage: <strong>{currSym}{(finScoreBalanceSheet.termCover ?? 0).toLocaleString()}</strong> • Health coverage: <strong>{currSym}{(finScoreBalanceSheet.healthCover ?? 0).toLocaleString()}</strong>.
              </p>
            </div>

            {/* Quadrant Visualizer: Income Statement & Balance Sheet Quadrant Box Diagram (Compact) */}
            <div className="pt-2">
              <FinancialStatementChart
                id="finscore-financial-statement-quadrant-chart"
                compact={true}
                income={result.metrics.monthlyIncome}
                expenses={result.metrics.totalExpenses}
                assets={finScoreBalanceSheet.totalTangibleAssets}
                liabilities={finScoreBalanceSheet.totalDebt}
                title="FinScore™ Cashflow & Balance Sheet Visual Quadrants"
                subtitle="Visual proportional heights for income flow vs living expenses, and liquid/earmarked assets vs total liabilities"
              />
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: USER PROFILE / REGISTRATION (Step 1) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Step 1 — User Financial Profile</h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Basic information used to benchmark income adequacy, dependents multiplier, and insurance needs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-profile-step-reset"
                onClick={() => {
                  setProfile(EMPTY_FINSCORE_PROFILE);
                  showToast('Profile information cleared.');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isLight ? 'bg-slate-100 hover:bg-rose-50 text-rose-700 border-slate-300 hover:border-rose-300' : 'bg-slate-800 hover:bg-rose-950/40 text-rose-300 border-slate-700 hover:border-rose-500/50'
                }`}
              >
                <RotateCcw className="w-3 h-3 text-rose-400" />
                <span>Clear Profile</span>
              </button>
              <button
                type="button"
                id="btn-profile-step-add-data"
                onClick={handleOpenAddProfileModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-all"
              >
                <UserPlus className="w-3 h-3" />
                <span>Quick Fill Presets</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-semibold">
            <div>
              <label className="block mb-1 text-slate-400">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-400">Age</label>
              <input
                type="number"
                value={profile.age}
                onChange={e => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <FinScoreAmountInput
                id="profile-monthly-income"
                label={`Monthly Net Income / Salary (${currSym})`}
                value={profile.monthlyIncome}
                onChange={val => setProfile({ ...profile, monthlyIncome: val })}
                currSym={currSym}
                isLight={isLight}
                placeholder="50000"
                presets={[25000, 50000, 75000, 100000, 150000]}
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-400">Occupation / Employment</label>
              <input
                type="text"
                value={profile.occupation}
                onChange={e => setProfile({ ...profile, occupation: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-400">Financial Dependents (Spouse, Children, Parents)</label>
              <input
                type="number"
                min={0}
                value={profile.dependents}
                onChange={e => setProfile({ ...profile, dependents: parseInt(e.target.value) || 0 })}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 text-slate-400">Primary Currency</label>
              <select
                value={profile.currency}
                onChange={e => setProfile({ ...profile, currency: e.target.value as any })}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setActiveTab('income_expenses')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <span>Next: Income & Expenses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 3: INCOME & EXPENSE ANALYSIS (Step 2) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'income_expenses' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Step 2 — Income & Expense Analysis</h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Detailed monthly cash flow breakdown to calculate your Savings Ratio: <strong>Savings = Income − Expenses</strong>.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Savings Ratio: {result.metrics.savingsRatio}%
              </span>
            </div>
          </div>

          {/* Cash Flow Summary Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Income</span>
              <div className="text-xl font-extrabold font-mono mt-1 text-blue-400">
                {currSym}{(profile.monthlyIncome ?? 0).toLocaleString()}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Expenses</span>
              <div className="text-xl font-extrabold font-mono mt-1 text-rose-400">
                {currSym}{(result.metrics.totalExpenses ?? 0).toLocaleString()}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Surplus / Savings</span>
              <div className="text-xl font-extrabold font-mono mt-1 text-emerald-400">
                {currSym}{(result.metrics.monthlySavings ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Expense Category Inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Monthly Category Expense Breakdown
              </h4>
              <span className="text-[11px] text-slate-500">
                Type amount to see formatted word value below
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {expenses.map((exp, idx) => (
                <div
                  key={exp.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-xs">{exp.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      exp.isEssential ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {exp.isEssential ? 'Essential Need' : 'Discretionary'}
                    </span>
                  </div>
                  <FinScoreAmountInput
                    id={`expense-${exp.id}`}
                    value={exp.amount}
                    onChange={val => {
                      setExpenses(prev => prev.map((item, i) => i === idx ? { ...item, amount: val } : item));
                    }}
                    currSym={currSym}
                    isLight={isLight}
                    placeholder="0"
                    compact
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Back to Profile
            </button>
            <button
              onClick={() => setActiveTab('debt')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <span>Next: Loan & Debt Score</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 4: LOAN / DEBT SCORE (Step 3) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'debt' && (() => {
        const totalOutstanding = loans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
        const totalMonthlyEmi = loans.reduce((sum, l) => sum + (l.monthlyEmi || 0), 0);

        // Calculate timeline details across all loans
        const loanClosures = loans.map(l => ({
          ...l,
          closure: getLoanClosureInfo(l.remainingTenureMonths)
        })).sort((a, b) => a.remainingTenureMonths - b.remainingTenureMonths);

        const earliestClosure = loanClosures[0];
        const latestClosure = loanClosures[loanClosures.length - 1];

        // Preview closure for new loan form
        const newTenureMonths = parseInt(newLoanTenure) || 36;
        const newLoanClosurePreview = getLoanClosureInfo(newTenureMonths);

        return (
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">Step 3 — 💳 Loan & Debt Score ({result.scores.debt}/100)</h2>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Evaluates loan tenures, expected closure dates, monthly EMI drain, and interest exposure.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                  result.metrics.emiToIncomeRatio > 40
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  EMI to Income: {result.metrics.emiToIncomeRatio}%
                </span>
              </div>
            </div>

            {/* Debt Overview & Payoff Timeline KPI Banner */}
            {loans.length > 0 && (
              <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                isLight ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 'bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border-blue-500/30'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">
                      Debt Payoff & Cash Flow Liberation Timeline
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold mt-0.5">
                      Total Debt: {currSym}{totalOutstanding.toLocaleString()} • Monthly EMI: {currSym}{totalMonthlyEmi.toLocaleString()}/mo
                    </h3>
                  </div>

                  {earliestClosure && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-blue-200 dark:border-blue-500/30 shadow-xs">
                        <span className="text-[10px] text-slate-500 block">Earliest Loan Payoff:</span>
                        <span className="font-bold text-emerald-500">{earliestClosure.closure.closureDate}</span>
                        <span className="text-[10px] text-slate-400 ml-1">(+{currSym}{earliestClosure.monthlyEmi.toLocaleString()}/mo freed)</span>
                      </div>

                      {latestClosure && (
                        <div className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-blue-200 dark:border-blue-500/30 shadow-xs">
                          <span className="text-[10px] text-slate-500 block">100% Debt-Free Horizon:</span>
                          <span className="font-bold text-blue-500">{latestClosure.closure.closureDate}</span>
                          <span className="text-[10px] text-slate-400 ml-1">({latestClosure.remainingTenureMonths} mo)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-blue-200/60 dark:border-blue-500/20 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <span className="text-amber-500 text-sm">💡</span>
                  <span>
                    <strong>Tenure Cash Flow Link:</strong> Once your loans reach closure, their monthly EMIs unlock and can directly boost your <strong>Investments & Assets (Step 6)</strong> before funding your <strong>Future Goals (Step 7)</strong>.
                  </span>
                </div>
              </div>
            )}

            {/* Active Loans Table with Tenure & Closure Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Existing Loans & Credit Commitments ({loans.length})
                </h4>
                <span className="text-[11px] text-slate-500">
                  Calculated payoff date based on remaining tenure
                </span>
              </div>

              {loans.length === 0 ? (
                <div className="p-6 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  🎉 Congratulations! You currently have zero outstanding loan commitments. Your Debt Score is 100/100.
                </div>
              ) : (
                <div className="space-y-3">
                  {loanClosures.map(loan => (
                    <div key={loan.id} className={`p-4 rounded-2xl border transition-all ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{loan.type}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                              Tenure: {loan.remainingTenureMonths} Months ({loan.closure.yearsLeft} yrs)
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>Outstanding: <strong className="text-slate-800 dark:text-slate-200 font-mono">{currSym}{(loan.outstandingAmount ?? 0).toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>Interest Rate: <strong className="font-mono">{loan.interestRate}%</strong></span>
                            <span>•</span>
                            <span className="text-emerald-500 font-semibold flex items-center gap-1">
                              <span>📅 Closes / Debt-Free:</span>
                              <strong className="underline underline-offset-2">{loan.closure.closureDate}</strong>
                              <span>({loan.closure.monthsLeft} mo left)</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
                          {/* Tenure adjustment pill buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateLoanTenure(loan.id, -6)}
                              title="Prepay / Reduce tenure by 6 months"
                              className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                              -6 mo
                            </button>
                            <button
                              onClick={() => handleUpdateLoanTenure(loan.id, 6)}
                              title="Extend tenure by 6 months"
                              className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                              +6 mo
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-mono font-bold text-rose-500">
                              {currSym}{(loan.monthlyEmi ?? 0).toLocaleString()}/mo
                            </div>
                            <div className="text-[10px] text-slate-400">Monthly EMI</div>
                          </div>

                          <button
                            onClick={() => handleDeleteLoan(loan.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            title="Delete this loan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Cash Flow Liberation Note on Tenure Close */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          🎉 When this tenure closes in <strong>{loan.closure.closureDate}</strong>:
                        </span>
                        <span className="font-mono font-bold text-emerald-500">
                          +{currSym}{(loan.monthlyEmi ?? 0).toLocaleString()}/month unlocked for Investments
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Loan Form with Configurable Tenure & Expected Closure Date */}
            <form onSubmit={handleAddLoan} className={`p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider">Add Existing Loan with Tenure</h5>
                <span className="text-[11px] text-blue-500 font-medium">
                  Closure Date dynamically calculated from tenure
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Loan Type</label>
                  <select
                    value={newLoanType}
                    onChange={e => setNewLoanType(e.target.value)}
                    className={`w-full px-2.5 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                  >
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Home Loan">Home Loan</option>
                    <option value="Auto Loan">Auto Loan</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Education Loan">Education Loan</option>
                    <option value="Consumer Loan">Consumer Loan</option>
                  </select>
                </div>

                <div>
                  <FinScoreAmountInput
                    id="debt-outstanding-input"
                    label={`Outstanding (${currSym})`}
                    value={newLoanOutstanding ? parseFloat(newLoanOutstanding) : 0}
                    onChange={val => setNewLoanOutstanding(val > 0 ? val.toString() : '')}
                    currSym={currSym}
                    isLight={isLight}
                    placeholder="200000"
                    compact
                  />
                </div>

                <div>
                  <FinScoreAmountInput
                    id="debt-emi-input"
                    label={`Monthly EMI (${currSym})`}
                    value={newLoanEmi ? parseFloat(newLoanEmi) : 0}
                    onChange={val => setNewLoanEmi(val > 0 ? val.toString() : '')}
                    currSym={currSym}
                    isLight={isLight}
                    placeholder="6500"
                    compact
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLoanRate}
                    onChange={e => setNewLoanRate(e.target.value)}
                    className={`w-full px-2.5 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Tenure (Months)</label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={newLoanTenure}
                    onChange={e => setNewLoanTenure(e.target.value)}
                    className={`w-full px-2.5 py-2 rounded-xl border font-mono ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                  />
                </div>
              </div>

              {/* Quick Tenure Presets & Calculated Closure Date Preview */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-slate-400 text-[11px]">Quick Tenure:</span>
                  {[
                    { label: '12m (1y)', val: '12' },
                    { label: '24m (2y)', val: '24' },
                    { label: '36m (3y)', val: '36' },
                    { label: '60m (5y)', val: '60' },
                    { label: '120m (10y)', val: '120' },
                    { label: '240m (20y)', val: '240' },
                  ].map(preset => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setNewLoanTenure(preset.val)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                        newLoanTenure === preset.val
                          ? 'bg-blue-600 text-white border-blue-500'
                          : isLight ? 'bg-white text-slate-600 border-slate-300' : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Expected Closure: <strong>{newLoanClosurePreview.closureDate}</strong> ({newTenureMonths} mo)
                  </span>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Loan</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Core Recommendations based on User's Debt Profile */}
            <div className={`p-4 rounded-2xl border ${
              isLight ? 'bg-purple-50/70 border-purple-200 text-purple-950' : 'bg-purple-500/10 border-purple-500/20 text-purple-100'
            }`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                Actionable Debt Management Recommendations
              </h4>
              <ul className="text-xs space-y-1.5 list-disc list-inside">
                <li><strong>Track Tenure Closures:</strong> When a loan tenure ends, immediately re-route its EMI into recurring investment SIPs in Step 6.</li>
                <li><strong>Avoid unnecessary loans:</strong> Refrain from financing depreciating assets with high rates.</li>
                <li><strong>Prepay High-APR Debt:</strong> Trimming even 6 months off a loan tenure saves substantial cumulative interest.</li>
                <li><strong>Debt-Free Acceleration:</strong> Use the snowball or avalanche method to systematically retire tenures one by one.</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => setActiveTab('income_expenses')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Back to Income & Expenses
              </button>
              <button
                onClick={() => setActiveTab('insurance')}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>Next: Insurance Score</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 5: INSURANCE SCORE (Step 4) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'insurance' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Step 4 — 🛡️ Insurance Protection Score ({result.scores.insurance}/100)</h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Assesses Life (Term) and Health insurance adequacy relative to your annual income, liabilities, and dependents.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Recommended Life Cover: {currSym}{(result.metrics.recommendedLifeCoverage ?? 0).toLocaleString()}
            </span>
          </div>

          {/* Educational Disclaimer Banner */}
          <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
            isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-200'
          }`}>
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Educational Estimate:</strong> These calculations represent standard financial planning rules of thumb (10x-15x income + liabilities) for informational purposes, not regulated insurance or solicitation advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Life & Term Insurance Section */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Life & Term Insurance
                </h4>
                <span className="text-[10px] font-mono text-slate-400">
                  Dependents: {profile.dependents}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={insurance.hasTermInsurance}
                    onChange={e => setInsurance({ ...insurance, hasTermInsurance: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 accent-blue-500"
                  />
                  <span>I have an active pure Term Life Insurance policy</span>
                </label>

                <div>
                  <FinScoreAmountInput
                    id="insurance-life-coverage"
                    label={`Total Life Cover Sum Assured (${currSym})`}
                    value={insurance.lifeCoverage}
                    onChange={val => setInsurance({ ...insurance, lifeCoverage: val })}
                    currSym={currSym}
                    isLight={isLight}
                    placeholder="10000000"
                    presets={[2500000, 5000000, 10000000, 15000000]}
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/20 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended Cover:</span>
                    <span className="font-mono font-bold">{currSym}{(result.metrics.recommendedLifeCoverage ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Life Cover Gap:</span>
                    <span className={`font-mono font-bold ${result.metrics.lifeCoverageShortfall > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.metrics.lifeCoverageShortfall > 0 
                        ? `${currSym}${(result.metrics.lifeCoverageShortfall ?? 0).toLocaleString()} Shortfall`
                        : 'Fully Protected'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Insurance Section */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4" />
                  Health Insurance
                </h4>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={insurance.hasHealthInsurance}
                    onChange={e => setInsurance({ ...insurance, hasHealthInsurance: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-500"
                  />
                  <span>I have Health Insurance protection</span>
                </label>

                <div>
                  <FinScoreAmountInput
                    id="insurance-health-coverage"
                    label={`Health Sum Insured (${currSym})`}
                    value={insurance.healthCoverage}
                    onChange={val => setInsurance({ ...insurance, healthCoverage: val })}
                    currSym={currSym}
                    isLight={isLight}
                    placeholder="1000000"
                    presets={[500000, 1000000, 1500000, 2500000]}
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={insurance.hasPersonalHealthPolicy}
                      onChange={e => setInsurance({ ...insurance, hasPersonalHealthPolicy: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-emerald-500"
                    />
                    <span>Independent personal/family policy (Not just employer group cover)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={insurance.hasEmployerInsurance}
                      onChange={e => setInsurance({ ...insurance, hasEmployerInsurance: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-emerald-500"
                    />
                    <span>Corporate / Employer Group Health cover active</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between">
            <button
              onClick={() => setActiveTab('debt')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Back to Debt Score
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <span>Next: Emergency Fund Score</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 6: EMERGENCY FUND SCORE (Step 5) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'emergency' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Step 5 — 🚨 Emergency Fund Score ({result.scores.emergencyFund}/100)</h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Calculates essential monthly runway required to safeguard you against job loss or urgent medical distress.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              Essential Outflow: {currSym}{(result.metrics.essentialExpenses ?? 0).toLocaleString()}/mo
            </span>
          </div>

          {/* Configurable Target Months Selector */}
          <div className={`p-5 rounded-2xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider">Configure Emergency Buffer Target</span>
              <span className="text-xs font-bold text-blue-400">{emergency.targetMonths} Months of Expenses</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {[3, 6, 9, 12].map(m => (
                <button
                  key={m}
                  onClick={() => setEmergency({ ...emergency, targetMonths: m })}
                  className={`py-2 rounded-xl font-bold border transition-all ${
                    emergency.targetMonths === m
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                      : isLight ? 'bg-white text-slate-700 border-slate-300' : 'bg-slate-900 text-slate-400 border-slate-700'
                  }`}
                >
                  {m} Months
                </button>
              ))}
            </div>
          </div>

          {/* Emergency Fund Math Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4 text-xs font-semibold">
              <div>
                <FinScoreAmountInput
                  id="emergency-current-savings"
                  label={`Current Liquid Emergency Savings (${currSym})`}
                  value={emergency.currentEmergencySavings}
                  onChange={val => setEmergency({ ...emergency, currentEmergencySavings: val })}
                  currSym={currSym}
                  isLight={isLight}
                  placeholder="200000"
                  presets={[50000, 100000, 200000, 500000, 1000000]}
                  hint="Liquid savings held in savings account, auto-sweep FD or liquid mutual funds"
                />
              </div>

              <div className="p-4 rounded-xl bg-black/20 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Essential Expenses:</span>
                  <span className="font-mono">{currSym}{(result.metrics.essentialExpenses ?? 0).toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Required Buffer ({emergency.targetMonths} mo):</span>
                  <span className="font-mono font-bold text-amber-400">{currSym}{(result.metrics.requiredEmergencyFund ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Funding Shortfall:</span>
                  <span className="font-mono font-bold text-rose-400">{currSym}{(result.metrics.emergencyShortfall ?? 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Visual ASCII / UI Bar Progress */}
            <div className={`p-6 rounded-2xl border text-center space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Emergency Readiness Progress
              </span>
              <div className="text-2xl font-extrabold font-mono">
                {currSym}{(emergency.currentEmergencySavings ?? 0).toLocaleString()} / {currSym}{(result.metrics.requiredEmergencyFund ?? 0).toLocaleString()}
              </div>

              <div className="w-full bg-slate-800 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-3.5 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, result.metrics.emergencyFundRatio)}%` }}
                />
              </div>

              <div className="text-xs font-semibold text-slate-300">
                {result.metrics.emergencyShortfall > 0 ? (
                  <p className="text-amber-400">
                    ⚠️ You need approximately <strong>{currSym}{(result.metrics.emergencyShortfall ?? 0).toLocaleString()}</strong> more to reach your {emergency.targetMonths}-month target.
                  </p>
                ) : (
                  <p className="text-emerald-400 font-bold">
                    ✅ Your emergency reserve is fully funded for {emergency.targetMonths} months of essential needs!
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between">
            <button
              onClick={() => setActiveTab('insurance')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Back to Insurance
            </button>
            <button
              onClick={() => setActiveTab('investments_assets')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
            >
              <span>Next: Investments & Assets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 6: INVESTMENTS & ASSETS (Step 6 — Before Future Goals) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'investments_assets' && (() => {
        const totalInvestedCorpus = finScoreInvestments.reduce((sum, item) => sum + (item.currentValue || 0), 0);
        const totalMonthlyInvestment = finScoreInvestments.reduce((sum, item) => sum + (item.monthlyContribution || 0), 0);
        
        // Calculate weighted average return rate
        const weightedReturn = totalInvestedCorpus > 0
          ? finScoreInvestments.reduce((sum, item) => sum + (item.currentValue * (item.expectedReturnRate || 10)), 0) / totalInvestedCorpus
          : 11;

        // Compound interest projections (5 yr and 10 yr)
        const rMonthly = (weightedReturn / 100) / 12;
        const projectCorpus = (years: number) => {
          const months = years * 12;
          const principalGrowth = totalInvestedCorpus * Math.pow(1 + rMonthly, months);
          const sipGrowth = totalMonthlyInvestment * ((Math.pow(1 + rMonthly, months) - 1) / rMonthly);
          return Math.round(principalGrowth + (isNaN(sipGrowth) ? 0 : sipGrowth));
        };

        const corpus5Yr = projectCorpus(5);
        const corpus10Yr = projectCorpus(10);

        // Calculate freed-up cash flow from loan closures
        const totalEmiFromLoans = loans.reduce((sum, l) => sum + (l.monthlyEmi || 0), 0);
        const loansWithClosure = loans.map(l => ({
          ...l,
          closure: getLoanClosureInfo(l.remainingTenureMonths)
        })).sort((a, b) => a.remainingTenureMonths - b.remainingTenureMonths);

        // Group investments by category
        const categoryMap: Record<string, number> = {};
        finScoreInvestments.forEach(item => {
          categoryMap[item.category] = (categoryMap[item.category] || 0) + item.currentValue;
        });

        return (
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Step 6 — 📈 Investments & Assets Portfolio</h2>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/30">
                    Wealth Foundation
                  </span>
                </div>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Review and build your investment corpus before mapping your milestones. See how freed EMIs from loan closures accelerate your portfolio.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Clear This Page Only Button */}
                {finScoreInvestments.length > 0 ? (
                  <button
                    id="btn-clear-investments-page"
                    type="button"
                    onClick={handleClearInvestmentsPage}
                    title="Clear all investment and asset holdings for this page only"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear This Page</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLoadSampleInvestments}
                    title="Restore sample benchmark investment portfolio"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-blue-500/30 text-blue-500 hover:bg-blue-500/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Load Sample Portfolio</span>
                  </button>
                )}

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                  Monthly SIP Run-Rate: {currSym}{totalMonthlyInvestment.toLocaleString()}/mo
                </span>
              </div>
            </div>

            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Invested Corpus</span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-500 mt-1">
                  {currSym}{totalInvestedCorpus.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">{finScoreInvestments.length} Active Holdings</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Monthly Inflow / SIP</span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-blue-500 mt-1">
                  {currSym}{totalMonthlyInvestment.toLocaleString()}/mo
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">{currSym}{(totalMonthlyInvestment * 12).toLocaleString()}/year added</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Weighted Return</span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-purple-500 mt-1">
                  {weightedReturn.toFixed(1)}% CAGR
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Portfolio compounding rate</span>
              </div>

              <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">5-Year Projected Corpus</span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-500 mt-1">
                  {currSym}{corpus5Yr.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">10-Yr: {currSym}{corpus10Yr.toLocaleString()}</span>
              </div>
            </div>

            {/* DEBT-TO-WEALTH ACCELERATION BRIDGE CARD */}
            {loans.length > 0 && (
              <div className={`p-5 rounded-2xl border space-y-3 ${
                isLight ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-emerald-200 text-slate-900' : 'bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-blue-950/40 border-emerald-500/30 text-white'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Debt Tenure Closure Acceleration Bridge
                  </h4>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  As your active loan tenures close according to schedule, their monthly EMIs unlock. Channeling this liberated cash flow directly into your investments gives you immense leverage to fund upcoming life goals without increasing earned income:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {loansWithClosure.map(l => (
                    <div key={l.id} className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-500/20 text-xs shadow-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span>{l.type}</span>
                        <span className="text-emerald-500 font-mono">+{currSym}{l.monthlyEmi.toLocaleString()}/mo</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Closes: <strong className="text-slate-700 dark:text-slate-200">{l.closure.closureDate}</strong> ({l.closure.monthsLeft} mo left)
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
                        Redirect into SIPs upon closure to supercharge future milestones!
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Asset Allocation Breakdown */}
            <div className={`p-5 rounded-2xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Asset Class Distribution</span>
                <span className="text-xs font-mono font-bold text-slate-400">{Object.keys(categoryMap).length} Categories</span>
              </div>

              {/* Visual Distribution Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                {Object.entries(categoryMap).map(([category, val], idx) => {
                  const pct = totalInvestedCorpus > 0 ? (val / totalInvestedCorpus) * 100 : 0;
                  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500'];
                  return (
                    <div
                      key={category}
                      style={{ width: `${pct}%` }}
                      className={`${colors[idx % colors.length]} h-full transition-all`}
                      title={`${category}: ${pct.toFixed(1)}%`}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 pt-1 text-xs">
                {Object.entries(categoryMap).map(([category, val], idx) => {
                  const pct = totalInvestedCorpus > 0 ? (val / totalInvestedCorpus) * 100 : 0;
                  const dotColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500'];
                  return (
                    <div key={category} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`} />
                      <span className="text-slate-600 dark:text-slate-400">{category}:</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-200">{currSym}{val.toLocaleString()} ({pct.toFixed(1)}%)</strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Investments List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Holdings & Portfolios ({finScoreInvestments.length})
                  </h4>
                  {finScoreInvestments.length === 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 font-semibold">
                      Cleared (0)
                    </span>
                  )}
                </div>

                {finScoreInvestments.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearInvestmentsPage}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Clear all investments on this page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Holdings</span>
                  </button>
                )}
              </div>

              {finScoreInvestments.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                  <div className="text-3xl">🌱</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Investments & assets have been cleared for this page.
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Your portfolio is currently reset to {currSym}0. Add your mutual funds, equity stocks, fixed deposits, gold, and retirement savings below, or load benchmark holdings.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleLoadSampleInvestments}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 hover:bg-blue-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Benchmark Portfolio</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {finScoreInvestments.map(item => (
                    <div key={item.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLight ? 'bg-slate-50 border-slate-200 hover:border-slate-300' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm">{item.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 font-bold border border-blue-500/20">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span>Expected CAGR: <strong className="text-purple-500">{item.expectedReturnRate}%</strong></span>
                          <span>•</span>
                          <span>Monthly Addition: <strong className="text-blue-500">{currSym}{item.monthlyContribution.toLocaleString()}/mo</strong></span>
                        </div>

                        {/* Mutual Fund NAV & Units Details */}
                        {item.nav && (
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold border border-emerald-500/20 flex items-center gap-1">
                              <span>NAV:</span>
                              <strong>{currSym}{item.nav.toFixed(2)}</strong>
                            </span>
                            {item.units && (
                              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold border border-indigo-500/20 flex items-center gap-1">
                                <span>Units:</span>
                                <strong>{item.units.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</strong>
                              </span>
                            )}
                            {item.purchaseNav && (
                              <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                                Buy NAV: {currSym}{item.purchaseNav.toFixed(2)} ({(((item.nav - item.purchaseNav) / item.purchaseNav) * 100) >= 0 ? '+' : ''}{(((item.nav - item.purchaseNav) / item.purchaseNav) * 100).toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-800">
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-emerald-500">
                            {currSym}{item.currentValue.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-400">Current Value</div>
                        </div>

                        <button
                          onClick={() => handleDeleteInvestment(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Remove investment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Investment Form */}
            <form onSubmit={handleAddInvestment} className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold uppercase tracking-wider">Add Investment / Asset Holding</h5>
                {newInvCategory === 'Mutual Funds & SIP' && (
                  <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                    <span>⚡ NAV & Units Tracking Active</span>
                  </span>
                )}
              </div>

              {/* Quick Mutual Fund Presets when Mutual Funds is selected */}
              {newInvCategory === 'Mutual Funds & SIP' && (
                <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Quick Sample Schemes (Click to auto-fill NAV):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Parag Parikh Flexi Cap Direct (G)', nav: 82.45, ret: 14.5, units: 1000 },
                      { name: 'Mirae Asset Large & Midcap Direct (G)', nav: 138.20, ret: 13.8, units: 800 },
                      { name: 'Quant Small Cap Fund Direct (G)', nav: 248.60, ret: 18.2, units: 500 },
                      { name: 'HDFC Top 100 Fund Direct (G)', nav: 1120.15, ret: 13.2, units: 100 },
                      { name: 'SBI Bluechip Fund Direct (G)', nav: 89.70, ret: 12.8, units: 1200 },
                      { name: 'Nippon India Small Cap Direct (G)', nav: 174.30, ret: 19.5, units: 600 },
                    ].map(mf => (
                      <button
                        key={mf.name}
                        type="button"
                        onClick={() => {
                          setNewInvName(mf.name);
                          setNewInvNav(mf.nav.toString());
                          setNewInvReturn(mf.ret.toString());
                          if (!newInvUnits) {
                            setNewInvUnits(mf.units.toString());
                            setNewInvValue((mf.nav * mf.units).toString());
                          } else {
                            const u = parseFloat(newInvUnits) || mf.units;
                            setNewInvValue((mf.nav * u).toString());
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-500 transition-all cursor-pointer shadow-2xs"
                      >
                        {mf.name.split(' Direct')[0]} • <span className="font-mono font-bold text-emerald-500">NAV: ₹{mf.nav}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Asset / Scheme Name</label>
                  <input
                    type="text"
                    required
                    placeholder={newInvCategory === 'Mutual Funds & SIP' ? 'e.g. Parag Parikh Flexi Cap' : 'e.g. Reliance Industries / Fixed Deposit'}
                    value={newInvName}
                    onChange={e => setNewInvName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Category</label>
                  <select
                    value={newInvCategory}
                    onChange={e => setNewInvCategory(e.target.value as any)}
                    className={`w-full px-2.5 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                  >
                    <option value="Mutual Funds & SIP">Mutual Funds & SIP</option>
                    <option value="Equity / Stocks">Equity / Stocks</option>
                    <option value="Fixed Deposit / Bonds">Fixed Deposit / Bonds</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Gold & Precious Metals">Gold & Precious Metals</option>
                    <option value="Retirement (PF/NPS)">Retirement (PF/NPS)</option>
                    <option value="Cash & Liquid">Cash & Liquid</option>
                  </select>
                </div>

                {/* If Mutual Fund: NAV and Units inputs with auto-sync */}
                {newInvCategory === 'Mutual Funds & SIP' ? (
                  <>
                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">
                        Current NAV ({currSym}) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="82.45"
                        value={newInvNav}
                        onChange={e => {
                          const val = e.target.value;
                          setNewInvNav(val);
                          const navNum = parseFloat(val);
                          const unitsNum = parseFloat(newInvUnits);
                          if (navNum > 0 && unitsNum > 0) {
                            setNewInvValue(Math.round(navNum * unitsNum).toString());
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-xl border font-mono font-bold text-emerald-600 dark:text-emerald-400 ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">
                        Units Held *
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        placeholder="1200.5"
                        value={newInvUnits}
                        onChange={e => {
                          const val = e.target.value;
                          setNewInvUnits(val);
                          const unitsNum = parseFloat(val);
                          const navNum = parseFloat(newInvNav);
                          if (unitsNum > 0 && navNum > 0) {
                            setNewInvValue(Math.round(unitsNum * navNum).toString());
                          }
                        }}
                        className={`w-full px-3 py-2 rounded-xl border font-mono font-bold ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                      />
                    </div>

                    <div>
                      <FinScoreAmountInput
                        id="inv-value-input"
                        label={`Current Value (${currSym})`}
                        value={newInvValue ? parseFloat(newInvValue) : 0}
                        onChange={val => {
                          setNewInvValue(val > 0 ? val.toString() : '');
                          const navNum = parseFloat(newInvNav);
                          if (val > 0 && navNum > 0) {
                            setNewInvUnits((val / navNum).toFixed(3));
                          }
                        }}
                        currSym={currSym}
                        isLight={isLight}
                        placeholder="100000"
                        compact
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <FinScoreAmountInput
                        id="inv-value-input"
                        label={`Current Value (${currSym})`}
                        value={newInvValue ? parseFloat(newInvValue) : 0}
                        onChange={val => setNewInvValue(val > 0 ? val.toString() : '')}
                        currSym={currSym}
                        isLight={isLight}
                        placeholder="100000"
                        compact
                      />
                    </div>

                    <div>
                      <FinScoreAmountInput
                        id="inv-monthly-input"
                        label={`Monthly SIP (${currSym})`}
                        value={newInvMonthly ? parseFloat(newInvMonthly) : 0}
                        onChange={val => setNewInvMonthly(val > 0 ? val.toString() : '')}
                        currSym={currSym}
                        isLight={isLight}
                        placeholder="5000"
                        compact
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">Expected CAGR (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newInvReturn}
                        onChange={e => setNewInvReturn(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl border font-mono ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Secondary row for Mutual Funds: Monthly SIP, CAGR, and Buy NAV */}
              {newInvCategory === 'Mutual Funds & SIP' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <div>
                    <FinScoreAmountInput
                      id="inv-mf-monthly-input"
                      label={`Monthly SIP Inflow (${currSym})`}
                      value={newInvMonthly ? parseFloat(newInvMonthly) : 0}
                      onChange={val => setNewInvMonthly(val > 0 ? val.toString() : '')}
                      currSym={currSym}
                      isLight={isLight}
                      placeholder="5000"
                      compact
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Expected Return / CAGR (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newInvReturn}
                      onChange={e => setNewInvReturn(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-mono ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Purchase / Buy NAV (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 64.10"
                      value={newInvPurchaseNav}
                      onChange={e => setNewInvPurchaseNav(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border font-mono ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Investment Holding</span>
                </button>
              </div>
            </form>

            {/* Bottom Nav */}
            <div className="pt-4 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => setActiveTab('emergency')}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Back to Emergency Fund
              </button>
              <button
                onClick={() => setActiveTab('goals')}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>Next: Future Goals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 7: FUTURE GOALS PLANNER (Step 7) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'goals' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Header Title with Quick Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold">Step 7 — 🎯 Future Goals Planner ({result.scores.futureGoals}/100)</h2>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30">
                  {goals.length} Active {goals.length === 1 ? 'Milestone' : 'Milestones'}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Define milestones (e.g. Car, Higher Education, House, Marriage, Travel). Backed by your current investments and freed EMIs from loan closures.
              </p>
            </div>

            {/* Quick Hero Badge */}
            <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 shrink-0 ${
              isLight ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/40 border-emerald-500/30'
            }`}>
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Monthly Add</span>
                <span className="font-mono font-black text-sm text-emerald-500 dark:text-emerald-400 block">
                  {currSym}{(totalRequiredMonthlySip ?? 0).toLocaleString()}/mo
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TOTAL REQUIRED MONTHLY ADD (SIP) HERO METRIC CARD & BREAKDOWN */}
          {/* ============================================================== */}
          <div className={`p-5 sm:p-6 rounded-2xl border ${
            isLight
              ? 'bg-gradient-to-br from-emerald-50/80 via-blue-50/40 to-slate-50 border-emerald-200'
              : 'bg-gradient-to-br from-emerald-950/30 via-slate-900 to-blue-950/20 border-emerald-500/30'
          } shadow-sm space-y-5`}>
            
            {/* Top row with primary headline */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                      Total Required Monthly Contribution (All Goals Combined)
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                        {currSym}{(totalRequiredMonthlySip ?? 0).toLocaleString()}
                      </span>
                      <span className="text-sm font-bold text-slate-400 font-mono">/ month</span>
                    </div>
                  </div>
                </div>
                <p className={`text-xs mt-2.5 max-w-xl ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Sum of all monthly SIP contributions required across your <strong>{goals.length} milestones</strong> to reach target amounts within the specified tenures at expected return rates.
                </p>
              </div>

              {/* Monthly Surplus Capacity vs Required Monthly Add */}
              <div className={`p-4 rounded-xl border flex flex-col justify-center min-w-[260px] ${
                isLight ? 'bg-white/90 border-slate-200' : 'bg-slate-950/70 border-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Available Monthly Surplus:</span>
                  <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                    {currSym}{(result.metrics.monthlySavings ?? 0).toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-400">All Goals Required SIP:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {currSym}{(totalRequiredMonthlySip ?? 0).toLocaleString()}/mo
                  </span>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-400">Cash Flow Capacity:</span>
                  {result.metrics.monthlySavings >= totalRequiredMonthlySip ? (
                    <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span>✓ Fully Funded</span>
                      <span className="font-mono text-[10px]">(+{currSym}{(Number(result.metrics.monthlySavings - totalRequiredMonthlySip) || 0).toLocaleString()})</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <span>⚠️ Shortfall of</span>
                      <span className="font-mono text-[10px]">{currSym}{(Number(totalRequiredMonthlySip - result.metrics.monthlySavings) || 0).toLocaleString()}/mo</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Supporting 3-column stats bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/70 dark:border-slate-800/80">
              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'}`}>
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Total Milestones Value</span>
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className={`text-xl font-bold font-mono mt-1 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  {currSym}{(totalGoalsTargetAmount ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Across {goals.length} target goals</div>
              </div>

              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'}`}>
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Already Saved So Far</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xl font-bold font-mono text-emerald-500 dark:text-emerald-400 mt-1">
                  {currSym}{(totalGoalsSavedSoFar ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {overallGoalsProgressPct}% overall progress completed
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-950/50 border-slate-800/80'}`}>
                <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between">
                  <span>Total Net Funding Gap</span>
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-amber-500 dark:text-amber-400 mt-1">
                  {currSym}{(totalGoalsFundingGap ?? 0).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Covered via monthly additions</div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* ALL GOALS MONTHLY ADDITIONS BREAKDOWN TABLE                    */}
          {/* ============================================================== */}
          <div className={`rounded-2xl border overflow-hidden ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className={`px-5 py-3 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider">All Goals Required Monthly Addition Schedule</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Sum: <strong className="text-emerald-400">{currSym}{(totalRequiredMonthlySip ?? 0).toLocaleString()}/mo</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className={`text-[11px] uppercase tracking-wider font-semibold border-b ${
                  isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-900/50 text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="py-3 px-4">Milestone Goal</th>
                    <th className="py-3 px-4">Tenure & Year</th>
                    <th className="py-3 px-4 text-right">Target Amount</th>
                    <th className="py-3 px-4 text-right">Saved So Far</th>
                    <th className="py-3 px-4 text-center">Progress</th>
                    <th className="py-3 px-4 text-right">Required Monthly Add</th>
                    <th className="py-3 px-4 text-right">Share of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                  {goalsWithCalculatedSip.map(g => {
                    const sharePct = totalRequiredMonthlySip > 0
                      ? Math.round((g.reqSip / totalRequiredMonthlySip) * 100)
                      : 0;

                    return (
                      <tr key={g.id} className={isLight ? 'hover:bg-slate-50/60' : 'hover:bg-slate-900/40'}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                              {g.category}
                            </span>
                            <span className="font-bold">{g.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {g.tenureYears}y (Target {g.targetYear})
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          {currSym}{(g.targetAmount ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          {currSym}{(g.currentSavings ?? 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 max-w-[120px] mx-auto">
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${g.progressPct}%` }} />
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">{g.progressPct}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-500 dark:text-emerald-400 text-sm">
                          {currSym}{(g.reqSip ?? 0).toLocaleString()}/mo
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">
                          {sharePct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className={`border-t font-bold ${
                  isLight ? 'bg-emerald-50/60 text-slate-900 border-slate-200' : 'bg-emerald-950/20 text-slate-100 border-slate-800'
                }`}>
                  <tr>
                    <td colSpan={2} className="py-3 px-4 uppercase text-[11px] tracking-wider text-slate-400 font-bold">
                      All Goals Total Combined
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm">
                      {currSym}{(totalGoalsTargetAmount ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-slate-400">
                      {currSym}{(totalGoalsSavedSoFar ?? 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs">
                      {overallGoalsProgressPct}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-500 dark:text-emerald-400 text-base">
                      {currSym}{(totalRequiredMonthlySip ?? 0).toLocaleString()}/mo
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-emerald-400">
                      100%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Active Goals Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-400">
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>Individual Milestone Goal Cards</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Each card displays its required monthly addition
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goalsWithCalculatedSip.map(g => {
                const sharePct = totalRequiredMonthlySip > 0
                  ? Math.round((g.reqSip / totalRequiredMonthlySip) * 100)
                  : 0;

                return (
                  <div key={g.id} className={`p-5 rounded-2xl border space-y-3 relative ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="pr-8">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {g.category}
                      </span>
                      <h4 className="text-sm font-bold mt-1.5">{g.name}</h4>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Target Amount:</span>
                        <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{currSym}{(g.targetAmount ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Saved so far:</span>
                        <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{currSym}{(g.currentSavings ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span>Tenure & Target:</span>
                        </span>
                        <span className="font-mono font-bold text-blue-400">
                          {g.tenureYears} {g.tenureYears === 1 ? 'Year' : 'Years'} · Target {g.targetYear}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${g.progressPct}%` }} />
                    </div>

                    {/* Highlighted Required Monthly Add Badge */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-950/30 border-emerald-500/30'
                    }`}>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Required Monthly Add:</span>
                        <span className="font-mono font-extrabold text-sm text-emerald-500 dark:text-emerald-400">
                          {currSym}{(g.reqSip ?? 0).toLocaleString()}/mo
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800/40 px-2 py-0.5 rounded border border-slate-700/50">
                        {sharePct}% of total SIP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Goal Form with Tenure Controls */}
          <form onSubmit={handleAddGoal} className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider">Add a New Future Goal</h4>
              <span className="text-[11px] text-blue-400 font-medium">Configurable Milestone Tenure</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buy Car, Wedding, Downpayment"
                  value={newGoalName}
                  onChange={e => setNewGoalName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Category</label>
                <select
                  value={newGoalCategory}
                  onChange={e => setNewGoalCategory(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                >
                  <option value="Bike">Buy a Bike</option>
                  <option value="Car">Buy a Car</option>
                  <option value="Higher Education">Higher Education</option>
                  <option value="Marriage">Marriage</option>
                  <option value="House">House</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Children Education">Children's Education</option>
                  <option value="Business">Business Venture</option>
                  <option value="Travel">Travel / Vacation</option>
                </select>
              </div>

              <div>
                <FinScoreAmountInput
                  id="goal-target-amount"
                  label={`Target Amount (${currSym})`}
                  value={newGoalTarget ? parseFloat(newGoalTarget) : 0}
                  onChange={val => setNewGoalTarget(val > 0 ? val.toString() : '')}
                  currSym={currSym}
                  isLight={isLight}
                  placeholder="800000"
                  compact
                />
              </div>

              <div>
                <FinScoreAmountInput
                  id="goal-current-saved"
                  label={`Current Savings (${currSym})`}
                  value={newGoalSaved ? parseFloat(newGoalSaved) : 0}
                  onChange={val => setNewGoalSaved(val > 0 ? val.toString() : '')}
                  currSym={currSym}
                  isLight={isLight}
                  placeholder="150000"
                  compact
                />
              </div>
            </div>

            {/* Goal Tenure & Select/View Date Controls */}
            <div className={`p-3.5 rounded-xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-slate-800/80">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span>Milestone Tenure:</span>
                  <strong className="text-blue-400 font-mono">
                    {newGoalTenureYears} {newGoalTenureYears === 1 ? 'Year' : 'Years'} ({newGoalTenureYears * 12} Months)
                  </strong>
                </span>
                <span className="text-[11px] text-slate-400">
                  Target Year: <strong className="font-mono text-slate-200">{new Date().getFullYear() + newGoalTenureYears}</strong>
                </span>
              </div>

              {/* Tenure presets & number input */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Quick Presets:</span>
                {[1, 2, 3, 5, 7, 10, 15, 20].map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setNewGoalTenureYears(yr);
                      setNewGoalYear(String(new Date().getFullYear() + yr));
                      setNewGoalDate(calculateDateFromTenureMonths(yr * 12));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      newGoalTenureYears === yr
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : isLight 
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {yr}Y
                  </button>
                ))}

                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-[11px] text-slate-400">Custom Years:</span>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={newGoalTenureYears}
                    onChange={e => {
                      const yr = Math.max(1, parseInt(e.target.value) || 1);
                      setNewGoalTenureYears(yr);
                      setNewGoalYear(String(new Date().getFullYear() + yr));
                      setNewGoalDate(calculateDateFromTenureMonths(yr * 12));
                    }}
                    className={`w-16 px-2 py-1 rounded-lg border text-xs font-mono text-center ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Select & View Target Date Inside Tenure Section */}
              <div className={`p-2.5 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    <span>Select / View Target Date</span>
                  </label>
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                    Synced with {newGoalTenureYears}Y Tenure
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                  <div>
                    <input
                      type="date"
                      value={newGoalDate}
                      onChange={e => {
                        const dateStr = e.target.value;
                        setNewGoalDate(dateStr);
                        const m = calculateTenureMonthsFromDate(dateStr);
                        const yrs = Math.max(1, Math.round(m / 12));
                        setNewGoalTenureYears(yrs);
                        setNewGoalYear(String(new Date().getFullYear() + yrs));
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-mono ${
                        isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                      }`}
                    />
                  </div>
                  <div className="text-left px-1">
                    <span className="text-[10px] text-slate-400 block">Target Completion Date:</span>
                    <span className="text-xs font-bold text-blue-400 font-mono block">
                      {formatDateFriendly(newGoalDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live SIP Forecast Preview for Tenure */}
            {newGoalTarget && (() => {
              const previewSip = calculateRequiredMonthlySaving(
                parseFloat(newGoalTarget) || 0,
                parseFloat(newGoalSaved) || 0,
                new Date().getFullYear() + newGoalTenureYears,
                9,
                newGoalTenureYears
              );
              const combinedTotalSip = totalRequiredMonthlySip + previewSip;

              return (
                <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                  isLight ? 'bg-emerald-50/80 border-emerald-200 text-slate-800' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-100'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>This Goal's Required Monthly Add ({newGoalTenureYears}y tenure):</span>
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-500 dark:text-emerald-400">
                      +{currSym}{(previewSip ?? 0).toLocaleString()}/mo
                    </span>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-400">
                      Updated Total Required Monthly Add (All Goals Combined):
                    </span>
                    <span className="font-mono font-bold text-xs text-blue-400">
                      {currSym}{(combinedTotalSip ?? 0).toLocaleString()}/month
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Goal with {newGoalTenureYears}y Tenure</span>
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-slate-800 flex justify-between">
            <button
              onClick={() => setActiveTab('investments_assets')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            >
              Back to Investments & Assets
            </button>
            <button
              onClick={() => setActiveTab('ai_assistant')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <span>Next: AI Financial Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 8: AI FINANCIAL ASSISTANT (Step 8 / Tab 7) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ai_assistant' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          {/* Header with Active AI Indicator & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/40">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                  <Bot className="w-6 h-6" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    7. AI Financial Health Assistant
                  </h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Multi-Turn Active
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Conversational financial intelligence grounded directly in your 5-pillar FinScore™ metrics.
                </p>
              </div>
            </div>

            {/* Model Selector Bar */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              <div className={`p-1 rounded-2xl border flex items-center gap-1 ${
                isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}>
                {[
                  { id: 'gemini-3.5-flash', label: '3.5 Flash', subtitle: 'General Tasks' },
                  { id: 'gemini-3.1-pro-preview', label: '3.1 Pro', subtitle: 'Complex Tasks' },
                  { id: 'gemini-3.1-flash-lite', label: '3.1 Flash Lite', subtitle: 'Fast Tasks' },
                ].map(m => {
                  const isSelected = selectedAiModel === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedAiModel(m.id as any);
                        showToast(`Model set to ${m.label} (${m.subtitle})`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex flex-col items-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : isLight
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={`${m.label} — Best for ${m.subtitle}`}
                    >
                      <span className="flex items-center gap-1 leading-none">
                        <Sparkles className="w-3 h-3" />
                        {m.label}
                      </span>
                      <span className="text-[9px] opacity-75 font-normal leading-tight">{m.subtitle}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    setIsSpeakingIndex(null);
                  }
                  setAiChatMessages([
                    {
                      sender: 'ai',
                      text: `Hello ${profile.name || 'there'}! I'm your FinScore AI Advisor. Your current FinScore is ${result.overallScore}/100 (${result.grade}). What financial questions can I help you tackle today?`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      modelUsed: selectedAiModel,
                    },
                  ]);
                  showToast('Conversation history reset.');
                }}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Reset conversation thread"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Role Persona Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              Select Advisor Persona:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {[
                {
                  id: 'advisor',
                  name: 'CFP & Holistic Advisor',
                  desc: 'Balanced 5-pillar health, budgeting & milestones',
                  icon: ShieldCheck,
                  color: 'text-blue-400',
                },
                {
                  id: 'debt_crusher',
                  name: 'Debt Crusher AI',
                  desc: 'High-interest elimination & Avalanche strategy',
                  icon: Flame,
                  color: 'text-rose-400',
                },
                {
                  id: 'risk_auditor',
                  name: 'Risk & Safety Auditor',
                  desc: 'Emergency liquidity runway & insurance shield',
                  icon: Shield,
                  color: 'text-amber-400',
                },
                {
                  id: 'wealth_accelerator',
                  name: 'Wealth Accelerator',
                  desc: 'SIP compounding & FIRE milestone acceleration',
                  icon: TrendingUp,
                  color: 'text-emerald-400',
                },
              ].map(r => {
                const isSelected = selectedRolePreset === r.id;
                const IconComponent = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRolePreset(r.id as any);
                      showToast(`Advisor persona switched to: ${r.name}`);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20'
                          : 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                        : isLight
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                      <IconComponent className={`w-3.5 h-3.5 ${r.color}`} />
                      <span className={isSelected ? (isLight ? 'text-blue-900' : 'text-blue-300') : ''}>{r.name}</span>
                    </div>
                    <p className={`text-[10px] leading-tight line-clamp-2 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {r.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Financial Vitals Banner Evaluated by AI */}
          <div className={`p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Live Financial Grounding Context
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Synced with Current Profile
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'}`}>
                <span className="text-[10px] text-slate-400">FinScore</span>
                <p className="font-extrabold font-mono text-sm text-blue-400">{result.overallScore} / 100 ({result.grade})</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'}`}>
                <span className="text-[10px] text-slate-400">Monthly Income</span>
                <p className="font-extrabold font-mono text-sm">{currSym}{(profile.monthlyIncome ?? 0).toLocaleString()}</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'}`}>
                <span className="text-[10px] text-slate-400">Monthly Savings</span>
                <p className="font-extrabold font-mono text-sm text-emerald-400">{currSym}{(result.metrics.monthlySavings ?? 0).toLocaleString()} ({result.metrics.savingsRatio}%)</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'}`}>
                <span className="text-[10px] text-slate-400">EMI Burden</span>
                <p className={`font-extrabold font-mono text-sm ${result.metrics.emiToIncomeRatio <= 30 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.metrics.emiToIncomeRatio}%
                </p>
              </div>
              <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800/80'}`}>
                <span className="text-[10px] text-slate-400">Emergency Fund</span>
                <p className={`font-extrabold font-mono text-sm ${result.metrics.emergencyFundRatio >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.metrics.emergencyFundRatio}%
                </p>
              </div>
            </div>
          </div>

          {/* Key Priority Highlight Banner */}
          <div className={`p-5 rounded-2xl border ${
            isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Primary Strategic Priority Recommended by AI
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                Action Required
              </span>
            </div>
            <h3 className="text-base font-bold mt-1.5">
              {result.biggestPriority}
            </h3>
          </div>

          {/* Structured Monthly Action Plan (Month 1, Month 2, Month 3) with Interactive Checkbox Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                3-Month Personalized Action Plan
              </h4>
              <span className="text-[11px] font-bold text-slate-400">
                {Object.values(completedPlanTasks).filter(Boolean).length} of {
                  result.monthlyActionPlan.reduce((acc, p) => acc + p.tasks.length, 0)
                } tasks completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.monthlyActionPlan.map(plan => {
                const completedInThisMonth = plan.tasks.filter((_, idx) => completedPlanTasks[`m${plan.monthNumber}_t${idx}`]).length;
                const isAllCompleted = completedInThisMonth === plan.tasks.length && plan.tasks.length > 0;

                return (
                  <div key={plan.monthNumber} className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    isAllCompleted
                      ? isLight ? 'bg-emerald-50/40 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/40'
                      : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-blue-400 font-mono">
                          {plan.monthName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAllCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {completedInThisMonth}/{plan.tasks.length} Done
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-300 mb-3">
                        Focus: {plan.focus}
                      </div>

                      <ul className="space-y-2 text-xs">
                        {plan.tasks.map((task, idx) => {
                          const taskId = `m${plan.monthNumber}_t${idx}`;
                          const isDone = !!completedPlanTasks[taskId];
                          return (
                            <li
                              key={idx}
                              onClick={() => togglePlanTask(taskId)}
                              className={`flex items-start gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                                isDone
                                  ? isLight ? 'bg-emerald-100/50 text-emerald-900 line-through' : 'bg-emerald-950/30 text-emerald-400 line-through'
                                  : isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-900 text-slate-300'
                              }`}
                            >
                              <button
                                type="button"
                                className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isDone
                                    ? 'bg-emerald-500 text-white'
                                    : isLight ? 'border border-slate-300 hover:border-blue-500' : 'border border-slate-700 hover:border-blue-400'
                                }`}
                              >
                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>
                              <span className="text-xs leading-relaxed select-none">{task}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Multi-Turn Chat with FinScore AI */}
          <div className={`p-6 rounded-3xl border space-y-4 shadow-sm ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    FinScore AI Multi-Turn Advisor Chat
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Maintains full context across questions • Powered by {selectedAiModel}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Thread Active ({aiChatMessages.length} turns)</span>
              </span>
            </div>

            {/* Scrollable Chat thread container */}
            <div className="space-y-4 max-h-[480px] min-h-[340px] overflow-y-auto pr-2 custom-scrollbar border border-slate-800/40 p-4 rounded-2xl bg-black/20">
              {aiChatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-start gap-2.5 max-w-2xl">
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-blue-500/20">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-tr-none shadow-md'
                          : isLight
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.text}</div>

                        {msg.sender === 'ai' && (
                          <div className="mt-3 pt-2.5 border-t border-slate-800/40 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-blue-400" />
                              <span className="font-mono text-[9px]">{msg.modelUsed || selectedAiModel}</span>
                            </span>

                            <div className="flex items-center gap-2">
                              {/* Read Aloud Text-to-Speech Button */}
                              <button
                                onClick={() => handleToggleSpeak(msg.text, i)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                                  isSpeakingIndex === i
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'hover:text-blue-400'
                                }`}
                                title={isSpeakingIndex === i ? 'Stop listening' : 'Listen to advice'}
                              >
                                {isSpeakingIndex === i ? (
                                  <>
                                    <VolumeX className="w-3 h-3 text-rose-400" />
                                    <span className="text-rose-400 font-semibold">Stop</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3" />
                                    <span>Read Aloud</span>
                                  </>
                                )}
                              </button>

                              {/* Copy Message Button */}
                              <button
                                onClick={() => handleCopyMessage(msg.text, i)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                                  copiedMessageIndex === i
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'hover:text-blue-400'
                                }`}
                                title="Copy advice"
                              >
                                {copiedMessageIndex === i ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Advice</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className={`text-[10px] text-slate-500 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>FinScore AI ({selectedAiModel}) is reviewing your 5-pillar context and generating custom guidance...</span>
                </div>
              )}
              <div ref={chatMessagesEndRef} />
            </div>

            {/* Quick suggested prompt buttons tailored to role preset */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Suggested Queries for {selectedRolePreset === 'debt_crusher' ? 'Debt Crusher' : selectedRolePreset === 'risk_auditor' ? 'Risk Auditor' : selectedRolePreset === 'wealth_accelerator' ? 'Wealth Accelerator' : 'Holistic CFP'}:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {(selectedRolePreset === 'debt_crusher' ? [
                  { label: '⚡ Snowball vs Avalanche for my current loans?', prompt: 'Compare the Avalanche vs Snowball method for paying off my loans given my income and interest rates.' },
                  { label: '💳 How can I reduce my EMI burden by ₹5,000/mo?', prompt: 'What concrete steps can I take to cut down my monthly loan EMI burden and improve cash flow?' },
                  { label: '🔄 Prepay high-interest loan vs invest in mutual funds?', prompt: 'Should I prepay my personal/credit debt or keep investing in mutual funds right now?' },
                ] : selectedRolePreset === 'risk_auditor' ? [
                  { label: '🛡️ Audit my pure term insurance requirement', prompt: 'Based on my age, income, and liabilities, how much term life insurance do I actually need?' },
                  { label: '☂️ Safe high-yield places to park my emergency fund', prompt: 'Where should I park my 6-month emergency reserve so it beats inflation while remaining 100% liquid?' },
                  { label: '🏥 Health cover adequacy check for a family', prompt: 'Is my current health insurance sufficient to protect against medical emergencies?' },
                ] : selectedRolePreset === 'wealth_accelerator' ? [
                  { label: '🚀 How much monthly SIP to reach ₹1 Crore?', prompt: 'Calculate the monthly SIP and expected timeline needed to accumulate ₹1 Crore at 12% CAGR.' },
                  { label: '📈 Recommended asset allocation for my age', prompt: 'What is the optimal equity, debt, and gold asset allocation for my profile and goals?' },
                  { label: '🔥 Estimate my earliest FIRE financial independence date', prompt: 'Based on my savings rate and expenses, when could I realistically achieve financial independence?' },
                ] : [
                  { label: '🎯 How can I reach my goals 6 months earlier?', prompt: 'How can I reach my goals 6 months earlier with my current savings and income?' },
                  { label: '💳 Prepay loan vs invest in emergency fund?', prompt: 'Should I prepay my loans or invest more in my emergency fund first?' },
                  { label: '📈 3 fastest actions to reach FinScore 85+', prompt: 'What are the 3 fastest actions I can take this month to boost my FinScore above 85?' },
                  { label: '📊 Optimal 50-30-20 budget check for my income', prompt: 'How does my current spending and debt compare against the standard 50-30-20 rule?' },
                ]).map(item => (
                  <button
                    key={item.label}
                    onClick={() => handleSendAiMessage(item.prompt)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all cursor-pointer ${
                      isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-blue-400' : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-blue-500/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input Form */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Ask about emergency runway, loan avalanche, insurance gap, or SIP strategy..."
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendAiMessage(); }}
                className={`flex-1 px-4 py-3 rounded-2xl border text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
              <button
                onClick={() => handleSendAiMessage()}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 shadow-md cursor-pointer transition-all active:scale-95"
              >
                {isAiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send</span>
              </button>
            </div>

            {/* Step Navigation to Score Dashboard */}
            <div className={`pt-4 border-t flex justify-between items-center ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <button
                onClick={() => setActiveTab('goals')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
              >
                Back to 6. Future Goals
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-95"
              >
                <span>Next: 8. Score Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 9: ADMIN & PROJECT TEAM SIDE (Step 12) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'admin' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-blue-500" />
                Step 12 — Admin & Project Team Dashboard
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Cohort-level analytics, score distributions, and customizable FinScore engine scoring rules.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
              Role: Academic Admin / Evaluator
            </span>
          </div>

          {/* High-level Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Registered Users</span>
              <div className="text-2xl font-extrabold font-mono mt-1 text-blue-400">
                {adminStats.totalRegisteredUsers}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Average FinScore</span>
              <div className="text-2xl font-extrabold font-mono mt-1 text-emerald-400">
                {adminStats.averageScore}/100
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Emergency Ready %</span>
              <div className="text-2xl font-extrabold font-mono mt-1 text-amber-400">
                {adminStats.emergencyFundReadyPct}%
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Adequately Insured</span>
              <div className="text-2xl font-extrabold font-mono mt-1 text-purple-400">
                {adminStats.insuranceCoveredPct}%
              </div>
            </div>
          </div>

          {/* Score Distribution Chart */}
          <div className={`p-5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4">
              Cohort Score Distribution Histogram
            </h4>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={adminStats.distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} />
                  <XAxis dataKey="band" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isLight ? '#ffffff' : '#0f172a', 
                      borderColor: isLight ? '#cbd5e1' : '#334155',
                      borderRadius: '12px' 
                    }} 
                  />
                  <Bar dataKey="count" name="Users in Band">
                    {adminStats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cohort User Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sample User Progress & Risk Directory
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className={`border-b ${isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Occupation</th>
                    <th className="p-3">Income</th>
                    <th className="p-3">FinScore</th>
                    <th className="p-3">Emergency Buffer</th>
                    <th className="p-3">Debt Ratio</th>
                    <th className="p-3">Risk Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {adminStats.sampleUsers.map(u => (
                    <tr key={u.id} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/50'}>
                      <td className="p-3 font-bold">{u.name} (Age {u.age})</td>
                      <td className="p-3 text-slate-400">{u.occupation}</td>
                      <td className="p-3 font-mono">{currSym}{(u.income ?? 0).toLocaleString()}</td>
                      <td className="p-3 font-mono font-bold text-blue-400">{u.score}/100</td>
                      <td className="p-3 font-mono">{u.emergencyFundMonths} mo</td>
                      <td className="p-3 font-mono">{u.debtRatio}%</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.risk === 'Low' ? 'bg-emerald-500/15 text-emerald-400' : u.risk === 'Moderate' ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {u.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Current Active User Profile Row */}
                  <tr className={isLight ? 'bg-blue-50/60 font-bold' : 'bg-blue-600/15 font-bold'}>
                    <td className="p-3 text-blue-400">⭐ {profile.name} (You)</td>
                    <td className="p-3 text-slate-300">{profile.occupation}</td>
                    <td className="p-3 font-mono">{currSym}{(profile.monthlyIncome ?? 0).toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{result.overallScore}/100</td>
                    <td className="p-3 font-mono">{(((emergency?.currentEmergencySavings ?? 0) / (result?.metrics?.essentialExpenses || 1)) || 0).toFixed(1)} mo</td>
                    <td className="p-3 font-mono">{result.metrics.emiToIncomeRatio}%</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-400">
                        {result.grade}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Engine Scoring Rule Configuration Editor */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  System Scoring Weights & Rules Configuration
                </h4>
                <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Adjust component weights (Total must equal 100%) and risk thresholds for the financial engine.
                </p>
              </div>
              <button
                onClick={() => setAdminConfig(DEFAULT_ADMIN_CONFIG)}
                className="text-[11px] font-bold text-blue-400 hover:underline"
              >
                Reset Engine Defaults
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Savings Weight (%)</label>
                <input
                  type="number"
                  value={adminConfig.weights.savings}
                  onChange={e => setAdminConfig({
                    ...adminConfig,
                    weights: { ...adminConfig.weights, savings: parseInt(e.target.value) || 0 }
                  })}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-center font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Expense Weight (%)</label>
                <input
                  type="number"
                  value={adminConfig.weights.expenseManagement}
                  onChange={e => setAdminConfig({
                    ...adminConfig,
                    weights: { ...adminConfig.weights, expenseManagement: parseInt(e.target.value) || 0 }
                  })}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-center font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Debt Weight (%)</label>
                <input
                  type="number"
                  value={adminConfig.weights.debt}
                  onChange={e => setAdminConfig({
                    ...adminConfig,
                    weights: { ...adminConfig.weights, debt: parseInt(e.target.value) || 0 }
                  })}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-center font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Emergency (%)</label>
                <input
                  type="number"
                  value={adminConfig.weights.emergencyFund}
                  onChange={e => setAdminConfig({
                    ...adminConfig,
                    weights: { ...adminConfig.weights, emergencyFund: parseInt(e.target.value) || 0 }
                  })}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-center font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Insurance (%)</label>
                <input
                  type="number"
                  value={adminConfig.weights.insurance}
                  onChange={e => setAdminConfig({
                    ...adminConfig,
                    weights: { ...adminConfig.weights, insurance: parseInt(e.target.value) || 0 }
                  })}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-center font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Goals (%)</label>
                <input
                  type="number"
                  value={adminConfig.weights.futureGoals}
                  onChange={e => setAdminConfig({
                    ...adminConfig,
                    weights: { ...adminConfig.weights, futureGoals: parseInt(e.target.value) || 0 }
                  })}
                  className={`w-full px-2.5 py-1.5 rounded-xl border text-center font-mono ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADD DATA TO PROFILE MODAL */}
      {/* ------------------------------------------------------------- */}
      {showAddProfileModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddProfileModal(false)}
        >
          <div 
            className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 relative my-8 animate-in zoom-in-95 duration-150 ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Add Data to Profile</h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Enter or quick-fill personal parameters to calibrate your FinScore metrics.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddProfileModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile Sample Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick Fill Sample Profiles</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Alex (Tech)', name: 'Alex Rivera', age: 28, income: 50000, occupation: 'Software Engineer', dependents: 2, cur: 'INR' },
                  { label: 'Priya (Lead)', name: 'Priya Sharma', age: 34, income: 140000, occupation: 'Product Director', dependents: 3, cur: 'INR' },
                  { label: 'Rohan (Design)', name: 'Rohan Verma', age: 26, income: 75000, occupation: 'UX Designer', dependents: 1, cur: 'INR' },
                  { label: 'Global ($)', name: 'Jordan Taylor', age: 31, income: 6500, occupation: 'Data Scientist', dependents: 2, cur: 'USD' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setTempProfile({
                        name: preset.name,
                        age: preset.age,
                        monthlyIncome: preset.income,
                        occupation: preset.occupation,
                        dependents: preset.dependents,
                        currency: preset.cur as any,
                      });
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                      isLight 
                        ? 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border-slate-200 hover:border-emerald-300' 
                        : 'bg-slate-800 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border-slate-700 hover:border-emerald-500/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <label className="block mb-1 text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Age (Years)</label>
                <input
                  type="number"
                  value={tempProfile.age}
                  onChange={e => setTempProfile({ ...tempProfile, age: parseInt(e.target.value) || 0 })}
                  placeholder="28"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <FinScoreAmountInput
                  id="modal-monthly-income"
                  label={`Monthly Net Income (${tempProfile.currency === 'USD' ? '$' : tempProfile.currency === 'EUR' ? '€' : tempProfile.currency === 'GBP' ? '£' : '₹'})`}
                  value={tempProfile.monthlyIncome}
                  onChange={val => setTempProfile({ ...tempProfile, monthlyIncome: val })}
                  currSym={tempProfile.currency === 'USD' ? '$' : tempProfile.currency === 'EUR' ? '€' : tempProfile.currency === 'GBP' ? '£' : '₹'}
                  isLight={isLight}
                  placeholder="50000"
                  compact
                  presets={[25000, 50000, 75000, 100000, 150000]}
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Occupation / Role</label>
                <input
                  type="text"
                  value={tempProfile.occupation}
                  onChange={e => setTempProfile({ ...tempProfile, occupation: e.target.value })}
                  placeholder="Software Engineer"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Dependents (Family)</label>
                <input
                  type="number"
                  min={0}
                  value={tempProfile.dependents}
                  onChange={e => setTempProfile({ ...tempProfile, dependents: parseInt(e.target.value) || 0 })}
                  placeholder="2"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">Currency</label>
                <select
                  value={tempProfile.currency}
                  onChange={e => setTempProfile({ ...tempProfile, currency: e.target.value as any })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTempProfile(EMPTY_FINSCORE_PROFILE)}
                  className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-4 transition-colors"
                >
                  Clear all fields
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => setTempProfile(INITIAL_FINSCORE_PROFILE)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 transition-colors"
                >
                  Load demo profile
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddProfileModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfileData('profile')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/30"
                >
                  Go to Full Form
                </button>
                <button
                  type="button"
                  id="btn-modal-save-profile"
                  onClick={() => handleSaveProfileData()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply & Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 1-Click Health Plan Modal */}
      <FinScoreHealthPlanModal
        isOpen={showHealthPlanModal}
        onClose={() => setShowHealthPlanModal(false)}
        result={result}
        profile={profile}
        currSym={currSym}
        isLight={isLight}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Peer Benchmark Modal */}
      <FinScoreBenchmarkModal
        isOpen={showBenchmarkModal}
        onClose={() => setShowBenchmarkModal(false)}
        result={result}
        profile={profile}
        currSym={currSym}
        isLight={isLight}
      />
    </div>
  );
};
