import { Info } from "lucide-react";

/** S09 - Fabbisogno per Profilo: schede S09.01/S09.02 disattivate (dati non caricati). */
export const FabbisognoView = () => (
  <div className="flex items-center justify-center min-h-[320px]">
    <div className="max-w-md text-center space-y-3 bg-card border rounded-xl p-8">
      <Info className="h-8 w-8 mx-auto text-muted-foreground" />
      <h3 className="text-[15px] font-bold text-foreground">Fabbisogno per Profilo</h3>
      <p className="text-sm text-muted-foreground">
        Questa sezione non è al momento disponibile: i dati di fabbisogno non sono ancora stati caricati.
      </p>
    </div>
  </div>
);
