import React, { useState, useRef, useEffect } from 'react';
import { PartyConfig, ShoppingItem, ChatMessage } from '../types.ts';
import { Bot, Send, User, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface AgentChatViewProps {
  party: PartyConfig;
  items: ShoppingItem[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onAddItem?: (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => void;
}

const QUICK_PROMPTS = [
  'What aisle is bagged cocktail ice in at Store #104?',
  'How can I cut $40 from this party budget using Cymbal Basics?',
  'Suggest a batchable signature cocktail & matching mocktail for this theme',
  'I have 3 vegetarian and 2 gluten-free guests—what specific swaps should I make?',
  'Add 2 packs of Cymbal Fresh Brioche Buns to my cart',
];

export const AgentChatView: React.FC<AgentChatViewProps> = ({
  party,
  items,
  messages,
  onSendMessage,
  isLoading,
  onAddItem,
}) => {
  const [inputText, setInputText] = useState('');
  const [addedKeys, setAddedKeys] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(text);
  };

  const handleQuickPromptClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  const renderContent = (content: string, msgId: string) => {
    const itemActionRegex = /\[ADD_ITEM:\s*(\{.*?\})\s*\]/g;
    const matches = Array.from(content.matchAll(itemActionRegex));

    if (matches.length === 0) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }

    const cleanContent = content.replace(itemActionRegex, '').trim();

    return (
      <div className="space-y-3">
        <div className="whitespace-pre-wrap">{cleanContent}</div>

        {onAddItem && (
          <div className="space-y-2 pt-2 border-t border-neutral-100">
            {matches.map((m, idx) => {
              try {
                const itemData = JSON.parse(m[1]);
                const key = `${msgId}-${idx}`;
                const isAdded = addedKeys[key];

                return (
                  <div
                    key={key}
                    className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-teal-950">{itemData.name}</div>
                      <div className="text-[11px] text-teal-800">
                        {itemData.quantity} {itemData.unit} · {itemData.storeRecommendation} · ${itemData.estimatedPrice}
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
                        setAddedKeys((prev) => ({ ...prev, [key]: true }));
                      }}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-teal-700 hover:bg-teal-800 text-white shadow-2xs'
                      }`}
                    >
                      {isAdded ? 'Added to Cart!' : '+ Add to Cart'}
                    </button>
                  </div>
                );
              } catch (err) {
                return null;
              }
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-[640px]">
      {/* Agent Banner */}
      <div className="p-4 bg-teal-900 text-white flex items-center justify-between border-b border-teal-950">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-teal-800 flex items-center justify-center font-bold shadow-xs">
            <Bot className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>CymbalMart Assistant</span>
              <span className="text-[10px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded-full font-medium">Store #104</span>
            </div>
            <div className="text-xs text-teal-200">
              Customer support & party shopping advisor grounded in your {party.adults + party.kids}-guest plan
            </div>
          </div>
        </div>

        <div className="text-xs text-neutral-400 font-mono tabular-nums hidden sm:block">
          {items.length} items on shopping list
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-neutral-50/50">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-neutral-900 text-white'
                    : 'bg-teal-700 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-800 shadow-2xs'
                }`}
              >
                {renderContent(msg.content, msg.id)}
                <div
                  className={`text-[10px] font-mono tabular-nums ${
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
          <div className="flex gap-3 max-w-2xl">
            <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-xs text-neutral-500 flex items-center gap-2 shadow-2xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>CymbalMart Assistant is searching inventory & calculations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Queries */}
      <div className="p-3 bg-white border-t border-neutral-100 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-neutral-400 shrink-0 font-medium px-1">Try:</span>
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickPromptClick(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask Festivo about budget cuts, recipe quantities, store routes..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-3.5 py-2.5 bg-neutral-100 border border-transparent focus:border-amber-500 focus:bg-white rounded-lg text-xs text-neutral-900 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
};
