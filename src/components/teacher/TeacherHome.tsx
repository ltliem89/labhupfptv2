import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { localEngine } from '../../services/api';
import {
  PackagePlus,
  Clock,
  AlertTriangle,
  Calendar,
  Layers,
  ChevronRight,
  PlusCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { EquipmentRequestModal } from './EquipmentRequestModal';
import { BorrowDetailModal } from './BorrowDetailModal';
import { BorrowRecord } from '../../types';

interface TeacherHomeProps {
  onGoToBorrow: () => void;
  onGoToActive: () => void;
  onGoToHistory: () => void;
  onGoToReport: () => void;
}

export const TeacherHome: React.FC<TeacherHomeProps> = ({
  onGoToBorrow,
  onGoToActive,
  onGoToHistory,
  onGoToReport,
}) => {
  const { actor, role, refreshTrigger } = useAuth();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowRecord | null>(null);

  if (!actor) return null;

  const dashboardData = localEngine.getMyDashboard(actor);
  const rooms = localEngine.getRooms().filter(r => actor.room_ids.includes(r.room_id));

  return (
    <div className="space-y-5 pb-20 animate-in fade-in duration-200">
      {/* User Greeting & Status */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-lg shadow-md shadow-amber-500/20">
              {actor.display_name.charAt(actor.display_name.lastIndexOf(' ') + 1) || 'GV'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-lg text-white leading-tight">
                  {actor.display_name}
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {role === 'ADMIN' ? 'Ban Giám Hiệu · Quản Trị Hệ Thống' : 'Giáo viên bộ môn'}
              </p>
            </div>
          </div>
        </div>

        {/* Assigned rooms badges */}
        <div className="mt-3 pt-3 border-t border-slate-750 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Phòng quản lý:</span>
          {rooms.map(room => (
            <span
              key={room.room_id}
              className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-800 text-amber-400 border border-slate-700 flex items-center gap-1"
            >
              <span>{room.icon}</span>
              <span>{room.room_code}</span>
            </span>
          ))}
          {rooms.length === 0 && (
            <span className="text-xs text-slate-500 italic">Chưa được cấp phòng</span>
          )}
        </div>
      </div>

      {/* Prominent CTA: MƯỢN THIẾT BỊ */}
      <button
        id="btn-teacher-borrow-cta"
        onClick={onGoToBorrow}
        className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-extrabold text-base shadow-lg shadow-amber-500/25 flex items-center justify-between hover:brightness-105 active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950/15 flex items-center justify-center">
            <PackagePlus className="w-6 h-6 text-slate-950" />
          </div>
          <div className="text-left">
            <div className="text-base tracking-tight leading-none">MƯỢN THIẾT BỊ NGAY</div>
            <div className="text-[11px] font-semibold text-slate-900/80 mt-1">
              Quy trình 6 bước chuẩn · Chọn bài & nhận thiết bị
            </div>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 shrink-0" />
      </button>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Active borrows */}
        <div
          onClick={onGoToActive}
          className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 hover:border-slate-600 transition cursor-pointer active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Phiếu đang mở</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {dashboardData.counts.active_borrow_records}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Cần hoàn trả</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>

        {/* Devices holding */}
        <div
          onClick={onGoToActive}
          className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 hover:border-slate-600 transition cursor-pointer active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Thiết bị đang giữ</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {dashboardData.counts.total_devices_holding}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Tổng số lượng giữ</div>
        </div>

        {/* Overdue slips */}
        <div
          onClick={onGoToActive}
          className={`p-3.5 rounded-2xl border transition cursor-pointer active:scale-95 ${
            dashboardData.counts.overdue_records > 0
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-200'
              : 'bg-slate-850 border-slate-750 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Phiếu quá ngày</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                dashboardData.counts.overdue_records > 0
                  ? 'bg-rose-500/30 text-rose-300'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`mt-2 text-2xl font-black ${dashboardData.counts.overdue_records > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
            {dashboardData.counts.overdue_records}
          </div>
          <div className="text-[11px] mt-1">
            {dashboardData.counts.overdue_records > 0 ? 'Cần trả gấp ⚠️' : 'Không có quá hạn'}
          </div>
        </div>

        {/* Month total */}
        <div
          onClick={onGoToHistory}
          className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 hover:border-slate-600 transition cursor-pointer active:scale-95"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Tổng trong tháng</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {dashboardData.counts.current_month_records}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Lượt mượn tháng này</div>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="btn-teacher-request-equipment"
          onClick={() => setShowRequestModal(true)}
          className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 flex items-center gap-3 transition active:scale-95 text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Thêm đề xuất TB</div>
            <div className="text-[10px] text-slate-400">Yêu cầu mua/bổ sung</div>
          </div>
        </button>

        <button
          id="btn-teacher-view-report"
          onClick={onGoToReport}
          className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 flex items-center gap-3 transition active:scale-95 text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Báo cáo cá nhân</div>
            <div className="text-[10px] text-slate-400">Tuần, tháng, in phiếu</div>
          </div>
        </button>
      </div>

      {/* Active Borrow Slips Section */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Phiếu đang mượn cần trả ({dashboardData.active_borrows.length})</span>
          </h2>
          {dashboardData.active_borrows.length > 0 && (
            <button
              onClick={onGoToActive}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {dashboardData.active_borrows.length === 0 ? (
          <div className="p-5 rounded-2xl bg-slate-850/60 border border-dashed border-slate-750 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-2" />
            <p className="text-xs font-medium">Hiện tại bạn không giữ thiết bị nào chưa trả</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {dashboardData.active_borrows.map(record => {
              const room = rooms.find(r => r.room_id === record.room_id);
              return (
                <div
                  key={record.borrow_id}
                  onClick={() => setSelectedBorrow(record)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer active:scale-[0.99] ${
                    record.overdue
                      ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500'
                      : 'bg-slate-850 border-slate-750 hover:border-slate-650'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-white">{record.borrow_id}</span>
                        {record.overdue && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-rose-500 text-white">
                            QUÁ HẠN
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {record.room_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                        {record.note || 'Phiếu mượn thực hành'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-400">
                        {record.total_quantity} thiết bị
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {record.duration_label}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Mượn lúc: {new Date(record.borrowed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, {new Date(record.borrowed_at).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      Trả thiết bị <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Equipment Request Modal */}
      {showRequestModal && (
        <EquipmentRequestModal onClose={() => setShowRequestModal(false)} />
      )}

      {/* Slip Detail Modal */}
      {selectedBorrow && (
        <BorrowDetailModal
          borrow={selectedBorrow}
          onClose={() => setSelectedBorrow(null)}
          onReturned={() => {
            setSelectedBorrow(null);
            onGoToActive();
          }}
        />
      )}
    </div>
  );
};
