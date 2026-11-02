import { PartyConfig, BeverageMath, FoodMath, TablewareMath } from '../types.ts';

export function calculateBeverageNeeds(party: PartyConfig): BeverageMath {
  const { adults, drinkingAdults, kids, durationHours } = party;
  const validDuration = Math.max(1, durationHours);
  const drinkers = Math.min(adults, Math.max(0, drinkingAdults));
  const nonDrinkers = adults - drinkers + kids;

  // Hospitality formula: 2 drinks first hour, 1 drink each additional hour
  const alcoholRatePerPerson = 2 + Math.max(0, validDuration - 1);
  const totalAlcoholicDrinks = drinkers * alcoholRatePerPerson;

  // Standard party split: 40% beer, 40% wine, 20% spirits
  const wineDrinks = totalAlcoholicDrinks * 0.4;
  const beerDrinks = totalAlcoholicDrinks * 0.4;
  const liquorDrinks = totalAlcoholicDrinks * 0.2;

  // 1 bottle of wine (750ml) = 5 standard 5oz pours
  const wineBottles = Math.ceil(wineDrinks / 5);

  // Beer is 1 can/bottle per drink
  const beerCans = Math.ceil(beerDrinks);

  // 1 bottle of liquor (750ml) = ~16 standard 1.5oz shots/cocktails
  const liquorBottles = Math.ceil(liquorDrinks / 16);

  // Non-alcoholic drinks: 1.5 drinks per non-drinker/kid per 2 hours + 1 sparkling water per drinker
  const nonAlcoholicDrinks = Math.ceil(nonDrinkers * (validDuration * 0.8) + drinkers * 1.5);
  const sodaCans = Math.ceil(nonAlcoholicDrinks * 0.7);
  const mixerLiters = Math.ceil((liquorDrinks * 0.15) + (nonAlcoholicDrinks * 0.1));

  // Ice math: 1.5 lbs of ice per person (covers chilling beer/wine tubs + serving in cocktails)
  const totalGuests = adults + kids;
  const iceLbs = Math.round(Math.max(10, totalGuests * 1.5));
  const iceBags = Math.ceil(iceLbs / 10); // standard 10lb ice bag

  // Citrus garnish: 1 lemon or lime per 3 drinking adults
  const lemonsLimes = Math.max(4, Math.ceil(drinkers * 0.4));

  return {
    totalDrinks: totalAlcoholicDrinks + nonAlcoholicDrinks,
    wineBottles,
    beerCans,
    liquorBottles,
    mixerLiters,
    sodaCans,
    iceLbs,
    iceBags,
    lemonsLimes,
  };
}

export function calculateFoodNeeds(party: PartyConfig, isHeavyDinner = true): FoodMath {
  const { adults, kids } = party;
  const totalGuests = adults + kids;

  // Heavy dinner vs cocktail/appetizer party
  const appRate = isHeavyDinner ? 5 : 10;
  const appetizerPieces = Math.ceil(totalGuests * appRate);

  // 0.5 lb cooked protein per adult, 0.3 lb per kid
  const proteinLbs = Math.ceil(adults * 0.5 + kids * 0.3);

  // 1.5 side servings per person
  const sidesServings = Math.ceil(totalGuests * 1.5);

  // 1.5 dessert bites / slices per person
  const dessertPieces = Math.ceil(totalGuests * 1.5);

  // Buns or tortillas
  const breadOrBuns = Math.ceil(totalGuests * 2.2);

  return {
    appetizerPieces,
    proteinLbs,
    sidesServings,
    dessertPieces,
    breadOrBuns,
  };
}

export function calculateTablewareNeeds(party: PartyConfig): TablewareMath {
  const totalGuests = party.adults + party.kids;

  // Guests misplace cups: plan for 2.5 cups per guest
  const cups = Math.ceil(totalGuests * 2.5);

  // Plates: 1.5 dinner plates (people often take a clean plate for seconds)
  const dinnerPlates = Math.ceil(totalGuests * 1.5);

  // Appetizer / dessert plates: 2 per guest
  const dessertPlates = Math.ceil(totalGuests * 2);

  // Napkins: 4 per guest for finger foods, spills, cocktails
  const napkins = Math.ceil(totalGuests * 4);

  // Cutlery sets: 1.5 sets per guest
  const cutlerySets = Math.ceil(totalGuests * 1.5);

  // Heavy duty trash bags: 1 per 5 guests (minimum 2 bags)
  const trashBags = Math.max(2, Math.ceil(totalGuests / 5));

  return {
    cups,
    dinnerPlates,
    dessertPlates,
    napkins,
    cutlerySets,
    trashBags,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
