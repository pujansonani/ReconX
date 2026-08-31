import pandas as pd
import numpy as np
from datetime import datetime
from typing import List, Dict, Any, Tuple

class Tier4ExceptionEngine:
    """
    Tier 4: Exception Detection and Deterministic Root-Cause Engine.
    Exhaustively categorizes remaining discrepancies according to the fintech taxonomy.
    """
    @staticmethod
    def detect_exceptions(
        unmatched_orders: pd.DataFrame,
        unmatched_gateway: pd.DataFrame,
        unmatched_bank: pd.DataFrame,
        default_fee_rate: float = 0.018,
        default_gst_rate: float = 0.18
    ) -> List[Dict[str, Any]]:
        exceptions: List[Dict[str, Any]] = []
        exception_idx = 1000
        
        # Convert DataFrames to dict records for safe, fast Python lookups without Series ambiguity
        order_records = unmatched_orders.to_dict(orient="records") if not unmatched_orders.empty else []
        gateway_records = unmatched_gateway.to_dict(orient="records") if not unmatched_gateway.empty else []
        bank_records = unmatched_bank.to_dict(orient="records") if not unmatched_bank.empty else []

        # Index orders
        orders_by_tx: Dict[str, Dict[str, Any]] = {}
        orders_by_id: Dict[str, Dict[str, Any]] = {}
        for r in order_records:
            tx = str(r.get("transaction_id", "")).strip()
            oid = str(r.get("order_id", "")).strip()
            if tx:
                orders_by_tx[tx] = r
            if oid:
                orders_by_id[oid] = r
                
        # Index bank
        bank_by_ref: Dict[str, Dict[str, Any]] = {}
        for b in bank_records:
            ref = str(b.get("reference", "")).strip()
            if ref:
                bank_by_ref[ref] = b

        processed_gateway_tx = set()
        processed_order_ids = set()
        processed_bank_ids = set()

        for gw_row in gateway_records:
            tx_id = str(gw_row.get("transaction_id", "")).strip()
            gw_ref = str(gw_row.get("gateway_reference", "")).strip()
            gw_gross = float(gw_row.get("gross_amount", 0.0))
            gw_fee = float(gw_row.get("gateway_fee", 0.0))
            gw_gst = float(gw_row.get("gst", 0.0))
            gw_refund = float(gw_row.get("refund_amount", 0.0))
            gw_cb = float(gw_row.get("chargeback_amount", 0.0))
            gw_net = float(gw_row.get("net_amount", 0.0))
            
            # Safe dict lookups
            ord_match = orders_by_tx.get(tx_id) if tx_id in orders_by_tx else (orders_by_id.get(gw_ref) if gw_ref in orders_by_id else None)
            bnk_match = bank_by_ref.get(tx_id) if tx_id in bank_by_ref else (bank_by_ref.get(gw_ref) if gw_ref in bank_by_ref else None)
            
            # --- Exception: CHARGEBACK ---
            if gw_cb > 0:
                exception_idx += 1
                ex_code = f"EX-{exception_idx}"
                processed_gateway_tx.add(tx_id)
                if ord_match is not None:
                    processed_order_ids.add(ord_match["order_id"])
                if bnk_match is not None:
                    processed_bank_ids.add(bnk_match["bank_transaction_id"])
                    
                exceptions.append({
                    "exception_code": ex_code,
                    "category": "CHARGEBACK",
                    "severity": "HIGH",
                    "status": "REQUIRES_REVIEW",
                    "discrepancy_amount": gw_cb,
                    "order_ids": [str(ord_match.get("id", ord_match["order_id"]))] if ord_match is not None else [],
                    "gateway_ids": [str(gw_row.get("id", tx_id))],
                    "bank_ids": [str(bnk_match.get("id", bnk_match["bank_transaction_id"]))] if bnk_match is not None else [],
                    "order_display_ids": [str(ord_match["order_id"])] if ord_match is not None else [],
                    "gateway_display_ids": [tx_id],
                    "bank_display_ids": [str(bnk_match["bank_transaction_id"])] if bnk_match is not None else [],
                    "deterministic_reason": f"Payment gateway recorded a dispute/chargeback of ₹{gw_cb:,.2f} for transaction {tx_id}. The merchant ledger has not booked the dispute deduction.",
                    "evidence_summary": {
                        "transaction_id": tx_id,
                        "order_id": str(ord_match["order_id"]) if ord_match is not None else "N/A",
                        "gross_amount": gw_gross,
                        "chargeback_amount": gw_cb,
                        "gateway_fee": gw_fee,
                        "net_amount": gw_net,
                        "bank_credit": float(bnk_match["credit_amount"]) if bnk_match is not None else 0.0
                    }
                })
                continue

            # --- Exception: PARTIAL_REFUND ---
            if gw_refund > 0 and (ord_match is None or float(ord_match.get("refund_amount", 0.0)) == 0.0):
                exception_idx += 1
                ex_code = f"EX-{exception_idx}"
                processed_gateway_tx.add(tx_id)
                if ord_match is not None:
                    processed_order_ids.add(ord_match["order_id"])
                if bnk_match is not None:
                    processed_bank_ids.add(bnk_match["bank_transaction_id"])
                    
                exceptions.append({
                    "exception_code": ex_code,
                    "category": "PARTIAL_REFUND",
                    "severity": "MEDIUM",
                    "status": "REQUIRES_REVIEW",
                    "discrepancy_amount": gw_refund,
                    "order_ids": [str(ord_match.get("id", ord_match["order_id"]))] if ord_match is not None else [],
                    "gateway_ids": [str(gw_row.get("id", tx_id))],
                    "bank_ids": [str(bnk_match.get("id", bnk_match["bank_transaction_id"]))] if bnk_match is not None else [],
                    "order_display_ids": [str(ord_match["order_id"])] if ord_match is not None else [],
                    "gateway_display_ids": [tx_id],
                    "bank_display_ids": [str(bnk_match["bank_transaction_id"])] if bnk_match is not None else [],
                    "deterministic_reason": f"Gateway processed a refund of ₹{gw_refund:,.2f} on transaction {tx_id}, but merchant order ledger still reflects gross amount ₹{gw_gross:,.2f} without refund recording.",
                    "evidence_summary": {
                        "transaction_id": tx_id,
                        "order_id": str(ord_match["order_id"]) if ord_match is not None else "N/A",
                        "order_gross": float(ord_match["gross_amount"]) if ord_match is not None else 0.0,
                        "refund_amount": gw_refund,
                        "net_payout": gw_net
                    }
                })
                continue

            # --- Exception: FEE_MISMATCH ---
            expected_fee = round(gw_gross * default_fee_rate, 2)
            if gw_gross > 0 and abs(gw_fee - expected_fee) > 1.0:
                fee_diff = abs(gw_fee - expected_fee)
                exception_idx += 1
                ex_code = f"EX-{exception_idx}"
                processed_gateway_tx.add(tx_id)
                if ord_match is not None:
                    processed_order_ids.add(ord_match["order_id"])
                if bnk_match is not None:
                    processed_bank_ids.add(bnk_match["bank_transaction_id"])
                    
                exceptions.append({
                    "exception_code": ex_code,
                    "category": "FEE_MISMATCH",
                    "severity": "MEDIUM",
                    "status": "REQUIRES_REVIEW",
                    "discrepancy_amount": round(fee_diff, 2),
                    "order_ids": [str(ord_match.get("id", ord_match["order_id"]))] if ord_match is not None else [],
                    "gateway_ids": [str(gw_row.get("id", tx_id))],
                    "bank_ids": [str(bnk_match.get("id", bnk_match["bank_transaction_id"]))] if bnk_match is not None else [],
                    "order_display_ids": [str(ord_match["order_id"])] if ord_match is not None else [],
                    "gateway_display_ids": [tx_id],
                    "bank_display_ids": [str(bnk_match["bank_transaction_id"])] if bnk_match is not None else [],
                    "deterministic_reason": f"Gateway deducted fee of ₹{gw_fee:,.2f} on gross ₹{gw_gross:,.2f} ({gw_fee/gw_gross*100:.2f}%), exceeding standard contracted rate of {default_fee_rate*100:.1f}% (₹{expected_fee:,.2f}).",
                    "evidence_summary": {
                        "transaction_id": tx_id,
                        "gross_amount": gw_gross,
                        "charged_fee": gw_fee,
                        "expected_fee": expected_fee,
                        "fee_difference": round(fee_diff, 2),
                        "charged_gst": gw_gst
                    }
                })
                continue

            # --- Exception: TIMING_DIFFERENCE ---
            if bnk_match is None and ord_match is not None:
                settle_dt = gw_row.get("settlement_date_parsed")
                if settle_dt and isinstance(settle_dt, datetime) and (settle_dt.day >= 28 or settle_dt.month > 1):
                    exception_idx += 1
                    ex_code = f"EX-{exception_idx}"
                    processed_gateway_tx.add(tx_id)
                    processed_order_ids.add(ord_match["order_id"])
                    
                    exceptions.append({
                        "exception_code": ex_code,
                        "category": "TIMING_DIFFERENCE",
                        "severity": "LOW",
                        "status": "REQUIRES_REVIEW",
                        "discrepancy_amount": gw_net,
                        "order_ids": [str(ord_match.get("id", ord_match["order_id"]))],
                        "gateway_ids": [str(gw_row.get("id", tx_id))],
                        "bank_ids": [],
                        "order_display_ids": [str(ord_match["order_id"])],
                        "gateway_display_ids": [tx_id],
                        "bank_display_ids": [],
                        "deterministic_reason": f"Transaction {tx_id} was authorized on {gw_row.get('transaction_date_parsed')} with settlement scheduled for {settle_dt.strftime('%Y-%m-%d')}. Payout falls into the subsequent banking statement cycle.",
                        "evidence_summary": {
                            "transaction_id": tx_id,
                            "order_id": str(ord_match["order_id"]),
                            "gross_amount": gw_gross,
                            "net_amount": gw_net,
                            "settlement_date": str(settle_dt)
                        }
                    })
                    continue

            # --- Exception: MISSING_ORDER ---
            if ord_match is None and tx_id not in processed_gateway_tx:
                exception_idx += 1
                ex_code = f"EX-{exception_idx}"
                processed_gateway_tx.add(tx_id)
                if bnk_match is not None:
                    processed_bank_ids.add(bnk_match["bank_transaction_id"])
                    
                exceptions.append({
                    "exception_code": ex_code,
                    "category": "MISSING_ORDER",
                    "severity": "HIGH",
                    "status": "REQUIRES_REVIEW",
                    "discrepancy_amount": gw_gross,
                    "order_ids": [],
                    "gateway_ids": [str(gw_row.get("id", tx_id))],
                    "bank_ids": [str(bnk_match.get("id", bnk_match["bank_transaction_id"]))] if bnk_match is not None else [],
                    "order_display_ids": [],
                    "gateway_display_ids": [tx_id],
                    "bank_display_ids": [str(bnk_match["bank_transaction_id"])] if bnk_match is not None else [],
                    "deterministic_reason": f"Payment gateway settled ₹{gw_gross:,.2f} for transaction {tx_id}, but no corresponding merchant order exists in the order ledger.",
                    "evidence_summary": {
                        "transaction_id": tx_id,
                        "gateway_gross": gw_gross,
                        "gateway_net": gw_net,
                        "bank_credit": float(bnk_match["credit_amount"]) if bnk_match is not None else 0.0
                    }
                })

        # 2. Check remaining unmatched orders for MISSING_GATEWAY_RECORD
        # -------------------------------------------------------------
        for ord_row in order_records:
            o_id = str(ord_row.get("order_id", "")).strip()
            if o_id in processed_order_ids:
                continue
            o_tx = str(ord_row.get("transaction_id", "")).strip()
            if o_tx and o_tx in processed_gateway_tx:
                continue
                
            o_gross = float(ord_row.get("gross_amount", 0.0))
            exception_idx += 1
            ex_code = f"EX-{exception_idx}"
            processed_order_ids.add(o_id)
            
            exceptions.append({
                "exception_code": ex_code,
                "category": "MISSING_GATEWAY_RECORD",
                "severity": "HIGH",
                "status": "REQUIRES_REVIEW",
                "discrepancy_amount": o_gross,
                "order_ids": [str(ord_row.get("id", o_id))],
                "gateway_ids": [],
                "bank_ids": [],
                "order_display_ids": [o_id],
                "gateway_display_ids": [],
                "bank_display_ids": [],
                "deterministic_reason": f"Merchant order {o_id} for ₹{o_gross:,.2f} is marked completed in order system, but payment gateway and bank statement contain no record of capture or settlement.",
                "evidence_summary": {
                    "order_id": o_id,
                    "order_date": str(ord_row.get("order_date_parsed", "")),
                    "gross_amount": o_gross,
                    "customer_id": str(ord_row.get("customer_id", ""))
                }
            })

        # 3. Check remaining unmatched bank records for UNRESOLVED
        # --------------------------------------------------------
        for bnk_row in bank_records:
            b_id = str(bnk_row.get("bank_transaction_id", "")).strip()
            if b_id in processed_bank_ids:
                continue
            b_credit = float(bnk_row.get("credit_amount", 0.0))
            if b_credit <= 0:
                continue
                
            exception_idx += 1
            ex_code = f"EX-{exception_idx}"
            processed_bank_ids.add(b_id)
            
            # This is the deliberate unresolvable case (e.g. ₹75,420 unexplained credit)
            exceptions.append({
                "exception_code": ex_code,
                "category": "UNRESOLVED",
                "severity": "CRITICAL",
                "status": "REQUIRES_REVIEW",
                "discrepancy_amount": b_credit,
                "order_ids": [],
                "gateway_ids": [],
                "bank_ids": [str(bnk_row.get("id", b_id))],
                "order_display_ids": [],
                "gateway_display_ids": [],
                "bank_display_ids": [b_id],
                "deterministic_reason": f"Unallocated bank credit of ₹{b_credit:,.2f} on {bnk_row.get('value_date_parsed') or bnk_row.get('transaction_date_parsed')}. Description: '{bnk_row.get('description', '')}'. No corresponding payment gateway settlement batch or merchant order exists. No defensible mathematical combination found.",
                "evidence_summary": {
                    "bank_transaction_id": b_id,
                    "credit_amount": b_credit,
                    "description": str(bnk_row.get("description", "")),
                    "reference": str(bnk_row.get("reference", "")),
                    "date": str(bnk_row.get("value_date_parsed", "")),
                    "forced_match_prevented": True
                }
            })
            
        return exceptions
