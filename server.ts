import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory quote cache with 30s TTL to prevent rate limits
interface CachedQuote {
  data: any;
  timestamp: number;
}
const quoteCache: Map<string, CachedQuote> = new Map();
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

// In-memory AMFI Mutual Fund NAV cache
interface AmfiRecord {
  schemeCode: string;
  isinGrowth: string;
  isinReinvest: string;
  schemeName: string;
  plan: string;
  option: string;
  nav: number;
  date: string;
}
let amfiCache: Map<string, AmfiRecord> = new Map();
let lastAmfiFetchTime = 0;
const AMFI_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Fetches and caches the official AMFI India daily NAV database (17,000+ schemes)
 */
async function loadAmfiDatabase(): Promise<Map<string, AmfiRecord>> {
  const now = Date.now();
  if (amfiCache.size > 0 && now - lastAmfiFetchTime < AMFI_CACHE_TTL_MS) {
    return amfiCache;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('https://www.amfiindia.com/spages/NAVAll.txt', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`AMFI returned status ${res.status}`);
    const text = await res.text();
    const lines = text.split('\n');
    const newMap = new Map<string, AmfiRecord>();

    for (const line of lines) {
      const parts = line.trim().split(';');
      if (parts.length >= 6) {
        const schemeCode = parts[0].trim();
        const isinGrowth = parts[1] ? parts[1].trim() : '';
        const isinReinvest = parts[2] ? parts[2].trim() : '';
        const schemeName = parts[3] ? parts[3].trim() : '';
        let plan = '';
        let option = '';
        let navStr = '';
        let date = '';

        if (parts.length >= 8) {
          plan = parts[4].trim();
          option = parts[5].trim();
          navStr = parts[6].trim();
          date = parts[7].trim();
        } else if (parts.length === 6) {
          navStr = parts[4].trim();
          date = parts[5].trim();
        } else if (parts.length === 7) {
          plan = parts[4].trim();
          navStr = parts[5].trim();
          date = parts[6].trim();
        }

        const nav = parseFloat(navStr);
        if (schemeCode && !isNaN(nav) && nav > 0) {
          const record: AmfiRecord = {
            schemeCode,
            isinGrowth: isinGrowth === '-' ? '' : isinGrowth,
            isinReinvest: isinReinvest === '-' ? '' : isinReinvest,
            schemeName,
            plan,
            option,
            nav,
            date
          };
          newMap.set(schemeCode, record);
          if (isinGrowth && isinGrowth !== '-') {
            newMap.set(isinGrowth.toUpperCase(), record);
          }
        }
      }
    }

    if (newMap.size > 100) {
      amfiCache = newMap;
      lastAmfiFetchTime = now;
      console.log(`[AMFI] Successfully loaded ${newMap.size} mutual fund NAV records.`);
    }
  } catch (err: any) {
    console.warn(`[AMFI] Failed to update AMFI database: ${err.message}`);
  }

  return amfiCache;
}

/**
 * Searches the in-memory AMFI Mutual Funds database instantly without network delays
 */
function searchAmfiDatabase(query: string, limit: number = 35): any[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const qTerms = q.split(/\s+/).filter(Boolean);
  const results: any[] = [];
  const seenCodes = new Set<string>();

  for (const record of amfiCache.values()) {
    if (seenCodes.has(record.schemeCode)) continue;
    const nameLower = record.schemeName.toLowerCase();
    const isinLower = (record.isinGrowth || '').toLowerCase();
    const codeStr = record.schemeCode;

    const matchesAllTerms = qTerms.every(term => 
      nameLower.includes(term) || isinLower.includes(term) || codeStr === term
    );

    if (matchesAllTerms) {
      seenCodes.add(record.schemeCode);
      const isDirect = /direct/i.test(record.schemeName) || /direct/i.test(record.plan);
      const isGrowth = /growth/i.test(record.schemeName) || /growth/i.test(record.option);
      const isEquity = /equity|flexi|small|mid|large|cap|nifty|elss|value|focused|index|bluechip|multicap|emerging/i.test(record.schemeName);

      results.push({
        schemeCode: record.schemeCode,
        schemeName: record.schemeName,
        name: record.schemeName,
        ticker: record.schemeCode,
        isin: record.isinGrowth || record.isinReinvest,
        plan: isDirect ? 'Direct' : 'Regular',
        option: isGrowth ? 'Growth' : 'IDCW',
        nav: record.nav,
        currentPrice: record.nav,
        previousClose: record.nav,
        navDate: record.date,
        exchange: 'MF',
        type: 'mutual_fund',
        currency: 'INR',
        country: 'IN',
        isDirect,
        isGrowth,
        isEquity,
        dataStatus: 'Daily NAV',
        source: 'OFFICIAL_AMFI_INDIA'
      });

      if (results.length >= limit * 2) break;
    }
  }

  // Prioritize Direct + Growth funds
  results.sort((a, b) => {
    const aScore = (a.isDirect ? 3 : 0) + (a.isGrowth ? 2 : 0) + (a.isEquity ? 1 : 0);
    const bScore = (b.isDirect ? 3 : 0) + (b.isGrowth ? 2 : 0) + (b.isEquity ? 1 : 0);
    return bScore - aScore;
  });

  return results.slice(0, limit);
}

// Initial async background AMFI load
loadAmfiDatabase().catch(() => {});

/**
 * Direct Google Finance scraper for real-time accurate prices matching Google Finance
 */
async function fetchGoogleFinanceQuote(ticker: string, exchange?: string): Promise<any> {
  const clean = ticker.trim().toUpperCase();
  let ex = exchange ? exchange.toUpperCase() : 'NSE';
  if (ex === 'BSE') ex = 'BOM';
  if (ex === 'NYSEARCA' || ex === 'ARCA') ex = 'NYSEARCA';
  
  const query = `${clean}:${ex}`;
  const url = `https://www.google.com/finance/quote/${encodeURIComponent(query)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const html = await res.text();

    // Check if valid stock page (not 404 or redirect)
    if (html.includes('Page not found') || html.includes('We couldn\'t find any matches')) {
      return null;
    }

    // Google Finance modern price container: <div class="N6SYTe"><span jsname="Pdsbrc"><span>₹1,283.70</span></span>
    // or class="YMlKec fxKbKc"
    const priceMatch = html.match(/<div class=\"N6SYTe\"><span jsname=\"Pdsbrc\"[^>]*><span>([^<]+)<\/span>/) ||
                       html.match(/<span jsname=\"Pdsbrc\"[^>]*><span>([^\d\s]*)\s*([0-9,]+(?:\.[0-9]+)?)<\/span>/) ||
                       html.match(/class=\"YMlKec fxKbKc\">([^<]+)<\/div>/);

    if (!priceMatch) return null;

    const rawPriceStr = (priceMatch[1] || priceMatch[2] || '').trim();
    const numericPrice = parseFloat(rawPriceStr.replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice) || numericPrice <= 0) return null;

    // Changes
    const pctMatch = html.match(/<span jsname=\"vY9t3b\"[^>]*><span[^>]*>([^<]+)<\/span>/) ||
                     html.match(/aria-label=\"[^\"]*(?:Up|Down)\s+by\s+([0-9,.]+)\s*.*?\(([0-9,.]+%)\)/i);
    const amtMatch = html.match(/<span jsname=\"xnruHf\"[^>]*>([^<]+)<\/span>/);

    let changePct = 0;
    if (pctMatch) {
      const pStr = (pctMatch[1] || pctMatch[2] || '').replace(/[^0-9.-]/g, '');
      changePct = parseFloat(pStr) || 0;
      if (html.includes('arrow_downward') && changePct > 0) changePct = -changePct;
    }

    let changeAmt = 0;
    if (amtMatch) {
      const aStr = amtMatch[1].replace(/[^0-9.-]/g, '');
      changeAmt = parseFloat(aStr) || 0;
      if (html.includes('arrow_downward') && changeAmt > 0) changeAmt = -changeAmt;
    }

    const previousClose = Math.round((numericPrice - changeAmt) * 100) / 100;
    const nameMatch = html.match(/<div class=\"gO24Ff\">([^<]+)<\/div>/) || html.match(/<title>([^(<]+)/);
    const name = nameMatch ? nameMatch[1].trim() : clean;

    const isIndian = ex === 'NSE' || ex === 'BOM' || ex === 'BSE' || rawPriceStr.includes('₹');
    const currency = isIndian ? 'INR' : (rawPriceStr.includes('$') ? 'USD' : 'USD');

    return {
      symbol: clean,
      ticker: clean,
      name,
      currentPrice: Math.round(numericPrice * 100) / 100,
      previousClose: previousClose,
      priceChange24h: Math.round(changePct * 100) / 100,
      priceChange24hAmount: Math.round(changeAmt * 100) / 100,
      currency: currency,
      exchange: ex === 'BOM' ? 'BSE' : ex,
      marketTime: new Date().toISOString(),
      isLive: true,
      source: 'GOOGLE_FINANCE',
      googleFinanceUrl: `https://www.google.com/finance/quote/${clean}:${ex}`
    };
  } catch (err: any) {
    return null;
  }
}

/**
 * Dedicated Crypto live quote engine using Binance and Coinbase public endpoints
 */
async function fetchLiveCryptoQuote(symbol: string): Promise<any> {
  const clean = symbol.replace(/-(USD|USDT)$/i, '').replace(/USDT$/i, '').trim().toUpperCase();
  const cacheKey = `CRYPTO_${clean}`;
  const cached = quoteCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < 15000) { // 15s cache for fast-moving crypto
    return { ...cached.data, cached: true };
  }

  // 1. Try Binance 24hr ticker
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${clean}USDT`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const lastPrice = parseFloat(data.lastPrice);
      if (!isNaN(lastPrice) && lastPrice > 0) {
        const changePct = parseFloat(data.priceChangePercent) || 0;
        const changeAmt = parseFloat(data.priceChange) || 0;
        const prevClose = parseFloat(data.prevClosePrice) || (lastPrice - changeAmt);

        const cryptoQuote = {
          symbol: clean,
          ticker: clean,
          name: clean === 'BTC' ? 'Bitcoin' : clean === 'ETH' ? 'Ethereum' : clean === 'SOL' ? 'Solana' : `${clean} Crypto`,
          currentPrice: lastPrice >= 1 ? Math.round(lastPrice * 100) / 100 : lastPrice,
          previousClose: prevClose >= 1 ? Math.round(prevClose * 100) / 100 : prevClose,
          priceChange24h: Math.round(changePct * 100) / 100,
          priceChange24hAmount: Math.round(changeAmt * 100) / 100,
          currency: 'USD',
          exchange: 'CRYPTO',
          type: 'crypto',
          dayHigh: parseFloat(data.highPrice) || lastPrice,
          dayLow: parseFloat(data.lowPrice) || lastPrice,
          volume: parseFloat(data.volume) || 0,
          marketTime: new Date().toISOString(),
          isLive: true,
          source: 'BINANCE_LIVE',
          googleFinanceUrl: `https://www.google.com/finance/quote/${clean}-USD`
        };

        quoteCache.set(cacheKey, { data: cryptoQuote, timestamp: now });
        return cryptoQuote;
      }
    }
  } catch {
    // Fall back to Coinbase
  }

  // 2. Try Coinbase Spot Price
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://api.coinbase.com/v2/prices/${clean}-USD/spot`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const amt = parseFloat(json?.data?.amount);
      if (!isNaN(amt) && amt > 0) {
        const cryptoQuote = {
          symbol: clean,
          ticker: clean,
          name: clean === 'BTC' ? 'Bitcoin' : clean === 'ETH' ? 'Ethereum' : clean === 'SOL' ? 'Solana' : `${clean} Crypto`,
          currentPrice: amt >= 1 ? Math.round(amt * 100) / 100 : amt,
          previousClose: amt,
          priceChange24h: 0,
          priceChange24hAmount: 0,
          currency: 'USD',
          exchange: 'CRYPTO',
          type: 'crypto',
          marketTime: new Date().toISOString(),
          isLive: true,
          source: 'COINBASE_LIVE',
          googleFinanceUrl: `https://www.google.com/finance/quote/${clean}-USD`
        };

        quoteCache.set(cacheKey, { data: cryptoQuote, timestamp: now });
        return cryptoQuote;
      }
    }
  } catch {
    // Continue
  }

  return null;
}

/**
 * Maps user ticker and exchange into Yahoo Finance symbol
 */
function resolveMarketSymbol(ticker: string, exchange?: string, type?: string): string {
  const clean = ticker.trim().toUpperCase();
  if (clean.includes('.')) return clean; // Already formatted like TCS.NS or AAPL.US

  if (type === 'crypto' || exchange === 'CRYPTO') {
    if (clean.endsWith('-USD')) return clean;
    return `${clean}-USD`;
  }

  if (type === 'commodity' || exchange === 'COMMODITY') {
    if (clean === 'GOLD') return 'GC=F';
    if (clean === 'SILVER') return 'SI=F';
    return clean;
  }

  if (exchange === 'NSE' || (!exchange && isLikelyIndianTicker(clean))) {
    return `${clean}.NS`;
  }

  if (exchange === 'BSE') {
    return `${clean}.BO`;
  }

  return clean;
}

function isLikelyIndianTicker(ticker: string): boolean {
  const indianTickers = new Set([
    'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'SBIN', 'BHARTIARTL',
    'ITC', 'KOTAKBANK', 'LT', 'HINDUNILVR', 'AXISBANK', 'BAJFINANCE', 'MARUTI',
    'TATAMOTORS', 'SUNPHARMA', 'NTPC', 'POWERGRID', 'TITAN', 'M&M', 'TATASTEEL',
    'ZOMATO', 'TATAPOWER', 'SUZLON', 'HAL', 'BEL', 'IRCTC', 'RVNL', 'JIOFIN',
    'NIFTYBEES', 'BANKBEES', 'GOLDBEES', 'ITBEES', 'SILVERBEES', 'CPSEETF'
  ]);
  return indianTickers.has(ticker.toUpperCase());
}

const KNOWN_CRYPTO_SYMBOLS = new Set([
  'BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'ADA', 'AVAX', 'DOT', 'LINK',
  'MATIC', 'NEAR', 'SHIB', 'TRX', 'LTC', 'BCH', 'UNI', 'ATOM', 'XLM', 'ALGO'
]);

/**
 * Fetches real live market quote with intelligent routing
 */
async function fetchLiveMarketQuote(symbolOrTicker: string, exchange?: string, type?: string): Promise<any> {
  const cleanTicker = symbolOrTicker.replace(/\.(NS|BO)$/i, '').trim().toUpperCase();
  const isCrypto = type === 'crypto' || exchange === 'CRYPTO' || KNOWN_CRYPTO_SYMBOLS.has(cleanTicker) || cleanTicker.endsWith('-USD') || cleanTicker.endsWith('USDT');

  // If Crypto, route directly to high-performance crypto engine
  if (isCrypto) {
    const cryptoQuote = await fetchLiveCryptoQuote(cleanTicker);
    if (cryptoQuote) return cryptoQuote;
  }

  const cacheKey = `${exchange || 'AUTO'}_${cleanTicker}`;
  const cached = quoteCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { ...cached.data, cached: true };
  }

  // 1. Try Yahoo Finance with formatted symbol (reliable JSON endpoint)
  const yahooSymbol = resolveMarketSymbol(cleanTicker, exchange, type);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      const meta = json?.chart?.result?.[0]?.meta;

      if (meta && meta.regularMarketPrice !== undefined) {
        const regularMarketPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose || meta.chartPreviousClose || regularMarketPrice;
        const priceChangeAmount = regularMarketPrice - previousClose;
        const priceChangePercent = previousClose !== 0 ? (priceChangeAmount / previousClose) * 100 : 0;

        const isIndian = yahooSymbol.endsWith('.NS') || yahooSymbol.endsWith('.BO') || meta.currency === 'INR';
        const determinedExchange = exchange || (yahooSymbol.endsWith('.NS') ? 'NSE' : yahooSymbol.endsWith('.BO') ? 'BSE' : (meta.exchangeName || 'US'));

        const quoteData = {
          symbol: cleanTicker,
          ticker: cleanTicker,
          name: meta.longName || meta.shortName || cleanTicker,
          currentPrice: Math.round(regularMarketPrice * 100) / 100,
          previousClose: Math.round(previousClose * 100) / 100,
          priceChange24h: Math.round(priceChangePercent * 100) / 100,
          priceChange24hAmount: Math.round(priceChangeAmount * 100) / 100,
          currency: meta.currency || (isIndian ? 'INR' : 'USD'),
          dayHigh: meta.regularMarketDayHigh || regularMarketPrice,
          dayLow: meta.regularMarketDayLow || regularMarketPrice,
          exchange: determinedExchange,
          marketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : new Date().toISOString(),
          isLive: true,
          source: 'LIVE_EXCHANGE',
          googleFinanceUrl: `https://www.google.com/finance/quote/${cleanTicker}:${determinedExchange === 'BSE' ? 'BOM' : determinedExchange}`
        };

        quoteCache.set(cacheKey, { data: quoteData, timestamp: now });
        return quoteData;
      }
    }
  } catch (error: any) {
    // Fall back to Google Finance
  }

  // 2. Google Finance fallback
  try {
    const gfQuote = await fetchGoogleFinanceQuote(cleanTicker, exchange);
    if (gfQuote && gfQuote.currentPrice > 0) {
      quoteCache.set(cacheKey, { data: gfQuote, timestamp: now });
      return gfQuote;
    }
  } catch (e) {
    // Fail gracefully
  }

  return null;
}

/**
 * Fetches real live NAV and details from official AMFI Database and mfapi.in
 */
async function fetchLiveMutualFundQuote(schemeCodeOrIsin: string | number): Promise<any> {
  const codeStr = String(schemeCodeOrIsin).trim().toUpperCase();
  const cacheKey = `MF_${codeStr}`;
  const cached = quoteCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS * 2) { // 60s cache for mutual funds
    return { ...cached.data, cached: true };
  }

  // 1. Try AMFI India official database first (100% reliable)
  const amfiDb = await loadAmfiDatabase();
  const amfiRecord = amfiDb.get(codeStr) || amfiDb.get(codeStr.replace(/\s+/g, ''));

  if (amfiRecord) {
    const isDirect = /direct/i.test(amfiRecord.schemeName) || /direct/i.test(amfiRecord.plan);
    const isGrowth = /growth/i.test(amfiRecord.schemeName) || /growth/i.test(amfiRecord.option);

    const mfData = {
      symbol: amfiRecord.schemeCode,
      schemeCode: amfiRecord.schemeCode,
      ticker: amfiRecord.schemeCode,
      name: amfiRecord.schemeName,
      schemeName: amfiRecord.schemeName,
      isin: amfiRecord.isinGrowth || amfiRecord.isinReinvest,
      plan: isDirect ? 'Direct' : 'Regular',
      option: isGrowth ? 'Growth' : 'IDCW',
      fundHouse: amfiRecord.schemeName.split(' ')[0] + ' Mutual Fund',
      currentPrice: Math.round(amfiRecord.nav * 10000) / 10000,
      nav: Math.round(amfiRecord.nav * 10000) / 10000,
      previousClose: Math.round(amfiRecord.nav * 10000) / 10000,
      previousNav: Math.round(amfiRecord.nav * 10000) / 10000,
      priceChange24h: 0.0,
      priceChange24hAmount: 0.0,
      currency: 'INR',
      exchange: 'MF',
      type: 'mutual_fund',
      country: 'IN',
      navDate: amfiRecord.date,
      isLive: true,
      source: 'OFFICIAL_AMFI_INDIA',
    };

    quoteCache.set(cacheKey, { data: mfData, timestamp: now });
    return mfData;
  }

  // 2. Try mfapi.in
  const url = `https://api.mfapi.in/mf/${encodeURIComponent(codeStr)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.status !== 'FAIL' && json.data && json.data.length > 0) {
        const meta = json.meta || {};
        const latestEntry = json.data[0];
        const previousEntry = json.data[1] || latestEntry;

        const currentNav = parseFloat(latestEntry.nav) || 0;
        const previousNav = parseFloat(previousEntry.nav) || currentNav;
        const navChangeAmount = currentNav - previousNav;
        const navChangePercent = previousNav > 0 ? (navChangeAmount / previousNav) * 100 : 0;

        const mfData = {
          symbol: codeStr,
          schemeCode: meta.scheme_code || codeStr,
          ticker: codeStr,
          name: meta.scheme_name || `Mutual Fund (${codeStr})`,
          fundHouse: meta.fund_house || 'Indian Mutual Fund',
          schemeCategory: meta.scheme_category || 'Equity Scheme',
          schemeType: meta.scheme_type || 'Open Ended Schemes',
          currentPrice: Math.round(currentNav * 100) / 100,
          nav: Math.round(currentNav * 100) / 100,
          previousClose: Math.round(previousNav * 100) / 100,
          previousNav: Math.round(previousNav * 100) / 100,
          priceChange24h: Math.round(navChangePercent * 100) / 100,
          priceChange24hAmount: Math.round(navChangeAmount * 100) / 100,
          currency: 'INR',
          exchange: 'MF',
          type: 'mutual_fund',
          country: 'IN',
          navDate: latestEntry.date,
          historicalNavs: json.data.slice(0, 30),
          isLive: true,
          source: 'LIVE_MFAPI_IN',
        };

        quoteCache.set(cacheKey, { data: mfData, timestamp: now });
        return mfData;
      }
    }
  } catch (error: any) {
    console.warn(`[MFAPI] Fallback for scheme ${codeStr}: ${error.message}`);
  }

  return null;
}

// Popular Indian Equity Mutual Funds preset list
const POPULAR_EQUITY_MUTUAL_FUNDS = [
  { schemeCode: 122639, name: 'Parag Parikh Flexi Cap Fund - Direct Plan - Growth', fundHouse: 'PPFAS Mutual Fund', category: 'Flexi Cap Fund' },
  { schemeCode: 120828, name: 'Quant Small Cap Fund - Direct Plan - Growth', fundHouse: 'Quant Mutual Fund', category: 'Small Cap Fund' },
  { schemeCode: 118834, name: 'Mirae Asset Large & Midcap Fund - Direct Plan - Growth', fundHouse: 'Mirae Asset Mutual Fund', category: 'Large & Mid Cap Fund' },
  { schemeCode: 118778, name: 'Nippon India Small Cap Fund - Direct Plan - Growth', fundHouse: 'Nippon India Mutual Fund', category: 'Small Cap Fund' },
  { schemeCode: 118989, name: 'HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth', fundHouse: 'HDFC Mutual Fund', category: 'Mid Cap Fund' },
  { schemeCode: 120586, name: 'ICICI Prudential Bluechip Fund - Direct Plan - Growth', fundHouse: 'ICICI Prudential Mutual Fund', category: 'Large Cap Fund' },
  { schemeCode: 127042, name: 'Motilal Oswal Midcap Fund - Direct Plan - Growth', fundHouse: 'Motilal Oswal Mutual Fund', category: 'Mid Cap Fund' },
  { schemeCode: 119598, name: 'SBI Bluechip Fund - Direct Plan - Growth', fundHouse: 'SBI Mutual Fund', category: 'Large Cap Fund' },
  { schemeCode: 120716, name: 'UTI Nifty 50 Index Fund - Direct Plan - Growth', fundHouse: 'UTI Mutual Fund', category: 'Index Fund' },
  { schemeCode: 125354, name: 'Axis Small Cap Fund - Direct Plan - Growth', fundHouse: 'Axis Mutual Fund', category: 'Small Cap Fund' },
  { schemeCode: 135783, name: 'Tata Digital India Fund - Direct Plan - Growth', fundHouse: 'Tata Mutual Fund', category: 'Sectoral / Thematic - Technology' },
  { schemeCode: 118968, name: 'HDFC Flexi Cap Fund - Direct Plan - Growth', fundHouse: 'HDFC Mutual Fund', category: 'Flexi Cap Fund' },
  { schemeCode: 120166, name: 'Kotak Emerging Equity Fund - Direct Plan - Growth', fundHouse: 'Kotak Mahindra Mutual Fund', category: 'Mid Cap Fund' },
  { schemeCode: 147622, name: 'Bandhan Small Cap Fund - Direct Plan - Growth', fundHouse: 'Bandhan Mutual Fund', category: 'Small Cap Fund' }
];

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Single live quote endpoint (handles Stocks, Cryptos, ETFs and Mutual Funds)
app.get('/api/market/quote', async (req, res) => {
  try {
    const ticker = String(req.query.ticker || '');
    const exchange = req.query.exchange ? String(req.query.exchange) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;
    const schemeCode = req.query.schemeCode ? String(req.query.schemeCode) : undefined;

    if (!ticker && !schemeCode) {
      return res.status(400).json({ error: 'Ticker or schemeCode is required' });
    }

    // Check if it's a mutual fund
    if (type === 'mutual_fund' || exchange === 'MF' || schemeCode || /^\d{5,7}$/.test(ticker)) {
      const code = schemeCode || ticker;
      const mfQuote = await fetchLiveMutualFundQuote(code);
      if (mfQuote) {
        return res.json({ success: true, quote: mfQuote });
      }
    }

    const liveQuote = await fetchLiveMarketQuote(ticker, exchange, type);

    if (liveQuote) {
      return res.json({ success: true, quote: liveQuote });
    }

    return res.json({
      success: false,
      message: 'Could not fetch live external quote, client will use catalog fallback',
      ticker
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Batch live quotes endpoint
app.post('/api/market/quotes', async (req, res) => {
  try {
    const { securities } = req.body;
    if (!Array.isArray(securities) || securities.length === 0) {
      return res.status(400).json({ error: 'securities array is required' });
    }

    const results: Record<string, any> = {};

    // Process up to 25 securities in parallel
    const promises = securities.slice(0, 25).map(async (sec: any) => {
      const ticker = sec.ticker;
      if (!ticker) return;

      if (sec.type === 'mutual_fund' || sec.exchange === 'MF' || sec.schemeCode || /^\d{5,7}$/.test(String(ticker))) {
        const code = sec.schemeCode || ticker;
        const mfLive = await fetchLiveMutualFundQuote(code);
        if (mfLive) {
          results[String(ticker).toUpperCase()] = mfLive;
          results[String(code).toUpperCase()] = mfLive;
          return;
        }
      }

      const live = await fetchLiveMarketQuote(ticker, sec.exchange, sec.type);
      if (live) {
        results[ticker.toUpperCase()] = live;
      }
    });

    await Promise.allSettled(promises);

    res.json({
      success: true,
      count: Object.keys(results).length,
      quotes: results,
      timestamp: Date.now()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// MFAPI.IN MUTUAL FUND ENDPOINTS (https://www.mfapi.in/docs/)
// -------------------------------------------------------------

// Search Indian Mutual Funds via AMFI Database & fallback
app.get('/api/mf/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ results: POPULAR_EQUITY_MUTUAL_FUNDS });
    }

    // 1. Search in-memory AMFI database first (fastest, zero network delay, no timeout)
    const amfiResults = searchAmfiDatabase(query, 35);
    if (amfiResults.length > 0) {
      return res.json({ results: amfiResults });
    }

    // 2. If no direct AMFI match found, try popular funds catalog
    const qLower = query.toLowerCase();
    const popularMatches = POPULAR_EQUITY_MUTUAL_FUNDS.filter(mf => 
      mf.name.toLowerCase().includes(qLower) || 
      String(mf.schemeCode).includes(qLower)
    );
    if (popularMatches.length > 0) {
      return res.json({ results: popularMatches });
    }

    // 3. Fallback to mfapi.in with safe graceful error handling
    try {
      const searchUrl = `https://api.mfapi.in/mf/search?q=${encodeURIComponent(query)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const schemes: any[] = await response.json();
        if (Array.isArray(schemes) && schemes.length > 0) {
          const formatted = schemes.slice(0, 35).map(s => {
            const isDirect = /direct/i.test(s.schemeName);
            const isGrowth = /growth/i.test(s.schemeName);
            const isEquity = /equity|flexi|small|mid|large|cap|nifty|elss|value|focused/i.test(s.schemeName);
            return {
              schemeCode: s.schemeCode,
              schemeName: s.schemeName,
              name: s.schemeName,
              ticker: String(s.schemeCode),
              exchange: 'MF',
              type: 'mutual_fund',
              currency: 'INR',
              country: 'IN',
              isDirect,
              isGrowth,
              isEquity
            };
          });
          return res.json({ results: formatted });
        }
      }
    } catch {
      // Gracefully return empty on external timeout/error
    }

    res.json({ results: [] });
  } catch (err: any) {
    res.json({ results: [] });
  }
});

// Get detailed live NAV and history for a mutual fund scheme from mfapi.in
app.get('/api/mf/quote', async (req, res) => {
  try {
    const schemeCode = req.query.schemeCode || req.query.code;
    if (!schemeCode) {
      return res.status(400).json({ error: 'schemeCode is required' });
    }

    const mfData = await fetchLiveMutualFundQuote(String(schemeCode));
    if (mfData) {
      return res.json({ success: true, quote: mfData });
    }

    res.status(404).json({ success: false, message: 'Mutual fund scheme not found' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get popular equity mutual funds with latest live NAVs
app.get('/api/mf/popular', async (req, res) => {
  try {
    const results = await Promise.allSettled(
      POPULAR_EQUITY_MUTUAL_FUNDS.slice(0, 8).map(async (mf) => {
        const live = await fetchLiveMutualFundQuote(mf.schemeCode);
        return live || {
          schemeCode: mf.schemeCode,
          ticker: String(mf.schemeCode),
          name: mf.name,
          fundHouse: mf.fundHouse,
          schemeCategory: mf.category,
          currentPrice: 100.0,
          currency: 'INR',
          exchange: 'MF',
          type: 'mutual_fund',
          country: 'IN',
          priceChange24h: 0.5
        };
      })
    );

    const funds = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && !!r.value)
      .map(r => r.value);

    res.json({ success: true, funds });
  } catch (err: any) {
    res.json({ success: false, funds: POPULAR_EQUITY_MUTUAL_FUNDS });
  }
});

// Real-time market security search / autocompletion
app.get('/api/market/search', async (req, res) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ results: [] });
    }

    const searchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=12&newsCount=0`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.json({ results: [] });
    }

    const json = await response.json();
    const quotes = json?.quotes || [];

    const formatted = quotes
      .filter((q: any) => q.symbol && (q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'CRYPTOCURRENCY'))
      .map((q: any) => {
        const isIndian = q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO') || q.exchange === 'NSI' || q.exchange === 'BSE';
        const cleanTicker = q.symbol.replace(/\.(NS|BO)$/, '');
        return {
          ticker: cleanTicker,
          symbol: q.symbol,
          name: q.shortname || q.longname || cleanTicker,
          exchange: q.symbol.endsWith('.NS') ? 'NSE' : q.symbol.endsWith('.BO') ? 'BSE' : (q.exchange || 'GLOBAL'),
          type: q.quoteType === 'CRYPTOCURRENCY' ? 'crypto' : q.quoteType === 'ETF' ? 'etf' : 'stock',
          country: isIndian ? 'IN' : 'US',
          currency: isIndian ? 'INR' : 'USD'
        };
      });

    res.json({ results: formatted });
  } catch (err: any) {
    res.json({ results: [] });
  }
});

// -------------------------------------------------------------
// FINSCORE™ - AI FINANCIAL ASSISTANT ENDPOINT
// -------------------------------------------------------------
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

app.post('/api/finscore/ai-advisor', async (req, res) => {
  try {
    const { profile, result, question } = req.body || {};

    const profileName = profile?.name || 'Friend';
    const income = profile?.monthlyIncome || 50000;
    const currency = profile?.currency === 'INR' ? '₹' : '$';
    const overallScore = result?.overallScore ?? 70;
    const grade = result?.grade || 'Good';
    const savingsRatio = result?.metrics?.savingsRatio ?? 30;
    const emiRatio = result?.metrics?.emiToIncomeRatio ?? 16;
    const emergencyFundRatio = result?.metrics?.emergencyFundRatio ?? 53;
    const emergencyShortfall = result?.metrics?.emergencyShortfall ?? 70000;
    const biggestPriority = result?.biggestPriority || 'Build your emergency fund before increasing discretionary spending.';

    const ai = getGeminiClient();

    if (ai) {
      const prompt = question
        ? `You are FinScore AI, an empathetic, highly knowledgeable certified financial planner and educator.
The user's verified financial profile:
- Name: ${profileName} (Age ${profile?.age || 28})
- Monthly Income: ${currency}${income.toLocaleString()}
- FinScore: ${overallScore}/100 (${grade})
- Savings Ratio: ${savingsRatio}%
- EMI to Income Burden: ${emiRatio}%
- Emergency Fund Coverage: ${emergencyFundRatio}% (Shortfall: ${currency}${emergencyShortfall.toLocaleString()})
- Biggest Priority: ${biggestPriority}

The user asks: "${question}"

Provide a direct, inspiring, educational response (under 250 words) with actionable numbers based directly on their profile. Do not invent unrelated figures. Conclude with a supportive closing.`
        : `You are FinScore AI, an empathetic personal financial health advisor.
The user's verified financial profile:
- Name: ${profileName} (Age ${profile?.age || 28})
- Monthly Income: ${currency}${income.toLocaleString()}
- FinScore: ${overallScore}/100 (${grade})
- Breakdown: Savings ${result?.scores?.savings}/100, Expense ${result?.scores?.expenseManagement}/100, Debt ${result?.scores?.debt}/100, Emergency ${result?.scores?.emergencyFund}/100, Insurance ${result?.scores?.insurance}/100, Goals ${result?.scores?.futureGoals}/100
- Savings Ratio: ${savingsRatio}%
- EMI to Income: ${emiRatio}%
- Emergency Fund Coverage: ${emergencyFundRatio}% (${currency}${result?.metrics?.emergencyShortfall?.toLocaleString()} needed)

Generate:
1. Executive Diagnosis: 2 sentences explaining why they earned a score of ${overallScore}/100.
2. Single Biggest Priority.
3. 3-Month Action Plan (Month 1, Month 2, Month 3 with concrete amounts).
Keep it conversational, empowering, professional, and educational.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are FinScore AI Financial Assistant. Provide objective, clear, actionable personal finance education. Always present estimates as educational advice, not regulated investment solicitations.',
        },
      });

      const responseText = response.text || '';
      return res.json({
        success: true,
        source: 'GEMINI_AI',
        advice: responseText,
      });
    }

    // High quality deterministic fallback when no API key configured
    const fallbackAdvice = question
      ? `Based on your monthly income of ${currency}${income.toLocaleString()} and FinScore of ${overallScore}/100 (${grade}): 
${biggestPriority}
To optimize your question regarding "${question}", prioritize keeping your EMI ratio below 35% while steadily directing at least 20% of your net income toward liquid emergency buffers and recurring goal investments.`
      : `Based on your financial profile, your overall health score is ${overallScore}/100 (${grade}).

Key Diagnosis: Your savings rate (${savingsRatio}%) demonstrates solid discipline, but your emergency buffer is at ${emergencyFundRatio}% of your target, leaving a shortfall of ${currency}${emergencyShortfall.toLocaleString()}.

🎯 Biggest Priority: ${biggestPriority}

🗓️ Recommended Action Plan:
• Month 1: Re-allocate non-essential expenses to save at least ${currency}${Math.round(income * 0.15).toLocaleString()} directly into a high-yield liquid emergency fund.
• Month 2: Audit existing debt commitments (current EMI ratio: ${emiRatio}%) and review personal health/term insurance adequacy.
• Month 3: Automate systematic investments for your long-term milestones (e.g. Car, Home Downpayment).`;

    res.json({
      success: true,
      source: 'FINSCORE_ENGINE',
      advice: fallbackAdvice,
    });
  } catch (err: any) {
    res.json({
      success: true,
      source: 'FINSCORE_FALLBACK',
      advice: `Your biggest financial priority: Build your emergency fund before increasing discretionary spending. Channel your surplus cash flow into liquid reserves while maintaining your loan EMIs.`,
    });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Finance & Live Market Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
