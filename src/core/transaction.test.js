// @flow

import moment from "moment";
import Big from "big.js";

import type {Transaction} from "./transaction";
import {txSort} from "./transaction";

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
  //  it("invalid transaction types produce flow errors", () => {
  //    // if uncommented, this test produces a flow error
  //    const bad: Transaction = {
  //      price: Big(1),
  //      amount: Big(2),
  //      ticker: "FOO",
  //      date: moment(),
  //      type: "BAD",
  //      txSource: "test",
  //    };
  //  });
});

describe("txSort", () => {
  it("sorts by date ascending, and amount descending on collisions", () => {
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
});
