from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

class ValidationIssue(BaseModel):
    level: str  # WARNING, ERROR, INFO
    source: str  # ORDERS, GATEWAY, BANK
    message: str
    row_count: int = 0
    sample_ids: List[str] = []

class ValidationSummary(BaseModel):
    orders_count: int = 0
    gateway_count: int = 0
    bank_count: int = 0
    orders_valid_count: int = 0
    gateway_valid_count: int = 0
    bank_valid_count: int = 0
    orders_amount_total: float = 0.0
    gateway_gross_total: float = 0.0
    bank_credit_total: float = 0.0
    issues: List[ValidationIssue] = []
    columns_detected: Dict[str, List[str]] = {}
    date_ranges: Dict[str, Dict[str, Optional[str]]] = {}

class ReconciliationRunCreate(BaseModel):
    name: str
    scenario_type: Optional[str] = "CUSTOM"
    amount_tolerance: Optional[float] = 0.01
    date_window_days: Optional[int] = 3

class MatchDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    match_tier: str
    match_method: str
    confidence_score: float
    order_ids: List[str]
    gateway_ids: List[str]
    bank_ids: List[str]
    gross_amount: float
    gateway_fees: float
    gst_amount: float
    refunds_amount: float
    chargebacks_amount: float
    net_settlement: float
    bank_settlement: float
    difference: float
    evidence: Dict[str, Any]
    status: str
    created_at: datetime

class JournalEntryLine(BaseModel):
    account_code: str
    account_name: str
    debit: float = 0.0
    credit: float = 0.0

class SuggestedJournalEntry(BaseModel):
    memo: str
    entries: List[JournalEntryLine] = []

class ExceptionDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    run_id: str
    exception_code: str
    category: str
    severity: str
    status: str
    discrepancy_amount: float
    order_ids: List[str]
    gateway_ids: List[str]
    bank_ids: List[str]
    deterministic_reason: str
    evidence_summary: Dict[str, Any]
    ai_classification: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_explanation: Optional[str] = None
    recommended_action: Optional[str] = None
    suggested_journal_entry: Optional[Dict[str, Any]] = None
    resolved_by: Optional[str] = None
    resolution_action: Optional[str] = None
    resolution_notes: Optional[str] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime

class ExceptionActionRequest(BaseModel):
    action: str  # RESOLVED, ESCALATED, IGNORED
    resolved_by: str = "Finance Operations User"
    notes: Optional[str] = None

class ReconciliationRunSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    status: str
    scenario_type: str
    total_records: int
    reconciled_count: int
    exception_count: int
    unresolved_count: int
    match_rate: float
    tier1_exact_count: int
    tier2_fuzzy_count: int
    tier3_batch_count: int
    total_order_amount: float
    total_gateway_gross: float
    total_gateway_fees: float
    total_gateway_net: float
    total_bank_credit: float
    financial_difference: float
    created_at: datetime
    completed_at: Optional[datetime] = None

class BatchDecompositionDetail(BaseModel):
    bank_transaction_id: str
    bank_reference: Optional[str]
    bank_amount: float
    settlement_batch_id: Optional[str]
    matched_gateway_count: int
    total_gross: float
    total_fees: float
    total_gst: float
    total_refunds: float
    total_chargebacks: float
    expected_payout: float
    actual_bank_credit: float
    difference: float
    is_exact_balance: bool
    gateway_transactions: List[Dict[str, Any]] = []

class EvaluationResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    dataset_name: str
    total_records: int
    correct_matches: int
    incorrect_matches: int
    false_matches: int
    forced_matches: int  # 0
    unresolved_count: int
    exceptions_detected: int
    precision: float
    recall: float
    f1_score: float
    match_rate: float
    false_match_rate: float
    tier_distribution: Dict[str, int]
    confusion_matrix: Dict[str, Any]
    evaluation_metadata: Dict[str, Any]
    created_at: datetime
