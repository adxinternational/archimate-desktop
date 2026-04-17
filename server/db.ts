import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  clients, InsertClient,
  leads, InsertLead,
  exchangeHistory, InsertExchangeHistory,
  projects, InsertProject,
  projectPhases, InsertProjectPhase,
  documents, InsertDocument,
  adminProcedures, InsertAdminProcedure,
  costEstimates, InsertCostEstimate,
  constructionSites, InsertConstructionSite,
  siteJournalEntries, InsertSiteJournalEntry,
  meetingReports, InsertMeetingReport,
  incidents, InsertIncident,
  ganttTasks, InsertGanttTask,
  enterprises, InsertEnterprise,
  siteEnterprises,
  teamMembers, InsertTeamMember,
  tasks, InsertTask,
  timeEntries, InsertTimeEntry,
  invoices, InsertInvoice,
  expenses, InsertExpense,
  alerts, InsertAlert,
} from "../drizzle/schema";

// ── DB Connection ─────────────────────────────────────────────

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

// ── Users ─────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach(field => {
      const value = user[field];
      if (value === undefined) return;
      values[field] = value ?? null;
      updateSet[field] = value ?? null;
    });
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ── Clients ───────────────────────────────────────────────────

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
  await db.insert(clients).values(data);
  const result = await db.select().from(clients).orderBy(desc(clients.createdAt)).limit(1);
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

// ── Leads CRM ────────────────────────────────────────────────

export async function getAllLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}

export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(leads).values(data);
  const result = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(1);
  return result[0];
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(leads).set({ ...data, updatedAt: new Date() }).where(eq(leads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(leads).where(eq(leads.id, id));
}

// Flux Lead → Client (conversion commerciale)
export async function convertLeadToClient(leadId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const lead = await getLeadById(leadId);
  if (!lead) throw new Error("Lead not found");

  // Crée le client depuis les données du lead
  await db.insert(clients).values({
    name: lead.name,
    email: lead.email ?? undefined,
    phone: lead.phone ?? undefined,
    type: "company",
    status: "active",
    notes: lead.notes ?? undefined,
  });

  const clientResult = await db.select().from(clients).orderBy(desc(clients.createdAt)).limit(1);
  const newClient = clientResult[0];

  // Marque le lead comme converti
  await db.update(leads).set({
    status: "won",
    convertedClientId: newClient.id,
    updatedAt: new Date(),
  }).where(eq(leads.id, leadId));

  return newClient;
}

// ── Projects ──────────────────────────────────────────────────

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
  await db.insert(projects).values(data);
  const result = await db.select().from(projects).orderBy(desc(projects.createdAt)).limit(1);
  return result[0];
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(projects).set({ ...data, updatedAt: new Date() }).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(projects).where(eq(projects.id, id));
}

export async function getProjectPhases(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectPhases).where(eq(projectPhases.projectId, projectId));
}

export async function updateProjectPhase(id: number, data: Partial<InsertProjectPhase>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(projectPhases).set({ ...data, updatedAt: new Date() }).where(eq(projectPhases.id, id));
}

// ── Documents ─────────────────────────────────────────────────

export async function getDocumentsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.projectId, projectId)).orderBy(desc(documents.createdAt));
}

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(documents).values(data);
  const result = await db.select().from(documents).orderBy(desc(documents.createdAt)).limit(1);
  return result[0];
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(documents).where(eq(documents.id, id));
}

// ── Admin Procedures ──────────────────────────────────────────

export async function getProceduresByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminProcedures).where(eq(adminProcedures.projectId, projectId));
}

export async function createProcedure(data: InsertAdminProcedure) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(adminProcedures).values(data);
}

export async function updateProcedure(id: number, data: Partial<InsertAdminProcedure>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(adminProcedures).set({ ...data, updatedAt: new Date() }).where(eq(adminProcedures.id, id));
}

export async function deleteProcedure(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(adminProcedures).where(eq(adminProcedures.id, id));
}

// ── Economy / Cost Estimates ──────────────────────────────────

export async function getCostEstimatesByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(costEstimates).where(eq(costEstimates.projectId, projectId));
}

export async function createCostEstimate(data: InsertCostEstimate) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(costEstimates).values(data);
}

export async function updateCostEstimate(id: number, data: Partial<InsertCostEstimate>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(costEstimates).set({ ...data, updatedAt: new Date() }).where(eq(costEstimates.id, id));
}

// ── Construction Sites ────────────────────────────────────────

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

export async function createSite(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(constructionSites).values(data);
  const result = await db.select().from(constructionSites).orderBy(desc(constructionSites.createdAt)).limit(1);
  return result[0];
}

export async function updateSite(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(constructionSites).set({ ...data, updatedAt: new Date() }).where(eq(constructionSites.id, id));
}

export async function deleteSite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(constructionSites).where(eq(constructionSites.id, id));
}

// ── Site Journal ──────────────────────────────────────────────

export async function getJournalBySite(siteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteJournalEntries).where(eq(siteJournalEntries.siteId, siteId)).orderBy(desc(siteJournalEntries.date));
}

export async function createJournalEntry(data: InsertSiteJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(siteJournalEntries).values(data);
}

export async function deleteJournalEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(siteJournalEntries).where(eq(siteJournalEntries.id, id));
}

// ── Meeting Reports ───────────────────────────────────────────

export async function getMeetingsBySite(siteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(meetingReports).where(eq(meetingReports.siteId, siteId)).orderBy(desc(meetingReports.date));
}

export async function createMeeting(data: InsertMeetingReport) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(meetingReports).values(data);
}

export async function deleteMeeting(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(meetingReports).where(eq(meetingReports.id, id));
}

// ── Incidents ─────────────────────────────────────────────────

export async function getIncidentsBySite(siteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(incidents).where(eq(incidents.siteId, siteId)).orderBy(desc(incidents.createdAt));
}

export async function createIncident(data: InsertIncident) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(incidents).values(data);
}

export async function updateIncident(id: number, data: Partial<InsertIncident>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(incidents).set({ ...data, updatedAt: new Date() }).where(eq(incidents.id, id));
}

// ── Enterprises ───────────────────────────────────────────────

export async function getAllEnterprises() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enterprises).orderBy(enterprises.name);
}

export async function createEnterprise(data: InsertEnterprise) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(enterprises).values(data);
}

export async function updateEnterprise(id: number, data: Partial<InsertEnterprise>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(enterprises).set({ ...data, updatedAt: new Date() }).where(eq(enterprises.id, id));
}

export async function deleteEnterprise(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(enterprises).where(eq(enterprises.id, id));
}

export async function getSiteEnterprises(siteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(siteEnterprises).where(eq(siteEnterprises.siteId, siteId));
}

export async function addSiteEnterprise(data: any) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(siteEnterprises).values(data);
}

// ── Team Members ──────────────────────────────────────────────

export async function getAllTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamMembers).orderBy(teamMembers.name);
}

export async function createTeamMember(data: InsertTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(teamMembers).values(data);
  const result = await db.select().from(teamMembers).orderBy(desc(teamMembers.createdAt)).limit(1);
  return result[0];
}

export async function updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(teamMembers).set({ ...data, updatedAt: new Date() }).where(eq(teamMembers.id, id));
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
}

// ── Tasks ─────────────────────────────────────────────────────

export async function getAllTasks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getTasksByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.projectId, projectId));
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(tasks).values(data);
  const result = await db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(1);
  return result[0];
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(tasks).set({ ...data, updatedAt: new Date() }).where(eq(tasks.id, id));
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ── Time Entries ──────────────────────────────────────────────

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
  await db.insert(timeEntries).values(data);
}

export async function deleteTimeEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(timeEntries).where(eq(timeEntries.id, id));
}

// ── Invoices ──────────────────────────────────────────────────

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
  await db.insert(invoices).values(data);
  const result = await db.select().from(invoices).orderBy(desc(invoices.createdAt)).limit(1);
  return result[0];
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(invoices).set({ ...data, updatedAt: new Date() }).where(eq(invoices.id, id));
}

export async function deleteInvoice(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(invoices).where(eq(invoices.id, id));
}

// ── Expenses ──────────────────────────────────────────────────

export async function getAllExpenses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(expenses).orderBy(desc(expenses.date));
}

export async function createExpense(data: InsertExpense) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(expenses).values(data);
}

export async function deleteExpense(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(expenses).where(eq(expenses.id, id));
}

// ── Alerts ────────────────────────────────────────────────────

export async function getActiveAlerts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alerts).where(eq(alerts.isRead, false)).orderBy(desc(alerts.createdAt));
}

export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(alerts).values(data);
}

export async function acknowledgeAlert(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(alerts).set({ isRead: true }).where(eq(alerts.id, id));
}

export async function resolveAlert(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(alerts).set({ isResolved: true }).where(eq(alerts.id, id));
}

// ── Gantt Tasks ───────────────────────────────────────────────

export async function getGanttTasksByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ganttTasks).where(eq(ganttTasks.projectId, projectId));
}

export async function createGanttTask(data: InsertGanttTask) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(ganttTasks).values(data);
}

export async function updateGanttTask(id: number, data: Partial<InsertGanttTask>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(ganttTasks).set({ ...data, updatedAt: new Date() }).where(eq(ganttTasks.id, id));
}

// ── Dashboard KPIs ────────────────────────────────────────────

export async function getDashboardKPIs() {
  const db = await getDb();
  if (!db) return {
    activeProjects: 0, totalBudget: 0, overdueTasks: 0,
    hoursThisMonth: 0, revenueThisMonth: 0, pendingInvoices: 0,
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [allProjects, allTasks, monthlyTime, allInvoices] = await Promise.all([
    db.select().from(projects),
    db.select().from(tasks),
    db.select().from(timeEntries).where(and(gte(timeEntries.date, startOfMonth), lte(timeEntries.date, endOfMonth))),
    db.select().from(invoices),
  ]);

  const activeProjects = allProjects.filter(p => p.status === "active").length;
  const totalBudget = allProjects.filter(p => p.status === "active").reduce((s, p) => s + (p.budgetEstimated ?? 0), 0);
  const overdueTasks = allTasks.filter(t => t.status !== "done" && t.dueDate && new Date(t.dueDate) < now).length;
  const hoursThisMonth = monthlyTime.reduce((s, e) => s + e.duration, 0);
  const revenueThisMonth = allInvoices.filter(i => i.status === "paid" && i.createdAt >= startOfMonth).reduce((s, i) => s + Number(i.amount), 0);
  const pendingInvoices = allInvoices.filter(i => i.status === "sent" || i.status === "overdue").length;

  return { activeProjects, totalBudget, overdueTasks, hoursThisMonth, revenueThisMonth, pendingInvoices };
}
