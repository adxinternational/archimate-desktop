import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  organizations,
  subscriptions,
  leads,
  exchangeHistoryExtended,
  salesPipeline,
  phaseChecklists,
  projectDeliverables,
  ganttTasksExtended,
  costEstimatesExtended,
  buildingPermitsExtended,
  intelligentAlerts,
  aiGeneratedContent,
  type InsertOrganization,
  type InsertSubscription,
  type InsertLead,
  type InsertExchangeHistoryExtended,
  type InsertSalesPipeline,
  type InsertPhaseChecklist,
  type InsertProjectDeliverable,
  type InsertGanttTaskExtended,
  type InsertCostEstimateExtended,
  type InsertBuildingPermitExtended,
  type InsertIntelligentAlert,
  type InsertAIGeneratedContent,
} from "../drizzle/schema_extended_v2";

// ============================================================
// Organizations
// ============================================================

export async function createOrganization(data: InsertOrganization) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(organizations).values(data);
  return result;
}

export async function getOrganizationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateOrganization(id: number, data: Partial<InsertOrganization>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(organizations).set(data).where(eq(organizations.id, id));
}

// ============================================================
// Subscriptions
// ============================================================

export async function createSubscription(data: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(subscriptions).values(data);
  return result;
}

export async function getSubscriptionByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(subscriptions)
    .where(eq(subscriptions.organizationId, organizationId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateSubscription(id: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(subscriptions).set(data).where(eq(subscriptions.id, id));
}

// ============================================================
// CRM - Leads
// ============================================================

export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(leads).values(data);
  return result;
}

export async function getLeadsByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(leads)
    .where(eq(leads.organizationId, organizationId))
    .orderBy(desc(leads.createdAt));
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(leads).set(data).where(eq(leads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(leads).where(eq(leads.id, id));
}

// ============================================================
// CRM - Exchange History
// ============================================================

export async function addExchangeHistory(data: InsertExchangeHistoryExtended) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(exchangeHistoryExtended).values(data);
  return result;
}

export async function getExchangeHistoryByClient(clientId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(exchangeHistoryExtended)
    .where(eq(exchangeHistoryExtended.clientId, clientId))
    .orderBy(desc(exchangeHistoryExtended.date));
}

export async function getExchangeHistoryByLead(leadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(exchangeHistoryExtended)
    .where(eq(exchangeHistoryExtended.leadId, leadId))
    .orderBy(desc(exchangeHistoryExtended.date));
}

// ============================================================
// Sales Pipeline
// ============================================================

export async function getSalesPipelineByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(salesPipeline)
    .where(eq(salesPipeline.organizationId, organizationId))
    .orderBy(desc(salesPipeline.updatedAt));
}

export async function getSalesPipelineByStage(organizationId: number, stage: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(salesPipeline)
    .where(and(
      eq(salesPipeline.organizationId, organizationId),
      eq(salesPipeline.stage, stage as any)
    ))
    .orderBy(desc(salesPipeline.value));
}

export async function updateSalesPipelineStage(id: number, stage: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(salesPipeline).set({ stage: stage as any }).where(eq(salesPipeline.id, id));
}

// ============================================================
// Gantt Tasks
// ============================================================

export async function getGanttTasksByProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(ganttTasksExtended)
    .where(eq(ganttTasksExtended.projectId, projectId))
    .orderBy(ganttTasksExtended.startDate);
}

export async function createGanttTask(data: InsertGanttTaskExtended) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ganttTasksExtended).values(data);
  return result;
}

export async function updateGanttTask(id: number, data: Partial<InsertGanttTaskExtended>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(ganttTasksExtended).set(data).where(eq(ganttTasksExtended.id, id));
}

// ============================================================
// Cost Estimates
// ============================================================

export async function getCostEstimatesByProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(costEstimatesExtended)
    .where(eq(costEstimatesExtended.projectId, projectId))
    .orderBy(desc(costEstimatesExtended.createdAt));
}

export async function getCostEstimatesByPhase(projectId: number, phase: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(costEstimatesExtended)
    .where(and(
      eq(costEstimatesExtended.projectId, projectId),
      eq(costEstimatesExtended.phase, phase as any)
    ));
}

export async function createCostEstimate(data: InsertCostEstimateExtended) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(costEstimatesExtended).values(data);
  return result;
}

export async function updateCostEstimate(id: number, data: Partial<InsertCostEstimateExtended>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(costEstimatesExtended).set(data).where(eq(costEstimatesExtended.id, id));
}

// ============================================================
// Building Permits
// ============================================================

export async function getBuildingPermitsByProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(buildingPermitsExtended)
    .where(eq(buildingPermitsExtended.projectId, projectId));
}

export async function createBuildingPermit(data: InsertBuildingPermitExtended) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(buildingPermitsExtended).values(data);
  return result;
}

export async function updateBuildingPermit(id: number, data: Partial<InsertBuildingPermitExtended>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(buildingPermitsExtended).set(data).where(eq(buildingPermitsExtended.id, id));
}

// ============================================================
// Intelligent Alerts
// ============================================================

export async function getAlertsByOrganization(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(intelligentAlerts)
    .where(eq(intelligentAlerts.organizationId, organizationId))
    .orderBy(desc(intelligentAlerts.createdAt));
}

export async function getActiveAlerts(organizationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(intelligentAlerts)
    .where(and(
      eq(intelligentAlerts.organizationId, organizationId),
      eq(intelligentAlerts.status, "active")
    ))
    .orderBy(desc(intelligentAlerts.createdAt));
}

export async function createAlert(data: InsertIntelligentAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(intelligentAlerts).values(data);
  return result;
}

export async function acknowledgeAlert(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(intelligentAlerts).set({
    status: "acknowledged",
    acknowledgedAt: new Date(),
  }).where(eq(intelligentAlerts.id, id));
}

export async function resolveAlert(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(intelligentAlerts).set({
    status: "resolved",
    resolvedAt: new Date(),
  }).where(eq(intelligentAlerts.id, id));
}

// ============================================================
// AI Generated Content
// ============================================================

export async function createAIContent(data: InsertAIGeneratedContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiGeneratedContent).values(data);
  return result;
}

export async function getAIContentByProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(aiGeneratedContent)
    .where(eq(aiGeneratedContent.projectId, projectId))
    .orderBy(desc(aiGeneratedContent.createdAt));
}

export async function updateAIContent(id: number, data: Partial<InsertAIGeneratedContent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(aiGeneratedContent).set(data).where(eq(aiGeneratedContent.id, id));
}
