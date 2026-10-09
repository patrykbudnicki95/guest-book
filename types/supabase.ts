export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          owner_id: string;
          names: string;
          date: string;
          location: string | null;
          qr_code_url: string | null;
          theme_color: string | null;
          cover_photo_url: string | null;
          welcome_message: string | null;
          schedule: Json | null;
          menu: Json | null;
          plan_id: string;
          addons: string[];
          storage_used_bytes: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          names: string;
          date: string;
          location?: string | null;
          qr_code_url?: string | null;
          theme_color?: string | null;
          cover_photo_url?: string | null;
          welcome_message?: string | null;
          schedule?: Json | null;
          menu?: Json | null;
          plan_id?: string;
          addons?: string[];
          storage_used_bytes?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          names?: string;
          date?: string;
          location?: string | null;
          qr_code_url?: string | null;
          theme_color?: string | null;
          cover_photo_url?: string | null;
          welcome_message?: string | null;
          schedule?: Json | null;
          menu?: Json | null;
          plan_id?: string;
          addons?: string[];
          storage_used_bytes?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      entries: {
        Row: {
          id: string;
          event_id: string;
          guest_name: string | null;
          message: string | null;
          is_private: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          guest_name?: string | null;
          message?: string | null;
          is_private?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          guest_name?: string | null;
          message?: string | null;
          is_private?: boolean;
          created_at?: string;
        };
      };
      uploads: {
        Row: {
          id: string;
          event_id: string;
          entry_id: string;
          file_url: string;
          thumbnail_url: string | null;
          media_type: "image" | "video";
          file_size_bytes: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          entry_id: string;
          file_url: string;
          thumbnail_url?: string | null;
          media_type: "image" | "video";
          file_size_bytes?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          entry_id?: string;
          file_url?: string;
          thumbnail_url?: string | null;
          media_type?: "image" | "video";
          file_size_bytes?: number;
          sort_order?: number;
          created_at?: string;
        };
      };
      event_seating: {
        Row: {
          event_id: string;
          tables: Json;
          is_published: boolean;
          updated_at: string;
        };
        Insert: {
          event_id: string;
          tables?: Json;
          is_published?: boolean;
          updated_at?: string;
        };
        Update: {
          event_id?: string;
          tables?: Json;
          is_published?: boolean;
          updated_at?: string;
        };
      };
      event_save_the_date: {
        Row: {
          event_id: string;
          template: string;
          content: Json;
          is_published: boolean;
          updated_at: string;
        };
        Insert: {
          event_id: string;
          template?: string;
          content?: Json;
          is_published?: boolean;
          updated_at?: string;
        };
        Update: {
          event_id?: string;
          template?: string;
          content?: Json;
          is_published?: boolean;
          updated_at?: string;
        };
      };
    };
    Functions: {
      create_entry: {
        Args: { p_entry: Json; p_uploads: Json };
        Returns: undefined;
      };
    };
  };
}
