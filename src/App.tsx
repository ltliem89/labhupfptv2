import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { Header } from './components/common/Header';
import { BottomNav, NavTab } from './components/layout/BottomNav';
import { TeacherHome } from './components/teacher/TeacherHome';
import { BorrowWizard } from './components/teacher/BorrowWizard';
import { ActiveBorrowReturn } from './components/teacher/ActiveBorrowReturn';
import { BorrowHistory } from './components/teacher/BorrowHistory';
import { PersonalReport } from './components/teacher/PersonalReport';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserProfile } from './components/profile/UserProfile';
import { BorrowDetailModal } from './components/teacher/BorrowDetailModal';
import { Login } from './components/common/Login';
import { BorrowRecord } from './types';

const MainContent: React.FC = () => {
  const { actor, isInitializing } = useAuth();
  const { loading, error, refreshData } = useData();
  const [currentTab, setCurrentTab] = useState<NavTab | 'report'>('home');
  const [receiptSlip, setReceiptSlip] = useState<BorrowRecord | null>(null);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-400">Đang khởi động LAB HUB FPT...</p>
      </div>
    );
  }

  if (!actor) {
    return <Login />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-400">Đang tải dữ liệu từ máy chủ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="text-red-500 mb-4 text-4xl">⚠️</div>
        <p className="text-sm text-red-400 mb-4 font-semibold">{error}</p>
        <button 
          onClick={refreshData}
          className="px-4 py-2 bg-amber-500 text-slate-900 rounded font-bold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header />
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3">
        {currentTab === 'home' && (
          <TeacherHome
            onGoToBorrow={() => setCurrentTab('borrow')}
            onGoToActive={() => setCurrentTab('active')}
            onGoToHistory={() => setCurrentTab('history')}
            onGoToReport={() => setCurrentTab('report')}
          />
        )}
        {currentTab === 'borrow' && (
          <BorrowWizard
            onFinish={slip => {
              if (slip) setReceiptSlip(slip);
              setCurrentTab('active');
            }}
            onCancel={() => setCurrentTab('home')}
          />
        )}
        {currentTab === 'active' && <ActiveBorrowReturn />}
        {currentTab === 'history' && <BorrowHistory />}
        {currentTab === 'report' && (
          <div>
            <div className="mb-2">
              <button
                onClick={() => setCurrentTab('home')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2"
              >
                ← Quay về Tổng quan
              </button>
            </div>
            <PersonalReport />
          </div>
        )}
        {currentTab === 'admin' && <AdminDashboard />}
        {currentTab === 'profile' && <UserProfile />}
      </main>

      {receiptSlip && (
        <BorrowDetailModal
          borrow={receiptSlip}
          onClose={() => setReceiptSlip(null)}
          onReturned={() => setReceiptSlip(null)}
        />
      )}

      <BottomNav
        activeTab={currentTab === 'report' ? 'home' : (currentTab as NavTab)}
        onChangeTab={tab => {
          setReceiptSlip(null);
          setCurrentTab(tab);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainContent />
      </DataProvider>
    </AuthProvider>
  );
}
