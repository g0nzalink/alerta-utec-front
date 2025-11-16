import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notificationsAPI } from '../api/notifications';
import { 
  Home, 
  Bell, 
  Plus, 
  User, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await notificationsAPI.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Nuevo Incidente',
      href: '/incidents/new',
      icon: Plus,
      current: location.pathname === '/incidents/new'
    },
    {
      name: 'Notificaciones',
      href: '/notifications',
      icon: Bell,
      current: location.pathname === '/notifications',
      badge: unreadCount > 0 ? unreadCount : undefined
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity ease-linear duration-300 ${
            isSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-gradient-to-b from-white via-gray-50/50 to-white backdrop-blur-xl border-r-2 border-gray-200 shadow-2xl transition ease-in-out duration-300 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-gray-800/80 backdrop-blur-sm text-gray-700 hover:text-gray-900 hover:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <SidebarContent navigation={navigation} onLogout={handleLogout} user={user} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-white via-gray-50/50 to-white backdrop-blur-xl border-r-2 border-gray-200 shadow-2xl">
          <SidebarContent navigation={navigation} onLogout={handleLogout} user={user} />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white/90 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between pr-4">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-xl text-gray-700 hover:text-gray-900 hover:bg-utec-cyan/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-utec-cyan transition-all duration-200"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Notification Bell for Mobile */}
          <div className="relative">
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-gray-700 hover:text-utec-cyan hover:bg-utec-cyan/10 rounded-lg transition-all duration-200"
              aria-label="Notificaciones"
            >
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-black text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg border-2 border-white animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <main className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

interface SidebarContentProps {
  navigation: any[];
  onLogout: () => void;
  user: any;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ navigation, onLogout, user }) => {
  return (
    <>
      {/* Logo UTEC - Mejorado */}
      <div className="relative flex items-center h-28 flex-shrink-0 px-6 border-b-2 border-gray-200 bg-gradient-to-br from-utec-cyan/5 via-white to-blue-50 overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-utec-cyan/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl"></div>
        
        <div className="relative flex flex-col items-center justify-center w-full">
          <img 
            src="/isologo-utec.png" 
            alt="UTEC Logo" 
            className="h-16 w-auto mb-2 drop-shadow-lg"
          />
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-utec-cyan animate-pulse"></div>
            <span className="text-xs font-black text-gray-900 tracking-wider uppercase">Alerta UTEC</span>
            <div className="h-1 w-1 rounded-full bg-utec-cyan animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Navigation - Mejorada */}
      <div className="flex-1 flex flex-col overflow-y-auto px-4 py-8">
        <div className="mb-3 px-3">
          <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Menú Principal</p>
        </div>
        <nav className="space-y-2">
          {navigation.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group relative flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-utec-cyan/20 to-blue-100/50 text-gray-900 border-2 border-utec-cyan/40 shadow-xl shadow-utec-cyan/20 scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-gray-900 border-2 border-transparent hover:border-gray-200 hover:shadow-lg hover:scale-102'
                }`}
              >
                {/* Active indicator */}
                {item.current && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-utec-cyan to-utec-cyan-dark rounded-r-full shadow-lg"></div>
                )}
                
                {/* Icon with background */}
                <div className={`flex items-center justify-center h-9 w-9 rounded-lg mr-3 transition-all duration-200 ${
                  item.current 
                    ? 'bg-utec-cyan/20 border-2 border-utec-cyan/40 shadow-md' 
                    : 'bg-gray-100 border-2 border-gray-200 group-hover:bg-white group-hover:border-utec-cyan/30 group-hover:shadow-md'
                }`}>
                  <IconComponent className={`h-5 w-5 ${item.current ? 'text-utec-cyan' : 'text-gray-700 group-hover:text-utec-cyan'}`} />
                </div>
                
                <span className="flex-1">{item.name}</span>
                
                {/* Badge */}
                {item.badge && (
                  <span className="ml-3 inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-black leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg border-2 border-white animate-pulse">
                    {item.badge}
                  </span>
                )}
                
                {/* Hover arrow */}
                {!item.current && (
                  <svg className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info - Mejorado */}
      <div className="flex-shrink-0 border-t-2 border-gray-200 px-4 pt-5 pb-6 bg-gradient-to-b from-transparent to-gray-50/50">
        {/* User Info Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white border-2 border-gray-300 shadow-xl">
          {/* Header with avatar */}
          <div className="relative bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 pt-4 pb-3 border-b-2 border-gray-200">
            <div className="absolute top-0 right-0 w-20 h-20 bg-utec-cyan/10 rounded-full blur-2xl"></div>
            
            <div className="relative flex items-center gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="relative w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center shadow-lg ring-2 ring-gray-300 border-2 border-white">
                  <User className="h-7 w-7 text-gray-900" strokeWidth={2.5} />
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md animate-pulse"></div>
                </div>
              </div>
              
              {/* User name and email */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-900 truncate leading-tight mb-0.5">{user?.name}</p>
                <p className="text-xs text-gray-700 truncate font-semibold leading-tight">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Footer with role and logout */}
          <div className="px-4 py-3 bg-white flex items-center justify-between gap-3">
            {/* Role badge */}
            {user?.role && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-gray-900 to-gray-800 text-white border border-gray-700 shadow-md uppercase tracking-wide">
                {user.role === 'ESTUDIANTE' ? '👨‍🎓 Estudiante' : 
                 user.role === 'ADMINISTRATIVO' ? '⚙️ Admin' : 
                 user.role === 'AUTORIDAD' ? '🔐 Autoridad' : user.role}
              </span>
            )}
            
            {/* Logout button */}
            <button
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-red-700 group"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4 text-white group-hover:scale-110 transition-transform" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
