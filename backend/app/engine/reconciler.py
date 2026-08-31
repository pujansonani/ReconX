import time
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, Tuple, List

from app.engine.normalizer import DataNormalizer
from app.engine.tier1_exact import Tier1ExactMatcher
from app.engine.tier2_fuzzy import Tier2FuzzyMatcher
from app.engine.tier3_batch import Tier3BatchDecomposer
from app.engine.tier4_exceptions import Tier4ExceptionEngine
from app.ai.service import AIService

class ReconciliationOrchestrator:
    """
    Core Multi-Tier Reconciliation Engine.
    Executes cascading deterministic matching tiers followed by AI exception enrichment.
    """
    @classmethod
    def run_reconciliation(
        cls,
        orders_df: pd.DataFrame,
        gateway_df: pd.DataFrame,
        bank_df: pd.DataFrame,
        amount_tolerance: float = 0.01,
        date_window_days: int = 3,
        run_ai: bool = True
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        # 1. Normalization & Pre-validation
        norm_orders, norm_gw, norm_bank, val_summary = DataNormalizer.validate_all(
            orders_df, gateway_df, bank_df
        )
        
        # 2. Tier 1: Exact Reference Match
        t1_matches, rem_orders_t1, rem_gw_t1, rem_bank_t1 = Tier1ExactMatcher.match(
            norm_orders, norm_gw, norm_bank, amount_tolerance=amount_tolerance
        )
        
        # 3. Tier 2: Date Window + Amount Match
        t2_matches, rem_orders_t2, rem_gw_t2, rem_bank_t2 = Tier2FuzzyMatcher.match(
            rem_orders_t1, rem_gw_t1, rem_bank_t1,
            amount_tolerance=amount_tolerance,
            date_window_days=date_window_days
        )
        
        # 4. Tier 3: Netted Batch Settlement Decomposition
        t3_matches, rem_orders_t3, rem_gw_t3, rem_bank_t3 = Tier3BatchDecomposer.match(
            rem_orders_t2, rem_gw_t2, rem_bank_t2,
            amount_tolerance=amount_tolerance,
            date_window_days=date_window_days
        )
        
        all_matches = t1_matches + t2_matches + t3_matches
        
        # 5. Tier 4: Exception Intelligence
        raw_exceptions = Tier4ExceptionEngine.detect_exceptions(
            rem_orders_t3, rem_gw_t3, rem_bank_t3
        )
        
        # 6. AI Enrichment on Exceptions
        enriched_exceptions = []
        for exc in raw_exceptions:
            if run_ai:
                ai_output = AIService.analyze_exception(exc)
                exc["ai_classification"] = ai_output.get("ai_classification")
                exc["ai_confidence"] = ai_output.get("ai_confidence")
                exc["ai_explanation"] = ai_output.get("ai_explanation")
                exc["recommended_action"] = ai_output.get("recommended_action")
                exc["suggested_journal_entry"] = ai_output.get("suggested_journal_entry")
            enriched_exceptions.append(exc)
            
        elapsed_sec = round(time.time() - start_time, 3)
        
        # Compute summary metrics
        total_orders_count = len(norm_orders)
        total_gw_count = len(norm_gw)
        total_bank_count = len(norm_bank)
        total_records = total_orders_count + total_gw_count + total_bank_count
        
        # Count matched individual items
        matched_orders_count = sum(len(m.get("order_ids", [])) for m in all_matches)
        matched_gw_count = sum(len(m.get("gateway_ids", [])) for m in all_matches)
        matched_bank_count = sum(len(m.get("bank_ids", [])) for m in all_matches)
        
        total_reconciled_records = matched_orders_count + matched_gw_count + matched_bank_count
        unresolved_exceptions = [e for e in enriched_exceptions if e.get("category") == "UNRESOLVED"]
        
        match_rate = round((total_reconciled_records / max(1, total_records)) * 100.0, 2)
        
        total_order_amt = float(norm_orders["gross_amount"].sum())
        total_gw_gross = float(norm_gw["gross_amount"].sum())
        total_gw_fees = float(norm_gw["gateway_fee"].sum())
        total_gw_net = float(norm_gw["net_amount"].sum())
        total_bank_cr = float(norm_bank["credit_amount"].sum())
        financial_diff = round(abs(total_gw_net - total_bank_cr), 2)
        
        return {
            "validation_summary": val_summary.model_dump(),
            "matches": all_matches,
            "exceptions": enriched_exceptions,
            "metrics": {
                "total_orders": total_orders_count,
                "total_gateway_records": total_gw_count,
                "total_bank_records": total_bank_count,
                "total_records": total_records,
                "reconciled_count": total_reconciled_records,
                "exception_count": len(enriched_exceptions),
                "unresolved_count": len(unresolved_exceptions),
                "match_rate": match_rate,
                "tier1_exact_count": sum(len(m["gateway_ids"]) for m in t1_matches),
                "tier2_fuzzy_count": sum(len(m["gateway_ids"]) for m in t2_matches),
                "tier3_batch_count": sum(len(m["gateway_ids"]) for m in t3_matches),
                "total_order_amount": total_order_amt,
                "total_gateway_gross": total_gw_gross,
                "total_gateway_fees": total_gw_fees,
                "total_gateway_net": total_gw_net,
                "total_bank_credit": total_bank_cr,
                "financial_difference": financial_diff,
                "processing_time_seconds": elapsed_sec
            },
            "dataframes": {
                "norm_orders": norm_orders,
                "norm_gw": norm_gw,
                "norm_bank": norm_bank
            }
        }
