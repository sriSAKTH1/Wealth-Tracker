import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Briefcase, 
  Users, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { AppUserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    signIn, 
    signUp, 
    switchDemoRole,
    currentUser
  } = useAuth();

  const { theme } = useFinance();
  const isLight = theme === 'light' || theme === 'nature' || theme === 'retro';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppUserRole>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

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
        const res = await signUp(username, email, password, selectedRole);
        if (!res.success) {
          setErrorMessage(res.error || 'Registration failed.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeTab === 'login' ? 'Account Sign In' : 'Create Wealth Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Database Authentication &amp; Role Management
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'register' && (
            <>
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
                    placeholder="e.g. Sudharsan"
                    className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('user')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedRole === 'user'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <Users className="w-4 h-4 mb-1" />
                    <div className="text-[11px] font-bold">Client User</div>
                    <div className="text-[9px] opacity-75">Personal Page</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin_advisor')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedRole === 'admin_advisor'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 mb-1" />
                    <div className="text-[11px] font-bold">Advisor</div>
                    <div className="text-[9px] opacity-75">10 Clients</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('main_admin')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedRole === 'main_admin'
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <Shield className="w-4 h-4 mb-1" />
                    <div className="text-[11px] font-bold">Main Admin</div>
                    <div className="text-[9px] opacity-75">Full Panel</div>
                  </button>
                </div>
              </div>
            </>
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
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-9 pr-10 py-2 rounded-xl border text-xs ${
                  isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
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
              Only your login username and email are stored in the database. All your transactions, salary, and assets are kept 100% private in local device storage.
            </span>
          </div>

          {/* Instant 1-Click Role Switcher Demo Buttons */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick 1-Click Role Switcher (For Testing)
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  switchDemoRole('main_admin');
                  closeAuthModal();
                }}
                className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 transition-all cursor-pointer"
              >
                👑 Main Admin
              </button>

              <button
                type="button"
                onClick={() => {
                  switchDemoRole('admin_advisor');
                  closeAuthModal();
                }}
                className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/30 transition-all cursor-pointer"
              >
                💼 Advisor Arun
              </button>

              <button
                type="button"
                onClick={() => {
                  switchDemoRole('user');
                  closeAuthModal();
                }}
                className="py-1.5 px-2 rounded-xl text-[10px] font-bold bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
              >
                👤 Client User
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
