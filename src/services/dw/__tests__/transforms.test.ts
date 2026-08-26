import { describe, it, expect } from "vitest";
import { transformEtaData } from "@/services/dw/etaService";
import { transformGenereData } from "@/services/dw/genereService";
import { transformCessatiData } from "@/services/dw/cessatiService";

describe("transformEtaData", () => {
  it("aggrega per fascia rispettando l'ordine anagrafico e calcola il totale", () => {
    const rows = [
      { fascia_eta: "E20", uomini: 10, donne: 5, anno: 2023 },
      { fascia_eta: "E55", uomini: 3, donne: 7, anno: 2023 },
      { fascia_eta: "E20", uomini: 2, donne: 1, anno: 2023 }, // stessa fascia -> somma
    ];
    const fasce = [
      { codice: "E20", classe: "20-24", eta_min: 20 },
      { codice: "E55", classe: "55-59", eta_min: 55 },
    ];
    const res = transformEtaData(rows, fasce);
    expect(res.distribuzioneEta).toHaveLength(2);
    expect(res.distribuzioneEta[0]).toMatchObject({ fascia: "20-24", uomini: 12, donne: 6, totale: 18 });
    expect(res.distribuzioneEta[1]).toMatchObject({ fascia: "55-59", totale: 10 });
    expect(res.totalePersonale).toBe(28);
  });

  it("ritorna struttura vuota senza righe", () => {
    expect(transformEtaData([], [])).toEqual({ distribuzioneEta: [], totalePersonale: 0 });
  });
});

describe("transformGenereData", () => {
  it("calcola le percentuali di genere e distingue i dirigenti", () => {
    const rows = [
      { qualifica: "Dirigente", tp_uomini: 6, tp_donne: 4, anno: 2023 },
      { qualifica: "Funzionario", tp_uomini: 30, tp_donne: 60, anno: 2023 },
    ];
    const res = transformGenereData(rows);
    // totale = 100, donne = 64, uomini = 36
    expect(res.kpiOverview.donnePerc).toBe(64);
    expect(res.kpiOverview.uominiPerc).toBe(36);
    expect(res.kpiOverview.personaleDirigente).toBe(10);
    expect(res.kpiOverview.personaleNonDirigente).toBe(90);
    // ordinamento per totale desc
    expect(res.generePerQualifica[0].qualifica).toBe("Funzionario");
  });
});

describe("transformCessatiData", () => {
  it("aggrega per causale con label e costruisce la serie storica", () => {
    const cessati = [
      { causale: "PENS", uomini: 5, donne: 5, anno: 2023 },
      { causale: "DIM", uomini: 2, donne: 3, anno: 2023 },
    ];
    const serie = [
      { anno: 2022, uomini: 4, donne: 6 },
      { anno: 2023, uomini: 7, donne: 8 },
    ];
    const causali = [
      { cod_alfa: "PENS", descrizione: "Pensionamento" },
      { cod_alfa: "DIM", descrizione: "Dimissioni" },
    ];
    const occ = [{ tp_uomini: 100, tp_donne: 100, anno: 2023 }];
    const res = transformCessatiData(cessati, serie, causali, occ);
    expect(res.cessazioniPerCausale[0]).toMatchObject({ causale: "Pensionamento", totale: 10 });
    expect(res.serieStoricaCessati).toEqual([
      { anno: 2022, cessati: 10 },
      { anno: 2023, cessati: 15 },
    ]);
    expect(res.kpiOverview.personaleTotale).toBe(200);
  });
});
