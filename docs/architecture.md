# Hotela — Architecture

This document tracks what's actually built, as distinct from the full
aspirational architecture in the masterplan (Section 5-7).

## Repo shape

Two-folder root: `frontend/` (Turborepo — Next.js web app, Expo staff app,
Expo guest app, Next.js booking engine, shared packages) and `backend/`
(NestJS `apps/api` covering all module domains, Python FastAPI `apps/ai-service`
for AI/ML, shared packages, infrastructure).

The full module folder tree exists under `backend/apps/api/src/modules/*`
and `frontend/apps/web/app/(dashboard)/*` today as structural placeholders —
matching the masterplan's Section 7 layout so nothing needs to be renamed or
moved later. Most of them are empty (or near-empty) until their phase comes
up in the roadmap (Section 15).

## What's real vs. placeholder right now

- **Real:** directory structure, workspace configs (`package.json`,
  `turbo.json`), Docker Compose for local infra (Postgres, Redis,
  Elasticsearch), the Prisma schema for the Phase 1 core tables (properties,
  room types, rooms, guests, reservations, folios, folio transactions), CI
  workflow skeletons.
- **Placeholder:** everything inside `modules/*` and `app/(dashboard)/*`
  beyond the files explicitly listed above — these are empty files/folders
  waiting for their phase.

## Phase 0/1 build note

The masterplan's own reconciliation (Section 15) recommends starting Phase
0/1 as a monolith rather than exercising the full microservices/Kubernetes
stack in Section 5. In practice that means: build out `backend/apps/api`
directly against Postgres via Prisma, skip the Kong gateway / Elasticsearch
/ InfluxDB / MongoDB pieces until there's a second engineer and a second
paying property. The folder tree already has room for those later — it
doesn't need to be used yet.

See the masterplan (`hotela-masterplan-v1.1.md`, Sections 5, 6, 15) for the
full reasoning and target end-state architecture.

## ADRs

Architecture decisions get recorded in `docs/adr/` as they're made — start
with `0001-record-architecture-decisions.md`.
