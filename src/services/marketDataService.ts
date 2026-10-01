export interface MasterAsset {
  id: string; // Unique Master ID e.g. "NSE_RELIANCE", "MF_118968", "BSE_500325"
  asset_type: 'stock' | 'mutual_fund' | 'etf' | 'crypto' | 'commodity' | 'manual' | 'reit';
  name: string;
  symbol: string; // e.g. "RELIANCE", "118968", "TCS"
  isin?: string; // e.g. "INE002A01018"
  exchange: 'NSE' | 'BSE' | 'MF' | 'NASDAQ' | 'NYSE' | 'CRYPTO';
  data_source: 'NSE_LIVE' | 'BSE_FEED' | 'MFAPI_IN' | 'YAHOO_FINANCE' | 'MOCK_PROVIDER';
  isReit?: boolean;
  
  // Real-time / Daily Pricing
  latest_price: number; // in its native currency (INR/USD)
  previous_close?: number;
  price_change?: number; // Absolute change
  price_change_percent?: number; // Percentage change
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  data_status: 'Real-time' | 'Delayed' | 'Daily NAV' | 'Market Closed';
  last_updated: string; // Formatted timestamp or date string

  // Mutual Fund Specific
  scheme_name?: string;
  amc?: string;
  scheme_code?: string | number;
  plan?: 'Direct' | 'Regular';
  option?: 'Growth' | 'IDCW';
  category?: string;
  latest_nav?: number;
  nav_date?: string;
  nav_change?: number;
  nav_change_percent?: number;
  sector?: string;
}

export interface UserAssetHolding {
  id: string;
  user_id: string;
  asset_id: string; // References MasterAsset.id
  quantity: number; // units or shares
  average_price: number; // purchase price
  created_at: string;
  updated_at: string;
}

export interface IMarketDataProvider {
  searchAssets(query: string, filter?: string): Promise<MasterAsset[]>;
  getAssetQuote(symbol: string, exchange?: string, type?: string): Promise<MasterAsset | null>;
  getBatchQuotes(securities: Array<{ symbol: string; exchange?: string; type?: string; scheme_code?: string | number }>): Promise<Record<string, MasterAsset>>;
}

// -------------------------------------------------------------
// CURATED MASTER ASSETS CATALOG (INDIAN STOCKS, ETFS, MUTUAL FUNDS)
// -------------------------------------------------------------
export const MOCK_MASTER_ASSETS: MasterAsset[] = [
  // --- 🏢 REITs: Real Estate Investment Trusts ---
  {
    id: 'NSE_EMBASSY',
    asset_type: 'reit',
    name: 'Embassy Office Parks REIT',
    symbol: 'EMBASSY',
    isin: 'INE041025011',
    exchange: 'NSE',
    data_source: 'NSE_LIVE',
    latest_price: 388.50,
    previous_close: 386.00,
    price_change: 2.50,
    price_change_percent: 0.65,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Market Live',
    sector: 'Real Estate Investment Trust (Office)',
    isReit: true
  },
  {
    id: 'NSE_MINDSPACE',
    asset_type: 'reit',
    name: 'Mindspace Business Parks REIT',
    symbol: 'MINDSPACE',
    isin: 'INE0CCU25019',
    exchange: 'NSE',
    data_source: 'NSE_LIVE',
    latest_price: 362.00,
    previous_close: 360.55,
    price_change: 1.45,
    price_change_percent: 0.40,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Market Live',
    sector: 'Real Estate Investment Trust (Office)',
    isReit: true
  },
  {
    id: 'NSE_BIRET',
    asset_type: 'reit',
    name: 'Brookfield India Real Estate Trust',
    symbol: 'BIRET',
    isin: 'INE0HR325010',
    exchange: 'NSE',
    data_source: 'NSE_LIVE',
    latest_price: 265.20,
    previous_close: 262.95,
    price_change: 2.25,
    price_change_percent: 0.85,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Market Live',
    sector: 'Real Estate Investment Trust (Office)',
    isReit: true
  },
  {
    id: 'NSE_NEXUS',
    asset_type: 'reit',
    name: 'Nexus Select Trust REIT',
    symbol: 'NEXUS',
    isin: 'INE0NZL25010',
    exchange: 'NSE',
    data_source: 'NSE_LIVE',
    latest_price: 139.75,
    previous_close: 139.00,
    price_change: 0.75,
    price_change_percent: 0.55,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Market Live',
    sector: 'Real Estate Investment Trust (Retail Mall)',
    isReit: true
  },
  {
    id: 'NYSE_O',
    asset_type: 'reit',
    name: 'Realty Income Corp. (The Monthly Dividend Co.)',
    symbol: 'O',
    exchange: 'NYSE',
    data_source: 'YAHOO_FINANCE',
    latest_price: 54.80,
    previous_close: 54.61,
    price_change: 0.19,
    price_change_percent: 0.35,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Market Live',
    sector: 'Real Estate Investment Trust (Commercial)',
    isReit: true
  },
  {
    id: 'NYSE_PLD',
    asset_type: 'reit',
    name: 'Prologis, Inc. (Logistics & Industrial REIT)',
    symbol: 'PLD',
    exchange: 'NYSE',
    data_source: 'YAHOO_FINANCE',
    latest_price: 119.50,
    previous_close: 118.20,
    price_change: 1.30,
    price_change_percent: 1.10,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Market Live',
    sector: 'Real Estate Investment Trust (Industrial)',
    isReit: true
  },
  {
    id: 'NYSE_AMT',
    asset_type: 'reit',
    name: 'American Tower Corp. (Telecom Tower REIT)',
    symbol: 'AMT',
    exchange: 'NYSE',
    data_source: 'YAHOO_FINANCE',
    latest_price: 196.20,
    previous_close: 194.75,
    price_change: 1.45,
    price_change_percent: 0.75,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Market Live',
    sector: 'Real Estate Investment Trust (Infrastructure)',
    isReit: true
  },
  {
    id: 'NASDAQ_EQIX',
    asset_type: 'reit',
    name: 'Equinix, Inc. (Data Center REIT)',
    symbol: 'EQIX',
    exchange: 'NASDAQ',
    data_source: 'YAHOO_FINANCE',
    latest_price: 846.50,
    previous_close: 834.90,
    price_change: 11.60,
    price_change_percent: 1.40,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Market Live',
    sector: 'Real Estate Investment Trust (Data Centers)',
    isReit: true
  },
  // --- 🪙 Commodities: Live Gold & Silver Spot ---
  {
    id: 'COMMODITY_GOLD_GRAM',
    asset_type: 'commodity',
    name: 'Gold 24K Spot (per Gram)',
    symbol: 'GOLD-GRAM',
    exchange: 'COMMODITY' as any,
    data_source: 'YAHOO_FINANCE',
    latest_price: 12839.00,
    previous_close: 12825.00,
    price_change: 14.00,
    price_change_percent: 0.11,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Live Spot Exchange',
    sector: 'Precious Metals'
  },
  {
    id: 'COMMODITY_GOLD_10G',
    asset_type: 'commodity',
    name: 'Gold 24K Spot (10 Grams)',
    symbol: 'GOLD-10G',
    exchange: 'COMMODITY' as any,
    data_source: 'YAHOO_FINANCE',
    latest_price: 128390.00,
    previous_close: 128250.00,
    price_change: 140.00,
    price_change_percent: 0.11,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Live Spot Exchange',
    sector: 'Precious Metals'
  },
  {
    id: 'COMMODITY_GOLD_OZ',
    asset_type: 'commodity',
    name: 'Gold Spot (Troy Ounce - $)',
    symbol: 'GOLD-OZ',
    exchange: 'COMMODITY' as any,
    data_source: 'YAHOO_FINANCE',
    latest_price: 4165.75,
    previous_close: 4160.00,
    price_change: 5.75,
    price_change_percent: 0.14,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Live Spot Exchange',
    sector: 'Precious Metals'
  },
  {
    id: 'COMMODITY_SILVER_GRAM',
    asset_type: 'commodity',
    name: 'Silver Spot (per Gram)',
    symbol: 'SILVER-GRAM',
    exchange: 'COMMODITY' as any,
    data_source: 'YAHOO_FINANCE',
    latest_price: 187.50,
    previous_close: 189.20,
    price_change: -1.70,
    price_change_percent: -0.90,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Live Spot Exchange',
    sector: 'Precious Metals'
  },
  {
    id: 'COMMODITY_SILVER_KG',
    asset_type: 'commodity',
    name: 'Silver Spot (1 Kilogram)',
    symbol: 'SILVER-KG',
    exchange: 'COMMODITY' as any,
    data_source: 'YAHOO_FINANCE',
    latest_price: 187500.00,
    previous_close: 189200.00,
    price_change: -1700.00,
    price_change_percent: -0.90,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Live Spot Exchange',
    sector: 'Precious Metals'
  },
  {
    id: 'NSE_GOLDBEES',
    asset_type: 'commodity',
    name: 'Nippon India Gold BeES ETF',
    symbol: 'GOLDBEES',
    exchange: 'NSE',
    data_source: 'NSE_LIVE',
    latest_price: 68.45,
    previous_close: 68.10,
    price_change: 0.35,
    price_change_percent: 0.51,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Physical Gold 99.5%'
  },
  {
    id: 'NSE_SILVERBEES',
    asset_type: 'commodity',
    name: 'Nippon India Silver BeES ETF',
    symbol: 'SILVERBEES',
    exchange: 'NSE',
    data_source: 'NSE_LIVE',
    latest_price: 84.80,
    previous_close: 84.10,
    price_change: 0.70,
    price_change_percent: 0.83,
    currency: 'INR',
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Physical Silver 99.9%'
  },

  // --- ₿ Cryptocurrencies & Digital Assets ---
  {
    id: 'CRYPTO_BTC',
    asset_type: 'crypto',
    name: 'Bitcoin',
    symbol: 'BTC',
    exchange: 'CRYPTO',
    data_source: 'YAHOO_FINANCE',
    latest_price: 84140.00,
    previous_close: 82500.00,
    price_change: 1640.00,
    price_change_percent: 1.98,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Live Binance / Spot',
    sector: 'Layer 1 Digital Gold'
  },
  {
    id: 'CRYPTO_ETH',
    asset_type: 'crypto',
    name: 'Ethereum',
    symbol: 'ETH',
    exchange: 'CRYPTO',
    data_source: 'YAHOO_FINANCE',
    latest_price: 2683.50,
    previous_close: 2610.00,
    price_change: 73.50,
    price_change_percent: 2.82,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Live Binance / Spot',
    sector: 'Smart Contract Platform'
  },
  {
    id: 'CRYPTO_SOL',
    asset_type: 'crypto',
    name: 'Solana',
    symbol: 'SOL',
    exchange: 'CRYPTO',
    data_source: 'YAHOO_FINANCE',
    latest_price: 119.15,
    previous_close: 113.80,
    price_change: 5.35,
    price_change_percent: 4.70,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Live Binance / Spot',
    sector: 'High Performance L1'
  },
  {
    id: 'CRYPTO_XRP',
    asset_type: 'crypto',
    name: 'Ripple',
    symbol: 'XRP',
    exchange: 'CRYPTO',
    data_source: 'YAHOO_FINANCE',
    latest_price: 2.15,
    previous_close: 2.05,
    price_change: 0.10,
    price_change_percent: 4.88,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Live Binance / Spot',
    sector: 'Cross-Border Payments'
  },
  {
    id: 'CRYPTO_BNB',
    asset_type: 'crypto',
    name: 'Binance Coin',
    symbol: 'BNB',
    exchange: 'CRYPTO',
    data_source: 'YAHOO_FINANCE',
    latest_price: 615.40,
    previous_close: 605.00,
    price_change: 10.40,
    price_change_percent: 1.72,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Live Binance / Spot',
    sector: 'Exchange Utility Token'
  },
  {
    id: 'CRYPTO_DOGE',
    asset_type: 'crypto',
    name: 'Dogecoin',
    symbol: 'DOGE',
    exchange: 'CRYPTO',
    data_source: 'YAHOO_FINANCE',
    latest_price: 0.185,
    previous_close: 0.178,
    price_change: 0.007,
    price_change_percent: 3.93,
    currency: 'USD',
    data_status: 'Real-time',
    last_updated: 'Live Binance / Spot',
    sector: 'Meme & Payment Network'
  },

  // --- Indian Stocks (NSE & BSE) ---
  {
    id: 'NSE_RELIANCE',
    asset_type: 'stock',
    name: 'Reliance Industries Ltd',
    symbol: 'RELIANCE',
    isin: 'INE002A01018',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 1283.70,
    previous_close: 1282.20,
    price_change: 1.50,
    price_change_percent: 0.12,
    currency: 'INR',
    open: 1284.00,
    high: 1292.00,
    low: 1278.00,
    volume: 8452100,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Conglomerate & Telecom'
  },
  {
    id: 'BSE_500325',
    asset_type: 'stock',
    name: 'Reliance Industries Ltd',
    symbol: '500325',
    isin: 'INE002A01018',
    exchange: 'BSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 1283.10,
    previous_close: 1281.80,
    price_change: 1.30,
    price_change_percent: 0.10,
    currency: 'INR',
    open: 1283.50,
    high: 1291.50,
    low: 1277.50,
    volume: 1250400,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Conglomerate & Telecom'
  },
  {
    id: 'NSE_TCS',
    asset_type: 'stock',
    name: 'Tata Consultancy Services Ltd',
    symbol: 'TCS',
    isin: 'INE467B01029',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 4280.00,
    previous_close: 4241.80,
    price_change: 38.20,
    price_change_percent: 0.90,
    currency: 'INR',
    open: 4250.00,
    high: 4295.00,
    low: 4235.00,
    volume: 2415000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'IT Services'
  },
  {
    id: 'BSE_532540',
    asset_type: 'stock',
    name: 'Tata Consultancy Services Ltd',
    symbol: '532540',
    isin: 'INE467B01029',
    exchange: 'BSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 4279.10,
    previous_close: 4241.00,
    price_change: 38.10,
    price_change_percent: 0.90,
    currency: 'INR',
    open: 4249.00,
    high: 4294.00,
    low: 4234.00,
    volume: 410000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'IT Services'
  },
  {
    id: 'NSE_HDFCBANK',
    asset_type: 'stock',
    name: 'HDFC Bank Ltd',
    symbol: 'HDFCBANK',
    isin: 'INE040A01034',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 1655.40,
    previous_close: 1661.20,
    price_change: -5.80,
    price_change_percent: -0.35,
    currency: 'INR',
    open: 1660.00,
    high: 1668.50,
    low: 1648.00,
    volume: 14200000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Banking'
  },
  {
    id: 'BSE_500180',
    asset_type: 'stock',
    name: 'HDFC Bank Ltd',
    symbol: '500180',
    isin: 'INE040A01034',
    exchange: 'BSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 1655.10,
    previous_close: 1660.90,
    price_change: -5.80,
    price_change_percent: -0.35,
    currency: 'INR',
    open: 1659.00,
    high: 1668.00,
    low: 1647.50,
    volume: 2100000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Banking'
  },
  {
    id: 'NSE_ICICIBANK',
    asset_type: 'stock',
    name: 'ICICI Bank Ltd',
    symbol: 'ICICIBANK',
    isin: 'INE090A01021',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 1220.60,
    previous_close: 1211.50,
    price_change: 9.10,
    price_change_percent: 0.75,
    currency: 'INR',
    open: 1215.00,
    high: 1225.00,
    low: 1210.00,
    volume: 9800000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Banking'
  },
  {
    id: 'NSE_INFY',
    asset_type: 'stock',
    name: 'Infosys Ltd',
    symbol: 'INFY',
    isin: 'INE009A01021',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 1860.25,
    previous_close: 1826.45,
    price_change: 33.80,
    price_change_percent: 1.85,
    currency: 'INR',
    open: 1835.00,
    high: 1868.00,
    low: 1830.00,
    volume: 6700000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'IT Services'
  },
  {
    id: 'NSE_SBIN',
    asset_type: 'stock',
    name: 'State Bank of India',
    symbol: 'SBIN',
    isin: 'INE062A01020',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 824.50,
    previous_close: 815.15,
    price_change: 9.35,
    price_change_percent: 1.15,
    currency: 'INR',
    open: 818.00,
    high: 828.00,
    low: 816.00,
    volume: 18500000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'PSU Banking'
  },
  {
    id: 'NSE_BHARTIARTL',
    asset_type: 'stock',
    name: 'Bharti Airtel Ltd',
    symbol: 'BHARTIARTL',
    isin: 'INE397D01024',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 1520.00,
    previous_close: 1501.25,
    price_change: 18.75,
    price_change_percent: 1.25,
    currency: 'INR',
    open: 1505.00,
    high: 1525.00,
    low: 1500.00,
    volume: 4800000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Telecommunications'
  },
  {
    id: 'NSE_ITC',
    asset_type: 'stock',
    name: 'ITC Limited',
    symbol: 'ITC',
    isin: 'INE154A01025',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 498.40,
    previous_close: 496.42,
    price_change: 1.98,
    price_change_percent: 0.40,
    currency: 'INR',
    open: 497.00,
    high: 501.00,
    low: 495.50,
    volume: 12000000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'FMCG'
  },
  {
    id: 'NSE_LT',
    asset_type: 'stock',
    name: 'Larsen & Toubro Ltd',
    symbol: 'LT',
    isin: 'INE018A01030',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 3680.00,
    previous_close: 3630.90,
    price_change: 49.10,
    price_change_percent: 1.35,
    currency: 'INR',
    open: 3640.00,
    high: 3695.00,
    low: 3635.00,
    volume: 2100000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Infrastructure & Engineering'
  },
  {
    id: 'NSE_TATAMOTORS',
    asset_type: 'stock',
    name: 'Tata Motors Ltd',
    symbol: 'TATAMOTORS',
    isin: 'INE155A01022',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 1085.30,
    previous_close: 1063.00,
    price_change: 22.30,
    price_change_percent: 2.10,
    currency: 'INR',
    open: 1070.00,
    high: 1092.00,
    low: 1065.00,
    volume: 9500000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Automobile'
  },
  {
    id: 'NSE_NIFTYBEES',
    asset_type: 'etf',
    name: 'Nippon India Nifty 50 BeES ETF',
    symbol: 'NIFTYBEES',
    isin: 'INF732E01015',
    exchange: 'NSE',
    data_source: 'MOCK_PROVIDER',
    latest_price: 272.50,
    previous_close: 270.35,
    price_change: 2.15,
    price_change_percent: 0.80,
    currency: 'INR',
    open: 271.00,
    high: 273.50,
    low: 270.80,
    volume: 15400000,
    data_status: 'Real-time',
    last_updated: 'Today, 03:30 PM IST',
    sector: 'Index ETF'
  },

  // --- Indian Mutual Funds ---
  {
    id: 'MF_118968',
    asset_type: 'mutual_fund',
    name: 'HDFC Flexi Cap Fund - Direct Plan - Growth',
    scheme_name: 'HDFC Flexi Cap Fund',
    symbol: '118968',
    scheme_code: '118968',
    isin: 'INF179K01BE2',
    exchange: 'MF',
    data_source: 'MFAPI_IN',
    amc: 'HDFC Mutual Fund',
    plan: 'Direct',
    option: 'Growth',
    category: 'Flexi Cap Fund',
    latest_price: 1980.50,
    latest_nav: 1980.50,
    previous_close: 1963.80,
    price_change: 16.70,
    price_change_percent: 0.85,
    nav_change: 16.70,
    nav_change_percent: 0.85,
    currency: 'INR',
    nav_date: '28-Aug-2024',
    data_status: 'Daily NAV',
    last_updated: '28-Aug-2024',
    sector: 'Equity - Flexi Cap'
  },
  {
    id: 'MF_101662',
    asset_type: 'mutual_fund',
    name: 'HDFC Flexi Cap Fund - Regular Plan - Growth',
    scheme_name: 'HDFC Flexi Cap Fund',
    symbol: '101662',
    scheme_code: '101662',
    isin: 'INF179K01BB8',
    exchange: 'MF',
    data_source: 'MFAPI_IN',
    amc: 'HDFC Mutual Fund',
    plan: 'Regular',
    option: 'Growth',
    category: 'Flexi Cap Fund',
    latest_price: 1845.20,
    latest_nav: 1845.20,
    previous_close: 1830.40,
    price_change: 14.80,
    price_change_percent: 0.81,
    nav_change: 14.80,
    nav_change_percent: 0.81,
    currency: 'INR',
    nav_date: '28-Aug-2024',
    data_status: 'Daily NAV',
    last_updated: '28-Aug-2024',
    sector: 'Equity - Flexi Cap'
  },
  {
    id: 'MF_122639',
    asset_type: 'mutual_fund',
    name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth',
    scheme_name: 'Parag Parikh Flexi Cap Fund',
    symbol: '122639',
    scheme_code: '122639',
    isin: 'INF879O01027',
    exchange: 'MF',
    data_source: 'MFAPI_IN',
    amc: 'PPFAS Mutual Fund',
    plan: 'Direct',
    option: 'Growth',
    category: 'Flexi Cap Fund',
    latest_price: 82.45,
    latest_nav: 82.45,
    previous_close: 81.75,
    price_change: 0.70,
    price_change_percent: 0.85,
    nav_change: 0.70,
    nav_change_percent: 0.85,
    currency: 'INR',
    nav_date: '28-Aug-2024',
    data_status: 'Daily NAV',
    last_updated: '28-Aug-2024',
    sector: 'Equity - Flexi Cap'
  },
  {
    id: 'MF_119598',
    asset_type: 'mutual_fund',
    name: 'SBI Bluechip Fund - Direct Plan - Growth',
    scheme_name: 'SBI Bluechip Fund',
    symbol: '119598',
    scheme_code: '119598',
    isin: 'INF200K01RS4',
    exchange: 'MF',
    data_source: 'MFAPI_IN',
    amc: 'SBI Mutual Fund',
    plan: 'Direct',
    option: 'Growth',
    category: 'Large Cap Fund',
    latest_price: 98.20,
    latest_nav: 98.20,
    previous_close: 97.66,
    price_change: 0.54,
    price_change_percent: 0.55,
    nav_change: 0.54,
    nav_change_percent: 0.55,
    currency: 'INR',
    nav_date: '28-Aug-2024',
    data_status: 'Daily NAV',
    last_updated: '28-Aug-2024',
    sector: 'Equity - Large Cap'
  },
  {
    id: 'MF_120828',
    asset_type: 'mutual_fund',
    name: 'Quant Small Cap Fund - Direct Plan - Growth',
    scheme_name: 'Quant Small Cap Fund',
    symbol: '120828',
    scheme_code: '120828',
    isin: 'INF966L01AA3',
    exchange: 'MF',
    data_source: 'MFAPI_IN',
    amc: 'Quant Mutual Fund',
    plan: 'Direct',
    option: 'Growth',
    category: 'Small Cap Fund',
    latest_price: 268.10,
    latest_nav: 268.10,
    previous_close: 264.25,
    price_change: 3.85,
    price_change_percent: 1.45,
    nav_change: 3.85,
    nav_change_percent: 1.45,
    currency: 'INR',
    nav_date: '28-Aug-2024',
    data_status: 'Daily NAV',
    last_updated: '28-Aug-2024',
    sector: 'Equity - Small Cap'
  },
  {
    id: 'MF_118778',
    asset_type: 'mutual_fund',
    name: 'Nippon India Small Cap Fund - Direct Plan - Growth',
    scheme_name: 'Nippon India Small Cap Fund',
    symbol: '118778',
    scheme_code: '118778',
    isin: 'INF204K01T40',
    exchange: 'MF',
    data_source: 'MFAPI_IN',
    amc: 'Nippon India Mutual Fund',
    plan: 'Direct',
    option: 'Growth',
    category: 'Small Cap Fund',
    latest_price: 172.90,
    latest_nav: 172.90,
    previous_close: 170.85,
    price_change: 2.05,
    price_change_percent: 1.20,
    nav_change: 2.05,
    nav_change_percent: 1.20,
    currency: 'INR',
    nav_date: '28-Aug-2024',
    data_status: 'Daily NAV',
    last_updated: '28-Aug-2024',
    sector: 'Equity - Small Cap'
  },
  {
    id: 'MF_120716',
    asset_type: 'mutual_fund',
    name: 'UTI Nifty 50 Index Fund - Direct Plan - Growth',
    scheme_name: 'UTI Nifty 50 Index Fund',
    symbol: '120716',
    scheme_code: '120716',
    isin: 'INF789F01X41',
    exchange: 'MF',
    data_source: 'MFAPI_IN',
    amc: 'UTI Mutual Fund',
    plan: 'Direct',
    option: 'Growth',
    category: 'Index Fund',
    latest_price: 184.10,
    latest_nav: 184.10,
    previous_close: 182.65,
    price_change: 1.45,
    price_change_percent: 0.80,
    nav_change: 1.45,
    nav_change_percent: 0.80,
    currency: 'INR',
    nav_date: '28-Aug-2024',
    data_status: 'Daily NAV',
    last_updated: '28-Aug-2024',
    sector: 'Equity - Index Fund'
  }
];

// -------------------------------------------------------------
// MOCK MARKET DATA PROVIDER
// -------------------------------------------------------------
export class MockMarketDataProvider implements IMarketDataProvider {
  async searchAssets(query: string, filter?: string): Promise<MasterAsset[]> {
    const q = query.trim().toUpperCase();
    let list = MOCK_MASTER_ASSETS;

    if (filter === 'stock') {
      list = list.filter(a => a.asset_type === 'stock');
    } else if (filter === 'reit') {
      list = list.filter(a => a.asset_type === 'reit' || (a as any).isReit || /reit|real estate trust/i.test(a.name) || /reit/i.test(a.symbol));
    } else if (filter === 'etf') {
      list = list.filter(a => a.asset_type === 'etf');
    } else if (filter === 'mutual_fund') {
      list = list.filter(a => a.asset_type === 'mutual_fund');
    } else if (filter === 'equity_mf') {
      list = list.filter(a => a.asset_type === 'mutual_fund' && (/equity|flexi|small|mid|large|bluechip|cap|elss|index|focused|value/i.test(a.name) || /equity|flexi|small|mid|large|cap|index/i.test(a.category || '')));
    } else if (filter === 'hybrid_mf') {
      list = list.filter(a => a.asset_type === 'mutual_fund' && (/hybrid|balanced|multi|dynamic|advantage/i.test(a.name) || /hybrid|balanced/i.test(a.category || '')));
    } else if (filter === 'arbitrage_mf') {
      list = list.filter(a => a.asset_type === 'mutual_fund' && /arbitrage/i.test(a.name));
    } else if (filter === 'debt_mf') {
      list = list.filter(a => a.asset_type === 'mutual_fund' && (/debt|bond|gilt|income|short|duration|corporate|banking/i.test(a.name) || /debt|bond|gilt/i.test(a.category || '')));
    } else if (filter === 'liquid_mf') {
      list = list.filter(a => a.asset_type === 'mutual_fund' && (/liquid|overnight|money|cash|treasury/i.test(a.name) || /liquid|overnight/i.test(a.category || '')));
    }

    if (!q) {
      return list.slice(0, 15);
    }

    return list.filter(item => {
      const matchSymbol = item.symbol.toUpperCase().includes(q);
      const matchName = item.name.toUpperCase().includes(q);
      const matchIsin = item.isin ? item.isin.toUpperCase().includes(q) : false;
      const matchAmc = item.amc ? item.amc.toUpperCase().includes(q) : false;
      const matchSchemeCode = item.scheme_code ? String(item.scheme_code).includes(q) : false;
      const matchCategory = item.category ? item.category.toUpperCase().includes(q) : false;
      return matchSymbol || matchName || matchIsin || matchAmc || matchSchemeCode || matchCategory;
    });
  }

  async getAssetQuote(symbol: string, exchange?: string, type?: string): Promise<MasterAsset | null> {
    const clean = symbol.trim().toUpperCase();
    const found = MOCK_MASTER_ASSETS.find(
      a => a.symbol.toUpperCase() === clean || 
           (a.scheme_code && String(a.scheme_code) === clean) ||
           (a.isin && a.isin.toUpperCase() === clean)
    );
    if (found) return found;

    // Default mock asset
    return {
      id: `${exchange || 'NSE'}_${clean}`,
      asset_type: type === 'mutual_fund' ? 'mutual_fund' : 'stock',
      name: `${clean} Security`,
      symbol: clean,
      exchange: (exchange as any) || 'NSE',
      data_source: 'MOCK_PROVIDER',
      latest_price: 100.0,
      currency: exchange === 'NSE' || exchange === 'BSE' || exchange === 'MF' ? 'INR' : 'USD',
      data_status: 'Delayed',
      last_updated: new Date().toLocaleTimeString()
    };
  }

  async getBatchQuotes(securities: Array<{ symbol: string; exchange?: string; type?: string; scheme_code?: string | number }>): Promise<Record<string, MasterAsset>> {
    const map: Record<string, MasterAsset> = {};
    for (const s of securities) {
      const q = await this.getAssetQuote(s.symbol || String(s.scheme_code), s.exchange, s.type);
      if (q) {
        map[s.symbol.toUpperCase()] = q;
      }
    }
    return map;
  }
}

// -------------------------------------------------------------
// PRODUCTION MARKET DATA PROVIDER (Connects to /api/market & /api/mf)
// -------------------------------------------------------------
export class ProductionMarketDataProvider implements IMarketDataProvider {
  async searchAssets(query: string, filter?: string): Promise<MasterAsset[]> {
    const q = query.trim();
    
    // First, retrieve instant local mock matches for speed
    const mockProvider = new MockMarketDataProvider();
    const localMatches = await mockProvider.searchAssets(q, filter);

    if (!q) {
      return localMatches;
    }

    try {
      const isStockOnly = filter === 'stock';
      const isEtfOnly = filter === 'etf';
      const isReitOnly = filter === 'reit';
      const isMfOnly = filter === 'mutual_fund' || filter === 'equity_mf' || filter === 'hybrid_mf' || filter === 'arbitrage_mf' || filter === 'debt_mf' || filter === 'liquid_mf';

      // 1. Search Mutual Funds via backend /api/mf/search
      const mfSearchPromise = (!isStockOnly && !isEtfOnly && !isReitOnly) 
        ? fetch(`/api/mf/search?q=${encodeURIComponent(q)}`)
            .then(r => r.ok ? r.json() : { results: [] })
            .catch(() => ({ results: [] }))
        : Promise.resolve({ results: [] });

      // 2. Search Stocks & ETFs via backend /api/market/search (Yahoo/NSE/BSE)
      const stockSearchPromise = (!isMfOnly)
        ? fetch(`/api/market/search?q=${encodeURIComponent(q)}`)
            .then(r => r.ok ? r.json() : { results: [] })
            .catch(() => ({ results: [] }))
        : Promise.resolve({ results: [] });

      const [mfData, stockData] = await Promise.allSettled([mfSearchPromise, stockSearchPromise]);

      const liveResults: MasterAsset[] = [];

      // Process Mutual Fund search results
      if (mfData.status === 'fulfilled' && mfData.value?.results) {
        let mfList = mfData.value.results;
        if (filter === 'equity_mf') {
          mfList = mfList.filter((m: any) => /equity|flexi|small|mid|large|bluechip|cap|elss|index|focused|value/i.test(m.schemeName || m.name));
        } else if (filter === 'hybrid_mf') {
          mfList = mfList.filter((m: any) => /hybrid|balanced|multi|dynamic|advantage/i.test(m.schemeName || m.name));
        } else if (filter === 'arbitrage_mf') {
          mfList = mfList.filter((m: any) => /arbitrage/i.test(m.schemeName || m.name));
        } else if (filter === 'debt_mf') {
          mfList = mfList.filter((m: any) => /debt|bond|gilt|income|short|duration|corporate|banking/i.test(m.schemeName || m.name));
        } else if (filter === 'liquid_mf') {
          mfList = mfList.filter((m: any) => /liquid|overnight|money|cash|treasury/i.test(m.schemeName || m.name));
        }

        mfList.slice(0, 15).forEach((m: any) => {
          const isDirect = /direct/i.test(m.schemeName || m.name);
          const isGrowth = /growth/i.test(m.schemeName || m.name);
          liveResults.push({
            id: `MF_${m.schemeCode}`,
            asset_type: 'mutual_fund',
            name: m.schemeName || m.name,
            scheme_name: (m.schemeName || m.name).replace(/\s*-\s*(Direct|Regular).*$/i, '').trim(),
            symbol: String(m.schemeCode),
            scheme_code: m.schemeCode,
            exchange: 'MF',
            data_source: 'MFAPI_IN',
            plan: isDirect ? 'Direct' : 'Regular',
            option: isGrowth ? 'Growth' : 'IDCW',
            latest_price: 100.0,
            latest_nav: 100.0,
            currency: 'INR',
            data_status: 'Daily NAV',
            last_updated: 'Latest NAV',
            category: 'Mutual Fund'
          });
        });
      }

      // Process Stock search results
      if (stockData.status === 'fulfilled' && stockData.value?.results) {
        let stockList = stockData.value.results;
        if (isStockOnly) {
          stockList = stockList.filter((s: any) => s.type !== 'etf' && s.type !== 'reit');
        } else if (isEtfOnly) {
          stockList = stockList.filter((s: any) => s.type === 'etf' || /etf|bees/i.test(s.symbol) || /etf|bees/i.test(s.name));
        } else if (isReitOnly) {
          stockList = stockList.filter((s: any) => 
            s.type === 'reit' || 
            s.isReit || 
            /reit|real estate trust/i.test(s.name) || 
            /reit/i.test(s.ticker || s.symbol) ||
            ['EMBASSY', 'MINDSPACE', 'BIRET', 'NEXUS', 'O', 'PLD', 'AMT', 'EQIX', 'SPG', 'PSA', 'VICI', 'DLR'].includes(String(s.ticker || s.symbol).toUpperCase())
          );
        }

        stockList.slice(0, 15).forEach((s: any) => {
          const isIndian = s.exchange === 'NSE' || s.exchange === 'BSE' || s.country === 'IN' || s.currency === 'INR';
          const isReitItem = isReitOnly || s.type === 'reit' || s.isReit || /reit|real estate trust/i.test(s.name);
          liveResults.push({
            id: `${s.exchange || 'NSE'}_${s.ticker}`,
            asset_type: isReitItem ? 'reit' : (s.type === 'etf' ? 'etf' : 'stock'),
            name: s.name || s.ticker,
            symbol: s.ticker,
            exchange: s.exchange || (isIndian ? 'NSE' : 'NASDAQ'),
            data_source: isIndian ? 'NSE_LIVE' : 'YAHOO_FINANCE',
            latest_price: s.currentPrice || (s.currency === 'INR' ? 500.0 : 100.0),
            currency: s.currency || (isIndian ? 'INR' : 'USD'),
            data_status: 'Real-time',
            last_updated: 'Market Live',
            isReit: isReitItem
          });
        });
      }

      // Merge results avoiding duplicate symbols
      const seen = new Set<string>();
      const combined: MasterAsset[] = [];

      // Local curated assets take precedence for accurate ISIN and clean meta
      localMatches.forEach(item => {
        const key = `${item.exchange}_${item.symbol}`.toUpperCase();
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      });

      liveResults.forEach(item => {
        const key = `${item.exchange}_${item.symbol}`.toUpperCase();
        if (!seen.has(key)) {
          seen.add(key);
          combined.push(item);
        }
      });

      // Enrich top search results with live real-time quotes if available
      const topItems = combined.slice(0, 20);
      try {
        const batchQuotes = await this.getBatchQuotes(topItems.map(item => ({
          symbol: item.symbol,
          exchange: item.exchange,
          type: item.asset_type,
          scheme_code: item.scheme_code
        })));

        return topItems.map(item => {
          const live = batchQuotes[item.symbol.toUpperCase()] || (item.scheme_code ? batchQuotes[String(item.scheme_code).toUpperCase()] : null);
          if (live && live.latest_price > 0) {
            return {
              ...item,
              latest_price: live.latest_price,
              latest_nav: live.latest_nav || live.latest_price,
              previous_close: live.previous_close || item.previous_close,
              price_change: live.price_change !== undefined ? live.price_change : item.price_change,
              price_change_percent: live.price_change_percent !== undefined ? live.price_change_percent : item.price_change_percent,
              data_status: live.data_status || item.data_status,
              last_updated: live.last_updated || item.last_updated,
              isin: live.isin || item.isin
            };
          }
          return item;
        });
      } catch {
        return topItems;
      }
    } catch (e) {
      return localMatches;
    }
  }

  async getAssetQuote(symbol: string, exchange?: string, type?: string): Promise<MasterAsset | null> {
    const clean = symbol.trim().toUpperCase();
    try {
      const res = await fetch(`/api/market/quote?ticker=${encodeURIComponent(clean)}${exchange ? `&exchange=${encodeURIComponent(exchange)}` : ''}${type ? `&type=${encodeURIComponent(type)}` : ''}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.quote) {
          const q = json.quote;
          const isMF = q.type === 'mutual_fund' || exchange === 'MF';
          return {
            id: `${q.exchange || exchange || 'NSE'}_${clean}`,
            asset_type: isMF ? 'mutual_fund' : 'stock',
            name: q.name || clean,
            symbol: clean,
            scheme_code: q.schemeCode,
            isin: q.isin,
            amc: q.fundHouse,
            exchange: (q.exchange as any) || (exchange as any) || 'NSE',
            data_source: isMF ? 'MFAPI_IN' : 'NSE_LIVE',
            latest_price: q.currentPrice || q.nav || 100,
            previous_close: q.previousClose,
            price_change: q.priceChange24hAmount,
            price_change_percent: q.priceChange24h,
            latest_nav: q.nav,
            nav_date: q.navDate,
            currency: q.currency || 'INR',
            data_status: isMF ? 'Daily NAV' : 'Real-time',
            last_updated: q.marketTime ? new Date(q.marketTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'
          };
        }
      }
    } catch (err) {
      // Fallback
    }

    const mockProvider = new MockMarketDataProvider();
    return mockProvider.getAssetQuote(clean, exchange, type);
  }

  async getBatchQuotes(securities: Array<{ symbol: string; exchange?: string; type?: string; scheme_code?: string | number }>): Promise<Record<string, MasterAsset>> {
    const map: Record<string, MasterAsset> = {};
    try {
      const res = await fetch('/api/market/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          securities: securities.map(s => ({
            ticker: s.symbol,
            exchange: s.exchange,
            type: s.type,
            schemeCode: s.scheme_code
          }))
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.quotes) {
          Object.entries(data.quotes).forEach(([key, q]: [string, any]) => {
            const isMF = q.type === 'mutual_fund' || q.exchange === 'MF';
            map[key.toUpperCase()] = {
              id: `${q.exchange || 'NSE'}_${key}`,
              asset_type: isMF ? 'mutual_fund' : 'stock',
              name: q.name || key,
              symbol: key,
              scheme_code: q.schemeCode,
              isin: q.isin,
              amc: q.fundHouse,
              exchange: (q.exchange as any) || 'NSE',
              data_source: isMF ? 'MFAPI_IN' : 'NSE_LIVE',
              latest_price: q.currentPrice || q.nav || 100,
              previous_close: q.previousClose,
              price_change: q.priceChange24hAmount,
              price_change_percent: q.priceChange24h,
              currency: q.currency || 'INR',
              data_status: isMF ? 'Daily NAV' : 'Real-time',
              last_updated: 'Just now'
            };
          });
        }
      }
    } catch (e) {
      // Fallback
    }

    // Fill missing with mock provider
    const mock = new MockMarketDataProvider();
    for (const s of securities) {
      const key = s.symbol.toUpperCase();
      if (!map[key]) {
        const item = await mock.getAssetQuote(s.symbol, s.exchange, s.type);
        if (item) map[key] = item;
      }
    }

    return map;
  }
}

// -------------------------------------------------------------
// UNIFIED MARKET DATA SERVICE
// -------------------------------------------------------------
class MarketDataService {
  private provider: IMarketDataProvider;
  private isDevelopmentMode: boolean = false;

  constructor() {
    // Default to ProductionMarketDataProvider which leverages free live endpoints (mfapi.in + live market routes)
    // and seamlessly uses mock fallback
    this.provider = new ProductionMarketDataProvider();
  }

  public setDevelopmentMode(enabled: boolean) {
    this.isDevelopmentMode = enabled;
    if (enabled) {
      this.provider = new MockMarketDataProvider();
    } else {
      this.provider = new ProductionMarketDataProvider();
    }
  }

  public getIsDevelopmentMode(): boolean {
    return this.isDevelopmentMode;
  }

  public async search(query: string, filter?: string): Promise<MasterAsset[]> {
    return this.provider.searchAssets(query, filter);
  }

  public async getQuote(symbol: string, exchange?: string, type?: string): Promise<MasterAsset | null> {
    return this.provider.getAssetQuote(symbol, exchange, type);
  }

  public async getBatchQuotes(securities: Array<{ symbol: string; exchange?: string; type?: string; scheme_code?: string | number }>): Promise<Record<string, MasterAsset>> {
    return this.provider.getBatchQuotes(securities);
  }
}

export const marketDataService = new MarketDataService();

/**
 * Generates an external link to view security on Google Finance
 */
export function getGoogleFinanceUrl(symbol: string, exchange?: string, name?: string): string {
  const clean = symbol.trim().toUpperCase();
  if (clean.startsWith('GOLD') || clean === 'XAU' || clean === 'PAXG') {
    return 'https://www.google.com/finance/quote/GCW00:COMEX';
  }
  if (clean.startsWith('SILVER') || clean === 'XAG') {
    return 'https://www.google.com/finance/quote/SIW00:COMEX';
  }
  if (exchange === 'CRYPTO' || ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'BNB', 'ADA', 'AVAX', 'DOT', 'LINK', 'MATIC', 'PEPE', 'SHIB', 'SUI'].includes(clean)) {
    return `https://www.google.com/finance/quote/${clean}-USD`;
  }
  if (exchange === 'MF' || exchange === 'mutual_fund' || /^\d{5,7}$/.test(clean)) {
    if (name) {
      return `https://www.google.com/search?q=${encodeURIComponent(name + ' nav google finance')}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(clean + ' mutual fund nav google finance')}`;
  }
  if (exchange === 'BSE' || /^\d{6}$/.test(clean)) {
    return `https://www.google.com/finance/quote/${clean}:BOM`;
  }
  if (exchange === 'NSE' || exchange === 'stock' || !exchange) {
    return `https://www.google.com/finance/quote/${clean}:NSE`;
  }
  if (exchange === 'NASDAQ' || exchange === 'NYSE' || exchange === 'NYSEARCA') {
    return `https://www.google.com/finance/quote/${clean}:${exchange}`;
  }
  return `https://www.google.com/finance/quote/${clean}`;
}
