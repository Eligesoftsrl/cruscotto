import { afterEach, describe, it, expect, vi } from "vitest";

const load = async (env: Record<string, string>) => {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import("@/config/accessibility");
};

describe("config/accessibility (adempimenti AGID)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("senza dati dell'amministrazione non mostra link", async () => {
    const c = await load({ VITE_A11Y_STATEMENT_URL: "", VITE_A11Y_FEEDBACK_EMAIL: "" });
    expect(c.A11Y_STATEMENT_URL).toBeNull();
    expect(c.A11Y_FEEDBACK_HREF).toBeNull();
  });

  it("accetta solo link https e email semplici", async () => {
    const ok = await load({
      VITE_A11Y_STATEMENT_URL: "https://form.agid.gov.it/view/abc",
      VITE_A11Y_FEEDBACK_EMAIL: "accessibilita@ente.gov.it",
    });
    expect(ok.A11Y_STATEMENT_URL).toBe("https://form.agid.gov.it/view/abc");
    expect(ok.A11Y_FEEDBACK_HREF).toMatch(/^mailto:accessibilita@ente\.gov\.it\?subject=/);

    const bad = await load({
      VITE_A11Y_STATEMENT_URL: "javascript:alert(1)",
      VITE_A11Y_FEEDBACK_EMAIL: "a@b.it?bcc=x@y.it",
    });
    expect(bad.A11Y_STATEMENT_URL).toBeNull();
    expect(bad.A11Y_FEEDBACK_HREF).toBeNull();
  });
});
