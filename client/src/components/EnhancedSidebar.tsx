import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronDown, LayoutDashboard, FolderOpen, Users, Hammer, Building2,
  FileText, CheckSquare, Bell, Settings, LogOut, Menu, X,
  TrendingUp, Clock, DollarSign, MessageSquare, BarChart2,
  CalendarDays, Map, Cpu, ShieldCheck, StickyNote, Newspaper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/_core/hooks/useAuth';

interface NavItem {
  label: string;
  icon?: React.ReactNode;
  href?: string;
  badge?: number;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAVIGATION: NavSection[] = [
  {
    label: 'GÉNÉRAL',
    items: [
      { label: 'Tableau de bord', icon: <LayoutDashboard size={16} />, href: '/' },
      { label: 'Opportunités', icon: <TrendingUp size={16} />, href: '/opportunities' },
      { label: 'Leads CRM', icon: <Users size={16} />, href: '/crm/leads' },
    ],
  },
  {
    label: 'PROJETS',
    items: [
      { label: 'Projets', icon: <FolderOpen size={16} />, href: '/projects' },
      { label: 'Planning (Gantt)', icon: <CalendarDays size={16} />, href: '/gantt' },
      { label: 'Économie', icon: <DollarSign size={16} />, href: '/economy' },
      { label: 'BIM & Documents', icon: <Cpu size={16} />, href: '/bim' },
      { label: 'Validation', icon: <ShieldCheck size={16} />, href: '/validation' },
    ],
  },
  {
    label: 'CLIENTS',
    items: [
      { label: 'Clients', icon: <Building2 size={16} />, href: '/clients' },
    ],
  },
  {
    label: 'CHANTIERS',
    items: [
      { label: 'Chantiers', icon: <Hammer size={16} />, href: '/sites' },
      { label: 'Gestion chantiers', icon: <Map size={16} />, href: '/site-management' },
    ],
  },
  {
    label: 'CABINET',
    items: [
      { label: 'Équipe & Tâches', icon: <Users size={16} />, href: '/cabinet' },
      { label: 'Rapports', icon: <BarChart2 size={16} />, href: '/reports' },
      { label: 'Notes & Idées', icon: <StickyNote size={16} />, href: '/notes' },
      { label: 'Blog & Actualités', icon: <Newspaper size={16} />, href: '/blog' },
      { label: 'Notifications', icon: <Bell size={16} />, href: '/notifications' },
    ],
  },
];

export function EnhancedSidebar() {
  const [expanded, setExpanded] = useState<string[]>(['GÉNÉRAL', 'PROJETS', 'CHANTIERS']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const toggleSection = (label: string) => {
    setExpanded(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">ArchiOS</h1>
          </div>
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-white/60 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>
        {user && (
          <div className="text-sm">
            <p className="font-medium text-white/90 truncate">{user.name}</p>
            <p className="text-xs text-white/50 truncate">{user.email}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {NAVIGATION.map((section) => (
          <div key={section.label}>
            <button
              onClick={() => toggleSection(section.label)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-white/40 hover:text-white/70 transition-colors"
            >
              <span>{section.label}</span>
              <ChevronDown
                size={12}
                className={`transition-transform ${expanded.includes(section.label) ? 'rotate-180' : ''}`}
              />
            </button>

            {expanded.includes(section.label) && (
              <div className="space-y-0.5 mb-2">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href || '#'}>
                    <a
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-600 text-white font-medium'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="opacity-80">{item.icon}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {item.badge}
                        </span>
                      ) : null}
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-2 space-y-0.5">
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          onClick={logout}
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-lg shadow-lg"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 shrink-0 bg-gray-900 border-r border-white/10 min-h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-gray-900">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
