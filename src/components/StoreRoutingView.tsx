import React, { useState } from 'react';
import { ShoppingItem } from '../types.ts';
import { formatCurrency } from '../utils/partyCalculators.ts';
import {
  Store,
  Check,
  Copy,
  TrendingDown,
  Navigation,
  MapPin,
  ShoppingBag,
} from 'lucide-react';

interface StoreRoutingViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
}

const DEPT_CONFIG: Record<
  string,
  {
    displayName: string;
    description: string;
    strategyTip: string;
    stopOrder: number;
  }
> = {
  'Produce Island': {
    displayName: 'Produce Island (Cymbal Fresh)',
    description: 'Fresh citrus (lemons/limes), ripe avocados, cilantro, and seasonal berries.',
    strategyTip: 'Stop 1: Select avocados and fresh citrus first.',
    stopOrder: 1,
  },
  'Meat & Seafood': {
    displayName: 'Meat & Seafood Counter',
    description: 'Fresh 80/20 ground chuck, marinated carnitas pork, and chicken skewers.',
    strategyTip: 'Stop 2: Ask the butcher to double-wrap meats.',
    stopOrder: 2,
  },
  'Deli & Prepared': {
    displayName: 'Deli & Prepared Foods',
    description: 'Artisan cheese boards, prosciutto di Parma, dips, and rotisserie items.',
    strategyTip: 'Stop 3: Keep cheeses cool.',
    stopOrder: 3,
  },
  'Bakery Case': {
    displayName: 'Cymbal Bakery Case',
    description: 'Warm French baguettes, brioche burger buns, and celebration cakes.',
    strategyTip: 'Stop 4: Pick up fresh baguettes baked this morning.',
    stopOrder: 4,
  },
  'Aisle 5 - Pantry & Snacks': {
    displayName: 'Aisle 5: Pantry & International',
    description: 'Cymbal Basics tortilla chips, salsas, black beans, crackers, and nuts.',
    strategyTip: 'Stop 5: Save with Cymbal Basics pantry staples.',
    stopOrder: 5,
  },
  'Aisle 2 - Beverages & Ice': {
    displayName: 'Aisle 2: Beverages & Ice Freezer',
    description: 'Craft beer, wines, sodas, tonics, and 10lb bags of cocktail ice.',
    strategyTip: 'Stop 6: Pick up bagged ice LAST so it stays frozen until your cooler.',
    stopOrder: 6,
  },
  'Aisle 11 - Party & Tableware': {
    displayName: 'Aisle 11: Party Supplies & Paper',
    description: 'Plates, napkins, cups, tablecloths, candles, and cleanup bags.',
    strategyTip: 'Stop 7: Stock up on heavy duty sugarcane plates.',
    stopOrder: 7,
  },
};

export const StoreRoutingView: React.FC<StoreRoutingViewProps> = ({
  items,
  onToggleItem,
}) => {
  const [copiedDept, setCopiedDept] = useState<string | null>(null);

  // Group items by department
  const depts = Object.keys(DEPT_CONFIG);

  const copyDeptList = (dept: string) => {
    const deptItems = items.filter((i) => (i.storeRecommendation || '').includes(dept.split(':')[0]));
    const subtotal = deptItems.reduce((acc, i) => acc + i.estimatedPrice, 0);

    let text = `🛒 CYMBALMART - ${dept.toUpperCase()}\nSubtotal: ${formatCurrency(subtotal)}\n\n`;
    deptItems.forEach((i) => {
      const check = i.isPurchased ? '[✓]' : '[ ]';
      text += `${check} ${i.quantity} ${i.unit} - ${i.name} (~${formatCurrency(i.estimatedPrice)})\n`;
      if (i.notes) text += `   Note: ${i.notes}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopiedDept(dept);
    setTimeout(() => setCopiedDept(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">
              CymbalMart Department Routing & Aisle Plan
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-3xl">
              Sequenced through CymbalMart Store #104 from entrance to checkout. Follow this sequence to navigate the aisles efficiently in under 18 minutes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {depts.map((deptKey) => {
          const config = DEPT_CONFIG[deptKey];
          const deptItems = items.filter((i) =>
            (i.storeRecommendation || '').toLowerCase().includes(deptKey.toLowerCase().split('-')[0].trim())
          );
          const subtotal = deptItems.reduce((acc, i) => acc + i.estimatedPrice, 0);
          const completedCount = deptItems.filter((i) => i.isPurchased).length;

          if (deptItems.length === 0) return null;

          return (
            <div
              key={deptKey}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="p-5 border-b border-neutral-100 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-teal-700" />
                      <h3 className="font-bold text-sm text-neutral-900">
                        {config.displayName}
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-500 leading-tight">
                      {config.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums text-base font-bold text-neutral-900">
                      {formatCurrency(subtotal)}
                    </div>
                    <div className="text-xs text-neutral-400 font-mono tabular-nums">
                      {completedCount} / {deptItems.length} items
                    </div>
                  </div>
                </div>

                <div className="px-5 py-2.5 bg-neutral-50/70 border-b border-neutral-100 text-xs text-neutral-600 flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span className="font-medium text-neutral-700">{config.strategyTip}</span>
                </div>

                <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto">
                  {deptItems.map((item) => (
                    <div
                      key={item.id}
                      className={`px-5 py-2.5 flex items-center justify-between text-xs hover:bg-neutral-50/50 transition-colors ${
                        item.isPurchased ? 'text-neutral-400' : 'text-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          onClick={() => onToggleItem(item.id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            item.isPurchased
                              ? 'bg-teal-700 border-teal-700 text-white'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {item.isPurchased && <Check className="w-3 h-3 stroke-3" />}
                        </button>
                        <span className={`truncate ${item.isPurchased ? 'line-through' : 'font-medium'}`}>
                          {item.quantity} {item.unit} · {item.name}
                        </span>
                      </div>

                      <span className="font-mono tabular-nums font-semibold text-neutral-700 ml-2 shrink-0">
                        {formatCurrency(item.estimatedPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono tabular-nums">
                  {deptItems.length} items
                </span>
                <button
                  onClick={() => copyDeptList(deptKey)}
                  className="px-3 py-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Copy className="w-3 h-3 text-neutral-500" />
                  <span>{copiedDept === deptKey ? 'Copied!' : 'Copy Department List'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
