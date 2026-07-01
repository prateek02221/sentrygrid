# Mini SOC Platform

A mini Security Operations Center (SOC) dashboard: simulated threat events flow through a
detection engine, escalate into incidents, and are triaged by role-based users (Admin /
Security Analyst / Viewer) in a live-updating React dashboard.

## Features

- JWT auth with access + refresh tokens, role-based access control (RBAC)
- Synthetic threat event generator with rule-based detection (severity scoring, IOC matching,
  brute-force escalation scoped by source IP + time window)
- **Automatic background threat generation** on a configurable interval (APScheduler), so the
  dashboard has live activity without manual triggering
- Incident lifecycle: open → investigating → resolved, with analyst notes
- Real-time updates over WebSocket (new threats/incidents push straight to connected dashboards)
- IOC (Indicator of Compromise) management and matching
- Threat intelligence analytics (top malicious IPs, threat-type distribution, summaries)
- User management (create/disable/delete users, change roles) — admin only

## Tech stack

- **Backend:** FastAPI, Motor (async MongoDB driver), Pydantic, JWT auth, APScheduler
- **Frontend:** React + TypeScript, Vite, Tailwind CSS, Chart.js
- **Database:** MongoDB (Atlas)

## Project structure

```
.
├── backend/          FastAPI app
│   ├── app/
│   ├── requirements.txt
│   └── .env.example
├── frontend/          React + Vite app
│   ├── src/
│   └── package.json
└── DEPLOYMENT.md      Step-by-step deploy guide (Render + MongoDB Atlas)
```

## Running locally

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # then fill in your MongoDB Atlas URL and JWT secrets
uvicorn app.main:app --reload
```

Backend runs at `http://127.0.0.1:8000`. Interactive API docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://127.0.0.1:5173` and talks to the backend via `VITE_API_URL`
(already set in `.env.development` for local dev).

## Deploying

See [DEPLOYMENT.md](./DEPLOYMENT.md) for a full walkthrough of deploying this as a single
live service on Render, backed by MongoDB Atlas — no separate frontend host needed.

## Auto threat generation

Controlled via backend env vars:

```
AUTO_THREAT_GENERATION_ENABLED=true
AUTO_THREAT_GENERATION_INTERVAL_HOURS=2
```

Every interval, the same detection pipeline used by the manual "Generate Threat" endpoint runs
automatically in the background, so the dashboard shows ongoing activity even with no one
actively clicking around.
