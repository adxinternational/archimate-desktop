import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectCreate from "./pages/ProjectCreate";
import ProjectDetail from "./pages/ProjectDetail";
import Clients from "./pages/Clients";
import ClientCreate from "./pages/ClientCreate";
import ClientDetail from "./pages/ClientDetail";
import Sites from "./pages/Sites";
import SiteDetail from "./pages/SiteDetail";
import Cabinet from "./pages/Cabinet";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />

        {/* Projets */}
        <Route path="/projets" component={Projects} />
        <Route path="/projets/nouveau" component={ProjectCreate} />
        <Route path="/projets/:id" component={ProjectDetail} />

        {/* Clients */}
        <Route path="/clients" component={Clients} />
        <Route path="/clients/nouveau" component={ClientCreate} />
        <Route path="/clients/:id" component={ClientDetail} />

        {/* Chantier */}
        <Route path="/chantier" component={Sites} />
        <Route path="/chantier/:id" component={SiteDetail} />

        {/* Cabinet */}
        <Route path="/cabinet" component={Cabinet} />

        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
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
