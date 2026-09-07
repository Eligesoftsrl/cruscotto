# Adeguamento Accessibilità e Design PA (AGID / WCAG 2.1 AA)
### Proposta di fase — interventi sui componenti (esclusi i grafici)

> **Obiettivo**: portare l'applicativo verso la conformità alle regole della Pubblica
> Amministrazione (Linee guida AGID di design + Legge Stanca / WCAG 2.1 livello AA),
> intervenendo su struttura, navigazione, form, tabelle, colori e contenuti obbligatori.
>
> **Perimetro di questa fase**: **esclusi i grafici/data-visualization**, che per la loro
> complessità tecnica (SVG non accessibili di default) saranno oggetto di una **fase dedicata
> successiva**.

---

## 1. Riferimenti normativi
- **Legge 4/2004 ("Legge Stanca")** e s.m.i. — obbligo di accessibilità per la PA
- **WCAG 2.1 livello AA** (recepite tramite **EN 301 549**)
- **Linee guida AGID sull'accessibilità** + **Dichiarazione di Accessibilità** (modulo AgID) obbligatoria
- **Linee guida di design AGID / Design System Italia** (font Titillium Web, palette, spaziature)

---

## 2. Interventi per area

### 2.1 Struttura semantica e landmark  — *Sforzo: Basso*
- Attributo `lang="it"` su `<html>`; `<title>` significativo e dinamico per ogni pagina
- Landmark semantici: `<header>`, `<nav>`, `<main>`, `<footer>` (sostituendo i `<div>` generici)
- Un solo `<h1>` per pagina e gerarchia titoli corretta (nessun salto di livello)
- **Skip-link** "Vai al contenuto principale" come primo elemento focalizzabile
- Icone decorative con `aria-hidden`; icone informative con testo alternativo
- *Criteri WCAG: 1.3.1, 2.4.1, 2.4.2, 2.4.6, 4.1.2*

### 2.2 Navigazione da tastiera e gestione del focus  — *Sforzo: Medio*
- **Focus visibile** e coerente su tutti gli elementi interattivi
- Tutte le funzioni utilizzabili **esclusivamente da tastiera** con ordine di tabulazione logico
- **Focus management** su modali/dialog/menu: trap del focus, chiusura con `Esc`, ritorno al controllo di origine
- Eliminazione di elementi cliccabili non semantici (`<div>` con onClick → `<button>`/`<a>`)
- *Criteri WCAG: 2.1.1, 2.1.2, 2.4.3, 2.4.7*

### 2.3 Colori e contrasto  — *Sforzo: Medio*
- Palette allineata alle indicazioni AGID
- Contrasti conformi: testo ≥ **4.5:1**, elementi UI e bordi ≥ **3:1**
- Verifica degli stati **hover / focus / disabled** (spesso non conformi)
- L'informazione **non deve essere veicolata dal solo colore** (badge di stato, esiti, etichette "Demo"): aggiungere icona o testo
- *Criteri WCAG: 1.4.1, 1.4.3, 1.4.11*

### 2.4 Form e filtri (login, filtri ente, wizard report)  — *Sforzo: Medio*
- Ogni campo con **`<label>` associata** (il placeholder non è sufficiente)
- Messaggi d'errore testuali con **`aria-live`**, `aria-invalid` e descrizione esplicita (non solo bordo colorato)
- Raggruppamenti con `<fieldset>` / `<legend>`; componenti select accessibili
- Spostamento del focus sul primo campo in errore
- *Criteri WCAG: 1.3.1, 3.3.1, 3.3.2, 3.3.3, 4.1.2*

### 2.5 Tabelle dati  — *Sforzo: Basso*
- `<th scope="col|row">`, `<caption>`, intestazioni corrette
- Ordinamento/paginazione annunciati (`aria-sort`, label esplicite sui controlli)
- *Criteri WCAG: 1.3.1, 4.1.2*

### 2.6 Tipografia, ridimensionamento e layout responsivo  — *Sforzo: Basso*
- Font **Titillium Web** (Design System PA)
- Testo ridimensionabile fino al **200%** senza perdita di contenuto/funzionalità
- **Reflow** fino a 320px di larghezza senza scroll orizzontale
- Spaziature testo conformi (interlinea, spaziatura paragrafi)
- *Criteri WCAG: 1.4.4, 1.4.10, 1.4.12*

### 2.7 Comportamento SPA (Single Page Application)  — *Sforzo: Medio*
- Aggiornamento del **titolo pagina** ad ogni cambio route
- Annuncio del cambio di pagina agli screen reader (regione `aria-live`)
- Stato di caricamento annunciato (`aria-busy` / `aria-live`) e non affidato al solo spinner visivo
- *Criteri WCAG: 2.4.2, 4.1.3*

### 2.8 Contenuti e adempimenti obbligatori  — *Sforzo: Basso*
- **Pagina "Dichiarazione di Accessibilità"** (generata sul modulo AgID) con link nel footer
- Meccanismo di **feedback/segnalazione** in materia di accessibilità
- Link con testo autoesplicativo (evitare "clicca qui"); `alt` su immagini informative
- *Criteri WCAG: 2.4.4, 1.1.1*

---

## 3. Piano d'azione proposto

### Fase 0 — Fondamenta (rapida, alto valore, rischio nullo)
1. **Audit di baseline** automatico (axe-core + Lighthouse/pa11y) su 5 pagine chiave → fotografia iniziale e lista prioritizzata dei non-conformi
2. **Struttura semantica + skip-link + `lang` + focus-visible** (§2.1, §2.2 base)
3. **Design tokens PA**: Titillium Web + palette + correzione dei contrasti falliti (§2.3, §2.6)

### Fase 1 — Componenti (interventi mirati)
4. **Form e filtri** accessibili: label, errori `aria-live`, gestione focus (§2.4)
5. **Tabelle** accessibili: `scope`, `caption`, `aria-sort` (§2.5)
6. **Comportamento SPA**: titoli dinamici, annunci di navigazione e caricamento (§2.7)
7. **Navigazione da tastiera avanzata**: focus trap su modali/menu (§2.2 avanzato)

### Fase 2 — Contenuti obbligatori
8. **Dichiarazione di Accessibilità** + link footer + meccanismo di feedback (§2.8)

> **Nota**: la data-visualization (grafici) è **esclusa** da questa proposta e sarà oggetto di
> una fase separata, in quanto richiede un pattern dedicato (alternativa tabellare + descrizioni
> ARIA) con impatto e stima specifici.

---

## 4. Riepilogo sforzo (esclusi i grafici)

| Blocco | Sforzo |
|--------|:------:|
| Struttura/semantica, skip-link, tabelle, tipografia, dichiarazione | 🟢 Basso |
| Tastiera/focus, contrasti, form, comportamento SPA | 🟡 Medio |

---

## 5. Risultati attesi
- Copertura della maggior parte dei criteri **WCAG 2.1 AA** non dipendenti dai grafici
- Base tecnica riutilizzabile (design tokens PA, componenti accessibili) per le fasi successive
- Predisposizione degli adempimenti formali (Dichiarazione di Accessibilità)

## 6. Prossimo passo consigliato
Avvio della **Fase 0 – punto 1 (Audit di baseline)**: intervento a rischio zero che non tocca le
funzionalità e fornisce dati oggettivi (elenco puntuale dei problemi e priorità) su cui pianificare
con precisione le fasi successive.
