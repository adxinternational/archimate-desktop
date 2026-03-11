import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Search, FolderOpen, ArrowRight, Filter, SortAsc
} from "lucide-react";
import {
  formatCurrency, formatDate, getPhaseColor, getStatusColor,
  PHASE_LABELS, STATUS_LABELS, PHASE_ORDER
} from "@/lib/constants";
import { Progress } from "@/components/ui/progress";

type FilterStatus = "all" | "active" | "on_hold" | "completed" | "cancelled";
type FilterPhase = "all" | string;

export default function Projects() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const { data: projects, isLoading } = trpc.projects.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();

  const filtered = (projects ?? []).filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      clients?.find(c => c.id === p.clientId)?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusFilters: { key: FilterStatus; label: string; count: number }[] = [
    { key: "all", label: "Tous", count: projects?.length ?? 0 },
    { key: "active", label: "En cours", count: projects?.filter(p => p.status === "active").length ?? 0 },
    { key: "on_hold", label: "En attente", count: projects?.filter(p => p.status === "on_hold").length ?? 0 },
    { key: "completed", label: "Terminés", count: projects?.filter(p => p.status === "completed").length ?? 0 },
  ];

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects?.length ?? 0} projet(s) au total</p>
        </div>
        <Link href="/projets/nouveau">
          <Button size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un projet ou client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
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
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                filterStatus === f.key ? "bg-white/20" : "bg-muted"
              }`}>{f.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FolderOpen className="w-14 h-14 mx-auto mb-3 opacity-20" />
          <p className="text-base font-medium">Aucun projet trouvé</p>
          <p className="text-sm mt-1">
            {search ? "Modifiez votre recherche" : "Créez votre premier projet"}
          </p>
          {!search && (
            <Link href="/projets/nouveau">
              <Button size="sm" className="mt-4 gap-2">
                <Plus className="w-4 h-4" />
                Créer un projet
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(project => {
            const client = clients?.find(c => c.id === project.clientId);
            const phaseIndex = PHASE_ORDER.indexOf(project.currentPhase as any);
            const phaseProgress = phaseIndex >= 0 ? Math.round(((phaseIndex + 1) / PHASE_ORDER.length) * 100) : 0;

            return (
              <Link key={project.id} href={`/projets/${project.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group h-full">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </h3>
                        {client && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{client.name}</p>
                        )}
                      </div>
                      <Badge className={`text-xs flex-shrink-0 ${getStatusColor(project.status)}`}>
                        {STATUS_LABELS[project.status]}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`text-xs ${getPhaseColor(project.currentPhase)}`}>
                        {PHASE_LABELS[project.currentPhase]}
                      </Badge>
                      {project.city && (
                        <span className="text-xs text-muted-foreground truncate">{project.city}</span>
                      )}
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progression des phases</span>
                        <span>{phaseProgress}%</span>
                      </div>
                      <Progress value={phaseProgress} className="h-1.5" />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Budget estimé</p>
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(project.budgetEstimated ?? 0)}</p>
                      </div>
                      {project.startDate && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Démarrage</p>
                          <p className="text-xs font-medium">{formatDate(project.startDate)}</p>
                        </div>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
