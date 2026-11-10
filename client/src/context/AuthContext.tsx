import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, type ApiUser } from '../services/api';

interface AuthContextType {
  user: ApiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiUser | null>;
  registerUser: (data: {
    name: string;
    email: string;
    password?: string;
    phone?: { countryCode: string; number: string };
  }) => Promise<ApiUser | null>;
  googleLogin: (payload: {
    email: string;
    name: string;
    password?: string;
    requestedRole?: string;
    mode?: 'login' | 'register';
  }) => Promise<ApiUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<ApiUser | null> => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (data: {
    name: string;
    email: string;
    password?: string;
    phone?: { countryCode: string; number: string };
  }): Promise<ApiUser | null> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (payload: {
    email: string;
    name: string;
    password?: string;
    requestedRole?: string;
    mode?: 'login' | 'register';
  }): Promise<ApiUser | null> => {
    setIsLoading(true);
    try {
      const res = await api.googleAuth(payload);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        login,
        registerUser,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
