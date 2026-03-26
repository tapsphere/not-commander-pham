
import asyncio
import pandas as pd
import uuid

from database import AsyncSessionLocal
import models

CSV_FILE = "framework_clean.csv"


async def seed():
    df = pd.read_csv(CSV_FILE)

    async with AsyncSessionLocal() as db:
        competency_map = {}

        for _, row in df.iterrows():
            comp_name = row["competency"]
            category = row["cbe_category"]

            # create competency
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

            # create sub competency
            sub = models.SubCompetency(
                id=str(uuid.uuid4()),
                competency_id=competency_map[comp_name],
                statement=row["sub_competency"],
                action_cue=row.get("action_cue"),
                tags=row.get("tags").split(",") if pd.notna(row.get("tags")) else [],
                display_order=1
            )

            db.add(sub)

        await db.commit()

    print("✅ Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed())