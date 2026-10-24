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
import { FixWealthLogo } from './common/FixWealthLogo';
import { AdminPinModal } from './auth/AdminPinModal';
import { 
  AnimatedFinScoreSection, 
  AnimatedWealthGrowthSection, 
  AnimatedMoneyLiveSection,
  useCountUp
} from './landing/LandingAnimatedSections';

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

export const LaunchPage: React.FC = () => {
  const { openAuthModal, enterTestMode } = useAuth();

  // Dialog and allocation states
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [activeAllocationTab, setActiveAllocationTab] = useState<'actual' | 'target'>('actual');

  // Animated Hero Counters (0 to 88 for FinScore, and 0 to 1.24 Cr for Net Worth)
  const heroScore = useCountUp(88, 1700, true, 0);
  const heroNetWorthCr = useCountUp(1.24, 1800, true, 2);

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      data-theme="light"
      className="launch-page-root min-h-screen font-sans antialiased relative overflow-x-hidden bg-slate-50 text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-800 transition-colors duration-300"
    >
      
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
          TOP HEADER BAR: Clean brand logo on left, Try Demo / Sign Up / Login on top right only
          Glass finish removed so the background and floating icons show through cleanly
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-none border-b border-transparent shadow-none transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo & Name (Transparent SVG, zero white box background artifact) */}
          <a
            href="#root"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 sm:gap-3.5 group focus:outline-none cursor-pointer select-none"
            aria-label="FIX Wealth Home"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <FixWealthLogo className="w-9 h-9 sm:w-10 sm:h-10" showRoots={true} interactive={true} />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl text-slate-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                  FIX Wealth
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100/80 text-emerald-800 border border-emerald-300/60 hidden sm:inline-block">
                  ₹-Native
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-wide uppercase mt-0.5 hidden xs:inline-block">
                Financial Intelligence
              </span>
            </div>
          </a>

          {/* Top Right: Try Demo, Login, and Sign Up actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Try Demo */}
            <button
              type="button"
              id="btn-launch-try-demo"
              onClick={() => enterTestMode('user')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-sm shadow-blue-600/25 border border-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Explore full dashboard with dummy data in 1 click"
            >
              <FlaskConical className="w-3.5 h-3.5 text-blue-100 shrink-0" />
              <span>Try Demo</span>
            </button>

            {/* Login */}
            <button
              type="button"
              id="btn-launch-login"
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            >
              Login
            </button>

            {/* Signup */}
            <button
              type="button"
              id="btn-launch-signup"
              onClick={() => openAuthModal('register')}
              className="inline-flex items-center justify-center px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
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
            {/* 0% Tracking & 100% Private Local Storage Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200/90 bg-emerald-50/90 text-emerald-950 text-xs sm:text-sm font-medium mb-6 shadow-xs select-none">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[11px] font-bold">
                0%
              </span>
              <span className="font-semibold text-slate-800">Zero Data Sold</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                100% Private Local Storage
              </span>
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

            {/* Direct Sign-In Link */}
            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-slate-500 flex-wrap">
              <button
                type="button"
                id="btn-hero-signin-link"
                onClick={() => openAuthModal('login')}
                className="hover:text-emerald-700 text-slate-700 font-semibold underline underline-offset-4 cursor-pointer transition-colors"
              >
                Already have an account? Sign in
              </button>
              <span aria-hidden="true">•</span>
              <span className="font-mono">100% Private Local Storage</span>
              <span aria-hidden="true">•</span>
              <span className="font-mono">No credit card required</span>
            </div>

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
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-slate-900 tracking-tight transition-all">
                      ₹{heroNetWorthCr} Cr
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+18.4% YoY Growth</span>
                    </div>
                  </div>

                  {/* FinScore */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                      Health Score (FinScore)
                    </span>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-emerald-600 tracking-tight transition-all">
                      {Math.round(heroScore * 10)} <span className="text-xs text-slate-400 font-normal">/ 1,000</span>
                    </div>
                    <div className="mt-1 text-xs text-emerald-700 font-medium flex items-center justify-between">
                      <span>Excellent (4 Pillars)</span>
                      <span className="font-mono text-[10px] text-slate-400">{heroScore}/100</span>
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

                {/* Allocation & Cash Flow Split (Clean 2-Column Overview) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Allocation Quick Glance */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs sm:text-sm font-bold text-slate-800">Calibrated Asset Allocation</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Optimal Risk</span>
                    </div>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium">Equity &amp; Mutual Funds</span>
                          <span className="font-mono font-bold text-slate-900">64% (₹79.6L)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: '64%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium">Debt &amp; EPF / PPF</span>
                          <span className="font-mono font-bold text-slate-900">21% (₹26.1L)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: '21%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium">Gold &amp; SGB</span>
                          <span className="font-mono font-bold text-slate-900">10% (₹12.4L)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: '10%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-600 font-medium">Cash &amp; Liquid Funds</span>
                          <span className="font-mono font-bold text-slate-900">5% (₹6.4L)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: '5%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cash Flow Quick Bar */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs sm:text-sm font-bold text-slate-800">Monthly Cash Flow</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">+₹88,000 Surplus</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center mb-4">
                        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/90 shadow-2xs hover:border-emerald-300 transition-colors">
                          <span className="text-[10px] text-emerald-700 font-semibold block mb-0.5">Income</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-emerald-800">₹1.80L</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                          <span className="text-[10px] text-slate-500 block mb-0.5">Expenses</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-slate-700">₹92,000</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-50 via-emerald-50 to-emerald-100/70 border border-emerald-300/80 shadow-2xs hover:border-emerald-400 transition-colors">
                          <span className="text-[10px] text-teal-800 font-bold block mb-0.5">Surplus</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-emerald-900">+₹88,000</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-600">Active Monthly SIP Inflow</span>
                      <span className="font-bold text-emerald-700">₹45,000 / mo (51.1% surplus)</span>
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
            12. ANIMATED NET WORTH & WEALTH GROWTH SECTION (#wealth)
            Features 10 numbers (0 to 10), grid crosses (+), and 5-year curve line
            drawing from Year 1 upwards to Year 5 on scroll.
            ========================================================================= */}
        <AnimatedWealthGrowthSection />

        {/* =========================================================================
            13. ANIMATED MONEY LIVE & ASSET ALLOCATION SECTION
            Animates portfolio value from 0 to 1.something crore (₹1.24 Cr) on scroll
            with animated sweeping doughnut segments and progress bars.
            ========================================================================= */}
        <AnimatedMoneyLiveSection />

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
                  onClick={() => enterTestMode('user', { calculatorOnly: true })}
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
            17. ANIMATED FINANCIAL HEALTH SCORE (FinScore) (#finscore-section)
            Animates gauge and score rounded from 0 to 88 on scroll.
            ========================================================================= */}
        <AnimatedFinScoreSection />

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
                onClick={() => enterTestMode('user', { calculatorOnly: true })}
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
                onClick={() => setIsAdminPinModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-800 hover:text-blue-900 font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                title="Enter PIN to access Master Administrator"
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
                <FixWealthLogo className="w-8 h-8" showRoots={true} />
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
                <li>
                  <button 
                    id="btn-footer-admin-test-mode"
                    onClick={() => setIsAdminPinModalOpen(true)}
                    className="text-slate-400 hover:text-blue-600 cursor-pointer transition-colors"
                  >
                    Admin Test Mode
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

      {/* Master Admin PIN Modal Popup */}
      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
      />

    </div>
  );
};
