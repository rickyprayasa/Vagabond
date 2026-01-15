
export interface Activity {
  id: string; // Added for Drag and Drop tracking
  time: string;
  activity: string;
  location: string;
  description: string;
  emoji: string;
  cost: string;
}

export interface DayPlan {
  id: string; // Added for Day Drag and Drop
  day: number;
  theme: string;
  activities: Activity[];
}

export interface LocalPhrase {
  original: string;
  translation: string;
  pronunciation: string;
}

export interface CostBreakdown {
  total: string;
  accommodation: string;
  food: string;
  activities: string;
  transport: string;
  flights: string;
  explanation: string; // Added for detailed breakdown view
}

export interface PackingItem {
  name: string;
  reason: string;
}

export interface PackingCategory {
  category: string;
  items: PackingItem[];
}

export interface TravelPreferences {
  origin: string; // Added for accurate transport costs
  destination: string;
  days: number;
  budget: 'Budget' | 'Moderate' | 'Luxury';
  interests: string[];
  travelers: number;
  transportMode: string;
  travelStyle: string; // Added Travel Style
}

export interface Itinerary {
  title: string;
  destination: string;
  totalDays: number;
  budgetLevel: string;
  estimatedCost: CostBreakdown;
  summary: string;
  weatherForecast: string;
  packingList: PackingCategory[];
  localPhrases: LocalPhrase[];
  playlistVibe: string;
  days: DayPlan[];
  originalPrefs?: TravelPreferences; // Added to allow reloading configuration
  travelAdvisories?: Array<{ severity: string, title: string, description: string }>;
}

export interface User {
  isLoggedIn: boolean;
  name: string;
  email: string;
  credits: number;
}
