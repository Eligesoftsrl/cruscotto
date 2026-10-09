import {
  FileText,
  BookOpen,
  FolderOpen,
  Calendar,
  Clock,
  LogOut,
  UserPlus,
  RefreshCw,
  Repeat,
  GraduationCap,
  ArrowUpRight,
  Users,
  Briefcase,
  Laptop,
  UserCheck,
  Target,
  Star,
  BarChart2,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { EXEC_ADMIN_PILLARS, EXEC_INDICI } from "./execIndiciCatalog";
import { EXEC_SCORE_PILLARS } from "@/components/dashboard/executive/score/execScoreConfig";

/**
 * Catalogo delle SCHEDE gestibili dal Pannello Admin (attiva/disattiva),
 * organizzato per macro-sezione (Conto Annuale, Syllabus, InPA, ...).
 *
 * Ogni scheda è collegata:
 *  - a un `indicatorId` (ID usato nella sidebar "Vista Operativa")
 *  - a una `flagKey` (feature flag nello store Admin, in localStorage)
 * così che il toggle abbia effetto REALE sia per l'admin sia per l'utente
 * (la sidebar nasconde la voce e la scheda mostra l'avviso "disattivata").
 */

export interface SchedaDef {
  /** ID indicatore usato dalla sidebar operativa. */
  indicatorId: string;
  /** Chiave del feature flag nello store Admin. */
  flagKey: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface SezioneDef {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** false = macro-sezione ancora non disponibile (mostrata come "prossimamente"). */
  available: boolean;
  schede: SchedaDef[];
}

export const SCHEDE_SECTIONS: SezioneDef[] = [
  {
    id: "conto-annuale",
    label: "Conto Annuale",
    description: "Schede analitiche alimentate dagli RPC del Conto Annuale",
    icon: FileText,
    available: true,
    schede: [
      {
        indicatorId: "analisi-eta",
        flagKey: "scheda_eta",
        label: "Analisi per età",
        description: "Struttura anagrafica e piramide dell'età",
        icon: Calendar,
      },
      {
        indicatorId: "analisi-anzianita",
        flagKey: "scheda_anzianita",
        label: "Anzianità di servizio",
        description: "Distribuzione per anzianità di servizio",
        icon: Clock,
      },
      {
        indicatorId: "cessazioni",
        flagKey: "scheda_cessazioni",
        label: "Cessazioni dal servizio",
        description: "Cessazioni per causale e periodo",
        icon: LogOut,
      },
      {
        indicatorId: "assunti-causale",
        flagKey: "scheda_assunti",
        label: "Assunti per causale",
        description: "Assunzioni per tipologia e causale",
        icon: UserPlus,
      },
      {
        indicatorId: "tasso-turnover",
        flagKey: "scheda_turnover",
        label: "Tasso di turnover",
        description: "Indice di ricambio del personale",
        icon: RefreshCw,
      },
      {
        indicatorId: "tasso-sostituzione",
        flagKey: "scheda_sostituzione",
        label: "Tasso di sostituzione",
        description: "Rapporto tra ingressi e uscite",
        icon: Repeat,
      },
      {
        indicatorId: "formati-personale",
        flagKey: "scheda_formazione",
        label: "Formazione",
        description: "Personale formato e ore di formazione",
        icon: GraduationCap,
      },
      {
        indicatorId: "progressioni",
        flagKey: "scheda_progressioni",
        label: "Progressioni",
        description: "Progressioni economiche e di carriera",
        icon: ArrowUpRight,
      },
      {
        indicatorId: "analisi-personale",
        flagKey: "scheda_analisi_personale",
        label: "Analisi del personale",
        description: "Composizione del personale in servizio",
        icon: Users,
      },
      {
        indicatorId: "lavoro-flessibile",
        flagKey: "scheda_lavoro_flessibile",
        label: "Lavoro flessibile",
        description: "Contratti di lavoro flessibile",
        icon: Briefcase,
      },
      {
        indicatorId: "lavoro-agile",
        flagKey: "scheda_lavoro_agile",
        label: "Lavoro agile",
        description: "Diffusione dello smart working",
        icon: Laptop,
      },
      {
        indicatorId: "analisi-genere",
        flagKey: "scheda_analisi_genere",
        label: "Analisi per genere",
        description: "Indicatori di parità e riequilibrio di genere",
        icon: UserCheck,
      },
    ],
  },
  {
    id: "sipro-benchmark",
    label: "SIPrO — Benchmark",
    description: "Confronto multi-ente (radar, barre, ranking criticità)",
    icon: ArrowUpRight,
    available: true,
    schede: [
      { indicatorId: "sipro-benchmark-dfp", flagKey: "sipro_benchmark", label: "Benchmark DFP", description: "Confronto multi-ente", icon: Users },
    ],
  },
  {
    id: "sipro-organizzazione",
    label: "SIPrO — Organizzazione",
    description: "Organigramma, stato, provvedimenti, dotazione, criticità",
    icon: Users,
    available: true,
    schede: [
      { indicatorId: "sipro-organigramma", flagKey: "sipro_organigramma", label: "Organigramma UO", description: "Distribuzione unità organizzative", icon: Users },
      { indicatorId: "sipro-stato-org", flagKey: "sipro_stato_org", label: "Stato Organizzazione", description: "Stato delle organizzazioni", icon: FileText },
      { indicatorId: "sipro-provvedimenti", flagKey: "sipro_provvedimenti", label: "Provvedimenti Organizzativi", description: "Provvedimenti adottati", icon: FileText },
      { indicatorId: "sipro-dotazione-uo", flagKey: "sipro_dotazione_uo", label: "Dotazione Risorse UO", description: "FTE per unità organizzativa", icon: Briefcase },
      { indicatorId: "sipro-criticita-uo", flagKey: "sipro_criticita_uo", label: "Criticità UO", description: "Criticità delle UO", icon: LogOut },
    ],
  },
  {
    id: "sipro-processi",
    label: "SIPrO — Processi",
    description: "Mappatura, fasi, digitalizzazione, outsourcing, tempi",
    icon: RefreshCw,
    available: true,
    schede: [
      { indicatorId: "sipro-mappatura-processi", flagKey: "sipro_mappatura_processi", label: "Mappatura Processi", description: "Processi per funzione e tipologia", icon: RefreshCw },
      { indicatorId: "sipro-fasi-processi", flagKey: "sipro_fasi_processi", label: "Fasi dei Processi", description: "Elenco processi e obiettivi", icon: Clock },
      { indicatorId: "sipro-criticita-processi", flagKey: "sipro_criticita_processi", label: "Criticità Processi", description: "Criticità dei processi", icon: LogOut },
      { indicatorId: "sipro-digitalizzazione", flagKey: "sipro_digitalizzazione", label: "Digitalizzazione Fasi", description: "Livello di digitalizzazione", icon: Laptop },
      { indicatorId: "sipro-lavoro-agile", flagKey: "sipro_lavoro_agile", label: "Lavoro Agile Processi", description: "Lavoro agile nelle fasi", icon: Laptop },
      { indicatorId: "sipro-outsourcing", flagKey: "sipro_outsourcing", label: "Outsourcing Fasi", description: "Coinvolgimento UO / esternalizzazione", icon: Repeat },
      { indicatorId: "sipro-semplificazione", flagKey: "sipro_semplificazione", label: "Semplificazione Processi", description: "Semplificazione dei processi", icon: ArrowUpRight },
      { indicatorId: "sipro-tempi-picchi", flagKey: "sipro_tempi_picchi", label: "Tempi e Picchi", description: "Tempi previsti/effettivi e picchi", icon: Clock },
    ],
  },
  {
    id: "sipro-profili",
    label: "SIPrO — Profili e Cataloghi",
    description: "FTE, copertura, catalogo, famiglie, Minerva, evoluzione",
    icon: GraduationCap,
    available: true,
    schede: [
      { indicatorId: "sipro-fte", flagKey: "sipro_fte", label: "FTE Programmati vs Assegnati", description: "Confronto FTE programmati/assegnati", icon: Briefcase },
      { indicatorId: "sipro-copertura", flagKey: "sipro_copertura", label: "Copertura Profili di Ruolo", description: "Classi di copertura", icon: UserCheck },
      { indicatorId: "sipro-catalogo-profili", flagKey: "sipro_catalogo_profili", label: "Catalogo Profili di Ruolo", description: "Catalogo profili", icon: BookOpen },
      { indicatorId: "sipro-famiglie", flagKey: "sipro_famiglie", label: "Famiglie Professionali", description: "Catalogo famiglie (Minerva)", icon: Users },
      { indicatorId: "sipro-profili-minerva", flagKey: "sipro_profili_minerva", label: "Profili Professionali Minerva", description: "Catalogo profili (Minerva)", icon: FileText },
      { indicatorId: "sipro-ambiti-ruolo", flagKey: "sipro_ambiti_ruolo", label: "Ambiti e Profili di Ruolo", description: "Catalogo ambiti (Minerva)", icon: FolderOpen },
      { indicatorId: "sipro-aree-contrattuali", flagKey: "sipro_aree_contrattuali", label: "Aree Contrattuali", description: "Catalogo aree (Minerva)", icon: FolderOpen },
      { indicatorId: "sipro-evoluzione-profili", flagKey: "sipro_evoluzione_profili", label: "Evoluzione Profili", description: "Evoluzione profili di ruolo", icon: ArrowUpRight },
    ],
  },
  // --- Indici della Vista Sintetica (uno per pillar con score [0-100]) ---
  ...EXEC_ADMIN_PILLARS.map<SezioneDef>((p) => {
    const PILLAR_ICON: Record<string, LucideIcon> = { D2: Target, D4: GraduationCap, D5: Star, D6: BarChart2 };
    return {
      id: `exec-${p.toLowerCase()}`,
      label: `Indici ${p} — ${EXEC_SCORE_PILLARS[p].label}`,
      description: "Vista Sintetica · indici con score [0-100] (anche in Vista Executive)",
      icon: PILLAR_ICON[p] ?? Gauge,
      available: true,
      schede: EXEC_INDICI.filter((i) => i.pillar === p).map((i) => ({
        indicatorId: i.sidebarId,
        flagKey: i.flagKey,
        label: i.label,
        description: i.description,
        icon: i.sintetico ? Gauge : (PILLAR_ICON[p] ?? Gauge),
      })),
    };
  }),
  {
    id: "syllabus",
    label: "Syllabus",
    description: "Formazione e competenze — in arrivo",
    icon: BookOpen,
    available: false,
    schede: [],
  },
  {
    id: "inpa",
    label: "InPA",
    description: "Reclutamento e concorsi — in arrivo",
    icon: FolderOpen,
    available: false,
    schede: [],
  },
];

/**
 * Mappa ID indicatore (usato nella URL `?indicator=...` della Vista Tecnica)
 * -> etichetta della scheda. Serve al tracker di utilizzo per registrare gli
 * eventi con la STESSA label mostrata in «Schede più consultate», così da
 * correlare correttamente consultazioni ↔ scheda.
 */
export const SCHEDA_LABEL_BY_INDICATOR: Record<string, string> = SCHEDE_SECTIONS.flatMap(
  (sec) => sec.schede,
).reduce<Record<string, string>>((acc, s) => {
  acc[s.indicatorId] = s.label;
  return acc;
}, {});
