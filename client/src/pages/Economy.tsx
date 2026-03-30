import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingDown, TrendingUp, DollarSign, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Economy() {
  const [selectedProject, setSelectedProject] = useState(1);

  // Mock data
  const projects = [
    { id: 1, name: "Immeuble Centre-Ville", budgetTotal: 500000 },
    { id: 2, name: "Centre Commercial", budgetTotal: 1200000 },
    { id: 3, name: "Maison Individuelle", budgetTotal: 250000 },
  ];

  const costEstimates = [
    {
      id: 1,
      category: "Structure",
      description: "Fondations et ossature béton",
      phase: "EXE",
      estimated: 150000,
      actual: 155000,
      status: "in_progress",
    },
    {
      id: 2,
      category: "MEP",
      description: "Électricité, Plomberie, Chauffage",
      phase: "EXE",
      estimated: 120000,
      actual: 118500,
      status: "in_progress",
    },
    {
      id: 3,
      category: "Finitions",
      description: "Peinture, revêtements, menuiseries",
      phase: "DET",
      estimated: 100000,
      actual: 0,
      status: "draft",
    },
    {
      id: 4,
      category: "Façade",
      description: "Revêtement extérieur et isolation",
      phase: "EXE",
      estimated: 80000,
      actual: 82000,
      status: "in_progress",
    },
    {
      id: 5,
      category: "Toiture",
      description: "Couverture et étanchéité",
      phase: "EXE",
      estimated: 50000,
      actual: 50000,
      status: "completed",
    },
  ];

  const selectedProjectData = projects.find((p) => p.id === selectedProject);
  const totalEstimated = costEstimates.reduce((sum, e) => sum + e.estimated, 0);
  const totalActual = costEstimates.reduce((sum, e) => sum + e.actual, 0);
  const overrun = totalActual - totalEstimated;
  const overrunPercentage = (overrun / totalEstimated) * 100;

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    approved: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Économie de la Construction</h1>
            <p className="text-muted-foreground">
              Suivi des coûts, estimations et alertes budgétaires
            </p>
          </div>
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Estimation
          </Button>
        </div>

        {/* Project Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-2 flex-wrap">
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant={selectedProject === project.id ? "default" : "outline"}
                  onClick={() => setSelectedProject(project.id)}
                >
                  {project.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Budget Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {selectedProjectData?.budgetTotal.toLocaleString()} €
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Estimé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalEstimated.toLocaleString()} €</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((totalEstimated / (selectedProjectData?.budgetTotal || 1)) * 100).toFixed(0)}% du budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Engagé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalActual.toLocaleString()} €</p>
              <p className="text-xs text-muted-foreground mt-1">
                {((totalActual / (selectedProjectData?.budgetTotal || 1)) * 100).toFixed(0)}% du budget
              </p>
            </CardContent>
          </Card>

          <Card className={overrun > 0 ? "border-red-500" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Écart</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${overrun > 0 ? "text-red-600" : "text-green-600"}`}>
                {overrun > 0 ? "+" : ""}{overrun.toLocaleString()} €
              </p>
              <p className={`text-xs mt-1 ${overrun > 0 ? "text-red-600" : "text-green-600"}`}>
                {overrunPercentage > 0 ? "+" : ""}{overrunPercentage.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alert */}
        {overrun > 0 && (
          <Card className="mb-6 border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Dépassement budgétaire détecté</p>
                  <p className="text-sm text-red-700 mt-1">
                    Le projet a dépassé l'estimation de {overrun.toLocaleString()} € ({overrunPercentage.toFixed(1)}%).
                    Veuillez revoir les coûts ou augmenter le budget alloué.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cost Breakdown */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Tous les coûts</TabsTrigger>
            <TabsTrigger value="in_progress">En cours</TabsTrigger>
            <TabsTrigger value="completed">Complétés</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {costEstimates.map((estimate) => {
              const variance = estimate.actual - estimate.estimated;
              const variancePercentage = (variance / estimate.estimated) * 100;

              return (
                <Card key={estimate.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{estimate.category}</h3>
                          <p className="text-sm text-muted-foreground">{estimate.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={statusColors[estimate.status as keyof typeof statusColors]}>
                            {estimate.status}
                          </Badge>
                          <Badge variant="outline">{estimate.phase}</Badge>
                        </div>
                      </div>

                      {/* Budget Bars */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Estimé</p>
                          <p className="text-lg font-bold text-foreground">
                            {estimate.estimated.toLocaleString()} €
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Engagé</p>
                          <p className={`text-lg font-bold ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
                            {estimate.actual.toLocaleString()} €
                          </p>
                          {estimate.actual > 0 && (
                            <p className={`text-xs mt-1 ${variance > 0 ? "text-red-600" : "text-green-600"}`}>
                              {variance > 0 ? "+" : ""}{variance.toLocaleString()} € ({variancePercentage.toFixed(1)}%)
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-medium text-muted-foreground">Progression</p>
                          <p className="text-xs font-semibold text-foreground">
                            {estimate.actual > 0 ? ((estimate.actual / estimate.estimated) * 100).toFixed(0) : 0}%
                          </p>
                        </div>
                        <Progress
                          value={estimate.actual > 0 ? (estimate.actual / estimate.estimated) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="in_progress">
            {costEstimates
              .filter((e) => e.status === "in_progress")
              .map((estimate) => (
                <Card key={estimate.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{estimate.category}</h3>
                        <p className="text-sm text-muted-foreground">{estimate.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{estimate.actual.toLocaleString()} €</p>
                        <p className="text-xs text-muted-foreground">
                          Estimé: {estimate.estimated.toLocaleString()} €
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed">
            {costEstimates
              .filter((e) => e.status === "completed")
              .map((estimate) => (
                <Card key={estimate.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{estimate.category}</h3>
                        <p className="text-sm text-muted-foreground">{estimate.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{estimate.actual.toLocaleString()} €</p>
                        <p className="text-xs text-green-600">
                          Économie: {(estimate.estimated - estimate.actual).toLocaleString()} €
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>

        {/* Summary Chart */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Résumé par Phase</CardTitle>
            <CardDescription>Distribution des coûts par phase architecturale</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["ESQ", "APS", "APD", "PRO", "DCE", "EXE", "DET", "AOR"].map((phase) => {
                const phaseEstimates = costEstimates.filter((e) => e.phase === phase);
                const phaseTotal = phaseEstimates.reduce((sum, e) => sum + e.estimated, 0);
                const phaseActual = phaseEstimates.reduce((sum, e) => sum + e.actual, 0);

                return phaseTotal > 0 ? (
                  <div key={phase}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{phase}</p>
                      <p className="text-sm font-semibold">
                        {phaseActual.toLocaleString()} € / {phaseTotal.toLocaleString()} €
                      </p>
                    </div>
                    <Progress value={(phaseActual / phaseTotal) * 100} className="h-2" />
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
