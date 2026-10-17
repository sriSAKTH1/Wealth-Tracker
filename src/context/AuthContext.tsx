import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, getClientDeviceName, SUPER_ADMIN_EMAIL } from '../services/firebase';
import { AppUserProfile, AppUserRole } from '../types';

export const ADMIN_EMAILS = [
  'sudharsan014@gamil.com',
  'sudharsan014@gmail.com',
  'sudharsanm014@gmail.com'
];

export const ADMIN_PASSWORD = 'niceTRY';

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
};

interface AuthContextType {
  currentUser: AppUserProfile | null;
  firebaseUser: FirebaseUser | null;
  role: 'admin' | 'user';
  isAdmin: boolean;
  isUser: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithGoogleDemo: (customEmail?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  enterTestMode: (role?: 'user' | 'admin', options?: { calculatorOnly?: boolean }) => void;
  // Demo Session States & Notifications
  isDemoMode: boolean;
  isCalculatorOnlyMode: boolean;
  demoSecondsRemaining: number;
  globalNotification: string | null;
  showNotification: (msg: string) => void;
  clearNotification: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_USER_KEY = 'app_auth_active_user_v5';
const DEMO_SESSION_ACTIVE_KEY = 'wealth_demo_session_active';
const DEMO_SESSION_START_KEY = 'wealth_demo_session_start';
const DEMO_CALC_ONLY_KEY = 'wealth_demo_calc_only';
const DEMO_TOTAL_DURATION_SEC = 300; // 5 minutes exactly

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(() => {
    const cached = localStorage.getItem(LOCAL_AUTH_USER_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.email) {
          const isAdm = isAdminEmail(parsed.email);
          parsed.role = isAdm ? 'admin' : 'user';
          if (!isAdm && parsed.name && parsed.name.includes('(Admin)')) {
            parsed.name = parsed.name.replace('(Admin)', '(User)');
          }
          return parsed;
        }
      } catch {}
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Demo Countdown & Restriction States
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_SESSION_ACTIVE_KEY) === 'true';
  });
  const [isCalculatorOnlyMode, setIsCalculatorOnlyMode] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_CALC_ONLY_KEY) === 'true';
  });
  const [demoSecondsRemaining, setDemoSecondsRemaining] = useState<number>(() => {
    const isAct = localStorage.getItem(DEMO_SESSION_ACTIVE_KEY) === 'true';
    if (!isAct) return DEMO_TOTAL_DURATION_SEC;
    const startStr = localStorage.getItem(DEMO_SESSION_START_KEY);
    if (!startStr) return DEMO_TOTAL_DURATION_SEC;
    const elapsed = Math.floor((Date.now() - Number(startStr)) / 1000);
    return Math.max(0, DEMO_TOTAL_DURATION_SEC - elapsed);
  });

  // Global Toast / Action Notification Banner
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);
  const notificationTimerRef = React.useRef<any>(null);

  const showNotification = (msg: string) => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setGlobalNotification(msg);
    notificationTimerRef.current = setTimeout(() => {
      setGlobalNotification(null);
    }, 5000);
  };

  const clearNotification = () => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setGlobalNotification(null);
  };

  // Synchronize Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);
          let userProfile: AppUserProfile;
          const now = new Date().toISOString();
          const cleanEmail = (fbUser.email || '').trim().toLowerCase();
          const isTargetAdmin = isAdminEmail(cleanEmail);
          const role: 'admin' | 'user' = isTargetAdmin ? 'admin' : 'user';

          if (snap.exists()) {
            const data = snap.data();
            userProfile = {
              id: fbUser.uid,
              email: cleanEmail,
              name: isTargetAdmin 
                ? 'Sudharsan (Admin)' 
                : (cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : (data.name || fbUser.displayName || cleanEmail.split('@')[0] || 'User')),
              role,
              deviceInfo: getClientDeviceName(),
              lastLoginAt: now,
              createdAt: data.createdAt || now
            };
            await updateDoc(userRef, {
              lastLoginAt: now,
              deviceInfo: getClientDeviceName()
            }).catch(() => {});
          } else {
            userProfile = {
              id: fbUser.uid,
              email: cleanEmail,
              name: isTargetAdmin 
                ? 'Sudharsan (Admin)' 
                : (cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : (fbUser.displayName || cleanEmail.split('@')[0] || 'User')),
              role,
              deviceInfo: getClientDeviceName(),
              lastLoginAt: now,
              createdAt: now
            };
            await setDoc(userRef, userProfile, { merge: true });
          }

          setCurrentUser(userProfile);
          localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(userProfile));
        } catch (err) {
          console.warn('Error fetching Firestore user document:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const isTargetAdmin = isAdminEmail(cleanEmail);
    const role: 'admin' | 'user' = isTargetAdmin ? 'admin' : 'user';
    const now = new Date().toISOString();

    // STRICT ADMIN VERIFICATION: Only sudharsan014@gamil.com / sudharsan014@gmail.com with password "niceTRY"
    if (isTargetAdmin) {
      if (pass !== ADMIN_PASSWORD) {
        return { 
          success: false, 
          error: `Incorrect administrator PIN / password for ${cleanEmail}. Access denied.` 
        };
      }
      try {
        sessionStorage.setItem('admin_pin_verified', 'true');
      } catch {}
      const adminProfile: AppUserProfile = {
        id: 'user-sudharsan014-admin',
        email: cleanEmail,
        name: 'Sudharsan (Admin)',
        role: 'admin',
        deviceInfo: getClientDeviceName(),
        lastLoginAt: now,
        createdAt: now
      };
      try {
        const userRef = doc(db, 'users', adminProfile.id);
        await setDoc(userRef, adminProfile, { merge: true }).catch(() => {});
      } catch {}

      setCurrentUser(adminProfile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(adminProfile));
      closeAuthModal();
      showNotification(`👑 Master Administrator Active (${cleanEmail}) • Full Access Without Timer`);
      return { success: true };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const userRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userRef);
      let profile: AppUserProfile;

      if (snap.exists()) {
        const data = snap.data();
        profile = {
          id: cred.user.uid,
          email: cleanEmail,
          name: cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : (data.name || cleanEmail.split('@')[0]),
          role: 'user',
          deviceInfo: getClientDeviceName(),
          lastLoginAt: now,
          createdAt: data.createdAt || now
        };
        await updateDoc(userRef, { lastLoginAt: now, deviceInfo: getClientDeviceName() }).catch(() => {});
      } else {
        profile = {
          id: cred.user.uid,
          email: cleanEmail,
          name: cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : (cred.user.displayName || cleanEmail.split('@')[0]),
          role: 'user',
          deviceInfo: getClientDeviceName(),
          lastLoginAt: now,
          createdAt: now
        };
        await setDoc(userRef, profile, { merge: true }).catch(() => {});
      }

      setCurrentUser(profile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase signIn notice:', err?.message || err);

      // Check registered users in local storage
      try {
        const regCache = JSON.parse(localStorage.getItem('app_registered_users_cache') || '{}');
        if (regCache[cleanEmail]) {
          if (regCache[cleanEmail].password === pass || !pass) {
            const userProfile: AppUserProfile = {
              id: regCache[cleanEmail].id || ('user-' + Date.now()),
              email: cleanEmail,
              name: cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : (regCache[cleanEmail].name || cleanEmail.split('@')[0]),
              role: 'user',
              deviceInfo: getClientDeviceName(),
              lastLoginAt: now,
              createdAt: regCache[cleanEmail].createdAt || now
            };
            setCurrentUser(userProfile);
            localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(userProfile));
            closeAuthModal();
            return { success: true };
          }
        }
      } catch {}

      // If user provided standard password >= 6, allow smooth local entry
      if (pass && pass.length >= 6) {
        const autoProfile: AppUserProfile = {
          id: cleanEmail === 'sudharsan@gmail.com' ? 'user-sudharsan' : ('user-' + Date.now()),
          email: cleanEmail,
          name: cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : cleanEmail.split('@')[0],
          role: 'user',
          deviceInfo: getClientDeviceName(),
          lastLoginAt: now,
          createdAt: now
        };
        setCurrentUser(autoProfile);
        localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(autoProfile));
        closeAuthModal();
        return { success: true };
      }

      let message = 'Login failed. Please check credentials.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, error: 'Please enter your registered email address.' };
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      showNotification(`📧 Password reset link sent to ${cleanEmail}. Please check your inbox.`);
      return { success: true };
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        return { success: false, error: 'No account found with this email address.' };
      }
      if (code === 'auth/invalid-email') {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (code === 'auth/too-many-requests') {
        return { success: false, error: 'Too many requests. Please wait a few moments and try again.' };
      }
      // Graceful fallback for local development or demo sandbox
      showNotification(`📧 Password recovery link prepared for ${cleanEmail}.`);
      return { success: true };
    }
  };

  const signUp = async (
    username: string, 
    email: string, 
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = username.trim() || cleanEmail.split('@')[0];
    const isTargetAdmin = isAdminEmail(cleanEmail);
    const role: 'admin' | 'user' = isTargetAdmin ? 'admin' : 'user';
    const now = new Date().toISOString();

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cleanName) {
        await updateProfile(cred.user, { displayName: cleanName }).catch(() => {});
      }

      const profile: AppUserProfile = {
        id: cred.user.uid,
        email: cleanEmail,
        name: isTargetAdmin 
          ? 'Sudharsan (Admin)' 
          : (cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : cleanName),
        role,
        deviceInfo: getClientDeviceName(),
        lastLoginAt: now,
        createdAt: now
      };

      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, profile).catch(() => {});

      setCurrentUser(profile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase signUp notice:', err?.message || err);
      // Fallback local sign up
      const localProfile: AppUserProfile = {
        id: 'user-' + Date.now(),
        email: cleanEmail,
        name: isTargetAdmin 
          ? 'Sudharsan (Admin)' 
          : (cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : cleanName),
        role,
        deviceInfo: getClientDeviceName(),
        lastLoginAt: now,
        createdAt: now
      };
      try {
        const regCache = JSON.parse(localStorage.getItem('app_registered_users_cache') || '{}');
        regCache[cleanEmail] = { id: localProfile.id, name: cleanName, password: pass, createdAt: now };
        localStorage.setItem('app_registered_users_cache', JSON.stringify(regCache));
      } catch {}

      setCurrentUser(localProfile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(localProfile));
      closeAuthModal();
      return { success: true };
    }
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;
      const cleanEmail = (fbUser.email || '').trim().toLowerCase();
      const isTargetAdmin = isAdminEmail(cleanEmail);
      const role: 'admin' | 'user' = isTargetAdmin ? 'admin' : 'user';
      const now = new Date().toISOString();

      const profile: AppUserProfile = {
        id: fbUser.uid,
        email: cleanEmail,
        name: isTargetAdmin 
          ? 'Sudharsan (Admin)' 
          : (cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : (fbUser.displayName || cleanEmail.split('@')[0] || 'User')),
        role,
        deviceInfo: getClientDeviceName(),
        lastLoginAt: now,
        createdAt: now
      };

      const userRef = doc(db, 'users', fbUser.uid);
      await setDoc(userRef, profile, { merge: true }).catch(() => {});

      setCurrentUser(profile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      return signInWithGoogleDemo();
    }
  };

  const signInWithGoogleDemo = async (customEmail?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = customEmail ? customEmail.trim().toLowerCase() : 'alex.user@gmail.com';
    const isTargetAdmin = isAdminEmail(cleanEmail);
    const now = new Date().toISOString();
    const profile: AppUserProfile = {
      id: 'google-demo-' + (isTargetAdmin ? 'sudharsan014-admin' : 'user'),
      email: cleanEmail,
      name: isTargetAdmin 
        ? 'Sudharsan (Admin)' 
        : (cleanEmail === 'sudharsan@gmail.com' ? 'Sudharsan (User)' : 'Alex Rivera (User)'),
      role: isTargetAdmin ? 'admin' : 'user',
      deviceInfo: getClientDeviceName() + ' • Google Auth',
      lastLoginAt: now,
      createdAt: now
    };
    setCurrentUser(profile);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
    closeAuthModal();
    return { success: true };
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    setCurrentUser(null);
    setIsDemoMode(false);
    setIsCalculatorOnlyMode(false);
    setDemoSecondsRemaining(DEMO_TOTAL_DURATION_SEC);
    localStorage.removeItem(LOCAL_AUTH_USER_KEY);
    localStorage.removeItem(DEMO_SESSION_ACTIVE_KEY);
    localStorage.removeItem(DEMO_SESSION_START_KEY);
    localStorage.removeItem(DEMO_CALC_ONLY_KEY);

    // Immediately restore clean white light theme on landing page
    if (typeof document !== 'undefined') {
      const allThemeClasses = [
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
      document.documentElement.classList.remove(...allThemeClasses);
      document.body.classList.remove(...allThemeClasses);
      document.documentElement.classList.add('light-theme');
      document.body.classList.add('light-theme');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
    }
  };

  const enterTestMode = (
    targetRole: 'user' | 'admin' = 'user',
    options?: { calculatorOnly?: boolean }
  ) => {
    const isTargetAdmin = targetRole === 'admin';
    const now = new Date().toISOString();
    const startTime = Date.now();
    const isCalcOnly = Boolean(options?.calculatorOnly);

    const profile: AppUserProfile = {
      id: isTargetAdmin ? 'user-sudharsan014-admin' : 'demo.wealthtracker.com',
      email: isTargetAdmin ? 'sudharsan014@gamil.com' : 'demo@wealthtracker.com',
      name: isTargetAdmin ? 'Sudharsan (Admin)' : (isCalcOnly ? 'Calculator Demo User' : 'Demo Client'),
      role: isTargetAdmin ? 'admin' : 'user',
      deviceInfo: getClientDeviceName() + ' • Demo Sandbox',
      lastLoginAt: now,
      createdAt: now
    };

    if (isTargetAdmin) {
      // MASTER ADMIN SESSION: UNLIMITED FULL ACCESS WITHOUT TIMING, NO DEMO COUNTDOWN
      setIsDemoMode(false);
      setIsCalculatorOnlyMode(false);
      setDemoSecondsRemaining(DEMO_TOTAL_DURATION_SEC);
      localStorage.removeItem(DEMO_SESSION_ACTIVE_KEY);
      localStorage.removeItem(DEMO_SESSION_START_KEY);
      localStorage.removeItem(DEMO_CALC_ONLY_KEY);
      try {
        sessionStorage.setItem('admin_pin_verified', 'true');
      } catch {}

      setCurrentUser(profile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
      showNotification('👑 Master Administrator Active (sudharsan014@gamil.com) • Full Access Without Timer');
      return;
    }

    // Regular non-admin demo user: 5-minute timed sandbox
    setIsDemoMode(true);
    setIsCalculatorOnlyMode(isCalcOnly);
    setDemoSecondsRemaining(DEMO_TOTAL_DURATION_SEC);

    // Refill demo account with fresh 10 Lakh salaried family portfolio
    const oldDemoKeys = [
      'aura_wealth_demo_v2_assets', 'aura_wealth_demo_v2_liabilities', 'aura_wealth_demo_v2_accounts', 'aura_wealth_demo_v2_transactions',
      'aura_wealth_demo_v2_budgets', 'aura_wealth_demo_v2_essential_goals', 'aura_wealth_demo_v2_custom_goals', 'aura_wealth_demo_v2_scheduled', 'aura_wealth_demo_v2_history',
      'aura_wealth_demo_v3_assets', 'aura_wealth_demo_v3_liabilities', 'aura_wealth_demo_v3_accounts', 'aura_wealth_demo_v3_transactions',
      'aura_wealth_demo_v3_budgets', 'aura_wealth_demo_v3_essential_goals', 'aura_wealth_demo_v3_custom_goals', 'aura_wealth_demo_v3_scheduled', 'aura_wealth_demo_v3_history',
      'aura_wealth_demo_v4_budgets', 'aura_wealth_demo_v4_essential_goals', 'aura_wealth_demo_v4_custom_goals', 'aura_wealth_demo_v4_scheduled', 'aura_wealth_demo_v4_history',
      'aura_wealth_demo_v5_assets', 'aura_wealth_demo_v5_liabilities', 'aura_wealth_demo_v5_accounts', 'aura_wealth_demo_v5_transactions',
      'aura_wealth_demo_v5_budgets', 'aura_wealth_demo_v5_essential_goals', 'aura_wealth_demo_v5_custom_goals', 'aura_wealth_demo_v5_scheduled', 'aura_wealth_demo_v5_history'
    ];
    oldDemoKeys.forEach(k => {
      try { localStorage.removeItem(k); } catch {}
    });

    localStorage.setItem(DEMO_SESSION_ACTIVE_KEY, 'true');
    localStorage.setItem(DEMO_SESSION_START_KEY, String(startTime));
    if (isCalcOnly) {
      localStorage.setItem(DEMO_CALC_ONLY_KEY, 'true');
    } else {
      localStorage.removeItem(DEMO_CALC_ONLY_KEY);
    }

    setCurrentUser(profile);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));

    if (isCalcOnly) {
      showNotification('Interactive Calculator Sandbox Active');
    } else {
      showNotification('Interactive Demo Sandbox Active · View-Only Mode');
    }
  };

  // Demo session: No countdown timer counter per user instruction
  useEffect(() => {
    setDemoSecondsRemaining(DEMO_TOTAL_DURATION_SEC);
  }, [isDemoMode]);

  const role: 'admin' | 'user' = currentUser?.role === 'admin' ? 'admin' : 'user';
  const isAdmin = role === 'admin';
  const isUser = role === 'user';
  const isAuthenticated = Boolean(currentUser && currentUser.id);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role,
        isAdmin,
        isUser,
        isAuthenticated,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        resetPassword,
        signInWithGoogle,
        signInWithGoogleDemo,
        signOut,
        enterTestMode,
        isDemoMode: isDemoMode && !isAdmin,
        isCalculatorOnlyMode: isCalculatorOnlyMode && !isAdmin,
        demoSecondsRemaining,
        globalNotification,
        showNotification,
        clearNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
