import pandas as pd
import json
import sys
from pathlib import Path

EXCEL = Path("classes.xlsx")
JSON_OUT = Path("classes.json")
REQUIRED = {"Grade", "Dates", "CSVLink"}

def main():
    if not EXCEL.exists():
        print(f"ERROR: {EXCEL} not found at repo root.", file=sys.stderr)
        sys.exit(1)

    print(f"Reading: {EXCEL.resolve()}")
    df = pd.read_excel(EXCEL)

    print("Columns found in Excel:", list(df.columns))
    missing = REQUIRED - set(df.columns)
    if missing:
        print(f"ERROR: Missing required columns: {missing}", file=sys.stderr)
        sys.exit(1)

    # Keep only needed columns (order preserved)
    df = df[["Grade", "Dates", "CSVLink"]]

    # Warn about obvious empty links
    if df["CSVLink"].isna().any():
        print("WARNING: Some rows have empty CSVLink values.", file=sys.stderr)

    data = df.to_dict(orient="records")
    with JSON_OUT.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Wrote: {JSON_OUT.resolve()}")
    print(f"Rows: {len(data)}")

if __name__ == "__main__":
    main()
