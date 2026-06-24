import { describe, it, expect } from "vitest";
import {
  validateBalancedEntry,
  validatePeriodOpen,
  validateCashDiscount,
} from "../logic/journal.js";

describe("validateBalancedEntry", () => {
  it("accepts a balanced entry", () => {
    const result = validateBalancedEntry(
      [
        { accountId: "1000", amount: -500 },
        { accountId: "4000", amount: 500 },
      ],
      2
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects an unbalanced entry", () => {
    const result = validateBalancedEntry(
      [
        { accountId: "1000", amount: -500 },
        { accountId: "4000", amount: 499 },
      ],
      2
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("unbalanced"))).toBe(true);
  });

  it("rejects fewer than 2 lines", () => {
    const result = validateBalancedEntry(
      [{ accountId: "1000", amount: 0 }],
      2
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("at least 2 lines"))).toBe(
      true
    );
  });

  it("rejects entry with only debits", () => {
    const result = validateBalancedEntry(
      [
        { accountId: "1000", amount: -100 },
        { accountId: "2000", amount: -200 },
      ],
      2
    );
    expect(result.valid).toBe(false);
  });

  it("rejects missing account id", () => {
    const result = validateBalancedEntry(
      [
        { accountId: "", amount: -100 },
        { accountId: "4000", amount: 100 },
      ],
      2
    );
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("account is required"))).toBe(
      true
    );
  });

  it("tolerates rounding within precision", () => {
    const result = validateBalancedEntry(
      [
        { accountId: "1000", amount: -33.33 },
        { accountId: "2000", amount: -33.33 },
        { accountId: "4000", amount: 66.66 },
      ],
      2
    );
    expect(result.valid).toBe(true);
  });
});

describe("validatePeriodOpen", () => {
  it("returns true when no closedTo date", () => {
    expect(validatePeriodOpen(new Date("2024-01-15"), null)).toBe(true);
  });

  it("returns true when transdate is after closedTo", () => {
    expect(
      validatePeriodOpen(new Date("2024-02-01"), new Date("2024-01-31"))
    ).toBe(true);
  });

  it("returns false when transdate is before closedTo", () => {
    expect(
      validatePeriodOpen(new Date("2024-01-15"), new Date("2024-01-31"))
    ).toBe(false);
  });
});

describe("validateCashDiscount", () => {
  it("returns true when payment is within discount terms", () => {
    expect(
      validateCashDiscount(
        new Date("2024-01-01"),
        new Date("2024-01-10"),
        15
      )
    ).toBe(true);
  });

  it("returns false when payment is after discount terms", () => {
    expect(
      validateCashDiscount(
        new Date("2024-01-01"),
        new Date("2024-01-20"),
        15
      )
    ).toBe(false);
  });

  it("returns true on exact deadline date", () => {
    expect(
      validateCashDiscount(
        new Date("2024-01-01"),
        new Date("2024-01-16"),
        15
      )
    ).toBe(true);
  });
});
