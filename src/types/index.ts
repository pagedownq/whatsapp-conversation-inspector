
export interface ChatMessage {
  date: Date;
  sender: string;
  content: string;
  isMedia?: boolean;
}

export interface ChatData {
  messages: ChatMessage[];
  title?: string;
}

export interface ChatStats {
  totalMessages: number;
  totalParticipants: number;
  firstMessageDate?: Date;
  lastMessageDate?: Date;
  mediaCount?: number;
  avgMessageLength?: number;
}

export interface ParticipantStats {
  messageCount: number;
  totalCharacters: number;
  emojiCount: number;
  mediaCount: number;
}
