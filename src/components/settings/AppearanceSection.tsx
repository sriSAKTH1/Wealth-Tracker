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
  Layers,
  HelpCircle,
  Info,
  RotateCcw
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { MainTab } from '../../types';

export const APP_FONTS = [
  { 
    id: 'plus_jakarta', 
    name: 'Plus Jakarta Sans', 
    fontClass: 'font-jakarta', 
    category: 'Modern Geometric Sans', 
    tag: 'Default',
    sampleText: '₹8,40,250 • Net Worth',
    desc: 'Crisp, contemporary geometric typography with balanced proportions and high legibility across all dashboards.',
    badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  { 
    id: 'roboto', 
    name: 'Roboto', 
    fontClass: 'font-roboto', 
    category: 'Neo-Grotesque Tech & Precision', 
    tag: 'Google Standard',
    sampleText: '₹8,40,250 • Net Worth',
    desc: 'Clean, neutral mechanical skeleton engineered by Google with smooth curves and high information density.',
    badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  },
  { 
    id: 'bungee', 
    name: 'Bungee', 
    fontClass: 'font-bungee', 
    category: 'Bold Display & Urban Signage', 
    tag: 'Heavy Arcade',
    sampleText: '₹8,40,250 • NET WORTH',
    desc: 'Heavyweight celebration of vertical urban signage; bold all-caps punch for balances and crypto stats.',
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  { 
    id: 'playfair', 
    name: 'Playfair Display', 
    fontClass: 'font-playfair', 
    category: 'Editorial Luxury & Wealth Serif', 
    tag: 'Private Wealth',
    sampleText: '₹8,40,250 • Net Worth',
    desc: 'High-contrast European serif evoking financial press, private banking, luxury portfolios, and editorial heritage.',
    badge: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  },
  { 
    id: 'cinzel', 
    name: 'Cinzel', 
    fontClass: 'font-cinzel', 
    category: 'Classical Roman Inscription', 
    tag: 'Imperial Stature',
    sampleText: '₹8,40,250 • NET WORTH',
    desc: 'Inspired by 1st-century Roman epigraphy; conveys sovereign permanence, gold vaults, and dynasty legacy.',
    badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  },
  { 
    id: 'orbitron', 
    name: 'Orbitron', 
    fontClass: 'font-orbitron', 
    category: 'Futuristic Sci-Fi HUD & Quant Terminal', 
    tag: 'Cyberpunk HUD',
    sampleText: '₹8,40,250 • NET WORTH',
    desc: 'Geometric display typeface styled after aerospace telemetry, digital HUDs, and algorithmic trading desks.',
    badge: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
  }
];

export const ACCENT_COLORS = [
  { id: 'blue', name: 'Electric Blue', hex: '#3b82f6', border: 'border-blue-500', bg: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'indigo', name: 'Royal Indigo', hex: '#6366f1', border: 'border-indigo-500', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { id: 'emerald', name: 'Emerald Vault', hex: '#10b981', border: 'border-emerald-500', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'purple', name: 'Amethyst Purple', hex: '#a855f7', border: 'border-purple-500', bg: 'bg-purple-500', ring: 'ring-purple-500' },
  { id: 'rose', name: 'Rose Wealth', hex: '#f43f5e', border: 'border-rose-500', bg: 'bg-rose-500', ring: 'ring-rose-500' },
  { id: 'amber', name: 'Sunset Amber', hex: '#f59e0b', border: 'border-amber-500', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { id: 'flavorfit', name: 'FlavorFit Ice Cyan', hex: '#9fe0e8', border: 'border-[#9fe0e8]', bg: 'bg-[#9fe0e8]', ring: 'ring-[#9fe0e8]' },
  { id: 'nature', name: 'Nature Olive', hex: '#606c38', border: 'border-[#606c38]', bg: 'bg-[#606c38]', ring: 'ring-[#606c38]' },
  { id: 'retro', name: 'Retro Terracotta', hex: '#c65952', border: 'border-[#c65952]', bg: 'bg-[#c65952]', ring: 'ring-[#c65952]' },
];

export const AppearanceSection: React.FC = () => {
  const { 
    theme, 
    setTheme, 
    isPrivateMode, 
    togglePrivateMode, 
    formatMoney, 
    accentColor, 
    setAccentColor,
    tooltipsEnabled,
    setTooltipsEnabled,
    toggleTooltips,
    fontFamily,
    setFontFamily
  } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

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

  const [customPreviewText, setCustomPreviewText] = useState<string>('₹8,40,250 Net Worth Portfolio');

  const handleFontFamilyChange = (fontId: string) => {
    setFontFamily(fontId);
    const chosen = APP_FONTS.find(f => f.id === fontId);
    showNotice(`Typography font updated to ${chosen?.name || fontId}`);
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
    const colorObj = ACCENT_COLORS.find(c => c.id === accId);
    showNotice(`Accent color set to ${colorObj?.name || accId} across the web app`);
  };

  const handleMaskOnBootToggle = () => {
    const next = !defaultMaskOnBoot;
    setDefaultMaskOnBoot(next);
    localStorage.setItem('fix_default_mask_on_boot', String(next));
    showNotice(next ? 'Startup privacy mask enabled' : 'Startup privacy mask disabled');
  };

  const handleToggleTooltips = (enable: boolean) => {
    setTooltipsEnabled(enable);
    showNotice(enable ? 'Interactive UI tooltips enabled (Default ON)' : 'Interactive UI tooltips disabled (OFF)');
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

      {/* 1. LIGHT / CURATED THEME SELECTOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
              Color Theme Mode
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
              4 Theme Modes
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Current: {theme}</span>
        </div>

        {/* Daylight Mode */}
        <div className="text-xs">
          {/* Light Theme Card */}
          <button
            id="theme-btn-light"
            onClick={() => {
              setTheme('light');
              setAccentColor('blue');
            }}
            className={`w-full p-4 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500 shadow-md ring-2 ring-amber-500/25 text-slate-900 dark:text-slate-100'
                : 'bg-white/60 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 hover:border-amber-300 text-slate-900 dark:text-slate-100'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-xs" />
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Editorial Light Theme</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                High legibility daylight canvas, soft cream-slate surfaces, and crisp contrast for daylight and office work.
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <div className="w-5 h-5 rounded-md bg-white border border-slate-300 shadow-xs" title="Daylight White #FFFFFF" />
                <div className="w-5 h-5 rounded-md bg-[#F4F7FB] border border-slate-300" title="Soft Mist Canvas #F4F7FB" />
                <div className="w-5 h-5 rounded-md bg-[#2563EB]" title="Electric Blue #2563EB" />
                <div className="w-5 h-5 rounded-md bg-[#F59E0B]" title="Sunlight Amber #F59E0B" />
              </div>
            </div>
            {theme === 'light' && <Check className="w-5 h-5 text-amber-500 shrink-0" />}
          </button>
        </div>

        {/* 3 Reference Palette Modes */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Curated Designer Palettes (3 Reference Modes)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* 1. FlavorFit Neo-Dark (Reference Image Mode) */}
            <button
              id="theme-btn-flavorfit"
              onClick={() => {
                setTheme('flavorfit');
                setAccentColor('flavorfit');
              }}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                theme === 'flavorfit'
                  ? 'bg-slate-900 border-[#9FE0E8] shadow-md ring-2 ring-[#9FE0E8]/30 text-white'
                  : 'bg-white/40 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 hover:border-cyan-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#9FE0E8]" />
                  <span>FlavorFit Neo-Dark</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sleek dark obsidian canvas with pastel Ice Cyan, Lilac Lavender, and Apricot Cream bento cards.
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="w-5 h-5 rounded-md bg-[#0B0C14] border border-slate-700 shadow-xs" title="Obsidian Canvas #0B0C14" />
                  <div className="w-5 h-5 rounded-md bg-[#9FE0E8] shadow-xs" title="Ice Cyan #9FE0E8" />
                  <div className="w-5 h-5 rounded-md bg-[#C7C4F8]" title="Lilac Lavender #C7C4F8" />
                  <div className="w-5 h-5 rounded-md bg-[#EDD0BA]" title="Apricot Cream #EDD0BA" />
                </div>
              </div>
              {theme === 'flavorfit' && <Check className="w-5 h-5 text-[#9FE0E8] shrink-0" />}
            </button>

            {/* 2. Nature Theme (Image 2) */}
            <button
              id="theme-btn-nature"
              onClick={() => {
                setTheme('nature');
                setAccentColor('nature');
              }}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                theme === 'nature'
                  ? 'bg-emerald-50/70 border-[#606C38] shadow-md ring-2 ring-[#606C38]/30'
                  : 'bg-white/40 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 hover:border-emerald-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#606C38]" />
                  <span>Nature Theme</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Organic earthy palette with sage green, calming linen cream, deep olive moss, and golden mustard.
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="w-5 h-5 rounded-md bg-[#B4C5A4] shadow-xs" title="Sage Green #B4C5A4" />
                  <div className="w-5 h-5 rounded-md bg-[#F5F2EB] border border-amber-200" title="Organic Cream #F5F2EB" />
                  <div className="w-5 h-5 rounded-md bg-[#606C38]" title="Olive Moss #606C38" />
                  <div className="w-5 h-5 rounded-md bg-[#B6A136]" title="Golden Mustard #B6A136" />
                </div>
              </div>
              {theme === 'nature' && <Check className="w-5 h-5 text-[#606C38] shrink-0" />}
            </button>

            {/* 3. Retro 90s (Image 3) */}
            <button
              id="theme-btn-retro"
              onClick={() => {
                setTheme('retro');
                setAccentColor('retro');
              }}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                theme === 'retro'
                  ? 'bg-amber-50/70 border-[#C65952] shadow-md ring-2 ring-[#C65952]/30'
                  : 'bg-white/40 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 hover:border-amber-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#C65952]" />
                  <span>Retro 90s</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Nostalgic 90s aesthetic featuring warm kraft sand, antique paper ivory, dusty denim blue, and terracotta.
                </p>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="w-5 h-5 rounded-md bg-[#E8DEC8] shadow-xs border border-amber-300" title="Kraft Sand #E8DEC8" />
                  <div className="w-5 h-5 rounded-md bg-[#FAF6ED] border border-slate-300 shadow-xs" title="Antique Paper #FAF6ED" />
                  <div className="w-5 h-5 rounded-md bg-[#6B9AC4]" title="Dusty 90s Denim #6B9AC4" />
                  <div className="w-5 h-5 rounded-md bg-[#C65952]" title="Terracotta Rust #C65952" />
                </div>
              </div>
              {theme === 'retro' && <Check className="w-5 h-5 text-[#C65952] shrink-0" />}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Customization Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* 2. TYPOGRAPHY & FONT FAMILIES (MD:COL-SPAN-2) */}
        <div className={`p-6 rounded-3xl border space-y-6 md:col-span-2 shadow-xs transition-all ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                  <Type className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Typography & Font Family Themes
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold border border-purple-500/20">
                  {APP_FONTS.find(f => f.id === fontFamily)?.name || 'Plus Jakarta Sans'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Customize the global typeface across all charts, widgets, metrics, and navigation. Includes Roboto, Bungee, Playfair Display, Cinzel, Orbitron, and Plus Jakarta Sans.
              </p>
            </div>

            <button
              onClick={() => handleFontFamilyChange('plus_jakarta')}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Default (Plus Jakarta Sans)
            </button>
          </div>

          {/* 6 Font Family Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {APP_FONTS.map(font => {
              const isActive = fontFamily === font.id;
              return (
                <button
                  key={font.id}
                  onClick={() => handleFontFamilyChange(font.id)}
                  className={`group relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isActive
                      ? isLight
                        ? 'bg-white border-purple-500 ring-2 ring-purple-500/20 shadow-md shadow-purple-500/5'
                        : 'bg-slate-900 border-purple-500 ring-2 ring-purple-500/30 shadow-md shadow-purple-900/20'
                      : isLight
                        ? 'bg-white/80 border-slate-200/90 hover:border-slate-300 hover:bg-white'
                        : 'bg-slate-900/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Top Bar: Icon Lettermark, Name in Font, Tag */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-transform group-hover:scale-105 ${font.fontClass} ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-sm'
                          : isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                      }`}>
                        Aa
                      </div>
                      <div>
                        <div className={`text-sm font-bold text-slate-900 dark:text-slate-100 ${font.fontClass}`}>
                          {font.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {font.category}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider shrink-0 ${font.badge}`}>
                      {font.tag}
                    </span>
                  </div>

                  {/* Authentic Font Typeface Sample */}
                  <div className={`p-2.5 rounded-xl border transition-colors ${font.fontClass} ${
                    isActive
                      ? isLight ? 'bg-purple-50/60 border-purple-200 text-purple-950' : 'bg-purple-950/20 border-purple-800/40 text-purple-200'
                      : isLight ? 'bg-slate-50 border-slate-100 text-slate-800' : 'bg-slate-950/40 border-slate-800/60 text-slate-300'
                  }`}>
                    <div className="text-[11px] font-bold truncate">
                      {font.sampleText}
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5 font-mono">
                      1 2 3 4 5 6 7 8 9 0 • % $ € £ ₹
                    </div>
                  </div>

                  {/* Description & Selection Indicator */}
                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-500 dark:text-slate-400 line-clamp-1 pr-2">
                      {font.desc}
                    </span>
                    {isActive ? (
                      <span className="flex items-center gap-1 font-bold text-purple-600 dark:text-purple-400 shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        Active
                      </span>
                    ) : (
                      <span className="text-slate-400 group-hover:text-purple-500 font-medium shrink-0">
                        Select →
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Controls: Scaling & Live Interactive Typography Tester */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            
            {/* UI Scaling */}
            <div className={`p-4 rounded-2xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-500" />
                  Typographic Scale
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-bold capitalize">
                  {fontSize}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'compact', label: 'Compact', scale: '90%' },
                  { id: 'standard', label: 'Standard', scale: '100%' },
                  { id: 'large', label: 'Large', scale: '110%' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleFontSizeChange(opt.id)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                      fontSize === opt.id
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm font-bold'
                        : isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{opt.label}</div>
                    <div className="text-[9px] font-mono opacity-80">{opt.scale}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Live Font Sandbox */}
            <div className={`p-4 rounded-2xl border lg:col-span-2 space-y-2.5 ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Live Type Inspection & Sandbox</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Active: {APP_FONTS.find(f => f.id === fontFamily)?.name} • Scale: {fontSize}
                </span>
              </div>

              {/* Custom Editable Text Input for instant verification */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customPreviewText}
                  onChange={(e) => setCustomPreviewText(e.target.value)}
                  placeholder="Type any custom text or currency amount to preview..."
                  className={`w-full px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-purple-500' 
                      : 'bg-slate-950 border-slate-800 text-slate-100 focus:bg-slate-900 focus:border-purple-500'
                  } outline-hidden`}
                />
              </div>

              {/* Live Render Area using dynamic font-family */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                isLight ? 'bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-100' : 'bg-gradient-to-r from-purple-950/20 to-blue-950/20 border-purple-900/30'
              }`}>
                <div className={`font-black text-slate-900 dark:text-slate-100 truncate tracking-tight ${
                  fontSize === 'compact' ? 'text-base' : fontSize === 'large' ? 'text-xl' : 'text-lg'
                }`}>
                  {customPreviewText || '₹8,40,250 Net Worth Portfolio'}
                </div>
                <div className={`text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 ${
                  fontSize === 'compact' ? 'text-[10px]' : fontSize === 'large' ? 'text-xs' : 'text-[11px]'
                }`}>
                  <span>Valuation: {formatMoney(840250)}</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-semibold">+18.4% YTD Growth</span>
                  <span>•</span>
                  <span>Asset Allocation: 64% Equity • 22% Real Estate • 14% Cash</span>
                </div>
              </div>
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
                id={`btn-accent-${color.id}`}
                onClick={() => handleAccentChange(color.id)}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? isLight ? 'bg-white border-slate-400 ring-2 ring-blue-500/40 font-bold shadow-xs' : 'bg-slate-900 border-slate-600 ring-2 ring-blue-500/40 font-bold shadow-xs'
                    : isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-[11px] truncate">{color.name.split(' ')[0]}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-blue-500" style={{ color: color.hex }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. 🖍️ TEXT SELECTION & DRAG HIGHLIGHT COLOR (KEYBOARD SHORTCUTS: LITE-GREEN, RED, BLUE) */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Text Selection &amp; Drag Highlight Color
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-500">
            Shortcut: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Shift</kbd> to cycle
          </span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          When you copy, drag, or select text across the application, the highlight color dynamically reflects your chosen palette. Switch on the fly using keyboard shortcuts (<kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">⇧ + G</kbd>, <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">⇧ + R</kbd>, <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">⇧ + B</kbd>) or tap <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Shift</kbd> while text is selected.
        </p>

        {/* 4 Color Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              id: 'default',
              name: 'Default Theme',
              hex: '#3b82f6',
              textHex: '#ffffff',
              key: '⇧ + D',
              desc: 'Native theme accent glow',
            },
            {
              id: 'lite-green',
              name: 'Lite-Green',
              hex: '#86efac',
              textHex: '#064e3b',
              key: '⇧ + G',
              desc: 'Soft lime-green glow',
            },
            {
              id: 'red',
              name: 'Red',
              hex: '#fca5a5',
              textHex: '#7f1d1d',
              key: '⇧ + R',
              desc: 'Vibrant coral red glow',
            },
            {
              id: 'blue',
              name: 'Blue',
              hex: '#93c5fd',
              textHex: '#0c4a6e',
              key: '⇧ + B',
              desc: 'Crisp sky-blue marine glow',
            },
          ].map(colorOpt => {
            const currentSelectionColor = (typeof window !== 'undefined' && localStorage.getItem('app_text_highlight_color')) || 'default';
            const isCurSelected = currentSelectionColor === colorOpt.id;
            return (
              <button
                key={colorOpt.id}
                type="button"
                onClick={() => {
                  localStorage.setItem('app_text_highlight_color', colorOpt.id);
                  document.documentElement.setAttribute('data-selection-color', colorOpt.id);
                  document.body.setAttribute('data-selection-color', colorOpt.id);
                  const keyLetter = colorOpt.id === 'default' ? 'D' : colorOpt.id === 'lite-green' ? 'G' : colorOpt.id === 'red' ? 'R' : 'B';
                  window.dispatchEvent(new KeyboardEvent('keydown', { key: keyLetter, shiftKey: true }));
                  showNotice(`Text highlight color set to ${colorOpt.name}`);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                  isCurSelected
                    ? isLight ? 'bg-white border-slate-400 ring-2 ring-blue-500/40 shadow-xs' : 'bg-slate-900 border-slate-600 ring-2 ring-blue-500/40 shadow-xs'
                    : isLight ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span 
                      style={{ backgroundColor: colorOpt.hex }}
                      className="w-3.5 h-3.5 rounded-full border border-black/20 block"
                    />
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{colorOpt.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{colorOpt.desc}</div>
                  <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-semibold">{colorOpt.key}</div>
                </div>
                {isCurSelected && <Check className="w-4 h-4 text-blue-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Live Interactive Selection Test Box */}
        <div className={`p-4 rounded-xl border space-y-1.5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Live Text Selection Playground:
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 select-all cursor-text font-sans">
            ✨ <strong className="text-slate-900 dark:text-white">Try dragging or selecting this sentence with your cursor!</strong> When text is selected, press the <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold">Shift</kbd> key to cycle through Default Theme, Lite-Green, Red, and Blue.
          </p>
        </div>
      </div>

      {/* 8. 💡 INTERFACE TOOLTIPS & HOVER HINTS (DEFAULT ON / OFF TOGGLE) */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Interface Tooltips &amp; Hover Guidance
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              tooltipsEnabled 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' 
                : 'bg-slate-500/15 text-slate-400 border-slate-500/25'
            }`}>
              {tooltipsEnabled ? '● ON (Default)' : '○ OFF'}
            </span>
            <button
              type="button"
              onClick={() => handleToggleTooltips(true)}
              title="Reset tooltips to default (ON)"
              className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset to Default (ON)
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Display contextual guidance and descriptions on hover across navigation tabs, buttons, and action bars (such as the <strong className="text-slate-700 dark:text-slate-200">"Customize Appearance"</strong> tooltip on the Appearance button). By default, tooltips are turned <strong className="text-emerald-600 dark:text-emerald-400">ON</strong>.
        </p>

        {/* 2-Option Radio / Toggle Buttons: ON (Default) and OFF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            id="btn-tooltips-on"
            onClick={() => handleToggleTooltips(true)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
              tooltipsEnabled
                ? isLight 
                  ? 'bg-white border-blue-500 ring-2 ring-blue-500/30 shadow-xs' 
                  : 'bg-slate-900 border-blue-500 ring-2 ring-blue-500/30 shadow-xs'
                : isLight 
                  ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">Tooltips ON (Default)</span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                  Recommended
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Displays "Customize Appearance" and helpful hints when hovering over tabs &amp; buttons.
              </div>
            </div>
            {tooltipsEnabled && <Check className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
          </button>

          <button
            type="button"
            id="btn-tooltips-off"
            onClick={() => handleToggleTooltips(false)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
              !tooltipsEnabled
                ? isLight 
                  ? 'bg-white border-slate-400 ring-2 ring-slate-400/30 shadow-xs' 
                  : 'bg-slate-900 border-slate-600 ring-2 ring-slate-500/30 shadow-xs'
                : isLight 
                  ? 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100">Tooltips OFF</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Hides all hover tooltips and floating labels for a clutter-free, minimalist workflow.
              </div>
            </div>
            {!tooltipsEnabled && <Check className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />}
          </button>
        </div>

        {/* Live Interactive Hover Test Box */}
        <div className={`p-4 rounded-xl border space-y-2.5 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              Live Hover Test Sandbox:
            </span>
            <span className="text-[10px] text-slate-500">
              Status: {tooltipsEnabled ? 'Hover over the button below to see the tooltip' : 'Tooltips are currently OFF (no tooltip on hover)'}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              id="preview-btn-appearance"
              title={tooltipsEnabled ? 'Customize Appearance' : undefined}
              className={`relative group px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-500" />
              <span>🎨 Appearance (Hover Me)</span>

              {/* Tooltip on hover */}
              {tooltipsEnabled && (
                <span
                  role="tooltip"
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[11px] font-semibold text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-xl shadow-black/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-50 scale-95 group-hover:scale-100 flex items-center gap-1 border border-slate-700/60"
                >
                  <span>Customize Appearance</span>
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
                </span>
              )}
            </button>

            <span className="text-[11px] text-slate-500 italic">
              {tooltipsEnabled 
                ? '👈 Hover your mouse here to test the "Customize Appearance" tooltip!' 
                : '👈 Tooltips disabled. Switch to "ON (Default)" above to re-enable.'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
