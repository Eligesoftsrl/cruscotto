import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UsageTracker } from "@/components/admin/UsageTracker";
import { UpdateBanner } from "@/components/UpdateBanner";
import { logErrore } from "@/services/admin/logger";
import { Unauthorized } from "@/components/Unauthorized";
import Login from "./pages/Login";
import { LiveRegion, LoadingAnnouncer, useDocumentTitle } from "@/lib/a11y/announcer";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";

// Route lazy-loaded: riducono il bundle iniziale (code-splitting).
const Welcome = lazy(() => import("./pages/Welcome"));
const Index = lazy(() => import("./pages/Index"));
const Bussola = lazy(() => import("./pages/Bussola"));
const RapportoNarrativo = lazy(() => import("./pages/RapportoNarrativo"));
const NarrativeDemo = lazy(() => import("./pages/NarrativeDemo"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  // Gestione errori globale: un toast per ogni query fallita (una sola volta).
  queryCache: new QueryCache({
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Errore nel caricamento dei dati";
      toast.error("Errore di caricamento", { description: message });
      // SEC-004: registriamo solo il messaggio, senza stack trace.
      logErrore(message, "query");
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const FullscreenSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading, unauthorized } = useAuth();
  if (loading) return <FullscreenSpinner />;
  // Autenticato ma con ruolo non consentito: accesso inibito.
  if (unauthorized) return <Unauthorized />;
  if (!profile) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** Error boundary per-route: si azzera automaticamente ad ogni cambio pagina. */
const RoutedErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>;
};

/**
 * Titolo della scheda del browser per le pagine "semplici". La dashboard (/dashboard)
 * imposta da sé il titolo in base alla sezione aperta (vedi pages/Index.tsx).
 */
const ROUTE_TITLES: Record<string, string> = {
  "/": "Benvenuto",
  "/login": "Accesso",
  "/bussola": "Pannello di Governo",
  "/rapporto": "Rapporto narrativo",
  "/demo-narrativi": "Demo generatori narrativi",
  "/admin": "Amministrazione",
};
const RouteTitle = () => {
  const { pathname } = useLocation();
  const title = pathname.startsWith("/dashboard")
    ? null
    : (ROUTE_TITLES[pathname] ?? "Pagina non trovata");
  useDocumentTitle(title, { announce: true });
  return null;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <UpdateBanner />
        <LiveRegion />
        <LoadingAnnouncer />
        <BrowserRouter>
          <AuthProvider>
            <UsageTracker />
            <RouteTitle />
            <SessionTimeoutWarning />
            <RoutedErrorBoundary>
              <Suspense fallback={<FullscreenSpinner />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Welcome />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bussola"
                    element={
                      <ProtectedRoute>
                        <Bussola />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/rapporto"
                    element={
                      <ProtectedRoute>
                        <RapportoNarrativo />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/demo-narrativi"
                    element={
                      <ProtectedRoute>
                        <NarrativeDemo />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </RoutedErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
