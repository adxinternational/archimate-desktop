import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { aiRouter } from "./routers_ai";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import {
  getAllClients, getClientById, createClient, updateClient, deleteClient,
  getAllProjects, getProjectById, getProjectsByClient, createProject, updateProject, deleteProject,
  getProjectPhases, updateProjectPhase,
  getDocumentsByProject, createDocument, deleteDocument,
  getCommentsByProject, createComment, deleteComment,
  getProceduresByProject, createProcedure, updateProcedure, deleteProcedure,
  getAllSites, getSiteById, getSitesByProject, createSite, updateSite, deleteSite,
  getJournalBySite, createJournalEntry, deleteJournalEntry,
  getMeetingsBySite, createMeeting, deleteMeeting,
  getIncidentsBySite, createIncident, updateIncident,
  getAllTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember,
  getAllTasks, getTasksByProject, createTask, updateTask, deleteTask,
  getAllTimeEntries, getTimeEntriesByMember, createTimeEntry, deleteTimeEntry,
  getAllInvoices, getInvoicesByClient, createInvoice, updateInvoice, deleteInvoice,
  getAllExpenses, createExpense, deleteExpense,
  getDashboardKPIs,
  upsertUser, getUserByOpenId,
  // Leads
  getAllLeads, getLeadById, createLead, updateLead, deleteLead, convertLeadToClient,
  // Economy
  getCostEstimatesByProject, createCostEstimate, updateCostEstimate,
  getBuildingPermitsByProject, createBuildingPermit, updateBuildingPermit,
  // Gantt
  getGanttTasksByProject, createGanttTask, updateGanttTask,
  // Alerts
  getActiveAlerts, createAlert, acknowledgeAlert, resolveAlert,
  // Enterprises
  getAllEnterprises, createEnterprise, updateEnterprise, deleteEnterprise,
  getSiteEnterprises, addSiteEnterprise,
} from "./db";

const PHASES = ["esq", "aps", "apd", "pro", "dce", "exe", "det", "aor"] as const;

export const appRouter = router({
  system: systemRouter,
  ai: aiRouter,

  // ── Auth ───────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user ?? null),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("aos_session", { path: "/" });
      return { success: true } as const;
    }),
  }),

  // ── Dashboard ──────────────────────────────────────────────
  dashboard: router({
    kpis: publicProcedure.query(() => getDashboardKPIs()),
    recentProjects: publicProcedure.query(async () => {
      const all = await getAllProjects();
      return all.slice(0, 5);
    }),
    urgentTasks: publicProcedure.query(async () => {
      const all = await getAllTasks();
      return all
        .filter(t => t.status !== "done" && (t.priority === "urgent" || t.priority === "high"))
        .slice(0, 5);
    }),
  }),

  // ── Clients ───────────────────────────────────────────────
  clients: router({
    list: publicProcedure.query(() => getAllClients()),
    byId: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getClientById(input.id)),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        type: z.enum(["individual", "company", "public"]).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["prospect", "active", "inactive"]).optional(),
      }))
      .mutation(({ input }) => createClient(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        type: z.enum(["individual", "company", "public"]).optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["prospect", "active", "inactive"]).optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateClient(id, data); }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteClient(input.id)),
    projects: publicProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => getProjectsByClient(input.clientId)),
  }),

  // ── Leads CRM ─────────────────────────────────────────────
  leads: router({
    list: publicProcedure.query(() => getAllLeads()),
    byId: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getLeadById(input.id)),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.enum(["website", "referral", "cold_call", "email", "event", "other"]).optional(),
        value: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => createLead(input)),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]),
      }))
      .mutation(({ input }) => updateLead(input.id, { status: input.status })),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        source: z.enum(["website", "referral", "cold_call", "email", "event", "other"]).optional(),
        status: z.enum(["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
        value: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateLead(id, data); }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteLead(input.id)),
    // Flux Lead → Client
    convertToClient: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => convertLeadToClient(input.id)),
  }),

  // ── Projects ──────────────────────────────────────────────
  projects: router({
    list: publicProcedure.query(() => getAllProjects()),
    byId: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getProjectById(input.id)),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        clientId: z.number().optional(),
        leadId: z.number().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        surface: z.number().optional(),
        currentPhase: z.enum(PHASES).optional(),
        status: z.enum(["active", "on_hold", "completed", "cancelled"]).optional(),
        budgetEstimated: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(({ input }) => createProject(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        clientId: z.number().nullable().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        surface: z.number().optional(),
        currentPhase: z.enum(PHASES).optional(),
        status: z.enum(["active", "on_hold", "completed", "cancelled"]).optional(),
        budgetEstimated: z.number().optional(),
        budgetActual: z.number().optional(),
        progress: z.number().min(0).max(100).optional(),
        startDate: z.date().nullable().optional(),
        endDate: z.date().nullable().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateProject(id, data as any); }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteProject(input.id)),
    phases: publicProcedure.input(z.object({ projectId: z.number() })).query(({ input }) => getProjectPhases(input.projectId)),
    updatePhase: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "skipped"]).optional(),
        startDate: z.date().nullable().optional(),
        endDate: z.date().nullable().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateProjectPhase(id, data as any); }),
    documents: publicProcedure.input(z.object({ projectId: z.number() })).query(({ input }) => getDocumentsByProject(input.projectId)),
    addDocument: publicProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().min(1),
        category: z.enum(["plan", "report", "contract", "permit", "photo", "cctp", "dpgf", "bim", "other"]).optional(),
        phase: z.enum(PHASES).optional(),
        version: z.number().optional(),
        fileUrl: z.string().optional(),
        fileKey: z.string().optional(),
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => createDocument(input)),
    deleteDocument: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteDocument(input.id)),
    comments: publicProcedure.input(z.object({ projectId: z.number() })).query(({ input }) => getCommentsByProject(input.projectId)),
    addComment: publicProcedure
      .input(z.object({ projectId: z.number(), authorName: z.string(), content: z.string() }))
      .mutation(({ input }) => createComment(input)),
    deleteComment: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteComment(input.id)),
    procedures: publicProcedure.input(z.object({ projectId: z.number() })).query(({ input }) => getProceduresByProject(input.projectId)),
    addProcedure: publicProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().min(1),
        type: z.enum(["PC", "DP", "AT", "CU", "ERP", "autre"]).optional(),
        referenceNumber: z.string().optional(),
        status: z.enum(["draft", "submitted", "approved", "rejected", "expired"]).optional(),
        submissionDate: z.date().optional(),
        approvalDate: z.date().optional(),
        expiryDate: z.date().optional(),
        dueDate: z.date().optional(),
        notes: z.string().optional(),
        checklist: z.array(z.object({ id: z.string(), label: z.string(), completed: z.boolean() })).optional(),
      }))
      .mutation(({ input }) => createProcedure(input as any)),
    updateProcedure: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        type: z.enum(["PC", "DP", "AT", "CU", "ERP", "autre"]).optional(),
        status: z.enum(["draft", "submitted", "approved", "rejected", "expired"]).optional(),
        notes: z.string().optional(),
        checklist: z.array(z.object({ id: z.string(), label: z.string(), completed: z.boolean() })).optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateProcedure(id, data as any); }),
    deleteProcedure: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteProcedure(input.id)),
  }),

  // ── Economy ───────────────────────────────────────────────
  economy: router({
    getCostEstimates: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getCostEstimatesByProject(input.projectId)),
    createCostEstimate: publicProcedure
      .input(z.object({
        projectId: z.number(),
        phase: z.enum(PHASES),
        category: z.string().min(1),
        description: z.string().min(1),
        estimatedAmount: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => createCostEstimate(input)),
    updateCostEstimate: publicProcedure
      .input(z.object({
        id: z.number(),
        actualAmount: z.string().optional(),
        status: z.enum(["draft", "approved", "in_progress", "completed"]).optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateCostEstimate(id, data); }),
    getBuildingPermits: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getBuildingPermitsByProject(input.projectId)),
    createBuildingPermit: publicProcedure
      .input(z.object({
        projectId: z.number(),
        referenceNumber: z.string(),
        type: z.string(),
        submissionDate: z.date().optional(),
      }))
      .mutation(({ input }) => createBuildingPermit(input)),
    updateBuildingPermit: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "submitted", "approved", "rejected", "expired"]).optional(),
        approvalDate: z.date().optional(),
        expiryDate: z.date().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateBuildingPermit(id, data); }),
  }),

  // ── Gantt ─────────────────────────────────────────────────
  gantt: router({
    byProject: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getGanttTasksByProject(input.projectId)),
    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        phase: z.enum(PHASES).optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        startDate: z.date(),
        endDate: z.date(),
        assignedTo: z.number().optional(),
      }))
      .mutation(({ input }) => createGanttTask(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["todo", "in_progress", "done", "blocked"]).optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateGanttTask(id, data); }),
  }),

  // ── Sites / Chantiers ─────────────────────────────────────
  sites: router({
    list: publicProcedure.query(() => getAllSites()),
    byId: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getSiteById(input.id)),
    byProject: publicProcedure.input(z.object({ projectId: z.number() })).query(({ input }) => getSitesByProject(input.projectId)),
    create: publicProcedure
      .input(z.object({
        projectId: z.number(),
        name: z.string().min(1),
        address: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["planning", "active", "paused", "completed"]).optional(),
      }))
      .mutation(({ input }) => createSite(input as any)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        progress: z.number().min(0).max(100).optional(),
        status: z.enum(["planning", "active", "paused", "completed"]).optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateSite(id, data as any); }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteSite(input.id)),
    journal: publicProcedure.input(z.object({ siteId: z.number() })).query(({ input }) => getJournalBySite(input.siteId)),
    addJournalEntry: publicProcedure
      .input(z.object({
        siteId: z.number(),
        date: z.date(),
        weather: z.string().optional(),
        workDescription: z.string().min(1),
        workers: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => createJournalEntry({ ...input, photos: [] })),
    deleteJournalEntry: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteJournalEntry(input.id)),
    meetings: publicProcedure.input(z.object({ siteId: z.number() })).query(({ input }) => getMeetingsBySite(input.siteId)),
    addMeeting: publicProcedure
      .input(z.object({
        siteId: z.number(),
        date: z.date(),
        title: z.string().min(1),
        attendees: z.array(z.string()).optional(),
        summary: z.string().optional(),
        decisions: z.array(z.string()).optional(),
        nextActions: z.array(z.object({ action: z.string(), responsible: z.string(), dueDate: z.string().optional() })).optional(),
      }))
      .mutation(({ input }) => createMeeting(input as any)),
    deleteMeeting: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteMeeting(input.id)),
    incidents: publicProcedure.input(z.object({ siteId: z.number() })).query(({ input }) => getIncidentsBySite(input.siteId)),
    addIncident: publicProcedure
      .input(z.object({
        siteId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        date: z.date(),
      }))
      .mutation(({ input }) => createIncident({ ...input, status: "open" } as any)),
    updateIncident: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved"]).optional(),
        resolution: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateIncident(id, data); }),
    // Entreprises affectées
    enterprises: publicProcedure.input(z.object({ siteId: z.number() })).query(({ input }) => getSiteEnterprises(input.siteId)),
    addEnterprise: publicProcedure
      .input(z.object({
        siteId: z.number(),
        enterpriseId: z.number(),
        lot: z.string().optional(),
        contractAmount: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(({ input }) => addSiteEnterprise(input)),
  }),

  // ── Enterprises (sous-traitants) ──────────────────────────
  enterprises: router({
    list: publicProcedure.query(() => getAllEnterprises()),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        trade: z.string().min(1),
        siret: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        contactName: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => createEnterprise(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        trade: z.string().optional(),
        status: z.enum(["active", "inactive", "blacklisted"]).optional(),
        rating: z.number().min(1).max(5).optional(),
        notes: z.string().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateEnterprise(id, data); }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteEnterprise(input.id)),
  }),

  // ── Team ──────────────────────────────────────────────────
  team: router({
    list: publicProcedure.query(() => getAllTeamMembers()),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        role: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        hourlyRate: z.number().optional(),
      }))
      .mutation(({ input }) => createTeamMember(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        role: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        hourlyRate: z.number().optional(),
        active: z.boolean().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateTeamMember(id, data); }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteTeamMember(input.id)),
  }),

  // ── Tasks ─────────────────────────────────────────────────
  tasks: router({
    list: publicProcedure.query(() => getAllTasks()),
    byProject: publicProcedure.input(z.object({ projectId: z.number() })).query(({ input }) => getTasksByProject(input.projectId)),
    create: publicProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        projectId: z.number().optional(),
        assigneeId: z.number().optional(),
        phase: z.enum(PHASES).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
        dueDate: z.date().optional(),
        estimatedHours: z.number().optional(),
      }))
      .mutation(({ input }) => createTask(input as any)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        assigneeId: z.number().nullable().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
        dueDate: z.date().nullable().optional(),
        estimatedHours: z.number().optional(),
        actualHours: z.number().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateTask(id, data as any); }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteTask(input.id)),
  }),

  // ── Time Entries ──────────────────────────────────────────
  timeEntries: router({
    list: publicProcedure.query(() => getAllTimeEntries()),
    byMember: publicProcedure.input(z.object({ memberId: z.number() })).query(({ input }) => getTimeEntriesByMember(input.memberId)),
    create: publicProcedure
      .input(z.object({
        memberId: z.number(),
        projectId: z.number().optional(),
        taskId: z.number().optional(),
        date: z.date(),
        hours: z.number().positive(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => createTimeEntry(input as any)),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteTimeEntry(input.id)),
  }),

  // ── Invoices ──────────────────────────────────────────────
  invoices: router({
    list: publicProcedure.query(() => getAllInvoices()),
    byClient: publicProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => getInvoicesByClient(input.clientId)),
    create: publicProcedure
      .input(z.object({
        clientId: z.number(),
        projectId: z.number().optional(),
        number: z.string().min(1),
        amount: z.number().positive(),
        status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        items: z.array(z.object({
          description: z.string(),
          quantity: z.number(),
          unitPrice: z.number(),
          total: z.number(),
        })).optional(),
      }))
      .mutation(({ input }) => createInvoice(input as any)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
        amount: z.number().optional(),
        description: z.string().optional(),
        dueDate: z.date().nullable().optional(),
        paidDate: z.date().nullable().optional(),
      }))
      .mutation(({ input }) => { const { id, ...data } = input; return updateInvoice(id, data as any); }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteInvoice(input.id)),
  }),

  // ── Expenses ──────────────────────────────────────────────
  expenses: router({
    list: publicProcedure.query(() => getAllExpenses()),
    create: publicProcedure
      .input(z.object({
        projectId: z.number().optional(),
        category: z.string().min(1),
        description: z.string().min(1),
        amount: z.number().positive(),
        date: z.date(),
      }))
      .mutation(({ input }) => createExpense(input as any)),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteExpense(input.id)),
  }),

  // ── Alerts ────────────────────────────────────────────────
  alerts: router({
    active: publicProcedure.query(() => getActiveAlerts()),
    create: publicProcedure
      .input(z.object({
        projectId: z.number().optional(),
        type: z.enum(["budget_overrun", "schedule_delay", "permit_expiry", "deliverable_pending", "team_alert", "phase_transition"]),
        severity: z.enum(["low", "medium", "high", "critical"]),
        title: z.string(),
        description: z.string().optional(),
      }))
      .mutation(({ input }) => createAlert(input)),
    acknowledge: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => acknowledgeAlert(input.id)),
    resolve: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => resolveAlert(input.id)),
  }),

  // ── File Upload ───────────────────────────────────────────
  upload: router({
    getUploadUrl: publicProcedure
      .input(z.object({ filename: z.string(), mimeType: z.string(), size: z.number() }))
      .mutation(async ({ input }) => {
        const ext = input.filename.split(".").pop() ?? "bin";
        const key = `archios/docs/${nanoid()}.${ext}`;
        const { url } = await storagePut(key, Buffer.alloc(0), input.mimeType);
        return { key, url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
