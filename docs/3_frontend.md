# Frontend Documentation

## Stack Kỹ thuật chi tiết
- **Core:** Khung làm việc là **React 19**, được đóng gói siêu tốc bằng **Vite**.
- **Routing:** **React Router v7** đảm nhiệm việc phân luồng và bảo vệ các routes (ví dụ: yêu cầu Login cho `/dashboard`).
- **Styling:** Sử dụng thuần **Vanilla CSS** với cách đặt tên class theo chuẩn (như BEM biến thể) và CSS Variables (`var(--color-primary)`) để linh hoạt Theme sáng/tối.
- **Icon:** Thư viện **Material Icons** (Google Material Symbols) kết hợp với Lucide React ở một số phân hệ cũ.

## Cấu trúc thư mục Frontend (`src/`)

- `components/`: Chứa các thành phần UI dùng chung, được tái sử dụng qua nhiều trang (Button, Modal, Table, Drawer...).
- `contexts/`: Các state toàn cục của hệ thống.
  - `AuthContext`: Quản lý phiên đăng nhập của người dùng.
  - `WorkspaceContext`: Quản lý Workspace đang được chọn, phân quyền (Role) hiện tại và chuyển đổi dữ liệu.
  - `ThemeContext`: Chế độ hiển thị (Light/Dark mode).
  - `ToastContext`: Hệ thống thông báo góc màn hình nhỏ gọn.
- `pages/`: Các màn hình tính năng chính trong luồng người dùng (Dashboard, Login, LandingPage, Candidate, Job...).
- `services/`: Các module giao tiếp trực tiếp với Firebase (Database, Storage) và API nội bộ bằng Fetch.
- `utils/`: Hàm tiện ích hỗ trợ (export CSV, parse date...).

## Mẫu Component Chuẩn
Dự án sử dụng 100% **Hook functional components**. Các hiệu ứng phụ được kiểm soát qua `useEffect`, và các trạng thái nội tại được đưa vào `useState`.
