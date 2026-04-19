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

## 3. Quy ước định tuyến API (Routing)

Do sử dụng Cloud Functions Gen 2 kết hợp với Firebase Hosting, hệ thống áp dụng quy ước:
- **Tiền tố `/api`**: Bắt buộc phải có trong tất cả các định nghĩa route của Express (ví dụ: `app.get('/api/admin/users', ...)`).
- **Hosting Rewrite**: File `firebase.json` cấu hình chuyển hướng `/api/**` sang cloud function mà không loại bỏ tiền tố. Điều này đảm bảo tính tương thích khi chạy cả ở môi trường local và production (`hr.thanhnghiep.top`).

## 4. Bảo mật (Firebase Data Rules)
File `firestore.rules` quản lý nghiêm ngặt việc truy cập Data. Một Viewer không thể thực hiện thao tác xóa, và chỉ có Owner mới được xóa không gian làm việc (Workspace). Quyền quản trị thành viên cũng được chia tầng rõ ràng thông qua hàm helper `hasRole` và `isMember`.
