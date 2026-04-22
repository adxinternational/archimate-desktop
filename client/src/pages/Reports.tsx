import { useState } from 'react';
import { EnhancedLayout } from '@/components/EnhancedLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download, Eye, Trash2, Plus, Filter, FileDown, Table } from 'lucide-react';
import { FinancialChart } from '@/components/FinancialChart';
import { exportToCSV, exportToExcel } from '@/lib/exportUtils';
import { ContextMenu, CommonContextActions } from '@/components/ContextMenu';
import { toast } from 'sonner';

const mockReports = [
  {
    id: 1,
    name: 'Synthèse financière Q1 2026',
    type: 'Financier',
    date: '2026-03-11',
    status: 'Généré',
    size: '2.4 MB',
  },
  {
    id: 2,
    name: 'Performance projets février',
    type: 'Performance',
    date: '2026-03-01',
    status: 'Généré',
    size: '1.8 MB',
  },
  {
    id: 3,
    name: 'Analyse des coûts par projet',
    type: 'Coûts',
    date: '2026-02-28',
    status: 'Généré',
    size: '3.1 MB',
  },
  {
    id: 4,
    name: 'Rapport d\'activité équipe',
    type: 'Équipe',
    date: '2026-02-15',
    status: 'Généré',
    size: '1.5 MB',
  },
];

const chartData = [
  { month: 'Jan', revenue: 45000, costs: 32000, margin: 13000 },
  { month: 'Fév', revenue: 52000, costs: 35000, margin: 17000 },
  { month: 'Mar', revenue: 48000, costs: 33000, margin: 15000 },
];

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <EnhancedLayout title="Rapports">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Rapports</h2>
            <p className="text-sm text-muted-foreground mt-1">Gérez et téléchargez vos rapports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportToCSV(filteredReports, 'rapports')}>
              <FileDown size={18} />
              Exporter CSV
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => exportToExcel(filteredReports, 'rapports')}>
              <Table size={18} />
              Exporter Excel
            </Button>
            <Button className="gap-2">
              <Plus size={18} />
              Créer un rapport
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un rapport..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Type de rapport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="Financier">Financier</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
                <SelectItem value="Coûts">Coûts</SelectItem>
                <SelectItem value="Équipe">Équipe</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter size={18} />
              Filtrer
            </Button>
          </div>
        </Card>

        {/* Reports List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Nom</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Taille</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Statut</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReports.map((report) => {
                  const actions = [
                    CommonContextActions.view(() => console.log('View', report.id)),
                    {
                      id: 'download',
                      label: 'Télécharger',
                      icon: <Download size={16} />,
                      onClick: () => exportToCSV([report], `rapport_${report.id}`),
                    },
                    CommonContextActions.delete(() => toast.success('Rapport supprimé')),
                  ];

                  return (
                    <tr key={report.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="text-muted-foreground" size={18} />
                          <span className="font-medium text-foreground">{report.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(report.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{report.size}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <ContextMenu actions={actions} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Chart Preview */}
        <FinancialChart
          data={chartData}
          title="Aperçu - Synthèse financière"
          type="area"
          height={350}
        />
      </div>
    </EnhancedLayout>
  );
}
