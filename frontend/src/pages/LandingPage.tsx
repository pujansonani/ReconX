import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import {
  Zap,
  ArrowRight,
  Sparkles,
  Scale,
  Layers,
  Users,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Reveal,
  StaggerContainer,
  StaggerItem,
  MagneticButton,
  ScrollProgressTracker
} from '../components/motion/MotionSystem';
import { ReconArtHero } from '../components/reconart/ReconArtHero';
import { InteractiveSolutionsGrid } from '../components/reconart/InteractiveSolutionsGrid';
import { WorkflowInteractiveTabs } from '../components/reconart/WorkflowInteractiveTabs';
import { EnterpriseTrustSection } from '../components/reconart/EnterpriseTrustSection';
import { ThreeSourcesConvergingSection } from '../components/motion/ThreeSourcesConvergingSection';
import { OverlappingTiersSection } from '../components/motion/OverlappingTiersSection';
import { CodeHandlesMoneySplitSection } from '../components/motion/CodeHandlesMoneySplitSection';
import { BatchSolverAnimationSection } from '../components/motion/BatchSolverAnimationSection';
import { ExceptionAndUnresolvedStorySection } from '../components/motion/ExceptionAndUnresolvedStorySection';
import { FinalCtaSection } from '../components/motion/FinalCtaSection';

interface LandingPageProps {
  onTryDemo: () => void;
  onNewRecon: () => void;
  onGoToDashboard?: () => void;
  loadingDemo?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onTryDemo,
  onNewRecon,
  loadingDemo = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('hero');

  const sections = [
    { id: 'hero', label: 'Platform' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'workflows', label: 'Workflows' },
    { id: 'converge', label: '3 Sources' },
    { id: 'tiers', label: '4 Tiers' },
    { id: 'philosophy', label: 'Code vs AI' },
    { id: 'solver', label: 'Batch Solver' },
    { id: 'trust', label: 'Trust & Audit' },
    { id: 'cta', label: 'Get Started' }
  ];

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div ref={containerRef} className="space-y-20 py-4 relative">
      {/* Fixed Section Progress Tracker */}
      <ScrollProgressTracker
        sections={sections}
        activeSection={activeSection}
        onSelectSection={handleScrollToSection}
      />

      {/* ========================================================
          1. RECONART-STYLE HERO SECTION
         ======================================================== */}
      <div id="hero">
        <ReconArtHero
          onTryDemo={onTryDemo}
          onNewRecon={onNewRecon}
          loadingDemo={loadingDemo}
        />
      </div>

      {/* ========================================================
          2. INTERACTIVE SOLUTIONS GRID (ReconArt Style)
         ======================================================== */}
      <div id="solutions">
        <InteractiveSolutionsGrid />
      </div>

      {/* ========================================================
          3. WORKFLOW INTERACTIVE TABS (Channel Deep-Dive)
         ======================================================== */}
      <div id="workflows">
        <WorkflowInteractiveTabs />
      </div>

      {/* ========================================================
          4. THREE SOURCES -> ONE TRUTH CONVERGENCE
         ======================================================== */}
      <div id="converge">
        <ThreeSourcesConvergingSection />
      </div>

      {/* ========================================================
          5. OVERLAPPING TIERS CASCADE (Tiers 1-4)
         ======================================================== */}
      <div id="tiers">
        <OverlappingTiersSection />
      </div>

      {/* ========================================================
          6. "CODE HANDLES MONEY. AI HANDLES MEANING."
         ======================================================== */}
      <div id="philosophy">
        <CodeHandlesMoneySplitSection />
      </div>

      {/* ========================================================
          7. BATCH SOLVER INTERACTIVE DEMONSTRATION
         ======================================================== */}
      <div id="solver">
        <BatchSolverAnimationSection />
      </div>

      {/* ========================================================
          8. EXCEPTION ISOLATION & ZERO FORCED MATCHES
         ======================================================== */}
      <div id="exceptions">
        <ExceptionAndUnresolvedStorySection />
      </div>

      {/* ========================================================
          9. ENTERPRISE TRUST & COMPLIANCE
         ======================================================== */}
      <div id="trust">
        <EnterpriseTrustSection />
      </div>

      {/* ========================================================
          10. FINAL RECONCILE WITH CONFIDENCE CTA
         ======================================================== */}
      <div id="cta">
        <FinalCtaSection
          onTryDemo={onTryDemo}
          onNewRecon={onNewRecon}
          loadingDemo={loadingDemo}
        />
      </div>
    </div>
  );
};
