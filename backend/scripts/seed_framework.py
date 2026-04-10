import asyncio
import pandas as pd
import uuid
from sqlalchemy.future import select
from database import AsyncSessionLocal
import models

# ✅ Correct path (since you run with -m)
CSV_FILE = "framework_clean.csv"

# ✅ Fix NaN issue
def safe_value(val):
    if pd.isna(val):
        return None
    return str(val)

async def seed():
    df = pd.read_csv(CSV_FILE)
    async with AsyncSessionLocal() as db:

        # ✅ Duplicate check — skip seeding if data already exists
        # This prevents duplicate entries on every redeploy
        result = await db.execute(select(models.MasterCompetency).limit(1))
        if result.scalars().first():
            print("✅ Framework already seeded, skipping.")
            return

        competency_map = {}
        for _, row in df.iterrows():
            comp_name = safe_value(row["competency"])
            category = safe_value(row["cbe_category"])

            # ✅ Create competency (only once per name)
            if comp_name not in competency_map:
                comp = models.MasterCompetency(
                    id=str(uuid.uuid4()),
                    name=comp_name,
                    cbe_category=category,
                    departments=None,
                    is_active=True
                )
                db.add(comp)
                await db.flush()
                competency_map[comp_name] = comp.id

            # ✅ Create sub-competency
            sub = models.SubCompetency(
                id=str(uuid.uuid4()),
                competency_id=competency_map[comp_name],
                statement=safe_value(row["sub_competency"]),
                action_cue=safe_value(row.get("action_cue")),
                display_order=1
            )
            db.add(sub)

        await db.commit()
    print("✅ Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
