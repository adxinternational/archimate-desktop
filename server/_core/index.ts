import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./auth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";

const app = express();
const server = createServer(app);

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin as string;
  const allowed = [
    "https://archimate-desktop.vercel.app",
    "https://archimate-desktop-adx-international.vercel.app",
  ];
  if (!origin || allowed.includes(origin) || process.env.NODE_ENV !== "production") {
    res.setHeader("Access-Control-Allow-Origin", origin ?? "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

registerAuthRoutes(app);

app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

serveStatic(app);

// PORT CRITIQUE : Railway impose $PORT
// Sur Vercel, server.listen n'est pas utilisé, mais le fichier est importé.
if (process.env.NODE_ENV !== "production" || process.env.RAILWAY_STATIC_URL) {
  const PORT = parseInt(process.env.PORT ?? "3000", 10);
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[AOS] Server running on 0.0.0.0:${PORT}`);
  });
}

export default app;
