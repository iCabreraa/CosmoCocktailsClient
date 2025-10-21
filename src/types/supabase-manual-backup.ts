// =====================================================
// TIPOS DE SUPABASE GENERADOS
// Sprint 1.1.4 - Generar tipos de TypeScript desde Supabase
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      cocktails: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string;
          alcohol_percentage: number;
          has_non_alcoholic_version: boolean;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          image_url: string;
          alcohol_percentage: number;
          has_non_alcoholic_version?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          image_url?: string;
          alcohol_percentage?: number;
          has_non_alcoholic_version?: boolean;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cocktail_sizes: {
        Row: {
          id: string;
          cocktail_id: string;
          sizes_id: string;
          price: number;
          stock_quantity: number;
          available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cocktail_id: string;
          sizes_id: string;
          price: number;
          stock_quantity?: number;
          available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cocktail_id?: string;
          sizes_id?: string;
          price?: number;
          stock_quantity?: number;
          available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cocktail_sizes_cocktail_id_fkey";
            columns: ["cocktail_id"];
            isOneToOne: false;
            referencedRelation: "cocktails";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cocktail_sizes_sizes_id_fkey";
            columns: ["sizes_id"];
            isOneToOne: false;
            referencedRelation: "sizes";
            referencedColumns: ["id"];
          },
        ];
      };
      sizes: {
        Row: {
          id: string;
          name: string;
          volume_ml: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          volume_ml: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          volume_ml?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: "admin" | "staff" | "customer";
          status: "active" | "inactive" | "suspended";
          preferences: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "staff" | "customer";
          status?: "active" | "inactive" | "suspended";
          preferences?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "staff" | "customer";
          status?: "active" | "inactive" | "suspended";
          preferences?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          language: string;
          currency: string;
          theme: string;
          notifications: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          language?: string;
          currency?: string;
          theme?: string;
          notifications?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          language?: string;
          currency?: string;
          theme?: string;
          notifications?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          cocktail_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cocktail_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cocktail_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_favorites_cocktail_id_fkey";
            columns: ["cocktail_id"];
            isOneToOne: false;
            referencedRelation: "cocktails";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total_amount: number;
          status:
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_status: "pending" | "paid" | "failed" | "refunded";
          shipping_address: Json;
          billing_address: Json;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_amount: number;
          status?:
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          shipping_address: Json;
          billing_address: Json;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_amount?: number;
          status?:
            | "pending"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          shipping_address?: Json;
          billing_address?: Json;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          cocktail_id: string;
          size_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          cocktail_id: string;
          size_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          cocktail_id?: string;
          size_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_cocktail_id_fkey";
            columns: ["cocktail_id"];
            isOneToOne: false;
            referencedRelation: "cocktails";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_size_id_fkey";
            columns: ["size_id"];
            isOneToOne: false;
            referencedRelation: "sizes";
            referencedColumns: ["id"];
          },
        ];
      };
      security_events: {
        Row: {
          id: string;
          event_type: string;
          user_id: string | null;
          success: boolean;
          reason: string | null;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_type: string;
          user_id?: string | null;
          success: boolean;
          reason?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_type?: string;
          user_id?: string | null;
          success?: boolean;
          reason?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          address: Json | null;
          preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone?: string | null;
          address?: Json | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          address?: Json | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "admin" | "staff" | "customer";
      user_status: "active" | "inactive" | "suspended";
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled";
      payment_status: "pending" | "paid" | "failed" | "refunded";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// =====================================================
// TIPOS DE CONVENIENCIA
// =====================================================

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;

// =====================================================
// TIPOS ESPECÍFICOS PARA LA APLICACIÓN
// =====================================================

export type User = Tables<"users">;
export type UserInsert = TablesInsert<"users">;
export type UserUpdate = TablesUpdate<"users">;

export type Cocktail = Tables<"cocktails">;
export type CocktailInsert = TablesInsert<"cocktails">;
export type CocktailUpdate = TablesUpdate<"cocktails">;

export type CocktailSize = Tables<"cocktail_sizes">;
export type CocktailSizeInsert = TablesInsert<"cocktail_sizes">;
export type CocktailSizeUpdate = TablesUpdate<"cocktail_sizes">;

export type Size = Tables<"sizes">;
export type SizeInsert = TablesInsert<"sizes">;
export type SizeUpdate = TablesUpdate<"sizes">;

export type Order = Tables<"orders">;
export type OrderInsert = TablesInsert<"orders">;
export type OrderUpdate = TablesUpdate<"orders">;

export type OrderItem = Tables<"order_items">;
export type OrderItemInsert = TablesInsert<"order_items">;
export type OrderItemUpdate = TablesUpdate<"order_items">;

export type UserPreference = Tables<"user_preferences">;
export type UserPreferenceInsert = TablesInsert<"user_preferences">;
export type UserPreferenceUpdate = TablesUpdate<"user_preferences">;

export type UserFavorite = Tables<"user_favorites">;
export type UserFavoriteInsert = TablesInsert<"user_favorites">;
export type UserFavoriteUpdate = TablesUpdate<"user_favorites">;

export type SecurityEvent = Tables<"security_events">;
export type SecurityEventInsert = TablesInsert<"security_events">;
export type SecurityEventUpdate = TablesUpdate<"security_events">;

export type Client = Tables<"clients">;
export type ClientInsert = TablesInsert<"clients">;
export type ClientUpdate = TablesUpdate<"clients">;

// =====================================================
// TIPOS DE ENUMS
// =====================================================

export type UserRole = Enums<"user_role">;
export type UserStatus = Enums<"user_status">;
export type OrderStatus = Enums<"order_status">;
export type PaymentStatus = Enums<"payment_status">;
