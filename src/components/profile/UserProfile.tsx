import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  User,
  Shield,
  Building,
  RotateCcw,
  Smartphone,
  Database,
  ExternalLink,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

export const UserProfile: React.FC = () => {
  const { actor, role, logout } = useAuth();
  const { rooms: allRooms } = useData();

  if (!actor) return null;

  const rooms = allRooms.filter(r => actor.room_ids.includes(r.room_id));

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      <div>
        <h1 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          <span>Tài khoản & Thiết lập</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Thông tin hồ sơ, phân quyền phòng và công cụ kiểm thử hệ thống
        </p>
      </div>

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
                <span>{room.room_name} ({room.room_code})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

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
            <span className="font-semibold text-white">Google Apps Script API</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-750">
          <PWAInstallButton />
        </div>
      </div>

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

      <button
        onClick={logout}
        className="w-full py-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-sm border border-rose-500/30 transition flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        <span>Đăng Xuất</span>
      </button>
    </div>
  );
};
