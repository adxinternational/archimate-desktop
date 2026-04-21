import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft, Edit2, Trash2, Plus, FileText, MessageSquare,
  CheckSquare, MapPin, Euro, Calendar, User, ChevronRight,
  CheckCircle2, Clock, AlertCircle, Circle, Upload, Download
} from "lucide-react";
import {
  formatCurrency, formatDate, getPhaseColor, getStatusColor,
  PHASE_LABELS, STATUS_LABELS, PHASE_ORDER, DOCUMENT_CATEGORY_LABELS,
  PROCEDURE_STATUS_LABELS
} from "@/lib/constants";
import { Progress } from "@/components/ui/progress";

function PhaseTimeline({ phases, currentPhase }: { phases: any[]; currentPhase: string }) {
  const utils = trpc.useUtils();
  const updatePhaseMutation = trpc.projects.updatePhase.useMutation({
    onSuccess: () => { utils.projects.phases.invalidate(); toast.success("Phase mise à jour"); },
  });

  return (
    <div className="space-y-2">
      {PHASE_ORDER.map((phase, idx) => {
        const phaseData = phases.find(p => p.phase === phase);
        const isCurrent = phase === currentPhase;
        const isPast = PHASE_ORDER.indexOf(currentPhase as any) > idx;
        const status = phaseData?.status ?? (isPast ? "completed" : isCurrent ? "in_progress" : "pending");

        return (
          <div key={phase} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            isCurrent ? "border-primary/30 bg-primary/5" : "border-border hover:bg-accent/50"
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              status === "completed" ? "bg-green-100 text-green-600" :
              status === "in_progress" ? "bg-blue-100 text-blue-600" :
              "bg-muted text-muted-foreground"
            }`}>
              {status === "completed" ? <CheckCircle2 className="w-4 h-4" /> :
               status === "in_progress" ? <Clock className="w-4 h-4" /> :
               <Circle className="w-4 h-4" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isCurrent ? "text-primary" : "text-foreground"}`}>
                  {PHASE_LABELS[phase]}
                </span>
                {isCurrent && <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Actuelle</Badge>}
              </div>
              {phaseData?.notes && <p className="text-xs text-muted-foreground mt-0.5">{phaseData.notes}</p>}
            </div>
            {phaseData && (
              <Select
                value={phaseData.status}
                onValueChange={v => updatePhaseMutation.mutate({ id: phaseData.id, status: v as any })}
              >
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="skipped">Ignorée</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DocumentsTab({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "other" as const, notes: "" });
  const utils = trpc.useUtils();

  const { data: documents } = trpc.projects.documents.useQuery({ projectId });
  const addDoc = trpc.projects.addDocument.useMutation({
    onSuccess: () => { utils.projects.documents.invalidate(); setOpen(false); setForm({ name: "", category: "other", notes: "" }); toast.success("Document ajouté"); },
  });
  const deleteDoc = trpc.projects.deleteDocument.useMutation({
    onSuccess: () => { utils.projects.documents.invalidate(); toast.success("Document supprimé"); },
  });

  const categoryIcons: Record<string, string> = {
    plan: "📐", report: "📋", contract: "📜", permit: "🏛️", photo: "📷", other: "📄"
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Ajouter un document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau document</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nom du document</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Plan de masse v2" />
              </div>
              <div className="space-y-1.5">
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes optionnelles..." rows={2} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={() => addDoc.mutate({ projectId, ...form })} disabled={!form.name || addDoc.isPending}>
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {documents?.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucun document</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents?.map((doc: any) => (
            <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <span className="text-xl">{categoryIcons[doc.category] ?? "📄"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-xs">{DOCUMENT_CATEGORY_LABELS[doc.category]}</Badge>
                  {doc.version && <span className="text-xs text-muted-foreground">v{doc.version}</span>}
                  <span className="text-xs text-muted-foreground">{formatDate(doc.createdAt)}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => deleteDoc.mutate({ id: doc.id })}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProceduresTab({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "PC" as const, referenceNumber: "" });
  const utils = trpc.useUtils();

  const { data: procedures } = trpc.projects.procedures.useQuery({ projectId });
  const addProc = (trpc.projects as any).addProcedure.useMutation({
    onSuccess: () => { utils.projects.procedures.invalidate(); setOpen(false); setForm({ title: "", type: "PC", referenceNumber: "" }); toast.success("Procédure ajoutée"); },
  });
  const updateProc = trpc.projects.updateProcedure.useMutation({
    onSuccess: () => utils.projects.procedures.invalidate(),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Nouvelle procédure</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle procédure administrative</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Titre</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Permis de construire - Lot 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PC">Permis de Construire</SelectItem>
                      <SelectItem value="DP">Déclaration Préalable</SelectItem>
                      <SelectItem value="AT">Autorisation Travaux</SelectItem>
                      <SelectItem value="CU">Certificat Urbanisme</SelectItem>
                      <SelectItem value="ERP">Dossier ERP</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Référence</Label>
                  <Input value={form.referenceNumber} onChange={e => setForm(f => ({ ...f, referenceNumber: e.target.value }))} placeholder="N° de dossier" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={() => addProc.mutate({ projectId, ...form })} disabled={!form.title || addProc.isPending}>
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {procedures?.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucune procédure en cours</p>
        </div>
      ) : (
        <div className="space-y-3">
          {procedures?.map((proc: any) => (
            <div key={proc.id} className="p-4 rounded-lg border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{proc.title}</p>
                    <Badge variant="secondary" className="text-[10px]">{proc.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Réf: {proc.referenceNumber || "Non renseignée"}</p>
                </div>
                <Select
                  value={proc.status}
                  onValueChange={v => updateProc.mutate({ id: proc.id, status: v as any })}
                >
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROCEDURE_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const [, navigate] = useLocation();
  const projectId = parseInt((params as any)?.id ?? "0");
  const utils = trpc.useUtils();

  const { data: project, isLoading } = trpc.projects.byId.useQuery({ id: projectId });
  const { data: phases } = trpc.projects.phases.useQuery({ projectId });
  const { data: clients } = trpc.clients.list.useQuery();

  const deleteProject = trpc.projects.delete.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); navigate("/projects"); toast.success("Projet supprimé"); },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Projet introuvable</p>
        <Button variant="link" asChild><Link href="/projects">Retour aux projets</Link></Button>
      </div>
    );
  }

  const client = clients?.find(c => c.id === project.clientId);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/projects"><ArrowLeft className="w-5 h-5" /></Link></Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <MapPin className="w-3.5 h-3.5" /> {project.address || "Adresse non renseignée"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(project.status)}>
            {STATUS_LABELS[project.status]}
          </Badge>
          <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10"
            onClick={() => { if (confirm("Supprimer ce projet ?")) deleteProject.mutate({ id: project.id }); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg">Informations Générales</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Client</Label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {client?.name || "Chargement..."}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Budget estimé</Label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Euro className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatCurrency(project.budgetEstimated ?? 0)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Surface</Label>
                <p className="text-sm font-medium">{project.surface ? `${project.surface} m²` : "—"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Date de début</Label>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {formatDate(project.startDate)}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Description</Label>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description || "Aucune description fournie."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg">Progression</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Avancement global</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            <div className="pt-2">
              <Label className="text-xs text-muted-foreground">Phase actuelle</Label>
              <div className="mt-1">
                <Badge className={getPhaseColor(project.currentPhase)}>
                  {PHASE_LABELS[project.currentPhase]}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="phases" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="procedures">Procédures</TabsTrigger>
        </TabsList>
        <TabsContent value="phases" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Suivi des phases</CardTitle></CardHeader>
            <CardContent>
              <PhaseTimeline phases={phases || []} currentPhase={project.currentPhase} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Documents du projet</CardTitle></CardHeader>
            <CardContent>
              <DocumentsTab projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="procedures" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-sm">Procédures administratives</CardTitle></CardHeader>
            <CardContent>
              <ProceduresTab projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
