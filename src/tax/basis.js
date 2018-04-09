// @flow

import moment from "moment";
import Big from "big.js";
import type {Transaction} from "../core/transaction";

export type BasisFrame = {
  date: moment,
  amount: Big,
  unitCost: Big,
};

/** A cost basis calculator with LIFO (Last In, First Out) semantics.
 * Any time that a currency is being disposed of (e.g. sold or gifted),
 * it reports the effective cost basis for that amount of currency, by
 * returning the appropriate BasisFrames. Note that it may return several
 * BasisFrames, e.g. if you acquired 50 at one cost, 50 at another cost, and then
 * dispose of 75, you will get 2 frames (50 from the last frame, 25 from the first one).
 */
export class LIFOCostBasisCalculator {
  frames: BasisFrame[];
  ticker: string;

  constructor(ticker: string) {
    this.frames = [];
    this.ticker = ticker;
  }

  /** Record that a cryptocurrency was acquired at a certain cost */
  acquire(tx: Transaction) {
    if (tx.ticker !== this.ticker) {
      throw new Error(`LIFOCostBasisCalculator with ticker
        ${this.ticker} tried to process transaction with ticker ${tx.ticker}`);
    }
    const frame = {amount: tx.amount, unitCost: tx.price, date: tx.date};
    this.frames.push(frame);
  }

  /** Record that a cryptocurrency was disposed of, and retrieve the associated
   * basis frames */
  dispose(tx: Transaction): BasisFrame[] {
    if (tx.ticker !== this.ticker) {
      throw new Error(
        `LIFOCostBasisCalculator with ticker` +
          `${this.ticker} tried to process transaction with ticker ${tx.ticker}`
      );
    }
    let remainToBeSold = tx.amount;
    let basisFrames = [];
    while (remainToBeSold.gt(0)) {
      if (this.frames.length === 0) {
        throw new Error(
          `Attempted to dispose ${remainToBeSold.toString()} ` +
            `${this.ticker}, but none remained`
        );
      }
      let nextFrame = this.frames[this.frames.length - 1];

      let amountSold;
      if (nextFrame.amount.gt(remainToBeSold)) {
        amountSold = remainToBeSold;
        remainToBeSold = Big(0);
        nextFrame.amount = nextFrame.amount.minus(amountSold);
      } else {
        amountSold = nextFrame.amount;
        this.frames.pop();
        remainToBeSold = remainToBeSold.minus(amountSold);
      }
      const basisFrame = {
        date: nextFrame.date,
        unitCost: nextFrame.unitCost,
        amount: amountSold,
      };
      basisFrames.push(basisFrame);
    }

    return basisFrames;
  }
}
