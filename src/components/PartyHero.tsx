import React, { useState } from 'react';
import { PartyConfig } from '../types.ts';
import { formatCurrency } from '../utils/partyCalculators.ts';
import { Users, Clock, DollarSign, Sparkles, Layers, Sliders, Check } from 'lucide-react';

interface PartyHeroProps {
  party: PartyConfig;
  currentTotalCost: number;
  onUpdateParty: (updated: Partial<PartyConfig>) => void;
  onOpenThemeSelector: () => void;
}

export const PartyHero: React.FC<PartyHeroProps> = ({
  party,
  currentTotalCost,
  onUpdateParty,
  onOpenThemeSelector,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempAdults, setTempAdults] = useState(party.adults);
  const [tempKids, setTempKids] = useState(party.kids);
  const [tempDuration, setTempDuration] = useState(party.durationHours);
  const [tempBudget, setTempBudget] = useState(party.targetBudget);

  const totalGuests = party.adults + party.kids;
  const budgetRatio = party.targetBudget > 0 ? (currentTotalCost / party.targetBudget) * 100 : 0;
  const isOverBudget = currentTotalCost > party.targetBudget;

  const handleSave = () => {
    onUpdateParty({
      adults: Number(tempAdults),
      kids: Number(tempKids),
      drinkingAdults: Math.min(Number(tempAdults), party.drinkingAdults),
      durationHours: Number(tempDuration),
      targetBudget: Number(tempBudget),
    });
    setIsEditing(false);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-neutral-900 text-white shadow-lg mb-8 border border-neutral-800">
      {/* Background Image with Measured Contrast Scrim */}
      <div className="absolute inset-0">
        <img
          src={party.bannerImage}
          alt={party.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-40 brightness-75 scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            // Styled graceful CSS fallback
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-900/40" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          {/* Main Title & Metadata */}
          <div className="max-w-3xl space-y-3">
            {/* Unboxed Metadata with Typographic Separator (§1.A Zero-Pill) */}
            <div className="flex items-center gap-2 text-xs font-medium text-amber-300 tracking-wide">
              <span>{party.theme}</span>
              <span aria-hidden="true" className="text-neutral-500">·</span>
              <span>{party.durationHours} Hours Gathering</span>
              <span aria-hidden="true" className="text-neutral-500">·</span>
              <span>{totalGuests} Guests Planned</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white text-balance">
              {party.title}
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
              {party.tagline}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenThemeSelector}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Browse Themes</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEditing ? 'Close Setup' : 'Tune Numbers'}</span>
            </button>
          </div>
        </div>

        {/* Editing drawer for quick party parameters */}
        {isEditing && (
          <div className="mt-6 p-4 sm:p-5 bg-neutral-900/90 border border-neutral-700/80 rounded-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
              <div>
                <label className="block text-neutral-400 mb-1">Adults</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={tempAdults}
                  onChange={(e) => setTempAdults(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white font-mono tabular-nums text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Kids / Teens</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tempKids}
                  onChange={(e) => setTempKids(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white font-mono tabular-nums text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Duration (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={tempDuration}
                  onChange={(e) => setTempDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white font-mono tabular-nums text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Target Budget ($)</label>
                <input
                  type="number"
                  min="20"
                  step="10"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(Math.max(20, parseInt(e.target.value) || 50))}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg text-white font-mono tabular-nums text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Changes & Recalculate</span>
              </button>
            </div>
          </div>
        )}

        {/* 4-Stat Strip */}
        <div className="mt-8 pt-6 border-t border-neutral-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">Headcount</div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-white">
                {totalGuests} <span className="text-xs font-normal text-neutral-400">({party.adults}A · {party.kids}K)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">Duration</div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-white">
                {party.durationHours} Hours
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-medium">Estimated Cart</div>
              <div className="text-base sm:text-lg font-bold font-mono tabular-nums text-white">
                {formatCurrency(currentTotalCost)}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-400 font-medium">Budget Target</span>
              <span className={`font-mono tabular-nums font-semibold ${isOverBudget ? 'text-rose-400' : 'text-amber-400'}`}>
                {formatCurrency(party.targetBudget)}
              </span>
            </div>
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOverBudget ? 'bg-rose-500' : budgetRatio > 85 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, budgetRatio))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
