import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Party Shopping Agent Consultation
app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message, history, partyContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const contextPrompt = partyContext
      ? `CURRENT CYMBALMART PARTY CONTEXT:
- Event: "${partyContext.themeTitle || 'Party'}"
- Theme: ${partyContext.theme || 'Celebration'}
- Headcount: ${partyContext.guestCount || 10} (${partyContext.adults || 10} adults, ${partyContext.kids || 0} kids)
- Duration: ${partyContext.durationHours || 3} hours
- Special Requests & Dietary: ${partyContext.dietaryRestrictions?.join(', ') || 'Standard'}
- Target Budget: $${partyContext.targetBudget || 200}
- Current Cart Total: $${partyContext.currentTotal || 0} (Variance: $${(partyContext.currentTotal || 0) - (partyContext.targetBudget || 200)})
- Items in cart: ${partyContext.itemCount || 0} items across CymbalMart departments.`
      : 'No party configured yet.';

    const systemInstruction = `You are "CymbalMart Assistant", the friendly, knowledgeable customer chatbot for CymbalMart.
You interact with customers and party hosts to provide world-class retail customer support, event planning, and grocery shopping guidance.

Your core capabilities:
1. Customer Inquiries: Store hours (7 AM - 11 PM daily), Curbside Pickup (Bays 1-8, ready in 2 hours), and Delivery slots.
2. Aisle Navigator: Direct customers to specific aisles and departments:
   - Produce Island (Cymbal Fresh fruits, vegetables, salad kits, fresh herbs)
   - Meat & Seafood (Angus chuck, carnitas pork, poultry, seafood skewers)
   - Deli & Prepared (rotisserie chicken, artisan cheeses, charcuterie boards, dips)
   - Bakery Case (fresh French baguettes, brioche buns, custom celebration cakes)
   - Aisle 2 - Beverages & Ice (craft beer, wine, mixers, seltzers, cocktail ice freezer)
   - Aisle 5 - Pantry & Snacks (tortilla chips, crackers, beans, sauces, international)
   - Aisle 11 - Party & Tableware (plates, cups, napkins, cutlery, banners, candles)
3. Budget Optimization: Recommend switching from national brands to Cymbal Basics (saves 25-35%) or Cymbal Select (gourmet quality at value prices).
4. Catering Math: Calculate exact drink, meat, appetizer, ice, and tableware formulas for any headcount or party duration.
5. Dietary Accommodations: Recommend specific substitutes for gluten-free, vegan, nut-free, or non-alcoholic guests.

Item Suggestion Syntax:
Whenever you recommend or the user asks to add a specific product to their shopping cart, append an action block in this format at the end of your response so the customer can add it with one click:
[ADD_ITEM: {"name": "Product Name", "category": "produce|beverages|proteins|pantry|tableware|decor", "storeRecommendation": "Department Name", "brandTier": "Cymbal Fresh|Cymbal Basics|Cymbal Select|National Brand", "quantity": 1, "unit": "pack|bottle|lbs|bag", "estimatedPrice": 4.99}]

Tone: Warm, courteous, practical, efficient, and eager to help. Format responses with clean bullets and bold text.
${contextPrompt}`;

    const formattedHistory = Array.isArray(history)
      ? history.slice(-6).map((h: { role: string; content: string }) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }],
        }))
      : [];

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
      config: {
        systemInstruction,
      },
    });

    res.json({ reply: response.text || "I'm ready to help you plan and optimize your party shopping!" });
  } catch (err: any) {
    console.error('Error in /api/agent/chat:', err);
    res.status(500).json({
      error: 'Failed to consult party shopping agent',
      details: err.message,
    });
  }
});

// Endpoint: Generate Full Party Plan & Shopping List
app.post('/api/agent/generate-plan', async (req, res) => {
  try {
    const { prompt, theme, guestCount, durationHours, targetBudget, dietary } = req.body;

    const requestDetails = `Create an exhaustive, realistic CymbalMart party shopping plan aligned with the host's budget:
- Theme / Occasion: ${theme || 'Celebration Dinner & Drinks'}
- Guest Count: ${guestCount || 16} guests
- Event Duration: ${durationHours || 4} hours
- Target Budget: $${targetBudget || 250} USD
- Special Requests & Dietary Notes: ${dietary ? dietary.join(', ') : 'None specified'}
- Host notes: ${prompt || 'Curate a complete shopping cart optimized for busy hosts with aisle locations.'}`;

    const systemInstruction = `You are the CymbalMart Party Planner Shopping Agent.
Your objective is to convert the host's event intent into a curated, budget-conscious CymbalMart shopping list.
Follow strict catering math:
- Drinks: 2 drinks per person in first hour, 1 drink per person each additional hour. Balance beer, wine, signature cocktail/mocktail, sodas.
- Ice: 1.5 lbs per guest (Aisle 2 Beverage Freezer).
- Food: 0.5 lb meat/protein per person + sides, or 8-10 appetizer pieces.
- Tableware: 2 cups, 1.5 plates, 3 napkins per person.
- Budget Alignment: The sum of items MUST be very close to the target budget (within ±5%).
- Brand tiers: Assign each item a tier ('Cymbal Fresh', 'Cymbal Select', 'Cymbal Basics', 'National Brand').
- Aisle routing: Assign realistic CymbalMart locations (e.g. 'Aisle 2 - Beverages', 'Aisle 5 - Pantry & Snacks', 'Aisle 11 - Party & Tableware', 'Produce Island', 'Deli Counter', 'Bakery Case', 'Meat Department').

Respond strictly with valid JSON following the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: requestDetails,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themeTitle: { type: Type.STRING },
            tagline: { type: Type.STRING },
            summary: { type: Type.STRING },
            estimatedTotalCost: { type: Type.NUMBER },
            perPersonCost: { type: Type.NUMBER },
            budgetVarianceNotice: { type: Type.STRING },
            beverageSummary: {
              type: Type.OBJECT,
              properties: {
                totalDrinksNeeded: { type: Type.INTEGER },
                iceLbsNeeded: { type: Type.NUMBER },
                signatureDrinkName: { type: Type.STRING },
                signatureDrinkRecipe: { type: Type.STRING },
                mocktailOption: { type: Type.STRING },
              },
              required: ['totalDrinksNeeded', 'iceLbsNeeded', 'signatureDrinkName'],
            },
            timelineSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeframe: { type: Type.STRING },
                  task: { type: Type.STRING },
                  category: { type: Type.STRING },
                },
                required: ['timeframe', 'task'],
              },
            },
            costSavingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            shoppingList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  category: {
                    type: Type.STRING,
                    description: 'beverages, produce, proteins, pantry, tableware, decor',
                  },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  estimatedPrice: { type: Type.NUMBER },
                  storeRecommendation: {
                    type: Type.STRING,
                    description: 'Aisle or department at CymbalMart (e.g. Aisle 2 - Beverages, Produce Island, Deli Counter, Aisle 11 - Party)',
                  },
                  brandTier: {
                    type: Type.STRING,
                    description: 'Cymbal Fresh, Cymbal Select, Cymbal Basics, or National Brand',
                  },
                  notes: { type: Type.STRING },
                  dietaryTag: { type: Type.STRING },
                },
                required: ['name', 'category', 'quantity', 'unit', 'estimatedPrice', 'storeRecommendation'],
              },
            },
          },
          required: [
            'themeTitle',
            'summary',
            'estimatedTotalCost',
            'beverageSummary',
            'timelineSteps',
            'costSavingTips',
            'shoppingList',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/agent/generate-plan:', err);
    res.status(500).json({
      error: 'Failed to generate party shopping plan',
      details: err.message,
    });
  }
});

// Setup Vite dev server or serve static dist
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Festivo Party Planner Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
