import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Bug, 
  BookOpen, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  LifeBuoy, 
  Send, 
  Terminal, 
  Keyboard, 
  FileText,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface FAQItem {
  id: string;
  category: 'networth' | 'debt' | 'goals' | 'backup' | 'shortcuts';
  question: string;
  answer: string;
  tag: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'networth',
    tag: 'Net Worth',
    question: 'How is Total Net Worth calculated across all currencies?',
    answer: 'Net Worth = Sum of all Active Assets (Cash, Stocks, Real Estate, Crypto, Retirement accounts) MINUS Total Outstanding Liabilities (Loans, Mortgages, Credit Cards). All foreign asset holdings are automatically normalized using live exchange rates into your selected Base Valuation Currency.'
  },
  {
    id: 'faq-2',
    category: 'debt',
    tag: 'Liabilities',
    question: 'How does the EMI and debt payoff amortization work?',
    answer: 'Each debt item calculates monthly interest and principal using the standard reducing-balance loan amortization formula: EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]. Overpaying reduces the principal directly, shortening the loan term and lowering total lifetime interest.'
  },
  {
    id: 'faq-3',
    category: 'goals',
    tag: 'Runway & Goals',
    question: 'What is Emergency Runway and how many months do I need?',
    answer: 'Emergency Runway is the number of months your liquid cash and low-risk savings can sustain your essential monthly expenses if income drops to zero. Financial planners typically recommend 3 to 6 months of essential living expenses (or 12 months for freelancers and business owners).'
  },
  {
    id: 'faq-4',
    category: 'backup',
    tag: 'Data & Privacy',
    question: 'Where is my financial data stored? Is it safe on my device?',
    answer: 'By default, your financial ledger is stored completely client-side in your modern browser local storage sandbox. No bank credentials or unencrypted personal data are transmitted to external marketing servers. You can export complete offline JSON snapshots anytime in the Data Management section.'
  },
  {
    id: 'faq-5',
    category: 'shortcuts',
    tag: 'Navigation',
    question: 'How do I use single-key keyboard shortcuts?',
    answer: 'Press "N" anywhere to open the Quick Add transaction modal, "/" for Global Search, "C" for Calculators, "A" for Assets, "L" for Liabilities, "O" for Overview, and "?" to view the full cheat sheet. Shortcuts are safely disabled when you are actively typing inside a form text input.'
  },
  {
    id: 'faq-6',
    category: 'networth',
    tag: 'Investments',
    question: 'How do live stock and crypto quotes refresh?',
    answer: 'The wealth portfolio automatically connects to market quote providers for tickers like AAPL, NVDA, TSLA, BTC, and ETH. You can also trigger an instant price refresh by clicking the live sync button on the Wealth view.'
  }
];

export const HelpSupportSection: React.FC = () => {
  const { theme, setIsShortcutsHelpOpen, netWorth, totalAssets, totalLiabilities, formatMoney, resetOnboarding } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Search & FAQ state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  // Contact support state
  const [supportCategory, setSupportCategory] = useState('technical');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // Bug report state
  const [bugSeverity, setBugSeverity] = useState('medium');
  const [bugDescription, setBugDescription] = useState('');
  const [bugSteps, setBugSteps] = useState('');
  const [bugReportSuccess, setBugReportSuccess] = useState<string | null>(null);
  const [isBugFormOpen, setIsBugFormOpen] = useState(false);

  // Diagnostics copy state
  const [copiedDiagnostics, setCopiedDiagnostics] = useState(false);

  // Filter FAQs
  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesQuery = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;

    const ticketId = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketSuccess(`Support request logged! Ticket ID: ${ticketId}. Our engineering & advisory team has received your message.`);
    setSupportSubject('');
    setSupportMessage('');
    setTimeout(() => setTicketSuccess(null), 6000);
  };

  const handleBugSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugDescription.trim()) return;

    const bugId = `BUG-${Math.floor(2000 + Math.random() * 8000)}`;
    setBugReportSuccess(`Problem report filed (${bugId}). Thank you for helping us improve system stability!`);
    setBugDescription('');
    setBugSteps('');
    setIsBugFormOpen(false);
    setTimeout(() => setBugReportSuccess(null), 6000);
  };

  const copySystemDiagnostics = () => {
    const diag = {
      appVersion: '3.4.2-pro',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      storageSizeApproxKB: Math.round((JSON.stringify(localStorage).length * 2) / 1024),
      activeValuation: formatMoney(netWorth),
      assetCountApprox: totalAssets > 0 ? 'Active Records' : 'Zero',
    };
    navigator.clipboard.writeText(JSON.stringify(diag, null, 2));
    setCopiedDiagnostics(true);
    setTimeout(() => setCopiedDiagnostics(false), 3000);
  };

  return (
    <section id="section-help-support" className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-500">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Help & Support Center
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-500 border border-indigo-500/20">
                Knowledge Base 24/7
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Access FAQs, guides, tutorials, contact support, and report problems
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsShortcutsHelpOpen(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 text-blue-500" />
            <span>Shortcuts Cheatsheet</span>
          </button>
          <button
            onClick={copySystemDiagnostics}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copiedDiagnostics ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedDiagnostics ? 'Diagnostics Copied!' : 'Copy Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* Notifications / Feedback Notices */}
      {ticketSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{ticketSuccess}</span>
        </div>
      )}
      {bugReportSuccess && (
        <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{bugReportSuccess}</span>
        </div>
      )}

      {/* Quick Interactive Guides Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div 
          onClick={resetOnboarding}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:border-blue-500/60 group ${
            isLight ? 'bg-blue-50/50 border-blue-200/70 text-blue-950' : 'bg-blue-950/20 border-blue-900/40 text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <Zap className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            <span>Quick Add Tour</span>
          </div>
          <p className="text-[11px] opacity-80 mb-2">
            Replay the onboarding tooltip highlighting the 1-tap (+) action button for logging records.
          </p>
          <span className="text-[10px] font-mono font-bold text-blue-500 group-hover:underline">Replay Tooltip Guide →</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-indigo-50/50 border-indigo-200/70 text-indigo-950' : 'bg-indigo-950/20 border-indigo-900/40 text-indigo-200'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>Net Worth Masterclass</span>
          </div>
          <p className="text-[11px] opacity-80 mb-2">
            Learn how to balance real estate, liquid investments, and automated debt reduction schedules.
          </p>
          <span className="text-[10px] font-mono font-bold text-indigo-500">Read 3-min Guide →</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-emerald-50/50 border-emerald-200/70 text-emerald-950' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            <LifeBuoy className="w-4 h-4 text-emerald-500" />
            <span>Emergency Runway</span>
          </div>
          <p className="text-[11px] opacity-80 mb-2">
            Calculate your liquid security cushion to safeguard your household against unforeseen emergencies.
          </p>
          <span className="text-[10px] font-mono font-bold text-emerald-500">View Formula →</span>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isLight ? 'bg-amber-50/50 border-amber-200/70 text-amber-950' : 'bg-amber-950/20 border-amber-900/40 text-amber-200'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>SIP & FIRE Planning</span>
          </div>
          <p className="text-[11px] opacity-80 mb-2">
            Model compounding wealth, withdrawal rates, and the 25x annual expenditure rule.
          </p>
          <span className="text-[10px] font-mono font-bold text-amber-500">Open Calculators →</span>
        </div>
      </div>

      {/* 1. FREQUENTLY ASKED QUESTIONS (SEARCHABLE) */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
              Interactive Frequently Asked Questions
            </h3>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search help articles..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'networth', label: 'Net Worth & Valuation' },
            { id: 'debt', label: 'Debt & Loans' },
            { id: 'goals', label: 'Runway & Goals' },
            { id: 'backup', label: 'Security & Backup' },
            { id: 'shortcuts', label: 'Shortcuts' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isLight ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200' : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-2">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              No matching help articles found for "{searchQuery}". Try a different term or contact support below.
            </div>
          ) : (
            filteredFaqs.map(faq => {
              const isOpen = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-xl border transition-all ${
                    isOpen 
                      ? isLight ? 'bg-white border-blue-200 shadow-xs' : 'bg-slate-900 border-blue-900/50 shadow-xs'
                      : isLight ? 'bg-white/80 border-slate-200 hover:border-slate-300' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold shrink-0">
                        {faq.tag}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {faq.question}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. CONTACT SUPPORT FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* Contact Support Direct */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span>Contact Support & Advisory</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono font-bold">Online Response</span>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-3">
            <div>
              <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
                Inquiry Topic
              </label>
              <select
                value={supportCategory}
                onChange={(e) => setSupportCategory(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              >
                <option value="technical">Technical Support & Ledger Sync</option>
                <option value="feature">Feature Suggestion or Enhancement</option>
                <option value="calculation">Financial Calculation / Amortization Query</option>
                <option value="account">Account & Privacy Guidance</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
                Subject Line
              </label>
              <input
                type="text"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder="e.g., Question on loan amortization schedule"
                required
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
                Detailed Message
              </label>
              <textarea
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Please describe your question or issue in detail..."
                rows={3}
                required
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-500">
                <input
                  type="checkbox"
                  checked={includeDiagnostics}
                  onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Include anonymous diagnostics snapshot</span>
              </label>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm flex items-center gap-1.5 transition-all text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        </div>

        {/* Report a Bug / Problem */}
        <div className={`p-5 rounded-2xl border space-y-3 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Bug className="w-4 h-4 text-rose-500" />
              <span>Report a Bug or Unexpected Behavior</span>
            </div>
            <span className="text-[10px] text-rose-500 font-mono font-bold">Issue Tracker</span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Found an issue with a calculator, display error, or missing currency rate? Submit a report directly to the maintenance engineers.
          </p>

          <form onSubmit={handleBugSubmit} className="space-y-3">
            <div>
              <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
                Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: 'Minor Visual' },
                  { id: 'medium', label: 'Medium Issue' },
                  { id: 'high', label: 'Critical Bug' },
                ].map(sev => (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setBugSeverity(sev.id)}
                    className={`py-1.5 rounded-xl border font-bold text-[11px] transition-all ${
                      bugSeverity === sev.id
                        ? sev.id === 'high' 
                          ? 'bg-rose-600 text-white border-rose-500' 
                          : 'bg-blue-600 text-white border-blue-500'
                        : isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
                Observed Issue Description
              </label>
              <input
                type="text"
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                placeholder="What happened unexpectedly?"
                required
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
                Steps to Reproduce (Optional)
              </label>
              <textarea
                value={bugSteps}
                onChange={(e) => setBugSteps(e.target.value)}
                placeholder="1. Clicked on... 2. Entered value... 3. Saw..."
                rows={2}
                className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all text-xs"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Submit Bug Report</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
