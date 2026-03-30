import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp, Clock, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    budgetUsed: 0,
    onTimeProjects: 0,
    delayedProjects: 0,
    activeAlerts: 0,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentification requise</CardTitle>
            <CardDescription>Veuillez vous connecter pour accéder au tableau de bord</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Se connecter</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Tableau de Bord
          </h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.name}. Voici un aperçu de vos projets et alertes.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projets Total</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProjects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProjects} actifs
              </p>
            </CardContent>
          </Card>

          {/* Budget Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {((stats.budgetUsed / stats.totalBudget) * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.budgetUsed.toLocaleString()} € / {stats.totalBudget.toLocaleString()} €
              </p>
            </CardContent>
          </Card>

          {/* Schedule Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Planning</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.onTimeProjects}</div>
              <p className="text-xs text-muted-foreground">
                {stats.delayedProjects} en retard
              </p>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className={stats.activeAlerts > 0 ? "border-red-500" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${stats.activeAlerts > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.activeAlerts > 0 ? "text-red-500" : ""}`}>
                {stats.activeAlerts}
              </div>
              <p className="text-xs text-muted-foreground">
                Alertes actives
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Projets Récents</CardTitle>
              <CardDescription>Vos projets actifs les plus récents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Projet {i}</p>
                      <p className="text-sm text-muted-foreground">Phase APD - 65% complété</p>
                    </div>
                    <Button variant="outline" size="sm">Voir</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>Accès rapide aux fonctionnalités</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Nouveau Projet
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <AlertCircle className="mr-2 h-4 w-4" />
                Gérer Leads
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <DollarSign className="mr-2 h-4 w-4" />
                Estimations
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Planning
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        {stats.activeAlerts > 0 && (
          <Card className="mt-6 border-red-500 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Alertes Actives</CardTitle>
              <CardDescription>Éléments nécessitant votre attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Dépassement budgétaire détecté</p>
                    <p className="text-sm text-red-700">Projet: Immeuble Centre-Ville</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
