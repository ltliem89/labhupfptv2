import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { localEngine } from '../../services/api';
import {
  Shield,
  Layers,
  Clock,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Users,
  Settings,
  Activity,
  Search,
  Plus,
  Edit2,
  Unlock,
  Building,
  Check,
  X,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { EquipmentRequest, Equipment, BorrowRecord, Teacher, DiagnosticsResult } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { actor, role, triggerRefresh, refreshTrigger } = useAuth();

  const [adminTab, setAdminTab] = useState<
    'overview' | 'approvals' | 'equipment' | 'borrows' | 'permissions' | 'diagnostics'
  >('overview');

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 3500);
  };

  // Rejection modal
  const [rejectReqId, setRejectReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [rejectModalError, setRejectModalError] = useState<string>('');

  // Unlock modal
  const [unlockBorrowId, setUnlockBorrowId] = useState<string | null>(null);
  const [unlockReason, setUnlockReason] = useState<string>('');
  const [unlockModalError, setUnlockModalError] = useState<string>('');

  // Equipment edit modal
  const [editEquipment, setEditEquipment] = useState<Equipment | null>(null);
  const [editModalError, setEditModalError] = useState<string>('');

  // Diagnostics state
  const [diagResult, setDiagResult] = useState<DiagnosticsResult | null>(null);

  // Search & Filters
  const [eqSearch, setEqSearch] = useState('');
  const [eqRoomFilter, setEqRoomFilter] = useState('ALL');

  // Master data
  const rooms = localEngine.getRooms();
  const allEquipment = localEngine.getMergedInventory();
  const allRequests = localEngine.getEquipmentRequests();
  const allBorrows = localEngine.getBorrowRecords().map(r => localEngine.decorateBorrowRecord(r, actor || undefined));
  const teachers = localEngine.getTeachers();

  // Metrics
  const totalEquipmentCount = allEquipment.reduce((sum, e) => sum + e.total_quantity, 0);
  const totalBorrowedCount = allEquipment.reduce((sum, e) => sum + (e.borrowed_quantity || 0), 0);
  const totalBlockedCount = allEquipment.reduce((sum, e) => sum + e.blocked_quantity, 0);
  const pendingRequests = allRequests.filter(r => r.status === 'PENDING');
  const overdueBorrows = allBorrows.filter(r => r.overdue);

  // Handlers
  const handleApproveRequest = (requestId: string) => {
    if (!actor) return;
    try {
      localEngine.adminApproveEquipmentRequest(actor, requestId);
      triggerRefresh();
      showToast('Đã phê duyệt đề xuất và bổ sung thiết bị vào kho!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi duyệt', 'error');
    }
  };

  const handleRejectSubmit = () => {
    if (!actor || !rejectReqId) return;
    if (!rejectReason.trim()) {
      setRejectModalError('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      localEngine.adminRejectEquipmentRequest(actor, rejectReqId, rejectReason);
      setRejectReqId(null);
      setRejectReason('');
      setRejectModalError('');
      triggerRefresh();
      showToast('Đã từ chối đề xuất thiết bị', 'success');
    } catch (err: any) {
      setRejectModalError(err.message || 'Lỗi khi từ chối');
    }
  };

  const handleUnlockSubmit = () => {
    if (!actor || !unlockBorrowId) return;
    if (!unlockReason.trim()) {
      setUnlockModalError('Bắt buộc phải nhập lý do mở khóa');
      return;
    }
    try {
      localEngine.adminUnlock(actor, unlockBorrowId, unlockReason);
      setUnlockBorrowId(null);
      setUnlockReason('');
      setUnlockModalError('');
      triggerRefresh();
      showToast('Đã mở khóa phiếu mượn thành công!', 'success');
    } catch (err: any) {
      setUnlockModalError(err.message || 'Lỗi mở khóa');
    }
  };

  const handleToggleRoomPermission = (teacherId: string, roomId: string, currentStatus: boolean) => {
    if (!actor) return;
    try {
      localEngine.adminRoomPermission(actor, teacherId, roomId, currentStatus ? 'INACTIVE' : 'ACTIVE');
      triggerRefresh();
      showToast('Đã cập nhật quyền phòng cho giáo viên', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi phân quyền', 'error');
    }
  };

  const handleRunDiagnostics = () => {
    const res = localEngine.getDiagnostics();
    setDiagResult(res);
  };

  // Filtered equipment
  const filteredEquipment = useMemo(() => {
    return allEquipment.filter(e => {
      if (eqRoomFilter !== 'ALL' && e.room_id !== eqRoomFilter) return false;
      if (eqSearch.trim()) {
        const q = eqSearch.toLowerCase();
        return (
          e.equipment_name.toLowerCase().includes(q) ||
          e.equipment_code.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allEquipment, eqRoomFilter, eqSearch]);

  if (role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-slate-400">
        <Shield className="w-12 h-12 text-rose-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-white">Yêu cầu quyền Quản trị viên (ADMIN)</h2>
        <p className="text-xs mt-1">Bạn không có quyền truy cập trang quản trị này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h1 className="text-base font-bold text-white">Quản trị Hệ thống LAB HUB</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Duyệt yêu cầu, kho thiết bị, phân quyền phòng & chẩn đoán
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Tổng quan' },
          { id: 'approvals', label: `Duyệt đề xuất (${pendingRequests.length})`, alert: pendingRequests.length > 0 },
          { id: 'equipment', label: 'Kho thiết bị' },
          { id: 'borrows', label: `Mượn / Trả (${overdueBorrows.length} trễ)` },
          { id: 'permissions', label: 'Phân quyền phòng' },
          { id: 'diagnostics', label: 'Chẩn đoán V4' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              adminTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-750'
            }`}
          >
            <span>{tab.label}</span>
            {tab.alert && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setAdminTab('equipment')}
              className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 cursor-pointer active:scale-95 transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Tổng thiết bị</span>
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">
                {totalEquipmentCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {allEquipment.length} danh mục thiết bị
              </div>
            </div>

            <div
              onClick={() => setAdminTab('borrows')}
              className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 cursor-pointer active:scale-95 transition"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Đang cho mượn</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400 mt-1.5">
                {totalBorrowedCount}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Thiết bị đang ngoài kho
              </div>
            </div>

            <div
              onClick={() => setAdminTab('approvals')}
              className={`p-3.5 rounded-2xl border cursor-pointer active:scale-95 transition ${
                pendingRequests.length > 0
                  ? 'bg-amber-500/15 border-amber-500/40'
                  : 'bg-slate-850 border-slate-750'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Chờ duyệt đề xuất</span>
                <FileCheck2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className={`text-2xl font-black mt-1.5 ${pendingRequests.length > 0 ? 'text-amber-400' : 'text-white'}`}>
                {pendingRequests.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {pendingRequests.length > 0 ? 'Cần phê duyệt ngay' : 'Không có yêu cầu chờ'}
              </div>
            </div>

            <div
              onClick={() => setAdminTab('borrows')}
              className={`p-3.5 rounded-2xl border cursor-pointer active:scale-95 transition ${
                overdueBorrows.length > 0
                  ? 'bg-rose-500/15 border-rose-500/40'
                  : 'bg-slate-850 border-slate-750'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Phiếu quá ngày</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className={`text-2xl font-black mt-1.5 ${overdueBorrows.length > 0 ? 'text-rose-400' : 'text-white'}`}>
                {overdueBorrows.length}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {overdueBorrows.length > 0 ? 'Cần xử lý hoàn trả' : 'Đúng hạn'}
              </div>
            </div>
          </div>

          {/* Room Summary Cards */}
          <div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Hiện trạng 4 phòng chức năng (V4):
            </h2>
            <div className="space-y-2">
              {rooms.map(room => {
                const roomEq = allEquipment.filter(e => e.room_id === room.room_id);
                const roomTotal = roomEq.reduce((s, e) => s + e.total_quantity, 0);
                const roomBorrowed = roomEq.reduce((s, e) => s + (e.borrowed_quantity || 0), 0);
                const roomBlocked = roomEq.reduce((s, e) => s + e.blocked_quantity, 0);

                return (
                  <div
                    key={room.room_id}
                    className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                        {room.icon}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">
                          {room.room_name} ({room.room_code})
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {roomEq.length} loại thiết bị · {room.note}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-amber-400">
                        {roomTotal - roomBorrowed - roomBlocked} khả dụng
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Đang mượn: {roomBorrowed} · Hỏng: {roomBlocked}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: APPROVALS */}
      {adminTab === 'approvals' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Yêu cầu đề xuất thiết bị ({allRequests.length})
            </h2>
          </div>

          {allRequests.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-850 border border-dashed border-slate-750 text-center text-slate-400 text-xs">
              Chưa có đề xuất thiết bị nào từ giáo viên.
            </div>
          ) : (
            allRequests.map(req => {
              const room = rooms.find(r => r.room_id === req.room_id);
              const isPending = req.status === 'PENDING';

              return (
                <div
                  key={req.request_id}
                  className="p-4 rounded-2xl bg-slate-850 border border-slate-750 text-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {req.image_url ? (
                        <img
                          src={req.image_url}
                          alt={req.equipment_name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-800 text-slate-500 font-bold flex items-center justify-center shrink-0">
                          TB
                        </div>
                      )}
                      <div>
                        <div className="font-extrabold text-white text-sm">
                          {req.equipment_name}
                        </div>
                        <div className="text-amber-400 font-semibold mt-0.5">
                          {room?.icon} {room?.room_name} · Số lượng: {req.quantity}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Đề xuất bởi: <strong className="text-slate-200">{req.requester_name || req.requested_by}</strong> · {new Date(req.created_at).toLocaleDateString('vi-VN')}
                        </div>
                        {req.note && (
                          <div className="text-slate-400 text-[11px] italic mt-1">
                            "{req.note}"
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : req.status === 'CANCELLED'
                          ? 'bg-slate-700 text-slate-400'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {req.status === 'APPROVED'
                        ? 'ĐÃ DUYỆT'
                        : req.status === 'REJECTED'
                        ? 'TỪ CHỐI'
                        : req.status === 'CANCELLED'
                        ? 'ĐÃ HỦY'
                        : 'CHỜ DUYỆT'}
                    </span>
                  </div>

                  {req.rejected_reason && (
                    <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px]">
                      <strong>Lý do từ chối:</strong> {req.rejected_reason}
                    </div>
                  )}

                  {isPending && (
                    <div className="pt-2.5 border-t border-slate-750 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setRejectReqId(req.request_id);
                          setRejectReason('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs transition"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleApproveRequest(req.request_id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-500/20 transition active:scale-95"
                      >
                        Phê duyệt & Tạo kho
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB: EQUIPMENT ADMIN */}
      {adminTab === 'equipment' && (
        <div className="space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Kho thiết bị toàn trường ({filteredEquipment.length})
            </h2>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên thiết bị, mã, phân loại..."
                value={eqSearch}
                onChange={e => setEqSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-750 text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setEqRoomFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  eqRoomFilter === 'ALL' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Tất cả phòng
              </button>
              {rooms.map(r => (
                <button
                  key={r.room_id}
                  onClick={() => setEqRoomFilter(r.room_id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                    eqRoomFilter === r.room_id ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {r.icon} {r.room_code}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredEquipment.map(eq => {
              const room = rooms.find(r => r.room_id === eq.room_id);
              return (
                <div
                  key={eq.equipment_id}
                  className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                      {eq.image_url ? (
                        <img
                          src={eq.image_url}
                          alt={eq.equipment_name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">
                          TB
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{eq.equipment_name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {eq.equipment_code} · {room?.room_name} ({eq.room_id})
                      </div>
                      <div className="text-[10px] text-amber-400 font-semibold mt-1">
                        Tổng: {eq.total_quantity} · Khả dụng: {eq.available_quantity} · Hỏng/khóa: {eq.blocked_quantity}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditEquipment(eq)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-750"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: BORROWS & PAST-DAY UNLOCK */}
      {adminTab === 'borrows' && (
        <div className="space-y-3 animate-in fade-in">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Tất cả phiếu mượn toàn trường ({allBorrows.length})
          </h2>

          <div className="space-y-2.5">
            {allBorrows.map(record => {
              const teacher = teachers.find(t => t.teacher_id === record.teacher_id);
              const room = rooms.find(r => r.room_id === record.room_id);
              const isLocked = record.edit_state === 'LOCKED';

              return (
                <div
                  key={record.borrow_id}
                  className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 text-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{record.borrow_id}</div>
                      <div className="text-amber-400 font-semibold text-xs mt-0.5">
                        GV: {teacher?.display_name || record.teacher_id} · {room?.room_name}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Mượn lúc: {new Date(record.borrowed_at).toLocaleDateString('vi-VN')} ({record.duration_label})
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.status === 'RETURNED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : record.overdue
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {record.status === 'RETURNED' ? 'ĐÃ TRẢ' : record.overdue ? 'QUÁ HẠN' : 'ĐANG MƯỢN'}
                      </span>
                      <div className="text-xs font-bold text-white mt-1">
                        {record.total_quantity} thiết bị
                      </div>
                    </div>
                  </div>

                  {/* Admin Unlock button for past-day or locked records */}
                  {record.status !== 'RETURNED' && (
                    <div className="pt-2 border-t border-slate-750 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Khóa sửa đổi: <strong>{record.edit_state}</strong>
                      </span>

                      {record.edit_state !== 'ADMIN_UNLOCKED' ? (
                        <button
                          onClick={() => {
                            setUnlockBorrowId(record.borrow_id);
                            setUnlockReason('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1 transition"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Mở khóa phiếu quá hạn</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-purple-300 font-bold">
                          Đã Admin Unlock ({record.unlock_reason})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: PERMISSIONS */}
      {adminTab === 'permissions' && (
        <div className="space-y-3 animate-in fade-in">
          <div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Phân quyền Giáo viên ↔ Phòng học
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Chỉ những phòng được tích chọn thì giáo viên mới thấy và mượn được thiết bị
            </p>
          </div>

          <div className="space-y-3">
            {teachers.map(teacher => {
              return (
                <div
                  key={teacher.teacher_id}
                  className="p-4 rounded-2xl bg-slate-850 border border-slate-750 text-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{teacher.display_name}</div>
                      <div className="text-slate-400 text-[11px]">{teacher.email} · {teacher.role}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
                      {teacher.teacher_id}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                      Quyền truy cập phòng:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {rooms.map(room => {
                        const hasAccess = teacher.room_ids.includes(room.room_id);
                        return (
                          <button
                            key={room.room_id}
                            onClick={() => handleToggleRoomPermission(teacher.teacher_id, room.room_id, hasAccess)}
                            className={`p-2 rounded-xl border text-left flex items-center justify-between transition ${
                              hasAccess
                                ? 'bg-amber-500/20 border-amber-500/60 text-white font-bold'
                                : 'bg-slate-800 border-slate-750 text-slate-400 hover:bg-slate-750'
                            }`}
                          >
                            <span className="truncate">
                              {room.icon} {room.room_name}
                            </span>
                            {hasAccess ? (
                              <Check className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-slate-500 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: DIAGNOSTICS */}
      {adminTab === 'diagnostics' && (
        <div className="space-y-3 animate-in fade-in">
          <div>
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Chẩn đoán hệ thống & Toàn vẹn dữ liệu V4
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Kiểm tra schema 17 tabs Google Sheets, liên kết khóa ngoại và tồn kho âm
            </p>
          </div>

          <button
            onClick={handleRunDiagnostics}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Activity className="w-4 h-4" />
            <span>CHẠY KIỂM TRA CHẨN ĐOÁN TOÀN HỆ THỐNG</span>
          </button>

          {diagResult && (
            <div className="space-y-3 mt-3">
              {/* Integrity status */}
              <div
                className={`p-4 rounded-2xl border ${
                  diagResult.integrity.ok
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {diagResult.integrity.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                  <span>
                    {diagResult.integrity.ok
                      ? 'Hệ thống hoàn hảo: Không phát hiện lỗi P0/P1'
                      : `Phát hiện ${diagResult.integrity.problem_count} sự cố toàn vẹn dữ liệu`}
                  </span>
                </div>
              </div>

              {/* Sheet counts */}
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 text-xs">
                <h3 className="font-bold text-white mb-2">Số lượng bản ghi các bảng dữ liệu:</h3>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  {Object.entries(diagResult.sheets).map(([sheet, stat]) => (
                    <div key={sheet} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-800">
                      <span className="font-mono text-[11px]">{sheet}:</span>
                      <span className="font-bold text-amber-400">{stat.rows} dòng</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Endpoints Info */}
              <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 text-xs space-y-2">
                <h3 className="font-bold text-white">Liên kết Backend Google Apps Script & Google Sheet V4:</h3>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Web App API:</span>
                    <a
                      href="https://script.google.com/macros/s/AKfycbz4RQ102X4gZ8FjxHa41HyI0b1rVk36cEjzBPMGN_rOVx5t2MGReygNC4hljuEwFjSzNw/exec"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono text-[10px]"
                    >
                      <span>Web App URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Google Sheet V4:</span>
                    <a
                      href="https://docs.google.com/spreadsheets/d/10Gf0i8XbY3UBCOKmrbmVVCj1S_Bft1_NVjeDoaQD4t0/edit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono text-[10px]"
                    >
                      <span>10Gf0i8XbY3...QD4t0</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOAST NOTIFICATION BANNER */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm p-3 rounded-xl border shadow-xl flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/95 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100">
            <h3 className="font-bold text-sm text-white">Từ chối đề xuất thiết bị</h3>
            <p className="text-xs text-slate-400 mt-1">
              Bắt buộc phải cung cấp lý do từ chối để giáo viên nắm thông tin
            </p>
            {rejectModalError && (
              <div className="mt-2.5 p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[11px] text-rose-300">
                {rejectModalError}
              </div>
            )}
            <textarea
              value={rejectReason}
              onChange={e => {
                setRejectReason(e.target.value);
                setRejectModalError('');
              }}
              placeholder="VD: Kinh phí vượt định mức, hoặc phòng Lab đã có thiết bị tương tự..."
              className="w-full h-24 mt-3 p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setRejectReqId(null);
                  setRejectModalError('');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                className="flex-1 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNLOCK MODAL */}
      {unlockBorrowId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100">
            <h3 className="font-bold text-sm text-white">Mở khóa phiếu mượn quá ngày</h3>
            <p className="text-xs text-slate-400 mt-1">
              Nhập lý do mở khóa để lưu vào nhật ký kiểm toán (AUDIT_LOG):
            </p>
            {unlockModalError && (
              <div className="mt-2.5 p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[11px] text-rose-300">
                {unlockModalError}
              </div>
            )}
            <input
              type="text"
              value={unlockReason}
              onChange={e => {
                setUnlockReason(e.target.value);
                setUnlockModalError('');
              }}
              placeholder="VD: Giáo viên bù tiết học bị hoãn do bão..."
              className="w-full mt-3 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setUnlockBorrowId(null);
                  setUnlockModalError('');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleUnlockSubmit}
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-500"
              >
                Mở khóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EQUIPMENT EDIT MODAL */}
      {editEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100">
            <h3 className="font-bold text-sm text-white">Cập nhật thiết bị kho</h3>
            <p className="text-xs text-slate-400 mt-0.5">{editEquipment.equipment_name}</p>

            {editModalError && (
              <div className="mt-2.5 p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[11px] text-rose-300">
                {editModalError}
              </div>
            )}

            <div className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tổng số lượng:</label>
                <input
                  type="number"
                  min="0"
                  value={editEquipment.total_quantity}
                  onChange={e => {
                    setEditEquipment({
                      ...editEquipment,
                      total_quantity: Math.max(0, Number(e.target.value) || 0),
                    });
                    setEditModalError('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Số lượng hỏng / khóa (Blocked):</label>
                <input
                  type="number"
                  min="0"
                  value={editEquipment.blocked_quantity}
                  onChange={e => {
                    setEditEquipment({
                      ...editEquipment,
                      blocked_quantity: Math.max(0, Number(e.target.value) || 0),
                    });
                    setEditModalError('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setEditEquipment(null);
                  setEditModalError('');
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!actor) return;
                  try {
                    localEngine.adminUpdateEquipment(actor, editEquipment);
                    setEditEquipment(null);
                    setEditModalError('');
                    triggerRefresh();
                    showToast('Đã lưu cập nhật thiết bị thành công!', 'success');
                  } catch (err: any) {
                    setEditModalError(err.message || 'Lỗi cập nhật');
                  }
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
