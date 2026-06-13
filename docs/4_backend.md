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
- **plans:** Cấu hình hạn mức theo gói (`free` / `pro` / `team`). Dùng làm nguồn tham chiếu cho `checkWorkspaceLimit()`; nếu thiếu document, fallback về hằng số mặc định.
- **rateLimits:** Collection lưu trạng thái rate limiting (Firestore-based, persistent). Tự động cleanup mỗi giờ qua scheduled function `cleanupRateLimits`.

Trên document **workspaces** bổ sung:
- `plan`: `free` | `pro` | `team`
- `usage`: `{ jobs, candidates, cvParsesThisMonth }`
- `usageResetAt`: timestamp reset hàng tháng (scheduled function)
- `planUpdatedAt`: timestamp cập nhật gói gần nhất
- `planNote`: ghi chú khi admin đổi gói

## 2. Cloud Functions (`functions/index.js`)

Đây là nơi chứa các API nặng hoặc cần giấu khóa API. Sử dụng Node.js 22 runtime.

### 2.1. Cấu trúc thư mục Functions
```
functions/
├── index.js              # Entry point: Express app + CORS + Security config
├── middleware/
│   └── auth.js           # authenticate, verifyAdmin, validateWorkspace
├── routes/
│   ├── api.js            # Endpoint công khai (parse-cv, support, jobs, candidates, upgrade-request)
│   └── admin.js          # Endpoint quản trị (users, workspaces, upgrade-requests)
└── utils/
    ├── ai.js             # Gemini AI integration
    ├── limits.js         # checkWorkspaceLimit() - atomic transaction
    ├── upgradeRequest.js # handleUpgradeRequest() - xử lý yêu cầu nâng cấp
    └── adminBilling.js   # Admin billing portal helpers
```

### 2.2. Endpoint API (qua `routes/api.js`)

**Endpoint Chính:** `/api/parse-cv`
- **Nhiệm vụ:**
  1. Nhận file ứng viên được gửi lên từ client.
  2. Dùng thư viện `mammoth` hoặc `pdf-parse` để đọc text từ file văn bản.
  3. Gửi văn bản này sang **Google Gemini API** (`@google/genai`).
  4. Lấy cấu trúc JSON trả về (họ tên, email, kỹ năng, kinh nghiệm).
  5. Trả dữ liệu JSON sạch về cho Frontend tạo Candidate.

**Endpoint Hỗ trợ:** `/api/send-support-email`
- **Nhiệm vụ:** Gửi yêu cầu hỗ trợ từ người dùng đến đội ngũ quản trị thông qua **Resend Service**. Tự động đính kèm thông tin context của User (UID, Email) để hỗ trợ nhanh hơn.

**Endpoint giới hạn sử dụng (qua API, không ghi `usage` từ client):**
- `POST /api/jobs` — tạo job sau khi `checkWorkspaceLimit(workspaceId, 'jobs')`
- `POST /api/candidates` — tạo candidate sau khi kiểm tra `candidates`
- `POST /api/parse-cv` — parse CV sau khi kiểm tra `cvParsesThisMonth`
- `POST /api/workspaces/:workspaceId/sync-usage` — đồng bộ lại counter từ dữ liệu thực tế quét collection jobs/candidates

**Endpoint nâng cấp gói:**
- `POST /api/upgrade-request` — thành viên workspace gửi yêu cầu lên `pro`/`team`; lưu Firestore `upgradeRequests`, email owner/admin workspace + billing (`BILLING_EMAIL` hoặc `ADMIN_EMAIL`), email xác nhận cho người gửi, thông báo in-app.

### 2.3. Endpoint Admin (qua `routes/admin.js`)

Middleware `verifyAdmin` — email khớp `ADMIN_EMAIL`:
- `GET /api/admin/users` — danh sách user + thống kê
- `DELETE /api/admin/users/:uid` — xóa user cascade
- `GET /api/admin/upgrade-requests?status=pending|approved|rejected|all`
- `PATCH /api/admin/upgrade-requests/:id` — `{ action: 'approve'|'reject', adminNote? }` (duyệt thì cập nhật `workspaces.plan`, gửi email approval)
- `GET /api/admin/workspaces` — danh sách workspace + plan/usage
- `PATCH /api/admin/workspaces/:workspaceId/plan` — `{ plan: 'free'|'pro'|'team', note? }`

### 2.4. Các module tiện ích mới

**`utils/limits.js` — checkWorkspaceLimit():**
- Sử dụng Firestore transaction atomic để đọc plan + usage, so sánh với hạn mức, và tăng counter nếu còn.
- Nếu vượt giới hạn, throw error với `code: 'LIMIT_EXCEEDED'`, `resource`, `limit`, `plan`.
- Fallback plans nếu document `plans/{planId}` không tồn tại:
  - `free`: 5 jobs, 50 candidates, 10 CV parses/tháng
  - `pro`: 50 jobs, 500 candidates, 100 CV parses/tháng
  - `team`: không giới hạn (-1)

**`utils/upgradeRequest.js` — handleUpgradeRequest():**
- Xác minh thành viên workspace, kiểm tra plan hiện tại, chỉ cho phép nâng cấp (không hạ cấp).
- Lưu `upgradeRequests` document với `status: 'pending'`.
- Notify in-app cho owner/admin workspace.
- Gửi email tới admin/billing email + email xác nhận cho người gửi qua Resend.
- Escape HTML input người dùng (`escapeHtml()`).

**`utils/adminBilling.js`:**
- `listUpgradeRequests()`: Lọc theo `status` query param.
- `reviewUpgradeRequest()`: Approve/reject + cập nhật `workspaces.plan` khi approve + gửi email.
- `listAdminWorkspaces()`: Danh sách workspace + plan/usage.
- `setWorkspacePlan()`: Đổi gói trực tiếp cho workspace.

### 2.5. Scheduled Functions
- **`syncUsageDaily`**: Đồng bộ counter usage từ số lượng documents thực tế (chạy hàng ngày).
- **`cleanupRateLimits`**: Dọn stale rate limit entries (chạy mỗi giờ).

### 2.6. Firestore Trigger Functions
- **`onWorkspaceDeleted`**: Khi workspace document bị xóa, tự động cascade-delete:
  - `jobs`, `candidates`, `applications`, `invites`, `activities` (theo `workspaceId`)
  - `workspaceMembers` (theo `workspaceId`)
  - `upgradeRequests` (theo `workspaceId`)

## 3. Quy ước định tuyến API (Routing)

Do sử dụng Cloud Functions Gen 2 kết hợp với Firebase Hosting, hệ thống áp dụng quy ước:
- **Tiền tố `/api`**: Bắt buộc phải có trong tất cả các định nghĩa route của Express (ví dụ: `app.get('/api/admin/users', ...)`).
- **Hosting Rewrite**: File `firebase.json` cấu hình chuyển hướng `/api/**` sang cloud function mà không loại bỏ tiền tố. Điều này đảm bảo tính tương thích khi chạy cả ở môi trường local và production (`recuiter.cvfit.pro`).

## 4. Bảo mật API (API Security)

Các biện pháp bảo mật được áp dụng trong tầng Cloud Functions để bảo vệ API trước các tấn công phổ biến:

### 4.1. Xác thực & Phân quyền (`functions/middleware/auth.js`)
- **`authenticate`**: Xác minh Firebase ID Token từ header `Authorization: Bearer <token>`. Mọi request không có token hợp lệ sẽ bị từ chối với `401`.
- **`verifyAdmin`**: Middleware kết hợp — xác thực trước, sau đó kiểm tra email khớp với `ADMIN_EMAIL`. Trả về `403` nếu không phải admin.
- **`validateWorkspace(roles)`**: Xác minh user là thành viên của workspace và có role phù hợp (`owner`, `admin`, `editor`, `viewer`). Trả về `403` nếu không đủ quyền.

### 4.2. Chống Injection & XSS (`functions/routes/api.js`)
- **`escapeHtml()`**: Escape tất cả input người dùng (`<`, `>`, `&`, `"`, `'`) trước khi chèn vào HTML email, ngăn chặn HTML injection qua form `/api/support` và `/api/upgrade-request`.
- **`sanitizeError()`**: Trong môi trường production, error responses chỉ trả về thông báo chung `"An internal server error occurred"`, không để lộ stack trace, đường dẫn file, hoặc version thư viện.
- **Input Validation**: Tất cả endpoint đều kiểm tra required fields trước khi xử lý.

### 4.3. Rate Limiting (`functions/routes/api.js`)
- **Firestore-based rate limiter** (persistent across cold starts):
  - Giới hạn: **5 requests / phút / IP** cho endpoint công khai `/api/support`
  - Sử dụng Firestore transaction để đọc/ghi atomic
  - Trả về `429 Too Many Requests` kèm `retryAfter` (giây)
  - Scheduled function `cleanupRateLimits` tự động dọn stale entries mỗi giờ
  - Collection `rateLimits` được bảo vệ — không cho client access
- Các endpoint authenticated được bảo vệ bởi Firebase Auth (token verification) và Workspace limits.

### 4.4. CORS Restriction (`functions/index.js`)
- **Whitelist approach**: Chỉ cho phép origin từ:
  - `https://recuiter.cvfit.pro` (custom domain)
  - `https://tn-hr-lite.web.app`, `https://tn-hr-lite.firebaseapp.com` (Firebase Hosting)
  - `http://localhost:*`, `http://127.0.0.1:*` (development)
- Request không có origin (server-to-server, mobile apps, Postman) vẫn được phép.
- Origin không hợp lệ bị từ chối với lỗi CORS và ghi log cảnh báo.

### 4.5. Bảo mật (Firebase Data Rules)
File `firestore.rules` quản lý nghiêm ngặt việc truy cập Data. Một Viewer không thể thực hiện thao tác xóa, và chỉ có Owner mới được xóa không gian làm việc (Workspace). Quyền quản trị thành viên cũng được chia tầng rõ ràng thông qua hàm helper `hasRole` và `isMember`.

- **`upgradeRequests`:** Thành viên workspace được **đọc**; **không** cho client `create`/`update`/`delete` — mọi ghi qua Cloud Functions.
- **`rateLimits`:** Không cho client access (read/write đều bị deny).
- **`usage` / `plan` trên workspace:** Client đọc được; tăng counter và đổi gói chỉ qua API (Admin SDK).

## 5. Biến môi trường Backend (Functions)

| Biến | Mô tả |
|------|--------|
| `GEMINI_API_KEY` | Parse CV / AI matching |
| `RESEND_API_KEY` | Gửi email (upgrade, support, billing) |
| `RESEND_FROM_EMAIL` | Địa chỉ gửi Resend |
| `ADMIN_EMAIL` | Email quản trị toàn hệ thống (`verifyAdmin`) |
| `BILLING_EMAIL` | Nhận bản sao yêu cầu nâng cấp (fallback: `ADMIN_EMAIL`) |

## 6. Gói dịch vụ & Hạn mức (Plans & Limits)

| Gói | Jobs | Candidates | CV Parses/Tháng |
|-----|------|------------|-----------------|
| **Free** | 5 | 50 | 10 |
| **Pro** | 50 | 500 | 100 |
| **Team** | Không giới hạn (-1) | Không giới hạn (-1) | Không giới hạn (-1) |

Hạn mức được kiểm tra qua `checkWorkspaceLimit()` sử dụng Firestore transaction atomic. Có thể thay đổi hạn mức bằng cách cập nhật document `plans/{planId}` trong Firestore mà không cần deploy lại code.

## 7. Scheduled Functions & Triggers

| Function | Schedule/Trigger | Mục đích |
|----------|-----------------|----------|
| `syncUsageDaily` | `every day 00:00` | Đồng bộ counter usage từ thực tế |
| `cleanupRateLimits` | `every 1 hours` | Dọn stale rate limit entries |
| `onWorkspaceDeleted` | Firestore trigger (`workspaces` onDelete) | Cascade delete dữ liệu workspace |