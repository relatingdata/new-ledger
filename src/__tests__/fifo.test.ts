import { describe, it, expect } from "vitest";
import { allocateFIFO, deallocateFIFO } from "../logic/fifo.js";

describe("allocateFIFO", () => {
  const lots = [
    { id: "lot-1", qty: 10, allocated: 0, costPerUnit: 5.0 },
    { id: "lot-2", qty: 20, allocated: 0, costPerUnit: 6.0 },
    { id: "lot-3", qty: 15, allocated: 0, costPerUnit: 7.0 },
  ];

  it("allocates from oldest lot first", () => {
    const result = allocateFIFO(lots, 5, 2);
    expect(result.allocations).toHaveLength(1);
    expect(result.allocations[0].lotId).toBe("lot-1");
    expect(result.allocations[0].qty).toBe(5);
    expect(result.allocations[0].cost).toBe(25);
    expect(result.totalCost).toBe(25);
    expect(result.unallocatedQty).toBe(0);
  });

  it("spans multiple lots when needed", () => {
    const result = allocateFIFO(lots, 25, 2);
    expect(result.allocations).toHaveLength(2);
    expect(result.allocations[0]).toEqual({
      lotId: "lot-1",
      qty: 10,
      cost: 50,
    });
    expect(result.allocations[1]).toEqual({
      lotId: "lot-2",
      qty: 15,
      cost: 90,
    });
    expect(result.totalCost).toBe(140);
    expect(result.unallocatedQty).toBe(0);
  });

  it("reports unallocated qty when lots are exhausted", () => {
    const result = allocateFIFO(lots, 50, 2);
    expect(result.allocations).toHaveLength(3);
    expect(result.totalCost).toBe(50 + 120 + 105);
    expect(result.unallocatedQty).toBe(5);
  });

  it("skips fully allocated lots", () => {
    const partialLots = [
      { id: "lot-1", qty: 10, allocated: 10, costPerUnit: 5.0 },
      { id: "lot-2", qty: 20, allocated: 5, costPerUnit: 6.0 },
    ];
    const result = allocateFIFO(partialLots, 10, 2);
    expect(result.allocations).toHaveLength(1);
    expect(result.allocations[0].lotId).toBe("lot-2");
    expect(result.allocations[0].qty).toBe(10);
  });

  it("handles zero sale qty", () => {
    const result = allocateFIFO(lots, 0, 2);
    expect(result.allocations).toHaveLength(0);
    expect(result.totalCost).toBe(0);
  });
});

describe("deallocateFIFO", () => {
  it("deallocates from most recent first", () => {
    const allocatedLots = [
      { id: "lot-1", qty: 10, allocated: 10, costPerUnit: 5.0 },
      { id: "lot-2", qty: 20, allocated: 15, costPerUnit: 6.0 },
    ];
    const result = deallocateFIFO(allocatedLots, 5, 6.0, 2);
    expect(result.allocations).toHaveLength(1);
    expect(result.allocations[0].lotId).toBe("lot-2");
    expect(result.allocations[0].qty).toBe(5);
    expect(result.totalCost).toBe(30);
  });

  it("spans multiple lots on return", () => {
    const allocatedLots = [
      { id: "lot-1", qty: 10, allocated: 10, costPerUnit: 5.0 },
      { id: "lot-2", qty: 20, allocated: 5, costPerUnit: 6.0 },
    ];
    const result = deallocateFIFO(allocatedLots, 12, 5.5, 2);
    expect(result.allocations).toHaveLength(2);
    expect(result.allocations[0].lotId).toBe("lot-2");
    expect(result.allocations[0].qty).toBe(5);
    expect(result.allocations[1].lotId).toBe("lot-1");
    expect(result.allocations[1].qty).toBe(7);
    expect(result.totalCost).toBe(27.5 + 38.5);
  });
});
