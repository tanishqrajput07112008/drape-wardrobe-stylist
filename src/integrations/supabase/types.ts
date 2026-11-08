export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          id: string
          item_ids: string[]
          outfit_id: string | null
          outfit_name: string | null
          reasons: string[]
          useful: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_ids?: string[]
          outfit_id?: string | null
          outfit_name?: string | null
          reasons?: string[]
          useful: boolean
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_ids?: string[]
          outfit_id?: string | null
          outfit_name?: string | null
          reasons?: string[]
          useful?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_items: {
        Row: {
          id: string
          item_id: string
          outfit_id: string
          slot: string
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          outfit_id: string
          slot: string
          user_id?: string
        }
        Update: {
          id?: string
          item_id?: string
          outfit_id?: string
          slot?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfits: {
        Row: {
          created_at: string
          details: Json
          favorite: boolean
          id: string
          name: string
          occasion: string | null
          saved: boolean
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json
          favorite?: boolean
          id?: string
          name: string
          occasion?: string | null
          saved?: boolean
          source?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          details?: Json
          favorite?: boolean
          id?: string
          name?: string
          occasion?: string | null
          saved?: boolean
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      planner_events: {
        Row: {
          created_at: string
          event_date: string
          id: string
          notes: string | null
          occasion: string | null
          outfit_id: string | null
          title: string
          user_id: string
          worn: boolean
        }
        Insert: {
          created_at?: string
          event_date: string
          id?: string
          notes?: string | null
          occasion?: string | null
          outfit_id?: string | null
          title: string
          user_id?: string
          worn?: boolean
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          notes?: string | null
          occasion?: string | null
          outfit_id?: string | null
          title?: string
          user_id?: string
          worn?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "planner_events_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avoid_colors: string[]
          climate: string | null
          clothing_categories: string[]
          comfort_notes: string | null
          created_at: string
          display_name: string | null
          fit_prefs: string | null
          hairstyle: string | null
          id: string
          learned_prefs: Json
          lifestyle: string | null
          modesty_notes: string | null
          onboarded: boolean
          preferred_colors: string[]
          primary_use: string[]
          pronouns: string | null
          reminders_enabled: boolean
          style_prefs: string[]
          undertone: string | null
          updated_at: string
        }
        Insert: {
          avoid_colors?: string[]
          climate?: string | null
          clothing_categories?: string[]
          comfort_notes?: string | null
          created_at?: string
          display_name?: string | null
          fit_prefs?: string | null
          hairstyle?: string | null
          id: string
          learned_prefs?: Json
          lifestyle?: string | null
          modesty_notes?: string | null
          onboarded?: boolean
          preferred_colors?: string[]
          primary_use?: string[]
          pronouns?: string | null
          reminders_enabled?: boolean
          style_prefs?: string[]
          undertone?: string | null
          updated_at?: string
        }
        Update: {
          avoid_colors?: string[]
          climate?: string | null
          clothing_categories?: string[]
          comfort_notes?: string | null
          created_at?: string
          display_name?: string | null
          fit_prefs?: string | null
          hairstyle?: string | null
          id?: string
          learned_prefs?: Json
          lifestyle?: string | null
          modesty_notes?: string | null
          onboarded?: boolean
          preferred_colors?: string[]
          primary_use?: string[]
          pronouns?: string | null
          reminders_enabled?: boolean
          style_prefs?: string[]
          undertone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trips: {
        Row: {
          activities: string[]
          climate: string | null
          created_at: string
          days: number
          destination: string
          id: string
          item_ids: string[]
          outfit_ids: string[]
          user_id: string
        }
        Insert: {
          activities?: string[]
          climate?: string | null
          created_at?: string
          days?: number
          destination: string
          id?: string
          item_ids?: string[]
          outfit_ids?: string[]
          user_id?: string
        }
        Update: {
          activities?: string[]
          climate?: string | null
          created_at?: string
          days?: number
          destination?: string
          id?: string
          item_ids?: string[]
          outfit_ids?: string[]
          user_id?: string
        }
        Relationships: []
      }
      wardrobe_items: {
        Row: {
          availability: string
          brand: string | null
          category: string
          colors: string[]
          created_at: string
          fabric: string | null
          favorite: boolean
          fit: string | null
          formality: number
          id: string
          image_path: string | null
          is_demo: boolean
          kind: string
          last_worn_at: string | null
          name: string
          notes: string | null
          occasions: string[]
          pattern: string | null
          seasons: string[]
          style_tags: string[]
          subcategory: string | null
          user_id: string
          wear_count: number
        }
        Insert: {
          availability?: string
          brand?: string | null
          category: string
          colors?: string[]
          created_at?: string
          fabric?: string | null
          favorite?: boolean
          fit?: string | null
          formality?: number
          id?: string
          image_path?: string | null
          is_demo?: boolean
          kind?: string
          last_worn_at?: string | null
          name: string
          notes?: string | null
          occasions?: string[]
          pattern?: string | null
          seasons?: string[]
          style_tags?: string[]
          subcategory?: string | null
          user_id?: string
          wear_count?: number
        }
        Update: {
          availability?: string
          brand?: string | null
          category?: string
          colors?: string[]
          created_at?: string
          fabric?: string | null
          favorite?: boolean
          fit?: string | null
          formality?: number
          id?: string
          image_path?: string | null
          is_demo?: boolean
          kind?: string
          last_worn_at?: string | null
          name?: string
          notes?: string | null
          occasions?: string[]
          pattern?: string | null
          seasons?: string[]
          style_tags?: string[]
          subcategory?: string | null
          user_id?: string
          wear_count?: number
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const