import asyncio
import json
import random
import time
from datetime import datetime
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List

router = APIRouter()

# In-memory live event subscribers
class EventBroadcaster:
    def __init__(self):
        self.subscribers: List[asyncio.Queue] = []
        self.is_simulating: bool = True
        self.history: List[Dict[str, Any]] = []

    async def subscribe(self) -> asyncio.Queue:
        q = asyncio.Queue()
        self.subscribers.append(q)
        return q

    def unsubscribe(self, q: asyncio.Queue):
        if q in self.subscribers:
            self.subscribers.remove(q)

    async def broadcast(self, event: Dict[str, Any]):
        self.history.append(event)
        if len(self.history) > 100:
            self.history.pop(0)
            
        for q in list(self.subscribers):
            try:
                await q.put(event)
            except Exception:
                pass

broadcaster = EventBroadcaster()

# Background generator simulating real-time payment transactions
async def live_recon_ticker():
    sample_merchants = ["SHOPIFY", "WOOCOMMERCE", "MAGENTO", "ERP_STORE_1", "MOBILE_APP"]
    sample_gateways = ["RAZORPAY", "STRIPE", "ADYEN", "PAYU"]
    sample_banks = ["HDFC", "ICICI", "CHASE", "CITIBANK"]
    
    seq = 1000
    while True:
        await asyncio.sleep(random.uniform(2.5, 4.5))
        if broadcaster.is_simulating:
            seq += 1
            gross = round(random.uniform(450.0, 18500.0), 2)
            event_type = random.choices(
                ["TIER_1_EXACT", "TIER_2_FUZZY", "TIER_3_BATCH", "EXCEPTION_FEE", "EXCEPTION_DISPUTE"],
                weights=[60, 25, 8, 4, 3]
            )[0]
            
            order_id = f"ORD-LIVE-{seq}"
            gateway_id = f"pay_live_{random.randint(100000, 999999)}"
            bank_ref = f"CMS/{random.choice(sample_gateways)}/{order_id}"
            
            fee_rate = 0.018
            fee = round(gross * fee_rate, 2)
            gst = round(fee * 0.18, 2)
            net = round(gross - fee - gst, 2)
            
            timestamp = datetime.utcnow().strftime("%H:%M:%S")
            
            if event_type == "TIER_1_EXACT":
                event = {
                    "id": f"evt-{seq}",
                    "type": "MATCH_SUCCESS",
                    "tier": "TIER_1_EXACT",
                    "title": f"Tier 1 Exact Hash Match: {order_id}",
                    "order_id": order_id,
                    "gateway_id": gateway_id,
                    "bank_ref": bank_ref,
                    "gross_amount": gross,
                    "net_amount": net,
                    "fee": fee,
                    "variance": 0.00,
                    "status": "RECONCILED",
                    "message": f"Deterministic correlation matched gross ₹{gross:,.2f} across all 3 ledgers.",
                    "time": timestamp
                }
            elif event_type == "TIER_2_FUZZY":
                event = {
                    "id": f"evt-{seq}",
                    "type": "MATCH_SUCCESS",
                    "tier": "TIER_2_DATE_AMOUNT",
                    "title": f"Tier 2 Date-Window Match: {order_id}",
                    "order_id": order_id,
                    "gateway_id": gateway_id,
                    "bank_ref": f"CMS/{random.choice(sample_gateways)}/BATCH-{random.randint(100, 999)}",
                    "gross_amount": gross,
                    "net_amount": net,
                    "fee": fee,
                    "variance": 0.00,
                    "status": "RECONCILED",
                    "message": f"Matched within +/- 1 day temporal window. Expected net ₹{net:,.2f} credited.",
                    "time": timestamp
                }
            elif event_type == "TIER_3_BATCH":
                batch_gross = round(gross * 3.5, 2)
                batch_fee = round(batch_gross * 0.018, 2)
                batch_gst = round(batch_fee * 0.18, 2)
                batch_net = round(batch_gross - batch_fee - batch_gst, 2)
                event = {
                    "id": f"evt-{seq}",
                    "type": "BATCH_SOLVED",
                    "tier": "TIER_3_NET_BATCH",
                    "title": f"Tier 3 Consolidated Payout Netting Solved",
                    "order_id": f"Batch ({random.randint(3, 8)} txs)",
                    "gateway_id": f"batch_{random.randint(10000, 99999)}",
                    "bank_ref": f"CMS/RAZORPAY/BATCH-{random.randint(1000, 9999)}/HDFC",
                    "gross_amount": batch_gross,
                    "net_amount": batch_net,
                    "fee": batch_fee,
                    "variance": 0.00,
                    "status": "RECONCILED",
                    "message": f"Linear solver verified payout ₹{batch_net:,.2f} with ₹0.00 residual variance.",
                    "time": timestamp
                }
            elif event_type == "EXCEPTION_FEE":
                variance = round(random.uniform(45.0, 320.0), 2)
                event = {
                    "id": f"evt-{seq}",
                    "type": "EXCEPTION_FLAGGED",
                    "tier": "TIER_4_EXCEPTION",
                    "title": f"Fee Mismatch Variance Detected: {order_id}",
                    "order_id": order_id,
                    "gateway_id": gateway_id,
                    "bank_ref": bank_ref,
                    "gross_amount": gross,
                    "net_amount": net - variance,
                    "fee": fee + variance,
                    "variance": variance,
                    "status": "REQUIRES_REVIEW",
                    "category": "FEE_MISMATCH",
                    "message": f"Gateway deducted ₹{variance:,.2f} extra MDR fee. Gemini root-cause prepared.",
                    "time": timestamp
                }
            else: # EXCEPTION_DISPUTE
                event = {
                    "id": f"evt-{seq}",
                    "type": "EXCEPTION_FLAGGED",
                    "tier": "TIER_4_EXCEPTION",
                    "title": f"Chargeback Dispute Clawback: {order_id}",
                    "order_id": order_id,
                    "gateway_id": gateway_id,
                    "bank_ref": bank_ref,
                    "gross_amount": gross,
                    "net_amount": 0.0,
                    "fee": fee,
                    "variance": gross,
                    "status": "REQUIRES_REVIEW",
                    "category": "CHARGEBACK",
                    "message": f"Dispute debit of ₹{gross:,.2f} received. Double-entry journal entry drafted.",
                    "time": timestamp
                }
                
            await broadcaster.broadcast(event)

# Background task starter
_ticker_task = None

def ensure_ticker_running():
    global _ticker_task
    if _ticker_task is None or _ticker_task.done():
        _ticker_task = asyncio.create_task(live_recon_ticker())

@router.get("/events")
async def stream_live_events(request: Request):
    """Server-Sent Events (SSE) streaming real-time reconciliation events."""
    ensure_ticker_running()
    q = await broadcaster.subscribe()

    async def event_generator():
        try:
            # First send initial ping and history
            yield f"data: {json.dumps({'type': 'CONNECTED', 'message': 'Live Reconciliation Stream Connected', 'history': broadcaster.history[-8:]})}\n\n"
            
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(q.get(), timeout=15.0)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat
                    yield f": keep-alive ping {int(time.time())}\n\n"
        finally:
            broadcaster.unsubscribe(q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

class LiveInjectRequest(BaseModel):
    category: str = "TIER_1_EXACT"
    amount: float = 12450.00
    order_id: str = "ORD-LIVE-CUSTOM"

@router.post("/inject")
async def inject_live_event(payload: LiveInjectRequest):
    """Manually trigger a real-time reconciliation event."""
    timestamp = datetime.utcnow().strftime("%H:%M:%S")
    seq = random.randint(1000, 9999)
    gross = payload.amount
    fee = round(gross * 0.018, 2)
    gst = round(fee * 0.18, 2)
    net = round(gross - fee - gst, 2)
    
    if payload.category == "CHARGEBACK":
        event = {
            "id": f"evt-inj-{seq}",
            "type": "EXCEPTION_FLAGGED",
            "tier": "TIER_4_EXCEPTION",
            "title": f"Injected Live Dispute: {payload.order_id}",
            "order_id": payload.order_id,
            "gateway_id": f"pay_inj_{seq}",
            "bank_ref": f"CMS/RAZORPAY/{payload.order_id}",
            "gross_amount": gross,
            "net_amount": 0.0,
            "fee": fee,
            "variance": gross,
            "status": "REQUIRES_REVIEW",
            "category": "CHARGEBACK",
            "message": f"Real-time chargeback dispute of ₹{gross:,.2f} received. AI journal entry synthesized.",
            "time": timestamp
        }
    elif payload.category == "FEE_MISMATCH":
        variance = 240.50
        event = {
            "id": f"evt-inj-{seq}",
            "type": "EXCEPTION_FLAGGED",
            "tier": "TIER_4_EXCEPTION",
            "title": f"Injected Fee Overcharge: {payload.order_id}",
            "order_id": payload.order_id,
            "gateway_id": f"pay_inj_{seq}",
            "bank_ref": f"CMS/RAZORPAY/{payload.order_id}",
            "gross_amount": gross,
            "net_amount": net - variance,
            "fee": fee + variance,
            "variance": variance,
            "status": "REQUIRES_REVIEW",
            "category": "FEE_MISMATCH",
            "message": f"Real-time fee mismatch detected. Gateway overbilled ₹{variance:,.2f}.",
            "time": timestamp
        }
    else:
        event = {
            "id": f"evt-inj-{seq}",
            "type": "MATCH_SUCCESS",
            "tier": "TIER_1_EXACT",
            "title": f"Injected Exact Match: {payload.order_id}",
            "order_id": payload.order_id,
            "gateway_id": f"pay_inj_{seq}",
            "bank_ref": f"CMS/RAZORPAY/{payload.order_id}",
            "gross_amount": gross,
            "net_amount": net,
            "fee": fee,
            "variance": 0.00,
            "status": "RECONCILED",
            "message": f"Real-time transaction matched deterministically across all 3 ledgers in 0.4ms.",
            "time": timestamp
        }
        
    await broadcaster.broadcast(event)
    return {"status": "success", "event": event}

@router.post("/toggle-sim")
def toggle_simulation():
    broadcaster.is_simulating = not broadcaster.is_simulating
    return {"status": "success", "is_simulating": broadcaster.is_simulating}
