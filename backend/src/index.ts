import "dotenv/config";
import http from "node:http";
import { URL } from "node:url";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { WebSocketServer } from "ws";
import { connectMongo } from "./db/connect.js";
import { getOrCreateRoom, roomCount } from "./raceRoom.js";

const PORT = Number(process.env.PORT) || 4000;
/** `0.0.0.0` = LAN / network se bhi suno (default). Sirf localhost chahiye ho to `HOST=127.0.0.1` */
const HOST = process.env.HOST ?? "0.0.0.0";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  res.json({
    ok: true,
    service: "type-arena-backend",
    mongo: mongoOk,
    activeRooms: roomCount(),
  });
});

app.get("/api/health", (_req, res) => {
  const mongoOk = mongoose.connection.readyState === 1;
  res.json({ ok: true, service: "type-arena-backend", mongo: mongoOk, activeRooms: roomCount() });
});

const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const host = request.headers.host ?? `localhost:${PORT}`;
  const pathname = new URL(request.url ?? "/", `http://${host}`).pathname;
  const match = /^\/api\/race-room\/([^/]+)$/.exec(pathname);
  if (!match) {
    socket.destroy();
    return;
  }

  const roomId = decodeURIComponent(match[1]!);
  if (!/^[a-zA-Z0-9_-]{4,32}$/.test(roomId)) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    const room = getOrCreateRoom(roomId);
    room.handleConnection(ws);
  });
});

async function main() {
  await connectMongo(process.env.MONGODB_URI);

  server.listen(PORT, HOST, () => {
    console.log(`[express] http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT} (bind ${HOST})`);
    console.log(`[ws]      ws://localhost:${PORT}/api/race-room/:roomId`);
    if (HOST === "0.0.0.0") {
      console.log("[hint] LAN par dusri device se: PC ka IP same port — ya sirf frontend `npm run dev:lan` use karo");
    }
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
