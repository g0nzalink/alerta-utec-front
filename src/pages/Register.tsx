import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import type { RegisterRequest, UserRole } from '../types';
import { User, Mail, Lock, UserCircle, Shield, Building, Users } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterRequest>({
    full_name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  // Función para evaluar la fuerza de la contraseña
  const getPasswordStrength = (password: string) => {
    let score = 0;
    let feedback: string[] = [];
    
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Mínimo 8 caracteres');
    }
    
    if (/(?=.*[a-z])/.test(password)) {
      score += 1;
    } else {
      feedback.push('Al menos una minúscula');
    }
    
    if (/(?=.*[A-Z])/.test(password)) {
      score += 1;
    } else {
      feedback.push('Al menos una mayúscula');
    }
    
    if (/(?=.*\d)/.test(password)) {
      score += 1;
    } else {
      feedback.push('Al menos un número');
    }
    
    if (/(?=.*[!@#$%^&*])/.test(password)) {
      score += 1;
    } else {
      feedback.push('Al menos un símbolo (!@#$%^&*)');
    }
    
    let strength = '';
    let color = '';
    
    if (score === 0) {
      strength = 'Muy débil';
      color = 'text-red-600 bg-red-100';
    } else if (score <= 2) {
      strength = 'Débil';
      color = 'text-orange-600 bg-orange-100';
    } else if (score <= 3) {
      strength = 'Media';
      color = 'text-yellow-600 bg-yellow-100';
    } else if (score <= 4) {
      strength = 'Fuerte';
      color = 'text-blue-600 bg-blue-100';
    } else {
      strength = 'Muy fuerte';
      color = 'text-green-600 bg-green-100';
    }
    
    return { strength, color, feedback, score };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.full_name.trim()) {
      return 'El nombre es obligatorio';
    }
    if (!formData.email.trim()) {
      return 'El email es obligatorio';
    }
    // Validación de email institucional UTEC
    if (!formData.email.endsWith('@utec.edu.pe')) {
      return 'Debe usar un email institucional UTEC (@utec.edu.pe)';
    }
    // Validación más robusta de contraseña para AWS Cognito
    if (formData.password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!/(?=.*[a-z])/.test(formData.password)) {
      return 'La contraseña debe tener al menos una letra minúscula';
    }
    if (!/(?=.*[A-Z])/.test(formData.password)) {
      return 'La contraseña debe tener al menos una letra mayúscula';
    }
    if (!/(?=.*\d)/.test(formData.password)) {
      return 'La contraseña debe tener al menos un número';
    }
    if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      return 'La contraseña debe tener al menos un símbolo (!@#$%^&*)';
    }
    if (formData.password !== confirmPassword) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      console.log('🔐 Registrando usuario:', formData);
      
      // Llamar a la API real de registro
      await authAPI.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role
      });
      
      console.log('✅ Registro exitoso, redirigiendo al dashboard');
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      
      // Mejorar el manejo de errores específicos
      let errorMessage = 'Error al registrar usuario';
      
      if (error.message.includes('INVALID_CREDENTIALS')) {
        errorMessage = 'Credenciales inválidas. Verifique el formato del email y la contraseña.';
      } else if (error.message.includes('USER_ALREADY_EXISTS')) {
        errorMessage = 'Ya existe un usuario con este email. ¿Desea iniciar sesión en su lugar?';
      } else if (error.message.includes('USER_EXISTS')) {
        errorMessage = 'Ya existe un usuario con este email. Intente iniciar sesión.';
      } else if (error.message.includes('WEAK_PASSWORD')) {
        errorMessage = 'La contraseña es muy débil. Debe tener al menos 8 caracteres, mayúsculas, minúsculas, números y símbolos.';
      } else if (error.message.includes('INVALID_EMAIL')) {
        errorMessage = 'El formato del email no es válido.';
      } else if (error.statusCode === 400) {
        errorMessage = 'Datos de registro inválidos. Verifique la información ingresada.';
      } else if (error.statusCode === 429) {
        errorMessage = 'Demasiados intentos. Espere unos minutos antes de intentar nuevamente.';
      } else {
        errorMessage = error.message || 'Error desconocido al registrar usuario';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <User className="h-5 w-5" />;
      case 'staff':
        return <Building className="h-5 w-5" />;
      case 'authority':
        return <Shield className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'student':
        return 'Puede crear y ver incidentes';
      case 'staff':
        return 'Puede gestionar y asignar incidentes';
      case 'authority':
        return 'Acceso completo al sistema';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 py-12">
      {/* Background decoration UTEC */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-utec-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-utec-cyan/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-utec-cyan/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card with gradient border */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-utec-cyan to-utec-cyan-light rounded-3xl opacity-20 blur-xl"></div>
          
          <div className="relative card p-8 space-y-8 shadow-2xl shadow-gray-200/80 border-2 border-gray-100">
            {/* Header con Logo UTEC */}
            <div className="text-center space-y-5">
              <img 
                src="/utec-logo.png" 
                alt="UTEC Logo" 
                className="h-28 w-auto mx-auto drop-shadow-2xl"
              />
              <div>
                <h1 className="text-4xl font-black text-gray-900 mb-2">
                  Crear <span className="text-utec-cyan">Cuenta</span>
                </h1>
                <p className="text-gray-600 font-medium text-lg">
                  Regístrate con tu email institucional UTEC
                </p>
              </div>
            </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-bold text-gray-800">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="input-field pl-10 text-base focus:ring-2 focus:ring-utec-cyan/50"
                  placeholder="Juan Pérez"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-gray-800">
                Email Institucional
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10 text-base focus:ring-2 focus:ring-utec-cyan/50"
                  placeholder="tu.nombre@utec.edu.pe"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-utec-cyan-dark font-medium">
                Debe ser un email institucional UTEC (@utec.edu.pe)
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-bold text-gray-800">
                Tipo de Usuario
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="input-field text-base focus:ring-2 focus:ring-utec-cyan/50"
                required
                disabled={isSubmitting}
              >
                <option value="student">Alumno</option>
                <option value="staff">Personal</option>
                <option value="authority">Autoridad</option>
              </select>
              <div className="flex items-center gap-2 rounded-lg bg-utec-cyan/10 border border-utec-cyan/20 p-3 text-sm text-gray-700 font-medium">
                {getRoleIcon(formData.role)}
                <span>{getRoleDescription(formData.role)}</span>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold text-gray-800">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10 text-base focus:ring-2 focus:ring-utec-cyan/50"
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  minLength={6}
                />
              </div>
              <div className={`mt-2 rounded-lg p-2 text-sm font-medium ${passwordStrength.color}`}>
                {passwordStrength.strength}
              </div>
              {passwordStrength.feedback.length > 0 && (
                <ul className="mt-1 text-xs text-gray-600">
                  {passwordStrength.feedback.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-800">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10 text-base focus:ring-2 focus:ring-utec-cyan/50"
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  minLength={6}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-300/60 bg-red-50/40 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full bg-gradient-to-r from-utec-cyan to-utec-cyan-dark hover:from-utec-cyan-light hover:to-utec-cyan shadow-lg shadow-utec-cyan/25"
            >
              {isSubmitting && <span className="loading-spinner" />}
              <UserCircle className="h-5 w-5" />
              <span>{isSubmitting ? 'Registrando...' : 'Crear Cuenta'}</span>
            </button>
          </form>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 font-medium">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-bold text-utec-cyan hover:text-utec-cyan-light transition-colors underline decoration-2 underline-offset-2"
              >
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
