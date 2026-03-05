# Back

Express + TypeScript API for the million-list app. Serves a list of items (PostgreSQL via Prisma) and an in-memory selection (ordered ids for the "selected" panel). Selection is not persisted and is lost on restart.

**Requirements:** Node >= 18, PostgreSQL (or run `npm run db:up` for Docker).

Copy `.env.example` to `.env` and set `PORT`, `DATABASE_URL`, and optionally `CORS_ORIGIN`.

**Run:** `npm install`, then `npm run dev` (or `npm run build` and `npm start`). API runs on the port from `PORT` (default 3013).

**Docs:** OpenAPI UI at `/api-docs`, spec at `/api-docs.json`.

**DB:** `npm run db:up` starts Postgres in Docker. `npm run db:seed` seeds the database (see `scripts/`).
