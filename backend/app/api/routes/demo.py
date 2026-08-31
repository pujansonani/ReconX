import io
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import ReconciliationRun, MatchResult, ExceptionRecord
from app.generator.synthetic_data import generate_synthetic_dataset
from app.engine.reconciler import ReconciliationOrchestrator

router = APIRouter()

@router.post("/preload")
def preload_demo_dataset(
    scenario: str = Query("ADVERSARIAL", pattern="^(CLEAN|MESSY|ADVERSARIAL)$"),
    records: int = Query(2000, ge=100, le=5000),
    db: Session = Depends(get_db)
):
    """
    Instantly generates and reconciles 2,000+ realistic synthetic transactions.
    Creates a full live demo with clean matches, netted batch settlements,
    AI-classified exceptions, and the deliberate ₹75,420 unresolvable case.
    """
    orders_df, gateway_df, bank_df, ground_truth = generate_synthetic_dataset(
        scenario=scenario,
        num_records=records,
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
    val_summary = result["validation_summary"]

    run = ReconciliationRun(
        name=f"Production Settlement Run ({scenario.capitalize()} Scenario)",
        status="COMPLETED",
        scenario_type=scenario,
        total_orders=metrics["total_orders"],
        total_gateway_records=metrics["total_gateway_records"],
        total_bank_records=metrics["total_bank_records"],
        total_records=metrics["total_records"],
        reconciled_count=metrics["reconciled_count"],
        exception_count=metrics["exception_count"],
        unresolved_count=metrics["unresolved_count"],
        match_rate=metrics["match_rate"],
        tier1_exact_count=metrics["tier1_exact_count"],
        tier2_fuzzy_count=metrics["tier2_fuzzy_count"],
        tier3_batch_count=metrics["tier3_batch_count"],
        total_order_amount=metrics["total_order_amount"],
        total_gateway_gross=metrics["total_gateway_gross"],
        total_gateway_fees=metrics["total_gateway_fees"],
        total_gateway_net=metrics["total_gateway_net"],
        total_bank_credit=metrics["total_bank_credit"],
        financial_difference=metrics["financial_difference"],
        validation_summary=val_summary,
        metadata_info={
            "scenario": scenario,
            "seed": 42,
            "processing_time_seconds": metrics["processing_time_seconds"]
        }
    )
    db.add(run)
    db.flush()

    for m in result["matches"]:
        db_match = MatchResult(
            run_id=run.id,
            match_tier=m["match_tier"],
            match_method=m["match_method"],
            confidence_score=m["confidence_score"],
            order_ids=m.get("order_display_ids", []),
            gateway_ids=m.get("gateway_display_ids", []),
            bank_ids=m.get("bank_display_ids", []),
            gross_amount=m["gross_amount"],
            gateway_fees=m["gateway_fees"],
            gst_amount=m["gst_amount"],
            refunds_amount=m["refunds_amount"],
            chargebacks_amount=m["chargebacks_amount"],
            net_settlement=m["net_settlement"],
            bank_settlement=m["bank_settlement"],
            difference=m["difference"],
            evidence=m["evidence"],
            status=m["status"]
        )
        db.add(db_match)

    for e in result["exceptions"]:
        db_exc = ExceptionRecord(
            run_id=run.id,
            exception_code=e["exception_code"],
            category=e["category"],
            severity=e["severity"],
            status=e["status"],
            discrepancy_amount=e["discrepancy_amount"],
            order_ids=e.get("order_display_ids", []),
            gateway_ids=e.get("gateway_display_ids", []),
            bank_ids=e.get("bank_display_ids", []),
            deterministic_reason=e["deterministic_reason"],
            evidence_summary=e["evidence_summary"],
            ai_classification=e.get("ai_classification"),
            ai_confidence=e.get("ai_confidence"),
            ai_explanation=e.get("ai_explanation"),
            recommended_action=e.get("recommended_action"),
            suggested_journal_entry=e.get("suggested_journal_entry", {})
        )
        db.add(db_exc)

    db.commit()

    return {
        "run_id": run.id,
        "name": run.name,
        "scenario": scenario,
        "metrics": metrics,
        "validation_summary": val_summary
    }

@router.get("/sample-csv/{file_type}")
def get_sample_csv(file_type: str):
    """
    Downloads realistic sample CSV files (orders, gateway, bank) for testing.
    """
    orders_df, gateway_df, bank_df, _ = generate_synthetic_dataset(
        scenario="ADVERSARIAL",
        num_records=500,
        seed=100
    )
    
    if file_type == "orders":
        df = orders_df
        filename = "orders.csv"
    elif file_type in ["gateway", "gateway_settlement"]:
        df = gateway_df
        filename = "gateway_settlement.csv"
    elif file_type in ["bank", "bank_statement"]:
        df = bank_df
        filename = "bank_statement.csv"
    else:
        raise HTTPException(status_code=400, detail="Invalid file_type. Must be orders, gateway, or bank.")
        
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)
    
    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
