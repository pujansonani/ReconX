from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.db_models import ExceptionRecord
from app.models.schema import ExceptionDetail, ExceptionActionRequest

router = APIRouter()

@router.get("/{exception_id}", response_model=ExceptionDetail)
def get_exception_detail(exception_id: str, db: Session = Depends(get_db)):
    """Fetches full exception investigation record."""
    exc = db.query(ExceptionRecord).filter(
        (ExceptionRecord.id == exception_id) | (ExceptionRecord.exception_code == exception_id)
    ).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
    return exc

@router.post("/{exception_id}/action", response_model=ExceptionDetail)
def update_exception_action(
    exception_id: str,
    action_data: ExceptionActionRequest,
    db: Session = Depends(get_db)
):
    """
    Applies human-in-the-loop action (RESOLVED, ESCALATED, IGNORED) to an exception
    with audit metadata.
    """
    exc = db.query(ExceptionRecord).filter(
        (ExceptionRecord.id == exception_id) | (ExceptionRecord.exception_code == exception_id)
    ).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
        
    valid_actions = ["RESOLVED", "ESCALATED", "IGNORED", "REQUIRES_REVIEW"]
    if action_data.action.upper() not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Choose from {valid_actions}")
        
    exc.status = action_data.action.upper()
    exc.resolved_by = action_data.resolved_by
    exc.resolution_action = action_data.action.upper()
    exc.resolution_notes = action_data.notes
    exc.resolved_at = datetime.utcnow()
    
    db.commit()
    db.refresh(exc)
    return exc
