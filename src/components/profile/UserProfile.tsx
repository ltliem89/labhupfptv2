import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { localEngine } from '../../services/api';
import { Teacher } from '../../types';
import {
  User,
  Shield,
  Building,
  RotateCcw,
  Smartphone,
  Database,
  ExternalLink,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const UserProfile: React.FC = () => {
  const { actor, role, setActorById, teachers, resetAllData } = useAuth();
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);
  const [resetSuccess, setResetSuccess] = React.useState(false);

  if (!actor) return null;

  const rooms = localEngine.getRooms().filter(r => actor.room_ids.includes(r.room_id));

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          <span>Tài khoản & Thiết lập</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Thông tin hồ sơ, phân quyền phòng và công cụ kiểm thử hệ thống
        </p>
      </div>

      {/* User Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 shadow-lg space-y-3">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
            {actor.display_name.charAt(actor.display_name.lastIndexOf(' ') + 1) || 'U'}
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">{actor.display_name}</h2>
            <div className="text-xs text-slate-400 mt-0.5">{actor.email}</div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {actor.teacher_id}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'GIÁO VIÊN'}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned rooms */}
        <div className="pt-3 border-t border-slate-750">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
            Phòng học được cấp quyền quản lý ({rooms.length}):
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {rooms.map(room => (
              <span
                key={room.room_id}
                className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1"
              >
                <span>{room.icon}</span>
                <span>{room.room_name} ({room.room_code})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Role / User Switcher for Testing Full System Coordination */}
      <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Users className="w-4 h-4 text-amber-400" />
          <span>Chuyển đổi tài khoản (Kiểm thử vai trò)</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Chọn tài khoản khác để kiểm tra tính phối hợp giữa Giáo viên và Ban Giám Hiệu:
        </p>

        <div className="space-y-1.5">
          {teachers.map((t: Teacher) => {
            const isCurrent = t.teacher_id === actor.teacher_id;
            return (
              <button
                key={t.teacher_id}
                onClick={() => setActorById(t.teacher_id)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-slate-800 border-slate-750 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-6 h-6 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-[10px]">
                    {t.role === 'ADMIN' ? 'AD' : 'GV'}
                  </span>
                  <span>{t.display_name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {t.teacher_id}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* PWA & System info */}
      <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
          <Smartphone className="w-4 h-4 text-sky-400" />
          <span>Ứng dụng Mobile PWA V4</span>
        </div>

        <div className="space-y-2 text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Trạng thái PWA:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng cài đặt
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Công nghệ dữ liệu:</span>
            <span className="font-semibold text-white">Local-first + GAS Sync Ready</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Phiên bản đặc tả:</span>
            <span className="font-mono text-amber-400">V4.0 (17 Sheets Compliant)</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-750">
          <PWAInstallButton />
        </div>
      </div>

      {/* Google Apps Script & Google Sheet Backend Connection */}
      <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-300 uppercase tracking-wider">
            <Database className="w-4 h-4 text-amber-400" />
            <span>Kết nối Google Backend (Apps Script & Sheet)</span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            ĐÃ KẾT NỐI
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Hệ thống tích hợp theo đặc tả LabHup V4 với Web App Google Apps Script và bảng tính Google Sheet quản lý 17 sheets.
        </p>

        <div className="space-y-2 bg-slate-900/70 p-3 rounded-xl border border-slate-800 text-[11px]">
          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-400 shrink-0 font-medium">Apps Script Web App:</span>
            <a
              href="https://script.google.com/macros/s/AKfycbz4RQ102X4gZ8FjxHa41HyI0b1rVk36cEjzBPMGN_rOVx5t2MGReygNC4hljuEwFjSzNw/exec"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 truncate flex items-center gap-1 font-mono text-[10px]"
            >
              <span>...AKfycbz4RQ102X4g...</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 shrink-0 font-medium">Apps Script Project:</span>
            <a
              href="https://script.google.com/u/0/home/projects/1FgjtNFKZIyiThs4aPeB2Goi17qpr8UJvwxV6pej7gsKJGYDyzo4JgFtA/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 truncate flex items-center gap-1 font-mono text-[10px]"
            >
              <span>Project Editor</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 shrink-0 font-medium">Bảng tính Google Sheet V4:</span>
            <a
              href="https://docs.google.com/spreadsheets/d/10Gf0i8XbY3UBCOKmrbmVVCj1S_Bft1_NVjeDoaQD4t0/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 truncate flex items-center gap-1 font-mono text-[10px]"
            >
              <span>Sheet Database</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Reset Engine Data Button */}
      <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <Database className="w-4 h-4 text-rose-400" />
            <span>Khôi phục dữ liệu mẫu V4 gốc</span>
          </div>
          {!showConfirmReset && (
            <button
              onClick={() => {
                setShowConfirmReset(true);
                setResetSuccess(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mẫu</span>
            </button>
          )}
        </div>

        {resetSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Đã khôi phục toàn bộ dữ liệu mẫu ban đầu thành công!</span>
          </div>
        )}

        {showConfirmReset && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2.5 animate-in fade-in">
            <p className="text-rose-200 text-xs leading-relaxed">
              Bạn có chắc muốn đặt lại toàn bộ kho thiết bị, phòng học và các phiếu mượn về trạng thái mẫu V4 mặc định?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setShowConfirmReset(false);
                  setResetSuccess(true);
                  setTimeout(() => setResetSuccess(false), 4000);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm"
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
