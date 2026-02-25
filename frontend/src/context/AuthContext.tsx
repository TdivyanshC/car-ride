import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';
import { secureStorage, StoredUser } from '../utils/secureStorage';

interface AuthContextType {
  user: StoredUser | null;
  loading: boolean;
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

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await secureStorage.getToken();
      const userData = await secureStorage.getUser();
      
      if (token && userData) {
        // Verify token is still valid by fetching user info
        try {
          const response = await authApi.getCurrentUser(token);
          setUser(response.user);
        } catch (error) {
          console.error('Token verification failed:', error);
          await secureStorage.clearAuthData();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await secureStorage.clearAuthData();
    } finally {
      setLoading(false);
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
    try {
      const response = await authApi.googleLogin(idToken);
      await secureStorage.setToken(response.token);
      await secureStorage.setUser(response.user);
      setUser(response.user);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await secureStorage.clearAuthData();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
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
