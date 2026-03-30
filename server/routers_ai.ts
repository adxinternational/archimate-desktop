import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import * as aiServices from "./ai_services";

// ============================================================
// AI Router
// ============================================================

export const aiRouter = router({
  // Generate Project Report
  generateProjectReport: publicProcedure
    .input(z.object({
      projectId: z.number(),
      projectData: z.object({
        organizationId: z.number(),
        name: z.string(),
        type: z.string().optional(),
        address: z.string().optional(),
        currentPhase: z.string(),
        budgetEstimated: z.string(),
        progress: z.number(),
      }),
    }))
    .mutation(({ input }) =>
      aiServices.generateProjectReport(input.projectId, input.projectData)
    ),

  // Generate CCTP
  generateCCTP: publicProcedure
    .input(z.object({
      projectId: z.number(),
      projectData: z.object({
        organizationId: z.number(),
        name: z.string(),
        type: z.string(),
        address: z.string(),
        budgetEstimated: z.string(),
      }),
      costEstimates: z.array(z.object({
        category: z.string(),
        description: z.string(),
        estimatedAmount: z.string(),
      })),
    }))
    .mutation(({ input }) =>
      aiServices.generateCCTP(input.projectId, input.projectData, input.costEstimates)
    ),

  // Generate Meeting Notes
  generateMeetingNotes: publicProcedure
    .input(z.object({
      organizationId: z.number(),
      projectId: z.number(),
      meetingTranscript: z.string(),
      participants: z.array(z.string()),
    }))
    .mutation(({ input }) =>
      aiServices.generateMeetingNotes(
        input.organizationId,
        input.projectId,
        input.meetingTranscript,
        input.participants
      )
    ),

  // Estimate Project Costs
  estimateProjectCosts: publicProcedure
    .input(z.object({
      projectId: z.number(),
      projectData: z.object({
        organizationId: z.number(),
        id: z.number(),
        name: z.string(),
        type: z.string(),
        surface: z.string().optional(),
        address: z.string(),
        currentPhase: z.string(),
      }),
      projectHistory: z.array(z.object({
        type: z.string(),
        budgetEstimated: z.string(),
        budgetActual: z.string(),
      })),
    }))
    .mutation(({ input }) =>
      aiServices.estimateProjectCosts(input.projectData, input.projectHistory)
    ),

  // Detect Schedule Delays
  detectScheduleDelays: publicProcedure
    .input(z.object({
      projectId: z.number(),
      ganttTasks: z.array(z.object({
        id: z.number(),
        title: z.string(),
        progress: z.number(),
        endDate: z.date(),
      })),
    }))
    .mutation(({ input }) =>
      aiServices.detectScheduleDelays(input.projectId, input.ganttTasks)
    ),

  // Detect Budget Overruns
  detectBudgetOverruns: publicProcedure
    .input(z.object({
      projectId: z.number(),
      costEstimates: z.array(z.object({
        category: z.string(),
        estimatedAmount: z.string(),
        actualAmount: z.string().optional(),
      })),
    }))
    .mutation(({ input }) =>
      aiServices.detectBudgetOverruns(input.projectId, input.costEstimates)
    ),

  // Generate Project Recommendations
  generateRecommendations: publicProcedure
    .input(z.object({
      projectId: z.number(),
      projectData: z.object({
        organizationId: z.number(),
        name: z.string(),
        type: z.string(),
        currentPhase: z.string(),
        progress: z.number(),
      }),
      metrics: z.object({
        budgetUsed: z.number(),
        scheduleUsed: z.number(),
      }),
    }))
    .mutation(({ input }) =>
      aiServices.generateProjectRecommendations(
        input.projectId,
        input.projectData,
        input.metrics
      )
    ),
});
