import React from 'react';
import { Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

type ConnectionState = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR';

interface WebSocketStatusProps {
  connectionState?: ConnectionState;
  className?: string;
  showLabel?: boolean;
}

/**
 * Componente para mostrar el estado de la conexión WebSocket
 * Puede usarse de forma independiente o conectarse al hook useWebSocket
 */
export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  connectionState = 'DISCONNECTED',
  className = '',
  showLabel = true,
}) => {
  const getStatusConfig = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'text-green-600 bg-green-100 border-green-300',
          label: 'Conectado',
        };
      case 'CONNECTING':
        return {
          icon: <Clock className="h-4 w-4 animate-spin" />,
          color: 'text-yellow-600 bg-yellow-100 border-yellow-300',
          label: 'Conectando...',
        };
      case 'ERROR':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-red-600 bg-red-100 border-red-300',
          label: 'Error',
        };
      case 'DISCONNECTED':
      default:
        return {
          icon: <Activity className="h-4 w-4" />,
          color: 'text-gray-600 bg-gray-100 border-gray-300',
          label: 'Desconectado',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color} ${className}`}
      title={`WebSocket: ${config.label}`}
    >
      {config.icon}
      {showLabel && (
        <span className="text-xs font-semibold uppercase tracking-wide">
          {config.label}
        </span>
      )}
    </div>
  );
};
