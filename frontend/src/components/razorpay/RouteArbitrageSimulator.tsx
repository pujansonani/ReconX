import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  GitFork,
  TrendingDown,
  Sparkles,
  Zap,
  Sliders,
  DollarSign,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const RouteArbitrageSimulator: React.FC = () => {
  const [monthlyVolumeCr, setMonthlyVolumeCr] = useState<number>(10); // ₹10 Crore
  const [hdfcSplit, setHdfcSplit] = useState<number>(60); // 60%
  const [iciciSplit, setIciciSplit] = useState<number>(40); // 40%

  // Rates
  const HDFC_MDR = 1.85; // 1.85%
  const ICICI_MDR = 1.65; // 1.65% (20 bps lower arbitrage)

  const calculations = useMemo(() => {
    const totalVolumeInr = monthlyVolumeCr * 10000000;
    const hdfcVol = (totalVolumeInr * hdfcSplit) / 100;
    const iciciVol = (totalVolumeInr * iciciSplit) / 100;

    const currentFee = (hdfcVol * HDFC_MDR) / 100 + (iciciVol * ICICI_MDR) / 100;

    // Optimized Scenario: Shift 30% volume to ICICI (HDFC 30%, ICICI 70%)
    const optHdfcVol = totalVolumeInr * 0.3;
    const optIciciVol = totalVolumeInr * 0.7;
    const optFee = (optHdfcVol * HDFC_MDR) / 100 + (optIciciVol * ICICI_MDR) / 100;

    const monthlySavings = Math.max(0, currentFee - optFee);
    const annualSavings = monthlySavings * 12;

    return {
      totalVolumeInr,
      hdfcVol,
      iciciVol,
      currentFee,
      monthlySavings,
      annualSavings
    };
  }, [monthlyVolumeCr, hdfcSplit, iciciSplit]);

  return (
    <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-card)]">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-[#0077B6] dark:text-[#48CAE4]" />
          <div>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              Multi-Rail Smart Routing Fee Arbitrage Simulator
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              Simulate dynamic transaction routing across partner bank acquirers to eliminate fee leakage
            </span>
          </div>
        </div>
        <Badge variant="purple">Dynamic Routing Engine</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">
              Monthly Processing Volume (₹{monthlyVolumeCr} Crore)
            </label>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={monthlyVolumeCr}
              onChange={(e) => setMonthlyVolumeCr(parseFloat(e.target.value))}
              className="w-full accent-[#0077B6] cursor-pointer"
            />
            <span className="text-[11px] text-[var(--text-muted)] block mt-0.5 mono">
              ₹{(monthlyVolumeCr * 10000000).toLocaleString()} INR / month
            </span>
          </div>

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">
              HDFC Bank SmartHub Split ({hdfcSplit}%) - MDR: 1.85%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={hdfcSplit}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setHdfcSplit(val);
                setIciciSplit(100 - val);
              }}
              className="w-full accent-[#0077B6] cursor-pointer"
            />
          </div>

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">
              ICICI Bank Eazypay Split ({iciciSplit}%) - MDR: 1.65%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={iciciSplit}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setIciciSplit(val);
                setHdfcSplit(100 - val);
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Real-time Math Output Column */}
        <div className="lg:col-span-2 p-5 bg-[var(--bg-card-subtle)] rounded-2xl border border-[var(--border-card)] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-card)]">
            <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Autonomous Cost-Arbitrage Projection
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 20 bps Cost Advantage
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)] space-y-1">
              <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase">
                Estimated Monthly Savings
              </span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mono">
                ₹{calculations.monthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">
                By routing optimized volume to ICICI rail
              </span>
            </div>

            <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)] space-y-1">
              <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase">
                Projected Annual Bottom-Line Impact
              </span>
              <div className="text-xl font-extrabold text-[#0077B6] dark:text-[#48CAE4] mono">
                ₹{calculations.annualSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">
                Pure recovered margin with 0% extra cost
              </span>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Autonomous Recommendation:</strong> Shift 25% non-urgent UPI/Card traffic from HDFC to ICICI Eazypay to capitalize on 20 bps lower interchange margin.
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
