import { describe, it, expect } from "vitest";
import {
  affix,
  byMaxThreshold,
  byMinThreshold,
  bySign,
  fmtSigned,
  loadingOr,
  pickByKey,
  pickFirst,
  trendArrow,
  unlessAll,
} from "@/lib/conditional";

describe("lib/conditional", () => {
  it("byMinThreshold / byMaxThreshold", () => {
    const steps = [[60, "verde"], [40, "giallo"]] as const;
    expect(byMinThreshold(60, steps, "rosso")).toBe("verde");
    expect(byMinThreshold(59.9, steps, "rosso")).toBe("giallo");
    expect(byMinThreshold(10, steps, "rosso")).toBe("rosso");
    const max = [[25, "Basso"], [50, "Moderato"]] as const;
    expect(byMaxThreshold(24, max, "Alto")).toBe("Basso");
    expect(byMaxThreshold(25, max, "Alto")).toBe("Moderato");
    expect(byMaxThreshold(50, max, "Alto")).toBe("Alto");
  });

  it("bySign, fmtSigned, trendArrow", () => {
    expect(bySign(2, "p", "n", "z")).toBe("p");
    expect(bySign(-2, "p", "n", "z")).toBe("n");
    expect(bySign(0, "p", "n", "z")).toBe("z");
    expect(fmtSigned(3, String)).toBe("+3");
    expect(fmtSigned(-3, String)).toBe("-3");
    expect(fmtSigned(0, String)).toBe("0");
    expect(trendArrow(1)).toBe("▲ +");
    expect(trendArrow(-1)).toBe("▼ ");
    expect(trendArrow(0)).toBe("→ ");
  });

  it("pickFirst / pickByKey", () => {
    expect(pickFirst([[false, "a"], [true, "b"]], "c")).toBe("b");
    expect(pickFirst([[false, "a"], [0, "b"]], "c")).toBe("c");
    expect(pickByKey("up", { up: 1, down: 2 }, 0)).toBe(1);
    expect(pickByKey("toString", { up: 1 }, 0)).toBe(0);
    expect(pickByKey(null, { up: 1 }, 0)).toBe(0);
  });

  it("loadingOr, affix, unlessAll", () => {
    expect(loadingOr(true, 5, String)).toBe("…");
    expect(loadingOr(false, null, String)).toBe("N/D");
    expect(loadingOr(false, 5, String)).toBe("5");
    expect(affix("2024", " (", ")")).toBe(" (2024)");
    expect(affix(null, " (", ")")).toBe("");
    expect(unlessAll("Tutte", "Tutte")).toBeNull();
    expect(unlessAll("Lazio", "Tutte")).toBe("Lazio");
  });
});
