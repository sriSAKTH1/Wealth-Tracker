import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Activity,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowUpRight,
  Coins
} from 'lucide-react';

/**
 * Reusable hook to detect when an element scrolls into the viewport.
 */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.2, ...options });

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}

/**
 * Reusable hook for smooth ease-out number counting.
 */
export function useCountUp(endValue: number, duration = 1600, startTrigger = false, decimals = 0) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!startTrigger) {
      setVal(0);
      return;
    }

    let startTimestamp: number | null = null;
    let animId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Number((ease * endValue).toFixed(decimals));
      setVal(current);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setVal(endValue);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [startTrigger, endValue, duration, decimals]);

  return val;
}

/* =========================================================================
   1. ANIMATED FINSCORE SECTION (Section 17)
   Animates from 0 to 88 on scroll with circular gauge progress animation
   ========================================================================= */
/* =========================================================================
   1. ANIMATED FINSCORE SECTION (Section 17)
   Animates from 0 to 88 / 100 and 0 to 880 / 1,000 on scroll with circular gauge.
   Calculated across 4 Pillars (25 marks each):
   - Emergency Fund: 25 pts (250/1000) - If NO, mark is 0
   - Health Insurance: 25 pts (250/1000)
   - Savings Score: 25 pts (250/1000)
   - Debt Score: 25 pts (250/1000)
   ========================================================================= */
export const AnimatedFinScoreSection: React.FC = () => {
  const { ref, isInView } = useInView({ threshold: 0.25 });
  const [hasEmergencyFund, setHasEmergencyFund] = useState<boolean>(true);
  const [scaleMode, setScaleMode] = useState<'1000' | '100'>('1000');

  // Sub-factor scores out of 100
  // When emergency fund is NO, mark is 0!
  const targetEmergency = hasEmergencyFund ? 95 : 0;
  const targetHealth = 86;
  const targetSavings = 88;
  const targetDebt = 83;

  // Animated sub-factors
  const scoreEmergency = useCountUp(targetEmergency, 1500, isInView, 0);
  const scoreHealth = useCountUp(targetHealth, 1600, isInView, 0);
  const scoreSavings = useCountUp(targetSavings, 1700, isInView, 0);
  const scoreDebt = useCountUp(targetDebt, 1800, isInView, 0);

  // 4-Pillars Combo calculation:
  // Each assigned 25 pts out of 100, and 250 pts out of 1,000
  const emergencyMarks25 = Number(((scoreEmergency * 25) / 100).toFixed(1));
  const healthMarks25 = Number(((scoreHealth * 25) / 100).toFixed(1));
  const savingsMarks25 = Number(((scoreSavings * 25) / 100).toFixed(1));
  const debtMarks25 = Number(((scoreDebt * 25) / 100).toFixed(1));

  const emergencyMarks1000 = Math.round(scoreEmergency * 2.5);
  const healthMarks1000 = Math.round(scoreHealth * 2.5);
  const savingsMarks1000 = Math.round(scoreSavings * 2.5);
  const debtMarks1000 = Math.round(scoreDebt * 2.5);

  const targetTotal100 = Math.round(
    ((targetEmergency * 25) / 100) +
    ((targetHealth * 25) / 100) +
    ((targetSavings * 25) / 100) +
    ((targetDebt * 25) / 100)
  );
  const targetTotal1000 = Math.round(
    (targetEmergency * 2.5) +
    (targetHealth * 2.5) +
    (targetSavings * 2.5) +
    (targetDebt * 2.5)
  );

  const animatedScore100 = useCountUp(targetTotal100, 1800, isInView, 0);
  const animatedScore1000 = useCountUp(targetTotal1000, 1800, isInView, 0);

  // Total circumference = 2 * PI * 42 ≈ 263.89
  const circumference = 264;
  const strokeOffset = circumference - (animatedScore100 / 100) * circumference;

  return (
    <section 
      ref={ref} 
      id="finscore-section" 
      className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-slate-50"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: Circular FinScore Gauge with out-of-1,000 & out-of-100 animations */}
        <div className="lg:col-span-5 p-7 sm:p-8 rounded-3xl bg-white border border-emerald-300 flex flex-col items-center justify-center text-center shadow-xl transition-all duration-700">
          {/* Scale Mode Switcher */}
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-[11px] font-bold">
            <button
              onClick={() => setScaleMode('1000')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scaleMode === '1000'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1,000 Scale Combo
            </button>
            <button
              onClick={() => setScaleMode('100')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scaleMode === '100'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              100 Scale
            </button>
          </div>

          <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Background Track Ring */}
              <circle 
                cx="50" 
                cy="50" 
                r="42" 
                fill="transparent" 
                stroke="#e2e8f0" 
                strokeWidth="8" 
              />
              {/* Animated Foreground Emerald Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="transparent"
                stroke={hasEmergencyFund ? '#059669' : '#d97706'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-tight transition-transform duration-300">
                {scaleMode === '1000' ? animatedScore1000 : animatedScore100}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {scaleMode === '1000' ? '/ 1,000' : '/ 100'}
              </span>
              <span className={`text-[11px] font-bold mt-1 uppercase tracking-wider transition-opacity duration-500 ${
                animatedScore100 >= 80 ? 'text-emerald-700' : animatedScore100 >= 60 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {animatedScore100 >= 80 ? 'Excellent' : animatedScore100 >= 60 ? 'Good / Fair' : 'Needs Work'}
              </span>
            </div>
          </div>

          {/* Dual Score Badge */}
          <div className="mt-4 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-2">
            <span>Combo: <strong>{animatedScore1000} / 1,000</strong></span>
            <span className="text-slate-400">•</span>
            <span>Scale: <strong>{animatedScore100} / 100</strong></span>
          </div>

          <p className="mt-3 text-xs text-slate-600 max-w-xs leading-relaxed">
            Composite health calculated from 4 balanced dimensions (Emergency, Insurance, Savings, Debt) at 25% weight each.
          </p>
        </div>

        {/* Right: 4 Scoring Pillars with 25 marks / 250 marks combo */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                4-PILLAR FINSCORE ENGINE (25 + 25 + 25 + 25 = 100)
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                Max Score: 1,000 Pts
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Balanced Financial Health Diagnostic
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
              Each pillar contributes up to <strong>25 points</strong> (out of 100) or <strong>250 points</strong> (out of 1,000):
            </p>
          </div>

          {/* Interactive Emergency Fund Rule Tester */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                  Interactive Rule Demo: Emergency Fund Check
                </span>
                <span className="text-xs text-slate-600">
                  {hasEmergencyFund 
                    ? 'Emergency fund is active: score calculated based on savings buffer.' 
                    : 'Emergency fund is NO: mark is assigned as 0 (0 / 25 pts, 0 / 250 in 1,000 combo score).'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setHasEmergencyFund(true)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    hasEmergencyFund
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ✓ Emergency: YES
                </button>
                <button
                  type="button"
                  onClick={() => setHasEmergencyFund(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !hasEmergencyFund
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  ✗ Emergency: NO (Mark: 0)
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Pillar 1: Emergency Fund */}
            <div className={`p-3.5 rounded-2xl bg-white border transition-all ${
              !hasEmergencyFund ? 'border-rose-300 shadow-sm bg-rose-50/20' : 'border-slate-200 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">1. Emergency Fund (Weight: 25)</span>
                  {!hasEmergencyFund && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600">
                      NO Emergency Fund = 0 Marks
                    </span>
                  )}
                </div>
                <div className="text-right font-mono">
                  <span className={`font-bold ${!hasEmergencyFund ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {emergencyMarks1000} / 250 pts
                  </span>
                  <span className="text-slate-400 text-[11px] ml-1.5">
                    ({scoreEmergency}/100 • {emergencyMarks25}/25)
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    !hasEmergencyFund ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${scoreEmergency}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>{hasEmergencyFund ? '6-Month living buffer reserve active' : 'Zero emergency buffer allocated'}</span>
                <span>{hasEmergencyFund ? 'Score based on emergency fund' : 'Mark: 0'}</span>
              </div>
            </div>

            {/* Pillar 2: Health Insurance */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">2. Health Insurance (Weight: 25)</span>
                <div className="text-right font-mono">
                  <span className="font-bold text-emerald-700">
                    {healthMarks1000} / 250 pts
                  </span>
                  <span className="text-slate-400 text-[11px] ml-1.5">
                    ({scoreHealth}/100 • {healthMarks25}/25)
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${scoreHealth}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>Comprehensive personal &amp; family health protection</span>
                <span>₹5L+ Base Coverage</span>
              </div>
            </div>

            {/* Pillar 3: Savings Score */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">3. Savings Score (Weight: 25)</span>
                <div className="text-right font-mono">
                  <span className="font-bold text-emerald-700">
                    {savingsMarks1000} / 250 pts
                  </span>
                  <span className="text-slate-400 text-[11px] ml-1.5">
                    ({scoreSavings}/100 • {savingsMarks25}/25)
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${scoreSavings}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>24% net monthly income saved and compounded</span>
                <span>Above 20% benchmark</span>
              </div>
            </div>

            {/* Pillar 4: Debt Score */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-900">4. Debt Score (Weight: 25)</span>
                <div className="text-right font-mono">
                  <span className="font-bold text-emerald-700">
                    {debtMarks1000} / 250 pts
                  </span>
                  <span className="text-slate-400 text-[11px] ml-1.5">
                    ({scoreDebt}/100 • {debtMarks25}/25)
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${scoreDebt}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>14.8% EMI-to-income load (Safe &lt;35% ceiling)</span>
                <span>Controlled leverage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* =========================================================================
   2. ANIMATED WEALTH GROWTH & NET WORTH CURVE (Section 12)
   Features 10 numbered level markings (0 to 10), and the 5-year compounding
   graph line animating from year 1 upwards to year 5 (₹1.24 Cr).
   ========================================================================= */
export const AnimatedWealthGrowthSection: React.FC = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  // Left card stats counting up
  const animatedAssets = useCountUp(1.42, 1700, isInView, 2);
  const animatedLiabilities = useCountUp(17.5, 1500, isInView, 1);
  const animatedNetWorth = useCountUp(1.24, 1800, isInView, 2);
  const animatedGrowth = useCountUp(14.8, 1600, isInView, 1);

  // Y-axis 10 numbered scale levels: 10 down to 0
  const yAxisLevels = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

  // 5 milestones along the curve
  const milestones = [
    { year: '2022', label: '₹35L', x: 20, y: 165 },
    { year: '2023', label: '₹54L', x: 135, y: 135 },
    { year: '2024', label: '₹78L', x: 260, y: 95 },
    { year: '2025', label: '₹98L', x: 385, y: 55 },
    { year: '2026', label: '₹1.24 Cr', x: 490, y: 20 }
  ];

  return (
    <section ref={ref} id="wealth" className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: Net Worth Narrative & Animated Metrics */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
              NET WORTH INTELLIGENCE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Watch Your Wealth Grow
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Track your net worth over months and years and understand whether your financial decisions are moving you forward.
            </p>
          </div>

          {/* 4 Stat Cards with Animated Count-Ups */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 transition-all hover:border-slate-300">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Assets</span>
              <span className="text-lg sm:text-xl font-bold text-slate-900">
                ₹{animatedAssets} Cr
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 transition-all hover:border-slate-300">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Liabilities</span>
              <span className="text-lg sm:text-xl font-bold text-rose-600">
                ₹{animatedLiabilities}L
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 transition-all hover:border-emerald-300">
              <span className="text-[10px] text-emerald-800 uppercase tracking-wider block">Net Worth</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-700">
                ₹{animatedNetWorth} Cr
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 transition-all hover:border-emerald-300">
              <span className="text-[10px] text-emerald-800 uppercase tracking-wider block">YoY Growth</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-700">
                +{animatedGrowth}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Growth Chart Visual with 10 Numbers (0-10) and Animated 5-Year Curve */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Net Worth Curve (5 Years)
              </h4>
              <span className="text-[11px] text-slate-500">
                Compounding Trajectory from Year 1 to 5
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
              ₹1,24,50,000 Current
            </span>
          </div>

          <div className="h-64 relative w-full flex">
            {/* Vertical Y-Axis Scale with 10 numbers (0 to 10) */}
            <div className="w-8 flex flex-col justify-between items-center text-[10px] font-mono text-slate-400 select-none pr-1 pb-4">
              {yAxisLevels.map(num => (
                <span key={num} className={num === 10 ? 'font-bold text-emerald-600' : ''}>
                  {num}
                </span>
              ))}
            </div>

            {/* SVG Chart Canvas with Grid Crosses and Animated Curve */}
            <div className="flex-1 h-full relative">
              <svg 
                viewBox="0 0 500 200" 
                className="w-full h-full overflow-visible" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="wealthCurveGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* 10 Numbered Horizontal Grid Lines with clean Crosses (+) */}
                {yAxisLevels.map((lvl, idx) => {
                  const y = 15 + idx * 16.5;
                  return (
                    <g key={lvl} opacity="0.45">
                      <line 
                        x1="0" 
                        y1={y} 
                        x2="500" 
                        y2={y} 
                        stroke="#cbd5e1" 
                        strokeWidth="0.8" 
                        strokeDasharray="2 3" 
                      />
                      {/* Grid crosses at 5 milestone intervals */}
                      {[20, 135, 260, 385, 490].map(cx => (
                        <g key={cx}>
                          <line x1={cx - 3} y1={y} x2={cx + 3} y2={y} stroke="#94a3b8" strokeWidth="0.9" />
                          <line x1={cx} y1={y - 3} x2={cx} y2={y + 3} stroke="#94a3b8" strokeWidth="0.9" />
                        </g>
                      ))}
                    </g>
                  );
                })}

                {/* Animated Gradient Area under the curve */}
                <path
                  d="M 20 165 C 120 150, 200 120, 300 75 S 420 35, 490 20 L 490 185 L 20 185 Z"
                  fill="url(#wealthCurveGrad)"
                  className="transition-opacity duration-1000"
                  style={{
                    opacity: isInView ? 1 : 0,
                    transitionDelay: '0.4s'
                  }}
                />

                {/* Animated Compounding Curve Line (Draws from Year 1 upwards to Year 5) */}
                <path
                  d="M 20 165 C 120 150, 200 120, 300 75 S 420 35, 490 20"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 600,
                    strokeDashoffset: isInView ? 0 : 600,
                    transition: 'stroke-dashoffset 2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                />

                {/* 5 Milestone Dots across the 5 years */}
                {milestones.map((m, idx) => (
                  <g 
                    key={m.year} 
                    className="transition-all duration-700"
                    style={{
                      opacity: isInView ? 1 : 0,
                      transitionDelay: `${0.4 + idx * 0.3}s`
                    }}
                  >
                    {/* Pulsing ring for 2026 target milestone */}
                    {idx === milestones.length - 1 && (
                      <circle cx={m.x} cy={m.y} r="8" fill="#059669" opacity="0.3" className="animate-ping" />
                    )}
                    <circle cx={m.x} cy={m.y} r="5" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* 5-Year X-Axis Legend */}
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-3 pt-3 border-t border-slate-200">
            <span>2022: ₹35L</span>
            <span>2023: ₹54L</span>
            <span>2024: ₹78L</span>
            <span>2025: ₹98L</span>
            <span className="text-emerald-700 font-bold">2026: ₹1.24 Cr</span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* =========================================================================
   3. ANIMATED MONEY LIVE & ASSET ALLOCATION SECTION (Section 13)
   Animates portfolio amount from 0 to 1.something crore (₹1.24 Cr)
   and sweeps the doughnut chart segments on scroll.
   ========================================================================= */
export const AnimatedMoneyLiveSection: React.FC = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  // Animates from 0.00 to 1.24 Crore
  const animatedPortfolioCr = useCountUp(1.24, 1800, isInView, 2);

  // Circumference = 2 * PI * 38 ≈ 238.76
  const circ = 239;

  return (
    <section ref={ref} id="money-live-section" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
            PORTFOLIO STRATEGY
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
            Know Where Your Money Lives
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Keep risk calibrated with target vs actual allocation tracking across all asset categories.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl">
          
          {/* Left: Allocation Visual with animated ₹0 to ₹1.24 Cr Counter and Doughnut sweeps */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />

                {/* Equity: 64% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#059669"
                  strokeWidth="12"
                  strokeDasharray={`${circ * 0.64} ${circ * 0.36}`}
                  strokeDashoffset={isInView ? 0 : circ}
                  className="transition-all duration-1000 ease-out"
                />
                {/* Debt: 21% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#2563eb"
                  strokeWidth="12"
                  strokeDasharray={`${circ * 0.21} ${circ * 0.79}`}
                  strokeDashoffset={isInView ? -(circ * 0.64) : circ}
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '0.2s' }}
                />
                {/* Gold: 10% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#d97706"
                  strokeWidth="12"
                  strokeDasharray={`${circ * 0.10} ${circ * 0.90}`}
                  strokeDashoffset={isInView ? -(circ * 0.85) : circ}
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '0.4s' }}
                />
                {/* Cash: 5% */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#0d9488"
                  strokeWidth="12"
                  strokeDasharray={`${circ * 0.05} ${circ * 0.95}`}
                  strokeDashoffset={isInView ? -(circ * 0.95) : circ}
                  className="transition-all duration-1000 ease-out"
                  style={{ transitionDelay: '0.6s' }}
                />
              </svg>

              {/* Center Counter: 0 to 1.something Crore animation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-500 uppercase font-mono">Portfolio</span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight transition-all">
                  ₹{animatedPortfolioCr} Cr
                </span>
                <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-0.5">
                  Calibrated
                </span>
              </div>
            </div>

            {/* Asset Legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-[11px] font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Equity 64%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Debt 21%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Gold 10%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Cash 5%</span>
            </div>
          </div>

          {/* Right: Target vs Actual Comparison Bars with animated slide-ins */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs font-mono text-slate-500">
              <span>Asset Class</span>
              <span>Target vs Actual Allocation</span>
            </div>

            {/* Equity */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-900">Equities &amp; Mutual Funds</span>
                <span className="font-mono text-slate-600">Target 60% · <strong className="text-emerald-700">Actual 64%</strong></span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-emerald-600 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: isInView ? '64%' : '0%' }} 
                />
              </div>
              <span className="text-[10px] text-emerald-700 mt-1 block font-mono">+4% Overweight · Disciplined Compounder</span>
            </div>

            {/* Debt */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-900">Fixed Income, EPF &amp; PPF</span>
                <span className="font-mono text-slate-600">Target 25% · <strong className="text-blue-700">Actual 21%</strong></span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: isInView ? '21%' : '0%', transitionDelay: '0.2s' }} 
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block font-mono">-4% Underweight · Regular SIP Rebalance Active</span>
            </div>

            {/* Gold */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-900">Physical Gold &amp; SGBs</span>
                <span className="font-mono text-slate-600">Target 10% · <strong className="text-amber-700">Actual 10%</strong></span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: isInView ? '10%' : '0%', transitionDelay: '0.4s' }} 
                />
              </div>
              <span className="text-[10px] text-emerald-700 mt-1 block font-mono">0% Drift · Perfectly Balanced Target</span>
            </div>

            {/* Cash */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-900">Liquid Cash &amp; Emergency Reserves</span>
                <span className="font-mono text-slate-600">Target 5% · <strong className="text-teal-700">Actual 5%</strong></span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-teal-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: isInView ? '5%' : '0%', transitionDelay: '0.5s' }} 
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block font-mono">Liquid emergency buffer maintained</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
