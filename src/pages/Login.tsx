import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, Eye, EyeOff, AlertTriangle, Zap, ClipboardCheck, Users } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login({ email, password });
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex">
      {/* Left side - Branding UTEC */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-utec-cyan/10 via-white to-blue-100/30"></div>
        
        {/* Decorative animated circles */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-utec-cyan/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-utec-cyan/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center px-12 py-8 w-full">
          <div className="max-w-lg w-full space-y-8">
            {/* Logo UTEC - Prominente y centrado */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative">
                {/* Glow effect behind logo */}
                <div className="absolute inset-0 bg-utec-cyan/20 rounded-full blur-2xl scale-150"></div>
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border-2 border-gray-200">
                  <img 
                    src="/isologo-utec.png" 
                    alt="UTEC Logo" 
                    className="h-32 w-auto drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
            
            {/* Títulos - Centrados y llamativos */}
            <div className="text-center space-y-4">
              <div>
                <h1 className="text-6xl font-black leading-tight text-gray-900 mb-3">
                  Alerta <span className="text-utec-cyan drop-shadow-lg">UTEC</span>
                </h1>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-1 w-12 bg-gradient-to-r from-transparent to-utec-cyan rounded-full"></div>
                  <div className="h-1.5 w-1.5 bg-utec-cyan rounded-full animate-pulse"></div>
                  <div className="h-1 w-12 bg-gradient-to-l from-transparent to-utec-cyan rounded-full"></div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                Sistema de Gestión de Incidentes
              </h2>
              
              <p className="text-base text-gray-700 leading-relaxed font-medium">
                Plataforma integral para reportar, monitorear y resolver incidentes en la 
                <span className="font-black text-gray-900"> Universidad de Ingeniería y Tecnología</span>.
              </p>
            </div>

            {/* Features Cards - Mejoradas y centradas */}
            <div className="grid gap-4">
              <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:border-utec-cyan hover:bg-white hover:shadow-2xl hover:shadow-utec-cyan/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Zap className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 mb-1.5 text-lg">Reportes Instantáneos</h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-semibold">Notifica incidentes en tiempo real y recibe actualizaciones inmediatas</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:border-utec-cyan hover:bg-white hover:shadow-2xl hover:shadow-utec-cyan/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <ClipboardCheck className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 mb-1.5 text-lg">Seguimiento Completo</h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-semibold">Monitorea el estado y progreso de todos tus reportes desde un solo lugar</p>
                </div>
              </div>

              <div className="group flex items-start gap-4 p-5 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-300 hover:border-utec-cyan hover:bg-white hover:shadow-2xl hover:shadow-utec-cyan/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 border-2 border-purple-300 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Users className="w-6 h-6 text-gray-900" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 mb-1.5 text-lg">Comunidad UTEC</h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-semibold">Colaboración directa entre estudiantes, administrativos y autoridades</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="text-center lg:hidden mb-6">
            <img 
              src="/utec-logo.png" 
              alt="UTEC Logo" 
              className="h-20 w-auto mx-auto mb-4 drop-shadow-xl"
            />
            <h2 className="text-3xl font-black text-gray-900 mb-1">
              Alerta <span className="text-utec-cyan">UTEC</span>
            </h2>
            <p className="text-gray-600 font-medium text-sm">Accede a tu panel de control</p>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden lg:block text-center mb-6">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Iniciar <span className="text-utec-cyan">Sesión</span>
            </h2>
            <p className="text-gray-600 text-base">Ingresa tus credenciales para continuar</p>
          </div>
        
          {/* Login Card */}
          <div className="relative">
            {/* Decorative gradient */}
            <div className="absolute -inset-1 bg-gradient-to-r from-utec-cyan to-utec-cyan-light rounded-2xl opacity-20 blur-lg"></div>
            
            <div className="relative card shadow-xl shadow-gray-200/60 border-2 border-gray-100">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-1.5">
                      Correo Electrónico
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field text-base focus:ring-2 focus:ring-utec-cyan/50"
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-1.5">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field text-base pr-12 focus:ring-2 focus:ring-utec-cyan/50"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-600 hover:text-utec-cyan transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl border-2 border-red-300 bg-red-50 flex items-start gap-3 p-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-4 text-base font-bold shadow-xl shadow-utec-cyan/30 hover:shadow-2xl hover:shadow-utec-cyan/40 bg-gradient-to-r from-utec-cyan to-utec-cyan-dark hover:from-utec-cyan-light hover:to-utec-cyan transform hover:scale-[1.02] transition-all duration-200"
                >
                  {isLoading && <span className="loading-spinner" />}
                  {!isLoading && <LogIn className="h-5 w-5" />}
                  <span className="text-white font-bold">{isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
                </button>

                <div className="pt-4 border-t-2 border-gray-200">
                  <p className="text-center text-xs font-black uppercase tracking-wider text-gray-900 mb-2.5">
                    Credenciales de prueba
                  </p>
                  <div className="rounded-lg bg-gradient-to-r from-utec-cyan/10 to-utec-cyan-light/10 border-2 border-utec-cyan/30 p-3 space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 font-bold">Email:</span>
                      <code className="font-mono text-gray-900 font-black bg-white px-2.5 py-1 rounded border-2 border-gray-300 text-xs">admin@test.com</code>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-900 font-bold">Password:</span>
                      <code className="font-mono text-gray-900 font-black bg-white px-2.5 py-1 rounded border-2 border-gray-300 text-xs">password</code>
                    </div>
                  </div>
                </div>

                {/* Register Link */}
                <div className="text-center text-sm text-gray-600 pt-2 font-medium">
                  ¿No tienes cuenta?{' '}
                  <Link
                    to="/register"
                    className="font-bold text-utec-cyan hover:text-utec-cyan-light transition-colors underline decoration-2 underline-offset-2"
                  >
                    Regístrate aquí
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
