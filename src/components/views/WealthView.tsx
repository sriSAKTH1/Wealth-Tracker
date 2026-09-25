import React, { useState } from 'react';
import { 
  Coins, 
  ShieldAlert, 
  TrendingUp, 
  PieChart as PieIcon, 
  Plus, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Sliders, 
  ExternalLink, 
  Edit2, 
  Check, 
  RefreshCw, 
  Activity, 
  Calendar,
  X,
  RotateCcw,
  Save,
  AlertCircle,
  Percent,
  Tag,
  Folder,
  Search,
  Layers,
  History as HistoryIcon,
  ChevronDown,
  ChevronUp,
  Bookmark,
  SlidersHorizontal,
  FolderKanban,
  CreditCard,
  ShieldCheck,
  Home,
  Car,
  Calculator,
  ArrowDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { useFinance, CURRENCY_CONFIGS } from '../../context/FinanceContext';
import { WealthSubTab, AssetCategory, LiabilityCategory, Asset, Liability, DEFAULT_ASSET_TAGS, DEFAULT_LIABILITY_TAGS } from '../../types';
import { getGoogleFinanceUrl } from '../../services/marketDataService';
import { AssetEditModal } from '../AssetEditModal';
import { ConfirmationModal } from '../ConfirmationModal';
import { AssetDetailView } from '../wealth/AssetDetailView';
import { LiabilityDetailView } from '../wealth/LiabilityDetailView';

const DEFAULT_TARGET_ALLOCATIONS: Record<string, number> = {
  'Stocks & ETFs': 45,
  'Real Estate': 30,
  'Retirement (401k/IRA)': 15,
  'Cash & Bank': 5,
  'Crypto': 5,
};

const ALLOCATION_PRESETS: { name: string; description: string; allocations: Record<string, number> }[] = [
  {
    name: 'Growth (70/20/10)',
    description: 'High equities for long-term compounding',
    allocations: { 'Stocks & ETFs': 70, 'Real Estate': 15, 'Crypto': 10, 'Cash & Bank': 5 }
  },
  {
    name: 'Balanced (50/30/20)',
    description: 'Classic core wealth-building distribution',
    allocations: { 'Stocks & ETFs': 50, 'Real Estate': 30, 'Retirement (401k/IRA)': 15, 'Cash & Bank': 5 }
  },
  {
    name: 'Conservative (35/45/20)',
    description: 'Capital preservation & steady yields',
    allocations: { 'Stocks & ETFs': 30, 'Real Estate': 40, 'Retirement (401k/IRA)': 20, 'Cash & Bank': 10 }
  },
  {
    name: 'All-Weather',
    description: 'Ray Dalio-inspired macro diversification',
    allocations: { 'Stocks & ETFs': 35, 'Real Estate': 30, 'Fixed Income & Bonds': 20, 'Cash & Bank': 10, 'Crypto': 5 }
  }
];

export const WealthView: React.FC = () => {
  const { 
    wealthSubTab, 
    setWealthSubTab, 
    assets = [], 
    liabilities = [], 
    totalAssets, 
    totalLiabilities, 
    netWorth, 
    currency,
    convertCurrency,
    formatMoney, 
    assetAllocationBreakdown, 
    netWorthHistory = [], 
    deleteAsset, 
    deleteLiability, 
    openQuickAdd, 
    updateAsset, 
    updateLiability, 
    isPrivateMode,
    syncLiveMarketPrices,
    isSyncingMarketPrices,
    lastMarketSyncTime,
    marketSyncStatus
  } = useFinance();

  const [assetCategoryFilter, setAssetCategoryFilter] = useState<string>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [assetSearchQuery, setAssetSearchQuery] = useState<string>('');
  const [viewLayoutMode, setViewLayoutMode] = useState<'grid' | 'grouped' | 'purpose_breakdown'>('grid');
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [expandedAssetCategories, setExpandedAssetCategories] = useState<Record<string, boolean>>({});
  
  // Liability tab state mirroring Asset tab format
  const [liabCategoryFilter, setLiabCategoryFilter] = useState<string>('all');
  const [liabTagFilter, setLiabTagFilter] = useState<string>('all');
  const [liabSearchQuery, setLiabSearchQuery] = useState<string>('');
  const [liabViewLayoutMode, setLiabViewLayoutMode] = useState<'grid' | 'grouped' | 'payoff_strategy'>('grid');
  const [payoffStrategyMode, setPayoffStrategyMode] = useState<'avalanche' | 'snowball'>('avalanche');
  const [expandedLiabCategories, setExpandedLiabCategories] = useState<Record<string, boolean>>({});
  const [quickTagLiabId, setQuickTagLiabId] = useState<string | null>(null);
  const [quickCustomLiabTag, setQuickCustomLiabTag] = useState<string>('');
  const [editingLiabId, setEditingLiabId] = useState<string | null>(null);
  const [editLiabBalance, setEditLiabBalance] = useState<string>('');

  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [liabilityToDelete, setLiabilityToDelete] = useState<Liability | null>(null);
  const [activeDetailAssetId, setActiveDetailAssetId] = useState<string | null>(null);
  const [activeDetailLiabilityId, setActiveDetailLiabilityId] = useState<string | null>(null);
  const [quickTagAssetId, setQuickTagAssetId] = useState<string | null>(null);
  const [quickCustomTag, setQuickCustomTag] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const activeDetailAsset = React.useMemo(() => {
    return assets.find(a => a.id === activeDetailAssetId) || null;
  }, [assets, activeDetailAssetId]);

  const activeDetailLiability = React.useMemo(() => {
    return liabilities.find(l => l.id === activeDetailLiabilityId) || null;
  }, [liabilities, activeDetailLiabilityId]);

  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editAssetVal, setEditAssetVal] = useState<string>('');

  // Dynamically compute existing asset categories from the user's added assets
  const availableAssetCategories = React.useMemo(() => {
    const cats = new Set<string>();
    assets.forEach(a => {
      if (a.category && a.category.trim() !== '') {
        cats.add(a.category.trim());
      }
    });
    return Array.from(cats);
  }, [assets]);

  // Dynamically compute available tags with counts across all assets
  const availableAssetTags = React.useMemo(() => {
    const tagMap = new Map<string, number>();
    
    // Seed with DEFAULT_ASSET_TAGS
    DEFAULT_ASSET_TAGS.forEach(dt => {
      tagMap.set(dt.name, 0);
    });

    assets.forEach(a => {
      if (a.tags && a.tags.length > 0) {
        a.tags.forEach(t => {
          const trimmed = t.trim();
          if (trimmed) {
            tagMap.set(trimmed, (tagMap.get(trimmed) || 0) + 1);
          }
        });
      } else if (a.purpose && a.purpose.trim()) {
        const trimmed = a.purpose.trim();
        tagMap.set(trimmed, (tagMap.get(trimmed) || 0) + 1);
      }
    });

    // Only return tags that either have count > 0 or are in top defaults
    const list: { name: string; count: number; meta?: typeof DEFAULT_ASSET_TAGS[0] }[] = [];
    tagMap.forEach((count, name) => {
      const meta = DEFAULT_ASSET_TAGS.find(dt => dt.name.toLowerCase() === name.toLowerCase());
      if (count > 0 || meta) {
        list.push({ name, count, meta });
      }
    });

    // Sort so tags with holdings come first, then alphabetical
    return list.sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name));
  }, [assets]);

  // Tag Allocation Stats (Breakdown of Portfolio by Tag / Purpose)
  const tagAllocationStats = React.useMemo(() => {
    const map: Record<string, { totalVal: number; count: number; items: Asset[]; meta?: typeof DEFAULT_ASSET_TAGS[0] }> = {};
    let untaggedVal = 0;
    let untaggedCount = 0;
    const untaggedItems: Asset[] = [];

    assets.forEach(a => {
      const assetTags = a.tags && a.tags.length > 0 ? a.tags : (a.purpose ? [a.purpose] : []);
      const valInActive = convertCurrency(a.value || 0, a.currency || 'USD', currency);
      if (assetTags.length === 0) {
        untaggedVal += valInActive;
        untaggedCount += 1;
        untaggedItems.push(a);
      } else {
        // Distribute or assign
        assetTags.forEach(t => {
          const trimmed = t.trim();
          if (!map[trimmed]) {
            const meta = DEFAULT_ASSET_TAGS.find(dt => dt.name.toLowerCase() === trimmed.toLowerCase());
            map[trimmed] = { totalVal: 0, count: 0, items: [], meta };
          }
          map[trimmed].totalVal += valInActive;
          map[trimmed].count += 1;
          if (!map[trimmed].items.some(it => it.id === a.id)) {
            map[trimmed].items.push(a);
          }
        });
      }
    });

    const list = Object.entries(map).map(([name, data]) => ({
      name,
      totalVal: data.totalVal,
      count: data.count,
      percentage: totalAssets > 0 ? (data.totalVal / totalAssets) * 100 : 0,
      meta: data.meta,
      items: data.items
    }));

    if (untaggedCount > 0) {
      list.push({
        name: 'Untagged Assets',
        totalVal: untaggedVal,
        count: untaggedCount,
        percentage: totalAssets > 0 ? (untaggedVal / totalAssets) * 100 : 0,
        meta: undefined,
        items: untaggedItems
      });
    }

    return list.sort((a, b) => b.totalVal - a.totalVal);
  }, [assets, totalAssets, currency, convertCurrency]);

  // Keep filter valid if currently selected category was removed
  React.useEffect(() => {
    if (assetCategoryFilter !== 'all' && !availableAssetCategories.includes(assetCategoryFilter)) {
      setAssetCategoryFilter('all');
    }
  }, [availableAssetCategories, assetCategoryFilter]);

  // Target allocations for rebalancing with local persistence
  const [targetAllocations, setTargetAllocations] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('aura_target_allocations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_TARGET_ALLOCATIONS;
  });

  const [isEditingTargets, setIsEditingTargets] = useState<boolean>(false);
  const [tempAllocations, setTempAllocations] = useState<Record<string, number>>(targetAllocations);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryPct, setNewCategoryPct] = useState<string>('10');
  const [targetSaveSuccess, setTargetSaveSuccess] = useState<boolean>(false);

  const startEditingTargets = () => {
    setTempAllocations({ ...targetAllocations });
    setIsEditingTargets(true);
    setTargetSaveSuccess(false);
  };

  const cancelEditingTargets = () => {
    setIsEditingTargets(false);
  };

  const saveTargetAllocations = () => {
    // Sanitize values
    const cleaned: Record<string, number> = {};
    Object.entries(tempAllocations).forEach(([k, v]) => {
      if (k.trim()) {
        cleaned[k.trim()] = Math.max(0, Math.round(Number(v) || 0));
      }
    });

    if (Object.keys(cleaned).length === 0) {
      cleaned['Stocks & ETFs'] = 100;
    }

    setTargetAllocations(cleaned);
    try {
      localStorage.setItem('aura_target_allocations', JSON.stringify(cleaned));
    } catch {
      // Ignore local storage error
    }

    setTargetSaveSuccess(true);
    setTimeout(() => {
      setTargetSaveSuccess(false);
      setIsEditingTargets(false);
    }, 600);
  };

  const resetTargetAllocations = () => {
    setTempAllocations({ ...DEFAULT_TARGET_ALLOCATIONS });
  };

  const normalizeTargetAllocations = () => {
    const sum = Object.values(tempAllocations).reduce<number>((acc: number, v: number) => acc + (Number(v) || 0), 0);
    if (sum <= 0) {
      const keys = Object.keys(tempAllocations);
      const equalShare = Math.floor(100 / Math.max(1, keys.length));
      const normalized: Record<string, number> = {};
      keys.forEach((k, idx) => {
        normalized[k] = idx === 0 ? 100 - equalShare * (keys.length - 1) : equalShare;
      });
      setTempAllocations(normalized);
      return;
    }

    const normalized: Record<string, number> = {};
    const keys = Object.keys(tempAllocations);
    let runningSum = 0;

    keys.forEach((k, idx) => {
      if (idx === keys.length - 1) {
        normalized[k] = Math.max(0, 100 - runningSum);
      } else {
        const valNum = Number(tempAllocations[k]) || 0;
        const scaled = Math.round((valNum / sum) * 100);
        normalized[k] = scaled;
        runningSum += scaled;
      }
    });

    setTempAllocations(normalized);
  };

  const applyPreset = (preset: typeof ALLOCATION_PRESETS[0]) => {
    setTempAllocations({ ...preset.allocations });
  };

  const updateTempTarget = (category: string, value: number) => {
    setTempAllocations(prev => ({
      ...prev,
      [category]: Math.max(0, Math.min(100, value))
    }));
  };

  const removeTempCategory = (category: string) => {
    setTempAllocations(prev => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  };

  const addTempCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const pct = Math.max(0, Math.min(100, parseInt(newCategoryPct) || 10));
    setTempAllocations(prev => ({
      ...prev,
      [name]: pct
    }));
    setNewCategoryName('');
  };

  const tempTotalPercentage = Object.values(tempAllocations).reduce<number>((acc: number, v: number) => acc + (Number(v) || 0), 0);

  const [timeframe, setTimeframe] = useState<'3M' | '6M' | '1Y' | 'ALL'>('1Y');

  // Filter net worth history according to timeframe
  const filteredHistory = React.useMemo(() => {
    if (timeframe === '3M') return netWorthHistory.slice(-3);
    if (timeframe === '6M') return netWorthHistory.slice(-6);
    if (timeframe === '1Y') return netWorthHistory.slice(-12);
    return netWorthHistory;
  }, [netWorthHistory, timeframe]);

  const filteredAssets = React.useMemo(() => {
    return assets.filter(a => {
      // Category filter
      if (assetCategoryFilter !== 'all' && a.category !== assetCategoryFilter) {
        return false;
      }
      
      // Tag filter
      if (selectedTagFilter !== 'all') {
        const assetTags = a.tags && a.tags.length > 0 ? a.tags : (a.purpose ? [a.purpose] : []);
        if (selectedTagFilter === 'untagged') {
          if (assetTags.length > 0) return false;
        } else {
          const hasTag = assetTags.some(t => t.toLowerCase() === selectedTagFilter.toLowerCase());
          if (!hasTag) return false;
        }
      }

      // Search query (matches name, ticker, category, subType, institution, tags, purpose)
      if (assetSearchQuery.trim()) {
        const q = assetSearchQuery.toLowerCase().trim();
        const matchesName = a.name.toLowerCase().includes(q);
        const matchesTicker = a.ticker?.toLowerCase().includes(q) || false;
        const matchesCategory = a.category.toLowerCase().includes(q);
        const matchesSubType = a.subType?.toLowerCase().includes(q) || false;
        const matchesInstitution = a.institution?.toLowerCase().includes(q) || false;
        const matchesPurpose = a.purpose?.toLowerCase().includes(q) || false;
        const matchesTags = a.tags?.some(t => t.toLowerCase().includes(q)) || false;

        if (!matchesName && !matchesTicker && !matchesCategory && !matchesSubType && !matchesInstitution && !matchesPurpose && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [assets, assetCategoryFilter, selectedTagFilter, assetSearchQuery]);

  // Grouped Assets by Tag/Purpose
  const groupedAssets = React.useMemo(() => {
    const groups: { name: string; meta?: typeof DEFAULT_ASSET_TAGS[0]; totalVal: number; items: Asset[] }[] = [];
    const groupMap: Record<string, { meta?: typeof DEFAULT_ASSET_TAGS[0]; totalVal: number; items: Asset[] }> = {};
    const untaggedList: Asset[] = [];
    let untaggedVal = 0;

    filteredAssets.forEach(asset => {
      const assetTags = asset.tags && asset.tags.length > 0 ? asset.tags : (asset.purpose ? [asset.purpose] : []);
      const valInActive = convertCurrency(asset.value || 0, asset.currency || 'USD', currency);
      if (assetTags.length === 0) {
        untaggedList.push(asset);
        untaggedVal += valInActive;
      } else {
        // Add to its primary tag group (first tag)
        const primaryTag = assetTags[0].trim();
        if (!groupMap[primaryTag]) {
          const meta = DEFAULT_ASSET_TAGS.find(dt => dt.name.toLowerCase() === primaryTag.toLowerCase());
          groupMap[primaryTag] = { meta, totalVal: 0, items: [] };
        }
        groupMap[primaryTag].totalVal += valInActive;
        groupMap[primaryTag].items.push(asset);
      }
    });

    Object.entries(groupMap).forEach(([name, data]) => {
      groups.push({
        name,
        meta: data.meta,
        totalVal: data.totalVal,
        items: data.items
      });
    });

    // Sort groups by total valuation
    groups.sort((a, b) => b.totalVal - a.totalVal);

    if (untaggedList.length > 0) {
      groups.push({
        name: 'Untagged Holdings',
        meta: undefined,
        totalVal: untaggedVal,
        items: untaggedList
      });
    }

    return groups;
  }, [filteredAssets, currency, convertCurrency]);

  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: prev[groupName] === undefined ? false : !prev[groupName] // default expanded
    }));
  };

  const toggleAssetTagQuick = (assetId: string, tagName: string) => {
    const targetAsset = assets.find(a => a.id === assetId);
    if (!targetAsset) return;

    const currentTags = targetAsset.tags && targetAsset.tags.length > 0 
      ? [...targetAsset.tags] 
      : (targetAsset.purpose ? [targetAsset.purpose] : []);

    const updatedTags = currentTags.includes(tagName)
      ? currentTags.filter(t => t !== tagName)
      : [...currentTags, tagName];

    updateAsset(assetId, {
      tags: updatedTags.length > 0 ? updatedTags : undefined,
      purpose: updatedTags[0] || undefined
    });
  };

  const addAssetCustomTagQuick = (assetId: string) => {
    const trimmed = quickCustomTag.trim();
    if (!trimmed) return;
    const targetAsset = assets.find(a => a.id === assetId);
    if (!targetAsset) return;

    const currentTags = targetAsset.tags && targetAsset.tags.length > 0 
      ? [...targetAsset.tags] 
      : (targetAsset.purpose ? [targetAsset.purpose] : []);

    if (!currentTags.includes(trimmed)) {
      const updatedTags = [...currentTags, trimmed];
      updateAsset(assetId, {
        tags: updatedTags,
        purpose: updatedTags[0] || trimmed
      });
    }
    setQuickCustomTag('');
  };

  const startEditAsset = (id: string, currentVal: number) => {
    setEditingAssetId(id);
    setEditAssetVal(currentVal.toString());
  };

  const saveEditAsset = (id: string) => {
    const val = parseFloat(editAssetVal);
    if (!isNaN(val) && val >= 0) {
      updateAsset(id, { value: val });
    }
    setEditingAssetId(null);
  };

  // Liquid vs illiquid
  const liquidAssets = assets
    .filter(a => a.isLiquid || a.category === 'Cash & Bank')
    .reduce((s, a) => s + convertCurrency(a.value || 0, a.currency || 'USD', currency), 0);
  const illiquidAssets = totalAssets - liquidAssets;

  // Total Invested (Cost basis sum across assets) and Net Asset P&L
  const totalInvested = React.useMemo(() => {
    return assets.reduce((sum, a) => {
      const cost = a.costBasis !== undefined 
        ? a.costBasis 
        : (a.buyPrice && a.shares ? a.buyPrice * a.shares : a.value);
      return sum + convertCurrency(cost || 0, a.currency || 'USD', currency);
    }, 0);
  }, [assets, convertCurrency, currency]);

  const totalPnL = totalAssets - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  // Toggle asset selection checkbox
  const toggleAssetSelection = (id: string) => {
    setSelectedAssetIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllAssets = () => {
    if (selectedAssetIds.size === filteredAssets.length) {
      setSelectedAssetIds(new Set());
    } else {
      setSelectedAssetIds(new Set(filteredAssets.map(a => a.id)));
    }
  };

  // Grouped Assets by Category for the Accordion View
  const groupedAssetsByCategory = React.useMemo(() => {
    const groupMap: Record<string, Asset[]> = {};

    filteredAssets.forEach(asset => {
      const cat = asset.category || 'Other';
      if (!groupMap[cat]) {
        groupMap[cat] = [];
      }
      groupMap[cat].push(asset);
    });

    const categoryOrder = [
      'Equity', 
      'Debt', 
      'Cash & Savings', 
      'Real Estate', 
      'Commodities', 
      'Crypto', 
      'Alternatives', 
      'Other', 
      'Cash & Bank', 
      'Stocks & ETFs', 
      'Fixed Income & Bonds'
    ];

    const sortedCats = Object.keys(groupMap).sort((a, b) => {
      const idxA = categoryOrder.indexOf(a);
      const idxB = categoryOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    return sortedCats.map(cat => {
      const items = groupMap[cat];
      const totalVal = items.reduce((s, a) => s + convertCurrency(a.value || 0, a.currency || 'USD', currency), 0);
      const totalCost = items.reduce((s, a) => {
        const cost = a.costBasis !== undefined ? a.costBasis : (a.buyPrice && a.shares ? a.buyPrice * a.shares : a.value);
        return s + convertCurrency(cost || 0, a.currency || 'USD', currency);
      }, 0);
      const totalGain = totalVal - totalCost;
      const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

      return {
        category: cat,
        items,
        totalVal,
        totalCost,
        totalGain,
        totalGainPercent
      };
    });
  }, [filteredAssets, convertCurrency, currency]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'equity':
      case 'stocks & etfs':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'cash & savings':
      case 'cash & bank':
        return <Coins className="w-4 h-4 text-slate-500 dark:text-zinc-400" />;
      case 'debt':
      case 'fixed income & bonds':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
      case 'real estate':
        return <Home className="w-4 h-4 text-purple-500" />;
      case 'commodities':
        return <Coins className="w-4 h-4 text-amber-500" />;
      case 'crypto':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      default:
        return <Layers className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getCategoryIconStyle = (category: string) => {
    switch (category.toLowerCase()) {
      case 'equity':
      case 'stocks & etfs':
        return 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'cash & savings':
      case 'cash & bank':
        return 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300';
      case 'debt':
      case 'fixed income & bonds':
        return 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
      case 'real estate':
        return 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'commodities':
        return 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400';
      case 'crypto':
        return 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300';
    }
  };

  const getItemGain = (asset: Asset) => {
    const cost = asset.costBasis !== undefined
      ? asset.costBasis
      : (asset.buyPrice && asset.shares ? asset.buyPrice * asset.shares : null);
    
    if (cost !== null && cost > 0) {
      const gain = asset.value - cost;
      const gainPercent = (gain / cost) * 100;
      return { gain, gainPercent };
    }

    if (asset.priceChange24h !== undefined) {
      const gainPercent = asset.priceChange24h;
      const gain = asset.priceChange24hAmount ? asset.priceChange24hAmount * (asset.shares || 1) : (asset.value * gainPercent) / 100;
      return { gain, gainPercent };
    }

    return { gain: 0, gainPercent: 0 };
  };

  // Monthly total minimum debt payment
  const totalMinDebtPayment = liabilities.reduce((s, l) => s + (l.minimumPayment || 0), 0);

  // Dynamically compute available liability categories
  const availableLiabilityCategories = React.useMemo(() => {
    const cats = new Set<string>();
    liabilities.forEach(l => {
      if (l.category && l.category.trim() !== '') {
        cats.add(l.category.trim());
      }
    });
    return Array.from(cats);
  }, [liabilities]);

  // Debt Allocation by Category Breakdown (matching tagAllocationStats in Assets)
  const liabilityAllocationStats = React.useMemo(() => {
    if (totalLiabilities <= 0) return [];
    const catMap = new Map<string, { total: number; count: number }>();
    liabilities.forEach(l => {
      const cat = l.category || 'Other Debt';
      const curr = catMap.get(cat) || { total: 0, count: 0 };
      catMap.set(cat, { total: curr.total + l.balance, count: curr.count + 1 });
    });
    
    const colors: Record<string, string> = {
      'Home Loan': '#3b82f6',
      'Mortgage': '#3b82f6',
      'Loan Against Property': '#6366f1',
      'Auto Loan': '#10b981',
      'Credit Card': '#ef4444',
      'Personal Loan': '#f59e0b',
      'Student Loan': '#8b5cf6',
      'Gold Loan': '#d97706',
      'Buy Now Pay Later': '#ec4899',
      'Business Loan': '#06b6d4',
      'Line of Credit': '#14b8a6',
      'Other Debt': '#64748b'
    };

    return Array.from(catMap.entries()).map(([name, data]) => ({
      name,
      totalVal: data.total,
      count: data.count,
      percentage: (data.total / totalLiabilities) * 100,
      color: colors[name] || '#ef4444'
    })).sort((a, b) => b.totalVal - a.totalVal);
  }, [liabilities, totalLiabilities]);

  // Weighted Average APR %
  const weightedAvgApr = React.useMemo(() => {
    if (totalLiabilities <= 0) return 0;
    const weightedSum = liabilities.reduce((s, l) => s + (l.balance * (l.interestRate || 0)), 0);
    return weightedSum / totalLiabilities;
  }, [liabilities, totalLiabilities]);

  // Total Monthly Payment (EMIs + Min Payments)
  const totalMonthlyDebtPayment = React.useMemo(() => {
    return liabilities.reduce((s, l) => s + (l.monthlyPayment || l.minimumPayment || 0), 0);
  }, [liabilities]);

  // Highest Rate Liability
  const highestRateLiab = React.useMemo(() => {
    if (liabilities.length === 0) return null;
    return [...liabilities].sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0];
  }, [liabilities]);

  // Dynamically compute available liability tags with counts across all liabilities
  const availableLiabilityTags = React.useMemo(() => {
    const tagMap = new Map<string, number>();
    
    // Seed with DEFAULT_LIABILITY_TAGS
    DEFAULT_LIABILITY_TAGS.forEach(dt => {
      tagMap.set(dt.name, 0);
    });

    liabilities.forEach(l => {
      if (l.tags && l.tags.length > 0) {
        l.tags.forEach(t => {
          const trimmed = t.trim();
          if (trimmed) {
            tagMap.set(trimmed, (tagMap.get(trimmed) || 0) + 1);
          }
        });
      }
    });

    const list: { name: string; count: number; meta?: typeof DEFAULT_LIABILITY_TAGS[0] }[] = [];
    tagMap.forEach((count, name) => {
      const meta = DEFAULT_LIABILITY_TAGS.find(dt => dt.name.toLowerCase() === name.toLowerCase());
      if (count > 0 || meta) {
        list.push({ name, count, meta });
      }
    });

    return list;
  }, [liabilities]);

  // Inline edit handlers for Liability balance
  const startEditLiability = (id: string, currentBalance: number) => {
    setEditingLiabId(id);
    setEditLiabBalance(currentBalance.toString());
  };

  const saveEditLiability = (id: string) => {
    const val = parseFloat(editLiabBalance);
    if (!isNaN(val) && val >= 0) {
      updateLiability(id, { balance: val });
    }
    setEditingLiabId(null);
  };

  // Quick tag handlers for liabilities
  const toggleLiabTagQuick = (liabId: string, tagName: string) => {
    const liab = liabilities.find(l => l.id === liabId);
    if (!liab) return;
    const currentTags = liab.tags || [];
    const exists = currentTags.some(t => t.toLowerCase() === tagName.toLowerCase());
    const newTags = exists
      ? currentTags.filter(t => t.toLowerCase() !== tagName.toLowerCase())
      : [...currentTags, tagName];
    updateLiability(liabId, { tags: newTags });
  };

  const addLiabCustomTagQuick = (liabId: string) => {
    const trimmed = quickCustomLiabTag.trim();
    if (!trimmed) return;
    toggleLiabTagQuick(liabId, trimmed);
    setQuickCustomLiabTag('');
  };

  // Filtered Liabilities based on category filter, tag filter & search query
  const filteredLiabilities = React.useMemo(() => {
    return liabilities.filter(l => {
      if (liabCategoryFilter !== 'all' && l.category !== liabCategoryFilter) {
        return false;
      }
      if (liabTagFilter !== 'all') {
        const hasTag = l.tags && l.tags.some(t => t.toLowerCase() === liabTagFilter.toLowerCase());
        if (!hasTag) return false;
      }
      if (liabSearchQuery.trim()) {
        const q = liabSearchQuery.toLowerCase();
        const matchesName = l.name.toLowerCase().includes(q);
        const matchesCat = l.category.toLowerCase().includes(q);
        const matchesInst = l.institution ? l.institution.toLowerCase().includes(q) : false;
        const matchesNotes = l.notes ? l.notes.toLowerCase().includes(q) : false;
        const matchesSub = l.subType ? l.subType.toLowerCase().includes(q) : false;
        const matchesTag = l.tags ? l.tags.some(t => t.toLowerCase().includes(q)) : false;
        return matchesName || matchesCat || matchesInst || matchesNotes || matchesSub || matchesTag;
      }
      return true;
    });
  }, [liabilities, liabCategoryFilter, liabTagFilter, liabSearchQuery]);

  // Grouped Liabilities by Category
  const groupedLiabilities = React.useMemo(() => {
    const groups: Record<string, Liability[]> = {};
    filteredLiabilities.forEach(l => {
      const cat = l.category || 'Other Debt';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(l);
    });
    return groups;
  }, [filteredLiabilities]);

  // Prioritized Liabilities for Payoff Strategies (Avalanche vs Snowball)
  const prioritizedLiabilities = React.useMemo(() => {
    const list = [...filteredLiabilities];
    if (payoffStrategyMode === 'avalanche') {
      return list.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    } else {
      return list.sort((a, b) => a.balance - b.balance);
    }
  }, [filteredLiabilities, payoffStrategyMode]);

  const getLiabilityCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'home loan':
      case 'mortgage':
      case 'loan against property':
        return <Home className="w-4 h-4 text-blue-400" />;
      case 'auto loan':
        return <Car className="w-4 h-4 text-emerald-400" />;
      case 'credit card':
      case 'line of credit':
      case 'buy now pay later':
        return <CreditCard className="w-4 h-4 text-rose-400" />;
      case 'gold loan':
        return <Coins className="w-4 h-4 text-amber-400" />;
      case 'student loan':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-amber-400" />;
    }
  };

  const renderLiabilityCard = (liab: Liability) => {
    const isEditing = editingLiabId === liab.id;
    const isQuickTagOpen = quickTagLiabId === liab.id;
    const repaidPercent = liab.originalAmount && liab.originalAmount > liab.balance
      ? Math.min(100, Math.max(0, ((liab.originalAmount - liab.balance) / liab.originalAmount) * 100))
      : null;
    const annualInterest = (liab.balance * (liab.interestRate || 0)) / 100;
    const liabTags = liab.tags || [];

    return (
      <div 
        key={liab.id}
        className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between group shadow-sm"
      >
        <div>
          {/* Card Header: Icon Avatar + Title + Badges + Action Buttons */}
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-3">
              <div 
                onClick={() => setActiveDetailLiabilityId(liab.id)}
                className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner cursor-pointer hover:ring-2 hover:ring-rose-400/50 transition-all"
                title="Click to view repayment history and loan details"
              >
                {getLiabilityCategoryIcon(liab.category)}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 
                    onClick={() => setActiveDetailLiabilityId(liab.id)}
                    className="text-sm font-bold text-zinc-100 hover:text-rose-400 cursor-pointer transition-colors leading-snug"
                    title="Click to view repayment history and loan details"
                  >
                    {liab.name}
                  </h4>
                  {liab.subType && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium border border-zinc-700">
                      {liab.subType}
                    </span>
                  )}
                  {liab.isSecured && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 font-medium border border-blue-500/30">
                      Secured
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  <span className="text-zinc-300 font-medium">{liab.category}</span>
                  {liab.institution ? ` • ${liab.institution}` : ''}
                  {liab.dueDate ? ` • Auto-debit: Day ${liab.dueDate}` : ''}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEditLiability(liab.id, liab.balance)}
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Quick edit balance"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                id={`btn-delete-liability-${liab.id}`}
                onClick={() => setLiabilityToDelete(liab)}
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Delete liability"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tags Cloud on Card & Quick Add Button (Mirroring Asset Tag Cloud) */}
          <div className="flex items-center gap-1.5 flex-wrap my-2.5">
            {liabTags.map(tag => {
              const meta = DEFAULT_LIABILITY_TAGS.find(t => t.name.toLowerCase() === tag.toLowerCase());
              return (
                <span
                  key={tag}
                  onClick={() => setLiabTagFilter(tag)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer transition-all hover:scale-105 flex items-center gap-1 ${
                    meta?.badgeClass || 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                  }`}
                  title={`Filter by tag "${tag}"`}
                >
                  <span>🏷️</span>
                  <span>{tag}</span>
                </span>
              );
            })}

            <button
              type="button"
              onClick={() => setQuickTagLiabId(isQuickTagOpen ? null : liab.id)}
              className="px-2 py-0.5 rounded-md text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer flex items-center gap-0.5 transition-colors"
              title="Assign tags or loan purpose"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>{liabTags.length === 0 ? 'Add Tag' : 'Tag'}</span>
            </button>
          </div>

          {/* Quick Tag Popover / Inline Selector */}
          {isQuickTagOpen && (
            <div className="mb-3 p-3 rounded-xl bg-zinc-950 border border-rose-500/40 shadow-xl space-y-2 text-xs animate-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 text-[11px] flex items-center gap-1">
                  <Tag className="w-3 h-3 text-rose-400" />
                  Manage Tags for {liab.name}
                </span>
                <button
                  onClick={() => setQuickTagLiabId(null)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {DEFAULT_LIABILITY_TAGS.map(t => {
                  const isAssigned = liabTags.some(tag => tag.toLowerCase() === t.name.toLowerCase());
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => toggleLiabTagQuick(liab.id, t.name)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                        isAssigned
                          ? `${t.badgeClass} ring-1 ring-rose-400/40 font-bold`
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {isAssigned && <Check className="w-2.5 h-2.5" />}
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-900">
                <input
                  type="text"
                  value={quickCustomLiabTag}
                  onChange={e => setQuickCustomLiabTag(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addLiabCustomTagQuick(liab.id);
                    }
                  }}
                  placeholder="Custom tag (e.g. Refinance 2026)..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => addLiabCustomTagQuick(liab.id)}
                  disabled={!quickCustomLiabTag.trim()}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold disabled:opacity-40 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Holding Metadata Pill (Loan Sanction, APR, EMI, Tenure, Collateral) */}
          <div className="mb-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 text-[11px] text-zinc-300 font-mono">
            {/* Repayment Progress bar if original amount exists */}
            {repaidPercent !== null && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Payoff Progress: <strong className="text-emerald-400">{repaidPercent.toFixed(1)}%</strong></span>
                  <span>Sanctioned: {formatMoney(liab.originalAmount || 0)}</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/60">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all" 
                    style={{ width: `${repaidPercent}%` }} 
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-0.5 text-[11px]">
              <div>
                <span className="text-zinc-500 text-[10px] block">Interest Rate</span>
                <span className="text-rose-400 font-bold">{liab.interestRate ? `${liab.interestRate}% APR` : '0% (Interest-Free)'}</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">Monthly Payment / EMI</span>
                <span className="text-zinc-200 font-bold">
                  {liab.monthlyPayment ? `${formatMoney(liab.monthlyPayment)}/mo` : liab.minimumPayment ? `${formatMoney(liab.minimumPayment)} min` : 'Pay in Full'}
                </span>
              </div>
              {liab.creditLimit && (
                <div>
                  <span className="text-zinc-500 text-[10px] block">Credit Limit</span>
                  <span className="text-zinc-300">
                    {formatMoney(liab.creditLimit)} ({((liab.balance / liab.creditLimit) * 100).toFixed(0)}% used)
                  </span>
                </div>
              )}
              {liab.tenureMonths && (
                <div>
                  <span className="text-zinc-500 text-[10px] block">Loan Tenure</span>
                  <span className="text-zinc-300">
                    {liab.remainingMonths ? `${liab.remainingMonths} of ${liab.tenureMonths} mos` : `${liab.tenureMonths} months`}
                  </span>
                </div>
              )}
            </div>

            {liab.collateral && (
              <div className="pt-1 border-t border-zinc-900/80 text-[10px] text-zinc-400 flex items-center gap-1">
                <span className="text-zinc-500">Collateral:</span>
                <span className="text-zinc-300 italic">{liab.collateral}</span>
              </div>
            )}
          </div>

          {/* Notes Preview if available */}
          {liab.notes && (
            <p className="text-[11px] text-zinc-400 italic bg-zinc-950/40 px-2 py-1 rounded-md mb-2.5 border border-zinc-800/40">
              "{liab.notes}"
            </p>
          )}
        </div>

        {/* Card Footer: Principal Balance (with inline edit) & Annual Interest Drag (Mirroring P&L) */}
        <div className="pt-2.5 border-t border-zinc-800/80 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">
              Principal Balance
            </span>
            {isEditing ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  value={editLiabBalance}
                  onChange={e => setEditLiabBalance(e.target.value)}
                  className="w-28 bg-zinc-950 border border-rose-500 rounded px-2 py-0.5 text-xs font-mono text-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => saveEditLiability(liab.id)}
                  className="p-1 bg-rose-500 text-zinc-950 rounded cursor-pointer hover:bg-rose-400"
                  title="Save balance"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingLiabId(null)}
                  className="p-1 bg-zinc-800 text-zinc-400 rounded cursor-pointer hover:text-zinc-200"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-lg font-bold font-mono text-rose-400">
                  {formatMoney(liab.balance)}
                </span>
                <button
                  onClick={() => startEditLiability(liab.id, liab.balance)}
                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Quick inline edit balance"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-500 block font-medium">Annual Interest Drag</span>
            <span className="text-xs font-mono font-semibold flex items-center justify-end gap-0.5 text-rose-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{formatMoney(annualInterest)}/yr</span>
              <span className="text-[10px] text-zinc-400 font-normal">({liab.interestRate || 0}%)</span>
            </span>
          </div>
        </div>

        {/* Repayment History & Details CTA Button */}
        <button
          type="button"
          onClick={() => setActiveDetailLiabilityId(liab.id)}
          className="w-full mt-3 py-1.5 px-3 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group/history"
        >
          <span className="flex items-center gap-1.5">
            <HistoryIcon className="w-3.5 h-3.5 text-rose-400" />
            <span>Repayment History</span>
          </span>
          <span className="text-[11px] text-zinc-500 group-hover/history:text-rose-400 font-mono transition-colors">
            {liab.records && liab.records.length > 0 ? `${liab.records.length} records` : 'Details & Record'} &rarr;
          </span>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24 lg:pb-12 animate-in fade-in duration-200">
      {/* Wealth Sub-Tabs Bar (4 Items: Assets, Liabilities, Net Worth, Allocation) */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs overflow-x-auto no-scrollbar">
        <button
          id="tab-wealth-assets"
          onClick={() => setWealthSubTab('assets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            wealthSubTab === 'assets'
              ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>Assets ({assets.length})</span>
        </button>

        <button
          id="tab-wealth-liabilities"
          onClick={() => setWealthSubTab('liabilities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            wealthSubTab === 'liabilities'
              ? 'bg-zinc-800 text-rose-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Liabilities ({liabilities.length})</span>
        </button>

        <button
          id="tab-wealth-networth"
          onClick={() => setWealthSubTab('networth')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            wealthSubTab === 'networth'
              ? 'bg-zinc-800 text-cyan-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Net Worth Trend</span>
        </button>

        <button
          id="tab-wealth-allocation"
          onClick={() => setWealthSubTab('allocation')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shrink-0 ${
            wealthSubTab === 'allocation'
              ? 'bg-zinc-800 text-purple-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <PieIcon className="w-4 h-4" />
          <span>Allocation & Rebalance</span>
        </button>
      </div>

      {/* 1. ASSETS TAB */}
      {wealthSubTab === 'assets' && (
        activeDetailAsset ? (
          <AssetDetailView
            asset={activeDetailAsset}
            onBack={() => setActiveDetailAssetId(null)}
            onEdit={() => setAssetToEdit(activeDetailAsset)}
            onDelete={() => setAssetToDelete(activeDetailAsset)}
            onUpdateAsset={(id, updates) => updateAsset(id, updates)}
            isPrivateMode={isPrivateMode}
          />
        ) : (
          <div className="space-y-5 animate-in fade-in duration-150">
          {/* Top Asset KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Gross Asset Valuation</span>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {formatMoney(totalAssets)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">{assets.length} diversified holdings</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Liquid Assets</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {formatMoney(liquidAssets)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {totalAssets > 0 ? ((liquidAssets / totalAssets) * 100).toFixed(1) : 0}% of total portfolio
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Illiquid Capital (Real Estate/Auto)</span>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                {formatMoney(illiquidAssets)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Fixed physical & long-term equity</p>
            </div>
          </div>

          {/* Purpose & Goal Allocation Breakdown Bar */}
          {tagAllocationStats.length > 0 && totalAssets > 0 && (
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                    Portfolio Allocation by Purpose & Tags
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400">
                  Click any tag to filter holdings
                </span>
              </div>

              {/* Stacked Progress Bar */}
              <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden flex p-0.5 gap-0.5 border border-zinc-800">
                {tagAllocationStats.map(stat => {
                  const color = stat.meta?.color || (stat.name === 'Untagged Assets' ? '#71717a' : '#10b981');
                  return (
                    <div
                      key={stat.name}
                      style={{ width: `${Math.max(1.5, stat.percentage)}%`, backgroundColor: color }}
                      className="h-full rounded-full transition-all cursor-pointer hover:opacity-80 relative group"
                      onClick={() => setSelectedTagFilter(stat.name === 'Untagged Assets' ? 'untagged' : stat.name)}
                      title={`${stat.name}: ${formatMoney(stat.totalVal)} (${(stat.percentage ?? 0).toFixed(1)}%)`}
                    />
                  );
                })}
              </div>

              {/* Tag Chips with Values & Percentages */}
              <div className="flex flex-wrap gap-2 pt-1">
                {tagAllocationStats.map(stat => {
                  const isSelected = (selectedTagFilter === stat.name) || (selectedTagFilter === 'untagged' && stat.name === 'Untagged Assets');
                  return (
                    <button
                      key={stat.name}
                      onClick={() => setSelectedTagFilter(isSelected ? 'all' : (stat.name === 'Untagged Assets' ? 'untagged' : stat.name))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/40 shadow-sm'
                          : 'bg-zinc-950/80 text-zinc-300 border-zinc-800/90 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: stat.meta?.color || (stat.name === 'Untagged Assets' ? '#71717a' : '#10b981') }}
                      />
                      <span>{stat.name}</span>
                      <span className="font-mono text-[11px] text-zinc-400 font-semibold">
                        {formatMoney(stat.totalVal)} ({(stat.percentage ?? 0).toFixed(0)}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search, Layout Switcher & Actions Toolbar */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={assetSearchQuery}
                  onChange={e => setAssetSearchQuery(e.target.value)}
                  placeholder="Search assets by name, ticker, tag (e.g. Retirement, Trading), broker..."
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {assetSearchQuery && (
                  <button
                    onClick={() => setAssetSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Layout Mode Buttons (Grid vs Grouped by Purpose vs Breakdown) */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setViewLayoutMode('grid')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewLayoutMode === 'grid'
                      ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Standard Grid Card View"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>

                <button
                  onClick={() => setViewLayoutMode('grouped')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewLayoutMode === 'grouped'
                      ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Group holdings by Tag / Investment Purpose folders"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Group by Tag</span>
                </button>

                <button
                  onClick={() => setViewLayoutMode('purpose_breakdown')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewLayoutMode === 'purpose_breakdown'
                      ? 'bg-zinc-800 text-emerald-400 border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Purpose and Goals Analytics"
                >
                  <PieIcon className="w-3.5 h-3.5" />
                  <span>Goals Analytics</span>
                </button>
              </div>

              {/* Actions: Sync & Add */}
              <div className="flex items-center gap-2">
                <button
                  id="btn-sync-live-prices"
                  onClick={() => syncLiveMarketPrices(true)}
                  disabled={isSyncingMarketPrices}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-emerald-500/40 text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  title="Update all stock and crypto holdings with latest live market prices"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingMarketPrices ? 'animate-spin text-emerald-400' : 'text-zinc-400'}`} />
                  <span className="hidden md:inline">{isSyncingMarketPrices ? 'Syncing...' : 'Sync Market Prices'}</span>
                </button>

                <button
                  id="btn-wealth-add-asset"
                  onClick={() => openQuickAdd('asset')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Asset</span>
                </button>
              </div>
            </div>

            {/* Tag Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-zinc-400" />
                Tags:
              </span>

              <button
                key="all-tags"
                onClick={() => setSelectedTagFilter('all')}
                className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  selectedTagFilter === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>All Tags</span>
                <span className="font-mono text-[10px] opacity-75">({assets.length})</span>
              </button>

              {availableAssetTags.map(tagItem => {
                const isSelected = selectedTagFilter.toLowerCase() === tagItem.name.toLowerCase();
                return (
                  <button
                    key={tagItem.name}
                    onClick={() => setSelectedTagFilter(isSelected ? 'all' : tagItem.name)}
                    className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? `${tagItem.meta?.badgeClass || 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'} ring-1 ring-emerald-500/30 font-semibold`
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  >
                    <span>{tagItem.name}</span>
                    <span className="font-mono text-[10px] opacity-75">({tagItem.count})</span>
                  </button>
                );
              })}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider mr-1 flex items-center gap-1">
                <Folder className="w-3 h-3 text-zinc-400" />
                Category:
              </span>

              <button
                key="all-cats"
                onClick={() => setAssetCategoryFilter('all')}
                className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                  assetCategoryFilter === 'all'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                All ({assets.length})
              </button>

              {availableAssetCategories.map(cat => {
                const count = assets.filter(a => a.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setAssetCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                      assetCategoryFilter === cat
                        ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-sm'
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Sync Status Alert Banner */}
          {marketSyncStatus && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                <span>{marketSyncStatus}</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Auto-saved to portfolio</span>
            </div>
          )}

          {/* View Render: 1. Purpose Breakdown View */}
          {viewLayoutMode === 'purpose_breakdown' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">
                      Portfolio Purpose & Goal Breakdown
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Distribution of wealth by life objectives and investment strategies
                    </p>
                  </div>
                  <button
                    onClick={() => setViewLayoutMode('grid')}
                    className="text-xs text-emerald-400 hover:underline cursor-pointer"
                  >
                    Return to Grid View
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tagAllocationStats.map(stat => {
                    const color = stat.meta?.color || (stat.name === 'Untagged Assets' ? '#71717a' : '#10b981');
                    return (
                      <div
                        key={stat.name}
                        className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span 
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5"
                              style={{ 
                                backgroundColor: `${color}15`, 
                                color: color,
                                borderColor: `${color}35`
                              }}
                            >
                              <span>🏷️</span>
                              <span>{stat.name}</span>
                            </span>
                            <span className="text-xs font-mono font-bold text-zinc-300">
                              {(stat.percentage ?? 0).toFixed(1)}%
                            </span>
                          </div>

                          <div className="text-xl font-bold font-mono text-white">
                            {formatMoney(stat.totalVal)}
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-1">
                            {stat.count} {stat.count === 1 ? 'asset holding' : 'asset holdings'}
                          </p>
                        </div>

                        <div>
                          {/* Mini progress */}
                          <div className="w-full h-1.5 rounded-full bg-zinc-900 overflow-hidden mb-2.5">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.min(100, stat.percentage)}%`, backgroundColor: color }}
                            />
                          </div>

                          <button
                            onClick={() => {
                              setSelectedTagFilter(stat.name === 'Untagged Assets' ? 'untagged' : stat.name);
                              setViewLayoutMode('grid');
                            }}
                            className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-colors cursor-pointer text-center block"
                          >
                            View {stat.count} Holdings &rarr;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* View Render: 2. Grouped By Purpose / Tag View */}
          {viewLayoutMode === 'grouped' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {groupedAssets.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center space-y-3">
                  <Coins className="w-6 h-6 text-zinc-400 mx-auto" />
                  <p className="text-xs text-zinc-400">No assets match the current filter.</p>
                </div>
              ) : (
                groupedAssets.map(group => {
                  const isCollapsed = expandedGroups[group.name] === false;
                  const color = group.meta?.color || (group.name === 'Untagged Holdings' ? '#71717a' : '#10b981');
                  const groupPct = totalAssets > 0 ? ((group.totalVal / totalAssets) * 100).toFixed(1) : '0';

                  return (
                    <div
                      key={group.name}
                      className="rounded-2xl bg-zinc-900/60 border border-zinc-800/90 overflow-hidden"
                    >
                      {/* Group Header */}
                      <button
                        type="button"
                        onClick={() => toggleGroupExpand(group.name)}
                        className="w-full px-5 py-3.5 bg-zinc-900/90 hover:bg-zinc-850 flex items-center justify-between border-b border-zinc-800/80 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                                <span>{group.name}</span>
                              </h3>
                              <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-mono font-semibold">
                                {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <span className="text-[11px] text-zinc-400">
                              {groupPct}% of total portfolio
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right font-mono">
                            <span className="text-sm font-bold text-white block">
                              {formatMoney(group.totalVal)}
                            </span>
                          </div>
                          <div className="p-1 rounded-lg bg-zinc-800 text-zinc-400">
                            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                          </div>
                        </div>
                      </button>

                      {/* Group Items Grid */}
                      {!isCollapsed && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.items.map(asset => {
                            const isZeroVal = !asset.value || asset.value === 0;
                            const gain = (!isZeroVal && asset.costBasis) ? asset.value - asset.costBasis : 0;
                            const gainPercent = (isZeroVal || gain === 0 || !asset.costBasis || asset.costBasis <= 0) 
                              ? 0 
                              : (gain / asset.costBasis) * 100;
                            const isEditing = editingAssetId === asset.id;
                            const assetTags = asset.tags && asset.tags.length > 0 ? asset.tags : (asset.purpose ? [asset.purpose] : []);
                            const isDifferentCurrency = Boolean(asset.currency && asset.currency !== currency);
                            const assetValueInActive = convertCurrency(asset.value || 0, asset.currency || 'USD', currency);
                            const gainInActive = convertCurrency(gain, asset.currency || 'USD', currency);

                            return (
                              <div
                                key={asset.id}
                                className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 hover:border-zinc-700 transition-all flex flex-col justify-between group"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-3">
                                      <div
                                        onClick={() => setActiveDetailAssetId(asset.id)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-zinc-950 shadow-md shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-400/50 transition-all"
                                        style={{ backgroundColor: asset.color || '#10b981' }}
                                        title="Click to view details, lots & history"
                                      >
                                        {asset.ticker ? asset.ticker.slice(0, 2) : asset.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <h4 
                                            onClick={() => setActiveDetailAssetId(asset.id)}
                                            className="text-sm font-bold text-zinc-100 hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
                                            title="Click to open equity details page"
                                          >
                                            {asset.name}
                                          </h4>
                                          {asset.ticker ? (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                                              {asset.exchange ? `${asset.exchange}: ` : ''}{asset.ticker}
                                            </span>
                                          ) : null}
                                        </div>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">
                                          {asset.category} {asset.institution ? `• ${asset.institution}` : ''}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => setAssetToEdit(asset)}
                                        className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                        title="Edit asset details and tags"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        id={`btn-delete-asset-${asset.id}`}
                                        onClick={() => setAssetToDelete(asset)}
                                        className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                        title="Delete asset"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Tags Cloud on Card */}
                                  <div className="flex items-center gap-1.5 flex-wrap my-2">
                                    {assetTags.map(tag => {
                                      const meta = DEFAULT_ASSET_TAGS.find(t => t.name.toLowerCase() === tag.toLowerCase());
                                      return (
                                        <span
                                          key={tag}
                                          onClick={() => setSelectedTagFilter(tag)}
                                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer transition-all hover:scale-105 ${
                                            meta?.badgeClass || 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                          }`}
                                          title={`Filter by tag "${tag}"`}
                                        >
                                          🏷️ {tag}
                                        </span>
                                      );
                                    })}
                                    <button
                                      onClick={() => setAssetToEdit(asset)}
                                      className="px-2 py-0.5 rounded-md text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer flex items-center gap-0.5"
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                      <span>Tag</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-zinc-800/80 flex items-end justify-between">
                                  <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">
                                      Valuation
                                    </span>
                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                      <span className="text-base font-bold font-mono text-zinc-100">
                                        {formatMoney(assetValueInActive)}
                                      </span>
                                      {isDifferentCurrency && (
                                        <span className="text-[10px] text-zinc-400 font-mono">
                                          ({CURRENCY_CONFIGS[asset.currency!]?.symbol || asset.currency} {(Number(asset.value) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })})
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {asset.costBasis !== undefined && asset.costBasis !== null && (
                                    <div className="text-right">
                                      <span className="text-[10px] text-zinc-500 block font-medium">P&L</span>
                                      <span className={`text-xs font-mono font-semibold flex items-center justify-end gap-0.5 ${
                                        gainPercent === 0 || gain === 0 || isZeroVal 
                                          ? 'text-zinc-400' 
                                          : gain > 0 
                                          ? 'text-emerald-400' 
                                          : 'text-rose-400'
                                      }`}>
                                        {!(gainPercent === 0 || gain === 0 || isZeroVal) && (
                                          gain > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />
                                        )}
                                        {formatMoney(gainInActive)} ({gainPercent > 0 ? '+' : ''}{gainPercent.toFixed(1)}%)
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Lots & History CTA Button */}
                                <button
                                  type="button"
                                  onClick={() => setActiveDetailAssetId(asset.id)}
                                  className="w-full mt-2.5 py-1.5 px-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-500/40 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group/lots"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Lots & History</span>
                                  </span>
                                  <span className="text-[11px] text-zinc-500 group-hover/lots:text-emerald-400 font-mono transition-colors">
                                    {asset.lots && asset.lots.length > 0 ? `${asset.lots.length} lots` : 'Details & Record'} &rarr;
                                  </span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* View Render: 3. Standard Grid View */}
          {viewLayoutMode === 'grid' && (
            <div>
              {filteredAssets.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-200">No assets found</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      {assets.length === 0 
                        ? 'You have not added any assets yet. Click "Add Asset" to log your first holding.'
                        : `No assets match your search or filter settings.`}
                    </p>
                  </div>
                  {(assetSearchQuery || assetCategoryFilter !== 'all' || selectedTagFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setAssetSearchQuery('');
                        setAssetCategoryFilter('all');
                        setSelectedTagFilter('all');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredAssets.map(asset => {
                    const isZeroVal = !asset.value || asset.value === 0;
                    const gain = (!isZeroVal && asset.costBasis) ? asset.value - asset.costBasis : 0;
                    const gainPercent = (isZeroVal || gain === 0 || !asset.costBasis || asset.costBasis <= 0) 
                      ? 0 
                      : (gain / asset.costBasis) * 100;
                    const isEditing = editingAssetId === asset.id;
                    const assetTags = asset.tags && asset.tags.length > 0 ? asset.tags : (asset.purpose ? [asset.purpose] : []);
                    const isQuickTagOpen = quickTagAssetId === asset.id;
                    const isDifferentCurrency = Boolean(asset.currency && asset.currency !== currency);
                    const assetValueInActive = convertCurrency(asset.value || 0, asset.currency || 'USD', currency);
                    const gainInActive = convertCurrency(gain, asset.currency || 'USD', currency);

                    return (
                      <div 
                        key={asset.id}
                        className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/90 hover:border-zinc-700 transition-all flex flex-col justify-between group relative"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-3">
                              <div 
                                onClick={() => setActiveDetailAssetId(asset.id)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-zinc-950 shadow-md shrink-0 cursor-pointer hover:ring-2 hover:ring-emerald-400/50 transition-all"
                                style={{ backgroundColor: asset.color || '#10b981' }}
                                title="Click to view details, lots & history"
                              >
                                {asset.ticker ? asset.ticker.slice(0, 2) : asset.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h3 
                                    onClick={() => setActiveDetailAssetId(asset.id)}
                                    className="text-sm font-bold text-zinc-100 hover:text-emerald-400 cursor-pointer transition-colors leading-snug"
                                    title="Click to open equity details page"
                                  >
                                    {asset.name}
                                  </h3>
                                  {asset.assetType === 'mutual_fund' || asset.exchange === 'MF' ? (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      MF: {asset.schemeCode || asset.ticker}
                                    </span>
                                  ) : asset.ticker ? (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      {asset.exchange ? `${asset.exchange}: ` : ''}{asset.ticker}
                                    </span>
                                  ) : null}
                                  {asset.subType && !asset.ticker && !asset.schemeCode && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-medium border border-zinc-700">
                                      {asset.subType}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                  {asset.category} {asset.fundHouse ? `• ${asset.fundHouse}` : asset.institution ? `• ${asset.institution}` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setAssetToEdit(asset)}
                                className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                title="Edit full details & tags"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`btn-delete-asset-grouped-${asset.id}`}
                                onClick={() => setAssetToDelete(asset)}
                                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                                title="Delete asset"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Asset Tags Cloud & Quick Add Button */}
                          <div className="flex items-center gap-1.5 flex-wrap my-2">
                            {assetTags.map(tag => {
                              const meta = DEFAULT_ASSET_TAGS.find(t => t.name.toLowerCase() === tag.toLowerCase());
                              return (
                                <span
                                  key={tag}
                                  onClick={() => setSelectedTagFilter(tag)}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer transition-all hover:scale-105 flex items-center gap-1 ${
                                    meta?.badgeClass || 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                  }`}
                                  title={`Filter by "${tag}"`}
                                >
                                  <span>🏷️</span>
                                  <span>{tag}</span>
                                </span>
                              );
                            })}

                            <button
                              type="button"
                              onClick={() => setQuickTagAssetId(isQuickTagOpen ? null : asset.id)}
                              className="px-2 py-0.5 rounded-md text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 cursor-pointer flex items-center gap-0.5 transition-colors"
                              title="Assign tags or categorize purpose"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>{assetTags.length === 0 ? 'Add Tag' : 'Tag'}</span>
                            </button>
                          </div>

                          {/* Quick Tag Popover / Inline Selector */}
                          {isQuickTagOpen && (
                            <div className="mb-3 p-3 rounded-xl bg-zinc-950 border border-emerald-500/40 shadow-xl space-y-2 text-xs animate-in zoom-in-95 duration-100">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-zinc-200 text-[11px] flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-emerald-400" />
                                  Manage Tags for {asset.name}
                                </span>
                                <button
                                  onClick={() => setQuickTagAssetId(null)}
                                  className="text-zinc-500 hover:text-zinc-300"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex flex-wrap gap-1">
                                {DEFAULT_ASSET_TAGS.map(t => {
                                  const isAssigned = assetTags.includes(t.name);
                                  return (
                                    <button
                                      key={t.name}
                                      type="button"
                                      onClick={() => toggleAssetTagQuick(asset.id, t.name)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                                        isAssigned
                                          ? `${t.badgeClass} ring-1 ring-emerald-400/40 font-bold`
                                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                      }`}
                                    >
                                      {isAssigned && <Check className="w-2.5 h-2.5" />}
                                      <span>{t.name}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-900">
                                <input
                                  type="text"
                                  value={quickCustomTag}
                                  onChange={e => setQuickCustomTag(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addAssetCustomTagQuick(asset.id);
                                    }
                                  }}
                                  placeholder="Custom tag (e.g. Wedding 2026)..."
                                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => addAssetCustomTagQuick(asset.id)}
                                  disabled={!quickCustomTag.trim()}
                                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-semibold disabled:opacity-40 cursor-pointer"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Holding Metadata Pill (Units, Purchase Date, Live NAV) */}
                          {(asset.shares || asset.buyDate || asset.currentPrice || asset.isin) && (
                            <div className="mb-3 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-300 font-mono">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {asset.shares && (
                                    <span>
                                      <strong className="text-white font-bold">{asset.shares}</strong> {asset.assetType === 'mutual_fund' || asset.exchange === 'MF' ? 'units' : 'shares'}
                                      {asset.buyPrice !== undefined && asset.buyPrice !== null ? (
                                        <span className="text-zinc-400">
                                          {' '}@ {asset.currency === 'INR' || asset.exchange === 'NSE' || asset.exchange === 'BSE' || asset.exchange === 'MF' ? `₹${(Number(asset.buyPrice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${(Number(asset.buyPrice) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                        </span>
                                      ) : ''}
                                    </span>
                                  )}
                                  {asset.buyDate && (
                                    <span className="text-zinc-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-zinc-400" />
                                      {asset.buyDate}
                                    </span>
                                  )}
                                </div>

                                {asset.currentPrice !== undefined && asset.currentPrice !== null && (
                                  <div className="flex items-center gap-1 text-right">
                                    <span className="text-zinc-400">{asset.assetType === 'mutual_fund' || asset.exchange === 'MF' ? 'NAV:' : 'Live:'}</span>
                                    <span className="text-emerald-400 font-bold">
                                      {asset.currency === 'INR' || asset.exchange === 'NSE' || asset.exchange === 'BSE' || asset.exchange === 'MF' ? `₹${(Number(asset.currentPrice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${(Number(asset.currentPrice) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                    </span>
                                    {asset.priceChange24h !== undefined && asset.priceChange24h !== 0 && (
                                      <span className={`text-[10px] font-bold ${asset.priceChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        ({asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h}%)
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* ISIN, Data Status, and Google Finance external link */}
                              <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[10px] text-zinc-400 flex-wrap gap-1">
                                <div className="flex items-center gap-2">
                                  {asset.isin && (
                                    <span>ISIN: <strong className="text-zinc-300">{asset.isin}</strong></span>
                                  )}
                                  {asset.dataStatus && (
                                    <span className="text-emerald-400 font-semibold">• {asset.dataStatus}</span>
                                  )}
                                  {asset.navDate && (
                                    <span>• NAV Date: {asset.navDate}</span>
                                  )}
                                </div>

                                {asset.ticker && (
                                  <a
                                    href={getGoogleFinanceUrl(asset.ticker, asset.exchange || 'NSE', asset.name)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-0.5 hover:underline ml-auto"
                                  >
                                    <span>Google Finance</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Notes Preview if available */}
                          {asset.notes && (
                            <p className="text-[11px] text-zinc-400 italic bg-zinc-950/40 px-2 py-1 rounded-md mb-2 border border-zinc-800/40">
                              "{asset.notes}"
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-zinc-800/80 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-medium">
                              Current Valuation
                            </span>
                            {isEditing ? (
                              <div className="flex items-center gap-1.5 mt-1">
                                <input
                                  type="number"
                                  value={editAssetVal}
                                  onChange={e => setEditAssetVal(e.target.value)}
                                  className="w-28 bg-zinc-950 border border-emerald-500 rounded px-2 py-0.5 text-xs font-mono text-white"
                                />
                                <button
                                  onClick={() => saveEditAsset(asset.id)}
                                  className="p-1 bg-emerald-500 text-zinc-950 rounded cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <span className="text-lg font-bold font-mono text-zinc-100">
                                  {formatMoney(assetValueInActive)}
                                </span>
                                {isDifferentCurrency && (
                                  <span className="text-[11px] text-zinc-400 font-mono">
                                    ({CURRENCY_CONFIGS[asset.currency!]?.symbol || asset.currency} {(Number(asset.value) || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })})
                                  </span>
                                )}
                                <button
                                  onClick={() => startEditAsset(asset.id, Number(asset.value) || 0)}
                                  className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Quick inline edit valuation"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {asset.costBasis !== undefined && asset.costBasis !== null && (
                            <div className="text-right">
                              <span className="text-[10px] text-zinc-500 block font-medium">Unrealized P&L</span>
                              <span className={`text-xs font-mono font-semibold flex items-center justify-end gap-0.5 ${
                                gainPercent === 0 || gain === 0 || isZeroVal 
                                  ? 'text-zinc-400' 
                                  : gain > 0 
                                  ? 'text-emerald-400' 
                                  : 'text-rose-400'
                              }`}>
                                {!(gainPercent === 0 || gain === 0 || isZeroVal) && (
                                  gain > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />
                                )}
                                {formatMoney(gainInActive)} ({gainPercent > 0 ? '+' : ''}{gainPercent.toFixed(1)}%)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Lots & History CTA Button */}
                        <button
                          type="button"
                          onClick={() => setActiveDetailAssetId(asset.id)}
                          className="w-full mt-3 py-1.5 px-3 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 border border-zinc-800 hover:border-emerald-500/40 text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group/lots"
                        >
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Lots & History</span>
                          </span>
                          <span className="text-[11px] text-zinc-500 group-hover/lots:text-emerald-400 font-mono transition-colors">
                            {asset.lots && asset.lots.length > 0 ? `${asset.lots.length} lots` : 'Details & Record'} &rarr;
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        )
      )}

      {/* 2. LIABILITIES TAB (Mirroring Assets Tab Format) */}
      {wealthSubTab === 'liabilities' && (
        activeDetailLiability ? (
          <LiabilityDetailView
            liability={activeDetailLiability}
            onBack={() => setActiveDetailLiabilityId(null)}
            onEdit={() => {}}
            onDelete={() => {
              if (activeDetailLiabilityId === activeDetailLiability.id) {
                setActiveDetailLiabilityId(null);
              }
            }}
            onUpdateLiability={(id, updates) => updateLiability(id, updates)}
            isPrivateMode={isPrivateMode}
          />
        ) : (
          <div className="space-y-5 animate-in fade-in duration-150">
          {/* Top Liability KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Total Debt Load</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                {formatMoney(totalLiabilities)}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">{liabilities.length} active liabilities</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Monthly Debt Service / EMI</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {formatMoney(totalMonthlyDebtPayment)}/mo
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Required monthly debt payments</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Weighted Average APR</span>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                {weightedAvgApr.toFixed(1)}%
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {highestRateLiab ? `Highest: ${highestRateLiab.name} (${highestRateLiab.interestRate}%)` : 'No high interest debt'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
              <span className="text-xs text-zinc-400 font-medium">Debt-to-Asset Ratio</span>
              <div className="text-2xl font-bold font-mono text-zinc-100 mt-1">
                {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {(totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0) < 30 ? 'Low Risk (Healthy Solvency)' : (totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0) < 50 ? 'Moderate Leverage' : 'High Debt Burden'}
              </p>
            </div>
          </div>

          {/* Debt Allocation by Category Breakdown Bar (Mirroring Portfolio Allocation in Assets) */}
          {liabilityAllocationStats.length > 0 && totalLiabilities > 0 && (
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-rose-400" />
                  <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                    Debt Allocation by Category
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400">
                  Click any category to filter debts
                </span>
              </div>

              {/* Stacked Progress Bar */}
              <div className="w-full h-3 rounded-full bg-zinc-950 overflow-hidden flex p-0.5 gap-0.5 border border-zinc-800">
                {liabilityAllocationStats.map(stat => (
                  <div
                    key={stat.name}
                    style={{ width: `${Math.max(2, stat.percentage)}%`, backgroundColor: stat.color }}
                    className="h-full rounded-full transition-all cursor-pointer hover:opacity-80 relative group"
                    onClick={() => setLiabCategoryFilter(liabCategoryFilter === stat.name ? 'all' : stat.name)}
                    title={`${stat.name}: ${formatMoney(stat.totalVal)} (${stat.percentage.toFixed(1)}%)`}
                  />
                ))}
              </div>

              {/* Category Chips with Values & Percentages */}
              <div className="flex flex-wrap gap-2 pt-1">
                {liabilityAllocationStats.map(stat => {
                  const isSelected = liabCategoryFilter === stat.name;
                  return (
                    <button
                      key={stat.name}
                      onClick={() => setLiabCategoryFilter(isSelected ? 'all' : stat.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/40 shadow-sm'
                          : 'bg-zinc-950/80 text-zinc-300 border-zinc-800/90 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: stat.color }}
                      />
                      <span>{stat.name}</span>
                      <span className="font-mono text-[11px] text-zinc-400 font-semibold">
                        {formatMoney(stat.totalVal)} ({stat.percentage.toFixed(0)}%)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search, Layout Switcher & Actions Toolbar (Mirroring Assets Toolbar) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={liabSearchQuery}
                  onChange={e => setLiabSearchQuery(e.target.value)}
                  placeholder="Search debts by title, creditor (HDFC, Chase), category, notes..."
                  className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
                {liabSearchQuery && (
                  <button
                    onClick={() => setLiabSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* View Layout Mode Buttons (Grid vs Grouped vs Payoff Strategy) */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setLiabViewLayoutMode('grid')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    liabViewLayoutMode === 'grid'
                      ? 'bg-zinc-800 text-rose-400 border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Standard Grid Card View"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>

                <button
                  onClick={() => setLiabViewLayoutMode('grouped')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    liabViewLayoutMode === 'grouped'
                      ? 'bg-zinc-800 text-rose-400 border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Group liabilities by category folders"
                >
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Group by Category</span>
                </button>

                <button
                  onClick={() => setLiabViewLayoutMode('payoff_strategy')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                    liabViewLayoutMode === 'payoff_strategy'
                      ? 'bg-zinc-800 text-rose-400 border border-zinc-700 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="Payoff Strategy (Avalanche vs Snowball)"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Payoff Strategy</span>
                </button>
              </div>

              {/* Action: Add Liability */}
              <button
                id="btn-wealth-add-liability"
                onClick={() => openQuickAdd('liability')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Debt / Liability</span>
              </button>
            </div>

            {/* Tag / Purpose Filter Pills (Mirroring Asset Tag Filter Pills) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider mr-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-zinc-400" />
                Tags:
              </span>

              <button
                key="all-liab-tags"
                onClick={() => setLiabTagFilter('all')}
                className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  liabTagFilter === 'all'
                    ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                <span>All Tags</span>
                <span className="font-mono text-[10px] opacity-75">({liabilities.length})</span>
              </button>

              {availableLiabilityTags.map(tagItem => {
                const isSelected = liabTagFilter.toLowerCase() === tagItem.name.toLowerCase();
                return (
                  <button
                    key={tagItem.name}
                    onClick={() => setLiabTagFilter(isSelected ? 'all' : tagItem.name)}
                    className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? `${tagItem.meta?.badgeClass || 'bg-rose-500/20 text-rose-300 border-rose-500/40'} ring-1 ring-rose-500/30 font-semibold`
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                    }`}
                  >
                    <span>{tagItem.name}</span>
                    <span className="font-mono text-[10px] opacity-75">({tagItem.count})</span>
                  </button>
                );
              })}
            </div>

            {/* Category Filter Pills (Mirroring Asset Category Filter Pills) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider mr-1 flex items-center gap-1">
                <Folder className="w-3 h-3 text-zinc-400" />
                Category:
              </span>

              <button
                key="all-liab-cats"
                onClick={() => setLiabCategoryFilter('all')}
                className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                  liabCategoryFilter === 'all'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700 shadow-sm'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                All ({liabilities.length})
              </button>

              {availableLiabilityCategories.map(cat => {
                const count = liabilities.filter(l => l.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setLiabCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                      liabCategoryFilter === cat
                        ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40 shadow-sm'
                        : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* RENDER VIEW 1: PAYOFF STRATEGY (SNOWBALL VS AVALANCHE) */}
          {liabViewLayoutMode === 'payoff_strategy' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Debt Payoff Optimizer</span>
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Systematically eliminate liabilities using proven financial acceleration methods
                    </p>
                  </div>

                  {/* Strategy Toggle */}
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setPayoffStrategyMode('avalanche')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        payoffStrategyMode === 'avalanche'
                          ? 'bg-rose-500 text-zinc-950 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Avalanche (Highest APR)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoffStrategyMode('snowball')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        payoffStrategyMode === 'snowball'
                          ? 'bg-amber-400 text-zinc-950 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Snowball (Smallest Balance)
                    </button>
                  </div>
                </div>

                {/* Strategy Insight Banner */}
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-zinc-200">
                      {payoffStrategyMode === 'avalanche' 
                        ? '🎯 Debt Avalanche Method (Maximum Financial Savings)' 
                        : '⚡ Debt Snowball Method (Quick Psychological Momentum)'}
                    </span>
                    <p className="text-zinc-400 text-[11px]">
                      {payoffStrategyMode === 'avalanche'
                        ? 'Tackles highest APR debt first while paying minimums on others. Minimizes total interest paid to banks.'
                        : 'Eliminates smallest balance debts first regardless of APR to free up monthly cash flow and build confidence.'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Estimated Annual Interest Drag</span>
                    <span className="font-mono font-bold text-rose-400 text-sm">
                      {formatMoney(liabilities.reduce((s, l) => s + (l.balance * (l.interestRate || 0) / 100), 0))}/yr
                    </span>
                  </div>
                </div>

                {/* Prioritized List */}
                <div className="space-y-2.5">
                  {prioritizedLiabilities.map((liab, idx) => {
                    const isTopPriority = idx === 0;
                    const annualInterest = (liab.balance * (liab.interestRate || 0)) / 100;
                    return (
                      <div
                        key={liab.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isTopPriority
                            ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30'
                            : 'bg-zinc-950/60 border-zinc-800/80'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 ${
                            isTopPriority ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 
                                onClick={() => setActiveDetailLiabilityId(liab.id)}
                                className="text-sm font-bold text-zinc-100 hover:text-rose-400 cursor-pointer transition-colors"
                                title="Click to view repayment history and loan details"
                              >
                                {liab.name}
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-zinc-800 text-zinc-300">
                                {liab.category}
                              </span>
                              {isTopPriority && (
                                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-500/20 text-rose-300 animate-pulse">
                                  🎯 Pay Extra Here!
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {liab.institution} • APR: <span className="text-rose-400 font-semibold">{liab.interestRate || 0}%</span> • Min: {formatMoney(liab.monthlyPayment || liab.minimumPayment || 0)}/mo
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-5 text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Principal</span>
                            <span className="font-mono font-bold text-zinc-100 text-sm">{formatMoney(liab.balance)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Annual Interest</span>
                            <span className="font-mono font-semibold text-rose-400 text-xs">{formatMoney(annualInterest)}/yr</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* RENDER VIEW 2: GROUPED BY CATEGORY VIEW */}
          {liabViewLayoutMode === 'grouped' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {Object.keys(groupedLiabilities).map(catName => {
                const groupItems = groupedLiabilities[catName];
                const groupTotal = groupItems.reduce((s, l) => s + l.balance, 0);
                const isExpanded = expandedLiabCategories[catName] !== false; // default expanded

                return (
                  <div key={catName} className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setExpandedLiabCategories(prev => ({ ...prev, [catName]: !isExpanded }))}
                    >
                      <div className="flex items-center gap-2.5">
                        <Folder className="w-4 h-4 text-rose-400" />
                        <h3 className="text-sm font-bold text-zinc-100">{catName}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                          {groupItems.length}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-rose-400 text-sm">
                          {formatMoney(groupTotal)}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {groupItems.map(liab => renderLiabilityCard(liab))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* RENDER VIEW 3: GRID VIEW */}
          {liabViewLayoutMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredLiabilities.map(liab => renderLiabilityCard(liab))}

              {filteredLiabilities.length === 0 && (
                <div className="col-span-full py-12 text-center bg-zinc-900/40 rounded-2xl border border-zinc-800/60 space-y-2">
                  <ShieldAlert className="w-8 h-8 text-zinc-500 mx-auto" />
                  <h4 className="text-xs font-bold text-zinc-300">No liabilities found</h4>
                  <p className="text-[11px] text-zinc-500">
                    {liabSearchQuery ? 'No debts match your search query.' : 'No active debts recorded in this category.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        )
      )}

      {/* 3. NET WORTH TREND TAB */}
      {wealthSubTab === 'networth' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Controls & Timeframe */}
          <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-zinc-400 font-medium">Historical Trajectory</span>
                <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                  {formatMoney(netWorth)}
                </div>
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                {(['3M', '6M', '1Y', 'ALL'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded-lg font-medium transition-all ${
                      timeframe === tf ? 'bg-zinc-800 text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Net Worth Chart */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="nwArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="assetArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    stroke="#71717a" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={10} 
                    tickLine={false}
                    tickFormatter={val => `$${((Number(val) || 0) / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl shadow-2xl text-xs font-mono space-y-1">
                            <p className="text-zinc-400 font-semibold">{d.date}</p>
                            <p className="text-emerald-400 font-bold">
                              Net Worth: {isPrivateMode ? '••••••' : `$${(Number(d.netWorth) || 0).toLocaleString()}`}
                            </p>
                            <p className="text-blue-400">
                              Assets: {isPrivateMode ? '••••••' : `$${(Number(d.totalAssets) || 0).toLocaleString()}`}
                            </p>
                            <p className="text-rose-400">
                              Liabilities: {isPrivateMode ? '••••••' : `$${(Number(d.totalLiabilities) || 0).toLocaleString()}`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalAssets" 
                    stroke="#3b82f6" 
                    strokeWidth={1.5} 
                    fill="url(#assetArea)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="netWorth" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    fill="url(#nwArea)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Historical Log Table */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-300 mb-3 uppercase tracking-wider">
              Audit Snapshot Log
            </h3>
            <div className="divide-y divide-zinc-800/80 text-xs">
              {netWorthHistory.slice().reverse().map((snap, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <span className="font-mono text-zinc-400">{snap.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-400 font-mono hidden sm:inline">
                      Assets: {formatMoney(snap.totalAssets)}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatMoney(snap.netWorth)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. ALLOCATION & REBALANCING TAB */}
      {wealthSubTab === 'allocation' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Pie / Donut Chart */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 self-start">
                Current Asset Distribution
              </h3>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocationBreakdown}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {assetAllocationBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => isPrivateMode ? '••••••' : `$${(Number(val) || 0).toLocaleString()}`} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-xs pt-2">
                {assetAllocationBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-950/50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-300 truncate max-w-[90px]">{item.category}</span>
                    </div>
                    <span className="font-mono text-zinc-400 font-semibold">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Rebalance Guidance */}
            <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Target Rebalance Engine</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isEditingTargets ? (
                    <>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono hidden sm:inline">
                        Smart Guidance
                      </span>
                      <button
                        id="btn-edit-target-rebalance"
                        onClick={startEditingTargets}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-xs font-semibold text-emerald-400 border border-zinc-700 hover:border-emerald-500/40 transition-all shadow-sm active:scale-95 cursor-pointer"
                        title="Edit Target Allocations"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Targets</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                        tempTotalPercentage === 100 
                          ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                          : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                      }`}>
                        Total: {tempTotalPercentage}%
                      </span>
                      <button
                        onClick={cancelEditingTargets}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {!isEditingTargets ? (
                <>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Compare your actual capital weighting against ideal financial targets to identify over/under-allocated assets.
                  </p>

                  <div className="space-y-3 pt-1">
                    {Object.entries(targetAllocations).map(([cat, targetPctValue]) => {
                      const targetPct = Number(targetPctValue);
                      const currentItem = assetAllocationBreakdown.find(a => a.category === cat);
                      const currentPct = currentItem ? currentItem.percentage : 0;
                      const delta = currentPct - targetPct;

                      return (
                        <div key={cat} className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-zinc-200">{cat}</span>
                            <div className="flex items-center gap-2 font-mono">
                              <span className="text-zinc-400">Actual: {currentPct}%</span>
                              <span className="text-zinc-500">|</span>
                              <span className="text-emerald-400">Target: {targetPct}%</span>
                            </div>
                          </div>

                          <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-emerald-400 h-full transition-all"
                              style={{ width: `${Math.min(100, currentPct)}%` }}
                            />
                          </div>

                          <div className="text-[11px] flex items-center justify-between pt-0.5">
                            <span className={`${
                              Math.abs(delta) < 3 ? 'text-emerald-400' : delta > 0 ? 'text-cyan-400' : 'text-amber-400'
                            }`}>
                              {Math.abs(delta) < 3 
                                ? '✓ Balanced' 
                                : delta > 0 
                                ? `Overweight by +${(delta ?? 0).toFixed(1)}%` 
                                : `Underweight by ${(delta ?? 0).toFixed(1)}%`}
                            </span>
                            <span className="text-zinc-500 font-mono text-[10px]">
                              {delta < 0 ? `Suggested inflow: ${formatMoney((Math.abs(delta) / 100) * totalAssets)}` : 'Hold / Harvest'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={startEditingTargets}
                    className="w-full py-2.5 rounded-xl bg-zinc-950/40 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-emerald-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Customize Target Allocations</span>
                  </button>
                </>
              ) : (
                /* Interactive Target Editor Panel */
                <div className="space-y-4 pt-1 animate-in fade-in duration-150">
                  {/* Preset Allocation Chips */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>Quick Allocation Presets</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {ALLOCATION_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="p-2 rounded-xl bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
                        >
                          <div className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {preset.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Sliders & Inputs */}
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {Object.entries(tempAllocations).map(([category, targetVal]) => (
                      <div 
                        key={category} 
                        className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-200">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="relative flex items-center">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={targetVal}
                                onChange={(e) => updateTempTarget(category, parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 text-right text-xs font-mono font-bold bg-zinc-900 border border-zinc-700 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-500"
                              />
                              <span className="text-xs text-zinc-500 ml-1 font-mono">%</span>
                            </div>

                            {Object.keys(tempAllocations).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTempCategory(category)}
                                className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Remove target"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interactive Range Slider */}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={targetVal}
                          onChange={(e) => updateTempTarget(category, parseInt(e.target.value) || 0)}
                          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Add New Category Target */}
                  <div className="p-3 rounded-xl bg-zinc-950/40 border border-dashed border-zinc-800 space-y-2">
                    <label className="text-[11px] font-semibold text-zinc-400">Add Asset Category Target</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Commodities or Fixed Income"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTempCategory();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                        list="available-categories-list"
                      />
                      <datalist id="available-categories-list">
                        {availableAssetCategories
                          .filter(c => !tempAllocations[c])
                          .map((c, i) => (
                            <option key={i} value={c} />
                          ))}
                      </datalist>

                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newCategoryPct}
                          onChange={(e) => setNewCategoryPct(e.target.value)}
                          className="w-14 px-2 py-1.5 text-right text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-xs text-zinc-500 ml-1 font-mono">%</span>
                      </div>

                      <button
                        type="button"
                        onClick={addTempCategory}
                        disabled={!newCategoryName.trim()}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Sum & Auto-balance notice */}
                  {tempTotalPercentage !== 100 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>Allocations sum to {tempTotalPercentage}%. Recommended: 100%.</span>
                      </div>
                      <button
                        type="button"
                        onClick={normalizeTargetAllocations}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors shrink-0 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Auto-balance</span>
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={resetTargetAllocations}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Defaults</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelEditingTargets}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-750 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveTargetAllocations}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all shadow-sm active:scale-95 cursor-pointer"
                      >
                        {targetSaveSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Targets</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Asset & Tag Details Edit Modal */}
      {assetToEdit && (
        <AssetEditModal
          asset={assetToEdit}
          isOpen={!!assetToEdit}
          onClose={() => setAssetToEdit(null)}
          onSave={(assetIdOrUpdates, maybeUpdates) => {
            if (typeof assetIdOrUpdates === 'string' && maybeUpdates) {
              updateAsset(assetIdOrUpdates, maybeUpdates);
            } else if (typeof assetIdOrUpdates === 'object') {
              updateAsset(assetToEdit.id, assetIdOrUpdates);
            }
            setAssetToEdit(null);
          }}
          onDelete={id => {
            if (activeDetailAssetId === id) {
              setActiveDetailAssetId(null);
            }
            deleteAsset(id);
            setAssetToEdit(null);
          }}
        />
      )}

      {/* Confirmation Modal for Deleting Asset */}
      <ConfirmationModal
        isOpen={!!assetToDelete}
        onClose={() => setAssetToDelete(null)}
        onConfirm={() => {
          if (assetToDelete) {
            if (activeDetailAssetId === assetToDelete.id) {
              setActiveDetailAssetId(null);
            }
            deleteAsset(assetToDelete.id);
            setAssetToDelete(null);
          }
        }}
        title="Delete Asset"
        description="Are you sure you want to delete this asset from your portfolio? This will remove its valuation from your net worth calculations and asset allocation."
        itemType="asset"
        itemName={assetToDelete?.name}
        details={assetToDelete ? [
          { label: 'Category', value: assetToDelete.category },
          { label: 'Valuation', value: formatMoney(assetToDelete.value) },
          { label: 'Product Type', value: assetToDelete.subType || (assetToDelete.assetType === 'mutual_fund' ? 'Equity Mutual Fund' : assetToDelete.category) },
          ...(assetToDelete.institution ? [{ label: 'Holding Institution', value: assetToDelete.institution }] : [])
        ] : []}
        confirmButtonText="Delete Asset"
      />

      {/* Confirmation Modal for Deleting Liability */}
      <ConfirmationModal
        isOpen={!!liabilityToDelete}
        onClose={() => setLiabilityToDelete(null)}
        onConfirm={() => {
          if (liabilityToDelete) {
            deleteLiability(liabilityToDelete.id);
            setLiabilityToDelete(null);
          }
        }}
        title="Delete Debt / Liability"
        description="Are you sure you want to remove this debt from your liabilities? This will update your total liabilities and debt-to-asset ratio."
        itemType="liability"
        itemName={liabilityToDelete?.name}
        details={liabilityToDelete ? [
          { label: 'Category', value: liabilityToDelete.category },
          { label: 'Principal Balance', value: formatMoney(liabilityToDelete.balance) },
          { label: 'Interest Rate', value: `${liabilityToDelete.interestRate}% APR` },
          { label: 'Institution', value: liabilityToDelete.institution }
        ] : []}
        confirmButtonText="Delete Liability"
      />
    </div>
  );
};
