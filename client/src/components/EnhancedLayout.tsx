import { ReactNode } from 'react';
import { EnhancedSidebar } from './EnhancedSidebar';
import { Bell, Globe, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedLayoutProps {
  children: ReactNode;
  title?: string;
}

export function EnhancedLayout({ children, title }: EnhancedLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <EnhancedSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-border h-16 flex items-center justify-between px-6 shadow-sm">
          <div>
            {title && <h1 className="text-lg font-semibold text-foreground">{title}</h1>}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Globe size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User size={20} />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
