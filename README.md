
# IAL Recruitment OS - Operations Manual

## 1. Deployment Platforms

### Option A: Railway.app (Recommended for Production)
Railway handles the multi-service architecture (FastAPI + Postgres + Redis) most effectively.
1. Connect your GitHub repository to **Railway.app**.
2. Railway will automatically detect the `railway.json` and build via `infra/Dockerfile.api`.
3. Add a **PostgreSQL** and **Redis** service via the Railway dashboard.
4. Set the following Environment Variables:
   - `IAL_API_KEY`: Your secret handshake (e.g., `IAL_ADMIN_2026`).
   - `ALLOWED_ORIGINS`: Your Netlify/Frontend URL.
   - `DATABASE_URL`: Automatically provided by Railway Postgres.

### Option B: Replit.com (Recommended for Prototyping)
1. Import this repository into a new **Replit**.
2. Replit will detect the `index.html` for the frontend.
3. For the backend, create a new "Python" Repl and copy the `intake-api` folder.
4. Use Replit "Secrets" to store your `IAL_API_KEY`.

## 2. API Endpoints
- `GET /health`: System status.
- `GET /franchises`: List of draftable franchises.
- `POST /applications/player`: Secure draft induction.
- `POST /applications/coach`: Secure coaching application.

## 3. Security Notes
- All registration data is validated for age (18+) and preference uniqueness.
- GPT Actions must include `X-API-Key` in the request header to be authorized.
- CSRF and CORS protections are enabled by default on the `/applications` endpoints.
