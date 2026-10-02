/**
 * XIRR (Extended Internal Rate of Return) Calculator
 * Implements deterministic numerical root-finding using Newton-Raphson with Bisection fallback.
 */

export interface CashFlowTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number; // Negative for investment, positive for returns/redemption
  description?: string; // Optional label e.g. "Monthly SIP #1", "Dividend", "Current Portfolio Value"
  type?: 'investment' | 'redemption' | 'custom';
}

export interface XIRRResult {
  xirr: number | null; // Percentage e.g. 14.25%
  totalInvested: number;
  totalReceived: number;
  netGain: number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Calculates XIRR for an array of cash flow transactions.
 * Returns percentage (e.g. 12.5 for 12.5%) or null if calculation cannot converge.
 */
export function calculateXIRR(transactions: CashFlowTransaction[]): XIRRResult {
  // Validate basic criteria
  if (!transactions || transactions.length < 2) {
    return {
      xirr: null,
      totalInvested: 0,
      totalReceived: 0,
      netGain: 0,
      isValid: false,
      errorMessage: 'At least two transactions are required to calculate XIRR.',
    };
  }

  // Filter out zero amount transactions and parse dates
  const parsed = transactions
    .filter(t => !isNaN(t.amount) && t.amount !== 0 && Boolean(t.date))
    .map(t => ({
      amount: Number(t.amount),
      date: new Date(t.date).getTime(),
    }))
    .filter(t => !isNaN(t.date));

  if (parsed.length < 2) {
    return {
      xirr: null,
      totalInvested: 0,
      totalReceived: 0,
      netGain: 0,
      isValid: false,
      errorMessage: 'Please enter valid dates and non-zero cash flows.',
    };
  }

  // Sort chronologically
  parsed.sort((a, b) => a.date - b.date);

  let totalInvested = 0;
  let totalReceived = 0;
  let hasNegative = false;
  let hasPositive = false;

  for (const item of parsed) {
    if (item.amount < 0) {
      hasNegative = true;
      totalInvested += Math.abs(item.amount);
    } else {
      hasPositive = true;
      totalReceived += item.amount;
    }
  }

  const netGain = totalReceived - totalInvested;

  if (!hasNegative || !hasPositive) {
    return {
      xirr: null,
      totalInvested,
      totalReceived,
      netGain,
      isValid: false,
      errorMessage: 'Cash flows must contain at least one investment (negative) and at least one return (positive).',
    };
  }

  const startDate = parsed[0].date;
  const flows = parsed.map(p => ({
    amount: p.amount,
    years: (p.date - startDate) / (1000 * 60 * 60 * 24 * 365.0),
  }));

  // Net Present Value calculation function
  const npv = (rate: number): number => {
    let sum = 0;
    for (const f of flows) {
      sum += f.amount / Math.pow(1 + rate, f.years);
    }
    return sum;
  };

  // Derivative of NPV with respect to rate
  const dNpv = (rate: number): number => {
    let sum = 0;
    for (const f of flows) {
      sum += (-f.years * f.amount) / Math.pow(1 + rate, f.years + 1);
    }
    return sum;
  };

  // Newton-Raphson method
  let rate = 0.1; // 10% initial guess
  const maxIterations = 100;
  const tolerance = 1e-6;
  let converged = false;

  for (let i = 0; i < maxIterations; i++) {
    const fValue = npv(rate);
    const dValue = dNpv(rate);

    if (Math.abs(dValue) < 1e-12) {
      break; // Derivative too small, try bisection
    }

    const nextRate = rate - fValue / dValue;

    if (Math.abs(nextRate - rate) < tolerance) {
      rate = nextRate;
      converged = true;
      break;
    }

    // If rate explodes or goes below -0.99, break to bisection
    if (nextRate <= -0.99 || nextRate > 50 || isNaN(nextRate)) {
      break;
    }

    rate = nextRate;
  }

  // Fallback to Bisection if Newton-Raphson failed to converge
  if (!converged) {
    let low = -0.99;
    let high = 10.0; // 1000%

    let fLow = npv(low);
    let fHigh = npv(high);

    // If signs are the same, try extending high
    if (fLow * fHigh > 0) {
      high = 50.0;
      fHigh = npv(high);
    }

    if (fLow * fHigh <= 0) {
      for (let i = 0; i < 100; i++) {
        const mid = (low + high) / 2;
        const fMid = npv(mid);

        if (Math.abs(fMid) < tolerance || (high - low) / 2 < tolerance) {
          rate = mid;
          converged = true;
          break;
        }

        if (fLow * fMid < 0) {
          high = mid;
          fHigh = fMid;
        } else {
          low = mid;
          fLow = fMid;
        }
      }
    }
  }

  if (converged && !isNaN(rate) && isFinite(rate) && rate > -1) {
    return {
      xirr: rate * 100, // Return as percentage e.g. 14.25
      totalInvested,
      totalReceived,
      netGain,
      isValid: true,
    };
  }

  return {
    xirr: null,
    totalInvested,
    totalReceived,
    netGain,
    isValid: false,
    errorMessage: 'Could not calculate XIRR. Please verify your cash flow amounts and dates.',
  };
}
