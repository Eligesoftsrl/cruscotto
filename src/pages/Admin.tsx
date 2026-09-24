import { Navigate } from "react-router-dom";
import {
  ShieldCheck,
  ToggleLeft,
  LogIn,
  Activity,
  AlertTriangle,
  BarChart3,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TopBar } from "@/components/dashboard/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SchedePanel } from "@/components/admin/SchedePanel";
import { FeatureFlagsPanel } from "@/components/admin/FeatureFlagsPanel";
import { AccessLogPanel } from "@/components/admin/AccessLogPanel";
import { EventLogPanel } from "@/components/admin/EventLogPanel";
import { ErrorLogPanel } from "@/components/admin/ErrorLogPanel";
import { UsageStatsPanel } from "@/components/admin/UsageStatsPanel";

const Admin = () => {
  const { profile } = useAuth();

  // Accesso al pannello riservato ai profili con privilegi di amministrazione.
  // Il ruolo `dfp` da solo (vista globale) NON è sufficiente: serve `is_admin`.
  if (profile && !profile.is_admin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-muted/30">
      <TopBar nav={{ level: "executive" }} />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <header className="mb-6 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Pannello di Amministrazione</h1>
            <p className="text-sm text-muted-foreground">
              Gestione funzionalità, log di sistema e statistiche di utilizzo
            </p>
          </div>
        </header>

        <Tabs defaultValue="schede">
          <TabsList className="mb-4 flex-wrap h-auto">
            <TabsTrigger value="schede">
              <LayoutGrid className="h-4 w-4 mr-1.5" /> Schede
            </TabsTrigger>
            <TabsTrigger value="flags">
              <ToggleLeft className="h-4 w-4 mr-1.5" /> Funzionalità
            </TabsTrigger>
            <TabsTrigger value="accessi">
              <LogIn className="h-4 w-4 mr-1.5" /> Accessi
            </TabsTrigger>
            <TabsTrigger value="eventi">
              <Activity className="h-4 w-4 mr-1.5" /> Eventi
            </TabsTrigger>
            <TabsTrigger value="errori">
              <AlertTriangle className="h-4 w-4 mr-1.5" /> Errori
            </TabsTrigger>
            <TabsTrigger value="stat">
              <BarChart3 className="h-4 w-4 mr-1.5" /> Statistiche
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schede"><SchedePanel /></TabsContent>
          <TabsContent value="flags"><FeatureFlagsPanel /></TabsContent>
          <TabsContent value="accessi"><AccessLogPanel /></TabsContent>
          <TabsContent value="eventi"><EventLogPanel /></TabsContent>
          <TabsContent value="errori"><ErrorLogPanel /></TabsContent>
          <TabsContent value="stat"><UsageStatsPanel /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
