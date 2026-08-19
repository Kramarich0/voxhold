export type ChannelKind = "text" | "voice";

export type Channel = {
  id: number;
  server_id: number;
  name: string;
  kind: ChannelKind;
  position: number;
  created_by: number;
  created_at: number;
};

export type CreateChannelPayload = {
  name: string;
  kind: ChannelKind;
};

export type UpdateChannelPayload = {
  name: string;
};
