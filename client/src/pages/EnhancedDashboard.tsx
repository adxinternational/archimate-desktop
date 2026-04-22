import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { EnhancedLayout } from "@/components/EnhancedLayout";
import { FinancialChart } from "@/components/FinancialChart";
import { PeriodSelector, type PeriodType } from "@/components/PeriodSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderOpen, Users, CheckSquare, AlertCircle,
  TrendingUp, Clock, DollarSign, Hammer, ArrowRight, Loader2,
  StickyNote, Newspaper,
} from "lucide-react";

const PHASE_LABELS: Record<string, string> = {
  esq: "ESQ", aps: "APS", apd: "APD", pro: "PRO",
  dce: "DCE", exe: "EXE", det: "DET", aor: "AOR",
};

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M €";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k €";
  return n + " €";
}

export default function EnhancedDashboard() {
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState<PeriodType>("month");

  // ── Toutes les données réelles ───────────────────────────
  const { data: projects = [], isLoading: loadingProj } = trpc.projects.list.useQuery();
  const { data: clients = [], isLoading: loadingClients } = trpc.clients.list.useQuery();
  const { data: tasks = [], isLoading: loadingTasks } = trpc.tasks.list.useQuery();
  const { data: team = [] } = trpc.team.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();
  const { data: expenses = [] } = trpc.expenses.list.useQuery();
  const { data: sites = [] } = trpc.sites.list.useQuery();
  const { data: notes = [] } = trpc.notes.list.useQuery();
  const { data: blogPosts = [] } = trpc.blog.list.useQuery();

  const isLoading = loadingProj || loadingClients || loadingTasks;

  // ── KPIs calculés ────────────────────────────────────────
  const kpis = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const activeProjects = projects.filter(p => p.status === "active").length;
    const totalBudget = projects.filter(p => p.status === "active")
      .reduce((s, p) => s + (p.budgetEstimated ?? 0), 0);

    const overdueTasks = tasks.filter(t =>
      t.status !== "done" && t.dueDate && new Date(t.dueDate) < now
    ).length;
    const pendingTasks = tasks.filter(t => t.status === "todo" || t.status === "in_progress").length;

    const monthlyRevenue = invoices
      .filter(i => i.status === "paid" && new Date(i.createdAt) >= startOfMonth)
      .reduce((s, i) => s + (parseFloat(i.amount as any) || 0), 0);

    const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (parseFloat(i.amount as any) || 0), 0);
    const pendingRevenue = invoices.filter(i => i.status === "sent" || i.status === "overdue")
      .reduce((s, i) => s + (parseFloat(i.amount as any) || 0), 0);

    const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount as any) || 0), 0);

    const activeSites = sites.filter(s => s.status === "active").length;

    return {
      activeProjects, totalBudget, overdueTasks, pendingTasks,
      monthlyRevenue, totalRevenue, pendingRevenue, totalExpenses,
      activeSites, teamSize: team.length, totalClients: clients.length,
    };
  }, [projects, tasks, invoices, expenses, sites, team, clients]);

  // ── Données graphique financier (6 derniers mois) ────────
  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { month: d.toLocaleString("fr-FR", { month: "short" }), year: d.getFullYear(), m: d.getMonth() };
    });

    return months.map(({ month, year, m }) => {
      const revenue = invoices
        .filter(i => i.status === "paid" && new Date(i.createdAt).getMonth() === m && new Date(i.createdAt).getFullYear() === year)
        .reduce((s, i) => s + (parseFloat(i.amount as any) || 0), 0);
      const costs = expenses
        .filter(e => new Date(e.date).getMonth() === m && new Date(e.date).getFullYear() === year)
        .reduce((s, e) => s + (parseFloat(e.amount as any) || 0), 0);
      return { month, revenue, costs, margin: revenue - costs };
    });
  }, [invoices, expenses]);

  // ── Projets récents ──────────────────────────────────────
  const recentProjects = useMemo(() =>
    [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
    [projects]
  );

  // ── Tâches urgentes ──────────────────────────────────────
  const urgentTasks = useMemo(() =>
    tasks
      .filter(t => t.status !== "done" && (t.priority === "urgent" || t.priority === "high"))
      .slice(0, 5),
    [tasks]
  );

  if (isLoading) {
    return (
      <EnhancedLayout title="Tableau de bord">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" size={20} /> Chargement du tableau de bord…
        </div>
      </EnhancedLayout>
    );
  }

  return (
    <EnhancedLayout title="Tableau de bord">
      <div className="space-y-6">

        {/* KPIs principaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Projets actifs</p>
                <p className="text-3xl font-bold">{kpis.activeProjects}</p>
                <p className="text-xs text-muted-foreground mt-1">Budget: {fmt(kpis.totalBudget)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <FolderOpen size={22} className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Revenus encaissés</p>
                <p className="text-3xl font-bold">{fmt(kpis.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">En attente: {fmt(kpis.pendingRevenue)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign size={22} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card className={`p-5 ${kpis.overdueTasks > 0 ? "border-red-300" : ""}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tâches en retard</p>
                <p className={`text-3xl font-bold ${kpis.overdueTasks > 0 ? "text-red-600" : ""}`}>
                  {kpis.overdueTasks}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{kpis.pendingTasks} en cours</p>
              </div>
              <div className={`p-3 rounded-xl ${kpis.overdueTasks > 0 ? "bg-red-100" : "bg-orange-100"}`}>
                <AlertCircle size={22} className={kpis.overdueTasks > 0 ? "text-red-600" : "text-orange-600"} />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Chantiers actifs</p>
                <p className="text-3xl font-bold">{kpis.activeSites}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpis.teamSize} collaborateurs</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Hammer size={22} className="text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Graphique financier avec sélecteur de période */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Synthèse financière</h3>
            <PeriodSelector period={period} onPeriodChange={setPeriod} />
          </div>
          {chartData.some(d => d.revenue > 0 || d.costs > 0) ? (
            <FinancialChart
              data={chartData}
              title=""
              type="area"
              height={280}
            />
          ) : (
            <Card className="p-8 text-center">
              <TrendingUp size={32} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Le graphique financier apparaîtra dès que vous aurez des factures et dépenses.</p>
            </Card>
          )
        }
        </div>
        
        {/* Projets récents + Tâches urgentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Projets récents */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Projets récents</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/projects")}>
                  Voir tout <ArrowRight size={12} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentProjects.length === 0 ? (
                <div className="text-center py-6">
                  <FolderOpen size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Aucun projet</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate("/projects/create")}>
                    Créer un projet
                  </Button>
                </div>
              ) : (
                recentProjects.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/projects/${p.id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{fmt(p.budgetEstimated ?? 0)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {PHASE_LABELS[p.currentPhase] ?? p.currentPhase.toUpperCase()}
                      </Badge>
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Tâches urgentes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tâches prioritaires</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/cabinet")}>
                  Voir tout <ArrowRight size={12} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {urgentTasks.length === 0 ? (
                <div className="text-center py-6">
                  <CheckSquare size={28} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune tâche urgente</p>
                </div>
              ) : (
                urgentTasks.map(t => {
                  const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
                  return (
                    <div key={t.id} className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/50">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        t.priority === "urgent" ? "bg-red-500" : "bg-orange-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        {t.dueDate && (
                          <p className={`text-xs ${isOverdue ? "text-red-500" : "text-muted-foreground"}`}>
                            {isOverdue ? "En retard — " : ""}
                            {new Date(t.dueDate).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                      <Badge className={`text-xs shrink-0 ${
                        t.priority === "urgent" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                      }`}>
                        {t.priority === "urgent" ? "Urgent" : "Haute"}
                      </Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats secondaires */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <Users size={20} className="mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{kpis.totalClients}</p>
            <p className="text-xs text-muted-foreground">Clients</p>
          </Card>
          <Card className="p-4 text-center">
            <Clock size={20} className="mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{kpis.teamSize}</p>
            <p className="text-xs text-muted-foreground">Collaborateurs</p>
          </Card>
          <Card className="p-4 text-center">
            <DollarSign size={20} className="mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{fmt(kpis.totalExpenses)}</p>
            <p className="text-xs text-muted-foreground">Dépenses totales</p>
          </Card>
        </div>

        {/* Notes & Blog */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <StickyNote size={18} className="text-primary" /> Notes récentes
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/notes")}>
                  Voir tout <ArrowRight size={12} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune note</p>
              ) : (
                notes.slice(0, 3).map(n => (
                  <div key={n.id} className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{n.content}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Newspaper size={18} className="text-primary" /> Dernières actualités
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/blog")}>
                  Gérer <ArrowRight size={12} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {blogPosts.filter(p => p.status === 'published').length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun article publié</p>
              ) : (
                blogPosts.filter(p => p.status === 'published').slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{p.title}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-3 justify-end">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/notes")}>
            <StickyNote size={16} /> Nouvelle note
          </Button>
          <Button variant="outline" onClick={() => navigate("/clients/create")}>
            Nouveau client
          </Button>
          <Button onClick={() => navigate("/projects/create")}>
            Nouveau projet
          </Button>
        </div>

      </div>
    </EnhancedLayout>
  );
}
