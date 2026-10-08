import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Lock, 
  Wallet, 
  ArrowRight, 
  Coins, 
  PieChart, 
  Sparkles, 
  CheckCircle2, 
  Shield, 
  ChevronRight,
  Zap, 
  BarChart3, 
  FlaskConical, 
  ChevronDown, 
  UserCheck, 
  Check,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Compass,
  FileSpreadsheet,
  Download,
  Trash2,
  Menu,
  X,
  Target,
  Clock,
  DollarSign,
  Activity,
  Award,
  Landmark,
  Receipt,
  Percent,
  LineChart,
  IndianRupee,
  PiggyBank,
  CreditCard,
  Umbrella,
  Home,
  Car,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Floating Translucent Financial Icons for Hero Entry (Matching reference line-art icons)
interface FloatingFinanceIcon {
  id: string;
  name: string;
  subtitle: string;
  iconType: 'rupee' | 'barchart' | 'lock' | 'bank' | 'piggybank' | 'umbrella' | 'coins' | 'calculator' | 'creditcard' | 'home' | 'car' | 'smartphone' | 'linechart' | 'receipt' | 'wallet' | 'shield';
  x: string;
  y: string;
  animClass: 'animate-float-gentle' | 'animate-float-sway' | 'animate-float-reverse';
  delay: string;
  duration: string;
  size: 'sm' | 'md' | 'lg';
  themeColor: 'emerald' | 'blue' | 'teal' | 'amber' | 'indigo' | 'slate';
  showOnMobile?: boolean;
}

const HERO_FLOATING_FINANCE_ICONS: FloatingFinanceIcon[] = [
  // Primary Icons (Explicitly requested: Rupee, Bar Chart, Lock)
  {
    id: 'hero-rupee',
    name: '₹ Indian Rupee',
    subtitle: 'Currency Standard',
    iconType: 'rupee',
    x: '3%',
    y: '10%',
    animClass: 'animate-float-gentle',
    delay: '0s',
    duration: '6.2s',
    size: 'lg',
    themeColor: 'emerald',
    showOnMobile: true
  },
  {
    id: 'hero-barchart',
    name: 'Portfolio Growth',
    subtitle: 'Compounding Analytics',
    iconType: 'barchart',
    x: '89%',
    y: '12%',
    animClass: 'animate-float-sway',
    delay: '0.8s',
    duration: '7.4s',
    size: 'lg',
    themeColor: 'teal',
    showOnMobile: true
  },
  {
    id: 'hero-lock',
    name: 'Isolated Vault',
    subtitle: 'Zero-Knowledge Security',
    iconType: 'lock',
    x: '5%',
    y: '33%',
    animClass: 'animate-float-reverse',
    delay: '1.5s',
    duration: '6.8s',
    size: 'lg',
    themeColor: 'emerald',
    showOnMobile: true
  },
  // Key Reference Line-Art Icons from User Asset Sheet
  {
    id: 'hero-bank',
    name: 'Bank & Fixed Deposits',
    subtitle: 'Institutional Pillars',
    iconType: 'bank',
    x: '88%',
    y: '30%',
    animClass: 'animate-float-gentle',
    delay: '2.1s',
    duration: '7.1s',
    size: 'md',
    themeColor: 'blue'
  },
  {
    id: 'hero-piggybank',
    name: 'Smart Savings',
    subtitle: 'Compounding Reserves',
    iconType: 'piggybank',
    x: '2%',
    y: '54%',
    animClass: 'animate-float-sway',
    delay: '1.2s',
    duration: '6.9s',
    size: 'md',
    themeColor: 'amber',
    showOnMobile: true
  },
  {
    id: 'hero-umbrella',
    name: 'Wealth Insurance',
    subtitle: 'Term & Health Cover',
    iconType: 'umbrella',
    x: '92%',
    y: '52%',
    animClass: 'animate-float-reverse',
    delay: '2.7s',
    duration: '6.5s',
    size: 'md',
    themeColor: 'teal'
  },
  {
    id: 'hero-coins',
    name: 'Gold & Bullion',
    subtitle: 'SGB & 24K Physical',
    iconType: 'coins',
    x: '7%',
    y: '76%',
    animClass: 'animate-float-gentle',
    delay: '0.5s',
    duration: '7.6s',
    size: 'md',
    themeColor: 'amber'
  },
  {
    id: 'hero-calculator',
    name: 'SIP & Tax Calculator',
    subtitle: 'FIRE Independence Tool',
    iconType: 'calculator',
    x: '86%',
    y: '74%',
    animClass: 'animate-float-sway',
    delay: '1.9s',
    duration: '6.7s',
    size: 'md',
    themeColor: 'emerald'
  },
  {
    id: 'hero-creditcard',
    name: 'Cards & Outflow',
    subtitle: 'Expense Control',
    iconType: 'creditcard',
    x: '14%',
    y: '88%',
    animClass: 'animate-float-reverse',
    delay: '3.1s',
    duration: '7.3s',
    size: 'sm',
    themeColor: 'indigo'
  },
  {
    id: 'hero-home',
    name: 'Real Estate & Land',
    subtitle: 'Property Net Worth',
    iconType: 'home',
    x: '80%',
    y: '90%',
    animClass: 'animate-float-gentle',
    delay: '2.4s',
    duration: '8.1s',
    size: 'sm',
    themeColor: 'blue'
  },
  {
    id: 'hero-smartphone',
    name: 'Mobile Wealth Engine',
    subtitle: 'Pocket Intelligence',
    iconType: 'smartphone',
    x: '15%',
    y: '20%',
    animClass: 'animate-float-sway',
    delay: '3.4s',
    duration: '7.8s',
    size: 'sm',
    themeColor: 'slate'
  },
  {
    id: 'hero-linechart',
    name: 'Mutual Funds & Nifty',
    subtitle: 'Active CAGR',
    iconType: 'linechart',
    x: '79%',
    y: '18%',
    animClass: 'animate-float-reverse',
    delay: '1.1s',
    duration: '6.4s',
    size: 'sm',
    themeColor: 'emerald'
  },
  {
    id: 'hero-receipt',
    name: 'Financial Ledger',
    subtitle: 'Audit & Records',
    iconType: 'receipt',
    x: '17%',
    y: '66%',
    animClass: 'animate-float-gentle',
    delay: '2.9s',
    duration: '7.0s',
    size: 'sm',
    themeColor: 'slate'
  },
  {
    id: 'hero-car',
    name: 'Vehicle Assets',
    subtitle: 'Automobile Ledger',
    iconType: 'car',
    x: '82%',
    y: '63%',
    animClass: 'animate-float-sway',
    delay: '1.7s',
    duration: '7.5s',
    size: 'sm',
    themeColor: 'indigo'
  },
  {
    id: 'hero-wallet',
    name: 'Liquid INR Reserves',
    subtitle: 'Instant Liquidity',
    iconType: 'wallet',
    x: '4%',
    y: '43%',
    animClass: 'animate-float-reverse',
    delay: '0.3s',
    duration: '6.6s',
    size: 'sm',
    themeColor: 'emerald'
  },
  {
    id: 'hero-shield',
    name: 'Device-Only Vault',
    subtitle: '100% Client Isolation',
    iconType: 'shield',
    x: '93%',
    y: '42%',
    animClass: 'animate-float-gentle',
    delay: '2.2s',
    duration: '7.9s',
    size: 'sm',
    themeColor: 'teal'
  }
];

// Interactive Graph Horizons & Compounding Paths
interface GraphTrajectory {
  title: string;
  badge: string;
  growth: string;
  curNetWorth: string;
  points: { year: string; value: string; x: number; y: number; detail: string }[];
  svgPath: string;
  svgArea: string;
  cagr: string;
}

const HERO_GRAPH_DATA: Record<'1Y' | '3Y' | '5Y' | 'FIRE', GraphTrajectory> = {
  '1Y': {
    title: '1-Year Portfolio Trajectory',
    badge: 'FY 2025-26 Performance',
    growth: '+14.8% YoY',
    curNetWorth: '₹1,24,50,000',
    cagr: '14.8% Annualized',
    svgPath: 'M 20 142 Q 135 118 250 88 T 490 24',
    svgArea: 'M 20 142 Q 135 118 250 88 T 490 24 L 490 180 L 20 180 Z',
    points: [
      { year: 'Q1 2025', value: '₹1.08 Cr', x: 20, y: 142, detail: 'Initial Base' },
      { year: 'Q2 2025', value: '₹1.12 Cr', x: 135, y: 118, detail: '+₹4.0L SIP' },
      { year: 'Q3 2025', value: '₹1.16 Cr', x: 250, y: 88, detail: 'Market Rally' },
      { year: 'Q4 2025', value: '₹1.20 Cr', x: 370, y: 56, detail: '+₹4.2L Surplus' },
      { year: 'Today (2026)', value: '₹1.24 Cr', x: 490, y: 24, detail: 'Current Vault' }
    ]
  },
  '3Y': {
    title: '3-Year Compounding Acceleration',
    badge: 'Multi-Year Growth',
    growth: '+82.3% Total',
    curNetWorth: '₹1,24,50,000',
    cagr: '17.2% CAGR',
    svgPath: 'M 20 156 Q 165 112 320 66 T 490 24',
    svgArea: 'M 20 156 Q 165 112 320 66 T 490 24 L 490 180 L 20 180 Z',
    points: [
      { year: '2023', value: '₹68.3L', x: 20, y: 156, detail: 'Portfolio Start' },
      { year: '2024', value: '₹85.6L', x: 175, y: 112, detail: '+₹17.3L Gain' },
      { year: '2025', value: '₹1.05 Cr', x: 330, y: 66, detail: 'Milestone 1 Cr' },
      { year: 'Today (2026)', value: '₹1.24 Cr', x: 490, y: 24, detail: 'Current Vault' }
    ]
  },
  '5Y': {
    title: '5-Year Wealth Compounding Curve',
    badge: 'Long-term Compounding',
    growth: '+255.7% Total',
    curNetWorth: '₹1,24,50,000',
    cagr: '19.8% CAGR',
    svgPath: 'M 20 166 Q 130 138 250 96 T 380 58 T 490 20',
    svgArea: 'M 20 166 Q 130 138 250 96 T 380 58 T 490 20 L 490 180 L 20 180 Z',
    points: [
      { year: '2022', value: '₹35.0L', x: 20, y: 166, detail: 'Initial Foundation' },
      { year: '2023', value: '₹54.2L', x: 135, y: 138, detail: 'Early Compounding' },
      { year: '2024', value: '₹78.5L', x: 250, y: 96, detail: 'SIP Boost' },
      { year: '2025', value: '₹98.2L', x: 375, y: 58, detail: 'Near ₹1 Cr' },
      { year: 'Today (2026)', value: '₹1.24 Cr', x: 490, y: 20, detail: 'Current Vault' }
    ]
  },
  'FIRE': {
    title: 'FIRE Freedom Projection (To 2035)',
    badge: 'Financial Independence Target',
    growth: '+287% Projected',
    curNetWorth: '₹4,80,00,000',
    cagr: '13.5% Expected',
    svgPath: 'M 20 155 Q 135 120 250 82 T 375 46 T 490 14',
    svgArea: 'M 20 155 Q 135 120 250 82 T 375 46 T 490 14 L 490 180 L 20 180 Z',
    points: [
      { year: '2026', value: '₹1.24 Cr', x: 20, y: 155, detail: 'Current Capital' },
      { year: '2028', value: '₹1.85 Cr', x: 135, y: 120, detail: 'CoastFIRE Safe' },
      { year: '2030', value: '₹2.65 Cr', x: 250, y: 82, detail: 'LeanFIRE Met' },
      { year: '2032', value: '₹3.60 Cr', x: 375, y: 46, detail: 'Target Buffer' },
      { year: '2035 FIRE', value: '₹4.80 Cr', x: 490, y: 14, detail: 'Full Freedom' }
    ]
  }
};

export const LaunchPage: React.FC = () => {
  const { openAuthModal, enterTestMode } = useAuth();

  // Navigation and popover states
  const [isTestMenuOpen, setIsTestMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [activeAllocationTab, setActiveAllocationTab] = useState<'actual' | 'target'>('actual');
  const [scrolled, setScrolled] = useState(false);

  // Interactive Graph & Simulator States for Landing Page
  const [graphHorizon, setGraphHorizon] = useState<'1Y' | '3Y' | '5Y' | 'FIRE'>('5Y');
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(4);
  const [interactiveSip, setInteractiveSip] = useState<number>(45000);

  const testMenuRef = useRef<HTMLDivElement>(null);

  // Close test dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (testMenuRef.current && !testMenuRef.current.contains(event.target as Node)) {
        setIsTestMenuOpen(false);
      }
    };
    if (isTestMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTestMenuOpen]);

  // Launch Page is dedicated Light Mode only.
  // Sets light-theme for landing page, and cleanly restores main page theme when leaving.
  useEffect(() => {
    const prevHtmlClasses = Array.from(document.documentElement.classList);
    const prevBodyClasses = Array.from(document.body.classList);
    const prevHtmlTheme = document.documentElement.getAttribute('data-theme');
    const prevBodyTheme = document.body.getAttribute('data-theme');

    const darkThemeClasses = [
      'coolors-theme',
      'dark-theme',
      'midnight-theme',
      'emerald-theme',
      'slate-theme',
      'flavorfit-theme',
      'nature-theme',
      'retro-theme',
      'dark'
    ];
    document.documentElement.classList.remove(...darkThemeClasses);
    document.body.classList.remove(...darkThemeClasses);
    document.documentElement.classList.add('light-theme');
    document.body.classList.add('light-theme');
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.setAttribute('data-theme', 'light');

    return () => {
      document.documentElement.classList.remove('light-theme');
      document.body.classList.remove('light-theme');
      if (prevHtmlTheme) document.documentElement.setAttribute('data-theme', prevHtmlTheme);
      if (prevBodyTheme) document.body.setAttribute('data-theme', prevBodyTheme);
      prevHtmlClasses.forEach(cls => document.documentElement.classList.add(cls));
      prevBodyClasses.forEach(cls => document.body.classList.add(cls));
    };
  }, []);

  // Track header scroll state for sticky backdrop saturation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileNavOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="launch-page-root min-h-screen font-sans antialiased relative overflow-x-hidden bg-slate-50 text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-800 transition-colors duration-300">
      
      {/* Dynamic Background Noise / Gradient Grids */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-40">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-emerald-500/15 via-emerald-100/30 to-transparent blur-[140px]" />
        <div className="absolute top-[35%] -left-40 w-[600px] h-[600px] bg-blue-500/10 blur-[160px]" />
        <div className="absolute top-[65%] -right-40 w-[700px] h-[700px] bg-emerald-500/10 blur-[180px]" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* =========================================================================
          1. STICKY HEADER NAVIGATION (Light Mode Only)
          ========================================================================= */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-slate-200 shadow-sm shadow-slate-900/5'
          : 'bg-white/85 backdrop-blur-md border-slate-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 ring-1 ring-emerald-500/30 transition-transform group-hover:scale-105 shrink-0">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                    FIX Wealth
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    ₹ INR Native
                  </span>
                </div>
              </div>
            </a>
          </div>

          {/* Desktop Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <button 
              onClick={() => scrollToSection('overview')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Overview
            </button>
            <button 
              onClick={() => scrollToSection('wealth')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Wealth
            </button>
            <button 
              onClick={() => scrollToSection('goals')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Goals
            </button>
            <button 
              onClick={() => scrollToSection('cashflow')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cash Flow
            </button>
            <button 
              onClick={() => scrollToSection('calculators')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Calculators
            </button>
            <button 
              onClick={() => scrollToSection('security')}
              className="px-3 py-1.5 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Security
            </button>
          </nav>

          {/* Header Action Buttons & Privacy Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Small Privacy Pill Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-mono text-emerald-700">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Local Privacy</span>
            </div>

            {/* Try Demo Dropdown Trigger */}
            <div className="relative" ref={testMenuRef}>
              <button
                type="button"
                id="btn-launch-test-mode"
                onClick={() => setIsTestMenuOpen(!isTestMenuOpen)}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                title="Explore 1-Click Interactive Demo"
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                <span>Try Demo</span>
                <ChevronDown className={`w-3 h-3 transition-transform text-slate-400 ${isTestMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isTestMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Instant 1-Click Demo Sandbox
                  </div>
                  <button
                    type="button"
                    id="btn-header-test-user"
                    onClick={() => {
                      setIsTestMenuOpen(false);
                      enterTestMode('user');
                    }}
                    className="w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0 mt-0.5 border border-emerald-200/60">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1 text-slate-900">
                        <span>👤 Test as Client User</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        Pre-seeded ₹1.24 Cr portfolio, assets, cash flows &amp; goals
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="btn-header-test-admin"
                    onClick={() => {
                      setIsTestMenuOpen(false);
                      enterTestMode('admin');
                    }}
                    className="w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 mt-1 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 shrink-0 mt-0.5 border border-blue-200/60">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1 text-slate-900">
                        <span>👑 Test as Admin</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                        sudharsan@gmail.com with Master Admin Panel
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Login Button */}
            <button
              type="button"
              id="btn-launch-login"
              onClick={() => openAuthModal('login')}
              className="px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold border border-transparent hover:border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all cursor-pointer"
            >
              Login
            </button>

            {/* Primary Get Started Button */}
            <button
              type="button"
              id="btn-launch-signup"
              onClick={() => openAuthModal('register')}
              className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Navigation Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
              aria-label="Toggle navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileNavOpen && (
          <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button 
                onClick={() => scrollToSection('overview')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                Overview
              </button>
              <button 
                onClick={() => scrollToSection('wealth')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                Wealth
              </button>
              <button 
                onClick={() => scrollToSection('goals')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                Goals
              </button>
              <button 
                onClick={() => scrollToSection('cashflow')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                Cash Flow
              </button>
              <button 
                onClick={() => scrollToSection('calculators')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                Calculators
              </button>
              <button 
                onClick={() => scrollToSection('security')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/60 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              >
                Security
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  enterTestMode('user');
                }}
                className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-slate-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-50"
              >
                Try User Demo
              </button>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  openAuthModal('login');
                }}
                className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main className="relative z-10 flex-1">

        {/* =========================================================================
            6. HERO SECTION WITH FIRST-SCREEN FLOATING FINANCE ICONS ANIMATION
            ========================================================================= */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
          
          {/* FLOATING FINANCE ICONS ANIMATION LAYER (Landing Page First Screen Only) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
            {HERO_FLOATING_FINANCE_ICONS.map((item) => {
              // Sizing classes
              const sizeClasses = 
                item.size === 'lg' ? 'w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl' :
                item.size === 'md' ? 'w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl' :
                'w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl';

              const iconSizes = 
                item.size === 'lg' ? 'w-6 h-6 sm:w-7 sm:h-7' :
                item.size === 'md' ? 'w-5 h-5 sm:w-6 sm:h-6' :
                'w-4 h-4 sm:w-5 sm:h-5';

              // Color tints matching fintech taxonomy
              const colorTheme = 
                item.themeColor === 'emerald' ? 'text-emerald-700 bg-emerald-500/[0.08] border-emerald-400/40 hover:border-emerald-500 shadow-emerald-600/10' :
                item.themeColor === 'teal' ? 'text-teal-700 bg-teal-500/[0.08] border-teal-400/40 hover:border-teal-500 shadow-teal-600/10' :
                item.themeColor === 'blue' ? 'text-blue-700 bg-blue-500/[0.08] border-blue-400/40 hover:border-blue-500 shadow-blue-600/10' :
                item.themeColor === 'amber' ? 'text-amber-700 bg-amber-500/[0.08] border-amber-400/40 hover:border-amber-500 shadow-amber-600/10' :
                item.themeColor === 'indigo' ? 'text-indigo-700 bg-indigo-500/[0.08] border-indigo-400/40 hover:border-indigo-500 shadow-indigo-600/10' :
                'text-slate-700 bg-slate-500/[0.08] border-slate-300/60 hover:border-slate-500 shadow-slate-600/10';

              const visibility = item.showOnMobile ? 'flex' : 'hidden sm:flex';

              return (
                <div
                  key={item.id}
                  className={`absolute ${visibility} flex-col items-center group pointer-events-auto cursor-pointer ${item.animClass} transition-transform z-0`}
                  style={{
                    left: item.x,
                    top: item.y,
                    animationDelay: item.delay,
                    animationDuration: item.duration
                  }}
                  title={`${item.name} • ${item.subtitle}`}
                >
                  {/* Floating Translucent Glass Card */}
                  <div
                    className={`relative ${sizeClasses} ${colorTheme} bg-white/70 backdrop-blur-md border shadow-lg ring-1 ring-white/80 flex items-center justify-center transition-all duration-300 group-hover:scale-115 group-hover:bg-white/95 group-hover:shadow-xl`}
                  >
                    {/* Translucent specular shine */}
                    <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/60 via-transparent to-white/10 pointer-events-none" />

                    {/* Crisp Outline Financial Icon */}
                    <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                      {item.iconType === 'rupee' && <IndianRupee className={`${iconSizes} stroke-[2]`} />}
                      {item.iconType === 'barchart' && <BarChart3 className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'lock' && <Lock className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'bank' && <Landmark className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'piggybank' && <PiggyBank className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'umbrella' && <Umbrella className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'coins' && <Coins className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'calculator' && <Calculator className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'creditcard' && <CreditCard className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'home' && <Home className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'car' && <Car className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'smartphone' && <Smartphone className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'linechart' && <LineChart className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'receipt' && <Receipt className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'wallet' && <Wallet className={`${iconSizes} stroke-[1.75]`} />}
                      {item.iconType === 'shield' && <ShieldCheck className={`${iconSizes} stroke-[1.75]`} />}
                    </div>
                  </div>

                  {/* Translucent Micro Hover Tooltip */}
                  <div className="mt-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none -translate-y-1 group-hover:translate-y-0 whitespace-nowrap z-20">
                    <span className="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-[10px] font-mono font-medium text-white shadow-xl border border-slate-700/60 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{item.name}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            
            {/* Small Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-xs font-semibold text-emerald-800 mb-6 shadow-sm backdrop-blur-md animate-in fade-in duration-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Zero-Knowledge Architecture • 100% Client-Side Privacy</span>
            </div>

            {/* Hero Heading (Strict Light Mode) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-4xl mx-auto">
              Your Complete Wealth.{' '}
              <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">
                One Private Dashboard.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Track your net worth, investments, cash flow, goals and financial freedom in one powerful <strong className="text-slate-900">₹-native</strong> wealth command center.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <button
                type="button"
                id="btn-hero-signup"
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-hero-login"
                onClick={() => enterTestMode('user')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <span>Explore Live Demo</span>
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 font-mono">
              No financial data or credit card required to try the demo.
            </p>

            {/* =========================================================================
                7. HERO VISUAL (Interactive Fintech Command Center & Animated Graph)
                ========================================================================= */}
            <div className="mt-12 sm:mt-16 relative mx-auto max-w-5xl">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-b from-emerald-500/15 via-teal-500/10 to-transparent blur-2xl opacity-70" />

              {/* Daylight Fintech Dashboard Card */}
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 lg:p-8 shadow-2xl shadow-slate-900/10 text-left overflow-hidden">
                
                {/* Window Chrome Header Bar */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="ml-3 text-xs font-mono text-slate-500 hidden sm:inline">
                      FIX Wealth Command Center · Verified Local Vault
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Vault
                    </span>
                    <span className="text-slate-400 hidden md:inline">FY 2026-27 · INR Standard</span>
                  </div>
                </div>

                {/* Top KPI Metrics Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {/* Net Worth */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                      Consolidated Net Worth
                    </span>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-slate-900 tracking-tight">
                      {HERO_GRAPH_DATA[graphHorizon].curNetWorth}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{HERO_GRAPH_DATA[graphHorizon].growth}</span>
                    </div>
                  </div>

                  {/* FinScore */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                      Health Score (FinScore)
                    </span>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-emerald-600 tracking-tight">
                      88 <span className="text-xs text-slate-400 font-normal">/ 100</span>
                    </div>
                    <div className="mt-1 text-xs text-emerald-700 font-medium">
                      Excellent Financial Health
                    </div>
                  </div>

                  {/* Liquid Runway */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                      Liquid Runway
                    </span>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-slate-900 tracking-tight">
                      14.2 <span className="text-xs text-slate-400 font-normal">Months</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Emergency safety net active
                    </div>
                  </div>

                  {/* Savings Rate */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                      Monthly Savings Rate
                    </span>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-slate-900 tracking-tight">
                      32.8%
                    </div>
                    <div className="mt-1 text-xs text-emerald-700 font-medium">
                      ₹88,000 net monthly surplus
                    </div>
                  </div>
                </div>

                {/* Interactive Chart + Allocation + Cash Flow Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  
                  {/* Interactive Animated Wealth Growth Chart Curve (2 Columns) */}
                  <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 flex flex-col justify-between transition-all duration-300 shadow-sm">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                              {HERO_GRAPH_DATA[graphHorizon].title}
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1.5 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>{HERO_GRAPH_DATA[graphHorizon].cagr}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Interactive visual: click timeframes below or hover milestone nodes
                          </p>
                        </div>

                        {/* Interactive Horizon Switcher Tabs */}
                        <div className="inline-flex p-1 rounded-xl bg-white border border-slate-200 shadow-sm gap-1 self-start sm:self-auto">
                          {(['1Y', '3Y', '5Y', 'FIRE'] as const).map((hz) => (
                            <button
                              key={hz}
                              onClick={() => {
                                setGraphHorizon(hz);
                                setHoveredPointIdx(HERO_GRAPH_DATA[hz].points.length - 1);
                              }}
                              className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                                graphHorizon === hz
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              {hz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* SVG Animated Chart Preview */}
                      <div className="h-44 sm:h-52 w-full relative mt-2">
                        
                        {/* Dynamic Tooltip on Hovered Point */}
                        {hoveredPointIdx !== null && HERO_GRAPH_DATA[graphHorizon].points[hoveredPointIdx] && (
                          <div 
                            className="absolute -top-2 transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-mono shadow-xl border border-slate-700 pointer-events-none z-20 transition-all duration-200 flex items-center gap-2"
                            style={{ 
                              left: `${(HERO_GRAPH_DATA[graphHorizon].points[hoveredPointIdx].x / 500) * 100}%` 
                            }}
                          >
                            <span className="font-bold text-emerald-400">
                              {HERO_GRAPH_DATA[graphHorizon].points[hoveredPointIdx].value}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span>{HERO_GRAPH_DATA[graphHorizon].points[hoveredPointIdx].detail}</span>
                          </div>
                        )}

                        <svg 
                          key={graphHorizon} 
                          viewBox="0 0 500 180" 
                          className="w-full h-full overflow-visible" 
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id="growthGradDaylight" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#059669" stopOpacity="0.28" />
                              <stop offset="60%" stopColor="#10b981" stopOpacity="0.08" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>

                          {/* Subtle financial horizontal grid guides */}
                          <line x1="0" y1="45" x2="500" y2="45" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" opacity="0.6" />
                          <line x1="0" y1="90" x2="500" y2="90" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" opacity="0.6" />
                          <line x1="0" y1="135" x2="500" y2="135" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" opacity="0.6" />

                          {/* Animated Area Fill */}
                          <path
                            d={HERO_GRAPH_DATA[graphHorizon].svgArea}
                            fill="url(#growthGradDaylight)"
                            className="animate-graph-area"
                          />

                          {/* Vertical guide line on hovered milestone */}
                          {hoveredPointIdx !== null && HERO_GRAPH_DATA[graphHorizon].points[hoveredPointIdx] && (
                            <line
                              x1={HERO_GRAPH_DATA[graphHorizon].points[hoveredPointIdx].x}
                              y1={HERO_GRAPH_DATA[graphHorizon].points[hoveredPointIdx].y}
                              x2={HERO_GRAPH_DATA[graphHorizon].points[hoveredPointIdx].x}
                              y2="175"
                              stroke="#10b981"
                              strokeDasharray="3 3"
                              strokeWidth="1.5"
                              opacity="0.75"
                              className="transition-all duration-150"
                            />
                          )}

                          {/* Soft Neon Underglow Stroke */}
                          <path
                            d={HERO_GRAPH_DATA[graphHorizon].svgPath}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="6"
                            strokeLinecap="round"
                            className="animate-graph-line opacity-30"
                            pathLength={1000}
                          />
                          
                          {/* Main Crisp Animated Stroke line */}
                          <path
                            d={HERO_GRAPH_DATA[graphHorizon].svgPath}
                            fill="none"
                            stroke="#059669"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            className="animate-graph-line"
                            pathLength={1000}
                          />

                          {/* Traveling live radar pulse trace */}
                          <path
                            d={HERO_GRAPH_DATA[graphHorizon].svgPath}
                            fill="none"
                            stroke="#34d399"
                            strokeWidth="4"
                            strokeLinecap="round"
                            className="animate-graph-trace pointer-events-none"
                            pathLength={1000}
                          />

                          {/* Reference Nodes along the curve */}
                          {HERO_GRAPH_DATA[graphHorizon].points.map((pt, idx) => {
                            const isSelected = hoveredPointIdx === idx;
                            const isEndpoint = idx === HERO_GRAPH_DATA[graphHorizon].points.length - 1;

                            return (
                              <g 
                                key={idx} 
                                className="cursor-pointer group"
                                onMouseEnter={() => setHoveredPointIdx(idx)}
                              >
                                {isEndpoint && (
                                  <>
                                    <circle 
                                      cx={pt.x} 
                                      cy={pt.y} 
                                      r="12" 
                                      fill="#10b981" 
                                      className="animate-ripple" 
                                    />
                                    <circle 
                                      cx={pt.x} 
                                      cy={pt.y} 
                                      r="12" 
                                      fill="#10b981" 
                                      className="animate-ripple-delayed" 
                                    />
                                  </>
                                )}
                                {isSelected && (
                                  <circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r="9"
                                    fill="#10b981"
                                    opacity="0.25"
                                  />
                                )}
                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isSelected ? 6.5 : 4.5}
                                  fill={isSelected ? '#059669' : '#ffffff'}
                                  stroke="#059669"
                                  strokeWidth={isSelected ? '3' : '2'}
                                  className="transition-all duration-200"
                                />
                              </g>
                            );
                          })}
                        </svg>

                        {/* X-Axis Milestone Labels */}
                        <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-2 border-t border-slate-200/80 pt-2">
                          {HERO_GRAPH_DATA[graphHorizon].points.map((pt, i) => (
                            <button
                              key={i}
                              onClick={() => setHoveredPointIdx(i)}
                              className={`text-left transition-colors cursor-pointer ${
                                hoveredPointIdx === i ? 'text-emerald-700 font-bold' : 'hover:text-slate-900'
                              }`}
                            >
                              <span className="block">{pt.year}</span>
                              <span className="text-[10px] text-slate-400 block">{pt.value}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Interactive SIP Compounding Simulator Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80 bg-white p-3 rounded-xl border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-bold text-slate-800">Interactive SIP Simulator:</span>
                          <span className="font-mono text-emerald-700 font-bold">₹{interactiveSip.toLocaleString('en-IN')}/mo</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600">
                          <span>10-Yr Corpus: <strong className="text-emerald-700 font-bold">₹{((interactiveSip * 12 * 10 * 1.95) / 10000000).toFixed(2)} Cr</strong></span>
                          <span>15-Yr Corpus: <strong className="text-emerald-700 font-bold">₹{((interactiveSip * 12 * 15 * 3.1) / 10000000).toFixed(2)} Cr</strong></span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="10000"
                        max="150000"
                        step="5000"
                        value={interactiveSip}
                        onChange={(e) => setInteractiveSip(Number(e.target.value))}
                        className="w-full mt-2 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Asset Allocation & Cash Flow Split (1 Column) */}
                  <div className="space-y-4">
                    {/* Allocation Quick Glance */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-800">Asset Allocation</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Calibrated</span>
                      </div>
                      
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Equity &amp; Mutual Funds</span>
                            <span className="font-mono font-bold text-slate-900">64% (₹79.6L)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: '64%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Debt &amp; EPF / PPF</span>
                            <span className="font-mono font-bold text-slate-900">21% (₹26.1L)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: '21%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Gold &amp; SGB</span>
                            <span className="font-mono font-bold text-slate-900">10% (₹12.4L)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: '10%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-slate-600">Cash &amp; Liquid Funds</span>
                            <span className="font-mono font-bold text-slate-900">5% (₹6.4L)</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: '5%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cash Flow Quick Bar */}
                    <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                      <span className="text-xs font-bold text-slate-800 block mb-2">Monthly Cash Flow</span>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Income</span>
                          <span className="text-xs font-mono font-bold text-emerald-700">₹1.80L</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] text-slate-500 block">Expenses</span>
                          <span className="text-xs font-mono font-bold text-slate-700">₹92,000</span>
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-[10px] text-emerald-700 font-bold block">Surplus</span>
                          <span className="text-xs font-mono font-bold text-emerald-800">+₹88,000</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            9. TRUST STRIP (Compact 4-Pillar Trust Indicators)
            ========================================================================= */}
        <section className="border-y border-slate-200/80 bg-white/80 backdrop-blur-md py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex items-center justify-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">₹ INR Native</span>
                  <span className="text-[11px] text-slate-500">Lakhs &amp; Crores notation</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">100% Local Privacy</span>
                  <span className="text-[11px] text-slate-500">Client-side vault storage</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">Live Market Data</span>
                  <span className="text-[11px] text-slate-500">Forex, Gold &amp; AMFI NAV</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-900 block">12+ Financial Tools</span>
                  <span className="text-[11px] text-slate-500">SIP, SWP, EMI &amp; FIRE</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. CORE VALUE SECTION (4-Card Bento Grid)
            ========================================================================= */}
        <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything You Need to Understand Your Wealth
            </h2>
            <p className="mt-3 text-base text-slate-600">
              From everyday cash flow to long-term financial independence, FIX Wealth brings your complete financial picture together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bento Card 1: Know Your Wealth */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-lg font-bold mb-4">
                ₹
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Know Your Wealth
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Track assets, liabilities and net worth across your complete financial life with consolidated valuations.
              </p>
              {/* Mini visual */}
              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Total Assets · Liabilities</span>
                <span className="text-emerald-700 font-bold">₹1.42 Cr · ₹17.5L</span>
              </div>
            </div>

            {/* Bento Card 2: Understand Your Money */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Understand Your Money
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                See income, expenses, savings rate, budgets and cash flow in one place without manual spreadsheets.
              </p>
              {/* Mini visual */}
              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Savings Rate Performance</span>
                <span className="text-blue-700 font-bold">32.8% of Net Income</span>
              </div>
            </div>

            {/* Bento Card 3: Plan Your Freedom */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Plan Your Freedom
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Build goals, calculate FIRE targets and track your path toward financial independence with precision.
              </p>
              {/* Mini visual */}
              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Target Freedom Year</span>
                <span className="text-amber-700 font-bold">2045 (₹3.2 Cr Target)</span>
              </div>
            </div>

            {/* Bento Card 4: Keep It Private */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                Keep It Private
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Your financial information stays on your device with local-first data storage and zero cloud tracking.
              </p>
              {/* Mini visual */}
              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Database Storage Mode</span>
                <span className="text-teal-700 font-bold">100% Local Encrypted</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            11. WEALTH COMMAND CENTER SECTION (#overview)
            ========================================================================= */}
        <section id="overview" className="py-20 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                COMMAND CENTER SHOWCASE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                See Your Entire Financial Life at a Glance
              </h2>
              <p className="mt-3 text-base text-slate-600">
                One dashboard turns scattered financial information into a clear picture of your wealth.
              </p>
            </div>

            {/* Annotated Showcase Preview */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Pointer 1: Balance Sheet */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold font-mono">01 · SOLVENCY &amp; ASSETS</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Consolidated Balance Sheet</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Instant breakdown between short-term liquid funds, equities, real estate and debts.
                  </p>
                  <div className="mt-3 font-mono text-xs text-emerald-700 font-bold">
                    Net Worth: ₹1,24,50,000
                  </div>
                </div>

                {/* Pointer 2: Health Score & Runway */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 mb-2 text-blue-700">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold font-mono">02 · HEALTH &amp; RUNWAY</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Automated FinScore Rating</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Continuous assessment of emergency buffers, EMI-to-income ratio and portfolio risk.
                  </p>
                  <div className="mt-3 font-mono text-xs text-blue-700 font-bold">
                    Score: 88/100 · 14.2 Mos Runway
                  </div>
                </div>

                {/* Pointer 3: Real-Time Indian Standards */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center gap-2 mb-2 text-amber-700">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold font-mono">03 · ALLOCATION DISCIPLINE</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Rebalancing &amp; Target Tracking</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Monitors deviations from your ideal asset mix across Equities, Debt, Gold and Cash.
                  </p>
                  <div className="mt-3 font-mono text-xs text-amber-700 font-bold">
                    Target 60/25/15 · Active Calibration
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            12. NET WORTH SECTION (#wealth)
            ========================================================================= */}
        <section id="wealth" className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Net Worth Narrative & Metrics */}
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

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Assets</span>
                  <span className="text-lg sm:text-xl font-bold text-slate-900">₹1.42 Cr</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Liabilities</span>
                  <span className="text-lg sm:text-xl font-bold text-rose-600">₹17.5L</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-wider block">Net Worth</span>
                  <span className="text-lg sm:text-xl font-bold text-emerald-700">₹1.24 Cr</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-wider block">YoY Growth</span>
                  <span className="text-lg sm:text-xl font-bold text-emerald-700">+14.8%</span>
                </div>
              </div>
            </div>

            {/* Right: Growth Chart Visual */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Net Worth Curve (5 Years)</h4>
                  <span className="text-[11px] text-slate-500">Compounding Trajectory</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold">
                  ₹1,24,50,000 Current
                </span>
              </div>

              <div className="h-56 relative w-full">
                <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 170 C 120 150, 200 130, 300 80 S 420 40, 500 15 L 500 200 L 0 200 Z"
                    fill="url(#wealthGrad)"
                  />
                  <path
                    d="M 0 170 C 120 150, 200 130, 300 80 S 420 40, 500 15"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="500" cy="15" r="5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                </svg>
              </div>

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

        {/* =========================================================================
            13. ASSET ALLOCATION SECTION
            ========================================================================= */}
        <section className="py-20 bg-slate-50 border-t border-slate-200/80">
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
              
              {/* Left: Allocation Visual (Doughnut Simulation) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {/* Equity: 64% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#059669" strokeWidth="12" strokeDasharray="64 36" strokeDashoffset="0" />
                    {/* Debt: 21% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#2563eb" strokeWidth="12" strokeDasharray="21 79" strokeDashoffset="-64" />
                    {/* Gold: 10% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#d97706" strokeWidth="12" strokeDasharray="10 90" strokeDashoffset="-85" />
                    {/* Cash: 5% */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#0d9488" strokeWidth="12" strokeDasharray="5 95" strokeDashoffset="-95" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-slate-500 uppercase font-mono">Portfolio</span>
                    <span className="text-xl font-bold font-mono text-slate-900">₹1.24 Cr</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Calibrated</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-[11px] font-mono">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Equity 64%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Debt 21%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Gold 10%</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Cash 5%</span>
                </div>
              </div>

              {/* Right: Target vs Actual Comparison Bars */}
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
                    <div className="h-full bg-emerald-600" style={{ width: '64%' }} />
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
                    <div className="h-full bg-blue-600" style={{ width: '21%' }} />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block font-mono">-4% Underweight · Regular SIP Rebalance Active</span>
                </div>

                {/* Gold */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-900">Sovereign Gold Bonds &amp; Bullion</span>
                    <span className="font-mono text-slate-600">Target 15% · <strong className="text-amber-700">Actual 15%</strong></span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="h-full bg-amber-500" style={{ width: '15%' }} />
                  </div>
                  <span className="text-[10px] text-amber-700 mt-1 block font-mono">Perfect Target Alignment · Hedge Secured</span>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            14. FINANCIAL FREEDOM / FIRE SECTION
            ========================================================================= */}
        <section className="py-20 sm:py-28 bg-white relative overflow-hidden border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                THE FREEDOM ENGINE
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
                Don't Just Build Wealth. Build Freedom.
              </h2>
              <p className="mt-4 text-base text-slate-600">
                Turn today's money decisions into a measurable path toward financial independence.
              </p>
            </div>

            {/* Horizontal FIRE Timeline */}
            <div className="mb-12 p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs font-mono">
                <span className="text-slate-500 font-bold">Today</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                <span className="text-slate-700 font-bold">Build Emergency Shield</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                <span className="text-emerald-700 font-bold">Invest Monthly SIP</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                <span className="text-teal-700 font-bold">Compounding Horizon</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  Financial Freedom
                </span>
              </div>
            </div>

            {/* 4 FIRE Variants Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">LeanFIRE</span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">₹1.8 Cr</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Bare essential living expenses</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 ring-1 ring-emerald-300 shadow-sm">
                <span className="text-[11px] font-mono text-emerald-800 uppercase tracking-wider block font-bold">Standard FIRE</span>
                <div className="text-xl font-bold font-mono text-emerald-700 mt-1">₹3.2 Cr</div>
                <span className="text-[10px] text-slate-600 mt-1 block">Current lifestyle perpetuity</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">FatFIRE</span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">₹5.5 Cr</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Abundant luxury &amp; travel</span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">CoastFIRE</span>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">₹1.1 Cr</div>
                <span className="text-[10px] text-slate-500 mt-1 block">Compound without more saving</span>
              </div>
            </div>

            {/* Calculated Milestone Highlights Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-xs font-mono text-emerald-700 font-bold uppercase tracking-wider">
                  Personal Freedom Trajectory
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  Estimated Freedom Year: <span className="text-emerald-700">2045</span>
                </div>
                <p className="text-xs text-slate-600">
                  Target Corpus: <strong className="text-slate-900">₹3.2 Cr</strong> · Calculated Safe Withdrawal Rate: <strong className="text-slate-900">4.0%</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-500 block">Monthly SIP Required</span>
                  <span className="text-xl font-bold text-emerald-700">₹42,000 / mo</span>
                </div>
                <button
                  type="button"
                  onClick={() => enterTestMode('user')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-sm"
                >
                  Test Calculator
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            15. GOALS SECTION (#goals)
            ========================================================================= */}
        <section id="goals" className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-slate-50">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
              LIFE MILESTONES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              Turn Dreams Into Financial Targets
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Set concrete targets with auto-calculated SIP requirements and timeline countdowns.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Goal 1: Home */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🏠</span>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">60% Complete</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Home Down Payment</h4>
              <div className="mt-2 text-xs font-mono text-slate-700">
                ₹18L <span className="text-slate-400">/ ₹30L Target</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '60%' }} />
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-500">
                <span>Target: Dec 2027</span>
                <span className="text-emerald-700 font-semibold">₹32,500/mo required</span>
              </div>
            </div>

            {/* Goal 2: Education */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🎓</span>
                <span className="text-xs font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">60% Complete</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Higher Education Fund</h4>
              <div className="mt-2 text-xs font-mono text-slate-700">
                ₹12L <span className="text-slate-400">/ ₹20L Target</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '60%' }} />
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-500">
                <span>Target: Jun 2030</span>
                <span className="text-blue-700 font-semibold">₹18,000/mo required</span>
              </div>
            </div>

            {/* Goal 3: Vehicle */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🚗</span>
                <span className="text-xs font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">80% Complete</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">Vehicle Upgrade</h4>
              <div className="mt-2 text-xs font-mono text-slate-700">
                ₹8L <span className="text-slate-400">/ ₹10L Target</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '80%' }} />
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-500">
                <span>Target: Aug 2026</span>
                <span className="text-amber-700 font-semibold">₹15,000/mo required</span>
              </div>
            </div>

            {/* Goal 4: Vacation */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">✈️</span>
                <span className="text-xs font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">70% Complete</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">World Travel Vacation</h4>
              <div className="mt-2 text-xs font-mono text-slate-700">
                ₹3.5L <span className="text-slate-400">/ ₹5L Target</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ width: '70%' }} />
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-500">
                <span>Target: Dec 2026</span>
                <span className="text-teal-700 font-semibold">₹12,000/mo required</span>
              </div>
            </div>

            {/* Goal 5: Emergency Fund */}
            <div className="p-5 rounded-3xl bg-white border border-emerald-300 shadow-sm sm:col-span-2 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🛡</span>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">100% Fully Funded</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">6-Month Emergency Shield</h4>
              <div className="mt-2 text-xs font-mono text-emerald-700 font-bold">
                ₹6,00,000 <span className="text-slate-500 font-normal">/ ₹6,00,000 Anchored</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-mono text-slate-500">
                <span>Status: Liquid in High-Yield FD</span>
                <span className="text-emerald-700 font-semibold">14.2 Months Total Runway</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            16. CASH FLOW SECTION (#cashflow)
            ========================================================================= */}
        <section id="cashflow" className="py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                CASH FLOW PULSE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                Know Where Your Money Goes
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Anticipate your financial month instead of merely recording past expenses.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                
                {/* Event 1: Salary */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex justify-between items-center text-emerald-700 font-mono text-[10px] mb-1">
                    <span>DAY 1</span>
                    <span className="font-bold">INFLOW</span>
                  </div>
                  <h5 className="font-bold text-slate-900">Salary Credit</h5>
                  <span className="text-sm font-mono font-bold text-emerald-700 block mt-2">+₹1,80,000</span>
                </div>

                {/* Event 2: SIP */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <div className="flex justify-between items-center text-slate-500 font-mono text-[10px] mb-1">
                    <span>DAY 5</span>
                    <span className="text-blue-700 font-bold">SIP</span>
                  </div>
                  <h5 className="font-bold text-slate-900">Mutual Fund SIPs</h5>
                  <span className="text-sm font-mono font-bold text-slate-700 block mt-2">-₹45,000</span>
                </div>

                {/* Event 3: EMI */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <div className="flex justify-between items-center text-slate-500 font-mono text-[10px] mb-1">
                    <span>DAY 10</span>
                    <span className="text-rose-600 font-bold">EMI</span>
                  </div>
                  <h5 className="font-bold text-slate-900">Home Loan EMI</h5>
                  <span className="text-sm font-mono font-bold text-slate-700 block mt-2">-₹28,000</span>
                </div>

                {/* Event 4: Credit Card */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <div className="flex justify-between items-center text-slate-500 font-mono text-[10px] mb-1">
                    <span>DAY 15</span>
                    <span className="text-amber-700 font-bold">CARD</span>
                  </div>
                  <h5 className="font-bold text-slate-900">Credit Card Bills</h5>
                  <span className="text-sm font-mono font-bold text-slate-700 block mt-2">-₹14,000</span>
                </div>

                {/* Event 5: Utilities */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200">
                  <div className="flex justify-between items-center text-slate-500 font-mono text-[10px] mb-1">
                    <span>DAY 20</span>
                    <span className="text-slate-500 font-bold">BILLS</span>
                  </div>
                  <h5 className="font-bold text-slate-900">Utilities &amp; Grocery</h5>
                  <span className="text-sm font-mono font-bold text-slate-700 block mt-2">-₹12,000</span>
                </div>

              </div>

              <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <span className="text-slate-600">
                  Projected Month-End Liquid Balance: <strong className="text-emerald-700 font-mono">₹81,000 Surplus</strong>
                </span>
                <span className="text-slate-500 font-mono">
                  Calendar Cash Flow Engine • Zero Overdraft Alerts
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            17. FINANCIAL HEALTH SCORE (FinScore)
            ========================================================================= */}
        <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Circular FinScore Gauge */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-white border border-emerald-300 flex flex-col items-center justify-center text-center shadow-xl">
              <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="#059669" strokeWidth="8" strokeDasharray="264" strokeDashoffset="31" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-black font-mono text-slate-900 tracking-tight">88</span>
                  <span className="text-xs font-mono text-slate-500">/ 100</span>
                  <span className="text-xs font-bold text-emerald-700 mt-1 uppercase tracking-wider">Excellent</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-600 max-w-xs leading-relaxed">
                Aggregated metric measuring your financial resilience, liquidity runway and compounding stability.
              </p>
              <span className="mt-2 text-[10px] text-slate-500 font-mono">
                *For educational health assessment only
              </span>
            </div>

            {/* Right: 5 Scoring Factors */}
            <div className="lg:col-span-7 space-y-3.5">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                  DIAGNOSTIC ENGINE
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
                  A Clearer Picture of Your Financial Health
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  FinScore breaks your financial posture into 5 transparent dimensions:
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                  <span className="text-slate-800 font-medium">Liquidity &amp; Cash Buffer</span>
                  <span className="font-mono font-bold text-emerald-700">92 / 100</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                  <span className="text-slate-800 font-medium">Debt &amp; EMI Manageability</span>
                  <span className="font-mono font-bold text-emerald-700">85 / 100</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                  <span className="text-slate-800 font-medium">Emergency Fund Coverage</span>
                  <span className="font-mono font-bold text-emerald-700">95 / 100</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                  <span className="text-slate-800 font-medium">Portfolio Diversification</span>
                  <span className="font-mono font-bold text-emerald-700">80 / 100</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
                  <span className="text-slate-800 font-medium">Monthly Savings Discipline</span>
                  <span className="font-mono font-bold text-emerald-700">88 / 100</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================================
            18. CALCULATORS SECTION (#calculators)
            ========================================================================= */}
        <section id="calculators" className="py-20 bg-white border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                MATHEMATICAL PRECISION
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                Calculate Before You Commit
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Powerful financial calculators for smarter decisions.
              </p>
            </div>

            {/* Compact Grid of Calculators */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
              {[
                { name: 'SIP', desc: 'Systematic Investment' },
                { name: 'Step-Up SIP', desc: 'Annual increment' },
                { name: 'Lumpsum', desc: 'One-time growth' },
                { name: 'SWP', desc: 'Retirement payout' },
                { name: 'EMI', desc: 'Amortization schedule' },
                { name: 'Compound Int.', desc: 'Interest power' },
                { name: 'Inflation', desc: 'Purchasing decay' },
                { name: 'FD Maturity', desc: 'Fixed Deposit' },
                { name: 'RD Returns', desc: 'Recurring Deposit' },
                { name: 'CAGR', desc: 'Compounded annual' }
              ].map((calc, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center">
                  <span className="text-xs font-bold text-slate-900 block">{calc.name}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{calc.desc}</span>
                </div>
              ))}
            </div>

            {/* Callout Action */}
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <span className="text-xs font-bold text-slate-900">12+ Institutional Grade Financial Calculators</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Formulas calibrated with exact Indian compounding frequencies, tax slabs and inflation indices.
                </p>
              </div>
              <button
                type="button"
                onClick={() => enterTestMode('user')}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
              >
                <span>Explore Calculators</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            19. LIVE MARKET SECTION
            ========================================================================= */}
        <section className="py-16 border-t border-slate-200/80 bg-slate-50/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Stay Connected to the Market</h3>
                <p className="text-xs text-slate-600">Live interbank exchange rates and commodity benchmarks</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live 24h Rates
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-[10px] text-slate-500 block">USD / INR</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">₹86.85</span>
                <span className="text-[10px] text-emerald-600 font-semibold">+0.08%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-[10px] text-slate-500 block">EUR / INR</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">₹91.40</span>
                <span className="text-[10px] text-rose-600 font-semibold">-0.12%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-[10px] text-slate-500 block">GBP / INR</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">₹109.80</span>
                <span className="text-[10px] text-emerald-600 font-semibold">+0.15%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-[10px] text-slate-500 block">Gold 24K (10g)</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">₹88,400</span>
                <span className="text-[10px] text-emerald-600 font-semibold">+0.64%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-[10px] text-slate-500 block">Gold 22K (10g)</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">₹81,030</span>
                <span className="text-[10px] text-emerald-600 font-semibold">+0.62%</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                <span className="text-[10px] text-slate-500 block">Silver (1kg)</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">₹98,500</span>
                <span className="text-[10px] text-emerald-600 font-semibold">+1.10%</span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            20. PRIVACY SECTION (#security)
            ========================================================================= */}
        <section id="security" className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-white border border-emerald-200/90 shadow-lg relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-mono font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>ZERO-KNOWLEDGE PRIVACY CONSTITUTION</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Your Money. Your Device. Your Control.
                </h2>
                
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                  Your financial information is designed to stay inside your device. FIX Wealth is built around local-first privacy instead of centralized financial data storage.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Local-first financial storage</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No financial telemetry or ad tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Full JSON / CSV backup export</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1-Click zero-trace data wiping</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2"
                  >
                    <span>Learn About Privacy</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Hardware Lock Visual */}
              <div className="lg:col-span-4 flex items-center justify-center">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-white border border-emerald-200 flex flex-col items-center justify-center shadow-md relative">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                    <Lock className="w-10 h-10 text-emerald-600" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-900">Client Device Vault</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold mt-0.5">100% Isolated</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            21. INDIAN-FIRST FINANCE SECTION
            ========================================================================= */}
        <section className="py-20 bg-slate-50/70 border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                BUILT SPECIFICALLY FOR INDIA
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                Built for the Way India Manages Wealth
              </h2>
              <p className="mt-3 text-base text-slate-600">
                Native support for Indian accounting notation, tax buckets and investment vehicles.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-center text-xs">
              {[
                { label: '₹ Lakhs & Crores', sub: 'Native Indian numbering' },
                { label: 'Mutual Funds & SIPs', sub: 'Direct & regular plans' },
                { label: 'EPF & PPF', sub: 'Retirement compounding' },
                { label: 'NPS Tier 1 & 2', sub: 'Pension tax buckets' },
                { label: 'Fixed Deposits (FD)', sub: 'Quarterly compounding' },
                { label: 'Sovereign Gold Bonds', sub: 'SGB & 24K bullion' },
                { label: 'NSE & BSE Equities', sub: 'Indian stock ledger' },
                { label: 'Emergency Reserves', sub: 'INR liquid safety net' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
                  <span className="font-bold text-slate-900 block">{item.label}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            22. TEST MODE SECTION (Interactive Sandbox)
            ========================================================================= */}
        <section className="py-20 sm:py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200/80">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white border border-emerald-200/90 text-center shadow-lg relative overflow-hidden">
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-mono font-bold mb-4 border border-emerald-200">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>1-Click Demo Sandbox</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight max-w-2xl mx-auto">
              Don't Just Read About It. Try It.
            </h2>

            <p className="mt-4 text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Experience the dashboard, wealth tracking, FIRE planning and financial tools using a realistic demo portfolio — no account required.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <button
                type="button"
                id="btn-hero-test-user"
                onClick={() => enterTestMode('user')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>👤 Test as Client User</span>
              </button>

              <button
                type="button"
                id="btn-hero-test-admin"
                onClick={() => enterTestMode('admin')}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 hover:text-blue-900 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                title="Test as sudharsan@gmail.com (Master Administrator)"
              >
                <Shield className="w-4 h-4 text-blue-600" />
                <span>👑 Test as Admin</span>
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500 font-mono">
              Pre-loaded with sample assets, ledger entries, and ₹1.24 Cr net worth.
            </p>
          </div>
        </section>

        {/* =========================================================================
            23. PRODUCT EXPERIENCE JOURNEY
            ========================================================================= */}
        <section className="py-20 bg-slate-50/60 border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold">
                THE WEALTH LIFECYCLE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
                Five Steps to Financial Mastery
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { step: '01', title: 'Track', desc: 'Add your financial accounts and transactions.' },
                { step: '02', title: 'Understand', desc: 'See your wealth, cash flow and financial health.' },
                { step: '03', title: 'Plan', desc: 'Create goals and calculate your FIRE path.' },
                { step: '04', title: 'Optimize', desc: 'Understand allocation, savings and debt.' },
                { step: '05', title: 'Grow', desc: 'Make better long-term financial decisions.' },
              ].map((s, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative hover:shadow-md transition-shadow">
                  <span className="text-2xl font-black font-mono text-emerald-600/40 block mb-2">{s.step}</span>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{s.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            24. FINAL CALL TO ACTION
            ========================================================================= */}
        <section className="py-24 sm:py-32 relative text-center overflow-hidden border-t border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight">
              Your Wealth Deserves a Better Dashboard.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto">
              Start building a clearer picture of your financial future today with complete privacy.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => enterTestMode('user')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <FlaskConical className="w-4 h-4 text-emerald-600" />
                <span>Try Demo</span>
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-500 font-mono">
              ₹ INR Native • Privacy First • Built for Wealth Management
            </p>
          </div>
        </section>

      </main>

      {/* =========================================================================
          25. FOOTER
          ========================================================================= */}
      <footer className="border-t border-slate-200 bg-white py-14 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                  <Coins className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base text-slate-900 tracking-tight">FIX Wealth</span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Personal Financial Intelligence Engine calibrated in Indian Rupee (₹) with 100% local-first privacy.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-[11px] font-mono text-emerald-700">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>100% Local Privacy</span>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-3 font-mono">Product</span>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('overview')} className="hover:text-emerald-700 cursor-pointer">Overview</button></li>
                <li><button onClick={() => scrollToSection('wealth')} className="hover:text-emerald-700 cursor-pointer">Wealth</button></li>
                <li><button onClick={() => scrollToSection('goals')} className="hover:text-emerald-700 cursor-pointer">Goals</button></li>
                <li><button onClick={() => scrollToSection('cashflow')} className="hover:text-emerald-700 cursor-pointer">Cash Flow</button></li>
                <li><button onClick={() => scrollToSection('calculators')} className="hover:text-emerald-700 cursor-pointer">Calculators</button></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-3 font-mono">Company</span>
              <ul className="space-y-2">
                <li><button onClick={() => setIsPrivacyModalOpen(true)} className="hover:text-emerald-700 cursor-pointer">About Privacy</button></li>
                <li><span className="hover:text-slate-900 cursor-default">Release Notes</span></li>
                <li><span className="hover:text-slate-900 cursor-default">Security Standards</span></li>
              </ul>
            </div>

            {/* Actions Column */}
            <div>
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block mb-3 font-mono">Actions</span>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => enterTestMode('user')}
                    className="text-emerald-600 font-bold hover:underline cursor-pointer"
                  >
                    Test Mode (1-Click)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openAuthModal('login')}
                    className="hover:text-emerald-700 cursor-pointer"
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => openAuthModal('register')}
                    className="hover:text-emerald-700 cursor-pointer"
                  >
                    Register
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 font-mono text-[11px]">
            <span>© FIX Wealth. All rights reserved.</span>
            <span>Personal Financial Intelligence Engine · ₹ INR Standard</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          PRIVACY EXPLANATION MODAL (Interactive)
          ========================================================================= */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-lg w-full p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">FIX Wealth Privacy Architecture</h3>
              </div>
              <button 
                onClick={() => setIsPrivacyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong className="text-slate-900">Local-First Storage:</strong> Unlike typical cloud accounting applications, your bank balances, transactions, and net worth calculations are saved directly to your browser's local sandbox storage.
              </p>
              <p>
                <strong className="text-slate-900">Zero Financial Telemetry:</strong> We do not track, log, or sell your financial transaction history. External requests are limited solely to live forex currency rates and AMFI mutual fund daily NAV feeds.
              </p>
              <p>
                <strong className="text-slate-900">Full Data Sovereignty:</strong> You can export your complete financial records as encrypted JSON or structured CSV spreadsheets at any time, or trigger a 1-click zero-trace wipe.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
