export type CreateInviteLinkPayload = {
  expires_in_seconds: number;
  max_uses: number | null;
  allow_registration: boolean;
};

export type InviteLink = {
  id: number;
  server_id: number;
  server_name: string;
  creator_username: string;
  token: string;
  expires_at: number;
  max_uses: number | null;
  use_count: number;
  allow_registration: boolean;
  created_at: number;
};

export type CreateDirectInvitePayload = {
  username: string;
};

export type LinkPreview = {
  server_id: number;
  server_name: string;
  creator_username: string;
  expires_at: number;
  max_uses: number | null;
  use_count: number;
  allow_registration: boolean;
};

export type LinkAcceptance = {
  server_id: number;
  already_member: boolean;
};
