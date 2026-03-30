import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import Projects from "./pages/Projects";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectDetail from "./pages/ProjectDetail";
import Clients from "./pages/Clients";
import ClientCreate from "./pages/ClientCreate";
import ClientDetail from "./pages/ClientDetail";
import Sites from "./pages/Sites";
import SiteDetail from "./pages/SiteDetail";
import Cabinet from "./pages/Cabinet";
import Reports from "./pages/Reports";
import Validation from "./pages/Validation";
import Notifications from "./pages/Notifications";
import Opportunities from "./pages/Opportunities";
import Dashboard from "./pages/Dashboard";
import CRMLeads from "./pages/CRMLeads";
import Economy from "./pages/Economy";

function Router() {
  return (
    <Switch>
      {/* Dashboard */}
      <Route path={"/"} component={EnhancedDashboard} />

      {/* Opportunities */}
      <Route path={"/opportunities"} component={Opportunities} />

      {/* Projects */}
      <Route path={"/projects"} component={Projects} />
      <Route path={"/projects/create"} component={ProjectCreate} />
      <Route path={"/projects/:id"} component={ProjectDetail} />

      {/* Clients */}
      <Route path={"/clients"} component={Clients} />
      <Route path={"/clients/create"} component={ClientCreate} />
      <Route path={"/clients/:id"} component={ClientDetail} />

      {/* Sites (Chantiers) */}
      <Route path={"/sites"} component={Sites} />
      <Route path={"/sites/:id"} component={SiteDetail} />

      {/* Cabinet */}
      <Route path={"/cabinet"} component={Cabinet} />

      {/* Reports */}
      <Route path={"/reports"} component={Reports} />

      {/* Validation */}
      <Route path={"/validation"} component={Validation} />

      {/* Notifications */}
      <Route path={"/notifications"} component={Notifications} />

      {/* SaaS Modules */}
      <Route path={"/dashboard-saas"} component={Dashboard} />
      <Route path={"/crm/leads"} component={CRMLeads} />
      <Route path={"/economy"} component={Economy} />

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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

export default App;
