import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authApi } from '../api/auth';
import { secureStorage, StoredUser } from '../utils/secureStorage';

interface AuthContextType {
  user: StoredUser | null;
  loading: boolean;
  isAuthLoaded: boolean; // Track if initial auth check is complete
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false); // Track if initial check is done
  // Track if a login operation is in progress to prevent race conditions
  const isLoggingIn = useRef(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize auth state - restore user immediately if token exists
  const initializeAuth = async () => {
    try {
      // Immediately try to get stored credentials (synchronous-like check)
      const token = await secureStorage.getToken();
      const userData = await secureStorage.getUser();
      
      if (token && userData) {
        // Restore user immediately from storage - no waiting for backend
        setUser(userData);
        
        // Verify token in background - don't block the UI
        // Don't clear user on error - keep them logged in
        verifyTokenAsync(token).catch((error) => {
          console.log('Background token verification completed with error (user kept logged in):', error);
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      // Mark auth as loaded after initial check
      setLoading(false);
      setIsAuthLoaded(true);
    }
  };

  // Async function to verify token in background
  const verifyTokenAsync = async (token: string) => {
    try {
      const result = await authApi.getCurrentUser(token);
      
      // Only clear user if server explicitly returns 401 Unauthorized
      if (result.status === 401) {
        console.error('Token is unauthorized (401)');
        await secureStorage.clearAuthData();
        setUser(null);
        return;
      }
      
      // For 404, network errors (status 0), or other errors - keep user logged in
      if (result.status !== 200 || !result.user) {
        console.log('Token verification failed but keeping user logged in:', result.status, result.error);
        return;
      }
      
      // Update user with fresh data from server
      setUser(result.user);
      // Update stored user data
      await secureStorage.setUser(result.user);
    } catch (error) {
      // Network error or other - keep user logged in
      console.error('Token verification error (keeping user logged in):', error);
    }
  };

  const login = async (email: string, password: string) => {
    // This method is kept for backward compatibility, but we'll use Google login primarily
    throw new Error('Email/password login is not implemented. Please use Google login.');
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => {
    // This method is kept for backward compatibility, but we'll use Google login primarily
    throw new Error('Email/password registration is not implemented. Please use Google login.');
  };

  const googleLogin = async (idToken: string) => {
    // Mark that login is in progress to prevent race conditions
    isLoggingIn.current = true;
    
    try {
      const response = await authApi.googleLogin(idToken);
      await secureStorage.setToken(response.token);
      await secureStorage.setUser(response.user);
      // Immediately set user - no waiting
      setUser(response.user);
    } catch (error: any) {
      // Reset the flag on error so checkAuthState can run
      isLoggingIn.current = false;
      throw error;
    } finally {
      // Reset the flag after login completes
      isLoggingIn.current = false;
    }
  };

  const logout = async () => {
    try {
      // Sign out from Google (forces account picker on next login)
      await GoogleSignin.signOut();
      // Clear local auth data
      await secureStorage.clearAuthData();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local data even if GoogleSignin.signOut fails
      await secureStorage.clearAuthData();
      setUser(null);
    }
  };

  const toggleRole = async () => {
    // This method is kept for backward compatibility
    throw new Error('Role toggling is not implemented yet.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthLoaded,
        login,
        register,
        googleLogin,
        logout,
        toggleRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
