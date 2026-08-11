# Hotela

**The hotel OS, built in Africa for the world.** By Avinaya Solutions.

This repo holds the full folder structure from the Hotela masterplan
(Section 7) — a two-folder root, `frontend/` and `backend/`, each a
workspace of apps and shared packages covering all 27 product modules.
Most of that structure is a **placeholder skeleton** right now, not
working code — see [What's real vs. placeholder](#whats-real-vs-placeholder)
below before assuming anything works.

```
hotela/
├── frontend/                  # Turborepo — Next.js web, Expo staff app,
│                               # Expo guest app, Next.js booking engine
├── backend/                    # NestJS API (all modules) + Python AI service
├── docs/                       # Architecture notes, API reference, ADRs
├── .github/workflows/          # CI for frontend and backend
├── docker-compose.yml          # Local dev: Postgres + Redis + Elasticsearch + apps
└── docker-compose.prod.yml     # Production overrides
```

## What's real vs. placeholder

- **Real:** the directory structure itself, workspace configs
  (`package.json`, `turbo.json`), Docker Compose for local infra, the
  Prisma schema for the Phase 1 core PMS tables (properties, room types,
  rooms, guests, reservations, folios, folio transactions), CI workflow
  skeletons.
- **Placeholder:** everything inside `backend/apps/api/src/modules/*` and
  `frontend/apps/web/app/(dashboard)/*` beyond what's listed above — empty
  files and folders waiting for their phase in the roadmap. See
  [docs/architecture.md](docs/architecture.md) for the full breakdown.

## Build order — follow the roadmap, not the folder count

The masterplan's own Section 15 reconciliation is explicit: build Phase 0/1
as a **monolith** against the Naivasha pilot's real needs — reservations,
front desk, folio, channel manager — not the full microservices/Kubernetes
stack in Section 5, and not all 27 modules at once. The folder tree here
has room reserved for the rest so nothing needs restructuring later; it
doesn't mean all of it should be built now.

Phase order (see the masterplan for full detail):
1. **Phase 0** — foundation: auth, core data models, CI, sandbox environment
2. **Phase 1** — MVP: reservations, front desk/room rack, folio & billing,
   channel manager (Booking.com + Expedia), M-Pesa + card payments, daily
   reporting, guest profiles, role-based access, data migration, cutover
3. **Phase 2** — POS (restaurant/bar/spa), minimal events, channel manager
   expansion, direct booking engine, loyalty, full accounting
4. **Phase 3** — AI layer: revenue manager, concierge, predictive analytics
5. **Phase 4** — enterprise: multi-property, full MICE, HR/payroll,
   procurement, custom report builder, white-label
6. **Phase 5** — global expansion

## Local development

### One command — frontend + backend together

```bash
npm install                              # root deps (concurrently) — one-time
npm install --prefix frontend
npm install --prefix backend
cp frontend/apps/web/.env.local.example frontend/apps/web/.env.local
cp backend/apps/api/.env.example backend/apps/api/.env

npm start
# → brings up Postgres + Redis + Elasticsearch (docker-compose up -d)
# → runs the backend API and the web app together, labeled output
# → web:  http://localhost:3000
# → api:  http://localhost:4000

npm stop                                 # stops the docker-compose infra
```

### Running each piece separately

```bash
# Start Postgres + Redis + Elasticsearch (+ api/ai-service once they build)
docker-compose up -d

# Frontend web app
cd frontend
npm install
cp apps/web/.env.local.example apps/web/.env.local
npm run dev --workspace=@hotela/web
# → http://localhost:3000

# Backend API
cd backend
npm install
cp apps/api/.env.example apps/api/.env
npm run dev
# → http://localhost:4000
# → Swagger: http://localhost:4000/api-docs (once wired up)

# AI service
cd backend/apps/ai-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
# → http://localhost:8000/docs
```

## Deploying

**Backend (`apps/api`, `apps/ai-service`) → Railway or Render**
1. Point the service at `backend/` with the relevant `Dockerfile`
   (`apps/api/Dockerfile` or `apps/ai-service/Dockerfile`).
2. Set environment variables from the corresponding `.env.example`.
3. Add managed PostgreSQL + Redis, paste connection strings into `DATABASE_URL` / `REDIS_URL`.
4. Deploy.

**Frontend (`apps/web`, `apps/booking-engine`) → Vercel**
1. Point separate Vercel projects at `frontend/` with the relevant app as
   the root directory (Vercel monorepo support handles Turborepo natively).
2. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL.
3. Deploy, then add the Vercel URL(s) to `ALLOWED_ORIGINS` on the backend.

## Docs

- [docs/architecture.md](docs/architecture.md) — what's built vs. placeholder, and why
- [docs/api-reference.md](docs/api-reference.md) — where the API docs live once generated
- [docs/adr/](docs/adr/) — architecture decision records
