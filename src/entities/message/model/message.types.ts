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

export type SendMessagePayload = {
  content: string;
};

export type UpdateMessagePayload = {
  content: string;
};
