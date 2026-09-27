import React from 'react';
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
  Clock
} from 'lucide-react';
import { FinScoreResult, FinScoreProfile } from '../../types';
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
        <div className="grid grid-cols-3 gap-3 text-center">
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
        <div className="border rounded-2xl overflow-hidden text-xs">
          <table className="w-full">
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
