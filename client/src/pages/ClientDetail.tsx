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
  ArrowLeft, Edit2, Trash2, Mail, Phone, MapPin, FolderOpen,
  Save, X, Building2, User, Landmark, Loader2
} from "lucide-react";
import { formatCurrency, formatDate, getPhaseColor, getStatusColor, PHASE_LABELS, STATUS_LABELS, CLIENT_TYPE_LABELS } from "@/lib/constants";

const clientSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  type: z.enum(["individual", "company", "public"]),
  email: z.string().email("Email invalide").or(z.literal("")).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["prospect", "active", "inactive"]),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const CLIENT_STATUS_COLORS: Record<string, string> = {
  prospect: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
};
const CLIENT_STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect", active: "Actif", inactive: "Inactif",
};
const TYPE_ICONS: Record<string, React.ElementType> = {
  individual: User, company: Building2, public: Landmark,
};

export default function ClientDetail() {
  const [, params] = useRoute("/clients/:id");
  const [, navigate] = useLocation();
  const clientId = parseInt((params as any)?.id ?? "0");
  const utils = trpc.useUtils();
  const [editing, setEditing] = useState(false);

  const { data: client, isLoading } = trpc.clients.byId.useQuery({ id: clientId });
  const { data: clientProjects } = trpc.clients.projects.useQuery({ clientId });

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      type: "individual",
      email: "",
      phone: "",
      address: "",
      city: "",
      notes: "",
      status: "active",
    },
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => { utils.clients.byId.invalidate(); utils.clients.list.invalidate(); setEditing(false); toast.success("Client mis à jour"); },
    onError: (err) => toast.error("Erreur : " + err.message),
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); navigate("/clients"); toast.success("Client supprimé"); },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Client introuvable</p>
        <Link href="/clients"><Button variant="outline" className="mt-4">Retour</Button></Link>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[client.type] ?? User;

  const startEditing = () => {
    if (client) {
      form.reset({
        name: client.name,
        type: client.type as any,
        email: client.email ?? "",
        phone: client.phone ?? "",
        address: client.address ?? "",
        city: client.city ?? "",
        notes: client.notes ?? "",
        status: client.status as any,
      });
      setEditing(true);
    }
  };

  const onSave = (values: ClientFormValues) => {
    updateMutation.mutate({ id: clientId, ...values });
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Link href="/clients">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs">{CLIENT_TYPE_LABELS[client.type]}</Badge>
                <Badge className={`text-xs ${CLIENT_STATUS_COLORS[client.status]}`}>{CLIENT_STATUS_LABELS[client.status]}</Badge>
              </div>
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
                variant="outline" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => { if (confirm("Supprimer ce client ?")) deleteMutation.mutate({ id: clientId }); }}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Info Card */}
        <Card className="border-0 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Coordonnées</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {editing ? (
              <Form {...form}>
                <form className="space-y-3">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs">Nom</FormLabel>
                        <FormControl><Input {...field} className="h-8 text-sm" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            <SelectItem value="prospect">Prospect</SelectItem>
                            <SelectItem value="active">Actif</SelectItem>
                            <SelectItem value="inactive">Inactif</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Email</FormLabel>
                          <FormControl><Input {...field} type="email" className="h-8 text-sm" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Téléphone</FormLabel>
                          <FormControl><Input {...field} className="h-8 text-sm" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
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
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-xs">Ville</FormLabel>
                          <FormControl><Input {...field} className="h-8 text-sm" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs">Notes</FormLabel>
                        <FormControl><Textarea {...field} rows={3} className="text-sm resize-none" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            ) : (
              <>
                {client.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a href={`mailto:${client.email}`} className="text-primary hover:underline truncate">{client.email}</a>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a href={`tel:${client.phone}`} className="hover:underline">{client.phone}</a>
                  </div>
                )}
                {(client.address || client.city) && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{[client.address, client.city].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {client.notes && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{client.notes}</p>
                  </div>
                )}
                <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                  Client depuis le {formatDate(client.createdAt)}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                Projets ({clientProjects?.length ?? 0})
              </CardTitle>
              <Link href={`/projects/create`}>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                  + Nouveau projet
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!clientProjects || clientProjects.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Aucun projet pour ce client</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientProjects.map(project => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer group">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{project.name}</p>
                          <Badge className={`text-xs ${getStatusColor(project.status)}`}>{STATUS_LABELS[project.status]}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={`text-xs ${getPhaseColor(project.currentPhase)}`}>{PHASE_LABELS[project.currentPhase]}</Badge>
                          {project.city && <span className="text-xs text-muted-foreground">{project.city}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold">{formatCurrency(project.budgetEstimated ?? 0)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
