import pytest
import pandas as pd
from app.engine.tier3_batch import Tier3BatchDecomposer

def test_tier3_batch_decomposition():
    # Construct a synthetic batch of 5 gateway records and 1 bank consolidated record
    gw_records = []
    total_gross = 0.0
    total_fee = 0.0
    total_gst = 0.0
    
    for i in range(5):
        gross = 1000.0 * (i + 1)
        fee = round(gross * 0.018, 2)
        gst = round(fee * 0.18, 2)
        net = round(gross - fee - gst, 2)
        total_gross += gross
        total_fee += fee
        total_gst += gst
        gw_records.append({
            "transaction_id": f"TXN-BATCH-{i}",
            "gateway_reference": f"PG-BATCH-{i}",
            "gross_amount": gross,
            "gateway_fee": fee,
            "gst": gst,
            "refund_amount": 0.0,
            "chargeback_amount": 0.0,
            "net_amount": net,
            "settlement_batch_id": "BATCH-TEST-999"
        })
        
    expected_bank_credit = round(total_gross - total_fee - total_gst, 2)
    bank_records = [{
        "bank_transaction_id": "BNK-BATCH-999",
        "reference": "BATCH-TEST-999",
        "description": "BATCH SETTLEMENT BATCH-TEST-999",
        "credit_amount": expected_bank_credit,
        "debit_amount": 0.0
    }]
    
    orders_records = [{
        "order_id": f"ORD-BATCH-{i}",
        "transaction_id": f"TXN-BATCH-{i}",
        "gross_amount": 1000.0 * (i + 1),
        "refund_amount": 0.0
    } for i in range(5)]
    
    matches, rem_o, rem_gw, rem_b = Tier3BatchDecomposer.match(
        orders_df=pd.DataFrame(orders_records),
        gateway_df=pd.DataFrame(gw_records),
        bank_df=pd.DataFrame(bank_records),
        amount_tolerance=0.01
    )
    
    assert len(matches) == 1
    match = matches[0]
    assert match["match_tier"] == "TIER_3_NET_BATCH"
    assert match["gross_amount"] == total_gross
    assert match["difference"] == 0.0
    assert len(match["gateway_ids"]) == 5
    assert len(rem_gw) == 0
    assert len(rem_b) == 0
