import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
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
  signUp: (username: string, email: string, pass: string, role?: 'admin' | 'user') => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: (assignedRole?: 'admin' | 'user') => Promise<{ success: boolean; error?: string }>;
  signInWithGoogleDemo: (assignedRole?: 'admin' | 'user') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: 'admin' | 'user') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_USER_KEY = 'app_auth_active_user_v4';

const DEFAULT_ADMIN_PROFILE: AppUserProfile = {
  id: 'user-sudharsan',
  email: 'sudharsanm014@gmail.com',
  name: 'Sudharsan M. (Admin)',
  role: 'admin',
  deviceInfo: 'macOS • Chrome Desktop',
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(() => {
    const cached = localStorage.getItem(LOCAL_AUTH_USER_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.role === 'main_admin') parsed.role = 'admin';
        return parsed;
      } catch {}
    }
    return DEFAULT_ADMIN_PROFILE;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

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

          if (snap.exists()) {
            const data = snap.data();
            const normalizedRole = (data.role === 'main_admin' || fbUser.email === SUPER_ADMIN_EMAIL) ? 'admin' : (data.role || 'user');
            userProfile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              name: data.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              role: normalizedRole,
              deviceInfo: getClientDeviceName(),
              lastLoginAt: now,
              createdAt: data.createdAt || now
            };
            // Update last seen in Firestore
            await updateDoc(userRef, {
              lastLoginAt: now,
              deviceInfo: getClientDeviceName()
            }).catch(() => {});
          } else {
            const role = fbUser.email === SUPER_ADMIN_EMAIL ? 'admin' : 'user';
            userProfile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
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
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const userRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userRef);
      let profile: AppUserProfile;
      const now = new Date().toISOString();

      if (snap.exists()) {
        const data = snap.data();
        const role = (data.role === 'main_admin' || cred.user.email === SUPER_ADMIN_EMAIL) ? 'admin' : (data.role || 'user');
        profile = {
          id: cred.user.uid,
          email: cred.user.email || '',
          name: data.name || cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
          role,
          deviceInfo: getClientDeviceName(),
          lastLoginAt: now,
          createdAt: data.createdAt || now
        };
        await updateDoc(userRef, { lastLoginAt: now, deviceInfo: getClientDeviceName() }).catch(() => {});
      } else {
        const role = cred.user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'user';
        profile = {
          id: cred.user.uid,
          email: cred.user.email || '',
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
          role,
          deviceInfo: getClientDeviceName(),
          lastLoginAt: now,
          createdAt: now
        };
        await setDoc(userRef, profile, { merge: true });
      }

      setCurrentUser(profile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      let message = 'Login failed. Please check credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const signUp = async (
    username: string, 
    email: string, 
    pass: string, 
    assignedRole: 'admin' | 'user' = 'user'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      if (username) {
        await updateProfile(cred.user, { displayName: username.trim() });
      }

      const role = email.trim() === SUPER_ADMIN_EMAIL ? 'admin' : assignedRole;
      const now = new Date().toISOString();
      const profile: AppUserProfile = {
        id: cred.user.uid,
        email: email.trim(),
        name: username.trim() || email.split('@')[0],
        role,
        deviceInfo: getClientDeviceName(),
        lastLoginAt: now,
        createdAt: now
      };

      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, profile);

      setCurrentUser(profile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      let message = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Try signing in.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const signInWithGoogle = async (assignedRole: 'admin' | 'user' = 'user'): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      const fbUser = cred.user;
      const userRef = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(userRef);
      let profile: AppUserProfile;
      const now = new Date().toISOString();

      if (snap.exists()) {
        const data = snap.data();
        const role = (data.role === 'admin' || fbUser.email === SUPER_ADMIN_EMAIL) ? 'admin' : (data.role || assignedRole);
        profile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || data.name || fbUser.email?.split('@')[0] || 'User',
          role,
          deviceInfo: getClientDeviceName(),
          lastLoginAt: now,
          createdAt: data.createdAt || now
        };
        await updateDoc(userRef, { lastLoginAt: now, deviceInfo: getClientDeviceName() }).catch(() => {});
      } else {
        const role = fbUser.email === SUPER_ADMIN_EMAIL ? 'admin' : assignedRole;
        profile = {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          role,
          deviceInfo: getClientDeviceName(),
          lastLoginAt: now,
          createdAt: now
        };
        await setDoc(userRef, profile, { merge: true });
      }

      setCurrentUser(profile);
      localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile));
      closeAuthModal();
      return { success: true };
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      let message = 'Google sign-in could not be completed.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in was closed before completing.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Popup was blocked by your browser. Please allow popups for Google sign in.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        message = 'Another sign-in attempt was in progress.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, error: message };
    }
  };

  const signInWithGoogleDemo = async (assignedRole: 'admin' | 'user' = 'user'): Promise<{ success: boolean; error?: string }> => {
    const isTargetAdmin = assignedRole === 'admin';
    const demoEmail = isTargetAdmin ? SUPER_ADMIN_EMAIL : 'alex.user@gmail.com';
    const demoName = isTargetAdmin ? 'Sudharsan M. (Google)' : 'Alex Rivera (Google)';
    const now = new Date().toISOString();
    const profile: AppUserProfile = {
      id: 'google-demo-' + (isTargetAdmin ? 'sudharsan' : 'user'),
      email: demoEmail,
      name: demoName,
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
    const guestUser: AppUserProfile = {
      id: 'user-guest',
      email: 'guest@wealthtracker.io',
      name: 'Guest User',
      role: 'user',
      deviceInfo: getClientDeviceName(),
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    setCurrentUser(guestUser);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(guestUser));
  };

  // Instant demo switcher between Admin and User
  const switchDemoRole = (targetRole: 'admin' | 'user') => {
    let mockUser: AppUserProfile;
    const now = new Date().toISOString();
    if (targetRole === 'admin') {
      mockUser = {
        id: 'user-sudharsan',
        email: 'sudharsanm014@gmail.com',
        name: 'Sudharsan M. (Admin)',
        role: 'admin',
        deviceInfo: getClientDeviceName(),
        lastLoginAt: now,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
      };
    } else {
      mockUser = {
        id: 'user-client-demo',
        email: 'client@wealthtracker.io',
        name: 'Client User',
        role: 'user',
        deviceInfo: getClientDeviceName(),
        lastLoginAt: now,
        createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
      };
    }

    setCurrentUser(mockUser);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(mockUser));
  };

  const role: 'admin' | 'user' = currentUser?.role === 'admin' ? 'admin' : 'user';
  const isAdmin = role === 'admin';
  const isUser = role === 'user';
  const isAuthenticated = Boolean(currentUser && currentUser.id !== 'user-guest');

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
        signInWithGoogle,
        signInWithGoogleDemo,
        signOut,
        switchDemoRole
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
