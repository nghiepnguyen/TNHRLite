# Hosting & Deployment

Toàn bộ quá trình triển khai dự án đều nằm trong hạ tầng của Firebase.

## 1. Firebase Hosting

- Ứng dụng React/Vite sau khi build sẽ tạo ra thư mục `dist`.
- File tĩnh này được upload tự động lên Firebase Hosting, CDN toàn cầu của Google giúp thời gian load nhanh đáng kể.
- URL Tên miền tuỳ chỉnh: `https://recuiter.cvfit.pro` (Production) hoặc mặc định `https://tn-hr-lite.web.app`.

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

## 3. Security Headers (HTTP Response Headers)

Dự án cấu hình các security headers quan trọng trong `firebase.json` để bảo vệ người dùng:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Ngăn clickjacking — không cho phép nhúng trang vào iframe |
| `X-Content-Type-Options` | `nosniff` | Ngăn MIME-type sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Hạn chế thông tin referrer khi cross-origin |
| `X-XSS-Protection` | `0` | Tắt XSS filter cũ của browser (dùng CSP thay thế) |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Tắt quyền truy cập camera, microphone, vị trí |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseinstallations.googleapis.com; frame-src https://*.firebaseapp.com https://*.web.app; object-src 'none'; base-uri 'self'; form-action 'self';` | Bảo vệ chống XSS, inline script injection, data exfiltration |

Cấu hình trong `firebase.json`:
```json
"headers": [
  {
    "source": "**",
    "headers": [
      { "key": "X-Frame-Options", "value": "DENY" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "X-XSS-Protection", "value": "0" },
      { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
      { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https: blob:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseinstallations.googleapis.com https://firebasestorage.googleapis.com; frame-src https://*.firebaseapp.com https://*.web.app; object-src 'none'; base-uri 'self'; form-action 'self';" }
    ]
  }
]
```

## 4. CORS Configuration (Cloud Functions)

Backend API sử dụng CORS whitelist thay vì `origin: '*'` để ngăn chặn cross-origin attacks:

**Allowed Origins:**
- `https://recuiter.cvfit.pro` (custom domain)
- `https://tn-hr-lite.web.app`, `https://tn-hr-lite.firebaseapp.com` (Firebase Hosting)
- `http://localhost:*`, `http://127.0.0.1:*` (development)
- Requests không có origin header (server-to-server, mobile apps)

Cấu hình trong `functions/index.js`:
```javascript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

## 5. Quy trình Deploy (Deploy Flow)

### 5.1. Deploy thủ công (Manual Deploy)

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

### 5.2. CI/CD Tự động (GitHub Actions)

Dự án có workflow CI/CD tự động cấu hình tại `.github/workflows/deploy.yml`:

**Trigger:**
- Push lên branch `main`
- Pull request vào `main`

**Workflow steps:**
1. **Checkout code** với `actions/checkout@v5`
2. **Setup Node.js** với `actions/setup-node@v5`, Node.js 22
3. **Install frontend dependencies** (`npm ci`)
4. **Build frontend** (`npm run build`) với tất cả secrets
5. **Deploy to Firebase** (chỉ khi push lên `main`) qua `FirebaseExtended/action-hosting-deploy@v0`

**Secrets cần cấu hình trong GitHub:**
| Secret | Mô tả |
|--------|-------|
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON cho Firebase deploy |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `GITHUB_TOKEN` | Tự động cung cấp bởi GitHub |
| `VITE_FIREBASE_API_KEY` | Firebase config API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID (Analytics) |
| `VITE_RECAPTCHA_SITE_KEY` | Google reCAPTCHA site key |
| `VITE_ADMIN_EMAIL` | Email quản trị hệ thống |

**Lưu ý quan trọng:**
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` để đảm bảo runtime Node 24 cho GitHub Actions runner.
- Deploy chỉ chạy khi push lên `main` (`github.ref == 'refs/heads/main' && github.event_name == 'push'`).

## 6. Biến môi trường Frontend (`.env`)

| Biến | Mô tả |
|------|--------|
| `VITE_ADMIN_EMAIL` | Email được coi là admin toàn hệ thống (hiện link Admin Portal, khớp `ADMIN_EMAIL` backend) |
| `VITE_FIREBASE_API_KEY` | Firebase config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID |
| `VITE_RECAPTCHA_SITE_KEY` | reCAPTCHA v3 site key |

Các biến Firebase giữ nguyên như cấu hình dự án.

## 7. Kiểm tra sau Deploy

1. **Auth Flow:** Đăng nhập bằng Email + Google OAuth (kiểm tra `signInWithRedirect` fallback khi popup bị chặn).
2. **Plans & Usage:** Đăng nhập user thường → Dashboard thấy **UsageMeter** hiển thị mức dùng jobs/candidates/CV. Chạm giới hạn → **UpgradeModal** gửi được yêu cầu (Firestore `upgradeRequests` + email nếu đã cấu hình Resend).
3. **Admin Portal:** Đăng nhập admin → `/admin` → duyệt yêu cầu nâng cấp hoặc đổi `plan` workspace trực tiếp.
4. **Email Notifications:** Tạo job, thêm candidate, cập nhật pipeline → kiểm tra email có được gửi qua Resend.
5. **Security Headers:** Kiểm tra response headers (CSP, X-Frame-Options, etc.) có mặt trên tất cả requests.
6. **CORS:** Gọi API từ origin không hợp lệ phải bị reject.
7. **Rate Limiting:** Gửi >5 requests/phút đến `/api/support` → nhận `429 Too Many Requests`.
8. **Cascade Delete:** Xóa workspace → kiểm tra tất cả dữ liệu liên quan (jobs, candidates, applications, members, invites, upgrade requests) đã bị xóa.
9. Nếu email không gửi: kiểm tra log Functions — chế độ mock khi thiếu `RESEND_API_KEY` vẫn lưu request.

> **Lưu ý quan trọng:** Đối với Backend, phải thiết lập các API Key thông qua Secret Manager của Firebase trước khi Deploy Cloud Functions:
> - Gemini AI: `firebase functions:secrets:set GEMINI_API_KEY`
> - Resend API: `firebase functions:secrets:set RESEND_API_KEY`
> - Resend Sender: `firebase functions:secrets:set RESEND_FROM_EMAIL`
> - Admin / Billing (tuỳ chọn, có thể set qua `.env` functions hoặc secrets): `ADMIN_EMAIL`, `BILLING_EMAIL`

## 8. Cấu trúc Firebase Hosting Config (`firebase.json`)

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "/api/**", "function": "api" },
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "X-XSS-Protection", "value": "0" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
          { "key": "Content-Security-Policy", "value": "..." }
        ]
      }
    ],
    "cleanUrls": true,
    "trailingSlash": false
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs22"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}