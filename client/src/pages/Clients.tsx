import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users, Mail, Phone, MapPin, ArrowRight, Building2, User, Landmark } from "lucide-react";
import { CLIENT_TYPE_LABELS, getStatusColor, STATUS_LABELS } from "@/lib/constants";

const CLIENT_STATUS_COLORS: Record<string, string> = {
  prospect: "bg-yellow-100 text-yellow-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
};
const CLIENT_STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect",
  active: "Actif",
  inactive: "Inactif",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  individual: User,
  company: Building2,
  public: Landmark,
};

export default function Clients() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "prospect" | "active" | "inactive">("all");

  const { data: clients, isLoading } = trpc.clients.list.useQuery();
  const { data: projects } = trpc.projects.list.useQuery();

  const filtered = (clients ?? []).filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusFilters = [
    { key: "all" as const, label: "Tous", count: clients?.length ?? 0 },
    { key: "active" as const, label: "Actifs", count: clients?.filter(c => c.status === "active").length ?? 0 },
    { key: "prospect" as const, label: "Prospects", count: clients?.filter(c => c.status === "prospect").length ?? 0 },
    { key: "inactive" as const, label: "Inactifs", count: clients?.filter(c => c.status === "inactive").length ?? 0 },
  ];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{clients?.length ?? 0} client(s) enregistré(s)</p>
        </div>
        <Link href="/clients/nouveau">
          <Button size="sm" className="gap-2"><Plus className="w-4 h-4" />Nouveau client</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex gap-2">
          {statusFilters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                filterStatus === f.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === f.key ? "bg-white/20" : "bg-muted"}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">Aucun client trouvé</p>
          {!search && (
            <Link href="/clients/nouveau">
              <Button size="sm" className="mt-4 gap-2"><Plus className="w-4 h-4" />Ajouter un client</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => {
            const TypeIcon = TYPE_ICONS[client.type] ?? User;
            const clientProjects = projects?.filter(p => p.clientId === client.id) ?? [];
            const activeProjects = clientProjects.filter(p => p.status === "active").length;

            return (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TypeIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {client.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{CLIENT_TYPE_LABELS[client.type]}</Badge>
                          <Badge className={`text-xs ${CLIENT_STATUS_COLORS[client.status]}`}>
                            {CLIENT_STATUS_LABELS[client.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      {client.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{client.city}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <div className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{clientProjects.length}</span> projet(s)
                        {activeProjects > 0 && <span className="text-green-600 ml-1">({activeProjects} actif{activeProjects > 1 ? "s" : ""})</span>}
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
