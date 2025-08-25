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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      card_kyc: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          card_id: string
          city: string | null
          country: string | null
          created_at: string
          document_image_url: string | null
          document_number: string | null
          document_type: string | null
          estimated_delivery: string | null
          full_name: string | null
          id: string
          postal_code: string | null
          shipping_address: string | null
          state: string | null
          tracking_number: string | null
          user_id: string
          verification_status: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          card_id: string
          city?: string | null
          country?: string | null
          created_at?: string
          document_image_url?: string | null
          document_number?: string | null
          document_type?: string | null
          estimated_delivery?: string | null
          full_name?: string | null
          id?: string
          postal_code?: string | null
          shipping_address?: string | null
          state?: string | null
          tracking_number?: string | null
          user_id: string
          verification_status?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          card_id?: string
          city?: string | null
          country?: string | null
          created_at?: string
          document_image_url?: string | null
          document_number?: string | null
          document_type?: string | null
          estimated_delivery?: string | null
          full_name?: string | null
          id?: string
          postal_code?: string | null
          shipping_address?: string | null
          state?: string | null
          tracking_number?: string | null
          user_id?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_kyc_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_notifications: {
        Row: {
          card_id: string
          created_at: string
          declined_payments: boolean | null
          id: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          spending_limits: boolean | null
          suspicious_activity: boolean | null
          transaction_alerts: boolean | null
        }
        Insert: {
          card_id: string
          created_at?: string
          declined_payments?: boolean | null
          id?: string
          notification_type: Database["public"]["Enums"]["notification_type"]
          spending_limits?: boolean | null
          suspicious_activity?: boolean | null
          transaction_alerts?: boolean | null
        }
        Update: {
          card_id?: string
          created_at?: string
          declined_payments?: boolean | null
          id?: string
          notification_type?: Database["public"]["Enums"]["notification_type"]
          spending_limits?: boolean | null
          suspicious_activity?: boolean | null
          transaction_alerts?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "card_notifications_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_rewards: {
        Row: {
          card_id: string
          created_at: string
          current_milestone: number | null
          id: string
          next_milestone: number | null
          reward_points: number | null
          total_cashback: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          current_milestone?: number | null
          id?: string
          next_milestone?: number | null
          reward_points?: number | null
          total_cashback?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          current_milestone?: number | null
          id?: string
          next_milestone?: number | null
          reward_points?: number | null
          total_cashback?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_rewards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      card_transactions: {
        Row: {
          amount: number
          card_id: string
          category: string | null
          created_at: string
          currency_used: string
          description: string | null
          id: string
          merchant_name: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          card_id: string
          category?: string | null
          created_at?: string
          currency_used: string
          description?: string | null
          id?: string
          merchant_name: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string
          category?: string | null
          created_at?: string
          currency_used?: string
          description?: string | null
          id?: string
          merchant_name?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_transactions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "user_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cards: {
        Row: {
          auto_expiry_date: string | null
          card_holder_name: string | null
          card_name: string
          card_number: string | null
          card_subtype: Database["public"]["Enums"]["card_subtype"] | null
          card_type: Database["public"]["Enums"]["card_type"]
          created_at: string
          currency_priority: string[] | null
          current_balance: number | null
          cvv: string | null
          daily_limit: number | null
          expiry_date: string | null
          id: string
          international_enabled: boolean | null
          is_apple_pay_enabled: boolean | null
          is_google_pay_enabled: boolean | null
          is_paypal_enabled: boolean | null
          monthly_limit: number | null
          pin_hash: string | null
          primary_currency: string
          status: Database["public"]["Enums"]["card_status"]
          updated_at: string
          user_id: string
          weekly_limit: number | null
        }
        Insert: {
          auto_expiry_date?: string | null
          card_holder_name?: string | null
          card_name: string
          card_number?: string | null
          card_subtype?: Database["public"]["Enums"]["card_subtype"] | null
          card_type: Database["public"]["Enums"]["card_type"]
          created_at?: string
          currency_priority?: string[] | null
          current_balance?: number | null
          cvv?: string | null
          daily_limit?: number | null
          expiry_date?: string | null
          id?: string
          international_enabled?: boolean | null
          is_apple_pay_enabled?: boolean | null
          is_google_pay_enabled?: boolean | null
          is_paypal_enabled?: boolean | null
          monthly_limit?: number | null
          pin_hash?: string | null
          primary_currency?: string
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
          user_id: string
          weekly_limit?: number | null
        }
        Update: {
          auto_expiry_date?: string | null
          card_holder_name?: string | null
          card_name?: string
          card_number?: string | null
          card_subtype?: Database["public"]["Enums"]["card_subtype"] | null
          card_type?: Database["public"]["Enums"]["card_type"]
          created_at?: string
          currency_priority?: string[] | null
          current_balance?: number | null
          cvv?: string | null
          daily_limit?: number | null
          expiry_date?: string | null
          id?: string
          international_enabled?: boolean | null
          is_apple_pay_enabled?: boolean | null
          is_google_pay_enabled?: boolean | null
          is_paypal_enabled?: boolean | null
          monthly_limit?: number | null
          pin_hash?: string | null
          primary_currency?: string
          status?: Database["public"]["Enums"]["card_status"]
          updated_at?: string
          user_id?: string
          weekly_limit?: number | null
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          status?: string
          type?: string
          user_id?: string
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
      card_status: "active" | "locked" | "frozen" | "expired" | "cancelled"
      card_subtype: "single_use" | "recurring"
      card_type: "virtual" | "physical"
      notification_type: "sms" | "email" | "push"
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
      card_status: ["active", "locked", "frozen", "expired", "cancelled"],
      card_subtype: ["single_use", "recurring"],
      card_type: ["virtual", "physical"],
      notification_type: ["sms", "email", "push"],
    },
  },
} as const
