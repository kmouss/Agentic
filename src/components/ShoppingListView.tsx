import React, { useState } from 'react';
import { ShoppingItem, ItemCategory, StoreRecommendation } from '../types.ts';
import { formatCurrency } from '../utils/partyCalculators.ts';
import confetti from 'canvas-confetti';
import {
  Check,
  Plus,
  Trash2,
  Copy,
  Printer,
  Sparkles,
  ShoppingBag,
  Store,
  ChevronDown,
  Tag,
  CheckCircle2,
} from 'lucide-react';

interface ShoppingListViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  onClearCompleted: () => void;
  onCheckAll: (checked: boolean) => void;
}

const CATEGORIES: { id: ItemCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Items' },
  { id: 'beverages', label: 'Beverages & Ice' },
  { id: 'proteins', label: 'Proteins & Cheese' },
  { id: 'produce', label: 'Fresh Produce' },
  { id: 'pantry', label: 'Pantry & Snacks' },
  { id: 'tableware', label: 'Tableware & Cups' },
  { id: 'decor', label: 'Decor & Ambiance' },
];

const STORES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Aisles & Depts' },
  { id: 'Produce Island', label: 'Produce Island' },
  { id: 'Meat & Seafood', label: 'Meat & Seafood' },
  { id: 'Deli & Prepared', label: 'Deli & Prepared' },
  { id: 'Bakery Case', label: 'Bakery Case' },
  { id: 'Aisle 2 - Beverages & Ice', label: 'Aisle 2 - Beverages' },
  { id: 'Aisle 5 - Pantry & Snacks', label: 'Aisle 5 - Pantry' },
  { id: 'Aisle 11 - Party & Tableware', label: 'Aisle 11 - Party' },
];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  items,
  onToggleItem,
  onUpdateQuantity,
  onUpdatePrice,
  onDeleteItem,
  onAddItem,
  onClearCompleted,
  onCheckAll,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // New item form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ItemCategory>('pantry');
  const [newStore, setNewStore] = useState<string>('Aisle 5 - Pantry & Snacks');
  const [newQty, setNewQty] = useState(1);
  const [newUnit, setNewUnit] = useState('pack');
  const [newPrice, setNewPrice] = useState(5);
  const [newNotes, setNewNotes] = useState('');

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchStore = selectedStore === 'all' || item.storeRecommendation === selectedStore;
    return matchCategory && matchStore;
  });

  const totalItemCount = items.length;
  const purchasedCount = items.filter((i) => i.isPurchased).length;
  const isAllDone = totalItemCount > 0 && purchasedCount === totalItemCount;

  const currentTotal = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const purchasedTotal = items
    .filter((i) => i.isPurchased)
    .reduce((sum, item) => sum + item.estimatedPrice, 0);

  const handleToggle = (id: string) => {
    const target = items.find((i) => i.id === id);
    const willBePurchased = !target?.isPurchased;
    onToggleItem(id);

    // Trigger celebration if this action completes the list
    if (willBePurchased && purchasedCount + 1 === totalItemCount && totalItemCount > 0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddItem({
      name: newName.trim(),
      category: newCategory,
      storeRecommendation: newStore,
      quantity: Number(newQty) || 1,
      unit: newUnit.trim() || 'item',
      estimatedPrice: Number(newPrice) || 0,
      notes: newNotes.trim() || undefined,
      customItem: true,
    });

    setNewName('');
    setNewNotes('');
    setNewQty(1);
    setShowAddForm(false);
  };

  const copyToClipboard = () => {
    // Generate clean formatted text grouped by store
    const storeGroups: Record<string, ShoppingItem[]> = {};
    items.forEach((item) => {
      const store = item.storeRecommendation;
      if (!storeGroups[store]) storeGroups[store] = [];
      storeGroups[store].push(item);
    });

    let text = `🎉 Festivo Party Shopping Checklist\nTotal Estimated: ${formatCurrency(currentTotal)}\n\n`;

    Object.entries(storeGroups).forEach(([store, storeItems]) => {
      text += `📍 ${store.toUpperCase()}\n`;
      storeItems.forEach((it) => {
        const mark = it.isPurchased ? ' [✓]' : ' [ ]';
        text += `${mark} ${it.quantity} ${it.unit} - ${it.name} (${formatCurrency(it.estimatedPrice)})\n`;
      });
      text += '\n';
    });

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Bar: Interactive Tabs & Actions (§1.A allowed for functional controls) */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Store Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1 rounded-lg">
          {STORES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStore(s.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                selectedStore === s.id
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>

          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Copy checklist for notes or SMS"
          >
            <Copy className="w-3.5 h-3.5 text-neutral-500" />
            <span>{copiedNotification ? 'Copied to Clipboard!' : 'Copy List'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Print list"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-500" />
            <span>Print</span>
          </button>

          {purchasedCount > 0 && (
            <button
              onClick={onClearCompleted}
              className="px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-rose-600 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <span>Clear Done</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Horizontal Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:text-neutral-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Add Custom Item Expandable Panel */}
      {showAddForm && (
        <form
          onSubmit={handleAddItemSubmit}
          className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-500" />
              <span>Add Custom Shopping Item</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-neutral-400 hover:text-neutral-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-medium text-neutral-700 mb-1">Item Name</label>
              <input
                type="text"
                placeholder="e.g. Maldon Sea Salt Flakes, Sparkling Cider"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-amber-500 bg-white"
              >
                <option value="beverages">Beverages & Ice</option>
                <option value="proteins">Proteins & Cheese</option>
                <option value="produce">Fresh Produce</option>
                <option value="pantry">Pantry & Snacks</option>
                <option value="tableware">Tableware</option>
                <option value="decor">Decor & Ambiance</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Store Routing</label>
              <select
                value={newStore}
                onChange={(e) => setNewStore(e.target.value as StoreRecommendation)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-amber-500 bg-white"
              >
                <option value="Costco / Wholesale">Costco / Wholesale</option>
                <option value="Trader Joe's / Local Grocery">Trader Joe's</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Party City / Target">Party / Target</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={newQty}
                onChange={(e) => setNewQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-mono tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Unit</label>
              <input
                type="text"
                placeholder="pack, bottles, lbs, box"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Est. Price ($)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={newPrice}
                onChange={(e) => setNewPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 font-mono tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Brand preference, chill before"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Add to Shopping List
            </button>
          </div>
        </form>
      )}

      {/* Shopping List Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {/* Table Header Summary */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onCheckAll(!isAllDone)}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 flex items-center gap-1.5"
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center ${isAllDone ? 'bg-amber-500 border-amber-500 text-white' : 'border-neutral-300'}`}>
                {isAllDone && <Check className="w-3 h-3 stroke-3" />}
              </span>
              <span>{isAllDone ? 'Uncheck All' : 'Select All'}</span>
            </button>
            <span aria-hidden="true">·</span>
            <span>
              <strong className="font-mono tabular-nums text-neutral-900">{purchasedCount}</strong> of{' '}
              <strong className="font-mono tabular-nums text-neutral-900">{totalItemCount}</strong> Purchased
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              Cart: <strong className="font-mono tabular-nums text-neutral-900">{formatCurrency(purchasedTotal)}</strong> / {formatCurrency(currentTotal)}
            </span>
          </div>
        </div>

        {/* Rows */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
            <div className="text-sm font-semibold text-neutral-700">No items match your filter</div>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Change the store or category filter above, or click "Add Item" to add ingredients and supplies.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredItems.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-neutral-50/80 ${
                    item.isPurchased ? 'bg-neutral-50/50' : ''
                  }`}
                >
                  {/* Left: Checkbox & Item details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggle(item.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        item.isPurchased
                          ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                          : 'border-neutral-300 hover:border-neutral-400 bg-white'
                      }`}
                      aria-label={item.isPurchased ? `Mark ${item.name} unbought` : `Mark ${item.name} bought`}
                    >
                      {item.isPurchased && <Check className="w-3.5 h-3.5 stroke-3" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold tracking-tight transition-all ${
                            item.isPurchased ? 'line-through text-neutral-400' : 'text-neutral-900'
                          }`}
                        >
                          {item.name}
                        </span>

                        {/* Unboxed Metadata with Typographic Separator (§1.A Zero-Pill) */}
                        <span className="text-xs text-neutral-400">·</span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Store className="w-3 h-3 text-neutral-400" />
                          <span>{item.storeRecommendation}</span>
                        </span>

                        {item.dietaryTag && (
                          <>
                            <span className="text-xs text-neutral-400">·</span>
                            <span className="text-xs text-emerald-700 font-medium">
                              {item.dietaryTag}
                            </span>
                          </>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-neutral-400 mt-0.5 leading-tight truncate max-w-xl">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quantity controls & Price */}
                  <div className="flex items-center gap-4 shrink-0">
                    {/* Quantity bump */}
                    <div className="flex items-center gap-1.5 bg-neutral-100 rounded-lg p-0.5 text-xs">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white rounded transition-colors font-bold"
                        title="Decrease"
                      >
                        -
                      </button>
                      <span className="px-1.5 font-mono tabular-nums font-semibold text-neutral-900 text-xs">
                        {item.quantity} <span className="text-neutral-500 font-normal">{item.unit}</span>
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white rounded transition-colors font-bold"
                        title="Increase"
                      >
                        +
                      </button>
                    </div>

                    {/* Price in Tabular figures */}
                    <div className="w-16 text-right">
                      <span className="font-mono tabular-nums text-sm font-bold text-neutral-900">
                        {formatCurrency(item.estimatedPrice)}
                      </span>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="p-1.5 text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
