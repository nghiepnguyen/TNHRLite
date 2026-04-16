# Notification System (Hệ thống Thông báo)

HR-Lite tích hợp một hệ thống thông báo tập trung, giúp người dùng nắm bắt mọi thay đổi quan trọng trong Workspace ngay cả khi không truy cập trực tiếp vào phân mục đó.

## 1. Kiến trúc thông báo
Hệ thống sử dụng mô hình kết hợp (Hybrid model) giữa dữ liệu lịch sử và dữ liệu trạng thái:

- **Bảng `userNotifications` (Persistent):** Lưu trữ các thông báo có tính lịch sử (Ví dụ: "Admin đã xóa bạn", "Bạn đã tham gia Workspace X"). Các thông báo này tồn tại vĩnh viễn cho đến khi người dùng xóa chúng.
- **Bảng `invites` (Stateful):** Các lời mời làm việc (`Pending Invites`) được truy vấn trực tiếp. Nếu Admin thu hồi lời mời, thông báo này sẽ tự động biến mất khỏi danh sách của ứng viên, đảm bảo tính nhất quán dữ liệu.

## 2. Cơ chế Thông báo hai chiều (Two-Way Notifications)
Mọi hành động quan trọng liên quan đến nhân sự đều kích hoạt thông báo cho cả hai phía:

| Hành động | Thông báo cho Người thao tác | Thông báo cho Phía đối diện |
| :--- | :--- | :--- |
| **Gửi lời mời** | Hiển thị Toast xác nhận | **Ứng viên**: Nhận thông báo "Có lời mời mới" |
| **Chấp nhận lời mời** | **Ứng viên**: Thông báo lịch sử đã gia nhập | **Người mời**: Xác nhận ứng viên đã đồng ý |
| **Từ chối lời mời** | **Ứng viên**: Thông báo lịch sử đã từ chối | **Người mời**: Cảnh báo ứng viên đã từ chối |
| **Xóa thành viên** | **Admin**: Xác nhận xóa thành công | **Thành viên**: Thông báo bị thu hồi quyền |
| **Rời Workspace** | **Thành viên**: Xác nhận đã rời đi | **Owner**: Cảnh báo có nhân sự đã rời nhóm |

## 3. Tính năng thông minh (Smart Features)
- **Invite Review Modal:** Thay vì các nút bấm đơn giản, lời mời được hiển thị dưới dạng Modal chi tiết (Review), giúp người dùng xem kỹ thông tin Workspace và quyền hạn trước khi đồng ý.
- **Auto-mark as Read:** Khi người dùng xử lý một lời mời (Chấp nhận/Từ chối), hệ thống tự động tìm và đánh dấu tất cả các thông báo lịch sử liên quan là "Đã đọc", giúp dọn dẹp danh sách thông báo tự động.
- **Real-time Sync:** Sử dụng `onSnapshot` của Firebase để cập nhật số lượng thông báo chưa đọc (Badge) ngay lập tức mà không cần tải lại trang.

## 4. Cấu hình Kỹ thuật
- **Service:** `src/services/notification.service.js` (Xử lý CRUD thông báo).
- **Component:** `src/components/NotificationBell.jsx` (Giao diện Chuông & Modal Review).
- **Security:** Quy tắc Firestore đảm bảo người dùng chỉ có thể đọc/xóa thông báo của chính mình qua `resource.data.userId == request.auth.uid`.
