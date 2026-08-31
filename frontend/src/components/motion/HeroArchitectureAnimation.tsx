import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ShoppingCart, Building, Coins, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '../ui/Card';
import { MOTION_SPRINGS } from './MotionSystem';

export const HeroArchitectureAnimation: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseKey((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md relative overflow-hidden">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[var(--border-card)]">
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-[var(--text-muted)]">
            Autonomous 3-Way Multi-Tier Matching Cascade
          </span>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase">Live Pipeline Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
          {/* Left Column: 3 Ingest Sources */}
          <div className="space-y-3 md:col-span-1">
            {/* Orders Node */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, ...MOTION_SPRINGS.normal }}
              whileHover={{ scale: 1.02 }}
              className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-2xs flex items-center gap-3 relative group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-300 dark:border-emerald-800">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-extrabold text-emerald-700 dark:text-emerald-400 block">Source 1</span>
                <span className="text-xs font-bold text-[var(--text-primary)] truncate block">Merchant Orders</span>
              </div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-card)]" />
            </motion.div>

            {/* Bank Node */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, ...MOTION_SPRINGS.normal }}
              whileHover={{ scale: 1.02 }}
              className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-sky-300 dark:border-sky-800 shadow-2xs flex items-center gap-3 relative group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-[#0077B6] dark:text-[#48CAE4] flex items-center justify-center font-bold text-xs shrink-0 border border-sky-300 dark:border-sky-800">
                <Building className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-extrabold text-[#0077B6] dark:text-[#48CAE4] block">Source 2</span>
                <span className="text-xs font-bold text-[var(--text-primary)] truncate block">Bank Statement</span>
              </div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#0077B6] ring-2 ring-[var(--bg-card)]" />
            </motion.div>

            {/* Gateway Node */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, ...MOTION_SPRINGS.normal }}
              whileHover={{ scale: 1.02 }}
              className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-purple-300 dark:border-purple-800 shadow-2xs flex items-center gap-3 relative group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-300 dark:border-purple-800">
                <Coins className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-extrabold text-purple-700 dark:text-purple-400 block">Source 3</span>
                <span className="text-xs font-bold text-[var(--text-primary)] truncate block">Gateway Settlement</span>
              </div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[var(--bg-card)]" />
            </motion.div>
          </div>

          {/* Connection Vector 1 (Data flow pulses) */}
          <div className="hidden md:flex flex-col items-center justify-center relative h-36">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 120" preserveAspectRatio="none">
              <path d="M 0 20 C 50 20, 50 60, 100 60" fill="none" stroke="var(--border-card)" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 0 60 L 100 60" fill="none" stroke="var(--border-card)" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 0 100 C 50 100, 50 60, 100 60" fill="none" stroke="var(--border-card)" strokeWidth="1.5" strokeDasharray="3 3" />

              {!shouldReduceMotion && (
                <>
                  <motion.circle
                    key={`p1-${pulseKey}`}
                    r="3.5"
                    fill="#10b981"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    style={{ offsetPath: 'path("M 0 20 C 50 20, 50 60, 100 60")' }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.circle
                    key={`p2-${pulseKey}`}
                    r="3.5"
                    fill="#0077b6"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    style={{ offsetPath: 'path("M 0 60 L 100 60")' }}
                    transition={{ duration: 1.8, delay: 0.4, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.circle
                    key={`p3-${pulseKey}`}
                    r="3.5"
                    fill="#a855f7"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    style={{ offsetPath: 'path("M 0 100 C 50 100, 50 60, 100 60")' }}
                    transition={{ duration: 1.8, delay: 0.8, repeat: Infinity, ease: 'linear' }}
                  />
                </>
              )}
            </svg>
          </div>

          {/* Center Engine Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, ...MOTION_SPRINGS.smooth }}
            whileHover={{ scale: 1.03 }}
            className="p-6 bg-[#0F172A] text-white rounded-2xl shadow-xl text-center md:col-span-1 space-y-3 border border-slate-800 relative overflow-hidden group"
          >
            {/* Glowing ambient ring */}
            <div className="absolute inset-0 bg-radial from-blue-600/20 via-transparent to-transparent pointer-events-none group-hover:from-blue-600/30 transition-all" />

            <div className="w-12 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center mx-auto border border-white/20">
              <img src="/logo.png" alt="ReconX" className="w-full h-full object-contain" />
            </div>

            <div>
              <h4 className="font-extrabold text-sm text-white">ReconX Engine</h4>
              <p className="text-[10px] text-slate-400 font-medium">Deterministic Cascade (T1-T4)</p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-400 font-mono">0 Forced Matches</span>
            </div>
          </motion.div>

          {/* Connection Vector 2 (Outputs) */}
          <div className="hidden md:flex flex-col items-center justify-center relative h-36">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 120" preserveAspectRatio="none">
              <path d="M 0 60 C 50 60, 50 30, 100 30" fill="none" stroke="var(--border-card)" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 0 60 C 50 60, 50 90, 100 90" fill="none" stroke="var(--border-card)" strokeWidth="1.5" strokeDasharray="3 3" />

              {!shouldReduceMotion && (
                <>
                  <motion.circle
                    key={`out1-${pulseKey}`}
                    r="3.5"
                    fill="#10b981"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    style={{ offsetPath: 'path("M 0 60 C 50 60, 50 30, 100 30")' }}
                    transition={{ duration: 1.6, delay: 0.9, repeat: Infinity, ease: 'linear' }}
                  />
                  <motion.circle
                    key={`out2-${pulseKey}`}
                    r="3.5"
                    fill="#f59e0b"
                    initial={{ offsetDistance: '0%' }}
                    animate={{ offsetDistance: '100%' }}
                    style={{ offsetPath: 'path("M 0 60 C 50 60, 50 90, 100 90")' }}
                    transition={{ duration: 1.6, delay: 1.3, repeat: Infinity, ease: 'linear' }}
                  />
                </>
              )}
            </svg>
          </div>

          {/* Right Column: 2 Outcomes */}
          <div className="space-y-3 md:col-span-1">
            {/* Auto-Reconciled Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, ...MOTION_SPRINGS.normal }}
              whileHover={{ scale: 1.02 }}
              className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-2xs flex items-center gap-3 relative"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-700 dark:text-emerald-300 block">97.4% Matched</span>
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-100">✓ Auto-Reconciled</span>
              </div>
            </motion.div>

            {/* AI Exceptions Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.95, ...MOTION_SPRINGS.normal }}
              whileHover={{ scale: 1.02 }}
              className="p-3.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-300 dark:border-amber-800 shadow-2xs flex items-center gap-3 relative"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-extrabold text-amber-700 dark:text-amber-300 block">AI Intelligence</span>
                <span className="text-xs font-extrabold text-amber-900 dark:text-amber-100">Exceptions Explained</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-8 p-4 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <span className="p-1 rounded bg-sky-100 dark:bg-sky-950 text-[#0077B6] dark:text-[#48CAE4] font-mono text-[10px]">PHILOSOPHY</span>
            <span>"Code handles money. AI handles meaning."</span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-medium">
            Strict deterministic arithmetic ensures zero mathematical hallucination.
          </span>
        </div>
      </div>
    </Card>
  );
};
