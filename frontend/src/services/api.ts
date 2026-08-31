import {
  ReconciliationRunSummary,
  MatchDetail,
  ExceptionDetail,
  EvaluationResult,
  DashboardAnalytics,
  AppSettings,
  ValidationSummary
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`
  : '/api';

export const api = {
  // Reconciliations
  async listReconciliations(): Promise<ReconciliationRunSummary[]> {
    const res = await fetch(`${API_BASE}/reconciliations`);
    if (!res.ok) throw new Error('Failed to fetch reconciliations');
    return res.json();
  },

  async getReconciliation(id: string): Promise<ReconciliationRunSummary> {
    const res = await fetch(`${API_BASE}/reconciliations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch reconciliation');
    return res.json();
  },

  async getMatches(
    runId: string,
    tier?: string,
    search?: string,
    limit = 50,
    offset = 0
  ): Promise<{ total: number; matches: MatchDetail[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (tier && tier !== 'ALL') params.append('tier', tier);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/reconciliations/${runId}/matches?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  async getExceptions(
    runId: string,
    category?: string,
    status?: string,
    severity?: string,
    limit = 50,
    offset = 0
  ): Promise<{ total: number; exceptions: ExceptionDetail[] }> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (category && category !== 'ALL') params.append('category', category);
    if (status && status !== 'ALL') params.append('status', status);
    if (severity && severity !== 'ALL') params.append('severity', severity);

    const res = await fetch(`${API_BASE}/reconciliations/${runId}/exceptions?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch exceptions');
    return res.json();
  },

  async getBatches(runId: string): Promise<MatchDetail[]> {
    const res = await fetch(`${API_BASE}/reconciliations/${runId}/batches`);
    if (!res.ok) throw new Error('Failed to fetch batch decompositions');
    return res.json();
  },

  async uploadAndReconcile(
    ordersFile: File,
    gatewayFile: File,
    bankFile: File,
    name: string,
    amountTolerance = 0.01,
    dateWindowDays = 3
  ): Promise<{ run_id: string; metrics: any; validation_summary: ValidationSummary }> {
    const formData = new FormData();
    formData.append('orders_file', ordersFile);
    formData.append('gateway_file', gatewayFile);
    formData.append('bank_file', bankFile);
    formData.append('name', name);
    formData.append('amount_tolerance', amountTolerance.toString());
    formData.append('date_window_days', dateWindowDays.toString());

    const res = await fetch(`${API_BASE}/reconciliations/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload and reconciliation failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  getExportUrl(runId: string): string {
    return `${API_BASE}/reconciliations/${runId}/export?format=csv`;
  },

  // Exceptions
  async getExceptionDetail(id: string): Promise<ExceptionDetail> {
    const res = await fetch(`${API_BASE}/exceptions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch exception detail');
    return res.json();
  },

  async actionException(
    id: string,
    action: 'RESOLVED' | 'ESCALATED' | 'IGNORED',
    notes?: string,
    resolvedBy = 'Finance Controller'
  ): Promise<ExceptionDetail> {
    const res = await fetch(`${API_BASE}/exceptions/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes, resolved_by: resolvedBy })
    });
    if (!res.ok) throw new Error('Failed to update exception status');
    return res.json();
  },

  // Analytics
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Evaluations
  async runEvaluation(records = 2000, seed = 999): Promise<EvaluationResult> {
    const res = await fetch(`${API_BASE}/evaluations/run?records=${records}&seed=${seed}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to run benchmark evaluation');
    return res.json();
  },

  async getLatestEvaluation(): Promise<EvaluationResult> {
    const res = await fetch(`${API_BASE}/evaluations/latest`);
    if (!res.ok) throw new Error('Failed to fetch evaluation');
    return res.json();
  },

  // Demo
  async preloadDemo(scenario = 'ADVERSARIAL', records = 2000): Promise<{ run_id: string; metrics: any }> {
    const res = await fetch(`${API_BASE}/demo/preload?scenario=${scenario}&records=${records}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to preload demo');
    return res.json();
  },

  getSampleCsvUrl(type: 'orders' | 'gateway' | 'bank'): string {
    return `${API_BASE}/demo/sample-csv/${type}`;
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings & { gemini_api_key?: string; gemini_model?: string }>): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Razorpay Sentinel & Autonomous MDR Leakage Copilot
  async getRazorpaySentinelMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/razorpay/sentinel/metrics`);
    if (!res.ok) throw new Error('Failed to fetch Razorpay Sentinel metrics');
    return res.json();
  },

  async generateBankClaimLetter(payload: {
    bank_name: string;
    gateway_name: string;
    batch_utr: string;
    overcharged_amount: number;
    contracted_mdr: number;
    applied_mdr: number;
    transaction_count: number;
    period_start: string;
    period_end: string;
  }): Promise<{ letter_text: string; ref_no: string; overcharge_amount: number; bank_name: string; generated_at: string }> {
    const res = await fetch(`${API_BASE}/razorpay/sentinel/claim-letter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to generate claim letter');
    return res.json();
  },

  async simulateRazorpayWebhook(payload: {
    event: string;
    amount: number;
    order_id: string;
    payment_id?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/razorpay/webhook/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to simulate webhook');
    return res.json();
  }
};
