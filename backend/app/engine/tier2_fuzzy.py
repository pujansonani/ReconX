import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, List, Dict, Any

class Tier2FuzzyMatcher:
    """
    Tier 2: Amount + Date Window Matching Engine
    Recovers unreferenced transactions where reference IDs are missing or fragmented,
    using strict monetary tolerance and temporal window constraints.
    """
    @staticmethod
    def match(
        orders_df: pd.DataFrame,
        gateway_df: pd.DataFrame,
        bank_df: pd.DataFrame,
        amount_tolerance: float = 0.01,
        date_window_days: int = 3
    ) -> Tuple[List[Dict[str, Any]], pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        matches: List[Dict[str, Any]] = []
        
        if orders_df.empty or gateway_df.empty or bank_df.empty:
            return matches, orders_df, gateway_df, bank_df
            
        unmatched_orders = orders_df.copy()
        unmatched_gateway = gateway_df.copy()
        unmatched_bank = bank_df.copy()
        
        matched_order_indices = set()
        matched_gateway_indices = set()
        matched_bank_indices = set()
        
        # Candidate pairing between gateway and bank based on Net Amount and Settlement Date
        for gw_idx, gw_row in unmatched_gateway.iterrows():
            if gw_idx in matched_gateway_indices:
                continue
                
            gw_net = float(gw_row["net_amount"])
            gw_gross = float(gw_row["gross_amount"])
            gw_cb = float(gw_row.get("chargeback_amount", 0.0))
            gw_ref_amt = float(gw_row.get("refund_amount", 0.0))
            gw_settle_date = gw_row.get("settlement_date_parsed") or gw_row.get("transaction_date_parsed")
            gw_tx_date = gw_row.get("transaction_date_parsed")
            
            # If transaction has chargeback or refund discrepancy, delegate to Tier 4 exception engine
            if gw_net <= 0 or gw_cb > 0 or gw_ref_amt > 0:
                continue
                
            # 1. Find single bank credit candidate
            bank_candidates = []
            for bnk_idx, bnk_row in unmatched_bank.iterrows():
                if bnk_idx in matched_bank_indices:
                    continue
                bnk_credit = float(bnk_row["credit_amount"])
                if abs(gw_net - bnk_credit) <= amount_tolerance:
                    bnk_date = bnk_row.get("value_date_parsed") or bnk_row.get("transaction_date_parsed")
                    if gw_settle_date and bnk_date:
                        date_diff = abs((bnk_date - gw_settle_date).total_seconds() / 86400.0)
                        if date_diff <= date_window_days:
                            bank_candidates.append((bnk_idx, bnk_row, date_diff))
            
            # If unique or best bank candidate found
            if len(bank_candidates) == 1:
                best_bnk_idx, best_bnk_row, bnk_date_diff = bank_candidates[0]
                
                # 2. Find matching order candidate based on gross amount and order date
                order_candidates = []
                for ord_idx, ord_row in unmatched_orders.iterrows():
                    if ord_idx in matched_order_indices:
                        continue
                    ord_gross = float(ord_row["gross_amount"])
                    if abs(ord_gross - gw_gross) <= amount_tolerance:
                        ord_date = ord_row.get("order_date_parsed")
                        if gw_tx_date and ord_date:
                            o_date_diff = abs((gw_tx_date - ord_date).total_seconds() / 86400.0)
                            if o_date_diff <= date_window_days:
                                order_candidates.append((ord_idx, ord_row, o_date_diff))
                                
                if len(order_candidates) == 1:
                    best_ord_idx, best_ord_row, o_date_diff = order_candidates[0]
                    
                    # Compute confidence based on date proximity
                    confidence = max(85.0, round(98.0 - (o_date_diff + bnk_date_diff) * 2.0, 1))
                    
                    matched_order_indices.add(best_ord_idx)
                    matched_gateway_indices.add(gw_idx)
                    matched_bank_indices.add(best_bnk_idx)
                    
                    matches.append({
                        "match_tier": "TIER_2_DATE_AMOUNT",
                        "match_method": "amount_date_window_correlation",
                        "confidence_score": confidence,
                        "order_ids": [str(best_ord_row.get("id", best_ord_row["order_id"]))],
                        "gateway_ids": [str(gw_row.get("id", gw_row["transaction_id"]))],
                        "bank_ids": [str(best_bnk_row.get("id", best_bnk_row["bank_transaction_id"]))],
                        "order_display_ids": [str(best_ord_row["order_id"])],
                        "gateway_display_ids": [str(gw_row["transaction_id"])],
                        "bank_display_ids": [str(best_bnk_row["bank_transaction_id"])],
                        "gross_amount": gw_gross,
                        "gateway_fees": float(gw_row["gateway_fee"]),
                        "gst_amount": float(gw_row["gst"]),
                        "refunds_amount": float(gw_row["refund_amount"]),
                        "chargebacks_amount": float(gw_row["chargeback_amount"]),
                        "net_settlement": gw_net,
                        "bank_settlement": float(best_bnk_row["credit_amount"]),
                        "difference": round(gw_net - float(best_bnk_row["credit_amount"]), 2),
                        "evidence": {
                            "order_id": str(best_ord_row["order_id"]),
                            "gateway_transaction_id": str(gw_row["transaction_id"]),
                            "bank_transaction_id": str(best_bnk_row["bank_transaction_id"]),
                            "order_date_delta_days": round(o_date_diff, 2),
                            "settlement_date_delta_days": round(bnk_date_diff, 2),
                            "matched_by": "monetary_amount_and_date_window"
                        },
                        "status": "PROBABLE"
                    })

        remaining_orders = unmatched_orders.drop(index=list(matched_order_indices)).reset_index(drop=True)
        remaining_gateway = unmatched_gateway.drop(index=list(matched_gateway_indices)).reset_index(drop=True)
        remaining_bank = unmatched_bank.drop(index=list(matched_bank_indices)).reset_index(drop=True)
        
        return matches, remaining_orders, remaining_gateway, remaining_bank
