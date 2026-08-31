import React, { useState, useEffect } from 'react';
import { BenchmarkSuite } from '../components/evaluation/BenchmarkSuite';
import { EvaluationResult } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/ui/Badge';

export const EvaluationPage: React.FC = () => {
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const fetchLatestEvaluation = async () => {
    try {
      const res = await api.getLatestEvaluation();
      setEvaluation(res);
    } catch (e) {
      console.error('Error fetching evaluation:', e);
    }
  };

  useEffect(() => {
    fetchLatestEvaluation();
  }, []);

  const handleRunBenchmark = async (records: number, seed: number) => {
    try {
      setIsRunning(true);
      const res = await api.runEvaluation(records, seed);
      setEvaluation(res);
    } catch (e) {
      console.error('Error running benchmark:', e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <BenchmarkSuite
        evaluation={evaluation}
        onRunBenchmark={handleRunBenchmark}
        isRunning={isRunning}
      />
    </div>
  );
};
