import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Building2,
  CreditCard,
  RotateCcw,
  Sparkles,
  Sliders,
  Zap,
  ArrowRight,
  ShieldCheck,
  Send,
  CloudUpload,
  Database
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Reveal, MOTION_SPRINGS } from './MotionSystem';
import {
  saveBatchScenarioToFirestore,
  subscribeToBatchScenarios,
  BatchScenario
} from '../../services/firestoreService';

interface BatchTxn {
  id: string;
  amount: number;
}

const PRESET_SCENARIOS = {
  RAZORPAY_HDFC: {
    name: 'Razorpay → HDFC Bank (Default 4-Txn Payout)',
    bank: 'HDFC Bank',
    gateway: 'Razorpay',
    utr: 'CMS/RAZORPAY/BATCH-92810/HDFC',
    mdrRate: 1.8,
    gstRate: 18.0,
    refunds: 2100.0,
    chargebacks: 1085.33,
    txns: [
      { id: 'TXN-901', amount: 94200.0 },
      { id: 'TXN-902', amount: 148500.0 },
      { id: 'TXN-903', amount: 82000.0 },
      { id: 'TXN-904', amount: 165000.0 }
    ]
  },
  STRIPE_ICICI: {
    name: 'Stripe → ICICI Bank (High-Volume 5-Txn Payout)',
    bank: 'ICICI Bank',
    gateway: 'Stripe',
    utr: 'NEFT/STRIPE/PAYOUT-78901/ICICI',
    mdrRate: 2.0,
    gstRate: 18.0,
    refunds: 4500.0,
    chargebacks: 2500.0,
    txns: [
      { id: 'TXN-801', amount: 125000.0 },
      { id: 'TXN-802', amount: 210000.0 },
      { id: 'TXN-803', amount: 95000.0 },
      { id: 'TXN-804', amount: 180000.0 },
      { id: 'TXN-805', amount: 140000.0 }
    ]
  },
  PAYU_SBI: {
    name: 'PayU → State Bank of India (Micro-Settlements)',
    bank: 'State Bank of India',
    gateway: 'PayU',
    utr: 'RTGS/PAYU/SETTLE-55412/SBIN',
    mdrRate: 1.5,
    gstRate: 18.0,
    refunds: 1200.0,
    chargebacks: 0.0,
    txns: [
      { id: 'TXN-501', amount: 45000.0 },
      { id: 'TXN-502', amount: 78000.0 },
      { id: 'TXN-503', amount: 62000.0 }
    ]
  }
};

const BANK_OPTIONS = [
  'HDFC Bank',
  'ICICI Bank',
  'State Bank of India',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Citibank',
  'Chase JPMorgan',
  'HSBC'
];

const GATEWAY_OPTIONS = [
  'Razorpay',
  'Stripe',
  'PayU',
  'Adyen',
  'Cashfree',
  'BillDesk',
  'CCAvenue'
];

export const BatchSolverAnimationSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Active Real-Time State
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [selectedGateway, setSelectedGateway] = useState<string>('Razorpay');
  const [utrRef, setUtrRef] = useState<string>('CMS/RAZORPAY/BATCH-92810/HDFC');
  const [mdrRate, setMdrRate] = useState<number>(1.8);
  const [gstRate, setGstRate] = useState<number>(18.0);
  const [refunds, setRefunds] = useState<number>(2100.0);
  const [chargebacks, setChargebacks] = useState<number>(1085.33);
  const [manualBankCredit, setManualBankCredit] = useState<number | null>(null);
  const [isSavingToFirebase, setIsSavingToFirebase] = useState(false);
  const [firebaseScenarios, setFirebaseScenarios] = useState<BatchScenario[]>([]);

  const [transactions, setTransactions] = useState<BatchTxn[]>([
    { id: 'TXN-901', amount: 94200.0 },
    { id: 'TXN-902', amount: 148500.0 },
    { id: 'TXN-903', amount: 82000.0 },
    { id: 'TXN-904', amount: 165000.0 }
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Real-time listener for scenarios saved in Firestore
  useEffect(() => {
    const unsub = subscribeToBatchScenarios((list) => {
      setFirebaseScenarios(list);
    });
    return () => unsub();
  }, []);

  // Load Preset
  const handleLoadPreset = (presetKey: keyof typeof PRESET_SCENARIOS) => {
    const p = PRESET_SCENARIOS[presetKey];
    setSelectedBank(p.bank);
    setSelectedGateway(p.gateway);
    setUtrRef(p.utr);
    setMdrRate(p.mdrRate);
    setGstRate(p.gstRate);
    setRefunds(p.refunds);
    setChargebacks(p.chargebacks);
    setTransactions(p.txns);
    setManualBankCredit(null);
    showToast(`Loaded Preset: ${p.name}`);
  };

  const handleLoadFirebaseScenario = (scen: BatchScenario) => {
    setSelectedBank(scen.bank_name);
    setSelectedGateway(scen.gateway_name);
    setUtrRef(scen.utr_ref);
    setMdrRate(scen.mdr_rate);
    setGstRate(scen.gst_rate);
    setRefunds(scen.refunds);
    setChargebacks(scen.chargebacks);
    setTransactions(scen.transactions);
    setManualBankCredit(null);
    showToast(`Loaded Cloud Scenario: ${scen.name}`);
  };

  // Add Txn
  const handleAddTxn = () => {
    const nextSeq = transactions.length + 901;
    const newTxn: BatchTxn = {
      id: `TXN-${nextSeq}`,
      amount: 50000.0
    };
    setTransactions([...transactions, newTxn]);
    showToast(`Added ${newTxn.id} (₹50,000.00) to live batch`);
  };

  // Remove Txn
  const handleRemoveTxn = (index: number) => {
    if (transactions.length <= 1) return;
    const removed = transactions[index];
    setTransactions(transactions.filter((_, i) => i !== index));
    showToast(`Removed ${removed.id}`);
  };

  // Update Txn Amount
  const handleUpdateTxnAmount = (index: number, val: number) => {
    const updated = [...transactions];
    updated[index].amount = Math.max(0, val);
    setTransactions(updated);
  };

  // Update Txn ID
  const handleUpdateTxnId = (index: number, val: string) => {
    const updated = [...transactions];
    updated[index].id = val;
    setTransactions(updated);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Real-Time Mathematical Netting Computations
  const calculations = useMemo(() => {
    const totalGross = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
    const totalMDR = (totalGross * mdrRate) / 100;
    const totalGST = (totalMDR * gstRate) / 100;
    const expectedNet = totalGross - totalMDR - totalGST - (refunds || 0) - (chargebacks || 0);

    const actualBankCredit = manualBankCredit !== null ? manualBankCredit : expectedNet;
    const variance = Math.abs(expectedNet - actualBankCredit);
    const isBalanced = variance < 0.01;

    return {
      totalGross,
      totalMDR,
      totalGST,
      expectedNet,
      actualBankCredit,
      variance,
      isBalanced
    };
  }, [transactions, mdrRate, gstRate, refunds, chargebacks, manualBankCredit]);

  // Save Scenario to Firebase Firestore
  const handleSaveToFirebase = async () => {
    try {
      setIsSavingToFirebase(true);
      const scenarioData: BatchScenario = {
        id: `scen_${selectedGateway.toLowerCase()}_${Date.now()}`,
        name: `${selectedGateway} → ${selectedBank} (₹${(calculations.actualBankCredit / 100000).toFixed(2)}L)`,
        bank_name: selectedBank,
        gateway_name: selectedGateway,
        utr_ref: utrRef,
        inward_credit: calculations.actualBankCredit,
        transactions: transactions,
        mdr_rate: mdrRate,
        gst_rate: gstRate,
        refunds: refunds,
        chargebacks: chargebacks,
        residual_variance: calculations.variance,
        created_at: new Date().toISOString()
      };

      await saveBatchScenarioToFirestore(scenarioData);
      showToast(`Saved '${scenarioData.name}' to Firebase Firestore!`);
    } catch (e) {
      console.error('Error saving scenario to Firestore:', e);
      showToast('Error saving to Firebase.');
    } finally {
      setIsSavingToFirebase(false);
    }
  };

  return (
    <section className="py-12 relative">
      <div className="max-w-5xl mx-auto text-center mb-8 space-y-3">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            Interactive Real-Time Netted Solver Studio
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Live Netted Batch Settlement <span className="text-[#0077B6] dark:text-[#48CAE4]">Decomposition Studio</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            Select your banking partner, gateway, individual charges, MDR fees, and adjustments in real-time. Watch the mathematical solver decompose multi-charge payouts down to ₹0.00 instantly.
          </p>
        </Reveal>

        {/* Quick Scenario Preset Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold text-[var(--text-muted)]">Quick Presets:</span>
          <button
            onClick={() => handleLoadPreset('RAZORPAY_HDFC')}
            className="px-3 py-1 text-xs font-bold rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[#0077B6] text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
          >
            ⚡ Razorpay → HDFC (₹4.76L)
          </button>
          <button
            onClick={() => handleLoadPreset('STRIPE_ICICI')}
            className="px-3 py-1 text-xs font-bold rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[#0077B6] text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
          >
            ⚡ Stripe → ICICI (₹7.50L)
          </button>
          <button
            onClick={() => handleLoadPreset('PAYU_SBI')}
            className="px-3 py-1 text-xs font-bold rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[#0077B6] text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
          >
            ⚡ PayU → SBI (₹1.85L)
          </button>

          {firebaseScenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleLoadFirebaseScenario(sc)}
              className="px-3 py-1 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-emerald-600" />
              <span>{sc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white border border-slate-700 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#48CAE4]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Studio Workspace Card */}
      <Card className="max-w-5xl mx-auto p-6 md:p-8 bg-[#0F172A] text-white rounded-3xl shadow-2xl border border-slate-800 space-y-6">
        {/* Row 1: Bank & Gateway Real-Time Configurator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
          {/* Select Bank Partner */}
          <div>
            <label className="font-bold text-slate-400 block mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#48CAE4]" />
              Select Inward Bank Partner
            </label>
            <select
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(e.target.value);
                setUtrRef(`CMS/${selectedGateway.toUpperCase()}/BATCH-${Math.floor(Math.random() * 90000 + 10000)}/${e.target.value.split(' ')[0].toUpperCase()}`);
                showToast(`Bank switched to ${e.target.value}`);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold outline-none focus:ring-2 focus:ring-[#0077B6]"
            >
              {BANK_OPTIONS.map((b) => (
                <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
              ))}
            </select>
          </div>

          {/* Select Gateway / Aggregator */}
          <div>
            <label className="font-bold text-slate-400 block mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              Select Payment Gateway
            </label>
            <select
              value={selectedGateway}
              onChange={(e) => {
                setSelectedGateway(e.target.value);
                setUtrRef(`CMS/${e.target.value.toUpperCase()}/BATCH-${Math.floor(Math.random() * 90000 + 10000)}/${selectedBank.split(' ')[0].toUpperCase()}`);
                showToast(`Gateway switched to ${e.target.value}`);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold outline-none focus:ring-2 focus:ring-[#0077B6]"
            >
              {GATEWAY_OPTIONS.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-white">{g}</option>
              ))}
            </select>
          </div>

          {/* UTR Reference String */}
          <div>
            <label className="font-bold text-slate-400 block mb-1">
              Bank Statement UTR / Batch Ref
            </label>
            <input
              type="text"
              value={utrRef}
              onChange={(e) => setUtrRef(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs outline-none focus:ring-2 focus:ring-[#0077B6]"
            />
          </div>
        </div>

        {/* Top Payout Target Header Banner */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
              INWARD {selectedBank.toUpperCase()} STATEMENT CREDIT
            </span>
            <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              ₹{calculations.actualBankCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-sans font-bold border border-emerald-800">
                1 Lump-Sum Credit
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">UTR: {utrRef}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddTxn}
              icon={<Plus className="w-3.5 h-3.5" />}
              className="text-white border-slate-600 hover:bg-slate-800"
            >
              + Add Txn
            </Button>

            <button
              onClick={handleSaveToFirebase}
              disabled={isSavingToFirebase}
              className="px-3 py-1.5 rounded-xl border border-emerald-500/60 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Store custom batch calculation to Cloud Firestore"
            >
              <CloudUpload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSavingToFirebase ? 'Saving to Firebase...' : 'Save to Firebase'}</span>
            </button>

            <Badge variant="purple">Batch Payout ({transactions.length} charges)</Badge>
          </div>
        </div>

        {/* Real-Time Individual Transaction Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Underlying Individual Gateway Transactions ({transactions.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Click amounts or IDs to edit in real time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <AnimatePresence>
              {transactions.map((tx, idx) => {
                const txFee = (tx.amount * mdrRate) / 100;
                return (
                  <motion.div
                    key={tx.id || idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-3.5 bg-slate-900 rounded-xl border border-slate-700/80 text-xs space-y-2 relative group hover:border-[#0077B6] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={tx.id}
                        onChange={(e) => handleUpdateTxnId(idx, e.target.value)}
                        className="font-mono text-[11px] font-bold text-[#48CAE4] bg-transparent border-b border-dashed border-slate-600 focus:border-[#48CAE4] outline-none w-20"
                      />
                      {transactions.length > 1 && (
                        <button
                          onClick={() => handleRemoveTxn(idx)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                          title="Remove transaction from batch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Gross Amount (₹)</span>
                      <input
                        type="number"
                        step="100"
                        value={tx.amount}
                        onChange={(e) => handleUpdateTxnAmount(idx, parseFloat(e.target.value) || 0)}
                        className="font-mono text-base font-extrabold text-white bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 w-full outline-none focus:ring-1 focus:ring-[#0077B6]"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800 font-mono">
                      <span>MDR ({mdrRate}%):</span>
                      <span className="text-amber-400 font-bold">₹{txFee.toFixed(2)}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Real-Time Parameter Sliders & Adjustments */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs">
          <div>
            <label className="font-bold text-slate-400 block mb-1">
              Gateway MDR Rate ({mdrRate}%)
            </label>
            <input
              type="range"
              min="0.5"
              max="3.5"
              step="0.1"
              value={mdrRate}
              onChange={(e) => setMdrRate(parseFloat(e.target.value))}
              className="w-full accent-[#0077B6] cursor-pointer"
            />
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">
              GST on MDR ({gstRate}%)
            </label>
            <input
              type="range"
              min="0"
              max="28"
              step="1"
              value={gstRate}
              onChange={(e) => setGstRate(parseFloat(e.target.value))}
              className="w-full accent-[#0077B6] cursor-pointer"
            />
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">
              Customer Refunds (₹)
            </label>
            <input
              type="number"
              step="50"
              value={refunds}
              onChange={(e) => setRefunds(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs outline-none"
            />
          </div>

          <div>
            <label className="font-bold text-slate-400 block mb-1">
              Chargeback Debits (₹)
            </label>
            <input
              type="number"
              step="50"
              value={chargebacks}
              onChange={(e) => setChargebacks(parseFloat(e.target.value) || 0)}
              className="w-full px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs outline-none"
            />
          </div>
        </div>

        {/* Mathematical Netting Breakdown Equation */}
        <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span>+ Gross Settled Amount ({transactions.length} transactions)</span>
            <span className="text-white font-bold">₹{calculations.totalGross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex items-center justify-between text-amber-400">
            <span>− Total Gateway Fees ({mdrRate}% MDR)</span>
            <span>−₹{calculations.totalMDR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex items-center justify-between text-amber-400">
            <span>− GST on Gateway Fees ({gstRate}% Tax)</span>
            <span>−₹{calculations.totalGST.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex items-center justify-between text-rose-400">
            <span>− Customer Refunds Adjusted</span>
            <span>−₹{refunds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="flex items-center justify-between text-rose-400">
            <span>− Chargeback Debit (Disputes)</span>
            <span>−₹{chargebacks.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-sm sm:text-base font-bold text-white">
            <span>= Expected Net Bank Settlement</span>
            <span className="text-emerald-400">₹{calculations.expectedNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Zero Residual Variance Success Bar */}
        <motion.div
          animate={calculations.isBalanced ? { scale: [1, 1.01, 1] } : {}}
          transition={{ repeat: Infinity, duration: 3 }}
          className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border-2 ${
            calculations.isBalanced
              ? 'bg-emerald-950/40 border-emerald-500/50'
              : 'bg-rose-950/40 border-rose-500/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold shrink-0 ${
              calculations.isBalanced ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {calculations.isBalanced ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <span className={`text-xs font-bold block uppercase tracking-wider ${
                calculations.isBalanced ? 'text-emerald-300' : 'text-rose-300'
              }`}>
                {calculations.isBalanced ? 'Deterministic Solver Output' : 'Variance Detected in Lump-Sum Payout'}
              </span>
              <span className="text-sm font-extrabold text-white">
                {calculations.isBalanced
                  ? 'Exact Mathematical Balance Verified Across All Ledgers'
                  : `Discrepancy of ₹${calculations.variance.toFixed(2)} between net calculation and bank credit`}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-700 text-center font-mono">
            <span className="text-[10px] text-slate-400 uppercase block font-bold">Residual Variance</span>
            <span className={`text-base font-black ${
              calculations.isBalanced ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              ₹{calculations.variance.toFixed(2)}
            </span>
          </div>
        </motion.div>
      </Card>
    </section>
  );
};
