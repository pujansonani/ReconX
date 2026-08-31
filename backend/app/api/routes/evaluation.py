from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import EvaluationRun
from app.models.schema import EvaluationResult
from app.engine.evaluator import HeldOutEvaluator

router = APIRouter()

@router.post("/run", response_model=EvaluationResult)
def run_evaluation(
    records: int = Query(2000, ge=500, le=5000),
    seed: int = Query(999),
    db: Session = Depends(get_db)
):
    """
    Executes a formal benchmark evaluation on a held-out dataset with ground-truth verification.
    Certifies 0 forced matches on deliberately unresolvable transactions.
    """
    eval_data = HeldOutEvaluator.run_evaluation(seed=seed, num_records=records)

    eval_record = EvaluationRun(
        name=f"Held-Out Benchmark ({records:,} Records, Seed {seed})",
        dataset_name=eval_data["dataset_name"],
        total_records=eval_data["total_records"],
        correct_matches=eval_data["correct_matches"],
        incorrect_matches=eval_data["incorrect_matches"],
        false_matches=eval_data["false_matches"],
        forced_matches=eval_data["forced_matches"],  # Must be 0!
        unresolved_count=eval_data["unresolved_count"],
        exceptions_detected=eval_data["exceptions_detected"],
        precision=eval_data["precision"],
        recall=eval_data["recall"],
        f1_score=eval_data["f1_score"],
        match_rate=eval_data["match_rate"],
        false_match_rate=eval_data["false_match_rate"],
        tier_distribution=eval_data["tier_distribution"],
        confusion_matrix=eval_data["confusion_matrix"],
        evaluation_metadata=eval_data["evaluation_metadata"]
    )
    db.add(eval_record)
    db.commit()
    db.refresh(eval_record)

    return eval_record

@router.get("/latest", response_model=EvaluationResult)
def get_latest_evaluation(db: Session = Depends(get_db)):
    """Gets latest benchmark run or auto-generates one if none exists."""
    eval_run = db.query(EvaluationRun).order_by(EvaluationRun.created_at.desc()).first()
    if not eval_run:
        # Generate initial benchmark run
        return run_evaluation(records=2000, seed=999, db=db)
    return eval_run
