/**
 * Deterministic Financial Calculations Library
 * Implements standard financial formulas for Indian & Global Wealth Management.
 * All functions are pure, deterministic, and free of external API/LLM calls.
 */

// ---------------------------------------------------------------------------
// 1. SIP (Systematic Investment Plan)
// ---------------------------------------------------------------------------
export interface SIPInput {
  monthlyInvestment: number;
  years: number;
  annualReturn: number;
}

export interface SIPResult {
  totalInvestment: number;
  estimatedReturns: number;
  maturityValue: number;
  trajectory: { year: number; invested: number; value: number; returns: number }[];
}

export function calculateSIP(input: SIPInput): SIPResult {
  const { monthlyInvestment, years, annualReturn } = input;
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualReturn / 12 / 100;

  let maturityValue = 0;
  if (monthlyRate === 0) {
    maturityValue = monthlyInvestment * months;
  } else {
    maturityValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);
  }

  const totalInvestment = monthlyInvestment * months;
  const estimatedReturns = Math.max(0, maturityValue - totalInvestment);

  // Generate yearly trajectory
  const trajectory: SIPResult['trajectory'] = [];
  const maxYears = Math.ceil(years);
  for (let y = 1; y <= maxYears; y++) {
    const m = Math.min(months, y * 12);
    const invested = monthlyInvestment * m;
    let val = 0;
    if (monthlyRate === 0) {
      val = invested;
    } else {
      val =
        monthlyInvestment *
        ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) *
        (1 + monthlyRate);
    }
    trajectory.push({
      year: y,
      invested: Math.round(invested),
      value: Math.round(val),
      returns: Math.round(Math.max(0, val - invested)),
    });
  }

  return {
    totalInvestment: Math.round(totalInvestment),
    estimatedReturns: Math.round(estimatedReturns),
    maturityValue: Math.round(maturityValue),
    trajectory,
  };
}

// ---------------------------------------------------------------------------
// 2. SWP (Systematic Withdrawal Plan)
// ---------------------------------------------------------------------------
export interface SWPInput {
  initialInvestment: number;
  monthlyWithdrawal: number;
  years: number;
  annualReturn: number;
}

export interface SWPResult {
  initialInvestment: number;
  totalWithdrawal: number;
  finalBalance: number;
  totalGrowth: number;
  isExhausted: boolean;
  exhaustionMonth?: number;
  trajectory: { year: number; balance: number; totalWithdrawn: number }[];
}

export function calculateSWP(input: SWPInput): SWPResult {
  const { initialInvestment, monthlyWithdrawal, years, annualReturn } = input;
  const totalMonths = Math.max(1, Math.round(years * 12));
  const monthlyRate = annualReturn / 12 / 100;

  let balance = initialInvestment;
  let totalWithdrawn = 0;
  let isExhausted = false;
  let exhaustionMonth: number | undefined;

  const trajectory: SWPResult['trajectory'] = [
    { year: 0, balance: Math.round(initialInvestment), totalWithdrawn: 0 },
  ];

  for (let m = 1; m <= totalMonths; m++) {
    if (balance > 0) {
      // Balance grows with monthly rate
      const growth = balance * monthlyRate;
      balance += growth;

      // Withdraw
      if (balance >= monthlyWithdrawal) {
        balance -= monthlyWithdrawal;
        totalWithdrawn += monthlyWithdrawal;
      } else {
        totalWithdrawn += balance;
        balance = 0;
        if (!isExhausted) {
          isExhausted = true;
          exhaustionMonth = m;
        }
      }
    } else {
      balance = 0;
      if (!isExhausted) {
        isExhausted = true;
        exhaustionMonth = m;
      }
    }

    // Capture yearly snapshot
    if (m % 12 === 0 || m === totalMonths) {
      trajectory.push({
        year: Math.round(m / 12),
        balance: Math.round(Math.max(0, balance)),
        totalWithdrawn: Math.round(totalWithdrawn),
      });
    }
  }

  // Never show negative balance
  const finalBalance = Math.max(0, Math.round(balance));
  const totalGrowth = Math.max(0, Math.round(finalBalance + totalWithdrawn - initialInvestment));

  return {
    initialInvestment: Math.round(initialInvestment),
    totalWithdrawal: Math.round(totalWithdrawn),
    finalBalance,
    totalGrowth,
    isExhausted,
    exhaustionMonth,
    trajectory,
  };
}

// ---------------------------------------------------------------------------
// 3. LUMPSUM (One-Time Investment)
// ---------------------------------------------------------------------------
export interface LumpsumInput {
  initialInvestment: number;
  years: number;
  annualReturn: number;
}

export interface LumpsumResult {
  initialInvestment: number;
  estimatedReturns: number;
  maturityValue: number;
  trajectory: { year: number; invested: number; value: number }[];
}

export function calculateLumpsum(input: LumpsumInput): LumpsumResult {
  const { initialInvestment, years, annualReturn } = input;
  const rate = annualReturn / 100;
  const maturityValue = initialInvestment * Math.pow(1 + rate, years);
  const estimatedReturns = Math.max(0, maturityValue - initialInvestment);

  const trajectory: LumpsumResult['trajectory'] = [];
  const maxYears = Math.ceil(years);
  for (let y = 0; y <= maxYears; y++) {
    const val = initialInvestment * Math.pow(1 + rate, y);
    trajectory.push({
      year: y,
      invested: Math.round(initialInvestment),
      value: Math.round(val),
    });
  }

  return {
    initialInvestment: Math.round(initialInvestment),
    estimatedReturns: Math.round(estimatedReturns),
    maturityValue: Math.round(maturityValue),
    trajectory,
  };
}

// ---------------------------------------------------------------------------
// 4. LOAN / EMI
// ---------------------------------------------------------------------------
export interface EMIInput {
  loanAmount: number;
  annualInterestRate: number;
  loanTenureYears: number;
}

export interface EMIResult {
  monthlyEMI: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  trajectory: { year: number; principalPaid: number; interestPaid: number; balance: number }[];
}

export function calculateEMI(input: EMIInput): EMIResult {
  const { loanAmount, annualInterestRate, loanTenureYears } = input;
  const months = Math.max(1, Math.round(loanTenureYears * 12));
  const monthlyRate = annualInterestRate / 12 / 100;

  let emi = 0;
  if (monthlyRate === 0) {
    emi = loanAmount / months;
  } else {
    emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalPayment = emi * months;
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  // Amortization trajectory
  const trajectory: EMIResult['trajectory'] = [];
  let currentBalance = loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let m = 1; m <= months; m++) {
    const interestForMonth = currentBalance * monthlyRate;
    const principalForMonth = Math.min(currentBalance, emi - interestForMonth);
    currentBalance = Math.max(0, currentBalance - principalForMonth);
    cumulativePrincipal += principalForMonth;
    cumulativeInterest += interestForMonth;

    if (m % 12 === 0 || m === months) {
      trajectory.push({
        year: Math.round(m / 12),
        principalPaid: Math.round(cumulativePrincipal),
        interestPaid: Math.round(cumulativeInterest),
        balance: Math.round(currentBalance),
      });
    }
  }

  return {
    monthlyEMI: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    principal: Math.round(loanAmount),
    trajectory,
  };
}

// ---------------------------------------------------------------------------
// 5. COMPOUND INTEREST
// ---------------------------------------------------------------------------
export interface CompoundInterestInput {
  principal: number;
  monthlyInvestment?: number;
  annualInterestRate: number;
  years: number;
}

export interface CompoundInterestResult {
  principal: number;
  totalContributions: number;
  estimatedReturns: number;
  finalAmount: number;
  trajectory: { year: number; contributions: number; finalAmount: number }[];
}

export function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const { principal, monthlyInvestment = 0, annualInterestRate, years } = input;
  const rate = annualInterestRate / 100;
  const monthlyRate = rate / 12;
  const months = Math.max(1, Math.round(years * 12));

  // Lump sum future value
  const fvLump = principal * Math.pow(1 + rate, years);

  // Monthly additions future value
  let fvMonthly = 0;
  if (monthlyInvestment > 0) {
    if (monthlyRate === 0) {
      fvMonthly = monthlyInvestment * months;
    } else {
      fvMonthly =
        monthlyInvestment *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);
    }
  }

  const finalAmount = fvLump + fvMonthly;
  const totalContributions = principal + monthlyInvestment * months;
  const estimatedReturns = Math.max(0, finalAmount - totalContributions);

  // Trajectory
  const trajectory: CompoundInterestResult['trajectory'] = [];
  const maxYears = Math.ceil(years);
  for (let y = 0; y <= maxYears; y++) {
    const lumpPart = principal * Math.pow(1 + rate, y);
    const mCount = y * 12;
    let monthlyPart = 0;
    if (monthlyInvestment > 0) {
      if (monthlyRate === 0) {
        monthlyPart = monthlyInvestment * mCount;
      } else {
        monthlyPart =
          monthlyInvestment *
          ((Math.pow(1 + monthlyRate, mCount) - 1) / monthlyRate) *
          (1 + monthlyRate);
      }
    }
    const val = lumpPart + monthlyPart;
    const contrib = principal + monthlyInvestment * mCount;
    trajectory.push({
      year: y,
      contributions: Math.round(contrib),
      finalAmount: Math.round(val),
    });
  }

  return {
    principal: Math.round(principal),
    totalContributions: Math.round(totalContributions),
    estimatedReturns: Math.round(estimatedReturns),
    finalAmount: Math.round(finalAmount),
    trajectory,
  };
}

// ---------------------------------------------------------------------------
// 6. INFLATION
// ---------------------------------------------------------------------------
export interface InflationInput {
  currentAmount: number;
  annualInflationRate: number;
  years: number;
}

export interface InflationResult {
  currentAmount: number;
  futureRequiredAmount: number;
  purchasingPower: number;
  inflationImpact: number;
  purchasingPowerLossPercent: number;
  trajectory: { year: number; futureCost: number; purchasingPower: number }[];
}

export function calculateInflation(input: InflationInput): InflationResult {
  const { currentAmount, annualInflationRate, years } = input;
  const rate = annualInflationRate / 100;

  const futureRequiredAmount = currentAmount * Math.pow(1 + rate, years);
  const purchasingPower = currentAmount / Math.pow(1 + rate, years);
  const inflationImpact = Math.max(0, futureRequiredAmount - currentAmount);
  const purchasingPowerLossPercent =
    currentAmount > 0
      ? Math.min(100, ((currentAmount - purchasingPower) / currentAmount) * 100)
      : 0;

  const trajectory: InflationResult['trajectory'] = [];
  const maxYears = Math.ceil(years);
  for (let y = 0; y <= maxYears; y++) {
    const fCost = currentAmount * Math.pow(1 + rate, y);
    const pPower = currentAmount / Math.pow(1 + rate, y);
    trajectory.push({
      year: y,
      futureCost: Math.round(fCost),
      purchasingPower: Math.round(pPower),
    });
  }

  return {
    currentAmount: Math.round(currentAmount),
    futureRequiredAmount: Math.round(futureRequiredAmount),
    purchasingPower: Math.round(purchasingPower),
    inflationImpact: Math.round(inflationImpact),
    purchasingPowerLossPercent: Math.round(purchasingPowerLossPercent * 10) / 10,
    trajectory,
  };
}

// ---------------------------------------------------------------------------
// 7. FD (Fixed Deposit)
// ---------------------------------------------------------------------------
export type CompoundingFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export interface FDInput {
  principal: number;
  annualInterestRate: number;
  tenureYears: number;
  compoundingFrequency: CompoundingFrequency;
}

export interface FDResult {
  principal: number;
  estimatedInterest: number;
  maturityAmount: number;
  trajectory: { year: number; principal: number; maturityAmount: number }[];
}

export function getFrequencyNumber(freq: CompoundingFrequency): number {
  switch (freq) {
    case 'monthly':
      return 12;
    case 'quarterly':
      return 4;
    case 'half-yearly':
      return 2;
    case 'yearly':
      return 1;
    default:
      return 4;
  }
}

export function calculateFD(input: FDInput): FDResult {
  const { principal, annualInterestRate, tenureYears, compoundingFrequency } = input;
  const n = getFrequencyNumber(compoundingFrequency);
  const r = annualInterestRate / 100;
  const t = tenureYears;

  // Formula: A = P * (1 + r/n)^(n*t)
  const maturityAmount = principal * Math.pow(1 + r / n, n * t);
  const estimatedInterest = Math.max(0, maturityAmount - principal);

  const trajectory: FDResult['trajectory'] = [];
  const maxYears = Math.ceil(tenureYears);
  for (let y = 0; y <= maxYears; y++) {
    const amount = principal * Math.pow(1 + r / n, n * y);
    trajectory.push({
      year: y,
      principal: Math.round(principal),
      maturityAmount: Math.round(amount),
    });
  }

  return {
    principal: Math.round(principal),
    estimatedInterest: Math.round(estimatedInterest),
    maturityAmount: Math.round(maturityAmount),
    trajectory,
  };
}

// ---------------------------------------------------------------------------
// 8. RD (Recurring Deposit)
// ---------------------------------------------------------------------------
export interface RDInput {
  monthlyDeposit: number;
  interestRate: number;
  tenureYears: number;
  compoundingFrequency?: CompoundingFrequency; // Bank standard is quarterly
}

export interface RDResult {
  totalDeposits: number;
  estimatedInterest: number;
  maturityAmount: number;
  trajectory: { year: number; deposits: number; value: number }[];
}

export function calculateRD(input: RDInput): RDResult {
  const { monthlyDeposit, interestRate, tenureYears, compoundingFrequency = 'quarterly' } = input;
  const totalMonths = Math.max(1, Math.round(tenureYears * 12));
  const r = interestRate / 100;
  const n = getFrequencyNumber(compoundingFrequency);

  // Standard Indian Bank quarterly compounding formula for monthly deposits
  // Each deposit m (from 1 to totalMonths) earns interest for remaining months (totalMonths - m + 1)
  let maturityAmount = 0;
  for (let m = 1; m <= totalMonths; m++) {
    const remainingMonths = totalMonths - m + 1;
    const yearsRemaining = remainingMonths / 12;
    const compoundPeriods = n * yearsRemaining;
    const depositMaturity = monthlyDeposit * Math.pow(1 + r / n, compoundPeriods);
    maturityAmount += depositMaturity;
  }

  const totalDeposits = monthlyDeposit * totalMonths;
  const estimatedInterest = Math.max(0, maturityAmount - totalDeposits);

  // Trajectory
  const trajectory: RDResult['trajectory'] = [];
  const maxYears = Math.ceil(tenureYears);
  for (let y = 1; y <= maxYears; y++) {
    const mCount = Math.min(totalMonths, y * 12);
    let cumulative = 0;
    for (let m = 1; m <= mCount; m++) {
      const rem = mCount - m + 1;
      cumulative += monthlyDeposit * Math.pow(1 + r / n, (n * rem) / 12);
    }
    trajectory.push({
      year: y,
      deposits: Math.round(monthlyDeposit * mCount),
      value: Math.round(cumulative),
    });
  }

  return {
    totalDeposits: Math.round(totalDeposits),
    estimatedInterest: Math.round(estimatedInterest),
    maturityAmount: Math.round(maturityAmount),
    trajectory,
  };
}

// ---------------------------------------------------------------------------
// 9. CAGR (Compound Annual Growth Rate)
// ---------------------------------------------------------------------------
export interface CAGRInput {
  initialInvestment: number;
  finalValue: number;
  years: number;
}

export interface CAGRResult {
  initialValue: number;
  finalValue: number;
  totalGain: number;
  percentageGain: number;
  cagrPercent: number;
  isValid: boolean;
  errorMessage?: string;
  trajectory: { year: number; projectedValue: number }[];
}

export function calculateCAGR(input: CAGRInput): CAGRResult {
  const { initialInvestment, finalValue, years } = input;

  if (initialInvestment <= 0 || years <= 0) {
    return {
      initialValue: initialInvestment,
      finalValue,
      totalGain: 0,
      percentageGain: 0,
      cagrPercent: 0,
      isValid: false,
      errorMessage: 'Initial investment and investment period must be greater than zero.',
      trajectory: [],
    };
  }

  if (finalValue <= 0) {
    return {
      initialValue: initialInvestment,
      finalValue,
      totalGain: finalValue - initialInvestment,
      percentageGain: -100,
      cagrPercent: -100,
      isValid: true,
      trajectory: [],
    };
  }

  // CAGR = (Final Value / Initial Value)^(1 / Years) - 1
  const cagr = Math.pow(finalValue / initialInvestment, 1 / years) - 1;
  const totalGain = finalValue - initialInvestment;
  const percentageGain = ((finalValue - initialInvestment) / initialInvestment) * 100;

  const trajectory: CAGRResult['trajectory'] = [];
  const maxYears = Math.ceil(years);
  for (let y = 0; y <= maxYears; y++) {
    const val = initialInvestment * Math.pow(1 + cagr, y);
    trajectory.push({
      year: y,
      projectedValue: Math.round(val),
    });
  }

  return {
    initialValue: Math.round(initialInvestment),
    finalValue: Math.round(finalValue),
    totalGain: Math.round(totalGain),
    percentageGain: Math.round(percentageGain * 100) / 100,
    cagrPercent: Math.round(cagr * 10000) / 100, // Return as % e.g. 14.85
    isValid: true,
    trajectory,
  };
}
