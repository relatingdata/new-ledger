// Foreign exchange calculations.

import { roundAmount } from "./rounding.js";

export interface FxAmountResult {
  baseAmount: number;
  fxDifference: number;
}

export function calculateFxAmount(
  foreignAmount: number,
  exchangeRate: number,
  precision: number
): FxAmountResult {
  const baseAmount = roundAmount(foreignAmount * exchangeRate, precision);
  const fxDifference = roundAmount(baseAmount - foreignAmount, precision);
  return { baseAmount, fxDifference };
}

export function calculateFxGainLoss(
  paidAmount: number,
  invoiceRate: number,
  paymentRate: number,
  precision: number
): number {
  const atInvoiceRate = roundAmount(paidAmount * invoiceRate, precision);
  const atPaymentRate = roundAmount(paidAmount * paymentRate, precision);
  const result = roundAmount((atInvoiceRate - atPaymentRate) * -1, precision);
  return result === 0 ? 0 : result;
}
