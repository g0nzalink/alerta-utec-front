import { AuthProvider, useAuth as useAuthContext } from '../context/AuthContext';

// Re-export the useAuth hook from context for convenience
export const useAuth = useAuthContext;

// Re-export the AuthProvider for convenience
export { AuthProvider };
