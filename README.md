
# IAL Recruitment OS - Operations Manual

## 🚀 Quick-Start: Environment Variables
Copy and paste these into your Railway "Variables" tab or a local `.env` file.

### For Railway.app
| Variable | Value (Example) | Description |
| :--- | :--- | :--- |
| `IAL_API_KEY` | `IAL_PROD_ACCESS_2026` | Used for GPT Actions Auth |
| `ALLOWED_ORIGINS` | `https://your-app.netlify.app` | CORS allowlist for frontend |
| `DATABASE_URL` | *Managed* | Automatically linked by Railway |
| `REDIS_URL` | *Managed* | Automatically linked by Railway |

---

## 1. Deployment Platforms

### Option A: Railway.app (Recommended for Production)
Railway handles the multi-service architecture (FastAPI + Postgres + Redis) most effectively.
1. Connect your GitHub repository to **Railway.app**.
2. Railway will automatically detect the `railway.json` and build via `infra/Dockerfile.api`.
3. Add a **PostgreSQL** and **Redis** service via the Railway dashboard.
4. Add the variables listed in the table above.

### Option B: Replit.com (Recommended for Prototyping)
1. Import this repository into a new **Replit**.
2. Use Replit "Secrets" (the Padlock icon) to store `IAL_API_KEY`.
3. Replit will run the frontend by default. For the API, use the `intake-api` folder.

## 2. API Endpoints
- `GET /health`: System status.
- `GET /franchises`: List of draftable franchises.
- `POST /applications/player`: Secure draft induction.
- `POST /applications/coach`: Secure coaching application.

## 3. Security Notes
- **Age Gate**: All registration data is validated for age (18+).
- **Unique Ranks**: Preference uniqueness (1-5) is enforced at the database layer.
- **Auth**: GPT Actions must include `X-API-Key` matching your `IAL_API_KEY`.
