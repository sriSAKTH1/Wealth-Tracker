import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  getDocFromServer,
  where
} from 'firebase/firestore';
import { 
  AppUserProfile, 
  AppUserRole, 
  AppAdvisorAssignment, 
  AppFeedback,
  Transaction,
  Asset,
  Liability,
  AccountItem,
  BudgetEnvelope,
  EssentialGoal,
  CustomGoal,
  ScheduledCalendarItem,
  NetWorthSnapshot
} from '../types';

export interface UserFinancialDataPayload {
  assets?: Asset[];
  liabilities?: Liability[];
  accounts?: AccountItem[];
  budgets?: BudgetEnvelope[];
  essentialGoals?: EssentialGoal[];
  customGoals?: CustomGoal[];
  scheduledItems?: ScheduledCalendarItem[];
  netWorthHistory?: NetWorthSnapshot[];
  updatedAt: string;
}

// Load config from provisioned JSON or fallback
const firebaseConfig = {
  projectId: "imagined-hash-fxtlg",
  appId: "1:754487120960:web:8321c3fd6c3cd9afe47ba5",
  apiKey: "AIzaSyBVU_Gzs0PSq8aCucXaSWxqFoPloegpOtk",
  authDomain: "imagined-hash-fxtlg.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-wealthtracker-6f01937e-d30e-4033-8b3e-464e81a3e270",
  storageBucket: "imagined-hash-fxtlg.firebasestorage.app",
  messagingSenderId: "754487120960",
  oAuthClientId: "754487120960-60koa8aslo6raor1nih8udh0mn3c7ans.apps.googleusercontent.com"
};

// Initialize App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot per Firebase skill guidelines
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or initializing.");
    }
  }
}
testFirestoreConnection();

// Device name helper
export function getClientDeviceName(): string {
  if (typeof navigator === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  else if (ua.indexOf('Mac') !== -1) os = 'macOS';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';
  else if (ua.indexOf('Android') !== -1) os = 'Android';
  else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iOS';

  let browser = 'Browser';
  if (ua.indexOf('Edg') !== -1) browser = 'Edge';
  else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';

  return `${os} • ${browser}`;
}

// Default super admin email
export const SUPER_ADMIN_EMAIL = 'sudharsanm014@gmail.com';

// Mock/Initial seed accounts for smooth local demonstration
export const INITIAL_SEED_ADVISORS: AppAdvisorAssignment[] = [
  {
    advisorId: 'adv-arun',
    advisorName: 'Arun Kumar, CFA',
    advisorEmail: 'arun.advisor@wealthtracker.io',
    assignedUserIds: ['user-demo-1', 'user-demo-2', 'user-demo-3'],
    currentClientCount: 3,
    maxCapacity: 10,
    updatedAt: new Date().toISOString()
  },
  {
    advisorId: 'adv-priya',
    advisorName: 'Priya Sharma, CFP',
    advisorEmail: 'priya.advisor@wealthtracker.io',
    assignedUserIds: ['user-demo-4', 'user-demo-5'],
    currentClientCount: 2,
    maxCapacity: 10,
    updatedAt: new Date().toISOString()
  },
  {
    advisorId: 'adv-vikram',
    advisorName: 'Vikram Menon, Wealth Specialist',
    advisorEmail: 'vikram.advisor@wealthtracker.io',
    assignedUserIds: [],
    currentClientCount: 0,
    maxCapacity: 10,
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_SEED_USERS: AppUserProfile[] = [
  {
    id: 'user-sudharsan',
    email: 'sudharsanm014@gmail.com',
    name: 'Sudharsan M',
    role: 'main_admin',
    deviceInfo: 'macOS • Chrome Desktop',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    finScore: 84,
    monthlyIncome: 50000,
    savingsRatio: 34
  },
  {
    id: 'user-demo-1',
    email: 'karthik.r@example.com',
    name: 'Karthik Raja',
    role: 'user',
    assignedAdvisorId: 'adv-arun',
    assignedAdvisorName: 'Arun Kumar, CFA',
    deviceInfo: 'Windows 11 • Edge',
    lastLoginAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    finScore: 78,
    monthlyIncome: 65000,
    savingsRatio: 28
  },
  {
    id: 'user-demo-2',
    email: 'ananya.s@example.com',
    name: 'Ananya Sen',
    role: 'user',
    assignedAdvisorId: 'adv-arun',
    assignedAdvisorName: 'Arun Kumar, CFA',
    deviceInfo: 'iPhone 15 • Mobile Safari',
    lastLoginAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    finScore: 91,
    monthlyIncome: 110000,
    savingsRatio: 42
  },
  {
    id: 'user-demo-3',
    email: 'rohit.v@example.com',
    name: 'Rohit Verma',
    role: 'user',
    assignedAdvisorId: 'adv-arun',
    assignedAdvisorName: 'Arun Kumar, CFA',
    deviceInfo: 'Linux • Firefox',
    lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    finScore: 62,
    monthlyIncome: 45000,
    savingsRatio: 18
  },
  {
    id: 'user-demo-4',
    email: 'meera.p@example.com',
    name: 'Meera Patel',
    role: 'user',
    assignedAdvisorId: 'adv-priya',
    assignedAdvisorName: 'Priya Sharma, CFP',
    deviceInfo: 'macOS • Safari',
    lastLoginAt: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    finScore: 73,
    monthlyIncome: 80000,
    savingsRatio: 25
  },
  {
    id: 'user-demo-5',
    email: 'deepak.n@example.com',
    name: 'Deepak Nair',
    role: 'user',
    assignedAdvisorId: 'adv-priya',
    assignedAdvisorName: 'Priya Sharma, CFP',
    deviceInfo: 'Android • Chrome',
    lastLoginAt: new Date(Date.now() - 28800000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    finScore: 82,
    monthlyIncome: 95000,
    savingsRatio: 36
  }
];

export const INITIAL_SEED_FEEDBACK: AppFeedback[] = [
  {
    id: 'fb-1',
    userId: 'user-demo-2',
    userName: 'Ananya Sen',
    userEmail: 'ananya.s@example.com',
    assignedAdvisorId: 'adv-arun',
    category: 'feature_request',
    rating: 5,
    message: 'Love the new essential vs discretionary tagging on monthly income streams! Could we also get export to PDF reports for advisor meetings?',
    status: 'in_review',
    adminNotes: 'Planned for next milestone release.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'fb-2',
    userId: 'user-demo-1',
    userName: 'Karthik Raja',
    userEmail: 'karthik.r@example.com',
    assignedAdvisorId: 'adv-arun',
    category: 'question',
    rating: 4,
    message: 'How is the debt tenure acceleration calculated when an auto loan finishes early?',
    status: 'new',
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'fb-3',
    userId: 'user-demo-5',
    userName: 'Deepak Nair',
    userEmail: 'deepak.n@example.com',
    assignedAdvisorId: 'adv-priya',
    category: 'praise',
    rating: 5,
    message: 'The FIRE Freedom age projections are super motivating and accurate based on my SIP numbers.',
    status: 'resolved',
    adminNotes: 'Client satisfied with retirement milestone roadmap.',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Helper: Save user profile to Firestore & localStorage
export async function syncUserProfile(user: FirebaseUser, overrideRole?: AppUserRole): Promise<AppUserProfile> {
  const userRef = doc(db, 'users', user.uid);
  let existingData: Partial<AppUserProfile> = {};

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingData = snap.data() as AppUserProfile;
    }
  } catch (err) {
    console.warn("Could not read remote user doc:", err);
  }

  const role: AppUserRole = overrideRole || existingData.role || (user.email === SUPER_ADMIN_EMAIL ? 'main_admin' : 'user');
  const now = new Date().toISOString();
  const profile: AppUserProfile = {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'User',
    role,
    deviceInfo: getClientDeviceName(),
    lastLoginAt: now,
    createdAt: existingData.createdAt || now,
    assignedAdvisorId: existingData.assignedAdvisorId,
    assignedAdvisorName: existingData.assignedAdvisorName,
    finScore: existingData.finScore || 80,
    monthlyIncome: existingData.monthlyIncome || 50000,
    savingsRatio: existingData.savingsRatio || 30
  };

  try {
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.warn("Could not write remote user doc:", err);
  }

  // Also persist in local storage for fast loading and offline continuity
  localStorage.setItem('app_active_user_profile', JSON.stringify(profile));
  return profile;
}

// Fetch all users for Admin Panel
export async function fetchAllUsers(): Promise<AppUserProfile[]> {
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const users: AppUserProfile[] = [];
      snapshot.forEach(docSnap => users.push(docSnap.data() as AppUserProfile));
      return users;
    }
  } catch (err) {
    console.warn("Error fetching remote users, using cached/seed list:", err);
  }

  const cached = localStorage.getItem('app_admin_all_users');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return INITIAL_SEED_USERS;
}

// Fetch all advisor assignments with 1:10 rule
export async function fetchAdvisorAssignments(): Promise<AppAdvisorAssignment[]> {
  try {
    const q = query(collection(db, 'advisor_assignments'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: AppAdvisorAssignment[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as AppAdvisorAssignment));
      return list;
    }
  } catch (err) {
    console.warn("Error fetching remote advisor assignments:", err);
  }

  const cached = localStorage.getItem('app_advisor_assignments');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return INITIAL_SEED_ADVISORS;
}

// Assign a user to an advisor (Enforces MAX 10 CLIENTS PER ADVISOR)
export async function assignUserToAdvisor(
  userId: string, 
  userName: string,
  targetAdvisorId: string, 
  currentAdvisors: AppAdvisorAssignment[],
  currentUsers: AppUserProfile[]
): Promise<{ success: boolean; message: string; updatedAdvisors: AppAdvisorAssignment[]; updatedUsers: AppUserProfile[] }> {
  const targetAdvisor = currentAdvisors.find(a => a.advisorId === targetAdvisorId);
  if (!targetAdvisor) {
    return { success: false, message: 'Advisor not found.', updatedAdvisors: currentAdvisors, updatedUsers: currentUsers };
  }

  // Enforce 1:10 capacity rule
  const isAlreadyAssigned = targetAdvisor.assignedUserIds.includes(userId);
  if (!isAlreadyAssigned && targetAdvisor.assignedUserIds.length >= 10) {
    return { 
      success: false, 
      message: `Cannot assign user. Advisor ${targetAdvisor.advisorName} is at maximum capacity (10/10 clients).`,
      updatedAdvisors: currentAdvisors,
      updatedUsers: currentUsers
    };
  }

  // Update advisors: remove user from any other advisor and add to target
  const updatedAdvisors = currentAdvisors.map(adv => {
    if (adv.advisorId === targetAdvisorId) {
      const userList = adv.assignedUserIds.includes(userId) 
        ? adv.assignedUserIds 
        : [...adv.assignedUserIds, userId];
      return {
        ...adv,
        assignedUserIds: userList,
        currentClientCount: userList.length,
        updatedAt: new Date().toISOString()
      };
    } else {
      const filtered = adv.assignedUserIds.filter(id => id !== userId);
      return {
        ...adv,
        assignedUserIds: filtered,
        currentClientCount: filtered.length,
        updatedAt: new Date().toISOString()
      };
    }
  });

  // Update users list
  const updatedUsers = currentUsers.map(u => {
    if (u.id === userId) {
      return {
        ...u,
        assignedAdvisorId: targetAdvisor.advisorId,
        assignedAdvisorName: targetAdvisor.advisorName
      };
    }
    return u;
  });

  // Persist locally
  localStorage.setItem('app_advisor_assignments', JSON.stringify(updatedAdvisors));
  localStorage.setItem('app_admin_all_users', JSON.stringify(updatedUsers));

  // Sync to Firestore
  try {
    await setDoc(doc(db, 'advisor_assignments', targetAdvisor.advisorId), targetAdvisor, { merge: true });
    await updateDoc(doc(db, 'users', userId), {
      assignedAdvisorId: targetAdvisor.advisorId,
      assignedAdvisorName: targetAdvisor.advisorName
    });
  } catch (err) {
    console.warn("Firestore sync warning on assignment:", err);
  }

  return {
    success: true,
    message: `Assigned ${userName} to ${targetAdvisor.advisorName} (${targetAdvisor.assignedUserIds.length + 1}/10 slots).`,
    updatedAdvisors,
    updatedUsers
  };
}

// Fetch feedback list
export async function fetchFeedbackList(): Promise<AppFeedback[]> {
  try {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: AppFeedback[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as AppFeedback));
      return list;
    }
  } catch (err) {
    console.warn("Error fetching remote feedback:", err);
  }

  const cached = localStorage.getItem('app_feedback_list');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return INITIAL_SEED_FEEDBACK;
}

// Submit new feedback
export async function submitUserFeedback(feedback: Omit<AppFeedback, 'id' | 'createdAt' | 'status'>): Promise<AppFeedback> {
  const newFeedback: AppFeedback = {
    ...feedback,
    id: `fb-${Date.now()}`,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'feedback', newFeedback.id), newFeedback);
  } catch (err) {
    console.warn("Could not save feedback to Firestore:", err);
  }

  // Update cached list
  const existing = await fetchFeedbackList();
  const updated = [newFeedback, ...existing];
  localStorage.setItem('app_feedback_list', JSON.stringify(updated));

  return newFeedback;
}

// Update feedback status
export async function updateFeedbackStatus(feedbackId: string, newStatus: AppFeedback['status'], adminNotes?: string): Promise<void> {
  try {
    const ref = doc(db, 'feedback', feedbackId);
    await updateDoc(ref, {
      status: newStatus,
      ...(adminNotes ? { adminNotes } : {})
    });
  } catch (err) {
    console.warn("Could not update remote feedback:", err);
  }

  const list = await fetchFeedbackList();
  const updated = list.map(item => item.id === feedbackId ? {
    ...item,
    status: newStatus,
    ...(adminNotes !== undefined ? { adminNotes } : {})
  } : item);
  localStorage.setItem('app_feedback_list', JSON.stringify(updated));
}

// =========================================================================
// USER TRANSACTIONS & FINANCIAL PORTFOLIO PERSISTENCE (FIRESTORE)
// =========================================================================

// 1. Transaction persistence in Firestore: /users/{userId}/transactions/{transactionId}
export async function saveFirestoreTransaction(userId: string, tx: Transaction): Promise<void> {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', tx.id);
    await setDoc(txRef, {
      ...tx,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn(`Could not save transaction ${tx.id} to Firestore:`, err);
  }
}

export async function deleteFirestoreTransaction(userId: string, txId: string): Promise<void> {
  try {
    const txRef = doc(db, 'users', userId, 'transactions', txId);
    await deleteDoc(txRef);
  } catch (err) {
    console.warn(`Could not delete transaction ${txId} from Firestore:`, err);
  }
}

export async function fetchFirestoreTransactions(userId: string): Promise<Transaction[]> {
  try {
    const txCol = collection(db, 'users', userId, 'transactions');
    const q = query(txCol, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const result: Transaction[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        result.push({
          id: data.id || docSnap.id,
          description: data.description || data.note || data.category || 'Transaction',
          amount: Number(data.amount) || 0,
          currency: data.currency,
          type: data.type || 'expense',
          category: data.category || 'Other',
          accountId: data.accountId || 'acc-1',
          accountName: data.accountName || 'Primary Account',
          date: data.date || new Date().toISOString().split('T')[0],
          notes: data.notes || data.note || '',
          isRecurring: Boolean(data.isRecurring)
        });
      });
      return result;
    }
  } catch (err) {
    console.warn(`Error fetching user transactions from Firestore:`, err);
  }
  return [];
}

// 2. Financial Portfolio Data persistence in Firestore: /users/{userId}/financial_data/portfolio_summary
export async function saveFirestoreFinancialData(userId: string, data: Partial<UserFinancialDataPayload>): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId, 'financial_data', 'portfolio_summary');
    await setDoc(docRef, {
      ...data,
      userId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn(`Could not save financial data to Firestore:`, err);
  }
}

export async function fetchFirestoreFinancialData(userId: string): Promise<UserFinancialDataPayload | null> {
  try {
    const docRef = doc(db, 'users', userId, 'financial_data', 'portfolio_summary');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserFinancialDataPayload;
    }
  } catch (err) {
    console.warn(`Error fetching financial data from Firestore:`, err);
  }
  return null;
}

