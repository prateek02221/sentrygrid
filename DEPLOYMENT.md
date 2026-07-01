# Deployment Guide — Render + MongoDB Atlas

This deploys the whole project (frontend + backend) as a **single live service** on Render.
FastAPI serves both the API and the built React app from the same URL — no separate frontend
host, no CORS headaches, one thing to keep running.

You already have MongoDB Atlas set up, so this guide starts from "push to GitHub."

---

## 1. Push the project to GitHub

Make sure your repo has this structure at the root (not double-nested):

```
your-repo/
├── backend/
├── frontend/
├── README.md
└── DEPLOYMENT.md
```

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Double check `backend/.env` and `frontend/.env` (if any) are **not** committed — they're
already covered by `.gitignore`, but it's worth confirming with `git status` before your first
push. `backend/.env.example` and `frontend/.env.development` (no secrets in either) are fine to
commit.

## 2. MongoDB Atlas — allow Render to connect

Render's outbound IPs aren't fixed on the free tier, so in Atlas:

1. Go to **Network Access** → **Add IP Address**
2. Choose **Allow Access from Anywhere** (`0.0.0.0/0`)

This is the standard approach for platforms with dynamic egress IPs (Render, Vercel, etc.) —
your database is still protected by its username/password, this just allows the connection
attempt through.

## 3. Create the Render Web Service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:

| Field | Value |
|---|---|
| **Name** | `mini-soc-platform` (or anything you like) |
| **Region** | closest to you |
| **Branch** | `main` |
| **Root Directory** | leave blank (repo root) |
| **Runtime** | Python 3 |
| **Build Command** | see below |
| **Start Command** | see below |
| **Instance Type** | Free |

**Build Command:**
```bash
cd frontend && npm install && npm run build && cd ../backend && rm -rf app/static && cp -r ../frontend/dist app/static && pip install -r requirements.txt
```

**Start Command:**
```bash
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

This build command does three things in order: builds the React app, copies the build output
into `backend/app/static` (where FastAPI is configured to serve it from), then installs the
Python dependencies.

## 4. Environment variables

In the Render dashboard, under **Environment**, add these (copy values from your local
`backend/.env`):

| Key | Value |
|---|---|
| `APP_NAME` | Mini SOC Platform |
| `APP_VERSION` | 1.0.0 |
| `DEBUG` | false |
| `API_PREFIX` | /api/v1 |
| `MONGODB_URL` | your Atlas connection string |
| `DATABASE_NAME` | your database name |
| `JWT_SECRET_KEY` | a long random string |
| `JWT_REFRESH_SECRET_KEY` | a different long random string |
| `JWT_ALGORITHM` | HS256 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 30 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | 7 |
| `ALLOWED_ORIGINS` | your Render URL once known, e.g. `https://mini-soc-platform.onrender.com` (comma-separate if you need more than one) |
| `AUTO_THREAT_GENERATION_ENABLED` | true |
| `AUTO_THREAT_GENERATION_INTERVAL_HOURS` | 2 |

Note on `ALLOWED_ORIGINS`: since the frontend and API are served from the same Render URL in
this setup, the browser calls are same-origin and CORS doesn't block them even before you set
this correctly. It mainly matters if you ever call the API from a different origin (e.g.
testing locally against the live backend). Deploy once first, grab your Render URL from the
dashboard, then update this variable and let it redeploy.

## 5. Deploy

Click **Create Web Service**. Render will build and deploy — first build takes a few minutes
(npm install + build + pip install). Watch the build logs; if the build command fails, the
error will point at exactly which step (npm, static copy, or pip).

Once live, your app is reachable at `https://<your-service-name>.onrender.com` — that one URL
serves the dashboard, the API (under `/api/v1`), the docs (`/docs`), and the websocket
(`/ws/alerts`).

## 6. Known free-tier behavior

Render's free web services **spin down after ~15 minutes of inactivity** and take 30–50 seconds
to wake up on the next request. This is expected — fine for a portfolio/demo project, just know
the first click after idle will feel slow. Nothing is broken.

Also note: while the service is spun down, the background auto-threat-generation scheduler
isn't running either (nothing is, the whole process is asleep). It resumes ticking once a
request wakes the service back up. For a demo project this is a reasonable trade-off for free
hosting; if you ever need guaranteed-uptime scheduling, that's a paid-tier consideration, not
something to solve for now.

## 7. Redeploying after changes

Render auto-deploys on every push to your connected branch by default. Just `git push`, and
watch the deploy logs in the Render dashboard.
