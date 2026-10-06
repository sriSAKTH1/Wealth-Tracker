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
  Globe, 
  ChevronRight,
  Eye,
  Zap,
  BarChart3,
  FlaskConical,
  ChevronDown,
  UserCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';

export const LaunchPage: React.FC = () => {
  const { openAuthModal, enterTestMode } = useAuth();
  const { theme } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const [isTestMenuOpen, setIsTestMenuOpen] = useState(false);
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

  return (
    <div className={`min-h-screen flex flex-col ${
      isLight ? 'bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'
    }`}>
      {/* 1. Launch Page Top Navigation Header with Login, Sign Up, and Test Mode buttons */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors ${
        isLight 
          ? 'bg-white/85 border-slate-200/90 shadow-xs' 
          : 'bg-zinc-950/85 border-zinc-800/80 shadow-black/40'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/25 ring-1 ring-white/20 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  FIX Wealth
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/25 hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ₹ INR Live Standard
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 hidden sm:block">
                Personal Wealth Command Center
              </p>
            </div>
          </div>

          {/* Privacy & Zero-Knowledge Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span>100% Local Privacy Vault</span>
          </div>

          {/* Header Action Buttons: Test Mode, Login, and Sign Up */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Header Test Mode Popover Trigger */}
            <div className="relative" ref={testMenuRef}>
              <button
                type="button"
                id="btn-launch-test-mode"
                onClick={() => setIsTestMenuOpen(!isTestMenuOpen)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs flex items-center gap-1.5 ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100/80 text-amber-800 border-amber-300'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
                }`}
                title="Enter 1-Click Test Mode without registration"
              >
                <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
                <span>Test Mode</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isTestMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Test Mode Dropdown Menu */}
              {isTestMenuOpen && (
                <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-zinc-900 border-zinc-700 text-zinc-100 shadow-black/80'
                }`}>
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select 1-Click Test Mode
                  </div>
                  <button
                    type="button"
                    id="btn-header-test-user"
                    onClick={() => {
                      setIsTestMenuOpen(false);
                      enterTestMode('user');
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500 shrink-0 mt-0.5">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>👤 Test as Client User</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight mt-0.5">
                        Explore assets, INR ledger, net worth &amp; privacy vault
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
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 mt-1 ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-500 shrink-0 mt-0.5">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1">
                        <span>👑 Test as Admin</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-tight mt-0.5">
                        sudharsan@gmail.com with Master Admin Panel
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              id="btn-launch-login"
              onClick={() => openAuthModal('login')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 hover:border-slate-400'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700/80 hover:border-zinc-600'
              }`}
            >
              Login
            </button>

            <button
              type="button"
              id="btn-launch-signup"
              onClick={() => openAuthModal('register')}
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/30 hover:shadow-blue-500/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Launch Page Hero Section */}
      <main className="flex-1 flex flex-col justify-center">
        <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-violet-600/10 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Top Pill Announcement */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-6 text-xs font-medium backdrop-blur-md bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero-Knowledge Architecture • No Financial Telemetry</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]">
              Master Your Wealth with{' '}
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-400 bg-clip-text text-transparent">
                100% Local Privacy
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Track assets, liabilities, net worth, cash flows, and FIRE milestones denominated in <strong>Indian Rupee (₹)</strong> with live interbank exchange pricing. Your sensitive financial data is stored exclusively on your device.
            </p>

            {/* Hero Dual CTA Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 max-w-lg mx-auto">
              <button
                type="button"
                id="btn-hero-signup"
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get Started — Sign Up</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-hero-login"
                onClick={() => openAuthModal('login')}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-2xl border font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-xs ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700'
                }`}
              >
                Sign In to Vault
              </button>
            </div>

            {/* Launch Page Dedicated Test Mode Sandbox Bar */}
            <div className={`mt-8 max-w-xl mx-auto p-3.5 sm:p-4 rounded-2xl border shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-left transition-all ${
              isLight 
                ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200' 
                : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/25'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 ring-1 ring-amber-500/30">
                  <FlaskConical className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Instant Test Mode Sandbox
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold">
                      1-Click
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    Explore with pre-seeded data without creating an account
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  id="btn-hero-test-user"
                  onClick={() => enterTestMode('user')}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Test as User</span>
                </button>

                <button
                  type="button"
                  id="btn-hero-test-admin"
                  onClick={() => enterTestMode('admin')}
                  className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  title="Test as sudharsan@gmail.com (Master Administrator)"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Test as Admin</span>
                </button>
              </div>
            </div>

            {/* Quick Feature Checklist */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>₹ Indian Currency Standard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Zero Cloud Database Storage for Fin Data</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Real-Time Live Forex Feeds</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Interactive Wealth Snapshot Preview Card */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
            isLight ? 'bg-white border-slate-200' : 'bg-zinc-900/90 border-zinc-800 shadow-black/60'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-inherit/60">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                  Live Portfolio Preview
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-blue-600 dark:text-blue-400">
                  ₹1,24,50,000 <span className="text-xs font-sans text-emerald-500 font-bold ml-1.5">+14.8% YoY</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Consolidated Net Worth • Calibrated in Indian Rupee (₹)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 text-xs font-mono font-bold">
                  Health Score: 88/100 (Excellent)
                </span>
                <span className="px-3 py-1 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25 text-xs font-mono font-bold">
                  Runway: 14.2 Mos
                </span>
              </div>
            </div>

            {/* 4 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className={`p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <div className="p-2 w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 mb-3 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs">₹ Indian Financial Standard</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Lakhs &amp; Crores notation, SIP tracking, emergency funds, and real-time forex conversions.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <div className="p-2 w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 mb-3 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs">100% Local Privacy</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Your transactions, salary, and balances stay inside your device storage. Zero external exposure.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <div className="p-2 w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 mb-3 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs">Live Market &amp; Forex Feed</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Automated pricing for gold, silver, currencies, mutual funds, and equities with live 24h change.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/60 border-zinc-800'
              }`}>
                <div className="p-2 w-8 h-8 rounded-xl bg-violet-500/15 text-violet-500 mb-3 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs">FIRE Freedom Engine</h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Calculate and track your financial freedom date, safe withdrawal rate, and retirement targets.
                </p>
              </div>
            </div>

            {/* Bottom Callout banner */}
            <div className="mt-6 pt-5 border-t border-inherit/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 dark:text-zinc-400">
                Ready to take control of your financial destiny?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => enterTestMode('user')}
                  className="px-3.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-500 font-bold transition-all cursor-pointer shadow-xs hover:bg-amber-500/25"
                >
                  🧪 1-Click Test Mode
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all cursor-pointer shadow-xs"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-1.5 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 font-semibold transition-all cursor-pointer"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 4. Launch Page Footer */}
      <footer className={`border-t py-8 text-xs ${
        isLight ? 'bg-white border-slate-200 text-slate-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-zinc-200">FIX Wealth Tracker</span>
            <span>•</span>
            <span>Personal Financial Intelligence Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => enterTestMode('user')}
              className="text-amber-500 font-bold hover:underline cursor-pointer"
            >
              🧪 Test Mode
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="hover:text-blue-500 transition-colors cursor-pointer font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="hover:text-blue-500 transition-colors cursor-pointer font-medium"
            >
              Register
            </button>
            <span className="text-emerald-500 font-mono font-bold">100% Local Privacy</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
