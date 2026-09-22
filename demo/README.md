# NER-DRISHTI Frontend

GIS command center for the NER-DRISHTI landslide early-warning platform.

## Stack

React 18 · Vite · JavaScript · MapLibre GL · React Router

## Configure

```
VITE_API_BASE_URL=http://localhost:8001
```

Copy `.env.example` to `.env` if needed.

## Run

```
npm install
npm run dev
```

Backend (separate repo, do not modify from this frontend):

```
cd backend
python -m uvicorn main:app --reload --port 8001
```

Demo login uses the backend token endpoint. Authority credentials in the current backend demo are `admin` / `password`.

## Notes

- No operational values are hard-coded. Empty, loading, and error states are shown when the API does not return data.
- Simulation and historical replay are labelled as not official warnings.
- Predicted risk is decision support, not a physical guarantee.
