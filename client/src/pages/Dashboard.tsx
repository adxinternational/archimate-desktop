import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FolderOpen, Users, AlertTriangle, Clock, TrendingUp, Euro,
  Plus, ArrowRight, CheckCircle2, Circle, Timer, AlertCircle
} from "lucide-react";
import { formatCurrency, formatDate, getPhaseColor, getStatusColor, getPriorityColor, PHASE_LABELS, STATUS_LABELS, PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Mock chart data (à remplacer par des données réelles)
const revenueData = [
  { month: "Oct", revenus: 18000, dépenses: 12000 },
  { month: "Nov", revenus: 22000, dépenses: 14000 },
  { month: "Déc", revenus: 19000, dépenses: 11000 },
  { month: "Jan", revenus: 25000, dépenses: 15000 },
  { month: "Fév", revenus: 28000, dépenses: 16000 },
  { month: "Mar", revenus: 31000, dépenses: 18000 },
];

function KPICard({ title, value, icon: Icon, color, subtitle }: {
  title: string; value: string | number; icon: React.ElementType;
  color: string; subtitle?: string;
}) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskStatusIcon({ status }: { status: string }) {
  if (status === "done") return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === "in_progress") return <Timer className="w-4 h-4 text-blue-500" />;
  if (status === "review") return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  return <Circle className="w-4 h-4 text-muted-foreground" />;
}

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = trpc.dashboard.kpis.useQuery();
  const { data: recentProjects, isLoading: projectsLoading } = trpc.dashboard.recentProjects.useQuery();
  const { data: urgentTasks, isLoading: tasksLoading } = trpc.dashboard.urgentTasks.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/projets/nouveau">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau projet
            </Button>
          </Link>
          <Link href="/clients/nouveau">
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau client
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpisLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KPICard
              title="Projets actifs"
              value={kpis?.activeProjects ?? 0}
              icon={FolderOpen}
              color="bg-blue-100 text-blue-600"
              subtitle="en cours de réalisation"
            />
            <KPICard
              title="Budget total"
              value={formatCurrency(kpis?.totalBudget ?? 0)}
              icon={Euro}
              color="bg-emerald-100 text-emerald-600"
              subtitle="projets actifs"
            />
            <KPICard
              title="Tâches en retard"
              value={kpis?.overdueTasks ?? 0}
              icon={AlertTriangle}
              color={kpis?.overdueTasks ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}
              subtitle="nécessitent attention"
            />
            <KPICard
              title="Heures ce mois"
              value={`${(kpis?.hoursThisMonth ?? 0).toFixed(0)}h`}
              icon={Clock}
              color="bg-purple-100 text-purple-600"
              subtitle="temps de travail"
            />
          </>
        )}
      </div>

      {/* Charts + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Revenus & Dépenses (6 mois)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDepense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(value: number) => [formatCurrency(value), ""]} labelStyle={{ fontWeight: 600 }} />
                <Area type="monotone" dataKey="revenus" name="Revenus" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenu)" />
                <Area type="monotone" dataKey="dépenses" name="Dépenses" stroke="#ef4444" strokeWidth={2} fill="url(#colorDepense)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Résumé financier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Revenus ce mois</span>
              <span className="text-sm font-semibold text-green-600">{formatCurrency(kpis?.revenueThisMonth ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Factures en attente</span>
              <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                {kpis?.pendingInvoices ?? 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total clients</span>
              <span className="text-sm font-semibold">{clients?.length ?? 0}</span>
            </div>
            <div className="pt-2">
              <Link href="/cabinet">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  Voir les finances
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects + Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                Projets récents
              </CardTitle>
              <Link href="/projets">
                <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {projectsLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)
            ) : recentProjects?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun projet pour le moment</p>
                <Link href="/projets/nouveau">
                  <Button size="sm" variant="outline" className="mt-3 text-xs">Créer un projet</Button>
                </Link>
              </div>
            ) : (
              recentProjects?.map((project) => {
                const client = clients?.find(c => c.id === project.clientId);
                return (
                  <Link key={project.id} href={`/projets/${project.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                          <Badge className={`text-xs px-1.5 py-0 ${getStatusColor(project.status)}`}>
                            {STATUS_LABELS[project.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {client && <span className="text-xs text-muted-foreground truncate">{client.name}</span>}
                          <span className="text-xs text-muted-foreground">•</span>
                          <Badge className={`text-xs px-1.5 py-0 ${getPhaseColor(project.currentPhase)}`}>
                            {PHASE_LABELS[project.currentPhase]}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-foreground">{formatCurrency(project.budgetEstimated ?? 0)}</p>
                        <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Tâches prioritaires
              </CardTitle>
              <Link href="/cabinet">
                <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                  Voir tout <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasksLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
            ) : urgentTasks?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-400 opacity-60" />
                <p className="text-sm">Aucune tâche urgente</p>
                <p className="text-xs mt-1">Tout est à jour !</p>
              </div>
            ) : (
              urgentTasks?.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                  <TaskStatusIcon status={task.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge className={`text-xs px-1.5 py-0 ${getPriorityColor(task.priority)}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                      {task.dueDate && (
                        <span className={`text-xs ${new Date(task.dueDate) < new Date() ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                          Échéance : {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
