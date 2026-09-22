import { ShieldAlert, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Schermata mostrata quando l'utente è autenticato via SSO ma NON possiede un
 * ruolo consentito (o è un ente HR privo di codici fiscali abilitati).
 * L'accesso è inibito: l'unica azione possibile è uscire (logout SSO).
 */
export const Unauthorized = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardContent className="p-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Accesso non autorizzato</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Il tuo account non dispone di un ruolo abilitato all'utilizzo del Cruscotto,
            oppure non risulta associato ad alcun ente.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Per l'abilitazione contatta l'amministratore del sistema.
          </p>
          <Button onClick={signOut} className="mt-6 w-full gap-2">
            <LogOut className="h-4 w-4" /> Esci
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
