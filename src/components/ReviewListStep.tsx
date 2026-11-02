import React, { useState, useEffect } from 'react';
import { PartyConfig, ShoppingItem, BrandTier } from '../types.ts';
import { formatCurrency } from '../utils/partyCalculators.ts';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Store,
  Sliders,
  AlertTriangle,
  Tag,
  ShieldCheck,
  Percent,
  Edit2,
  RefreshCw,
  X,
  CheckCircle2,
} from 'lucide-react';

interface ReviewListStepProps {
  party: PartyConfig;
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onSetQuantity: (id: string, newQty: number) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  onUpdateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onAutoTuneBudget: () => void;
  onQuickTrimBudget: (amount: number) => void;
  onBackToDefine: () => void;
  onProceedToRefine: () => void;
}

export const ReviewListStep: React.FC<ReviewListStepProps> = ({
  party,
  items,
  onToggleItem,
  onUpdateQuantity,
  onSetQuantity,
  onUpdatePrice,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onAutoTuneBudget,
  onQuickTrimBudget,
  onBackToDefine,
  onProceedToRefine,
}) => {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [recalcFlash, setRecalcFlash] = useState(false);

  // New item form state
  const [itemName, setItemName] = useState('');
  const [itemDept, setItemDept] = useState('Produce Island');
  const [itemBrand, setItemBrand] = useState<BrandTier>('Cymbal Fresh');
  const [itemQty, setItemQty] = useState(1);
  const [itemUnit, setItemUnit] = useState('pack');
  const [itemPrice, setItemPrice] = useState(5.99);

  // Auto-calculated budget totals
  const totalCost = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const targetBudget = party.targetBudget;
  const budgetVariance = totalCost - targetBudget;
  const isOverBudget = budgetVariance > 0;
  const budgetRatio = targetBudget > 0 ? (totalCost / targetBudget) * 100 : 0;

  // Flash the recalculation indicator whenever items or totalCost changes
  useEffect(() => {
    setRecalcFlash(true);
    const timer = setTimeout(() => setRecalcFlash(false), 900);
    return () => clearTimeout(timer);
  }, [totalCost, items.length]);

  // Calculate Department Breakdown
  const deptTotals: Record<string, number> = {};
  items.forEach((item) => {
    const dept = item.storeRecommendation || 'General Grocery';
    deptTotals[dept] = (deptTotals[dept] || 0) + item.estimatedPrice;
  });

  const departments = ['all', ...Object.keys(deptTotals)];

  const filteredItems = items.filter((item) => {
    if (selectedDeptFilter === 'all') return true;
    return item.storeRecommendation === selectedDeptFilter;
  });

  const totalGuests = party.adults + party.kids;
  const perGuestActual = totalGuests > 0 ? totalCost / totalGuests : 0;
  const perGuestTarget = totalGuests > 0 ? targetBudget / totalGuests : 0;

  // Count CymbalMart brand items & calculated store savings
  const cymbalBrandItems = items.filter(
    (i) => i.brandTier && i.brandTier.startsWith('Cymbal')
  );
  const estimatedSavings = Math.round(
    cymbalBrandItems.reduce((acc, i) => acc + i.estimatedPrice * 0.35, 0)
  );

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    onAddItem({
      name: itemName.trim(),
      category: 'pantry',
      storeRecommendation: itemDept,
      brandTier: itemBrand,
      quantity: Number(itemQty) || 1,
      unit: itemUnit.trim() || 'pack',
      estimatedPrice: Number(itemPrice) || 0,
      customItem: true,
    });

    setItemName('');
    setItemQty(1);
    setShowAddModal(false);
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    onUpdateItem(editingItem.id, {
      name: editingItem.name,
      quantity: editingItem.quantity,
      unit: editingItem.unit,
      estimatedPrice: editingItem.estimatedPrice,
      brandTier: editingItem.brandTier,
      storeRecommendation: editingItem.storeRecommendation,
      notes: editingItem.notes,
    });

    setEditingItem(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* CUJ Step 2 Header & Live Recalculating Cockpit */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                2
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Review List & Automatic Budget Recalculator
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-2xl">
              Update item quantities, prices, or brands below. All budget totals, per-guest costs, and department allocations <strong>recalculate automatically in real-time</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToDefine}
              className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={onProceedToRefine}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <span>Refine & Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Automatic Recalculation Pulse Badge */}
        <div
          className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all duration-300 ${
            recalcFlash
              ? 'bg-teal-700 text-white shadow-md scale-[1.01]'
              : 'bg-teal-50/80 border border-teal-200 text-teal-950'
          }`}
        >
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${recalcFlash ? 'animate-spin text-white' : 'text-teal-700'}`} />
            <span className="font-bold">
              {recalcFlash ? 'Budget Automatically Recalculated!' : 'Real-time Budget Sync Active'}
            </span>
            <span className="hidden sm:inline text-neutral-500">
              · Changes to quantities or prices instantly update the cart total and budget variance.
            </span>
          </div>

          <span className="font-mono tabular-nums font-bold">
            Total: {formatCurrency(totalCost)}
          </span>
        </div>

        {/* Budget Health Metric Bar */}
        <div className="p-5 rounded-xl border transition-all duration-300 bg-neutral-900 text-white border-neutral-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Primary Recalculated Figures */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-10">
              <div>
                <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                  Target Budget
                </div>
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-white">
                  {formatCurrency(targetBudget)}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
                  ~{formatCurrency(perGuestTarget)} / guest
                </div>
              </div>

              <div className="h-10 w-px bg-neutral-800 hidden sm:block" />

              <div>
                <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <span>Recalculated Cart Total</span>
                  {recalcFlash && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </div>
                <div
                  className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums transition-colors duration-200 ${
                    isOverBudget ? 'text-rose-400' : 'text-teal-400'
                  }`}
                >
                  {formatCurrency(totalCost)}
                </div>
                <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
                  ~{formatCurrency(perGuestActual)} / guest ({items.length} items)
                </div>
              </div>

              <div className="h-10 w-px bg-neutral-800 hidden sm:block" />

              <div>
                <div className="text-xs text-neutral-400 font-medium uppercase tracking-wider">
                  Live Budget Variance
                </div>
                <div
                  className={`text-base sm:text-lg font-bold font-mono tabular-nums flex items-center gap-1.5 ${
                    isOverBudget ? 'text-rose-400' : 'text-teal-400'
                  }`}
                >
                  {isOverBudget ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-rose-400" />
                      <span>+{formatCurrency(budgetVariance)} Over</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-teal-400" />
                      <span>{formatCurrency(Math.abs(budgetVariance))} Under Buffer</span>
                    </>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {budgetRatio.toFixed(1)}% of budget utilized
                </div>
              </div>
            </div>

            {/* Quick Alignment Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={onAutoTuneBudget}
                className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2"
                title="Automatically swap premium brand items with Cymbal Basics to align with budget"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Align to Budget</span>
              </button>

              {isOverBudget && (
                <>
                  <button
                    onClick={() => onQuickTrimBudget(25)}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs rounded-xl border border-neutral-700 transition-colors whitespace-nowrap"
                  >
                    -$25 Trim
                  </button>
                  <button
                    onClick={() => onQuickTrimBudget(50)}
                    className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs rounded-xl border border-neutral-700 transition-colors whitespace-nowrap"
                  >
                    -$50 Trim
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Budget Progress Meter */}
          <div className="mt-5 space-y-1.5">
            <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : budgetRatio > 90
                    ? 'bg-teal-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(8, budgetRatio))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>$0</span>
              <span className="font-semibold text-neutral-300">
                Target: {formatCurrency(targetBudget)}
              </span>
              <span>100% Target</span>
            </div>
          </div>
        </div>

        {/* Department Spend Breakdown Strip (Recalculates Live) */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center justify-between">
            <span>Spend Breakdown by CymbalMart Department (Auto-Recalculating)</span>
            {estimatedSavings > 0 && (
              <span className="text-emerald-700 font-semibold lowercase tracking-normal">
                +{formatCurrency(estimatedSavings)} saved with Cymbal private brands
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            {Object.entries(deptTotals).map(([dept, amt]) => {
              const pct = totalCost > 0 ? Math.round((amt / totalCost) * 100) : 0;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(selectedDeptFilter === dept ? 'all' : dept)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedDeptFilter === dept
                      ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div className="text-[11px] text-neutral-500 truncate font-medium">{dept}</div>
                  <div className="font-mono tabular-nums font-bold text-sm text-neutral-900 mt-0.5">
                    {formatCurrency(amt)}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono tabular-nums mt-0.5">
                    {pct}% of total
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Items Review & Update Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-neutral-700">Filter Department:</span>
            <div className="flex flex-wrap gap-1">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDeptFilter(dept)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedDeptFilter === dept
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {dept === 'all' ? 'All Items' : dept}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Rows with Direct Quantity & Price Editors */}
        <div className="divide-y divide-neutral-100">
          {filteredItems.map((item) => {
            const unitPrice = item.unitPrice || Math.round((item.estimatedPrice / item.quantity) * 100) / 100;

            return (
              <div
                key={item.id}
                className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/70 transition-colors ${
                  item.isPurchased ? 'bg-neutral-50/40 opacity-70' : ''
                }`}
              >
                {/* Left: Checkbox & Product Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleItem(item.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      item.isPurchased
                        ? 'bg-teal-600 border-teal-600 text-white'
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    }`}
                  >
                    {item.isPurchased && <Check className="w-3.5 h-3.5 stroke-3" />}
                  </button>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold text-neutral-900 ${
                          item.isPurchased ? 'line-through text-neutral-400' : ''
                        }`}
                      >
                        {item.name}
                      </span>

                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {item.storeRecommendation}
                      </span>

                      {item.brandTier && (
                        <>
                          <span className="text-xs text-neutral-400">·</span>
                          <span
                            className={`text-xs font-semibold ${
                              item.brandTier === 'Cymbal Basics'
                                ? 'text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded'
                                : item.brandTier === 'Cymbal Fresh'
                                ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded'
                                : item.brandTier === 'Cymbal Select'
                                ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded'
                                : 'text-neutral-500'
                            }`}
                          >
                            {item.brandTier}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-400 flex items-center gap-2">
                      <span className="font-mono tabular-nums">
                        Unit price: {formatCurrency(unitPrice)} / {item.unit}
                      </span>
                      {item.notes && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-sm">{item.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Stepper, Price Editor & Quick Edit Pencil */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {/* Quantity Stepper with Direct Input */}
                  <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 text-xs">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white rounded font-bold transition-colors"
                      title="Decrease quantity"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={item.quantity}
                      onChange={(e) => onSetQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-10 text-center font-mono tabular-nums font-bold text-neutral-900 bg-transparent focus:bg-white focus:outline-none rounded py-0.5 text-xs"
                      title="Directly type quantity"
                    />
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white rounded font-bold transition-colors"
                      title="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs text-neutral-500 font-medium w-12 truncate hidden md:inline">
                    {item.unit}
                  </span>

                  {/* Inline Price Editor with Auto-Recalculate */}
                  <div className="relative flex items-center">
                    <span className="absolute left-2 text-xs font-mono text-neutral-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={item.estimatedPrice}
                      onChange={(e) => onUpdatePrice(item.id, parseFloat(e.target.value) || 0)}
                      className="w-20 pl-5 pr-2 py-1 border border-neutral-200 hover:border-teal-500 focus:border-teal-600 rounded-lg text-right font-mono tabular-nums text-xs font-bold text-neutral-900 focus:outline-none bg-white transition-colors"
                      title="Edit item total price to recalculate budget"
                    />
                  </div>

                  {/* Edit Full Item Button (Pencil) */}
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 text-neutral-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Edit item name, brand, or aisle"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Item */}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>
              All quantity and price adjustments automatically update your budget target and variance.
            </span>
          </div>

          <button
            onClick={onProceedToRefine}
            className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs self-stretch sm:self-auto justify-center"
          >
            <span>Proceed to Refine & Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Item Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-2xs">
          <form
            onSubmit={handleSaveEditItem}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-xs animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-600" />
                <span>Update Item & Recalculate</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Item Name</label>
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-teal-600 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Brand Tier</label>
                <select
                  value={editingItem.brandTier || 'Cymbal Fresh'}
                  onChange={(e) => {
                    const newTier = e.target.value as BrandTier;
                    // Auto-adjust price if switching to Cymbal Basics (25% off)
                    let updatedPrice = editingItem.estimatedPrice;
                    if (newTier === 'Cymbal Basics' && editingItem.brandTier !== 'Cymbal Basics') {
                      updatedPrice = Math.round(updatedPrice * 0.75 * 100) / 100;
                    }
                    setEditingItem({
                      ...editingItem,
                      brandTier: newTier,
                      estimatedPrice: updatedPrice,
                    });
                  }}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-xs"
                >
                  <option value="Cymbal Fresh">Cymbal Fresh (Produce/Meat)</option>
                  <option value="Cymbal Select">Cymbal Select (Gourmet)</option>
                  <option value="Cymbal Basics">Cymbal Basics (Max Savings -25%)</option>
                  <option value="National Brand">National Brand</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Aisle / Department</label>
                <select
                  value={editingItem.storeRecommendation}
                  onChange={(e) => setEditingItem({ ...editingItem, storeRecommendation: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white text-xs"
                >
                  <option value="Produce Island">Produce Island</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                  <option value="Deli & Prepared">Deli & Prepared</option>
                  <option value="Bakery Case">Bakery Case</option>
                  <option value="Aisle 2 - Beverages & Ice">Aisle 2 - Beverages & Ice</option>
                  <option value="Aisle 5 - Pantry & Snacks">Aisle 5 - Pantry & Snacks</option>
                  <option value="Aisle 11 - Party & Tableware">Aisle 11 - Party & Tableware</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={editingItem.quantity}
                  onChange={(e) => {
                    const q = Math.max(1, parseInt(e.target.value) || 1);
                    const unitP = editingItem.estimatedPrice / editingItem.quantity;
                    setEditingItem({
                      ...editingItem,
                      quantity: q,
                      estimatedPrice: Math.round(unitP * q * 100) / 100,
                    });
                  }}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono tabular-nums text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Unit Description</label>
                <input
                  type="text"
                  value={editingItem.unit}
                  onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Total Price ($) · Auto-recalculates Cart Budget
              </label>
              <input
                type="number"
                min="0"
                step="0.25"
                value={editingItem.estimatedPrice}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    estimatedPrice: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono tabular-nums text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Notes / Instructions</label>
              <input
                type="text"
                value={editingItem.notes || ''}
                onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                placeholder="e.g. Choose ripe avocados, chill before party"
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-neutral-500 hover:text-neutral-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Recalculate</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-2xs">
          <form
            onSubmit={handleAddItemSubmit}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-xs animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">Add Item to CymbalMart Cart</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Item Description</label>
              <input
                type="text"
                placeholder="e.g. Cymbal Fresh Sweet Strawberries, Mini Sliders"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Department</label>
                <select
                  value={itemDept}
                  onChange={(e) => setItemDept(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                >
                  <option value="Produce Island">Produce Island</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                  <option value="Deli & Prepared">Deli & Prepared</option>
                  <option value="Bakery Case">Bakery Case</option>
                  <option value="Aisle 2 - Beverages & Ice">Aisle 2 - Beverages & Ice</option>
                  <option value="Aisle 5 - Pantry & Snacks">Aisle 5 - Pantry & Snacks</option>
                  <option value="Aisle 11 - Party & Tableware">Aisle 11 - Party & Tableware</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Brand Tier</label>
                <select
                  value={itemBrand}
                  onChange={(e) => setItemBrand(e.target.value as BrandTier)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-white"
                >
                  <option value="Cymbal Fresh">Cymbal Fresh</option>
                  <option value="Cymbal Select">Cymbal Select</option>
                  <option value="Cymbal Basics">Cymbal Basics</option>
                  <option value="National Brand">National Brand</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Unit</label>
                <input
                  type="text"
                  placeholder="pack, lbs, bottles, box"
                  value={itemUnit}
                  onChange={(e) => setItemUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Est. Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={itemPrice}
                onChange={(e) => setItemPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono tabular-nums"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-neutral-500 hover:text-neutral-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg"
              >
                Add Item & Recalculate
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
