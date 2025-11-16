import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

/**
 * Componente indicador del estado de conexión WebSocket
 * Muestra un icono en la esquina que indica si está conectado o no
 */
export const WebSocketIndicator: React.FC = () => {
  const { isConnected, connect, subscriptions } = useWebSocket({
    autoConnect: true,
    autoReconnect: true,
  });

  const handleClick = () => {
    if (!isConnected) {
      connect();
    }
  };

  return (
    <div 
      className="fixed bottom-4 right-4 z-40"
      title={isConnected ? `Conectado (${subscriptions.length} suscripciones)` : 'Desconectado'}
    >
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all ${
          isConnected
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
        }`}
      >
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4" />
            <span className="text-xs font-bold">Tiempo Real</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span className="text-xs font-bold">Desconectado</span>
          </>
        )}
      </button>
    </div>
  );
};
