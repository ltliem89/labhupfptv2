# LAB HUB V2 — MASTER IMPLEMENTATION SPEC
## Bản cuối cùng để cải tiến hệ thống LabHup

> **Mục tiêu:** Cải tổ LabHup hiện tại thành hệ thống quản lý mượn/trả thiết bị phòng thí nghiệm chạy thực tế với Frontend Vercel + Apps Script API + Google Sheets + Google Drive.
>
> **Nguyên tắc:** Không tiếp tục sửa lẻ tẻ. Phải hoàn thành toàn bộ các hạng mục trong tài liệu này, sau đó chạy kiểm thử E2E bằng dữ liệu test riêng.

---

# 0. NGUYÊN TẮC THỰC THI BẮT BUỘC

1. Đây là **V2 production integration**, không phải mockup.
2. Không được giữ mock fallback khi API production lỗi.
3. Không được hard-code một Apps Script deployment URL khác với URL chính thức bên dưới.
4. Không được tự suy đoán dữ liệu từ frontend.
5. Mọi quyền, tồn kho, mượn, trả và ghi dữ liệu phải được backend xác thực.
6. Không xóa lịch sử giao dịch.
7. Không coi giao diện hiển thị đúng là hoàn thành. Chỉ PASS khi frontend → Apps Script → Google Sheets → giao dịch → tồn kho → trả → lịch sử/audit hoạt động.
8. Trước khi thay đổi kiến trúc, đọc và audit source hiện tại.
9. Không tạo thêm hệ thống database mới nếu không được yêu cầu.
10. Không dùng AI để tự chọn bài học, thiết bị hoặc lịch. Người dùng lựa chọn.
11. Không tạo các file spec phụ nếu không cần thiết. Tài liệu này là **master spec duy nhất** cho lần cải tiến V2.

---

# 1. KIẾN TRÚC CHÍNH THỨC

## 1.1 Frontend

- React + TypeScript hiện có.
- Vercel deploy.
- Mobile-first.
- PWA nếu source hiện tại đã hỗ trợ.
- Không thay đổi framework chỉ để thay đổi.

## 1.2 Backend

Google Apps Script Web App.

**Deployment URL chính thức:**

```text
https://script.google.com/macros/s/AKfycbz4RQ102X4gZ8FjxHa41HyI0b1rVk36cEjzBPMGN_rOVx5t2MGReygNC4hljuEwFjSzNw/exec
```

Frontend production phải dùng chính xác URL trên thông qua:

```text
VITE_APPS_SCRIPT_URL
```

Không được giữ URL deployment cũ làm fallback.

## 1.3 Database

Google Sheets.

Spreadsheet ID đã được cấu hình:

```text
10Gf0i8XbY3UBCOKmrbmVVCj1S_Bft1_NVjeDoaQD4t0
```

Apps Script editor:

```text
https://script.google.com/u/0/home/projects/1FgjtNFKZIyiThs4aPeB2Goi17qpr8UJvwxV6pej7gsKJGYDyzo4JgFtA/edit
```

> URL editor ở trên là project Apps Script, không phải Spreadsheet URL. Không được dùng editor URL như Spreadsheet URL.

## 1.4 File storage

Google Drive dùng cho:

- hình ảnh thiết bị
- file Excel import
- PDF report
- XLSX report
- backup
- file audit/export nếu cần

---

# 2. AUDIT SOURCE HIỆN TẠI — PHẢI SỬA

Repository:

```text
https://github.com/ltliem89/LabHup
```

Các vấn đề đã xác định trong source hiện tại:

## 2.1 API URL sai

`src/api.ts` hiện đang có deployment ID khác URL chính thức.

Phải sửa thành:

```text
VITE_APPS_SCRIPT_URL
=
https://script.google.com/macros/s/AKfycbz4RQ102X4gZ8FjxHa41HyI0b1rVk36cEjzBPMGN_rOVx5t2MGReygNC4hljuEwFjSzNw/exec
```

## 2.2 Mock fallback

`App.tsx` hiện khởi tạo:

- `ROOMS_DATA`
- `CHAPTERS_DATA`
- `LESSONS_DATA`
- `INITIAL_EQUIPMENT_DATA`

và khi API lỗi lại fallback về mock.

Phải bỏ hành vi này trong production.

Khi API lỗi:

```text
API ERROR
↓
ERROR STATE
↓
Retry
↓
Không dùng mock
↓
Không cho mutation
```

## 2.3 Lớp hiện tại sai

Source mock đang có:

```text
8A1
8A2
```

Dữ liệu test V2 phải dùng:

```text
8A
```

Không được tự đổi `8A` thành `8A1`.

## 2.4 Subject/class đang truyền tên thay ID

Hiện tại App có logic tương tự:

```text
subject_id = selectedSubject
class_id = selectedClass
```

Phải chuyển thành ID chuẩn.

## 2.5 Adapter đang hiển thị ID

`src/data/adapter.ts` hiện map receipt kiểu:

```text
roomName = room_id
subjectName = subject_id
className = class_id
chapterName = topic_id
lessonTitle = lesson_id
```

Phải resolve ID thành tên từ bootstrap/master data.

## 2.6 Inventory mock

`availableQuantity` trong mock không được coi là nguồn sự thật.

Production:

```text
available =
total_quantity
- active_borrow_quantity
- blocked_quantity
```

Backend tính.

## 2.7 Return

Frontend truyền `returnedItemIds` nhưng backend call hiện tại chỉ:

```text
return({ borrow_id })
```

V2 phải thống nhất full-return và partial-return.

## 2.8 Lesson mock special case

Không được giữ logic đặc biệt kiểu:

```text
selectedChapter.id === 'C1'
```

để hiển thị toàn bộ lesson.

Lesson phải lọc đúng:

```text
lesson.topic_id === selectedTopic.id
```

---

# 3. DATA MODEL

Các bảng chính:

```text
ROOMS
SUBJECTS
CLASSES
TOPICS
LESSONS
EQUIPMENT
TOPIC_EQUIPMENT
EQUIPMENT_REQUESTS
TEACHERS
TEACHER_ROOMS
BORROW_RECORDS
BORROW_ITEMS
IMPORT_BATCHES
IMPORT_ERRORS
REPORT_REQUESTS
DRIVE_FILES
AUDIT_LOG
CONFIG
```

---

# 4. PHÒNG

4 phòng chính:

| ID | Phòng | Icon |
|---|---|---|
| R01 | Phòng Vật lý | ⚡ |
| R02 | Phòng Hóa – Sinh | 🧪 |
| R03 | Phòng STEM | 🔬 |
| R04 | Phòng Robotics | 🤖 |

Không hiển thị phòng mà giáo viên không được cấp quyền.

Sau khi chọn một phòng:

```text
Phòng được chọn
↓
các phòng khác không còn chiếm không gian màn hình
↓
đi tiếp Subject + Class
```

---

# 5. FLOW NGƯỜI DÙNG

Flow chính:

```text
LOGIN
↓
ROOM
↓
SUBJECT + CLASS
↓
TOPIC / CHAPTER
↓
LESSON
↓
EQUIPMENT
↓
BORROW CONFIRM
↓
BORROW SUCCESS
↓
RECEIPT
↓
RETURN
```

## 5.1 Back button

Quay lại phải giữ state:

- phòng
- môn
- lớp
- chương
- bài
- thiết bị đã chọn

Không reset vô lý.

## 5.2 Không AI guessing

Không được:

- tự chọn bài
- tự chọn chương
- tự chọn thiết bị
- tự chọn số lượng
- tự suy đoán lớp
- tự suy đoán môn

Người dùng chọn.

---

# 6. SUBJECT + CLASS

Hai thông tin phải nằm cùng một bước.

Ví dụ:

```text
Môn:
Khoa học tự nhiên 8 – Vật lý

Lớp:
8A
```

Frontend dùng ID:

```text
subject_id
class_id
```

Không dùng display name làm ID.

---

# 7. TOPIC / CHAPTER

Topic là cấp phân loại thiết bị.

Cấu trúc:

```text
SUBJECT
↓
CLASS
↓
TOPIC
↓
LESSON
```

Một topic có nhiều lesson.

---

# 8. LESSON

Lesson là ngữ cảnh giảng dạy của một lần mượn.

Ví dụ test:

```text
Bài 14 – Thực hành xác định khối lượng riêng
```

Không lưu Lesson vào master equipment import.

---

# 9. EQUIPMENT — NGUYÊN TẮC CỐT LÕI

Thiết bị thuộc **inventory**.

Không thuộc riêng một lesson.

Mapping:

```text
TOPIC ↔ EQUIPMENT
```

thông qua:

```text
TOPIC_EQUIPMENT
```

Borrow record mới lưu:

```text
topic_id
lesson_id
```

---

# 10. EQUIPMENT MASTER

Schema nội bộ:

```text
equipment_id
equipment_code
equipment_name
room_id
total_quantity
blocked_quantity
status
image_url
created_by
created_at
updated_at
note
```

Status:

```text
ACTIVE
INACTIVE
MAINTENANCE
LOST
DAMAGED
```

Không dùng frontend để quyết định status tồn kho.

---

# 11. TOPIC_EQUIPMENT

Schema:

```text
mapping_id
topic_id
equipment_id
default_quantity
required
status
created_by
created_at
updated_at
note
```

Cho phép một thiết bị liên kết với nhiều topic.

---

# 12. EQUIPMENT IMPORT — CHỈ 6 CỘT

Excel chính thức:

| Cột | Bắt buộc |
|---|---|
| PHONG | Có |
| MON | Có |
| CHUONG | Có |
| TEN_THIET_BI | Có |
| SO_LUONG | Có |
| HINH_ANH | Không |

Không thêm:

```text
BAI
LESSON
ID
CODE
STATUS
CREATED_BY
CREATED_AT
```

Các trường hệ thống tự sinh.

---

# 13. HÌNH ẢNH

Excel:

```text
HINH_ANH
```

ưu tiên:

- URL ảnh
- Google Drive link

Web form:

- upload file
- camera trên điện thoại
- lưu lên Google Drive
- backend nhận URL sau upload

Không bắt buộc ảnh nhúng trực tiếp vào XLSX.

Nếu XLSX chứa embedded image mà hệ thống không hỗ trợ:

```text
WARNING
```

không được âm thầm làm hỏng toàn bộ import.

---

# 14. WEB FORM THÊM THIẾT BỊ

Form phải có đúng nghiệp vụ:

```text
Phòng
Môn
Chương
Tên thiết bị
Số lượng
Hình ảnh
```

Không có Lesson.

Teacher gửi:

```text
EQUIPMENT_REQUESTS
status = PENDING
```

Admin duyệt:

```text
PENDING
↓
APPROVED
↓
EQUIPMENT
↓
TOPIC_EQUIPMENT
```

Reject:

```text
PENDING
↓
REJECTED
```

có lý do.

---

# 15. IMPORT PIPELINE

Không import trực tiếp vào master.

Pipeline:

```text
UPLOAD EXCEL
↓
PARSE
↓
VALIDATE TEMPLATE
↓
NORMALIZE
↓
RESOLVE ROOM
↓
RESOLVE SUBJECT
↓
RESOLVE TOPIC
↓
CHECK DUPLICATE
↓
PREVIEW
↓
ADMIN CONFIRM
↓
COMMIT
↓
AUDIT
```

Trạng thái:

```text
PENDING
VALIDATED
APPROVED
ERROR
```

---

# 16. DUPLICATE RULE

Identity mặc định:

```text
ROOM + normalized EQUIPMENT_NAME
```

Ví dụ:

```text
Phòng Vật lý + Cân điện tử
```

Nếu đã có:

```text
không tạo bản ghi mới
```

Mặc định import update quantity theo quy tắc đã xác nhận.

Không âm thầm cộng dồn.

Nếu cần adjustment thực tế, dùng nghiệp vụ điều chỉnh kho riêng.

---

# 17. IMPORT KHÔNG DESTRUCTIVE

Nếu Excel không có thiết bị cũ:

```text
KHÔNG DELETE
```

Không tự xóa lịch sử.

Nếu cần ngưng dùng:

```text
ACTIVE → INACTIVE
```

do admin thực hiện.

---

# 18. INVENTORY ENGINE

Backend là nguồn sự thật.

Công thức:

```text
available =
total_quantity
- active_borrow_quantity
- blocked_quantity
```

Trong đó active borrow:

```text
BORROWED
```

Không tính:

```text
RETURNED
```

Không cho:

```text
available < 0
```

Zero:

```text
available = 0
```

thì frontend disable chọn/mượn.

---

# 19. ATOMIC BORROW

Borrow phải dùng:

```text
LockService
```

Trình tự:

```text
RECEIVE REQUEST
↓
AUTH
↓
VALIDATE
↓
IDEMPOTENCY CHECK
↓
LOCK
↓
RE-CALCULATE INVENTORY
↓
CHECK ALL ITEMS
↓
WRITE BORROW_RECORD
↓
WRITE BORROW_ITEMS
↓
AUDIT
↓
RELEASE LOCK
↓
RETURN RESULT
```

Nếu một thiết bị không đủ:

```text
KHÔNG tạo phiếu một phần
```

Trừ khi nghiệp vụ partial được thiết kế rõ ràng.

---

# 20. IDEMPOTENCY

Mỗi borrow request:

```text
client_request_id
```

Nếu cùng request được gửi lại:

```text
không tạo phiếu thứ hai
```

Trả kết quả của giao dịch cũ.

Receipt ID ổn định:

```text
BR-000001
BR-000002
...
```

---

# 21. BORROW_RECORDS

Tối thiểu:

```text
borrow_id
client_request_id
teacher_id
room_id
subject_id
class_id
topic_id
lesson_id
borrowed_at
returned_at
status
note
created_at
updated_at
```

Status:

```text
BORROWED
RETURNED
CANCELLED
```

Không xóa record.

---

# 22. BORROW_ITEMS

Tối thiểu:

```text
borrow_item_id
borrow_id
equipment_id
quantity
returned_quantity
incident_quantity
incident_type
incident_note
status
created_at
updated_at
```

---

# 23. RETURN

## Full return

Một nút:

```text
TRẢ TOÀN BỘ
```

Backend:

```text
returned_quantity = borrowed_quantity
status = RETURNED
returned_at = now
```

## Partial return

Cho phép:

```text
borrowed = 5
returned = 3
```

còn:

```text
2
```

đang mượn.

Không được chuyển phiếu thành RETURNED khi còn quantity chưa trả.

---

# 24. HƯ HỎNG / MẤT

Có thể ghi:

```text
incident_type
incident_quantity
incident_note
```

Ví dụ:

```text
DAMAGED
LOST
MISSING_PART
```

Số lượng incident không được tự động cộng lại vào available.

Admin xử lý inventory adjustment riêng.

---

# 25. OVERDUE

Không auto-return.

Nếu qua thời gian quy định:

```text
is_overdue = true
```

hoặc tính tại backend/report.

Phiếu qua ngày vẫn:

```text
BORROWED
```

cho đến khi thực sự trả.

---

# 26. DATE LOCK

Teacher:

- được sửa giao dịch trong ngày theo nghiệp vụ cho phép
- dữ liệu quá ngày bị khóa

Admin:

```text
UNLOCK
```

phải nhập:

```text
reason
```

và ghi Audit.

---

# 27. AUTHENTICATION

Login phải là backend authentication thật.

Không chấp nhận logic:

```text
email có @
password không rỗng
→ login
```

Backend xác định:

```text
teacher_id
email
display_name
role
status
permissions
```

Frontend không được tự quyết định role.

Không hard-code tài khoản admin trong frontend.

---

# 28. ROLE

## TEACHER

Được:

- xem phòng được cấp
- xem thiết bị
- mượn
- trả
- xem phiếu của mình
- xem lịch sử của mình
- báo cáo của mình
- đề xuất thêm thiết bị

Không được:

- sửa master tùy ý
- xóa equipment
- sửa teacher
- sửa permission
- unlock
- xem dữ liệu riêng của teacher khác

## ADMIN

Được:

- quản lý room
- subject
- class
- topic
- lesson
- equipment
- topic mapping
- teacher
- permission
- import
- approve/reject
- report
- audit
- unlock
- diagnostics

---

# 29. TEACHER ROOM PERMISSION

Bảng:

```text
TEACHER_ROOMS
```

Một teacher có thể được cấp nhiều room.

Frontend chỉ hiển thị room được backend trả về.

Không tin:

```text
room_id
```

do frontend tự gửi nếu teacher không có quyền.

---

# 30. MY LAB

Teacher có khu vực cá nhân:

```text
🏠 Tổng quan
📦 Đang mượn
📋 Lịch sử
📊 Báo cáo
➕ Thêm thiết bị
👤 Tài khoản
```

Dashboard:

```text
Tổng số phiếu
Đang mượn
Quá hạn
Trong tháng
```

Tất cả dữ liệu cá nhân phải lọc theo:

```text
authenticated teacher_id
```

không theo teacher_id do frontend gửi.

---

# 31. REPORT

Teacher:

```text
Tuần
Tháng
Năm
Khoảng thời gian tùy chọn
```

Có thể xuất:

```text
PDF
XLSX
PRINT
```

Admin filter:

```text
Teacher
Room
Subject
Class
Topic
Lesson
Equipment
Date
Status
```

---

# 32. API CONTRACT

API response thống nhất:

```json
{
  "ok": true,
  "code": "SUCCESS",
  "message": "OK",
  "data": {},
  "request_id": "REQ-..."
}
```

Error:

```json
{
  "ok": false,
  "code": "INSUFFICIENT_STOCK",
  "message": "Không đủ số lượng thiết bị",
  "data": null,
  "request_id": "REQ-..."
}
```

Các action tối thiểu:

```text
health
login
logout
bootstrap
inventory
my-borrows
borrow
return
equipment-requests
equipment-request-create
equipment-request-approve
equipment-request-reject
equipment-create
equipment-update
import-validate
import-approve
dashboard
report
upload
audit
diagnostics
```

---

# 33. BOOTSTRAP

Bootstrap phải trả dữ liệu cần thiết:

```text
rooms
subjects
classes
topics
lessons
permissions
inventory
current_user
```

Không trả toàn bộ dữ liệu nhạy cảm.

Topic/lesson phải có quan hệ ID rõ ràng.

---

# 34. API ERROR HANDLING

Các lỗi phải phân biệt:

```text
NETWORK_ERROR
API_ERROR
AUTH_REQUIRED
FORBIDDEN
INVALID_REQUEST
VALIDATION_ERROR
INSUFFICIENT_STOCK
DUPLICATE_REQUEST
NOT_FOUND
CONFLICT
SERVER_ERROR
```

Frontend phải hiển thị thông báo phù hợp.

Không dùng một câu:

```text
Có lỗi xảy ra
```

cho tất cả.

---

# 35. PRODUCTION / DEVELOPMENT MODE

Development:

```text
VITE_APP_MODE=development
```

có thể có test fixture nếu cần.

Production:

```text
VITE_APP_MODE=production
```

bắt buộc:

- API thật
- không mock fallback
- không fake login
- không hard-code inventory
- không fake receipt

---

# 36. DIAGNOSTICS ADMIN

Phải có màn hình:

```text
LAB HUB DIAGNOSTICS
```

Kiểm tra:

```text
[ ] API URL
[ ] API health
[ ] Authentication
[ ] Spreadsheet
[ ] CONFIG
[ ] ROOMS
[ ] SUBJECTS
[ ] CLASSES
[ ] TOPICS
[ ] LESSONS
[ ] EQUIPMENT
[ ] TOPIC_EQUIPMENT
[ ] TEACHERS
[ ] TEACHER_ROOMS
[ ] BORROW_RECORDS
[ ] BORROW_ITEMS
[ ] AUDIT_LOG
[ ] Drive
```

Mỗi test trả:

```text
PASS
FAIL
WARNING
```

kèm message.

---

# 37. TEST DATA — KHÔNG DÙNG MOCK FRONTEND

Tạo một batch test riêng:

```text
TEST-LABHUB-V2
```

Dữ liệu:

## Room

```text
R01 — Phòng Vật lý
```

## Subject

```text
SUB-KHTN8-PHY
Khoa học tự nhiên 8 – Vật lý
```

## Class

```text
CLS-8A
8A
```

## Topic

```text
TOP-003
Chương III – Khối lượng riêng và áp suất
```

## Lesson

```text
LES-014
Bài 14 – Thực hành xác định khối lượng riêng
```

## Equipment

```text
EQ001 — Cân điện tử — 5
EQ002 — Cân lò xo — 5
EQ003 — Bình chia độ 100 mL — 5
EQ004 — Bình chia độ 250 mL — 5
EQ005 — Cốc thủy tinh 250 mL — 10
EQ006 — Thước thẳng 30 cm — 10
EQ007 — Vật mẫu kim loại — 10
EQ008 — Khối nhựa hình hộp — 10
EQ009 — Ống đong có vạch chia — 5
EQ010 — Khay thí nghiệm — 10
```

Dữ liệu test phải có:

```text
test_batch_id = TEST-LABHUB-V2
```

để phân biệt dữ liệu test và dữ liệu thật.

---

# 38. TEST CASE 01 — BOOTSTRAP

Expected:

```text
API 200
ok = true
rooms > 0
subjects > 0
classes > 0
topics > 0
lessons > 0
inventory > 0
current_user hợp lệ
```

---

# 39. TEST CASE 02 — LOGIN

Test:

```text
teacher hợp lệ
password/PIN hợp lệ
```

Expected:

```text
authenticated
teacher_id đúng
role đúng
room permissions đúng
```

Test sai:

```text
sai password/PIN
```

Expected:

```text
AUTH_INVALID
```

Không login thành công.

---

# 40. TEST CASE 03 — ROOM PERMISSION

Teacher chỉ được thấy room được cấp.

Không được truy cập room bằng cách sửa URL/request.

Backend phải trả:

```text
FORBIDDEN
```

nếu không có quyền.

---

# 41. TEST CASE 04 — DATA NAVIGATION

Test:

```text
R01
↓
KHTN 8 – Vật lý
↓
8A
↓
Chương III
↓
Bài 14
```

Expected:

- đúng topic
- đúng lesson
- không hiển thị lesson của topic khác.

---

# 42. TEST CASE 05 — INVENTORY

Initial:

```text
EQ001 = 5
EQ003 = 5
EQ005 = 10
EQ006 = 10
EQ007 = 10
```

Frontend chỉ hiển thị dữ liệu backend.

---

# 43. TEST CASE 06 — BORROW

Mượn:

```text
EQ001 × 2
EQ003 × 2
EQ005 × 4
EQ006 × 4
EQ007 × 4
```

Tổng:

```text
16 đơn vị
```

Expected available:

```text
EQ001: 5 → 3
EQ003: 5 → 3
EQ005: 10 → 6
EQ006: 10 → 6
EQ007: 10 → 6
```

Expected:

```text
1 BORROW_RECORD
5 BORROW_ITEMS
1 receipt
```

---

# 44. TEST CASE 07 — RECEIPT

Receipt phải hiển thị:

```text
Mã phiếu
Người mượn
Phòng
Môn
Lớp
Chương
Bài
Thiết bị
Số lượng
Thời gian
Trạng thái
```

Không hiển thị ID thay cho tên.

---

# 45. TEST CASE 08 — RETURN

Trả toàn bộ.

Expected:

```text
BORROWED → RETURNED
returned_at != null
```

Inventory:

```text
EQ001: 3 → 5
EQ003: 3 → 5
EQ005: 6 → 10
EQ006: 6 → 10
EQ007: 6 → 10
```

---

# 46. TEST CASE 09 — PARTIAL RETURN

Mượn:

```text
EQ001 × 2
```

Trả:

```text
1
```

Expected:

```text
borrowed = 2
returned = 1
remaining = 1
status = BORROWED
```

Không được trả thành RETURNED.

---

# 47. TEST CASE 10 — ZERO STOCK

Nếu:

```text
available = 0
```

Expected:

```text
UI disabled
backend cũng reject
```

Không được tin frontend.

---

# 48. TEST CASE 11 — INSUFFICIENT STOCK

Ví dụ:

```text
available = 2
request = 3
```

Expected:

```text
INSUFFICIENT_STOCK
```

Không tạo:

```text
BORROW_RECORD
BORROW_ITEMS
```

một phần.

---

# 49. TEST CASE 12 — IDEMPOTENCY

Gửi cùng:

```text
client_request_id
```

hai lần.

Expected:

```text
1 borrow record duy nhất
```

---

# 50. TEST CASE 13 — CONCURRENT BORROW

Hai teacher cùng mượn số lượng sát tồn kho.

Expected:

```text
một request thành công
request còn lại được backend kiểm tra lại và reject nếu không còn đủ
```

Không âm kho.

---

# 51. TEST CASE 14 — API FAILURE

Tắt/sai API URL trong môi trường test.

Expected:

```text
connection error
retry button
```

Không được hiện dữ liệu mock.

Không được tạo giao dịch.

---

# 52. TEST CASE 15 — AUDIT

Sau borrow và return phải có:

```text
BORROW
RETURN
```

trong:

```text
AUDIT_LOG
```

Có:

```text
actor
timestamp
action
entity
entity_id
request_id
```

---

# 53. TEST CASE 16 — IMPORT

Upload Excel 6 cột:

```text
PHONG
MON
CHUONG
TEN_THIET_BI
SO_LUONG
HINH_ANH
```

Expected:

```text
parse
validate
preview
approve
commit
audit
```

---

# 54. TEST CASE 17 — IMPORT DUPLICATE

Upload lại:

```text
Cân điện tử
```

cùng room.

Expected:

```text
duplicate detected
```

không tạo equipment duplicate.

---

# 55. TEST CASE 18 — IMPORT MISSING ROW

Excel không có một equipment cũ.

Expected:

```text
equipment cũ không bị delete
```

---

# 56. TEST CASE 19 — EQUIPMENT WEB REQUEST

Teacher:

```text
Phòng Vật lý
KHTN 8 – Vật lý
Chương III
Cân kỹ thuật
2
```

Submit.

Expected:

```text
EQUIPMENT_REQUESTS
status=PENDING
```

Admin approve:

```text
EQUIPMENT
TOPIC_EQUIPMENT
```

được tạo.

---

# 57. TEST CASE 20 — SECURITY

Kiểm tra:

- teacher sửa teacher_id trong request
- teacher sửa room_id
- teacher gọi admin endpoint
- teacher gọi unlock
- teacher approve request
- teacher xem borrow của người khác

Expected:

```text
FORBIDDEN
```

hoặc:

```text
AUTH_REQUIRED
```

tùy trường hợp.

---

# 58. AUDIT LOG

Các action bắt buộc audit:

```text
LOGIN
LOGOUT
BORROW
RETURN
PARTIAL_RETURN
EQUIPMENT_CREATE
EQUIPMENT_UPDATE
EQUIPMENT_REQUEST
APPROVE
REJECT
IMPORT
UNLOCK
PERMISSION_CHANGE
```

---

# 59. GOOGLE SHEETS INTEGRITY

Không được dựa vào vị trí cột hard-code rải rác trong nhiều function.

Nên có schema/header constants tập trung.

Ví dụ:

```text
SCHEMAS = {
  ROOMS: [...],
  EQUIPMENT: [...],
  BORROW_RECORDS: [...],
  ...
}
```

Nếu thiếu sheet:

```text
diagnostics = FAIL
```

không ghi dữ liệu mù.

---

# 60. SETUP / MIGRATION

Backend phải có function setup/migration idempotent.

Ví dụ:

```text
setupLabHub()
```

Có thể chạy nhiều lần mà không phá dữ liệu.

Không tạo duplicate header/sheet.

Không xóa dữ liệu thật.

---

# 61. DRIVE

Tạo cấu trúc:

```text
LAB-HUB/
├── equipment-images/
├── imports/
├── reports/
├── backups/
└── audit-exports/
```

Không lưu file binary lớn vào Google Sheet.

---

# 62. UI EQUIPMENT

Màn hình equipment:

- một cột dọc
- tối đa không gian dọc
- touch target lớn
- search
- filter available
- ảnh nếu có
- tên
- mã
- total
- available
- quantity selector
- disabled khi hết hàng

Nút:

```text
XÁC NHẬN MƯỢN
```

fixed bottom.

Chỉ enable khi có ít nhất một item hợp lệ.

---

# 63. BORROW CONFIRM

Hiển thị đầy đủ:

```text
Phòng
Môn
Lớp
Chương
Bài
```

và danh sách:

```text
Thiết bị
Số lượng
```

Có:

```text
Ghi chú
```

Nút:

```text
XÁC NHẬN MƯỢN
```

Double-click/double-submit phải được chặn ở frontend và backend.

---

# 64. SUCCESS

Sau khi backend xác nhận:

```text
BORROW SUCCESS
```

hiển thị:

```text
Mã phiếu
Thời gian
Số thiết bị
```

Không hiển thị success trước khi server commit thành công.

---

# 65. LOADING / RETRY

Mọi mutation:

```text
loading
disable submit
server response
success/error
```

Không được tạo duplicate do người dùng bấm nhiều lần.

---

# 66. ERROR MESSAGE

Ví dụ:

```text
Không đủ Cân điện tử.
Tồn kho hiện tại: 1.
Bạn yêu cầu: 2.
```

Không chỉ:

```text
API Error
```

---

# 67. DATA CONSISTENCY

Sau borrow thành công, frontend phải:

```text
refresh inventory
refresh my-borrows
```

Không tự:

```text
available -= quantity
```

rồi coi đó là dữ liệu chính.

Server là source of truth.

---

# 68. CACHE

Nếu dùng cache:

- chỉ tối ưu đọc
- không dùng cache để quyết định stock
- sau borrow/return phải invalidate/refresh

---

# 69. PERFORMANCE

Apps Script + Sheets quy mô nhỏ:

```text
4–5 teachers
4 rooms
```

không cần kiến trúc phức tạp.

Ưu tiên:

- batch read
- batch write
- tránh `getRange()` từng cell trong loop
- tránh gọi Sheet nhiều lần trong một request
- LockService chỉ giữ trong transaction cần thiết

---

# 70. FRONTEND FILE RESPONSIBILITY

Giữ separation:

```text
src/api.ts
src/types.ts
src/data/adapter.ts
src/screens/*
```

Không để UI tự xử lý business rule inventory.

Không để component tự gọi Spreadsheet.

---

# 71. TYPESCRIPT TYPES

Types phải phản ánh backend thật.

Ví dụ:

```ts
interface ApiResponse<T> {
  ok: boolean;
  code: string;
  message: string;
  data: T;
  request_id?: string;
}
```

Không dùng `any` tràn lan cho dữ liệu quan trọng.

---

# 72. ADAPTER

Adapter chịu trách nhiệm:

```text
API raw data
↓
domain model
↓
UI model
```

Không để screen biết:

```text
room_id
topic_id
lesson_id
```

trừ khi cần submit.

---

# 73. RECEIPT MAPPING

Receipt phải resolve:

```text
room_id → room_name
subject_id → subject_name
class_id → class_name
topic_id → topic_name
lesson_id → lesson_name
equipment_id → equipment_name + code
```

---

# 74. DATA SEED

Không seed bằng:

```text
INITIAL_EQUIPMENT_DATA
```

trong production.

Seed test phải qua backend hoặc import pipeline.

---

# 75. NO FAKE SUCCESS

Các trạng thái sau chỉ được hiển thị sau server confirmation:

```text
Borrow success
Return success
Equipment created
Import approved
Request approved
```

---

# 76. NO SILENT FAILURE

Không được:

```text
catch
console.warn
continue
```

mà không báo cho người dùng nếu thao tác nghiệp vụ thất bại.

---

# 77. LOGGING

Backend tạo:

```text
request_id
```

cho từng request.

Frontend khi lỗi nên hiển thị:

```text
Mã yêu cầu: REQ-xxxx
```

để Admin tra Audit/Diagnostics.

---

# 78. ADMIN DIAGNOSTICS — TEST TRANSACTION

Admin có thể chạy test:

```text
[ TẠO DATA TEST ]
[ TEST MƯỢN ]
[ TEST TRẢ ]
[ KIỂM TRA INVENTORY ]
[ KIỂM TRA AUDIT ]
```

Dữ liệu test phải nhận diện bằng:

```text
TEST-LABHUB-V2
```

Có nút:

```text
XÓA DATA TEST
```

nhưng chỉ xóa đúng data có `test_batch_id`.

Không được xóa dữ liệu production.

---

# 79. DEFINITION OF DONE

V2 chỉ được coi là hoàn thành khi tất cả điều kiện sau PASS:

```text
[ ] Apps Script URL đúng
[ ] Spreadsheet ID đúng
[ ] Health API PASS
[ ] Bootstrap PASS
[ ] Login thật PASS
[ ] Permission PASS
[ ] Room PASS
[ ] Subject PASS
[ ] Class 8A PASS
[ ] Topic PASS
[ ] Lesson PASS
[ ] 10 equipment test PASS
[ ] Inventory server-side PASS
[ ] Borrow PASS
[ ] Receipt PASS
[ ] Inventory decrease PASS
[ ] Return PASS
[ ] Inventory restore PASS
[ ] Partial return PASS
[ ] Zero stock PASS
[ ] Insufficient stock PASS
[ ] Idempotency PASS
[ ] Concurrent borrow PASS
[ ] Audit PASS
[ ] Excel import PASS
[ ] Duplicate import PASS
[ ] Non-destructive import PASS
[ ] Equipment request PASS
[ ] Admin approval PASS
[ ] API failure không fallback mock
[ ] Production build PASS
[ ] Vercel deployment PASS
```

---

# 80. OUTPUT SAU KHI CẢI TIẾN

Sau khi hoàn thành, AI coding agent phải trả báo cáo:

```text
LAB HUB V2 IMPLEMENTATION REPORT

1. Files changed
2. Backend changes
3. Frontend changes
4. API contract
5. Google Sheets schema
6. Authentication
7. Inventory engine
8. Borrow engine
9. Return engine
10. Import engine
11. Diagnostics
12. Test data
13. E2E test results
14. Remaining warnings
15. Deployment configuration
```

Không được chỉ trả:

```text
Done.
```

---

# 81. QUY TẮC KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI

Không thay đổi các quyết định sau:

```text
Room → Subject + Class → Topic → Lesson → Equipment
```

```text
Equipment thuộc inventory
```

```text
Lesson không nằm trong equipment import
```

```text
Excel đúng 6 cột
```

```text
Google Sheets là storage
```

```text
Apps Script là backend
```

```text
Vercel là frontend
```

```text
Không Supabase
```

```text
Không AI guessing
```

```text
Không mock fallback production
```

```text
Không hard-code login
```

```text
Không frontend quyết định inventory
```

---

# 82. LỆNH THỰC THI CUỐI CÙNG CHO GOOGLE AI STUDIO / CODING AGENT

> Đọc toàn bộ repository LabHup hiện tại trước khi sửa.
>
> Thực hiện audit source hiện tại và đối chiếu từng mục trong tài liệu này.
>
> Sau đó triển khai **LAB HUB V2** theo đúng specification.
>
> Không chỉ sửa giao diện.
>
> Phải sửa đồng bộ frontend, API contract, Apps Script integration, authentication, authorization, Google Sheets schema, inventory calculation, borrow transaction, return transaction, import pipeline, equipment request, audit và diagnostics.
>
> Không sử dụng mock fallback trong production.
>
> Không hard-code dữ liệu inventory.
>
> Không fake login.
>
> Không dùng tên hiển thị thay ID khi gọi API.
>
> Không để frontend quyết định available quantity.
>
> Không tạo duplicate borrow khi request được gửi lại.
>
> Không cho phép race condition làm âm kho.
>
> Sau khi triển khai, tạo dữ liệu test `TEST-LABHUB-V2` gồm:
>
> - R01 — Phòng Vật lý
> - KHTN 8 – Vật lý
> - lớp 8A
> - Chương III – Khối lượng riêng và áp suất
> - Bài 14 – Thực hành xác định khối lượng riêng
> - 10 thiết bị theo danh sách trong specification.
>
> Sau đó chạy E2E:
>
> `LOGIN → ROOM → SUBJECT/CLASS → TOPIC → LESSON → EQUIPMENT → BORROW → RECEIPT → RETURN → INVENTORY RESTORE → HISTORY → AUDIT`
>
> Chạy thêm:
>
> `ZERO STOCK`
>
> `INSUFFICIENT STOCK`
>
> `IDEMPOTENCY`
>
> `CONCURRENT BORROW`
>
> `PARTIAL RETURN`
>
> `API FAILURE`
>
> `EXCEL IMPORT`
>
> `DUPLICATE IMPORT`
>
> `EQUIPMENT REQUEST`
>
> `ADMIN APPROVAL`
>
> Không được báo PASS nếu chưa kiểm chứng được từng bước.
>
> Nếu không thể kết nối trực tiếp Google Apps Script/Google Sheet do quyền hoặc môi trường, phải ghi rõ **NOT VERIFIED**, không được giả lập kết quả.
>
> Cuối cùng xuất `LAB HUB V2 IMPLEMENTATION REPORT` với từng test case PASS/FAIL/NOT VERIFIED và nguyên nhân.

---

# 83. TIÊU CHUẨN BÀN GIAO

Một bản bàn giao hợp lệ phải có:

```text
SOURCE
+
BACKEND
+
DATABASE SCHEMA
+
API
+
AUTH
+
INVENTORY
+
BORROW
+
RETURN
+
IMPORT
+
AUDIT
+
DIAGNOSTICS
+
TEST DATA
+
E2E TEST REPORT
```

Không coi một giao diện chạy trên localhost hoặc Vercel là hệ thống hoàn chỉnh nếu chưa chứng minh được đường dữ liệu thật.

---

# 84. TRẠNG THÁI V2

```text
SPECIFICATION: FINAL
IMPLEMENTATION: REQUIRED
REAL GOOGLE INTEGRATION: MUST VERIFY
TEST DATA: TEST-LABHUB-V2
PRODUCTION MOCK FALLBACK: FORBIDDEN
SOURCE OF TRUTH: GOOGLE SHEETS + APPS SCRIPT BUSINESS LOGIC
```
