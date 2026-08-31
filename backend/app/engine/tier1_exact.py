import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Any

class Tier1ExactMatcher:
    """
    Tier 1: Exact Reference Matching Engine
    Uses transaction_id, gateway_reference, order_id, and bank_reference for 100% confidence matches.
    """
    @staticmethod
    def match(
        orders_df: pd.DataFrame,
        gateway_df: pd.DataFrame,
        bank_df: pd.DataFrame,
        amount_tolerance: float = 0.01
    ) -> Tuple[List[Dict[str, Any]], pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        matches: List[Dict[str, Any]] = []
        
        # Working copies
        unmatched_orders = orders_df.copy()
        unmatched_gateway = gateway_df.copy()
        unmatched_bank = bank_df.copy()
        
        # Fast lookup indices
        # 1. Orders indexed by transaction_id
        valid_order_tx = unmatched_orders[unmatched_orders["transaction_id"] != ""].copy()
        order_by_tx = {row["transaction_id"]: idx for idx, row in valid_order_tx.iterrows()}
        
        # 2. Bank indexed by reference & description contains
        valid_bank_ref = unmatched_bank[unmatched_bank["reference"] != ""].copy()
        bank_by_ref = {row["reference"]: idx for idx, row in valid_bank_ref.iterrows()}
        
        matched_order_indices = set()
        matched_gateway_indices = set()
        matched_bank_indices = set()
        
        for gw_idx, gw_row in unmatched_gateway.iterrows():
            gw_tx = gw_row["transaction_id"]
            gw_ref = gw_row["gateway_reference"]
            
            # Find matching order
            matched_ord_idx = None
            if gw_tx and gw_tx in order_by_tx:
                matched_ord_idx = order_by_tx[gw_tx]
            elif gw_ref and gw_ref in order_by_tx:
                matched_ord_idx = order_by_tx[gw_ref]
                
            # Find matching bank entry
            matched_bnk_idx = None
            if gw_tx and gw_tx in bank_by_ref:
                matched_bnk_idx = bank_by_ref[gw_tx]
            elif gw_ref and gw_ref in bank_by_ref:
                matched_bnk_idx = bank_by_ref[gw_ref]
            
            # Check 3-way match: Order + Gateway + Bank
            if (matched_ord_idx is not None and matched_ord_idx not in matched_order_indices and
                matched_bnk_idx is not None and matched_bnk_idx not in matched_bank_indices):
                
                ord_row = unmatched_orders.loc[matched_ord_idx]
                bnk_row = unmatched_bank.loc[matched_bnk_idx]
                
                # Check financial balance
                ord_gross = float(ord_row["gross_amount"])
                gw_gross = float(gw_row["gross_amount"])
                gw_net = float(gw_row["net_amount"])
                bnk_credit = float(bnk_row["credit_amount"])
                
                gross_diff = abs(ord_gross - gw_gross)
                net_diff = abs(gw_net - bnk_credit)
                
                # Only match in Tier 1 if financial arithmetic is clean within tolerance, no fee discrepancy, and no unhandled chargeback/refund
                expected_fee = round(gw_gross * 0.018, 2)
                fee_diff = abs(float(gw_row["gateway_fee"]) - expected_fee)
                if (gross_diff <= amount_tolerance and net_diff <= amount_tolerance and 
                    float(gw_row["chargeback_amount"]) == 0.0 and float(gw_row["refund_amount"]) == 0.0 and
                    fee_diff <= 1.0):
                    matched_order_indices.add(matched_ord_idx)
                    matched_gateway_indices.add(gw_idx)
                    matched_bank_indices.add(matched_bnk_idx)
                    
                    matches.append({
                        "match_tier": "TIER_1_EXACT",
                        "match_method": "exact_3way_reference",
                        "confidence_score": 100.0,
                        "order_ids": [str(ord_row.get("id", ord_row["order_id"]))],
                        "gateway_ids": [str(gw_row.get("id", gw_row["transaction_id"]))],
                        "bank_ids": [str(bnk_row.get("id", bnk_row["bank_transaction_id"]))],
                        "order_display_ids": [str(ord_row["order_id"])],
                        "gateway_display_ids": [str(gw_row["transaction_id"])],
                        "bank_display_ids": [str(bnk_row["bank_transaction_id"])],
                        "gross_amount": gw_gross,
                        "gateway_fees": float(gw_row["gateway_fee"]),
                        "gst_amount": float(gw_row["gst"]),
                        "refunds_amount": float(gw_row["refund_amount"]),
                        "chargebacks_amount": float(gw_row["chargeback_amount"]),
                        "net_settlement": gw_net,
                        "bank_settlement": bnk_credit,
                        "difference": round(gw_net - bnk_credit, 2),
                        "evidence": {
                            "order_id": str(ord_row["order_id"]),
                            "transaction_id": str(gw_tx),
                            "gateway_reference": str(gw_ref),
                            "bank_transaction_id": str(bnk_row["bank_transaction_id"]),
                            "matched_keys": ["transaction_id", "reference"],
                            "order_gross": ord_gross,
                            "gateway_net": gw_net,
                            "bank_credit": bnk_credit
                        },
                        "status": "RECONCILED"
                    })

        # Filter out matched records
        remaining_orders = unmatched_orders.drop(index=list(matched_order_indices)).reset_index(drop=True)
        remaining_gateway = unmatched_gateway.drop(index=list(matched_gateway_indices)).reset_index(drop=True)
        remaining_bank = unmatched_bank.drop(index=list(matched_bank_indices)).reset_index(drop=True)
        
        return matches, remaining_orders, remaining_gateway, remaining_bank
