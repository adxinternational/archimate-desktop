import { useState } from "react";
import { EnhancedLayout } from "@/components/EnhancedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, AlertTriangle, CheckCircle, Clock, Users, Wrench, FileText } from "lucide-react";

interface DailyLog {
  id: string;
  date: string;
  weather: string;
  temperature: string;
  workersPresent: number;
  tasksCompleted: string[];
  incidents: string[];
  notes: string;
  photos: number;
  reportedBy: string;
}

interface Incident {
  id: string;
  date: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  status: "open" | "in_progress" | "resolved";
  assignedTo: string;
}

const MOCK_LOGS: DailyLog[] = [
  {
    id: "1",
    date: "2026-03-28",
    weather: "Ensoleillé",
    temperature: "18°C",
    workersPresent: 12,
    tasksCompleted: ["Coulage béton étage 2", "Mise en place des coffrages"],
    incidents: [],
    notes: "Bonne progression. Tous les ouvriers présents.",
    photos: 8,
    reportedBy: "Jean Dupont",
  },
  {
    id: "2",
    date: "2026-03-27",
    weather: "Nuageux",
    temperature: "16°C",
    workersPresent: 10,
    tasksCompleted: ["Préparation des armatures", "Nettoyage du site"],
    incidents: ["Retard livraison ciment"],
    notes: "Retard de 2h sur la livraison des matériaux.",
    photos: 5,
    reportedBy: "Marie Martin",
  },
  {
    id: "3",
    date: "2026-03-26",
    weather: "Pluie",
    temperature: "14°C",
    workersPresent: 8,
    tasksCompleted: ["Excavation fondations"],
    incidents: ["Mauvais temps"],
    notes: "Travaux ralentis à cause de la pluie.",
    photos: 3,
    reportedBy: "Pierre Leclerc",
  },
];

const MOCK_INCIDENTS: Incident[] = [
  {
    id: "1",
    date: "2026-03-28",
    title: "Retard livraison ciment",
    severity: "medium",
    description: "Le ciment n'est arrivé qu'à 10h au lieu de 8h",
    status: "resolved",
    assignedTo: "Jean Dupont",
  },
  {
    id: "2",
    date: "2026-03-25",
    title: "Problème d'équipement",
    severity: "high",
    description: "La grue est tombée en panne. Réparation en cours.",
    status: "in_progress",
    assignedTo: "Marie Martin",
  },
  {
    id: "3",
    date: "2026-03-20",
    title: "Accident mineur",
    severity: "low",
    description: "Petit accident sans blessure grave. Premiers secours appliqués.",
    status: "resolved",
    assignedTo: "Pierre Leclerc",
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
};

export default function SiteManagement() {
  const [logs, setLogs] = useState<DailyLog[]>(MOCK_LOGS);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [activeTab, setActiveTab] = useState<"logs" | "incidents">("logs");

  const totalWorkers = logs.reduce((sum, log) => sum + log.workersPresent, 0);
  const averageWorkers = Math.round(totalWorkers / logs.length);
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((i) => i.status === "open").length;

  return (
    <EnhancedLayout title="Gestion de Chantier">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Suivi quotidien du chantier, journal de bord et gestion des incidents
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Journal
          </Button>
        </div>

        {/* Site Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Ouvriers Moyens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageWorkers}</div>
              <p className="text-xs text-muted-foreground">par jour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Journaux Enregistrés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-muted-foreground">derniers jours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Incidents Totaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIncidents}</div>
              <p className="text-xs text-muted-foreground">{openIncidents} ouvert{openIncidents > 1 ? "s" : ""}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Tâches Complétées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.reduce((sum, log) => sum + log.tasksCompleted.length, 0)}</div>
              <p className="text-xs text-muted-foreground">au total</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === "logs" ? "default" : "ghost"}
            onClick={() => setActiveTab("logs")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
          >
            <FileText className="mr-2 h-4 w-4" />
            Journal de Bord
          </Button>
          <Button
            variant={activeTab === "incidents" ? "default" : "ghost"}
            onClick={() => setActiveTab("incidents")}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Incidents
          </Button>
        </div>

        {/* Daily Logs */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{log.date}</h3>
                        <p className="text-sm text-muted-foreground">Rapporté par {log.reportedBy}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{log.weather}</p>
                        <p className="text-sm text-muted-foreground">{log.temperature}</p>
                      </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Ouvriers Présents</p>
                        <p className="text-2xl font-bold text-blue-600">{log.workersPresent}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Tâches Complétées</p>
                        <p className="text-2xl font-bold text-green-600">{log.tasksCompleted.length}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Photos</p>
                        <p className="text-2xl font-bold text-purple-600">{log.photos}</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Incidents</p>
                        <p className="text-2xl font-bold text-orange-600">{log.incidents.length}</p>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div>
                      <p className="font-medium mb-2">Tâches Complétées</p>
                      <ul className="space-y-1">
                        {log.tasksCompleted.map((task, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Notes */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm mb-1">Notes</p>
                      <p className="text-sm text-muted-foreground">{log.notes}</p>
                    </div>

                    {/* Incidents */}
                    {log.incidents.length > 0 && (
                      <div>
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-600" />
                          Incidents Signalés
                        </p>
                        <ul className="space-y-1">
                          {log.incidents.map((incident, idx) => (
                            <li key={idx} className="text-sm text-orange-600">
                              • {incident}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Incidents */}
        {activeTab === "incidents" && (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{incident.title}</h3>
                        <Badge className={SEVERITY_COLORS[incident.severity]}>
                          {incident.severity === "low"
                            ? "Faible"
                            : incident.severity === "medium"
                            ? "Moyen"
                            : incident.severity === "high"
                            ? "Élevé"
                            : "Critique"}
                        </Badge>
                        <Badge className={STATUS_COLORS[incident.status]}>
                          {incident.status === "open"
                            ? "Ouvert"
                            : incident.status === "in_progress"
                            ? "En cours"
                            : "Résolu"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{incident.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>📅 {incident.date}</span>
                        <span>👤 {incident.assignedTo}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiques du Chantier</CardTitle>
            <CardDescription>Résumé des performances et incidents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Jours Travaillés</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Tâches Complétées</p>
                <p className="text-2xl font-bold">{logs.reduce((sum, log) => sum + log.tasksCompleted.length, 0)}</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Incidents Résolus</p>
                <p className="text-2xl font-bold">{incidents.filter((i) => i.status === "resolved").length}</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Photos Prises</p>
                <p className="text-2xl font-bold">{logs.reduce((sum, log) => sum + log.photos, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnhancedLayout>
  );
}
