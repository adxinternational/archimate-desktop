/**
 * Module BIM - Gestion des maquettes et modèles
 * Intégration basique pour le versioning et la gestion des fichiers IFC/RVT
 */

import { getDb } from "./db";
import { sql, eq, and, desc } from "drizzle-orm";
import { documents, projects } from "../drizzle/schema";

export interface BIMModel {
  id: number;
  projectId: number;
  name: string;
  fileUrl: string;
  fileKey: string;
  format: "ifc" | "rvt" | "dwg" | "pdf";
  version: number;
  createdAt: Date;
  updatedAt: Date;
  uploadedBy?: string;
  description?: string;
}

/**
 * Récupère tous les modèles BIM d'un projet
 */
export async function getBIMModelsByProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(documents)
    .where(and(eq(documents.projectId, projectId), eq(documents.category, 'bim')))
    .orderBy(desc(documents.version));
}

/**
 * Ajoute une nouvelle version d'un modèle BIM
 */
export async function uploadBIMModel(
  projectId: number,
  name: string,
  fileUrl: string,
  fileKey: string,
  format: "ifc" | "rvt" | "dwg" | "pdf",
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Récupérer la version précédente
  const previousVersions = await db
    .select()
    .from(documents)
    .where(and(eq(documents.projectId, projectId), eq(documents.category, 'bim'), eq(documents.name, name)));

  const nextVersion = previousVersions.length > 0 
    ? Math.max(...previousVersions.map(d => d.version || 1)) + 1 
    : 1;

  return db.insert(documents).values({
    projectId,
    name,
    category: "bim",
    fileUrl,
    fileKey,
    mimeType: `model/${format}`,
    version: nextVersion,
    notes: description || `Version ${nextVersion} du modèle BIM`,
  });
}

/**
 * Récupère la dernière version d'un modèle BIM
 */
export async function getLatestBIMModel(projectId: number, modelName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const models = await db
    .select()
    .from(documents)
    .where(and(eq(documents.projectId, projectId), eq(documents.category, 'bim'), eq(documents.name, modelName)))
    .orderBy(desc(documents.version));

  return models.length > 0 ? models[0] : null;
}

/**
 * Récupère l'historique des versions d'un modèle BIM
 */
export async function getBIMModelVersionHistory(projectId: number, modelName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(documents)
    .where(and(eq(documents.projectId, projectId), eq(documents.category, 'bim'), eq(documents.name, modelName)))
    .orderBy(desc(documents.version));
}

/**
 * Supprime une version spécifique d'un modèle BIM
 */
export async function deleteBIMModelVersion(documentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(documents).where(eq(documents.id, documentId));
}

/**
 * Récupère les statistiques BIM d'un projet
 */
export async function getBIMProjectStats(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allBIMDocs = await db
    .select()
    .from(documents)
    .where(and(eq(documents.projectId, projectId), eq(documents.category, 'bim')));

  const models = new Set(allBIMDocs.map(d => d.name));
  const totalVersions = allBIMDocs.length;
  const latestUpdate = allBIMDocs.length > 0 
    ? new Date(Math.max(...allBIMDocs.map(d => new Date(d.updatedAt).getTime())))
    : null;

  return {
    totalModels: models.size,
    totalVersions,
    latestUpdate,
    formats: [...new Set(allBIMDocs.map(d => d.mimeType))],
  };
}

/**
 * Récupère les documents liés à un modèle BIM (plans, rapports, etc.)
 */
export async function getRelatedDocuments(projectId: number, modelName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(documents)
    .where(and(eq(documents.projectId, projectId), sql`(category = 'plan' OR category = 'report' OR category = 'photo')`));
}
