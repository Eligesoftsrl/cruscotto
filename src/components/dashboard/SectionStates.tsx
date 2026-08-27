/** Stati standard delle sezioni (loading / errore / vuoto) per un'esperienza uniforme. */
export const SectionLoading = () => (
  <div className="p-6 text-sm text-muted-foreground">Caricamento dati…</div>
);

export const SectionError = ({
  message = "Errore nel caricamento dei dati.",
}: {
  message?: string;
}) => <div className="p-6 text-sm text-destructive">{message}</div>;

export const SectionEmpty = ({ message = "Nessun dato disponibile." }: { message?: string }) => (
  <div className="p-6 text-sm text-muted-foreground">{message}</div>
);
