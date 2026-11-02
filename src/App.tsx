import React, { useState } from 'react';
import {
  PartyConfig,
  ShoppingItem,
  TimelineTask,
  ChatMessage,
  PartyTemplate,
  BrandTier,
} from './types.ts';
import { CYMBALMART_TEMPLATES } from './data/templates.ts';
import { Header, AppNavTab } from './components/Header.tsx';
import { DefineEventStep } from './components/DefineEventStep.tsx';
import { ReviewListStep } from './components/ReviewListStep.tsx';
import { RefineCheckoutStep } from './components/RefineCheckoutStep.tsx';
import { CalculatorView } from './components/CalculatorView.tsx';
import { AgentChatView } from './components/AgentChatView.tsx';
import { CymbalMartChatbot } from './components/CymbalMartChatbot.tsx';
import { VoiceController } from './components/VoiceController.tsx';
import { AIPlanModal } from './components/AIPlanModal.tsx';
import { ThemeSelectorModal } from './components/ThemeSelectorModal.tsx';
import confetti from 'canvas-confetti';

const DEFAULT_TEMPLATE = CYMBALMART_TEMPLATES[0];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppNavTab>('define');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Party Configuration for CymbalMart
  const [party, setParty] = useState<PartyConfig>(() => {
    return {
      id: DEFAULT_TEMPLATE.id,
      title: DEFAULT_TEMPLATE.title,
      partyType: 'Fiesta & Street Taco Bar',
      theme: DEFAULT_TEMPLATE.theme,
      tagline: DEFAULT_TEMPLATE.tagline,
      date: 'This Saturday',
      time: '6:30 PM',
      durationHours: DEFAULT_TEMPLATE.defaultDuration,
      adults: DEFAULT_TEMPLATE.defaultAdults,
      kids: DEFAULT_TEMPLATE.defaultKids,
      drinkingAdults: DEFAULT_TEMPLATE.defaultAdults,
      targetBudget: DEFAULT_TEMPLATE.defaultBudget,
      specialRequests: 'Include vegetarian options, fast prep under 45 minutes.',
      dietaryRestrictions: DEFAULT_TEMPLATE.dietaryTags,
      bannerImage: DEFAULT_TEMPLATE.bannerImage,
      notes: DEFAULT_TEMPLATE.description,
    };
  });

  // Shopping Items
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>(() => {
    return DEFAULT_TEMPLATE.items.map((item, idx) => ({
      ...item,
      id: `item-${idx}-${Date.now()}`,
      isPurchased: false,
    }));
  });

  // Timeline Tasks
  const [timelineTasks, setTimelineTasks] = useState<TimelineTask[]>(() => {
    return DEFAULT_TEMPLATE.timeline.map((tl, idx) => ({
      id: `task-${idx}`,
      timeframe: tl.timeframe,
      task: tl.task,
      category: tl.category,
      completed: false,
    }));
  });

  // Chat Messages for CymbalMart Assistant
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'agent',
      content: `Hello! I'm CymbalMart Assistant, your in-store & online customer chatbot.\n\nI can help you navigate aisles at Store #104, find ingredients, calculate party catering formulas, and suggest budget swaps with Cymbal Basics.\n\nAsk me anything or tap one of the suggested prompts below!`,
      timestamp: 'Just now',
    },
  ]);

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const currentTotalCost = shoppingItems.reduce(
    (sum, item) => sum + item.estimatedPrice,
    0
  );

  // Item Handlers
  const handleToggleItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPurchased: !item.isPurchased } : item
      )
    );
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setShoppingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          const unitPrice = item.unitPrice || (item.estimatedPrice / item.quantity);
          return {
            ...item,
            quantity: newQty,
            unitPrice: unitPrice,
            estimatedPrice: Math.round(unitPrice * newQty * 100) / 100,
          };
        }
        return item;
      })
    );
  };

  const handleSetQuantity = (id: string, newQty: number) => {
    const validQty = Math.max(1, newQty);
    setShoppingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const unitPrice = item.unitPrice || (item.estimatedPrice / item.quantity);
          return {
            ...item,
            quantity: validQty,
            unitPrice: unitPrice,
            estimatedPrice: Math.round(unitPrice * validQty * 100) / 100,
          };
        }
        return item;
      })
    );
  };

  const handleUpdatePrice = (id: string, newPrice: number) => {
    const validPrice = Math.max(0, newPrice);
    setShoppingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const unitPrice = item.quantity > 0 ? validPrice / item.quantity : validPrice;
          return {
            ...item,
            estimatedPrice: validPrice,
            unitPrice: Math.round(unitPrice * 100) / 100,
          };
        }
        return item;
      })
    );
  };

  const handleUpdateItem = (id: string, updates: Partial<ShoppingItem>) => {
    setShoppingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const merged = { ...item, ...updates };
          if (updates.quantity !== undefined && updates.quantity !== item.quantity) {
            const unitPrice = item.unitPrice || (item.estimatedPrice / item.quantity);
            merged.estimatedPrice = Math.round(unitPrice * updates.quantity * 100) / 100;
          }
          return merged;
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (item: Omit<ShoppingItem, 'id' | 'isPurchased'>) => {
    const newItem: ShoppingItem = {
      ...item,
      id: `item-custom-${Date.now()}`,
      isPurchased: false,
    };
    setShoppingItems((prev) => [newItem, ...prev]);
  };

  const handleUpdateParty = (updated: Partial<PartyConfig>) => {
    setParty((prev) => ({ ...prev, ...updated }));
  };

  // Switch to Template
  const handleApplyTemplate = (template: PartyTemplate) => {
    setParty({
      id: template.id,
      title: template.title,
      partyType: template.theme,
      theme: template.theme,
      tagline: template.tagline,
      date: 'This Saturday',
      time: '6:30 PM',
      durationHours: template.defaultDuration,
      adults: template.defaultAdults,
      kids: template.defaultKids,
      drinkingAdults: template.defaultAdults,
      targetBudget: template.defaultBudget,
      specialRequests: '',
      dietaryRestrictions: template.dietaryTags,
      bannerImage: template.bannerImage,
      notes: template.description,
    });

    setShoppingItems(
      template.items.map((item, idx) => ({
        ...item,
        id: `item-${template.id}-${idx}-${Date.now()}`,
        isPurchased: false,
      }))
    );

    setTimelineTasks(
      template.timeline.map((tl, idx) => ({
        id: `task-${template.id}-${idx}`,
        timeframe: tl.timeframe,
        task: tl.task,
        category: tl.category,
        completed: false,
      }))
    );

    setActiveTab('review');
  };

  // Auto-Tune to Budget Action (Task 2 Requirement)
  const handleAutoTuneBudget = () => {
    const target = party.targetBudget;
    let current = currentTotalCost;

    if (current <= target) {
      alert(`Your cart is already within budget! Current total: $${current.toFixed(2)} vs target $${target}.`);
      return;
    }

    // Step 1: Swap national brand items to Cymbal Basics (shaves ~25%)
    let updatedItems = shoppingItems.map((item) => {
      if (item.brandTier === 'National Brand' || item.brandTier === 'Cymbal Select') {
        const discountedPrice = Math.round(item.estimatedPrice * 0.72 * 100) / 100;
        return {
          ...item,
          name: item.name.replace(/^[^a-zA-Z0-9]+/, '').replace(/(National Brand|Select)/, 'Cymbal Basics'),
          brandTier: 'Cymbal Basics' as BrandTier,
          estimatedPrice: discountedPrice,
          notes: (item.notes ? item.notes + ' ' : '') + '(Swapped to Cymbal Basics for savings)',
        };
      }
      return item;
    });

    current = updatedItems.reduce((sum, item) => sum + item.estimatedPrice, 0);

    // Step 2: If still over, scale non-beverage quantities
    if (current > target) {
      const excess = current - target;
      const factor = Math.max(0.85, target / current);
      updatedItems = updatedItems.map((item) => {
        if (item.category === 'pantry' || item.category === 'decor' || item.category === 'tableware') {
          return {
            ...item,
            estimatedPrice: Math.round(item.estimatedPrice * factor * 100) / 100,
          };
        }
        return item;
      });
    }

    setShoppingItems(updatedItems);
  };

  // Quick Trim Budget
  const handleQuickTrimBudget = (amount: number) => {
    const factor = Math.max(0.7, (currentTotalCost - amount) / currentTotalCost);
    setShoppingItems((prev) =>
      prev.map((item) => ({
        ...item,
        estimatedPrice: Math.round(item.estimatedPrice * factor * 100) / 100,
      }))
    );
  };

  // Brand Tier Global Strategy (Task 3 Requirement)
  const handleApplyBrandStrategy = (strategy: 'basics' | 'balanced' | 'select') => {
    setShoppingItems((prev) =>
      prev.map((item) => {
        if (strategy === 'basics') {
          const newPrice = Math.round(item.estimatedPrice * 0.8 * 100) / 100;
          return { ...item, brandTier: 'Cymbal Basics', estimatedPrice: newPrice };
        } else if (strategy === 'select') {
          const newPrice = Math.round(item.estimatedPrice * 1.25 * 100) / 100;
          return { ...item, brandTier: 'Cymbal Select', estimatedPrice: newPrice };
        } else {
          // Balanced
          const isProduce = item.category === 'produce' || item.category === 'proteins';
          return {
            ...item,
            brandTier: isProduce ? 'Cymbal Fresh' : 'Cymbal Basics',
          };
        }
      })
    );
  };

  const handleTriggerCheckout = () => {
    setActiveTab('refine');
    setIsOrderPlaced(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // AI Plan Generation
  const handleGenerateAIPlan = async (concept: {
    theme: string;
    partyType: string;
    budget: number;
    guests: number;
    duration: number;
    dietary: string[];
    specialRequests: string;
  }) => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/agent/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: concept.theme,
          guestCount: concept.guests,
          durationHours: concept.duration,
          targetBudget: concept.budget,
          dietary: concept.dietary,
          prompt: `${concept.specialRequests} (Party Type: ${concept.partyType})`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate plan');
      }

      const plan = await response.json();

      const newItems: ShoppingItem[] = Array.isArray(plan.shoppingList)
        ? plan.shoppingList.map((item: any, idx: number) => ({
            id: `ai-cymbal-${Date.now()}-${idx}`,
            name: item.name || 'Cymbal Item',
            category: item.category || 'pantry',
            quantity: item.quantity || 1,
            unit: item.unit || 'pack',
            estimatedPrice: item.estimatedPrice || 5.99,
            storeRecommendation: item.storeRecommendation || 'Aisle 5 - Pantry & Snacks',
            brandTier: (item.brandTier as BrandTier) || 'Cymbal Basics',
            notes: item.notes || undefined,
            dietaryTag: item.dietaryTag || undefined,
            isPurchased: false,
          }))
        : [];

      const newTimeline: TimelineTask[] = Array.isArray(plan.timelineSteps)
        ? plan.timelineSteps.map((step: any, idx: number) => ({
            id: `ai-task-${Date.now()}-${idx}`,
            timeframe: step.timeframe || '1 Day Before',
            task: step.task || 'Prepare supplies',
            category: step.category || 'Prep',
            completed: false,
          }))
        : [];

      setParty({
        id: `custom-${Date.now()}`,
        title: plan.themeTitle || concept.theme,
        partyType: concept.partyType,
        theme: concept.partyType,
        tagline: plan.tagline || plan.summary || 'A curated CymbalMart gathering',
        date: 'This Weekend',
        time: '6:30 PM',
        durationHours: concept.duration,
        adults: concept.guests,
        kids: 0,
        drinkingAdults: concept.guests,
        targetBudget: concept.budget,
        specialRequests: concept.specialRequests,
        dietaryRestrictions: concept.dietary,
        bannerImage: '/src/assets/images/hero_party_table_1793643780168.jpg',
        notes: plan.summary || '',
      });

      setShoppingItems(newItems);
      setTimelineTasks(newTimeline);

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-intro-${Date.now()}`,
          role: 'agent',
          content: `🎉 I've converted your event intent into a curated CymbalMart list for "${plan.themeTitle}"!\n\n• Target Budget: $${concept.budget}\n• Estimated Cart Total: $${plan.estimatedTotalCost || concept.budget}\n• ${newItems.length} items mapped to CymbalMart aisles\n• Signature drink: "${plan.beverageSummary?.signatureDrinkName || 'Signature Punch'}" with ${plan.beverageSummary?.iceLbsNeeded || 20} lbs ice.`,
          timestamp: 'Just now',
        },
      ]);

      // Move directly to Step 2: Review List
      setActiveTab('review');
    } catch (err: any) {
      console.error(err);
      alert('Could not reach the AI agent. Please try again or pick a curated blueprint.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Chat message sending
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const partyContext = {
        themeTitle: party.title,
        theme: party.theme,
        guestCount: party.adults + party.kids,
        adults: party.adults,
        kids: party.kids,
        durationHours: party.durationHours,
        targetBudget: party.targetBudget,
        currentTotal: currentTotalCost,
        itemCount: shoppingItems.length,
        dietaryRestrictions: party.dietaryRestrictions,
      };

      const history = chatMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          partyContext,
        }),
      });

      if (!res.ok) throw new Error('Agent failed');

      const data = await res.json();
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: data.reply || "I've reviewed your request. You can check the cart or refine constraints anytime!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'agent',
        content: 'Brief connection glitch with the CymbalMart AI engine. Please retry!',
        timestamp: 'Just now',
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleConsultAgent = (prompt: string) => {
    setIsChatbotOpen(true);
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Top Bar Contract with 3-Step CUJ Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        cartItemCount={shoppingItems.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Step 1: Define Event */}
        {activeTab === 'define' && (
          <DefineEventStep
            party={party}
            onUpdateParty={handleUpdateParty}
            onApplyTemplate={handleApplyTemplate}
            onGenerateAIPlan={handleGenerateAIPlan}
            isGeneratingAI={isGeneratingAI}
            onProceedToReview={() => setActiveTab('review')}
          />
        )}

        {/* Step 2: Review List (Align with total budget) */}
        {activeTab === 'review' && (
          <ReviewListStep
            party={party}
            items={shoppingItems}
            onToggleItem={handleToggleItem}
            onUpdateQuantity={handleUpdateQuantity}
            onSetQuantity={handleSetQuantity}
            onUpdatePrice={handleUpdatePrice}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={handleAddItem}
            onAutoTuneBudget={handleAutoTuneBudget}
            onQuickTrimBudget={handleQuickTrimBudget}
            onBackToDefine={() => setActiveTab('define')}
            onProceedToRefine={() => setActiveTab('refine')}
          />
        )}

        {/* Step 3: Refine & Checkout (Adjust for constraints and finalize plan) */}
        {activeTab === 'refine' && (
          <RefineCheckoutStep
            party={party}
            items={shoppingItems}
            onToggleItem={handleToggleItem}
            onUpdateQuantity={handleUpdateQuantity}
            onDeleteItem={handleDeleteItem}
            onApplyBrandStrategy={handleApplyBrandStrategy}
            onBackToReview={() => setActiveTab('review')}
            onConsultAgent={handleConsultAgent}
            isOrderPlaced={isOrderPlaced}
            onSetOrderPlaced={setIsOrderPlaced}
          />
        )}

        {/* Auxiliary Tab: Catering Formulas & Hospitality Math */}
        {activeTab === 'calculator' && (
          <CalculatorView
            party={party}
            onUpdateParty={handleUpdateParty}
            onApplyCalculationsToList={(newCalculated) => {
              setShoppingItems((prev) => [
                ...newCalculated.map((it) => ({
                  ...it,
                  id: `calc-${Date.now()}-${Math.random()}`,
                  isPurchased: false,
                })),
                ...prev,
              ]);
              setActiveTab('review');
            }}
          />
        )}

        {/* Auxiliary Tab: AI Consultation Agent */}
        {activeTab === 'agent' && (
          <AgentChatView
            party={party}
            items={shoppingItems}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            onAddItem={handleAddItem}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-800">CymbalMart</span>
            <span aria-hidden="true">·</span>
            <span>Party Planner Shopping Agent</span>
            <span aria-hidden="true">·</span>
            <span>Critical User Journey: Define → Review → Refine & Checkout</span>
          </div>

          <div className="flex items-center gap-3 text-neutral-400">
            <span>Store #104 Curbside</span>
            <span aria-hidden="true">·</span>
            <span>Same-Day Perishable Guarantee</span>
          </div>
        </div>
      </footer>

      {/* Quick AI Plan Modal */}
      <AIPlanModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyGeneratedPlan={(plan) => {
          handleGenerateAIPlan({
            theme: plan.themeTitle || 'Custom Party',
            partyType: 'Celebration',
            budget: plan.targetBudget || 250,
            guests: plan.adults || 16,
            duration: plan.durationHours || 4,
            dietary: [],
            specialRequests: plan.summary || '',
          });
        }}
      />

      {/* Persistent Customer-Facing CymbalMart Assistant Chatbot */}
      <CymbalMartChatbot
        party={party}
        items={shoppingItems}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
        onAddItem={handleAddItem}
        isOpen={isChatbotOpen}
        onToggleOpen={() => setIsChatbotOpen(!isChatbotOpen)}
      />

      {/* Hands-Free Voice Control HUD for Full Hands-Free Flow */}
      <VoiceController
        party={party}
        items={shoppingItems}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onUpdateParty={handleUpdateParty}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        onAutoTuneBudget={handleAutoTuneBudget}
        onQuickTrimBudget={handleQuickTrimBudget}
        onApplyBrandStrategy={handleApplyBrandStrategy}
        onCheckout={handleTriggerCheckout}
      />
    </div>
  );
}
