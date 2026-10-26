/** Test di sicurezza · esportazioni CSV protette dalla «formula injection». */
import { describe, it, expect } from "vitest";
import { csvCell } from "@/lib/tableExport";

describe("Esportazione CSV sicura", () => {
  it.each(["=HYPERLINK(\"http://x\")", "+cmd|' /C calc'!A0", "@SUM(1+1)", "-2+3+cmd|' /C calc'!A0", "\t=1"])(
    "neutralizza la formula %s",
    (v) => expect(csvCell(v).startsWith(`"'`)).toBe(true),
  );
  it("non altera numeri negativi e percentuali", () => {
    expect(csvCell(-5)).toBe('"-5"');
    expect(csvCell("-12,5")).toBe('"-12,5"');
    expect(csvCell("-3%")).toBe('"-3%"');
  });
  it("raddoppia le virgolette", () => expect(csvCell('a"b')).toBe('"a""b"'));
});
