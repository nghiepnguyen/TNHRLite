# Frontend Documentation

## Stack Kỹ thuật chi tiết
- **Core:** Khung làm việc là **React 19**, được đóng gói siêu tốc bằng **Vite 8.x**.
- **Routing:** **React Router v7** đảm nhiệm việc phân luồng và bảo vệ các routes (ví dụ: yêu cầu Login cho `/dashboard`).
- **Styling:** Sử dụng thuần **Vanilla CSS** với hệ thống Design Tokens đồng bộ (CSS Variables). Giao diện tối ưu hóa khả năng phản hồi bằng hệ thống **Loading Skeleton** và hiệu ứng **Entrance Animation** (slideInUp) cho thẻ (cards).
- **Icon:** Thư viện **Material Icons** (Google Material Symbols) kết hợp với Lucide React ở một số phân hệ cũ.
- **SEO:** **react-helmet-async** cho dynamic meta tags, Open Graph, Twitter Cards.
- **Email Templates:** `src/services/emailTemplates.js` — HTML email template chuyên nghiệp cho job mới, candidate mới, pipeline update.

## Cấu trúc thư mục Frontend (`src/`)

- `components/`: Chứa các thành phần UI dùng chung, được tái sử dụng qua nhiều trang.
  - `components/common/ErrorBoundary.jsx`: Error boundary toàn cục — bắt lỗi React rendering.
  - `components/common/SEO.jsx`: Component SEO wrapper với `react-helmet-async`.
  - `components/landing/LandingCTA.jsx`: Kêu gọi hành động trên landing page (premium redesign).
  - `components/landing/LandingNavbar.jsx`: Thanh điều hướng thông minh với trạng thái scroll.
  - `components/landing/LandingFooter.jsx`: Footer đầy đủ liên kết và pháp lý.
  - `components/UpgradeModal.jsx` + `UsageMeter.jsx`: Modal so sánh gói / gửi yêu cầu nâng cấp; thanh hiển thị mức dùng (jobs, candidates, CV/tháng).
  - `components/NotificationBell.jsx`: Chuông thông báo với badge unread count + Review Modal cho invites.
  - `components/PipelineBoard.tsx`: Kanban board với drag-and-drop, CandidateDrawer, filtering, overdue logic.
  - `components/Skeleton.jsx`: Loading skeleton đồng bộ cho các trang.
  - `components/WorkspaceSwitcher.jsx`: Chuyển đổi workspace, xem/accept invites.
- `contexts/`: Các state toàn cục của hệ thống.
  - `AuthContext`: Quản lý phiên đăng nhập của người dùng + `isAdmin` flag.
  - `WorkspaceContext`: Quản lý Workspace đang được chọn, phân quyền (Role), `plan` + `usage` counter.
  - `ThemeContext`: Chế độ hiển thị (Light/Dark mode).
  - `ToastContext`: Hệ thống thông báo góc màn hình nhỏ gọn.
- `pages/`: Các màn hình tính năng chính trong luồng người dùng.
  - `pages/LandingPage.jsx`: Trang đích premium với hero animation và SEO tối ưu.
  - `pages/admin/AdminPortal.jsx`: Cổng quản trị (tab **Gói & Nâng cấp**, **Người dùng**) — chỉ hiện khi `isAdmin`.
  - `pages/admin/AdminDashboard.jsx`: Thống kê tổng quan admin.
  - `pages/admin/AdminUpgradeRequests.jsx`: Duyệt/từ chối yêu cầu nâng cấp, đổi `plan` workspace.
  - `pages/legal/`: Các trang pháp lý (Privacy Policy, Terms of Service, Cookie Policy) với LegalLayout.
  - `pages/candidates/`: Candidate management (danh sách, form, upload, detail).
  - `pages/jobs/`: Job mandate management (danh sách, form, detail).
  - `pages/pipeline/Pipeline.tsx`: Pipeline Kanban board TypeScript.
  - `pages/dashboard/Dashboard.jsx`: Dashboard tổng quan + UsageMeter.
  - `pages/settings/`: Workspace settings, members management, user settings.
  - `pages/support/ContactSupport.jsx`: Form liên hệ hỗ trợ.
- `services/`: Các module giao tiếp trực tiếp với Firebase và API nội bộ bằng Fetch.
  - `services/apiClient.js`: Base URL + auth headers cho API calls.
  - `services/candidateService.js`: CRUD candidates + email notification + storage cleanup.
  - `services/jobService.js`: CRUD jobs + email notification + cascade delete applications.
  - `services/applicationService.js`: CRUD applications + pipeline stage update + email notification.
  - `services/workspace.service.js`: Workspace CRUD, member management, upgrade requests.
  - `services/admin.service.js`: API `/api/admin/*` cho billing portal.
  - `services/notification.service.js`: CRUD notifications.
  - `services/storageService.js`: File upload/download với workspace-scoped paths.
  - `services/emailTemplates.js`: HTML email templates cho các sự kiện quan trọng.
  - `services/ai.js`: AI proxy — gọi Cloud Function parse CV.
  - `services/activityService.js`: Activity feed logging.
- `utils/`: Hàm tiện ích hỗ trợ.
  - `utils/exportUtils.ts`: CSV export.
  - `utils/pipelineUtils.ts`: Pipeline helper (overdue logic, stage transitions).
  - `utils/dateUtils.js`: Định dạng ngày tháng theo locale.
- `i18n/`: Internationalization với `react-i18next`.
  - `locales/en/` và `locales/vi/`: Namespace JSON (common, jobs, candidates, dashboard, pipeline, settings, admin, landing, reports, members).
  - Namespace `admin.json` chứa copy cho Admin Portal.

## Tối ưu hiệu năng (Performance)
- **Code Splitting:** Ứng dụng sử dụng **React.lazy** và **Suspense** để chia nhỏ gói cài đặt (bundle). Các trang chỉ được tải khi người dùng truy cập, giúp giảm thời gian tải ban đầu và tiết kiệm tài nguyên.
- **Context Efficiency:** Hệ thống `WorkspaceContext` được tối ưu để tránh fetch lại dữ liệu không cần thiết khi chuyển đổi giữa các sub-pages trong cùng một workspace.
- **Image Lazy Loading:** Toàn bộ hình ảnh không ưu tiên (như Avatar) được cấu hình `loading="lazy"`.
- **Error Boundary:** `ErrorBoundary.jsx` bắt lỗi React rendering ở cấp toàn cục, ngăn white screen.

## Đa ngôn ngữ (Internationalization - i18n)
- **Framework:** Sử dụng **react-i18next** với cấu trúc JSON tách biệt theo namespace (common, jobs, candidates, dashboard, settings, landing, admin, reports, members, pipeline).
- **Locales:** Hỗ trợ chính thức tiếng Anh (EN) và tiếng Việt (VI). Toàn bộ text cứng đã được loại bỏ khỏi component và chuyển vào các file JSON trong `src/i18n/locales/`.
- **Namespace mới:** `admin` (Admin Portal copy), `landing` (trang đích), `plans`/`usage` (trong `common.json`).
- **Date Formatting:** Tự động điều chỉnh định dạng ngày tháng (`DD/MM/YYYY` cho VI và `MM/DD/YYYY` cho EN) dựa trên ngôn ngữ hiện tại của người dùng.

## Landing Page Premium
Trang đích (`LandingPage.jsx`) được thiết kế lại với:
- Hero section với ảnh nền `hero-dashboard.png` và hiệu ứng động.
- Feature cards mô tả các tính năng chính.
- Pricing section hiển thị 3 gói (Free, Pro, Team).
- SEO metadata động (title, description, Open Graph, Twitter Cards).
- Structured data (JSON-LD) cho WebApplication schema.
- `hreflang` tags cho en và vi.

## Mẫu Component Chuẩn
Dự án sử dụng 100% **Hook functional components**. Các hiệu ứng phụ được kiểm soát qua `useEffect`, và các trạng thái nội tại được đưa vào `useState`.

## Email Notification Templates
`src/services/emailTemplates.js` cung cấp các hàm tạo HTML email template:
- `newJobEmailTemplate({ workspaceId, jobId, jobData })`: Email khi job mới được tạo.
- `newCandidateEmailTemplate({ workspaceId, candidateId, candidateData })`: Email khi candidate mới được thêm.
- `pipelineUpdateEmailTemplate({ stage, appData })`: Email khi application stage thay đổi.
- Email upgrade request (xác nhận cho người gửi + thông báo cho admin).