# Kế hoạch triển khai Usage Limits theo Workspace

## 1. Thiết kế dữ liệu (Firestore Schema)

### Thêm vào document `workspaces/{workspaceId}`

```
plan: "free"                   // free | pro | team
usage: {
  jobs: 3,
  candidates: 24,
  cvParsesThisMonth: 7
}
usageResetAt: Timestamp        // ngày reset hàng tháng
```

### Collection mới `plans` (cấu hình hạn mức tập trung)

| Gói  | jobs | candidates | cvParsesPerMonth |
|------|------|------------|------------------|
| free | 5    | 50         | 10               |
| pro  | 50   | 500        | 100              |
| team | -1   | -1         | -1               |

> `-1` = không giới hạn. Để trong Firestore để chỉnh mà không cần deploy lại.

---

## 2. Backend — Cloud Functions

### Bước 1: Viết hàm helper `checkWorkspaceLimit(workspaceId, resource)`

- Đọc `workspaces/{workspaceId}` lấy `plan` + `usage`
- Đọc `plans/{plan}` lấy hạn mức
- So sánh, nếu vượt thì throw lỗi `LIMIT_EXCEEDED`
- Nếu còn thì tăng counter `usage.{resource}` lên 1

### Bước 2: Gắn vào các endpoint theo thứ tự ưu tiên

1. `/api/parse-cv` — **làm trước**, vì tốn chi phí Gemini thật, kiểm tra `cvParsesThisMonth`
2. Tạo Job — kiểm tra `jobs`
3. Tạo Candidate — kiểm tra `candidates`

### Bước 3: Scheduled Function reset hàng tháng

- Chạy vào ngày 1 hàng tháng
- Reset `usage.cvParsesThisMonth` về 0 cho toàn bộ workspace
- Cập nhật `usageResetAt`

---

## 3. Frontend

### Bước 1: Đưa `plan` + `usage` vào `WorkspaceContext`

- Đã có sẵn, chỉ cần thêm 2 field khi fetch workspace

### Bước 2: Component hiển thị mức dùng

- Ví dụ: thanh tiến trình "3/5 Jobs", "24/50 Ứng viên", "7/10 CV tháng này"
- Đặt ở trang Settings hoặc sidebar

### Bước 3: Chặn UI khi chạm giới hạn

- Disable nút "Tạo Job", "Tạo Ứng viên", "Upload CV"
- Hiện tooltip giải thích lý do

### Bước 4: Modal nâng cấp

- Hiện khi user bấm vào nút bị disable hoặc nhận lỗi từ API
- Nội dung: so sánh các gói + nút "Liên hệ nâng cấp" (placeholder trước, chưa cần thanh toán thật)

---

## 4. Bảo mật (Firestore Rules)

- Chỉ cho phép đọc `usage` và `plan` nếu là thành viên workspace
- Không cho phép client tự ghi trực tiếp vào `usage` — toàn bộ việc tăng counter phải qua Cloud Functions

---

## 5. Thứ tự triển khai thực tế

```
[1]  Tạo collection plans trên Firestore
[2]  Thêm field plan + usage vào workspaces
[3]  Viết helper checkWorkspaceLimit
[4]  Gắn vào /api/parse-cv
[5]  Gắn vào tạo Job + Candidate
[6]  Scheduled Function reset tháng
[7]  WorkspaceContext đọc usage
[8]  UI hiển thị mức dùng
[9]  Disable nút + modal nâng cấp
[10] Tích hợp thanh toán (giai đoạn sau)
```

---

> **Lưu ý quan trọng:** Khi nâng cấp gói sau này chỉ cần cập nhật field `plan` trong document `workspaces` là xong — không cần deploy lại code. Đây là lý do nên để cấu hình hạn mức trong Firestore thay vì hardcode.
