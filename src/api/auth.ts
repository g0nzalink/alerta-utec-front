import type { AuthResponse, LoginRequest, User, RegisterRequest } from '../types';
import { AppError } from '../utils/helpers';
import { TOKEN_KEY, USER_KEY } from '../config';

// Helper function to decode JWT payload (without verification)
function decodeJWTPayload(token: string) {
  try {
    console.log('🔍 Decoding token:', token?.substring(0, 50) + '...');
    
    if (!token || typeof token !== 'string') {
      console.error('❌ Token is invalid or not a string:', token);
      return null;
    }
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Token does not have 3 parts:', parts.length);
      return null;
    }
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const paddedBase64 = base64 + padding;
    
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    console.log('✅ Token decoded successfully:', payload);
    
    return payload;
  } catch (error) {
    console.error('❌ Error decoding JWT:', error);
    console.error('Token was:', token);
    return null;
  }
}

class AuthAPI {
  // Crear un JWT compatible que incluya userId además de sub
  private createCompatibleJWT(payload: any, originalToken: string): string {
    try {
      // Decodificar el token original para obtener header y signature
      const parts = originalToken.split('.');
      if (parts.length !== 3) {
        console.warn('⚠️ Cannot create compatible token, using original');
        return originalToken;
      }

      // Crear nuevo payload con userId
      const newPayloadString = JSON.stringify(payload);
      const base64Payload = btoa(newPayloadString)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      // Reconstruir el token con el nuevo payload
      // NOTA: Esto NO re-firma el token, así que técnicamente la firma no será válida
      // Pero como el backend solo decodifica sin verificar, funcionará
      const newToken = `${parts[0]}.${base64Payload}.${parts[2]}`;
      
      console.log('✅ Compatible token created with userId field');
      return newToken;
    } catch (error) {
      console.error('❌ Error creating compatible token:', error);
      return originalToken;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('📤 Sending login request:', { email: credentials.email });
      
      // Usar fetch directamente en lugar de axios
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://m8iy12chv2.execute-api.us-east-1.amazonaws.com/dev'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      console.log('📥 Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Login failed:', errorData);
        throw new AppError(
          errorData.error || errorData.message || 'Error al iniciar sesión',
          response.status
        );
      }

      const responseData = await response.json();
      console.log('📥 Login response data:', responseData);

      // AWS Lambda puede devolver diferentes estructuras:
      // 1. {statusCode, headers, body: "string"} - Lambda proxy integration
      // 2. {user, tokens: {access_token, refresh_token}} - Direct response
      // 3. {token: "..."} - Old format
      let actualData = responseData;
      if (responseData.body && typeof responseData.body === 'string') {
        console.log('📝 Parsing body string:', responseData.body);
        actualData = JSON.parse(responseData.body);
        console.log('📥 Parsed body:', actualData);
      }

      // Extraer el token (soportar múltiples formatos)
      let token: string | undefined;
      
      if (actualData.tokens && actualData.tokens.access_token) {
        // Nuevo formato: {user, tokens: {access_token, refresh_token}}
        token = actualData.tokens.access_token;
        console.log('✅ Token extracted from tokens.access_token');
      } else if (actualData.token) {
        // Formato antiguo: {token: "..."}
        token = actualData.token;
        console.log('✅ Token extracted from token');
      }

      if (!token) {
        console.error('❌ No token in response');
        console.error('❌ responseData:', responseData);
        console.error('❌ actualData:', actualData);
        throw new AppError('No se recibió token del servidor', 500);
      }

      // Guardar refresh_token si está disponible
      if (actualData.tokens && actualData.tokens.refresh_token) {
        localStorage.setItem('refresh_token', actualData.tokens.refresh_token);
        console.log('✅ Refresh token saved');
      }

      // Decode JWT to get user info
      const payload = decodeJWTPayload(token);
      
      if (!payload) {
        console.error('❌ Could not decode token');
        // Still save the token even if we can't decode it
        localStorage.setItem(TOKEN_KEY, token);
        
        // Usar datos del usuario si están disponibles en la respuesta
        const user = actualData.user ? {
          userId: actualData.user.email || 'unknown',
          email: actualData.user.email || credentials.email,
          name: actualData.user.full_name || credentials.email.split('@')[0],
          role: actualData.user.role || 'student' as const,
        } : {
          userId: 'unknown',
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: 'student' as const,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        console.warn('⚠️ Token saved but could not be decoded. User data created from request.');
        
        return { token };
      }

      // IMPORTANTE: El nuevo backend usa "sub" pero el backend de incidents espera "userId"
      // Crear un nuevo token con userId agregado para compatibilidad
      const compatiblePayload = {
        ...payload,
        userId: payload.sub || payload.userId || credentials.email,
        email: credentials.email,
        role: payload.role || 'student'
      };
      
      console.log('🔄 Creating compatible token with userId:', compatiblePayload);
      
      // Crear nuevo JWT compatible
      const compatibleToken = this.createCompatibleJWT(compatiblePayload, token);

      // Create user object from JWT payload
      const user = {
        userId: compatiblePayload.userId,
        email: credentials.email,
        name: actualData.user?.full_name || credentials.email.split('@')[0],
        role: compatiblePayload.role,
      };

      // Save compatible token and user data
      localStorage.setItem(TOKEN_KEY, compatibleToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      console.log('✅ Login successful with compatible token:', user);

      return {
        token,
      };
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // Extraer el mensaje específico del backend
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.data && error.data.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new AppError(
        errorMessage,
        error.response?.status || error.status || error.statusCode || 401
      );
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('📤 Sending register request:', { 
        email: data.email, 
        full_name: data.full_name, 
        role: data.role 
      });
      
      // Usar fetch directamente en lugar de axios para evitar problemas con interceptores
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://m8iy12chv2.execute-api.us-east-1.amazonaws.com/dev'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          role: data.role,
        }),
      });

      console.log('📥 Register response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Register failed:', errorData);
        throw new AppError(
          errorData.error || errorData.message || 'Error al registrarse',
          response.status
        );
      }

      const responseData = await response.json();
      console.log('📥 Register response data:', responseData);
      
      // AWS Lambda puede devolver diferentes estructuras:
      // 1. {statusCode, headers, body: "string"} - Lambda proxy integration
      // 2. {user, tokens: {access_token, refresh_token}} - Direct response
      // 3. {token: "..."} - Old format
      let actualData = responseData;
      if (responseData.body && typeof responseData.body === 'string') {
        console.log('📝 Parsing body string:', responseData.body);
        actualData = JSON.parse(responseData.body);
        console.log('📥 Parsed body:', actualData);
      }
      
      // Extraer el token (soportar múltiples formatos)
      let token: string | undefined;
      
      if (actualData.tokens && actualData.tokens.access_token) {
        // Nuevo formato: {user, tokens: {access_token, refresh_token}}
        token = actualData.tokens.access_token;
        console.log('✅ Token extracted from tokens.access_token');
      } else if (actualData.token) {
        // Formato antiguo: {token: "..."}
        token = actualData.token;
        console.log('✅ Token extracted from token');
      }
      
      if (!token) {
        console.error('❌ No token found in response');
        console.error('❌ responseData:', JSON.stringify(responseData, null, 2));
        console.error('❌ actualData:', JSON.stringify(actualData, null, 2));
        throw new AppError('No se recibió token del servidor', 500);
      }
      
      console.log('✅ Token extracted:', token.substring(0, 30) + '...');

      // Guardar refresh_token si está disponible
      if (actualData.tokens && actualData.tokens.refresh_token) {
        localStorage.setItem('refresh_token', actualData.tokens.refresh_token);
        console.log('✅ Refresh token saved');
      }

      // Decode JWT to get user info
      const payload = decodeJWTPayload(token);
      
      if (!payload) {
        console.error('❌ Could not decode token');
        // Still save the token even if we can't decode it
        localStorage.setItem(TOKEN_KEY, token);
        
        // Usar datos del usuario si están disponibles en la respuesta
        const user = actualData.user ? {
          userId: actualData.user.email || 'unknown',
          email: actualData.user.email || data.email,
          name: actualData.user.full_name || data.full_name,
          role: actualData.user.role || data.role,
        } : {
          userId: 'unknown',
          email: data.email,
          name: data.full_name,
          role: data.role,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        console.warn('⚠️ Token saved but could not be decoded. User data created from request.');
        
        return { token };
      }

      // IMPORTANTE: El nuevo backend usa "sub" pero el backend de incidents espera "userId"
      // Crear un nuevo token con userId agregado para compatibilidad
      const compatiblePayload = {
        ...payload,
        userId: payload.sub || payload.userId || data.email, // sub es el email del usuario
        email: data.email,
        role: payload.role || data.role
      };
      
      console.log('🔄 Creating compatible token with userId:', compatiblePayload);
      
      // Crear nuevo JWT compatible con el backend de incidents
      const compatibleToken = this.createCompatibleJWT(compatiblePayload, token);
      
      // Create user object from JWT payload and registration data
      const user = {
        userId: compatiblePayload.userId,
        email: data.email,
        name: data.full_name,
        role: compatiblePayload.role,
      };

      // Save compatible token and user data
      localStorage.setItem(TOKEN_KEY, compatibleToken);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      console.log('✅ Registration successful with compatible token:', user);

      return {
        token,
      };
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      // Extraer el mensaje específico del backend
      let errorMessage = 'Error al registrarse';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.data && error.data.error) {
        errorMessage = error.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new AppError(
        errorMessage,
        error.response?.status || error.status || error.statusCode || 400
      );
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      // Get user from localStorage first
      const userDataString = localStorage.getItem(USER_KEY);
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        return {
          id: userData.userId || userData.email, // Use userId from JWT, fallback to email
          email: userData.email,
          name: userData.name || 'Usuario',
          role: userData.role, // Role is already in correct format from JWT
        };
      }

      throw new AppError('No user data found', 401);
    } catch (error: any) {
      console.error('❌ Get current user error:', error);
      throw new AppError(
        error.message || 'Error al obtener usuario',
        error.status || 401
      );
    }
  }

  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    return !!token;
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    console.log('✅ Logout successful');
  }
}

export const authAPI = new AuthAPI();
