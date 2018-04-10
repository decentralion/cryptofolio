// @flow

import moment from "moment";
import Big from "big.js";

import type {Transaction} from "./transaction";

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
