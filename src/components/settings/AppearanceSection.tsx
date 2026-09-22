import React, { useState } from 'react';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Type, 
  LayoutGrid, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Check, 
  Sliders, 
  LineChart, 
  Maximize2,
  Layers
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { MainTab } from '../../types';

export const ACCENT_COLORS = [
  { id: 'blue', name: 'Electric Blue', hex: '#3b82f6', border: 'border-blue-500', bg: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'indigo', name: 'Royal Indigo', hex: '#6366f1', border: 'border-indigo-500', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { id: 'emerald', name: 'Emerald Vault', hex: '#10b981', border: 'border-emerald-500', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'purple', name: 'Amethyst Purple', hex: '#a855f7', border: 'border-purple-500', bg: 'bg-purple-500', ring: 'ring-purple-500' },
  { id: 'rose', name: 'Rose Wealth', hex: '#f43f5e', border: 'border-rose-500', bg: 'bg-rose-500', ring: 'ring-rose-500' },
  { id: 'amber', name: 'Sunset Amber', hex: '#f59e0b', border: 'border-amber-500', bg: 'bg-amber-500', ring: 'ring-amber-500' },
];

export const AppearanceSection: React.FC = () => {
  const { theme, setTheme, isPrivateMode, togglePrivateMode, formatMoney } = useFinance();
  const isLight = theme === 'light';

  // 1. Font Size State
  const [fontSize, setFontSize] = useState<string>(() => {
    return localStorage.getItem('fix_appearance_font_size') || 'standard';
  });

  // 2. Layout Density State
  const [density, setDensity] = useState<'comfortable' | 'compact'>(() => {
    return (localStorage.getItem('fix_appearance_density') as 'comfortable' | 'compact') || 'comfortable';
  });

  // 3. Default Landing Screen
  const [defaultLanding, setDefaultLanding] = useState<MainTab>(() => {
    return (localStorage.getItem('fix_default_landing_tab') as MainTab) || 'overview';
  });

  // 4. Chart Visual Style
  const [chartStyle, setChartStyle] = useState<string>(() => {
    return localStorage.getItem('fix_chart_curve_style') || 'smooth';
  });

  // 5. Accent Color
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('fix_accent_color') || 'blue';
  });

  // 6. Default Privacy on Boot
  const [defaultMaskOnBoot, setDefaultMaskOnBoot] = useState<boolean>(() => {
    return localStorage.getItem('fix_default_mask_on_boot') === 'true';
  });

  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const showNotice = (text: string) => {
    setSavedNotice(text);
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleFontSizeChange = (size: string) => {
    setFontSize(size);
    localStorage.setItem('fix_appearance_font_size', size);
    // Apply standard font size body style attribute or zoom simulation
    const root = document.documentElement;
    if (size === 'compact') {
      root.style.fontSize = '14.5px';
    } else if (size === 'large') {
      root.style.fontSize = '17.5px';
    } else {
      root.style.fontSize = '16px';
    }
    showNotice(`Font size adjusted to ${size}`);
  };

  const handleDensityChange = (d: 'comfortable' | 'compact') => {
    setDensity(d);
    localStorage.setItem('fix_appearance_density', d);
    showNotice(`Layout density set to ${d}`);
  };

  const handleLandingChange = (tab: MainTab) => {
    setDefaultLanding(tab);
    localStorage.setItem('fix_default_landing_tab', tab);
    showNotice(`Default startup tab set to ${tab}`);
  };

  const handleChartStyleChange = (style: string) => {
    setChartStyle(style);
    localStorage.setItem('fix_chart_curve_style', style);
    showNotice(`Chart curves styled as ${style}`);
  };

  const handleAccentChange = (accId: string) => {
    setAccentColor(accId);
    localStorage.setItem('fix_accent_color', accId);
    showNotice('Accent theme color updated');
  };

  const handleMaskOnBootToggle = () => {
    const next = !defaultMaskOnBoot;
    setDefaultMaskOnBoot(next);
    localStorage.setItem('fix_default_mask_on_boot', String(next));
    showNotice(next ? 'Startup privacy mask enabled' : 'Startup privacy mask disabled');
  };

  const selectedAccent = ACCENT_COLORS.find(a => a.id === accentColor) || ACCENT_COLORS[0];

  return (
    <section id="section-appearance" className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-500">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Appearance & Visual Styling
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-500 border border-purple-500/20">
                Theme: {theme} • {density}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize light/dark mode, font size, layout, and dashboard appearance
            </p>
          </div>
        </div>

        {savedNotice && (
          <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>{savedNotice}</span>
          </div>
        )}
      </div>

      {/* 1. LIGHT / DARK / SYSTEM THEME SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
            Color Theme Mode
          </span>
          <span className="text-[10px] font-mono text-slate-500">Current: {theme}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Light Theme Card */}
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
              isLight
                ? 'bg-blue-50/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white/40 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Editorial Light Theme</span>
              </div>
              <p className="text-[11px] text-slate-600">
                High legibility, soft cream-slate canvas, crisp contrast for daylight and office work.
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <div className="w-5 h-5 rounded-md bg-white border border-slate-300 shadow-xs" />
                <div className="w-5 h-5 rounded-md bg-slate-100 border border-slate-300" />
                <div className="w-5 h-5 rounded-md bg-blue-600" />
              </div>
            </div>
            {isLight && <Check className="w-5 h-5 text-blue-600 shrink-0" />}
          </button>

          {/* Dark Theme Card */}
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all ${
              !isLight
                ? 'bg-slate-900 border-blue-500 shadow-md ring-2 ring-blue-500/20 text-white'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-100">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Midnight Dark Theme</span>
              </div>
              <p className="text-[11px] text-slate-400">
                OLED-friendly slate obsidian tones, reduced eye strain, deep contrast chart glows.
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <div className="w-5 h-5 rounded-md bg-slate-950 border border-slate-800" />
                <div className="w-5 h-5 rounded-md bg-slate-900 border border-slate-800" />
                <div className="w-5 h-5 rounded-md bg-blue-500" />
              </div>
            </div>
            {!isLight && <Check className="w-5 h-5 text-blue-400 shrink-0" />}
          </button>
        </div>
      </div>

      {/* Grid of Customization Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* 2. FONT SIZE & UI SCALING */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Type className="w-4 h-4 text-purple-500" />
              <span>Typography & UI Scale</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-500 font-bold capitalize">
              {fontSize}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Adjust the baseline typographic scale and button sizing across all dashboards.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'compact', label: 'Compact', scale: '90%', desc: 'Dense data display' },
              { id: 'standard', label: 'Standard', scale: '100%', desc: 'Balanced default' },
              { id: 'large', label: 'Large', scale: '110%', desc: 'Relaxed reading' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => handleFontSizeChange(opt.id)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  fontSize === opt.id
                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm font-bold'
                    : isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="text-[10px] font-mono opacity-80">{opt.scale}</div>
                <div className="text-[9px] mt-0.5 opacity-70 truncate">{opt.desc}</div>
              </button>
            ))}
          </div>

          {/* Typography Sample Preview */}
          <div className={`p-3 rounded-xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div className="text-[10px] text-slate-500 mb-1 font-mono">Live Typography Sample:</div>
            <div className={`font-black text-slate-900 dark:text-slate-100 ${
              fontSize === 'compact' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base'
            }`}>
              Net Worth Valuation: {formatMoney(840250)}
            </div>
            <div className={`text-slate-500 ${
              fontSize === 'compact' ? 'text-[10px]' : fontSize === 'large' ? 'text-xs' : 'text-[11px]'
            }`}>
              Asset Allocation: 64% Equity • 22% Real Estate • 14% Liquid Cash
            </div>
          </div>
        </div>

        {/* 3. LAYOUT & DENSITY PREFERENCES */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <LayoutGrid className="w-4 h-4 text-emerald-500" />
              <span>Layout Density & Spacing</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-bold capitalize">
              {density}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Configure card padding, table line-height, and information density.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDensityChange('comfortable')}
              className={`p-3 rounded-xl border text-left transition-all ${
                density === 'comfortable'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold'
                  : isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="font-bold">Comfortable</div>
              <div className={`text-[10px] mt-0.5 ${density === 'comfortable' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Generous margins, relaxed whitespace, ideal for daily personal review
              </div>
            </button>

            <button
              onClick={() => handleDensityChange('compact')}
              className={`p-3 rounded-xl border text-left transition-all ${
                density === 'compact'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold'
                  : isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <div className="font-bold">Compact (Dense)</div>
              <div className={`text-[10px] mt-0.5 ${density === 'compact' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Condensed paddings, higher data row density for audit & multi-asset ledgers
              </div>
            </button>
          </div>

          {/* Privacy Mask Preference */}
          <div className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-xs">Default Privacy Mask on App Start</div>
              <div className="text-[10px] text-slate-500">Automatically blur balances upon opening</div>
            </div>
            <button
              onClick={handleMaskOnBootToggle}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                defaultMaskOnBoot
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {defaultMaskOnBoot ? 'Masked' : 'Revealed'}
            </button>
          </div>
        </div>

        {/* 4. DASHBOARD APPEARANCE & STARTUP VIEW */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>Default Startup Landing Screen</span>
            </div>
            <span className="text-[10px] font-mono text-blue-500 font-bold capitalize">
              {defaultLanding}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Select which section of the financial platform opens first when the application loads.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'overview', label: 'Dashboard & Overview', desc: 'Net worth & summary cards' },
              { id: 'wealth', label: 'Wealth & Allocation', desc: 'Asset breakdown & portfolio' },
              { id: 'goals', label: 'Goals & Essentials', desc: 'Runway & target milestones' },
              { id: 'balancesheet', label: 'Balance Sheet & Audit', desc: 'Formal financial statement' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => handleLandingChange(item.id as MainTab)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  defaultLanding === item.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-bold'
                    : isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs">{item.label}</div>
                <div className={`text-[10px] ${defaultLanding === item.id ? 'text-blue-100' : 'text-slate-400'}`}>
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 5. CHART VISUAL CURVE STYLE */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <LineChart className="w-4 h-4 text-indigo-500" />
              <span>Chart Rendering Aesthetics</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-500 font-bold capitalize">
              {chartStyle}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Choose curve interpolations for net worth history and asset growth charts.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'smooth', label: 'Smooth Spline', desc: 'Organic natural curves' },
              { id: 'linear', label: 'Linear Sharp', desc: 'Direct point-to-point' },
              { id: 'step', label: 'Stepped Delta', desc: 'Discrete event jumps' },
            ].map(st => (
              <button
                key={st.id}
                onClick={() => handleChartStyleChange(st.id)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  chartStyle === st.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm font-bold'
                    : isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="font-bold text-xs">{st.label}</div>
                <div className="text-[10px] opacity-80 mt-0.5">{st.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. ACCENT COLOR PALETTE SELECTION */}
      <div className={`p-5 rounded-2xl border space-y-3 ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Interactive Accent Color Highlight
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            Active: {selectedAccent.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {ACCENT_COLORS.map(color => {
            const isSelected = accentColor === color.id;
            return (
              <button
                key={color.id}
                onClick={() => handleAccentChange(color.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                  isSelected
                    ? isLight ? 'bg-white border-slate-400 ring-2 ring-blue-500/30 font-bold shadow-xs' : 'bg-slate-900 border-slate-600 ring-2 ring-blue-500/30 font-bold shadow-xs'
                    : isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[11px] truncate">{color.name.split(' ')[0]}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-blue-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
