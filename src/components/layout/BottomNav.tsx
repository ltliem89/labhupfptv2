import React from 'react';
import { Home, PackagePlus, RefreshCw, ClipboardList, Shield, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { localEngine, isBorrowOverdue } from '../../services/api';

export type NavTab = 'home' | 'borrow' | 'active' | 'history' | 'admin' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const { actor, role, refreshTrigger } = useAuth();

  // Calculate badges
  const borrows = localEngine.getBorrowRecords();
  const myBorrows = actor ? borrows.filter(r => r.teacher_id === actor.teacher_id) : [];
  const activeMyBorrows = myBorrows.filter(r => r.status === 'BORROWED' || r.status === 'PARTIAL_RETURN');
  const overdueCount = activeMyBorrows.filter(isBorrowOverdue).length;

  const pendingRequestsCount = role === 'ADMIN'
    ? localEngine.getEquipmentRequests().filter(r => r.status === 'PENDING').length
    : 0;

  const tabs: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'home',
      label: 'Tổng quan',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'borrow',
      label: 'Mượn TB',
      icon: <PackagePlus className="w-5 h-5" />,
    },
    {
      id: 'active',
      label: 'Đang mượn',
      icon: <RefreshCw className="w-5 h-5" />,
      badge: activeMyBorrows.length > 0 ? activeMyBorrows.length : undefined,
      badgeColor: overdueCount > 0 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950',
    },
    {
      id: 'history',
      label: 'Lịch sử',
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      id: role === 'ADMIN' ? 'admin' : 'profile',
      label: role === 'ADMIN' ? 'Quản trị' : 'Tài khoản',
      icon: role === 'ADMIN' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
      badgeColor: 'bg-purple-500 text-white',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-1">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[44px] transition-all select-none active:scale-90 ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-sm ${
                      tab.badgeColor || 'bg-amber-500 text-slate-950'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none whitespace-nowrap">
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-1 w-6 h-0.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
