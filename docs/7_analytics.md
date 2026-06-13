# Analytics & Tracking

Dự án hiện tại đang tích hợp **Google Analytics** (thông qua hàm global `gtag` do hạ tầng script nhúng trên `index.html` của Firebase cung cấp).

Các sự kiện (Event) kinh doanh cốt lõi được theo dõi trong mã nguồn:

| Sự kiện (Event Name) | Mục đích / Ngữ cảnh | Màn hình/Component (Location) |
| --- | --- | --- |
| `signup_completed` | Người dùng vừa tạo tài khoản thành công qua form Email. | `Login.jsx` |
| `login_success` | Người dùng đăng nhập thành công (Tách method: Email, Google). | `Login.jsx` |
| `create_job` | Thành viên tạo mới một Job Mandate (Phát sinh nhu cầu tuyển dụng). Có kiểm tra usage limit qua Cloud Function. | `JobForm.jsx` |
| `create_candidate` | Nhập tay thông tin ứng viên thủ công hoặc upload CV. Có kiểm tra usage limit. | `CandidateForm.jsx` |
| `cv_uploaded` | Tải một CV lên Storage (kèm tên file `event_label`). | `CandidateUpload.jsx` |
| `cv_parse_success` | Gọi AI bóc tách thông tin CV thành công. | `CandidateUpload.jsx` |
| `cv_parse_fallback` | AI có trục trặc nhỏ hoặc trích xuất không hoàn hảo, nhưng vẫn chạy vòng lặp backup. | `CandidateUpload.jsx` |
| `candidate_matched` | Gắn một ứng viên vào Pipeline Job đồng thời lấy AI Fit Score (% match). | `CandidateDetail.jsx` |
| `report_viewed` | Vào xem màn hình Báo cáo (Analytics/Graph Module). | `Reports.jsx` |
| `create_workspace` | Người dùng tạo mới một Workspace. | `WorkspaceSwitcher.jsx` |
| `delete_workspace` | Owner xóa vĩnh viễn một Workspace (cascade delete qua Cloud Function trigger). | `WorkspaceSettings.jsx` |
| `send_invite` | Owner/Admin gửi lời mời tham gia Workspace (Kèm `role`). | `WorkspaceSettings.jsx` |
| `revoke_invite` | Thu hồi một lời mời chưa được chấp nhận. | `WorkspaceSettings.jsx` |
| `invite_accepted` | Người dùng (khách) đồng ý tham gia Workspace theo lời mời. | `WorkspaceSwitcher.jsx` |
| `remove_member` | Quản trị viên xóa một member khỏi Workspace. | `WorkspaceSettings.jsx` |
| `upgrade_requested` | Thành viên gửi yêu cầu nâng cấp gói workspace (Pro/Team). | `UpgradeModal.jsx` |
| `upgrade_approved` | Admin duyệt yêu cầu nâng cấp gói. | `AdminUpgradeRequests.jsx` |
| `upgrade_rejected` | Admin từ chối yêu cầu nâng cấp gói. | `AdminUpgradeRequests.jsx` |
| `plan_changed` | Admin đổi gói trực tiếp cho workspace. | `AdminPortal.jsx` |
| `contact_support` | Người dùng gửi form liên hệ hỗ trợ. | `ContactSupport.jsx` |

## Các chỉ số nâng cao (Advanced Metrics)

### Usage & Plan Metrics
- **Usage tracking**: Mỗi lần tạo job/candidate/parse-cv, counter được tăng atomic qua Firestore transaction. Analytics event được fire kèm `plan` và `usage` context.
- **Limit exceeded events**: Khi user chạm giới hạn, event `limit_reached` được fire với `resource` (jobs/candidates/cvParses) và `plan`.
- **Conversion funnel**: Landing Page → Signup → Create Workspace → Create Job → Add Candidate → Pipeline Match → Hired.

### Email Notification Metrics
- **Email delivery**: Cloud Functions log mỗi lần gửi email qua Resend (admin notification, confirmation, pipeline update).
- **Mock mode**: Khi thiếu `RESEND_API_KEY`, event không được fire nhưng log console ghi nhận để debug.

### SEO Performance
- **Page view tracking**: Tất cả page views được track qua Google Analytics với custom dimensions cho `language` (en/vi).
- **Landing page engagement**: Scroll depth, CTA clicks, pricing section views.

Việc khai thác các chỉ số Analytics này giúp Admin hiểu rõ sự yêu thích và tính hiệu dụng khi User quyết định tạo Pipeline AI hay nhập tay thông thường, cũng như kiểm tra tỷ lệ lỗi khi sử dụng parsing CV tự động, và tỷ lệ chuyển đổi giữa các gói dịch vụ.