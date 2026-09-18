import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { localEngine } from '../../services/api';
import {
  X,
  PlusCircle,
  Camera,
  Upload,
  Building,
  BookOpen,
  GraduationCap,
  Bookmark,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { EquipmentRequest } from '../../types';

interface EquipmentRequestModalProps {
  onClose: () => void;
}

export const EquipmentRequestModal: React.FC<EquipmentRequestModalProps> = ({ onClose }) => {
  const { actor, role, triggerRefresh, refreshTrigger } = useAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  // Form state
  const [roomId, setRoomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Master data
  const rooms = localEngine.getRooms().filter(r => r.status === 'ACTIVE');
  const allowedRooms = role === 'ADMIN'
    ? rooms
    : rooms.filter(r => actor?.room_ids.includes(r.room_id));

  const subjects = localEngine.getSubjects().filter(s => s.status === 'ACTIVE');
  const classes = localEngine.getClasses().filter(c => c.status === 'ACTIVE');

  // Filtered topics
  const topics = useMemo(() => {
    if (!subjectId || !classId) return [];
    return localEngine.getTopics().filter(
      t => t.status === 'ACTIVE' && t.subject_id === subjectId && t.class_id === classId
    );
  }, [subjectId, classId]);

  // Teacher's equipment requests list
  const myRequests = useMemo(() => {
    if (!actor) return [];
    const all = localEngine.getEquipmentRequests();
    return role === 'ADMIN' ? all : all.filter(r => r.requested_by === actor.teacher_id);
  }, [actor, role, refreshTrigger]);

  // Handle Photo Capture / Upload
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 data URL for preview & local storage
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;

    if (!roomId) {
      setErrorMessage('Vui lòng chọn phòng học');
      return;
    }
    if (!subjectId || !classId) {
      setErrorMessage('Vui lòng chọn môn học và lớp');
      return;
    }
    if (!topicId) {
      setErrorMessage('Vui lòng chọn chương học (Topic)');
      return;
    }
    if (!equipmentName.trim()) {
      setErrorMessage('Vui lòng nhập tên thiết bị cần đề xuất');
      return;
    }
    if (quantity <= 0) {
      setErrorMessage('Số lượng thiết bị phải lớn hơn 0');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      localEngine.submitEquipmentRequest(actor, {
        room_id: roomId,
        subject_id: subjectId,
        class_id: classId,
        topic_id: topicId,
        equipment_name: equipmentName.trim(),
        quantity,
        image_url: imageUrl,
        note,
      });

      triggerRefresh();
      setSuccessMessage('Đã gửi đề xuất thiết bị thành công! Đang chờ Quản trị viên duyệt.');
      // Reset form
      setEquipmentName('');
      setQuantity(1);
      setImageUrl('');
      setNote('');
      setActiveTab('list');
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi gửi đề xuất');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string>('');

  const handleCancelRequest = (reqId: string) => {
    if (!actor) return;
    try {
      localEngine.cancelEquipmentRequest(actor, reqId);
      setConfirmCancelId(null);
      setCancelError('');
      triggerRefresh();
    } catch (err: any) {
      setCancelError(err.message || 'Lỗi khi hủy');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Đề xuất / Thêm thiết bị</h2>
              <p className="text-[11px] text-slate-400">Quy trình tối giản chuẩn V4</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Tạo đề xuất vs Danh sách đã gửi */}
        <div className="flex items-center p-1 rounded-xl bg-slate-800/80 border border-slate-750 my-3">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tạo đề xuất mới
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Yêu cầu của tôi</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-200 text-[10px]">
              {myRequests.length}
            </span>
          </button>
        </div>

        {/* CREATE TAB */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-3.5 animate-in fade-in">
            {/* Room selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phòng học / Phòng Lab <span className="text-amber-400">*</span>:
              </label>
              <select
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-750 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Chọn phòng --</option>
                {allowedRooms.map(r => (
                  <option key={r.room_id} value={r.room_id}>
                    {r.icon} {r.room_name} ({r.room_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Subject & Class in 2 columns */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Môn học <span className="text-amber-400">*</span>:
                </label>
                <select
                  value={subjectId}
                  onChange={e => {
                    setSubjectId(e.target.value);
                    setTopicId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-750 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Chọn môn --</option>
                  {subjects.map(s => (
                    <option key={s.subject_id} value={s.subject_id}>
                      {s.subject_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lớp học <span className="text-amber-400">*</span>:
                </label>
                <select
                  value={classId}
                  onChange={e => {
                    setClassId(e.target.value);
                    setTopicId('');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-750 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Chọn lớp --</option>
                  {classes.map(c => (
                    <option key={c.class_id} value={c.class_id}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic (Chapter) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Chương / Chủ đề (Topic) <span className="text-amber-400">*</span>:
              </label>
              <select
                value={topicId}
                onChange={e => setTopicId(e.target.value)}
                disabled={!subjectId || !classId}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-750 text-xs text-white focus:border-amber-500 focus:outline-none disabled:opacity-50"
              >
                <option value="">-- Chọn chương học --</option>
                {topics.map(t => (
                  <option key={t.topic_id} value={t.topic_id}>
                    {t.topic_code} - {t.topic_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Equipment Name & Quantity */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên thiết bị <span className="text-amber-400">*</span>:
                </label>
                <input
                  type="text"
                  placeholder="VD: Cân điện tử 2 số lẻ..."
                  value={equipmentName}
                  onChange={e => setEquipmentName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-750 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số lượng <span className="text-amber-400">*</span>:
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-750 text-xs text-white text-center font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Image Camera / Upload input per V4 spec */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ảnh thiết bị (Chụp từ Camera hoặc chọn từ máy):
              </label>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleImageFile}
                className="hidden"
              />

              {imageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 h-32 bg-slate-800 flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-3 rounded-xl border border-dashed border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition flex flex-col items-center justify-center gap-1.5 text-xs font-medium active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-white">Chụp ảnh / Tải ảnh lên</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Lưu trữ Google Drive 03_EQUIPMENT_IMAGES
                  </span>
                </button>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ghi chú thêm:
              </label>
              <input
                type="text"
                placeholder="Lý do bổ sung, độ khẩn cấp..."
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-750 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              id="btn-submit-equipment-request"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 hover:bg-amber-400 active:scale-95 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Đang gửi...' : 'GỬI ĐỀ XUẤT THIẾT BỊ'}
            </button>
          </form>
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <div className="space-y-3 animate-in fade-in">
            {myRequests.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-850/60 border border-dashed border-slate-750 text-center text-slate-400">
                <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h3 className="font-bold text-sm text-white">Chưa có đề xuất nào</h3>
                <p className="text-xs mt-1">
                  Nhấn "Tạo đề xuất mới" để gửi yêu cầu thiết bị cần mua/bổ sung.
                </p>
              </div>
            ) : (
              myRequests.map(req => {
                const room = rooms.find(r => r.room_id === req.room_id);
                return (
                  <div
                    key={req.request_id}
                    className="p-3.5 rounded-2xl bg-slate-850 border border-slate-750 text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        {req.image_url ? (
                          <img
                            src={req.image_url}
                            alt={req.equipment_name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0 border border-slate-750"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-500 flex items-center justify-center font-bold shrink-0">
                            TB
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white text-xs leading-tight">
                            {req.equipment_name}
                          </div>
                          <div className="text-[11px] text-amber-400 mt-0.5">
                            {room?.icon} {room?.room_name} · SL: <strong>{req.quantity}</strong>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {req.request_id} · {new Date(req.created_at).toLocaleDateString('vi-VN')}
                          </div>
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
                      <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                        <strong>Lý do từ chối:</strong> {req.rejected_reason}
                      </div>
                    )}

                    {req.status === 'PENDING' && (
                      <div className="pt-2 border-t border-slate-750 flex items-center justify-end">
                        {confirmCancelId === req.request_id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-rose-300 font-medium">Hủy đề xuất này?</span>
                            <button
                              type="button"
                              onClick={() => handleCancelRequest(req.request_id)}
                              className="px-2 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition"
                            >
                              Xác nhận
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmCancelId(null);
                                setCancelError('');
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                            >
                              Đóng
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(req.request_id)}
                            className="px-2.5 py-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hủy đề xuất</span>
                          </button>
                        )}
                      </div>
                    )}
                    {confirmCancelId === req.request_id && cancelError && (
                      <p className="mt-1 text-right text-[11px] text-rose-400">{cancelError}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
