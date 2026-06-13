# Workflow (Luồng làm việc chung)

Đây là quy trình thao tác chuẩn của một tài khoản mới tinh (New User) trên HR-Lite.

## 1. Đăng ký / Đăng nhập
- Người dùng có thể đăng nhập bằng **Google** (OAuth với `signInWithRedirect` fallback khi popup bị chặn) hoặc **Email/Password**.
- Sau đăng ký email, người dùng phải xác minh email (`emailVerified`) trước khi truy cập các trang được bảo vệ.

## 2. Trang đích (Landing Page)
- Trang đích premium (`LandingPage.jsx`) hiển thị:
  - Hero section với ảnh nền và CTA (Call to Action).
  - Feature cards mô tả các tính năng chính của hệ thống.
  - Pricing section hiển thị 3 gói dịch vụ (Free, Pro, Team).
  - SEO metadata động (title, description, Open Graph, Twitter Cards).
  - Structured data (JSON-LD) + `hreflang` tags.
  - Các trang pháp lý: Privacy Policy, Terms of Service, Cookie Policy.

## 3. Hệ thống Workspace (Không gian bản địa)
- Ngay sau khi đăng nhập thành công, hệ thống kiểm tra User đã có Workspace nào chưa.
- Mặc định, HR-Lite sẽ tạo một `My Workspace` với User là Owner nếu họ chưa thuộc về đâu.
- Mọi dữ liệu (Job, CV, Pipeline) được phân cấp theo Workspace. User có thể làm việc qua lại trên nhiều Workspace khác nhau thông qua *Workspace Switcher*.

## 4. Tạo Yêu cầu (Jobs / Mandates)
- HR đăng tin vị trí (Job Mandate) với tiêu đề, bộ phận, yêu cầu kỹ năng.
- Khi tạo job mới, hệ thống kiểm tra `checkWorkspaceLimit(workspaceId, 'jobs')` qua Cloud Function.
- Nếu vượt giới hạn gói, UI hiển thị **UpgradeModal** để người dùng gửi yêu cầu nâng cấp.
- Email tự động gửi cho workspace members khi job mới được tạo.

## 5. Quản lý Hồ sơ Ứng viên (Candidates) 
- Có thể Upload file PDF/DOCX chứa thông tin Ứng viên.
- **AI Backend** dịch file, trích xuất dữ liệu, tổng hợp mô tả và tự điền thông tin (tránh nhập liệu thủ công).
- Khi tạo candidate mới, hệ thống kiểm tra `checkWorkspaceLimit(workspaceId, 'candidates')`.
- Email tự động gửi cho workspace members khi candidate mới được thêm.

## 6. Ghép nối ống dẫn (Pipeline) & So khớp (Matching)
- Đưa ứng viên vào Pipeline của một Job cụ thể.
- **AI Matching** sẽ đối chiếu điểm mạnh, khoảng trống kỹ năng để đưa ra Fit Score (% phù hợp).
- Ứng viên lần lượt được kéo-thả (hoặc chỉnh Status) qua các chặng: `New` -> `Reviewed` -> `Interview` -> `Offer` -> `Hired`.
- Khi stage pipeline thay đổi, email tự động gửi cho workspace members.

## 7. Phân tích (Báo cáo & Xuất CSV)
- Cho phép xuất danh sách tuyển dụng ra file Excel (CSV) nhanh chóng.
- Hệ thống log hành vi thay đổi sang bảng `Activity` để cung cấp dòng thời gian toàn diện (Feed) cho các Admin khác theo dõi.

## 8. Gói dịch vụ & Yêu cầu nâng cấp (Plans & Upgrade)

### 8.1. Gói dịch vụ (Plans)
| Gói | Jobs | Candidates | CV Parses/Tháng | Giới hạn |
|-----|------|------------|-----------------|----------|
| **Free** | 5 | 50 | 10 | Có giới hạn |
| **Pro** | 50 | 500 | 100 | Có giới hạn |
| **Team** | -1 | -1 | -1 | Không giới hạn |

### 8.2. Usage Tracking
- **UsageMeter** hiển thị trên Dashboard: thanh tiến trình cho jobs, candidates, CV parses.
- Counter được quản lý atomic qua Firestore transaction trong `checkWorkspaceLimit()`.
- Client không thể bypass — mọi thao tác tạo job/candidate/parse-cv đều qua Cloud Functions API.

### 8.3. Quy trình nâng cấp (Upgrade Flow)
1. Khi chạm giới hạn, UI chặn thao tác và mở **UpgradeModal** — user chọn gói cao hơn (Pro hoặc Team) và gửi yêu cầu.
2. Hệ thống lưu bản ghi `upgradeRequests` với `status: 'pending'`.
3. Email gửi tới owner/admin workspace + billing email (`BILLING_EMAIL`).
4. Email xác nhận gửi cho người yêu cầu.
5. Thông báo in-app cho admin workspace.

### 8.4. Admin Portal (Duyệt yêu cầu)
1. **Global admin** (email trong `ADMIN_EMAIL` / `VITE_ADMIN_EMAIL`) vào **Admin Portal**.
2. Tab *Gói & Nâng cấp* hiển thị tất cả yêu cầu (pending/approved/rejected).
3. Admin có thể **duyệt** (approve) → cập nhật `workspaces.plan`, gửi email approval.
4. Admin có thể **từ chối** (reject) → cập nhật status, không đổi plan.
5. Admin có thể **đổi gói trực tiếp** cho workspace mà không cần qua yêu cầu.
6. Tab *Người dùng* hiển thị danh sách user + thống kê, hỗ trợ xóa user cascade.

## 9. Hệ thống Thông báo & Phản hồi (Notifications)
- Mọi tương tác quan trọng (Lời mời mới, Chấp nhận/Từ chối tham gia, Thay đổi nhân sự, Yêu cầu nâng cấp) đều được đẩy về **Notification Center**.
- Hệ thống áp dụng cơ chế thông báo hai chiều, đảm bảo cả người thực hiện và người nhận đều nhận được phản hồi xác thực về hành động của mình.
- **Quản lý thành viên nâng cao**: Ngăn chặn gửi nhiều lời mời tới cùng một email (duplicate check). Đồng thời cho phép Admin xóa vĩnh viễn các bản ghi mời cũ để làm sạch Audit Log.
- Tự động dọn dẹp trạng thái "Chưa đọc" khi các hành động tương tác (như Review Invitation) đã hoàn thành.

## 10. Hệ thống Email (Email Notifications)
- **Resend API** được sử dụng cho tất cả email transactional.
- Email tự động gửi cho các sự kiện:
  - **Job mới**: Tất cả workspace members nhận email với template chuyên nghiệp.
  - **Candidate mới**: Tất cả workspace members nhận email thông báo.
  - **Pipeline update**: Workspace members nhận email khi application stage thay đổi.
  - **Upgrade request**: Admin/billing nhận email yêu cầu nâng cấp; người gửi nhận email xác nhận.
  - **Upgrade approval**: Người yêu cầu nhận email khi gói được duyệt.
- Template HTML được quản lý tập trung trong `src/services/emailTemplates.js` (frontend) và hardcoded trong `functions/utils/upgradeRequest.js` (backend).
- Nếu `RESEND_API_KEY` không được cấu hình, hệ thống chạy ở chế độ mock (log console, không gửi email thật).

## 11. Liên hệ Hỗ trợ (Contact Support)
- Form `ContactSupport.jsx` cho phép người dùng gửi yêu cầu hỗ trợ.
- Backend endpoint `/api/send-support-email` xử lý qua Resend.
- Tự động đính kèm thông tin context (User UID, Email) để hỗ trợ nhanh hơn.
- Rate limited: 5 requests/phút/IP (Firestore-based, persistent).

---

*Tham khảo các phần tiếp theo để hiểu rõ hơn về kỹ thuật và luồng nghiệp vụ của hệ thống.*