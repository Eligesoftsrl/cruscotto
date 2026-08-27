import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Login from "./pages/Login";

// Route lazy-loaded: riducono il bundle iniziale (code-splitting).
const Welcome = lazy(() => import("./pages/Welcome"));
const Index = lazy(() => import("./pages/Index"));
const Bussola = lazy(() => import("./pages/Bussola"));
const RapportoNarrativo = lazy(() => import("./pages/RapportoNarrativo"));
const NarrativeDemo = lazy(() => import("./pages/NarrativeDemo"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  // Gestione errori globale: un toast per ogni query fallita (una sola volta).
  queryCache: new QueryCache({
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Errore nel caricamento dei dati";
      toast.error("Errore di caricamento", { description: message });
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
  const { profile, loading } = useAuth();
  if (loading) return <FullscreenSpinner />;
  if (!profile) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** Error boundary per-route: si azzera automaticamente ad ogni cambio pagina. */
const RoutedErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return <ErrorBoundary resetKey={location.pathname}>{children}</ErrorBoundary>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
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
