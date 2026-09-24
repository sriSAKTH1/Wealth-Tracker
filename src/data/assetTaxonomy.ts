export interface AssetSubType {
  id: string;
  name: string;
  group?: string; // For grouped categories like Debt (e.g. "FD / RD", "Bonds", "Govt. Schemes", "Mutual Funds / ETF", "Insurance", "Retirement", "Other")
  description?: string;
  suggestedInstitutions?: string[];
  isDefaultLiquid?: boolean;
  searchType?: 'stock' | 'mutual_fund' | 'equity_mf' | 'hybrid_mf' | 'arbitrage_mf' | 'debt_mf' | 'liquid_mf' | 'etf' | 'manual';
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
      { id: 'reit', name: 'REITs (Real Estate Trusts)', searchType: 'stock', suggestedInstitutions: ['Embassy REIT', 'Mindspace REIT', 'Brookfield REIT', 'Nexus Select'], isDefaultLiquid: true },
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
      { id: 'crypto-spot', name: 'Crypto Coins & Tokens (BTC, ETH, SOL)', searchType: 'stock', suggestedInstitutions: ['Coinbase', 'Binance', 'Ledger Hardware', 'Kraken', 'CoinDCX'], isDefaultLiquid: true },
      { id: 'defi-staked', name: 'DeFi Staking & Web3 Protocol Assets', searchType: 'manual', suggestedInstitutions: ['Metamask', 'Phantom', 'Lido Finance', 'Uniswap'], isDefaultLiquid: true },
    ],
  },
  {
    id: 'Alternatives',
    name: 'Alternatives',
    countLabel: '2 types',
    iconName: 'layers',
    description: 'Private equity, startup investments, fine art & collectibles',
    color: '#EC4899',
    subTypes: [
      { id: 'private-equity', name: 'Private Equity / Startup Angels', searchType: 'manual', suggestedInstitutions: ['AngelList Syndicate', 'LetsVenture', 'Republic', 'SeedInvest'], isDefaultLiquid: false },
      { id: 'art-collectibles', name: 'Art, Wine & Luxury Collectibles', searchType: 'manual', suggestedInstitutions: ['Masterworks', 'Sotheby’s', 'Private Collection'], isDefaultLiquid: false },
    ],
  },
  {
    id: 'Other',
    name: 'Other',
    countLabel: '3 types',
    iconName: 'plus',
    description: 'Vehicles, automobiles, jewelry and custom valuable assets',
    color: '#64748B',
    subTypes: [
      { id: 'vehicles', name: 'Vehicles & Automobiles', searchType: 'manual', isDefaultLiquid: false },
      { id: 'valuables', name: 'Jewelry & High-Value Assets', searchType: 'manual', isDefaultLiquid: false },
      { id: 'custom-asset', name: 'Custom Asset Holding', searchType: 'manual', isDefaultLiquid: false },
    ],
  },
];

export interface LiabilityCategoryInfo {
  id: string;
  name: string;
  iconName: string;
  description: string;
  suggestedCreditors: string[];
}

export const LIABILITY_TAXONOMY: LiabilityCategoryInfo[] = [
  { id: 'Home Loan', name: 'Home Loan / Mortgage', iconName: 'home', description: 'Primary residence or investment property loan', suggestedCreditors: ['HDFC Ltd', 'SBI Home Loans', 'Chase Mortgage', 'Rocket Mortgage'] },
  { id: 'Personal Loan', name: 'Personal Loan', iconName: 'user', description: 'Unsecured personal bank loans or line of credit', suggestedCreditors: ['Bajaj Finserv', 'HDFC Bank', 'Marcus', 'SoFi'] },
  { id: 'Credit Card', name: 'Credit Card Outstanding', iconName: 'credit-card', description: 'Revolving balances & credit card dues', suggestedCreditors: ['American Express', 'Chase Sapphire', 'HDFC Infinia', 'Citi'] },
  { id: 'Auto Loan', name: 'Auto / Vehicle Loan', iconName: 'car', description: 'Car, bike or commercial vehicle finance', suggestedCreditors: ['Toyota Financial', 'HDFC Auto', 'Chase Auto', 'SBI Car Loan'] },
  { id: 'Student Loan', name: 'Education / Student Loan', iconName: 'graduation-cap', description: 'College, university or specialized studies loan', suggestedCreditors: ['Navient', 'Sallie Mae', 'SBI Scholar Loan', 'HDFC Credila'] },
  { id: 'Gold Loan', name: 'Gold Loan', iconName: 'gem', description: 'Loan secured against physical gold ornaments', suggestedCreditors: ['Muthoot Finance', 'Manappuram', 'SBI Gold Loan'] },
  { id: 'Loan Against Property', name: 'Loan Against Property (LAP)', iconName: 'building', description: 'Mortgage against commercial or residential property', suggestedCreditors: ['HDFC Bank', 'ICICI Bank', 'Axis Bank'] },
  { id: 'Buy Now Pay Later', name: 'Buy Now Pay Later (BNPL)', iconName: 'shopping-bag', description: 'Affirm, Klarna, Amazon PayLater or Simpl balances', suggestedCreditors: ['Affirm', 'Klarna', 'Afterpay', 'Amazon PayLater', 'Simpl'] },
  { id: 'Other Debt', name: 'Other Debt / Promissory Note', iconName: 'file-text', description: 'Family loans, peer-to-peer or informal liabilities', suggestedCreditors: ['Private Creditor', 'P2P Lending'] },
];
