#!/usr/bin/env node
/**
 * Controllo automatico di accessibilità del Cruscotto HR (WCAG 2.1 / 2.2 A e AA).
 *
 * Cosa verifica, per ogni pagina e per due profili (DFP e responsabile HR di ente):
 *  1. regole axe-core WCAG 2.0/2.1/2.2 A+AA (interno SVG dei grafici escluso: ogni grafico è descritto da role="img" + tabella dati, verificati);
 *  2. riflusso a 320 px (nessuno scorrimento orizzontale della pagina) — WCAG 1.4.10;
 *  3. spaziatura del testo (interlinea 1,5 ecc.): nessun testo tagliato — WCAG 1.4.12;
 *  4. focus non coperto: navigando con Tab, l'elemento selezionato non è nascosto
 *     dall'intestazione fissa — WCAG 2.4.11.
 *
 * Uso (accesso dimostrativo, cioè con Keycloak disattivato):
 *   VITE_KEYCLOAK_URL= yarn dev --port 3001        # in un altro terminale
 *   npx playwright install chromium                  # solo la prima volta
 *   A11Y_BASE_URL=http://localhost:3001 yarn a11y
 * Solo alcune pagine: A11Y_ONLY="/dashboard?level=executive,/bussola" yarn a11y
 * Esce con codice 1 se trova problemi (utilizzabile nella pipeline di rilascio).
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const BASE = process.env.A11Y_BASE_URL || "http://localhost:3001";
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const CA = [
  "analisi-eta", "analisi-anzianita", "assunti-causale", "cessazioni", "tasso-turnover", "tasso-sostituzione",
  "progressioni", "analisi-personale", "lavoro-flessibile", "formati-personale", "analisi-genere", "lavoro-agile",
];
const PAGES = process.env.A11Y_ONLY ? process.env.A11Y_ONLY.split(",") : [
  "/",
  "/dashboard?level=executive",
  ...["D1", "D2", "D3", "D4", "D5", "D6"].map((p) => `/dashboard?level=synthetic&pillar=${p}`),
  ...CA.map((i) => `/dashboard?level=operational&source=conto-annuale&indicator=${i}`),
  "/dashboard?level=operational&source=sipro",
  "/dashboard?level=operational&source=inpa",
  "/dashboard?level=operational&source=minerva",
  "/dashboard?level=operational&source=syllabus",
  "/dashboard?level=operational&source=kpi-riforma&indicator=kpi-abilitanti",
  "/dashboard?level=operational&source=lavoro-pubblico",
  "/bussola",
];
const PROFILES = {
  dfp: { role: "dfp", is_admin: true, ente_id: null, enti_cf: [], full_name: "Verifica DFP" },
  ente: { role: "ente_hr", is_admin: false, ente_id: null, enti_cf: ["02438750586"], full_name: "Verifica Ente" },
};

/*
 * Modalità STAGING (login Keycloak reale): A11Y_KC_USERS="dfp:utente:password,ente:utente:password"
 * più, se il sito è protetto da un accesso preliminare, A11Y_HTTP_USER / A11Y_HTTP_PASS.
 */
const KC_USERS = (process.env.A11Y_KC_USERS || "")
  .split(",")
  .filter(Boolean)
  .map((x) => {
    const [name, user, ...pw] = x.split(":");
    return { name, user, pass: pw.join(":") };
  });
const HTTP_CREDENTIALS = process.env.A11Y_HTTP_USER
  ? { username: process.env.A11Y_HTTP_USER, password: process.env.A11Y_HTTP_PASS || "" }
  : undefined;

async function keycloakLogin(page, user, pass) {
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.locator("button").first().click();
  await page.waitForSelector("#username", { timeout: 30000 });
  await page.fill("#username", user);
  await page.fill("#password", pass);
  await page.keyboard.press("Enter");
  await page.waitForURL((u) => u.toString().startsWith(BASE) && !u.toString().includes("/login"), { timeout: 30000 });
  await page.waitForLoadState("networkidle");
}

const TEXT_SPACING_CSS = `* { line-height: 1.5 !important; letter-spacing: .12em !important;
  word-spacing: .16em !important; } p { margin-bottom: 2em !important; }`;

const CLIPPED_JS = () => {
  const out = [];
  document.querySelectorAll("body *").forEach((el) => {
    if (el.closest(".recharts-wrapper, [aria-hidden='true'], .sr-only")) return;
    const cs = getComputedStyle(el);
    if (cs.overflow !== "hidden" && cs.overflowY !== "hidden") return;
    if (cs.textOverflow === "ellipsis" || cs.webkitLineClamp !== "none") return; // troncamento voluto, testo completo nel title
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText && el.scrollHeight > el.clientHeight + 2 && el.clientHeight > 0) {
      out.push(`${el.tagName.toLowerCase()}: "${el.textContent.trim().slice(0, 40)}"`);
    }
  });
  return out.slice(0, 10);
};

// Elemento con il focus coperto da altri elementi (es. intestazione fissa)?
const OBSCURED_JS = () => {
  const e = document.activeElement;
  if (!e || e === document.body) return null;
  const r = e.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2));
  const y = Math.min(innerHeight - 1, Math.max(0, r.top + Math.min(r.height / 2, 8)));
  const top = document.elementFromPoint(x, y);
  if (!top || e.contains(top) || top.contains(e)) return null;
  // Contenuti aperti dall'utente (tooltip, menu, finestre) non contano come «coperture».
  if (top.closest("[role=dialog], [role=listbox], [role=menu], [role=tooltip]")) return null;
  return `${e.tagName.toLowerCase()} "${(e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 30)}"`;
};

const browser = await chromium.launch();
let problems = 0;
const RUNS = KC_USERS.length
  ? KC_USERS.map((u) => [u.name, u])
  : Object.entries(PROFILES);
for (const [name, profile] of RUNS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, httpCredentials: HTTP_CREDENTIALS });
  await ctx.addInitScript(
    (p) => {
      if (p) sessionStorage.setItem("mock_profile", JSON.stringify(p));
      localStorage.setItem("cruscotto_hr_tour_completed_v3", "true");
    },
    KC_USERS.length ? null : profile,
  );
  const page = await ctx.newPage();
  if (KC_USERS.length) await keycloakLogin(page, profile.user, profile.pass);
  for (const path of PAGES) {
    await page.setViewportSize({ width: 1440, height: 900 });
    if (KC_USERS.length) {
      // Sessione Keycloak in memoria: si naviga dentro l'app (come un utente), senza ricaricare.
      await page.evaluate((p) => {
        history.pushState({}, "", p);
        dispatchEvent(new PopStateEvent("popstate"));
      }, path);
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(1500);
      if (page.url().includes("/login")) throw new Error(`Sessione persa su ${path}`);
    } else {
      await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
    }
    await page.waitForTimeout(800);
    const res = await new AxeBuilder({ page }).withTags(TAGS).exclude(".recharts-wrapper").analyze();
    const issues = res.violations.map((v) => `${v.id} (${v.nodes.length})`);

    await page.setViewportSize({ width: 320, height: 800 });
    await page.waitForTimeout(400);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    if (sw > 322) issues.push(`riflusso-320px (larghezza ${sw}px)`);

    await page.setViewportSize({ width: 1440, height: 900 });
    const style = await page.addStyleTag({ content: TEXT_SPACING_CSS });
    await page.waitForTimeout(300);
    const clipped = await page.evaluate(CLIPPED_JS);
    if (clipped.length) issues.push(`spaziatura-testo: ${clipped.join(" | ")}`);
    await style.evaluate((n) => n.remove());

    // Focus non coperto: 60 pressioni di Tab dall'inizio della pagina.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator("body").focus().catch(() => {});
    const covered = new Set();
    for (let k = 0; k < 60; k++) {
      await page.keyboard.press("Tab");
      let o = await page.evaluate(OBSCURED_JS);
      if (o) {
        // ricontrollo dopo che animazioni e suggerimenti in chiusura sono terminati
        await page.waitForTimeout(350);
        o = await page.evaluate(OBSCURED_JS);
      }
      if (o) covered.add(o);
    }
    if (covered.size) issues.push(`focus-coperto: ${[...covered].slice(0, 5).join(" | ")}`);

    if (issues.length) {
      problems += issues.length;
      console.log(`✗ [${name}] ${path}\n    ${issues.join("\n    ")}`);
    } else {
      console.log(`✓ [${name}] ${path} — «${await page.title()}» · grafici con tabella: ${await page.getByRole("button", { name: /Visualizza in tabella/ }).count()}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(problems ? `\n${problems} problemi trovati.` : "\nNessun problema trovato.");
process.exit(problems ? 1 : 0);
