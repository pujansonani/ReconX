from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models.db_models import ReconciliationRun, MatchResult, ExceptionRecord

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    """
    Returns platform-wide operations metrics, tier distribution, exception breakdown,
    and historical settlement trend.
    """
    latest_run = db.query(ReconciliationRun).order_by(ReconciliationRun.created_at.desc()).first()
    
    total_runs = db.query(ReconciliationRun).count()
    total_records = db.query(func.sum(ReconciliationRun.total_records)).scalar() or 0
    total_reconciled = db.query(func.sum(ReconciliationRun.reconciled_count)).scalar() or 0
    total_exceptions = db.query(func.sum(ReconciliationRun.exception_count)).scalar() or 0
    total_unresolved = db.query(func.sum(ReconciliationRun.unresolved_count)).scalar() or 0
    
    # Exception breakdown for latest run or all runs
    exception_category_counts = {}
    exc_query = db.query(ExceptionRecord.category, func.count(ExceptionRecord.id))
    if latest_run:
        exc_query = exc_query.filter(ExceptionRecord.run_id == latest_run.id)
    for cat, count in exc_query.group_by(ExceptionRecord.category).all():
        exception_category_counts[cat] = count

    # Tier breakdown
    tier_counts = {
        "Exact Reference (Tier 1)": latest_run.tier1_exact_count if latest_run else 0,
        "Amount + Date Window (Tier 2)": latest_run.tier2_fuzzy_count if latest_run else 0,
        "Batch Decomposition (Tier 3)": latest_run.tier3_batch_count if latest_run else 0,
        "Exceptions / Unresolved (Tier 4)": latest_run.exception_count if latest_run else 0,
    }

    # Historical runs trend
    runs = db.query(ReconciliationRun).order_by(ReconciliationRun.created_at.desc()).limit(10).all()
    trend = []
    for r in reversed(runs):
        trend.append({
            "run_id": r.id[:8],
            "name": r.name,
            "date": r.created_at.strftime("%b %d, %H:%M"),
            "match_rate": r.match_rate,
            "total_records": r.total_records,
            "reconciled": r.reconciled_count,
            "exceptions": r.exception_count,
            "unresolved": r.unresolved_count,
            "difference": r.financial_difference
        })

    return {
        "latest_run": latest_run,
        "summary": {
            "total_runs": total_runs,
            "total_records": total_records,
            "total_reconciled": total_reconciled,
            "total_exceptions": total_exceptions,
            "total_unresolved": total_unresolved,
            "match_rate": latest_run.match_rate if latest_run else 0.0,
            "financial_difference": latest_run.financial_difference if latest_run else 0.0
        },
        "tier_distribution": tier_counts,
        "exception_breakdown": exception_category_counts,
        "trend": trend
    }
