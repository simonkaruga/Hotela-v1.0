# Hotela — API Reference

Once `backend/apps/api` has real endpoints, this file should link to the
generated OpenAPI/Swagger docs rather than duplicate them by hand:

- Local: `http://localhost:4000/api-docs` (NestJS Swagger, once wired up in
  `apps/api/src/main.ts`)
- AI service: `http://localhost:8000/docs` (FastAPI's built-in Swagger UI)

`frontend/packages/api-client` generates typed hooks from the NestJS
OpenAPI spec via `npm run generate` — keep that spec as the source of truth
rather than hand-writing client types.
