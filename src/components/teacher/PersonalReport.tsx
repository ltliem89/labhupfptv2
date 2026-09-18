import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isBorrowOverdue, calculateDuration } from '../../services/api';
import {
  FileText,
  Calendar,
  Printer,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export const PersonalReport: React.FC = () => {
  const { actor } = useAuth();
  const { dashboardData, rooms } = useData();
  const [period, setPeriod] = useState<'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM'>('MONTH');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  if (!actor || !dashboardData) return null;

  const filteredRecords = useMemo(() => {
    const all = dashboardData.all_records || [];
    const now = new Date();

    let start = '';
    let end = '';

    if (period === 'WEEK') {
      const day = now.getDay() || 7;
      const d = new Date(now);
      d.setDate(d.getDate() - day + 1);
      start = d.toISOString().slice(0, 10);
      end = now.toISOString().slice(0, 10);
    } else if (period === 'MONTH') {
      start = now.toISOString().slice(0, 7) + '-01';
      end = now.toISOString().slice(0, 10);
    } else if (period === 'YEAR') {
      start = now.getFullYear() + '-01-01';
      end = now.toISOString().slice(0, 10);
    } else if (period === 'CUSTOM') {
      start = fromDate;
      end = toDate;
    }

    const res = all.filter((r: any) => {
      const dateStr = (r.borrowed_at || '').slice(0, 10);
      if (start && dateStr < start) return false;
      if (end && dateStr > end) return false;
      return true;
    });

    return res.map((r: any) => {
      const items = r.items || [];
      const total = items.reduce((acc: number, cur: any) => acc + Number(cur.quantity), 0);
      return {
        ...r,
        overdue: isBorrowOverdue(r),
        duration_label: calculateDuration(r.borrowed_at, r.returned_at).label,
        total_quantity: total,
      };
    });
  }, [dashboardData, period, fromDate, toDate]);

  const totalSlips = filteredRecords.length;
  const returnedSlips = filteredRecords.filter((r: any) => r.status === 'RETURNED').length;
  const activeSlips = filteredRecords.filter((r: any) => r.status === 'BORROWED' || r.status === 'PARTIAL_RETURN').length;
  const overdueSlips = filteredRecords.filter((r: any) => r.overdue).length;
  const totalEquipments = filteredRecords.reduce((sum: number, r: any) => sum + (r.total_quantity || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200 print:bg-white print:text-black print:p-4">
      {/* Title */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Báo cáo sử dụng thiết bị cá nhân</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dữ liệu độc quyền thuộc tài khoản: {actor.display_name}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>In</span>
        </button>
      </div>

      {/* Period Filter Buttons */}
      <div className="print:hidden space-y-2">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-850 border border-slate-750">
          {(['WEEK', 'MONTH', 'YEAR', 'CUSTOM'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                period === p
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {p === 'WEEK' ? 'Tuần này' : p === 'MONTH' ? 'Tháng này' : p === 'YEAR' ? 'Năm nay' : 'Tùy chọn'}
            </button>
          ))}
        </div>

        {period === 'CUSTOM' && (
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Từ ngày:</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Đến ngày:</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs">
          <span className="text-slate-400">Tổng phiếu mượn</span>
          <div className="text-xl font-extrabold text-white mt-1">{totalSlips}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs">
          <span className="text-slate-400">Tổng thiết bị</span>
          <div className="text-xl font-extrabold text-amber-400 mt-1">{totalEquipments}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs">
          <span className="text-slate-400">Đã hoàn trả</span>
          <div className="text-xl font-extrabold text-emerald-400 mt-1">{returnedSlips}</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs">
          <span className="text-slate-400">Đang mượn / Quá hạn</span>
          <div className="text-xl font-extrabold text-rose-400 mt-1">
            {activeSlips} <span className="text-xs text-rose-400/80 font-normal">({overdueSlips} quá hạn)</span>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div>
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
          Bảng kê chi tiết phiếu mượn ({filteredRecords.length}):
        </h2>

        <div className="space-y-2">
          {filteredRecords.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-850 border border-dashed border-slate-750 text-center text-slate-400 text-xs">
              Không có dữ liệu trong khoảng thời gian đã chọn.
            </div>
          ) : (
            filteredRecords.map((record: any) => {
              const room = rooms.find(r => r.room_id === record.room_id);
              return (
                <div
                  key={record.borrow_id}
                  className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">{record.borrow_id}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] ${
                        record.status === 'RETURNED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : record.overdue
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {record.status === 'RETURNED'
                        ? 'ĐÃ TRẢ'
                        : record.overdue
                        ? 'QUÁ HẠN'
                        : 'ĐANG MƯỢN'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>Phòng: {room?.room_name} ({record.room_id})</span>
                    <span className="text-amber-400 font-semibold">{record.total_quantity} thiết bị</span>
                  </div>

                  <div className="text-slate-400 text-[11px] flex items-center justify-between">
                    <span>Ngày: {new Date(record.borrowed_at).toLocaleDateString('vi-VN')}</span>
                    <span>Thời lượng: {record.duration_label}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
