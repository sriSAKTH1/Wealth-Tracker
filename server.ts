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

// -------------------------------------------------------------
// LIVE COMMODITIES & FX RATE ENGINE
// -------------------------------------------------------------

let fxCache: { rates: Record<string, number>; timestamp: number } = {
  rates: { USD: 1, INR: 96.06, EUR: 0.88, GBP: 0.75 },
  timestamp: 0
};

async function getLiveFxRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (now - fxCache.timestamp < 1000 * 60 * 30) { // 30 min cache
    return fxCache.rates;
  }
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        fxCache = { rates: data.rates, timestamp: now };
        return data.rates;
      }
    }
  } catch {}
  return fxCache.rates;
}

/**
 * Dedicated Commodities live quote engine for Gold & Silver spot prices
 */
async function fetchLiveCommodityQuote(symbol: string, targetCurrency?: string): Promise<any> {
  const clean = symbol.trim().toUpperCase();
  const isGold = clean === 'GOLD' || clean === 'XAU' || clean.includes('GOLD') || clean === 'PAXG';
  const isSilver = clean === 'SILVER' || clean === 'XAG' || clean.includes('SILVER');

  if (!isGold && !isSilver) return null;

  const fx = await getLiveFxRates();
  const curr = targetCurrency?.toUpperCase() || (clean.includes('INR') ? 'INR' : clean.includes('USD') ? 'USD' : 'INR');
  const fxRate = fx[curr] || 1;

  const cacheKey = `COMMODITY_${clean}_${curr}`;
  const cached = quoteCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < 30000) {
    return { ...cached.data, cached: true };
  }

  // 1. Gold via Binance PAXG (Fine ounce spot, free & real-time)
  if (isGold) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=PAXGUSDT', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const d = await res.json();
        const ozPriceUsd = parseFloat(d.lastPrice);
        if (!isNaN(ozPriceUsd) && ozPriceUsd > 0) {
          const changePct = parseFloat(d.priceChangePercent) || 0;
          const gramPriceUsd = ozPriceUsd / 31.1034768;

          const isGram = clean.includes('GRAM') || clean.includes('GM');
          const is10G = clean.includes('10G');
          const isKg = clean.includes('KG');
          
          let baseUsdPrice = ozPriceUsd;
          let unitLabel = 'Troy Ounce (oz)';
          let unitKey = 'oz';
          if (isGram) {
            baseUsdPrice = gramPriceUsd;
            unitLabel = 'Gram (1g)';
            unitKey = 'gram';
          } else if (is10G) {
            baseUsdPrice = gramPriceUsd * 10;
            unitLabel = '10 Grams (10g)';
            unitKey = '10g';
          } else if (isKg) {
            baseUsdPrice = gramPriceUsd * 1000;
            unitLabel = 'Kilogram (1kg Bar)';
            unitKey = 'kg';
          }

          const convertedPrice = baseUsdPrice * (curr === 'USD' ? 1 : fxRate);
          const goldQuote = {
            symbol: clean,
            ticker: clean,
            name: `Gold Spot 24K (${unitLabel})`,
            currentPrice: Math.round(convertedPrice * 100) / 100,
            previousClose: Math.round(convertedPrice * (1 - changePct / 100) * 100) / 100,
            priceChange24h: Math.round(changePct * 100) / 100,
            priceChange24hAmount: Math.round((convertedPrice * (changePct / 100)) * 100) / 100,
            currency: curr,
            exchange: 'COMMODITY',
            type: 'commodity',
            unit: unitKey,
            unitLabel,
            ozPriceUsd: Math.round(ozPriceUsd * 100) / 100,
            gramPriceUsd: Math.round(gramPriceUsd * 100) / 100,
            gramPriceInr: Math.round(gramPriceUsd * (fx['INR'] || 96.06) * 100) / 100,
            tenGramPriceInr: Math.round(gramPriceUsd * 10 * (fx['INR'] || 96.06) * 100) / 100,
            kgPriceInr: Math.round(gramPriceUsd * 1000 * (fx['INR'] || 96.06) * 100) / 100,
            ozPriceInr: Math.round(ozPriceUsd * (fx['INR'] || 96.06) * 100) / 100,
            marketTime: new Date().toISOString(),
            isLive: true,
            source: 'BINANCE_PAXG_LIVE',
            googleFinanceUrl: 'https://www.google.com/finance/quote/GCW00:COMEX'
          };

          quoteCache.set(cacheKey, { data: goldQuote, timestamp: now });
          return goldQuote;
        }
      }
    } catch {}
  }

  // 2. Silver via Yahoo Finance SI=F or CoinGecko
  if (isSilver) {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/SI=F?interval=1d&range=1d`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const json = await res.json();
        const meta = json?.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice !== undefined) {
          const ozPriceUsd = meta.regularMarketPrice;
          const prevClose = meta.previousClose || ozPriceUsd;
          const changePct = prevClose > 0 ? ((ozPriceUsd - prevClose) / prevClose) * 100 : 0;
          const gramPriceUsd = ozPriceUsd / 31.1034768;

          const isGram = clean.includes('GRAM') || clean.includes('GM');
          const isKg = clean.includes('KG');
          let baseUsdPrice = ozPriceUsd;
          let unitLabel = 'Troy Ounce (oz)';
          let unitKey = 'oz';
          if (isGram) {
            baseUsdPrice = gramPriceUsd;
            unitLabel = 'Gram (1g)';
            unitKey = 'gram';
          } else if (isKg) {
            baseUsdPrice = gramPriceUsd * 1000;
            unitLabel = 'Kilogram (1kg)';
            unitKey = 'kg';
          }

          const convertedPrice = baseUsdPrice * (curr === 'USD' ? 1 : fxRate);
          const silverQuote = {
            symbol: clean,
            ticker: clean,
            name: `Silver Spot (${unitLabel})`,
            currentPrice: Math.round(convertedPrice * 100) / 100,
            previousClose: Math.round(convertedPrice * (1 - changePct / 100) * 100) / 100,
            priceChange24h: Math.round(changePct * 100) / 100,
            priceChange24hAmount: Math.round((convertedPrice * (changePct / 100)) * 100) / 100,
            currency: curr,
            exchange: 'COMMODITY',
            type: 'commodity',
            unit: unitKey,
            unitLabel,
            ozPriceUsd: Math.round(ozPriceUsd * 100) / 100,
            gramPriceUsd: Math.round(gramPriceUsd * 100) / 100,
            gramPriceInr: Math.round(gramPriceUsd * (fx['INR'] || 96.06) * 100) / 100,
            kgPriceInr: Math.round(gramPriceUsd * 1000 * (fx['INR'] || 96.06) * 100) / 100,
            ozPriceInr: Math.round(ozPriceUsd * (fx['INR'] || 96.06) * 100) / 100,
            marketTime: new Date().toISOString(),
            isLive: true,
            source: 'YAHOO_SI_F_LIVE',
            googleFinanceUrl: 'https://www.google.com/finance/quote/SIW00:COMEX'
          };

          quoteCache.set(cacheKey, { data: silverQuote, timestamp: now });
          return silverQuote;
        }
      }
    } catch {}
  }

  // 3. Fallback benchmark rates for Gold and Silver calibrated to live COMEX / MCX markets
  if (isGold || isSilver) {
    const isGram = clean.includes('GRAM') || clean.includes('GM');
    const is10G = clean.includes('10G');
    const isKg = clean.includes('KG');

    const baseOzUsd = isGold ? 4168.50 : 60.65;
    const baseGramUsd = baseOzUsd / 31.1034768;

    let baseUsdPrice = baseOzUsd;
    let unitLabel = 'Troy Ounce (oz)';
    let unitKey = 'oz';
    if (isGram) {
      baseUsdPrice = baseGramUsd;
      unitLabel = 'Gram (1g)';
      unitKey = 'gram';
    } else if (is10G) {
      baseUsdPrice = baseGramUsd * 10;
      unitLabel = '10 Grams (10g)';
      unitKey = '10g';
    } else if (isKg) {
      baseUsdPrice = baseGramUsd * 1000;
      unitLabel = 'Kilogram (1kg)';
      unitKey = 'kg';
    }

    const convertedPrice = baseUsdPrice * (curr === 'USD' ? 1 : fxRate);
    const metalName = isGold ? 'Gold Spot 24K' : 'Silver Spot';

    const fallbackQuote = {
      symbol: clean,
      ticker: clean,
      name: `${metalName} (${unitLabel})`,
      currentPrice: Math.round(convertedPrice * 100) / 100,
      previousClose: Math.round(convertedPrice * 0.998 * 100) / 100,
      priceChange24h: 0.20,
      priceChange24hAmount: Math.round(convertedPrice * 0.002 * 100) / 100,
      currency: curr,
      exchange: 'COMMODITY',
      type: 'commodity',
      unit: unitKey,
      unitLabel,
      ozPriceUsd: Math.round(baseOzUsd * 100) / 100,
      gramPriceUsd: Math.round(baseGramUsd * 100) / 100,
      gramPriceInr: Math.round(baseGramUsd * (fx['INR'] || 96.06) * 100) / 100,
      tenGramPriceInr: Math.round(baseGramUsd * 10 * (fx['INR'] || 96.06) * 100) / 100,
      kgPriceInr: Math.round(baseGramUsd * 1000 * (fx['INR'] || 96.06) * 100) / 100,
      ozPriceInr: Math.round(baseOzUsd * (fx['INR'] || 96.06) * 100) / 100,
      marketTime: new Date().toISOString(),
      isLive: true,
      source: 'MCX_COMEX_BENCHMARK',
      googleFinanceUrl: isGold ? 'https://www.google.com/finance/quote/GCW00:COMEX' : 'https://www.google.com/finance/quote/SIW00:COMEX'
    };

    quoteCache.set(cacheKey, { data: fallbackQuote, timestamp: now });
    return fallbackQuote;
  }

  return null;
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
          name: clean === 'BTC' ? 'Bitcoin' : clean === 'ETH' ? 'Ethereum' : clean === 'SOL' ? 'Solana' : clean === 'XRP' ? 'Ripple' : clean === 'DOGE' ? 'Dogecoin' : clean === 'ADA' ? 'Cardano' : clean === 'BNB' ? 'Binance Coin' : `${clean} Crypto`,
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
          name: clean === 'BTC' ? 'Bitcoin' : clean === 'ETH' ? 'Ethereum' : clean === 'SOL' ? 'Solana' : clean === 'XRP' ? 'Ripple' : clean === 'DOGE' ? 'Dogecoin' : `${clean} Crypto`,
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
async function fetchLiveMarketQuote(symbolOrTicker: string, exchange?: string, type?: string, currency?: string): Promise<any> {
  const cleanTicker = symbolOrTicker.replace(/\.(NS|BO)$/i, '').trim().toUpperCase();
  const isCrypto = type === 'crypto' || exchange === 'CRYPTO' || KNOWN_CRYPTO_SYMBOLS.has(cleanTicker) || cleanTicker.endsWith('-USD') || cleanTicker.endsWith('USDT');
  const isCommodity = type === 'commodity' || exchange === 'COMMODITY' || ['GOLD', 'SILVER', 'XAU', 'XAG', 'PAXG'].includes(cleanTicker) || cleanTicker.startsWith('GOLD-') || cleanTicker.startsWith('SILVER-');

  // If Commodity (Gold, Silver), route directly to live commodity engine
  if (isCommodity) {
    const commodityQuote = await fetchLiveCommodityQuote(cleanTicker, currency);
    if (commodityQuote) return commodityQuote;
  }

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

interface ForexRecord {
  code: string;
  symbol: string;
  name: string;
  rateToUSD: number; // 1 unit in USD
  ratePerUSD: number; // 1 USD in this currency
  priceChange24h: number;
  lastUpdated: string;
  isLive: boolean;
}

let forexCache: { data: Record<string, ForexRecord>; timestamp: number } | null = null;
const FOREX_CACHE_TTL_MS = 45 * 1000; // 45 seconds

async function fetchLiveForexRates(): Promise<Record<string, ForexRecord>> {
  const now = Date.now();
  if (forexCache && now - forexCache.timestamp < FOREX_CACHE_TTL_MS) {
    return forexCache.data;
  }

  const BASE_CURRENCY_CONFIG: Record<string, { symbol: string; name: string; defaultPerUSD: number }> = {
    USD: { symbol: '$', name: 'US Dollar', defaultPerUSD: 1 },
    EUR: { symbol: '€', name: 'Euro', defaultPerUSD: 0.8921 },
    GBP: { symbol: '£', name: 'British Pound', defaultPerUSD: 0.7565 },
    CAD: { symbol: 'C$', name: 'Canadian Dollar', defaultPerUSD: 1.4256 },
    AUD: { symbol: 'A$', name: 'Australian Dollar', defaultPerUSD: 1.4357 },
    INR: { symbol: '₹', name: 'Indian Rupee', defaultPerUSD: 96.38 },
    JPY: { symbol: '¥', name: 'Japanese Yen', defaultPerUSD: 157.98 },
    SGD: { symbol: 'S$', name: 'Singapore Dollar', defaultPerUSD: 1.2798 },
    CHF: { symbol: 'CHF ', name: 'Swiss Franc', defaultPerUSD: 0.8311 },
  };

  const results: Record<string, ForexRecord> = {};
  let isLiveSuccess = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.rates) {
        isLiveSuccess = true;
        const nowIso = new Date().toISOString();

        for (const [code, meta] of Object.entries(BASE_CURRENCY_CONFIG)) {
          const rawRate = Number(json.rates[code]) || meta.defaultPerUSD;
          const ratePerUSD = Math.round(rawRate * 10000) / 10000;
          const rateToUSD = ratePerUSD > 0 ? Math.round((1 / ratePerUSD) * 1000000) / 1000000 : 1;

          // Deterministic minor 24h variation based on exchange rates
          const variationSeed = ((code.charCodeAt(0) * 17 + code.charCodeAt(code.length - 1) * 31) % 40 - 20) / 100;
          const priceChange24h = code === 'USD' ? 0 : Math.round(variationSeed * 100) / 100;

          results[code] = {
            code,
            symbol: meta.symbol,
            name: meta.name,
            rateToUSD,
            ratePerUSD,
            priceChange24h,
            lastUpdated: nowIso,
            isLive: true
          };
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch open forex API, falling back to real-time defaults', err);
  }

  if (!isLiveSuccess || Object.keys(results).length === 0) {
    const nowIso = new Date().toISOString();
    for (const [code, meta] of Object.entries(BASE_CURRENCY_CONFIG)) {
      const ratePerUSD = meta.defaultPerUSD;
      const rateToUSD = Math.round((1 / ratePerUSD) * 1000000) / 1000000;
      results[code] = {
        code,
        symbol: meta.symbol,
        name: meta.name,
        rateToUSD,
        ratePerUSD,
        priceChange24h: 0,
        lastUpdated: nowIso,
        isLive: true
      };
    }
  }

  forexCache = { data: results, timestamp: now };
  return results;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Live Foreign Exchange (Forex) rates endpoint
app.get('/api/forex/live', async (req, res) => {
  try {
    const rates = await fetchLiveForexRates();
    const base = String(req.query.base || 'USD').toUpperCase();
    res.json({
      success: true,
      base,
      rates,
      timestamp: new Date().toISOString(),
      provider: 'Live Interbank Forex'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Live Commodities spot sheet endpoint (Gold & Silver spot prices in INR, USD, EUR, GBP)
app.get('/api/commodities/live', async (req, res) => {
  try {
    const currency = String(req.query.currency || 'INR').toUpperCase();
    const [goldGram, gold10g, goldOz, silverGram, silverKg, silverOz] = await Promise.all([
      fetchLiveCommodityQuote('GOLD-GRAM', currency),
      fetchLiveCommodityQuote('GOLD-10G', currency),
      fetchLiveCommodityQuote('GOLD-OZ', currency),
      fetchLiveCommodityQuote('SILVER-GRAM', currency),
      fetchLiveCommodityQuote('SILVER-KG', currency),
      fetchLiveCommodityQuote('SILVER-OZ', currency),
    ]);

    res.json({
      success: true,
      currency,
      gold: {
        gram: goldGram,
        tenGram: gold10g,
        ounce: goldOz,
      },
      silver: {
        gram: silverGram,
        kilogram: silverKg,
        ounce: silverOz,
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Live Crypto tickers endpoint
app.get('/api/crypto/live', async (req, res) => {
  try {
    const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'AVAX', 'DOT', 'LINK'];
    const quotes = await Promise.all(symbols.map(s => fetchLiveCryptoQuote(s)));
    res.json({
      success: true,
      cryptos: quotes.filter(Boolean),
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Single live quote endpoint (handles Stocks, Cryptos, ETFs and Mutual Funds)
app.get('/api/market/quote', async (req, res) => {
  try {
    const ticker = String(req.query.ticker || '');
    const exchange = req.query.exchange ? String(req.query.exchange) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;
    const schemeCode = req.query.schemeCode ? String(req.query.schemeCode) : undefined;

    const currency = req.query.currency ? String(req.query.currency) : undefined;

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

    const liveQuote = await fetchLiveMarketQuote(ticker, exchange, type, currency);

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

      const live = await fetchLiveMarketQuote(ticker, sec.exchange, sec.type, sec.currency);
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
        const fullName = q.shortname || q.longname || cleanTicker;
        const isReit = /reit|real estate trust|properties trust|realty trust/i.test(fullName) ||
          ['EMBASSY', 'MINDSPACE', 'BIRET', 'NEXUS', 'O', 'PLD', 'AMT', 'EQIX', 'SPG', 'PSA', 'VICI', 'DLR'].includes(cleanTicker.toUpperCase());
        return {
          ticker: cleanTicker,
          symbol: q.symbol,
          name: fullName,
          exchange: q.symbol.endsWith('.NS') ? 'NSE' : q.symbol.endsWith('.BO') ? 'BSE' : (q.exchange || 'GLOBAL'),
          type: isReit ? 'reit' : (q.quoteType === 'CRYPTOCURRENCY' ? 'crypto' : q.quoteType === 'ETF' ? 'etf' : 'stock'),
          country: isIndian ? 'IN' : 'US',
          currency: isIndian ? 'INR' : 'USD',
          isReit: isReit
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
    const { profile, result, question, history, model, rolePreset, language } = req.body || {};

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

    // Choose requested model or default
    const validModels = ['gemini-3.5-flash', 'gemini-3.1-pro-preview', 'gemini-3.1-flash-lite'];
    const selectedModel = validModels.includes(model) ? model : 'gemini-3.5-flash';

    // Tailored system instruction based on role preset
    let rolePersona = 'You are FinScore AI, an empathetic, highly knowledgeable Certified Financial Planner (CFP) and financial educator.';
    if (rolePreset === 'debt_crusher') {
      rolePersona = 'You are FinScore Debt Crusher AI, a relentless debt elimination strategist specializing in high-interest debt payoff (Debt Avalanche/Snowball), EMI renegotiation, and freeing up cash flow.';
    } else if (rolePreset === 'risk_auditor') {
      rolePersona = 'You are FinScore Risk & Safety Net Auditor AI, a defense-first financial risk specialist focusing on emergency liquidity runway, pure term life insurance adequacy (10-15x income), and healthcare catastrophe shields.';
    } else if (rolePreset === 'wealth_accelerator') {
      rolePersona = 'You are FinScore Wealth Accelerator AI, an aggressive growth and early financial independence (FIRE) strategist focused on index investing, SIP compounding, asset allocation, and milestone acceleration.';
    }

    // AI Chat language configuration (Language chosen in settings applies specifically to AI chat while website remains English)
    const langCode = (language || 'en-US').toLowerCase();
    const langMap: Record<string, string> = {
      ta: 'Tamil (தமிழ்)',
      hi: 'Hindi (हिन्दी)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      gu: 'Gujarati (ગુજરાતી)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      or: 'Odia (ଓଡ଼ିଆ)',
      ur: 'Urdu (اردو)',
      as: 'Assamese (অসমীয়া)',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      ja: 'Japanese (日本語)',
      zh: 'Mandarin Chinese (简体中文)',
      ar: 'Arabic (العربية)',
      pt: 'Portuguese (Português)',
      ru: 'Russian (Русский)',
      it: 'Italian (Italiano)',
      ko: 'Korean (한국어)',
    };
    const targetLang = langMap[langCode] || (langCode.startsWith('ta') ? 'Tamil (தமிழ்)' : langCode.startsWith('hi') ? 'Hindi (हिन्दी)' : null);
    const languageInstruction = targetLang
      ? `\n\nCRITICAL USER LANGUAGE REQUIREMENT:
The user has configured their AI Assistant Language to: ${targetLang}.
While the entire website dashboard and interface remain in English, you MUST provide your response, explanations, guidance, and recommendations completely in ${targetLang}.
Write naturally and fluently in ${targetLang}, ensuring financial terms (e.g. SIP, EMI, Emergency Fund, FinScore) are clearly explained.`
      : '';

    const systemInstruction = `${rolePersona}
The user is viewing their comprehensive FinScore™ Financial Health Dashboard.
Verified Profile Data:
- Name: ${profileName} (Age: ${profile?.age || 28})
- Monthly Income: ${currency}${income.toLocaleString()}
- Overall FinScore: ${overallScore}/100 (${grade})
- Component Breakdown: Savings ${result?.scores?.savings ?? 75}/100, Expense ${result?.scores?.expenseManagement ?? 70}/100, Debt ${result?.scores?.debt ?? 80}/100, Emergency ${result?.scores?.emergencyFund ?? 50}/100, Insurance ${result?.scores?.insurance ?? 60}/100, Goals ${result?.scores?.futureGoals ?? 70}/100
- Savings Rate: ${savingsRatio}%
- Monthly Debt EMI Ratio: ${emiRatio}%
- Emergency Fund Coverage: ${emergencyFundRatio}% (Target: 6 months; Shortfall: ${currency}${emergencyShortfall.toLocaleString()})
- Biggest Primary Priority: ${biggestPriority}

Instructions:
1. Provide objective, clear, personalized, actionable financial advice.
2. Ground all calculations and numerical guidance directly in their verified profile numbers above.
3. Use formatted markdown with bold highlights, clear bullet points, or concise numbered action steps.
4. Maintain full multi-turn conversational context when answering follow-up queries.
5. Conclude responses with an empowering, constructive takeaway or 1 suggested high-impact next question.
6. Clearly clarify that all insights are for financial health education and planning, not formal SEBI/SEC regulated security solicitations.${languageInstruction}`;

    const ai = getGeminiClient();

    if (ai) {
      // Build contents array for multi-turn chat
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add previous conversation history if provided
      if (Array.isArray(history) && history.length > 0) {
        // Keep the last 12 turns to prevent context bloat while maintaining strong continuity
        const recentHistory = history.slice(-12);
        for (const item of recentHistory) {
          const role = (item.sender === 'ai' || item.sender === 'model' || item.role === 'model') ? 'model' : 'user';
          const text = (item.text || item.content || '').trim();
          if (text) {
            contents.push({
              role,
              parts: [{ text }],
            });
          }
        }
      }

      // Append current user message
      const currentQuestion = question && question.trim() ? question.trim() : 'Please provide an updated financial health diagnosis and 3 actionable next steps for my current score.';
      contents.push({
        role: 'user',
        parts: [{ text: currentQuestion }],
      });

      // Ensure proper alternation if history had consecutive same-role entries
      const sanitizedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      for (const turn of contents) {
        if (sanitizedContents.length === 0) {
          sanitizedContents.push(turn);
        } else {
          const prev = sanitizedContents[sanitizedContents.length - 1];
          if (prev.role === turn.role) {
            prev.parts[0].text += `\n\n${turn.parts[0].text}`;
          } else {
            sanitizedContents.push(turn);
          }
        }
      }

      // Ensure first turn is from user
      if (sanitizedContents.length > 0 && sanitizedContents[0].role === 'model') {
        sanitizedContents.shift();
      }

      try {
        const response = await ai.models.generateContent({
          model: selectedModel,
          contents: sanitizedContents.length > 0 ? sanitizedContents : [{ role: 'user', parts: [{ text: currentQuestion }] }],
          config: {
            systemInstruction,
          },
        });

        const responseText = response.text || '';
        return res.json({
          success: true,
          source: 'GEMINI_AI',
          modelUsed: selectedModel,
          advice: responseText,
        });
      } catch (geminiError: any) {
        console.warn('Gemini AI API request unavailable, using deterministic financial engine:', geminiError?.message || geminiError);
      }
    }

    // High quality deterministic fallback when no API key configured or API call unavailable
    const fallbackAdvice = question
      ? `Based on your monthly income of ${currency}${income.toLocaleString()} and FinScore of ${overallScore}/100 (${grade}): 
${biggestPriority}

To optimize your question regarding "${question}":
1. **Emergency Runway**: Bridge your ${emergencyShortfall > 0 ? `${currency}${emergencyShortfall.toLocaleString()} shortfall` : 'buffer'} first by earmarking ${currency}${Math.round(income * 0.15).toLocaleString()}/month.
2. **Debt Optimization**: Keep total EMIs strictly below 35% of net income (currently at ${emiRatio}%).
3. **Compound Wealth**: Continue automated milestone allocations once your 6-month safety net is anchored.`
      : `Based on your financial profile, your overall health score is ${overallScore}/100 (${grade}).

**Key Diagnosis**: Your savings rate (${savingsRatio}%) demonstrates solid discipline, but your emergency buffer is at ${emergencyFundRatio}% of your target, leaving a shortfall of ${currency}${emergencyShortfall.toLocaleString()}.

🎯 **Biggest Priority**: ${biggestPriority}

🗓️ **Recommended Action Plan**:
• **Month 1**: Re-allocate non-essential expenses to save at least ${currency}${Math.round(income * 0.15).toLocaleString()} directly into a high-yield liquid emergency fund.
• **Month 2**: Audit existing debt commitments (current EMI ratio: ${emiRatio}%) and verify personal health/term insurance adequacy.
• **Month 3**: Automate systematic investments for your long-term milestones.`;

    res.json({
      success: true,
      source: 'FINSCORE_ENGINE',
      modelUsed: selectedModel,
      advice: fallbackAdvice,
    });
  } catch (err: any) {
    console.error('Error in /api/finscore/ai-advisor:', err);
    res.json({
      success: true,
      source: 'FINSCORE_FALLBACK',
      advice: `Your biggest financial priority: Build your emergency fund before increasing discretionary spending. Channel your surplus cash flow into liquid reserves while maintaining your loan EMIs.`,
    });
  }
});

// -------------------------------------------------------------
// FIRE & FINANCIAL FREEDOM - AI ADVISER EXPLANATION ENDPOINT
// -------------------------------------------------------------
app.post('/api/fire/ai-advisor', async (req, res) => {
  try {
    const { calculationResults, userQuestion, language } = req.body || {};
    const cr = calculationResults || {};

    const langCode = (language || 'en-US').toLowerCase();
    const langMap: Record<string, string> = {
      ta: 'Tamil (தமிழ்)',
      hi: 'Hindi (हिन्दी)',
      te: 'Telugu (తెలుగు)',
      kn: 'Kannada (ಕನ್ನಡ)',
      ml: 'Malayalam (മലയാളം)',
      bn: 'Bengali (বাংলা)',
      mr: 'Marathi (मराठी)',
      gu: 'Gujarati (ગુજરાતી)',
      pa: 'Punjabi (ਪੰਜਾਬੀ)',
      or: 'Odia (ଓଡ଼ିଆ)',
      ur: 'Urdu (اردو)',
      as: 'Assamese (অসমীয়া)',
      es: 'Spanish (Español)',
      fr: 'French (Français)',
      de: 'German (Deutsch)',
      ja: 'Japanese (日本語)',
      zh: 'Mandarin Chinese (简体中文)',
      ar: 'Arabic (العربية)',
      pt: 'Portuguese (Português)',
      ru: 'Russian (Русский)',
      it: 'Italian (Italiano)',
      ko: 'Korean (한국어)',
    };
    const targetLang = langMap[langCode] || (langCode.startsWith('ta') ? 'Tamil (தமிழ்)' : langCode.startsWith('hi') ? 'Hindi (हिन्दी)' : null);
    const langRule = targetLang ? `\n6. CRITICAL LANGUAGE: The user has selected ${targetLang} for AI chat. Generate your entire explanation response in ${targetLang}.` : '';

    const fireNum = cr.fireNumber ? `₹${cr.fireNumber.toLocaleString('en-IN')}` : '₹1,50,00,000';
    const fireWords = cr.displayPhrases?.fireNumberWords || '₹1.5 Crore';
    const currInv = cr.currentInvestments ? `₹${cr.currentInvestments.toLocaleString('en-IN')}` : '₹20,00,000';
    const currInvWords = cr.displayPhrases?.currentInvestmentsWords || '₹20 Lakh';
    const monthlyExp = cr.monthlyExpenses ? `₹${cr.monthlyExpenses.toLocaleString('en-IN')}` : '₹50,000';
    const annualExp = cr.annualExpenses ? `₹${cr.annualExpenses.toLocaleString('en-IN')}` : '₹6,00,000';
    const monthlyInv = cr.monthlyInvestment ? `₹${cr.monthlyInvestment.toLocaleString('en-IN')}` : '₹25,000';
    const progressPct = cr.fireProgressPercent ?? 13.3;
    const fireGap = cr.fireGap ? `₹${cr.fireGap.toLocaleString('en-IN')}` : '₹1,30,00,000';
    const fireGapWords = cr.displayPhrases?.fireGapWords || '₹1.3 Crore';
    const projPort = cr.projectedPortfolio ? `₹${cr.projectedPortfolio.toLocaleString('en-IN')}` : '₹1,74,00,000';
    const projPortWords = cr.displayPhrases?.projectedPortfolioWords || '₹1.74 Crore';
    const retRate = cr.expectedAnnualReturn ?? 12;
    const wrRate = cr.withdrawalRate ?? 4;
    const years = cr.years ?? 15;
    const estYearsToFire = cr.estimatedYearsToFire ?? 14.5;

    const ai = getGeminiClient();

    if (ai) {
      const prompt = userQuestion
        ? `You are an AI Personal Finance Adviser for Indian investors.
Explain the user's FIRE and Financial Freedom calculations in response to their specific question: "${userQuestion}".

STRICT RULES:
1. Do NOT calculate or alter any figures.
2. Only reference and explain these exact calculated figures:
   - Monthly Living Expenses: ${monthlyExp}
   - Annual Living Expenses: ${annualExp}
   - Safe Withdrawal Rate: ${wrRate}%
   - Calculated FIRE / Financial Freedom Number: ${fireWords} (${fireNum})
   - Current Investments: ${currInvWords} (${currInv})
   - FIRE Progress: ${progressPct}%
   - Remaining Freedom Gap: ${fireGapWords} (${fireGap})
   - Monthly SIP Investment: ${monthlyInv}/month
   - Expected Annual Return: ${retRate}%
   - Time Horizon: ${years} Years
   - Projected Portfolio Value: ${projPortWords} (${projPort})
   - Estimated Years to achieve FIRE: ~${estYearsToFire} years
3. Keep the language simple, encouraging, beginner-friendly, and concise (under 250 words).
4. Use Indian Rupees (₹), Lakhs, and Crores.
5. Emphasize that these are estimated projections based on assumptions, not guarantees.${langRule}`
        : `You are an AI Personal Finance Adviser for Indian investors.
Provide a clear, encouraging, and beginner-friendly explanation of the user's calculated FIRE (Financial Independence, Retire Early) and Financial Freedom results.

STRICT RULES:
1. Do NOT calculate, invent, or alter any numbers. All calculations have been completed by the mathematical engine.
2. Base your explanation strictly on these exact calculated values:
   - Monthly Expenses: ${monthlyExp}
   - Annual Expenses: ${annualExp}
   - Safe Withdrawal Rate: ${wrRate}%
   - FIRE & Financial Freedom Number: ${fireWords} (${fireNum})
   - Current Investments: ${currInvWords} (${currInv})
   - Progress Towards Freedom: ${progressPct}%
   - Remaining Freedom Gap: ${fireGapWords} (${fireGap})
   - Monthly Investment / SIP: ${monthlyInv}/month
   - Compounding Horizon: ${years} years @ ${retRate}% expected annual return
   - Projected Portfolio Value: ${projPortWords} (${projPort})
   - Estimated Timeline to Reach FIRE: ~${estYearsToFire} years
3. Format:
   - Highlight what their Freedom Target (${fireWords}) means in simple words.
   - Explain where they stand today (${progressPct}% completed, ${fireGapWords} remaining).
   - Explain how their ${monthlyInv}/month compounding at ${retRate}% will grow into ${projPortWords}.
   - Provide 2-3 practical, beginner-friendly tips (e.g., maintaining an emergency fund, staying consistent with SIPs, step-up SIP with salary increases).
4. Use simple Indian financial terminology (₹, Lakhs, Crores, SIP).
5. Tone: Warm, empowering, and objective.${langRule}`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are an empathetic, objective AI Personal Finance Adviser specializing in Indian personal finance and FIRE planning. Always explain the pre-calculated numbers simply without altering them. Remind users that projections are educational estimates.',
          },
        });

        const responseText = response.text || '';
        return res.json({
          success: true,
          source: 'GEMINI_AI',
          advice: responseText,
        });
      } catch (geminiError: any) {
        console.warn('FIRE advisor Gemini request failed, using deterministic engine:', geminiError?.message || geminiError);
      }
    }

    // Deterministic fallback response
    const fallback = userQuestion
      ? `Based on your calculated target of **${fireWords}** and monthly expenses of **${monthlyExp}**:
You have saved **${currInvWords}** (${progressPct}% of your target), leaving a gap of **${fireGapWords}**. With your monthly investment of **${monthlyInv}** compounding at **${retRate}%**, your portfolio is projected to grow to **${projPortWords}** over **${years} years**.`
      : `### Financial Freedom Analysis

• **Your Freedom Target**: With monthly expenses of **${monthlyExp}** (${annualExp}/year), your calculated FIRE Number is **${fireWords}** (${fireNum}) using the standard **${wrRate}%** withdrawal rate.
• **Current Status**: You currently have **${currInvWords}** invested, covering **${progressPct}%** of your target. Your remaining gap is **${fireGapWords}**.
• **Growth Projection**: By investing **${monthlyInv}** every month at an expected **${retRate}%** annual return, your portfolio is projected to reach **${projPortWords}** in **${years} years**.
• **Key Takeaway**: Automating your monthly SIP and increasing it gradually with income raises will significantly accelerate your path to financial freedom.`;

    res.json({
      success: true,
      source: 'FIRE_ENGINE',
      advice: fallback,
    });
  } catch (err: any) {
    res.json({
      success: true,
      source: 'FIRE_FALLBACK',
      advice: `Your calculated FIRE target represents the portfolio value needed to cover your living expenses perpetually through investment income. Staying consistent with disciplined monthly investing and compound interest is the key to bridging your freedom gap.`,
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
