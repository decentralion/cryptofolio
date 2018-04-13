// @flow

import Big from "big.js";

import type {Transaction} from "../core/transaction";
import {CapitalGainsCalculator} from "./capitalGains";
import type {CapitalGainsRecord} from "./capitalGains";

export class TaxAccumulator {
  tickerToCapitalGains: {[ticker: string]: CapitalGainsCalculator};
  gains: CapitalGainsRecord[];

  constructor() {
    this.tickerToCapitalGains = {};
    this.gains = [];
  }

  getCapitalGainsCalculator(ticker: string) {
    if (this.tickerToCapitalGains[ticker] == null) {
      this.tickerToCapitalGains[ticker] = new CapitalGainsCalculator(ticker);
    }
    return this.tickerToCapitalGains[ticker];
  }

  process(tx: Transaction) {
    const calc = this.getCapitalGainsCalculator(tx.ticker);
    if (tx.amount.gt(0)) {
      calc.acquire(tx);
    } else {
      const gains = calc.dispose(tx);
      this.gains = this.gains.concat(gains);
    }
  }
}
