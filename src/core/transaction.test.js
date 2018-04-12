// @flow

import moment from "moment";
import Big from "big.js";

import type {Transaction} from "./transaction";
import {txSort, fromJSON} from "./transaction";

describe("transaction typechecking", () => {
  it("can construct transaction for various transaction types", () => {
    // Not intended to be exhaustive, just verifying that the element types work
    const trade: Transaction = {
      price: Big(1),
      amount: Big(2),
      ticker: "FOO",
      date: moment(),
      type: "TRADE",
      txSource: "test",
    };
    const gift: Transaction = {
      price: Big(1),
      amount: Big(2),
      ticker: "FOO",
      date: moment(),
      type: "GIFT",
      txSource: "test",
    };
    const fork: Transaction = {
      price: Big(1),
      amount: Big(2),
      ticker: "FOO",
      date: moment(),
      type: "FORK",
      txSource: "test",
    };
  });
  it("invalid transaction types produce flow errors", () => {
    const bad: Transaction = {
      price: Big(1),
      amount: Big(2),
      ticker: "FOO",
      date: moment(),
      //$ExpectError
      type: "BAD",
      txSource: "test",
    };
  });
});

describe("methods:", () => {
  it("txSort sorts by date ascending, and amount descending on collisions", () => {
    function makeTx(year, amount): Transaction {
      return {
        date: moment().set({
          year,
          month: 0,
          date: 0,
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        }),
        amount: Big(amount),
        price: Big(0),
        type: "TRADE",
        ticker: "FOO",
        txSource: "TEST",
      };
    }
    const tx0 = makeTx(2000, 1);
    const tx1 = makeTx(2001, 5);
    const tx2 = makeTx(2001, 4);
    const tx3 = makeTx(2001, -1);
    const tx4 = makeTx(2002, -10);

    const expected = [tx0, tx1, tx2, tx3, tx4];

    expect(txSort([tx1, tx2, tx3, tx4, tx0])).toEqual(expected);
    expect(txSort([tx4, tx3, tx2, tx1, tx0])).toEqual(expected);
  });
  it("fromJSON works", () => {
    const tx1: Transaction = {
      amount: Big(33),
      price: Big(102.1),
      ticker: "FOO",
      type: "FORK",
      txSource: "test",
      date: moment(),
    };

    const stringified = JSON.stringify(tx1);
    const tx2 = fromJSON(JSON.parse(JSON.stringify(tx1)));
    expect(tx2.amount.eq(tx1.amount)).toBe(true);
    expect(tx2.price.eq(tx1.price)).toBe(true);
    expect(tx2.date.isSame(tx1.date)).toBe(true);
    expect(tx2.type).toEqual(tx1.type);
    expect(tx2.ticker).toEqual(tx1.ticker);
    expect(tx2.txSource).toEqual(tx1.txSource);
  });
});
