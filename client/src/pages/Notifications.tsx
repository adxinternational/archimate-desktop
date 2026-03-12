import { useState } from 'react';
import { EnhancedLayout } from '@/components/EnhancedLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell, AlertCircle, CheckCircle2, Info, Trash2, Archive, Filter
} from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    type: 'alert',
    title: 'Tâche en retard',
    message: 'La tâche "Finaliser plans détaillés" est en retard depuis 2 jours',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    icon: AlertCircle,
  },
  {
    id: 2,
    type: 'success',
    title: 'Facture payée',
    message: 'La facture #INV-2026-001 a été marquée comme payée',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    icon: CheckCircle2,
  },
  {
    id: 3,
    type: 'info',
    title: 'Nouveau projet créé',
    message: 'Le projet "Rénovation Maison Toulouse" a été créé par Jean Dupont',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    icon: Info,
  },
  {
    id: 4,
    type: 'alert',
    title: 'Budget dépassé',
    message: 'Le projet "AVP Fin" a dépassé son budget estimé de 12%',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    icon: AlertCircle,
  },
  {
    id: 5,
    type: 'info',
    title: 'Rapport généré',
    message: 'Le rapport mensuel de février a été généré avec succès',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    icon: Info,
  },
  {
    id: 6,
    type: 'success',
    title: 'Validation approuvée',
    message: 'Votre demande de validation pour la facture #INV-2026-002 a été approuvée',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    read: true,
    icon: CheckCircle2,
  },
];

const typeConfig = {
  alert: { color: 'bg-red-100 text-red-700', badgeColor: 'bg-red-100 text-red-800' },
  success: { color: 'bg-green-100 text-green-700', badgeColor: 'bg-green-100 text-green-800' },
  info: { color: 'bg-blue-100 text-blue-700', badgeColor: 'bg-blue-100 text-blue-800' },
};

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `Il y a ${minutes}m`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString('fr-FR');
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'alert' | 'success' | 'info'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <EnhancedLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Marquer tout comme lu
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all' as const, label: 'Tous' },
            { value: 'unread' as const, label: `Non lus (${unreadCount})` },
            { value: 'alert' as const, label: 'Alertes' },
            { value: 'success' as const, label: 'Succès' },
            { value: 'info' as const, label: 'Info' },
          ].map(tab => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? 'default' : 'outline'}
              onClick={() => setFilter(tab.value)}
              className="whitespace-nowrap"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="mx-auto text-muted-foreground mb-4" size={40} />
              <p className="text-muted-foreground">Aucune notification</p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const config = typeConfig[notification.type as keyof typeof typeConfig];
              const NotificationIcon = notification.icon;

              return (
                <Card
                  key={notification.id}
                  className={`p-4 transition-all ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${config.color} flex-shrink-0`}>
                      <NotificationIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Archive size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </EnhancedLayout>
  );
}
