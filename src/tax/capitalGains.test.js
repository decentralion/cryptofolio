// @flow

import moment from "moment";
import Big from "big.js";

import type {Transaction} from "../core/transaction";
import {CapitalGainsCalculator} from "./capitalGains";

describe("capital gains calculation", () => {
  const date = (y, m, d) =>
    moment().set({
      year: y,
      month: m,
      date: d,
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

  function acquireTx(date, amount, price): Transaction {
    return {
      ticker: "FOO",
      amount: Big(amount),
      date,
      price: Big(price),
      type: "TRADE",
      txSource: "test",
    };
  }

  function disposeTx(date, amount, price): Transaction {
    return {
      ticker: "FOO",
      amount: Big(amount).times(-1),
      date,
      price: Big(price),
      type: "TRADE",
      txSource: "test",
    };
  }

  describe("short-term vs long-term: precise time boundaries", () => {
    function expectTerm(acquireDate, disposeDate, gainsType) {
      const calc = new CapitalGainsCalculator("FOO");
      calc.acquire(acquireTx(acquireDate, 1, 1));
      const gains = calc.dispose(disposeTx(disposeDate, 1, 1));
      expect(gains).toHaveLength(1);
      expect(gains[0].gainsType).toEqual(gainsType);
    }
    const acquireDate = () => date(2015, 0, 0);
    const stDate = () => date(2016, 0, 0);
    const ltDate = () => date(2016, 0, 1);
    // The time of day doesn't matter, so let's try a few permutations
    function makeLate(m) {
      return m.clone().set({hour: 22, minute: 58});
    }

    it("short-term gains from a one-year hold", () => {
      expectTerm(acquireDate(), stDate(), "SHORT_TERM");
    });
    it("short-term gains from a one-year hold (late acquire)", () => {
      expectTerm(makeLate(acquireDate()), stDate(), "SHORT_TERM");
    });
    it("short-term gains from a one-year hold (late sell)", () => {
      expectTerm(acquireDate(), makeLate(stDate()), "SHORT_TERM");
    });

    it("long-term gains from a one-year and one day hold", () => {
      expectTerm(acquireDate(), ltDate(), "LONG_TERM");
    });
    it("long-term gains from a one-year and one day hold (late acquire)", () => {
      expectTerm(makeLate(acquireDate()), ltDate(), "LONG_TERM");
    });
    it("long-term gains from a one-year and one day hold (late sell)", () => {
      expectTerm(acquireDate(), makeLate(ltDate()), "LONG_TERM");
    });
  });

  it("one sale can generate a mix of short- and long- term gains", () => {
    const calc = new CapitalGainsCalculator("FOO");
    calc.acquire(acquireTx(date(2015, 1, 1), 100, 1.0));
    calc.acquire(acquireTx(date(2015, 6, 6), 50, 2.0));
    const gains = calc.dispose(disposeTx(date(2016, 2, 1), 120, 1.5));

    expect(gains).toEqual([
      {
        amount: Big(50),
        ticker: "FOO",
        acquiredDate: date(2015, 6, 6),
        disposedDate: date(2016, 2, 1),
        unitProceeds: Big(1.5),
        unitCost: Big(2.0),
        gainsType: "SHORT_TERM",
      },
      {
        amount: Big(70),
        ticker: "FOO",
        acquiredDate: date(2015, 1, 1),
        disposedDate: date(2016, 2, 1),
        unitProceeds: Big(1.5),
        unitCost: Big(1.0),
        gainsType: "LONG_TERM",
      },
    ]);
  });

  it("processes tax exempt transactions for basis calc (but not gains)", () => {
    const calc = new CapitalGainsCalculator("FOO");
    calc.acquire(acquireTx(date(2015, 1, 1), 100, 1.0));
    const gainsExemptDisposeTx: Transaction = {
      date: date(2015, 1, 2),
      price: Big(10),
      amount: Big(-100),
      type: "GIFT",
      ticker: "FOO",
      txSource: "test",
    };
    const gains = calc.dispose(gainsExemptDisposeTx);
    expect(gains).toHaveLength(0);
    expect(() => calc.dispose(disposeTx(date(2015, 1, 2), 100, 1.0))).toThrow(
      "none remained"
    );
  });
});
