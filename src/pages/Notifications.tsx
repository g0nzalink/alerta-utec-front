import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';
import { notificationsAPI } from '../api/notifications';
import { handleApiError } from '../utils/helpers';
import { Bell, CheckCheck, RefreshCw, AlertCircle, MessageSquare, RefreshCcw, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await notificationsAPI.getNotifications();
      setNotifications(data);
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    
    if (notification.incidentId) {
      navigate(`/incidents/${notification.incidentId}`);
    }
  };

  // Obtener icono según tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="h-5 w-5" />;
      case 'status_change':
        return <RefreshCcw className="h-5 w-5" />;
      case 'assignment':
        return <UserCheck className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  // Obtener color según tipo
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'comment':
        return 'from-blue-500 to-blue-600';
      case 'status_change':
        return 'from-green-500 to-green-600';
      case 'assignment':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center text-3xl font-black text-gray-900">
              <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <Bell className="h-4 w-4" />
              </span>
              Notificaciones
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-900">
              <p className="font-semibold">
                Total: <span className="font-black text-gray-900">{notifications.length}</span> notificaciones
              </p>
              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-gray-900 border-2 border-red-300">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  {unreadCount} sin leer
                </span>
              )}
              {isConnected && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-gray-900 border-2 border-green-300">
                  <span className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  En tiempo real
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadNotifications}
              className="btn-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualizar</span>
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="btn-primary"
              >
                <CheckCheck className="h-4 w-4" />
                <span>Marcar todas como leídas</span>
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="card border-2 border-red-400 bg-red-50 flex items-center gap-3 text-sm text-gray-900 font-bold shadow-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <p>{error}</p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card loading-skeleton h-24" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="card flex flex-col items-center justify-center space-y-4 text-center border-2 shadow-xl p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 border-2 border-blue-300">
              <Bell className="h-8 w-8 text-gray-900" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">No hay notificaciones</h3>
              <p className="mt-1 text-sm text-gray-900 font-semibold">
                Cuando ocurran eventos en los incidentes, aparecerán aquí para que te mantengas al día.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`card cursor-pointer transition-all duration-200 hover:shadow-xl ${
                  !notification.read ? 'bg-utec-cyan/5 border-l-4 border-l-utec-cyan' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${getNotificationColor(notification.type)} text-white shadow-lg`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                      {notification.incidentId && (
                        <span className="text-xs text-utec-cyan hover:text-utec-cyan-dark font-semibold">
                          Ver incidente →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge no leída + Botón marcar como leída */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {!notification.read && (
                      <>
                        <span className="h-2 w-2 rounded-full bg-utec-cyan animate-pulse"></span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="p-2 text-gray-400 hover:text-utec-cyan hover:bg-utec-cyan/10 rounded-lg transition-colors"
                          title="Marcar como leída"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
