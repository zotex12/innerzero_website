export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: "none" | "trial" | "active" | "past_due" | "cancelled" | "expired";
          business_licence: boolean;
          licence_key: string | null;
          supporter: boolean;
          company_name: string | null;
          trial_end: string | null;
          subscription_end: string | null;
          max_devices: number;
          release_channel: string;
          plan: string;
          usage_balance: number;
          usage_monthly_allowance: number;
          founder: boolean;
          billing_cycle_end: string | null;
          overage_enabled: boolean;
          spending_cap_pence: number | null;
          spending_this_cycle_pence: number;
          usage_alerts_sent: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: "none" | "trial" | "active" | "past_due" | "cancelled" | "expired";
          business_licence?: boolean;
          licence_key?: string | null;
          supporter?: boolean;
          company_name?: string | null;
          trial_end?: string | null;
          subscription_end?: string | null;
          max_devices?: number;
          release_channel?: string;
          plan?: string;
          usage_balance?: number;
          usage_monthly_allowance?: number;
          founder?: boolean;
          billing_cycle_end?: string | null;
          overage_enabled?: boolean;
          spending_cap_pence?: number | null;
          spending_this_cycle_pence?: number;
          usage_alerts_sent?: string[];
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: "none" | "trial" | "active" | "past_due" | "cancelled" | "expired";
          business_licence?: boolean;
          licence_key?: string | null;
          supporter?: boolean;
          company_name?: string | null;
          trial_end?: string | null;
          subscription_end?: string | null;
          max_devices?: number;
          release_channel?: string;
          plan?: string;
          usage_balance?: number;
          usage_monthly_allowance?: number;
          founder?: boolean;
          billing_cycle_end?: string | null;
          overage_enabled?: boolean;
          spending_cap_pence?: number | null;
          spending_this_cycle_pence?: number;
          usage_alerts_sent?: string[];
          updated_at?: string;
        };
        Relationships: [];
      };
      licences: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          licence_key: string;
          licence_type: string;
          company_name: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: string;
          seats: number;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          user_id: string;
          email: string;
          licence_key: string;
          licence_type: string;
          company_name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: string;
          seats?: number;
          expires_at?: string | null;
        };
        Update: {
          status?: string;
          seats?: number;
          company_name?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      waitlist: {
        Row: {
          id: number;
          email: string;
          source: string;
          created_at: string;
        };
        Insert: {
          email: string;
          source?: string;
        };
        Update: {
          email?: string;
          source?: string;
        };
        Relationships: [];
      };
      devices: {
        Row: {
          id: string;
          user_id: string;
          device_fingerprint: string;
          device_name: string | null;
          os: string | null;
          app_version: string | null;
          last_validated: string;
          activated_at: string;
          is_active: boolean;
        };
        Insert: {
          user_id: string;
          device_fingerprint: string;
          device_name?: string | null;
          os?: string | null;
          app_version?: string | null;
        };
        Update: {
          device_name?: string | null;
          os?: string | null;
          app_version?: string | null;
          last_validated?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      licence_events: {
        Row: {
          id: string;
          user_id: string | null;
          device_id: string | null;
          event_type: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          device_id?: string | null;
          event_type: string;
          metadata?: Record<string, unknown>;
        };
        Update: {
          event_type?: string;
          metadata?: Record<string, unknown>;
        };
        Relationships: [];
      };
      cloud_plans: {
        Row: {
          id: string;
          name: string;
          plan_type: "subscription" | "payg";
          stripe_product_id: string;
          stripe_price_id: string;
          usage_amount: number;
          price_pence: number;
          tier_access: string[];
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          plan_type: "subscription" | "payg";
          stripe_product_id: string;
          stripe_price_id: string;
          usage_amount: number;
          price_pence: number;
          tier_access?: string[];
          sort_order?: number;
          active?: boolean;
        };
        Update: {
          name?: string;
          plan_type?: "subscription" | "payg";
          stripe_product_id?: string;
          stripe_price_id?: string;
          usage_amount?: number;
          price_pence?: number;
          tier_access?: string[];
          sort_order?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      model_tiers: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          cost_per_request: number;
          usage_multiplier: number;
          models: { model_id: string; provider: string; priority?: number; display_name?: string }[];
          sort_order: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          cost_per_request: number;
          usage_multiplier?: number;
          models?: { model_id: string; provider: string; priority?: number; display_name?: string }[];
          sort_order?: number;
          active?: boolean;
        };
        Update: {
          name?: string;
          display_name?: string;
          cost_per_request?: number;
          usage_multiplier?: number;
          models?: { model_id: string; provider: string; priority?: number; display_name?: string }[];
          sort_order?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      usage_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          amount: number;
          balance_after: number;
          description: string | null;
          stripe_session_id: string | null;
          model_tier: string | null;
          provider: string | null;
          model_id: string | null;
          request_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          type: string;
          amount: number;
          balance_after: number;
          description?: string | null;
          stripe_session_id?: string | null;
          model_tier?: string | null;
          provider?: string | null;
          model_id?: string | null;
          request_id?: string | null;
        };
        Update: {
          type?: string;
          amount?: number;
          balance_after?: number;
          description?: string | null;
        };
        Relationships: [];
      };
      usage_packs: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          usage_granted: number;
          usage_remaining: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          plan_id: string;
          usage_granted: number;
          usage_remaining: number;
          expires_at?: string | null;
        };
        Update: {
          usage_remaining?: number;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      proxy_cost_log: {
        Row: {
          id: string;
          user_id: string;
          request_id: string | null;
          provider: string;
          model_id: string;
          input_tokens: number;
          output_tokens: number;
          estimated_cost_pence: number;
          usage_deducted: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          request_id?: string | null;
          provider: string;
          model_id: string;
          input_tokens: number;
          output_tokens: number;
          estimated_cost_pence: number;
          usage_deducted: number;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      theme_codes: {
        Row: {
          id: string;
          code_hash: string;
          theme_id: string;
          label: string;
          max_uses: number;
          uses: number;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          code_hash: string;
          theme_id: string;
          label: string;
          max_uses?: number;
          uses?: number;
          expires_at?: string | null;
        };
        Update: {
          uses?: number;
          max_uses?: number;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      theme_redemptions: {
        Row: {
          id: string;
          code_id: string;
          user_id: string | null;
          device_fingerprint: string;
          redeemed_at: string;
        };
        Insert: {
          code_id: string;
          user_id?: string | null;
          device_fingerprint: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      atomic_deduct_subscription: {
        Args: { p_user_id: string; p_amount: number };
        Returns: number | null;
      };
      atomic_deduct_sub_with_cap: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_cost_pence: number;
        };
        Returns: {
          new_balance: number | null;
          new_spend_pence: number | null;
          rejected_reason: string | null;
        }[];
      };
      atomic_deduct_pack: {
        Args: { p_pack_id: string; p_amount: number };
        Returns: number | null;
      };
      atomic_grant_subscription: {
        Args: { p_user_id: string; p_amount: number };
        Returns: number;
      };
      atomic_cycle_reset: {
        Args: {
          p_user_id: string;
          p_allowance: number;
          p_new_cycle_end: string;
          p_request_id: string;
        };
        Returns: { new_balance: number; applied: boolean }[];
      };
      atomic_upgrade_grant: {
        Args: {
          p_user_id: string;
          p_added_amount: number;
          p_new_allowance: number;
          p_new_plan: string | null;
          p_request_id: string;
        };
        Returns: { new_balance: number; applied: boolean }[];
      };
      atomic_pack_expire: {
        Args: { p_pack_id: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
