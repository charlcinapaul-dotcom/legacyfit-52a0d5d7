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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      beta_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          max_uses: number
          times_used: number
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          times_used?: number
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_uses?: number
          times_used?: number
        }
        Relationships: []
      }
      certificates: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          description: string | null
          edition: string
          id: string
          image_url: string | null
          is_active: boolean | null
          price_cents: number | null
          slug: string | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          title: string
          total_miles: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          edition: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_cents?: number | null
          slug?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          title: string
          total_miles: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          edition?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_cents?: number | null
          slug?: string | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          title?: string
          total_miles?: number
          updated_at?: string
        }
        Relationships: []
      }
      coin_fulfillment: {
        Row: {
          coin_id: string
          created_at: string
          flagged_at: string
          id: string
          shipped_at: string | null
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_city: string
          shipping_country: string
          shipping_name: string
          shipping_postal_code: string
          shipping_state: string
          status: Database["public"]["Enums"]["fulfillment_status"] | null
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          coin_id: string
          created_at?: string
          flagged_at?: string
          id?: string
          shipped_at?: string | null
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_city: string
          shipping_country?: string
          shipping_name: string
          shipping_postal_code: string
          shipping_state: string
          status?: Database["public"]["Enums"]["fulfillment_status"] | null
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          coin_id?: string
          created_at?: string
          flagged_at?: string
          id?: string
          shipped_at?: string | null
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_city?: string
          shipping_country?: string
          shipping_name?: string
          shipping_postal_code?: string
          shipping_state?: string
          status?: Database["public"]["Enums"]["fulfillment_status"] | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_fulfillment_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "legacy_coins"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_coins: {
        Row: {
          challenge_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "legacy_coins_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: true
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      mile_entries: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          logged_at: string
          miles: number
          notes: string | null
          source: Database["public"]["Enums"]["mile_source"]
          user_id: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          logged_at?: string
          miles: number
          notes?: string | null
          source?: Database["public"]["Enums"]["mile_source"]
          user_id: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          logged_at?: string
          miles?: number
          notes?: string | null
          source?: Database["public"]["Enums"]["mile_source"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mile_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          audio_url: string | null
          challenge_id: string
          created_at: string
          description: string | null
          historical_event: string | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          miles_required: number
          order_index: number
          stamp_copy: string | null
          stamp_image_url: string | null
          stamp_mileage_display: string | null
          stamp_title: string | null
          title: string
        }
        Insert: {
          audio_url?: string | null
          challenge_id: string
          created_at?: string
          description?: string | null
          historical_event?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          miles_required: number
          order_index: number
          stamp_copy?: string | null
          stamp_image_url?: string | null
          stamp_mileage_display?: string | null
          stamp_title?: string | null
          title: string
        }
        Update: {
          audio_url?: string | null
          challenge_id?: string
          created_at?: string
          description?: string | null
          historical_event?: string | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          miles_required?: number
          order_index?: number
          stamp_copy?: string | null
          stamp_image_url?: string | null
          stamp_mileage_display?: string | null
          stamp_title?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      passport_stamp_images: {
        Row: {
          generated_at: string | null
          id: string
          image_url: string
          milestone_id: string | null
        }
        Insert: {
          generated_at?: string | null
          id?: string
          image_url: string
          milestone_id?: string | null
        }
        Update: {
          generated_at?: string | null
          id?: string
          image_url?: string
          milestone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passport_stamp_images_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: true
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          challenge_id: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_checkout_session_id: string | null
          stripe_payment_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          challenge_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          challenge_id?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_checkout_session_id?: string | null
          stripe_payment_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bib_number: string | null
          created_at: string
          display_name: string | null
          id: string
          total_miles: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bib_number?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          total_miles?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bib_number?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          total_miles?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_redemptions: {
        Row: {
          created_at: string
          id: string
          referral_code_id: string
          referred_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_id: string
          referred_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_redemptions_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_redeemed: boolean
          redeemed_at: string | null
          redeemed_for_challenge_id: string | null
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          id?: string
          is_redeemed?: boolean
          redeemed_at?: string | null
          redeemed_for_challenge_id?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_redeemed?: boolean
          redeemed_at?: string | null
          redeemed_for_challenge_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_codes_redeemed_for_challenge_id_fkey"
            columns: ["redeemed_for_challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          joined_at: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          challenge_id: string
          created_at: string
          created_by: string | null
          id: string
          invite_code: string
          name: string
          password: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code?: string
          name: string
          password?: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          invite_code?: string
          name?: string
          password?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean | null
          miles_logged: number | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          miles_logged?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean | null
          miles_logged?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coins: {
        Row: {
          coin_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          coin_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          coin_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coins_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "legacy_coins"
            referencedColumns: ["id"]
          },
        ]
      }
      user_milestones: {
        Row: {
          id: string
          milestone_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          milestone_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          milestone_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_passport_stamps: {
        Row: {
          id: string
          milestone_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          id?: string
          milestone_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          id?: string
          milestone_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_passport_stamps_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          bib_number: string | null
          challenges_completed: number | null
          display_name: string | null
          id: string | null
          total_miles: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      fulfillment_status: "pending" | "processing" | "shipped" | "delivered"
      mile_source: "manual" | "apple_health" | "google_fit"
      payment_status: "pending" | "paid" | "failed" | "refunded"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      fulfillment_status: ["pending", "processing", "shipped", "delivered"],
      mile_source: ["manual", "apple_health", "google_fit"],
      payment_status: ["pending", "paid", "failed", "refunded"],
    },
  },
} as const
