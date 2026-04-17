# Type Arena — Express backend

Live 1v1 typing races over **WebSockets**, same protocol as the Cloudflare Durable Object in `src/race-room-do.ts`. Finished races can be stored in **MongoDB**.

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI (local or Atlas)
```

Start MongoDB locally (Docker example):

```bash
docker run -d -p 27017:27017 --name type-arena-mongo mongo:7
```

## Run

```bash
npm run dev
```

- HTTP: `http://localhost:4000`
- Health: `GET /health`
- WebSocket: `ws://localhost:4000/api/race-room/<roomId>`

## Frontend dev

From the repo root, run this backend on port **4000**, then start Vite (`npm run dev`). The root `vite.config.ts` proxies `/api/race-room` to this server so the app keeps using relative URLs.

If you deploy the API on another host, set in the frontend `.env`:

```env
VITE_RACE_WS_URL=ws://YOUR_HOST:4000/api/race-room
```

## Production build

```bash
npm run build
npm start
```
