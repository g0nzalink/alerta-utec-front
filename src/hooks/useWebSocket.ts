// filepath: /Users/mathias/Desktop/CICLO 4/Cloud/Hack Gonzo/Frontend/src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  WebSocketClient, 
  type WebSocketIncomingMessage, 
  type WebSocketOutgoingMessage,
  getWebSocketClient,
  WEBSOCKET_ENABLED 
} from '../api/websocket';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  autoReconnect?: boolean;
  onMessage?: (message: WebSocketIncomingMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export type ConnectionState = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR';

export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: ConnectionState;
  lastMessage: WebSocketIncomingMessage | null;
  send: (message: WebSocketOutgoingMessage) => void;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribeToComments: (incidentId: string) => void;
  subscribeToIncidents: () => void;
  subscribeToNotifications: () => void;
  unsubscribe: (subscription: string) => void;
  subscriptions: string[];
}

/**
 * Hook personalizado para usar WebSocket en componentes React
 * Maneja automáticamente la conexión, desconexión y limpieza
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    autoReconnect = true,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [lastMessage, setLastMessage] = useState<WebSocketIncomingMessage | null>(null);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const clientRef = useRef<WebSocketClient | null>(null);

  // Inicializar cliente WebSocket
  useEffect(() => {
    console.log('🔌 Inicializando WebSocket hook...');

    // Crear cliente si no existe
    if (!clientRef.current) {
      clientRef.current = getWebSocketClient({
        autoReconnect,
        onOpen: () => {
          console.log('✅ WebSocket conectado (hook)');
          setIsConnected(true);
          setConnectionState('CONNECTED');
          setSubscriptions(clientRef.current?.getSubscriptions() ?? []);
          onOpen?.();
        },
        onClose: () => {
          console.log('🔌 WebSocket desconectado (hook)');
          setIsConnected(false);
          setConnectionState('DISCONNECTED');
          onClose?.();
        },
        onError: (error) => {
          console.error('❌ WebSocket error (hook):', error);
          setConnectionState('ERROR');
          onError?.(error);
        },
        onMessage: (message) => {
          console.log('📨 WebSocket mensaje (hook):', message);
          setLastMessage(message);
          onMessage?.(message);
        },
      });
    }

    // Conectar automáticamente si está habilitado
    if (autoConnect && WEBSOCKET_ENABLED && clientRef.current && !clientRef.current.isConnected()) {
      console.log('🔌 Conectando WebSocket automáticamente...');
      clientRef.current.connect().catch(error => {
        console.error('❌ Error conectando WebSocket:', error);
      });
    } else if (!WEBSOCKET_ENABLED) {
      console.log('⚠️ WebSocket deshabilitado en configuración');
    }

    // Cleanup al desmontar
    return () => {
      console.log('🧹 Limpiando WebSocket hook...');
      // No desconectamos aquí para mantener la conexión entre componentes
      // Solo nos des-suscribimos de los listeners
    };
  }, [autoConnect, autoReconnect]);

  // Actualizar estado de conexión periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (clientRef.current) {
        const connected = clientRef.current.isConnected();
        if (connected !== isConnected) {
          setIsConnected(connected);
        }
        
        const subs = clientRef.current.getSubscriptions();
        if (JSON.stringify(subs) !== JSON.stringify(subscriptions)) {
          setSubscriptions(subs);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, subscriptions]);

  const send = useCallback((message: WebSocketOutgoingMessage) => {
    if (clientRef.current) {
      clientRef.current.send(message);
    }
  }, []);

  const connect = useCallback(async () => {
    if (clientRef.current) {
      setConnectionState('CONNECTING');
      await clientRef.current.connect();
      setIsConnected(true);
      setConnectionState('CONNECTED');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
      setIsConnected(false);
    }
  }, []);

  const subscribeToComments = useCallback((incidentId: string) => {
    if (clientRef.current) {
      clientRef.current.subscribeToComments(incidentId);
      setSubscriptions(clientRef.current.getSubscriptions());
    }
  }, []);

  const subscribeToIncidents = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.subscribeToIncidents();
      setSubscriptions(clientRef.current.getSubscriptions());
    }
  }, []);

  const subscribeToNotifications = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.subscribeToNotifications();
      setSubscriptions(clientRef.current.getSubscriptions());
    }
  }, []);

  const unsubscribe = useCallback((subscription: string) => {
    if (clientRef.current) {
      clientRef.current.unsubscribe(subscription);
      setSubscriptions(clientRef.current.getSubscriptions());
    }
  }, []);

  return {
    isConnected,
    connectionState,
    lastMessage,
    send,
    connect,
    disconnect,
    subscribeToComments,
    subscribeToIncidents,
    subscribeToNotifications,
    unsubscribe,
    subscriptions,
  };
}
