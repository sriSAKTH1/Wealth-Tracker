import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Tag, 
  DollarSign, 
  Building2, 
  ExternalLink,
  Layers,
  History as HistoryIcon,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Asset, AssetLot, AssetRecord } from '../../types';
import { useFinance } from '../../context/FinanceContext';
import { RecordTransactionModal } from './RecordTransactionModal';
import { AssetEditModal } from '../AssetEditModal';
import { ConfirmationModal } from '../ConfirmationModal';

interface AssetDetailViewProps {
  asset: Asset;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateAsset?: (assetId: string, updates: Partial<Asset>) => void;
  isPrivateMode?: boolean;
}

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  asset,
  onBack,
  onEdit,
  onDelete,
  onUpdateAsset,
  isPrivateMode = false,
}) => {
  const { updateAsset, deleteAsset, formatMoney } = useFinance();
  const [activeTab, setActiveTab] = useState<'lots' | 'history'>('lots');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'BUY' | 'SELL' | 'DIVIDEND'>('all');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);

  // Currency config
  const currSym = asset.currency === 'INR' ? '₹' : asset.currency === 'EUR' ? '€' : asset.currency === 'GBP' ? '£' : '$';

  // Formatters
  const formatVal = (val: number | undefined | null, compact = false) => {
    if (isPrivateMode) return '••••••';
    const num = Number(val) || 0;
    if (compact) {
      if (Math.abs(num) >= 10000000) return `${currSym}${(num / 10000000).toFixed(2)}Cr`;
      if (Math.abs(num) >= 100000) return `${currSym}${(num / 100000).toFixed(2)}L`;
      if (Math.abs(num) >= 1000) return `${currSym}${(num / 1000).toFixed(1)}K`;
      return `${currSym}${num.toFixed(0)}`;
    }
    return asset.currency === 'INR' 
      ? `${currSym}${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` 
      : `${currSym}${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  const formatQuantity = (qty: number | undefined | null) => {
    if (qty === undefined || qty === null) return '0';
    const num = Number(qty) || 0;
    // If it has decimals, format with up to 4 decimals, else integer
    return num % 1 === 0 ? num.toString() : num.toFixed(4);
  };

  // Derive Lots if not present
  const lots: AssetLot[] = React.useMemo(() => {
    if (asset.lots && asset.lots.length > 0) {
      return asset.lots;
    }
    // Fallback single lot from main asset data
    if (asset.shares && asset.shares > 0) {
      const buyPrice = asset.buyPrice || 0;
      const currentPrice = asset.currentPrice || buyPrice;
      const costBasis = asset.costBasis || (asset.shares * buyPrice);
      const currentValue = asset.value || (asset.shares * currentPrice);
      const unrealizedGain = currentValue - costBasis;
      const unrealizedGainPercent = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;

      return [
        {
          id: 'lot-primary',
          name: asset.name,
          date: asset.buyDate || asset.lastUpdated || '2024-01-01',
          shares: asset.shares,
          buyPrice,
          costBasis,
          currentPrice,
          currentValue,
          unrealizedGain,
          unrealizedGainPercent,
        }
      ];
    }
    return [];
  }, [asset]);

  // Derive Records if not present
  const records: AssetRecord[] = React.useMemo(() => {
    if (asset.records && asset.records.length > 0) {
      return asset.records;
    }
    // Fallback record from initial purchase
    if (asset.shares && asset.shares > 0) {
      return [
        {
          id: 'rec-initial',
          assetId: asset.id,
          type: 'BUY',
          date: asset.buyDate || asset.lastUpdated || '2024-01-01',
          shares: asset.shares,
          price: asset.buyPrice || (asset.costBasis ? asset.costBasis / asset.shares : 0),
          amount: asset.costBasis || (asset.shares * (asset.buyPrice || 0)),
          notes: 'Initial holding entry',
        }
      ];
    }
    return [];
  }, [asset]);

  // Calculations
  const totalCostBasis = Number(asset.costBasis) || 0;
  const currentValuation = Number(asset.value) || 0;
  const totalUnrealizedGain = currentValuation - totalCostBasis;
  const totalUnrealizedPercent = totalCostBasis > 0 ? (totalUnrealizedGain / totalCostBasis) * 100 : 0;
  const isGainPositive = totalUnrealizedGain >= 0;

  // Filtered Records
  const filteredRecords = records.filter(r => {
    if (historyFilter === 'all') return true;
    return r.type === historyFilter;
  });

  // Total Dividends
  const totalDividends = records
    .filter(r => r.type === 'DIVIDEND')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Total Sells
  const totalSells = records
    .filter(r => r.type === 'SELL')
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  const handleSaveRecord = (updatedAsset: Asset, newRecord: AssetRecord) => {
    updateAsset(updatedAsset.id, updatedAsset);
    if (onUpdateAsset) {
      onUpdateAsset(updatedAsset.id, updatedAsset);
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = (assetId: string, updates: Partial<Asset>) => {
    updateAsset(assetId, updates);
    if (onUpdateAsset) {
      onUpdateAsset(assetId, updates);
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    deleteAsset(asset.id);
    if (onDelete) {
      onDelete();
    }
    setIsDeleteModalOpen(false);
    onBack();
  };

  const handleDeleteRecord = (recordId: string) => {
    const updatedRecords = records.filter(r => r.id !== recordId);
    updateAsset(asset.id, { records: updatedRecords });
    if (onUpdateAsset) {
      onUpdateAsset(asset.id, { records: updatedRecords });
    }
  };

  // Google Finance URL helper
  const getGoogleFinanceUrl = () => {
    if (asset.ticker) {
      const ex = asset.exchange ? `${asset.exchange}:` : '';
      return `https://www.google.com/finance/quote/${ex}${asset.ticker}`;
    }
    return `https://www.google.com/finance/quote/${encodeURIComponent(asset.name)}`;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-150">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-50 tracking-tight leading-snug">
            {asset.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
            {asset.subType || (asset.assetType === 'mutual_fund' ? 'Equity Mutual Fund' : asset.category)}
            {asset.fundHouse ? ` • ${asset.fundHouse}` : asset.institution ? ` • ${asset.institution}` : ''}
          </p>
        </div>

        {/* Action Buttons Matching Screenshot */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Record</span>
          </button>

          <button
            onClick={handleEditClick}
            className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={handleDeleteClick}
            className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 2. HERO VALUATION & PERFORMANCE CARD */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        {/* Subtle accent glow */}
        <div 
          className="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: asset.color || '#10b981' }}
        />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative z-10">
          <div>
            {/* Pill Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                {asset.category === 'Equity' ? 'Equity' : asset.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                {lots.length} {lots.length === 1 ? 'lot' : 'lots'}
              </span>
              {asset.exchange && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                  {asset.exchange}
                </span>
              )}
              {asset.ticker && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                  {asset.ticker}
                </span>
              )}
            </div>

            {/* Current Valuation */}
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-zinc-50 tracking-tight font-sans">
              {formatVal(currentValuation)}
            </div>

            {/* Gain / Loss Trend */}
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-sm font-bold font-mono ${
                isGainPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {isGainPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>
                  {isGainPositive ? '+' : '-'}{currSym}{Math.abs(totalUnrealizedGain).toLocaleString('en-US', { maximumFractionDigits: 2 })} ({isGainPositive ? '+' : ''}{(totalUnrealizedPercent || 0).toFixed(1)}%)
                </span>
              </span>
              {asset.priceChange24h !== undefined && asset.priceChange24h !== 0 && (
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">
                  • 24h: {asset.priceChange24h >= 0 ? '+' : ''}{asset.priceChange24h}%
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Invested Cost Basis & Live NAV */}
          <div className="text-left sm:text-right font-mono flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold block">
                INVESTED
              </span>
              <div className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                {formatVal(totalCostBasis, true)}
              </div>
            </div>

            {asset.currentPrice !== undefined && asset.currentPrice !== null && (
              <div className="mt-3 text-xs text-slate-500 dark:text-zinc-400">
                <span>{asset.assetType === 'mutual_fund' || asset.exchange === 'MF' ? 'NAV: ' : 'Market Price: '}</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {formatVal(asset.currentPrice)}
                </strong>
                {asset.navDate && (
                  <span className="block text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                    Updated: {asset.navDate}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. DETAILS CARD */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
          DETAILS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-1">
          {/* PRODUCT TYPE */}
          <div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-medium block">
              PRODUCT TYPE
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 mt-1 block">
              {asset.subType || (asset.assetType === 'mutual_fund' ? 'Equity Mutual Fund' : asset.category === 'Equity' ? 'Direct Stock' : asset.category)}
            </span>
          </div>

          {/* INSTRUMENT CODE */}
          <div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-medium block">
              INSTRUMENT CODE
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 font-mono mt-1 block">
              {asset.schemeCode || asset.ticker || asset.isin || 'N/A'}
            </span>
          </div>

          {/* CURRENCY */}
          <div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-medium block">
              CURRENCY
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 font-mono mt-1 block">
              {asset.currency || 'INR'}
            </span>
          </div>

          {/* QUANTITY */}
          <div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-medium block">
              QUANTITY
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono mt-1 block">
              {formatQuantity(asset.shares)}
            </span>
          </div>

          {/* PURCHASE PRICE */}
          <div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-medium block">
              PURCHASE PRICE
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-zinc-100 font-mono mt-1 block">
              {formatVal(asset.buyPrice || (asset.shares && asset.shares > 0 ? (totalCostBasis / asset.shares) : 0), true)}
            </span>
          </div>

          {/* GEOGRAPHY */}
          <div>
            <span className="text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-medium block">
              GEOGRAPHY
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 uppercase mt-1 block">
              {asset.geography || (asset.currency === 'INR' || asset.exchange === 'NSE' || asset.exchange === 'BSE' || asset.exchange === 'MF' ? 'INDIA' : 'USA')}
            </span>
          </div>
        </div>

        {/* Secondary Metadata Row */}
        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-zinc-400 gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            {asset.isin && (
              <span>ISIN: <strong className="text-slate-700 dark:text-zinc-300 font-mono">{asset.isin}</strong></span>
            )}
            {asset.institution && (
              <span>Broker / Depository: <strong className="text-slate-700 dark:text-zinc-300">{asset.institution}</strong></span>
            )}
            {totalDividends > 0 && (
              <span className="text-amber-500 font-semibold">
                • Total Dividends: {formatVal(totalDividends)}
              </span>
            )}
          </div>

          <a
            href={getGoogleFinanceUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 flex items-center gap-1 hover:underline text-xs font-medium cursor-pointer"
          >
            <span>Live Quote on Google Finance</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 4. LOTS & ACTIVITY HISTORY CARD */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3 bg-slate-50/50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('lots')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'lots'
                  ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>LOTS ({lots.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>TRANSACTIONS & ACTIVITY ({records.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Transaction</span>
          </button>
        </div>

        {/* TAB 1: LOTS BREAKDOWN (MATCHES SCREENSHOT) */}
        {activeTab === 'lots' && (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {lots.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-500">
                No lots recorded yet. Click &quot;Record&quot; to log your purchases.
              </div>
            ) : (
              lots.map((lot, idx) => {
                const isViewing = idx === 0 || selectedLotId === lot.id;
                const lotVal = lot.currentValue || (lot.shares * (asset.currentPrice || lot.buyPrice));
                const lotCost = lot.costBasis || (lot.shares * lot.buyPrice);
                const lotGain = lotVal - lotCost;
                const lotGainPct = lotCost > 0 ? (lotGain / lotCost) * 100 : 0;
                const isPositive = lotGain >= 0;

                return (
                  <div 
                    key={lot.id || idx}
                    onClick={() => setSelectedLotId(lot.id)}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-zinc-850/40 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                          {lot.name || asset.name}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-zinc-500">•</span>
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                          {formatQuantity(lot.shares)}
                        </span>
                        {isViewing && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            Viewing
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-zinc-500 font-mono">
                        {lot.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {lot.date}
                          </span>
                        )}
                        <span>Cost: {formatVal(lotCost, true)}</span>
                        {lot.buyPrice ? (
                          <span>@ {formatVal(lot.buyPrice)}</span>
                        ) : null}
                      </div>
                    </div>

                    {/* Valuation & Lot Return */}
                    <div className="text-left sm:text-right font-mono">
                      <div className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {formatVal(lotVal, true)}
                      </div>
                      <div className={`text-xs font-bold ${
                        isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isPositive ? '+' : '-'}{currSym}{Math.abs(lotGain).toLocaleString('en-US', { maximumFractionDigits: 0 })} ({isPositive ? '+' : ''}{(lotGainPct || 0).toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: FULL TRANSACTION ACTIVITY (BUY, SELL, DIVIDEND) */}
        {activeTab === 'history' && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'BUY', 'SELL', 'DIVIDEND'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setHistoryFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    historyFilter === tab
                      ? 'bg-slate-900 text-white dark:bg-zinc-800 dark:text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-zinc-950/60 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab === 'all' ? 'All Transactions' : tab === 'BUY' ? '🟢 Buys / Adds' : tab === 'SELL' ? '🔴 Sells' : '🟡 Dividends'}
                </button>
              ))}
            </div>

            {/* Transactions List */}
            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-zinc-950/40 border border-dashed border-slate-200 dark:border-zinc-800 space-y-2">
                <HistoryIcon className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  No {historyFilter === 'all' ? '' : historyFilter.toLowerCase()} transactions logged yet.
                </p>
                <button
                  onClick={() => setIsRecordModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Record Action Now
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950/40">
                {filteredRecords.map(rec => {
                  const isBuy = rec.type === 'BUY';
                  const isSell = rec.type === 'SELL';
                  const isDividend = rec.type === 'DIVIDEND';

                  return (
                    <div 
                      key={rec.id}
                      className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-zinc-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isBuy 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : isSell
                            ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          {isBuy ? <ArrowDownRight className="w-4 h-4" /> : isSell ? <ArrowUpRight className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isBuy 
                                ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                                : isSell
                                ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                                : 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30'
                            }`}>
                              {isBuy ? 'BUY' : isSell ? 'SELL' : 'DIVIDEND'}
                            </span>
                            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 font-mono">
                              {rec.date}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            {rec.notes ? (
                              <span>{rec.notes}</span>
                            ) : isDividend ? (
                              <span>{rec.reinvested ? 'Reinvested in Units' : 'Cash Payout'}</span>
                            ) : null}
                            {rec.shares ? (
                              <span className="font-mono ml-1">
                                • {formatQuantity(rec.shares)} {asset.assetType === 'mutual_fund' ? 'units' : 'shares'}
                                {rec.price ? ` @ ${formatVal(rec.price)}` : ''}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Right side amounts and delete record */}
                      <div className="flex items-center gap-3 self-end sm:self-center font-mono">
                        <div className="text-right">
                          <span className={`text-sm font-bold block ${
                            isBuy 
                              ? 'text-slate-900 dark:text-zinc-100'
                              : isSell 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {isBuy ? '-' : '+'}{formatVal(rec.amount)}
                          </span>
                          {rec.realizedGain !== undefined && (
                            <span className={`text-[10px] font-bold ${
                              rec.realizedGain >= 0 ? 'text-emerald-500' : 'text-rose-500'
                            }`}>
                              P&L: {rec.realizedGain >= 0 ? '+' : ''}{formatVal(rec.realizedGain)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                          title="Delete transaction record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Record Transaction Modal */}
      {isRecordModalOpen && (
        <RecordTransactionModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          asset={asset}
          onSaveRecord={handleSaveRecord}
        />
      )}

      {/* Edit Holding Details Modal */}
      {isEditModalOpen && (
        <AssetEditModal
          isOpen={isEditModalOpen}
          asset={asset}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(assetId, updates) => handleSaveEdit(assetId, updates)}
          onDelete={id => {
            deleteAsset(id);
            setIsEditModalOpen(false);
            onBack();
          }}
        />
      )}

      {/* Delete Holding Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Asset"
          description="Are you sure you want to delete this asset holding? This action cannot be undone and will update your portfolio totals."
          itemType="asset"
          itemName={asset.name}
          details={[
            { label: 'Category', value: asset.category },
            { label: 'Product Type', value: asset.subType || (asset.assetType === 'mutual_fund' ? 'Equity Mutual Fund' : asset.category) },
            { label: 'Current Valuation', value: formatVal(asset.value) },
            { label: 'Invested Basis', value: formatVal(asset.costBasis, true) },
            { label: 'Total Lots', value: `${lots.length} lot${lots.length === 1 ? '' : 's'}` },
          ]}
          confirmButtonText="Delete Asset"
        />
      )}
    </div>
  );
};
