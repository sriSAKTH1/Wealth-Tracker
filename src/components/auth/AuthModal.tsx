import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { MoneyTreeBackground } from '../common/MoneyTreeBackground';
import { MoneyTreeAnimation } from '../common/MoneyTreeAnimation';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    signIn, 
    signUp, 
    resetPassword,
    signInWithGoogle,
    signInWithGoogleDemo
  } = useAuth();

  const { theme } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot_password'>(authModalMode);
  const [email, setEmail] = useState('sudharsanm014@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleQuickAdminLogin = async () => {
    setEmail('sudharsanm014@gmail.com');
    setPassword('niceTRY');
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await signIn('sudharsanm014@gmail.com', 'niceTRY');
      if (!res.success) {
        setErrorMessage(res.error || 'Admin login failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        if (
          res.error?.includes('Popup was blocked') || 
          res.error?.includes('closed before completing') || 
          res.error?.includes('cancelled')
        ) {
          const fallback = await signInWithGoogleDemo();
          if (!fallback.success) {
            setErrorMessage(res.error || 'Google sign-in could not be completed.');
          }
        } else {
          setErrorMessage(res.error || 'Google sign-in could not be completed.');
        }
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'login') {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Login failed.');
        }
      } else {
        const res = await signUp(username, email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResetSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your registered email address.');
      return;
    }

    setIsResetSubmitting(true);
    try {
      const res = await resetPassword(cleanEmail);
      if (res.success) {
        setResetSuccessMessage(`Password recovery link sent to ${cleanEmail}. Please check your inbox and spam folder.`);
      } else {
        setErrorMessage(res.error || 'Failed to send recovery email. Please try again.');
      }
    } finally {
      setIsResetSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      {/* Background Money Tree Animation in Empty Space */}
      <MoneyTreeBackground opacity={0.65} />

      <div 
        className={`relative z-10 w-full max-w-md lg:max-w-4xl rounded-3xl border shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200 flex flex-col lg:flex-row my-auto ${
          isLight ? 'bg-white/95 border-slate-200 backdrop-blur-md' : 'bg-slate-900/95 border-slate-800 backdrop-blur-md'
        }`}
      >
        {/* Mobile Showcase Banner (Hand Planting Money Sprout) */}
        <div className="lg:hidden relative w-full h-32 overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <img
            src="/src/assets/images/hand_planting_money_tree_1792250871534.jpg"
            alt="Hand planting money tree"
            className="w-full h-full object-cover object-center filter brightness-95"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 drop-shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Planting Wealth & Compounding
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/40 font-bold backdrop-blur-xs">
              FIX Wealth
            </span>
          </div>
        </div>

        {/* Left Side: Animated Hand Planting Money Tree (Desktop Showcase) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center border-r border-slate-200 dark:border-slate-800 bg-gradient-to-b from-purple-950/40 via-slate-950/60 to-emerald-950/40 p-6">
          <MoneyTreeAnimation variant="split" />
        </div>

        {/* Right Side: Form Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle watermark illustration in form background */}
          <div className="absolute -bottom-12 -right-12 w-64 h-64 opacity-[0.04] dark:opacity-[0.07] pointer-events-none select-none rounded-full overflow-hidden">
            <img
              src="/src/assets/images/hand_planting_money_tree_1792250871534.jpg"
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              {activeTab === 'forgot_password' ? (
                <KeyRound className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeTab === 'forgot_password'
                  ? 'Password Recovery'
                  : activeTab === 'login'
                  ? 'Account Sign In'
                  : 'Create Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {activeTab === 'forgot_password'
                  ? 'Reset your account password via email link'
                  : activeTab === 'login'
                  ? 'Access your private personal wealth tracker'
                  : 'Register your private wealth command center'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        {activeTab === 'forgot_password' ? (
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setResetSuccessMessage(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400">Account Recovery</span>
          </div>
        ) : (
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
                setResetSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
                setResetSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Body */}
        {activeTab === 'forgot_password' ? (
          <form onSubmit={handleForgotPasswordSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {resetSuccessMessage ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Recovery Link Dispatched</span>
                  </div>
                  <p className="leading-relaxed">{resetSuccessMessage}</p>
                </div>

                <button
                  type="button"
                  id="btn-return-signin"
                  onClick={() => {
                    setActiveTab('login');
                    setResetSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2.5">
                  <KeyRound className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                  <p className="leading-relaxed">
                    Forgot your password? Enter your registered email and we will send you a secure link to reset your password.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      id="input-recovery-email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoFocus
                      className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="submit"
                    id="btn-send-recovery"
                    disabled={isResetSubmitting}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isResetSubmitting ? (
                      <span>Sending Recovery Link...</span>
                    ) : (
                      <>
                        <span>Send Recovery Link</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMessage(null);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isLight 
                        ? 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700' 
                        : 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    Cancel and Return to Sign In
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Admin Fill & Login Badge */}
            {activeTab === 'login' && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-blue-500/25 flex items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="text-amber-400">👑</span>
                    <span>Admin:</span>
                    <span className="font-mono text-blue-500 text-[10px]">sudharsanm014@gmail.com</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                    Password: <span className="font-bold text-emerald-500">niceTRY</span>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-admin-auto-login"
                  onClick={handleQuickAdminLogin}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <span>1-Click Login</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Continue to Google Authentication Button */}
            <button
              type="button"
              id="btn-auth-google"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting || isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:border-slate-400'
                  : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-white'
              }`}
            >
              {isGoogleSubmitting ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {isGoogleSubmitting 
                  ? 'Connecting to Google...' 
                  : activeTab === 'login' 
                    ? 'Continue to Google' 
                    : 'Continue to Google (Sign Up)'}
              </span>
            </button>

            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. Alex"
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-auth-password"
                  required
                  autoFocus={activeTab === 'login'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={activeTab === 'login' ? "Enter password (e.g. niceTRY)" : "••••••••"}
                  className={`w-full pl-9 pr-10 py-2 rounded-xl border text-xs ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* 'Forgot Password?' link below the password input in the Sign In modal */}
              {activeTab === 'login' && (
                <div className="flex justify-end pt-1.5">
                  <button
                    type="button"
                    id="btn-forgot-password-link"
                    onClick={() => {
                      setActiveTab('forgot_password');
                      setErrorMessage(null);
                      setResetSuccessMessage(null);
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 hover:underline cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {activeTab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Privacy Guarantee Note */}
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 leading-relaxed">
              <span className="font-bold flex items-center gap-1 mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Zero-Knowledge Local Storage Guarantee:</span>
              </span>
              <span>
                Your personal transactions, salary, and assets remain 100% private in local device storage.
              </span>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
};
