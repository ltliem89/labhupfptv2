import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';
import { Shield, Sparkles, UserCheck, ChevronDown, Check, Globe, Database, Activity, RefreshCw } from 'lucide-react';
import { INITIAL_TEACHERS } from '../../services/mockData';

export const Header: React.FC = () => {
  const { actor, role, quickSwitch, isLiveMode, toggleLiveMode, testConnection } = useAuth();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [testingLive, setTestingLive] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setTestingLive(true);
    setTestResult(null);
    try {
      const res = await testConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ ok: false, message: err.message || 'Lỗi kiểm tra' });
    } finally {
      setTestingLive(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* Logo & Brand */}
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

          {/* Right actions: PWA install + Account switcher */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />

            <button
              id="btn-header-user-switcher"
              onClick={() => setShowSwitchModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs text-slate-200 transition active:scale-95"
              title="Đổi tài khoản kiểm thử"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                {role === 'ADMIN' ? <Shield className="w-3 h-3 text-amber-400" /> : 'GV'}
              </div>
              <span className="max-w-[80px] truncate font-medium">
                {actor?.display_name.split(' ').pop() || 'User'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Quick Switch / System Info Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Chuyển vai trò & Kết nối</h3>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 text-sm font-medium"
              >
                Đóng
              </button>
            </div>

            {/* Current status */}
            <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tài khoản hiện tại:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  {role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-amber-400" />}
                  {actor?.display_name}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Vai trò / Quyền hạn:</span>
                <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {role === 'ADMIN' ? 'Quản Trị Toàn Trường (ADMIN)' : 'Giáo Viên (TEACHER)'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Phòng được cấp:</span>
                <span className="text-amber-400 font-medium">
                  {actor?.room_ids.join(', ') || 'Chưa cấp phòng'}
                </span>
              </div>
            </div>

            {/* Quick switcher list */}
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Chọn tài khoản mẫu để test nhanh các luồng:
              </p>
              <div className="space-y-2">
                {INITIAL_TEACHERS.map(t => {
                  const isCurrent = actor?.teacher_id === t.teacher_id;
                  return (
                    <button
                      key={t.teacher_id}
                      onClick={() => {
                        quickSwitch(t.email);
                        setShowSwitchModal(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition active:scale-[0.98] ${
                        isCurrent
                          ? 'bg-amber-500/15 border-amber-500/50 text-white'
                          : 'bg-slate-800/60 border-slate-750 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          t.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }`}>
                          {t.role === 'ADMIN' ? 'AD' : 'GV'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-1.5">
                            {t.display_name}
                            {t.role === 'ADMIN' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-normal">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {t.email} · {t.role === 'ADMIN' ? 'Tất cả các phòng' : `Phòng: ${t.room_ids.join(', ')}`}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-5 h-5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Backend connection details */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Cơ chế Dữ liệu & Backend</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLiveMode()}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                      isLiveMode
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {isLiveMode ? 'Live GAS' : 'Local Engine'}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mb-3">
                Apps Script Web App: <code className="text-amber-300/90 text-[10px] break-all">.../exec</code>
              </p>

              <button
                onClick={handleTestConnection}
                disabled={testingLive}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition"
              >
                {testingLive ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Kiểm tra kết nối Live Web App</span>
              </button>

              {testResult && (
                <div className={`mt-2 p-2.5 rounded-lg text-xs border ${
                  testResult.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
