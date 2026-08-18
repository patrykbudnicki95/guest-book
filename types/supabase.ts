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
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      uploads: {
        Row: {
          id: string;
          event_id: string;
          file_url: string;
          thumbnail_url: string | null;
          media_type: "image" | "video";
          guest_name: string | null;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          file_url: string;
          thumbnail_url?: string | null;
          media_type: "image" | "video";
          guest_name?: string | null;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          file_url?: string;
          thumbnail_url?: string | null;
          media_type?: "image" | "video";
          guest_name?: string | null;
          caption?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
