import {
  Room,
  Subject,
  ClassRoom,
  Topic,
  Lesson,
  Equipment,
  TopicEquipment,
  Teacher,
  TeacherRoom,
  BorrowRecord,
  BorrowItem,
  EquipmentRequest,
  AuditLog,
} from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    room_id: 'R01',
    room_code: 'PHY-LAB-01',
    room_name: 'Phòng Vật lý',
    icon: '⚡',
    status: 'ACTIVE',
    note: 'Tầng 2, Dãy B - Trang bị bộ thí nghiệm cơ nhiệt điện quang'
  },
  {
    room_id: 'R02',
    room_code: 'CHEM-BIO-02',
    room_name: 'Phòng Hóa học – Sinh học',
    icon: '🧪',
    status: 'ACTIVE',
    note: 'Tầng 2, Dãy C - Trang bị tủ hút khí độc và bồn rửa chuyên dụng'
  },
  {
    room_id: 'R03',
    room_code: 'STEM-03',
    room_name: 'Phòng STEM',
    icon: '🔬',
    status: 'ACTIVE',
    note: 'Tầng 3, Dãy A - Không gian sáng chế, máy in 3D, laser cutter'
  },
  {
    room_id: 'R04',
    room_code: 'ROBO-04',
    room_name: 'Phòng Robotics',
    icon: '🤖',
    status: 'ACTIVE',
    note: 'Tầng 3, Dãy B - Sân thi đấu VEX, kit Arduino, robot tự hành'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  { subject_id: 'SUB-001', subject_code: 'KHTN', subject_name: 'Khoa học tự nhiên', status: 'ACTIVE' },
  { subject_id: 'SUB-002', subject_code: 'PHYS', subject_name: 'Vật lý THPT', status: 'ACTIVE' },
  { subject_id: 'SUB-003', subject_code: 'CHEM', subject_name: 'Hóa học THPT', status: 'ACTIVE' },
  { subject_id: 'SUB-004', subject_code: 'BIO', subject_name: 'Sinh học THPT', status: 'ACTIVE' },
  { subject_id: 'SUB-005', subject_code: 'STEM', subject_name: 'STEM & Công nghệ', status: 'ACTIVE' },
  { subject_id: 'SUB-006', subject_code: 'ROBO', subject_name: 'Robotics & AI', status: 'ACTIVE' },
];

export const INITIAL_CLASSES: ClassRoom[] = [
  { class_id: 'CLS-001', class_code: '6A1', class_name: 'Lớp 6A1', grade: 6, school_year: '2025-2026', status: 'ACTIVE' },
  { class_id: 'CLS-002', class_code: '7A1', class_name: 'Lớp 7A1', grade: 7, school_year: '2025-2026', status: 'ACTIVE' },
  { class_id: 'CLS-003', class_code: '8A2', class_name: 'Lớp 8A2', grade: 8, school_year: '2025-2026', status: 'ACTIVE' },
  { class_id: 'CLS-004', class_code: '9A1', class_name: 'Lớp 9A1', grade: 9, school_year: '2025-2026', status: 'ACTIVE' },
  { class_id: 'CLS-005', class_code: '10L1', class_name: 'Lớp 10 Chuyên Lý', grade: 10, school_year: '2025-2026', status: 'ACTIVE' },
  { class_id: 'CLS-006', class_code: '11H1', class_name: 'Lớp 11 Chuyên Hóa', grade: 11, school_year: '2025-2026', status: 'ACTIVE' },
  { class_id: 'CLS-007', class_code: 'ROB-CLB', class_name: 'CLB Robotics FPT', grade: 8, school_year: '2025-2026', status: 'ACTIVE' },
];

export const INITIAL_TOPICS: Topic[] = [
  // Subject KHTN (7A1)
  { topic_id: 'TOP-001', topic_code: 'KHTN7-C1', topic_name: 'Chương 1: Nguyên tử - Nguyên tố hóa học', subject_id: 'SUB-001', class_id: 'CLS-002', chapter_order: 1, status: 'ACTIVE' },
  { topic_id: 'TOP-002', topic_code: 'KHTN7-C2', topic_name: 'Chương 2: Tốc độ và Chuyển động', subject_id: 'SUB-001', class_id: 'CLS-002', chapter_order: 2, status: 'ACTIVE' },
  { topic_id: 'TOP-003', topic_code: 'KHTN7-C3', topic_name: 'Chương 3: Âm thanh và Ánh sáng', subject_id: 'SUB-001', class_id: 'CLS-002', chapter_order: 3, status: 'ACTIVE' },

  // Subject Vật lý 10
  { topic_id: 'TOP-004', topic_code: 'LY10-C1', topic_name: 'Chương 1: Động học chất điểm & Rơi tự do', subject_id: 'SUB-002', class_id: 'CLS-005', chapter_order: 1, status: 'ACTIVE' },
  { topic_id: 'TOP-005', topic_code: 'LY10-C2', topic_name: 'Chương 2: Động lực học & Định luật Newton', subject_id: 'SUB-002', class_id: 'CLS-005', chapter_order: 2, status: 'ACTIVE' },

  // Subject Hóa học 11
  { topic_id: 'TOP-006', topic_code: 'HOA11-C1', topic_name: 'Chương 1: Cân bằng hóa học & Chuẩn độ Axit-Bazo', subject_id: 'SUB-003', class_id: 'CLS-006', chapter_order: 1, status: 'ACTIVE' },
  { topic_id: 'TOP-007', topic_code: 'HOA11-C2', topic_name: 'Chương 2: Hóa học hữu cơ & Hydrocacbon', subject_id: 'SUB-003', class_id: 'CLS-006', chapter_order: 2, status: 'ACTIVE' },

  // Subject STEM (8A2)
  { topic_id: 'TOP-008', topic_code: 'STEM8-C1', topic_name: 'Chương 1: Cầu chịu lực & Kỹ thuật kết cấu', subject_id: 'SUB-005', class_id: 'CLS-003', chapter_order: 1, status: 'ACTIVE' },
  { topic_id: 'TOP-009', topic_code: 'STEM8-C2', topic_name: 'Chương 2: Hệ thống thủy lực khí nén', subject_id: 'SUB-005', class_id: 'CLS-003', chapter_order: 2, status: 'ACTIVE' },

  // Subject Robotics
  { topic_id: 'TOP-010', topic_code: 'ROBO-C1', topic_name: 'Chương 1: Vi điều khiển & Cảm biến dò đường', subject_id: 'SUB-006', class_id: 'CLS-007', chapter_order: 1, status: 'ACTIVE' },
  { topic_id: 'TOP-011', topic_code: 'ROBO-C2', topic_name: 'Chương 2: Cánh tay robot 4 bậc tự do', subject_id: 'SUB-006', class_id: 'CLS-007', chapter_order: 2, status: 'ACTIVE' },
];

export const INITIAL_LESSONS: Lesson[] = [
  // KHTN7-C2
  { lesson_id: 'LES-001', lesson_code: 'KHTN7-B1', lesson_name: 'Bài 8: Đo tốc độ chuyển động bằng đồng hồ bấm giây', topic_id: 'TOP-002', lesson_order: 1, status: 'ACTIVE' },
  { lesson_id: 'LES-002', lesson_code: 'KHTN7-B2', lesson_name: 'Bài 9: Đo tốc độ bằng cổng quang điện và đồng hồ hiện số', topic_id: 'TOP-002', lesson_order: 2, status: 'ACTIVE' },
  { lesson_id: 'LES-003', lesson_code: 'KHTN7-B3', lesson_name: 'Bài 10: Đồ thị quãng đường – thời gian', topic_id: 'TOP-002', lesson_order: 3, status: 'ACTIVE' },

  // KHTN7-C3
  { lesson_id: 'LES-004', lesson_code: 'KHTN7-B4', lesson_name: 'Bài 12: Ánh sáng, tia sáng và chùm sáng', topic_id: 'TOP-003', lesson_order: 1, status: 'ACTIVE' },
  { lesson_id: 'LES-005', lesson_code: 'KHTN7-B5', lesson_name: 'Bài 13: Định luật phản xạ ánh sáng', topic_id: 'TOP-003', lesson_order: 2, status: 'ACTIVE' },

  // LY10-C1
  { lesson_id: 'LES-006', lesson_code: 'LY10-B1', lesson_name: 'Bài 4: Chuyển động biến đổi đều và gia tốc', topic_id: 'TOP-004', lesson_order: 1, status: 'ACTIVE' },
  { lesson_id: 'LES-007', lesson_code: 'LY10-B2', lesson_name: 'Bài 5: Thí nghiệm thực hành đo gia tốc rơi tự do', topic_id: 'TOP-004', lesson_order: 2, status: 'ACTIVE' },

  // HOA11-C1
  { lesson_id: 'LES-008', lesson_code: 'HOA11-B1', lesson_name: 'Bài 2: Chuẩn độ dung dịch Axit HCl bằng NaOH', topic_id: 'TOP-006', lesson_order: 1, status: 'ACTIVE' },
  { lesson_id: 'LES-009', lesson_code: 'HOA11-B2', lesson_name: 'Bài 3: Đo pH môi trường bằng chất chỉ thị màu và pH kế', topic_id: 'TOP-006', lesson_order: 2, status: 'ACTIVE' },

  // STEM8-C1
  { lesson_id: 'LES-010', lesson_code: 'STEM8-B1', lesson_name: 'Dự án: Thiết kế và thử tải mô hình cầu giàn chịu lực', topic_id: 'TOP-008', lesson_order: 1, status: 'ACTIVE' },

  // ROBO-C1
  { lesson_id: 'LES-011', lesson_code: 'ROBO-B1', lesson_name: 'Lập trình Kit điều khiển xe robot dò line tự hành', topic_id: 'TOP-010', lesson_order: 1, status: 'ACTIVE' },
  { lesson_id: 'LES-012', lesson_code: 'ROBO-B2', lesson_name: 'Thực hành cảm biến siêu âm tránh vật cản HC-SR04', topic_id: 'TOP-010', lesson_order: 2, status: 'ACTIVE' },
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  // Room R01 (Vật lý)
  {
    equipment_id: 'EQ-000001',
    equipment_code: 'TB-000001',
    equipment_name: 'Đồng hồ bấm giây điện tử kỹ thuật số',
    category: 'Dụng cụ đo',
    room_id: 'R01',
    unit: 'chiếc',
    total_quantity: 15,
    blocked_quantity: 1,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=400&auto=format&fit=crop&q=80',
    note: 'Độ chính xác 0.01s, có dây đeo'
  },
  {
    equipment_id: 'EQ-000002',
    equipment_code: 'TB-000002',
    equipment_name: 'Cổng quang điện cảm biến hồng ngoại kèm giá đỡ',
    category: 'Cảm biến số',
    room_id: 'R01',
    unit: 'bộ',
    total_quantity: 10,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
    note: 'Tương thích đồng hồ hiện số MC-963'
  },
  {
    equipment_id: 'EQ-000003',
    equipment_code: 'TB-000003',
    equipment_name: 'Máng đệm khí và xe trượt đo gia tốc',
    category: 'Cơ học',
    room_id: 'R01',
    unit: 'bộ',
    total_quantity: 6,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&auto=format&fit=crop&q=80',
    note: 'Kèm bơm nén khí và cữ chặn'
  },
  {
    equipment_id: 'EQ-000004',
    equipment_code: 'TB-000004',
    equipment_name: 'Hộp nguồn laser quang học 3 tia',
    category: 'Quang học',
    room_id: 'R01',
    unit: 'hộp',
    total_quantity: 8,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&auto=format&fit=crop&q=80',
    note: 'Bước sóng 650nm, kèm lăng kính và bản thủy tinh'
  },
  {
    equipment_id: 'EQ-000005',
    equipment_code: 'TB-000005',
    equipment_name: 'Thước cuộn thép đo độ dài 5m',
    category: 'Dụng cụ đo',
    room_id: 'R01',
    unit: 'chiếc',
    total_quantity: 20,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=80',
    note: 'Vạch chia mm sắc nét'
  },

  // Room R02 (Hóa học – Sinh học)
  {
    equipment_id: 'EQ-000006',
    equipment_code: 'TB-000006',
    equipment_name: 'Buret chuẩn độ thủy tinh dung tích 25ml',
    category: 'Thủy tinh chuẩn độ',
    room_id: 'R02',
    unit: 'bộ',
    total_quantity: 12,
    blocked_quantity: 2,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&auto=format&fit=crop&q=80',
    note: 'Khóa PTFE chống kẹt'
  },
  {
    equipment_id: 'EQ-000007',
    equipment_code: 'TB-000007',
    equipment_name: 'Máy đo pH điện tử cầm tay pH-80',
    category: 'Thiết bị phân tích',
    room_id: 'R02',
    unit: 'chiếc',
    total_quantity: 8,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&auto=format&fit=crop&q=80',
    note: 'Tự động bù nhiệt độ ATC'
  },
  {
    equipment_id: 'EQ-000008',
    equipment_code: 'TB-000008',
    equipment_name: 'Kính hiển vi quang học 2 mắt phóng đại 1600x',
    category: 'Sinh học',
    room_id: 'R02',
    unit: 'chiếc',
    total_quantity: 10,
    blocked_quantity: 1,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80',
    note: 'Đèn LED ánh sáng lạnh, thị kính WF10x & WF16x'
  },
  {
    equipment_id: 'EQ-000009',
    equipment_code: 'TB-000009',
    equipment_name: 'Giá đỡ thí nghiệm kèm kẹp buret và vòng kiềng',
    category: 'Dụng cụ gá kẹp',
    room_id: 'R02',
    unit: 'bộ',
    total_quantity: 16,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80',
    note: 'Đế sắt nặng sơn tĩnh điện'
  },

  // Room R03 (Phòng STEM)
  {
    equipment_id: 'EQ-000010',
    equipment_code: 'TB-000010',
    equipment_name: 'Cảm biến lực kéo nén kỹ thuật số 50N',
    category: 'STEM Cảm biến',
    room_id: 'R03',
    unit: 'chiếc',
    total_quantity: 10,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=400&auto=format&fit=crop&q=80',
    note: 'Kết nối máy tính qua cổng Type-C'
  },
  {
    equipment_id: 'EQ-000011',
    equipment_code: 'TB-000011',
    equipment_name: 'Bộ dụng cụ chế tạo mô hình kỹ thuật STEM đa năng',
    category: 'Vật tư STEM',
    room_id: 'R03',
    unit: 'hộp',
    total_quantity: 15,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&auto=format&fit=crop&q=80',
    note: 'Gồm thanh liên kết, ốc vít M3, động cơ giảm tốc'
  },

  // Room R04 (Phòng Robotics)
  {
    equipment_id: 'EQ-000012',
    equipment_code: 'TB-000012',
    equipment_name: 'Kit xe Robot dò đường Arduino Maker Bot Pro',
    category: 'Robotics Kit',
    room_id: 'R04',
    unit: 'bộ',
    total_quantity: 12,
    blocked_quantity: 1,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&auto=format&fit=crop&q=80',
    note: 'Tích hợp Arduino Uno, mạch cầu L298N, module 5 mắt dò line'
  },
  {
    equipment_id: 'EQ-000013',
    equipment_code: 'TB-000013',
    equipment_name: 'Cảm biến khoảng cách siêu âm HC-SR04 kèm cáp',
    category: 'Linh kiện cảm biến',
    room_id: 'R04',
    unit: 'chiếc',
    total_quantity: 25,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    note: 'Khoảng cách đo 2cm - 400cm'
  },
  {
    equipment_id: 'EQ-000014',
    equipment_code: 'TB-000014',
    equipment_name: 'Pin sạc Li-ion 18650 kèm khay pin 2 cell & bộ sạc',
    category: 'Nguồn điện',
    room_id: 'R04',
    unit: 'bộ',
    total_quantity: 18,
    blocked_quantity: 0,
    status: 'ACTIVE',
    image_url: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=400&auto=format&fit=crop&q=80',
    note: 'Dung lượng 2600mAh x 2, có mạch bảo vệ xả'
  }
];

export const INITIAL_TOPIC_EQUIPMENT: TopicEquipment[] = [
  // TOP-002 (KHTN7-C2: Tốc độ và Chuyển động)
  { mapping_id: 'MAP-001', topic_id: 'TOP-002', equipment_id: 'EQ-000001', default_quantity: 2, required: 'YES', status: 'ACTIVE' },
  { mapping_id: 'MAP-002', topic_id: 'TOP-002', equipment_id: 'EQ-000002', default_quantity: 1, required: 'YES', status: 'ACTIVE' },
  { mapping_id: 'MAP-003', topic_id: 'TOP-002', equipment_id: 'EQ-000005', default_quantity: 1, required: 'NO', status: 'ACTIVE' },

  // TOP-003 (KHTN7-C3: Âm thanh và Ánh sáng)
  { mapping_id: 'MAP-004', topic_id: 'TOP-003', equipment_id: 'EQ-000004', default_quantity: 1, required: 'YES', status: 'ACTIVE' },

  // TOP-004 (LY10-C1: Động học & Rơi tự do)
  { mapping_id: 'MAP-005', topic_id: 'TOP-004', equipment_id: 'EQ-000001', default_quantity: 1, required: 'YES', status: 'ACTIVE' },
  { mapping_id: 'MAP-006', topic_id: 'TOP-004', equipment_id: 'EQ-000002', default_quantity: 2, required: 'YES', status: 'ACTIVE' },
  { mapping_id: 'MAP-007', topic_id: 'TOP-004', equipment_id: 'EQ-000003', default_quantity: 1, required: 'YES', status: 'ACTIVE' },

  // TOP-006 (HOA11-C1: Cân bằng & Chuẩn độ)
  { mapping_id: 'MAP-008', topic_id: 'TOP-006', equipment_id: 'EQ-000006', default_quantity: 2, required: 'YES', status: 'ACTIVE' },
  { mapping_id: 'MAP-009', topic_id: 'TOP-006', equipment_id: 'EQ-000007', default_quantity: 1, required: 'NO', status: 'ACTIVE' },
  { mapping_id: 'MAP-010', topic_id: 'TOP-006', equipment_id: 'EQ-000009', default_quantity: 2, required: 'YES', status: 'ACTIVE' },

  // TOP-008 (STEM8-C1: Cầu chịu lực)
  { mapping_id: 'MAP-011', topic_id: 'TOP-008', equipment_id: 'EQ-000010', default_quantity: 1, required: 'YES', status: 'ACTIVE' },
  { mapping_id: 'MAP-012', topic_id: 'TOP-008', equipment_id: 'EQ-000011', default_quantity: 1, required: 'YES', status: 'ACTIVE' },

  // TOP-010 (ROBO-C1: Vi điều khiển & Dò đường)
  { mapping_id: 'MAP-013', topic_id: 'TOP-010', equipment_id: 'EQ-000012', default_quantity: 1, required: 'YES', status: 'ACTIVE' },
  { mapping_id: 'MAP-014', topic_id: 'TOP-010', equipment_id: 'EQ-000013', default_quantity: 2, required: 'YES', status: 'ACTIVE' },
  { mapping_id: 'MAP-015', topic_id: 'TOP-010', equipment_id: 'EQ-000014', default_quantity: 1, required: 'YES', status: 'ACTIVE' },
];

export const INITIAL_TEACHERS: Teacher[] = [
  {
    teacher_id: 'TCR-001',
    email: 'admin@labhub.edu.vn',
    display_name: 'Ban Giám Hiệu / Quản Trị Viên',
    role: 'ADMIN',
    status: 'ACTIVE',
    room_ids: ['R01', 'R02', 'R03', 'R04'],
    note: 'Toàn quyền quản trị hệ thống'
  },
  {
    teacher_id: 'TCR-002',
    email: 'nam.nv@labhub.edu.vn',
    display_name: 'Thầy Nguyễn Văn Nam',
    role: 'TEACHER',
    status: 'ACTIVE',
    room_ids: ['R01', 'R03'],
    note: 'Tổ trưởng chuyên môn Vật lý & Trưởng nhóm STEM'
  },
  {
    teacher_id: 'TCR-003',
    email: 'mai.tt@labhub.edu.vn',
    display_name: 'Cô Trần Thị Mai',
    role: 'TEACHER',
    status: 'ACTIVE',
    room_ids: ['R02'],
    note: 'Giáo viên Hóa học - Phụ trách Lab Hóa Sinh'
  },
  {
    teacher_id: 'TCR-004',
    email: 'long.lh@labhub.edu.vn',
    display_name: 'Thầy Lê Hoàng Long',
    role: 'TEACHER',
    status: 'ACTIVE',
    room_ids: ['R04'],
    note: 'Phụ trách CLB Robotics và Phòng công nghệ'
  }
];

export const INITIAL_TEACHER_ROOMS: TeacherRoom[] = [
  { teacher_room_id: 'TR-001', teacher_id: 'TCR-001', room_id: 'R01', status: 'ACTIVE' },
  { teacher_room_id: 'TR-002', teacher_id: 'TCR-001', room_id: 'R02', status: 'ACTIVE' },
  { teacher_room_id: 'TR-003', teacher_id: 'TCR-001', room_id: 'R03', status: 'ACTIVE' },
  { teacher_room_id: 'TR-004', teacher_id: 'TCR-001', room_id: 'R04', status: 'ACTIVE' },
  { teacher_room_id: 'TR-005', teacher_id: 'TCR-002', room_id: 'R01', status: 'ACTIVE' },
  { teacher_room_id: 'TR-006', teacher_id: 'TCR-002', room_id: 'R03', status: 'ACTIVE' },
  { teacher_room_id: 'TR-007', teacher_id: 'TCR-003', room_id: 'R02', status: 'ACTIVE' },
  { teacher_room_id: 'TR-008', teacher_id: 'TCR-004', room_id: 'R04', status: 'ACTIVE' },
];

export const INITIAL_BORROW_RECORDS: BorrowRecord[] = [
  // 1. Overdue record for Thầy Nam (demonstrates overdue alert & past-day return rule)
  {
    borrow_id: 'BR-20260915-081200-A91F',
    teacher_id: 'TCR-002',
    receiver_id: 'TCR-002',
    room_id: 'R01',
    subject_id: 'SUB-001',
    class_id: 'CLS-002',
    topic_id: 'TOP-002',
    lesson_id: 'LES-002',
    borrowed_at: '2026-09-15T08:15:00.000Z',
    status: 'BORROWED',
    client_request_id: 'req-uuid-seed-001',
    edit_state: 'LOCKED',
    note: 'Dạy tiết 2 lớp 7A1 - Thực hành đo tốc độ',
    created_at: '2026-09-15T08:15:00.000Z',
    updated_at: '2026-09-15T08:15:00.000Z',
  },
  // 2. Active record borrowed today by Thầy Nam
  {
    borrow_id: 'BR-20260917-140000-B24C',
    teacher_id: 'TCR-002',
    receiver_id: 'TCR-002',
    room_id: 'R03',
    subject_id: 'SUB-005',
    class_id: 'CLS-003',
    topic_id: 'TOP-008',
    lesson_id: 'LES-010',
    borrowed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'BORROWED',
    client_request_id: 'req-uuid-seed-002',
    edit_state: 'EDITABLE_TODAY',
    note: 'Tiết 4 lớp 8A2 thử tải mô hình cầu',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  // 3. Completed record
  {
    borrow_id: 'BR-20260910-093000-C56D',
    teacher_id: 'TCR-002',
    receiver_id: 'TCR-002',
    room_id: 'R01',
    subject_id: 'SUB-002',
    class_id: 'CLS-005',
    topic_id: 'TOP-004',
    lesson_id: 'LES-006',
    borrowed_at: '2026-09-10T09:30:00.000Z',
    returned_at: '2026-09-10T11:15:00.000Z',
    status: 'RETURNED',
    client_request_id: 'req-uuid-seed-003',
    edit_state: 'LOCKED',
    note: 'Đã hoàn trả đầy đủ sau tiết học',
    created_at: '2026-09-10T09:30:00.000Z',
    updated_at: '2026-09-10T11:15:00.000Z',
  }
];

export const INITIAL_BORROW_ITEMS: BorrowItem[] = [
  // Items for slip 1 (R01, BR-20260915-081200-A91F)
  {
    borrow_item_id: 'BI-001',
    borrow_id: 'BR-20260915-081200-A91F',
    equipment_id: 'EQ-000001', // Đồng hồ bấm giây
    quantity: 3,
    returned_quantity: 0,
    incident_type: 'NORMAL',
    incident_note: '',
    created_at: '2026-09-15T08:15:00.000Z',
    updated_at: '2026-09-15T08:15:00.000Z',
  },
  {
    borrow_item_id: 'BI-002',
    borrow_id: 'BR-20260915-081200-A91F',
    equipment_id: 'EQ-000002', // Cổng quang điện
    quantity: 2,
    returned_quantity: 0,
    incident_type: 'NORMAL',
    incident_note: '',
    created_at: '2026-09-15T08:15:00.000Z',
    updated_at: '2026-09-15T08:15:00.000Z',
  },

  // Items for slip 2 (R03, BR-20260917-140000-B24C)
  {
    borrow_item_id: 'BI-003',
    borrow_id: 'BR-20260917-140000-B24C',
    equipment_id: 'EQ-000010', // Cảm biến lực kéo nén 50N
    quantity: 2,
    returned_quantity: 0,
    incident_type: 'NORMAL',
    incident_note: '',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    borrow_item_id: 'BI-004',
    borrow_id: 'BR-20260917-140000-B24C',
    equipment_id: 'EQ-000011', // Bộ mô hình kỹ thuật STEM
    quantity: 2,
    returned_quantity: 0,
    incident_type: 'NORMAL',
    incident_note: '',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },

  // Items for slip 3 (Returned)
  {
    borrow_item_id: 'BI-005',
    borrow_id: 'BR-20260910-093000-C56D',
    equipment_id: 'EQ-000001',
    quantity: 4,
    returned_quantity: 4,
    incident_type: 'NORMAL',
    incident_note: 'Hoàn trả nguyên vẹn',
    created_at: '2026-09-10T09:30:00.000Z',
    updated_at: '2026-09-10T11:15:00.000Z',
  }
];

export const INITIAL_EQUIPMENT_REQUESTS: EquipmentRequest[] = [
  {
    request_id: 'ER-20260916-1000-01',
    requested_by: 'TCR-002',
    requester_name: 'Thầy Nguyễn Văn Nam',
    room_id: 'R01',
    subject_id: 'SUB-001',
    class_id: 'CLS-002',
    topic_id: 'TOP-003',
    equipment_name: 'Thấu kính phân kì tiêu cự -10cm viền hợp kim',
    quantity: 6,
    image_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=400&auto=format&fit=crop&q=80',
    status: 'PENDING',
    created_at: '2026-09-16T10:00:00.000Z',
    updated_at: '2026-09-16T10:00:00.000Z',
    note: 'Cần bổ sung gấp cho nhóm thực hành quang học lớp 7A1'
  },
  {
    request_id: 'ER-20260914-1530-02',
    requested_by: 'TCR-004',
    requester_name: 'Thầy Lê Hoàng Long',
    room_id: 'R04',
    subject_id: 'SUB-006',
    class_id: 'CLS-007',
    topic_id: 'TOP-010',
    equipment_name: 'Mạch nạp ESP32-WROOM-32 kèm dây micro USB',
    quantity: 10,
    image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
    status: 'APPROVED',
    approved_by: 'TCR-001',
    approved_at: '2026-09-15T09:00:00.000Z',
    created_at: '2026-09-14T15:30:00.000Z',
    updated_at: '2026-09-15T09:00:00.000Z',
    note: 'Trang bị cho đội thi Robocon FPT 2026'
  }
];

export const INITIAL_AUDIT_LOG: AuditLog[] = [
  {
    audit_id: 'AUD-001',
    event_at: '2026-09-15T08:15:00.000Z',
    actor_id: 'TCR-002',
    actor_role: 'TEACHER',
    action: 'BORROW',
    entity_type: 'BORROW_RECORD',
    entity_id: 'BR-20260915-081200-A91F',
    request_id: 'req-seed-01',
    before_json: '',
    after_json: '{"borrow_id":"BR-20260915-081200-A91F","room_id":"R01"}',
    reason: 'Mượn tiết 2'
  },
  {
    audit_id: 'AUD-002',
    event_at: '2026-09-15T09:00:00.000Z',
    actor_id: 'TCR-001',
    actor_role: 'ADMIN',
    action: 'EQUIPMENT_REQUEST_APPROVE',
    entity_type: 'EQUIPMENT_REQUESTS',
    entity_id: 'ER-20260914-1530-02',
    request_id: 'req-seed-02',
    before_json: '{"status":"PENDING"}',
    after_json: '{"status":"APPROVED"}',
    reason: 'Duyệt theo đề xuất tổ trưởng'
  }
];
