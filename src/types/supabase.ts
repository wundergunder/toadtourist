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
      territories: {
        Row: {
          id: string
          name: string
          description: string
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image_url?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'territory_manager' | 'tour_guide' | 'tourist'
          territory_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'territory_manager' | 'tour_guide' | 'tourist'
          territory_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'territory_manager' | 'tour_guide' | 'tourist'
          territory_id?: string | null
          created_at?: string
        }
      }
      experiences: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          duration: number
          max_spots: number
          available_spots: number
          image_urls: string[]
          territory_id: string
          guide_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          duration: number
          max_spots: number
          available_spots: number
          image_urls: string[]
          territory_id: string
          guide_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          duration?: number
          max_spots?: number
          available_spots?: number
          image_urls?: string[]
          territory_id?: string
          guide_id?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          experience_id: string
          tourist_id: string
          booking_date: string
          num_people: number
          total_price: number
          payment_method: 'cash' | 'card'
          payment_status: 'pending' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          experience_id: string
          tourist_id: string
          booking_date: string
          num_people: number
          total_price: number
          payment_method: 'cash' | 'card'
          payment_status: 'pending' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          experience_id?: string
          tourist_id?: string
          booking_date?: string
          num_people?: number
          total_price?: number
          payment_method?: 'cash' | 'card'
          payment_status?: 'pending' | 'completed'
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          tourist_id: string
          experience_id: string
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          tourist_id: string
          experience_id: string
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          tourist_id?: string
          experience_id?: string
          rating?: number
          comment?: string
          created_at?: string
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
    Storage: {
      Buckets: {
        images: {
          Row: {
            id: string
            name: string
            owner: string | null
            created_at: string | null
            updated_at: string | null
            public: boolean | null
            avif_autodetection: boolean | null
            file_size_limit: number | null
            allowed_mime_types: string[] | null
          }
          Insert: {
            id: string
            name: string
            owner?: string | null
            created_at?: string | null
            updated_at?: string | null
            public?: boolean | null
            avif_autodetection?: boolean | null
            file_size_limit?: number | null
            allowed_mime_types?: string[] | null
          }
          Update: {
            id?: string
            name?: string
            owner?: string | null
            created_at?: string | null
            updated_at?: string | null
            public?: boolean | null
            avif_autodetection?: boolean | null
            file_size_limit?: number | null
            allowed_mime_types?: string[] | null
          }
        }
      }
      Objects: {
        [_ in never]: never
      }
    }
  }
}