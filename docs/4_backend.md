# Backend & Database

Toàn bộ dịch vụ backend của HR-Lite được xây dựng trên hệ sinh thái **Firebase**. Mã nguồn Backend nằm trong thư mục `functions/`.

## 1. Firebase Firestore (Database)

Cấu trúc Data được gom nhóm theo Workspace hoặc User nhằm bảo mật (Security Rules).
- **users:** Thông tin tài khoản, avatar.
- **workspaces:** Tổ chức, phòng ban.
- **workspaceMembers:** Quan hệ giữa User và Workspace, lưu trữ quyền (owner, admin, editor, viewer).
- **jobs (Mandates):** Các yêu cầu tuyển dụng, liên kết (`workspaceId`).
- **candidates:** Bể ứng viên (Talent Pool), CV đã được lưu.
- **applications:** Pipeline rễ nối giữa `candidateId` và `jobId`, lưu các quy trình tuyển dụng, thẻ trạng thái, điểm Match.
- **activities:** Lịch sử thao tác (Audit log/Activity Feed) giúp theo dõi lịch sử làm việc.

## 2. Cloud Functions (`functions/index.js`)

Đây là nơi chứa các API nặng hoặc cần giấu khóa API.
**Endpoint Chính:** `/api/parse-cv`
- **Nhiệm vụ:**
  1. Nhận file ứng viên được gửi lên từ client.
  2. Dùng thư viện `mammoth` hoặc `pdf-parse` (nếu có) để đọc text từ file văn bản.
  3. Gửi văn bản này sang **Google Gemini API** (`@google/genai`).
  4. Lấy cấu trúc JSON trả về (họ tên, email, kỹ năng, kinh nghiệm).
  5. Trả dữ liệu JSON sạch về cho Frontend tạo Candidate.

## 3. Bảo mật (Firebase Data Rules)
File `firestore.rules` quản lý nghiêm ngặt việc truy cập Data. Một Viewer không thể thực hiện thao tác xóa, và chỉ có Owner mới được xóa không gian làm việc (Workspace). Quyền quản trị thành viên cũng được chia tầng rõ ràng thông qua hàm helper `hasRole` và `isMember`.
