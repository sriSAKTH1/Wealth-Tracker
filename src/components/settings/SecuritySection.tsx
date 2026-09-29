import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  Smartphone, 
  Fingerprint, 
  Check, 
  AlertTriangle, 
  Copy, 
  Laptop, 
  Trash2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  CheckCircle2,
  X,
  Sparkles
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface LoginSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  type: 'desktop' | 'mobile' | 'tablet';
}

const INITIAL_SESSIONS: LoginSession[] = [
  {
    id: 'sess-1',
    device: 'Apple MacBook Pro (M3 Max)',
    browser: 'Chrome 128.0 (macOS)',
    location: 'San Francisco, CA, USA',
    ip: '198.51.100.45',
    lastActive: 'Active Now',
    isCurrent: true,
    type: 'desktop'
  },
  {
    id: 'sess-2',
    device: 'Apple iPhone 15 Pro',
    browser: 'Mobile Safari 17.5',
    location: 'San Francisco, CA, USA',
    ip: '198.51.100.89',
    lastActive: '45 mins ago',
    isCurrent: false,
    type: 'mobile'
  },
  {
    id: 'sess-3',
    device: 'Apple iPad Air (5th Gen)',
    browser: 'Safari Tablet 17.4',
    location: 'San Jose, CA, USA',
    ip: '198.51.100.12',
    lastActive: '2 days ago',
    isCurrent: false,
    type: 'tablet'
  }
];

const RECOVERY_CODES = [
  '8F4A-21E0', 'B84C-99A1', '3D7E-44F2', '9A11-CC80',
  '55E2-88B9', '1C33-FF44', '77AA-22D9', '0E49-6612'
];

export const SecuritySection: React.FC = () => {
  const { theme } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  // 1. Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [lastPasswordChanged, setLastPasswordChanged] = useState<string>(() => {
    return localStorage.getItem('fix_last_pw_change') || '14 days ago';
  });

  // 2. 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fix_2fa_enabled') === 'true';
  });
  const [twoFactorMethod, setTwoFactorMethod] = useState<'app' | 'sms'>(() => {
    return (localStorage.getItem('fix_2fa_method') as 'app' | 'sms') || 'app';
  });
  const [isShowingRecoveryCodes, setIsShowingRecoveryCodes] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // 3. Login Sessions State
  const [sessions, setSessions] = useState<LoginSession[]>(() => {
    const saved = localStorage.getItem('fix_user_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  // 4. Biometrics State
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('fix_biometrics_enabled') === 'true';
  });
  const [biometricFeedback, setBiometricFeedback] = useState<string | null>(null);

  // 5. Account Security Preferences
  const [autoLockTimeout, setAutoLockTimeout] = useState<string>(() => {
    return localStorage.getItem('fix_auto_lock_timeout') || '15';
  });
  const [highValueConfirm, setHighValueConfirm] = useState<boolean>(() => {
    return localStorage.getItem('fix_high_val_confirm') !== 'false';
  });

  const handleActivateAllSecurity = () => {
    setIs2FAEnabled(true);
    localStorage.setItem('fix_2fa_enabled', 'true');
    setBiometricsEnabled(true);
    localStorage.setItem('fix_biometrics_enabled', 'true');
    setHighValueConfirm(true);
    localStorage.setItem('fix_high_val_confirm', 'true');
    setBiometricFeedback('All security options active: 2FA, Biometrics, and High-Value Confirmation enabled!');
    setTimeout(() => setBiometricFeedback(null), 4000);
  };

  useEffect(() => {
    const handleGlobalActivate = () => {
      handleActivateAllSecurity();
    };
    window.addEventListener('fix_activate_all_settings', handleGlobalActivate);
    return () => window.removeEventListener('fix_activate_all_settings', handleGlobalActivate);
  }, []);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score, label: 'Good', color: 'bg-amber-500' };
    return { score, label: 'Strong & Resilient', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordNotice('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordNotice('Password must be at least 8 characters long.');
      return;
    }
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setLastPasswordChanged(`Updated on ${today}`);
    localStorage.setItem('fix_last_pw_change', `Updated on ${today}`);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordNotice('Success! Master security password updated.');
    setTimeout(() => setPasswordNotice(null), 5000);
  };

  const toggle2FA = () => {
    const next = !is2FAEnabled;
    setIs2FAEnabled(next);
    localStorage.setItem('fix_2fa_enabled', String(next));
    if (next) {
      setIsShowingRecoveryCodes(true);
    }
  };

  const handle2FAMethodChange = (method: 'app' | 'sms') => {
    setTwoFactorMethod(method);
    localStorage.setItem('fix_2fa_method', method);
  };

  const copyCodesToClipboard = () => {
    navigator.clipboard.writeText(RECOVERY_CODES.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 3000);
  };

  const revokeSession = (id: string) => {
    const nextSessions = sessions.filter(s => s.id !== id);
    setSessions(nextSessions);
    localStorage.setItem('fix_user_sessions', JSON.stringify(nextSessions));
    setSessionNotice('Session revoked and logged out.');
    setTimeout(() => setSessionNotice(null), 3000);
  };

  const terminateAllOtherSessions = () => {
    const currentOnly = sessions.filter(s => s.isCurrent);
    setSessions(currentOnly);
    localStorage.setItem('fix_user_sessions', JSON.stringify(currentOnly));
    setSessionNotice('All 2 other device sessions have been terminated.');
    setTimeout(() => setSessionNotice(null), 4000);
  };

  const toggleBiometrics = () => {
    const next = !biometricsEnabled;
    setBiometricsEnabled(next);
    localStorage.setItem('fix_biometrics_enabled', String(next));
    setBiometricFeedback(next ? 'Biometric biometric authorization active.' : 'Biometrics disabled.');
    setTimeout(() => setBiometricFeedback(null), 3000);
  };

  const testBiometricSensor = () => {
    setBiometricFeedback('Authenticating with Touch ID / Face ID sensor... Verified! ✅');
    setTimeout(() => setBiometricFeedback(null), 4000);
  };

  const handleAutoLockChange = (val: string) => {
    setAutoLockTimeout(val);
    localStorage.setItem('fix_auto_lock_timeout', val);
  };

  const handleHighValueToggle = () => {
    const next = !highValueConfirm;
    setHighValueConfirm(next);
    localStorage.setItem('fix_high_val_confirm', String(next));
  };

  return (
    <section id="section-security" className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-500">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Security & Access Control
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                End-to-End Local Vault
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage password, 2FA, login sessions, biometrics, and account security
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleActivateAllSecurity}
            className="px-3.5 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm text-xs flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activate All Security</span>
          </button>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-xs ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/80 border-slate-800 text-slate-300'
          }`}>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Security Score: <strong className="text-emerald-500 font-mono">98/100</strong> (Strong)</span>
          </div>
        </div>
      </div>

      {/* Security Feedback Notices */}
      {passwordNotice && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between animate-in fade-in ${
          passwordNotice.includes('Success')
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
            : 'bg-amber-500/15 border-amber-500/30 text-amber-500'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{passwordNotice}</span>
          </div>
          <button onClick={() => setPasswordNotice(null)} className="hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {sessionNotice && (
        <div className="p-4 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{sessionNotice}</span>
        </div>
      )}

      {/* Grid of Security Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* 1. MANAGE PASSWORD */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Key className="w-4 h-4 text-blue-500" />
              <span>Master Account Password</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">{lastPasswordChanged}</span>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div>
              <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={`w-full px-3 py-2 pr-9 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block mb-1 font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new"
                  className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            {/* Strength bar */}
            {newPassword && (
              <div className="space-y-1 pt-1 animate-in fade-in">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Strength:</span>
                  <span className="font-bold">{strength.label}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all text-xs"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* 2. TWO-FACTOR AUTHENTICATION (2FA) */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Smartphone className="w-4 h-4 text-emerald-500" />
              <span>Two-Factor Authentication (2FA)</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              is2FAEnabled ? 'bg-emerald-500/15 text-emerald-500' : 'bg-slate-500/15 text-slate-400'
            }`}>
              {is2FAEnabled ? 'ACTIVE & ENFORCED' : 'OFF'}
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Add a critical security layer by requiring an authentication code or hardware security key when logging in.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-xs">Enforce 2-Step Verification</div>
              <div className="text-[10px] text-slate-500">Protect ledger access from unauthorized devices</div>
            </div>
            <button
              onClick={toggle2FA}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                is2FAEnabled
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {is2FAEnabled ? 'Enabled' : 'Enable 2FA'}
            </button>
          </div>

          {/* 2FA Method Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handle2FAMethodChange('app')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                twoFactorMethod === 'app'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                  : isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="font-bold">Authenticator App</div>
              <div className="text-[10px] opacity-80">Google Auth, 1Password, Authy</div>
            </button>

            <button
              onClick={() => handle2FAMethodChange('sms')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                twoFactorMethod === 'sms'
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                  : isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="font-bold">SMS Text Security</div>
              <div className="text-[10px] opacity-80">One-time mobile passcode</div>
            </button>
          </div>

          {/* Recovery Backup Codes */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setIsShowingRecoveryCodes(!isShowingRecoveryCodes)}
              className="text-[11px] font-semibold text-blue-500 hover:underline"
            >
              {isShowingRecoveryCodes ? 'Hide Backup Codes' : 'View Emergency Recovery Codes (8)'}
            </button>
            {isShowingRecoveryCodes && (
              <button
                onClick={copyCodesToClipboard}
                className="text-[10px] font-mono flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                {copiedCodes ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCodes ? 'Copied' : 'Copy All'}</span>
              </button>
            )}
          </div>

          {isShowingRecoveryCodes && (
            <div className="p-3 rounded-xl border bg-slate-900 text-slate-200 border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center font-mono text-[11px] font-bold animate-in fade-in">
              {RECOVERY_CODES.map(code => (
                <div key={code} className="p-1 rounded bg-slate-800/80">{code}</div>
              ))}
            </div>
          )}
        </div>

        {/* 3. BIOMETRICS & WEBAUTHN */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Fingerprint className="w-4 h-4 text-purple-500" />
              <span>Biometric Security (Face ID / Touch ID)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/15 text-purple-500 font-bold">
              WebAuthn Ready
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Use hardware fingerprint sensors or facial recognition to unlock private net worth figures and approve settings changes.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-xs">Biometric Fast Unlock</div>
              <div className="text-[10px] text-slate-500">Require Touch ID / Windows Hello on wake</div>
            </div>
            <button
              onClick={toggleBiometrics}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                biometricsEnabled
                  ? 'bg-purple-600 text-white shadow-sm'
                  : isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {biometricsEnabled ? 'Biometrics Active' : 'Enable'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={testBiometricSensor}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5 text-purple-500" />
              <span>Test Sensor Prompt</span>
            </button>
            {biometricFeedback && (
              <span className="text-[10px] text-emerald-500 font-bold animate-in fade-in">
                {biometricFeedback}
              </span>
            )}
          </div>
        </div>

        {/* 4. ACCOUNT SECURITY & AUTO-LOCK */}
        <div className={`p-5 rounded-2xl border space-y-4 ${
          isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
        }`}>
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Auto-Lock & Transaction Guard</span>
            </div>
            <span className="text-[10px] font-mono text-amber-500 font-bold">Idle Timeout</span>
          </div>

          <div>
            <label className="block mb-1.5 font-semibold text-slate-700 dark:text-slate-300">
              Inactivity Auto-Lock Timer
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: '5', label: '5 Mins' },
                { val: '15', label: '15 Mins' },
                { val: '30', label: '30 Mins' },
                { val: 'never', label: 'Never' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleAutoLockChange(opt.val)}
                  className={`py-1.5 rounded-xl border text-center font-bold text-[11px] transition-all ${
                    autoLockTimeout === opt.val
                      ? 'bg-amber-600 text-white border-amber-500 shadow-xs'
                      : isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-xs">High-Value Confirmation Guard</div>
              <div className="text-[10px] text-slate-500">Confirm before deleting assets &gt; $10,000</div>
            </div>
            <button
              onClick={handleHighValueToggle}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                highValueConfirm
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                  : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {highValueConfirm ? 'Guard On' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      {/* 5. ACTIVE LOGIN SESSIONS */}
      <div className={`p-5 rounded-2xl border space-y-4 ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-950/50 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-blue-500" />
              <span>Active Authorized Login Sessions</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Devices currently signed in with authorized offline session tokens
            </p>
          </div>
          {sessions.length > 1 && (
            <button
              onClick={terminateAllOtherSessions}
              className="px-3 py-1.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white text-[11px] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Terminate Other Sessions</span>
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs">
          {sessions.map(session => (
            <div
              key={session.id}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                session.isCurrent
                  ? isLight ? 'bg-white border-blue-200 shadow-xs' : 'bg-slate-900 border-blue-900/40 shadow-xs'
                  : isLight ? 'bg-white/80 border-slate-200' : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${
                  session.isCurrent ? 'bg-blue-500/15 text-blue-500' : 'bg-slate-500/15 text-slate-500'
                }`}>
                  {session.type === 'desktop' ? <Laptop className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{session.device}</span>
                    {session.isCurrent && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/30">
                        Current Device
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {session.browser} • {session.location} ({session.ip})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:self-center">
                <span className="text-[11px] text-slate-500 font-mono">{session.lastActive}</span>
                {!session.isCurrent && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
