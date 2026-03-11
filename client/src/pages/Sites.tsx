import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Plus, Search, HardHat, MapPin, ArrowRight, Calendar,
  BookOpen, Users, AlertTriangle, ChevronDown, Trash2
} from "lucide-react";
import { formatDate, getSiteStatusColor, SITE_STATUS_LABELS, getIncidentSeverityColor, INCIDENT_SEVERITY_LABELS } from "@/lib/constants";

function SiteCard({ site, projectName }: { site: any; projectName?: string }) {
  return (
    <Link href={`/chantier/${site.id}`}>
      <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 mr-2">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {site.name}
              </h3>
              {projectName && <p className="text-xs text-muted-foreground mt-0.5">{projectName}</p>}
            </div>
            <Badge className={`text-xs flex-shrink-0 ${getSiteStatusColor(site.status)}`}>
              {SITE_STATUS_LABELS[site.status]}
            </Badge>
          </div>
          {site.address && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate">{site.address}</span>
            </div>
          )}
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Avancement</span>
              <span className="font-medium text-foreground">{site.progress ?? 0}%</span>
            </div>
            <Progress value={site.progress ?? 0} className="h-1.5" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {site.startDate && (
              <div className="text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 inline mr-1" />
                {formatDate(site.startDate)}
              </div>
            )}
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Sites() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", projectId: "", address: "", progress: "0",
    startDate: "", status: "planning" as const,
  });

  const { data: sites, isLoading } = trpc.sites.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.sites.create.useMutation({
    onSuccess: () => {
      utils.sites.list.invalidate();
      setCreateOpen(false);
      setForm({ name: "", projectId: "", address: "", progress: "0", startDate: "", status: "planning" });
      toast.success("Chantier créé");
    },
    onError: (err) => toast.error("Erreur : " + err.message),
  });

  const filtered = (sites ?? []).filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chantier</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{sites?.length ?? 0} chantier(s) suivi(s)</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Nouveau chantier</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau chantier</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Nom du chantier <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Chantier Villa Dupont" />
              </div>
              <div className="space-y-1.5">
                <Label>Projet associé</Label>
                <Select value={form.projectId} onValueChange={v => setForm(f => ({ ...f, projectId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un projet" /></SelectTrigger>
                  <SelectContent>
                    {projects?.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Adresse</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Adresse du chantier" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as any }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planification</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="paused">Pausé</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Date de début</Label>
                  <Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
                <Button
                  onClick={() => createMutation.mutate({
                    name: form.name,
                    projectId: form.projectId ? parseInt(form.projectId) : 0,
                    address: form.address || undefined,
                    progress: parseInt(form.progress) || 0,
                    startDate: form.startDate ? new Date(form.startDate) : undefined,
                    status: form.status,
                  })}
                  disabled={!form.name || !form.projectId || createMutation.isPending}
                >
                  Créer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un chantier..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 bg-card"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <HardHat className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">Aucun chantier</p>
          <p className="text-sm mt-1">Créez votre premier suivi de chantier</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(site => {
            const project = projects?.find(p => p.id === site.projectId);
            return <SiteCard key={site.id} site={site} projectName={project?.name} />;
          })}
        </div>
      )}
    </div>
  );
}
