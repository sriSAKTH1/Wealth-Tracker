import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Target, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Check, 
  Sparkles, 
  Sliders, 
  Send, 
  DollarSign, 
  Clock,
  Layers
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface NotificationSettingItem {
  id: string;
  category: 'goals' | 'investments' | 'reviews' | 'reminders' | 'system';
  title: string;
  description: string;
  defaultEnabled: boolean;
}

const NOTIFICATION_SETTINGS: NotificationSettingItem[] = [
  // Goals
  {
    id: 'notif_goal_milestone',
    category: 'goals',
    title: 'Goal Milestones & Completion',
    description: 'Trigger celebration alert when emergency fund or custom goal hits 25%, 50%, 75%, or 100%.',
    defaultEnabled: true
  },
  {
    id: 'notif_goal_offtrack',
    category: 'goals',
    title: 'Target Off-Track Warning',
    description: 'Warn when monthly savings fall behind the pace needed to meet target deadlines.',
    defaultEnabled: true
  },
  {
    id: 'notif_goal_monthly_digest',
    category: 'goals',
    title: 'Monthly Goal Runway Check-in',
    description: 'Recap of runway months gained or lost based on last month spending burn.',
    defaultEnabled: false
  },

  // Investments
  {
    id: 'notif_inv_rebalance',
    category: 'investments',
    title: 'Portfolio Rebalance Triggers',
    description: 'Alert when equity or debt asset class deviates by more than 5% from target allocation.',
    defaultEnabled: true
  },
  {
    id: 'notif_inv_market_moves',
    category: 'investments',
    title: 'Significant Market Movements',
    description: 'Real-time alert when tracked securities or indices experience &gt; 3% daily volatility.',
    defaultEnabled: true
  },
  {
    id: 'notif_inv_dividends',
    category: 'investments',
    title: 'Dividend & Interest Credits',
    description: 'Reminders when fixed income maturity or quarterly equity dividends are scheduled.',
    defaultEnabled: false
  },

  // Reviews & Audits
  {
    id: 'notif_rev_weekly_summary',
    category: 'reviews',
    title: 'Weekly Financial Summary',
    description: 'Digest of total income earned, expenses logged, and net worth progress over 7 days.',
    defaultEnabled: true
  },
  {
    id: 'notif_rev_month_end',
    category: 'reviews',
    title: 'Month-End Balance Sheet Review',
    description: 'Prompt on the 1st of each month to audit and reconcile asset balances.',
    defaultEnabled: true
  },
  {
    id: 'notif_rev_budget_overrun',
    category: 'reviews',
    title: 'Budget Envelope Overrun Warning',
    description: 'Instant notification when an expense category surpasses 85% and 100% of limit.',
    defaultEnabled: true
  },

  // Reminders & Debt
  {
    id: 'notif_rem_emi_due',
    category: 'reminders',
    title: 'Loan EMI & Debt Due Dates',
    description: 'Alert 3 business days before home loan, car loan, or personal debt payments are deducted.',
    defaultEnabled: true
  },
  {
    id: 'notif_rem_credit_card',
    category: 'reminders',
    title: 'Credit Card Statement Settlement',
    description: 'Prevent late finance charges with reminders 48 hours prior to the grace period cutoff.',
    defaultEnabled: true
  },
  {
    id: 'notif_rem_subscriptions',
    category: 'reminders',
    title: 'Recurring Subscription Renewals',
    description: 'Heads-up before annual software, streaming, or membership subscriptions renew.',
    defaultEnabled: false
  },

  // Important System Updates
  {
    id: 'notif_sys_security_logins',
    category: 'system',
    title: 'New Device & Security Sign-ins',
    description: 'Immediate alert if an unrecognized browser session accesses your ledger.',
    defaultEnabled: true
  },
  {
    id: 'notif_sys_backup_reminder',
    category: 'system',
    title: 'Unsaved Backup Warning',
    description: 'Reminder to download offline JSON snapshot if no backup has been generated in 14 days.',
    defaultEnabled: true
  },
  {
    id: 'notif_sys_features',
    category: 'system',
    title: 'Product Upgrades & Algorithm Notices',
    description: 'Updates regarding new financial diagnostic rules and tax calculation updates.',
    defaultEnabled: false
  },
];

export const NotificationsSection: React.FC = () => {
  const { theme } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // Toggle map loaded from localStorage
  const [toggleState, setToggleState] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fix_notifications_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    const defaults: Record<string, boolean> = {};
    NOTIFICATION_SETTINGS.forEach(item => {
      defaults[item.id] = item.defaultEnabled;
    });
    return defaults;
  });

  // Channel preferences
  const [inAppToasts, setInAppToasts] = useState<boolean>(() => {
    return localStorage.getItem('fix_notif_in_app') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fix_notif_sound') === 'true';
  });
  const [browserPush, setBrowserPush] = useState<boolean>(() => {
    return localStorage.getItem('fix_notif_push') === 'true';
  });

  const [testAlertNotice, setTestAlertNotice] = useState<string | null>(null);

  // Global activation listener
  useEffect(() => {
    const handleGlobalActivate = () => {
      handleActivateAll();
    };
    window.addEventListener('fix_activate_all_settings', handleGlobalActivate);
    return () => window.removeEventListener('fix_activate_all_settings', handleGlobalActivate);
  }, []);

  const handleActivateAll = () => {
    const allOn: Record<string, boolean> = {};
    NOTIFICATION_SETTINGS.forEach(item => {
      allOn[item.id] = true;
    });
    setToggleState(allOn);
    localStorage.setItem('fix_notifications_config', JSON.stringify(allOn));
    setInAppToasts(true);
    localStorage.setItem('fix_notif_in_app', 'true');
    setSoundEnabled(true);
    localStorage.setItem('fix_notif_sound', 'true');
    setBrowserPush(true);
    localStorage.setItem('fix_notif_push', 'true');
    playChimeAudio();
    setTestAlertNotice('All 14 notification options and channels are now ACTIVE!');
    setTimeout(() => setTestAlertNotice(null), 4000);
  };

  const toggleSetting = (id: string) => {
    setToggleState(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('fix_notifications_config', JSON.stringify(next));
      return next;
    });
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('fix_notif_sound', String(next));
    if (next) {
      playChimeAudio();
    }
  };

  const handleInAppToggle = () => {
    const next = !inAppToasts;
    setInAppToasts(next);
    localStorage.setItem('fix_notif_in_app', String(next));
  };

  const handleBrowserPushToggle = () => {
    const next = !browserPush;
    setBrowserPush(next);
    localStorage.setItem('fix_notif_push', String(next));
    if (next && 'Notification' in window && Notification.permission !== 'granted') {
      try {
        Notification.requestPermission();
      } catch {}
    }
  };

  // Play pleasant acoustic chime using Web Audio API
  const playChimeAudio = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {}
  };

  const triggerTestNotification = () => {
    if (soundEnabled) {
      playChimeAudio();
    }
    setTestAlertNotice('🔔 Milestone Alert: Your Emergency Runway just achieved 6.2 months of living cushion!');
    setTimeout(() => setTestAlertNotice(null), 5000);
  };

  const renderCategoryList = (
    category: 'goals' | 'investments' | 'reviews' | 'reminders' | 'system',
    icon: React.ReactNode,
    categoryTitle: string,
    badgeColor: string
  ) => {
    const items = NOTIFICATION_SETTINGS.filter(s => s.category === category);
    return (
      <div className={`p-5 rounded-2xl border space-y-3 ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{categoryTitle}</h3>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${badgeColor}`}>
            {items.filter(i => toggleState[i.id]).length} of {items.length} Active
          </span>
        </div>

        <div className="space-y-2.5">
          {items.map(item => {
            const isEnabled = toggleState[item.id] !== false;
            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isEnabled
                    ? isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/90 border-slate-800'
                    : isLight ? 'bg-slate-100/50 border-slate-200/60 opacity-60' : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div className="pr-2 min-w-0">
                  <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {item.description}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleSetting(item.id)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 focus:outline-none ${
                    isEnabled
                      ? 'bg-blue-600'
                      : isLight ? 'bg-slate-300' : 'bg-slate-800'
                  }`}
                  aria-label={`Toggle ${item.title}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section id="section-notifications" className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-500">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Notification & Alert Preferences
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/20">
                Proactive Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control alerts for goals, investments, reviews, reminders, and important updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleActivateAll}
            className="px-3.5 py-1.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm text-xs flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activate All Notifications</span>
          </button>

          <button
            onClick={triggerTestNotification}
            className="px-3.5 py-1.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm text-xs flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Alert</span>
          </button>
        </div>
      </div>

      {/* Test Alert Banner Toast */}
      {testAlertNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{testAlertNotice}</span>
          </div>
          <button onClick={() => setTestAlertNotice(null)} className="hover:opacity-80">
            ✕
          </button>
        </div>
      )}

      {/* Delivery Channels Row */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/80 border-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-500" />
          <span className="font-bold text-slate-800 dark:text-slate-200">Alert Delivery Channels:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* In-app toasts */}
          <button
            onClick={handleInAppToggle}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
              inAppToasts
                ? 'bg-blue-600 text-white border-blue-500'
                : isLight ? 'bg-white border-slate-300 text-slate-600' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>In-App Toasts {inAppToasts ? '✓' : ''}</span>
          </button>

          {/* Audio Chime */}
          <button
            onClick={handleSoundToggle}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
              soundEnabled
                ? 'bg-amber-600 text-white border-amber-500'
                : isLight ? 'bg-white border-slate-300 text-slate-600' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Acoustic Audio Chime {soundEnabled ? '✓' : ''}</span>
          </button>

          {/* Browser Desktop Push */}
          <button
            onClick={handleBrowserPushToggle}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
              browserPush
                ? 'bg-emerald-600 text-white border-emerald-500'
                : isLight ? 'bg-white border-slate-300 text-slate-600' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Desktop Push {browserPush ? '✓' : ''}</span>
          </button>
        </div>
      </div>

      {/* Grid of the 5 requested categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* 1. Goals */}
        {renderCategoryList(
          'goals',
          <Target className="w-4 h-4 text-emerald-500" />,
          'Goals & Emergency Runway Alerts',
          'bg-emerald-500/15 text-emerald-500 border-emerald-500/20'
        )}

        {/* 2. Investments */}
        {renderCategoryList(
          'investments',
          <TrendingUp className="w-4 h-4 text-blue-500" />,
          'Investments & Portfolio Movements',
          'bg-blue-500/15 text-blue-500 border-blue-500/20'
        )}

        {/* 3. Reviews */}
        {renderCategoryList(
          'reviews',
          <Calendar className="w-4 h-4 text-indigo-500" />,
          'Reviews & Scheduled Statements',
          'bg-indigo-500/15 text-indigo-500 border-indigo-500/20'
        )}

        {/* 4. Reminders */}
        {renderCategoryList(
          'reminders',
          <DollarSign className="w-4 h-4 text-amber-500" />,
          'Reminders, Loans & Bill Payments',
          'bg-amber-500/15 text-amber-500 border-amber-500/20'
        )}

        {/* 5. Important System Updates (Spanning 2 columns on larger screens) */}
        <div className="md:col-span-2">
          {renderCategoryList(
            'system',
            <ShieldAlert className="w-4 h-4 text-purple-500" />,
            'Important System & Security Updates',
            'bg-purple-500/15 text-purple-500 border-purple-500/20'
          )}
        </div>
      </div>
    </section>
  );
};
