// @flow

import moment from "moment";
import Big from "big.js";
import parse from "csv-parse/lib/sync";
import {parseNumber, parseDate} from "./parse";

import type {Transaction} from "../core/transaction";
import {validate} from "../core/transaction";

const TX_SOURCE = "CAT_CSV_IMPORT";

export function parseTransactions(csvData: string) {
  const csvRows = parse(csvData);
  csvRows.shift();
  return csvRows.map((r) => {
    const tx = {
      date: parseDate(r[0]),
      ticker: r[1],
      amount: parseNumber(r[2]),
      type: r[3],
      price: parseNumber(r[4]),
      txSource: TX_SOURCE,
    };
    validate(tx);
    return tx;
  });
}

export function parseTrades(csvData: string) {
  const csvRows = parse(csvData);
  csvRows.shift();
  const transactions = [];
  csvRows.forEach((r) => {
    const date = parseDate(r[0]);
    const srcTicker = r[1];
    const srcAmount = parseNumber(r[2]);
    const srcPrice = parseNumber(r[3]);
    const dstTicker = r[4];
    const dstAmount = parseNumber(r[5]);
    const dstPrice = parseNumber(r[6]);
    const sell: Transaction = {
      ticker: srcTicker,
      price: srcPrice,
      amount: srcAmount.times(-1),
      date,
      type: "TRADE",
      txSource: TX_SOURCE,
    };
    validate(sell);
    transactions.push(sell);
    const buy: Transaction = {
      ticker: dstTicker,
      price: dstPrice,
      amount: dstAmount,
      date,
      type: "TRADE",
      txSource: TX_SOURCE,
    };
    validate(buy);
    transactions.push(buy);
  });
  return transactions;
}
