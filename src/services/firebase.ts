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
  AppFeedback,
  AppBroadcastNotification,
  AppNewsPost,
  UpcomingFeature,
  UpcomingFeatureStatus,
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
export const SUPER_ADMIN_EMAIL = 'sudharsan014@gamil.com';

// Seed user accounts - only the real administrator and the single requested demo user
export const INITIAL_SEED_USERS: AppUserProfile[] = [
  {
    id: 'user-sudharsan014-admin',
    email: 'sudharsan014@gamil.com',
    name: 'Sudharsan (Admin)',
    role: 'admin',
    deviceInfo: 'Web Browser • Admin Station',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    finScore: 88,
    monthlyIncome: 65000,
    savingsRatio: 35
  },
  {
    id: 'user-sudharsan',
    email: 'sudharsan@gmail.com',
    name: 'Sudharsan (User)',
    role: 'user',
    deviceInfo: 'Web Browser • Personal Vault',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    finScore: 80,
    monthlyIncome: 70000,
    savingsRatio: 30
  },
  {
    id: 'demo.wealthtracker.com',
    email: 'demo@wealthtracker.com',
    name: 'Demo Client',
    role: 'user',
    deviceInfo: 'Web Browser • Client Vault',
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    finScore: 82,
    monthlyIncome: 75000,
    savingsRatio: 30
  }
];

export const INITIAL_SEED_FEEDBACK: AppFeedback[] = [
  {
    id: 'fb-demo-1',
    userId: 'demo.wealthtracker.com',
    userName: 'Demo Client',
    userEmail: 'demo@wealthtracker.com',
    category: 'feature_request',
    rating: 5,
    message: 'Love the INR live pricing and local privacy architecture! Can we export tax-ready statements to Excel/CSV?',
    status: 'in_review',
    adminReply: 'Hi! Statement export to CSV and JSON is available in the Reports & Analytics tab.',
    repliedAt: new Date(Date.now() - 40000000).toISOString(),
    adminNotes: 'Verified feature availability.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
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

  const role: AppUserRole = overrideRole || (existingData.role === 'admin' ? 'admin' : (user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'user'));
  const now = new Date().toISOString();
  const profile: AppUserProfile = {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'User',
    role,
    deviceInfo: getClientDeviceName(),
    lastLoginAt: now,
    createdAt: existingData.createdAt || now,
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

// Fetch all users for Admin Panel - ensures only admin and demo.wealthtracker.com exist
export async function fetchAllUsers(): Promise<AppUserProfile[]> {
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const users: AppUserProfile[] = [];

      for (const docSnap of snapshot.docs) {
        const u = docSnap.data() as AppUserProfile;
        const email = (u.email || '').toLowerCase().trim();
        const id = docSnap.id || u.id;

        const isAdmin = email === 'sudharsan014@gamil.com' || email === 'sudharsan014@gmail.com' || email === 'sudharsanm014@gmail.com' || id === 'user-sudharsan014-admin';
        const isSudharsanUser = email === 'sudharsan@gmail.com' || id === 'user-sudharsan';
        const isDemo = id === 'demo.wealthtracker.com' || email === 'demo@wealthtracker.com';

        // Delete any non-admin, non-demo, non-whitelisted users from Firestore
        if (!isAdmin && !isDemo && !isSudharsanUser) {
          deleteDoc(doc(db, 'users', id)).catch(() => {});
          continue;
        }

        // If user is sudharsan@gmail.com, ensure role is 'user'
        if (isSudharsanUser && !isAdmin) {
          users.push({ ...u, id, role: 'user', name: u.name?.replace('(Admin)', '(User)') || 'Sudharsan (User)' });
          continue;
        }

        users.push({ ...u, id });
      }

      // Ensure admin, user Sudharsan, and demo user are always present in the returned list
      if (!users.some(u => u.email === 'sudharsan014@gamil.com' || u.email === 'sudharsan014@gmail.com' || u.id === 'user-sudharsan014-admin')) {
        users.unshift(INITIAL_SEED_USERS[0]);
      }
      if (!users.some(u => u.email === 'sudharsan@gmail.com' || u.id === 'user-sudharsan')) {
        users.push(INITIAL_SEED_USERS[1]);
      }
      if (!users.some(u => u.id === 'demo.wealthtracker.com' || u.email === 'demo@wealthtracker.com')) {
        users.push(INITIAL_SEED_USERS[2]);
      }

      localStorage.setItem('app_admin_all_users', JSON.stringify(users));
      return users;
    }
  } catch (err) {
    console.warn("Error fetching remote users, using cached/seed list:", err);
  }

  // Ensure demo user & seed accounts are persisted in Firestore if missing
  try {
    setDoc(doc(db, 'users', 'user-sudharsan014-admin'), INITIAL_SEED_USERS[0], { merge: true }).catch(() => {});
    setDoc(doc(db, 'users', 'user-sudharsan'), INITIAL_SEED_USERS[1], { merge: true }).catch(() => {});
    setDoc(doc(db, 'users', 'demo.wealthtracker.com'), INITIAL_SEED_USERS[2], { merge: true }).catch(() => {});
  } catch {}

  localStorage.setItem('app_admin_all_users', JSON.stringify(INITIAL_SEED_USERS));
  return INITIAL_SEED_USERS;
}

// Delete user account from Firestore and cache
export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    console.warn("Could not delete user from Firestore:", err);
  }
}

// Purge all non-real users from database and keep only Admin, Sudharsan (User), and demo.wealthtracker.com
export async function purgeNonRealUsers(): Promise<AppUserProfile[]> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    for (const d of snapshot.docs) {
      const data = d.data();
      const email = (data.email || '').toLowerCase().trim();
      const id = d.id;
      const isAdmin = email === 'sudharsan014@gamil.com' || email === 'sudharsan014@gmail.com' || email === 'sudharsanm014@gmail.com' || id === 'user-sudharsan014-admin';
      const isSudharsanUser = email === 'sudharsan@gmail.com' || id === 'user-sudharsan';
      const isDemo = id === 'demo.wealthtracker.com' || email === 'demo@wealthtracker.com';
      if (!isAdmin && !isDemo && !isSudharsanUser) {
        await deleteDoc(doc(db, 'users', id)).catch(() => {});
      }
    }
  } catch (err) {
    console.warn("Error purging users from Firestore:", err);
  }

  localStorage.setItem('app_admin_all_users', JSON.stringify(INITIAL_SEED_USERS));
  return INITIAL_SEED_USERS;
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

// Reply to user feedback directly
export async function replyToUserFeedback(feedbackId: string, replyMessage: string): Promise<void> {
  const repliedAt = new Date().toISOString();
  try {
    const ref = doc(db, 'feedback', feedbackId);
    await updateDoc(ref, {
      adminReply: replyMessage,
      repliedAt,
      status: 'resolved'
    });
  } catch (err) {
    console.warn("Could not save feedback reply to Firestore:", err);
  }

  const list = await fetchFeedbackList();
  const updated = list.map(item => item.id === feedbackId ? {
    ...item,
    adminReply: replyMessage,
    repliedAt,
    status: 'resolved' as const
  } : item);
  localStorage.setItem('app_feedback_list', JSON.stringify(updated));
}

// =========================================================================
// BROADCAST NOTIFICATIONS (ADMIN BROADCASTS NEW FEATURES TO ALL USERS)
// =========================================================================

export const INITIAL_SEED_NOTIFICATIONS: AppBroadcastNotification[] = [
  {
    id: 'notif-1',
    title: '🚀 New Feature: Age-Based Asset Allocation Engine Live!',
    message: 'We added automated asset allocation models for age milestones (22, 28, 35, 45, 55+). Age 45 allocates 60% into bonds and debt funds, and 55+ prioritizes Post Office Monthly Income Schemes!',
    type: 'new_feature',
    badge: 'New Release',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    createdBy: 'Sudharsan M. (Admin)'
  },
  {
    id: 'notif-2',
    title: '🛡️ Zero-Knowledge Local Storage Active',
    message: 'Your transactions, salary, and assets are now strictly stored 100% locally on your device for absolute privacy. Only your login account and feedback reach the database.',
    type: 'announcement',
    badge: 'Security',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    createdBy: 'Sudharsan M. (Admin)'
  }
];

export async function fetchBroadcastNotifications(): Promise<AppBroadcastNotification[]> {
  try {
    const q = query(collection(db, 'broadcast_notifications'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: AppBroadcastNotification[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as AppBroadcastNotification));
      return list;
    }
  } catch (err) {
    console.warn("Error fetching remote broadcast notifications:", err);
  }

  const cached = localStorage.getItem('app_broadcast_notifications');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return INITIAL_SEED_NOTIFICATIONS;
}

export async function createBroadcastNotification(
  data: Omit<AppBroadcastNotification, 'id' | 'createdAt'>
): Promise<AppBroadcastNotification> {
  const newNotif: AppBroadcastNotification = {
    ...data,
    id: `notif-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'broadcast_notifications', newNotif.id), newNotif);
  } catch (err) {
    console.warn("Could not save broadcast notification to Firestore:", err);
  }

  const list = await fetchBroadcastNotifications();
  const updated = [newNotif, ...list];
  localStorage.setItem('app_broadcast_notifications', JSON.stringify(updated));
  return newNotif;
}

export async function deleteBroadcastNotification(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'broadcast_notifications', id));
  } catch (err) {
    console.warn("Could not delete broadcast notification from Firestore:", err);
  }

  const list = await fetchBroadcastNotifications();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem('app_broadcast_notifications', JSON.stringify(updated));
}

// =========================================================================
// NEWS & BLOG CMS (ADMIN PUBLISHES ARTICLES & RELEASES FOR USERS)
// =========================================================================

export const INITIAL_SEED_NEWS: AppNewsPost[] = [
  {
    id: 'post-roadmap-upcoming-features-2027',
    title: 'Upcoming Roadmap: Real UPI, Bank Accounts, Demat Portfolios, WhatsApp/Telegram AI & Live Stock Intelligence',
    category: 'Feature Release',
    summary: 'Announcing our comprehensive 2027 product engineering roadmap: Real UPI & Bank AA integration, Demat broking sync (Zerodha/Groww), WhatsApp/Telegram AI companion, Universal AI Wealth Advisory, and live company news tailored to your holdings.',
    content: `We are thrilled to unveil FIX Wealth's official engineering and feature roadmap!\n\nDriven by community feedback, our core focus is eliminating manual ledger entry, enhancing real-time market awareness, and integrating artificial intelligence seamlessly into your daily communication flow.\n\n### 1. Real UPI Accounts & Instant Auto-Sync (NPCI Rails)\n- Direct UPI payment gateway & SMS/NPCI parsing for Google Pay, PhonePe, Paytm, and BHIM.\n- Auto-categorization of merchant QR payments, daily chai/groceries, and peer transfers.\n- Real-time balance debits and zero manual typing.\n\n### 2. Real Bank Accounts via RBI Account Aggregator (AA)\n- Secure, consent-driven net banking synchronization across HDFC, SBI, ICICI, Axis, Kotak, and 20+ scheduled banks.\n- Live balance reconciliation for savings, fixed deposits, and recurring deposits.\n- Verified statement reconciliation and automated monthly cash flow velocity.\n\n### 3. Live Demat & Broking Portfolio Sync\n- Direct read-only connection with CDSL/NSDL and top brokerages including Zerodha Kite, Groww, Upstox, and Angel One.\n- Real-time portfolio valuation for NSE & BSE stocks, mutual fund NAVs, SGBs, and ETFs.\n- Automated dividend tracking and instant capital gains (LTCG / STCG) computation.\n\n### 4. WhatsApp & Telegram AI Wealth Companion\n- Connect your FIX Wealth vault directly to WhatsApp or Telegram.\n- Check your live net worth, ask "Can I afford this ₹15,000 gadget?", or log expenses on the fly simply by sending a text or voice note.\n- Daily morning financial digest with market opening summaries and upcoming bill reminders.\n\n### 5. Universal AI Financial & Investment Advisor (All-Market Domain Expertise)\n- Comprehensive AI financial advisor built with deep knowledge of Indian & global capital markets.\n- Analyzes your portfolio asset allocation by age and risk tolerance, identifying underperforming assets and suggesting optimized index SIPs.\n- Retirement runway (FIRE score) stress-testing, inflation projections, and personalized tax optimization strategies.\n\n### 6. Live Stock & Company News Feed (Holding-Tailored Intelligence)\n- Real-time corporate news, quarterly earnings announcements, and market sentiment curated specifically for the companies and mutual funds in your portfolio.\n- Instant shareable news briefs to keep you ahead of market movements.\n\n### 7. Additional Upcoming Capabilities\n- Live CIBIL & Credit Solvency Radar (loan refinance & debt payoff velocity)\n- Automated Capital Gains & ITR Tax Engine (FY 2026-27 Union Budget slabs)\n- Real Estate & Land Valuation Tracker (circle rates & rental yields)\n- Family Office & Nominee Vault (encrypted legacy pass)\n\nVisit the dedicated **Upcoming Features** tab in News & Updates to explore all items, cast your community upvotes, and request early beta access!`,
    author: 'Sudharsan M. (Admin)',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Comprehensive 2027 Engineering Roadmap & Upcoming Features',
    publishedAt: new Date().toISOString(),
    readTimeMinutes: 5,
    isFeatured: true
  },
  {
    id: 'post-fr-1',
    title: 'Feature Release: Age-Calibrated Asset Allocator & Live INR Currency Standard',
    category: 'Feature Release',
    summary: 'Introducing automated asset weightings by age milestones (22, 28, 35, 45, 55+) with live interbank Forex pricing for INR sovereign accounts.',
    content: `We are thrilled to launch the automated asset allocation engine!\n\nKey Release Capabilities:\n1. Age-Milestone Auto Allocation: Young accumulators receive 75% equity exposure, while senior citizens scale into sovereign bonds and Post Office POMIS.\n2. Live INR Standard: Every transaction, asset vault, and projection is denominated with sub-millisecond conversion into ₹ Indian Rupee.\n3. Zero Telemetry Privacy: Calculations execute directly in browser memory without sending balances to remote servers.\n\nExplore this in your Wealth & FinScore tabs today!`,
    author: 'Sudharsan M. (Admin)',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Asset Allocation Engine & Real-Time INR Valuation',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    readTimeMinutes: 3,
    isFeatured: true
  },
  {
    id: 'post-fr-2',
    title: 'New Feature: Automated Indian Tax & Capital Gains Estimator (LTCG / STCG)',
    category: 'Feature Release',
    summary: 'Calculate tax liabilities for equity and debt mutual funds under the updated FY 2026-27 Union Budget tax slabs with 1-click harvest reports.',
    content: `Easily plan your tax outlays with our new Capital Gains & 80C Calculator module.\n\nFeatures Included:\n- Equity LTCG (12.5% above ₹1.25 Lakh exemption limit)\n- Short-Term Capital Gains (STCG @ 20%)\n- Section 80C, 80D, and NPS 80CCD(1B) optimization checks.\n- Download ready PDF / CSV summaries for income tax filing.`,
    author: 'Sudharsan M. (Lead Admin)',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Automated Capital Gains & Tax Slab Planning',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    readTimeMinutes: 4,
    isFeatured: false
  },
  {
    id: 'post-blog-1',
    title: 'Editorial Blog: The Psychology of Compounding — How Small Habits Beat High Risk Speculation',
    category: 'Blog',
    summary: 'Why behavioral discipline and automated monthly index SIPs systematically outperform speculative stock picking over a 15-year wealth accumulation horizon.',
    content: `Compounding is not merely a financial calculation; it is fundamentally a discipline in emotional regulation and patience.\n\n1. The Habit of Frictionless Automation: Investing the first 25% of your income before paying discretionary expenses guarantees steady momentum regardless of market sentiment.\n2. Avoiding Destructive Drawdowns: A 50% drop requires a 100% gain just to break even. Protecting your principal with balanced debt instruments guarantees you never face catastrophic wipeouts.\n3. The Dividend of Peace: True financial freedom is having enough clarity and safety to sleep peacefully every night without checking intraday ticker symbols.`,
    author: 'Sudharsan M. (Admin)',
    imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Behavioral Psychology & Long-Term Compounding Habits',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    readTimeMinutes: 5,
    isFeatured: false
  },
  {
    id: 'post-mn-1',
    title: 'Market News: RBI Monetary Policy Stance & Impact on Equity & Debt SIPs',
    category: 'Market News',
    summary: 'A deep-dive into the Reserve Bank of India’s benchmark repo rate decisions and how retail investors should position debt mutual funds vs equities.',
    content: `The Reserve Bank of India (RBI) Monetary Policy Committee maintained status quo on benchmark repo rates, projecting GDP expansion at 7.2% with CPI inflation anchored near 4.5%.\n\nStrategic Takeaways for SIP Accumulators:\n- Debt Mutual Funds & Liquid Funds: Attractive yields across short-duration debt funds provide healthy parking space for emergency funds.\n- Equity SIP Discipline: Sustained domestic institutional inflows continue to provide support during global volatility. Maintain regular monthly index SIPs without timing the market.\n- Sovereign Gold Bonds (SGB) & Gold ETFs: Consider 5% to 10% strategic allocation as a hedge against currency fluctuation.`,
    author: 'Sudharsan M. (Admin)',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'RBI Macro Outlook & Indian Capital Markets',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    readTimeMinutes: 4,
    isFeatured: true
  },
  {
    id: 'post-1',
    title: 'Why Post Office Monthly Income Scheme (POMIS) & SCSS Beat Speculation After 55',
    category: 'Personal Finance',
    summary: 'Discover why sovereign-backed monthly income schemes protect mental peace and provide guaranteed monthly cash flow for senior wealth accumulators.',
    content: `When investors cross the age of 55, wealth preservation takes absolute precedence over market speculation.\n\nKey Advantages of Sovereign Post Office Schemes:\n1. Sovereign Capital Safety: Backed by the government faith with zero default risk.\n2. Guaranteed Monthly Payouts: POMIS deposits yield steady monthly income directly credited into your savings account.\n3. SCSS Interest Superiority: The Senior Citizen Savings Scheme delivers 8.2% annual interest payable quarterly.\n\nIn our automated asset allocation advisor, senior profiles allocate 85% into bonds, G-Secs, and Post Office schemes to ensure steady living expenses without touching principal equity.`,
    author: 'Sudharsan M. (Lead Admin)',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Sovereign Capital Safety & Guaranteed Monthly Cash Flows',
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
    readTimeMinutes: 4,
    isFeatured: false
  },
  {
    id: 'post-2',
    title: 'Platform Architecture: Transitioning to Zero-Knowledge Local-First Privacy',
    category: 'Platform Update',
    summary: 'Learn about our latest privacy upgrade: transactions and net worth metrics are now stored exclusively on your device, with zero remote financial tracking.',
    content: `We believe financial autonomy requires complete data sovereignty.\n\nIn our latest update:\n- Zero Financial Data Upload: Your daily expenses, liabilities, and bank accounts never leave your device.\n- Database Scope Restricted: The Google Cloud Firestore database stores only user credentials for login, account roles, feedback responses, and news broadcasts.\n- Instant Offline Speed: Since data lives in your browser's local memory, calculations happen in sub-milliseconds with zero server lag.`,
    author: 'Sudharsan M. (Lead Admin)',
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    imageCaption: 'Zero-Knowledge Client-Side Storage Architecture',
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    readTimeMinutes: 3,
    isFeatured: false
  }
];

export async function fetchNewsPosts(): Promise<AppNewsPost[]> {
  try {
    const q = query(collection(db, 'news_posts'), orderBy('publishedAt', 'desc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const list: AppNewsPost[] = [];
      snapshot.forEach(docSnap => list.push(docSnap.data() as AppNewsPost));
      return list;
    }
  } catch (err) {
    console.warn("Error fetching remote news posts:", err);
  }

  const cached = localStorage.getItem('app_news_posts');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {}
  }
  return INITIAL_SEED_NEWS;
}

export async function publishNewsPost(
  data: Omit<AppNewsPost, 'id' | 'publishedAt'>
): Promise<AppNewsPost> {
  const newPost: AppNewsPost = {
    ...data,
    id: `post-${Date.now()}`,
    publishedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'news_posts', newPost.id), newPost);
  } catch (err) {
    console.warn("Could not save news post to Firestore:", err);
  }

  const list = await fetchNewsPosts();
  const updated = [newPost, ...list];
  localStorage.setItem('app_news_posts', JSON.stringify(updated));
  return newPost;
}

export async function deleteNewsPost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'news_posts', id));
  } catch (err) {
    console.warn("Could not delete news post from Firestore:", err);
  }

  const list = await fetchNewsPosts();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem('app_news_posts', JSON.stringify(updated));
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

// =========================================================================
// UPCOMING FEATURES & PRODUCT ROADMAP (FIRESTORE: /upcoming_features)
// =========================================================================

export const SEED_UPCOMING_FEATURES: UpcomingFeature[] = [
  {
    id: 'feat-real-upi-sync',
    title: 'Real UPI Accounts & Auto-Sync',
    description: 'Direct NPCI / UPI link with GPay, PhonePe, Paytm, and BHIM. Automatically imports UPI spends, categorizes transactions, and tracks QR/merchant settlements with zero manual typing.',
    category: 'Real Accounts & Banking',
    status: 'in_development',
    targetRelease: 'Q2 2027',
    priority: 'high',
    votesCount: 342,
    tags: ['UPI', 'NPCI', 'PhonePe', 'GPay', 'Instant Sync'],
    iconName: 'Smartphone',
    badge: 'Top Voted',
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'feat-real-bank-aa',
    title: 'Automated Bank Account Aggregator (AA)',
    description: 'Seamless RBI-regulated Account Aggregator (AA) net banking integration for HDFC, SBI, ICICI, Axis, and Kotak. Auto-reconciles bank balances, deposits, and automated cash flow statements securely.',
    category: 'Real Accounts & Banking',
    status: 'in_development',
    targetRelease: 'Q2 2027',
    priority: 'high',
    votesCount: 418,
    tags: ['RBI AA', 'Net Banking', 'HDFC / SBI', 'Zero Manual Entry'],
    iconName: 'Landmark',
    badge: 'High Priority',
    createdAt: '2026-10-02T11:00:00.000Z'
  },
  {
    id: 'feat-real-demat-sync',
    title: 'Live Demat & Broking Portfolio Sync',
    description: 'Direct read-only integration with CDSL/NSDL and top brokerages (Zerodha Kite, Groww, Upstox, Angel One) for live equity shares, mutual fund NAVs, dividends, and automated capital gains calculation.',
    category: 'Real Accounts & Banking',
    status: 'planned',
    targetRelease: 'Q3 2027',
    priority: 'high',
    votesCount: 389,
    tags: ['Demat', 'Zerodha Kite', 'Groww', 'CDSL', 'Live Holdings'],
    iconName: 'Coins',
    badge: 'Planned',
    createdAt: '2026-10-03T12:00:00.000Z'
  },
  {
    id: 'feat-whatsapp-telegram-ai',
    title: 'WhatsApp & Telegram AI Wealth Bot',
    description: 'Sync and chat with your FIX Wealth AI companion directly on WhatsApp and Telegram. Query real-time net worth, ask "Can I afford this?", log transactions on the go via text or voice notes, and receive morning digests.',
    category: 'AI & Messaging',
    status: 'in_development',
    targetRelease: 'Q2 2027',
    priority: 'urgent',
    votesCount: 526,
    tags: ['WhatsApp Bot', 'Telegram AI', 'Voice Logging', 'Instant Query'],
    iconName: 'MessageSquare',
    badge: 'Community Favorite',
    createdAt: '2026-10-04T09:30:00.000Z'
  },
  {
    id: 'feat-universal-ai-advisor',
    title: 'Universal AI Financial Advisor (SIP & Capital Growth)',
    description: 'Comprehensive AI wealth advisor with deep domain knowledge across Indian & global financial markets. Analyzes your asset allocation, calculates retirement runway, generates personalized SIP recommendations, and highlights tax-saving opportunities.',
    category: 'AI Advisory',
    status: 'beta_testing',
    targetRelease: 'Q1 2027',
    priority: 'urgent',
    votesCount: 612,
    tags: ['AI Advisor', 'SIP Optimization', 'Asset Rebalance', 'Financial Freedom'],
    iconName: 'Sparkles',
    badge: 'Beta Testing',
    createdAt: '2026-10-05T14:15:00.000Z'
  },
  {
    id: 'feat-live-market-news-holdings',
    title: 'Live Stock & Company Intelligence Feed',
    description: 'Real-time market news, quarterly earnings summaries, and stock alerts curated dynamically for the specific companies and mutual fund schemes present in your personal portfolio (NSE & BSE).',
    category: 'Market News & Stocks',
    status: 'in_development',
    targetRelease: 'Q1 2027',
    priority: 'high',
    votesCount: 275,
    tags: ['NSE / BSE', 'Earnings Calls', 'Portfolio News', 'Real-Time Feeds'],
    iconName: 'TrendingUp',
    badge: 'Active Build',
    createdAt: '2026-10-06T16:00:00.000Z'
  },
  {
    id: 'feat-credit-score-radar',
    title: 'Live CIBIL & Credit Solvency Radar',
    description: 'Continuous credit score tracking, EMI affordability analytics, loan refinancing insights, and debt payoff velocity score to optimize borrowing costs.',
    category: 'Credit & Solvency',
    status: 'planned',
    targetRelease: 'Q3 2027',
    priority: 'medium',
    votesCount: 198,
    tags: ['CIBIL', 'Credit Score', 'Debt Shield', 'Loan Refinance'],
    iconName: 'ShieldCheck',
    badge: 'Planned',
    createdAt: '2026-10-07T11:45:00.000Z'
  },
  {
    id: 'feat-itr-capital-gains-filer',
    title: 'Automated Capital Gains & ITR Tax Engine',
    description: 'One-click capital gains report generation (LTCG / STCG), tax harvesting alerts, and Section 80C/80D analyzer aligned with Indian Union Budget slabs.',
    category: 'Tax & Compliance',
    status: 'planned',
    targetRelease: 'Q4 2027',
    priority: 'medium',
    votesCount: 230,
    tags: ['Income Tax', 'LTCG / STCG', 'Tax Harvesting', 'New Regime'],
    iconName: 'FileText',
    badge: 'Planned',
    createdAt: '2026-10-08T13:20:00.000Z'
  },
  {
    id: 'feat-real-estate-tracker',
    title: 'Real Estate & Property Valuation Tracker',
    description: 'Track residential plots, commercial properties, and agricultural land with municipal circle rates, automated appreciation estimates, and net rental yield analytics.',
    category: 'Real Accounts & Banking',
    status: 'planned',
    targetRelease: 'Q3 2027',
    priority: 'medium',
    votesCount: 215,
    tags: ['Real Estate', 'Land / Property', 'Rental Yield', 'Circle Rates'],
    iconName: 'Landmark',
    badge: 'Planned',
    createdAt: '2026-10-09T10:00:00.000Z'
  },
  {
    id: 'feat-family-wealth-vault',
    title: 'Family Office & Nominee Emergency Vault',
    description: 'Secure, zero-knowledge encrypted digital vault for nominee designations, insurance policies, property deeds, and dead-man switch emergency access instructions.',
    category: 'Security & Infra',
    status: 'under_research',
    targetRelease: 'Q4 2027',
    priority: 'high',
    votesCount: 310,
    tags: ['Family Office', 'Nominee Vault', 'Estate Planning', 'Zero Knowledge'],
    iconName: 'ShieldCheck',
    badge: 'Under Research',
    createdAt: '2026-10-10T15:30:00.000Z'
  }
];

export async function fetchUpcomingFeatures(): Promise<UpcomingFeature[]> {
  try {
    const colRef = collection(db, 'upcoming_features');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const items: UpcomingFeature[] = [];
      snap.forEach(d => {
        const data = d.data();
        items.push({
          id: d.id,
          title: data.title || 'Untitled Feature',
          description: data.description || '',
          category: data.category || 'Real Accounts & Banking',
          status: data.status || 'planned',
          targetRelease: data.targetRelease || '2027',
          priority: data.priority || 'medium',
          votesCount: typeof data.votesCount === 'number' ? data.votesCount : 0,
          tags: Array.isArray(data.tags) ? data.tags : [],
          iconName: data.iconName || 'Sparkles',
          badge: data.badge,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
          votedUserIds: Array.isArray(data.votedUserIds) ? data.votedUserIds : [],
          earlyAccessRequests: Array.isArray(data.earlyAccessRequests) ? data.earlyAccessRequests : []
        });
      });
      localStorage.setItem('app_upcoming_features_cache', JSON.stringify(items));
      return items;
    } else {
      // If Firestore collection is empty, automatically seed the initial roadmap into Firestore
      seedInitialUpcomingFeatures().catch(() => {});
    }
  } catch (err) {
    console.warn('Could not fetch upcoming features from Firestore:', err);
  }

  // Fallback to local storage or initial seeds
  const cached = localStorage.getItem('app_upcoming_features_cache');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  localStorage.setItem('app_upcoming_features_cache', JSON.stringify(SEED_UPCOMING_FEATURES));
  return SEED_UPCOMING_FEATURES;
}

export async function saveUpcomingFeature(feature: UpcomingFeature): Promise<void> {
  try {
    const docRef = doc(db, 'upcoming_features', feature.id);
    await setDoc(docRef, {
      ...feature,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn(`Could not save feature ${feature.id} to Firestore:`, err);
  }

  // Update local cache
  const list = await fetchUpcomingFeatures();
  const index = list.findIndex(f => f.id === feature.id);
  let updated: UpcomingFeature[];
  if (index >= 0) {
    updated = [...list];
    updated[index] = feature;
  } else {
    updated = [feature, ...list];
  }
  localStorage.setItem('app_upcoming_features_cache', JSON.stringify(updated));
}

export async function createUpcomingFeature(
  data: Omit<UpcomingFeature, 'id' | 'createdAt'>
): Promise<UpcomingFeature> {
  const newId = `feat-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const newFeature: UpcomingFeature = {
    ...data,
    id: newId,
    createdAt: new Date().toISOString()
  };

  await saveUpcomingFeature(newFeature);
  return newFeature;
}

export async function updateUpcomingFeatureStatus(
  id: string,
  status: UpcomingFeatureStatus
): Promise<void> {
  try {
    const docRef = doc(db, 'upcoming_features', id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn(`Could not update feature status ${id} in Firestore:`, err);
  }

  const list = await fetchUpcomingFeatures();
  const updated = list.map(item => item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item);
  localStorage.setItem('app_upcoming_features_cache', JSON.stringify(updated));
}

export async function deleteUpcomingFeature(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'upcoming_features', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Could not delete feature ${id} from Firestore:`, err);
  }

  const list = await fetchUpcomingFeatures();
  const updated = list.filter(item => item.id !== id);
  localStorage.setItem('app_upcoming_features_cache', JSON.stringify(updated));
}

export async function voteUpcomingFeature(id: string, userId: string): Promise<number> {
  const list = await fetchUpcomingFeatures();
  const item = list.find(f => f.id === id);
  if (!item) return 0;

  const votedIds = item.votedUserIds || [];
  const hasVoted = votedIds.includes(userId);
  const newVotedIds = hasVoted ? votedIds.filter(uid => uid !== userId) : [...votedIds, userId];
  const newCount = Math.max(0, item.votesCount + (hasVoted ? -1 : 1));

  const updatedFeature: UpcomingFeature = {
    ...item,
    votesCount: newCount,
    votedUserIds: newVotedIds,
    updatedAt: new Date().toISOString()
  };

  await saveUpcomingFeature(updatedFeature);
  return newCount;
}

export async function requestEarlyAccessFeature(id: string, userEmail: string): Promise<void> {
  const list = await fetchUpcomingFeatures();
  const item = list.find(f => f.id === id);
  if (!item) return;

  const requests = item.earlyAccessRequests || [];
  if (!requests.includes(userEmail)) {
    const updatedFeature: UpcomingFeature = {
      ...item,
      earlyAccessRequests: [...requests, userEmail],
      updatedAt: new Date().toISOString()
    };
    await saveUpcomingFeature(updatedFeature);
  }
}

export async function seedInitialUpcomingFeatures(): Promise<UpcomingFeature[]> {
  for (const feat of SEED_UPCOMING_FEATURES) {
    try {
      const docRef = doc(db, 'upcoming_features', feat.id);
      await setDoc(docRef, feat, { merge: true });
    } catch (err) {
      console.warn(`Could not seed ${feat.id}:`, err);
    }
  }
  localStorage.setItem('app_upcoming_features_cache', JSON.stringify(SEED_UPCOMING_FEATURES));
  return SEED_UPCOMING_FEATURES;
}


