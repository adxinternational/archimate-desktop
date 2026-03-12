import { useMemo } from 'react';
import { EnhancedLayout } from '@/components/EnhancedLayout';
import { KPICard } from '@/components/KPICard';
import { FinancialChart } from '@/components/FinancialChart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign, TrendingUp, Clock, FileText, AlertCircle,
  CheckCircle2, Users, Zap
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

// Mock data for charts
const financialData = [
  { month: 'Jan', revenue: 45000, costs: 32000, margin: 13000, profit: 13000 },
  { month: 'Fév', revenue: 52000, costs: 35000, margin: 17000, profit: 17000 },
  { month: 'Mar', revenue: 48000, costs: 33000, margin: 15000, profit: 15000 },
  { month: 'Avr', revenue: 61000, costs: 38000, margin: 23000, profit: 23000 },
  { month: 'Mai', revenue: 55000, costs: 36000, margin: 19000, profit: 19000 },
  { month: 'Jun', revenue: 67000, costs: 40000, margin: 27000, profit: 27000 },
];

const projectPerformanceData = [
  { month: 'Jan', completed: 3, inProgress: 5, delayed: 1 },
  { month: 'Fév', completed: 4, inProgress: 4, delayed: 2 },
  { month: 'Mar', completed: 5, inProgress: 3, delayed: 1 },
  { month: 'Avr', completed: 6, inProgress: 4, delayed: 0 },
  { month: 'Mai', completed: 5, inProgress: 5, delayed: 1 },
  { month: 'Jun', completed: 7, inProgress: 3, delayed: 1 },
];

export default function EnhancedDashboard() {
  const { data: projects } = trpc.projects.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const { data: tasks } = trpc.tasks.list.useQuery();
  const { data: teamMembers } = trpc.team.list.useQuery();

  const stats = useMemo(() => {
    return {
      facturé: 328000,
      nonPayé: 481979,
      tempsEnregistré: 93,
      note: 4.5,
      activeProjects: projects?.length || 0,
      totalClients: clients?.length || 0,
      pendingTasks: tasks?.filter(t => t.status === 'todo').length || 0,
      teamSize: teamMembers?.length || 0,
    };
  }, [projects, clients, tasks, teamMembers]);

  return (
    <EnhancedLayout title="Tableau de bord">
      <div className="space-y-6">
        {/* Alert Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-blue-600 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-blue-900">Ceci est un compte démo</p>
            <p className="text-sm text-blue-800">Toutes les données présentées sont fictives. Cliquez ici pour passer sur votre compte réel.</p>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Facturé"
            value={`${(stats.facturé / 1000).toFixed(0)}k`}
            unit="€"
            icon="📊"
            trend={12}
            trendLabel="vs mois dernier"
            description="Honoraires des projets facturables"
            color="blue"
          />
          <KPICard
            title="Non payé"
            value={`${(stats.nonPayé / 1000).toFixed(0)}k`}
            unit="€"
            icon="⏳"
            trend={-5}
            trendLabel="vs mois dernier"
            description="Solde TTC des factures de vente envoyées"
            color="orange"
          />
          <KPICard
            title="Temps enregistré"
            value={stats.tempsEnregistré}
            unit="%"
            icon="⏱️"
            trend={8}
            trendLabel="vs mois dernier"
            description="Pourcentage de temps enregistré"
            color="green"
          />
          <KPICard
            title="Note"
            value={stats.note}
            unit="/5"
            icon="⭐"
            description="Écrivez ici vos idées"
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Summary */}
          <FinancialChart
            data={financialData}
            title="Synthèse financière de l'entreprise pour 2026"
            type="area"
            height={300}
          />

          {/* Project Performance */}
          <FinancialChart
            data={projectPerformanceData}
            title="Performance des projets"
            type="bar"
            height={300}
          />
        </div>

        {/* Bottom Section - Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Projets actifs</p>
                <p className="text-3xl font-bold text-foreground">{stats.activeProjects}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Zap className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Clients</p>
                <p className="text-3xl font-bold text-foreground">{stats.totalClients}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tâches en attente</p>
                <p className="text-3xl font-bold text-foreground">{stats.pendingTasks}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Équipe</p>
                <p className="text-3xl font-bold text-foreground">{stats.teamSize}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline">Exporter</Button>
          <Button>Créer un projet</Button>
        </div>
      </div>
    </EnhancedLayout>
  );
}
