import { ShoppingItem, PartyConfig, BrandTier } from '../types.ts';

export interface ParsedVoiceCommand {
  type:
    | 'NAVIGATE'
    | 'SET_BUDGET'
    | 'SET_GUESTS'
    | 'SET_DURATION'
    | 'SET_THEME'
    | 'AUTO_TUNE'
    | 'TRIM_BUDGET'
    | 'SET_BRAND_STRATEGY'
    | 'SET_FULFILLMENT'
    | 'PLACE_ORDER'
    | 'ADD_ITEM'
    | 'REMOVE_ITEM'
    | 'ADJUST_QUANTITY'
    | 'STATUS_QUERY'
    | 'READ_LIST'
    | 'UNKNOWN';
  payload?: any;
  feedbackText: string;
}

export function parseVoiceCommand(
  rawTranscript: string,
  party: PartyConfig,
  items: ShoppingItem[]
): ParsedVoiceCommand {
  const text = rawTranscript.toLowerCase().trim();

  // 1. Navigation Commands
  if (text.includes('go to define') || text.includes('define event') || text.includes('step one') || text.includes('step 1')) {
    return {
      type: 'NAVIGATE',
      payload: 'define',
      feedbackText: 'Navigating to Step 1: Define Event.',
    };
  }

  if (text.includes('review list') || text.includes('review cart') || text.includes('check budget') || text.includes('step two') || text.includes('step 2')) {
    return {
      type: 'NAVIGATE',
      payload: 'review',
      feedbackText: 'Navigating to Step 2: Review List and Budget.',
    };
  }

  if (text.includes('checkout') || text.includes('refine') || text.includes('finalize') || text.includes('step three') || text.includes('step 3')) {
    return {
      type: 'NAVIGATE',
      payload: 'refine',
      feedbackText: 'Navigating to Step 3: Refine and Checkout.',
    };
  }

  if (text.includes('calculator') || text.includes('catering math') || text.includes('drink formula')) {
    return {
      type: 'NAVIGATE',
      payload: 'calculator',
      feedbackText: 'Opening catering quantity formulas.',
    };
  }

  // 2. Budget Tuning & Alignment
  if (text.includes('auto tune') || text.includes('align budget') || text.includes('balance budget') || text.includes('fit budget') || text.includes('make it fit')) {
    return {
      type: 'AUTO_TUNE',
      feedbackText: 'Auto-aligning cart to your budget using Cymbal Basics swaps.',
    };
  }

  if (text.includes('trim 25') || text.includes('cut 25') || text.includes('save 25')) {
    return {
      type: 'TRIM_BUDGET',
      payload: 25,
      feedbackText: 'Trimming 25 dollars from your shopping list.',
    };
  }

  if (text.includes('trim 50') || text.includes('cut 50') || text.includes('save 50')) {
    return {
      type: 'TRIM_BUDGET',
      payload: 50,
      feedbackText: 'Trimming 50 dollars from your shopping list.',
    };
  }

  // 3. Brand Strategy Commands
  if (text.includes('cymbal basics') || text.includes('maximum savings') || text.includes('switch to basics') || text.includes('cheapest')) {
    return {
      type: 'SET_BRAND_STRATEGY',
      payload: 'basics',
      feedbackText: 'Switched all eligible items to Cymbal Basics for maximum savings.',
    };
  }

  if (text.includes('cymbal select') || text.includes('gourmet') || text.includes('switch to select') || text.includes('premium')) {
    return {
      type: 'SET_BRAND_STRATEGY',
      payload: 'select',
      feedbackText: 'Elevated cheeses and wines to Cymbal Select gourmet tier.',
    };
  }

  if (text.includes('balanced') || text.includes('cymbal fresh')) {
    return {
      type: 'SET_BRAND_STRATEGY',
      payload: 'balanced',
      feedbackText: 'Applied balanced strategy with Cymbal Fresh produce and Cymbal Basics pantry.',
    };
  }

  // 4. Fulfillment & Checkout
  if (text.includes('curbside') || text.includes('pickup') || text.includes('curbside pickup')) {
    return {
      type: 'SET_FULFILLMENT',
      payload: 'curbside',
      feedbackText: 'Selected free Curbside Pickup at CymbalMart Store 104.',
    };
  }

  if (text.includes('delivery') || text.includes('same day delivery') || text.includes('deliver to home')) {
    return {
      type: 'SET_FULFILLMENT',
      payload: 'delivery',
      feedbackText: 'Selected Same-Day Temperature Chilled Delivery.',
    };
  }

  if (text.includes('place order') || text.includes('complete order') || text.includes('finalize order') || text.includes('finish and pay') || text.includes('buy now')) {
    return {
      type: 'PLACE_ORDER',
      feedbackText: 'Placing your CymbalMart party order now!',
    };
  }

  // 5. Setting Event Parameters (Budget, Guests, Duration, Theme)
  const budgetMatch = text.match(/budget (?:to|is|of)?\s*\$?(\d+)/i) || text.match(/\$?(\d+)\s*dollars? budget/i);
  if (budgetMatch && budgetMatch[1]) {
    const amount = parseInt(budgetMatch[1], 10);
    return {
      type: 'SET_BUDGET',
      payload: amount,
      feedbackText: `Target budget set to ${amount} dollars.`,
    };
  }

  const adultMatch = text.match(/(\d+)\s*(?:adults?|people|guests)/i);
  if (adultMatch && adultMatch[1]) {
    const count = parseInt(adultMatch[1], 10);
    return {
      type: 'SET_GUESTS',
      payload: { adults: count, kids: party.kids },
      feedbackText: `Headcount updated to ${count} adult guests.`,
    };
  }

  const durationMatch = text.match(/(\d+)\s*hours?/i);
  if (durationMatch && durationMatch[1]) {
    const hrs = parseInt(durationMatch[1], 10);
    return {
      type: 'SET_DURATION',
      payload: hrs,
      feedbackText: `Event duration set to ${hrs} hours.`,
    };
  }

  // 6. Item Additions (e.g. "add 3 bags of ice", "add 2 packs of tortillas", "add avocados")
  if (text.startsWith('add ') || text.includes('add to cart') || text.includes('add to list')) {
    let itemStr = text.replace(/^add\s+/, '').replace(/to (?:the )?(?:cart|list)/, '').trim();

    // extract quantity if present (e.g. "3 bags of ice" -> qty: 3, unit: bags, name: ice)
    const qtyMatch = itemStr.match(/^(\d+)\s+([a-zA-Z]+)\s+of\s+(.+)$/i) || itemStr.match(/^(\d+)\s+(.+)$/i);
    let qty = 1;
    let unit = 'pack';
    let name = itemStr;

    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10) || 1;
      if (qtyMatch[3]) {
        unit = qtyMatch[2];
        name = qtyMatch[3];
      } else {
        name = qtyMatch[2];
      }
    }

    // Capitalize name
    const formattedName = name
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      type: 'ADD_ITEM',
      payload: {
        name: `Cymbal Fresh ${formattedName}`,
        quantity: qty,
        unit,
        estimatedPrice: Math.round(qty * 4.99 * 100) / 100,
        storeRecommendation: 'Aisle 5 - Pantry & Snacks',
        brandTier: 'Cymbal Fresh' as BrandTier,
        category: 'pantry',
      },
      feedbackText: `Added ${qty} ${unit} of ${formattedName} to your cart.`,
    };
  }

  // 7. Item Removal (e.g. "remove wine", "delete beer", "remove ice")
  if (text.startsWith('remove ') || text.startsWith('delete ')) {
    const targetQuery = text.replace(/^(?:remove|delete)\s+/, '').trim();
    const matched = items.find((i) => i.name.toLowerCase().includes(targetQuery));
    if (matched) {
      return {
        type: 'REMOVE_ITEM',
        payload: matched.id,
        feedbackText: `Removed ${matched.name} from your shopping list.`,
      };
    }
  }

  // 8. Queries & Status Reading
  if (text.includes('total') || text.includes('how much') || text.includes('budget status') || text.includes('what is the cost')) {
    const currentTotal = items.reduce((sum, i) => sum + i.estimatedPrice, 0);
    const variance = currentTotal - party.targetBudget;
    const status = variance > 0 ? `${Math.round(variance)} dollars over budget` : `${Math.round(Math.abs(variance))} dollars under your budget`;
    return {
      type: 'STATUS_QUERY',
      feedbackText: `Your current cart total is ${Math.round(currentTotal)} dollars, which is ${status}.`,
    };
  }

  if (text.includes('read list') || text.includes('what is on my list') || text.includes('read items')) {
    const topItems = items.slice(0, 5).map((i) => `${i.quantity} ${i.unit} of ${i.name}`).join(', ');
    return {
      type: 'READ_LIST',
      feedbackText: `You have ${items.length} items. Here are the first few: ${topItems}.`,
    };
  }

  return {
    type: 'UNKNOWN',
    feedbackText: "I heard you, but I wasn't sure what action to take. Try saying 'Set budget to 250 dollars', 'Auto tune budget', or 'Add 3 bags of ice'.",
  };
}
