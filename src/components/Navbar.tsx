import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Search, 
  Bell, 
  Smartphone, 
  Monitor, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../context/FinanceContext';
import { CurrencyCode } from '../types';

export const Navbar: React.FC = () => {
  const { 
    isPrivateMode, 
    togglePrivateMode, 
    setSearchOpen,
    currency, 
    setCurrency, 
    formatMoney, 
    netWorth,
    monthlyExpenses,
    liquidRunwayMonths,
    scheduledItems,
    isMobileFrameSimulated,
    toggleMobileFrame,
    setActiveTab,
    theme
  } = useFinance();

  const isLight = theme === 'light';

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Generate real dynamic alerts based on finances
  const alerts = [
    {
      id: '1',
      title: 'Emergency Runway Healthy',
      message: `You currently have ${liquidRunwayMonths} months of liquid reserves. Target achieved!`,
      type: 'success',
      icon: CheckCircle2,
    },
    {
      id: '2',
      title: 'Upcoming Recurring Bills',
      message: `${scheduledItems.filter(i => i.type === 'expense').length} scheduled debits configured this month.`,
      type: 'info',
      icon: Calendar,
    },
    {
      id: '3',
      title: 'Monthly Cash Flow Active',
      message: `Monthly net burn is safely tracked at ${formatMoney(monthlyExpenses)}/mo.`,
      type: 'warning',
      icon: AlertCircle,
    }
  ];

  return (
    <header className={`sticky top-0 z-30 w-full border-b transition-colors ${
      isLight 
        ? 'border-slate-200/90 bg-white/90 backdrop-blur-md text-slate-900 shadow-sm' 
        : 'border-slate-800/60 bg-slate-950/80 backdrop-blur-md text-white'
    } px-4 sm:px-6 py-3`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform ring-1 ring-blue-400/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-extrabold text-base sm:text-lg tracking-tight group-hover:text-blue-500 transition-colors ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  AURA
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30 tracking-wider">
                  WEALTH
                </span>
              </div>
              {/* Palette Accent Dots */}
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#FA5F55]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                <span className={`text-[10px] hidden sm:inline ml-1 font-medium ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Capital & Net Worth
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Net Worth summary pill (Quick glance) */}
        <div className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border shadow-inner ${
          isLight ? 'bg-slate-100/90 border-slate-200 text-slate-900' : 'bg-slate-900/90 border-slate-800 text-white'
        }`}>
          <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Net Worth:</span>
          <span className={`text-sm font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {formatMoney(netWorth)}
          </span>
          <span className="flex items-center text-[11px] font-semibold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <TrendingUp className="w-3 h-3 mr-0.5" /> +3.4%
          </span>
        </div>

        {/* Right Tools: Search, Eye (Privacy), Currency, Mode Switcher, Alerts */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Global Search Button */}
          <button
            id="btn-global-search"
            onClick={() => setSearchOpen(true)}
            aria-label="Search transactions and assets"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-medium ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-blue-500/40' 
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-blue-500/40'
            }`}
          >
            <Search className="w-4 h-4 text-blue-500" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className={`hidden lg:inline text-[10px] px-1.5 py-0.5 rounded-full border ${
              isLight ? 'text-slate-600 bg-white border-slate-200' : 'text-slate-400 bg-slate-950 border-slate-800'
            }`}>⌘K</kbd>
          </button>

          {/* Privacy Mode (Eye Toggle) */}
          <button
            id="btn-privacy-eye"
            onClick={togglePrivateMode}
            aria-label={isPrivateMode ? 'Show balances' : 'Hide balances'}
            title={isPrivateMode ? 'Privacy Mode Active (Balances hidden)' : 'Privacy Mode Off (Balances visible)'}
            className={`p-2 rounded-full border transition-all ${
              isPrivateMode 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-sm' 
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
            }`}
          >
            {isPrivateMode ? (
              <EyeOff className="w-4 h-4 text-amber-500" />
            ) : (
              <Eye className="w-4 h-4 text-slate-500 hover:text-blue-500" />
            )}
          </button>

          {/* Currency Switcher */}
          <div className="relative">
            <button
              id="btn-currency-select"
              onClick={() => setIsCurrencyDropdownOpen(prev => !prev)}
              aria-label="Change currency"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-900 border-slate-200' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-800'
              }`}
            >
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isCurrencyDropdownOpen && (
              <div 
                className={`absolute right-0 mt-2 w-48 rounded-2xl border shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/40' : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
                onMouseLeave={() => setIsCurrencyDropdownOpen(false)}
              >
                <div className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  Base Currency
                </div>
                {Object.values(CURRENCY_CONFIGS).map(c => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code as CurrencyCode);
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors ${
                      currency === c.code 
                        ? 'bg-blue-600/20 text-blue-500 font-semibold border border-blue-500/30' 
                        : isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{c.code} ({c.symbol})</span>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Responsive View Switcher */}
          <button
            id="btn-mobile-sim-toggle"
            onClick={toggleMobileFrame}
            title={isMobileFrameSimulated ? 'Switch to Full Screen View' : 'Simulate Mobile Frame Preview'}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              isMobileFrameSimulated
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-500 font-semibold'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isMobileFrameSimulated ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                <span>Mobile Frame</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>System View</span>
              </>
            )}
          </button>

          {/* Notifications / Alerts */}
          <div className="relative">
            <button
              id="btn-notifications"
              onClick={() => setIsAlertsOpen(prev => !prev)}
              aria-label="Financial notifications"
              className={`relative p-2 rounded-full border transition-colors ${
                isLight 
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Bell className={`w-4 h-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white"></span>
            </button>

            {isAlertsOpen && (
              <div 
                className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 ${
                  isLight ? 'bg-white border-slate-200 shadow-slate-300/50' : 'bg-slate-900 border-slate-800'
                }`}
                onMouseLeave={() => setIsAlertsOpen(false)}
              >
                <div className={`flex items-center justify-between pb-2 mb-2 border-b ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Financial Vital Signs</span>
                  <span className="text-[10px] text-blue-500 bg-blue-500/15 px-2 py-0.5 rounded-full font-mono font-medium">All Systems Active</span>
                </div>
                <div className="space-y-2">
                  {alerts.map(a => {
                    const Icon = a.icon;
                    return (
                      <div key={a.id} className={`p-2.5 rounded-xl border text-xs ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950/70 border-slate-800/80 text-slate-200'
                      }`}>
                        <div className={`flex items-center gap-1.5 font-medium ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                          <Icon className={`w-3.5 h-3.5 ${
                            a.type === 'success' ? 'text-emerald-500' : a.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                          }`} />
                          <span>{a.title}</span>
                        </div>
                        <p className={`text-[11px] mt-1 pl-5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          {a.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
