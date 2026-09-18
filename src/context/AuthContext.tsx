import React, { createContext, useContext, useState, useEffect } from 'react';
import { Actor, AuthSession, Role, Teacher } from '../types';
import { ApiService, localEngine } from '../services/api';

interface AuthContextType {
  session: AuthSession | null;
  actor: Actor | null;
  role: Role | null;
  teachers: Teacher[];
  login: (email: string, pin: string) => Promise<void>;
  logout: () => void;
  quickSwitch: (teacherIdOrEmail: string) => Promise<void>;
  setActorById: (teacherId: string) => Promise<void>;
  resetAllData: () => void;
  isLiveMode: boolean;
  toggleLiveMode: (enabled?: boolean) => void;
  testConnection: () => Promise<{ ok: boolean; message: string; data?: any }>;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLiveMode, setIsLiveMode] = useState<boolean>(ApiService.getLiveMode());
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    const saved = ApiService.getSavedSession();
    if (saved) {
      setSession(saved);
    } else {
      // Default initial login as Thầy Nam (Vật lý) for immediate delightful preview experience
      quickSwitch('nam.nv@labhub.edu.vn');
    }
  }, []);

  const login = async (email: string, pin: string) => {
    const sess = await ApiService.login(email, pin);
    setSession(sess);
  };

  const logout = () => {
    ApiService.logout();
    setSession(null);
  };

  const quickSwitch = async (emailOrId: string) => {
    const teachers = localEngine.getTeachers();
    const target = teachers.find(
      t => t.email.toLowerCase() === emailOrId.toLowerCase() || t.teacher_id === emailOrId
    );
    if (!target) return;
    await login(target.email, '123456');
  };

  const toggleLiveMode = (enabled?: boolean) => {
    const next = enabled !== undefined ? enabled : !isLiveMode;
    setIsLiveMode(next);
    ApiService.setLiveMode(next);
  };

  const testConnection = async () => {
    return await ApiService.testAppsScriptHealth();
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const setActorById = async (teacherId: string) => {
    await quickSwitch(teacherId);
  };

  const resetAllData = () => {
    localEngine.resetToDefaults();
    triggerRefresh();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        actor: session?.actor || null,
        role: session?.actor?.role || null,
        teachers: localEngine.getTeachers(),
        login,
        logout,
        quickSwitch,
        setActorById,
        resetAllData,
        isLiveMode,
        toggleLiveMode,
        testConnection,
        refreshTrigger,
        triggerRefresh,
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
