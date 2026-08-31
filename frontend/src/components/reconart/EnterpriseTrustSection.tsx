import React from 'react';
import { ShieldCheck, Lock, Award, FileText, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const EnterpriseTrustSection: React.FC = () => {
  const trustCards = [
    {
      title: 'Zero Forced Matches Standard',
      desc: 'Guarantees that unresolvable anomalies are strictly escalated to treasury without guessing or fabricating ledger associations.',
      icon: Award,
      badge: 'Certified 100%'
    },
    {
      title: 'Deterministic Financial Arithmetic',
      desc: 'All calculations are executed in Python/Pandas with exact decimal precision, ensuring zero floating-point rounding errors.',
      icon: ShieldCheck,
      badge: 'Exact Math'
    },
    {
      title: 'Full Audit Trail & Lineage',
      desc: 'Every matched transaction and exception stores immutable evidence links, timestamp history, and controller notes.',
      icon: FileText,
      badge: 'SOX Ready'
    },
    {
      title: 'Bank-Grade Data Security',
      desc: 'End-to-end encryption at rest and in transit. Configurable on-premise SQLite and enterprise PostgreSQL deployments.',
      icon: Lock,
      badge: '256-bit AES'
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="blue">Enterprise Security & Compliance</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Built for Finance Controllers, <span className="text-[#0077B6] dark:text-[#48CAE4]">Treasury & Auditors</span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            ReconX meets the stringent controls required by global accounting and compliance standards.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trustCards.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title} className="p-6 bg-[var(--bg-card)] border-2 border-[var(--border-card)] hover:border-[#0077B6]/50 transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-[#0077B6] dark:text-[#48CAE4] flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="success">{c.badge}</Badge>
                  </div>
                  <h3 className="font-extrabold text-sm text-[var(--text-primary)] mb-2">{c.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{c.desc}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--border-card)] flex items-center gap-1.5 text-xs text-[#0077B6] dark:text-[#48CAE4] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enterprise Ready</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
