# Workflow (Luồng làm việc chung)

Đây là quy trình thao tác chuẩn của một tài khoản mới tinh (New User) trên HR-Lite.

## 1. Đăng ký / Đăng nhập
- Người dùng có thể đăng nhập bằng **Google** (OAuth) hoặc **Email**.

## 2. Hệ thống Workspace (Không gian bản địa)
- Ngay sau khi đăng nhập thành công, hệ thống kiểm tra User đã có Workspace nào chưa.
- Mặc định, HR-Lite sẽ tạo một `My Workspace` với User là Owner nếu họ chưa thuộc về đâu.
- Mọi dữ liệu (Job, CV, Pipeline) được phân cấp theo Workspace. User có thể làm việc qua lại trên nhiều Workspace khác nhau thông qua *Workspace Switcher*.

## 3. Tạo Yêu cầu (Jobs / Mandates)
- HR đăng tin vị trí (Job Mandate) với tiêu đề, bộ phận, yêu cầu kỹ năng.

## 4. Quản lý Hồ sơ Ứng viên (Candidates) 
- Có thể Upload file PDF/DOCX chứa thông tin Ứng viên.
- **AI Backend** dịch file, trích xuất dữ liệu, tổng hợp mô tả và tự điền thông tin (tránh nhập liệu thủ công).

## 5. Ghép nối ống dẫn (Pipeline) & So khớp (Matching)
- Đưa ứng viên vào Pipeline của một Job cụ thể.
- **AI Matching** sẽ đối chiếu điểm mạnh, khoảng trống kỹ năng để đưa ra Fit Score (% phù hợp).
- Ứng viên lần lượt được kéo-thả (hoặc chỉnh Status) qua các chặng: `New` -> `Reviewed` -> `Interview` -> `Offer` -> `Hired`.

## 6. Phân tích (Báo cáo & Xuất CSV)
- Cho phép xuất danh sách tuyển dụng ra file Excel (CSV) nhanh chóng.
- Hệ thống log hành vi thay đổi sang bảng `Activity` để cung cấp dòng thời gian toàn diện (Feed) cho các Admin khác theo dõi.
