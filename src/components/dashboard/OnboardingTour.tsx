import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "@/contexts/AuthContext";

const TOUR_KEY = "cruscotto_hr_tour_completed_v3";

export const OnboardingTour = () => {
  const [shouldRun, setShouldRun] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done && profile) {
      const timer = setTimeout(() => setShouldRun(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  useEffect(() => {
    if (!shouldRun || !profile) return;

    const isDfp = profile.role === "dfp";

    const filterDescription = isDfp
      ? "I filtri globali (anno, regione, comparto, dimensione PA, cluster) restano attivi in tutte le viste. Modifica un filtro e i dati si aggiornano ovunque, in tempo reale."
      : "Il filtro <strong>Anno</strong> ti permette di selezionare il periodo di riferimento. I dati sono filtrati automaticamente sulla tua amministrazione. Modifica l'anno e i dati si aggiornano ovunque.";

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: "rgba(0,0,0,0.6)",
      popoverClass: "onboarding-popover",
      nextBtnText: "Avanti →",
      prevBtnText: "← Indietro",
      doneBtnText: "Inizia!",
      progressText: "{{current}} di {{total}}",
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_KEY, "true");
        driverObj.destroy();
      },
      steps: [
        /* 1 — Benvenuto */
        {
          popover: {
            title: "🏛️ Benvenuto nel Cruscotto HR",
            description:
              `Il Cruscotto HR della PA è organizzato su <strong>tre livelli di visualizzazione</strong>: Executive, Sintetica e Operativa.<br/>` +
              (isDfp
                ? "Come utente <strong>DFP</strong> hai accesso a tutte le amministrazioni con filtri avanzati di benchmarking."
                : `Come <strong>Responsabile HR</strong> di <em>${profile.ente_denominazione ?? "un ente"}</em>, i dati sono filtrati sulla tua amministrazione.`) +
              "<br/>Questo tour ti guiderà attraverso tutte le funzionalità principali.",
          },
        },
        /* 2 — Sidebar */
        {
          element: '[aria-label="Navigazione principale"]',
          popover: {
            title: "📂 Sidebar di navigazione",
            description:
              "La sidebar organizza il cruscotto in tre sezioni:<br/>" +
              "• <strong>Vista Executive</strong> – indicatori strategici aggregati per i 6 Pillar (D1-D6)<br/>" +
              "• <strong>Vista Sintetica</strong> – drill-down per Pillar con indicatori di dettaglio<br/>" +
              "• <strong>Vista Operativa</strong> – dati analitici per fonte (Conto Annuale, InPA, Minerva, SIPrO, Syllabus, KPI Riforma, Lavoro Pubblico)",
            side: "right",
            align: "start",
          },
        },
        /* 3 — Breadcrumb */
        {
          element: '[aria-label="Breadcrumb"]',
          popover: {
            title: "🧭 Breadcrumb e drill-up",
            description:
              "Il breadcrumb mostra la tua posizione: livello → pillar/fonte → indicatore. <strong>Clicca su qualsiasi crumb</strong> per risalire a un livello superiore.",
            side: "bottom",
            align: "start",
          },
        },
        /* 4 — Filtri globali (role-aware) */
        {
          element: '[role="toolbar"][aria-label="Filtri globali"]',
          popover: {
            title: isDfp ? "🔍 Filtri globali multi-ente" : "🔍 Filtro temporale",
            description: filterDescription,
            side: "bottom",
            align: "center",
          },
        },
        /* 5 — Vista Executive: panoramica */
        {
          element: '[data-tour="executive-grid"]',
          popover: {
            title: "📊 Vista Executive – Cruscotto strategico",
            description:
              "La vista Executive presenta gli <strong>indici compositi</strong> raggruppati per i 6 Pillar della Riforma PA:<br/>" +
              "D1 (Classificazione), D2 (Fabbisogno), D3 (Recruiting), D4 (Sviluppo), D5 (Rewarding), D6 (Sostenibilità).<br/>" +
              "Ogni card mostra gauge, trend e confronto con l'anno precedente.",
            side: "bottom",
            align: "center",
          },
        },
        /* 6 — KPI card singola */
        {
          element: '[data-tour="kpi-card"]',
          popover: {
            title: "📈 Card indicatore composito",
            description:
              "Ogni card mostra:<br/>" +
              "• <strong>Gauge</strong> con valore corrente e barra di benchmark<br/>" +
              "• <strong>Trend</strong> rispetto all'anno precedente (↑/↓)<br/>" +
              "• <strong>Sub-indicatori</strong> che compongono l'indice<br/>" +
              "Clicca sulla card per accedere al dettaglio sintetico del Pillar corrispondente.",
            side: "bottom",
            align: "start",
          },
        },
        /* 7 — Vista Sintetica (punta alla sezione sidebar) */
        {
          element: '[data-tour="sidebar-synthetic"]',
          popover: {
            title: "🔬 Vista Sintetica – Dettaglio per Pillar",
            description:
              "Dalla sidebar, espandi un <strong>Pillar (D1-D6)</strong> per vedere i suoi indicatori analitici. Ad esempio:<br/>" +
              "• D1: Diffusione modello, Strutturazione profili, Copertura competenze<br/>" +
              "• D3: Attrattività, Selettività, Durata procedure<br/>" +
              "Ogni indicatore mostra grafici dettagliati, tabelle e confronti con il benchmark.",
            side: "right",
            align: "start",
          },
        },
        /* 8 — Vista Operativa (punta alla sezione sidebar) */
        {
          element: '[data-tour="sidebar-operational"]',
          popover: {
            title: "📋 Vista Operativa – Fonti dati",
            description:
              "La sezione Operativa permette il drill-down nelle <strong>7 fonti dati</strong>:<br/>" +
              "• <strong>Conto Annuale</strong>: età, cessazioni, turnover, genere<br/>" +
              "• <strong>InPA</strong>: bandi, candidature, graduatorie<br/>" +
              "• <strong>Minerva</strong>: famiglie professionali, gap competenze<br/>" +
              "• <strong>SIPrO</strong>: processi, FTE, criticità<br/>" +
              "• <strong>Syllabus / KPI Riforma / Lavoro Pubblico</strong>",
            side: "right",
            align: "start",
          },
        },
        /* 9 — Navigazione bottom-up (punta al breadcrumb come esempio) */
        {
          element: '[aria-label="Breadcrumb"]',
          popover: {
            title: "🔄 Navigazione top-down e bottom-up",
            description:
              "Puoi navigare in due direzioni:<br/>" +
              "• <strong>Top-down</strong>: Executive → Sintetica → Operativa, cliccando su card e indicatori<br/>" +
              "• <strong>Bottom-up</strong>: dal dato operativo risali al Pillar e alla vista Executive tramite il breadcrumb e i link di risalita presenti nelle pagine",
            side: "bottom",
            align: "start",
          },
        },
        /* 10 — Chiusura */
        {
          popover: {
            title: "🚀 Sei pronto!",
            description:
              "Hai completato il tour. Puoi sempre rilanciarlo cliccando <strong>Guida</strong> nella sidebar in basso. Buona esplorazione del Cruscotto HR!",
          },
        },
      ],
    });

    driverObj.drive();

    return () => driverObj.destroy();
  }, [shouldRun, profile]);

  return null;
};

export const resetOnboardingTour = () => {
  localStorage.removeItem(TOUR_KEY);
  window.location.reload();
};
