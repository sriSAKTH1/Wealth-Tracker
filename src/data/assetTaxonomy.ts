export interface AssetCategoryInfo {
  id: string;
  name: string;
  countLabel: string;
  iconName: 'trending-up' | 'landmark' | 'home' | 'gem' | 'wallet' | 'bitcoin' | 'layers' | 'plus';
  description: string;
  color: string;
  subTypes: {
    id: string;
    name: string;
    description?: string;
    suggestedInstitutions?: string[];
    isDefaultLiquid?: boolean;
  }[];
}

export const ASSET_TAXONOMY: AssetCategoryInfo[] = [
  {
    id: 'Equity',
    name: 'Equity',
    countLabel: '10 types',
    iconName: 'trending-up',
    description: 'Stocks, mutual funds, ETFs, RSUs & equity investments',
    color: '#3B82F6',
    subTypes: [
      { id: 'direct-stock', name: 'Direct Stock', suggestedInstitutions: ['Zerodha', 'Groww', 'Robinhood', 'Fidelity', 'Charles Schwab', 'Interactive Brokers'] },
      { id: 'equity-mf', name: 'Equity Mutual Fund', suggestedInstitutions: ['Vanguard', 'Fidelity', 'Mirae Asset', 'HDFC Mutual Fund', 'SBI Mutual Fund', 'BlackRock'] },
      { id: 'hybrid-mf', name: 'Hybrid Mutual Fund', suggestedInstitutions: ['ICICI Prudential', 'HDFC Hybrid', 'Vanguard Balanced'] },
      { id: 'arbitrage-fund', name: 'Arbitrage Fund', suggestedInstitutions: ['Kotak Equity Arbitrage', 'SBI Arbitrage'] },
      { id: 'etf', name: 'ETF', suggestedInstitutions: ['Vanguard (VOO/VTI)', 'BlackRock iShares', 'Invesco (QQQ)', 'Nippon India ETF'] },
      { id: 'esop-rsu', name: 'ESOP / RSU', suggestedInstitutions: ['Carta', 'Shareworks', 'E*TRADE Corporate', 'Morgan Stanley at Work'], isDefaultLiquid: false },
      { id: 'unlisted-equity', name: 'Unlisted Equity', suggestedInstitutions: ['AngelList', 'Private Market', 'Pre-IPO Desk'], isDefaultLiquid: false },
      { id: 'nps', name: 'NPS', suggestedInstitutions: ['NSDL / CRA', 'KFintech', 'HDFC Pension Fund'], isDefaultLiquid: false },
      { id: 'ulip', name: 'ULIP', suggestedInstitutions: ['HDFC Life', 'ICICI Prudential Life', 'Max Life'], isDefaultLiquid: false },
      { id: 'pms-aif', name: 'PMS / AIF', suggestedInstitutions: ['Marcellus', 'ASK Investment Managers', 'WhiteOak Capital', 'IIFL Wealth'], isDefaultLiquid: false },
    ],
  },
  {
    id: 'Debt',
    name: 'Debt',
    countLabel: '17 types',
    iconName: 'landmark',
    description: 'Fixed deposits, government & corporate bonds, provident funds',
    color: '#10B981',
    subTypes: [
      { id: 'fixed-deposit', name: 'Fixed Deposit (FD)', suggestedInstitutions: ['HDFC Bank', 'ICICI Bank', 'SBI', 'Chase', 'Marcus by Goldman'] },
      { id: 'recurring-deposit', name: 'Recurring Deposit (RD)', suggestedInstitutions: ['HDFC Bank', 'State Bank of India', 'Axis Bank'] },
      { id: 'ppf', name: 'Public Provident Fund (PPF)', suggestedInstitutions: ['SBI PPF', 'Post Office', 'HDFC PPF'], isDefaultLiquid: false },
      { id: 'epf', name: 'Employee Provident Fund (EPF)', suggestedInstitutions: ['EPFO Unified Portal', 'Govt Provident Fund'], isDefaultLiquid: false },
      { id: 'vpf', name: 'Voluntary Provident Fund (VPF)', suggestedInstitutions: ['EPFO Portal'], isDefaultLiquid: false },
      { id: 'sgb-debt', name: 'Sovereign Gold Bond (SGB)', suggestedInstitutions: ['RBI / Sovereign Issue', 'Zerodha', 'Groww'] },
      { id: 'corporate-bond', name: 'Corporate Bonds', suggestedInstitutions: ['Wint Wealth', 'GoldenPi', 'Fidelity Bonds', 'Grip Invest'] },
      { id: 'govt-bond', name: 'Government Securities (G-Sec)', suggestedInstitutions: ['RBI Retail Direct', 'US Treasury Direct', 'Zerodha Coin'] },
      { id: 'debt-mf', name: 'Debt Mutual Fund', suggestedInstitutions: ['Aditya Birla Sun Life', 'HDFC Short Term', 'Vanguard Bond Index'] },
      { id: 'liquid-fund', name: 'Liquid Mutual Fund', suggestedInstitutions: ['Quantum Liquid', 'Nippon India Liquid', 'Vanguard Cash Plus'] },
      { id: 'overnight-fund', name: 'Overnight Fund', suggestedInstitutions: ['SBI Overnight Fund', 'ICICI Overnight'] },
      { id: 'ssy', name: 'Sukanya Samriddhi (SSY)', suggestedInstitutions: ['Post Office', 'SBI', 'PNB'], isDefaultLiquid: false },
      { id: 'scss', name: 'Senior Citizen Savings (SCSS)', suggestedInstitutions: ['Post Office', 'SBI', 'Canara Bank'], isDefaultLiquid: false },
      { id: 'pomis', name: 'Post Office Monthly Income (POMIS)', suggestedInstitutions: ['India Post / National Savings'], isDefaultLiquid: false },
      { id: 'kvp', name: 'Kisan Vikas Patra (KVP)', suggestedInstitutions: ['India Post'], isDefaultLiquid: false },
      { id: 'nsc', name: 'National Savings Certificate (NSC)', suggestedInstitutions: ['India Post'], isDefaultLiquid: false },
      { id: 'gratuity', name: 'Gratuity / Pension Trust', suggestedInstitutions: ['Employer Trust', 'LIC Group Pension'], isDefaultLiquid: false },
    ],
  },
  {
    id: 'Real Estate',
    name: 'Real Estate',
    countLabel: '2 types',
    iconName: 'home',
    description: 'Residential, commercial properties, plots and land holdings',
    color: '#8B5CF6',
    subTypes: [
      { id: 'residential-prop', name: 'Residential Property', isDefaultLiquid: false },
      { id: 'commercial-prop', name: 'Commercial Property', isDefaultLiquid: false },
      { id: 'land-plot', name: 'Land / Open Plot', isDefaultLiquid: false },
      { id: 'reit', name: 'REITs (Real Estate Trusts)', suggestedInstitutions: ['Embassy REIT', 'Mindspace REIT', 'Prologis', 'Realty Income Corp'] },
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
      { id: 'physical-gold', name: 'Physical Gold (Jewelry/Coins)', isDefaultLiquid: true },
      { id: 'sgb-commodity', name: 'Sovereign Gold Bond (SGB)', suggestedInstitutions: ['RBI Retail Direct', 'Zerodha', 'Stock Broker'] },
      { id: 'digital-gold', name: 'Digital Gold (MMTC-PAMP / SafeGold)', suggestedInstitutions: ['Jar', 'Paytm Gold', 'PhonePe', 'MMTC-PAMP'] },
      { id: 'silver-metals', name: 'Silver & Precious Metals', suggestedInstitutions: ['Physical Vault', 'Silver ETF / Fund'] },
    ],
  },
  {
    id: 'Cash & Savings',
    name: 'Cash & Savings',
    countLabel: '',
    iconName: 'wallet',
    description: 'Bank savings, checking accounts, emergency liquid cash',
    color: '#06B6D4',
    subTypes: [
      { id: 'savings-acc', name: 'Bank Savings Account', suggestedInstitutions: ['HDFC Bank', 'Chase', 'Bank of America', 'ICICI Bank', 'Wells Fargo'] },
      { id: 'checking-acc', name: 'Checking Account', suggestedInstitutions: ['Chase', 'Bank of America', 'Citibank', 'Standard Chartered'] },
      { id: 'cash-vault', name: 'Physical Cash in Hand / Vault', isDefaultLiquid: true },
      { id: 'emergency-reserve', name: 'Emergency Liquid Reserve', isDefaultLiquid: true },
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
      { id: 'crypto-spot', name: 'Crypto Coins & Tokens (BTC, ETH, SOL)', suggestedInstitutions: ['Coinbase', 'Binance', 'Ledger Hardware', 'Kraken', 'CoinDCX'] },
      { id: 'defi-staked', name: 'DeFi Staking & Web3 Protocol Assets', suggestedInstitutions: ['Metamask', 'Phantom', 'Lido Finance', 'Uniswap'] },
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
      { id: 'private-equity', name: 'Private Equity / Startup Angels', suggestedInstitutions: ['AngelList Syndicate', 'LetsVenture', 'Republic', 'SeedInvest'], isDefaultLiquid: false },
      { id: 'art-collectibles', name: 'Art, Wine & Luxury Collectibles', suggestedInstitutions: ['Masterworks', 'Sotheby’s', 'Private Collection'], isDefaultLiquid: false },
    ],
  },
  {
    id: 'Other',
    name: 'Other',
    countLabel: '',
    iconName: 'plus',
    description: 'Vehicles, automobiles, jewelry and custom valuable assets',
    color: '#64748B',
    subTypes: [
      { id: 'vehicles', name: 'Vehicles & Automobiles', isDefaultLiquid: false },
      { id: 'valuables', name: 'Jewelry & High-Value Assets', isDefaultLiquid: false },
      { id: 'custom-asset', name: 'Custom Asset Holding', isDefaultLiquid: false },
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
