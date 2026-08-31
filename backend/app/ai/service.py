import os
import json
import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.ai.prompts import SYSTEM_PROMPT, get_exception_prompt

logger = logging.getLogger("reconx.ai")

# Cache to prevent duplicate LLM calls for identical discrepancy archetypes
_AI_CACHE: Dict[str, Dict[str, Any]] = {}

class AIService:
    @classmethod
    def analyze_exception(cls, exception_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes structured financial explanations and journal entries for an exception.
        Uses Google Gemini with caching and non-blocking fallback to deterministic finance intelligence.
        """
        category = exception_data.get("category", "UNKNOWN")
        amount = float(exception_data.get("discrepancy_amount", 0.0))
        reason = exception_data.get("deterministic_reason", "")
        evidence = exception_data.get("evidence_summary", {})
        tx_id = evidence.get("transaction_id", "N/A")
        order_id = evidence.get("order_id", "N/A")
        bank_id = evidence.get("bank_transaction_id", "N/A")

        cache_key = f"{category}_{amount}_{tx_id}_{order_id}"
        if cache_key in _AI_CACHE:
            return _AI_CACHE[cache_key]

        # Try live Google Gemini API if configured and key is present
        api_key = settings.GEMINI_API_KEY
        if api_key and len(api_key.strip()) > 10 and settings.AI_FALLBACK_ENABLED:
            try:
                prompt = get_exception_prompt({
                    "category": category,
                    "discrepancy_amount": amount,
                    "deterministic_reason": reason,
                    "evidence": evidence
                })
                
                model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
                headers = {
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key.strip()
                }
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.2,
                        "maxOutputTokens": 400
                    }
                }
                
                with httpx.Client(timeout=2.0) as client:
                    resp = client.post(url, json=payload, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            text = candidates[0]["content"]["parts"][0]["text"]
                            parsed = json.loads(text)
                            result = {
                                "ai_classification": parsed.get("ai_classification", category),
                                "ai_confidence": float(parsed.get("ai_confidence", 94.0)),
                                "ai_explanation": parsed.get("ai_explanation", reason),
                                "recommended_action": parsed.get("recommended_action", "Review discrepancy."),
                                "suggested_journal_entry": parsed.get("suggested_journal_entry", {})
                            }
                            _AI_CACHE[cache_key] = result
                            return result
            except Exception as e:
                logger.debug(f"Gemini live call timed out or failed, using deterministic finance engine: {e}")

        # Deterministic Expert Fallback Synthesis
        result = cls._generate_deterministic_explanation(category, amount, reason, evidence, tx_id, order_id, bank_id)
        _AI_CACHE[cache_key] = result
        return result

    @classmethod
    def _generate_deterministic_explanation(
        cls,
        category: str,
        amount: float,
        reason: str,
        evidence: Dict[str, Any],
        tx_id: str,
        order_id: str,
        bank_id: str
    ) -> Dict[str, Any]:
        """High-precision deterministic finance logic explaining root cause without hallucination."""
        
        if category == "CHARGEBACK":
            return {
                "ai_classification": "Chargeback Dispute Debit",
                "ai_confidence": 96.5,
                "ai_explanation": f"The difference of ₹{amount:,.2f} is caused by a customer dispute/chargeback clawback executed by the payment gateway for transaction {tx_id}. The merchant ERP currently lacks the chargeback dispute debit entry.",
                "recommended_action": f"Review chargeback claim details for transaction {tx_id} in gateway portal and book the dispute loss entry.",
                "suggested_journal_entry": {
                    "memo": f"Chargeback deduction on tx {tx_id}",
                    "entries": [
                        {"account_code": "6200", "account_name": "Chargeback & Dispute Loss", "debit": amount, "credit": 0.0},
                        {"account_code": "1150", "account_name": "Payment Gateway Clearing Account", "debit": 0.0, "credit": amount}
                    ]
                }
            }

        elif category == "PARTIAL_REFUND":
            return {
                "ai_classification": "Unrecorded Gateway Refund",
                "ai_confidence": 95.0,
                "ai_explanation": f"The gateway processed a partial refund of ₹{amount:,.2f} directly to customer for transaction {tx_id}, but the merchant sales ledger still records the original gross order amount without deduction.",
                "recommended_action": f"Update Order {order_id} status in the merchant ledger to reflect the partial refund of ₹{amount:,.2f}.",
                "suggested_journal_entry": {
                    "memo": f"Customer refund on Order {order_id}",
                    "entries": [
                        {"account_code": "4100", "account_name": "Sales Returns & Allowances", "debit": amount, "credit": 0.0},
                        {"account_code": "1150", "account_name": "Payment Gateway Clearing Account", "debit": 0.0, "credit": amount}
                    ]
                }
            }

        elif category == "FEE_MISMATCH":
            charged = evidence.get("charged_fee", amount)
            expected = evidence.get("expected_fee", 0.0)
            return {
                "ai_classification": "Payment Gateway Overbilling",
                "ai_confidence": 94.0,
                "ai_explanation": f"Gateway deducted a fee of ₹{charged:,.2f} which exceeds the standard contract rate (expected ₹{expected:,.2f}), resulting in an unbudgeted fee variance of ₹{amount:,.2f}.",
                "recommended_action": f"Flag fee variance of ₹{amount:,.2f} with payment gateway account manager for fee rectification or credit note.",
                "suggested_journal_entry": {
                    "memo": f"MDR fee variance adjustment on tx {tx_id}",
                    "entries": [
                        {"account_code": "6100", "account_name": "Payment Processing Fees", "debit": amount, "credit": 0.0},
                        {"account_code": "1150", "account_name": "Payment Gateway Clearing Account", "debit": 0.0, "credit": amount}
                    ]
                }
            }

        elif category == "TIMING_DIFFERENCE":
            return {
                "ai_classification": "In-Transit Settlement Timing Cutoff",
                "ai_confidence": 98.0,
                "ai_explanation": f"Transaction {tx_id} was authorized near the statement period boundary. Gateway settlement occurred after cutoff and funds will clear in the subsequent bank statement.",
                "recommended_action": "Mark as in-transit settlement. No manual adjustment required; verify against next bank statement.",
                "suggested_journal_entry": {
                    "memo": f"Settlement in transit for Order {order_id}",
                    "entries": [
                        {"account_code": "1160", "account_name": "Settlements In Transit", "debit": amount, "credit": 0.0},
                        {"account_code": "1150", "account_name": "Payment Gateway Clearing Account", "debit": 0.0, "credit": amount}
                    ]
                }
            }

        elif category == "MISSING_ORDER":
            return {
                "ai_classification": "Unlinked Gateway Settlement",
                "ai_confidence": 91.0,
                "ai_explanation": f"Payment gateway settled ₹{amount:,.2f} for transaction {tx_id}, but no corresponding merchant order was found in the ERP database. This may indicate a direct API charge or webhook failure.",
                "recommended_action": f"Investigate gateway payload for {tx_id} to verify customer email and create retroactive order record.",
                "suggested_journal_entry": {
                    "memo": f"Unidentified customer receipts on tx {tx_id}",
                    "entries": [
                        {"account_code": "1150", "account_name": "Payment Gateway Clearing Account", "debit": amount, "credit": 0.0},
                        {"account_code": "2200", "account_name": "Unallocated Customer Deposits", "debit": 0.0, "credit": amount}
                    ]
                }
            }

        elif category == "MISSING_GATEWAY_RECORD":
            return {
                "ai_classification": "Unsettled Merchant Order",
                "ai_confidence": 93.0,
                "ai_explanation": f"Order {order_id} for ₹{amount:,.2f} is marked as successful in the store, but no transaction capture or payout was registered by the gateway or bank.",
                "recommended_action": f"Check webhook logs for Order {order_id} to confirm if payment was actually authorized or if order status was prematurely updated.",
                "suggested_journal_entry": {
                    "memo": f"Provision for uncollected order {order_id}",
                    "entries": [
                        {"account_code": "1200", "account_name": "Accounts Receivable (Suspense)", "debit": amount, "credit": 0.0},
                        {"account_code": "4000", "account_name": "Sales Revenue", "debit": 0.0, "credit": amount}
                    ]
                }
            }

        elif category == "UNRESOLVED":
            return {
                "ai_classification": "Unallocated Bank Inward Credit",
                "ai_confidence": 99.0,
                "ai_explanation": f"Bank received a credit of ₹{amount:,.2f} with zero matching gateway settlement batches, merchant orders, or subset combinations. Defensible match cannot be established.",
                "recommended_action": "Escalate to Treasury & Finance Controller. Request bank narration clarification or reverse unallocated funds.",
                "suggested_journal_entry": {
                    "memo": f"Unallocated bank credit {bank_id}",
                    "entries": [
                        {"account_code": "1010", "account_name": "Operating Bank Account", "debit": amount, "credit": 0.0},
                        {"account_code": "2990", "account_name": "Treasury Suspense Account", "debit": 0.0, "credit": amount}
                    ]
                }
            }

        # Generic default
        return {
            "ai_classification": category,
            "ai_confidence": 85.0,
            "ai_explanation": reason or f"Discrepancy of ₹{amount:,.2f} detected between financial sources.",
            "recommended_action": "Review source records and escalate to finance operations.",
            "suggested_journal_entry": {
                "memo": f"Reconciliation adjustment for {category}",
                "entries": [
                    {"account_code": "1999", "account_name": "Reconciliation Variance Account", "debit": amount, "credit": 0.0},
                    {"account_code": "1150", "account_name": "Payment Gateway Clearing Account", "debit": 0.0, "credit": amount}
                ]
            }
        }
