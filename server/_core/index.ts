import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./auth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function findPort(start = 3000): Promise<number> {
  for (let port = start; port < start + 20; port++) {
    const available = await new Promise<boolean>(resolve => {
      const s = net.createServer();
      s.listen(port, () => s.close(() => resolve(true)));
      s.on("error", () => resolve(false));
    });
    if (available) return port;
  }
  throw new Error("No port available");
}

async function start() {
  const app = express();
  const server = createServer(app);

  // CORS
  const allowed = [
    "https://archimate-desktop.vercel.app",
    "https://archimate-desktop-adx-international.vercel.app",
  ];
  app.use((req, res, next) => {
    const origin = req.headers.origin as string;
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

  registerAuthRoutes(app);

  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = await findPort(parseInt(process.env.PORT ?? "3000"));
  server.listen(port, () => console.log(`[AOS] http://localhost:${port}`));
}

start().catch(err => {
  console.error("[AOS] Fatal error:", err);
  process.exit(1);
});
