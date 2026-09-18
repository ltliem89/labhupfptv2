import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { BorrowRecord } from '../../types';
import {
  Clock,
  AlertTriangle,
  ChevronRight,
  PackageCheck,
  Building,
  CheckCircle2,
  Search,
  Filter,
} from 'lucide-react';
import { BorrowDetailModal } from './BorrowDetailModal';

export const ActiveBorrowReturn: React.FC = () => {
  const { actor } = useAuth();
  const { rooms, dashboardData } = useData();
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  if (!actor || !dashboardData) return null;

  const activeBorrows = dashboardData.active_borrows.filter((r: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.borrow_id.toLowerCase().includes(q) ||
      (r.note || '').toLowerCase().includes(q) ||
      r.room_id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <h1 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-400" />
          <span>Phiếu đang mượn & Hoàn trả</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Danh sách các thiết bị bạn đang quản lý và cần hoàn trả vào phòng Lab
        </p>
      </div>

      {/* Summary Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-850 border border-slate-700 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-medium">Đang mượn:</span>
          <div className="text-xl font-extrabold text-white mt-0.5">
            {dashboardData.counts.active_borrow_records} phiếu ({dashboardData.counts.total_devices_holding || 0} thiết bị)
          </div>
        </div>
        {dashboardData.counts.overdue_records > 0 && (
          <div className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>{dashboardData.counts.overdue_records} quá ngày</span>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo mã phiếu, phòng, ghi chú..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* List of active borrows */}
      <div className="space-y-3">
        {activeBorrows.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-850/60 border border-dashed border-slate-750 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400/50 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-white">Không có phiếu mượn nào cần trả</h3>
            <p className="text-xs mt-1">Tất cả thiết bị đã được hoàn trả đầy đủ vào kho.</p>
          </div>
        ) : (
          activeBorrows.map(record => {
            const room = rooms.find(r => r.room_id === record.room_id);
            return (
              <div
                key={record.borrow_id}
                onClick={() => setSelectedBorrow(record)}
                className={`p-4 rounded-2xl border transition cursor-pointer active:scale-[0.99] ${
                  record.overdue
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500 shadow-md shadow-rose-950/20'
                    : 'bg-slate-850 border-slate-750 hover:border-slate-650'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-white">
                        {record.borrow_id}
                      </span>
                      {record.overdue ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500 text-white">
                          QUÁ HẠN
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          ĐANG MƯỢN
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-amber-300/90 mt-1 flex items-center gap-1">
                      <span>{room?.icon}</span>
                      <span>{room?.room_name} ({room?.room_code})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {record.note || 'Phiếu mượn thực hành giảng dạy'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">
                      {record.total_quantity} thiết bị
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{record.duration_label}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Mượn: {new Date(record.borrowed_at).toLocaleDateString('vi-VN')}
                  </span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedBorrow(record);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Hoàn trả ngay</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedBorrow && (
        <BorrowDetailModal
          borrow={selectedBorrow}
          onClose={() => setSelectedBorrow(null)}
          onReturned={() => setSelectedBorrow(null)}
        />
      )}
    </div>
  );
};
