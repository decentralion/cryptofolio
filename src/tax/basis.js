// @flow

import moment from "moment";

export type BasisFrame = {
  date: moment,
  amount: number,
  cost: number,
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
  acquire(date: moment, amount: number, cost: number) {
    const frame = {amount, cost, date};
    this.frames.push(frame);
  }

  /** Record that a cryptocurrency was disposed of, and retrieve the associated
   * basis frames */
  dispose(amount: number): BasisFrame[] {
    let remainToBeSold = amount;
    let basisFrames = [];
    while (remainToBeSold > 0) {
      if (this.frames.length === 0) {
        throw new Error(
          `Attempted to dispose ${this.ticker}, but none remained`
        );
      }
      let nextFrame = this.frames[this.frames.length - 1];

      let amountSold;
      if (nextFrame.amount > remainToBeSold) {
        amountSold = remainToBeSold;
        remainToBeSold = 0;
        nextFrame.amount -= amountSold;
      } else {
        amountSold = nextFrame.amount;
        this.frames.pop();
        remainToBeSold -= amountSold;
      }
      const basisFrame = {
        date: nextFrame.date,
        cost: nextFrame.cost,
        amount: amountSold,
      };
      basisFrames.push(basisFrame);
    }

    return basisFrames;
  }
}
