export interface MarketSecurity {
  ticker: string;
  name: string;
  exchange: 'NSE' | 'BSE' | 'NASDAQ' | 'NYSE' | 'CRYPTO' | 'COMMODITY' | 'INDEX' | 'MF';
  type: 'stock' | 'etf' | 'crypto' | 'mutual_fund' | 'commodity' | 'reit';
  currentPrice: number; // in its native currency
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  priceChange24h: number; // percentage, e.g. +1.45
  priceChange24hAmount: number; // absolute amount
  sector?: string;
  fundHouse?: string;
  schemeCode?: number | string;
  country: 'IN' | 'US' | 'GLOBAL';
  popular?: boolean;
  isReit?: boolean;
}

export const POPULAR_MARKET_SECURITIES: MarketSecurity[] = [
  // ==========================================
  // 🏢 REAL ESTATE INVESTMENT TRUSTS (REITs)
  // ==========================================
  { ticker: 'EMBASSY', name: 'Embassy Office Parks REIT', exchange: 'NSE', type: 'reit', currentPrice: 388.50, currency: 'INR', priceChange24h: 0.65, priceChange24hAmount: 2.50, sector: 'Real Estate Investment Trust (Office)', country: 'IN', popular: true, isReit: true },
  { ticker: 'MINDSPACE', name: 'Mindspace Business Parks REIT', exchange: 'NSE', type: 'reit', currentPrice: 362.00, currency: 'INR', priceChange24h: 0.40, priceChange24hAmount: 1.45, sector: 'Real Estate Investment Trust (Office)', country: 'IN', popular: true, isReit: true },
  { ticker: 'BIRET', name: 'Brookfield India Real Estate Trust', exchange: 'NSE', type: 'reit', currentPrice: 265.20, currency: 'INR', priceChange24h: 0.85, priceChange24hAmount: 2.25, sector: 'Real Estate Investment Trust (Office)', country: 'IN', popular: true, isReit: true },
  { ticker: 'NEXUS', name: 'Nexus Select Trust REIT', exchange: 'NSE', type: 'reit', currentPrice: 139.75, currency: 'INR', priceChange24h: 0.55, priceChange24hAmount: 0.75, sector: 'Real Estate Investment Trust (Retail Mall)', country: 'IN', popular: true, isReit: true },
  { ticker: 'O', name: 'Realty Income Corp. (The Monthly Dividend Co.)', exchange: 'NYSE', type: 'reit', currentPrice: 54.80, currency: 'USD', priceChange24h: 0.35, priceChange24hAmount: 0.19, sector: 'Real Estate Investment Trust (Commercial)', country: 'US', popular: true, isReit: true },
  { ticker: 'PLD', name: 'Prologis, Inc. (Logistics & Industrial REIT)', exchange: 'NYSE', type: 'reit', currentPrice: 119.50, currency: 'USD', priceChange24h: 1.10, priceChange24hAmount: 1.30, sector: 'Real Estate Investment Trust (Industrial)', country: 'US', popular: true, isReit: true },
  { ticker: 'AMT', name: 'American Tower Corp. (Telecom Tower REIT)', exchange: 'NYSE', type: 'reit', currentPrice: 196.20, currency: 'USD', priceChange24h: 0.75, priceChange24hAmount: 1.45, sector: 'Real Estate Investment Trust (Infrastructure)', country: 'US', popular: true, isReit: true },
  { ticker: 'EQIX', name: 'Equinix, Inc. (Data Center REIT)', exchange: 'NASDAQ', type: 'reit', currentPrice: 846.50, currency: 'USD', priceChange24h: 1.40, priceChange24hAmount: 11.60, sector: 'Real Estate Investment Trust (Data Centers)', country: 'US', popular: true, isReit: true },
  { ticker: 'SPG', name: 'Simon Property Group, Inc. (Mall REIT)', exchange: 'NYSE', type: 'reit', currentPrice: 159.40, currency: 'USD', priceChange24h: 0.90, priceChange24hAmount: 1.40, sector: 'Real Estate Investment Trust (Retail)', country: 'US', isReit: true },
  { ticker: 'PSA', name: 'Public Storage (Self-Storage REIT)', exchange: 'NYSE', type: 'reit', currentPrice: 288.00, currency: 'USD', priceChange24h: 0.45, priceChange24hAmount: 1.30, sector: 'Real Estate Investment Trust (Storage)', country: 'US', isReit: true },
  { ticker: 'VICI', name: 'VICI Properties Inc. (Gaming & Hospitality REIT)', exchange: 'NYSE', type: 'reit', currentPrice: 32.80, currency: 'USD', priceChange24h: 0.60, priceChange24hAmount: 0.20, sector: 'Real Estate Investment Trust (Experiential)', country: 'US', isReit: true },
  { ticker: 'DLR', name: 'Digital Realty Trust, Inc. (Data Center REIT)', exchange: 'NYSE', type: 'reit', currentPrice: 156.40, currency: 'USD', priceChange24h: 1.25, priceChange24hAmount: 1.95, sector: 'Real Estate Investment Trust (Data Centers)', country: 'US', isReit: true },

  // ==========================================
  // 🇮🇳 ALL MAJOR INDIAN STOCKS (NSE / BSE)
  // ==========================================

  // --- Banking & Financial Services ---
  { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1655.40, currency: 'INR', priceChange24h: -0.35, priceChange24hAmount: -5.80, sector: 'Private Banking', country: 'IN', popular: true },
  { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1220.60, currency: 'INR', priceChange24h: 0.75, priceChange24hAmount: 9.10, sector: 'Private Banking', country: 'IN', popular: true },
  { ticker: 'SBIN', name: 'State Bank of India', exchange: 'NSE', type: 'stock', currentPrice: 824.50, currency: 'INR', priceChange24h: 1.15, priceChange24hAmount: 9.35, sector: 'Public Sector Banking', country: 'IN', popular: true },
  { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE', type: 'stock', currentPrice: 1810.00, currency: 'INR', priceChange24h: 0.40, priceChange24hAmount: 7.20, sector: 'Private Banking', country: 'IN', popular: true },
  { ticker: 'AXISBANK', name: 'Axis Bank Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1185.75, currency: 'INR', priceChange24h: 0.65, priceChange24hAmount: 7.65, sector: 'Private Banking', country: 'IN', popular: true },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 6890.00, currency: 'INR', priceChange24h: 1.80, priceChange24hAmount: 121.70, sector: 'NBFC & Consumer Finance', country: 'IN', popular: true },
  { ticker: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1845.20, currency: 'INR', priceChange24h: 1.25, priceChange24hAmount: 22.75, sector: 'Financial Conglomerate', country: 'IN' },
  { ticker: 'JIOFIN', name: 'Jio Financial Services Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 328.40, currency: 'INR', priceChange24h: 2.10, priceChange24hAmount: 6.75, sector: 'Fintech & Non-Banking Finance', country: 'IN', popular: true },
  { ticker: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1420.30, currency: 'INR', priceChange24h: -0.80, priceChange24hAmount: -11.45, sector: 'Private Banking', country: 'IN' },
  { ticker: 'BANKBARODA', name: 'Bank of Baroda', exchange: 'NSE', type: 'stock', currentPrice: 248.60, currency: 'INR', priceChange24h: 0.90, priceChange24hAmount: 2.20, sector: 'PSU Banking', country: 'IN' },
  { ticker: 'PNB', name: 'Punjab National Bank', exchange: 'NSE', type: 'stock', currentPrice: 112.40, currency: 'INR', priceChange24h: 1.40, priceChange24hAmount: 1.55, sector: 'PSU Banking', country: 'IN' },
  { ticker: 'CHOLAFIN', name: 'Cholamandalam Investment & Finance', exchange: 'NSE', type: 'stock', currentPrice: 1460.00, currency: 'INR', priceChange24h: 1.10, priceChange24hAmount: 15.90, sector: 'Vehicle Finance', country: 'IN' },
  { ticker: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1890.50, currency: 'INR', priceChange24h: 0.85, priceChange24hAmount: 15.95, sector: 'Gold Loans', country: 'IN' },
  { ticker: 'SHRIRAMFIN', name: 'Shriram Finance Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 3120.00, currency: 'INR', priceChange24h: 1.30, priceChange24hAmount: 40.05, sector: 'Commercial NBFC', country: 'IN' },

  // --- IT & Software Services ---
  { ticker: 'TCS', name: 'Tata Consultancy Services Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 4280.00, currency: 'INR', priceChange24h: 0.90, priceChange24hAmount: 38.20, sector: 'IT Services & Consulting', country: 'IN', popular: true },
  { ticker: 'INFY', name: 'Infosys Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1860.25, currency: 'INR', priceChange24h: 1.85, priceChange24hAmount: 33.80, sector: 'IT Services & Software', country: 'IN', popular: true },
  { ticker: 'HCLTECH', name: 'HCL Technologies Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1740.50, currency: 'INR', priceChange24h: 1.10, priceChange24hAmount: 18.90, sector: 'IT Services', country: 'IN', popular: true },
  { ticker: 'WIPRO', name: 'Wipro Limited', exchange: 'NSE', type: 'stock', currentPrice: 535.80, currency: 'INR', priceChange24h: 0.45, priceChange24hAmount: 2.40, sector: 'IT & Cloud Services', country: 'IN', popular: true },
  { ticker: 'TECHM', name: 'Tech Mahindra Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1580.00, currency: 'INR', priceChange24h: 1.65, priceChange24hAmount: 25.65, sector: 'Telecom & IT Services', country: 'IN' },
  { ticker: 'LTIM', name: 'LTIMindtree Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 5920.00, currency: 'INR', priceChange24h: 1.20, priceChange24hAmount: 70.20, sector: 'IT Solutions', country: 'IN' },
  { ticker: 'PERSISTENT', name: 'Persistent Systems Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 5120.00, currency: 'INR', priceChange24h: 2.40, priceChange24hAmount: 120.00, sector: 'Digital Engineering', country: 'IN' },
  { ticker: 'COFORGE', name: 'Coforge Limited', exchange: 'NSE', type: 'stock', currentPrice: 6780.00, currency: 'INR', priceChange24h: 1.95, priceChange24hAmount: 129.80, sector: 'IT Services', country: 'IN' },
  { ticker: 'TATAELXSI', name: 'Tata Elxsi Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 7650.00, currency: 'INR', priceChange24h: 0.70, priceChange24hAmount: 53.20, sector: 'Design & Engineering Tech', country: 'IN' },
  { ticker: 'KPITTECH', name: 'KPIT Technologies Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1720.00, currency: 'INR', priceChange24h: 2.30, priceChange24hAmount: 38.70, sector: 'Automotive Software', country: 'IN' },
  { ticker: 'ZOMATO', name: 'Zomato Limited (Blinkit)', exchange: 'NSE', type: 'stock', currentPrice: 262.50, currency: 'INR', priceChange24h: 3.45, priceChange24hAmount: 8.75, sector: 'Food Delivery & Quick Commerce', country: 'IN', popular: true },
  { ticker: 'NAUKRI', name: 'Info Edge (India) Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 7450.00, currency: 'INR', priceChange24h: 1.50, priceChange24hAmount: 110.00, sector: 'Internet & Recruitment', country: 'IN' },
  { ticker: 'PAYTM', name: 'One 97 Communications (Paytm)', exchange: 'NSE', type: 'stock', currentPrice: 654.00, currency: 'INR', priceChange24h: 2.80, priceChange24hAmount: 17.80, sector: 'Fintech Payments', country: 'IN' },
  { ticker: 'NYKAA', name: 'FSN E-Commerce (Nykaa)', exchange: 'NSE', type: 'stock', currentPrice: 204.30, currency: 'INR', priceChange24h: 1.15, priceChange24hAmount: 2.32, sector: 'E-Commerce & Beauty', country: 'IN' },

  // --- Energy, Oil & Power ---
  { ticker: 'RELIANCE', name: 'Reliance Industries Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1283.70, currency: 'INR', priceChange24h: 0.12, priceChange24hAmount: 1.50, sector: 'Conglomerate, Oil & Telecom (Jio)', country: 'IN', popular: true },
  { ticker: 'ONGC', name: 'Oil and Natural Gas Corp.', exchange: 'NSE', type: 'stock', currentPrice: 328.70, currency: 'INR', priceChange24h: 1.60, priceChange24hAmount: 5.15, sector: 'Oil Exploration & Gas', country: 'IN', popular: true },
  { ticker: 'NTPC', name: 'NTPC Limited', exchange: 'NSE', type: 'stock', currentPrice: 412.30, currency: 'INR', priceChange24h: 1.45, priceChange24hAmount: 5.90, sector: 'Power Generation & Green Energy', country: 'IN', popular: true },
  { ticker: 'POWERGRID', name: 'Power Grid Corp. of India', exchange: 'NSE', type: 'stock', currentPrice: 342.80, currency: 'INR', priceChange24h: 0.80, priceChange24hAmount: 2.70, sector: 'Power Transmission', country: 'IN', popular: true },
  { ticker: 'COALINDIA', name: 'Coal India Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 518.40, currency: 'INR', priceChange24h: 1.05, priceChange24hAmount: 5.40, sector: 'Mining & Coal Energy', country: 'IN', popular: true },
  { ticker: 'BPCL', name: 'Bharat Petroleum Corp. Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 356.20, currency: 'INR', priceChange24h: 0.95, priceChange24hAmount: 3.35, sector: 'Oil Refining & Marketing', country: 'IN' },
  { ticker: 'IOC', name: 'Indian Oil Corporation', exchange: 'NSE', type: 'stock', currentPrice: 178.50, currency: 'INR', priceChange24h: 0.50, priceChange24hAmount: 0.90, sector: 'Oil & Gas', country: 'IN' },
  { ticker: 'TATAPOWER', name: 'Tata Power Company Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 438.90, currency: 'INR', priceChange24h: 2.35, priceChange24hAmount: 10.05, sector: 'Solar, EV & Renewable Power', country: 'IN', popular: true },
  { ticker: 'SUZLON', name: 'Suzlon Energy Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 82.40, currency: 'INR', priceChange24h: 4.85, priceChange24hAmount: 3.80, sector: 'Wind Turbine Renewable', country: 'IN', popular: true },
  { ticker: 'IREDA', name: 'Indian Renewable Energy Dev Agency', exchange: 'NSE', type: 'stock', currentPrice: 236.70, currency: 'INR', priceChange24h: 3.10, priceChange24hAmount: 7.10, sector: 'Green Energy Financing', country: 'IN', popular: true },
  { ticker: 'ADANIENT', name: 'Adani Enterprises Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 3045.00, currency: 'INR', priceChange24h: 1.75, priceChange24hAmount: 52.30, sector: 'Infrastructure & Airports', country: 'IN', popular: true },
  { ticker: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1485.60, currency: 'INR', priceChange24h: 1.10, priceChange24hAmount: 16.15, sector: 'Ports & Logistics', country: 'IN', popular: true },
  { ticker: 'ADANIGREEN', name: 'Adani Green Energy Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1890.00, currency: 'INR', priceChange24h: 2.15, priceChange24hAmount: 39.80, sector: 'Renewable Power', country: 'IN' },

  // --- Automotive & Mobility ---
  { ticker: 'TATAMOTORS', name: 'Tata Motors Ltd. (JLR & EV)', exchange: 'NSE', type: 'stock', currentPrice: 1085.30, currency: 'INR', priceChange24h: 2.10, priceChange24hAmount: 22.30, sector: 'Commercial & Passenger Auto', country: 'IN', popular: true },
  { ticker: 'M&M', name: 'Mahindra & Mahindra Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 2780.00, currency: 'INR', priceChange24h: 1.85, priceChange24hAmount: 50.50, sector: 'SUVs & Farm Equipment', country: 'IN', popular: true },
  { ticker: 'MARUTI', name: 'Maruti Suzuki India Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 12450.00, currency: 'INR', priceChange24h: 0.70, priceChange24hAmount: 86.60, sector: 'Automobile Manufacturing', country: 'IN', popular: true },
  { ticker: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 10450.00, currency: 'INR', priceChange24h: 1.40, priceChange24hAmount: 144.30, sector: '2-Wheelers & 3-Wheelers', country: 'IN' },
  { ticker: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 5320.00, currency: 'INR', priceChange24h: 0.95, priceChange24hAmount: 50.10, sector: '2-Wheelers', country: 'IN' },
  { ticker: 'EICHERMOT', name: 'Eicher Motors Ltd. (Royal Enfield)', exchange: 'NSE', type: 'stock', currentPrice: 4890.00, currency: 'INR', priceChange24h: 1.20, priceChange24hAmount: 58.00, sector: 'Premium Motorcycles & Trucks', country: 'IN' },
  { ticker: 'TVSMOTOR', name: 'TVS Motor Company Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 2540.00, currency: 'INR', priceChange24h: 1.75, priceChange24hAmount: 43.60, sector: '2-Wheelers & EV', country: 'IN' },
  { ticker: 'MOTHERSON', name: 'Samvardhana Motherson Int.', exchange: 'NSE', type: 'stock', currentPrice: 198.50, currency: 'INR', priceChange24h: 1.50, priceChange24hAmount: 2.95, sector: 'Auto Ancillaries', country: 'IN' },

  // --- Metals, Mining & Cement ---
  { ticker: 'TATASTEEL', name: 'Tata Steel Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 154.20, currency: 'INR', priceChange24h: 1.45, priceChange24hAmount: 2.20, sector: 'Steel & Metals', country: 'IN', popular: true },
  { ticker: 'JSWSTEEL', name: 'JSW Steel Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 945.80, currency: 'INR', priceChange24h: 0.85, priceChange24hAmount: 7.95, sector: 'Steel Manufacturing', country: 'IN' },
  { ticker: 'HINDALCO', name: 'Hindalco Industries Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 685.40, currency: 'INR', priceChange24h: 1.65, priceChange24hAmount: 11.10, sector: 'Aluminium & Copper', country: 'IN', popular: true },
  { ticker: 'VEDL', name: 'Vedanta Limited', exchange: 'NSE', type: 'stock', currentPrice: 462.50, currency: 'INR', priceChange24h: 2.40, priceChange24hAmount: 10.85, sector: 'Diversified Metals & Mining', country: 'IN' },
  { ticker: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 11250.00, currency: 'INR', priceChange24h: 0.90, priceChange24hAmount: 100.30, sector: 'Cement & Building Materials', country: 'IN', popular: true },
  { ticker: 'GRASIM', name: 'Grasim Industries Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 2680.00, currency: 'INR', priceChange24h: 1.10, priceChange24hAmount: 29.20, sector: 'Viscose & Paints (Birla Opus)', country: 'IN' },

  // --- FMCG, Retail & Consumer Goods ---
  { ticker: 'ITC', name: 'ITC Limited', exchange: 'NSE', type: 'stock', currentPrice: 498.40, currency: 'INR', priceChange24h: 0.40, priceChange24hAmount: 1.98, sector: 'FMCG, Hotels & Paper', country: 'IN', popular: true },
  { ticker: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 2785.00, currency: 'INR', priceChange24h: 0.60, priceChange24hAmount: 16.60, sector: 'Household & Personal Care', country: 'IN', popular: true },
  { ticker: 'TITAN', name: 'Titan Company Ltd. (Tanishq)', exchange: 'NSE', type: 'stock', currentPrice: 3580.00, currency: 'INR', priceChange24h: 1.35, priceChange24hAmount: 47.70, sector: 'Jewellery & Watches', country: 'IN', popular: true },
  { ticker: 'TRENT', name: 'Trent Ltd. (Zudio & Westside)', exchange: 'NSE', type: 'stock', currentPrice: 7120.00, currency: 'INR', priceChange24h: 3.20, priceChange24hAmount: 220.80, sector: 'Apparel Retail & Fashion', country: 'IN', popular: true },
  { ticker: 'DMART', name: 'Avenue Supermarts Ltd. (DMart)', exchange: 'NSE', type: 'stock', currentPrice: 4920.00, currency: 'INR', priceChange24h: 1.05, priceChange24hAmount: 51.20, sector: 'Hypermarkets & Grocery', country: 'IN', popular: true },
  { ticker: 'NESTLEIND', name: 'Nestle India Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 2510.00, currency: 'INR', priceChange24h: 0.35, priceChange24hAmount: 8.70, sector: 'Food & Nutrition (Maggi)', country: 'IN' },
  { ticker: 'BRITANNIA', name: 'Britannia Industries Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 5890.00, currency: 'INR', priceChange24h: 0.80, priceChange24hAmount: 46.80, sector: 'Bakery & Biscuits', country: 'IN' },
  { ticker: 'TATACONSUM', name: 'Tata Consumer Products Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1190.00, currency: 'INR', priceChange24h: 1.25, priceChange24hAmount: 14.70, sector: 'Tea, Salt & Beverages', country: 'IN' },
  { ticker: 'VBL', name: 'Varun Beverages Ltd. (Pepsi Bottler)', exchange: 'NSE', type: 'stock', currentPrice: 1540.00, currency: 'INR', priceChange24h: 2.10, priceChange24hAmount: 31.70, sector: 'Beverages & Soft Drinks', country: 'IN', popular: true },
  { ticker: 'ASIANPAINT', name: 'Asian Paints Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 3120.00, currency: 'INR', priceChange24h: 0.50, priceChange24hAmount: 15.50, sector: 'Decorative Coatings & Paints', country: 'IN', popular: true },
  { ticker: 'PIDILITIND', name: 'Pidilite Industries (Fevicol)', exchange: 'NSE', type: 'stock', currentPrice: 3190.00, currency: 'INR', priceChange24h: 0.75, priceChange24hAmount: 23.80, sector: 'Adhesives & Construction Chemicals', country: 'IN' },
  { ticker: 'POLYCAB', name: 'Polycab India Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 6780.00, currency: 'INR', priceChange24h: 1.90, priceChange24hAmount: 126.50, sector: 'Wires & Cables Fast Moving Elec', country: 'IN' },

  // --- Healthcare, Pharma & Hospitals ---
  { ticker: 'SUNPHARMA', name: 'Sun Pharmaceutical Ind. Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 1780.00, currency: 'INR', priceChange24h: 1.20, priceChange24hAmount: 21.10, sector: 'Specialty Pharmaceuticals', country: 'IN', popular: true },
  { ticker: 'CIPLA', name: 'Cipla Limited', exchange: 'NSE', type: 'stock', currentPrice: 1610.00, currency: 'INR', priceChange24h: 0.85, priceChange24hAmount: 13.55, sector: 'Respiratory & Generics', country: 'IN' },
  { ticker: 'DRREDDY', name: "Dr. Reddy's Laboratories", exchange: 'NSE', type: 'stock', currentPrice: 6890.00, currency: 'INR', priceChange24h: 0.90, priceChange24hAmount: 61.50, sector: 'Formulations & Biosimilars', country: 'IN' },
  { ticker: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', exchange: 'NSE', type: 'stock', currentPrice: 6740.00, currency: 'INR', priceChange24h: 1.45, priceChange24hAmount: 96.40, sector: 'Multi-Specialty Hospitals & 24/7', country: 'IN', popular: true },
  { ticker: 'DIVISLAB', name: "Divi's Laboratories Ltd.", exchange: 'NSE', type: 'stock', currentPrice: 4890.00, currency: 'INR', priceChange24h: 1.10, priceChange24hAmount: 53.20, sector: 'Active Pharma Ingredients (API)', country: 'IN' },
  { ticker: 'MANKIND', name: 'Mankind Pharma Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 2430.00, currency: 'INR', priceChange24h: 1.80, priceChange24hAmount: 43.00, sector: 'Consumer Healthcare', country: 'IN' },

  // --- Infrastructure, Defense, Real Estate & Capital Goods ---
  { ticker: 'LT', name: 'Larsen & Toubro Ltd. (L&T)', exchange: 'NSE', type: 'stock', currentPrice: 3680.00, currency: 'INR', priceChange24h: 1.35, priceChange24hAmount: 49.10, sector: 'EPC Engineering & Mega Infrastructure', country: 'IN', popular: true },
  { ticker: 'HAL', name: 'Hindustan Aeronautics Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 4680.00, currency: 'INR', priceChange24h: 2.80, priceChange24hAmount: 127.40, sector: 'Defense Aerospace & Fighter Jets', country: 'IN', popular: true },
  { ticker: 'BEL', name: 'Bharat Electronics Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 302.50, currency: 'INR', priceChange24h: 2.25, priceChange24hAmount: 6.65, sector: 'Defense Avionics & Radar', country: 'IN', popular: true },
  { ticker: 'BHEL', name: 'Bharat Heavy Electricals Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 295.00, currency: 'INR', priceChange24h: 1.70, priceChange24hAmount: 4.95, sector: 'Heavy Engineering & Turbines', country: 'IN' },
  { ticker: 'IRCTC', name: 'Indian Railway Catering & Tourism', exchange: 'NSE', type: 'stock', currentPrice: 940.00, currency: 'INR', priceChange24h: 0.65, priceChange24hAmount: 6.10, sector: 'Rail Ticketing & Tourism Monopoly', country: 'IN', popular: true },
  { ticker: 'RVNL', name: 'Rail Vikas Nigam Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 568.00, currency: 'INR', priceChange24h: 3.80, priceChange24hAmount: 20.80, sector: 'Railway Infrastructure Projects', country: 'IN', popular: true },
  { ticker: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 4520.00, currency: 'INR', priceChange24h: 3.50, priceChange24hAmount: 153.00, sector: 'Naval Warships & Submarines', country: 'IN', popular: true },
  { ticker: 'DLF', name: 'DLF Limited', exchange: 'NSE', type: 'stock', currentPrice: 875.00, currency: 'INR', priceChange24h: 1.90, priceChange24hAmount: 16.30, sector: 'Luxury Real Estate Developer', country: 'IN', popular: true },
  { ticker: 'GODREJPROP', name: 'Godrej Properties Ltd.', exchange: 'NSE', type: 'stock', currentPrice: 2980.00, currency: 'INR', priceChange24h: 1.45, priceChange24hAmount: 42.60, sector: 'Residential Real Estate', country: 'IN' },
  { ticker: 'BHARTIARTL', name: 'Bharti Airtel Ltd. (5G)', exchange: 'NSE', type: 'stock', currentPrice: 1520.00, currency: 'INR', priceChange24h: 1.25, priceChange24hAmount: 18.75, sector: 'Telecommunications & Broadband', country: 'IN', popular: true },

  // --- Indian ETFs & Index Funds ---
  { ticker: 'NIFTYBEES', name: 'Nippon India Nifty 50 BeES ETF', exchange: 'NSE', type: 'etf', currentPrice: 272.50, currency: 'INR', priceChange24h: 0.80, priceChange24hAmount: 2.15, sector: 'Nifty 50 Benchmark Index', country: 'IN', popular: true },
  { ticker: 'BANKBEES', name: 'Nippon India Bank BeES ETF', exchange: 'NSE', type: 'etf', currentPrice: 540.20, currency: 'INR', priceChange24h: 0.70, priceChange24hAmount: 3.75, sector: 'Nifty Bank Index', country: 'IN', popular: true },
  { ticker: 'ITBEES', name: 'Nippon India IT BeES ETF', exchange: 'NSE', type: 'etf', currentPrice: 42.80, currency: 'INR', priceChange24h: 1.20, priceChange24hAmount: 0.51, sector: 'Nifty IT Index', country: 'IN', popular: true },
  { ticker: 'JUNIORBEES', name: 'Nippon India Nifty Next 50 ETF', exchange: 'NSE', type: 'etf', currentPrice: 780.00, currency: 'INR', priceChange24h: 1.10, priceChange24hAmount: 8.50, sector: 'Nifty Next 50 Index', country: 'IN' },
  { ticker: 'GOLDBEES', name: 'Nippon India Gold BeES ETF', exchange: 'NSE', type: 'commodity', currentPrice: 68.40, currency: 'INR', priceChange24h: 0.45, priceChange24hAmount: 0.31, sector: 'Physical Gold 99.5%', country: 'IN', popular: true },
  { ticker: 'SILVERBEES', name: 'Nippon India Silver BeES ETF', exchange: 'NSE', type: 'commodity', currentPrice: 84.50, currency: 'INR', priceChange24h: 1.20, priceChange24hAmount: 1.00, sector: 'Physical Silver 99.9%', country: 'IN' },
  { ticker: 'CPSEETF', name: 'CPSE ETF (PSU Maharatna Index)', exchange: 'NSE', type: 'etf', currentPrice: 94.20, currency: 'INR', priceChange24h: 1.35, priceChange24hAmount: 1.25, sector: 'Govt PSUs Index', country: 'IN', popular: true },
  { ticker: 'MON100', name: 'Motilal Oswal Nasdaq 100 ETF', exchange: 'NSE', type: 'etf', currentPrice: 156.40, currency: 'INR', priceChange24h: 1.15, priceChange24hAmount: 1.77, sector: 'US Nasdaq 100 in INR', country: 'IN' },

  // ==========================================
  // 🇮🇳 INDIAN EQUITY MUTUAL FUNDS (via mfapi.in)
  // ==========================================
  { 
    ticker: '122639', 
    schemeCode: 122639, 
    name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 82.45, 
    currency: 'INR', 
    priceChange24h: 0.85, 
    priceChange24hAmount: 0.70, 
    sector: 'Equity - Flexi Cap', 
    fundHouse: 'PPFAS Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '120828', 
    schemeCode: 120828, 
    name: 'Quant Small Cap Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 268.10, 
    currency: 'INR', 
    priceChange24h: 1.45, 
    priceChange24hAmount: 3.85, 
    sector: 'Equity - Small Cap', 
    fundHouse: 'Quant Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '118834', 
    schemeCode: 118834, 
    name: 'Mirae Asset Large & Midcap Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 146.30, 
    currency: 'INR', 
    priceChange24h: 0.75, 
    priceChange24hAmount: 1.10, 
    sector: 'Equity - Large & Mid Cap', 
    fundHouse: 'Mirae Asset Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '118778', 
    schemeCode: 118778, 
    name: 'Nippon India Small Cap Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 172.90, 
    currency: 'INR', 
    priceChange24h: 1.20, 
    priceChange24hAmount: 2.05, 
    sector: 'Equity - Small Cap', 
    fundHouse: 'Nippon India Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '118989', 
    schemeCode: 118989, 
    name: 'HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 194.50, 
    currency: 'INR', 
    priceChange24h: 0.95, 
    priceChange24hAmount: 1.85, 
    sector: 'Equity - Mid Cap', 
    fundHouse: 'HDFC Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '120586', 
    schemeCode: 120586, 
    name: 'ICICI Prudential Bluechip Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 118.60, 
    currency: 'INR', 
    priceChange24h: 0.65, 
    priceChange24hAmount: 0.77, 
    sector: 'Equity - Large Cap', 
    fundHouse: 'ICICI Prudential Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '127042', 
    schemeCode: 127042, 
    name: 'Motilal Oswal Midcap Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 112.40, 
    currency: 'INR', 
    priceChange24h: 1.15, 
    priceChange24hAmount: 1.28, 
    sector: 'Equity - Mid Cap', 
    fundHouse: 'Motilal Oswal Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '119598', 
    schemeCode: 119598, 
    name: 'SBI Bluechip Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 98.20, 
    currency: 'INR', 
    priceChange24h: 0.55, 
    priceChange24hAmount: 0.54, 
    sector: 'Equity - Large Cap', 
    fundHouse: 'SBI Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '120716', 
    schemeCode: 120716, 
    name: 'UTI Nifty 50 Index Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 184.10, 
    currency: 'INR', 
    priceChange24h: 0.80, 
    priceChange24hAmount: 1.45, 
    sector: 'Equity - Index Fund', 
    fundHouse: 'UTI Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '125354', 
    schemeCode: 125354, 
    name: 'Axis Small Cap Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 104.75, 
    currency: 'INR', 
    priceChange24h: 0.90, 
    priceChange24hAmount: 0.94, 
    sector: 'Equity - Small Cap', 
    fundHouse: 'Axis Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '135783', 
    schemeCode: 135783, 
    name: 'Tata Digital India Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 52.80, 
    currency: 'INR', 
    priceChange24h: 1.30, 
    priceChange24hAmount: 0.68, 
    sector: 'Sectoral - Technology', 
    fundHouse: 'Tata Mutual Fund',
    country: 'IN', 
    popular: true 
  },
  { 
    ticker: '118968', 
    schemeCode: 118968, 
    name: 'HDFC Flexi Cap Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 1980.50, 
    currency: 'INR', 
    priceChange24h: 0.85, 
    priceChange24hAmount: 16.70, 
    sector: 'Equity - Flexi Cap', 
    fundHouse: 'HDFC Mutual Fund',
    country: 'IN' 
  },
  { 
    ticker: '120166', 
    schemeCode: 120166, 
    name: 'Kotak Emerging Equity Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 132.40, 
    currency: 'INR', 
    priceChange24h: 1.05, 
    priceChange24hAmount: 1.38, 
    sector: 'Equity - Mid Cap', 
    fundHouse: 'Kotak Mahindra Mutual Fund',
    country: 'IN' 
  },
  { 
    ticker: '147622', 
    schemeCode: 147622, 
    name: 'Bandhan Small Cap Fund - Direct Plan - Growth', 
    exchange: 'MF', 
    type: 'mutual_fund', 
    currentPrice: 42.15, 
    currency: 'INR', 
    priceChange24h: 1.10, 
    priceChange24hAmount: 0.46, 
    sector: 'Equity - Small Cap', 
    fundHouse: 'Bandhan Mutual Fund',
    country: 'IN' 
  },

  // ==========================================
  // 🇺🇸 US TECH, INDICES & GLOBAL EQUITIES
  // ==========================================
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'stock', currentPrice: 228.40, currency: 'USD', priceChange24h: 1.45, priceChange24hAmount: 3.26, sector: 'Consumer Tech & Ecosystem', country: 'US', popular: true },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', type: 'stock', currentPrice: 128.90, currency: 'USD', priceChange24h: 3.12, priceChange24hAmount: 3.90, sector: 'Semiconductors & AI GPUs', country: 'US', popular: true },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', type: 'stock', currentPrice: 448.20, currency: 'USD', priceChange24h: 0.85, priceChange24hAmount: 3.78, sector: 'Enterprise Cloud & OpenAI', country: 'US', popular: true },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Google)', exchange: 'NASDAQ', type: 'stock', currentPrice: 182.60, currency: 'USD', priceChange24h: -0.42, priceChange24hAmount: -0.77, sector: 'Search & Cloud AI', country: 'US', popular: true },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'stock', currentPrice: 186.50, currency: 'USD', priceChange24h: 1.15, priceChange24hAmount: 2.12, sector: 'E-Commerce & AWS Cloud', country: 'US', popular: true },
  { ticker: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', type: 'stock', currentPrice: 535.80, currency: 'USD', priceChange24h: 2.20, priceChange24hAmount: 11.53, sector: 'Social Media & Llama AI', country: 'US', popular: true },
  { ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'stock', currentPrice: 218.70, currency: 'USD', priceChange24h: -1.80, priceChange24hAmount: -4.01, sector: 'Automotive & Clean Energy', country: 'US', popular: true },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', exchange: 'NYSE', type: 'etf', currentPrice: 512.40, currency: 'USD', priceChange24h: 0.72, priceChange24hAmount: 3.66, sector: 'Broad Market S&P 500', country: 'US', popular: true },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE', type: 'etf', currentPrice: 558.10, currency: 'USD', priceChange24h: 0.70, priceChange24hAmount: 3.88, sector: 'Broad Market S&P 500', country: 'US', popular: true },

  // ==========================================
  // ₿ CRYPTO & DIGITAL ASSETS
  // ==========================================
  { ticker: 'BTC', name: 'Bitcoin', exchange: 'CRYPTO', type: 'crypto', currentPrice: 84140.00, currency: 'USD', priceChange24h: 2.85, priceChange24hAmount: 2330.00, sector: 'Layer 1 Digital Gold', country: 'GLOBAL', popular: true },
  { ticker: 'ETH', name: 'Ethereum', exchange: 'CRYPTO', type: 'crypto', currentPrice: 2683.50, currency: 'USD', priceChange24h: 3.40, priceChange24hAmount: 88.30, sector: 'Smart Contract Platform', country: 'GLOBAL', popular: true },
  { ticker: 'SOL', name: 'Solana', exchange: 'CRYPTO', type: 'crypto', currentPrice: 119.15, currency: 'USD', priceChange24h: 5.10, priceChange24hAmount: 5.75, sector: 'High Speed L1', country: 'GLOBAL', popular: true },
  { ticker: 'XRP', name: 'Ripple', exchange: 'CRYPTO', type: 'crypto', currentPrice: 2.15, currency: 'USD', priceChange24h: 4.80, priceChange24hAmount: 0.10, sector: 'Cross-Border Payments', country: 'GLOBAL', popular: true },
  { ticker: 'BNB', name: 'Binance Coin', exchange: 'CRYPTO', type: 'crypto', currentPrice: 615.00, currency: 'USD', priceChange24h: 1.10, priceChange24hAmount: 6.70, sector: 'Exchange Ecosystem', country: 'GLOBAL' },
  { ticker: 'DOGE', name: 'Dogecoin', exchange: 'CRYPTO', type: 'crypto', currentPrice: 0.185, currency: 'USD', priceChange24h: 3.90, priceChange24hAmount: 0.007, sector: 'Meme & Payment Network', country: 'GLOBAL' },

  // ==========================================
  // 🪙 COMMODITIES (GOLD & SILVER SPOT)
  // ==========================================
  { ticker: 'GOLD', name: 'Gold 24K Spot (Gram)', exchange: 'COMMODITY', type: 'commodity', currentPrice: 12839.00, currency: 'INR', priceChange24h: 0.45, priceChange24hAmount: 57.50, sector: 'Physical Gold 24K', country: 'GLOBAL', popular: true },
  { ticker: 'GOLD-OZ', name: 'Gold Spot (Troy Ounce)', exchange: 'COMMODITY', type: 'commodity', currentPrice: 4165.75, currency: 'USD', priceChange24h: 0.45, priceChange24hAmount: 18.70, sector: 'Precious Metals', country: 'GLOBAL', popular: true },
  { ticker: 'SILVER', name: 'Silver Spot (Gram)', exchange: 'COMMODITY', type: 'commodity', currentPrice: 187.50, currency: 'INR', priceChange24h: -0.90, priceChange24hAmount: -1.70, sector: 'Physical Silver 99.9%', country: 'GLOBAL', popular: true },
  { ticker: 'SILVER-OZ', name: 'Silver Spot (Troy Ounce)', exchange: 'COMMODITY', type: 'commodity', currentPrice: 60.62, currency: 'USD', priceChange24h: -0.90, priceChange24hAmount: -0.55, sector: 'Precious Metals', country: 'GLOBAL' },
  { ticker: 'SILVER-KG', name: 'Silver Spot (Kilogram)', exchange: 'COMMODITY', type: 'commodity', currentPrice: 187500.00, currency: 'INR', priceChange24h: -0.90, priceChange24hAmount: -1700.00, sector: 'Precious Metals', country: 'GLOBAL' },
];

export type MarketRegionFilter = 'all' | 'india' | 'mf' | 'us' | 'crypto' | 'commodity' | 'etf';

/**
 * Searches the market securities catalog by query and optional region filter.
 */
export function searchMarketSecurities(query: string, region: MarketRegionFilter = 'all'): MarketSecurity[] {
  const trimmed = query.trim().toUpperCase();
  
  let list = POPULAR_MARKET_SECURITIES;

  if (region === 'india') {
    list = list.filter(s => (s.country === 'IN' || s.exchange === 'NSE' || s.exchange === 'BSE') && s.type !== 'mutual_fund');
  } else if (region === 'mf') {
    list = list.filter(s => s.type === 'mutual_fund' || s.exchange === 'MF');
  } else if (region === 'us') {
    list = list.filter(s => s.country === 'US' || s.exchange === 'NASDAQ' || s.exchange === 'NYSE');
  } else if (region === 'crypto') {
    list = list.filter(s => s.type === 'crypto');
  } else if (region === 'commodity') {
    list = list.filter(s => s.type === 'commodity');
  } else if (region === 'etf') {
    list = list.filter(s => s.type === 'etf' || s.ticker.includes('BEES'));
  }

  if (!trimmed) {
    return list.slice(0, 15);
  }

  return list.filter(s => 
    s.ticker.toUpperCase().includes(trimmed) || 
    s.name.toUpperCase().includes(trimmed) ||
    (s.sector && s.sector.toUpperCase().includes(trimmed)) ||
    (s.fundHouse && s.fundHouse.toUpperCase().includes(trimmed))
  );
}

/**
 * Gets or creates a market security quote.
 * Handles Indian NSE/BSE stocks, Mutual Funds, US stocks, Cryptos, and custom quotes.
 */
export function getMarketQuote(ticker: string, exchange?: string): MarketSecurity {
  const cleanTicker = ticker.trim().toUpperCase();
  const existing = POPULAR_MARKET_SECURITIES.find(
    s => s.ticker.toUpperCase() === cleanTicker || 
         s.name.toUpperCase() === cleanTicker ||
         (s.schemeCode && String(s.schemeCode) === cleanTicker)
  );

  if (existing) {
    // Add realistic tiny market fluctuation on refresh (e.g. ±0.2% - 1.5%)
    const randomPercentDelta = (Math.random() * 1.2 - 0.5) * (Math.random() > 0.5 ? 1 : -1);
    const updatedPrice = Math.max(0.01, existing.currentPrice * (1 + randomPercentDelta / 100));
    const priceChange = existing.priceChange24h + randomPercentDelta * 0.4;
    const priceChangeAmount = updatedPrice * (priceChange / 100);

    return {
      ...existing,
      currentPrice: Math.round(updatedPrice * 100) / 100,
      priceChange24h: Math.round(priceChange * 100) / 100,
      priceChange24hAmount: Math.round(priceChangeAmount * 100) / 100,
    };
  }

  // Default fallback for custom or unlisted Indian / US ticker / Mutual Fund
  const isMF = exchange === 'MF' || /^\d{5,7}$/.test(cleanTicker);
  const isLikelyIndian = isMF || exchange === 'NSE' || exchange === 'BSE' || cleanTicker.endsWith('.NS') || cleanTicker.endsWith('.BO');
  return {
    ticker: cleanTicker,
    name: isMF ? `Indian Mutual Fund (${cleanTicker})` : `${cleanTicker} Holding`,
    exchange: (exchange as any) || (isMF ? 'MF' : isLikelyIndian ? 'NSE' : 'NASDAQ'),
    type: isMF ? 'mutual_fund' : 'stock',
    currentPrice: isMF ? 100.00 : isLikelyIndian ? 500.00 : 100.00,
    currency: isLikelyIndian ? 'INR' : 'USD',
    priceChange24h: 0.5,
    priceChange24hAmount: isMF ? 0.5 : isLikelyIndian ? 2.5 : 0.5,
    country: isLikelyIndian ? 'IN' : 'US',
  };
}

/**
 * Fetches real-time live market quote or mutual fund NAV from backend /api/market/quote with fallback.
 */
export async function fetchLiveQuoteAsync(
  ticker: string, 
  exchange?: string, 
  type?: string
): Promise<MarketSecurity> {
  const cleanTicker = ticker.trim().toUpperCase();
  try {
    const res = await fetch(`/api/market/quote?ticker=${encodeURIComponent(cleanTicker)}${exchange ? `&exchange=${encodeURIComponent(exchange)}` : ''}${type ? `&type=${encodeURIComponent(type)}` : ''}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.quote) {
        const q = data.quote;
        return {
          ticker: cleanTicker,
          name: q.name || q.symbol || cleanTicker,
          exchange: (q.exchange as any) || (exchange as any) || 'NSE',
          type: (q.type as any) || (type as any) || 'stock',
          currentPrice: q.currentPrice || q.nav || 100,
          currency: q.currency || (exchange === 'NSE' || exchange === 'BSE' || exchange === 'MF' ? 'INR' : 'USD'),
          priceChange24h: q.priceChange24h,
          priceChange24hAmount: q.priceChange24hAmount,
          sector: q.schemeCategory || q.sector,
          fundHouse: q.fundHouse,
          schemeCode: q.schemeCode,
          country: (exchange === 'NSE' || exchange === 'BSE' || exchange === 'MF' || q.currency === 'INR') ? 'IN' : 'US',
        };
      }
    }
  } catch (err) {
    // Silently fall back to offline/catalog computation
  }

  return getMarketQuote(cleanTicker, exchange);
}

/**
 * Fetches real-time live quotes in batch from backend /api/market/quotes
 */
export async function fetchLiveQuotesBatchAsync(
  securities: Array<{ ticker: string; exchange?: string; type?: string; schemeCode?: string | number }>
): Promise<Record<string, MarketSecurity>> {
  const results: Record<string, MarketSecurity> = {};
  
  if (!securities || securities.length === 0) return results;

  try {
    const res = await fetch('/api/market/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ securities })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.quotes) {
        Object.entries(data.quotes).forEach(([tickerKey, q]: [string, any]) => {
          results[tickerKey.toUpperCase()] = {
            ticker: tickerKey.toUpperCase(),
            name: q.name || q.symbol || tickerKey,
            exchange: (q.exchange as any) || 'NSE',
            type: q.type || 'stock',
            currentPrice: q.currentPrice || q.nav,
            currency: q.currency || 'INR',
            priceChange24h: q.priceChange24h,
            priceChange24hAmount: q.priceChange24hAmount,
            country: q.currency === 'INR' ? 'IN' : 'US',
            sector: q.schemeCategory || q.sector,
            fundHouse: q.fundHouse,
            schemeCode: q.schemeCode,
          };
        });
      }
    }
  } catch (err) {
    // Silently continue to fallback
  }

  // Populate any missing quotes from local catalog
  securities.forEach(sec => {
    const key = sec.ticker.toUpperCase();
    if (!results[key]) {
      results[key] = getMarketQuote(sec.ticker, sec.exchange);
    }
  });

  return results;
}

/**
 * Live search that searches real tickers across global and Indian exchanges, 
 * including Indian Equity Mutual Funds from mfapi.in (https://www.mfapi.in/docs/).
 */
export async function searchLiveMarketSecuritiesAsync(
  query: string, 
  region: MarketRegionFilter = 'all'
): Promise<MarketSecurity[]> {
  const localMatches = searchMarketSecurities(query, region);
  const trimmed = query.trim();

  // If Mutual Funds filter is selected or query explicitly mentions funds / amc
  if (region === 'mf' || /flexi|small cap|mid cap|large cap|mutual fund|elss|growth|direct/i.test(trimmed)) {
    try {
      const res = await fetch(`/api/mf/search?q=${encodeURIComponent(trimmed || 'growth')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          const mfResults: MarketSecurity[] = data.results.map((r: any) => ({
            ticker: String(r.schemeCode),
            schemeCode: r.schemeCode,
            name: r.schemeName || r.name,
            exchange: 'MF',
            type: 'mutual_fund',
            currentPrice: 100.0,
            currency: 'INR',
            priceChange24h: 0,
            priceChange24hAmount: 0,
            country: 'IN',
            popular: false
          }));

          // Merge local popular mutual funds and mfapi.in live search results
          const seen = new Set<string>();
          const combined: MarketSecurity[] = [];
          
          [...localMatches, ...mfResults].forEach(m => {
            if (!seen.has(m.ticker)) {
              seen.add(m.ticker);
              combined.push(m);
            }
          });

          return combined.slice(0, 25);
        }
      }
    } catch (err) {
      // Fall through to local matches
    }
  }

  if (!trimmed) return localMatches;

  try {
    const res = await fetch(`/api/market/search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const seen = new Set(localMatches.map(m => m.ticker.toUpperCase()));
        const merged = [...localMatches];

        data.results.forEach((r: any) => {
          if (!seen.has(r.ticker.toUpperCase())) {
            seen.add(r.ticker.toUpperCase());
            merged.push({
              ticker: r.ticker,
              name: r.name,
              exchange: r.exchange,
              type: r.type,
              currentPrice: r.currency === 'INR' ? 500 : 100,
              currency: r.currency,
              priceChange24h: 0,
              priceChange24hAmount: 0,
              country: r.country,
              popular: false
            });
          }
        });

        return merged.slice(0, 25);
      }
    }
  } catch (err) {
    // Return local matches on network error
  }

  return localMatches;
}

/**
 * Calculates purchase price estimate if buyDate is provided.
 * Approximate historical curve: Indian/US equities compounded ~12-16% annually.
 */
export function estimateHistoricalBuyPrice(currentPrice: number, buyDate: string): number {
  if (!buyDate) return currentPrice;
  const buy = new Date(buyDate).getTime();
  const now = new Date().getTime();
  const diffDays = Math.max(0, (now - buy) / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return currentPrice;

  // Approximate historical growth: avg ~13% annual
  const years = diffDays / 365;
  const estimatedCost = currentPrice / Math.pow(1.13, Math.min(years, 10));
  return Math.round(Math.max(1, estimatedCost) * 100) / 100;
}
