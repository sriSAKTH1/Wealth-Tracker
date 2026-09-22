import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { TrendingUp, Activity, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface IncomeVelocityChartProps {
  isLight?: boolean;
}

export const IncomeVelocityChart: React.FC<IncomeVelocityChartProps> = ({ isLight }) => {
  const { monthlyIncome, formatMoney, currency } = useFinance();
  const [chartMode, setChartMode] = useState<'stream' | 'cadence'>('stream');

  // Compute 4-week cadence breakdown based on actual monthly income
  const base = Math.max(500, Math.round(monthlyIncome * 0.65));
  const week1 = Math.round(base * 0.95);
  const week2 = Math.round(monthlyIncome * 0.12);
  const week3 = Math.round(monthlyIncome * 0.18);
  const week4 = Math.max(100, monthlyIncome - (week1 + week2 + week3));

  const cadenceData = [
    { period: 'W1: Base Salary', amount: week1, source: 'Primary Inflow', reliability: '99%', color: '#10b981' },
    { period: 'W2: Dividends/Yield', amount: week2, source: 'Passive Income', reliability: '92%', color: '#06b6d4' },
    { period: 'W3: Advisory/Side', amount: week3, source: 'Variable/Contract', reliability: '85%', color: '#3b82f6' },
    { period: 'W4: Cashflow Inflow', amount: week4, source: 'Bonus / Secondary', reliability: '88%', color: '#10b981' },
  ];

  const streamData = [
    { day: 'Day 1', inflow: Math.round(week1 * 0.8), source: 'Monthly Retainer' },
    { day: 'Day 5', inflow: Math.round(week1 * 0.2), source: 'Salary Credit' },
    { day: 'Day 10', inflow: Math.round(week2 * 0.4), source: 'Bond Interest' },
    { day: 'Day 15', inflow: Math.round(week2 * 0.6), source: 'Quarterly Dividends' },
    { day: 'Day 20', inflow: Math.round(week3 * 0.7), source: 'Client Milestone' },
    { day: 'Day 25', inflow: Math.round(week3 * 0.3), source: 'Royalty / Yield' },
    { day: 'Day 30', inflow: Math.round(week4), source: 'Interest & Accruals' },
  ];

  return (
    <div className={`p-3.5 rounded-2xl border transition-all mt-3 ${
      isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-950/70 border-slate-800'
    }`}>
      {/* Mini Controls */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-bold text-slate-300">
            {chartMode === 'stream' ? 'Inflow Velocity Stream' : 'Weekly Income Cadence'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setChartMode('stream')}
            className={`text-[9px] px-2 py-0.5 rounded-md font-medium transition-all ${
              chartMode === 'stream'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stream
          </button>
          <button
            onClick={() => setChartMode('cadence')}
            className={`text-[9px] px-2 py-0.5 rounded-md font-medium transition-all ${
              chartMode === 'cadence'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cadence
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'stream' ? (
            <AreaChart data={streamData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeStreamGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-[10px] font-mono shadow-xl">
                        <span className="text-slate-400 block">{d.day} • {d.source}</span>
                        <span className="text-emerald-400 font-bold">{formatMoney(d.inflow)}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="inflow" 
                stroke="#10b981" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#incomeStreamGrad)" 
              />
            </AreaChart>
          ) : (
            <BarChart data={cadenceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="period" stroke="#64748b" fontSize={8} tickLine={false} axisLine={false} tickFormatter={(v) => v.split(':')[0]} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-[10px] font-mono shadow-xl">
                        <span className="text-slate-400 block">{d.period}</span>
                        <span className="text-emerald-400 font-bold">{formatMoney(d.amount)}</span>
                        <span className="text-[9px] text-slate-500 block">Reliability: {d.reliability}</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {cadenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Cadence Metrics Pill */}
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-800/60 mt-1">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Reliability: <strong className="text-emerald-400">96.4%</strong>
        </span>
        <span>Runway Support: <strong className="text-blue-400">Solid</strong></span>
      </div>
    </div>
  );
};
