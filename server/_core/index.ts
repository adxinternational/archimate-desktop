import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./auth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";

const app = express();

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin as string;

  const allowed = [
    "https://archimate-desktop.vercel.app",
    "https://archimate-desktop-adx-international.vercel.app",
  ];

  if (!origin || allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin ?? "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

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

serveStatic(app);

export default app;
