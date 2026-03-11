import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ============================================================
// Users (auth)
// ============================================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================
// Clients
// ============================================================
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["individual", "company", "public"]).default("individual").notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["prospect", "active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ============================================================
// Projects
// ============================================================
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  clientId: int("clientId").references(() => clients.id),
  type: varchar("type", { length: 100 }),
  description: text("description"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  currentPhase: mysqlEnum("currentPhase", [
    "feasibility", "sketch", "preliminary", "detailed",
    "execution", "site_prep", "construction", "delivery", "archived"
  ]).default("feasibility").notNull(),
  status: mysqlEnum("status", ["active", "on_hold", "completed", "cancelled"]).default("active").notNull(),
  budgetEstimated: float("budgetEstimated").default(0),
  budgetActual: float("budgetActual").default(0),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  progress: int("progress").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ============================================================
// Project Phases
// ============================================================
export const projectPhases = mysqlTable("project_phases", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: mysqlEnum("phase", [
    "feasibility", "sketch", "preliminary", "detailed",
    "execution", "site_prep", "construction", "delivery", "archived"
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "skipped"]).default("pending").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectPhase = typeof projectPhases.$inferSelect;
export type InsertProjectPhase = typeof projectPhases.$inferInsert;

// ============================================================
// Documents
// ============================================================
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["plan", "report", "contract", "permit", "photo", "other"]).default("other").notNull(),
  phase: mysqlEnum("phase", [
    "feasibility", "sketch", "preliminary", "detailed",
    "execution", "site_prep", "construction", "delivery", "archived"
  ]),
  version: int("version").default(1),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ============================================================
// Comments
// ============================================================
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  documentId: int("documentId").references(() => documents.id, { onDelete: "set null" }),
  authorName: varchar("authorName", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// ============================================================
// Admin Procedures
// ============================================================
export const adminProcedures = mysqlTable("admin_procedures", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["pending", "submitted", "approved", "rejected"]).default("pending").notNull(),
  dueDate: timestamp("dueDate"),
  notes: text("notes"),
  checklist: json("checklist").$type<Array<{ id: string; label: string; completed: boolean }>>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminProcedure = typeof adminProcedures.$inferSelect;
export type InsertAdminProcedure = typeof adminProcedures.$inferInsert;

// ============================================================
// Construction Sites
// ============================================================
export const constructionSites = mysqlTable("construction_sites", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  progress: int("progress").default(0),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["planning", "active", "paused", "completed"]).default("planning").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConstructionSite = typeof constructionSites.$inferSelect;
export type InsertConstructionSite = typeof constructionSites.$inferInsert;

// ============================================================
// Site Journal Entries
// ============================================================
export const siteJournalEntries = mysqlTable("site_journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull().references(() => constructionSites.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  weather: varchar("weather", { length: 100 }),
  workDescription: text("workDescription").notNull(),
  workers: int("workers"),
  photos: json("photos").$type<string[]>().default([]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteJournalEntry = typeof siteJournalEntries.$inferSelect;
export type InsertSiteJournalEntry = typeof siteJournalEntries.$inferInsert;

// ============================================================
// Meeting Reports
// ============================================================
export const meetingReports = mysqlTable("meeting_reports", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull().references(() => constructionSites.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  attendees: json("attendees").$type<string[]>().default([]),
  summary: text("summary"),
  decisions: json("decisions").$type<string[]>().default([]),
  nextActions: json("nextActions").$type<string[]>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MeetingReport = typeof meetingReports.$inferSelect;
export type InsertMeetingReport = typeof meetingReports.$inferInsert;

// ============================================================
// Incidents
// ============================================================
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull().references(() => constructionSites.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved"]).default("open").notNull(),
  date: timestamp("date").notNull(),
  resolution: text("resolution"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

// ============================================================
// Team Members
// ============================================================
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  hourlyRate: float("hourlyRate"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// ============================================================
// Tasks
// ============================================================
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  assigneeId: int("assigneeId").references(() => teamMembers.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "review", "done"]).default("todo").notNull(),
  dueDate: timestamp("dueDate"),
  estimatedHours: float("estimatedHours"),
  actualHours: float("actualHours"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ============================================================
// Time Entries
// ============================================================
export const timeEntries = mysqlTable("time_entries", {
  id: int("id").autoincrement().primaryKey(),
  memberId: int("memberId").notNull().references(() => teamMembers.id, { onDelete: "cascade" }),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  taskId: int("taskId").references(() => tasks.id, { onDelete: "set null" }),
  date: timestamp("date").notNull(),
  hours: float("hours").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;

// ============================================================
// Invoices
// ============================================================
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  clientId: int("clientId").notNull().references(() => clients.id),
  number: varchar("number", { length: 50 }).notNull(),
  amount: float("amount").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  description: text("description"),
  dueDate: timestamp("dueDate"),
  items: json("items").$type<Array<{ description: string; quantity: number; unitPrice: number; total: number }>>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ============================================================
// Expenses
// ============================================================
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  amount: float("amount").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;
