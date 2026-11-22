from pathlib import Path
import random

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse

from records import RECORDS


BASE_DIR = Path(__file__).resolve().parent
app = FastAPI(title="Record Atlas", description="Explore remarkable world records.")


@app.get("/", include_in_schema=False)
def home() -> FileResponse:
    return FileResponse(BASE_DIR / "index.html")


@app.get("/styles.css", include_in_schema=False)
def styles() -> FileResponse:
    return FileResponse(BASE_DIR / "styles.css", media_type="text/css")


@app.get("/app.js", include_in_schema=False)
def javascript() -> FileResponse:
    return FileResponse(BASE_DIR / "app.js", media_type="text/javascript")


@app.get("/api/categories", response_model=list[str])
def categories() -> list[str]:
    return sorted({record["category"] for record in RECORDS})


@app.get("/api/records")
def search_records(
    q: str = Query(default="", max_length=100),
    category: str = Query(default="", max_length=60),
    limit: int = Query(default=100, ge=1, le=100),
) -> list[dict[str, str]]:
    search_term = q.strip().casefold()
    selected_category = category.strip().casefold()
    results = [
        record
        for record in RECORDS
        if (not selected_category or record["category"].casefold() == selected_category)
        and (
            not search_term
            or search_term
            in " ".join(
                record[field]
                for field in ("title", "holder", "category", "achievement", "year", "location")
            ).casefold()
        )
    ]
    return results[:limit]


@app.get("/api/records/random")
def random_record() -> dict[str, str]:
    if not RECORDS:
        raise HTTPException(status_code=404, detail="No records are available.")
    return random.choice(RECORDS)
