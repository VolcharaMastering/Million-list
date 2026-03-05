# Million-list

Test project: two-panel UI to browse available items and manage a selected list (filter, sort, add, reorder). Task description: [Тестовое задание fullstack](https://docs.google.com/document/d/1dL1BdhXxIsn61JzgU81K7vIy9FeTFzDXDSJ9qwcaw4w/edit?pli=1&tab=t.0).

**Stack:** Backend (Express + TypeScript, PostgreSQL/Prisma, in-memory selection). Frontend (React + Vite + TypeScript, Zustand, @dnd-kit for reorder).

**How it works:** Backend exposes REST API for items list (paginated, filter by ID, sort), selected list (order stored in memory, lost on restart), and add-new items. Frontend has Available panel (filter, sort, add new, select items, add to selected) and Selected panel (filter, sort via API, drag-and-drop reorder). Both lists use infinite scroll.

## How to start

**Requirements:** Node >= 18. Backend needs PostgreSQL (or Docker).

1. **Backend**

   ```bash
   cd back
   cp .env.example .env
   # Set PORT, DATABASE_URL, CORS_ORIGIN (e.g. http://localhost:5173)
   npm install
   npm run db:up      # optional: Postgres via Docker
   npm run db:seed    # optional: seed data
   npm run dev
   ```

   API runs on `PORT` (default 3013). OpenAPI UI: `http://localhost:3013/api-docs`.

2. **Frontend**

   ```bash
   cd front/frontend
   cp .env.example .env
   # Set VITE_API_BASE_URL (e.g. http://localhost:3013)
   npm install
   npm run dev
   ```

   App runs on the Vite dev port (e.g. 5173). Point the browser there.

Start backend first, then frontend. Ensure `CORS_ORIGIN` in back matches the frontend origin and `VITE_API_BASE_URL` in frontend points to the backend URL.

## Project layout

- `back/` – Express API, Prisma, OpenAPI. See `back/README.md`.
- `front/frontend/` – React SPA. See `front/frontend/README.md`.
