import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./auth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { setupVite, serveStatic } from "./vite";
import http from "http";

const app = express();

// CORS — doit être AVANT tout middleware
const ALLOWED_ORIGINS = [
  "https://archimate-desktop.vercel.app",
  "https://archimate-desktop-adx-international.vercel.app",
  "https://archimate-desktop-git-main-adx-international.vercel.app",
];

app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined;
  // En dev on accepte tout, en prod on filtre
  const allowOrigin = process.env.NODE_ENV !== "production"
    ? (origin ?? "*")
    : (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);

  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept,Origin,X-Requested-With");
  res.setHeader("Access-Control-Expose-Headers", "Content-Length,Content-Range");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Health check
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

registerAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const PORT = parseInt(process.env.PORT ?? "3000", 10);

if (process.env.NODE_ENV === "development") {
  const server = http.createServer(app);
  setupVite(app, server).then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`[AOS] Dev server on http://localhost:${PORT}`);
    });
  });
} else {
  serveStatic(app);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AOS] Production server on 0.0.0.0:${PORT}`);
  });
}
