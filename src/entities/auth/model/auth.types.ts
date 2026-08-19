export type UserRole = "owner" | "admin" | "member";

export type Registration = "invite_only" | "open";

export type SessionInfo = {
  token: string;
  expires_at: number;
};

export type AuthUser = {
  id: number;
  username: string;
  created_at: number;
};

export type AuthResponse = {
  user: AuthUser;
  session: SessionInfo;
};

export type RefreshResponse = {
  token: string;
  expires_at: number;
};

export type InstanceInfo = {
  instance_id: string;
  name: string;
  initialized: boolean;
  registration: Registration;
  protocol_version: number;
  created_at: number;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
  password_confirm: string;
  invite_token: string;
};
