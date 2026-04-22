import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingDown, TrendingUp, DollarSign, Plus, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedLayout } from "@/components/EnhancedLayout";
import { toast } from "sonner";

const PHASES = ["esq", "aps", "apd", "pro", "dce", "exe", "det", "aor"] as const;
const PHASE_LABELS: Record<string, string> = {
  esq: "ESQ", aps: "APS", apd: "APD", pro: "PRO",
  dce: "DCE", exe: "EXE", det: "DET", aor: "AOR",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  approved: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
};
const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon", approved: "Approuvé",
  in_progress: "En cours", completed: "Terminé",
};

type NewEstimate = {
  projectId: number;
  phase: typeof PHASES[number];
  category: string;
  description: string;
  estimatedAmount: string;
};

export default function Economy() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [form, setForm] = useState<Partial<NewEstimate>>({});

  // ── Données réelles ──────────────────────────────────────
  const { data: projects = [], isLoading: loadingProjects } = trpc.projects.list.useQuery();

  const activeProject = selectedProjectId
    ? projects.find(p => p.id === selectedProjectId)
    : projects[0] ?? null;

  const { data: estimates = [], isLoading: loadingEstimates, refetch } =
    trpc.economy.getCostEstimates.useQuery(
      { projectId: activeProject?.id ?? 0 },
      { enabled: !!activeProject?.id }
    );

  const { data: permits = [] } =
    trpc.economy.getBuildingPermits.useQuery(
      { projectId: activeProject?.id ?? 0 },
      { enabled: !!activeProject?.id }
    );

  const createEstimate = trpc.economy.createCostEstimate.useMutation({
    onSuccess: () => { refetch(); setShowAddDialog(false); setForm({}); toast.success("Estimation ajoutée"); },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  const updateEstimate = trpc.economy.updateCostEstimate.useMutation({
    onSuccess: () => { refetch(); toast.success("Mis à jour"); },
  });

  // ── Calculs budgétaires ──────────────────────────────────
  const totalEstimated = estimates.reduce((s, e) => s + parseFloat(e.estimatedAmount ?? "0"), 0);
  const totalActual = estimates.reduce((s, e) => s + parseFloat(e.actualAmount ?? "0"), 0);
  const overrun = totalActual - totalEstimated;
  const overrunPct = totalEstimated > 0 ? (overrun / totalEstimated) * 100 : 0;
  const budgetTotal = activeProject?.budgetEstimated ?? 0;

  function fmt(n: number) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }

  async function handleCreate() {
    if (!activeProject || !form.phase || !form.category || !form.description || !form.estimatedAmount) return;
    createEstimate.mutate({
      projectId: activeProject.id,
      phase: form.phase,
      category: form.category,
      description: form.description,
      estimatedAmount: form.estimatedAmount,
    });
  }

  if (loadingProjects) {
    return (
      <EnhancedLayout title="Économie de la Construction">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="animate-spin mr-2" size={20} /> Chargement…
        </div>
      </EnhancedLayout>
    );
  }

  return (
    <EnhancedLayout title="Économie de la Construction">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">Suivi des coûts, estimations et alertes budgétaires</p>
          <Button onClick={() => setShowAddDialog(true)} disabled={!activeProject}>
            <Plus size={16} className="mr-2" /> Nouvelle estimation
          </Button>
        </div>

        {/* Sélecteur de projet */}
        {projects.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Aucun projet. Créez d'abord un projet pour saisir des estimations.
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-2 flex-wrap">
                {projects.map(p => (
                  <Button
                    key={p.id}
                    size="sm"
                    variant={(activeProject?.id === p.id) ? "default" : "outline"}
                    onClick={() => setSelectedProjectId(p.id)}
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeProject && (
          <>
            {/* KPI Budget */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Budget alloué</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{fmt(budgetTotal)}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activeProject.currentPhase.toUpperCase()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total estimé</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{fmt(totalEstimated)}</p>
                  {budgetTotal > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {((totalEstimated / budgetTotal) * 100).toFixed(0)}% du budget
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total engagé</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{fmt(totalActual)}</p>
                  {budgetTotal > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {((totalActual / budgetTotal) * 100).toFixed(0)}% du budget
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className={overrun > 0 ? "border-red-400" : "border-green-400"}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    {overrun > 0 ? <TrendingDown size={14} className="text-red-500" /> : <TrendingUp size={14} className="text-green-500" />}
                    Écart
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${overrun > 0 ? "text-red-600" : "text-green-600"}`}>
                    {overrun > 0 ? "+" : ""}{fmt(overrun)}
                  </p>
                  <p className={`text-xs mt-1 ${overrun > 0 ? "text-red-500" : "text-green-500"}`}>
                    {overrunPct > 0 ? "+" : ""}{overrunPct.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alerte dépassement */}
            {overrun > 0 && (
              <Card className="border-red-400 bg-red-50">
                <CardContent className="pt-4 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900 text-sm">Dépassement budgétaire détecté</p>
                    <p className="text-xs text-red-700 mt-0.5">
                      {fmt(overrun)} de dépassement ({overrunPct.toFixed(1)}%). Vérifiez les postes en rouge.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Estimations par statut */}
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">Tous ({estimates.length})</TabsTrigger>
                <TabsTrigger value="in_progress">En cours</TabsTrigger>
                <TabsTrigger value="draft">Brouillons</TabsTrigger>
                <TabsTrigger value="completed">Terminés</TabsTrigger>
              </TabsList>

              {["all", "in_progress", "draft", "completed"].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-3 mt-4">
                  {loadingEstimates ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <Loader2 className="animate-spin mx-auto mb-2" size={20} />
                    </div>
                  ) : estimates.filter(e => tab === "all" || e.status === tab).length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground text-sm">
                      Aucune estimation{tab !== "all" ? ` dans ce statut` : ""}. Ajoutez-en une.
                    </Card>
                  ) : (
                    estimates
                      .filter(e => tab === "all" || e.status === tab)
                      .map(estimate => {
                        const est = parseFloat(estimate.estimatedAmount ?? "0");
                        const act = parseFloat(estimate.actualAmount ?? "0");
                        const diff = act - est;
                        const pct = est > 0 ? (act / est) * 100 : 0;
                        return (
                          <Card key={estimate.id}>
                            <CardContent className="pt-4 space-y-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm">{estimate.category}</p>
                                  <p className="text-xs text-muted-foreground truncate">{estimate.description}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  <Badge className={STATUS_COLORS[estimate.status ?? "draft"] + " text-xs"}>
                                    {STATUS_LABELS[estimate.status ?? "draft"]}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {PHASE_LABELS[estimate.phase] ?? estimate.phase.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Estimé</p>
                                  <p className="font-bold text-sm">{fmt(est)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground mb-1">Engagé</p>
                                  <p className={`font-bold text-sm ${diff > 0 ? "text-red-600" : act > 0 ? "text-green-600" : ""}`}>
                                    {act > 0 ? fmt(act) : "—"}
                                  </p>
                                  {act > 0 && diff !== 0 && (
                                    <p className={`text-xs ${diff > 0 ? "text-red-500" : "text-green-500"}`}>
                                      {diff > 0 ? "+" : ""}{fmt(diff)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {act > 0 && (
                                <div>
                                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Avancement</span>
                                    <span>{pct.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={Math.min(pct, 100)} className="h-1.5" />
                                </div>
                              )}

                              {/* Actions rapides */}
                              {(estimate.status as any) !== "completed" && (
                                <div className="flex gap-2 pt-1">
                                  {(estimate.status as any) === "draft" && (
                                    <Button size="sm" variant="outline" className="text-xs h-7"
                                      onClick={() => updateEstimate.mutate({ id: estimate.id, status: "approved" })}>
                                      Approuver
                                    </Button>
                                  )}
                                  {(estimate.status as any) === "approved" && (
                                    <Button size="sm" variant="outline" className="text-xs h-7"
                                      onClick={() => updateEstimate.mutate({ id: estimate.id, status: "in_progress" })}>
                                      Démarrer
                                    </Button>
                                  )}
                                  {(estimate.status as any) === "in_progress" && (
                                    <Button size="sm" variant="outline" className="text-xs h-7"
                                      onClick={() => updateEstimate.mutate({ id: estimate.id, status: "completed" })}>
                                      Terminer
                                    </Button>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Résumé par phase */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Répartition par phase</CardTitle>
                <CardDescription>Coûts estimés vs engagés par phase architecturale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PHASES.map(phase => {
                  const phaseEst = estimates.filter(e => e.phase === phase);
                  if (phaseEst.length === 0) return null;
                  const est = phaseEst.reduce((s, e) => s + parseFloat(e.estimatedAmount ?? "0"), 0);
                  const act = phaseEst.reduce((s, e) => s + parseFloat(e.actualAmount ?? "0"), 0);
                  return (
                    <div key={phase}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{PHASE_LABELS[phase]}</span>
                        <span className="text-muted-foreground">{act > 0 ? fmt(act) + " / " : ""}{fmt(est)}</span>
                      </div>
                      <Progress value={est > 0 && act > 0 ? Math.min((act / est) * 100, 100) : 0} className="h-1.5" />
                    </div>
                  );
                })}
                {estimates.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucune estimation pour ce projet.</p>
                )}
              </CardContent>
            </Card>

            {/* Permis de construire */}
            {permits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Procédures administratives</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {permits.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{p.type}</p>
                        <p className="text-xs text-muted-foreground">{p.referenceNumber}</p>
                      </div>
                      <Badge className={
                        p.status === "approved" ? "bg-green-100 text-green-700" :
                        p.status === "rejected" ? "bg-red-100 text-red-700" :
                        p.status === "submitted" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }>
                        {p.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Dialog — Nouvelle estimation */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle estimation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phase</label>
              <Select onValueChange={v => setForm(f => ({ ...f, phase: v as typeof PHASES[number] }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sélectionner une phase" />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map(p => (
                    <SelectItem key={p} value={p}>{PHASE_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <Input
                className="mt-1"
                placeholder="Ex: Structure, MEP, Finitions…"
                value={form.category ?? ""}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                className="mt-1"
                placeholder="Description du poste de coût"
                value={form.description ?? ""}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Montant estimé (€)</label>
              <Input
                className="mt-1"
                type="number"
                placeholder="0"
                value={form.estimatedAmount ?? ""}
                onChange={e => setForm(f => ({ ...f, estimatedAmount: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
            <Button
              onClick={handleCreate}
              disabled={createEstimate.isPending || !form.phase || !form.category || !form.description || !form.estimatedAmount}
            >
              {createEstimate.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EnhancedLayout>
  );
}
