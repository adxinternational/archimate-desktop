import { useState } from 'react';
import { EnhancedLayout } from '@/components/EnhancedLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  TrendingUp, Plus, Search, Filter, Eye, Edit, Trash2, ChevronRight, Loader2
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ContextMenu, CommonContextActions } from '@/components/ContextMenu';
import { toast } from 'sonner';

const stageLabels: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  qualified: 'Qualifié',
  proposal: 'Proposition',
  negotiation: 'Négociation',
  won: 'Gagné',
  lost: 'Perdu',
};

const stageColors: Record<string, string> = {
  new: 'bg-gray-100 text-gray-800',
  contacted: 'bg-blue-100 text-blue-800',
  qualified: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-purple-100 text-purple-800',
  negotiation: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export default function Opportunities() {
  const [searchTerm, setSearchTerm] = useState('');
  const utils = trpc.useUtils();

  const { data: leadsData, isLoading } = trpc.leads.list.useQuery();
  const leads = Array.isArray(leadsData) ? leadsData : [];
  const deleteMutation = trpc.leads.delete.useMutation({
    onSuccess: () => {
      toast.success("Opportunité supprimée");
      utils.leads.list.invalidate();
    },
  });

  const filteredOpportunities = leads.filter(opp =>
    opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opp.company || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredOpportunities.reduce((sum, opp) => sum + parseFloat(opp.value || '0'), 0);
  
  // Dynamic probability based on status
  const getProbability = (status: string) => {
    switch (status) {
      case 'new': return 10;
      case 'contacted': return 25;
      case 'qualified': return 50;
      case 'proposal': return 75;
      case 'negotiation': return 90;
      case 'won': return 100;
      case 'lost': return 0;
      default: return 0;
    }
  };

  const weightedValue = filteredOpportunities.reduce((sum, opp) => sum + (parseFloat(opp.value || '0') * getProbability(opp.status) / 100), 0);

  return (
    <EnhancedLayout title="Opportunités">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Opportunités</h2>
            <p className="text-sm text-muted-foreground mt-1">Gérez votre pipeline de ventes</p>
          </div>
          <Button className="gap-2">
            <Plus size={18} />
            Nouvelle opportunité
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Valeur totale</p>
            <p className="text-3xl font-bold text-foreground">
              {(totalValue / 1000).toFixed(0)}k €
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Valeur pondérée</p>
            <p className="text-3xl font-bold text-foreground">
              {(weightedValue / 1000).toFixed(0)}k €
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Nombre d'opportunités</p>
            <p className="text-3xl font-bold text-foreground">{filteredOpportunities.length}</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher une opportunité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter size={18} />
              Filtrer
            </Button>
          </div>
        </Card>

        {/* Opportunities Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Client</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Valeur</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Probabilité</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Étape</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Fermeture</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    </td>
                  </tr>
                ) : filteredOpportunities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Aucune opportunité trouvée
                    </td>
                  </tr>
                ) : (
                  filteredOpportunities.map((opp) => {
                    const prob = getProbability(opp.status);
                    const actions = [
                      CommonContextActions.view(() => console.log('View', opp.id)),
                      CommonContextActions.edit(() => console.log('Edit', opp.id)),
                      CommonContextActions.delete(() => {
                        if (confirm('Supprimer cette opportunité ?')) {
                          deleteMutation.mutate({ id: opp.id });
                        }
                      }),
                    ];

                    return (
                      <tr key={opp.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">{opp.name}</p>
                            <p className="text-xs text-muted-foreground">{opp.email || opp.phone || '-'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{opp.company || '-'}</td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-foreground">{(parseFloat(opp.value || '0') / 1000).toFixed(0)}k €</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${prob}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-foreground">{prob}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={stageColors[opp.status]}>
                            {stageLabels[opp.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {opp.createdAt ? new Date(opp.createdAt).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end">
                            <ContextMenu actions={actions} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </EnhancedLayout>
  );
}
