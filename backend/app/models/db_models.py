import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ReconciliationRun(Base):
    __tablename__ = "reconciliation_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    scenario_type = Column(String(50), default="CUSTOM")  # CLEAN, MESSY, ADVERSARIAL, HELD_OUT, CUSTOM
    
    # Financial and Record Metrics
    total_orders = Column(Integer, default=0)
    total_gateway_records = Column(Integer, default=0)
    total_bank_records = Column(Integer, default=0)
    total_records = Column(Integer, default=0)
    
    reconciled_count = Column(Integer, default=0)
    exception_count = Column(Integer, default=0)
    unresolved_count = Column(Integer, default=0)
    match_rate = Column(Float, default=0.0)
    
    # Tier breakdown
    tier1_exact_count = Column(Integer, default=0)
    tier2_fuzzy_count = Column(Integer, default=0)
    tier3_batch_count = Column(Integer, default=0)
    
    # Financial metrics
    total_order_amount = Column(Float, default=0.0)
    total_gateway_gross = Column(Float, default=0.0)
    total_gateway_fees = Column(Float, default=0.0)
    total_gateway_net = Column(Float, default=0.0)
    total_bank_credit = Column(Float, default=0.0)
    financial_difference = Column(Float, default=0.0)
    
    # Validation info
    validation_summary = Column(JSON, default=dict)
    metadata_info = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    orders = relationship("OrderRecord", back_populates="run", cascade="all, delete-orphan")
    gateway_records = relationship("GatewayRecord", back_populates="run", cascade="all, delete-orphan")
    bank_records = relationship("BankRecord", back_populates="run", cascade="all, delete-orphan")
    matches = relationship("MatchResult", back_populates="run", cascade="all, delete-orphan")
    exceptions = relationship("ExceptionRecord", back_populates="run", cascade="all, delete-orphan")


class OrderRecord(Base):
    __tablename__ = "order_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("reconciliation_runs.id"), nullable=False, index=True)
    
    order_id = Column(String(100), index=True, nullable=False)
    transaction_id = Column(String(100), index=True, nullable=True)
    order_date = Column(DateTime, nullable=True, index=True)
    customer_id = Column(String(100), nullable=True)
    currency = Column(String(10), default="INR")
    gross_amount = Column(Float, nullable=False, index=True)
    refund_amount = Column(Float, default=0.0)
    status = Column(String(50), default="COMPLETED")  # COMPLETED, REFUNDED, CANCELLED, PENDING
    
    match_status = Column(String(50), default="UNMATCHED")  # MATCHED, EXCEPTION, UNMATCHED
    match_id = Column(String(36), nullable=True)
    raw_data = Column(JSON, default=dict)
    
    run = relationship("ReconciliationRun", back_populates="orders")

    __table_args__ = (
        Index("ix_orders_run_order_id", "run_id", "order_id"),
        Index("ix_orders_run_tx_id", "run_id", "transaction_id"),
    )


class GatewayRecord(Base):
    __tablename__ = "gateway_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("reconciliation_runs.id"), nullable=False, index=True)
    
    transaction_id = Column(String(100), index=True, nullable=False)
    gateway_reference = Column(String(100), index=True, nullable=True)
    settlement_batch_id = Column(String(100), index=True, nullable=True)
    
    transaction_date = Column(DateTime, nullable=True, index=True)
    settlement_date = Column(DateTime, nullable=True, index=True)
    
    gross_amount = Column(Float, nullable=False, index=True)
    gateway_fee = Column(Float, default=0.0)
    gst = Column(Float, default=0.0)
    refund_amount = Column(Float, default=0.0)
    chargeback_amount = Column(Float, default=0.0)
    net_amount = Column(Float, nullable=False, index=True)
    currency = Column(String(10), default="INR")
    
    match_status = Column(String(50), default="UNMATCHED")  # MATCHED, EXCEPTION, UNMATCHED
    match_id = Column(String(36), nullable=True)
    raw_data = Column(JSON, default=dict)
    
    run = relationship("ReconciliationRun", back_populates="gateway_records")

    __table_args__ = (
        Index("ix_gateway_run_tx_id", "run_id", "transaction_id"),
        Index("ix_gateway_run_batch_id", "run_id", "settlement_batch_id"),
    )


class BankRecord(Base):
    __tablename__ = "bank_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("reconciliation_runs.id"), nullable=False, index=True)
    
    bank_transaction_id = Column(String(100), index=True, nullable=False)
    reference = Column(String(100), index=True, nullable=True)
    transaction_date = Column(DateTime, nullable=True, index=True)
    value_date = Column(DateTime, nullable=True, index=True)
    
    description = Column(String(500), nullable=True)
    credit_amount = Column(Float, default=0.0, index=True)
    debit_amount = Column(Float, default=0.0, index=True)
    currency = Column(String(10), default="INR")
    
    match_status = Column(String(50), default="UNMATCHED")  # MATCHED, EXCEPTION, UNMATCHED
    match_id = Column(String(36), nullable=True)
    raw_data = Column(JSON, default=dict)
    
    run = relationship("ReconciliationRun", back_populates="bank_records")

    __table_args__ = (
        Index("ix_bank_run_ref", "run_id", "reference"),
        Index("ix_bank_run_tx_id", "run_id", "bank_transaction_id"),
    )


class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("reconciliation_runs.id"), nullable=False, index=True)
    
    match_tier = Column(String(50), nullable=False)  # TIER_1_EXACT, TIER_2_DATE_AMOUNT, TIER_3_NET_BATCH
    match_method = Column(String(100), nullable=False)
    confidence_score = Column(Float, default=100.0)
    
    order_ids = Column(JSON, default=list)        # List of order internal IDs
    gateway_ids = Column(JSON, default=list)    # List of gateway internal IDs
    bank_ids = Column(JSON, default=list)          # List of bank internal IDs
    
    gross_amount = Column(Float, default=0.0)
    gateway_fees = Column(Float, default=0.0)
    gst_amount = Column(Float, default=0.0)
    refunds_amount = Column(Float, default=0.0)
    chargebacks_amount = Column(Float, default=0.0)
    net_settlement = Column(Float, default=0.0)
    bank_settlement = Column(Float, default=0.0)
    difference = Column(Float, default=0.0)
    
    evidence = Column(JSON, default=dict)
    status = Column(String(50), default="RECONCILED")  # RECONCILED, PROBABLE, ADJUSTED
    
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("ReconciliationRun", back_populates="matches")


class ExceptionRecord(Base):
    __tablename__ = "exception_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    run_id = Column(String(36), ForeignKey("reconciliation_runs.id"), nullable=False, index=True)
    
    exception_code = Column(String(50), nullable=False, index=True)  # EX-1001, etc.
    category = Column(String(100), nullable=False, index=True)
    # Categories: TIMING_DIFFERENCE, FEE_MISMATCH, PARTIAL_REFUND, CHARGEBACK, 
    # DUPLICATE_PAYOUT, MISSING_ORDER, MISSING_GATEWAY_RECORD, ROUNDING_DIFFERENCE, UNRESOLVED
    
    severity = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(50), default="REQUIRES_REVIEW", index=True)  # REQUIRES_REVIEW, RESOLVED, ESCALATED, IGNORED
    
    discrepancy_amount = Column(Float, default=0.0)
    order_ids = Column(JSON, default=list)
    gateway_ids = Column(JSON, default=list)
    bank_ids = Column(JSON, default=list)
    
    # Deterministic facts
    deterministic_reason = Column(Text, nullable=False)
    evidence_summary = Column(JSON, default=dict)
    
    # AI generated enrichment
    ai_classification = Column(String(100), nullable=True)
    ai_confidence = Column(Float, default=0.0)
    ai_explanation = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    suggested_journal_entry = Column(JSON, default=dict)
    
    # Human resolution audit trail
    resolved_by = Column(String(100), nullable=True)
    resolution_action = Column(String(50), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("ReconciliationRun", back_populates="exceptions")

    __table_args__ = (
        Index("ix_exceptions_run_category", "run_id", "category"),
        Index("ix_exceptions_run_status", "run_id", "status"),
    )


class EvaluationRun(Base):
    __tablename__ = "evaluation_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    dataset_name = Column(String(100), nullable=False)
    
    total_records = Column(Integer, default=0)
    correct_matches = Column(Integer, default=0)
    incorrect_matches = Column(Integer, default=0)
    false_matches = Column(Integer, default=0)
    forced_matches = Column(Integer, default=0)  # Must be 0!
    unresolved_count = Column(Integer, default=0)
    exceptions_detected = Column(Integer, default=0)
    
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    match_rate = Column(Float, default=0.0)
    false_match_rate = Column(Float, default=0.0)
    
    tier_distribution = Column(JSON, default=dict)
    confusion_matrix = Column(JSON, default=dict)
    evaluation_metadata = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)
