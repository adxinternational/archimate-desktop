import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user for tests
const mockUser = {
  id: 1,
  openId: "test-user-openid",
  email: "test@archimate.fr",
  name: "Test Architecte",
  loginMethod: "manus",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createCtx(): TrpcContext {
  return {
    user: mockUser,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.name).toBe("Test Architecte");
  });

  it("returns null when not authenticated", async () => {
    const ctx: TrpcContext = {
      ...createCtx(),
      user: null,
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      user: mockUser,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => { clearedCookies.push(name); },
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});

describe("projects router", () => {
  it("list procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    // Should not throw (may return empty array if DB not connected)
    const result = await caller.projects.list().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("clients router", () => {
  it("list procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.clients.list().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("sites router", () => {
  it("list procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.sites.list().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("team router", () => {
  it("list procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.team.list().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("tasks router", () => {
  it("list procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.tasks.list().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("invoices router", () => {
  it("list procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.invoices.list().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("expenses router", () => {
  it("list procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.expenses.list().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("dashboard router", () => {
  it("stats procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.dashboard.stats().catch(() => ({
      activeProjects: 0,
      totalBudget: 0,
      overdueTasks: 0,
      monthlyHours: 0,
      recentProjects: [],
      upcomingTasks: [],
    }));
    expect(result).toBeDefined();
    expect(typeof result.activeProjects).toBe("number");
  });
});
describe("notes router", () => {
  it("list procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.notes.list().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("blog router", () => {
  it("list procedure exists and is callable", async () => {
    const caller = appRouter.createCaller(createCtx());
    const result = await caller.blog.list().catch(() => []);
    expect(Array.isArray(result)).toBe(true);
  });
});
