import pytest
from app.engine.evaluator import HeldOutEvaluator
from app.engine.reconciler import ReconciliationOrchestrator
from app.generator.synthetic_data import generate_synthetic_dataset

def test_zero_forced_matches_on_unresolvable_anomaly():
    """
    Critical safety requirement:
    Unresolvable cases (like ₹75,420 unexplained bank credit) must NOT be forced into any match.
    """
    orders_df, gateway_df, bank_df, ground_truth = generate_synthetic_dataset(
        scenario="ADVERSARIAL",
        num_records=1000,
        seed=77
    )
    result = ReconciliationOrchestrator.run_reconciliation(
        orders_df=orders_df,
        gateway_df=gateway_df,
        bank_df=bank_df,
        amount_tolerance=0.01,
        date_window_days=3,
        run_ai=False
    )
    
    matches = result["matches"]
    exceptions = result["exceptions"]
    
    # Verify the unresolvable bank credit is flagged as UNRESOLVED and never in matches
    matched_bank_ids = set()
    for m in matches:
        for b_id in m.get("bank_display_ids", []):
            matched_bank_ids.add(b_id)
            
    unresolvable_id = "BNK-UNRESOLVED-75420"
    assert unresolvable_id not in matched_bank_ids, "CRITICAL ERROR: Unresolvable transaction was forced into a match!"
    
    # Verify it exists in exceptions with UNRESOLVED category
    unresolved_exc = [e for e in exceptions if unresolvable_id in e.get("bank_display_ids", [])]
    assert len(unresolved_exc) == 1
    assert unresolved_exc[0]["category"] == "UNRESOLVED"
    assert unresolved_exc[0]["severity"] == "CRITICAL"

def test_held_out_evaluator_metrics():
    eval_res = HeldOutEvaluator.run_evaluation(seed=999, num_records=1000)
    assert eval_res["forced_matches"] == 0
    assert eval_res["precision"] >= 95.0
    assert eval_res["match_rate"] > 80.0
    assert eval_res["evaluation_metadata"]["safety_rule_forced_matches_is_zero"] is True
