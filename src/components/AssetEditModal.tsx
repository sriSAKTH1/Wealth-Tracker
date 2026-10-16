import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Tag, 
  Plus, 
  Building2, 
  DollarSign, 
  Calendar, 
  Coins, 
  Layers, 
  Info,
  Sparkles,
  Percent
} from 'lucide-react';
import { Asset, AssetCategory, CurrencyCode, DEFAULT_ASSET_TAGS } from '../types';
import { useFinance, CURRENCY_CONFIGS } from '../context/FinanceContext';
import { ASSET_TAXONOMY } from '../data/assetTaxonomy';

interface AssetEditModalProps {
  isOpen: boolean;
  asset: Asset | null;
  onClose: () => void;
  onSave: (assetId: string, updates: Partial<Asset>) => void;
  onDelete?: (id: string) => void;
}

export const AssetEditModal: React.FC<AssetEditModalProps> = ({
  isOpen,
  asset,
  onClose,
  onSave
}) => {
  const { currency, formatMoney } = useFinance();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<AssetCategory>('Equity');
  const [subType, setSubType] = useState('');
  const [institution, setInstitution] = useState('');
  const [value, setValue] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [isLiquid, setIsLiquid] = useState(true);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [purpose, setPurpose] = useState('');

  // Market specific fields
  const [shares, setShares] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState('');
  const [ticker, setTicker] = useState('');
  const [exchange, setExchange] = useState('');
  const [isin, setIsin] = useState('');
  const [geography, setGeography] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  useEffect(() => {
    if (asset) {
      setName(asset.name || '');
      setCategory(asset.category || 'Equity');
      setSubType(asset.subType || '');
      setInstitution(asset.institution || '');
      setValue(asset.value !== undefined ? asset.value.toString() : '0');
      setCostBasis(asset.costBasis !== undefined ? asset.costBasis.toString() : '');
      setIsLiquid(asset.isLiquid ?? true);
      setNotes(asset.notes || '');
      setTags(asset.tags && Array.isArray(asset.tags) ? [...asset.tags] : (asset.purpose ? [asset.purpose] : []));
      setPurpose(asset.purpose || (asset.tags?.[0] || ''));
      setShares(asset.shares !== undefined ? asset.shares.toString() : '');
      setBuyPrice(asset.buyPrice !== undefined ? asset.buyPrice.toString() : '');
      setBuyDate(asset.buyDate || '');
      setTicker(asset.ticker || (asset.schemeCode ? String(asset.schemeCode) : ''));
      setExchange(asset.exchange || '');
      setIsin(asset.isin || '');
      setGeography(asset.geography || (asset.currency === 'INR' ? 'INDIA' : 'USA'));
      setCurrentPrice(asset.currentPrice !== undefined ? asset.currentPrice.toString() : '');
      setCustomTagInput('');
    }
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  const currentSymbol = CURRENCY_CONFIGS[asset.currency || currency]?.symbol || '₹';

  const toggleTag = (tagName: string) => {
    setTags(prev => {
      const exists = prev.includes(tagName);
      const updated = exists ? prev.filter(t => t !== tagName) : [...prev, tagName];
      if (!purpose && updated.length > 0) {
        setPurpose(updated[0]);
      } else if (exists && purpose === tagName) {
        setPurpose(updated[0] || '');
      }
      return updated;
    });
  };

  const addCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const updated = [...tags, trimmed];
      setTags(updated);
      if (!purpose) setPurpose(trimmed);
      setCustomTagInput('');
    }
  };

  const handleSharesOrPriceChange = (newShares: string, newBuyPrice: string) => {
    setShares(newShares);
    setBuyPrice(newBuyPrice);
    const s = parseFloat(newShares);
    const p = parseFloat(newBuyPrice);
    if (!isNaN(s) && !isNaN(p) && s > 0 && p > 0) {
      if (asset.currentPrice) {
        setValue((s * asset.currentPrice).toFixed(2));
      }
      setCostBasis((s * p).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(value) || 0;
    const costNum = costBasis ? parseFloat(costBasis) : undefined;
    const sharesNum = shares ? parseFloat(shares) : undefined;
    const buyPriceNum = buyPrice ? parseFloat(buyPrice) : undefined;

    const updates: Partial<Asset> = {
      name: name.trim() || asset.name,
      category,
      subType: subType.trim() || undefined,
      institution: institution.trim() || undefined,
      value: valNum,
      costBasis: costNum,
      isLiquid,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      purpose: purpose || (tags[0] || undefined),
      shares: sharesNum,
      buyPrice: buyPriceNum,
      buyDate: buyDate || undefined,
      ticker: ticker.trim() || undefined,
      schemeCode: ticker.trim() || undefined,
      exchange: exchange.trim() || undefined,
      isin: isin.trim() || undefined,
      geography: geography.trim() || undefined,
      currentPrice: currentPrice ? parseFloat(currentPrice) : undefined,
    };

    onSave(asset.id, updates);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Edit Asset & Tags</h2>
              <p className="text-xs text-zinc-400">Organize purpose, tags, and holding properties</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Asset Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Asset Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Asset Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as AssetCategory)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                {ASSET_TAXONOMY.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Value & Cost Basis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Current Valuation ({currentSymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Cost Basis / Invested Capital ({currentSymbol})
              </label>
              <input
                type="number"
                step="0.01"
                value={costBasis}
                onChange={e => setCostBasis(e.target.value)}
                placeholder="Optional"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 font-mono text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Tags & Purpose Categorization (KEY FOCUS) */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 font-bold text-zinc-200">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>Custom Tags & Investment Purpose</span>
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">
                {tags.length} active {tags.length === 1 ? 'tag' : 'tags'}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Select or create tags (e.g. <strong>Retirement</strong>, <strong>Trading</strong>, <strong>Long-term Savings</strong>) to organize your balance sheet and track allocations.
            </p>

            {/* Popular Suggested Tag Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {DEFAULT_ASSET_TAGS.map(t => {
                const isSelected = tags.includes(t.name);
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => toggleTag(t.name)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? `${t.badgeClass} ring-1 ring-emerald-400/40 shadow-xs font-semibold`
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                placeholder="Add custom tag (e.g., House 2027, Kids Education, Speculative)..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={!customTagInput.trim()}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-semibold cursor-pointer transition-colors"
              >
                + Add Tag
              </button>
            </div>

            {/* Active Tags Badge Cloud with Removals */}
            {tags.length > 0 && (
              <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 flex-wrap">
                <span className="text-zinc-500 font-medium mr-1">Assigned:</span>
                {tags.map(t => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1.5 text-[11px]"
                  >
                    <span>🏷️ {t}</span>
                    <button
                      type="button"
                      onClick={() => toggleTag(t)}
                      className="hover:text-rose-400 transition-colors cursor-pointer"
                      title={`Remove tag "${t}"`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Broker / Institution & Subtype */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Broker / Custodian / Bank
              </label>
              <input
                type="text"
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="e.g. Zerodha, Vanguard, Chase, Ledger Vault"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1.5">
                Instrument Sub-Type / Label
              </label>
              <input
                type="text"
                value={subType}
                onChange={e => setSubType(e.target.value)}
                placeholder="e.g. ETF, Index Fund, Direct Stock, High-Yield Savings"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Market Holding Details (if shares or price present) */}
          {(asset.shares !== undefined || asset.buyPrice !== undefined || asset.ticker) && (
            <div className="p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800 space-y-3">
              <span className="font-bold text-zinc-300 block">
                Security Units & Purchase Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Quantity / Units</label>
                  <input
                    type="number"
                    step="0.001"
                    value={shares}
                    onChange={e => handleSharesOrPriceChange(e.target.value, buyPrice)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Buy Price ({currentSymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    value={buyPrice}
                    onChange={e => handleSharesOrPriceChange(shares, e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={buyDate}
                    onChange={e => setBuyDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 text-xs"
                  />
                </div>
              </div>

              {/* Ticker, Exchange, ISIN, Geography & Current NAV */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-850">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Ticker / Scheme Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 118668, RELIANCE, AAPL"
                    value={ticker}
                    onChange={e => setTicker(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Exchange / Market</label>
                  <input
                    type="text"
                    placeholder="e.g. MF, NSE, BSE, NASDAQ"
                    value={exchange}
                    onChange={e => setExchange(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Geography</label>
                  <select
                    value={geography}
                    onChange={e => setGeography(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 text-xs"
                  >
                    <option value="INDIA">INDIA</option>
                    <option value="USA">USA</option>
                    <option value="GLOBAL">GLOBAL</option>
                    <option value="EUROPE">EUROPE</option>
                    <option value="UK">UK</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">ISIN Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. INF204K01UX7, INE002A01018"
                    value={isin}
                    onChange={e => setIsin(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">Current NAV / Market Price ({currentSymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 7302.38"
                    value={currentPrice}
                    onChange={e => {
                      setCurrentPrice(e.target.value);
                      const cp = parseFloat(e.target.value);
                      const s = parseFloat(shares);
                      if (!isNaN(cp) && !isNaN(s) && cp > 0 && s > 0) {
                        setValue((s * cp).toFixed(2));
                      }
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 font-mono text-zinc-100 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Liquidity Toggle */}
          <label className="flex items-start gap-2.5 cursor-pointer p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <input
              type="checkbox"
              checked={isLiquid}
              onChange={e => setIsLiquid(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500"
            />
            <div>
              <span className="font-semibold text-zinc-200 block">
                Liquid Capital
              </span>
              <span className="text-[11px] text-zinc-400">
                Can be converted to cash within 7 days (stocks, crypto, mutual funds, bank balances).
              </span>
            </div>
          </label>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-zinc-300 mb-1.5">
              Investment Notes / Goal Strategy
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Hold until retirement at age 60; SIP ₹10,000 every month..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
