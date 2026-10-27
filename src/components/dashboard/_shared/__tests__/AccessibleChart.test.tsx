import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { Bar, BarChart, Line, LineChart, Pie, PieChart, PolarAngleAxis, Radar, RadarChart, XAxis, YAxis } from "recharts";
import { extractChartTable } from "@/lib/a11y/chartTable";
import { ResponsiveContainer } from "@/components/dashboard/_shared/AccessibleChart";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;

const data = [
  { anno: 2022, uomini: 10, donne: 12.5 },
  { anno: 2023, uomini: 15000, donne: null },
];

describe("extractChartTable", () => {
  it("grafico a barre: categoria dall'asse X, una colonna per serie con il nome", () => {
    const t = extractChartTable(
      <BarChart data={data}>
        <XAxis dataKey="anno" />
        <Bar dataKey="uomini" name="Uomini" />
        <Bar dataKey="donne" name="Donne" />
      </BarChart>,
    );
    expect(t?.columns).toEqual(["Categoria", "Uomini", "Donne"]);
    expect(t?.rows).toEqual([
      ["2022", "10", "12,5"],
      ["2023", "15.000", "—"],
    ]);
  });

  it("grafico orizzontale: categoria dall'asse Y", () => {
    const t = extractChartTable(
      <BarChart data={[{ label: "A", value: 3 }]} layout="vertical">
        <XAxis type="number" />
        <YAxis dataKey="label" type="category" name="Ente" />
        <Bar dataKey="value" />
      </BarChart>,
    );
    expect(t?.columns).toEqual(["Ente", "value"]);
    expect(t?.rows).toEqual([["A", "3"]]);
  });

  it("torta: voce, valore e quota", () => {
    const t = extractChartTable(
      <PieChart>
        <Pie data={[{ name: "Sì", value: 3 }, { name: "No", value: 1 }]} dataKey="value" nameKey="name" />
      </PieChart>,
    );
    expect(t?.columns).toEqual(["Voce", "Valore", "Quota"]);
    expect(t?.rows).toEqual([
      ["Sì", "3", "75%"],
      ["No", "1", "25%"],
    ]);
  });

  it("radar: categoria dall'asse angolare; serie nascoste escluse; frammenti attraversati", () => {
    const t = extractChartTable(
      <RadarChart data={[{ asse: "Digitale", A: 40, B: 50 }]}>
        <PolarAngleAxis dataKey="asse" />
        <>
          <Radar dataKey="A" name="Ente A" />
        </>
        <Radar dataKey="B" hide />
      </RadarChart>,
    );
    expect(t?.columns).toEqual(["Categoria", "Ente A"]);
    expect(t?.rows).toEqual([["Digitale", "40"]]);
  });

  it("nessun dato: nessuna tabella", () => {
    expect(
      extractChartTable(
        <LineChart data={[]}>
          <Line dataKey="x" />
        </LineChart>,
      ),
    ).toBeNull();
  });
});

describe("ResponsiveContainer accessibile", () => {
  it("mostra il pulsante e apre la tabella con il titolo della card", () => {
    render(
      <section>
        <h3>Personale per anno</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <XAxis dataKey="anno" name="Anno" />
              <Bar dataKey="uomini" name="Uomini" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>,
    );
    const btn = screen.getByRole("button", { name: /visualizza in tabella/i });
    expect(btn).toHaveAccessibleName("Visualizza in tabella (Personale per anno)");
    fireEvent.click(btn);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Personale per anno" })).toBeInTheDocument();
    expect(within(dialog).getAllByRole("columnheader").map((c) => c.textContent)).toEqual(["Anno", "Uomini"]);
    expect(within(dialog).getAllByRole("rowheader").map((c) => c.textContent)).toEqual(["2022", "2023"]);
    expect(within(dialog).getByRole("button", { name: "Chiudi" })).toBeInTheDocument();
  });

  it("table={false}: nessun pulsante", () => {
    render(
      <div style={{ height: 100 }}>
        <ResponsiveContainer table={false}>
          <BarChart data={data}>
            <Bar dataKey="uomini" />
          </BarChart>
        </ResponsiveContainer>
      </div>,
    );
    expect(screen.queryByRole("button", { name: /visualizza in tabella/i })).toBeNull();
  });
});
