import { useState } from 'react';
import { EnhancedLayout } from '@/components/EnhancedLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  TrendingUp, Plus, Search, Filter, Eye, Edit, Trash2, ChevronRight
} from 'lucide-react';

const mockOpportunities = [
  {
    id: 1,
    name: 'Rénovation Maison Toulouse',
    client: 'Maison Toulouse - AVP Fin',
    value: 150000,
    probability: 85,
    stage: 'Négociation',
    expectedClose: '2026-04-15',
    contact: 'Jean Dupont',
  },
  {
    id: 2,
    name: 'Extension Bâtiment Commercial',
    client: 'Entreprise ABC',
    value: 280000,
    probability: 60,
    stage: 'Proposition',
    expectedClose: '2026-05-30',
    contact: 'Marie Martin',
  },
  {
    id: 3,
    name: 'Aménagement Bureau',
    client: 'Startup Tech',
    value: 45000,
    probability: 40,
    stage: 'Prospection',
    expectedClose: '2026-06-15',
    contact: 'Pierre Bernard',
  },
  {
    id: 4,
    name: 'Restructuration Immeuble',
    client: 'Groupe Immobilier',
    value: 520000,
    probability: 75,
    stage: 'Négociation',
    expectedClose: '2026-03-30',
    contact: 'Sophie Lefevre',
  },
  {
    id: 5,
    name: 'Maison Écologique',
    client: 'Particulier',
    value: 180000,
    probability: 30,
    stage: 'Prospection',
    expectedClose: '2026-07-01',
    contact: 'Luc Moreau',
  },
];

const stageColors = {
  'Prospection': 'bg-gray-100 text-gray-800',
  'Proposition': 'bg-blue-100 text-blue-800',
  'Négociation': 'bg-orange-100 text-orange-800',
  'Gagné': 'bg-green-100 text-green-800',
  'Perdu': 'bg-red-100 text-red-800',
};

export default function Opportunities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [opportunities, setOpportunities] = useState(mockOpportunities);

  const filteredOpportunities = opportunities.filter(opp =>
    opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredOpportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = filteredOpportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);

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
                {filteredOpportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">{opp.name}</p>
                        <p className="text-xs text-muted-foreground">{opp.contact}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">{opp.client}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{(opp.value / 1000).toFixed(0)}k €</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${opp.probability}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">{opp.probability}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={stageColors[opp.stage as keyof typeof stageColors]}>
                        {opp.stage}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(opp.expectedClose).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </EnhancedLayout>
  );
}
