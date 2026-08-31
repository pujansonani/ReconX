import re
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Tuple, Dict, Any, List, Optional
from app.models.schema import ValidationSummary, ValidationIssue

# Column alias dictionary for smart auto-detection
ORDER_ALIASES = {
    "order_id": ["order_id", "orderid", "order_no", "order_number", "id", "invoice_id"],
    "transaction_id": ["transaction_id", "transactionid", "txn_id", "payment_id", "tx_id", "reference_id"],
    "order_date": ["order_date", "date", "created_at", "timestamp", "order_time", "transaction_date"],
    "customer_id": ["customer_id", "customerid", "user_id", "cust_id", "client_id"],
    "gross_amount": ["gross_amount", "amount", "total", "order_amount", "price", "subtotal", "total_amount"],
    "refund_amount": ["refund_amount", "refund", "refunded_amount", "returns"],
    "currency": ["currency", "curr", "currency_code"],
    "status": ["status", "order_status", "payment_status", "state"]
}

GATEWAY_ALIASES = {
    "transaction_id": ["transaction_id", "transactionid", "txn_id", "payment_id", "tx_id", "payment_reference"],
    "gateway_reference": ["gateway_reference", "gateway_ref", "pg_ref", "arn", "rrn", "acquirer_ref", "external_id"],
    "settlement_batch_id": ["settlement_batch_id", "batch_id", "settlement_id", "payout_batch", "utr", "batch_no"],
    "transaction_date": ["transaction_date", "txn_date", "date", "captured_at", "authorized_at", "created_at"],
    "settlement_date": ["settlement_date", "settled_at", "payout_date", "settlement_time"],
    "gross_amount": ["gross_amount", "gross", "amount", "charge_amount", "captured_amount"],
    "gateway_fee": ["gateway_fee", "fee", "fees", "commission", "mdr", "processing_fee"],
    "gst": ["gst", "tax", "gst_amount", "service_tax", "vat"],
    "refund_amount": ["refund_amount", "refund", "refunded_amount", "refunds"],
    "chargeback_amount": ["chargeback_amount", "chargeback", "dispute_amount", "disputes"],
    "net_amount": ["net_amount", "net", "settlement_amount", "payout_amount", "net_settlement"],
    "currency": ["currency", "curr", "currency_code"]
}

BANK_ALIASES = {
    "bank_transaction_id": ["bank_transaction_id", "transaction_id", "txn_id", "id", "entry_id", "sequence_no"],
    "reference": ["reference", "ref_no", "utr", "reference_number", "cheque_no", "description_ref", "batch_reference"],
    "transaction_date": ["transaction_date", "date", "txn_date", "posting_date", "booking_date"],
    "value_date": ["value_date", "val_date", "effective_date"],
    "description": ["description", "narration", "particulars", "remarks", "memo"],
    "credit_amount": ["credit_amount", "credit", "deposit", "cr", "deposits", "amount_credit"],
    "debit_amount": ["debit_amount", "debit", "withdrawal", "dr", "withdrawals", "amount_debit"],
    "currency": ["currency", "curr", "currency_code"]
}

def clean_currency_str(val: Any) -> float:
    """Safely convert currency string or number to float."""
    if pd.isna(val) or val is None or val == "":
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    val_str = str(val).strip()
    # Remove currency symbols, commas, spaces
    cleaned = re.sub(r"[₹$,\sA-Za-z]", "", val_str)
    if not cleaned:
        return 0.0
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def clean_date(val: Any) -> Optional[datetime]:
    """Parse various date formats into datetime object."""
    if pd.isna(val) or val is None or val == "":
        return None
    if isinstance(val, (datetime, pd.Timestamp)):
        return val.to_pydatetime() if hasattr(val, "to_pydatetime") else val
    val_str = str(val).strip()
    # Common date formats
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%d",
        "%d-%m-%Y %H:%M:%S",
        "%d-%m-%Y",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y",
        "%m/%d/%Y %H:%M:%S",
        "%m/%d/%Y",
        "%Y/%m/%d"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(val_str, fmt)
        except ValueError:
            continue
    try:
        # Fallback to dateutil/pandas parser
        parsed = pd.to_datetime(val_str)
        return parsed.to_pydatetime() if hasattr(parsed, "to_pydatetime") else parsed
    except Exception:
        return None

def map_columns(df: pd.DataFrame, alias_dict: Dict[str, List[str]]) -> Dict[str, str]:
    """Map raw dataframe column names to standardized canonical column names."""
    normalized_cols = {col.lower().strip().replace(" ", "_"): col for col in df.columns}
    mapping = {}
    for canonical, aliases in alias_dict.items():
        for alias in aliases:
            clean_alias = alias.lower().strip().replace(" ", "_")
            if clean_alias in normalized_cols:
                mapping[normalized_cols[clean_alias]] = canonical
                break
    return mapping

class DataNormalizer:
    @staticmethod
    def normalize_orders(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[ValidationIssue]]:
        issues: List[ValidationIssue] = []
        mapping = map_columns(df, ORDER_ALIASES)
        norm_df = df.rename(columns=mapping).copy()

        # Ensure required canonical columns exist
        if "order_id" not in norm_df.columns:
            # Fallback: create index-based order_id
            norm_df["order_id"] = [f"ORD-{i+1000}" for i in range(len(norm_df))]
            issues.append(ValidationIssue(
                level="WARNING",
                source="ORDERS",
                message="Missing 'order_id' column in orders CSV. Auto-generated sequential order IDs.",
                row_count=len(norm_df)
            ))
        
        if "gross_amount" not in norm_df.columns:
            norm_df["gross_amount"] = 0.0
            issues.append(ValidationIssue(
                level="ERROR",
                source="ORDERS",
                message="Missing gross amount column in orders CSV.",
                row_count=len(norm_df)
            ))
        else:
            norm_df["gross_amount"] = norm_df["gross_amount"].apply(clean_currency_str)

        norm_df["refund_amount"] = norm_df["refund_amount"].apply(clean_currency_str) if "refund_amount" in norm_df.columns else 0.0
        norm_df["currency"] = norm_df["currency"].fillna("INR").astype(str).str.strip().str.upper() if "currency" in norm_df.columns else "INR"
        norm_df["status"] = norm_df["status"].fillna("COMPLETED").astype(str).str.strip().str.upper() if "status" in norm_df.columns else "COMPLETED"
        
        if "transaction_id" in norm_df.columns:
            norm_df["transaction_id"] = norm_df["transaction_id"].fillna("").astype(str).str.strip()
            # Check empty transaction IDs
            empty_tx = norm_df[norm_df["transaction_id"] == ""]
            if len(empty_tx) > 0:
                issues.append(ValidationIssue(
                    level="WARNING",
                    source="ORDERS",
                    message=f"{len(empty_tx)} order records have empty transaction IDs.",
                    row_count=len(empty_tx),
                    sample_ids=list(empty_tx["order_id"].head(5))
                ))
        else:
            norm_df["transaction_id"] = ""

        if "order_date" in norm_df.columns:
            norm_df["order_date_parsed"] = norm_df["order_date"].apply(clean_date)
        else:
            norm_df["order_date_parsed"] = datetime.utcnow()

        if "customer_id" in norm_df.columns:
            norm_df["customer_id"] = norm_df["customer_id"].fillna("").astype(str).str.strip()
        else:
            norm_df["customer_id"] = ""

        # Check for duplicates in order_id
        duplicates = norm_df[norm_df.duplicated(subset=["order_id"], keep=False)]
        if len(duplicates) > 0:
            issues.append(ValidationIssue(
                level="WARNING",
                source="ORDERS",
                message=f"{len(duplicates)} duplicate order IDs found.",
                row_count=len(duplicates),
                sample_ids=list(duplicates["order_id"].head(5))
            ))

        return norm_df, issues

    @staticmethod
    def normalize_gateway(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[ValidationIssue]]:
        issues: List[ValidationIssue] = []
        mapping = map_columns(df, GATEWAY_ALIASES)
        norm_df = df.rename(columns=mapping).copy()

        if "transaction_id" not in norm_df.columns:
            norm_df["transaction_id"] = [f"TXN-GW-{i+1000}" for i in range(len(norm_df))]
            issues.append(ValidationIssue(
                level="WARNING",
                source="GATEWAY",
                message="Missing transaction_id column in gateway report. Auto-generated IDs.",
                row_count=len(norm_df)
            ))
        else:
            norm_df["transaction_id"] = norm_df["transaction_id"].fillna("").astype(str).str.strip()

        norm_df["gateway_reference"] = norm_df["gateway_reference"].fillna("").astype(str).str.strip() if "gateway_reference" in norm_df.columns else ""
        norm_df["settlement_batch_id"] = norm_df["settlement_batch_id"].fillna("").astype(str).str.strip() if "settlement_batch_id" in norm_df.columns else ""
        
        norm_df["gross_amount"] = norm_df["gross_amount"].apply(clean_currency_str) if "gross_amount" in norm_df.columns else 0.0
        norm_df["gateway_fee"] = norm_df["gateway_fee"].apply(clean_currency_str) if "gateway_fee" in norm_df.columns else 0.0
        norm_df["gst"] = norm_df["gst"].apply(clean_currency_str) if "gst" in norm_df.columns else 0.0
        norm_df["refund_amount"] = norm_df["refund_amount"].apply(clean_currency_str) if "refund_amount" in norm_df.columns else 0.0
        norm_df["chargeback_amount"] = norm_df["chargeback_amount"].apply(clean_currency_str) if "chargeback_amount" in norm_df.columns else 0.0
        
        if "net_amount" in norm_df.columns:
            norm_df["net_amount"] = norm_df["net_amount"].apply(clean_currency_str)
        else:
            # Calculate net deterministically
            norm_df["net_amount"] = (
                norm_df["gross_amount"] - norm_df["gateway_fee"] - norm_df["gst"] - norm_df["refund_amount"] - norm_df["chargeback_amount"]
            ).round(2)

        norm_df["transaction_date_parsed"] = norm_df["transaction_date"].apply(clean_date) if "transaction_date" in norm_df.columns else datetime.utcnow()
        norm_df["settlement_date_parsed"] = norm_df["settlement_date"].apply(clean_date) if "settlement_date" in norm_df.columns else norm_df["transaction_date_parsed"]
        norm_df["currency"] = norm_df["currency"].fillna("INR").astype(str).str.strip().str.upper() if "currency" in norm_df.columns else "INR"

        # Sanity check net = gross - fee - gst - refund - chargeback
        computed_net = (norm_df["gross_amount"] - norm_df["gateway_fee"] - norm_df["gst"] - norm_df["refund_amount"] - norm_df["chargeback_amount"]).round(2)
        diff = (norm_df["net_amount"] - computed_net).abs()
        mismatches = norm_df[diff > 0.05]
        if len(mismatches) > 0:
            issues.append(ValidationIssue(
                level="WARNING",
                source="GATEWAY",
                message=f"{len(mismatches)} gateway records have internal fee/net calculation discrepancies.",
                row_count=len(mismatches),
                sample_ids=list(mismatches["transaction_id"].head(5))
            ))

        return norm_df, issues

    @staticmethod
    def normalize_bank(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[ValidationIssue]]:
        issues: List[ValidationIssue] = []
        mapping = map_columns(df, BANK_ALIASES)
        norm_df = df.rename(columns=mapping).copy()

        if "bank_transaction_id" not in norm_df.columns:
            norm_df["bank_transaction_id"] = [f"BNK-{i+1000}" for i in range(len(norm_df))]
            issues.append(ValidationIssue(
                level="WARNING",
                source="BANK",
                message="Missing bank_transaction_id column in bank statement. Auto-generated IDs.",
                row_count=len(norm_df)
            ))
        else:
            norm_df["bank_transaction_id"] = norm_df["bank_transaction_id"].fillna("").astype(str).str.strip()

        norm_df["reference"] = norm_df["reference"].fillna("").astype(str).str.strip() if "reference" in norm_df.columns else ""
        norm_df["description"] = norm_df["description"].fillna("").astype(str).str.strip() if "description" in norm_df.columns else ""
        norm_df["credit_amount"] = norm_df["credit_amount"].apply(clean_currency_str) if "credit_amount" in norm_df.columns else 0.0
        norm_df["debit_amount"] = norm_df["debit_amount"].apply(clean_currency_str) if "debit_amount" in norm_df.columns else 0.0
        norm_df["currency"] = norm_df["currency"].fillna("INR").astype(str).str.strip().str.upper() if "currency" in norm_df.columns else "INR"
        
        norm_df["transaction_date_parsed"] = norm_df["transaction_date"].apply(clean_date) if "transaction_date" in norm_df.columns else datetime.utcnow()
        norm_df["value_date_parsed"] = norm_df["value_date"].apply(clean_date) if "value_date" in norm_df.columns else norm_df["transaction_date_parsed"]

        # Check references extracted from description if reference column is empty
        empty_ref_mask = norm_df["reference"] == ""
        if empty_ref_mask.any():
            # Try regex extraction for UTR / BATCH / SETTLE patterns from description
            def extract_ref(desc: str) -> str:
                match = re.search(r"(SETTLE[-_]\w+|BATCH[-_]\w+|UTR[-_]?\w+|TXN[-_]\w+)", str(desc), re.IGNORECASE)
                return match.group(0).strip() if match else ""
            norm_df.loc[empty_ref_mask, "reference"] = norm_df.loc[empty_ref_mask, "description"].apply(extract_ref)

        return norm_df, issues

    @classmethod
    def validate_all(
        cls,
        orders_df: pd.DataFrame,
        gateway_df: pd.DataFrame,
        bank_df: pd.DataFrame
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, ValidationSummary]:
        norm_orders, order_issues = cls.normalize_orders(orders_df)
        norm_gateway, gateway_issues = cls.normalize_gateway(gateway_df)
        norm_bank, bank_issues = cls.normalize_bank(bank_df)

        all_issues = order_issues + gateway_issues + bank_issues

        # Date ranges
        def get_date_range(series: pd.Series) -> Dict[str, Optional[str]]:
            valid_dates = series.dropna()
            if len(valid_dates) > 0:
                return {
                    "start": valid_dates.min().strftime("%Y-%m-%d") if isinstance(valid_dates.min(), datetime) else str(valid_dates.min()),
                    "end": valid_dates.max().strftime("%Y-%m-%d") if isinstance(valid_dates.max(), datetime) else str(valid_dates.max())
                }
            return {"start": None, "end": None}

        summary = ValidationSummary(
            orders_count=len(norm_orders),
            gateway_count=len(norm_gateway),
            bank_count=len(norm_bank),
            orders_valid_count=len(norm_orders[norm_orders["gross_amount"] > 0]),
            gateway_valid_count=len(norm_gateway[norm_gateway["gross_amount"] > 0]),
            bank_valid_count=len(norm_bank[norm_bank["credit_amount"] > 0]),
            orders_amount_total=float(norm_orders["gross_amount"].sum()),
            gateway_gross_total=float(norm_gateway["gross_amount"].sum()),
            bank_credit_total=float(norm_bank["credit_amount"].sum()),
            issues=all_issues,
            columns_detected={
                "orders": list(norm_orders.columns),
                "gateway": list(norm_gateway.columns),
                "bank": list(norm_bank.columns)
            },
            date_ranges={
                "orders": get_date_range(norm_orders["order_date_parsed"]),
                "gateway": get_date_range(norm_gateway["transaction_date_parsed"]),
                "bank": get_date_range(norm_bank["transaction_date_parsed"])
            }
        )

        return norm_orders, norm_gateway, norm_bank, summary
