import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Check,
  DollarSign,
  User,
  Briefcase,
  Target,
  ArrowRight,
  Download,
  Share2,
  Bell,
  FileText,
  Send,
  PieChart as PieIcon,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  Smartphone,
  Laptop,
  Flame,
  Award,
  Sliders,
  ExternalLink,
  Bot
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import {
  FinScoreProfile,
  FinScoreIncomeSource,
  FinScoreExpenseCategory,
  FinScoreLoan,
  FinScoreInsurance,
  FinScoreEmergency,
  FinScoreGoal,
  FinScoreResult
} from '../../types';

export interface FinScoreBlueprintDashboardProps {
  profile: FinScoreProfile;
  incomes: FinScoreIncomeSource[];
  expenses: FinScoreExpenseCategory[];
  loans: FinScoreLoan[];
  insurance: FinScoreInsurance;
  emergency: FinScoreEmergency;
  goals: FinScoreGoal[];
  result: FinScoreResult;
  currSym: string;
  isLight: boolean;
  onNavigateToTab: (tabId: string) => void;
  onOpenReportModal?: () => void;
  onOpenPlanModal?: () => void;
  onOpenBenchmarkModal?: () => void;
}

export const FinScoreBlueprintDashboard: React.FC<FinScoreBlueprintDashboardProps> = ({
  profile,
  incomes,
  expenses,
  loans,
  insurance,
  emergency,
  goals,
  result,
  currSym,
  isLight,
  onNavigateToTab,
  onOpenReportModal,
  onOpenPlanModal,
  onOpenBenchmarkModal
}) => {
  // Tab within the Detailed Analysis card: 'overview' | 'detailed' | 'swot' | 'recommendations'
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'detailed' | 'swot' | 'recommendations' | 'overview'>('detailed');
  
  // Interactive Chat State for AI Financial Adviser Card
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Based on your FinScore of ${result.overallScore}/100 and financial data, here are some personalized suggestions:\n1. Increase emergency fund to 6 months.\n2. Consider SIP in index funds.\n3. Reduce high-interest debt.`,
      time: 'Just now'
    }
  ]);

  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessages = [
      ...chatMessages,
      { sender: 'user' as const, text: userText, time: now }
    ];

    setChatMessages(newMessages);
    setChatInput('');

    // Simulated instant smart AI response
    setTimeout(() => {
      let aiReply = `Looking at your financial foundation: Your composite score is ${result.overallScore} (${result.grade}). Keep maintaining low lifestyle wants and prioritize your emergency liquid buffer!`;
      if (userText.toLowerCase().includes('emergency')) {
        aiReply = `Your emergency savings currently stand at ${currSym}${(emergency.currentEmergencySavings || 0).toLocaleString()}. We recommend saving an additional ${currSym}${Math.max(0, (result.metrics.requiredEmergencyFund || 0) - (emergency.currentEmergencySavings || 0)).toLocaleString()} in liquid instruments to hit 6 months.`;
      } else if (userText.toLowerCase().includes('debt') || userText.toLowerCase().includes('loan')) {
        aiReply = `Your total EMI burden is ${currSym}${(result.metrics.totalMonthlyEmi || 0).toLocaleString()}/month (${result.metrics.emiToIncomeRatio}% of income). Prepaying just 5% extra every quarter can save significant interest over time!`;
      } else if (userText.toLowerCase().includes('invest') || userText.toLowerCase().includes('sip')) {
        aiReply = `With a monthly surplus of ${currSym}${(result.metrics.monthlySavings || 0).toLocaleString()}, consider allocating 70% to broad equity index funds and 30% to balanced debt for long-term compounding.`;
      }
      setChatMessages(prev => [
        ...prev,
        { sender: 'ai', text: aiReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 600);
  };

  // 1. Data for Income & Expenses Donut Chart
  const totalMonthlyIncome = profile.monthlyIncome > 0 ? profile.monthlyIncome : (result.metrics.monthlyIncome || 95000);
  const totalMonthlyExpenses = result.metrics.totalExpenses > 0 ? result.metrics.totalExpenses : 52500;
  const totalMonthlySavings = Math.max(0, totalMonthlyIncome - totalMonthlyExpenses);

  const needsExpenses = result.metrics.essentialExpenses > 0 ? result.metrics.essentialExpenses : Math.round(totalMonthlyExpenses * 0.60);
  const wantsExpenses = result.metrics.discretionaryExpenses > 0 ? result.metrics.discretionaryExpenses : Math.round(totalMonthlyExpenses * 0.25);
  const emiExpenses = result.metrics.totalMonthlyEmi > 0 ? result.metrics.totalMonthlyEmi : Math.round(totalMonthlyExpenses * 0.15);

  const expenseBreakdownData = [
    { name: 'Needs', value: needsExpenses, percentage: 60, color: '#3B82F6' },
    { name: 'Wants', value: wantsExpenses, percentage: 25, color: '#06B6D4' },
    { name: 'EMI', value: emiExpenses, percentage: 15, color: '#F59E0B' },
  ];

  // 2. Data for Asset Allocation Donut Chart
  const assetAllocationData = [
    { name: 'Equity', percentage: 45, color: '#3B82F6' },
    { name: 'Debt', percentage: 25, color: '#EF4444' },
    { name: 'Real Estate', percentage: 15, color: '#06B6D4' },
    { name: 'Gold', percentage: 10, color: '#F59E0B' },
    { name: 'Cash', percentage: 5, color: '#EAB308' },
  ];

  // 3. Category Scores (Matches Blueprint exactly: 7 Category bars)
  const categoryScores = [
    { label: 'Income & Stability', score: 80, color: 'bg-emerald-500' },
    { label: 'Expense Management', score: result.scores.expenseManagement || 65, color: 'bg-amber-500' },
    { label: 'Debt Management', score: result.scores.debt || 60, color: 'bg-amber-500' },
    { label: 'Insurance Coverage', score: result.combo.healthInsurance.score100 || 75, color: 'bg-emerald-500' },
    { label: 'Emergency Fund', score: result.combo.emergencyFund.isActive ? (result.combo.emergencyFund.score100 || 55) : 0, color: 'bg-amber-500' },
    { label: 'Investments & Assets', score: 78, color: 'bg-emerald-500' },
    { label: 'Future Goals', score: result.scores.futureGoals || 70, color: 'bg-emerald-500' },
  ];

  // 4. Balance Sheet Figures
  const totalAssetsVal = 6850000;
  const totalLiabVal = 3700000;
  const netWorthVal = totalAssetsVal - totalLiabVal; // 31,50,000

  // 5. User Journey steps (1 to 5 from blueprint)
  const journeySteps = [
    { num: 1, title: 'Sign Up', desc: 'Create account and basic profile', tabId: 'profile' },
    { num: 2, title: 'Complete Assessment', desc: 'Step-by-step financial information', tabId: 'income_expenses' },
    { num: 3, title: 'See FinScore', desc: 'Dashboard with detailed analysis', tabId: 'dashboard' },
    { num: 4, title: 'Get Recommendations', desc: 'AI-powered insights and action plan', tabId: 'factors_advice' },
    { num: 5, title: 'Track Progress', desc: 'Update data and improve score', tabId: 'goals' },
  ];

  // 6. 10 Step Cards (From the mobile preview frames in blueprint)
  const tenAssessmentSteps = [
    {
      step: 1,
      title: '1. Welcome & Sign Up',
      subtitle: 'Your Financial Health in One Place',
      highlights: ['Continue with Google', 'Continue with Email'],
      icon: User,
      tabId: 'profile',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      step: 2,
      title: '2. Basic Information',
      subtitle: "Let's get to know you",
      highlights: [
        `Name: ${profile.name || 'John Doe'}`,
        `Age: ${profile.age || 28}`,
        `Occupation: ${profile.occupation || 'Software Engineer'}`
      ],
      icon: User,
      tabId: 'profile',
      color: 'from-emerald-600 to-teal-600'
    },
    {
      step: 3,
      title: '3. Income Details',
      subtitle: 'Your Income Sources',
      highlights: [
        `Salary: ${currSym}80,000`,
        `Business: ${currSym}0`,
        `Rental: ${currSym}10,000`
      ],
      icon: DollarSign,
      tabId: 'income_expenses',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      step: 4,
      title: '4. Expenses (Needs)',
      subtitle: 'Essential living costs',
      highlights: [
        `Rent/Home Loan: ${currSym}20,000`,
        `Groceries: ${currSym}8,000`,
        `EMI: ${currSym}12,000`
      ],
      icon: Layers,
      tabId: 'income_expenses',
      color: 'from-amber-600 to-orange-600'
    },
    {
      step: 5,
      title: '5. Expenses (Wants)',
      subtitle: 'Lifestyle & personal expenses',
      highlights: [
        `OTT & Media: ${currSym}500`,
        `Dining/Movies: ${currSym}4,000`,
        `Shopping: ${currSym}2,000`
      ],
      icon: Sparkles,
      tabId: 'income_expenses',
      color: 'from-purple-600 to-pink-600'
    },
    {
      step: 6,
      title: '6. Loans & Debt',
      subtitle: 'Current liabilities & EMIs',
      highlights: [
        `Home Loan: ${currSym}30,00,000`,
        `Car Loan: ${currSym}5,00,000`,
        `Personal Loan: ${currSym}2,00,000`
      ],
      icon: Briefcase,
      tabId: 'debt',
      color: 'from-rose-600 to-red-600'
    },
    {
      step: 7,
      title: '7. Insurance',
      subtitle: 'Health & Term Cover',
      highlights: [
        `Health Ins: ${currSym}5,00,000`,
        `Term Life: ${currSym}1,00,00,000`,
        `Other Cover: Active`
      ],
      icon: ShieldCheck,
      tabId: 'insurance',
      color: 'from-blue-600 to-indigo-600'
    },
    {
      step: 8,
      title: '8. Emergency Fund',
      subtitle: 'Liquid security buffer',
      highlights: [
        `Current: ${currSym}1,50,000`,
        `Recommended: 3-6 Mos`,
        `Coverage: 2.5 Months`
      ],
      icon: AlertTriangle,
      tabId: 'emergency',
      color: 'from-amber-500 to-yellow-600'
    },
    {
      step: 9,
      title: '9. Investments & Assets',
      subtitle: 'Mutual funds, stocks & land',
      highlights: [
        `Mutual Funds: ${currSym}2,50,000`,
        `Stocks: ${currSym}1,00,000`,
        `Real Estate: ${currSym}50,00,000`
      ],
      icon: TrendingUp,
      tabId: 'investments_assets',
      color: 'from-emerald-600 to-green-600'
    },
    {
      step: 10,
      title: '10. Future Goals',
      subtitle: 'Milestones & Targets',
      highlights: [
        `Buy a House (5y): ${currSym}50L`,
        `Child Edu (10y): ${currSym}25L`,
        `Retirement (25y): ${currSym}2 Cr`
      ],
      icon: Target,
      tabId: 'goals',
      color: 'from-indigo-600 to-purple-600'
    }
  ];

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* ----------------------------------------------------------------- */}
      {/* 1. TOP BLUEPRINT BRAND HEADER & OVERVIEW BANNER                     */}
      {/* ----------------------------------------------------------------- */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'}`}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          {/* Logo & Headline */}
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-3">
              {/* Upward green chart logo matching blueprint */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <div className="flex items-end gap-1 px-1 h-5">
                  <div className="w-1.5 h-2 bg-white rounded-xs" />
                  <div className="w-1.5 h-3.5 bg-white rounded-xs" />
                  <div className="w-1.5 h-5 bg-white rounded-xs" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                    <span className="text-emerald-500">Fin</span><span>Score</span>
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    Official Blueprint UI
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Know Your Finances. Build a Better Tomorrow.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              A smart financial health checker and personal finance advisor that analyzes your income, expenses, debts, investments and goals to give you a FinScore, detailed insights and a personalized plan.
            </p>

            {/* 5 Quick Action Pill Tags from Blueprint */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[
                { label: 'Assess', icon: FileText, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40' },
                { label: 'Analyze', icon: PieIcon, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40' },
                { label: 'Get Score', icon: Award, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40' },
                { label: 'Improve', icon: TrendingUp, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/40' },
                { label: 'Achieve Goals', icon: Target, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40' },
              ].map((pill, i) => {
                const Icon = pill.icon;
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${pill.color}`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{pill.label}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Quick Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateToTab('factors_advice')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Page Factors &amp; Advice</span>
            </button>
            <button
              onClick={() => {
                if (onOpenReportModal) onOpenReportModal();
                else window.print();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Key Features & User Journey Row (From Blueprint Top Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          {/* Key Features (8 Items Grid) */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Key Features
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { title: 'Complete Financial Assessment', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/30' },
                { title: 'FinScore & Category Scores', color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/30' },
                { title: 'Personalized Recommendations', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/30' },
                { title: 'SWOT Analysis', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/30' },
                { title: 'Asset Allocation Suggestions', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/30' },
                { title: 'Optional Balance Sheet', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/30' },
                { title: 'AI Financial Adviser', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/30' },
                { title: 'Web & Mobile App', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/30' },
              ].map((feat, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${feat.color}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{feat.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Journey (5 Stepper Stages) */}
          <div className="lg:col-span-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              User Journey (5 Steps)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              {journeySteps.map(step => (
                <div
                  key={step.num}
                  onClick={() => onNavigateToTab(step.tabId)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer hover:scale-[1.02] ${
                    isLight ? 'bg-slate-50 hover:bg-blue-50/50 border-slate-200' : 'bg-slate-950/50 hover:bg-slate-800/50 border-slate-800'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mx-auto mb-2 shadow-sm">
                    {step.num}
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {step.title}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                    {step.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 2. 10-STEP ASSESSMENT FLOW STRIP (Mobile Frames from Blueprint)    */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Step-by-Step Financial Assessment Flow (10 Steps)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                Click any step to configure
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scroll across the 10 mobile-ready wizard stages. Complete each step to calculate your exact FinScore.
            </p>
          </div>
        </div>

        {/* Horizontally scrollable container with 10 mobile frames */}
        <div className="flex items-stretch gap-3.5 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {tenAssessmentSteps.map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                onClick={() => onNavigateToTab(s.tabId)}
                className={`w-52 shrink-0 p-4 rounded-3xl border shadow-sm transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] flex flex-col justify-between ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                {/* Phone Notch / Header Simulator */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-mono font-bold text-slate-400">9:41</span>
                    <div className="w-12 h-2 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[10px] font-mono font-bold text-emerald-500">100%</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {s.title}
                      </h4>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {s.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Highlights list */}
                  <div className="space-y-1.5 pt-2">
                    {s.highlights.map((h, idx) => (
                      <div
                        key={idx}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono truncate ${
                          isLight ? 'bg-slate-50 border-slate-200/80 text-slate-700' : 'bg-slate-950/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button Simulator */}
                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    className="w-full py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-xs flex items-center justify-center gap-1"
                  >
                    <span>{s.step === 10 ? 'Get My FinScore' : 'Configure Step'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 3. MAIN DASHBOARD (Exact Replica of Blueprint Bottom Half)         */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-5">
        {/* Main Dashboard Top Header Bar */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
        }`}>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hello, {profile.name || 'John'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Here&apos;s your financial health overview
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className={`text-xs px-3 py-1.5 rounded-xl border font-mono font-medium ${
              isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}>
              Last Updated 12 Sep 2024
            </span>
            <button
              onClick={() => {
                if (onOpenReportModal) onOpenReportModal();
                else window.print();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* ROW 1: 4 Key Cards (Category Scores & Dial | Analysis Tabs | SWOT | Recommendations) */}
        {/* --------------------------------------------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: FinScore Dial & Category Scores (Lg: 4 Cols) */}
          <div className={`lg:col-span-4 p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-5 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div>
              {/* Radial Gauge Dial */}
              <div className="flex flex-col items-center justify-center text-center pt-1">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      strokeWidth="10"
                      className={isLight ? 'stroke-slate-100' : 'stroke-slate-800'}
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      strokeWidth="10"
                      strokeDasharray={301.6}
                      strokeDashoffset={301.6 - (301.6 * (result.overallScore / 100))}
                      strokeLinecap="round"
                      className="stroke-emerald-500 transition-all duration-1000 ease-out"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      FinScore
                    </span>
                    <span className="text-3xl font-black font-mono text-slate-900 dark:text-white leading-tight">
                      {result.overallScore}
                    </span>
                    <span className="text-xs font-bold text-emerald-500">
                      {result.overallScore >= 80 ? 'Excellent' : result.overallScore >= 65 ? 'Good' : 'Needs Work'}
                    </span>
                  </div>
                </div>

                {/* You are on the right track banner */}
                <div className={`mt-3 p-2.5 rounded-xl border text-[11px] flex items-start gap-2 text-left leading-tight ${
                  isLight ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    You are on the right track! Your financial foundation is good, but there are areas where you can improve.
                  </span>
                </div>
              </div>

              {/* Category Scores Breakdown (7 Categories from Blueprint) */}
              <div className="mt-5 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Category Scores
                </h4>
                <div className="space-y-2">
                  {categoryScores.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-600 dark:text-slate-300 truncate font-medium text-[11px]">
                        {cat.label}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-24 sm:w-28 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${cat.color} transition-all duration-700`}
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white w-6 text-right">
                          {cat.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToTab('factors_advice')}
              className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View Factor Formulas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Detailed Analysis / Tabbed Card (Lg: 8 Cols) */}
          <div className={`lg:col-span-8 p-5 sm:p-6 rounded-3xl border shadow-sm flex flex-col justify-between space-y-5 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div>
              {/* Top Navigation Tabs matching Blueprint: [Overview | Detailed Analysis | SWOT Analysis | Recommendations] */}
              <div className="flex items-center gap-1.5 pb-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'detailed', label: 'Detailed Analysis' },
                  { id: 'swot', label: 'SWOT Analysis' },
                  { id: 'recommendations', label: 'Recommendations' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAnalysisTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeAnalysisTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: DETAILED ANALYSIS (Income & Expenses Donut) */}
              {activeAnalysisTab === 'detailed' && (
                <div className="pt-4 space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Income &amp; Expenses
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      Target 50/30/20 Balance
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Donut Chart with Total Monthly Expenses in Center */}
                    <div className="md:col-span-7 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expenseBreakdownData}
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={68}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {expenseBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(val: number) => [`${currSym}${Number(val).toLocaleString()}`, 'Amount']}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Monthly Expenses
                          </span>
                          <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white mt-0.5">
                            {currSym}{totalMonthlyExpenses.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Legend matching blueprint */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Needs</span>
                          <span className="font-mono text-slate-500 font-bold">60%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Wants</span>
                          <span className="font-mono text-slate-500 font-bold">25%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">EMI</span>
                          <span className="font-mono text-slate-500 font-bold">15%</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Metric Cards (Monthly Income, Monthly Expenses, Monthly Savings) */}
                    <div className="md:col-span-5 grid grid-cols-1 gap-2.5">
                      <div className={`p-3 rounded-2xl border text-center ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Monthly Income
                        </div>
                        <div className="text-lg font-black font-mono text-emerald-500 mt-0.5">
                          {currSym}{totalMonthlyIncome.toLocaleString()}
                        </div>
                      </div>

                      <div className={`p-3 rounded-2xl border text-center ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Monthly Expenses
                        </div>
                        <div className="text-lg font-black font-mono text-rose-500 mt-0.5">
                          {currSym}{totalMonthlyExpenses.toLocaleString()}
                        </div>
                      </div>

                      <div className={`p-3 rounded-2xl border text-center ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                      }`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Monthly Savings
                        </div>
                        <div className="text-lg font-black font-mono text-emerald-500 mt-0.5">
                          {currSym}{totalMonthlySavings.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SWOT ANALYSIS (4 Quadrants from Blueprint) */}
              {activeAnalysisTab === 'swot' && (
                <div className="pt-4 space-y-4 animate-in fade-in duration-200">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Personal Financial SWOT Matrix
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Strengths */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Strengths</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-4 list-disc text-[11px]">
                        <li>Stable income source</li>
                        <li>Good investment habit</li>
                        <li>Adequate insurance cover</li>
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Weaknesses</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-4 list-disc text-[11px]">
                        <li>Low emergency fund buffer</li>
                        <li>High EMI burden (&gt;30%)</li>
                        <li>High lifestyle discretionary expenses</li>
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                        <span>Opportunities</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-4 list-disc text-[11px]">
                        <li>Increase automated monthly SIPs</li>
                        <li>Optimize tax savings under 80C/80D</li>
                        <li>Explore additional secondary income source</li>
                      </ul>
                    </div>

                    {/* Threats */}
                    <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
                        <ShieldCheck className="w-4 h-4 text-rose-500" />
                        <span>Threats</span>
                      </div>
                      <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-4 list-disc text-[11px]">
                        <li>Single salary job dependency</li>
                        <li>Short-term market drawdowns</li>
                        <li>Insufficient dedicated retirement fund</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RECOMMENDATIONS (Top 5 Prioritized Actions from Blueprint) */}
              {activeAnalysisTab === 'recommendations' && (
                <div className="pt-4 space-y-3 animate-in fade-in duration-200">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Top Recommendations
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        num: 1,
                        title: 'Build Emergency Fund',
                        desc: `Save ${currSym}3,00,000 to cover 6 months of living expenses.`,
                        priority: 'High Priority',
                        priorityColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/30'
                      },
                      {
                        num: 2,
                        title: 'Reduce Lifestyle Expenses',
                        desc: `Try to reduce wants by 20% (${currSym}2,000/month).`,
                        priority: 'High Priority',
                        priorityColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/30'
                      },
                      {
                        num: 3,
                        title: 'Increase Investments',
                        desc: `Invest an additional ${currSym}10,000/month in broad index mutual funds.`,
                        priority: 'Medium',
                        priorityColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/30'
                      },
                      {
                        num: 4,
                        title: 'Consider Home Loan Prepayment',
                        desc: `You can save ~${currSym}3,50,000 in interest by prepaying an extra EMI yearly.`,
                        priority: 'Medium',
                        priorityColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/30'
                      },
                      {
                        num: 5,
                        title: 'Plan for Retirement',
                        desc: 'Start a dedicated compounding retirement fund with monthly SIP.',
                        priority: 'Low',
                        priorityColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/30'
                      },
                    ].map(rec => (
                      <div
                        key={rec.num}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                          isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-slate-950/50 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {rec.num}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">
                              {rec.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {rec.desc}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${rec.priorityColor}`}>
                          {rec.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: OVERVIEW */}
              {activeAnalysisTab === 'overview' && (
                <div className="pt-4 space-y-3 animate-in fade-in duration-200">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    4-Pillar Composite Status
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Emergency</div>
                      <div className="text-base font-bold text-amber-500 mt-1">
                        {result.combo.emergencyFund.marks1000}/250 Pts
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Health Ins</div>
                      <div className="text-base font-bold text-blue-500 mt-1">
                        {result.combo.healthInsurance.marks1000}/250 Pts
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Savings</div>
                      <div className="text-base font-bold text-emerald-500 mt-1">
                        {result.combo.savings.marks1000}/250 Pts
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Debt</div>
                      <div className="text-base font-bold text-purple-500 mt-1">
                        {result.combo.debt.marks1000}/250 Pts
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">
                Grade: <strong className="text-blue-500">{result.grade}</strong> ({result.overallScore1000}/1,000 Points)
              </span>
              <button
                type="button"
                onClick={() => onNavigateToTab('factors_advice')}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Read Full Guidance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------------- */}
        {/* ROW 2: 4 Bottom Cards from Blueprint                             */}
        {/* (Asset Allocation | Balance Sheet | AI Adviser Chat | Reports)   */}
        {/* --------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Asset Allocation (Recommended) */}
          <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Asset Allocation (Recommended)
                </h3>
                <span className="text-[10px] text-blue-500 font-mono font-bold">
                  Balanced
                </span>
              </div>

              {/* Donut Chart */}
              <div className="relative w-36 h-36 mx-auto mt-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={2}
                      dataKey="percentage"
                    >
                      {assetAllocationData.map((entry, index) => (
                        <Cell key={`alloc-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend matching Blueprint */}
              <div className="space-y-1.5 text-xs pt-1">
                {assetAllocationData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigateToTab('investments_assets')}
              className="w-full py-1.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 transition-colors"
            >
              Rebalance Portfolio
            </button>
          </div>

          {/* Card 2: Balance Sheet (Optional) */}
          <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between space-y-4 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Balance Sheet (Optional)
                </h3>
                <span className="text-[10px] text-emerald-500 font-mono font-bold">
                  Solvent
                </span>
              </div>

              {/* Assets & Liabilities Summary */}
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Assets</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {currSym}68,50,000
                  </span>
                </div>
                <div className="pl-2 space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between"><span>Cash &amp; Bank:</span><span>{currSym}3,50,000</span></div>
                  <div className="flex justify-between"><span>Investments:</span><span>{currSym}6,50,000</span></div>
                  <div className="flex justify-between"><span>Real Estate:</span><span>{currSym}50,00,000</span></div>
                  <div className="flex justify-between"><span>Other Assets:</span><span>{currSym}8,50,000</span></div>
                </div>

                <div className="flex items-center justify-between pt-1 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Liabilities</span>
                  <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                    {currSym}37,00,000
                  </span>
                </div>
                <div className="pl-2 space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                  <div className="flex justify-between"><span>Home Loan:</span><span>{currSym}30,00,000</span></div>
                  <div className="flex justify-between"><span>Car Loan:</span><span>{currSym}5,00,000</span></div>
                  <div className="flex justify-between"><span>Personal Loan:</span><span>{currSym}2,00,000</span></div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-extrabold text-slate-900 dark:text-white">Net Worth</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                    {currSym}31,50,000
                  </span>
                </div>

                {/* 3-Bar Comparison Visual (Assets, Liabilities, Net Worth) */}
                <div className="flex items-end justify-center gap-4 h-16 pt-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 bg-emerald-500 rounded-t-sm" style={{ height: '52px' }} />
                    <span className="text-[9px] text-slate-400">Assets</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 bg-rose-500 rounded-t-sm" style={{ height: '36px' }} />
                    <span className="text-[9px] text-slate-400">Liab</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-5 bg-blue-500 rounded-t-sm" style={{ height: '28px' }} />
                    <span className="text-[9px] text-slate-400">Net Worth</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('finscore-balance-sheet-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onNavigateToTab('debt');
              }}
              className="w-full py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
            >
              Audit Balance Sheet
            </button>
          </div>

          {/* Card 3: AI Financial Adviser (Chat) */}
          <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                  <Bot className="w-4 h-4 text-blue-500" />
                  <span>AI Financial Adviser</span>
                </div>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>

              {/* Chat Messages Bubble */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800 text-[11px] leading-relaxed max-h-44 overflow-y-auto space-y-2">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-xl text-xs ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white ml-4'
                        : isLight
                        ? 'bg-white border border-slate-200 text-slate-800 mr-2 shadow-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 mr-2'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">
                      {msg.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="flex items-center gap-1.5">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask me anything about your finances..."
                className={`flex-1 px-3 py-1.5 rounded-xl text-xs border outline-none transition-all ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                    : 'bg-slate-950 border-slate-800 text-white focus:border-blue-400'
                }`}
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Card 4: Reports & Export (4 Action Cards) */}
          <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between space-y-3 ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Reports &amp; Export
              </h3>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenReportModal) onOpenReportModal();
                    else window.print();
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer hover:scale-[1.02] flex flex-col items-center justify-center ${
                    isLight ? 'bg-slate-50 hover:bg-rose-50/50 border-slate-200' : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <FileText className="w-5 h-5 text-rose-500 mb-1" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white">PDF Report</span>
                  <span className="text-[9px] text-slate-400 line-clamp-1">Download analysis</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`My FinScore: ${result.overallScore}/100 (Grade ${result.grade}). Calculated on FixWealth.`);
                    alert('Summary copied to clipboard!');
                  }}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer hover:scale-[1.02] flex flex-col items-center justify-center ${
                    isLight ? 'bg-slate-50 hover:bg-blue-50/50 border-slate-200' : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <Share2 className="w-5 h-5 text-blue-500 mb-1" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white">Share Report</span>
                  <span className="text-[9px] text-slate-400 line-clamp-1">With family/advisor</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToTab('factors_advice')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer hover:scale-[1.02] flex flex-col items-center justify-center ${
                    isLight ? 'bg-slate-50 hover:bg-emerald-50/50 border-slate-200' : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white">Track Progress</span>
                  <span className="text-[9px] text-slate-400 line-clamp-1">Score improvement</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateToTab('ai_assistant')}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer hover:scale-[1.02] flex flex-col items-center justify-center ${
                    isLight ? 'bg-slate-50 hover:bg-purple-50/50 border-slate-200' : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <Bell className="w-5 h-5 text-purple-500 mb-1" />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white">Set Reminders</span>
                  <span className="text-[9px] text-slate-400 line-clamp-1">Important actions</span>
                </button>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 text-center font-mono border-t border-slate-100 dark:border-slate-800">
              Audit-grade verification • Confidential &amp; Safe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
