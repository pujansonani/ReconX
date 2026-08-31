import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  ShoppingCart,
  Building,
  AlertOctagon,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const WorkflowInteractiveTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const workflows = [
    {
      id: 'gateway',
      title: 'Payment Gateway Settlements',
      category: 'Razorpay • Stripe • Adyen • PayU',
      icon: CreditCard,
      badge: 'Tier 1 & 3 Matching',
      summary: 'Matches gross payment authorizations against net settled payout batches, isolating gateway MDR commissions and GST deductions.',
      rule: 'Order Gross = Gateway Gross | Gateway Net = Bank Inward Payout',
      rows: [
        { col1: 'pay_N7x8A9kL21m', col2: 'Domestic Credit Card', col3: '₹12,450.00', col4: '1.80% MDR', status: 'Reconciled' },
        { col1: 'pay_N7x8B0pQ99z', col2: 'UPI Payout', col3: '₹8,900.00', col4: '0.00% MDR', status: 'Reconciled' },
        { col1: 'pay_N7x8C1kX77a', col2: 'International Card', col3: '₹15,000.00', col4: '3.50% Overcharge', status: 'Fee Mismatch' }
      ]
    },
    {
      id: 'erp',
      title: 'Merchant Order Ledgers & ERP',
      category: 'Shopify • WooCommerce • Magento • NetSuite',
      icon: ShoppingCart,
      badge: 'Tier 1 3-Way Ingest',
      summary: 'Correlates customer shopping cart orders and tax invoices against captured gateway charges, detecting missing authorizations or cancelled orders.',
      rule: 'Invoice Amount = Order Total | Currency Code Match',
      rows: [
        { col1: 'ORD-982101', col2: 'Delivered / Captured', col3: '₹12,450.00', col4: 'Tax: ₹1,899.15', status: 'Reconciled' },
        { col1: 'ORD-982102', col2: 'Delivered / Captured', col3: '₹8,900.00', col4: 'Tax: ₹1,357.62', status: 'Reconciled' },
        { col1: 'ORD-982109', col2: 'Cancelled by User', col3: '₹4,500.00', col4: 'Gateway Captured', status: 'Missing Order' }
      ]
    },
    {
      id: 'bank',
      title: 'Corporate Bank Statements & Feeds',
      category: 'HDFC • ICICI • Chase • Citibank MT940',
      icon: Building,
      badge: 'Tier 2 & 3 Solver',
      summary: 'Reconstructs consolidated lump-sum bank credits, matching UTR reference descriptions and authorization-to-settlement date proximity.',
      rule: 'Bank Inward Credit = Net Gateway Payout | Delta <= ₹0.01',
      rows: [
        { col1: 'CMS/RAZORPAY/ORD-982101', col2: 'RTGS Inward Credit', col3: '₹12,225.90', col4: 'UTR: HDFC0092810', status: 'Reconciled' },
        { col1: 'CMS/RAZORPAY/BATCH-9281', col2: 'Batch Settlement Net', col3: '₹4,76,113.44', col4: 'UTR: HDFC0092811', status: 'Reconciled' },
        { col1: 'NEFT/DIRECT/UNALLOCATED', col2: 'Unaccounted Credit', col3: '₹75,420.00', col4: 'UTR: HDFC0092899', status: 'Unresolved' }
      ]
    },
    {
      id: 'disputes',
      title: 'Discrepancies, Chargebacks & Disputes',
      category: 'AI Root-Cause & Journal Entries',
      icon: AlertOctagon,
      badge: 'Tier 4 Exception AI',
      summary: 'Automatically isolates fee overcharges, customer refunds, and chargeback dispute debits, generating proposed double-entry journal entries.',
      rule: 'Discrepancy Taxonomy + Double-Entry Accounting Line Synthesis',
      rows: [
        { col1: 'EX-1042', col2: 'Chargeback Dispute #CB-1042', col3: '₹1,086.56', col4: 'Dr. CB Expense', status: 'Action Required' },
        { col1: 'EX-1005', col2: 'Fee Mismatch (3.5% vs 1.8%)', col3: '₹1,240.50', col4: 'Dr. Dispute Rec', status: 'Action Required' },
        { col1: 'EX-9999', col2: 'Deliberate Anomaly (₹75,420)', col3: '₹75,420.00', col4: 'Escalate Treasury', status: 'Unresolved' }
      ]
    }
  ];

  const current = workflows[activeTab];

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="success">Flexible Workflow Engine</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Tailored Workflows for <span className="text-[#0077B6] dark:text-[#48CAE4]">Every Financial Channel</span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            ReconX connects directly to all your ledger formats. Explore how each source is processed and verified in real time.
          </p>
        </div>

        {/* Tabbed Layout: Left Navigation + Right Live Interactive Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Buttons */}
          <div className="lg:col-span-5 space-y-3">
            {workflows.map((wf, idx) => {
              const Icon = wf.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={wf.id}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isActive
                      ? 'bg-[var(--bg-card)] border-[#0077B6] shadow-md ring-2 ring-[#0077B6]/20'
                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-card)] hover:border-[var(--border-card-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        isActive
                          ? 'bg-[#0077B6] text-white shadow-xs'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-card)]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[var(--text-primary)]">{wf.title}</h4>
                      <p className="text-[11px] text-[var(--text-muted)] font-medium">{wf.category}</p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-[#0077B6] dark:text-[#48CAE4] translate-x-1' : 'text-[var(--text-muted)]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Live Interactive Card */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-7 bg-[var(--bg-card)] border-2 border-[var(--border-card)] shadow-lg rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-card)]">
                <div>
                  <Badge variant="blue">{current.badge}</Badge>
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] mt-1.5">{current.title}</h3>
                </div>
                <div className="p-2 bg-sky-50 dark:bg-sky-950/60 rounded-xl text-[#0077B6] dark:text-[#48CAE4] font-mono text-xs font-bold border border-sky-200 dark:border-sky-800">
                  {current.category}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">{current.summary}</p>

              {/* Matching Logic Rule Box */}
              <div className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)] text-xs font-mono">
                <span className="text-[10px] uppercase font-bold text-[#0077B6] dark:text-[#48CAE4] block mb-0.5">
                  Verification Rule
                </span>
                <span className="text-[var(--text-primary)] font-semibold">{current.rule}</span>
              </div>

              {/* Sample Live Records Table */}
              <div className="overflow-x-auto rounded-xl border border-[var(--border-card)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] font-bold uppercase text-[10px] border-b border-[var(--border-card)]">
                    <tr>
                      <th className="py-2.5 px-3">Identifier / Ref</th>
                      <th className="py-2.5 px-3">Channel / Description</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Validation Line</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-card)] font-mono text-[11px] text-[var(--text-primary)]">
                    {current.rows.map((r, i) => (
                      <tr key={i} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[var(--text-primary)]">{r.col1}</td>
                        <td className="py-2.5 px-3 text-[var(--text-secondary)] font-sans text-xs">{r.col2}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-[var(--text-primary)]">{r.col3}</td>
                        <td className="py-2.5 px-3 text-right text-[var(--text-muted)]">{r.col4}</td>
                        <td className="py-2.5 px-3 text-center font-sans">
                          <Badge
                            variant={
                              r.status === 'Reconciled'
                                ? 'success'
                                : r.status === 'Fee Mismatch'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
