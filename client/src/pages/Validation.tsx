import { useState } from 'react';
import { EnhancedLayout } from '@/components/EnhancedLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, Clock, AlertCircle, XCircle, ChevronRight, Plus
} from 'lucide-react';

const mockValidations = [
  {
    id: 1,
    title: 'Facture client Maison Toulouse',
    type: 'Facture',
    status: 'pending',
    amount: 15000,
    date: '2026-03-11',
    requester: 'Jean Dupont',
    dueDate: '2026-03-18',
  },
  {
    id: 2,
    title: 'Devis projet AVP Fin',
    type: 'Devis',
    status: 'approved',
    amount: 8500,
    date: '2026-03-10',
    requester: 'Marie Martin',
    approvedBy: 'Directeur',
  },
  {
    id: 3,
    title: 'Bon de commande matériaux',
    type: 'Commande',
    status: 'rejected',
    amount: 3200,
    date: '2026-03-09',
    requester: 'Pierre Bernard',
    rejectionReason: 'Budget dépassé',
  },
  {
    id: 4,
    title: 'Rapport mensuel février',
    type: 'Rapport',
    status: 'pending',
    date: '2026-03-08',
    requester: 'Sophie Lefevre',
    dueDate: '2026-03-15',
  },
  {
    id: 5,
    title: 'Procédure administrative permis',
    type: 'Procédure',
    status: 'pending',
    date: '2026-03-07',
    requester: 'Luc Moreau',
    dueDate: '2026-03-20',
  },
];

const statusConfig = {
  pending: {
    label: 'En attente',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-700',
    badgeColor: 'bg-yellow-100 text-yellow-800',
  },
  approved: {
    label: 'Approuvé',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-700',
    badgeColor: 'bg-green-100 text-green-800',
  },
  rejected: {
    label: 'Rejeté',
    icon: XCircle,
    color: 'bg-red-100 text-red-700',
    badgeColor: 'bg-red-100 text-red-800',
  },
};

export default function Validation() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredValidations = selectedStatus === 'all'
    ? mockValidations
    : mockValidations.filter(v => v.status === selectedStatus);

  const stats = {
    pending: mockValidations.filter(v => v.status === 'pending').length,
    approved: mockValidations.filter(v => v.status === 'approved').length,
    rejected: mockValidations.filter(v => v.status === 'rejected').length,
  };

  return (
    <EnhancedLayout title="Validation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Validation</h2>
            <p className="text-sm text-muted-foreground mt-1">Approuvez et gérez les documents</p>
          </div>
          <Button className="gap-2">
            <Plus size={18} />
            Nouvelle validation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className={`p-4 cursor-pointer transition-all ${selectedStatus === 'pending' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedStatus('pending')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all ${selectedStatus === 'approved' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedStatus('approved')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approuvés</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card
            className={`p-4 cursor-pointer transition-all ${selectedStatus === 'rejected' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedStatus('rejected')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejetés</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="text-red-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Validation List */}
        <div className="space-y-3">
          {filteredValidations.map((validation) => {
            const status = statusConfig[validation.status as keyof typeof statusConfig];
            const StatusIcon = status.icon;

            return (
              <Card key={validation.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg ${status.color}`}>
                      <StatusIcon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{validation.title}</h3>
                        <Badge className={status.badgeColor}>{validation.type}</Badge>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
                        <span>Demandé par {validation.requester}</span>
                        <span>•</span>
                        <span>{new Date(validation.date).toLocaleDateString('fr-FR')}</span>
                        {validation.dueDate && (
                          <>
                            <span>•</span>
                            <span>Échéance: {new Date(validation.dueDate).toLocaleDateString('fr-FR')}</span>
                          </>
                        )}
                      </div>
                      {validation.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                          Raison du rejet: {validation.rejectionReason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {validation.amount && (
                      <p className="font-semibold text-foreground">{validation.amount.toLocaleString('fr-FR')} €</p>
                    )}
                    <div className="flex gap-2">
                      {validation.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            Rejeter
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Approuver
                          </Button>
                        </>
                      )}
                      <ChevronRight className="text-muted-foreground" size={20} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </EnhancedLayout>
  );
}
