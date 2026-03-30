import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as crmDb from "./db_crm";

// ============================================================
// CRM Router
// ============================================================

export const crmRouter = router({
  // Organizations
  createOrganization: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      country: z.string().optional(),
      industry: z.string().optional(),
      plan: z.enum(["basic", "pro", "enterprise"]).default("basic"),
    }))
    .mutation(({ input }) => crmDb.createOrganization(input)),

  getOrganization: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => crmDb.getOrganizationById(input.id)),

  updateOrganization: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      country: z.string().optional(),
      industry: z.string().optional(),
      plan: z.enum(["basic", "pro", "enterprise"]).optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return crmDb.updateOrganization(id, data);
    }),

  // Subscriptions
  createSubscription: publicProcedure
    .input(z.object({
      organizationId: z.number(),
      plan: z.enum(["basic", "pro", "enterprise"]),
      startDate: z.date(),
      amount: z.string(),
      currency: z.string().default("EUR"),
    }))
    .mutation(({ input }) => crmDb.createSubscription(input)),

  getSubscription: publicProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(({ input }) => crmDb.getSubscriptionByOrganization(input.organizationId)),

  // Leads
  createLead: publicProcedure
    .input(z.object({
      organizationId: z.number(),
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      source: z.enum(["website", "referral", "cold_call", "email", "event", "other"]).default("other"),
      value: z.string().optional(),
    }))
    .mutation(({ input }) => crmDb.createLead(input)),

  listLeads: publicProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(({ input }) => crmDb.getLeadsByOrganization(input.organizationId)),

  getLead: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => crmDb.getLeadById(input.id)),

  updateLead: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      source: z.enum(["website", "referral", "cold_call", "email", "event", "other"]).optional(),
      status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
      value: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return crmDb.updateLead(id, data);
    }),

  deleteLead: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => crmDb.deleteLead(input.id)),

  // Exchange History
  addExchange: publicProcedure
    .input(z.object({
      organizationId: z.number(),
      clientId: z.number().optional(),
      leadId: z.number().optional(),
      type: z.enum(["email", "call", "meeting", "note", "document", "proposal"]),
      date: z.date(),
      subject: z.string().optional(),
      content: z.string().optional(),
    }))
    .mutation(({ input }) => crmDb.addExchangeHistory(input)),

  getClientExchanges: publicProcedure
    .input(z.object({ clientId: z.number() }))
    .query(({ input }) => crmDb.getExchangeHistoryByClient(input.clientId)),

  getLeadExchanges: publicProcedure
    .input(z.object({ leadId: z.number() }))
    .query(({ input }) => crmDb.getExchangeHistoryByLead(input.leadId)),

  // Sales Pipeline
  getPipeline: publicProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(({ input }) => crmDb.getSalesPipelineByOrganization(input.organizationId)),

  getPipelineByStage: publicProcedure
    .input(z.object({
      organizationId: z.number(),
      stage: z.string(),
    }))
    .query(({ input }) => crmDb.getSalesPipelineByStage(input.organizationId, input.stage)),

  moveLeadToStage: publicProcedure
    .input(z.object({
      pipelineId: z.number(),
      stage: z.enum(["prospect", "lead", "qualified", "proposal", "negotiation", "won", "lost"]),
    }))
    .mutation(({ input }) => crmDb.updateSalesPipelineStage(input.pipelineId, input.stage)),
});

// ============================================================
// Projects Router
// ============================================================

export const projectsRouter = router({
  // Gantt Tasks
  getGanttTasks: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(({ input }) => crmDb.getGanttTasksByProject(input.projectId)),

  createGanttTask: publicProcedure
    .input(z.object({
      projectId: z.number(),
      siteId: z.number().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      startDate: z.date(),
      endDate: z.date(),
      duration: z.number().optional(),
      assignedTo: z.number().optional(),
    }))
    .mutation(({ input }) => crmDb.createGanttTask(input)),

  updateGanttTask: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      progress: z.number().optional(),
      assignedTo: z.number().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return crmDb.updateGanttTask(id, data);
    }),
});

// ============================================================
// Economy Router
// ============================================================

export const economyRouter = router({
  // Cost Estimates
  getCostEstimates: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(({ input }) => crmDb.getCostEstimatesByProject(input.projectId)),

  getCostEstimatesByPhase: publicProcedure
    .input(z.object({
      projectId: z.number(),
      phase: z.enum(["esq", "aps", "apd", "pro", "dce", "exe", "det", "aor"]),
    }))
    .query(({ input }) => crmDb.getCostEstimatesByPhase(input.projectId, input.phase)),

  createCostEstimate: publicProcedure
    .input(z.object({
      projectId: z.number(),
      phase: z.enum(["esq", "aps", "apd", "pro", "dce", "exe", "det", "aor"]),
      category: z.string(),
      description: z.string(),
      estimatedAmount: z.string(),
    }))
    .mutation(({ input }) => crmDb.createCostEstimate(input)),

  updateCostEstimate: publicProcedure
    .input(z.object({
      id: z.number(),
      actualAmount: z.string().optional(),
      status: z.enum(["draft", "approved", "in_progress", "completed"]).optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return crmDb.updateCostEstimate(id, data);
    }),

  // Building Permits
  getBuildingPermits: publicProcedure
    .input(z.object({ projectId: z.number() }))
    .query(({ input }) => crmDb.getBuildingPermitsByProject(input.projectId)),

  createBuildingPermit: publicProcedure
    .input(z.object({
      projectId: z.number(),
      referenceNumber: z.string(),
      type: z.string(),
      country: z.string().optional(),
      submissionDate: z.date().optional(),
    }))
    .mutation(({ input }) => crmDb.createBuildingPermit(input)),

  updateBuildingPermit: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "submitted", "approved", "rejected", "expired"]).optional(),
      approvalDate: z.date().optional(),
      expiryDate: z.date().optional(),
    }))
    .mutation(({ input }) => {
      const { id, ...data } = input;
      return crmDb.updateBuildingPermit(id, data);
    }),
});

// ============================================================
// Alerts Router
// ============================================================

export const alertsRouter = router({
  getAlerts: publicProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(({ input }) => crmDb.getAlertsByOrganization(input.organizationId)),

  getActiveAlerts: publicProcedure
    .input(z.object({ organizationId: z.number() }))
    .query(({ input }) => crmDb.getActiveAlerts(input.organizationId)),

  createAlert: publicProcedure
    .input(z.object({
      organizationId: z.number(),
      projectId: z.number().optional(),
      type: z.enum(["budget_overrun", "schedule_delay", "permit_expiry", "deliverable_pending", "team_alert"]),
      severity: z.enum(["low", "medium", "high", "critical"]),
      title: z.string(),
      description: z.string().optional(),
    }))
    .mutation(({ input }) => crmDb.createAlert(input)),

  acknowledgeAlert: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => crmDb.acknowledgeAlert(input.id)),

  resolveAlert: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => crmDb.resolveAlert(input.id)),
});

// ============================================================
// Combined Router
// ============================================================

export const extendedRouter = router({
  crm: crmRouter,
  projects: projectsRouter,
  economy: economyRouter,
  alerts: alertsRouter,
});
