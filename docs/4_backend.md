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
- **upgradeRequests:** Yêu cầu nâng cấp gói workspace (`pending` / `approved` / `rejected`). Client chỉ đọc; ghi qua Admin SDK (API).
- **plans:** (tuỳ chọn) Cấu hình hạn mức theo gói; mặc định dùng hằng số trong `functions/utils/limits.js`.

Trên document **workspaces** bổ sung:
- `plan`: `free` | `pro` | `team`
- `usage`: `{ jobs, candidates, cvParsesThisMonth }`
- `usageResetAt`: timestamp reset hàng tháng (scheduled function)

## 2. Cloud Functions (`functions/index.js`)

Đây là nơi chứa các API nặng hoặc cần giấu khóa API.
**Endpoint Chính:** `/api/parse-cv`
- **Nhiệm vụ:**
  1. Nhận file ứng viên được gửi lên từ client.
  2. Dùng thư viện `mammoth` hoặc `pdf-parse` (nếu có) để đọc text từ file văn bản.
  3. Gửi văn bản này sang **Google Gemini API** (`@google/genai`).
  4. Lấy cấu trúc JSON trả về (họ tên, email, kỹ năng, kinh nghiệm).
  5. Trả dữ liệu JSON sạch về cho Frontend tạo Candidate.
**Endpoint Mới:** `/api/send-support-email`
- **Nhiệm vụ:** Gửi yêu cầu hỗ trợ từ người dùng đến đội ngũ quản trị thông qua **Resend Service**. Tự động đính kèm thông tin context của User (UID, Email) để hỗ trợ nhanh hơn.
**Endpoint giới hạn sử dụng (qua API, không ghi `usage` từ client):**
- `POST /api/jobs` — tạo job sau khi `checkWorkspaceLimit(workspaceId, 'jobs')`
- `POST /api/candidates` — tạo candidate sau khi kiểm tra `candidates`
- `POST /api/parse-cv` — parse CV sau khi kiểm tra `cvParsesThisMonth`
- `POST /api/workspaces/:workspaceId/sync-usage` — đồng bộ lại counter từ dữ liệu thực tế

**Endpoint nâng cấp gói:**
- `POST /api/upgrade-request` — thành viên workspace gửi yêu cầu lên `pro`/`team`; lưu Firestore, email owner/admin + billing (`BILLING_EMAIL` hoặc `ADMIN_EMAIL`), email xác nhận cho người gửi, thông báo in-app.

**Endpoint Admin:** `/api/admin/*` (middleware `verifyAdmin` — email khớp `ADMIN_EMAIL`)
- `GET /api/admin/users` — danh sách user + thống kê
- `DELETE /api/admin/users/:uid` — xóa user cascade
- `GET /api/admin/upgrade-requests?status=pending|approved|rejected|all`
- `PATCH /api/admin/upgrade-requests/:id` — `{ action: 'approve'|'reject', adminNote? }` (duyệt thì cập nhật `workspaces.plan`)
- `GET /api/admin/workspaces` — danh sách workspace + plan/usage
- `PATCH /api/admin/workspaces/:workspaceId/plan` — `{ plan: 'free'|'pro'|'team', note? }`

## 3. Quy ước định tuyến API (Routing)

Do sử dụng Cloud Functions Gen 2 kết hợp với Firebase Hosting, hệ thống áp dụng quy ước:
- **Tiền tố `/api`**: Bắt buộc phải có trong tất cả các định nghĩa route của Express (ví dụ: `app.get('/api/admin/users', ...)`).
- **Hosting Rewrite**: File `firebase.json` cấu hình chuyển hướng `/api/**` sang cloud function mà không loại bỏ tiền tố. Điều này đảm bảo tính tương thích khi chạy cả ở môi trường local và production (`hr.thanhnghiep.top`).

## 4. Bảo mật (Firebase Data Rules)
File `firestore.rules` quản lý nghiêm ngặt việc truy cập Data. Một Viewer không thể thực hiện thao tác xóa, và chỉ có Owner mới được xóa không gian làm việc (Workspace). Quyền quản trị thành viên cũng được chia tầng rõ ràng thông qua hàm helper `hasRole` và `isMember`.

- **`upgradeRequests`:** Thành viên workspace được **đọc**; **không** cho client `create`/`update`/`delete` — mọi ghi qua Cloud Functions.
- **`usage` / `plan` trên workspace:** Client đọc được; tăng counter và đổi gói chỉ qua API (Admin SDK).

## 5. Biến môi trường Backend (Functions)

| Biến | Mô tả |
|------|--------|
| `GEMINI_API_KEY` | Parse CV / AI matching |
| `RESEND_API_KEY` | Gửi email (upgrade, support, billing) |
| `RESEND_FROM_EMAIL` | Địa chỉ gửi Resend |
| `ADMIN_EMAIL` | Email quản trị toàn hệ thống (`verifyAdmin`) |
| `BILLING_EMAIL` | Nhận bản sao yêu cầu nâng cấp (fallback: `ADMIN_EMAIL`) |
