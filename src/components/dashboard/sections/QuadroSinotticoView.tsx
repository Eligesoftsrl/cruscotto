import React from "react";
import { Info, FileText, Calculator, BarChart3, Lightbulb, Database } from "lucide-react";
import { syntheticIndicators } from "../AppSidebar";

/* ── Methodological sheet data per pillar ── */
const pillarMethodology: Record<string, {
  label: string;
  description: string;
  executive: { id: string; name: string; formula: string; domain: string; interpretation: string; sources: string }[];
  synthetic: { id: string; name: string; description: string; source: string }[];
}> = {
  D1: {
    label: "Rilevazione e classificazione di professioni e competenze",
    description: "Capacità delle amministrazioni di adottare modelli di gestione HR basati sulle competenze, analizzando costruzione, utilizzo e valorizzazione del capitale professionale.",
    executive: [
      { id: "CGC", name: "Capacità di Gestione delle Competenze", formula: "CGC = D1.1 + D1.2 + D1.3 + D2.3", domain: "[0;4]", interpretation: "Misura la presenza di infrastruttura competency-based (struttura) e il suo utilizzo operativo (assessment). Valore 4 = piena maturità.", sources: "KPI Riforma PA (D1.1–D1.3, D2.3)" },
    ],
    synthetic: [
      { id: "IAC", name: "Indice Adozione Catalogo", description: "Grado di adozione del catalogo professionale Minerva", source: "Minerva" },
      { id: "IIMP-R", name: "Indice Implementazione Ruoli", description: "Livello di articolazione dei profili di ruolo", source: "Minerva / SIPrO" },
      { id: "ICPR", name: "Indice Copertura Profili di Ruolo", description: "Quota di personale con profilo di ruolo assegnato", source: "Minerva" },
      { id: "ICVC", name: "Indice Competenze vs Catalogo", description: "Grado di copertura delle competenze rispetto al catalogo", source: "Minerva" },
      { id: "IACU", name: "Indice Adeguatezza Competenze", description: "Allineamento competenze possedute vs richieste", source: "Minerva" },
    ],
  },
  D2: {
    label: "Programmazione del fabbisogno di personale",
    description: "Governo strategico della dinamica dell'organico: coerenza strutturale, stabilità contrattuale, sostenibilità demografica e pianificazione triennale.",
    executive: [
      { id: "IGF", name: "Indice di Governo Strategico del Fabbisogno", formula: "IGF = ((IRS + IDP_Norm)/2 + PTI + IRG_Norm) / 3", domain: "[0;1]", interpretation: "Valori alti indicano coerenza tra organico, politiche di assunzione e ricambio generazionale.", sources: "Conto Annuale" },
      { id: "PSFL", name: "Planning Strategico della Forza Lavoro", formula: "Condizione: D2.3=1; poi f(100%-D2.1, D3.4)", domain: "[0;4] livelli", interpretation: "0=Planning amministrativo, 4=Planning strategico avanzato. Prerequisito: assessment competenze effettuato.", sources: "KPI Riforma PA" },
    ],
    synthetic: [
      { id: "IRS", name: "Indice Risorse Servizio", description: "Rapporto personale in servizio su dotazione organica", source: "Conto Annuale" },
      { id: "IDP", name: "Indice Dotazione Personale", description: "Direzione del cambiamento della composizione professionale", source: "Conto Annuale" },
      { id: "PTI", name: "Piano Triennale Integrato", description: "Peso delle assunzioni a tempo indeterminato", source: "Conto Annuale" },
      { id: "IRG", name: "Indice Ricambio Generazionale", description: "Rapporto nuove entrate / platea prossima all'uscita", source: "Conto Annuale" },
    ],
  },
  D3: {
    label: "Recruiting",
    description: "Capacità di attivare, gestire e finalizzare processi di reclutamento efficaci: attrazione candidature, efficienza procedure, copertura posti.",
    executive: [
      { id: "GR", name: "Indice di Gestione del Recruiting", formula: "SGR = D3.1 + D3.2; se SGR≥1 → f(SGR, D3.4)", domain: "[0;4] livelli", interpretation: "0=Recruiting procedurale, 4=Recruiting strutturato e strategicamente orientato.", sources: "KPI Riforma PA / InPA" },
    ],
    synthetic: [
      { id: "IAR", name: "Indice Attrazione Reclutamento", description: "Rapporto candidature/posto nelle procedure", source: "InPA" },
      { id: "DDP", name: "Durata Procedure di Selezione", description: "Tempo medio dalla pubblicazione all'assunzione", source: "InPA" },
      { id: "IAP", name: "Indice Assunzioni Programmate", description: "Coerenza assunzioni effettuate vs programmate", source: "InPA / Conto Annuale" },
      { id: "IAT", name: "Indice Assunzioni Tempestive", description: "Tempestività copertura posti banditi", source: "InPA" },
      { id: "TSC", name: "Tasso Successo Concorsuale", description: "Percentuale idonei su candidati", source: "InPA" },
      { id: "TCP", name: "Tasso Copertura Posti", description: "Assunti effettivi su posti disponibili", source: "InPA" },
      { id: "TCPB", name: "Tasso Copertura Posti Bando", description: "Copertura complessiva delle posizioni bandite", source: "InPA" },
    ],
  },
  D4: {
    label: "Sviluppo professionale",
    description: "Investimento in sviluppo competenze, qualificazione del capitale umano e strutturazione professionale attraverso formazione, Minerva e Syllabus.",
    executive: [
      { id: "CGC (CA)", name: "Capacità Gestione Competenze (Conto Annuale)", formula: "(TCF + IFM_Norm + DPI_Norm + CQT) / 4", domain: "[0;1]", interpretation: "Sintetizza diffusione e intensità della formazione e dinamiche di crescita interna.", sources: "Conto Annuale" },
    ],
    synthetic: (syntheticIndicators["D4"] || []).map(i => ({
      id: i.id, name: i.label, description: `Indicatore sintetico ${i.id}`, source: "Conto Annuale / Minerva / Syllabus",
    })),
  },
  D5: {
    label: "Rewarding e sviluppo di carriera",
    description: "Dinamicità dei percorsi di carriera, progressioni professionali e trasformazione della struttura delle qualifiche.",
    executive: [
      { id: "IDC", name: "Indice di Dinamicità della Carriera", formula: "IDC = (DPI_Norm + ICS_Norm) / 2", domain: "[0;1]", interpretation: "Valori alti → percorsi di crescita attivi con effetti strutturali sull'organico.", sources: "Conto Annuale" },
    ],
    synthetic: [
      { id: "ICS", name: "Indice Crescita Stipendiale", description: "Evoluzione retributiva connessa a progressioni", source: "Conto Annuale" },
    ],
  },
  D6: {
    label: "Capacity building e performance organizzativa",
    description: "Assetto organizzativo, sostenibilità dell'organico, modelli di lavoro flessibile, digitalizzazione e performance dei processi.",
    executive: [],
    synthetic: (syntheticIndicators["D6"] || []).map(i => ({
      id: i.id, name: i.label, description: `Indicatore sintetico ${i.id}`, source: "Conto Annuale / SIPrO",
    })),
  },
};

interface QuadroSinotticoViewProps {
  pillar: string;
}

export const QuadroSinotticoView = ({ pillar }: QuadroSinotticoViewProps) => {
  const data = pillarMethodology[pillar];
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="tableau-card">
        <div className="tableau-card-header flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Quadro Sinottico · {pillar} — {data.label}
        </div>
        <div className="p-4">
          <p className="text-[12px] text-muted-foreground leading-relaxed">{data.description}</p>
        </div>
      </div>

      {/* Executive indicators methodology */}
      {data.executive.length > 0 && (
        <div className="tableau-card">
          <div className="tableau-card-header flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Indicatori Executive · {pillar}
          </div>
          <div className="divide-y divide-border">
            {data.executive.map((ex) => (
              <div key={ex.id} className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{ex.id}</span>
                  <span className="text-[12px] text-muted-foreground">— {ex.name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Calculator className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Formula</span>
                    </div>
                    <code className="text-[11px] text-foreground bg-muted/50 px-2 py-1 rounded block font-mono">{ex.formula}</code>
                    <p className="text-[10px] text-muted-foreground">Dominio: {ex.domain}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interpretazione</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{ex.interpretation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Database className="h-3 w-3 text-muted-foreground/60" />
                  <span className="text-[9px] text-muted-foreground/70">{ex.sources}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synthetic indicators table */}
      <div className="tableau-card">
        <div className="tableau-card-header flex items-center gap-2">
          <Info className="h-4 w-4" />
          Indicatori Sintetici · {pillar} — Mappatura
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 font-bold text-muted-foreground">Codice</th>
                <th className="text-left px-3 py-2 font-bold text-muted-foreground">Denominazione</th>
                <th className="text-left px-3 py-2 font-bold text-muted-foreground">Descrizione</th>
                <th className="text-left px-3 py-2 font-bold text-muted-foreground">Fonte Dati</th>
              </tr>
            </thead>
            <tbody>
              {data.synthetic.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? "" : "bg-muted/15"}>
                  <td className="px-3 py-2 font-bold text-primary">{s.id}</td>
                  <td className="px-3 py-2 font-semibold text-foreground">{s.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{s.description}</td>
                  <td className="px-3 py-2 text-muted-foreground">{s.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
