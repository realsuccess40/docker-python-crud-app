# Record Atlas

A small FastAPI app for exploring a curated collection of remarkable world records. Browse the collection, search by title or record holder, filter by category, or pick a random record. The responsive UI is served by the same API container.

The sample records are locally bundled snapshots, not a live Guinness World Records feed. Record titles and facts are presented in original wording and may change over time; check the official Guinness World Records site for current listings.

## Run locally

Requires Python 3.10+.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Open [http://localhost:8000](http://localhost:8000). Interactive API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

## Run with Docker

Build and start the container:

```powershell
docker build -t record-atlas .
docker run --rm -p 8000:8000 record-atlas
```

Then open [http://localhost:8000](http://localhost:8000).

## API

- `GET /api/records` — list records; optional `q`, `category`, and `limit` query parameters
- `GET /api/records/random` — return a random record
- `GET /api/categories` — list available categories
