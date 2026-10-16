# FIX Wealth Tracker 💎

A comprehensive, full-stack personal finance, net worth management, and wealth acceleration platform designed for modern individuals, families, and investors.

---

## 🌟 Key Capabilities & Feature Matrix

- **📊 Comprehensive Wealth Overview**: Real-time Net Worth tracking, 30-day velocity, asset-to-liability ratios, and liquid runway health monitoring.
- **🎯 Dynamic Savings Goals**: Target date milestone tracking, category allocation, and automated **Daily Savings Pace** calculations.
- **📈 Asset & Liability Taxonomy**: Indian & Global markets asset classification (Equities, Mutual Funds, EPF, PPF, Sovereign Gold Bonds, Real Estate, Crypto, NPS, Physical Gold).
- **🗓️ Cash Flow Calendar**: Interactive scheduling of recurring SIPs, EMIs, insurance renewals, and income distributions.
- **⚖️ Balance Sheet & Forensic Audit**: Formatted personal balance sheets with audited debt-to-income and solvency scores.
- **🧮 Financial Calculators & FIRE Hub**: Integrated calculators for SIP, Step-Up SIP, SWP, CAGR, Coast FIRE, Lean FIRE, Fat FIRE, and Emergency Fund sizing.
- **📰 Release Notes & News**: Updates and release articles covering market trends and financial planning.
- **🔒 Privacy & Isolated Vault Architecture**: Data isolation per user, client-side encryption options, and protected administrator controls with PIN verification.
- **🎨 Responsive Dual Engine**: Theme support (Dark, Light, Nature, Retro, FlavorFit, Coolors, Midnight) with responsive mobile bottom navigation and desktop sidebar.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide Icons, Canvas Confetti.
- **Backend / API**: Express 4, Node.js, Tsx, Vite Dev Middleware in development, static production server in production.
- **Data Persistence**: Firebase Firestore integration with local storage caching and user-isolated vault prefixes.
- **Document Export**: PDF report generation via jsPDF & jsPDF-AutoTable; structured JSON backups.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun

### Installation
```bash
# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` if local overrides are needed:
```bash
cp .env.example .env
```

### Development
Start the full-stack dev server with live Vite HMR:
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### Production Build
Compile the client bundle and bundle the server:
```bash
npm run build
```
Run the production build:
```bash
npm run start
```

### Verification & Linting
```bash
npm run lint
```

---

## 🛡️ Security & Privacy

- Client-side vaults isolate sensitive financial assets per authenticated account.
- Master administration panel is gated with PIN authentication.
- Demo sessions operate in isolated sandbox storage.
- Standard health check available at `/api/health`.

---

## 📄 License
Private & Proprietary - FIX Wealth Tracker.
