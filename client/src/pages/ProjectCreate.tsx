import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { Link } from "wouter";
import { PHASE_LABELS } from "@/lib/constants";

const PROJECT_TYPES = [
  "Logement individuel", "Logement collectif", "Bureaux", "Commerce",
  "Équipement public", "Réhabilitation", "Urbanisme", "Autre"
];

export default function ProjectCreate() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [form, setForm] = useState({
    name: "",
    clientId: "",
    type: "",
    description: "",
    address: "",
    city: "",
    currentPhase: "esq" as const,
    budgetEstimated: "",
    startDate: "",
  });

  const { data: clients } = trpc.clients.list.useQuery();

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: (data: any) => {
      utils.projects.list.invalidate();
      toast.success("Projet créé avec succès");
      navigate(`/projects/${(data as any)?.id ?? ""}`);
    },
    onError: (err) => toast.error("Erreur : " + err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Le nom du projet est requis"); return; }
    createMutation.mutate({
      name: form.name,
      clientId: form.clientId ? parseInt(form.clientId) : undefined,
      type: form.type || undefined,
      description: form.description || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      currentPhase: form.currentPhase,
      budgetEstimated: form.budgetEstimated ? parseFloat(form.budgetEstimated) : undefined,
      startDate: form.startDate ? new Date(form.startDate) : undefined,
    });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Nouveau projet</h1>
          <p className="text-sm text-muted-foreground">Créer un nouveau projet architectural</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              Informations générales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom du projet <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="Ex: Villa Dupont - Réhabilitation"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client">Client</Label>
                <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="type">Type de projet</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description du projet..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="bg-background resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  placeholder="Adresse du projet"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  placeholder="Ville"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phase">Phase initiale</Label>
                <Select value={form.currentPhase} onValueChange={v => setForm(f => ({ ...f, currentPhase: v as any }))}>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PHASE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget">Budget estimé (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="0"
                  value={form.budgetEstimated}
                  onChange={e => setForm(f => ({ ...f, budgetEstimated: e.target.value }))}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startDate">Date de démarrage</Label>
              <Input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="bg-background"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-6 justify-end">
          <Link href="/projects">
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
          <Button type="submit" disabled={createMutation.isPending} className="gap-2">
            {createMutation.isPending ? "Création..." : "Créer le projet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
