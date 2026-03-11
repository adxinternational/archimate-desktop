import { and, desc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  clients, InsertClient,
  projects, InsertProject,
  projectPhases, InsertProjectPhase,
  documents, InsertDocument,
  comments, InsertComment,
  adminProcedures, InsertAdminProcedure,
  constructionSites, InsertConstructionSite,
  siteJournalEntries, InsertSiteJournalEntry,
  meetingReports, InsertMeetingReport,
  incidents, InsertIncident,
  teamMembers, InsertTeamMember,
  tasks, InsertTask,
  timeEntries, InsertTimeEntry,
  invoices, InsertInvoice,
  expenses, InsertExpense,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================
// Users
// ============================================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================
// Clients
// ============================================================
export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(clients).values(data);
  return result[0];
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(clients).where(eq(clients.id, id));
}

// ============================================================
// Projects
// ============================================================
export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function getProjectsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.clientId, clientId)).orderBy(desc(projects.createdAt));
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(projects).values(data);
  return result[0];
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(projects).where(eq(projects.id, id));
}

// ============================================================
// Project Phases
// ============================================================
export async function getProjectPhases(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectPhases).where(eq(projectPhases.projectId, projectId));
}

export async function upsertProjectPhase(data: InsertProjectPhase) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(projectPhases).values(data).onDuplicateKeyUpdate({ set: data });
}

export async function updateProjectPhase(id: number, data: Partial<InsertProjectPhase>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(projectPhases).set(data).where(eq(projectPhases.id, id));
}

// ============================================================
// Documents
// ============================================================
export async function getDocumentsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.projectId, projectId)).orderBy(desc(documents.createdAt));
}

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(documents).values(data);
  return result[0];
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(documents).set(data).where(eq(documents.id, id));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(documents).where(eq(documents.id, id));
}

// ============================================================
// Comments
// ============================================================
export async function getCommentsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comments).where(eq(comments.projectId, projectId)).orderBy(desc(comments.createdAt));
}

export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(comments).values(data);
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(comments).where(eq(comments.id, id));
}

// ============================================================
// Admin Procedures
// ============================================================
export async function getProceduresByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminProcedures).where(eq(adminProcedures.projectId, projectId)).orderBy(desc(adminProcedures.createdAt));
}

export async function createProcedure(data: InsertAdminProcedure) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(adminProcedures).values(data);
  return result[0];
}

export async function updateProcedure(id: number, data: Partial<InsertAdminProcedure>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(adminProcedures).set(data).where(eq(adminProcedures.id, id));
}

export async function deleteProcedure(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(adminProcedures).where(eq(adminProcedures.id, id));
}

// ============================================================
// Construction Sites
// ============================================================
export async function getAllSites() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(constructionSites).orderBy(desc(constructionSites.createdAt));
}

export async function getSiteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(constructionSites).where(eq(constructionSites.id, id)).limit(1);
  return result[0];
}

export async function getSitesByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(constructionSites).where(eq(constructionSites.projectId, projectId));
}

export async function createSite(data: InsertConstructionSite) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(constructionSites).values(data);
  return result[0];
}

export async function updateSite(id: number, data: Partial<InsertConstructionSite>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(constructionSites).set(data).where(eq(constructionSites.id, id));
}

export async function deleteSite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(constructionSites).where(eq(constructionSites.id, id));
}

// ============================================================
// Site Journal Entries
// ============================================================
export async function getJournalBySite(siteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteJournalEntries).where(eq(siteJournalEntries.siteId, siteId)).orderBy(desc(siteJournalEntries.date));
}

export async function createJournalEntry(data: InsertSiteJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(siteJournalEntries).values(data);
  return result[0];
}

export async function deleteJournalEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(siteJournalEntries).where(eq(siteJournalEntries.id, id));
}

// ============================================================
// Meeting Reports
// ============================================================
export async function getMeetingsBySite(siteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(meetingReports).where(eq(meetingReports.siteId, siteId)).orderBy(desc(meetingReports.date));
}

export async function createMeeting(data: InsertMeetingReport) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(meetingReports).values(data);
  return result[0];
}

export async function deleteMeeting(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(meetingReports).where(eq(meetingReports.id, id));
}

// ============================================================
// Incidents
// ============================================================
export async function getIncidentsBySite(siteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incidents).where(eq(incidents.siteId, siteId)).orderBy(desc(incidents.date));
}

export async function createIncident(data: InsertIncident) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(incidents).values(data);
  return result[0];
}

export async function updateIncident(id: number, data: Partial<InsertIncident>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(incidents).set(data).where(eq(incidents.id, id));
}

// ============================================================
// Team Members
// ============================================================
export async function getAllTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamMembers).where(eq(teamMembers.active, true)).orderBy(teamMembers.name);
}

export async function createTeamMember(data: InsertTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(teamMembers).values(data);
  return result[0];
}

export async function updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(teamMembers).set({ active: false }).where(eq(teamMembers.id, id));
}

// ============================================================
// Tasks
// ============================================================
export async function getAllTasks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getTasksByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(desc(tasks.createdAt));
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(tasks).values(data);
  return result[0];
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(tasks).set(data).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ============================================================
// Time Entries
// ============================================================
export async function getAllTimeEntries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timeEntries).orderBy(desc(timeEntries.date));
}

export async function getTimeEntriesByMember(memberId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(timeEntries).where(eq(timeEntries.memberId, memberId)).orderBy(desc(timeEntries.date));
}

export async function createTimeEntry(data: InsertTimeEntry) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(timeEntries).values(data);
  return result[0];
}

export async function deleteTimeEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(timeEntries).where(eq(timeEntries.id, id));
}

// ============================================================
// Invoices
// ============================================================
export async function getAllInvoices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function getInvoicesByClient(clientId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.clientId, clientId)).orderBy(desc(invoices.createdAt));
}

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(invoices).values(data);
  return result[0];
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}

export async function deleteInvoice(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(invoices).where(eq(invoices.id, id));
}

// ============================================================
// Expenses
// ============================================================
export async function getAllExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).orderBy(desc(expenses.date));
}

export async function createExpense(data: InsertExpense) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(expenses).values(data);
  return result[0];
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(expenses).where(eq(expenses.id, id));
}

// ============================================================
// Dashboard KPIs
// ============================================================
export async function getDashboardKPIs() {
  const db = await getDb();
  if (!db) return { activeProjects: 0, totalBudget: 0, overdueTasks: 0, hoursThisMonth: 0, revenueThisMonth: 0, pendingInvoices: 0 };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [allProjects, allTasks, allTimeEntries, allInvoices] = await Promise.all([
    db.select().from(projects),
    db.select().from(tasks),
    db.select().from(timeEntries).where(and(gte(timeEntries.date, startOfMonth), lte(timeEntries.date, endOfMonth))),
    db.select().from(invoices),
  ]);

  const activeProjects = allProjects.filter(p => p.status === "active").length;
  const totalBudget = allProjects.filter(p => p.status === "active").reduce((s, p) => s + (p.budgetEstimated ?? 0), 0);
  const overdueTasks = allTasks.filter(t => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now).length;
  const hoursThisMonth = allTimeEntries.reduce((s, e) => s + e.hours, 0);
  const revenueThisMonth = allInvoices.filter(i => i.status === "paid" && i.createdAt >= startOfMonth).reduce((s, i) => s + i.amount, 0);
  const pendingInvoices = allInvoices.filter(i => i.status === "sent" || i.status === "overdue").length;

  return { activeProjects, totalBudget, overdueTasks, hoursThisMonth, revenueThisMonth, pendingInvoices };
}
