import { RecipeIngredients } from '../types';

export function calculateRecipe(
  totalDoughWeight: number,
  hydrationPercent: number,
  saltPercent: number,
  starterPercent: number,
  starterHydration: number = 100
): RecipeIngredients {
  // Baker's percentages calculation
  // Starter contributes both flour and water
  const starterFlourRatio = 1 / (1 + starterHydration / 100);
  const starterWaterRatio = 1 - starterFlourRatio;

  // Total flour = base flour + flour from starter
  // totalDough = flour + water + salt + starter
  // Using baker's percentages where flour = 100%:
  // water = hydration%, salt = salt%, starter = starter%
  const totalPercentage = 100 + hydrationPercent + saltPercent + starterPercent;
  const flourTotal =
    (totalDoughWeight * 100) / totalPercentage -
    (totalDoughWeight * starterPercent * starterFlourRatio) / totalPercentage +
    (totalDoughWeight * starterPercent * starterFlourRatio) / totalPercentage;

  // Simpler approach: work from total percentage
  const flour = Math.round((totalDoughWeight * 100) / totalPercentage);
  const water = Math.round((flour * hydrationPercent) / 100);
  const salt = Math.round((flour * saltPercent) / 100);
  const starter = Math.round((flour * starterPercent) / 100);

  return { flour, water, salt, starter };
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)}kg`;
  }
  return `${grams}g`;
}
