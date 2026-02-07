// ============================================
// USER TYPES
// ============================================

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  photo_profile_url: string | null; // ✅ Field untuk foto profil
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// CONVERSATION TYPES
// ============================================

export interface Conversation {
  id: number;
  ibu_hamil_id: number;
  perawat_id: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithDetails extends Conversation {
  last_message_text: string | null;
  last_message_sender_id: number | null;
  last_message_at: string | null;
  unread_count: number;
  /** Enriched data dari backend (optional) */
  ibu_hamil_name?: string;
  ibu_hamil_photo_url?: string; // ✅ Photo profile URL dari user
  ibu_hamil_phone?: string;
  /** Nested user data (optional, jika backend mengirim nested object) */
  ibu_hamil?: {
    id: number;
    user_id: number;
    nama_lengkap: string;
    user?: User; // ✅ Nested user dengan photo_profile_url
  };
}

export interface ConversationListResponse {
  conversations: ConversationWithDetails[];
  total: number;
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: number;
  conversation_id: number;
  sender_user_id: number;
  sender_name: string | null;
  sender_role: 'perawat' | 'ibu_hamil' | null;
  message_text: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  has_more: boolean;
}

export interface SendMessageRequest {
  ibu_hamil_id: number;
  message_text: string;
}

// ============================================
// WEBSOCKET TYPES
// ============================================

export type WebSocketMessageType =
  | 'connection'
  | 'new_message'
  | 'read_receipt'
  | 'pong'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  message?: Message;
  conversation_id?: number;
  user_id?: number;
  reader_user_id?: number;
  read_count?: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface UnreadCountResponse {
  conversation_id: number;
  unread_count: number;
}

export interface MarkReadResponse {
  message: string;
  read_count: number;
}

// ============================================
// UI STATE TYPES
// ============================================

export interface ChatState {
  conversations: ConversationWithDetails[];
  currentConversationId: number | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  /** WebSocket connection status */
  isConnected: boolean;
}
