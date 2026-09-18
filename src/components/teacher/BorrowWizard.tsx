import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ApiService } from '../../services/api';
import {
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Layers,
  AlertCircle,
  Plus,
  Minus,
  FileCheck2,
  Building,
  BookOpen,
  GraduationCap,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { Equipment, BorrowRecord } from '../../types';

interface BorrowWizardProps {
  onFinish: (slip?: BorrowRecord) => void;
  onCancel: () => void;
}

export const BorrowWizard: React.FC<BorrowWizardProps> = ({ onFinish, onCancel }) => {
  const { actor, role, refreshTrigger } = useAuth();
  const { rooms: allRooms, subjects: allSubjects, classes: allClasses, topics: allTopics, lessons: allLessons, equipment: allEquipment, topicEquipment } = useData();

  const [step, setStep] = useState<number>(1);

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [borrowNote, setBorrowNote] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successSlip, setSuccessSlip] = useState<BorrowRecord | null>(null);

  const allowedRooms = role === 'ADMIN'
    ? allRooms
    : allRooms.filter(r => actor?.room_ids.includes(r.room_id));

  const availableTopics = useMemo(() => {
    if (!selectedSubjectId || !selectedClassId) return [];
    return allTopics.filter(
      t => t.subject_id === selectedSubjectId && t.class_id === selectedClassId
    );
  }, [selectedSubjectId, selectedClassId, allTopics]);

  const availableLessons = useMemo(() => {
    if (!selectedTopicId) return [];
    return allLessons.filter(
      l => l.topic_id === selectedTopicId
    );
  }, [selectedTopicId, allLessons]);

  const topicEquipmentList = useMemo(() => {
    if (!selectedRoomId || !selectedTopicId) return [];

    const roomInventory = allEquipment.filter(e => e.room_id === selectedRoomId);
    const roomEqMap = new Map(roomInventory.map(e => [e.equipment_id, e]));

    const mappings = topicEquipment.filter(
      m => m.topic_id === selectedTopicId
    );

    const result: Array<{ equipment: Equipment; defaultQty: number; required: boolean }> = [];

    for (const m of mappings) {
      const eq = roomEqMap.get(m.equipment_id);
      if (eq) {
        result.push({
          equipment: eq,
          defaultQty: Number(m.default_quantity),
          required: m.required === 'YES',
        });
      }
    }

    const mappedIds = new Set(result.map(r => r.equipment.equipment_id));
    for (const eq of roomInventory) {
      if (!mappedIds.has(eq.equipment_id)) {
        result.push({
          equipment: eq,
          defaultQty: 1,
          required: false,
        });
      }
    }

    return result;
  }, [selectedRoomId, selectedTopicId, allEquipment, topicEquipment]);

  const currentRoom = allRooms.find(r => r.room_id === selectedRoomId);
  const currentSubject = allSubjects.find(s => s.subject_id === selectedSubjectId);
  const currentClass = allClasses.find(c => c.class_id === selectedClassId);
  const currentTopic = allTopics.find(t => t.topic_id === selectedTopicId);
  const currentLesson = allLessons.find(l => l.lesson_id === selectedLessonId);

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

  const handleConfirmBorrow = async () => {
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

      const slip = await ApiService.borrow(actor, {
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
      setStep(7);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi tạo phiếu mượn');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-200">
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
        {selectedRoomId && (
          <div className="mt-2.5 pt-2.5 border-t border-slate-700 flex items-center gap-1.5 text-xs text-slate-300 font-medium overflow-x-auto whitespace-nowrap scrollbar-none">
            <span className="text-amber-400 font-bold flex items-center gap-1">
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

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-400" />
              <span>Bước 1: Chọn phòng học / phòng Lab</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Chỉ hiển thị phòng bạn được phân quyền quản lý
            </p>
          </div>
          <div className="space-y-2.5">
            {allowedRooms.map(room => (
              <button
                key={room.room_id}
                onClick={() => { setSelectedRoomId(room.room_id); setStep(2); }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${selectedRoomId === room.room_id ? 'bg-amber-500/15 border-amber-500/60 shadow-md' : 'bg-slate-850 border-slate-750'}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border flex items-center justify-center text-2xl shadow-inner">
                    🏢
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{room.room_name}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-amber-400">{room.room_code}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              <span>Bước 2: Chọn Môn học & Lớp học</span>
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Môn học:</label>
              <div className="grid grid-cols-2 gap-2">
                {allSubjects.map(sub => (
                  <button
                    key={sub.subject_id}
                    onClick={() => { setSelectedSubjectId(sub.subject_id); setSelectedTopicId(''); setSelectedLessonId(''); }}
                    className={`p-3 rounded-xl border text-left ${selectedSubjectId === sub.subject_id ? 'bg-amber-500/20 border-amber-500 text-white' : 'bg-slate-850 border-slate-750 text-slate-300'}`}
                  >
                    <div className="text-xs font-semibold">{sub.subject_name}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Lớp học:</label>
              <div className="grid grid-cols-2 gap-2">
                {allClasses.map(cls => (
                  <button
                    key={cls.class_id}
                    onClick={() => { setSelectedClassId(cls.class_id); setSelectedTopicId(''); setSelectedLessonId(''); }}
                    className={`p-3 rounded-xl border text-left ${selectedClassId === cls.class_id ? 'bg-sky-500/20 border-sky-500 text-white' : 'bg-slate-850 border-slate-750 text-slate-300'}`}
                  >
                    <div className="text-xs font-semibold">{cls.class_name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button disabled={!selectedSubjectId || !selectedClassId} onClick={() => setStep(3)} className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm disabled:opacity-40">Tiếp tục chọn Chương</button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              <span>Bước 3: Chọn Chương học (Topic)</span>
            </h2>
          </div>
          <div className="space-y-2">
            {availableTopics.map(topic => (
              <button
                key={topic.topic_id}
                onClick={() => { setSelectedTopicId(topic.topic_id); setSelectedLessonId(''); setStep(4); }}
                className={`w-full p-3.5 rounded-2xl border text-left flex justify-between ${selectedTopicId === topic.topic_id ? 'bg-amber-500/15 border-amber-500/60 text-white' : 'bg-slate-850 border-slate-750'}`}
              >
                <div>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">{topic.topic_code}</span>
                  <div className="text-sm font-semibold mt-1.5">{topic.topic_name}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <span>Bước 4: Chọn Bài học (Lesson)</span>
            </h2>
          </div>
          <div className="space-y-2">
            {availableLessons.map(lesson => (
              <button
                key={lesson.lesson_id}
                onClick={() => { setSelectedLessonId(lesson.lesson_id); setStep(5); }}
                className={`w-full p-3.5 rounded-2xl border text-left flex justify-between ${selectedLessonId === lesson.lesson_id ? 'bg-amber-500/15 border-amber-500/60 text-white' : 'bg-slate-850 border-slate-750'}`}
              >
                <div>
                  <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">{lesson.lesson_code}</span>
                  <div className="text-sm font-semibold mt-1.5">{lesson.lesson_name}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Bước 5: Chọn thiết bị mượn</span>
              </h2>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-bold">Đã chọn: {totalSelectedItems}</div>
          </div>
          <div className="space-y-3">
            {topicEquipmentList.map(({ equipment: eq, defaultQty, required }) => {
              const qty = itemQuantities[eq.equipment_id] || 0;
              const isAvailable = Number(eq.available_quantity) > 0;
              return (
                <div key={eq.equipment_id} className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${qty > 0 ? 'bg-amber-500/10 border-amber-500/50' : !isAvailable ? 'bg-slate-900/60 border-slate-800 opacity-60' : 'bg-slate-850 border-slate-750'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-slate-400">{eq.equipment_code}</div>
                    <h3 className="text-xs font-bold text-white leading-tight mt-0.5">{eq.equipment_name}</h3>
                    <div className="flex gap-2 mt-1.5 text-[11px]">
                      <span className={isAvailable ? 'text-emerald-400' : 'text-rose-400'}>Còn: {eq.available_quantity} {eq.unit}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 bg-slate-800/90 rounded-xl p-1">
                    <button disabled={qty <= 0} onClick={() => handleQuantityChange(eq.equipment_id, -1, Number(eq.available_quantity))} className="w-8 h-8 rounded-lg bg-slate-700/70 text-white flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="w-6 text-center font-extrabold text-sm text-amber-400">{qty}</span>
                    <button disabled={!isAvailable || qty >= Number(eq.available_quantity)} onClick={() => handleQuantityChange(eq.equipment_id, 1, Number(eq.available_quantity))} className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-slate-900/90 z-30">
            <button disabled={totalSelectedItems === 0} onClick={() => setStep(6)} className="w-full py-3.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold disabled:opacity-40 flex items-center justify-center gap-2">XEM LẠI & XÁC NHẬN ({totalSelectedItems})</button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="space-y-4 animate-in fade-in pb-20">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2"><FileCheck2 className="w-5 h-5 text-amber-400" /><span>Bước 6: Xác nhận mượn</span></h2>
          </div>
          <div className="p-4 rounded-2xl bg-slate-850 text-xs space-y-2">
            <div className="flex justify-between"><span className="text-slate-400">Giáo viên:</span><span className="font-bold">{actor?.display_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Phòng:</span><span className="font-bold text-amber-400">{currentRoom?.room_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Thiết bị:</span><span className="font-bold text-amber-400">{totalSelectedItems} món</span></div>
          </div>
          <div>
            <input type="text" value={borrowNote} onChange={e => setBorrowNote(e.target.value)} placeholder="Ghi chú thêm..." className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border-slate-700 text-xs text-white" />
          </div>
          {errorMessage && <div className="p-3 bg-rose-500/10 text-rose-400 text-xs">{errorMessage}</div>}
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-slate-900/90 z-30">
            <button disabled={isSubmitting} onClick={handleConfirmBorrow} className="w-full py-4 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm">{isSubmitting ? 'ĐANG GHI NHẬN...' : 'XÁC NHẬN MƯỢN THIẾT BỊ'}</button>
          </div>
        </div>
      )}

      {step === 7 && successSlip && (
        <div className="space-y-4 text-center animate-in zoom-in-95">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-black text-white">{successSlip.borrow_id}</h2>
          <div className="p-4 bg-slate-850 rounded-2xl space-y-2 text-left text-xs">
            <div className="flex justify-between"><span>Phòng:</span><span className="text-amber-400">{currentRoom?.room_name}</span></div>
            <div className="flex justify-between"><span>Tổng TB:</span><span className="text-amber-400">{successSlip.total_quantity || totalSelectedItems}</span></div>
          </div>
          <button onClick={() => onFinish(successSlip)} className="w-full py-3.5 bg-amber-500 text-slate-950 font-extrabold rounded-xl">XEM CHI TIẾT PHIẾU</button>
        </div>
      )}
    </div>
  );
};
