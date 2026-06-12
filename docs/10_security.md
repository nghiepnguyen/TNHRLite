# Security Overview

Tài liệu này mô tả toàn bộ kiến trúc bảo mật của HR-Lite, bao gồm các cơ chế phòng thủ ở từng tầng (Frontend, Backend, Database, Hosting).

## 1. Kiến trúc Bảo mật Tổng thể

```
┌─────────────────────────────────────────────────┐
│                  BROWSER                         │
│  HTTPS + Security Headers                        │
├─────────────────────────────────────────────────┤
│              FIREBASE HOSTING                    │
│  X-Frame-Options, X-Content-Type-Options,       │
│  Referrer-Policy, Permissions-Policy            │
├─────────────────────────────────────────────────┤
│             CLOUD FUNCTIONS                      │
│  authenticate → verifyAdmin/validateWorkspace   │
│  Rate Limiter → Input Validation → Sanitize     │
│  CORS Whitelist → escapeHtml → sanitizeError    │
│  Body limit (10mb) ← trust proxy                │
├─────────────────────────────────────────────────┤
│               FIRESTORE                          │
│  Security Rules (RBAC: owner/admin/editor/viewer)│
│  Usage Limits (transaction-based)                │
│  Admin-only writes for upgradeRequests/plan      │
├─────────────────────────────────────────────────┤
│            FIREBASE STORAGE                      │
│  Workspace-scoped rules (isMember check)         │
│  cvs/ws_{wsId}/{userId}/{file}                  │
└─────────────────────────────────────────────────┘
```

## 2. Authentication (Xác thực)

### 2.1. Firebase Authentication
- Sử dụng Firebase Auth Modular SDK.
- Hỗ trợ: Email/Password + Google Sign-In.
- **Email Verification bắt buộc**: `ProtectedRoute` redirect `/verify-email` nếu `emailVerified === false`.
- **Token refresh tự động**: Firebase SDK tự quản lý.

### 2.2. Server-Side Token Verification
- `functions/middleware/auth.js` — `authenticate()`:
  ```javascript
  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  req.user = decodedToken;
  ```
- Mọi request không có Bearer token hợp lệ → `401 Unauthorized`.

### 2.3. Admin Identification
- **Client-side**: `src/contexts/AuthProvider.jsx` — `isAdmin` flag dựa trên email khớp `VITE_ADMIN_EMAIL`.
- **Server-side**: `functions/middleware/auth.js` — `verifyAdmin()` kiểm tra email khớp `ADMIN_EMAIL` env var.
- **Route Guard**: `src/App.jsx` — `AdminRoute` HOC ngăn non-admin truy cập `/admin`.

## 3. Authorization (Phân quyền)

### 3.1. Frontend Route Guards
| Guard | File | Chức năng |
|-------|------|-----------|
| `ProtectedRoute` | `src/App.jsx` | Kiểm tra `currentUser` + `emailVerified` |
| `AdminRoute` | `src/App.jsx` | Kiểm tra `isAdmin` flag, trả về `403` nếu không đủ quyền |

### 3.2. Backend Middleware
| Middleware | File | Chức năng |
|-----------|------|-----------|
| `authenticate` | `functions/middleware/auth.js` | Verify Firebase ID Token |
| `verifyAdmin` | `functions/middleware/auth.js` | Kiểm tra admin email |
| `validateWorkspace(roles)` | `functions/middleware/auth.js` | Kiểm tra membership + role trong workspace |

### 3.3. Firestore Security Rules
File `firestore.rules` áp dụng RBAC chi tiết:
- **`isAuthenticated()`**: `request.auth != null`
- **`isMember(workspaceId)`**: Kiểm tra document `workspaceMembers/{uid}_{wsId}`
- **`hasRole(workspaceId, roles)`**: Kiểm tra role trong allowed list
- **Data scoping**: Mọi document jobs/candidates/applications yêu cầu `workspaceId` khớp với membership
- **Admin-only writes**: `upgradeRequests` chỉ cho phép `create/update/delete: if false` (chỉ qua Admin SDK)
- **Plan protection**: `workspaces.plan` và `workspaces.usage` không thể bị client modify trực tiếp

### 3.4. Firebase Storage Rules
File `storage.rules` áp dụng workspace-scoped access control:
- **`isMember(workspaceId)`** helper kiểm tra membership qua Firestore
- Path `cvs/ws_{workspaceId}/{userId}/{file}`: read/write yêu cầu `isMember(workspaceId)`
- Legacy path `cvs/{userId}/{file}`: chỉ owner được read/write
- Tất cả các path khác: deny

## 4. Input Validation & Output Sanitization

### 4.1. Client-Side
- Firebase Modular SDK với tham số được validate trước khi gọi API.
- Form validation trên UI trước khi submit.

### 4.2. Server-Side (Cloud Functions)
| Cơ chế | Mô tả |
|--------|-------|
| Required field check | Tất cả endpoint kiểm tra các trường bắt buộc (`workspaceId`, `jobData`, v.v.) |
| `escapeHtml()` | Escape HTML entities trong `/api/support` email template |
| `sanitizeError()` | Ẩn error details (stack trace, file paths) trong production |
| Workspace limit validation | Atomic transaction kiểm tra + increment counter |
| `express.json({ limit: '10mb' })` | Chống body parser DoS |

### 4.3. AI Prompt Security
- Prompt được chạy server-side, không expose API key cho client.
- JSON response từ Gemini được parse và validate trước khi trả về.

## 5. CORS & Network Security

### 5.1. CORS Configuration
- **Trước đây**: `origin: '*'` (cho phép mọi origin) — **đã sửa**.
- **Hiện tại**: Whitelist approach:
  - Production domains: `https://tnhrlite.com`, `https://*.web.app`, `https://*.firebaseapp.com`
  - Development: `http://localhost:*`, `http://127.0.0.1:*`
  - Server-to-server (no origin): Allowed
  - Origin không hợp lệ → log warning + reject

### 5.2. Security Headers (Firebase Hosting)
Cấu hình trong `firebase.json`:
| Header | Giá trị |
|--------|---------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-XSS-Protection` | `0` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

### 5.3. Trust Proxy
- `app.set('trust proxy', true)` được cấu hình trong `functions/index.js` để rate limiter nhận đúng client IP thay vì proxy IP.

## 6. Rate Limiting & Abuse Prevention

| Endpoint | Giới hạn | Cơ chế |
|----------|----------|--------|
| `/api/support` | 5 req/phút/IP | **Firestore-based rate limiter** (persistent across cold starts) |
| `/api/jobs` | Theo plan | `checkWorkspaceLimit()` |
| `/api/candidates` | Theo plan | `checkWorkspaceLimit()` |
| `/api/parse-cv` | Theo plan | `checkWorkspaceLimit()` (cvParsesThisMonth) |
| `/api/admin/*` | Admin-only | `verifyAdmin` middleware |
| Auth endpoints | Firebase managed | Firebase Auth rate limits |

> **Update (2026-06-12)**: Rate limiter chuyển từ in-memory `Map` sang **Firestore-based** với transaction để tránh reset khi cold start. Collection `rateLimits` được protected (no client access) và tự động cleanup mỗi giờ qua scheduled function `cleanupRateLimits`.

## 7. Data Protection

### 7.1. Secrets Management
- API keys được lưu trữ trong **Google Cloud Secret Manager**:
  - `GEMINI_API_KEY`
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
- Environment variables cho non-sensitive config: `ADMIN_EMAIL`, `BILLING_EMAIL`, `FRONTEND_URL`.

### 7.2. File Storage Security
- CV uploads scoped theo `cvs/ws_{workspaceId}/{userId}/{timestamp}_{filename}`.
- Storage rules (`storage.rules`) yêu cầu `isMember(workspaceId)` để read/write.
- Delete candidate → tự động xóa file CV khỏi Storage.

### 7.3. Data Minimization
- Client chỉ nhận dữ liệu thuộc workspace của mình (Firestore rules + `where` queries).
- Admin endpoints chỉ expose metadata, không expose nội dung CV/application chi tiết trừ khi được yêu cầu.

### 7.4. Cascading Deletes (Workspace Cleanup)
- **Cloud Function trigger `onWorkspaceDeleted`**: Khi workspace document bị xóa, tự động cascade-delete:
  - `jobs`, `candidates`, `applications`, `invites`, `activities` (theo `workspaceId`)
  - `workspaceMembers` (theo `workspaceId`)
  - `upgradeRequests` (theo `workspaceId`)
- Ngăn chặn dữ liệu mồ côi (orphaned data) khi owner xóa workspace.

## 8. Audit & Monitoring

### 8.1. Activity Logging
- `logActivity()` ghi mọi thao tác quan trọng (create job, update stage, etc.) vào collection `activities`.
- Mỗi log bao gồm: `actor` (uid, email, name), `action`, `entity` (type, id, name), `details`, `timestamp`.

### 8.2. Error Logging
- Cloud Functions log errors với `console.error()` — accessible qua Firebase Console > Functions > Logs.
- Error messages trong production response được sanitize (không leak implementation details).

### 8.3. CORS Violation Logging
- Origin không hợp lệ được ghi log: `console.warn('CORS blocked origin: ${origin}')`.

## 9. Dependency Security

| Scope | Status |
|-------|--------|
| Frontend (`npm audit`) | **0 vulnerabilities** ✅ |
| Functions (`npm audit`) | 8 moderate transitive (uuid in firebase-admin) |

## 10. Security Checklist

| # | Kiểm tra | Trạng thái |
|---|----------|------------|
| 1 | Email verification bắt buộc sau đăng ký | ✅ |
| 2 | Protected routes yêu cầu authentication | ✅ |
| 3 | Admin route có guard riêng (`AdminRoute`) | ✅ |
| 4 | Firestore rules RBAC (owner/admin/editor/viewer) | ✅ |
| 5 | Storage rules workspace-scoped | ✅ |
| 6 | API endpoints có authentication middleware | ✅ |
| 7 | CORS restricted về whitelist | ✅ |
| 8 | Security headers cấu hình trong hosting | ✅ |
| 9 | HTML escape cho user input trong email | ✅ |
| 10 | Error sanitization trong production | ✅ |
| 11 | Rate limiting cho public endpoints | ✅ |
| 12 | Workspace usage limits (transaction-based) | ✅ |
| 13 | Secrets trong Secret Manager | ✅ |
| 14 | Input validation trên tất cả endpoints | ✅ |
| 15 | Activity logging cho audit trail | ✅ |
| 16 | CV storage scoped + cleanup | ✅ |
| 17 | Body parser size limit (DoS protection) | ✅ |
| 18 | Trust proxy (accurate client IP) | ✅ |
| 19 | Firestore-based rate limiter (no cold-start reset) | ✅ |
| 20 | Cascade delete workspace (Cloud Function trigger) | ✅ |
| 21 | Content-Security-Policy header | ✅ |
| 22 | N+1 query optimization (getUserWorkspaces) | ✅ |
| 23 | Rate limit cleanup (scheduled function) | ✅ |

## 11. Residual Risks (Rủi ro tồn đọng)

| Risk | Severity | Mô tả | Mitigation |
|------|----------|-------|------------|
| UUID vulns | Low | 8 moderate CVEs trong transitive deps của `firebase-admin` ~14.x (uuid < 11.1.1) | Cần upgrade lên `firebase-admin@14.0.0` (breaking change). Hiện chỉ ảnh hưởng khi `buf` được cung cấp từ nguồn không tin cậy — không áp dụng trong use case hiện tại |
| Node engine mismatch | Low | Functions yêu cầu Node 22 nhưng local đang dùng Node 23.7.0 | Không ảnh hưởng production (Cloud Functions runtime độc lập). Nên đồng bộ version khi upgrade |

## 12. Cập nhật Lịch sử

| Ngày | Thay đổi |
|------|----------|
| 2026-06-12 | Security audit round 1 (Burp Suite): fix C-01 (AdminRoute), H-01 (CORS restriction), H-02 (admin route guard), M-01 (HTML escape), M-02 (error sanitization), M-03 (rate limiting), L-02 (security headers) |
| 2026-06-12 | Security audit round 2 (DevSecOps): fix S-01 (Storage IDOR), S-02 (body parser limit 10mb), S-03 (trust proxy); `npm audit fix` frontend to 0 vulns |
| 2026-06-12 | Thêm `docs/10_security.md` — tài liệu bảo mật tổng quan |
| 2026-06-12 | **Architecture audit (Senior Architect)**: (1) N+1 query fix → parallel `Promise.all` trong `getUserWorkspaces`/`subscribeToUserWorkspaces`; (2) Rate limiter upgrade → Firestore-based transaction persistent; (3) Cascade delete workspace → `onWorkspaceDeleted` Cloud Function trigger; (4) CSP header thêm vào `firebase.json`; (5) `rateLimits` collection protected; (6) `cleanupRateLimits` scheduled hourly |
