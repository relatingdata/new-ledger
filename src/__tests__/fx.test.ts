import { describe, it, expect } from "vitest";
import { calculateFxAmount, calculateFxGainLoss } from "../logic/fx.js";

describe("calculateFxAmount", () => {
  it("converts foreign amount to base currency", () => {
    const result = calculateFxAmount(100, 1.25, 2);
    expect(result.baseAmount).toBe(125);
    expect(result.fxDifference).toBe(25);
  });

  it("handles rate of 1 (same currency)", () => {
    const result = calculateFxAmount(100, 1, 2);
    expect(result.baseAmount).toBe(100);
    expect(result.fxDifference).toBe(0);
  });

  it("handles fractional exchange rates", () => {
    const result = calculateFxAmount(100, 0.85, 2);
    expect(result.baseAmount).toBe(85);
    expect(result.fxDifference).toBe(-15);
  });
});

describe("calculateFxGainLoss", () => {
  it("calculates gain when payment rate is lower", () => {
    // Invoiced at 1.25, paid at 1.20 → gain
    const result = calculateFxGainLoss(100, 1.25, 1.2, 2);
    expect(result).toBe(-5);
  });

  it("calculates loss when payment rate is higher", () => {
    // Invoiced at 1.20, paid at 1.25 → loss
    const result = calculateFxGainLoss(100, 1.2, 1.25, 2);
    expect(result).toBe(5);
  });

  it("returns zero when rates are equal", () => {
    const result = calculateFxGainLoss(100, 1.25, 1.25, 2);
    expect(result).toBe(0);
  });
});
