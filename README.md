# HR-Lite

**HR-Lite** is a lightweight Human Resources Management System designed for efficiency and simplicity. It leverages modern web technologies and AI to streamline recruitment and candidate management processes.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Routing**: React Router 7
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Modern, Responsive)

### Backend & Cloud Services
- **Firebase**:
  - **Authentication**: Email/Password, Social login.
  - **Firestore**: NoSQL database for candidate, job, and user data.
  - **Storage**: For candidate CVs and attachments.
  - **Hosting**: Fast and secure web hosting.
  - **Cloud Functions**: Serverless backend for heavy processing (Node.js 22).
- **AI Integration**: Google Gemini AI (via SDK for candidate analysis and automated screening).

## 📂 Folder Structure

```text
HR-Lite/
├── src/                # Frontend source code
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context providers (Auth, Theme)
│   ├── hooks/          # Custom React hooks
│   ├── layouts/        # Page layouts (Dashboard, Auth)
│   ├── pages/          # Feature pages (Jobs, Candidates, Pipeline)
│   ├── services/       # Firebase service wrappers
│   ├── App.jsx         # Main App component & Routes
│   └── firebase.js     # Firebase SDK initialization
├── functions/          # Cloud Functions (Backend logic)
│   ├── index.js        # Main API entry point (Express)
│   └── package.json    # Backend dependencies (Gemini, Mammoth)
├── server/             # Local Development Server (Optional)
│   └── src/index.js    # Express server for local AI testing
├── public/             # Static assets
├── .env                # Local environment variables
└── firebase.json       # Firebase configuration
```

## 🔄 Data Flow

1.  **User Interaction**: Frontend sends requests via Firebase SDK or HTTP to Cloud Functions.
2.  **Authentication**: Handled by Firebase Auth on the client side.
3.  **Data Persistence**: Real-time updates via Firestore listeners or manual `set`/`add` operations.
4.  **Heavy Processing**: Documents (CVs) are uploaded to Storage, then analyzed by Cloud Functions using **Mammoth** (DOCX to text) and **Gemini AI** (Text to structured data).
5.  **Analytics**: Optional Google Analytics integration for tracking key user actions.

## 🚢 Deployment Flow

The project is hosted on Firebase.

1.  **Build Frontend**:
    ```bash
    npm run build
    ```
2.  **Deploy Everything**:
    ```bash
    firebase deploy
    ```
    *Note: Use `firebase deploy --only hosting` or `firebase deploy --only functions` for targeted updates.*

## 🔑 Environment Variables

The project requires the following keys in a `.env` file for local development:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
```

---

*This project was bootstrapped with [React + Vite](https://vitejs.dev/).*

## 🚀 Deployment

Follow these steps to deploy HR-Lite to production.

### 1. Configure Backend Secrets
Since the Gemini API key is sensitive, use Firebase Secrets Manager instead of `.env` for production:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```
*(Enter the key when prompted)*

### 2. Deploy Cloud Functions
Ensure you have the right admin email configured in your environment or via Google Cloud console.
```bash
firebase deploy --only functions
```

### 3. Deploy Frontend (Hosting)
First, build the production bundle:
```bash
npm run build
```
Then deploy to Firebase Hosting:
```bash
firebase deploy --only hosting
```

### 4. Admin Access
The primary admin is defined in `VITE_ADMIN_EMAIL` (.env) and the `ADMIN_EMAIL` environment variable for Cloud Functions. Default is `thanhnghiep@gmail.com`.
