// Precision-safe rounding with accumulated difference tracking.
// Prevents penny errors from compounding across multiple line items.

export interface RoundResult {
  rounded: number;
  diff: number;
}

export function roundAmount(amount: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(amount * factor) / factor;
}

export function roundWithDiffTracking(
  exactAmount: number,
  precision: number,
  priorDiff: number
): RoundResult {
  const adjusted = exactAmount - priorDiff;
  const rounded = roundAmount(adjusted, precision);
  const diff = rounded - adjusted;
  return { rounded, diff };
}
