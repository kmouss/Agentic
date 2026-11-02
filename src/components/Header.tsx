import React from 'react';
import { Sparkles, Calendar, CheckSquare, ShoppingCart, Calculator, Bot } from 'lucide-react';

export type AppNavTab = 'define' | 'review' | 'refine' | 'calculator' | 'agent';

interface HeaderProps {
  activeTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  onOpenAIModal: () => void;
  cartItemCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAIModal,
  cartItemCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title wordmark, single element (§2) */}
        <button
          onClick={() => onSelectTab('define')}
          className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 whitespace-nowrap shrink-0 flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
            C
          </span>
          <span className="font-extrabold text-neutral-900 tracking-tight">CymbalMart</span>
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links (§2) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-neutral-600">
          <button
            onClick={() => onSelectTab('define')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'define'
                ? 'text-teal-950 bg-teal-50 font-bold'
                : 'hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-mono">
              1
            </span>
            <span>Define Event</span>
          </button>

          <button
            onClick={() => onSelectTab('review')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'review'
                ? 'text-teal-950 bg-teal-50 font-bold'
                : 'hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-mono">
              2
            </span>
            <span>Review & Align Budget</span>
          </button>

          <button
            onClick={() => onSelectTab('refine')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'refine'
                ? 'text-teal-950 bg-teal-50 font-bold'
                : 'hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-mono">
              3
            </span>
            <span>Refine & Checkout ({cartItemCount})</span>
          </button>

          <span className="h-4 w-px bg-neutral-200 mx-1" aria-hidden="true" />

          <button
            onClick={() => onSelectTab('calculator')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'text-teal-950 bg-teal-50 font-bold'
                : 'hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-neutral-400" />
            <span>Catering Math</span>
          </button>

          <button
            onClick={() => onSelectTab('agent')}
            className={`px-3 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'agent'
                ? 'text-teal-950 bg-teal-50 font-bold'
                : 'hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-teal-600" />
            <span>CymbalMart Assistant</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action (§2) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAIModal}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Quick AI Plan</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 border-t border-neutral-100 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => onSelectTab('define')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'define' ? 'bg-teal-700 text-white' : 'text-neutral-600'
          }`}
        >
          1. Define
        </button>
        <button
          onClick={() => onSelectTab('review')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'review' ? 'bg-teal-700 text-white' : 'text-neutral-600'
          }`}
        >
          2. Review ({cartItemCount})
        </button>
        <button
          onClick={() => onSelectTab('refine')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'refine' ? 'bg-teal-700 text-white' : 'text-neutral-600'
          }`}
        >
          3. Checkout
        </button>
        <button
          onClick={() => onSelectTab('calculator')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'calculator' ? 'bg-teal-700 text-white' : 'text-neutral-600'
          }`}
        >
          Math
        </button>
        <button
          onClick={() => onSelectTab('agent')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 ${
            activeTab === 'agent' ? 'bg-teal-700 text-white' : 'text-neutral-600'
          }`}
        >
          Assistant
        </button>
      </div>
    </header>
  );
};
