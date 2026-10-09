# FIX Wealth Tracker — Developer Understanding & Architecture Document

Welcome to the **FIX Wealth Tracker** technical architecture and developer manual. This document provides an end-to-end, engineering-level explanation of the application's vision, system design, data flow, mathematics engines, database persistence, technology stack, and component hierarchy.

---

## 1. Executive Summary & Product Vision

### 1.1 What We Are Doing on This Website
**FIX Wealth Tracker** is an enterprise-grade, privacy-first personal wealth and financial command center built specifically for high-net-worth individuals, young professionals, and families. 

Traditional finance apps often sell user data to credit bureaus, brokers, or lenders. In contrast, **FIX Wealth operates on a strict Zero-Knowledge, Local-First philosophy**:
- **0% Tracking & 0% Data Sold**: The user's financial assets, net worth, liabilities, and transactions are stored directly on the user's browser device.
- **₹-Native & Global-Ready**: Built natively with Indian numbering standards (Lakhs and Crores, ₹ formatting, AMFI mutual fund database), while providing dynamic real-time multi-currency conversions into USD ($), EUR (€), and GBP (£).
- **Comprehensive Wealth Spectrum**: Covers liquid cash, bank accounts, stocks, mutual funds, EPF/PPF, NPS, real estate, gold/silver, cryptocurrencies, along with liabilities (home loans, car loans, credit cards, personal loans).
- **Mathematical Intelligence**: Real-time XIRR (internal rate of return), CAGR, debt-snowball/avalanche amortization, F.I.R.E. (Financial Independence, Retire Early) timeline projections, and an algorithmic 100-point Financial Health Score (FinScore).

---

## 2. High-Level System Architecture & Design

### 2.1 Architecture Diagram

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT BROWSER                                       |
|                                                                                         |
|  +-------------------+  +------------------------------------------------------------+  |
|  |     Index.html    |  |                        React 19 SPA                        |  |
|  | (Theme Bootloader)|  |                                                            |  |
|  +-------------------+  |  +---------------------+      +--------------------------+  |  |
|                         |  |    AuthContext      |      |      FinanceContext      |  |  |
|                         |  | (Roles, Perms, Demo)|      | (Net Worth, Assets, Debt)|  |  |
|                         |  +----------+----------+      +------------+-------------+  |  |
|                         |             |                              |                |  |
|                         |             v                              v                |  |
|                         |   +-------------------+          +--------------------+     |  |
|                         |   | Local Storage /   |          |  Local-First DB    |     |  |
|                         |   | Firebase Auth     |          | (Encrypted Cache)  |     |  |
|                         |   +-------------------+          +--------------------+     |  |
|                         |             |                              |                |  |
|                         |             +-------------+  +-------------+                |  |
|                         +---------------------------|--|------------------------------+  |
+-----------------------------------------------------|--|---------------------------------+
                                                      |  |
                                             REST API |  | Real-time Quotes
                                                      v  v
+-----------------------------------------------------------------------------------------+
|                                  EXPRESS BACKEND SERVER                                 |
|                                        (server.ts)                                      |
|                                                                                         |
|  +--------------------+     +-----------------------+     +--------------------------+  |
|  | AMFI Mutual Fund   |     | Yahoo Finance Quote   |     | Live Forex Rate Engine   |  |
|  | NAV Parser Cache   |     | In-Memory Cache (30s) |     | (USD/INR, EUR/INR, etc.) |  |
|  | (17,000+ schemes)  |     |                       |     |                          |  |
|  +---------+----------+     +-----------+-----------+     +------------+-------------+  |
+------------|----------------------------|------------------------------|----------------+
             |                            |                              |
             v                            v                              v
   Official AMFI India            Yahoo Finance API              Currency Exchange API
     (NAVAll.txt daily)           (Live Stock Tickers)            (Forex Feeds)
```

### 2.2 Client-Server Separation of Concerns
1. **Frontend (Vite + React 19 + TypeScript)**:
   - Operates as a Single Page Application (SPA).
   - Responsible for rendering interactive views, financial charts, modals, and managing responsive layouts for both mobile devices and wide desktop displays.
   - Calculates all financial formulas locally on the client's device to preserve zero-latency performance and data privacy.

2. **Backend (Node.js + Express + TypeScript)**:
   - Acts as a server-side API proxy to bypass browser Cross-Origin Resource Sharing (CORS) restrictions.
   - Downloads, parses, and in-memory caches the official Indian Mutual Fund NAV database (~17,000 funds) directly from the Association of Mutual Funds in India (AMFI).
   - Proxies real-time stock ticker quotes from Yahoo Finance with an in-memory 30-second TTL cache to prevent upstream rate limiting.
   - Serves the compiled production frontend static assets (`dist/`).

3. **Database & Persistence**:
   - **Local-First Client Storage**: Complete portfolio states (assets, liabilities, budgets, transactions, custom goals) are stored within `localStorage` under isolated structured keys.
   - **Firebase Firestore**: Used for platform administrative records, feedback submission tickets, broadcast announcements, and authentication state when cloud sync is requested.

---

## 3. Technology Stack & Frameworks

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Language** | TypeScript | ~5.8 | Type safety across entire data structures, calculations, and components |
| **Frontend Framework** | React | 19.0.1 | Modern declarative UI, functional components, hooks, concurrent rendering |
| **Build Tool & Bundler** | Vite | 6.2.3 | Lightning-fast HMR in dev, optimized Rollup bundling in production |
| **Backend Server** | Express | 4.21.2 | Lightweight Node.js server for API proxying and static asset delivery |
| **Server Bundler** | esbuild | 0.25.0 | High-performance bundling of `server.ts` into single production file `dist/server.cjs` |
| **Styling & Design** | Tailwind CSS | 4.1.14 | Utility-first styling, CSS custom properties, responsive design tokens |
| **Icons** | Lucide React | 0.546.0 | Cohesive, accessible SVG outline icon library |
| **Data Visualization** | Recharts | 3.10.1 | Responsive SVG charts (AreaChart, BarChart, PieChart, ComposedChart) |
| **Animations** | Motion | 12.23.24 | Smooth transitions, physics-based modal appearances, micro-interactions |
| **PDF Generation** | jsPDF + AutoTable | 4.2.1 / 5.0.8 | Client-side export of formatted multi-page balance sheet statements |
| **Confetti & Delight** | Canvas-Confetti | 1.9.4 | Visual milestone celebration upon reaching financial goals |
| **Cloud Services** | Firebase Firestore & Auth | 12.19.0 | Scalable NoSQL cloud database and user access management |

---

## 4. State Management & Data Flow Architecture

The application adopts a modular React Context architecture split into two main orchestrators:

### 4.1 `FinanceContext` (`src/context/FinanceContext.tsx`)
The heartbeat of the application's data layer. It manages:
- **Assets (`Asset[]`)**: Cash, Fixed Deposits, Stocks, Mutual Funds, Real Estate, Gold, Crypto, EPF, PPF, NPS.
- **Liabilities (`Liability[]`)**: Home loans, Car loans, Student loans, Credit Card balances, Personal loans, informal debts.
- **Bank Accounts (`Account[]`)**: Checking, Savings, Demat, and digital wallet balances.
- **Transactions (`Transaction[]`)**: Inflows, Outflows, Investments, EMI transfers with date tags and categories.
- **Budgets (`Budget[]`)**: Monthly category thresholds (Housing, Food, Healthcare, Utilities, Discretionary).
- **Goals (`EssentialGoal[]` & `CustomGoal[]`)**: Emergency fund, debt-free target, house purchase, child education, luxury purchases.
- **Historical Net Worth (`NetWorthHistoryPoint[]`)**: 12-month trailing snapshots for trend graphs.
- **Display Configurations**: Current theme mode, accent color, selected currency, sidebar toggle state, keyboard shortcuts toggle, and privacy masking toggle.

#### Automatic Local-First Persistence:
```typescript
// Pattern: Whenever domain state updates, an effect synchronizes to isolated keys
useEffect(() => {
  localStorage.setItem(`${LOCAL_STORAGE_KEY}_assets`, JSON.stringify(assets));
}, [assets]);
```

### 4.2 `AuthContext` (`src/context/AuthContext.tsx`)
Manages authentication status, user identity, and privilege levels:
- **`user`**: The active authenticated user profile (ID, name, email, role, avatar).
- **`isAdmin`**: Boolean flag verifying whether the current user has administrative permissions (`role === 'admin'`).
- **`isTestMode`**: Boolean flag indicating whether the session is operating in 1-Click Interactive Demo mode.
- **`openAuthModal(mode)`**: Triggers the login, signup, or switch-user modal from anywhere in the component tree.
- **`enterTestMode(role)`**: Instant bypass allowing prospective users or evaluators to test the dashboard with rich dummy data without creating an account.

---

## 5. Security & Authentication Architecture

### 5.1 Dual-Engine Authentication Model
1. **Firebase Authentication**:
   - Handles verified email/password accounts and Google OAuth credentials.
   - Synchronizes user profiles with Firestore rules enforcing document read/write safety.
2. **Local-First Fallback Engine**:
   - If the network is offline or Firebase is unreachable, the application falls back to local storage authentication (`app_registered_users_cache`).
   - Enables full offline functionality and private local testing without a mandatory internet connection.

### 5.2 Role-Based Access Control (RBAC)
- **`user`**: Full access to all personal finance views, calculators, balance sheets, exports, and goal setting. Cannot view other users' data.
- **`admin`**: Access to personal finances plus the **Admin Control Panel** (`AdminPanelView.tsx`), which provides platform diagnostics, user feedback reviews, and global broadcast announcement controls.

### 5.3 Firestore Security Rules (`firestore.rules`)
```text
- /users/{userId}: Only readable and writable by request.auth.uid == userId
- /financial_data/{docId}: Strictly locked to the owning user
- /feedback/{feedbackId}: Any authenticated user can create; only admins can list and delete
- /broadcasts/{broadcastId}: Publicly readable; only admins can write
```

---

## 6. Financial Mathematics & Calculation Engines

### 6.1 Net Worth Calculation Formula
$$\text{Net Worth} = \sum (\text{Assets}) - \sum (\text{Liabilities})$$
- Calculated dynamically on every render from live arrays.
- Filterable by asset class: Liquid vs Non-Liquid, Equity vs Debt vs Real Estate.

### 6.2 Internal Rate of Return (XIRR) Engine (`src/utils/xirr.ts`)
XIRR calculates the annualized return on non-periodic, fluctuating cash flows (such as irregular SIP contributions or periodic partial withdrawals).
- Uses the **Newton-Raphson numerical iterative method**:
  $$f(r) = \sum_{i=1}^{n} \frac{C_i}{(1 + r)^{\frac{d_i - d_0}{365}}} = 0$$
- Where $C_i$ is the cash flow at date $d_i$, and $r$ is the calculated discount rate.
- Includes step limits (max 100 iterations), tolerance epsilon ($10^{-7}$), and fallback checks to guarantee no infinite loops or freezing.

### 6.3 Financial Independence (F.I.R.E.) Engine (`src/services/fireCalculatorEngine.ts`)
Projects how many years until the user achieves financial freedom based on current net worth, savings rate, annual expenses, and expected investment returns.
- **Standard FIRE**: $\text{Target Corpus} = \text{Annual Expenses} \times 25$ (Based on the 4% Safe Withdrawal Rate).
- **Fat FIRE**: $\text{Target Corpus} = \text{Annual Expenses} \times 33$ (Conservative 3% Safe Withdrawal Rate for elevated lifestyles).
- **Lean FIRE**: $\text{Target Corpus} = \text{Essential Baseline Expenses} \times 20$ (Lean survival corpus).
- **Coast FIRE**: Projects when existing compounding assets will grow to cover retirement without needing additional contributions.

### 6.4 The 100-Point FinScore Wellness Engine (`src/services/finScoreEngine.ts`)
A holistic diagnostic metric that rates financial health from 0 to 100 across 4 core pillars:

1. **Emergency Runway & Liquidity (25 Points)**:
   - Evaluates liquid cash against monthly burn.
   - Full points awarded for $\ge 6\text{ months}$ of liquid living expenses.
2. **Debt Burden & Solvency (25 Points)**:
   - Measures Debt-to-Asset ratio and EMI-to-Income ratio.
   - Zero unsecured debt + total EMIs $< 30\%$ of income receives top score.
3. **Savings & Investment Momentum (25 Points)**:
   - Calculates monthly savings rate ($\frac{\text{Income} - \text{Expenses}}{\text{Income}}$).
   - Savings rate $\ge 35\%$ receives maximum score.
4. **Diversification & Protection Cushion (25 Points)**:
   - Measures portfolio spread (avoids $> 50\%$ concentration in a single asset) plus adequate health and term life insurance buffers.

---

## 7. Real-Time Market Data & Proxy Services

### 7.1 AMFI Indian Mutual Fund Engine (`server.ts`)
- **Source**: Association of Mutual Funds in India (`https://www.amfiindia.com/spages/NAVAll.txt`).
- **Mechanism**:
  - The Express backend downloads the raw semicolon-delimited daily NAV database containing over 17,000 schemes.
  - Parses scheme codes, ISINs, fund house names, scheme titles, and Net Asset Values (NAVs).
  - Keeps the parsed database in a memory Map (`amfiCache`) with a 30-minute Time-To-Live (TTL).
  - Client queries `/api/market/mutual-fund?query=HDFC+Top+100` are resolved in $< 5\text{ms}$ directly from server RAM.

### 7.2 Stock Quote & Forex Proxy (`server.ts`)
- Proxies requests to Yahoo Finance API endpoints to deliver prices, changes, and day percentages for NSE/BSE tickers (`RELIANCE.NS`, `TCS.NS`, `INFY.NS`) and US indices (`^GSPC`, `AAPL`, `MSFT`).
- Employs an in-memory 30-second cache to prevent API rate limits.
- Supports currency exchange rates (`USDINR=X`, `EURINR=X`, `GBPINR=X`) to dynamically convert asset values across currencies.

---

## 8. UI/UX Design System, Themes & Customization

### 8.1 4-Tier Theme Architecture
The application features a CSS variable theme switcher configured in `src/index.css` and initialized before DOM paint in `index.html`:
1. **Dark Theme (`dark`)**: High-contrast slate and zinc tones with subtle emerald highlights.
2. **Midnight Theme (`midnight`)**: Deep space-black styling designed for OLED displays.
3. **Light Theme (`light`)**: Clean, crisp executive light mode with subtle borders and shadows.
4. **Retro / Warm (`retro` / `nature`)**: Organic paper/nature tones for relaxed visual ergonomics.

### 8.2 Dynamic Accent Colors
Users can select their primary dashboard accent (`blue`, `emerald`, `indigo`, `purple`, `rose`, `amber`), altering buttons, active nav tabs, chart lines, and progress rings via `data-accent` CSS attributes.

### 8.3 Multi-Currency Matrix
A dedicated formatter (`src/utils/currencyFormatter.ts`) supports:
- **₹ INR**: Formats numbers using the Indian numbering system ($1,00,000$ = 1 Lakh, $1,00,00,000$ = 1 Crore).
- **$ USD, € EUR, £ GBP**: Standard Western thousand/million comma separators.

---

## 9. Comprehensive Directory & File Structure

```text
ai-studio-wealthtracker/
│
├── 📄 index.html                      # Entry HTML with pre-paint theme initializer
├── 📄 package.json                    # Scripts and dependencies
├── 📄 tsconfig.json                   # Strict TypeScript configuration
├── 📄 vite.config.ts                  # Vite build setup with Tailwind v4 plugin
├── 📄 metadata.json                   # Project metadata and system capabilities
├── 📄 server.ts                       # Express backend (AMFI parser, stock & forex proxies)
├── 📄 firestore.rules                 # Cloud Firestore security rules
├── 📄 firebase-applet-config.json     # Firebase deployment credentials
├── 📄 firebase-blueprint.json         # Database schema definitions
├── 📄 Developer Understanding.md      # This comprehensive technical guide
│
├── 📁 dist/                           # Production artifacts
│   ├── index.html                     # Optimized client bundle
│   ├── server.cjs                     # Bundled Node.js backend server
│   └── assets/                        # Compiled JavaScript, CSS, and SVGs
│
└── 📁 src/                            # Source codebase
    ├── 📄 main.tsx                    # React DOM bootstrapper
    ├── 📄 App.tsx                     # Main layout shell and active view router
    ├── 📄 types.ts                    # Central TypeScript interfaces
    ├── 📄 index.css                   # Global Tailwind CSS and design tokens
    │
    ├── 📁 assets/                     # Media and graphics
    │   └── fix-wealth-logo.svg        # Pure vector brand logo (coin & sprout)
    │
    ├── 📁 context/                    # Shared state providers
    │   ├── AuthContext.tsx            # Session, authentication, and demo mode
    │   └── FinanceContext.tsx         # Net worth, assets, debts, and currency state
    │
    ├── 📁 services/                   # Engines and external communication
    │   ├── finScoreEngine.ts          # 100-point financial wellness calculator
    │   ├── fireCalculatorEngine.ts    # F.I.R.E. retirement projection engine
    │   ├── firebase.ts                # Firestore client methods and feedback logging
    │   └── marketDataService.ts       # Stock, mutual fund, and forex client
    │
    ├── 📁 data/                       # Seed catalogs and reference taxonomies
    │   ├── assetTaxonomy.ts           # Asset category hierarchy and risk classifications
    │   ├── initialData.ts             # Default mock portfolio for first-time onboarding
    │   └── marketStocks.ts            # Indian and global market ticker directory
    │
    ├── 📁 utils/                      # Helper libraries
    │   ├── currencyFormatter.ts       # Lakh/Crore and currency formatter
    │   ├── financialCalculations.ts   # Compound interest, EMI, and tax formulas
    │   ├── generateFinancialReportHtml.ts # HTML statement exporter
    │   ├── generateFinancialReportPdf.ts  # jsPDF balance sheet exporter
    │   └── xirr.ts                    # Newton-Raphson XIRR iterative algorithm
    │
    └── 📁 components/                 # Frontend component hierarchy
        │
        ├── 📁 common/
        │   └── FixWealthLogo.tsx      # SVG component with micro-interaction states
        │
        ├── 📁 auth/
        │   └── AuthModal.tsx          # Login, Register, and Demo switch modal
        │
        ├── 📁 views/                  # Primary screen components
        │   ├── OverviewView.tsx       # Primary dashboard with KPI cards and net worth chart
        │   ├── WealthView.tsx         # Asset allocation matrix and holding list
        │   ├── AccountsView.tsx       # Bank accounts, wallets, and cash reserves
        │   ├── BalanceSheetView.tsx   # Formal accounting balance sheet
        │   ├── GoalsView.tsx          # Goal progress tracker with confetti triggers
        │   ├── FinScoreView.tsx       # In-depth financial health score diagnostics
        │   ├── CalendarView.tsx       # Cash flow, SIP, and debt payment calendar
        │   ├── ReportsView.tsx        # Statements and visual analytics
        │   ├── AdminPanelView.tsx     # Master admin dashboard and user management
        │   ├── NewsUpdatesView.tsx    # Live financial news stream
        │   ├── MoreView.tsx           # Extended utilities and quick links
        │   └── SettingsView.tsx       # Theme, currency, privacy, and backup settings
        │
        ├── 📁 wealth/                 # Portfolio management modals
        │   ├── AssetDetailView.tsx    # Deep dive into individual holding
        │   ├── LiabilityDetailView.tsx # Debt detail and amortization schedule
        │   ├── LiabilityEditModal.tsx # Add or update liabilities
        │   ├── RecordLiabilityPaymentModal.tsx # Record EMI payments
        │   └── RecordTransactionModal.tsx # Add income, expense, or investment
        │
        ├── 📁 calculators/            # Interactive financial tools
        │   ├── FinancialCalculatorsView.tsx # Calculators hub view
        │   ├── IncomeGrowthCalculator.tsx   # Career income and savings projector
        │   ├── StepUpSIPCalculator.tsx     # SIP step-up returns calculator
        │   └── ToolsFeedbackSection.tsx    # User calculator feedback form
        │
        ├── 📁 finscore/               # Diagnostic widgets
        │   ├── FinScoreAmountInput.tsx     # Clean numeric input with formatters
        │   ├── FinScoreModals.tsx          # Metric deep dives and breakdowns
        │   └── PersonalFinanceAdvisorSection.tsx # AI/algorithmic recommendations
        │
        ├── 📁 settings/               # Preference management panels
        │   ├── AppearanceSection.tsx       # Theme mode and accent color picker
        │   ├── ExportReportModal.tsx       # PDF and CSV export modal
        │   ├── HelpSupportSection.tsx      # Support tickets and FAQ
        │   ├── LanguageRegionSection.tsx   # Currency and locale configurations
        │   ├── NotificationsSection.tsx    # Alerts and thresholds
        │   └── SecuritySection.tsx         # Data wipe and privacy toggles
        │
        └── 📄 [Shared Shell Components]
            ├── LaunchPage.tsx         # Public landing page with transparent header & hero
            ├── Navbar.tsx             # Top navigation bar
            ├── Sidebar.tsx            # Collapsible navigation drawer
            ├── SidebarProfile.tsx     # User avatar card and switcher in sidebar
            ├── BottomNav.tsx          # Mobile navigation bar
            ├── AppFooter.tsx          # Footnotes and legal disclaimers
            ├── QuickAddModal.tsx      # Multi-action asset/debt/goal creator
            ├── QuickAddOnboarding.tsx # First-time user setup wizard
            ├── EmergencyGoalModal.tsx # Emergency fund configuration modal
            ├── AssetEditModal.tsx     # Add or edit individual asset modal
            ├── ConfirmationModal.tsx  # Destructive action verification
            ├── GlobalSearchModal.tsx  # Universal Cmd/Ctrl+K search modal
            ├── KeyboardShortcutsModal.tsx # Keyboard hotkey reference sheet
            ├── GlobalKeyboardShortcuts.tsx # Keyboard event listener
            ├── FinancialStatementChart.tsx # Recharts-powered net worth history
            ├── FireFreedomCalculator.tsx   # F.I.R.E. progress card
            ├── TextHighlightController.tsx # Search term highlighting
            └── ThankYouFeedbackModal.tsx   # Action acknowledgment modal
```

---

## 10. Developer Guide & Command Reference

### 10.1 Running the Application Locally
```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (Vite + Express via tsx on port 3000)
npm run dev

# 3. Type check and lint the codebase
npm run lint

# 4. Create production build (Client Vite build + Server esbuild bundle)
npm run build

# 5. Run production server
npm start
```

### 10.2 Best Practices for Contributing Code
1. **Preserve Privacy & Zero Telemetry**: Never add external trackers, unsolicited cloud syncs, or telemetry scripts. User data must default to local storage.
2. **Type Safety**: Avoid using `any`. Always use or extend interfaces in `src/types.ts`.
3. **Number Formatting**: Always route numerical currency displays through `formatCurrency()` from `src/utils/currencyFormatter.ts` to respect the user's selected locale and Indian/Western number formats.
4. **Responsive Integrity**: Test all UI additions on both mobile screens ($375\text{px}$) and wide desktop monitors ($1440\text{px}$).

---

*Document created for the FIX Wealth Tracker Engineering Team. All rights reserved.*
