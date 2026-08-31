import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's official Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyATkNnCYD2Ib9cL7Jio7StA8SjI7X3og2I",
  authDomain: "reconx-c988b.firebaseapp.com",
  projectId: "reconx-c988b",
  storageBucket: "reconx-c988b.firebasestorage.app",
  messagingSenderId: "52356171103",
  appId: "1:52356171103:web:98901337720ec68e2622ea",
  measurementId: "G-Z1RC804MGZ"
};

// Initialize Firebase app singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google sign-in provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Microsoft / Azure AD sign-in provider (organisation sign-in).
export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.setCustomParameters({
  // 'common' accepts any work, school, or personal Microsoft account.
  // To lock sign-in to YOUR organisation only, replace 'common' with your
  // Azure AD tenant ID (Entra ID → Overview → Directory (tenant) ID).
  tenant: 'common',
  prompt: 'select_account'
});
microsoftProvider.addScope('openid');
microsoftProvider.addScope('email');
microsoftProvider.addScope('profile');

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Firebase Analytics safely for browser
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export default app;
