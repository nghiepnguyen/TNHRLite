# Notification System (Hệ thống Thông báo)

HR-Lite tích hợp một hệ thống thông báo tập trung, giúp người dùng nắm bắt mọi thay đổi quan trọng trong Workspace ngay cả khi không truy cập trực tiếp vào phân mục đó.

## 1. Kiến trúc thông báo
Hệ thống sử dụng mô hình kết hợp (Hybrid model) giữa dữ liệu lịch sử và dữ liệu trạng thái:

- **Bảng `userNotifications` (Persistent):** Lưu trữ các thông báo có tính lịch sử (Ví dụ: "Admin đã xóa bạn", "Bạn đã tham gia Workspace X", "Yêu cầu nâng cấp đã được duyệt"). Các thông báo này tồn tại vĩnh viễn cho đến khi người dùng xóa chúng.
- **Bảng `invites` (Stateful):** Các lời mời làm việc (`Pending Invites`) được truy vấn trực tiếp. Nếu Admin thu hồi lời mời, thông báo này sẽ tự động biến mất khỏi danh sách của ứng viên, đảm bảo tính nhất quán dữ liệu.
- **Bảng `upgradeRequests`:** Yêu cầu nâng cấp gói workspace. Client chỉ đọc — ghi qua Admin SDK. Khi admin duyệt/từ chối, thông báo in-app được tạo cho người yêu cầu.

## 2. Cơ chế Thông báo hai chiều (Two-Way Notifications)
Mọi hành động quan trọng liên quan đến nhân sự đều kích hoạt thông báo cho cả hai phía:

| Hành động | Thông báo cho Người thao tác | Thông báo cho Phía đối diện |
| :--- | :--- | :--- |
| **Gửi lời mời** | Hiển thị Toast xác nhận | **Ứng viên**: Nhận thông báo "Có lời mời mới" + Email invitation |
| **Chấp nhận lời mời** | **Ứng viên**: Thông báo lịch sử đã gia nhập | **Người mời**: Xác nhận ứng viên đã đồng ý |
| **Từ chối lời mời** | **Ứng viên**: Thông báo lịch sử đã từ chối | **Người mời**: Cảnh báo ứng viên đã từ chối |
| **Xóa thành viên** | **Admin**: Xác nhận xóa thành công | **Thành viên**: Thông báo bị thu hồi quyền |
| **Rời Workspace** | **Thành viên**: Xác nhận đã rời đi | **Owner**: Cảnh báo có nhân sự đã rời nhóm |
| **Yêu cầu nâng cấp** | **Người gửi**: Email xác nhận + Toast | **Admin workspace**: In-app notification + Email |
| **Duyệt nâng cấp** | **Admin**: Toast xác nhận | **Người yêu cầu**: Email approval + In-app notification |
| **Từ chối nâng cấp** | **Admin**: Toast xác nhận | *(Không có thông báo tự động)* |

## 3. Tính năng thông minh (Smart Features)
- **Invite Review Modal:** Thay vì các nút bấm đơn giản, lời mời được hiển thị dưới dạng Modal chi tiết (Review), giúp người dùng xem kỹ thông tin Workspace và quyền hạn trước khi đồng ý.
- **Auto-mark as Read:** Khi người dùng xử lý một lời mời (Chấp nhận/Từ chối), hệ thống tự động tìm và đánh dấu tất cả các thông báo lịch sử liên quan là "Đã đọc", giúp dọn dẹp danh sách thông báo tự động.
- **Real-time Sync:** Sử dụng `onSnapshot` của Firebase để cập nhật số lượng thông báo chưa đọc (Badge) ngay lập tức mà không cần tải lại trang.

## 4. Cấu hình Kỹ thuật
- **Service:** `src/services/notification.service.js` (Xử lý CRUD thông báo).
- **Component:** `src/components/NotificationBell.jsx` (Giao diện Chuông & Modal Review).
- **Security:** Quy tắc Firestore đảm bảo người dùng chỉ có thể đọc/xóa thông báo của chính mình qua `resource.data.userId == request.auth.uid`.

## 5. Thông báo qua Email (Email Notifications)

Ngoài thông báo trong ứng dụng (In-app), HR-Lite tích hợp dịch vụ **Resend** để gửi email cho các sự kiện quan trọng:

### 5.1. Loại Email
| Sự kiện | Loại Email | Người nhận | Template |
|---------|-----------|------------|----------|
| **Job mới** | New job notification | Tất cả workspace members | `newJobEmailTemplate()` |
| **Candidate mới** | New candidate notification | Tất cả workspace members | `newCandidateEmailTemplate()` |
| **Pipeline update** | Stage change notification | Tất cả workspace members | `pipelineUpdateEmailTemplate()` |
| **Workspace invite** | Invitation email | Người được mời | HTML inline (backend) |
| **Contact support** | Support request confirmation | Người gửi + Admin | HTML inline (backend) |
| **Upgrade request** | Admin notification | Owner/Admin workspace + Billing email | HTML inline (`upgradeRequest.js`) |
| **Upgrade request** | Confirmation | Người gửi yêu cầu | HTML inline (`upgradeRequest.js`) |
| **Upgrade approved** | Approval notification | Người yêu cầu | HTML inline (`adminBilling.js`) |

### 5.2. Cấu hình Email
- **Service:** Resend API (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`).
- **Mock mode:** Khi thiếu `RESEND_API_KEY`, email không được gửi thật — chỉ log console. Điều này cho phép phát triển local mà không cần API key.
- **Escape HTML:** Tất cả input người dùng trong email template đều được escape qua `escapeHtml()` để ngăn HTML injection.
- **Reply-To:** Email upgrade request có `replyTo` được set là email người yêu cầu.

### 5.3. Template Nguồn
- **Frontend templates:** `src/services/emailTemplates.js` — dùng cho job, candidate, pipeline notifications qua `notifyWorkspaceMembers()`.
- **Backend templates:** Hardcoded inline HTML trong `functions/utils/upgradeRequest.js` và `functions/utils/adminBilling.js`.

## 6. Notification Flow Mở rộng

### 6.1. Upgrade Request Flow
```
User gửi upgrade → Firestore upgradeRequests (pending)
                   → Email admin/billing (RESEND)
                   → Email xác nhận cho user (RESEND)
                   → In-app notification cho admin workspace (Firestore userNotifications)
                   
Admin duyệt → upgradeRequests.status = approved
            → workspaces.plan = targetPlan
            → Email approval cho user (RESEND)
            → In-app notification cho user (Firestore userNotifications)

Admin từ chối → upgradeRequests.status = rejected
              → (không gửi email)
```

### 6.2. Workspace Cascade Delete
```
Owner xóa workspace → Firestore trigger onDocumentDeleted
                     → Xóa: jobs, candidates, applications, activities (theo workspaceId)
                     → Xóa: workspaceMembers (theo workspaceId)
                     → Xóa: invites (theo workspaceId)
                     → Xóa: upgradeRequests (theo workspaceId)
                     → Xóa: CV files trong Storage