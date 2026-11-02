import React, { useState } from 'react';
import { Sparkles, X, RefreshCw, AlertCircle, Wand2, Check } from 'lucide-react';

interface AIPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedPlan: (plan: any) => void;
}

const DIETARY_OPTIONS = [
  'Vegetarian-Friendly',
  'Vegan Options',
  'Gluten-Free Tortillas/Breads',
  'Dairy-Free Options',
  'Nut-Free Safe',
  'Zero-Alcohol / Mocktail Priority',
];

const EXAMPLE_CONCEPTS = [
  'Mediterranean Greek Mezze & Wine Night for 18 adults',
  '80s Retro Pizza & Craft Brews Game Night for 14 friends',
  'Sunday French Crêpes & Mimosas Brunch for 12 guests',
  'Gourmet Slider & Craft Beer Cookout for 22 guests',
];

export const AIPlanModal: React.FC<AIPlanModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedPlan,
}) => {
  const [theme, setTheme] = useState('');
  const [guestCount, setGuestCount] = useState(16);
  const [durationHours, setDurationHours] = useState(4);
  const [targetBudget, setTargetBudget] = useState(250);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [promptNotes, setPromptNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleDietary = (opt: string) => {
    setSelectedDietary((prev) =>
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/agent/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme.trim(),
          guestCount: Number(guestCount),
          durationHours: Number(durationHours),
          targetBudget: Number(targetBudget),
          dietary: selectedDietary,
          prompt: promptNotes.trim(),
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to generate party plan');
      }

      const planData = await response.json();
      onApplyGeneratedPlan({
        ...planData,
        adults: Number(guestCount),
        kids: 0,
        durationHours: Number(durationHours),
        targetBudget: Number(targetBudget),
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong while communicating with the AI Agent.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-neutral-950 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-neutral-950" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                AI Custom Party Plan Generator
              </h2>
              <p className="text-xs text-neutral-500">
                Powered by Gemini 3.8 Flash catering & grocery calculation models
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleGenerate} className="p-6 overflow-y-auto space-y-5 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Theme / Occasion Concept */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-800">
              Event Concept or Theme <span className="text-amber-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Italian Pizza & Spritz Garden Party, 90s Grunge Tailgate, Sunset Tapas"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:border-amber-500 disabled:bg-neutral-50"
            />
            {/* Quick Inspiration Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
              <span className="text-[11px] text-neutral-400 shrink-0">Inspiration:</span>
              {EXAMPLE_CONCEPTS.map((ex, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setTheme(ex)}
                  className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 text-[11px] transition-colors whitespace-nowrap shrink-0"
                >
                  {ex.split(' for ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Numerical Inputs: Headcount, Duration, Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Guest Headcount
              </label>
              <input
                type="number"
                min="2"
                max="100"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(2, parseInt(e.target.value) || 2))}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono tabular-nums text-sm text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={durationHours}
                onChange={(e) => setDurationHours(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono tabular-nums text-sm text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Target Budget ($)
              </label>
              <input
                type="number"
                min="30"
                step="10"
                value={targetBudget}
                onChange={(e) => setTargetBudget(Math.max(30, parseInt(e.target.value) || 50))}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-neutral-200 rounded-lg font-mono tabular-nums text-sm text-neutral-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Dietary Checkboxes */}
          <div className="space-y-2">
            <label className="block font-semibold text-neutral-800">
              Dietary Preferences & Bar Focus
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DIETARY_OPTIONS.map((opt) => {
                const checked = selectedDietary.includes(opt);
                return (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => toggleDietary(opt)}
                    disabled={isLoading}
                    className={`px-3 py-2 rounded-lg border text-left transition-colors flex items-center justify-between text-xs ${
                      checked
                        ? 'border-amber-500 bg-amber-50/40 text-neutral-900 font-semibold'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600 bg-white'
                    }`}
                  >
                    <span>{opt}</span>
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checked ? 'bg-amber-500 border-amber-500 text-white' : 'border-neutral-300'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 stroke-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Notes */}
          <div className="space-y-1">
            <label className="block font-semibold text-neutral-800">
              Host Notes & Desired Vibes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Outdoor patio setting, include mocktails for non-drinkers, keep prep under 1 hour."
              value={promptNotes}
              onChange={(e) => setPromptNotes(e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-amber-500 disabled:bg-neutral-50"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs text-neutral-500 hover:text-neutral-700 font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !theme.trim()}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Calculating Catering & Shopping List...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate Complete Party Blueprint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
