import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { ShoppingCart, Building, Coins, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Reveal } from './MotionSystem';

export const ThreeSourcesConvergingSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 20 });

  // Convergence transforms
  const ordersX = useTransform(smoothProgress, [0.15, 0.45], shouldReduceMotion ? [0, 0] : [-40, 0]);
  const ordersOpacity = useTransform(smoothProgress, [0.1, 0.35], [0.6, 1]);

  const bankY = useTransform(smoothProgress, [0.15, 0.45], shouldReduceMotion ? [0, 0] : [-20, 0]);
  const bankOpacity = useTransform(smoothProgress, [0.1, 0.35], [0.6, 1]);

  const gatewayX = useTransform(smoothProgress, [0.15, 0.45], shouldReduceMotion ? [0, 0] : [40, 0]);
  const gatewayOpacity = useTransform(smoothProgress, [0.1, 0.35], [0.6, 1]);

  const centerScale = useTransform(smoothProgress, [0.4, 0.6], [0.98, 1.02]);
  const resultOpacity = useTransform(smoothProgress, [0.5, 0.7], [0.3, 1]);

  return (
    <section ref={containerRef} className="py-16 relative">
      <div className="max-w-4xl mx-auto text-center mb-10 space-y-3">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#0077B6] dark:text-[#48CAE4] text-xs font-bold uppercase tracking-wider">
            Consolidated Ingest
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Three sources. <span className="text-[#0077B6] dark:text-[#48CAE4]">One truth.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Payment gateways deduct fees, banks settle in consolidated lump sums, and orders sit in store ledgers. ReconX unifies all three into an undisputed single ledger.
          </p>
        </Reveal>
      </div>

      {/* Interactive Visual Canvas */}
      <Card className="max-w-4xl mx-auto p-6 md:p-10 bg-[#0F172A] text-white rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          {/* Converging 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Orders Source */}
            <motion.div
              style={{ x: ordersX, opacity: ordersOpacity }}
              className="p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/30 backdrop-blur-md text-left space-y-1.5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">Store Ledger</span>
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-mono text-sm font-bold text-white">orders.csv</div>
              <p className="text-[11px] text-slate-400">Captures gross customer purchases, taxes, and shipping fees.</p>
            </motion.div>

            {/* Bank Statement Source */}
            <motion.div
              style={{ y: bankY, opacity: bankOpacity }}
              className="p-4 bg-slate-900/90 rounded-2xl border border-blue-500/30 backdrop-blur-md text-left space-y-1.5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">Treasury Feed</span>
                <Building className="w-4 h-4 text-blue-400" />
              </div>
              <div className="font-mono text-sm font-bold text-white">bank_feed.csv</div>
              <p className="text-[11px] text-slate-400">Records actual inward net cash credit into corporate account.</p>
            </motion.div>

            {/* Gateway Settlement Source */}
            <motion.div
              style={{ x: gatewayX, opacity: gatewayOpacity }}
              className="p-4 bg-slate-900/90 rounded-2xl border border-purple-500/30 backdrop-blur-md text-left space-y-1.5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider">Gateway Report</span>
                <Coins className="w-4 h-4 text-purple-400" />
              </div>
              <div className="font-mono text-sm font-bold text-white">settlement.csv</div>
              <p className="text-[11px] text-slate-400">Reports MDR processing fees, GST withholding, and dispute debits.</p>
            </motion.div>
          </div>

          {/* Central Convergence Hub */}
          <motion.div
            style={{ scale: centerScale }}
            className="p-5 bg-gradient-to-r from-blue-950/70 via-slate-900/80 to-blue-950/70 rounded-2xl border border-blue-500/40 text-center max-w-lg mx-auto shadow-2xl space-y-2.5"
          >
            <div className="w-10 h-10 bg-white/10 rounded-xl p-1.5 flex items-center justify-center mx-auto border border-white/20">
              <img src="/logo.png" alt="ReconX" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-extrabold text-base text-white">ReconX Multi-Tier Matching Cascade</h3>
            <p className="text-xs text-slate-300">
              Synchronizes 1-to-1 transactions, netting schedules, and multi-charge batch payout formulas.
            </p>
          </motion.div>

          {/* Unified Output Result */}
          <motion.div
            style={{ opacity: resultOpacity }}
            className="p-3.5 bg-emerald-500/15 border border-emerald-400/40 rounded-2xl max-w-md mx-auto flex items-center justify-center gap-2.5 text-emerald-300 font-bold text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Undisputed 3-Way Reconciled Financial Ledger</span>
          </motion.div>
        </div>
      </Card>
    </section>
  );
};
