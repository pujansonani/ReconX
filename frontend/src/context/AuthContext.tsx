import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type AuthProvider as FirebaseAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, microsoftProvider, db } from '../firebase.ts';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: string;
  isDemo?: boolean;
  lastLoginAt?: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signInWithMicrosoft: () => Promise<boolean>;
  signInAsDemoUser: (name?: string, email?: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem('reconx_auth_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Sync user profile to Cloud Firestore
  const syncUserToFirestore = async (
    uid: string,
    displayName: string,
    email: string,
    photoURL: string | null,
    isDemo: boolean = false
  ) => {
    const profile: UserProfile = {
      uid,
      displayName,
      email,
      photoURL,
      role: 'Senior Settlement Controller',
      isDemo
    };

    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...profile,
        lastLoginAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        app: 'ReconX'
      }, { merge: true });
    } catch (err: any) {
      console.warn('Firestore write warning (saving in local storage & memory):', err);
    }

    setUserProfile(profile);
    localStorage.setItem('reconx_auth_user', JSON.stringify(profile));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserToFirestore(
          currentUser.uid,
          currentUser.displayName || 'Finance Controller',
          currentUser.email || '',
          currentUser.photoURL,
          false
        );
      } else if (!userProfile?.isDemo) {
        // If not a demo user and no firebase user, clear
        setUserProfile(null);
        localStorage.removeItem('reconx_auth_user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Human-readable messages for the common Firebase OAuth failure codes.
  const mapAuthError = (err: any, label: string): string => {
    switch (err?.code) {
      case 'auth/operation-not-allowed':
        return `${label} sign-in is not enabled in the Firebase Console. Enable it under Authentication → Sign-in method in project reconx-c988b, or use the Quick Controller Sign-in below.`;
      case 'auth/unauthorized-domain': {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'your deployed domain';
        return `Domain '${currentHost}' is not authorized by Firebase. To fix: Open Firebase Console → Authentication → Settings → Authorized domains → Add '${currentHost}' (or simply add 'vercel.app' to authorize all Vercel deployments).`;
      }
      case 'auth/popup-blocked':
        return 'The sign-in popup was blocked by your browser. Please allow popups, or use the Quick Controller Sign-in.';
      case 'auth/popup-closed-by-user':
        return 'The sign-in popup was closed before authentication completed.';
      case 'auth/cancelled-popup-request':
        return 'Another sign-in request is already in progress.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using a different sign-in provider. Sign in with the original provider first, then link the new one.';
      default:
        return err?.message || `Failed to authenticate with ${label}.`;
    }
  };

  // Shared popup OAuth flow for Google and Microsoft. Returns true on success
  // so callers can close the sign-in modal only when auth actually completed.
  const signInWithProvider = async (
    provider: FirebaseAuthProvider,
    label: string
  ): Promise<boolean> => {
    setAuthError(null);
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await syncUserToFirestore(
          result.user.uid,
          result.user.displayName || 'Finance Officer',
          result.user.email || '',
          result.user.photoURL,
          false
        );
      }
      return true;
    } catch (err: any) {
      console.error(`${label} Sign-In Error:`, err);
      setAuthError(mapAuthError(err, label));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = () => signInWithProvider(googleProvider, 'Google');
  const signInWithMicrosoft = () => signInWithProvider(microsoftProvider, 'Microsoft');

  const signInAsDemoUser = async (
    name: string = 'Pujan Sonani',
    email: string = 'pujan.sonani@reconx.fintech'
  ) => {
    setAuthError(null);
    setLoading(true);
    const demoUid = `usr_ctrl_${Math.random().toString(36).substring(2, 9)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    
    await syncUserToFirestore(demoUid, name, email, avatarUrl, true);
    setLoading(false);
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('reconx_auth_user');
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithMicrosoft,
        signInAsDemoUser,
        signOutUser,
        authError,
        clearAuthError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
