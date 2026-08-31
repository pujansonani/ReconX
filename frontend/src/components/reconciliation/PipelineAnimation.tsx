import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Loader2,
  FileCheck2,
  Layers,
  Search,
  Sparkles,
  ShieldCheck,
  Scale
} from 'lucide-react';

interface PipelineAnimationProps {
  isRunning: boolean;
  onComplete: () => void;
  runMetrics?: any;
}

const STAGES = [
  { id: 'validate', label: 'Validating & Normalizing Source CSVs', icon: FileCheck2, duration: 600 },
  { id: 'tier1', label: 'Tier 1: Running Exact Reference Matching (100% Conf.)', icon: ShieldCheck, duration: 800 },
  { id: 'tier2', label: 'Tier 2: Correlating Date Window & Monetary Tolerances', icon: Scale, duration: 700 },
  { id: 'tier3', label: 'Tier 3: Decomposing Netted Settlement Batches', icon: Layers, duration: 900 },
  { id: 'tier4', label: 'Tier 4: Detecting Discrepancies & Flagging Exceptions', icon: Search, duration: 600 },
  { id: 'ai', label: 'AI Layer: Synthesizing Root Causes & Journal Entries', icon: Sparkles, duration: 900 }
];

export const PipelineAnimation: React.FC<PipelineAnimationProps> = ({
  isRunning,
  onComplete
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<string[]>([]);

  useEffect(() => {
    if (!isRunning) {
      setCurrentStageIndex(0);
      setCompletedStages([]);
      return;
    }

    let timeoutId: any;
    const runNextStage = (index: number) => {
      if (index >= STAGES.length) {
        onComplete();
        return;
      }
      setCurrentStageIndex(index);
      timeoutId = setTimeout(() => {
        setCompletedStages(prev => [...prev, STAGES[index].id]);
        runNextStage(index + 1);
      }, STAGES[index].duration);
    };

    runNextStage(0);
    return () => clearTimeout(timeoutId);
  }, [isRunning]);

  if (!isRunning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Reconciliation engine progress"
        className="w-full max-w-lg bg-raised rounded-2xl shadow-e4 border border-line overflow-hidden p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line">
          <div className="w-11 h-11 rounded-xl bg-surface border border-line shadow-e1 flex items-center justify-center p-1">
            <img src="/logo.png" alt="ReconX" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div>
            <h3 className="font-bold text-base text-fg">ReconX Engine Executing</h3>
            <p className="text-xs text-fg-muted font-medium">Deterministic multi-tier matching cascade in progress</p>
          </div>
        </div>

        <div className="space-y-3">
          {STAGES.map((stage, idx) => {
            const isCompleted = completedStages.includes(stage.id);
            const isCurrent = currentStageIndex === idx && !isCompleted;
            const Icon = stage.icon;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isCompleted
                  ? 'bg-ok-soft border-ok-line text-ok-text'
                  : isCurrent
                    ? 'bg-accent-soft border-accent-soft-line text-accent-text ring-1 ring-accent/30'
                    : 'bg-subtle border-line text-fg-faint'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCompleted
                      ? 'bg-ok text-white'
                      : isCurrent
                        ? 'bg-accent text-accent-fg'
                        : 'bg-inset text-fg-muted'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${isCompleted ? 'text-fg-secondary' : isCurrent ? 'text-accent-text font-bold' : 'text-fg-faint'}`}>
                    {stage.label}
                  </span>
                </div>

                <div>
                  {isCompleted && (
                    <span className="text-[10px] uppercase font-bold text-ok-text bg-ok-soft px-1.5 py-0.5 rounded">
                      Done
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold text-accent-text bg-accent-soft px-1.5 py-0.5 rounded animate-pulse">
                      Processing
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs text-fg-muted font-medium">
          <span>"Code handles money. AI handles meaning."</span>
          <span className="mono font-bold text-fg-secondary">Multi-Tier Engine</span>
        </div>
      </motion.div>
    </div>
  );
};
