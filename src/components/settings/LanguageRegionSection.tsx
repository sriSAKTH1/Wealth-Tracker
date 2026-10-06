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
  Search,
  Pencil,
  Bot,
  X,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Radio,
  Activity
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../../context/FinanceContext';
import { CurrencyCode, CurrencyConfig } from '../../types';

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
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', fiscalYear: 'Apr - Mar (Fiscal Year)' },
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', fiscalYear: 'Jan - Dec (Calendar Year)' },
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

export const CURRENCY_FLAGS: Record<string, string> = {
  INR: '🇮🇳',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  JPY: '🇯🇵',
  SGD: '🇸🇬',
  CHF: '🇨🇭',
};

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
  const { 
    theme, 
    currency, 
    setCurrency, 
    formatMoney,
    liveCurrencyConfigs,
    refreshLiveCurrencyRates,
    isForexLoading,
    lastForexUpdated,
    isForexLive
  } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Strongly typed currency list from live configs
  const currencyConfigsList = (Object.values(liveCurrencyConfigs || CURRENCY_CONFIGS) as CurrencyConfig[]);

  // Live Currency Converter State
  const [converterAmount, setConverterAmount] = useState<number>(1000);
  const [converterSource, setConverterSource] = useState<CurrencyCode>('USD');
  const [isRefreshingFx, setIsRefreshingFx] = useState(false);
  const [manualFxSuccess, setManualFxSuccess] = useState<string | null>(null);

  const handleRefreshFx = async () => {
    setIsRefreshingFx(true);
    setManualFxSuccess(null);
    try {
      await refreshLiveCurrencyRates();
      setManualFxSuccess('Live currency exchange rates updated successfully!');
      setTimeout(() => setManualFxSuccess(null), 3000);
    } finally {
      setIsRefreshingFx(false);
    }
  };

  // Persistent settings state - defaulted to Indian locale & currency
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return localStorage.getItem('fix_settings_language') || 'en-IN';
  });

  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    return localStorage.getItem('fix_settings_country') || 'IN';
  });

  const [selectedDateFormat, setSelectedDateFormat] = useState<string>(() => {
    return localStorage.getItem('fix_settings_date_format') || 'DD MMM YYYY';
  });

  const [selectedTimezone, setSelectedTimezone] = useState<string>(() => {
    return localStorage.getItem('fix_settings_timezone') || 'Asia/Kolkata';
  });

  const [selectedNumberFormat, setSelectedNumberFormat] = useState<string>(() => {
    return localStorage.getItem('fix_settings_number_format') || 'lakhs';
  });

  const [firstDayOfWeek, setFirstDayOfWeek] = useState<string>(() => {
    return localStorage.getItem('fix_settings_first_day') || 'Monday';
  });

  // Editing state for each of the sections
  const [isEditingLang, setIsEditingLang] = useState(false);
  const [draftLanguage, setDraftLanguage] = useState(selectedLanguage);

  const [isEditingCountry, setIsEditingCountry] = useState(false);
  const [draftCountry, setDraftCountry] = useState(selectedCountry);

  const [isEditingDateFormat, setIsEditingDateFormat] = useState(false);
  const [draftDateFormat, setDraftDateFormat] = useState(selectedDateFormat);

  const [isEditingTimezone, setIsEditingTimezone] = useState(false);
  const [draftTimezone, setDraftTimezone] = useState(selectedTimezone);

  // Currency Standard editing state (defaults to Indian Rupee INR)
  const [isEditingCurrency, setIsEditingCurrency] = useState(false);
  const [draftCurrency, setDraftCurrency] = useState<CurrencyCode>(currency);
  const [currencySearch, setCurrencySearch] = useState('');

  useEffect(() => {
    setDraftCurrency(currency);
  }, [currency]);

  const handleCurrencyChange = (currCode: CurrencyCode) => {
    setCurrency(currCode);
    localStorage.setItem('aura_currency', currCode);
    const cfg = (liveCurrencyConfigs || CURRENCY_CONFIGS)[currCode];
    showSavedNotification(`Currency Standard saved: ${currCode} (${cfg?.symbol || ''})`);
  };

  const handleSaveCurrency = () => {
    handleCurrencyChange(draftCurrency);
    setIsEditingCurrency(false);
  };

  const [langCategory, setLangCategory] = useState<'all' | 'tamil_indian' | 'english' | 'international'>('all');
  const [langSearch, setLangSearch] = useState('');

  const [saveToast, setSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Saved');
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

  const showSavedNotification = (msg = 'Saved') => {
    setToastMessage(msg);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    localStorage.setItem('fix_settings_language', langCode);
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
    showSavedNotification(`Language saved: ${lang?.nativeName || langCode} (AI Chat)`);
  };

  const handleSaveLanguage = () => {
    handleLanguageChange(draftLanguage);
    setIsEditingLang(false);
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    localStorage.setItem('fix_settings_country', countryCode);
    // Auto-suggest country currency if appropriate
    const country = SUPPORTED_COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setCurrency(country.currency);
    }
    showSavedNotification(`Country saved: ${country?.name || countryCode}`);
  };

  const handleSaveCountry = () => {
    handleCountryChange(draftCountry);
    setIsEditingCountry(false);
  };

  const handleDateFormatChange = (format: string) => {
    setSelectedDateFormat(format);
    localStorage.setItem('fix_settings_date_format', format);
    showSavedNotification(`Date format updated`);
  };

  const handleSaveDateFormat = () => {
    handleDateFormatChange(draftDateFormat);
    setIsEditingDateFormat(false);
  };

  const handleTimezoneChange = (tz: string) => {
    setSelectedTimezone(tz);
    localStorage.setItem('fix_settings_timezone', tz);
    showSavedNotification(`Time zone updated`);
  };

  const handleSaveTimezone = () => {
    handleTimezoneChange(draftTimezone);
    setIsEditingTimezone(false);
  };

  const handleNumberFormatChange = (nf: string) => {
    setSelectedNumberFormat(nf);
    localStorage.setItem('fix_settings_number_format', nf);
    showSavedNotification('Number delimiter updated');
  };

  const handleFirstDayChange = (day: string) => {
    setFirstDayOfWeek(day);
    localStorage.setItem('fix_settings_first_day', day);
    showSavedNotification('First day of week updated');
  };

  const getFormattedDateSample = (formatId: string) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthShort = monthNames[now.getMonth()];

    switch (formatId) {
      case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
      case 'DD MMM YYYY': return `${day} ${monthShort} ${year}`;
      default: return `${day} ${monthShort} ${year}`;
    }
  };

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const activeCountryObj = SUPPORTED_COUNTRIES.find(c => c.code === selectedCountry) || SUPPORTED_COUNTRIES[0];
  const activeDateFormatObj = DATE_FORMATS.find(df => df.id === selectedDateFormat) || DATE_FORMATS[0];
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
              <Check className="w-3 h-3" /> {toastMessage}
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
              AI Chat Language: {activeLangObj.nativeName} ({activeLangObj.name}) • UI: English • Valuation in {currency}
            </div>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 font-semibold text-blue-600 dark:text-blue-400">
          AI Language Active
        </span>
      </div>

      {/* Grid of Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* 1. Language Selector */}
        <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Language (AI Assistant)</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
              {activeLangObj.code} • {activeLangObj.nativeName}
            </span>
          </div>

          {!isEditingLang ? (
            /* Selected Summary View - Only show what the user selected */
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl shrink-0">{activeLangObj.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {activeLangObj.nativeName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        ({activeLangObj.name})
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                        Selected
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-0.5">
                      "{activeLangObj.greeting}"
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold block">
                    Code: {activeLangObj.code}
                  </span>
                </div>
              </div>

              {/* Informational Pill about AI Chat Only */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11px] ${
                isLight ? 'bg-blue-50/50 border-blue-200/60 text-blue-900' : 'bg-blue-950/20 border-blue-900/40 text-blue-300'
              }`}>
                <Bot className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">AI Chat Language Only:</span> The AI Assistant answers and delivers personalized advice in <strong>{activeLangObj.nativeName} ({activeLangObj.name})</strong>. All dashboard navigation, tabs, cards, and calculators remain in <strong>English</strong>.
                </div>
              </div>

              {/* Change Button */}
              <button
                onClick={() => {
                  setDraftLanguage(selectedLanguage);
                  setIsEditingLang(true);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-blue-600 border-blue-200 hover:border-blue-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-blue-400 border-slate-800 hover:border-blue-500/40'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Change Language</span>
              </button>
            </div>
          ) : (
            /* Editing / Picker Mode with Save and Cancel */
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Select AI Chat Language (Click option, then click Save)
                </span>
                <button
                  onClick={() => setIsEditingLang(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Picks */}
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
                    onClick={() => setDraftLanguage(quick.code)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                      draftLanguage === quick.code
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

              {/* Category Tabs */}
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
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
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

              {/* Search */}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search language (e.g. Tamil, Telugu, Hindi)..."
                  className={`w-full pl-7 pr-7 py-1.5 text-[11px] rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
                {langSearch && (
                  <button
                    onClick={() => setLangSearch('')}
                    className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* List */}
              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
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
                    const isDraft = draftLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        onClick={() => setDraftLanguage(lang.code)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isDraft
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
                            <div className={`text-[10px] truncate ${isDraft ? 'text-blue-100' : 'text-slate-400'}`}>
                              {lang.name}
                            </div>
                          </div>
                        </div>
                        {isDraft && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                      </button>
                    );
                  })}
              </div>

              {/* Save & Cancel Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsEditingLang(false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLanguage}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Language</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Country / Region */}
        <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Country & Fiscal Region</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              {activeCountryObj.code} • {activeCountryObj.currency}
            </span>
          </div>

          {!isEditingCountry ? (
            /* Selected Summary View - Only show what the user selected */
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl shrink-0">{activeCountryObj.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {activeCountryObj.name}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                        Selected
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                      Base Currency: <strong>{activeCountryObj.currency} ({CURRENCY_CONFIGS[activeCountryObj.currency]?.symbol})</strong> • Fiscal: {activeCountryObj.fiscalYear}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold block">
                    {activeCountryObj.code}
                  </span>
                </div>
              </div>

              {/* Informational Pill about Fiscal Standard */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11px] ${
                isLight ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-900' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
              }`}>
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Fiscal Standard:</span> Sets your financial calendar, tax year cycle, benchmark tax metrics, and default base currency across the application.
                </div>
              </div>

              {/* Change Button */}
              <button
                onClick={() => {
                  setDraftCountry(selectedCountry);
                  setIsEditingCountry(true);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-emerald-600 border-emerald-200 hover:border-emerald-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Change Country & Region</span>
              </button>
            </div>
          ) : (
            /* Editing / Picker Mode with Save and Cancel */
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Select Country & Fiscal Region (Click option, then click Save)
                </span>
                <button
                  onClick={() => setIsEditingCountry(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                {SUPPORTED_COUNTRIES.map(country => {
                  const isDraft = draftCountry === country.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => setDraftCountry(country.code)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isDraft
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold ring-2 ring-emerald-500/20'
                          : isLight 
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base shrink-0">{country.flag}</span>
                        <div className="truncate">
                          <div className="truncate font-semibold">{country.name}</div>
                          <div className={`text-[10px] font-mono ${isDraft ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {country.currency} • {country.fiscalYear.split(' ')[0]}
                          </div>
                        </div>
                      </div>
                      {isDraft && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Save & Cancel Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsEditingCountry(false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCountry}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Country</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Date Format */}
        <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>Date Notation Format</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-500 border border-purple-500/30">
              {selectedDateFormat}
            </span>
          </div>

          {!isEditingDateFormat ? (
            /* Selected Summary View - Only show what the user selected */
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-500 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                        {activeDateFormatObj.label}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                        Selected
                      </span>
                    </div>
                    <div className="text-[11px] text-purple-600 dark:text-purple-400 font-mono font-bold mt-0.5">
                      Sample Today: {getFormattedDateSample(selectedDateFormat)}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {activeDateFormatObj.desc}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 font-bold block">
                    {activeDateFormatObj.id}
                  </span>
                </div>
              </div>

              {/* Informational Pill */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11px] ${
                isLight ? 'bg-purple-50/50 border-purple-200/60 text-purple-900' : 'bg-purple-950/20 border-purple-900/40 text-purple-300'
              }`}>
                <Calendar className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Format Standard:</span> Applied uniformly across transaction dates, statement exports, timeline entries, and date pickers.
                </div>
              </div>

              {/* Change Button */}
              <button
                onClick={() => {
                  setDraftDateFormat(selectedDateFormat);
                  setIsEditingDateFormat(true);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-purple-600 border-purple-200 hover:border-purple-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-purple-400 border-slate-800 hover:border-purple-500/40'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Change Date Format</span>
              </button>
            </div>
          ) : (
            /* Editing / Picker Mode with Save and Cancel */
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Select Date Notation Format (Click option, then click Save)
                </span>
                <button
                  onClick={() => setIsEditingDateFormat(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {DATE_FORMATS.map(df => {
                  const isDraft = draftDateFormat === df.id;
                  return (
                    <button
                      key={df.id}
                      onClick={() => setDraftDateFormat(df.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isDraft
                          ? 'bg-purple-600 text-white border-purple-500 shadow-sm font-bold ring-2 ring-purple-500/20'
                          : isLight
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs">{df.label}</div>
                        <div className={`text-[10px] ${isDraft ? 'text-purple-100' : 'text-slate-400'}`}>
                          Preview: <span className="font-mono font-bold">{getFormattedDateSample(df.id)}</span> ({df.desc})
                        </div>
                      </div>
                      {isDraft && <Check className="w-4 h-4 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Save & Cancel Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsEditingDateFormat(false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDateFormat}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Format</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Time Zone */}
        <div className={`p-5 rounded-2xl border space-y-4 transition-all ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Time Zone & Real-Time Sync</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
              {activeTzObj.offset}
            </span>
          </div>

          {!isEditingTimezone ? (
            /* Selected Summary View - Only show what the user selected */
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {activeTzObj.label}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                        Selected
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                      {activeTzObj.city} • <strong className="text-amber-600 dark:text-amber-400 font-mono">{activeTzObj.offset}</strong>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Zone Clock: {currentTimeDisplay || 'Syncing...'}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold block">
                    {activeTzObj.offset}
                  </span>
                </div>
              </div>

              {/* Informational Pill */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11px] ${
                isLight ? 'bg-amber-50/50 border-amber-200/60 text-amber-900' : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
              }`}>
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Real-Time Sync:</span> Coordinates cash flow calendar triggers, daily midnight ledger roll-overs, automated transaction reminders, and recurring series triggers.
                </div>
              </div>

              {/* Change Button */}
              <button
                onClick={() => {
                  setDraftTimezone(selectedTimezone);
                  setIsEditingTimezone(true);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-amber-600 border-amber-200 hover:border-amber-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Change Time Zone</span>
              </button>
            </div>
          ) : (
            /* Editing / Picker Mode with Save and Cancel */
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Select Time Zone (Click option, then click Save)
                </span>
                <button
                  onClick={() => setIsEditingTimezone(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {TIMEZONE_OPTIONS.map(tz => {
                  const isDraft = draftTimezone === tz.id;
                  return (
                    <button
                      key={tz.id}
                      onClick={() => setDraftTimezone(tz.id)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isDraft
                          ? 'bg-amber-600 text-white border-amber-500 shadow-sm font-bold ring-2 ring-amber-500/20'
                          : isLight
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="font-semibold text-xs truncate">{tz.label}</div>
                        <div className={`text-[10px] font-mono truncate ${isDraft ? 'text-amber-100' : 'text-slate-400'}`}>
                          {tz.city} ({tz.offset})
                        </div>
                      </div>
                      {isDraft && <Check className="w-4 h-4 shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Save & Cancel Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsEditingTimezone(false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTimezone}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Timezone</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. Currency Selection Standard (Live Price & Real-Time Forex Feed) */}
      <div id="section-currency-standard" className={`p-5 rounded-2xl border space-y-4 ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Currency Standard</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/20">
                    Active: {currency} ({liveCurrencyConfigs[currency]?.symbol || CURRENCY_CONFIGS[currency]?.symbol})
                  </span>
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 dark:text-blue-400 font-bold border border-blue-500/20">
                  <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>Live Market Price Stream</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time interbank market pricing for assets, loans, net worth, statements, and ledger valuations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Indicator Pill */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono font-semibold border ${
              isForexLive 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live FX Rate Feed</span>
              <span className="opacity-60 text-[10px]">
                • {lastForexUpdated ? new Date(lastForexUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Now'}
              </span>
            </div>

            {/* Refresh Live Rates Button */}
            <button
              type="button"
              id="btn-refresh-forex"
              onClick={handleRefreshFx}
              disabled={isRefreshingFx || isForexLoading}
              title="Fetch latest live exchange rates from live currency feeds"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${isRefreshingFx || isForexLoading ? 'animate-spin' : ''}`} />
              <span>{isRefreshingFx || isForexLoading ? 'Updating Live...' : 'Refresh Live Rates'}</span>
            </button>
          </div>
        </div>

        {/* Live Forex Market Ticker Ribbon */}
        <div className={`p-2.5 rounded-xl border flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-mono ${
          isLight ? 'bg-white/80 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-slate-200 dark:border-slate-800 font-bold text-[10px] text-emerald-500 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Ticker</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] shrink-0 font-medium">
            {currencyConfigsList
              .filter(c => c.code !== 'USD')
              .map(c => {
                const ratePerUSD = c.ratePerUSD || (c.rateToUSD > 0 ? 1 / c.rateToUSD : 1);
                const isEURorGBP = c.code === 'EUR' || c.code === 'GBP' || c.code === 'AUD';
                const quoteText = isEURorGBP
                  ? `${c.code}/USD: $${(c.rateToUSD || 1).toFixed(4)}`
                  : `USD/${c.code}: ${c.symbol}${ratePerUSD >= 100 ? ratePerUSD.toFixed(2) : ratePerUSD.toFixed(4)}`;
                const isUp = (c.priceChange24h ?? 0) >= 0;
                return (
                  <span key={c.code} className="inline-flex items-center gap-1 shrink-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{quoteText}</span>
                    <span className={`text-[10px] ${isUp ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}`}>
                      {isUp ? '+' : ''}{(c.priceChange24h ?? 0).toFixed(2)}%
                    </span>
                  </span>
                );
              })}
          </div>
        </div>

        {manualFxSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{manualFxSuccess}</span>
          </div>
        )}

        {/* Currency Standard & Statement: Summary View vs Edit Mode */}
        {(() => {
          const activeCurrencyObj = (liveCurrencyConfigs || CURRENCY_CONFIGS)[currency] || CURRENCY_CONFIGS.INR;
          return !isEditingCurrency ? (
            /* Selected Summary View - Only show what the user selected (default: Indian currency INR ₹) */
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center gap-3.5">
                  <span className="text-4xl shrink-0">{CURRENCY_FLAGS[activeCurrencyObj.code] || '🇮🇳'}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xl font-black text-slate-900 dark:text-white">
                        {activeCurrencyObj.symbol} {activeCurrencyObj.code}
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        ({activeCurrencyObj.name})
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/25">
                        Selected Standard
                      </span>
                      {activeCurrencyObj.code === 'INR' && (
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/25">
                          Default Currency
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1 flex items-center gap-3 flex-wrap">
                      <span>
                        Live Market Rate: <strong className="text-slate-900 dark:text-white">{activeCurrencyObj.code === 'USD' ? '$1.00 USD' : `1 USD = ${activeCurrencyObj.symbol}${activeCurrencyObj.ratePerUSD >= 100 ? activeCurrencyObj.ratePerUSD.toFixed(2) : activeCurrencyObj.ratePerUSD.toFixed(4)}`}</strong>
                      </span>
                      <span className="opacity-80">
                        Unit in USD: <strong>${activeCurrencyObj.rateToUSD >= 1 ? activeCurrencyObj.rateToUSD.toFixed(4) : activeCurrencyObj.rateToUSD.toFixed(4)}</strong>
                      </span>
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${(activeCurrencyObj.priceChange24h ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(activeCurrencyObj.priceChange24h ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{(activeCurrencyObj.priceChange24h ?? 0) >= 0 ? '+' : ''}{(activeCurrencyObj.priceChange24h ?? 0).toFixed(2)}% (24h)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Synced</span>
                  </span>
                </div>
              </div>

              {/* Informational Pill about Currency Standard / Statement */}
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-[11px] ${
                isLight ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-900' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
              }`}>
                <Coins className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Currency Statement &amp; Valuation Standard:</span> The application default is calibrated in <strong>{activeCurrencyObj.name} ({activeCurrencyObj.symbol})</strong>. All account balances, net worth statements, income &amp; expense ledgers, emergency runway metrics, and wealth charts are calculated and displayed in this live currency standard.
                </div>
              </div>

              {/* Change Currency Button */}
              <button
                id="btn-change-currency-standard"
                onClick={() => {
                  setDraftCurrency(currency);
                  setIsEditingCurrency(true);
                }}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 text-emerald-600 border-emerald-200 hover:border-emerald-300'
                    : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Change Currency Standard</span>
              </button>
            </div>
          ) : (
            /* Editing / Picker Mode with Save and Cancel */
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Select Valuation Currency Standard (Click option, then click Save)
                </span>
                <button
                  onClick={() => setIsEditingCurrency(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Pick Pills - featuring Indian Currency INR first */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Quick Pick:</span>
                {[
                  { code: 'INR', label: '🇮🇳 INR (Indian Rupee - ₹)' },
                  { code: 'USD', label: '🇺🇸 USD ($)' },
                  { code: 'EUR', label: '🇪🇺 EUR (€)' },
                  { code: 'GBP', label: '🇬🇧 GBP (£)' },
                  { code: 'SGD', label: '🇸🇬 SGD (S$)' },
                  { code: 'CAD', label: '🇨🇦 CAD (C$)' },
                  { code: 'AUD', label: '🇦🇺 AUD (A$)' },
                  { code: 'JPY', label: '🇯🇵 JPY (¥)' },
                  { code: 'CHF', label: '🇨🇭 CHF' },
                ].map(quick => (
                  <button
                    key={quick.code}
                    onClick={() => setDraftCurrency(quick.code as CurrencyCode)}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      draftCurrency === quick.code
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                        : isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    {quick.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  placeholder="Search currency (e.g. INR, Rupee, USD, EUR)..."
                  className={`w-full pl-7 pr-7 py-1.5 text-[11px] rounded-lg border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
                {currencySearch && (
                  <button
                    onClick={() => setCurrencySearch('')}
                    className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* List of Currencies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {currencyConfigsList
                  .filter(c => {
                    if (!currencySearch.trim()) return true;
                    const q = currencySearch.toLowerCase();
                    return (
                      c.name.toLowerCase().includes(q) ||
                      c.code.toLowerCase().includes(q) ||
                      c.symbol.toLowerCase().includes(q)
                    );
                  })
                  .map(c => {
                    const isDraft = draftCurrency === c.code;
                    const ratePerUSD = c.ratePerUSD || (c.rateToUSD > 0 ? 1 / c.rateToUSD : 1);
                    const rateToUSD = c.rateToUSD || (ratePerUSD > 0 ? 1 / ratePerUSD : 1);
                    const isEURorGBP = c.code === 'EUR' || c.code === 'GBP' || c.code === 'AUD';
                    const quoteText = isEURorGBP
                      ? `${c.code}/USD: $${rateToUSD.toFixed(4)}`
                      : `1 USD = ${c.symbol}${ratePerUSD >= 100 ? ratePerUSD.toFixed(2) : ratePerUSD.toFixed(4)}`;
                    const flag = CURRENCY_FLAGS[c.code] || '🌐';

                    return (
                      <button
                        key={c.code}
                        id={`btn-select-currency-${c.code.toLowerCase()}`}
                        onClick={() => setDraftCurrency(c.code as CurrencyCode)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isDraft
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold ring-2 ring-emerald-500/20'
                            : isLight 
                              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' 
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="text-xl shrink-0">{flag}</span>
                          <div className="truncate">
                            <div className="truncate font-semibold flex items-center gap-1">
                              <span>{c.code}</span>
                              <span className="text-xs opacity-80">({c.symbol})</span>
                              {c.code === 'INR' && (
                                <span className={`text-[9px] px-1 rounded font-normal ${isDraft ? 'bg-amber-400/25 text-amber-200' : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'}`}>
                                  Default
                                </span>
                              )}
                            </div>
                            <div className={`text-[10px] truncate ${isDraft ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {c.name} • {quoteText}
                            </div>
                          </div>
                        </div>
                        {isDraft && <Check className="w-4 h-4 shrink-0 text-white" />}
                      </button>
                    );
                  })}
              </div>

              {/* Save & Cancel Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setIsEditingCurrency(false)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCurrency}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Currency Standard</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Live Currency Cross-Rate Converter / Calculator Bar */}
        <div className={`p-4 rounded-2xl border space-y-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Live Currency Converter &amp; Cross-Rate Checker
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Instant conversion grounded in live market pricing
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Amount to Convert
              </label>
              <input
                type="number"
                min="0"
                value={converterAmount}
                onChange={e => setConverterAmount(Math.max(0, Number(e.target.value) || 0))}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                From Currency
              </label>
              <select
                value={converterSource}
                onChange={e => setConverterSource(e.target.value as CurrencyCode)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                }`}
              >
                {currencyConfigsList.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Converted into Active ({currency})
              </label>
              <div className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${
                isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
              }`}>
                <span>{liveCurrencyConfigs[currency]?.symbol || '$'}</span>
                <span>
                  {(() => {
                    const fromCfg = (liveCurrencyConfigs || CURRENCY_CONFIGS)[converterSource] || CURRENCY_CONFIGS.USD;
                    const toCfg = (liveCurrencyConfigs || CURRENCY_CONFIGS)[currency] || CURRENCY_CONFIGS.USD;
                    const inUSD = converterAmount * (fromCfg.rateToUSD || 1);
                    const inTarget = toCfg.rateToUSD > 0 ? inUSD / toCfg.rateToUSD : inUSD;
                    return inTarget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Cross-Conversion Pills */}
          <div className="pt-2 border-t border-inherit/40 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px] font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
              Live Equivalence ({converterAmount.toLocaleString()} {converterSource}):
            </span>
            {currencyConfigsList
              .filter(c => c.code !== converterSource)
              .slice(0, 5)
              .map(c => {
                const fromCfg = (liveCurrencyConfigs || CURRENCY_CONFIGS)[converterSource] || CURRENCY_CONFIGS.USD;
                const inUSD = converterAmount * (fromCfg.rateToUSD || 1);
                const inTarget = c.rateToUSD > 0 ? inUSD / c.rateToUSD : inUSD;
                return (
                  <span 
                    key={c.code} 
                    className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-inherit/30 shrink-0 font-medium text-slate-700 dark:text-slate-300"
                  >
                    {c.symbol}{inTarget.toLocaleString('en-US', { maximumFractionDigits: 1 })} <span className="opacity-60">{c.code}</span>
                  </span>
                );
              })}
          </div>
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
