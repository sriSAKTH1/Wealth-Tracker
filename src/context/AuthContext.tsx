import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, getClientDeviceName, SUPER_ADMIN_EMAIL, INITIAL_SEED_USERS } from '../services/firebase';
import { AppUserProfile, AppUserRole } from '../types';

interface AuthContextType {
  currentUser: AppUserProfile | null;
  firebaseUser: FirebaseUser | null;
  role: AppUserRole;
  isMainAdmin: boolean;
  isAdminAdvisor: boolean;
  isClientUser: boolean;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, email: string, pass: string, role?: AppUserRole) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: AppUserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_AUTH_USER_KEY = 'app_auth_active_user_v3';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUserProfile | null>(() => {
    const cached = localStorage.getItem(LOCAL_AUTH_USER_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    // Default initial profile for immediate smooth experience
    return INITIAL_SEED_USERS[0]; // Sudharsan (main_admin by default for demo)
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Synchronize Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch or create user record in Firestore (/users/{uid})
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);
          let userProfile: AppUserProfile;

          if (snap.exists()) {
            userProfile = snap.data() as AppUserProfile;
          } else {
            const role: AppUserRole = fbUser.email === SUPER_ADMIN_EMAIL ? 'main_admin' : 'user';
            userProfile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              role,
              deviceInfo: getClientDeviceName(),
              lastLoginAt: new Date().toISOString(),
              createdAt: new Date().toISOString()
            };
            // Only user auth identity is stored in Firestore
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

      if (snap.exists()) {
        profile = snap.data() as AppUserProfile;
      } else {
        const role: AppUserRole = cred.user.email === SUPER_ADMIN_EMAIL ? 'main_admin' : 'user';
        profile = {
          id: cred.user.uid,
          email: cred.user.email || '',
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'User',
          role,
          deviceInfo: getClientDeviceName(),
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
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
    assignedRole: AppUserRole = 'user'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      
      // Update display name on auth
      if (username) {
        await updateProfile(cred.user, { displayName: username.trim() });
      }

      const role: AppUserRole = email.trim() === SUPER_ADMIN_EMAIL ? 'main_admin' : assignedRole;
      const profile: AppUserProfile = {
        id: cred.user.uid,
        email: email.trim(),
        name: username.trim() || email.split('@')[0],
        role,
        deviceInfo: getClientDeviceName(),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Only store minimal user account in Firestore
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

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    // Switch to unauthenticated client default
    const guestUser: AppUserProfile = {
      id: 'user-client-guest',
      email: 'client.guest@wealthtracker.io',
      name: 'Client User',
      role: 'user',
      deviceInfo: getClientDeviceName(),
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    setCurrentUser(guestUser);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(guestUser));
  };

  // Fast demo role switch for testing permissions
  const switchDemoRole = (targetRole: AppUserRole) => {
    let mockUser: AppUserProfile;
    if (targetRole === 'main_admin') {
      mockUser = {
        id: 'user-sudharsan',
        email: 'sudharsanm014@gmail.com',
        name: 'Sudharsan M (Main Admin)',
        role: 'main_admin',
        deviceInfo: getClientDeviceName(),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    } else if (targetRole === 'admin_advisor') {
      mockUser = {
        id: 'adv-arun',
        email: 'arun.advisor@wealthtracker.io',
        name: 'Arun Kumar, CFA (Advisor)',
        role: 'admin_advisor',
        deviceInfo: getClientDeviceName(),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    } else {
      mockUser = {
        id: 'user-client-demo',
        email: 'client@wealthtracker.io',
        name: 'Client User',
        role: 'user',
        assignedAdvisorId: 'adv-arun',
        assignedAdvisorName: 'Arun Kumar, CFA',
        deviceInfo: getClientDeviceName(),
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    }

    setCurrentUser(mockUser);
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(mockUser));
  };

  const role: AppUserRole = currentUser?.role || 'user';
  const isMainAdmin = role === 'main_admin';
  const isAdminAdvisor = role === 'admin_advisor';
  const isClientUser = role === 'user';
  const isAuthenticated = Boolean(currentUser && currentUser.id !== 'user-client-guest');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role,
        isMainAdmin,
        isAdminAdvisor,
        isClientUser,
        isAuthenticated,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
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
