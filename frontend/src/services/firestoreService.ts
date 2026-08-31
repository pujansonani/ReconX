import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase.ts';
import {
  ReconciliationRunSummary,
  MatchDetail,
  ExceptionDetail,
  AppSettings,
  DashboardAnalytics
} from '../types';
import { LiveEvent } from '../context/LiveReconContext';

export interface BatchScenario {
  id: string;
  name: string;
  bank_name: string;
  gateway_name: string;
  utr_ref: string;
  inward_credit: number;
  transactions: Array<{ id: string; amount: number; mdr_rate?: number }>;
  mdr_rate: number;
  gst_rate: number;
  refunds: number;
  chargebacks: number;
  residual_variance: number;
  created_at: string;
  updated_at?: string;
  created_by?: string;
}

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string;
  lastLogin: string;
  createdAt?: string;
}

// =========================================================================
// 1. RECONCILIATIONS COLLECTION
// =========================================================================

/**
 * Save or update a full Reconciliation Run into Firestore with matches & exceptions
 */
export async function saveReconciliationToFirestore(
  runSummary: ReconciliationRunSummary,
  matches?: MatchDetail[],
  exceptions?: ExceptionDetail[]
): Promise<void> {
  try {
    const runRef = doc(db, 'reconciliations', runSummary.id);
    await setDoc(
      runRef,
      {
        ...runSummary,
        synced_at: new Date().toISOString(),
        timestamp: serverTimestamp()
      },
      { merge: true }
    );

    // Save matches in sub-document or batch collection
    if (matches && matches.length > 0) {
      const matchDocRef = doc(db, 'reconciliation_matches', runSummary.id);
      await setDoc(matchDocRef, {
        run_id: runSummary.id,
        matches: matches.slice(0, 500), // Firestore document limit safe
        total_count: matches.length,
        updated_at: new Date().toISOString()
      }, { merge: true });
    }

    // Save exceptions in sub-document or batch collection
    if (exceptions && exceptions.length > 0) {
      const excDocRef = doc(db, 'reconciliation_exceptions', runSummary.id);
      await setDoc(excDocRef, {
        run_id: runSummary.id,
        exceptions: exceptions.slice(0, 500),
        total_count: exceptions.length,
        updated_at: new Date().toISOString()
      }, { merge: true });
    }

    console.log(`[Firestore] Successfully saved reconciliation run ${runSummary.id} to Cloud Firestore.`);
  } catch (error) {
    console.warn('[Firestore] Error saving reconciliation to Firestore:', error);
  }
}

/**
 * Real-time subscription to all Reconciliation Runs
 */
export function subscribeToReconciliations(
  onUpdate: (runs: ReconciliationRunSummary[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, 'reconciliations');
    const q = query(colRef, orderBy('created_at', 'desc'), limit(50));

    return onSnapshot(
      q,
      (snapshot) => {
        const runs: ReconciliationRunSummary[] = [];
        snapshot.forEach((docSnap) => {
          runs.push(docSnap.data() as ReconciliationRunSummary);
        });
        if (runs.length > 0) {
          onUpdate(runs);
        }
      },
      (error) => {
        console.warn('[Firestore] Real-time reconciliations subscription warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (err: any) {
    console.warn('[Firestore] Failed to attach reconciliations listener:', err);
    return () => {};
  }
}

/**
 * Fetch matches for a specific reconciliation run from Firestore
 */
export async function getMatchesFromFirestore(runId: string): Promise<MatchDetail[] | null> {
  try {
    const docRef = doc(db, 'reconciliation_matches', runId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().matches as MatchDetail[];
    }
    return null;
  } catch (e) {
    console.warn('[Firestore] Could not load matches from Firestore:', e);
    return null;
  }
}

/**
 * Fetch exceptions for a specific reconciliation run from Firestore
 */
export async function getExceptionsFromFirestore(runId: string): Promise<ExceptionDetail[] | null> {
  try {
    const docRef = doc(db, 'reconciliation_exceptions', runId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().exceptions as ExceptionDetail[];
    }
    return null;
  } catch (e) {
    console.warn('[Firestore] Could not load exceptions from Firestore:', e);
    return null;
  }
}

// =========================================================================
// 2. REAL-TIME EXCEPTION RESOLUTION
// =========================================================================

/**
 * Update an exception status and audit log in Firestore in real time
 */
export async function updateExceptionInFirestore(
  runId: string,
  exceptionId: string,
  updates: {
    status: 'REQUIRES_REVIEW' | 'RESOLVED' | 'ESCALATED' | 'IGNORED';
    resolution_notes?: string;
    resolved_by?: string;
    action?: string;
  }
): Promise<void> {
  try {
    // 1. Update in the reconciliation exceptions document
    const excDocRef = doc(db, 'reconciliation_exceptions', runId);
    const snap = await getDoc(excDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const currentExceptions: ExceptionDetail[] = data.exceptions || [];
      const updated = currentExceptions.map((exc) => {
        if (exc.id === exceptionId || exc.exception_code === exceptionId) {
          return {
            ...exc,
            status: updates.status,
            resolution_notes: updates.resolution_notes || exc.resolution_notes,
            resolved_by: updates.resolved_by || 'Controller (Firebase Auth)',
            resolved_at: new Date().toISOString(),
            resolution_action: updates.action || exc.resolution_action
          };
        }
        return exc;
      });

      await updateDoc(excDocRef, {
        exceptions: updated,
        last_updated: new Date().toISOString()
      });
    }

    // 2. Log to audit trail in Firestore
    const auditRef = doc(collection(db, 'audit_logs'));
    await setDoc(auditRef, {
      type: 'EXCEPTION_RESOLUTION',
      run_id: runId,
      exception_id: exceptionId,
      new_status: updates.status,
      notes: updates.resolution_notes || '',
      actor: updates.resolved_by || 'Controller',
      timestamp: serverTimestamp(),
      created_at: new Date().toISOString()
    });

    console.log(`[Firestore] Updated exception ${exceptionId} status to ${updates.status}`);
  } catch (e) {
    console.warn('[Firestore] Error updating exception in Firestore:', e);
  }
}

// =========================================================================
// 3. REAL-TIME LIVE INGESTION STREAM (live_events)
// =========================================================================

/**
 * Subscribe to real-time live transaction ingest stream from Firestore
 */
export function subscribeToLiveStreamFromFirestore(
  onEvent: (event: LiveEvent) => void,
  onInitialHistory?: (events: LiveEvent[]) => void
): () => void {
  try {
    const colRef = collection(db, 'live_events');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));

    let isFirstLoad = true;

    return onSnapshot(
      q,
      (snapshot) => {
        const events: LiveEvent[] = [];
        snapshot.forEach((d) => {
          const item = d.data();
          events.push({
            id: d.id,
            type: item.type || 'MATCH_SUCCESS',
            tier: item.tier,
            title: item.title || 'Transaction Event',
            order_id: item.order_id,
            gateway_id: item.gateway_id,
            bank_ref: item.bank_ref,
            gross_amount: item.gross_amount,
            net_amount: item.net_amount,
            fee: item.fee,
            variance: item.variance,
            status: item.status || 'RECONCILED',
            category: item.category,
            message: item.message || '',
            time: item.time || new Date().toLocaleTimeString()
          });
        });

        if (isFirstLoad) {
          isFirstLoad = false;
          if (onInitialHistory && events.length > 0) {
            onInitialHistory(events);
          }
        } else {
          // Listen for new docs
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const item = change.doc.data();
              onEvent({
                id: change.doc.id,
                type: item.type || 'MATCH_SUCCESS',
                tier: item.tier,
                title: item.title || 'Live Transaction Match',
                order_id: item.order_id,
                gateway_id: item.gateway_id,
                bank_ref: item.bank_ref,
                gross_amount: item.gross_amount,
                net_amount: item.net_amount,
                fee: item.fee,
                variance: item.variance,
                status: item.status || 'RECONCILED',
                category: item.category,
                message: item.message || '',
                time: item.time || new Date().toLocaleTimeString()
              });
            }
          });
        }
      },
      (err) => {
        console.warn('[Firestore] Live stream subscription note:', err);
      }
    );
  } catch (err) {
    console.warn('[Firestore] Failed to attach live stream listener:', err);
    return () => {};
  }
}

/**
 * Push a new transaction event to Firestore live stream collection
 */
export async function pushLiveEventToFirestore(event: Partial<LiveEvent>): Promise<void> {
  try {
    const docRef = doc(collection(db, 'live_events'));
    await setDoc(docRef, {
      ...event,
      timestamp: serverTimestamp(),
      created_at: new Date().toISOString()
    });
    console.log('[Firestore] Pushed live event to Firestore:', event.title);
  } catch (e) {
    console.warn('[Firestore] Error pushing live event:', e);
  }
}

// =========================================================================
// 4. BATCH DECOMPOSITION SCENARIOS (batch_scenarios)
// =========================================================================

/**
 * Save a custom Netted Batch Solver Scenario to Cloud Firestore
 */
export async function saveBatchScenarioToFirestore(scenario: BatchScenario): Promise<string> {
  try {
    const id = scenario.id || `batch_scen_${Date.now()}`;
    const docRef = doc(db, 'batch_scenarios', id);
    await setDoc(
      docRef,
      {
        ...scenario,
        id,
        updated_at: new Date().toISOString(),
        timestamp: serverTimestamp()
      },
      { merge: true }
    );
    console.log(`[Firestore] Saved batch scenario '${scenario.name}' (${id}) to Firestore`);
    return id;
  } catch (e) {
    console.error('[Firestore] Failed to save batch scenario:', e);
    throw e;
  }
}

/**
 * Subscribe in real time to all saved batch scenarios
 */
export function subscribeToBatchScenarios(
  onUpdate: (scenarios: BatchScenario[]) => void
): () => void {
  try {
    const colRef = collection(db, 'batch_scenarios');
    const q = query(colRef, orderBy('updated_at', 'desc'), limit(20));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: BatchScenario[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as BatchScenario);
        });
        onUpdate(list);
      },
      (err) => {
        console.warn('[Firestore] Batch scenarios subscription note:', err);
      }
    );
  } catch (e) {
    console.warn('[Firestore] Failed to attach batch scenarios listener:', e);
    return () => {};
  }
}

// =========================================================================
// 5. USER PROFILES & SETTINGS
// =========================================================================

/**
 * Sync user profile details to Firestore
 */
export async function syncUserProfileToFirestore(profile: UserProfileData): Promise<void> {
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(
      userRef,
      {
        ...profile,
        lastLogin: new Date().toISOString(),
        timestamp: serverTimestamp()
      },
      { merge: true }
    );
    console.log(`[Firestore] Synced user profile for ${profile.displayName || profile.email}`);
  } catch (e) {
    console.warn('[Firestore] Error syncing user profile:', e);
  }
}

/**
 * Save user application settings to Firestore
 */
export async function saveUserSettingsToFirestore(
  uid: string,
  settings: Partial<AppSettings>
): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', uid);
    await setDoc(
      settingsRef,
      {
        ...settings,
        updated_at: new Date().toISOString(),
        timestamp: serverTimestamp()
      },
      { merge: true }
    );
    console.log(`[Firestore] Updated settings in Firestore for user ${uid}`);
  } catch (e) {
    console.warn('[Firestore] Error updating settings:', e);
  }
}

/**
 * Load user application settings from Firestore
 */
export async function getUserSettingsFromFirestore(uid: string): Promise<AppSettings | null> {
  try {
    const settingsRef = doc(db, 'settings', uid);
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data() as AppSettings;
    }
    return null;
  } catch (e) {
    console.warn('[Firestore] Error fetching settings:', e);
    return null;
  }
}
