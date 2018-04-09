// @flow

import moment from "moment";
import type {BasisFrame} from "./basis";
import {LIFOCostBasisCalculator} from "./basis";

export type CapitalGainsRecord = {
  amount: number,
  ticker: string,
  acquiredDate: moment,
  disposedDate: moment,
  cost: number, // per-coin (not aggregate)
  price: number, // per-coin (not aggregate)
  gainsType: "SHORT_TERM" | "LONG_TERM",
};

/** For a given ticker, keep track of all of the capital gains that result from
 * buying and selling it. Currently it always usees LIFO basis calculation, but
 * it's straightforward to swap implementations. */
export class CapitalGainsCalculator {
  basisCalc: LIFOCostBasisCalculator;
  ticker: string;
  gains: GainsRecord[];

  constructor(ticker: string) {
    this.basisCalc = new LIFOCostBasisCalculator(ticker);
    this.ticker = ticker;
    this.gains = [];
  }

  acquire(date: moment, amount: number, price: number) {
    this.basisCalc.acquire(date, amount, price);
  }

  /** Dispose of some amount of crypto at a given price. If disposing in a
   * tax-exempt manner (e.g. giving a gift), then the price is irrelevant as no
   * gains will be produced, but it is still essential to call dispose so that
   * future cost basis calculations will be accurate.
   */
  dispose(date: moment, amount: number, price: number, taxExempt: ?boolean) {
    const frames = this.basisCalc.dispose(amount);
    if (!taxExempt) {
      frames.forEach((f) => {
        // See test cases to verify that this logic is correct
        const isLongTerm = f.date
          .clone()
          .add(1, "years")
          .isBefore(date, "day");
        const gains = {
          amount: f.amount,
          ticker: this.ticker,
          acquiredDate: f.date,
          disposedDate: date,
          price,
          cost: f.cost,
          type: isLongTerm ? "LONG_TERM" : "SHORT_TERM",
        };
        this.gains.push(gains);
      });
    }
  }
}
