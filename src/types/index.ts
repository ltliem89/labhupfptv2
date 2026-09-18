export type Role = 'TEACHER' | 'ADMIN';
export type EntityStatus = 'ACTIVE' | 'INACTIVE';
export type BorrowStatus = 'BORROWED' | 'PARTIAL_RETURN' | 'RETURNED';
export type EditState = 'EDITABLE_TODAY' | 'LOCKED' | 'ADMIN_UNLOCKED';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type IncidentType = 'NORMAL' | 'DAMAGED' | 'MISSING' | '';

export interface Room {
  room_id: string;
  room_code: string;
  room_name: string;
  icon: string;
  status: EntityStatus;
  note?: string;
}

export interface Subject {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  status: EntityStatus;
  note?: string;
}

export interface ClassRoom {
  class_id: string;
  class_code: string;
  class_name: string;
  grade: string | number;
  school_year: string;
  status: EntityStatus;
  note?: string;
}

export interface Topic {
  topic_id: string;
  topic_code: string;
  topic_name: string;
  subject_id: string;
  class_id: string;
  chapter_order: number;
  status: EntityStatus;
  note?: string;
}

export interface Lesson {
  lesson_id: string;
  lesson_code: string;
  lesson_name: string;
  topic_id: string;
  lesson_order: number;
  status: EntityStatus;
  note?: string;
}

export interface Equipment {
  equipment_id: string;
  equipment_code: string;
  equipment_name: string;
  category: string;
  room_id: string;
  unit: string;
  total_quantity: number;
  blocked_quantity: number;
  status: EntityStatus;
  image_url?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
  // Computed fields
  borrowed_quantity?: number;
  available_quantity?: number;
  selectable?: boolean;
  availability_status?: 'AVAILABLE' | 'UNAVAILABLE';
}

export interface TopicEquipment {
  mapping_id: string;
  topic_id: string;
  equipment_id: string;
  default_quantity: number;
  required: 'YES' | 'NO';
  status: EntityStatus;
  note?: string;
}

export interface EquipmentRequest {
  request_id: string;
  requested_by: string;
  room_id: string;
  subject_id: string;
  class_id: string;
  topic_id: string;
  equipment_name: string;
  quantity: number;
  image_url?: string;
  status: RequestStatus;
  approved_by?: string;
  approved_at?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
  note?: string;
  requester_name?: string;
}

export interface Teacher {
  teacher_id: string;
  email: string;
  display_name: string;
  role: Role;
  status: EntityStatus;
  room_ids: string[];
  created_at?: string;
  updated_at?: string;
  note?: string;
}

export interface TeacherRoom {
  teacher_room_id: string;
  teacher_id: string;
  room_id: string;
  status: EntityStatus;
  note?: string;
}

export interface BorrowItem {
  borrow_item_id: string;
  borrow_id: string;
  equipment_id: string;
  quantity: number;
  returned_quantity: number;
  incident_type: IncidentType;
  incident_note?: string;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
}

export interface BorrowRecord {
  borrow_id: string;
  teacher_id: string;
  receiver_id: string;
  room_id: string;
  subject_id: string;
  class_id: string;
  topic_id: string;
  lesson_id: string;
  borrowed_at: string;
  returned_at?: string;
  status: BorrowStatus;
  client_request_id: string;
  edit_state: EditState;
  unlock_reason?: string;
  unlock_at?: string;
  unlock_by?: string;
  note?: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  duration_minutes?: number;
  duration_label?: string;
  overdue?: boolean;
  editable_today?: boolean;
  item_count?: number;
  total_quantity?: number;
  items?: BorrowItem[];
}

export interface AuditLog {
  audit_id: string;
  event_at: string;
  actor_id: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  request_id: string;
  before_json: string;
  after_json: string;
  reason?: string;
  note?: string;
}

export interface Actor {
  teacher_id: string;
  email: string;
  display_name: string;
  role: Role;
  status: EntityStatus;
  room_ids: string[];
}

export interface AuthSession {
  token: string;
  expires_at: string;
  actor: Actor;
  room_ids: string[];
}

export interface DiagnosticsResult {
  service: string;
  version: string;
  spreadsheet: {
    id: string;
    name: string;
    url: string;
  };
  sheets: Record<string, { exists: boolean; rows: number; columns: number }>;
  auth_secret_configured: boolean;
  drive: Record<string, boolean>;
  integrity: {
    ok: boolean;
    problem_count: number;
    problems: Array<{
      severity: 'P0' | 'P1';
      type: string;
      sheet: string;
      row?: number;
      field?: string;
      message?: string;
    }>;
  };
}
