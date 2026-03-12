import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronDown, LayoutDashboard, FolderOpen, Users, Hammer, Building2,
  FileText, CheckSquare, Bell, Settings, LogOut, Menu, X,
  TrendingUp, Clock, DollarSign, MessageSquare, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';

interface NavItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  children?: NavItem[];
}

const NAVIGATION: NavItem[] = [
  {
    label: 'GÉNÉRAL',
    children: [
      { label: 'Tableau de bord', icon: <LayoutDashboard size={18} />, href: '/' },
      { label: 'Opportunités', icon: <TrendingUp size={18} />, href: '/opportunities' },
      { label: 'Projets', icon: <FolderOpen size={18} />, href: '/projects' },
    ]
  },
  {
    label: 'ÉQUIPE',
    children: [
      { label: 'Collaborateurs', icon: <Users size={18} />, href: '/team' },
      { label: 'Planning', icon: <Clock size={18} />, href: '/planning' },
      { label: 'Temps', icon: <Clock size={18} />, href: '/time-tracking' },
    ]
  },
  {
    label: 'GESTION',
    children: [
      { label: 'Clients', icon: <Users size={18} />, href: '/clients' },
      { label: 'Coûts', icon: <DollarSign size={18} />, href: '/costs' },
      { label: 'Factures', icon: <FileText size={18} />, href: '/invoices' },
      { label: 'Finances', icon: <TrendingUp size={18} />, href: '/finances' },
      { label: 'Rapports', icon: <FileText size={18} />, href: '/reports' },
    ]
  },
  {
    label: 'CHANTIER',
    children: [
      { label: 'Chantiers', icon: <Hammer size={18} />, href: '/sites' },
      { label: 'Journal', icon: <FileText size={18} />, href: '/site-journal' },
      { label: 'Réunions', icon: <MessageSquare size={18} />, href: '/meetings' },
      { label: 'Incidents', icon: <Bell size={18} />, href: '/incidents' },
    ]
  },
  {
    label: 'COLLABORATION',
    children: [
      { label: 'Tâches', icon: <CheckSquare size={18} />, href: '/tasks' },
      { label: 'Notes', icon: <MessageSquare size={18} />, href: '/notes' },
      { label: 'Blog', icon: <FileText size={18} />, href: '/blog' },
      { label: 'Notifications', icon: <Bell size={18} />, href: '/notifications' },
    ]
  },
  {
    label: 'BESOIN D\'AIDE ?',
    children: [
      { label: 'Configuration', icon: <Settings size={18} />, href: '/settings' },
      { label: 'Documentation', icon: <HelpCircle size={18} />, href: '/docs' },
    ]
  }
];

export function EnhancedSidebar() {
  const [expanded, setExpanded] = useState<string[]>(['GÉNÉRAL', 'GESTION']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const toggleSection = (label: string) => {
    setExpanded(prev =>
      prev.includes(label)
        ? prev.filter(s => s !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string) => href && location === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">ArchiMate</h1>
          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden"
            >
              <X size={20} />
            </button>
          )}
        </div>
        {user && (
          <div className="text-sm text-sidebar-accent-foreground">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs opacity-75">{user.email}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {NAVIGATION.map((section) => (
          <div key={section.label}>
            {section.children ? (
              <>
                <button
                  onClick={() => toggleSection(section.label)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-sidebar-accent-foreground hover:bg-sidebar-accent rounded transition-colors"
                >
                  <span>{section.label}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      expanded.includes(section.label) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expanded.includes(section.label) && (
                  <div className="ml-2 space-y-1 mt-1">
                    {section.children.map((item) => (
                      <Link key={item.href} href={item.href || '#'}>
                        <a
                          className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                            isActive(item.href)
                              ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </a>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link href={section.href || '#'}>
                <a className="flex items-center gap-3 px-3 py-2 rounded text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                  {section.icon}
                  <span>{section.label}</span>
                </a>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => window.location.href = '/settings'}
        >
          <Settings size={18} className="mr-2" />
          Paramètres
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={logout}
        >
          <LogOut size={18} className="mr-2" />
          Déconnexion
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-border bg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
