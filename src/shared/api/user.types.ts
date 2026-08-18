export type User = {
  id: number;
  username: string;
  created_at: number;
};

export type UserProfile = {
  about: string;
  country_code: string | null;
  last_seen_at: number | null;
  updated_at: number | null;
} & User;
