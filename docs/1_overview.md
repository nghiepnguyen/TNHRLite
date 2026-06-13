# HR-Lite Overview

**HR-Lite** (còn gọi là Antigravity HR) là một hệ thống quản trị nguồn nhân lực (Human Resources Management System) nhỏ gọn, được thiết kế tập trung vào sự tối giản và hiệu quả. Nền tảng được tối ưu hóa cho quy trình tuyển dụng và quản lý luồng ứng viên.

## Mục tiêu chính (Core Objectives)
1. **Tinh gọn (Lightweight):** Cung cấp các tính năng thiết yếu nhất cho một Recruiter/HR Manager thay vì nhồi nhét quá nhiều tính năng phức tạp.
2. **Hiện đại (Modern UX/UI):** Giao diện tập trung vào trải nghiệm người dùng cao cấp với thiết kế Glassmorphism. Hệ thống tích hợp Loading Skeletons đồng bộ, hiệu ứng chuyển cảnh mượt mà, và Landing Page cao cấp (premium) để tối ưu hóa phản hồi thị giác và loại bỏ cảm giác chờ đợi.
3. **Thông minh (AI-Powered):** Tận dụng trí tuệ nhân tạo (Gemini AI) để tự động hóa việc đọc, phân tích CV và đánh giá mức độ phù hợp của ứng viên với công việc.
4. **Cộng tác (Collaboration):** Áp dụng mô hình Workspace đa phân quyền (Owner, Admin, Editor, Viewer), cho phép làm việc nhóm thời gian thực (Real-time).
5. **Gói dịch vụ (Plans & Usage):** Mỗi Workspace có gói `free` / `pro` / `team` với hạn mức Jobs, Candidates và lượt parse CV/tháng. Người dùng xem mức dùng trên dashboard qua **UsageMeter**, gửi yêu cầu nâng cấp qua **UpgradeModal**; quản trị viên hệ thống duyệt và đổi gói trong **Admin Portal**.

## Đối tượng sử dụng (Target Audience)
- Headhunter cá nhân.
- Bộ phận HR của các startup, doanh nghiệp vừa và nhỏ (SME).
- Quản lý tuyển dụng nội bộ.

## Các tính năng nổi bật (Key Features)

### 🎨 Landing Page Premium
Trang đích được thiết kế lại với giao diện cao cấp, tối ưu SEO, bao gồm:
- **LandingCTA**: Kêu gọi hành động với hiệu ứng động.
- **LandingNavbar**: Thanh điều hướng thông minh với trạng thái scroll.
- **LandingFooter**: Footer đầy đủ thông tin liên kết và pháp lý.

### 🔒 Bảo mật toàn diện (Comprehensive Security)
- **CORS Whitelist** hạn chế origin thay vì `origin: '*'`.
- **Security Headers** cấu hình trong Firebase Hosting (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`).
- **Rate Limiter** dựa trên Firestore (persistent, không reset khi cold start).
- **Cascade Delete** workspace qua Cloud Function trigger.
- **Input Sanitization** (`escapeHtml`, `sanitizeError`) cho tất cả endpoint.
- Chi tiết xem tại: [Security Overview](file:///Users/nghiepnguyen/My%20Files/HR-Lite/docs/10_security.md)

### 📊 Gói dịch vụ & Giới hạn sử dụng (Plans & Usage)
- 3 gói: **Free** (5 jobs, 50 candidates, 10 CV parses/tháng), **Pro** (50/500/100), **Team** (không giới hạn).
- Usage counter atomic transaction — không thể bypass từ client.
- **UsageMeter** hiển thị mức dùng trực quan trên Dashboard.
- **UpgradeModal** so sánh gói và gửi yêu cầu nâng cấp.
- **Admin Portal** cho phép duyệt/từ chối yêu cầu hoặc đổi gói trực tiếp.

### 📧 Hệ thống Email thông minh
- Email tự động gửi qua **Resend** cho: tạo Job mới, thêm Candidate mới, cập nhật Pipeline stage.
- Email xác nhận yêu cầu nâng cấp gói.
- Email thông báo cho admin workspace khi có yêu cầu nâng cấp.
- Template chuyên nghiệp với HTML styling.

### 🚀 CI/CD Tự động
- **GitHub Actions** workflow tự động build & deploy lên Firebase khi push lên `main`.
- Sử dụng `actions/checkout@v5`, `actions/setup-node@v5`, Node.js 22.
- Deploy qua `FirebaseExtended/action-hosting-deploy@v0`.

### 🌐 Tối ưu SEO
- Structured data (JSON-LD) cho Landing Page.
- `hreflang` tags cho đa ngôn ngữ (en, vi).
- `robots.txt` và `sitemap.xml` được tối ưu.
- Dynamic SEO với `react-helmet-async` cho từng trang.

## Hệ thống Tri thức & Kiến trúc (Knowledge Graph)
Dự án áp dụng công nghệ **Graphify** để quản trị tri thức mã nguồn. Bạn có thể tra cứu mối quan hệ giữa các thành phần, xem bản đồ kiến trúc và hỏi các câu hỏi phức tạp về hệ thống thông qua đồ thị tri thức.
- Chi tiết xem tại: [Knowledge Graph (Graphify)](file:///Users/nghiepnguyen/My%20Files/HR-Lite/docs/9_graphify.md)

---

*Tham khảo các phần tiếp theo để hiểu rõ hơn về kỹ thuật và luồng nghiệp vụ của hệ thống.*