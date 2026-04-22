export const PHASE_LABELS: Record<string, string> = {
  esq: "ESQ — Esquisse",
  aps: "APS — Avant-Projet Sommaire",
  apd: "APD — Avant-Projet Définitif",
  pro: "PRO — Projet",
  dce: "DCE — Dossier de Consultation des Entreprises",
  exe: "EXE — Études d'Exécution",
  det: "DET — Direction de l'Exécution des Travaux",
  aor: "AOR — Assistance aux Opérations de Réception",
};

export const PHASE_ORDER = [
  "esq", "aps", "apd", "pro", "dce", "exe", "det", "aor"
] as const;

export const STATUS_LABELS: Record<string, string> = {
  active: "En cours",
  on_hold: "En attente",
  completed: "Terminé",
  cancelled: "Annulé",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  urgent: "Urgent",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "À faire",
  in_progress: "En cours",
  review: "En révision",
  done: "Terminé",
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyée",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
};

export const SITE_STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  completed: "Terminé",
  suspended: "Suspendu",
};

export const CLIENT_TYPE_LABELS: Record<string, string> = {
  individual: "Particulier",
  company: "Entreprise",
  public: "Collectivité",
};

export const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  plan: "Plan",
  report: "Rapport",
  contract: "Contrat",
  permit: "Permis",
  photo: "Photo",
  other: "Autre",
};

export const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  critical: "Critique",
};

export const PROCEDURE_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  approved: "Approuvé",
  rejected: "Rejeté",
  expired: "Expiré",
};

export function formatCurrency(amount: number | string | null | undefined): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(numericAmount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine(s)`;
  return formatDate(date);
}

export function getPhaseColor(phase: string): string {
  const colors: Record<string, string> = {
    esq: "bg-purple-100 text-purple-700 border-purple-200",
    aps: "bg-blue-100 text-blue-700 border-blue-200",
    apd: "bg-cyan-100 text-cyan-700 border-cyan-200",
    pro: "bg-teal-100 text-teal-700 border-teal-200",
    dce: "bg-green-100 text-green-700 border-green-200",
    exe: "bg-yellow-100 text-yellow-700 border-yellow-200",
    det: "bg-orange-100 text-orange-700 border-orange-200",
    aor: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  return colors[phase] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    on_hold: "bg-yellow-100 text-yellow-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    urgent: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-600",
  };
  return colors[priority] ?? "bg-gray-100 text-gray-600";
}

export function getInvoiceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-400",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

export function getSiteStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-600",
    suspended: "bg-yellow-100 text-yellow-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

export function getIncidentSeverityColor(severity: string): string {
  const colors: Record<string, string> = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };
  return colors[severity] ?? "bg-gray-100 text-gray-600";
}

export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}
