// @flow

import moment from "moment";
import Big from "big.js";
import type {BasisFrame} from "./basis";
import type {Transaction} from "../core/transaction";
import {LIFOCostBasisCalculator} from "./basis";

describe("cost basis calculation", () => {
  const dateFromYear = (x) =>
    moment().set({
      year: x,
      month: 0,
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  function acquireTx(year, amount, price): Transaction {
    return {
      ticker: "FOO",
      amount: Big(amount),
      date: dateFromYear(year),
      price: Big(price),
      type: "TRADE",
      txSource: "test",
    };
  }

  function disposeTx(amount) {
    return {
      ticker: "FOO",
      amount: Big(amount),
      date: moment(),
      price: Big(100),
      type: "TRADE",
      txSource: "test",
    };
  }
  it("works in a trivial case", () => {
    const calc = new LIFOCostBasisCalculator("FOO");
    calc.acquire(acquireTx(1990, 1, 100));
    const results = calc.dispose(disposeTx(1));
    expect(results).toEqual([
      {amount: Big(1), unitCost: Big(100), date: dateFromYear(1990)},
    ]);
  });

  it("uses LIFO semantics", () => {
    const calc = new LIFOCostBasisCalculator("FOO");
    calc.acquire(acquireTx(1990, 1, 100));
    calc.acquire(acquireTx(1991, 1, 200));
    const results = calc.dispose(disposeTx(1.5));
    expect(results).toEqual([
      {amount: Big(1), unitCost: Big(200), date: dateFromYear(1991)},
      {amount: Big(0.5), unitCost: Big(100), date: dateFromYear(1990)},
    ]);
  });

  it("throws error when disposing without acquiring", () => {
    const calc = new LIFOCostBasisCalculator("FOO");
    expect(() => calc.dispose(disposeTx(3))).toThrow("none remained");
  });

  it("works with longer sequences of dispose and acquire", () => {
    // note it tests LIFO semantics here
    const calc = new LIFOCostBasisCalculator("FOO");
    calc.acquire(acquireTx(1990, 5, 100));
    calc.acquire(acquireTx(1991, 5, 200));
    const dispose0 = calc.dispose(disposeTx(3));
    expect(dispose0).toEqual([
      {unitCost: Big(200), amount: Big(3), date: dateFromYear(1991)},
    ]);
    const dispose1 = calc.dispose(disposeTx(6));
    expect(dispose1).toEqual([
      {unitCost: Big(200), amount: Big(2), date: dateFromYear(1991)},
      {unitCost: Big(100), amount: Big(4), date: dateFromYear(1990)},
    ]);

    calc.acquire(acquireTx(1992, 2, 500));
    const dispose2 = calc.dispose(disposeTx(3));
    expect(dispose2).toEqual([
      {unitCost: Big(500), amount: Big(2), date: dateFromYear(1992)},
      {unitCost: Big(100), amount: Big(1), date: dateFromYear(1990)},
    ]);

    expect(() => calc.dispose(disposeTx(1))).toThrow("none remained");
  });
});
