import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerAuthRoutes } from "./auth";
import { registerChatRoutes } from "./chat";
import { appRouter } from "../routers";
import { createContext } from "./context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

registerAuthRoutes(app);
registerChatRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext })
);

// Dev uniquement : vite + static servi localement
if (process.env.NODE_ENV !== "production") {
  import("./vite").then(({ setupVite }) => {
    import("http").then(({ createServer }) => {
      const server = createServer(app);
      setupVite(app, server).then(() => {
        const port = parseInt(process.env.PORT || "3000");
        server.listen(port, () => {
          console.log(`[AOS] Server running on http://localhost:${port}/`);
        });
      });
    });
  });
}

export default app;
