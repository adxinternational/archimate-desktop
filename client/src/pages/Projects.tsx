import { Plus, ChevronRight, AlertCircle, Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { BulkActionsBar, BulkSelectableRow } from "@/components/BulkActions";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { toast } from "sonner";
import { Link } from "wouter";

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
  const utils = trpc.useUtils();

  const { data: projects = [], isLoading } = trpc.projects.list.useQuery();
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Projet supprimé");
      utils.projects.list.invalidate();
      deselectAll();
    },
    onError: (err) => {
      toast.error(`Erreur: ${err.message}`);
    },
  });

  const {
    selected,
    toggleSelect,
    selectAll,
    deselectAll,
    isSelected,
    getSelectedIds,
    getSelectedCount,
  } = useMultiSelect();

  const filteredProjects = selectedPhase === "all" 
    ? projects 
    : projects.filter(p => p.currentPhase === selectedPhase);

  const handleBulkDelete = async (ids: string[]) => {
    if (confirm(`Voulez-vous vraiment supprimer ${ids.length} projet(s) ?`)) {
      for (const id of ids) {
        await deleteMutation.mutateAsync({ id: Number(id) });
      }
    }
  };

  const bulkActions = [
    {
      id: "delete",
      label: "Supprimer",
      icon: <Trash2 size={16} />,
      variant: "destructive" as const,
      onClick: handleBulkDelete,
    },
  ];

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

        {/* Bulk Actions */}
        <BulkActionsBar
          selectedCount={getSelectedCount()}
          selectedIds={getSelectedIds()}
          totalCount={filteredProjects.length}
          onSelectAll={(checked) => {
            if (checked) {
              selectAll(filteredProjects.map(p => String(p.id)));
            } else {
              deselectAll();
            }
          }}
          onClearSelection={deselectAll}
          actions={bulkActions}
          isLoading={deleteMutation.isPending}
        />

        {/* Projects List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12 bg-accent rounded-lg">
              <p className="text-muted-foreground text-lg">Aucun projet trouvé</p>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const currentPhaseIndex = phases.indexOf((project.currentPhase || "esq").toUpperCase());
              const budgetActual = Number(project.budgetActual || 0);
              const budgetEstimated = Number(project.budgetEstimated || 1);
              const budgetPercentage = (budgetActual / budgetEstimated) * 100;
              const isOverBudget = budgetPercentage > 100;

              return (
                <BulkSelectableRow
                  key={project.id}
                  id={String(project.id)}
                  selected={isSelected(String(project.id))}
                  onSelectionChange={() => toggleSelect(String(project.id))}
                >
                  <Card className="hover:shadow-md transition-shadow">
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
                            Phase actuelle: <span className="font-semibold">{project.currentPhase?.toUpperCase() || "ESQ"} - {phaseDescriptions[(project.currentPhase?.toUpperCase() || "ESQ") as keyof typeof phaseDescriptions]}</span>
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-foreground">Avancement global</p>
                            <p className="text-sm font-semibold text-foreground">{project.progress || 0}%</p>
                          </div>
                          <Progress value={project.progress || 0} className="h-2" />
                        </div>

                        {/* Budget & Timeline */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 bg-accent rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Budget</p>
                            <p className={`font-semibold ${isOverBudget ? "text-red-600" : "text-foreground"}`}>
                              {budgetPercentage.toFixed(0)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {budgetActual.toLocaleString()} € / {budgetEstimated.toLocaleString()} €
                            </p>
                          </div>
                          <div className="p-3 bg-accent rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Début</p>
                            <p className="font-semibold text-foreground">
                              {project.startDate ? new Date(project.startDate).toLocaleDateString("fr-FR") : "-"}
                            </p>
                          </div>
                          <div className="p-3 bg-accent rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Fin prévue</p>
                            <p className="font-semibold text-foreground">
                              {project.endDate ? new Date(project.endDate).toLocaleDateString("fr-FR") : "-"}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Link href={`/projects/${project.id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                              Détails
                            </Button>
                          </Link>
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </BulkSelectableRow>
              );
            })
          )}
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
                {(projects.reduce((sum, p) => sum + Number(p.budgetActual || 0), 0) / 1000).toFixed(0)}k €
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Progression Moyenne</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {projects.length > 0 
                  ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
