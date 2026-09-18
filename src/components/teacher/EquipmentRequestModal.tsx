import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  X,
  PlusCircle,
  Building,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
} from 'lucide-react';

interface EquipmentRequestModalProps {
  onClose: () => void;
}

export const EquipmentRequestModal: React.FC<EquipmentRequestModalProps> = ({ onClose }) => {
  const { actor } = useAuth();
  const { rooms: allRooms, subjects: allSubjects, classes: allClasses, topics: allTopics, dashboardData } = useData();

  const [step, setStep] = useState<1 | 2>(1);
  const [roomId, setRoomId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [equipmentName, setEquipmentName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [imageUrl, setImageUrl] = useState('');
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!actor) return null;

  const rooms = allRooms.filter(r => r.status === 'ACTIVE');
  const subjects = allSubjects.filter(s => s.status === 'ACTIVE');
  const classes = allClasses.filter(c => c.status === 'ACTIVE');

  const availableTopics = React.useMemo(() => {
    if (!subjectId || !classId) return [];
    return allTopics.filter(
      t => t.status === 'ACTIVE' && t.subject_id === subjectId && t.class_id === classId
    );
  }, [subjectId, classId, allTopics]);

  const myRequests: any[] = dashboardData?.equipment_requests || [];

  const handleSubmit = () => {
    alert('Tính năng đề xuất thiết bị đang được di chuyển sang Google Sheets API V4');
  };

  const handleCancel = (reqId: string) => {
    alert('Tính năng hủy đề xuất đang được di chuyển sang Google Sheets API V4');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-sky-400" />
              <span>Đề xuất vật tư / thiết bị mới</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Yêu cầu Ban Giám Hiệu duyệt mua thêm</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-4 flex gap-2 border-b border-slate-800 pb-2">
          <button onClick={() => setStep(1)} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 ${step === 1 ? 'border-sky-500 text-sky-400 bg-sky-500/10' : 'border-transparent text-slate-400 hover:text-white'}`}>Tạo đề xuất mới</button>
          <button onClick={() => setStep(2)} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 ${step === 2 ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-transparent text-slate-400 hover:text-white'}`}>Đề xuất của tôi ({myRequests.length})</button>
        </div>

        {step === 1 && (
          <div className="mt-4 space-y-3 animate-in fade-in">
            {success ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-lg font-black text-white">Đã gửi đề xuất thành công!</h3>
                <p className="text-xs text-slate-400">Ban Giám Hiệu sẽ xem xét và phản hồi sớm.</p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tên thiết bị đề xuất <span className="text-rose-500">*</span></label>
                  <input type="text" value={equipmentName} onChange={e => setEquipmentName(e.target.value)} placeholder="Nhập tên vật tư, thiết bị cần mua..." className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500" />
                </div>
                
                <button onClick={handleSubmit} className="w-full py-3 mt-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm shadow-md shadow-sky-500/20 transition active:scale-95">GỬI YÊU CẦU ĐỀ XUẤT</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
