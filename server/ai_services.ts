import { invokeLLM } from "./_core/llm";
import * as crmDb from "./db_crm";

// ============================================================
// AI-Powered Document Generation
// ============================================================

export async function generateProjectReport(projectId: number, projectData: any) {
  const prompt = `
    Générez un rapport professionnel pour le projet architectural suivant:
    
    Nom du projet: ${projectData.name}
    Type: ${projectData.type}
    Adresse: ${projectData.address}
    Phase actuelle: ${projectData.currentPhase}
    Budget estimé: ${projectData.budgetEstimated}€
    Progression: ${projectData.progress}%
    
    Le rapport doit inclure:
    1. Résumé exécutif
    2. Description du projet
    3. État d'avancement
    4. Risques identifiés
    5. Recommandations
    
    Format: Markdown professionnel
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Vous êtes un expert en gestion de projets architecturaux. Générez des rapports professionnels et détaillés.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = typeof response.choices[0]?.message.content === "string" 
    ? response.choices[0].message.content 
    : "";

  // Save to database
  await crmDb.createAIContent({
    organizationId: projectData.organizationId,
    projectId,
    type: "report",
    title: `Rapport de Projet - ${projectData.name}`,
    content,
    prompt,
    status: "draft",
  });

  return content;
}

// ============================================================
// CCTP Generation (Cahier des Charges Techniques)
// ============================================================

export async function generateCCTP(projectId: number, projectData: any, costEstimates: any[]) {
  const estimatesText = costEstimates
    .map((est) => `- ${est.category}: ${est.description} - ${est.estimatedAmount}€`)
    .join("\n");

  const prompt = `
    Générez un Cahier des Charges Techniques (CCTP) complet pour le projet suivant:
    
    Projet: ${projectData.name}
    Type: ${projectData.type}
    Localisation: ${projectData.address}
    Budget total: ${projectData.budgetEstimated}€
    
    Estimations de coûts:
    ${estimatesText}
    
    Le CCTP doit inclure:
    1. Objet et périmètre des travaux
    2. Prescriptions techniques générales
    3. Prescriptions techniques particulières par corps de métier
    4. Normes et réglementations applicables
    5. Contrôles et réception des travaux
    6. Délais et planification
    7. Modalités de facturation
    
    Format: Document technique professionnel
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Vous êtes un expert en rédaction de cahiers des charges techniques pour projets architecturaux.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = typeof response.choices[0]?.message.content === "string" 
    ? response.choices[0].message.content 
    : "";

  await crmDb.createAIContent({
    organizationId: projectData.organizationId,
    projectId,
    type: "cctp",
    title: `CCTP - ${projectData.name}`,
    content,
    prompt,
    status: "draft",
  });

  return content;
}

// ============================================================
// Meeting Notes Generation
// ============================================================

export async function generateMeetingNotes(
  organizationId: number,
  projectId: number,
  meetingTranscript: string,
  participants: string[]
) {
  const prompt = `
    Générez un compte-rendu de réunion professionnel basé sur la transcription suivante:
    
    Participants: ${participants.join(", ")}
    
    Transcription:
    ${meetingTranscript}
    
    Le compte-rendu doit inclure:
    1. Date et participants
    2. Ordre du jour
    3. Points discutés et décisions prises
    4. Actions à mener (avec responsables et délais)
    5. Prochaine réunion
    
    Format: Markdown structuré
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Vous êtes un expert en rédaction de comptes-rendus de réunion. Soyez concis et structuré.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = typeof response.choices[0]?.message.content === "string" 
    ? response.choices[0].message.content 
    : "";

  await crmDb.createAIContent({
    organizationId,
    projectId,
    type: "meeting_notes",
    title: `Compte-rendu de réunion - ${new Date().toLocaleDateString("fr-FR")}`,
    content,
    prompt,
    status: "draft",
  });

  return content;
}

// ============================================================
// Intelligent Cost Estimation
// ============================================================

export async function estimateProjectCosts(projectData: any, projectHistory: any[]) {
  const historyContext = projectHistory
    .slice(0, 5)
    .map((p) => `${p.type}: ${p.budgetEstimated}€ → ${p.budgetActual}€`)
    .join("\n");

  const prompt = `
    Estimez les coûts pour le projet architectural suivant en utilisant les données historiques:
    
    Projet: ${projectData.name}
    Type: ${projectData.type}
    Surface: ${projectData.surface || "Non spécifiée"}
    Localisation: ${projectData.address}
    Phase: ${projectData.currentPhase}
    
    Données historiques similaires:
    ${historyContext}
    
    Fournissez:
    1. Estimation détaillée par catégorie (structure, MEP, finitions, etc.)
    2. Coût au m² estimé
    3. Facteurs de risque
    4. Marge de contingence recommandée (en %)
    5. Comparaison avec les projets similaires
    
    Format: JSON structuré avec les champs: categories (array), costPerM2, riskFactors (array), contingencyMargin, notes
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Vous êtes un expert en estimation de coûts de construction. Fournissez des estimations réalistes basées sur les données historiques.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "cost_estimation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  estimatedAmount: { type: "number" },
                  percentage: { type: "number" },
                },
                required: ["name", "estimatedAmount", "percentage"],
              },
            },
            costPerM2: { type: "number" },
            contingencyMargin: { type: "number" },
            totalEstimate: { type: "number" },
            notes: { type: "string" },
          },
          required: ["categories", "costPerM2", "contingencyMargin", "totalEstimate"],
        },
      },
    },
  });

  const contentStr = typeof response.choices[0]?.message.content === "string" 
    ? response.choices[0].message.content 
    : "{}";
  const estimation = JSON.parse(contentStr);

  await crmDb.createAIContent({
    organizationId: projectData.organizationId,
    projectId: projectData.id,
    type: "cost_estimate",
    title: `Estimation de coûts - ${projectData.name}`,
    content: JSON.stringify(estimation, null, 2),
    prompt,
    status: "draft",
  });

  return estimation;
}

// ============================================================
// Schedule Delay Detection
// ============================================================

export async function detectScheduleDelays(projectId: number, ganttTasks: any[]) {
  const tasksContext = ganttTasks
    .map((task) => {
      const daysOverdue = Math.max(
        0,
        Math.floor((new Date().getTime() - new Date(task.endDate).getTime()) / (1000 * 60 * 60 * 24))
      );
      return `${task.title}: ${task.progress}% complété, fin prévue ${task.endDate}, ${daysOverdue} jours de retard`;
    })
    .join("\n");

  const prompt = `
    Analysez le planning du projet et identifiez les retards potentiels:
    
    Tâches du projet:
    ${tasksContext}
    
    Fournissez:
    1. Liste des tâches en retard
    2. Tâches à risque (proches du retard)
    3. Impact sur la date de fin du projet
    4. Recommandations pour rattraper les retards
    5. Tâches critiques à surveiller
    
    Format: JSON structuré
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Vous êtes un expert en gestion de projets. Analysez les plannings et identifiez les risques de retard.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "schedule_analysis",
        strict: true,
        schema: {
          type: "object",
          properties: {
            delayedTasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  taskId: { type: "number" },
                  daysOverdue: { type: "number" },
                  impact: { type: "string" },
                },
              },
            },
            atRiskTasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  taskId: { type: "number" },
                  riskLevel: { type: "string" },
                  recommendation: { type: "string" },
                },
              },
            },
            projectImpact: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
          },
          required: ["delayedTasks", "atRiskTasks", "projectImpact", "recommendations"],
        },
      },
    },
  });

  const contentStr = typeof response.choices[0]?.message.content === "string" 
    ? response.choices[0].message.content 
    : "{}";
  const analysis = JSON.parse(contentStr);

  // Create alerts for delayed tasks
  if (analysis.delayedTasks && Array.isArray(analysis.delayedTasks)) {
    for (const delayedTask of analysis.delayedTasks) {
      await crmDb.createAlert({
        organizationId: 0, // Will be set by caller
        projectId,
        type: "schedule_delay",
        severity: delayedTask.daysOverdue > 7 ? "high" : "medium",
        title: `Retard détecté sur tâche`,
        description: `${delayedTask.daysOverdue} jours de retard - Impact: ${delayedTask.impact}`,
      });
    }
  }

  return analysis;
}

// ============================================================
// Budget Overrun Detection
// ============================================================

export async function detectBudgetOverruns(projectId: number, costEstimates: any[]) {
  const overruns = costEstimates.filter(
    (est) => est.actualAmount && parseFloat(est.actualAmount) > parseFloat(est.estimatedAmount)
  );

  if (overruns.length === 0) {
    return { status: "ok", message: "Aucun dépassement détecté" };
  }

  const totalOverrun = overruns.reduce(
    (sum, est) => sum + (parseFloat(est.actualAmount) - parseFloat(est.estimatedAmount)),
    0
  );

  const overrunPercentage = (totalOverrun / costEstimates.reduce((sum, est) => sum + parseFloat(est.estimatedAmount), 0)) * 100;

  // Create alert if overrun > 5%
  if (overrunPercentage > 5) {
    await crmDb.createAlert({
      organizationId: 0, // Will be set by caller
      projectId,
      type: "budget_overrun",
      severity: overrunPercentage > 15 ? "critical" : "high",
      title: `Dépassement budgétaire détecté`,
      description: `Dépassement de ${overrunPercentage.toFixed(1)}% (${totalOverrun.toFixed(2)}€)`,
    });
  }

  return {
    status: "overrun_detected",
    totalOverrun,
    overrunPercentage,
    affectedCategories: overruns.map((est) => est.category),
  };
}

// ============================================================
// Project Recommendations
// ============================================================

export async function generateProjectRecommendations(projectId: number, projectData: any, metrics: any) {
  const prompt = `
    Analysez le projet architectural et fournissez des recommandations d'optimisation:
    
    Projet: ${projectData.name}
    Type: ${projectData.type}
    Phase: ${projectData.currentPhase}
    Progression: ${projectData.progress}%
    Budget utilisé: ${metrics.budgetUsed}%
    Délai utilisé: ${metrics.scheduleUsed}%
    
    Fournissez:
    1. Optimisations possibles (coûts, délais, qualité)
    2. Risques identifiés et mitigation
    3. Opportunités d'amélioration
    4. Bonnes pratiques applicables
    5. Actions prioritaires
    
    Format: Markdown structuré
  `;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "Vous êtes un consultant expert en gestion de projets architecturaux. Fournissez des recommandations pratiques et réalistes.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = typeof response.choices[0]?.message.content === "string" 
    ? response.choices[0].message.content 
    : "";

  await crmDb.createAIContent({
    organizationId: projectData.organizationId,
    projectId,
    type: "recommendation",
    title: `Recommandations - ${projectData.name}`,
    content,
    prompt,
    status: "draft",
  });

  return content;
}
