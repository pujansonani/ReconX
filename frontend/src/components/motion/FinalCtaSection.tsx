import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Zap, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Reveal, MagneticButton, MOTION_SPRINGS } from './MotionSystem';

export const FinalCtaSection: React.FC<{
  onTryDemo: () => void;
  onNewRecon: () => void;
  loadingDemo?: boolean;
}> = ({ onTryDemo, onNewRecon, loadingDemo = false }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-20 relative">
      <Card className="max-w-5xl mx-auto p-10 sm:p-16 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl text-center space-y-8 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <Reveal>
            <div className="w-16 h-12 rounded-xl bg-white p-1 flex items-center justify-center mx-auto shadow-md mb-2">
              <img src="/logo.png" alt="ReconX" className="w-full h-full object-contain" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Reconcile with confidence.
            </h2>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Deterministic where money matters. Intelligent where context matters.
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <MagneticButton strength={8}>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onTryDemo}
                  loading={loadingDemo}
                  icon={<Zap className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  className="font-bold shadow-xl"
                >
                  Try Interactive Demo (2,000 txs)
                </Button>
              </MagneticButton>

              <MagneticButton strength={8}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onNewRecon}
                  icon={<ArrowRight className="w-4 h-4" />}
                  className="bg-transparent border-slate-700 text-white hover:bg-slate-800 font-semibold"
                >
                  Upload Custom Datasets
                </Button>
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </Card>
    </section>
  );
};
