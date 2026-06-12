import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DNPP2SHYL7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// App Check is temporarily disabled to unblock Google Sign-In.
// To re-enable: register reCAPTCHA site key for this domain at
// https://www.google.com/recaptcha/admin and set VITE_RECAPTCHA_SITE_KEY in .env.
// Then uncomment the block below and remove the null assignment.
//
// const isLocalhost = typeof window !== 'undefined' && 
//   (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
// let _appCheck = null;
// if (typeof window !== 'undefined' && !isLocalhost) {
//   try {
//     const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
//     if (siteKey) {
//       _appCheck = initializeAppCheck(app, {
//         provider: new ReCaptchaV3Provider(siteKey),
//         isTokenAutoRefreshEnabled: true
//       });
//     }
//   } catch (e) {
//     console.warn('App Check initialization failed:', e);
//   }
// }
// export const appCheck = _appCheck;

export const appCheck = null;

// Allow App Check Debug Mode on localhost
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
if (isLocalhost) {
  try {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  } catch (_) { /* ignore in non-browser env */ }
}

// Initialize Analytics - Disable on localhost to avoid Installations API 403 errors
export const analytics = (typeof window !== 'undefined' && !isLocalhost) 
  ? getAnalytics(app) 
  : null;

export default app;
