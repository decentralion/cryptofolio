// @flow

import moment from "moment";
import type {BasisFrame} from "./basis";
import {LIFOCostBasisCalculator} from "./basis";

describe("cost basis calculation", () => {
  const dayFromYear = (x) =>
    moment().set({
      year: x,
      month: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  const date0 = dayFromYear(1990);
  const date1 = dayFromYear(1991);
  const date2 = dayFromYear(1992);

  it("works in a trivial case", () => {
    const calc = new LIFOCostBasisCalculator("FOO");
    calc.acquire(date0, 1, 100);
    const results = calc.dispose(1);
    expect(results).toEqual([{amount: 1, cost: 100, date: date0}]);
  });

  it("uses LIFO semantics", () => {
    const calc = new LIFOCostBasisCalculator("FOO");
    calc.acquire(date0, 1, 100);
    calc.acquire(date1, 1, 200);
    const results = calc.dispose(1.5);
    expect(results).toEqual([
      {amount: 1, cost: 200, date: date1},
      {amount: 0.5, cost: 100, date: date0},
    ]);
  });

  it("throws error when disposing without acquiring", () => {
    const calc = new LIFOCostBasisCalculator("FOO");
    expect(() => calc.dispose(3)).toThrow("none remained");
  });

  it("works with longer sequences of dispose and acquire", () => {
    // note it tests LIFO semantics here
    const calc = new LIFOCostBasisCalculator("FOO");
    calc.acquire(date0, 5, 100);
    calc.acquire(date1, 5, 200);
    const dispose0 = calc.dispose(3);
    expect(dispose0).toEqual([{cost: 200, amount: 3, date: date1}]);
    const dispose1 = calc.dispose(6);
    expect(dispose1).toEqual([
      {cost: 200, amount: 2, date: date1},
      {cost: 100, amount: 4, date: date0},
    ]);

    calc.acquire(date2, 2, 500);
    const dispose2 = calc.dispose(3);
    expect(dispose2).toEqual([
      {cost: 500, amount: 2, date: date2},
      {cost: 100, amount: 1, date: date0},
    ]);

    expect(() => calc.dispose(1)).toThrow("none remained");
  });
});
