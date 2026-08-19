export type ServerRole = "owner" | "admin" | "member";

export type Server = {
  id: number;
  name: string;
  created_by: number;
  created_at: number;
};

export type JoinedServer = {
  id: number;
  name: string;
  created_by: number;
  created_at: number;
  role: ServerRole;
  joined_at: number;
};

export type ServerMember = {
  user_id: number;
  username: string;
  created_at: number;
  role: ServerRole;
  joined_at: number;
  about: string;
  country_code: string | null;
  last_seen_at: number | null;
};

export type UpdateServerPayload = {
  name: string;
};

export type UpdateMemberRolePayload = {
  role: Extract<ServerRole, "admin" | "member">;
};
