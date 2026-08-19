export type User = {
  id: number;
  username: string;
  created_at: number;
};

export type UserProfile = User & {
  about: string;
  country_code: string | null;
  last_seen_at: number | null;
  updated_at: number | null;
};

export type UpdateProfilePayload = {
  about?: string;
  country_code?: string;
};
