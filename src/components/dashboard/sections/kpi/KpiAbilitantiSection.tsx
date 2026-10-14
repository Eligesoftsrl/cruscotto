/**
 * KPI Riforma PA — scheda «KPI Abilitanti e di Successo».
 * Mappatura: docs/mappature/mappatura-scheda-kpi-riforma_3_Filippo.xlsx
 *
 *  - Filtri: solo il menu Anno (anni da kpi_filtri, selezione iniziale anno_predefinito).
 *    Al cambio anno: nuova chiamata kpi_scheda, si ridisegnano le sei card e si chiudono
 *    tutti gli accordion. «Reimposta» riporta ad anno_predefinito.
 *  - Sei card di dimensione (D1…D6): quadratino colorato + filetto, codice e nome
 *    (descrizione_dimensione). Eliminati il conteggio KPI e la barra SR.
 *  - Riga indicatore: pallino neutro (#9CA3AF), pulsante +/−, codice (kpi), nome,
 *    chip con l'unità di misura, valore a 2 decimali senza "%". Barra eliminata.
 *  - Accordion (dati già in memoria, nessuna chiamata): Tipo di sintesi e Formula
 *    (formula_catalogo, testo a capo libero senza troncamento).
 *  - Sezione «Indici compositi» eliminata.
 *  - Ricerca per codice o parola del nome (filtra le righe; le card senza risultati si nascondono).
 *  - Export CSV / Excel / PDF di TUTTI i KPI dell'anno scelto (indipendente dalla ricerca).
 *  - Utenti di ente: se l'ente non è CENSITO nella rilevazione dell'anno (RPC kpi_enti)
 *    i KPI non sono mostrati, come per il SIPrO. Il controllo si attiva da solo quando
 *    il backend rilascia kpi_enti; si può spegnere dal flag di sistema "kpi_verifica_enti".
 */
import { useMemo, useState } from "react";
import { Minus, Plus, RotateCcw, Loader2, AlertCircle, Calendar, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TableExport } from "@/components/dashboard/_shared/TableExport";
import type { ExportTable } from "@/lib/tableExport";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKpiEntiCensiti, useKpiFiltri, useKpiScheda } from "@/hooks/useKpiRiforma";
import { useEnteScope } from "@/hooks/useEnteScope";
import { useAdminState } from "@/services/admin/adminStore";
import { EnteSelector } from "@/components/dashboard/EnteSelector";
import { ShieldAlert } from "lucide-react";
import type { KpiSchedaRow } from "@/services/kpi/kpiRiformaService";

/** Colore statico per dimensione (blu, arancio, verde, rosa, viola, ottanio). */
const DIM_COLORS: Record<string, string> = {
  D1: "hsl(210,80%,45%)",
  D2: "hsl(30,85%,55%)",
  D3: "hsl(150,60%,40%)",
  D4: "hsl(340,70%,55%)",
  D5: "hsl(260,50%,55%)",
  D6: "hsl(180,60%,40%)",
};
const NEUTRAL_DOT = "#9CA3AF";

/** Corregge i caratteri Windows-1252 arrivati come controlli C1 (es. \u0092 → ’). */
const cleanText = (s: string | null | undefined) =>
  (s ?? "")
    .replace(/\u0092/g, "’")
    .replace(/\u0091/g, "‘")
    .replace(/\u0093/g, "“")
    .replace(/\u0094/g, "”")
    .replace(/\u0096/g, "–")
    .replace(/\u0097/g, "—");

/** "RILEVAZIONE E CLASSIFICAZIONE…" → "Rilevazione e classificazione…" */
const sentenceCase = (s: string) => {
  const t = s.trim().toLowerCase();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
};

/** Normalizza per la ricerca: minuscolo, senza accenti. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const fmtValore = (v: number | null) =>
  (v ?? 0).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface DimBlock {
  dim: string;
  nome: string;
  color: string;
  kpis: KpiSchedaRow[];
}

const KpiRow = ({
  k,
  open,
  onToggle,
}: {
  k: KpiSchedaRow;
  open: boolean;
  onToggle: () => void;
}) => {
  const panelId = `kpi-acc-${k.kpi.replace(/\W/g, "-")}`;
  return (
    <div data-testid={`kpi-row-${k.kpi}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full px-4 py-2 flex items-center gap-3 text-[12px] text-left hover:bg-muted/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: NEUTRAL_DOT }}
          aria-hidden="true"
        />
        <span
          className="flex-shrink-0 w-5 h-5 rounded border border-border flex items-center justify-center text-muted-foreground"
          aria-hidden="true"
        >
          {open ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
        </span>
        <span className="font-mono text-muted-foreground w-12 flex-shrink-0">{k.kpi}</span>
        <span className="flex-1 text-foreground leading-snug">{cleanText(k.nome)}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground flex-shrink-0">
          {k.unita ?? "—"}
        </span>
        <span className="font-semibold text-foreground tabular-nums flex-shrink-0 w-16 text-right">
          {fmtValore(k.valore)}
        </span>
      </button>
      {open && (
        <div
          id={panelId}
          className="px-4 pb-3 pl-[4.25rem] text-[12px] space-y-1.5"
          data-testid={`kpi-acc-${k.kpi}`}
        >
          <div className="flex gap-2">
            <span className="text-muted-foreground w-28 flex-shrink-0">Tipo di sintesi</span>
            <span className="text-foreground font-medium">{cleanText(k.tipo_sintesi) || "—"}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-28 flex-shrink-0">Formula</span>
            <span className="text-foreground whitespace-pre-line break-words">
              {cleanText(k.formula_catalogo) || "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export const KpiAbilitantiSection = () => {
  const filtriQ = useKpiFiltri();
  const [annoSel, setAnnoSel] = useState<number | null>(null);
  const [aperti, setAperti] = useState<Set<string>>(new Set());
  const [cerca, setCerca] = useState("");

  const annoDefault = filtriQ.data?.anno_predefinito ?? null;
  const anno = annoSel ?? annoDefault;

  /* Verifica "ente censito" (solo utenti di ente, flag di sistema attivo) */
  const scope = useEnteScope();
  const { flags } = useAdminState();
  const verificaOn = flags.find((f) => f.key === "kpi_verifica_enti")?.enabled ?? true;
  const verifica = scope.isEnteUser && verificaOn;
  const entiQ = useKpiEntiCensiti(anno, verifica);
  const censiti = entiQ.data; // undefined = in caricamento · null = controllo non disponibile
  const accesso: "ok" | "verifica" | "non-censito" | "errore" = !verifica
    ? "ok"
    : entiQ.isError
      ? "errore"
      : entiQ.isLoading || censiti === undefined
        ? "verifica"
        : censiti === null || (scope.codiceFiscale != null && censiti.has(scope.codiceFiscale))
          ? "ok"
          : "non-censito";
  const altriCensiti =
    censiti instanceof Set
      ? scope.options.filter((o) => o.cf !== scope.codiceFiscale && censiti.has(o.cf)).length
      : 0;

  const schedaQ = useKpiScheda(anno, accesso === "ok");

  const cambiaAnno = (a: number | null) => {
    setAnnoSel(a);
    setAperti(new Set()); // al cambio anno si chiudono tutti gli accordion
  };

  const toggle = (kpi: string) =>
    setAperti((prev) => {
      const n = new Set(prev);
      if (n.has(kpi)) n.delete(kpi);
      else n.add(kpi);
      return n;
    });

  /* Ricerca: ogni parola deve comparire nel codice o nel nome del KPI */
  const termini = norm(cerca.trim()).split(/\s+/).filter(Boolean);
  const righe = useMemo(() => {
    const all = schedaQ.data ?? [];
    if (!termini.length) return all;
    // Codice KPI completo (es. "D6.1"): se esiste, mostra solo quel KPI (non D6.10…D6.19)
    if (termini.length === 1 && /^d\d+\.\d+$/.test(termini[0])) {
      const esatto = all.filter((r) => norm(r.kpi) === termini[0]);
      if (esatto.length) return esatto;
    }
    return all.filter((r) => {
      const testo = norm(`${r.kpi} ${cleanText(r.nome)}`);
      return termini.every((t) => testo.includes(t));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedaQ.data, termini.join(" ")]);

  /* Export: tutti i KPI dell'anno scelto (non solo quelli filtrati) */
  const exportData = useMemo<ExportTable[]>(
    () => [
      {
        title: `KPI Riforma PA ${anno ?? ""}`.trim(),
        headers: [
          "Anno",
          "Dimensione",
          "Descrizione dimensione",
          "KPI",
          "Nome",
          "Unità",
          "Valore",
          "Tipo di sintesi",
          "Formula",
        ],
        rows: (schedaQ.data ?? []).map((r) => [
          r.anno,
          r.dimensione,
          sentenceCase(cleanText(r.descrizione_dimensione)),
          r.kpi,
          cleanText(r.nome),
          r.unita ?? "",
          r.valore ?? 0,
          cleanText(r.tipo_sintesi),
          cleanText(r.formula_catalogo),
        ]),
      },
    ],
    [schedaQ.data, anno],
  );

  /* Raggruppamento per dimensione, mantenendo l'ordine del DB */
  const blocks = useMemo<DimBlock[]>(() => {
    const map = new Map<string, DimBlock>();
    righe.forEach((r) => {
      const b = map.get(r.dimensione) ?? {
        dim: r.dimensione,
        nome: sentenceCase(cleanText(r.descrizione_dimensione) || r.dimensione),
        color: DIM_COLORS[r.dimensione] ?? "hsl(210,15%,60%)",
        kpis: [],
      };
      b.kpis.push(r);
      map.set(r.dimensione, b);
    });
    return [...map.values()].sort((a, b) => a.dim.localeCompare(b.dim, "it", { numeric: true }));
  }, [righe]);

  return (
    <div className="flex-1 flex flex-col" data-testid="kpi-abilitanti-section">
      {/* Pannello filtri: unica voce Anno */}
      <div
        className="px-4 py-2 border-b border-border bg-card flex items-center gap-3 flex-wrap"
        data-testid="kpi-filtri"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Filtri
        </span>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="kpi-anno" className="text-sm text-muted-foreground">
            Anno
          </label>
          <Select
            value={anno != null ? String(anno) : undefined}
            onValueChange={(v) => cambiaAnno(Number(v))}
            disabled={!filtriQ.data?.anni.length}
          >
            <SelectTrigger id="kpi-anno" className="h-8 w-[110px]" data-testid="kpi-anno-select">
              <SelectValue placeholder={filtriQ.isLoading ? "…" : "—"} />
            </SelectTrigger>
            <SelectContent>
              {(filtriQ.data?.anni ?? []).map((a) => (
                <SelectItem key={a} value={String(a)}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {annoSel != null && annoSel !== annoDefault && (
          <button
            type="button"
            onClick={() => cambiaAnno(null)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            data-testid="kpi-reimposta"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reimposta
          </button>
        )}
        <div className="relative ml-auto w-full sm:w-[340px]">
          <Search
            className="h-4 w-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={cerca}
            onChange={(e) => setCerca(e.target.value)}
            placeholder="Cerca KPI per codice o nome (es. D6.1, donne)"
            aria-label="Cerca KPI per codice o nome"
            className="h-8 pl-8 pr-8 text-sm"
            data-testid="kpi-search"
          />
          {cerca && (
            <button
              type="button"
              onClick={() => setCerca("")}
              aria-label="Cancella ricerca"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              data-testid="kpi-search-clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {termini.length > 0 && schedaQ.isSuccess && (
          <span className="text-xs text-muted-foreground" data-testid="kpi-search-count">
            {righe.length} di {schedaQ.data?.length ?? 0} KPI
          </span>
        )}
        <EnteSelector />
      </div>

      {accesso === "verifica" && (
        <div className="p-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Verifica dell'ente in corso…
        </div>
      )}
      {(accesso === "non-censito" || accesso === "errore") && (
        <div className="p-4">
          <div className="tableau-card max-w-xl mx-auto" data-testid="kpi-non-censito">
            <div className="tableau-card-header flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              {accesso === "errore"
                ? "Verifica dell'ente non riuscita"
                : "Ente non censito nella rilevazione KPI"}
            </div>
            <div className="p-6 text-sm text-muted-foreground leading-relaxed space-y-2">
              {accesso === "errore" ? (
                <p>
                  Non è stato possibile verificare la partecipazione dell'ente alla rilevazione KPI.
                  Riprova più tardi.
                </p>
              ) : (
                <>
                  <p>
                    L'ente selezionato non risulta tra gli enti censiti nella rilevazione KPI {anno}
                    : i dati di questa sezione non sono disponibili.
                  </p>
                  {altriCensiti > 0 && (
                    <p>
                      Hai{" "}
                      {altriCensiti === 1
                        ? "un altro ente censito"
                        : `${altriCensiti} enti censiti`}
                      : selezionalo dal menu «Ente» in alto a destra.
                    </p>
                  )}
                  {(filtriQ.data?.anni.length ?? 0) > 1 && (
                    <p>Puoi anche provare con un altro anno.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {accesso === "ok" && (
        <div className="p-4 space-y-4">
          <div className="tableau-card">
            <div className="tableau-card-header flex items-center justify-between gap-2">
              <span>KPI Abilitanti e di Successo per Dimensione (Metodologia Ufficiale)</span>
              {schedaQ.isSuccess && (schedaQ.data?.length ?? 0) > 0 && (
                <span data-testid="kpi-export">
                  <TableExport
                    filename={`kpi-riforma-pa-${anno ?? ""}`}
                    title={`KPI Abilitanti e di Successo — anno ${anno ?? ""}`}
                    data={exportData}
                  />
                </span>
              )}
            </div>
            <div className="p-4">
              {(filtriQ.isLoading || schedaQ.isLoading) && (
                <div className="py-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Caricamento KPI…
                </div>
              )}
              {(filtriQ.isError || schedaQ.isError) && (
                <div
                  className="py-6 flex items-center gap-2 text-sm text-destructive"
                  data-testid="kpi-error"
                >
                  <AlertCircle className="h-4 w-4" />
                  Impossibile caricare i KPI:{" "}
                  {((filtriQ.error ?? schedaQ.error) as Error)?.message ?? "errore sconosciuto"}
                </div>
              )}
              {schedaQ.isSuccess && blocks.length === 0 && (
                <p
                  className="py-6 text-sm text-muted-foreground text-center"
                  data-testid="kpi-empty"
                >
                  {termini.length > 0
                    ? `Nessun KPI corrisponde a «${cerca.trim()}».`
                    : `Nessun KPI disponibile per l'anno ${anno}.`}
                </p>
              )}
              {blocks.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                  {blocks.map((block) => (
                    <div
                      key={block.dim}
                      className="rounded-lg border border-border overflow-hidden"
                      data-testid={`kpi-card-${block.dim}`}
                    >
                      <div
                        className="px-4 py-2.5 flex items-center gap-2"
                        style={{
                          background: block.color + "15",
                          borderBottom: `2px solid ${block.color}`,
                        }}
                      >
                        <div
                          className="w-3 h-3 rounded-sm flex-shrink-0"
                          style={{ background: block.color }}
                        />
                        <span className="text-[13px] font-bold text-foreground">
                          {block.dim} – {block.nome}
                        </span>
                      </div>
                      <div className="divide-y divide-border/50 max-h-[440px] overflow-y-auto">
                        {block.kpis.map((k) => (
                          <KpiRow
                            key={`${k.anno}-${k.kpi}`}
                            k={k}
                            open={aperti.has(k.kpi)}
                            onToggle={() => toggle(k.kpi)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
