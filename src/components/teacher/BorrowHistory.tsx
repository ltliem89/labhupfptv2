import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isBorrowOverdue, calculateDuration } from '../../services/api';
import { BorrowRecord, BorrowStatus } from '../../types';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Layers,
} from 'lucide-react';
import { BorrowDetailModal } from './BorrowDetailModal';

export const BorrowHistory: React.FC = () => {
  const { actor } = useAuth();
  const { rooms, dashboardData } = useData();
  const [selectedBorrow, setSelectedBorrow] = useState<BorrowRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (!actor || !dashboardData) return null;

  const allRecords = useMemo(() => {
    const records = dashboardData.all_records || [];
    return records.map((r: any) => {
      const items = r.items || [];
      const total = items.reduce((acc: number, cur: any) => acc + Number(cur.quantity), 0);
      return {
        ...r,
        overdue: isBorrowOverdue(r),
        duration_label: calculateDuration(r.borrowed_at, r.returned_at).label,
        total_quantity: total,
      };
    }).sort((a: any, b: any) => b.borrowed_at.localeCompare(a.borrowed_at));
  }, [dashboardData]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((r: any) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.borrow_id.toLowerCase().includes(q);
        const matchNote = (r.note || '').toLowerCase().includes(q);
        const matchRoom = r.room_id.toLowerCase().includes(q);
        if (!matchId && !matchNote && !matchRoom) return false;
      }
      return true;
    });
  }, [allRecords, statusFilter, searchQuery]);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-base font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-amber-400" />
          <span>Lịch sử mượn trả thiết bị</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tất cả phiếu mượn cá nhân theo thời gian (Không xóa lịch sử giao dịch)
        </p>
      </div>

      {/* Filters & Search */}
      <div className="space-y-2">
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

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'BORROWED', label: 'Đang mượn' },
            { id: 'PARTIAL_RETURN', label: 'Trả 1 phần' },
            { id: 'RETURNED', label: 'Đã hoàn trả' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-750'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-2.5">
        {filteredRecords.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-850/60 border border-dashed border-slate-750 text-center text-slate-400">
            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-white">Không tìm thấy phiếu nào</h3>
            <p className="text-xs mt-1">Hãy thử thay đổi từ khóa hoặc bộ lọc trạng thái.</p>
          </div>
        ) : (
          filteredRecords.map(record => {
            const room = rooms.find(r => r.room_id === record.room_id);
            return (
              <div
                key={record.borrow_id}
                onClick={() => setSelectedBorrow(record)}
                className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 hover:border-slate-650 transition cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-white">{record.borrow_id}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.status === 'RETURNED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : record.status === 'PARTIAL_RETURN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : record.overdue
                            ? 'bg-rose-500 text-white'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {record.status === 'RETURNED'
                          ? 'ĐÃ TRẢ'
                          : record.status === 'PARTIAL_RETURN'
                          ? 'TRẢ 1 PHẦN'
                          : record.overdue
                          ? 'QUÁ HẠN'
                          : 'ĐANG MƯỢN'}
                      </span>
                    </div>

                    <div className="text-xs text-amber-300/80 mt-1 flex items-center gap-1 font-medium">
                      <span>{room?.icon}</span>
                      <span>{room?.room_name} ({record.room_id})</span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {record.note || 'Phiếu mượn thực hành'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-amber-400">
                      {record.total_quantity} thiết bị
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {new Date(record.borrowed_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Thời lượng: {record.duration_label}</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                    Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Slip Details Modal */}
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
