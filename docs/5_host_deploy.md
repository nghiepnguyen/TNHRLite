# Hosting & Deployment

Toàn bộ quá trình triển khai dự án đều nằm trong hạ tầng của Firebase.

## 1. Firebase Hosting

- Ứng dụng React/Vite sau khi build sẽ tạo ra thư mục `dist`.
- File tĩnh này được upload tự động lên Firebase Hosting, CDN toàn cầu của Google giúp thời gian load nhanh đáng kể.
- URL Tên miền tuỳ chỉnh: `https://hr.thanhnghiep.top` (Production) hoặc mặc định `https://tn-hr-lite.web.app`.

## 2. Cấu hình Điều hướng (Hosting Rewrites)

Một điểm cực kỳ quan trọng khi cộng tác với Cloud Functions Gen 2 là cấu hình rewrites trong `firebase.json`:
```json
"rewrites": [
  {
    "source": "/api/**",
    "function": "api"
  },
  {
    "source": "**",
    "destination": "/index.html"
  }
]
```
*Lưu ý: Firebase Hosting Gen 2 không tự động loại bỏ tiền tố `/api` khi chuyển tiếp request. Do đó, mã nguồn Express bên trong Function phải giữ nguyên `/api` trong định nghĩa route.*

## 3. Quy trình Deploy (Deploy Flow)

Để deploy dự án lên môi trường Production, làm theo các bước sau trong Terminal ở thư mục gốc của dự án:

1. **Chuẩn bị môi trường:**
   Đảm bảo `firebase-tools` đã được cài đặt (`npm i -g firebase-tools`) và đã login (`firebase login`).

2. **Build Mới Frontend:**
   ```bash
   npm run build
   ```
   *Quá trình này chạy bộ bundle của Vite và xuất ra thư mục `/dist`.*

3. **Deploy Trọn gói (Cả Frontend và Backend Functions):**
   ```bash
   firebase deploy
   ```

4. **Kỹ thuật Deploy phân tách (Khuyên dùng khi sửa luồng ngách):**
   - Chỉ Deploy giao diện: `firebase deploy --only hosting`
   - Chỉ Deploy Cloud Functions (API): `firebase deploy --only functions`
   - Chỉ Deploy Rules Security Database: `firebase deploy --only firestore:rules`
   - Gói billing / usage limits (khuyến nghị deploy cùng lúc):
     ```bash
     npm run build
     firebase deploy --only functions,firestore:rules,hosting
     ```

## 4. Biến môi trường Frontend (`.env`)

| Biến | Mô tả |
|------|--------|
| `VITE_ADMIN_EMAIL` | Email được coi là admin toàn hệ thống (hiện link Admin Portal, khớp `ADMIN_EMAIL` backend) |

Các biến Firebase (`VITE_*`) giữ nguyên như cấu hình dự án.

## 5. Kiểm tra sau Deploy

1. Đăng nhập user thường → Dashboard thấy **UsageMeter**; chạm giới hạn → **UpgradeModal** gửi được yêu cầu (Firestore `upgradeRequests` + email nếu đã cấu hình Resend).
2. Đăng nhập admin → `/admin` → duyệt yêu cầu hoặc đổi `plan` workspace.
3. Nếu email không gửi: kiểm tra log Functions — chế độ mock khi thiếu `RESEND_API_KEY` vẫn lưu request.

> **Lưu ý quan trọng:** Đối với Backend, phải thiết lập các API Key thông qua Secret Manager của Firebase trước khi Deploy Cloud Functions:
> - Gemini AI: `firebase functions:secrets:set GEMINI_API_KEY`
> - Resend API: `firebase functions:secrets:set RESEND_API_KEY`
> - Resend Sender: `firebase functions:secrets:set RESEND_FROM_EMAIL`
> - Admin / Billing (tuỳ chọn, có thể set qua `.env` functions hoặc secrets): `ADMIN_EMAIL`, `BILLING_EMAIL`
