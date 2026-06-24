// Tax calculation with multi-pass support and rounding-safe allocation.

import { roundAmount, roundWithDiffTracking } from "./rounding.js";

export interface TaxRateInput {
  accountId: string;
  rate: number;
  pass: number;
}

export interface TaxResult {
  accountId: string;
  taxAmount: number;
}

export interface TaxCalculation {
  netAmount: number;
  taxes: TaxResult[];
  grossAmount: number;
}

export function calculateTax(
  amount: number,
  taxRates: TaxRateInput[],
  taxIncluded: boolean,
  precision: number
): TaxCalculation {
  const sorted = [...taxRates].sort((a, b) => a.pass - b.pass);
  const taxes: TaxResult[] = [];

  if (taxIncluded) {
    const totalRate = sorted.reduce((sum, t) => sum + t.rate, 0);
    const netAmount = roundAmount(amount / (1 + totalRate), precision);
    let taxBase = netAmount;

    const passes = [...new Set(sorted.map((t) => t.pass))].sort(
      (a, b) => a - b
    );
    for (const pass of passes) {
      const passRates = sorted.filter((t) => t.pass === pass);
      for (const tr of passRates) {
        const taxAmount = roundAmount(taxBase * tr.rate, precision);
        taxes.push({ accountId: tr.accountId, taxAmount });
      }
      taxBase =
        netAmount +
        taxes
          .filter((t) =>
            sorted.find(
              (r) => r.accountId === t.accountId && r.pass <= pass
            )
          )
          .reduce((s, t) => s + t.taxAmount, 0);
    }

    return { netAmount, taxes, grossAmount: amount };
  }

  // tax exclusive
  let taxBase = amount;
  const passes = [...new Set(sorted.map((t) => t.pass))].sort(
    (a, b) => a - b
  );

  for (const pass of passes) {
    const passRates = sorted.filter((t) => t.pass === pass);
    for (const tr of passRates) {
      const taxAmount = roundAmount(taxBase * tr.rate, precision);
      taxes.push({ accountId: tr.accountId, taxAmount });
    }
    taxBase =
      amount +
      taxes
        .filter((t) =>
          sorted.find(
            (r) => r.accountId === t.accountId && r.pass <= pass
          )
        )
        .reduce((s, t) => s + t.taxAmount, 0);
  }

  const totalTax = taxes.reduce((s, t) => s + t.taxAmount, 0);
  return {
    netAmount: amount,
    taxes,
    grossAmount: roundAmount(amount + totalTax, precision),
  };
}

export interface LineAllocation {
  lineIndex: number;
  netAmount: number;
  taxAllocations: TaxResult[];
}

export function allocateTaxToLines(
  lineAmounts: number[],
  totalTax: number,
  totalAmount: number,
  taxRates: TaxRateInput[],
  precision: number
): LineAllocation[] {
  const result: LineAllocation[] = [];
  let diff = 0;

  for (let i = 0; i < lineAmounts.length; i++) {
    const proportion = totalAmount !== 0 ? lineAmounts[i] / totalAmount : 0;
    const taxAllocations: TaxResult[] = [];

    for (const tr of taxRates) {
      const exact = totalTax * tr.rate * proportion;
      const { rounded, diff: newDiff } = roundWithDiffTracking(
        exact,
        precision,
        diff
      );
      diff = newDiff;
      taxAllocations.push({ accountId: tr.accountId, taxAmount: rounded });
    }

    const lineTax = taxAllocations.reduce((s, t) => s + t.taxAmount, 0);
    result.push({
      lineIndex: i,
      netAmount: roundAmount(lineAmounts[i] - lineTax, precision),
      taxAllocations,
    });
  }

  return result;
}
