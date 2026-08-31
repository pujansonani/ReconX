import io
import csv
import pandas as pd
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import (
    ReconciliationRun, OrderRecord, GatewayRecord, BankRecord,
    MatchResult, ExceptionRecord
)
from app.models.schema import (
    ReconciliationRunSummary, ValidationSummary, MatchDetail, ExceptionDetail
)
from app.engine.normalizer import DataNormalizer
from app.engine.reconciler import ReconciliationOrchestrator

router = APIRouter()

@router.post("/upload", response_model=dict)
async def upload_files(
    orders_file: UploadFile = File(...),
    gateway_file: UploadFile = File(...),
    bank_file: UploadFile = File(...),
    name: Optional[str] = Form("Payment Reconciliation Run"),
    amount_tolerance: float = Form(0.01),
    date_window_days: int = Form(3),
    db: Session = Depends(get_db)
):
    """
    Accepts 3 CSV files, validates and normalizes schemas, runs reconciliation cascade,
    and stores results in the database.
    """
    try:
        orders_content = await orders_file.read()
        gateway_content = await gateway_file.read()
        bank_content = await bank_file.read()

        orders_df = pd.read_csv(io.BytesIO(orders_content))
        gateway_df = pd.read_csv(io.BytesIO(gateway_content))
        bank_df = pd.read_csv(io.BytesIO(bank_content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error parsing CSV files: {str(e)}")

    # Execute Reconciliation Orchestrator
    result = ReconciliationOrchestrator.run_reconciliation(
        orders_df=orders_df,
        gateway_df=gateway_df,
        bank_df=bank_df,
        amount_tolerance=amount_tolerance,
        date_window_days=date_window_days,
        run_ai=True
    )

    metrics = result["metrics"]
    val_summary = result["validation_summary"]

    # Save Reconciliation Run to DB
    run = ReconciliationRun(
        name=name,
        status="COMPLETED",
        scenario_type="CUSTOM",
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
        metadata_info={"processing_time_seconds": metrics["processing_time_seconds"]}
    )
    db.add(run)
    db.flush()

    # Save Matches
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

    # Save Exceptions
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
        "metrics": metrics,
        "validation_summary": val_summary
    }

@router.get("", response_model=List[ReconciliationRunSummary])
def list_reconciliations(db: Session = Depends(get_db)):
    runs = db.query(ReconciliationRun).order_by(ReconciliationRun.created_at.desc()).all()
    return runs

@router.get("/{run_id}", response_model=ReconciliationRunSummary)
def get_reconciliation(run_id: str, db: Session = Depends(get_db)):
    run = db.query(ReconciliationRun).filter(ReconciliationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Reconciliation run not found")
    return run

@router.get("/{run_id}/matches")
def get_matches(
    run_id: str,
    tier: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, le=500),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(MatchResult).filter(MatchResult.run_id == run_id)
    if tier:
        query = query.filter(MatchResult.match_tier == tier)
    
    total = query.count()
    matches = query.offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "matches": matches
    }

@router.get("/{run_id}/exceptions")
def get_exceptions(
    run_id: str,
    category: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = Query(50, le=500),
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(ExceptionRecord).filter(ExceptionRecord.run_id == run_id)
    if category:
        query = query.filter(ExceptionRecord.category == category)
    if status:
        query = query.filter(ExceptionRecord.status == status)
    if severity:
        query = query.filter(ExceptionRecord.severity == severity)
        
    total = query.count()
    exceptions = query.offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "exceptions": exceptions
    }

@router.get("/{run_id}/batches")
def get_batch_decompositions(run_id: str, db: Session = Depends(get_db)):
    """Returns Tier 3 multi-transaction batch reconciliations for deep investigation."""
    batch_matches = db.query(MatchResult).filter(
        MatchResult.run_id == run_id,
        MatchResult.match_tier == "TIER_3_NET_BATCH"
    ).all()
    return batch_matches

@router.get("/{run_id}/export")
def export_reconciliation(run_id: str, format: str = "csv", db: Session = Depends(get_db)):
    """Exports full reconciliation report in CSV format."""
    run = db.query(ReconciliationRun).filter(ReconciliationRun.id == run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
        
    matches = db.query(MatchResult).filter(MatchResult.run_id == run_id).all()
    exceptions = db.query(ExceptionRecord).filter(ExceptionRecord.run_id == run_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Record Type", "ID", "Tier / Category", "Method / Severity",
        "Confidence", "Gross Amount", "Fees", "Net / Discrepancy",
        "Bank Settlement", "Status", "Deterministic Reason / Evidence", "AI Explanation", "Action"
    ])
    
    for m in matches:
        writer.writerow([
            "MATCH",
            m.id,
            m.match_tier,
            m.match_method,
            f"{m.confidence_score}%",
            f"₹{m.gross_amount:.2f}",
            f"₹{m.gateway_fees:.2f}",
            f"₹{m.net_settlement:.2f}",
            f"₹{m.bank_settlement:.2f}",
            m.status,
            f"Order IDs: {','.join(m.order_ids)} | Gateway IDs: {','.join(m.gateway_ids)}",
            "Reconciled via Deterministic Rules",
            "None"
        ])
        
    for e in exceptions:
        writer.writerow([
            "EXCEPTION",
            e.exception_code,
            e.category,
            e.severity,
            f"{e.ai_confidence or 0}%",
            "N/A",
            "N/A",
            f"₹{e.discrepancy_amount:.2f}",
            "N/A",
            e.status,
            e.deterministic_reason,
            e.ai_explanation or "N/A",
            e.recommended_action or "Review"
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=reconx_report_{run_id[:8]}.csv"}
    )
