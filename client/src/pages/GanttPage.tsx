import { useState } from "react";
import { EnhancedLayout } from "@/components/EnhancedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";

interface GanttTask {
  id: string;
  name: string;
  phase: string;
  startDate: string;
  endDate: string;
  duration: number;
  progress: number;
  assignee: string;
  status: "not_started" | "in_progress" | "completed" | "delayed";
  dependencies: string[];
}

const MOCK_TASKS: GanttTask[] = [
  {
    id: "1",
    name: "Esquisse (ESQ)",
    phase: "ESQ",
    startDate: "2026-01-15",
    endDate: "2026-02-15",
    duration: 31,
    progress: 100,
    assignee: "Jean Dupont",
    status: "completed",
    dependencies: [],
  },
  {
    id: "2",
    name: "Avant-Projet Sommaire (APS)",
    phase: "APS",
    startDate: "2026-02-16",
    endDate: "2026-03-15",
    duration: 28,
    progress: 100,
    assignee: "Marie Martin",
    status: "completed",
    dependencies: ["1"],
  },
  {
    id: "3",
    name: "Avant-Projet Détaillé (APD)",
    phase: "APD",
    startDate: "2026-03-16",
    endDate: "2026-04-30",
    duration: 45,
    progress: 65,
    assignee: "Pierre Leclerc",
    status: "in_progress",
    dependencies: ["2"],
  },
  {
    id: "4",
    name: "Projet (PRO)",
    phase: "PRO",
    startDate: "2026-05-01",
    endDate: "2026-06-15",
    duration: 45,
    progress: 0,
    assignee: "Sophie Bernard",
    status: "not_started",
    dependencies: ["3"],
  },
  {
    id: "5",
    name: "Dossier de Consultation (DCE)",
    phase: "DCE",
    startDate: "2026-06-16",
    endDate: "2026-07-31",
    duration: 45,
    progress: 0,
    assignee: "Thomas Rousseau",
    status: "not_started",
    dependencies: ["4"],
  },
  {
    id: "6",
    name: "Exécution (EXE)",
    phase: "EXE",
    startDate: "2026-08-01",
    endDate: "2026-11-30",
    duration: 122,
    progress: 0,
    assignee: "Jean Dupont",
    status: "not_started",
    dependencies: ["5"],
  },
];

const STATUS_COLORS: Record<string, string> = {
  not_started: "bg-gray-200",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  delayed: "bg-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  not_started: "Non commencé",
  in_progress: "En cours",
  completed: "Complété",
  delayed: "En retard",
};

function calculateGanttPosition(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const projectStart = new Date("2026-01-15");
  const projectEnd = new Date("2026-11-30");

  const totalDays = (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
  const taskStart = (start.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24);
  const taskDuration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  const leftPercent = (taskStart / totalDays) * 100;
  const widthPercent = (taskDuration / totalDays) * 100;

  return { leftPercent, widthPercent };
}

export default function GanttPage() {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(["1", "2", "3"]));
  const [tasks, setTasks] = useState<GanttTask[]>(MOCK_TASKS);

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const projectProgress = Math.round(
    tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
  );

  return (
    <EnhancedLayout title="Planning Gantt">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Planification interactive avec dépendances et suivi de progression
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Tâche
          </Button>
        </div>

        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Durée Totale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">321 jours</div>
              <p className="text-xs text-muted-foreground">Jan 2026 - Nov 2026</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progression Globale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectProgress}%</div>
              <p className="text-xs text-muted-foreground">du projet complété</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tâches Actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter((t) => t.status === "in_progress").length}
              </div>
              <p className="text-xs text-muted-foreground">en cours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tâches en Retard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter((t) => t.status === "delayed").length}
              </div>
              <p className="text-xs text-muted-foreground">à vérifier</p>
            </CardContent>
          </Card>
        </div>

        {/* Gantt Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Diagramme de Gantt</CardTitle>
            <CardDescription>Timeline du projet avec phases architecturales</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div className="min-w-max">
              {/* Timeline Header */}
              <div className="flex mb-4">
                <div className="w-64 flex-shrink-0"></div>
                <div className="flex-1 flex gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex-1 text-center text-xs font-medium text-muted-foreground border-l border-border">
                      {["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"][i]}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-2">
                {tasks.map((task) => {
                  const { leftPercent, widthPercent } = calculateGanttPosition(task.startDate, task.endDate);
                  const hasDependencies = task.dependencies.length > 0;

                  return (
                    <div key={task.id}>
                      <div className="flex items-center gap-2">
                        {hasDependencies && (
                          <button
                            onClick={() => toggleExpanded(task.id)}
                            className="w-6 h-6 flex items-center justify-center"
                          >
                            {expandedTasks.has(task.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <div className="w-64 flex-shrink-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{task.name}</p>
                              <p className="text-xs text-muted-foreground">{task.assignee}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 relative h-8 bg-gray-100 rounded">
                          <div
                            className={`absolute h-full rounded flex items-center justify-center text-white text-xs font-medium ${
                              STATUS_COLORS[task.status]
                            }`}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                          >
                            {task.progress > 0 && `${task.progress}%`}
                          </div>
                        </div>
                      </div>

                      {/* Dependencies */}
                      {expandedTasks.has(task.id) && hasDependencies && (
                        <div className="ml-8 mt-2 pl-4 border-l-2 border-blue-300 space-y-2">
                          {task.dependencies.map((depId) => {
                            const depTask = tasks.find((t) => t.id === depId);
                            if (!depTask) return null;
                            return (
                              <div key={depId} className="text-xs text-muted-foreground">
                                ↳ Dépend de: <span className="font-medium">{depTask.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Details */}
        <Card>
          <CardHeader>
            <CardTitle>Détails des Tâches</CardTitle>
            <CardDescription>Liste complète avec statuts et assignations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{task.name}</h3>
                      <Badge className={`${STATUS_COLORS[task.status]} text-white`}>
                        {STATUS_LABELS[task.status]}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{task.progress}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">Dates</p>
                      <p>{task.startDate} → {task.endDate}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Durée</p>
                      <p>{task.duration} jours</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Assigné à</p>
                      <p>{task.assignee}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phase</p>
                      <p>{task.phase}</p>
                    </div>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </EnhancedLayout>
  );
}
