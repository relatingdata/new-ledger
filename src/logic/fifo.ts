// FIFO (First In, First Out) inventory costing.

import { roundAmount } from "./rounding.js";

export interface PurchaseLot {
  id: string;
  qty: number;
  allocated: number;
  costPerUnit: number;
}

export interface FifoAllocation {
  lotId: string;
  qty: number;
  cost: number;
}

export interface FifoResult {
  allocations: FifoAllocation[];
  totalCost: number;
  unallocatedQty: number;
}

export function allocateFIFO(
  purchaseLots: PurchaseLot[],
  saleQty: number,
  precision: number
): FifoResult {
  const allocations: FifoAllocation[] = [];
  let remaining = saleQty;
  let totalCost = 0;

  // Lots should already be sorted oldest-first (by transaction id/date)
  for (const lot of purchaseLots) {
    if (remaining <= 0) break;

    const available = lot.qty - lot.allocated;
    if (available <= 0) continue;

    const qty = Math.min(available, remaining);
    const cost = roundAmount(lot.costPerUnit * qty, precision);

    allocations.push({ lotId: lot.id, qty, cost });
    totalCost = roundAmount(totalCost + cost, precision);
    remaining = roundAmount(remaining - qty, precision);
  }

  return {
    allocations,
    totalCost,
    unallocatedQty: Math.max(0, remaining),
  };
}

export function deallocateFIFO(
  allocatedLots: PurchaseLot[],
  returnQty: number,
  returnCostPerUnit: number,
  precision: number
): FifoResult {
  const allocations: FifoAllocation[] = [];
  let remaining = returnQty;
  let totalCost = 0;

  // Deallocate from most recently allocated first (reverse FIFO)
  const reversed = [...allocatedLots].reverse();

  for (const lot of reversed) {
    if (remaining <= 0) break;

    const deallocatable = lot.allocated;
    if (deallocatable <= 0) continue;

    const qty = Math.min(deallocatable, remaining);
    const cost = roundAmount(returnCostPerUnit * qty, precision);

    allocations.push({ lotId: lot.id, qty, cost });
    totalCost = roundAmount(totalCost + cost, precision);
    remaining = roundAmount(remaining - qty, precision);
  }

  return {
    allocations,
    totalCost,
    unallocatedQty: Math.max(0, remaining),
  };
}
