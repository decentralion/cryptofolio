// @flow

import moment from "moment";
import Big from "big.js";

export type TransactionTypeInfo = {
  // Whether transactions of this type generate capital gains (when they are a disposal,
  // e.g. the sell end of a trade)
  isCapitalGains: boolean,
  // Whether transactions of this type are raw income (or loss),
  // e.g. a dividend or a fork
  isIncome: boolean,
};

export const transactionTypes = {
  FUNDING: {isCapitalGains: false, isIncome: false}, // as when I transfer $10k into Coinbase
  FORK: {isCapitalGains: false, isIncome: true}, // as with Bitcoin Cash
  FEE: {isCapitalGains: false, isIncome: true}, // eg exchange fee
  SPEND: {isCapitalGains: true, isIncome: false}, // buy real world thing w/ crypto
  DIV: {isCapitalGains: false, isIncome: true}, // dividends from proof-of-stake
  GIFT: {isCapitalGains: false, isIncome: false}, // giving away cryptos (tax exempt)
  TRADE: {isCapitalGains: true, isIncome: false}, // acquired/disposed via a trade
};

// eslint-disable-next-line no-unused-expressions
(function staticTypeCheck() {
  return (x: $Values<typeof transactionTypes>): TransactionTypeInfo => x;
});

export type Transaction = {
  ticker: string,
  price: Big,
  amount: Big,
  date: moment,
  type: $Keys<typeof transactionTypes>,
};
