import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AppSettings } from '../types';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.ts';
import {
  Settings as SettingsIcon,
  Sliders,
  Sparkles,
  CheckCircle2,
  Lock,
  Coins,
  Sun,
  Moon,
  Bot,
  Database,
  ExternalLink,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    amount_tolerance: 0.01,
    date_window_days: 3,
    default_gst_rate: 0.18,
    has_gemini_key: false,
    gemini_model: 'gemini-2.5-flash'
  });
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testingFirebase, setTestingFirebase] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  }>({
    tested: false,
    success: false,
    message: ''
  });

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  const handleTestFirebase = async () => {
    setTestingFirebase(true);
    setFirebaseStatus({ tested: false, success: false, message: '' });
    try {
      const testDocRef = doc(db, 'reconciliations', 'firestore_connection_ping');
      await setDoc(testDocRef, {
        ping: 'pong',
        test_time: new Date().toISOString(),
        timestamp: serverTimestamp(),
        app: 'ReconX'
      });
      setFirebaseStatus({
        tested: true,
        success: true,
        message: 'Successfully connected and wrote test document to Cloud Firestore (reconx-c988b)!'
      });
    } catch (e: any) {
      console.error('Firebase test error:', e);
      if (e.code === 'permission-denied' || e.message?.includes('permission')) {
        setFirebaseStatus({
          tested: true,
          success: false,
          message: 'Firestore is created but Security Rules need to allow writes. In Firebase Console > Firestore > Rules, set `allow read, write: if true;` or enable Test Mode.'
        });
      } else if (e.message?.includes('disabled') || e.message?.includes('not been used') || e.code === 'unavailable') {
        setFirebaseStatus({
          tested: true,
          success: false,
          message: 'Cloud Firestore database has not been created yet in project reconx-c988b. Click "Open Firebase Console" below and click "Create database".'
        });
      } else {
        setFirebaseStatus({
          tested: true,
          success: false,
          message: e.message || 'Could not reach Firestore. Please check your internet connection and Firebase Console.'
        });
      }
    } finally {
      setTestingFirebase(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload: any = {
        amount_tolerance: settings.amount_tolerance,
        date_window_days: settings.date_window_days,
        default_gst_rate: settings.default_gst_rate,
        gemini_model: settings.gemini_model
      };
      if (apiKeyInput) {
        payload.gemini_api_key = apiKeyInput;
      }
      const res = await api.updateSettings(payload);
      setSettings(res.settings);
      setApiKeyInput('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Error saving settings:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">System Settings & Tolerances</h1>
          <Badge variant="blue">Config</Badge>
        </div>
        <p className="text-xs text-[var(--text-muted)] font-medium">
          Configure financial arithmetic tolerances, GST tax rates, appearance themes, Firebase cloud database, and Google Gemini AI credentials
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Reconciliation settings updated successfully!</span>
        </div>
      )}

      {/* Appearance Theme Selector Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-[#0077B6]" />}
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Appearance & Color Theme</h3>
          </div>
          <Badge variant={theme === 'dark' ? 'warning' : 'success'}>
            {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Light Theme Card */}
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
              theme === 'light'
                ? 'border-[#0077B6] bg-sky-50/50 shadow-md ring-2 ring-[#0077B6]/20'
                : 'border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[#0077B6]/50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0077B6] shrink-0 shadow-xs">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[var(--text-primary)] block">Clean Light Mode</span>
              <p className="text-[11px] text-[var(--text-muted)]">
                Bright background (#F8FAFC) with deep slate typography & high-contrast badges.
              </p>
            </div>
          </div>

          {/* Dark Theme Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
              theme === 'dark'
                ? 'border-[#0077B6] bg-slate-900 shadow-md ring-2 ring-[#0077B6]/20'
                : 'border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[#0077B6]/50'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[var(--text-primary)] block">Obsidian Dark Mode</span>
              <p className="text-[11px] text-[var(--text-muted)]">
                Deep obsidian background (#080C14) with radiant oceanic accents and glassmorphism.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Cloud Firestore Live Status & Setup Card */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Firebase Cloud Firestore Live Database</h3>
          </div>
          <Badge variant="blue">Project: reconx-c988b</Badge>
        </div>

        <div className="space-y-3 text-xs">
          <p className="text-[var(--text-secondary)] leading-relaxed">
            ReconX stores reconciliation runs, match details, live streaming transactions, custom batch scenarios, and controller resolution decisions in Cloud Firestore.
          </p>

          {/* Step by step guide if database is not yet created in console */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>To see your data live in the Firebase Console:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-800 dark:text-amber-300 font-medium pl-1">
              <li>Open your project's Firestore console by clicking <strong>"Open Firebase Firestore Console"</strong> below.</li>
              <li>Click the blue <strong>"Create database"</strong> button.</li>
              <li>Select your preferred Database Location (e.g. <code>asia-south1 (Mumbai)</code> or <code>nam5 (us-central)</code>).</li>
              <li>Security rules: Select <strong>"Start in test mode"</strong> (allows reads/writes during development).</li>
              <li>Click <strong>Create</strong>. Then click <strong>"Test Live Firestore Connection"</strong> below!</li>
            </ol>
          </div>

          {firebaseStatus.tested && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-start gap-2 ${
                firebaseStatus.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200'
              }`}
            >
              {firebaseStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{firebaseStatus.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://console.firebase.google.com/project/reconx-c988b/firestore"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-[#0077B6] hover:bg-[#023E8A] text-white font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Firebase Firestore Console (reconx-c988b)</span>
            </a>

            <button
              type="button"
              onClick={handleTestFirebase}
              disabled={testingFirebase}
              className="px-3.5 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-primary)] font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingFirebase ? 'animate-spin' : ''}`} />
              <span>{testingFirebase ? 'Testing Connection...' : 'Test Live Firestore Connection'}</span>
            </button>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Arithmetic & Reconciliation Rules Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-card)]">
            <Sliders className="w-4 h-4 text-[#0077B6]" />
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Reconciliation Arithmetic Rules</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Amount Tolerance (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.amount_tolerance}
                onChange={(e) => setSettings({ ...settings, amount_tolerance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs focus:ring-2 focus:ring-[#0077B6] outline-none"
              />
              <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                Max allowable penny variance for Tier 1 matching (default: ₹0.01).
              </span>
            </div>

            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Date Window (Days)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={settings.date_window_days}
                onChange={(e) => setSettings({ ...settings, date_window_days: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs focus:ring-2 focus:ring-[#0077B6] outline-none"
              />
              <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                Fuzzy date alignment tolerance for Tier 2 matching (default: 3 days).
              </span>
            </div>

            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Default GST Rate</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={settings.default_gst_rate}
                onChange={(e) => setSettings({ ...settings, default_gst_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs focus:ring-2 focus:ring-[#0077B6] outline-none"
              />
              <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                Standard tax rate on payment gateway MDR fees (default: 18% = 0.18).
              </span>
            </div>
          </div>
        </Card>

        {/* Gemini AI Intelligence Configuration Card */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-sm text-[var(--text-primary)]">Google Gemini AI Exception Intelligence Configuration</h3>
            </div>
            {settings.has_gemini_key ? (
              <Badge variant="success">Google Gemini Key Configured</Badge>
            ) : (
              <Badge variant="blue">Deterministic AI Synthesis Active</Badge>
            )}
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Google Gemini API Key (Optional)</label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={settings.has_gemini_key ? '••••••••••••••••••••••••••••' : 'AIzaSy...'}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs focus:ring-2 focus:ring-[#0077B6] outline-none"
              />
              <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                If omitted, ReconX uses the built-in deterministic financial intelligence synthesizer.
              </span>
            </div>

            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Google Gemini Model</label>
              <select
                value={settings.gemini_model}
                onChange={(e) => setSettings({ ...settings, gemini_model: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs focus:ring-2 focus:ring-[#0077B6] outline-none"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended - Fast & Accurate Financial Reasoning)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (High-Capacity Complex Journaling)</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isSaving}
            className="font-bold shadow-sm"
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
