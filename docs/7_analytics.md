# Analytics & Tracking

Dự án hiện tại đang tích hợp **Google Analytics** (thông qua hàm global `gtag` do hạ tầng script nhúng trên `index.html` của Firebase cung cấp).

Các sự kiện (Event) kinh doanh cốt lõi được theo dõi trong mã nguồn:

| Sự kiện (Event Name) | Mục đích / Ngữ cảnh | Màn hình/Component (Location) |
| --- | --- | --- |
| `signup_completed` | Người dùng vừa tạo tài khoản thành công qua form Email. | `Login.jsx` |
| `login_success` | Người dùng đăng nhập thành công (Tách method: Email, Google). | `Login.jsx` |
| `create_job` | Thành viên tạo mới một Job Mandate (Phát sinh nhu cầu tuyển dụng). | `JobForm.jsx` |
| `create_candidate` | Nhập tay thông tin ứng viên thủ công. | `CandidateForm.jsx` |
| `cv_uploaded` | Tải một CV lên Storage (kèm tên file `event_label`). | `CandidateUpload.jsx` |
| `cv_parse_success` | Gọi AI bóc tách thông tin CV thành công. | `CandidateUpload.jsx` |
| `cv_parse_fallback` | AI có trục trặc nhỏ hoặc trích xuất không hoàn hảo, nhưng vẫn chạy vòng lặp backup. | `CandidateUpload.jsx` |
| `candidate_matched` | Gắn một ứng viên vào Pipeline Job đồng thời lấy AI Fit Score (% match). | `CandidateDetail.jsx` |
| `report_viewed` | Vào xem màn hình Báo cáo (Analytics/Graph Module). | `Reports.jsx` |
| `create_workspace` | Người dùng tạo mới một Workspace. | `WorkspaceSwitcher.jsx` |
| `delete_workspace` | Owner xóa vĩnh viễn một Workspace. | `WorkspaceSettings.jsx` |
| `send_invite` | Owner/Admin gửi lời mời tham gia Workspace (Kèm `role`). | `WorkspaceSettings.jsx` |
| `revoke_invite` | Thu hồi một lời mời chưa được chấp nhận. | `WorkspaceSettings.jsx` |
| `invite_accepted` | Người dùng (khách) đồng ý tham gia Workspace theo lời mời. | `WorkspaceSwitcher.jsx` |
| `remove_member` | Quản trị viên xóa một member khỏi Workspace. | `WorkspaceSettings.jsx` |

Việc khai thác các chỉ số Analytics này giúp Admin hiểu rõ sự yêu thích và tính hiệu dụng khi User quyết định tạo Pipeline AI hay nhập tay thông thường, cũng như kiểm tra tỷ lệ lỗi khi sử dụng parsing CV tự động.
