# Knowledge Graph (Graphify)

HR-Lite tích hợp hệ thống **Graphify** để biến toàn bộ mã nguồn và tài liệu thành một bản đồ tri thức (Knowledge Graph) có thể truy vấn. Điều này giúp các lập trình viên và AI Agent hiểu sâu về cấu trúc hệ thống, các điểm nghẽn kiến trúc và mối liên hệ giữa các thành phần.

## 1. Bản đồ Cộng đồng (Community Map)

Dựa trên phân tích cấu trúc AST (Abstract Syntax Tree) và ngữ nghĩa, hệ thống được chia thành các cộng đồng chính:

- **Core & Auth:** `Authentication & App Entry`, `Workspace & User Profiles`.
- **Management:** `Candidate & Recruitment Management`, `Pipeline Visualization (Kanban)`.
- **Infrastructure:** `Backend API Routing & Middleware`, `Cloud Functions (AI & Email)`.
- **Documentation:** `System Workflow Documentation`, `AI Agent Guidelines`.

## 2. Các chỉ số quan trọng

- **God Nodes:** Các thành phần cốt lõi như `useAuth()`, `useWorkspace()`, và `useToast()` đóng vai trò là cầu nối (Bridges) giữa các cộng đồng khác nhau.
- **Cohesion Score:** Giúp đánh giá mức độ chặt chẽ của mã nguồn. Các module có điểm số thấp (ví dụ: `< 0.1`) có thể cần được refactor để tách nhỏ hoặc đóng gói tốt hơn.

## 3. Cách sử dụng Graphify

Hệ thống cung cấp các công cụ dòng lệnh (CLI) để tương tác với đồ thị:

### Cập nhật Đồ thị
Sau khi thay đổi mã nguồn, chạy lệnh sau để cập nhật bản đồ (không tốn phí API):
```bash
./myenv/bin/graphify update .
```

### Truy vấn Kiến trúc
Hỏi về mối liên hệ giữa hai thành phần bất kỳ:
```bash
./myenv/bin/graphify path "AuthContext" "CandidateDetail"
```

### Giải thích mã nguồn
Yêu cầu giải thích một thành phần dựa trên các lân cận của nó:
```bash
./myenv/bin/graphify explain "useWorkspace"
```

## 4. Tích hợp Agent
Dữ liệu đồ thị được lưu trữ tại `graphify-out/graph.json`. Các AI Agent như Antigravity sử dụng dữ liệu này để đưa ra các đề xuất sửa đổi mã nguồn chính xác hơn, tránh phá vỡ các mối liên kết ngầm định.

---
*Xem thêm tại `graphify-out/GRAPH_REPORT.md` để biết chi tiết báo cáo kiểm thử mới nhất.*
