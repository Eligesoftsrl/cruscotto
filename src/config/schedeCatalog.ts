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
  type LucideIcon,
} from "lucide-react";

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
