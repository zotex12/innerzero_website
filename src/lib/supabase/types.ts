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
          trial_end: string | null;
          subscription_end: string | null;
          max_devices: number;
          release_channel: string;
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
          trial_end?: string | null;
          subscription_end?: string | null;
          max_devices?: number;
          release_channel?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: "none" | "trial" | "active" | "past_due" | "cancelled" | "expired";
          trial_end?: string | null;
          subscription_end?: string | null;
          max_devices?: number;
          release_channel?: string;
          updated_at?: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
