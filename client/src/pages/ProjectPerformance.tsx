import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { EnhancedLayout } from "@/components/EnhancedLayout";
import { FinancialChart } from "@/components/FinancialChart";
import { PeriodSelector, type PeriodType } from "@/components/PeriodSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Loader2 } from "lucide-react";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M €";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k €";
  return n + " €";
}

export default function ProjectPerformance() {
  const [, navigate] = useLocation();
  const [period, setPeriod] = useState<PeriodType>("month");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const { data: projects = [], isLoading: loadingProj } = trpc.projects.list.useQuery();
  const { data: invoices = [] } = trpc.invoices.list.useQuery();
  const { data: expenses = [] } = trpc.expenses.list.useQuery();

  const isLoading = loadingProj;

  // Données par projet
  const projectPerformance = useMemo(() => {
    return projects.map((project) => {
      const projectInvoices = invoices.filter((i) => i.projectId === project.id && i.status === "paid");
      const projectExpenses = expenses.filter((e) => e.projectId === project.id);

      const revenue = projectInvoices.reduce((s, i) => s + (typeof i.amount === 'string' ? parseFloat(i.amount) : i.amount), 0);
      const costs = projectExpenses.reduce((s, e) => s + (typeof e.amount === 'string' ? parseFloat(e.amount) : e.amount), 0);
      const margin = revenue - costs;
      const marginPercent = revenue > 0 ? ((margin / revenue) * 100).toFixed(1) : "0";

      return {
        id: project.id,
        name: project.name,
        revenue,
        costs,
        margin,
        marginPercent: parseFloat(marginPercent),
        status: project.status,
      };
    });
  }, [projects, invoices, expenses]);

  // Projet sélectionné
  const selectedProject = useMemo(
    () => projectPerformance.find((p) => p.id === parseInt(selectedProjectId)),
    [projectPerformance, selectedProjectId]
  );

  // Données pour le graphique en camembert (répartition par projet)
  const pieData = useMemo(() => {
    return projectPerformance
      .filter((p) => p.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [projectPerformance]);

  // Données pour le graphique en barres (comparaison revenus/coûts)
  const barData = useMemo(() => {
    return projectPerformance
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p) => ({
        name: p.name.substring(0, 15),
        revenue: p.revenue,
        costs: p.costs,
        margin: p.margin,
      }));
  }, [projectPerformance]);

  // Données pour le graphique de marge
  const marginData = useMemo(() => {
    return projectPerformance
      .filter((p) => p.revenue > 0)
      .sort((a, b) => b.marginPercent - a.marginPercent)
      .slice(0, 10)
      .map((p) => ({
        name: p.name.substring(0, 15),
        margin: parseFloat(p.marginPercent.toFixed(1)),
      }));
  }, [projectPerformance]);

  // Statistiques globales
  const stats = useMemo(() => {
    const totalRevenue = projectPerformance.reduce((s: number, p) => s + p.revenue, 0);
    const totalCosts = projectPerformance.reduce((s: number, p) => s + p.costs, 0);
    const totalMargin = totalRevenue - totalCosts;
    const avgMarginPercent =
      projectPerformance.length > 0
        ? projectPerformance.reduce((s, p) => s + p.marginPercent, 0) / projectPerformance.length
        : 0;

    return {
      totalRevenue,
      totalCosts,
      totalMargin,
      avgMarginPercent: parseFloat(avgMarginPercent.toFixed(1)),
      projectCount: projectPerformance.length,
    };
  }, [projectPerformance]);

  if (isLoading) {
    return (
      <EnhancedLayout title="Performance des projets">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" size={20} /> Chargement…
        </div>
      </EnhancedLayout>
    );
  }

  return (
    <EnhancedLayout title="Performance des projets">
      <div className="space-y-6">
        {/* En-tête avec sélecteur de période */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analyse de performance</h2>
          <PeriodSelector period={period} onPeriodChange={setPeriod} />
        </div>

        {/* KPIs globaux */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Revenus totaux</p>
                <p className="text-3xl font-bold">{fmt(stats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.projectCount} projets</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <TrendingUp size={22} className="text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Coûts totaux</p>
                <p className="text-3xl font-bold">{fmt(stats.totalCosts)}</p>
                <p className="text-xs text-muted-foreground mt-1">Tous les projets</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingDown size={22} className="text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Marge totale</p>
                <p className="text-3xl font-bold">{fmt(stats.totalMargin)}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.avgMarginPercent.toFixed(1)}% moyenne</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign size={22} className="text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Projets actifs</p>
                <p className="text-3xl font-bold">
                  {projectPerformance.filter((p) => p.status === "active").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Sur {stats.projectCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <AlertCircle size={22} className="text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Graphique en camembert - Répartition des revenus */}
          {pieData.length > 0 && (
            <Card className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Répartition des revenus (Top 5)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name.substring(0, 10)}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => fmt(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Graphique en barres - Revenus vs Coûts */}
          {barData.length > 0 && (
            <Card className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Revenus vs Coûts (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip formatter={(value) => fmt(value as number)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenus" />
                    <Bar dataKey="costs" fill="#ef4444" name="Coûts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Graphique de marge */}
        {marginData.length > 0 && (
          <Card className="p-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Taux de marge par projet (Top 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={marginData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9ca3af" label={{ value: "Marge (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="margin"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    name="Marge (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Tableau détaillé des projets */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Détails des projets</CardTitle>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Filtrer par projet..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les projets</SelectItem>
                  {projectPerformance.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium">Projet</th>
                    <th className="text-right py-3 px-4 font-medium">Revenus</th>
                    <th className="text-right py-3 px-4 font-medium">Coûts</th>
                    <th className="text-right py-3 px-4 font-medium">Marge</th>
                    <th className="text-right py-3 px-4 font-medium">Marge %</th>
                    <th className="text-center py-3 px-4 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedProject
                    ? [selectedProject]
                    : projectPerformance.sort((a, b) => b.revenue - a.revenue)
                  ).map((project) => (
                    <tr key={project.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{project.name}</td>
                      <td className="text-right py-3 px-4 text-green-600">{fmt(project.revenue)}</td>
                      <td className="text-right py-3 px-4 text-red-600">{fmt(project.costs)}</td>
                      <td className="text-right py-3 px-4 font-medium">{fmt(project.margin)}</td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`font-medium ${
                            project.marginPercent >= 20
                              ? "text-green-600"
                              : project.marginPercent >= 10
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {project.marginPercent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant={project.status === "active" ? "default" : "outline"}>
                          {project.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </EnhancedLayout>
  );
}
