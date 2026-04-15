/**
 * Module CRM Amélioré
 * Gestion avancée du pipeline de vente et conversion leads → clients
 */

import { db } from "./_core/index";
import { sql, eq } from "drizzle-orm";
import { leads, clients, exchangeHistory, projects } from "../drizzle/schema";

export interface SalesPipelineMetrics {
  totalLeads: number;
  leadsByStatus: Record<string, number>;
  conversionRate: number;
  averageDealValue: number;
  closedDealsThisMonth: number;
}

/**
 * Récupère les métriques du pipeline de vente
 */
export async function getSalesPipelineMetrics(): Promise<SalesPipelineMetrics> {
  const allLeads = await db.select().from(leads);
  const wonLeads = allLeads.filter(l => l.status === "won");
  const lostLeads = allLeads.filter(l => l.status === "lost");

  const leadsByStatus: Record<string, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };

  allLeads.forEach(lead => {
    leadsByStatus[lead.status]++;
  });

  const conversionRate = allLeads.length > 0 ? (wonLeads.length / allLeads.length) * 100 : 0;
  const averageDealValue = wonLeads.length > 0 
    ? wonLeads.reduce((sum, l) => sum + parseFloat(l.value?.toString() || "0"), 0) / wonLeads.length 
    : 0;

  // Deals closed this month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const closedDealsThisMonth = wonLeads.filter(l => l.updatedAt >= monthStart).length;

  return {
    totalLeads: allLeads.length,
    leadsByStatus,
    conversionRate,
    averageDealValue,
    closedDealsThisMonth,
  };
}

/**
 * Récupère les leads qualifiés (prêts pour une proposition)
 */
export async function getQualifiedLeads() {
  return db
    .select()
    .from(leads)
    .where(sql`status IN ('qualified', 'proposal', 'negotiation')`);
}

/**
 * Convertit un lead en client et crée un projet associé
 */
export async function convertLeadToClientWithProject(
  leadId: number,
  projectName?: string
) {
  const lead = await db.select().from(leads).where(eq(leads.id, leadId));
  
  if (!lead.length) {
    throw new Error("Lead not found");
  }

  const leadData = lead[0];

  // Créer le client
  const newClient = await db.insert(clients).values({
    name: leadData.company || leadData.name,
    type: "company",
    email: leadData.email,
    phone: leadData.phone,
    notes: `Converti du lead: ${leadData.name}`,
    status: "active",
  });

  const clientId = (newClient as any).insertId || newClient[0]?.id;

  // Créer le projet
  const newProject = await db.insert(projects).values({
    name: projectName || `Projet ${leadData.company || leadData.name}`,
    clientId: clientId as number,
    leadId,
    type: "architecture",
    description: leadData.notes || "",
    status: "active",
    currentPhase: "esq",
    progress: 0,
  });

  // Mettre à jour le lead
  await db
    .update(leads)
    .set({ 
      status: "won",
      convertedClientId: clientId as number,
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  return {
    clientId,
    projectId: (newProject as any).insertId || newProject[0]?.id,
    success: true,
  };
}

/**
 * Enregistre une interaction CRM (email, appel, réunion, etc.)
 */
export async function logCRMInteraction(
  leadId: number | null,
  clientId: number | null,
  type: "email" | "call" | "meeting" | "note" | "document" | "proposal",
  subject: string,
  content: string
) {
  return db.insert(exchangeHistory).values({
    leadId,
    clientId,
    type,
    date: new Date(),
    subject,
    content,
    createdBy: "system",
  });
}

/**
 * Récupère l'historique des interactions pour un lead
 */
export async function getLeadInteractionHistory(leadId: number) {
  return db
    .select()
    .from(exchangeHistory)
    .where(eq(exchangeHistory.leadId, leadId))
    .orderBy(sql`date DESC`);
}

/**
 * Récupère les leads en retard (pas d'interaction depuis X jours)
 */
export async function getOverdueLeads(daysThreshold: number = 7) {
  const allLeads = await db.select().from(leads);
  const now = new Date();
  const threshold = new Date(now.getTime() - daysThreshold * 24 * 60 * 60 * 1000);

  return allLeads.filter(lead => {
    const lastUpdate = new Date(lead.updatedAt);
    return lastUpdate < threshold && lead.status !== "won" && lead.status !== "lost";
  });
}
