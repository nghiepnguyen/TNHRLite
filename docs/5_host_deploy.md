# Hosting & Deployment

Toàn bộ quá trình triển khai dự án đều nằm trong hạ tầng của Firebase.

## 1. Firebase Hosting

- Ứng dụng React/Vite sau khi build sẽ tạo ra thư mục `dist`.
- File tĩnh này được upload tự động lên Firebase Hosting, CDN toàn cầu của Google giúp thời gian load nhanh đáng kể.
- URL Tên miền tuỳ chỉnh hoặc mặc định (ví dụ: `https://tn-hr-lite.web.app`).

## 2. Quy trình Deploy (Deploy Flow)

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

> **Lưu ý quan trọng:** Đối với Backend, phải thiết lập API Key của Gemini AI thông qua Secret Manager của Firebase (`firebase functions:secrets:set GEMINI_API_KEY`) trước khi Deploy Cloud Functions.
