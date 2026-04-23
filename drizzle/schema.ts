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
  id: int("id").autoincrement(),
  openId: varchar("openId", { length: 255 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 255 }),
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
  id: int("id").autoincrement(),
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
  id: int("id").autoincrement(),
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
  id: int("id").autoincrement(),
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
  id: int("id").autoincrement(),
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
  id: int("id").autoincrement(),
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
  id: int("id").autoincrement(),
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
  id: int("id").autoincrement(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: mysqlEnum("phase", PHASES).notNull(),
  items: json("items").$type<Array<{
    id: string;
    label: string;
    completed: boolean;
    dueDate?: string;
    assignee?: string;
  }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PhaseChecklist = typeof phaseChecklists.$inferSelect;
export type InsertPhaseChecklist = typeof phaseChecklists.$inferInsert;

// ============================================================
// Project Deliverables
// ============================================================
export const projectDeliverables = mysqlTable("project_deliverables", {
  id: int("id").autoincrement(),
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
  id: int("id").autoincrement(),
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
// Administrative Procedures (Permis de Construire, DP, AT…)
// ============================================================
export const adminProcedures = mysqlTable("admin_procedures", {
  id: int("id").autoincrement(),
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
  checklist: json("checklist").$type<Array<{
    id: string;
    label: string;
    completed: boolean;
  }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminProcedure = typeof adminProcedures.$inferSelect;
export type InsertAdminProcedure = typeof adminProcedures.$inferInsert;

// ============================================================
// Cost Estimates (Économie de la Construction)
// ============================================================
export const costEstimates = mysqlTable("cost_estimates", {
  id: int("id").autoincrement(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  phase: mysqlEnum("phase", PHASES).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  description: text("description"),
  estimatedAmount: decimal("estimatedAmount", { precision: 15, scale: 2 }).default("0"),
  actualAmount: decimal("actualAmount", { precision: 15, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["draft", "approved", "rejected"]).default("draft").notNull(),
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
  id: int("id").autoincrement(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
  status: mysqlEnum("status", ["active", "completed", "suspended"]).default("active").notNull(),
  progress: int("progress").default(0),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConstructionSite = typeof constructionSites.$inferSelect;
export type InsertConstructionSite = typeof constructionSites.$inferInsert;

// ============================================================
// Site Journal (Journal de Chantier)
// ============================================================
export const siteJournalEntries = mysqlTable("site_journal_entries", {
  id: int("id").autoincrement(),
  siteId: int("siteId").notNull().references(() => constructionSites.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  weather: varchar("weather", { length: 100 }),
  temperature: float("temperature"),
  content: text("content"),
  workDescription: text("workDescription"),
  workers: int("workers"),
  notes: text("notes"),
  author: varchar("author", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteJournalEntry = typeof siteJournalEntries.$inferSelect;
export type InsertSiteJournalEntry = typeof siteJournalEntries.$inferInsert;

// ============================================================
// Meeting Reports (Comptes-rendus de réunion)
// ============================================================
export const meetingReports = mysqlTable("meeting_reports", {
  id: int("id").autoincrement(),
  siteId: int("siteId").references(() => constructionSites.id, { onDelete: "cascade" }),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  location: varchar("location", { length: 255 }),
  content: text("content"),
  summary: text("summary"),
  decisions: json("decisions").$type<string[]>(),
  nextActions: json("nextActions").$type<{ action: string; responsible: string; dueDate?: string }[]>(),
  attendees: json("attendees").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MeetingReport = typeof meetingReports.$inferSelect;
export type InsertMeetingReport = typeof meetingReports.$inferInsert;

// ============================================================
// Incidents (Réserves, Problèmes)
// ============================================================
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement(),
  siteId: int("siteId").notNull().references(() => constructionSites.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow(),
  resolution: text("resolution"),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  dueDate: timestamp("dueDate"),
  resolvedDate: timestamp("resolvedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

// ============================================================
// Enterprises (Entreprises de BTP)
// ============================================================
export const enterprises = mysqlTable("enterprises", {
  id: int("id").autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  trade: varchar("trade", { length: 100 }), // Corps d'état
  contactName: varchar("contactName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  rating: float("rating"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Enterprise = typeof enterprises.$inferSelect;
export type InsertEnterprise = typeof enterprises.$inferInsert;

// ============================================================
// Site Enterprises (Lien Chantier-Entreprise)
// ============================================================
export const siteEnterprises = mysqlTable("site_enterprises", {
  id: int("id").autoincrement(),
  siteId: int("siteId").notNull().references(() => constructionSites.id, { onDelete: "cascade" }),
  enterpriseId: int("enterpriseId").notNull().references(() => enterprises.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================
// Team Members (Collaborateurs)
// ============================================================
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  hourlyRate: float("hourlyRate"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// ============================================================
// Tasks (Tâches internes)
// ============================================================
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement(),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["todo", "in_progress", "review", "done"]).default("todo").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  dueDate: timestamp("dueDate"),
  assigneeId: int("assigneeId").references(() => teamMembers.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ============================================================
// Time Entries (Suivi du temps)
// ============================================================
export const timeEntries = mysqlTable("time_entries", {
  id: int("id").autoincrement(),
  memberId: int("memberId").notNull().references(() => teamMembers.id, { onDelete: "cascade" }),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  taskId: int("taskId").references(() => tasks.id, { onDelete: "set null" }),
  date: timestamp("date").notNull(),
  duration: float("duration").notNull(), // en heures
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;

// ============================================================
// Invoices (Facturation)
// ============================================================
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement(),
  number: varchar("number", { length: 50 }).notNull().unique(),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  clientId: int("clientId").notNull().references(() => clients.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 15, scale: 2 }).default("0"),
  total: decimal("total", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  issueDate: timestamp("issueDate").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ============================================================
// Expenses (Dépenses agence/projet)
// ============================================================
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement(),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  category: varchar("category", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  vendor: varchar("vendor", { length: 255 }),
  status: mysqlEnum("status", ["pending", "approved", "reimbursed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// ============================================================
// Gantt Tasks (Planning)
// ============================================================
export const ganttTasks = mysqlTable("gantt_tasks", {
  id: int("id").autoincrement(),
  projectId: int("projectId").notNull().references(() => projects.id, { onDelete: "cascade" }),
  siteId: int("siteId").references(() => constructionSites.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  progress: int("progress").default(0),
  dependencies: json("dependencies").$type<number[]>(),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GanttTask = typeof ganttTasks.$inferSelect;
export type InsertGanttTask = typeof ganttTasks.$inferInsert;

// ============================================================
// Alerts (Notifications intelligentes)
// ============================================================
export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement(),
  type: mysqlEnum("type", ["deadline", "budget", "incident", "task", "crm", "other"]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).default("info").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("isRead").default(false),
  isResolved: boolean("isResolved").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;
// ============================================================
// Notes (Bloc-notes personnel/partagé)
// ============================================================
export const notes = mysqlTable("notes", {
  id: int("id").autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  category: varchar("category", { length: 50 }).default("general"),
  isFavorite: boolean("isFavorite").default(false),
  projectId: int("projectId").references(() => projects.id, { onDelete: "set null" }),
  clientId: int("clientId").references(() => clients.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Note = typeof notes.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;

// ============================================================
// Blog / Actualités
// ============================================================
export const posts = mysqlTable("posts", {
  id: int("id").autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  excerpt: text("excerpt"),
  coverImage: text("coverImage"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  authorId: int("authorId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
