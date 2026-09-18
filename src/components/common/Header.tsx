import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { Shield, UserCheck, ChevronDown, Check, Globe, Database, Activity, RefreshCw } from 'lucide-react';

export const Header: React.FC = () => {
  const { actor, role } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 flex items-center justify-center font-extrabold shadow-sm shadow-amber-500/20 text-base">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base">LAB HUB</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                V4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Hệ thống Thiết bị FPT</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton />

          <button
            id="btn-header-user-switcher"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs text-slate-200 transition active:scale-95"
            title="Tài khoản của bạn"
          >
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
              {role === 'ADMIN' ? <Shield className="w-3 h-3 text-amber-400" /> : 'GV'}
            </div>
            <span className="max-w-[80px] truncate font-medium">
              {actor?.display_name.split(' ').pop() || 'User'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
