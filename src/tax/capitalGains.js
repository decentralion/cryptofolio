// @flow

import moment from "moment";
import Big from "big.js";

import type {BasisFrame} from "./basis";
import {LIFOCostBasisCalculator} from "./basis";
import type {Transaction} from "../core/transaction";
import {transactionTypes} from "../core/transaction";

export type CapitalGainsRecord = {
  amount: Big,
  ticker: string,
  acquiredDate: moment,
  disposedDate: moment,
  unitCost: Big, // cost from buying the position
  unitProceeds: Big, // proceeds from selling the position
  // ergo gains_in_dollars = (unitProceeds - unitCost) * amount;
  gainsType: "SHORT_TERM" | "LONG_TERM",
};

/** For a given ticker, keep track of all of the capital gains that result from
 * buying and selling it. Currently it always uses LIFO basis calculation, but
 * it's straightforward to swap implementations. */
export class CapitalGainsCalculator {
  basisCalc: LIFOCostBasisCalculator;
  ticker: string;

  constructor(ticker: string) {
    this.basisCalc = new LIFOCostBasisCalculator(ticker);
    this.ticker = ticker;
  }

  acquire(tx: Transaction) {
    this.basisCalc.acquire(tx);
  }

  /** Dispose of some amount of crypto at a given price. If disposing in a
   * tax-exempt manner (e.g. giving a gift), then the price is irrelevant as no
   * gains will be produced, but it is still essential to call dispose so that
   * future cost basis calculations will be accurate.
   */
  dispose(tx: Transaction): CapitalGainsRecord[] {
    const frames = this.basisCalc.dispose(tx);
    if (!transactionTypes[tx.type].isCapitalGains) {
      return [];
    }
    return frames.map((f) => {
      // See test cases to verify that this logic is correct
      const isLongTerm = f.date
        .clone()
        .add(1, "years")
        .isBefore(tx.date, "day");
      const gains = {
        amount: f.amount,
        ticker: this.ticker,
        acquiredDate: f.date,
        disposedDate: tx.date,
        unitProceeds: tx.price,
        unitCost: f.unitCost,
        gainsType: isLongTerm ? "LONG_TERM" : "SHORT_TERM",
      };
      return gains;
    });
  }
}
