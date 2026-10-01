import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Coins, 
  ShieldAlert, 
  Calendar, 
  DollarSign, 
  Tag, 
  Building2, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp, 
  ExternalLink,
  Plus, 
  ArrowLeft, 
  Sparkles, 
  Search,
  Layers,
  Clock,
  Landmark,
  Shield,
  Heart,
  Briefcase,
  Percent,
  FileText,
  PiggyBank,
  Wallet,
  Home,
  Car,
  CreditCard,
  GraduationCap,
  ShoppingBag,
  Calculator,
  User,
  ShieldCheck,
  Gem,
  Building,
  RefreshCw
} from 'lucide-react';
import { useFinance, CURRENCY_CONFIGS } from '../context/FinanceContext';
import { 
  AssetCategory, 
  LiabilityCategory, 
  CurrencyCode,
  DEFAULT_ASSET_TAGS
} from '../types';
import { 
  ASSET_TAXONOMY, 
  LIABILITY_TAXONOMY, 
  AssetCategoryInfo,
  EQUITY_SUBTYPES,
  DEBT_GROUPS,
  DEBT_SUBTYPES,
  AssetSubType,
  LIABILITY_GROUPS,
  SECURED_LIABILITY_SUBTYPES,
  UNSECURED_LIABILITY_SUBTYPES,
  ALL_LIABILITY_SUBTYPES,
  LiabilitySubType,
  LiabilityGroup
} from '../data/assetTaxonomy';
import { 
  MasterAsset, 
  marketDataService, 
  getGoogleFinanceUrl, 
  MOCK_MASTER_ASSETS 
} from '../services/marketDataService';

export const QuickAddModal: React.FC = () => {
  const { 
    isQuickAddOpen, 
    closeQuickAdd, 
    quickAddType, 
    accounts, 
    currency,
    addTransaction, 
    addAsset, 
    addLiability 
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'asset' | 'liability'>('asset');

  // Asset Flow Modes:
  // 'hub': Default component shown first when adding an asset (Features Equity, Debt, and other asset classes)
  // 'equity_menu': Shows the 10 specific Equity investment types
  // 'debt_menu': Shows the 7 categorized Debt groups & types (FD/RD, Bonds, Govt Schemes, Debt MFs, Insurance, Retirement, Other)
  // 'category_menu': Shows sub-types for other categories (Real Estate, Commodities, Cash, Crypto, Alternatives, Other)
  // 'search': Focused live search tailored to the chosen asset type (e.g. only Direct Stocks, only Equity MFs, only ETFs, only REITs)
  // 'manual_form': Tailored form for contractual/fixed holdings (Bank FD, PPF, EPF, Loan Given, ESOP, etc.)
  // 'configure': Configure shares, buy price, broker after selecting from search
  // 'other_direct': Direct fast entry for Other assets (Name, Currency, and Total Investment)
  const [assetFlowMode, setAssetFlowMode] = useState<
    'hub' | 'equity_menu' | 'debt_menu' | 'category_menu' | 'search' | 'manual_form' | 'configure' | 'other_direct'
  >('hub');
  
  const [activeAssetClass, setActiveAssetClass] = useState<string>('Equity');
  const [selectedSubTypeInfo, setSelectedSubTypeInfo] = useState<AssetSubType | null>(null);

  // Market Search State
  const [marketSearchQuery, setMarketSearchQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<'all' | 'stock' | 'mutual_fund' | 'equity_mf' | 'hybrid_mf' | 'arbitrage_mf' | 'debt_mf' | 'liquid_mf' | 'etf' | 'reit'>('all');
  const [searchResults, setSearchResults] = useState<MasterAsset[]>(MOCK_MASTER_ASSETS.slice(0, 12));
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMasterAsset, setSelectedMasterAsset] = useState<MasterAsset | null>(null);

  // Holding Configuration State (Units, Buy Price, Broker)
  const [holdingShares, setHoldingShares] = useState('1');
  const [holdingBuyPrice, setHoldingBuyPrice] = useState('');
  const [holdingBuyDate, setHoldingBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [holdingInstitution, setHoldingInstitution] = useState('Zerodha');
  const [holdingTags, setHoldingTags] = useState<string[]>(['Long-term Savings']);
  const [holdingCustomTag, setHoldingCustomTag] = useState('');

  // Manual Asset Form State
  const [selectedAssetCategory, setSelectedAssetCategory] = useState<AssetCategoryInfo | null>(null);
  const [manualAssetName, setManualAssetName] = useState('');
  const [manualAssetCurrency, setManualAssetCurrency] = useState<CurrencyCode>(currency);
  const [manualAssetValue, setManualAssetValue] = useState('');
  const [manualAssetCostBasis, setManualAssetCostBasis] = useState('');
  const [manualAssetInstitution, setManualAssetInstitution] = useState('');
  const [manualInterestRate, setManualInterestRate] = useState('');
  const [manualTenure, setManualTenure] = useState('3 Years');
  const [manualMaturityDate, setManualMaturityDate] = useState('');
  const [manualCompounding, setManualCompounding] = useState('Cumulative (at Maturity)');
  const [manualSumAssured, setManualSumAssured] = useState('');
  const [manualAnnualPremium, setManualAnnualPremium] = useState('');
  const [manualAccountNumber, setManualAccountNumber] = useState('');
  const [manualBorrowerName, setManualBorrowerName] = useState('');
  const [manualStrikePrice, setManualStrikePrice] = useState('');
  const [manualFairMarketValue, setManualFairMarketValue] = useState('');
  const [manualShares, setManualShares] = useState('');
  const [manualVestingDate, setManualVestingDate] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualAssetIsLiquid, setManualAssetIsLiquid] = useState(true);
  const [manualTags, setManualTags] = useState<string[]>(['Long-term Savings']);
  const [manualCustomTag, setManualCustomTag] = useState('');

  // Live Price State for Add Asset (Commodities: Gold, Silver, and Crypto)
  const [isLivePriceActive, setIsLivePriceActive] = useState(false);
  const [liveAssetType, setLiveAssetType] = useState<'commodity' | 'crypto'>('commodity');
  const [commodityLiveType, setCommodityLiveType] = useState<'GOLD' | 'SILVER'>('GOLD');
  const [commodityUnit, setCommodityUnit] = useState<'gram' | '10g' | 'oz' | 'kg'>('gram');
  const [commodityQty, setCommodityQty] = useState('');
  const [cryptoSymbol, setCryptoSymbol] = useState('BTC');
  const [cryptoQty, setCryptoQty] = useState('');
  const [livePricePerUnit, setLivePricePerUnit] = useState<number | null>(null);
  const [livePriceCurrency, setLivePriceCurrency] = useState<string>('INR');
  const [livePriceChange24h, setLivePriceChange24h] = useState<number | null>(null);
  const [isFetchingLivePrice, setIsFetchingLivePrice] = useState(false);
  const [livePriceSource, setLivePriceSource] = useState('');
  const [commodityQuoteDetails, setCommodityQuoteDetails] = useState<any>(null);

  // Fetch live market price for Commodities & Crypto
  const fetchAndApplyLivePrice = async (targetTicker: string, targetType: string = 'commodity', overrideQty?: string) => {
    setIsFetchingLivePrice(true);
    try {
      const res = await fetch(`/api/market/quote?ticker=${encodeURIComponent(targetTicker)}&type=${targetType}&currency=${currency}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.quote) {
          const q = data.quote;
          setLivePricePerUnit(q.currentPrice);
          setLivePriceCurrency(q.currency || currency);
          setLivePriceChange24h(q.priceChange24h ?? 0);
          setLivePriceSource(q.source || 'LIVE_API');
          if (targetType === 'commodity') {
            setCommodityQuoteDetails(q);
          }

          // Auto-calculate total value based on quantity
          const activeQty = overrideQty !== undefined 
            ? parseFloat(overrideQty) 
            : (targetType === 'commodity' ? parseFloat(commodityQty) : parseFloat(cryptoQty));

          if (!isNaN(activeQty) && activeQty > 0 && q.currentPrice > 0) {
            const calculatedTotal = Math.round(activeQty * q.currentPrice * 100) / 100;
            setManualAssetValue(calculatedTotal.toString());
            setManualAssetCostBasis(calculatedTotal.toString());
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch live commodity / crypto price', err);
    } finally {
      setIsFetchingLivePrice(false);
    }
  };

  // Liability state & Flow Modes (Hub first, then Secured/Unsecured menus, Group menus, or Form)
  const [liabilityFlowMode, setLiabilityFlowMode] = useState<
    'hub' | 'secured_menu' | 'unsecured_menu' | 'group_menu' | 'form'
  >('hub');
  const [selectedLiabilitySubType, setSelectedLiabilitySubType] = useState<LiabilitySubType | null>(null);
  const [selectedLiabilityGroup, setSelectedLiabilityGroup] = useState<LiabilityGroup | null>(null);
  const [liabilitySearchQuery, setLiabilitySearchQuery] = useState('');

  const [selectedLiabType, setSelectedLiabType] = useState<string>('Home Loan');
  const [liabName, setLiabName] = useState('');
  const [liabBalance, setLiabBalance] = useState('');
  const [liabOriginalAmount, setLiabOriginalAmount] = useState('');
  const [liabInterestRate, setLiabInterestRate] = useState('');
  const [liabMonthlyPayment, setLiabMonthlyPayment] = useState('');
  const [liabMinPayment, setLiabMinPayment] = useState('');
  const [liabTenureMonths, setLiabTenureMonths] = useState('');
  const [liabDueDate, setLiabDueDate] = useState('5');
  const [liabInstitution, setLiabInstitution] = useState('');
  const [liabCollateral, setLiabCollateral] = useState('');
  const [liabCreditLimit, setLiabCreditLimit] = useState('');
  const [liabNotes, setLiabNotes] = useState('');

  // Transaction state (Income / Expense)
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState<string>('Salary & Wages');
  const [txAccountId, setTxAccountId] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txIsRecurring, setTxIsRecurring] = useState(false);

  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  // Quick EMI calculation helper: P * r * (1+r)^n / ((1+r)^n - 1)
  const calculateEMI = (p: number, rAnnual: number, nMonths: number) => {
    if (p <= 0 || rAnnual <= 0 || nMonths <= 0) return 0;
    const r = rAnnual / 12 / 100;
    const emi = (p * r * Math.pow(1 + r, nMonths)) / (Math.pow(1 + r, nMonths) - 1);
    return Math.round(emi);
  };

  const selectLiabilitySubType = (subType: LiabilitySubType) => {
    setSelectedLiabilitySubType(subType);
    setSelectedLiabType(subType.name);
    setLiabName(`${subType.suggestedCreditors?.[0] || ''} ${subType.name}`.trim());
    setLiabInterestRate(subType.defaultInterestRate ? subType.defaultInterestRate.toString() : '');
    setLiabInstitution(subType.suggestedCreditors?.[0] || 'HDFC Bank');
    if (subType.isSecured) {
      setLiabCollateral(
        subType.group === 'Home & Property' 
          ? 'Primary Residential Property' 
          : subType.group === 'Vehicle Loans' 
          ? 'Vehicle Hypothecation' 
          : subType.id === 'gold-loan' 
          ? 'Pledged Gold Ornaments' 
          : 'Pledged Assets / Securities'
      );
    } else {
      setLiabCollateral('');
    }
    setLiabilityFlowMode('form');
  };

  // Initialize or Reset Modal when opened
  useEffect(() => {
    if (quickAddType) {
      setActiveTab(quickAddType);
      if (quickAddType === 'asset') {
        // First show the Asset Class Hub component!
        setAssetFlowMode('hub');
        setSelectedMasterAsset(null);
        setSelectedSubTypeInfo(null);
        setSelectedAssetCategory(null);
        setManualAssetCurrency(currency);
      } else if (quickAddType === 'liability') {
        // First show the Liability Category Hub component!
        setLiabilityFlowMode('hub');
        setSelectedLiabilitySubType(null);
        setSelectedLiabilityGroup(null);
        setLiabilitySearchQuery('');
      }
    }
  }, [quickAddType, isQuickAddOpen]);

  useEffect(() => {
    if (accounts.length > 0 && !txAccountId) {
      setTxAccountId(accounts[0].id);
    }
  }, [accounts, txAccountId]);

  useEffect(() => {
    if (activeTab === 'income') {
      setTxCategory('Salary & Wages');
    } else if (activeTab === 'expense') {
      setTxCategory('Food & Groceries');
    }
  }, [activeTab]);

  // Live Market Search Effect
  useEffect(() => {
    if (activeTab !== 'asset' || (assetFlowMode !== 'search' && assetFlowMode !== 'configure')) {
      return;
    }

    let isCurrent = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await marketDataService.search(
          marketSearchQuery, 
          marketFilter === 'all' ? undefined : marketFilter
        );
        if (isCurrent) {
          setSearchResults(results);
        }
      } catch (err) {
        // Fallback
      } finally {
        if (isCurrent) setIsSearching(false);
      }
    }, marketSearchQuery.trim() ? 200 : 0);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [marketSearchQuery, marketFilter, activeTab, assetFlowMode]);

  // Auto-calculate ESOP total valuation
  useEffect(() => {
    if (selectedSubTypeInfo?.id === 'esop-rsu' && manualShares && manualFairMarketValue) {
      const sh = parseFloat(manualShares) || 0;
      const fmv = parseFloat(manualFairMarketValue) || 0;
      if (sh > 0 && fmv > 0) {
        setManualAssetValue((sh * fmv).toFixed(2));
      }
    }
  }, [manualShares, manualFairMarketValue, selectedSubTypeInfo]);

  if (!isQuickAddOpen) return null;

  const currentSymbol = CURRENCY_CONFIGS[currency]?.symbol || '₹';

  // Quick Search Chips based on active filter
  const getQuickSearchChips = () => {
    if (marketFilter === 'stock') {
      return [
        { label: 'Reliance', query: 'Reliance' },
        { label: 'TCS', query: 'TCS' },
        { label: 'HDFC Bank', query: 'HDFC Bank' },
        { label: 'Infosys', query: 'INFY' },
        { label: 'Tata Motors', query: 'TATAMOTORS' },
        { label: 'Apple', query: 'AAPL' },
        { label: 'Nvidia', query: 'NVDA' }
      ];
    } else if (marketFilter === 'equity_mf') {
      return [
        { label: 'Parag Parikh Flexi Cap', query: 'Parag Parikh Flexi Cap' },
        { label: 'Quant Small Cap', query: 'Quant Small Cap' },
        { label: 'Mirae Asset Large & Midcap', query: 'Mirae Asset' },
        { label: 'HDFC Flexi Cap', query: 'HDFC Flexi Cap' },
        { label: 'SBI Bluechip', query: 'SBI Bluechip' }
      ];
    } else if (marketFilter === 'hybrid_mf') {
      return [
        { label: 'ICICI Multi-Asset', query: 'ICICI Prudential Multi Asset' },
        { label: 'SBI Equity Hybrid', query: 'SBI Equity Hybrid' },
        { label: 'HDFC Balanced Advantage', query: 'HDFC Balanced Advantage' },
        { label: 'Kotak Balanced Advantage', query: 'Kotak Balanced Advantage' }
      ];
    } else if (marketFilter === 'arbitrage_mf') {
      return [
        { label: 'Kotak Equity Arbitrage', query: 'Kotak Equity Arbitrage' },
        { label: 'SBI Arbitrage Fund', query: 'SBI Arbitrage' },
        { label: 'Invesco Arbitrage', query: 'Invesco India Arbitrage' }
      ];
    } else if (marketFilter === 'debt_mf') {
      return [
        { label: 'HDFC Short Term', query: 'HDFC Short Term' },
        { label: 'Aditya Birla Corporate Bond', query: 'Aditya Birla Sun Life Corporate Bond' },
        { label: 'ICICI Prudential All Seasons', query: 'ICICI Prudential All Seasons Bond' }
      ];
    } else if (marketFilter === 'liquid_mf') {
      return [
        { label: 'Quantum Liquid', query: 'Quantum Liquid' },
        { label: 'Nippon India Liquid', query: 'Nippon India Liquid' },
        { label: 'SBI Liquid Fund', query: 'SBI Liquid' },
        { label: 'ICICI Liquid', query: 'ICICI Prudential Liquid' }
      ];
    } else if (marketFilter === 'reit') {
      return [
        { label: 'Embassy REIT', query: 'Embassy' },
        { label: 'Mindspace REIT', query: 'Mindspace' },
        { label: 'Brookfield REIT', query: 'Brookfield' },
        { label: 'Nexus Select', query: 'Nexus' },
        { label: 'Realty Income (O)', query: 'O' },
        { label: 'Prologis (PLD)', query: 'PLD' },
        { label: 'American Tower (AMT)', query: 'AMT' },
        { label: 'Digital Realty (DLR)', query: 'DLR' },
        { label: 'Simon Property (SPG)', query: 'SPG' }
      ];
    } else if (marketFilter === 'etf') {
      return selectedSubTypeInfo?.group === 'Mutual Funds / ETF' ? [
        { label: 'BHARAT BOND ETF', query: 'BHARAT' },
        { label: 'LIQUIDBEES', query: 'LIQUIDBEES' },
        { label: 'GSEC10YBEES', query: 'GSEC' }
      ] : [
        { label: 'NIFTYBEES', query: 'NIFTYBEES' },
        { label: 'BANKBEES', query: 'BANKBEES' },
        { label: 'GOLDBEES', query: 'GOLDBEES' },
        { label: 'MON100', query: 'MON100' },
        { label: 'ITBEES', query: 'ITBEES' }
      ];
    }
    return [
      { label: 'Reliance', query: 'Reliance' },
      { label: 'TCS', query: 'TCS' },
      { label: 'HDFC Flexi Cap', query: 'HDFC Flexi Cap' },
      { label: 'NIFTYBEES', query: 'NIFTYBEES' },
      { label: 'SBI Bluechip', query: 'SBI Bluechip' }
    ];
  };

  // Helper to open manual form pre-filled with specific subtype details
  const openManualFormForSubtype = (sub: AssetSubType, categoryName: string) => {
    setSelectedSubTypeInfo(sub);
    setActiveAssetClass(categoryName);
    setSelectedAssetCategory(ASSET_TAXONOMY.find(c => c.id === categoryName) || null);

    setManualAssetName(sub.name);
    setManualAssetValue('');
    setManualAssetCostBasis('');
    setManualAssetInstitution(sub.suggestedInstitutions?.[0] || '');
    setManualAssetIsLiquid(sub.isDefaultLiquid ?? true);
    setManualTags([sub.badge || 'Long-term Savings']);
    setManualBorrowerName('');
    setManualInterestRate(
      sub.id === 'ppf' ? '7.1' :
      sub.id === 'epf-vpf' ? '8.25' :
      sub.id === 'ssy' ? '8.2' :
      sub.id === 'bank-fd' ? '7.25' :
      sub.id === 'corporate-fd' ? '8.6' :
      sub.id === 'loan-given' ? '0' : ''
    );
    setManualTenure(sub.id === 'ppf' ? '15 Years' : '3 Years');
    setManualMaturityDate('');
    setManualCompounding('Cumulative (at Maturity)');
    setManualSumAssured('');
    setManualAnnualPremium('');
    setManualAccountNumber('');
    setManualStrikePrice('');
    setManualFairMarketValue('');
    setManualShares('');
    setManualVestingDate('');
    setManualNotes('');

    // Live Price only for Gold and Crypto Coins & Tokens ("in gold have gold only live price only show and Crypto Coins & Toke show Crypto Coin live price only otherwise you don't show any price")
    const isGold = sub.id.includes('gold') || sub.name.toLowerCase().includes('gold') || (categoryName === 'Commodities' && !sub.id.includes('silver') && !sub.name.toLowerCase().includes('silver'));
    const isCryptoCoins = (categoryName === 'Crypto' || sub.id.includes('crypto')) && (sub.id === 'crypto-spot' || sub.name.toLowerCase().includes('coin') || sub.name.toLowerCase().includes('token') || sub.name.toLowerCase().includes('btc'));

    if (isGold) {
      setIsLivePriceActive(true);
      setLiveAssetType('commodity');
      setCommodityLiveType('GOLD');
      setCommodityUnit('gram');
      setCommodityQty('20');
      fetchAndApplyLivePrice('GOLD-GRAM', 'commodity', '20');
    } else if (isCryptoCoins) {
      setIsLivePriceActive(true);
      setLiveAssetType('crypto');
      setCryptoSymbol('BTC');
      setCryptoQty('0.25');
      fetchAndApplyLivePrice('BTC', 'crypto', '0.25');
    } else {
      setIsLivePriceActive(false);
      setLiveAssetType('commodity');
      setCommodityLiveType('GOLD');
      setLivePricePerUnit(null);
      setLivePriceChange24h(null);
    }

    setAssetFlowMode('manual_form');
  };

  // Helper to trigger dedicated focused search
  const openDedicatedSearch = (sub: AssetSubType, categoryName: string, filterType: any) => {
    setSelectedSubTypeInfo(sub);
    setActiveAssetClass(categoryName);
    setMarketFilter(filterType);
    setMarketSearchQuery('');
    setAssetFlowMode('search');
  };

  // Helper to open direct fast entry for Other assets (Name, Cur, and Total Investment)
  const openDirectOtherForm = () => {
    setActiveAssetClass('Other');
    const otherCat = ASSET_TAXONOMY.find(c => c.id === 'Other') || null;
    setSelectedAssetCategory(otherCat);
    setSelectedSubTypeInfo({
      id: 'custom-asset',
      name: 'Other Asset Holding',
      description: 'Direct entry: specify name, currency, and total investment'
    });
    setManualAssetName('');
    setManualAssetCurrency(currency);
    setManualAssetValue('');
    setManualAssetCostBasis('');
    setManualAssetInstitution('Personal / Direct');
    setManualAssetIsLiquid(false);
    setManualNotes('');
    setManualTags(['Direct Asset']);
    setIsLivePriceActive(false);
    setLivePricePerUnit(null);
    setAssetFlowMode('other_direct');
  };

  // Submit direct fast entry for Other asset
  const handleSaveDirectOtherAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualAssetValue) || 0;
    const cost = manualAssetCostBasis ? parseFloat(manualAssetCostBasis) : val;

    addAsset({
      name: manualAssetName || 'Other Asset Holding',
      category: 'Other',
      subType: 'Other Asset Holding',
      institution: manualAssetInstitution || 'Personal / Direct',
      value: val,
      costBasis: cost,
      currency: manualAssetCurrency,
      isLiquid: manualAssetIsLiquid,
      tags: manualTags.length > 0 ? manualTags : ['Direct Asset'],
      purpose: manualTags[0] || 'Direct Asset',
      assetType: 'manual',
      notes: manualNotes || undefined,
      lastPriceSyncedAt: new Date().toISOString()
    });

    setSubmittedMessage(`Added ${manualAssetName || 'Other Asset'} (${manualAssetCurrency} ${val.toLocaleString()}) directly!`);
    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
    }, 1200);
  };

  // Initiate [+ Add] for a security from live search
  const handleInitiateAdd = (asset: MasterAsset) => {
    setSelectedMasterAsset(asset);
    setHoldingShares('1');
    setHoldingBuyPrice(asset.latest_price ? asset.latest_price.toFixed(2) : '100.00');
    setHoldingBuyDate(new Date().toISOString().split('T')[0]);

    if (asset.asset_type === 'mutual_fund' || asset.exchange === 'MF') {
      setHoldingInstitution(asset.amc || 'Groww / Coin / Kuvera / CAMS');
    } else if (asset.exchange === 'NSE' || asset.exchange === 'BSE') {
      setHoldingInstitution('Zerodha');
    } else if (asset.asset_type === 'crypto') {
      setHoldingInstitution('Hardware Ledger / CoinDCX');
    } else {
      setHoldingInstitution('Brokerage');
    }

    setAssetFlowMode('configure');
  };

  // Submit configured market security holding
  const handleConfirmAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMasterAsset) return;

    const shares = parseFloat(holdingShares) || 1;
    const buyPrice = parseFloat(holdingBuyPrice) || selectedMasterAsset.latest_price || 100;
    const currentPrice = selectedMasterAsset.latest_price || buyPrice;
    const totalValue = Math.round(shares * currentPrice * 100) / 100;
    const costBasis = Math.round(shares * buyPrice * 100) / 100;

    let category: AssetCategory = 'Equity';
    if (activeAssetClass === 'Debt' || selectedSubTypeInfo?.group || selectedSubTypeInfo?.id === 'debt-mf' || selectedSubTypeInfo?.id === 'liquid-fund' || selectedSubTypeInfo?.id === 'debt-etf') {
      category = 'Debt';
    } else if (selectedMasterAsset.asset_type === 'crypto') {
      category = 'Crypto';
    } else if (selectedMasterAsset.asset_type === 'commodity') {
      category = 'Commodities';
    } else if (selectedMasterAsset.asset_type === 'reit' || selectedMasterAsset.isReit || activeAssetClass === 'Real Estate' || selectedSubTypeInfo?.id === 'reit' || marketFilter === 'reit') {
      category = 'Real Estate';
    } else {
      category = 'Equity';
    }

    const isReitItem = selectedMasterAsset.asset_type === 'reit' || selectedMasterAsset.isReit || category === 'Real Estate';

    const subTypeName = (isReitItem)
      ? 'REITs (Real Estate Trusts)'
      : (selectedSubTypeInfo?.name || (
          selectedMasterAsset.asset_type === 'mutual_fund' 
            ? 'Equity Mutual Fund' 
            : selectedMasterAsset.asset_type === 'etf' 
              ? 'ETF' 
              : 'Direct Stock'
        ));

    addAsset({
      name: selectedMasterAsset.name,
      category: category,
      subType: subTypeName,
      institution: holdingInstitution,
      value: totalValue,
      costBasis: costBasis,
      currency: (selectedMasterAsset.currency === 'USD' ? 'USD' : (selectedMasterAsset.currency === 'INR' ? 'INR' : currency)) as CurrencyCode,
      isLiquid: true,
      tags: holdingTags.length > 0 ? holdingTags : [selectedSubTypeInfo?.badge || (isReitItem ? 'REIT Investment' : 'Long-term Savings')],
      purpose: holdingTags[0] || selectedSubTypeInfo?.badge || (isReitItem ? 'Real Estate Income & Growth' : 'Long-term Savings'),
      masterAssetId: selectedMasterAsset.id,
      isin: selectedMasterAsset.isin,
      bseCode: selectedMasterAsset.exchange === 'BSE' ? selectedMasterAsset.symbol : undefined,
      ticker: selectedMasterAsset.symbol,
      exchange: selectedMasterAsset.exchange,
      assetType: isReitItem ? 'reit' : selectedMasterAsset.asset_type,
      schemeCode: selectedMasterAsset.scheme_code,
      fundHouse: selectedMasterAsset.amc,
      shares: shares,
      buyPrice: buyPrice,
      buyDate: holdingBuyDate,
      currentPrice: currentPrice,
      priceChange24h: selectedMasterAsset.price_change_percent,
      priceChange24hAmount: selectedMasterAsset.price_change,
      dataStatus: selectedMasterAsset.data_status,
      dataSource: selectedMasterAsset.data_source,
      plan: selectedMasterAsset.plan,
      option: selectedMasterAsset.option,
      navDate: selectedMasterAsset.nav_date,
      lastPriceSyncedAt: new Date().toISOString(),
      autoSyncMarketPrice: true
    });

    setSubmittedMessage(`Added ${selectedMasterAsset.name} to your portfolio!`);
    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
    }, 1200);
  };

  // Submit manual / contractual asset
  const handleSaveManualAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualAssetValue) || 0;
    const cost = manualAssetCostBasis ? parseFloat(manualAssetCostBasis) : val;

    // Live Price derivation: Gold only for commodities, and Crypto Coins & Tokens only for crypto
    const isGoldCommodity = isLivePriceActive && liveAssetType === 'commodity';
    const isCrypto = isLivePriceActive && liveAssetType === 'crypto';

    let categoryName: AssetCategory = (activeAssetClass as AssetCategory) || (selectedAssetCategory?.id as AssetCategory) || 'Other';
    if (isGoldCommodity && categoryName !== 'Commodities') {
      categoryName = 'Commodities';
    } else if (isCrypto && categoryName !== 'Crypto') {
      categoryName = 'Crypto';
    }

    const subTypeName = isGoldCommodity 
      ? 'Physical Gold' 
      : isCrypto 
      ? 'Crypto Coins & Tokens' 
      : (selectedSubTypeInfo?.name || 'Custom Asset');

    const defaultAssetName = isGoldCommodity 
      ? `Gold 24K Spot (${commodityUnit})`
      : isCrypto 
      ? `${cryptoSymbol} Crypto`
      : subTypeName;

    const tickerVal = isGoldCommodity 
      ? `GOLD-${commodityUnit.toUpperCase()}`
      : isCrypto 
      ? cryptoSymbol 
      : undefined;

    const sharesVal = isGoldCommodity 
      ? parseFloat(commodityQty) || parseFloat(manualShares) || undefined
      : isCrypto
      ? parseFloat(cryptoQty) || parseFloat(manualShares) || undefined
      : parseFloat(manualShares) || undefined;

    const assetTypeVal = isGoldCommodity ? 'commodity' : isCrypto ? 'crypto' : 'manual';
    const exchangeVal = isGoldCommodity ? 'COMMODITY' : isCrypto ? 'CRYPTO' : undefined;

    // Show price ONLY for Gold and Crypto Coins & Tokens when live price is activated, otherwise do not show any price
    const currentPriceVal = (isLivePriceActive && (isGoldCommodity || isCrypto)) ? (livePricePerUnit || undefined) : undefined;
    const priceChangeVal = (isLivePriceActive && (isGoldCommodity || isCrypto)) ? (livePriceChange24h || undefined) : undefined;

    addAsset({
      name: manualAssetName || defaultAssetName,
      category: categoryName,
      subType: subTypeName,
      institution: manualAssetInstitution || (subTypeName === 'Loan Given' ? (manualBorrowerName ? `Borrower: ${manualBorrowerName}` : 'Personal Loan Given') : 'Personal Holding'),
      value: val,
      costBasis: cost,
      currency: (manualAssetCurrency || currency) as CurrencyCode,
      isLiquid: manualAssetIsLiquid,
      tags: manualTags.length > 0 ? manualTags : [selectedSubTypeInfo?.badge || 'Long-term Savings'],
      purpose: manualTags[0] || selectedSubTypeInfo?.badge || 'Long-term Savings',
      assetType: assetTypeVal,
      ticker: tickerVal,
      exchange: exchangeVal,
      shares: sharesVal,
      currentPrice: currentPriceVal,
      autoSyncMarketPrice: Boolean(isLivePriceActive && (isGoldCommodity || isCrypto)),
      priceChange24h: priceChangeVal,
      interestRate: manualInterestRate ? parseFloat(manualInterestRate) : undefined,
      maturityDate: manualMaturityDate || undefined,
      tenure: manualTenure || undefined,
      compoundingFrequency: manualCompounding || undefined,
      sumAssured: manualSumAssured ? parseFloat(manualSumAssured) : undefined,
      annualPremium: manualAnnualPremium ? parseFloat(manualAnnualPremium) : undefined,
      strikePrice: manualStrikePrice ? parseFloat(manualStrikePrice) : undefined,
      fairMarketValue: manualFairMarketValue ? parseFloat(manualFairMarketValue) : undefined,
      vestingDate: manualVestingDate || undefined,
      accountNumberMasked: manualAccountNumber || undefined,
      borrowerName: manualBorrowerName || undefined,
      notes: manualNotes || (manualBorrowerName ? `Loan given to ${manualBorrowerName}` : undefined),
      lastPriceSyncedAt: new Date().toISOString(),
    });

    setSubmittedMessage(`Added ${manualAssetName || subTypeName} to your portfolio!`);
    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
    }, 1200);
  };

  // Submit liability
  const handleSaveLiability = (e: React.FormEvent) => {
    e.preventDefault();
    const bal = parseFloat(liabBalance) || 0;
    const origAmt = liabOriginalAmount ? parseFloat(liabOriginalAmount) : undefined;
    const rate = liabInterestRate ? parseFloat(liabInterestRate) : undefined;
    const minPay = liabMinPayment ? parseFloat(liabMinPayment) : undefined;
    const monthlyPay = liabMonthlyPayment ? parseFloat(liabMonthlyPayment) : undefined;
    const tenureM = liabTenureMonths ? parseInt(liabTenureMonths) : undefined;
    const dueD = liabDueDate ? parseInt(liabDueDate) : undefined;
    const credLim = liabCreditLimit ? parseFloat(liabCreditLimit) : undefined;

    const cat = selectedLiabilitySubType?.category || (selectedLiabType as LiabilityCategory) || 'Personal Loan';

    addLiability({
      name: liabName || selectedLiabilitySubType?.name || selectedLiabType,
      category: cat,
      subType: selectedLiabilitySubType?.name || selectedLiabType,
      institution: liabInstitution || 'Bank',
      balance: bal,
      originalAmount: origAmt && origAmt >= bal ? origAmt : bal,
      interestRate: rate,
      minimumPayment: minPay,
      monthlyPayment: monthlyPay,
      tenureMonths: tenureM,
      dueDate: dueD,
      isSecured: selectedLiabilitySubType?.isSecured ?? false,
      collateral: liabCollateral || undefined,
      creditLimit: credLim,
      notes: liabNotes || undefined,
      currency: currency,
    });

    setSubmittedMessage(`Added liability "${liabName || selectedLiabilitySubType?.name || selectedLiabType}"!`);
    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
    }, 1200);
  };

  // Submit transaction (Income / Expense)
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount) || 0;
    if (amt <= 0) return;

    const acc = accounts.find(a => a.id === txAccountId) || accounts[0];

    addTransaction({
      amount: amt,
      type: activeTab === 'income' ? 'income' : 'expense',
      category: txCategory,
      description: txDescription || `${activeTab === 'income' ? 'Received' : 'Paid'} ${txCategory}`,
      accountId: acc ? acc.id : 'acc-1',
      accountName: acc ? acc.name : 'Primary Account',
      date: txDate,
      isRecurring: txIsRecurring,
      currency: currency,
    });

    setSubmittedMessage(`Logged ${activeTab === 'income' ? 'income' : 'expense'} of ${currentSymbol}${amt.toFixed(2)}!`);
    setTimeout(() => {
      setSubmittedMessage(null);
      closeQuickAdd();
    }, 1200);
  };

  // Tags helper
  const toggleManualTag = (tagName: string) => {
    setManualTags(prev => 
      prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]
    );
  };

  const addManualCustomTag = () => {
    const trimmed = manualCustomTag.trim();
    if (trimmed && !manualTags.includes(trimmed)) {
      setManualTags(prev => [...prev, trimmed]);
      setManualCustomTag('');
    }
  };

  const expenseCategories = [
    'Housing & Rent', 'Food & Groceries', 'Dining & Drinks', 'Transportation',
    'Utilities & Bills', 'Entertainment', 'Health & Wellness', 'Shopping & Tech',
    'Travel & Leisure', 'Education', 'Subscriptions', 'Investments', 'Other Expense'
  ];

  const incomeCategories = [
    'Salary & Wages', 'Freelance & Business', 'Investments & Dividends',
    'Rental Income', 'Side Hustle', 'Gifts & Grants', 'Other Income'
  ];

  return (
    <div 
      id="quick-add-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
      onClick={e => {
        if (e.target === e.currentTarget) closeQuickAdd();
      }}
    >
      <div 
        id="quick-add-modal-container"
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* MODAL HEADER & TABS */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                {activeTab === 'asset' ? <Coins className="w-4 h-4" /> : activeTab === 'liability' ? <ShieldAlert className="w-4 h-4" /> : activeTab === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  {activeTab === 'asset' 
                    ? (assetFlowMode === 'equity_menu' ? 'Equity Investments' : assetFlowMode === 'debt_menu' ? 'Debt & Fixed Income' : assetFlowMode === 'search' ? `Add ${selectedSubTypeInfo?.name || 'Asset'}` : assetFlowMode === 'manual_form' ? `Add ${selectedSubTypeInfo?.name || 'Asset'}` : 'Add Asset to Portfolio')
                    : activeTab === 'liability'
                    ? (liabilityFlowMode === 'secured_menu' ? 'Secured Loans & Mortgages' : liabilityFlowMode === 'unsecured_menu' ? 'Unsecured & Consumer Debt' : liabilityFlowMode === 'group_menu' ? selectedLiabilityGroup?.groupName || 'Liability Categories' : liabilityFlowMode === 'form' ? `Add ${selectedLiabilitySubType?.name || 'Liability'}` : 'Add Liability to Balance Sheet')
                    : activeTab === 'income' ? 'Log Income' : 'Log Expense'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {activeTab === 'asset' 
                    ? 'Track equity, debt, real estate, gold & liquid assets with live pricing' 
                    : activeTab === 'liability'
                    ? 'Track mortgages, vehicle loans, credit cards, BNPL & personal borrowings'
                    : 'Track your personal balance sheet and cash flows'}
                </p>
              </div>
            </div>

            <button
              id="btn-close-quick-add"
              type="button"
              onClick={closeQuickAdd}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary 4 Category Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 dark:bg-zinc-950 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              id="tab-modal-asset"
              onClick={() => {
                setActiveTab('asset');
                setAssetFlowMode('hub');
                setSelectedMasterAsset(null);
                setSelectedSubTypeInfo(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeTab === 'asset'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700 font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Asset</span>
            </button>

            <button
              type="button"
              id="tab-modal-liability"
              onClick={() => {
                setActiveTab('liability');
                setLiabilityFlowMode('hub');
                setSelectedLiabilitySubType(null);
                setSelectedLiabilityGroup(null);
                setLiabilitySearchQuery('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeTab === 'liability'
                  ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-zinc-700 font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Liability</span>
            </button>

            <button
              type="button"
              id="tab-modal-income"
              onClick={() => setActiveTab('income')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeTab === 'income'
                  ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200 dark:border-zinc-700 font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>

            <button
              type="button"
              id="tab-modal-expense"
              onClick={() => setActiveTab('expense')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl transition-all ${
                activeTab === 'expense'
                  ? 'bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm border border-slate-200 dark:border-zinc-700 font-bold'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {submittedMessage ? (
            <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <Check className="w-7 h-7 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                {submittedMessage}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Updating your portfolio and recalculating net worth...
              </p>
            </div>
          ) : (
            <>
              {/* =========================================================================
                  FLOW 1: STEP 1 - ASSET HUB COMPONENT (FIRST SHOW THIS COMPONENT)
                  Features Equity (button 1) and Debt (button 2) prominently
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'hub' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-emerald-500" />
                        <span>Select Asset Class</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Choose Equity or Debt to view all specialized categories
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMarketFilter('all');
                        setMarketSearchQuery('');
                        setSelectedSubTypeInfo(null);
                        setAssetFlowMode('search');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                      <span>Live Search All</span>
                    </button>
                  </div>

                  {/* Primary Equity & Debt Selectors (Matches Focus Mode CSS Selectors) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* BUTTON 1: EQUITY */}
                    <button
                      type="button"
                      id="btn-asset-class-equity"
                      onClick={() => {
                        setActiveAssetClass('Equity');
                        setAssetFlowMode('equity_menu');
                      }}
                      className="group relative text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent dark:from-blue-500/15 dark:via-indigo-500/10 dark:to-zinc-900 border border-blue-500/30 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-blue-500 group-hover:text-white transition-all">
                          <TrendingUp className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                          10 Types
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            Equity
                          </h4>
                          <ChevronRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                          Direct Stock, Equity Mutual Fund, Hybrid, Arbitrage, ETF, ESOP / RSU, Unlisted, NPS, ULIP, PMS / AIF
                        </p>
                      </div>
                    </button>

                    {/* BUTTON 2: DEBT */}
                    <button
                      type="button"
                      id="btn-asset-class-debt"
                      onClick={() => {
                        setActiveAssetClass('Debt');
                        setAssetFlowMode('debt_menu');
                      }}
                      className="group relative text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-500/15 dark:via-teal-500/10 dark:to-zinc-900 border border-emerald-500/30 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                          <Landmark className="w-6 h-6 stroke-[2.2]" />
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                          7 Categories • 17 Types
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            Debt & Fixed Income
                          </h4>
                          <ChevronRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                          FD / RD, Bonds, Govt. Schemes (PPF/EPF/SSY), Mutual Funds / ETF, Insurance, Retirement, Loan Given
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Other Asset Classes */}
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2.5">
                      Other Asset Classes
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {ASSET_TAXONOMY.filter(cat => cat.id !== 'Equity' && cat.id !== 'Debt').map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          id={`btn-asset-class-${cat.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          onClick={() => {
                            if (cat.id === 'Other') {
                              openDirectOtherForm();
                            } else {
                              setActiveAssetClass(cat.id);
                              setSelectedAssetCategory(cat);
                              setAssetFlowMode('category_menu');
                            }
                          }}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-all text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div 
                              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                              style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                            >
                              <Coins className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-emerald-500 transition-colors truncate">
                              {cat.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                            {cat.id === 'Other' ? '⚡ Direct: Name, Cur, Value' : `${cat.subTypes.length} sub-classes`}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  FLOW 2: EQUITY SUB-TYPES (10 TYPES REQUESTED BY USER)
                  Direct Stock, Equity Mutual Fund, Hybrid Mutual Fund, Arbitrage Fund,
                  ETF, ESOP / RSU, Unlisted Equity, NPS, ULIP, PMS / AIF
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'equity_menu' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('hub')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Asset Classes</span>
                    </button>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                      Equity (10 Types)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {EQUITY_SUBTYPES.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (sub.searchType === 'stock') {
                            openDedicatedSearch(sub, 'Equity', 'stock');
                          } else if (sub.searchType === 'equity_mf') {
                            openDedicatedSearch(sub, 'Equity', 'equity_mf');
                          } else if (sub.searchType === 'hybrid_mf') {
                            openDedicatedSearch(sub, 'Equity', 'hybrid_mf');
                          } else if (sub.searchType === 'arbitrage_mf') {
                            openDedicatedSearch(sub, 'Equity', 'arbitrage_mf');
                          } else if (sub.searchType === 'etf') {
                            openDedicatedSearch(sub, 'Equity', 'etf');
                          } else {
                            openManualFormForSubtype(sub, 'Equity');
                          }
                        }}
                        className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {sub.name}
                            </span>
                            {sub.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                {sub.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                            {sub.description}
                          </p>
                        </div>
                        <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all mt-0.5">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  FLOW 3: DEBT CATEGORIES & TYPES (GROUPED AS REQUESTED BY USER)
                  FD / RD, Bonds, Govt. Schemes, Mutual Funds / ETF, Insurance, Retirement, Other
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'debt_menu' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('hub')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Asset Classes</span>
                    </button>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      Debt (7 Categories • 17 Types)
                    </span>
                  </div>

                  <div className="space-y-4">
                    {DEBT_GROUPS.map(group => (
                      <div key={group.groupName} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                              {group.groupName}
                            </h4>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                            {group.items.length} {group.items.length === 1 ? 'type' : 'types'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {group.items.map(sub => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => {
                                if (sub.searchType === 'debt_mf') {
                                  openDedicatedSearch(sub, 'Debt', 'debt_mf');
                                } else if (sub.searchType === 'liquid_mf') {
                                  openDedicatedSearch(sub, 'Debt', 'liquid_mf');
                                } else if (sub.searchType === 'etf') {
                                  openDedicatedSearch(sub, 'Debt', 'etf');
                                } else {
                                  openManualFormForSubtype(sub, 'Debt');
                                }
                              }}
                              className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xs transition-all text-left flex items-center justify-between group cursor-pointer"
                            >
                              <div className="min-w-0 pr-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 block truncate">
                                  {sub.name}
                                </span>
                                <span className="text-[10px] text-slate-500 dark:text-zinc-400 truncate block mt-0.5">
                                  {sub.description}
                                </span>
                              </div>
                              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <ChevronRight className="w-3.5 h-3.5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  FLOW 4: OTHER ASSET CATEGORY MENU (Real Estate, Commodities, Cash, etc.)
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'category_menu' && selectedAssetCategory && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('hub')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Asset Classes</span>
                    </button>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      {selectedAssetCategory.name}
                    </span>
                  </div>

                  {/* Real Estate Featured: Dedicated REITs Search Banner */}
                  {selectedAssetCategory.id === 'Real Estate' && (
                    <button
                      type="button"
                      id="btn-reit-live-search"
                      onClick={() => {
                        const reitSub = selectedAssetCategory.subTypes.find(s => s.id === 'reit') || {
                          id: 'reit',
                          name: 'REITs (Real Estate Trusts)',
                          searchType: 'reit'
                        };
                        openDedicatedSearch(reitSub as AssetSubType, 'Real Estate', 'reit');
                      }}
                      className="w-full p-4 rounded-2xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-transparent dark:from-purple-500/20 dark:via-indigo-500/15 dark:to-zinc-900 border border-purple-500/30 hover:border-purple-500 flex items-center justify-between text-left group transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                          <Search className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              Search REITs (Real Estate Trusts)
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                              Live Search
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Search only publicly listed REITs (Embassy, Mindspace, Brookfield, Nexus, Realty Income...)
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  {/* Other Asset Class Featured: Direct 1-Click Entry Banner */}
                  {selectedAssetCategory.id === 'Other' && (
                    <button
                      type="button"
                      id="btn-other-direct-entry"
                      onClick={openDirectOtherForm}
                      className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-zinc-900 border border-emerald-500/30 hover:border-emerald-500 flex items-center justify-between text-left group transition-all cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                          <Plus className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              Direct Asset Entry (Name, Currency & Investment)
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
                              ⚡ Direct
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Give the asset name, cur, and total investment to go directly into portfolio
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedAssetCategory.subTypes.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (selectedAssetCategory.id === 'Crypto' || sub.id.includes('crypto')) {
                            openManualFormForSubtype(sub, selectedAssetCategory.name);
                          } else if (sub.searchType === 'reit' || sub.id === 'reit') {
                            openDedicatedSearch(sub, 'Real Estate', 'reit');
                          } else if (selectedAssetCategory.id === 'Other' || sub.id === 'custom-asset') {
                            openDirectOtherForm();
                          } else if (sub.searchType === 'stock') {
                            openDedicatedSearch(sub, selectedAssetCategory.name, 'stock');
                          } else {
                            openManualFormForSubtype(sub, selectedAssetCategory.name);
                          }
                        }}
                        className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 transition-all text-left flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 block">
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                            {sub.searchType === 'reit' ? 'Live market search' : `${selectedAssetCategory.name} holding`}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  FLOW 5: LIVE SEARCH (RESTRICTED SPECIFICALLY TO SELECTED SUBTYPE)
                  "in that equity that only search relate only for explain in direct stock only"
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'search' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Top Navigation */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeAssetClass === 'Debt' || selectedSubTypeInfo?.group) {
                          setAssetFlowMode('debt_menu');
                        } else if (activeAssetClass === 'Equity') {
                          setAssetFlowMode('equity_menu');
                        } else if (activeAssetClass === 'Real Estate') {
                          setAssetFlowMode('category_menu');
                        } else {
                          setAssetFlowMode('hub');
                        }
                      }}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to {activeAssetClass}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {marketFilter === 'reit' ? 'REITs Only' : (selectedSubTypeInfo ? `Focused: ${selectedSubTypeInfo.name}` : 'Live Search')}
                      </span>
                    </div>
                  </div>

                  {/* Search Title & Prompt explanation */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {marketFilter === 'reit' 
                        ? 'Search REITs (Real Estate Trusts)' 
                        : (selectedSubTypeInfo?.name ? `Search ${selectedSubTypeInfo.name}` : 'Search Market Assets')}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {marketFilter === 'stock' 
                        ? 'Search direct listed equity stocks on NSE, BSE & US markets with real-time quotes'
                        : marketFilter === 'reit'
                          ? 'Search only publicly listed Real Estate Investment Trusts (REITs) with live prices & daily yields'
                          : marketFilter === 'equity_mf' 
                            ? 'Search official AMFI Equity mutual funds with daily NAV updates'
                            : marketFilter === 'hybrid_mf'
                              ? 'Search Balanced Advantage & Multi-Asset Hybrid mutual funds'
                              : marketFilter === 'arbitrage_mf'
                                ? 'Search low-risk Arbitrage mutual fund schemes'
                                : marketFilter === 'debt_mf'
                                  ? 'Search Debt, Gilt & Corporate Bond mutual funds'
                                  : marketFilter === 'liquid_mf'
                                    ? 'Search Liquid & Overnight funds with T+1 liquidity'
                                    : 'Search securities and Exchange Traded Funds'}
                    </p>
                  </div>

                  {/* Primary Search Box */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="input-asset-search"
                      type="text"
                      autoFocus
                      value={marketSearchQuery}
                      onChange={e => setMarketSearchQuery(e.target.value)}
                      placeholder={
                        marketFilter === 'stock'
                          ? 'Search direct stocks (e.g. Reliance, TCS, HDFC Bank, Apple, NVDA...)'
                          : marketFilter === 'reit'
                            ? 'Search listed REITs (e.g. Embassy REIT, Mindspace, Brookfield, Nexus, Realty Income, Prologis...)'
                            : marketFilter === 'equity_mf'
                              ? 'Search equity mutual funds (e.g. Parag Parikh Flexi Cap, Quant Small Cap...)'
                              : marketFilter === 'hybrid_mf'
                                ? 'Search hybrid funds (e.g. ICICI Multi-Asset, SBI Equity Hybrid...)'
                                : marketFilter === 'arbitrage_mf'
                                  ? 'Search arbitrage funds (e.g. Kotak Equity Arbitrage...)'
                                  : marketFilter === 'debt_mf'
                                    ? 'Search debt funds (e.g. HDFC Short Term, Aditya Birla Bond...)'
                                    : marketFilter === 'liquid_mf'
                                      ? 'Search liquid funds (e.g. Quantum Liquid, Nippon Liquid...)'
                                      : 'Search securities, stocks, ETFs...'
                      }
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl pl-10 pr-9 py-3 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium shadow-xs"
                    />
                    {marketSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMarketSearchQuery('')}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium shrink-0">
                      Popular:
                    </span>
                    {getQuickSearchChips().map(chip => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => setMarketSearchQuery(chip.query)}
                        className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all cursor-pointer font-medium ${
                          marketSearchQuery === chip.query
                            ? 'bg-emerald-500 text-zinc-950 font-bold'
                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Results Display */}
                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-0.5">
                    {searchResults.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-3">
                        <Coins className="w-8 h-8 mx-auto text-slate-400" />
                        <div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                            No matching securities found for "{marketSearchQuery}"
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                            Looking for an unlisted, foreign or private asset? You can add it manually.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedSubTypeInfo) {
                              openManualFormForSubtype(selectedSubTypeInfo, activeAssetClass);
                            } else {
                              openManualFormForSubtype({ id: 'custom', name: marketSearchQuery || 'Custom Asset' }, activeAssetClass);
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 transition-colors"
                        >
                          + Enter Details Manually
                        </button>
                      </div>
                    ) : (
                      searchResults.map(item => {
                        const isMF = item.asset_type === 'mutual_fund' || item.exchange === 'MF';
                        const changeAmount = item.price_change ?? item.nav_change ?? 0;
                        const changePercent = item.price_change_percent ?? item.nav_change_percent ?? 0;
                        const isPositive = changeAmount >= 0;
                        const formattedPrice = item.currency === 'USD' 
                          ? `$${(Number(item.latest_price) || 0).toFixed(2)}` 
                          : `₹${(Number(item.latest_price) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {item.name}
                                  </h4>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                                    isMF 
                                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  }`}>
                                    {isMF ? 'Mutual Fund' : item.asset_type === 'etf' ? 'ETF' : 'Stock'}
                                  </span>
                                </div>

                                {isMF ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 font-mono">
                                    {item.amc && <div><span>AMC:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.amc}</strong></div>}
                                    {item.scheme_code && <div><span>Code:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.scheme_code}</strong></div>}
                                    {item.plan && <div><span>Plan:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.plan}</strong></div>}
                                    {item.option && <div><span>Option:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.option}</strong></div>}
                                    {item.nav_date && <div><span>NAV Date:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.nav_date}</strong></div>}
                                    <div><span>Status:</span> <strong className="text-emerald-600 dark:text-emerald-400">{item.data_status || 'Daily NAV'}</strong></div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 font-mono">
                                    <div><span>Symbol:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.symbol}</strong></div>
                                    <div><span>Exchange:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.exchange}</strong></div>
                                    <div><span>Type:</span> <strong className="text-slate-700 dark:text-zinc-200">{item.asset_type === 'etf' ? 'ETF' : 'Direct Stock'}</strong></div>
                                    <div><span>Status:</span> <strong className="text-emerald-600 dark:text-emerald-400">{item.data_status || 'Real-time'}</strong></div>
                                  </div>
                                )}
                              </div>

                              <div className="text-right shrink-0 flex flex-col items-end justify-between self-stretch">
                                <div>
                                  <span className="text-xs text-slate-400 dark:text-zinc-500 block font-mono">
                                    {isMF ? 'NAV' : 'Live Price'}
                                  </span>
                                  <span className="text-base font-bold font-mono text-slate-900 dark:text-zinc-100">
                                    {formattedPrice}
                                  </span>
                                  <div className={`text-[11px] font-mono font-semibold flex items-center justify-end gap-0.5 ${
                                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                                  }`}>
                                    <span>{isPositive ? '+' : ''}{item.currency === 'USD' ? '$' : '₹'}{Math.abs(changeAmount).toFixed(2)}</span>
                                    <span>({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mt-3">
                                  {!isMF && (
                                    <a
                                      href={getGoogleFinanceUrl(item.symbol, item.exchange)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] text-slate-500 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                      <span>Finance</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}

                                  <button
                                    id={`btn-add-security-${item.id}`}
                                    type="button"
                                    onClick={() => handleInitiateAdd(item)}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>+ Add</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Can't find fallback button */}
                  <div className="pt-2 text-center border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedSubTypeInfo) {
                          openManualFormForSubtype(selectedSubTypeInfo, activeAssetClass);
                        } else {
                          openManualFormForSubtype({ id: 'custom', name: 'Custom Holding' }, activeAssetClass);
                        }
                      }}
                      className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-emerald-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Can't find your instrument? Enter holding details manually</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  FLOW 6: CONFIGURE HOLDING DETAILS (After user clicks [+ Add] on search)
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'configure' && selectedMasterAsset && (
                <form onSubmit={handleConfirmAddHolding} className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                          {selectedMasterAsset.name}
                        </h3>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {selectedMasterAsset.exchange}: {selectedMasterAsset.symbol}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                        Latest {selectedMasterAsset.asset_type === 'mutual_fund' ? 'NAV' : 'Price'}: 
                        <strong className="text-slate-900 dark:text-white font-bold ml-1">
                          {selectedMasterAsset.currency === 'USD' ? '$' : '₹'}{selectedMasterAsset.latest_price.toFixed(2)}
                        </strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('search')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1 rounded"
                    >
                      Change
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        {selectedMasterAsset.asset_type === 'mutual_fund' ? 'Mutual Fund Units Held *' : 'Quantity / Shares *'}
                      </label>
                      <input
                        id="input-holding-shares"
                        type="number"
                        step="0.001"
                        required
                        autoFocus
                        value={holdingShares}
                        onChange={e => setHoldingShares(e.target.value)}
                        placeholder="1.00"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        {selectedMasterAsset.asset_type === 'mutual_fund' 
                          ? `Purchase NAV / Buy Price (${selectedMasterAsset.currency === 'USD' ? '$' : '₹'}) *` 
                          : `Average Buy Price (${selectedMasterAsset.currency === 'USD' ? '$' : '₹'}) *`}
                      </label>
                      <input
                        id="input-holding-buyprice"
                        type="number"
                        step="0.01"
                        required
                        value={holdingBuyPrice}
                        onChange={e => setHoldingBuyPrice(e.target.value)}
                        placeholder={selectedMasterAsset.latest_price.toFixed(2)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                      {selectedMasterAsset.asset_type === 'mutual_fund' && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <span>Latest Scheme NAV:</span>
                          <strong className="font-mono">{selectedMasterAsset.currency === 'USD' ? '$' : '₹'}{selectedMasterAsset.latest_price.toFixed(2)}</strong>
                          {selectedMasterAsset.nav_date && (
                            <span className="text-slate-400">({selectedMasterAsset.nav_date})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Broker / Depository Custodian
                      </label>
                      <input
                        type="text"
                        value={holdingInstitution}
                        onChange={e => setHoldingInstitution(e.target.value)}
                        placeholder="e.g. Zerodha, Groww, AngelOne"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Purchase Date
                      </label>
                      <input
                        type="date"
                        value={holdingBuyDate}
                        onChange={e => setHoldingBuyDate(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Dynamic Valuation Summary */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 flex items-center justify-between font-mono">
                    <div>
                      <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Total Cost Basis</span>
                      <strong className="text-slate-800 dark:text-zinc-200 font-bold text-sm">
                        {selectedMasterAsset.currency === 'USD' ? '$' : '₹'}
                        {((parseFloat(holdingShares) || 1) * (parseFloat(holdingBuyPrice) || Number(selectedMasterAsset.latest_price) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 dark:text-zinc-400 block text-[11px]">Current Market Valuation</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        {selectedMasterAsset.currency === 'USD' ? '$' : '₹'}
                        {((parseFloat(holdingShares) || 1) * (Number(selectedMasterAsset.latest_price) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('search')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Search</span>
                    </button>

                    <button
                      id="btn-confirm-add-holding"
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Add to My Portfolio</span>
                    </button>
                  </div>
                </form>
              )}

              {/* =========================================================================
                  FLOW 7: DEDICATED TAILORED FORM FOR CONTRACTUAL / PHYSICAL ASSETS
                  Bank FD, PPF, EPF, Bonds, Insurance, ESOP, Loan Given, etc.
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'manual_form' && selectedSubTypeInfo && (
                <form onSubmit={handleSaveManualAsset} className="space-y-4 animate-in fade-in duration-150">
                  {/* Top Header Card */}
                  <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                          {selectedSubTypeInfo.name}
                        </span>
                        {selectedSubTypeInfo.group && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {selectedSubTypeInfo.group}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                        {selectedSubTypeInfo.description || `${activeAssetClass} Asset Entry`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (activeAssetClass === 'Debt' || selectedSubTypeInfo.group) {
                          setAssetFlowMode('debt_menu');
                        } else if (activeAssetClass === 'Equity') {
                          setAssetFlowMode('equity_menu');
                        } else {
                          setAssetFlowMode('hub');
                        }
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Change Type
                    </button>
                  </div>

                  {/* Asset Category / Class Selector (User Category Selection) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Asset Category / Class *
                      </label>
                      <select
                        value={activeAssetClass}
                        onChange={(e) => {
                          const newClass = e.target.value;
                          setActiveAssetClass(newClass);
                          if (newClass === 'Commodities') {
                            setIsLivePriceActive(true);
                            setLiveAssetType('commodity');
                            setCommodityLiveType('GOLD');
                            setCommodityUnit('gram');
                            const q = commodityQty || '20';
                            setCommodityQty(q);
                            fetchAndApplyLivePrice('GOLD-GRAM', 'commodity', q);
                          } else if (newClass === 'Crypto') {
                            setIsLivePriceActive(true);
                            setLiveAssetType('crypto');
                            setCryptoSymbol('BTC');
                            const q = cryptoQty || '0.25';
                            setCryptoQty(q);
                            fetchAndApplyLivePrice('BTC', 'crypto', q);
                          } else {
                            setIsLivePriceActive(false);
                            setLivePricePerUnit(null);
                            setLivePriceChange24h(null);
                          }
                        }}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
                      >
                        <option value="Commodities">🟡 Gold / Commodities (Live Gold Spot)</option>
                        <option value="Crypto">⚡ Crypto (Live Crypto Coins & Tokens)</option>
                        <option value="Real Estate">🏠 Real Estate</option>
                        <option value="Cash & Savings">💵 Cash & Savings</option>
                        <option value="Alternatives">🤝 Alternatives (P2P Lending & PE)</option>
                        <option value="Debt">🏦 Fixed Income & Debt (FD, PPF, EPF)</option>
                        <option value="Equity">📈 Equity (Private Shares / Unlisted)</option>
                        <option value="Other">📦 Other Holding</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Currency (cur)
                      </label>
                      <select
                        value={manualAssetCurrency || currency}
                        onChange={(e) => setManualAssetCurrency(e.target.value as CurrencyCode)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
                      >
                        {Object.values(CURRENCY_CONFIGS).map(c => (
                          <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      {selectedSubTypeInfo.id === 'loan-given' 
                        ? 'Loan Description / Beneficiary *' 
                        : selectedSubTypeInfo.id === 'esop-rsu' 
                          ? 'Company / Employer Name *'
                          : 'Holding Name / Account Title *'}
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={manualAssetName}
                      onChange={e => setManualAssetName(e.target.value)}
                      placeholder={
                        selectedSubTypeInfo.id === 'loan-given' 
                          ? 'e.g. Loan given to Rahul - Personal' 
                          : (selectedSubTypeInfo.id === 'p2p-lending' || selectedSubTypeInfo.id === 'art-wine-luxury')
                            ? 'e.g. Faircent 12% P2P Portfolio, LiquiLoans Prime, LendingClub Note'
                            : selectedSubTypeInfo.id === 'bank-fd' 
                              ? 'e.g. HDFC Bank 3-Year Cumulative FD'
                              : selectedSubTypeInfo.id === 'ppf'
                                ? 'e.g. SBI Public Provident Fund'
                                : selectedSubTypeInfo.id === 'esop-rsu'
                                  ? 'e.g. Swiggy ESOP Grant'
                                  : `e.g. ${selectedSubTypeInfo.name}`
                      }
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  {/* Specific: Loan Given Fields */}
                  {selectedSubTypeInfo.id === 'loan-given' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Borrower Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={manualBorrowerName}
                          onChange={e => setManualBorrowerName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Expected Repayment Date
                        </label>
                        <input
                          type="date"
                          value={manualMaturityDate}
                          onChange={e => setManualMaturityDate(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Specific: ESOP / RSU Fields */}
                  {selectedSubTypeInfo.id === 'esop-rsu' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Granted / Vested Shares *
                        </label>
                        <input
                          type="number"
                          step="1"
                          required
                          value={manualShares}
                          onChange={e => setManualShares(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Fair Market Value ({currentSymbol}) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={manualFairMarketValue}
                          onChange={e => setManualFairMarketValue(e.target.value)}
                          placeholder="e.g. 1250"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Strike Price ({currentSymbol})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={manualStrikePrice}
                          onChange={e => setManualStrikePrice(e.target.value)}
                          placeholder="e.g. 10.00"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* ⚡ Live Price Activation Module: ONLY for Gold in Commodities and Crypto Coin in Crypto Coins & Tokens */}
                  {((activeAssetClass === 'Commodities' || (selectedSubTypeInfo && (selectedSubTypeInfo.id.includes('gold') || selectedSubTypeInfo.name.toLowerCase().includes('gold')))) ||
                    (activeAssetClass === 'Crypto' && (selectedSubTypeInfo && (selectedSubTypeInfo.id === 'crypto-spot' || selectedSubTypeInfo.name.toLowerCase().includes('coin') || selectedSubTypeInfo.name.toLowerCase().includes('token'))))) && (
                    <div className={`p-3.5 rounded-2xl border transition-all ${
                      isLivePriceActive 
                        ? 'bg-amber-500/10 border-amber-500/40 dark:bg-amber-950/20 dark:border-amber-500/40' 
                        : 'bg-slate-50 dark:bg-zinc-950/80 border-slate-200 dark:border-zinc-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isLivePriceActive 
                              ? (liveAssetType === 'crypto' ? 'bg-orange-500 text-white shadow-xs' : 'bg-amber-500 text-zinc-950 shadow-xs')
                              : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                          }`}>
                            {liveAssetType === 'crypto' ? '⚡' : '🟡'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                {liveAssetType === 'crypto' ? 'Live Crypto Coin Price' : 'Live Gold 24K Spot Rate'}
                              </h4>
                              {isLivePriceActive && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>LIVE FREE API ACTIVE</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                              {liveAssetType === 'crypto' 
                                ? 'Real-time spot rate for Crypto Coins & Tokens (Binance / Coinbase live feed)' 
                                : 'Real-time 24K Gold market spot rate (COMEX / MCX Benchmark)'}
                            </p>
                          </div>
                        </div>

                        {/* Toggle Button */}
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isLivePriceActive}
                          onClick={() => {
                            const next = !isLivePriceActive;
                            setIsLivePriceActive(next);
                            if (next) {
                              if (activeAssetClass === 'Crypto' || selectedSubTypeInfo?.id?.includes('crypto')) {
                                setLiveAssetType('crypto');
                                fetchAndApplyLivePrice(cryptoSymbol, 'crypto', cryptoQty || '0.1');
                              } else {
                                setLiveAssetType('commodity');
                                setCommodityLiveType('GOLD');
                                fetchAndApplyLivePrice(`GOLD-${commodityUnit.toUpperCase()}`, 'commodity', commodityQty || '10');
                              }
                            }
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isLivePriceActive 
                              ? (liveAssetType === 'crypto' ? 'bg-orange-500' : 'bg-amber-500') 
                              : 'bg-slate-300 dark:bg-zinc-700'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              isLivePriceActive ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Live Controls when Active */}
                      {isLivePriceActive && (
                        <div className="mt-3.5 pt-3.5 border-t border-amber-500/25 space-y-3.5 animate-in fade-in duration-150">
                          {/* 1. GOLD ONLY CONTROLS */}
                          {liveAssetType === 'commodity' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                                    Gold Weight Unit
                                  </label>
                                  <select
                                    value={commodityUnit}
                                    onChange={e => {
                                      const u = e.target.value as any;
                                      setCommodityUnit(u);
                                      fetchAndApplyLivePrice(`GOLD-${u.toUpperCase()}`, 'commodity');
                                    }}
                                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-zinc-100"
                                  >
                                    <option value="gram">Grams (1g) - Standard</option>
                                    <option value="10g">10 Grams (10g Tola / Bar)</option>
                                    <option value="oz">Troy Ounces (1 oz = 31.1g)</option>
                                    <option value="kg">Kilograms (1kg Bar)</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                                    Weight in {commodityUnit === 'gram' ? 'Grams' : commodityUnit === '10g' ? '10-Gram units' : commodityUnit === 'kg' ? 'Kilograms' : 'Troy Ounces'} *
                                  </label>
                                  <input
                                    type="number"
                                    step="0.001"
                                    value={commodityQty}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setCommodityQty(val);
                                      const q = parseFloat(val) || 0;
                                      if (livePricePerUnit && q > 0) {
                                        const totalVal = Math.round(q * livePricePerUnit * 100) / 100;
                                        setManualAssetValue(totalVal.toString());
                                        if (!manualAssetCostBasis) setManualAssetCostBasis(totalVal.toString());
                                      }
                                    }}
                                    placeholder="e.g. 20"
                                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2 font-mono text-sm font-bold text-slate-900 dark:text-white"
                                  />
                                </div>
                              </div>

                              {/* Live Gold Price Display Card */}
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Live Gold 24K Spot</span>
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {livePriceChange24h !== null && (
                                      <span className={`font-mono font-bold ${livePriceChange24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {livePriceChange24h >= 0 ? '+' : ''}{livePriceChange24h.toFixed(2)}%
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      title="Refresh live rate"
                                      onClick={() => {
                                        fetchAndApplyLivePrice(`GOLD-${commodityUnit.toUpperCase()}`, 'commodity');
                                      }}
                                      className="p-1 rounded-md hover:bg-amber-500/20 text-amber-500 cursor-pointer"
                                    >
                                      <RefreshCw className={`w-3 h-3 ${isFetchingLivePrice ? 'animate-spin' : ''}`} />
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-1 flex items-baseline justify-between font-mono">
                                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                    {livePriceCurrency === 'USD' ? '$' : '₹'}{livePricePerUnit ? livePricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Loading...'}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-sans">
                                    per {commodityUnit} (Gold 24K)
                                  </span>
                                </div>
                              </div>

                              {/* Benchmark Multi-Unit Rate Breakdown Strip */}
                              {commodityQuoteDetails && (
                                <div className="p-2 rounded-xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 text-[10px] font-mono text-slate-600 dark:text-zinc-400 flex items-center justify-between flex-wrap gap-2">
                                  <span>
                                    1g: <strong className="text-slate-900 dark:text-white">₹{commodityQuoteDetails.gramPriceInr?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '—'}</strong> (${commodityQuoteDetails.gramPriceUsd?.toFixed(2) || '—'})
                                  </span>
                                  <span>
                                    10g: <strong className="text-slate-900 dark:text-white">₹{commodityQuoteDetails.tenGramPriceInr?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '—'}</strong>
                                  </span>
                                  <span>
                                    1 oz: <strong className="text-slate-900 dark:text-white">${commodityQuoteDetails.ozPriceUsd?.toFixed(2) || '—'}</strong>
                                  </span>
                                  {commodityQuoteDetails.kgPriceInr && (
                                    <span>
                                      1kg: <strong className="text-slate-900 dark:text-white">₹{commodityQuoteDetails.kgPriceInr?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || '—'}</strong>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* 2. CRYPTO COIN ONLY CONTROLS */}
                          {liveAssetType === 'crypto' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                                    Popular Crypto Coins
                                  </label>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'BNB', 'ADA', 'AVAX'].map(sym => (
                                      <button
                                        key={sym}
                                        type="button"
                                        onClick={() => {
                                          setCryptoSymbol(sym);
                                          fetchAndApplyLivePrice(sym, 'crypto');
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                          cryptoSymbol === sym
                                            ? 'bg-orange-500 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                                        }`}
                                      >
                                        {sym}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                                    Or Any Coin Ticker / Symbol
                                  </label>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="text"
                                      value={cryptoSymbol}
                                      onChange={e => setCryptoSymbol(e.target.value.toUpperCase())}
                                      placeholder="e.g. PEPE, SUI, LINK, SHIB"
                                      className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-1.5 font-mono text-xs font-bold text-slate-900 dark:text-white uppercase"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => fetchAndApplyLivePrice(cryptoSymbol, 'crypto')}
                                      className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-all"
                                    >
                                      Fetch Live
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 mb-1">
                                    Coins / Tokens Held *
                                  </label>
                                  <input
                                    type="number"
                                    step="0.00000001"
                                    value={cryptoQty}
                                    onChange={e => {
                                      const val = e.target.value;
                                      setCryptoQty(val);
                                      const q = parseFloat(val) || 0;
                                      if (livePricePerUnit && q > 0) {
                                        const totalVal = Math.round(q * livePricePerUnit * 100) / 100;
                                        setManualAssetValue(totalVal.toString());
                                        if (!manualAssetCostBasis) setManualAssetCostBasis(totalVal.toString());
                                      }
                                    }}
                                    placeholder="e.g. 0.5"
                                    className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2 font-mono text-sm font-bold text-slate-900 dark:text-white"
                                  />
                                </div>

                                {/* Live Crypto Price Display Card */}
                                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex flex-col justify-between">
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-orange-600 dark:text-orange-400 font-semibold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      <span>⚡ Live {cryptoSymbol} Quote</span>
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {livePriceChange24h !== null && (
                                        <span className={`font-mono font-bold ${livePriceChange24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                          {livePriceChange24h >= 0 ? '+' : ''}{livePriceChange24h.toFixed(2)}%
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        title="Refresh live rate"
                                        onClick={() => fetchAndApplyLivePrice(cryptoSymbol, 'crypto')}
                                        className="p-1 rounded-md hover:bg-orange-500/20 text-orange-500 cursor-pointer"
                                      >
                                        <RefreshCw className={`w-3 h-3 ${isFetchingLivePrice ? 'animate-spin' : ''}`} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-1 flex items-baseline justify-between font-mono">
                                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                      ${livePricePerUnit ? livePricePerUnit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Loading...'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-sans">
                                      per {cryptoSymbol} ({livePriceSource || 'Free Live API'})
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Valuation / Amount & Cost Basis */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        {selectedSubTypeInfo.id === 'loan-given' 
                          ? `Principal Amount Lent (${currentSymbol}) *` 
                          : selectedSubTypeInfo.group === 'FD / RD'
                            ? `Deposit Amount (${currentSymbol}) *`
                            : `Current Valuation (${currentSymbol}) *`}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={manualAssetValue}
                        onChange={e => setManualAssetValue(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Original Cost / Invested Basis ({currentSymbol})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={manualAssetCostBasis}
                        onChange={e => setManualAssetCostBasis(e.target.value)}
                        placeholder="Optional (defaults to valuation)"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Institution / Bank & Interest Rate */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        {selectedSubTypeInfo.id === 'p2p-lending' || selectedSubTypeInfo.id === 'art-wine-luxury'
                          ? 'P2P Platform / Originator / Custodian'
                          : selectedSubTypeInfo.group === 'Insurance' 
                            ? 'Insurance Provider / Company' 
                            : 'Bank / Depository / Custodian'}
                      </label>
                      <input
                        type="text"
                        value={manualAssetInstitution}
                        onChange={e => setManualAssetInstitution(e.target.value)}
                        placeholder={
                          selectedSubTypeInfo.id === 'p2p-lending' || selectedSubTypeInfo.id === 'art-wine-luxury'
                            ? "e.g. Faircent, LiquiLoans, 12% Club, LendingClub, Prosper"
                            : "e.g. HDFC Bank, SBI, EPFO, LIC"
                        }
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                      {selectedSubTypeInfo.suggestedInstitutions && selectedSubTypeInfo.suggestedInstitutions.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400">Suggestions:</span>
                          {selectedSubTypeInfo.suggestedInstitutions.map(inst => (
                            <button
                              key={inst}
                              type="button"
                              onClick={() => setManualAssetInstitution(inst)}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-emerald-500/20 hover:text-emerald-600 transition-colors cursor-pointer"
                            >
                              {inst}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Annual Interest / Yield (% p.a.)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={manualInterestRate}
                        onChange={e => setManualInterestRate(e.target.value)}
                        placeholder="e.g. 7.25"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Term / Maturity / Payout calculation for FD / RD / Bond */}
                  {(selectedSubTypeInfo.group === 'FD / RD' || selectedSubTypeInfo.id === 'bond-debenture') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Tenure / Duration
                        </label>
                        <select
                          value={manualTenure}
                          onChange={e => setManualTenure(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        >
                          <option value="1 Year">1 Year</option>
                          <option value="2 Years">2 Years</option>
                          <option value="3 Years">3 Years</option>
                          <option value="5 Years">5 Years</option>
                          <option value="10 Years">10 Years</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Maturity Date
                        </label>
                        <input
                          type="date"
                          value={manualMaturityDate}
                          onChange={e => setManualMaturityDate(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Insurance specific fields */}
                  {selectedSubTypeInfo.group === 'Insurance' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Sum Assured / Life Cover ({currentSymbol})
                        </label>
                        <input
                          type="number"
                          value={manualSumAssured}
                          onChange={e => setManualSumAssured(e.target.value)}
                          placeholder="e.g. 5000000"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                          Annual Premium ({currentSymbol})
                        </label>
                        <input
                          type="number"
                          value={manualAnnualPremium}
                          onChange={e => setManualAnnualPremium(e.target.value)}
                          placeholder="e.g. 100000"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Govt schemes: Account / UAN / PRAN */}
                  {selectedSubTypeInfo.group === 'Govt. Schemes' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Account Number / UAN / PRAN
                      </label>
                      <input
                        type="text"
                        value={manualAccountNumber}
                        onChange={e => setManualAccountNumber(e.target.value)}
                        placeholder="e.g. UAN 100982348291, PRAN 1100293847"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* Liquidity toggle */}
                  <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                    <input
                      type="checkbox"
                      checked={manualAssetIsLiquid}
                      onChange={e => setManualAssetIsLiquid(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded bg-white dark:bg-zinc-900 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                        Liquid Asset
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                        Can be liquidated or redeemed to cash within 7 days.
                      </span>
                    </div>
                  </label>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeAssetClass === 'Debt' || selectedSubTypeInfo.group) {
                          setAssetFlowMode('debt_menu');
                        } else if (activeAssetClass === 'Equity') {
                          setAssetFlowMode('equity_menu');
                        } else {
                          setAssetFlowMode('hub');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save to Portfolio</span>
                    </button>
                  </div>
                </form>
              )}

              {/* =========================================================================
                  FLOW 7.5: DIRECT FAST ENTRY FOR OTHER ASSETS
                  "in Other can give the name cur and total investment go directly"
                 ========================================================================= */}
              {activeTab === 'asset' && assetFlowMode === 'other_direct' && (
                <form onSubmit={handleSaveDirectOtherAsset} className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('hub')}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Asset Classes</span>
                    </button>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                      Direct Asset Entry (Other)
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-500/10 via-emerald-500/5 to-transparent border border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        ⚡ Quick Direct Asset
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        1-Click Save
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Give the asset name, select currency, and enter your total investment to save directly.
                    </p>
                  </div>

                  {/* 1. Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Asset Name *
                    </label>
                    <input
                      id="input-other-asset-name"
                      type="text"
                      required
                      autoFocus
                      value={manualAssetName}
                      onChange={e => setManualAssetName(e.target.value)}
                      placeholder="e.g. Rolex Submariner, Vintage Porsche, Antique Painting, Private Promissory Note..."
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* 2. Currency (cur) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Currency (cur) *
                      </label>
                      <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                        Active: <strong className="text-emerald-600 dark:text-emerald-400">{manualAssetCurrency} ({CURRENCY_CONFIGS[manualAssetCurrency]?.symbol || manualAssetCurrency})</strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {(['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'AED', 'SGD', 'CHF'] as const).map(code => {
                        const cfg = (CURRENCY_CONFIGS as any)[code];
                        const sym = cfg?.symbol || code;
                        const isSelected = manualAssetCurrency === code;
                        return (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setManualAssetCurrency(code as any)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                              isSelected
                                ? 'bg-emerald-500 text-zinc-950 border-emerald-500 shadow-sm'
                                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span>{code}</span>
                            <span className="opacity-75 font-normal">({sym})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Total Investment */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Total Investment / Valuation ({CURRENCY_CONFIGS[manualAssetCurrency]?.symbol || manualAssetCurrency}) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 font-bold font-mono text-slate-400 dark:text-zinc-500 text-base">
                        {CURRENCY_CONFIGS[manualAssetCurrency]?.symbol || manualAssetCurrency}
                      </span>
                      <input
                        id="input-other-asset-value"
                        type="number"
                        step="0.01"
                        required
                        value={manualAssetValue}
                        onChange={e => {
                          setManualAssetValue(e.target.value);
                          if (!manualAssetCostBasis) {
                            setManualAssetCostBasis(e.target.value);
                          }
                        }}
                        placeholder="0.00"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl pl-9 pr-3.5 py-2.5 font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Optional details toggle */}
                  <details className="group text-xs">
                    <summary className="text-slate-500 dark:text-zinc-400 hover:text-emerald-500 cursor-pointer font-medium list-none flex items-center gap-1.5 py-1">
                      <ChevronRight className="w-3.5 h-3.5 group-open:rotate-90 transition-transform" />
                      <span>Optional Details (Cost Basis, Institution, Notes)</span>
                    </summary>
                    <div className="mt-2.5 space-y-3 pl-4 border-l border-slate-200 dark:border-zinc-800">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Invested Cost Basis ({CURRENCY_CONFIGS[manualAssetCurrency]?.symbol || manualAssetCurrency})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={manualAssetCostBasis}
                          onChange={e => setManualAssetCostBasis(e.target.value)}
                          placeholder={manualAssetValue || '0.00'}
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Location / Custodian / Storage
                        </label>
                        <input
                          type="text"
                          value={manualAssetInstitution}
                          onChange={e => setManualAssetInstitution(e.target.value)}
                          placeholder="e.g. Home Safe, Private Bank Locker, Personal Garage"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                          Notes & Description
                        </label>
                        <input
                          type="text"
                          value={manualNotes}
                          onChange={e => setManualNotes(e.target.value)}
                          placeholder="e.g. Serial #, purchase year, certificate reference"
                          className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs"
                        />
                      </div>
                    </div>
                  </details>

                  {/* Submit directly */}
                  <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setAssetFlowMode('hub')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>

                    <button
                      id="btn-submit-direct-other-asset"
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Add Asset Directly</span>
                    </button>
                  </div>
                </form>
              )}

              {/* =========================================================================
                  FLOW 8: LIABILITY FLOW (HUB -> SECURED/UNSECURED/GROUPS -> FORM)
                 ========================================================================= */}
              
              {/* 8.1 LIABILITY HUB: FIRST SHOW THIS COMPONENT */}
              {activeTab === 'liability' && liabilityFlowMode === 'hub' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <span>Select Liability Class</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Choose Secured Loans or Unsecured Debt to view all specialized categories
                      </p>
                    </div>

                    {/* Quick Search across all liabilities */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={liabilitySearchQuery}
                        onChange={e => setLiabilitySearchQuery(e.target.value)}
                        placeholder="Search all 17 debt types..."
                        className="w-full sm:w-48 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/80 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                      />
                      {liabilitySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setLiabilitySearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filtered Search Results View if typing */}
                  {liabilitySearchQuery.trim() !== '' ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                        <span>Matching Liability Types:</span>
                        <button
                          type="button"
                          onClick={() => setLiabilitySearchQuery('')}
                          className="text-rose-500 hover:underline"
                        >
                          Clear Search
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {ALL_LIABILITY_SUBTYPES.filter(item => 
                          item.name.toLowerCase().includes(liabilitySearchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(liabilitySearchQuery.toLowerCase()) ||
                          item.group.toLowerCase().includes(liabilitySearchQuery.toLowerCase())
                        ).map(item => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => selectLiabilitySubType(item)}
                            className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 hover:border-rose-500 dark:hover:border-rose-500/80 hover:bg-rose-50/20 dark:hover:bg-rose-500/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                                {item.group}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                {item.badge}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                {item.name}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
                                {item.description}
                              </p>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Typical APR: ~{item.defaultInterestRate}%</span>
                              <span className="text-rose-500 font-semibold flex items-center gap-0.5">
                                Add Debt <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Primary Secured & Unsecured Selectors (Matches Equity & Debt Hero Layout) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* BUTTON 1: SECURED LOANS & MORTGAGES */}
                        <button
                          type="button"
                          id="btn-liability-class-secured"
                          onClick={() => setLiabilityFlowMode('secured_menu')}
                          className="group relative text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-teal-500/5 to-transparent dark:from-blue-500/15 dark:via-teal-500/10 dark:to-zinc-900 border border-blue-500/30 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-blue-500 group-hover:text-white transition-all">
                              <Home className="w-6 h-6 stroke-[2.2]" />
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                              8 Types
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Secured Loans & Mortgages
                              </h4>
                              <ChevronRight className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                              Home Loan, Loan Against Property (LAP), Car Loan, Two-Wheeler, Gold Loan, Loan Against Securities (LAS), Land Loan
                            </p>
                          </div>
                        </button>

                        {/* BUTTON 2: UNSECURED CREDIT & CONSUMER DEBT */}
                        <button
                          type="button"
                          id="btn-liability-class-unsecured"
                          onClick={() => setLiabilityFlowMode('unsecured_menu')}
                          className="group relative text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-red-500/5 to-transparent dark:from-rose-500/15 dark:via-red-500/10 dark:to-zinc-900 border border-rose-500/30 hover:border-rose-500 hover:shadow-xl hover:shadow-rose-500/10 transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-xs group-hover:scale-105 group-hover:bg-rose-500 group-hover:text-white transition-all">
                              <CreditCard className="w-6 h-6 stroke-[2.2]" />
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                              9 Types
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                Unsecured & Consumer Debt
                              </h4>
                              <ChevronRight className="w-4 h-4 text-rose-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </div>
                            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                              Credit Cards, Personal Loans, BNPL (Affirm/Klarna/Simpl), Student Loans, Overdraft, Salary Advance, Business Loans, Family Loans
                            </p>
                          </div>
                        </button>
                      </div>

                      {/* All Categorized Debt Groups (Mirroring Other Asset Classes) */}
                      <div className="pt-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2.5">
                          All Liability Categories (9 Groups • 17 Types)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {LIABILITY_GROUPS.map(group => (
                            <button
                              key={group.groupName}
                              type="button"
                              onClick={() => {
                                setSelectedLiabilityGroup(group);
                                setLiabilityFlowMode('group_menu');
                              }}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 hover:border-rose-400 dark:hover:border-rose-500/50 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-all text-left group cursor-pointer"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div 
                                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                                  style={{ backgroundColor: `${group.color}20`, color: group.color }}
                                >
                                  {group.iconName === 'home' && <Home className="w-3.5 h-3.5" />}
                                  {group.iconName === 'car' && <Car className="w-3.5 h-3.5" />}
                                  {group.iconName === 'credit-card' && <CreditCard className="w-3.5 h-3.5" />}
                                  {group.iconName === 'user' && <User className="w-3.5 h-3.5" />}
                                  {group.iconName === 'shopping-bag' && <ShoppingBag className="w-3.5 h-3.5" />}
                                  {group.iconName === 'graduation-cap' && <GraduationCap className="w-3.5 h-3.5" />}
                                  {group.iconName === 'gem' && <Gem className="w-3.5 h-3.5" />}
                                  {group.iconName === 'building' && <Building className="w-3.5 h-3.5" />}
                                  {group.iconName === 'file-text' && <FileText className="w-3.5 h-3.5" />}
                                </div>
                                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-rose-500 transition-colors truncate">
                                  {group.groupName}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
                                {group.items.length} sub-types • {group.countLabel}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 8.2 SECURED LOANS MENU */}
              {activeTab === 'liability' && liabilityFlowMode === 'secured_menu' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setLiabilityFlowMode('hub')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Liability Hub</span>
                    </button>
                    <span className="text-xs font-bold text-blue-500">
                      8 Secured Debt Types
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Secured Loans & Mortgages
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Collateralized credit secured by residential property, commercial estate, vehicles, gold, or investment securities
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {SECURED_LIABILITY_SUBTYPES.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectLiabilitySubType(item)}
                        className="p-4 rounded-2xl bg-white dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-500/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                            <Home className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {item.badge}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-zinc-400 font-mono">
                            Typical APR: {item.defaultInterestRate}%
                          </span>
                          <span className="text-blue-500 font-bold flex items-center gap-0.5">
                            Select <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 8.3 UNSECURED CREDIT MENU */}
              {activeTab === 'liability' && liabilityFlowMode === 'unsecured_menu' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setLiabilityFlowMode('hub')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Liability Hub</span>
                    </button>
                    <span className="text-xs font-bold text-rose-500">
                      9 Unsecured Debt Types
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      Unsecured & Consumer Debt
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Revolving credit cards, personal bank loans, BNPL lines, student education debt, and informal borrowings
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {UNSECURED_LIABILITY_SUBTYPES.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectLiabilitySubType(item)}
                        className="p-4 rounded-2xl bg-white dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 hover:border-rose-500 dark:hover:border-rose-500 hover:bg-rose-50/20 dark:hover:bg-rose-500/5 transition-all text-left flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {item.badge}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-zinc-400 font-mono">
                            Typical APR: {item.defaultInterestRate}%
                          </span>
                          <span className="text-rose-500 font-bold flex items-center gap-0.5">
                            Select <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 8.4 GROUP MENU (FOR ANY CATEGORY) */}
              {activeTab === 'liability' && liabilityFlowMode === 'group_menu' && selectedLiabilityGroup && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setLiabilityFlowMode('hub')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Liability Hub</span>
                    </button>
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${selectedLiabilityGroup.color}20`, color: selectedLiabilityGroup.color }}
                    >
                      {selectedLiabilityGroup.items.length} Types
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                      {selectedLiabilityGroup.groupName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      {selectedLiabilityGroup.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {selectedLiabilityGroup.items.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectLiabilitySubType(item)}
                        className="p-4 rounded-2xl bg-white dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 hover:border-rose-500 dark:hover:border-rose-500 transition-all text-left flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span 
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: `${selectedLiabilityGroup.color}15`, color: selectedLiabilityGroup.color }}
                          >
                            {item.isSecured ? 'Secured' : 'Unsecured'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            {item.badge}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 dark:text-zinc-400 font-mono">
                            Typical APR: {item.defaultInterestRate}%
                          </span>
                          <span className="text-rose-500 font-bold flex items-center gap-0.5">
                            Select <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 8.5 TAILORED LIABILITY CONFIGURATION FORM */}
              {activeTab === 'liability' && liabilityFlowMode === 'form' && (
                <form onSubmit={handleSaveLiability} className="space-y-4 animate-in fade-in duration-150">
                  {/* Category Summary Badge */}
                  <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold">
                        {selectedLiabilitySubType?.isSecured ? <Home className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                            {selectedLiabilitySubType?.name || selectedLiabType}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300">
                            {selectedLiabilitySubType?.badge || (selectedLiabilitySubType?.isSecured ? 'Secured' : 'Unsecured')}
                          </span>
                        </div>
                        <span className="block text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                          {selectedLiabilitySubType?.group || 'Personal Debt'} • Typical APR: ~{selectedLiabilitySubType?.defaultInterestRate || 10}%
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setLiabilityFlowMode('hub')}
                      className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      Change Type
                    </button>
                  </div>

                  {/* Loan / Liability Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Liability / Loan Title *
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={liabName}
                      onChange={e => setLiabName(e.target.value)}
                      placeholder={selectedLiabilitySubType ? `e.g. ${selectedLiabilitySubType.suggestedCreditors[0] || 'Bank'} ${selectedLiabilitySubType.name}` : 'e.g. Primary Residence Home Loan'}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                    />
                  </div>

                  {/* Principal Balance & Original Loan Amount */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Current Outstanding Balance ({currentSymbol}) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={liabBalance}
                        onChange={e => setLiabBalance(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                        <span>Original Sanctioned Amount ({currentSymbol})</span>
                        <span className="text-[10px] text-slate-400">Optional</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={liabOriginalAmount}
                        onChange={e => setLiabOriginalAmount(e.target.value)}
                        placeholder={liabBalance ? `e.g. ${parseFloat(liabBalance) * 1.25}` : '0.00'}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Creditor / Lender with Suggestion Chips */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Creditor / Bank / Financial Institution
                    </label>
                    <input
                      type="text"
                      value={liabInstitution}
                      onChange={e => setLiabInstitution(e.target.value)}
                      placeholder="e.g. HDFC Bank, SBI, ICICI, Chase, Muthoot"
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                    />

                    {/* Quick Suggestion Chips */}
                    {selectedLiabilitySubType?.suggestedCreditors && selectedLiabilitySubType.suggestedCreditors.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-slate-400">Popular:</span>
                        {selectedLiabilitySubType.suggestedCreditors.map(cred => (
                          <button
                            key={cred}
                            type="button"
                            onClick={() => setLiabInstitution(cred)}
                            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                              liabInstitution === cred
                                ? 'bg-rose-500/15 text-rose-500 border-rose-500/30 font-bold'
                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-slate-400'
                            }`}
                          >
                            {cred}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interest Rate & Monthly EMI with Auto-Calc helper */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                        <span>Interest Rate (% APR)</span>
                        {selectedLiabilitySubType?.defaultInterestRate && (
                          <span className="text-[10px] text-slate-400">Typ: ~{selectedLiabilitySubType.defaultInterestRate}%</span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={liabInterestRate}
                        onChange={e => setLiabInterestRate(e.target.value)}
                        placeholder="e.g. 8.5"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                          Monthly Payment (EMI) ({currentSymbol})
                        </label>
                        {liabBalance && liabInterestRate && liabTenureMonths && (
                          <button
                            type="button"
                            onClick={() => {
                              const emi = calculateEMI(parseFloat(liabBalance), parseFloat(liabInterestRate), parseInt(liabTenureMonths));
                              if (emi > 0) setLiabMonthlyPayment(emi.toString());
                            }}
                            className="text-[10px] text-rose-500 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <Calculator className="w-3 h-3" />
                            Auto Calc EMI
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={liabMonthlyPayment}
                        onChange={e => {
                          setLiabMonthlyPayment(e.target.value);
                          if (!liabMinPayment) setLiabMinPayment(e.target.value);
                        }}
                        placeholder="e.g. 25000"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Loan Tenure & Due Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Remaining Tenure (Months)
                      </label>
                      <input
                        type="number"
                        value={liabTenureMonths}
                        onChange={e => setLiabTenureMonths(e.target.value)}
                        placeholder="e.g. 240 (20 Years) or 36 (3 Years)"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Monthly EMI Due Day (Day of Month)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={liabDueDate}
                        onChange={e => setLiabDueDate(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Collateral / Credit Limit if relevant */}
                  {selectedLiabilitySubType?.isSecured ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Pledged Collateral / Property Description
                      </label>
                      <input
                        type="text"
                        value={liabCollateral}
                        onChange={e => setLiabCollateral(e.target.value)}
                        placeholder="e.g. Apartment #402, Green Valley or Honda City 2023 or 50g 22K Gold"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>
                  ) : (selectedLiabilitySubType?.category === 'Credit Card' || selectedLiabilitySubType?.category === 'Line of Credit') ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Total Credit Limit ({currentSymbol})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={liabCreditLimit}
                        onChange={e => setLiabCreditLimit(e.target.value)}
                        placeholder="e.g. 500000"
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 font-mono text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                      />
                    </div>
                  ) : null}

                  {/* Notes / Loan Account Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                      <span>Loan Account Number & Notes</span>
                      <span className="text-[10px] text-slate-400">Optional</span>
                    </label>
                    <input
                      type="text"
                      value={liabNotes}
                      onChange={e => setLiabNotes(e.target.value)}
                      placeholder="e.g. Loan A/C #8472910384, Fixed interest for first 3 years"
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setLiabilityFlowMode('hub')}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Save Liability to Balance Sheet</span>
                    </button>
                  </div>
                </form>
              )}

              {/* =========================================================================
                  FLOW 9: INCOME & EXPENSE FLOW
                 ========================================================================= */}
              {(activeTab === 'income' || activeTab === 'expense') && (
                <form onSubmit={handleSaveTransaction} className="space-y-4 animate-in fade-in duration-150">
                  <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                    activeTab === 'income'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${activeTab === 'income' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    <span>
                      {activeTab === 'income'
                        ? 'Logging income records incoming cash flow to your Monthly Inflow and updates net savings.'
                        : 'Logging expense records cash outflow to Monthly Expenses and updates budget tracking.'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Amount ({currentSymbol}) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-400 font-mono font-bold text-lg">
                        {currentSymbol}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        autoFocus
                        value={txAmount}
                        onChange={e => setTxAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-2xl pl-10 pr-4 py-3 font-mono text-xl font-bold focus:outline-none focus:ring-2 ${
                          activeTab === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400 focus:ring-emerald-500/30 focus:border-emerald-500'
                            : 'text-rose-600 dark:text-rose-400 focus:ring-rose-500/30 focus:border-rose-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                      Description / Payee
                    </label>
                    <input
                      type="text"
                      value={txDescription}
                      onChange={e => setTxDescription(e.target.value)}
                      placeholder={activeTab === 'income' ? 'e.g. Monthly Salary, Consulting' : 'e.g. Groceries, Electricity bill'}
                      className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={txCategory}
                        onChange={e => setTxCategory(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      >
                        {activeTab === 'income'
                          ? incomeCategories.map(c => <option key={c} value={c}>{c}</option>)
                          : expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Linked Account
                      </label>
                      <select
                        value={txAccountId}
                        onChange={e => setTxAccountId(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.institution})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                        Transaction Date
                      </label>
                      <input
                        type="date"
                        value={txDate}
                        onChange={e => setTxDate(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      />
                    </div>

                    <div className="pt-4">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-zinc-300 text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={txIsRecurring}
                          onChange={e => setTxIsRecurring(e.target.checked)}
                          className="w-4 h-4 rounded bg-white dark:bg-zinc-900 border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Recurring Monthly</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-zinc-800">
                    <button
                      type="button"
                      onClick={closeQuickAdd}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg transition-all cursor-pointer ${
                        activeTab === 'income'
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                          : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                      }`}
                    >
                      Save {activeTab === 'income' ? 'Income' : 'Expense'}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
