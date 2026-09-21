/**
 * FIRE & Financial Freedom Calculation Engine
 * 
 * IMPORTANT:
 * - Mathematical calculations are strictly performed using standard TypeScript/JS arithmetic.
 * - This calculation engine is decoupled from the AI/LLM.
 * - Uses Indian Rupees (₹) and Indian number formatting (Lakhs & Crores).
 */

export interface FireInputs {
  /** Monthly living expenses in INR (₹) */
  monthlyExpenses: number;
  /** Current invested portfolio / liquid wealth in INR (₹) */
  currentInvestments: number;
  /** Monthly recurring investment / SIP in INR (₹) */
  monthlyInvestment: number;
  /** Safe withdrawal rate percentage (default: 4.0%) */
  withdrawalRate: number;
  /** Multiplier rule in multiples of annual expenses (e.g., 25, 30, 33, 35) */
  multiplier?: number;
  /** Expected annual return percentage (e.g., 12.0%) */
  expectedAnnualReturn: number;
  /** Investment projection horizon in years (e.g., 15) */
  years: number;
}

export interface YearProjectionPoint {
  year: number;
  label: string;
  totalInvested: number;
  estimatedGains: number;
  balance: number;
}

export interface FireCalculationResult {
  /** Annual expenses = monthlyExpenses * 12 */
  annualExpenses: number;
  /** Multiplier rule (e.g., 25x, 30x, 33x, 35x) */
  multiplier: number;
  /** FIRE Number = annualExpenses / (withdrawalRate / 100) */
  fireNumber: number;
  /** Financial Freedom Number = annualExpenses / (withdrawalRate / 100) */
  financialFreedomNumber: number;
  /** Current investments */
  currentInvestments: number;
  /** Monthly investment / SIP */
  monthlyInvestment: number;
  /** FIRE Progress percentage = (currentInvestments / fireNumber) * 100 */
  fireProgressPercent: number;
  /** Remaining amount to reach FIRE = max(0, fireNumber - currentInvestments) */
  fireGap: number;
  /** Freedom Progress percentage = (currentInvestments / financialFreedomNumber) * 100 */
  freedomProgressPercent: number;
  /** Financial Freedom Gap = max(0, financialFreedomNumber - currentInvestments) */
  freedomGap: number;
  /** Future portfolio value after `years` of monthly compounding */
  projectedPortfolio: number;
  /** Total principal invested over the period */
  totalInvestedPrincipal: number;
  /** Total estimated wealth created from compounding returns */
  totalEstimatedGains: number;
  /** Year-by-year compounding progression for chart */
  yearlyProjections: YearProjectionPoint[];
  /** Estimated years to reach FIRE based on monthly compounding SIP */
  estimatedYearsToFire: number | null;
  /** Human-readable word representations in Indian format */
  displayPhrases: {
    fireNumberWords: string;
    freedomNumberWords: string;
    currentInvestmentsWords: string;
    fireGapWords: string;
    projectedPortfolioWords: string;
  };
}

export interface ValidationErrors {
  monthlyExpenses?: string;
  currentInvestments?: string;
  monthlyInvestment?: string;
  withdrawalRate?: string;
  expectedAnnualReturn?: string;
  years?: string;
  isValid: boolean;
}

/**
 * Validates user inputs against mathematical and financial domain limits.
 */
export function validateFireInputs(inputs: FireInputs): ValidationErrors {
  const errors: ValidationErrors = { isValid: true };

  if (isNaN(inputs.monthlyExpenses) || inputs.monthlyExpenses <= 0) {
    errors.monthlyExpenses = 'Monthly expenses cannot be negative or zero.';
    errors.isValid = false;
  }

  if (isNaN(inputs.currentInvestments) || inputs.currentInvestments < 0) {
    errors.currentInvestments = 'Current investments cannot be negative.';
    errors.isValid = false;
  }

  if (isNaN(inputs.monthlyInvestment) || inputs.monthlyInvestment < 0) {
    errors.monthlyInvestment = 'Monthly investment cannot be negative.';
    errors.isValid = false;
  }

  if (isNaN(inputs.withdrawalRate) || inputs.withdrawalRate <= 0) {
    errors.withdrawalRate = 'Withdrawal rate must be greater than 0%.';
    errors.isValid = false;
  }

  if (isNaN(inputs.expectedAnnualReturn) || inputs.expectedAnnualReturn < 0) {
    errors.expectedAnnualReturn = 'Expected return cannot be negative.';
    errors.isValid = false;
  }

  if (isNaN(inputs.years) || inputs.years <= 0 || !Number.isInteger(inputs.years)) {
    errors.years = 'Years must be an integer greater than 0.';
    errors.isValid = false;
  }

  return errors;
}

/**
 * Formats a number with Indian comma grouping (en-IN).
 * e.g., 15000000 -> "1,50,00,000"
 */
export function formatIndianNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  const rounded = Math.round(num);
  return rounded.toLocaleString('en-IN');
}

/**
 * Formats a number as Indian Currency with Rupee symbol.
 * e.g., 15000000 -> "₹1,50,00,000"
 */
export function formatIndianCurrency(num: number): string {
  return `₹${formatIndianNumber(num)}`;
}

/**
 * Formats a number in standard Indian Lakhs / Crores words.
 * Examples:
 * 15000000 -> "₹1.5 Crore"
 * 2000000  -> "₹20 Lakh"
 * 50000    -> "₹50,000"
 */
export function formatIndianWords(num: number): string {
  if (!Number.isFinite(num) || num <= 0) return '₹0';
  
  if (num >= 10000000) {
    const crores = num / 10000000;
    const formatted = crores % 1 === 0 ? crores.toFixed(0) : crores.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Crore`;
  }
  
  if (num >= 100000) {
    const lakhs = num / 100000;
    const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2).replace(/\.?0+$/, '');
    return `₹${formatted} Lakh`;
  }
  
  return formatIndianCurrency(num);
}

/**
 * Compact Indian format for dashboard cards (e.g., "₹1.50 Cr", "₹20.00 L", "₹50K")
 */
export function formatIndianCompact(num: number): string {
  if (!Number.isFinite(num) || num === 0) return '₹0';
  
  if (num >= 10000000) {
    const crores = num / 10000000;
    return `₹${crores.toFixed(2)} Cr`;
  }
  
  if (num >= 100000) {
    const lakhs = num / 100000;
    return `₹${lakhs.toFixed(2)} L`;
  }
  
  if (num >= 1000) {
    const thousands = num / 1000;
    return `₹${thousands.toFixed(1)} K`;
  }
  
  return `₹${Math.round(num)}`;
}

/**
 * Pure Mathematical Engine for FIRE & Financial Freedom Calculations.
 * All computations use standard arithmetic functions.
 */
export function calculateFireAndFreedom(inputs: FireInputs): FireCalculationResult {
  // Defensive fallbacks to prevent NaN
  const monthlyExpenses = Math.max(0, Number(inputs.monthlyExpenses) || 0);
  const currentInvestments = Math.max(0, Number(inputs.currentInvestments) || 0);
  const monthlyInvestment = Math.max(0, Number(inputs.monthlyInvestment) || 0);
  const explicitMultiplier = inputs.multiplier && inputs.multiplier > 0 ? Number(inputs.multiplier) : null;
  const withdrawalRate = explicitMultiplier 
    ? Number((100 / explicitMultiplier).toFixed(2)) 
    : Math.max(0.0001, Number(inputs.withdrawalRate) || 4.0);
  const multiplier = explicitMultiplier || (withdrawalRate > 0 ? Math.round((100 / withdrawalRate) * 10) / 10 : 25);
  const expectedAnnualReturn = Math.max(0, Number(inputs.expectedAnnualReturn) || 0);
  const years = Math.max(1, Math.round(Number(inputs.years) || 1));

  // FEATURE 1 & 2: Annual expenses & FIRE / Financial Freedom Number
  const annualExpenses = monthlyExpenses * 12;
  const fireNumber = explicitMultiplier 
    ? Math.round(annualExpenses * explicitMultiplier) 
    : (withdrawalRate > 0 ? Math.round(annualExpenses / (withdrawalRate / 100)) : 0);
  const financialFreedomNumber = fireNumber; // Same core definition as requested

  // FEATURE 1 & 3: Progress & Gap
  const fireProgressPercent = fireNumber > 0 
    ? Math.min(1000, Number(((currentInvestments / fireNumber) * 100).toFixed(1)))
    : 0;
  const fireGap = Math.max(0, fireNumber - currentInvestments);
  const freedomProgressPercent = fireProgressPercent;
  const freedomGap = fireGap;

  // FEATURE 4: Monthly compounding investment projection
  // Monthly return = Annual return / 12
  // For every month: balance = previous balance * (1 + monthly return) + monthly investment
  const monthlyReturn = (expectedAnnualReturn / 100) / 12;
  const totalMonths = years * 12;

  let runningBalance = currentInvestments;
  let runningInvested = currentInvestments;
  const yearlyProjections: YearProjectionPoint[] = [
    {
      year: 0,
      label: 'Now',
      totalInvested: Math.round(runningInvested),
      estimatedGains: 0,
      balance: Math.round(runningBalance),
    },
  ];

  for (let m = 1; m <= totalMonths; m++) {
    runningBalance = runningBalance * (1 + monthlyReturn) + monthlyInvestment;
    runningInvested += monthlyInvestment;

    if (m % 12 === 0) {
      const yr = m / 12;
      const totalInvestedNow = Math.round(runningInvested);
      const balanceNow = Math.round(runningBalance);
      const estimatedGainsNow = Math.max(0, balanceNow - totalInvestedNow);

      yearlyProjections.push({
        year: yr,
        label: `Yr ${yr}`,
        totalInvested: totalInvestedNow,
        estimatedGains: estimatedGainsNow,
        balance: balanceNow,
      });
    }
  }

  const projectedPortfolio = Math.round(runningBalance);
  const totalInvestedPrincipal = Math.round(runningInvested);
  const totalEstimatedGains = Math.max(0, projectedPortfolio - totalInvestedPrincipal);

  // Approximate time to hit FIRE Number with current monthly investment compounding
  let estimatedYearsToFire: number | null = null;
  if (currentInvestments >= fireNumber) {
    estimatedYearsToFire = 0;
  } else if (monthlyInvestment > 0 || (currentInvestments > 0 && expectedAnnualReturn > 0)) {
    let simBalance = currentInvestments;
    let simMonths = 0;
    const maxMonths = 1200; // 100 years max
    while (simBalance < fireNumber && simMonths < maxMonths) {
      simBalance = simBalance * (1 + monthlyReturn) + monthlyInvestment;
      simMonths++;
    }
    if (simMonths < maxMonths) {
      estimatedYearsToFire = Number((simMonths / 12).toFixed(1));
    }
  }

  return {
    annualExpenses,
    multiplier,
    fireNumber,
    financialFreedomNumber,
    currentInvestments,
    monthlyInvestment,
    fireProgressPercent,
    fireGap,
    freedomProgressPercent,
    freedomGap,
    projectedPortfolio,
    totalInvestedPrincipal,
    totalEstimatedGains,
    yearlyProjections,
    estimatedYearsToFire,
    displayPhrases: {
      fireNumberWords: formatIndianWords(fireNumber),
      freedomNumberWords: formatIndianWords(financialFreedomNumber),
      currentInvestmentsWords: formatIndianWords(currentInvestments),
      fireGapWords: formatIndianWords(fireGap),
      projectedPortfolioWords: formatIndianWords(projectedPortfolio),
    },
  };
}

/**
 * Standard default inputs (beginner-friendly Indian benchmark)
 */
export const DEFAULT_FIRE_INPUTS: FireInputs = {
  monthlyExpenses: 50000,       // ₹50,000/month
  currentInvestments: 2000000,  // ₹20,00,000 (₹20 Lakh)
  monthlyInvestment: 25000,     // ₹25,000/month SIP
  withdrawalRate: 4.0,          // 4.0%
  multiplier: 25,               // 25x (Trinity rule)
  expectedAnnualReturn: 12.0,   // 12.0% (Equities/Mutual Funds)
  years: 15,                    // 15 years
};

/**
 * Deterministic AI Explanation Generator (Local Fallback & Baseline).
 * Strict Rule: Only explains the exact calculated values; never invents or alters numbers.
 */
export function generateLocalAiExplanation(
  inputs: FireInputs,
  result: FireCalculationResult,
  customQuestion?: string
): string {
  const {
    annualExpenses,
    fireNumber,
    currentInvestments,
    monthlyInvestment,
    fireProgressPercent,
    fireGap,
    projectedPortfolio,
    totalInvestedPrincipal,
    totalEstimatedGains,
    estimatedYearsToFire,
    displayPhrases,
  } = result;

  if (customQuestion && customQuestion.trim().length > 0) {
    return `Here is a direct explanation based on your calculations:

• Your Target: Your FIRE and Financial Freedom Number is **${displayPhrases.fireNumberWords}** (${formatIndianCompact(fireNumber)}), calculated from your annual living expenses of **${formatIndianCurrency(annualExpenses)}** at a **${inputs.withdrawalRate}%** safe withdrawal rate.
• Current Position: You currently hold **${displayPhrases.currentInvestmentsWords}** (${formatIndianCompact(currentInvestments)}), placing you at **${fireProgressPercent}%** of your goal with a gap of **${displayPhrases.fireGapWords}** (${formatIndianCompact(fireGap)}).
• Monthly Contribution: By continuing your monthly investment of **${formatIndianCurrency(monthlyInvestment)}** at an expected **${inputs.expectedAnnualReturn}%** annual return, your estimated portfolio is projected to grow to **${displayPhrases.projectedPortfolioWords}** in **${inputs.years} years** (${formatIndianCurrency(totalInvestedPrincipal)} invested + ${formatIndianCurrency(totalEstimatedGains)} estimated compounding gains).
• Regarding your question ("${customQuestion}"): Stay disciplined with your recurring SIP and periodically review your lifestyle expenses, as every reduction in monthly expenses exponentially lowers your required freedom target.`;
  }

  return `### Hello! Here is your Financial Freedom Summary

1. **Your Freedom Target (${displayPhrases.fireNumberWords})**:
   With monthly expenses of **${formatIndianCurrency(inputs.monthlyExpenses)}** (equal to **${formatIndianCurrency(annualExpenses)}** annually), your estimated FIRE Number is **${displayPhrases.fireNumberWords}** based on the standard **${inputs.withdrawalRate}%** safe withdrawal rate.

2. **Where You Stand Today (${fireProgressPercent}%)**:
   You have accumulated **${displayPhrases.currentInvestmentsWords}**, which is **${fireProgressPercent}%** of your financial freedom goal. Your remaining gap is **${displayPhrases.fireGapWords}**.

3. **Compound Growth Outlook**:
   With your current investments of **${displayPhrases.currentInvestmentsWords}** and a monthly SIP of **${formatIndianCurrency(monthlyInvestment)}** earning an expected **${inputs.expectedAnnualReturn}%** annual return, your portfolio is estimated to reach **${displayPhrases.projectedPortfolioWords}** (${formatIndianCompact(projectedPortfolio)}) in **${inputs.years} years**.
   - Your total capital invested: **${formatIndianCurrency(totalInvestedPrincipal)}**
   - Estimated compounding gains: **${formatIndianCurrency(totalEstimatedGains)}**
   ${estimatedYearsToFire !== null ? `- Estimated time to reach your FIRE number at this rate: **~${estimatedYearsToFire} years**` : ''}

*Keep going! Consistent monthly investments and power of compounding will bridge your remaining gap.*`;
}
