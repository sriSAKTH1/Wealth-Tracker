import React from 'react';
import { IndianRupee, Coins } from 'lucide-react';

/**
 * Converts a number into Indian Words (Crores, Lakhs, Thousands, Hundreds).
 * e.g., 150000 -> "One Lakh Fifty Thousand Rupees"
 *       50000  -> "Fifty Thousand Rupees"
 *       15000000 -> "One Crore Fifty Lakh Rupees"
 */
export function numberToWordsIndian(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Zero Rupees';
  if (num > 1000000000) return 'Over 100 Crores Rupees';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 10) return units[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    return `${tens[Math.floor(n / 10)]} ${units[n % 10]}`.trim();
  }

  function convertThreeDigits(n: number): string {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const hStr = h > 0 ? `${units[h]} Hundred` : '';
    const restStr = convertTwoDigits(rest);
    if (hStr && restStr) return `${hStr} ${restStr}`;
    return hStr || restStr;
  }

  const rounded = Math.floor(num);
  const crores = Math.floor(rounded / 10000000);
  const lakhs = Math.floor((rounded % 10000000) / 100000);
  const thousands = Math.floor((rounded % 100000) / 1000);
  const hundreds = rounded % 1000;

  const parts: string[] = [];
  if (crores > 0) parts.push(`${convertThreeDigits(crores)} Crore`);
  if (lakhs > 0) parts.push(`${convertTwoDigits(lakhs)} Lakh`);
  if (thousands > 0) parts.push(`${convertTwoDigits(thousands)} Thousand`);
  if (hundreds > 0) parts.push(convertThreeDigits(hundreds));

  const words = parts.join(' ').trim();
  return words ? `${words} Rupees` : 'Zero Rupees';
}

/**
 * Formats a number in Indian shorthand words (e.g. ₹1.5 Crore, ₹20 Lakh, ₹50,000)
 */
export function formatIndianWordsCompact(num: number, currSym = '₹'): string {
  if (!num || isNaN(num) || num <= 0) return `${currSym}0`;
  
  if (num >= 10000000) {
    const cr = num / 10000000;
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2).replace(/\.?0+$/, '');
    return `${currSym}${formatted} Crore`;
  }
  
  if (num >= 100000) {
    const lk = num / 100000;
    const formatted = lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(2).replace(/\.?0+$/, '');
    return `${currSym}${formatted} Lakh`;
  }
  
  return `${currSym}${Math.round(num).toLocaleString('en-IN')}`;
}

interface FinScoreAmountInputProps {
  id?: string;
  label?: string;
  value: number | string;
  onChange: (val: number) => void;
  currSym?: string;
  placeholder?: string;
  isLight?: boolean;
  min?: number;
  max?: number;
  step?: number;
  presets?: number[];
  hint?: string;
  badge?: string;
  required?: boolean;
  className?: string;
  compact?: boolean;
}

export const FinScoreAmountInput: React.FC<FinScoreAmountInputProps> = ({
  id,
  label,
  value,
  onChange,
  currSym = '₹',
  placeholder = '0',
  isLight = false,
  min = 0,
  max,
  step = 100,
  presets,
  hint,
  badge,
  required = false,
  className = '',
  compact = false,
}) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const inputId = id || `amount-input-${Math.random().toString(36).substring(2, 9)}`;

  // Formatting strings
  const formattedCurrency = `${currSym}${numericValue.toLocaleString('en-IN')}`;
  const compactWords = formatIndianWordsCompact(numericValue, currSym);
  const spelledWords = numberToWordsIndian(numericValue);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(isNaN(val) ? 0 : val);
  };

  const handlePresetClick = (amount: number) => {
    onChange(amount);
  };

  const handleIncrement = (delta: number) => {
    const newVal = Math.max(0, numericValue + delta);
    onChange(newVal);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and badges */}
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={inputId} className={`block text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            {label}
          </label>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                {badge}
              </span>
            )}
            {hint && (
              <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {hint}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input container with currency prefix */}
      <div className="relative flex items-center">
        <div className={`absolute left-3 flex items-center pointer-events-none font-mono font-bold text-sm ${
          isLight ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {currSym === '₹' ? <IndianRupee className="w-3.5 h-3.5" /> : <span>{currSym}</span>}
        </div>
        <input
          id={inputId}
          type="number"
          min={min}
          max={max}
          step={step}
          required={required}
          value={numericValue === 0 ? '' : numericValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          className={`w-full pl-8 pr-3 py-2 text-sm font-mono font-bold rounded-xl border transition-all duration-150 focus:outline-none ${
            isLight
              ? 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15'
              : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
          }`}
        />
      </div>

      {/* DEDICATED NUMERIC VALUE DISPLAY CARD (Directly below input) */}
      <div 
        id={`${inputId}-numeric-value`}
        className={`px-3 py-2 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${
          numericValue > 0
            ? isLight
              ? 'bg-blue-50/70 border-blue-200 text-blue-900 shadow-xs'
              : 'bg-blue-950/30 border-blue-900/50 text-blue-300 shadow-xs'
            : isLight
              ? 'bg-slate-100/70 border-slate-200 text-slate-500'
              : 'bg-slate-900/40 border-slate-800 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Coins className={`w-3.5 h-3.5 shrink-0 ${numericValue > 0 ? 'text-blue-500' : 'text-slate-500'}`} />
          <div className="truncate min-w-0">
            <span className="font-mono font-bold tracking-tight text-xs mr-1.5">
              {formattedCurrency}
            </span>
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              • {numericValue > 0 ? compactWords : 'Zero'} ({numericValue > 0 ? spelledWords : 'Zero Rupees'})
            </span>
          </div>
        </div>

        {/* Quick increment / preset shortcuts */}
        {presets && presets.length > 0 ? (
          <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap overflow-x-auto no-scrollbar max-w-full">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => handlePresetClick(p)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer shrink-0 ${
                  numericValue === p
                    ? 'bg-blue-500 text-white font-bold'
                    : isLight
                    ? 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {formatIndianWordsCompact(p, currSym)}
              </button>
            ))}
          </div>
        ) : !compact && (
          <div className="flex items-center gap-1 flex-wrap text-[10px] font-mono">
            <button
              type="button"
              onClick={() => handleIncrement(5000)}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              +5k
            </button>
            <button
              type="button"
              onClick={() => handleIncrement(25000)}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              +25k
            </button>
            <button
              type="button"
              onClick={() => handleIncrement(100000)}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                isLight ? 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-300' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              +1L
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
