import { describe, it, expect } from "vitest";
import { roundAmount, roundWithDiffTracking } from "../logic/rounding.js";

describe("roundAmount", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundAmount(10.555, 2)).toBe(10.56);
    expect(roundAmount(10.554, 2)).toBe(10.55);
    expect(roundAmount(10.5, 2)).toBe(10.5);
  });

  it("rounds to 5 decimal places", () => {
    expect(roundAmount(1.123456, 5)).toBe(1.12346);
  });

  it("handles zero", () => {
    expect(roundAmount(0, 2)).toBe(0);
  });

  it("handles negative amounts", () => {
    expect(roundAmount(-10.555, 2)).toBe(-10.55);
    expect(roundAmount(-10.556, 2)).toBe(-10.56);
  });
});

describe("roundWithDiffTracking", () => {
  it("tracks rounding difference", () => {
    const r1 = roundWithDiffTracking(33.3333, 2, 0);
    expect(r1.rounded).toBe(33.33);
    expect(r1.diff).toBeCloseTo(33.33 - 33.3333, 10);
  });

  it("compensates for prior rounding differences", () => {
    // Simulate splitting 100 into 3 equal parts
    const r1 = roundWithDiffTracking(33.3333, 2, 0);
    const r2 = roundWithDiffTracking(33.3333, 2, r1.diff);
    const r3 = roundWithDiffTracking(33.3334, 2, r2.diff);

    const total = r1.rounded + r2.rounded + r3.rounded;
    expect(roundAmount(total, 2)).toBe(100);
  });

  it("handles zero prior diff", () => {
    const result = roundWithDiffTracking(10.005, 2, 0);
    expect(result.rounded).toBe(10.01);
  });
});
