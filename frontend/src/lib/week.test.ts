import { describe, expect, it } from "vitest";
import { addDays, displayDate, formatLocalDate, getMonday } from "./week";

describe("formatLocalDate", () => {
  it("vrne datum v obliki YYYY-MM-DD z vodilnimi ničlami", () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("pravilno oblikuje zadnji dan v letu", () => {
    expect(formatLocalDate(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("getMonday", () => {
  it("za ponedeljek vrne isti dan", () => {
    expect(getMonday("2026-11-16")).toBe("2026-11-16");
  });

  it("za sredo vrne ponedeljek istega tedna", () => {
    expect(getMonday("2026-11-18")).toBe("2026-11-16");
  });

  it("za nedeljo vrne ponedeljek pred njo (teden se začne v ponedeljek)", () => {
    expect(getMonday("2026-11-22")).toBe("2026-11-16");
  });

  it("deluje čez mejo meseca in leta", () => {
    expect(getMonday("2027-01-01")).toBe("2026-12-28");
  });
});

describe("addDays", () => {
  it("prišteje dneve", () => {
    expect(addDays("2026-11-16", 6)).toBe("2026-11-22");
  });

  it("odšteje dneve pri negativni vrednosti", () => {
    expect(addDays("2026-11-16", -7)).toBe("2026-11-09");
  });

  it("upošteva prestopno leto", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("upošteva neprestopno leto", () => {
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });
});

describe("displayDate", () => {
  it("prikaže datum v slovenski obliki", () => {
    expect(displayDate("2026-11-18").replace(/\s/g, "")).toBe("18.11.2026");
  });
});
