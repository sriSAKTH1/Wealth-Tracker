import React, { useState, useMemo } from 'react';
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
  FileText
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
  CartesianGrid
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

type FinScoreTab = 
  | 'dashboard' 
  | 'profile' 
  | 'income_expenses' 
  | 'debt' 
  | 'insurance' 
  | 'emergency' 
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
  const isLight = theme === 'light';

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

  // AI Assistant Chat & Custom Query State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>>([
    {
      sender: 'ai',
      text: `Hello ${profile.name}! I'm your AI Financial Health Advisor. I have analyzed your income, loan commitments, emergency savings, and future goals. What would you like guidance on today?`,
      timestamp: 'Just now',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // What-If Simulation Sandbox State
  const [simEmergencyAdd, setSimEmergencyAdd] = useState(0);
  const [simPrepayDebt, setSimPrepayDebt] = useState(0);

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

  // Reset FinScore: Completely clear ALL information across profile, expenses, loans, insurance, emergency, and goals
  const handleResetData = () => {
    setProfile(EMPTY_FINSCORE_PROFILE);
    setExpenses(EMPTY_FINSCORE_EXPENSES);
    setLoans([]);
    setInsurance(EMPTY_FINSCORE_INSURANCE);
    setEmergency(EMPTY_FINSCORE_EMERGENCY);
    setGoals([]);
    setSimEmergencyAdd(0);
    setSimPrepayDebt(0);
    setAiChatMessages([
      {
        sender: 'ai',
        text: 'All financial information has been cleared. Add your profile, monthly income, and expenses to calculate your personalized FinScore and receive guidance.',
        timestamp: 'Just now',
      },
    ]);
    showToast('All information cleared in Financial Health Score & Planner.');
  };

  // Load benchmark sample profile & data for demo / testing
  const handleLoadSampleData = () => {
    setProfile(INITIAL_FINSCORE_PROFILE);
    setExpenses(INITIAL_FINSCORE_EXPENSES);
    setLoans(INITIAL_FINSCORE_LOANS);
    setInsurance(INITIAL_FINSCORE_INSURANCE);
    setEmergency(INITIAL_FINSCORE_EMERGENCY);
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

  // Send message to AI Assistant
  const handleSendAiMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || aiQuestion;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAiChatMessages(prev => [...prev, userMsg]);
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
        },
      ]);
    } catch (err) {
      setAiChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is your priority assessment: Build your emergency fund of ₹${result.metrics.emergencyShortfall.toLocaleString()} before taking on further obligations. Your current savings rate is ${result.metrics.savingsRatio}%.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden ${
        isLight 
          ? 'bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border-slate-200/90 text-slate-900 shadow-slate-200/60' 
          : 'bg-gradient-to-br from-slate-900/90 via-slate-950 to-slate-900 border-slate-800 text-white shadow-black/40'
      }`}>
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
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                isLight ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                  : 'bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border-purple-800/60'
              }`}
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-sm ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
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
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all shadow-sm ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
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
        <div className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/40 border-slate-200/80 shadow-xs'
            : 'bg-gradient-to-r from-slate-900/90 via-blue-950/20 to-slate-900/90 border-slate-800 shadow-sm'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Health Score Glance */}
            <div className="lg:col-span-5 flex items-center gap-4 border-b lg:border-b-0 lg:border-r border-slate-700/40 pb-4 lg:pb-0 lg:pr-4">
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex flex-col items-center justify-center font-mono text-center">
                  <span className="text-2xl font-extrabold text-blue-400 leading-tight">
                    {result.overallScore}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
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
                  <div title={`Emergency Fund: ${result.scores.emergencyFund}/100`} className="text-center p-1 rounded bg-black/10">
                    <div className="text-slate-400 text-[9px] truncate">Emergency</div>
                    <div className="font-bold text-amber-400">{result.scores.emergencyFund}</div>
                  </div>
                  <div title={`Insurance: ${result.scores.insurance}/100`} className="text-center p-1 rounded bg-black/10">
                    <div className="text-slate-400 text-[9px] truncate">Insurance</div>
                    <div className="font-bold text-blue-400">{result.scores.insurance}</div>
                  </div>
                  <div title={`Savings: ${result.scores.savings}/100`} className="text-center p-1 rounded bg-black/10">
                    <div className="text-slate-400 text-[9px] truncate">Savings</div>
                    <div className="font-bold text-emerald-400">{result.scores.savings}</div>
                  </div>
                  <div title={`Debt: ${result.scores.debt}/100`} className="text-center p-1 rounded bg-black/10">
                    <div className="text-slate-400 text-[9px] truncate">Debt</div>
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
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                  <span>Monthly Surplus: <strong className="font-mono text-emerald-400">{currSym}{result.metrics.monthlySavings.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Goal Target SIP: <strong className="font-mono text-blue-400">{currSym}{result.metrics.totalGoalRequiredMonthlySavings.toLocaleString()}/mo</strong></span>
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
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
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
        <div className="flex items-center gap-1.5 mt-6 pt-4 border-t overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Score Dashboard', icon: Activity },
            { id: 'profile', label: '1. Profile', icon: User },
            { id: 'income_expenses', label: '2. Income & Expenses', icon: DollarSign },
            { id: 'debt', label: '3. Debt Score', icon: Briefcase },
            { id: 'insurance', label: '4. Insurance Score', icon: ShieldCheck },
            { id: 'emergency', label: '5. Emergency Fund', icon: AlertTriangle },
            { id: 'goals', label: '6. Future Goals', icon: Target },
            { id: 'ai_assistant', label: '7. AI Assistant', icon: Bot },
            { id: 'admin', label: '8. Admin Portal', icon: Settings2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-finscore-${tab.id}`}
                onClick={() => setActiveTab(tab.id as FinScoreTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                      : 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30'
                    : isLight
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
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
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
            isLight ? 'bg-white border-slate-200/90 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
          }`}>
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
                      className={`${isLight ? 'stroke-slate-200' : 'stroke-slate-800'}`}
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
                {currSym}{(emergency.currentEmergencySavings).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Target: {currSym}{result.metrics.requiredEmergencyFund.toLocaleString()} ({emergency.targetMonths} mo)
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
                  ? `Shortfall: ${currSym}${result.metrics.emergencyShortfall.toLocaleString()} needed`
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
                Monthly surplus: {currSym}{result.metrics.monthlySavings.toLocaleString()}
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
                EMI: {currSym}{result.metrics.totalMonthlyEmi.toLocaleString()} / mo
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
                  Required monthly saving across {goals.length} milestones: <strong>{currSym}{result.metrics.totalGoalRequiredMonthlySavings.toLocaleString()}/mo</strong>
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
                      {currSym}{g.currentSavings.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {currSym}{g.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>{pct}% funded</span>
                      <span className="text-emerald-400 font-semibold">{currSym}{req.toLocaleString()}/mo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score History & Progress Graph (Step 10) */}
          <div className={`p-6 rounded-3xl border shadow-sm ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Score History & Improvement Trajectory
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Tracking month-over-month score improvement: <strong>52 → 58 → 63 → 70 → {result.overallScore}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  +{result.overallScore - 52} Points Growth
                </span>
              </div>
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
                      borderRadius: '16px' 
                    }} 
                  />
                  <Line type="monotone" dataKey="overallScore" name="FinScore" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="savingsScore" name="Savings" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="debtScore" name="Debt" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="emergencyScore" name="Emergency" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
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
                  <span className="font-mono font-bold text-blue-500">+{currSym}{simEmergencyAdd.toLocaleString()}</span>
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
                  <span className="font-mono font-bold text-purple-500">+{currSym}{simPrepayDebt.toLocaleString()}</span>
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
              <label className="block mb-1 text-slate-400">Monthly Net Income / Salary ({currSym})</label>
              <input
                type="number"
                value={profile.monthlyIncome}
                onChange={e => setProfile({ ...profile, monthlyIncome: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
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
                {currSym}{profile.monthlyIncome.toLocaleString()}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Total Expenses</span>
              <div className="text-xl font-extrabold font-mono mt-1 text-rose-400">
                {currSym}{result.metrics.totalExpenses.toLocaleString()}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase">Monthly Surplus / Savings</span>
              <div className="text-xl font-extrabold font-mono mt-1 text-emerald-400">
                {currSym}{result.metrics.monthlySavings.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Expense Category Inputs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monthly Category Expense Breakdown
            </h4>
            <div className="divide-y divide-slate-800">
              {expenses.map((exp, idx) => (
                <div key={exp.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{exp.category}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      exp.isEssential ? 'bg-blue-500/15 text-blue-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {exp.isEssential ? 'Essential' : 'Discretionary'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{currSym}</span>
                    <input
                      type="number"
                      value={exp.amount}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        setExpenses(prev => prev.map((item, i) => i === idx ? { ...item, amount: val } : item));
                      }}
                      className={`w-32 px-3 py-1.5 rounded-xl border text-right font-mono font-bold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
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
      {activeTab === 'debt' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Step 3 — Loan / Debt Score ({result.scores.debt}/100)</h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Evaluates your debt-to-income ratio, monthly EMI burden, and interest exposure.
              </p>
            </div>
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              result.metrics.emiToIncomeRatio > 40
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              EMI to Income: {result.metrics.emiToIncomeRatio}%
            </span>
          </div>

          {/* Active Loans Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Existing Loans & Credit Commitments ({loans.length})
              </h4>
            </div>

            {loans.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-800 text-xs text-slate-400">
                🎉 Congratulations! You currently have zero outstanding loan commitments. Your Debt Score is 100/100.
              </div>
            ) : (
              <div className="space-y-2">
                {loans.map(loan => (
                  <div key={loan.id} className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div>
                      <div className="font-bold text-xs">{loan.type}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Outstanding: {currSym}{loan.outstandingAmount.toLocaleString()} • APR: {loan.interestRate}% • {loan.remainingTenureMonths} mo left
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-rose-400">
                          {currSym}{loan.monthlyEmi.toLocaleString()}/mo
                        </div>
                        <div className="text-[10px] text-slate-500">EMI</div>
                      </div>
                      <button
                        onClick={() => handleDeleteLoan(loan.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Loan Form */}
          <form onSubmit={handleAddLoan} className={`p-4 rounded-2xl border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}>
            <h5 className="text-xs font-bold uppercase tracking-wider mb-3">Add Existing Loan</h5>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Loan Type</label>
                <select
                  value={newLoanType}
                  onChange={e => setNewLoanType(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                >
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Auto Loan">Auto Loan</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Education Loan">Education Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Outstanding ({currSym})</label>
                <input
                  type="number"
                  placeholder="e.g. 200000"
                  value={newLoanOutstanding}
                  onChange={e => setNewLoanOutstanding(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Monthly EMI ({currSym})</label>
                <input
                  type="number"
                  placeholder="e.g. 6500"
                  value={newLoanEmi}
                  onChange={e => setNewLoanEmi(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newLoanRate}
                  onChange={e => setNewLoanRate(e.target.value)}
                  className={`w-full px-2.5 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1"
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
              <li><strong>Reduce unnecessary loans:</strong> Avoid financing lifestyle depreciating assets.</li>
              <li><strong>Avoid additional high-interest debt:</strong> Never carry forward revolving credit card balances.</li>
              <li><strong>Accelerate monthly repayment:</strong> Applying an extra 5-10% toward principal drastically cuts overall interest.</li>
              <li><strong>Prioritize high-interest debt:</strong> Use the Avalanche method to extinguish high-APR loans first.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-between">
            <button
              onClick={() => setActiveTab('income_expenses')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Back to Income & Expenses
            </button>
            <button
              onClick={() => setActiveTab('insurance')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <span>Next: Insurance Score</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
              Recommended Life Cover: {currSym}{result.metrics.recommendedLifeCoverage.toLocaleString()}
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
                  <label className="block text-slate-400 mb-1">Total Life Cover Sum Assured ({currSym})</label>
                  <input
                    type="number"
                    value={insurance.lifeCoverage}
                    onChange={e => setInsurance({ ...insurance, lifeCoverage: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
                  />
                </div>

                <div className="p-3 rounded-xl bg-black/20 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recommended Cover:</span>
                    <span className="font-mono font-bold">{currSym}{result.metrics.recommendedLifeCoverage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Life Cover Gap:</span>
                    <span className={`font-mono font-bold ${result.metrics.lifeCoverageShortfall > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {result.metrics.lifeCoverageShortfall > 0 
                        ? `${currSym}${result.metrics.lifeCoverageShortfall.toLocaleString()} Shortfall`
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
                  <label className="block text-slate-400 mb-1">Health Sum Insured ({currSym})</label>
                  <input
                    type="number"
                    value={insurance.healthCoverage}
                    onChange={e => setInsurance({ ...insurance, healthCoverage: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-xl border ${isLight ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'}`}
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
              Essential Outflow: {currSym}{result.metrics.essentialExpenses.toLocaleString()}/mo
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
                <label className="block text-slate-400 mb-1">
                  Current Liquid Emergency Savings ({currSym})
                </label>
                <input
                  type="number"
                  value={emergency.currentEmergencySavings}
                  onChange={e => setEmergency({ ...emergency, currentEmergencySavings: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-base font-mono font-bold ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className="p-4 rounded-xl bg-black/20 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Essential Expenses:</span>
                  <span className="font-mono">{currSym}{result.metrics.essentialExpenses.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Required Buffer ({emergency.targetMonths} mo):</span>
                  <span className="font-mono font-bold text-amber-400">{currSym}{result.metrics.requiredEmergencyFund.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Funding Shortfall:</span>
                  <span className="font-mono font-bold text-rose-400">{currSym}{result.metrics.emergencyShortfall.toLocaleString()}</span>
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
                {currSym}{emergency.currentEmergencySavings.toLocaleString()} / {currSym}{result.metrics.requiredEmergencyFund.toLocaleString()}
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
                    ⚠️ You need approximately <strong>{currSym}{result.metrics.emergencyShortfall.toLocaleString()}</strong> more to reach your {emergency.targetMonths}-month target.
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
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Back to Insurance
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md"
            >
              <span>Next: Future Goals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SECTION 7: FUTURE GOALS PLANNER (Step 6) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'goals' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">Step 6 — 🎯 Future Goals Planner ({result.scores.futureGoals}/100)</h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Define milestones (e.g. Car, Higher Education, House, Marriage, Travel). The system calculates the exact monthly saving/SIP required.
              </p>
            </div>
          </div>

          {/* Active Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map(g => {
              const currentYear = new Date().getFullYear();
              const tenureYears = g.tenureYears || Math.max(1, (g.targetYear || currentYear + 4) - currentYear);
              const reqSip = calculateRequiredMonthlySaving(g.targetAmount, g.currentSavings, g.targetYear, g.expectedReturnRate, tenureYears);
              const progressPct = Math.min(100, Math.round((g.currentSavings / (g.targetAmount || 1)) * 100));

              return (
                <div key={g.id} className={`p-5 rounded-2xl border space-y-3 relative ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <button
                    onClick={() => handleDeleteGoal(g.id)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
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
                      <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{currSym}{g.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Saved so far:</span>
                      <span className={`font-mono ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{currSym}{g.currentSavings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span>Tenure & Target:</span>
                      </span>
                      <span className="font-mono font-bold text-blue-400">
                        {tenureYears} {tenureYears === 1 ? 'Year' : 'Years'} · Target {g.targetYear}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progressPct}%` }} />
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Required Monthly SIP:</span>
                    <span className="font-mono font-bold text-emerald-400">{currSym}{reqSip.toLocaleString()}/mo</span>
                  </div>
                </div>
              );
            })}
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
                <label className="block text-slate-400 mb-1 font-medium">Target Amount ({currSym})</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 800000"
                  value={newGoalTarget}
                  onChange={e => setNewGoalTarget(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Current Savings ({currSym})</label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={newGoalSaved}
                  onChange={e => setNewGoalSaved(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'}`}
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
            {newGoalTarget && (
              <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                isLight ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
              }`}>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Calculated SIP for <strong>{newGoalTenureYears}-year tenure</strong> (Target Year {new Date().getFullYear() + newGoalTenureYears}):</span>
                </span>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  {currSym}{calculateRequiredMonthlySaving(
                    parseFloat(newGoalTarget) || 0,
                    parseFloat(newGoalSaved) || 0,
                    new Date().getFullYear() + newGoalTenureYears,
                    9,
                    newGoalTenureYears
                  ).toLocaleString()}/mo
                </span>
              </div>
            )}

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
              onClick={() => setActiveTab('emergency')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Back to Emergency Fund
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
      {/* SECTION 8: AI FINANCIAL ASSISTANT (Step 8) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'ai_assistant' && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-500" />
                Step 8 — 🤖 AI Financial Assistant & 3-Month Action Plan
              </h2>
              <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Translates your scores and data into conversational plain English with a clear month-by-month execution roadmap.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Powered by Server-side Gemini API
            </span>
          </div>

          {/* Key Priority Highlight Banner */}
          <div className={`p-5 rounded-2xl border ${
            isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
          }`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
              Primary Strategic Focus
            </span>
            <h3 className="text-base font-bold mt-1">
              {result.biggestPriority}
            </h3>
          </div>

          {/* Structured Monthly Action Plan (Month 1, Month 2, Month 3) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3-Month Personalized Financial Action Plan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.monthlyActionPlan.map(plan => (
                <div key={plan.monthNumber} className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-blue-400 font-mono">
                        {plan.monthName}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-300 mb-3">
                      Focus: {plan.focus}
                    </div>
                    <ul className="space-y-2 text-xs text-slate-400">
                      {plan.tasks.map((task, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Chat with FinScore AI */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-500" />
              Ask FinScore AI Financial Assistant
            </h4>

            {/* Chat message history box */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 no-scrollbar">
              {aiChatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                      : isLight
                      ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-xs text-blue-400 italic">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>FinScore AI is thinking and formulating recommendations...</span>
                </div>
              )}
            </div>

            {/* Quick suggested prompt buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Try asking:</span>
              {[
                'How can I reach my Car goal faster?',
                'Should I prepay my loan or invest in emergency fund?',
                'How much term life insurance is enough for 2 dependents?',
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => handleSendAiMessage(prompt)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] transition-colors ${
                    isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Prompt Input Form */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about your emergency fund, debt repayment, or financial roadmap..."
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSendAiMessage(); }}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-xs ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
              <button
                onClick={() => handleSendAiMessage()}
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
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
                      <td className="p-3 font-mono">{currSym}{u.income.toLocaleString()}</td>
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
                    <td className="p-3 font-mono">{currSym}{profile.monthlyIncome.toLocaleString()}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{result.overallScore}/100</td>
                    <td className="p-3 font-mono">{(emergency.currentEmergencySavings / (result.metrics.essentialExpenses || 1)).toFixed(1)} mo</td>
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
                <label className="block mb-1 text-slate-400">Monthly Net Income ({tempProfile.currency === 'USD' ? '$' : tempProfile.currency === 'EUR' ? '€' : tempProfile.currency === 'GBP' ? '£' : '₹'})</label>
                <input
                  type="number"
                  value={tempProfile.monthlyIncome}
                  onChange={e => setTempProfile({ ...tempProfile, monthlyIncome: parseFloat(e.target.value) || 0 })}
                  placeholder="50000"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
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
    </div>
  );
};
