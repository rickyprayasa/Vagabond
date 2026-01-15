import { supabase } from '../utils/supabaseClient';
import { Itinerary, TravelPreferences } from '../types';
import { Database } from '../supabase-types';

type DatabaseItinerary = Database['public']['Tables']['itineraries']['Row'];
type DatabaseProfile = Database['public']['Tables']['profiles']['Row'];

export const itineraryService = {
  async saveItinerary(
    userId: string,
    itinerary: Itinerary,
    prefs: TravelPreferences
  ): Promise<DatabaseItinerary | null> {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .insert({
          user_id: userId,
          title: itinerary.title,
          destination: itinerary.destination,
          origin: prefs.origin,
          total_days: itinerary.totalDays,
          budget_level: itinerary.budgetLevel,
          travel_style: prefs.travelStyle,
          travelers: prefs.travelers,
          transport_mode: prefs.transportMode,
          summary: itinerary.summary,
          weather_forecast: itinerary.weatherForecast,
          playlist_vibe: itinerary.playlistVibe,
          itinerary_data: {
            days: itinerary.days,
          },
          estimated_cost: itinerary.estimatedCost,
          packing_list: itinerary.packingList,
          local_phrases: itinerary.localPhrases,
          travel_advisories: itinerary.travelAdvisories || [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving itinerary:', error);
      throw error;
    }
  },

  async loadUserItineraries(userId: string): Promise<DatabaseItinerary[]> {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading itineraries:', error);
      throw error;
    }
  },

  async deleteItinerary(itineraryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', itineraryId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      throw error;
    }
  },

  async updateItinerary(
    itineraryId: string,
    updates: Partial<Itinerary>
  ): Promise<DatabaseItinerary | null> {
    try {
      const { data, error } = await supabase
        .from('itineraries')
        .update({
          itinerary_data: { days: updates.days },
          estimated_cost: updates.estimatedCost,
          packing_list: updates.packingList,
          local_phrases: updates.localPhrases,
        })
        .eq('id', itineraryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  },

  async getUserProfile(userId: string): Promise<DatabaseProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateUserCredits(userId: string, credits: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating credits:', error);
      throw error;
    }
  },

  async recordCreditTransaction(
    userId: string,
    amount: number,
    type: 'purchase' | 'trip_generation' | 'refund' | 'admin_adjustment',
    description?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount,
          type,
          description,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }
  },
};
