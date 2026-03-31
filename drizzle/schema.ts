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
  decimal,
} from "drizzle-orm/mysql-core";

// ============================================================
// PHASES ARCHITECTURALES — nomenclature française officielle
// ============================================================
export const PHASES = ["esq", "aps", "apd", "pro", "dce", "exe", "det", "aor"] as const;
export type Phase = typeof PHASES[number];

export const PHASE_LABELS: Record<Phase, string> = {
  esq: "ESQ — Esquisse",
  aps: "APS — Avant-Projet Sommaire",
  apd: "APD — Avant-Projet Définitif",
  pro: "PRO — Projet",
  dce: "DCE — Dossier de Consultation des Entreprises",
  exe: "EXE — Études d'Exécution",
  det: "DET — Direction de l'Exécution des Travaux",
  aor: "AOR — Assistance aux Opérations de Réception",
};

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
// Organizations (Cabinets d'Architecture)
// ============================================================
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  industry: varchar("industry", { length: 100 }),
  logo: text("logo"),
  plan: mysqlEnum("plan", ["basic", "pro", "enterprise"]).default("basic").notNull(),
  status: mysqlEnum("status", ["active", "suspended", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

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
// CRM — Leads & Prospects
// ============================================================
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  source: mysqlEnum("source", ["website", "referral", "cold_call", "email", "event", "other"]).default("other").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).default("new").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).default("0"),
  expectedCloseDate: timestamp("expectedCloseDate"),
  notes: text("notes"),
  // Conversion : quand won, ce champ pointe vers le client créé
  convertedClientId: int("convertedClientId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ============================================================
// CRM — Historique des échanges
// ============================================================
export const exchangeHistory = mysqlTable("exchange_history", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").references(() => clients.id, { onDelete: "set null" }),
  leadId: int("leadId").references(() => leads.id, { onDelete: "set null" }),
  type: mysqlEnum("type", ["email", "call", "meeting", "note", "document", "proposal"]).notNull(),
  date: timestamp("date").notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExchangeHistory = typeof exchangeHistory.$inferSelect;
export type InsertExchangeHistory = typeof exchangeHistory.$inferInsert;

// ============================================================
// Projects
// ============================================================
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  clientId: int("clientId").references(() => clients.id),
  leadId: int("leadId").references(() => leads.id, { onDelete: "set null" }),
  type: varchar("type", { length: 100 }),
  description: text("description"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  surface: float("surface"),               // m²
  currentPhase: mysqlEnum("currentPhase", PHASES).default("esq").notNull(),
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
// Project Phases (suivi par phase)
// ============================================================
export const projectPhases = mysqlTable("project_phases", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: mysqlEnum("phase", PHASES).notNull(),
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
// Phase Checklists (livrables par phase)
// ============================================================
export const phaseChecklists = mysqlTable("phase_checklists", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: mysqlEnum("phase", PHASES).notNull(),
  items: json("items").$type<Array<{
    id: string;
    label: string;
    completed: boolean;
    dueDate?: string;
    assignee?: string;
  }>>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PhaseChecklist = typeof phaseChecklists.$inferSelect;
export type InsertPhaseChecklist = typeof phaseChecklists.$inferInsert;

// ============================================================
// Project Deliverables
// ============================================================
export const projectDeliverables = mysqlTable("project_deliverables", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: mysqlEnum("phase", PHASES).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "approved", "rejected"]).default("pending").notNull(),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectDeliverable = typeof projectDeliverables.$inferSelect;
export type InsertProjectDeliverable = typeof projectDeliverables.$inferInsert;

// ============================================================
// Documents (plans, rapports, contrats, photos…)
// ============================================================
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["plan", "report", "contract", "permit", "photo", "cctp", "dpgf", "bim", "other"]).default("other").notNull(),
  phase: mysqlEnum("phase", PHASES),
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
// Administrative Procedures (Permis de Construire, DP, AT…)
// ============================================================
export const adminProcedures = mysqlTable("admin_procedures", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["PC", "DP", "AT", "CU", "ERP", "autre"]).default("PC").notNull(),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "expired"]).default("draft").notNull(),
  submissionDate: timestamp("submissionDate"),
  approvalDate: timestamp("approvalDate"),
  expiryDate: timestamp("expiryDate"),
  dueDate: timestamp("dueDate"),
  notes: text("notes"),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  checklist: json("checklist").$type<Array<{ id: string; label: string; completed: boolean }>>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminProcedure = typeof adminProcedures.$inferSelect;
export type InsertAdminProcedure = typeof adminProcedures.$inferInsert;

// ============================================================
// Cost Estimates (Économie de la Construction)
// ============================================================
export const costEstimates = mysqlTable("cost_estimates", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: mysqlEnum("phase", PHASES).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  estimatedAmount: decimal("estimatedAmount", { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal("actualAmount", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["draft", "approved", "in_progress", "completed"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CostEstimate = typeof costEstimates.$inferSelect;
export type InsertCostEstimate = typeof costEstimates.$inferInsert;

// ============================================================
// Construction Sites (Chantiers)
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
// Meeting Reports (Comptes-rendus de chantier)
// ============================================================
export const meetingReports = mysqlTable("meeting_reports", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull().references(() => constructionSites.id, { onDelete: "cascade" }),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  date: timestamp("date").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  attendees: json("attendees").$type<string[]>().default([]),
  summary: text("summary"),
  decisions: json("decisions").$type<string[]>().default([]),
  nextActions: json("nextActions").$type<Array<{ action: string; responsible: string; dueDate?: string }>>().default([]),
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
// Gantt Tasks (Planning)
// ============================================================
export const ganttTasks = mysqlTable("gantt_tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  siteId: int("siteId").references(() => constructionSites.id, { onDelete: "set null" }),
  phase: mysqlEnum("phase", PHASES),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  duration: int("duration"),
  progress: int("progress").default(0),
  assignedTo: int("assignedTo"),
  dependencies: json("dependencies").$type<number[]>().default([]),
  status: mysqlEnum("status", ["todo", "in_progress", "done", "blocked"]).default("todo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GanttTask = typeof ganttTasks.$inferSelect;
export type InsertGanttTask = typeof ganttTasks.$inferInsert;

// ============================================================
// Enterprises / Sous-traitants
// ============================================================
export const enterprises = mysqlTable("enterprises", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  siret: varchar("siret", { length: 20 }),
  trade: varchar("trade", { length: 100 }).notNull(),   // Corps de métier
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  contactName: varchar("contactName", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive", "blacklisted"]).default("active").notNull(),
  rating: int("rating"),   // 1-5
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Enterprise = typeof enterprises.$inferSelect;
export type InsertEnterprise = typeof enterprises.$inferInsert;

// ============================================================
// Site Enterprises (affectation chantier ↔ entreprise)
// ============================================================
export const siteEnterprises = mysqlTable("site_enterprises", {
  id: int("id").autoincrement().primaryKey(),
  siteId: int("siteId").notNull().references(() => constructionSites.id, { onDelete: "cascade" }),
  enterpriseId: int("enterpriseId").notNull().references(() => enterprises.id, { onDelete: "cascade" }),
  lot: varchar("lot", { length: 100 }),           // Ex: "Lot 1 — Gros œuvre"
  contractAmount: decimal("contractAmount", { precision: 12, scale: 2 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["planned", "active", "completed", "terminated"]).default("planned").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteEnterprise = typeof siteEnterprises.$inferSelect;
export type InsertSiteEnterprise = typeof siteEnterprises.$inferInsert;

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
  phase: mysqlEnum("phase", PHASES),
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
// Time Entries (Suivi du temps)
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
// Invoices (Factures honoraires)
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
  paidDate: timestamp("paidDate"),
  items: json("items").$type<Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>>().default([]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ============================================================
// Expenses (Dépenses)
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

// ============================================================
// Alerts & Notifications intelligentes
// ============================================================
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", [
    "budget_overrun",
    "schedule_delay",
    "permit_expiry",
    "deliverable_pending",
    "team_alert",
    "phase_transition",
  ]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// ============================================================
// AI Generated Content (documents générés par IA)
// ============================================================
export const aiGeneratedContent = mysqlTable("ai_generated_content", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["report", "cctp", "dpgf", "meeting_notes", "cost_estimate", "recommendation"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  prompt: text("prompt"),
  status: mysqlEnum("status", ["draft", "approved", "published"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIGeneratedContent = typeof aiGeneratedContent.$inferSelect;
export type InsertAIGeneratedContent = typeof aiGeneratedContent.$inferInsert;
