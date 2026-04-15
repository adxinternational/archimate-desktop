import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Spinner } from "@/components/ui/spinner";
import { AppLayout } from "@/components/AppLayout";

export function CRMDashboard() {
  const { data: metrics, isLoading } = trpc.mvp.crm.pipelineMetrics.useQuery();
  const { data: qualifiedLeads } = trpc.mvp.crm.qualifiedLeads.useQuery();
  const { data: overdueLeads } = trpc.mvp.crm.overdueLeads.useQuery({ daysThreshold: 7 });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner />
        </div>
      </AppLayout>
    );
  }

  if (!metrics) {
    return (
      <AppLayout>
        <div className="text-center text-muted-foreground">
          Aucune donnée disponible
        </div>
      </AppLayout>
    );
  }

  // Préparer les données pour le graphique
  const statusData = Object.entries(metrics.leadsByStatus).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6b7280"];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline de Vente</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble de votre pipeline commercial et des opportunités
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Prospects en cours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taux de Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.conversionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Leads convertis en clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valeur Moyenne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.averageDealValue / 1000).toFixed(1)}k€
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Par deal gagné
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deals Ce Mois
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.closedDealsThisMonth}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Contrats signés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribution par Statut</CardTitle>
              <CardDescription>
                Répartition des leads par étape du pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statut des Leads</CardTitle>
              <CardDescription>
                Nombre de leads par étape
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Qualified Leads */}
        <Card>
          <CardHeader>
            <CardTitle>Leads Qualifiés</CardTitle>
            <CardDescription>
              Prospects prêts pour une proposition
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qualifiedLeads && qualifiedLeads.length > 0 ? (
              <div className="space-y-4">
                {qualifiedLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-between justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{lead.value}€</p>
                      <p className="text-sm text-muted-foreground">{lead.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Aucun lead qualifié</p>
            )}
          </CardContent>
        </Card>

        {/* Overdue Leads */}
        {overdueLeads && overdueLeads.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900">Leads en Retard</CardTitle>
              <CardDescription>
                Prospects sans interaction depuis 7 jours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueLeads.map((lead: any) => (
                  <div key={lead.id} className="text-sm">
                    <p className="font-medium text-orange-900">{lead.name}</p>
                    <p className="text-orange-700">Dernière mise à jour: {new Date(lead.updatedAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
