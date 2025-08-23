import pandas as pd
import json

def excel_to_json(excel_file, json_file):
    df = pd.read_excel(excel_file)
    required_cols = {"Grade", "Dates", "CSVLink"}
    if not required_cols.issubset(df.columns):
        raise ValueError(f"Excel file must contain {required_cols}")
    data = df.to_dict(orient="records")
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Successfully created {json_file} from {excel_file}")

if __name__ == "__main__":
    excel_to_json("classes.xlsx", "classes.json")
