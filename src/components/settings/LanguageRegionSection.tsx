import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Coins, 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  Sliders, 
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../../context/FinanceContext';
import { CurrencyCode } from '../../types';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  greeting: string;
  category: 'tamil_indian' | 'english' | 'international';
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // 1. 🇮🇳 TAMIL & INDIAN LANGUAGES
  { 
    code: 'ta', 
    name: 'Tamil', 
    nativeName: 'தமிழ்', 
    flag: '🇮🇳', 
    greeting: 'உங்கள் நிதி மேலாண்மை மையத்திற்கு வருக!',
    category: 'tamil_indian'
  },
  { 
    code: 'hi', 
    name: 'Hindi', 
    nativeName: 'हिन्दी', 
    flag: '🇮🇳', 
    greeting: 'आपके व्यक्तिगत वित्तीय हब में स्वागत है',
    category: 'tamil_indian'
  },
  { 
    code: 'te', 
    name: 'Telugu', 
    nativeName: 'తెలుగు', 
    flag: '🇮🇳', 
    greeting: 'మీ వ్యక్తిగత ఆర్థిక నిర్వహణ కేంద్రానికి స్వాగతం',
    category: 'tamil_indian'
  },
  { 
    code: 'kn', 
    name: 'Kannada', 
    nativeName: 'ಕನ್ನಡ', 
    flag: '🇮🇳', 
    greeting: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಹಣಕಾಸು ಹಬ್‌ಗೆ ಸುಸ್ವಾಗತ',
    category: 'tamil_indian'
  },
  { 
    code: 'ml', 
    name: 'Malayalam', 
    nativeName: 'മലയാളം', 
    flag: '🇮🇳', 
    greeting: 'നിങ്ങളുടെ വ്യക്തിഗത സാമ്പത്തിക കേന്ദ്രത്തിലേക്ക് സ്വാഗതം',
    category: 'tamil_indian'
  },
  { 
    code: 'bn', 
    name: 'Bengali', 
    nativeName: 'বাংলা', 
    flag: '🇮🇳', 
    greeting: 'আপনার ব্যক্তিগত আর্থিক কেন্দ্রে স্বাগতম',
    category: 'tamil_indian'
  },
  { 
    code: 'mr', 
    name: 'Marathi', 
    nativeName: 'मराठी', 
    flag: '🇮🇳', 
    greeting: 'आपल्या वैयक्तिक आर्थिक केंद्रात आपले स्वागत आहे',
    category: 'tamil_indian'
  },
  { 
    code: 'gu', 
    name: 'Gujarati', 
    nativeName: 'ગુજરાતી', 
    flag: '🇮🇳', 
    greeting: 'તમારા વ્યક્તિગત નાણાકીય હબમાં સ્વાગત છે',
    category: 'tamil_indian'
  },
  { 
    code: 'pa', 
    name: 'Punjabi', 
    nativeName: 'ਪੰਜਾਬੀ', 
    flag: '🇮🇳', 
    greeting: 'ਤੁਹਾਡੇ ਵਿੱਤੀ ਪ੍ਰਬੰਧਨ ਹੱਬ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ',
    category: 'tamil_indian'
  },
  { 
    code: 'or', 
    name: 'Odia', 
    nativeName: 'ଓଡ଼ିଆ', 
    flag: '🇮🇳', 
    greeting: 'ଆପଣଙ୍କର ବ୍ୟକ୍ତିଗତ ଆର୍ଥିକ ହବ୍‌କୁ ସ୍ୱାଗତ',
    category: 'tamil_indian'
  },
  { 
    code: 'ur', 
    name: 'Urdu', 
    nativeName: 'اردو', 
    flag: '🇮🇳', 
    greeting: 'آپ کے ذاتی مالیاتی مرکز میں خوش آمدید',
    category: 'tamil_indian'
  },
  { 
    code: 'as', 
    name: 'Assamese', 
    nativeName: 'অসমীয়া', 
    flag: '🇮🇳', 
    greeting: 'আপোনাৰ বিত্তীয় হাবলৈ স্বাগতম',
    category: 'tamil_indian'
  },

  // 2. 🌐 ENGLISH (ANY DIALECT / REGION)
  { 
    code: 'en-IN', 
    name: 'English (India)', 
    nativeName: 'English (India)', 
    flag: '🇮🇳', 
    greeting: 'Welcome to your financial command center',
    category: 'english'
  },
  { 
    code: 'en-US', 
    name: 'English (US)', 
    nativeName: 'English (US)', 
    flag: '🇺🇸', 
    greeting: 'Welcome to your financial hub',
    category: 'english'
  },
  { 
    code: 'en-GB', 
    name: 'English (UK)', 
    nativeName: 'English (UK)', 
    flag: '🇬🇧', 
    greeting: 'Welcome to your financial overview',
    category: 'english'
  },
  { 
    code: 'en-AU', 
    name: 'English (Australia)', 
    nativeName: 'English (Australia)', 
    flag: '🇦🇺', 
    greeting: "G'day, welcome to your financial summary",
    category: 'english'
  },
  { 
    code: 'en-CA', 
    name: 'English (Canada)', 
    nativeName: 'English (Canada)', 
    flag: '🇨🇦', 
    greeting: 'Welcome to your financial wealth dashboard',
    category: 'english'
  },
  { 
    code: 'en-SG', 
    name: 'English (Singapore)', 
    nativeName: 'English (Singapore)', 
    flag: '🇸🇬', 
    greeting: 'Welcome to your financial wealth hub',
    category: 'english'
  },
  { 
    code: 'en-INT', 
    name: 'English (Global)', 
    nativeName: 'English (International)', 
    flag: '🌐', 
    greeting: 'Welcome to your global financial command center',
    category: 'english'
  },

  // 3. 🌍 INTERNATIONAL LANGUAGES
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', greeting: 'Bienvenido a tu centro financiero', category: 'international' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', greeting: 'Bienvenue dans votre espace financier', category: 'international' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', greeting: 'Willkommen in Ihrer Finanzübersicht', category: 'international' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', greeting: '資産管理ダッシュボードへようこそ', category: 'international' },
  { code: 'zh', name: 'Mandarin (Simplified)', nativeName: '简体中文', flag: '🇨🇳', greeting: '欢迎来到您的财务中心', category: 'international' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇦🇪', greeting: 'مرحباً بك في مركزك المالي', category: 'international' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', greeting: 'Bem-vindo ao seu painel financeiro', category: 'international' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', greeting: 'Добро пожаловать в финансовый центр', category: 'international' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', greeting: 'Benvenuto nel tuo centro finanziario', category: 'international' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', greeting: '자산 관리 허브에 오신 것을 환영합니다', category: 'international' },
];

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  currency: CurrencyCode;
  fiscalYear: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', fiscalYear: 'Jan - Dec (Calendar Year)' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', fiscalYear: 'Apr - Mar (Fiscal Year)' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', fiscalYear: 'Apr 6 - Apr 5' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', fiscalYear: 'Jan - Dec (Calendar Year)' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', fiscalYear: 'Jul - Jun (Fiscal Year)' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', fiscalYear: 'Jan - Dec (Calendar Year)' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', fiscalYear: 'Jan - Dec (Calendar Year)' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', fiscalYear: 'Jan - Dec (Calendar Year)' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', fiscalYear: 'Apr - Mar' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', fiscalYear: 'Jan - Dec (Calendar Year)' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'USD', fiscalYear: 'Jan - Dec (Calendar Year)' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'USD', fiscalYear: 'Jan - Dec (Calendar Year)' },
];

export const TIMEZONE_OPTIONS = [
  { id: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)', offset: 'UTC-08:00', city: 'San Francisco, LA' },
  { id: 'America/New_York', label: 'Eastern Time (US & Canada)', offset: 'UTC-05:00', city: 'New York, Toronto' },
  { id: 'Europe/London', label: 'Greenwich Mean Time / BST', offset: 'UTC+00:00', city: 'London, Dublin' },
  { id: 'Europe/Paris', label: 'Central European Time', offset: 'UTC+01:00', city: 'Paris, Berlin, Rome' },
  { id: 'Asia/Dubai', label: 'Gulf Standard Time', offset: 'UTC+04:00', city: 'Dubai, Abu Dhabi' },
  { id: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: 'UTC+05:30', city: 'Mumbai, New Delhi, Bengaluru' },
  { id: 'Asia/Singapore', label: 'Singapore & Hong Kong Time', offset: 'UTC+08:00', city: 'Singapore, Hong Kong' },
  { id: 'Asia/Tokyo', label: 'Japan Standard Time', offset: 'UTC+09:00', city: 'Tokyo, Seoul' },
  { id: 'Australia/Sydney', label: 'Australian Eastern Time', offset: 'UTC+10:00', city: 'Sydney, Melbourne' },
];

export const DATE_FORMATS = [
  { id: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO 8601)', sample: '2026-09-21', desc: 'Global technical standard' },
  { id: 'DD/MM/YYYY', label: 'DD/MM/YYYY', sample: '21/09/2026', desc: 'UK, India, Europe & Commonwealth' },
  { id: 'MM/DD/YYYY', label: 'MM/DD/YYYY', sample: '09/21/2026', desc: 'United States default' },
  { id: 'DD MMM YYYY', label: 'DD MMM YYYY', sample: '21 Sep 2026', desc: 'Unambiguous written date' },
];

export const NUMBER_FORMATS = [
  { id: 'standard', label: 'Standard International', sample: '1,250,500.00', desc: 'Millions and Billions (1,000,000)' },
  { id: 'lakhs', label: 'South Asian (Lakhs & Crores)', sample: '12,50,500.00', desc: 'Lakhs and Crores (10,00,000)' },
  { id: 'european', label: 'European Period/Comma', sample: '1.250.500,00', desc: 'Decimal comma delimiter' },
];

export const LanguageRegionSection: React.FC = () => {
  const { theme, currency, setCurrency, formatMoney } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Persistent settings state
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('fix_settings_language') || 'en-US';
  });

  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('fix_settings_country') || 'US';
  });

  const [selectedDateFormat, setSelectedDateFormat] = useState<string>(() => {
    return localStorage.getItem('fix_settings_date_format') || 'DD MMM YYYY';
  });

  const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
    return localStorage.getItem('fix_settings_timezone') || 'Asia/Kolkata';
  });

  const [selectedNumberFormat, setSelectedNumberFormat] = useState<string>(() => {
    return localStorage.getItem('fix_settings_number_format') || 'standard';
  });

  const [firstDayOfWeek, setFirstDayOfWeek] = useState<string>(() => {
    return localStorage.getItem('fix_settings_first_day') || 'Monday';
  });

  const [langCategory, setLangCategory] = useState<'all' | 'tamil_indian' | 'english' | 'international'>('all');
  const [langSearch, setLangSearch] = useState('');

  const [saveToast, setSaveToast] = useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState('');

  // Live clock based on selected timezone
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: selectedTimezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        setCurrentTimeDisplay(formatter.format(now));
      } catch {
        setCurrentTimeDisplay(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedTimezone]);

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    localStorage.setItem('fix_settings_language', langCode);
    showSavedNotification();
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    localStorage.setItem('fix_settings_country', countryCode);
    // Auto-suggest country currency if appropriate
    const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setCurrency(country.currency);
    }
    showSavedNotification();
  };

  const handleDateFormatChange = (format: string) => {
    setSelectedDateFormat(format);
    localStorage.setItem('fix_settings_date_format', format);
    showSavedNotification();
  };

  const handleTimezoneChange = (tz: string) => {
    setSelectedTimezone(tz);
    localStorage.setItem('fix_settings_timezone', tz);
    showSavedNotification();
  };

  const handleNumberFormatChange = (nf: string) => {
    setSelectedNumberFormat(nf);
    localStorage.setItem('fix_settings_number_format', nf);
    showSavedNotification();
  };

  const handleFirstDayChange = (day: string) => {
    setFirstDayOfWeek(day);
    localStorage.setItem('fix_settings_first_day', day);
    showSavedNotification();
  };

  const showSavedNotification = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const activeCountryObj = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry) || SUPPORTED_COUNTRIES[0];
  const activeTzObj = TIMEZONE_OPTIONS.find(t => t.id === selectedTimezone) || TIMEZONE_OPTIONS[0];

  return (
    <section id="section-language-region" className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/15 text-blue-500">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Language & Region
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/20">
                {activeCountryObj.flag} {activeCountryObj.code} • {activeLangObj.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose your language, currency, country, date format, and time zone
            </p>
          </div>
        </div>

        {/* Live Greeting & Time Pill */}
        <div className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border text-xs font-mono ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/80 border-slate-800 text-slate-300'
        }`}>
          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{currentTimeDisplay || 'Live Clock Syncing...'}</span>
          {saveToast && (
            <span className="text-emerald-500 text-[10px] font-sans font-bold flex items-center gap-1 animate-in fade-in">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Localized Greeting Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
        isLight ? 'bg-blue-50/60 border-blue-200/70 text-blue-900' : 'bg-blue-950/20 border-blue-900/40 text-blue-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{activeLangObj.flag}</span>
          <div>
            <div className="text-xs font-bold">{activeLangObj.greeting}</div>
            <div className="text-[11px] text-blue-600/80 dark:text-blue-300/80 font-mono">
              Locale: {activeLangObj.nativeName} ({activeLangObj.name}) • Valuation in {currency}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 font-semibold">
          Auto-Localized
        </span>
      </div>

      {/* Grid of Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* 1. Language Selector */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Display Language</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              {SUPPORTED_LANGUAGES.length} languages
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Choose your language: Tamil, Indian languages (Hindi, Telugu, Kannada, etc.), and English varieties.
          </p>

          {/* Quick Select Popular Languages */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium">Quick Pick:</span>
            {[
              { code: 'ta', label: '🇮🇳 தமிழ் (Tamil)' },
              { code: 'en-IN', label: '🇮🇳 English (India)' },
              { code: 'hi', label: '🇮🇳 हिन्दी' },
              { code: 'en-US', label: '🇺🇸 English (US)' },
              { code: 'en-GB', label: '🇬🇧 English (UK)' },
            ].map(quick => (
              <button
                key={quick.code}
                onClick={() => handleLanguageChange(quick.code)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                  selectedLanguage === quick.code
                    ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                    : isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {quick.label}
              </button>
            ))}
          </div>

          {/* Category Tabs & Search Bar */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[
                { id: 'all', label: `All (${SUPPORTED_LANGUAGES.length})` },
                { id: 'tamil_indian', label: '🇮🇳 Tamil & Indian' },
                { id: 'english', label: '🌐 English Any' },
                { id: 'international', label: '🌍 Global' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setLangCategory(cat.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                    langCategory === cat.id
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : isLight
                        ? 'bg-white hover:bg-slate-200/70 text-slate-600 border border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Language Search */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2.5 top-2 text-slate-400" />
              <input
                type="text"
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                placeholder="Search language (e.g., Tamil, Telugu, English)..."
                className={`w-full pl-7 pr-7 py-1 text-[11px] rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
              {langSearch && (
                <button
                  onClick={() => setLangSearch('')}
                  className="absolute right-2 top-1.5 text-[10px] text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Languages Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {SUPPORTED_LANGUAGES
              .filter(lang => {
                const matchesCat = langCategory === 'all' || lang.category === langCategory;
                if (!matchesCat) return false;
                if (!langSearch.trim()) return true;
                const q = langSearch.toLowerCase();
                return (
                  lang.name.toLowerCase().includes(q) ||
                  lang.nativeName.toLowerCase().includes(q) ||
                  lang.code.toLowerCase().includes(q)
                );
              })
              .map(lang => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-bold ring-2 ring-blue-500/20'
                        : isLight 
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' 
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base shrink-0">{lang.flag}</span>
                      <div className="truncate">
                        <div className="truncate font-semibold flex items-center gap-1">
                          <span>{lang.nativeName}</span>
                          {lang.code === 'ta' && (
                            <span className="text-[9px] px-1 rounded bg-amber-400/20 text-amber-300 font-normal">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {lang.name}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                  </button>
                );
              })}
          </div>
        </div>

        {/* 2. Country / Region */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Country & Fiscal Region</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Tax & Accounting</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Defines your financial calendar, tax year cycle, and benchmark metrics.
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
            {SUPPORTED_COUNTRIES.map(country => {
              const isSelected = selectedCountry === country.code;
              return (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold'
                      : isLight 
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' 
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base shrink-0">{country.flag}</span>
                    <div className="truncate">
                      <div className="truncate font-semibold">{country.name}</div>
                      <div className={`text-[10px] font-mono ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {country.currency} • {country.fiscalYear.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Date Format */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>Date Format</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-500 font-bold">
              {selectedDateFormat}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Preferred visual notation for transaction dates and timeline entries.
          </p>
          <div className="space-y-1.5">
            {DATE_FORMATS.map(df => {
              const isSelected = selectedDateFormat === df.id;
              return (
                <button
                  key={df.id}
                  onClick={() => handleDateFormatChange(df.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm font-bold'
                      : isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-xs">{df.label}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                      Preview: <span className="font-mono font-bold">{df.sample}</span> ({df.desc})
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Time Zone */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Time Zone</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 font-bold">
              {activeTzObj.offset}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Syncs cash flow calendar triggers and daily midnight ledger roll-overs.
          </p>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {TIMEZONE_OPTIONS.map(tz => {
              const isSelected = selectedTimezone === tz.id;
              return (
                <button
                  key={tz.id}
                  onClick={() => handleTimezoneChange(tz.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-500 shadow-sm font-bold'
                      : isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="font-semibold text-xs truncate">{tz.label}</div>
                    <div className={`text-[10px] font-mono truncate ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                      {tz.city} ({tz.offset})
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Currency Selection Standard (Integrated directly with FinanceContext) */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Valuation Currency Standard
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/20">
              Active: {currency} ({CURRENCY_CONFIGS[currency]?.symbol})
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Sample Valuation: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{formatMoney(1254300)}</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {Object.values(CURRENCY_CONFIGS).map(c => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code as CurrencyCode);
                  showSavedNotification();
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 font-bold scale-[1.02]'
                    : isLight
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-black">{c.symbol}</span>
                  <span className="text-[10px] font-mono opacity-80 font-bold">{c.code}</span>
                </div>
                <div className="text-[11px] truncate mt-1 font-semibold">{c.name}</div>
                <div className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                  1 USD ≈ {(1 / c.rateToUSD).toFixed(c.rateToUSD < 0.05 ? 0 : 2)} {c.code}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Formatting & Calendar Extras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Number Delimiter */}
        <div className={`p-4 rounded-2xl border space-y-2.5 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">Number Delimiter Format</span>
            <span className="text-[10px] font-mono text-blue-500">{selectedNumberFormat}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {NUMBER_FORMATS.map(nf => (
              <button
                key={nf.id}
                onClick={() => handleNumberFormatChange(nf.id)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  selectedNumberFormat === nf.id
                    ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-xs'
                    : isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="text-[10px] font-mono font-bold truncate">{nf.sample}</div>
                <div className="text-[9px] opacity-80 truncate">{nf.label.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* First Day of Week */}
        <div className={`p-4 rounded-2xl border space-y-2.5 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">First Day of the Week</span>
            <span className="text-[10px] font-mono text-emerald-500">{firstDayOfWeek}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Monday', 'Sunday'].map(day => (
              <button
                key={day}
                onClick={() => handleFirstDayChange(day)}
                className={`p-2 rounded-xl border text-center font-bold transition-all ${
                  firstDayOfWeek === day
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {day} (Calendar Start)
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
