import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search } from "lucide-react";

interface GlossaryEntry {
  term: string;
  category: "acronimo" | "indicatore" | "fonte" | "concetto";
  definition: string;
}

const glossary: GlossaryEntry[] = [
  // Acronimi
  {
    term: "DFP",
    category: "acronimo",
    definition:
      "Dipartimento della Funzione Pubblica. Struttura della Presidenza del Consiglio dei Ministri responsabile delle politiche di gestione del personale pubblico.",
  },
  {
    term: "PA",
    category: "acronimo",
    definition:
      "Pubblica Amministrazione. L'insieme degli enti e delle organizzazioni che svolgono funzioni pubbliche.",
  },
  {
    term: "FTE",
    category: "acronimo",
    definition:
      "Full-Time Equivalent. Unità di misura del carico di lavoro equivalente a un dipendente a tempo pieno.",
  },
  {
    term: "UO",
    category: "acronimo",
    definition: "Unità Organizzativa. Struttura organizzativa di base all'interno di un ente.",
  },
  {
    term: "SIPrO",
    category: "acronimo",
    definition:
      "Sistema Informativo per i Profili Organizzativi. Piattaforma per la mappatura dei processi e dell'organizzazione degli enti.",
  },
  {
    term: "InPA",
    category: "acronimo",
    definition:
      "Portale del Reclutamento della PA. Piattaforma unica per la pubblicazione dei bandi di concorso e la gestione delle candidature.",
  },
  {
    term: "KPI",
    category: "acronimo",
    definition:
      "Key Performance Indicator. Indicatore chiave di prestazione utilizzato per misurare il raggiungimento degli obiettivi.",
  },
  {
    term: "WCAG",
    category: "acronimo",
    definition:
      "Web Content Accessibility Guidelines. Standard internazionale per l'accessibilità dei contenuti web.",
  },
  {
    term: "RLS",
    category: "acronimo",
    definition:
      "Row-Level Security. Meccanismo di sicurezza per il controllo dell'accesso ai dati a livello di riga.",
  },
  {
    term: "AGID",
    category: "acronimo",
    definition:
      "Agenzia per l'Italia Digitale. Agenzia governativa per la trasformazione digitale della PA.",
  },

  // Fonti dati
  {
    term: "Conto Annuale",
    category: "fonte",
    definition:
      "Rilevazione annuale del Ministero dell'Economia e delle Finanze (MEF-RGS) sui dati del personale delle amministrazioni pubbliche: consistenze, costi, turnover, formazione.",
  },
  {
    term: "Minerva",
    category: "fonte",
    definition:
      "Sistema per la gestione dei profili professionali e delle competenze nella PA. Contiene il catalogo delle famiglie professionali e la mappatura delle competenze.",
  },
  {
    term: "Syllabus",
    category: "fonte",
    definition:
      "Piattaforma DFP per la formazione digitale dei dipendenti pubblici. Gestisce corsi, assessment delle competenze digitali e rilascio di badge.",
  },
  {
    term: "Lavoro Pubblico",
    category: "fonte",
    definition:
      "Banca dati anagrafica del personale delle amministrazioni pubbliche, con informazioni su dotazione organica, qualifiche e distribuzione territoriale.",
  },
  {
    term: "KPI Riforma PA",
    category: "fonte",
    definition:
      "Sistema di monitoraggio degli indicatori di performance legati alla riforma della Pubblica Amministrazione prevista dal PNRR.",
  },

  // Indicatori sintetici — D1
  {
    term: "IAC – Indice Adozione Catalogo",
    category: "indicatore",
    definition:
      "Misura il grado di adozione del catalogo dei profili professionali da parte dell'ente. Valore 0-100%.",
  },
  {
    term: "IIMP-R – Indice Imp. Ruoli",
    category: "indicatore",
    definition:
      "Indice di implementazione dei ruoli professionali rispetto al catalogo nazionale di riferimento.",
  },
  {
    term: "ICPR – Indice Cop. Profili Ruolo",
    category: "indicatore",
    definition:
      "Percentuale di copertura dei profili di ruolo assegnati rispetto a quelli previsti.",
  },
  {
    term: "ICVC – Indice Comp. vs Catalogo",
    category: "indicatore",
    definition:
      "Grado di conformità delle competenze del personale rispetto al catalogo delle competenze di riferimento.",
  },
  {
    term: "IACU – Indice Adeg. Competenze",
    category: "indicatore",
    definition:
      "Indice di adeguatezza delle competenze possedute dal personale rispetto a quelle richieste.",
  },

  // D2
  {
    term: "IRS – Indice Risorse Servizio",
    category: "indicatore",
    definition:
      "Rapporto tra risorse in servizio e dotazione organica prevista. Misura la copertura effettiva dell'organico.",
  },
  {
    term: "IDP – Indice Dotazione Personale",
    category: "indicatore",
    definition:
      "Indicatore sintetico della dotazione di personale in rapporto alle esigenze funzionali dell'ente.",
  },
  {
    term: "IRG – Indice Ricambio Generaz.",
    category: "indicatore",
    definition:
      "Rapporto tra assunti under 35 e cessati over 60, misura la capacità di ricambio generazionale.",
  },

  // D3
  {
    term: "IAR – Indice Attrazione Reclut.",
    category: "indicatore",
    definition:
      "Rapporto tra candidature ricevute e posti banditi. Misura l'attrattività dell'ente nel mercato del lavoro.",
  },
  {
    term: "TSC – Tasso Successo Concorsuale",
    category: "indicatore",
    definition:
      "Percentuale di procedure concorsuali che si concludono con l'assunzione di tutti i posti messi a bando.",
  },
  {
    term: "TCP – Tasso Copertura Posti",
    category: "indicatore",
    definition:
      "Percentuale di posti effettivamente coperti rispetto a quelli banditi al termine della procedura selettiva.",
  },

  // D4
  {
    term: "TCF – Tasso Copertura Formativa",
    category: "indicatore",
    definition:
      "Percentuale di dipendenti che hanno partecipato ad almeno un'attività formativa nell'anno.",
  },
  {
    term: "IFM – Intensità Form. Media",
    category: "indicatore",
    definition: "Ore medie di formazione per dipendente nell'anno di riferimento.",
  },

  // D5
  {
    term: "ICS – Indice Crescita Stipendiale",
    category: "indicatore",
    definition:
      "Variazione percentuale della retribuzione media del personale rispetto all'anno precedente.",
  },

  // D6
  {
    term: "TVO – Tasso Var. Organico",
    category: "indicatore",
    definition: "Variazione percentuale della consistenza dell'organico tra due anni consecutivi.",
  },
  {
    term: "IQP – Indice Qualità Processi",
    category: "indicatore",
    definition:
      "Indice composito che misura la qualità dei processi mappati: completezza, digitalizzazione, semplificazione.",
  },
  {
    term: "IPD – Indice Proc. Digitalizzati",
    category: "indicatore",
    definition:
      "Percentuale di fasi dei processi gestite in modalità digitale sul totale delle fasi mappate.",
  },
  {
    term: "IFL – Indice Flessibilità Lav.",
    category: "indicatore",
    definition:
      "Grado di adozione di forme di lavoro flessibile (telelavoro, lavoro agile) nell'ente.",
  },
  {
    term: "IDLA – Indice Diffusione Lavoro Agile",
    category: "indicatore",
    definition:
      "Percentuale di dipendenti che usufruiscono di lavoro agile sul totale del personale in servizio.",
  },

  // Concetti
  {
    term: "Vista Executive",
    category: "concetto",
    definition:
      "Livello strategico del cruscotto. Mostra una panoramica aggregata delle 6 dimensioni (D1-D6) con score sintetici per decisori apicali.",
  },
  {
    term: "Vista Sintetica",
    category: "concetto",
    definition:
      "Livello gestionale. Mostra gli indicatori sintetici di una singola dimensione (pillar) con trend, confronti e possibilità di drill-down.",
  },
  {
    term: "Vista Operativa",
    category: "concetto",
    definition:
      "Livello analitico. Accede ai dati di dettaglio delle singole fonti (Conto Annuale, InPA, SIPrO, etc.) con grafici e tabelle specifici.",
  },
  {
    term: "Drill-down",
    category: "concetto",
    definition:
      "Navigazione dall'alto verso il basso: da un dato aggregato si scende al dettaglio sottostante (es. da score pillar a indicatore a dato fonte).",
  },
  {
    term: "Bottom-up",
    category: "concetto",
    definition:
      "Navigazione dal basso verso l'alto: dal dato analitico operativo si risale alla vista sintetica o executive per contestualizzare.",
  },
  {
    term: "Benchmark",
    category: "concetto",
    definition:
      "Confronto tra enti su uno stesso indicatore. Permette di posizionare la performance dell'ente rispetto alla media o a enti simili.",
  },
  {
    term: "Pillar / Dimensione",
    category: "concetto",
    definition:
      "Macro-area tematica del cruscotto HR. Le 6 dimensioni sono: D1 Classificazione, D2 Programmazione, D3 Recruiting, D4 Sviluppo, D5 Rewarding, D6 Capacity Building.",
  },
  {
    term: "Cluster",
    category: "concetto",
    definition:
      "Raggruppamento di enti per caratteristiche omogenee (dimensione, comparto, area geografica) utilizzato per benchmark significativi.",
  },
  {
    term: "Comparto",
    category: "concetto",
    definition:
      "Settore di contrattazione collettiva della PA (es. Funzioni Centrali, Funzioni Locali, Sanità, Istruzione e Ricerca).",
  },
  {
    term: "Dotazione organica",
    category: "concetto",
    definition:
      "Numero di posti previsti nella pianta organica dell'ente, suddivisi per qualifica e area contrattuale.",
  },
  {
    term: "Turnover",
    category: "concetto",
    definition:
      "Flusso di entrate (assunzioni) e uscite (cessazioni) del personale in un periodo. Il tasso di turnover misura l'intensità del ricambio.",
  },
  {
    term: "Tasso di sostituzione",
    category: "concetto",
    definition:
      "Rapporto tra nuovi assunti e cessati nello stesso periodo. Un valore >1 indica crescita dell'organico, <1 indica contrazione.",
  },
];

const categoryColors: Record<string, string> = {
  acronimo: "bg-primary/15 text-primary",
  indicatore: "bg-accent/50 text-accent-foreground",
  fonte: "bg-secondary text-secondary-foreground",
  concetto: "bg-muted text-muted-foreground",
};

const categoryLabels: Record<string, string> = {
  acronimo: "Acronimo",
  indicatore: "Indicatore",
  fonte: "Fonte dati",
  concetto: "Concetto",
};

export const GlossaryDialog = () => {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = glossary;
    if (filterCat) list = list.filter((e) => e.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.term.toLowerCase().includes(q) || e.definition.toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => a.term.localeCompare(b.term));
  }, [search, filterCat]);

  const categories = ["acronimo", "indicatore", "fonte", "concetto"] as const;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="hover:underline hover:text-white/70 transition-colors focus:outline-none focus:ring-1 focus:ring-white/40 focus:rounded-sm inline-flex items-center gap-1">
          <BookOpen className="h-3 w-3" aria-hidden="true" />
          Glossario
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b">
          <DialogTitle className="text-base font-bold">Glossario</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Cerca acronimi, indicatori, fonti dati e concetti del cruscotto.
          </p>
        </DialogHeader>

        <div className="px-5 py-3 border-b space-y-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cerca termine…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCat(null)}
              className={`px-2.5 py-1 text-[10px] rounded-full font-medium transition-colors ${
                !filterCat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Tutti ({glossary.length})
            </button>
            {categories.map((cat) => {
              const count = glossary.filter((e) => e.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                  className={`px-2.5 py-1 text-[10px] rounded-full font-medium transition-colors ${
                    filterCat === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {categoryLabels[cat]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-5 py-3 space-y-1">
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                Nessun risultato per "{search}"
              </p>
            )}
            {filtered.map((entry) => (
              <div
                key={entry.term}
                className="py-2.5 px-3 rounded-md hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12.5px] font-semibold text-foreground">{entry.term}</span>
                  <span
                    className={`px-1.5 py-0.5 text-[9px] rounded font-medium ${categoryColors[entry.category]}`}
                  >
                    {categoryLabels[entry.category]}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {entry.definition}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
