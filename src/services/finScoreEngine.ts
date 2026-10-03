import {
  FinScoreProfile,
  FinScoreIncomeSource,
  FinScoreExpenseCategory,
  FinancialPriorityLevel,
  FinScoreLoan,
  FinScoreInsurance,
  FinScoreEmergency,
  FinScoreGoal,
  FinScoreResult,
  FinScoreAlert,
  FinScoreAdminRuleConfig,
  FinScoreHistoryPoint
} from '../types';

export const DEFAULT_ADMIN_CONFIG: FinScoreAdminRuleConfig = {
  weights: {
    savings: 15,
    expenseManagement: 15,
    debt: 20,
    emergencyFund: 20,
    insurance: 15,
    futureGoals: 15,
  },
  emergencyTargetMonthsDefault: 6,
  maxHealthyEmiRatio: 40, // 40% EMI-to-income
  lifeInsuranceAnnualIncomeMultiplier: 12, // 12x annual income
};

export const EMPTY_FINSCORE_PROFILE: FinScoreProfile = {
  name: '',
  age: 0,
  monthlyIncome: 0,
  occupation: '',
  dependents: 0,
  currency: 'INR',
};

export const EMPTY_FINSCORE_EXPENSES: FinScoreExpenseCategory[] = [
  { id: 'exp-1', category: 'Rent & Housing', amount: 0, isEssential: true },
  { id: 'exp-2', category: 'Food & Groceries', amount: 0, isEssential: true },
  { id: 'exp-3', category: 'Transport & Commute', amount: 0, isEssential: true },
  { id: 'exp-4', category: 'Loan EMIs', amount: 0, isEssential: true },
  { id: 'exp-5', category: 'Utilities & Bills', amount: 0, isEssential: true },
  { id: 'exp-6', category: 'Dining & Entertainment', amount: 0, isEssential: false },
  { id: 'exp-7', category: 'Other Expenses', amount: 0, isEssential: false },
];

export const EMPTY_FINSCORE_LOANS: FinScoreLoan[] = [];

export const EMPTY_FINSCORE_INSURANCE: FinScoreInsurance = {
  hasLifeInsurance: false,
  lifeCoverage: 0,
  hasTermInsurance: false,
  termCoverage: 0,
  hasHealthInsurance: false,
  healthCoverage: 0,
  isFamilyCovered: false,
  hasEmployerInsurance: false,
  hasPersonalHealthPolicy: false,
};

export const EMPTY_FINSCORE_EMERGENCY: FinScoreEmergency = {
  targetMonths: 6,
  currentEmergencySavings: 0,
};

export const EMPTY_FINSCORE_GOALS: FinScoreGoal[] = [];

export const EMPTY_FINSCORE_INCOMES: FinScoreIncomeSource[] = [];

export const INITIAL_FINSCORE_INCOMES: FinScoreIncomeSource[] = [
  { id: 'inc-1', source: 'Primary Job / Salary', amount: 42000, priority: 'essential', isEssential: true },
  { id: 'inc-2', source: 'Secondary / Freelance / Retainer', amount: 5000, priority: 'moderate', isEssential: false },
  { id: 'inc-3', source: 'Dividends & Interest Inflow', amount: 3000, priority: 'discretionary', isEssential: false },
];

export const INITIAL_FINSCORE_PROFILE: FinScoreProfile = {
  name: 'Sudharsan',
  age: 28,
  monthlyIncome: 50000,
  occupation: 'Software Engineer',
  dependents: 2,
  currency: 'INR',
};

export const INITIAL_FINSCORE_EXPENSES: FinScoreExpenseCategory[] = [
  { id: 'exp-1', category: 'Rent & Housing', amount: 10000, isEssential: true, priority: 'essential' },
  { id: 'exp-2', category: 'Food & Groceries', amount: 7000, isEssential: true, priority: 'essential' },
  { id: 'exp-3', category: 'Transport & Commute', amount: 3000, isEssential: false, priority: 'moderate' },
  { id: 'exp-4', category: 'Loan EMIs', amount: 8000, isEssential: true, priority: 'essential' },
  { id: 'exp-5', category: 'Utilities & Bills', amount: 3000, isEssential: true, priority: 'essential' },
  { id: 'exp-6', category: 'Dining & Entertainment', amount: 2000, isEssential: false, priority: 'discretionary' },
  { id: 'exp-7', category: 'Other Expenses', amount: 5000, isEssential: false, priority: 'discretionary' },
];

export const INITIAL_FINSCORE_LOANS: FinScoreLoan[] = [
  {
    id: 'loan-1',
    type: 'Personal Loan',
    outstandingAmount: 240000,
    monthlyEmi: 8000,
    interestRate: 12.5,
    remainingTenureMonths: 36,
  },
];

export const INITIAL_FINSCORE_INSURANCE: FinScoreInsurance = {
  hasLifeInsurance: true,
  lifeCoverage: 3000000, // ₹30 Lakh
  hasTermInsurance: true,
  termCoverage: 3000000,
  hasHealthInsurance: true,
  healthCoverage: 500000, // ₹5 Lakh
  isFamilyCovered: true,
  hasEmployerInsurance: true,
  hasPersonalHealthPolicy: false, // Relies on employer!
};

export const INITIAL_FINSCORE_EMERGENCY: FinScoreEmergency = {
  targetMonths: 6,
  currentEmergencySavings: 80000,
};

export const INITIAL_FINSCORE_GOALS: FinScoreGoal[] = [
  {
    id: 'goal-1',
    name: 'Buy Car',
    category: 'Car',
    targetAmount: 800000,
    currentSavings: 150000,
    targetYear: 2030,
    tenureYears: 4,
    expectedReturnRate: 10,
  },
  {
    id: 'goal-2',
    name: 'House Downpayment',
    category: 'House',
    targetAmount: 1500000,
    currentSavings: 300000,
    targetYear: 2032,
    tenureYears: 6,
    expectedReturnRate: 11,
  },
  {
    id: 'goal-3',
    name: 'Higher Education / Skills',
    category: 'Higher Education',
    targetAmount: 300000,
    currentSavings: 120000,
    targetYear: 2028,
    tenureYears: 2,
    expectedReturnRate: 8,
  },
];

export const INITIAL_FINSCORE_HISTORY: FinScoreHistoryPoint[] = [
  { month: 'January', year: 2026, overallScore: 52, savingsScore: 55, debtScore: 48, emergencyScore: 35, insuranceScore: 60, goalScore: 58 },
  { month: 'February', year: 2026, overallScore: 58, savingsScore: 62, debtScore: 52, emergencyScore: 42, insuranceScore: 65, goalScore: 62 },
  { month: 'March', year: 2026, overallScore: 63, savingsScore: 68, debtScore: 58, emergencyScore: 46, insuranceScore: 70, goalScore: 65 },
  { month: 'April', year: 2026, overallScore: 70, savingsScore: 78, debtScore: 65, emergencyScore: 53, insuranceScore: 72, goalScore: 70 },
  { month: 'May (Current)', year: 2026, overallScore: 74, savingsScore: 82, debtScore: 68, emergencyScore: 58, insuranceScore: 75, goalScore: 74 },
];

/**
 * Calculates Required Monthly Saving to reach a Goal by targetYear with expected annual return
 */
export function calculateRequiredMonthlySaving(
  targetAmount: number,
  currentSavings: number,
  targetYear: number,
  expectedReturnRate: number = 9,
  tenureYears?: number
): number {
  const currentYear = new Date().getFullYear();
  const yearsLeft = (tenureYears && tenureYears > 0) ? tenureYears : Math.max(1, targetYear - currentYear);
  const monthsLeft = Math.max(1, Math.round(yearsLeft * 12));

  // Future value of existing savings
  const monthlyRate = expectedReturnRate / 100 / 12;
  const fvCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, monthsLeft);
  const remainingNeeded = Math.max(0, targetAmount - fvCurrentSavings);

  if (remainingNeeded <= 0) return 0;
  if (monthlyRate === 0) return Math.round(remainingNeeded / monthsLeft);

  // SIP formula: PMT = FV * r / ((1 + r)^n - 1)
  const pmt = (remainingNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, monthsLeft) - 1);
  return Math.round(pmt);
}

/**
 * Core Financial Scoring Engine:
 * Combines Profile, Expenses, Debt, Insurance, Emergency, and Goals into comprehensive diagnostics.
 */
export function calculateFinScore(
  profile: FinScoreProfile,
  expenses: FinScoreExpenseCategory[],
  loans: FinScoreLoan[],
  insurance: FinScoreInsurance,
  emergency: FinScoreEmergency,
  goals: FinScoreGoal[],
  adminConfig: FinScoreAdminRuleConfig = DEFAULT_ADMIN_CONFIG
): FinScoreResult {
  // If profile is completely cleared (no income set)
  if (!profile.monthlyIncome || profile.monthlyIncome <= 0) {
    return {
      overallScore: 0,
      grade: 'Needs Attention',
      gradeColor: 'text-slate-400 bg-slate-500/15 border-slate-500/30',
      summaryDiagnosis: 'Financial information has been cleared. Enter your monthly income and expenses to calculate your personalized Financial Health Score.',
      biggestPriority: 'Add your monthly net income and family profile in Step 1 to diagnose your financial health.',
      scores: {
        savings: 0,
        expenseManagement: 0,
        debt: 0,
        emergencyFund: 0,
        insurance: 0,
        futureGoals: 0,
      },
      metrics: {
        monthlyIncome: 0,
        totalExpenses: 0,
        essentialExpenses: 0,
        discretionaryExpenses: 0,
        monthlySavings: 0,
        savingsRatio: 0,
        totalDebt: 0,
        totalMonthlyEmi: 0,
        emiToIncomeRatio: 0,
        requiredEmergencyFund: 0,
        emergencyShortfall: 0,
        emergencyFundRatio: 0,
        recommendedLifeCoverage: 0,
        lifeCoverageShortfall: 0,
        lifeCoverageMultiplier: 0,
        emergencyMonthsAvailable: 0,
        totalGoalRequiredMonthlySavings: 0,
      },
      monthlyActionPlan: [
        {
          monthNumber: 1,
          monthName: 'Step 1: Enter Profile & Income',
          focus: 'Input your baseline monthly earnings and family dependents',
          tasks: [
            'Click "Add Data to Profile" or visit Step 1 to enter your income and occupation',
            'Record your core living expenses (rent, food, utilities)',
            'Specify whether you have any active loan EMIs or credit card balances',
          ],
        },
      ],
      alerts: [
        {
          id: 'alert-empty-profile',
          type: 'savings',
          severity: 'info',
          title: 'Financial Profile is Cleared',
          message: 'All information is currently cleared. Click "Add Data to Profile" or use the quick fill presets to start calculating your FinScore.',
          actionRecommendation: 'Enter your monthly income to generate customized health diagnostics.',
        },
      ],
    };
  }

  const income = Math.max(1, profile.monthlyIncome);

  // 1. Income & Expense Analysis
  const totalExpenses = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const essentialExpenses = expenses
    .filter(e => e.priority === 'essential' || (e.priority === undefined && e.isEssential))
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const moderateExpenses = expenses
    .filter(e => e.priority === 'moderate')
    .reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const discretionaryExpenses = Math.max(0, totalExpenses - essentialExpenses - moderateExpenses);

  const monthlySavings = income - totalExpenses;
  const savingsRatio = Math.round(((monthlySavings > 0 ? monthlySavings : 0) / income) * 100);

  // Savings Score (0-100)
  // Benchmark: >= 30% savings is 100, 20-30% is 80-95, 10-20% is 50-75, <10% is <40
  let savingsScore = 0;
  if (savingsRatio >= 35) savingsScore = 100;
  else if (savingsRatio >= 25) savingsScore = 80 + ((savingsRatio - 25) / 10) * 20;
  else if (savingsRatio >= 15) savingsScore = 60 + ((savingsRatio - 15) / 10) * 20;
  else if (savingsRatio > 0) savingsScore = 20 + (savingsRatio / 15) * 40;
  else savingsScore = Math.max(0, 20 + (monthlySavings / income) * 20);
  savingsScore = Math.min(100, Math.max(0, Math.round(savingsScore)));

  // Expense Management Score (0-100)
  // Ideal: Total expenses <= 70% of income, essential expenses <= 50%
  const expenseRatio = (totalExpenses / income) * 100;
  let expenseManagementScore = 0;
  if (expenseRatio <= 50) expenseManagementScore = 100;
  else if (expenseRatio <= 70) expenseManagementScore = 85 + ((70 - expenseRatio) / 20) * 15;
  else if (expenseRatio <= 85) expenseManagementScore = 60 + ((85 - expenseRatio) / 15) * 25;
  else if (expenseRatio <= 100) expenseManagementScore = 30 + ((100 - expenseRatio) / 15) * 30;
  else expenseManagementScore = Math.max(5, 30 - ((expenseRatio - 100) / 20) * 25);
  expenseManagementScore = Math.min(100, Math.max(0, Math.round(expenseManagementScore)));

  // 2. Loan / Debt Score
  const totalDebt = loans.reduce((acc, l) => acc + (Number(l.outstandingAmount) || 0), 0);
  const totalMonthlyEmi = loans.reduce((acc, l) => acc + (Number(l.monthlyEmi) || 0), 0);
  const emiToIncomeRatio = Math.round((totalMonthlyEmi / income) * 100);

  // EMI burden score: 0% EMI -> 100, <20% -> 90-99, 20-35% -> 70-89, 35-50% -> 40-69, >50% -> <35
  let debtScore = 100;
  if (!loans || loans.length === 0 || totalMonthlyEmi === 0) {
    debtScore = 100;
  } else if (emiToIncomeRatio <= 15) {
    debtScore = 95 - (emiToIncomeRatio / 15) * 10;
  } else if (emiToIncomeRatio <= 30) {
    debtScore = 85 - ((emiToIncomeRatio - 15) / 15) * 15;
  } else if (emiToIncomeRatio <= 45) {
    debtScore = 70 - ((emiToIncomeRatio - 30) / 15) * 25;
  } else if (emiToIncomeRatio <= 60) {
    debtScore = 45 - ((emiToIncomeRatio - 45) / 15) * 25;
  } else {
    debtScore = Math.max(5, 20 - ((emiToIncomeRatio - 60) / 20) * 15);
  }
  // Penalize high interest loans (>15%)
  const hasHighInterestLoan = loans.some(l => l.interestRate >= 15);
  if (hasHighInterestLoan) {
    debtScore = Math.max(10, debtScore - 12);
  }
  debtScore = Math.min(100, Math.max(0, Math.round(debtScore)));

  // 3. Emergency Fund Score
  const targetMonths = emergency.targetMonths || adminConfig.emergencyTargetMonthsDefault;
  // Essential monthly baseline: essential expenses + EMI
  const monthlyEssentialBasis = Math.max(5000, essentialExpenses);
  const requiredEmergencyFund = monthlyEssentialBasis * targetMonths;
  const currentEmergencySavings = emergency.currentEmergencySavings || 0;
  const emergencyFundRatio = Math.round((currentEmergencySavings / (requiredEmergencyFund || 1)) * 100);
  const emergencyShortfall = Math.max(0, requiredEmergencyFund - currentEmergencySavings);

  let emergencyFundScore = Math.min(100, emergencyFundRatio);
  if (emergencyFundRatio >= 100) emergencyFundScore = 100;
  else if (emergencyFundRatio >= 80) emergencyFundScore = 85 + ((emergencyFundRatio - 80) / 20) * 15;
  else if (emergencyFundRatio >= 50) emergencyFundScore = 55 + ((emergencyFundRatio - 50) / 30) * 30;
  else emergencyFundScore = Math.max(5, (emergencyFundRatio / 50) * 55);
  emergencyFundScore = Math.min(100, Math.max(0, Math.round(emergencyFundScore)));

  // 4. Insurance Score
  // Recommended life cover: ~10x to 15x annual income + total outstanding debt
  const annualIncome = income * 12;
  const multiplier = adminConfig.lifeInsuranceAnnualIncomeMultiplier;
  const recommendedLifeCoverage = profile.dependents > 0
    ? (annualIncome * multiplier) + totalDebt
    : (annualIncome * 5) + totalDebt;

  const totalLifeCoverage = Math.max(
    insurance.lifeCoverage || 0,
    insurance.termCoverage || 0
  );
  const lifeCoverageShortfall = Math.max(0, recommendedLifeCoverage - totalLifeCoverage);
  const lifeCoverRatio = totalLifeCoverage / (recommendedLifeCoverage || 1);

  // Health insurance adequacy: Recommended min ₹5-10 Lakh / $50k+
  const minRecommendedHealth = profile.currency === 'INR' ? 500000 : 50000;
  const healthRatio = (insurance.healthCoverage || 0) / minRecommendedHealth;

  let insuranceScore = 0;
  // Life / Term weight: 55%, Health weight: 45%
  let lifeScore = 0;
  if (!profile.dependents || profile.dependents === 0) {
    lifeScore = 85; // Less critical if no dependents
  } else {
    if (insurance.hasTermInsurance && lifeCoverRatio >= 1.0) lifeScore = 100;
    else if (lifeCoverRatio >= 0.75) lifeScore = 80 + (lifeCoverRatio - 0.75) * 80;
    else if (lifeCoverRatio >= 0.4) lifeScore = 50 + ((lifeCoverRatio - 0.4) / 0.35) * 30;
    else if (totalLifeCoverage > 0) lifeScore = 25 + (lifeCoverRatio / 0.4) * 25;
    else lifeScore = 10;
  }

  let healthScore = 0;
  if (insurance.hasHealthInsurance && (insurance.healthCoverage || 0) >= minRecommendedHealth) {
    healthScore = 85;
    if (insurance.hasPersonalHealthPolicy) healthScore += 15; // Independent from employer
    else healthScore += 5;
  } else if (insurance.hasHealthInsurance) {
    healthScore = 50 + Math.min(35, healthRatio * 35);
  } else {
    healthScore = 10;
  }

  insuranceScore = Math.min(100, Math.max(0, Math.round(lifeScore * 0.55 + healthScore * 0.45)));

  // 5. Future Goals Score
  let totalGoalRequiredMonthlySavings = 0;
  let totalGoalCurrentSavings = 0;
  let totalGoalTargetAmount = 0;

  goals.forEach(g => {
    totalGoalCurrentSavings += Number(g.currentSavings) || 0;
    totalGoalTargetAmount += Number(g.targetAmount) || 0;
    const req = calculateRequiredMonthlySaving(
      g.targetAmount,
      g.currentSavings,
      g.targetYear,
      g.expectedReturnRate || 9,
      g.tenureYears
    );
    totalGoalRequiredMonthlySavings += req;
  });

  const availableSurplus = Math.max(0, monthlySavings);
  let goalCoverageRatio = 0;
  if (totalGoalRequiredMonthlySavings === 0) {
    goalCoverageRatio = 100;
  } else {
    goalCoverageRatio = Math.min(150, (availableSurplus / totalGoalRequiredMonthlySavings) * 100);
  }

  let futureGoalsScore = 70;
  if (!goals || goals.length === 0) {
    futureGoalsScore = 60; // Needs to define goals
  } else {
    const overallSavingsProgress = totalGoalTargetAmount > 0
      ? (totalGoalCurrentSavings / totalGoalTargetAmount) * 100
      : 50;
    futureGoalsScore = Math.min(100, Math.round(goalCoverageRatio * 0.6 + overallSavingsProgress * 0.4));
  }
  futureGoalsScore = Math.min(100, Math.max(10, futureGoalsScore));

  // 6. Overall Financial Health Score (Weighted Composite)
  const w = adminConfig.weights;
  const totalWeight = w.savings + w.expenseManagement + w.debt + w.emergencyFund + w.insurance + w.futureGoals;
  
  const overallScore = Math.round(
    (savingsScore * w.savings +
      expenseManagementScore * w.expenseManagement +
      debtScore * w.debt +
      emergencyFundScore * w.emergencyFund +
      insuranceScore * w.insurance +
      futureGoalsScore * w.futureGoals) /
      (totalWeight || 100)
  );

  // Grade classification
  let grade: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Good';
  let gradeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  if (overallScore >= 80) {
    grade = 'Excellent';
    gradeColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  } else if (overallScore >= 65) {
    grade = 'Good';
    gradeColor = 'text-blue-400 bg-blue-500/15 border-blue-500/30';
  } else if (overallScore >= 50) {
    grade = 'Fair';
    gradeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  } else {
    grade = 'Needs Attention';
    gradeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  }

  // Summary diagnosis synthesis
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (savingsScore >= 75) strengths.push('savings');
  else weaknesses.push('savings rate');

  if (expenseManagementScore >= 75) strengths.push('expense management');
  else weaknesses.push('expense discipline');

  if (debtScore >= 75) strengths.push('healthy debt level');
  else weaknesses.push('debt / EMI burden');

  if (emergencyFundScore >= 70) strengths.push('emergency fund readiness');
  else weaknesses.push('emergency fund');

  if (insuranceScore >= 70) strengths.push('insurance protection');
  else weaknesses.push('insurance coverage');

  if (futureGoalsScore >= 70) strengths.push('future goals planning');
  else weaknesses.push('goal funding progress');

  let summaryDiagnosis = '';
  if (strengths.length > 0 && weaknesses.length > 0) {
    summaryDiagnosis = `Your ${strengths.slice(0, 2).join(' and ')} ${strengths.length > 1 ? 'are' : 'is'} strong, but your ${weaknesses.slice(0, 2).join(' and ')} need${weaknesses.length === 1 ? 's' : ''} priority improvement.`;
  } else if (weaknesses.length === 0) {
    summaryDiagnosis = `Outstanding financial health across savings, low debt, and robust emergency and insurance protection.`;
  } else {
    summaryDiagnosis = `Multiple areas including ${weaknesses.slice(0, 3).join(', ')} require structured rebalancing to secure your financial future.`;
  }

  // Biggest single priority determination
  let biggestPriority = 'Build your emergency fund before increasing discretionary spending.';
  if (emergencyFundScore < 60) {
    biggestPriority = 'Build your emergency fund before increasing discretionary spending or long-term risk.';
  } else if (debtScore < 60 || emiToIncomeRatio > 35) {
    biggestPriority = 'Accelerate high-interest debt repayment to free up monthly cash flow and lower EMI stress.';
  } else if (insuranceScore < 60) {
    biggestPriority = 'Review and secure adequate pure term life and comprehensive personal health insurance.';
  } else if (savingsScore < 60) {
    biggestPriority = 'Optimize recurring lifestyle expenses to elevate your monthly savings ratio to at least 25%.';
  } else {
    biggestPriority = 'Automate regular monthly contributions toward your 2030 and 2032 high-priority future goals.';
  }

  // 7. Dynamic Alert Generation
  const alerts: FinScoreAlert[] = [];

  // Emergency Alert
  if (emergencyFundScore < 60) {
    alerts.push({
      id: 'alert-emerg-1',
      type: 'emergency',
      severity: 'critical',
      title: '🚨 Emergency Fund Alert',
      message: `Your emergency savings are below the target ${targetMonths}-month buffer by approximately ₹${(Math.round(emergencyShortfall) || 0).toLocaleString()}.`,
      actionRecommendation: 'Channel at least 50% of your monthly surplus into a high-yield liquid emergency account.',
    });
  } else {
    alerts.push({
      id: 'alert-emerg-2',
      type: 'emergency',
      severity: 'positive',
      title: '🛡️ Emergency Fund Buffer Healthy',
      message: `You have ${Math.round((currentEmergencySavings / monthlyEssentialBasis) * 10) / 10} months of essential expenses safely saved.`,
    });
  }

  // Debt Alert
  if (emiToIncomeRatio > adminConfig.maxHealthyEmiRatio) {
    alerts.push({
      id: 'alert-debt-1',
      type: 'debt',
      severity: 'warning',
      title: '🟠 High Debt / EMI Alert',
      message: `Your monthly EMI commitments constitute ${emiToIncomeRatio}% of your monthly income (recommended ceiling is ${adminConfig.maxHealthyEmiRatio}%).`,
      actionRecommendation: 'Avoid taking any new credit cards or personal loans; prioritize high-interest debt prepayment.',
    });
  } else if (loans && loans.length > 0) {
    alerts.push({
      id: 'alert-debt-2',
      type: 'debt',
      severity: 'info',
      title: '💳 Debt Burden Controlled',
      message: `Your EMI ratio is ${emiToIncomeRatio}%, which is within a manageable financial boundary.`,
    });
  }

  // Insurance Alert
  if (!insurance.hasTermInsurance && profile.dependents > 0) {
    alerts.push({
      id: 'alert-ins-1',
      type: 'insurance',
      severity: 'warning',
      title: '🟡 Insurance Protection Alert',
      message: 'You have dependents but lack a pure term life insurance policy. Your family may be exposed to income disruption.',
      actionRecommendation: 'Explore an affordable pure term life plan covering at least 10x-15x annual income.',
    });
  } else if (!insurance.hasPersonalHealthPolicy && insurance.hasEmployerInsurance) {
    alerts.push({
      id: 'alert-ins-2',
      type: 'insurance',
      severity: 'info',
      title: '🏥 Health Insurance Notice',
      message: 'You currently rely exclusively on employer group health insurance. Consider a personal super-topup or family floater.',
    });
  }

  // Savings Alert
  if (savingsRatio >= 30) {
    alerts.push({
      id: 'alert-save-1',
      type: 'savings',
      severity: 'positive',
      title: '🟢 Savings Rate Alert',
      message: `Your monthly savings rate of ${savingsRatio}% is excellent and well above the recommended 20% benchmark.`,
    });
  } else if (savingsRatio < 15) {
    alerts.push({
      id: 'alert-save-2',
      type: 'savings',
      severity: 'warning',
      title: '📉 Low Savings Rate Warning',
      message: `Your current savings rate is only ${savingsRatio}% of income. Aim to progressively increase it toward 25%.`,
      actionRecommendation: 'Audit non-essential food delivery, streaming subscriptions, and discretionary impulse shopping.',
    });
  }

  // Goal Alert
  if (totalGoalRequiredMonthlySavings > availableSurplus && availableSurplus > 0) {
    alerts.push({
      id: 'alert-goal-1',
      type: 'goal',
      severity: 'info',
      title: '🔵 Goal Contribution Gap',
      message: `Your planned goals require ₹${(Math.round(totalGoalRequiredMonthlySavings) || 0).toLocaleString()}/mo, exceeding your current surplus of ₹${(Math.round(availableSurplus) || 0).toLocaleString()}/mo.`,
      actionRecommendation: 'Adjust target dates or prioritize high-impact milestones such as Car or House downpayment.',
    });
  }

  // 8. 3-Month Action Plan
  const monthlyActionPlan = [
    {
      monthNumber: 1,
      monthName: 'Month 1: Foundation & Defense',
      focus: 'Plug budget leaks & bootstrap emergency security',
      tasks: [
        `Reduce discretionary dining and entertainment expenses by ₹${(Math.min(2500, Math.round((discretionaryExpenses || 0) * 0.3))).toLocaleString()}`,
        `Direct ₹${(Math.min(10000, Math.max(2000, Math.round((monthlySavings || 0) * 0.6)))).toLocaleString()} specifically into your emergency fund liquid account`,
        hasHighInterestLoan ? 'List all outstanding loan interest rates and identify the highest APR for prepayment' : 'Verify auto-debit dates for EMIs to prevent late penalties',
      ],
    },
    {
      monthNumber: 2,
      monthName: 'Month 2: Cash Flow & Debt Acceleration',
      focus: 'Optimize debt payoff and establish insurance safety net',
      tasks: [
        'Continue allocating surplus toward your 6-month emergency fund milestone',
        (loans && loans.length > 0) ? 'Review loan terms and investigate if interest rate concession or debt refinancing is available' : 'Automate a fixed monthly transfer on the 1st of the month directly to savings',
        !insurance.hasPersonalHealthPolicy ? 'Obtain quotes for a baseline personal health floater or ₹15 Lakh super top-up policy' : 'Audit life insurance nominee declarations and policy documents',
      ],
    },
    {
      monthNumber: 3,
      monthName: 'Month 3: Wealth & Goal Acceleration',
      focus: 'Automate goal investments and review score gains',
      tasks: [
        `Set up recurring SIP investments for high-priority future goals (Car / House targets)`,
        'Perform a quarterly expense audit to ensure the savings ratio remains above 25%',
        'Re-calculate your FinScore to verify positive trajectory toward an 80+ Excellent score',
      ],
    },
  ];

  return {
    overallScore,
    grade,
    gradeColor,
    summaryDiagnosis,
    biggestPriority,
    scores: {
      savings: savingsScore,
      expenseManagement: expenseManagementScore,
      debt: debtScore,
      emergencyFund: emergencyFundScore,
      insurance: insuranceScore,
      futureGoals: futureGoalsScore,
    },
    metrics: {
      monthlyIncome: income,
      totalExpenses,
      essentialExpenses,
      discretionaryExpenses,
      monthlySavings,
      savingsRatio,
      totalDebt,
      totalMonthlyEmi,
      emiToIncomeRatio,
      requiredEmergencyFund,
      emergencyShortfall,
      emergencyFundRatio,
      recommendedLifeCoverage,
      lifeCoverageShortfall,
      lifeCoverageMultiplier: annualIncome > 0 ? Math.round((totalLifeCoverage / annualIncome) * 10) / 10 : 0,
      emergencyMonthsAvailable: monthlyEssentialBasis > 0 ? Math.round((currentEmergencySavings / monthlyEssentialBasis) * 10) / 10 : 0,
      totalGoalRequiredMonthlySavings,
    },
    monthlyActionPlan,
    alerts,
  };
}

/**
 * Generates sample student/cohort users for the Admin project team inspection module
 */
export function getAdminCohortStatistics(currentResult: FinScoreResult) {
  const sampleUsers = [
    { id: 'usr-1', name: 'Aakash Verma', age: 24, occupation: 'Junior Developer', income: 42000, score: 62, grade: 'Fair', emergencyFundMonths: 2.1, debtRatio: 28, risk: 'Moderate' },
    { id: 'usr-2', name: 'Priya Sharma', age: 29, occupation: 'Product Designer', income: 85000, score: 84, grade: 'Excellent', emergencyFundMonths: 7.2, debtRatio: 12, risk: 'Low' },
    { id: 'usr-3', name: 'Rohan Mehta', age: 32, occupation: 'Marketing Lead', income: 95000, score: 58, grade: 'Fair', emergencyFundMonths: 3.4, debtRatio: 46, risk: 'High Debt' },
    { id: 'usr-4', name: 'Neha Gupta', age: 26, occupation: 'Data Analyst', income: 55000, score: 71, grade: 'Good', emergencyFundMonths: 5.0, debtRatio: 18, risk: 'Low' },
    { id: 'usr-5', name: 'Vikram Singh', age: 35, occupation: 'Consultant', income: 120000, score: 77, grade: 'Good', emergencyFundMonths: 6.5, debtRatio: 32, risk: 'Moderate' },
    { id: 'usr-6', name: 'Ananya Roy', age: 23, occupation: 'Content Specialist', income: 32000, score: 48, grade: 'Needs Attention', emergencyFundMonths: 1.2, debtRatio: 38, risk: 'High' },
    { id: 'usr-7', name: 'Kavita Nair', age: 31, occupation: 'HR Manager', income: 68000, score: 79, grade: 'Good', emergencyFundMonths: 6.0, debtRatio: 20, risk: 'Low' },
  ];

  const allScores = [...sampleUsers.map(u => u.score), currentResult.overallScore];
  const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  
  // Score distribution bands
  const distribution = [
    { band: 'Critical (<50)', count: allScores.filter(s => s < 50).length, fill: '#f43f5e' },
    { band: 'Fair (50-64)', count: allScores.filter(s => s >= 50 && s < 65).length, fill: '#f59e0b' },
    { band: 'Good (65-79)', count: allScores.filter(s => s >= 65 && s < 80).length, fill: '#3b82f6' },
    { band: 'Excellent (80+)', count: allScores.filter(s => s >= 80).length, fill: '#10b981' },
  ];

  return {
    totalRegisteredUsers: 142, // Simulated active project pool
    activeCohorts: 8,
    averageScore: avgScore,
    emergencyFundReadyPct: 44, // % of users with >= 6 months
    insuranceCoveredPct: 52, // % with adequate coverage
    avgSavingsRate: 26.4,
    distribution,
    sampleUsers,
  };
}
