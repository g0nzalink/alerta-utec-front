import { TOKEN_KEY } from '../config';

// URL del WebSocket de AWS API Gateway
const WEBSOCKET_URL = 'wss://gsct6b4dbh.execute-api.us-east-1.amazonaws.com/dev';

// Flag para habilitar/deshabilitar WebSocket en desarrollo
export const WEBSOCKET_ENABLED = false; // ⚠️ Deshabilitado hasta que el backend esté listo

// Tipos de mensajes WebSocket
export type WebSocketMessageType = 
  | 'sendMessage'
  | 'subscribeComments'
  | 'subscribeIncidents'
  | 'subscribeNotify'
  | 'unsubscribe';

// Estructura de mensaje saliente
export interface WebSocketOutgoingMessage {
  type: WebSocketMessageType;
  message?: string;
  incidentId?: string;
  action?: string;
}

// Estructura de mensaje entrante
export interface WebSocketIncomingMessage {
  type: string;
  data?: any;
  message?: string;
  incident?: any;
  comment?: any;
  notification?: any;
  timestamp?: string;
}

// Opciones de configuración del WebSocket
export interface WebSocketOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketIncomingMessage) => void;
}

/**
 * Cliente WebSocket para comunicación en tiempo real con el backend
 * Maneja conexión, reconexión automática, suscripciones y mensajes
 */
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private options: Required<WebSocketOptions>;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private subscriptions: Set<string> = new Set();
  private messageQueue: WebSocketOutgoingMessage[] = [];
  private isConnecting = false;

  constructor(options: WebSocketOptions = {}) {
    this.url = WEBSOCKET_URL;
    this.options = {
      autoReconnect: options.autoReconnect ?? true,
      reconnectInterval: options.reconnectInterval ?? 3000,
      maxReconnectAttempts: options.maxReconnectAttempts ?? 10,
      heartbeatInterval: options.heartbeatInterval ?? 30000,
      onOpen: options.onOpen ?? (() => {}),
      onClose: options.onClose ?? (() => {}),
      onError: options.onError ?? (() => {}),
      onMessage: options.onMessage ?? (() => {}),
    };
  }

  /**
   * Conecta al servidor WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('🔌 WebSocket ya está conectado');
        resolve();
        return;
      }

      if (this.isConnecting) {
        console.log('🔌 WebSocket conexión en progreso...');
        return;
      }

      this.isConnecting = true;

      try {
        // Obtener token de autenticación
        const token = localStorage.getItem(TOKEN_KEY);
        
        // Agregar token como query parameter
        const wsUrl = token 
          ? `${this.url}?token=${encodeURIComponent(token)}`
          : this.url;

        console.log('🔌 Conectando a WebSocket...');
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket conectado');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.options.onOpen();
          this.startHeartbeat();
          this.resubscribe();
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket desconectado:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.options.onClose(event);
          
          if (this.options.autoReconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          this.options.onError(error);
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketIncomingMessage = JSON.parse(event.data);
            console.log('📨 WebSocket mensaje recibido:', message);
            this.options.onMessage(message);
          } catch (error) {
            console.error('❌ Error parseando mensaje WebSocket:', error);
          }
        };

      } catch (error) {
        console.error('❌ Error creando WebSocket:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Desconecta del servidor WebSocket
   */
  disconnect(): void {
    console.log('🔌 Desconectando WebSocket...');
    
    this.stopHeartbeat();
    this.stopReconnect();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.subscriptions.clear();
    this.messageQueue = [];
  }

  /**
   * Envía un mensaje al servidor
   */
  send(message: WebSocketOutgoingMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket no conectado, encolando mensaje');
      this.messageQueue.push(message);
      return;
    }

    try {
      const payload = JSON.stringify(message);
      console.log('📤 Enviando mensaje WebSocket:', message);
      this.ws.send(payload);
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
    }
  }

  /**
   * Suscribirse a comentarios de un incidente
   */
  subscribeToComments(incidentId: string): void {
    const subscription = `comments:${incidentId}`;
    
    if (this.subscriptions.has(subscription)) {
      console.log(`📢 Ya suscrito a comentarios del incidente ${incidentId}`);
      return;
    }

    this.send({
      type: 'subscribeComments',
      action: 'subscribe',
      incidentId,
    });

    this.subscriptions.add(subscription);
    console.log(`✅ Suscrito a comentarios del incidente ${incidentId}`);
  }

  /**
   * Suscribirse a actualizaciones de incidentes
   */
  subscribeToIncidents(): void {
    const subscription = 'incidents';
    
    if (this.subscriptions.has(subscription)) {
      console.log('📢 Ya suscrito a actualizaciones de incidentes');
      return;
    }

    this.send({
      type: 'subscribeIncidents',
      action: 'subscribe',
    });

    this.subscriptions.add(subscription);
    console.log('✅ Suscrito a actualizaciones de incidentes');
  }

  /**
   * Suscribirse a notificaciones del usuario
   */
  subscribeToNotifications(): void {
    const subscription = 'notifications';
    
    if (this.subscriptions.has(subscription)) {
      console.log('📢 Ya suscrito a notificaciones');
      return;
    }

    this.send({
      type: 'subscribeNotify',
      action: 'subscribe',
    });

    this.subscriptions.add(subscription);
    console.log('✅ Suscrito a notificaciones');
  }

  /**
   * Cancelar suscripción
   */
  unsubscribe(subscription: string): void {
    if (!this.subscriptions.has(subscription)) {
      return;
    }

    this.send({
      type: 'unsubscribe',
      action: 'unsubscribe',
    });

    this.subscriptions.delete(subscription);
    console.log(`❌ Desuscrito de ${subscription}`);
  }

  /**
   * Re-suscribirse a todas las suscripciones después de reconexión
   */
  private resubscribe(): void {
    console.log('🔄 Re-suscribiendo a canales...');
    
    this.subscriptions.forEach(subscription => {
      if (subscription.startsWith('comments:')) {
        const incidentId = subscription.split(':')[1];
        this.send({
          type: 'subscribeComments',
          action: 'subscribe',
          incidentId,
        });
      } else if (subscription === 'incidents') {
        this.send({
          type: 'subscribeIncidents',
          action: 'subscribe',
        });
      } else if (subscription === 'notifications') {
        this.send({
          type: 'subscribeNotify',
          action: 'subscribe',
        });
      }
    });
  }

  /**
   * Vacía la cola de mensajes pendientes
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(`📤 Enviando ${this.messageQueue.length} mensajes encolados`);
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Programa reconexión automática
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval * Math.min(this.reconnectAttempts, 5);

    console.log(`🔄 Reconectando en ${delay}ms (intento ${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch(error => {
        console.error('❌ Error en reconexión:', error);
      });
    }, delay);
  }

  /**
   * Detiene el timer de reconexión
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Inicia heartbeat para mantener la conexión viva
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'sendMessage', message: 'ping' });
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Detiene el heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Obtiene el estado actual de la conexión
   */
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Obtiene las suscripciones activas
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }
}

// Exportar instancia singleton (opcional, se puede crear múltiples instancias)
let globalWebSocketClient: WebSocketClient | null = null;

export function getWebSocketClient(options?: WebSocketOptions): WebSocketClient {
  if (!globalWebSocketClient) {
    globalWebSocketClient = new WebSocketClient(options);
  }
  return globalWebSocketClient;
}

export function disconnectWebSocket(): void {
  if (globalWebSocketClient) {
    globalWebSocketClient.disconnect();
    globalWebSocketClient = null;
  }
}
