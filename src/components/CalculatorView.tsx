import React, { useState } from 'react';
import { PartyConfig, ShoppingItem } from '../types.ts';
import {
  calculateBeverageNeeds,
  calculateFoodNeeds,
  calculateTablewareNeeds,
  formatCurrency,
} from '../utils/partyCalculators.ts';
import {
  GlassWater,
  Utensils,
  Package,
  Sparkles,
  Info,
  CheckCircle,
  Wine,
  Beer,
  RefreshCw,
} from 'lucide-react';

interface CalculatorViewProps {
  party: PartyConfig;
  onUpdateParty: (updated: Partial<PartyConfig>) => void;
  onApplyCalculationsToList: (itemsToAddOrUpdate: Omit<ShoppingItem, 'id' | 'isPurchased'>[]) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  party,
  onUpdateParty,
  onApplyCalculationsToList,
}) => {
  const [isHeavyDinner, setIsHeavyDinner] = useState(true);
  const [syncedNotice, setSyncedNotice] = useState(false);

  const bev = calculateBeverageNeeds(party);
  const food = calculateFoodNeeds(party, isHeavyDinner);
  const table = calculateTablewareNeeds(party);

  const totalGuests = party.adults + party.kids;

  const handleApplyToShoppingList = () => {
    // Generate recommended items based on math
    const items: Omit<ShoppingItem, 'id' | 'isPurchased'>[] = [
      {
        name: `Red & White Table Wine (${bev.wineBottles} bottles)`,
        category: 'beverages',
        quantity: bev.wineBottles,
        unit: 'bottles',
        estimatedPrice: bev.wineBottles * 12,
        storeRecommendation: "Trader Joe's / Local Grocery",
        notes: 'Calculated at ~5 standard 5oz glasses per bottle',
      },
      {
        name: `Craft Beers & Ciders (${bev.beerCans} cans)`,
        category: 'beverages',
        quantity: Math.ceil(bev.beerCans / 6),
        unit: '6-packs',
        estimatedPrice: Math.ceil(bev.beerCans / 6) * 11,
        storeRecommendation: 'Costco / Wholesale',
        notes: 'Assorted lager and IPA',
      },
      {
        name: `Spirits / Base Liquors (750ml)`,
        category: 'beverages',
        quantity: bev.liquorBottles,
        unit: 'bottles',
        estimatedPrice: bev.liquorBottles * 24,
        storeRecommendation: 'Costco / Wholesale',
        notes: 'Vodka, Tequila, or Bourbon (~16 drinks per bottle)',
      },
      {
        name: `Mixers & Sodas (${bev.sodaCans} cans/bottles)`,
        category: 'beverages',
        quantity: Math.ceil(bev.sodaCans / 12),
        unit: '12-packs',
        estimatedPrice: Math.ceil(bev.sodaCans / 12) * 8,
        storeRecommendation: 'Supermarket',
        notes: 'Club soda, tonic, and soft drinks',
      },
      {
        name: `Cocktail & Cooler Ice (${bev.iceBags} x 10lb bags)`,
        category: 'beverages',
        quantity: bev.iceBags,
        unit: 'bags (10lb)',
        estimatedPrice: bev.iceBags * 3.5,
        storeRecommendation: 'Supermarket',
        notes: '1.5 lbs per guest for chilling and drinks',
      },
      {
        name: `Lemons & Limes (${bev.lemonsLimes} pieces)`,
        category: 'produce',
        quantity: bev.lemonsLimes,
        unit: 'pieces',
        estimatedPrice: Math.ceil(bev.lemonsLimes * 0.45),
        storeRecommendation: 'Supermarket',
        notes: 'Fresh bar garnishes',
      },
      {
        name: `Primary Proteins / Main Meats (${food.proteinLbs} lbs)`,
        category: 'proteins',
        quantity: food.proteinLbs,
        unit: 'lbs',
        estimatedPrice: food.proteinLbs * 6,
        storeRecommendation: 'Costco / Wholesale',
        notes: 'Calculated at 0.5 lb per adult, 0.3 lb per kid',
      },
      {
        name: `Disposable Cups (12-16 oz)`,
        category: 'tableware',
        quantity: Math.ceil(table.cups / 50) * 50,
        unit: 'cups',
        estimatedPrice: Math.ceil(table.cups / 50) * 8,
        storeRecommendation: 'Costco / Wholesale',
        notes: '2.5 cups per guest (guests lose cups)',
      },
      {
        name: `Dinner & Appetizer Plates`,
        category: 'tableware',
        quantity: Math.ceil((table.dinnerPlates + table.dessertPlates) / 50) * 50,
        unit: 'plates',
        estimatedPrice: 16,
        storeRecommendation: 'Party City / Target',
        notes: 'Heavy duty compostable plates',
      },
      {
        name: `Cocktail & Dinner Napkins (${table.napkins} count)`,
        category: 'tableware',
        quantity: Math.ceil(table.napkins / 100),
        unit: 'packs of 100',
        estimatedPrice: Math.ceil(table.napkins / 100) * 5,
        storeRecommendation: 'Party City / Target',
        notes: '4 napkins per guest for finger foods and drinks',
      },
      {
        name: `Heavy Duty Contractor Trash Bags`,
        category: 'tableware',
        quantity: table.trashBags,
        unit: 'bags',
        estimatedPrice: 6,
        storeRecommendation: 'Supermarket',
        notes: '1 per 5 guests for easy cleanup',
      },
    ];

    onApplyCalculationsToList(items);
    setSyncedNotice(true);
    setTimeout(() => setSyncedNotice(false), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Guest & Duration Sliders */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Party Quantity Calculation Engine
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Adjust your headcount and timeline. Quantities recalculate dynamically using standard catering hospitality formulas.
            </p>
          </div>

          <button
            onClick={handleApplyToShoppingList}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors flex items-center gap-2 shadow-xs whitespace-nowrap self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{syncedNotice ? 'Synced to Shopping List!' : 'Apply Formulas to Shopping List'}</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          {/* Adults Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-neutral-700">Adult Guests</span>
              <span className="font-mono tabular-nums text-sm font-bold text-neutral-900">
                {party.adults}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="80"
              value={party.adults}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onUpdateParty({
                  adults: val,
                  drinkingAdults: Math.min(val, party.drinkingAdults),
                });
              }}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Drinking Adults Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-neutral-700">Drinking Adults</span>
              <span className="font-mono tabular-nums text-sm font-bold text-neutral-900">
                {party.drinkingAdults}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={party.adults}
              value={party.drinkingAdults}
              onChange={(e) => onUpdateParty({ drinkingAdults: parseInt(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Kids Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-neutral-700">Kids & Teens</span>
              <span className="font-mono tabular-nums text-sm font-bold text-neutral-900">
                {party.kids}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={party.kids}
              onChange={(e) => onUpdateParty({ kids: parseInt(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-neutral-700">Duration</span>
              <span className="font-mono tabular-nums text-sm font-bold text-neutral-900">
                {party.durationHours} Hours
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={party.durationHours}
              onChange={(e) => onUpdateParty({ durationHours: parseInt(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Meal Style Selector */}
        <div className="flex items-center gap-3 pt-2 text-xs">
          <span className="font-medium text-neutral-600">Food Style:</span>
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setIsHeavyDinner(true)}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                isHeavyDinner ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Full Dinner Meal
            </button>
            <button
              onClick={() => setIsHeavyDinner(false)}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                !isHeavyDinner ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Cocktails & Appetizers Only
            </button>
          </div>
        </div>
      </div>

      {/* 3 Calculated Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Beverages & Bar */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <GlassWater className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-neutral-900 text-sm">Beverages & Ice</h3>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-neutral-500">
              {bev.totalDrinks} Total Drinks
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600 flex items-center gap-1.5">
                <Wine className="w-3.5 h-3.5 text-neutral-400" />
                <span>Wine (750ml bottles)</span>
              </span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {bev.wineBottles} <span className="text-xs font-normal text-neutral-400">({bev.wineBottles * 5} glasses)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600 flex items-center gap-1.5">
                <Beer className="w-3.5 h-3.5 text-neutral-400" />
                <span>Beer / Seltzers (cans)</span>
              </span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {bev.beerCans} <span className="text-xs font-normal text-neutral-400">({Math.ceil(bev.beerCans / 6)} x 6-pk)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Liquor / Spirits (750ml)</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {bev.liquorBottles} <span className="text-xs font-normal text-neutral-400">bottles</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Sodas & Sparkling Waters</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {bev.sodaCans} <span className="text-xs font-normal text-neutral-400">cans</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600 font-semibold text-amber-700">Ice (Cocktails & Cooler)</span>
              <span className="font-mono tabular-nums font-bold text-amber-700 text-sm">
                {bev.iceLbs} lbs <span className="text-xs font-normal text-neutral-500">({bev.iceBags} x 10lb bags)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-600">Garnish Lemons & Limes</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {bev.lemonsLimes} pieces
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-500 space-y-1">
            <div className="font-semibold text-neutral-700">The 2-1 Rule:</div>
            <p>2 drinks per guest in hour 1, plus 1 drink for each hour after.</p>
          </div>
        </div>

        {/* Pillar 2: Food & Portions */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-neutral-900 text-sm">Food & Catering Math</h3>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-neutral-500">
              {totalGuests} Guests
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Appetizer Bites / Canapés</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {food.appetizerPieces} <span className="text-xs font-normal text-neutral-400">pieces</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Protein (Meat / Substitute)</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {food.proteinLbs} lbs <span className="text-xs font-normal text-neutral-400">(0.5 lb/adult)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Side Dishes (Rice, Veggies, Slaw)</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {food.sidesServings} <span className="text-xs font-normal text-neutral-400">servings</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Buns / Tortillas / Bread</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {food.breadOrBuns} pieces
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-600">Dessert Portions / Slices</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {food.dessertPieces} servings
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-500 space-y-1">
            <div className="font-semibold text-neutral-700">Chef's Buffer Rule:</div>
            <p>Always add 10% buffer to protein to avoid running out during the first rush.</p>
          </div>
        </div>

        {/* Pillar 3: Tableware & Disposables */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-neutral-900 text-sm">Tableware & Clean-up</h3>
            </div>
            <span className="text-xs font-mono tabular-nums font-semibold text-neutral-500">
              Disposables
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Drinking Cups</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {table.cups} <span className="text-xs font-normal text-neutral-400">(2.5x guests)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Dinner Plates</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {table.dinnerPlates} <span className="text-xs font-normal text-neutral-400">plates</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Dessert / App Plates</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {table.dessertPlates} <span className="text-xs font-normal text-neutral-400">plates</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-neutral-50">
              <span className="text-neutral-600">Napkins (Cocktail & Dinner)</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {table.napkins} <span className="text-xs font-normal text-neutral-400">(4x guests)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-neutral-600 font-semibold text-neutral-800">Heavy Duty Trash Bags</span>
              <span className="font-mono tabular-nums font-bold text-neutral-900 text-sm">
                {table.trashBags} <span className="text-xs font-normal text-neutral-400">bags</span>
              </span>
            </div>
          </div>

          <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-500 space-y-1">
            <div className="font-semibold text-neutral-700">Host Pro-Tip:</div>
            <p>Leave a Sharpie marker next to the cups so guests write their names and reuse!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
