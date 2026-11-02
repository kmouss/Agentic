import React, { useState } from 'react';
import { PartyConfig, PartyTemplate } from '../types.ts';
import { CYMBALMART_TEMPLATES } from '../data/templates.ts';
import { formatCurrency } from '../utils/partyCalculators.ts';
import {
  Sparkles,
  Users,
  DollarSign,
  Clock,
  Check,
  Wand2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

interface DefineEventStepProps {
  party: PartyConfig;
  onUpdateParty: (updated: Partial<PartyConfig>) => void;
  onApplyTemplate: (template: PartyTemplate) => void;
  onGenerateAIPlan: (concept: {
    theme: string;
    partyType: string;
    budget: number;
    guests: number;
    duration: number;
    dietary: string[];
    specialRequests: string;
  }) => Promise<void>;
  isGeneratingAI: boolean;
  onProceedToReview: () => void;
}

const PARTY_TYPES = [
  'Fiesta & Street Taco Bar',
  'Cocktail & Tapas Lounge',
  'Backyard BBQ & Cookout',
  'Milestone Birthday / Anniversary',
  'Game Day Tailgate & Wings',
  'Kids Birthday & Pizza Bash',
  'Italian Pasta & Spritz Night',
];

const DIETARY_TAGS = [
  'Vegetarian-Friendly',
  'Vegan Options',
  'Gluten-Free Breads/Tortillas',
  'Dairy-Free Options',
  'Nut-Free Safe',
  'Zero-Alcohol / Mocktail Priority',
];

const PREP_SPEEDS = [
  { id: 'fast', label: 'Quick Prep (<30m)', desc: 'Focus on ready-to-serve deli platters and pre-chopped produce' },
  { id: 'standard', label: 'Balanced Host', desc: 'Mix of homemade slow-cooking and store-bought bakery/deli' },
  { id: 'chef', label: 'Culinary Focus', desc: 'Fresh raw ingredients for full scratch cooking' },
];

export const DefineEventStep: React.FC<DefineEventStepProps> = ({
  party,
  onUpdateParty,
  onApplyTemplate,
  onGenerateAIPlan,
  isGeneratingAI,
  onProceedToReview,
}) => {
  const [selectedPartyType, setSelectedPartyType] = useState(party.partyType || PARTY_TYPES[0]);
  const [themeInput, setThemeInput] = useState(party.title);
  const [targetBudget, setTargetBudget] = useState(party.targetBudget);
  const [adults, setAdults] = useState(party.adults);
  const [kids, setKids] = useState(party.kids);
  const [duration, setDuration] = useState(party.durationHours);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(party.dietaryRestrictions || []);
  const [specialRequests, setSpecialRequests] = useState(party.specialRequests || '');
  const [prepSpeed, setPrepSpeed] = useState('standard');

  const totalGuests = adults + kids;
  const perGuestBudget = totalGuests > 0 ? targetBudget / totalGuests : 0;

  const toggleDietary = (item: string) => {
    setSelectedDietary((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSaveAndReview = () => {
    onUpdateParty({
      partyType: selectedPartyType,
      title: themeInput.trim() || `${selectedPartyType} at CymbalMart`,
      targetBudget: Number(targetBudget),
      adults: Number(adults),
      kids: Number(kids),
      drinkingAdults: Math.min(Number(adults), party.drinkingAdults),
      durationHours: Number(duration),
      dietaryRestrictions: selectedDietary,
      specialRequests: `${specialRequests} (Prep style: ${prepSpeed})`,
    });
    onProceedToReview();
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateAIPlan({
      theme: themeInput.trim() || selectedPartyType,
      partyType: selectedPartyType,
      budget: Number(targetBudget),
      guests: Number(totalGuests),
      duration: Number(duration),
      dietary: selectedDietary,
      specialRequests: `${specialRequests} (Prep speed: ${prepSpeed})`,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* CUJ Step 1 Hero & Guidance */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                1
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                Define Your Event & Budget Intent
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-2xl">
              Tell the CymbalMart Shopping Agent what kind of gathering you are hosting. We will convert your guest count, budget, and special requests into a curated shopping list.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={handleSaveAndReview}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <span>Review Curated List</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAISubmit} className="mt-6 space-y-6">
          {/* Party Type & Custom Theme */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Select Party Type or Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PARTY_TYPES.map((pt) => {
                const isSelected = selectedPartyType === pt;
                return (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => {
                      setSelectedPartyType(pt);
                      setThemeInput(pt);
                    }}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-950 font-bold shadow-2xs'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white'
                    }`}
                  >
                    {pt}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Event Title / Theme Description
              </label>
              <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="e.g. Summer Sunset Fiesta on the Patio"
                className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          {/* Core Numbers: Budget, Headcount, Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-neutral-50 rounded-xl border border-neutral-100">
            {/* Total Budget */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-teal-700" />
                  <span>Target Budget ($)</span>
                </span>
                <span className="font-mono tabular-nums text-teal-800 font-bold">
                  {formatCurrency(targetBudget)}
                </span>
              </div>
              <input
                type="number"
                min="30"
                step="10"
                value={targetBudget}
                onChange={(e) => setTargetBudget(Math.max(30, parseInt(e.target.value) || 50))}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-mono tabular-nums text-neutral-900 focus:outline-none focus:border-teal-600"
              />
              <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
                ~{formatCurrency(perGuestBudget)} / guest budget
              </div>
            </div>

            {/* Adults */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-teal-700" />
                  <span>Adult Guests</span>
                </span>
                <span className="font-mono tabular-nums text-neutral-900 font-bold">
                  {adults}
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="100"
                value={adults}
                onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-mono tabular-nums text-neutral-900 focus:outline-none focus:border-teal-600"
              />
              <div className="text-[11px] text-neutral-400">Primary beverage & meal eaters</div>
            </div>

            {/* Kids */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700">Kids & Teens</span>
                <span className="font-mono tabular-nums text-neutral-900 font-bold">
                  {kids}
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="50"
                value={kids}
                onChange={(e) => setKids(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-mono tabular-nums text-neutral-900 focus:outline-none focus:border-teal-600"
              />
              <div className="text-[11px] text-neutral-400">Juices, sodas & finger food</div>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span>Duration</span>
                </span>
                <span className="font-mono tabular-nums text-neutral-900 font-bold">
                  {duration} Hours
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-mono tabular-nums text-neutral-900 focus:outline-none focus:border-teal-600"
              />
              <div className="text-[11px] text-neutral-400">Drives beverage & ice formulas</div>
            </div>
          </div>

          {/* Special Requests: Dietary Accommodations */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Dietary Requirements & Bar Preferences
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DIETARY_TAGS.map((tag) => {
                const checked = selectedDietary.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDietary(tag)}
                    className={`px-3 py-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                      checked
                        ? 'border-teal-600 bg-teal-50/50 text-teal-950 font-semibold'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-white'
                    }`}
                  >
                    <span>{tag}</span>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checked ? 'bg-teal-700 border-teal-700 text-white' : 'border-neutral-300'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Host Prep Style & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                Host Preparation Preference
              </label>
              <div className="space-y-2">
                {PREP_SPEEDS.map((ps) => (
                  <label
                    key={ps.id}
                    onClick={() => setPrepSpeed(ps.id)}
                    className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer text-xs transition-colors ${
                      prepSpeed === ps.id
                        ? 'border-teal-600 bg-teal-50/40 text-teal-950 font-semibold'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="prepSpeed"
                      checked={prepSpeed === ps.id}
                      onChange={() => setPrepSpeed(ps.id)}
                      className="mt-0.5 accent-teal-700"
                    />
                    <div>
                      <div className="font-bold">{ps.label}</div>
                      <div className="text-[11px] text-neutral-500 font-normal">{ps.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                Host Notes & Special Requests
              </label>
              <textarea
                rows={4}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Need eco-friendly bamboo plates, outdoor patio seating, prioritize mocktails for non-drinkers, and keep cleanup fast."
                className="w-full p-3 border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-teal-600 bg-white"
              />
            </div>
          </div>

          {/* Bottom Generation & Blueprint Options */}
          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Grounded in CymbalMart inventory, private brands, and catering math</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={isGeneratingAI}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                {isGeneratingAI ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>AI Curating CymbalMart List...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Generate Curated List</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSaveAndReview}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Review Cart & Budget</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preset Blueprints Strip */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Or Quick-Start With a CymbalMart Curated Blueprint
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CYMBALMART_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => onApplyTemplate(tmpl)}
              className="group cursor-pointer bg-white border border-neutral-200 hover:border-teal-600 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-28 w-full overflow-hidden bg-neutral-100">
                  <img
                    src={tmpl.bannerImage}
                    alt={tmpl.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <div className="text-[10px] font-bold text-teal-300 uppercase tracking-wide">
                      {tmpl.theme}
                    </div>
                    <div className="text-xs font-bold truncate drop-shadow-xs">
                      {tmpl.title}
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-medium">
                    <span>{tmpl.defaultAdults + tmpl.defaultKids} Guests</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums font-bold text-teal-800">
                      {formatCurrency(tmpl.defaultBudget)}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 line-clamp-2 leading-tight">
                    {tmpl.description}
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-neutral-400">
                  {tmpl.items.length} CymbalMart items
                </span>
                <span className="text-[11px] font-bold text-teal-700 group-hover:underline">
                  Load Blueprint →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
