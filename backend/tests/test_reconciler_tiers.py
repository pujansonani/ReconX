import pytest
import pandas as pd
from app.engine.reconciler import ReconciliationOrchestrator
from app.generator.synthetic_data import generate_synthetic_dataset

def test_reconciliation_clean_scenario():
    orders_df, gateway_df, bank_df, ground_truth = generate_synthetic_dataset(
        scenario="CLEAN",
        num_records=500,
        seed=123
    )
    result = ReconciliationOrchestrator.run_reconciliation(
        orders_df=orders_df,
        gateway_df=gateway_df,
        bank_df=bank_df,
        amount_tolerance=0.01,
        date_window_days=3,
        run_ai=False
    )
    metrics = result["metrics"]
    assert metrics["match_rate"] > 90.0
    assert metrics["tier1_exact_count"] > 0
    assert len(result["matches"]) > 0

def test_reconciliation_adversarial_scenario():
    orders_df, gateway_df, bank_df, ground_truth = generate_synthetic_dataset(
        scenario="ADVERSARIAL",
        num_records=1000,
        seed=42
    )
    result = ReconciliationOrchestrator.run_reconciliation(
        orders_df=orders_df,
        gateway_df=gateway_df,
        bank_df=bank_df,
        amount_tolerance=0.01,
        date_window_days=3,
        run_ai=True
    )
    metrics = result["metrics"]
    exceptions = result["exceptions"]
    
    # Exceptions detected
    assert len(exceptions) > 0
    categories = {e["category"] for e in exceptions}
    assert "CHARGEBACK" in categories
    assert "FEE_MISMATCH" in categories
    assert "PARTIAL_REFUND" in categories
    assert "UNRESOLVED" in categories
