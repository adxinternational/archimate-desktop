import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";

// Auth pages (publiques)
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Pages principales
import EnhancedDashboard from "@/pages/EnhancedDashboard";
import Projects from "@/pages/Projects";
import ProjectCreate from "@/pages/ProjectCreate";
import ProjectDetail from "@/pages/ProjectDetail";
import Clients from "@/pages/Clients";
import ClientCreate from "@/pages/ClientCreate";
import ClientDetail from "@/pages/ClientDetail";
import Sites from "@/pages/Sites";
import SiteDetail from "@/pages/SiteDetail";
import Cabinet from "@/pages/Cabinet";
import Reports from "@/pages/Reports";
import Validation from "@/pages/Validation";
import Notifications from "@/pages/Notifications";
import Opportunities from "@/pages/Opportunities";
import CRMLeads from "@/pages/CRMLeads";
import Economy from "@/pages/Economy";
import BIM from "@/pages/BIM";
import GanttPage from "@/pages/GanttPage";
import SiteManagement from "@/pages/SiteManagement";
import ProjectPerformance from "@/pages/ProjectPerformance";
import Notes from "@/pages/Notes";
import Blog from "@/pages/Blog";
import NotFound from "@/pages/NotFound";

// ── Guard : redirige vers /login si non authentifié ──────────
function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Chargement…
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* ── Pages publiques ─────────────────────────────── */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* ── Dashboard ───────────────────────────────────── */}
      <Route path="/">
        {() => <ProtectedRoute component={EnhancedDashboard} />}
      </Route>

      {/* ── CRM ─────────────────────────────────────────── */}
      <Route path="/opportunities">
        {() => <ProtectedRoute component={Opportunities} />}
      </Route>
      <Route path="/crm/leads">
        {() => <ProtectedRoute component={CRMLeads} />}
      </Route>

      {/* ── Clients ─────────────────────────────────────── */}
      <Route path="/clients">
        {() => <ProtectedRoute component={Clients} />}
      </Route>
      <Route path="/clients/create">
        {() => <ProtectedRoute component={ClientCreate} />}
      </Route>
      <Route path="/clients/:id">
        {() => <ProtectedRoute component={ClientDetail} />}
      </Route>

      {/* ── Projets ─────────────────────────────────────── */}
      <Route path="/projects">
        {() => <ProtectedRoute component={Projects} />}
      </Route>
      <Route path="/projects/create">
        {() => <ProtectedRoute component={ProjectCreate} />}
      </Route>
      <Route path="/projects/:id">
        {() => <ProtectedRoute component={ProjectDetail} />}
      </Route>

      {/* ── Économie ──────────────────────── */}
      <Route path="/economy">
        {() => <ProtectedRoute component={Economy} />}
      </Route>
      <Route path="/projects/performance">
        {() => <ProtectedRoute component={ProjectPerformance} />}
      </Route>

      {/* ── Chantiers ───────────────────────────────────── */}
      <Route path="/sites">
        {() => <ProtectedRoute component={Sites} />}
      </Route>
      <Route path="/sites/:id">
        {() => <ProtectedRoute component={SiteDetail} />}
      </Route>
      <Route path="/site-management">
        {() => <ProtectedRoute component={SiteManagement} />}
      </Route>

      {/* ── Planning ────────────────────────────────────── */}
      <Route path="/gantt">
        {() => <ProtectedRoute component={GanttPage} />}
      </Route>

      {/* ── Cabinet / GRH ───────────────────────────────── */}
      <Route path="/cabinet">
        {() => <ProtectedRoute component={Cabinet} />}
      </Route>

      {/* ── BIM ─────────────────────────────────────────── */}
      <Route path="/bim">
        {() => <ProtectedRoute component={BIM} />}
      </Route>

      {/* ── Rapports & Validation ───────────────────────── */}
      <Route path="/reports">
        {() => <ProtectedRoute component={Reports} />}
      </Route>
      <Route path="/validation">
        {() => <ProtectedRoute component={Validation} />}
      </Route>

      {/* ── Notifications ───────────────────────────────── */}
      <Route path="/notifications">
        {() => <ProtectedRoute component={Notifications} />}
      </Route>

      {/* ── Notes & Blog ───────────────────────────────── */}
      <Route path="/notes">
        {() => <ProtectedRoute component={Notes} />}
      </Route>
      <Route path="/blog">
        {() => <ProtectedRoute component={Blog} />}
      </Route>

      {/* ── 404 ─────────────────────────────────────────── */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
