import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, List, Dict, Any, Optional

class Tier3BatchDecomposer:
    """
    Tier 3: Netted Batch Settlement Decomposition Engine
    Reconstructs consolidated multi-transaction batch payouts from bank lump sums:
    Bank Settlement = sum(Gross) - sum(Fees) - sum(GST) - sum(Refunds) - sum(Chargebacks)
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
        
        if gateway_df.empty or bank_df.empty:
            return matches, orders_df, gateway_df, bank_df
            
        unmatched_orders = orders_df.copy()
        unmatched_gateway = gateway_df.copy()
        unmatched_bank = bank_df.copy()
        
        matched_order_indices = set()
        matched_gateway_indices = set()
        matched_bank_indices = set()
        
        # Order lookup by transaction_id
        valid_orders = unmatched_orders[unmatched_orders["transaction_id"] != ""]
        order_by_tx = {row["transaction_id"]: idx for idx, row in valid_orders.iterrows()}
        
        # Group gateway records by settlement_batch_id where batch_id is present
        gateway_batches: Dict[str, List[int]] = {}
        for gw_idx, gw_row in unmatched_gateway.iterrows():
            batch_id = str(gw_row.get("settlement_batch_id", "")).strip()
            if batch_id and batch_id.lower() != "nan" and batch_id != "":
                if batch_id not in gateway_batches:
                    gateway_batches[batch_id] = []
                gateway_batches[batch_id].append(gw_idx)
                
        # 1. Match by Settlement Batch ID
        for batch_id, gw_indices in gateway_batches.items():
            if len(gw_indices) < 2:
                continue  # Single records handled in Tier 1 / 2
                
            gw_subset = unmatched_gateway.loc[gw_indices]
            total_gross = float(gw_subset["gross_amount"].sum())
            total_fees = float(gw_subset["gateway_fee"].sum())
            total_gst = float(gw_subset["gst"].sum())
            total_refunds = float(gw_subset["refund_amount"].sum())
            total_chargebacks = float(gw_subset["chargeback_amount"].sum())
            calculated_net = round(total_gross - total_fees - total_gst - total_refunds - total_chargebacks, 2)
            
            # Find matching bank transaction by reference or description containing batch_id or exact net sum
            matching_bnk_idx = None
            for bnk_idx, bnk_row in unmatched_bank.iterrows():
                if bnk_idx in matched_bank_indices:
                    continue
                bnk_ref = str(bnk_row.get("reference", "")).strip()
                bnk_desc = str(bnk_row.get("description", "")).strip()
                bnk_credit = float(bnk_row["credit_amount"])
                
                # Check if batch_id matches reference or description
                if (batch_id in bnk_ref or batch_id in bnk_desc or (batch_id.replace("BATCH-", "") in bnk_desc)) and abs(calculated_net - bnk_credit) <= 0.05:
                    matching_bnk_idx = bnk_idx
                    break
                elif abs(calculated_net - bnk_credit) <= amount_tolerance and len(gw_indices) >= 5:
                    # Pure amount match on substantial batch
                    matching_bnk_idx = bnk_idx
                    break
                    
            if matching_bnk_idx is not None:
                bnk_row = unmatched_bank.loc[matching_bnk_idx]
                bnk_credit = float(bnk_row["credit_amount"])
                
                # Collect matching order indices
                batch_order_indices = []
                order_display_ids = []
                for g_idx in gw_indices:
                    tx_id = unmatched_gateway.loc[g_idx, "transaction_id"]
                    if tx_id in order_by_tx:
                        o_idx = order_by_tx[tx_id]
                        if o_idx not in matched_order_indices:
                            batch_order_indices.append(o_idx)
                            order_display_ids.append(str(unmatched_orders.loc[o_idx, "order_id"]))
                            
                matched_gateway_indices.update(gw_indices)
                matched_bank_indices.add(matching_bnk_idx)
                matched_order_indices.update(batch_order_indices)
                
                gw_tx_list = []
                for g_idx in gw_indices:
                    row = unmatched_gateway.loc[g_idx]
                    gw_tx_list.append({
                        "transaction_id": str(row["transaction_id"]),
                        "gross_amount": float(row["gross_amount"]),
                        "fee": float(row["gateway_fee"]),
                        "gst": float(row["gst"]),
                        "refund": float(row["refund_amount"]),
                        "chargeback": float(row["chargeback_amount"]),
                        "net": float(row["net_amount"]),
                        "date": str(row.get("transaction_date_parsed", ""))
                    })
                
                matches.append({
                    "match_tier": "TIER_3_NET_BATCH",
                    "match_method": "netted_batch_decomposition",
                    "confidence_score": 99.0,
                    "order_ids": [str(unmatched_orders.loc[i].get("id", unmatched_orders.loc[i]["order_id"])) for i in batch_order_indices],
                    "gateway_ids": [str(unmatched_gateway.loc[i].get("id", unmatched_gateway.loc[i]["transaction_id"])) for i in gw_indices],
                    "bank_ids": [str(bnk_row.get("id", bnk_row["bank_transaction_id"]))],
                    "order_display_ids": order_display_ids,
                    "gateway_display_ids": [str(unmatched_gateway.loc[i, "transaction_id"]) for i in gw_indices],
                    "bank_display_ids": [str(bnk_row["bank_transaction_id"])],
                    "gross_amount": round(total_gross, 2),
                    "gateway_fees": round(total_fees, 2),
                    "gst_amount": round(total_gst, 2),
                    "refunds_amount": round(total_refunds, 2),
                    "chargebacks_amount": round(total_chargebacks, 2),
                    "net_settlement": calculated_net,
                    "bank_settlement": bnk_credit,
                    "difference": round(calculated_net - bnk_credit, 2),
                    "evidence": {
                        "batch_id": batch_id,
                        "bank_transaction_id": str(bnk_row["bank_transaction_id"]),
                        "bank_credit": bnk_credit,
                        "transaction_count": len(gw_indices),
                        "total_gross": round(total_gross, 2),
                        "total_fees": round(total_fees, 2),
                        "total_gst": round(total_gst, 2),
                        "total_refunds": round(total_refunds, 2),
                        "total_chargebacks": round(total_chargebacks, 2),
                        "reconstructed_net": calculated_net,
                        "gateway_sample": gw_tx_list[:10]
                    },
                    "status": "RECONCILED"
                })

        remaining_orders = unmatched_orders.drop(index=list(matched_order_indices)).reset_index(drop=True)
        remaining_gateway = unmatched_gateway.drop(index=list(matched_gateway_indices)).reset_index(drop=True)
        remaining_bank = unmatched_bank.drop(index=list(matched_bank_indices)).reset_index(drop=True)
        
        return matches, remaining_orders, remaining_gateway, remaining_bank
