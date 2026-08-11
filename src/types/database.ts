/**
 * Tipos que reflejan el esquema SQL de supabase/migrations/. Si el esquema
 * cambia, actualizar aquí en el mismo PR que la migración.
 */

export type PlaceStatus = 'active' | 'inactive' | 'pending';

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  created_at: string;
};

export type PlaceSchedule = Record<string, string>;

export type Place = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  tags: string[];
  address: string | null;
  locality: string | null;
  lat: number;
  lng: number;
  price_min: number | null;
  price_max: number | null;
  schedule: PlaceSchedule | null;
  rating_avg: number;
  review_count: number;
  status: PlaceStatus;
  is_mock: boolean;
  created_at: string;
};

export type PlaceImage = {
  id: string;
  place_id: string;
  url: string;
  position: number;
  created_at: string;
};

export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  amount_paid: number | null;
  occasion: string | null;
  created_at: string;
  updated_at: string;
};

export type Favorite = {
  user_id: string;
  place_id: string;
  created_at: string;
};
