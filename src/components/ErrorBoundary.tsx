import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Cambiando questo valore (es. il pathname della route) l'errore viene azzerato. */
  resetKey?: string | number;
  /** Fallback personalizzato opzionale. */
  fallback?: (args: { error: Error; reset: () => void }) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Error Boundary applicativo.
 * Impedisce che un errore in un singolo componente faccia crashare l'intera app
 * ("schermo bianco"): mostra un fallback elegante con possibilità di riprovare.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Se cambia la route (resetKey), azzera l'errore così la nuova pagina si carica.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log in console per il debug. In produzione qui si può inviare a un servizio di monitoraggio.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) {
        return this.props.fallback({ error, reset: this.reset });
      }
      return <DefaultErrorFallback error={error} reset={this.reset} />;
    }
    return this.props.children;
  }
}

const DefaultErrorFallback = ({ error, reset }: { error: Error; reset: () => void }) => (
  <div className="min-h-[60vh] w-full flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-card border rounded-lg shadow-sm p-8 text-center space-y-4">
      <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-lg font-bold text-foreground">Si è verificato un errore</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Qualcosa non ha funzionato in questa sezione. Puoi riprovare: il resto dell'applicazione
          continua a funzionare normalmente.
        </p>
      </div>
      {error?.message && (
        <pre className="text-left text-[11px] bg-muted/50 border rounded-md p-3 overflow-auto max-h-32 text-muted-foreground">
          {error.message}
        </pre>
      )}
      <div className="flex items-center justify-center gap-2 pt-1">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold transition-colors hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" /> Riprova
        </button>
        <button
          onClick={() => window.location.assign("/")}
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Torna alla home
        </button>
      </div>
    </div>
  </div>
);
