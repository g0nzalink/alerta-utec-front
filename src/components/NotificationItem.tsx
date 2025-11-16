import React from 'react';
import type { Notification } from '../types';
import { formatRelativeTime } from '../utils/date';
import { Bell, AlertCircle, MessageSquare, RefreshCw, Check } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onViewIncident: (incidentId: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onViewIncident,
}) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'INCIDENT_CREATED':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      case 'INCIDENT_UPDATED':
        return <RefreshCw className="h-5 w-5 text-yellow-600" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onViewIncident(notification.incidentId);
  };

  return (
    <div
      className={`card cursor-pointer hover:border-gray-400 transition-all duration-200 ${
        !notification.read ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <p className={`text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
              {notification.message}
            </p>
            
            {!notification.read && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                className="ml-2 text-primary-600 hover:text-primary-700 transition-colors duration-150"
                title="Marcar como leída"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-600">
              {formatRelativeTime(notification.timestamp)}
            </span>
            
            {!notification.read && (
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
