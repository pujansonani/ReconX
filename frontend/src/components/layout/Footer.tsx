import React from 'react';

interface FooterProps {
  onProductTour: () => void;
  onSafetyBenchmark: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onProductTour, onSafetyBenchmark }) => (
  <footer className="mt-12 border-t border-line bg-surface py-6">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-fg-muted sm:flex-row sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center sm:text-left">
        <span className="font-bold text-fg">ReconX</span>
        <span>• AI-Powered Payment Settlement Reconciliation Agent</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-ok" />
          </span>
          <span>Firebase Real-Time DB Connected</span>
        </span>
        <span className="hidden italic sm:inline">"Code handles money. AI handles meaning."</span>
        <button
          type="button"
          onClick={onProductTour}
          className="cursor-pointer font-semibold text-accent-text hover:underline"
        >
          Product Tour
        </button>
        <button
          type="button"
          onClick={onSafetyBenchmark}
          className="cursor-pointer font-semibold text-ok-text hover:underline"
        >
          Safety Benchmark
        </button>
      </div>
    </div>
  </footer>
);
