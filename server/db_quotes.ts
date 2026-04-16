/**
 * Module de gestion des devis (Quotes)
 * Inspiré par Batichiffrage - gestion structurée des estimatifs par lots
 */

import { getDb } from "./db";
import { sql, eq, and } from "drizzle-orm";
import { costEstimates, projects } from "../drizzle/schema";
import { PHASES, Phase } from "../drizzle/schema";

export interface QuoteLineItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  phase?: Phase;
}

export interface Quote {
  id: string;
  projectId: number;
  number: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  totalAmount: number;
  lineItems: QuoteLineItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Récupère tous les devis d'un projet
 */
export async function getQuotesByProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const estimates = await db
    .select()
    .from(costEstimates)
    .where(eq(costEstimates.projectId, projectId))
    .orderBy(costEstimates.phase);

  // Grouper par phase pour une vue structurée
  const grouped: Record<Phase, typeof estimates> = {} as any;
  PHASES.forEach(phase => {
    grouped[phase] = estimates.filter(e => e.phase === phase);
  });

  return grouped;
}

/**
 * Crée un nouveau devis pour un projet
 */
export async function createQuote(
  projectId: number,
  lineItems: QuoteLineItem[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const quoteNumber = `DEVIS-${Date.now()}`;
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

  // Créer les lignes comme des cost estimates
  for (const item of lineItems) {
    await db.insert(costEstimates).values({
      projectId,
      phase: item.phase || "esq",
      category: item.category,
      description: item.description,
      estimatedAmount: item.total.toString(),
      status: "draft",
      notes: `Qty: ${item.quantity} × ${item.unitPrice}€`,
    });
  }

  return {
    id: quoteNumber,
    projectId,
    number: quoteNumber,
    status: "draft" as const,
    totalAmount,
    lineItems,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Met à jour le statut d'un devis
 */
export async function updateQuoteStatus(
  projectId: number,
  status: "draft" | "sent" | "accepted" | "rejected"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const estimates = await db
    .select()
    .from(costEstimates)
    .where(eq(costEstimates.projectId, projectId));

  const newStatus = status === "accepted" ? "approved" : "draft";

  for (const estimate of estimates) {
    await db
      .update(costEstimates)
      .set({ status: newStatus })
      .where(eq(costEstimates.id, estimate.id));
  }

  return { success: true, status };
}

/**
 * Calcule le total d'un devis par phase
 */
export async function getQuoteTotalByPhase(projectId: number, phase: Phase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const estimates = await db
    .select()
    .from(costEstimates)
    .where(and(eq(costEstimates.projectId, projectId), eq(costEstimates.phase, phase)));

  return estimates.reduce((sum, e) => sum + parseFloat(e.estimatedAmount?.toString() || "0"), 0);
}
