import { BorrowRecord, Room, Subject, ClassRoom, Topic, Lesson, Equipment, BorrowItem } from '../types';

export interface UIDecoratedBorrowRecord extends BorrowRecord {
  room_name?: string;
  subject_name?: string;
  class_name?: string;
  topic_name?: string;
  lesson_name?: string;
  decorated_items?: Array<BorrowItem & { equipment_name?: string; equipment_code?: string; }>;
}

export const decorateReceipt = (
  record: BorrowRecord,
  rooms: Room[],
  subjects: Subject[],
  classes: ClassRoom[],
  topics: Topic[],
  lessons: Lesson[],
  equipment: Equipment[]
): UIDecoratedBorrowRecord => {
  const room = rooms.find(r => r.room_id === record.room_id);
  const subject = subjects.find(s => s.subject_id === record.subject_id);
  const cls = classes.find(c => c.class_id === record.class_id);
  const topic = topics.find(t => t.topic_id === record.topic_id);
  const lesson = lessons.find(l => l.lesson_id === record.lesson_id);

  const eqMap = new Map(equipment.map(e => [e.equipment_id, e]));

  const decoratedItems = (record.items || []).map(item => {
    const eq = eqMap.get(item.equipment_id);
    return {
      ...item,
      equipment_name: eq?.equipment_name,
      equipment_code: eq?.equipment_code,
    };
  });

  return {
    ...record,
    room_name: room?.room_name || record.room_id,
    subject_name: subject?.subject_name || record.subject_id,
    class_name: cls?.class_name || record.class_id,
    topic_name: topic?.topic_name || record.topic_id,
    lesson_name: lesson?.lesson_name || record.lesson_id,
    decorated_items: decoratedItems
  };
};
