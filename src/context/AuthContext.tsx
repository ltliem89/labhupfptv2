import React, { createContext, useContext, useState, useEffect } from 'react';
import { Actor, AuthSession, Role } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  session: AuthSession | null;
  actor: Actor | null;
  role: Role | null;
  login: (email: string, pin: string) => Promise<void>;
  logout: () => void;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const saved = ApiService.getSavedSession();
    if (saved) {
      setSession(saved);
    }
    setIsInitializing(false);
  }, []);

  const login = async (email: string, pin: string) => {
    const sess = await ApiService.login(email, pin);
    setSession(sess);
  };

  const logout = () => {
    ApiService.logout();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        actor: session?.actor || null,
        role: session?.actor?.role || null,
        login,
        logout,
        isInitializing
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
