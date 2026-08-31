from fastapi import APIRouter
from app.api.routes import reconciliations, exceptions, demo, evaluation, analytics, settings, stream, razorpay

api_router = APIRouter()

api_router.include_router(reconciliations.router, prefix="/reconciliations", tags=["Reconciliations"])
api_router.include_router(exceptions.router, prefix="/exceptions", tags=["Exceptions"])
api_router.include_router(demo.router, prefix="/demo", tags=["Demo"])
api_router.include_router(evaluation.router, prefix="/evaluations", tags=["Evaluations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(stream.router, prefix="/stream", tags=["RealTimeStream"])
api_router.include_router(razorpay.router, prefix="/razorpay", tags=["RazorpaySentinel"])
