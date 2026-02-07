import type { Message, WebSocketMessage } from '@/lib/types/chat';
import { useAuthStore } from '@/lib/stores/auth-store';

// ============================================
// WEBSOCKET MANAGER CLASS
// ============================================

export class ChatWebSocketManager {
  private ws: WebSocket | null = null;
  private conversationId: number | null = null;
  private token: string | null = null;

  /** True saat disconnect() sengaja dipanggil (cleanup/React Strict Mode). Mencegah log error & reconnect. */
  private isClosing = false;

  // Reconnection config
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  // Heartbeat
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatFrequency = 20000; // 20 seconds

  // Event callbacks
  public onMessage: ((message: Message) => void) | null = null;
  public onReadReceipt: ((data: {
    conversation_id: number;
    reader_user_id: number;
    read_count: number;
  }) => void) | null = null;
  public onConnect: (() => void) | null = null;
  public onDisconnect: (() => void) | null = null;
  public onError: ((error: Event) => void) | null = null;

  constructor() {
    if (typeof window === 'undefined') {
      console.warn('WebSocket not available in SSR environment');
    }
  }

  /**
   * Connect to WebSocket server
   * If token is not provided, it will be fetched from Auth Store
   */
  public connect(conversationId: number, token?: string): void {
    // Get token from Auth Store if not provided
    let authToken = token;
    if (!authToken) {
      const authState = useAuthStore.getState();
      authToken = authState.token || null;
      if (!authToken) {
        console.error('WebSocket: No token provided and no token in Auth Store');
        this.onError?.(new Event('no_token'));
        return;
      }
    }

    if (
      this.conversationId === conversationId &&
      this.token === authToken &&
      this.ws !== null &&
      this.ws.readyState === WebSocket.OPEN
    ) {
      return;
    }

    this.disconnect();

    this.isClosing = false;
    this.conversationId = conversationId;
    this.token = authToken;
    this.reconnectAttempts = 0;

    this._createConnection();
  }

  /**
   * Disconnect from WebSocket server (dipanggil saat cleanup / ganti conversation).
   * Set isClosing agar onerror/onclose tidak dianggap error nyata dan tidak reconnect.
   * Tidak memanggil ws.close() saat CONNECTING agar browser tidak log
   * "WebSocket is closed before the connection is established".
   */
  public disconnect(): void {
    this.isClosing = true;
    this._stopHeartbeat();

    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws !== null) {
      const ws = this.ws;
      this.ws = null;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CLOSING) {
        ws.close();
      }
    }

    this.conversationId = null;
    this.token = null;
    this.reconnectAttempts = 0;

    this.onDisconnect?.();
  }

  /**
   * Send data through WebSocket (e.g. ping, typing indicator)
   */
  public send(data: Record<string, unknown>): void {
    if (this.ws !== null && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private _getWsBaseUrl(): string {
    if (typeof window === 'undefined') {
      return 'ws://localhost:8000';
    }
    const envWs = process.env.NEXT_PUBLIC_WS_BASE_URL;
    if (envWs) {
      return envWs;
    }
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://103.191.92.29:8000';
    return apiUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
  }

  private _createConnection(): void {
    if (typeof window === 'undefined' || this.conversationId === null || this.token === null) {
      return;
    }

    const wsBaseUrl = this._getWsBaseUrl();
    const separator = wsBaseUrl.includes('?') ? '&' : '?';
    const wsUrl = `${wsBaseUrl}/api/v1/ws/chat/${this.conversationId}${separator}token=${encodeURIComponent(this.token)}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this._handleOpen.bind(this);
      this.ws.onmessage = this._handleMessage.bind(this);
      this.ws.onerror = this._handleError.bind(this);
      this.ws.onclose = this._handleClose.bind(this);
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this._attemptReconnect();
    }
  }

  private _handleOpen(): void {
    if (this.isClosing) {
      this.ws?.close();
      this.ws = null;
      return;
    }
    this.reconnectAttempts = 0;
    this._startHeartbeat();
    this.onConnect?.();
  }

  private _handleMessage(event: MessageEvent): void {
    try {
      const data: WebSocketMessage = JSON.parse(event.data);

      switch (data.type) {
        case 'connection':
          console.log('WebSocket connection confirmed');
          break;

        case 'new_message':
          if (data.message) {
            this.onMessage?.(data.message);
          }
          break;

        case 'read_receipt':
          if (
            data.conversation_id !== undefined &&
            data.reader_user_id !== undefined &&
            data.read_count !== undefined
          ) {
            this.onReadReceipt?.({
              conversation_id: data.conversation_id,
              reader_user_id: data.reader_user_id,
              read_count: data.read_count,
            });
          }
          break;

        case 'pong':
          break;

        case 'error':
          console.error('WebSocket error message:', data);
          break;

        default:
          console.warn('Unknown WebSocket message type:', (data as { type?: string }).type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private _handleError(event: Event): void {
    if (this.isClosing) return;
    // Tidak log ke console agar tidak duplikat dengan warning browser "WebSocket is closed before..."
    this.onError?.(event);
  }

  private _handleClose(event: CloseEvent): void {
    const closedSocket = event.target as WebSocket;
    this._stopHeartbeat();

    if (this.isClosing) {
      this.isClosing = false;
      return;
    }

    if (closedSocket !== this.ws) return;

    this.ws = null;
    console.log('WebSocket disconnected');
    this.onDisconnect?.();
    this._attemptReconnect();
  }

  private _attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    // Try to get token from Auth Store if not available
    if (this.token === null) {
      const authState = useAuthStore.getState();
      this.token = authState.token || null;
    }

    if (this.conversationId === null || this.token === null) {
      console.warn('WebSocket: Cannot reconnect - missing conversationId or token');
      return;
    }

    this.reconnectAttempts++;
    const delay =
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      // Re-check token from Auth Store before reconnecting
      if (this.token === null) {
        const authState = useAuthStore.getState();
        this.token = authState.token || null;
      }

      if (this.conversationId !== null && this.token !== null) {
        this._createConnection();
      } else {
        console.warn('WebSocket: Cannot reconnect - missing credentials');
      }
      this.reconnectTimer = null;
    }, delay);
  }

  private _startHeartbeat(): void {
    this._stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.ws !== null && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatFrequency);
  }

  private _stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const chatWebSocket = new ChatWebSocketManager();

export default ChatWebSocketManager;
