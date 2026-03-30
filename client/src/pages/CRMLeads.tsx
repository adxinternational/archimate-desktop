import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-purple-100 text-purple-800",
  proposal: "bg-orange-100 text-orange-800",
  negotiation: "bg-pink-100 text-pink-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

const sourceColors = {
  website: "bg-blue-50 text-blue-700",
  referral: "bg-green-50 text-green-700",
  cold_call: "bg-yellow-50 text-yellow-700",
  email: "bg-purple-50 text-purple-700",
  event: "bg-pink-50 text-pink-700",
  other: "bg-gray-50 text-gray-700",
};

export default function CRMLeads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);

  // Mock data - replace with actual tRPC query
  const leads = [
    {
      id: 1,
      name: "Dupont Architecture",
      email: "contact@dupont.fr",
      company: "Dupont SARL",
      source: "referral",
      status: "qualified",
      value: 150000,
      expectedCloseDate: "2026-04-30",
    },
    {
      id: 2,
      name: "Martin Immobilier",
      email: "info@martin.fr",
      company: "Martin & Co",
      source: "website",
      status: "proposal",
      value: 250000,
      expectedCloseDate: "2026-05-15",
    },
    {
      id: 3,
      name: "Leclerc Construction",
      email: "contact@leclerc.fr",
      company: "Leclerc BTP",
      source: "cold_call",
      status: "contacted",
      value: 180000,
      expectedCloseDate: "2026-06-01",
    },
  ];

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const totalValue = filteredLeads.reduce((sum, lead) => sum + lead.value, 0);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Gestion des Leads</h1>
            <p className="text-muted-foreground">
              Pipeline commercial - {filteredLeads.length} leads - Valeur totale: {totalValue.toLocaleString()} €
            </p>
          </div>
          <Button onClick={() => setShowNewLeadForm(!showNewLeadForm)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Lead
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, entreprise ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="contacted">Contacté</SelectItem>
                  <SelectItem value="qualified">Qualifié</SelectItem>
                  <SelectItem value="proposal">Proposition</SelectItem>
                  <SelectItem value="negotiation">Négociation</SelectItem>
                  <SelectItem value="won">Gagné</SelectItem>
                  <SelectItem value="lost">Perdu</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sources</SelectItem>
                  <SelectItem value="website">Site web</SelectItem>
                  <SelectItem value="referral">Recommandation</SelectItem>
                  <SelectItem value="cold_call">Appel froid</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="event">Événement</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground mb-4">Aucun lead ne correspond à vos critères</p>
                <Button variant="outline">Réinitialiser les filtres</Button>
              </CardContent>
            </Card>
          ) : (
            filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{lead.name}</h3>
                        <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                          {lead.status}
                        </Badge>
                        <Badge variant="outline" className={sourceColors[lead.source as keyof typeof sourceColors]}>
                          {lead.source}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground">{lead.company}</p>
                          <p>{lead.email}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Valeur</p>
                          <p>{lead.value.toLocaleString()} €</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Clôture prévue</p>
                          <p>{new Date(lead.expectedCloseDate).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Probabilité</p>
                          <p>75%</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pipeline Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Résumé du Pipeline</CardTitle>
            <CardDescription>Valeur par statut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["new", "contacted", "qualified", "proposal"].map((status) => {
                const statusLeads = leads.filter((l) => l.status === status);
                const statusValue = statusLeads.reduce((sum, l) => sum + l.value, 0);
                return (
                  <div key={status} className="p-4 bg-accent rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground capitalize mb-1">{status}</p>
                    <p className="text-2xl font-bold text-foreground">{statusLeads.length}</p>
                    <p className="text-xs text-muted-foreground">{statusValue.toLocaleString()} €</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
