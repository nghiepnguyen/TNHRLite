# Frontend Documentation

## Stack Kỹ thuật chi tiết
- **Core:** Khung làm việc là **React 19**, được đóng gói siêu tốc bằng **Vite**.
- **Routing:** **React Router v7** đảm nhiệm việc phân luồng và bảo vệ các routes (ví dụ: yêu cầu Login cho `/dashboard`).
- **Styling:** Sử dụng thuần **Vanilla CSS** với hệ thống Design Tokens đồng bộ (CSS Variables). Giao diện tối ưu hóa khả năng phản hồi bằng hệ thống **Loading Skeleton** và hiệu ứng **Entrance Animation** (slideInUp) cho thẻ (cards).
- **Icon:** Thư viện **Material Icons** (Google Material Symbols) kết hợp với Lucide React ở một số phân hệ cũ.

## Cấu trúc thư mục Frontend (`src/`)

- `components/`: Chứa các thành phần UI dùng chung, được tái sử dụng qua nhiều trang (Button, Modal, Table, Skeleton, Drawer...).
- `contexts/`: Các state toàn cục của hệ thống.
  - `AuthContext`: Quản lý phiên đăng nhập của người dùng.
  - `WorkspaceContext`: Quản lý Workspace đang được chọn, phân quyền (Role) hiện tại và chuyển đổi dữ liệu.
  - `ThemeContext`: Chế độ hiển thị (Light/Dark mode).
  - `ToastContext`: Hệ thống thông báo góc màn hình nhỏ gọn.
- `pages/`: Các màn hình tính năng chính trong luồng người dùng (Dashboard, Login, LandingPage, Candidate, Job...).
- `services/`: Các module giao tiếp trực tiếp với Firebase (Database, Storage) và API nội bộ bằng Fetch.
- `utils/`: Hàm tiện ích hỗ trợ (export CSV, parse date...).

## Tối ưu hiệu năng (Performance)
- **Code Splitting:** Ứng dụng sử dụng **React.lazy** và **Suspense** để chia nhỏ gói cài đặt (bundle). Các trang chỉ được tải khi người dùng truy cập, giúp giảm thời gian tải ban đầu và tiết kiệm tài nguyên.
- **Context Efficiency:** Hệ thống `WorkspaceContext` được tối ưu để tránh fetch lại dữ liệu không cần thiết khi chuyển đổi giữa các sub-pages trong cùng một workspace.
- **Image Lazy Loading:** Toàn bộ hình ảnh không ưu tiên (như Avatar) được cấu hình `loading="lazy"`.

## Đa ngôn ngữ (Internationalization - i18n)
- **Framework:** Sử dụng **react-i18next** với cấu trúc JSON tách biệt theo namespace (common, jobs, candidates, settings...).
- **Locales:** Hỗ trợ chính thức tiếng Anh (EN) và tiếng Việt (VI). Toàn bộ text cứng đã được loại bỏ khỏi component và chuyển vào các file JSON trong `src/i18n/locales/`.
- **Date Formatting:** Tự động điều chỉnh định dạng ngày tháng (`DD/MM/YYYY` cho VI và `MM/DD/YYYY` cho EN) dựa trên ngôn ngữ hiện tại của người dùng.

## Mẫu Component Chuẩn
Dự án sử dụng 100% **Hook functional components**. Các hiệu ứng phụ được kiểm soát qua `useEffect`, và các trạng thái nội tại được đưa vào `useState`.
