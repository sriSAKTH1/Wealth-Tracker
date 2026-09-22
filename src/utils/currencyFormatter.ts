/**
 * Currency and Number Formatting Utilities
 * Standardized Indian Rupee (INR) and International Number Formatting
 */

/**
 * Formats a number in Indian numbering format (e.g. ₹1,00,000, ₹10,00,000, ₹1,50,00,000)
 */
export function formatINR(
  amount: number,
  options: {
    showSymbol?: boolean;
    decimals?: number;
    compactWords?: boolean;
  } = {}
): string {
  const { showSymbol = true, decimals = 0, compactWords = false } = options;

  if (isNaN(amount) || !isFinite(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // Optional compact word formatting (e.g. 1.50 Cr, 25 Lakh)
  if (compactWords) {
    const symbolPrefix = showSymbol ? '₹' : '';
    const sign = isNegative ? '-' : '';
    if (absAmount >= 10000000) {
      const cr = absAmount / 10000000;
      return `${sign}${symbolPrefix}${cr.toFixed(2)} Cr`;
    }
    if (absAmount >= 100000) {
      const lakh = absAmount / 100000;
      return `${sign}${symbolPrefix}${lakh.toFixed(2)} L`;
    }
    if (absAmount >= 1000) {
      const k = absAmount / 1000;
      return `${sign}${symbolPrefix}${k.toFixed(1)}k`;
    }
  }

  // Standard Indian Rupee numbering format
  // Uses en-IN locale: 1,00,000 instead of 100,000
  const formattedNumber = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals > 0 && absAmount % 1 !== 0 ? decimals : 0,
  });

  const sign = isNegative ? '-' : '';
  const symbol = showSymbol ? '₹' : '';

  return `${sign}${symbol}${formattedNumber}`;
}

/**
 * Format percentage with decimal places
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Convert numeric amount into readable Indian words
 */
export function amountInIndianWords(amount: number): string {
  if (isNaN(amount) || !isFinite(amount) || amount === 0) return 'Zero Rupees';

  const abs = Math.abs(Math.round(amount));
  if (abs >= 10000000) {
    const cr = abs / 10000000;
    return `${cr.toFixed(2)} Crore`;
  }
  if (abs >= 100000) {
    const lakh = abs / 100000;
    return `${lakh.toFixed(2)} Lakh`;
  }
  if (abs >= 1000) {
    const th = abs / 1000;
    return `${th.toFixed(1)} Thousand`;
  }
  return `${abs} Rupees`;
}
