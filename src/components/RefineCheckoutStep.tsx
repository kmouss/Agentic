import React, { useState } from 'react';
import { PartyConfig, ShoppingItem, BrandTier } from '../types.ts';
import { formatCurrency } from '../utils/partyCalculators.ts';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Store,
  Truck,
  Car,
  Check,
  Sparkles,
  ArrowLeft,
  Printer,
  Copy,
  Calendar,
  ShieldCheck,
  Clock,
  MapPin,
  QrCode,
  Tag,
  AlertCircle,
  HelpCircle,
  Trash2,
} from 'lucide-react';

interface RefineCheckoutStepProps {
  party: PartyConfig;
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDeleteItem?: (id: string) => void;
  onApplyBrandStrategy: (strategy: 'basics' | 'balanced' | 'select') => void;
  onBackToReview: () => void;
  onConsultAgent: (prompt: string) => void;
  isOrderPlaced?: boolean;
  onSetOrderPlaced?: (placed: boolean) => void;
}

export const RefineCheckoutStep: React.FC<RefineCheckoutStepProps> = ({
  party,
  items,
  onToggleItem,
  onUpdateQuantity,
  onDeleteItem,
  onApplyBrandStrategy,
  onBackToReview,
  onConsultAgent,
  isOrderPlaced: isOrderPlacedProp,
  onSetOrderPlaced,
}) => {
  const [fulfillmentType, setFulfillmentType] = useState<'curbside' | 'delivery' | 'instore'>('curbside');
  const [pickupSlot, setPickupSlot] = useState('Saturday, 3:00 PM - 4:00 PM');
  const [deliveryAddress, setDeliveryAddress] = useState('1428 Elm Street, Sunnyvale, CA');
  const [localOrderPlaced, setLocalOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('CYMBAL-PRTY-7842');
  const [activeConstraintFilter, setActiveConstraintFilter] = useState<'all' | 'dietary' | 'perishable'>('all');

  const isOrderPlaced = isOrderPlacedProp !== undefined ? isOrderPlacedProp : localOrderPlaced;
  const setOrderPlaced = (placed: boolean) => {
    if (onSetOrderPlaced) {
      onSetOrderPlaced(placed);
    }
    setLocalOrderPlaced(placed);
  };

  const subtotal = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
  const estimatedTax = subtotal * 0.0825;
  const fulfillmentFee = fulfillmentType === 'delivery' ? 4.99 : 0.0;
  const finalTotal = subtotal + estimatedTax + fulfillmentFee;

  // Calculate estimated store brand savings (Cymbal brands are ~25% cheaper than national)
  const cymbalBrandItems = items.filter(
    (i) => i.brandTier && i.brandTier.startsWith('Cymbal')
  );
  const estimatedSavings = Math.round(
    cymbalBrandItems.reduce((acc, i) => acc + i.estimatedPrice * 0.35, 0)
  );

  // Group items by Aisle / Department for efficient in-store order
  const aisleOrder = [
    'Produce Island',
    'Meat & Seafood',
    'Deli & Prepared',
    'Bakery Case',
    'Aisle 5 - Pantry & Snacks',
    'Aisle 2 - Beverages & Ice',
    'Aisle 11 - Party & Tableware',
  ];

  const groupedByAisle: Record<string, ShoppingItem[]> = {};
  items.forEach((item) => {
    const loc = item.storeRecommendation || 'Aisle 5 - Pantry & Snacks';
    if (!groupedByAisle[loc]) groupedByAisle[loc] = [];
    groupedByAisle[loc].push(item);
  });

  const handleCheckout = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `CYMBAL-PRTY-${randomNum}`;
    setOrderId(newOrderId);
    setOrderPlaced(true);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const copyShoppingListText = () => {
    let text = `🛒 CymbalMart Shopping List - ${party.title}\nTotal: ${formatCurrency(finalTotal)}\nFulfillment: ${fulfillmentType.toUpperCase()}\n\n`;

    aisleOrder.forEach((aisle) => {
      const aisleItems = groupedByAisle[aisle];
      if (aisleItems && aisleItems.length > 0) {
        text += `📍 ${aisle.toUpperCase()}\n`;
        aisleItems.forEach((i) => {
          const mark = i.isPurchased ? '[✓]' : '[ ]';
          text += `${mark} ${i.quantity} ${i.unit} - ${i.name} (${formatCurrency(i.estimatedPrice)})\n`;
        });
        text += '\n';
      }
    });

    navigator.clipboard.writeText(text);
    alert('CymbalMart aisle-by-aisle shopping list copied to clipboard!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* CUJ Step 3 Header */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                3
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Refine Constraints & Finalize Order
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-2xl">
              Fine-tune brand tier substitutions, verify dietary restrictions, select curbside pickup or same-day delivery, and finalize your party order.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToReview}
              className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Budget Review</span>
            </button>
          </div>
        </div>

        {/* Constraint Refinement Section */}
        <div className="mt-6 space-y-6">
          <div>
            <div className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
              Constraint 1: Brand Tier Strategy (Instant Budget Alignment)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                onClick={() => onApplyBrandStrategy('basics')}
                className="p-3.5 rounded-xl border border-neutral-200 hover:border-teal-600 bg-white hover:bg-teal-50/20 text-left transition-all"
              >
                <div className="font-bold text-teal-800 flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  <span>Maximum Savings (Cymbal Basics)</span>
                </div>
                <div className="text-neutral-500 text-[11px] mt-1">
                  Swaps grocery staples for Cymbal Basics to shave 20-30% off total spend.
                </div>
              </button>

              <button
                onClick={() => onApplyBrandStrategy('balanced')}
                className="p-3.5 rounded-xl border border-neutral-200 hover:border-teal-600 bg-white hover:bg-teal-50/20 text-left transition-all"
              >
                <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Balanced Host (Fresh & Basics)</span>
                </div>
                <div className="text-neutral-500 text-[11px] mt-1">
                  Fresh produce and bakery treats paired with cost-effective pantry basics.
                </div>
              </button>

              <button
                onClick={() => onApplyBrandStrategy('select')}
                className="p-3.5 rounded-xl border border-neutral-200 hover:border-amber-600 bg-white hover:bg-amber-50/20 text-left transition-all"
              >
                <div className="font-bold text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Gourmet Elevate (Cymbal Select)</span>
                </div>
                <div className="text-neutral-500 text-[11px] mt-1">
                  Elevates imported cheeses, artisan baguettes, and reserve wines.
                </div>
              </button>
            </div>
          </div>

          {/* Quick AI Consultation Strip */}
          <div className="p-4 bg-teal-50/60 border border-teal-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-teal-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>Need quick custom constraint adjustments?</span>
              </div>
              <p className="text-teal-800 text-[11px]">
                Ask the CymbalMart Shopping Agent to add gluten-free rolls, trim $30, or suggest mocktails.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onConsultAgent('Adjust this list to include vegan and gluten-free swaps for 4 guests')}
                className="px-3 py-1.5 bg-white border border-teal-300 hover:border-teal-400 text-teal-900 font-semibold rounded-lg text-xs transition-colors"
              >
                + Dietary Swaps
              </button>
              <button
                onClick={() => onConsultAgent('How can I cut $30 without sacrificing food quality?')}
                className="px-3 py-1.5 bg-white border border-teal-300 hover:border-teal-400 text-teal-900 font-semibold rounded-lg text-xs transition-colors"
              >
                -$30 Cut Suggestions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Aisle Walkthrough (Left) & Fulfillment / Checkout (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Aisle Navigation & Final Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900 tracking-tight flex items-center gap-2">
                  <Store className="w-4 h-4 text-teal-600" />
                  <span>CymbalMart In-Store Aisle Routing Sheet</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Items sequenced from store entrance to refrigerated aisles to prevent ice and berries from melting.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyShoppingListText}
                  className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  title="Copy formatted list"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy List</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  title="Print aisle checklist"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-neutral-100 max-h-[600px] overflow-y-auto">
              {aisleOrder.map((aisle) => {
                const aisleItems = groupedByAisle[aisle];
                if (!aisleItems || aisleItems.length === 0) return null;

                return (
                  <div key={aisle} className="p-4 sm:p-5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                      <span className="flex items-center gap-1.5 text-teal-900">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        <span>{aisle}</span>
                      </span>
                      <span className="text-neutral-400 font-mono tabular-nums">
                        {aisleItems.length} items
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {aisleItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs transition-colors ${
                            item.isPurchased
                              ? 'bg-neutral-50/60 border-neutral-100 text-neutral-400'
                              : 'bg-white border-neutral-200/80 text-neutral-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button
                              onClick={() => onToggleItem(item.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                item.isPurchased
                                  ? 'bg-teal-600 border-teal-600 text-white'
                                  : 'border-neutral-300 bg-white'
                              }`}
                            >
                              {item.isPurchased && <Check className="w-3 h-3 stroke-3" />}
                            </button>
                            <span
                              className={`truncate font-medium ${
                                item.isPurchased ? 'line-through' : ''
                              }`}
                            >
                              {item.name}
                            </span>
                            {item.brandTier && (
                              <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-semibold shrink-0">
                                {item.brandTier}
                              </span>
                            )}
                          </div>

                          {/* Quantity & Price Controls with Live Recalculation */}
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center bg-neutral-100 rounded-md p-0.5 text-xs">
                              <button
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded font-bold"
                                title="Decrease"
                              >
                                -
                              </button>
                              <span className="px-1.5 font-mono tabular-nums font-semibold text-neutral-900 text-[11px]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="w-5 h-5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded font-bold"
                                title="Increase"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-mono tabular-nums font-bold text-neutral-800 shrink-0 w-14 text-right">
                              {formatCurrency(item.estimatedPrice)}
                            </span>

                            {onDeleteItem && (
                              <button
                                onClick={() => onDeleteItem(item.id)}
                                className="p-1 text-neutral-300 hover:text-rose-600 rounded transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: CymbalMart Checkout Card */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6 sticky top-20">
            <h3 className="font-bold text-base text-neutral-900 tracking-tight">
              CymbalMart Order Checkout
            </h3>

            {/* Fulfillment Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Fulfillment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('curbside')}
                  className={`p-3 rounded-xl border text-left transition-all text-xs ${
                    fulfillmentType === 'curbside'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-950 font-bold ring-1 ring-teal-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                  }`}
                >
                  <Car className="w-4 h-4 mb-1 text-teal-700" />
                  <div>Curbside Pickup</div>
                  <div className="text-[10px] text-teal-700 font-normal">Free · Store #104</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('delivery')}
                  className={`p-3 rounded-xl border text-left transition-all text-xs ${
                    fulfillmentType === 'delivery'
                      ? 'border-teal-600 bg-teal-50/50 text-teal-950 font-bold ring-1 ring-teal-600'
                      : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                  }`}
                >
                  <Truck className="w-4 h-4 mb-1 text-teal-700" />
                  <div>Same-Day Delivery</div>
                  <div className="text-[10px] text-neutral-500 font-normal">$4.99 Delivery</div>
                </button>
              </div>
            </div>

            {/* Time Slot / Location */}
            {fulfillmentType === 'curbside' ? (
              <div className="space-y-1.5 text-xs">
                <label className="block font-medium text-neutral-700">Pickup Window</label>
                <select
                  value={pickupSlot}
                  onChange={(e) => setPickupSlot(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900 bg-white"
                >
                  <option value="Saturday, 2:00 PM - 3:00 PM">Saturday, 2:00 PM - 3:00 PM</option>
                  <option value="Saturday, 3:00 PM - 4:00 PM">Saturday, 3:00 PM - 4:00 PM</option>
                  <option value="Saturday, 4:00 PM - 5:00 PM">Saturday, 4:00 PM - 5:00 PM</option>
                  <option value="Sunday, 11:00 AM - 12:00 PM">Sunday, 11:00 AM - 12:00 PM</option>
                </select>
                <div className="text-[11px] text-neutral-400">
                  Bay 4 reserved at CymbalMart Central Hub
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 text-xs">
                <label className="block font-medium text-neutral-700">Delivery Address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-neutral-900"
                />
                <div className="text-[11px] text-neutral-400">
                  Temperature-chilled van delivery
                </div>
              </div>
            )}

            {/* Order Cost Breakdown */}
            <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Items Subtotal ({items.length} items)</span>
                <span className="font-mono tabular-nums">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-neutral-600">
                <span>Estimated Sales Tax (8.25%)</span>
                <span className="font-mono tabular-nums">{formatCurrency(estimatedTax)}</span>
              </div>

              {fulfillmentType === 'delivery' && (
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery & Handling</span>
                  <span className="font-mono tabular-nums">$4.99</span>
                </div>
              )}

              {estimatedSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Cymbal Brand Savings</span>
                  </span>
                  <span className="font-mono tabular-nums">-{formatCurrency(estimatedSavings)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-200 flex justify-between text-base font-bold text-neutral-900">
                <span>Final Order Total</span>
                <span className="font-mono tabular-nums">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            {/* Final Checkout CTA */}
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Finalize & Dispatch Order</span>
            </button>

            <div className="text-center text-[11px] text-neutral-400">
              100% Satisfaction Guarantee on Cymbal Fresh produce & meat
            </div>
          </div>
        </div>
      </div>

      {/* Order Finalized Celebration Modal */}
      {isOrderPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-neutral-200 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8 stroke-3" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Order Confirmed · CymbalMart #104
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                Party Shopping Complete!
              </h2>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                Your event plan for <strong>{party.title}</strong> has been converted into a fulfilled CymbalMart order.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 text-left text-xs space-y-2">
              <div className="flex justify-between font-mono">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-bold text-neutral-900">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Fulfillment:</span>
                <span className="font-semibold text-neutral-900">
                  {fulfillmentType === 'curbside' ? `Curbside Bay · ${pickupSlot}` : `Delivery to ${deliveryAddress}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Charged:</span>
                <span className="font-bold font-mono text-teal-800">{formatCurrency(finalTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Total Store Brand Savings:</span>
                <span className="font-mono">+{formatCurrency(estimatedSavings)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Packing Slip</span>
              </button>
              <button
                onClick={() => setOrderPlaced(false)}
                className="flex-1 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
