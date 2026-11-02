export type ItemCategory =
  | 'beverages'
  | 'produce'
  | 'proteins'
  | 'pantry'
  | 'tableware'
  | 'decor';

export type StoreRecommendation = string;

export type BrandTier =
  | 'Cymbal Fresh'
  | 'Cymbal Select'
  | 'Cymbal Basics'
  | 'National Brand';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  unit: string;
  unitPrice?: number;
  estimatedPrice: number;
  storeRecommendation: string;
  brandTier?: BrandTier;
  aisleLocation?: string;
  isPurchased: boolean;
  notes?: string;
  dietaryTag?: string;
  customItem?: boolean;
}

export interface PartyConfig {
  id: string;
  title: string;
  partyType: string;
  theme: string;
  tagline: string;
  date: string;
  time: string;
  durationHours: number;
  adults: number;
  kids: number;
  drinkingAdults: number;
  targetBudget: number;
  specialRequests: string;
  dietaryRestrictions: string[];
  bannerImage: string;
  notes: string;
}

export interface BeverageMath {
  totalDrinks: number;
  wineBottles: number;
  beerCans: number;
  liquorBottles: number;
  mixerLiters: number;
  sodaCans: number;
  iceLbs: number;
  iceBags: number;
  lemonsLimes: number;
}

export interface FoodMath {
  appetizerPieces: number;
  proteinLbs: number;
  sidesServings: number;
  dessertPieces: number;
  breadOrBuns: number;
}

export interface TablewareMath {
  cups: number;
  dinnerPlates: number;
  dessertPlates: number;
  napkins: number;
  cutlerySets: number;
  trashBags: number;
}

export interface TimelineTask {
  id: string;
  timeframe: string;
  task: string;
  category: string;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

export interface PartyTemplate {
  id: string;
  title: string;
  tagline: string;
  theme: string;
  description: string;
  bannerImage: string;
  defaultAdults: number;
  defaultKids: number;
  defaultDuration: number;
  defaultBudget: number;
  dietaryTags: string[];
  signatureDrink: string;
  signatureDrinkRecipe: string;
  items: Omit<ShoppingItem, 'id' | 'isPurchased'>[];
  timeline: { timeframe: string; task: string; category: string }[];
  costSavingTips: string[];
}
