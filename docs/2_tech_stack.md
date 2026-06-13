# Technology Stack

HR-Lite sử dụng các công nghệ hiện đại, kết hợp kiến trúc Serverless (phi máy chủ) để tối ưu hóa chi phí vận hành và tốc độ phát triển.

## Tổng quan Kiến trúc

- **Kiến trúc:** CSR (Client-Side Rendering) kết hợp với Serverless Backend (Cloud Functions).
- **Backend-as-a-Service (BaaS):** Firebase.
- **AI Service:** Google Gemini AI.
- **Email Service:** Resend (via Cloud Functions).
- **Knowledge Engine:** Graphify (Architecture Mapping).
- **CI/CD:** GitHub Actions — tự động build & deploy lên Firebase Hosting + Cloud Functions.

## Các công nghệ cốt lõi

1. **Frontend:** React 19, Vite 8.x, React Router v7.
2. **State Management:** React Context API (ThemeContext, AuthContext, ToastContext, WorkspaceContext).
3. **Database:** Firestore (NoSQL, Real-time Document Database) với Security Rules RBAC.
4. **Storage:** Firebase Cloud Storage (Lưu trữ ảnh, CV dạng PDF, DOCX) — workspace-scoped.
5. **Authentication:** Firebase Auth (Email/Password, Google OAuth với signInWithRedirect fallback khi popup bị chặn).
6. **Backend/API:** Firebase Cloud Functions (Node.js 22).
   - **Middleware:** `authenticate`, `verifyAdmin`, `validateWorkspace(roles)`.
   - **Utilities:** `checkWorkspaceLimit`, `handleUpgradeRequest`, `adminBilling`.
7. **Email Notification:** Resend API integration (templates cho jobs, candidates, pipeline, upgrade requests).
8. **CI/CD:** GitHub Actions workflow (`.github/workflows/deploy.yml`) với `checkout@v5`, `setup-node@v5`.
9. **SEO:** `react-helmet-async` cho dynamic meta tags, structured data (JSON-LD), `hreflang`.
10. **Documentation & Graph:** Graphify CLI.

## Cấu trúc hạ tầng triển khai

| Layer | Công nghệ | Mục đích |
|-------|-----------|----------|
| Hosting | Firebase Hosting (CDN toàn cầu) | Serve SPA tĩnh + Security Headers |
| API | Firebase Cloud Functions (Node.js 22) | Endpoint `/api/*` |
| Database | Firestore (NoSQL) | Dữ liệu thời gian thực |
| Storage | Firebase Cloud Storage | CV files (PDF/DOCX), images |
| Auth | Firebase Authentication | Email/Password + Google OAuth |
| CI/CD | GitHub Actions | Auto build & deploy |
| Email | Resend | Transactional emails |
| AI | Google Gemini API | CV parsing, AI matching |
| Secrets | Google Cloud Secret Manager | API keys (Gemini, Resend) |

## Môi trường Runtime

| Môi trường | Node.js | Ghi chú |
|------------|---------|---------|
| Cloud Functions (Production) | Node.js 22 | Runtime được Firebase quản lý |
| GitHub Actions CI | Node.js 22 | Cấu hình trong `deploy.yml` |
| Local Development | Node.js 22+ | Khuyến nghị đồng bộ với production |
| GitHub Actions Legacy | Node.js 24 | `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` |

Với stack này, hệ thống gần như không cần quản lý máy chủ vật lý, khả năng scale (mở rộng) dễ dàng thông qua hệ sinh thái của Google Cloud. CI/CD pipeline đảm bảo mọi thay đổi được tự động triển khai lên production ngay khi merge vào `main`.