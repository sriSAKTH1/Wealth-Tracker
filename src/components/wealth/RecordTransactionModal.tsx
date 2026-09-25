import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  FileText, 
  Check, 
  ArrowUpRight, 
  ArrowDownRight,
  Gift
} from 'lucide-react';
import { Asset, AssetRecord, AssetRecordType, AssetLot } from '../../types';
import { useFinance } from '../../context/FinanceContext';

interface RecordTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onSaveRecord: (updatedAsset: Asset, newRecord: AssetRecord) => void;
}

export const RecordTransactionModal: React.FC<RecordTransactionModalProps> = ({
  isOpen,
  onClose,
  asset,
  onSaveRecord,
}) => {
  const { addTransaction } = useFinance();
  const [activeTab, setActiveTab] = useState<AssetRecordType>('BUY');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [shares, setShares] = useState<string>('');
  const [price, setPrice] = useState<string>(
    asset.currentPrice ? String(asset.currentPrice) : asset.buyPrice ? String(asset.buyPrice) : ''
  );
  const [fees, setFees] = useState<string>('0');
  const [dividendAmount, setDividendAmount] = useState<string>('');
  const [isReinvested, setIsReinvested] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const currSym = asset.currency === 'INR' ? '₹' : asset.currency === 'EUR' ? '€' : asset.currency === 'GBP' ? '£' : '$';
  const numShares = parseFloat(shares) || 0;
  const numPrice = parseFloat(price) || 0;
  const numFees = parseFloat(fees) || 0;
  const numDividend = parseFloat(dividendAmount) || 0;

  // Calculated totals
  const totalBuyCost = (numShares * numPrice) + numFees;
  const totalSellProceeds = Math.max(0, (numShares * numPrice) - numFees);
  const avgCostBasisPerShare = (asset.shares && asset.shares > 0 && asset.costBasis) 
    ? (asset.costBasis / asset.shares) 
    : (asset.buyPrice || 0);
  const estimatedRealizedGain = activeTab === 'SELL' 
    ? (numShares * numPrice) - (numShares * avgCostBasisPerShare) - numFees 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (activeTab === 'BUY') {
      if (numShares <= 0) {
        setError('Please enter a valid quantity of shares/units greater than 0.');
        return;
      }
      if (numPrice <= 0) {
        setError('Please enter a valid purchase price per share/unit.');
        return;
      }

      const newRecord: AssetRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        assetId: asset.id,
        type: 'BUY',
        date,
        shares: numShares,
        price: numPrice,
        amount: totalBuyCost,
        fees: numFees,
        notes: notes.trim() || 'Additional purchase / SIP tranche',
      };

      const currentShares = Number(asset.shares) || 0;
      const currentCost = Number(asset.costBasis) || 0;
      const updatedTotalShares = Number((currentShares + numShares).toFixed(4));
      const updatedCostBasis = Math.round(currentCost + totalBuyCost);
      const effectiveLatestPrice = asset.currentPrice || numPrice;
      const updatedValue = Math.round(updatedTotalShares * effectiveLatestPrice);
      const updatedAvgBuyPrice = updatedTotalShares > 0 ? Number((updatedCostBasis / updatedTotalShares).toFixed(2)) : numPrice;

      const newLot: AssetLot = {
        id: `lot-${Date.now()}`,
        name: `${asset.name} - Purchase Lot`,
        date,
        shares: numShares,
        buyPrice: numPrice,
        costBasis: Math.round(numShares * numPrice),
        currentPrice: effectiveLatestPrice,
        currentValue: Math.round(numShares * effectiveLatestPrice),
        unrealizedGain: Math.round((numShares * effectiveLatestPrice) - (numShares * numPrice)),
        unrealizedGainPercent: Number((((effectiveLatestPrice - numPrice) / numPrice) * 100).toFixed(2)),
        notes: notes.trim(),
      };

      const updatedLots = [...(asset.lots || []), newLot];
      const updatedRecords = [newRecord, ...(asset.records || [])];

      const updatedAsset: Asset = {
        ...asset,
        shares: updatedTotalShares,
        costBasis: updatedCostBasis,
        buyPrice: updatedAvgBuyPrice,
        value: updatedValue,
        lots: updatedLots,
        records: updatedRecords,
        lastUpdated: date,
      };

      try {
        addTransaction({
          description: `Buy ${numShares} units: ${asset.name}`,
          amount: totalBuyCost,
          currency: asset.currency,
          type: 'expense',
          category: 'Investments',
          accountId: asset.institution || 'acc-brokerage',
          accountName: asset.institution || 'Investment Portfolio',
          date,
          notes: notes.trim() || undefined,
        });
      } catch (err) {
        console.warn('Could not add cashflow record:', err);
      }

      onSaveRecord(updatedAsset, newRecord);
      onClose();
    } else if (activeTab === 'SELL') {
      const currentShares = Number(asset.shares) || 0;
      if (numShares <= 0) {
        setError('Please enter the number of shares/units to sell.');
        return;
      }
      if (numShares > currentShares) {
        setError(`Cannot sell ${numShares} units. Maximum holdings available: ${currentShares} units.`);
        return;
      }
      if (numPrice <= 0) {
        setError('Please enter a valid selling price per share/unit.');
        return;
      }

      const newRecord: AssetRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        assetId: asset.id,
        type: 'SELL',
        date,
        shares: numShares,
        price: numPrice,
        amount: totalSellProceeds,
        fees: numFees,
        realizedGain: Math.round(estimatedRealizedGain),
        notes: notes.trim() || 'Holding sale / redemption',
      };

      const remainingShares = Math.max(0, Number((currentShares - numShares).toFixed(4)));
      const fractionRemaining = currentShares > 0 ? (remainingShares / currentShares) : 0;
      const updatedCostBasis = Math.round((Number(asset.costBasis) || 0) * fractionRemaining);
      const effectiveLatestPrice = asset.currentPrice || numPrice;
      const updatedValue = Math.round(remainingShares * effectiveLatestPrice);

      const updatedRecords = [newRecord, ...(asset.records || [])];

      const updatedAsset: Asset = {
        ...asset,
        shares: remainingShares,
        costBasis: updatedCostBasis,
        value: updatedValue,
        records: updatedRecords,
        lastUpdated: date,
      };

      try {
        addTransaction({
          description: `Sale ${numShares} units: ${asset.name}`,
          amount: totalSellProceeds,
          currency: asset.currency,
          type: 'income',
          category: 'Investments & Dividends',
          accountId: asset.institution || 'acc-brokerage',
          accountName: asset.institution || 'Investment Portfolio',
          date,
          notes: notes.trim() || undefined,
        });
      } catch (err) {
        console.warn('Could not add cashflow record:', err);
      }

      onSaveRecord(updatedAsset, newRecord);
      onClose();
    } else if (activeTab === 'DIVIDEND') {
      if (numDividend <= 0) {
        setError('Please enter a valid dividend or distribution payout amount.');
        return;
      }

      const newRecord: AssetRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        assetId: asset.id,
        type: 'DIVIDEND',
        date,
        amount: numDividend,
        reinvested: isReinvested,
        notes: notes.trim() || (isReinvested ? 'Dividend Reinvested' : 'Cash Dividend Payout'),
      };

      let updatedShares = Number(asset.shares) || 0;
      let updatedValue = Number(asset.value) || 0;
      let updatedCostBasis = Number(asset.costBasis) || 0;

      if (isReinvested && asset.currentPrice && asset.currentPrice > 0) {
        const reinvestedUnits = Number((numDividend / asset.currentPrice).toFixed(4));
        updatedShares = Number((updatedShares + reinvestedUnits).toFixed(4));
        updatedValue = Math.round(updatedShares * asset.currentPrice);
        updatedCostBasis = Math.round(updatedCostBasis + numDividend);
      }

      const updatedRecords = [newRecord, ...(asset.records || [])];

      const updatedAsset: Asset = {
        ...asset,
        shares: updatedShares,
        value: updatedValue,
        costBasis: updatedCostBasis,
        records: updatedRecords,
        lastUpdated: date,
      };

      try {
        addTransaction({
          description: `Dividend: ${asset.name}`,
          amount: numDividend,
          currency: asset.currency,
          type: 'income',
          category: 'Investments & Dividends',
          accountId: asset.institution || 'acc-bank',
          accountName: asset.institution || 'Investment Portfolio',
          date,
          notes: notes.trim() || (isReinvested ? 'Dividend Reinvested in units' : 'Cash Payout'),
        });
      } catch (err) {
        console.warn('Could not add cashflow record:', err);
      }

      onSaveRecord(updatedAsset, newRecord);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-zinc-100 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              <span>Record Transaction</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-sm">
              {asset.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 pb-2 bg-zinc-950/40 border-b border-zinc-800/80">
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setActiveTab('BUY'); setError(''); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>Buy / Add</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('SELL'); setError(''); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'SELL'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Sell</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('DIVIDEND'); setError(''); }}
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'DIVIDEND'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Dividend</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>Transaction Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {activeTab !== 'DIVIDEND' ? (
            <>
              {/* Shares & Price Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {activeTab === 'BUY' ? 'Quantity to Add' : 'Quantity to Sell'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 10.5"
                    value={shares}
                    onChange={e => setShares(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  {activeTab === 'SELL' && (
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Max holding: {asset.shares || 0} {asset.assetType === 'mutual_fund' ? 'units' : 'shares'}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    {activeTab === 'BUY' ? 'Purchase Price / NAV' : 'Sale Price / NAV'} ({currSym})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 150.00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  {asset.currentPrice ? (
                    <span className="text-[10px] text-emerald-400 mt-1 block font-mono">
                      Live NAV: {currSym}{asset.currentPrice.toLocaleString()}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Brokerage / Taxes */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Brokerage, STT & Fees ({currSym})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={fees}
                  onChange={e => setFees(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Gross Valuation:</span>
                  <span>{currSym}{(numShares * numPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between font-bold text-white pt-1 border-t border-zinc-800">
                  <span>{activeTab === 'BUY' ? 'Total Net Outflow:' : 'Total Net Proceeds:'}</span>
                  <span className={activeTab === 'BUY' ? 'text-emerald-400' : 'text-blue-400'}>
                    {currSym}{(activeTab === 'BUY' ? totalBuyCost : totalSellProceeds).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                {activeTab === 'SELL' && (
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-900 text-[11px]">
                    <span className="text-zinc-400">Est. Realized P&L:</span>
                    <span className={estimatedRealizedGain >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {estimatedRealizedGain >= 0 ? `+${currSym}` : `-${currSym}`}{Math.abs(estimatedRealizedGain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Dividend Form */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Dividend / Distribution Amount ({currSym})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 500"
                  value={dividendAmount}
                  onChange={e => setDividendAmount(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-950/70 border border-zinc-800">
                <input
                  type="checkbox"
                  id="reinvest-check"
                  checked={isReinvested}
                  onChange={e => setIsReinvested(e.target.checked)}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="reinvest-check" className="text-xs text-zinc-300 cursor-pointer">
                  <strong>Reinvest dividend</strong> (Automatically purchase additional fractional units)
                </label>
              </div>

              {isReinvested && asset.currentPrice ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono">
                  Additional units to be allocated: +{numDividend > 0 ? (numDividend / asset.currentPrice).toFixed(4) : '0.0000'} units @ {currSym}{asset.currentPrice} NAV
                </div>
              ) : null}
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Notes / Order Reference (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Zerodha order #91823, Monthly SIP, Dividend payout"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : activeTab === 'SELL'
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {activeTab === 'BUY' ? 'Record Buy Order' : activeTab === 'SELL' ? 'Record Sale' : 'Record Dividend'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
