/**
 * Router MVP - Nouvelles fonctionnalités pour le MVP
 * Inclut : Devis améliorés, CRM avancé, BIM basique
 */

import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getQuotesByProject,
  createQuote,
  updateQuoteStatus,
  getQuoteTotalByPhase,
} from "./db_quotes";
import {
  getSalesPipelineMetrics,
  getQualifiedLeads,
  convertLeadToClientWithProject,
  logCRMInteraction,
  getLeadInteractionHistory,
  getOverdueLeads,
} from "./db_crm_enhanced";
import {
  getBIMModelsByProject,
  uploadBIMModel,
  getLatestBIMModel,
  getBIMModelVersionHistory,
  getBIMProjectStats,
} from "./db_bim";

export const mvpRouter = router({
  // ── Quotes (Devis) ─────────────────────────────────────────
  quotes: router({
    byProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getQuotesByProject(input.projectId)),

    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        lineItems: z.array(z.object({
          id: z.string(),
          category: z.string(),
          description: z.string(),
          quantity: z.number(),
          unitPrice: z.number(),
          total: z.number(),
          phase: z.string().optional(),
        })),
      }))
      .mutation(({ input }) => createQuote(input.projectId, input.lineItems as any)),

    updateStatus: publicProcedure
      .input(z.object({
        projectId: z.number(),
        status: z.enum(["draft", "sent", "accepted", "rejected"]),
      }))
      .mutation(({ input }) => updateQuoteStatus(input.projectId, input.status)),

    totalByPhase: publicProcedure
      .input(z.object({
        projectId: z.number(),
        phase: z.string(),
      }))
      .query(({ input }) => getQuoteTotalByPhase(input.projectId, input.phase as any)),
  }),

  // ── CRM Avancé ─────────────────────────────────────────────
  crm: router({
    pipelineMetrics: publicProcedure
      .query(() => getSalesPipelineMetrics()),

    qualifiedLeads: publicProcedure
      .query(() => getQualifiedLeads()),

    convertLeadToClient: publicProcedure
      .input(z.object({
        leadId: z.number(),
        projectName: z.string().optional(),
      }))
      .mutation(({ input }) => 
        convertLeadToClientWithProject(input.leadId, input.projectName)
      ),

    logInteraction: publicProcedure
      .input(z.object({
        leadId: z.number().optional(),
        clientId: z.number().optional(),
        type: z.enum(["email", "call", "meeting", "note", "document", "proposal"]),
        subject: z.string(),
        content: z.string(),
      }))
      .mutation(({ input }) =>
        logCRMInteraction(
          input.leadId || null,
          input.clientId || null,
          input.type,
          input.subject,
          input.content
        )
      ),

    interactionHistory: publicProcedure
      .input(z.object({ leadId: z.number() }))
      .query(({ input }) => getLeadInteractionHistory(input.leadId)),

    overdueLeads: publicProcedure
      .input(z.object({ daysThreshold: z.number().optional() }))
      .query(({ input }) => getOverdueLeads(input.daysThreshold || 7)),
  }),

  // ── BIM ────────────────────────────────────────────────────
  bim: router({
    modelsByProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getBIMModelsByProject(input.projectId)),

    upload: publicProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string(),
        fileUrl: z.string(),
        fileKey: z.string(),
        format: z.enum(["ifc", "rvt", "dwg", "pdf"]),
        description: z.string().optional(),
      }))
      .mutation(({ input }) =>
        uploadBIMModel(
          input.projectId,
          input.name,
          input.fileUrl,
          input.fileKey,
          input.format,
          input.description
        )
      ),

    latest: publicProcedure
      .input(z.object({
        projectId: z.number(),
        modelName: z.string(),
      }))
      .query(({ input }) => getLatestBIMModel(input.projectId, input.modelName)),

    versionHistory: publicProcedure
      .input(z.object({
        projectId: z.number(),
        modelName: z.string(),
      }))
      .query(({ input }) => getBIMModelVersionHistory(input.projectId, input.modelName)),

    projectStats: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getBIMProjectStats(input.projectId)),
  }),
});
