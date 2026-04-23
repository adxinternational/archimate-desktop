import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { EnhancedLayout } from "@/components/EnhancedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, ChevronRight, TrendingUp, Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau", contacted: "Contacté", qualified: "Qualifié",
  proposal: "Proposition", negotiation: "Négociation", won: "Gagné", lost: "Perdu",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-700",
  contacted: "bg-blue-100 text-blue-700",
  qualified: "bg-yellow-100 text-yellow-700",
  proposal: "bg-purple-100 text-purple-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};
const SOURCE_LABELS: Record<string, string> = {
  website: "Site web", referral: "Recommandation", cold_call: "Prospection",
  email: "Email", event: "Événement", other: "Autre",
};

const STATUSES = ["new", "contacted", "qualified", "proposal", "negotiation", "won", "lost"] as const;
const SOURCES = ["website", "referral", "cold_call", "email", "event", "other"] as const;

export default function CRMLeads() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<number | null>(null);
  const [form, setForm] = useState<{
    name: string; email: string; phone: string; company: string;
    source: typeof SOURCES[number]; value: string;
  }>({ name: "", email: "", phone: "", company: "", source: "other", value: "" });

  // ── Données réelles ──────────────────────────────────────
  const { data: leadsData, isLoading, refetch } = trpc.leads.list.useQuery();
  const leads = Array.isArray(leadsData) ? leadsData : [];

  const createLead = trpc.leads.create.useMutation({
    onSuccess: () => { refetch(); setShowCreate(false); resetForm(); toast.success("Lead créé"); },
    onError: () => toast.error("Erreur lors de la création"),
  });

  const updateLead = trpc.leads.updateStatus.useMutation({
    onSuccess: () => { refetch(); toast.success("Statut mis à jour"); },
  });

  const convertToClient = trpc.leads.convertToClient.useMutation({
    onSuccess: () => { refetch(); setShowDetail(null); toast.success("Lead converti en client !"); },
    onError: () => toast.error("Erreur lors de la conversion"),
  });

  function resetForm() {
    setForm({ name: "", email: "", phone: "", company: "", source: "other", value: "" });
  }

  // ── Filtres & stats ──────────────────────────────────────
  const filtered = leads.filter(l => {
    const matchSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.company ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (l.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalValue = filtered.reduce((s, l) => s + parseFloat(l.value ?? "0"), 0);
  const counts = STATUSES.reduce((acc, s) => ({
    ...acc, [s]: leads.filter(l => l.status === s).length
  }), {} as Record<string, number>);

  const selectedLead = showDetail ? leads.find(l => l.id === showDetail) : null;

  function fmt(n: number) {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  }

  return (
    <EnhancedLayout title="Gestion des Leads">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Pipeline commercial — prospects et opportunités</p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} className="mr-2" /> Nouveau lead
          </Button>
        </div>

        {/* Pipeline kanban-summary */}
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-2">
          {STATUSES.map(status => (
            <Card
              key={status}
              className={`cursor-pointer transition-all border ${filterStatus === status ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setFilterStatus(filterStatus === status ? null : status)}
            >
              <CardContent className="pt-3 pb-3 px-3">
                <p className="text-xs text-muted-foreground truncate">{STATUS_LABELS[status]}</p>
                <p className="text-xl font-bold">{counts[status] ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Valeur pipeline */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              <span className="font-medium text-blue-900">Valeur pipeline</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">{fmt(totalValue)}</p>
              <p className="text-xs text-blue-600">{filtered.length} lead{filtered.length > 1 ? "s" : ""}</p>
            </div>
          </CardContent>
        </Card>

        {/* Recherche */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, entreprise, email…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" size={20} /> Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-10 text-center text-muted-foreground text-sm">
            {leads.length === 0
              ? "Aucun lead. Commencez par en créer un."
              : "Aucun résultat pour ces filtres."}
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(lead => (
              <Card
                key={lead.id}
                className="hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => setShowDetail(lead.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">{lead.name}</p>
                        <Badge className={STATUS_COLORS[lead.status] + " text-xs shrink-0"}>
                          {STATUS_LABELS[lead.status]}
                        </Badge>
                        {lead.convertedClientId && (
                          <Badge className="bg-green-100 text-green-700 text-xs shrink-0">
                            <UserCheck size={10} className="mr-1" /> Client
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                        {lead.company && <span>{lead.company}</span>}
                        {lead.email && <span>{lead.email}</span>}
                        <span>{SOURCE_LABELS[lead.source]}</span>
                        {parseFloat(lead.value ?? "0") > 0 && (
                          <span className="font-medium text-foreground">{fmt(parseFloat(lead.value ?? "0"))}</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog — Créer lead */}
      <Dialog open={showCreate} onOpenChange={v => { setShowCreate(v); if (!v) resetForm(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau lead</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Nom *</label>
              <Input className="mt-1" placeholder="Prénom Nom" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Entreprise</label>
              <Input className="mt-1" placeholder="Nom de l'entreprise" value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input className="mt-1" type="email" placeholder="email@exemple.fr" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input className="mt-1" placeholder="+33 6 00 00 00 00" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Source</label>
                <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v as typeof SOURCES[number] }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SOURCES.map(s => <SelectItem key={s} value={s}>{SOURCE_LABELS[s]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Valeur estimée (€)</label>
                <Input className="mt-1" type="number" placeholder="0" value={form.value}
                  onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button
              onClick={() => createLead.mutate({ name: form.name, email: form.email || undefined, phone: form.phone || undefined, company: form.company || undefined, source: form.source, value: form.value || undefined })}
              disabled={createLead.isPending || !form.name}
            >
              {createLead.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog — Détail lead */}
      <Dialog open={!!showDetail} onOpenChange={v => !v && setShowDetail(null)}>
        <DialogContent>
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedLead.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Entreprise</p><p className="font-medium">{selectedLead.company || "—"}</p></div>
                  <div><p className="text-muted-foreground">Source</p><p className="font-medium">{SOURCE_LABELS[selectedLead.source]}</p></div>
                  <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedLead.email || "—"}</p></div>
                  <div><p className="text-muted-foreground">Téléphone</p><p className="font-medium">{selectedLead.phone || "—"}</p></div>
                  <div><p className="text-muted-foreground">Valeur</p><p className="font-medium">{fmt(parseFloat(selectedLead.value ?? "0"))}</p></div>
                  <div><p className="text-muted-foreground">Statut</p>
                    <Badge className={STATUS_COLORS[selectedLead.status]}>{STATUS_LABELS[selectedLead.status]}</Badge>
                  </div>
                </div>

                {/* Changer statut */}
                <div>
                  <p className="text-sm font-medium mb-2">Changer le statut</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.filter(s => s !== selectedLead.status).map(s => (
                      <Button key={s} size="sm" variant="outline" className="text-xs h-7"
                        onClick={() => updateLead.mutate({ id: selectedLead.id, status: s })}>
                        → {STATUS_LABELS[s]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Convertir en client */}
                {selectedLead.status === "won" && !selectedLead.convertedClientId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-green-900 mb-2">Lead gagné — Créer la fiche client</p>
                    <p className="text-xs text-green-700 mb-3">Convertissez ce lead en client pour créer un projet.</p>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => convertToClient.mutate({ id: selectedLead.id })}
                      disabled={convertToClient.isPending}
                    >
                      <UserCheck size={14} className="mr-2" />
                      Convertir en client
                    </Button>
                  </div>
                )}

                {selectedLead.convertedClientId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                    <UserCheck size={16} className="text-green-600" />
                    <p className="text-sm text-green-800">Converti en client (ID #{selectedLead.convertedClientId})</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </EnhancedLayout>
  );
}
