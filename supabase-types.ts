// Supabase Database Types
// Generated from supabase-schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          credits: number
          is_pro: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          is_pro?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          is_pro?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      itineraries: {
        Row: {
          id: string
          user_id: string
          title: string
          destination: string
          origin: string | null
          total_days: number
          budget_level: string
          travel_style: string | null
          travelers: number
          transport_mode: string | null
          summary: string | null
          weather_forecast: string | null
          playlist_vibe: string | null
          itinerary_data: Json
          estimated_cost: Json
          packing_list: Json
          local_phrases: Json
          travel_advisories: Json
          is_public: boolean
          shared_link_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          destination: string
          origin?: string | null
          total_days: number
          budget_level: string
          travel_style?: string | null
          travelers?: number
          transport_mode?: string | null
          summary?: string | null
          weather_forecast?: string | null
          playlist_vibe?: string | null
          itinerary_data: Json
          estimated_cost: Json
          packing_list?: Json
          local_phrases?: Json
          travel_advisories?: Json
          is_public?: boolean
          shared_link_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          destination?: string
          origin?: string | null
          total_days?: number
          budget_level?: string
          travel_style?: string | null
          travelers?: number
          transport_mode?: string | null
          summary?: string | null
          weather_forecast?: string | null
          playlist_vibe?: string | null
          itinerary_data?: Json
          estimated_cost?: Json
          packing_list?: Json
          local_phrases?: Json
          travel_advisories?: Json
          is_public?: boolean
          shared_link_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
      activity_suggestions: {
        Row: {
          id: string
          destination: string
          day_theme: string
          language: string
          suggestions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          destination: string
          day_theme: string
          language?: string
          suggestions: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          destination?: string
          day_theme?: string
          language?: string
          suggestions?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for commonly used data
export type ItineraryData = {
  days: Array<{
    day: number
    theme: string
    activities: Array<{
      time: string
      activity: string
      location: string
      description: string
      emoji: string
      cost: string
    }>
  }>
}

export type EstimatedCost = {
  total: string
  accommodation: string
  food: string
  activities: string
  transport: string
  flights: string
  explanation: string
}

export type CreditTransactionType = 
  | 'welcome_bonus'
  | 'purchase'
  | 'trip_generation'
  | 'refund'
  | 'admin_adjustment'

export type ItineraryInsert = Database['public']['Tables']['itineraries']['Insert']
export type ItineraryRow = Database['public']['Tables']['itineraries']['Row']
export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type CreditTransactionRow = Database['public']['Tables']['credit_transactions']['Row']
