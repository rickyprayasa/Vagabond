
import { GoogleGenAI, Type } from "@google/genai";
import { Itinerary, TravelPreferences } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Helper for generating entire itinerary
export const generateItinerary = async (prefs: TravelPreferences, language: 'en' | 'id' = 'en'): Promise<Itinerary> => {
  const model = "gemini-3-flash-preview";
  
  const langPrompt = language === 'id' ? 'Indonesian' : 'English';

  const prompt = `Create a detailed ${prefs.days}-day travel itinerary from ${prefs.origin} to ${prefs.destination}. 
  
  CRITICAL PARAMETERS:
  - Origin (Starting Point): ${prefs.origin} (Use this to calculate flight/fuel costs).
  - Destination: ${prefs.destination}.
  - Travelers: ${prefs.travelers} person(s).
  - Transport Mode: ${prefs.transportMode}.
  - Budget Tier: ${prefs.budget}. 
  - Travel Style: ${prefs.travelStyle || 'Balanced'} (IMPORTANT: Ensure the pacing, activity types, and daily themes strictly reflect this style. e.g. "Relaxed" should have fewer activities and more leisure time; "Fast-Paced" should be packed.).
  - Interests: ${prefs.interests.join(", ")}.

  BUDGET CALCULATION LOGIC (CRITICAL):
  You must calculate the "estimatedCost" for the ENTIRE GROUP of ${prefs.travelers} people combined.
  1. Flights / Fuel: 
     - If "Private Vehicle": Calculate estimated fuel + tolls cost from ${prefs.origin} to ${prefs.destination} and back.
     - If "Rental Car": Calculate fuel from ${prefs.origin} to ${prefs.destination} + rental costs.
     - Otherwise (Flights/Train): Estimate roundtrip tickets from ${prefs.origin} to ${prefs.destination} x ${prefs.travelers}.
  2. Accommodation: Estimate rooms needed for ${prefs.travelers} people (e.g. 1 room for 2 people, 2 rooms for 3-4, etc).
  3. Transport (Local): 
     - If "Rental Car" or "Private Vehicle": Calculate daily fuel + parking for local travel.
     - If "Public Transport": Multiply daily fares by ${prefs.travelers}.
     - If "Taxi/Private Driver": Calculate total ride costs (shared).
  4. Food & Activities: Multiply individual costs by ${prefs.travelers}.

  OUTPUT REQUIREMENTS:
  1. Provide estimated costs in ${language === 'id' ? 'IDR (Rupiah)' : 'USD'}.
  2. Brief weather forecast.
  3. Packing list categorized (check weather/activities).
  4. 3-4 local phrases.
  5. Playlist vibe name.
  6. Daily plan must be logical geographically.
  7. Provide 2-3 important travel advisories or safety tips specific to ${prefs.destination} (e.g. pickpockets, weather warnings, cultural etiquette). Classify severity as 'Low', 'Medium', 'High', or 'Critical'.

  Output in ${langPrompt} language. Keep JSON keys in English.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            destination: { type: Type.STRING },
            totalDays: { type: Type.INTEGER },
            budgetLevel: { type: Type.STRING },
            estimatedCost: { 
              type: Type.OBJECT,
              properties: {
                total: { type: Type.STRING, description: `Total estimated cost for ${prefs.travelers} travelers combined.` },
                flights: { type: Type.STRING, description: "Total flight, train, or fuel cost from Origin to Destination" },
                accommodation: { type: Type.STRING, description: "Total accommodation cost" },
                food: { type: Type.STRING, description: "Total food cost" },
                activities: { type: Type.STRING, description: "Total activities cost" },
                transport: { type: Type.STRING, description: `Total local transport cost using ${prefs.transportMode}` },
                explanation: { type: Type.STRING, description: "A brief text summarizing assumptions (e.g., 'Based on 2 rooms at $50/night, public transit fares, and average dining cost')." }
              },
              required: ["total", "flights", "accommodation", "food", "activities", "transport", "explanation"]
            },
            summary: { type: Type.STRING },
            playlistVibe: { type: Type.STRING },
            weatherForecast: { type: Type.STRING, description: "Brief weather summary for the destination/season" },
            packingList: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  items: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: {
                        name: { type: Type.STRING },
                        reason: { type: Type.STRING, description: "Short reason if specific to weather/activity, else empty string." }
                      },
                      required: ["name", "reason"]
                    } 
                  }
                },
                required: ["category", "items"]
              } 
            },
            localPhrases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  pronunciation: { type: Type.STRING }
                }
              }
            },
            travelAdvisories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["severity", "title", "description"]
              }
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  theme: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        activity: { type: Type.STRING },
                        location: { type: Type.STRING },
                        description: { type: Type.STRING },
                        emoji: { type: Type.STRING },
                        cost: { type: Type.STRING, description: "Estimated cost for this specific activity" },
                      },
                      required: ["time", "activity", "location", "description", "emoji", "cost"],
                    },
                  },
                },
                required: ["day", "theme", "activities"],
              },
            },
          },
          required: ["title", "destination", "totalDays", "budgetLevel", "summary", "days", "estimatedCost", "packingList", "weatherForecast", "localPhrases", "playlistVibe", "travelAdvisories"],
        },
      },
    });

    if (response.text) {
      const parsedItinerary = JSON.parse(response.text) as Itinerary;
      // Inject original preferences for reloading capabilities
      parsedItinerary.originalPrefs = prefs;
      return parsedItinerary;
    } else {
      throw new Error("No data returned from Gemini");
    }
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};

// Helper for single activity suggestions
export interface SuggestedActivity {
    activity: string;
    description: string;
    emoji: string;
    cost: string;
}

export const generateActivitySuggestions = async (
    destination: string, 
    dayTheme: string, 
    language: 'en' | 'id' = 'en'
): Promise<SuggestedActivity[]> => {
    const model = "gemini-3-flash-preview";
    const langPrompt = language === 'id' ? 'Indonesian' : 'English';
    
    const prompt = `Suggest 3 unique and specific travel activities for ${destination} that fit the theme "${dayTheme}". 
    Provide a name, short description, estimated cost, and an emoji for each.
    Output in ${langPrompt}.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    activity: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    emoji: { type: Type.STRING },
                                    cost: { type: Type.STRING }
                                },
                                required: ["activity", "description", "emoji", "cost"]
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            return data.suggestions as SuggestedActivity[];
        }
        return [];
    } catch (e) {
        console.error("Suggestion error", e);
        return [];
    }
};

// Helper for packing suggestions
export interface SuggestedPackingItem {
    name: string;
    category: string;
    reason: string;
}

export const generatePackingSuggestions = async (
    destination: string,
    weather: string,
    activities: string[],
    language: 'en' | 'id' = 'en'
): Promise<SuggestedPackingItem[]> => {
    const model = "gemini-3-flash-preview";
    const langPrompt = language === 'id' ? 'Indonesian' : 'English';

    const prompt = `Analyze the climate and typical weather patterns for "${destination}" (taking into account the current season if inferable, or general climate).
    Also consider this specific forecast note: "${weather}".
    
    Based on the CLIMATE, WEATHER, and these planned ACTIVITIES: "${activities.join(', ')}", suggest 5-7 HIGHLY SPECIFIC packing items that a traveler might forget.
    
    Rules:
    1. Do NOT suggest generic items like "Passport", "Phone charger", "T-shirts", "Underwear".
    2. Focus on items specific to the location's climate (e.g. "Humidity frizz control spray" for Bali, "Windbreaker" for Iceland) or activities (e.g. "Dry bag" for kayaking).
    3. Provide a short reason connecting the item to the climate or activity.
    
    Output in ${langPrompt}.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    category: { type: Type.STRING, description: "e.g., Clothing, Gear, Toiletries" },
                                    reason: { type: Type.STRING, description: "Why is this needed?" }
                                },
                                required: ["name", "category", "reason"]
                            }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            return data.suggestions as SuggestedPackingItem[];
        }
        return [];
    } catch (e) {
        console.error("Packing suggestion error", e);
        return [];
    }
};

// Helper for Place Suggestions (Simulating Google Maps Autocomplete via AI)
export const generatePlaceSuggestions = async (
    query: string,
    destination: string,
    language: 'en' | 'id' = 'en',
    type: 'any' | 'city' = 'any'
): Promise<string[]> => {
    if (!query || query.length < 3) return [];
    
    const model = "gemini-3-flash-preview";
    // Check if we are searching for a place within a destination context or a global destination
    let context = "globally";
    let placeType = "specific real-world places";

    if (type === 'city') {
        placeType = "cities, regions, or countries";
        context = "worldwide";
    } else if (destination) {
        context = `in or near "${destination}"`;
    }
    
    const prompt = `Suggest 5 ${placeType} ${context} that match the search query "${query}". 
    Return only the names of the places (e.g. "Orchid Forest Cikole", "Tangkuban Perahu" or "Kyoto, Japan").
    Do not include generic terms if specific ones exist.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        places: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            return data.places || [];
        }
        return [];
    } catch (e) {
        console.error("Place suggestion error", e);
        return [];
    }
};
