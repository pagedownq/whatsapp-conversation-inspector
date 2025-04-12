
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

export interface Payment {
  id: string;
  user_id: string;
  merchant_oid: string;
  amount: number;
  payment_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  payment_response?: any;
}

export interface PaymentResponse {
  payment_link: string;
  merchant_oid: string;
}
