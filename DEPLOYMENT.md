# 🛡️ Mini SOC Platform

> A mini Security Operations Center — watch threats spawn, escalate, and get triaged in real time.

Simulated threat events flow through a detection engine, escalate into incidents, and get triaged by role-based analysts on a live-updating React dashboard. Think of it as a pocket-sized SOC: the kind of pipeline real security teams run, scaled down to something you can spin up and demo in minutes.

**🔗 Live demo:** [mini-soc-platform.onrender.com](https://mini-soc-platform.onrender.com)

---

## ✨ Features

| | |
|---|---|
| 🔐 **JWT Auth + RBAC** | Access + refresh tokens, with Admin / Security Analyst / Viewer roles enforced end-to-end |
| ⚙️ **Synthetic Threat Engine** | Rule-based detection with severity scoring, IOC matching, and brute-force escalation scoped by source IP + time window |
| 🤖 **Autonomous Threat Generation** | APScheduler runs the detection pipeline on a configurable interval — the dashboard stays alive with activity, no manual triggering needed |
| 📋 **Incident Lifecycle** | Open → Investigating → Resolved, with analyst notes at every stage |
| ⚡ **Real-Time Updates** | WebSocket push means new threats and incidents appear instantly on every connected dashboard |
| 🎯 **IOC Management** | Track and match Indicators of Compromise against incoming threats |
| 📊 **Threat Intelligence Analytics** | Top malicious IPs, threat-type distribution, and rollup summaries at a glance |
| 👥 **User Management** | Create, disable, delete users and change roles — admin-only control panel |

---

## 🧰 Tech Stack

**Backend**
`FastAPI` · `Motor` (async MongoDB driver) · `Pydantic` · `JWT` · `APScheduler`

**Frontend**
`React` + `TypeScript` · `Vite` · `Tailwind CSS` · `Chart.js`

**Database**
`MongoDB Atlas`

---

## 📁 Project Structure

```
.
├── backend/              FastAPI app
│   ├── app/
│   ├── requirements.txt
│   └── .env.example
├── frontend/             React + Vite app
│   ├── src/
│   └── package.json
└── DEPLOYMENT.md         Step-by-step deploy guide (Render + MongoDB Atlas)
```

---

## 🚀 Running Locally

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # fill in your MongoDB Atlas URL and JWT secrets
uvicorn app.main:app --reload
```

The API comes alive at `http://127.0.0.1:8000` — interactive Swagger docs live at `http://127.0.0.1:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard runs at `http://127.0.0.1:5173`, talking to the backend via `VITE_API_URL` (already wired up in `.env.development` for local dev).

---

## ☁️ Deploying

This project is built to ship as a **single service** — the FastAPI backend serves the built React frontend directly, so there's nothing extra to host or coordinate.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full walkthrough: Render + MongoDB Atlas, start to finish.

---

## 🔄 Auto Threat Generation

No need to babysit the demo — the pipeline keeps itself busy. Controlled via backend env vars:

```env
AUTO_THREAT_GENERATION_ENABLED=true
AUTO_THREAT_GENERATION_INTERVAL_HOURS=2
```

On every interval, the same detection pipeline behind the manual "Generate Threat" button fires automatically in the background — so the dashboard shows genuine, ongoing activity even when nobody's at the keyboard.

---

<p align="center">
  Built as a hands-on dive into async APIs, real-time systems, and role-based security architecture.
</p>
