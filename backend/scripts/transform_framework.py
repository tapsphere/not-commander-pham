import pandas as pd

INPUT_FILE = "framework_raw.xlsx"
OUTPUT_FILE = "framework_clean.csv"


def generate_tags(row):
    words = []

    if pd.notna(row["competency"]):
        words += str(row["competency"]).lower().split()

    if pd.notna(row["sub_competency"]):
        words += str(row["sub_competency"]).lower().split()

    return ",".join(list(set(words))[:5])


def transform():
    df = pd.read_excel(INPUT_FILE, header=None)

    # Convert everything to string for safe processing
    df = df.astype(str)

    records = []

    # 🔥 Loop through rows and detect valid data rows
    for i in range(len(df)):
        row = df.iloc[i].tolist()

        # Heuristic:
        # Real data rows have:
        # [Cluster, Competency, Sub-Competency, ...]
        if (
            len(row) > 3 and
            " & " in row[1] or "and" in row[1].lower()  # cluster
        ):
            cluster = row[1]
            competency = row[2]
            sub_comp = row[3]

            # basic validation
            if (
                len(competency) > 3 and
                len(sub_comp) > 5 and
                "competency" not in competency.lower()
            ):
                records.append({
                    "competency": competency.strip(),
                    "cbe_category": cluster.strip(),
                    "sub_competency": sub_comp.strip(),
                    "action_cue": None
                })

    if not records:
        raise Exception("❌ No valid rows extracted")

    clean = pd.DataFrame(records)

    clean["tags"] = clean.apply(generate_tags, axis=1)

    clean = clean.dropna(subset=["competency", "sub_competency"])

    clean.to_csv(OUTPUT_FILE, index=False)

    print(f"✅ Extracted {len(clean)} rows!")
    print("✅ Clean CSV generated!")


if __name__ == "__main__":
    transform()