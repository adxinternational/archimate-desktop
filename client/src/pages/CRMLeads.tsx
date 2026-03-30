import { useState } from "react";
import { EnhancedLayout } from "@/components/EnhancedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ChevronRight, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "prospect" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  source: "website" | "referral" | "event" | "cold_call" | "other";
  value: number;
  lastContact: string;
}

const MOCK_LEADS: Lead[] = [
  {
    id: "1",
    name: "Jean Dupont",
    company: "Dupont Architecture",
    email: "jean@dupont-arch.fr",
    phone: "+33 6 12 34 56 78",
    status: "qualified",
    source: "referral",
    value: 150000,
    lastContact: "2026-03-28",
  },
  {
    id: "2",
    name: "Marie Martin",
    company: "Martin Immobilier",
    email: "marie@martin-immo.fr",
    phone: "+33 6 98 76 54 32",
    status: "proposal",
    source: "website",
    value: 250000,
    lastContact: "2026-03-25",
  },
  {
    id: "3",
    name: "Pierre Leclerc",
    company: "Leclerc Construction",
    email: "pierre@leclerc-const.fr",
    phone: "+33 6 55 66 77 88",
    status: "contacted",
    source: "event",
    value: 180000,
    lastContact: "2026-03-20",
  },
  {
    id: "4",
    name: "Sophie Bernard",
    company: "Bernard Développement",
    email: "sophie@bernard-dev.fr",
    phone: "+33 6 11 22 33 44",
    status: "prospect",
    source: "cold_call",
    value: 120000,
    lastContact: "2026-03-15",
  },
  {
    id: "5",
    name: "Thomas Rousseau",
    company: "Rousseau Immobilier",
    email: "thomas@rousseau-immo.fr",
    phone: "+33 6 99 88 77 66",
    status: "won",
    source: "referral",
    value: 320000,
    lastContact: "2026-03-10",
  },
];

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect",
  contacted: "Contacté",
  qualified: "Qualifié",
  proposal: "Proposition",
  won: "Gagné",
  lost: "Perdu",
};

const STATUS_COLORS: Record<string, string> = {
  prospect: "bg-gray-100 text-gray-800",
  contacted: "bg-blue-100 text-blue-800",
  qualified: "bg-yellow-100 text-yellow-800",
  proposal: "bg-purple-100 text-purple-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

export default function CRMLeads() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalValue = filteredLeads.reduce((sum, lead) => sum + lead.value, 0);
  const statusCounts = {
    prospect: leads.filter((l) => l.status === "prospect").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    proposal: leads.filter((l) => l.status === "proposal").length,
    won: leads.filter((l) => l.status === "won").length,
    lost: leads.filter((l) => l.status === "lost").length,
  };

  return (
    <EnhancedLayout title="Gestion des Leads">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gérez votre pipeline commercial et suivez vos opportunités
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate("/crm/leads/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Lead
          </Button>
        </div>

        {/* Pipeline Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card 
              key={status}
              className={`cursor-pointer transition-all ${selectedStatus === status ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
            >
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{STATUS_LABELS[status]}</p>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Recherche et Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, entreprise ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Value */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Valeur du Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {(totalValue / 1000).toFixed(0)}k €
            </div>
            <p className="text-sm text-blue-700">
              {filteredLeads.length} lead{filteredLeads.length > 1 ? "s" : ""} sélectionné{filteredLeads.length > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Leads List */}
        <div className="space-y-3">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <Card 
                key={lead.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/crm/leads/${lead.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{lead.name}</h3>
                        <Badge className={STATUS_COLORS[lead.status]}>
                          {STATUS_LABELS[lead.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{lead.company}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>📧 {lead.email}</span>
                        <span>📞 {lead.phone}</span>
                        <span>💰 {(lead.value / 1000).toFixed(0)}k €</span>
                        <span>📅 {new Date(lead.lastContact).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Aucun lead ne correspond à votre recherche</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </EnhancedLayout>
  );
}
