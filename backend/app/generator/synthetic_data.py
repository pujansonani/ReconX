import random
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List

def generate_synthetic_dataset(
    scenario: str = "ADVERSARIAL",
    num_records: int = 2000,
    seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict[str, Any]]:
    """
    Generates synthetic datasets for Orders, Gateway Settlements, and Bank Statements.
    Returns:
        orders_df, gateway_df, bank_df, ground_truth
    """
    random.seed(seed)
    np.random.seed(seed)
    
    start_date = datetime(2026, 1, 1, 9, 0, 0)
    
    orders = []
    gateway_records = []
    bank_records = []
    ground_truth = {
        "scenario": scenario,
        "total_target_records": num_records,
        "exact_matches": [],
        "fuzzy_matches": [],
        "batch_matches": [],
        "exceptions": [],
        "unresolvable_bank_ids": []
    }
    
    # Base fee rates
    FEE_RATE = 0.018  # 1.8% gateway fee
    GST_RATE = 0.18   # 18% GST on fee
    
    # 1. Generate core 1-to-1 matching transactions (Tier 1 & Tier 2)
    # 70% Tier 1, 15% Tier 2, 10% Batch Decomposition, 5% Exceptions
    t1_count = int(num_records * 0.70)
    t2_count = int(num_records * 0.14)
    batch_tx_count = int(num_records * 0.10)
    exception_count = num_records - t1_count - t2_count - batch_tx_count
    
    record_idx = 1000
    
    # Helper to create timestamps
    def random_time(offset_days: float) -> datetime:
        return start_date + timedelta(days=offset_days, minutes=random.randint(0, 1440))
    
    # --- TIER 1: Exact Reference Match (Clean 1-to-1) ---
    for i in range(t1_count):
        record_idx += 1
        order_id = f"ORD-{record_idx:05d}"
        tx_id = f"TXN-{record_idx:05d}"
        gw_ref = f"PG-{record_idx:05d}"
        bank_tx_id = f"BNK-{record_idx:05d}"
        
        day_offset = (i / t1_count) * 25.0  # spread over 25 days
        o_date = random_time(day_offset)
        gw_date = o_date + timedelta(seconds=random.randint(10, 300))
        settle_date = gw_date + timedelta(days=1, hours=random.randint(1, 6))
        bank_date = settle_date + timedelta(hours=random.randint(2, 8))
        
        gross = round(random.uniform(250.0, 8500.0), 2)
        fee = round(gross * FEE_RATE, 2)
        gst = round(fee * GST_RATE, 2)
        net = round(gross - fee - gst, 2)
        
        batch_id = f"BATCH-T1-{record_idx:05d}"
        
        # Order
        orders.append({
            "order_id": order_id,
            "transaction_id": tx_id,
            "order_date": o_date.strftime("%Y-%m-%d %H:%M:%S"),
            "customer_id": f"CUST-{random.randint(100, 999)}",
            "currency": "INR",
            "gross_amount": gross,
            "refund_amount": 0.0,
            "status": "COMPLETED"
        })
        
        # Gateway
        gateway_records.append({
            "transaction_id": tx_id,
            "gateway_reference": gw_ref,
            "transaction_date": gw_date.strftime("%Y-%m-%d %H:%M:%S"),
            "settlement_date": settle_date.strftime("%Y-%m-%d %H:%M:%S"),
            "gross_amount": gross,
            "gateway_fee": fee,
            "gst": gst,
            "refund_amount": 0.0,
            "chargeback_amount": 0.0,
            "net_amount": net,
            "settlement_batch_id": batch_id,
            "currency": "INR"
        })
        
        # Bank
        bank_records.append({
            "bank_transaction_id": bank_tx_id,
            "transaction_date": bank_date.strftime("%Y-%m-%d %H:%M:%S"),
            "value_date": bank_date.strftime("%Y-%m-%d"),
            "description": f"NEFT PG SETTLEMENT {batch_id} REF {tx_id}",
            "credit_amount": net,
            "debit_amount": 0.0,
            "reference": tx_id,
            "currency": "INR"
        })
        
        ground_truth["exact_matches"].append(tx_id)
        
    # --- TIER 2: Date Window + Amount Match (Missing/Corrupted References) ---
    for i in range(t2_count):
        record_idx += 1
        order_id = f"ORD-{record_idx:05d}"
        tx_id = f"TXN-{record_idx:05d}"
        gw_ref = f"PG-{record_idx:05d}"
        bank_tx_id = f"BNK-{record_idx:05d}"
        
        day_offset = 5.0 + (i / t2_count) * 20.0
        o_date = random_time(day_offset)
        gw_date = o_date + timedelta(minutes=random.randint(1, 45))
        settle_date = gw_date + timedelta(days=2)
        bank_date = settle_date + timedelta(days=1)
        
        gross = round(random.uniform(500.0, 12000.0), 2)
        fee = round(gross * FEE_RATE, 2)
        gst = round(fee * GST_RATE, 2)
        net = round(gross - fee - gst, 2)
        
        orders.append({
            "order_id": order_id,
            "transaction_id": "",  # Missing reference in order system
            "order_date": o_date.strftime("%Y-%m-%d %H:%M:%S"),
            "customer_id": f"CUST-{random.randint(100, 999)}",
            "currency": "INR",
            "gross_amount": gross,
            "refund_amount": 0.0,
            "status": "COMPLETED"
        })
        
        gateway_records.append({
            "transaction_id": tx_id,
            "gateway_reference": gw_ref,
            "transaction_date": gw_date.strftime("%Y-%m-%d %H:%M:%S"),
            "settlement_date": settle_date.strftime("%Y-%m-%d %H:%M:%S"),
            "gross_amount": gross,
            "gateway_fee": fee,
            "gst": gst,
            "refund_amount": 0.0,
            "chargeback_amount": 0.0,
            "net_amount": net,
            "settlement_batch_id": f"BATCH-T2-{record_idx:05d}",
            "currency": "INR"
        })
        
        # Bank has generic description without clean reference
        bank_records.append({
            "bank_transaction_id": bank_tx_id,
            "transaction_date": bank_date.strftime("%Y-%m-%d %H:%M:%S"),
            "value_date": bank_date.strftime("%Y-%m-%d"),
            "description": f"INWARD CMS SETTLEMENT MERCHANT CORP",
            "credit_amount": net,
            "debit_amount": 0.0,
            "reference": "",  # Empty reference in bank
            "currency": "INR"
        })
        
        ground_truth["fuzzy_matches"].append({
            "order_id": order_id,
            "gateway_tx_id": tx_id,
            "bank_tx_id": bank_tx_id,
            "amount": net
        })
        
    # --- TIER 3: Netted Batch Settlement Decomposition ---
    # Groups of 10-40 transactions aggregated into a single bank payout
    num_batches = 8
    tx_per_batch = batch_tx_count // num_batches
    
    for b in range(num_batches):
        batch_id = f"SETTLE-BATCH-{20260110 + b}"
        batch_bank_id = f"BNK-BATCH-{b+1:03d}"
        
        batch_gross = 0.0
        batch_fee = 0.0
        batch_gst = 0.0
        batch_refunds = 0.0
        batch_chargebacks = 0.0
        
        batch_tx_ids = []
        batch_day_offset = 10.0 + b * 2.0
        b_date = random_time(batch_day_offset)
        
        for k in range(tx_per_batch):
            record_idx += 1
            order_id = f"ORD-{record_idx:05d}"
            tx_id = f"TXN-{record_idx:05d}"
            gw_ref = f"PG-{record_idx:05d}"
            batch_tx_ids.append(tx_id)
            
            o_date = b_date - timedelta(hours=random.randint(2, 36))
            gw_date = o_date + timedelta(minutes=5)
            
            gross = round(random.uniform(300.0, 6000.0), 2)
            fee = round(gross * FEE_RATE, 2)
            gst = round(fee * GST_RATE, 2)
            
            refund = 0.0
            chargeback = 0.0
            # Add occasional refund or chargeback within batch
            if k == 3 and b % 2 == 0:
                refund = round(gross * 0.5, 2)  # partial refund
            elif k == 7 and b % 3 == 0:
                chargeback = gross  # chargeback
                
            net = round(gross - fee - gst - refund - chargeback, 2)
            
            batch_gross += gross
            batch_fee += fee
            batch_gst += gst
            batch_refunds += refund
            batch_chargebacks += chargeback
            
            orders.append({
                "order_id": order_id,
                "transaction_id": tx_id,
                "order_date": o_date.strftime("%Y-%m-%d %H:%M:%S"),
                "customer_id": f"CUST-{random.randint(100, 999)}",
                "currency": "INR",
                "gross_amount": gross,
                "refund_amount": refund,
                "status": "REFUNDED" if refund > 0 else "COMPLETED"
            })
            
            gateway_records.append({
                "transaction_id": tx_id,
                "gateway_reference": gw_ref,
                "transaction_date": gw_date.strftime("%Y-%m-%d %H:%M:%S"),
                "settlement_date": b_date.strftime("%Y-%m-%d %H:%M:%S"),
                "gross_amount": gross,
                "gateway_fee": fee,
                "gst": gst,
                "refund_amount": refund,
                "chargeback_amount": chargeback,
                "net_amount": net,
                "settlement_batch_id": batch_id,
                "currency": "INR"
            })
            
        expected_bank_credit = round(batch_gross - batch_fee - batch_gst - batch_refunds - batch_chargebacks, 2)
        
        bank_records.append({
            "bank_transaction_id": batch_bank_id,
            "transaction_date": (b_date + timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S"),
            "value_date": (b_date + timedelta(hours=6)).strftime("%Y-%m-%d"),
            "description": f"CONSOLIDATED GATEWAY PAYOUT {batch_id}",
            "credit_amount": expected_bank_credit,
            "debit_amount": 0.0,
            "reference": batch_id,
            "currency": "INR"
        })
        
        ground_truth["batch_matches"].append({
            "batch_id": batch_id,
            "bank_transaction_id": batch_bank_id,
            "transaction_count": len(batch_tx_ids),
            "expected_bank_credit": expected_bank_credit,
            "gross": round(batch_gross, 2),
            "fees": round(batch_fee, 2),
            "gst": round(batch_gst, 2),
            "refunds": round(batch_refunds, 2),
            "chargebacks": round(batch_chargebacks, 2)
        })
        
    # --- TIER 4: Exceptions & Edge Cases ---
    # Exception Categories:
    # 1. TIMING_DIFFERENCE (Order & Gateway exist at month end, no bank credit yet)
    # 2. FEE_MISMATCH (Gateway fee was charged 3.5% instead of 1.8%)
    # 3. PARTIAL_REFUND (Gateway refunded 500, but order shows full amount)
    # 4. CHARGEBACK (Gateway took chargeback, merchant not notified)
    # 5. DUPLICATE_PAYOUT (Gateway settled twice for same batch)
    # 6. MISSING_ORDER (Gateway transaction exists without merchant order)
    # 7. MISSING_GATEWAY_RECORD (Order completed in merchant system, no payment in gateway)
    # 8. CRITICAL UNRESOLVABLE: ₹75,420 unexplained bank credit
    
    # 1. TIMING_DIFFERENCE
    for _ in range(8):
        record_idx += 1
        order_id = f"ORD-{record_idx:05d}"
        tx_id = f"TXN-{record_idx:05d}"
        gross = 2499.00
        fee = 44.98
        gst = 8.10
        net = round(gross - fee - gst, 2)
        
        orders.append({
            "order_id": order_id,
            "transaction_id": tx_id,
            "order_date": datetime(2026, 1, 31, 23, 45, 0).strftime("%Y-%m-%d %H:%M:%S"),
            "customer_id": "CUST-TIMING",
            "currency": "INR",
            "gross_amount": gross,
            "refund_amount": 0.0,
            "status": "COMPLETED"
        })
        gateway_records.append({
            "transaction_id": tx_id,
            "gateway_reference": f"PG-{record_idx:05d}",
            "transaction_date": datetime(2026, 1, 31, 23, 46, 0).strftime("%Y-%m-%d %H:%M:%S"),
            "settlement_date": datetime(2026, 2, 2, 10, 0, 0).strftime("%Y-%m-%d %H:%M:%S"),
            "gross_amount": gross,
            "gateway_fee": fee,
            "gst": gst,
            "refund_amount": 0.0,
            "chargeback_amount": 0.0,
            "net_amount": net,
            "settlement_batch_id": "BATCH-NEXT-MONTH-01",
            "currency": "INR"
        })
        # No bank statement entry in January statement
        ground_truth["exceptions"].append({
            "tx_id": tx_id,
            "category": "TIMING_DIFFERENCE",
            "amount": gross
        })

    # 2. FEE_MISMATCH
    for _ in range(6):
        record_idx += 1
        order_id = f"ORD-{record_idx:05d}"
        tx_id = f"TXN-{record_idx:05d}"
        gross = 10000.00
        # Incorrect fee: 3.5% instead of 1.8%
        fee = 350.00
        gst = 63.00
        net = round(gross - fee - gst, 2)
        
        orders.append({
            "order_id": order_id,
            "transaction_id": tx_id,
            "order_date": random_time(15).strftime("%Y-%m-%d %H:%M:%S"),
            "customer_id": "CUST-FEE",
            "currency": "INR",
            "gross_amount": gross,
            "refund_amount": 0.0,
            "status": "COMPLETED"
        })
        gateway_records.append({
            "transaction_id": tx_id,
            "gateway_reference": f"PG-{record_idx:05d}",
            "transaction_date": random_time(15).strftime("%Y-%m-%d %H:%M:%S"),
            "settlement_date": random_time(16).strftime("%Y-%m-%d %H:%M:%S"),
            "gross_amount": gross,
            "gateway_fee": fee,
            "gst": gst,
            "refund_amount": 0.0,
            "chargeback_amount": 0.0,
            "net_amount": net,
            "settlement_batch_id": f"BATCH-FEE-{record_idx}",
            "currency": "INR"
        })
        bank_records.append({
            "bank_transaction_id": f"BNK-FEE-{record_idx}",
            "transaction_date": random_time(16).strftime("%Y-%m-%d %H:%M:%S"),
            "value_date": random_time(16).strftime("%Y-%m-%d"),
            "description": f"SETTLEMENT {tx_id}",
            "credit_amount": net,
            "debit_amount": 0.0,
            "reference": tx_id,
            "currency": "INR"
        })
        ground_truth["exceptions"].append({
            "tx_id": tx_id,
            "category": "FEE_MISMATCH",
            "amount": 170.00  # Difference in fee
        })

    # 3. PARTIAL_REFUND Discrepancy
    for _ in range(5):
        record_idx += 1
        order_id = f"ORD-{record_idx:05d}"
        tx_id = f"TXN-{record_idx:05d}"
        gross = 5000.00
        fee = 90.00
        gst = 16.20
        refund = 1500.00
        net = round(gross - fee - gst - refund, 2)
        
        # Order shows 0 refund
        orders.append({
            "order_id": order_id,
            "transaction_id": tx_id,
            "order_date": random_time(18).strftime("%Y-%m-%d %H:%M:%S"),
            "customer_id": "CUST-REFUND",
            "currency": "INR",
            "gross_amount": gross,
            "refund_amount": 0.0,
            "status": "COMPLETED"
        })
        gateway_records.append({
            "transaction_id": tx_id,
            "gateway_reference": f"PG-{record_idx:05d}",
            "transaction_date": random_time(18).strftime("%Y-%m-%d %H:%M:%S"),
            "settlement_date": random_time(19).strftime("%Y-%m-%d %H:%M:%S"),
            "gross_amount": gross,
            "gateway_fee": fee,
            "gst": gst,
            "refund_amount": refund,
            "chargeback_amount": 0.0,
            "net_amount": net,
            "settlement_batch_id": f"BATCH-REF-{record_idx}",
            "currency": "INR"
        })
        bank_records.append({
            "bank_transaction_id": f"BNK-REF-{record_idx}",
            "transaction_date": random_time(19).strftime("%Y-%m-%d %H:%M:%S"),
            "value_date": random_time(19).strftime("%Y-%m-%d"),
            "description": f"SETTLEMENT WITH REFUND {tx_id}",
            "credit_amount": net,
            "debit_amount": 0.0,
            "reference": tx_id,
            "currency": "INR"
        })
        ground_truth["exceptions"].append({
            "tx_id": tx_id,
            "category": "PARTIAL_REFUND",
            "amount": refund
        })

    # 4. CHARGEBACK (EX-1042 Example from prompt: ₹1,086.56)
    record_idx += 1
    cb_tx_id = f"TXN-{record_idx:05d}"
    cb_order_id = f"ORD-{record_idx:05d}"
    cb_gross = 3500.00
    cb_fee = 63.00
    cb_gst = 11.34
    cb_amount = 1086.56
    cb_net = round(cb_gross - cb_fee - cb_gst - cb_amount, 2)
    
    orders.append({
        "order_id": cb_order_id,
        "transaction_id": cb_tx_id,
        "order_date": random_time(12).strftime("%Y-%m-%d %H:%M:%S"),
        "customer_id": "CUST-CB-19281",
        "currency": "INR",
        "gross_amount": cb_gross,
        "refund_amount": 0.0,
        "status": "COMPLETED"
    })
    gateway_records.append({
        "transaction_id": cb_tx_id,
        "gateway_reference": f"PG-{record_idx:05d}",
        "transaction_date": random_time(12).strftime("%Y-%m-%d %H:%M:%S"),
        "settlement_date": random_time(13).strftime("%Y-%m-%d %H:%M:%S"),
        "gross_amount": cb_gross,
        "gateway_fee": cb_fee,
        "gst": cb_gst,
        "refund_amount": 0.0,
        "chargeback_amount": cb_amount,
        "net_amount": cb_net,
        "settlement_batch_id": "BATCH-CB-902",
        "currency": "INR"
    })
    bank_records.append({
        "bank_transaction_id": f"BNK-CB-{record_idx}",
        "transaction_date": random_time(13).strftime("%Y-%m-%d %H:%M:%S"),
        "value_date": random_time(13).strftime("%Y-%m-%d"),
        "description": f"SETTLEMENT CHARGEBACK CB-19281 {cb_tx_id}",
        "credit_amount": cb_net,
        "debit_amount": 0.0,
        "reference": cb_tx_id,
        "currency": "INR"
    })
    ground_truth["exceptions"].append({
        "tx_id": cb_tx_id,
        "category": "CHARGEBACK",
        "amount": cb_amount
    })

    # 5. MISSING_ORDER (Payment exists in Gateway & Bank, but Merchant Order missing)
    for _ in range(4):
        record_idx += 1
        tx_id = f"TXN-ORPHAN-{record_idx:05d}"
        gross = 1850.00
        fee = 33.30
        gst = 6.00
        net = round(gross - fee - gst, 2)
        gateway_records.append({
            "transaction_id": tx_id,
            "gateway_reference": f"PG-{record_idx:05d}",
            "transaction_date": random_time(20).strftime("%Y-%m-%d %H:%M:%S"),
            "settlement_date": random_time(21).strftime("%Y-%m-%d %H:%M:%S"),
            "gross_amount": gross,
            "gateway_fee": fee,
            "gst": gst,
            "refund_amount": 0.0,
            "chargeback_amount": 0.0,
            "net_amount": net,
            "settlement_batch_id": f"BATCH-NO-ORD-{record_idx}",
            "currency": "INR"
        })
        bank_records.append({
            "bank_transaction_id": f"BNK-NO-ORD-{record_idx}",
            "transaction_date": random_time(21).strftime("%Y-%m-%d %H:%M:%S"),
            "value_date": random_time(21).strftime("%Y-%m-%d"),
            "description": f"DIRECT PG PAYOUT {tx_id}",
            "credit_amount": net,
            "debit_amount": 0.0,
            "reference": tx_id,
            "currency": "INR"
        })
        ground_truth["exceptions"].append({
            "tx_id": tx_id,
            "category": "MISSING_ORDER",
            "amount": gross
        })

    # 6. MISSING_GATEWAY_RECORD (Merchant order says PAID, but no money at Gateway or Bank)
    for _ in range(4):
        record_idx += 1
        order_id = f"ORD-GHOST-{record_idx:05d}"
        tx_id = f"TXN-GHOST-{record_idx:05d}"
        gross = 4200.00
        orders.append({
            "order_id": order_id,
            "transaction_id": tx_id,
            "order_date": random_time(8).strftime("%Y-%m-%d %H:%M:%S"),
            "customer_id": "CUST-GHOST",
            "currency": "INR",
            "gross_amount": gross,
            "refund_amount": 0.0,
            "status": "COMPLETED"
        })
        ground_truth["exceptions"].append({
            "tx_id": tx_id,
            "category": "MISSING_GATEWAY_RECORD",
            "amount": gross
        })

    # 7. CRITICAL UNRESOLVABLE FAILURE CASE: ₹75,420.00 unexplained bank credit
    # No matching gateway settlement, no order, no subset-sum combination.
    unresolvable_bank_id = "BNK-UNRESOLVED-75420"
    bank_records.append({
        "bank_transaction_id": unresolvable_bank_id,
        "transaction_date": datetime(2026, 1, 24, 14, 30, 0).strftime("%Y-%m-%d %H:%M:%S"),
        "value_date": "2026-01-24",
        "description": "RTGS CR CORP UNALLOCATED FUNDS INWARD TREASURY TXN998822",
        "credit_amount": 75420.00,
        "debit_amount": 0.0,
        "reference": "RTGS-998822-UNALLOC",
        "currency": "INR"
    })
    ground_truth["unresolvable_bank_ids"].append(unresolvable_bank_id)
    ground_truth["exceptions"].append({
        "tx_id": unresolvable_bank_id,
        "category": "UNRESOLVED",
        "amount": 75420.00
    })

    orders_df = pd.DataFrame(orders)
    gateway_df = pd.DataFrame(gateway_records)
    bank_df = pd.DataFrame(bank_records)
    
    # Shuffle for realistic non-sequential ordering
    orders_df = orders_df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    gateway_df = gateway_df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    bank_df = bank_df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    
    return orders_df, gateway_df, bank_df, ground_truth
