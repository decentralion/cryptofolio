// @flow

import moment from "moment";

export const transactionTypes = [
  "FUNDING", // as when I transfer $10k into Coinbase
  "FORK", // as with Bitcoin Cash
  "FEE", // eg exchange fee
  "SPEND", // buy real world thing w/ crypto
  "DIV", // dividends from proof-of-stake
  "GIFT", // giving away cryptos (tax exempt)
  "TRADE", // acquired/disposed via a trade
];

export type Transaction = {
  ticker: string,
  price: number,
  amount: number,
  date: moment,
  type: typeof transactionTypes,
};

export function isCapitalGains(tx: Transaction) {
  switch (tx.type) {
    case "TRADE":
    case "SPEND":
      return true;
    case "GIFT":
    case "DIV":
    case "FEE":
    case "FORK":
    case "FUNDING":
      return false;
    default:
      throw new Error(`Unexpected transaction type ${tx.type}`);
  }
}
export function isIncomeOrLoss(tx: Transaction) {
  switch (tx.type) {
    case "DIV":
    case "FEE":
    case "FORK":
      return true;
    case "TRADE":
    case "SPEND":
    case "GIFT":
    case "FUNDING":
      return false;
    default:
      throw new Error(`Unexpected transaction type ${tx.type}`);
  }
}
