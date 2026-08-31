import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.db_models import ReconciliationRun
from app.api.api import api_router
from app.generator.synthetic_data import generate_synthetic_dataset
from app.engine.reconciler import ReconciliationOrchestrator
from app.models.db_models import MatchResult, ExceptionRecord

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("reconx")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed demo run if DB is empty
    db = SessionLocal()
    try:
        count = db.query(ReconciliationRun).count()
        if count == 0:
            logger.info("Database is empty. Pre-seeding realistic 2,000-record demo reconciliation...")
            orders_df, gateway_df, bank_df, ground_truth = generate_synthetic_dataset(
                scenario="ADVERSARIAL",
                num_records=2000,
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
                name="Settlement Reconciliation (Production Demo)",
                status="COMPLETED",
                scenario_type="ADVERSARIAL",
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
                metadata_info={"is_default_demo": True, "processing_time_seconds": metrics["processing_time_seconds"]}
            )
            db.add(run)
            db.flush()

            for m in result["matches"]:
                db.add(MatchResult(
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
                ))

            for e in result["exceptions"]:
                db.add(ExceptionRecord(
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
                ))

            db.commit()
            logger.info("Demo data seeded successfully.")
    except Exception as e:
        logger.error(f"Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()

    yield
    logger.info("Shutting down ReconX backend...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Payment Settlement Reconciliation Agent Backend",
    version="1.0.0",
    lifespan=lifespan
)

# Set CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ReconX API",
        "version": "1.0.0"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please review server logs."}
    )
