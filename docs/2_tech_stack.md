# Technology Stack

HR-Lite sử dụng các công nghệ hiện đại, kết hợp kiến trúc Serverless (phi máy chủ) để tối ưu hóa chi phí vận hành và tốc độ phát triển.

## Tổng quan Kiến trúc

- **Kiến trúc:** CSR (Client-Side Rendering) kết hợp với Serverless Backend (Cloud Functions).
- **Backend-as-a-Service (BaaS):** Firebase.
- **AI Service:** Google Gemini AI.

## Các công nghệ cốt lõi

1. **Frontend:** React 19, Vite, React Router v7.
2. **State Management:** React Context API (ThemeContext, AuthContext, ToastContext, WorkspaceContext).
3. **Database:** Firestore (NoSQL, Real-time Document Database).
4. **Storage:** Firebase Cloud Storage (Lưu trữ ảnh, CV dạng PDF, DOCX).
5. **Authentication:** Firebase Auth (Email/Password, Google OAuth).
6. **Backend/API:** Firebase Cloud Functions (Node.js 22).

Với stack này, hệ thống gần như không cần quản lý máy chủ vật lý, khả năng scale (mở rộng) dễ dàng thông qua hệ sinh thái của Google Cloud.
