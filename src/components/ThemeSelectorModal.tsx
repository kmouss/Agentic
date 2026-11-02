import React from 'react';
import { CYMBALMART_TEMPLATES } from '../data/templates.ts';
import { PartyTemplate } from '../types.ts';
import { formatCurrency } from '../utils/partyCalculators.ts';
import { X, Sparkles, Check, Users, Clock, DollarSign } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (template: PartyTemplate) => void;
  currentThemeId: string;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectTheme,
  currentThemeId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              Curated Party Shopping Blueprints
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Select a pre-calculated party theme with optimized multi-store shopping checklists and catering formulas.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CYMBALMART_TEMPLATES.map((tmpl: PartyTemplate) => {
            const isSelected = tmpl.id === currentThemeId;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectTheme(tmpl);
                  onClose();
                }}
                className={`group cursor-pointer rounded-xl border text-left overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
                    <img
                      src={tmpl.bannerImage}
                      alt={tmpl.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-[11px] font-semibold text-amber-300 tracking-wide uppercase">
                        {tmpl.theme}
                      </div>
                      <div className="text-base font-bold leading-snug drop-shadow-xs">
                        {tmpl.title}
                      </div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>

                    {/* Unboxed Metadata row (§1.A Zero-Pill) */}
                    <div className="flex items-center gap-2 text-xs text-neutral-500 pt-1 border-t border-neutral-100 font-medium">
                      <span>{tmpl.defaultAdults + tmpl.defaultKids} Guests</span>
                      <span aria-hidden="true">·</span>
                      <span>{tmpl.defaultDuration} Hours</span>
                      <span aria-hidden="true">·</span>
                      <span>Target: {formatCurrency(tmpl.defaultBudget)}</span>
                    </div>

                    <div className="text-xs text-neutral-500">
                      <strong className="text-neutral-700">Signature: </strong>
                      <span>{tmpl.signatureDrink}</span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500 font-mono tabular-nums">
                    {tmpl.items.length} items configured
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-neutral-950'
                        : 'bg-neutral-900 text-white group-hover:bg-neutral-800'
                    }`}
                  >
                    {isSelected ? 'Active Plan' : 'Select Theme'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
