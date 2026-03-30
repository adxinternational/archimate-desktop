import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
} from "drizzle-orm/mysql-core";

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
// Subscriptions & Billing
// ============================================================
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  plan: mysqlEnum("plan", ["basic", "pro", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["active", "past_due", "cancelled", "expired"]).default("active").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ============================================================
// Billing Invoices
// ============================================================
export const billingInvoices = mysqlTable("billing_invoices", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).default("draft").notNull(),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BillingInvoice = typeof billingInvoices.$inferSelect;
export type InsertBillingInvoice = typeof billingInvoices.$inferInsert;

// ============================================================
// CRM - Leads & Prospects
// ============================================================
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  source: mysqlEnum("source", ["website", "referral", "cold_call", "email", "event", "other"]).default("other").notNull(),
  status: mysqlEnum("status", ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).default("new").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).default("0"),
  expectedCloseDate: timestamp("expectedCloseDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ============================================================
// CRM - Sales Pipeline
// ============================================================
export const salesPipeline = mysqlTable("sales_pipeline", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  leadId: int("leadId").notNull(),
  stage: mysqlEnum("stage", ["prospect", "lead", "qualified", "proposal", "negotiation", "won", "lost"]).default("prospect").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).default("0"),
  probability: int("probability").default(0),
  expectedCloseDate: timestamp("expectedCloseDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SalesPipeline = typeof salesPipeline.$inferSelect;
export type InsertSalesPipeline = typeof salesPipeline.$inferInsert;

// ============================================================
// CRM - Exchange History
// ============================================================
export const exchangeHistoryExtended = mysqlTable("exchange_history_extended", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  clientId: int("clientId"),
  leadId: int("leadId"),
  type: mysqlEnum("type", ["email", "call", "meeting", "note", "document", "proposal"]).notNull(),
  date: timestamp("date").notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  attachments: text("attachments"), // JSON stringified
  createdBy: varchar("createdBy", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExchangeHistoryExtended = typeof exchangeHistoryExtended.$inferSelect;
export type InsertExchangeHistoryExtended = typeof exchangeHistoryExtended.$inferInsert;

// ============================================================
// Phase Checklists
// ============================================================
export const phaseChecklists = mysqlTable("phase_checklists", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  phase: mysqlEnum("phase", [
    "esq", "aps", "apd", "pro", "dce", "exe", "det", "aor"
  ]).notNull(),
  items: text("items"), // JSON stringified array of checklist items
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
  projectId: int("projectId").notNull(),
  phase: mysqlEnum("phase", [
    "esq", "aps", "apd", "pro", "dce", "exe", "det", "aor"
  ]).notNull(),
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
// Gantt Tasks (Planning)
// ============================================================
export const ganttTasksExtended = mysqlTable("gantt_tasks_extended", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  siteId: int("siteId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  duration: int("duration"),
  progress: int("progress").default(0),
  assignedTo: int("assignedTo"),
  dependencies: text("dependencies"), // JSON stringified array of task IDs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GanttTaskExtended = typeof ganttTasksExtended.$inferSelect;
export type InsertGanttTaskExtended = typeof ganttTasksExtended.$inferInsert;

// ============================================================
// Cost Estimates (Économie)
// ============================================================
export const costEstimatesExtended = mysqlTable("cost_estimates_extended", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  phase: mysqlEnum("phase", [
    "esq", "aps", "apd", "pro", "dce", "exe", "det", "aor"
  ]).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  estimatedAmount: decimal("estimatedAmount", { precision: 12, scale: 2 }).notNull(),
  actualAmount: decimal("actualAmount", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["draft", "approved", "in_progress", "completed"]).default("draft").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CostEstimateExtended = typeof costEstimatesExtended.$inferSelect;
export type InsertCostEstimateExtended = typeof costEstimatesExtended.$inferInsert;

// ============================================================
// Building Permits (Permis de Construire)
// ============================================================
export const buildingPermitsExtended = mysqlTable("building_permits_extended", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  referenceNumber: varchar("referenceNumber", { length: 100 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }),
  submissionDate: timestamp("submissionDate"),
  approvalDate: timestamp("approvalDate"),
  expiryDate: timestamp("expiryDate"),
  status: mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "expired"]).default("draft").notNull(),
  notes: text("notes"),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BuildingPermitExtended = typeof buildingPermitsExtended.$inferSelect;
export type InsertBuildingPermitExtended = typeof buildingPermitsExtended.$inferInsert;

// ============================================================
// Intelligent Alerts
// ============================================================
export const intelligentAlerts = mysqlTable("intelligent_alerts", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  projectId: int("projectId"),
  type: mysqlEnum("type", ["budget_overrun", "schedule_delay", "permit_expiry", "deliverable_pending", "team_alert"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
});

export type IntelligentAlert = typeof intelligentAlerts.$inferSelect;
export type InsertIntelligentAlert = typeof intelligentAlerts.$inferInsert;

// ============================================================
// AI Generated Content
// ============================================================
export const aiGeneratedContent = mysqlTable("ai_generated_content", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  projectId: int("projectId"),
  type: mysqlEnum("type", ["report", "cctp", "meeting_notes", "cost_estimate", "recommendation"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  prompt: text("prompt"),
  status: mysqlEnum("status", ["draft", "approved", "published"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIGeneratedContent = typeof aiGeneratedContent.$inferSelect;
export type InsertAIGeneratedContent = typeof aiGeneratedContent.$inferInsert;
