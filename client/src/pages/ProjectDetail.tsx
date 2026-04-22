import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ArrowLeft, Edit2, Trash2, Plus, FileText, MessageSquare,
  CheckSquare, MapPin, Euro, Calendar, User, ChevronRight,
  CheckCircle2, Clock, AlertCircle, Circle, Upload, Download,
  Save, X, Loader2
} from "lucide-react";
import {
  formatCurrency, formatDate, getPhaseColor, getStatusColor,
  PHASE_LABELS, STATUS_LABELS, PHASE_ORDER, DOCUMENT_CATEGORY_LABELS,
  PROCEDURE_STATUS_LABELS
} from "@/lib/constants";
import { Progress } from "@/components/ui/progress";

const projectSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  clientId: z.string().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  currentPhase: z.enum(["esq", "aps", "apd", "pc", "dce", "chantier", "doe"]),
  budgetEstimated: z.string().optional(),
  startDate: z.string().optional(),
  status: z.enum(["active", "on_hold", "completed", "cancelled"]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

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
          {documents?.map(doc => (
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

function CommentsTab({ projectId, authorName }: { projectId: number; authorName: string }) {
  const [content, setContent] = useState("");
  const utils = trpc.useUtils();

  // const { data: comments } = trpc.projects.comments.useQuery({ projectId });
  // const addComment = trpc.projects.addComment.useMutation({
  //   onSuccess: () => { utils.projects.comments.invalidate(); setContent(""); },
  // });
  // const deleteComment = trpc.projects.deleteComment.useMutation({
  //   onSuccess: () => utils.projects.comments.invalidate(),
  // });
  const comments: any[] = [];
  const addComment = { mutate: () => {}, isPending: false };
  const deleteComment = { mutate: () => {}, isPending: false };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          rows={2}
          className="flex-1 resize-none"
        />
        <Button
          onClick={() => { /* addComment.mutate({ projectId, authorName, content }) */ }}
          disabled={!content.trim() || (addComment as any).isPending}
          className="self-end"
        >
          Envoyer
        </Button>
      </div>
      <div className="space-y-3">
        {comments?.map(comment => (
          <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
              {comment.authorName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{comment.authorName}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => { /* deleteComment.mutate({ id: comment.id }) */ }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-foreground mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProceduresTab({ projectId }: { projectId: number }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", type: "PC" as const, notes: "" });
  const utils = trpc.useUtils();

  const { data: procedures } = trpc.projects.procedures.useQuery({ projectId });
  const addProc = trpc.projects.addProcedure.useMutation({
    onSuccess: () => { utils.projects.procedures.invalidate(); setOpen(false); toast.success("Procédure ajoutée"); },
  });
  const updateProc = trpc.projects.updateProcedure.useMutation({
    onSuccess: () => utils.projects.procedures.invalidate(),
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    submitted: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Ajouter une procédure</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle procédure administrative</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Titre</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Permis de construire" />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permis_construire">Permis de construire</SelectItem>
                    <SelectItem value="declaration_travaux">Déclaration de travaux</SelectItem>
                    <SelectItem value="autorisation">Autorisation</SelectItem>
                    <SelectItem value="dossier_reglementaire">Dossier réglementaire</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button onClick={() => addProc.mutate({ projectId, ...form })} disabled={!form.title || addProc.isPending}>
                  Ajouter
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {procedures?.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Aucune procédure administrative</p>
        </div>
      ) : (
        <div className="space-y-3">
          {procedures?.map(proc => (
            <div key={proc.id} className="p-4 rounded-lg border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{proc.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{proc.type}</p>
                </div>
                <Select value={proc.status} onValueChange={v => updateProc.mutate({ id: proc.id, status: v as any })}>
                  <SelectTrigger className={`w-32 h-7 text-xs ${statusColors[proc.status]}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="submitted">Soumis</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {proc.notes && <p className="text-xs text-muted-foreground mt-2">{proc.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectDetail() {
  const [, params] = useRoute("/projets/:id");
  const [, navigate] = useLocation();
  const projectId = parseInt((params as any)?.id ?? "0");
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);

  const { data: project, isLoading } = trpc.projects.byId.useQuery({ id: projectId });
  const { data: phases } = trpc.projects.phases.useQuery({ projectId });
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: tasks } = trpc.tasks.byProject.useQuery({ projectId });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      clientId: "",
      type: "",
      description: "",
      address: "",
      city: "",
      currentPhase: "esq",
      budgetEstimated: "",
      startDate: "",
      status: "active",
    },
  });

  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => { utils.projects.list.invalidate(); navigate("/projets"); toast.success("Projet supprimé"); },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => { utils.projects.byId.invalidate(); setEditing(false); toast.success("Projet mis à jour"); },
  });

  const startEditing = () => {
    if (project) {
      form.reset({
        name: project.name,
        clientId: project.clientId ? String(project.clientId) : "",
        type: project.type ?? "",
        description: project.description ?? "",
        address: project.address ?? "",
        city: project.city ?? "",
        currentPhase: (project.currentPhase as any) || "esq",
        budgetEstimated: project.budgetEstimated ? String(project.budgetEstimated) : "",
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
        status: (project.status as any) || "active",
      });
      setEditing(true);
    }
  };

  const onSave = (values: ProjectFormValues) => {
    updateMutation.mutate({
      id: projectId,
      ...values,
      clientId: values.clientId ? parseInt(values.clientId) : undefined,
      budgetEstimated: values.budgetEstimated ? parseFloat(values.budgetEstimated) : undefined,
      startDate: values.startDate ? new Date(values.startDate) : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Projet introuvable</p>
        <Link href="/projets"><Button variant="outline" className="mt-4">Retour aux projets</Button></Link>
      </div>
    );
  }

  const client = clients?.find(c => c.id === project.clientId);
  const phaseIndex = PHASE_ORDER.indexOf(project.currentPhase as any);
  const phaseProgress = phaseIndex >= 0 ? Math.round(((phaseIndex + 1) / PHASE_ORDER.length) * 100) : 0;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/projets">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <Badge className={getStatusColor(project.status)}>{STATUS_LABELS[project.status]}</Badge>
              <Badge className={getPhaseColor(project.currentPhase)}>{PHASE_LABELS[project.currentPhase]}</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              {client && <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{client.name}</span>}
              {project.city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{project.city}</span>}
              {project.budgetEstimated && <span className="flex items-center gap-1"><Euro className="w-3.5 h-3.5" />{formatCurrency(project.budgetEstimated)}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <Button variant="outline" size="sm" className="gap-2 h-8" onClick={startEditing}>
                <Edit2 className="w-3.5 h-3.5" />Modifier
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => { if (confirm("Supprimer ce projet ?")) deleteMutation.mutate({ id: projectId }); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" className="gap-2 h-8" onClick={form.handleSubmit(onSave)} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Enregistrer
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditing(false)}>
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progression globale</span>
            <span className="text-sm font-bold text-primary">{phaseProgress}%</span>
          </div>
          <Progress value={phaseProgress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Faisabilité</span>
            <span>Livraison</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="comments">Coordination</TabsTrigger>
          <TabsTrigger value="procedures">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Informations</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {editing ? (
                  <Form {...form}>
                    <form className="space-y-3">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Nom du projet</FormLabel>
                            <FormControl><Input {...field} className="h-8 text-sm" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Statut</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">En cours</SelectItem>
                                  <SelectItem value="on_hold">En attente</SelectItem>
                                  <SelectItem value="completed">Terminé</SelectItem>
                                  <SelectItem value="cancelled">Annulé</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="currentPhase"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Phase</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(PHASE_LABELS).map(([k, v]) => (
                                    <SelectItem key={k} value={k}>{v}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel className="text-xs">Adresse</FormLabel>
                            <FormControl><Input {...field} className="h-8 text-sm" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="budgetEstimated"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Budget estimé (€)</FormLabel>
                              <FormControl><Input {...field} type="number" className="h-8 text-sm" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-xs">Date début</FormLabel>
                              <FormControl><Input {...field} type="date" className="h-8 text-sm" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </form>
                  </Form>
                ) : (
                  <>
                    {project.type && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium">{project.type}</span>
                      </div>
                    )}
                    {project.address && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Adresse</span>
                        <span className="font-medium text-right">{project.address}</span>
                      </div>
                    )}
                    {project.startDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Démarrage</span>
                        <span className="font-medium">{formatDate(project.startDate)}</span>
                      </div>
                    )}
                    {project.endDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fin prévue</span>
                        <span className="font-medium">{formatDate(project.endDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget estimé</span>
                      <span className="font-semibold text-primary">{formatCurrency(project.budgetEstimated ?? 0)}</span>
                    </div>
                    {project.budgetActual ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Budget réel</span>
                        <span className="font-semibold">{formatCurrency(project.budgetActual)}</span>
                      </div>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3"><CardTitle className="text-sm">Tâches du projet</CardTitle></CardHeader>
              <CardContent>
                {!tasks || tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucune tâche</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.slice(0, 5).map(task => (
                      <div key={task.id} className="flex items-center gap-2 text-sm">
                        {task.status === "done" ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> :
                         task.status === "in_progress" ? <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" /> :
                         <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                        <span className={`truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                          {task.title}
                        </span>
                      </div>
                    ))}
                    {tasks.length > 5 && (
                      <p className="text-xs text-muted-foreground">+{tasks.length - 5} autres tâches</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {project.description || editing ? (
              <Card className="border-0 shadow-sm md:col-span-2">
                <CardHeader className="pb-3"><CardTitle className="text-sm">Description</CardTitle></CardHeader>
                <CardContent>
                  {editing ? (
                    <Form {...form}>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl><Textarea {...field} rows={4} className="text-sm resize-none" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Form>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="phases" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Phases du projet</CardTitle>
                <Select value={project.currentPhase} onValueChange={v => updateMutation.mutate({ id: projectId, currentPhase: v as any })}>
                  <SelectTrigger className="w-44 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PHASE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <PhaseTimeline phases={phases ?? []} currentPhase={project.currentPhase} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Documents du projet</CardTitle></CardHeader>
            <CardContent>
              <DocumentsTab projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Coordination & Commentaires</CardTitle></CardHeader>
            <CardContent>
              <CommentsTab projectId={projectId} authorName="Utilisateur" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Procédures administratives</CardTitle></CardHeader>
            <CardContent>
              <ProceduresTab projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
