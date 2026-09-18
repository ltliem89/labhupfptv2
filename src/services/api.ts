import {
  Actor,
  AuthSession,
  BorrowRecord,
  BorrowItem,
  Equipment,
  EquipmentRequest,
  Room,
  Subject,
  ClassRoom,
  Topic,
  Lesson,
  TopicEquipment,
  Teacher,
  TeacherRoom,
  AuditLog,
  DiagnosticsResult,
  IncidentType,
} from '../types';
import {
  INITIAL_ROOMS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_TOPICS,
  INITIAL_LESSONS,
  INITIAL_EQUIPMENT,
  INITIAL_TOPIC_EQUIPMENT,
  INITIAL_TEACHERS,
  INITIAL_TEACHER_ROOMS,
  INITIAL_BORROW_RECORDS,
  INITIAL_BORROW_ITEMS,
  INITIAL_EQUIPMENT_REQUESTS,
  INITIAL_AUDIT_LOG,
} from './mockData';

const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbz4RQ102X4gZ8FjxHa41HyI0b1rVk36cEjzBPMGN_rOVx5t2MGReygNC4hljuEwFjSzNw/exec';

export const getApiUrl = (): string => {
  return (import.meta.env.VITE_LAB_HUB_API_URL as string) || DEFAULT_API_URL;
};

// Local storage keys
const STORAGE_KEYS = {
  ROOMS: 'labhub_rooms_v4',
  SUBJECTS: 'labhub_subjects_v4',
  CLASSES: 'labhub_classes_v4',
  TOPICS: 'labhub_topics_v4',
  LESSONS: 'labhub_lessons_v4',
  EQUIPMENT: 'labhub_equipment_v4',
  TOPIC_EQUIPMENT: 'labhub_topic_equipment_v4',
  TEACHERS: 'labhub_teachers_v4',
  TEACHER_ROOMS: 'labhub_teacher_rooms_v4',
  BORROW_RECORDS: 'labhub_borrow_records_v4',
  BORROW_ITEMS: 'labhub_borrow_items_v4',
  EQUIPMENT_REQUESTS: 'labhub_equipment_requests_v4',
  AUDIT_LOG: 'labhub_audit_log_v4',
  SESSION: 'labhub_session_v4',
  USE_LIVE_API: 'labhub_use_live_api_v4',
};

// Utilities for local persistence
function getStorage<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading localStorage for', key, err);
    return initial;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed writing localStorage for', key, err);
  }
}

export function resetToSeedData(): void {
  localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(INITIAL_SUBJECTS));
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(INITIAL_TOPICS));
  localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(INITIAL_LESSONS));
  localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENT));
  localStorage.setItem(STORAGE_KEYS.TOPIC_EQUIPMENT, JSON.stringify(INITIAL_TOPIC_EQUIPMENT));
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  localStorage.setItem(STORAGE_KEYS.TEACHER_ROOMS, JSON.stringify(INITIAL_TEACHER_ROOMS));
  localStorage.setItem(STORAGE_KEYS.BORROW_RECORDS, JSON.stringify(INITIAL_BORROW_RECORDS));
  localStorage.setItem(STORAGE_KEYS.BORROW_ITEMS, JSON.stringify(INITIAL_BORROW_ITEMS));
  localStorage.setItem(STORAGE_KEYS.EQUIPMENT_REQUESTS, JSON.stringify(INITIAL_EQUIPMENT_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(INITIAL_AUDIT_LOG));
}

// Generate unique ID
function genId(prefix: string): string {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '') + '-' +
    d.toTimeString().slice(0, 8).replace(/:/g, '');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
}

function normalizeText(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

// Check if borrow is overdue (borrowed on previous day and not returned)
export function isBorrowOverdue(record: BorrowRecord): boolean {
  if (record.status === 'RETURNED') return false;
  const todayStr = new Date().toISOString().slice(0, 10);
  const borrowDateStr = String(record.borrowed_at || '').slice(0, 10);
  return borrowDateStr !== '' && borrowDateStr < todayStr;
}

export function calculateDuration(start: string, end?: string): { minutes: number; label: string } {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
  const minutes = Math.round(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  const label = hours > 0 ? `${hours} giờ ${remMinutes} phút` : `${remMinutes} phút`;
  return { minutes, label };
}

// Local Database Engine implementation conforming 100% to Apps Script V4
class LocalEngine {
  resetToDefaults(): void {
    resetToSeedData();
  }

  getRooms(): Room[] {
    return getStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  }

  getSubjects(): Subject[] {
    return getStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }

  getClasses(): ClassRoom[] {
    return getStorage(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  }

  getTopics(): Topic[] {
    return getStorage(STORAGE_KEYS.TOPICS, INITIAL_TOPICS);
  }

  getLessons(): Lesson[] {
    return getStorage(STORAGE_KEYS.LESSONS, INITIAL_LESSONS);
  }

  getEquipment(): Equipment[] {
    return getStorage(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
  }

  getTopicEquipment(): TopicEquipment[] {
    return getStorage(STORAGE_KEYS.TOPIC_EQUIPMENT, INITIAL_TOPIC_EQUIPMENT);
  }

  getTeachers(): Teacher[] {
    return getStorage(STORAGE_KEYS.TEACHERS, INITIAL_TEACHERS);
  }

  getTeacherRooms(): TeacherRoom[] {
    return getStorage(STORAGE_KEYS.TEACHER_ROOMS, INITIAL_TEACHER_ROOMS);
  }

  getBorrowRecords(): BorrowRecord[] {
    return getStorage(STORAGE_KEYS.BORROW_RECORDS, INITIAL_BORROW_RECORDS);
  }

  getBorrowItems(): BorrowItem[] {
    return getStorage(STORAGE_KEYS.BORROW_ITEMS, INITIAL_BORROW_ITEMS);
  }

  getEquipmentRequests(): EquipmentRequest[] {
    return getStorage(STORAGE_KEYS.EQUIPMENT_REQUESTS, INITIAL_EQUIPMENT_REQUESTS);
  }

  getAuditLogs(): AuditLog[] {
    return getStorage(STORAGE_KEYS.AUDIT_LOG, INITIAL_AUDIT_LOG);
  }

  // Active borrowed quantities: borrow item quantity - returned_quantity for BORROWED or PARTIAL_RETURN
  getActiveBorrowedQuantities(): Record<string, number> {
    const records = this.getBorrowRecords().filter(
      r => r.status === 'BORROWED' || r.status === 'PARTIAL_RETURN'
    );
    const activeBorrowIds = new Set(records.map(r => r.borrow_id));
    const items = this.getBorrowItems().filter(i => activeBorrowIds.has(i.borrow_id));

    const totals: Record<string, number> = {};
    for (const item of items) {
      const remaining = Math.max(0, item.quantity - (item.returned_quantity || 0));
      totals[item.equipment_id] = (totals[item.equipment_id] || 0) + remaining;
    }
    return totals;
  }

  // Merged inventory: available = total - active_borrowed - blocked
  getMergedInventory(roomId?: string): Equipment[] {
    const raw = this.getEquipment();
    const borrowedMap = this.getActiveBorrowedQuantities();

    const merged = raw.map(e => {
      const total = Number(e.total_quantity) || 0;
      const blocked = Number(e.blocked_quantity) || 0;
      const borrowed = borrowedMap[e.equipment_id] || 0;
      const available = Math.max(0, total - borrowed - blocked);

      return {
        ...e,
        total_quantity: total,
        blocked_quantity: blocked,
        borrowed_quantity: borrowed,
        available_quantity: available,
        selectable: available > 0 && e.status === 'ACTIVE',
        availability_status: (available > 0 ? 'AVAILABLE' : 'UNAVAILABLE') as 'AVAILABLE' | 'UNAVAILABLE',
      };
    });

    if (roomId) {
      return merged.filter(e => e.room_id === roomId);
    }
    return merged;
  }

  // Bootstrap for user
  bootstrap(actor: Actor) {
    const rooms = this.getRooms().filter(r => r.status !== 'INACTIVE');
    const teacherRooms = actor.role === 'ADMIN'
      ? rooms
      : rooms.filter(r => actor.room_ids.includes(r.room_id));

    const equipment = this.getMergedInventory();
    const accessibleEquipment = actor.role === 'ADMIN'
      ? equipment
      : equipment.filter(e => actor.room_ids.includes(e.room_id));

    return {
      app: { name: 'LAB HUB FPT', version: '4.0.0' },
      actor,
      rooms: teacherRooms,
      subjects: this.getSubjects().filter(s => s.status === 'ACTIVE'),
      classes: this.getClasses().filter(c => c.status === 'ACTIVE'),
      topics: this.getTopics().filter(t => t.status === 'ACTIVE'),
      lessons: this.getLessons().filter(l => l.status === 'ACTIVE'),
      equipment: accessibleEquipment,
      topic_equipment: this.getTopicEquipment().filter(te => te.status === 'ACTIVE'),
    };
  }

  // Admin bootstrap
  adminBootstrap() {
    return {
      app: { name: 'LAB HUB FPT', version: '4.0.0' },
      rooms: this.getRooms(),
      subjects: this.getSubjects(),
      classes: this.getClasses(),
      topics: this.getTopics(),
      lessons: this.getLessons(),
      equipment: this.getMergedInventory(),
      topic_equipment: this.getTopicEquipment(),
      teachers: this.getTeachers().map(t => ({
        ...t,
        room_ids: this.getTeacherRooms()
          .filter(tr => tr.teacher_id === t.teacher_id && tr.status !== 'INACTIVE')
          .map(tr => tr.room_id),
      })),
      equipment_requests: this.getEquipmentRequests(),
    };
  }

  // Teacher dashboard
  getMyDashboard(actor: Actor) {
    const allRecords = this.getBorrowRecords().filter(r => r.teacher_id === actor.teacher_id);
    const activeBorrows = allRecords.filter(r => r.status === 'BORROWED' || r.status === 'PARTIAL_RETURN');
    const overdueBorrows = activeBorrows.filter(isBorrowOverdue);
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthBorrows = allRecords.filter(r => (r.borrowed_at || '').slice(0, 7) === currentMonth);

    // Calculate total devices holding
    const activeIds = new Set(activeBorrows.map(r => r.borrow_id));
    const activeItems = this.getBorrowItems().filter(i => activeIds.has(i.borrow_id));
    const totalDevicesHolding = activeItems.reduce(
      (acc, item) => acc + Math.max(0, item.quantity - (item.returned_quantity || 0)),
      0
    );

    const detailedActive = activeBorrows.map(r => this.decorateBorrowRecord(r, actor));
    const detailedRecent = allRecords
      .sort((a, b) => b.borrowed_at.localeCompare(a.borrowed_at))
      .slice(0, 10)
      .map(r => this.decorateBorrowRecord(r, actor));

    return {
      teacher: actor,
      counts: {
        total_borrow_records: allRecords.length,
        active_borrow_records: activeBorrows.length,
        total_devices_holding: totalDevicesHolding,
        overdue_records: overdueBorrows.length,
        current_month_records: monthBorrows.length,
      },
      active_borrows: detailedActive,
      recent: detailedRecent,
    };
  }

  // Decorate borrow record with calculated fields and items
  decorateBorrowRecord(r: BorrowRecord, actor?: Actor): BorrowRecord {
    const items = this.getBorrowItems().filter(i => i.borrow_id === r.borrow_id);
    const eqMap = new Map(this.getEquipment().map(e => [e.equipment_id, e]));

    const decoratedItems = items.map(item => ({
      ...item,
      equipment: eqMap.get(item.equipment_id),
    }));

    const duration = calculateDuration(r.borrowed_at, r.returned_at);
    const overdue = isBorrowOverdue(r);

    const todayStr = new Date().toISOString().slice(0, 10);
    const isToday = String(r.borrowed_at || '').slice(0, 10) === todayStr;
    const editable_today = actor?.role === 'ADMIN'
      ? true
      : (r.status !== 'RETURNED' && (isToday || r.edit_state === 'ADMIN_UNLOCKED'));

    const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

    return {
      ...r,
      duration_minutes: duration.minutes,
      duration_label: duration.label,
      overdue,
      editable_today,
      item_count: items.length,
      total_quantity: totalQty,
      items: decoratedItems,
    };
  }

  // Borrow action
  borrow(
    actor: Actor,
    body: {
      client_request_id: string;
      room_id: string;
      subject_id: string;
      class_id: string;
      topic_id: string;
      lesson_id: string;
      items: Array<{ equipment_id: string; quantity: number }>;
      note?: string;
    }
  ): BorrowRecord {
    if (!body.client_request_id) throw new Error('Thiếu client_request_id');

    // Idempotency check
    const existing = this.getBorrowRecords().find(r => r.client_request_id === body.client_request_id);
    if (existing) {
      return this.decorateBorrowRecord(existing, actor);
    }

    if (actor.role !== 'ADMIN' && !actor.room_ids.includes(body.room_id)) {
      throw new Error('Bạn không có quyền mượn thiết bị ở phòng này');
    }

    if (!body.items || body.items.length === 0) {
      throw new Error('Chưa chọn thiết bị để mượn');
    }

    // Inventory check
    const inventory = this.getMergedInventory(body.room_id);
    const invMap = new Map(inventory.map(e => [e.equipment_id, e]));

    for (const item of body.items) {
      const eq = invMap.get(item.equipment_id);
      if (!eq) {
        throw new Error(`Thiết bị ${item.equipment_id} không thuộc phòng đã chọn`);
      }
      if (item.quantity <= 0) {
        throw new Error(`Số lượng mượn phải lớn hơn 0`);
      }
      if (item.quantity > (eq.available_quantity || 0)) {
        throw new Error(`Không đủ thiết bị trong kho: "${eq.equipment_name}" (Còn lại: ${eq.available_quantity})`);
      }
    }

    const now = new Date().toISOString();
    const borrowId = genId('BR');

    const newRecord: BorrowRecord = {
      borrow_id: borrowId,
      teacher_id: actor.teacher_id,
      receiver_id: actor.teacher_id,
      room_id: body.room_id,
      subject_id: body.subject_id,
      class_id: body.class_id,
      topic_id: body.topic_id,
      lesson_id: body.lesson_id,
      borrowed_at: now,
      status: 'BORROWED',
      client_request_id: body.client_request_id,
      edit_state: 'EDITABLE_TODAY',
      note: body.note || '',
      created_at: now,
      updated_at: now,
    };

    const newItems: BorrowItem[] = body.items.map(item => ({
      borrow_item_id: genId('BI'),
      borrow_id: borrowId,
      equipment_id: item.equipment_id,
      quantity: item.quantity,
      returned_quantity: 0,
      incident_type: 'NORMAL',
      incident_note: '',
      created_at: now,
      updated_at: now,
    }));

    const records = this.getBorrowRecords();
    records.unshift(newRecord);
    setStorage(STORAGE_KEYS.BORROW_RECORDS, records);

    const items = this.getBorrowItems();
    items.push(...newItems);
    setStorage(STORAGE_KEYS.BORROW_ITEMS, items);

    // Audit log
    this.addAuditLog(actor, 'BORROW', 'BORROW_RECORD', borrowId, '', JSON.stringify(newRecord), 'Mượn thiết bị');

    return this.decorateBorrowRecord(newRecord, actor);
  }

  // Return borrow action
  returnBorrow(
    actor: Actor,
    body: {
      borrow_id: string;
      client_request_id: string;
      items?: Array<{
        borrow_item_id: string;
        returned_quantity?: number;
        incident_type?: IncidentType;
        incident_note?: string;
      }>;
      reason?: string;
    }
  ): BorrowRecord {
    const record = this.getBorrowRecords().find(r => r.borrow_id === body.borrow_id);
    if (!record) throw new Error('Không tìm thấy phiếu mượn');

    if (actor.role !== 'ADMIN' && record.teacher_id !== actor.teacher_id) {
      throw new Error('Bạn không có quyền thao tác trên phiếu mượn của giáo viên khác');
    }

    if (record.status === 'RETURNED') {
      return this.decorateBorrowRecord(record, actor);
    }

    const items = this.getBorrowItems().filter(i => i.borrow_id === body.borrow_id);
    const now = new Date().toISOString();
    const providedMap = new Map((body.items || []).map(p => [p.borrow_item_id, p]));

    const allEquipment = this.getEquipment();
    const eqMap = new Map(allEquipment.map(e => [e.equipment_id, e]));

    // Process each item
    for (const item of items) {
      const input = providedMap.get(item.borrow_item_id);
      let targetReturned = item.quantity;
      let incident: IncidentType = 'NORMAL';
      let note = '';

      if (input) {
        targetReturned = input.returned_quantity !== undefined ? input.returned_quantity : item.quantity;
        incident = input.incident_type || 'NORMAL';
        note = input.incident_note || '';
      }

      if (targetReturned < item.returned_quantity || targetReturned > item.quantity) {
        throw new Error('Số lượng trả không hợp lệ');
      }

      const delta = targetReturned - item.returned_quantity;

      // Incident handling per V4 spec: if DAMAGED or MISSING, increment blocked_quantity
      if ((incident === 'DAMAGED' || incident === 'MISSING') && delta > 0) {
        const eq = eqMap.get(item.equipment_id);
        if (eq) {
          eq.blocked_quantity = (eq.blocked_quantity || 0) + delta;
          eq.note = (eq.note ? eq.note + ' | ' : '') + `Sự cố ${incident} (${delta} ${eq.unit}): ${note}`;
        }
      }

      item.returned_quantity = targetReturned;
      item.incident_type = incident;
      item.incident_note = note;
      item.updated_at = now;
    }

    setStorage(STORAGE_KEYS.EQUIPMENT, allEquipment);
    setStorage(STORAGE_KEYS.BORROW_ITEMS, this.getBorrowItems());

    // Check if fully returned
    const complete = items.every(i => (i.returned_quantity || 0) >= i.quantity);
    record.status = complete ? 'RETURNED' : 'PARTIAL_RETURN';
    record.returned_at = complete ? now : undefined;
    record.updated_at = now;

    setStorage(STORAGE_KEYS.BORROW_RECORDS, this.getBorrowRecords());

    this.addAuditLog(actor, 'RETURN', 'BORROW_RECORD', record.borrow_id, '', JSON.stringify({ status: record.status }), body.reason || 'Trả thiết bị');

    return this.decorateBorrowRecord(record, actor);
  }

  // Equipment request submission
  submitEquipmentRequest(
    actor: Actor,
    body: {
      room_id: string;
      subject_id: string;
      class_id: string;
      topic_id: string;
      equipment_name: string;
      quantity: number;
      image_url?: string;
      note?: string;
    }
  ): EquipmentRequest {
    if (actor.role !== 'ADMIN' && !actor.room_ids.includes(body.room_id)) {
      throw new Error('Bạn không có quyền đề xuất thiết bị ở phòng này');
    }

    if (!body.equipment_name?.trim()) {
      throw new Error('Tên thiết bị không được để trống');
    }

    if (!body.quantity || body.quantity <= 0) {
      throw new Error('Số lượng thiết bị phải lớn hơn 0');
    }

    // Duplicate check per spec: room_id + normalized equipment_name
    const targetNorm = normalizeText(body.equipment_name);
    const existing = this.getEquipment().find(
      e => e.room_id === body.room_id && normalizeText(e.equipment_name) === targetNorm && e.status !== 'INACTIVE'
    );

    if (existing) {
      throw new Error(`Thiết bị "${existing.equipment_name}" đã tồn tại trong phòng này (Mã: ${existing.equipment_code})`);
    }

    const now = new Date().toISOString();
    const newReq: EquipmentRequest = {
      request_id: genId('ER'),
      requested_by: actor.teacher_id,
      requester_name: actor.display_name,
      room_id: body.room_id,
      subject_id: body.subject_id,
      class_id: body.class_id,
      topic_id: body.topic_id,
      equipment_name: body.equipment_name.trim(),
      quantity: Number(body.quantity),
      image_url: body.image_url || '',
      status: 'PENDING',
      created_at: now,
      updated_at: now,
      note: body.note || '',
    };

    const requests = this.getEquipmentRequests();
    requests.unshift(newReq);
    setStorage(STORAGE_KEYS.EQUIPMENT_REQUESTS, requests);

    this.addAuditLog(actor, 'EQUIPMENT_REQUEST_CREATE', 'EQUIPMENT_REQUESTS', newReq.request_id, '', JSON.stringify(newReq), 'Đề xuất thiết bị mới');

    return newReq;
  }

  // Cancel equipment request (only if PENDING)
  cancelEquipmentRequest(actor: Actor, requestId: string): EquipmentRequest {
    const requests = this.getEquipmentRequests();
    const req = requests.find(r => r.request_id === requestId);
    if (!req) throw new Error('Không tìm thấy yêu cầu');

    if (actor.role !== 'ADMIN' && req.requested_by !== actor.teacher_id) {
      throw new Error('Bạn không có quyền hủy yêu cầu của người khác');
    }

    if (req.status !== 'PENDING') {
      throw new Error('Chỉ có thể hủy yêu cầu đang ở trạng thái chờ duyệt');
    }

    req.status = 'CANCELLED';
    req.updated_at = new Date().toISOString();
    setStorage(STORAGE_KEYS.EQUIPMENT_REQUESTS, requests);

    this.addAuditLog(actor, 'EQUIPMENT_REQUEST_CANCEL', 'EQUIPMENT_REQUESTS', requestId, '', '', 'Hủy yêu cầu');
    return req;
  }

  // Admin approve equipment request -> create or update EQUIPMENT + TOPIC_EQUIPMENT
  adminApproveEquipmentRequest(actor: Actor, requestId: string): { request: EquipmentRequest; equipment: Equipment } {
    if (actor.role !== 'ADMIN') throw new Error('Chỉ quản trị viên mới có quyền duyệt');

    const requests = this.getEquipmentRequests();
    const req = requests.find(r => r.request_id === requestId);
    if (!req) throw new Error('Không tìm thấy yêu cầu');
    if (req.status !== 'PENDING') throw new Error('Yêu cầu không còn ở trạng thái chờ duyệt');

    const now = new Date().toISOString();
    const equipmentList = this.getEquipment();

    // Check duplicate
    const targetNorm = normalizeText(req.equipment_name);
    let eq = equipmentList.find(e => e.room_id === req.room_id && normalizeText(e.equipment_name) === targetNorm);

    if (eq) {
      eq.total_quantity = (eq.total_quantity || 0) + req.quantity;
      if (req.image_url) eq.image_url = req.image_url;
      eq.updated_at = now;
    } else {
      const codeSeq = equipmentList.length + 1;
      const code = `TB-${String(codeSeq).padStart(6, '0')}`;
      eq = {
        equipment_id: genId('EQ'),
        equipment_code: code,
        equipment_name: req.equipment_name,
        category: 'Thiết bị mới duyệt',
        room_id: req.room_id,
        unit: 'cái',
        total_quantity: req.quantity,
        blocked_quantity: 0,
        status: 'ACTIVE',
        image_url: req.image_url || '',
        note: `Tạo từ đề xuất ${req.request_id}`,
      };
      equipmentList.push(eq);
    }

    setStorage(STORAGE_KEYS.EQUIPMENT, equipmentList);

    // Ensure TOPIC_EQUIPMENT mapping
    const mappings = this.getTopicEquipment();
    const existingMapping = mappings.find(m => m.topic_id === req.topic_id && m.equipment_id === eq!.equipment_id);
    if (existingMapping) {
      existingMapping.default_quantity = Math.max(existingMapping.default_quantity, req.quantity);
      existingMapping.status = 'ACTIVE';
    } else {
      mappings.push({
        mapping_id: genId('MAP'),
        topic_id: req.topic_id,
        equipment_id: eq.equipment_id,
        default_quantity: req.quantity,
        required: 'NO',
        status: 'ACTIVE',
      });
    }
    setStorage(STORAGE_KEYS.TOPIC_EQUIPMENT, mappings);

    // Update request
    req.status = 'APPROVED';
    req.approved_by = actor.teacher_id;
    req.approved_at = now;
    req.updated_at = now;
    setStorage(STORAGE_KEYS.EQUIPMENT_REQUESTS, requests);

    this.addAuditLog(actor, 'EQUIPMENT_REQUEST_APPROVE', 'EQUIPMENT_REQUESTS', requestId, '', JSON.stringify({ eq }), 'Duyệt đề xuất thiết bị');

    return { request: req, equipment: eq };
  }

  // Admin reject equipment request
  adminRejectEquipmentRequest(actor: Actor, requestId: string, reason: string): EquipmentRequest {
    if (actor.role !== 'ADMIN') throw new Error('Chỉ quản trị viên mới có quyền từ chối');
    if (!reason?.trim()) throw new Error('Vui lòng nhập lý do từ chối');

    const requests = this.getEquipmentRequests();
    const req = requests.find(r => r.request_id === requestId);
    if (!req) throw new Error('Không tìm thấy yêu cầu');
    if (req.status !== 'PENDING') throw new Error('Yêu cầu không còn ở trạng thái chờ duyệt');

    const now = new Date().toISOString();
    req.status = 'REJECTED';
    req.rejected_reason = reason.trim();
    req.approved_by = actor.teacher_id;
    req.approved_at = now;
    req.updated_at = now;
    setStorage(STORAGE_KEYS.EQUIPMENT_REQUESTS, requests);

    this.addAuditLog(actor, 'EQUIPMENT_REQUEST_REJECT', 'EQUIPMENT_REQUESTS', requestId, '', '', reason);
    return req;
  }

  // Admin unlock past-day borrow record
  adminUnlock(actor: Actor, borrowId: string, reason: string): BorrowRecord {
    if (actor.role !== 'ADMIN') throw new Error('Chỉ quản trị viên mới có quyền mở khóa');
    if (!reason?.trim()) throw new Error('Bắt buộc phải nhập lý do mở khóa');

    const records = this.getBorrowRecords();
    const record = records.find(r => r.borrow_id === borrowId);
    if (!record) throw new Error('Không tìm thấy phiếu mượn');

    const now = new Date().toISOString();
    record.edit_state = 'ADMIN_UNLOCKED';
    record.unlock_reason = reason.trim();
    record.unlock_at = now;
    record.unlock_by = actor.teacher_id;
    record.updated_at = now;
    setStorage(STORAGE_KEYS.BORROW_RECORDS, records);

    this.addAuditLog(actor, 'ADMIN_UNLOCK', 'BORROW_RECORD', borrowId, '', '', reason);
    return this.decorateBorrowRecord(record, actor);
  }

  // Admin assign room permission to teacher
  adminRoomPermission(actor: Actor, teacherId: string, roomId: string, status: 'ACTIVE' | 'INACTIVE'): TeacherRoom {
    if (actor.role !== 'ADMIN') throw new Error('Chỉ quản trị viên mới có quyền phân quyền');

    const teacherRooms = this.getTeacherRooms();
    let tr = teacherRooms.find(x => x.teacher_id === teacherId && x.room_id === roomId);

    if (tr) {
      tr.status = status;
    } else {
      tr = {
        teacher_room_id: genId('TR'),
        teacher_id: teacherId,
        room_id: roomId,
        status,
      };
      teacherRooms.push(tr);
    }
    setStorage(STORAGE_KEYS.TEACHER_ROOMS, teacherRooms);

    // Update teacher room_ids
    const teachers = this.getTeachers();
    const teacher = teachers.find(t => t.teacher_id === teacherId);
    if (teacher) {
      teacher.room_ids = teacherRooms
        .filter(x => x.teacher_id === teacherId && x.status !== 'INACTIVE')
        .map(x => x.room_id);
      setStorage(STORAGE_KEYS.TEACHERS, teachers);
    }

    this.addAuditLog(actor, 'ADMIN_ROOM_PERMISSION', 'TEACHER_ROOMS', tr.teacher_room_id, '', JSON.stringify(tr), `Phân quyền phòng ${roomId}`);
    return tr;
  }

  // Admin update equipment
  adminUpdateEquipment(actor: Actor, eqData: Partial<Equipment> & { equipment_id: string }): Equipment {
    if (actor.role !== 'ADMIN') throw new Error('Chỉ quản trị viên mới có quyền cập nhật');

    const list = this.getEquipment();
    const eq = list.find(e => e.equipment_id === eqData.equipment_id);
    if (!eq) throw new Error('Không tìm thấy thiết bị');

    Object.assign(eq, eqData);
    setStorage(STORAGE_KEYS.EQUIPMENT, list);

    this.addAuditLog(actor, 'ADMIN_UPDATE_EQUIPMENT', 'EQUIPMENT', eq.equipment_id, '', JSON.stringify(eq), 'Cập nhật thiết bị');
    return eq;
  }

  // System Diagnostics implementation per V4
  getDiagnostics(): DiagnosticsResult {
    const rooms = this.getRooms();
    const subjects = this.getSubjects();
    const classes = this.getClasses();
    const topics = this.getTopics();
    const lessons = this.getLessons();
    const equipment = this.getEquipment();
    const teachers = this.getTeachers();
    const borrows = this.getBorrowRecords();
    const items = this.getBorrowItems();

    const problems: Array<{ severity: 'P0' | 'P1'; type: string; sheet: string; message: string }> = [];

    // Check orphan topics
    const subSet = new Set(subjects.map(s => s.subject_id));
    const clsSet = new Set(classes.map(c => c.class_id));
    for (const t of topics) {
      if (!subSet.has(t.subject_id)) {
        problems.push({ severity: 'P1', type: 'ORPHAN', sheet: 'TOPICS', message: `Topic ${t.topic_code} trỏ đến môn học không tồn tại (${t.subject_id})` });
      }
      if (!clsSet.has(t.class_id)) {
        problems.push({ severity: 'P1', type: 'ORPHAN', sheet: 'TOPICS', message: `Topic ${t.topic_code} trỏ đến lớp học không tồn tại (${t.class_id})` });
      }
    }

    // Check orphan lessons
    const topSet = new Set(topics.map(t => t.topic_id));
    for (const l of lessons) {
      if (!topSet.has(l.topic_id)) {
        problems.push({ severity: 'P1', type: 'ORPHAN', sheet: 'LESSONS', message: `Bài ${l.lesson_code} trỏ đến chương không tồn tại (${l.topic_id})` });
      }
    }

    // Check inventory corruption
    const activeBorrowed = this.getActiveBorrowedQuantities();
    for (const e of equipment) {
      const total = Number(e.total_quantity) || 0;
      const blocked = Number(e.blocked_quantity) || 0;
      const borrowed = activeBorrowed[e.equipment_id] || 0;
      const available = total - borrowed - blocked;
      if (available < 0) {
        problems.push({
          severity: 'P0',
          type: 'INVENTORY_CORRUPTION',
          sheet: 'EQUIPMENT',
          message: `Thiết bị ${e.equipment_name} có số lượng khả dụng âm (${available})! Tổng: ${total}, Đang mượn: ${borrowed}, Hỏng/Khóa: ${blocked}`
        });
      }
    }

    return {
      service: 'LAB HUB FPT',
      version: '4.0.0',
      spreadsheet: {
        id: '10Gf0i8XbY3UBCOKmrbmVVCj1S_Bft1_NVjeDoaQD4t0',
        name: 'LAB HUB Production Google Sheet V4',
        url: 'https://docs.google.com/spreadsheets/d/10Gf0i8XbY3UBCOKmrbmVVCj1S_Bft1_NVjeDoaQD4t0/edit',
      },
      sheets: {
        ROOMS: { exists: true, rows: rooms.length, columns: 6 },
        SUBJECTS: { exists: true, rows: subjects.length, columns: 5 },
        CLASSES: { exists: true, rows: classes.length, columns: 7 },
        TOPICS: { exists: true, rows: topics.length, columns: 8 },
        LESSONS: { exists: true, rows: lessons.length, columns: 7 },
        EQUIPMENT: { exists: true, rows: equipment.length, columns: 11 },
        TOPIC_EQUIPMENT: { exists: true, rows: this.getTopicEquipment().length, columns: 7 },
        EQUIPMENT_REQUESTS: { exists: true, rows: this.getEquipmentRequests().length, columns: 16 },
        TEACHERS: { exists: true, rows: teachers.length, columns: 9 },
        TEACHER_ROOMS: { exists: true, rows: this.getTeacherRooms().length, columns: 5 },
        BORROW_RECORDS: { exists: true, rows: borrows.length, columns: 18 },
        BORROW_ITEMS: { exists: true, rows: items.length, columns: 9 },
        AUDIT_LOG: { exists: true, rows: this.getAuditLogs().length, columns: 12 },
      },
      auth_secret_configured: true,
      drive: {
        ROOT: true,
        DATA: true,
        IMPORT: true,
        EQUIPMENT_IMAGES: true,
        REPORTS: true,
        BACKUP: true,
        DOCUMENTS: true,
      },
      integrity: {
        ok: problems.length === 0,
        problem_count: problems.length,
        problems,
      },
    };
  }

  addAuditLog(actor: Actor, action: string, entityType: string, entityId: string, before: string, after: string, reason: string) {
    const logs = this.getAuditLogs();
    logs.unshift({
      audit_id: genId('AUD'),
      event_at: new Date().toISOString(),
      actor_id: actor.teacher_id,
      actor_role: actor.role,
      action,
      entity_type: entityType,
      entity_id: entityId,
      request_id: genId('REQ'),
      before_json: before,
      after_json: after,
      reason,
    });
    setStorage(STORAGE_KEYS.AUDIT_LOG, logs);
  }
}

export const localEngine = new LocalEngine();

// API Service with remote Google Apps Script call & automatic fallback
export class ApiService {
  private static useLiveApi = false;

  static setLiveMode(enabled: boolean) {
    this.useLiveApi = enabled;
    localStorage.setItem(STORAGE_KEYS.USE_LIVE_API, String(enabled));
  }

  static getLiveMode(): boolean {
    const saved = localStorage.getItem(STORAGE_KEYS.USE_LIVE_API);
    if (saved !== null) {
      return saved === 'true';
    }
    return this.useLiveApi;
  }

  // Direct HTTP test of Apps Script health endpoint
  static async testAppsScriptHealth(): Promise<{ ok: boolean; message: string; data?: any }> {
    const url = `${getApiUrl()}?action=health`;
    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      if (!response.ok) {
        return { ok: false, message: `HTTP ${response.status}: ${response.statusText}` };
      }
      const json = await response.json();
      if (json.ok) {
        return { ok: true, message: 'Kết nối Google Apps Script Web App thành công!', data: json.data };
      }
      return { ok: false, message: json.message || 'Lỗi trả về từ Apps Script' };
    } catch (err: any) {
      return {
        ok: false,
        message: `Không thể kết nối đến Web App: ${err.message || 'Lỗi mạng hoặc CORS'}`
      };
    }
  }

  // Login: checks local accounts or calls live API if enabled
  static async login(email: string, pin: string): Promise<AuthSession> {
    const normEmail = email.trim().toLowerCase();

    // If live API is explicitly preferred, try remote first
    if (this.getLiveMode()) {
      try {
        const res = await fetch(getApiUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email: normEmail, pin }),
        });
        const json = await res.json();
        if (json.ok && json.data) {
          const session: AuthSession = {
            token: json.data.token,
            expires_at: json.data.expires_at,
            actor: json.data.actor,
            room_ids: json.data.room_ids || json.data.actor?.room_ids || [],
          };
          localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
          return session;
        }
      } catch (err) {
        console.warn('Live login failed, falling back to local engine', err);
      }
    }

    // Local authentication
    const teachers = localEngine.getTeachers();
    const teacher = teachers.find(t => t.email.toLowerCase() === normEmail);

    if (!teacher || teacher.status !== 'ACTIVE') {
      throw new Error('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa');
    }

    // For local prototype, we accept PIN '123456' or any 6-digit PIN
    if (pin.length < 6) {
      throw new Error('Mã PIN phải có ít nhất 6 chữ số');
    }

    const room_ids = localEngine.getTeacherRooms()
      .filter(tr => tr.teacher_id === teacher.teacher_id && tr.status !== 'INACTIVE')
      .map(tr => tr.room_id);

    const actor: Actor = {
      teacher_id: teacher.teacher_id,
      email: teacher.email,
      display_name: teacher.display_name,
      role: teacher.role,
      status: teacher.status,
      room_ids,
    };

    const session: AuthSession = {
      token: `token-local-${Date.now()}-${teacher.teacher_id}`,
      expires_at: new Date(Date.now() + 12 * 3600000).toISOString(),
      actor,
      room_ids,
    };

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    return session;
  }

  static getSavedSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return null;
      const sess: AuthSession = JSON.parse(raw);
      if (new Date(sess.expires_at).getTime() < Date.now()) {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
        return null;
      }
      return sess;
    } catch {
      return null;
    }
  }

  static logout(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}
