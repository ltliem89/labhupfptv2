import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { localEngine } from '../../services/api';
import {
  X,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Building,
  Bookmark,
  Calendar,
  Layers,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { BorrowRecord, IncidentType } from '../../types';

interface BorrowDetailModalProps {
  borrow: BorrowRecord;
  onClose: () => void;
  onReturned: () => void;
}

export const BorrowDetailModal: React.FC<BorrowDetailModalProps> = ({
  borrow,
  onClose,
  onReturned,
}) => {
  const { actor, role, triggerRefresh } = useAuth();

  // Return form state
  const [isReturning, setIsReturning] = useState(false);
  const [returnMode, setReturnMode] = useState<'whole' | 'custom'>('whole');
  const [itemReturns, setItemReturns] = useState<
    Record<
      string,
      {
        returned_quantity: number;
        incident_type: IncidentType;
        incident_note: string;
      }
    >
  >(() => {
    const init: Record<string, any> = {};
    (borrow.items || []).forEach(item => {
      init[item.borrow_item_id] = {
        returned_quantity: item.quantity,
        incident_type: (item.incident_type || 'NORMAL') as IncidentType,
        incident_note: item.incident_note || '',
      };
    });
    return init;
  });

  const [returnNote, setReturnNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const room = localEngine.getRooms().find(r => r.room_id === borrow.room_id);
  const subject = localEngine.getSubjects().find(s => s.subject_id === borrow.subject_id);
  const classRoom = localEngine.getClasses().find(c => c.class_id === borrow.class_id);
  const topic = localEngine.getTopics().find(t => t.topic_id === borrow.topic_id);
  const lesson = localEngine.getLessons().find(l => l.lesson_id === borrow.lesson_id);

  const canReturn = borrow.status !== 'RETURNED';

  const handleReturnSubmit = () => {
    if (!actor) return;
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const clientRequestId = `ret-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      const itemsPayload = (borrow.items || []).map(item => {
        if (returnMode === 'whole') {
          return {
            borrow_item_id: item.borrow_item_id,
            returned_quantity: item.quantity,
            incident_type: 'NORMAL' as IncidentType,
            incident_note: '',
          };
        } else {
          const cfg = itemReturns[item.borrow_item_id];
          return {
            borrow_item_id: item.borrow_item_id,
            returned_quantity: cfg?.returned_quantity !== undefined ? cfg.returned_quantity : item.quantity,
            incident_type: cfg?.incident_type || 'NORMAL',
            incident_note: cfg?.incident_note || '',
          };
        }
      });

      localEngine.returnBorrow(actor, {
        borrow_id: borrow.borrow_id,
        client_request_id: clientRequestId,
        items: itemsPayload,
        reason: returnNote || (returnMode === 'whole' ? 'Trả toàn bộ thiết bị' : 'Trả thiết bị có kiểm tra sự cố'),
      });

      triggerRefresh();
      onReturned();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi hoàn trả thiết bị');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white">{borrow.borrow_id}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  borrow.status === 'RETURNED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : borrow.status === 'PARTIAL_RETURN'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : borrow.overdue
                    ? 'bg-rose-500 text-white'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {borrow.status === 'RETURNED'
                  ? 'ĐÃ TRẢ'
                  : borrow.status === 'PARTIAL_RETURN'
                  ? 'TRẢ MỘT PHẦN'
                  : borrow.overdue
                  ? 'QUÁ HẠN'
                  : 'ĐANG MƯỢN'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Thời lượng: {borrow.duration_label}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-850 border border-slate-750 space-y-2 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-750">
            <span className="text-slate-400">Phòng thực hành:</span>
            <span className="font-semibold text-amber-400">
              {room?.icon} {room?.room_name} ({room?.room_code})
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-750">
            <span className="text-slate-400">Môn & Lớp:</span>
            <span className="font-semibold text-white">
              {subject?.subject_name} · {classRoom?.class_name}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-750">
            <span className="text-slate-400">Chương & Bài:</span>
            <span className="font-semibold text-white max-w-[200px] truncate text-right">
              {topic?.topic_code} - {lesson?.lesson_name}
            </span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-slate-750">
            <span className="text-slate-400">Mượn lúc:</span>
            <span className="text-slate-300">
              {new Date(borrow.borrowed_at).toLocaleTimeString('vi-VN')}, {new Date(borrow.borrowed_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
          {borrow.returned_at && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Đã trả lúc:</span>
              <span className="text-emerald-400 font-semibold">
                {new Date(borrow.returned_at).toLocaleTimeString('vi-VN')}, {new Date(borrow.returned_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          )}
        </div>

        {/* Equipment Items */}
        <div className="mt-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Thiết bị trong phiếu ({borrow.items?.length || 0}):
          </h3>

          <div className="space-y-2.5">
            {(borrow.items || []).map(item => {
              const eq = item.equipment;
              const cfg = itemReturns[item.borrow_item_id] || {
                returned_quantity: item.quantity,
                incident_type: 'NORMAL' as IncidentType,
                incident_note: '',
              };

              return (
                <div
                  key={item.borrow_item_id}
                  className="p-3 rounded-xl bg-slate-850 border border-slate-750 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-xs">
                        {eq?.equipment_name || item.equipment_id}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {eq?.equipment_code} · Đơn vị: {eq?.unit || 'cái'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-amber-400 text-sm">
                        x {item.quantity}
                      </span>
                      {item.returned_quantity > 0 && (
                        <div className="text-[10px] text-emerald-400 font-semibold">
                          Đã trả: {item.returned_quantity}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Incident note on returned slips */}
                  {item.incident_type && item.incident_type !== 'NORMAL' && (
                    <div className="mt-2 p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-start gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                      <div>
                        <strong>Sự cố {item.incident_type}:</strong> {item.incident_note || 'Không có ghi chú'}
                      </div>
                    </div>
                  )}

                  {/* Incident / Partial return controls when returning */}
                  {isReturning && returnMode === 'custom' && (
                    <div className="mt-3 pt-3 border-t border-slate-750 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Số lượng trả:</span>
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={cfg.returned_quantity}
                          onChange={e => {
                            const val = Math.max(0, Math.min(item.quantity, Number(e.target.value) || 0));
                            setItemReturns(prev => ({
                              ...prev,
                              [item.borrow_item_id]: { ...cfg, returned_quantity: val },
                            }));
                          }}
                          className="w-20 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-center font-bold"
                        />
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-1">Tình trạng hoàn trả:</span>
                        <div className="grid grid-cols-3 gap-1.5">
                          {(['NORMAL', 'DAMAGED', 'MISSING'] as IncidentType[]).map(type => (
                            <button
                              key={type}
                              onClick={() => {
                                setItemReturns(prev => ({
                                  ...prev,
                                  [item.borrow_item_id]: { ...cfg, incident_type: type },
                                }));
                              }}
                              className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition ${
                                cfg.incident_type === type
                                  ? type === 'NORMAL'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                    : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {type === 'NORMAL' ? 'Bình thường' : type === 'DAMAGED' ? 'Hư hỏng' : 'Thất lạc'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {cfg.incident_type !== 'NORMAL' && (
                        <input
                          type="text"
                          placeholder="Mô tả chi tiết sự cố hư hỏng/mất..."
                          value={cfg.incident_note}
                          onChange={e => {
                            setItemReturns(prev => ({
                              ...prev,
                              [item.borrow_item_id]: { ...cfg, incident_note: e.target.value },
                            }));
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-rose-500/40 text-rose-200 text-xs placeholder-slate-500"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Return Actions */}
        {canReturn && (
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-3">
            {!isReturning ? (
              <div className="space-y-2">
                <button
                  id="btn-return-whole-direct"
                  disabled={isSubmitting}
                  onClick={() => {
                    setReturnMode('whole');
                    handleReturnSubmit();
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>TRẢ TOÀN BỘ (1 CHẠM NHANH)</span>
                </button>

                <button
                  onClick={() => setIsReturning(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 transition"
                >
                  Kiểm tra từng món / Báo sự cố hư hỏng
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Chế độ trả:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReturnMode('whole')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        returnMode === 'whole'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      Trả toàn bộ
                    </button>
                    <button
                      onClick={() => setReturnMode('custom')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                        returnMode === 'custom'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      Kiểm tra sự cố
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Ghi chú hoàn trả (tùy chọn)..."
                  value={returnNote}
                  onChange={e => setReturnNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500"
                />

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReturning(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={isSubmitting}
                    onClick={handleReturnSubmit}
                    className="flex-2 py-3 px-4 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-95 transition"
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN HOÀN TRẢ'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
