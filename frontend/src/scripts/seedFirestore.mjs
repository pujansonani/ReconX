import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATkNnCYD2Ib9cL7Jio7StA8SjI7X3og2I",
  authDomain: "reconx-c988b.firebaseapp.com",
  projectId: "reconx-c988b",
  storageBucket: "reconx-c988b.firebasestorage.app",
  messagingSenderId: "52356171103",
  appId: "1:52356171103:web:98901337720ec68e2622ea",
  measurementId: "G-Z1RC804MGZ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  console.log('Seeding initial ReconX collections into Cloud Firestore...');

  try {
    // 1. Seed sample Reconciliation Run
    const runId = 'RN-89210';
    await setDoc(doc(db, 'reconciliations', runId), {
      id: runId,
      name: 'Adversarial Edge-Case Stress Dataset (2,000 Records)',
      status: 'COMPLETED',
      scenario_type: 'ADVERSARIAL',
      total_records: 2000,
      total_orders: 1950,
      total_gateway_records: 1970,
      total_bank_records: 1948,
      reconciled_count: 1948,
      exception_count: 52,
      unresolved_count: 1,
      match_rate: 97.4,
      tier1_exact_count: 1402,
      tier2_fuzzy_count: 286,
      tier3_batch_count: 260,
      total_order_amount: 489700.00,
      total_gateway_gross: 489700.00,
      total_gateway_fees: 8814.60,
      total_gateway_net: 476113.44,
      total_bank_credit: 476113.44,
      financial_difference: 0.00,
      created_at: new Date().toISOString(),
      timestamp: serverTimestamp()
    });
    console.log('✓ Seeded reconciliations/RN-89210');

    // 2. Seed Live Ingest Stream Event
    await setDoc(doc(db, 'live_events', 'live_seed_1'), {
      type: 'MATCH_SUCCESS',
      tier: 'Tier 1 Exact Hash Match',
      title: 'Tier 1 Exact Hash Match: ORD-LIVE-5401',
      order_id: 'ORD-LIVE-5401',
      gateway_id: 'TXN-5401',
      bank_ref: 'Inward Credit Batch Payout',
      gross_amount: 13705.05,
      fee: 246.69,
      net_amount: 13413.92,
      status: 'RECONCILED',
      time: new Date().toLocaleTimeString(),
      timestamp: serverTimestamp()
    });
    console.log('✓ Seeded live_events/live_seed_1');

    // 3. Seed Batch Scenario
    await setDoc(doc(db, 'batch_scenarios', 'scen_razorpay_hdfc_seed'), {
      id: 'scen_razorpay_hdfc_seed',
      name: 'Razorpay → HDFC Bank (₹4.76L Payout)',
      bank_name: 'HDFC Bank',
      gateway_name: 'Razorpay',
      utr_ref: 'CMS/RAZORPAY/BATCH-92810/HDFC',
      inward_credit: 476113.44,
      transactions: [
        { id: 'TXN-901', amount: 94200.0 },
        { id: 'TXN-902', amount: 148500.0 },
        { id: 'TXN-903', amount: 82000.0 },
        { id: 'TXN-904', amount: 165000.0 }
      ],
      mdr_rate: 1.8,
      gst_rate: 18.0,
      refunds: 2100.0,
      chargebacks: 1085.33,
      residual_variance: 0.00,
      created_at: new Date().toISOString(),
      timestamp: serverTimestamp()
    });
    console.log('✓ Seeded batch_scenarios/scen_razorpay_hdfc_seed');

    console.log('All collections successfully populated in Cloud Firestore!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

seed();
