// @flow

import moment from "moment";
import type {Transaction} from "./transaction";
import {transactionTypes, isCapitalGains, isIncomeOrLoss} from "./transaction";

describe("transaction type classification", () => {
  // I don't test the outputs of isCapitalGains or isIncomeOrLoss because the
  // implementations are trivial. Instead, I just verify that they cover every
  // defined transaction type, and error on unknown tx types.
  const transactionForEachType = transactionTypes.map((t) => {
    const transaction = {
      ticker: "foo",
      price: 1,
      amount: 1,
      date: moment(),
      type: t,
    };
    return transaction;
  });
  it("isIncomeOrLoss does not error on any exported transaction type", () => {
    transactionForEachType.forEach((t) => isIncomeOrLoss(t));
  });
  it("isCapitalGains does not error on any exported transaction type", () => {
    transactionForEachType.forEach((t) => isCapitalGains(t));
  });
  const badTransaction = {
    ticker: "foo",
    price: 1,
    amount: 1,
    date: moment(),
    type: "BAD_UNRECOGNIZED",
  };
  it("isIncomeOrLoss errors on bad tx type", () => {
    expect(() => isIncomeOrLoss(badTransaction)).toThrow(
      "Unexpected transaction type"
    );
  });
  it("isCapitalGains errors on bad tx type", () => {
    expect(() => isCapitalGains(badTransaction)).toThrow(
      "Unexpected transaction type"
    );
  });
});
