import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Database,
  Mail,
  Sparkles,
  ExternalLink,
  X,
  AlertCircle,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const GoogleAuthButton: React.FC = () => {
  const {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signInWithMicrosoft,
    signInAsDemoUser,
    signOutUser,
    authError,
    clearAuthError
  } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [customName, setCustomName] = useState('Pujan Sonani');
  const [customEmail, setCustomEmail] = useState('pujan.sonani@reconx.fintech');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAuth = () => {
    clearAuthError();
    setModalOpen(true);
  };

  const handleGoogleSignInDirect = async () => {
    const ok = await signInWithGoogle();
    if (ok) setModalOpen(false);
  };

  const handleMicrosoftSignInDirect = async () => {
    const ok = await signInWithMicrosoft();
    if (ok) setModalOpen(false);
  };

  const handleQuickDemoSignIn = async () => {
    await signInAsDemoUser(customName, customEmail);
    setModalOpen(false);
  };

  if (loading && !userProfile) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-line bg-surface text-[11px] text-fg-muted animate-pulse">
        <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <span>Authenticating...</span>
      </div>
    );
  }

  // Not Logged In -> Show "Sign in with Google" button
  if (!userProfile) {
    return (
      <>
        <button
          onClick={handleOpenAuth}
          className="flex items-center gap-1.5 px-2 py-1 rounded-control border border-line bg-surface hover:bg-subtle text-fg text-xs font-semibold transition-all shadow-e1 hover:shadow-e2 cursor-pointer group whitespace-nowrap"
          title="Sign in with Google"
        >
          {/* Google Official G Logo */}
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-[11px]">Sign in</span>
        </button>

        {/* Firebase Authentication Modal — portaled to <body> with z-[99999] so it escapes all parent stacking contexts */}
        {modalOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-md bg-surface border border-line rounded-card shadow-e4 p-6 space-y-5 text-fg">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-control bg-gradient-to-tr from-[#0077B6] to-[#48CAE4] text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-fg">
                      ReconX Authentication
                    </h3>
                    <p className="text-[11px] text-fg-muted font-mono">
                      Firebase Project: reconx-c988b
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-control text-fg-muted hover:text-fg hover:bg-subtle transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Alert if any */}
              {authError && (
                <div className="p-3.5 bg-danger-soft border border-danger-line rounded-control text-xs space-y-2 text-danger-text">
                  <div className="flex items-start gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                    <span>Firebase Auth Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed pl-6">{authError}</p>
                  <div className="pl-6 pt-1">
                    <a
                      href="https://console.firebase.google.com/project/reconx-c988b/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-accent underline hover:opacity-80"
                    >
                      <span>Open Sign-in providers in Firebase Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Primary Action 1: Google Sign-In with Firebase Popup */}
              <div className="space-y-3">
                <button
                  onClick={handleGoogleSignInDirect}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-control border border-line bg-surface hover:bg-subtle text-fg font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-e1 hover:shadow-e2 cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google Account</span>
                </button>

                {/* Primary Action 1b: Microsoft / Azure AD (organisation sign-in) */}
                <button
                  onClick={handleMicrosoftSignInDirect}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-control border border-line bg-surface hover:bg-subtle text-fg font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-e1 hover:shadow-e2 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23" aria-hidden="true">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Continue with Microsoft (Organisation)</span>
                </button>

                <div className="relative flex py-1.5 items-center">
                  <div className="grow border-t border-line"></div>
                  <span className="shrink mx-3 text-[10px] font-bold text-fg-muted uppercase tracking-wider">
                    or instant quick login
                  </span>
                  <div className="grow border-t border-line"></div>
                </div>

                {/* Primary Action 2: 1-Click Finance Controller Sign-In */}
                <div className="p-3.5 bg-subtle border border-line rounded-card space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-fg">Quick Controller Login</span>
                    <Badge variant="blue">Instant Firestore Sync</Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] text-fg-muted font-semibold block mb-0.5">
                        Officer Name
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-control border border-line bg-surface text-xs text-fg font-semibold outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-fg-muted font-semibold block mb-0.5">
                        Corporate Email
                      </label>
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-control border border-line bg-surface text-xs text-fg font-mono outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={handleQuickDemoSignIn}
                    icon={<Zap className="w-3.5 h-3.5 fill-current" />}
                    className="font-bold shadow-e1"
                  >
                    Sign In as {customName.split(' ')[0]} (Finance Controller)
                  </Button>
                </div>
              </div>

              {/* Firestore Security Notice */}
              <div className="p-2.5 bg-accent-soft border border-accent-soft-line rounded-control flex items-center gap-2 text-[10px] text-accent-text">
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>Profiles automatically persist to Cloud Firestore collection <strong className="font-mono">users/{'{uid}'}</strong>.</span>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  // Logged In -> Show User Profile picture and name with dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1 pr-2 rounded-control border border-line bg-surface hover:bg-subtle text-fg transition-all cursor-pointer shadow-e1"
        title="View User Profile"
      >
        {/* User Profile Avatar Picture */}
        {userProfile.photoURL ? (
          <img
            src={userProfile.photoURL}
            alt={userProfile.displayName || 'User Avatar'}
            className="w-6 h-6 rounded-tile object-cover ring-1 ring-accent/40"
          />
        ) : (
          <div className="w-6 h-6 rounded-tile bg-gradient-to-tr from-[#0077B6] to-[#48CAE4] text-white flex items-center justify-center font-bold text-[11px]">
            {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
        )}

        {/* Name and Chevron */}
        <div className="text-left hidden sm:block">
          <span className="text-[11px] font-bold text-fg block leading-tight truncate max-w-[100px]">
            {userProfile.displayName || 'Controller'}
          </span>
          <span className="text-[9px] text-ok-text font-semibold block leading-tight">
            ● Online
          </span>
        </div>

        <ChevronDown className={`w-3 h-3 text-fg-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* User Details Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-surface border border-line rounded-card shadow-e4 z-[9999] space-y-3 text-xs text-fg animate-in fade-in zoom-in-95 duration-100">
          {/* Header Info */}
          <div className="flex items-center gap-3 pb-3 border-b border-line">
            {userProfile.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName || 'Profile'}
                className="w-10 h-10 rounded-tile object-cover ring-2 ring-accent"
              />
            ) : (
              <div className="w-10 h-10 rounded-tile bg-gradient-to-tr from-[#0077B6] to-[#48CAE4] text-white flex items-center justify-center font-extrabold text-sm">
                {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold text-sm text-fg block truncate">
                {userProfile.displayName || 'Finance Officer'}
              </span>
              <span className="text-[11px] text-fg-muted truncate block">
                {userProfile.email}
              </span>
              <Badge variant="success" className="mt-1">
                Verified Finance Officer
              </Badge>
            </div>
          </div>

          {/* Firestore Sync Badge */}
          <div className="p-2.5 bg-subtle rounded-control border border-line space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-accent-text">
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Cloud Firestore Sync</span>
              </div>
              <span className="text-[9px] text-ok-text font-mono">Active</span>
            </div>
            <p className="text-[10px] text-fg-muted font-mono truncate">
              users/{userProfile.uid}
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              setDropdownOpen(false);
              signOutUser();
            }}
            className="w-full p-2 rounded-control border border-danger-line bg-danger-soft hover:opacity-90 text-danger-text font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
