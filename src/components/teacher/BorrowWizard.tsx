import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { localEngine } from '../../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  PackageCheck,
  Layers,
  Sparkles,
  AlertCircle,
  Plus,
  Minus,
  FileCheck2,
  Calendar,
  Building,
  BookOpen,
  GraduationCap,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { Room, Subject, ClassRoom, Topic, Lesson, Equipment, BorrowRecord } from '../../types';

interface BorrowWizardProps {
  onFinish: (slip?: BorrowRecord) => void;
  onCancel: () => void;
}

export const BorrowWizard: React.FC<BorrowWizardProps> = ({ onFinish, onCancel }) => {
  const { actor, role, triggerRefresh } = useAuth();

  // Wizard Steps:
  // 1: Room
  // 2: Subject + Class
  // 3: Topic (Chapter)
  // 4: Lesson
  // 5: Equipment Selection
  // 6: Confirmation
  // 7: Receipt (Success)
  const [step, setStep] = useState<number>(1);

  // Selections
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [borrowNote, setBorrowNote] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successSlip, setSuccessSlip] = useState<BorrowRecord | null>(null);

  // Master data
  const allRooms = localEngine.getRooms().filter(r => r.status === 'ACTIVE');
  const allowedRooms = role === 'ADMIN'
    ? allRooms
    : allRooms.filter(r => actor?.room_ids.includes(r.room_id));

  const allSubjects = localEngine.getSubjects().filter(s => s.status === 'ACTIVE');
  const allClasses = localEngine.getClasses().filter(c => c.status === 'ACTIVE');

  // Filtered Topics
  const availableTopics = useMemo(() => {
    if (!selectedSubjectId || !selectedClassId) return [];
    return localEngine.getTopics().filter(
      t => t.status === 'ACTIVE' && t.subject_id === selectedSubjectId && t.class_id === selectedClassId
    );
  }, [selectedSubjectId, selectedClassId]);

  // Filtered Lessons
  const availableLessons = useMemo(() => {
    if (!selectedTopicId) return [];
    return localEngine.getLessons().filter(
      l => l.status === 'ACTIVE' && l.topic_id === selectedTopicId
    );
  }, [selectedTopicId]);

  // Filtered Equipment for selected Topic & Room
  const topicEquipmentList = useMemo(() => {
    if (!selectedRoomId || !selectedTopicId) return [];

    // Get inventory for the chosen room
    const roomInventory = localEngine.getMergedInventory(selectedRoomId);
    const roomEqMap = new Map(roomInventory.map(e => [e.equipment_id, e]));

    // Get mappings for topic
    const mappings = localEngine.getTopicEquipment().filter(
      m => m.topic_id === selectedTopicId && m.status === 'ACTIVE'
    );

    // Collect equipment belonging to this room & topic
    const result: Array<{ equipment: Equipment; defaultQty: number; required: boolean }> = [];

    for (const m of mappings) {
      const eq = roomEqMap.get(m.equipment_id);
      if (eq && eq.status === 'ACTIVE') {
        result.push({
          equipment: eq,
          defaultQty: m.default_quantity,
          required: m.required === 'YES',
        });
      }
    }

    // Also include any remaining equipment from this room in case teacher wants extra
    const mappedIds = new Set(result.map(r => r.equipment.equipment_id));
    for (const eq of roomInventory) {
      if (eq.status === 'ACTIVE' && !mappedIds.has(eq.equipment_id)) {
        result.push({
          equipment: eq,
          defaultQty: 1,
          required: false,
        });
      }
    }

    return result;
  }, [selectedRoomId, selectedTopicId]);

  // Objects for compact context display
  const currentRoom = allRooms.find(r => r.room_id === selectedRoomId);
  const currentSubject = allSubjects.find(s => s.subject_id === selectedSubjectId);
  const currentClass = allClasses.find(c => c.class_id === selectedClassId);
  const currentTopic = localEngine.getTopics().find(t => t.topic_id === selectedTopicId);
  const currentLesson = localEngine.getLessons().find(l => l.lesson_id === selectedLessonId);

  // Stepper handlers
  const handleQuantityChange = (equipmentId: string, delta: number, maxAvailable: number) => {
    setItemQuantities(prev => {
      const current = prev[equipmentId] || 0;
      const next = Math.max(0, Math.min(maxAvailable, current + delta));
      const copy = { ...prev };
      if (next === 0) {
        delete copy[equipmentId];
      } else {
        copy[equipmentId] = next;
      }
      return copy;
    });
  };

  const totalSelectedItems = Object.values(itemQuantities).reduce((a, b) => a + b, 0);

  // Submit borrow request
  const handleConfirmBorrow = () => {
    if (!actor) return;
    if (totalSelectedItems === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một thiết bị với số lượng > 0');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const clientRequestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const itemsPayload = Object.entries(itemQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([equipment_id, quantity]) => ({ equipment_id, quantity }));

      const slip = localEngine.borrow(actor, {
        client_request_id: clientRequestId,
        room_id: selectedRoomId,
        subject_id: selectedSubjectId,
        class_id: selectedClassId,
        topic_id: selectedTopicId,
        lesson_id: selectedLessonId,
        items: itemsPayload,
        note: borrowNote,
      });

      setSuccessSlip(slip);
      triggerRefresh();
      setStep(7); // Receipt screen
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi tạo phiếu mượn');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-200">
      {/* Top compact context / progress */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 mb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (step > 1 && step < 7) {
                setStep(step - 1);
              } else {
                onCancel();
              }
            }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-1.5 py-1 -ml-1 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Hủy' : 'Quay lại'}</span>
          </button>

          <span className="text-xs font-semibold text-amber-400">
            Bước {step <= 6 ? `${step}/6` : 'Hoàn tất'}
          </span>
        </div>

        {/* Compact breadcrumb context as specified in spec */}
        {selectedRoomId && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-700 flex items-center gap-1.5 text-xs text-slate-300 font-medium overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span>{currentRoom?.icon}</span>
              <span>{currentRoom?.room_name}</span>
            </span>
            {selectedSubjectId && selectedClassId && (
              <>
                <span className="text-slate-600">·</span>
                <span>{currentSubject?.subject_code} {currentClass?.class_code}</span>
              </>
            )}
            {selectedTopicId && (
              <>
                <span className="text-slate-600">·</span>
                <span className="max-w-[100px] truncate">{currentTopic?.topic_code}</span>
              </>
            )}
            {selectedLessonId && (
              <>
                <span className="text-slate-600">·</span>
                <span className="max-w-[120px] truncate">{currentLesson?.lesson_code}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* STEP 1: CHỌN PHÒNG */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-400" />
              <span>Bước 1: Chọn phòng học / phòng Lab</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chỉ hiển thị phòng bạn được phân quyền quản lý theo V4 spec
            </p>
          </div>

          <div className="space-y-2.5">
            {allowedRooms.map(room => (
              <button
                key={room.room_id}
                id={`btn-select-room-${room.room_id}`}
                onClick={() => {
                  setSelectedRoomId(room.room_id);
                  setStep(2);
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.98] ${
                  selectedRoomId === room.room_id
                    ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-500/10'
                    : 'bg-slate-850 border-slate-750 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                    {room.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">
                        {room.room_name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
                        {room.room_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {room.note || 'Trang bị thiết bị chuyên dụng tiêu chuẩn FPT'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>
            ))}

            {allowedRooms.length === 0 && (
              <div className="p-6 rounded-2xl bg-slate-850 border border-slate-750 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="font-semibold text-sm text-white">Chưa được cấp quyền phòng</p>
                <p className="text-xs mt-1">
                  Vui lòng liên hệ Quản trị viên để cấp quyền truy cập phòng học.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: CHỌN MÔN & LỚP (CÙNG 1 BƯỚC) */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Bước 2: Chọn Môn học & Lớp học</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chọn ngữ cảnh giảng dạy để tải đúng danh mục chương trình
            </p>
          </div>

          <div className="space-y-3">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Môn học:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {allSubjects.map(sub => {
                  const isPicked = selectedSubjectId === sub.subject_id;
                  return (
                    <button
                      key={sub.subject_id}
                      onClick={() => {
                        setSelectedSubjectId(sub.subject_id);
                        setSelectedTopicId('');
                        setSelectedLessonId('');
                      }}
                      className={`p-3 rounded-xl border text-left transition active:scale-95 ${
                        isPicked
                          ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                          : 'bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-semibold">{sub.subject_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{sub.subject_code}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Class Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lớp học:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {allClasses.map(cls => {
                  const isPicked = selectedClassId === cls.class_id;
                  return (
                    <button
                      key={cls.class_id}
                      onClick={() => {
                        setSelectedClassId(cls.class_id);
                        setSelectedTopicId('');
                        setSelectedLessonId('');
                      }}
                      className={`p-3 rounded-xl border text-left transition active:scale-95 ${
                        isPicked
                          ? 'bg-sky-500/20 border-sky-500 text-white font-bold'
                          : 'bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-xs font-semibold">{cls.class_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Khối {cls.grade} · {cls.school_year}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            disabled={!selectedSubjectId || !selectedClassId}
            onClick={() => setStep(3)}
            className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm disabled:opacity-40 disabled:pointer-events-none hover:bg-amber-400 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <span>Tiếp tục chọn Chương</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 3: CHỌN CHƯƠNG (TOPIC) */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <span>Bước 3: Chọn Chương học (Topic)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Lọc theo {currentSubject?.subject_name} - {currentClass?.class_name}
            </p>
          </div>

          <div className="space-y-2">
            {availableTopics.map(topic => (
              <button
                key={topic.topic_id}
                onClick={() => {
                  setSelectedTopicId(topic.topic_id);
                  setSelectedLessonId('');
                  setStep(4);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.98] ${
                  selectedTopicId === topic.topic_id
                    ? 'bg-amber-500/15 border-amber-500/60 text-white'
                    : 'bg-slate-850 border-slate-750 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {topic.topic_code}
                  </span>
                  <div className="text-sm font-semibold mt-1.5">{topic.topic_name}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>
            ))}

            {availableTopics.length === 0 && (
              <div className="p-6 rounded-2xl bg-slate-850 border border-slate-750 text-center text-slate-400">
                <AlertCircle className="w-7 h-7 text-amber-400 mx-auto mb-2" />
                <p className="text-xs">Chưa có chương học nào cho môn/lớp này.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 4: CHỌN BÀI HỌC (LESSON) */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <span>Bước 4: Chọn Bài học (Lesson)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bối cảnh giảng dạy trong chương: {currentTopic?.topic_name}
            </p>
          </div>

          <div className="space-y-2">
            {availableLessons.map(lesson => (
              <button
                key={lesson.lesson_id}
                onClick={() => {
                  setSelectedLessonId(lesson.lesson_id);
                  setStep(5);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition active:scale-[0.98] ${
                  selectedLessonId === lesson.lesson_id
                    ? 'bg-amber-500/15 border-amber-500/60 text-white'
                    : 'bg-slate-850 border-slate-750 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div>
                  <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    {lesson.lesson_code}
                  </span>
                  <div className="text-sm font-semibold mt-1.5">{lesson.lesson_name}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>
            ))}

            {availableLessons.length === 0 && (
              <div className="p-6 rounded-2xl bg-slate-850 border border-slate-750 text-center text-slate-400">
                <AlertCircle className="w-7 h-7 text-amber-400 mx-auto mb-2" />
                <p className="text-xs">Chưa có bài học nào trong chương này.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 5: DANH SÁCH THIẾT BỊ (SINGLE-COLUMN ROW MÔ BẬT) */}
      {step === 5 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Bước 5: Chọn thiết bị mượn</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Thiết bị liên kết với bài học & kho {currentRoom?.room_name}
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
              Đã chọn: {totalSelectedItems}
            </div>
          </div>

          <div className="space-y-3">
            {topicEquipmentList.map(({ equipment: eq, defaultQty, required }) => {
              const qty = itemQuantities[eq.equipment_id] || 0;
              const isAvailable = (eq.available_quantity || 0) > 0;

              return (
                <div
                  key={eq.equipment_id}
                  className={`p-3.5 rounded-2xl border transition flex items-center gap-3.5 ${
                    qty > 0
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-sm shadow-amber-500/10'
                      : !isAvailable
                      ? 'bg-slate-900/60 border-slate-800 opacity-60'
                      : 'bg-slate-850 border-slate-750'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 relative">
                    {eq.image_url ? (
                      <img
                        src={eq.image_url}
                        alt={eq.equipment_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                        TB
                      </div>
                    )}
                    {required && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1 rounded">
                        CẦN
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">
                        {eq.equipment_code}
                      </span>
                      <span className="text-[10px] text-slate-400">· {eq.category}</span>
                    </div>

                    <h3 className="text-xs font-bold text-white leading-tight mt-0.5 line-clamp-2">
                      {eq.equipment_name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                      <span className={`font-semibold ${isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Còn lại: {eq.available_quantity} {eq.unit}
                      </span>
                      {eq.blocked_quantity > 0 && (
                        <span className="text-slate-500 text-[10px]">
                          (Hỏng/khóa: {eq.blocked_quantity})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper (touch >= 44px) */}
                  <div className="shrink-0 flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-xl p-1">
                    <button
                      disabled={qty <= 0}
                      onClick={() => handleQuantityChange(eq.equipment_id, -1, eq.available_quantity || 0)}
                      className="w-8 h-8 rounded-lg bg-slate-700/70 hover:bg-slate-700 text-white flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-6 text-center font-extrabold text-sm text-amber-400">
                      {qty}
                    </span>

                    <button
                      disabled={!isAvailable || qty >= (eq.available_quantity || 0)}
                      onClick={() => handleQuantityChange(eq.equipment_id, 1, eq.available_quantity || 0)}
                      className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none active:scale-90 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Action */}
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-30">
            <div className="max-w-md mx-auto">
              <button
                id="btn-goto-confirm-borrow"
                disabled={totalSelectedItems === 0}
                onClick={() => setStep(6)}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:pointer-events-none hover:bg-amber-400 active:scale-95 transition flex items-center justify-between"
              >
                <span>XEM LẠI & XÁC NHẬN MƯỢN</span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-950/20 text-slate-950 font-black text-xs">
                  {totalSelectedItems} thiết bị
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: PRE-CONFIRMATION SUMMARY */}
      {step === 6 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-amber-400" />
              <span>Bước 6: Tóm tắt & Xác nhận mượn</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kiểm tra lại danh sách trước khi ghi nhận vào hệ thống
            </p>
          </div>

          {/* Context box */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-750">
              <span className="text-slate-400">Giáo viên mượn:</span>
              <span className="font-bold text-white">{actor?.display_name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-750">
              <span className="text-slate-400">Phòng thực hành:</span>
              <span className="font-semibold text-amber-400">
                {currentRoom?.icon} {currentRoom?.room_name} ({currentRoom?.room_code})
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-750">
              <span className="text-slate-400">Môn & Lớp:</span>
              <span className="font-semibold text-slate-200">
                {currentSubject?.subject_name} · {currentClass?.class_name}
              </span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-750">
              <span className="text-slate-400">Chương & Bài:</span>
              <span className="font-semibold text-slate-200 max-w-[200px] truncate text-right">
                {currentTopic?.topic_code} - {currentLesson?.lesson_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Thời gian mượn:</span>
              <span className="font-semibold text-sky-400">Hôm nay, {new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          {/* Selected equipment list */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Danh sách thiết bị ({totalSelectedItems}):
            </h3>
            <div className="space-y-2">
              {Object.entries(itemQuantities)
                .filter(([_, qty]) => qty > 0)
                .map(([equipment_id, quantity]) => {
                  const eq = localEngine.getEquipment().find(e => e.equipment_id === equipment_id);
                  return (
                    <div
                      key={equipment_id}
                      className="p-3 rounded-xl bg-slate-850/80 border border-slate-750 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-amber-400">
                          {quantity}
                        </div>
                        <div>
                          <div className="font-bold text-white">{eq?.equipment_name}</div>
                          <div className="text-[10px] text-slate-400">{eq?.equipment_code} · {eq?.unit}</div>
                        </div>
                      </div>
                      <span className="font-semibold text-amber-400">
                        x {quantity} {eq?.unit}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ghi chú tiết học (tùy chọn):
            </label>
            <input
              type="text"
              value={borrowNote}
              onChange={e => setBorrowNote(e.target.value)}
              placeholder="VD: Dạy thực hành tiết 3 lớp 7A1..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sticky Confirm Action */}
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 z-30">
            <div className="max-w-md mx-auto">
              <button
                id="btn-confirm-borrow-submit"
                disabled={isSubmitting}
                onClick={handleConfirmBorrow}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 disabled:opacity-50 hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Đang ghi nhận phiếu mượn...</span>
                ) : (
                  <>
                    <PackageCheck className="w-5 h-5" />
                    <span>XÁC NHẬN MƯỢN THIẾT BỊ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 7: RECEIPT / SUCCESS */}
      {step === 7 && successSlip && (
        <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              MƯỢN THÀNH CÔNG
            </span>
            <h2 className="text-xl font-black text-white mt-2">
              {successSlip.borrow_id}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Phiếu mượn đã được ghi nhận vào kho dữ liệu hệ thống
            </p>
          </div>

          {/* Slip card */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-750">
              <span className="text-slate-400">Phòng:</span>
              <span className="font-bold text-amber-400">{currentRoom?.room_name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-750">
              <span className="text-slate-400">Môn & Lớp:</span>
              <span className="font-semibold text-white">{currentSubject?.subject_code} · {currentClass?.class_name}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-750">
              <span className="text-slate-400">Tổng thiết bị mượn:</span>
              <span className="font-bold text-amber-400">{successSlip.total_quantity} thiết bị</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Thời gian tạo:</span>
              <span className="text-slate-300">
                {new Date(successSlip.borrowed_at).toLocaleTimeString('vi-VN')}, {new Date(successSlip.borrowed_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              id="btn-receipt-view-slip"
              onClick={() => onFinish(successSlip)}
              className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm hover:bg-amber-400 active:scale-95 transition"
            >
              XEM CHI TIẾT PHIẾU
            </button>
            <button
              id="btn-receipt-back-home"
              onClick={() => onFinish()}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition"
            >
              VỀ TRANG CÁ NHÂN (MY LAB)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
