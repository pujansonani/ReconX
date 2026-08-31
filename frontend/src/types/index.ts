export interface ValidationIssue {
  level: 'WARNING' | 'ERROR' | 'INFO';
  source: 'ORDERS' | 'GATEWAY' | 'BANK';
  message: string;
  row_count: number;
  sample_ids?: string[];
}

export interface ValidationSummary {
  orders_count: number;
  gateway_count: number;
  bank_count: number;
  orders_valid_count: number;
  gateway_valid_count: number;
  bank_valid_count: number;
  orders_amount_total: number;
  gateway_gross_total: number;
  bank_credit_total: number;
  issues: ValidationIssue[];
  columns_detected: Record<string, string[]>;
  date_ranges: Record<string, { start: string | null; end: string | null }>;
}

export interface ReconciliationRunSummary {
  id: string;
  name: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  scenario_type: string;
  total_records: number;
  total_orders?: number;
  total_gateway_records?: number;
  total_bank_records?: number;
  reconciled_count: number;
  exception_count: number;
  unresolved_count: number;
  match_rate: number;
  tier1_exact_count: number;
  tier2_fuzzy_count: number;
  tier3_batch_count: number;
  total_order_amount: number;
  total_gateway_gross: number;
  total_gateway_fees: number;
  total_gateway_net: number;
  total_bank_credit: number;
  financial_difference: number;
  created_at: string;
  completed_at?: string | null;
}

export interface MatchDetail {
  id: string;
  match_tier: 'TIER_1_EXACT' | 'TIER_2_DATE_AMOUNT' | 'TIER_3_NET_BATCH';
  match_method: string;
  confidence_score: number;
  order_ids: string[];
  gateway_ids: string[];
  bank_ids: string[];
  gross_amount: number;
  gateway_fees: number;
  gst_amount: number;
  refunds_amount: number;
  chargebacks_amount: number;
  net_settlement: number;
  bank_settlement: number;
  difference: number;
  evidence: Record<string, any>;
  status: string;
  created_at: string;
}

export interface JournalEntryLine {
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
}

export interface SuggestedJournalEntry {
  memo: string;
  entries: JournalEntryLine[];
}

export interface ExceptionDetail {
  id: string;
  run_id: string;
  exception_code: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REQUIRES_REVIEW' | 'RESOLVED' | 'ESCALATED' | 'IGNORED';
  discrepancy_amount: number;
  order_ids: string[];
  gateway_ids: string[];
  bank_ids: string[];
  deterministic_reason: string;
  evidence_summary: Record<string, any>;
  ai_classification?: string;
  ai_confidence?: number;
  ai_explanation?: string;
  recommended_action?: string;
  suggested_journal_entry?: SuggestedJournalEntry;
  resolved_by?: string;
  resolution_action?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
}

export interface EvaluationResult {
  id: string;
  name: string;
  dataset_name: string;
  total_records: number;
  correct_matches: number;
  incorrect_matches: number;
  false_matches: number;
  forced_matches: number; // 0
  unresolved_count: number;
  exceptions_detected: number;
  precision: number;
  recall: number;
  f1_score: number;
  match_rate: number;
  false_match_rate: number;
  tier_distribution: Record<string, number>;
  confusion_matrix: {
    true_positive_matches: number;
    false_positive_matches: number;
    true_negative_exceptions: number;
    false_negative_missed: number;
  };
  evaluation_metadata: Record<string, any>;
  created_at: string;
}

export interface DashboardAnalytics {
  latest_run: ReconciliationRunSummary | null;
  summary: {
    total_runs: number;
    total_records: number;
    total_reconciled: number;
    total_exceptions: number;
    total_unresolved: number;
    match_rate: number;
    financial_difference: number;
  };
  tier_distribution: Record<string, number>;
  exception_breakdown: Record<string, number>;
  trend: Array<{
    run_id: string;
    name: string;
    date: string;
    match_rate: number;
    total_records: number;
    reconciled: number;
    exceptions: number;
    unresolved: number;
    difference: number;
  }>;
}

export interface AppSettings {
  amount_tolerance: number;
  date_window_days: number;
  default_gst_rate: number;
  has_gemini_key: boolean;
  gemini_model: string;
}
