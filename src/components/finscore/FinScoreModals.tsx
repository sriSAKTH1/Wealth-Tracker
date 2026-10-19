import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Printer,
  Award,
  DollarSign,
  Target,
  Clock,
  Briefcase,
  Lightbulb,
  HelpCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Check,
  ShieldAlert,
  Info,
  Layers,
  ArrowUpRight,
  Scale,
  ExternalLink
} from 'lucide-react';
import { FinScoreResult, FinScoreProfile, FinScoreEmergency, FinScoreInsurance, FinScoreLoan } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface HealthPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: FinScoreResult;
  profile: FinScoreProfile;
  currSym: string;
  isLight: boolean;
  onNavigateTab: (tab: any) => void;
}

const getModalStyles = (theme: string) => {
  switch (theme) {
    case 'flavorfit':
      return {
        modal: 'bg-[#0B0C14] border-[#202438] text-white',
        card: 'bg-[#131522] border-[#202438] text-white',
        inner: 'bg-[#161827] border-[#22263D] text-slate-200',
        btnSecondary: 'bg-[#1A1C2D] hover:bg-[#22253B] text-slate-300 border border-[#262A44]',
        headerBorder: 'border-[#202438]',
        tableHeader: 'bg-[#161827] text-slate-300',
        tableRow: 'hover:bg-[#1A1C2D]/40',
        divider: 'border-[#22263D]',
      };
    case 'nature':
      return {
        modal: 'bg-[#FAF8F3] border-[#DED9CD] text-[#283618]',
        card: 'bg-[#FAF8F3] border-[#DED9CD] text-[#283618]',
        inner: 'bg-[#F4F1EA] border-[#DED9CD] text-[#283618]',
        btnSecondary: 'bg-[#ECE8DD] hover:bg-[#E2DDD0] text-[#283618] border border-[#DED9CD]',
        headerBorder: 'border-[#DED9CD]',
        tableHeader: 'bg-[#ECE8DD] text-[#283618]',
        tableRow: 'hover:bg-[#ECE8DD]/50',
        divider: 'border-[#DED9CD]',
      };
    case 'retro':
      return {
        modal: 'bg-[#FAF6ED] border-[#D6CCB5] text-[#2B2520]',
        card: 'bg-[#FAF6ED] border-[#D6CCB5] text-[#2B2520]',
        inner: 'bg-[#F5EEDF] border-[#D6CCB5] text-[#2B2520]',
        btnSecondary: 'bg-[#EDE5D3] hover:bg-[#E2D8C3] text-[#2B2520] border border-[#D6CCB5]',
        headerBorder: 'border-[#D6CCB5]',
        tableHeader: 'bg-[#EDE5D3] text-[#2B2520]',
        tableRow: 'hover:bg-[#EDE5D3]/50',
        divider: 'border-[#D6CCB5]',
      };
    case 'coolors':
      return {
        modal: 'bg-[#0b1329] border-[#1e2d54] text-white',
        card: 'bg-[#111c38] border-[#1e2d54] text-white',
        inner: 'bg-[#152347] border-[#22335e] text-blue-100',
        btnSecondary: 'bg-[#17254a] hover:bg-[#1d2f5e] text-blue-200 border border-[#22335e]',
        headerBorder: 'border-[#1e2d54]',
        tableHeader: 'bg-[#152347] text-blue-200',
        tableRow: 'hover:bg-[#17254a]/40',
        divider: 'border-[#1e2d54]',
      };
    case 'emerald':
      return {
        modal: 'bg-[#021a13] border-[#0e4a39] text-white',
        card: 'bg-[#062a20] border-[#0e4a39] text-white',
        inner: 'bg-[#09382b] border-[#115743] text-emerald-100',
        btnSecondary: 'bg-[#09382b] hover:bg-[#0c4737] text-emerald-200 border border-[#115743]',
        headerBorder: 'border-[#0e4a39]',
        tableHeader: 'bg-[#09382b] text-emerald-200',
        tableRow: 'hover:bg-[#09382b]/40',
        divider: 'border-[#0e4a39]',
      };
    case 'slate':
      return {
        modal: 'bg-[#0f172a] border-[#334155] text-white',
        card: 'bg-[#1e293b] border-[#334155] text-white',
        inner: 'bg-[#243247] border-[#3b4b63] text-slate-100',
        btnSecondary: 'bg-[#27354c] hover:bg-[#30415d] text-slate-200 border border-[#3b4b63]',
        headerBorder: 'border-[#334155]',
        tableHeader: 'bg-[#243247] text-slate-200',
        tableRow: 'hover:bg-[#27354c]/40',
        divider: 'border-[#334155]',
      };
    case 'light':
      return {
        modal: 'bg-white border-slate-200 text-slate-900',
        card: 'bg-white border-slate-200 text-slate-900',
        inner: 'bg-slate-50 border-slate-200 text-slate-800',
        btnSecondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
        headerBorder: 'border-slate-200',
        tableHeader: 'bg-slate-100 text-slate-700',
        tableRow: 'hover:bg-slate-50',
        divider: 'border-slate-200',
      };
    default: // Only dark / midnight modes keep black color themes
      return {
        modal: 'bg-zinc-900 border-zinc-800 text-white',
        card: 'bg-zinc-900/90 border-zinc-800 text-white',
        inner: 'bg-zinc-950/80 border-zinc-800 text-zinc-200',
        btnSecondary: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700',
        headerBorder: 'border-zinc-800',
        tableHeader: 'bg-zinc-800/80 text-zinc-300',
        tableRow: 'hover:bg-zinc-800/40',
        divider: 'border-zinc-800',
      };
  }
};

export const FinScoreHealthPlanModal: React.FC<HealthPlanModalProps> = ({
  isOpen,
  onClose,
  result,
  profile,
  currSym,
  isLight,
  onNavigateTab,
}) => {
  const { theme } = useFinance();
  const modalStyles = React.useMemo(() => getModalStyles(theme), [theme]);

  if (!isOpen) return null;

  const planSteps = [
    {
      step: 1,
      title: 'Build Liquid Safety Cushion',
      subtitle: `Target: ${currSym}${(Number(result.metrics.requiredEmergencyFund) || 0).toLocaleString()} (6 months essential expenses)`,
      status: result.metrics.emergencyShortfall <= 0 ? 'Completed' : 'Priority #1',
      statusColor: result.metrics.emergencyShortfall <= 0 ? 'text-emerald-400 bg-emerald-500/15' : 'text-amber-400 bg-amber-500/15',
      action: result.metrics.emergencyShortfall <= 0
        ? 'Your emergency buffer is fully funded. Maintain in high-yield liquid instruments.'
        : `Allocate ${currSym}${Math.round((Number(result.metrics.monthlySavings) || 0) * 0.5).toLocaleString()}/mo to fill the ${currSym}${(Number(result.metrics.emergencyShortfall) || 0).toLocaleString()} shortfall.`,
      tab: 'emergency',
      btnLabel: 'Manage Emergency Fund',
    },
    {
      step: 2,
      title: 'Protect Income & Family',
      subtitle: 'Pure Term Life Insurance (10x-15x income) + Personal Health Policy',
      status: result.scores.insurance >= 80 ? 'Protected' : 'Priority #2',
      statusColor: result.scores.insurance >= 80 ? 'text-emerald-400 bg-emerald-500/15' : 'text-blue-400 bg-blue-500/15',
      action: result.scores.insurance >= 80
        ? 'Adequate risk coverage in place. Review sum insured annually.'
        : 'Secure an independent personal health cover (minimum ₹10-15 Lakh) and term cover.',
      tab: 'insurance',
      btnLabel: 'Review Insurance',
    },
    {
      step: 3,
      title: 'Control Debt & Prune EMIs',
      subtitle: `Current EMI Ratio: ${result.metrics.emiToIncomeRatio}% of net income (Safe ceiling: 35%)`,
      status: result.metrics.emiToIncomeRatio <= 30 ? 'Healthy' : 'Priority #3',
      statusColor: result.metrics.emiToIncomeRatio <= 30 ? 'text-emerald-400 bg-emerald-500/15' : 'text-rose-400 bg-rose-500/15',
      action: result.metrics.emiToIncomeRatio <= 30
        ? 'Debt levels are safe and manageable.'
        : `Prioritize prepaying high-interest debt to bring total monthly EMI below ${currSym}${Math.round((Number(profile.monthlyIncome) || 0) * 0.35).toLocaleString()}.`,
      tab: 'debt',
      btnLabel: 'Debt Optimizer',
    },
    {
      step: 4,
      title: 'Systematic Wealth & Goal SIPs',
      subtitle: `Target Monthly Goal Savings: ${currSym}${(Number(result.metrics.totalGoalRequiredMonthlySavings) || 0).toLocaleString()}/mo`,
      status: result.scores.futureGoals >= 70 ? 'On Track' : 'Needs Setup',
      statusColor: result.scores.futureGoals >= 70 ? 'text-emerald-400 bg-emerald-500/15' : 'text-purple-400 bg-purple-500/15',
      action: 'Automate SIPs across diversified equity index funds aligned to milestone dates.',
      tab: 'goals',
      btnLabel: 'Configure Goals',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl space-y-6 ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Your 1-Click Financial Health Plan</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Customized roadmap for {profile.name || 'User'} based on FinScore™ {result.overallScore}/100
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          isLight ? 'bg-blue-50/70 border-blue-200' : 'bg-blue-950/30 border-blue-900/50'
        }`}>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-500">
              Overall Diagnosis
            </div>
            <div className="text-sm font-semibold mt-0.5">
              {result.summaryDiagnosis}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold font-mono text-blue-500">
              {result.overallScore}<span className="text-xs font-normal text-slate-400">/100</span>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Grade {result.grade}
            </div>
          </div>
        </div>

        {/* Step by Step Action Roadmap */}
        <div className="space-y-3">
          {planSteps.map(item => (
            <div
              key={item.step}
              className={`p-4 rounded-2xl border transition-all ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center">
                    {item.step}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold">{item.title}</h4>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${item.statusColor}`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-2.5 text-xs text-slate-300 bg-black/20 p-2.5 rounded-xl border border-white/5">
                {item.action}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => {
                    onNavigateTab(item.tab);
                    onClose();
                  }}
                  className="text-xs font-bold text-blue-500 hover:text-blue-400 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{item.btnLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors shadow-md"
          >
            Done & Apply Plan
          </button>
        </div>
      </div>
    </div>
  );
};

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: FinScoreResult;
  profile: FinScoreProfile;
  currSym: string;
  isLight: boolean;
}

export const FinScoreBenchmarkModal: React.FC<BenchmarkModalProps> = ({
  isOpen,
  onClose,
  result,
  profile,
  currSym,
  isLight,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const lifeMultiplier = result?.metrics?.lifeCoverageMultiplier ?? 
    (result?.metrics?.monthlyIncome && result.metrics.monthlyIncome > 0
      ? (result.metrics.recommendedLifeCoverage - result.metrics.lifeCoverageShortfall) / (result.metrics.monthlyIncome * 12)
      : 0);

  const emergencyMonths = result?.metrics?.emergencyMonthsAvailable ??
    (result?.metrics?.essentialExpenses && result.metrics.essentialExpenses > 0
      ? ((result.metrics.requiredEmergencyFund - result.metrics.emergencyShortfall) / result.metrics.essentialExpenses)
      : 0);

  const benchmarks = [
    {
      metric: 'Savings Rate',
      yourValue: `${result?.metrics?.savingsRatio ?? 0}%`,
      recommended: '20% - 30%',
      top10: '40%+',
      isGood: (result?.metrics?.savingsRatio ?? 0) >= 20,
    },
    {
      metric: 'Debt / EMI to Income',
      yourValue: `${result?.metrics?.emiToIncomeRatio ?? 0}%`,
      recommended: '< 35%',
      top10: '< 15%',
      isGood: (result?.metrics?.emiToIncomeRatio ?? 0) <= 35,
    },
    {
      metric: 'Emergency Buffer',
      yourValue: `${(emergencyMonths || 0).toFixed(1)} Months`,
      recommended: '6 Months',
      top10: '9-12 Months',
      isGood: (emergencyMonths || 0) >= 6,
    },
    {
      metric: 'Life Insurance Coverage',
      yourValue: `${(lifeMultiplier || 0).toFixed(1)}x Income`,
      recommended: '10x - 15x',
      top10: '15x - 20x',
      isGood: (lifeMultiplier || 0) >= 10,
    },
    {
      metric: 'Health Insurance',
      yourValue: (result?.scores?.insurance ?? 0) >= 70 ? 'Protected' : 'Underinsured',
      recommended: '₹10L+ Independent Cover',
      top10: '₹25L+ Super Top-up',
      isGood: (result?.scores?.insurance ?? 0) >= 70,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl space-y-6 ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Peer Benchmark & Health Report</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Comparing your financial metrics against academic and cohort standards
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Print or Save PDF"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Score Card Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <div className="text-xs text-slate-400 font-medium">Your Score</div>
            <div className="text-2xl font-mono font-bold text-blue-500 mt-0.5">{result.overallScore}/100</div>
            <div className="text-[10px] text-slate-400 font-mono">Grade {result.grade}</div>
          </div>

          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <div className="text-xs text-slate-400 font-medium">National Average</div>
            <div className="text-2xl font-mono font-bold text-slate-400 mt-0.5">58/100</div>
            <div className="text-[10px] text-slate-400 font-mono">Median Urban Peer</div>
          </div>

          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <div className="text-xs text-slate-400 font-medium">Top 10% Savers</div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">85+/100</div>
            <div className="text-[10px] text-slate-400 font-mono">Financial Freedom Class</div>
          </div>
        </div>

        {/* Benchmark Table */}
        <div className="border rounded-2xl overflow-x-auto no-scrollbar text-xs">
          <table className="w-full min-w-[420px]">
            <thead className={`${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800/80 text-slate-300'}`}>
              <tr>
                <th className="text-left p-3 font-semibold">Key Pillar</th>
                <th className="text-center p-3 font-semibold">Your Value</th>
                <th className="text-center p-3 font-semibold">Benchmark (Safe)</th>
                <th className="text-center p-3 font-semibold">Top 10%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {benchmarks.map((row, idx) => (
                <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}>
                  <td className="p-3 font-medium flex items-center gap-1.5">
                    {row.isGood ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span>{row.metric}</span>
                  </td>
                  <td className="p-3 text-center font-mono font-bold">
                    <span className={row.isGood ? 'text-emerald-400' : 'text-amber-400'}>
                      {row.yourValue}
                    </span>
                  </td>
                  <td className="p-3 text-center text-slate-400 font-mono">{row.recommended}</td>
                  <td className="p-3 text-center text-emerald-400/90 font-mono font-semibold">{row.top10}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 50/30/20 Rule Comparison */}
        <div className={`p-4 rounded-2xl border space-y-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            50/30/20 Allocation Rule Check
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div>
              <div className="text-[11px] text-slate-400">Needs (Target 50%)</div>
              <div className="text-base font-mono font-bold text-zinc-200">
                {Math.round((result.metrics.essentialExpenses / (profile.monthlyIncome || 1)) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Wants (Target 30%)</div>
              <div className="text-base font-mono font-bold text-zinc-200">
                {Math.round((result.metrics.discretionaryExpenses / (profile.monthlyIncome || 1)) * 100)}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Savings (Target 20%)</div>
              <div className="text-base font-mono font-bold text-emerald-400">
                {result.metrics.savingsRatio}%
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors shadow-md"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// INTERACTIVE SCORE FACTORS & ACTIONABLE ADVICE MODAL
// ---------------------------------------------------------------------------

export interface FactorExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: FinScoreResult;
  emergency: FinScoreEmergency;
  insurance: FinScoreInsurance;
  loans: FinScoreLoan[];
  profile: FinScoreProfile;
  currSym: string;
  isLight: boolean;
  onNavigateTab: (tab: any) => void;
  initialFactor?: 'all' | 'emergency' | 'insurance' | 'savings' | 'debt' | 'goals';
  onToggleEmergencyFund?: (hasFund: boolean) => void;
}

export const FinScoreFactorExplanationModal: React.FC<FactorExplanationModalProps> = ({
  isOpen,
  onClose,
  result,
  emergency,
  insurance,
  loans,
  profile,
  currSym,
  isLight,
  onNavigateTab,
  initialFactor = 'all',
  onToggleEmergencyFund
}) => {
  const { theme } = useFinance();
  const styles = getModalStyles(theme);

  const [activeFactor, setActiveFactor] = useState<'all' | 'emergency' | 'insurance' | 'savings' | 'debt' | 'goals'>(initialFactor);

  // Interactive quick simulators
  const [simulatedEmergencyMonths, setSimulatedEmergencyMonths] = useState<number>(() => {
    return result?.metrics?.emergencyMonthsAvailable ?? (emergency?.currentEmergencySavings && result?.metrics?.essentialExpenses ? Math.min(12, Number((emergency.currentEmergencySavings / result.metrics.essentialExpenses).toFixed(1))) : 3);
  });

  const [simulatedSavingsRate, setSimulatedSavingsRate] = useState<number>(() => {
    return result?.metrics?.savingsRatio ?? 20;
  });

  const [simulatedEmiReduction, setSimulatedEmiReduction] = useState<number>(0);

  if (!isOpen) return null;

  // Safe metrics calculations
  const monthlyIncome = profile?.monthlyIncome || 1;
  const essentialExpenses = result?.metrics?.essentialExpenses || (monthlyIncome * 0.5);
  const totalEmi = result?.metrics?.totalMonthlyEmi || 0;
  const currentEmiRatio = result?.metrics?.emiToIncomeRatio ?? Math.round((totalEmi / monthlyIncome) * 100);

  // Simulated score calculations
  const simEmergencyScore100 = Math.min(100, Math.round((simulatedEmergencyMonths / Math.max(3, emergency?.targetMonths || 6)) * 100));
  const simEmergencyMarks25 = Number(((simEmergencyScore100 * 25) / 100).toFixed(1));
  const simEmergencyMarks1000 = Math.round((simEmergencyScore100 * 250) / 100);

  const simSavingsScore100 = Math.min(100, Math.round((simulatedSavingsRate / 30) * 100));
  const simSavingsMarks25 = Number(((simSavingsScore100 * 25) / 100).toFixed(1));
  const simSavingsMarks1000 = Math.round((simSavingsScore100 * 250) / 100);

  const simNewEmi = Math.max(0, totalEmi - simulatedEmiReduction);
  const simNewEmiRatio = Math.max(0, Math.round((simNewEmi / monthlyIncome) * 100));
  const simDebtScore100 = simNewEmiRatio <= 25 ? 100 : simNewEmiRatio <= 35 ? Math.round(100 - (simNewEmiRatio - 25) * 2.5) : Math.max(10, Math.round(75 - (simNewEmiRatio - 35) * 3));
  const simDebtMarks25 = Number(((simDebtScore100 * 25) / 100).toFixed(1));
  const simDebtMarks1000 = Math.round((simDebtScore100 * 250) / 100);

  const isEmergencyFundActive = emergency?.hasEmergencyFund !== false && (emergency?.currentEmergencySavings || 0) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl flex flex-col ${styles.modal}`}
      >
        {/* Header Bar */}
        <div className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 sticky top-0 z-10 backdrop-blur-md ${styles.modal} ${styles.headerBorder}`}>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/20 shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  FinScore™ Factor Diagnostic
                </span>
                <span className="text-xs text-slate-400">
                  Total Score: <strong className="text-blue-400">{result.overallScore1000} / 1,000 Pts</strong> ({result.overallScore} / 100)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
                Score Factors &amp; Actionable Advice
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Understand the exact contribution of each pillar and take targeted steps to elevate your score to Grade A.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onNavigateTab('factors_advice');
                onClose();
              }}
              title="Open full page view"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open Full Page</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${styles.btnSecondary}`}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4-Pillar Visual Contribution Ribbon */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Score Composition (Equal 25% Weights / 250 Pts Each):
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {result.overallScore1000} / 1,000 Total
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex shadow-inner">
              <div 
                className={`transition-all duration-500 ${isEmergencyFundActive ? 'bg-amber-500' : 'bg-rose-500/50'}`}
                style={{ width: `${(result.combo.emergencyFund.marks1000 / 1000) * 100}%` }}
                title={`Emergency: ${result.combo.emergencyFund.marks1000} Pts`}
              />
              <div 
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${(result.combo.healthInsurance.marks1000 / 1000) * 100}%` }}
                title={`Health Insurance: ${result.combo.healthInsurance.marks1000} Pts`}
              />
              <div 
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${(result.combo.savings.marks1000 / 1000) * 100}%` }}
                title={`Savings: ${result.combo.savings.marks1000} Pts`}
              />
              <div 
                className="bg-purple-500 transition-all duration-500"
                style={{ width: `${(result.combo.debt.marks1000 / 1000) * 100}%` }}
                title={`Debt: ${result.combo.debt.marks1000} Pts`}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-center pt-1">
              <div className="flex items-center justify-center gap-1.5 text-amber-400">
                <span className={`w-2 h-2 rounded-full ${isEmergencyFundActive ? 'bg-amber-400' : 'bg-rose-400'}`} />
                <span>Emergency: <strong>{result.combo.emergencyFund.marks1000}</strong>/250</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Health Ins: <strong>{result.combo.healthInsurance.marks1000}</strong>/250</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Savings: <strong>{result.combo.savings.marks1000}</strong>/250</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Debt: <strong>{result.combo.debt.marks1000}</strong>/250</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-2 pb-3 overflow-x-auto">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 shrink-0 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveFactor('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFactor === 'all'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Factors Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFactor('emergency')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFactor === 'emergency'
                  ? 'bg-amber-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Emergency Fund (25%)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFactor('insurance')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFactor === 'insurance'
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>2. Health Insurance (25%)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFactor('savings')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFactor === 'savings'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Savings Score (25%)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFactor('debt')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFactor === 'debt'
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-purple-400" />
              <span>4. Debt Score (25%)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFactor('goals')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeFactor === 'goals'
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>Future Goals Readiness</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Tab Contents */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto">

          {/* ------------------------------------------------------------- */}
          {/* TAB: ALL FACTORS SUMMARY */}
          {/* ------------------------------------------------------------- */}
          {(activeFactor === 'all') && (
            <div className="space-y-6">
              {/* How the Combo System Works Card */}
              <div className={`p-4 rounded-2xl border ${styles.inner}`}>
                <div className="flex items-start gap-3">
                  <Scale className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>FinScore™ Balanced 1,000 Combo Methodology</span>
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        25% + 25% + 25% + 25% = 100%
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Your financial health is evaluated across four essential survival and wealth pillars. Each pillar is first graded on an objective <strong>0–100 Diagnostic Scale</strong>, then assigned a <strong>25% combo weight</strong> contributing up to <strong>25 marks</strong> (out of 100) or <strong>250 marks</strong> (out of 1,000).
                    </p>
                    <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>Critical Emergency Rule:</strong> If Emergency Fund is set to <strong>NO</strong>, the mark for that pillar is set to <strong>0 Pts</strong>. Toggling it to YES unlocks your score based on your liquid cushion.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Cards Grid for Quick Factor Navigation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Emergency Fund Card */}
                <div 
                  onClick={() => setActiveFactor('emergency')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-amber-500/40 hover:bg-slate-800/30 group ${styles.card}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${isEmergencyFundActive ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 1 • 25% Weight</div>
                        <h4 className="text-base font-extrabold group-hover:text-amber-400 transition-colors">Emergency Fund</h4>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      {result.combo.emergencyFund.marks1000} / 250 Pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {isEmergencyFundActive 
                      ? `${result.metrics.emergencyFundRatio}% funded (${currSym}${(emergency.currentEmergencySavings || 0).toLocaleString()} of ${currSym}${(result.metrics.requiredEmergencyFund || 0).toLocaleString()}).`
                      : 'No emergency buffer active. Pillar score set to 0 as requested.'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
                    <span>View Emergency Breakdown &amp; Action Plan</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 2. Health Insurance Card */}
                <div 
                  onClick={() => setActiveFactor('insurance')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-blue-500/40 hover:bg-slate-800/30 group ${styles.card}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 2 • 25% Weight</div>
                        <h4 className="text-base font-extrabold group-hover:text-blue-400 transition-colors">Health Insurance</h4>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                      {result.combo.healthInsurance.marks1000} / 250 Pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {result.combo.healthInsurance.statusDesc}. Protects wealth against acute medical emergencies and hospitalization costs.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>View Insurance Defense &amp; Action Plan</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 3. Savings Score Card */}
                <div 
                  onClick={() => setActiveFactor('savings')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-emerald-500/40 hover:bg-slate-800/30 group ${styles.card}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 3 • 25% Weight</div>
                        <h4 className="text-base font-extrabold group-hover:text-emerald-400 transition-colors">Savings Score</h4>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                      {result.combo.savings.marks1000} / 250 Pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    Saving {result.metrics.savingsRatio}% of income ({currSym}{(result.metrics.monthlySavings || 0).toLocaleString()} / mo). Measures surplus generated for wealth compounding.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>View Savings Strategy &amp; Action Plan</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* 4. Debt Score Card */}
                <div 
                  onClick={() => setActiveFactor('debt')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:border-purple-500/40 hover:bg-slate-800/30 group ${styles.card}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Pillar 4 • 25% Weight</div>
                        <h4 className="text-base font-extrabold group-hover:text-purple-400 transition-colors">Debt Score</h4>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20">
                      {result.combo.debt.marks1000} / 250 Pts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {result.combo.debt.statusDesc}. EMI to income ratio is {result.metrics.emiToIncomeRatio}%. Lower burden frees capital for wealth building.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-400">
                    <span>View Debt Reduction &amp; Action Plan</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: 1. EMERGENCY FUND FACTOR */}
          {/* ------------------------------------------------------------- */}
          {activeFactor === 'emergency' && (
            <div className="space-y-6">
              {/* Factor Header Card */}
              <div className={`p-5 rounded-2xl border ${styles.card}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-2xl ${isEmergencyFundActive ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'}`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          Pillar 1 of 4 • 25% Weight
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isEmergencyFundActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {isEmergencyFundActive ? 'STATUS: ACTIVE (YES)' : 'STATUS: INACTIVE (NO - Mark: 0)'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black mt-1">Emergency Fund &amp; Liquidity Buffer</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Liquid reserves to survive unforeseen medical emergencies, job changes, or income shock without liquidating investments.
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:pl-4 border-slate-800">
                    <div className="text-[11px] text-slate-400 font-mono">Contributed Marks</div>
                    <div className="text-2xl font-mono font-black text-amber-400">
                      {result.combo.emergencyFund.marks1000} <span className="text-sm font-normal text-slate-400">/ 250 Pts</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Diagnostic: {result.combo.emergencyFund.score100}/100 • {result.combo.emergencyFund.marks25}/25
                    </div>
                  </div>
                </div>

                {/* Live YES / NO Toggle Test */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40 p-3.5 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Emergency Fund Availability:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      If set to NO, mark is immediately assigned as 0 out of 250 points.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleEmergencyFund && onToggleEmergencyFund(true)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        isEmergencyFundActive
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>YES (Active)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleEmergencyFund && onToggleEmergencyFund(false)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        !isEmergencyFundActive
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>NO (Mark: 0)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Exact Metrics & Diagnostic Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Liquid Buffer</div>
                  <div className="text-lg font-mono font-bold text-white mt-1">
                    {currSym}{(emergency?.currentEmergencySavings || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">In bank / liquid fund</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Cushion Needed</div>
                  <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                    {currSym}{(result.metrics.requiredEmergencyFund || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{emergency?.targetMonths || 6} months living costs</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buffer Available</div>
                  <div className="text-lg font-mono font-bold text-blue-400 mt-1">
                    {(result?.metrics?.emergencyMonthsAvailable ?? (emergency?.currentEmergencySavings && essentialExpenses ? (emergency.currentEmergencySavings / essentialExpenses).toFixed(1) : 0))} Months
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Recommended: 6.0 Months</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Funded Ratio</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                    {isEmergencyFundActive ? `${result.metrics.emergencyFundRatio}%` : '0%'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Benchmark: 100%</div>
                </div>
              </div>

              {/* Actionable Advice Section */}
              <div className={`p-5 rounded-2xl border ${styles.card} space-y-4`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Actionable Advice to Maximize Your Emergency Fund Score
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Automate Day-1 Salary Sweep into an Overnight/Liquid Fund</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">High Impact (+50-100 Pts)</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Schedule an automated recurring transfer of <strong>{currSym}{Math.round(monthlyIncome * 0.15).toLocaleString()}</strong> (15% of your income) into a dedicated High-Yield Savings Account or Instant-Redemption Liquid Mutual Fund on the 1st of every month until your cushion reaches <strong>{currSym}{(result.metrics.requiredEmergencyFund || 0).toLocaleString()}</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Keep Emergency Reserves Strictly Out of Volatile Equities &amp; Illiquid Real Estate</span>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Capital Preservation</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Never invest your emergency fund into stocks, crypto, or locked fixed deposits with heavy penalties. If an emergency strikes during a market correction, forced liquidation can lock in permanent capital losses. Keep 50% in bank sweep-in FDs and 50% in liquid mutual funds.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Adjust Cushion Based on Job Stability &amp; Dependents</span>
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Best Practice</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        If you are self-employed, work on contract/commission, or have elderly dependents, increase your target cushion from 6 months to <strong>9–12 months</strong> ({currSym}{Math.round(essentialExpenses * 9).toLocaleString()}–{currSym}{Math.round(essentialExpenses * 12).toLocaleString()}) to ensure uninterrupted peace of mind.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Emergency Buffer Simulator Slider */}
                <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      Simulate Score Impact: Adjust Buffer to {simulatedEmergencyMonths} Months
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      Projected Marks: {simEmergencyMarks1000} / 250 Pts ({simEmergencyMarks25} / 25)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.5"
                    value={simulatedEmergencyMonths}
                    onChange={(e) => setSimulatedEmergencyMonths(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0 Mos (0 Pts)</span>
                    <span>3 Mos (125 Pts)</span>
                    <span>6 Mos (250 Pts)</span>
                    <span>9-12 Mos (250 Pts Max)</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('emergency');
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>Configure Emergency Fund in Step 5</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: 2. HEALTH INSURANCE FACTOR */}
          {/* ------------------------------------------------------------- */}
          {activeFactor === 'insurance' && (
            <div className="space-y-6">
              {/* Factor Header Card */}
              <div className={`p-5 rounded-2xl border ${styles.card}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          Pillar 2 of 4 • 25% Weight
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400">
                          {result.combo.healthInsurance.score100 >= 80 ? 'EXCELLENT DEFENSE' : result.combo.healthInsurance.score100 >= 50 ? 'MODERATE DEFENSE' : 'NEEDS UPGRADE'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black mt-1">Health Insurance Defense</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Guards against devastating hospitalization bills, ICU costs, and lifestyle surgeries that could otherwise derail decades of wealth creation.
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:pl-4 border-slate-800">
                    <div className="text-[11px] text-slate-400 font-mono">Contributed Marks</div>
                    <div className="text-2xl font-mono font-black text-blue-400">
                      {result.combo.healthInsurance.marks1000} <span className="text-sm font-normal text-slate-400">/ 250 Pts</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Diagnostic: {result.combo.healthInsurance.score100}/100 • {result.combo.healthInsurance.marks25}/25
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Metrics & Status */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sum Insured Active</div>
                  <div className="text-lg font-mono font-bold text-white mt-1">
                    {currSym}{(insurance?.healthCoverage || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Hospitalization cover</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Benchmark</div>
                  <div className="text-lg font-mono font-bold text-blue-400 mt-1">
                    {currSym}{(1500000).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">₹15 Lakh family floater</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Family Protection</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                    {insurance?.isFamilyCovered ? 'Family Floater' : 'Individual'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{insurance?.hasPersonalHealthPolicy ? 'Private retail cover' : 'Needs retail policy'}</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corporate Reliance</div>
                  <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                    {insurance?.hasEmployerInsurance ? 'Has Employer' : 'Independent'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Retail policy recommended</div>
                </div>
              </div>

              {/* Actionable Advice Section */}
              <div className={`p-5 rounded-2xl border ${styles.card} space-y-4`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Actionable Advice to Maximize Your Insurance Health Score
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>The 1-2 Combo: Pair a ₹5L Base Plan with a ₹25L Super Top-Up</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">High Value / Low Cost</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Rather than buying an expensive ₹30 Lakh base retail plan, purchase a <strong>₹5 Lakh base policy</strong> and stack an <strong>independent ₹25 Lakh Super Top-Up policy</strong> with a ₹5 Lakh deductible. This delivers ₹30 Lakhs total coverage for a family floater at 50%–60% lower annual premium (~₹450/month).
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Never Rely Exclusively on Corporate Employer Coverage</span>
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Critical Vulnerability</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Employer health policies end the day you change jobs, resign, or face corporate downsizing. Purchasing personal health insurance when you are older or already have pre-existing illnesses becomes difficult and costly due to medical checkups and waiting periods.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Verify Restoration Benefit &amp; No-Claim Bonus (NCB)</span>
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Policy Feature</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Choose health policies with 100% automatic sum restoration (recharging your limit if exhausted in the same policy year) and cumulative NCB boosters that expand your cover up to 100% without extra premium for claim-free years.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('insurance');
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>Configure Insurance Defense in Step 4</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: 3. SAVINGS SCORE FACTOR */}
          {/* ------------------------------------------------------------- */}
          {activeFactor === 'savings' && (
            <div className="space-y-6">
              {/* Factor Header Card */}
              <div className={`p-5 rounded-2xl border ${styles.card}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Pillar 3 of 4 • 25% Weight
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                          SAVINGS RATIO: {result.metrics.savingsRatio}%
                        </span>
                      </div>
                      <h3 className="text-xl font-black mt-1">Monthly Savings Rate &amp; Cash Surplus</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        The surplus engine that fuels investment growth, retirement freedom, and milestone compounding.
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:pl-4 border-slate-800">
                    <div className="text-[11px] text-slate-400 font-mono">Contributed Marks</div>
                    <div className="text-2xl font-mono font-black text-emerald-400">
                      {result.combo.savings.marks1000} <span className="text-sm font-normal text-slate-400">/ 250 Pts</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Diagnostic: {result.combo.savings.score100}/100 • {result.combo.savings.marks25}/25
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Breakdown Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Net Income</div>
                  <div className="text-lg font-mono font-bold text-white mt-1">
                    {currSym}{(monthlyIncome || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Take-home earnings</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Living Costs</div>
                  <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                    {currSym}{(result.metrics.totalExpenses || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Essential + Discretionary</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Saved Surplus</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                    {currSym}{(result.metrics.monthlySavings || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Available for SIP / Wealth</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Savings Rate</div>
                  <div className="text-lg font-mono font-bold text-blue-400 mt-1">
                    {result.metrics.savingsRatio}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Target: 30%+ for Max Score</div>
                </div>
              </div>

              {/* Actionable Advice Section */}
              <div className={`p-5 rounded-2xl border ${styles.card} space-y-4`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Actionable Advice to Boost Your Savings Score
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Adopt the Golden "Pay Yourself First" Principle</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Core Habit</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Never save "what is left after spending." Instead, automate an SIP transfer of at least <strong>{currSym}{Math.round(monthlyIncome * 0.25).toLocaleString()}</strong> (25%) on the very day your salary hits your account. Spend only whatever remains.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Prune Discretionary Subscriptions &amp; Lifestyle Leakage</span>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Quick Win (+20 Pts)</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Currently, your discretionary expenses stand at <strong>{currSym}{(result.metrics.discretionaryExpenses || 0).toLocaleString()}</strong> ({Math.round(((result.metrics.discretionaryExpenses || 0) / monthlyIncome) * 100)}% of income). Trimming just 10% in unused OTT subscriptions, frequent deliveries, or impulsive dining frees up <strong>{currSym}{Math.round((result.metrics.discretionaryExpenses || 0) * 0.1).toLocaleString()}/month</strong> directly into savings.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Implement a 10% Step-Up SIP Annually</span>
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Compounding Power</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Whenever your salary increases through an annual appraisal or promotion, direct 50% of the raise into your monthly savings SIP before adjusting your lifestyle upward.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Savings Rate Simulator */}
                <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      Simulate Score Impact: Adjust Savings Rate to {simulatedSavingsRate}%
                    </span>
                    <span className="font-mono text-emerald-400 font-bold">
                      Projected Marks: {simSavingsMarks1000} / 250 Pts ({simSavingsMarks25} / 25)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={simulatedSavingsRate}
                    onChange={(e) => setSimulatedSavingsRate(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>10% (83 Pts)</span>
                    <span>20% (167 Pts)</span>
                    <span>30% (250 Pts Max)</span>
                    <span>40%+ (250 Pts Max)</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('income');
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>Adjust Income &amp; Expenses in Step 1 &amp; 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: 4. DEBT SCORE FACTOR */}
          {/* ------------------------------------------------------------- */}
          {activeFactor === 'debt' && (
            <div className="space-y-6">
              {/* Factor Header Card */}
              <div className={`p-5 rounded-2xl border ${styles.card}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                          Pillar 4 of 4 • 25% Weight
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          currentEmiRatio <= 30 ? 'bg-emerald-500/15 text-emerald-400' : currentEmiRatio <= 45 ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          EMI RATIO: {currentEmiRatio}% OF INCOME
                        </span>
                      </div>
                      <h3 className="text-xl font-black mt-1">Debt Management &amp; EMI Burden</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Measures your total debt liabilities, EMI cashflow drain, and leverage safety relative to monthly earnings.
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:pl-4 border-slate-800">
                    <div className="text-[11px] text-slate-400 font-mono">Contributed Marks</div>
                    <div className="text-2xl font-mono font-black text-purple-400">
                      {result.combo.debt.marks1000} <span className="text-sm font-normal text-slate-400">/ 250 Pts</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Diagnostic: {result.combo.debt.score100}/100 • {result.combo.debt.marks25}/25
                    </div>
                  </div>
                </div>
              </div>

              {/* Debt Metrics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active Debt</div>
                  <div className="text-lg font-mono font-bold text-white mt-1">
                    {currSym}{(result.metrics.totalDebt || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{loans?.length || 0} active loans</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Monthly EMI</div>
                  <div className="text-lg font-mono font-bold text-purple-400 mt-1">
                    {currSym}{(totalEmi || 0).toLocaleString()} / mo
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Monthly cash outflow</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EMI-To-Income Ratio</div>
                  <div className="text-lg font-mono font-bold text-blue-400 mt-1">
                    {currentEmiRatio}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Safe ceiling: &lt; 35%</div>
                </div>
                <div className={`p-3.5 rounded-2xl border text-center ${styles.inner}`}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Debt Status</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                    {result.combo.debt.score100 >= 80 ? 'Healthy' : result.combo.debt.score100 >= 60 ? 'Manageable' : 'High Leverage'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Diagnostic rating</div>
                </div>
              </div>

              {/* Actionable Advice Section */}
              <div className={`p-5 rounded-2xl border ${styles.card} space-y-4`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Actionable Advice to Maximize Your Debt Score
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Execute the Debt Avalanche (Target Highest APR First)</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Highest Savings</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        List all active loans by interest rate. Keep paying mandatory minimum EMIs on low-cost loans (e.g. home loan at 8.5%), but channel every extra rupee of surplus towards high-cost unsecured debt (credit card balances at 36%–42% APR or personal loans at 12%–16% APR).
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>The 1 Extra EMI / Year Prepayment Acceleration</span>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Tenure Reducer</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Paying just <strong>1 additional EMI per year</strong> or adding 5% to your principal repayment every year on long-term loans cuts your loan repayment timeline by nearly 4 to 6 years and saves hundreds of thousands in compound interest.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Strictly Maintain Total EMI Outflows Under 35% of Monthly Income</span>
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Golden Rule</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Total monthly debt payments should never exceed 35% ({currSym}{Math.round(monthlyIncome * 0.35).toLocaleString()}). If your ratio crosses 45%, banks label you as 'high-risk' and emergency shock resistance drops drastically.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prepayment & EMI Reduction Simulator */}
                <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      Simulate Score Impact: Reduce Monthly EMI by {currSym}{simulatedEmiReduction.toLocaleString()}
                    </span>
                    <span className="font-mono text-purple-400 font-bold">
                      Projected Marks: {simDebtMarks1000} / 250 Pts ({simDebtMarks25} / 25)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(10000, totalEmi)}
                    step="1000"
                    value={simulatedEmiReduction}
                    onChange={(e) => setSimulatedEmiReduction(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Current EMI ({currentEmiRatio}%)</span>
                    <span>New EMI: {currSym}{simNewEmi.toLocaleString()} ({simNewEmiRatio}%)</span>
                    <span>Debt Free (100/100)</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('debt');
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>Manage Debt &amp; Loans in Step 3</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: 5. FUTURE GOALS READINESS */}
          {/* ------------------------------------------------------------- */}
          {activeFactor === 'goals' && (
            <div className="space-y-6">
              {/* Factor Header Card */}
              <div className={`p-5 rounded-2xl border ${styles.card}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400">
                      <Target className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          Future Milestones &amp; Long-Term Wealth
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-400">
                          SCORE: {result.scores.futureGoals} / 100
                        </span>
                      </div>
                      <h3 className="text-xl font-black mt-1">Future Goals &amp; Retirement Readiness</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Evaluates whether your monthly savings and investment rate can fund your life milestones (Home, Child Education, Retirement, Car).
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:pl-4 border-slate-800">
                    <div className="text-[11px] text-slate-400 font-mono">Monthly Goal Target</div>
                    <div className="text-2xl font-mono font-black text-indigo-400">
                      {currSym}{(result.metrics.totalGoalRequiredMonthlySavings || 0).toLocaleString()} <span className="text-sm font-normal text-slate-400">/ mo</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400">
                      Surplus: {currSym}{(result.metrics.monthlySavings || 0).toLocaleString()} / mo
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Advice Section */}
              <div className={`p-5 rounded-2xl border ${styles.card} space-y-4`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Actionable Advice for Goal Readiness
                  </h4>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Tag Specific Investment Portfolios to Specific Milestones</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Asset Allocation</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Never pool all investments into one vague basket. For goals &gt; 5 years away (Retirement, Higher Education), allocate 70%+ to Equity SIPs. For goals &lt; 3 years away (Car down payment, Wedding), use Arbitrage or Short-Duration Debt funds to prevent capital drawdown.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Account for Inflation (7%–10% per year)</span>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Realistic Targets</span>
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Education and healthcare inflate at 8%–10% annually. A college course that costs ₹10 Lakhs today will cost ~₹21 Lakhs in 8 years. Adjust target goal amounts upwards to maintain real purchasing power.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateTab('goals');
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <span>Manage Future Goals in Step 7</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className={`p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3 ${styles.modal} ${styles.headerBorder}`}>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>FinScore™ calculations use dynamic 25% combo weights with instant 0-mark penalty for unmaintained emergency funds.</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors shadow-md"
          >
            Done Reading
          </button>
        </div>
      </div>
    </div>
  );
};

