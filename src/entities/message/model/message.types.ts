export type MessageAuthor = {
  user_id: number;
  username: string;
};

export type Message = {
  id: number;
  channel_id: number;
  author: MessageAuthor;
  content: string;
  created_at: number;
  edited_at: number | null;
};

export type MessagePagination = {
  next_before_id: number | null;
  has_more: boolean;
};

export type MessagePage = {
  messages: Message[];
  pagination: MessagePagination;
};

export type PinnedMessage = {
  message: Message;
  pinned_by: MessageAuthor;
  pinned_at: number;
};

export type SearchResult = {
  id: number;
  channel_id: number;
  channel_name: string;
  author: MessageAuthor;
  content: string;
  created_at: number;
  edited_at: number | null;
};

export type SearchPage = {
  messages: SearchResult[];
  pagination: MessagePagination;
};

export type MessageContext = {
  messages: Message[];
  target_message_id: number;
  target_index: number;
};

export type ChannelRead = {
  server_id: number;
  channel_id: number;
  user_id: number;
  last_read_message_id: number;
  updated_at: number;
};

export type SendMessagePayload = {
  content: string;
};

export type UpdateMessagePayload = {
  content: string;
};

export type MarkChannelReadPayload = {
  last_read_message_id: number;
};

export type AutocompleteEmoji = {
  id: string;
  name: string;
  native?: string;
  url?: string;
  keywords?: string[];
  isCustom?: boolean;
};
