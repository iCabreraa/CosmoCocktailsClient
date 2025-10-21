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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: Json | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_guest: boolean | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_guest?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_guest?: boolean | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cocktail_sizes: {
        Row: {
          available: boolean | null
          cocktail_id: string | null
          id: string
          price: number
          sizes_id: string | null
          stock_quantity: number | null
        }
        Insert: {
          available?: boolean | null
          cocktail_id?: string | null
          id?: string
          price: number
          sizes_id?: string | null
          stock_quantity?: number | null
        }
        Update: {
          available?: boolean | null
          cocktail_id?: string | null
          id?: string
          price?: number
          sizes_id?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cocktail_sizes_cocktail_id_fkey"
            columns: ["cocktail_id"]
            isOneToOne: false
            referencedRelation: "cocktails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sizes_id"
            columns: ["sizes_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      cocktails: {
        Row: {
          alcohol_percentage: number
          created_at: string | null
          description: string | null
          has_non_alcoholic_version: boolean | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
        }
        Insert: {
          alcohol_percentage?: number
          created_at?: string | null
          description?: string | null
          has_non_alcoholic_version?: boolean | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
        }
        Update: {
          alcohol_percentage?: number
          created_at?: string | null
          description?: string | null
          has_non_alcoholic_version?: boolean | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          cocktail_id: string | null
          id: string
          item_total: number
          order_id: string | null
          order_ref: string | null
          quantity: number
          size_id: string | null
          unit_price: number
        }
        Insert: {
          cocktail_id?: string | null
          id?: string
          item_total: number
          order_id?: string | null
          order_ref?: string | null
          quantity?: number
          size_id?: string | null
          unit_price: number
        }
        Update: {
          cocktail_id?: string | null
          id?: string
          item_total?: number
          order_id?: string | null
          order_ref?: string | null
          quantity?: number
          size_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_cocktail_id_fkey"
            columns: ["cocktail_id"]
            isOneToOne: false
            referencedRelation: "cocktails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          delivery_address: string | null
          delivery_date: string | null
          id: string
          is_paid: boolean | null
          notes: string | null
          order_date: string | null
          order_ref: string | null
          payment_intent_id: string | null
          payment_method: number | null
          shipping_address: Json | null
          status: string | null
          total_amount: number | null
          user_id: string | null
        }
        Insert: {
          delivery_address?: string | null
          delivery_date?: string | null
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          order_date?: string | null
          order_ref?: string | null
          payment_intent_id?: string | null
          payment_method?: number | null
          shipping_address?: Json | null
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Update: {
          delivery_address?: string | null
          delivery_date?: string | null
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          order_date?: string | null
          order_ref?: string | null
          payment_intent_id?: string | null
          payment_method?: number | null
          shipping_address?: Json | null
          status?: string | null
          total_amount?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      sizes: {
        Row: {
          created_at: string | null
          id: string
          name: string
          volume_ml: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          volume_ml: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          volume_ml?: number
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          phone: string | null
          postal_code: string
          street: string
          type: Database["public"]["Enums"]["address_type"] | null
          user_id: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          phone?: string | null
          postal_code: string
          street: string
          type?: Database["public"]["Enums"]["address_type"] | null
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          phone?: string | null
          postal_code?: string
          street?: string
          type?: Database["public"]["Enums"]["address_type"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          cocktail_id: string
          created_at: string | null
          user_id: string
        }
        Insert: {
          cocktail_id: string
          created_at?: string | null
          user_id: string
        }
        Update: {
          cocktail_id?: string
          created_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_cocktail_id_fkey"
            columns: ["cocktail_id"]
            isOneToOne: false
            referencedRelation: "cocktails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          currency: string | null
          language: string | null
          newsletter: boolean | null
          notifications: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          language?: string | null
          newsletter?: boolean | null
          notifications?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          language?: string | null
          newsletter?: boolean | null
          notifications?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_login_at: string | null
          metadata: Json | null
          phone: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["user_status"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_login_at?: string | null
          metadata?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          metadata?: Json | null
          phone?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["user_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users_deprecated: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          password: string
          phone: string | null
          role: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          password: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          password?: string
          phone?: string | null
          role?: string | null
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
      address_type: "shipping" | "billing" | "both"
      user_role:
        | "super_admin"
        | "admin"
        | "manager"
        | "staff"
        | "customer"
        | "guest"
      user_status: "active" | "inactive" | "suspended" | "pending" | "banned"
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
      address_type: ["shipping", "billing", "both"],
      user_role: [
        "super_admin",
        "admin",
        "manager",
        "staff",
        "customer",
        "guest",
      ],
      user_status: ["active", "inactive", "suspended", "pending", "banned"],
    },
  },
} as const
