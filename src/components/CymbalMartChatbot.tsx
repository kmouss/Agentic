import React, { useState, useRef, useEffect } from 'react';
import { PartyConfig, ShoppingItem, ChatMessage } from '../types.ts';
import { formatCurrency } from '../utils/partyCalculators.ts';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  Check,
  Minimize2,
  Maximize2,
  Store,
  HelpCircle,
  ShoppingBag,
} from 'lucide-react';

interface CymbalMartChatbotProps {
  party: PartyConfig;
  items: ShoppingItem[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const CUSTOMER_PROMPTS = [
  'What aisle is bagged cocktail ice in?',
  'How can I cut $35 from my cart using Cymbal Basics?',
  'How much meat & drinks do I need for 20 guests?',
  'Add 2 packs of gluten-free burger buns to my cart',
  'How does CymbalMart Curbside Pickup work?',
];

export const CymbalMartChatbot: React.FC<CymbalMartChatbotProps> = ({
  party,
  items,
  messages,
  onSendMessage,
  isLoading,
  onAddItem,
  isOpen,
  onToggleOpen,
}) => {
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText('');
    await onSendMessage(msg);
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  // Helper to parse item suggestion actions: [ADD_ITEM: {...}]
  const renderMessageContent = (content: string, msgId: string) => {
    const itemActionRegex = /\[ADD_ITEM:\s*(\{.*?\})\s*\]/g;
    const matches = Array.from(content.matchAll(itemActionRegex));

    if (matches.length === 0) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }

    // Split text and render item buttons
    const cleanContent = content.replace(itemActionRegex, '').trim();

    return (
      <div className="space-y-3">
        <div className="whitespace-pre-wrap">{cleanContent}</div>

        <div className="space-y-2 pt-1 border-t border-neutral-100">
          {matches.map((m, idx) => {
            try {
              const itemData = JSON.parse(m[1]);
              const key = `${msgId}-${idx}`;
              const isAdded = addedItems[key];

              return (
                <div
                  key={key}
                  className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-teal-950 truncate">{itemData.name}</div>
                    <div className="text-[11px] text-teal-800">
                      {itemData.quantity} {itemData.unit} · {itemData.storeRecommendation} · {formatCurrency(itemData.estimatedPrice)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onAddItem({
                        name: itemData.name,
                        category: itemData.category || 'pantry',
                        storeRecommendation: itemData.storeRecommendation || 'Aisle 5 - Pantry & Snacks',
                        brandTier: itemData.brandTier || 'Cymbal Basics',
                        quantity: Number(itemData.quantity) || 1,
                        unit: itemData.unit || 'pack',
                        estimatedPrice: Number(itemData.estimatedPrice) || 4.99,
                        customItem: true,
                      });
                      setAddedItems((prev) => ({ ...prev, [key]: true }));
                    }}
                    disabled={isAdded}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-teal-700 hover:bg-teal-800 text-white shadow-2xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              );
            } catch (err) {
              return null;
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Toggle Launcher Button */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-2xl shadow-xl flex items-center gap-3 transition-all duration-200 hover:scale-105 group border border-teal-600"
          aria-label="Open CymbalMart Assistant Chat"
        >
          <div className="relative">
            <span className="w-8 h-8 rounded-xl bg-white text-teal-800 flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-5 h-5 text-teal-700" />
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-teal-700 rounded-full" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold leading-tight">CymbalMart Assistant</div>
            <div className="text-[10px] text-teal-200">Store #104 · Ask anything</div>
          </div>
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 ${
            isExpanded
              ? 'bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:w-[620px] h-[82vh]'
              : 'bottom-6 right-6 w-full max-w-[390px] sm:max-w-[420px] h-[580px]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-teal-800 text-white flex items-center justify-between border-b border-teal-900">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white text-teal-800 flex items-center justify-center font-bold shadow-2xs">
                <Bot className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <span>CymbalMart Assistant</span>
                </div>
                <div className="text-[10px] text-teal-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Store #104 Customer Service · Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-7 h-7 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700 flex items-center justify-center transition-colors"
                title={isExpanded ? 'Collapse' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onToggleOpen}
                className="w-7 h-7 rounded-lg text-teal-200 hover:text-white hover:bg-teal-700 flex items-center justify-center transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Summary Header */}
          <div className="px-3.5 py-1.5 bg-teal-50 border-b border-teal-100 flex items-center justify-between text-[11px] text-teal-900 font-medium">
            <span className="truncate">
              Cart: {items.length} items · {formatCurrency(items.reduce((s, i) => s + i.estimatedPrice, 0))}
            </span>
            <span className="font-mono tabular-nums text-teal-700">
              Budget: {formatCurrency(party.targetBudget)}
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-neutral-50/60 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      isUser
                        ? 'bg-neutral-900 text-white'
                        : 'bg-teal-700 text-white'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-neutral-900 text-white rounded-tr-xs'
                        : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-xs'
                    }`}
                  >
                    {renderMessageContent(msg.content, msg.id)}
                    <div
                      className={`text-[9px] font-mono mt-1 ${
                        isUser ? 'text-neutral-400 text-right' : 'text-neutral-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs text-neutral-500 flex items-center gap-2 shadow-2xs">
                  <div className="w-3.5 h-3.5 border-2 border-teal-600/30 border-t-teal-700 rounded-full animate-spin" />
                  <span>CymbalMart Assistant is searching inventory...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Suggestions Bar */}
          <div className="p-2 bg-white border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-neutral-400 font-medium px-1 shrink-0">Ask:</span>
            {CUSTOMER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-teal-50 hover:text-teal-900 text-neutral-600 transition-colors whitespace-nowrap shrink-0 disabled:opacity-40"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSend}
            className="p-2.5 bg-white border-t border-neutral-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask CymbalMart Assistant about aisles, items, budget..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 bg-neutral-100 border border-transparent focus:border-teal-600 focus:bg-white rounded-xl text-xs text-neutral-900 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-8 h-8 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
