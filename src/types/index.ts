export interface StarterFeeding {
  id: string;
  timestamp: number;
  flourType: string;
  flourGrams: number;
  waterGrams: number;
  starterGrams: number;
  notes?: string;
  riseLevel?: number; // 1-5 scale
  peakHours?: number;
}

export interface Starter {
  id: string;
  name: string;
  createdAt: number;
  flourType: string;
  feedings: StarterFeeding[];
}

export interface RecipeIngredients {
  flour: number;
  water: number;
  salt: number;
  starter: number;
}

export interface BakeStep {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  type: 'bulk' | 'fold' | 'shape' | 'proof' | 'bake' | 'cool' | 'custom';
}

export interface ActiveBake {
  id: string;
  recipeName: string;
  startedAt: number;
  currentStepIndex: number;
  steps: BakeStep[];
  stepStartedAt?: number;
  isPaused: boolean;
  isComplete: boolean;
}

export interface BakeLogEntry {
  id: string;
  date: number;
  recipeName: string;
  hydration: number;
  flourTypes: string;
  totalWeight: number;
  crumbRating: number; // 1-5
  tasteRating: number; // 1-5
  riseRating: number; // 1-5
  photos: string[];
  notes: string;
  wouldChange: string;
}
