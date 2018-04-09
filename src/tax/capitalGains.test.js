// @flow

import moment from "moment";
import type {GainsRecord} from "./capitalGains";
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

  describe("short-term vs long-term: precise time boundaries", () => {
    function expectTerm(acquireDate, disposeDate, gainsType) {
      const calc = new CapitalGainsCalculator("foo");
      calc.acquire(acquireDate, 1, 1);
      calc.dispose(disposeDate, 1, 1);
      expect(calc.gains[0].type).toEqual(gainsType);
    }
    const acquireDate = date(2015, 0, 0);
    const stDate = date(2016, 0, 0);
    const ltDate = date(2016, 0, 1);
    // The time of day doesn't matter, so let's try a few permutations
    function makeLate(m) {
      return m.clone().set({hour: 22, minute: 58});
    }

    it("short-term gains from a one-year hold", () => {
      expectTerm(acquireDate, stDate, "SHORT_TERM");
    });
    it("short-term gains from a one-year hold (late acquire)", () => {
      expectTerm(makeLate(acquireDate), stDate, "SHORT_TERM");
    });
    it("short-term gains from a one-year hold (late sell)", () => {
      expectTerm(acquireDate, makeLate(stDate), "SHORT_TERM");
    });

    it("long-term gains from a one-year and one day hold", () => {
      expectTerm(acquireDate, ltDate, "LONG_TERM");
    });
    it("long-term gains from a one-year and one day hold (late acquire)", () => {
      expectTerm(makeLate(acquireDate), ltDate, "LONG_TERM");
    });
    it("long-term gains from a one-year and one day hold (late sell)", () => {
      expectTerm(acquireDate, makeLate(ltDate), "LONG_TERM");
    });
  });

  it("one sale can generate a mix of short- and long- term gains", () => {
    const calc = new CapitalGainsCalculator("foo");
    calc.acquire(date(2015, 1, 1), 100, 1.0);
    calc.acquire(date(2015, 6, 6), 50, 2.0);
    calc.dispose(date(2016, 2, 1), 120, 1.5);

    expect(calc.gains).toEqual([
      {
        amount: 50,
        ticker: "foo",
        acquiredDate: date(2015, 6, 6),
        disposedDate: date(2016, 2, 1),
        price: 1.5,
        cost: 2.0,
        type: "SHORT_TERM",
      },
      {
        amount: 70,
        ticker: "foo",
        acquiredDate: date(2015, 1, 1),
        disposedDate: date(2016, 2, 1),
        price: 1.5,
        cost: 1.0,
        type: "LONG_TERM",
      },
    ]);
  });

  it("processes tax exempt transactions for basis calc (but not gains)", () => {
    const calc = new CapitalGainsCalculator("foo");
    calc.acquire(date(2015, 1, 1), 100, 1.0);
    calc.dispose(date(2015, 1, 2), 100, 1.0, true);
    expect(calc.gains).toHaveLength(0);
    expect(() => calc.dispose(date(2015, 1, 2), 100, 1.0)).toThrow(
      "none remained"
    );
  });
});
