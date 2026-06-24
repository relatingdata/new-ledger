import { describe, it, expect } from "vitest";
import { calculateTax } from "../logic/tax.js";

describe("calculateTax", () => {
  const singleRate = [{ accountId: "tax-vat", rate: 0.1, pass: 1 }];

  describe("tax exclusive", () => {
    it("calculates simple tax on net amount", () => {
      const result = calculateTax(100, singleRate, false, 2);
      expect(result.netAmount).toBe(100);
      expect(result.taxes).toHaveLength(1);
      expect(result.taxes[0].taxAmount).toBe(10);
      expect(result.grossAmount).toBe(110);
    });

    it("handles zero amount", () => {
      const result = calculateTax(0, singleRate, false, 2);
      expect(result.netAmount).toBe(0);
      expect(result.grossAmount).toBe(0);
      expect(result.taxes[0].taxAmount).toBe(0);
    });

    it("handles multiple tax rates", () => {
      const rates = [
        { accountId: "gst", rate: 0.05, pass: 1 },
        { accountId: "pst", rate: 0.08, pass: 1 },
      ];
      const result = calculateTax(100, rates, false, 2);
      expect(result.netAmount).toBe(100);
      expect(result.taxes.find((t) => t.accountId === "gst")?.taxAmount).toBe(5);
      expect(result.taxes.find((t) => t.accountId === "pst")?.taxAmount).toBe(8);
      expect(result.grossAmount).toBe(113);
    });
  });

  describe("tax inclusive", () => {
    it("extracts tax from gross amount", () => {
      const result = calculateTax(110, singleRate, true, 2);
      expect(result.netAmount).toBe(100);
      expect(result.taxes[0].taxAmount).toBe(10);
      expect(result.grossAmount).toBe(110);
    });

    it("handles odd amounts with rounding", () => {
      const result = calculateTax(99.99, singleRate, true, 2);
      expect(result.grossAmount).toBe(99.99);
      expect(result.netAmount + result.taxes[0].taxAmount).toBeCloseTo(
        99.99,
        2
      );
    });
  });

  describe("multi-pass taxes", () => {
    it("calculates pass 2 tax on base + pass 1 tax", () => {
      const rates = [
        { accountId: "gst", rate: 0.05, pass: 1 },
        { accountId: "qst", rate: 0.09975, pass: 2 },
      ];
      const result = calculateTax(100, rates, false, 2);
      expect(result.taxes.find((t) => t.accountId === "gst")?.taxAmount).toBe(5);
      // QST is on (100 + 5) = 105
      expect(
        result.taxes.find((t) => t.accountId === "qst")?.taxAmount
      ).toBe(10.47);
    });
  });
});
