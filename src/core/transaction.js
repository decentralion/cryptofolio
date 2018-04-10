// @flow

import moment from "moment";
import Big from "big.js";

// Any time the portfolio gains or loses any asset, we record a transaction for
// that asset.
// Some events may trigger multiple transactions: for example, trading A for B
// and then paying a fee in B would generate three transactions: losing A,
// gaining B, and paying the fee
export type Transaction = {
  // The (traditionally 3-letter) ticker of the asset being traded
  ticker: string,
  // The per-unit price in USD of the asset, at the time of the transaction.
  // Having a price does not imply that any dollars actually changed hands (if
  // they did, that will be recorded in an additional transaction). For tax
  // purposes, we track the price on every occasion that we acquire or dispose
  // of property.
  price: Big,
  // The amount of this asset that the portfolio acquired or disposed
  amount: Big,
  // The date of the transaction
  date: moment,
  // The type (from transactionTypes) of the transaction
  type: $Keys<typeof transactionTypes>,
  // A string describing the data source we imported the transaction from
  txSource: string,
};

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
