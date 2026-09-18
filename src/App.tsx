import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { BorrowRecord } from './types';

const MainContent: React.FC = () => {
  const { actor, role } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab | 'report'>('home');
  const [receiptSlip, setReceiptSlip] = useState<BorrowRecord | null>(null);

  if (!actor) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-400">Đang khởi động LAB HUB FPT...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <Header />

      {/* Main viewport container (Mobile 360-430px first, max-w-md centered) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3">
        {/* VIEW: HOME */}
        {currentTab === 'home' && (
          <TeacherHome
            onGoToBorrow={() => setCurrentTab('borrow')}
            onGoToActive={() => setCurrentTab('active')}
            onGoToHistory={() => setCurrentTab('history')}
            onGoToReport={() => setCurrentTab('report')}
          />
        )}

        {/* VIEW: BORROW WIZARD */}
        {currentTab === 'borrow' && (
          <BorrowWizard
            onFinish={slip => {
              if (slip) {
                setReceiptSlip(slip);
              }
              setCurrentTab('active');
            }}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {/* VIEW: ACTIVE BORROWS & RETURN */}
        {currentTab === 'active' && <ActiveBorrowReturn />}

        {/* VIEW: BORROW HISTORY */}
        {currentTab === 'history' && <BorrowHistory />}

        {/* VIEW: PERSONAL REPORT */}
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

        {/* VIEW: ADMIN DASHBOARD */}
        {currentTab === 'admin' && <AdminDashboard />}

        {/* VIEW: USER PROFILE */}
        {currentTab === 'profile' && <UserProfile />}
      </main>

      {/* Slip Detail Modal when returning from Wizard */}
      {receiptSlip && (
        <BorrowDetailModal
          borrow={receiptSlip}
          onClose={() => setReceiptSlip(null)}
          onReturned={() => setReceiptSlip(null)}
        />
      )}

      {/* Bottom Navigation */}
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
      <MainContent />
    </AuthProvider>
  );
}
