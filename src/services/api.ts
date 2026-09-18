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

const getApiUrl = (): string => {
  // Use strictly the environment variable
  return import.meta.env.VITE_APPS_SCRIPT_URL as string;
};

// Local storage keys for session only
const STORAGE_KEYS = {
  SESSION: 'labhub_session_v4',
};

// Helper for HTTP requests
async function fetchApi(body: any): Promise<any> {
  const url = getApiUrl();
  if (!url) {
    throw new Error('VITE_APPS_SCRIPT_URL is missing.');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    // In some environments, apps script redirect returns text/html, but we assume it's JSON
    const json = await response.json();
    if (!json.ok) {
      throw new Error(json.message || `API Error: ${json.code}`);
    }
    return json;
  } catch (err: any) {
    console.error('API call failed', err);
    throw new Error(err.message || 'Lỗi kết nối máy chủ');
  }
}

// Generate unique ID for idempotency client-side
export function genId(prefix: string): string {
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '') + '-' +
    d.toTimeString().slice(0, 8).replace(/:/g, '');
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
}

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

// API Service with purely remote Google Apps Script calls
export class ApiService {
  static async login(email: string, pin: string): Promise<AuthSession> {
    const json = await fetchApi({ action: 'login', email: email.trim(), pin });
    const session: AuthSession = {
      token: json.data.token,
      expires_at: json.data.expires_at,
      actor: json.data.actor,
      room_ids: json.data.actor?.room_ids || [],
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

  static async bootstrap(teacherId: string): Promise<any> {
    const json = await fetchApi({ action: 'bootstrap', teacher_id: teacherId });
    return json.data;
  }

  static async borrow(actor: Actor, body: {
    client_request_id: string;
    room_id: string;
    subject_id: string;
    class_id: string;
    topic_id: string;
    lesson_id: string;
    items: Array<{ equipment_id: string; quantity: number }>;
    note?: string;
  }): Promise<BorrowRecord> {
    const json = await fetchApi({
      action: 'borrow',
      teacher_id: actor.teacher_id,
      ...body
    });
    return json.data;
  }

  static async returnBorrow(actor: Actor, body: {
    borrow_id: string;
    items?: Array<{
      borrow_item_id: string;
      returned_quantity?: number;
      incident_type?: IncidentType;
      incident_note?: string;
    }>;
    reason?: string;
  }): Promise<BorrowRecord> {
    const json = await fetchApi({
      action: 'return',
      teacher_id: actor.teacher_id,
      ...body
    });
    return json.data;
  }

  static async getMyDashboard(actor: Actor): Promise<any> {
    const json = await fetchApi({ action: 'my-dashboard', teacher_id: actor.teacher_id });
    return json.data;
  }
}
