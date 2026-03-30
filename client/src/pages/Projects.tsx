import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, ChevronRight, AlertCircle } from "lucide-react";

const phases = ["ESQ", "APS", "APD", "PRO", "DCE", "EXE", "DET", "AOR"];

const phaseDescriptions = {
  ESQ: "Esquisse",
  APS: "Avant-Projet Sommaire",
  APD: "Avant-Projet Détaillé",
  PRO: "Projet",
  DCE: "Dossier de Consultation d'Entreprises",
  EXE: "Exécution",
  DET: "Détails",
  AOR: "Assistance et Ouvrages Réceptionnés",
};

export default function Projects() {
  const [selectedPhase, setSelectedPhase] = useState("all");

  // Mock data - replace with actual tRPC query
  const projects = [
    {
      id: 1,
      name: "Immeuble Centre-Ville",
      type: "Résidentiel",
      address: "123 Rue de la Paix, Paris",
      currentPhase: "APD",
      progress: 65,
      budgetEstimated: 500000,
      budgetUsed: 320000,
      startDate: "2025-01-15",
      endDate: "2026-12-31",
      status: "active",
    },
    {
      id: 2,
      name: "Centre Commercial",
      type: "Commercial",
      address: "456 Avenue Principale, Lyon",
      currentPhase: "PRO",
      progress: 45,
      budgetEstimated: 1200000,
      budgetUsed: 540000,
      startDate: "2025-03-01",
      endDate: "2027-06-30",
      status: "active",
    },
    {
      id: 3,
      name: "Maison Individuelle",
      type: "Résidentiel",
      address: "789 Chemin Rural, Marseille",
      currentPhase: "EXE",
      progress: 85,
      budgetEstimated: 250000,
      budgetUsed: 212500,
      startDate: "2024-06-01",
      endDate: "2026-03-31",
      status: "active",
    },
  ];

  const filteredProjects = selectedPhase === "all" 
    ? projects 
    : projects.filter(p => p.currentPhase === selectedPhase);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Gestion des Projets</h1>
            <p className="text-muted-foreground">
              {filteredProjects.length} projets - Gestion complète du cycle de vie architectural
            </p>
          </div>
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Projet
          </Button>
        </div>

        {/* Phase Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Filtrer par phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedPhase === "all" ? "default" : "outline"}
                onClick={() => setSelectedPhase("all")}
              >
                Tous
              </Button>
              {phases.map((phase) => (
                <Button
                  key={phase}
                  variant={selectedPhase === phase ? "default" : "outline"}
                  onClick={() => setSelectedPhase(phase)}
                  size="sm"
                >
                  {phase}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const currentPhaseIndex = phases.indexOf(project.currentPhase);
            const budgetPercentage = (project.budgetUsed / project.budgetEstimated) * 100;
            const isOverBudget = budgetPercentage > 100;

            return (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-1">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">{project.address}</p>
                      </div>
                      <div className="text-right">
                        <Badge className="mb-2">{project.type}</Badge>
                        {isOverBudget && (
                          <div className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            Dépassement
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phase Progress */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Progression des phases</p>
                      <div className="flex gap-1">
                        {phases.map((phase, index) => (
                          <div
                            key={phase}
                            className={`flex-1 h-2 rounded-full transition-colors ${
                              index <= currentPhaseIndex
                                ? "bg-blue-500"
                                : "bg-gray-200"
                            }`}
                            title={phaseDescriptions[phase as keyof typeof phaseDescriptions]}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Phase actuelle: <span className="font-semibold">{project.currentPhase} - {phaseDescriptions[project.currentPhase as keyof typeof phaseDescriptions]}</span>
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">Avancement global</p>
                        <p className="text-sm font-semibold text-foreground">{project.progress}%</p>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Budget & Timeline */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Budget</p>
                        <p className={`font-semibold ${isOverBudget ? "text-red-600" : "text-foreground"}`}>
                          {budgetPercentage.toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.budgetUsed.toLocaleString()} € / {project.budgetEstimated.toLocaleString()} €
                        </p>
                      </div>
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Début</p>
                        <p className="font-semibold text-foreground">
                          {new Date(project.startDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Fin prévue</p>
                        <p className="font-semibold text-foreground">
                          {new Date(project.endDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1">
                        Détails
                      </Button>
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Projets Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{projects.filter(p => p.status === "active").length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Budget Total Engagé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {(projects.reduce((sum, p) => sum + p.budgetUsed, 0) / 1000).toFixed(0)}k €
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Progression Moyenne</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
