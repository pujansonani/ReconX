import pytest
import pandas as pd
from app.engine.normalizer import DataNormalizer, clean_currency_str, clean_date

def test_clean_currency_str():
    assert clean_currency_str("₹1,240.50") == 1240.50
    assert clean_currency_str("$500.00") == 500.00
    assert clean_currency_str("  10,000 ") == 10000.00
    assert clean_currency_str(None) == 0.0
    assert clean_currency_str(42.5) == 42.5

def test_clean_date():
    dt = clean_date("2026-01-15 10:30:00")
    assert dt is not None
    assert dt.year == 2026
    assert dt.month == 1
    assert dt.day == 15

    dt2 = clean_date("15/01/2026")
    assert dt2 is not None
    assert dt2.year == 2026

def test_normalize_orders_with_aliases():
    df = pd.DataFrame([
        {"Order No": "ORD-99", "Txn ID": "TXN-99", "Date": "2026-01-01", "Amount": "₹1,500.00", "State": "COMPLETED"},
        {"Order No": "ORD-100", "Txn ID": "TXN-100", "Date": "2026-01-02", "Amount": "2500", "State": "COMPLETED"}
    ])
    norm_df, issues = DataNormalizer.normalize_orders(df)
    assert "order_id" in norm_df.columns
    assert "transaction_id" in norm_df.columns
    assert "gross_amount" in norm_df.columns
    assert norm_df.loc[0, "gross_amount"] == 1500.0
    assert norm_df.loc[1, "gross_amount"] == 2500.0
    assert len(norm_df) == 2
