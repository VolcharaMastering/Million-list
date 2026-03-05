# Frontend

React + Vite + TypeScript SPA for the million-list app. Two panels: Available (all items except selected, filter by ID, sort, add new items, add to selected) and Selected (filter, sort via API, drag-and-drop reorder). Infinite scroll on both lists. State in Zustand; API client with throttling and batched add-new.

**Requirements:** Node >= 18.

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the backend URL (e.g. `http://localhost:3013`).

**Run:** `npm install`, then `npm run dev`. Build: `npm run build`. Preview production build: `npm run preview`.
