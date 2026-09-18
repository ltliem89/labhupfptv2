import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from './AuthContext';
import {
  Room, Subject, ClassRoom, Topic, Lesson, Equipment, TopicEquipment
} from '../types';

interface DataContextType {
  rooms: Room[];
  subjects: Subject[];
  classes: ClassRoom[];
  topics: Topic[];
  lessons: Lesson[];
  equipment: Equipment[];
  topicEquipment: TopicEquipment[];
  dashboardData: any;
  refreshData: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { actor } = useAuth();
  const [data, setData] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    if (!actor) return;
    setLoading(true);
    setError(null);
    try {
      const [res, dashboard] = await Promise.all([
        ApiService.bootstrap(actor.teacher_id),
        ApiService.getMyDashboard(actor)
      ]);
      setData(res);
      setDashboardData(dashboard);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (actor) {
      refreshData();
    } else {
      setData(null);
      setDashboardData(null);
      setLoading(false);
    }
  }, [actor]);

  return (
    <DataContext.Provider
      value={{
        rooms: data?.rooms || [],
        subjects: data?.subjects || [],
        classes: data?.classes || [],
        topics: data?.topics || [],
        lessons: data?.lessons || [],
        equipment: data?.equipment || [],
        topicEquipment: data?.topic_equipment || [],
        dashboardData,
        refreshData,
        loading,
        error
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
