export interface AssetSubType {
  id: string;
  name: string;
  group?: string; // For grouped categories like Debt (e.g. "FD / RD", "Bonds", "Govt. Schemes", "Mutual Funds / ETF", "Insurance", "Retirement", "Other")
  description?: string;
  suggestedInstitutions?: string[];
  isDefaultLiquid?: boolean;
  searchType?: 'stock' | 'reit' | 'mutual_fund' | 'equity_mf' | 'hybrid_mf' | 'arbitrage_mf' | 'debt_mf' | 'liquid_mf' | 'etf' | 'manual';
  badge?: string;
}

export interface DebtGroup {
  groupName: string;
  iconName: string;
  description: string;
  items: AssetSubType[];
}

export interface AssetCategoryInfo {
  id: string;
  name: string;
  countLabel: string;
  iconName: 'trending-up' | 'landmark' | 'home' | 'gem' | 'wallet' | 'bitcoin' | 'layers' | 'plus';
  description: string;
  color: string;
  subTypes: AssetSubType[];
}

// -------------------------------------------------------------
// EQUITY ASSET TYPES (10 Types requested by user)
// -------------------------------------------------------------
export const EQUITY_SUBTYPES: AssetSubType[] = [
  {
    id: 'direct-stock',
    name: 'Direct Stock',
    description: 'Direct listed equity shares on NSE, BSE, NASDAQ, NYSE',
    searchType: 'stock',
    suggestedInstitutions: ['Zerodha', 'Groww', 'Angel One', 'Upstox', 'Interactive Brokers', 'Robinhood'],
    badge: 'Live Stock Search',
    isDefaultLiquid: true,
  },
  {
    id: 'equity-mf',
    name: 'Equity Mutual Fund',
    description: 'Large, Mid, Small, Flexi Cap & ELSS equity funds with daily AMFI NAV',
    searchType: 'equity_mf',
    suggestedInstitutions: ['Parag Parikh', 'Quant', 'Mirae Asset', 'HDFC Mutual Fund', 'SBI Mutual Fund'],
    badge: 'Daily NAV',
    isDefaultLiquid: true,
  },
  {
    id: 'hybrid-mf',
    name: 'Hybrid Mutual Fund',
    description: 'Dynamic asset allocation, balanced advantage & multi-asset funds',
    searchType: 'hybrid_mf',
    suggestedInstitutions: ['ICICI Prudential', 'HDFC Hybrid', 'SBI Balanced', 'Kotak Balanced Advantage'],
    badge: 'Daily NAV',
    isDefaultLiquid: true,
  },
  {
    id: 'arbitrage-fund',
    name: 'Arbitrage Fund',
    description: 'Cash-futures arbitrage schemes with equity taxation & low volatility',
    searchType: 'arbitrage_mf',
    suggestedInstitutions: ['Kotak Equity Arbitrage', 'SBI Arbitrage', 'Invesco India Arbitrage', 'Tata Arbitrage'],
    badge: 'Daily NAV',
    isDefaultLiquid: true,
  },
  {
    id: 'etf',
    name: 'ETF',
    description: 'Index, thematic & gold Exchange Traded Funds traded on stock exchanges',
    searchType: 'etf',
    suggestedInstitutions: ['Nippon India ETF', 'Mirae Asset ETF', 'SBI ETF', 'Vanguard', 'iShares'],
    badge: 'Exchange Traded',
    isDefaultLiquid: true,
  },
  {
    id: 'esop-rsu',
    name: 'ESOP / RSU',
    description: 'Employee stock ownership plans and restricted stock units from employers',
    searchType: 'manual',
    suggestedInstitutions: ['Carta', 'Shareworks', 'E*TRADE Corporate', 'Morgan Stanley at Work'],
    badge: 'Corporate',
    isDefaultLiquid: false,
  },
  {
    id: 'unlisted-equity',
    name: 'Unlisted Equity',
    description: 'Pre-IPO shares, private startup equity & angel investments',
    searchType: 'manual',
    suggestedInstitutions: ['AngelList', 'Altius Investech', 'UnlistedKart', 'Private Placement'],
    badge: 'Private Equity',
    isDefaultLiquid: false,
  },
  {
    id: 'nps-equity',
    name: 'NPS',
    description: 'National Pension System - Scheme E (Equity Asset Class allocation)',
    searchType: 'manual',
    suggestedInstitutions: ['NSDL / CRA', 'KFintech CRA', 'HDFC Pension Fund', 'SBI Pension Fund'],
    badge: 'Retirement / NPS',
    isDefaultLiquid: false,
  },
  {
    id: 'equity-ulip',
    name: 'ULIP',
    description: 'Unit Linked Insurance Plans with high equity market fund exposure',
    searchType: 'manual',
    suggestedInstitutions: ['HDFC Life', 'ICICI Prudential Life', 'Max Life Insurance', 'SBI Life'],
    badge: 'Insurance / ULIP',
    isDefaultLiquid: false,
  },
  {
    id: 'pms-aif',
    name: 'PMS / AIF',
    description: 'Portfolio Management Services and Category I/II/III Alternative Investment Funds',
    searchType: 'manual',
    suggestedInstitutions: ['Marcellus Investment', 'ASK Investment Managers', 'WhiteOak Capital', 'IIFL Wealth'],
    badge: 'High Net Worth',
    isDefaultLiquid: false,
  },
];

// -------------------------------------------------------------
// DEBT ASSET CATEGORIES & SUBTYPES (Grouped as requested by user)
// -------------------------------------------------------------
export const DEBT_GROUPS: DebtGroup[] = [
  {
    groupName: 'FD / RD',
    iconName: 'landmark',
    description: 'Fixed and recurring term deposits with guaranteed returns',
    items: [
      {
        id: 'bank-fd',
        name: 'Bank FD',
        group: 'FD / RD',
        description: 'Fixed Deposit held with scheduled commercial & public banks',
        searchType: 'manual',
        suggestedInstitutions: ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'],
        badge: 'Guaranteed',
        isDefaultLiquid: true,
      },
      {
        id: 'corporate-fd',
        name: 'Corporate FD',
        group: 'FD / RD',
        description: 'High-yield corporate fixed deposits from AAA/AA rated NBFCs & companies',
        searchType: 'manual',
        suggestedInstitutions: ['Bajaj Finance', 'Shriram Finance', 'Mahindra Finance', 'HDFC Ltd'],
        badge: 'High Yield',
        isDefaultLiquid: false,
      },
      {
        id: 'recurring-deposit',
        name: 'Recurring Deposit',
        group: 'FD / RD',
        description: 'Systematic monthly savings term deposit with bank',
        searchType: 'manual',
        suggestedInstitutions: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Post Office'],
        badge: 'Monthly Savings',
        isDefaultLiquid: true,
      },
    ],
  },
  {
    groupName: 'Bonds',
    iconName: 'file-text',
    description: 'Government, PSU & corporate fixed-coupon debt securities',
    items: [
      {
        id: 'bond-debenture',
        name: 'Bond / Debenture',
        group: 'Bonds',
        description: 'Corporate bonds, PSU bonds, NCDs & sovereign debt securities',
        searchType: 'manual',
        suggestedInstitutions: ['Wint Wealth', 'GoldenPi', 'Grip Invest', 'RBI Retail Direct', 'Zerodha Coin'],
        badge: 'Fixed Coupon',
        isDefaultLiquid: false,
      },
    ],
  },
  {
    groupName: 'Govt. Schemes',
    iconName: 'shield',
    description: 'Sovereign-backed tax-advantaged long-term savings schemes',
    items: [
      {
        id: 'ppf',
        name: 'PPF',
        group: 'Govt. Schemes',
        description: 'Public Provident Fund (15-year EEE sovereign backed scheme)',
        searchType: 'manual',
        suggestedInstitutions: ['State Bank of India', 'India Post', 'HDFC Bank', 'ICICI Bank'],
        badge: 'EEE Tax Free',
        isDefaultLiquid: false,
      },
      {
        id: 'epf-vpf',
        name: 'EPF / VPF',
        group: 'Govt. Schemes',
        description: 'Employee Provident Fund & Voluntary Provident Fund via EPFO',
        searchType: 'manual',
        suggestedInstitutions: ['EPFO Unified Portal', 'Employer Trust'],
        badge: 'Provident Fund',
        isDefaultLiquid: false,
      },
      {
        id: 'nps-debt',
        name: 'NPS',
        group: 'Govt. Schemes',
        description: 'National Pension System - Scheme C (Corporate Debt) & Scheme G (Govt Bonds)',
        searchType: 'manual',
        suggestedInstitutions: ['NSDL CRA', 'KFintech CRA', 'SBI Pension Funds', 'HDFC Pension Funds'],
        badge: 'Sovereign',
        isDefaultLiquid: false,
      },
      {
        id: 'ssy',
        name: 'SSY',
        group: 'Govt. Schemes',
        description: 'Sukanya Samriddhi Yojana for the girl child (High interest EEE)',
        searchType: 'manual',
        suggestedInstitutions: ['India Post', 'State Bank of India', 'Punjab National Bank'],
        badge: 'Govt Scheme',
        isDefaultLiquid: false,
      },
      {
        id: 'govt-savings-scheme',
        name: 'Govt. Savings Scheme',
        group: 'Govt. Schemes',
        description: 'SCSS, POMIS, National Savings Certificates (NSC), KVP, RBI Floating Rate Bonds',
        searchType: 'manual',
        suggestedInstitutions: ['India Post Office', 'State Bank of India', 'Canara Bank'],
        badge: 'Govt Backed',
        isDefaultLiquid: false,
      },
    ],
  },
  {
    groupName: 'Mutual Funds / ETF',
    iconName: 'layers',
    description: 'Debt mutual funds, overnight, liquid & fixed income ETFs',
    items: [
      {
        id: 'debt-mf',
        name: 'Debt Mutual Fund',
        group: 'Mutual Funds / ETF',
        description: 'Corporate bond, short duration, banking & PSU, gilt mutual funds',
        searchType: 'debt_mf',
        suggestedInstitutions: ['Aditya Birla Sun Life', 'HDFC Mutual Fund', 'ICICI Prudential', 'SBI Mutual Fund'],
        badge: 'Daily NAV',
        isDefaultLiquid: true,
      },
      {
        id: 'liquid-fund',
        name: 'Liquid Fund',
        group: 'Mutual Funds / ETF',
        description: 'Liquid and overnight schemes for ultra-short term cash parking (T+1 liquidity)',
        searchType: 'liquid_mf',
        suggestedInstitutions: ['Quantum Liquid', 'Nippon India Liquid', 'ICICI Liquid', 'SBI Liquid'],
        badge: 'Ultra Liquid',
        isDefaultLiquid: true,
      },
      {
        id: 'debt-etf',
        name: 'ETF',
        group: 'Mutual Funds / ETF',
        description: 'BHARAT Bond ETF, Liquid BeES & G-Sec 10-Year debt ETFs',
        searchType: 'etf',
        suggestedInstitutions: ['Edelweiss BHARAT Bond', 'Nippon Liquid BeES', 'Mirae Asset Gilt ETF'],
        badge: 'Traded ETF',
        isDefaultLiquid: true,
      },
    ],
  },
  {
    groupName: 'Insurance',
    iconName: 'heart',
    description: 'Traditional life insurance, endowment and guaranteed annuity contracts',
    items: [
      {
        id: 'debt-ulip',
        name: 'ULIP',
        group: 'Insurance',
        description: 'Unit Linked Insurance Plan allocated to debt & money-market funds',
        searchType: 'manual',
        suggestedInstitutions: ['HDFC Life', 'ICICI Prudential Life', 'Max Life Insurance'],
        badge: 'Debt ULIP',
        isDefaultLiquid: false,
      },
      {
        id: 'endowment',
        name: 'Endowment',
        group: 'Insurance',
        description: 'Participating & non-participating endowment life insurance policies',
        searchType: 'manual',
        suggestedInstitutions: ['Life Insurance Corporation of India (LIC)', 'SBI Life', 'Bajaj Allianz'],
        badge: 'Policy',
        isDefaultLiquid: false,
      },
      {
        id: 'moneyback',
        name: 'Moneyback',
        group: 'Insurance',
        description: 'Periodic survival benefit payouts with life insurance coverage',
        searchType: 'manual',
        suggestedInstitutions: ['LIC Money Back', 'HDFC Life Sanchay Plus', 'ICICI Pru Guaranteed Income'],
        badge: 'Survival Benefit',
        isDefaultLiquid: false,
      },
      {
        id: 'annuity',
        name: 'Annuity',
        group: 'Insurance',
        description: 'Immediate and deferred pension annuity payout plans',
        searchType: 'manual',
        suggestedInstitutions: ['LIC Jeevan Shanti', 'HDFC Life Pension Guaranteed', 'ICICI Pru Immediate Annuity'],
        badge: 'Pension / Annuity',
        isDefaultLiquid: false,
      },
    ],
  },
  {
    groupName: 'Retirement',
    iconName: 'clock',
    description: 'Designated corporate retirement and superannuation schemes',
    items: [
      {
        id: 'retirement-account',
        name: 'Retirement Account',
        group: 'Retirement',
        description: 'Corporate superannuation, employer gratuity fund or international retirement trust',
        searchType: 'manual',
        suggestedInstitutions: ['Employer Pension Trust', 'LIC Superannuation', 'Vanguard 401(k)', 'Fidelity IRA'],
        badge: 'Superannuation',
        isDefaultLiquid: false,
      },
    ],
  },
  {
    groupName: 'Other',
    iconName: 'coins',
    description: 'Personal loans given, promissory notes and private debt receivables',
    items: [
      {
        id: 'loan-given',
        name: 'Loan Given',
        group: 'Other',
        description: 'Personal, peer-to-peer or family loan lent out with expected repayment',
        searchType: 'manual',
        suggestedInstitutions: ['Personal / Friend', 'Family Member', 'Business Associate', 'P2P Lending'],
        badge: 'Receivable',
        isDefaultLiquid: false,
      },
    ],
  },
];

// Flatten all Debt items for compatibility
export const DEBT_SUBTYPES: AssetSubType[] = DEBT_GROUPS.flatMap(g => g.items);

export const ASSET_TAXONOMY: AssetCategoryInfo[] = [
  {
    id: 'Equity',
    name: 'Equity',
    countLabel: '10 types',
    iconName: 'trending-up',
    description: 'Stocks, mutual funds, ETFs, RSUs & equity investments',
    color: '#3B82F6',
    subTypes: EQUITY_SUBTYPES,
  },
  {
    id: 'Debt',
    name: 'Debt',
    countLabel: '7 categories • 17 types',
    iconName: 'landmark',
    description: 'FDs, bonds, provident funds, debt MFs, insurance & loans given',
    color: '#10B981',
    subTypes: DEBT_SUBTYPES,
  },
  {
    id: 'Real Estate',
    name: 'Real Estate',
    countLabel: '4 types',
    iconName: 'home',
    description: 'Residential, commercial properties, plots and REITs',
    color: '#8B5CF6',
    subTypes: [
      { id: 'residential-prop', name: 'Residential Property', searchType: 'manual', isDefaultLiquid: false },
      { id: 'commercial-prop', name: 'Commercial Property', searchType: 'manual', isDefaultLiquid: false },
      { id: 'land-plot', name: 'Land / Open Plot', searchType: 'manual', isDefaultLiquid: false },
      { id: 'reit', name: 'REITs (Real Estate Trusts)', searchType: 'reit', suggestedInstitutions: ['Embassy REIT', 'Mindspace REIT', 'Brookfield REIT', 'Nexus Select', 'Realty Income (O)', 'Prologis (PLD)'], isDefaultLiquid: true },
    ],
  },
  {
    id: 'Commodities',
    name: 'Commodities',
    countLabel: '4 types',
    iconName: 'gem',
    description: 'Physical & digital gold, silver, precious metals',
    color: '#F59E0B',
    subTypes: [
      { id: 'physical-gold', name: 'Physical Gold (Jewelry/Coins)', searchType: 'manual', isDefaultLiquid: true },
      { id: 'sgb-commodity', name: 'Sovereign Gold Bond (SGB)', searchType: 'stock', suggestedInstitutions: ['RBI Retail Direct', 'Zerodha', 'Groww'], isDefaultLiquid: true },
      { id: 'digital-gold', name: 'Digital Gold (MMTC-PAMP / SafeGold)', searchType: 'manual', suggestedInstitutions: ['Jar', 'Paytm Gold', 'PhonePe', 'MMTC-PAMP'], isDefaultLiquid: true },
      { id: 'silver-metals', name: 'Silver & Precious Metals', searchType: 'manual', suggestedInstitutions: ['Physical Vault', 'Silver ETF / Fund'], isDefaultLiquid: true },
    ],
  },
  {
    id: 'Cash & Savings',
    name: 'Cash & Savings',
    countLabel: '4 types',
    iconName: 'wallet',
    description: 'Bank savings, checking accounts, emergency liquid cash',
    color: '#06B6D4',
    subTypes: [
      { id: 'savings-acc', name: 'Bank Savings Account', searchType: 'manual', suggestedInstitutions: ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'], isDefaultLiquid: true },
      { id: 'checking-acc', name: 'Current / Checking Account', searchType: 'manual', suggestedInstitutions: ['HDFC Bank', 'ICICI Bank', 'Citibank'], isDefaultLiquid: true },
      { id: 'cash-vault', name: 'Physical Cash in Hand / Vault', searchType: 'manual', isDefaultLiquid: true },
      { id: 'emergency-reserve', name: 'Emergency Liquid Reserve', searchType: 'manual', isDefaultLiquid: true },
    ],
  },
  {
    id: 'Crypto',
    name: 'Crypto',
    countLabel: '2 types',
    iconName: 'bitcoin',
    description: 'Cryptocurrencies, hardware cold wallets, staked tokens',
    color: '#F97316',
    subTypes: [
      { id: 'crypto-spot', name: 'Crypto Coins & Tokens (BTC, ETH, SOL)', searchType: 'manual', suggestedInstitutions: ['Coinbase', 'Binance', 'Ledger Hardware', 'Kraken', 'CoinDCX'], isDefaultLiquid: true },
      { id: 'defi-staked', name: 'DeFi Staking & Web3 Protocol Assets', searchType: 'manual', suggestedInstitutions: ['Metamask', 'Phantom', 'Lido Finance', 'Uniswap'], isDefaultLiquid: true },
    ],
  },
  {
    id: 'Alternatives',
    name: 'Alternatives',
    countLabel: '2 types',
    iconName: 'layers',
    description: 'Private equity, startup angels, P2P lending platforms',
    color: '#EC4899',
    subTypes: [
      { id: 'private-equity', name: 'Private Equity / Startup Angels', searchType: 'manual', suggestedInstitutions: ['AngelList Syndicate', 'LetsVenture', 'Republic', 'SeedInvest'], isDefaultLiquid: false },
      { id: 'p2p-lending', name: 'P2P Lending', searchType: 'manual', suggestedInstitutions: ['Faircent', 'LiquiLoans', '12% Club', 'LendingClub', 'Prosper', 'Cred Mint'], isDefaultLiquid: false, badge: 'P2P Lending' },
    ],
  },
  {
    id: 'Other',
    name: 'Other',
    countLabel: 'Direct Add',
    iconName: 'plus',
    description: 'Direct entry: specify name, currency & total investment',
    color: '#64748B',
    subTypes: [
      { id: 'custom-asset', name: 'Direct Asset Entry', searchType: 'manual', isDefaultLiquid: false },
      { id: 'vehicles', name: 'Vehicles & Automobiles', searchType: 'manual', isDefaultLiquid: false },
      { id: 'valuables', name: 'Jewelry & High-Value Assets', searchType: 'manual', isDefaultLiquid: false },
    ],
  },
];

export interface LiabilitySubType {
  id: string;
  name: string;
  group: string;
  category: 'Home Loan' | 'Personal Loan' | 'Credit Card' | 'Auto Loan' | 'Student Loan' | 'Gold Loan' | 'Mortgage' | 'Loan Against Property' | 'Buy Now Pay Later' | 'Business Loan' | 'Line of Credit' | 'Other Debt';
  description: string;
  suggestedCreditors: string[];
  defaultInterestRate: number; // typical annual APR %
  isSecured: boolean;
  badge: string;
}

export interface LiabilityGroup {
  groupName: string;
  iconName: string;
  description: string;
  color: string;
  countLabel: string;
  items: LiabilitySubType[];
}

export interface LiabilityCategoryInfo {
  id: string;
  name: string;
  iconName: string;
  description: string;
  suggestedCreditors: string[];
}

// -------------------------------------------------------------
// SECURED & UNSECURED SUBTYPES (Hero selectors mirroring Equity & Debt)
// -------------------------------------------------------------
export const SECURED_LIABILITY_SUBTYPES: LiabilitySubType[] = [
  {
    id: 'home-loan',
    name: 'Home Loan / Mortgage',
    group: 'Home & Property',
    category: 'Home Loan',
    description: 'Primary residential housing mortgage with floating or fixed interest rate',
    suggestedCreditors: ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Chase Mortgage', 'Rocket Mortgage'],
    defaultInterestRate: 8.5,
    isSecured: true,
    badge: 'Property Backed',
  },
  {
    id: 'lap-loan',
    name: 'Loan Against Property (LAP)',
    group: 'Home & Property',
    category: 'Loan Against Property',
    description: 'Mortgage against commercial or residential owned property for business or liquidity',
    suggestedCreditors: ['HDFC Bank', 'ICICI Bank', 'Bajaj Finserv', 'Kotak Mahindra Bank'],
    defaultInterestRate: 9.5,
    isSecured: true,
    badge: 'Mortgage',
  },
  {
    id: 'car-loan',
    name: 'Car / Auto Loan',
    group: 'Vehicle Loans',
    category: 'Auto Loan',
    description: 'Secured vehicle finance for new or pre-owned four-wheeler automobiles',
    suggestedCreditors: ['HDFC Auto', 'SBI Car Loan', 'Toyota Financial', 'Chase Auto', 'Axis Bank'],
    defaultInterestRate: 8.9,
    isSecured: true,
    badge: 'Vehicle Lien',
  },
  {
    id: 'two-wheeler-loan',
    name: 'Two-Wheeler / Bike Loan',
    group: 'Vehicle Loans',
    category: 'Auto Loan',
    description: 'Motorcycle and scooter financing with fixed monthly installments',
    suggestedCreditors: ['Bajaj Auto Finance', 'TVS Credit', 'Hero Fincorp', 'HDFC Bank'],
    defaultInterestRate: 11.5,
    isSecured: true,
    badge: 'Hypothecated',
  },
  {
    id: 'gold-loan',
    name: 'Gold Loan',
    group: 'Secured & Collateral',
    category: 'Gold Loan',
    description: 'Immediate liquidity loan pledged against physical gold jewelry and bullion',
    suggestedCreditors: ['Muthoot Finance', 'Manappuram', 'SBI Gold Loan', 'ICICI Bank Gold Loan'],
    defaultInterestRate: 9.9,
    isSecured: true,
    badge: 'Gold Pledged',
  },
  {
    id: 'loan-against-securities',
    name: 'Loan Against Securities (LAS)',
    group: 'Secured & Collateral',
    category: 'Line of Credit',
    description: 'Overdraft line or loan pledged against listed equity stocks, mutual funds, or bonds',
    suggestedCreditors: ['Zerodha Capital', 'Mirae Asset LAS', 'HDFC Bank', 'ICICI Securities'],
    defaultInterestRate: 10.2,
    isSecured: true,
    badge: 'Shares / MFs Pledged',
  },
  {
    id: 'loan-against-fd',
    name: 'Loan Against Fixed Deposit',
    group: 'Secured & Collateral',
    category: 'Line of Credit',
    description: 'Low-interest overdraft limit secured against term deposits (typically 1-2% above FD rate)',
    suggestedCreditors: ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Punjab National Bank'],
    defaultInterestRate: 8.0,
    isSecured: true,
    badge: 'FD Lien',
  },
  {
    id: 'land-plot-loan',
    name: 'Land / Plot Purchase Loan',
    group: 'Home & Property',
    category: 'Home Loan',
    description: 'Financing for purchase of non-agricultural residential plot of land',
    suggestedCreditors: ['SBI Realty', 'HDFC Ltd', 'Canara Bank', 'Bank of Baroda'],
    defaultInterestRate: 9.1,
    isSecured: true,
    badge: 'Plot Mortgage',
  },
];

export const UNSECURED_LIABILITY_SUBTYPES: LiabilitySubType[] = [
  {
    id: 'credit-card-debt',
    name: 'Credit Card Outstanding',
    group: 'Credit Cards',
    category: 'Credit Card',
    description: 'Revolving balance and statement dues carrying monthly finance charges',
    suggestedCreditors: ['American Express', 'Chase Sapphire', 'HDFC Infinia', 'Citi', 'Axis Bank'],
    defaultInterestRate: 36.0,
    isSecured: false,
    badge: 'High APR',
  },
  {
    id: 'personal-loan',
    name: 'Personal Loan',
    group: 'Personal Loans',
    category: 'Personal Loan',
    description: 'Unsecured multi-purpose bank loan with fixed monthly EMI repayment',
    suggestedCreditors: ['Bajaj Finserv', 'HDFC Bank', 'Marcus by Goldman', 'SoFi', 'ICICI Bank'],
    defaultInterestRate: 12.5,
    isSecured: false,
    badge: 'Unsecured EMI',
  },
  {
    id: 'bnpl-credit',
    name: 'Buy Now Pay Later (BNPL)',
    group: 'Consumer Credit',
    category: 'Buy Now Pay Later',
    description: 'Short-term split installment plans and pay-later checkout balances',
    suggestedCreditors: ['Affirm', 'Klarna', 'Simpl', 'Amazon PayLater', 'LazyPay'],
    defaultInterestRate: 18.0,
    isSecured: false,
    badge: 'Split Payments',
  },
  {
    id: 'student-loan',
    name: 'Higher Education / Student Loan',
    group: 'Education Loans',
    category: 'Student Loan',
    description: 'College, university, and higher degree tuition financing with moratorium options',
    suggestedCreditors: ['SBI Scholar Loan', 'HDFC Credila', 'Avanse', 'Sallie Mae', 'Navient'],
    defaultInterestRate: 9.0,
    isSecured: false,
    badge: 'Tax Deductible',
  },
  {
    id: 'study-abroad-loan',
    name: 'Study Abroad Education Loan',
    group: 'Education Loans',
    category: 'Student Loan',
    description: 'International study financing covering foreign tuition and living expenses',
    suggestedCreditors: ['Prodigy Finance', 'MPower Financing', 'HDFC Credila', 'SBI Global Ed-Vantage'],
    defaultInterestRate: 10.5,
    isSecured: false,
    badge: 'Forex / Global',
  },
  {
    id: 'bank-overdraft',
    name: 'Bank Overdraft / Flexi Line',
    group: 'Credit Cards',
    category: 'Line of Credit',
    description: 'Pre-approved revolving credit line attached to current or savings account',
    suggestedCreditors: ['HDFC Bank Insta-OD', 'ICICI FlexiLine', 'SBI Overdraft'],
    defaultInterestRate: 13.5,
    isSecured: false,
    badge: 'Revolving Line',
  },
  {
    id: 'salary-advance',
    name: 'Instant Cash / Salary Advance',
    group: 'Personal Loans',
    category: 'Personal Loan',
    description: 'Fintech short-term payday or employer salary advance advances',
    suggestedCreditors: ['KreditBee', 'EarlySalary (Fibe)', 'PaySense', 'Earnin'],
    defaultInterestRate: 24.0,
    isSecured: false,
    badge: 'Payday Advance',
  },
  {
    id: 'business-loan',
    name: 'Business Term Loan',
    group: 'Business Debt',
    category: 'Business Loan',
    description: 'Term financing for enterprise expansion, equipment, or working capital',
    suggestedCreditors: ['HDFC Business Loan', 'Bajaj Finserv Business', 'Lendingkart', 'SBI SME'],
    defaultInterestRate: 14.0,
    isSecured: false,
    badge: 'Commercial',
  },
  {
    id: 'peer-family-debt',
    name: 'Family & Friends Loan',
    group: 'Informal Debt',
    category: 'Other Debt',
    description: 'Informal personal borrowing from family members, relatives, or colleagues',
    suggestedCreditors: ['Family Member', 'Friend / Peer', 'Private Lender'],
    defaultInterestRate: 0.0,
    isSecured: false,
    badge: 'Informal',
  },
];

// -------------------------------------------------------------
// COMPREHENSIVE LIABILITY CATEGORY GROUPS (Mirroring DEBT_GROUPS)
// -------------------------------------------------------------
export const LIABILITY_GROUPS: LiabilityGroup[] = [
  {
    groupName: 'Home & Property',
    iconName: 'home',
    description: 'Mortgages, home equity loans and property-backed liabilities',
    color: '#3B82F6',
    countLabel: '4 types',
    items: [
      SECURED_LIABILITY_SUBTYPES[0], // Home Loan / Mortgage
      SECURED_LIABILITY_SUBTYPES[1], // LAP
      SECURED_LIABILITY_SUBTYPES[7], // Land / Plot Loan
      {
        id: 'home-improvement',
        name: 'Home Renovation / Improvement Loan',
        group: 'Home & Property',
        category: 'Home Loan',
        description: 'Financing for home remodeling, interior design, structural repairs',
        suggestedCreditors: ['HDFC Home Improvement', 'SBI Home Top Up', 'Axis Bank'],
        defaultInterestRate: 8.8,
        isSecured: true,
        badge: 'Home Equity',
      },
    ],
  },
  {
    groupName: 'Vehicle Loans',
    iconName: 'car',
    description: 'Auto, bike, commercial vehicle and equipment loans',
    color: '#10B981',
    countLabel: '3 types',
    items: [
      SECURED_LIABILITY_SUBTYPES[2], // Car Loan
      SECURED_LIABILITY_SUBTYPES[3], // Two Wheeler
      {
        id: 'commercial-vehicle',
        name: 'Commercial Vehicle Finance',
        group: 'Vehicle Loans',
        category: 'Auto Loan',
        description: 'Truck, taxi, van, and fleet transport vehicle loans',
        suggestedCreditors: ['Tata Motors Finance', 'Mahindra Finance', 'HDFC Bank', 'Shriram Finance'],
        defaultInterestRate: 11.0,
        isSecured: true,
        badge: 'Commercial',
      },
    ],
  },
  {
    groupName: 'Credit Cards & Credit Lines',
    iconName: 'credit-card',
    description: 'Revolving card balances, overdraft facilities and personal credit lines',
    color: '#EF4444',
    countLabel: '3 types',
    items: [
      UNSECURED_LIABILITY_SUBTYPES[0], // Credit Card
      UNSECURED_LIABILITY_SUBTYPES[5], // Bank Overdraft
      {
        id: 'personal-line-of-credit',
        name: 'Personal Line of Credit',
        group: 'Credit Cards & Credit Lines',
        category: 'Line of Credit',
        description: 'Pre-approved standby revolving borrowing limit with interest only on utilized funds',
        suggestedCreditors: ['MoneyTap', 'PaySense Credit Line', 'KreditBee Line'],
        defaultInterestRate: 15.0,
        isSecured: false,
        badge: 'Standby Line',
      },
    ],
  },
  {
    groupName: 'Personal Loans',
    iconName: 'user',
    description: 'Unsecured installment loans, salary advances and consumer financing',
    color: '#F59E0B',
    countLabel: '3 types',
    items: [
      UNSECURED_LIABILITY_SUBTYPES[1], // Personal Loan
      UNSECURED_LIABILITY_SUBTYPES[6], // Salary Advance
      {
        id: 'consumer-durable-emi',
        name: 'Consumer Durable / Gadget EMI',
        group: 'Personal Loans',
        category: 'Personal Loan',
        description: 'No-cost and low-cost EMIs for smartphones, laptops, electronics & appliances',
        suggestedCreditors: ['Bajaj Finserv EMI Card', 'HDFC Debit Card EMI', 'ZestMoney', 'Snapmint'],
        defaultInterestRate: 14.0,
        isSecured: false,
        badge: 'Gadget EMI',
      },
    ],
  },
  {
    groupName: 'Buy Now Pay Later',
    iconName: 'shopping-bag',
    description: 'E-commerce installment pay-later balances and zero-interest checkout credit',
    color: '#EC4899',
    countLabel: '2 types',
    items: [
      UNSECURED_LIABILITY_SUBTYPES[2], // BNPL Credit
      {
        id: 'paylater-wallet',
        name: 'Amazon / Flipkart / Merchant PayLater',
        group: 'Buy Now Pay Later',
        category: 'Buy Now Pay Later',
        description: 'Monthly post-paid e-commerce line settled at the end of each billing cycle',
        suggestedCreditors: ['Amazon PayLater', 'Flipkart Pay Later', 'Paytm Postpaid', 'Freecharge PayLater'],
        defaultInterestRate: 18.0,
        isSecured: false,
        badge: 'Post-Paid',
      },
    ],
  },
  {
    groupName: 'Education Loans',
    iconName: 'graduation-cap',
    description: 'Undergraduate, post-graduate, university and overseas student tuition debt',
    color: '#8B5CF6',
    countLabel: '2 types',
    items: [
      UNSECURED_LIABILITY_SUBTYPES[3], // Student Loan
      UNSECURED_LIABILITY_SUBTYPES[4], // Study Abroad Loan
    ],
  },
  {
    groupName: 'Gold & Collateralized',
    iconName: 'gem',
    description: 'Instant liquidity loans secured by physical gold, shares, MFs, or fixed deposits',
    color: '#D97706',
    countLabel: '3 types',
    items: [
      SECURED_LIABILITY_SUBTYPES[4], // Gold Loan
      SECURED_LIABILITY_SUBTYPES[5], // Loan Against Securities
      SECURED_LIABILITY_SUBTYPES[6], // Loan Against FD
    ],
  },
  {
    groupName: 'Business Debt',
    iconName: 'building',
    description: 'Commercial term loans, working capital lines, and MSME financing',
    color: '#06B6D4',
    countLabel: '3 types',
    items: [
      UNSECURED_LIABILITY_SUBTYPES[7], // Business Loan
      {
        id: 'working-capital-cc',
        name: 'Cash Credit / Working Capital (CC/OD)',
        group: 'Business Debt',
        category: 'Business Loan',
        description: 'Working capital hypothecated against business stock and receivables',
        suggestedCreditors: ['State Bank of India', 'HDFC SME', 'ICICI Bank Commercial', 'Canara Bank'],
        defaultInterestRate: 10.5,
        isSecured: true,
        badge: 'Inventory / CC',
      },
      {
        id: 'msme-mudra-loan',
        name: 'MSME / Govt. Mudra Loan',
        group: 'Business Debt',
        category: 'Business Loan',
        description: 'Govt-subsidized micro & small enterprise growth and equipment financing',
        suggestedCreditors: ['Bank of Baroda Mudra', 'SBI e-Mudra', 'Union Bank of India'],
        defaultInterestRate: 9.5,
        isSecured: false,
        badge: 'Govt Subsidized',
      },
    ],
  },
  {
    groupName: 'Informal & Other Debt',
    iconName: 'file-text',
    description: 'Peer-to-peer borrowings, promissory notes, and informal family loans',
    color: '#64748B',
    countLabel: '3 types',
    items: [
      UNSECURED_LIABILITY_SUBTYPES[8], // Family & Friends
      {
        id: 'p2p-lending-debt',
        name: 'Peer-to-Peer (P2P) Borrowing',
        group: 'Informal & Other Debt',
        category: 'Other Debt',
        description: 'Borrowing from accredited peer-to-peer lending platforms and investors',
        suggestedCreditors: ['Faircent', 'LenDenClub', 'IndiaP2P', 'Prosper'],
        defaultInterestRate: 16.0,
        isSecured: false,
        badge: 'P2P Platform',
      },
      {
        id: 'promissory-note-other',
        name: 'Promissory Note / Other Liability',
        group: 'Informal & Other Debt',
        category: 'Other Debt',
        description: 'Custom loan contract, vendor dues, tax installments, or promissory debt',
        suggestedCreditors: ['Private Creditor', 'Vendor', 'Tax Authority'],
        defaultInterestRate: 6.0,
        isSecured: false,
        badge: 'Custom Contract',
      },
    ],
  },
];

export const ALL_LIABILITY_SUBTYPES: LiabilitySubType[] = LIABILITY_GROUPS.flatMap(g => g.items);

export const LIABILITY_TAXONOMY: LiabilityCategoryInfo[] = [
  { id: 'Home Loan', name: 'Home Loan / Mortgage', iconName: 'home', description: 'Primary residence or investment property loan', suggestedCreditors: ['HDFC Bank', 'SBI Home Loans', 'Chase Mortgage', 'Rocket Mortgage'] },
  { id: 'Personal Loan', name: 'Personal Loan', iconName: 'user', description: 'Unsecured personal bank loans or line of credit', suggestedCreditors: ['Bajaj Finserv', 'HDFC Bank', 'Marcus', 'SoFi'] },
  { id: 'Credit Card', name: 'Credit Card Outstanding', iconName: 'credit-card', description: 'Revolving balances & credit card dues', suggestedCreditors: ['American Express', 'Chase Sapphire', 'HDFC Infinia', 'Citi'] },
  { id: 'Auto Loan', name: 'Auto / Vehicle Loan', iconName: 'car', description: 'Car, bike or commercial vehicle finance', suggestedCreditors: ['Toyota Financial', 'HDFC Auto', 'Chase Auto', 'SBI Car Loan'] },
  { id: 'Student Loan', name: 'Education / Student Loan', iconName: 'graduation-cap', description: 'College, university or specialized studies loan', suggestedCreditors: ['Navient', 'Sallie Mae', 'SBI Scholar Loan', 'HDFC Credila'] },
  { id: 'Gold Loan', name: 'Gold Loan', iconName: 'gem', description: 'Loan secured against physical gold ornaments', suggestedCreditors: ['Muthoot Finance', 'Manappuram', 'SBI Gold Loan'] },
  { id: 'Loan Against Property', name: 'Loan Against Property (LAP)', iconName: 'building', description: 'Mortgage against commercial or residential property', suggestedCreditors: ['HDFC Bank', 'ICICI Bank', 'Axis Bank'] },
  { id: 'Buy Now Pay Later', name: 'Buy Now Pay Later (BNPL)', iconName: 'shopping-bag', description: 'Affirm, Klarna, Amazon PayLater or Simpl balances', suggestedCreditors: ['Affirm', 'Klarna', 'Afterpay', 'Amazon PayLater', 'Simpl'] },
  { id: 'Business Loan', name: 'Business / Commercial Loan', iconName: 'building', description: 'Enterprise term loan, working capital or MSME financing', suggestedCreditors: ['HDFC Business', 'SBI SME', 'Bajaj Finserv'] },
  { id: 'Line of Credit', name: 'Line of Credit / Overdraft', iconName: 'credit-card', description: 'Revolving overdraft line or loan against securities/FD', suggestedCreditors: ['HDFC Bank', 'ICICI Bank', 'Zerodha Capital'] },
  { id: 'Other Debt', name: 'Other Debt / Promissory Note', iconName: 'file-text', description: 'Family loans, peer-to-peer or informal liabilities', suggestedCreditors: ['Private Creditor', 'P2P Lending'] },
];
