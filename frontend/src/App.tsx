import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Upload,
  Zap,
  PlusCircle,
  Home,
  Sun,
  Moon,
  FileCheck2
} from 'lucide-react';
import { Navbar, NAV_ITEMS } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CommandPalette, useCommandPalette, type CommandItem } from './components/ui/CommandPalette';
import { useTheme } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadReconcilePage } from './pages/UploadReconcilePage';
import { ReconciliationsPage } from './pages/ReconciliationsPage';
import { ReconciliationDetailPage } from './pages/ReconciliationDetailPage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { SettingsPage } from './pages/SettingsPage';
import { RazorpaySentinelPage } from './pages/RazorpaySentinelPage';
import { PipelineAnimation } from './components/reconciliation/PipelineAnimation';
import { ReconciliationRunSummary, DashboardAnalytics } from './types';
import { api } from './services/api';
import {
  saveReconciliationToFirestore,
  subscribeToReconciliations
} from './services/firestoreService';
import { MOTION_DURATIONS, MOTION_EASE } from './components/motion/MotionSystem';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [runs, setRuns] = useState<ReconciliationRunSummary[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [demoAnimationRunning, setDemoAnimationRunning] = useState(false);
  const [pendingDemoRunId, setPendingDemoRunId] = useState<string | null>(null);
  const [initialExceptionCategory, setInitialExceptionCategory] = useState<string>('ALL');
  const shouldReduceMotion = useReducedMotion();
  const palette = useCommandPalette();
  const { theme, toggleTheme } = useTheme();

  const navigate = (tab: string) => {
    if (tab !== 'detail') setSelectedRunId(null);
    setCurrentTab(tab);
  };

  const fetchGlobalData = async () => {
    try {
      const [runsList, analyticsData] = await Promise.all([
        api.listReconciliations(),
        api.getDashboardAnalytics()
      ]);
      if (runsList && runsList.length > 0) {
        setRuns(runsList);
        // Sync each run to Cloud Firestore in the background
        runsList.forEach(async (r) => {
          try {
            await saveReconciliationToFirestore(r);
          } catch (err) {
            console.warn('[Firestore Sync] Run sync:', err);
          }
        });
      }
      setAnalytics(analyticsData);
    } catch (e) {
      console.error('Error fetching global platform data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  // 1. Initial load from API & setup Firestore real-time listener
  useEffect(() => {
    fetchGlobalData();

    // Subscribe in real-time to Cloud Firestore
    const unsubscribeFirestore = subscribeToReconciliations((firestoreRuns) => {
      if (firestoreRuns && firestoreRuns.length > 0) {
        setRuns((prev) => {
          // Merge unique runs
          const map = new Map<string, ReconciliationRunSummary>();
          firestoreRuns.forEach((r) => map.set(r.id, r));
          prev.forEach((r) => {
            if (!map.has(r.id)) map.set(r.id, r);
          });
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      }
    });

    return () => {
      unsubscribeFirestore();
    };
  }, []);

  const handleTryDemo = async () => {
    try {
      setLoadingDemo(true);
      const res = await api.preloadDemo('ADVERSARIAL', 2000);
      setPendingDemoRunId(res.run_id);
      setDemoAnimationRunning(true);
    } catch (e) {
      console.error('Error preloading demo:', e);
      setLoadingDemo(false);
    }
  };

  const handleDemoAnimationComplete = async () => {
    setDemoAnimationRunning(false);
    setLoadingDemo(false);
    await fetchGlobalData();
    if (pendingDemoRunId) {
      // Sync full demo detail to Firestore
      try {
        const detail = await api.getReconciliation(pendingDemoRunId);
        const [matchesRes, exceptionsRes] = await Promise.all([
          api.getMatches(pendingDemoRunId),
          api.getExceptions(pendingDemoRunId)
        ]);
        await saveReconciliationToFirestore(detail, matchesRes.matches, exceptionsRes.exceptions);
      } catch (err) {
        console.warn('[Firestore] Error syncing full demo detail:', err);
      }

      setSelectedRunId(pendingDemoRunId);
      setCurrentTab('detail');
    } else {
      setCurrentTab('dashboard');
    }
  };

  const handleSelectRun = (runId: string) => {
    setSelectedRunId(runId);
    setCurrentTab('detail');
  };

  const handleReconciliationCompleted = async (runId: string) => {
    await fetchGlobalData();
    try {
      const detail = await api.getReconciliation(runId);
      const [matchesRes, exceptionsRes] = await Promise.all([
        api.getMatches(runId),
        api.getExceptions(runId)
      ]);
      await saveReconciliationToFirestore(detail, matchesRes.matches, exceptionsRes.exceptions);
    } catch (err) {
      console.warn('[Firestore] Error syncing uploaded reconciliation detail:', err);
    }

    setSelectedRunId(runId);
    setCurrentTab('detail');
  };

  // Pages, quick actions, and recent runs, all reachable from ⌘K. Nav pages
  // reuse NAV_ITEMS so the palette can never list a page the nav doesn't.
  const commandItems = useMemo<CommandItem[]>(() => {
    const pages: CommandItem[] = NAV_ITEMS.map((item) => {
      const Icon = item.icon;
      return {
        id: `nav:${item.id}`,
        label: item.label,
        group: 'Navigate',
        keywords: 'page tab open go to',
        icon: <Icon className="size-4" />,
        onSelect: () => navigate(item.id)
      };
    });

    const actions: CommandItem[] = [
      {
        id: 'action:demo',
        label: 'Try Demo (2,000 transactions)',
        group: 'Actions',
        hint: 'Run',
        keywords: 'sample adversarial preload',
        icon: <Zap className="size-4" />,
        onSelect: handleTryDemo
      },
      {
        id: 'action:new',
        label: 'New Reconciliation',
        group: 'Actions',
        keywords: 'upload create start',
        icon: <PlusCircle className="size-4" />,
        onSelect: () => navigate('upload')
      },
      {
        id: 'action:upload',
        label: 'Upload Files',
        group: 'Actions',
        keywords: 'csv import ledger',
        icon: <Upload className="size-4" />,
        onSelect: () => navigate('upload')
      },
      {
        id: 'action:theme',
        label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        group: 'Actions',
        keywords: 'theme appearance dark light toggle',
        icon: theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />,
        onSelect: toggleTheme
      },
      {
        id: 'action:landing',
        label: 'Product Tour',
        group: 'Actions',
        keywords: 'home landing overview',
        icon: <Home className="size-4" />,
        onSelect: () => navigate('landing')
      }
    ];

    const recent: CommandItem[] = runs.slice(0, 6).map((run) => ({
      id: `run:${run.id}`,
      label: run.name,
      group: 'Recent runs',
      hint: `${run.match_rate}% matched`,
      keywords: `${run.scenario_type} reconciliation ${run.id}`,
      icon: <FileCheck2 className="size-4" />,
      onSelect: () => handleSelectRun(run.id)
    }));

    return [...pages, ...actions, ...recent];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runs, theme]);

  return (
    <div className="flex min-h-screen flex-col bg-page text-fg">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={navigate}
        onTryDemo={handleTryDemo}
        onNewRecon={() => setCurrentTab('upload')}
        onOpenCommandPalette={palette.open}
        loadingDemo={loadingDemo}
      />

      {/* Main Content Area with Page Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab + (selectedRunId || '')}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{
              duration: MOTION_DURATIONS.normal,
              ease: MOTION_EASE.outExpo
            }}
          >
            {currentTab === 'landing' && (
              <LandingPage
                onTryDemo={handleTryDemo}
                onNewRecon={() => setCurrentTab('upload')}
                onGoToDashboard={() => setCurrentTab('dashboard')}
                loadingDemo={loadingDemo}
              />
            )}

            {currentTab === 'dashboard' && (
              <DashboardPage
                analytics={analytics}
                runs={runs}
                loading={loadingData}
                onSelectRun={handleSelectRun}
                onNewRecon={() => setCurrentTab('upload')}
                onTryDemo={handleTryDemo}
                onNavigateTab={setCurrentTab}
                onSelectCategoryFilter={(cat) => setInitialExceptionCategory(cat)}
                loadingDemo={loadingDemo}
              />
            )}

            {currentTab === 'upload' && (
              <UploadReconcilePage
                onReconciliationCompleted={handleReconciliationCompleted}
              />
            )}

            {currentTab === 'reconciliations' && (
              <ReconciliationsPage
                runs={runs}
                onSelectRun={handleSelectRun}
                onNewRecon={() => setCurrentTab('upload')}
                onTryDemo={handleTryDemo}
                loadingDemo={loadingDemo}
              />
            )}

            {currentTab === 'detail' && selectedRunId && (
              <ReconciliationDetailPage
                runId={selectedRunId}
                onBack={() => setCurrentTab('reconciliations')}
              />
            )}

            {currentTab === 'exceptions' && (
              <ExceptionsPage
                runs={runs}
                initialCategory={initialExceptionCategory}
              />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsPage
                analytics={analytics}
                runs={runs}
                onSelectCategoryFilter={(cat) => setInitialExceptionCategory(cat)}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'evaluation' && (
              <EvaluationPage />
            )}

            {currentTab === 'razorpay' && (
              <RazorpaySentinelPage />
            )}

            {currentTab === 'settings' && (
              <SettingsPage />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Pipeline Animation for Demo Loader */}
      <PipelineAnimation
        isRunning={demoAnimationRunning}
        onComplete={handleDemoAnimationComplete}
      />

      {/* Global command palette (⌘K) */}
      <CommandPalette isOpen={palette.isOpen} onClose={palette.close} items={commandItems} />

      <Footer
        onProductTour={() => {
          setSelectedRunId(null);
          setCurrentTab('landing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSafetyBenchmark={() => {
          setSelectedRunId(null);
          setCurrentTab('evaluation');
        }}
      />
    </div>
  );
}

export default App;
